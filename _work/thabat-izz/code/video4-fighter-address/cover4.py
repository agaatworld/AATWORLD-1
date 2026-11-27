# Video 4 cover: the real frame, «لله درّكم» in forged bronze in the sky above his head (his own words), logo
import sys
_a = list(sys.argv); sys.argv = [sys.argv[0], 'none']
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/q4')
import q4
from q4 import *
t = float(_a[1]); k = int(t * FPS); c = motes(plate(k), t)
img = wimg('لله درّكم', 'naskh', 176, 'bronze')
fx0, fy0, fx1, fy1 = face_box(k); cy = SKY_TOP + 176 * 0.62
print('head top', int(fy0), 'text bottom', int(cy + 176 * 0.55))
c = mg.put(c, backing(img, 'light'), CX, cy, 1.0, 0.95); c = mg.put(c, img, CX, cy)
c = hair(c, CX - 170, cy + 120, CX + 170, cy + 120, BRONZE, 0.9, 2)
c = mg.put(c, LOGO, 118, 348)
cv2.imwrite(_a[2], np.clip(c, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94]); print('ok')
