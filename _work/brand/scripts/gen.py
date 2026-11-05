R='/_blob/f6fa7442cc0d95ca54e6f399481c33c2'; W='/_blob/8fbcad04906c26fdbee6712e1dcaf6f4'
HEX='clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)'
G='linear-gradient(135deg, #7A0A10, #D21F26 55%, #FF5A4E)'
def d(s): return '<div aria-hidden="true" style="position: absolute; %s"></div>\n'%s
def hx(pos,bg): return d('%s; width: 150px; height: 130px; background: %s; %s'%(pos,bg,HEX))
CARD='position: relative; width: 900px; height: 540px; overflow: hidden; border-radius: 18px; box-shadow: 0 24px 50px -28px rgba(0,0,0,.5); '
def front(deco,bg,dark,pb,ar,en,title,phone,mail,badge,addr):
    c='#fff' if dark else '#1b1a18'; red='#fff' if dark else '#D21F26'
    logo=('<div style="background: #fff; border-radius: 18px; padding: 10px 22px; box-shadow: 0 12px 26px -14px rgba(0,0,0,.5)"><img src="%s" alt="AAT, Ideas For Business" style="display: block; width: 252px; height: 84px"></div>'%R) if dark else '<img src="%s" alt="AAT, Ideas For Business" style="display: block; width: 276px; height: 92px">'%R
    tstyle='font-size: 25px; font-weight: 800; letter-spacing: 2px; '+('color: #C4141C; background: #fff; padding: 5px 20px; border-radius: 30px' if dark else 'color: #D21F26')
    h='<div style="%sbackground: %s; color: %s">\n'%(CARD,bg,c)+deco
    if badge:
        bb='background: #fff; color: #C4141C' if dark else 'background: linear-gradient(135deg, #FF5A4E, #D21F26 50%, #7A0A10); color: #fff'
        h+='<div style="position: absolute; right: 34px; top: 34px; width: 128px; height: 128px; border-radius: 50%%; %s; box-shadow: 0 12px 24px -12px rgba(0,0,0,.55); display: flex; flex-direction: column; align-items: center; justify-content: center"><div style="font-size: 54px; font-weight: 800; line-height: .95">45</div><div style="font-size: 15px; font-weight: 800; letter-spacing: 3px">YEARS</div></div>\n'%bb
    h+='<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; box-sizing: border-box; padding: 26px 40px %dpx; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 7px">\n'%pb
    h+=logo+'\n'
    h+='<div style="font-size: 22px; font-weight: 800; white-space: nowrap">Arab Asian Trade · <span dir="rtl">التجارة العربية الآسيوية</span> · <span style="font-family: \'Noto Sans TC\', sans-serif">中阿商業雜誌</span></div>\n'
    h+='<div dir="rtl" style="font-size: 44px; font-weight: 800; line-height: 1.25; margin-top: 6px">%s</div>\n'%ar
    h+='<div style="font-size: 30px; font-weight: 700">%s</div>\n'%en
    h+='<div style="%s">%s</div>\n'%(tstyle,title)
    h+='<div aria-hidden="true" style="width: 130px; height: 3px; border-radius: 3px; background: %s; margin: 6px 0 2px"></div>\n'%red
    h+='<div style="font-size: 27px; font-weight: 700; white-space: nowrap">%s &nbsp;·&nbsp; %s</div>\n'%(phone,mail)
    if addr:
        h+='<div style="font-size: 23px; font-weight: 500; white-space: nowrap">P.O. BOX 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.</div>\n'
    h+='<div style="font-size: 27px; font-weight: 800; color: %s">www.aatworld.com</div>\n'%red
    return h+'</div>\n</div>\n'
def back(deco,bg,dark,pb):
    c='#fff' if dark else '#1b1a18'; red='#fff' if dark else '#D21F26'
    h='<div style="%sbackground: %s; color: %s">\n'%(CARD,bg,c)+deco
    h+='<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; box-sizing: border-box; padding: 26px 40px %dpx; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px">\n'%pb
    h+='<img src="%s" alt="AAT, Ideas For Business" style="display: block; width: 420px; height: 140px">\n'%(W if dark else R)
    h+='<div style="font-size: 24px; font-weight: 800; white-space: nowrap">Arab Asian Trade · <span dir="rtl">التجارة العربية الآسيوية</span> · <span style="font-family: \'Noto Sans TC\', sans-serif">中阿商業雜誌</span></div>\n'
    h+='<div aria-hidden="true" style="width: 160px; height: 3px; border-radius: 3px; background: %s; margin: 8px 0"></div>\n'%red
    h+='<div style="font-size: 28px; font-weight: 800; letter-spacing: 2px; color: %s">TAIWAN OFFICE</div>\n'%red
    h+='<div style="font-size: 27px; font-weight: 500">P.O. BOX 568, Yonghe, New Taipei City 234964</div>\n<div style="font-size: 27px; font-weight: 500">TAIWAN R.O.C.</div>\n'
    h+='<div style="font-size: 28px; font-weight: 800; color: %s">www.aatworld.com</div>\n'%red
    return h+'</div>\n</div>\n'
RED2='linear-gradient(135deg, #5E070C, #C4141C 45%, #FF5A4E)'
D={
'Main':('1, red wave',
  d('left: -120px; right: -120px; bottom: -120px; height: 180px; border-radius: 50%; background: '+G)+d('left: -120px; right: -120px; bottom: -100px; height: 180px; border-radius: 50%; border: 3px solid rgba(210,31,38,.28)')+d('left: -90px; top: -110px; width: 240px; height: 240px; border-radius: 50%; background: linear-gradient(135deg, #FFE3DF, #fff)'),
  '#fff',False,70,
  d('right: -200px; top: -260px; width: 700px; height: 560px; border-radius: 50%; background: rgba(255,255,255,.1)')+d('left: -160px; bottom: -300px; width: 640px; height: 500px; border-radius: 50%; border: 3px solid rgba(255,255,255,.3)'),
  G,True,26),
'Diagonal':('2, diagonal corners',
  d('left: 0; top: 0; width: 210px; height: 210px; background: linear-gradient(135deg, #7A0A10, #D21F26 60%, #FF5A4E); clip-path: polygon(0 0, 100% 0, 0 100%)')+d('right: 0; bottom: 0; width: 210px; height: 210px; background: linear-gradient(315deg, #7A0A10, #D21F26 60%, #FF5A4E); clip-path: polygon(100% 0, 100% 100%, 0 100%)')+d('left: 0; top: 0; width: 250px; height: 250px; background: rgba(210,31,38,.14); clip-path: polygon(0 0, 100% 0, 0 100%)')+d('right: 0; bottom: 0; width: 250px; height: 250px; background: rgba(210,31,38,.14); clip-path: polygon(100% 0, 100% 100%, 0 100%)'),
  '#fff',False,26,
  d('right: 0; top: 0; width: 210px; height: 210px; background: linear-gradient(225deg, #7A0A10, #D21F26 60%, #FF5A4E); clip-path: polygon(0 0, 100% 0, 100% 100%)')+d('left: 0; bottom: 0; width: 210px; height: 210px; background: linear-gradient(45deg, #7A0A10, #D21F26 60%, #FF5A4E); clip-path: polygon(0 0, 100% 100%, 0 100%)'),
  '#fff',False,26),
'Honeycomb':('3, honeycomb',
  d('left: 0; top: 0; bottom: 0; width: 16px; background: linear-gradient(180deg, #FF5A4E, #D21F26 50%, #7A0A10)')+d('right: 0; top: 0; bottom: 0; width: 16px; background: linear-gradient(180deg, #7A0A10, #D21F26 50%, #FF5A4E)')+hx('left: -40px; bottom: -50px','linear-gradient(135deg, #D21F26, #7A0A10)')+hx('left: 78px; bottom: -118px','#FF8A80')+hx('left: -40px; bottom: 86px','#FFE1DD')+hx('right: -40px; bottom: -50px','linear-gradient(135deg, #FF8A80, #D21F26)')+hx('right: 78px; bottom: -118px','#FFD9D4')+hx('right: -40px; bottom: 86px','#FFEDEA'),
  '#fff',False,26,
  hx('right: -30px; top: -40px','rgba(255,255,255,.14)')+hx('right: 88px; top: -108px','rgba(255,255,255,.08)')+hx('left: -40px; bottom: -50px','rgba(255,255,255,.14)')+hx('left: 78px; bottom: -118px','rgba(255,255,255,.08)'),
  'linear-gradient(140deg, #D21F26, #7A0A10)',True,26),
'Line':('4, fine line',
  d('left: 0; right: 0; top: 0; height: 12px; background: linear-gradient(90deg, #7A0A10, #D21F26 45%, #FF8A80)')+d('left: 0; right: 0; bottom: 0; height: 12px; background: linear-gradient(90deg, #FF8A80, #D21F26 55%, #7A0A10)')+d('left: 30px; top: 40px; bottom: 40px; width: 2px; background: linear-gradient(180deg, rgba(210,31,38,0), #D21F26, rgba(210,31,38,0))')+d('right: 30px; top: 40px; bottom: 40px; width: 2px; background: linear-gradient(180deg, rgba(210,31,38,0), #D21F26, rgba(210,31,38,0))'),
  '#fff',False,26,
  d('left: 0; right: 0; top: 0; height: 12px; background: linear-gradient(90deg, #FF8A80, #D21F26 55%, #7A0A10)')+d('left: 0; right: 0; bottom: 0; height: 12px; background: linear-gradient(90deg, #7A0A10, #D21F26 45%, #FF8A80)'),
  '#fff',False,26),
'Routes':('5, trade routes',
  d('left: -330px; bottom: -330px; width: 560px; height: 560px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.45)')+d('left: -250px; bottom: -250px; width: 400px; height: 400px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.28)')+d('right: -330px; bottom: -330px; width: 560px; height: 560px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.45)')+d('right: -250px; bottom: -250px; width: 400px; height: 400px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.28)')+d('left: 60px; bottom: 196px; width: 18px; height: 18px; border-radius: 50%; background: #D21F26; box-shadow: 0 0 0 8px rgba(210,31,38,.18)')+d('right: 60px; bottom: 196px; width: 18px; height: 18px; border-radius: 50%; background: #7A0A10; box-shadow: 0 0 0 8px rgba(122,10,16,.16)')+d('left: 0; top: 0; width: 150px; height: 150px; background: linear-gradient(135deg, #7A0A10, #D21F26 55%, #FF5A4E); clip-path: polygon(0 0, 100% 0, 0 100%)'),
  'linear-gradient(180deg, #fff 60%, #FFEFEC)',False,26,
  d('right: -330px; top: -330px; width: 600px; height: 600px; border-radius: 50%; border: 3px dashed rgba(255,255,255,.4)')+d('left: -330px; bottom: -330px; width: 600px; height: 600px; border-radius: 50%; border: 3px dashed rgba(255,255,255,.4)')+d('right: 70px; top: 190px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 8px rgba(255,255,255,.22)')+d('left: 70px; bottom: 190px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 8px rgba(255,255,255,.22)'),
  'linear-gradient(135deg, #7A0A10, #D21F26 60%, #FF5A4E)',True,26),
'Bold':('6, bold red',
  d('left: -140px; top: -220px; width: 520px; height: 440px; border-radius: 50%; background: rgba(255,255,255,.1)')+d('right: -200px; bottom: -300px; width: 600px; height: 480px; border-radius: 50%; background: rgba(0,0,0,.14)')+d('right: -170px; bottom: -320px; width: 660px; height: 540px; border-radius: 50%; border: 3px solid rgba(255,255,255,.28)'),
  RED2,True,26,
  d('left: 0; right: 0; top: 0; height: 22px; background: '+RED2)+d('left: 0; right: 0; bottom: 0; height: 22px; background: '+RED2),
  '#fff',False,26),
}
cap='<div style="font-size: 22px; font-weight: 700; color: #6b655c">%s</div>\n'
for k,(t,fd,fbg,fdk,fpb,bd,bbg,bdk,bpb) in D.items():
    O=('محمد مروان فتال','Mohamad Marwan Fattal','OWNER · <span dir="rtl">المالك</span>','+886 966 404 681','marwan@aatworld.com')
    C=('عبدالرحمن محمد','Abdulrahman Mohammad','CEO · <span dir="rtl">المدير التنفيذي</span>','[CEO PHONE]','[CEO EMAIL]')
    cards=[(front(fd,fbg,fdk,fpb,*O,True,False),'Front · owner · with 45 years'),(back(bd,bbg,bdk,bpb),'Back'),(front(fd,fbg,fdk,fpb,*O,False,True),'Front · owner · without 45 years (address added)'),(front(fd,fbg,fdk,fpb,*C,True,False),'Front · CEO')]
    body=''.join('<div style="display: flex; flex-direction: column; gap: 14px">\n'+c+cap%l+'</div>\n\n' for c,l in cards)
    html='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AAT name card %s</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;700;800&family=Noto+Sans+TC:wght@700&display=swap">
<style>
body{margin:0}
</style>
</helmet>
<div style="width: 1920px; height: 1300px; box-sizing: border-box; padding: 40px; background: #F3EFEA; font-family: 'Alexandria', sans-serif; color: #1b1a18; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px">

%s</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1920,"height":1300}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
'''%(t,body)
    open('project/%s.dc.html'%k,'w').write(html)
