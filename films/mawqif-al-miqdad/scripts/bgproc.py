"""Background finishing: resize to 1080x1920, paint out baked-in moons (one consistent moon is
composited at runtime), unified night grade, sky/land split for multiplane parallax."""
import numpy as np, cv2, os, json
from PIL import Image

RAW = '/home/user/miqdad_film/art/bg/raw'
OUT = '/home/user/miqdad_film/art/bg'
W, H = 1080, 1920

BGS = {
    'bg01': dict(src='bg01_s1101.webp', grade='night', exposure=0.80, moon=True),
    'bg02': dict(src='bg02_s3302.webp', grade='night', exposure=0.74, moon=True),
    'bg03': dict(src='bg03_s4410.webp', grade='night', exposure=0.74, moon=False),
    'bg04': dict(src='bg04_s5504.webp', grade='night', exposure=0.72, moon=True),
    'bg05': dict(src='bg05_s1101_predawn.webp', grade='dawn', exposure=1.0, moon=False),
}

def load(fn):
    im = Image.open(os.path.join(RAW, fn)).convert('RGB').resize((W, H), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0

MOONS = []
def remove_moon(img):
    top = img[: int(H * 0.45)]
    lum = top.mean(axis=2)
    m = (lum > 0.45).astype(np.uint8)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(m)
    mask = np.zeros(img.shape[:2], np.uint8)
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        if a > 300 and w < 260 and h < 260 and (y + h // 2) < H * 0.3:
            cx, cy = x + w // 2, y + h // 2
            cv2.circle(mask, (cx, cy), int(max(w, h) * 1.6), 255, -1)
            MOONS.append((int(cx), int(cy), int(max(w, h))))
    if mask.any():
        u8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
        # glow is wide: inpaint big area, then add matched sky grain
        inp = cv2.inpaint(u8, mask, 25, cv2.INPAINT_TELEA).astype(np.float32) / 255
        blur = cv2.GaussianBlur(inp, (0, 0), 18)
        soft = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 14)[..., None]
        rng = np.random.default_rng(3)
        grain = (rng.standard_normal(img.shape[:2]) * 0.006)[..., None]
        filled = blur + grain
        img = img * (1 - soft) + filled * soft
    return img, mask

def sky_mask(img):
    """Column scan from the top: sky = blue-dominant AND smooth. Stops at the first rock pixel."""
    sm = cv2.GaussianBlur(img, (0, 0), 1.5)
    r, g, b = sm[..., 0], sm[..., 1], sm[..., 2]
    lum = sm.mean(axis=2)
    mu = cv2.blur(lum, (7, 7)); mu2 = cv2.blur(lum * lum, (7, 7))
    std = np.sqrt(np.clip(mu2 - mu * mu, 0, None))
    skyish = ((b - np.maximum(r, g)) > 0.035) & (std < 0.03)
    skyish = cv2.morphologyEx(skyish.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0
    h, w = skyish.shape
    bottom = np.zeros(w, np.int32)
    for x in range(w):
        col = skyish[:, x]
        nz = np.where(~col)[0]
        bottom[x] = nz[0] if len(nz) else h
    # robust smoothing of the skyline (median then light blur), never below image middle-ish outliers
    from scipy.ndimage import median_filter
    from scipy.ndimage import minimum_filter1d
    bottom = minimum_filter1d(bottom, size=41)
    bottom = median_filter(bottom, size=15).astype(np.float32)
    bottom = cv2.GaussianBlur(bottom[None, :], (0, 0), 1.5)[0]
    yy = np.arange(h)[:, None]
    m = (yy < bottom[None, :] - 2).astype(np.float32)
    return cv2.GaussianBlur(m, (0, 0), 1.0)

def grade_night(img, exposure):
    lum = img @ np.array([0.3, 0.59, 0.11], np.float32)
    g = np.power(np.clip(img, 0, 1), 1.12) * exposure
    # cool the shadows and mids, keep a little warmth in highlights (painted rock colour)
    tint = np.array([0.80, 0.90, 1.10], np.float32)
    k = np.clip(1.0 - lum * 1.2, 0, 1)[..., None]
    g = g * (tint * k + (1 - k) * np.array([0.95, 0.97, 1.02], np.float32))
    # gentle vertical falloff: darker foreground bottom, haze lift at the horizon band
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    g = g * (1.0 - 0.22 * np.clip((yy - 0.6) / 0.4, 0, 1))
    return np.clip(g, 0, 1)

def grade_dawn(img):
    g = np.power(np.clip(img, 0, 1), 1.04) * 0.95
    return np.clip(g * np.array([0.98, 0.98, 1.02], np.float32), 0, 1)

def extend_sky(img, mask):
    """Fill the land area of the sky plate by smearing the sky downward (for parallax reveal)."""
    u8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
    hole = (mask < 0.5).astype(np.uint8) * 255
    small = cv2.resize(u8, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    hs = cv2.resize(hole, (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)
    inp = cv2.inpaint(small, hs, 15, cv2.INPAINT_TELEA)
    inp = cv2.GaussianBlur(cv2.resize(inp, (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 6)
    m = mask[..., None]
    return (u8 * m + inp * (1 - m)).astype(np.uint8)

def main():
    meta = {}
    for name, cfg in BGS.items():
        img = load(cfg['src'])
        moon_mask = None
        MOONS.clear()
        if cfg['moon']:
            img, moon_mask = remove_moon(img)
        img = grade_night(img, cfg['exposure']) if cfg['grade'] == 'night' else grade_dawn(img)
        sm = sky_mask(img)
        full = (np.clip(img, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(full).save(f'{OUT}/{name}_full.webp', 'WEBP', quality=88, method=6)
        sky = extend_sky(img, sm)
        Image.fromarray(sky).save(f'{OUT}/{name}_sky.webp', 'WEBP', quality=80, method=6)
        land = np.dstack([full, (np.clip(1 - sm, 0, 1) * 255).astype(np.uint8)])
        Image.fromarray(land, 'RGBA').save(f'{OUT}/{name}_land.webp', 'WEBP', quality=88, method=6)
        rows = np.where(sm.max(axis=1) > 0.5)[0]
        horizon = int(rows.max()) if len(rows) else 0
        meta[name] = dict(sky_bottom=horizon, sky_frac=float(sm.mean()), moons=list(MOONS))
        print(name, meta[name], flush=True)
    json.dump(meta, open(f'{OUT}/bg_meta.json', 'w'), indent=1)

if __name__ == '__main__':
    main()
