# VIDEO 2 v2 «صوت القائد» — the owner's corrected words, built to hit hard:
# her real footage, cinematic depth grade (background darkened, cooled and softened by a depth map, warm key light on her),
# a slow push-in with jolts on the strong words; the words stack in a column in the free space on the LEFT (her face always to the right of it).
# Every word enters with its own strike (slide / slam / drop / rise / pop) plus a visual echo (ghost copies expanding) that matches the audio echo,
# bronze lines shooting in, a spine that grows with the rows. Sentence 1 ivory/bronze with ember peaks; sentence 2 forged metal (steel, then bronze).
import sys, os, json
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand')
_a = list(sys.argv); sys.argv = [_a[0], 'B']
from km import *
sys.argv = _a; A = _a
import mg, subprocess
Q = os.path.dirname(os.path.abspath(__file__)) + '/'
W, H, FPS = 1080, 1920, 30; NF = 301; DUR = NF / FPS
xx, yy = mg.xx, mg.yy

# ---------------------------------------------------------------- source, depth, face
cap = cv2.VideoCapture(Q + '../q2/src.mp4'); SRC = []
while True:
    ok, f = cap.read()
    if not ok: break
    SRC.append(f)
DEP = np.load(Q + 'depth.npz')['d']
FACES = json.load(open(Q + 'faces.json'))
fc = np.array([[r[0] + r[2] / 2, r[1] + r[3] / 2, r[3]] for r in FACES], np.float32)
from scipy.ndimage import gaussian_filter1d
FCS = gaussian_filter1d(fc, 4, axis=0)
S0, OX, OY = 2.5, -185.0, 300.0                       # footage scale and placement: face lands at x 550–990, the left 0–515 is free for the words
EMBER = C('E8743B'); STEEL = (C('F2F5F8'), C('7E8A96'), C('D5DCE3')); BRZ = (C('F6E2B4'), C('9C7742'), C('E6C58E'))
INK2 = C('080D18')

def grade_src(k):
    f = SRC[min(k, len(SRC) - 1)].astype(np.float32) / 255
    d = DEP[min(k, len(DEP) - 1)].astype(np.float32) / 255
    near = np.clip((d - 0.50) / 0.18, 0, 1); near = cv2.GaussianBlur(near, (0, 0), 2.0)[..., None]
    L = (0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2])[..., None]
    # her: warm key light, a little more contrast and colour
    s = np.clip((f - 0.5) * 1.12 + 0.5, 0, 1); s = L + (s - L) * 1.06
    s = s * (1 - 0.08) + (BRONZE_L / 255) * 0.08 * L
    # the world behind her: darker, cooler, softer (depth of field) — the bright wall becomes a calm plane for the words
    b = cv2.GaussianBlur(f, (0, 0), 3.0); Lb = (0.114 * b[..., 0] + 0.587 * b[..., 1] + 0.299 * b[..., 2])[..., None]
    b = Lb + (b - Lb) * 0.45; b = np.where(b > 0.7, 0.7 + (b - 0.7) * 0.4, b)
    b = b * 0.48 + (C('1A2A44') / 255) * 0.20
    return (s * near + b * (1 - near)) * 255, near

FILL_CACHE = {}
def frame_plate(k, t, z, jx, jy):
    g, near = grade_src(k)
    fx, fy, fh = FCS[min(k, len(FCS) - 1)]
    cxs, cys = OX + S0 * fx, OY + S0 * fy                                              # face position on the canvas
    s = S0 * z
    M = np.float32([[s, 0, cxs - s * fx + jx], [0, s, cys - s * fy + jy]])
    main = cv2.warpAffine(g, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)          # beyond the picture: its own mirror image…
    ins = cv2.warpAffine(np.ones(g.shape[:2], np.uint8), M, (W, H), flags=cv2.INTER_NEAREST, borderValue=0)
    dist = cv2.distanceTransform((1 - ins).astype(np.uint8), cv2.DIST_L2, 3)
    sm = cv2.resize(cv2.GaussianBlur(cv2.resize(main, (W // 4, H // 4), interpolation=cv2.INTER_AREA), (0, 0), 5), (W, H), interpolation=cv2.INTER_LINEAR)
    o = np.clip(dist / 70, 0, 1)[..., None]; dk = np.clip(dist / 260, 0, 1)[..., None]
    c = main * (1 - o) + sm * o                                                                          # …softened as it leaves the frame…
    c = c * (1 - 0.72 * dk) + INK2 * 0.30 * dk                                                           # …and sinking into the dark
    # sharpen her a touch after the upscale
    nm = cv2.warpAffine(near[..., 0], M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
    bl = cv2.GaussianBlur(c, (0, 0), 2.2); c = c + (c - bl) * 0.55 * nm
    return c, (cxs + jx, cys + jy, fh * s)

# ---------------------------------------------------------------- words
W1 = [('كحلان', 0.88, 'slideL', PARCH, 0), ('عسير', 1.84, 'slam', EMBER, 2), ('مو', 2.28, 'drop', PARCH, 0),
      ('مو', 2.58, 'drop', BRONZE_L, 1), ('طلعك', 2.92, 'rise', BRONZE_L, 1), ('يا', 3.56, 'pop', BRONZE_L, 1), ('حوثي', 3.74, 'slam', EMBER, 2)]
ROWS1 = [[0], [1], [2], [3, 4], [5, 6]]; CAP1 = [150, 210, 140, 165, 195]
W2 = [('قافلة', 4.62, 'slam', 'steel', 3), ('حديد', 5.72, 'slam', 'steel', 3), ('ومندحة', 6.28, 'slideL', 'bronze', 3), ('حناشة', 6.86, 'slam', 'bronze', 3)]
ROWS2 = [[0], [1], [2], [3]]; CAP2 = [235, 250, 205, 235]
COLX, COLW = 278, 440                      # column centre and max width (x 58–498); the spine sits at x 528
X_SPINE = 528
OUT1 = (4.40, 4.62)                         # sentence 1 leaves, sentence 2 arrives

def metal(word, size, kind):
    a = rtl_line([(word, (255, 255, 255))], 'naskh', size)
    al = a[..., 3]; h = al.shape[0]
    top, mid, bot = STEEL if kind == 'steel' else BRZ
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    col = np.where(y < 0.55, top + (mid - top) * (y / 0.55), mid + (bot - mid) * ((y - 0.55) / 0.45))
    col = np.broadcast_to(col, al.shape + (3,)).copy()
    edge = np.clip(al - cv2.erode(al, np.ones((3, 3), np.uint8), iterations=2), 0, 1)[..., None]    # a bright forged edge
    col = col * (1 - edge * 0.5) + 255 * edge * 0.5
    return np.dstack([col, al])
_IMG = {}
def wimg(word, size, col):
    key = (word, size, col if isinstance(col, str) else tuple(col))
    if key not in _IMG:
        _IMG[key] = metal(word, size, col) if isinstance(col, str) else rtl_line([(word, col)], 'naskh', size)
    return _IMG[key]
_BK = {}
def backing(img):
    key = id(img)
    if key not in _BK:
        P = 40; a = np.pad(img[..., 3].astype(np.float32), P)
        st = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))), (0, 0), 1.2)
        halo = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))), (0, 0), 16) * 0.7
        _BK[key] = np.dstack([np.ones(a.shape + (3,), np.float32) * INK2, np.clip(np.maximum(st * 0.9, halo), 0, 1)])
    return _BK[key]

def x_ok(tot): return COLX + tot / 2 <= X_SPINE - 18
def layout(words, rows, sizes, y_mid):
    """rows of words centred on the column axis; equal optical gaps; returns per-word (img, x, y, size, row) and the row extents"""
    f_sp = 0.36; hts = [s * 1.05 for s in sizes]; gaps = [0.30 * min(a, b) for a, b in zip(sizes[:-1], sizes[1:])]
    total = sum(hts) + sum(gaps); y = y_mid - total / 2; out = {}; ext = []
    for r, (idx, sz) in enumerate(zip(rows, sizes)):
        cy = y + hts[r] / 2
        imgs = [wimg(words[i][0], sz, words[i][3]) for i in idx]
        f = font('naskh', sz); wl = [f.getlength(words[i][0], direction='rtl', language='ar') for i in idx]
        tot = sum(wl) + f_sp * sz * (len(idx) - 1)
        assert tot <= COLW + 1, (words[idx[0]][0], tot)
        assert x_ok(tot), tot
        x = COLX + tot / 2
        for i, im, l in zip(idx, imgs, wl): out[i] = (im, x - l / 2, cy, sz, r); x -= l + f_sp * sz
        ext.append((COLX - tot / 2, COLX + tot / 2, cy - sz * 0.5, cy + sz * 0.5))
        y += hts[r] + (gaps[r] if r < len(gaps) else 0)
    return out, ext
def sizes_for(words, rows, caps, maxh=1010, maxw=410):
    """each row as large as the column allows (up to its cap), then all scaled together so the stack fits the height"""
    out = []
    for idx, cap in zip(rows, caps):
        f = font('naskh', 100); tot = sum(f.getlength(words[i][0], direction='rtl', language='ar') for i in idx) + 36 * (len(idx) - 1)
        out.append(int(min(cap, 100 * maxw / tot)))
    h = sum(s_ * 1.05 for s_ in out) + sum(0.30 * min(a, b) for a, b in zip(out[:-1], out[1:]))
    k = min(1.0, maxh / h); return [int(s_ * k) for s_ in out]
SIZE1 = sizes_for(W1, ROWS1, CAP1); SIZE2 = sizes_for(W2, ROWS2, CAP2)
L1, E1 = layout(W1, ROWS1, SIZE1, 975)
L2, E2 = layout(W2, ROWS2, SIZE2, 975)

def smax(img, x):
    """largest scale at which the word still stays left of the spine (never towards her)"""
    return max(1.0, (X_SPINE - 26 - x) / max(1.0, img.shape[1] / 2 - 16))
def strike(c, img, x, y, kind, q, a, strong, col_glow):
    """one word entering: kind of motion + visual echo"""
    if q < 0: return c
    cap_s = smax(img, x)
    if kind == 'slideL':
        p = ease(q / 0.24); dx = -300 * (1 - p)
        for j in range(4, 0, -1):                                                          # smear
            if p < 1: c = mg.put(c, img, x + dx - j * 26 * (1 - p), y, 1.0, a * 0.16 * (1 - p))
        c = mg.put(c, backing(img), x + dx, y, 1.0, a); c = mg.put(c, img, x + dx, y, 1.0, a)
    elif kind == 'slam':
        p = ease(q / 0.15); s = min(cap_s, 1 + 0.75 * (1 - p))
        c = mg.put(c, backing(img), x, y, s, a * p); c = mg.put(c, img, x, y, s, a * min(1, q / 0.06))
        fl = np.exp(-q / 0.09)                                                             # white-hot flash on impact
        if fl > 0.02: c = mg.put(c, np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * 255, img[..., 3]]), x, y, s, a * fl * 0.85)
    elif kind in ('drop', 'rise'):
        p = ease(q / 0.22); dy = (-110 if kind == 'drop' else 110) * (1 - p)
        c = mg.put(c, backing(img), x, y + dy, 1.0, a * p); c = mg.put(c, img, x, y + dy, 1.0, a * min(1, q / 0.08), blur=3 * (1 - p))
    else:                                                                                  # pop
        p = q / 0.20; s = min(cap_s, 0.55 + 0.6 * ease(p) - 0.15 * eio(seg(q, 0.12, 0.26)))
        c = mg.put(c, backing(img), x, y, s, a); c = mg.put(c, img, x, y, s, a)
    # visual echo: ghost copies expanding and fading, like the voice's echo
    n = 3 if strong else 2; life = 0.55 if strong else 0.45
    for j in range(1, n + 1):
        pe = seg(q, 0.04 * j, life + 0.04 * j)
        if 0 < pe < 1:
            c = mg.put(c, img, x, y, min(cap_s, 1 + (0.22 + 0.12 * strong) * j * ease(pe)), a * (0.34 / j) * (1 - pe) ** 1.5, glow=0)
    return c

def line_shot(c, x_end, y, q, col, w=3, strong=False):
    """a bronze line shoots in from the left edge to the word, then thins out"""
    if q < 0 or q > 0.7: return c
    p = ease(q / 0.16); fade = 1 - seg(q, 0.25, 0.7)
    x1 = 20 + (x_end - 20) * p
    c = hair(c, 20, y, x1, y, col, 0.9 * fade, w)
    if strong: c = hair(c, 20, y - 9, x1 * 0.8, y - 9, PARCH, 0.55 * fade, 2)
    return c

def frame(k, tt=None):
    t = k / FPS
    # camera: slow push on her, jolts on the strong words, a shake on «قافلة»
    z = 1.0 + 0.07 * eio(t / DUR); jx = jy = 0.0
    for w, s0, kind, col, st in W1 + W2:
        if st and t >= s0: z += (0.030 if st < 3 else 0.040) * np.exp(-(t - s0) / 0.13)
    if t >= 4.62:
        e = np.exp(-(t - 4.62) / 0.18); rng = np.random.default_rng(k); jx, jy = rng.uniform(-9, 9) * e, rng.uniform(-9, 9) * e
    c, (fcx, fcy, fsz) = frame_plate(k, t, z, jx, jy)
    # light: a warm key that breathes on her face, a cool rim of light falling from top-left over the wall
    kpulse = 0.10 + 0.10 * max([np.exp(-(t - s0) / 0.25) for w, s0, kind, col, st in W1 + W2 if st and t >= s0] + [0])
    g = np.exp(-(((xx - fcx) / 330) ** 2 + ((yy - fcy) / 380) ** 2))[..., None]
    c = c + (C('FFD9A0') - c) * g * kpulse
    beam = np.clip(1 - np.abs((xx - 0.55 * yy) - (40 + 60 * np.sin(t * 0.6))) / 260, 0, 1) * np.clip(1 - yy / 1500, 0, 1)
    c = c + (C('9FB4D6') - c) * (beam * 0.07)[..., None]
    if tt is not None: t = tt                                                            # cover: picture from frame k, words as at time tt
    # opening: rise from black
    c = c * (0.25 + 0.75 * ease(seg(t, 0.0, 0.8)))
    # global flash on the impacts
    fl = 0.0
    for w, s0, kind, col, st in W1 + W2:
        if st >= 2 and t >= s0: fl = max(fl, (0.10 if st == 2 else 0.14) * np.exp(-(t - s0) / 0.06))
    c = c + (255 - c) * fl
    c = vignette(c, 0.40)
    # spine: grows with the rows of the current sentence
    ext = E1 if t < OUT1[1] else E2
    sent = W1 if t < OUT1[1] else W2; rows = ROWS1 if t < OUT1[1] else ROWS2; LL = L1 if t < OUT1[1] else L2
    shown = [r for r, idx in enumerate(rows) if t >= sent[idx[0]][1] - 0.02]
    if shown:
        top = ext[0][2] - 20; bot_t = ext[shown[-1]][3] + 20
        r_last = shown[-1]; s_last = sent[rows[r_last][0]][1]; prev_bot = ext[r_last - 1][3] + 20 if r_last > 0 else top
        bot = prev_bot + (bot_t - prev_bot) * ease((t - s_last) / 0.25)
        fo = 1 - ease(seg(t, OUT1[0], OUT1[0] + 0.15)) if t < OUT1[1] else 1.0
        c = hair(c, X_SPINE, top, X_SPINE, bot, BRONZE_L, 0.85 * fo, 3)
        c = spark(c, X_SPINE, bot, BRONZE_L, 0.6 * fo, 3, 12)
    # sentence 1
    if t < OUT1[1] + 0.05:
        for i, (w, s0, kind, col, st) in enumerate(W1):
            img, x, y, sz, r = L1[i]; q = t - s0
            if q < -0.02: continue
            ox = 0.0; a = 1.0
            if t >= OUT1[0]:                                                              # exit: swept to the left, staggered by row
                pe = ease(seg(t, OUT1[0] + 0.025 * r, OUT1[0] + 0.025 * r + 0.16)); ox = -520 * pe; a = 1 - pe
                if a <= 0.01: continue
                c = mg.put(c, backing(img), x + ox, y, 1.0, a); c = mg.put(c, img, x + ox, y, 1.0, a, blur=6 * pe); continue
            c = strike(c, img, x, y, kind, q, a, st >= 1, col)
            c = line_shot(c, x + img.shape[1] / 2 - 20, y + sz * 0.56, q, EMBER if st == 2 else BRONZE_L, 3, st == 2)
    # sentence 2 — forged metal
    if t >= W2[0][1] - 0.02:
        for i, (w, s0, kind, col, st) in enumerate(W2):
            img, x, y, sz, r = L2[i]; q = t - s0
            if q < -0.02: continue
            c = strike(c, img, x, y, kind, q, 1.0, True, col)
            c = line_shot(c, x + img.shape[1] / 2 - 10, y + sz * 0.58, q, SILVER if col == 'steel' else BRONZE_L, 4, True)
            # sheen: a bright band sweeps across each metal word as it lands, and once more across all of them at the end
            for t0 in (s0 + 0.05, 8.3 + 0.12 * i):
                p = seg(t, t0, t0 + 0.45)
                if 0 < p < 1:
                    hw = img.shape[1]; band = np.exp(-((np.arange(hw, dtype=np.float32) - hw * (1.2 - 1.4 * p)) / (hw * 0.10)) ** 2)
                    sh = np.dstack([np.ones(img.shape[:2] + (3,), np.float32) * 255, img[..., 3] * band[None, :]])
                    c = mg.put(c, sh, x, y, 1.0, 0.55)
    c = mg.put(c, LOGO, 118, 348)
    gr = np.random.default_rng(1000 + k).standard_normal((H, W, 1)).astype(np.float32) * 3.0
    return np.clip(c + gr, 0, 255).astype(np.uint8)

LOGO = logo_rgba(118)
if __name__ == '__main__':
    if A[1] == 'still':
        os.makedirs(Q + 'st', exist_ok=True)
        for ts in A[2:]: cv2.imwrite(Q + f'st/s_{float(ts):05.2f}.jpg', frame(int(float(ts) * FPS)))
    elif A[1] == 'cover':
        k, tt, out = int(float(A[2]) * FPS), float(A[3]), A[4]
        cv2.imwrite(out, frame(k, tt), [cv2.IMWRITE_JPEG_QUALITY, 94])
    elif A[1] == 'render':
        part, n = int(A[2]), int(A[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', Q + f'parts/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif A[1] == 'faces':
        worst = 9999; bad = []
        for k in range(NF):
            t = k / FPS; z = 1.0 + 0.07 * eio(t / DUR)
            for w, s0, kind, col, st in W1 + W2:
                if st and t >= s0: z += (0.030 if st < 3 else 0.040) * np.exp(-(t - s0) / 0.13)
            fx, fy, fh = FCS[k]; left = OX + S0 * fx - z * S0 * fh * 0.55 - (9 if t >= 4.62 else 0)
            txt = max(e[1] for e in (E1 if t < OUT1[1] else E2))
            worst = min(worst, left - txt)
            if left < txt + 20: bad.append(k)
        print('closest face-to-text gap (px):', int(worst), ' frames under 20 px:', bad)
