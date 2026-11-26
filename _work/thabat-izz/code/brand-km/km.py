# Kalima Muqawama — direction B «Imperial Archive» production toolkit (tokens + helpers shared by videos and templates)
import sys
_argv = list(sys.argv); sys.argv = [sys.argv[0], 'B']
import frames as F
from frames import *          # kit + mg helpers, d = DIRS['B'], rtl_line, wrap, tokens, ring, spark, grade, cover_fit, avatar, plate, metal_text, credit
sys.argv = _argv
ARGS = _argv
import mg
d = DIRS['B']
# ---- tokens
INK = C('080D18'); ROYAL = C('1E3A6E'); SILVER = C('A3A9AF'); BRONZE = C('A8844F'); PARCH = C('EDE3CC'); SEAL = C('8E3B2F')
DEEP = C('04070E'); NIGHT = C('0E1A33')
BRONZE_L = C('C9A46A'); BRONZE_D = C('7E5F33'); SEAL_L = C('C0604E'); SILVER_D = C('5E6670'); PARCH_D = C('D9CDB2')
METAL = [C(h) for h in ('5A4024', '9A7646', 'D9BF8C', '84633A', 'C4A06A')]
ON_DARK = dict(text=PARCH, key=BRONZE_L, emo=SEAL_L, label=SILVER, plate=INK)
ON_LIGHT = dict(text=INK, key=BRONZE_D, emo=SEAL, label=SILVER_D, plate=PARCH)
S_ = F.S_
KIT = '/home/user/final/Kalima_Muqawama_Brand_Kit/'
FINAL = KIT + 'Deliverables/'

def archive_ground(h, w, seed=1, light=False):
    """B ground: black-navy grunge (or parchment paper) with a faint royal bloom"""
    if light:
        r = np.random.default_rng(seed)
        n = cv2.GaussianBlur(r.standard_normal((h // 8 + 2, w // 8 + 2)).astype(np.float32), (0, 0), 3)
        n = cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC); n /= n.std() + 1e-6
        f = r.standard_normal((h, w)).astype(np.float32)
        k = np.clip(0.5 + 0.16 * n + 0.05 * f, 0, 1)[..., None]
        c = PARCH_D + (PARCH - PARCH_D) * k
        fib = (r.random((h, w)) > 0.9993).astype(np.float32); fib = cv2.GaussianBlur(cv2.dilate(fib, np.ones((1, 9))), (0, 0), 1.0)
        c = c * (1 - 0.10 * fib[..., None])
        y, x = np.mgrid[0:h, 0:w].astype(np.float32); v = np.hypot((x - w / 2) / w, (y - h / 2) / h)
        return (c * (1 - 0.18 * np.clip(v - 0.2, 0, 1)[..., None])).astype(np.float32)
    c = grunge(h, w, d, seed=seed, base=DEEP, tone=NIGHT)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    g = np.exp(-(((x - w * 0.5) / (w * 0.7)) ** 2 + ((y - h * 0.42) / (h * 0.45)) ** 2))[..., None]
    return (c + (ROYAL - c) * g * 0.22).astype(np.float32)

def hair(c, x0, y0, x1, y1, col, a=1.0, w=2):
    m = np.zeros(c.shape[:2], np.float32); cv2.line(m, (int(x0 * 8), int(y0 * 8)), (int(x1 * 8), int(y1 * 8)), 1.0, w, cv2.LINE_AA, shift=3)
    return c + (col - c) * (m * a)[..., None]

def label(txt, size=30, col=SILVER, fk='plex'): return text([(txt, col)], fk, size)

def card(w, h, light=True, r=18, header=True):
    """archive index card: parchment (or ink) panel with a royal header rule and silver hairline border"""
    m = round_mask(w, h, r); img = archive_ground(h, w, seed=w + h, light=light)
    e = m - cv2.erode(m, np.ones((3, 3), np.uint8), iterations=2)
    img = img * (1 - e[..., None]) + (SILVER if not light else SILVER_D) * e[..., None] * 1.0 + img * 0
    if header: img[26:32, 36:w - 36] = ROYAL if light else BRONZE
    return np.dstack([img, m])

def seal_stamp(size, col=BRONZE_L, ring_w=5, ticks=48):
    """circular seal (rings + ticks) used behind stamped words — drawn, not a logo"""
    c = np.zeros((size, size, 3), np.float32); a = np.zeros((size, size), np.float32); S8 = 8; cx = cy = size / 2
    for r_, w_ in ((size * 0.47, ring_w), (size * 0.41, 2)):
        cv2.circle(a, (int(cx * S8), int(cy * S8)), int(r_ * S8), 1.0, w_, cv2.LINE_AA, shift=3)
    for i in range(ticks):
        an = 2 * np.pi * i / ticks; r0, r1 = size * 0.42, size * (0.445 if i % 4 else 0.465)
        cv2.line(a, (int((cx + np.sin(an) * r0) * S8), int((cy - np.cos(an) * r0) * S8)), (int((cx + np.sin(an) * r1) * S8), int((cy - np.cos(an) * r1) * S8)), 1.0, 2, cv2.LINE_AA, shift=3)
    c[:] = col; return np.dstack([c, a])

def logo_rgba(size, kind='refined'):
    L = cv2.imread(B + f'cache/B_{kind}.png').astype(np.float32)
    crop, m = circle_crop(L, R_OUT + 34, out=size); return np.dstack([crop, m])

def still(name):
    p = {'village': 'dw/anim/img/A_x2.png', 'gather': 'dw/anim/img/D_nf_x2.png', 'think': 'dw/anim/img/C_nf_x2.png', 'sit': 'dw/anim/img/R_nf_x2.png',
         'qpage': 'mg/broll/qpage.jpg', 'mosque': 'mg/broll/mosque.jpg', 'peak': 'mg/broll/peak.jpg', 'shelves': 'mg/broll/shelves.jpg', 'ymount': 'mg/broll/ymount.jpg'}[name]
    return cv2.imread(S_ + p).astype(np.float32)

def video_frame(path, t):
    cap = cv2.VideoCapture(S_ + path); cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read(); return f.astype(np.float32)

def bg_from(img, fy=0.45, z=1.0, k=1.0):
    return grade(cover_fit(img, 1080, 1920, fy=fy, z=z), 0.38 * k)
