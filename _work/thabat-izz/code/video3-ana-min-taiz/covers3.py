# Video 3 covers in the video's own style: real Taiz footage on top melting into the navy ground, the poem's own words, one gold word
import sys
_a = list(sys.argv); sys.argv = [sys.argv[0], 'dump']
import q3
from q3 import *
O = '/home/user/final/video3-ana-min-taiz/'; os.makedirs(O, exist_ok=True)
def base(t):
    k = int(t * FPS); c = GROUND.copy(); fo = footage(k); return c * 0 + (c * (1 - ALPHA) + np.pad(fo, ((0, H - FH), (0, 0), (0, 0))) * ALPHA)
def put_row(c, words, cols, size, cy):
    f = font('naskh', size); sp = size * 0.30; wl = [f.getlength(clean(w), direction='rtl', language='ar') for w in words]
    tot = sum(wl) + sp * (len(wl) - 1)
    if tot > 940: return put_row(c, words, cols, int(size * 940 / tot), cy)
    x = CX + tot / 2
    for w, l, col in zip(words, wl, cols):
        img = rtl_line([(clean(w), col)], 'naskh', size)
        c = mg.put(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 12) * 0.6]), x - l / 2 + 5, cy + 9)
        c = mg.put(c, img, x - l / 2, cy); x -= l + sp
    return c
def finish(c, name):
    c = mg.put(c, CRED, CX, 1478, 1.0, 0.85); c = mg.put(c, LOGO, 118, 348)
    save(np.clip(c, 0, 255), O + name, 94); print('ok', name)
# A: the castle, first line
c = base(2.0)
c = put_row(c, ['أنا', 'مِن', 'تعزَّ'], [PARCH, PARCH, GOLD], 170, 1215)
c = put_row(c, ['مدينةٍ', 'قُدسيّةٍ'], [PARCH, PARCH], 104, 1370)
finish(c, 'cover-A-ana-min-taiz.jpg')
# B: the castle on the mountain, last line
c = base(28.0)
c = put_row(c, ['وتعزُّ', 'تبقى'], [PARCH, PARCH], 116, 1190)
c = put_row(c, ['كعبةَ', 'الأشواقِ'], [GOLD, GOLD], 140, 1330)
finish(c, 'cover-B-kaabat-al-ashwaq.jpg')
