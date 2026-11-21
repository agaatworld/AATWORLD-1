# brand kit pages: colours, fonts, icons, post / reel templates, and the one-page guide
import numpy as np,cv2,os,sys
from PIL import Image,ImageDraw,ImageFont
S_='/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
K='/home/user/final/brand-kit/'
TH=S_+'taiz/fonts/th/'
SERIF=TH+'thmanyahserifdisplay-Black.ttf'; SANSK=TH+'thmanyahsans-Black.ttf'; SANSB=TH+'thmanyahsans-Bold.ttf'; SANSM=TH+'thmanyahsans-Medium.ttf'
def F(p,s): return ImageFont.truetype(p,s,layout_engine=ImageFont.Layout.RAQM)
def ar(d,xy,t,f,fill,anchor='rs'): d.text(xy,t,font=f,fill=fill,anchor=anchor,direction='rtl',language='ar')
NAVY=(15,27,45); STEEL=(46,74,104); AMBER=(242,165,65); WHITE=(244,233,216); ORANGE=(255,138,61)
PAL=[('الكحلي','الخلفية (60٪)','#0F1B2D',NAVY),('الأزرق الصخري','الحلقة والمساحات الثانوية (30٪)','#2E4A68',STEEL),
     ('الكهرماني','الخطوط والأسهم والإطار (10٪)','#F2A541',AMBER),('الأبيض الدافئ','النصوص','#F4E9D8',WHITE),('البرتقالي','«عز» والكلمة المميزة فقط','#FF8A3D',ORANGE)]
def mix(a,b,t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def rel(c):
    c=[x/255 for x in c]; c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]; return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def cr(a,b): la,lb=rel(a),rel(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def grain(img,amt=3):
    a=np.array(img).astype(np.float32); r=np.random.default_rng(1); n=cv2.GaussianBlur(r.standard_normal(a.shape[:2]).astype(np.float32),(0,0),0.8)
    a+= (n/n.std()*amt)[...,None]; return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
# ---------------------------------------------------------------- colours
def colours():
    W,H=1800,1250; im=Image.new('RGB',(W,H),NAVY); d=ImageDraw.Draw(im)
    ar(d,(W-70,110),'ألوان القناة',F(SERIF,72),WHITE); ar(d,(W-70,165),'قاعدة 60 · 30 · 10: خلفية هادئة، لون ثانٍ، ولون قوي قليل للتمييز',F(SANSM,32),(190,200,214))
    y=230
    for name,role,hx,col in PAL:
        d.rounded_rectangle((70,y,W-70,y+150),22,fill=mix(NAVY,(30,45,70),0.6))
        d.rounded_rectangle((W-300,y+18,W-90,y+132),16,fill=col,outline=(90,100,120))
        ar(d,(W-330,y+62),name,F(SANSK,40),WHITE); ar(d,(W-330,y+110),role,F(SANSM,28),(190,200,214))
        d.text((640,y+62),hx,font=F(SANSB,34),fill=WHITE,anchor='ls'); d.text((640,y+108),'RGB %d, %d, %d'%col,font=F(SANSM,26),fill=(170,180,196),anchor='ls')
        for j,t in enumerate((0.0,0.25,0.5,0.75)):             # shades to the dark, tints to the light
            sw=mix(col,(0,0,0),0.55-t*0.73) if t<0.75 else mix(col,(255,255,255),0.45)
        steps=[mix(col,(0,0,0),0.6),mix(col,(0,0,0),0.3),col,mix(col,(255,255,255),0.3),mix(col,(255,255,255),0.6)]
        for j,sw in enumerate(steps): d.rounded_rectangle((110+j*96,y+30,190+j*96,y+120),12,fill=sw)
        y+=170
    # contrast
    d.text((110,y+40),'Contrast (WCAG): text %.1f · amber %.1f · orange %.1f   (7+ = excellent, 4.5+ = good)'%(cr(WHITE,NAVY),cr(AMBER,NAVY),cr(ORANGE,NAVY)),font=F(SANSM,28),fill=(190,200,214),anchor='ls')
    ar(d,(W-70,y+90),'ممنوع: نص أحمر أو برتقالي طويل · أكثر من كلمتين مميزتين في التصميم · الأبيض الصافي على الأسود الصافي',F(SANSM,28),(255,170,140))
    grain(im).save(K+'02-colours/brand-colours.png'); print('colours')
# ---------------------------------------------------------------- fonts
def fonts():
    W,H=1800,1330; im=Image.new('RGB',(W,H),NAVY); d=ImageDraw.Draw(im)
    ar(d,(W-70,110),'خطوط القناة',F(SERIF,72),WHITE); ar(d,(W-70,165),'عائلة واحدة (ثمانية): نسخة بزوايا للعناوين، ونسخة بسيطة للنصوص',F(SANSM,32),(190,200,214))
    rows=[('العناوين الكبيرة','Thmanyah Serif Display · Black',SERIF,'الكلمة مقاومة',110,WHITE),
          ('الكلمة المميزة / العناوين الفرعية','Thmanyah Sans · Black',SANSK,'الثبات عز',100,ORANGE),
          ('النصوص والترجمة في الفيديو','Thmanyah Sans · Bold / Medium',SANSB,'من جبهة صبر يحاضر الدكتور…',60,WHITE),
          ('المصدر والملاحظات الصغيرة','Thmanyah Sans · Medium',SANSM,'المصدر: اسم الجهة',44,(190,200,214))]
    y=230
    for title,name,fp,sample,sz,col in rows:
        d.rounded_rectangle((70,y,W-70,y+215),22,fill=mix(NAVY,(30,45,70),0.6))
        ar(d,(W-110,y+60),title,F(SANSK,34),AMBER); d.text((110,y+60),name,font=F(SANSB,28),fill=(170,180,196),anchor='ls')
        ar(d,(W-110,y+175),sample,F(fp,sz),col); y+=235
    ar(d,(W-70,y+40),'الأحجام: عنوان المنشور 70–90 · النص 36–42 · الترجمة في الفيديو 56–64 · المصدر 28–32 (على عرض 1080)',F(SANSM,28),(190,200,214))
    ar(d,(W-70,y+85),'الرخصة: خطوط ثمانية مجانية تجارياً؛ لا تُنشر ملفات الخط ولا تُعدّل، ولا يُوحى بشراكة مع ثمانية',F(SANSM,26),(170,180,196))
    grain(im).save(K+'03-fonts/brand-fonts.png'); print('fonts')
# ---------------------------------------------------------------- icons
def icons():
    sys.path.insert(0,S_+'anim'); import icons as I
    I.GOLD_T=np.array([110,197,255],np.float32); I.GOLD_B=np.array([65,165,242],np.float32); I.icon.cache_clear()
    for k,n in (('fb','facebook'),('wa','whatsapp'),('tg','telegram')):
        ic=I.icon(k,512); cv2.imwrite(K+f'08-icons/{n}-amber-512.png',np.clip(ic,0,255).astype(np.uint8))
    row=np.zeros((200,620,4),np.float32)
    for i,k in enumerate(('tg','wa','fb')):
        ic=I.icon(k,160); row[20:180,20+i*200:180+i*200]=ic
    cv2.imwrite(K+'08-icons/social-row-amber.png',np.clip(row,0,255).astype(np.uint8)); print('icons')
# ---------------------------------------------------------------- templates
def post_template():
    W,H,M=1080,1350,64; im=Image.new('RGB',(W,H),NAVY); d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,790),fill=(40,52,70)); ar(d,(W-60,740),'ضع الصورة هنا: الشخص يمين، والعنوان في الفراغ يسار',F(SANSM,28),(150,160,176))
    for i,t in enumerate(('سطر العنوان الأول','الكلمة المميزة','سطر العنوان الثالث')):
        ar(d,(530,300+i*96),t,F(SERIF,70),ORANGE if i==1 else WHITE)
    y=880
    for i in range(6):
        d.rounded_rectangle((M,y-26,W-M,y-12),6,fill=(80,96,118)); y+=64
    ar(d,(W-M,y+10),'المصدر: اسم الجهة',F(SANSM,30),(190,200,214))
    lg=Image.open(K+'01-logo/logo-dark-round-256.png').resize((118,118),Image.LANCZOS); im.paste(lg,(M-14,48),lg)
    d.text((M,H-24),'هامش 64 من كل جهة · النص مضبوط من الجهتين · كلمتان مميزتان كحد أعلى',font=F(SANSM,22),fill=(120,130,150),anchor='ls',direction='rtl',language='ar')
    grain(im).save(K+'06-templates/post-template-1080x1350.png'); print('post tpl')
def reel_template():
    W,H=1080,1920; im=Image.new('RGBA',(W,H),NAVY+(255,)); d=ImageDraw.Draw(im)
    ar(d,(W//2,300),'عنوان المقطع',F(SANSK,84),WHITE,'ms'); ar(d,(W//2,400),'الكلمة المميزة',F(SANSK,84),ORANGE,'ms')
    win=(40,500,1040,1500)   # the video window (transparent)
    d.rectangle(win,fill=(0,0,0,0)); d.rectangle((win[0]-4,win[1]-4,win[2]+4,win[3]+4),outline=AMBER+(255,),width=3)
    d.rectangle(win,fill=(0,0,0,0))
    ar(d,(W//2,1640),'سطر الترجمة يكون هنا',F(SANSB,60),WHITE,'ms')
    d.rounded_rectangle((W-560,1760,W-40,1830),35,fill=(30,48,72,255)); ar(d,(W-70,1808),'المصدر: اسم الجهة',F(SANSM,32),WHITE)
    lg=Image.open(K+'01-logo/logo-dark-round-256.png').resize((130,130),Image.LANCZOS); im.paste(lg,(40,40),lg)
    a=np.array(im); a[win[1]:win[3],win[0]:win[2],3]=0; Image.fromarray(a).save(K+'06-templates/reel-frame-1080x1920.png'); print('reel tpl')
colours(); fonts(); icons(); post_template(); reel_template()
