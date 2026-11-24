# «السنة / الحوثي يسب الصحابة» v3 — split screen: one side plays while the other pauses (eclipsed); kinetic words per side; harsh red for insults; fierce finale.
import sys, os, subprocess, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_argv = sys.argv; sys.argv = ['x', 'none']
import v12 as P                                       # Houthi clips, crops, stills (P.D = dark tools + light world, P.D.L = light reel)
sys.argv = _argv
from mg import *
import sfx, soundfile as sf
D = P.D; L = D.L
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
WK = S_ + 'v13/work/'; OUTD = '/home/user/final/reels-light/'
os.makedirs(WK, exist_ok=True)
BLACK, IVORY, ASH = D.BLACK, D.IVORY, D.ASH; RED = C('E0352B'); DRED = C('7A0F0B'); GOLD = L.GOLD; LG = L.LIGHTGOLD
# ---------------------------------------------------------------- timeline: alternate turns
BAD = [(0.0, 10.3), (10.3, 19.08), (19.08, 31.07), (31.07, 42.8), (42.8, 50.46), (50.46, 58.63), (58.63, 75.4), (75.4, 94.97)]
GOOD = [(0.0, 1.92), (1.92, 9.42), (9.42, 12.06), (12.06, 14.22), (14.22, 16.76), (16.76, 20.62), (20.62, 22.9)]
INTRO = 2.4
TL = []; t = INTRO
for i in range(len(BAD)):
    a, b = BAD[i]; TL.append(('bad', t, t + (b - a), a)); t += b - a
    if i < len(GOOD): a, b = GOOD[i]; TL.append(('good', t, t + (b - a), a)); t += b - a
T_END = t; FIN = (T_END, T_END + 5.2); OUT_T = FIN[1]; DUR = OUT_T + 2.7
def turn_at(t):
    for k in TL:
        if k[1] <= t < k[2]: return k
    return None
def last_src(side, t):
    """source time the paused side is frozen at"""
    s = None
    for k in TL:
        if k[0] == side and k[2] <= t: s = k[3] + (k[2] - k[1]) - 0.04
    return s if s is not None else (0.0 if side == 'bad' else 0.5)
def layout(t):
    """a = 1 good active, 0 bad active (smooth at each switch)"""
    a = None
    for k in TL:
        if k[1] <= t:
            a0 = 1.0 if k[0] == 'good' else 0.0; p = eio(seg(t, k[1], k[1] + 0.38)); prev = 1 - a0
            a = prev + (a0 - prev) * p
    return 0.0 if a is None else a
# ---------------------------------------------------------------- footage
GFY = {0.0: 0.35, 1.92: 0.36, 7.30: 0.55, 9.42: 0.66, 12.06: 0.36, 14.22: 0.66, 16.76: 0.66, 19.76: 0.5, 20.62: 0.36}
def good_img(n, w, h, zoom=1.0):
    f, a = L.footage(min(n, 22.85)); fh, fw = f.shape[:2]; sc = max(w / fw, h / fh) * zoom; cw, ch = w / sc, h / sc
    fy = GFY.get(a, 0.5); y0 = np.clip(fy * fh - ch / 2, 0, fh - ch)
    M = np.float32([[sc, 0, -((fw - cw) / 2) * sc], [0, sc, -y0 * sc]]); return cv2.warpAffine(f, M, (w, h), flags=cv2.INTER_LINEAR)
def bad_key(s):
    for a, b, k in P.CLIPS:
        if a <= s < b: return k
    return P.CLIPS[-1][2]
def bad_img(s, w, h, zoom=1.0):
    k = bad_key(s)
    if k is None: return np.zeros((h, w, 3), np.float32) + 12
    return P.grab(s, k, w, h, zoom)
_CACHE = {}
def paused(side, s, w, h):
    key = (side, round(s, 2), w, h)
    if key not in _CACHE:
        if len(_CACHE) > 6: _CACHE.clear()
        im = good_img(s, w, h) if side == 'good' else bad_img(s, w, h)
        g = im.mean(2, keepdims=True); im = (im * 0.2 + g * 0.8) * 0.42                     # eclipsed: grey, dim
        _CACHE[key] = im
    return _CACHE[key]
def eclipse_fx(img, t):
    """a dark disc slowly crossing the paused picture + pause bars"""
    h, w = img.shape[:2]; cx = w * (0.25 + 0.5 * ((t * 0.12) % 1)); cy = h * 0.5
    d = np.hypot(np.arange(w)[None, :] - cx, np.arange(h)[:, None] - cy); r = h * 0.55
    ring = np.clip(1 - np.abs(d - r) / 6, 0, 1)[..., None]; disc = np.clip((r - d) / 8, 0, 1)[..., None]
    img = img * (1 - 0.45 * disc) + GOLD * ring * 0.35
    bw, bh = int(h * 0.09), int(h * 0.34); x0 = w // 2 - int(bw * 1.4); y0 = h // 2 - bh // 2
    for xx_ in (x0, w // 2 + int(bw * 0.4)): img[y0:y0 + bh, xx_:xx_ + bw] = img[y0:y0 + bh, xx_:xx_ + bw] * 0.3 + IVORY * 0.7
    return img
# ---------------------------------------------------------------- words
def all_words():
    ws = []
    for sg in json.load(open(S_ + 'v11/voc16.json')): ws += [w for w in sg['words'] if not (30.5 <= w[1] < 59.5)]
    for sg in json.load(open(S_ + 'v11/gap_words.json')): ws += [w for w in sg['words'] if 30.5 <= w[1] < 59.5]
    return sorted(ws, key=lambda w: w[1])
WALL = all_words()
BAD_LINES = [(0.05, 1.84, 'في حينها تولّى [[الحقير ابن الحقير]]'), (1.84, 3.36, 'ولا يقود الأمة [[للضلالة]]'), (3.36, 5.5, 'عمر.. عمر [[رأس المصايب والفتن]]'), (5.5, 8.2, 'بولاية [[الطاغوت]] قسرًا..'),
    (8.24, 11.7, 'ما صار من بعد النبي'), (11.76, 13.05, 'كان ما صار'), (13.1, 15.0, 'ولا يقود الأمة [[للضلالة]]'), (15.02, 16.3, 'تفريط الأمة بالوصي'), (16.32, 19.05, 'بعد النبي وما فترت في جداله'),
    (19.08, 21.15, 'ونزلها القرآن من خلفها [[عار]]'), (21.18, 23.1, 'وتناولوا [[أهل الضلالة]]'), (23.12, 25.95, 'جلالة وضحت [[بلا قيمة]] ولا أي مقدار'), (25.98, 28.1, 'وتخلخلت داخل صفوف [[العمالة]]'),
    (28.12, 30.45, 'تفريطها وضرارها ما هي ضرار.. هي [[كارثة]]'), (30.5, 32.8, 'عن يوم الغدير يعني'), (33.8, 35.0, 'أبو بكر عن دينها'), (35.04, 37.1, '[[كفروا]] من تولاهم ووالاهم'),
    (38.04, 40.9, 'عمر.. عمر [[رأس المصايب والفتن]]'), (40.92, 42.5, 'ومن يدافع عن [[عدو الله]]'), (42.56, 44.98, 'يوم السقيفة يوم [[فعل المنكر]]'), (45.0, 47.85, 'من بعدها في حينها تولّى [[الحقير ابن الحقير]]'),
    (47.88, 50.43, 'ذي خالف الكرار.. لش عاد بكره'), (50.46, 53.45, 'وتاهت الأمة.. وتاهت الأمة'), (53.48, 55.8, 'وخلّوا الإسلام كل [[مسخرة]]'), (55.82, 58.3, 'لا عصرنا هذا مواقعنا الخطير'),
    (59.86, 62.3, 'رجعت لفّ من بعد ما مات النبي'), (62.34, 64.7, 'رجعت لفّ حول السقيفة.. دور وين البديل'), (64.78, 66.9, '[[جحدت]] شُكرها السقيفة كِبرًا'), (66.96, 69.6, 'فهوت بالعباد نحو [[الشقاء]]'),
    (69.76, 72.0, 'وتقمّصها [[قسرًا]]..'), (72.12, 75.0, 'ولجّوا لجّةً طخيةً [[بعماء]]'), (75.14, 77.0, 'إن الولاية للوصي'), (77.08, 80.95, 'وآله من بعده حصنٌ منيعٌ محكم'),
    (81.12, 83.2, 'وجميع من رفضوا ولاية حيدر'), (83.26, 85.9, 'بولاية [[الطاغوت]] قسرًا أُرغموا'), (85.98, 87.95, '[[كفروا]] وقد سمعوا رسالة ربهم')]
GOOD_LINES = [(0.0, 1.92, 'كيف يا [[قرآن]]'), (1.92, 9.3, 'ربيت [[الرجال]]'), (9.42, 12.0, 'كيف صاروا [[هكذا]]'), (12.06, 14.1, 'مثل [[الجبال]]'), (14.22, 16.7, 'تشهد [[الأيام]]'),
              (16.76, 20.5, 'لكن كلما [[صبروا]]'), (20.62, 22.85, '[[أمجادها]]')]
def parse(txt):
    ws = []
    for part in re.split(r'(\[\[.*?\]\])', txt):
        if not part.strip(): continue
        st = part.startswith('[['); ws += [(w_, st) for w_ in (part[2:-2] if st else part).split()]
    return ws
def timings(a, b, ws, source='bad'):
    if source == 'good':
        ly = [s for w, s in L.LYR if a - 0.05 <= s < b]
        if len(ly) == len(ws): return ly
    else:
        cand = [w[1] for w in WALL if a - 0.15 <= w[1] < b - 0.05]
        if len(cand) == len(ws): return [max(a, c) for c in cand]
    Lg = [len(w) + 2 for w, _ in ws]; cum = np.cumsum([0] + Lg[:-1]) / sum(Lg); return [a + (b - a) * 0.8 * c for c in cum]
class KLine:
    """one spoken line as big kinetic words inside the word band"""
    def __init__(s, la, lb, txt, side, off, s0, s1):
        ws = parse(txt); st = timings(la, lb, ws, side)
        keep = [i for i in range(len(ws)) if s0 - 0.02 <= st[i] < s1 - 0.05]
        s.ws = [ws[i] for i in keep]; s.st = [st[i] + off for i in keep]; s.side = side
        s.a = (s.st[0] if s.st else la + off); s.b = min(lb, s1) + off
        s.imgs = []
        for w_, strong in s.ws:
            if side == 'bad':
                im = text([(w_, RED if strong else IVORY)], 'naskh', 104 if strong else 78, 4 if strong else 3, BLACK)
            else:
                im = text([(w_, ORANGE if strong else NAVY)], 'naskh', 112 if strong else 84)
            s.imgs.append(im)
        gap = 22; rows = [[]]; cur = 0
        for i, im in enumerate(s.imgs):
            if rows[-1] and cur + gap + im.shape[1] > 880: rows.append([]); cur = 0
            rows[-1].append(i); cur += im.shape[1] + (gap if cur else 0)
        s.rows = rows; s.rh = 112
        s.pos = {}
        for r_, row in enumerate(rows):
            tot = sum(s.imgs[i].shape[1] for i in row) + gap * (len(row) - 1); x = 510 + tot / 2
            for i in row: wd = s.imgs[i].shape[1]; s.pos[i] = (x - wd / 2, (r_ - (len(rows) - 1) / 2) * s.rh); x -= wd + gap
    def draw(s, c, t, cy):
        if not (s.a - 0.05 <= t < s.b + 0.25): return c
        out = eio(seg(t, s.b, s.b + 0.22))
        for i, (w_, strong) in enumerate(s.ws):
            if t < s.st[i]: continue
            p = t - s.st[i]; x, dy = s.pos[i]; y = cy + dy; im = s.imgs[i]
            if s.side == 'bad':
                if strong:
                    sc = 2.6 - 1.6 * ease(p / 0.12) if p < 0.12 else 1.0 + 0.04 * np.sin(p * 30) * np.exp(-p * 4)
                    jx = 10 * np.sin(t * 97) * np.exp(-p * 5)
                    if p < 0.18:                                               # chromatic split on impact
                        r_ = im.copy(); r_[..., :3] = RED; b_ = im.copy(); b_[..., :3] = C('2A0A08')
                        c = put(c, r_, x + jx + 12, y, sc, 0.5 * (1 - out)); c = put(c, b_, x + jx - 12, y, sc, 0.5 * (1 - out))
                    c = put(c, im, x + jx, y, sc, min(1, p / 0.04) * (1 - out), glow=0.9 * np.exp(-p / 0.4), glow_col=RED)
                else:
                    c = put(c, im, x + 6 * np.sin(t * 61) * np.exp(-p * 8), y + 18 * (1 - ease(p / 0.12)), 1.0, min(1, p / 0.07) * (1 - out))
            else:
                if strong: c = put(c, im, x, y, 0.82 + 0.18 * back(p / 0.45, 1.6), min(1, p / 0.15) * (1 - out), glow=0.7 * np.exp(-p / 0.8), glow_col=LG)
                else: c = put(c, im, x, y - 14 * (1 - ease(p / 0.3)), 1.0, min(1, p / 0.2) * (1 - out))
        return c
def film_lines():
    out = []
    for k in TL:
        side, a, b, s0 = k; src = BAD_LINES if side == 'bad' else GOOD_LINES
        for la, lb, txt in src:
            if lb > s0 and la < s0 + (b - a):
                kl = KLine(la, lb, txt, side, a - s0, s0, s0 + (b - a))
                if kl.ws: out.append(kl)
    return out
KL = film_lines()
RED_HITS = sorted(set(round(k.st[i], 2) for k in KL if k.side == 'bad' for i, (w_, st_) in enumerate(k.ws) if st_ and (i == 0 or not k.ws[i - 1][1])))
GOLD_HITS = sorted(set(round(k.st[i], 2) for k in KL if k.side == 'good' for i, (w_, st_) in enumerate(k.ws) if st_))
# ---------------------------------------------------------------- frame
CHIP_G = D.chip('السنة', NAVY, PAPER, GOLD); LABEL_B = P.LABEL_D
def split_layout(a):
    hG = int(260 + 300 * a); hB = int(260 + 300 * (1 - a))
    gy0 = 335; gy1 = gy0 + hG
    div = 1150 * a + 615 * (1 - a); lab = div + 40; by1 = 1485; by0 = by1 - hB
    band = (gy1 + div) / 2 if a >= 0.5 else (lab + 28 + by0) / 2
    band = 1020 * a + 805 * (1 - a)
    return hG, hB, gy0, gy1, div, lab, by0, by1, band
def split_frame(t, kturn):
    a = layout(t); hG, hB, gy0, gy1, div, lab, by0, by1, band = split_layout(a)
    top = background(t, leak=0.8); bot = D.dark_bg(t)
    m = np.clip((yy - div) / 3 + 0.5, 0, 1)[..., None]; c = top * (1 - m) + bot * m
    side = kturn[0] if kturn else 'bad'; s_play = max(0.0, (kturn[3] + (t - kturn[1])) if kturn else 0.0)
    # good window
    if side == 'good' and a > 0.02 and t >= INTRO:
        img = good_img(s_play, 1000, hG, 1.0 + 0.05 * seg(t, kturn[1], kturn[2]))
        if t - kturn[1] < 0.15: img = img + (LG - img) * (1 - (t - kturn[1]) / 0.15) * 0.6
    else: img = eclipse_fx(paused('good', last_src('good', t), 1000, hG).copy(), t)
    c = place(c, img, round_mask(1000, hG, 26), 540, (gy0 + gy1) / 2, 1.0, 1.0, 0.0, border=5, border_col=PAPER if side == 'good' else GREY, shadow=0.3)
    # bad window
    if side == 'bad' and a < 0.98 and t >= INTRO:
        z = 1.0 + 0.05 * seg(t, kturn[1], kturn[2]) + sum(0.07 * np.exp(-(t - h) / 0.18) for h in RED_HITS if kturn[1] <= h <= t)
        img = bad_img(s_play, 1000, hB, z)
        if t - kturn[1] < 0.15: img = img + (RED - img) * (1 - (t - kturn[1]) / 0.15) * 0.5
    else: img = eclipse_fx(paused('bad', last_src('bad', t), 1000, hB).copy(), t)
    c = place(c, img, round_mask(1000, hB, 20), 540, (by0 + by1) / 2, 1.0, 1.0, 0.0, border=4, border_col=RED if side == 'bad' else C('3A3A3A'), shadow=0.0)
    # divider: gold above, red below, with a moving spark
    ln = np.zeros((H, W), np.float32); cv2.line(ln, (0, int(div * 8)), (W * 8, int(div * 8)), 1.0, 6, cv2.LINE_AA, shift=3)
    gl = cv2.GaussianBlur(ln, (0, 0), 7); col = GOLD if side == 'good' else RED
    c = c + (col - c) * np.clip(ln + gl * 1.8, 0, 1)[..., None]
    sx = (t * 700) % (W + 200) - 100; sp = np.exp(-((xx[:1] - sx) / 40) ** 2)[0]; y0_ = int(div) - 3; c[max(0, y0_):y0_ + 6] += (WHITE - c[max(0, y0_):y0_ + 6]) * sp[None, :, None] * 0.8
    c = put(c, CHIP_G, 862, 300, 1.0 + 0.12 * a, 0.6 + 0.4 * a)
    c = put(c, LABEL_B, 520, lab + 6, 0.62 + 0.18 * (1 - a), 0.55 + 0.45 * (1 - a))
    # words of whoever speaks, in the band
    for k in KL:
        if k.a - 0.05 <= t < k.b + 0.25: c = k.draw(c, t, band)
    # world particles
    if side == 'bad':
        c = D.ASHD.draw(c, t, 1.0)
        for h in RED_HITS:
            if kturn[1] <= h <= t < h + 0.5:
                c = rays(c, t, h, 510, band, 18, RED, 0.4, 120, 760, 5, seed=int(h * 10)); c = c + (RED - c) * np.exp(-(t - h) / 0.06) * 0.18
    else:
        c = L.GDUST.draw(c, t, 0.8); c = L.BOKEH.draw(c, t, 0.4)
        for h in GOLD_HITS:
            if kturn[1] <= h <= t < h + 1.2: c = L.sparkle(c, t, h, 510, band, 10, 280, 1.2, int(h * 10))
    return c
def intro(t):
    k = ease(seg(t, 0.1, 0.7))
    top = background(t, leak=1.0); top = L.godrays(top, t, 540, 200, 0.9, 16)
    bot = D.dark_bg(t); bot = D.ASHD.draw(bot, t, 1.0)
    split = 960; c = D.halves(t, split, top, bot)
    ln = np.zeros((H, W), np.float32); Lw = 540 * k; cv2.line(ln, (int((540 - Lw) * 8), split * 8), (int((540 + Lw) * 8), split * 8), 1.0, 6, cv2.LINE_AA, shift=3)
    c = c + (GOLD - c) * np.clip(ln + cv2.GaussianBlur(ln, (0, 0), 7) * 1.8, 0, 1)[..., None]
    c = put(c, text([('السنة', NAVY)], 'naskh', 230), 510, 690, back(seg(t, 0.25, 0.65)), min(1, seg(t, 0.25, 0.32)), glow=0.6, glow_col=LG)
    c = L.sparkle(c, t, 0.3, 510, 690, 12, 300, 1.2, 4)
    big = fitw(text([('الحوثي', IVORY), ('يسب الصحابة', RED)], 'naskh', 150, 4, BLACK), 900)
    p = t - 0.85; sc = (2.4 - 1.4 * ease(p / 0.14)) if 0 <= p < 0.14 else 1.0
    if p >= 0: c = put(c, big, 510, 1240, sc, min(1, p / 0.05), glow=0.8 * np.exp(-p / 0.4), glow_col=RED)
    if p >= 0: c = rays(c, t, 0.85, 510, 1240, 20, RED, 0.5, 140, 800, 5, seed=3)
    if t > 1.9: c = c * (1 - 0.0)
    return c
def finale(t):
    p = t - FIN[0]
    if p < 2.2:                                                             # strobe: bad stills (red, glitch) vs good stills (gold), accelerating
        rate = 6 + 10 * p; k = int(p * rate); good = k % 2 == 1
        if good:
            im = L_ST[k % len(L_ST)]; c = background(t, leak=1.0); c = P.thumb(c, im, 540, 960, 960, 650, 0.0, 1.0, border=PAPER)
            c = put(c, text([('السنة', NAVY)], 'naskh', 170), 510, 470, 1.0, 1.0, glow=0.6, glow_col=LG)
        else:
            im = P.STILL[k % len(P.STILL)]; c = D.dark_bg(t); r_ = im * 0.6 + RED * 0.4 * (im.mean(2, keepdims=True) / 255)
            c = P.thumb(c, r_, 540 + 20 * np.sin(t * 90), 960, 960, 615, 2.0 * np.sin(t * 40), 1.0, border=RED)
            c = put(c, fitw(text([('الحوثي', IVORY), ('يسب الصحابة', RED)], 'naskh', 130, 4, BLACK), 900), 510, 1430, 1.0 + 0.08 * np.sin(t * 50), 1.0)
            c = glitch_cut(c, c, 0.3)
        c = camera(c, 1.0 + 0.04 * np.sin(t * 70), 14 * np.sin(t * 83), 10 * np.cos(t * 71), fill=BLACK)
        return c
    q = p - 2.2                                                              # the dark half shatters, light takes the screen
    top = background(t, leak=1.0); top = L.godrays(top, t, 540, -60, eio(seg(q, 0.4, 1.4)), 18)
    top = P.thumb(top, L_ST[1], 540, 640 + 320 * eio(seg(q, 0.5, 1.4)), 960 * (1 + 0.1 * eio(seg(q, 0.5, 1.4))), 600, 0.0, 1.0, border=PAPER)
    bot = D.dark_bg(t); bot = P.thumb(bot, P.STILL[13], 540, 1290, 960, 520, 0.0, 1.0, border=RED)
    split = 960
    c = top.copy()
    if q < 1.6:                                                              # shards fall away
        r = np.random.default_rng(7); n = 18
        for i in range(n):
            x0 = (i % 6) * 180; y0 = 960 + (i // 6) * 320; sh = bot[y0:y0 + 320, x0:x0 + 180]
            if sh.size == 0: continue
            fall = max(0.0, q - 0.08 * r.uniform(0, 4)); dy = 0.5 * 4200 * fall ** 2; rot = r.uniform(-60, 60) * fall; dx = r.uniform(-260, 260) * fall
            mm = np.ones(sh.shape[:2], np.float32)
            c = place(c, sh, mm, x0 + 90 + dx, y0 + 160 + dy, 1.0, 1.0 - 0.3 * min(1, fall), rot, shadow=0.0)
        if q < 0.12: c = c + (WHITE - c) * (1 - q / 0.12) * 0.8
    c = put(c, text([('السنة', NAVY)], 'naskh', 220), 510, 470, back(seg(q, 0.3, 0.8)), min(1, seg(q, 0.3, 0.4)), glow=0.7, glow_col=LG)
    c = L.sparkle(c, t, FIN[0] + 2.55, 510, 470, 14, 360, 1.4, 9); c = L.GDUST.draw(c, t, 1.0); c = L.BOKEH.draw(c, t, 0.7)
    return c
L_ST = P.LSTILL
def frame(t):
    if t < INTRO:
        c = intro(t)
        if t > INTRO - 0.3: c = flash(c, split_frame(t, turn_at(INTRO + 0.01) and turn_at(INTRO + 0.01)), seg(t, INTRO - 0.3, INTRO), RED)
    elif t < T_END: c = split_frame(t, turn_at(t))
    elif t < OUT_T + 0.6: c = finale(min(t, OUT_T + 0.55))
    else: c = background(t)
    if t < OUT_T + 0.3:
        a_b = eio(seg(t, 0.3, 0.8)) * (1 - eio(seg(t, OUT_T, OUT_T + 0.3))); c = brand_corner(c, t, a_b)
    c = outro(c, t, OUT_T)
    return finish_frame(c, t, 0.07)
# ---------------------------------------------------------------- sound
def build_audio():
    from scipy.signal import resample_poly
    dv, sr = sf.read(S_ + 'v11/sep/htdemucs/a/vocals.wav', dtype='float32'); nv, _ = sf.read(S_ + 'v10/sep/htdemucs/a/vocals.wav', dtype='float32')
    dv = resample_poly(dv, 160, 147, axis=0); nv = resample_poly(nv, 160, 147, axis=0); R = 48000
    def g(x, target): r = np.sqrt((x ** 2).mean()) + 1e-9; return 10 ** ((target - 20 * np.log10(r)) / 20)
    gD = g(dv[:int(95 * R)], -19.0); gN = g(nv[:int(22.9 * R)], -18.0)
    trk = np.zeros((int(DUR * R), 2), np.float32)
    for side, a, b, s0 in TL:
        src, gg = (dv, gD) if side == 'bad' else (nv, gN); x = src[int(s0 * R):int((s0 + b - a) * R)].copy() * gg; f = int(0.03 * R)
        x[:f] *= np.linspace(0, 1, f)[:, None]; x[-f:] *= np.linspace(1, 0, f)[:, None]; j = int(a * R); trk[j:j + len(x)] += x[:len(trk) - j]
    tl = np.zeros_like(trk); Pl = sfx.place
    Pl(tl, sfx.shimmer(1.4), 0.25, -20); Pl(tl, sfx.impact(1.8, 70, 28), 0.85, -9); Pl(tl, sfx.glitch(0.25), 0.85, -20); Pl(tl, sfx.whoosh(0.6, 200, 4000, dark=True), INTRO - 0.35, -16)
    for side, a, b, s0 in TL[1:]:
        if side == 'bad': Pl(tl, sfx.impact(1.2, 85, 32), a, -12); Pl(tl, sfx.whoosh(0.5, 150, 1500, dark=True, rev=True), a - 0.4, -18)
        else: Pl(tl, sfx.whoosh(0.5, 500, 9000), a - 0.25, -17); Pl(tl, sfx.shimmer(1.3, 2600), a, -22)
    for h in RED_HITS: Pl(tl, sfx.impact(0.9, 120, 40), h, -13); Pl(tl, sfx.glitch(0.18), h, -22)
    for h in GOLD_HITS: Pl(tl, sfx.shimmer(1.2, 2800), h, -22)
    p0 = FIN[0]; k = 0; tt = 0.0
    while tt < 2.2:
        rate = 6 + 10 * tt; Pl(tl, sfx.impact(0.35, 140, 60) if k % 2 == 0 else sfx.glitch(0.08), p0 + tt, -16 if k % 2 == 0 else -22); tt += 1 / rate; k += 1
    Pl(tl, sfx.riser(1.8, dark=True), p0 + 0.4, -18); Pl(tl, sfx.impact(2.2, 60, 24), p0 + 2.2, -7); Pl(tl, sfx.glitch(0.3), p0 + 2.2, -16); Pl(tl, sfx.shimmer(2.4, 2000), p0 + 2.5, -16)
    Pl(tl, sfx.whoosh(0.8, 400, 9000), OUT_T - 0.2, -17); Pl(tl, sfx.shimmer(2.0), OUT_T + 0.3, -20)
    sf.write(WK + 'pre.wav', trk + tl, R)
    j = subprocess.run(['ffmpeg', '-hide_banner', '-i', WK + 'pre.wav', '-af', 'highpass=f=40,loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    d = json.loads(j[j.rindex('{'):]); mi = f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', WK + 'pre.wav', '-af', f'highpass=f=40,loudnorm=I=-14:TP=-1.0:LRA=11:{mi}:linear=true', '-ar', '48000', WK + 'mix.wav'], check=True)

N = int(round(DUR * FPS))
if __name__ == '__main__':
    MODE = sys.argv[1]
    if MODE == 'info': print('T_END', round(T_END, 2), 'DUR', round(DUR, 2), 'turns', len(TL), 'red hits', len(RED_HITS))
    elif MODE == 'still':
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
        out = OUTD + 'raw/03-alsunna-wa-alhouthi-v3.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', WK + 'body.mp4', '-i', WK + 'mix.wav', '-map', '0:v', '-map', '1:a',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
        print('ok', out)
