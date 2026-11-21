# «الثبات عز» — cinematic tribute: the funeral procession of الشهيد رائد الكحلاني, Taiz.
# One continuous timeline at the source's own clock (sound is the source with the music removed: chants + narration).
# Digital camera (keyframed zoom / pan / tilt with easing), documentary grade, meaning-driven Arabic typography,
# the real photograph revealed three different ways, quiet brand accents.
# usage: python3 film.py render <part> <parts> | still t... | finish <parts>
import numpy as np, cv2, json, subprocess, sys, os, soundfile as sf
from PIL import Image, ImageDraw, ImageFont
from scipy.signal import butter, sosfilt, resample_poly
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
WK = S_ + 'fb6/work/'; TH = S_ + 'taiz/fonts/th/'; K = '/home/user/final/brand-kit/'; KA = '/home/user/final/kahlani/assets/'
OUTD = '/home/user/final/procession-film/'; SFXD = [S_ + 'sfx/s', S_ + 'sfx2/m', S_ + 'sfx3/m']
SRC = WK + 'all.mp4'; SW, SH = 406, 720; W, H, FPS = 1080, 1920, 30
DUR = 382.4
NAVY = np.array([45, 27, 15], np.float32); STEEL = np.array([104, 74, 46], np.float32); AMBER = np.array([65, 165, 242], np.float32)
WHITE = np.array([216, 233, 244], np.float32); ORANGE = np.array([61, 138, 255], np.float32); BLACK = np.array([10, 12, 16], np.float32)
MODE = sys.argv[1]
rng = np.random.default_rng(5); yy, xx = np.mgrid[:H, :W].astype(np.float32)
SAFE_T, SAFE_B = 270, 1500

def ease(x): x = float(np.clip(x, 0, 1)); return 1 - (1 - x) ** 3
def eio(x): x = float(np.clip(x, 0, 1)); return x * x * (3 - 2 * x)
def eio2(x): x = float(np.clip(x, 0, 1)); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def seg(t, a, b): return float(np.clip((t - a) / max(1e-6, b - a), 0, 1))
def lerp(a, b, k): return a + (b - a) * k

# ================================================================ CAMERA — (time, zoom, cx, cy) in source pixels; eased between keys
# zoom 1 = the full source frame fills 1080x1920. Each shot has its own move; a cut resets the camera.
CAM = [
    # shot A (0–44.3): from darkness, a slow descent onto the street, then a push to the coffin under the flag
    [(0.0, 1.32, 203, 300), (7.0, 1.18, 203, 330), (18.0, 1.04, 203, 360), (23.5, 1.06, 200, 380), (28.5, 1.40, 150, 560),
     (31.0, 1.42, 120, 600), (36.0, 1.10, 190, 420), (44.29, 1.00, 203, 360)],
    # shot B (44.3–74.5): the mountains and the river of people — a slow reveal from the street up to the sky
    [(44.30, 1.30, 230, 470), (58.0, 1.02, 210, 380), (74.45, 1.00, 203, 360)],
    # shot C (74.5–134): close on the crowd, a patient sideways drift
    [(74.46, 1.18, 260, 400), (100.0, 1.20, 160, 420), (120.0, 1.08, 210, 380), (134.03, 1.00, 203, 360)],
    # shot D (134–205): the widest view — let it breathe; a long, very slow push into the depth of the street
    [(134.04, 1.00, 203, 360), (170.0, 1.16, 210, 300), (205.0, 1.24, 205, 290)],
    # shot E (205–209.9): inside the crowd — held, barely moving
    [(205.02, 1.06, 203, 360), (209.88, 1.10, 203, 360)],
    # shot F (209.9–353): the long march — wide, then searching, then a slow pull back to the full scale
    [(209.89, 1.28, 200, 420), (240.0, 1.06, 203, 370), (262.0, 1.22, 150, 330), (290.0, 1.18, 260, 330),
     (318.0, 1.30, 203, 300), (353.1, 1.00, 203, 360)],
    # shot G (353.1–366.8): the cemetery — a held wide
    [(353.12, 1.00, 203, 360), (366.78, 1.08, 203, 360)],
    # shot H (366.8–end): the last view — a slow rise into the light
    [(366.79, 1.14, 203, 420), (DUR, 1.02, 203, 340)],
]
CUTS = [44.29, 74.46, 134.04, 205.02, 209.89, 353.12, 366.79]
def camera(t):
    for keys in CAM:
        if keys[0][0] <= t <= keys[-1][0] + 1e-3 or (keys is CAM[-1] and t > keys[-1][0]):
            for (t0, z0, x0, y0), (t1, z1, x1, y1) in zip(keys, keys[1:]):
                if t0 <= t <= t1:
                    k = eio2(seg(t, t0, t1)); return lerp(z0, z1, k), lerp(x0, x1, k), lerp(y0, y1, k)
            return keys[-1][1:]
    return 1.0, 203, 360
def warp(f, z, cx, cy):
    s = W / SW * z; hw, hh = SW / (2 * z), SH / (2 * z)
    cx = float(np.clip(cx, hw, SW - hw)); cy = float(np.clip(cy, hh, SH - hh))
    M = np.float32([[s, 0, W / 2 - cx * s], [0, s, H / 2 - cy * s]])
    return cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

# ================================================================ GRADE — documentary: deeper shadows leaning navy, warm highlights, natural colour
def build_lut():
    x = np.arange(256, dtype=np.float32) / 255
    s = x + 0.10 * np.sin(np.pi * (x - 0.5)) * (1 - np.abs(2 * x - 1)) ** 0.5 * np.sign(x - 0.5) * 0     # neutral base
    s = np.clip((x - 0.03) / 0.95, 0, 1); s = s * s * (3 - 2 * s) * 0.38 + s * 0.62                     # gentle S
    sh = (1 - s) ** 2.2; hi = s ** 2.5
    b = s * 255 * (1 - 0.10 * sh) + 45 * 0.10 * sh + (216 - s * 255) * 0.05 * hi
    g = s * 255 * (1 - 0.10 * sh) + 27 * 0.10 * sh + (233 - s * 255) * 0.05 * hi
    r = s * 255 * (1 - 0.10 * sh) + 15 * 0.10 * sh + (244 - s * 255) * 0.07 * hi
    return np.stack([b, g, r], -1).clip(0, 255).astype(np.uint8)[:, None, :]
LUT = build_lut()
VIG = (1 - 0.42 * np.clip(np.hypot((xx - W / 2) / (W * 0.62), (yy - H * 0.48) / (H * 0.58)) - 0.42, 0, 1) ** 1.3)[..., None].astype(np.float32)
GRAIN = [cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.8)[..., None] * 3.2 for _ in range(6)]
TOPF = (np.clip(1 - yy / 760, 0, 1) ** 1.6)[..., None]; BOTF = (np.clip((yy - 1080) / 840, 0, 1) ** 1.4)[..., None]
CENF = (np.clip(1 - np.abs(yy - 960) / 520, 0, 1) ** 1.2)[..., None]
CAPF = (np.clip(1 - np.abs(yy - 1395) / 230, 0, 1) ** 1.1)[..., None]
PHF = (np.clip((yy - 1000) / 560, 0, 1) ** 1.1)[..., None]
def picture(f, t):
    z, cx, cy = camera(t)
    v = warp(cv2.LUT(f, LUT), z, cx, cy).astype(np.float32)
    bl = cv2.GaussianBlur(v, (0, 0), 2.2); v = v + (v - bl) * 0.35                                       # restore a little crispness after upscaling
    return v

# ================================================================ TEXT
def F(n, s): return ImageFont.truetype(TH + n, s, layout_engine=ImageFont.Layout.RAQM)
def to_f(im):
    a = np.array(im).astype(np.float32); a[..., :3] = a[..., :3][..., ::-1].copy(); a[..., 3] /= 255; return a
def text_img(runs, font, size, stroke=0, spacing=0):
    """runs: [(text, colour)] right-to-left on one line; spacing = extra px between words"""
    f = F(font, size); asc, desc = f.getmetrics(); pad = 10 + stroke * 2; parts = []
    for t, col in runs:
        tw = int(f.getlength(t, direction='rtl', language='ar')) + 2 * pad; hh = int((asc + desc) * 1.25) + 2 * pad
        im = Image.new('RGBA', (tw, hh), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((tw - pad, pad), t, font=f, fill=tuple(int(c) for c in col[::-1]) + (255,), anchor='ra', direction='rtl', language='ar',
                                stroke_width=stroke, stroke_fill=(10, 14, 22, 255))
        parts.append(to_f(im))
    g = int(size * 0.30) - 2 * pad + spacing; tw = sum(p.shape[1] for p in parts) + g * (len(parts) - 1); hh = max(p.shape[0] for p in parts)
    out = np.zeros((hh, tw, 4), np.float32); x = tw
    for p in parts:
        x -= p.shape[1]; o = out[:p.shape[0], x:x + p.shape[1]]; a = p[..., 3:]; o[..., :3] = o[..., :3] * (1 - a) + p[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a); x -= g
    return out
def fitw(img, maxw):
    if img.shape[1] <= maxw: return img
    s = maxw / img.shape[1]; return cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
def put(c, img, cx, cy, s=1.0, alpha=1.0, shadow=0.55, blur=0.0, glow=0.0, wipe=None):
    """region-limited compositing; wipe = fraction revealed from the right (RTL)"""
    if alpha <= 0.01 or s <= 0.01: return c
    h, w = img.shape[:2]; pad = int(30 + blur * 3 + (40 if glow > 0 else 0))
    X0 = int(cx - w * s / 2) - pad; Y0 = int(cy - h * s / 2) - pad; X1 = int(cx + w * s / 2) + pad; Y1 = int(cy + h * s / 2) + pad
    x0, y0, x1, y1 = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if x1 <= x0 or y1 <= y0: return c
    M = np.float32([[s, 0, cx - w * s / 2 - X0], [0, s, cy - h * s / 2 - Y0]])
    rgba = cv2.warpAffine(img, M, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR)[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
    if wipe is not None and wipe < 1:
        edge = (cx + w * s / 2) - wipe * (w * s + 80); xs = np.arange(x0, x1, dtype=np.float32)
        m = np.clip((xs - edge) / 80, 0, 1)[None, :, None]; rgba = rgba * m
    if blur > 0.3: rgba = cv2.GaussianBlur(rgba, (0, 0), blur)
    r = c[y0:y1, x0:x1]; a = rgba[..., 3:] * alpha
    if shadow > 0:
        sh = cv2.GaussianBlur(rgba[..., 3], (0, 0), 10)[..., None] * shadow * alpha; r = r * (1 - sh * 0.85)
    if glow > 0:
        g = np.clip(cv2.GaussianBlur(rgba[..., 3], (0, 0), 16) * 1.5, 0, 1)[..., None] * glow * alpha; r = r + (ORANGE - r) * g * 0.55
    c[y0:y1, x0:x1] = r * (1 - a) + rgba[..., :3] * a; return c

# ---------------------------------------------------------------- phrases with an animation that matches their meaning
# style: loss (from darkness, sinks), strength (controlled slam on the beat), remember (letter-by-letter wipe, holds, slow fade),
#        scale (monumental, slowly grows), legacy (still, slow), name (the man's name)
PHR = []
def phrase(t0, t1, lines, style, y=960, size=92, dark=0.55, stagger=None):
    """lines: [(runs, scale)], runs = [(text, colour)]; each line its own image"""
    font = {'loss': 'thmanyahserifdisplay-Bold.ttf', 'strength': 'thmanyahsans-Black.ttf', 'remember': 'thmanyahserifdisplay-Black.ttf',
            'scale': 'thmanyahsans-Black.ttf', 'legacy': 'thmanyahserifdisplay-Black.ttf', 'name': 'thmanyahserifdisplay-Black.ttf'}[style]
    imgs = [fitw(text_img(runs, font, int(size * sc), stroke=0, spacing=10 if style == 'remember' else 0), 960) for runs, sc in lines]
    PHR.append(dict(t0=t0, t1=t1, imgs=imgs, style=style, y=y, dark=dark, stagger=stagger))
def draw_phrases(c, t):
    for P in PHR:
        t0, t1, st = P['t0'], P['t1'], P['style']
        if not (t0 - 0.05 <= t <= t1 + 1.6): continue
        hs = [im.shape[0] * 0.80 for im in P['imgs']]; tot = sum(hs); yc = P['y'] - tot / 2
        for k, im in enumerate(P['imgs']):
            y = yc + sum(hs[:k]) + hs[k] / 2
            stg = P['stagger'] if P['stagger'] is not None else (0.9 if st in ('loss', 'remember', 'legacy') else 0.45)
            d = t - t0 - (stg[k] if isinstance(stg, (list, tuple)) else k * stg)
            if d < 0: continue
            out = seg(t, t1, t1 + (1.4 if st in ('legacy', 'remember', 'loss') else 0.6))
            if st == 'loss':
                a = eio(d / 1.4) * (1 - eio(out)); c = put(c, im, W / 2, y - 14 + 26 * eio(d / 3.0) + 20 * out, 1.0, a, blur=(1 - eio(d / 1.2)) * 7)
            elif st == 'strength':
                p = ease(d / 0.28); a = min(1, d / 0.1) * (1 - eio(out)); s = 1.18 - 0.18 * p + 0.02 * seg(d, 0.3, 4)
                c = put(c, im, W / 2, y, s, a, glow=0.65 * np.exp(-d / 0.5) * (1 - out))
            elif st == 'remember':
                a = 1 - eio(out); c = put(c, im, W / 2, y, 1.0, a, wipe=ease(d / 1.6))
            elif st == 'scale':
                a = eio(d / 0.9) * (1 - eio(out)); s = 0.94 + 0.08 * eio(d / 6.0); c = put(c, im, W / 2, y, s, a, shadow=0.7)
            elif st == 'legacy':
                a = eio(d / 2.0) * (1 - eio(out)); c = put(c, im, W / 2, y, 1.0, a, blur=(1 - eio(d / 1.5)) * 3)
            elif st == 'name':
                a = eio(d / 1.0) * (1 - eio(out)); s = 1.06 - 0.06 * ease(d / 2.0); c = put(c, im, W / 2, y, s, a, glow=0.35 * np.exp(-d / 1.2))
    return c
def phrase_dark(t):
    """how much the picture darkens behind the phrases (centre band)"""
    v = 0.0
    for P in PHR:
        a = eio(seg(t, P['t0'] - 0.3, P['t0'] + 0.8)) * (1 - eio(seg(t, P['t1'], P['t1'] + 1.5))); v = max(v, a * P['dark'])
    return v

# ---------------------------------------------------------------- narration captions (small, low, word by word, two strong words at most)
CAPS = []
def cap(a, b, txt, starts=None):
    import re
    ws = []
    for part in re.split(r'(\[\[.*?\]\])', txt):
        if not part.strip(): continue
        st = part.startswith('[[')
        ws += [(w_, st) for w_ in (part[2:-2] if st else part).split()]
    if not starts or len(starts) != len(ws):
        L = [len(w_) + 2 for w_, _ in ws]; cum = np.cumsum([0] + L[:-1]) / sum(L); starts = [a + (b - a) * 0.75 * c for c in cum]
    imgs = []
    for w_, st in ws:
        sz = 72 if st else 62; col = ORANGE if st else WHITE
        imgs.append((text_img([(w_, col)], 'thmanyahsans-Black.ttf' if st else 'thmanyahsans-Bold.ttf', sz, stroke=4), text_img([(w_, AMBER)], 'thmanyahsans-Bold.ttf', sz, stroke=4) if not st else None))
    gap = 18; rows = [[]]; cur = 0
    for i, (im, _) in enumerate(imgs):
        if rows[-1] and cur + gap + im.shape[1] > 900: rows.append([]); cur = 0
        rows[-1].append(i); cur += im.shape[1] + (gap if cur else 0)
    pos = {}; rh = 80; y0 = 1400 - (len(rows) - 1) * rh
    for r, row in enumerate(rows):
        tot = sum(imgs[i][0].shape[1] for i in row) + gap * (len(row) - 1); x = W / 2 + tot / 2
        for i in row: wd = imgs[i][0].shape[1]; pos[i] = (x - wd / 2, y0 + r * rh); x -= wd + gap
    CAPS.append(dict(a=a, b=b, ws=ws, st=starts, imgs=imgs, pos=pos))
def cap_dark(t):
    v = 0.0
    for L in CAPS: v = max(v, eio(seg(t, L['a'] - 0.3, L['a'])) * (1 - eio(seg(t, L['b'] + 0.2, L['b'] + 0.7))))
    return v * 0.55
def draw_caps(c, t):
    for L in CAPS:
        if not (L['a'] - 0.1 <= t < L['b'] + 0.5): continue
        out = eio(seg(t, L['b'], L['b'] + 0.45)); nxt = L['st'][1:] + [L['b']]
        for i, (w_, st) in enumerate(L['ws']):
            if t < L['st'][i]: continue
            p = t - L['st'][i]; x, y = L['pos'][i]; im, lit = L['imgs'][i]
            if st: c = put(c, im, x, y - 10 * out, 1.0 + 0.25 * (1 - ease(p / 0.25)), min(1, p / 0.08) * (1 - out), shadow=0.6, glow=0.45 * np.exp(-p / 0.6) * (1 - out))
            else:
                use = lit if L['st'][i] <= t < nxt[i] + 0.05 else im
                c = put(c, use, x, y + 14 * (1 - ease(p / 0.22)) - 10 * out, 1.0, min(1, p / 0.12) * (1 - out), shadow=0.6)
    return c

# ================================================================ THE PHOTOGRAPH — three different revelations (real photo only, never altered)
PH_FULL = cv2.imread(KA + 'portrait_focus_full.jpg').astype(np.float32)           # 1452x2200, him in focus
PH_CUT = cv2.imread(KA + 'portrait_cut.png', -1).astype(np.float32); PH_CUT[..., 3] /= 255
def cover_fit(img, z, fx, fy):
    """crop the photo to 1080x1920 around focus point (fx, fy in photo px) with zoom z (1 = cover)"""
    h, w = img.shape[:2]; s = max(W / w, H / h) * z; hw, hh = W / (2 * s), H / (2 * s)
    fx = float(np.clip(fx, hw, w - hw)); fy = float(np.clip(fy, hh, h - hh))
    M = np.float32([[s, 0, W / 2 - fx * s], [0, s, H / 2 - fy * s]]); return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
FACE = (800, 1060)                                       # his face in the full photo
PHOTO = []                                               # (t0, t1, kind)
def photo_layer(c, t):
    for t0, t1, kind in PHOTO:
        if not (t0 <= t <= t1): continue
        d = t - t0; L = t1 - t0; inn = eio(seg(t, t0, t0 + 1.6)); out = eio(seg(t, t1 - 1.6, t1))
        if kind == 1:                                    # out of darkness: the procession sinks into black, his photo rises with a slow push-in
            p = d / L; im = cover_fit(PH_FULL, 1.05 + 0.10 * p, FACE[0], FACE[1] + 120 - 160 * p)
            dk = eio(seg(t, t0, t0 + 1.0)) * (1 - out); c = c * (1 - 0.82 * dk)
            a = eio(seg(t, t0 + 0.6, t0 + 2.4)) * (1 - out); c = c * (1 - a) + im * a
        elif kind == 2:                                  # close on the eyes, then the frame opens to the whole photograph
            p = eio2(seg(t, t0 + 0.8, t1 - 1.0)); z = lerp(2.6, 1.08, p); im = cover_fit(PH_FULL, z, FACE[0], lerp(FACE[1] - 60, FACE[1] + 200, p))
            a = inn * (1 - out); c = c * (1 - a) + im * a
        elif kind == 3:                                  # he stands above the moving procession (cut-out over the blurred, darkened crowd)
            bg = cv2.GaussianBlur(c, (0, 0), 9) * 0.45 + NAVY * 0.25
            k = inn * (1 - out); c = c * (1 - k) + bg * k
            s = 1.06 + 0.06 * (d / L); h, w = PH_CUT.shape[:2]; sc = W / w * 1.02 * s
            M = np.float32([[sc, 0, W / 2 - w * sc / 2], [0, sc, H - h * sc + 40 + 30 * (1 - inn)]])
            lay = cv2.warpAffine(PH_CUT, M, (W, H), flags=cv2.INTER_CUBIC)
            fade = np.clip((H - 260 - yy) / 360, 0, 1)[..., None]; a = lay[..., 3:] * fade * k
            c = c * (1 - a) + lay[..., :3] * a
        if kind in (1, 2):
            k = (inn if kind == 2 else eio(seg(t, t0 + 0.6, t0 + 2.4))) * (1 - out); c = c * (1 - 0.72 * PHF * k) + NAVY * 0.72 * PHF * k
        elif kind == 4:                                  # the farewell: the photograph returns, quiet, and slowly gives way to the light
            p = d / L; im = cover_fit(PH_FULL, 1.16 - 0.10 * p, FACE[0], FACE[1] + 40)
            im = im * 0.92 + 255 * 0.08 * eio(seg(t, t1 - 3, t1))
            a = inn * (1 - out); c = c * (1 - a) + im * a
            c = c * (1 - 0.72 * PHF * a) + NAVY * 0.72 * PHF * a
    return c

# ================================================================ brand accents
LOGO = cv2.resize(cv2.imread(K + '01-logo/logo-dark-round-256.png', -1).astype(np.float32), (84, 84), interpolation=cv2.INTER_AREA); LOGO[..., 3] /= 255
def line_mask():
    m = np.zeros((H, W), np.float32); s = 8
    for (x, y, dx, dy) in ((48, 48, 1, 1), (W - 48, 48, -1, 1), (48, H - 48, 1, -1), (W - 48, H - 48, -1, -1)):
        cv2.line(m, (x * s, y * s), ((x + dx * 70) * s, y * s), 1.0, 3, cv2.LINE_AA, shift=3); cv2.line(m, (x * s, y * s), (x * s, (y + dy * 70) * s), 1.0, 3, cv2.LINE_AA, shift=3)
    return m[..., None]
BRACKETS = line_mask()
CRED = None
def brand(c, t):
    a = 0.55 * eio(seg(t, 6, 8)) * (1 - eio(seg(t, DUR - 12, DUR - 10)))
    c = c + (AMBER - c) * BRACKETS * a
    c = put(c, LOGO, 96, SAFE_B + 40, alpha=0.85 * eio(seg(t, 6, 8)) * (1 - eio(seg(t, DUR - 12, DUR - 10))), shadow=0.3)
    return c

# ================================================================ TIMELINE (filled in timeline.py)
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'timeline.py')).read())

# ================================================================ frame
def frame(f, t):
    c = picture(f, t)
    dk = phrase_dark(t)
    if dk > 0: c = c * (1 - dk * CENF) + NAVY * 0.2 * dk * CENF
    intro = 1 - eio(seg(t, 0.0, 2.6)); c = c * (1 - intro)                                              # from black
    c = photo_layer(c, t)
    c = c * (1 - 0.40 * TOPF) + NAVY * 0.40 * TOPF; c = c * (1 - 0.62 * BOTF) + NAVY * 0.62 * BOTF        # room for title and captions (photos too)
    cd = cap_dark(t)
    if cd > 0: c = c * (1 - cd * CAPF) + NAVY * 0.3 * cd * CAPF
    c = draw_phrases(c, t); c = draw_caps(c, t); c = brand(c, t)
    for ct in CUTS:                                                                                      # cuts breathe through a short dip, never a black flash
        d = abs(t - ct)
        if d < 0.25: c = c * (1 - 0.30 * (1 - d / 0.25))
    end = eio(seg(t, DUR - 2.5, DUR)); c = c * (1 - end)
    return np.clip(c * VIG + GRAIN[int(t * FPS) % 6], 0, 255).astype(np.uint8)

def reader(t0, dur):
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-ss', f'{t0:.3f}', '-t', f'{dur:.3f}', '-i', SRC, '-vf', f'fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(SW * SH * 3)
        if len(b) < SW * SH * 3: p.kill(); break
        yield np.frombuffer(b, np.uint8).reshape(SH, SW, 3)

N = int(round(DUR * FPS))
if MODE == 'still':
    for t in [float(x) for x in sys.argv[2:]]:
        f = next(reader(t, 0.1)); cv2.imwrite(WK + f'film_{t:06.1f}.jpg', frame(f, t), [cv2.IMWRITE_JPEG_QUALITY, 90])
elif MODE == 'render':
    part, parts = int(sys.argv[2]), int(sys.argv[3]); i0 = N * part // parts; i1 = N * (part + 1) // parts
    enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
                            '-crf', '18', '-pix_fmt', 'yuv420p', WK + f'film_p{part}.mp4'], stdin=subprocess.PIPE)
    i = i0; last = None
    for f in reader(i0 / FPS, (i1 - i0) / FPS + 0.2):
        if i >= i1: break
        enc.stdin.write(frame(f, i / FPS).tobytes()); last = f; i += 1
    while i < i1: enc.stdin.write(frame(last, i / FPS).tobytes()); i += 1
    enc.stdin.close(); enc.wait(); print('part done', part, flush=True)
elif MODE == 'finish':
    parts = int(sys.argv[2]); lst = WK + 'film_parts.txt'; open(lst, 'w').write(''.join(f"file '{WK}film_p{k}.mp4'\n" for k in range(parts)))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', WK + 'film_body.mp4'], check=True)
    audio()                                                                                              # from timeline.py
    os.makedirs(OUTD, exist_ok=True); out = OUTD + 'janazat-raed-alkahlani-taiz.mp4'; XF = 0.8; outro = K + '04-intro-outro/outro-vertical-1080x1920.mp4'
    body = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', WK + 'film_body.mp4'], capture_output=True, text=True).stdout); off = body - XF
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'film_body.mp4', '-i', WK + 'film_mix.wav', '-i', outro, '-filter_complex',
        f'[0:v]setsar=1,fps=30,format=yuv420p,settb=1/30[m];[2:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p,settb=1/30[o];[m][o]xfade=transition=fade:duration={XF}:offset={off:.3f},format=yuv420p[v];'
        f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={off + 4.63:.3f}[va];'
        f'[2:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.6,adelay={int(off * 1000)}|{int(off * 1000)},volume=0.8[oa];[va][oa]amix=inputs=2:normalize=0:duration=first[a]',
        '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    print('ok', out)
