import cv2,numpy as np
im=cv2.imread('p1_x4.png').astype(np.float32); H,W=im.shape[:2]
iz=cv2.imread('p1_mask_isnet.png',0).astype(np.float32)/255
k=1/0.45
# polygon in full-res pixels: keeps both his arms and the hand that holds the rifle, excludes the boy (left) and the man in white (right)
poly=np.array([(733,644),(827,658),(933,696),(991,756),(1004,844),(1010,960),
               (1052,1036),(1120,1100),(1158,1200),(1168,1350),(1172,1500),(1168,1620),(1140,1690),(1100,1738),(1046,1745),(1034,1850),(1030,2200),
               (32,2200),(40,2015),(8,1997),(8,1931),(97,1925),(100,1662),(126,1638),(152,1588),(200,1500),(228,1387),(236,1222),
               (312,1176),(332,1100),(420,1046),(529,1049),(556,933),(551,800),(578,707),(644,662)],np.float32)
pm=np.zeros((H,W),np.uint8); cv2.fillPoly(pm,[np.int32(poly)],255); pm=cv2.GaussianBlur(pm.astype(np.float32)/255,(0,0),6)
a=np.clip(iz*pm,0,1)
# refine edges with a guided filter on the photo
def guided(I,p,r=6,eps=2e-3):
    I=cv2.cvtColor(np.clip(I,0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)/255; mean=lambda x: cv2.boxFilter(x,-1,(2*r+1,2*r+1))
    mI,mp=mean(I),mean(p); A=(mean(I*p)-mI*mp)/(mean(I*I)-mI*mI+eps); B=mp-A*mI; return np.clip(mean(A)*I+mean(B),0,1)
a=guided(im,a,r=4,eps=1e-3); a=np.clip((a-0.12)/0.76,0,1)
# the man in white behind his right shoulder leaves a faint haze: harder threshold there
zone=np.zeros_like(a); zone[780:1060,960:1180]=1; zone=cv2.GaussianBlur(zone,(0,0),12)
a=a*(1-zone)+np.clip((a-0.45)/0.4,0,1)*zone
a=cv2.erode(a,np.ones((3,3),np.uint8)); a=cv2.GaussianBlur(a,(0,0),1.0)
np.save('alpha.npy',a)
# --- grade: gentle relight of the face, more clarity and contrast, warm skin, cooler shadows
def grade(x,amount=1.0):
    lab=cv2.cvtColor(np.clip(x,0,255).astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32)
    L=lab[...,0]/255
    clahe=cv2.createCLAHE(clipLimit=1.8,tileGridSize=(8,8)); Lc=clahe.apply((L*255).astype(np.uint8)).astype(np.float32)/255
    L2=L*(1-0.55*amount)+Lc*0.55*amount
    blur=cv2.GaussianBlur(L2,(0,0),12); L2=np.clip(L2+(L2-blur)*0.3*amount,0,1)            # local contrast (clarity)
    L2=np.clip((L2-0.5)*1.08+0.52,0,1)
    lab[...,0]=L2*255; out=cv2.cvtColor(np.clip(lab,0,255).astype(np.uint8),cv2.COLOR_LAB2BGR).astype(np.float32)
    lum=out.mean(-1,keepdims=True)/255
    out=out+ (np.array([-6,0,8],np.float32)*lum + np.array([10,4,-4],np.float32)*(1-lum))*amount     # warm light, cool shadows
    return np.clip(out,0,255)
# face light: soft key light around the face
yy,xx=np.mgrid[:H,:W].astype(np.float32); fx,fy=780,1050
key=np.exp(-(((xx-fx)/330)**2+((yy-fy)/380)**2))[...,None]
sub=grade(im)*(1+0.14*key)
sub=np.clip(sub,0,255)
# ---- version A: whole photo, him in focus (depth of field, darker graded surroundings)
bg=cv2.GaussianBlur(im,(0,0),17)
bgl=grade(bg,0.5); bgl=bgl*0.5+np.array([45,27,15],np.float32)*0.38                          # towards the channel navy
vig=np.clip(np.hypot((xx-fx)/(W*0.75),(yy-fy)/(H*0.7)),0,1)[...,None]; bgl=bgl*(1-0.45*vig)
af=cv2.GaussianBlur(a,(0,0),3)[...,None]
focus=sub*af+bgl*(1-af)
cv2.imwrite('portrait_focus.png',np.clip(focus,0,255).astype(np.uint8))
# ---- version B: cut out (transparent), cropped to a bust
y0,y1,x0,x1=560,2200,0,1240
inner=cv2.erode((a>0.95).astype(np.uint8),np.ones((9,9),np.uint8)).astype(np.float32)
num=cv2.GaussianBlur(sub*inner[...,None],(0,0),8); den=cv2.GaussianBlur(inner,(0,0),8)[...,None]
fillc=num/np.maximum(den,1e-3); edge=((a>0.02)&(a<0.95)).astype(np.float32)[...,None]
subc=sub*(1-edge*0.7)+fillc*edge*0.7
cut=np.dstack([np.clip(subc,0,255),a*255])[y0:y1,x0:x1]
cv2.imwrite('portrait_cut.png',cut.astype(np.uint8))
prev=cut[...,:3]*(cut[...,3:]/255)+np.array([45,27,15])*(1-cut[...,3:]/255)
cv2.imwrite('chk_portraits.jpg',np.hstack([cv2.resize(np.clip(focus,0,255).astype(np.uint8),(600,909)),cv2.resize(prev.astype(np.uint8),(int(1240*909/1640),909))]))
ov=im.copy(); cv2.polylines(ov,[np.int32(poly)],True,(0,255,255),4); cv2.imwrite('poly_chk.jpg',cv2.resize(ov,(726,1100)))
print('ok')
