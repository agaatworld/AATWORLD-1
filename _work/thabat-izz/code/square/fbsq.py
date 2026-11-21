# «الثبات عز» — square 1:1 edits for landscape sources (channel rule): video panel in the middle, navy stage around it,
# title above, word-by-word captions below (strong words slam), cover card first, context foley, no music, brand outro.
# usage: python3 fbsq.py <cfg.json> render <part> <parts> | finish | still t...
import numpy as np, cv2, json, subprocess, sys, os, re, soundfile as sf
from PIL import Image, ImageDraw, ImageFont
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
TH = S_ + 'taiz/fonts/th/'; K = '/home/user/final/brand-kit/'; KA = '/home/user/final/kahlani/assets/'
SFXD = [S_ + 'sfx/s', S_ + 'sfx2/m', S_ + 'sfx3/m']
W = H = 1080; FPS = 30; T0 = 0.8
NAVY = np.array([45, 27, 15], np.float32); STEEL = np.array([104, 74, 46], np.float32); AMBER = np.array([65, 165, 242], np.float32)
WHITE = np.array([216, 233, 244], np.float32); ORANGE = np.array([61, 138, 255], np.float32); SPARK = np.array([120, 200, 255], np.float32)
cfg = json.load(open(sys.argv[1])); NAME = cfg['name']; WK = os.path.dirname(os.path.abspath(sys.argv[1])) + '/'; OUTD = cfg['outd']
MODE = sys.argv[2]
rng = np.random.default_rng(11); yy, xx = np.mgrid[:H, :W].astype(np.float32)

# ---------------------------------------------------------------- text
def F(n, s): return ImageFont.truetype(TH + n, s, layout_engine=ImageFont.Layout.RAQM)
def to_f(im):
    a = np.array(im).astype(np.float32); a[..., :3] = a[..., :3][..., ::-1].copy(); a[..., 3] /= 255; return a
def word(w, font, size, col, stroke=0):
    f = F(font, size); asc, desc = f.getmetrics(); pad = 6 + stroke * 2
    tw = int(f.getlength(w, direction='rtl', language='ar')) + 2 * pad; hh = int((asc + desc) * 1.2) + 2 * pad
    im = Image.new('RGBA', (tw, hh), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((tw - pad, pad), w, font=f, fill=tuple(int(x) for x in col[::-1]) + (255,), anchor='ra', direction='rtl', language='ar',
                            stroke_width=stroke, stroke_fill=(10, 16, 28, 255))
    return to_f(im)
def line(runs, font, size, stroke=0):
    ims = [word(t, font, size, c, stroke) for t, c in runs]; pad = 6 + stroke * 2; g = int(size * 0.34) - 2 * pad
    tw = sum(i.shape[1] for i in ims) + g * (len(ims) - 1); hh = max(i.shape[0] for i in ims); out = np.zeros((hh, tw, 4), np.float32); x = tw
    for i in ims:
        x -= i.shape[1]; o = out[:i.shape[0], x:x + i.shape[1]]; a = i[..., 3:]; o[..., :3] = o[..., :3] * (1 - a) + i[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a); x -= g
    return out
def runs(txt, base=WHITE, hi=ORANGE):
    out = []
    for part in re.split(r'(\[\[.*?\]\])', txt):
        if not part.strip(): continue
        st = part.startswith('[['); out += [(w_, hi if st else base) for w_ in (part[2:-2] if st else part).split()]
    return out
def stack(lines, step):
    Wm = max(l.shape[1] for l in lines); out = np.zeros((step * (len(lines) - 1) + lines[-1].shape[0], Wm, 4), np.float32)
    for k, l in enumerate(lines):
        y = k * step; x = (Wm - l.shape[1]) // 2; o = out[y:y + l.shape[0], x:x + l.shape[1]]; a = l[..., 3:]; o[..., :3] = o[..., :3] * (1 - a) + l[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a)
    return out
def fit(img, maxw):
    if img.shape[1] <= maxw: return img
    s = maxw / img.shape[1]; return cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)

# ---------------------------------------------------------------- compositing (region-limited: fast)
def put(c, img, cx, cy, s=1.0, alpha=1.0, shadow=0.5, blur=0.0, glow=None):
    if alpha <= 0.01 or s <= 0.01: return c
    h, w = img.shape[:2]; pad = int(24 + blur * 3 + (30 if glow is not None else 0))
    X0 = int(cx - w * s / 2) - pad; Y0 = int(cy - h * s / 2) - pad; X1 = int(cx + w * s / 2) + pad; Y1 = int(cy + h * s / 2) + pad
    x0, y0, x1, y1 = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if x1 <= x0 or y1 <= y0: return c
    M = np.float32([[s, 0, cx - w * s / 2 - X0], [0, s, cy - h * s / 2 - Y0]])
    rgba = cv2.warpAffine(img, M, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
    if blur > 0.3: rgba = cv2.GaussianBlur(rgba, (0, 0), blur)
    r = c[y0:y1, x0:x1]; a = rgba[..., 3:] * alpha
    if shadow > 0:
        sh = np.roll(np.roll(cv2.GaussianBlur(rgba[..., 3], (0, 0), 7), 5, 0), 2, 1)[..., None] * shadow * alpha; r = r * (1 - sh) + NAVY * 0.35 * sh
    if glow is not None:
        g = np.clip(cv2.GaussianBlur(rgba[..., 3], (0, 0), 13) * 1.6, 0, 1)[..., None] * glow; r = r + (ORANGE - r) * g * 0.6
    c[y0:y1, x0:x1] = r * (1 - a) + rgba[..., :3] * a; return c
def ease(x): x = float(np.clip(x, 0, 1)); return 1 - (1 - x) ** 3
def back(x, s=2.0): x = float(np.clip(x, 0, 1)); return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2
def smooth(x): x = float(np.clip(x, 0, 1)); return x * x * (3 - 2 * x)
def bump(x): return float(np.sin(np.pi * np.clip(x, 0, 1)))
def lay(c, m, col, a): return c + (col - c) * (np.clip(m, 0, 1) * a)[..., None]

# ---------------------------------------------------------------- layout
PX0, PY0, PW, PH = cfg['panel']; PCX, PCY = PX0 + PW / 2, PY0 + PH / 2
CAPY = cfg['cap_y']; CREDY = 1032; LOGOXY = (96, 1032)
def make_stage():
    g = np.clip(1 - np.hypot((xx - PCX) / 700, (yy - PCY) / 640), 0, 1) ** 1.6
    c = NAVY[None, None] + (STEEL - NAVY)[None, None] * (g[..., None] * 0.55); c = c * (0.88 + 0.12 * (1 - yy / H))[..., None]
    t = cv2.imread(KA + 'topo.png', -1); t = cv2.resize(t, (1300, 1300))[:1080, 110:1190]
    return lay(c, t[..., 3].astype(np.float32) / 255, AMBER, 0.05)
STAGE = make_stage()
VIG = (1 - 0.28 * np.clip(np.hypot((xx - W / 2) / (W * 0.7), (yy - H / 2) / (H * 0.7)) - 0.5, 0, 1))[..., None]
GRAIN = [cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)[..., None] * 2.4 for _ in range(4)]
LOGO = cv2.resize(cv2.imread(K + '01-logo/logo-dark-round-256.png', -1).astype(np.float32), (88, 88), interpolation=cv2.INTER_AREA); LOGO[..., 3] /= 255
def pill(txt, size, fg, outline, fill=(15, 27, 45, 225), rad=None):
    f = F('thmanyahsans-Bold.ttf' if size < 34 else 'thmanyahsans-Black.ttf', size); tw = int(f.getlength(txt, direction='rtl', language='ar')) + int(size * 1.6); th = int(size * 1.85)
    im = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, tw - 1, th - 1), rad or th // 2, fill=fill, outline=outline, width=2 if size < 34 else 3)
    d.text((tw - int(size * 0.8), th // 2 + 1), txt, font=f, fill=fg, anchor='rm', direction='rtl', language='ar'); return to_f(im)
CRED = pill('المصدر: ' + cfg['credit'], 26, (168, 179, 193, 255), (46, 74, 104, 255))
TAG = pill('كلنا مقاومة', 36, (244, 233, 216, 255), (242, 165, 65, 255), (15, 27, 45, 235), 10)
TITLE = fit(line(runs(cfg['title']), 'thmanyahserifdisplay-Black.ttf', cfg.get('tsize', 58)), 940)
BIG = fit(stack([line(runs(l), 'thmanyahsans-Black.ttf', s, stroke=6) for l, s in cfg['cover']], int(max(x[1] for x in cfg['cover']) * 1.06)), 960)
keep = np.ones((H, W), np.float32); keep[max(0, PY0 - 8):PY0 + PH + 8, max(0, PX0 - 8):PX0 + PW + 8] = 0
SHADOW = cv2.GaussianBlur(((xx > PX0) & (xx < PX0 + PW) & (yy > PY0) & (yy < PY0 + PH)).astype(np.float32), (0, 0), 22)[..., None]
def frame_mask(br=52):
    m = np.zeros((H, W), np.float32); s = 8; x0, y0, x1, y1 = PX0 - 10, PY0 - 10, PX0 + PW + 10, PY0 + PH + 10
    cv2.rectangle(m, (x0 * s, y0 * s), (x1 * s, y1 * s), 0.6, 2, cv2.LINE_AA, shift=3)
    for (x, y, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        x, y = x - dx * 10, y - dy * 10
        cv2.line(m, (x * s, y * s), ((x + dx * br) * s, y * s), 1.0, 4, cv2.LINE_AA, shift=3); cv2.line(m, (x * s, y * s), (x * s, (y + dy * br) * s), 1.0, 4, cv2.LINE_AA, shift=3)
    return m
FRAME = frame_mask()
NP = 40; PXp = rng.uniform(0, W, NP); PYp = rng.uniform(0, H, NP); PV = rng.uniform(8, 26, NP); PS = rng.uniform(1.2, 2.6, NP); PP = rng.uniform(0, 6.28, NP)
def dust(c, t):
    m = np.zeros((H, W), np.float32)
    for i in range(NP):
        x = (PXp[i] + 14 * np.sin(t * 0.5 + PP[i])) % W; y = (PYp[i] - PV[i] * t) % H; a = 0.6 + 0.4 * np.sin(t * 1.5 + PP[i])
        cv2.circle(m, (int(x * 4), int(y * 4)), int(PS[i] * 4), float(a), -1, cv2.LINE_AA, shift=2)
    return lay(c, cv2.GaussianBlur(m, (0, 0), 1.3) * keep * 3.0, SPARK, 0.32)
def rings(c, t, ang):
    r = cfg.get('ring_r', 0.5 * np.hypot(PW, PH) * 0.86); cx, cy = PCX, PCY; draw = ease(t / 1.3); sweep = 360 * draw; s = 8
    m1 = np.zeros((H, W), np.float32); m2 = np.zeros((H, W), np.float32)
    if sweep > 0.5:
        cv2.ellipse(m1, (int(cx * s), int(cy * s)), (int(r * s), int(r * s)), 0, -90 + ang, -90 + ang + sweep, 1.0, 3, cv2.LINE_AA, shift=3)
        for k in range(60):
            if k * 6 > sweep: break
            a0 = -ang * 1.6 + k * 6; cv2.ellipse(m2, (int(cx * s), int(cy * s)), (int((r + 22) * s), int((r + 22) * s)), 0, a0, a0 + 2.6, 1.0, 2, cv2.LINE_AA, shift=3)
        for k in range(4):
            if k * 90 > sweep: break
            a = np.deg2rad(-90 + ang + k * 90); cv2.circle(m2, (int((cx + np.cos(a) * r) * s), int((cy + np.sin(a) * r) * s)), int(5 * s), 1.0, -1, cv2.LINE_AA, shift=3)
    return lay(lay(c, m1 * keep, STEEL * 1.25, 0.85), m2 * keep, AMBER, 0.6)
def chevrons(c, t, events, x, y):
    for te in events:
        d = t - te
        if not (0 <= d < 1.9): continue
        al = min(1.0, d / 0.25) * (1 - smooth((d - 1.3) / 0.6)); m = np.zeros((H, W), np.float32)
        for k in range(3):
            p = ease((d - k * 0.08) / 0.45); x0 = x + (k * 20 - 30 * (1 - p)); a = al * (0.45 + 0.55 * p) * (1 - k * 0.22)
            pts = np.array([[x0 - 8, y - 14], [x0 + 6, y], [x0 - 8, y + 14]], np.float32) * 8
            cv2.polylines(m, [pts.astype(np.int32)], False, float(a), 4, cv2.LINE_AA, shift=3)
        c = lay(c, m, AMBER, 0.95)
    return c
def grade(v):
    lum = v.mean(-1, keepdims=True) / 255; v = v * (1 - 0.12 * (1 - lum)) + NAVY * 0.12 * (1 - lum); return v + (WHITE - v) * 0.05 * lum ** 2

# ---------------------------------------------------------------- captions
class Captions:
    def __init__(self, chunks, y, size, maxw=940):
        self.L = []
        for a, b, txt, starts in chunks:
            ws = [(w_, c is ORANGE) for w_, c in runs(txt)]
            if not ws: continue
            if not starts or len(starts) != len(ws):
                Ls = [len(w_) + 2 for w_, _ in ws]; cum = np.cumsum([0] + Ls[:-1]) / max(1, sum(Ls)); s1 = a + (b - a) * 0.8; starts = [a + (s1 - a) * c for c in cum]
            starts = [max(a, min(s, b - 0.08)) for s in starts]
            imgs = []
            for w_, st in ws:
                sz = int(size * (1.2 if st else 1)); sw = max(4, sz // 13)
                imgs.append(dict(white=word(w_, 'thmanyahsans-Black.ttf', sz, WHITE, sw), lit=word(w_, 'thmanyahsans-Black.ttf', sz, AMBER, sw), strong=word(w_, 'thmanyahsans-Black.ttf', sz, ORANGE, sw) if st else None))
            gap = int(size * 0.40) - 2 * (6 + 2 * max(4, size // 13)); rows = [[]]; cur = 0
            for i, im in enumerate(imgs):
                wd = im['white'].shape[1]
                if rows[-1] and cur + gap + wd > maxw: rows.append([]); cur = 0
                rows[-1].append(i); cur += wd + (gap if cur else 0)
            pos = {}; rh = int(size * 1.34); y0 = y - (len(rows) - 1) * rh / 2
            for r, row in enumerate(rows):
                tot = sum(imgs[i]['white'].shape[1] for i in row) + gap * (len(row) - 1); x = W / 2 + tot / 2
                for i in row:
                    wd = imgs[i]['white'].shape[1]; pos[i] = (x - wd / 2, y0 + r * rh); x -= wd + gap
            self.L.append(dict(a=a, b=b, words=ws, starts=starts, img=imgs, pos=pos))
        self.strong = [(L['starts'][i], L['pos'][i], L['img'][i]['white'].shape[1]) for L in self.L for i, (w_, s) in enumerate(L['words']) if s]
        self.sp = rng.uniform(0, 2 * np.pi, (len(self.strong), 14)); self.spv = rng.uniform(140, 360, (len(self.strong), 14))
    def fx(self, t):
        z = 0; sh = 0; fl = 0
        for st, _, _ in self.strong:
            d = t - st
            if 0 <= d < 0.45: z = max(z, 0.035 * bump(d / 0.45)); sh = max(sh, (1 - d / 0.3) * 4 if d < 0.3 else 0); fl = max(fl, (1 - d / 0.16) * 0.08 if d < 0.16 else 0)
        return z, sh, fl
    def draw(self, c, t):
        for L in self.L:
            a, b = L['a'], L['b']
            if not (a - 0.1 <= t < b + 0.35): continue
            out = ease((t - b) / 0.3) if t > b else 0.0; nexts = L['starts'][1:] + [b]
            for i, (w_, st) in enumerate(L['words']):
                ws = L['starts'][i]
                if t < ws: continue
                p = t - ws; x, y = L['pos'][i]; im = L['img'][i]
                if st:
                    s = 1 + 0.8 * (1 - ease(p / 0.22)); c = put(c, im['strong'], x, y - 30 * out, s, alpha=min(1, p / 0.08) * (1 - out), shadow=0.6, glow=(0.5 * np.exp(-p / 0.6) + 0.15) * (1 - out))
                    uw = im['strong'].shape[1] * 0.85 * ease((p - 0.12) / 0.3); yb = int(y + im['strong'].shape[0] * 0.38 - 30 * out)
                    if uw > 2 and out < 0.95: cv2.rectangle(c, (int(x - uw / 2), yb), (int(x + uw / 2), yb + 5), tuple(float(v) for v in AMBER), -1)
                else:
                    s = 0.6 + 0.4 * back(p / 0.24); dy = 22 * (1 - ease(p / 0.24)); lit = ws <= t < nexts[i] + 0.05
                    c = put(c, im['lit'] if lit else im['white'], x, y + dy - 30 * out, s, alpha=min(1, p / 0.1) * (1 - out), shadow=0.55)
        for k, (st, (x, y), wd) in enumerate(self.strong):
            d = t - st
            if 0 <= d < 0.6:
                x0, y0 = int(max(0, x - wd / 2 - 260)), int(max(0, y - 220)); x1, y1 = int(min(W, x + wd / 2 + 260)), int(min(H, y + 220)); m = np.zeros((y1 - y0, x1 - x0), np.float32)
                for j in range(14):
                    r = self.spv[k, j] * d; px = x + np.cos(self.sp[k, j]) * (r + wd * 0.3) - x0; py = y + np.sin(self.sp[k, j]) * r * 0.6 - y0
                    cv2.circle(m, (int(px * 4), int(py * 4)), int(8 * (1 - d / 0.6)) + 2, 1.0, -1, cv2.LINE_AA, shift=2)
                reg = c[y0:y1, x0:x1]; c[y0:y1, x0:x1] = reg + (SPARK - reg) * np.clip(cv2.GaussianBlur(m, (0, 0), 1.1) * (1 - d / 0.6), 0, 1)[..., None]
        return c
o = T0
CAPS = Captions([(o + a, o + b, t, [o + x for x in s] if s else None) for a, b, t, s in cfg['caps']], CAPY, cfg.get('csize', 60))
EVENTS = [o + x for x in cfg.get('events', [])]

# ---------------------------------------------------------------- source frames (segments of the source, cuts dissolve 0.15 s)
SEGS = cfg['segments']                                       # [[src_t0, src_t1], ...] in order
CLIP = sum(b - a for a, b in SEGS); BODY = T0 + CLIP; N = int(round(BODY * FPS))
VF = f"crop={cfg['crop']},scale={PW}:{PH}:flags=lanczos" + (',' + cfg['vf'] if cfg.get('vf') else '')
def reader(t0, dur):
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-ss', f'{t0:.3f}', '-t', f'{dur:.3f}', '-i', cfg['src'], '-vf', VF + f',fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(PW * PH * 3)
        if len(b) < PW * PH * 3: p.kill(); break
        yield np.frombuffer(b, np.uint8).reshape(PH, PW, 3).astype(np.float32)
def src_frames(i0, i1):
    """yields (i, frame, cut_age) for output frames i0..i1 (clip frames only, i >= T0*FPS)"""
    starts = np.cumsum([0] + [b - a for a, b in SEGS])
    i = max(i0, int(round(T0 * FPS))); last = None
    for k, (a, b) in enumerate(SEGS):
        s0, s1 = T0 + starts[k], T0 + starts[k + 1]
        if s1 * FPS <= i or s0 * FPS >= i1: continue
        off = max(0.0, i / FPS - s0)
        for f in reader(a + off, (b - a) - off + 0.2):
            if i >= i1 or i / FPS >= s1: break
            yield i, f, (i / FPS - s0 if k > 0 else 9.0), last; i += 1
        last = f
    while i < i1: yield i, last, 9.0, None; i += 1
ENV = None
def envelope(n):
    a, sr = sf.read(WK + NAME + '_voice.wav', dtype='float32'); a = a.mean(1) if a.ndim > 1 else a
    a = np.concatenate([np.zeros(int(T0 * sr), np.float32), a]); hop = sr // FPS
    e = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) if i * hop < len(a) else 0 for i in range(n)])
    e = np.clip(e / (np.percentile(e, 95) + 1e-6), 0, 1.2); k = np.exp(-np.arange(-6, 7) ** 2 / 18); return np.convolve(e, k / k.sum(), 'same')
COVER_F = None
def frame(t, f, cut_age, prev):
    env_i = min(len(ENV) - 1, int(t * FPS)); ang = float(ANG[env_i])
    c = STAGE.copy(); c = rings(c, t, ang); c = c * (1 - SHADOW * 0.55)
    if t < T0:
        p = t / T0; z = 1.0 + 0.03 * p; v = cv2.resize(COVER_F, None, fx=z, fy=z); oy, ox = (v.shape[0] - PH) // 2, (v.shape[1] - PW) // 2
        v = grade(v[oy:oy + PH, ox:ox + PW]) * 0.6 + NAVY * 0.4
    else:
        v = grade(f)
        if cut_age < 0.15 and prev is not None: k = cut_age / 0.15; v = grade(prev) * (1 - k) + v * k
        z, sh, _ = CAPS.fx(t)
        if z > 0.002:
            M = np.float32([[1 + z, 0, -PW * z / 2 + rng.uniform(-1, 1) * sh], [0, 1 + z, -PH * z / 2 + rng.uniform(-1, 1) * sh]]); v = cv2.warpAffine(v, M, (PW, PH), borderMode=cv2.BORDER_REFLECT)
        bl = smooth((t - (BODY - 1.0)) / 0.9) * 10
        if bl > 0.3: v = cv2.GaussianBlur(v, (0, 0), bl)
    c[PY0:PY0 + PH, PX0:PX0 + PW] = v
    c = lay(c, FRAME, AMBER, 0.9 * ease((t - 0.1) / 0.5)); c = dust(c, t)
    c = put(c, TITLE, W / 2, cfg.get('title_y', PY0 / 2), alpha=ease((t - T0 + 0.2) / 0.5), shadow=0.6)
    if t < T0 + 0.25:
        a = 1 - smooth((t - T0 + 0.05) / 0.3); c = put(c, BIG, W / 2, PCY - 20, 0.96 + 0.04 * min(1, t / T0), alpha=a, shadow=0.7)
        c = put(c, TAG, W / 2, PY0 + PH - 52, alpha=a, shadow=0.5)
    else:
        c = CAPS.draw(c, t); c = chevrons(c, t, EVENTS, 40, PCY)
    c = put(c, LOGO, *LOGOXY, alpha=0.92, shadow=0.3); c = put(c, CRED, W / 2 + 20, CREDY, alpha=ease((t - 0.2) / 0.5), shadow=0.2)
    _, _, fl = CAPS.fx(t); d = t - T0
    if -0.10 <= d < 0.18: c = c + (np.array([235, 245, 255], np.float32) - c) * (0.5 * (1 - abs(d) / 0.18))
    c = c + (255 - c) * fl
    return np.clip(c * VIG + GRAIN[int(t * FPS) % 4], 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- sound
SR = 48000
def clip(i, a=0.0, b=None):
    for p in SFXD:
        if os.path.exists(p + f'{i}.wav'):
            x, sr = sf.read(p + f'{i}.wav', dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
            if sr != SR: x = resample_poly(x, SR, sr).astype(np.float32)
            x = x[int(a * SR):(int(b * SR) if b else None)]; n = len(x); f = np.ones(n, np.float32); k1 = min(n // 4, int(0.015 * SR)); k2 = min(n // 3, int(0.08 * SR))
            f[:k1] = np.linspace(0, 1, k1); f[-k2:] = np.linspace(1, 0, k2); return x * f
    raise FileNotFoundError(i)
def bed(i, dur, a=0.0, fade=1.0):
    x = clip(i, a); n = int(dur * SR)
    while len(x) < n: x = np.concatenate([x, clip(i, a)])
    x = x[:n]; return x * np.minimum(1, np.arange(n) / (fade * SR)) * np.clip((n - np.arange(n)) / (fade * SR), 0, 1)
def loudnorm(src, dst, target=-14):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000", '-ac', '2', dst], check=True)
def make_voice():
    """the source sound for the kept segments (or its voice stem when the source has music), 25 ms joins, −14 LUFS"""
    a, sr = sf.read(cfg['voice_src'], dtype='float32'); a = a if a.ndim > 1 else a[:, None]; x = int(0.025 * sr); parts = []
    for a0, b0 in SEGS:
        p = a[int(a0 * sr):int(b0 * sr)].copy(); r = np.linspace(0, 1, x)[:, None]; p[:x] *= r; p[-x:] *= r[::-1]; parts.append(p)
    v = np.concatenate(parts); sf.write(WK + NAME + '_vraw.wav', v, sr)
    filt = cfg.get('voice_af')
    if filt: subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', WK + NAME + '_vraw.wav', '-af', filt, WK + NAME + '_vraw2.wav'], check=True); os.replace(WK + NAME + '_vraw2.wav', WK + NAME + '_vraw.wav')
    loudnorm(WK + NAME + '_vraw.wav', WK + NAME + '_voice.wav')
def mix():
    n = int(BODY * SR); v, sr = sf.read(WK + NAME + '_voice.wav', dtype='float32'); v = v.mean(1) if v.ndim > 1 else v
    V = np.zeros(n, np.float32); j = int(T0 * SR); V[j:j + len(v)] = v[:n - j]
    from scipy.ndimage import uniform_filter1d; env = np.sqrt(np.maximum(uniform_filter1d(V ** 2, int(0.25 * SR)), 0)); env = np.clip(env / (np.percentile(env[env > 0], 90) + 1e-6), 0, 1)
    fx = np.zeros(n, np.float32)
    def add(x, t, db):
        k = int(t * SR); m = min(len(x), n - k)
        if m > 0 and k >= 0: fx[k:k + m] += x[:m] * 10 ** (db / 20)
    for c_ in cfg['sfx']:                                     # [clip, from, to, time, dB, relative-to-clip (default true)]
        i, a, b, t, db = c_[:5]; rel = c_[5] if len(c_) > 5 else True; add(clip(i, a, b), (T0 + t) if rel else t, db)
    for i, a, db in cfg.get('beds', []): x = bed(i, BODY, a); add(x * (1 - 0.55 * env[:len(x)]), 0, db)
    fx = sosfilt(butter(2, 120 / (SR / 2), 'highpass', output='sos'), fx); fx = sosfilt(butter(2, 12000 / (SR / 2), 'lowpass', output='sos'), fx)
    L = int(0.6 * SR); ir = np.random.default_rng(3).standard_normal(L).astype(np.float32) * np.exp(-np.arange(L) / (0.14 * SR)); ir /= np.sqrt((ir ** 2).sum())
    fx = (fx * 0.88 + fftconvolve(fx, ir)[:n] * 0.18) * (1 - 0.35 * env); out = V + fx
    sf.write(WK + NAME + '_mixraw.wav', np.stack([out, out], 1), SR); loudnorm(WK + NAME + '_mixraw.wav', WK + NAME + '_mix.wav')

# ---------------------------------------------------------------- run
if MODE in ('render', 'still'):
    if not os.path.exists(WK + NAME + '_voice.wav'): make_voice()
    ENV = envelope(N); ANG = np.cumsum(5.0 / FPS + 24.0 * ENV / FPS)
    COVER_F = next(reader(cfg.get('cover_src_t', SEGS[0][0] + 1.0), 0.3))
if MODE == 'still':
    for t in [float(x) for x in sys.argv[3:]]:
        i = int(t * FPS)
        if t < T0: img = frame(t, None, 9, None)
        else:
            g = src_frames(i, i + 1); _, f, ca, pv = next(g); img = frame(t, f, ca, pv)
        cv2.imwrite(WK + f'{NAME}_still_{t:.1f}.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 90])
elif MODE == 'render':
    part, parts = int(sys.argv[3]), int(sys.argv[4]); i0 = N * part // parts; i1 = N * (part + 1) // parts
    enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
                            '-pix_fmt', 'yuv420p', WK + f'{NAME}_p{part}.mp4'], stdin=subprocess.PIPE)
    i = i0
    while i < min(i1, int(round(T0 * FPS))):
        enc.stdin.write(frame(i / FPS, None, 9, None).tobytes()); i += 1
    for k, f, ca, pv in src_frames(i, i1): enc.stdin.write(frame(k / FPS, f, ca, pv).tobytes())
    enc.stdin.close(); enc.wait(); print('part done', part)
elif MODE == 'finish':
    parts = int(sys.argv[3]); lst = WK + NAME + '_parts.txt'; open(lst, 'w').write(''.join(f"file '{WK}{NAME}_p{k}.mp4'\n" for k in range(parts)))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', WK + NAME + '_body.mp4'], check=True)
    mix(); os.makedirs(OUTD, exist_ok=True); XF = 0.6; outro = K + '04-intro-outro/outro-1080x1440.mp4'; out = OUTD + NAME + '.mp4'
    body = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', WK + NAME + '_body.mp4'], capture_output=True, text=True).stdout); off = body - XF
    od = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outro], capture_output=True, text=True).stdout)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + NAME + '_body.mp4', '-i', WK + NAME + '_mix.wav', '-i', outro, '-filter_complex',
        f'[0:v]setsar=1,fps=30,format=yuv420p,settb=1/30[m];[2:v]scale=1080:1440,crop=1080:1080:0:180,setsar=1,fps=30,format=yuv420p,settb=1/30[o];'
        f'[m][o]xfade=transition=fade:duration={XF}:offset={off:.3f},format=yuv420p[v];'
        f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={off + od:.3f}[va];'
        f'[2:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.5,adelay={int(off * 1000)}|{int(off * 1000)},volume=0.85[oa];[va][oa]amix=inputs=2:normalize=0:duration=first[a]',
        '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    cv = WK + NAME + '_cover.png'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '0.45', '-i', out, '-frames:v', '1', OUTD + NAME + '-cover.jpg'], check=True); print('ok', out)
