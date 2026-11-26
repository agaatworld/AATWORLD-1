# VIDEO 1 «الصوت والطريق والقصيدة» — in-car qasida, direction B «Imperial Archive»
# python3 q1.py render <part> <nparts> | still <t> | finish
import sys, os, json
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand')
_a = list(sys.argv); sys.argv = [_a[0], 'B']
from km import *
sys.argv = _a; A = _a
import mg, subprocess
from scipy.ndimage import gaussian_filter1d
Q = os.path.dirname(os.path.abspath(__file__)) + '/'
W, H, FPS = 1080, 1920, 30
DUR = 118.866; NF = int(DUR * FPS)
xx, yy = mg.xx, mg.yy
CX = 540                                   # the one centre axis
TOP_C = 525                                # centre of the top text band (300–660); text width ≤ 700 so it never meets the corner logo
BOT_C = 1395                               # centre of the bottom text band (1290–1500)

# ------------------------------------------------------------------ analysis data: faces + jitter
AJ = json.load(open(Q + 'analysis.json'))
T = np.array(AJ['traj']); cum = np.cumsum(T[:, :2], 0) * 2
hf = cum - gaussian_filter1d(cum, 5, axis=0); CORR = np.clip(-hf, -18, 18)           # remove only micro-jitter, keep real pans
fk = sorted(int(k) for k in AJ['faces']); fc = np.full((NF + 8, 3), np.nan)
for k in fk:
    bs = AJ['faces'][str(k)]
    if bs:
        b = max(bs, key=lambda b: b[2] * b[3]); fc[k] = [(b[0] + b[2] / 2) * 2, (b[1] + b[3] / 2) * 2, b[3] * 2]
for j in range(3):
    v = fc[:, j]; idx = np.arange(len(v)); ok = ~np.isnan(v)
    v[:] = np.interp(idx, idx[ok], v[ok]) if ok.any() else [760, 980, 520][j]
FACE = gaussian_filter1d(fc, 9, axis=0)
def face(k):
    k = min(max(0, k), NF - 1); x, y, h = FACE[k]; return x, y, max(260.0, h)

# ------------------------------------------------------------------ words (corrected text, timed from the recording)
WS = json.load(open(Q + 'words1.json'))
LINES = [
 (0.00, 3.26, 'أبي وأخي وسبيلي في كلِّ جهاتي'), (3.26, 7.38, 'يقرُّ الإسلامُ دمي، وبه زادي وشهيقي وزفراتي'), (7.38, 10.66, 'أنا للإسلامِ وبالإسلامِ ومن الإسلامِ كراماتي'),
 (10.66, 15.20, 'يُبنى الإسلامُ إليك الكونُ، يمدُّ السيفَ بهزّاتي'), (15.20, 19.98, 'مَن ذا بالحقِّ سيأخذُه ليعيدَ شموخَ دياناتي'), (19.98, 24.92, 'مَن ذا سيعيدُ لنا بدراً ويصيحُ: بخٍ! لِتُمَيْراتي'),
 (24.92, 29.46, 'فالكفرُ أتى والرفضُ أتى، والكلُّ يحاولُ إسكاتي'), (29.46, 33.24, 'وأنا للهِ بدينِ اللهِ سأرفعُ كلَّ شعاراتي'), (33.24, 37.16, 'مهما كفروا مهما جحدوا نوري وأرادوا إخفاتي'),
 (37.16, 41.46, 'وإذا جمعوا السحرَ وكادوا بي أشتاتاً وزرافاتِ'), (41.46, 45.12, 'فعصا الحقِّ ستبتلعُ الفرعونَ وكلَّ الحيّاتِ'), (45.12, 49.52, 'أنا يا قومُ ابنُ الأنصارِ، ابنُ الأخيارِ الأثباتِ'),
 (49.52, 54.00, 'هذا التاريخُ سلوه، سلوا عنّا إعصارَ الفلواتِ'), (54.00, 58.88, 'وسلوا قيصرَ كيف سحقنا روميّتَهم في لحظاتِ'), (58.88, 63.66, 'ومجوسَ الفرسِ سلوا، وسلوا كسرى عن قعقعةِ رماحاتي'),
 (63.66, 67.90, 'وسلوا الأحجارَ، سلوا الأشجارَ، سلوا الأحياءَ والأمواتَ'), (67.90, 71.86, 'عنّي، عن ديني، عن خُلُقي، عن عدلي، عن كلِّ صفاتي'), (71.86, 77.38, 'عن يومِ الفتحِ، عن عهدِ الصحبِ، وعن سائرِ عصرِ فتوحاتي'),
 (77.38, 81.04, 'عن عُمَرٍ فوقَ المنبرِ يدعو: يا إخواني يا ساداتي'), (81.04, 84.08, 'أبناؤكمُ هم أبنائي، وبناتُكمُ هنَّ بناتي'), (84.08, 87.74, 'تاللهِ لن أشبعَ إلا أن تشبعَ كلُّ إماراتي'),
 (87.74, 92.62, 'يا دهرُ أفِق، حدِّق، أحرِقْ كلَّ خؤونٍ برصاصاتي'), (92.62, 96.60, 'أُسمِعُ كلَّ الكونِ بأنّي ماضٍ في جِدّي وثباتي'), (96.60, 100.66, 'أنصرُ دينَ اللهِ بروحي وبكلِّ مكامنِ ذرّاتي'),
 (100.66, 104.82, 'وأُعظِّمُ أحمدَ أنصرُه، وأهزُّ الكونَ بآياتي'), (104.82, 108.94, 'ونمدُّ إليه مسامعَنا ليرتّلَ آيَ الحُجُراتِ'), (108.94, 112.12, 'ولْنسجدْ للهِ شكوراً، ونسلّمْ بعدَ التحيّاتِ'),
 (112.12, 113.12, 'الله أكبر'), (114.46, 116.50, 'تسلم لسانك يا شاعرنا'), (116.50, 118.40, 'لأنّ آمالنا لا تخيب')]
def word_times(a, b, words):
    ww = [w for w in WS if a - 0.05 <= w[1] < b - 0.02]
    if len(ww) == len(words): return [w[1] for w in ww]
    L = np.cumsum([0] + [len(w) + 1 for w in words]); return list(a + (b - a) * 0.96 * L[:-1] / L[-1])
LW = []
for a, b, s in LINES:
    ws = s.split(); LW.append(dict(a=a, b=b, words=ws, st=word_times(a, b, ws)))

# ------------------------------------------------------------------ grounds, motifs (precomputed)
G_DARK = archive_ground(H, W, seed=301); G_PAR = archive_ground(H, W, seed=302, light=True)
def stone_ground():
    g = grunge(H, W, d, seed=303, base=C('3A3F47'), tone=C('8A8F96')); return vignette(g, 0.45)
G_STONE = stone_ground()
def star_tiles(col, a, step=120):
    m = np.zeros((H, W), np.float32)
    for y0 in range(0, H + step, step):
        for x0 in range((y0 // step % 2) * step // 2, W + step, step): star8(m, x0, y0, step * 0.36, 2)
    return m * a, col
from mg import star8
G_ROYAL = grunge(H, W, d, seed=304, base=C('0A1530'), tone=ROYAL)
_m, _c = star_tiles(BRONZE, 0.16); G_ROYAL = G_ROYAL + (_c - G_ROYAL) * _m[..., None]; G_ROYAL = vignette(G_ROYAL, 0.5)
_m, _c = star_tiles(SILVER_D, 0.07, 160); G_PAR_STAR = G_PAR + (_c - G_PAR) * _m[..., None]
LOGO118 = logo_rgba(118)

# ------------------------------------------------------------------ footage
CAP = None; CAPK = -10
def frame_src(k):
    global CAP, CAPK
    if CAP is None or k != CAPK + 1:
        CAP = cv2.VideoCapture(Q + 'base1080.mp4'); CAP.set(cv2.CAP_PROP_POS_FRAMES, max(0, k))
    ok, f = CAP.read(); CAPK = k
    if not ok: f = np.zeros((H, W, 3), np.uint8)
    f = f.astype(np.float32); kk = min(k, len(CORR) - 1); dx, dy = CORR[kk]
    M = np.float32([[1.05, 0, -0.05 * 540 + dx], [0, 1.05, -0.05 * 960 + dy]])
    return cv2.warpAffine(f, M, (W, H), borderMode=cv2.BORDER_REFLECT)
def tone(f, mode):
    """grades: natural / duo / archive / peak / warm"""
    x = f / 255.0
    L = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    lift = np.power(np.clip(x, 0, 1), 0.82)                                            # open the dark interior
    knee = 0.72; hi = np.where(lift > knee, knee + (lift - knee) * 0.42, lift)          # tame blown windows
    x = hi
    nav = DEEP / 255; par = PARCH / 255; roy = ROYAL / 255; bro = BRONZE_L / 255
    if mode == 'natural':
        x = x * (1 - 0.14 * (1 - L)) + nav * 0.14 * (1 - L) + (par - x) * 0.06 * L
    elif mode == 'duo':
        g = np.clip((L - 0.05) / 0.8, 0, 1); duo = nav + (roy - nav) * np.clip(g * 1.8, 0, 1) + (par - roy) * np.clip(g * 1.8 - 1, 0, 1)
        x = x * 0.42 + duo * 0.58
    elif mode == 'archive':
        g = np.clip(L * 1.1, 0, 1); sep = (C('3A2A1C') / 255) + (par - C('3A2A1C') / 255) * g
        x = x * 0.55 + sep * 0.45
    elif mode == 'peak':
        g = np.clip((L - 0.04) * 1.35, 0, 1); x = x * 0.5 + (nav + (par - nav) * g) * 0.5
        x = np.clip((x - 0.5) * 1.18 + 0.5, 0, 1); x = x * (1 - 0.2 * (1 - L)) + roy * 0.2 * (1 - L) + (bro - x) * 0.05 * L
    elif mode == 'warm':
        x = x * 0.82 + (par * (0.55 + 0.45 * L)) * 0.18; x = np.clip(x * 1.04, 0, 1)
    return np.clip(x * 255, 0, 255)
def place_footage(c, F, k, x0, y0, w, h, mask=None, fit=0.62, border=None, rot=0.0):
    """put a face-centred crop of the footage into the rect (x0,y0,w,h); fit = face height / window height"""
    fx, fy, fh = face(k); s = np.clip((h * fit) / fh, 0.55, 1.25)
    s = max(s, w / W, h / H)
    sx0 = np.clip(fx - w / 2 / s, 0, W - w / s); sy0 = np.clip(fy - h * 0.46 / s, 0, H - h / s)
    M = np.float32([[s, 0, -s * sx0], [0, s, -s * sy0]]); crop = cv2.warpAffine(F, M, (int(w), int(h)), borderMode=cv2.BORDER_REFLECT)
    m = np.ones((int(h), int(w)), np.float32) if mask is None else mask
    if border is not None:
        e = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=border[1]) - m
        c = paste(c, np.dstack([np.zeros_like(crop), cv2.GaussianBlur(m, (0, 0), 18) * 0.6]), x0 + w / 2 + 8, y0 + h / 2 + 18, 1, 1, rot)
        c = paste(c, np.dstack([np.broadcast_to(border[0], crop.shape).astype(np.float32), np.clip(m + e, 0, 1)]), x0 + w / 2, y0 + h / 2, 1, 1, rot)
    return paste(c, np.dstack([crop, m]), x0 + w / 2, y0 + h / 2, 1, 1, rot)

# ------------------------------------------------------------------ text helpers
_TX = {}
def word_img(w, fk, size, col):
    if fk == 'naskh': w = w.strip('،:!؟.')
    key = (w, fk, size, tuple(col))
    if key not in _TX: _TX[key] = rtl_line([(w, col)], fk, size)
    return _TX[key]
def layout(words, fk, size, cx, cy, maxw, lh=1.45, cols=None):
    """wrap words RTL into centred lines; the block is centred on (cx, cy). returns [(img, x, y, i)]"""
    f = font(fk, size); sp = size * 0.30; wl = [f.getlength(w, direction='rtl', language='ar') for w in words]
    lines = [[]]; cur = 0
    for i, w_ in enumerate(wl):
        if lines[-1] and cur + sp + w_ > maxw: lines.append([]); cur = 0
        lines[-1].append(i); cur += w_ + (sp if cur else 0)
    n = len(lines)
    if n in (2, 3):                                                                     # balance the lines: no orphan word
        N = len(wl); width = lambda a, b: sum(wl[a:b]) + sp * (b - a - 1)
        best = None
        if n == 2:
            for k in range(1, N):
                m = max(width(0, k), width(k, N))
                if width(0, k) <= maxw and width(k, N) <= maxw and (best is None or m < best[0]): best = (m, [list(range(0, k)), list(range(k, N))])
        else:
            for k1 in range(1, N - 1):
                for k2 in range(k1 + 1, N):
                    ws_ = [width(0, k1), width(k1, k2), width(k2, N)]
                    if max(ws_) <= maxw and (best is None or max(ws_) < best[0]): best = (max(ws_), [list(range(0, k1)), list(range(k1, k2)), list(range(k2, N))])
        if best: lines = best[1]
    step = size * lh; y0 = cy - (n - 1) * step / 2; out = []
    for r, ln in enumerate(lines):
        tot = sum(wl[i] for i in ln) + sp * (len(ln) - 1); x = cx + tot / 2
        for i in ln:
            col = cols[i] if cols else PARCH; out.append((word_img(words[i], fk, size, col), x - wl[i] / 2, y0 + r * step, i)); x -= wl[i] + sp
    return out
def draw_words(c, items, starts, t, t_out, style='rise', key=(), shake=0.0, alpha=1.0):
    po = ease(seg(t, t_out, t_out + 0.25))
    for img, x, y, i in items:
        if t < starts[i] - 0.02: continue
        q = t - starts[i]; a = min(1, q / 0.10) * (1 - po) * alpha
        if a <= 0.01: continue
        s = 1.0; dy = 0.0
        if style == 'rise': dy = 18 * (1 - ease(q / 0.22))
        elif style == 'slam' or i in key: s = 1.0 + 0.45 * (1 - ease(q / 0.16))
        elif style == 'type': dy = 6 * (1 - ease(q / 0.1))
        jx = shake * np.sin(q * 80) * np.exp(-q / 0.12) if (style == 'slam' or i in key) and shake else 0
        c = mg.put(c, img, x + jx, y + dy, s, a)
    return c
def dark_band(c, y0, y1, k=0.55, soft=120):
    m = np.clip(np.minimum((yy - y0) / soft, (y1 - yy) / soft) + 0.5, 0, 1)[..., None]; return c * (1 - k * m)
def colors_for(words, keymap, default=None):
    dflt = PARCH if default is None else default
    return [keymap.get(w.strip('،:!.؟'), keymap.get(w, dflt)) for w in words]
def line(i): return LW[i]

# ------------------------------------------------------------------ scene renderers
def s1_identity(t, k, F):
    c = tone(F, 'natural'); c = vignette(c, 0.35)
    if t < 0.7:                                                                         # iris open from a bronze ring (voice already speaking)
        p = ease(t / 0.7); r = 120 + p * 1250; m = np.clip((r - np.hypot(xx - CX, yy - 960)) / 3, 0, 1)[..., None]
        c = G_DARK * (1 - m) + c * m; c = ring(c, CX, 960, r, BRONZE_L, 1.0, 5)
    fx, fy, fh = face(k)
    # «في كل جهاتي»: the 8 directions of the logo draw outward, kept off the face
    p = ease(seg(t, 1.6, 3.4)) * (1 - ease(seg(t, 4.2, 5.2)))
    if p > 0:
        m = np.zeros((H, W), np.float32)
        for j in range(8):
            an = np.deg2rad(45 * j); r0 = 120; r1 = 120 + 1100 * p
            cv2.line(m, (int((CX + np.sin(an) * r0) * 8), int((960 - np.cos(an) * r0) * 8)), (int((CX + np.sin(an) * r1) * 8), int((960 - np.cos(an) * r1) * 8)), 1.0, 2, cv2.LINE_AA, shift=3)
        fm = np.clip((np.hypot((xx - fx) / (fh * 0.62), (yy - fy) / (fh * 0.75)) - 1) * 3, 0, 1)
        c = c + (BRONZE_L - c) * (m * fm * 0.55)[..., None]
    c = dark_band(c, 250, 600, 0.55)
    km = {'الإسلامُ': BRONZE_L, 'الإسلامِ': BRONZE_L, 'وبالإسلامِ': BRONZE_L, 'للإسلامِ': BRONZE_L, 'كراماتي': BRONZE_L, 'السيفَ': BRONZE_L, 'بالحقِّ': BRONZE_L, 'بدراً': BRONZE_L, 'بخٍ': SEAL_L}
    for i in range(6):
        L = line(i)
        if L['a'] - 0.1 <= t < L['b'] + 0.25:
            fx_, fy_, fh_ = face(k); cap_top = fy_ - fh_ * 0.85                         # head incl. cap, from the face box
            cy_ = min(430, cap_top - 150)                                               # keep the whole block above the head
            cy_ = max(cy_, 360)
            items = layout(L['words'], 'naskh', 80 if i else 88, CX, cy_, 680, 1.4, colors_for(L['words'], km))
            c = draw_words(c, items, L['st'], t, L['b'] - 0.05, 'rise')
    return c
def s2_confront(t, k, F):
    p_in = ease(seg(t, 24.62, 25.3)); p_out = ease(seg(t, 44.9, 45.4))
    c = G_DARK.copy()
    # footage window (900 x 1080) under the text band; morphs from full frame at entry
    tx0, ty0, tw, th = 90, 660, 900, 1080
    x0 = tx0 * p_in; y0 = ty0 * p_in; w = W + (tw - W) * p_in; h = H + (th - H) * p_in
    Fg = tone(F, 'duo'); dim = 1.0
    if 36.3 <= t < 37.4: dim = 1 - 0.45 * bump(t, 36.3, 37.4)                         # «وأرادوا إخفاتي»
    c = place_footage(c, Fg * dim, k, x0, y0, w, h, mask=round_mask(int(w), int(h), int(18 * p_in) + 1), fit=0.01, border=(BRONZE * 0.9, 2))
    if p_in > 0.95:
        for x_ in (tx0, tx0 + tw):
            c = hair(c, x_, ty0 + 30, x_, ty0 + th - 30, SILVER, 0.25, 1)
    # staff of Moses: a bronze line descends through the window at 41.5
    if 41.46 <= t < 45.2:
        q = ease(seg(t, 41.46, 42.3)); c = hair(c, CX, ty0 - 40, CX, ty0 - 40 + (th + 80) * q, BRONZE_L, 1.0 - ease(seg(t, 44.8, 45.2)), 6)
        c = c + (BRONZE_L - c) * (np.exp(-((xx - CX) / 18) ** 2) * ((yy > ty0 - 40) & (yy < ty0 - 40 + (th + 80) * q)) * 0.25)[..., None]
    km = {'فالكفرُ': SEAL_L, 'والرفضُ': SEAL_L, 'إسكاتي': BRONZE_L, 'شعاراتي': BRONZE_L, 'نوري': BRONZE_L, 'إخفاتي': SILVER, 'أشتاتاً': BRONZE_L, 'فعصا': BRONZE_L, 'الحقِّ': BRONZE_L, 'الحيّاتِ': SEAL_L}
    for i in range(6, 11):
        L = line(i)
        if not (L['a'] - 0.1 <= t < L['b'] + 0.25): continue
        items = layout(L['words'], 'naskh', 86, CX, 500, 680, 1.45, colors_for(L['words'], km))
        if i == 6:
            for img, x, y, j in items:
                if t < L['st'][j] - 0.02: continue
                q = t - L['st'][j]; a = min(1, q / 0.08) * (1 - ease(seg(t, L['b'] - 0.05, L['b'] + 0.2)))
                if L['words'][j] == 'إسكاتي':
                    sq = bump(t, L['st'][j] + 0.1, L['st'][j] + 0.7); c = mg.put(c, img, x, y + 30 * sq, 1.0, a * (1 - 0.5 * sq), sy=1 - 0.75 * sq, sx=1 + 0.15 * sq)
                else:
                    s_ = 1 + 0.45 * (1 - ease(q / 0.16)); jx = 10 * np.sin(q * 80) * np.exp(-q / 0.12); c = mg.put(c, img, x + jx, y, s_, a)
        elif i == 7:
            c = draw_words(c, items, L['st'], t, L['b'] - 0.05, 'rise')
        elif i == 8:
            c = draw_words(c, items, L['st'], t, L['b'] - 0.05, 'rise')
            if 34.96 <= t < 37.2:                                                       # «نوري» glows, then dims on «إخفاتي»
                for img, x, y, j in items:
                    if L['words'][j] == 'نوري':
                        g = bump(t, 34.96, 37.0) * (1 - 0.8 * seg(t, 36.4, 37.0))
                        c = c + (BRONZE_L - c) * (np.exp(-(((xx - x) / 150) ** 2 + ((yy - y) / 90) ** 2)) * 0.5 * g)[..., None]
        elif i == 9:
            for img, x, y, j in items:
                if t < L['st'][j] - 0.02: continue
                q = t - L['st'][j]; a = min(1, q / 0.1) * (1 - ease(seg(t, L['b'] - 0.05, L['b'] + 0.2)))
                if L['words'][j] == 'أشتاتاً':                                           # scattered, then gathered
                    sc = 1 - ease(seg(t, L['st'][j] + 0.25, L['st'][j] + 0.9)); hh_, ww_ = img.shape[:2]
                    for pc in range(5):
                        xs0 = pc * ww_ // 5; xs1 = (pc + 1) * ww_ // 5; piece = np.zeros_like(img); piece[:, xs0:xs1] = img[:, xs0:xs1]
                        ang = pc * 1.3 + 0.4; c = mg.put(c, piece, x + np.cos(ang) * 70 * sc, y + np.sin(ang) * 50 * sc, 1.0, a)
                else: c = mg.put(c, img, x, y + 18 * (1 - ease(q / 0.22)), 1.0, a)
        elif i == 10:
            for img, x, y, j in items:
                if t < L['st'][j] - 0.02: continue
                q = t - L['st'][j]; a = min(1, q / 0.1) * (1 - ease(seg(t, L['b'] - 0.05, L['b'] + 0.2)))
                if L['words'][j] == 'الحيّاتِ':                                          # swallowed by the staff
                    sw = ease(seg(t, 44.35, 45.0)); c = mg.put(c, img, x + (CX - x) * sw, y + 40 * sw, 1.0 - 0.85 * sw, a * (1 - sw), sx=1 - 0.7 * sw)
                else: c = mg.put(c, img, x, y + 18 * (1 - ease(q / 0.22)), 1.0, a)
        if i == 6 and t >= 28.76:                                                       # «إسكاتي»: squashed silent, then springs back
            pass
    if p_out > 0: c = c * (1 - p_out) + G_PAR * p_out
    return c
# ---- historical motifs
def columns(c, col, a):
    for x in (95, 985):
        for dx in (-30, -10, 10, 30): c = hair(c, x + dx, 420, x + dx, 1160, col, a, 2)
        c = hair(c, x - 48, 410, x + 48, 410, col, a, 3); c = hair(c, x - 58, 395, x + 58, 395, col, a, 2)
        c = hair(c, x - 48, 1170, x + 48, 1170, col, a, 3); c = hair(c, x - 58, 1185, x + 58, 1185, col, a, 2)
    return c
def iwan(c, col, a, x0=130, y0=290, w=820, h=860):
    am = mg.arch_mask(w, h, top=0.34); e = cv2.dilate(am, np.ones((5, 5), np.uint8)) - am
    big = np.zeros((H, W), np.float32); big[y0:y0 + h, x0:x0 + w] = e; return c + (col - c) * (big * a)[..., None]
def minbar(c, col, a, x0=540, y0=1250):
    m = np.zeros((H, W), np.float32); S8 = 8
    pts = [(x0 - 150, y0), (x0 - 150, y0 - 60), (x0 - 90, y0 - 60), (x0 - 90, y0 - 120), (x0 - 30, y0 - 120), (x0 - 30, y0 - 180), (x0 + 60, y0 - 180), (x0 + 60, y0 - 260), (x0 + 150, y0 - 260), (x0 + 150, y0)]
    cv2.polylines(m, [(np.array(pts, np.float32) * S8).astype(np.int32)], False, 1.0, 3, cv2.LINE_AA, shift=3)
    cv2.ellipse(m, (int((x0 + 105) * S8), int((y0 - 260) * S8)), (int(48 * S8), int(60 * S8)), 0, 180, 360, 1.0, 3, cv2.LINE_AA, shift=3)
    return c + (col - c) * (m * a)[..., None]
def print_frame(c, F, k, mode, x0=110, y0=330, w=860, h=720, rot=0.0):
    return place_footage(c, np.clip(tone(F, mode) * 1.12 + 8, 0, 255), k, x0, y0, w, h, fit=0.01, border=(PARCH, 9), rot=rot)
def manuscript(c, L, t, ink, key, cy=1335, size=58, maxw=880):
    items = layout(L['words'], 'amiri', size, CX, cy, maxw, 1.55, colors_for(L['words'], key, ink))
    return draw_words(c, items, L['st'], t, L['b'] - 0.05, 'type')
def title(c, img, t, t0, t1, cy=1150, style='rise'):
    if not (t0 <= t < t1 + 0.3): return c
    q = t - t0; a = min(1, q / 0.18) * (1 - ease(seg(t, t1, t1 + 0.3)))
    s = 1.0 + (0.35 * (1 - ease(q / 0.2)) if style == 'slam' else 0)
    return mg.put(c, img, CX, cy + (14 * (1 - ease(q / 0.3)) if style == 'rise' else 0), s, a)
def engraved(word, size, base, fk='naskh'):
    a = text([(word, np.full(3, 255.0))], fk, size)[..., 3]; sh_ = bevel(a, depth=4, k=0.8)
    img = np.broadcast_to(base, a.shape + (3,)).astype(np.float32) + sh_[..., None] * 70; return np.dstack([np.clip(img, 0, 255), a])
TIT = {}
def s3_history(t, k, F):
    p_in = ease(seg(t, 45.12, 45.6)); inkK = {'الأنصارِ': BRONZE_D, 'الأخيارِ': BRONZE_D, 'الأثباتِ': BRONZE_D, 'إعصارَ': BRONZE_D, 'الفلواتِ': BRONZE_D}
    if t < 54.0:                                                                        # a) Ansar — parchment archive, wind of the deserts
        c = G_PAR.copy(); c = print_frame(c, F, k, 'archive', rot=-1.2)
        if t >= 52.04:
            r = np.random.default_rng(7); n = 220; px = (r.random(n) * 1400 - 160 + (t - 52.0) * 900 * (0.5 + r.random(n))) % 1400 - 160; py = 1080 + r.random(n) * 420
            m = np.zeros((H, W), np.float32)
            for a_, b_ in zip(px, py): cv2.line(m, (int(a_ * 4), int(b_ * 4)), (int((a_ - 26) * 4), int(b_ * 4)), 1.0, 1, cv2.LINE_AA, shift=2)
            c = c + (BRONZE_D - c) * (cv2.GaussianBlur(m, (0, 0), 1) * 0.5 * (1 - seg(t, 53.6, 54.0)))[..., None]
        if 'ansar' not in TIT: TIT['ansar'] = text([('ابنُ', INK), ('الأنصارِ', BRONZE_D)], 'naskh', 120)
        c = title(c, TIT['ansar'], t, 47.0, 51.9)
        if 'iasar' not in TIT: TIT['iasar'] = text([('إعصارَ', BRONZE_D), ('الفلواتِ', INK)], 'naskh', 120)
        c = title(c, TIT['iasar'], t, 52.04, 53.9)
        for i in (11, 12):
            L = line(i)
            if L['a'] - 0.1 <= t < L['b'] + 0.25: c = manuscript(c, L, t, INK, inkK)
        if p_in < 1: c = c * p_in + G_DARK * (1 - p_in)
        return c
    if t < 58.88:                                                                       # b) Caesar — stone, columns, engraved name
        c = G_STONE.copy(); c = columns(c, PARCH_D, 0.6); c = print_frame(c, F, k, 'natural', x0=190, w=700)
        if 'qaysar' not in TIT: TIT['qaysar'] = engraved('قيصرَ', 150, C('C9C2B4'))
        c = title(c, TIT['qaysar'], t, 54.6, 58.7, style='slam')
        c = manuscript(c, line(13), t, PARCH, {'قيصرَ': BRONZE_L, 'روميّتَهم': BRONZE_L})
        return c
    if t < 63.66:                                                                       # c) Kisra — royal blue, star tiles, iwan arch
        c = G_ROYAL.copy(); c = iwan(c, BRONZE_L, 0.9, 130, 290, 820, 860)
        am = mg.arch_mask(760, 800, top=0.34); c = place_footage(c, tone(F, 'duo'), k, 160, 320, 760, 800, mask=am, fit=0.55)
        if 'kisra' not in TIT: TIT['kisra'] = metal_text('كسرى', 'naskh', 150, METAL)
        c = title(c, TIT['kisra'], t, 61.0, 63.5, cy=1215, style='slam')
        c = manuscript(c, line(14), t, PARCH, {'كسرى': BRONZE_L, 'الفرسِ': BRONZE_L, 'رماحاتي': BRONZE_L}, cy=1395, size=54)
        return c
    if t < 71.86:                                                                       # d) «سلوا…» then four seals: ديني خُلُقي عدلي صفاتي
        c = G_PAR.copy(); c = print_frame(c, F, k, 'archive', y0=300, h=640, rot=0.8)
        if t < 67.9: c = manuscript(c, line(15), t, INK, {'الأحجارَ': BRONZE_D, 'الأشجارَ': BRONZE_D, 'الأحياءَ': BRONZE_D, 'والأمواتَ': BRONZE_D}, cy=1150, size=60)
        else:
            L = line(16); words = ['ديني', 'خُلُقي', 'عدلي', 'صفاتي']; idx = [L['words'].index(w_) if w_ in L['words'] else None for w_ in ('ديني،', 'خُلُقي،', 'عدلي،', 'صفاتي')]
            cols4 = [CX + 330, CX + 110, CX - 110, CX - 330]
            for j, (w_, ii) in enumerate(zip(words, idx)):
                t0 = L['st'][ii] if ii is not None else 68 + j
                if t < t0: continue
                q = t - t0; s = 1 + 0.5 * (1 - ease(q / 0.15)); a = min(1, q / 0.08)
                c = mg.put(c, seal_stamp(200, SEAL), cols4[j], 1150, s, a * 0.9, rot=-8 + 5 * j)
                c = mg.put(c, word_img(w_, 'naskh', 64, INK), cols4[j], 1150, s, a)
            c = manuscript(c, L, t, INK, {'ديني،': BRONZE_D, 'خُلُقي،': BRONZE_D, 'عدلي،': BRONZE_D, 'صفاتي': BRONZE_D}, cy=1390, size=54)
        return c
    if t < 77.38:                                                                       # e) conquests — expanding astrolabe rings
        c = G_DARK.copy()
        for j in range(5):
            rr = 200 + ((t - 71.86) * 120 + j * 160) % 800; c = ring(c, CX, 690, rr, BRONZE_L if j % 2 else SILVER, 0.35 * (1 - rr / 1000), 2, ticks=60 if j == 0 else 0, tick_len=8)
        c = place_footage(c, tone(F, 'natural'), k, CX - 330, 690 - 330, 660, 660, mask=round_mask(660, 660, 330), fit=0.6, border=(BRONZE_L, 3))
        if 'fut' not in TIT: TIT['fut'] = metal_text('فتوحاتي', 'naskh', 140, METAL)
        c = title(c, TIT['fut'], t, 76.3, 77.3, cy=1190, style='slam')
        c = manuscript(c, line(17), t, PARCH, {'الفتحِ': BRONZE_L, 'الصحبِ': BRONZE_L, 'فتوحاتي': BRONZE_L}, cy=1385, size=56)
        return c
    # f/g) Umar on the pulpit — an empty minbar in a shaft of light, then «تالله…»
    c = G_PAR.copy()
    beam = np.clip(1 - np.abs((xx - CX) - (yy - 1250) * -0.25) / 260, 0, 1) * np.clip((1250 - yy) / 900, 0, 1)
    c = c + (C('FFF6E0') - c) * (beam * 0.35)[..., None]
    c = print_frame(c, F, k, 'archive', y0=290, h=600)
    c = minbar(c, BRONZE_D, ease(seg(t, 77.38, 78.2)), 540, 1170)
    for i in (18, 19, 20):
        L = line(i)
        if L['a'] - 0.1 <= t < L['b'] + 0.25: c = manuscript(c, L, t, INK, {'عُمَرٍ': BRONZE_D, 'المنبرِ': BRONZE_D, 'أبنائي،': BRONZE_D, 'بناتي': BRONZE_D, 'تاللهِ': BRONZE_D}, cy=1365, size=56)
    p = ease(seg(t, 87.2, 87.74))
    if p > 0: c = c * (1 - p) + tone(F, 'peak') * p
    return c
EMB = None
def s4_peak(t, k, F):
    z = 1.0 + 0.10 * ease(seg(t, 87.74, 92.6)) - 0.04 * ease(seg(t, 92.6, 96.6))
    for hit in (88.22, 89.5, 89.86, 90.34, 91.62): z += 0.012 * np.exp(-max(0, t - hit) / 0.12) * (t >= hit)
    fx, fy, fh = face(k)
    Fz = cv2.warpAffine(F, cv2.getRotationMatrix2D((fx, fy), 0, z), (W, H), borderMode=cv2.BORDER_REFLECT)
    c = tone(Fz, 'peak'); c = vignette(c, 0.55)
    c = dark_band(c, 230, 760, 0.62); c = dark_band(c, 1200, 1560, 0.62)
    L = line(21); st = L['st']; wd = L['words']      # يا دهرُ أفِق، حدِّق، أحرِقْ كلَّ خؤونٍ برصاصاتي
    if t < 92.9:
        top1 = layout(wd[0:2], 'naskh', 210, CX, 400, 960, 1.0, [PARCH, PARCH]); top2 = layout(wd[2:4], 'naskh', 130, CX, 610, 960, 1.0, [BRONZE_L, BRONZE_L])
        c = draw_words(c, [(im, x, y, j) for im, x, y, j in top1], st[0:2], t, 92.62, 'slam', shake=14)
        c = draw_words(c, [(im, x, y, j) for im, x, y, j in top2], st[2:4], t, 92.62, 'slam', shake=10)
        if t >= st[4]:                                                                   # «أحرِقْ» ignites — one centred row with «كلَّ خؤونٍ»
            EMBER = C('E8743B'); row = layout(wd[4:7], 'naskh', 120, CX, 1290, 960, 1.0, [EMBER, PARCH, PARCH])
            img, x, y, _ = row[0]; heat = bump(t, st[4], 92.6); q = t - st[4]
            c = c + (EMBER - c) * (np.exp(-(((xx - x) / 240) ** 2 + ((yy - y) / 110) ** 2)) * 0.35 * heat)[..., None]
            rng = np.random.default_rng(int(t * 30)); m = np.zeros((H // 2, W // 2), np.float32)
            for e_ in range(26):
                ex = (x + rng.normal(0, 130)) / 2; ey = (y - 20 - ((t - st[4]) * 160 + e_ * 13) % 260) / 2
                cv2.circle(m, (int(ex * 4), int(ey * 4)), 6, 1.0, -1, cv2.LINE_AA, shift=2)
            m = cv2.resize(cv2.GaussianBlur(m, (0, 0), 1.5), (W, H)); c = c + (C('F2A65A') - c) * (m * 0.8 * heat)[..., None]
            c = draw_words(c, row, st[4:7] + [0], t, 92.62, 'slam', shake=8)
        if t >= st[7]:                                                                   # «برصاصاتي»: letters arrive as streaks
            q = t - st[7]; img = word_img(wd[7], 'naskh', 130, BRONZE_L); x, y = CX, 1425; p = ease(q / 0.22)
            for tr in range(4):
                yl = y - 40 + tr * 26; xl = W + 60 - (W + 200) * ease(seg(q, tr * 0.03, 0.25 + tr * 0.03))
                c = hair(c, xl, yl, min(W + 60, xl + 260), yl, PARCH, 0.8 * (1 - seg(q, 0.25, 0.6)), 3)
            bl = cv2.blur(img, (max(1, int(60 * (1 - p))) * 2 + 1, 1)); c = mg.put(c, bl, x + 260 * (1 - p), y, 1.0, min(1, q / 0.05) * (1 - ease(seg(t, 92.62, 92.9))))
    if t >= 92.5:                                                                        # «أُسمِعُ كلَّ الكونِ…»: rings of sound, then «وثباتي» sealed
        L2 = line(22); for_r = seg(t, 92.62, 94.6)
        for j in range(4):
            rr = 80 + ((for_r * 2.2 + j / 4) % 1.0) * 1100; c = ring(c, CX, 960, rr, BRONZE_L, 0.45 * (1 - rr / 1200) * (1 - seg(t, 95.8, 96.6)), 3)
        top = layout(L2['words'][0:3], 'naskh', 118, CX, 450, 940, 1.0, [PARCH, PARCH, BRONZE_L]); c = draw_words(c, top, L2['st'][0:3], t, 96.5, 'rise')
        bot = layout(L2['words'][3:7], 'naskh', 92, CX, 1300, 940, 1.0, [PARCH] * 4); c = draw_words(c, bot, L2['st'][3:7], t, 96.5, 'rise')
        if t >= L2['st'][7]:
            q = t - L2['st'][7]; s = 1 + 0.5 * (1 - ease(q / 0.16)); a = min(1, q / 0.06) * (1 - ease(seg(t, 96.45, 96.75)))
            c = mg.put(c, seal_stamp(230, BRONZE_L), CX, 1440, s, a); c = mg.put(c, word_img(L2['words'][7], 'naskh', 104, BRONZE_L), CX, 1440, s, a)
    return c
def s5_devotion(t, k, F):
    p_in = ease(seg(t, 96.6, 97.3)); c = G_PAR_STAR.copy()
    beam = np.clip(1 - np.abs(xx - CX) / 420, 0, 1) * np.clip((1300 - yy) / 1100, 0, 1); c = c + (C('FFF6E0') - c) * (beam * 0.3)[..., None]
    bow = 26 * ease(seg(t, 108.94, 110.6))
    am = mg.arch_mask(820, 960, top=0.30)
    dim = 1 - 0.18 * ease(seg(t, 108.94, 110.6))
    c = place_footage(c, tone(F, 'warm') * dim, k, 130, 300 + bow, 820, 960, mask=am, fit=0.5, border=(BRONZE_D, 3))
    if t < 100.8:                                                                        # «ذرّاتي»: motes gather toward the line
        g = ease(seg(t, 98.5, 100.6)); r = np.random.default_rng(3); n = 90
        px = r.random(n) * 1080; py = 1000 + r.random(n) * 500; tx_ = CX + (r.random(n) - 0.5) * 700; ty_ = 1360 + (r.random(n) - 0.5) * 80
        m = np.zeros((H, W), np.float32)
        for a_, b_, c_, d_ in zip(px, py, tx_, ty_): cv2.circle(m, (int((a_ + (c_ - a_) * g) * 4), int((b_ + (d_ - b_) * g) * 4)), 7, 1.0, -1, cv2.LINE_AA, shift=2)
        c = c + (BRONZE_L - c) * (cv2.GaussianBlur(m, (0, 0), 1.6) * 0.8 * (1 - seg(t, 100.4, 100.8)))[..., None]
    km = {'دينَ': BRONZE_D, 'اللهِ': BRONZE_D, 'ذرّاتي': BRONZE_D, 'أحمدَ': BRONZE_D, 'بآياتي': BRONZE_D, 'آيَ': BRONZE_D, 'الحُجُراتِ': BRONZE_D, 'للهِ': BRONZE_D, 'شكوراً،': BRONZE_D}
    for i in (23, 24, 25, 26):
        L = line(i)
        if L['a'] - 0.1 <= t < L['b'] + 0.25:
            items = layout(L['words'], 'amiri', 62, CX, 1380 + bow * 0.4, 880, 1.55, colors_for(L['words'], km, INK))
            c = draw_words(c, items, L['st'], t, L['b'] - 0.05, 'rise')
    if p_in < 1: c = c * p_in + tone(F, 'peak') * (1 - p_in)
    return c
def s6_end(t, k, F):
    c = tone(F, 'natural'); c = vignette(c, 0.4); p = ease(seg(t, 112.12, 112.8))
    c = c * p + (G_PAR_STAR * 0.9) * (1 - p) if p < 1 else c
    for i in (27, 28, 29):
        L = line(i)
        if L['a'] - 0.1 <= t < L['b'] + 0.3:
            items = layout(L['words'], 'almarai', 56, CX, BOT_C, 860, 1.4, [SILVER] * len(L['words']))
            P = plate(int(sum(im.shape[1] for im, *_ in items) + 40 * len(items) + 40), 100, 30, INK, 0.78, edge=BRONZE * 0.9)
            a = ease(seg(t, L['a'] - 0.1, L['a'] + 0.1)) * (1 - ease(seg(t, L['b'], L['b'] + 0.3)))
            c = mg.put(c, P, CX, BOT_C, 1.0, a); c = draw_words(c, items, L['st'], t, L['b'], 'rise')
    fo = ease(seg(t, 117.9, DUR)); c = c * (1 - fo) + G_DARK * fo
    return c

def frame(k):
    t = k / FPS; F = frame_src(k)
    if t < 24.92: c = s1_identity(t, k, F)
    elif t < 45.12: c = s2_confront(t, k, F)
    elif t < 87.74: c = s3_history(t, k, F)
    elif t < 96.60: c = s4_peak(t, k, F)
    elif t < 112.12: c = s5_devotion(t, k, F)
    else: c = s6_end(t, k, F)
    c = mg.put(c, LOGO118, 118, 348)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 2.4
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    mode = A[1]
    if mode == 'still':
        for ts in A[2:]:
            k = int(float(ts) * FPS); CAP = None; cv2.imwrite(Q + f'st/s_{float(ts):06.2f}.jpg', frame(k))
    elif mode == 'range':
        a, b, out = int(A[2]), int(A[3]), A[4]
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done range', a, b)
    elif mode == 'render':
        part, n = int(A[2]), int(A[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', Q + f'parts/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part, a, b)
