import time, cv2, numpy as np, torch
from transformers import AutoImageProcessor, AutoModelForDepthEstimation
from PIL import Image
torch.set_num_threads(4)
proc = AutoImageProcessor.from_pretrained('depth-anything/Depth-Anything-V2-Base-hf')
model = AutoModelForDepthEstimation.from_pretrained('depth-anything/Depth-Anything-V2-Base-hf').eval()
cap = cv2.VideoCapture('../q2/src.mp4'); F = []
while True:
    ok, f = cap.read()
    if not ok: break
    F.append(f)
N = len(F); STEP = 2; keys = list(range(0, N, STEP))
if keys[-1] != N - 1: keys.append(N - 1)
D = {}; t0 = time.time()
for i, k in enumerate(keys):
    f = F[k]
    with torch.no_grad():
        inp = proc(images=Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)), return_tensors='pt'); out = model(**inp).predicted_depth
    d = torch.nn.functional.interpolate(out[None], size=f.shape[:2], mode='bilinear')[0, 0].numpy()
    D[k] = d
    if i % 10 == 0: print(i, len(keys), round(time.time() - t0, 1), flush=True)
lo = np.percentile(np.stack([D[k] for k in keys[::5]]), 1); hi = np.percentile(np.stack([D[k] for k in keys[::5]]), 99.5)
out = np.zeros((N,) + F[0].shape[:2], np.uint8)
for k in range(N):
    a = max(x for x in keys if x <= k); b = min(x for x in keys if x >= k); w = 0 if b == a else (k - a) / (b - a)
    d = D[a] * (1 - w) + D[b] * w; out[k] = np.clip((d - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8)
np.savez_compressed('depth.npz', d=out); print('done', N, round(time.time() - t0, 1))
