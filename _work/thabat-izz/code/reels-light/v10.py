# «كيف يا قرآن ربيت الرجال» — luminous light-theme reel (ceremony footage re-cut to the nasheed, vocals only)
import sys, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mg import *
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
V = S_ + 'v10/'; WK = V + 'work/'; BR = S_ + 'mg/broll/'; OUTD = '/home/user/final/reels-light/'
os.makedirs(WK, exist_ok=True)
SRC = V + 'src/in_h264.mp4'; OUT_T = 22.85; DUR = 25.6
GOLD = C('E9B65C'); LIGHTGOLD = C('FFE7B5')
# ---------------------------------------------------------------- edit list: (film t0, film t1, source t0)
EDIT = [(0.0, 1.92, 8.5), (1.92, 7.30, 0.0), (7.30, 9.42, 6.0), (9.42, 12.06, 12.0), (12.06, 14.22, 1.0), (14.22, 16.76, 14.6),
        (16.76, 19.76, 18.0), (19.76, 20.62, 21.5), (20.62, 23.0, 2.0)]
CUTS = [a for a, _, _ in EDIT[1:]]
class Reader:
    def __init__(s): s.cap = cv2.VideoCapture(SRC); s.pos = -1; s.last = None
    def get(s, ts):
        want = int(round(ts * 30))
        if want < s.pos or want > s.pos + 40: s.cap.set(cv2.CAP_PROP_POS_FRAMES, want); s.pos = want - 1
        while s.pos < want:
            ok, f = s.cap.read(); s.pos += 1
            if ok: s.last = f
        return s.last
RD = Reader()
FREEZE = None
def src_t(t):
    for a, b, s0 in EDIT:
        if a <= t < b: return s0 + (t - a), a
    a, b, s0 = EDIT[-1]; return s0 + (t - a), a
def footage(t):
    ts, a = src_t(t); f = RD.get(min(ts, 22.9)).astype(np.float32)
    # light, warm grade: lift shadows, soften contrast, warm highlights
    f = 255 * (1 - (1 - f / 255) ** 1.18); f = f * 0.93 + 18; f[..., 2] *= 1.03; f[..., 0] *= 0.97
    return np.clip(f, 0, 255), a
# ---------------------------------------------------------------- window (footage inside a light frame)
def window(c, t, inset=1.0, zoom=1.0, fx=0.5, fy=0.5, rad=46):
    """inset 1 = framed card, 0 = full bleed"""
    f, _ = footage(t); h, w = f.shape[:2]
    g = 1 - inset                                                        # 0..1 grow a little on the big moments (never over the word band)
    ww = int(1000 + 40 * g); wh = int(740 + 40 * g); cx, cy = W / 2, 960 + 20 * g
    sc = max(ww / w, wh / h) * zoom; cw, ch = ww / sc, wh / sc; x0 = np.clip(fx * w - cw / 2, 0, w - cw); y0 = np.clip(fy * h - ch / 2, 0, h - ch)
    M = np.float32([[sc, 0, -x0 * sc], [0, sc, -y0 * sc]]); img = cv2.warpAffine(f, M, (ww, wh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    m = round_mask(ww, wh, rad)
    return place(c, img, m, cx, cy, 1.0, 1.0, 0.0, border=6, border_col=PAPER, shadow=0.35), img
def wash(c, top=0.0, bottom=0.0):
    """light theme: soft cream wash at the top/bottom of the picture where words sit"""
    if top > 0: c = c + (PAPER - c) * (np.clip(1 - (yy - 160) / 620, 0, 1) ** 1.6)[..., None] * top
    if bottom > 0: c = c + (PAPER - c) * (np.clip((yy - 1180) / 420, 0, 1) ** 1.4)[..., None] * bottom
    return c
def godrays(c, t, x, y, a=1.0, n=14, col=None):
    if a <= 0.01: return c
    col = LIGHTGOLD if col is None else col
    an = np.arctan2(yy - y, xx - x); r = np.hypot(xx - x, yy - y)
    pat = (0.5 + 0.5 * np.cos(an * n + t * 0.6)) ** 6 * np.exp(-r / 1100) * np.clip(r / 120, 0, 1)
    return c + (col - c) * (pat * 0.55 * a)[..., None]
class Bokeh:
    def __init__(s, n, seed):
        r = np.random.default_rng(seed); s.x = r.uniform(0, W, n); s.y = r.uniform(0, H, n); s.r = r.uniform(14, 46, n); s.v = r.uniform(-30, -10, n); s.ph = r.uniform(0, 6.28, n)
    def draw(s, c, t, a=1.0):
        if a <= 0.01: return c
        m = np.zeros((H // 2, W // 2), np.float32)
        for x, y, r, v, ph in zip(s.x, s.y, s.r, s.v, s.ph):
            yy_ = (y + v * t) % H; xx_ = x + 20 * np.sin(t * 0.4 + ph); cv2.circle(m, (int(xx_ * 4), int(yy_ * 4)), int(r * 2), 0.35 + 0.25 * np.sin(t + ph) ** 2, -1, cv2.LINE_AA, shift=3)
        m = cv2.resize(cv2.GaussianBlur(m, (0, 0), 3), (W, H))[..., None]
        return c + (LIGHTGOLD - c) * np.clip(m * a, 0, 1)
BOKEH = Bokeh(22, 4); SPARK = Dust(70, 8, WHITE, (1.5, 4), (-10, -35), 0.8); GDUST = Dust(50, 9, GOLD, (2, 5), (-20, -50), 0.5)
def sparkle(c, t, t0, x, y, n=9, spread=260, life=1.2, seed=1):
    p = t - t0
    if p < 0 or p > life: return c
    r = np.random.default_rng(seed); m = np.zeros((H, W), np.float32)
    for i in range(n):
        sx = x + r.uniform(-spread, spread); sy = y + r.uniform(-spread * 0.4, spread * 0.4); d = r.uniform(0, 0.4); q = seg(p, d, d + 0.6)
        if q <= 0 or q >= 1: continue
        L = 26 * np.sin(np.pi * q) * r.uniform(0.6, 1.3)
        cv2.line(m, (int((sx - L) * 8), int(sy * 8)), (int((sx + L) * 8), int(sy * 8)), 1.0, 3, cv2.LINE_AA, shift=3); cv2.line(m, (int(sx * 8), int((sy - L) * 8)), (int(sx * 8), int((sy + L) * 8)), 1.0, 3, cv2.LINE_AA, shift=3)
    g = cv2.GaussianBlur(m, (0, 0), 3) * 1.6
    return c + (WHITE - c) * np.clip(m + g, 0, 1)[..., None]
PEAK = cv2.imread(BR + 'peak.jpg').astype(np.float32)
def mountain_layer(t, a):
    h, w = PEAK.shape[:2]; z = 1.05 + 0.08 * seg(t, 12.0, 14.3); sc = max(W / w, H / h) * z; cw, ch = W / sc, H / sc
    x0 = (w - cw) / 2; y0 = (h - ch) * 0.35; M = np.float32([[sc, 0, -x0 * sc], [0, sc, -y0 * sc]])
    return cv2.warpAffine(PEAK, M, (W, H), flags=cv2.INTER_AREA)
# ---------------------------------------------------------------- words
LYR = [('كيف', 0.0), ('يا', 0.34), ('قرآن', 0.58), ('ربيت', 1.92), ('الرجال', 2.98), ('كيف', 9.42), ('صاروا', 10.24), ('هكذا', 11.04), ('مثل', 12.06), ('الجبال', 12.86),
       ('تشهد', 14.22), ('الأيام', 15.54), ('لكن', 16.76), ('كلما', 17.34), ('صبروا', 18.82), ('أمجادها', 20.62)]
LN = [(0, 5, 9.3, [2, 4]), (5, 10, 14.1, [9]), (10, 12, 16.7, [11]), (12, 16, 22.8, [14, 15])]
CAPS = [Cap(LYR[a][1], end, [w for w, _ in LYR[a:b]], [s for _, s in LYR[a:b]], keys=[k - a for k in ks], y=1420, size=60) for a, b, end, ks in LN]
E = [
    T(0.58, 1.85, [('قرآن', NAVY)], 'naskh', 190, 'outline', x=510, y=430, glow=0.5, maxw=760),
    T(1.92, 2.9, [('ربيت', STEEL)], 'naskh', 140, 'rise', x=510, y=430, maxw=760),
    T(2.98, 9.3, [('الرجال', NAVY)], 'naskh', 200, 'space', x=510, y=430, maxw=760),
    T(10.24, 12.0, [('كيف', STEEL), ('صاروا', NAVY)], 'naskh', 110, 'flip', x=510, y=365, maxw=760),
    T(11.04, 12.0, [('هكذا', ORANGE)], 'naskh', 130, 'pop', x=510, y=495, maxw=760),
    T(12.06, 14.1, [('مثل', STEEL)], 'naskh', 100, 'drift', x=510, y=350, maxw=760),
    T(12.86, 14.1, [('الجبال', NAVY)], 'naskh', 180, 'rise', x=510, y=475, maxw=760),
    T(14.22, 16.7, [('تشهد', STEEL), ('الأيام', NAVY)], 'naskh', 130, 'wipe', x=510, y=430, maxw=760),
    T(17.34, 20.5, [('كلما', STEEL)], 'naskh', 96, 'drift', x=510, y=350, maxw=760),
    T(18.82, 20.5, [('صبروا', NAVY)], 'naskh', 170, 'outline', x=510, y=475, glow=0.35, maxw=760),
    T(20.62, 22.8, [('أمجادها', ORANGE)], 'naskh', 180, 'space', x=510, y=430, maxw=760),
]
CRED = credit_pill('المصدر: مركز دار القرآن')
SNAP_T = 6.55
def snapshot(c, t):
    """freeze-frame photo that flies out as a polaroid card"""
    global FREEZE
    p = t - SNAP_T
    if p < 0 or p > 1.6: return c
    if FREEZE is None:
        f, _ = footage(SNAP_T); h, w = f.shape[:2]; cw = 600; ch = 620; sc = max(cw / w, ch / h)
        M = np.float32([[sc, 0, -(w * sc - cw) / 2], [0, sc, -(h * sc - ch) * 0.25]]); FREEZE = cv2.warpAffine(f, M, (cw, ch))
    img = FREEZE; m = round_mask(img.shape[1], img.shape[0], 18)
    k = ease(seg(p, 0.12, 0.6)); out = ease(seg(p, 1.15, 1.6))
    x = 540 + 170 * k - 900 * out; y = 980 + 40 * k; s = 1.0 - 0.45 * k; rot = -8 * k - 10 * out
    c = place(c, img, m, x, y, s, 1.0, rot, border=18, border_col=WHITE, shadow=0.5)
    return c

def picture(t):
    c = background(t, leak=0.8)
    inset = 1.0
    if 2.98 <= t < 9.42: inset = 1 - eio(seg(t, 3.2, 4.2)) * (1 - eio(seg(t, 8.9, 9.42)))          # breathes wider on «الرجال»
    if 20.62 <= t: inset = 1 - eio(seg(t, 20.62, 21.3))
    # camera inside the footage, per shot
    _, a = src_t(t); p = t - a
    zoom = {0.0: 1.10 + 0.10 * p, 1.92: 1.0 + 0.05 * p, 7.30: 1.15 - 0.04 * p, 9.42: 1.05 + 0.10 * p, 12.06: 1.10, 14.22: 1.0 + 0.06 * p, 16.76: 1.25 - 0.03 * p, 19.76: 1.2, 20.62: 1.05 + 0.08 * p}.get(a, 1.0)
    fx = {7.30: 0.45 + 0.05 * p, 16.76: 0.5}.get(a, 0.5); fy = {0.0: 0.35, 1.92: 0.36, 7.30: 0.55, 9.42: 0.66, 14.22: 0.66, 16.76: 0.66, 19.76: 0.5, 20.62: 0.36}.get(a, 0.5)
    for ti in (10.24, 11.04, 12.86, 18.82): zoom += 0.07 * np.exp(-(t - ti) / 0.22) if t >= ti else 0
    if 12.06 <= t < 14.22:                                                   # «مثل الجبال»: the graduates float as a card over the mountain
        k = eio(seg(t, 12.06, 12.5)); ml = mountain_layer(t, 1.0); ml = ml * 0.82 + PAPER * 0.18
        c = c * (1 - k) + ml * k
        f, _ = footage(t); h, w = f.shape[:2]; cw, ch = 760, 680; sc = max(cw / w, ch / h) * 1.05
        M = np.float32([[sc, 0, -(w * sc - cw) / 2], [0, sc, -(h * sc - ch) * 0.30]]); img = cv2.warpAffine(f, M, (cw, ch))
        c = place(c, img, round_mask(cw, ch, 36), 540, 990 + 30 * (1 - ease(seg(t, 12.06, 12.6))) - 12 * seg(t, 12.6, 14.2), 0.92 + 0.08 * ease(seg(t, 12.06, 12.5)), k, -2 + 2 * seg(t, 12.06, 14.2), border=10, border_col=PAPER, shadow=0.5)
    else:
        c, img = window(c, t, inset, zoom, fx, fy)
    # cuts inside the footage: quick white flash
    for ct in CUTS:
        if ct <= t < ct + 0.16: c = c + (WHITE - c) * (1 - (t - ct) / 0.16) * 0.55
    return c
def frame(t):
    if t < OUT_T + 0.6: c = picture(min(t, OUT_T + 0.55))
    else: c = background(t)
    # light theme: cream wash where the words live (top) and at the caption band
    pass
    c = godrays(c, t, 540, -80, 0.8 * (eio(seg(t, 0.4, 1.2)) * (1 - eio(seg(t, 2.6, 3.4))) + bump(t, 20.5, 23.0) * 0.8), 16)
    if t < 1.0: c = c + (WHITE - c) * (1 - eio(t / 1.0)) * 0.9                  # open from light
    c = BOKEH.draw(c, t, 0.55); c = GDUST.draw(c, t, 0.7)
    if 2.98 <= t < 9.4: c = SPARK.draw(c, t, 0.6 * eio(seg(t, 3.0, 4.0)))
    for e in E: c = e.draw(c, t)
    for st_, x_, y_ in ((0.6, 510, 430), (3.0, 510, 430), (12.9, 510, 475), (18.9, 510, 475), (20.7, 510, 430)): c = sparkle(c, t, st_, x_, y_, 11, 300, 1.3, int(st_ * 10))
    if 12.86 <= t < 13.8: c = ring(c, t, 12.86, 510, 475, GOLD, 0.8, 60, 300, 5)
    if 14.22 <= t < 16.8:                                                     # «تشهد الأيام»: the day passes — a light sweep
        k = seg(t, 14.3, 16.6); lx = W * (1.2 - 1.4 * k); c = c + (LIGHTGOLD - c) * (np.exp(-((xx - lx) / 220) ** 2) * 0.28)[..., None]
    c = snapshot(c, t)
    if 20.62 <= t < 21.6: c = burst(c, t, 20.62, 510, 430, 50, GOLD, 600, 1.0, seed=21, size=4, grav=300)
    for L in CAPS: c = L.draw(c, t)
    a_b = eio(seg(t, 0.8, 1.3)) * (1 - eio(seg(t, OUT_T, OUT_T + 0.4)))
    c = brand_corner(c, t, a_b); c = put(c, CRED, W / 2 - 30, 1492, 1.0, 0.95 * a_b)
    c = outro(c, t, OUT_T)
    return finish_frame(c, t, 0.08)

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
        os.makedirs(OUTD, exist_ok=True); out = OUTD + '02-kayfa-ya-quran.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'body.mp4', '-i', WK + 'mix.wav', '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
        print('ok', out)
