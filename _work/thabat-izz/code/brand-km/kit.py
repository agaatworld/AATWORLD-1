# Kalima Muqawama (الكلمة مقاومة) brand exploration toolkit
# - palettes for the three directions
# - logo layer masks (from the ORIGINAL raster; nothing is redrawn)
# - colour re-mapping of the logo frame (photo circle untouched)
# - procedural grunge grounds, metal fills, 3D extrusion
import sys, os, numpy as np, cv2
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/mg')
ARGV = list(sys.argv); sys.argv = sys.argv[:1] + ['none']
import mg
from mg import C, text, fitw, ease, eio, seg, bump, back, font, to_f, round_mask
from scipy.interpolate import RBFInterpolator

B = os.path.dirname(os.path.abspath(__file__)) + '/'
LOGO = cv2.imread(B + 'logo.png').astype(np.float32)          # 2048 x 2048, BGR
LS = LOGO.shape[0]
PC = (1011.3, 1013.4)       # photo disc centre (fitted)
OC = (1008.0, 1026.9)       # outer circles centre (fitted)
R_PHOTO, R_BORDER, R_SLATE = 430.0, 489.0, 643.0
R_IN, R_OUT = 664.4, 966.4  # thin gold circles

def hx(c): return '#%02X%02X%02X' % (int(c[2]), int(c[1]), int(c[0]))

# ---------------------------------------------------------------- palettes (BGR float) — name: (hex, role)
DIRS = {
 'A': dict(name='Midnight Atlas', ar='أطلس منتصف الليل', sw=[
        ('Midnight Navy', '101A2A', 'الخلفية الأساسية'), ('Atlas Slate', '263C53', 'الأسطح والطبقات'),
        ('Steel Blue', '536D86', 'الخطوط الثانوية والحلقة'), ('Antique Gold', 'DDA653', 'التوقيع: كلمة مهمة، خط ذهبي'),
        ('Parchment', 'E9E1D4', 'النص الأساسي'), ('Ember', 'B85F46', 'التمييز العاطفي (قليلاً)')],
        grads=[('Midnight Depth', ['0B1422', '1A2D43', '526A82']), ('Forged Gold', ['825126', 'C88D43', 'F4D28A', 'A96F31', 'E8B86A']),
               ('Steel Horizon', ['253A51', '536F8B', 'A7B4C0']), ('Ember Reveal', ['8A4939', 'B85F46', 'D99061'])],
        fonts=('naskh', 'almarai', 'readex')),
 'B': dict(name='Imperial Archive', ar='الأرشيف الإمبراطوري', sw=[
        ('Black Navy', '080D18', 'الخلفية الأساسية'), ('Royal Blue', '1E3A6E', 'الأسطح والحلقة'),
        ('Silver Stone', 'A3A9AF', 'الخطوط الثانوية والبيانات'), ('Aged Bronze', 'A8844F', 'التوقيع: كلمة مهمة، خط'),
        ('Archive Parchment', 'EDE3CC', 'النص الأساسي'), ('Seal Wax', '8E3B2F', 'التمييز العاطفي (مشتق)')],
        grads=[('Archive Depth', ['04070E', '0E1A33', '1E3A6E']), ('Aged Bronze', ['5A4024', '9A7646', 'D9BF8C', '84633A', 'C4A06A']),
               ('Silver Stone', ['3A4048', '7D858D', 'C9CDD1']), ('Seal Reveal', ['5E241C', '8E3B2F', 'B5634C'])],
        fonts=('naskh', 'almarai', 'amiri')),
 'C': dict(name='Olive & Bronze', ar='الزيتون والبرونز', sw=[
        ('Black Olive', '13160F', 'الخلفية الأساسية'), ('Forest Charcoal', '272C23', 'الأسطح والطبقات'),
        ('Muted Olive', '6B6F4A', 'الحلقة والخطوط الثانوية'), ('Ancient Bronze', 'A97A3C', 'التوقيع: كلمة مهمة، خط'),
        ('Sandstone', 'DCCBA6', 'النص الأساسي'), ('Rust', '9A4F2E', 'التمييز العاطفي (مشتق)')],
        grads=[('Olive Night', ['0D0F0A', '20251B', '4A4E33']), ('Ancient Bronze', ['6A4520', 'A97A3C', 'E3C48A', '8E6230', 'CFA463']),
               ('Sandstone Haze', ['6B6F4A', 'A79F7C', 'DCCBA6']), ('Rust Reveal', ['6A2F1C', '9A4F2E', 'C9784E'])],
        fonts=('naskh', 'almarai', 'kufi_n')),
}
for k, d in DIRS.items():
    s = [C(h) for _, h, _ in d['sw']]
    d.update(bg=s[0], mid=s[1], steel=s[2], gold=s[3], text=s[4], ember=s[5])
    d['metal'] = [C(h) for h in d['grads'][1][1]]
    d['depth'] = [C(h) for h in d['grads'][0][1]]

mg.FONTS['readex'] = mg.FD + 'c_ReadexPro[HEXP,wght].ttf'
mg.FONTS['kufi_n'] = mg.FD + 'c_NotoKufiArabic[wght].ttf'
mg.FONTS['plex'] = mg.FD + 'c_IBMPlexSansArabic-Bold.ttf'
mg.FONTS['amiri_r'] = mg.FD + 'Amiri-Regular.ttf'

def grad(stops, n):
    stops = np.array(stops, np.float32); xs = np.linspace(0, 1, len(stops)); t = np.linspace(0, 1, n)
    return np.stack([np.interp(t, xs, stops[:, i]) for i in range(3)], 1)

# ---------------------------------------------------------------- logo masks (soft, from the original pixels)
_hsv = cv2.cvtColor(LOGO.astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
HUE, SAT, VAL = _hsv[..., 0] * 2, _hsv[..., 1] / 255, _hsv[..., 2] / 255
_ly, _lx = np.mgrid[0:LS, 0:LS].astype(np.float32)
RP = np.hypot(_lx - PC[0], _ly - PC[1])
def sm(x, a, b): return np.clip((x - a) / (b - a), 0, 1)
M_PHOTO = 1 - sm(RP, R_BORDER - 1.5, R_BORDER + 1.5)                 # photo + its gold border
M_DISC = 1 - sm(RP, R_PHOTO - 1, R_PHOTO + 1)                         # photo only
M_SLATE = sm(RP, R_BORDER - 1, R_BORDER + 1) * (1 - sm(RP, R_SLATE - 2, R_SLATE + 2))
_g = sm(np.minimum(np.abs(HUE - 35), 40), 0, 1)
M_GOLD = (1 - sm(np.abs(HUE - 34), 10, 18)) * sm(SAT, 0.22, 0.40) * sm(VAL, 0.30, 0.55) * (1 - M_PHOTO)
M_TEXT = (1 - sm(SAT, 0.16, 0.30)) * sm(VAL, 0.45, 0.62) * (1 - M_PHOTO)
M_TEXT = M_TEXT * (cv2.dilate((M_TEXT > 0.5).astype(np.uint8), np.ones((5, 5), np.uint8), iterations=2) > 0)
# keep only big text components (drop stray light specks)
_n, _lab, _st, _ = cv2.connectedComponentsWithStats((M_TEXT > 0.5).astype(np.uint8), 8)
_keep = np.zeros(_n, bool); _keep[1:] = _st[1:, cv2.CC_STAT_AREA] > 400
M_TEXT = M_TEXT * cv2.dilate(_keep[_lab].astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32)

# ---------------------------------------------------------------- colour re-mapping (RBF LUT over RGB, frame only)
def _samples():
    """source anchor colours from the original logo (BGR)"""
    def q(mask, p): v = LOGO[mask > 0.9]; L = v.mean(1); return v[np.argsort(L)[int(len(v) * p / 100)]]
    bgm = (M_GOLD < 0.05) & (M_TEXT < 0.05) & (M_PHOTO < 0.01) & (M_SLATE < 0.01)
    slm = (M_SLATE > 0.99) & (M_TEXT < 0.05) & (M_GOLD < 0.05)
    return dict(bg=[q(bgm, p) for p in (2, 30, 70, 98)], slate=[q(slm, p) for p in (2, 30, 70, 98)],
                gold=[q(M_GOLD, p) for p in (5, 40, 80, 99)], text=[q(M_TEXT, p) for p in (5, 50, 95)])
SRC = _samples()

def _targets(d, mode):
    bg, mid, st, gd, tx, em = d['bg'], d['mid'], d['steel'], d['gold'], d['text'], d['ember']
    dk = lambda c, k: c * k
    lt = lambda c, k: c + (255 - c) * k
    if mode == 'dark':   # deeper ground, same accents
        bg = dk(bg, 0.72); mid = dk(mid, 0.8)
    if mode == 'light':
        T = dict(bg=[dk(tx, 0.86), dk(tx, 0.95), tx, lt(tx, 0.35)],
                 slate=[dk(st, 0.95), st, lt(st, 0.25), lt(st, 0.45)],
                 gold=[dk(gd, 0.45), dk(gd, 0.62), dk(gd, 0.78), dk(gd, 0.9)],
                 text=[dk(d['bg'], 0.8), d['bg'], lt(d['bg'], 0.12)])
        return T
    metal = d['metal']
    if d['name'] == 'Imperial Archive':   # keep the ground black-navy, the ring royal blue
        return dict(bg=[dk(bg, 0.5), bg, bg + (mid - bg) * 0.22, bg + (mid - bg) * 0.45],
                    slate=[dk(mid, 0.7), mid, mid + (st - mid) * 0.22, mid + (st - mid) * 0.45],
                    gold=[dk(metal[0], 0.9), metal[1], gd, lt(gd, 0.35)],
                    text=[dk(tx, 0.74), dk(tx, 0.92), lt(tx, 0.3)])
    return dict(bg=[dk(bg, 0.55), bg, bg + (mid - bg) * 0.45, mid],
                slate=[dk(mid, 0.9), mid + (st - mid) * 0.35, st, lt(st, 0.22)],
                gold=[dk(metal[0], 0.9), metal[1], gd, lt(gd, 0.35)],
                text=[dk(tx, 0.74), dk(tx, 0.92), lt(tx, 0.3)])

def recolor(d, mode='refined', keep_photo=True, img=None):
    """returns BGR float logo with the frame recoloured; the photo disc is copied untouched"""
    T = _targets(d, mode); src, dst = [], []
    for k in ('bg', 'slate', 'gold', 'text'):
        src += list(SRC[k]); dst += list(T[k])
    src += [np.zeros(3), np.full(3, 255.0)]
    dst += [np.zeros(3) if mode != 'light' else d['text'] * 0.7, np.full(3, 255.0) if mode != 'light' else d['bg'] * 0.5]
    src, dst = np.array(src, np.float64), np.array(dst, np.float64)
    # class-aware mapping: RBF per class gives clean separation of navy vs slate (similar hues)
    out = np.zeros_like(LOGO)
    def rbf(keys, extra=()):
        s = np.array(sum([list(SRC[k]) for k in keys], []) + [e[0] for e in extra], np.float64)
        t = np.array(sum([list(T[k]) for k in keys], []) + [e[1] for e in extra], np.float64)
        return RBFInterpolator(s, t - s, kernel='linear', smoothing=1.0, degree=1)
    g = np.linspace(0, 255, 33); G = np.stack(np.meshgrid(g, g, g, indexing='ij'), -1).reshape(-1, 3)
    def lut_apply(f):
        L = (G + f(G)).reshape(33, 33, 33, 3).astype(np.float32)
        idx = LOGO / 255 * 32; i0 = np.clip(np.floor(idx).astype(int), 0, 31); fr = idx - i0
        res = 0
        for dx in (0, 1):
            for dy in (0, 1):
                for dz in (0, 1):
                    w = (fr[..., 0] if dx else 1 - fr[..., 0]) * (fr[..., 1] if dy else 1 - fr[..., 1]) * (fr[..., 2] if dz else 1 - fr[..., 2])
                    res = res + L[i0[..., 0] + dx, i0[..., 1] + dy, i0[..., 2] + dz] * w[..., None]
        return res
    zero, white = (np.zeros(3), dst[-2]), (np.full(3, 255.0), dst[-1])
    f_ground = lut_apply(rbf(('bg', 'gold', 'text'), (zero, white)))
    f_slate = lut_apply(rbf(('slate', 'gold', 'text'), (zero, white, (SRC['bg'][0], T['slate'][0] * 0.8))))
    out = f_ground * (1 - M_SLATE[..., None]) + f_slate * M_SLATE[..., None]
    if keep_photo: out = out * (1 - M_DISC[..., None]) + LOGO * M_DISC[..., None]
    # photo border ring is gold: recolour it with the ground map (it is gold-coloured)
    return np.clip(out, 0, 255)

def mono(ink, paper, img=None):
    """one-colour version: luminance → paper..ink duotone (photo included)"""
    L = cv2.cvtColor(np.clip(LOGO if img is None else img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    L = np.clip((L - 0.08) / 0.8, 0, 1) ** 0.9
    return paper + (ink - paper) * L[..., None]

def circle_crop(img, r, cx=None, cy=None, out=1080, bg=None):
    cx = OC[0] if cx is None else cx; cy = OC[1] if cy is None else cy
    x0, y0 = int(cx - r), int(cy - r); s = 2 * int(r)
    crop = img[max(0, y0):y0 + s, max(0, x0):x0 + s]
    crop = cv2.resize(crop, (out, out), interpolation=cv2.INTER_AREA)
    m = round_mask(out, out, out // 2)
    return crop, m

# ---------------------------------------------------------------- grounds
def grunge(h, w, d, seed=1, light=False, base=None, tone=None):
    r = np.random.default_rng(seed)
    def noise(s, sig):
        n = r.standard_normal((h // s + 2, w // s + 2)).astype(np.float32)
        n = cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC)
        return cv2.GaussianBlur(n, (0, 0), sig) if sig else n
    blot = noise(40, 30); blot /= blot.std() + 1e-6
    midn = noise(6, 2); midn /= midn.std() + 1e-6
    fine = r.standard_normal((h, w)).astype(np.float32)
    k = np.clip(0.5 + 0.18 * blot + 0.10 * midn + 0.06 * fine, 0, 1)[..., None]
    a = d['depth'][0] if base is None else base; b = d['mid'] if tone is None else tone
    if light: a, b = d['text'] * 0.93, d['text']
    c = a + (b - a) * k * 0.55
    sp = (r.random((h, w)) > 0.9985).astype(np.float32); sp = cv2.GaussianBlur(cv2.dilate(sp, np.ones((2, 2))), (0, 0), 0.8)
    c = c * (1 - 0.35 * sp[..., None])
    return c.astype(np.float32)

def vignette(c, k=0.35, cx=None, cy=None):
    h, w = c.shape[:2]; y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    cx = w / 2 if cx is None else cx; cy = h / 2 if cy is None else cy
    v = np.clip(np.hypot((x - cx) / (w * 0.75), (y - cy) / (h * 0.75)), 0, 1.3)
    return c * (1 - k * v[..., None] ** 2)

# ---------------------------------------------------------------- compositing helpers on arbitrary canvases
def paste(c, rgba, cx, cy, s=1.0, a=1.0, rot=0.0):
    """like mg.put but for any canvas size"""
    oW, oH = mg.W, mg.H
    mg.W, mg.H = c.shape[1], c.shape[0]
    try: c = mg.put(c, rgba, cx, cy, s, a, rot=rot)
    finally: mg.W, mg.H = oW, oH
    return c

def rgba_from(img, mask): return np.dstack([img.astype(np.float32), mask.astype(np.float32)])

def shadow(c, mask_rgba, cx, cy, s, dx=12, dy=22, blur=16, k=0.55, col=None):
    a = mask_rgba[..., 3]; sh = cv2.GaussianBlur(a, (0, 0), blur) * k
    img = np.broadcast_to(np.zeros(3) if col is None else col, a.shape + (3,)).astype(np.float32)
    return paste(c, np.dstack([img, sh]), cx + dx, cy + dy, s)

def metal_fill(alpha, stops, angle=90, sheen=0.0, sheen_w=0.12):
    """fill an alpha shape with a multi-stop metallic gradient (vertical by default) + optional moving sheen"""
    h, w = alpha.shape; y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    th = np.deg2rad(angle); u = (x * np.cos(th) + y * np.sin(th)); u = (u - u.min()) / (u.max() - u.min() + 1e-6)
    G = grad(stops, 256); img = G[np.clip((u * 255).astype(int), 0, 255)]
    if sheen > 0:
        v = (x + y * 0.6) / (w + h * 0.6); sh = np.exp(-((v - sheen) / sheen_w) ** 2)[..., None]
        img = img + (255 - img) * sh * 0.55
    return np.dstack([img, alpha]).astype(np.float32)

def bevel(alpha, depth=6, light=(-1, -1.4), k=0.5):
    """emboss-style lighting from the alpha shape: returns shade in -1..1"""
    a = cv2.GaussianBlur(alpha, (0, 0), depth * 0.6)
    gx = cv2.Sobel(a, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(a, cv2.CV_32F, 0, 1, ksize=3)
    L = np.array(light, np.float32); L /= np.linalg.norm(L)
    return np.clip(-(gx * L[0] + gy * L[1]) * k * 4, -1, 1)

def extrude(face_rgba, depth=40, dir=(0.55, 1.0), side_top=None, side_bot=None, step=1):
    """3D extrusion: stack shifted copies with a side colour ramp, face on top. returns RGBA with padding"""
    h, w = face_rgba.shape[:2]; pad = depth + 8
    out = np.zeros((h + 2 * pad, w + 2 * pad, 4), np.float32)
    dx, dy = dir; n = np.hypot(dx, dy); dx, dy = dx / n, dy / n
    a = face_rgba[..., 3]
    for i in range(depth, 0, -step):
        k = i / depth
        col = side_top + (side_bot - side_top) * k
        ox, oy = int(round(pad + dx * i)), int(round(pad + dy * i))
        reg = out[oy:oy + h, ox:ox + w]
        shade = 1.0 - 0.25 * k
        reg[..., :3] = reg[..., :3] * (1 - a[..., None]) + (col * shade) * a[..., None]
        reg[..., 3] = np.maximum(reg[..., 3], a)
    reg = out[pad:pad + h, pad:pad + w]; fa = a[..., None]
    reg[..., :3] = reg[..., :3] * (1 - fa) + face_rgba[..., :3] * fa; reg[..., 3] = np.maximum(reg[..., 3], a)
    return out

def save(img, path, q=93):
    if os.path.dirname(path): os.makedirs(os.path.dirname(path), exist_ok=True)
    img = np.clip(img, 0, 255).astype(np.uint8)
    if path.endswith('.png'): cv2.imwrite(path, img)
    else: cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, q])
