import torch, cv2, numpy as np, sys, time
from spandrel import ModelLoader
torch.set_num_threads(4)
M = ModelLoader().load_from_file(sys.argv[1]).model.eval()
for f in sys.argv[2:]:
    t0 = time.time(); im = cv2.imread(f)[..., ::-1].astype(np.float32) / 255; H, W = im.shape[:2]; T = 256; P = 16; out = np.zeros((H * 4, W * 4, 3), np.float32)
    with torch.no_grad():
        for y in range(0, H, T):
            for x in range(0, W, T):
                ya, xa = max(0, y - P), max(0, x - P); yb, xb = min(H, y + T + P), min(W, x + T + P)
                r = M(torch.from_numpy(np.ascontiguousarray(im[ya:yb, xa:xb].transpose(2, 0, 1)))[None])[0].numpy().transpose(1, 2, 0)
                oy, ox = (y - ya) * 4, (x - xa) * 4; h, w = min(T, H - y) * 4, min(T, W - x) * 4
                out[y * 4:y * 4 + h, x * 4:x * 4 + w] = r[oy:oy + h, ox:ox + w]
    out = cv2.resize(np.clip(out, 0, 1), (W * 2, H * 2), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f.replace('.png', '_x2.png'), (out[..., ::-1] * 255).round().astype(np.uint8)); print(f, round(time.time() - t0), flush=True)
