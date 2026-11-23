import sys; sys.argv = ['x', 'none']
from dhawila import *
t = 31.0
c = picture(t); c = bloom(c, 205, 0.32); c = c * VIG
band = (np.clip((yy - 1050) / 600, 0, 1) ** 1.2)[..., None]; c = c * (1 - 0.62 * band)
T1 = text_img([('معركة', WHITE), ('ضاويله', ORANGE)], 'thmanyahserifdisplay-Black.ttf', 150)
T2 = text_img([('الليلية', WHITE)], 'thmanyahserifdisplay-Black.ttf', 150)
T3 = text_img([('كلنا مقاومة', AMBER)], 'thmanyahsans-Black.ttf', 78)
c = put(c, T1, W / 2 - 30, 1150, min(1, 880 / T1.shape[1]), 1.0, shadow=0.8)
c = put(c, T2, W / 2 - 30, 1300, 1.0, 1.0, shadow=0.8)
m = np.zeros((H, W), np.float32); cv2.line(m, (int((W / 2 - 230) * 8), 1395 * 8), (int((W / 2 + 170) * 8), 1395 * 8), 1.0, 4, cv2.LINE_AA, shift=3)
c = c + (AMBER - c) * (m * 0.9)[..., None]
c = put(c, T3, W / 2 - 30, 1470, 1.0, 1.0, shadow=0.7)
c = put(c, LOGO, 100, 330, 1.0, 0.95, shadow=0.35)
os.makedirs(OUTD, exist_ok=True)
cv2.imwrite(OUTD + 'cover-maarakat-dhawila.jpg', np.clip(c, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 93]); print('cover ok')
