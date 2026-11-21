# «الثبات عز» logo, camera / lens animation.
# the camera iris opens on a soft-focus frame; the lens rings turn and settle while the focus pulls in;
# the iris in the centre opens on the road; the man rises (focus moves to him); «عز» stretches out from behind him;
# «الثبات» settles; «الكلمة» / «مقاومة» are written; the shutter clicks. Quiet foley: lens motor, air, breeze, shutter.
# usage: anim4.py <intro|outro> <v|l|p> [stills...]
import numpy as np,cv2,sys,subprocess,soundfile as sf,functools,os
from scipy.signal import butter,sosfilt,fftconvolve
sys.path.insert(0,'/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/anim'); import icons; from icons import icon_row
icons.GOLD_T=np.array([110,197,255],np.float32); icons.GOLD_B=np.array([65,165,242],np.float32)   # brand amber
D_='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
KIND=sys.argv[1]; FMT=sys.argv[2]
W,H={'v':(1080,1920),'l':(1920,1080),'p':(1080,1440)}[FMT]; FPS=30; S=960; k=S/2048
BP=np.load(D_+'nlogo/brand_parts.npz')
def rs(a,interp=cv2.INTER_AREA): return cv2.resize(a.astype(np.float32),(S,S),interpolation=interp)
CX,CY=1008.5*k,1027.1*k; BCX,BCY=1008*k,1019*k
DCX,DCY,RIN=1012.7*k,1015.1*k,438*k; Dd=int(round(2*RIN))
yy,xx=np.mgrid[:S,:S].astype(np.float32); TH=np.arctan2(yy-CY,xx-CX); RR=np.hypot(xx-CX,yy-CY)
OUT0=rs(BP['OUT0']); M_={n:np.clip(rs(BP[n]),0,1) for n in ('ground','band','lines','rim','tri','TOP','BOT')}
r1=M_['lines']*(np.abs(RR/k-663.5)<9); r2=M_['lines']*(np.abs(RR/k-966.4)<9); spk=np.clip(M_['lines']-r1-r2,0,1)
def dil(m,r): return cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*r+1,2*r+1)))
WORDA=lambda m: np.clip(cv2.GaussianBlur(dil((m>0.05).astype(np.float32),16),(0,0),3)*1.2,0,1)
TA,BA=WORDA(M_['TOP']),WORDA(M_['BOT'])
drd=np.hypot(xx-DCX,yy-DCY)
cover=np.clip(np.maximum.reduce([dil(M_['lines'],2),dil(M_['band'],3),dil(M_['rim'],3),dil(M_['tri'],4),TA,BA,(drd<RIN+3).astype(np.float32)]),0,1)
w_=1-cover; num=cv2.GaussianBlur(OUT0*w_[...,None],(0,0),8); den=cv2.GaussianBlur(w_,(0,0),8)[...,None]
num2=cv2.GaussianBlur(OUT0*w_[...,None],(0,0),45); den2=cv2.GaussianBlur(w_,(0,0),45)[...,None]
wb=np.clip(den*4,0,1); lowg=(num/np.maximum(den,1e-3))*wb+(num2/np.maximum(den2,1e-3))*(1-wb); lowg[drd<RIN+3]=OUT0[drd<RIN+3]*0+np.array([30,18,10],np.float32)
rg=np.random.default_rng(11); gr=cv2.GaussianBlur(rg.standard_normal((S,S)).astype(np.float32),(0,0),0.7); gr=gr/gr.std()*2.5
GROUND=OUT0*(1-cover[...,None])+(lowg+gr[...,None])*cover[...,None]
L4=lambda m: np.dstack([OUT0,m])
def sym(Lr):          # the rings and the axis lines are the same every quarter turn: fill the parts hidden under the words
    out=Lr.copy()
    for k_ in (90,180,270):
        Mk=cv2.getRotationMatrix2D((CX,CY),k_,1.0); Lk=cv2.warpAffine(Lr,Mk,(S,S))
        take=(Lk[...,3]>out[...,3])[...,None]; out=np.where(take,Lk,out)
    return out
BANDL=L4(M_['band']); R1L=sym(L4(r1)); R2L=sym(L4(r2)); SPKL=sym(L4(spk)); RIML=L4(M_['rim'])
TRIRGB=OUT0; TRI=M_['tri']; TOPL=L4(TA); BOTL=L4(BA)
def rd(a): return cv2.resize(a.astype(np.float32),(Dd,Dd),interpolation=cv2.INTER_AREA)
C0=rd(BP['C0']); CB=rd(BP['CB']); A=rd(BP['A']); IZL=rd(BP['IZL']); LTL=rd(BP['LTL'])
dy_,dx_=np.mgrid[:Dd,:Dd].astype(np.float32); DISCM=np.clip((Dd/2-0.5-np.hypot(dx_-Dd/2+0.5,dy_-Dd/2+0.5))/1.2,0,1)
ys,xs=np.nonzero(A>0.5); MANX=xs.mean()
def ease(x): x=np.clip(x,0,1); return 1-(1-x)**3
def eio(x): x=np.clip(x,0,1); return x*x*(3-2*x)
def back(x,s=1.4): x=np.clip(x,0,1); return 1+(s+1)*(x-1)**3+s*(x-1)**2
def seg(t,a,b): return float(np.clip((t-a)/(b-a),0,1))
def bump(x): return float(np.sin(np.pi*np.clip(x,0,1)))
kb=Dd/1200
def paint(c,m,col,glow):
    if m.max()<0.01: return c
    od=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*max(1,int(5*kb))+1,)*2))
    sh=np.roll(np.roll(cv2.GaussianBlur(od,(0,0),max(1,6*kb)),max(1,int(6*kb)),0),max(1,int(5*kb)),1)*0.5; c=c*(1-sh[...,None])
    g=np.clip(cv2.GaussianBlur(od,(0,0),max(1,12*kb))*1.2,0,1)*0.45; c=255-(255-c)*(255-np.clip(np.array(glow,np.float32)*g[...,None],0,255))/255
    c=c*(1-od[...,None])+np.array([20,20,22],np.float32)*od[...,None]
    return c*(1-m[...,None])+np.array(col,np.float32)*m[...,None]
def blades(size,cx,cy,R,rot,n=7,outer=(16,17,18),edge=(52,55,56)):
    """camera iris: a polygon opening of circum-radius R; returns (alpha of the blades, their colour image)"""
    sc=8; hole=np.zeros(size,np.uint8); ln=np.zeros(size,np.uint8)
    pts=[(cx+np.cos(rot+2*np.pi*i/n)*R,cy+np.sin(rot+2*np.pi*i/n)*R) for i in range(n)]
    if R>0.5: cv2.fillPoly(hole,[np.int32(np.round(np.array(pts)*sc))],255,cv2.LINE_AA,shift=3)
    L_=max(size)*2
    for i in range(n):        # each blade edge runs on past the corner
        p=np.array(pts[i]); q=np.array(pts[(i+1)%n]); d=(q-p)/max(1e-6,np.hypot(*(q-p)))
        a_=q; b_=q+d*L_
        cv2.line(ln,tuple(np.int32(np.round(a_*sc))),tuple(np.int32(np.round(b_*sc))),255,2,cv2.LINE_AA,shift=3)
    h=hole.astype(np.float32)/255; m=1-h
    yy_,xx_=np.mgrid[:size[0],:size[1]].astype(np.float32); rr=np.hypot(xx_-cx,yy_-cy)
    shade=np.clip(1.0-0.25*np.clip((rr-R)/max(40,R*0.8),0,1),0.7,1.0)[...,None]
    col=np.array(outer,np.float32)*shade+(ln.astype(np.float32)/255*(1-h))[...,None]*(np.array(edge,np.float32)-np.array(outer,np.float32))
    rimg=np.clip(1-np.abs(rr-R*np.cos(np.pi/n))/3,0,1)*0+0          # (no extra rim)
    return m,col
def rot_layer(L4,ang,cx,cy,sc=1.0,blur_deg=0.0,samples=5):
    """rotate an RGBA layer (degrees) about (cx,cy); blur_deg spreads it like a turning ring"""
    acc=np.zeros((S,S,4),np.float32); ns=samples if blur_deg>0.4 else 1
    for j in range(ns):
        a=ang+(blur_deg*(j/(ns-1)-0.5) if ns>1 else 0)
        M=cv2.getRotationMatrix2D((cx,cy),a,sc); acc+=cv2.warpAffine(L4,M,(S,S),flags=cv2.INTER_LINEAR)
    return acc/ns
def over(c,L4):
    a=np.clip(L4[...,3:4],0,1); return c*(1-a)+L4[...,:3]*a
def disc(t):
    """the «الثبات عز» picture (Dd x Dd) at time t and its alpha"""
    p=ease(seg(t,0.55,1.05)); z=1.14-0.14*p
    M=cv2.getRotationMatrix2D((Dd/2,Dd/2),0,z); bg=cv2.warpAffine(CB,M,(Dd,Dd),borderMode=cv2.BORDER_REFLECT)
    q=seg(t,1.2,1.38); bg=bg+(C0-bg)*(1-A[...,None])*q                       # muzzle flash and the light under the crutch arrive with him
    w=eio(seg(t,1.05,1.75)); reach=w*Dd*0.95                                  # «عز» stretches out from behind the man, finishes last
    mx=np.clip(1-(np.abs(dx_-MANX)-reach)/14,0,1)
    a_=IZL[...,3]*mx; c=bg*(1-a_[...,None])+IZL[...,:3]*a_[...,None]
    lt=seg(t,1.35,1.6)
    if lt>0:
        M2=np.float32([[1,0,0],[0,1,-Dd*0.12*(1-ease(lt))]]); l2=cv2.warpAffine(LTL,M2,(Dd,Dd)); a2=l2[...,3]*ease(lt)
        c=c*(1-a2[...,None])+l2[...,:3]*a2[...,None]
    mp=seg(t,0.85,1.3)
    if mp>0:                                                                  # the man rises from below, with motion blur
        offs=[(1-back(np.clip(mp-d_,0,1)))*Dd*0.75 for d_ in (0,0.025,0.05,0.075)]
        man=np.zeros_like(C0); am=np.zeros_like(A)
        for o in offs:
            M3=np.float32([[1,0,0],[0,1,o]]); man+=cv2.warpAffine(C0,M3,(Dd,Dd))*cv2.warpAffine(A,M3,(Dd,Dd))[...,None]; am+=cv2.warpAffine(A,M3,(Dd,Dd))
        man/=len(offs); am/=len(offs); man=man/np.maximum(am[...,None],1e-3)
        sh=np.roll(cv2.GaussianBlur(am,(0,0),8),10,0)*0.35; c=c*(1-sh[...,None])
        am=np.clip(am*1.08,0,1)[...,None]; c=c*(1-am)+man*am
    # the lens iris inside the ring opens on the road
    q=eio(seg(t,0.55,0.95))
    if q<1:
        bm,bc=blades((Dd,Dd),Dd/2,Dd/2,Dd/2*1.2*q,np.deg2rad(70*(1-q)),n=7,outer=(20,22,22),edge=(70,74,72))
        c=c*(1-bm[...,None])+bc*bm[...,None]
    return c,DISCM
COLT=np.array([178,226,246],np.float32); COLB=np.array([120,196,232],np.float32)
def word_text(c,m,sh_,top):
    if m.max()<0.01: return c
    g=np.clip((RR/k-560)/420,0,1)[...,None]
    if not top: g=1-g
    col=np.clip((COLB*(1-g)+COLT*g)*(0.70+0.42*sh_[...,None]),0,255)
    edge=np.clip(cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))),0,1)
    shd=np.roll(np.roll(cv2.GaussianBlur(edge,(0,0),6),6,0),4,1)*0.6
    c=c*(1-shd[...,None]); c=c*(1-edge[...,None]*0.8)+np.array([14,19,17],np.float32)*edge[...,None]*0.8
    hl=np.clip(m-np.roll(np.roll(m,1,0),1,1),0,1)*0.35
    return c*(1-m[...,None])+col*m[...,None]+hl[...,None]*np.array([250,250,250],np.float32)*0.35
def write_mask(m,p,top):
    if top: u=(-np.pi/2+0.55-TH)/1.1
    else:   u=(TH-(np.pi/2-0.55))/1.1
    return m*np.clip((p*1.3-np.clip(u,0,1))/0.3,0,1)
def logo(t):
    """the logo square (S x S) at time t"""
    c=GROUND.copy()
    # lens rings turning against each other into place
    pb=ease(seg(t,0.05,0.85)); ab=-70*(1-pb); vb=70*3/(0.8*FPS)*(1-pb)**2*3
    c=over(c,rot_layer(BANDL,ab,BCX,BCY,1.0,blur_deg=min(14,vb)))
    al=min(1,seg(t,0.0,0.25)*1.4)
    p1=ease(seg(t,0.1,0.85)); L1=rot_layer(R1L,0,CX,CY,0.8+0.2*p1); L1[...,3]*=al; c=over(c,L1)
    p2=ease(seg(t,0.05,0.8)); L2=rot_layer(R2L,0,CX,CY,1.28-0.28*p2); L2[...,3]*=al; c=over(c,L2)
    ps=ease(seg(t,0.1,0.9)); Ls=rot_layer(SPKL,45*(1-ps),CX,CY,1.0,blur_deg=min(10,45*3/(0.8*FPS)*(1-ps)**2*3)); Ls[...,3]*=al; c=over(c,Ls)
    q=back(seg(t,0.4,0.85))
    for side in (xx<S/2,xx>=S/2):
        sgn=-1 if side[0,0] else 1
        Mt=np.float32([[1,0,sgn*S*0.4*(1-q)],[0,1,0]]); tr=cv2.warpAffine(TRIRGB,Mt,(S,S)); tm=cv2.warpAffine(TRI*side,Mt,(S,S))*min(1,seg(t,0.4,0.5)*3)
        c=c*(1-tm[...,None])+tr*tm[...,None]
    c=over(c,RIML)
    # focus moves to the man while he rises: the frame goes soft, then sharp again
    sf_=2.4*bump(seg(t,0.8,1.5))
    if sf_>0.3: c=cv2.GaussianBlur(c,(0,0),sf_)
    dc,da=disc(t); x0,y0=int(round(DCX-Dd/2)),int(round(DCY-Dd/2))
    sub=c[y0:y0+Dd,x0:x0+Dd]; a=da[...,None]; c[y0:y0+Dd,x0:x0+Dd]=sub*(1-a)+dc*a
    for Lw,p_,top in ((TOPL,seg(t,1.4,1.8),True),(BOTL,seg(t,1.55,1.95),False)):
        if p_>0:
            a_=write_mask(Lw[...,3],p_,top); c=c*(1-a_[...,None])+Lw[...,:3]*a_[...,None]
    gp=seg(t,2.08,2.5)
    if 0<gp<1:
        d=(xx+(yy-S/2)*0.45)-(-300+(S+600)*gp); g=np.exp(-(d/110)**2)*0.3*(RR<966.4*k*1.02)
        c=c+(255-c)*g[...,None]*np.array([0.6,0.85,1.0],np.float32)
    return c
# ---------------- camera: the frame round the logo
BGC=np.array([45,27,15],np.float32)     # brand navy #0F1B2D
@functools.lru_cache(maxsize=None)
def ground():
    rng=np.random.default_rng(5); y_,x_=np.mgrid[:H,:W].astype(np.float32)
    n=cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),0.8); n2=cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),6)
    n3=cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),40)
    c=np.ones((H,W,3),np.float32)*BGC+(n/n.std()*3)[...,None]+(n2/n2.std()*2)[...,None]+(n3/n3.std()*3)[...,None]
    return c*(1-0.45*np.clip(np.hypot((x_-W/2)/(W*0.7),(y_-H/2)/(H*0.6))-0.4,0,1)[...,None])
LM=np.clip((S/2-2-np.hypot(xx-S/2,yy-S/2))/20,0,1)[...,None]
def place(c,img,cx,cy,s=1.0,rot=0.0,alpha=1.0):
    M=cv2.getRotationMatrix2D((S/2,S/2),rot,s); M[0,2]+=cx-S/2; M[1,2]+=cy-S/2
    rgb=cv2.warpAffine(img,M,(W,H),borderMode=cv2.BORDER_CONSTANT); a=cv2.warpAffine(LM[...,0],M,(W,H))[...,None]*alpha
    return c*(1-a)+rgb*a
T=2.15
SNAP=2.0
def aperture(t):
    """camera iris radius as a fraction (0 closed .. 1 open)"""
    o=ease(seg(t,0.0,0.42))
    if SNAP<=t<SNAP+0.16:                       # the shutter: shut and open again
        x=(t-SNAP)/0.16; o=min(o,abs(x-0.4)/0.6 if x>=0.4 else 1-x/0.4)
    if KIND=='intro': o=min(o,1-eio(seg(t,T+1.5,T+1.85)))        # holds 1.5 s, then the lens closes
    else: o=min(o,1-eio(seg(t,T+2.1,T+2.45)))
    return o
def camera(c,t):
    o=aperture(t)
    if o>=0.999: return c
    R=np.hypot(W,H)/2*1.12*o; m,col=blades((H,W),W/2,H/2,R,np.deg2rad(-50*(1-o)+20),n=7)
    return c*(1-m[...,None])+col*m[...,None]
def focus(img,t):
    """soft focus at the start, a little hunting, then sharp; colour fringes while out of focus"""
    s=9*(1-ease(seg(t,0.05,0.75)))+2.2*bump(seg(t,0.55,0.9))
    if s<0.3: return img
    b=cv2.GaussianBlur(img,(0,0),s); e=s*0.0016
    out=b.copy()
    for ch,sc in ((2,1+e),(0,1-e)):
        M=cv2.getRotationMatrix2D((S/2,S/2),0,sc); out[...,ch]=cv2.warpAffine(b[...,ch],M,(S,S),borderMode=cv2.BORDER_REFLECT)
    return out
def frame(t):
    c=ground().copy(); cx,cy=W/2,H/2
    tl=min(t,T); lg=focus(logo(tl),t)
    s=1.16-0.16*ease(seg(t,0,1.0))+0.02*eio(seg(t,1.0,T)); r=-3*(1-ease(seg(t,0,1.0)))
    dx=1.2*np.sin(2*np.pi*0.7*t); dy=1.0*np.sin(2*np.pi*0.53*t+1)
    if KIND=='intro' or t<T:
        c=place(c,lg,cx+dx,cy+dy,s,r)
        if 0<t-SNAP<0.3: c=c+(255-c)*0.22*(1-(t-SNAP)/0.3)
        return camera(c,t)
    q=eio((t-T)/0.35)
    if FMT=='l': c=place(c,lg,cx-330*q+dx,cy+dy,s*(1-0.12*q)); ix,iy,isz=W/2+440,cy,150
    elif FMT=='v': c=place(c,lg,cx+dx,cy-140*q+dy,s*(1-0.1*q)); ix,iy,isz=W/2,1410,150
    else: c=place(c,lg,cx+dx,cy-110*q+dy,s*(1-0.2*q)); ix,iy,isz=W/2,1180,130
    if 0<t-SNAP<0.3: c=c+(255-c)*0.22*(1-(t-SNAP)/0.3)
    if t>T+0.2: c=icon_row(c,ix,iy,t-T-0.2,isz,60)
    return camera(c,t)
LEN=T+1.9 if KIND=='intro' else T+2.5
# ---------------- quiet foley from the sound library (Mixkit, free licence)
SR=44100; SX=D_+'sfx2/'
def load(i,a=0.0,b=None):
    x,sr=sf.read(SX+f'm{i}.wav',dtype='float32'); x=x.mean(1) if x.ndim>1 else x
    x=x[int(a*sr):(int(b*sr) if b else None)]
    n=len(x); f=np.ones(n,np.float32); k_=min(n//4,int(0.02*sr)); f[:k_]=np.linspace(0,1,k_); k2=min(n//3,int(0.08*sr)); f[-k2:]=np.linspace(1,0,k2)
    return x*f
def sound(n):
    a=np.zeros(n,np.float32)
    def add(x,t0,db):
        j=int(t0*SR); m=min(len(x),n-j)
        if m>0: a[j:j+m]+=x[:m]*10**(db/20)
    br=load(2427,6.0,6.0+LEN+0.5)                       # a light breeze under everything
    env=np.minimum(1,np.arange(len(br))/(0.6*SR))*np.clip((LEN-np.arange(len(br))/SR)/0.5,0,1); add(br*env,0,-21)
    add(load(1436,0.08,0.6),0.0,-17)                     # the iris / lens motor opening
    add(load(167,0.0,1.3),0.08,-17)                      # rings turning: a long soft air sweep
    add(load(1437,0.75,1.15),0.62,-8)                    # the focus hunts once
    add(load(2605,0.0,0.9),0.86,-15)                     # the man rises: quick air
    add(load(1474,0.45,1.9),0.95,-17)                    # «عز» stretching: a windy swoosh
    add(load(1433,0.0,0.45),SNAP-0.01,-10)               # the shutter
    if KIND=='intro': add(load(1438,0.0,0.4),T+1.52,-6)    # the iris closes into the video
    else:
        add(load(1468,0.15,0.9),T+0.18,-18)              # the icons arrive on a soft breath of air
        add(load(1439,0.0,0.6),T+2.1,-16)                # the lens closes
    sos=butter(2,140/(SR/2),'highpass',output='sos'); a=sosfilt(sos,a)             # no rumble, no heavy bass
    sos=butter(2,11000/(SR/2),'lowpass',output='sos'); a=sosfilt(sos,a)
    rng=np.random.default_rng(2); L=int(0.7*SR); ir=rng.standard_normal(L).astype(np.float32)*np.exp(-np.arange(L)/(0.16*SR)); ir/=np.sqrt((ir**2).sum())
    wet=fftconvolve(a,ir)[:n]; a=a*0.88+wet*0.2                                    # a little air round it
    pk=np.abs(a).max(); a=a/pk*10**(-4.5/20)
    return np.stack([a,a],1)
def main():
    st=[float(x) for x in sys.argv[3:]]
    if st:
        for t in st: cv2.imwrite(f'a4_{KIND}_{FMT}_{t}.jpg',np.clip(frame(t),0,255).astype(np.uint8))
        return
    n=int(LEN*FPS); name=f'brand-{KIND}'+{'v':'','l':'-landscape','p':'-1080x1440'}[FMT]
    enc=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',name+'_v.mp4'],stdin=subprocess.PIPE)
    for i in range(n): enc.stdin.write(np.clip(frame(i/FPS),0,255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait(); sf.write(name+'_a.wav',sound(n*SR//FPS),SR)
    os.makedirs('/home/user/final/new-logo',exist_ok=True)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',name+'_v.mp4','-i',name+'_a.wav','-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',f'/home/user/final/new-logo/{name}.mp4'],check=True)
    print('ok',name,n)
if __name__=='__main__': main()
