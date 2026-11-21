# channel background patterns on the dark green ground
import numpy as np,cv2,sys,os
from PIL import Image,ImageDraw,ImageFont
S='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
G0=np.array([45,27,15],np.float32); G1=np.array([104,74,46],np.float32); GOLD=np.array([65,165,242],np.float32); RED=np.array([61,138,255],np.float32)
RUQ=S+'taiz/fonts/th/thmanyahserifdisplay-Bold.ttf'; RUQB=S+'taiz/fonts/th/thmanyahsans-Black.ttf'
def ground(W,H,seed=1):
    rng=np.random.default_rng(seed); yy,xx=np.mgrid[:H,:W].astype(np.float32)
    n=cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),0.9); n2=cv2.resize(cv2.GaussianBlur(rng.standard_normal((H//8,W//8)).astype(np.float32),(0,0),5),(W,H))
    c=np.ones((H,W,3),np.float32)*G0+(n/n.std()*2.6)[...,None]+(n2/n2.std()*3)[...,None]
    v=np.clip(np.hypot((xx-W/2)/(W*0.75),(yy-H/2)/(H*0.75))-0.4,0,1); return c*(1-0.35*v[...,None]),xx,yy
def over(c,m,col,a): m=np.clip(m,0,1)[...,None]*a; return c*(1-m)+np.asarray(col,np.float32)*m
def letters(W,H,seed=3,density=0.00042,size=(60,130)):
    rng=np.random.default_rng(seed); m=np.zeros((H,W),np.float32); n=int(W*H*density)
    for _ in range(n):
        ch=rng.choice(list('عزثباتلنمرسهوقكيحجدصط')); sz=int(rng.uniform(*size)); f=ImageFont.truetype(RUQ,sz,layout_engine=ImageFont.Layout.RAQM)
        im=Image.new('L',(sz*2,sz*2),0); ImageDraw.Draw(im).text((sz,sz),ch,font=f,fill=255,anchor='mm')
        g=np.array(im.rotate(rng.uniform(0,360),resample=Image.BICUBIC)).astype(np.float32)/255
        x=int(rng.uniform(-sz,W-sz)); y=int(rng.uniform(-sz,H-sz)); x0,y0=max(0,x),max(0,y); x1,y1=min(W,x+2*sz),min(H,y+2*sz)
        m[y0:y1,x0:x1]=np.maximum(m[y0:y1,x0:x1],g[y0-y:y1-y,x0-x:x1-x])
    return m
def lines_layer(W,H):
    return np.zeros((H,W),np.uint8)
def pat(k,W,H):
    c,xx,yy=ground(W,H,k)
    if k==1:   # الحروف: scattered Ruqaa letters, like the logo's patterned ring
        c=over(c,letters(W,H,3,0.00016,(70,140)),G1,0.7); c=over(c,letters(W,H,7,0.000012,(90,140)),GOLD,0.28)
    if k==2:   # الدوائر: interlocking thin rings
        m=np.zeros((H,W),np.uint8); g=np.zeros((H,W),np.uint8); r=150; rng=np.random.default_rng(5)
        for j,y in enumerate(range(-r,H+r,int(r*1.732/2*2))):
            for x in range(-r,W+r,r*2):
                cx=x+(r if j%2 else 0); cv2.circle(m,(cx*8,y*8),r*8,255,2,cv2.LINE_AA,shift=3)
                if rng.random()<0.07: cv2.circle(g,(cx*8,y*8),r*8,255,2,cv2.LINE_AA,shift=3)
        c=over(c,m/255.,G1,0.9)
        c=over(c,g/255.,GOLD,0.35)
    if k==3:   # الأسهم: rows of the logo's small triangles
        m=np.zeros((H,W),np.uint8); red=np.zeros((H,W),np.uint8); s=14; step=110; rng=np.random.default_rng(9)
        for j,y in enumerate(range(step//2,H,step)):
            for i,x in enumerate(range(step//2+(step//2 if j%2 else 0),W,step)):
                d=1 if (i+j)%2 else -1
                pts=np.array([[x-d*s,y-s*0.95],[x-d*s,y+s*0.95],[x+d*s*0.95,y]],np.float32)
                tgt=red if rng.random()<0.06 else m; cv2.fillPoly(tgt,[(pts*8).astype(np.int32)],255,cv2.LINE_AA,shift=3)
        c=over(c,m/255.,G1,0.95); c=over(c,red/255.,RED,0.55)
    if k==4:   # البوصلة: the logo geometry, large, off-centre: rings and dashed spokes
        m=np.zeros((H,W),np.uint8); cx,cy=int(W*0.82),int(H*0.78)
        for r in range(160,int(np.hypot(W,H)),170): cv2.circle(m,(cx*8,cy*8),r*8,255,2,cv2.LINE_AA,shift=3)
        for a in range(0,360,15):
            th=np.deg2rad(a); rr=160
            while rr<np.hypot(W,H):
                p1=(cx+np.cos(th)*rr,cy+np.sin(th)*rr); p2=(cx+np.cos(th)*(rr+14),cy+np.sin(th)*(rr+14))
                cv2.line(m,(int(p1[0]*8),int(p1[1]*8)),(int(p2[0]*8),int(p2[1]*8)),255,2,cv2.LINE_AA,shift=3); rr+=30
        fade=np.clip(1-np.hypot(xx-cx,yy-cy)/np.hypot(W,H)*0.9,0.25,1)
        c=over(c,m/255.*fade,G1,0.95)
        g=np.zeros((H,W),np.uint8)
        for r in (330,500,840): cv2.circle(g,(cx*8,cy*8),r*8,255,3,cv2.LINE_AA,shift=3)
        c=over(c,g/255.,GOLD,0.4)
    if k==5:   # الثبات عز: the words repeated on a slant, very faint
        f=ImageFont.truetype(RUQB,64,layout_engine=ImageFont.Layout.RAQM)
        D=int(np.hypot(W,H))+200; im=Image.new('L',(D,D),0); d=ImageDraw.Draw(im)
        for j,y in enumerate(range(0,D,120)):
            for x in range(-400+(200 if j%2 else 0),D,420): d.text((x,y),'الثبات عز',font=f,fill=255,direction='rtl',language='ar')
        im=im.rotate(-18,resample=Image.BICUBIC); a=np.array(im).astype(np.float32)/255; o=(D-H)//2,(D-W)//2
        a=a[o[0]:o[0]+H,o[1]:o[1]+W]; c=over(c,a,G1,0.8)
    if k==6:   # نقش الحلقة: the logo's engraved ring texture, recoloured green, as a full background
        L=np.load(S+'anim/layers.npz')['band']; crop=L[175:255,360:600,:3].astype(np.float32)
        t=cv2.resize(crop,(crop.shape[1]*3,crop.shape[0]*3),interpolation=cv2.INTER_CUBIC)
        t=np.concatenate([t,t[:,::-1]],1); t=np.concatenate([t,t[::-1]],0)
        tile=np.tile(t,(H//t.shape[0]+2,W//t.shape[1]+2,1))[:H,:W]
        lum=cv2.cvtColor(np.clip(tile,0,255).astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)
        hp=lum-cv2.GaussianBlur(lum,(0,0),12); m=np.clip(hp/25+0.5,0,1)
        c=c*(0.75+0.5*m[...,None])
        c=over(c,np.clip((hp-8)/20,0,1),G1,0.6)
    return np.clip(c,0,255).astype(np.uint8)
NAMES={1:'letters',2:'rings',3:'arrows',4:'compass',5:'thabat-izz',6:'engraved'}
if __name__=='__main__':
    out='/home/user/final/brand-kit/07-backgrounds/'; os.makedirs(out,exist_ok=True)
    for k in range(1,7):
        for (W,H,tag) in ((1080,1920,'vertical'),(1080,1080,'square'),(1920,1080,'landscape')):
            cv2.imwrite(out+f'bg-{k}-{NAMES[k]}-{tag}-{W}x{H}.jpg',pat(k,W,H),[cv2.IMWRITE_JPEG_QUALITY,93])
    print('ok')
