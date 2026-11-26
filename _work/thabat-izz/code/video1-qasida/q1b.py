# VIDEO 1 — redo in ONE style (the owner's chosen frame at 1:32): real footage full screen, dark navy grade,
# thin bronze rings, each line split in two halves: top (ivory row + bronze row) above the head, bottom (ivory row with an ember/bronze key word + bronze row) below the face.
# Variation stays inside the style: which word lights, ring pulses, push strength, block position (face-aware).
import sys, os, json, re, difflib
_argv_ = list(sys.argv); sys.argv = [sys.argv[0], 'none']
import q1
from q1 import *
Q = q1.Q
OWN = {}
for f in sorted(os.listdir(Q + 'db/lines')):
    dd = json.load(open(Q + 'db/lines/' + f)); dd = dd.get('data', dd); OWN[int(dd['n'])] = dd['text'].strip()
TXT = [(a, b, OWN.get(i + 1, t)) for i, (a, b, t) in enumerate(q1.LINES)]
for i in (27, 28, 29): TXT[i] = (TXT[i][0], TXT[i][1], TXT[i][2])                       # other voices, as approved
WS = q1.WS
def norm(w):
    w = re.sub(r'[ً-ْٰ،,:!؟?.()«»]', '', w); w = re.sub('[أإآ]', 'ا', w); return w.replace('ة', 'ه').replace('ى', 'ي')
def align(a, b, words):
    ww = [w for w in WS if a - 0.05 <= w[1] < b - 0.02]
    if not ww: return list(np.linspace(a, b - 0.3, len(words)))
    sm = difflib.SequenceMatcher(None, [norm(x) for x in words], [norm(w[0]) for w in ww], autojunk=False); st = [None] * len(words)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): st[blk.a + k] = ww[blk.b + k][1]
    last = a - 1
    for i, w in enumerate(words):                                                        # fuzzy fill, in order, only after the previous word
        if st[i] is not None: last = st[i]; continue
        nxt = next((st[j] for j in range(i + 1, len(words)) if st[j] is not None), b)
        cand = [j for j, x in enumerate(ww) if last < x[1] < nxt]
        if cand:
            best = max(cand, key=lambda j: difflib.SequenceMatcher(None, norm(w), norm(ww[j][0])).ratio())
            if difflib.SequenceMatcher(None, norm(w), norm(ww[best][0])).ratio() > 0.5: st[i] = ww[best][1]; last = st[i]
    known = [(i, s) for i, s in enumerate(st) if s is not None]
    if not known: return list(np.linspace(a, b - 0.3, len(words)))
    xs = [k for k, _ in known]; ys = [s for _, s in known]
    out = list(np.interp(range(len(words)), xs, ys, left=a, right=b - 0.3))
    for i in range(1, len(out)): out[i] = max(out[i], out[i - 1] + 0.05)                 # monotonic
    if xs[0] > 0:
        for i in range(xs[0]): out[i] = a + (out[xs[0]] - a) * i / max(1, xs[0])
    return out
EMBER = C('E8743B')
KEY = {7: ['فالكفرُ'], 22: ['أحرِقْ'], 11: ['فعصيُّ'], 6: ['بدراً'], 19: ['عُمَرٍ'], 23: ['وثباتِ']}           # ember words (line number → words)
LN = []
for i, (a, b, s) in enumerate(TXT):
    words = s.replace('(صوت آخر) ', '').split(); st = align(a, b, words); n = len(words)
    ch = [len(norm(w)) for w in words]; tot = sum(ch)
    cands = [j + 1 for j, w in enumerate(words[:-1]) if w.endswith('،')] if i < 27 else []
    if not cands: cands = list(range(1, n)) if n > 1 else [1]
    cut = min(cands, key=lambda c_: abs(sum(ch[:c_]) - (tot - sum(ch[:c_]))))     # the hemistich comma nearest the middle
    if i >= 27: cut = 0                                                                  # the companions' short replies: bottom block only
    LN.append(dict(a=a, b=b, words=words, st=st, cut=cut, n=i + 1))

def clean(w): return w.strip('،:!؟')
def rows_of(words):
    if len(words) <= 2: return [words, []]
    f = font('naskh', 100); wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]; best = None
    for k in range(1, len(words)):
        m = abs(sum(wl[:k]) - sum(wl[k:])) + (0 if k >= len(words) - k else 30)
        if best is None or m < best[0]: best = (m, k)
    k = best[1]; return [words[:k], words[k:]]
_TI = {}
def wim(w, size, col):
    key = (w, size, tuple(col))
    if key not in _TI: _TI[key] = rtl_line([(clean(w), col)], 'naskh', size)
    return _TI[key]
def place_row(words, size, cy, cols, maxw):
    f = font('naskh', size); sp = size * 0.32; wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]
    tot = sum(wl) + sp * (len(wl) - 1)
    if tot > maxw: size = int(size * maxw / tot); return place_row(words, size, cy, cols, maxw)
    x = CX + tot / 2; out = []
    for w, l, col in zip(words, wl, cols): out.append((wim(w, size, col), x - l / 2, cy, size)); x -= l + sp
    return out

def block_items(L, k):
    """the four rows of a line, positioned clear of the face"""
    fx, fy, fh = face(k); ftop = fy - fh * 0.60; fbot = fy + fh * 0.58
    W1 = L['words'][:L['cut']]; W2 = L['words'][L['cut']:]
    t1, t2 = rows_of(W1) if W1 else ([], []); b1, b2 = rows_of(W2)
    ember = set(KEY.get(L['n'], []))
    items = []
    # top block: big ivory row + bronze row; bottom of block must stay above the face
    s1, s2 = (190, 128) if len(' '.join(t1)) < 12 else (150, 116)
    h_top = s1 * 1.05 + (s2 * 1.1 if t2 else 0)
    if t2 and min(ftop - 24, 790) - 420 < h_top:                                          # head is high: one row only
        t1, t2 = W1, []; s1 = 130; h_top = s1 * 1.05
    top_bottom = min(ftop - 24, 790); top_top = max(420, top_bottom - h_top)
    maxw = 700 if top_top < 470 else 900
    y1 = top_top + s1 * 0.5; y2 = y1 + s1 * 0.55 + s2 * 0.6
    if t1: items += [(r, 0) for r in place_row(t1, s1, y1, [EMBER if w in ember else PARCH for w in t1], maxw)]
    if t2: items += [(r, 1) for r in place_row(t2, s2, y2, [EMBER if w in ember else BRONZE_L for w in t2], maxw)]
    # bottom block: ivory row (key word ember) + bronze row; top of block below the face, bottom ≤ 1500
    s3, s4 = 118, 122
    h_bot = s3 * 1.05 + (s4 * 1.1 if b2 else 0)
    if b2 and max(fbot + 24, 1180) > 1500 - h_bot:                                        # face is low: one row only, as low as the safe area allows
        b1, b2 = W2, []; s3 = 104; h_bot = s3 * 1.05
    bot_top = max(fbot + 24, 1180); bot_top = min(bot_top, 1500 - h_bot)
    y3 = bot_top + s3 * 0.5; y4 = y3 + s3 * 0.55 + s4 * 0.6
    items += [(r, 2) for r in place_row(b1, s3, y3, [EMBER if w in ember else PARCH for w in b1], 900)]
    if b2: items += [(r, 3) for r in place_row(b2, s4, y4, [EMBER if w in ember else BRONZE_L for w in b2], 900)]
    return items

LAY = {}
def line_layout(i, L):
    """freeze the layout per line (taken at the line's middle) so words never jump"""
    if i not in LAY: LAY[i] = block_items(L, int((L['a'] + min(L['b'], L['a'] + 2.0)) / 2 * FPS))
    return LAY[i]

PEAK = (87.74, 96.60)
def frame(k):
    t = k / FPS; F = frame_src(k)
    # camera: gentle push per line, stronger in the peak, small jolts on strong words
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
    c = tone(F, 'peak'); c = vignette(c, 0.55)
    c = dark_band(c, 230, 840, 0.72); c = dark_band(c, 1150, 1580, 0.66)
    # rings: the same three thin rings all through; a soft pulse on every new line, stronger pulses in the peak
    br = 1.0 + 0.015 * np.sin(t * 0.8)
    for r, col, a_ in ((110, BRONZE_L, 0.45), (380, BRONZE_L, 0.32), (600, SILVER, 0.22)): c = ring(c, CX, 980, r * br, col, a_, 2)
    for L in LN:
        if L['a'] <= t < L['a'] + 0.9:
            p = (t - L['a']) / 0.9; c = ring(c, CX, 980, 110 + 640 * ease(p), BRONZE_L, 0.4 * (1 - p), 2)
    if PEAK[0] <= t < PEAK[1]:
        for j in range(3):
            rr = 110 + ((seg(t, PEAK[0], PEAK[1]) * 6 + j / 3) % 1.0) * 800; c = ring(c, CX, 980, rr, BRONZE_L, 0.35 * (1 - rr / 910), 2)
    # words
    for i, L in enumerate(LN):
        if not (L['a'] - 0.15 <= t < L['b'] + 0.35): continue
        po = ease(seg(t, L['b'] + 0.05, L['b'] + 0.35))
        if i + 1 < len(LN): po = max(po, ease(seg(t, LN[i + 1]['a'] - 0.15, LN[i + 1]['a'] + 0.05)))
        items = line_layout(i, L); wi = 0; ember = set(KEY.get(L['n'], []))
        for ((img, x, y, size), part) in items:
            s0 = L['st'][wi]; w = L['words'][wi]; wi += 1
            if t < s0 - 0.04: continue
            q = t - s0; a = min(1, q / 0.10) * (1 - po)
            if a <= 0.01: continue
            if w in ember:                                                                   # the ember word: slam + heat
                s = 1 + 0.35 * (1 - ease(q / 0.16)); heat = np.exp(-q / 0.8) * (1 - po)
                c = c + (EMBER - c) * (np.exp(-(((xx - x) / 200) ** 2 + ((yy - y) / 90) ** 2)) * 0.3 * heat)[..., None]
                c = mg.put(c, img, x, y, s, a)
            else:
                c = mg.put(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 9) * 0.55]), x + 4, y + 8 + 16 * (1 - ease(q / 0.22)), 1.0, a)
                c = mg.put(c, img, x, y + 16 * (1 - ease(q / 0.22)), 1.0, a)
    c = mg.put(c, LOGO118, 118, 348)
    fo = ease(seg(t, 118.0, DUR)); c = c * (1 - 0.9 * fo)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 2.4
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    import subprocess
    mode = _argv_[1]
    if mode == 'still':
        os.makedirs(Q + 'st2', exist_ok=True)
        for ts in _argv_[2:]: q1.CAP = None; cv2.imwrite(Q + f'st2/s_{float(ts):06.2f}.jpg', frame(int(float(ts) * FPS)))
    elif mode == 'render':
        part, n = int(_argv_[2]), int(_argv_[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts2', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', Q + f'parts2/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif mode == 'dump':
        for L in LN: print(L['n'], round(L['a'], 2), L['words'][:L['cut']], '|', L['words'][L['cut']:], [round(s, 2) for s in L['st']])
