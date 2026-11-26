# fixed watermark masks per position, from the per-shot temporal medians (the min over shots kills the moving texture)
import cv2, numpy as np
M = np.load('wm_shotmed.npy').astype(np.float32)          # (12, 430, 720) high-pass medians, rows 850..1280
SH = [(0,122),(122,151),(151,211),(211,360),(360,455),(456,554),(554,736),(736,943),(943,1116),(1116,1226),(1229,1321),(1321,1330)]
POS = {1: ((220,1005,150,100), [0,7]), 2: ((280,1080,230,130), [5,9,10]), 3: ((380,1190,230,130), [6]), 4: ((465,985,320,200), [8])}
masks = {}; dbg = []
for p, ((cx,cy,w,h), shots) in POS.items():
    y0, y1, x0, x1 = cy-h//2-850, cy+h//2-850, cx-w//2, cx+w//2
    mm = np.min([M[s][y0:y1, x0:x1] for s in shots], axis=0)
    b = (mm > 3.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(b); keep = np.zeros_like(b)
    for i in range(1, n):
        if st[i,4] >= 6: keep[lab==i] = 1
    keep = cv2.dilate(keep, np.ones((3,3),np.uint8), iterations=2)
    full = np.zeros((1280,720),np.uint8); full[cy-h//2:cy+h//2, cx-w//2:cx+w//2] = keep
    masks[p] = full; print(p, keep.sum())
    v = np.hstack([np.clip(mm*12,0,255).astype(np.uint8), keep*255]); dbg.append(cv2.resize(v, (v.shape[1]*2//1, v.shape[0]*2//1)))
np.savez_compressed('wm_fixed.npz', **{str(k): v for k, v in masks.items()})
W = max(d.shape[1] for d in dbg); cv2.imwrite('wm_fixed_dbg.jpg', np.vstack([np.pad(d, ((0,4),(0,W-d.shape[1]))) for d in dbg]))
