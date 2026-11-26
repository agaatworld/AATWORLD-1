import sys
sys.argv = [sys.argv[0], 'none']
import q2
from q2 import *
OUTD = '/home/user/final/video2-iron-lock/'; os.makedirs(OUTD, exist_ok=True)
def slogan(c, y, col=BRONZE_L):
    sl = text([('كلنا', col), ('مقاومة', col)], 'almarai', 44); c = paste(c, sl, CX, y); hw = sl.shape[1] / 2 + 24
    for sg in (-1, 1): c = hair(c, CX + sg * hw, y, CX + sg * (hw + 100), y, col, 1.0, 3)
    return c
def out(c, n): c = mg.put(c, LOGO, 118, 348); save(np.clip(c, 0, 255), OUTD + n, 94); print('ok', n)
def T(ws, size, cols): return text(list(zip(ws, cols)), 'naskh', size)
# 1 — the edit's own composition: her real frame (finger raised) above, the lock framed by the saying below
c = frame(int(7.0 * FPS)).astype(np.float32); c[BAND_Y:BAND_Y + BAND_H] = grade(cv2.resize(src(int(3.9 * FPS)), (W, BAND_H), interpolation=cv2.INTER_LANCZOS4))
c = slogan(c, 1540); out(c, 'cover-1-band-and-lock.jpg')
# 2 — the lock full-bleed, her face and finger in a bronze circle, the saying above and below
L_ = cv2.imread(Q + 'dl/lock_bolt.jpg').astype(np.float32); bg = cover_fit(L_, W, H, fy=0.45, fx=0.5, z=1.0)
g = cv2.cvtColor(bg.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255; bg = (bg * 0.5 + (DEEP + (BRONZE_L - DEEP) * g) * 0.5) * 0.45
c = vignette(bg, 0.45)
fr_ = grade(src(int(3.9 * FPS))); fx0, fy0 = 395, 190; D_ = 560; s = 2.1
M = np.float32([[s, 0, D_ / 2 - s * fx0], [0, s, D_ / 2 - s * fy0]]); circ = cv2.warpAffine(fr_.astype(np.float32), M, (D_, D_), borderMode=cv2.BORDER_REFLECT)
c = paste(c, np.dstack([np.zeros((D_, D_, 3), np.float32), cv2.GaussianBlur(round_mask(D_, D_, D_ // 2), (0, 0), 16) * 0.7]), CX + 8, 960 + 16)
c = paste(c, np.dstack([circ, round_mask(D_, D_, D_ // 2)]), CX, 960); c = ring(c, CX, 960, D_ / 2 + 4, BRONZE_L, 1.0, 5); c = ring(c, CX, 960, D_ / 2 + 40, SILVER, 0.5, 2, ticks=96, tick_len=7)
t1 = T(['قفلة', 'حديد'], 160, [PARCH, PARCH]); c = paste(c, np.dstack([np.zeros(t1.shape[:2] + (3,), np.float32), cv2.GaussianBlur(t1[..., 3], (0, 0), 12) * 0.8]), CX + 6, 470 + 10); c = paste(c, t1, CX, 470)
c = paste(c, T(['ومردحة', 'حناشة'], 110, [BRONZE_L, BRONZE_L]), CX, 1405); c = slogan(c, 1520); out(c, 'cover-2-lock-and-circle.jpg')
# 3 — stone and red: her frame as a print on the basalt-blue stone, the opening words above, the punchline below
c = grunge(H, W, d, seed=405, base=C('1C2633'), tone=C('4F5E70')); c = vignette(c, 0.4)
pr = grade(src(int(3.9 * FPS))); pr = cv2.resize(pr, (940, 530), interpolation=cv2.INTER_LANCZOS4)
P = np.zeros((560, 970, 4), np.float32); P[..., :3] = PARCH; P[..., 3] = 1; P[15:545, 15:955, :3] = pr
c = paste(c, np.dstack([np.zeros(P.shape[:2] + (3,), np.float32), cv2.GaussianBlur(P[..., 3], (0, 0), 18) * 0.6]), CX + 10, 900 + 20, 1, 1, -2.0); c = paste(c, P, CX, 900, 1, 1, -2.0)
c = paste(c, T(['كحران', 'عسير'], 130, [PARCH, PARCH]), CX, 470)
c = paste(c, T(['قفلة', 'حديد'], 140, [PARCH, C('C9483E')]), CX, 1330); c = slogan(c, 1500); out(c, 'cover-3-stone-print.jpg')
