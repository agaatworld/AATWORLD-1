# «سجل يا تاريخ» — light-theme motion-graphics reel (speaker video, voice only)
import sys, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mg import *
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
V = S_ + 'v9/'; WK = V + 'work/'; BR = S_ + 'mg/broll/'; OUTD = '/home/user/final/reels-light/'
os.makedirs(WK, exist_ok=True)
SRC = V + 'src/in.mp4'; VID_END = 36.1; OUT_T = 36.0; DUR = 38.9

# ---------------------------------------------------------------- speaker frames (other page's frame cropped away)
class Reader:
    def __init__(s, t0):
        s.cap = cv2.VideoCapture(SRC); s.cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(t0 * 30))); s.i = int(round(t0 * 30)); s.last = None
    def get(s, t):
        want = min(int(round(t * 30)), 1083)
        while s.i <= want:
            ok, f = s.cap.read()
            if ok: s.last = f
            s.i += 1
        return s.last
RD = None
def speaker(t):
    f = RD.get(t)[316:948, 44:680].astype(np.float32)          # 632x636 inner picture
    return np.clip(f * 1.04 + 6, 0, 255)
PW, PH = 760, 840; ARCH = arch_mask(PW, PH, top=0.30)
def panel(c, t, cx=540, cy=700, s=1.0, a=1.0, zoom=1.0, fx=0.5, fy=0.42, rot=0.0):
    f = speaker(t); h, w = f.shape[:2]
    sc = max(PW / w, PH / h) * zoom; cw, ch = PW / sc, PH / sc
    x0 = np.clip(fx * w - cw / 2, 0, w - cw); y0 = np.clip(fy * h - ch / 2, 0, h - ch)
    M = np.float32([[sc, 0, -x0 * sc], [0, sc, -y0 * sc]]); img = cv2.warpAffine(f, M, (PW, PH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    return place(c, img, ARCH, cx, cy, s, a, rot, border=4, border_col=AMBER, shadow=0.35)
CIRC = round_mask(300, 300, 150)
def pip(c, t, cx, cy, s=1.0, a=1.0):
    f = speaker(t); img = cv2.resize(f[40:560, 60:580], (300, 300), interpolation=cv2.INTER_AREA)
    return place(c, img, CIRC, cx, cy, s, a, border=4, border_col=AMBER, shadow=0.3)

# ---------------------------------------------------------------- B-roll cards
def load_br(n):
    im = cv2.imread(BR + n + '.jpg').astype(np.float32); return im
BRI = {k: load_br(k) for k in ('shelves', 'coins', 'mosque', 'minaret', 'qpage', 'peak')}
CW, CH = 800, 840; CARD = round_mask(CW, CH, 42)
def card(c, t, key, t0, cx=540, cy=700, s=1.0, a=1.0, rot=-2.0, z0=1.0, z1=1.12, fx=0.5, fy=0.5, desat=0.0, tint=0.0):
    im = BRI[key]; h, w = im.shape[:2]; p = seg(t, t0, t0 + 4.5); z = z0 + (z1 - z0) * p
    sc = max(CW / w, CH / h) * z; cw, ch = CW / sc, CH / sc; x0 = np.clip(fx * w - cw / 2, 0, w - cw); y0 = np.clip(fy * h - ch / 2, 0, h - ch)
    M = np.float32([[sc, 0, -x0 * sc], [0, sc, -y0 * sc]]); img = cv2.warpAffine(im, M, (CW, CH), flags=cv2.INTER_AREA if sc < 1 else cv2.INTER_LINEAR)
    if desat > 0: g = img.mean(2, keepdims=True); img = img * (1 - desat) + g * desat
    if tint > 0: img = img * (1 - tint) + (CREAM * 0.9) * tint
    return place(c, img, CARD, cx, cy, s, a, rot, border=8, border_col=PAPER, shadow=0.45)
def badge(c, t, t0, n, x=868, y=360):
    p = t - t0
    if p < 0: return c
    sz = 150; im = np.zeros((sz, sz, 4), np.float32); m = np.zeros((sz * 4, sz * 4), np.uint8); cv2.circle(m, (sz * 2, sz * 2), sz * 2 - 8, 255, -1, cv2.LINE_AA)
    a = cv2.resize(m, (sz, sz), interpolation=cv2.INTER_AREA).astype(np.float32) / 255; im[..., :3] = ORANGE; im[..., 3] = a
    c = put(c, im, x, y, back(p / 0.35, 2.4), min(1, p / 0.08), shadow=0.4)
    num = text([(n, PAPER)], 'naskh', 96)
    c = put(c, num, x, y + 4, back(seg(p, 0.08, 0.4), 2.0), min(1, p / 0.15))
    return ring(c, t, t0, x, y, ORANGE, 0.6, 70, 190, 5)
def pin(c, t, t0, x, y):
    p = t - t0
    if p < 0: return c
    dy = -300 * (1 - ease(p / 0.35)) + 18 * np.sin(min(p, 0.8) * 12) * np.exp(-p * 5)
    m = np.zeros((H, W), np.float32); yy0 = y + dy
    pts = np.array([[x, yy0 + 70], [x - 46, yy0 - 6], [x + 46, yy0 - 6]], np.float32)
    cv2.circle(m, (int(x * 8), int((yy0 - 20) * 8)), 54 * 8, 1.0, -1, cv2.LINE_AA, shift=3); cv2.fillConvexPoly(m, (pts * 8).astype(np.int32), 1.0, cv2.LINE_AA, shift=3)
    hole = np.zeros((H, W), np.float32); cv2.circle(hole, (int(x * 8), int((yy0 - 20) * 8)), 22 * 8, 1.0, -1, cv2.LINE_AA, shift=3)
    sh = cv2.GaussianBlur(m, (0, 0), 10); c = c * (1 - 0.25 * np.roll(sh, 14, 0)[..., None])
    c = c + (ORANGE - c) * m[..., None]; c = c + (PAPER - c) * hole[..., None]
    if p > 0.35: c = ring(c, t, t0 + 0.35, x, y + 70, ORANGE, 0.8, 10, 160, 4)
    return c
def waves(c, t, x, y, t0, t1, col=AMBER):
    """adhan: rings radiating from the minaret top"""
    if not (t0 <= t <= t1 + 1.2): return c
    for k in range(int((t1 - t0) / 0.55) + 1):
        tk = t0 + k * 0.55
        if tk <= t1: c = ring(c, t, tk, x, y, col, 1.4, 30, 620, 5)
    return c

# ---------------------------------------------------------------- words (film time = audio time); captions = original speech
WORDS = [('سجل', 0.0), ('يا', 0.6), ('تاريخ', 0.72), ('أن', 1.18), ('أول', 1.76), ('منجزٍ', 2.18), ('صنعته', 2.82), ('أكذوبة', 4.04), ('المسيرة', 4.72), ('القرآنية', 5.64),
         ('التابعة', 6.38), ('للحركة', 7.62), ('الحوثية', 8.38), ('الإرهابية', 8.96), ('هي', 9.78), ('إغلاق', 10.4), ('مراكز', 11.04), ('تحفيظ', 11.7), ('القرآن', 12.24), ('الكريم', 12.64),
         ('وفتح', 13.12), ('فرعٍ', 14.08), ('وفتح', 14.86), ('فروعٍ', 15.5), ('لمؤسسات', 16.14), ('الجباية', 17.1), ('وطرد', 17.76), ('أئمة', 18.88), ('المساجد', 19.4),
         ('وإحلال', 20.2), ('كوادر', 21.44), ('طائفيةٍ', 22.12), ('مكانها', 23.22), ('حتى', 23.76), ('أن', 24.82), ('متحوثاً', 24.98), ('قتل', 25.88), ('أخاه', 26.66), ('في', 27.1), ('مدينة', 27.34), ('التربة', 27.86),
         ('لأنه', 28.46), ('لم', 29.34), ('يقل', 30.16), ('حيّ', 30.62), ('على', 30.94), ('خير', 31.1), ('العمل', 31.58), ('في', 32.02), ('الأذان', 34.18)]
LINES = [(3, 7, 4.0, [4, 5]), (7, 10, 6.38, [7]), (10, 14, 9.78, [12, 13]), (14, 17, 9.78, [15]), (17, 20, 11.7, [18]), (20, 24, 13.12, [23]), (24, 26, 16.14, [25]), (26, 29, 20.2, [26]),
         (29, 33, 23.76, [31]), (33, 37, 25.88, [36]), (37, 41, 28.46, [40]), (41, 45, 30.62, []), (45, 50, 31.1, [49])]
CAPS = []
for i0, i1, _, keys in LINES:
    ws = [w for w, _ in WORDS[i0:i1]]; st = [s for _, s in WORDS[i0:i1]]; end = WORDS[i1][1] - 0.05 if i1 < len(WORDS) else 35.6
    CAPS.append(Cap(st[0], end, ws, st, keys=[k - i0 for k in keys], y=1415, size=58))

# ---------------------------------------------------------------- kinetic elements per scene
E = {
 'hook': [T(0.0, 1.6, [('سجل', NAVY)], 'naskh', 300, 'stamp', y=780), T(0.6, 1.6, [('يا تاريخ', ORANGE)], 'naskh', 190, 'wipe', y=1060)],
 's2': [T(1.76, 3.95, [('أول', NAVY), ('منجزٍ', ORANGE)], 'naskh', 116, 'pop', y=1215, plate=True),
        T(4.04, 4.68, [('أكذوبة', ORANGE)], 'naskh', 150, 'glitch', y=1215, out='zoom', plate=True),
        T(4.72, 6.3, [('المسيرة القرآنية', NAVY)], 'naskh', 92, 'rise', y=1215, plate=True)],
 's3': [T(6.38, 9.7, [('التابعة', STEEL), ('للحركة', NAVY)], 'almarai', 92, 'drift', y=700),
        T(8.38, 9.7, [('الحوثية', NAVY)], 'naskh', 220, 'slam', y=930),
        T(8.96, 9.7, [('الإرهابية', ORANGE)], 'naskh', 200, 'slam', y=1170)],
 's4': [T(10.4, 13.0, [('إغلاق', ORANGE)], 'naskh', 160, 'stamp', y=640, rot=-6, plate=True),
        T(11.04, 13.0, [('مراكز تحفيظ', NAVY)], 'naskh', 96, 'rise', y=1205, plate=True),
        T(12.24, 13.0, [('القرآن الكريم', ORANGE)], 'naskh', 88, 'rise', y=1305)],
 's5': [T(13.12, 15.4, [('فرعٍ', NAVY)], 'naskh', 130, 'pop', y=1230, plate=True),
        T(15.5, 17.6, [('فروعٍ', NAVY)], 'naskh', 130, 'flip', y=1230, plate=True),
        T(17.1, 17.7, [('الجباية', ORANGE)], 'naskh', 190, 'slam', y=640)],
 's6': [T(17.76, 18.8, [('طرد', ORANGE)], 'naskh', 220, 'slam', y=600, plate=True),
        T(18.88, 20.1, [('أئمة المساجد', NAVY)], 'naskh', 116, 'rise', y=1225, plate=True)],
 's7': [T(20.2, 21.35, [('أئمة المساجد', GREY)], 'naskh', 116, 'flip', y=1225, out='drop', plate=True),
        T(21.44, 23.6, [('كوادر', NAVY), ('طائفية', ORANGE)], 'naskh', 120, 'flip', y=1225, plate=True),
        T(23.22, 23.7, [('مكانها', NAVY)], 'almarai', 70, 'marker', y=1325)],
 's8': [T(25.88, 26.6, [('قتل', ORANGE)], 'naskh', 190, 'slam', y=1235, plate=True),
        T(26.66, 27.25, [('أخاه', NAVY)], 'naskh', 180, 'stamp', y=1235, plate=True),
        T(27.34, 28.4, [('مدينة', STEEL), ('التربة', ORANGE)], 'naskh', 110, 'wipe', y=1235, plate=True)],
 's9': [T(30.62, 33.9, [('حيّ على خير العمل', NAVY)], 'naskh', 100, 'wipe', y=1230, plate=True),
        T(34.18, 35.9, [('الأذان', ORANGE)], 'naskh', 180, 'space', y=700, plate=True)],
}
RECAP = [('١', 'إغلاق مراكز تحفيظ القرآن الكريم'), ('٢', 'وفتح فروعٍ لمؤسسات الجباية'), ('٣', 'وطرد أئمة المساجد'), ('٤', 'وإحلال كوادر طائفيةٍ مكانها')]
RECAP_IMG = [(text([(n, ORANGE)], 'naskh', 72), fitw(text([(s, NAVY)], 'almarai', 54), 700)) for n, s in RECAP]
CRED = credit_pill('المصدر: نفحات جهادية')
DUST = Dust(55, 3, AMBER, (2, 5), (-15, -45), 0.45)
PUNCH = [(0.0, 0.10), (4.04, 0.06), (8.38, 0.07), (8.96, 0.09), (10.4, 0.05), (17.1, 0.07), (17.76, 0.08), (25.88, 0.12), (26.66, 0.06), (34.18, 0.05)]
SHAKE = [(0.0, 10), (8.38, 9), (8.96, 12), (17.1, 7), (17.76, 9), (25.88, 18), (26.66, 8)]
BURSTS = [(0.02, 540, 780, NAVY), (8.96, 540, 1170, ORANGE), (17.1, 540, 640, AMBER), (17.76, 540, 600, ORANGE), (25.88, 540, 1235, ORANGE)]

# ---------------------------------------------------------------- scenes
def sc_hook(t):
    c = background(t)
    m = np.zeros((H, W), np.float32)                                    # record lines (ledger)
    for i, y in enumerate(range(560, 1360, 92)):
        L = 760 * ease(seg(t, 0.05 + i * 0.05, 0.5 + i * 0.05)); cv2.line(m, (int((540 + L / 2) * 8), y * 8), (int((540 - L / 2) * 8), y * 8), 1.0, 2, cv2.LINE_AA, shift=3)
    c = c + (AMBER - c) * (m * 0.35)[..., None]
    for e in E['hook']: c = e.draw(c, t)
    return c
def sc_s2(t):
    c = background(t); z = 1.0 + 0.10 * seg(t, 1.75, 6.4)
    c = panel(c, t, 540, 700, 0.86 + 0.14 * ease(seg(t, 1.75, 2.2)), 1.0, z)
    if 4.04 <= t < 4.7: c = c + (C('FFF0DC') - c) * 0.12
    for e in E['s2']: c = e.draw(c, t)
    if t >= 4.72:                                                       # sarcasm: a line drawn through the quote
        m = np.zeros((H, W), np.float32); L = 640 * ease(seg(t, 5.7, 6.1)); cv2.line(m, (int((540 + L / 2) * 8), 1217 * 8), (int((540 - L / 2) * 8), 1217 * 8), 1.0, 6, cv2.LINE_AA, shift=3)
        c = c + (ORANGE - c) * m[..., None]
    return c
def sc_s3(t):
    c = background(t, tint=C('F2E2CC'))
    c = pip(c, t, 790, 430, back(seg(t, 6.38, 6.8)), 1.0)
    for e in E['s3']: c = e.draw(c, t)
    return c
def sc_s4(t):
    c = background(t); dz = seg(t, 10.4, 10.6)
    c = card(c, t, 'shelves', 9.78, 540, 700, 0.92 + 0.08 * ease(seg(t, 9.78, 10.2)), 1.0, -2.0, 1.0, 1.15, 0.5, 0.45, desat=0.6 * dz, tint=0.1 * dz)
    c = badge(c, t, 9.9, '١')
    for e in E['s4']: c = e.draw(c, t)
    return c
COINS = None
def sc_s5(t):
    c = background(t)
    c = card(c, t, 'coins', 13.12, 540, 700, 0.92 + 0.08 * ease(seg(t, 13.12, 13.5)), 1.0, 2.0, 1.05, 1.2, 0.35, 0.5)
    c = badge(c, t, 13.25, '٢')
    if t >= 15.5:                                                      # «فروع»: the branch multiplies
        for k, (dx, dy) in enumerate(((-300, 70), (300, 70), (-180, 160), (180, 160))):
            if t >= 15.6 + k * 0.12:
                im = E['s5'][1].img; c = put(c, im, 540 + dx * ease(seg(t, 15.6 + k * 0.12, 15.9 + k * 0.12)), 1230 + dy * 0.45, 0.42, 0.35 * (1 - seg(t, 17.0, 17.5)))
    for e in E['s5']: c = e.draw(c, t)
    if t >= 17.1: c = burst(c, t, 17.1, 540, 640, 34, AMBER, 1100, 1.0, seed=9, size=9, grav=1600)
    return c
def sc_s6(t):
    c = background(t)
    c = card(c, t, 'mosque', 17.76, 540, 700, 1.0, 1.0, -1.5, 1.1, 1.18, 0.6, 0.45, desat=0.35)
    c = badge(c, t, 17.85, '٣')
    e = E['s6'][0]
    if t < 18.9: c = e.draw(c, t)
    else:                                                               # «طرد»: kicked out of the frame
        k = ease(seg(t, 18.9, 19.25)); c = put(c, e.img, 540 - 1100 * k, 600, 1.0, 1 - seg(t, 19.1, 19.3), blur=12 * k)
    c = E['s6'][1].draw(c, t)
    return c
def sc_s7(t):
    c = background(t)
    c = card(c, t, 'mosque', 17.76, 540, 700, 1.0, 1.0, 1.5, 1.18, 1.28, 0.6, 0.45, desat=0.75, tint=0.15)
    c = badge(c, t, 20.3, '٤')
    for e in E['s7']: c = e.draw(c, t)
    if 21.3 <= t <= 22.0: c = ring(c, t, 21.44, 540, 1225, ORANGE, 0.6, 40, 420, 5)
    return c
def sc_s8(t):
    c = background(t, tint=C('F3DFC8'))
    zp = 1.0 + 0.25 * ease(seg(t, 23.76, 25.8)) + 0.12 * ease(seg(t, 25.88, 26.1))
    c = panel(c, t, 540, 700, 1.0, 1.0, zp, 0.5, 0.40)
    if t >= 25.88: c = c * (1 - 0.18 * np.exp(-(t - 25.88) / 0.5) * np.clip(np.hypot(xx - W / 2, yy - H / 2) / 900, 0, 1)[..., None])
    for e in E['s8']: c = e.draw(c, t)
    c = pin(c, t, 27.34, 150, 1165)
    return c
def sc_s9(t):
    c = background(t)
    c = card(c, t, 'minaret', 28.46, 540, 700, 1.0, 1.0, 0.0, 1.0, 1.22, 0.42, 0.25)
    # minaret top lands at about (515, 380) of the card at the start; waves follow the zoom roughly
    c = waves(c, t, 528, 330 - 30 * seg(t, 28.46, 33), 30.62, 34.4)
    for e in E['s9']: c = e.draw(c, t)
    return c
def sc_recap(t):
    c = background(t)
    c = put(c, text([('سجل', NAVY), ('يا تاريخ', ORANGE)], 'naskh', 130), 540, 520, back(seg(t, 34.75, 35.1), 1.8), min(1, seg(t, 34.75, 34.85)), rot=-3, shadow=0.4)
    for i, (n, s_) in enumerate(RECAP_IMG):
        tt = 34.95 + 0.17 * i; y = 760 + i * 135
        if t < tt: continue
        k = ease(seg(t, tt, tt + 0.25)); c = put(c, n, 880, y, 1.0, k); c = put(c, s_, 860 - 40 - s_.shape[1] / 2 + 60 * (1 - k), y, 1.0, k)
        m = np.zeros((H, W), np.float32); L = 720 * ease(seg(t, tt + 0.1, tt + 0.4)); cv2.line(m, (int(900 * 8), int((y + 50) * 8)), (int((900 - L) * 8), int((y + 50) * 8)), 1.0, 2, cv2.LINE_AA, shift=3)
        c = c + (AMBER - c) * (m * 0.6)[..., None]
    return c
SCENES = [(0.0, 'hook', sc_hook), (1.75, 's2', sc_s2), (6.38, 's3', sc_s3), (9.78, 's4', sc_s4), (13.12, 's5', sc_s5), (17.76, 's6', sc_s6), (20.2, 's7', sc_s7),
          (23.76, 's8', sc_s8), (28.46, 's9', sc_s9), (34.72, 'recap', sc_recap)]
TR = {'s2': ('iris', 0.4), 's3': ('zoom', 0.32), 's4': ('whip', 0.28), 's5': ('whip', 0.28), 's6': ('glitch', 0.2), 's7': ('flash', 0.3), 's8': ('zoom', 0.35), 's9': ('flash', 0.35), 'recap': ('iris', 0.35)}

def scene_at(t):
    i = max(k for k, s in enumerate(SCENES) if s[0] <= t); return i
def picture(t):
    i = scene_at(t); t0, n, fn = SCENES[i]; c = fn(t)
    tr = TR.get(n)
    if tr and t < t0 + tr[1]:
        kind, d = tr; p = (t - t0) / d; prev = SCENES[i - 1][2](t)
        c = {'iris': lambda: iris(prev, c, p, 540, 800), 'zoom': lambda: zoomt(prev, c, p), 'whip': lambda: whip(prev, c, p), 'flash': lambda: flash(prev, c, p), 'glitch': lambda: glitch_cut(prev, c, p)}[kind]()
    return c
def frame(t):
    c = picture(min(t, VID_END - 0.01)) if t < OUT_T + 0.6 else background(t)
    for bt, bx, by, bc in BURSTS:
        if bt <= t < bt + 0.8: c = burst(c, t, bt, bx, by, 46, bc, 1000, 0.7, seed=int(bt * 10)); c = rays(c, t, bt, bx, by, 20, AMBER, 0.45, 160, 900, 4, seed=int(bt))
    c = DUST.draw(c, t, 0.8)
    z = 1.0 + sum(s_ * np.exp(-(t - ti) / 0.2) for ti, s_ in PUNCH if t >= ti); sx = sy = 0.0
    for ti, a in SHAKE:
        if ti <= t < ti + 0.6: k = a * np.exp(-(t - ti) / 0.12); sx += k * np.sin(t * 91 + ti); sy += k * np.cos(t * 77 + ti)
    c = camera(c, z, sx, sy)
    if t < OUT_T + 0.3:
        for L in CAPS: c = L.draw(c, t)
    a_b = eio(seg(t, 0.4, 0.9)) * (1 - eio(seg(t, OUT_T, OUT_T + 0.4)))
    c = brand_corner(c, t, a_b); c = put(c, CRED, W / 2 - 30, 1488, 1.0, 0.95 * a_b)
    c = outro(c, t, OUT_T)
    return finish_frame(c, t, 0.12)

N = int(round(DUR * FPS))
if __name__ == '__main__':
    MODE = sys.argv[1]
    if MODE == 'still':
        for t in [float(x) for x in sys.argv[2:]]:
            RD = Reader(max(0, t - 0.05)); cv2.imwrite(WK + f'st_{t:05.2f}.jpg', frame(t), [cv2.IMWRITE_JPEG_QUALITY, 88])
    elif MODE == 'render':
        part, parts = int(sys.argv[2]), int(sys.argv[3]); i0 = N * part // parts; i1 = N * (part + 1) // parts; RD = Reader(i0 / FPS)
        enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
                                '-crf', '17', '-pix_fmt', 'yuv420p', WK + f'p{part}.mp4'], stdin=subprocess.PIPE)
        for i in range(i0, i1): enc.stdin.write(frame(i / FPS).tobytes())
        enc.stdin.close(); enc.wait(); print('part done', part, flush=True)
    elif MODE == 'finish':
        parts = int(sys.argv[2]); lst = WK + 'parts.txt'; open(lst, 'w').write(''.join(f"file '{WK}p{k}.mp4'\n" for k in range(parts)))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', WK + 'body.mp4'], check=True)
        os.makedirs(OUTD, exist_ok=True); out = OUTD + '01-sajjil-ya-tarikh.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'body.mp4', '-i', WK + 'mix.wav', '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
        print('ok', out)
