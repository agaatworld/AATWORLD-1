# «الثبات عز» — reels v2: cover card at the start, word-by-word captions with effects on the strong words,
# context sound effects (no music): wind / sea / air / lens / soft impacts, ducked under the voice.
# usage: python3 fbreel2.py v1|v2|v3 [still t ...]
import numpy as np, cv2, json, subprocess, sys, os, re, soundfile as sf
from PIL import Image, ImageDraw, ImageFont
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
WK = S_ + 'fb4/work/'; TH = S_ + 'taiz/fonts/th/'; K = '/home/user/final/brand-kit/'; KA = '/home/user/final/kahlani/assets/'
OUTD = '/home/user/final/fb-edits/'; SFXD = [S_ + 'sfx/s', S_ + 'sfx2/m', S_ + 'sfx3/m']
W, H, FPS = 1080, 1920, 30
NAVY = np.array([45, 27, 15], np.float32); STEEL = np.array([104, 74, 46], np.float32); AMBER = np.array([65, 165, 242], np.float32)
WHITE = np.array([216, 233, 244], np.float32); ORANGE = np.array([61, 138, 255], np.float32)
SAFE_T, SAFE_B, SAFE_R, SAFE_L = 270, 1500, 960, 60
CX = (SAFE_L + SAFE_R) / 2
T0 = 0.8                                                     # cover card before the clip starts
VID = sys.argv[1]; STILLS = [float(x) for x in sys.argv[2:]]
rng = np.random.default_rng(11); yy, xx = np.mgrid[:H, :W].astype(np.float32)

# ---------------------------------------------------------------- drawing helpers
def F(n, s): return ImageFont.truetype(TH + n, s, layout_engine=ImageFont.Layout.RAQM)
def to_f(im):
    a = np.array(im).astype(np.float32); a[..., :3] = a[..., :3][..., ::-1].copy(); a[..., 3] /= 255; return a
def word(w, font, size, col, stroke=0, scol=(10, 16, 28)):
    f = F(font, size); asc, desc = f.getmetrics(); pad = 6 + stroke * 2
    tw = int(f.getlength(w, direction='rtl', language='ar')) + 2 * pad; hh = int((asc + desc) * 1.15) + 2 * pad
    im = Image.new('RGBA', (tw, hh), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((tw - pad, pad), w, font=f, fill=tuple(int(x) for x in col[::-1]) + (255,), anchor='ra',
                            direction='rtl', language='ar', stroke_width=stroke, stroke_fill=scol + (255,))
    return to_f(im)
def line(runs, font, size, stroke=0, gap=None):
    ims = [word(t, font, size, c, stroke) for t, c in runs]; pad = 6 + stroke * 2; g = int(size * 0.26) - 2 * pad if gap is None else gap
    tw = sum(i.shape[1] for i in ims) + g * (len(ims) - 1); hh = max(i.shape[0] for i in ims)
    out = np.zeros((hh, tw, 4), np.float32); x = tw
    for i in ims:
        x -= i.shape[1]; o = out[:i.shape[0], x:x + i.shape[1]]; a = i[..., 3:]
        o[..., :3] = o[..., :3] * (1 - a) + i[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a); x -= g
    return out
def stack(lines, step):
    Wm = max(l.shape[1] for l in lines); out = np.zeros((step * (len(lines) - 1) + lines[-1].shape[0], Wm, 4), np.float32)
    for k, l in enumerate(lines):
        y = k * step; x = (Wm - l.shape[1]) // 2; o = out[y:y + l.shape[0], x:x + l.shape[1]]; a = l[..., 3:]
        o[..., :3] = o[..., :3] * (1 - a) + l[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a)
    return out
def put(c, img, cx, cy, s=1.0, alpha=1.0, shadow=0.5, blur=0.0):
    if alpha <= 0.01 or s <= 0.01: return c
    h, w = img.shape[:2]; M = np.float32([[s, 0, cx - w * s / 2], [0, s, cy - h * s / 2]])
    rgba = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    if blur > 0.3: rgba = cv2.GaussianBlur(rgba, (0, 0), blur)
    a = rgba[..., 3:] * alpha
    if shadow > 0:
        sh = np.roll(np.roll(cv2.GaussianBlur(rgba[..., 3], (0, 0), 8), 6, 0), 2, 1)[..., None] * shadow * alpha
        c = c * (1 - sh) + NAVY * 0.35 * sh
    return c * (1 - a) + rgba[..., :3] * a
def ease(x): x = float(np.clip(x, 0, 1)); return 1 - (1 - x) ** 3
def back(x, s=2.0): x = float(np.clip(x, 0, 1)); return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2
def smooth(x): x = float(np.clip(x, 0, 1)); return x * x * (3 - 2 * x)
def bump(x): return float(np.sin(np.pi * np.clip(x, 0, 1)))
def lay(c, mask, col, a): return c + (col - c) * (np.clip(mask, 0, 1) * a)[..., None]

# ---------------------------------------------------------------- shared layers
def make_stage(glow=(540, 880)):
    g = np.clip(1 - np.hypot((xx - glow[0]) / 760, (yy - glow[1]) / 980), 0, 1) ** 1.6
    c = NAVY[None, None] + (STEEL - NAVY)[None, None] * (g[..., None] * 0.55)
    c = c * (0.86 + 0.14 * (1 - yy / H))[..., None]
    t = cv2.imread(KA + 'topo.png', -1); t = cv2.resize(t, (1600, 1600))[:, 260:1340]; t = np.vstack([t, t])[:H]
    return lay(c, t[..., 3].astype(np.float32) / 255, AMBER, 0.05)
VIG = (1 - 0.30 * np.clip(np.hypot((xx - W / 2) / (W * 0.72), (yy - H / 2) / (H * 0.6)) - 0.5, 0, 1))[..., None]
GRAIN = [cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)[..., None] * 2.6 for _ in range(4)]
LOGO = cv2.resize(cv2.imread(K + '01-logo/logo-dark-round-256.png', -1).astype(np.float32), (96, 96), interpolation=cv2.INTER_AREA); LOGO[..., 3] /= 255
def credit_img(txt):
    f = F('thmanyahsans-Bold.ttf', 28); t = 'المصدر: ' + txt; tw = int(f.getlength(t, direction='rtl', language='ar')) + 44; th = 52
    im = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, tw - 1, th - 1), th // 2, fill=(15, 27, 45, 215), outline=(46, 74, 104, 255), width=2)
    d.text((tw - 22, th // 2 + 1), t, font=f, fill=(168, 179, 193, 255), anchor='rm', direction='rtl', language='ar')
    return to_f(im)
def tag_img(txt, size=38):
    f = F('thmanyahsans-Black.ttf', size); tw = int(f.getlength(txt, direction='rtl', language='ar')) + 56; th = int(size * 1.75)
    im = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, tw - 1, th - 1), 10, fill=(15, 27, 45, 235), outline=(242, 165, 65, 255), width=3)
    d.text((tw - 28, th // 2 + 1), txt, font=f, fill=(244, 233, 216, 255), anchor='rm', direction='rtl', language='ar')
    return to_f(im)
TAG = tag_img('كلنا مقاومة')
CREDY = SAFE_B - 44; LOGOXY = (SAFE_L + 52, SAFE_B - 44)
NP = 46; PX = rng.uniform(0, W, NP); PY = rng.uniform(0, H, NP); PV = rng.uniform(10, 30, NP); PS = rng.uniform(1.2, 2.8, NP); PP = rng.uniform(0, 6.28, NP)
def dust(c, t, keep, amt=0.09):
    m = np.zeros((H, W), np.float32)
    for i in range(NP):
        x = (PX[i] + 16 * np.sin(t * 0.5 + PP[i])) % W; y = (PY[i] - PV[i] * t) % H; a = 0.6 + 0.4 * np.sin(t * 1.5 + PP[i])
        cv2.circle(m, (int(x * 4), int(y * 4)), int(PS[i] * 4), float(a), -1, cv2.LINE_AA, shift=2)
    return lay(c, cv2.GaussianBlur(m, (0, 0), 1.4) * keep * 3.0, np.array([120, 200, 255], np.float32), amt * 4)
def rings(c, t, cx, cy, r, angle_of, keep=None, amt=1.0):
    draw = ease(t / 1.3); ang = angle_of(t); m1 = np.zeros((H, W), np.float32); m2 = np.zeros((H, W), np.float32); s = 8; sweep = 360 * draw
    if sweep > 0.5:
        cv2.ellipse(m1, (int(cx * s), int(cy * s)), (int(r * s), int(r * s)), 0, -90 + ang, -90 + ang + sweep, 1.0, 3, cv2.LINE_AA, shift=3)
        for k in range(60):
            if k * 6 > sweep: break
            a0 = -ang * 1.6 + k * 6; cv2.ellipse(m2, (int(cx * s), int(cy * s)), (int((r + 24) * s), int((r + 24) * s)), 0, a0, a0 + 2.6, 1.0, 2, cv2.LINE_AA, shift=3)
        for k in range(4):
            if k * 90 > sweep: break
            a = np.deg2rad(-90 + ang + k * 90); cv2.circle(m2, (int((cx + np.cos(a) * r) * s), int((cy + np.sin(a) * r) * s)), int(5 * s), 1.0, -1, cv2.LINE_AA, shift=3)
    if keep is not None: m1 = m1 * keep; m2 = m2 * keep
    return lay(lay(c, m1, STEEL * 1.25, 0.85 * amt), m2, AMBER, 0.6 * amt)
def chevrons(c, t, events, x, y):
    for te in events:
        d = t - te
        if not (0 <= d < 1.9): continue
        al = min(1.0, d / 0.25) * (1 - smooth((d - 1.3) / 0.6)); m = np.zeros((H, W), np.float32)
        for k in range(3):
            p = ease((d - k * 0.08) / 0.45); x0 = x + (k * 22 - 34 * (1 - p)); a = al * (0.45 + 0.55 * p) * (1 - k * 0.22)
            pts = np.array([[x0 - 9, y - 16], [x0 + 7, y], [x0 - 9, y + 16]], np.float32) * 8
            cv2.polylines(m, [pts.astype(np.int32)], False, float(a), 4, cv2.LINE_AA, shift=3)
        c = lay(c, m, AMBER, 0.95)
    return c
def frame_lines(c, x0, y0, x1, y1, a=1.0, br=58):
    m = np.zeros((H, W), np.float32); s = 8
    cv2.rectangle(m, (int(x0 * s), int(y0 * s)), (int(x1 * s), int(y1 * s)), 0.6, 2, cv2.LINE_AA, shift=3)
    for (x, y, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        x, y = x - dx * 10, y - dy * 10
        cv2.line(m, (int(x * s), int(y * s)), (int((x + dx * br) * s), int(y * s)), 1.0, 4, cv2.LINE_AA, shift=3)
        cv2.line(m, (int(x * s), int(y * s)), (int(x * s), int((y + dy * br) * s)), 1.0, 4, cv2.LINE_AA, shift=3)
    return lay(c, m, AMBER, 0.9 * a)
def grade(v):
    lum = v.mean(-1, keepdims=True) / 255; v = v * (1 - 0.12 * (1 - lum)) + NAVY * 0.12 * (1 - lum)
    return v + (WHITE - v) * 0.05 * lum ** 2
def envelope(wav, n, t0=0.0):
    a, sr = sf.read(wav, dtype='float32'); a = a.mean(1) if a.ndim > 1 else a
    a = np.concatenate([np.zeros(int(t0 * sr), np.float32), a]); hop = sr // FPS
    e = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) if i * hop < len(a) else 0 for i in range(n)])
    e = np.clip(e / (np.percentile(e, 95) + 1e-6), 0, 1.2); k = np.exp(-np.arange(-6, 7) ** 2 / 18); return np.convolve(e, k / k.sum(), 'same')
def angle_fn(env):
    cum = np.cumsum(5.0 / FPS + 26.0 * env / FPS); return lambda t: float(cum[min(len(cum) - 1, max(0, int(t * FPS)))])
def reader(src, vf, w, h, t0=0, dur=None):
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-ss', str(t0)] + (['-t', str(dur)] if dur else []) + ['-i', src, '-vf', vf + f',fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(w * h * 3)
        if len(b) < w * h * 3: p.kill(); break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3).astype(np.float32)
def grab(src, t, vf, w, h): return next(reader(src, vf, w, h, t, 0.2))

# ---------------------------------------------------------------- captions: word by word; strong words slam in orange
class Captions:
    def __init__(self, chunks, y, size, maxw=None):
        """chunks: [(a, b, text, starts)] — text uses [[...]] for strong words; starts = word start times (or None: spread)"""
        self.L = []; self.size = size; self.y = y; maxw = maxw or (SAFE_R - SAFE_L - 40)
        for a, b, txt, starts in chunks:
            ws = []
            for part in re.split(r'(\[\[.*?\]\])', txt):
                if not part.strip(): continue
                st = part.startswith('[[')
                for w_ in (part[2:-2] if st else part).split(): ws.append((w_, st))
            if not starts or len(starts) != len(ws):
                Ls = [len(w_) for w_, _ in ws]; cum = np.cumsum([0] + Ls[:-1]) / max(1, sum(Ls)); s1 = a + (b - a) * 0.55; starts = [a + (s1 - a) * c for c in cum]
            starts = [max(a, min(s, b - 0.08)) for s in starts]
            imgs = []
            for w_, st in ws:
                sz = int(size * (1.22 if st else 1)); sw = max(4, sz // 13)
                imgs.append(dict(white=word(w_, 'thmanyahsans-Black.ttf', sz, WHITE, sw), lit=word(w_, 'thmanyahsans-Black.ttf', sz, AMBER, sw),
                                 strong=word(w_, 'thmanyahsans-Black.ttf', sz, ORANGE, sw) if st else None))
            gap = int(size * 0.40) - 2 * (6 + 2 * max(4, size // 13)); rows = [[]]; cur = 0
            for i, im in enumerate(imgs):
                wd = im['white'].shape[1]
                if rows[-1] and cur + gap + wd > maxw: rows.append([]); cur = 0
                rows[-1].append(i); cur += wd + (gap if cur else 0)
            pos = {}; rh = int(size * 1.32); y0 = y - (len(rows) - 1) * rh / 2
            for r, row in enumerate(rows):
                tot = sum(imgs[i]['white'].shape[1] for i in row) + gap * (len(row) - 1); x = CX + tot / 2
                for i in row:
                    wd = imgs[i]['white'].shape[1]; pos[i] = (x - wd / 2, y0 + r * rh); x -= wd + gap
            self.L.append(dict(a=a, b=b, words=ws, starts=starts, img=imgs, pos=pos))
        self.strong = [(L['starts'][i], L['pos'][i], L['img'][i]['white'].shape[1]) for L in self.L for i, (w_, s) in enumerate(L['words']) if s]
        self.spark = rng.uniform(0, 2 * np.pi, (len(self.strong), 16)); self.spv = rng.uniform(160, 420, (len(self.strong), 16))
    def fx(self, t):
        """picture punch (zoom), shake and flash from the strong words"""
        z = 0; sh = 0; fl = 0
        for st, _, _ in self.strong:
            d = t - st
            if 0 <= d < 0.45: z = max(z, 0.04 * bump(d / 0.45)); sh = max(sh, (1 - d / 0.3) * 5 if d < 0.3 else 0); fl = max(fl, (1 - d / 0.16) * 0.10 if d < 0.16 else 0)
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
                    s = 1 + 0.85 * (1 - ease(p / 0.22)); al = min(1, p / 0.08)
                    c = put(c, im['strong'], x, y - 36 * out, s, alpha=al * (1 - out), shadow=0.6)
                    g = cv2.GaussianBlur(cv2.warpAffine(im['strong'][..., 3], np.float32([[s, 0, x - im['strong'].shape[1] * s / 2], [0, s, y - 36 * out - im['strong'].shape[0] * s / 2]]), (W, H)), (0, 0), 14)
                    c = c + (ORANGE - c) * (np.clip(g * 1.6, 0, 1) * (0.5 * np.exp(-p / 0.6) + 0.15) * (1 - out))[..., None] * 0.6
                    uw = im['strong'].shape[1] * 0.85 * ease((p - 0.12) / 0.3)
                    if uw > 2:
                        yb = y + im['strong'].shape[0] * 0.40 - 36 * out
                        cv2.rectangle(c, (int(x - uw / 2), int(yb)), (int(x + uw / 2), int(yb + 6)), tuple(float(v) for v in AMBER * (1 - out) + c[int(min(H - 1, yb)), int(x)] * out), -1)
                else:
                    s = 0.6 + 0.4 * back(p / 0.24); dy = 24 * (1 - ease(p / 0.24)); lit = ws <= t < nexts[i] + 0.05
                    c = put(c, im['lit'] if lit else im['white'], x, y + dy - 36 * out, s, alpha=min(1, p / 0.1) * (1 - out), shadow=0.55)
        for k, (st, (x, y), wd) in enumerate(self.strong):
            d = t - st
            if 0 <= d < 0.7:
                m = np.zeros((H, W), np.float32)
                for j in range(16):
                    r = self.spv[k, j] * d; px = x + np.cos(self.spark[k, j]) * (r + wd * 0.3); py = y + np.sin(self.spark[k, j]) * r * 0.6
                    cv2.circle(m, (int(px * 4), int(py * 4)), int(9 * (1 - d / 0.7)) + 2, 1.0, -1, cv2.LINE_AA, shift=2)
                c = c + (np.array([120, 200, 255], np.float32) - c) * np.clip(cv2.GaussianBlur(m, (0, 0), 1.2) * (1 - d / 0.7), 0, 1)[..., None]
        return c
def chunk(a, b, text, starts=None): return (a, b, text, starts)

# ---------------------------------------------------------------- sound: library foley, ducked under the voice, no music
SR = 48000
def clip(i, a=0.0, b=None, rate=1.0):
    for p in SFXD:
        if os.path.exists(p + f'{i}.wav'):
            x, sr = sf.read(p + f'{i}.wav', dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
            if sr != SR: x = resample_poly(x, SR, sr).astype(np.float32)
            x = x[int(a * SR):(int(b * SR) if b else None)]
            if rate != 1.0: x = resample_poly(x, 100, int(round(100 * rate))).astype(np.float32)
            n = len(x); f = np.ones(n, np.float32); k1 = min(n // 4, int(0.015 * SR)); k2 = min(n // 3, int(0.08 * SR))
            f[:k1] = np.linspace(0, 1, k1); f[-k2:] = np.linspace(1, 0, k2); return x * f
    raise FileNotFoundError(i)
def bed(i, dur, a=0.0, fade=0.8):
    x = clip(i, a); n = int(dur * SR)
    while len(x) < n: x = np.concatenate([x, clip(i, a)])
    x = x[:n]; e = np.minimum(1, np.arange(n) / (fade * SR)) * np.clip((n - np.arange(n)) / (fade * SR), 0, 1); return x * e
def mix(name, voice_n, total, voice_t0, cues, beds):
    """voice (already −14 LUFS) starts at voice_t0; cues: (clip, t, dB); beds: (array, dB) ducked under speech; result normalised to −14 LUFS"""
    n = int(total * SR); v, sr = sf.read(voice_n, dtype='float32'); v = v.mean(1) if v.ndim > 1 else v
    V = np.zeros(n, np.float32); j = int(voice_t0 * SR); V[j:j + len(v)] = v[:n - j]
    env = np.sqrt(np.convolve(V ** 2, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')); env = np.clip(env / (np.percentile(env[env > 0], 90) + 1e-6), 0, 1)
    fx = np.zeros(n, np.float32)
    def add(x, t, db):
        k = int(t * SR); m = min(len(x), n - k)
        if m > 0 and k >= 0: fx[k:k + m] += x[:m] * 10 ** (db / 20)
    for x, t, db in cues: add(x, t, db)
    for x, db in beds: add(x * (1 - 0.55 * env[:len(x)]), 0, db)
    fx = sosfilt(butter(2, 120 / (SR / 2), 'highpass', output='sos'), fx)                      # no heavy bass
    fx = sosfilt(butter(2, 12000 / (SR / 2), 'lowpass', output='sos'), fx)
    L = int(0.6 * SR); ir = np.random.default_rng(3).standard_normal(L).astype(np.float32) * np.exp(-np.arange(L) / (0.14 * SR)); ir /= np.sqrt((ir ** 2).sum())
    fx = fx * 0.88 + fftconvolve(fx, ir)[:n] * 0.18
    fx = fx * (1 - 0.35 * env)                                                                   # the voice always on top
    out = V + fx; sf.write(WK + name + '_mixraw.wav', np.stack([out, out], 1), SR)
    loudnorm(WK + name + '_mixraw.wav', WK + name + '_mix.wav'); return WK + name + '_mix.wav'
def loudnorm(src, dst, target=-14):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000", '-ac', '2', dst], check=True)

# ---------------------------------------------------------------- output
def finish(name, body_v, audio, body_dur, cover):
    os.makedirs(OUTD, exist_ok=True); XF = 0.6; outro = K + '04-intro-outro/outro-vertical-1080x1920.mp4'; out = OUTD + name + '.mp4'; off = body_dur - XF
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', body_v, '-i', audio, '-i', outro, '-filter_complex',
        f'[0:v]setsar=1,fps=30,format=yuv420p,settb=1/30[m];[2:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p,settb=1/30[o];'
        f'[m][o]xfade=transition=fade:duration={XF}:offset={off:.3f},format=yuv420p[v];'
        f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={off + 4.63:.3f}[va];'
        f'[2:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.5,adelay={int(off * 1000)}|{int(off * 1000)},volume=0.85[oa];'
        f'[va][oa]amix=inputs=2:normalize=0:duration=first[a]',
        '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    cv2.imwrite(OUTD + name + '-cover.jpg', np.clip(cover, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93]); print('ok', out)
def run(fr, n, name, audio_fn, body_dur, stream=None):
    """fr(t, f, cover=False); t = output time (cover card 0–T0, clip after); stream yields the clip's frames from T0"""
    src = stream() if stream else None
    if STILLS:
        got = {}; last = None
        for i in range(n):
            t = i / FPS; f = None
            if src is not None and t >= T0:
                f = next(src, None)
                if f is None: f = last
                last = f
            for w in STILLS:
                if w not in got and t >= w: got[w] = (t, f)
            if len(got) == len(STILLS): break
        for w in STILLS: cv2.imwrite(WK + f'{name}_{w:.1f}.jpg', np.clip(fr(*got[w]), 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
        return
    enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', WK + name + '_body2.mp4'], stdin=subprocess.PIPE)
    last = None; cover = None
    for i in range(n):
        t = i / FPS; f = None
        if src is not None and t >= T0:
            f = next(src, None)
            if f is None: f = last
            last = f
        img = fr(t, f); enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
        if cover is None and t >= T0 * 0.5: cover = img
    enc.stdin.close(); enc.wait(); finish(name, WK + name + '_body2.mp4', audio_fn(), body_dur, cover)
def cover_fx(c, t):
    """the cover card opens with a lens flash into the clip"""
    d = t - T0
    if -0.10 <= d < 0.18: c = c + (np.array([235, 245, 255], np.float32) - c) * (0.55 * (1 - abs(d + 0.0) / 0.18))
    return c

# ================================================================ VIDEO 1
def v1():
    name = '01-umm-taiz-mansoorin'; seq = WK + 'e1/seq.mp4'; voice = WK + 'v1_voice.wav'
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', seq], capture_output=True, text=True).stdout)
    body = T0 + dur; n = int(round(body * FPS))
    PW, PH = 900, 1011; PX0, PY0 = 90, 382; PCX, PCY = PX0 + PW / 2, PY0 + PH / 2
    env = envelope(voice, n, T0); ang = angle_fn(env); stage = make_stage(glow=(PCX, PCY))
    keep = np.ones((H, W), np.float32); keep[PY0 - 6:PY0 + PH + 6, PX0 - 6:PX0 + PW + 6] = 0
    shadow = cv2.GaussianBlur(((xx > PX0) & (xx < PX0 + PW) & (yy > PY0) & (yy < PY0 + PH)).astype(np.float32), (0, 0), 22)
    title = line([('والله', WHITE), ('إن', WHITE), ('احنا', WHITE), ('منصورين', ORANGE)], 'thmanyahserifdisplay-Black.ttf', 70)
    big = stack([line([('والله', WHITE), ('إن', WHITE), ('احنا', WHITE)], 'thmanyahserifdisplay-Black.ttf', 104, stroke=6),
                 line([('منصورين', ORANGE)], 'thmanyahserifdisplay-Black.ttf', 150, stroke=7)], 128)
    cred = credit_img('فهيم المخلافي')
    cov_bg = grab(seq, 5.6, f'scale={PW}:{PH}:flags=lanczos', PW, PH)
    o = T0                                                               # captions: only the lines heard clearly (the rest is unclear dialect)
    caps = Captions([chunk(o + 0.00, o + 0.90, 'إيه بابا.. والله', [o + 0.0, o + 0.56, o + 0.84]),
                     chunk(o + 0.90, o + 2.44, 'والله شتقاتلي [[الحوثي]]', [o + 0.90, o + 1.68, o + 2.10]),
                     chunk(o + 2.44, o + 3.48, 'ان شاء الله العظيم', [o + 2.44, o + 2.62, o + 2.80, o + 3.10]),
                     chunk(o + 3.48, o + 4.32, 'إنّا شقاتل [[الحوثي]]', [o + 3.48, o + 3.60, o + 4.00]),
                     chunk(o + 4.32, o + 5.54, 'والله إن احنا [[منصورين]]', [o + 4.32, o + 4.82, o + 4.98, o + 5.20]),
                     chunk(o + 5.54, o + 6.38, 'والله واللي خلقك', [o + 5.54, o + 5.80, o + 6.04]),
                     chunk(o + 7.32, o + 7.98, 'الله أكبر ولله الحمد', [o + 7.32, o + 7.50, o + 7.64, o + 7.80]),
                     chunk(o + 7.98, o + 9.40, '[[الله أكبر ولله الحمد]]', [o + 7.98, o + 8.26, o + 8.60, o + 8.90])], 1268, 70, maxw=820)
    events = [o + x for x in (0.0, 0.9, 2.44, 4.32, 5.54, 7.32)]
    def fr(t, f, cover=False):
        c = stage.copy(); c = rings(c, max(0.0, t), PCX, PCY, 512, ang, keep=keep); c = c * (1 - shadow[..., None] * 0.55)
        if t < T0:                                                        # cover card
            p = t / T0; z = 1.0 + 0.03 * p; v = cv2.resize(cov_bg, None, fx=z, fy=z); oy, ox = (v.shape[0] - PH) // 2, (v.shape[1] - PW) // 2
            v = grade(v[oy:oy + PH, ox:ox + PW]) * 0.62 + NAVY * 0.38
        else:
            z, sh, _ = caps.fx(t); v = grade(f)
            if z > 0.002:
                M = np.float32([[1 + z, 0, -PW * z / 2 + rng.uniform(-1, 1) * sh], [0, 1 + z, -PH * z / 2 + rng.uniform(-1, 1) * sh]]); v = cv2.warpAffine(v, M, (PW, PH), borderMode=cv2.BORDER_REFLECT)
        c[PY0:PY0 + PH, PX0:PX0 + PW] = v
        c = frame_lines(c, PX0, PY0, PX0 + PW, PY0 + PH, ease((t - 0.1) / 0.5)); c = dust(c, t, keep)
        c = put(c, title, W / 2, SAFE_T + 52, alpha=ease((t - T0 + 0.2) / 0.5), shadow=0.6)
        if t < T0 + 0.25:
            a = 1 - smooth((t - T0 + 0.05) / 0.3); c = put(c, big, W / 2, PCY + 40, 0.96 + 0.04 * t / T0, alpha=a, shadow=0.7); c = put(c, TAG, W / 2, PY0 + PH - 80, alpha=a, shadow=0.5)
        else:
            c = caps.draw(c, t); c = chevrons(c, t, events, 42, PCY)
        c = put(c, LOGO, *LOGOXY, alpha=0.92, shadow=0.3); c = put(c, cred, W / 2 + 30, CREDY, alpha=ease((t - 0.2) / 0.5), shadow=0.2)
        _, _, fl = caps.fx(t); c = cover_fx(c, t) + (255 - c) * fl
        return c * VIG + GRAIN[int(t * FPS) % 4]
    def audio():
        cues = [(clip(1436, 0.08, 0.6), 0.02, -18),                                # lens opens on the cover
                (clip(1474, 0.45, 1.9), 0.10, -21),                                # the title arrives on a windy swoosh
                (clip(1433, 0.0, 0.45), T0 - 0.03, -12),                           # shutter: into the clip
                (clip(1461), o + 0.0, -25), (clip(166), o + 2.44, -26), (clip(1489, 0, 1.2), o + 5.54, -27),   # soft air as lines arrive (all different)
                (clip(498, 0, 2.2), o + 5.20, -19),                                # «منصورين»: a deep, soft heart-beat impact
                (clip(1143, 0.1, 2.6), o + 7.95, -22),                             # «الله أكبر»: low cinematic air impact
                (clip(1437, 0.75, 1.15), 0.35, -24)]                               # the frame focuses
        beds = [(bed(1267, body, 2.0), -30)]                                       # mountain-top wind under her outdoor sound
        return mix(name, voice, body, T0, cues, beds)
    stream = lambda: reader(seq, f'scale={PW}:{PH}:flags=lanczos', PW, PH)
    run(fr, n, name, audio, body, stream)

# ================================================================ VIDEO 2
def v2():
    name = '02-raed-alkahlani-sanuqawim'; voice = WK + 'v2_voice.wav'; AUD_END = 17.88
    body = T0 + AUD_END + 0.6; n = int(body * FPS); o = T0
    env = envelope(voice, n, T0); ang = angle_fn(env)
    A = json.load(open(WK + 'a2.json')); AW = [(w[0], w[1]) for s in A for w in s['words']]
    def st(a, b, k): ws = [x[1] for x in AW if a - 0.15 <= x[1] < b - 0.05]; return [o + x for x in ws] if len(ws) == k else None
    raw = [(0.97, 1.80, 'والذي لا إله'), (2.03, 2.50, 'غيره'), (3.17, 3.73, 'لن [[تمرّوا]]'), (4.53, 5.43, 'إلا على [[جثتنا]]'), (6.23, 6.80, 'نحن على [[حق]]'),
           (7.17, 7.87, 'وأنتم على [[باطل]]'), (8.93, 10.20, '[[سنقاوم]] [[سنقاتل]]'), (10.87, 11.53, 'مهما دمّرتم'), (11.90, 12.57, 'مهما أحرقتم'),
           (13.20, 14.00, 'مهما قتلتم من الأطفال'), (14.27, 14.67, 'ومن النساء'), (15.30, 16.00, 'نحن [[صامدون]]'), (16.90, 17.47, 'نحن [[شهداء]]'), (17.77, 18.17, 'بإذن الله')]
    caps = Captions([chunk(o + a, o + b, t, st(a, b, len(t.replace('[[', '').replace(']]', '').split()))) for a, b, t in raw], 1222, 74)
    cut = cv2.imread(KA + 'portrait_cut.png', -1).astype(np.float32); cut[..., 3] /= 255
    al = cut[..., 3]; er = cv2.erode(al, np.ones((7, 7), np.uint8)); right = np.clip((np.arange(al.shape[1])[None, :] - 930) / 60, 0, 1); al = al * (1 - right) + er * right
    al[1060:, 1030:] *= np.clip((1060 - np.arange(1030, al.shape[1])[None, :] + 30 * 0) / 30 + (1030 + 30 - 1060) / 30, 0, 1) * 0 + np.clip((1060 - np.arange(1030, al.shape[1])[None, :]) / 30, 0, 1)
    bl = cv2.GaussianBlur(al, (0, 0), 9); zone = np.zeros_like(al); zone[980:, 960:] = 1; zone = cv2.GaussianBlur(zone, (0, 0), 25); al = al * (1 - zone) + np.minimum(al, bl) * zone
    edge = ((al > 0.02) & (al < 0.95)).astype(np.float32) * right; cut[..., :3] *= (1 - 0.3 * edge)[..., None]; cut[..., 3] = al
    s = 0.78; cw, ch = int(cut.shape[1] * s), int(cut.shape[0] * s); cut = cv2.resize(cut, (cw, ch), interpolation=cv2.INTER_AREA); CX0, CY0 = 540 - 790 * s, 392
    fade = np.clip((np.arange(ch)[:, None] + CY0 - 1180) / 300, 0, 1); cut[..., 3] *= (1 - fade) ** 1.2; cut[..., :3] = grade(cut[..., :3])
    f = F('thmanyahsans-Black.ttf', 400); bb = f.getbbox('18/11'); dw = bb[2] - bb[0] + 40; dh = bb[3] - bb[1] + 30
    im = Image.new('L', (dw, dh), 0); ImageDraw.Draw(im).text((20 - bb[0], 15 - bb[1]), '18/11', font=f, fill=255); dm = np.array(im).astype(np.float32) / 255
    gy = np.linspace(0, 1, dh)[:, None]; date = np.zeros((dh, dw, 4), np.float32)
    for k in range(3): date[..., k] = (WHITE[k] * (1 - gy) * 0.92 + STEEL[k] * gy) * np.ones_like(dm)
    date[..., 3] = dm * (1 - 0.75 * gy); DCX, DCY = 540, SAFE_T + 30 + dh / 2
    stage = make_stage(glow=(540, 760))
    yr = line([('2026', WHITE)], 'thmanyahsans-Light.ttf', 46); rise = line([('ارتقى', WHITE), ('شهيداً', WHITE)], 'thmanyahsans-Bold.ttf', 34)
    rank = line([('الشهيد', AMBER), ('النقيب', AMBER)], 'thmanyahsans-Bold.ttf', 32)
    nm1 = line([('رائد', WHITE)], 'thmanyahserifdisplay-Black.ttf', 54); nm2 = line([('الكحلاني', WHITE)], 'thmanyahserifdisplay-Black.ttf', 54)
    big = stack([line([('سنقاوم..', ORANGE)], 'thmanyahsans-Black.ttf', 120, stroke=7), line([('سنقاتل', WHITE)], 'thmanyahsans-Black.ttf', 120, stroke=7)], 132)
    cred = credit_img('مقدام الدباء')
    keep = np.clip(np.hypot((xx - 540) / 330, (yy - 640) / 300) - 0.85, 0, 1); BOT = np.clip((yy - 1160) / 330, 0, 1) ** 1.2 * 0.9
    events = [o + x for x in (0.97, 6.23, 8.93, 15.30)]
    def wave(c, t):
        m = np.zeros((H, W), np.float32); ma = np.zeros((H, W), np.float32); i = int(t * FPS); y = 1058; N = 46
        for k in range(N):
            x = 540 + (k - N / 2 + 0.5) * 17; dist = abs(k - N / 2 + 0.5) / (N / 2); e = env[min(len(env) - 1, max(0, i - int(dist * 6)))]
            hgt = 4 + 70 * e * (1 - dist ** 1.5) * (0.6 + 0.4 * np.sin(k * 1.7 + t * 9) ** 2)
            cv2.line(ma if dist < 0.18 else m, (int(x * 8), int((y - hgt / 2) * 8)), (int(x * 8), int((y + hgt / 2) * 8)), 1.0, 5, cv2.LINE_AA, shift=3)
        return lay(lay(c, m, WHITE, 0.7), ma, AMBER, 0.95)
    def fr(t, f=None, cover=False):
        c = stage.copy(); p = t / body; z, sh, _ = caps.fx(t)
        c = put(c, date, DCX, DCY + 6 * p, 1.0 + 0.025 * p, alpha=ease((t - 0.05) / 0.7), shadow=0.0)
        c = rings(c, t, 540, 640, 205, ang, amt=0.9)
        dx, dy = (rng.uniform(-1, 1) * sh, rng.uniform(-1, 1) * sh) if sh > 0 else (0, 0)
        c = put(c, cut, CX0 + cw / 2 + dx, CY0 + ch / 2 - 10 * p + dy, (1.0 + 0.035 * p) * (1 + z), shadow=0.45)
        c = c * (1 - BOT[..., None]) + NAVY * BOT[..., None]; c = dust(c, t, keep)
        c = put(c, yr, 872, 640, shadow=0.4); c = put(c, rise, 872, 696, shadow=0.4)
        c = put(c, rank, 168, 628, shadow=0.4); c = put(c, nm1, 168, 684, shadow=0.5); c = put(c, nm2, 168, 750, shadow=0.5)
        if t < T0 + 0.25:
            a = 1 - smooth((t - T0 + 0.05) / 0.3); c = put(c, big, W / 2, 1180, 0.96 + 0.04 * t / T0, alpha=a, shadow=0.7); c = put(c, TAG, W / 2, 1352, alpha=a, shadow=0.5)
        else:
            c = wave(c, t); c = caps.draw(c, t); c = chevrons(c, t, events, 42, 1222)
        c = put(c, LOGO, *LOGOXY, alpha=0.92, shadow=0.3); c = put(c, cred, W / 2 + 30, CREDY, alpha=ease((t - 0.2) / 0.5), shadow=0.2)
        _, _, fl = caps.fx(t); c = cover_fx(c, t) + (255 - c) * fl
        return c * VIG + GRAIN[int(t * FPS) % 4]
    def audio():
        cues = [(clip(163, 0.0, 3.0), 0.0, -22),                                   # the date sweeps in: slow air
                (clip(167, 0.0, 1.3), 0.15, -24),                                  # the rings draw
                (clip(1433, 0.0, 0.45), T0 - 0.03, -12),                           # shutter into the voice
                (clip(498, 0, 2.2), o + 4.53 + 0.45, -20),                         # «جثثنا»
                (clip(1461), o + 6.23, -26), (clip(166), o + 7.17, -26),            # soft air on حق / باطل
                (clip(1143, 0.1, 2.6), o + 8.93, -21),                             # «سنقاوم»
                (clip(2299), o + 9.55, -27),                                       # «سنقاتل» (short, high-passed)
                (clip(1489, 0, 1.2), o + 15.30, -26),                              # «صامدون»
                (clip(490), o + 16.90 + 0.25, -17)]                                 # «شهداء»: one heart beat
        beds = [(bed(2658, body, 3.0), -31), (np.concatenate([np.zeros(int((o + 16.4) * SR), np.float32), bed(494, 2.6, 4.0, 0.5)])[:int(body * SR)], -30)]
        return mix(name, voice, body, T0, cues, beds)
    run(fr, n, name, audio, body)

# ================================================================ VIDEO 3
def v3():
    name = '03-bab-almandab'; voice = WK + 'v3_voice.wav'; src = WK + '../dl/v3.mp4'; CUT_A, CUT_B = 10.34, 16.64
    na = int(round(CUT_A * FPS)); nb = int((25.33 - CUT_B) * FPS) - 1; clipdur = (na + nb) / FPS; body = T0 + clipdur; n = int(round(body * FPS)); o = T0; cut_t = o + na / FPS
    LASTA = {}
    def stream():
        k = 0
        for f in reader(src, 'scale=1080:1920', W, H, 0, CUT_A):
            if k >= na: break
            LASTA['f'] = f; k += 1; yield f
        while k < na: k += 1; yield LASTA['f']
        yield from reader(src, 'scale=1080:1920', W, H, CUT_B, 25.33 - CUT_B)
    env = envelope(voice, n, T0); ang = angle_fn(env)
    SPK = 380; CARD = (108, 1250, 864, 648); CW, CH = 720, 540; CX0, CY0 = 180, 916; CCX, CCY = CX0 + CW / 2, CY0 + CH / 2
    stage = make_stage(glow=(540, 1170)); SPF = np.clip((yy - 700) / 190, 0, 1)
    keep = np.ones((H, W), np.float32); keep[CY0 - 20:CY0 + CH + 20, CX0 - 20:CX0 + CW + 20] = 0; keep *= np.clip((yy - 720) / 120, 0, 1)
    shadow = cv2.GaussianBlur(((xx > CX0) & (xx < CX0 + CW) & (yy > CY0) & (yy < CY0 + CH)).astype(np.float32), (0, 0), 24)
    cred = credit_img('أديم الأرض · لقطة: الجزيرة')
    big = stack([line([('باب', ORANGE), ('المندب', ORANGE)], 'thmanyahsans-Black.ttf', 112, stroke=7),
                 line([('مفتوح', WHITE), ('للسفن', WHITE), ('الإسرائيلية؟!', WHITE)], 'thmanyahsans-Black.ttf', 74, stroke=6)], 118)
    q = cut_t - o - 16.64 + 0.0                                              # time shift for words after the cut (16.64 s → cut_t)
    sh2 = lambda x: o + (x - 16.64) + (cut_t - o)
    caps = Captions([chunk(o + 0.00, o + 1.84, 'سفينة إسرائيلية تعبر', [o + 0.0, o + 0.64, o + 1.34]),
                     chunk(o + 1.84, o + 3.20, '[[باب المندب]] دون اعتراض', [o + 1.84, o + 2.12, o + 2.56, o + 2.82]),
                     chunk(o + 3.20, o + 4.64, 'طب أين هي شعاراتكم', [o + 3.20, o + 3.45, o + 3.76, o + 3.86]),
                     chunk(o + 4.64, o + 5.82, 'لنصرة [[الأقصى]]؟', [o + 4.64, o + 5.42]),
                     chunk(o + 5.82, o + 7.42, 'أما الموت لأمريكا', [o + 5.82, o + 6.52, o + 6.88]),
                     chunk(o + 7.42, o + 8.40, 'والموت لإسرائيل', [o + 7.42, o + 7.86]),
                     chunk(o + 8.40, o + 10.34, 'وبالنهاية استهداف المسلمين', [o + 8.40, o + 9.40, o + 9.82]),
                     chunk(sh2(16.64), sh2(18.22), 'وهم يتغطّون بشعار', [sh2(16.64), sh2(17.14), sh2(17.76)]),
                     chunk(sh2(18.22), sh2(18.88), '[[تحرير الأقصى]]', [sh2(18.22), sh2(18.50)]),
                     chunk(sh2(18.88), sh2(20.84), 'أسأل الله أن يحفظ', [sh2(18.88), sh2(20.24), sh2(20.42), sh2(20.56)]),
                     chunk(sh2(20.84), sh2(22.16), 'إخواننا أهل السنة [[في اليمن]]', [sh2(20.84), sh2(21.28), sh2(21.48), sh2(21.80), sh2(21.88)]),
                     chunk(sh2(22.16), sh2(24.02), 'وكفاهم شرّ من ظلمهم', [sh2(22.16), sh2(23.14), sh2(23.48), sh2(23.60)]),
                     chunk(sh2(24.02), sh2(24.94), 'وحقن [[دماءهم]]', [sh2(24.02), sh2(24.42)])], 846, 62, maxw=880)
    events = [o + 0.0, o + 3.2, o + 5.82, cut_t, sh2(18.88), sh2(22.16)]
    BL0 = body - 1.1; cov_f = grab(src, 1.0, 'scale=1080:1920', W, H)
    def fr(t, f, cover=False):
        if f is None: f = cov_f
        z0 = 1.0 if t < cut_t else 1.065; z, sh, _ = caps.fx(t); z1 = z0 * (1 + z)
        M = np.float32([[z1, 0, 540 * (1 - z1) + (rng.uniform(-1, 1) * sh if sh else 0)], [0, z1, 330 * (1 - z1) - SPK * z1]])
        spk = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        if cut_t <= t < cut_t + 0.12:
            prev = cv2.warpAffine(LASTA['f'], np.float32([[1, 0, 0], [0, 1, -SPK]]), (W, H), borderMode=cv2.BORDER_REPLICATE); k = (t - cut_t) / 0.12; spk = prev * (1 - k) + spk * k
        card = cv2.resize(f[CARD[1]:CARD[1] + CARD[3], CARD[0]:CARD[0] + CARD[2]], (CW, CH), interpolation=cv2.INTER_AREA)
        if t < T0: spk = cv2.GaussianBlur(spk, (0, 0), 3) * 0.6 + NAVY * 0.4
        b = smooth((t - BL0) / 0.9) * 14
        if b > 0.3: spk = cv2.GaussianBlur(spk, (0, 0), b); card = cv2.GaussianBlur(card, (0, 0), b * 0.6)
        c = stage.copy(); c = rings(c, t, CCX, CCY, 400, ang, keep=keep); c = spk * (1 - SPF[..., None]) + c * SPF[..., None]; c = grade(c)
        c = c * (1 - shadow[..., None] * 0.6)
        c[CY0 - 12:CY0 + CH + 12, CX0 - 12:CX0 + CW + 12] = c[CY0 - 12:CY0 + CH + 12, CX0 - 12:CX0 + CW + 12] * 0.25 + NAVY * 0.75
        ca = ease((t - 0.15) / 0.45); c[CY0:CY0 + CH, CX0:CX0 + CW] = c[CY0:CY0 + CH, CX0:CX0 + CW] * (1 - ca) + card * ca
        c = frame_lines(c, CX0 - 12, CY0 - 12, CX0 + CW + 12, CY0 + CH + 12, ease((t - 0.2) / 0.6), br=48); c = dust(c, t, keep)
        if t < T0 + 0.25:
            a = 1 - smooth((t - T0 + 0.05) / 0.3); c = put(c, big, W / 2, 640, 0.96 + 0.04 * t / T0, alpha=a, shadow=0.7); c = put(c, TAG, W / 2, 800, alpha=a, shadow=0.5)
        else:
            c = caps.draw(c, t); c = chevrons(c, t, events, 42, CCY)
        c = put(c, LOGO, *LOGOXY, alpha=0.92, shadow=0.3); c = put(c, cred, W / 2 + 30, CREDY, alpha=ease((t - 0.2) / 0.5), shadow=0.2)
        _, _, fl = caps.fx(t); c = cover_fx(c, t) + (255 - c) * fl
        return c * VIG + GRAIN[int(t * FPS) % 4]
    def audio():
        cues = [(clip(1432), 0.12, -16),                                           # the news card is "snapped"
                (clip(1433, 0.0, 0.45), T0 - 0.03, -12),
                (clip(3077, 0.0, 5.8), 0.0, -30),                                  # a far ship engine under the headline
                (clip(1489, 0, 1.2), o + 1.84, -24),                               # «باب المندب»
                (clip(498, 0, 2.2), o + 5.42, -21),                                # «الأقصى»
                (clip(166), cut_t - 0.08, -24),                                    # the jump cut
                (clip(1143, 0.1, 2.6), sh2(18.22), -23),                           # «تحرير الأقصى»
                (clip(1474, 0.45, 1.9), sh2(21.80), -25),                          # «في اليمن»
                (clip(490), sh2(24.42), -18)]                                      # «دماءهم»
        beds = [(bed(1196, body, 5.0), -31)]                                       # Bab al-Mandab: the sea, low
        return mix(name, voice, body, T0, cues, beds)
    run(fr, n, name, audio, body, stream)

{'v1': v1, 'v2': v2, 'v3': v3}[VID]()
