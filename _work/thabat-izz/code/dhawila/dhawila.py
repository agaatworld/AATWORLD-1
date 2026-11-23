# «معركة ضاويله الليلية» — faceless anime-style short for الثبات عز
# python3 dhawila.py render <part> <parts> | still t... | finish <parts>
import numpy as np, cv2, sys, os, subprocess, re
from PIL import Image, ImageDraw, ImageFont
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
AD = S_ + 'dw/anim/'; IMG = AD + 'img/'; WK = AD + 'work/'; TH = S_ + 'taiz/fonts/th/'; K = '/home/user/final/brand-kit/'
OUTD = '/home/user/final/dhawila/'
W, H, FPS = 1080, 1920, 30; DUR = 45.0; END = 41.7
os.makedirs(WK, exist_ok=True)
NAVY = np.array([45, 27, 15], np.float32); AMBER = np.array([65, 165, 242], np.float32); ORANGE = np.array([61, 138, 255], np.float32)
WHITE = np.array([216, 233, 244], np.float32); WARM = np.array([120, 200, 255], np.float32); COOL = np.array([255, 225, 200], np.float32)
rng = np.random.default_rng(7)
def ease(x): x = float(np.clip(x, 0, 1)); return 1 - (1 - x) ** 3
def eio(x): x = float(np.clip(x, 0, 1)); return x * x * (3 - 2 * x)
def seg(t, a, b): return float(np.clip((t - a) / max(1e-6, b - a), 0, 1))
def bump(t, a, b): p = seg(t, a, b); return float(np.sin(np.pi * p))

# ---------------------------------------------------------------- images (x1 = 928x1664 space; x2 = upscaled)
def load(k, nf):
    p1 = IMG + (k + '_nf' if nf else k) + '.png'; p2 = p1.replace('.png', '_x2.png')
    i1 = cv2.imread(p1).astype(np.float32); i2 = cv2.imread(p2).astype(np.float32) if os.path.exists(p2) else cv2.resize(i1, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    d = cv2.imread(IMG + k + '_depth.png', 0).astype(np.float32) / 255; d = cv2.GaussianBlur(d, (0, 0), 6)
    hsv = cv2.cvtColor(i1.astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    warm = ((hsv[..., 0] >= 8) & (hsv[..., 0] <= 30) & (hsv[..., 1] > 90) & (hsv[..., 2] > 170)).astype(np.float32)
    warm = cv2.GaussianBlur(warm, (0, 0), 3)
    return dict(i1=i1, i2=i2, d=d, warm=warm)
IM = {'A': load('A', False), 'R': load('R', True), 'C': load('C', True), 'D': load('D', True)}
hsvA = cv2.cvtColor(IM['A']['i1'].astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
g = IM['A']['i1'].mean(2); star = ((IM['A']['d'] < 0.06) & (g > 120) & (g - cv2.GaussianBlur(g, (0, 0), 4) > 25)).astype(np.float32)
star[560:] = 0; star[150:230, 620:720] = 0; IM['A']['star'] = cv2.GaussianBlur(star, (0, 0), 1.2) * 3
IM['A']['win'] = IM['A']['warm'].copy()
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); U = xx - W / 2; V = yy - H / 2

def camwarp(k, cx, cy, z, rot, px=0.0, py=0.0, dolly=0.0, df=0.5, extra=()):
    """returns frame + warped extra masks; coordinates in 928 space"""
    I = IM[k]; s = W * z / 928.0; r = np.deg2rad(rot); cr, sr = np.cos(r), np.sin(r)
    x0 = (cx + (cr * U - sr * V) / s).astype(np.float32); y0 = (cy + (sr * U + cr * V) / s).astype(np.float32)
    d = cv2.remap(I['d'], x0, y0, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); kk = d - df
    x = (cx + (x0 - cx) / (1 + dolly * kk) + px * kk).astype(np.float32); y = (cy + (y0 - cy) / (1 + dolly * kk) + py * kk).astype(np.float32)
    if s > 1.25: f = cv2.remap(I['i2'], (x * 2 + 0.5).astype(np.float32), (y * 2 + 0.5).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    else: f = cv2.remap(I['i1'], x, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    ex = [cv2.remap(I[e], x, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT) for e in extra]
    return f, ex, d
def fwd(cx, cy, z, rot, pts):
    """928-space points -> output pixels (no parallax)"""
    s = W * z / 928.0; r = np.deg2rad(rot); cr, sr = np.cos(r), np.sin(r); p = np.array(pts, np.float32) - [cx, cy]
    return np.stack([(cr * p[:, 0] + sr * p[:, 1]) * s + W / 2, (-sr * p[:, 0] + cr * p[:, 1]) * s + H / 2], 1), s

# ---------------------------------------------------------------- shots: keys (t, cx, cy, z, rot, px, py, dolly)
SHOTS = [
 dict(n='village', k='A', t0=0.0, t1=4.9, keys=[(0.0, 470, 640, 1.30, -1.0, 0, -22, 0), (3.4, 440, 960, 1.50, 0.0, 0, 18, 0.05), (4.25, 396, 1058, 2.6, 0.5, 0, 10, 0.5), (4.9, 389, 1074, 6.0, 0.5, 0, 0, 1.0)]),
 dict(n='captive', k='C', t0=4.9, t1=9.62, keys=[(4.9, 466, 832, 1.04, -1.5, -14, 0, 0), (6.3, 520, 860, 1.30, -0.5, 0, 0, 0.05), (9.62, 600, 735, 2.05, 0.8, 16, 0, 0.25)]),
 dict(n='raed1', k='R', t0=9.62, t1=11.52, keys=[(9.62, 420, 905, 2.5, 0.6, 0, 0, 0), (11.52, 428, 960, 1.85, -0.4, 10, 0, 0.15)]),
 dict(n='majlis', k='D', t0=11.52, t1=14.30, keys=[(11.52, 330, 980, 1.55, 0, -22, 0, 0), (13.3, 560, 1000, 1.62, 0, 18, 0, 0.05), (14.3, 470, 1195, 2.3, 0, 20, 0, 0.3)]),
 dict(n='raed2', k='R', t0=14.30, t1=17.15, keys=[(14.3, 450, 1000, 1.25, 0, -12, 0, 0), (17.15, 430, 930, 1.62, 0, 12, 0, 0.12)]),
 dict(n='elder', k='D', t0=17.15, t1=18.85, keys=[(17.15, 185, 1000, 2.55, 0, -10, 0, 0), (18.85, 188, 960, 2.85, 0, 10, 0, 0.2)]),
 dict(n='paths', k='A', t0=18.85, t1=23.05, keys=[(18.85, 470, 1180, 1.75, -2.0, 0, 0, 0), (23.05, 440, 1010, 1.30, 1.5, 0, 0, 0)]),
 dict(n='young', k='D', t0=23.05, t1=24.55, keys=[(23.05, 750, 860, 2.7, 0, 10, 0, 0), (24.55, 742, 845, 3.0, 0, -10, 0, 0.15)]),
 dict(n='solar', k='A', t0=24.55, t1=26.35, keys=[(24.55, 492, 932, 3.0, -1.0, 0, 0, 0), (26.35, 488, 924, 3.6, 1.0, 0, 0, 0)]),
 dict(n='carry', k='A', t0=26.35, t1=27.3, keys=[(26.35, 300, 1075, 1.6, 0, 0, 0, 0), (27.3, 330, 1060, 1.9, -1.0, 0, 0, 0)]),
 dict(n='lamp', k='D', t0=27.3, t1=28.15, keys=[(27.3, 460, 1190, 2.6, 0, 0, 0, 0), (28.15, 460, 1182, 3.1, 0, 0, 0, 0.2)]),
 dict(n='roofs', k='A', t0=28.15, t1=29.05, keys=[(28.15, 200, 870, 2.2, 0, 0, 0, 0), (29.05, 215, 862, 2.45, 0.8, 0, 0, 0)]),
 dict(n='lights', k='A', t0=29.05, t1=32.15, keys=[(29.05, 464, 1010, 1.32, 0, 0, 0, 0), (32.15, 470, 860, 1.12, 1.5, 0, 0, 0)]),
 dict(n='battle', k='A', t0=32.15, t1=35.85, keys=[(32.15, 610, 1010, 1.42, 0, 0, 0, 0), (33.7, 630, 975, 1.62, -0.5, 0, 0, 0), (35.85, 650, 945, 1.85, 0.5, 0, 0, 0)]),
 dict(n='victory', k='D', t0=35.85, t1=37.55, keys=[(35.85, 464, 900, 1.18, 0, 0, 0, 0), (37.55, 464, 832, 1.04, 0, 0, 0, 0)]),
 dict(n='end', k='A', t0=37.55, t1=DUR, keys=[(37.55, 430, 1000, 1.45, 0, 0, 0, 0), (41.6, 600, 430, 2.0, -1.0, 0, 0, 0), (DUR, 600, 430, 2.0, -1.0, 0, 0, 0)]),
]
# transitions at the start of a shot: (kind, duration)
TRANS = {'captive': ('flash', 0.45), 'raed1': ('dis', 0.18), 'majlis': ('dis', 0.3), 'raed2': ('dis', 0.3), 'elder': ('flash', 0.3), 'paths': ('whip', 0.26),
         'young': ('dis', 0.2), 'solar': ('whip', 0.22), 'carry': ('dis', 0.18), 'lamp': ('whip', 0.18), 'roofs': ('whip', 0.18), 'lights': ('dis', 0.15),
         'battle': ('dis', 0.3), 'victory': ('flash', 0.5), 'end': ('dis', 0.5)}
def campose(sh, t):
    ks = sh['keys']
    if t <= ks[0][0]: return ks[0][1:]
    for a, b in zip(ks, ks[1:]):
        if t <= b[0]:
            p = (t - a[0]) / (b[0] - a[0]); p = p * p * (3 - 2 * p) if sh['n'] not in ('village',) or b[0] < 4.0 else p ** 2.2
            return tuple(a[i] + (b[i] - a[i]) * p for i in range(1, 8))
    return ks[-1][1:]

# ---------------------------------------------------------------- generic effects
GRAIN = [cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.9)[..., None] * 3.6 for _ in range(8)]
VIG = (1 - 0.5 * np.clip(np.hypot(U / (W * 0.62), (V + 60) / (H * 0.58)) - 0.38, 0, 1) ** 1.25)[..., None].astype(np.float32)
def bloom(c, thr=200, k=0.35, sig=18):
    sm = cv2.resize(c, (W // 4, H // 4), interpolation=cv2.INTER_AREA); hi = np.clip(sm - thr, 0, None)
    hi = cv2.GaussianBlur(hi, (0, 0), sig / 4); return c + cv2.resize(hi, (W, H), interpolation=cv2.INTER_LINEAR) * k
def glow(c, x, y, r, col, a):
    """soft additive light at output px"""
    if a <= 0.003: return c
    R = int(r * 3); x0, x1 = max(0, int(x - R)), min(W, int(x + R)); y0, y1 = max(0, int(y - R)), min(H, int(y + R))
    if x1 <= x0 or y1 <= y0: return c
    gx = (np.arange(x0, x1, dtype=np.float32) - x) / r; gy = (np.arange(y0, y1, dtype=np.float32) - y) / r
    g = np.exp(-(gy[:, None] ** 2 + gx[None, :] ** 2))[..., None]; c[y0:y1, x0:x1] += g * col * a; return c
def flare(c, x, y, size, col, a, rays=6, rot=0.0):
    c = glow(c, x, y, size * 0.18, np.array([255, 255, 255], np.float32), a * 1.0); c = glow(c, x, y, size * 0.6, col, a * 0.55)
    if a < 0.05: return c
    m = np.zeros((int(size * 4), int(size * 4)), np.float32); ctr = size * 2
    for i in range(rays):
        an = rot + i * np.pi / rays * 2; L = size * (1.9 if i % 2 == 0 else 1.1)
        cv2.line(m, (int(ctr * 8), int(ctr * 8)), (int((ctr + np.cos(an) * L) * 8), int((ctr + np.sin(an) * L) * 8)), 1.0, 2, cv2.LINE_AA, shift=3)
    m = cv2.GaussianBlur(m, (0, 0), 1.6)
    x0, y0 = int(x - ctr), int(y - ctr); xa, ya = max(0, x0), max(0, y0); xb, yb = min(W, x0 + m.shape[1]), min(H, y0 + m.shape[0])
    if xb > xa and yb > ya: c[ya:yb, xa:xb] += m[ya - y0:yb - y0, xa - x0:xb - x0][..., None] * col * a * 1.2
    return c
class Dust:
    def __init__(s, n, seed):
        r = np.random.default_rng(seed); s.p = r.uniform([0, 0], [W, H], (n, 2)).astype(np.float32); s.v = r.normal(0, 1, (n, 2)).astype(np.float32) * [9, 6] + [4, -7]
        s.sz = r.uniform(1.2, 3.6, n).astype(np.float32); s.ph = r.uniform(0, 6.28, n)
    def draw(s, c, t, col, a, lum=None):
        if a <= 0.01: return c
        m = np.zeros((H // 2, W // 2), np.float32)
        for (px, py), (vx, vy), sz, ph in zip(s.p, s.v, s.sz, s.ph):
            x = (px + vx * t + 14 * np.sin(t * 0.7 + ph)) % W; y = (py + vy * t + 10 * np.cos(t * 0.5 + ph)) % H
            cv2.circle(m, (int(x * 4), int(y * 4)), int(sz * 4 / 2), 0.5 + 0.5 * np.sin(t * 2 + ph) ** 2, -1, cv2.LINE_AA, shift=3)
        m = cv2.resize(cv2.GaussianBlur(m, (0, 0), 0.8), (W, H))[..., None]
        if lum is not None: m = m * lum
        return c + m * col * a
DUST = [Dust(70, i) for i in range(4)]
def lumof(f): return np.clip((f.mean(2, keepdims=True) - 30) / 120, 0.15, 1.0)

# ---------------------------------------------------------------- shot overlays
P_STAIRS = [(395, 1135), (415, 1165), (432, 1210), (450, 1255), (468, 1300), (490, 1350), (512, 1400), (540, 1450), (565, 1500), (590, 1560), (610, 1620)]
P_LEFT = [(380, 1140), (330, 1155), (270, 1165), (215, 1150), (170, 1110), (140, 1060), (118, 1030), (112, 1000)]
P_TERR = [(470, 1262), (560, 1258), (650, 1245), (740, 1236), (830, 1232), (905, 1230)]
P_SNEAK = [(925, 1120), (860, 1135), (800, 1150), (745, 1168)]
NODES = [(610, 1620), (112, 1000), (905, 1230)]
def polyline(c, pts, prog, col, width, a, s=1.0, dashed=False):
    pts = np.array(pts, np.float32); segl = np.hypot(*np.diff(pts, axis=0).T); L = segl.sum() * prog
    out = [pts[0]]; acc = 0
    for i, l in enumerate(segl):
        if acc + l >= L: out.append(pts[i] + (pts[i + 1] - pts[i]) * ((L - acc) / max(l, 1e-6))); break
        out.append(pts[i + 1]); acc += l
    out = np.array(out)
    m = np.zeros((H, W), np.float32)
    if dashed:
        for i in range(len(out) - 1):
            p0, p1 = out[i], out[i + 1]; n = max(1, int(np.hypot(*(p1 - p0)) / 16))
            for j in range(0, n, 2):
                a0 = p0 + (p1 - p0) * (j / n); a1 = p0 + (p1 - p0) * (min(n, j + 1) / n)
                cv2.line(m, tuple((a0 * 8).astype(int)), tuple((a1 * 8).astype(int)), 1.0, int(width), cv2.LINE_AA, shift=3)
    else: cv2.polylines(m, [(out * 8).astype(np.int32)], False, 1.0, int(width), cv2.LINE_AA, shift=3)
    gl = cv2.GaussianBlur(m, (0, 0), width * 2.2)
    c += (m[..., None] * 0.9 + gl[..., None] * 1.6) * col * a
    if prog < 1 and len(out): c = glow(c, out[-1][0], out[-1][1], width * 3, col, a * 1.1)
    return c, out[-1] if len(out) else None
def ov_paths(c, t, cam):
    cx, cy, z, rot = cam[:4]
    for pts, t0, dur in ((P_STAIRS, 19.3, 1.4), (P_LEFT, 19.55, 1.4), (P_TERR, 20.0, 1.2)):
        op, _ = fwd(cx, cy, z, rot, pts); c, _ = polyline(c, op, ease(seg(t, t0, t0 + dur)), AMBER, 4, 0.85 * seg(t, t0, t0 + 0.2))
    if t > 20.6:                                                                  # entrances / exits glow
        op, _ = fwd(cx, cy, z, rot, NODES)
        for i, (x, y) in enumerate(op):
            a = ease(seg(t, 20.67 + i * 0.25, 21.0 + i * 0.25)); pul = 0.75 + 0.25 * np.sin((t - 20.6) * 6 + i)
            c = glow(c, x, y, 26, ORANGE, a * pul * 0.9)
            ring = np.zeros((H, W), np.float32); rr = 18 + 26 * ((t * 0.9 + i * 0.3) % 1)
            cv2.circle(ring, (int(x * 8), int(y * 8)), int(rr * 8), 1.0, 2, cv2.LINE_AA, shift=3); c += ring[..., None] * AMBER * a * (1 - ((t * 0.9 + i * 0.3) % 1))
    if t > 21.8:                                                                  # where they would come from: a cool, broken trail that stops
        op, _ = fwd(cx, cy, z, rot, P_SNEAK); c, e = polyline(c, op, ease(seg(t, 21.85, 22.8)), np.array([255, 210, 150], np.float32), 3, 0.7, dashed=True)
        if t > 22.6 and e is not None: c = glow(c, e[0], e[1], 30, AMBER, ease(seg(t, 22.6, 22.9)) * 0.9)
    return c
PANELS = [((423, 921), (1, 0.08)), ((449, 923), (1, 0.08)), ((475, 925), (1, 0.08)), ((545, 925), (1, -0.12)), ((572, 922), (1, -0.12))]
def ov_solar(c, t, cam):
    cx, cy, z, rot = cam[:4]
    for i, ((px, py), (ux, uy)) in enumerate(PANELS):
        u = np.array([ux, uy]) / np.hypot(ux, uy); v = np.array([0.38, -1.0]); v /= np.hypot(*v)
        q = [np.array([px, py]) + u * a1 * 11.5 + v * b1 * 5.2 for a1, b1 in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        op, s = fwd(cx, cy, z, rot, q); a = ease(seg(t, 24.6 + i * 0.12, 24.95 + i * 0.12))
        if a <= 0: continue
        m = np.zeros((H, W), np.float32); cv2.fillConvexPoly(m, (op * 8).astype(np.int32), 1.0, cv2.LINE_AA, shift=3)
        sh = np.zeros((H, W), np.float32); cv2.fillConvexPoly(sh, ((op + [6, 10]) * 8).astype(np.int32), 1.0, cv2.LINE_AA, shift=3); sh = cv2.GaussianBlur(sh, (0, 0), 4)
        c *= (1 - 0.45 * sh[..., None] * a)
        ys, xs = np.where(m > 0)
        if len(xs) == 0: continue
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        # panel body: deep blue with a moonlit sheen, grid lines, frame
        gy = (np.arange(y0, y1, dtype=np.float32)[:, None] - y0) / max(1, y1 - y0); gx = (np.arange(x0, x1, dtype=np.float32)[None, :] - x0) / max(1, x1 - x0)
        body = np.array([92, 52, 30], np.float32) + (np.array([215, 190, 170], np.float32) - [92, 52, 30]) * (np.clip(1 - np.abs(gx + gy * 0.6 - 0.75) * 3.2, 0, 1) ** 2 * 0.55)[..., None]
        grid = np.zeros((H, W), np.float32)
        for k in range(1, 4): a0 = op[0] + (op[1] - op[0]) * k / 4; a1 = op[3] + (op[2] - op[3]) * k / 4; cv2.line(grid, tuple((a0 * 8).astype(int)), tuple((a1 * 8).astype(int)), 1.0, 1, cv2.LINE_AA, shift=3)
        a0 = (op[0] + op[3]) / 2; a1 = (op[1] + op[2]) / 2; cv2.line(grid, tuple((a0 * 8).astype(int)), tuple((a1 * 8).astype(int)), 1.0, 1, cv2.LINE_AA, shift=3)
        cv2.polylines(grid, [(op * 8).astype(np.int32)], True, 1.6, 2, cv2.LINE_AA, shift=3)
        mm = m[y0:y1, x0:x1, None] * a; r = c[y0:y1, x0:x1]
        r[:] = r * (1 - mm) + body * mm; r[:] += grid[y0:y1, x0:x1, None] * np.array([200, 170, 140], np.float32) * 0.55 * a
    e = ease(seg(t, 25.55, 26.0))                                                  # stored energy: a cool glow lifting from the panels
    if e > 0:
        op, s = fwd(cx, cy, z, rot, [(475, 918), (560, 918)])
        for (x, y) in op: c = glow(c, x, y, 120, np.array([255, 235, 205], np.float32), 0.35 * e * (0.85 + 0.15 * np.sin(t * 9)))
        r2 = np.random.default_rng(3)
        for j in range(26):
            ph = r2.uniform(0, 1); x = op[0][0] + r2.uniform(-90, 260); y = op[0][1] - ((t - 25.55) * 160 + ph * 220) % 260
            c = glow(c, x, y, 3.5, np.array([255, 245, 225], np.float32), 0.9 * e)
    return c
CARRY = [(P_LEFT[::-1], 0.0), (P_STAIRS[::-1][:7], 0.25), (P_LEFT[::-1], 0.5), (P_STAIRS[::-1][:7], 0.7)]
def ov_carry(c, t, cam):
    cx, cy, z, rot = cam[:4]
    for i, (pts, off) in enumerate(CARRY):
        pts = np.array(pts, np.float32); segl = np.hypot(*np.diff(pts, axis=0).T); L = segl.sum() * min(1, (t - 26.2) * 0.42 + off)
        acc = 0; p = pts[-1]
        for k_, l in enumerate(segl):
            if acc + l >= L: p = pts[k_] + (pts[k_ + 1] - pts[k_]) * ((L - acc) / l); break
            acc += l
        op, s = fwd(cx, cy, z, rot, [p]); x, y = op[0]
        c = glow(c, x, y, 10 * s / 1.6, WARM, 0.9); c = glow(c, x, y, 40 * s / 1.6, WARM, 0.25 * (0.8 + 0.2 * np.sin(t * 13 + i)))
    return c
LIGHTS = [(232, 902), (600, 902), (508, 888), (62, 832), (232, 812), (372, 806), (432, 870), (905, 1476), (760, 1486), (135, 1003), (300, 1150), (450, 1240)]
def lights_level(t):
    """0 = village dark, 1 = floodlights on"""
    return float(np.clip(ease(seg(t, 29.6, 30.1)) * (1 - 0.35 * seg(t, 36.0, 38.0)), 0, 1))
def ov_lights(c, t, cam, frame_d, kind):
    cx, cy, z, rot = cam[:4]; op, s = fwd(cx, cy, z, rot, LIGHTS)
    if kind == 'roofs':
        for i, (x, y) in enumerate(op[:7]):
            tt = 28.25 + 0.17 * i; a = (1 if t > tt else 0) * (0.55 + 0.45 * (np.sin((t - tt) * 40) > -0.3))
            c = flare(c, x, y, 20 * s / 2, WARM, a * 0.8, rays=4)
        return c
    L = lights_level(t); flick = 1.0 + 0.5 * bump(t, 29.6, 29.75) + 0.12 * bump(t, 31.3, 31.6)
    if L > 0:
        lm = np.zeros((H // 4, W // 4), np.float32)
        for i, (x, y) in enumerate(op):
            on = ease(seg(t, 29.6 + i * 0.035, 29.8 + i * 0.035)) if t < 36 else 1.0
            cv2.circle(lm, (int(x / 4), int(y / 4)), 1, on, -1)
            lm = lm
        lm = cv2.GaussianBlur(lm, (0, 0), 55 * s / 4) * 900 / max(1, s); lm = cv2.resize(lm, (W, H))[..., None]
        c = c * (1 + np.clip(lm, 0, 1.8) * 0.30 * L * flick) + np.clip(lm, 0, 1.3) * WARM * 0.36 * L * flick
        for i, (x, y) in enumerate(op):
            on = ease(seg(t, 29.6 + i * 0.035, 29.8 + i * 0.035)) if t < 36 else 1.0
            c = flare(c, x, y, 26 * s / 1.3, WARM, 0.55 * L * on * flick, rays=6, rot=0.3 * i)
    return c
FLASH_T = [(33.9, 760, 700), (34.15, 840, 820), (34.35, 700, 860), (34.53, 880, 640), (34.7, 620, 760), (34.87, 800, 760), (35.05, 690, 690), (35.17, 860, 880), (35.35, 740, 800)]
IMPACT = [34.15, 34.53, 34.87, 35.17]
def shake(t):
    a = sum(np.exp(-(t - ti) / 0.18) for ti in IMPACT if t >= ti) * 9
    return a * np.sin(t * 77), a * np.cos(t * 63)
def ov_battle(c, t, cam):
    cx, cy, z, rot = cam[:4]
    tension = ease(seg(t, 32.2, 33.6)); c = c * (1 - 0.10 * tension)
    op, s = fwd(cx, cy, z, rot, [(p[1], p[2]) for p in FLASH_T])
    for (tf, _, _), (x, y) in zip(FLASH_T, op):
        if tf <= t < tf + 0.5: a = np.exp(-(t - tf) / 0.09); c = flare(c, x, y, 46, np.array([150, 215, 255], np.float32), a, rays=4, rot=tf)
    # glare from the lit village on the left
    gl = np.clip(1 - xx / (W * 0.9), 0, 1)[..., None] ** 2; c += gl * WARM * 0.22 * (0.8 + 0.2 * np.sin(t * 17)) * seg(t, 33.7, 34.0)
    return c
def impact_frame(c, t):
    for ti in IMPACT:
        if ti <= t < ti + 2.5 / FPS:
            l = c.mean(2, keepdims=True); lo, hi = np.percentile(l[::8, ::8], [45, 85]); m = np.clip((l - lo) / max(8, hi - lo), 0, 1)
            return NAVY * 0.6 * (1 - m) + np.array([170, 225, 255], np.float32) * m
    return c
SPEED = None
def speed_lines(c, t, a):
    global SPEED
    if a <= 0.01: return c
    if SPEED is None:
        r = np.random.default_rng(5); SPEED = []
        for _ in range(70): an = r.uniform(0, 2 * np.pi); SPEED.append((an, r.uniform(0.45, 0.8), r.uniform(0.85, 1.4), r.uniform(1, 3)))
    m = np.zeros((H, W), np.float32)
    for an, r0, r1, w in SPEED:
        R = 1150; p0 = (W / 2 + np.cos(an) * R * r0, H / 2 + np.sin(an) * R * r0); p1 = (W / 2 + np.cos(an) * R * r1, H / 2 + np.sin(an) * R * r1)
        cv2.line(m, (int(p0[0] * 8), int(p0[1] * 8)), (int(p1[0] * 8), int(p1[1] * 8)), 1.0, int(w), cv2.LINE_AA, shift=3)
    return c + m[..., None] * np.array([210, 235, 255], np.float32) * 0.5 * a
def ov_idea(c, t, cam):
    """«اجلسوا وفكّروا من خارج الصندوق»: warm thought-light grows, a square of light appears and the light breaks out of it"""
    cx, cy, z, rot = cam[:4]; (hx, hy), = fwd(cx, cy, z, rot, [(424, 880)])[0]
    w1 = ease(seg(t, 14.7, 16.0)); c = glow(c, hx, hy - 10, 150, WARM, 0.22 * w1 * (0.9 + 0.1 * np.sin(t * 7)))
    sq = ease(seg(t, 16.2, 16.45)) * (1 - ease(seg(t, 16.75, 17.1)))
    if sq > 0:
        half = 190 + 30 * seg(t, 16.2, 17.1); m = np.zeros((H, W), np.float32)
        cv2.rectangle(m, (int((hx - half) * 8), int((hy - half) * 8)), (int((hx + half) * 8), int((hy + half) * 8)), 1.0, 3, cv2.LINE_AA, shift=3)
        c += (m[..., None] + cv2.GaussianBlur(m, (0, 0), 7)[..., None] * 1.5) * AMBER * sq * 0.9
    br = seg(t, 16.55, 17.15)
    if br > 0:
        r2 = np.random.default_rng(11)
        for j in range(60):
            an = r2.uniform(0, 2 * np.pi); sp = r2.uniform(260, 560); d = 150 + ease(br) * sp
            x = hx + np.cos(an) * d; y = hy + np.sin(an) * d * 0.9; a = (1 - br) * 1.0
            c = glow(c, x, y, r2.uniform(3, 6), WARM, a)
        c = glow(c, hx, hy, 260 * (0.6 + br), WARM, 0.25 * bump(br, 0, 1))
    return c

# ---------------------------------------------------------------- render one shot frame
def shot_frame(sh, t):
    cam = campose(sh, t); n = sh['n']; cx, cy, z, rot, px, py, dolly = cam
    if n == 'battle':
        dx, dy = shake(t); punch = sum(0.08 * np.exp(-(t - ti) / 0.22) for ti in IMPACT if t >= ti); z = z + punch; cx += dx / (W * z / 928); cy += dy / (W * z / 928)
    ex = ('warm', 'star') if sh['k'] == 'A' else ('warm',)
    f, masks, d = camwarp(sh['k'], cx, cy, z, rot, px, py, dolly, extra=ex); cam = (cx, cy, z, rot)
    warm = masks[0][..., None]
    # living light: lanterns and windows breathe
    fl = 0.10 * np.sin(t * 11.3) + 0.07 * np.sin(t * 17.9 + 1) + 0.05 * np.sin(t * 5.1)
    if sh['k'] == 'A':
        if n in ('lights',): dark = 1 - 0.6 * (1 - lights_level(t)) * seg(t, 29.05, 29.3)
        elif n == 'battle': dark = 0.95
        else: dark = 1.0
        f = f * dark + warm * WARM * (0.18 + fl) * (1 if n != 'lights' or lights_level(t) > 0.2 else 0.3)
        tw = masks[1][..., None] * (0.5 + 0.5 * np.sin(t * 3.1 + xx[..., None] * 0.05))
        f = f + tw * np.array([255, 245, 235], np.float32) * 0.7
        # drifting haze over the valley
        hz = HAZE[int(t * 4) % len(HAZE)]; f = f + hz * HAZEC * np.clip(1 - np.abs(d[..., None] - 0.32) / 0.25, 0, 1) * 0.5
    else:
        f = f * (1 + warm * (0.30 + 2.2 * fl))
    if n == 'captive' and t > 6.2: f = f * (1 + 0.10 * ease(seg(t, 6.2, 7.2)) * np.clip(1 - np.hypot(U - 120, V + 380) / 900, 0, 1)[..., None])
    if n == 'paths': f = ov_paths(f * (1 - 0.18 * seg(t, 18.9, 19.4)), t, cam)
    if n == 'solar': f = ov_solar(f, t, cam)
    if n == 'carry': f = ov_carry(f, t, cam)
    if n in ('roofs',): f = ov_lights(f, t, cam, d, 'roofs')
    if n in ('lights', 'end', 'battle'): f = ov_lights(f, t, cam, d, 'main')
    if n == 'battle': f = ov_battle(f, t, cam)
    if n == 'raed2': f = ov_idea(f, t, cam)
    if n == 'lamp': f = glow(f, W / 2, H / 2 - 40, 260, WARM, 0.35 * ease(seg(t, 27.4, 28.1)))
    if n == 'victory': f = f * (1 + 0.12 * ease(seg(t, 35.9, 37.2))) + WARM * 0.05 * ease(seg(t, 35.9, 37.2))
    # dust in the light
    dcol = WARM if sh['k'] != 'A' else np.array([235, 225, 215], np.float32)
    f = DUST[sum(map(ord, n)) % 4].draw(f, t, dcol, 0.5 if sh['k'] != 'A' else 0.35, lumof(f))
    if n == 'battle': f = DUST[2].draw(f, t * 3.0, np.array([170, 200, 230], np.float32), 1.0 * seg(t, 33.7, 34.0), None)
    return f
HAZE = []
_hz = cv2.resize(rng.standard_normal((40, 24)).astype(np.float32), (W * 2, H), interpolation=cv2.INTER_CUBIC); _hz = cv2.GaussianBlur(_hz, (0, 0), 60)
HAZEC = np.array([1.0, 0.9, 0.75], np.float32)
for i in range(16):
    o = int(i * W / 16); HAZE.append((np.clip(_hz[:, o:o + W], 0, None) * 40)[..., None].astype(np.float32))

def whip(f, dirx):
    k = np.zeros((1, 61), np.float32); k[0, :] = 1 / 61; return cv2.filter2D(f, -1, k)
def picture(t):
    i = max(j for j, s in enumerate(SHOTS) if s['t0'] <= t or j == 0); sh = SHOTS[i]
    f = shot_frame(sh, t)
    # transition into this shot
    tr = TRANS.get(sh['n'])
    if tr and i > 0 and t < sh['t0'] + tr[1]:
        kind, d = tr; p = (t - sh['t0']) / d; prev = shot_frame(SHOTS[i - 1], t)
        if kind == 'dis': f = prev * (1 - eio(p)) + f * eio(p)
        elif kind == 'flash':
            f = prev * (1 - eio(p)) + f * eio(p); fl = bump(p, 0, 1); f = f + (np.array([200, 235, 255], np.float32) - f) * fl * 0.85
        elif kind == 'whip':
            a = eio(p); mix = prev * (1 - a) + f * a; f = whip(mix, 1) * bump(p, 0, 1) + mix * (1 - bump(p, 0, 1))
    # leaving: flash into the doorway at the end of shot 1 is handled by 'captive' flash
    return f

# ---------------------------------------------------------------- text (channel style)
def F(n, s): return ImageFont.truetype(TH + n, s, layout_engine=ImageFont.Layout.RAQM)
def to_f(im):
    a = np.array(im).astype(np.float32); a[..., :3] = a[..., :3][..., ::-1].copy(); a[..., 3] /= 255; return a
def text_img(runs, font, size, stroke=0):
    f = F(font, size); asc, desc = f.getmetrics(); pad = 10 + stroke * 2; parts = []
    for t, col in runs:
        tw = int(f.getlength(t, direction='rtl', language='ar')) + 2 * pad; hh = int((asc + desc) * 1.25) + 2 * pad
        im = Image.new('RGBA', (tw, hh), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((tw - pad, pad), t, font=f, fill=tuple(int(c) for c in col[::-1]) + (255,), anchor='ra', direction='rtl', language='ar', stroke_width=stroke, stroke_fill=(10, 14, 22, 255))
        parts.append(to_f(im))
    g = int(size * 0.32) - 2 * pad; tw = sum(p.shape[1] for p in parts) + g * (len(parts) - 1); hh = max(p.shape[0] for p in parts)
    out = np.zeros((hh, tw, 4), np.float32); x = tw
    for p in parts:
        x -= p.shape[1]; o = out[:p.shape[0], x:x + p.shape[1]]; a = p[..., 3:]; o[..., :3] = o[..., :3] * (1 - a) + p[..., :3] * a; o[..., 3:] = np.maximum(o[..., 3:], a); x -= g
    return out
def put(c, img, cx, cy, s=1.0, alpha=1.0, shadow=0.55, blur=0.0, glow_=0.0):
    if alpha <= 0.01 or s <= 0.01: return c
    h, w = img.shape[:2]; pad = int(30 + blur * 3 + (40 if glow_ > 0 else 0))
    X0 = int(cx - w * s / 2) - pad; Y0 = int(cy - h * s / 2) - pad; X1 = int(cx + w * s / 2) + pad; Y1 = int(cy + h * s / 2) + pad
    x0, y0, x1, y1 = max(0, X0), max(0, Y0), min(W, X1), min(H, Y1)
    if x1 <= x0 or y1 <= y0: return c
    M = np.float32([[s, 0, cx - w * s / 2 - X0], [0, s, cy - h * s / 2 - Y0]])
    rgba = cv2.warpAffine(img, M, (X1 - X0, Y1 - Y0), flags=cv2.INTER_LINEAR)[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
    if blur > 0.3: rgba = cv2.GaussianBlur(rgba, (0, 0), blur)
    r = c[y0:y1, x0:x1]; a = rgba[..., 3:] * alpha
    if shadow > 0: sh = cv2.GaussianBlur(rgba[..., 3], (0, 0), 10)[..., None] * shadow * alpha; r = r * (1 - sh * 0.85)
    if glow_ > 0: gg = np.clip(cv2.GaussianBlur(rgba[..., 3], (0, 0), 16) * 1.5, 0, 1)[..., None] * glow_ * alpha; r = r + (ORANGE - r) * gg * 0.55
    c[y0:y1, x0:x1] = r * (1 - a) + rgba[..., :3] * a; return c
CAPS = []
def cap(a, b, txt, starts):
    ws = []
    for part in re.split(r'(\[\[.*?\]\])', txt):
        if not part.strip(): continue
        st = part.startswith('[['); ws += [(w_, st) for w_ in (part[2:-2] if st else part).split()]
    assert len(starts) == len(ws), (txt, len(ws), len(starts))
    imgs = []
    for w_, st in ws:
        sz = 74 if st else 64; col = ORANGE if st else WHITE
        imgs.append((text_img([(w_, col)], 'thmanyahsans-Black.ttf' if st else 'thmanyahsans-Bold.ttf', sz, stroke=4), text_img([(w_, AMBER)], 'thmanyahsans-Bold.ttf', sz, stroke=4) if not st else None))
    gap = 18; rows = [[]]; cur = 0
    for i, (im, _) in enumerate(imgs):
        if rows[-1] and cur + gap + im.shape[1] > 860: rows.append([]); cur = 0
        rows[-1].append(i); cur += im.shape[1] + (gap if cur else 0)
    pos = {}; rh = 84; y0 = 1388 - (len(rows) - 1) * rh
    for r, row in enumerate(rows):
        tot = sum(imgs[i][0].shape[1] for i in row) + gap * (len(row) - 1); x = W / 2 - 30 + tot / 2
        for i in row: wd = imgs[i][0].shape[1]; pos[i] = (x - wd / 2, y0 + r * rh); x -= wd + gap
    CAPS.append(dict(a=a, b=b, ws=ws, st=starts, imgs=imgs, pos=pos))
def draw_caps(c, t):
    for L in CAPS:
        if not (L['a'] - 0.1 <= t < L['b'] + 0.5): continue
        out = eio(seg(t, L['b'], L['b'] + 0.3)); nxt = L['st'][1:] + [L['b']]
        for i, (w_, st) in enumerate(L['ws']):
            if t < L['st'][i]: continue
            p = t - L['st'][i]; x, y = L['pos'][i]; im, lit = L['imgs'][i]
            if st: c = put(c, im, x, y - 10 * out, 1.0 + 0.25 * (1 - ease(p / 0.25)), min(1, p / 0.08) * (1 - out), shadow=0.65, glow_=0.45 * np.exp(-p / 0.6) * (1 - out))
            else:
                use = lit if L['st'][i] <= t < nxt[i] + 0.05 else im
                c = put(c, use, x, y + 14 * (1 - ease(p / 0.22)) - 10 * out, 1.0, min(1, p / 0.12) * (1 - out), shadow=0.65)
    return c
def cap_band(t):
    v = 0.0
    for L in CAPS: v = max(v, eio(seg(t, L['a'] - 0.3, L['a'])) * (1 - eio(seg(t, L['b'] + 0.2, L['b'] + 0.6))))
    return v
CAPF = (np.clip(1 - np.abs(yy - 1390) / 260, 0, 1) ** 1.2)[..., None]
# words: film time = original time - 31.85 (original captions text, approved by the owner)
cap(1.01, 2.95, 'أما أشهر معركة من قصصهم', [1.01, 1.51, 2.07, 2.51, 2.61])
cap(4.51, 6.25, 'طبعاً أسروا عدد من [[المقاتلين]]', [4.51, 5.09, 5.41, 5.61, 5.73])
cap(6.31, 7.88, 'خبّرهم أسير عن هجوم [[حوثي]]', [6.31, 6.95, 7.29, 7.37, 7.65])
cap(7.91, 9.58, 'مرتقب على قريتهم [[الليلة]]', [7.91, 8.39, 8.57, 9.13])
cap(9.61, 11.5, 'أمام رائد ورفاقه [[سؤال صعب]]', [9.61, 10.07, 10.41, 10.83, 11.21])
cap(11.57, 12.98, 'هيا كيف نواجه هجوم ليلي', [11.57, 11.81, 12.09, 12.37, 12.67])
cap(13.01, 14.25, 'وإحنا ما معاناش [[ذخيرة كثير؟]]', [13.01, 13.27, 13.39, 13.63, 13.87])
cap(14.55, 16.25, 'قال لهم: اجلسوا [[وفكّروا]]', [14.55, 14.69, 14.99, 15.55])
cap(16.29, 17.12, '[[من خارج الصندوق]]', [16.29, 16.39, 16.65])
cap(17.15, 18.8, 'واحد مسك معه قال لهم:', [17.15, 17.63, 18.09, 18.31, 18.57])
cap(18.83, 20.62, 'إحنا نعرف [[القرية]] أكثر منهم', [18.83, 19.35, 19.73, 19.99, 20.25])
cap(20.67, 21.8, 'مداخلها [[ومخارجها]]', [20.67, 21.27])
cap(21.83, 23.0, 'دارين من أين شيتسللوا', [21.83, 22.21, 22.36, 22.57])
cap(23.07, 24.5, 'أما ابن الذين اللي قال:', [23.07, 23.45, 23.79, 24.15, 24.33])
cap(24.53, 26.3, 'معانا منظومة [[طاقة شمسية]]', [24.53, 25.21, 25.61, 25.83])
cap(26.35, 27.68, 'ننقل للمكان المناسب', [26.35, 26.81, 27.29])
cap(27.71, 29.02, 'ونجهّز [[كشافات ضوء]]', [27.71, 28.19, 28.65])
cap(29.05, 30.1, 'ونخلهم [[يشقحوا]]', [29.05, 29.63])
cap(30.13, 32.12, 'نحوّل ظلام الليل [[لنقطة قوة]] لنا', [30.13, 30.67, 30.97, 31.33, 31.63, 31.91])
cap(32.19, 33.72, 'ولما جات ساعة [[الصفر]]', [32.19, 32.79, 33.05, 33.29])
cap(33.75, 34.84, 'وقع [[خفع الخفع]]', [33.75, 34.15, 34.53])
cap(34.87, 35.72, '[[لمخ اللمخ]]', [34.87, 35.17])
cap(35.95, 37.5, 'وانتصرت [[كحلان]] بعقول أهله', [35.95, 36.55, 36.87, 37.15])
cap(37.55, 38.56, 'تجربة حمت [[الأرواح]]', [37.55, 37.91, 38.13])
cap(38.59, 40.4, 'وعلّمت احنا درس [[بالمسؤولية]]', [38.59, 39.19, 39.37, 39.61])
# title (the battle's name)
TITLE = [fit for fit in [text_img([('معركة', WHITE), ('ضاويله', ORANGE), ('الليلية', WHITE)], 'thmanyahserifdisplay-Black.ttf', 118)]][0]
def draw_title(c, t):
    a = eio(seg(t, 3.0, 3.6)) * (1 - eio(seg(t, 4.35, 4.75)))
    if a <= 0: return c
    sc = min(1.0, 920 / TITLE.shape[1]) * (1.06 - 0.06 * ease(seg(t, 3.0, 4.6)))
    m = np.zeros((H, W), np.float32); half = 300 * ease(seg(t, 3.3, 4.0)); cv2.line(m, (int((W / 2 - half) * 8), 1035 * 8), (int((W / 2 + half) * 8), 1035 * 8), 1.0, 3, cv2.LINE_AA, shift=3)
    c = c * (1 - 0.35 * a * np.clip(1 - np.abs(yy - 960) / 260, 0, 1)[..., None])
    c = c + (AMBER - c) * (m * 0.85 * a)[..., None]
    return put(c, TITLE, W / 2, 950, sc, a, shadow=0.7, glow_=0.3 * np.exp(-(t - 3.0) / 1.0))

# ---------------------------------------------------------------- brand
LOGO = cv2.resize(cv2.imread(K + '01-logo/logo-dark-round-256.png', -1).astype(np.float32), (96, 96), interpolation=cv2.INTER_AREA); LOGO[..., 3] /= 255
CRED = None
def pill(txt):
    f = F('thmanyahsans-Medium.ttf', 30); tw = int(f.getlength(txt, direction='rtl', language='ar')) + 44
    im = Image.new('RGBA', (tw, 52), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.rounded_rectangle((0, 0, tw - 1, 51), 26, fill=(15, 27, 45, 190), outline=(242, 165, 65, 150), width=2)
    d.text((tw - 22, 26), txt, font=f, fill=(216, 223, 230, 255), anchor='rm', direction='rtl', language='ar'); return to_f(im)
CRED = pill('صوت: نائف الوافي · مشاهد تمثيلية بالرسم')
def brand(c, t):
    a = eio(seg(t, 0.6, 1.6)) * (1 - eio(seg(t, END - 0.6, END)))
    c = put(c, LOGO, 100, 330, 1.0, 0.9 * a, shadow=0.35)
    c = put(c, CRED, W / 2 - 30, 1478, 1.0, 0.92 * a, shadow=0.0)
    return c
CL_LOGO = cv2.resize(cv2.imread(K + '01-logo/logo-dark-round-512.png', -1).astype(np.float32), (330, 330), interpolation=cv2.INTER_AREA); CL_LOGO[..., 3] /= 255
CL_T1 = text_img([('الثبات', WHITE), ('عز', ORANGE)], 'thmanyahserifdisplay-Black.ttf', 120)
CL_T2 = text_img([('الكلمة مقاومة', AMBER)], 'thmanyahsans-Bold.ttf', 60)
def closing(c, t):
    a = eio(seg(t, END - 0.5, END + 1.2))
    if a <= 0: return c
    c = c * (1 - 0.86 * a) + NAVY * 0.6 * a
    c = put(c, CL_LOGO, W / 2, 790 - 20 * (1 - eio(seg(t, END, END + 2.0))), 1.0, eio(seg(t, END, END + 1.5)), shadow=0.4)
    c = put(c, CL_T1, W / 2, 1075, 1.0, eio(seg(t, END + 0.5, END + 1.8)), blur=(1 - eio(seg(t, END + 0.5, END + 1.6))) * 3)
    c = put(c, CL_T2, W / 2, 1195, 1.0, eio(seg(t, END + 1.0, END + 2.3)))
    m = np.zeros((H, W), np.float32); half = 210 * ease(seg(t, END + 1.2, END + 2.5))
    cv2.line(m, (int((W / 2 - half) * 8), 1262 * 8), (int((W / 2 + half) * 8), 1262 * 8), 1.0, 3, cv2.LINE_AA, shift=3)
    return c + (AMBER - c) * (m * 0.85)[..., None]

def frame(t):
    c = picture(t)
    c = impact_frame(c, t)
    if 33.7 < t < 35.9: c = speed_lines(c, t, max(np.exp(-(t - ti) / 0.15) for ti in IMPACT if t >= ti) if t >= IMPACT[0] else 0)
    c = bloom(c, 205, 0.32)
    c = c * VIG
    c = c * (1 - 0.30 * cap_band(t) * CAPF)
    if t < 0.8: c = c * eio(t / 0.8)
    if 35.6 < t < 36.1: c = c + (np.array([220, 240, 255], np.float32) - c) * 0.0
    c = draw_title(c, t); c = draw_caps(c, t); c = brand(c, t); c = closing(c, t)
    c = c + GRAIN[int(t * FPS) % len(GRAIN)]
    return np.clip(c, 0, 255).astype(np.uint8)

N = int(round(DUR * FPS))
if __name__ == '__main__':
    MODE = sys.argv[1]
    if MODE == 'still':
        for t in [float(x) for x in sys.argv[2:]]: cv2.imwrite(WK + f'st_{t:05.2f}.jpg', frame(t), [cv2.IMWRITE_JPEG_QUALITY, 88])
    elif MODE == 'render':
        part, parts = int(sys.argv[2]), int(sys.argv[3]); i0 = N * part // parts; i1 = N * (part + 1) // parts
        enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
                                '-crf', '17', '-pix_fmt', 'yuv420p', WK + f'p{part}.mp4'], stdin=subprocess.PIPE)
        for i in range(i0, i1): enc.stdin.write(frame(i / FPS).tobytes())
        enc.stdin.close(); enc.wait(); print('part done', part, flush=True)
    elif MODE == 'finish':
        parts = int(sys.argv[2]); lst = WK + 'parts.txt'; open(lst, 'w').write(''.join(f"file '{WK}p{k}.mp4'\n" for k in range(parts)))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', WK + 'body.mp4'], check=True)
        os.makedirs(OUTD, exist_ok=True); out = OUTD + 'maarakat-dhawila-allayliya.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'body.mp4', '-i', WK + 'mix.wav', '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
        print('ok', out)
