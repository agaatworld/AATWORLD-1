# Facebook cover 1640x924 (mobile shows all, desktop shows the middle 1640x624 band)
import numpy as np,cv2
from PIL import Image,ImageDraw,ImageFont
S='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
LEMON=S+'cov/lemon.otf'; RUQ=S+'taiz/fonts/g_ArefRuqaa-Bold.ttf'; RUQI=S+'taiz/fonts/g_ArefRuqaaInk-Bold.ttf'
W,H=1640,924; BAND=(150,774)
GOLD=np.array([53,179,245],np.float32); WHITE=np.array([242,244,245],np.float32); RED=np.array([38,31,206],np.float32)
def mask(t,font,size,stroke=0):
    f=ImageFont.truetype(font,size,layout_engine=ImageFont.Layout.RAQM)
    bb=f.getbbox(t,direction='rtl',language='ar',stroke_width=stroke); w,h=bb[2]-bb[0]+40,bb[3]-bb[1]+40
    im=Image.new('L',(w,h),0); ImageDraw.Draw(im).text((20-bb[0],20-bb[1]),t,font=f,fill=255,direction='rtl',language='ar',stroke_width=stroke,stroke_fill=255)
    m=np.array(im).astype(np.float32)/255; ys,xs=np.where(m>0.1); return m[ys.min():ys.max()+1,xs.min():xs.max()+1]
def fit(m,w=None,h=None):
    s=min(w/m.shape[1] if w else 9,h/m.shape[0] if h else 9); return cv2.resize(m,None,fx=s,fy=s,interpolation=cv2.INTER_AREA if s<1 else cv2.INTER_CUBIC)
def place(m,cx,cy):
    M=np.zeros((H,W),np.float32); h,w=m.shape; x0,y0=int(cx-w/2),int(cy-h/2); M[y0:y0+h,x0:x0+w]=m; return M
def comp(c,M,col,a=1.0):
    col=np.broadcast_to(np.asarray(col,np.float32),c.shape); return c*(1-M[...,None]*a)+col*M[...,None]*a
def contours(seed=3):
    rng=np.random.default_rng(seed); n=rng.normal(size=(H//8,W//8)).astype(np.float32)
    z=cv2.GaussianBlur(n,(0,0),7); z=cv2.resize(z,(W,H),interpolation=cv2.INTER_CUBIC); z=(z-z.min())/(z.max()-z.min())
    v=z*26; d=np.abs(v-np.round(v)); return np.clip(1-d/0.045,0,1)
def cover_fit(img,w,h):
    ih,iw=img.shape[:2]; s=max(w/iw,h/ih); r=cv2.resize(img,(int(iw*s)+1,int(ih*s)+1),interpolation=cv2.INTER_CUBIC)
    y0=(r.shape[0]-h)//2; x0=(r.shape[1]-w)//2; return r[y0:y0+h,x0:x0+w]
CASTLE=cv2.imread(S+'wm/img/castle1.jpg').astype(np.float32)
def base():
    yy=np.linspace(0,1,H)[:,None,None]; c=(np.array([22,30,27],np.float32)*(1-yy)+np.array([12,16,15],np.float32)*yy)*np.ones((1,W,1),np.float32)
    c=comp(c,contours(),np.array([55,78,70],np.float32),0.55)
    rng=np.random.default_rng(9); c+=rng.normal(0,4,(H,W,1)).astype(np.float32)
    yy,xx=np.mgrid[:H,:W].astype(np.float32); vig=np.clip(np.hypot((xx-W/2)/(W*0.6),(yy-H/2)/(H*0.6))-0.55,0,1); return c*(1-0.6*vig[...,None])
def triangle(c,cx,cy,s,dirn):
    pts=np.float32([[cx-dirn*s,cy-s*0.75],[cx-dirn*s,cy+s*0.75],[cx+dirn*s*0.6,cy]]); cv2.fillPoly(c,[pts.astype(np.int32)],RED.tolist(),cv2.LINE_AA)
    cv2.line(c,(int(cx-dirn*s*4),int(cy)),(int(cx-dirn*s),int(cy)),(200,200,200),2,cv2.LINE_AA); return c
def shadow(c,M,dx=10,dy=14,blur=14,a=0.75):
    sh=cv2.GaussianBlur(np.roll(np.roll(M,dy,0),dx,1),(0,0),blur); return c*(1-np.clip(sh*a,0,1)[...,None])
def extrude(c,M,n=14,col=(20,14,90)):
    for i in range(n,0,-1):
        Mi=np.roll(np.roll(M,i,0),int(i*0.4),1); c=comp(c,Mi,np.array(col,np.float32)*(0.65+0.35*(1-i/n)),1)
    return c
# ---------------- A: الثبات عز fills the cover, letters are windows onto Taiz castle at sunset
def A():
    c=base()
    m=fit(mask('الثبات عز',LEMON,420),w=1150,h=350); M=place(m,W/2,368)
    ys,xs=np.where(M>0.1); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
    g=np.clip((np.arange(H)[:,None,None]-y0)/(y1-y0),0,1)
    fill=np.array([150,235,255],np.float32)*(1-g)+np.array([20,140,235],np.float32)*g
    fill=fill*np.ones((1,W,1),np.float32)+np.random.default_rng(2).normal(0,5,(H,W,1)).astype(np.float32)
    yy,xx=np.mgrid[:H,:W].astype(np.float32); glow=np.exp(-(((xx-W/2)/(W*0.42))**2+((yy-375)/(H*0.30))**2))
    c=c+np.array([20,70,150],np.float32)*glow[...,None]*0.55
    c=shadow(c,M,14,22,18,0.9); c=extrude(c,M,16)
    edge=np.clip(cv2.dilate(M,np.ones((7,7)))-M,0,1); c=comp(c,np.clip(cv2.dilate(M,np.ones((7,7))),0,1),GOLD*1.05,1)
    c=c*(1-M[...,None])+fill*M[...,None]
    hl=np.clip(M-np.roll(np.roll(M,4,0),2,1),0,1); c=comp(c,hl,np.array([200,240,255],np.float32),0.5)
    sm=fit(mask('من أرض تعز .. الكلمة مقاومة',RUQ,120),h=60); S2=place(sm,W/2,582)
    c=shadow(c,S2,4,6,6,0.8); c=comp(c,S2,WHITE)
    hw=sm.shape[1]/2; c=triangle(c,W/2+hw+45,582,15,-1); c=triangle(c,W/2-hw-45,582,15,1)
    return c
# ---------------- B: من أرض تعز / الكلمة مقاومة fills the cover over the castle at sunset
def B():
    yy,xx=np.mgrid[:H,:W].astype(np.float32)
    bg=cover_fit(CASTLE,W,H); bg=cv2.GaussianBlur(bg,(0,0),2.5)
    bg=bg*np.array([0.78,0.9,1.08],np.float32); bg=np.clip((bg-128)*1.15+118,0,255)
    dark=np.clip(0.35+0.55*np.exp(-((yy-H*0.45)/(H*0.42))**2),0,1)[...,None]
    c=bg*(1-dark*0.66)+np.array([14,18,16],np.float32)*dark*0.66
    c=comp(c,contours(5),np.array([90,150,190],np.float32),0.10)
    l1=fit(mask('من أرض تعز',RUQI,300),h=185); l2=fit(mask('الكلمة مقاومة',RUQI,300),h=185)
    sc=min(1,920/max(l1.shape[1],l2.shape[1])); l1=cv2.resize(l1,None,fx=sc,fy=sc); l2=cv2.resize(l2,None,fx=sc,fy=sc)
    M1=place(l1,W/2,335); M2=place(l2,W/2,505)
    for Mx,col in ((M1,WHITE),(M2,GOLD)):
        c=shadow(c,Mx,8,12,12,0.85); c=extrude(c,Mx,10,(10,10,40)); c=comp(c,Mx,col)
    # red slash under the second line, like the logo flag wave
    st=fit(mask('الثبات عز',LEMON,140),h=58); T=place(st,W/2,207)
    bw=st.shape[1]+120; cv2.rectangle(c,(int(W/2-bw/2),176),(int(W/2+bw/2),240),RED.tolist(),-1,cv2.LINE_AA)
    c=comp(c,T,WHITE)
    return c
if __name__=='__main__':
    for n,f in (('A',A),('B',B)):
        im=np.clip(f(),0,255).astype(np.uint8); cv2.imwrite(f'fb_{n}.png',im)
        pv=im.copy(); cv2.rectangle(pv,(0,BAND[0]),(W-1,BAND[1]),(0,255,0),2); cv2.imwrite(f'pv_{n}.jpg',cv2.resize(pv,(820,462)))
    print('ok')
