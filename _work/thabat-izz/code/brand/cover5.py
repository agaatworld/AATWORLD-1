# Facebook cover «الثبات عز» in the style of the old round logo (dark olive, thin rings, dashed spokes, red markers, frosted white Ruqaa)
import numpy as np,cv2,sys,os
from PIL import Image,ImageDraw,ImageFont
S='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
os.chdir(S+'taiz'); sys.path.insert(0,'.')
from texlib import texture_like
W,H=1640,924; C=(820,400)
LOGO=cv2.imread(S+'fbcov/oldlogo.jpg').astype(np.float32); LC=(1280,1280)
OPT=int(os.environ.get('OPT','5')); GOLD=np.array([40,168,252],np.float32)
BGC=np.array({6:[24,24,26],7:[24,24,26],9:[16,16,17],10:[24,24,26]}.get(OPT,[24,35,32]),np.float32)
LINE=GOLD*0.62 if OPT in (3,5,6,7,8,10) else (np.array([150,150,150],np.float32) if OPT==9 else np.array([62,71,68],np.float32))
TRI=GOLD*0.97 if OPT in (3,4,6,7,8,10) else np.array([38,30,220],np.float32)
GOLDWORDS={1:'both',4:'izz',5:'izz',6:'both',7:'both',8:'both',9:'both',10:'both'}.get(OPT,'none')
rng=np.random.default_rng(5)
yy,xx=np.mgrid[:H,:W].astype(np.float32)
def grain(sig=0.8,amp=4): n=cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),sig); return (n/n.std()*amp)[...,None]
c=np.ones((H,W,3),np.float32)*BGC+grain(0.8,3.0)+grain(6,2.0)
vig=np.clip(np.hypot((xx-W/2)/(W*0.62),(yy-H/2)/(H*0.75))-0.5,0,1)[...,None]; c=c*(1-0.35*vig)
S_=150/580
def ring_line(c,r,w=1.6,col=LINE,a=0.9):
    d=np.abs(np.hypot(xx-C[0],yy-C[1])-r); m=np.exp(-(d/w)**2)[...,None]*a; return c*(1-m)+col*m
def dashed(c,p0,p1,dl=12,gp=12,w=2,col=LINE):
    ov=np.zeros((H,W),np.uint8); p0=np.array(p0,float); p1=np.array(p1,float); L=np.linalg.norm(p1-p0); u=(p1-p0)/L; s=0
    while s<L:
        a=p0+u*s; b=p0+u*min(s+dl,L); cv2.line(ov,(int(a[0]*8),int(a[1]*8)),(int(b[0]*8),int(b[1]*8)),255,w,cv2.LINE_AA,shift=3); s+=dl+gp
    m=(ov.astype(np.float32)/255)[...,None]*0.85; return c*(1-m)+col*m
# thin rings around the words, dashed spokes, a long axis, red markers: borrowed from the logo, not the logo itself
C=(820,392)
for r,al in ((360,0.9),(470,0.9),(660,0.5)): c=ring_line(c,r,a=al)
# a faint band between the two rings, filled with scattered Ruqaa letters (echo of the logo's patterned ring)
dd=np.hypot(xx-C[0],yy-C[1]); bandm=(np.clip((dd-372)/3,0,1)*np.clip((458-dd)/3,0,1))
pat=np.zeros((H,W),np.float32); fpat=ImageFont.truetype(S+'taiz/fonts/ArefRuqaa-Regular.ttf',64,layout_engine=ImageFont.Layout.RAQM)
r2=np.random.default_rng(11)
for k in range(150):
    ang=r2.uniform(0,2*np.pi); rad=r2.uniform(380,450); ch=r2.choice(list('عزثباتلنمرسهو'))
    im=Image.new('L',(120,120),0); ImageDraw.Draw(im).text((60,60),ch,font=fpat,fill=255,anchor='mm')
    g=np.array(im.rotate(r2.uniform(0,360),resample=Image.BICUBIC)).astype(np.float32)/255
    x=int(C[0]+np.cos(ang)*rad)-60; y=int(C[1]+np.sin(ang)*rad)-60
    if 0<=x<W-120 and 0<=y<H-120: pat[y:y+120,x:x+120]=np.maximum(pat[y:y+120,x:x+120],g)
tone,patc,ta,pa={2:([40,96,140],[90,190,250],0.55,0.30),5:([52,74,70],[120,150,140],0.32,0.14),6:([70,70,72],[150,150,152],0.30,0.14),7:([70,70,72],[150,150,152],0.30,0.14),8:([52,72,68],[120,150,140],0.30,0.14),9:([60,60,62],[140,140,142],0.30,0.12),10:([40,110,165],[90,190,250],0.45,0.25)}.get(OPT,([88,104,98],[170,185,180],0.28,0.16))
tone=np.array(tone,np.float32); patc=np.array(patc,np.float32)
c=c*(1-bandm[...,None]*ta)+tone*bandm[...,None]*ta
pm=(pat*bandm*pa)[...,None]; c=c*(1-pm)+patc*pm
for k in (1,3,5,7):
    a=np.deg2rad(45*k); c=dashed(c,(C[0]+np.cos(a)*472,C[1]+np.sin(a)*472),(C[0]+np.cos(a)*600,C[1]+np.sin(a)*600))
c=dashed(c,(150,C[1]),(250,C[1])); c=dashed(c,(W-250,C[1]),(W-150,C[1]))
def tri(c,x,dirn,s=30):
    pts=np.array([[x-dirn*s,C[1]-s*0.95],[x-dirn*s,C[1]+s*0.95],[x+dirn*s*0.95,C[1]]],np.float32)
    m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[(pts*8).astype(np.int32)],255,cv2.LINE_AA,shift=3); m=(m/255.)[...,None]
    c=c*(1-m)+TRI*m
    dot=np.zeros((H,W),np.uint8); cv2.circle(dot,(int((x-dirn*s*0.25)*8),int(C[1]*8)),int(6*8),255,-1,cv2.LINE_AA,shift=3); dm_=(dot/255.)[...,None]
    c=c*(1-dm_*0.85)+np.array([200,205,235],np.float32)*dm_*0.85
    ln=np.zeros((H,W),np.uint8); cv2.line(ln,(int(x-dirn*s*0.25),C[1]),(int(x-dirn*(s+70)),C[1]),255,2,cv2.LINE_AA); lm=(ln/255.)[...,None]*0.6
    return c*(1-lm)+np.array([150,160,175],np.float32)*lm
c=tri(c,118,1); c=tri(c,W-118,-1)
# words in Ruqaa with the logo's frosted white letters
FONT=S+'taiz/fonts/ArefRuqaa-Regular.ttf' if len(sys.argv)<2 else sys.argv[1]
def word(t,h):
    f=ImageFont.truetype(FONT,600,layout_engine=ImageFont.Layout.RAQM)
    im=Image.new('L',(2600,1400),0); ImageDraw.Draw(im).text((300,300),t,font=f,fill=255,direction='rtl',language='ar')
    a=np.array(im).astype(np.float32)/255; ys,xs=np.nonzero(a>0.4); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]
    return a
ln_=word('الثبات عز',0); sc=min(380/ln_.shape[0],1180/ln_.shape[1])
ln_=cv2.resize(ln_,None,fx=sc,fy=sc,interpolation=cv2.INTER_AREA)
# split «عز» (left word) from «الثبات» at the widest empty gap in the middle
colsum=(ln_>0.1).sum(0); w_=len(colsum); best=(0,0); run=0
for x in range(int(w_*0.15),int(w_*0.7)):
    run=run+1 if colsum[x]==0 else 0
    if run>best[0]: best=(run,x)
cut=best[1]-best[0]//2; IZZ=np.zeros_like(ln_); IZZ[:,:cut]=1
def place(c,a,cx,cy):
    a=np.pad(a,24); t=texture_like(a); h,w=a.shape; x0,y0=int(cx-w/2),int(cy-h/2)
    t[...,:3]=np.clip((t[...,:3]-128)*1.05+150,0,255)          # a little whiter, like the logo's letters
    if GOLDWORDS!='none':
        gm=np.ones((h,w),np.float32) if GOLDWORDS=='both' else np.pad(IZZ,24)
        gt=np.clip(GOLD*((t[...,:3].mean(-1,keepdims=True)/225)**0.9),0,255)
        t[...,:3]=t[...,:3]*(1-gm[...,None])+gt*gm[...,None]
    al=t[...,3:]/255; sh=cv2.GaussianBlur(a,(0,0),8)*0.8
    sub=c[y0+9:y0+h+9,x0+6:x0+w+6]; c[y0+9:y0+h+9,x0+6:x0+w+6]=sub*(1-sh[...,None])+8*sh[...,None]
    sub=c[y0:y0+h,x0:x0+w]; c[y0:y0+h,x0:x0+w]=sub*(1-al)+t[...,:3]*al; return c
c=place(c,ln_,C[0],C[1]+10)
out=np.clip(c,0,255).astype(np.uint8)
cv2.imwrite(S+f'brand5/cover_opt{OPT}.png',out)
print('ok',ln_.shape)
