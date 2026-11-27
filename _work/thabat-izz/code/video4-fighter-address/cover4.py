# Video 4 cover: the real frame, «لله درّكم» in forged bronze in the sky above his head (his own words), logo
import sys
_a = list(sys.argv); sys.argv = [sys.argv[0], 'none']
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/q4')
import q4
from q4 import *
t = float(_a[1]); k = int(t * FPS); c = motes(plate(k), t)
img = wimg('لله درّكم', SPECIAL, 132, 'bronze')
fx0, fy0, fx1, fy1 = face_box(k); cy = 300 + 132 * 0.62
c = mg.put(c, backing(img, 'light'), CX, cy, 1.0, 0.95); c = mg.put(c, img, CX, cy)
# his own words from the same moment, in the same style as the video
words = [('وأنتم', 'hail', 90, PARCH), ('تلوون', 'hail', 90, PARCH), ('ذراع', SPECIAL, 118, 'slam'), ('إيران', SPECIAL, 118, 'slam')]
imgs = [fx4.word_img(rtl_line, w, fk_, sz, eff) if isinstance(eff, str) else wimg(w, fk_, sz, eff) for w, fk_, sz, eff in words]
wl = [im.shape[1] - 32 for im in imgs]; sp = 30; tot = sum(wl) + sp * (len(wl) - 1); x = CX + tot / 2; y2 = 600
for im, l in zip(imgs, wl):
    c = mg.put(c, backing(im, 'dark'), x - l / 2, y2); c = mg.put(c, im, x - l / 2, y2); x -= l + sp
print('head top', int(fy0), 'text bottom', int(y2 + 118 * 0.55))
c = mg.put(c, LOGO, 118, 348)
cv2.imwrite(_a[2], np.clip(c, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94]); print('ok')
