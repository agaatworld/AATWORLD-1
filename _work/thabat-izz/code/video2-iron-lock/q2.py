# VIDEO 2 «القفل الحديدي» — 10 s Taizi folk saying. Intimate and minimal: her real 16:9 frame on top, a stone panel of words below,
# the iron lock slides in like a bolt on the punchline. One centre axis, nothing over her face or hand.
import sys, os
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand')
_a = list(sys.argv); sys.argv = [_a[0], 'B']
from km import *
sys.argv = _a; A = _a
import mg, subprocess
Q = os.path.dirname(os.path.abspath(__file__)) + '/'
W, H, FPS = 1080, 1920, 30; NF = 301; DUR = NF / FPS
CX = 540
BAND_Y, BAND_H = 300, 608                    # her footage, full 16:9 width
PAN_Y, PAN_H = 940, 540                      # the word panel under it (940–1480)
PAN_C = PAN_Y + PAN_H / 2
xx, yy = mg.xx, mg.yy
S_SC = 1080 / 848

cap = cv2.VideoCapture(Q + 'src.mp4'); SRC = []
while True:
    ok, f = cap.read()
    if not ok: break
    SRC.append(f)
def src(k): return SRC[min(max(0, k), len(SRC) - 1)]
def grade(f):
    x = f.astype(np.float32) / 255
    knee = 0.80; x = np.where(x > knee, knee + (x - knee) * 0.55, x)                     # soften the blown sun, keep reds and turquoise
    x = np.clip((x - 0.5) * 1.06 + 0.5, 0, 1); L = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    x = x * (1 - 0.08 * (1 - L)) + (DEEP / 255) * 0.08 * (1 - L)                         # a little navy in the shadows only
    return x * 255
STONE = grunge(H, W, d, seed=401, base=C('11161F'), tone=C('3A4555'))
STONE = vignette(STONE, 0.35)
LOCK = cv2.imread(Q + 'dl/lock_bolt.jpg').astype(np.float32)
def lock_panel(z=1.0):
    """the lock photo cropped to the panel (1080 x 540), darkened for the words"""
    lh, lw = LOCK.shape[:2]; s = max(W / lw, PAN_H / lh) * z * 1.15
    cx, cy = lw * 0.50, lh * 0.47                                                           # padlock + bolt in the centre of the panel
    M = np.float32([[s, 0, W / 2 - s * cx], [0, s, PAN_H / 2 - s * cy]]); img = cv2.warpAffine(LOCK, M, (W, PAN_H), borderMode=cv2.BORDER_REFLECT)
    g = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255
    img = img * 0.55 + (DEEP + (C('C9A46A') - DEEP) * g) * 0.45                             # iron and bronze, brand-toned
    img = img * 0.62
    y = np.arange(PAN_H, dtype=np.float32)[:, None, None]; v = np.clip(np.minimum(y, PAN_H - y) / 60, 0, 1)
    return img * v + STONE[PAN_Y:PAN_Y + PAN_H] * (1 - v)
LOGO = logo_rgba(118)

L1 = (1.07, 4.37, ['كحران', 'عسير،', 'مو', 'مو', 'طلعك', 'يا', 'أخوتي؟'], [1.07, 1.80, 2.24, 2.60, 2.90, 3.54, 3.70])
L2 = (4.37, 7.43, ['قفلة', 'حديد،', 'ومردحة', 'حناشة'], [4.37, 5.70, 6.24, 6.84])
def clean(w): return w.strip('،؟')
_T = {}
def wimg(w, size, col):
    key = (w, size, tuple(col))
    if key not in _T: _T[key] = rtl_line([(clean(w), col)], 'naskh', size)
    return _T[key]
def row(words, size, cy, cols):
    f = font('naskh', size); sp = size * 0.32; wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]
    tot = sum(wl) + sp * (len(wl) - 1); x = CX + tot / 2; out = []
    for w, l, col in zip(words, wl, cols): out.append((wimg(w, size, col), x - l / 2, cy)); x -= l + sp
    return out

def frame(k):
    t = k / FPS; c = STONE.copy()
    # ---- her footage: subtle push only at the raised finger (3.2–4.4), held, then a slow settle
    z = 1.0 + 0.07 * eio(seg(t, 3.15, 4.4)) + 0.02 * seg(t, 4.4, DUR)
    fx, fy = 400 * S_SC, 190 * S_SC
    f = cv2.resize(src(k), (W, BAND_H), interpolation=cv2.INTER_LANCZOS4)
    M = cv2.getRotationMatrix2D((fx, fy), 0, z); f = cv2.warpAffine(f, M, (W, BAND_H), borderMode=cv2.BORDER_REFLECT)
    f = grade(f)
    if 3.0 < t < 5.0:                                                                       # her hand against the stone: a soft, local contrast lift
        g = np.exp(-(((np.arange(W)[None, :] - fx) / 260) ** 2 + ((np.arange(BAND_H)[:, None] - fy) / 200) ** 2))[..., None]
        f = f * (1 - 0.10 * bump(t, 3.0, 5.0) * (1 - g))
    op = ease(seg(t, 0.0, 0.5)); c[BAND_Y:BAND_Y + BAND_H] = c[BAND_Y:BAND_Y + BAND_H] * (1 - op) + f * op
    c = hair(c, 0, BAND_Y - 1, W, BAND_Y - 1, BRONZE, 0.7 * op, 2); c = hair(c, 0, BAND_Y + BAND_H, W, BAND_Y + BAND_H, BRONZE, 0.7 * op, 2)
    # ---- the iron lock slides in like a bolt (right → left) on «قفلة حديد»
    if t >= 4.30:
        p = ease(seg(t, 4.30, 4.75)); zl = 1.0 + 0.05 * seg(t, 4.3, DUR); P = lock_panel(zl)
        xe = W * (1 - p); m = np.clip((np.arange(W)[None, :] - xe) / 4, 0, 1)[..., None]
        reg = c[PAN_Y:PAN_Y + PAN_H]; c[PAN_Y:PAN_Y + PAN_H] = reg * (1 - m) + P * m
        if 0 < p < 1: c = hair(c, xe, PAN_Y + 20, xe, PAN_Y + PAN_H - 20, BRONZE_L, 1.0, 6)
    # ---- words (provisional dialect transcript, no added diacritics)
    if 0.95 <= t < 4.6:
        po = ease(seg(t, 4.30, 4.55)); wds, st = L1[2], L1[3]
        r1 = row(wds[:2], 104, PAN_C - 72, [PARCH, PARCH]); r2 = row(wds[2:], 96, PAN_C + 72, [PARCH, PARCH, PARCH, PARCH, BRONZE_L])
        for (img, x, y), s0 in zip(r1 + r2, st):
            if t >= s0 - 0.03:
                q = t - s0; c = mg.put(c, img, x, y + 14 * (1 - ease(q / 0.25)), 1.0, min(1, q / 0.12) * (1 - po))
    if t >= 4.37:
        wds, st = L2[2], L2[3]; fo = ease(seg(t, 9.0, 9.7))
        r1 = row(wds[:2], 140, PAN_Y + 120, [PARCH, PARCH]); r2 = row(wds[2:], 100, PAN_Y + PAN_H - 105, [BRONZE_L, BRONZE_L])
        for i, ((img, x, y), s0) in enumerate(zip(r1 + r2, st)):
            if t >= s0 - 0.03:
                q = t - s0; s = 1.0 + (0.18 * (1 - ease(q / 0.18)) if i < 2 else 0); dy = 0 if i < 2 else 14 * (1 - ease(q / 0.25))
                c = mg.put(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 10) * 0.7]), x + 5, y + 9 + dy, s, min(1, q / 0.1) * (1 - fo))
                c = mg.put(c, img, x, y + dy, s, min(1, q / 0.1) * (1 - fo))
    # ---- quiet ending: the lock stays, a single bronze rule closes the panel
    if t >= 9.0:
        p = ease(seg(t, 9.0, 9.8)); c = hair(c, CX + 160 * p, PAN_Y + PAN_H + 26, CX - 160 * p, PAN_Y + PAN_H + 26, BRONZE_L, 0.9 * p, 3)
    c = mg.put(c, LOGO, 118, BAND_Y + 48 + 59 - 59)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 2.0
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    if A[1] == 'still':
        os.makedirs(Q + 'st', exist_ok=True)
        for ts in A[2:]: cv2.imwrite(Q + f'st/s_{float(ts):05.2f}.jpg', frame(int(float(ts) * FPS)))
    else:
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', Q + 'body.mp4'], stdin=subprocess.PIPE)
        for k in range(NF): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('body done')
