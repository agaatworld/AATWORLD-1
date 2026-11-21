# full-screen reel in the channel style: the clip fills the whole 1080x1920 page (no small window); amber frame and corner marks,
# navy fades top and bottom, title, captions, source, the logo in one corner, slow golden particles; voices only; cover + outro.
# mode "audio": a sound-only clip gets our own picture (rings that breathe with the voice).   usage: fullreel.py cfg.json [stills...]
import numpy as np,cv2,json,subprocess,sys,os,soundfile as sf
from PIL import Image,ImageDraw,ImageFont
S_='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'; TH=S_+'taiz/fonts/th/'; K='/home/user/final/brand-kit/'
W,H,FPS=1080,1920,30
NAVY=np.array([45,27,15],np.float32); AMBER=np.array([65,165,242],np.float32)
COL={0:(244,233,216),1:(255,138,61),2:(242,165,65)}
cfg=json.load(open(sys.argv[1])); NAME=cfg['name']; WD=os.path.dirname(os.path.abspath(sys.argv[1])); stills=[float(x) for x in sys.argv[2:]]
def F(n,s): return ImageFont.truetype(TH+n,s,layout_engine=ImageFont.Layout.RAQM)
def text_rgba(lines,size,fname='thmanyahsans-Bold.ttf',lead=1.18,stroke=None,k=0):
    f=F(fname,size); sw=stroke if stroke is not None else max(2,size//14); asc,desc=f.getmetrics(); ims=[]
    for runs in lines:
        words=[(w.replace('~','ـ'*k),hl) for t,hl in runs for w in t.split()]; sp=f.getlength(' ')
        ws=[f.getlength(w,direction='rtl',language='ar') for w,_ in words]
        tw=int(sum(ws)+sp*(len(ws)-1))+6*sw; hh=int((asc+desc)*1.1)+4*sw
        im=Image.new('RGBA',(tw,hh),(0,0,0,0)); d=ImageDraw.Draw(im); x=tw-3*sw
        for (w,hl),wd in zip(words,ws):
            d.text((x,2*sw),w,font=f,fill=COL[hl]+(255,),anchor='ra',direction='rtl',language='ar',stroke_width=sw,stroke_fill=(10,16,28,255)); x-=wd+sp
        ims.append(np.array(im).astype(np.float32))
    step=int(size*lead); Wm=max(i.shape[1] for i in ims); Ht=step*(len(ims)-1)+ims[-1].shape[0]; out=np.zeros((Ht,Wm,4),np.float32)
    for j,i in enumerate(ims):
        y=j*step; x=(Wm-i.shape[1])//2; o=out[y:y+i.shape[0],x:x+i.shape[1]]; a=i[...,3:]/255
        o[...,:3]=o[...,:3]*(1-a)+i[...,:3]*a; o[...,3:]=np.maximum(o[...,3:],i[...,3:])
    out[...,:3]=out[...,:3][...,::-1].copy(); out[...,3]/=255; return out
def put(c,img,cx,cy,s=1.0,alpha=1.0,shadow=0.5):
    if alpha<=0.01: return c
    h,w=img.shape[:2]; M=np.float32([[s,0,cx-w*s/2],[0,s,cy-h*s/2]])
    rgba=cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT); a=rgba[...,3:]*alpha
    if shadow>0: sh=np.roll(np.roll(cv2.GaussianBlur(rgba[...,3],(0,0),7),6,0),3,1)[...,None]*shadow*alpha; c=c*(1-sh)
    return c*(1-a)+rgba[...,:3]*a
def ease(x): x=float(np.clip(x,0,1)); return 1-(1-x)**3
def runs(line):
    import re; out=[]
    for part in re.split(r'(\[\[.*?\]\]|\{.*?\})',line):
        if not part.strip(): continue
        out.append((part[2:-2].strip(),1) if part.startswith('[[') else (part[1:-1].strip(),2) if part.startswith('{') else (part.strip(),0))
    return out
def lines(s): return [runs(l) for l in s.split(' / ')]
rng=np.random.default_rng(7); yy,xx=np.mgrid[:H,:W].astype(np.float32)
# ---------------- fixed layers
TITLE=text_rgba([runs(t) for t in cfg['title']],cfg.get('tsize',70),'thmanyahsans-Black.ttf',lead=1.12)
if TITLE.shape[1]>960: TITLE=cv2.resize(TITLE,None,fx=960/TITLE.shape[1],fy=960/TITLE.shape[1],interpolation=cv2.INTER_AREA)
TY=cfg.get('title_y',255)+TITLE.shape[0]/2
def mkcap(a,b,L):
    if not any('~' in t for r in L for t,_ in r): return text_rgba(L,cfg.get('csize',62))
    Kk=int(np.clip((b-a)*5,3,14)); return [text_rgba(L,cfg.get('csize',62),k=j) for j in range(Kk+1)]
CAPS=[(a,b,mkcap(a,b,lines(s))) for a,b,s in cfg['caps']]
CAPY=cfg.get('cap_y',1520)
CRED=None
if cfg.get('credit'):
    t=text_rgba([[('المصدر:',2),(cfg['credit'],0)]],34,'thmanyahsans-Bold.ttf',stroke=2)
    pad=np.zeros((t.shape[0]+26,t.shape[1]+56,4),np.float32); r=pad.shape[0]//2; pl=np.zeros(pad.shape[:2],np.uint8)
    cv2.rectangle(pl,(r,0),(pad.shape[1]-r,pad.shape[0]),255,-1); cv2.circle(pl,(r,r),r,255,-1); cv2.circle(pl,(pad.shape[1]-r,r),r,255,-1)
    pad[...,:3]=np.array([62,42,24],np.float32); pad[...,3]=pl/255*0.92
    y0=(pad.shape[0]-t.shape[0])//2; x0=(pad.shape[1]-t.shape[1])//2; o=pad[y0:y0+t.shape[0],x0:x0+t.shape[1]]; a=t[...,3:]
    o[...,:3]=o[...,:3]*(1-a)+t[...,:3]*a; o[...,3:]=np.maximum(o[...,3:],a); CRED=pad
CREDY=cfg.get('credit_y',1790)
LOGO=cv2.resize(cv2.imread(K+'01-logo/logo-dark-round-256.png',-1).astype(np.float32),(140,140),interpolation=cv2.INTER_AREA); LOGO[...,3]/=255
# navy fades: top (title) and bottom (captions); strength from the config
TOPF=np.clip(1-yy/cfg.get('top_fade',560),0,1)**1.5*cfg.get('top_alpha',0.78)
BOTF=np.clip((yy-cfg.get('bot_from',1250))/(H-cfg.get('bot_from',1250)),0,1)**1.2*cfg.get('bot_alpha',0.9)
if cfg.get('band'):                                      # a slim navy band only where the source has its own text
    y0b,y1b=cfg['band']; BOTF=np.maximum(BOTF,np.clip((yy-(y0b-18))/18,0,1)*np.clip(((y1b+18)-yy)/18,0,1)*0.96)
if cfg.get('plate_y'):                                   # a solid navy band that also hides text burned into the source
    BOTF=np.maximum(BOTF,np.clip((yy-(cfg['plate_y']-90))/90,0,1)*0.97)
VIG=(1-0.35*np.clip(np.hypot((xx-W/2)/(W*0.75),(yy-H/2)/(H*0.62))-0.45,0,1))[...,None]
GRAIN=[cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),0.7)[...,None]*3.0 for _ in range(4)]
# the frame: a thin amber border inset, with heavier corner marks
FR=np.zeros((H,W),np.uint8); m=26
cv2.rectangle(FR,(m*8,m*8),((W-m)*8,(H-m)*8),255,2,cv2.LINE_AA,shift=3)
for (x,y,dx,dy) in ((m,m,1,1),(W-m,m,-1,1),(m,H-m,1,-1),(W-m,H-m,-1,-1)):
    cv2.line(FR,(x*8,y*8),((x+dx*90)*8,y*8),255,6,cv2.LINE_AA,shift=3); cv2.line(FR,(x*8,y*8),(x*8,(y+dy*90)*8),255,6,cv2.LINE_AA,shift=3)
FR=FR.astype(np.float32)/255
# slow golden particles drifting up (kept off the centre, where the face is)
NP=70; PX=rng.uniform(0,W,NP); PY=rng.uniform(0,H,NP); PV=rng.uniform(12,38,NP); PS=rng.uniform(1.2,3.4,NP); PP=rng.uniform(0,6.28,NP)
def particles(c,t):
    m=np.zeros((H,W),np.float32)
    for i in range(NP):
        x=(PX[i]+18*np.sin(t*0.6+PP[i]))%W; y=(PY[i]-PV[i]*t)%H
        a=0.55+0.45*np.sin(t*1.7+PP[i]); cv2.circle(m,(int(x*4),int(y*4)),int(PS[i]*4),float(a),-1,cv2.LINE_AA,shift=2)
    m=cv2.GaussianBlur(m,(0,0),1.6)*2.2
    keep=np.clip(np.hypot((xx-W/2)/(W*0.36),(yy-H*0.47)/(H*0.30))-0.6,0,1)      # fewer in the middle
    m=np.clip(m*keep,0,1)*cfg.get('particles',0.55)
    return c+(np.array([120,200,255],np.float32)-c)*m[...,None]*0.8
def grade(v):
    lum=v.mean(-1,keepdims=True)/255; g=np.array([70,40,18],np.float32)*(1-lum)+np.array([150,205,250],np.float32)*lum
    return v*(1-0.14)+g*lum*0.14*1.6
def caption(c,t):
    for a,b,img in CAPS:
        if a-0.05<=t<b+0.18:
            if isinstance(img,list): img=img[int(round((len(img)-1)*ease(min(1,(t-a)/max(0.3,(b-a)*0.85)))))]
            p=ease((t-a+0.05)/0.22); q=1-ease((t-b)/0.18) if t>b else 1.0; s=min(1,980/img.shape[1])
            c=put(c,img,W/2,CAPY+14*(1-p),s,alpha=p*q,shadow=0.6)
    return c
def chrome(c,t,cover=False):
    """everything that sits on top of the picture"""
    c=c*(1-TOPF[...,None])+NAVY*TOPF[...,None]; c=c*(1-BOTF[...,None])+NAVY*BOTF[...,None]
    c=c*VIG+GRAIN[int(t*FPS)%4]
    c=particles(c,t)
    fa=ease((t-0.1)/0.6) if not cover else 1.0
    c=c*(1-FR[...,None]*0.9*fa)+AMBER*FR[...,None]*0.9*fa
    c=put(c,TITLE,W/2,TY+20*(1-ease(t/0.5)) if not cover else TY,alpha=1.0 if cover else ease(t/0.4),shadow=0.6)
    c=put(c,LOGO,26+20+70,26+20+70,shadow=0.4)
    if CRED is not None: c=put(c,CRED,W/2,CREDY,shadow=0.35)
    return c if cover else caption(c,t)
# ---------------- picture sources
def cover_fill(src):
    j=json.loads(subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',src],capture_output=True,text=True).stdout)
    sw,sh=j['streams'][0]['width'],j['streams'][0]['height']; s=max(W/sw,H/sh); w,h=int(round(sw*s))//2*2,int(round(sh*s))//2*2
    zoom=cfg.get('zoom',1.0); w,h=int(w*zoom)//2*2,int(h*zoom)//2*2
    return f'scale={w}:{h}:flags=lanczos,crop={W}:{H}:{(w-W)//2+cfg.get("shift_x",0)}:{(h-H)//2+cfg.get("shift_y",0)}'
def reader(src,t0,t1):
    vf=f'fps={FPS},'+cover_fill(src)
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-ss',str(t0),'-t',str(t1-t0),'-i',src,'-vf',vf,'-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
    while True:
        b=p.stdout.read(W*H*3)
        if len(b)<W*H*3: break
        yield np.frombuffer(b,np.uint8).reshape(H,W,3).astype(np.float32)
def audio_frames(voc,t0,t1):
    """picture for a sound-only clip: our ground, three rings breathing with the voice, a soft light in the middle"""
    a,sr=sf.read(voc); a=a.mean(1) if a.ndim>1 else a; a=a[int(t0*sr):int(t1*sr)]
    hop=sr//FPS; env=np.array([np.sqrt((a[i:i+hop]**2).mean()) for i in range(0,len(a)-hop+1,hop)]); env=env/max(1e-6,np.percentile(env,98))
    env=np.convolve(env,np.ones(4)/4,'same')
    g=np.ones((H,W,3),np.float32)*NAVY+(0.6*cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),40))[...,None]*4
    cx,cy=W/2,H*0.47
    for i,e in enumerate(env):
        t=i/FPS; c=g.copy(); m=np.zeros((H,W),np.uint8)
        glow=np.exp(-(((xx-cx)/(260+90*e))**2+((yy-cy)/(260+90*e))**2)); c=c+(np.array([90,120,165],np.float32)-c)*glow[...,None]*(0.35+0.4*e)
        for k,(r,d) in enumerate(((200,1),(250,-1),(305,1))):
            rr=r*(1+0.06*e*(k+1)); th=d*(20*t+40*k)
            for j in range(48):
                a0=th+j*7.5; cv2.ellipse(m,(int(cx*8),int(cy*8)),(int(rr*8),)*2,0,a0,a0+4.2,255,4,cv2.LINE_AA,shift=3)
        # a circular wave of the voice round the inner ring
        pts=[]; seg=env[max(0,i-60):i+1]; seg=np.pad(seg,(60-len(seg)+1,0))
        for j in range(181):
            an=np.deg2rad(j*2); v=seg[int(j/180*60)]; r=160-60*v*np.abs(np.sin(an*3+t*2))
            pts.append((cx+np.cos(an)*r,cy+np.sin(an)*r))
        cv2.polylines(m,[np.int32(np.array(pts)*8)],True,255,4,cv2.LINE_AA,shift=3)
        a_=(m/255.)[...,None]*0.8; c=c*(1-a_)+AMBER*a_
        yield c
# ---------------- render
def render():
    t0,t1=cfg.get('t0',0),cfg['t1']; n=0; cover=None
    enc=None if stills else subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',f'{WD}/{NAME}_v.mp4'],stdin=subprocess.PIPE)
    src=reader(cfg['src'],t0,t1) if cfg.get('mode','video')=='video' else audio_frames(cfg['voice'],t0,t1)
    last=None
    for v in src:
        t=n/FPS; last=v
        if cfg.get('mode','video')=='video':
            if cfg.get('inpaint'):                       # erase the text burned into the source, keep the face under it
                y0i,y1i=cfg['inpaint']; sub=np.clip(v[y0i:y1i],0,255).astype(np.uint8); hsv=cv2.cvtColor(sub,cv2.COLOR_BGR2HSV)
                mk=((sub.min(-1)>195)&(hsv[...,1]<45)).astype(np.uint8)*255
                mk=cv2.dilate(mk,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
                fill=cv2.inpaint(sub,mk,7,cv2.INPAINT_TELEA).astype(np.float32)
                soft=cv2.GaussianBlur(fill,(0,0),3); w_=cv2.GaussianBlur(mk.astype(np.float32)/255,(0,0),4)[...,None]
                v=v.copy(); v[y0i:y1i]=fill*(1-w_)+soft*w_
            v=grade(v)
            if cfg.get('blur_from'): y0=cfg['blur_from']; v=v.copy(); v[y0:]=cv2.GaussianBlur(v[y0:],(0,0),30)*0.6      # hide text burned into the source
            if cfg.get('band'): y0b,y1b=cfg['band']; v=v.copy(); v[y0b-20:y1b+20]=cv2.GaussianBlur(v[y0b-20:y1b+20],(0,0),30)*0.6
        if stills:
            if any(abs(x-t)<0.5/FPS for x in stills): cv2.imwrite(f'{WD}/{NAME}_{[x for x in stills if abs(x-t)<0.5/FPS][0]}.jpg',np.clip(chrome(v,t),0,255).astype(np.uint8))
        else: enc.stdin.write(np.clip(chrome(v,t),0,255).astype(np.uint8).tobytes())
        if cover is None and t>=cfg.get('cover_t',1.0): cover=chrome(v,t,cover=True)
        n+=1
        if stills and t>max(stills): return
    hold=cfg.get('hold',0.6)
    for k in range(int(hold*FPS)):
        t=n/FPS; img=chrome(grade(last) if cfg.get('mode','video')=='video' else last,t); enc.stdin.write(np.clip(img,0,255).astype(np.uint8).tobytes()); n+=1
    enc.stdin.close(); enc.wait()
    tmp=f'{WD}/{NAME}_vt.wav'; subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(t0),'-t',str(t1-t0),'-i',cfg['voice'],'-ac','2','-ar','48000',tmp],check=True)
    a,_=sf.read(tmp,dtype='float32')
    from scipy.signal import butter,sosfiltfilt
    a=sosfiltfilt(butter(2,85,'highpass',fs=48000,output='sos'),a,axis=0).astype(np.float32)
    L=int(n/FPS*48000); A=np.zeros((L,2),np.float32); A[:min(L,len(a))]=a[:L]
    f0=int((t1-t0-0.15)*48000); f1=min(L,int((t1-t0+hold)*48000)); A[f0:f1]*=np.linspace(1,0,f1-f0)[:,None]; A[f1:]=0
    A*=10**(-1.5/20)/max(1e-6,np.abs(A).max()); sf.write(f'{WD}/{NAME}_a.wav',A,48000)
    cv2.imwrite(f'{WD}/{NAME}_cover.jpg',np.clip(cover,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,93])
    OUT=cfg['out']; os.makedirs(os.path.dirname(OUT),exist_ok=True)
    cv2.imwrite(OUT.replace('.mp4','-cover.jpg'),np.clip(cover,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,93])
    outro=K+'04-intro-outro/outro-vertical-1080x1920.mp4'
    subprocess.run(['ffmpeg','-loglevel','error','-y','-loop','1','-t','0.8','-r',str(FPS),'-i',f'{WD}/{NAME}_cover.jpg','-f','lavfi','-t','0.8','-i','anullsrc=r=48000:cl=stereo',
        '-i',f'{WD}/{NAME}_v.mp4','-i',f'{WD}/{NAME}_a.wav','-i',outro,
        '-filter_complex','[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[c];[2:v]setsar=1,fps=30,format=yuv420p[m];[4:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[o];'
        '[3:a]aformat=sample_rates=48000:channel_layouts=stereo[ma];[4:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.9[oa];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[ca];'
        '[c][ca][m][ma][o][oa]concat=n=3:v=1:a=1[v][a]','-map','[v]','-map','[a]','-c:v','libx264','-preset','medium','-crf','20','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT],check=True)
    print('ok',OUT)
render()
