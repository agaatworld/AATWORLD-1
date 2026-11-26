# cover v4: bright cinematic frame, NO box: ivory/bronze Panorama with a navy stroke + soft halo, kept clear of the face
import sys
_a = list(sys.argv); sys.argv = [sys.argv[0], 'none']
import q1d
from q1d import *
O = '/home/user/final/video1-qasida/'
t = float(_a[1]); k = int(t * FPS); q1.CAP = None; c = bright(frame_src(k))
r1 = ['يا', 'دهرُ', 'أفِق،', 'حدِّق،']; r2 = ['أحرِقْ', 'كلَّ', 'خؤونٍ', 'برصاصاتي']
S1 = min(122, fit(r1, 840, 122)); S2 = min(100, fit(r2, 840, 100))
ybot = 1480; cy2 = ybot - S2 * 0.65; cy1 = cy2 - S2 * 0.62 - S1 * 0.62 - 14
fx0, fy0, fx1, fy1 = FR[k]; print('face', int(fy0), int(fy1), 'text top', int(cy1 - S1 * 0.65))
for img, x, y in row_at(r1, S1, CX, cy1, [PARCH] * 4)[0]: c = mg.put(c, backing(img), x, y); c = mg.put(c, img, x, y)
for img, x, y in row_at(r2, S2, CX, cy2, [EMBER, BRONZE_L, BRONZE_L, BRONZE_L])[0]: c = mg.put(c, backing(img), x, y); c = mg.put(c, img, x, y)
c = mg.put(c, LOGO118, 118, 348)
save(np.clip(c, 0, 255), O + 'cover-v4-ya-dahru.jpg', 94); print('ok')
