# Styleframes per direction: caption, thumbnail, carousel 4:5, motion graphic, 3D typography, logo square
# usage: python3 frames.py <A|B|C> [which...]
from kit import *
import mg
from PIL import Image, ImageDraw
S_ = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
OUT = B + 'frames/'
K = ARGV[1]; d = DIRS[K]; SEC = d['fonts'][2]
W, H = 1080, 1920

# ---------------------------------------------------------------- helpers
def rtl_line(runs, fk, size, sp=None):
    """one RTL line, several colours, shared baseline, no trimming (consistent line height)"""
    f = font(fk, size); asc, desc = f.getmetrics(); pad = 16; sp = size * 0.28 if sp is None else sp
    ws = [f.getlength(t, direction='rtl', language='ar') for t, _ in runs]
    tw = int(sum(ws) + sp * (len(runs) - 1)) + 2 * pad; hh = asc + desc + 2 * pad
    im = Image.new('RGBA', (tw, hh), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); x = tw - pad
    for (t, col), w in zip(runs, ws):
        dr.text((x, pad + asc), t, font=f, fill=tuple(int(v) for v in col[::-1]) + (255,), anchor='rs', direction='rtl', language='ar')
        x -= w + sp
    return to_f(im)

def wrap(words, fk, size, maxw):
    """words: list of (word, colour). greedy RTL wrap → list of run-lists (adjacent same colour merged)"""
    f = font(fk, size); spw = size * 0.28; lines = [[]]; cur = 0
    for w_, col in words:
        wl = f.getlength(w_, direction='rtl', language='ar')
        if lines[-1] and cur + spw + wl > maxw: lines.append([]); cur = 0
        lines[-1].append((w_, col)); cur += wl + (spw if cur else 0)
    out = []
    for ln in lines:
        runs = []
        for w_, col in ln:
            if runs and np.allclose(runs[-1][1], col): runs[-1] = (runs[-1][0] + ' ' + w_, col)
            else: runs.append((w_, col))
        out.append(runs)
    return out

def tokens(s, base, marks):
    """s with [[gold]] and {{ember}} marks → (word, colour) list"""
    import re
    out = []
    for part in re.split(r'(\[\[.*?\]\]|\{\{.*?\}\})', s):
        if not part.strip(): continue
        col = base
        if part.startswith('[['): col, part = marks[0], part[2:-2]
        elif part.startswith('{{'): col, part = marks[1], part[2:-2]
        out += [(w_, col) for w_ in part.split()]
    return out

def ring(c, cx, cy, r, col, a=1.0, w=2, arc=None, dash=None, ticks=0, tick_len=10, rot=0.0):
    h, w_ = c.shape[:2]; S8 = 8; m = np.zeros((h, w_), np.float32)
    if arc is None and dash is None: cv2.circle(m, (int(cx * S8), int(cy * S8)), int(r * S8), 1.0, w, cv2.LINE_AA, shift=3)
    else:
        a0, a1 = (0, 360) if arc is None else arc; step = 1.0
        angs = np.arange(a0, a1 + step, step)
        pts = np.stack([cx + np.sin(np.deg2rad(angs + rot)) * r, cy - np.cos(np.deg2rad(angs + rot)) * r], 1)
        if dash:
            on, off = dash; per = on + off
            for i in range(len(pts) - 1):
                if (angs[i] - a0) % per < on: cv2.line(m, tuple((pts[i] * S8).astype(int)), tuple((pts[i + 1] * S8).astype(int)), 1.0, w, cv2.LINE_AA, shift=3)
        else: cv2.polylines(m, [(pts * S8).astype(np.int32)], False, 1.0, w, cv2.LINE_AA, shift=3)
    for i in range(ticks):
        an = np.deg2rad(rot + 360 * i / ticks); L_ = tick_len * (2.2 if i % 5 == 0 else 1)
        p0 = (cx + np.sin(an) * r, cy - np.cos(an) * r); p1 = (cx + np.sin(an) * (r + L_), cy - np.cos(an) * (r + L_))
        cv2.line(m, (int(p0[0] * S8), int(p0[1] * S8)), (int(p1[0] * S8), int(p1[1] * S8)), 1.0, max(1, w - 1), cv2.LINE_AA, shift=3)
    return c + (col - c) * (m * a)[..., None]

def spark(c, x, y, col, k=1.0, r1=8, r2=36):
    h, w_ = c.shape[:2]; yy_, xx_ = np.mgrid[0:h, 0:w_].astype(np.float32); q = (xx_ - x) ** 2 + (yy_ - y) ** 2
    g = np.exp(-q / (2 * r1 ** 2))[..., None]; g2 = np.exp(-q / (2 * r2 ** 2))[..., None]
    return c + (255 - c) * g * 0.9 * k + (col - c) * g2 * 0.4 * k

def grade(img, k=0.38):
    k = k * {'A': 1.0, 'B': 1.25, 'C': 1.8}[K]
    L = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255
    duo = d['depth'][0] + (d['text'] - d['depth'][0]) * np.clip(L * 1.1, 0, 1)
    return img * (1 - k) + duo * k

def cover_fit(img, w, h, fy=0.5, fx=0.5, z=1.0):
    ih, iw = img.shape[:2]; s = max(w / iw, h / ih) * z
    r = cv2.resize(img, (int(iw * s + 0.5), int(ih * s + 0.5)), interpolation=cv2.INTER_AREA).astype(np.float32)
    y0 = int((r.shape[0] - h) * fy); x0 = int((r.shape[1] - w) * fx)
    return r[y0:y0 + h, x0:x0 + w]

_AV = {}
def avatar(size):
    if size not in _AV:
        L = cv2.imread(B + f'cache/{K}_refined.png').astype(np.float32)
        crop, m = circle_crop(L, R_OUT + 34, out=size)
        _AV[size] = np.dstack([crop, m])
    return _AV[size]

def put_avatar(c, size=118, x=118, y=348):
    av = avatar(size)
    ring_ = np.dstack([np.broadcast_to(d['gold'], av.shape[:2] + (3,)).astype(np.float32),
                       cv2.dilate(av[..., 3], np.ones((3, 3), np.uint8), iterations=3) - av[..., 3] * 0.0])
    c = paste(c, np.dstack([np.zeros(av.shape[:2] + (3,), np.float32), cv2.GaussianBlur(av[..., 3], (0, 0), 8) * 0.6]), x + 4, y + 8)
    c = paste(c, ring_, x, y); return paste(c, av, x, y)

def plate(w, h, r, col, a=0.84, edge=None):
    m = round_mask(w, h, r); img = np.broadcast_to(col, (h, w, 3)).astype(np.float32).copy()
    if edge is not None:
        e = np.zeros((h, w), np.float32); e[:3] = 1; e *= m; img = img * (1 - e[..., None]) + edge * e[..., None]
    return np.dstack([img, m * a])

def metal_text(runs_txt, fk, size, stops, stroke_col=None):
    a = text([(runs_txt, np.full(3, 255.0))], fk, size)[..., 3]
    rgba = metal_fill(a, stops, angle=90)
    sh = bevel(a, depth=5); rgba[..., :3] = np.clip(rgba[..., :3] + sh[..., None] * 55, 0, 255)
    return rgba

def credit(txt, size=30):
    im = text([(txt, d['text'])], 'almarai', size); h, w = im.shape[:2]
    P = plate(w + 44, h + 18, (h + 18) // 2, d['bg'], 0.78)
    rgb = paste(P[..., :3].copy(), im, (w + 44) / 2, (h + 18) / 2)
    al = np.maximum(P[..., 3], 0); return np.dstack([rgb, al])

def finish(c, grain=3.0, seed=0):
    g = np.random.default_rng(seed).standard_normal(c.shape[:2] + (1,)).astype(np.float32) * grain
    return np.clip(c + g, 0, 255)

# ---------------------------------------------------------------- 1 logo square
def f_logo():
    L = cv2.imread(B + f'cache/{K}_refined.png').astype(np.float32)
    return cv2.resize(L, (1080, 1080), interpolation=cv2.INTER_AREA)

# ---------------------------------------------------------------- 2 caption frame (Dhawila gathering still, real narration)
def f_caption():
    img = cv2.imread(S_ + 'dw/anim/img/D_nf_x2.png').astype(np.float32)
    c = grade(cover_fit(img, W, H, fy=0.4), 0.30)
    band = np.clip((mg.yy - 1050) / 500, 0, 1)[..., None] ** 1.3
    c = c * (1 - 0.55 * band) + d['bg'] * 0.55 * band * 0
    c = c * (1 - 0.45 * band)
    words = [('أمام', d['text']), ('رائد', d['text']), ('ورفاقه', d['text']), ('سؤال', d['gold']), ('صعب', d['ember'])]
    FS = 70; ln = rtl_line(words, 'almarai', FS)
    h, w = ln.shape[:2]; y = 1330; X = 500
    c = paste(c, plate(w + 50, h + 22, 32, d['bg'], 0.84, edge=d['gold'] * 0.9), X, y)
    c = paste(c, ln, X, y)
    # active word marker under «صعب» (left-most word)
    f = font('almarai', FS); wl = f.getlength('صعب', direction='rtl', language='ar')
    x_left = X - w / 2 + 16
    m = np.zeros((H, W), np.float32); cv2.line(m, (int((x_left + 4) * 8), int((y + 36) * 8)), (int((x_left + wl - 4) * 8), int((y + 36) * 8)), 1.0, 5, cv2.LINE_AA, shift=3)
    c = c + (d['ember'] - c) * m[..., None]
    c = put_avatar(c)
    return finish(c, seed=2)

# ---------------------------------------------------------------- 3 thumbnail / Reels cover (owner's own title)
def f_thumb():
    img = cv2.imread(S_ + 'dw/anim/img/A_x2.png').astype(np.float32)
    c = grade(cover_fit(img, W, H, fy=0.3), 0.32)
    band = np.clip((mg.yy - 820) / 700, 0, 1)[..., None]
    c = c * (1 - 0.62 * band) + d['bg'] * 0.62 * band
    mx, my = 778, 226                                                       # the moon
    for r, a, w, tk in ((120, 0.85, 3, 0), (165, 0.45, 2, 60), (250, 0.28, 2, 0), (360, 0.16, 2, 0)):
        c = ring(c, mx, my, r, d['gold'], a, w, ticks=tk, tick_len=8)
    c = ring(c, mx, my, 205, d['gold'], 0.9, 4, arc=(-40, 210))
    c = spark(c, mx + np.sin(np.deg2rad(210)) * 205, my - np.cos(np.deg2rad(210)) * 205, d['gold'], 0.9)
    t1 = text([('معركة', d['text'])], 'naskh', 150)
    t2 = metal_text('ضاويله', 'naskh', 250, d['metal'])
    t3 = text([('الليلية', d['text'])], 'naskh', 140)
    for img_, y in ((t1, 1010), (t2, 1210), (t3, 1405)):
        c = paste(c, np.dstack([np.zeros(img_.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img_[..., 3], (0, 0), 14) * 0.8]), 546, y + 14)
        c = paste(c, img_, 540, y)
    sl = text([('كلنا مقاومة', d['text'])], 'almarai', 46); ys = 1520
    c = paste(c, sl, 540, ys)
    hw = sl.shape[1] / 2 + 26
    for sg in (-1, 1):
        m = np.zeros((H, W), np.float32); cv2.line(m, (int((540 + sg * hw) * 8), ys * 8), (int((540 + sg * (hw + 110)) * 8), ys * 8), 1.0, 3, cv2.LINE_AA, shift=3)
        c = c + (d['gold'] - c) * m[..., None]
    c = put_avatar(c)
    return finish(c, seed=3)

# ---------------------------------------------------------------- 4 carousel slide 4:5 (speaker's exact words, credited)
def f_carousel():
    w, h = 1080, 1350
    c = vignette(grunge(h, w, d, seed=11), 0.4)
    for r, a, wd, tk in ((330, 0.5, 2, 72), (420, 0.3, 2, 0), (520, 0.18, 2, 0)):
        c = ring(c, 1010, 250, r, d['steel'], a, wd, ticks=tk, tick_len=8)
    c = ring(c, 1010, 250, 375, d['gold'], 0.95, 4, arc=(150, 330))
    c = spark(c, 1010 + np.sin(np.deg2rad(150)) * 375, 250 - np.cos(np.deg2rad(150)) * 375, d['gold'], 0.8)
    idx = text([('١ / ٥', d['steel'] + (d['text'] - d['steel']) * 0.4)], 'almarai', 40); c = paste(c, idx, 120, 110)
    t1 = text([('سجل', d['text']), ('يا تاريخ', d['gold'])], 'naskh', 160)
    c = paste(c, np.dstack([np.zeros(t1.shape[:2] + (3,), np.float32), cv2.GaussianBlur(t1[..., 3], (0, 0), 12) * 0.7]), 1000 - t1.shape[1] / 2 + 6, 400 + 12)
    c = paste(c, t1, 1000 - t1.shape[1] / 2, 400)
    m = np.zeros((h, w), np.float32); cv2.line(m, (int(1000 * 8), int(520 * 8)), (int(820 * 8), int(520 * 8)), 1.0, 4, cv2.LINE_AA, shift=3); c = c + (d['gold'] - c) * m[..., None]
    body = 'أن أول منجزٍ صنعته {{أكذوبة}} «المسيرة القرآنية» التابعة للحركة الحوثية الإرهابية، هي [[إغلاق مراكز تحفيظ القرآن الكريم]]'
    FB = 62 if SEC == 'amiri' else 54
    lines = wrap(tokens(body, d['text'], (d['gold'], d['ember'])), SEC, FB, 880)
    y = 640
    for runs in lines:
        li = rtl_line(runs, SEC, FB); c = paste(c, li, 1000 - li.shape[1] / 2, y); y += int(FB * 1.7)
    # footer: mark + name + next arrow
    av = avatar(96); c = paste(c, av, 1000 - 48, 1230)
    nm = text([('الكلمة مقاومة', d['text'])], 'almarai', 40); c = paste(c, nm, 1000 - 110 - nm.shape[1] / 2, 1230)
    cr = credit('المصدر: نفحات جهادية', 28); c = paste(c, cr, 80 + cr.shape[1] / 2 + 120, 1230)
    m = np.zeros((h, w), np.float32); ax, ay = 110, 1230                    # ← next (RTL swipe)
    cv2.line(m, ((ax + 40) * 8, ay * 8), ((ax - 30) * 8, ay * 8), 1.0, 5, cv2.LINE_AA, shift=3)
    cv2.line(m, ((ax - 30) * 8, ay * 8), ((ax - 8) * 8, (ay - 22) * 8), 1.0, 5, cv2.LINE_AA, shift=3)
    cv2.line(m, ((ax - 30) * 8, ay * 8), ((ax - 8) * 8, (ay + 22) * 8), 1.0, 5, cv2.LINE_AA, shift=3)
    c = c + (d['gold'] - c) * m[..., None]
    return finish(c, seed=4)

# ---------------------------------------------------------------- 5 motion-graphic frame: rings + circular masks + gold line drawing
def f_motion():
    c = vignette(grunge(H, W, d, seed=21), 0.5, 540, 820)
    cap = cv2.VideoCapture(S_ + 'v10/src/in_h264.mp4'); cap.set(cv2.CAP_PROP_POS_MSEC, 3400); ok, fr = cap.read()
    D_ = 720; fr = grade(fr.astype(np.float32), 0.22); ph = cover_fit(fr, D_, D_, fy=0.55, fx=0.5, z=1.0)
    cx, cy = 540, 800
    for r, a, wd, tk, rot in ((410, 0.45, 2, 120, 3), (470, 0.30, 2, 72, -2), (560, 0.18, 2, 0, 0), (690, 0.10, 2, 0, 0)):
        c = ring(c, cx, cy, r, d['steel'], a, wd, ticks=tk, tick_len=7, rot=rot)
    c = paste(c, np.dstack([np.zeros((D_, D_, 3), np.float32), cv2.GaussianBlur(round_mask(D_, D_, D_ // 2), (0, 0), 18) * 0.7]), cx + 8, cy + 18)
    c = paste(c, np.dstack([ph, round_mask(D_, D_, D_ // 2)]), cx, cy)
    c = ring(c, cx, cy, D_ / 2 + 4, d['gold'], 1.0, 5)
    c = ring(c, cx, cy, 440, d['gold'], 1.0, 4, arc=(-30, 235))                 # line being drawn
    hx_, hy_ = cx + np.sin(np.deg2rad(235)) * 440, cy - np.cos(np.deg2rad(235)) * 440
    c = spark(c, hx_, hy_, d['gold'], 1.0)
    q = cv2.imread(S_ + 'mg/broll/qpage.jpg').astype(np.float32); d2 = 250; qp = cover_fit(grade(q, 0.3), d2, d2, fy=0.4)
    c = paste(c, np.dstack([np.zeros((d2, d2, 3), np.float32), cv2.GaussianBlur(round_mask(d2, d2, d2 // 2), (0, 0), 12) * 0.7]), 850 + 6, 1110 + 12)
    c = paste(c, np.dstack([qp, round_mask(d2, d2, d2 // 2)]), 850, 1110)
    c = ring(c, 850, 1110, d2 / 2 + 3, d['gold'], 1.0, 4)
    c = ring(c, 850, 1110, d2 / 2 + 26, d['steel'], 0.6, 2, dash=(6, 6))
    t1 = text([('كيف يا', d['text']), ('قرآنُ', d['gold'])], 'naskh', 132)
    t2 = text([('ربّيتَ', d['text']), ('الرجال', d['gold'])], 'naskh', 150)
    for im_, y in ((t1, 1330), (t2, 1480)):
        c = paste(c, np.dstack([np.zeros(im_.shape[:2] + (3,), np.float32), cv2.GaussianBlur(im_[..., 3], (0, 0), 12) * 0.75]), 546, y + 12)
        c = paste(c, im_, 540, y)
    c = put_avatar(c)
    cr = credit('المصدر: مركز دار القرآن', 28); c = paste(c, cr, 120 + cr.shape[1] / 2 - 40, 430)
    return finish(c, seed=5)

# ---------------------------------------------------------------- 6 3D typography: the logo's OWN letterforms, extruded
def f_3d():
    L = cv2.imread(B + f'cache/{K}_refined.png').astype(np.float32)
    c = np.zeros((H, W, 3), np.float32)
    G = grad(d['depth'], H); c[:] = G[:, None, :] * 0.85
    c = c * (0.9 + 0.1 * grunge(H, W, d, seed=31) / 255 * 2)
    # floor rings in perspective
    m = np.zeros((H, W), np.float32)
    for i, r in enumerate((180, 300, 440, 600, 780, 980)):
        cv2.ellipse(m, (540 * 8, 1560 * 8), (int(r * 8), int(r * 0.24 * 8)), 0, 0, 360, 1.0 - i * 0.12, 2, cv2.LINE_AA, shift=3)
    c = c + (d['steel'] - c) * (m * 0.55)[..., None]
    m = np.zeros((H, W), np.float32); cv2.ellipse(m, (540 * 8, 1560 * 8), (440 * 8, int(440 * 0.24 * 8)), 0, 200, 340, 1.0, 4, cv2.LINE_AA, shift=3)
    c = c + (d['gold'] - c) * m[..., None]
    glow = np.exp(-((mg.xx - 540) ** 2 / (2 * 520 ** 2) + (mg.yy - 900) ** 2 / (2 * 520 ** 2)))[..., None]
    c = c + (d['steel'] - c) * glow * 0.25
    metal = d['metal']
    for (y0, y1), cy, sc in (((100, 480), 700, 1.0), ((1580, 1970), 1150, 1.0)):
        mt = M_TEXT.copy(); mt[:y0] = 0; mt[y1:] = 0
        ys, xs = np.where(mt > 0.02); a0, a1, b0, b1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5
        face = np.dstack([L[a0:a1, b0:b1], mt[a0:a1, b0:b1]])
        s = 960 / face.shape[1]
        face = cv2.resize(face, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        fa = face[..., 3]; sh = bevel(fa, depth=4, k=0.6); face[..., :3] = np.clip(face[..., :3] + sh[..., None] * 40, 0, 255)
        ex = extrude(face, depth=44, dir=(0.18, 1.0), side_top=metal[2] * 0.95, side_bot=metal[0] * 0.55, step=1)
        # perspective tilt (top recedes)
        hh, ww = ex.shape[:2]; k = 0.06
        src = np.float32([[0, 0], [ww, 0], [ww, hh], [0, hh]]); dst = np.float32([[ww * k, 0], [ww * (1 - k), 0], [ww, hh], [0, hh]])
        ex = cv2.warpPerspective(ex, cv2.getPerspectiveTransform(src, dst), (ww, hh), flags=cv2.INTER_LINEAR)
        c = paste(c, np.dstack([np.zeros(ex.shape[:2] + (3,), np.float32), cv2.GaussianBlur(ex[..., 3], (0, 0), 22) * 0.75]), 540 + 18, cy + 40)
        c = paste(c, ex, 540, cy)
    # rim light sweep
    c = put_avatar(c)
    return finish(c, seed=6)

FUN = dict(logo=f_logo, caption=f_caption, thumb=f_thumb, carousel=f_carousel, motion=f_motion, type3d=f_3d)
if __name__ == '__main__':
    which = ARGV[2:] or list(FUN)
    for n in which:
        save(FUN[n](), OUT + f'{K}_{n}.jpg', 94); print('ok', K, n)
