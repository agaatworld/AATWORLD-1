# Meaning-driven effects for the strong words of Video 4 (owner: «الجبان» weak and liquid, «الجبال» cracks the place with earth texture, and so on).
# Every effect works on the word's own RGBA image (Thmanyah Serif Display Black) and never reaches down to his head.
import numpy as np, cv2
import mg
from km import C, PARCH, BRONZE_L
ease, eio, seg = mg.ease, mg.eio, mg.seg
W, H = 1080, 1920

# word → effect, by line number (1-based, as in the studio)
EFFECTS = {3: {'بالآخرة': 'rise'}, 4: {'الصادقة': 'gold'}, 5: {'الشدائد': 'quake'}, 6: {'والمغانم': 'gold'},
           7: {'استجابوا': 'slam', 'القرح': 'wound', 'والهزائم': 'melt'}, 9: {'بعقيدتهم': 'gold'},
           11: {'الجبان': 'melt'}, 12: {'الخذلان': 'shatter', 'الجبال': 'quake'}, 13: {'تصم': 'shock', 'الآذان': 'shock'},
           14: {'عقيدتكم': 'gold'}, 15: {'هان': 'melt'}, 16: {'تترفعون': 'rise', 'الأغبياء': 'wobble'},
           17: {'القعود': 'sink', 'الضعفاء': 'melt'}, 18: {'تلوون': 'twist', 'ذراع': 'slam', 'إيران': 'slam'}, 19: {'كسر': 'shatter'},
           20: {'ألف': 'trail', 'عام': 'trail'}, 21: {'اليمن': 'gold'}, 25: {'حبيبكم': 'warm'}, 34: {'يثبتنا': 'anchor', 'ويثبتكم': 'anchor'}}
COL = {'melt': C('E9E3D6'), 'sink': C('C9C2B4'), 'shatter': C('E85A33'), 'twist': C('F08A4B'), 'shock': C('F08A4B'), 'rise': C('F7E2A6'),
       'wobble': C('F4B57E'), 'warm': C('F29C78'), 'slam': C('F08A4B'), 'anchor': C('E4B46E'), 'wound': C('D8432C'),
       'gold': 'gold', 'trail': 'gold', 'quake': 'earth'}

def _noise(h, w, seed, scales=((8, 0.5), (24, 0.3), (64, 0.2))):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32)
    for sc, a in scales:
        g = r.random((max(2, h // sc + 2), max(2, w // sc + 2))).astype(np.float32)
        out += cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC) * a
    return (out - out.min()) / (np.ptp(out) + 1e-6)

def earth_fill(al, seed=3):
    """rock / dry earth: layered noise in ochre and dark umber, with dark fissures"""
    h, w = al.shape; n = _noise(h, w, seed, ((4, 0.35), (12, 0.35), (40, 0.3)))
    c0, c1, c2 = C('3E2A18'), C('8A6238'), C('C89B62')
    rgb = np.where(n[..., None] < 0.5, c0 + (c1 - c0) * (n[..., None] / 0.5), c1 + (c2 - c1) * ((n[..., None] - 0.5) / 0.5))
    cr = np.zeros((h, w), np.float32); r = np.random.default_rng(seed + 7)
    for _ in range(max(3, w // 60)):                                       # fissures inside the letters
        x, y = r.uniform(0, w), r.uniform(0, h); pts = [(x, y)]
        for _ in range(8): x += r.uniform(-14, 14); y += r.uniform(-10, 10); pts.append((x, y))
        cv2.polylines(cr, [np.int32(np.array(pts) * 4)], False, 1.0, 4, cv2.LINE_AA, shift=2)
    rgb = rgb * (1 - 0.75 * cr[..., None])
    hi = np.clip(cv2.Sobel(n, cv2.CV_32F, 0, 1) * 6, 0, 1)[..., None]; rgb = rgb + (C('E8C99A') - rgb) * hi * 0.3
    return rgb

def gold_fill(al):
    h = al.shape[0]; y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    top, mid, bot = C('FFF0B8'), C('C8922C'), C('F5D27A')
    return np.broadcast_to(np.where(y < 0.5, top + (mid - top) * (y / 0.5), mid + (bot - mid) * ((y - 0.5) / 0.5)), al.shape + (3,)).copy()

def word_img(rtl_line, w, fk, size, eff):
    a = rtl_line([(w, (255, 255, 255))], fk, size); al = a[..., 3].astype(np.float32)
    col = COL[eff]
    if isinstance(col, str):
        if col == 'earth':
            rgb = earth_fill(al, seed=len(w) * 7 + size)
            rim = cv2.GaussianBlur(cv2.dilate(al, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))), (0, 0), 0.7)
            rgb = rgb * al[..., None] + C('F4E6CC') * (1 - al[..., None])
            return np.dstack([rgb, np.maximum(al, rim)])
        rgb = gold_fill(al)
    else:
        rgb = np.broadcast_to(col, al.shape + (3,)).copy()
    return np.dstack([rgb, al])

# ---------------------------------------------------------------- per-effect helpers
_MELT = {}
def melt_img(img, p, key, max_drop):
    """the word turns liquid: each column sags by its own amount, drips run down, edges soften"""
    h, w = img.shape[:2]; pad = int(min(90, max(0, max_drop)))
    if key not in _MELT:
        r = np.random.default_rng(abs(hash(key)) % 2 ** 32)
        n = cv2.GaussianBlur(r.random(w).astype(np.float32)[None, :], (0, 0), 6)[0]; n = (n - n.min()) / (np.ptp(n) + 1e-6)
        drips = np.zeros(w, np.float32)
        for x in r.integers(0, w, max(3, w // 45)): drips += np.exp(-((np.arange(w) - x) / r.uniform(3, 7)) ** 2) * r.uniform(0.6, 1.0)
        _MELT[key] = (n, np.clip(drips, 0, 1))
    n, drips = _MELT[key]
    src = np.pad(img, ((0, pad), (0, 0), (0, 0)))
    H2 = h + pad; ys = np.arange(H2, dtype=np.float32)[:, None]; xs = np.arange(w, dtype=np.float32)[None, :]
    k = np.clip(ys / h, 0, 1) ** 1.6                                         # the lower part of each letter slides most
    sag = p * (0.35 * pad * n[None, :] + 0.65 * pad * drips[None, :]) * k
    mapy = (ys - sag).astype(np.float32); mapx = (xs + 2.5 * p * np.sin(ys / 9.0 + xs / 23.0)).astype(np.float32)
    out = cv2.remap(src, np.broadcast_to(mapx, (H2, w)).copy(), np.broadcast_to(mapy, (H2, w)).copy(), cv2.INTER_LINEAR, borderValue=0)
    if p > 0.05:
        kv = int(1 + 2 * round(4 * p)); out = cv2.blur(out, (1, kv))
    return out, pad

def shatter_halves(img, p, rnd=0.0):
    """a diagonal break: the two halves slide apart"""
    h, w = img.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    line = (yy - h * 0.5) - (xx - w * 0.5) * 0.35 + 6 * np.sin(xx / 7.0)
    a = (line < 0).astype(np.float32)[..., None]; b = 1 - a
    d = 10 * ease(p)
    A_ = img * a; B_ = img * b
    M1 = np.float32([[1, 0, -d * 0.6], [0, 1, -d * 0.8]]); M2 = np.float32([[1, 0, d * 0.6], [0, 1, d * 0.8]])
    o1 = cv2.warpAffine(A_, M1, (w, h)); o2 = cv2.warpAffine(B_, M2, (w, h))
    return o1 + o2

def cracks(c, x, y, wd, p, fade, head_top, seed):
    """ground cracks bursting out from both sides of the word: thick at the root, thinning and branching, never below his head"""
    if p <= 0 or fade <= 0.01: return c
    r = np.random.default_rng(seed); m = np.zeros((H, W), np.float32)
    def branch(px, py, ang, L, wdt, depth):
        n = 9; seg_ = L / n; pts = [(px, py)]
        for j in range(n):
            ang += r.uniform(-0.45, 0.45); px += np.cos(ang) * seg_; py += np.sin(ang) * seg_
            py = min(py, head_top - 16); pts.append((px, py))
        for j in range(n):
            w_ = max(1, int(round(wdt * (1 - j / n) + 1)))
            cv2.line(m, (int(pts[j][0] * 4), int(pts[j][1] * 4)), (int(pts[j + 1][0] * 4), int(pts[j + 1][1] * 4)), 1.0, w_ * 4 // 2, cv2.LINE_AA, shift=2)
            if depth < 2 and r.random() < 0.28: branch(pts[j][0], pts[j][1], ang + r.choice([-1, 1]) * r.uniform(0.5, 1.0), L * 0.45, wdt * 0.55, depth + 1)
    for side in (-1, 1):
        for j in range(3):
            ang = (np.pi if side < 0 else 0) + side * r.uniform(-0.15, 0.55)
            branch(x + side * (wd / 2 - 10), y + r.uniform(-8, 18), ang, r.uniform(220, 420) * ease(p), r.uniform(5, 8), 0)
    m = np.clip(m, 0, 1); m[int(max(0, head_top - 12)):] = 0
    dark = C('2E1D0E'); lite = C('F6EAD5')
    c = c + (lite - c) * (np.clip(np.roll(m, 2, 0) - m, 0, 1) * 0.6 * fade)[..., None]     # a lit lip on each crack
    return c + (dark - c) * (m * 0.92 * fade)[..., None]

_MUD = {}
def mud(h=520, w=1080, seed=11):
    """dried, cracked earth: Voronoi plates of ochre clay with dark fissures"""
    if seed in _MUD: return _MUD[seed]
    r = np.random.default_rng(seed); pts = np.c_[r.uniform(0, w, 70), r.uniform(0, h, 70)].astype(np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); d1 = np.full((h, w), 1e9, np.float32); d2 = d1.copy(); idx = np.zeros((h, w), np.int32)
    for k_, (px, py) in enumerate(pts):
        d = np.hypot(xx - px, yy - py); m1 = d < d1
        d2 = np.where(m1, d1, np.minimum(d2, d)); idx = np.where(m1, k_, idx); d1 = np.where(m1, d, d1)
    edge = np.clip(1 - (d2 - d1) / 7.0, 0, 1) ** 1.5                     # fissures between the plates
    tone = r.uniform(0.75, 1.15, 70).astype(np.float32)[idx]
    n = _noise(h, w, seed + 1, ((3, 0.4), (10, 0.35), (30, 0.25)))
    base = C('9C7548') * (0.7 + 0.45 * n[..., None]) * tone[..., None]
    rim = np.clip(1 - (d2 - d1) / 14.0, 0, 1)[..., None] * 0.25           # plates curl up a little at their edges
    rgb = base * (1 + rim) ; rgb = rgb * (1 - 0.85 * edge[..., None]) + C('24160A') * 0.85 * edge[..., None]
    _MUD[seed] = np.clip(rgb, 0, 255).astype(np.float32); return _MUD[seed]

def earth_patch(c, x, y, wd, q, T, head_top, seed):
    """the sky around the word turns into cracked earth for a moment, then heals back"""
    p = ease(seg(q, 0.0, 0.22)); fade = 1 - eio(seg(q, 0.75 * T, 1.5 * T))
    if p <= 0 or fade <= 0.01: return c
    tex = mud(seed=seed); th, tw = tex.shape[:2]
    y0 = int(max(0, y - th / 2)); y1 = int(min(H, head_top - 10, y0 + th))
    if y1 <= y0: return c
    yy, xx = np.mgrid[y0:y1, 0:W].astype(np.float32)
    ang = np.arctan2(yy - y, xx - x); wob = 1 + 0.18 * np.sin(ang * 5 + seed) + 0.1 * np.sin(ang * 11 + 2 * seed)
    rx, ry = (wd / 2 + 340 * p) * wob, (70 + 170 * p) * wob
    rr = np.sqrt(((xx - x) / rx) ** 2 + ((yy - y) / ry) ** 2)
    m = np.clip((1 - rr) / 0.18, 0, 1) * fade * np.clip((head_top - 10 - yy) / 45, 0, 1)   # no hard edge above his head
    sub = tex[:y1 - y0, :W] if tex.shape[1] >= W else cv2.resize(tex, (W, th))[:y1 - y0]
    reg = c[y0:y1]; c[y0:y1] = reg * (1 - m[..., None]) + sub * m[..., None]
    return c

def dust(c, x, y, q, head_top, seed, col=C('A07A4E'), n=26):
    if q < 0 or q > 1.4: return c
    r = np.random.default_rng(seed); m = np.zeros((H, W), np.float32)
    for _ in range(n):
        vx, vy = r.uniform(-160, 160), r.uniform(-60, 40); px = x + r.uniform(-90, 90) + vx * q; py = y + r.uniform(-10, 30) + vy * q + 260 * q * q
        if py > head_top - 10: continue
        cv2.circle(m, (int(px * 4), int(py * 4)), int(r.uniform(1.5, 3.5) * 4), float(r.uniform(0.4, 0.9) * (1 - q / 1.4)), -1, cv2.LINE_AA, shift=2)
    return c + (col - c) * cv2.GaussianBlur(m, (0, 0), 0.8)[..., None]

def rings(c, x, y, q, head_top, col=C('FBEEDB')):
    m = np.zeros((H, W), np.float32)
    for j in range(3):
        pr = seg(q, 0.05 + 0.14 * j, 0.75 + 0.14 * j)
        if 0 < pr < 1:
            rad = 40 + 260 * ease(pr)
            cv2.ellipse(m, (int(x * 4), int(y * 4)), (int(rad * 4), int(rad * 0.55 * 4)), 0, 0, 360, float(1 - pr), 3 * 4 // 4, cv2.LINE_AA, shift=2)
    m[int(max(0, head_top - 10)):] = 0
    return c + (col - c) * (cv2.GaussianBlur(m, (0, 0), 1.0) * 0.8)[..., None]

def sparkles(c, x, y, w, q, seed):
    r = np.random.default_rng(seed); m = np.zeros((H, W), np.float32)
    for j in range(4):
        t0 = 0.15 + 0.22 * j; pr = seg(q, t0, t0 + 0.45)
        if 0 < pr < 1:
            px, py = x + r.uniform(-w / 2, w / 2), y + r.uniform(-30, 20); s = 16 * np.sin(np.pi * pr)
            cv2.line(m, (int((px - s) * 4), int(py * 4)), (int((px + s) * 4), int(py * 4)), 1.0, 4, cv2.LINE_AA, shift=2)
            cv2.line(m, (int(px * 4), int((py - s) * 4)), (int(px * 4), int((py + s) * 4)), 1.0, 4, cv2.LINE_AA, shift=2)
    return c + (C('FFF6D8') - c) * (cv2.GaussianBlur(m, (0, 0), 1.0))[..., None]

def sheen(img, p):
    hw = img.shape[1]; band = np.exp(-((np.arange(hw, dtype=np.float32) - hw * (1.2 - 1.4 * p)) / (hw * 0.12)) ** 2)
    return np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * 255, img[..., 3] * band[None, :]])

def white(img): return np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * 255, img[..., 3]])

def pre(c, it, q, head_top, avail=2.0):
    """effects that sit behind the words (drawn before the caption)"""
    if it['eff'] == 'quake' and q >= -0.02:
        T = float(np.clip(avail / 1.9, 0.35, 1.0))
        c = earth_patch(c, it['x'], it['y'], it['img'].shape[1], q, T, head_top, seed=len(it['w']) * 17)
    return c

def draw(c, it, q, fo, head_top, backing, avail=2.0):
    """draw one strong word with its effect. returns (canvas, (shake_x, shake_y))"""
    img = it['img']; x, y = it['x'], it['y']; eff = it['eff']; key = it['w'] + str(round(it['st'], 2))
    hb = img.shape[0] / 2 - 14
    T = float(np.clip(avail / 1.9, 0.35, 1.0))                               # compress the effect when the word is on screen briefly
    smax = max(1.0, (head_top - 10 - y) / max(1.0, hb))
    a = min(1, max(0, q) / 0.08) * fo; sx = sy = 0.0
    if q < -0.02: return c, (0, 0)
    put = mg.put
    if eff in ('slam', 'anchor', 'quake', 'wound'):
        if eff == 'anchor':                                                  # comes down from above and locks in place
            p = ease(q / 0.16); dy = -70 * (1 - p); s = 1.0
        else:
            p = ease(q / 0.12); dy = 0; s = min(smax, 1 + (1.1 if eff == 'quake' else 0.9) * (1 - p))
        c = put(c, backing(img, 'dark'), x, y + dy, s, a); c = put(c, img, x, y + dy, s, a)
        fl = np.exp(-max(0, q) / 0.07)
        if fl > 0.03 and eff != 'quake': c = put(c, white(img), x, y + dy, s, a * fl * 0.85)
        if eff == 'quake':
            c = dust(c, x, y + img.shape[0] * 0.3, q - 0.06, head_top, seed=len(key) * 5)
            e = np.exp(-max(0, q) / 0.16); rr = np.random.default_rng(int(q * 300)); sx, sy = rr.uniform(-14, 14) * e, rr.uniform(-10, 10) * e
        if eff == 'anchor': c = dust(c, x, y + img.shape[0] * 0.35, q - 0.15, head_top, seed=len(key) * 3, col=C('E8D9BE'), n=14)
        if eff == 'wound':
            g = 0.5 + 0.5 * np.sin(q * 9); c = put(c, np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * C('FF3B1F'), cv2.GaussianBlur(img[..., 3], (0, 0), 9)]), x, y, 1.0, a * 0.35 * g)
    elif eff == 'melt':                                                      # weak: it wobbles like liquid, drains of colour and collapses into a puddle
        p1 = eio(seg(q, 0.25 * T, 1.0 * T)); p2 = eio(seg(q, 0.55 * T, 1.7 * T))
        h_, w_ = img.shape[:2]; yy_, xx_ = np.mgrid[0:h_, 0:w_].astype(np.float32)
        amp = 7 * p1 * (0.4 + yy_ / h_)
        im2 = cv2.remap(img.astype(np.float32), (xx_ + amp * np.sin(yy_ / 7.0 + q * 9)).astype(np.float32), (yy_ + 0.6 * amp * np.sin(xx_ / 11.0 + q * 7)).astype(np.float32), cv2.INTER_LINEAR, borderValue=0)
        if p1 > 0.05: im2 = cv2.GaussianBlur(im2, (0, 0), 0.4 + 2.2 * p2)
        grey = np.dstack([np.broadcast_to(C('B9B3A6'), im2.shape[:2] + (3,)), im2[..., 3:]]).astype(np.float32)
        im2 = im2 * (1 - 0.7 * p2) + grey * 0.7 * p2
        syy = 1 - 0.62 * p2; sxx = 1 + 0.22 * p2; yb = y + hb                   # the baseline stays put: it slumps down onto itself
        yc = yb - hb * syy
        c = put(c, backing(im2, 'dark', False), x, yc, 1.0, a * (1 - 0.45 * p2), sx=sxx, sy=syy); c = put(c, im2, x, yc, 1.0, a * (1 - 0.3 * p2), sx=sxx, sy=syy)
    elif eff == 'sink':
        p = eio(seg(q, 0.2 * T, 1.6 * T)); dy = min(28 * p, max(0, head_top - 12 - (y + hb)))
        c = put(c, backing(img, 'dark'), x, y + dy, 1.0 - 0.12 * p, a * (1 - 0.45 * p)); c = put(c, img, x, y + dy, 1.0 - 0.12 * p, a * (1 - 0.35 * p))
    elif eff == 'shatter':                                                   # whole for a beat, then it breaks in two
        p = seg(q, 0.30 * T, 0.55 * T); im2 = shatter_halves(img, p) if p > 0 else img
        s = min(smax, 1 + 0.6 * (1 - ease(q / 0.12)))
        c = put(c, backing(im2, 'dark', False), x, y, s, a); c = put(c, im2, x, y, s, a)
        fl = np.exp(-max(0, q - 0.30) / 0.06) if q >= 0.30 else 0
        if fl > 0.03: c = put(c, white(im2), x, y, s, a * fl * 0.9)
        if 0.3 <= q < 0.45: rr = np.random.default_rng(int(q * 500)); sx, sy = rr.uniform(-6, 6), rr.uniform(-4, 4)
    elif eff == 'twist':                                                     # wrung like an arm
        rot = 26 * np.exp(-max(0, q) / 0.45) * np.cos(q * 13); sk = 1 - 0.25 * np.exp(-max(0, q) / 0.4) * abs(np.sin(q * 13))
        c = put(c, backing(img, 'dark'), x, y, 1.0, a, rot=rot, sx=sk); c = put(c, img, x, y, 1.0, a, rot=rot, sx=sk)
    elif eff == 'shock':                                                     # deafening: it shakes, sound rings spread
        e = np.exp(-max(0, q) / 0.35); jx = 6 * e * np.sin(q * 70)
        c = rings(c, x, y, q, head_top)
        c = put(c, backing(img, 'dark'), x + jx, y, 1.0, a); c = put(c, img, x + jx, y, 1.0, a)
    elif eff == 'rise':                                                      # lifted up, into the light
        p = ease(q / 0.6); dy = 50 * (1 - p)
        dy = min(dy, max(0, head_top - 12 - (y + hb)))
        c = put(c, np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * C('FFF4D6'), cv2.GaussianBlur(img[..., 3], (0, 0), 14)]), x, y + dy - 6, 1.06, a * 0.75)
        c = put(c, backing(img, 'dark'), x, y + dy, 1.0, a * p); c = put(c, img, x, y + dy, 1.0, a)
    elif eff == 'wobble':                                                    # jelly
        e = np.exp(-max(0, q) / 0.5); sxx = 1 + 0.22 * e * np.sin(q * 22); syy = 1 - 0.18 * e * np.sin(q * 22)
        c = put(c, backing(img, 'dark'), x, y, 1.0, a, sx=sxx, sy=syy); c = put(c, img, x, y, 1.0, a, sx=sxx, sy=syy)
    elif eff == 'gold':
        s = min(smax, 1 + 0.5 * (1 - ease(q / 0.14)))
        c = put(c, backing(img, 'dark'), x, y, s, a); c = put(c, img, x, y, s, a)
        ps = seg(q, 0.1, 0.8)
        if 0 < ps < 1: c = put(c, sheen(img, ps), x, y, s, 0.7 * fo)
        c = sparkles(c, x, y, img.shape[1], q, seed=len(key))
    elif eff == 'trail':                                                     # time: golden echoes trailing behind
        for j in range(4, 0, -1):
            pj = seg(q, 0.05 * j, 0.6 + 0.05 * j)
            if 0 < pj < 1: c = put(c, img, x + 30 * j * (1 - ease(pj)), y, 1.0, 0.25 * (1 - pj) * fo)
        c = put(c, backing(img, 'dark'), x, y, 1.0, a); c = put(c, img, x, y, 1.0, a)
    elif eff == 'warm':                                                      # a heartbeat
        b = 1 + 0.08 * max(np.sin(min(q, 1.2) * 11), 0) * np.exp(-max(0, q) / 0.8)
        c = put(c, np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * C('FF9E7A'), cv2.GaussianBlur(img[..., 3], (0, 0), 12)]), x, y, b, a * 0.45)
        c = put(c, backing(img, 'dark'), x, y, b, a); c = put(c, img, x, y, b, a)
    return c, (sx, sy)
