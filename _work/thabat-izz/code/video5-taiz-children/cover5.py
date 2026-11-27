# Video 5 cover: Marina's real frame, her own words, the channel badge with the source
import sys
_a = list(sys.argv); sys.argv = [sys.argv[0], 'none']
sys.path.insert(0, '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/q5')
import q5
from q5 import *
k = int(float(_a[1]) * FPS)
f = grade(SRC[k], False); c = GROUND.copy(); c[:PIC_H] = c[:PIC_H] * (1 - ALPHA[:PIC_H]) + f[:PIC_H] * ALPHA[:PIC_H]
w1 = [('سيّدَ', 'hail', 'ivory'), ('الرئيس،', 'hail', 'ivory')]; w2 = [('هل', 'hail', 'ivory'), ('تسمع', 'hail', 'ivory'), ('صوتي؟', 'thm_disp', 'gold')]
def row(ws, size, y):
    global c
    imgs = [wimg(w, fk, int(size * (1.15 if kind == 'gold' else 1)), kind) for w, fk, kind in ws]
    wl = [im.shape[1] - 32 for im in imgs]; sp = 28; tot = sum(wl) + sp * (len(wl) - 1); x = 960 + tot / 2
    for im, l in zip(imgs, wl): c = mg.put(c, im, x - l / 2, y); x -= l + sp
row(w1 + w2, 96, 918)
c = hair(c, 1760, 1046, 1730, 1046, BRONZE_L, 1.0, 2); c = mg.put(c, NAME_M, 1720 - NAME_M.shape[1] / 2 + 16, 1046)
c = badge(c, 1.0)
cv2.imwrite(_a[2], np.clip(c, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94]); print('ok')
