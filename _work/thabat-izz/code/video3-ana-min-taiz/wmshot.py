import cv2, numpy as np
SH=[(0,122),(122,151),(151,211),(211,360),(360,455),(456,554),(554,736),(736,943),(943,1116),(1116,1226),(1229,1321),(1321,1330)]
cap=cv2.VideoCapture('src.mp4'); F=[]
while True:
    ok,f=cap.read()
    if not ok: break
    g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY).astype(np.float32)[850:1280]
    F.append(np.clip(g-cv2.GaussianBlur(g,(0,0),5),-40,40).astype(np.int8))
F=np.array(F); out=[]; meds=[]
for a,b in SH:
    m=np.median(F[a:b].astype(np.float32),axis=0); meds.append(m)
    v=cv2.cvtColor(np.clip(m*10,0,255).astype(np.uint8),cv2.COLOR_GRAY2BGR)
    cv2.putText(v,'%.1f-%.1f'%(a/30,b/30),(10,30),0,0.9,(0,0,255),2); out.append(cv2.resize(v,(360,215)))
np.save('wm_shotmed.npy',np.array(meds).astype(np.float16))
rows=[np.hstack(out[i:i+3]) for i in range(0,12,3)]
cv2.imwrite('wm_shots.jpg',np.vstack(rows))
