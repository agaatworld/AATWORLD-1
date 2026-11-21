# one-page brand guide that shows the whole kit
import numpy as np,cv2,glob
from PIL import Image,ImageDraw,ImageFont
S_='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'; K='/home/user/final/brand-kit/'; TH=S_+'taiz/fonts/th/'
def F(p,s): return ImageFont.truetype(TH+p,s,layout_engine=ImageFont.Layout.RAQM)
def ar(d,xy,t,f,fill,anchor='rs'): d.text(xy,t,font=f,fill=fill,anchor=anchor,direction='rtl',language='ar')
NAVY=(15,27,45); PANEL=(24,40,62); WHITE=(244,233,216); AMBER=(242,165,65); ORANGE=(255,138,61); SOFT=(190,200,214)
W,H=2400,4000; im=Image.new('RGB',(W,H),NAVY); d=ImageDraw.Draw(im); M=90
def paste(path,box,keep=True):
    p=Image.open(path).convert('RGBA'); x0,y0,x1,y1=box
    if keep:
        s=min((x1-x0)/p.width,(y1-y0)/p.height); p=p.resize((int(p.width*s),int(p.height*s)),Image.LANCZOS); x0+= (x1-x0-p.width)//2; y0+=(y1-y0-p.height)//2
    else: p=p.resize((x1-x0,y1-y0),Image.LANCZOS)
    im.paste(p,(x0,y0),p)
def section(y,title,sub=None):
    ar(d,(W-M,y),title,F('thmanyahserifdisplay-Black.ttf',64),WHITE)
    if sub: ar(d,(W-M,y+52),sub,F('thmanyahsans-Medium.ttf',30),SOFT)
    d.line((M,y+75 if sub else y+25,W-M,y+75 if sub else y+25),fill=(60,80,108),width=2)
ar(d,(W-M,170),'دليل هوية قناة «الثبات عز»',F('thmanyahserifdisplay-Black.ttf',96),WHITE)
ar(d,(W-M,235),'الكلمة مقاومة · كل ما تحتاجه لتصميم موحّد',F('thmanyahsans-Bold.ttf',40),AMBER)
# 1 logo
y=350; section(y,'الشعار','نسخة غامقة للشاشات · نسخة فاتحة للطباعة والخلفيات البيضاء · أيقونة للأحجام الصغيرة جداً')
paste(K+'01-logo/logo-dark-round-1024.png',(W-M-640,y+110,W-M,y+750)); paste(K+'01-logo/logo-light-round-1024.png',(W-M-1340,y+110,W-M-700,y+750)); paste(K+'01-logo/icon-small-1024.png',(W-M-1900,y+230,W-M-1460,y+670))
rules=['مساحة فارغة حول الشعار لا تقل عن عُشر قطره','أصغر حجم للشعار الكامل 120 بكسل؛ تحته استعمل الأيقونة','الشعار في زاوية واحدة فقط في الفيديو والمنشور','لا تمدّه ولا تغيّر ألوانه ولا تضع فوقه نصاً']
for i,r in enumerate(rules): ar(d,(W-M,y+830+i*54),'• '+r,F('thmanyahsans-Medium.ttf',34),SOFT)
paste(K+'01-logo/video-corner-badge-256.png',(M,y+800,M+200,y+1000)); ar(d,(M+430,y+910),'شارة زاوية الفيديو',F('thmanyahsans-Medium.ttf',30),SOFT)
# 2 colours + fonts
y=1480; section(y,'الألوان والخطوط')
paste(K+'02-colours/brand-colours.png',(W//2+20,y+60,W-M,y+890)); paste(K+'03-fonts/brand-fonts.png',(M,y+60,W//2-20,y+890))
# 3 facebook covers
y=2440; section(y,'غلاف فيسبوك','4 تصاميم مختارة · مضبوطة للكمبيوتر والجوال (المقاس 1640×924)')
cv=sorted(glob.glob(K+'05-facebook/facebook-cover-[0-9]-*-1640x924.png'))
for i,f in enumerate(cv):
    cx=W-M-(i%2)*1130-1080; cy=y+110+(i//2)*630; paste(f,(cx,cy,cx+1080,cy+608),keep=False)
# 4 icons + intro/outro strip
y=3910
paste(K+'08-icons/social-row-amber.png',(M,y-90,M+560,y+90)); ar(d,(W-M,y),'الإنترو والأوترو: حركة العدسة · صوت هادئ · يثبت ثانية ونص ثم يُغلق للأسود',F('thmanyahsans-Bold.ttf',38),WHITE)
a=np.array(im).astype(np.float32); r=np.random.default_rng(2); n=cv2.GaussianBlur(r.standard_normal(a.shape[:2]).astype(np.float32),(0,0),0.8); a+=(n/n.std()*2.5)[...,None]
Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(K+'brand-guide.jpg',quality=90); print('guide ok')
