# cover in the same single style: real frame, navy grade, bronze rings, top ivory/bronze rows, bottom ember row
import sys
_argv_ = list(sys.argv); sys.argv = [sys.argv[0], 'none']
import q1b
from q1b import *
O = '/home/user/final/video1-qasida/'
k = int(91.9 * FPS); q1.CAP = None; F = frame_src(k)
c = tone(F, 'peak'); c = vignette(c, 0.55); c = dark_band(c, 230, 840, 0.72); c = dark_band(c, 1150, 1580, 0.66)
for r, col, a_ in ((110, BRONZE_L, 0.45), (380, BRONZE_L, 0.32), (600, SILVER, 0.22)): c = ring(c, CX, 980, r, col, a_, 2)
def T(ws, size, cols): return text(list(zip(ws, cols)), 'naskh', size)
def P(c, img, y):
    c = mg.put(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 10) * 0.6]), CX + 5, y + 9); return mg.put(c, img, CX, y)
c = P(c, T(['يا', 'دهرُ'], 210, [PARCH, PARCH]), 480)
c = P(c, T(['أفِق', 'حدِّق'], 130, [BRONZE_L, BRONZE_L]), 650)
EM = C('E8743B'); x0 = CX; c = c + (EM - c) * (np.exp(-(((xx - 700) / 220) ** 2 + ((yy - 1300) / 100) ** 2)) * 0.25)[..., None]
c = P(c, T(['أحرِقْ', 'كلَّ', 'خؤونٍ'], 124, [EM, PARCH, PARCH]), 1300)
c = P(c, T(['برصاصاتي'], 128, [BRONZE_L]), 1440)
c = mg.put(c, LOGO118, 118, 348)
save(np.clip(c, 0, 255), O + 'cover-unified-ya-dahru.jpg', 94); print('ok')
