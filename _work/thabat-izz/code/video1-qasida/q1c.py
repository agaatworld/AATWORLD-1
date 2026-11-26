# VIDEO 1 — v3 after the owner's notes: no rings; the whole line sits in ONE navy caption card, either under the face or above it
# (never split around the face); in tight close-ups the two hemistichs sit side by side in one row. Bright, warm cinematic grade
# (shadows opened, soft highlights, lifted blacks, gentle bloom) instead of the dark navy grade.
import sys, os
_argv3_ = list(sys.argv)
import q1b
from q1b import *
import q1
sys.argv = _argv3_

# ---------------------------------------------------------------- grade: bright cinematic
def bright(f):
    x = f / 255.0
    L = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])
    s = cv2.resize(L, (135, 240), interpolation=cv2.INTER_AREA); s = cv2.GaussianBlur(s, (0, 0), 5)
    Lb = cv2.resize(s, (x.shape[1], x.shape[0]), interpolation=cv2.INTER_LINEAR)[..., None]
    kc = np.clip((Lb - 0.02) / 0.22, 0.18, 1.0); x = L[..., None] + (x - L[..., None]) * kc          # dark areas carry the camera's green noise: neutralise before lifting
    gain = np.clip((0.62 / (Lb + 0.045)) ** 0.84, 1.0, 3.6)
    sm = cv2.resize(x.astype(np.float32), (540, 960), interpolation=cv2.INTER_AREA)       # edge-preserving clean-up of the compression blocks the lift would reveal
    sm = cv2.bilateralFilter(sm, 9, 0.035, 5); sm = cv2.bilateralFilter(sm, 9, 0.025, 9)
    lh = cv2.resize(L.astype(np.float32), (540, 960), interpolation=cv2.INTER_AREA)
    tex = cv2.GaussianBlur(np.abs(cv2.Sobel(lh, cv2.CV_32F, 1, 0)) + np.abs(cv2.Sobel(lh, cv2.CV_32F, 0, 1)), (0, 0), 5)
    flat = np.clip(1.0 - tex / 0.05, 0, 1)[..., None]                                     # flat, out-of-focus areas (the roof lining)
    bb = cv2.GaussianBlur(sm, (0, 0), 7); w2 = flat * np.clip(1 - np.abs(bb - sm).max(axis=2, keepdims=True) / 0.025, 0, 1)   # only small steps (blocks), never real edges
    sm = sm * (1 - w2) + bb * w2
    sm = cv2.resize(sm, (x.shape[1], x.shape[0]), interpolation=cv2.INTER_LINEAR)
    wd = np.clip((gain - 1.5) / 2.0, 0, 0.95); x = x * (1 - wd) + sm * wd
    x = x * gain              # open the dark car interior locally
    x = x * (1 + x / 2.0 ** 2) / (1 + x) * 1.42                                         # filmic shoulder: bright windows stay soft
    x = 0.08 + x * 0.92                                                                 # lifted blacks
    L2 = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    x = L2 + (x - L2) * 0.90
    sh = np.clip(1 - L2 * 1.6, 0, 1); hi = np.clip((L2 - 0.55) * 2.2, 0, 1)
    x = x + (C('34486E') / 255 - x) * 0.10 * sh + (C('F6E9CE') / 255 - x) * 0.12 * hi   # cool shadows, warm parchment highlights
    bl = cv2.GaussianBlur(np.clip(x - 0.75, 0, 1), (0, 0), 20); x = 1 - (1 - x) * (1 - bl * 0.6)
    return np.clip(x * 255, 0, 255)

# ---------------------------------------------------------------- caption card layouts
CARD_X0, CARD_X1 = 110, 970                      # 860 wide, centred on 540, inside the right safe zone
TXT_W = 780                                      # text width inside the card
TOP_Y, BOT_Y = 452, 1492                         # card top edge (top zone) / bottom edge (bottom zone)
PAD = 26
def fit(words, maxw, cap):
    f = font('naskh', 100); wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]
    tot = sum(wl) + 32 * (len(wl) - 1); return int(min(cap, 100 * maxw / tot))
def row_at(words, size, cx, cy, cols):
    f = font('naskh', size); sp = size * 0.32; wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]
    tot = sum(wl) + sp * (len(wl) - 1); x = cx + tot / 2; out = []
    for w, l, col in zip(words, wl, cols): out.append((wim(w, size, col), x - l / 2, cy)); x -= l + sp
    return out, tot
def cols(words, base, ember): return [EMBER if w in ember else base for w in words]

def build(L, mode, zone):
    """mode '2' = two rows (صدر ivory over عجز bronze), 'S' = side by side in one row; zone 'B' or 'T'"""
    W1, W2 = L['words'][:L['cut']], L['words'][L['cut']:]; ember = set(KEY.get(L['n'], []))
    if not W1: mode = '1'
    if mode == '2':
        S = min(fit(W1, TXT_W, 96), fit(W2, TXT_W, 96)); pitch = S * 1.24; h = pitch + S * 1.25 + 2 * PAD
    elif mode == 'S':
        S = min(fit(W1, 370, 80), fit(W2, 370, 80)); h = S * 1.25 + 2 * PAD
    else:
        S = fit(W2, TXT_W, 96); h = S * 1.25 + 2 * PAD
    y0 = TOP_Y if zone == 'T' else BOT_Y - h; cy = y0 + h / 2
    items = []
    if mode == '2':
        items += row_at(W1, S, CX, cy - pitch / 2, cols(W1, PARCH, ember))[0]
        items += row_at(W2, S, CX, cy + pitch / 2, cols(W2, BRONZE_L, ember))[0]
    elif mode == 'S':
        items += row_at(W1, S, CX + 215, cy, cols(W1, PARCH, ember))[0]          # صدر on the right
        items += row_at(W2, S, CX - 215, cy, cols(W2, BRONZE_L, ember))[0]       # عجز on the left
    else:
        items += row_at(W2, S, CX, cy, cols(W2, PARCH, ember))[0]
    return dict(mode=mode, zone=zone, y0=y0, h=h, cy=cy, items=items)

def overlap(L, y0, y1):
    ks = range(int(L['a'] * FPS), int(min(L['b'] + 0.3, DUR - 0.1) * FPS), 2); s = 0
    for k in ks:
        fx, fy, fh = face(k); s += max(0, min(fy + fh * 0.50, y1 + 12) - max(fy - fh * 0.52, y0 - 12))
    return s / max(1, len(ks))

LAYOUT = []
for L in LN:
    best = None
    for mode, pen in (('2', 0),):
        for zone, zp in (('B', 0), ('T', 6)):
            g = build(L, mode, zone); sc = overlap(L, g['y0'], g['y0'] + g['h']) + pen + zp
            if best is None or sc < best[0]: best = (sc, g)
    LAYOUT.append(best[1])

# ---------------------------------------------------------------- card drawing
_RM = {}
def rmask(w, h, r=22):
    key = (w, h)
    if key not in _RM:
        m = np.zeros((h * 4, w * 4), np.uint8); R = r * 4
        cv2.rectangle(m, (R, 0), (w * 4 - R, h * 4), 255, -1); cv2.rectangle(m, (0, R), (w * 4, h * 4 - R), 255, -1)
        for cx_, cy_ in ((R, R), (w * 4 - R, R), (R, h * 4 - R), (w * 4 - R, h * 4 - R)): cv2.circle(m, (cx_, cy_), R, 255, -1)
        _RM[key] = cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    return _RM[key]
NAVY_T, NAVY_B = C('16213A'), C('0B1222')
def draw_card(c, y0, h, a, mode):
    if a <= 0.01: return c
    y0 = int(round(y0)); h = int(round(h)); w = CARD_X1 - CARD_X0
    m = rmask(w, h)
    # soft shadow
    sp = 30; Y0, Y1 = max(0, y0 - sp), min(H, y0 + h + sp + 12)
    sh = np.zeros((Y1 - Y0, W), np.float32); sh[y0 + 10 - Y0:y0 + 10 + h - Y0, CARD_X0:CARD_X1] = m
    sh = cv2.GaussianBlur(sh, (0, 0), 14) * 0.30 * a; c[Y0:Y1] = c[Y0:Y1] * (1 - sh[..., None])
    reg = c[y0:y0 + h, CARD_X0:CARD_X1]
    gy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]; fill = NAVY_T + (NAVY_B - NAVY_T) * gy
    al = (m * 0.84 * a)[..., None]; reg = reg * (1 - al) + fill * al
    edge = (m - cv2.erode(m, np.ones((3, 3), np.uint8), iterations=1))[..., None] * 0.9 * a
    reg = reg + (BRONZE_L - reg) * edge
    if mode == 'S':                                                                     # a small bronze diamond between the hemistichs
        cy = h // 2; d = 9
        pts = np.array([[540 - CARD_X0, cy - d], [540 - CARD_X0 + d, cy], [540 - CARD_X0, cy + d], [540 - CARD_X0 - d, cy]], np.int32)
        dm = np.zeros((h, w), np.float32); cv2.fillConvexPoly(dm, pts, 1.0, cv2.LINE_AA); reg = reg + (BRONZE_L - reg) * (dm * a)[..., None]
    c[y0:y0 + h, CARD_X0:CARD_X1] = reg
    return c

def span(i):
    """when line i's card is on screen, and whether it hands over (same zone) to the next card without a fade"""
    L = LN[i]; nxt = LN[i + 1] if i + 1 < len(LN) else None
    if nxt is not None and nxt['a'] - L['b'] < 1.2:
        end = nxt['a'] - 0.15; hand = LAYOUT[i + 1]['zone'] == LAYOUT[i]['zone']
    else:
        end = L['b'] + 0.45; hand = False
    return end, hand

PEAK = (87.74, 96.60)
def frame(k):
    t = k / FPS; F = frame_src(k)
    cur = None
    for i, L in enumerate(LN):
        if L['a'] - 0.15 <= t < (LN[i + 1]['a'] if i + 1 < len(LN) else DUR): cur = i
    z = 1.0
    if cur is not None:
        L = LN[cur]; z += 0.025 * eio(seg(t, L['a'], L['b']))
        if PEAK[0] <= t < PEAK[1]: z += 0.06 * eio(seg(t, PEAK[0], 92.6)) - 0.03 * eio(seg(t, 92.6, PEAK[1]))
    for i in KEY:
        L = LN[i - 1]
        for w, s0 in zip(L['words'], L['st']):
            if w in KEY[i] and t >= s0: z += 0.012 * np.exp(-(t - s0) / 0.14)
    fx, fy, fh = face(k)
    if z > 1.0005: F = cv2.warpAffine(F, cv2.getRotationMatrix2D((fx, fy), 0, z), (W, H), borderMode=cv2.BORDER_REFLECT)
    c = bright(F)
    # cards
    for i, L in enumerate(LN):
        G = LAYOUT[i]; end, hand = span(i)
        prev_hand = i > 0 and span(i - 1)[1]
        t0 = L['a'] - 0.15
        if not (t0 - 0.2 <= t < end + 0.25): continue
        if prev_hand:
            Gp = LAYOUT[i - 1]; p = ease(seg(t, t0, t0 + 0.25)); a_in = 1.0 if t >= t0 else 0.0
            y0 = Gp['y0'] + (G['y0'] - Gp['y0']) * p; h = Gp['h'] + (G['h'] - Gp['h']) * p
        else:
            a_in = ease(seg(t, t0 - 0.05, t0 + 0.15)); y0, h = G['y0'], G['h']
        a_out = 0.0 if (hand and t >= end) else 1 - ease(seg(t, end, end + 0.25))
        c = draw_card(c, y0, h, a_in * a_out, G['mode'] if not prev_hand or t >= t0 + 0.25 else 'none')
    # words
    for i, L in enumerate(LN):
        if not (L['a'] - 0.15 <= t < L['b'] + 0.5): continue
        po = ease(seg(t, L['b'] + 0.05, L['b'] + 0.35))
        if i + 1 < len(LN): po = max(po, ease(seg(t, LN[i + 1]['a'] - 0.2, LN[i + 1]['a'] - 0.05)))
        ember = set(KEY.get(L['n'], []))
        for wi, (img, x, y) in enumerate(LAYOUT[i]['items']):
            s0 = L['st'][wi]; w = L['words'][wi]
            if t < s0 - 0.04: continue
            q = t - s0; a = min(1, q / 0.10) * (1 - po)
            if a <= 0.01: continue
            if w in ember:
                s = 1 + 0.30 * (1 - ease(q / 0.16)); c = mg.put(c, img, x, y, s, a)
            else:
                dy = 10 * (1 - ease(q / 0.22))
                c = mg.put(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 6) * 0.45]), x + 3, y + 5 + dy, 1.0, a)
                c = mg.put(c, img, x, y + dy, 1.0, a)
    c = mg.put(c, LOGO118, 118, 348)
    fo = ease(seg(t, 118.0, DUR)); c = c * (1 - 0.9 * fo)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 2.0
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    import subprocess
    mode = _argv3_[1]
    if mode == 'still':
        os.makedirs(Q + 'st3', exist_ok=True)
        for ts in _argv3_[2:]: q1.CAP = None; cv2.imwrite(Q + f'st3/s_{float(ts):06.2f}.jpg', frame(int(float(ts) * FPS)))
    elif mode == 'render':
        part, n = int(_argv3_[2]), int(_argv3_[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts3', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', Q + f'parts3/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif mode == 'dump':
        for L, G in zip(LN, LAYOUT): print(L['n'], round(L['a'], 2), G['mode'], G['zone'], int(G['y0']), int(G['h']))
