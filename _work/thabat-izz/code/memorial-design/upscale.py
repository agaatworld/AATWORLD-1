import torch,numpy as np,cv2,sys
from spandrel import ModelLoader
m=ModelLoader().load_from_file('/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/models/RealESRGAN_x4plus.pth').model.eval()
torch.set_num_threads(4)
for f in sys.argv[1:]:
    im=cv2.imread(f'in/{f}.jpg')[...,::-1].astype(np.float32)/255
    x=torch.from_numpy(im.copy()).permute(2,0,1)[None]
    with torch.no_grad(): y=m(x)[0].permute(1,2,0).clamp(0,1).numpy()
    up=(y[...,::-1]*255).round().astype(np.uint8)
    bic=cv2.resize(cv2.imread(f'in/{f}.jpg'),(up.shape[1],up.shape[0]),interpolation=cv2.INTER_LANCZOS4)
    nat=cv2.addWeighted(up,0.72,bic,0.28,0)                      # keep a natural look (less plastic)
    cv2.imwrite(f'{f}_x4.png',nat); cv2.imwrite(f'{f}_x4_raw.png',up); print(f,up.shape)
