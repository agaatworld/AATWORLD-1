# VIDEO 4 «خطاب المقاتل» — ONE style for 2:16 of oratory, bright frosty morning, for Facebook.
# The real take fills the frame (sky extended a little at the top); a slow dolly-in all through.
# Two fixed places, never on his face:
#   • the SKY band above his head (y 300–555): Quran ﴿…﴾ in deep navy Panorama with a soft light glow, and «لله درّكم» in forged bronze;
#   • the LOWER band (y ~1270–1490): his running words, Almarai, ivory (hadith «…» in gold), navy stroke + soft halo, word by word.
# Light frost motes drift in the air; warm dawn highlights; no darkening.
import sys, os, json, re, difflib
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand')
_a = list(sys.argv); sys.argv = [_a[0], 'B']
from km import *
sys.argv = _a; A = _a
import mg, subprocess
from scipy.ndimage import gaussian_filter1d
mg.FONTS['amiriq'] = '/home/user/final/kahlani/fonts/g_AmiriQuran-Regular.ttf'
Q = os.path.dirname(os.path.abspath(__file__)) + '/'
sys.path.insert(0, Q); from lines4 import LINES, HOLD
import glob
OWN = {}
for fn in glob.glob(Q + 'db/lines/*.json'):
    d_ = json.load(open(fn)); d_ = d_.get('data', d_); OWN[int(d_['n'])] = d_['text'].strip()
def remark(t): return re.sub(r'^(ف?لله درّكم)', r'{\1}', t)
LINES = [(a, b, remark(OWN[i + 1]) if (i + 1) in OWN else t) for i, (a, b, t) in enumerate(LINES)]
# strong words chosen for the speech (line number → words); the owner can add more with [[ ]] in the studio
STRONG = {3: ['بالآخرة'], 4: ['الصادقة'], 5: ['الشدائد'], 6: ['المغانم'], 7: ['استجابوا'], 9: ['بعقيدتهم'], 12: ['الخذلان', 'الجبال'],
          14: ['عقيدتكم'], 16: ['تترفّعون'], 18: ['ذراع', 'إيران'], 19: ['كسر', 'الله'], 20: ['ألف', 'عام'], 21: ['اليمن'],
          25: ['حبيبكم'], 34: ['يثبّتنا', 'ويثبّتكم']}
W, H, FPS = 1080, 1920, 30; NF = 4087; DUR = NF / FPS; CX = 540
SRCF = Q + '../an/src/v4.mp4'
S0, FY0 = 1.5, 130.0                                   # source 720x1280 → 1080 wide; picture shifted down 130 px (sky extended above)

class _Src:
    def __init__(s): s.cap = None; s.k = -1; s.f = None
    def __getitem__(s, k):
        if k == s.k: return s.f
        if s.cap is None or k < s.k: s.cap = cv2.VideoCapture(SRCF); s.k = -1
        while s.k < k:
            ok, f = s.cap.read()
            if not ok: break
            s.k += 1; s.f = f
        return s.f
SRC = _Src()

# ---------------------------------------------------------------- face (sampled every 3rd frame) and camera
_F = json.load(open(Q + 'faces3.json'))
fk = np.array([[r[0], r[1], r[2], r[3]] for r in _F], np.float32)
FACE = np.array([np.interp(np.arange(NF) / 3.0, np.arange(len(fk)), gaussian_filter1d(fk[:, j], 1.0)) for j in range(4)]).T
FXM, FYM = float(np.median(FACE[:, 0] + FACE[:, 2] / 2)), float(np.median(FACE[:, 1] + FACE[:, 3] / 2))
def zoom(t): return 1.0 + 0.075 * eio(t / DUR)
def cam(t):
    s = S0 * zoom(t); cx, cy = S0 * FXM, FY0 + S0 * FYM                 # the dolly-in is centred on his usual face position
    return np.float32([[s, 0, cx - s * FXM], [0, s, cy - s * FYM]])
def face_box(k):
    """his head on the canvas: face box widened, plus the turban above it"""
    x, y, w, h = FACE[min(k, NF - 1)]; M = cam(k / FPS); s = M[0, 0]
    x0, y0 = M[0, 0] * x + M[0, 2], M[1, 1] * (y - 0.55 * h) + M[1, 2]
    return x0 - 0.15 * s * w, y0, x0 + s * w * 1.15, M[1, 1] * (y + h * 1.08) + M[1, 2]

# ---------------------------------------------------------------- grade: bright, cool frost, warm dawn highlights, soft bloom
WARM = C('F7E7C9')
def grade(c):
    x = c / 255.0
    L = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    x = x + (1 - x) * 0.10 * (1 - L) ** 2                                       # open the shadows (jacket, shrubs)
    x = L + (x - L) * 1.08                                                       # a little more colour (the source is pale)
    x = np.clip((x - 0.5) * 1.05 + 0.5, 0, 1)
    hi = np.clip((L - 0.62) * 2.6, 0, 1); x = x + (WARM / 255 - x) * 0.07 * hi  # warm morning light on the highlights
    q = cv2.resize(x.astype(np.float32), (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    bl = cv2.resize(cv2.GaussianBlur(np.clip(q - 0.80, 0, 1), (0, 0), 6), (W, H), interpolation=cv2.INTER_LINEAR)
    x = 1 - (1 - x) * (1 - bl * 0.55)                                            # frost bloom
    return np.clip(x * 255, 0, 255)

def plate(k):
    t = k / FPS; f = SRC[min(k, NF - 1)].astype(np.float32)
    M = cam(t)
    c = cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    top = int(M[1, 2]) + 2                                                       # rows above the picture: softened mirror of the sky
    if top > 0:
        band = cv2.GaussianBlur(c[:top + 40], (0, 0), 12); m = np.clip((top + 20 - np.arange(top + 40)) / 40, 0, 1)[:, None, None]
        c[:top + 40] = band * m + c[:top + 40] * (1 - m)
    return grade(c)

# frost motes
RNG = np.random.default_rng(44); NM = 90
MX, MY = RNG.uniform(0, W, NM), RNG.uniform(250, 1700, NM); MV = RNG.uniform(6, 18, NM); MS = RNG.uniform(1.2, 2.8, NM); MA = RNG.uniform(0.18, 0.45, NM); MP = RNG.uniform(0, 6.28, NM)
def motes(c, t):
    m = np.zeros((H, W), np.float32)
    for i in range(NM):
        x = (MX[i] + 14 * np.sin(t * 0.4 + MP[i])) % W; y = (MY[i] - MV[i] * t) % 1500 + 250
        cv2.circle(m, (int(x * 4), int(y * 4)), int(MS[i] * 4), float(MA[i]), -1, cv2.LINE_AA, shift=2)
    m = cv2.GaussianBlur(m, (0, 0), 1.3)[..., None]
    return c + (255 - c) * m * 0.8

# ---------------------------------------------------------------- words and timing
WS = [w for s in json.load(open(Q + '../an/a4.json')) for w in s['words']]
HARAKAT = re.compile('[ً-ْٰ]')
def norm(w):
    w = HARAKAT.sub('', w); w = re.sub(r'[،,:!؟?.()«»\[\]{}﴿﴾]', '', w); w = re.sub('[أإآ]', 'ا', w); return w.replace('ة', 'ه').replace('ى', 'ي')
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
    known = [(i, s) for i, s in enumerate(st) if s is not None]
    if not known: return list(np.linspace(a, b - 0.3, len(words)))
    out = list(np.interp(range(len(words)), [k for k, _ in known], [s for _, s in known], left=a, right=b - 0.3))
    for i in range(1, len(out)): out[i] = max(out[i], out[i - 1] + 0.05)
    return out

def tokens(text):
    """words with their role: 'q' Quran, 'h' hadith, 'd' لله درّكم, 's' speech"""
    out = []; role = 's'
    strong = False
    for raw in text.split():
        if raw.startswith('[['): strong = True
        k_ = strong
        if raw.endswith(']]') or ']]' in raw: strong = False
        raw = raw.replace('[[', '').replace(']]', '').replace('[', '').replace(']', '')
        r = role if not (k_ and role == 's') else 'k'
        if raw.startswith('﴿'): r = role = 'q'
        if raw.startswith('«'): r = role = 'h'
        if raw.startswith('{'): r = role = 'd'
        out.append((raw, r))
        if raw.endswith('﴾') or raw.rstrip('،:؟').endswith('﴾'): role = 's'
        if raw.rstrip('،:؟.').endswith('»'): role = 's'
        if raw.endswith('}'): role = 's'
    return out
def show(raw, role):
    w = raw.replace('{', '').replace('}', '')
    if role in ('s', 'h', 'k'): w = HARAKAT.sub('', w)                                 # Almarai captions without tashkeel (cleaner); Quran keeps it
    return w

# ---------------------------------------------------------------- caption geometry
LOW_S, LOW_W, LOW_BOT = 78, 840, 1486          # Almarai ExtraBold rows in the lower band (bottom anchored)
SKY_S, SKY_W, SKY_TOP = 74, 660, 300           # Panorama rows in the sky band (top anchored); 660 wide (x 210–870) so the corner logo stays clear
DUR_S = 150
INK2 = C('080D18'); NAVYQ = C('16264A'); GOLDH = C('F0D49B'); EMBER = C('F08A4B')
COLS = {'s': PARCH, 'h': GOLDH, 'k': EMBER}
QS = 76
_IMG = {}
def wimg(w, fk, size, col):
    key = (w, fk, size, tuple(col) if not isinstance(col, str) else col)
    if key not in _IMG:
        if isinstance(col, str) and col == 'quran':
            a = rtl_line([(w, (255, 255, 255))], fk, size); al = a[..., 3].astype(np.float32)
            ed = cv2.GaussianBlur(cv2.dilate(al, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))), (0, 0), 0.6)
            rgb = NAVYQ * al[..., None] + C('D9B56E') * (1 - al[..., None])
            _IMG[key] = np.dstack([rgb, np.maximum(al, ed)])
        elif isinstance(col, str):
            a = rtl_line([(w, (255, 255, 255))], fk, size); al = a[..., 3]; h = al.shape[0]
            y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]; top, mid, bot = C('E9C98F'), C('7E5A2A'), C('C9A46A')
            colr = np.where(y < 0.55, top + (mid - top) * (y / 0.55), mid + (bot - mid) * ((y - 0.55) / 0.45))
            _IMG[key] = np.dstack([np.broadcast_to(colr, al.shape + (3,)).copy(), al])
        else: _IMG[key] = rtl_line([(w, col)], fk, size)
    return _IMG[key]
_BK = {}
def backing(img, kind):
    key = (id(img), kind)
    if key not in _BK:
        P = 36; a = np.pad(img[..., 3].astype(np.float32), P)
        if kind == 'light':                                                     # sky text: a soft light glow behind dark letters
            g = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))), (0, 0), 12) * 0.75
            _BK[key] = np.dstack([np.ones(a.shape + (3,), np.float32) * C('FBF7EE'), np.clip(g, 0, 1)])
        else:                                                                   # lower band: navy stroke + soft navy halo
            st = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))), (0, 0), 1.2)
            halo = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))), (0, 0), 13) * 0.62
            _BK[key] = np.dstack([np.ones(a.shape + (3,), np.float32) * INK2, np.clip(np.maximum(st * 0.92, halo), 0, 1)])
    return _BK[key]

STOP = {'من', 'في', 'عن', 'إلى', 'على', 'أن', 'إن', 'ما', 'لا', 'ولا', 'بين', 'مع', 'صلى', 'قال', 'يا', 'بأن', 'الذي', 'التي', 'الذين', 'ثم', 'و', 'لكم', 'وبين'}
def brk(a_last, b_first):
    """cost of breaking between two words: never after a little word, never inside a quote, gladly after punctuation"""
    w = HARAKAT.sub('', a_last).strip('«»﴿﴾')
    c = 0
    if w.rstrip('،:؟') in STOP and not a_last[-1] in '،:؟»': c += 600
    if a_last[-1] in '،:؟»﴾': c -= 160
    if a_last.count('«') > a_last.count('»'): c += 400                       # «… opened and not closed
    return c
def pack(items, fk, size, maxw, sp=0.34):
    """greedy rows; prefer breaking after punctuation"""
    f = font(fk, size); rows = [[]]; wl = {}
    for it in items:
        wl[id(it)] = f.getlength(it['w'], direction='rtl', language='ar')
    def width(r): return sum(wl[id(i)] for i in r) + sp * size * (len(r) - 1)
    for it in items:
        if rows[-1] and width(rows[-1] + [it]) > maxw: rows.append([])
        rows[-1].append(it)
    # rebalance two rows (no orphan word)
    if len(rows) == 2:
        allw = rows[0] + rows[1]; best = None
        for k in range(1, len(allw)):
            a_, b_ = allw[:k], allw[k:]
            if width(a_) > maxw or width(b_) > maxw: continue
            pen = abs(width(a_) - width(b_)) + brk(a_[-1]['w'], b_[0]['w'])
            if best is None or pen < best[0]: best = (pen, k)
        if best: rows = [allw[:best[1]], allw[best[1]:]]
        pack.cost = brk(rows[0][-1]['w'], rows[1][0]['w']) if len(rows) == 2 else 0
    else: pack.cost = 0
    return rows, wl

def place_rows(rows, wl, fk, size, anchor, mode, sp=0.34):
    pitch = size * {'almarai': 1.42, 'amiriq': 1.62}.get(fk, 1.30)
    n = len(rows)
    if mode == 'bottom': y_last = anchor - size * 0.62; ys = [y_last - pitch * (n - 1 - r) for r in range(n)]
    else: y0 = anchor + size * 0.65; ys = [y0 + pitch * r for r in range(n)]
    for r, row in enumerate(rows):
        tot = sum(wl[id(i)] for i in row) + sp * size * (len(row) - 1); x = CX + tot / 2
        for it in row:
            l = wl[id(it)]; it['x'] = x - l / 2; it['y'] = ys[r]; x -= l + sp * size
    return ys[0] - size * 0.70, ys[-1] + size * 0.62

def split_chunks(items, fk, size, maxw, sp=0.34):
    """at most two rows per unit: a long phrase becomes two units of similar width, cut after punctuation when possible"""
    rows, wl = pack(items, fk, size, maxw, sp)
    if len(rows) <= 2: return [items]
    n = (len(rows) + 1) // 2; w = [wl[id(i)] for i in items]; tot = sum(w); cuts = []; start = 0
    for c_ in range(1, n):
        target = tot * c_ / n; best = None; acc = sum(w[:start])
        for k in range(start + 1, len(items) - (n - c_)):
            acc_k = sum(w[:k]); pen = abs(acc_k - target) + brk(items[k - 1]['w'], items[k]['w']) * tot / n / 400 - (0.35 * tot / n if items[k - 1].get('line') != items[k].get('line') else 0)
            if best is None or pen < best[0]: best = (pen, k)
        cuts.append(best[1]); start = best[1]
    bounds = [0] + cuts + [len(items)]
    return [items[bounds[i]:bounds[i + 1]] for i in range(len(bounds) - 1)]
LOW, SKY = [], []                       # display units: dict(t0, t1, items, kind)
for li, (a, b, text) in enumerate(LINES):
    toks = tokens(text); st = align(a, b, [norm(w) for w, r in toks])
    sw = {norm(x) for x in STRONG.get(li + 1, [])}
    toks = [(w, 'k' if (r == 's' and norm(w) in sw) else r) for w, r in toks]
    items = [dict(w=show(w, r), role=r, st=s0, line=li) for (w, r), s0 in zip(toks, st)]
    nxt_a = LINES[li + 1][0] if li + 1 < len(LINES) else DUR
    sky = [i for i in items if i['role'] in ('q', 'd')]; low = [i for i in items if i['role'] not in ('q', 'd')]
    if sky:
        end_li = HOLD.get(li, li); end = (LINES[end_li + 1][0] if end_li + 1 < len(LINES) else DUR) - 0.10
        if sky[0]['role'] == 'd':
            for i in sky: i['img'] = wimg(i['w'], 'naskh', DUR_S, 'bronze')
            rows, wl = pack(sky, 'naskh', DUR_S, SKY_W); y0, y1 = place_rows(rows, wl, 'naskh', DUR_S, SKY_TOP, 'top')
            SKY.append(dict(t0=sky[0]['st'] - 0.08, t1=end, items=sky, kind='d', y0=y0, y1=y1))
        else:
            if SKY and SKY[-1]['kind'] == 'q' and SKY[-1].get('cont') and SKY[-1]['line'] == li - 1:   # the verse continues on the next line (35 → 36)
                U = SKY[-1]; SKY.pop()
                if U['items'][-1]['w'].endswith('﴾'): U['items'][-1]['w'] = U['items'][-1]['w'][:-1]     # one verse across two lines: one pair of brackets
                if sky[0]['w'].startswith('﴿'): sky[0]['w'] = sky[0]['w'][1:]
                U['items'] += sky
                pool = U['items']
            else:
                pool = sky
            parts = split_chunks(pool, 'amiriq', QS, SKY_W, 0.30)
            for pi, part in enumerate(parts):
                t0 = part[0]['st'] - 0.10; t1 = (parts[pi + 1][0]['st'] - 0.12) if pi + 1 < len(parts) else end
                U = dict(t0=t0, t1=t1, items=part, kind='q', cont=(li in HOLD), line=li)
                for i in part: i['img'] = wimg(i['w'], 'amiriq', QS, 'quran')
                rows, wl = pack(part, 'amiriq', QS, SKY_W, 0.30); U['y0'], U['y1'] = place_rows(rows, wl, 'amiriq', QS, SKY_TOP, 'top', 0.30)
                SKY.append(U)
    if low:
        for i in low: i['img'] = wimg(i['w'], 'almarai', LOW_S, COLS[i['role']])
        chunks = split_chunks(low, 'almarai', LOW_S, LOW_W)
        for ci, its in enumerate(chunks):
            size = LOW_S; rows, wl = pack(its, 'almarai', size, LOW_W)
            if pack.cost >= 350:                                                   # a bad break: a slightly smaller size may allow a natural one
                for s2 in (74, 70, 66):
                    for i in its: i['img2'] = wimg(i['w'], 'almarai', s2, COLS[i['role']])
                    r2, w2 = pack(its, 'almarai', s2, LOW_W)
                    if pack.cost < 500:
                        size, rows, wl = s2, r2, w2
                        for i in its: i['img'] = i['img2']
                        break
            y0, y1 = place_rows(rows, wl, 'almarai', size, LOW_BOT, 'bottom')
            t0 = its[0]['st'] - 0.10
            t1 = (chunks[ci + 1][0]['st'] - 0.12) if ci + 1 < len(chunks) else min(nxt_a - 0.06, b + 0.6)
            LOW.append(dict(t0=t0, t1=t1, items=its, kind='low', y0=y0, y1=y1, rows=[[i['w'] for i in r] for r in rows]))

def check_faces():
    bad = 0; worst = 1e9
    for U in LOW + SKY:
        for k in range(max(0, int(U['t0'] * FPS)), min(NF, int(U['t1'] * FPS) + 8)):
            x0, y0, x1, y1 = face_box(k)
            gap = (U['y0'] - y1) if U in LOW else (y0 - U['y1'])
            worst = min(worst, gap)
            if gap < 10: bad += 1
    return bad, worst

yy_, xx_ = np.mgrid[0:H, 0:W].astype(np.float32)
BEAM = (np.exp(-((xx_ - CX) / 330) ** 2) * np.clip(1 - yy_ / 780, 0, 1) ** 1.3).astype(np.float32); del yy_, xx_
GR = np.random.default_rng(7); NG = 64
GX, GY, GV, GS, GA = CX + GR.normal(0, 190, NG), GR.uniform(0, 700, NG), GR.uniform(35, 85, NG), GR.uniform(2.0, 3.8, NG), GR.uniform(0.5, 0.95, NG)
def gold_motes(c, t, B):
    m = np.zeros((H, W), np.float32)
    for i in range(NG):
        y = (GY[i] + GV[i] * t) % 700 + 40; x = GX[i] + 10 * np.sin(t * 0.7 + i)
        fade = np.clip((700 - y) / 160, 0, 1)
        cv2.circle(m, (int(x * 4), int(y * 4)), int(GS[i] * 4), float(GA[i] * fade), -1, cv2.LINE_AA, shift=2)
    m = cv2.GaussianBlur(m, (0, 0), 1.2)[..., None] * B
    return c + (C('F3D38E') - c) * m
def star(c, x, y, r, col, a):
    m = np.zeros((H, W), np.float32)
    for rot in (0, 45):
        th = np.deg2rad(rot + np.array([0, 90, 180, 270]) + 45); pts = np.stack([x + r * np.cos(th), y + r * np.sin(th)], 1)
        cv2.fillConvexPoly(m, (pts * 4).astype(np.int32), 1.0, cv2.LINE_AA, shift=2)
    return c + (col - c) * (m * a)[..., None]

def frame(k):
    t = k / FPS
    c = plate(k)
    c = motes(c, t)
    B = 0.0
    for U in SKY:
        if U['kind'] == 'q': B = max(B, ease(seg(t, U['t0'] - 0.5, U['t0'] + 0.5)) * (1 - ease(seg(t, U['t1'] + 0.1, U['t1'] + 0.8))))
    if B > 0.01:
        c = c + (C('FFF2D2') - c) * (BEAM * 0.34 * B)[..., None]                 # light from above while a verse is on screen
        xs = np.arange(W, dtype=np.float32); sh = np.zeros(W, np.float32)          # soft shafts of light coming down, drifting slowly
        for j, (x0, w0, sp) in enumerate(((380, 40, 9), (560, 26, -7), (700, 34, 6), (470, 18, -11))):
            sh += np.exp(-((xs - x0 - sp * t) / w0) ** 2) * (0.6 + 0.4 * np.sin(t * 0.9 + j))
        shaft = sh[None, :] * np.clip(1 - np.arange(H, dtype=np.float32)[:, None] / 820, 0, 1) ** 1.5
        c = c + (C('FFF6E0') - c) * (shaft * 0.20 * B)[..., None]
        c = gold_motes(c, t, B)
    for U in SKY:
        if not (U['t0'] - 0.1 <= t < U['t1'] + 0.35): continue
        fo = 1 - ease(seg(t, U['t1'], U['t1'] + 0.35)) if U['kind'] != 'q' else 1 - ease(seg(t, U['t1'], U['t1'] + 0.5))
        for i in U['items']:
            q = t - i['st']
            if q < -0.06: continue
            img = i['img']
            if U['kind'] == 'd':                                                   # «لله درّكم»: settles from slightly larger, a sheen passes
                p = ease(q / 0.30); s = 1.10 - 0.10 * p; a = min(1, q / 0.12) * fo
                c = mg.put(c, backing(img, 'light'), i['x'], i['y'], s, a * 0.9); c = mg.put(c, img, i['x'], i['y'], s, a)
                pp = seg(q, 0.15, 0.85)
                if 0 < pp < 1:
                    hw = img.shape[1]; band = np.exp(-((np.arange(hw, dtype=np.float32) - hw * (1.2 - 1.4 * pp)) / (hw * 0.12)) ** 2)
                    c = mg.put(c, np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * 255, img[..., 3] * band[None, :]]), i['x'], i['y'], s, 0.6 * fo)
            else:                                                                  # Quran: each word comes down softly out of the light
                p = ease(q / 0.75); a = min(1, max(0, q) / 0.45) * fo
                dy = -64 * (1 - p) - 14 * (1 - fo)
                c = mg.put(c, backing(img, 'light'), i['x'], i['y'] + dy, 1.0, a * 0.95)
                c = mg.put(c, img, i['x'], i['y'] + dy, 0.97 + 0.03 * p, a, blur=4.0 * (1 - p))
        if U['kind'] == 'q':                                                       # ornament under the verse: a gold eight-point star and two fine rules
            p = ease(seg(t, U['t0'] + 0.2, U['t0'] + 1.0)) * fo; yo = U['y1'] + 30
            if p > 0.02:
                for sg in (-1, 1): c = hair(c, CX + sg * 18, yo, CX + sg * (18 + 150 * p), yo, C('C9A46A'), 0.9 * fo, 2)
                c = star(c, CX, yo, 10 * min(1, p * 1.4), C('D9B56E'), 0.95 * fo)
    for U in LOW:
        if not (U['t0'] - 0.05 <= t < U['t1'] + 0.16): continue
        fo = 1 - ease(seg(t, U['t1'], U['t1'] + 0.16))
        for i in U['items']:
            q = t - i['st']
            if q < -0.04: continue
            p = ease(q / 0.18); a = min(1, q / 0.10 + 0.4) * fo if q >= 0 else 0.4 * fo * (1 + q / 0.04)
            if a <= 0.01: continue
            dy = 12 * (1 - p); sc = 1.0 + (0.16 * (1 - ease(q / 0.22)) if i['role'] == 'k' and q >= 0 else 0)
            c = mg.put(c, backing(i['img'], 'dark'), i['x'], i['y'] + dy, sc, a); c = mg.put(c, i['img'], i['x'], i['y'] + dy, sc, a)
    c = mg.put(c, LOGO, 118, 348)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 1.8
    return np.clip(c + g, 0, 255).astype(np.uint8)

LOGO = logo_rgba(118)
if __name__ == '__main__':
    if A[1] == 'still':
        os.makedirs(Q + 'st', exist_ok=True)
        for ts in A[2:]: cv2.imwrite(Q + f'st/s_{float(ts):06.2f}.jpg', frame(int(float(ts) * FPS)))
    elif A[1] == 'render':
        part, n = int(A[2]), int(A[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', Q + f'parts/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif A[1] == 'dump':
        print('faces: frames too close =', *check_faces())
        for U in SKY: print('SKY', U['kind'], round(U['t0'], 2), round(U['t1'], 2), int(U['y0']), int(U['y1']), ' '.join(i['w'] for i in U['items']))
        for U in LOW: print('LOW', round(U['t0'], 2), round(U['t1'], 2), int(U['y0']), ' / '.join(' '.join(r) for r in U['rows']))
