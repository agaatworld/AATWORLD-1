# «نورٌ وظلام» — light vs dark comparison: Quran ceremony (seated, nasheed) vs Houthi poets (shouting). Voices + synthesized SFX, no music.
import sys, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_argv = sys.argv; sys.argv = ['x', 'none']
import v10 as L                                       # the light world (ceremony + nasheed) comes from the light reel
sys.argv = _argv
from mg import *
import sfx, soundfile as sf
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
V = S_ + 'v11/'; WK = V + 'work/'; OUTD = '/home/user/final/reels-light/'
os.makedirs(WK, exist_ok=True)
DSRC = V + 'src/in_h264.mp4'
BLACK = C('0B0F0C'); DGREEN = C('10291E'); MRED = C('8E2A24'); IVORY = C('EFE6D2'); ASH = C('9AA39C')
# ---------------------------------------------------------------- timeline
# (kind, film t0, film t1, source t0)  light: source = nasheed time; dark: source = poets video time
SEGS = [('title', 0.0, 2.6, 0.0), ('light', 2.6, 12.02, 0.0), ('dark', 12.02, 15.24, 13.1), ('light', 15.24, 20.04, 9.42),
        ('dark', 20.04, 23.54, 65.9), ('light', 23.54, 32.22, 14.22), ('dark', 32.22, 35.62, 89.5), ('final', 35.62, 40.2, 0.0)]
OUT_T = 40.2; DUR = 43.0
CROPS = {13.1: (300, 720, 760, 1035), 65.9: (380, 720, 880, 1035), 89.5: (220, 705, 860, 1035)}
FYD = {13.1: 0.3, 65.9: 0.2, 89.5: 0.0}
def seg_at(t):
    for s in SEGS:
        if s[1] <= t < s[2]: return s
    return SEGS[-1]
# ---------------------------------------------------------------- dark world
class DReader:
    def __init__(s): s.cap = cv2.VideoCapture(DSRC); s.pos = -1; s.last = None
    def get(s, ts):
        want = int(round(ts * 30))
        if want < s.pos or want > s.pos + 40: s.cap.set(cv2.CAP_PROP_POS_FRAMES, want); s.pos = want - 1
        while s.pos < want:
            ok, f = s.cap.read(); s.pos += 1
            if ok: s.last = f
        return s.last
DR = DReader()
FOG = [cv2.GaussianBlur(np.random.default_rng(i).standard_normal((H // 8, W // 8)).astype(np.float32), (0, 0), 6) for i in range(3)]
def dark_bg(t):
    c = np.broadcast_to(BLACK, (H, W, 3)).astype(np.float32).copy()
    f = sum(cv2.resize(np.roll(FOG[i], int(t * (6 + 4 * i)), axis=1), (W, H), interpolation=cv2.INTER_CUBIC) for i in range(3)) / 3
    f = np.clip(f * 2.2 + 0.25, 0, 1)[..., None]; c = c + (DGREEN - c) * f * 0.9
    g = np.exp(-((xx - 540) ** 2 + (yy - 980) ** 2) / (2 * 520 ** 2))[..., None]; c = c + (MRED * 0.55 - c) * g * 0.22
    return c
def dark_grade(f):
    g = f.mean(2, keepdims=True); f = f * 0.45 + g * 0.55                                   # desaturate
    f = np.clip((f - 128) * 1.35 + 112, 0, 255)                                              # contrast, darker
    f = f * np.array([0.92, 1.0, 0.86], np.float32) + np.array([6, 10, 0], np.float32)       # cold green cast
    return np.clip(f, 0, 255)
DWW, DWH = 1000, 640; DMASK = round_mask(DWW, DWH, 20)
def dark_window(c, t, src_t, a=1.0, zoom=1.0, jitter=0.0):
    x0, y0, x1, y1 = CROPS[seg_at(t)[3]] if seg_at(t)[0] == 'dark' else CROPS[89.5]
    f = DR.get(src_t)[y0:y1, x0:x1].astype(np.float32); h, w = f.shape[:2]
    sc = max(DWW / w, DWH / h) * zoom; cw, ch = DWW / sc, DWH / sc
    jx = jitter * np.sin(t * 13.1) * 3; jy = jitter * np.cos(t * 11.3) * 3
    M = np.float32([[sc, 0, -((w - cw) / 2 + jx) * sc], [0, sc, -((h - ch) * FYD[seg_at(t)[3] if seg_at(t)[0] == 'dark' else 89.5] + jy) * sc]])
    img = cv2.warpAffine(f, M, (DWW, DWH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    img = dark_grade(img); sh = cv2.GaussianBlur(img, (0, 0), 2); img = np.clip(img * 1.6 - sh * 0.6, 0, 255)   # sharpen the upscale
    v = (1 - 0.55 * np.clip(np.hypot((np.arange(DWW)[None, :] - DWW / 2) / (DWW * 0.6), (np.arange(DWH)[:, None] - DWH / 2) / (DWH * 0.6)) - 0.3, 0, 1))[..., None]
    img = img * v
    return place(c, img, DMASK, 540, 940, 1.0, a, 0.0, border=3, border_col=MRED, shadow=0.0), img
ASHD = Dust(60, 12, ASH, (1.5, 4), (70, 25), 0.55)
def scan(c, t, a=0.12):
    """subtle scanlines / flicker for the dark world"""
    m = (0.5 + 0.5 * np.sin(yy[:, :1] * 1.2 + t * 40)) * a; return c * (1 - m[..., None] * 0.5)
D_E = {
    12.02: [T(12.25, 15.1, [('الحوثي', IVORY), ('يسب', MRED)], 'naskh', 150, 'slam', x=510, y=430, maxw=760, stroke=3, stroke_col=BLACK)],
    20.04: [T(20.25, 23.4, [('الحوثي', IVORY), ('يسب', MRED)], 'naskh', 150, 'glitch', x=510, y=430, maxw=760, stroke=3, stroke_col=BLACK)],
    32.22: [T(32.4, 35.5, [('الحوثي', IVORY), ('يسب', MRED)], 'naskh', 150, 'stamp', x=510, y=430, maxw=760, stroke=3, stroke_col=BLACK)],
}
D_CAP = [Cap(12.02, 13.9, ['ولا', 'يقود', 'الأمة', 'للضلالة'], [12.02, 12.54, 12.92, 13.24], y=1420, size=54, col=IVORY),
         Cap(13.94, 15.2, ['تفريط', 'الأمة', 'بالوصي'], [13.94, 14.52, 14.8], y=1420, size=54, col=IVORY),
         Cap(21.1, 23.5, ['فهوت', 'بالعباد', 'نحو', 'الشقاء'], [21.1, 21.96, 22.58, 22.88], y=1420, size=54, col=IVORY)]
for cp in D_CAP: cp.kimg = {}
D_HITS = [12.25, 20.25, 32.4]
def dark(t, s):
    k, a, b, s0 = s; p = t - a; src_t = s0 + p
    c = dark_bg(t)
    z = 1.0 + 0.10 * seg(t, a, b) + sum(0.06 * np.exp(-(t - h) / 0.2) for h in D_HITS if a <= h <= t)
    c, _ = dark_window(c, t, src_t, 1.0, z, 1.0)
    c = ASHD.draw(c, t, 1.0)
    for e in D_E[a]: c = e.draw(c, t)
    for h in D_HITS:
        if a <= h <= t < h + 0.6: c = rays(c, t, h, 510, 480, 16, MRED, 0.45, 140, 700, 4, seed=int(h))
    c = scan(c, t)
    return c
def dark_caps(c, t):
    for cp in D_CAP:
        if cp.a - 0.1 <= t < cp.b + 0.4:
            x0, y0, x1, y1 = [int(v) for v in cp.box]; m = np.zeros((H, W), np.float32); cv2.rectangle(m, (x0 - 26, int(y0) - 8), (x1 + 26, int(y1) + 8), 1.0, -1)
            m = cv2.GaussianBlur(m, (0, 0), 6)[..., None] * 0.8 * (1 - eio(seg(t, cp.b, cp.b + 0.25))); c = c * (1 - m) + BLACK * m
            c = cp.draw(c, t, plate=False)
    return c
# ---------------------------------------------------------------- light world (nasheed time n)
def light(n, t):
    c = L.picture(n)
    c = godrays(c, t, 540, -80, 0.6 * bump(n, 0.0, 3.0) + 0.6 * bump(n, 20.0, 23.0), 16) if True else c
    c = L.BOKEH.draw(c, t, 0.55); c = L.GDUST.draw(c, t, 0.7)
    if 2.98 <= n < 9.4: c = L.SPARK.draw(c, t, 0.6 * eio(seg(n, 3.0, 4.0)))
    for e in L.E: c = e.draw(c, n)
    for st_, x_, y_ in ((0.6, 510, 430), (3.0, 510, 430), (12.9, 510, 475), (18.9, 510, 475), (20.7, 510, 430)): c = L.sparkle(c, n, st_, x_, y_, 11, 300, 1.3, int(st_ * 10))
    if 12.86 <= n < 13.8: c = ring(c, n, 12.86, 510, 475, L.GOLD, 0.8, 60, 300, 5)
    if 14.22 <= n < 16.8:
        k = seg(n, 14.3, 16.6); lx = W * (1.2 - 1.4 * k); c = c + (L.LIGHTGOLD - c) * (np.exp(-((xx - lx) / 220) ** 2) * 0.28)[..., None]
    c = L.snapshot(c, n)
    for cp in L.CAPS: c = cp.draw(c, n)
    return c
godrays = L.godrays
# ---------------------------------------------------------------- title & finale
def light_card(c, n, cx, cy, w, h, zoom=1.05, fy=0.36, a=1.0, s_=1.0):
    f, _ = L.footage(n); fh, fw = f.shape[:2]; sc = max(w / fw, h / fh) * zoom; cw, ch = w / sc, h / sc
    x0 = (fw - cw) / 2; y0 = np.clip(fy * fh - ch / 2, 0, fh - ch); M = np.float32([[sc, 0, -x0 * sc], [0, sc, -y0 * sc]])
    img = cv2.warpAffine(f, M, (w, h), flags=cv2.INTER_LINEAR)
    return place(c, img, round_mask(w, h, 30), cx, cy, s_, a, 0.0, border=6, border_col=PAPER, shadow=0.35)
def dark_card(c, src_t, key, cx, cy, w, h, zoom=1.05, a=1.0, jit=1.0, t=0.0):
    x0, y0, x1, y1 = CROPS[key]; f = DR.get(src_t)[y0:y1, x0:x1].astype(np.float32); fh, fw = f.shape[:2]
    sc = max(w / fw, h / fh) * zoom; cw, ch = w / sc, h / sc; jx = jit * np.sin(t * 13.1) * 3
    M = np.float32([[sc, 0, -((fw - cw) / 2 + jx) * sc], [0, sc, -((fh - ch) * FYD[key]) * sc]]); img = cv2.warpAffine(f, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    img = dark_grade(img); sh = cv2.GaussianBlur(img, (0, 0), 2); img = np.clip(img * 1.6 - sh * 0.6, 0, 255)
    return place(c, img, round_mask(w, h, 20), cx, cy, 1.0, a, 0.0, border=3, border_col=MRED, shadow=0.0)
def halves(t, split, top, bot):
    m = np.clip((yy - split) / 3 + 0.5, 0, 1)[..., None]; return top * (1 - m) + bot * m
def title(t):
    k = ease(seg(t, 0.15, 0.9))
    top = background(t, leak=1.0); top = godrays(top, t, 540, 120, 0.9, 16)
    bot = dark_bg(t); bot = ASHD.draw(bot, t, 1.0)
    c = halves(t, 960, top, bot)
    ln = np.zeros((H, W), np.float32); L_ = 540 * k; cv2.line(ln, (int((540 - L_) * 8), 960 * 8), (int((540 + L_) * 8), 960 * 8), 1.0, 5, cv2.LINE_AA, shift=3)
    c = c + (L.GOLD - c) * np.clip(cv2.GaussianBlur(ln, (0, 0), 3) * 1.5 + ln, 0, 1)[..., None]
    c = put(c, text([('السنة', NAVY)], 'naskh', 220), 510, 700, back(seg(t, 0.2, 0.6)), min(1, seg(t, 0.2, 0.3)), glow=0.5, glow_col=L.LIGHTGOLD)
    c = L.sparkle(c, t, 0.35, 510, 700, 11, 260, 1.3, 3)
    c = put(c, text([('الحوثي', MRED)], 'naskh', 220, 3, BLACK), 510, 1230, back(seg(t, 0.7, 1.1)), min(1, seg(t, 0.7, 0.8)))
    if t >= 0.7: c = rays(c, t, 0.72, 510, 1230, 16, MRED, 0.5, 140, 700, 4, seed=7)
    return c
def final(t):
    a = 35.62; p = t - a; crack = eio(seg(t, 37.9, 38.7))
    top = background(t, leak=1.0); top = light_card(top, 4.5 + p * 0.8, 540, 560 + 200 * crack, 900, 520, s_=1.0 + 0.12 * crack)
    top = put(top, text([('السنة', NAVY)], 'naskh', 130), 510, 895 + 330 * crack, back(seg(t, a + 0.2, a + 0.6)), min(1, seg(t, a + 0.2, a + 0.3)), glow=0.4, glow_col=L.LIGHTGOLD)
    bot = dark_bg(t); bot = dark_card(bot, 90.0 + p * 0.6, 89.5, 540, 1290, 900, 380, 1.05, 1.0, 1.0, t)
    bot = put(bot, text([('الحوثي', IVORY), ('يسب', MRED)], 'naskh', 110, 3, BLACK), 510, 1035, back(seg(t, a + 0.9, a + 1.3)), min(1, seg(t, a + 0.9, a + 1.0)))
    bot = ASHD.draw(bot, t, 1.0)
    if crack > 0: bot = camera(bot, 1.0 + 0.1 * crack, 0, 700 * crack ** 2, 4 * crack, fill=BLACK)
    split = 960 + 960 * crack; c = halves(t, split, top, bot)
    if crack < 1:
        ln = np.zeros((H, W), np.float32); cv2.line(ln, (0, int(split * 8)), (W * 8, int(split * 8)), 1.0, 5, cv2.LINE_AA, shift=3)
        c = c + (L.GOLD - c) * ln[..., None]
    if crack > 0: c = c + (L.LIGHTGOLD - c) * bump(t, 38.0, 38.9) * 0.45
    if t > 38.4: c = godrays(c, t, 540, -80, eio(seg(t, 38.4, 39.2)), 16)
    return c
# ---------------------------------------------------------------- transitions between worlds
def frame(t):
    s = seg_at(t); k, a, b, s0 = s
    if t >= OUT_T: c = background(t)
    elif k == 'title': c = title(t)
    elif k == 'light': c = light(s0 + (t - a), t)
    elif k == 'dark': c = dark(t, s)
    else: c = final(t)
    # world changes: light→dark = darkness floods from the edges; dark→light = an iris of light
    i = SEGS.index(s)
    if i > 0 and t < a + 0.35 and k in ('light', 'dark'):
        pk, pa, pb, ps0 = SEGS[i - 1]; p = (t - a) / 0.35
        prev = light(ps0 + (t - pa), t) if pk == 'light' else (dark(t, SEGS[i - 1]) if pk == 'dark' else title(min(t, 2.59)))
        if k == 'dark':
            r = np.hypot(xx - 540, yy - 960) / 1100; mm = np.clip((ease(p) * 1.3 - (1 - r)) / 0.15, 0, 1)[..., None]
            c = prev * (1 - mm) + c * mm; c = glitch_cut(c, c, 0.2) if p < 0.25 else c
        else:
            c = iris(prev, c, p, 540, 960)
    if t < OUT_T + 0.3:
        dk = k == 'dark' or (k == 'final' and t > 38.0 and False)
        if k == 'dark': c = dark_caps(c, t)
        cred = CRED_D if k == 'dark' else CRED_L
        a_b = eio(seg(t, 0.6, 1.1)) * (1 - eio(seg(t, OUT_T, OUT_T + 0.3)))
        c = brand_corner(c, t, a_b); c = put(c, cred, W / 2 - 30, 1492, 1.0, 0.92 * a_b * (0 if k in ('title', 'final') else 1))
        if k == 'light': c = put(c, TAG_L, 862, 318, back(seg(t, a, a + 0.35)), eio(seg(t, a, a + 0.2)))
    c = outro(c, t, OUT_T)
    return finish_frame(c, t, 0.08)
CRED_L = credit_pill('المصدر: مركز دار القرآن'); CRED_D = credit_pill('المصدر: أبو عبدالله')
def chip(txt, fg, bg, edge):
    im = text([(txt, fg)], 'almarai', 46); h, w = im.shape[:2]; P = np.zeros((h + 16, w + 44, 4), np.float32); m = round_mask(w + 44, h + 16, (h + 16) // 2 - 1)
    P[..., :3] = bg; P[..., 3] = m; e = m - cv2.erode(m, np.ones((3, 3), np.uint8), iterations=3); P[..., :3] = P[..., :3] * (1 - e[..., None]) + edge * e[..., None]
    a = im[..., 3:]; P[8:8 + h, 22:22 + w, :3] = P[8:8 + h, 22:22 + w, :3] * (1 - a) + im[..., :3] * a; return P
TAG_L = chip('السنة', NAVY, PAPER, L.GOLD); TAG_D = chip('الحوثي', IVORY, MRED, BLACK)
# ---------------------------------------------------------------- sound: voices + SFX, no music
def build_audio():
    nv, sr = sf.read(S_ + 'v10/sep/htdemucs/a/vocals.wav', dtype='float32'); dv, sr2 = sf.read(V + 'sep/htdemucs/a/vocals.wav', dtype='float32')
    assert sr == sr2 == 44100
    from scipy.signal import resample_poly
    nv = resample_poly(nv, 160, 147, axis=0); dv = resample_poly(dv, 160, 147, axis=0); R = 48000
    trk = np.zeros((int(DUR * R), 2), np.float32)
    def lufs_gain(x, target): r = np.sqrt((x ** 2).mean()) + 1e-9; return 10 ** ((target - 20 * np.log10(r)) / 20)
    gN = lufs_gain(nv[:int(22.9 * R)], -18.5); gD = lufs_gain(dv[int(13 * R):int(93 * R)], -19.5)
    for k, a, b, s0 in SEGS:
        if k not in ('light', 'dark'): continue
        src, g = (nv, gN) if k == 'light' else (dv, gD)
        i0 = int(s0 * R); n = int((b - a) * R); x = src[i0:i0 + n].copy() * g; f = int(0.06 * R)
        x[:f] *= np.linspace(0, 1, f)[:, None]; x[-f:] *= np.linspace(1, 0, f)[:, None]
        j = int(a * R); trk[j:j + len(x)] += x[:len(trk) - j]
    tl = np.zeros_like(trk)
    P = sfx.place
    P(tl, sfx.impact(1.6, 80, 34), 0.15, -9); P(tl, sfx.whoosh(0.7, 300, 7000), 0.55, -16); P(tl, sfx.impact(1.4, 70, 30), 0.72, -10); P(tl, sfx.shimmer(1.4), 1.25, -22)
    for k, a, b, s0 in SEGS[1:]:
        if k == 'light': P(tl, sfx.whoosh(0.6, 400, 8000), a - 0.25, -17); P(tl, sfx.shimmer(1.6, 2400), a, -24)
        if k == 'dark': P(tl, sfx.whoosh(0.7, 120, 1400, dark=True, rev=True), a - 0.55, -14); P(tl, sfx.impact(1.6, 75, 30), a, -10); P(tl, sfx.rumble(b - a), a, -24)
    for h in D_HITS: P(tl, sfx.impact(1.0, 110, 45), h, -14); P(tl, sfx.glitch(0.22), h, -24)
    for h in (2.98 + 2.6, 12.86 - 9.42 + 15.24, 20.62 - 14.22 + 23.54): P(tl, sfx.shimmer(1.8, 2600), h, -23)
    P(tl, sfx.riser(1.6, dark=True), 36.3, -20); P(tl, sfx.impact(2.0, 60, 26), 37.9, -8); P(tl, sfx.whoosh(0.9, 200, 4000), 37.95, -15); P(tl, sfx.shimmer(2.2, 2000), 38.5, -18)
    P(tl, sfx.whoosh(0.7, 400, 8000), OUT_T - 0.2, -18); P(tl, sfx.shimmer(2.0, 2200), OUT_T + 0.3, -22)
    mix = trk + tl
    sf.write(WK + 'pre.wav', mix, R)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', WK + 'pre.wav', '-af', 'highpass=f=40,alimiter=limit=0.89:level=false,loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', '48000', WK + 'mix.wav'], check=True)

N = int(round(DUR * FPS))
if __name__ == '__main__':
    MODE = sys.argv[1]
    if MODE == 'still':
        for t in [float(x) for x in sys.argv[2:]]: cv2.imwrite(WK + f'st_{t:05.2f}.jpg', frame(t), [cv2.IMWRITE_JPEG_QUALITY, 88])
    elif MODE == 'audio': build_audio(); print('audio ok')
    elif MODE == 'render':
        part, parts = int(sys.argv[2]), int(sys.argv[3]); i0 = N * part // parts; i1 = N * (part + 1) // parts
        enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
                                '-crf', '17', '-pix_fmt', 'yuv420p', WK + f'p{part}.mp4'], stdin=subprocess.PIPE)
        for i in range(i0, i1): enc.stdin.write(frame(i / FPS).tobytes())
        enc.stdin.close(); enc.wait(); print('part done', part, flush=True)
    elif MODE == 'finish':
        parts = int(sys.argv[2]); lst = WK + 'parts.txt'; open(lst, 'w').write(''.join(f"file '{WK}p{k}.mp4'\n" for k in range(parts)))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', WK + 'body.mp4'], check=True)
        os.makedirs(OUTD, exist_ok=True); out = OUTD + '03-nur-wa-zalam.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'body.mp4', '-i', WK + 'mix.wav', '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
        print('ok', out)
