# cover for v3: same look as the video: bright cinematic frame + the navy caption card (bigger type for the thumbnail), no rings
import sys
_a = list(sys.argv); sys.argv = [sys.argv[0], 'none']
import q1c
from q1c import *
O = '/home/user/final/video1-qasida/'
k = int(float(_a[1]) * FPS) if len(_a) > 1 else int(91.9 * FPS); q1.CAP = None; F = frame_src(k)
c = bright(F)
fx, fy, fh = face(k); print('face', int(fx), int(fy), int(fh), 'top', int(fy - fh * 0.52), 'bottom', int(fy + fh * 0.5))
r1 = ['يا', 'دهرُ', 'أفِق،', 'حدِّق،']; r2 = ['أحرِقْ', 'كلَّ', 'خؤونٍ', 'برصاصاتي']
S1 = min(150, fit(r1, TXT_W, 150)); S2 = min(118, fit(r2, TXT_W, 118))
pitch = S1 * 0.62 + S2 * 0.62 + 18; h = int(S1 * 0.62 + pitch + S2 * 0.62 + 2 * PAD + 20)
zone = _a[2] if len(_a) > 2 else 'T'
y0 = TOP_Y if zone == 'T' else BOT_Y - h; cy1 = y0 + PAD + 10 + S1 * 0.62; cy2 = cy1 + pitch
c = draw_card(c, y0, h, 1.0, 'none')
for img, x, y in row_at(r1, S1, CX, cy1, [PARCH] * 4)[0]: c = mg.put(c, img, x, y)
for img, x, y in row_at(r2, S2, CX, cy2, [EMBER, BRONZE_L, BRONZE_L, BRONZE_L])[0]: c = mg.put(c, img, x, y)
c = mg.put(c, LOGO118, 118, 348)
save(np.clip(c, 0, 255), O + 'cover-v3-bright-ya-dahru.jpg', 94); print('ok', y0, h)
