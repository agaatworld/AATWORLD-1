# VIDEO 1 — v4: owner's rules «no captions on faces» + bright cinematic + no rings, for Facebook.
# Every caption card is tested against the tracked face in EVERY frame it is on screen (with a margin); only a placement with zero overlap is used.
# Order of preference: whole line (two rows) under the face → above it → hemistichs one after the other (one row each) → smaller type.
# All text stays inside Facebook's 4:5 feed crop (y 285–1635) and the Reels safe zones (top 270, bottom 420, right 120).
import sys, os
_argv4_ = list(sys.argv)
import q1c
from q1c import *
import q1
sys.argv = _argv4_

MARG = 12
def frect(k):
    fx, fy, fh = face(k); return fx - fh * 0.50, fy - fh * 0.50, fx + fh * 0.50, fy + fh * 0.54
FR = np.array([frect(k) for k in range(NF)])
def clear(t0, t1, x0, y0, x1, y1):
    k0, k1 = max(0, int(t0 * FPS)), min(NF, int(np.ceil(t1 * FPS)) + 1)
    r = FR[k0:k1]
    hx = (r[:, 0] < x1 + MARG) & (r[:, 2] > x0 - MARG); hy = (r[:, 1] < y1 + MARG) & (r[:, 3] > y0 - MARG)
    return not np.any(hx & hy), int(np.sum(hx & hy))

ZONES = [('B', 110, 970, None), ('T', 110, 970, 452), ('H', 190, 890, 296)]     # H: centred on 540, narrower so it never meets the logo     # bottom / top / high-top (narrower, clear of the logo)
def card_geom(rows, zone, size):
    """rows: list of (words, colour list). No box any more: returns the TEXT block's own bounds (used for the face test) and the word items"""
    name, x0, x1, ytop = zone; tw = (x1 - x0) - 40
    S = min([size] + [fit(w, tw, size) for w, _ in rows]); S = max(S, 56)
    pitch = S * 1.24; hb = int(pitch * (len(rows) - 1) + S * 1.30)               # text block height (ascenders..descenders)
    yb0 = (BOT_Y - 8 - hb) if name == 'B' else ytop; cx = (x0 + x1) / 2
    items = []; wmax = 0
    for j, (w, col) in enumerate(rows):
        cy = yb0 + S * 0.65 + pitch * j
        it, tot = row_at(w, S, cx, cy, col); items += it; wmax = max(wmax, tot)
    return yb0, hb, int(cx - wmax / 2 - 10), int(cx + wmax / 2 + 10), items, S

def line_span(i):
    L = LN[i]; nxt = LN[i + 1] if i + 1 < len(LN) else None
    end = nxt['a'] - 0.15 if (nxt is not None and nxt['a'] - L['b'] < 1.2) else min(L['b'] + 0.45, DUR)
    return L["a"] - 0.02, end

def place_chunk(L, i0, i1, colors, ta, tb, size, depth=0):
    """put words i0..i1 (one row) somewhere clear of the face for [ta, tb]; if impossible, split the chunk in two by time"""
    words = L['words'][i0:i1]
    for zz in ZONES:
        y0, h, x0, x1, items, S = card_geom([(words, colors)], zz, size)
        if clear(ta, tb, x0, y0, x1, y0 + h)[0]:
            return [dict(t0=ta, t1=tb, y0=y0, h=h, x0=x0, x1=x1, items=items, w0=i0, zone=zz[0], S=S)]
    if i1 - i0 < 2 or depth > 2: return None
    m = (i0 + i1) // 2; tm = L['st'][m] - 0.12
    if not (ta + 0.3 < tm < tb - 0.3): return None
    A = place_chunk(L, i0, m, colors[:m - i0], ta, tm, size, depth + 1); B = place_chunk(L, m, i1, colors[m - i0:], tm, tb, size, depth + 1)
    return A + B if A and B else None

def plan(i):
    L = LN[i]; t0, t1 = line_span(i); ember = set(KEY.get(L['n'], []))
    W1, W2 = L['words'][:L['cut']], L['words'][L['cut']:]; n1 = len(W1)
    c1 = cols(W1, PARCH, ember); c2 = cols(W2, BRONZE_L if W1 else PARCH, ember)
    whole = [(W1, c1), (W2, c2)] if W1 else [(W2, c2)]
    for size in (96, 88, 80):                                                              # the largest type that keeps every face clear
        for z in ZONES:
            y0, h, x0, x1, items, S = card_geom(whole, z, size)
            if clear(t0, t1, x0, y0, x1, y0 + h)[0]:
                return [dict(t0=t0, t1=t1, y0=y0, h=h, x0=x0, x1=x1, items=items, w0=0, zone=z[0], S=S)], 'whole', 0
        if W1:
            tc = L['st'][n1] - 0.12
            A = place_chunk(L, 0, n1, c1, t0, tc, size); B = place_chunk(L, n1, len(L['words']), c2, tc, t1, size)
            if A and B: return A + B, 'seq', 0
        else:
            A = place_chunk(L, 0, len(L['words']), c2, t0, t1, size)
            if A: return A, 'seq', 0
    for size in (72, 64, 56):
        if W1:
            tc = L['st'][n1] - 0.12
            A = place_chunk(L, 0, n1, c1, t0, tc, size); B = place_chunk(L, n1, len(L['words']), c2, tc, t1, size)
            if A and B: return A + B, 'seq', 0
    raise SystemExit('no clear placement for line %d' % L['n'])

PLAN = [plan(i) for i in range(len(LN))]
CARDS = []
for i, (cards, kind, bad) in enumerate(PLAN):
    for cd in cards: cd['line'] = i; CARDS.append(cd)
def same(a, b): return abs(a['y0'] - b['y0']) < 1 and abs(a['h'] - b['h']) < 1 and a['x0'] == b['x0'] and a['x1'] == b['x1']
for j, cd in enumerate(CARDS):
    pv = CARDS[j - 1] if j > 0 else None; nx = CARDS[j + 1] if j + 1 < len(CARDS) else None
    cd['cont_in'] = pv is not None and abs(pv['t1'] - cd['t0']) < 0.02 and same(pv, cd)
    cd['cont_out'] = nx is not None and abs(cd['t1'] - nx['t0']) < 0.02 and same(cd, nx)

def draw_card2(c, x0, x1, y0, h, a):
    if a <= 0.01: return c
    y0 = int(round(y0)); h = int(round(h)); w = x1 - x0; m = rmask(w, h)
    sp = 30; Y0, Y1 = max(0, y0 - sp), min(H, y0 + h + sp + 12)
    sh = np.zeros((Y1 - Y0, W), np.float32); sh[y0 + 10 - Y0:y0 + 10 + h - Y0, x0:x1] = m
    sh = cv2.GaussianBlur(sh, (0, 0), 14) * 0.30 * a; c[Y0:Y1] = c[Y0:Y1] * (1 - sh[..., None])
    reg = c[y0:y0 + h, x0:x1]
    gy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]; fill = NAVY_T + (NAVY_B - NAVY_T) * gy
    al = (m * 0.84 * a)[..., None]; reg = reg * (1 - al) + fill * al
    edge = (m - cv2.erode(m, np.ones((3, 3), np.uint8), iterations=1))[..., None] * 0.9 * a
    c[y0:y0 + h, x0:x1] = reg + (BRONZE_L - reg) * edge
    return c

INK2 = C('080D18')
_BK = {}
def backing(img):
    """no box: a thin navy stroke hugging the letters plus a soft navy halo, so ivory/bronze reads on a bright picture"""
    key = id(img)
    if key not in _BK:
        P = 34; a = np.pad(img[..., 3].astype(np.float32), P)
        st = cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        st = cv2.GaussianBlur(st, (0, 0), 1.2)
        halo = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))), (0, 0), 13) * 0.62
        al = np.clip(np.maximum(st * 0.92, halo), 0, 1)
        _BK[key] = np.dstack([np.ones(a.shape + (3,), np.float32) * INK2, al])
    return _BK[key]

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
    for cd in CARDS:
        if not (cd['t0'] - 0.2 <= t < cd['t1'] + 0.25): continue
        a_in = (1.0 if t >= cd['t0'] else 0.0) if cd['cont_in'] else ease(seg(t, cd['t0'] - 0.05, cd['t0'] + 0.15))
        a_out = (1.0 if t < cd['t1'] else 0.0) if cd['cont_out'] else 1 - ease(seg(t, cd['t1'], cd['t1'] + 0.2))
        L = LN[cd['line']]; ember = set(KEY.get(L['n'], []))
        po = ease(seg(t, cd['t1'] - 0.15, cd['t1']))
        for j, (img, x, y) in enumerate(cd['items']):
            wi = cd['w0'] + j; s0 = max(L['st'][wi], cd['t0'] + 0.05); w = L['words'][wi]
            if t < s0 - 0.04: continue
            q = t - s0; a = min(1, q / 0.10) * (1 - po)
            if a <= 0.01: continue
            bk = backing(img)
            if w in ember:
                s = 1 + 0.30 * (1 - ease(q / 0.16)); c = mg.put(c, bk, x, y, s, a); c = mg.put(c, img, x, y, s, a)
            else:
                dy = 10 * (1 - ease(q / 0.22))
                c = mg.put(c, bk, x, y + dy, 1.0, a); c = mg.put(c, img, x, y + dy, 1.0, a)
    c = mg.put(c, LOGO118, 118, 348)
    fo = ease(seg(t, 118.0, DUR)); c = c * (1 - 0.9 * fo)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 2.0
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    import subprocess
    mode = _argv4_[1]
    if mode == 'still':
        os.makedirs(Q + 'st4', exist_ok=True)
        for ts in _argv4_[2:]: q1.CAP = None; cv2.imwrite(Q + f'st4/s_{float(ts):06.2f}.jpg', frame(int(float(ts) * FPS)))
    elif mode == 'render':
        part, n = int(_argv4_[2]), int(_argv4_[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts4', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', Q + f'parts4/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif mode == 'dump':
        for i, (cards, kind, bad) in enumerate(PLAN):
            print(LN[i]['n'], kind, ' | '.join('%s y%d S%d %.1f-%.1f w%d' % (cd['zone'], cd['y0'], cd['S'], cd['t0'], cd['t1'], len(cd['items'])) for cd in cards))
