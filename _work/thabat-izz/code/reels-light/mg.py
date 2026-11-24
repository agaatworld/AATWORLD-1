# Motion-graphics engine for الثبات عز reels — light theme, kinetic typography, particles, camera, transitions
import numpy as np, cv2, os
from PIL import Image, ImageDraw, ImageFont
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
FD = S_ + 'taiz/fonts/'; NPM = S_ + 'fonts_npm/'; K = '/home/user/final/brand-kit/'
W, H, FPS = 1080, 1920, 30
def C(h): h = h.lstrip('#'); return np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32)
NAVY, STEEL, AMBER, CREAM, ORANGE, GREY = C('0F1B2D'), C('2E4A68'), C('F2A541'), C('F4E9D8'), C('FF8A3D'), C('A8B3C1')
PAPER = C('FBF4EA'); WHITE = C('FFFFFF'); INK = C('1A2638')
FONTS = {
    'naskh': S_ + 'fonts_user/NTPanoramaNaskh-Regular.ttf', 'noto_naskh': FD + 'c_NotoNaskhArabic[wght].ttf',
    'amiri': FD + 'c_Amiri-Bold.ttf', 'almarai': FD + 'c_Almarai-ExtraBold.ttf', 'almarai_b': FD + 'c_Almarai-Bold.ttf',
    'lalezar': FD + 'c_Lalezar-Regular.ttf', 'rakkas': FD + 'c_Rakkas-Regular.ttf', 'jomhuria': FD + 'c_Jomhuria-Regular.ttf',
    'ruqaa': FD + 'g_ArefRuqaa-Bold.ttf', 'kufi': FD + 'c_ReemKufi[wght].ttf', 'blaka': FD + 'g_Blaka-Regular.ttf', 'changa': FD + 'c_Changa[wght].ttf',
}
def ease(x): x = float(np.clip(x, 0, 1)); return 1 - (1 - x) ** 3
def eio(x): x = float(np.clip(x, 0, 1)); return x * x * (3 - 2 * x)
def back(x, k=1.7): x = float(np.clip(x, 0, 1)); return 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2
def elastic(x):
    x = float(np.clip(x, 0, 1))
    return 1.0 if x >= 1 else (0.0 if x <= 0 else 2 ** (-10 * x) * np.sin((x * 10 - 0.75) * (2 * np.pi / 3)) + 1)
def seg(t, a, b): return float(np.clip((t - a) / max(1e-6, b - a), 0, 1))
def bump(t, a, b): return float(np.sin(np.pi * seg(t, a, b)))
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# ---------------------------------------------------------------- text
_FC = {}
def font(k, s):
    key = (k, s)
    if key not in _FC:
        f = ImageFont.truetype(FONTS[k], s, layout_engine=ImageFont.Layout.RAQM)
        if '[wght]' in FONTS[k]:
            try: f.set_variation_by_axes([700])
            except Exception: pass
        _FC[key] = f
    return _FC[key]
def to_f(im):
    a = np.array(im).astype(np.float32); a[..., :3] = a[..., :3][..., ::-1].copy(); a[..., 3] /= 255; return a
_TC = {}
def text(runs, fk, size, stroke=0, stroke_col=None, gap=0.30, outline_only=False):
    """runs: list of (str, colour BGR) placed right-to-left; returns float RGBA"""
    key = (tuple((r, tuple(c)) for r, c in runs), fk, size, stroke, None if stroke_col is None else tuple(stroke_col), gap, outline_only)
    if key in _TC: return _TC[key]
    f = font(fk, size); asc, desc = f.getmetrics(); pad = 14 + stroke * 2; parts = []
    for t, col in runs:
        tw = int(f.getlength(t, direction='rtl', language='ar')) + 2 * pad; hh = int((asc + desc) * 1.2) + 2 * pad
        im = Image.new('RGBA', (tw, hh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        fc = tuple(int(c) for c in col[::-1])
        sc = tuple(int(c) for c in (stroke_col if stroke_col is not None else NAVY)[::-1])
        if outline_only: d.text((tw - pad, pad), t, font=f, fill=(0, 0, 0, 0), anchor='ra', direction='rtl', language='ar', stroke_width=max(2, stroke), stroke_fill=fc + (255,))
        else: d.text((tw - pad, pad), t, font=f, fill=fc + (255,), anchor='ra', direction='rtl', language='ar', stroke_width=stroke, stroke_fill=sc + (255,))
        parts.append(to_f(im))
    g = int(size * gap) - 2 * pad; tw = sum(p.shape[1] for p in parts) + g * (len(parts) - 1); hh = max(p.shape[0] for p in parts)
    out = np.zeros((hh, max(1, tw), 4), np.float32); x = tw
    for p in parts:
        x -= p.shape[1]; o = out[:p.shape[0], x:x + p.shape[1]]; a = p[..., 3:]; o[..., :3] = o[..., :3] * (1 - a) + p[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a); x -= g
    # trim empty rows/cols
    ys, xs = np.where(out[..., 3] > 0.01)
    if len(xs): out = out[max(0, ys.min() - 6):ys.max() + 7, max(0, xs.min() - 6):xs.max() + 7]
    _TC[key] = out; return out
def fitw(img, maxw):
    return img if img.shape[1] <= maxw else cv2.resize(img, None, fx=maxw / img.shape[1], fy=maxw / img.shape[1], interpolation=cv2.INTER_AREA)

def put(c, img, cx, cy, s=1.0, a=1.0, rot=0.0, sx=1.0, sy=1.0, shadow=0.0, blur=0.0, glow=0.0, glow_col=None, wipe=None, wipe_dir=-1, clip_y=None):
    """composite RGBA img centred at (cx,cy). wipe: 0..1 reveal (dir -1 = from right for RTL). clip_y: (y0,y1) visible band in output"""
    if a <= 0.004 or s <= 0.003: return c
    h, w = img.shape[:2]; ss_x, ss_y = s * sx, s * sy
    r = np.deg2rad(rot); ca, sa = np.cos(r), np.sin(r)
    hw, hh = w * abs(ss_x) / 2, h * abs(ss_y) / 2; ext = int(np.hypot(hw, hh)) + 40 + int(blur * 3) + (50 if glow > 0 else 0)
    X0, Y0, X1, Y1 = int(cx - ext), int(cy - ext), int(cx + ext), int(cy + ext)
    x0, y0, x1, y1 = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if x1 <= x0 or y1 <= y0: return c
    # affine: dst = R*S*(src - centre_src) + centre_dst(local)
    M = np.array([[ca * ss_x, -sa * ss_y, 0], [sa * ss_x, ca * ss_y, 0]], np.float32)
    M[:, 2] = np.array([cx - X0, cy - Y0], np.float32) - M[:, :2] @ np.array([w / 2, h / 2], np.float32)
    rgba = cv2.warpAffine(img, M, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR)[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
    if wipe is not None and wipe < 1:
        xs = np.arange(x0, x1, dtype=np.float32); L = cx - hw - 40; R = cx + hw + 40
        edge = R - wipe * (R - L) if wipe_dir < 0 else L + wipe * (R - L)
        m = np.clip((xs - edge) / 50, 0, 1) if wipe_dir < 0 else np.clip((edge - xs) / 50, 0, 1)
        rgba = rgba * m[None, :, None]
    if clip_y is not None:
        ys_ = np.arange(y0, y1, dtype=np.float32); m = ((ys_ >= clip_y[0]) & (ys_ <= clip_y[1])).astype(np.float32); rgba = rgba * m[:, None, None]
    if blur > 0.3: rgba = cv2.GaussianBlur(rgba, (0, 0), blur)
    reg = c[y0:y1, x0:x1]; al = rgba[..., 3:] * a
    if shadow > 0:
        sh = cv2.GaussianBlur(rgba[..., 3], (0, 0), 9)[..., None] * shadow * a
        sh = np.roll(sh, 8, axis=0); reg = reg * (1 - sh * 0.6) + NAVY * sh * 0.0
    if glow > 0:
        gg = np.clip(cv2.GaussianBlur(rgba[..., 3], (0, 0), 18) * 1.6, 0, 1)[..., None] * glow * a
        gc = AMBER if glow_col is None else glow_col; reg = reg + (gc - reg) * gg * 0.6
    c[y0:y1, x0:x1] = reg * (1 - al) + rgba[..., :3] * al
    return c

# ---------------------------------------------------------------- kinetic text element
class T:
    """one kinetic text element. style: slam, wipe, space, glitch, stamp, marker, split, flip, outline, pop, rise, drift"""
    def __init__(s, t0, t1, runs, fk, size, style, x=W / 2, y=960, maxw=900, out='fade', stroke=0, stroke_col=None, marker_col=None, rot=0.0, glow=0.0, plate=False):
        s.t0, s.t1, s.style, s.x, s.y, s.out, s.rot, s.gl = t0, t1, style, x, y, out, rot, glow
        s.img = fitw(text(runs, fk, size, stroke, stroke_col), maxw)
        if plate:                                                         # cream plate baked under the text (moves with it)
            h, w = s.img.shape[:2]; px, py = 34, 10; P = np.zeros((h + 2 * py, w + 2 * px, 4), np.float32)
            m = round_mask(w + 2 * px, h + 2 * py, min(26, (h + 2 * py) // 2 - 1)); P[..., :3] = PAPER; P[..., 3] = m * 0.94
            e = m - cv2.erode(m, np.ones((3, 3), np.uint8), iterations=3); P[..., :3] = P[..., :3] * (1 - e[..., None]) + AMBER * e[..., None]; P[..., 3] = np.maximum(P[..., 3], e)
            a = s.img[..., 3:]; P[py:py + h, px:px + w, :3] = P[py:py + h, px:px + w, :3] * (1 - a) + s.img[..., :3] * a
            s.img = P
        s.ol = fitw(text(runs, fk, size, max(3, size // 26), outline_only=True), maxw) if style == 'outline' else None
        s.mc = AMBER if marker_col is None else marker_col
    def draw(s, c, t):
        p = t - s.t0
        if p < 0 or t > s.t1 + 0.6: return c
        o = seg(t, s.t1, s.t1 + 0.28); A = 1 - eio(o)
        if s.out == 'zoom': sc_o = 1 + 1.8 * o ** 2; A = 1 - eio(seg(t, s.t1 + 0.1, s.t1 + 0.28))
        elif s.out == 'drop': sc_o = 1.0
        else: sc_o = 1 + 0.06 * o
        dy_o = 40 * o ** 2 if s.out == 'drop' else 0
        st, img, x, y = s.style, s.img, s.x, s.y + dy_o
        if st == 'slam':
            sc = 3.0 - 2.06 * ease(p / 0.13) if p < 0.13 else 0.94 + 0.06 * ease((p - 0.13) / 0.2)
            return put(c, img, x, y, sc * sc_o, min(1, p / 0.04) * A, rot=s.rot, shadow=0.5, glow=0.8 * np.exp(-p / 0.35) + s.gl, glow_col=ORANGE)
        if st == 'wipe':
            c = put(c, img, x, y, sc_o, A, rot=s.rot, wipe=ease(p / 0.42), shadow=0.35, glow=s.gl)
            if p < 0.5:                                                # leading amber bar
                hw = img.shape[1] / 2; ex = x + hw + 30 - ease(p / 0.42) * (2 * hw + 60)
                bar = np.zeros((img.shape[0] + 20, 10, 4), np.float32); bar[..., :3] = AMBER; bar[..., 3] = 1
                c = put(c, bar, ex, y, 1.0, (1 - seg(p, 0.38, 0.5)) * A)
            return c
        if st == 'space':
            k = ease(p / 0.75); dy = -18 * p
            return put(c, img, x, y + 30 * (1 - k) + dy, (0.55 + 0.45 * k) * sc_o, min(1, p / 0.3) * A, rot=s.rot, blur=(1 - k) * 7, glow=0.55 + s.gl, glow_col=AMBER)
        if st == 'glitch':
            if p < 0.32 or (int(t * 30) % 23 == 0 and p < s.t1 - s.t0):
                r = np.random.default_rng(int(t * 30)); g2 = img.copy()
                for _ in range(6):
                    a0 = r.integers(0, max(1, img.shape[0] - 8)); a1 = min(img.shape[0], a0 + r.integers(4, 22)); g2[a0:a1] = np.roll(g2[a0:a1], int(r.integers(-40, 40)), axis=1)
                rc = g2.copy(); rc[..., :3] = ORANGE; bc = g2.copy(); bc[..., :3] = STEEL
                c = put(c, rc, x + 7, y, sc_o, 0.55 * A); c = put(c, bc, x - 7, y, sc_o, 0.55 * A)
                return put(c, g2, x, y, sc_o, A, shadow=0.3)
            return put(c, img, x, y, sc_o, A, rot=s.rot, shadow=0.35, glow=s.gl)
        if st == 'stamp':
            sc = 1.45 - 0.45 * ease(p / 0.12) if p < 0.12 else 1.0 - 0.03 * bump(p, 0.12, 0.3)
            return put(c, img, x, y, sc * sc_o, min(1, p / 0.05) * A, rot=-11 + 7 * ease(p / 0.15) + s.rot, shadow=0.55)
        if st == 'marker':
            mw = img.shape[1] + 50; mh = int(img.shape[0] * 0.62); k = ease(p / 0.3)
            bar = np.zeros((mh, max(2, int(mw * k)), 4), np.float32); bar[..., :3] = s.mc; bar[..., 3] = 0.92
            c = put(c, bar, x + mw / 2 - bar.shape[1] / 2, y + img.shape[0] * 0.08, 1.0, A, rot=-1.2 + s.rot)
            return put(c, img, x, y, sc_o, ease(seg(p, 0.08, 0.3)) * A, rot=s.rot)
        if st == 'split':
            k = ease(p / 0.32); hh = img.shape[0] // 2; top, bot = img[:hh], img[hh:]
            c = put(c, top, x + 260 * (1 - k), y - (img.shape[0] - hh) / 2 + 0.0 * k - 0, sc_o, min(1, p / 0.15) * A)
            return put(c, bot, x - 260 * (1 - k), y + hh / 2, sc_o, min(1, p / 0.15) * A)
        if st == 'flip':
            k = back(p / 0.32, 2.2)
            return put(c, img, x, y, sc_o, min(1, p / 0.1) * A, rot=s.rot, sy=max(0.02, k), shadow=0.4, glow=s.gl)
        if st == 'outline':
            c = put(c, s.ol, x, y, sc_o, A, rot=s.rot, wipe=ease(p / 0.45))
            return put(c, img, x, y, sc_o, ease(seg(p, 0.42, 0.7)) * A, rot=s.rot, glow=s.gl)
        if st == 'pop':
            return put(c, img, x, y, max(0.01, elastic(p / 0.6)) * sc_o, min(1, p / 0.08) * A, rot=s.rot, shadow=0.4, glow=s.gl)
        if st == 'rise':
            k = ease(p / 0.38); hh = img.shape[0]
            return put(c, img, x, y + hh * 0.9 * (1 - k), sc_o, A, rot=s.rot, clip_y=(y - hh * 0.6, y + hh * 0.6), glow=s.gl)
        if st == 'drift':
            k = ease(p / 0.6)
            return put(c, img, x + 60 * (1 - k) - 14 * p, y, sc_o * (1.04 - 0.04 * k), k * A, rot=s.rot, blur=(1 - k) * 4, glow=s.gl)
        return put(c, img, x, y, sc_o, A)

# ---------------------------------------------------------------- word-by-word captions (Almarai, highlight = amber marker)
class Cap:
    def __init__(s, a, b, words, starts, keys=(), y=1420, size=62, col=NAVY, maxw=860, x=W / 2 - 30):
        s.a, s.b, s.st, s.keys, s.y = a, b, starts, set(keys), y
        s.imgs = [text([(w, col)], 'almarai', size) for w in words]
        s.kimg = {i: text([(w, NAVY)], 'almarai', size) for i, w in enumerate(words) if i in s.keys}
        gap = 16; rows = [[]]; cur = 0
        for i, im in enumerate(s.imgs):
            if rows[-1] and cur + gap + im.shape[1] > maxw: rows.append([]); cur = 0
            rows[-1].append(i); cur += im.shape[1] + (gap if cur else 0)
        rh = int(size * 1.35); y0 = y - (len(rows) - 1) * rh; s.pos = {}
        for r_, row in enumerate(rows):
            tot = sum(s.imgs[i].shape[1] for i in row) + gap * (len(row) - 1); xx_ = x + tot / 2
            for i in row: wd = s.imgs[i].shape[1]; s.pos[i] = (xx_ - wd / 2, y0 + r_ * rh); xx_ -= wd + gap
        s.box = (min(p[0] - s.imgs[i].shape[1] / 2 for i, p in s.pos.items()), y0 - rh * 0.55, max(p[0] + s.imgs[i].shape[1] / 2 for i, p in s.pos.items()), y0 + (len(rows) - 1) * rh + rh * 0.55)
    def draw(s, c, t, plate=True):
        if not (s.a - 0.1 <= t < s.b + 0.35): return c
        o = eio(seg(t, s.b, s.b + 0.25)); A = 1 - o
        if plate:                                                       # soft cream plate behind the line
            x0, y0, x1, y1 = [int(v) for v in s.box]; pa = 0.78 * A * eio(seg(t, s.a - 0.1, s.a + 0.1))
            x0 -= 26; x1 += 26; y0 -= 8; y1 += 8
            if pa > 0:
                m = np.zeros((y1 - y0, x1 - x0), np.float32); cv2.rectangle(m, (0, 0), (x1 - x0 - 1, y1 - y0 - 1), 1.0, -1)
                m = cv2.GaussianBlur(m, (0, 0), 6)[..., None]; r = c[max(0, y0):y1, x0:x1]; mm = m[max(0, -y0):, :r.shape[1]]
                c[max(0, y0):y1, x0:x1] = r * (1 - mm * pa) + PAPER * mm * pa
        nxt = s.st[1:] + [s.b]
        for i, im in enumerate(s.imgs):
            if t < s.st[i]: continue
            p = t - s.st[i]; x, y = s.pos[i]
            if i in s.keys:
                mw = im.shape[1] + 18; k = ease(p / 0.2); bar = np.zeros((int(im.shape[0] * 0.62), max(2, int(mw * k)), 4), np.float32); bar[..., :3] = AMBER; bar[..., 3] = 1
                c = put(c, bar, x + mw / 2 - bar.shape[1] / 2, y + 4, 1.0, A)
                c = put(c, s.kimg[i], x, y - 6 * (1 - ease(p / 0.2)), 1.0 + 0.18 * (1 - ease(p / 0.2)), min(1, p / 0.06) * A)
            else:
                cur = s.st[i] <= t < nxt[i] + 0.04
                c = put(c, im, x, y + 12 * (1 - ease(p / 0.18)), 1.0, min(1, p / 0.1) * A * (1.0 if cur else 0.92))
        return c

# ---------------------------------------------------------------- particles (analytic: state from t only)
class Dust:
    def __init__(s, n, seed, col=AMBER, size=(2, 6), speed=(-20, -60), alpha=0.55, region=(0, 0, W, H)):
        r = np.random.default_rng(seed); s.n = n
        s.x = r.uniform(region[0], region[2], n); s.y = r.uniform(region[1], region[3], n); s.vx = r.normal(0, 8, n); s.vy = r.uniform(speed[1], speed[0], n)
        s.sz = r.uniform(*size, n); s.ph = r.uniform(0, 6.28, n); s.col = col; s.alpha = alpha; s.reg = region
    def draw(s, c, t, a=1.0):
        if a <= 0.01: return c
        m = np.zeros((H // 2, W // 2), np.float32); rw, rh = s.reg[2] - s.reg[0], s.reg[3] - s.reg[1]
        x = s.reg[0] + (s.x - s.reg[0] + s.vx * t + 12 * np.sin(t * 0.8 + s.ph)) % rw; y = s.reg[1] + (s.y - s.reg[1] + s.vy * t) % rh
        tw = 0.5 + 0.5 * np.sin(t * 2.3 + s.ph) ** 2
        for xi, yi, si, ti in zip(x, y, s.sz, tw): cv2.circle(m, (int(xi * 4), int(yi * 4)), int(si * 2), float(ti), -1, cv2.LINE_AA, shift=3)
        m = cv2.resize(cv2.GaussianBlur(m, (0, 0), 1.2), (W, H)); g = cv2.GaussianBlur(m, (0, 0), 6) * 1.5; m = m[..., None]; g = g[..., None]
        return c + (s.col - c) * np.clip((m + g * 0.6) * s.alpha * a, 0, 1)
def burst(c, t, t0, x, y, n=40, col=ORANGE, speed=900, life=0.7, seed=1, size=4.0, grav=900):
    p = t - t0
    if p < 0 or p > life: return c
    r = np.random.default_rng(seed); an = r.uniform(0, 2 * np.pi, n); sp = r.uniform(0.35, 1, n) * speed; sz = r.uniform(0.5, 1, n) * size
    k = 1 - p / life; m = np.zeros((H, W), np.float32)
    for a_, v, z in zip(an, sp, sz):
        px = x + np.cos(a_) * v * p * (1 - 0.35 * p); py = y + np.sin(a_) * v * p * (1 - 0.35 * p) + 0.5 * grav * p * p
        qx = px - np.cos(a_) * v * 0.03; qy = py - np.sin(a_) * v * 0.03
        cv2.line(m, (int(qx * 8), int(qy * 8)), (int(px * 8), int(py * 8)), 1.0, max(1, int(z)), cv2.LINE_AA, shift=3)
    m = cv2.GaussianBlur(m, (0, 0), 0.8)[..., None]
    return c + (col - c) * np.clip(m * k * 1.2, 0, 1)
def rays(c, t, t0, x, y, n=18, col=AMBER, life=0.5, r0=120, r1=900, w=5, seed=3):
    """speed / impact lines radiating from a point"""
    p = t - t0
    if p < 0 or p > life: return c
    r = np.random.default_rng(seed); m = np.zeros((H, W), np.float32); k = ease(p / life)
    for i in range(n):
        an = 2 * np.pi * i / n + r.uniform(-0.12, 0.12); a0 = r0 + (r1 - r0) * k * 0.6; a1 = a0 + r.uniform(80, 260) * (1 - k * 0.5)
        cv2.line(m, (int((x + np.cos(an) * a0) * 8), int((y + np.sin(an) * a0) * 8)), (int((x + np.cos(an) * a1) * 8), int((y + np.sin(an) * a1) * 8)), 1.0, w, cv2.LINE_AA, shift=3)
    return c + (col - c) * (m * (1 - p / life))[..., None]
def ring(c, t, t0, x, y, col=AMBER, life=0.6, r0=40, r1=520, w=6):
    p = t - t0
    if p < 0 or p > life: return c
    k = ease(p / life); m = np.zeros((H, W), np.float32); cv2.circle(m, (int(x * 8), int(y * 8)), int((r0 + (r1 - r0) * k) * 8), 1.0, max(1, int(w * (1 - k) + 1)), cv2.LINE_AA, shift=3)
    return c + (col - c) * (m * (1 - k))[..., None]

# ---------------------------------------------------------------- light-theme backgrounds
def star8(m, cx, cy, r, th=1):
    pts = []
    for i in range(16):
        an = np.pi / 8 * i; rr = r if i % 2 == 0 else r * 0.62; pts.append((cx + np.cos(an) * rr, cy + np.sin(an) * rr))
    cv2.polylines(m, [(np.array(pts) * 8).astype(np.int32)], True, 1.0, th, cv2.LINE_AA, shift=3)
def pattern(step=150, r=48):
    m = np.zeros((H + step, W + step), np.float32)
    for j, y in enumerate(range(0, H + step, step)):
        for x in range(0, W + step, step): star8(m, x + (step / 2 if j % 2 else 0), y, r, 2)
    return m
PAT = pattern()
def background(t, base=PAPER, tint=CREAM, pat_a=0.10, leak=1.0, drift=(12, -8)):
    g = np.clip(1 - np.hypot(xx - W * 0.5, yy - H * 0.42) / 1400, 0, 1)[..., None]
    c = tint + (base - tint) * g
    ox, oy = int(t * drift[0]) % 150, int(-t * drift[1]) % 150
    p = PAT[oy:oy + H, ox:ox + W][..., None]; c = c + (AMBER * 0.85 - c) * p * pat_a
    if leak > 0:                                                         # warm light leaks drifting
        for i, (ax, ay, rr, sp) in enumerate(((0.15, 0.2, 620, 0.23), (0.85, 0.75, 700, 0.17), (0.6, 0.1, 500, 0.31))):
            lx = W * ax + 160 * np.sin(t * sp + i); ly = H * ay + 120 * np.cos(t * sp * 1.3 + i)
            gl = np.exp(-((xx - lx) ** 2 + (yy - ly) ** 2) / (2 * rr ** 2))[..., None]; c = c + (C('FFD9A0') - c) * gl * 0.28 * leak
    return c
GRAIN = [cv2.GaussianBlur(np.random.default_rng(i).standard_normal((H, W)).astype(np.float32), (0, 0), 0.8)[..., None] * 2.4 for i in range(6)]
def finish_frame(c, t, vig=0.10):
    v = (1 - vig * np.clip(np.hypot((xx - W / 2) / (W * 0.7), (yy - H / 2) / (H * 0.62)) - 0.5, 0, 1) ** 1.4)[..., None]
    c = c * v + GRAIN[int(t * FPS) % 6]
    return np.clip(c, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- shapes / masks
def arch_mask(w, h, top=0.34, rad=None):
    """Islamic arch (pointed) panel mask w x h, float 0..1 (anti-aliased)"""
    S = 4; m = np.zeros((h * S, w * S), np.uint8); ah = int(h * top * S); r = w * S / 2
    pts = []
    for i in range(41):
        k = i / 40; x = k * w * S
        # pointed arch: two arcs meeting at the top centre
        if k <= 0.5: yv = ah - ah * np.sin(np.pi / 2 * (k / 0.5)) ** 0.85
        else: yv = ah - ah * np.sin(np.pi / 2 * ((1 - k) / 0.5)) ** 0.85
        pts.append((x, yv))
    pts += [(w * S, h * S), (0, h * S)]
    cv2.fillPoly(m, [np.array(pts, np.int32)], 255, cv2.LINE_AA)
    return cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
def round_mask(w, h, r):
    S = 4; m = np.zeros((h * S, w * S), np.uint8); R = r * S
    cv2.rectangle(m, (R, 0), (w * S - R, h * S), 255, -1); cv2.rectangle(m, (0, R), (w * S, h * S - R), 255, -1)
    for cx, cy in ((R, R), (w * S - R, R), (R, h * S - R), (w * S - R, h * S - R)): cv2.circle(m, (cx, cy), R, 255, -1, cv2.LINE_AA)
    return cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
def place(c, img, mask, cx, cy, s=1.0, a=1.0, rot=0.0, border=0, border_col=AMBER, shadow=0.35):
    """place an image (BGR float) with mask (float) into canvas, centred, scaled, rotated"""
    rgba = np.dstack([img, mask])
    if border > 0:
        e = cv2.dilate((mask > 0.5).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=border).astype(np.float32)
        e = cv2.GaussianBlur(e, (0, 0), 0.8); bimg = np.dstack([np.broadcast_to(border_col, img.shape).astype(np.float32), e])
        if shadow > 0:
            sh = np.dstack([np.broadcast_to(NAVY, img.shape).astype(np.float32), cv2.GaussianBlur(e, (0, 0), 14) * shadow])
            c = put(c, sh, cx + 10, cy + 22, s, a, rot=rot)
        c = put(c, bimg, cx, cy, s, a, rot=rot)
    elif shadow > 0:
        sh = np.dstack([np.broadcast_to(NAVY, img.shape).astype(np.float32), cv2.GaussianBlur(mask, (0, 0), 14) * shadow])
        c = put(c, sh, cx + 10, cy + 22, s, a, rot=rot)
    return put(c, rgba, cx, cy, s, a, rot=rot)

# ---------------------------------------------------------------- camera & transitions
def camera(c, z=1.0, dx=0.0, dy=0.0, rot=0.0, fill=None):
    if abs(z - 1) < 1e-4 and abs(dx) < 0.3 and abs(dy) < 0.3 and abs(rot) < 1e-3: return c
    M = cv2.getRotationMatrix2D((W / 2, H / 2), rot, z); M[0, 2] += dx; M[1, 2] += dy
    bv = tuple(float(v) for v in (PAPER if fill is None else fill))
    return cv2.warpAffine(c, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=bv)
def whip(a, b, p, dirx=1):
    k = eio(p); off = int(W * 0.9 * k) * dirx
    mix = np.roll(a, off, axis=1) * (1 - k) + np.roll(b, off - W * dirx if dirx else 0, axis=1) * k if False else a * (1 - k) + b * k
    kl = int(10 + 90 * bump(p, 0, 1)) | 1; ker = np.ones((1, kl), np.float32) / kl
    return cv2.filter2D(mix, -1, ker)
def zoomt(a, b, p):
    k = eio(p); aa = camera(a, 1 + 0.6 * k); bb = camera(b, 1.35 - 0.35 * k)
    m = aa * (1 - k) + bb * k; s = bump(p, 0, 1)
    if s > 0.05:
        sm = cv2.resize(m, (W // 4, H // 4)); acc = np.zeros_like(sm)
        for i in range(6): acc += camera(sm, 1 + 0.03 * i * s) if False else cv2.warpAffine(sm, cv2.getRotationMatrix2D((W / 8, H / 8), 0, 1 + 0.035 * i * s), (W // 4, H // 4), borderMode=cv2.BORDER_REFLECT)
        m = m * (1 - s * 0.7) + cv2.resize(acc / 6, (W, H)) * s * 0.7
    return m
def flash(a, b, p, col=None):
    k = eio(p); m = a * (1 - k) + b * k; f = bump(p, 0, 1); return m + ((C('FFF6E8') if col is None else col) - m) * f * 0.85
def glitch_cut(a, b, p):
    m = a if p < 0.5 else b; r = np.random.default_rng(int(p * 97)); out = m.copy()
    for _ in range(10):
        y0 = int(r.integers(0, H - 40)); h = int(r.integers(10, 90)); out[y0:y0 + h] = np.roll(out[y0:y0 + h], int(r.integers(-120, 120)), axis=1)
    out[..., 2] = np.roll(out[..., 2], 9, axis=1); out[..., 0] = np.roll(out[..., 0], -9, axis=1)
    return out
def iris(a, b, p, cx=W / 2, cy=H / 2):
    R = ease(p) * 1250; m = np.clip((R - np.hypot(xx - cx, yy - cy)) / 6, 0, 1)[..., None]; out = a * (1 - m) + b * m
    ringm = np.clip(1 - np.abs(np.hypot(xx - cx, yy - cy) - R) / 6, 0, 1)[..., None] * (1 - p)
    return out + (AMBER - out) * ringm

# ---------------------------------------------------------------- brand
def _logo(size, kind='light'):
    p = K + f'01-logo/logo-{kind}-round-512.png'; im = cv2.imread(p, -1).astype(np.float32); im = cv2.resize(im, (size, size), interpolation=cv2.INTER_AREA); im[..., 3] /= 255; return im
LOGO_S = None
def brand_corner(c, t, a=1.0, x=100, y=330):
    global LOGO_S
    if LOGO_S is None: LOGO_S = _logo(104, 'dark')
    return put(c, LOGO_S, x, y, 1.0, 0.95 * a)
def credit_pill(txt, size=30):
    f = font('almarai_b', size); tw = int(f.getlength(txt, direction='rtl', language='ar')) + 48
    im = Image.new('RGBA', (tw, 56), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.rounded_rectangle((0, 0, tw - 1, 55), 28, fill=(15, 27, 45, 225), outline=(242, 165, 65, 255), width=2)
    d.text((tw - 24, 28), txt, font=f, fill=(244, 233, 216, 255), anchor='rm', direction='rtl', language='ar'); return to_f(im)
def outro(c, t, t0):
    """light closing: logo, الثبات عز, الكلمة مقاومة"""
    a = eio(seg(t, t0, t0 + 0.5))
    if a <= 0: return c
    c = c * (1 - a) + background(t, leak=0.6) * a
    L = _logo(360, 'dark')
    c = put(c, L, W / 2, 800, 0.9 + 0.1 * back(seg(t, t0 + 0.1, t0 + 0.7)), eio(seg(t, t0 + 0.1, t0 + 0.5)), shadow=0.3)
    c = ring(c, t, t0 + 0.25, W / 2, 800, AMBER, 0.9, 150, 520, 6)
    T1 = text([('الثبات', NAVY), ('عز', ORANGE)], 'naskh', 150)
    c = put(c, T1, W / 2, 1100, 1.0, eio(seg(t, t0 + 0.5, t0 + 0.9)), wipe=ease(seg(t, t0 + 0.5, t0 + 1.0)))
    T2 = text([('الكلمة مقاومة', STEEL)], 'almarai', 62)
    c = put(c, T2, W / 2, 1245, 1.0, eio(seg(t, t0 + 0.9, t0 + 1.3)))
    m = np.zeros((H, W), np.float32); half = 230 * ease(seg(t, t0 + 1.0, t0 + 1.6)); cv2.line(m, (int((W / 2 - half) * 8), 1318 * 8), (int((W / 2 + half) * 8), 1318 * 8), 1.0, 4, cv2.LINE_AA, shift=3)
    return c + (AMBER - c) * m[..., None]
