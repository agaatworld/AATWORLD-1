import cv2, numpy as np, json
cap = cv2.VideoCapture('small.mp4'); N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
import glob
MP = glob.glob('/root/.cache/huggingface/hub/models--opencv--face_detection_yunet/snapshots/*/face_detection_yunet_2023mar.onnx')[0]
det = cv2.FaceDetectorYN.create(MP, '', (540, 960), 0.6, 0.3, 5000)
prev = None; traj = []; faces = {}
for k in range(N):
    ok, f = cap.read()
    if not ok: break
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    dx = dy = da = 0.0
    if prev is not None:
        mask = (prev < 140).astype(np.uint8) * 255                     # interior only (windows are bright)
        pts = cv2.goodFeaturesToTrack(prev, 300, 0.01, 8, mask=mask)
        if pts is not None and len(pts) > 12:
            nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None)
            good = st.ravel() == 1
            if good.sum() > 10:
                M, _ = cv2.estimateAffinePartial2D(pts[good], nxt[good], ransacReprojThreshold=2)
                if M is not None: dx, dy, da = float(M[0, 2]), float(M[1, 2]), float(np.arctan2(M[1, 0], M[0, 0]))
    traj.append((dx, dy, da)); prev = g
    if k % 6 == 0:
        bs = []
        # brighten the dark interior so faces in shadow are found
        f2 = np.clip(((f.astype(np.float32) / 255) ** 0.6) * 255, 0, 255).astype(np.uint8)
        _, res = det.detect(f2)
        if res is not None:
            for r in res: bs.append([int(r[0]), int(r[1]), int(r[2]), int(r[3]), round(float(r[14]), 2)])
        faces[k] = bs
json.dump(dict(traj=traj, faces=faces), open('analysis.json', 'w'))
# summary of face positions per 5 s
for a in range(0, N, 150):
    ys = [b[1] + b[3] / 2 for k in range(a, a + 150, 6) for b in faces.get(k, [])]; xs = [b[0] + b[2] / 2 for k in range(a, a + 150, 6) for b in faces.get(k, [])]
    hs = [b[3] for k in range(a, a + 150, 6) for b in faces.get(k, [])]
    print(f'{a/30:6.1f}s faces={len(ys):3d} cx={np.median(xs) if xs else -1:5.0f} cy={np.median(ys) if ys else -1:5.0f} h={np.median(hs) if hs else -1:4.0f}  (540x960 coords)')
