# VIDEO 5 «أطفال تعز: نريد أن نتعلم بلا خوف» — documentary testimony, 16:9 1920x1080 25 fps (owner's brief, 27 Nov).
# The footage stays as it is (no zoom, no added shake, natural colours). Suhail's lower third is cut away (source rows 0-800 kept,
# melting into a navy band where the captions live); Suhail's corner logo sits under the channel's badge, which also carries
# «المصدر: قناة سهيل». Marina: word-by-word ivory captions, a few gold Thmanyah words, her list of dreams on the stone wall.
# Hudhaifa: right-aligned phrase reveals on a gold rule; his repeated «… الشعب» lines build a structured stack on a left panel.
# The hard cut is kept. Ending: the brand-kit intro used as the outro (silent), entered by letting the last frame sink into navy.
import sys, os, json, re, difflib
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand')
_a = list(sys.argv); sys.argv = [_a[0], 'B']
from km import *
sys.argv = _a; A = _a
import mg, subprocess
mg.W, mg.H = 1920, 1080                                   # mg.put clips to these
Q = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, Q); from lines5 import LINES, STACK
S = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
W, H, FPS = 1920, 1080, 25
CUT = 72.92; LAST_SRC = 2878                              # last clean source frame: Suhail's blue disc starts at 115.16 s
TS = 116.55                                               # outro starts (last word ends 116.36)
NF = int((TS + 5.0 + 0.3) * FPS)
mg.FONTS['hail'] = S + 'fonts_user/HailElastic-Light.ttf'
mg.FONTS['thm_disp'] = '/home/user/final/handoff/private/fonts/thmanyahserifdisplay-Black.ttf'
GOLD_T, GOLD_M, GOLD_B = C('F7E3AE'), C('B8862E'), C('E9C27A')
IVORY = C('F4EEDF'); INK2 = C('080D18'); NAVYB = C('0B1428')

# ---------------------------------------------------------------- source
class _Src:
    def __init__(s, f): s.f = f; s.cap = None; s.k = -1; s.img = None
    def __getitem__(s, k):
        if k == s.k: return s.img
        if s.cap is None or k < s.k: s.cap = cv2.VideoCapture(s.f); s.k = -1
        while s.k < k:
            ok, im = s.cap.read()
            if not ok: break
            s.k += 1; s.img = im
        return s.img
SRC = _Src(S + 'v5/h5.mp4')
OPEN = _Src('/home/user/final/Kalima_Muqawama_Brand_Kit/Deliverables/Logo_Animation/KM_Intro_Logo_Opener_5s.mp4')
PIC_H = 800                                               # source rows kept (Suhail's name strip starts at ~805)
GROUND = archive_ground(H, W, seed=505).astype(np.float32)
yv = np.arange(H, dtype=np.float32)
ALPHA = (np.clip((PIC_H - yv) / 75.0, 0, 1) ** 1.4)[:, None, None]    # picture melts into the navy band 725-800
ALPHA[PIC_H:] = 0

def grade(f, boy):
    x = f.astype(np.float32) / 255
    L = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    if boy:
        x = x + (1 - x) * 0.12 * (1 - L) ** 2                              # open the canopy shadows a little, no crushing
        x = np.clip((x - 0.5) * 1.03 + 0.5, 0, 1)
    else:
        x = np.clip((x - 0.5) * 1.05 + 0.5, 0, 1); x = L + (x - L) * 1.06   # overcast: a touch of contrast and colour
    x = np.where(x > 0.9, 0.9 + (x - 0.9) * 0.6, x)                         # soft highlights
    return x * 255

# ---------------------------------------------------------------- words and timing
WS = [w for s in json.load(open(S + 'v5/a5.json')) for w in s['words']]
HAR = re.compile('[ً-ْٰ]')
def norm(w):
    w = HAR.sub('', w); w = re.sub(r'[،,:!؟?.()«»\[\]{}]', '', w); w = re.sub('[أإآ]', 'ا', w); return w.replace('ة', 'ه').replace('ى', 'ي')
def align(a, b, words):
    ww = [w for w in WS if a - 0.05 <= w[1] < b - 0.02]
    if not ww: return list(np.linspace(a, b - 0.3, len(words)))
    sm = difflib.SequenceMatcher(None, [norm(x) for x in words], [norm(w[0]) for w in ww], autojunk=False); st = [None] * len(words)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): st[blk.a + k] = ww[blk.b + k][1]
    last = a - 1
    for i, w in enumerate(words):
        if st[i] is not None: last = st[i]; continue
        nxt = next((st[j] for j in range(i + 1, len(words)) if st[j] is not None), b)
        cand = [j for j, x in enumerate(ww) if last < x[1] < nxt]
        if cand:
            best = max(cand, key=lambda j: difflib.SequenceMatcher(None, norm(w), norm(ww[j][0])).ratio())
            if difflib.SequenceMatcher(None, norm(w), norm(ww[best][0])).ratio() > 0.45: st[i] = ww[best][1]; last = st[i]
    known = [(i, s_) for i, s_ in enumerate(st) if s_ is not None]
    if not known: return list(np.linspace(a, b - 0.3, len(words)))
    out = list(np.interp(range(len(words)), [k for k, _ in known], [s_ for _, s_ in known], left=a, right=b - 0.3))
    for i in range(1, len(out)): out[i] = max(out[i], out[i - 1] + 0.05)
    return out

# gold words (typographic emphasis only): stems, matched without tashkeel
EMPH = {'m': {'صوتي', 'حقيبتي', 'واحلامي', 'مدرستي', 'دون', 'خوف', 'التعليم', 'والامان'},
        'h': {'مشعلا', 'الحريه', 'الشهداء', 'اليمن', 'الشعب'}}
DREAMS = [('بمدرسه', 'مدرسة'), ('وبساحه', 'ساحة'), ('وبليله', 'ليلة'), ('وبصباح', 'صباح'), ('كتبنا', 'كتبنا')]

_IMG = {}
def gold_word(w, fk, size):
    a = rtl_line([(w, (255, 255, 255))], fk, size); al = a[..., 3]; h = al.shape[0]
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    col = np.where(y < 0.5, GOLD_T + (GOLD_M - GOLD_T) * (y / 0.5), GOLD_M + (GOLD_B - GOLD_M) * ((y - 0.5) / 0.5))
    return np.dstack([np.broadcast_to(col, al.shape + (3,)).copy(), al])
def wimg(w, fk, size, kind):
    key = (w, fk, size, kind)
    if key not in _IMG: _IMG[key] = gold_word(w, fk, size) if kind == 'gold' else rtl_line([(w, IVORY if kind == 'ivory' else kind)], fk, size)
    return _IMG[key]
_BK = {}
def halo(img):
    key = id(img)
    if key not in _BK or _BK[key][0] is not img:
        P = 30; a = np.pad(img[..., 3].astype(np.float32), P)
        g = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))), (0, 0), 11) * 0.55
        st = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))), (0, 0), 1.0) * 0.8
        _BK[key] = (img, np.dstack([np.ones(a.shape + (3,), np.float32) * INK2, np.clip(np.maximum(g, st), 0, 1)]))
    return _BK[key][1]

CAP_S, GOLD_K = 70, 1.18                                   # caption size; gold words a little larger
def item(w, who, st):
    disp = w.replace('[', '').replace(']', '')
    gold = norm(disp) in EMPH[who]
    if gold: return dict(w=disp, st=st, img=wimg(HAR.sub('', disp) if who == 'm' else disp, 'thm_disp', int(CAP_S * GOLD_K), 'gold'), gold=True)
    return dict(w=disp, st=st, img=wimg(HAR.sub('', disp) if who == 'm' else disp, 'hail', CAP_S, 'ivory'), gold=False)

def rows_of(items, maxw, sp):
    wl = [it['img'].shape[1] - 32 for it in items]; tot = sum(wl) + sp * (len(wl) - 1)
    if tot <= maxw or len(items) < 3: return [items]
    best = None
    for k in range(1, len(items)):
        a_ = sum(wl[:k]) + sp * (k - 1); b_ = sum(wl[k:]) + sp * (len(wl) - k - 1)
        if a_ > maxw or b_ > maxw: continue
        prev = items[k - 1]['w']; pen = abs(a_ - b_) - (420 if prev[-1] in '،:؟.' else 0) + (400 if norm(prev) in ('من', 'في', 'ان', 'الى', 'لا', 'على', 'عن', 'يا') else 0)
        if best is None or pen < best[0]: best = (pen, k)
    k = best[1] if best else len(items) // 2
    return [items[:k], items[k:]]

BAND_Y = (872, 972)                                        # caption row centres in the navy band (2 rows), 1 row → 922
UNITS = []                                                 # dict(t0, t1, who, rows, align)
STACKU = []
for li, (a, b, who, text) in enumerate(LINES):
    ws = text.split(); st = align(a, b, [norm(w) for w in ws])
    if who == 'h': st = [max(s_, CUT + 0.04) for s_ in st]     # his voice starts under her last frames: his words appear after the cut
    its = [item(w, who, s_) for w, s_ in zip(ws, st)]
    nxt = LINES[li + 1][0] if li + 1 < len(LINES) else 116.36
    t1 = min(nxt - 0.06, b + 0.5) if li + 1 < len(LINES) else 116.75
    if li == 15: t1 = CUT - 0.04                               # her last line holds to the cut
    if li in STACK: STACKU.append(dict(t0=st[0] - 0.05, line=li, items=its)); continue
    rows = rows_of(its, 1480, 24)
    UNITS.append(dict(t0=st[0] - 0.08, t1=t1, who=who, rows=rows))

def place(rows, who):
    sp = 24; ys = [922] if len(rows) == 1 else list(BAND_Y)
    for r, y in zip(rows, ys):
        wl = [it['img'].shape[1] - 32 for it in r]; tot = sum(wl) + sp * (len(wl) - 1)
        x = (CX + tot / 2) if who == 'm' else 1690                 # Marina centred; Hudhaifa right-aligned on the gold rule
        for it, l in zip(r, wl): it['x'] = x - l / 2; it['y'] = y; x -= l + sp
CX = 960
for U in UNITS: place(U['rows'], U['who'])

# Hudhaifa's repetition stack (left panel)
STK_S = 50
for j, U in enumerate(STACKU):
    its = U['items']
    for it in its:
        it['img'] = wimg(it['w'], 'thm_disp', int(STK_S * 1.12), 'gold') if norm(it['w']) == 'الشعب' else wimg(it['w'], 'hail', STK_S, 'ivory')
    rows = rows_of(its, 545, 14); U['rows'] = rows; y = 175 + j * 112
    for r_i, r in enumerate(rows):
        wl = [it['img'].shape[1] - 32 for it in r]; x = 575
        for it, l in zip(r, wl): it['x'] = x - l / 2; it['y'] = y + r_i * 62; x -= l + 14
    U['h'] = len(rows)
STK_T0, STK_T1 = STACKU[0]['t0'] - 0.3, LINES[25][0] - 0.05
ys_ = 175
for U in STACKU:                                           # recompute y with two-row lines taking more room
    for r_i, r in enumerate(U['rows']):
        for it in r: it['y'] = ys_ + r_i * 62
    ys_ += 62 * len(U['rows']) + 50

# ---------------------------------------------------------------- graphics
def rmask(w, h, r):
    m = np.zeros((h * 4, w * 4), np.uint8); R = r * 4
    cv2.rectangle(m, (R, 0), (w * 4 - R, h * 4), 255, -1); cv2.rectangle(m, (0, R), (w * 4, h * 4 - R), 255, -1)
    for cx_, cy_ in ((R, R), (w * 4 - R, R), (R, h * 4 - R), (w * 4 - R, h * 4 - R)): cv2.circle(m, (cx_, cy_), R, 255, -1)
    return cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
BX0, BY0, BX1, BY1 = 1566, 34, 1854, 232                    # the channel badge covers Suhail's corner logo (x 1594-1822, y 60-202)
BMASK = rmask(BX1 - BX0, BY1 - BY0, 26)
BFILL = None
LOGO = logo_rgba(124)
SRC_TXT = rtl_line([('المصدر: قناة سهيل', C('D9C7A0'))], 'plex', 24)
def badge(c, a):
    if a <= 0.01: return c
    reg = c[BY0:BY1, BX0:BX1]; m = BMASK[..., None]
    gy = np.linspace(0, 1, BY1 - BY0, dtype=np.float32)[:, None, None]; fill = C('13203A') + (NAVYB - C('13203A')) * gy
    reg = reg * (1 - m * a) + fill * m * a                                    # fully opaque: no trace of the source logo
    e = (BMASK - cv2.erode(BMASK, np.ones((3, 3), np.uint8)))[..., None]; reg = reg + (BRONZE_L - reg) * e * 0.9 * a
    c[BY0:BY1, BX0:BX1] = reg
    c = mg.put(c, LOGO, (BX0 + BX1) / 2, BY0 + 82, 1.0, a)
    return mg.put(c, SRC_TXT, (BX0 + BX1) / 2, BY1 - 26, 1.0, a)

NAME_M = rtl_line([('الطفلة مارينا أحمد عبدالكريم', BRONZE_L)], 'plex', 30)
NAME_H = rtl_line([('الطفل حذيفة محمد حميد السعيد', BRONZE_L)], 'plex', 30)

DREAM_IMG = [wimg(d, 'thm_disp', 84, 'gold') for _, d in DREAMS]
DREAM_T = []
_wm = [(norm(w[0]), w[1]) for w in WS if 30 < w[1] < 46]
for key, _ in DREAMS: DREAM_T.append(next(t for n, t in _wm if n == key))

PANEL = np.clip((640 - np.arange(W, dtype=np.float32)) / 120, 0, 1)[None, :, None] * np.clip((PIC_H - 20 - yv) / 60, 0, 1)[:, None, None]

def opener_layer(t_op):
    """the brand-kit intro (1080x1920) laid out for 16:9: the sharp centre on a blurred, widened copy of itself"""
    k = int(np.clip(t_op * 30, 0, 149)); f = OPEN[k].astype(np.float32)
    bg = cv2.resize(f[300:1520], (W, int(1220 * W / 1080)), interpolation=cv2.INTER_AREA)
    y0 = (bg.shape[0] - H) // 2; bg = cv2.GaussianBlur(bg[y0:y0 + H], (0, 0), 24) * 0.7
    fg = cv2.resize(f[290:1530], (int(1080 * 1080 / 1240), H), interpolation=cv2.INTER_AREA); fw = fg.shape[1]; x0 = (W - fw) // 2
    m = np.clip(np.minimum(np.arange(fw), fw - 1 - np.arange(fw)) / 90.0, 0, 1)[None, :, None]
    out = bg.copy(); out[:, x0:x0 + fw] = fg * m + bg[:, x0:x0 + fw] * (1 - m)
    return out

def frame(k):
    t = k / FPS
    ks = min(k, LAST_SRC); boy = t >= CUT
    f = grade(SRC[ks], boy)
    c = GROUND.copy()
    c[:PIC_H] = c[:PIC_H] * (1 - ALPHA[:PIC_H]) + f[:PIC_H] * ALPHA[:PIC_H]
    d = ease(seg(t, 115.15, 116.7))                                          # the held last frame softens and sinks while he finishes
    if d > 0.005:
        c[:PIC_H] = cv2.GaussianBlur(c[:PIC_H], (0, 0), 0.1 + 5 * d) * (1 - 0.55 * d) + GROUND[:PIC_H] * 0.55 * d
    # ---- Marina: her list of dreams on the stone wall (left of her)
    if 30.5 < t < 47.0 and not boy:
        fo = 1 - ease(seg(t, 45.7, 46.6))
        for j, (img, t0) in enumerate(zip(DREAM_IMG, DREAM_T)):
            q = t - t0 + 0.05
            if q < 0: continue
            p = ease(q / 0.5); y = 196 + j * 118
            c = mg.put(c, halo(img), 270, y + 10 * (1 - p), 1.0, p * fo); c = mg.put(c, img, 270, y + 10 * (1 - p), 1.0, p * fo)
            c = hair(c, 270 + 46 * p, y + 60, 270 - 46 * p, y + 60, BRONZE_L, 0.6 * p * fo, 2) if j < 4 else c
    # ---- Hudhaifa: the repetition stack on a left panel
    if STK_T0 - 0.5 < t < STK_T1 + 0.6:
        pa = ease(seg(t, STK_T0 - 0.4, STK_T0 + 0.2)) * (1 - ease(seg(t, STK_T1, STK_T1 + 0.5)))
        c[:PIC_H] = c[:PIC_H] * (1 - PANEL[:PIC_H] * 0.86 * pa) + NAVYB * PANEL[:PIC_H] * 0.86 * pa
        if pa > 0.02: c = hair(c, 612, 150, 600, 150 + (ys_ - 175) * min(1, pa), BRONZE_L, 0.8 * pa, 2)
        for j, U in enumerate(STACKU):
            if t < U['t0']: continue
            nxt = STACKU[j + 1]['t0'] if j + 1 < len(STACKU) else 1e9
            dim = 0.55 if t > nxt + 0.3 else 1.0
            for r in U['rows']:
                for it in r:
                    q = t - it['st']
                    if q < -0.03: continue
                    p = ease(q / 0.30); a = min(1, max(0, q + 0.03) / 0.2) * dim * pa
                    c = mg.put(c, halo(it['img']), it['x'], it['y'], 1.0, a); c = mg.put(c, it['img'], it['x'], it['y'], 1.0, a, wipe=p)
    # ---- band captions
    for U in UNITS:
        if not (U['t0'] - 0.05 <= t < U['t1'] + 0.2): continue
        fo = 1 - ease(seg(t, U['t1'], U['t1'] + 0.2))
        if U['who'] == 'h':                                                 # the gold rule his phrases hang from
            p = ease(seg(t, U['t0'], U['t0'] + 0.35)); hh = 64 * len(U['rows'])
            c = hair(c, 1722, 922 - hh * p, 1722, 922 + hh * p, BRONZE_L, 0.9 * fo, 3)
        for r in U['rows']:
            for it in r:
                q = t - it['st']
                if q < -0.04: continue
                if U['who'] == 'm':
                    p = ease(q / 0.22); a = min(1, (q + 0.04) / 0.16) * fo; dy = 8 * (1 - p)
                    if it['gold']: c = mg.put(c, it['img'], it['x'], it['y'], 1.0, a, wipe=ease(q / 0.38))
                    else: c = mg.put(c, it['img'], it['x'], it['y'] + dy, 1.0, a)
                else:                                                       # Hudhaifa: deliberate right-to-left phrase reveal
                    p = ease(q / 0.30); a = min(1, (q + 0.04) / 0.12) * fo
                    c = mg.put(c, it['img'], it['x'] - 14 * (1 - p), it['y'], 1.0, a, wipe=p)
    # ---- names (from the source's own name strips), shown once at each child's start
    for img, t0, t1 in ((NAME_M, 0.4, 9.0), (NAME_H, CUT + 0.3, CUT + 8.5)):
        if t0 <= t < t1 + 0.4:
            a = ease(seg(t, t0, t0 + 0.4)) * (1 - ease(seg(t, t1, t1 + 0.4)))
            c = hair(c, 1760, 1046, 1760 - 30 * a, 1046, BRONZE_L, a, 2)
            c = mg.put(c, img, 1720 - img.shape[1] / 2 + 16, 1046, 1.0, a)
    # ---- ending: the last frame sinks into navy while the brand intro draws in (silent)
    if t >= TS - 0.1:
        p = ease(seg(t, TS - 0.1, TS + 1.1))
        if p > 0:
            pic = cv2.GaussianBlur(c, (0, 0), 0.1 + 7 * p) if p > 0.02 else c
            op = opener_layer(t - TS)
            c = pic * (1 - p) + op * p
    if t < TS + 0.6: c = badge(c, 1 - ease(seg(t, TS - 0.1, TS + 0.5)))
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 1.4
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    if A[1] == 'still':
        os.makedirs(Q + 'st', exist_ok=True)
        for ts in A[2:]: cv2.imwrite(Q + f'st/s_{float(ts):06.2f}.jpg', frame(int(round(float(ts) * FPS))))
    elif A[1] == 'render':
        part, n = int(A[2]), int(A[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', Q + f'parts/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif A[1] == 'dump':
        print('NF', NF, 'dur', NF / FPS)
        for U in UNITS: print(U['who'], round(U['t0'], 2), round(U['t1'], 2), ' / '.join(' '.join(it['w'] for it in r) for r in U['rows']))
        for U in STACKU: print('STACK', round(U['t0'], 2), ' / '.join(' '.join(it['w'] for it in r) for r in U['rows']))
        print('dreams', [round(x, 2) for x in DREAM_T])
