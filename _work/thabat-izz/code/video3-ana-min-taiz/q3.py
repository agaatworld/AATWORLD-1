# VIDEO 3 «أنا من تعزّ» — ONE style: the real Taiz footage fills the upper frame with a slow, continuous camera drift,
# melting through a soft fog gradient into a deep-navy band where each line of the poem emerges word by word (Panorama, ivory + one gold word).
# Original overlays removed (top credit, «تعز تقاوم» logo, plum caption boxes, fog overlay = cropped; photographer watermark = inpainted). Clean credits added.
import sys, os, json, re, difflib
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/brand')
_argv_ = list(sys.argv); sys.argv = [_argv_[0], 'B']
from km import *
sys.argv = _argv_
import mg, subprocess
Q = os.path.dirname(os.path.abspath(__file__)) + '/'
W, H, FPS = 1080, 1920, 30; NF = 1330; DUR = NF / FPS; CX = 540
xx, yy = mg.xx, mg.yy
TOPCUT = 335; FH = int((1280 - TOPCUT) * 1.5)                 # footage height on screen (1417)
FADE0, FADE1 = 1120, FH                                          # fog-like melt into the navy band
ROW1, ROW2 = 1262, 1380                                          # the two hemistich rows (above the 1500 safe line)
GOLD = BRONZE_L

# ---------------------------------------------------------------- source + watermark removal
cap = cv2.VideoCapture(Q + 'src.mp4'); SRC = []
while True:
    ok, f = cap.read()
    if not ok: break
    SRC.append(f)
# the photographer's watermark sits still while the picture moves: exact masks were built once from per-shot temporal medians (wmbuild.py)
_WM = np.load(Q + 'wm_fixed.npz'); WMASK = {int(k): _WM[k] for k in _WM.files}
WSPAN = {1: [(0, 122), (736, 943)], 2: [(456, 554), (1116, 1321)], 3: [(554, 736)], 4: [(943, 1116)]}
def dewatermark(f, k):
    mask = None
    for p, spans in WSPAN.items():
        if any(a - 2 <= k < b + 2 for a, b in spans): mask = WMASK[p] if mask is None else np.maximum(mask, WMASK[p])
    if mask is None: return f
    inp = cv2.inpaint(f, mask, 5, cv2.INPAINT_TELEA).astype(np.float32)
    ys = np.where(mask.any(axis=1))[0]; dy = int(ys[-1] - ys[0] + 8)                       # borrow the grain of the picture just above the mark,
    ff = f.astype(np.float32); hp = ff - cv2.GaussianBlur(ff, (0, 0), 2.0)                  # so the filled area is not a smooth blob
    ms = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 1.5)[..., None]
    return np.clip(inp + np.roll(hp, dy, axis=0) * ms * 0.9, 0, 255).astype(np.uint8)
def grade(f):
    x = f.astype(np.float32) / 255
    L = (0.114 * x[..., 0] + 0.587 * x[..., 1] + 0.299 * x[..., 2])[..., None]
    x = L + (x - L) * 0.92                                                                # calm the orange-teal a little
    x = np.power(np.clip(x, 0, 1), 0.86)                                                  # brighter, open mid-tones (owner: lighter, cinematic)
    x = np.clip((x - 0.5) * 1.05 + 0.52, 0, 1)                                            # gentle contrast
    x = np.where(x > 0.82, 0.82 + (x - 0.82) * 0.6, x)                                    # soft highlights
    return x * 255
def footage(k):
    kk = min(k, 1312); f = dewatermark(SRC[kk], kk)[TOPCUT:1280]                  # the source flashes white then black after 43.75 s: hold the castle instead
    f = cv2.resize(f, (W, FH), interpolation=cv2.INTER_CUBIC)
    t = k / FPS                                                                           # the one camera: a slow continuous drift
    z = 1.045 + 0.025 * np.sin(2 * np.pi * t / 14.0); dx = 14 * np.sin(2 * np.pi * t / 19.0); dy = 10 * np.sin(2 * np.pi * t / 23.0 + 1.0)
    M = cv2.getRotationMatrix2D((W / 2, FH * 0.45), 0.25 * np.sin(2 * np.pi * t / 17.0), z); M[0, 2] += dx; M[1, 2] += dy
    return grade(cv2.warpAffine(f, M, (W, FH), borderMode=cv2.BORDER_REFLECT))

GROUND = archive_ground(H, W, seed=501)
ALPHA = np.ones((H, W, 1), np.float32); yv = np.arange(H, dtype=np.float32)
a_ = np.clip((FADE1 - yv) / (FADE1 - FADE0), 0, 1) ** 1.6; ALPHA[:, :, 0] = a_[:, None]; ALPHA[FH:] = 0
LOGO = logo_rgba(118)
CRED = text([('إلقاء: نصر منصور', SILVER), ('تصوير: حسام القليعة', SILVER)], 'plex', 32, gap=1.2)

# ---------------------------------------------------------------- poem (corrected transcript; [مكّة] uncertain)
LINES = [(0.00, 6.16, 'أنا مِن تعزَّ، مدينةٍ قُدسيّةٍ، ومَناطِ كلِّ مجاهدٍ سبّاقِ', ['تعزَّ']),
         (6.16, 11.86, 'بِمُعاذَ مبعوثِ النبيِّ محمدٍ، بمعارفِ القرآنِ والأخلاقِ', ['القرآنِ']),
         (11.86, 17.62, 'عصرُ المظفّرِ يوسفٍ يزهو به صَبِرٌ ومكّةُ، يا لَعَصرٍ راقِ', ['المظفّرِ']),
         (17.62, 23.90, 'يا أختَ غزّةَ، والدمارُ يلفُّها، الصبرُ طوقٌ في الشدائدِ واقِ', ['غزّةَ']),
         (23.90, 30.70, 'نيرونُ أضحى في تعزَّ مدينتي، بالقتلِ والتدميرِ والإحراقِ', ['تعزَّ']),
         (30.70, 36.80, 'فأنا التعزّيُّ الذي رفضَ البقاءَ في الذلِّ، ليس الذلُّ من أخلاقي', ['التعزّيُّ']),
         (36.80, 44.33, 'وغداً سيُشرقُ في الحياةِ وميضُها، وتعزُّ تبقى كعبةَ الأشواقِ', ['كعبةَ', 'الأشواقِ'])]
OWNF = Q + 'own_lines.json'
if os.path.exists(OWNF):
    own = json.load(open(OWNF))
    LINES = [(a, b, own.get(str(i + 1), s), k) for i, (a, b, s, k) in enumerate(LINES)]
WS = [w for s in json.load(open('/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/an/a3.json')) for w in s['words']]
def norm(w):
    w = re.sub(r'[ً-ْٰ،,:!؟?.()«»\[\]]', '', w); w = re.sub('[أإآ]', 'ا', w); return w.replace('ة', 'ه').replace('ى', 'ي')
def align(a, b, words):
    ww = [w for w in WS if a - 0.05 <= w[1] < b - 0.02]
    if not ww: return list(np.linspace(a, b - 0.4, len(words)))
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
    if not known: return list(np.linspace(a, b - 0.4, len(words)))
    out = list(np.interp(range(len(words)), [k for k, _ in known], [s for _, s in known], left=a, right=b - 0.4))
    for i in range(1, len(out)): out[i] = max(out[i], out[i - 1] + 0.05)
    return out
LN = []
for i, (a, b, s, keys) in enumerate(LINES):
    words = s.split(); n = len(words); ch = [len(norm(w)) for w in words]; tot = sum(ch)
    cands = [j + 1 for j, w in enumerate(words[:-1]) if w.endswith('،')] or list(range(1, n))
    cut = min(cands, key=lambda c_: abs(sum(ch[:c_]) - (tot - sum(ch[:c_]))))
    LN.append(dict(a=a, b=b, words=words, st=align(a, b, words), cut=cut, keys=keys, last=(i == len(LINES) - 1)))

def clean(w): return w.strip('،:!؟')
_TI = {}
def wim(w, size, col):
    key = (w, size, tuple(col))
    if key not in _TI: _TI[key] = rtl_line([(clean(w), col)], 'naskh', size)
    return _TI[key]
def row(words, keys, size, cy, maxw=960):
    f = font('naskh', size); sp = size * 0.30; wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]
    tot = sum(wl) + sp * (len(wl) - 1)
    if tot > maxw: return row(words, keys, int(size * maxw / tot), cy, maxw)
    x = CX + tot / 2; out = []
    for w, l in zip(words, wl):
        out.append((wim(w, size, GOLD if w in keys else PARCH), x - l / 2, cy, l)); x -= l + sp
    return out, size, tot
LAY = {}
def layout(i):
    if i not in LAY:
        L = LN[i]; r1, s1, _ = row(L['words'][:L['cut']], L['keys'], 92, ROW1); r2, s2, t2 = row(L['words'][L['cut']:], L['keys'], 92, ROW2)
        LAY[i] = (r1 + r2, t2)
    return LAY[i]

def frame(k):
    t = k / FPS
    c = GROUND.copy(); fo = footage(k)
    c[:FH] = c[:FH] * (1 - ALPHA[:FH]) + fo * ALPHA[:FH]
    for i, L in enumerate(LN):
        nxt = LN[i + 1]['a'] if i + 1 < len(LN) else DUR + 1
        if not (L['a'] - 0.2 <= t < nxt + 0.05): continue
        po = ease(seg(t, nxt - 0.25, nxt)) if i + 1 < len(LN) else 0.0
        items, t2 = layout(i)
        for j, (img, x, y, wl) in enumerate(items):
            s0 = L['st'][j]
            if t < s0 - 0.05: continue
            q = t - s0; w = ease(q / 0.32); a = (1 - po)
            if a <= 0.01: continue
            c = mg.put(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 10) * 0.55]), x + 4, y + 8, 1.0, a * w)
            c = mg.put(c, img, x, y, 1.0, a, wipe=w, blur=2.5 * (1 - w))                      # each word emerges from a soft right-to-left mask
        if L['last'] and t >= 42.2:                                                           # «كعبة الأشواق»: a gold hairline settles under the final row
            p = ease(seg(t, 42.4, 43.4)); hw = t2 / 2 * p
            c = hair(c, CX + hw, ROW2 + 62, CX - hw, ROW2 + 62, GOLD, 0.9, 2)
            for sg in (-1, 1): c = spark(c, CX + sg * hw, ROW2 + 62, GOLD, 0.5 * p, 3, 14) if 0.05 < p else c
    ca = ease(seg(t, 0.6, 1.4)); c = mg.put(c, CRED, CX, 1478, 1.0, 0.85 * ca)
    c = mg.put(c, LOGO, 118, 348)
    g = np.random.default_rng(k).standard_normal((H, W, 1)).astype(np.float32) * 2.2
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    mode = _argv_[1]
    if mode == 'still':
        os.makedirs(Q + 'st', exist_ok=True)
        for ts in _argv_[2:]: cv2.imwrite(Q + f'st/s_{float(ts):05.2f}.jpg', frame(int(float(ts) * FPS)))
    elif mode == 'render':
        part, n = int(_argv_[2]), int(_argv_[3]); a = part * NF // n; b = (part + 1) * NF // n
        os.makedirs(Q + 'parts', exist_ok=True)
        pr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', Q + f'parts/p{part}.mp4'], stdin=subprocess.PIPE)
        for k in range(a, b): pr.stdin.write(frame(k).tobytes())
        pr.stdin.close(); pr.wait(); print('done', part)
    elif mode == 'dump':
        for L in LN: print(round(L['a'], 2), L['words'][:L['cut']], '|', L['words'][L['cut']:], [round(s, 2) for s in L['st']])
