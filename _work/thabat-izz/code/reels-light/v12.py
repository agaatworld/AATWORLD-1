# «الحوثي يسب / السنة» — the whole Houthi compilation first (each clip pinned into a gallery), then the Quran ceremony. Voices + SFX, no music.
import sys, os, subprocess, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_argv = sys.argv; sys.argv = ['x', 'none']
import v11 as D                                    # dark-world tools + light world (D.light / D.L)
sys.argv = _argv
from mg import *
import sfx, soundfile as sf
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
V = S_ + 'v11/'; WK = S_ + 'v12/work/'; OUTD = '/home/user/final/reels-light/'
os.makedirs(WK, exist_ok=True)
BLACK, MRED, IVORY, ASH = D.BLACK, D.MRED, D.IVORY, D.ASH
# ---------------------------------------------------------------- the Houthi compilation: clips (source = film time)
CROP = {'close': (290, 650, 860, 1035), '2356': (300, 720, 760, 1035), 'red3': (150, 720, 610, 1060), 'red9': (160, 740, 640, 1060), 'niqab': (200, 650, 930, 1030),
        'teal': (380, 720, 880, 1035), 'dhoran': (220, 705, 860, 1035), 'crowd': (420, 770, 1080, 1035)}
CLIPS = [(0.0, 1.93, 'close'), (1.93, 3.4, '2356'), (3.4, 5.53, 'red3'), (5.53, 7.03, 'niqab'), (7.03, 8.6, 'teal'), (8.6, 9.7, 'dhoran'), (9.7, 10.3, None),
         (10.3, 31.07, '2356'), (31.07, 42.8, 'red9'), (42.8, 58.63, 'close'), (58.63, 64.83, '2356'), (64.83, 65.83, 'crowd'), (65.83, 75.4, 'teal'),
         (75.4, 88.1, 'niqab'), (88.1, 94.97, 'dhoran')]
H_END = 94.97; WALL_H = (H_END, 97.5); L0 = 97.9; L_END = L0 + 22.9; WALL_L = (L_END, 123.0); FIN = (123.0, 126.0); OUT_T = 126.0; DUR = 128.7
GAL = [c for c in CLIPS if c[2]]                    # 14 clips go into the gallery
DWW, DWH, DCY = 1000, 640, 920
def clip_at(t):
    for c in CLIPS:
        if c[0] <= t < c[1]: return c
    return CLIPS[-1]
def grab(t, key, w=DWW, h=DWH, zoom=1.0):
    x0, y0, x1, y1 = CROP[key]; f = D.DR.get(t)[y0:y1, x0:x1].astype(np.float32); fh, fw = f.shape[:2]
    sc = max(w / fw, h / fh) * zoom; cw, ch = w / sc, h / sc
    M = np.float32([[sc, 0, -((fw - cw) / 2) * sc], [0, sc, -((fh - ch) * 0.1) * sc]])
    img = cv2.warpAffine(f, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    img = D.dark_grade(img); sh = cv2.GaussianBlur(img, (0, 0), 2); return np.clip(img * 1.6 - sh * 0.6, 0, 255)
# stills for the gallery (taken just before each clip ends)
STILL = [grab(max(a, b - 0.25), k, 500, 320) for a, b, k in GAL]
TH_W, TH_H = 112, 78
def slot(i):
    r, c = divmod(i, 7); return 870 - c * 120, 440 + r * 86
def wall_pos(i, n, cols, cw, ch, cx, cy):
    r, c = divmod(i, cols); rows = (n + cols - 1) // cols
    return cx + (cols - 1) / 2 * (cw + 14) - c * (cw + 14), cy - (rows - 1) / 2 * (ch + 14) + r * (ch + 14)
RNG = np.random.default_rng(4); ROT = RNG.uniform(-3, 3, 30)
def thumb(c, img, x, y, w, h, rot=0.0, a=1.0, border=IVORY):
    w, h = max(8, int(w)), max(6, int(h)); bd = max(2, int(w / 36))
    im = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA if w < img.shape[1] else cv2.INTER_LINEAR)
    fr = np.empty((h + 2 * bd, w + 2 * bd, 3), np.float32); fr[:] = border; fr[bd:bd + h, bd:bd + w] = im
    return place(c, fr, np.ones(fr.shape[:2], np.float32), x, y, 1.0, a, rot, border=0, shadow=0.35)
def gallery(c, t, upto=None):
    """pinned stills; each flies in from the window when its clip ends"""
    for i, (a, b, k) in enumerate(GAL):
        if t < b: continue
        p = ease(seg(t, b, b + 0.55)); sx, sy = slot(i)
        x = 540 + (sx - 540) * p; y = DCY + (sy - DCY) * p; w = DWW + (TH_W - DWW) * p; h = DWH + (TH_H - DWH) * p
        if p < 1: c = c + (WHITE - c) * 0.0
        c = thumb(c, STILL[i], x, y, w, h, ROT[i] * p, 1.0)
    return c
CAPL = []
def cap_line(a, b, txt): CAPL.append((a, b, text([(txt, IVORY)], 'almarai', 50)))
for a, b, txt in [(0.05, 1.84, 'في حينها تولّى الحقير ابن الحقير'), (1.84, 3.36, 'ولا يقود الأمة للضلالة'), (3.36, 5.5, 'عمر.. عمر رأس المصايب والفتن'), (5.5, 8.2, 'بولاية الطاغوت قسرًا..'),
                  (8.24, 11.7, 'ما صار من بعد النبي'), (11.76, 13.05, 'كان ما صار'), (13.1, 15.0, 'ولا يقود الأمة للضلالة'), (15.02, 16.3, 'تفريط الأمة بالوصي'), (16.32, 19.05, 'بعد النبي وما فترت في جداله'),
                  (19.08, 21.15, 'ونزلها القرآن من خلفها عار'), (21.18, 23.1, 'وتناولوا أهل الضلالة'), (23.12, 25.95, 'جلالة وضحت بلا قيمة ولا أي مقدار'), (25.98, 28.1, 'وتخلخلت داخل صفوف العمالة'),
                  (28.12, 30.45, 'تفريطها وضرارها ما هي ضرار.. هي كارثة'), (30.5, 32.8, 'عن يوم الغدير يعني'), (33.8, 35.0, 'أبو بكر عن دينها'), (35.04, 37.1, 'كفروا من تولاهم ووالاهم'),
                  (38.04, 40.9, 'عمر.. عمر رأس المصايب والفتن'), (40.92, 42.5, 'ومن يدافع عن عدو الله'), (42.56, 44.98, 'يوم السقيفة يوم فعل المنكر'), (45.0, 47.85, 'من بعدها في حينها تولّى الحقير ابن الحقير'),
                  (47.88, 50.43, 'ذي خالف الكرار.. لش عاد بكره'), (50.46, 53.45, 'وتاهت الأمة.. وتاهت الأمة'), (53.48, 55.8, 'وخلّوا الإسلام كل مسخرة'), (55.82, 58.3, 'لا عصرنا هذا مواقعنا الخطير'),
                  (59.86, 62.3, 'رجعت لفّ من بعد ما مات النبي'), (62.34, 64.7, 'رجعت لفّ حول السقيفة.. دور وين البديل'), (64.78, 66.9, 'جحدت شُكرها السقيفة كِبرًا'), (66.96, 69.6, 'فهوت بالعباد نحو الشقاء'),
                  (69.76, 72.0, 'وتقمّصها قسرًا..'), (72.12, 75.0, 'ولجّوا لجّةً طخيةً بعماء'), (75.14, 77.0, 'إن الولاية للوصي'), (77.08, 80.95, 'وآله من بعده حصنٌ منيعٌ محكم'),
                  (81.12, 83.2, 'وجميع من رفضوا ولاية حيدر'), (83.26, 85.9, 'بولاية الطاغوت قسرًا أُرغموا'), (85.98, 87.95, 'كفروا وقد سمعوا رسالة ربهم')]:
    cap_line(a, b, txt)
CAPL.sort(key=lambda x: x[0])
def dark_caps(c, t):
    for a, b, img in CAPL:
        if a - 0.05 <= t < b + 0.2:
            al = min(1, (t - a) / 0.12) * (1 - eio(seg(t, b, b + 0.2)))
            m = np.zeros((H, W), np.float32); hw = img.shape[1] / 2 + 28; cv2.rectangle(m, (int(510 - hw), 1385), (int(510 + hw), 1458), 1.0, -1)
            m = cv2.GaussianBlur(m, (0, 0), 6)[..., None] * 0.8 * al; c = c * (1 - m) + BLACK * m
            c = put(c, fitw(img, 860), 510, 1420, 1.0, al)
    return c
LRED = C('D2483E')
LABEL_D = fitw(text([('الحوثي', IVORY), ('يسب الصحابة', LRED)], 'naskh', 96, 3, BLACK), 760)
LABEL_L = text([('السنة', NAVY)], 'naskh', 110)
def houthi(t):
    a, b, k = clip_at(t); c = D.dark_bg(t)
    if k is None:                                                      # the source's own 0.6 s blank: a dark glitch beat
        c = D.ASHD.draw(c, t, 1.0); c = glitch_cut(c, c, (t - a) / (b - a))
    else:
        z = 1.0 + 0.06 * seg(t, a, b) + 0.05 * np.exp(-(t - a) / 0.25)
        img = grab(t, k, DWW, DWH, z)
        if t - a < 0.12: img = img + (WHITE - img) * (1 - (t - a) / 0.12) * 0.35          # flash on every cut
        c = place(c, img, round_mask(DWW, DWH, 20), 540, DCY, 1.0, 1.0, 0.0, border=3, border_col=MRED, shadow=0.0)
        c = D.ASHD.draw(c, t, 1.0)
    c = put(c, LABEL_D, 520, 330, back(seg(t, 0.15, 0.55)), min(1, seg(t, 0.15, 0.25)))
    c = gallery(c, t)
    c = D.scan(c, t)
    return c
def wall_h(t, cx=510, cy=960, scale=1.0, a=1.0, base=None):
    c = D.dark_bg(t) if base is None else base; p = ease(seg(t, WALL_H[0], WALL_H[0] + 0.7))
    for i in range(len(GAL)):
        sx, sy = slot(i); wx, wy = wall_pos(i, len(GAL), 4, 206 * scale, 140 * scale, cx, cy)
        x = sx + (wx - sx) * p; y = sy + (wy - sy) * p; w = TH_W + (206 * scale - TH_W) * p; h = TH_H + (140 * scale - TH_H) * p
        c = thumb(c, STILL[i], x, y, w, h, ROT[i] * (1 - 0.5 * p), a)
    return c
# light shots (v10 edit) for the light wall
LSTILL = []
for a_, b_, s0 in D.L.EDIT:
    f, _ = D.L.footage(min(b_ - 0.3, 22.6)); fh, fw = f.shape[:2]; sc = max(500 / fw, 340 / fh); M = np.float32([[sc, 0, -(fw * sc - 500) / 2], [0, sc, -(fh * sc - 340) * 0.35]])
    LSTILL.append(cv2.warpAffine(f, M, (500, 340)))
def wall_l(t, cx=510, cy=980, cw=280, ch=190, base=None, t0=None):
    c = background(t) if base is None else base; t0 = WALL_L[0] if t0 is None else t0
    for i in range(len(LSTILL)):
        wx, wy = wall_pos(i, len(LSTILL), 3, cw, ch, cx, cy); p = ease(seg(t, t0 + 0.06 * i, t0 + 0.06 * i + 0.4))
        c = thumb(c, LSTILL[i], wx, wy + 80 * (1 - p), cw, ch, ROT[i + 15] * 0.6, p, border=PAPER)
    return c
def frame(t):
    if t < H_END: c = houthi(t); c = dark_caps(c, t)
    elif t < WALL_H[1] + 0.4:
        c = wall_h(t); c = put(c, LABEL_D, 520, 330, 1.0, 1.0)
        if t >= WALL_H[1]:                                               # light breaks in
            lt = D.light(0.0, t); c = iris(c, lt, seg(t, WALL_H[1], WALL_H[1] + 0.4), 540, 960)
    elif t < L_END:
        c = D.light(t - L0, t); c = put(c, D.TAG_L, 862, 318, back(seg(t, L0, L0 + 0.35)), eio(seg(t, L0, L0 + 0.2)))
    elif t < WALL_L[1]:
        c = wall_l(t); c = put(c, LABEL_L, 510, 400, back(seg(t, WALL_L[0], WALL_L[0] + 0.4)), min(1, seg(t, WALL_L[0], WALL_L[0] + 0.1)), glow=0.4, glow_col=D.L.LIGHTGOLD)
        c = D.L.sparkle(c, t, WALL_L[0] + 0.1, 510, 400, 10, 220, 1.2, 5)
    else:
        top = wall_l(t, 510, 640, 150, 102, background(t), FIN[0]); top = put(top, LABEL_L, 510, 330, 0.85, 1.0)
        bot = D.dark_bg(t)
        for i in range(len(GAL)):
            r, cc = divmod(i, 7); bot = thumb(bot, STILL[i], 870 - cc * 120, 1210 + r * 86, TH_W, TH_H, ROT[i], 1.0)
        bot = put(bot, LABEL_D, 520, 1060, 1.0, 1.0); bot = D.scan(bot, t)
        c = D.halves(t, 960, top, bot)
        ln = np.zeros((H, W), np.float32); cv2.line(ln, (0, 960 * 8), (W * 8, 960 * 8), 1.0, 5, cv2.LINE_AA, shift=3); c = c + (D.L.GOLD - c) * ln[..., None]
        if t < FIN[0] + 0.4: c = flash(c, c, seg(t, FIN[0], FIN[0] + 0.4))
    if t < OUT_T + 0.3:
        a_b = eio(seg(t, 0.4, 0.9)) * (1 - eio(seg(t, OUT_T, OUT_T + 0.3))); c = brand_corner(c, t, a_b)
        cred = D.CRED_D if t < WALL_H[1] else (D.CRED_L if t < WALL_L[1] else None)
        if cred is not None: c = put(c, cred, W / 2 - 30, 1492, 1.0, 0.92 * a_b)
    c = outro(c, t, OUT_T)
    return finish_frame(c, t, 0.08)
# ---------------------------------------------------------------- sound
def build_audio():
    from scipy.signal import resample_poly
    dv, sr = sf.read(V + 'sep/htdemucs/a/vocals.wav', dtype='float32'); nv, _ = sf.read(S_ + 'v10/sep/htdemucs/a/vocals.wav', dtype='float32')
    dv = resample_poly(dv, 160, 147, axis=0); nv = resample_poly(nv, 160, 147, axis=0); R = 48000
    trk = np.zeros((int(DUR * R), 2), np.float32)
    def rms_gain(x, target): r = np.sqrt((x ** 2).mean()) + 1e-9; return 10 ** ((target - 20 * np.log10(r)) / 20)
    x = dv[:int(H_END * R)] * rms_gain(dv[:int(H_END * R)], -19.0); f = int(0.15 * R); x[-f:] *= np.linspace(1, 0, f)[:, None]; trk[:len(x)] += x
    y = nv[:int(22.9 * R)] * rms_gain(nv[:int(22.9 * R)], -18.0); f = int(0.3 * R); y[-f:] *= np.linspace(1, 0, f)[:, None]; j = int(L0 * R); trk[j:j + len(y)] += y
    tl = np.zeros_like(trk); P = sfx.place
    for a, b, k in CLIPS[1:]: P(tl, sfx.impact(0.9, 100, 45), a, -19)
    for a, b, k in GAL: P(tl, sfx.whoosh(0.5, 300, 5000, dark=True), b - 0.05, -22)
    P(tl, sfx.riser(1.4, dark=True), H_END - 1.3, -21); P(tl, sfx.impact(1.8, 70, 30), H_END, -11); P(tl, sfx.whoosh(0.8, 300, 7000), WALL_H[1] - 0.2, -16); P(tl, sfx.shimmer(1.8), WALL_H[1] + 0.1, -20)
    for a_, b_, s0 in D.L.EDIT[1:]: P(tl, sfx.whoosh(0.5, 500, 8000), L0 + a_ - 0.2, -24)
    P(tl, sfx.shimmer(2.0, 2600), WALL_L[0], -20); P(tl, sfx.impact(1.6, 80, 34), FIN[0], -12); P(tl, sfx.whoosh(0.7, 400, 8000), OUT_T - 0.2, -18); P(tl, sfx.shimmer(2.0), OUT_T + 0.3, -21)
    sf.write(WK + 'pre.wav', trk + tl, R)
    j = subprocess.run(['ffmpeg', '-hide_banner', '-i', WK + 'pre.wav', '-af', 'highpass=f=40,loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    d = json.loads(j[j.rindex('{'):])
    mi = f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', WK + 'pre.wav', '-af', f'highpass=f=40,loudnorm=I=-14:TP=-1.0:LRA=11:{mi}:linear=true', '-ar', '48000', WK + 'mix.wav'], check=True)

N = int(round(DUR * FPS))
if __name__ == '__main__':
    MODE = sys.argv[1]
    if MODE == 'still':
        for t in [float(x) for x in sys.argv[2:]]: cv2.imwrite(WK + f'st_{t:06.2f}.jpg', frame(t), [cv2.IMWRITE_JPEG_QUALITY, 88])
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
        out = OUTD + '03-alhouthi-yasub-wa-alsunna.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'body.mp4', '-i', WK + 'mix.wav', '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
        print('ok', out)
