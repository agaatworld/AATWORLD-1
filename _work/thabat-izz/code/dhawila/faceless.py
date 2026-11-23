import cv2, numpy as np
D = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/dw/anim/img/'
# polygons in full-res source px (928x1664 images). f = features -> painted with flat cel-shaded skin; m = mouth -> painted with beard/stubble
FACES = {
 'R': [dict(f=[(374,866),(392,858),(445,857),(463,866),(464,900),(458,916),(440,921),(420,916),(400,922),(382,918),(374,900)],
            m=[(402,932),(452,932),(454,949),(430,953),(402,949)])],
 'C': [dict(f=[(584,614),(612,606),(650,610),(700,640),(705,692),(668,700),(632,700),(600,704),(572,700),(556,690),(556,664),(570,640)],
            m=[(544,700),(602,698),(614,722),(604,750),(560,752),(540,728)], beard=False)],
 'D': [dict(f=[(118,852),(140,846),(158,856),(162,878),(150,884),(128,882),(118,870)], m=[(140,884),(158,884),(160,896),(140,898)]),
       dict(f=[(453,858),(474,855),(498,856),(518,860),(518,884),(505,892),(480,894),(458,890),(452,875)], m=[(462,898),(500,898),(502,912),(482,915),(462,911)]),
       dict(f=[(700,740),(735,737),(762,742),(764,768),(745,782),(722,784),(702,780),(698,760)], m=[(720,784),(748,782),(750,794),(722,795)], beard=False),
       dict(f=[(782,740),(812,738),(822,746),(820,770),(806,782),(788,780),(780,760)], m=[(792,783),(818,782),(818,792),(794,793)])],
}
def nconv(img, w, sig):
    if img.ndim == 3: a = cv2.GaussianBlur(img * w[..., None], (0, 0), sig); b = cv2.GaussianBlur(w, (0, 0), sig)[..., None]; return a / np.maximum(b, 1e-5)
    return cv2.GaussianBlur(img * w, (0, 0), sig) / np.maximum(cv2.GaussianBlur(w, (0, 0), sig), 1e-5)
def poly_mask(shape, pts, scale):
    m = np.zeros(shape[:2], np.uint8); cv2.fillPoly(m, [np.round(np.array(pts, np.float32) * scale * 8).astype(np.int32)], 255, cv2.LINE_AA, shift=3); return m.astype(np.float32) / 255
def blank_face(img, face, scale=1.0):
    Fm = poly_mask(img.shape, face['f'], scale); Mm = poly_mask(img.shape, face['m'], scale)
    beard_mode = face.get('beard', True)
    if not beard_mode: Fm = np.maximum(Fm, Mm); Mm = Mm * 0
    hsv0 = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    bg = ((hsv0[..., 0] >= 92) & (hsv0[..., 0] <= 135) & (hsv0[..., 1] > 50)).astype(np.float32)
    bg = cv2.GaussianBlur(cv2.morphologyEx(bg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)), (0, 0), 0.8 * max(1.0, scale))
    Fm = Fm * (1 - np.clip(bg * 1.5, 0, 1)); Mm = Mm * (1 - np.clip(bg * 1.5, 0, 1))
    A = np.maximum(Fm, Mm); ys, xs = np.where(A > 0.01); pad = int(50 * scale) + 12
    y0, y1 = max(0, ys.min() - pad), min(img.shape[0], ys.max() + pad); x0, x1 = max(0, xs.min() - pad), min(img.shape[1], xs.max() + pad)
    roi = img[y0:y1, x0:x1].astype(np.float32); F = Fm[y0:y1, x0:x1]; M = Mm[y0:y1, x0:x1]
    sz = np.sqrt((F > 0.5).sum() / np.pi) + 1
    f8 = (F > 0.35).astype(np.uint8) * 255; f8 = cv2.dilate(f8, np.ones((3, 3), np.uint8), iterations=max(1, int(round(1.5 * scale))))
    hard = (f8 > 0) | (M > 0.02)
    hsv = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2HSV).astype(np.float32)
    skin = ((hsv[..., 0] >= 2) & (hsv[..., 0] <= 24) & (hsv[..., 1] > 70) & (hsv[..., 2] > 75) & ~hard)
    skin = cv2.erode(skin.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1) > 0      # avoid anti-aliased line edges
    Sk = nconv(roi, skin.astype(np.float32), max(2.5, sz * 0.35))
    guide = np.where(skin[..., None], roi, Sk)                                                 # boundary sees skin only
    fill = cv2.inpaint(np.clip(guide, 0, 255).astype(np.uint8), f8, max(3, int(sz * 0.15)), cv2.INPAINT_NS).astype(np.float32)
    fill = cv2.GaussianBlur(fill, (0, 0), max(1.5, sz * 0.18))
    out = roi.copy(); a = cv2.GaussianBlur(f8.astype(np.float32) / 255, (0, 0), max(0.7, 0.8 * scale))[..., None]
    out = out * (1 - a) + fill * a
    if beard_mode and M.max() > 0:
        near = cv2.dilate((M > 0.02).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(sz * 0.5) + 4) > 0
        lab = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2LAB).astype(np.float32)[..., 0]
        sl = lab[skin & near] if (skin & near).sum() > 10 else lab[skin]
        bd = (~skin) & (~hard) & near & (lab < np.median(sl) - 25)
        cb = np.median(roi[bd], 0) if bd.sum() > 10 else np.median(roi[(~hard) & near], 0)
        ma = cv2.GaussianBlur(M, (0, 0), max(0.6, 0.7 * scale))[..., None]
        out = out * (1 - ma) + cb * ma
    res = img.copy(); res[y0:y1, x0:x1] = np.clip(out, 0, 255).astype(np.uint8); return res
def blank_all(img, key, scale=1.0, faces=None):
    for face in (faces or FACES[key]): img = blank_face(img, face, scale)
    return img
if __name__ == '__main__':
    for k in FACES: cv2.imwrite(D + k + '_nf.png', blank_all(cv2.imread(D + k + '.png'), k))
    print('ok')
