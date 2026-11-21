# full-screen reel, motion-graphics version:
#  - everything important inside the Reels safe zone (top 270 px, bottom 420 px, right 120 px kept clear)
#  - captions appear word by word in time with the voice (pop + rise); the word being said lights up
#  - strong words [[...]] slam in bigger, in orange, with a glow, an underline sweep, sparks and a small punch of the picture
#  - sound-only clips get slow cinematic footage of Taiz behind big moving words
#  - the clip flows into the outro (no frozen frame)            usage: kreel.py cfg.json [stills...]
import numpy as np,cv2,json,subprocess,sys,os,re,soundfile as sf
from PIL import Image,ImageDraw,ImageFont
S_='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'; TH=S_+'taiz/fonts/th/'; K='/home/user/final/brand-kit/'
W,H,FPS=1080,1920,30
NAVY=np.array([45,27,15],np.float32); AMBER=np.array([65,165,242],np.float32); ORANGE=np.array([61,138,255],np.float32); WHITE=np.array([216,233,244],np.float32)
cfg=json.load(open(sys.argv[1])); NAME=cfg['name']; WD=os.path.dirname(os.path.abspath(sys.argv[1])); stills=[float(x) for x in sys.argv[2:]]
SAFE_T,SAFE_B,SAFE_R,SAFE_L=270,1920-420,1080-120,65
CX=(SAFE_L+SAFE_R)/2                                            # centre of the safe zone (a little left of the screen centre)
def F(n,s): return ImageFont.truetype(TH+n,s,layout_engine=ImageFont.Layout.RAQM)
def word_rgba(w,size,col,fname='thmanyahsans-Black.ttf',stroke=None):
    f=F(fname,size); sw=stroke if stroke is not None else max(3,size//12); asc,desc=f.getmetrics()
    tw=int(f.getlength(w,direction='rtl',language='ar'))+6*sw; hh=int((asc+desc)*1.12)+4*sw
    im=Image.new('RGBA',(tw,hh),(0,0,0,0)); ImageDraw.Draw(im).text((tw-3*sw,2*sw),w,font=f,fill=tuple(int(x) for x in col[::-1])+(255,),anchor='ra',direction='rtl',language='ar',stroke_width=sw,stroke_fill=(10,16,28,255))
    a=np.array(im).astype(np.float32); a[...,:3]=a[...,:3][...,::-1].copy(); a[...,3]/=255; return a
def put(c,img,cx,cy,s=1.0,alpha=1.0,shadow=0.5,rot=0.0):
    if alpha<=0.01 or s<=0.01: return c
    h,w=img.shape[:2]; M=cv2.getRotationMatrix2D((w/2,h/2),rot,s); M[0,2]+=cx-w/2; M[1,2]+=cy-h/2
    rgba=cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT); a=rgba[...,3:]*alpha
    if shadow>0: sh=np.roll(np.roll(cv2.GaussianBlur(rgba[...,3],(0,0),7),7,0),3,1)[...,None]*shadow*alpha; c=c*(1-sh)
    return c*(1-a)+rgba[...,:3]*a
def ease(x): x=float(np.clip(x,0,1)); return 1-(1-x)**3
def back(x,s=2.2): x=float(np.clip(x,0,1)); return 1+(s+1)*(x-1)**3+s*(x-1)**2
def bump(x): return float(np.sin(np.pi*np.clip(x,0,1)))
rng=np.random.default_rng(7); yy,xx=np.mgrid[:H,:W].astype(np.float32)
# ---------------- words and their times
ASR=json.load(open(cfg['asr'])); AW=[(w['w'].strip(),w['s'],w['e']) for s in ASR for w in s['words']]
def parse(line):
    """'نحن [[جند المسلمين]]' -> [(word, strong)]; ' / ' starts a new row"""
    out=[]
    for part in re.split(r'(\[\[.*?\]\])',line):
        if not part.strip(): continue
        strong=part.startswith('[[')
        for w in (part[2:-2] if strong else part).replace(' / ',' ').split(): out.append((w,strong))
    return out
LINES=[]
for a,b,txt in cfg['caps']:
    ws=parse(txt); inside=[x for x in AW if a-0.12<=x[1]<b-0.05]
    if len(inside)==len(ws): starts=[x[1] for x in inside]
    else:                                                       # spread by length between the first and last spoken word
        s0=inside[0][1] if inside else a; s1=(inside[-1][1] if inside else b-0.3); L=[len(w) for w,_ in ws]; cum=np.cumsum([0]+L[:-1])/max(1,sum(L))
        starts=[s0+(s1-s0)*c for c in cum]
    starts=[max(a,min(s,b-0.1)) for s in starts]
    LINES.append(dict(a=a,b=b,words=ws,starts=starts))
SIZE=cfg.get('csize',74); BIG=cfg.get('strong_scale',1.32)
for L in LINES:                                                 # pre-render each word in its looks
    L['img']=[]
    for w,strong in L['words']:
        sz=int(SIZE*(BIG if strong else 1)); L['img'].append(dict(white=word_rgba(w,sz,WHITE),lit=word_rgba(w,sz,AMBER),strong=word_rgba(w,sz,ORANGE) if strong else None))
    # rows: wrap to the safe width (right to left)
    maxw=SAFE_R-SAFE_L-40; rows=[[]]; cur=0; gap=int(SIZE*0.26)-5*max(3,SIZE//12)
    for i,im in enumerate(L['img']):
        wd=im['white'].shape[1]
        if rows[-1] and cur+gap+wd>maxw: rows.append([]); cur=0
        rows[-1].append(i); cur+=wd+(gap if cur else 0)
    pos={}; rh=int(SIZE*1.38); y0=cfg.get('cap_y',1240)-(len(rows)-1)*rh/2
    for r,row in enumerate(rows):
        tot=sum(L['img'][i]['white'].shape[1] for i in row)+gap*(len(row)-1); x=CX+tot/2
        for i in row:
            wd=L['img'][i]['white'].shape[1]; pos[i]=(x-wd/2,y0+r*rh); x-=wd+gap
    L['pos']=pos
STRONG=[(L['starts'][i],L['pos'][i],L['img'][i]['white'].shape[1]) for L in LINES for i,(w,s) in enumerate(L['words']) if s]
# ---------------- fixed layers
def text_block(lines,size):
    ims=[]
    for ln in lines:
        ws=parse(ln); row=[word_rgba(w,size,ORANGE if s else WHITE) for w,s in ws]; gap=int(size*0.24)-5*max(3,size//12)
        tw=sum(i.shape[1] for i in row)+gap*(len(row)-1); hh=max(i.shape[0] for i in row); im=np.zeros((hh,tw,4),np.float32); x=tw
        for i in row:
            x-=i.shape[1]; o=im[:i.shape[0],x:x+i.shape[1]]; a=i[...,3:]; o[...,:3]=o[...,:3]*(1-a)+i[...,:3]*a; o[...,3:]=np.maximum(o[...,3:],a); x-=gap
        ims.append(im)
    Wm=max(i.shape[1] for i in ims); step=int(size*1.18); out=np.zeros((step*(len(ims)-1)+ims[-1].shape[0],Wm,4),np.float32)
    for k,i in enumerate(ims):
        y=k*step; x=(Wm-i.shape[1])//2; o=out[y:y+i.shape[0],x:x+i.shape[1]]; a=i[...,3:]; o[...,:3]=o[...,:3]*(1-a)+i[...,:3]*a; o[...,3:]=np.maximum(o[...,3:],a)
    return out
TITLE=text_block(cfg['title'],cfg.get('tsize',62))
if TITLE.shape[1]>SAFE_R-SAFE_L-60: TITLE=cv2.resize(TITLE,None,fx=(SAFE_R-SAFE_L-60)/TITLE.shape[1],fy=(SAFE_R-SAFE_L-60)/TITLE.shape[1],interpolation=cv2.INTER_AREA)
TY=SAFE_T+40+TITLE.shape[0]/2
CRED=None
if cfg.get('credit'):
    f=F('thmanyahsans-Bold.ttf',30); t='المصدر: '+cfg['credit']; tw=int(f.getlength(t,direction='rtl',language='ar'))+48; th=58
    im=Image.new('RGBA',(tw,th),(0,0,0,0)); d=ImageDraw.Draw(im); d.rounded_rectangle((0,0,tw-1,th-1),th//2,fill=(24,42,62,225))
    d.text((tw-24,th//2),t,font=f,fill=(244,233,216,255),anchor='rm',direction='rtl',language='ar')
    CRED=np.array(im).astype(np.float32); CRED[...,:3]=CRED[...,:3][...,::-1].copy(); CRED[...,3]/=255
CREDY=SAFE_B-46
LOGO=cv2.resize(cv2.imread(K+'01-logo/logo-dark-round-256.png',-1).astype(np.float32),(118,118),interpolation=cv2.INTER_AREA); LOGO[...,3]/=255
LOGOXY=(SAFE_L+64,SAFE_B-46)                                    # one corner, inside the safe zone, beside the source line
TOPF=np.clip(1-(yy-0)/cfg.get('top_fade',620),0,1)**1.4*cfg.get('top_alpha',0.72)
BOTF=np.clip((yy-cfg.get('bot_from',1050))/(H-cfg.get('bot_from',1050)),0,1)**1.3*cfg.get('bot_alpha',0.78)
VIG=(1-0.38*np.clip(np.hypot((xx-W/2)/(W*0.75),(yy-H/2)/(H*0.62))-0.45,0,1))[...,None]
GRAIN=[cv2.GaussianBlur(rng.standard_normal((H,W)).astype(np.float32),(0,0),0.7)[...,None]*3.0 for _ in range(4)]
FR=np.zeros((H,W),np.uint8); m=26
cv2.rectangle(FR,(m*8,m*8),((W-m)*8,(H-m)*8),255,2,cv2.LINE_AA,shift=3)
for (x,y,dx,dy) in ((m,m,1,1),(W-m,m,-1,1),(m,H-m,1,-1),(W-m,H-m,-1,-1)):
    cv2.line(FR,(x*8,y*8),((x+dx*90)*8,y*8),255,6,cv2.LINE_AA,shift=3); cv2.line(FR,(x*8,y*8),(x*8,(y+dy*90)*8),255,6,cv2.LINE_AA,shift=3)
FR=FR.astype(np.float32)/255
NP=60; PX=rng.uniform(0,W,NP); PY=rng.uniform(0,H,NP); PV=rng.uniform(12,38,NP); PS=rng.uniform(1.2,3.2,NP); PP=rng.uniform(0,6.28,NP)
KEEP=np.clip(np.hypot((xx-W/2)/(W*0.36),(yy-H*0.45)/(H*0.30))-0.6,0,1)
def particles(c,t):
    m=np.zeros((H,W),np.float32)
    for i in range(NP):
        x=(PX[i]+18*np.sin(t*0.6+PP[i]))%W; y=(PY[i]-PV[i]*t)%H; a=0.55+0.45*np.sin(t*1.7+PP[i])
        cv2.circle(m,(int(x*4),int(y*4)),int(PS[i]*4),float(a),-1,cv2.LINE_AA,shift=2)
    m=np.clip(cv2.GaussianBlur(m,(0,0),1.6)*2.2*KEEP,0,1)*cfg.get('particles',0.5)
    return c+(np.array([120,200,255],np.float32)-c)*m[...,None]*0.8
SPARK=rng.uniform(0,2*np.pi,(len(STRONG),16)); SPV=rng.uniform(160,420,(len(STRONG),16))
def strong_fx(t):
    """picture punch (zoom, shake) and flash amount from the strong words"""
    z=0; sh=0; fl=0
    for st,_,_ in STRONG:
        d=t-st
        if 0<=d<0.45: z=max(z,0.045*bump(d/0.45)); sh=max(sh,(1-d/0.3)*6 if d<0.3 else 0); fl=max(fl,(1-d/0.18)*0.16 if d<0.18 else 0)
    return z,sh,fl
def captions(c,t):
    for L in LINES:
        a,b=L['a'],L['b']
        if not (a-0.1<=t<b+0.35): continue
        out=ease((t-b)/0.3) if t>b else 0.0                 # the line leaves upward when it is done
        nexts=L['starts'][1:]+[b]
        for i,(w,strong) in enumerate(L['words']):
            ws=L['starts'][i]
            if t<ws: continue
            p=(t-ws); x,y=L['pos'][i]; im=L['img'][i]
            if strong:
                s=1+0.9*(1-ease(p/0.22)); al=min(1,p/0.08); c=put(c,im['strong'],x,y-40*out,s,alpha=al*(1-out),shadow=0.6)
                g=cv2.GaussianBlur(cv2.warpAffine(im['strong'][...,3],np.float32([[s,0,x-im['strong'].shape[1]*s/2],[0,s,y-40*out-im['strong'].shape[0]*s/2]]),(W,H)),(0,0),14)
                glow=np.clip(g*1.6,0,1)*(0.55*np.exp(-p/0.6)+0.18)*(1-out); c=c+(ORANGE-c)*glow[...,None]*0.6
                uw=im['strong'].shape[1]*0.9*ease((p-0.12)/0.3);
                if uw>2: cv2.rectangle(c,(int(x-uw/2),int(y+im['strong'].shape[0]*0.42-40*out)),(int(x+uw/2),int(y+im['strong'].shape[0]*0.42+6-40*out)),tuple(float(v)*(1-out)+0 for v in AMBER),-1)
            else:
                s=0.55+0.45*back(p/0.24); dy=26*(1-ease(p/0.24)); lit=ws<=t<nexts[i]+0.05
                c=put(c,im['lit'] if lit else im['white'],x,y+dy-40*out,s,alpha=min(1,p/0.1)*(1-out),shadow=0.55)
    # sparks from strong words
    for k,(st,(x,y),wd) in enumerate(STRONG):
        d=t-st
        if 0<=d<0.7:
            m=np.zeros((H,W),np.float32)
            for j in range(16):
                r=SPV[k,j]*d; px=x+np.cos(SPARK[k,j])*(r+wd*0.3); py=y+np.sin(SPARK[k,j])*r*0.6
                cv2.circle(m,(int(px*4),int(py*4)),int(10*(1-d/0.7))+2,1.0,-1,cv2.LINE_AA,shift=2)
            m=cv2.GaussianBlur(m,(0,0),1.2)*(1-d/0.7); c=c+(np.array([120,200,255],np.float32)-c)*np.clip(m,0,1)[...,None]
    return c
def chrome(c,t,cover=False):
    c=c*(1-TOPF[...,None])+NAVY*TOPF[...,None]; c=c*(1-BOTF[...,None])+NAVY*BOTF[...,None]
    c=c*VIG+GRAIN[int(t*FPS)%4]; c=particles(c,t)
    fa=1.0 if cover else ease((t-0.1)/0.6); c=c*(1-FR[...,None]*0.9*fa)+AMBER*FR[...,None]*0.9*fa
    ta=1.0 if cover else ease(t/0.45); c=put(c,TITLE,CX,TY+(0 if cover else 24*(1-ta)),alpha=ta,shadow=0.6)
    c=put(c,LOGO,*LOGOXY,shadow=0.4)
    if CRED is not None: c=put(c,CRED,CX,CREDY,alpha=1.0 if cover else ease((t-0.4)/0.5),shadow=0.3)
    if cover: return c
    c=captions(c,t)
    _,_,fl=strong_fx(t)
    return c+(255-c)*fl
# ---------------- pictures
def fill_vf(src):
    j=json.loads(subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',src],capture_output=True,text=True).stdout)
    sw,sh=j['streams'][0]['width'],j['streams'][0]['height']; s=max(W/sw,H/sh)*1.06; w,h=int(round(sw*s))//2*2,int(round(sh*s))//2*2
    return f'scale={w}:{h}:flags=lanczos',w,h
def reader(src,t0,t1,speed=1.0,crop=None):
    sc,w,h=fill_vf(src) if not crop else (None,0,0)
    if crop:
        s=max(W/crop[2],H/crop[3])*1.06; w,h=int(round(crop[2]*s))//2*2,int(round(crop[3]*s))//2*2; sc=f'crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]},scale={w}:{h}:flags=lanczos'
    vf=(f'setpts={1/speed}*PTS,' if speed!=1 else '')+f'fps={FPS},'+sc
    p=subprocess.Popen(['ffmpeg','-loglevel','error','-ss',str(t0),'-t',str(t1-t0),'-i',src,'-vf',vf,'-f','rawvideo','-pix_fmt','bgr24','-'],stdout=subprocess.PIPE)
    while True:
        b=p.stdout.read(w*h*3)
        if len(b)<w*h*3: break
        yield np.frombuffer(b,np.uint8).reshape(h,w,3).astype(np.float32)
def frame_from(v,t,kb=0.0):
    """crop the (slightly larger) picture to the screen, with the strong-word punch and shake; kb = slow push-in"""
    z,sh,_=strong_fx(t); s=1+z+kb; h,w=v.shape[:2]
    dx=(rng.uniform(-1,1)*sh) if sh>0 else 0; dy=(rng.uniform(-1,1)*sh) if sh>0 else 0
    M=np.float32([[s,0,(W-w*s)/2+dx+cfg.get('shift_x',0)],[0,s,(H-h*s)/2+dy+cfg.get('shift_y',0)]])
    return cv2.warpAffine(v,M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
def grade(v,dark=0.0):
    lum=v.mean(-1,keepdims=True)/255; g=np.array([70,40,18],np.float32)*(1-lum)+np.array([150,205,250],np.float32)*lum
    v=v*(1-0.14)+g*lum*0.14*1.6
    br=cfg.get('bright',1.0)
    if br!=1.0: v=255*np.power(np.clip(v/255,0,1),1/br)              # lift the shadows and mid-tones: a brighter, clearer person
    return v*(1-dark)+NAVY*dark
def inpaint(v):
    if not cfg.get('inpaint'): return v
    y0,y1=cfg['inpaint']; sub=np.clip(v[y0:y1],0,255).astype(np.uint8); hsv=cv2.cvtColor(sub,cv2.COLOR_BGR2HSV)
    mk=cv2.dilate(((sub.min(-1)>195)&(hsv[...,1]<45)).astype(np.uint8)*255,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
    fill=cv2.inpaint(sub,mk,7,cv2.INPAINT_TELEA).astype(np.float32); soft=cv2.GaussianBlur(fill,(0,0),3); w_=cv2.GaussianBlur(mk.astype(np.float32)/255,(0,0),4)[...,None]
    v=v.copy(); v[y0:y1]=fill*(1-w_)+soft*w_; return v
# ---------------- render
def render():
    t0,t1=cfg.get('t0',0),cfg['t1']; dur=t1-t0; n=0; cover=None
    enc=None if stills else subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',f'{WD}/{NAME}_v.mp4'],stdin=subprocess.PIPE)
    if cfg.get('mode','video')=='video':
        src=reader(cfg['src'],t0,t1+0.6)
    else:                                                       # sound only: slow footage of Taiz, darkened, behind the words
        b=cfg['broll']; src=reader(b['src'],b['t0'],b['t1'],b.get('speed',0.55),b.get('crop'))
    want=int((dur+0.6)*FPS)                                     # +0.6 s so the picture keeps moving under the dissolve
    last=None
    for v in src:
        if n>=want: break
        t=n/FPS; last=v
        if cfg.get('mode','video')=='video': img=grade(frame_from(inpaint(v),t))
        else: img=grade(cv2.GaussianBlur(frame_from(v,t,kb=0.05*t/max(1,dur)),(0,0),2.2),dark=cfg['broll'].get('dark',0.5))
        if stills:
            hit=[x for x in stills if abs(x-t)<0.5/FPS]
            if hit: cv2.imwrite(f'{WD}/{NAME}_{hit[0]}.jpg',np.clip(chrome(img,t),0,255).astype(np.uint8))
            if t>max(stills): return
        else: enc.stdin.write(np.clip(chrome(img,t),0,255).astype(np.uint8).tobytes())
        if cover is None and t>=cfg.get('cover_t',1.0): cover=chrome(img,t,cover=True)
        n+=1
    while n<want and not stills:                                # footage ran out: keep the last picture moving gently
        t=n/FPS; img=grade(frame_from(last,t,kb=0.01*(n-want))); enc.stdin.write(np.clip(chrome(img,t),0,255).astype(np.uint8).tobytes()); n+=1
    if stills: return
    enc.stdin.close(); enc.wait()
    tmp=f'{WD}/{NAME}_vt.wav'; subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(t0),'-t',str(dur),'-i',cfg['voice'],'-ac','2','-ar','48000',tmp],check=True)
    a,_=sf.read(tmp,dtype='float32')
    from scipy.signal import butter,sosfiltfilt
    a=sosfiltfilt(butter(2,85,'highpass',fs=48000,output='sos'),a,axis=0).astype(np.float32)
    L=int(n/FPS*48000); A=np.zeros((L,2),np.float32); A[:min(L,len(a))]=a[:L]
    f0=int((dur-0.25)*48000); A[f0:]*=np.clip(np.linspace(1,-0.5,L-f0),0,1)[:,None]
    A*=10**(-1.5/20)/max(1e-6,np.abs(A).max()); sf.write(f'{WD}/{NAME}_a.wav',A,48000)
    cv2.imwrite(f'{WD}/{NAME}_cover.jpg',np.clip(cover,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,93])
    OUT=cfg['out']; os.makedirs(os.path.dirname(OUT),exist_ok=True)
    cv2.imwrite(OUT.replace('.mp4','-cover.jpg'),np.clip(cover,0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,93])
    outro=K+'04-intro-outro/outro-vertical-1080x1920.mp4'; body=n/FPS; XF=0.6
    # cover (0.8 s) cut in, body, then a soft 0.6 s dissolve into the outro while the clip is still moving
    subprocess.run(['ffmpeg','-loglevel','error','-y','-loop','1','-t','0.8','-r',str(FPS),'-i',f'{WD}/{NAME}_cover.jpg','-f','lavfi','-t','0.8','-i','anullsrc=r=48000:cl=stereo',
        '-i',f'{WD}/{NAME}_v.mp4','-i',f'{WD}/{NAME}_a.wav','-i',outro,
        '-filter_complex',
        '[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[c];[2:v]setsar=1,fps=30,format=yuv420p[m];[4:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[o];'
        f'[m][o]xfade=transition=fade:duration={XF}:offset={body-XF:.3f}[mo];'
        '[1:a]aformat=sample_rates=48000:channel_layouts=stereo[ca];[3:a]aformat=sample_rates=48000:channel_layouts=stereo[ma];[4:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.9[oa];'
        f'[ma][oa]acrossfade=d={XF}[mao];[c][mo]concat=n=2:v=1:a=0[v];[ca][mao]concat=n=2:v=0:a=1[a]',
        '-map','[v]','-map','[a]','-c:v','libx264','-preset','medium','-crf','20','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT],check=True)
    print('ok',OUT)
render()
