import json,sys
s=open('gen.py').read(); exec(s[:s.index("def front(")]); RED2='linear-gradient(135deg, #5E070C, #C4141C 45%, #FF5A4E)'
exec(s[s.index("D={"):s.index("cap='<div")]); OLD=D
GW='linear-gradient(90deg, #FF8A80, #D21F26 45%, #7A0A10)'; WH='linear-gradient(90deg, rgba(255,255,255,.35), #fff)'
def stroke(pos,h,bg,flip=False):
    poly='polygon(0 0, 100% 78%, 100% 100%, 0 100%)' if flip else 'polygon(0 78%, 100% 0, 100% 100%, 0 100%)'
    return d('%s; height: %dpx; background: %s; clip-path: %s'%(pos,h,bg,poly))
def tri(pos,w,h,bg): return d('%s; width: %dpx; height: %dpx; background: %s; clip-path: polygon(50%% 0, 100%% 100%%, 0 100%%)'%(pos,w,h,bg))
def sq(pos,z,bg): return d('%s; width: %dpx; height: %dpx; background: %s'%(pos,z,z,bg))
TRI='Arab Asian Trade · <span dir="rtl">التجارة العربية الآسيوية</span> · <span style="font-family: \'Noto Sans TC\', \'Noto Sans CJK TC\', sans-serif">中阿商業雜誌</span>'
COL='position: absolute; left: 0; right: 0; top: %dpx; bottom: %dpx; box-sizing: border-box; padding: 0 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: %dpx'
def front(deco,bg,dark,pt,pb,ar,en,title,phone,mail,badge):
    c='#fff' if dark else '#1b1a18'; red='#fff' if dark else '#D21F26'
    logo='<img src="%s" alt="AAT, Ideas For Business" style="display: block; width: 264px; height: 88px">'%(W if dark else R)
    if badge:
        logo='<div style="display: flex; align-items: center; gap: 26px">'+logo+'<div aria-hidden="true" style="width: 3px; height: 76px; border-radius: 3px; background: %s; opacity: .55"></div><div style="display: flex; align-items: center; gap: 12px; color: %s"><div style="font-size: 74px; font-weight: 800; line-height: 1">45</div><div style="display: flex; flex-direction: column; text-align: left; gap: 3px"><div style="font-size: 22px; font-weight: 800; letter-spacing: 3px; line-height: 1">YEARS</div><div dir="rtl" style="font-size: 22px; font-weight: 800; line-height: 1.2; text-align: left">عاماً</div></div></div></div>'%(red,red)
    tstyle='font-size: 25px; font-weight: 800; letter-spacing: 2px; line-height: 1.3; '+('color: #C4141C; background: #fff; padding: 3px 22px; border-radius: 30px' if dark else 'color: #D21F26')
    h='<div style="%sbackground: %s; color: %s">\n'%(CARD,bg,c)+deco
    h+='<div style="%s">\n'%(COL%(pt,pb,4))+logo+'\n'
    h+='<div style="font-size: 21px; font-weight: 700; white-space: nowrap; line-height: 1.4; margin-top: 10px">%s</div>\n'%TRI
    h+='<div dir="rtl" style="font-size: 44px; font-weight: 800; line-height: 1.3; margin-top: 4px">%s</div>\n'%ar
    h+='<div style="font-size: 30px; font-weight: 700; line-height: 1.25">%s</div>\n'%en
    h+='<div style="%s">%s</div>\n'%(tstyle,title)
    h+='<div aria-hidden="true" style="width: 130px; height: 3px; border-radius: 3px; background: %s; margin: 7px 0 3px"></div>\n'%red
    h+='<div style="font-size: 27px; font-weight: 700; white-space: nowrap; line-height: 1.3">%s &nbsp;·&nbsp; %s</div>\n'%(phone,mail)
    h+='<div style="font-size: 22px; font-weight: 500; white-space: nowrap; line-height: 1.35">P.O. BOX 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.</div>\n'
    h+='<div style="font-size: 27px; font-weight: 800; line-height: 1.3; color: %s">www.aatworld.com</div>\n'%red
    return h+'</div>\n</div>\n'
def back(deco,bg,dark,pt,pb):
    c='#fff' if dark else '#1b1a18'; red='#fff' if dark else '#D21F26'
    h='<div style="%sbackground: %s; color: %s">\n'%(CARD,bg,c)+deco
    h+='<div style="%s">\n'%(COL%(pt,pb,8))
    h+='<img src="%s" alt="AAT, Ideas For Business" style="display: block; width: 420px; height: 140px">\n'%(W if dark else R)
    h+='<div style="font-size: 24px; font-weight: 800; white-space: nowrap">%s</div>\n'%TRI
    h+='<div aria-hidden="true" style="width: 160px; height: 3px; border-radius: 3px; background: %s; margin: 8px 0"></div>\n'%red
    h+='<div style="font-size: 28px; font-weight: 800; letter-spacing: 2px; color: %s">TAIWAN OFFICE</div>\n'%red
    h+='<div style="font-size: 27px; font-weight: 500">P.O. BOX 568, Yonghe, New Taipei City 234964</div>\n<div style="font-size: 27px; font-weight: 500">TAIWAN R.O.C.</div>\n'
    h+='<div style="font-size: 28px; font-weight: 800; color: %s">www.aatworld.com</div>\n'%red
    return h+'</div>\n</div>\n'
# name: (title, fdeco, fbg, fdark, fpt, fpb, bdeco, bbg, bdark, bpt, bpb)
D={}
PB={'Main':(10,66),'Diagonal':(0,0),'Honeycomb':(0,0),'Line':(12,12),'Routes':(0,0),'Bold':(0,0)}
T0={'Main':'1 · Red wave','Diagonal':'2 · Diagonal corners','Honeycomb':'3 · Honeycomb','Line':'4 · Fine line','Routes':'5 · Trade routes','Bold':'6 · Bold red'}
for k,(t,fd,fbg,fdk,fpb,bd,bbg,bdk,bpb) in OLD.items():
    D[k]=(T0[k],fd,fbg,fdk,PB[k][0],PB[k][1],bd,bbg,bdk,0,0)
D['Main']=D['Main'][:1]+(d('left: -120px; right: -120px; bottom: -124px; height: 180px; border-radius: 50%; background: '+G)+d('left: -120px; right: -120px; bottom: -106px; height: 180px; border-radius: 50%; border: 3px solid rgba(210,31,38,.28)'),)+D['Main'][2:]
D['Honeycomb']=D['Honeycomb'][:1]+(d('left: 0; top: 0; bottom: 0; width: 16px; background: linear-gradient(180deg, #FF5A4E, #D21F26 50%, #7A0A10)')+d('right: 0; top: 0; bottom: 0; width: 16px; background: linear-gradient(180deg, #7A0A10, #D21F26 50%, #FF5A4E)')+hx('left: -66px; bottom: -64px','linear-gradient(135deg, #D21F26, #7A0A10)')+hx('left: -66px; top: -64px','#FFD9D4')+hx('right: -66px; bottom: -64px','#FFD9D4')+hx('right: -66px; top: -64px','linear-gradient(135deg, #FF8A80, #D21F26)'),)+D['Honeycomb'][2:]
D['Routes']=D['Routes'][:1]+(d('left: -340px; bottom: -340px; width: 480px; height: 480px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.45)')+d('right: -340px; top: -340px; width: 480px; height: 480px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.45)')+d('left: -250px; bottom: -250px; width: 320px; height: 320px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.28)')+d('right: -250px; top: -250px; width: 320px; height: 320px; border-radius: 50%; border: 3px dashed rgba(210,31,38,.28)')+d('left: 44px; bottom: 44px; width: 16px; height: 16px; border-radius: 50%; background: #D21F26; box-shadow: 0 0 0 7px rgba(210,31,38,.18)')+d('right: 44px; top: 44px; width: 16px; height: 16px; border-radius: 50%; background: #7A0A10; box-shadow: 0 0 0 7px rgba(122,10,16,.16)'),)+D['Routes'][2:]
D['Diagonal']=D['Diagonal'][:1]+(d('left: 0; top: 0; width: 120px; height: 120px; background: linear-gradient(135deg, #7A0A10, #D21F26 60%, #FF5A4E); clip-path: polygon(0 0, 100% 0, 0 100%)')+d('right: 0; bottom: 0; width: 120px; height: 120px; background: linear-gradient(315deg, #7A0A10, #D21F26 60%, #FF5A4E); clip-path: polygon(100% 0, 100% 100%, 0 100%)')+d('left: 0; top: 0; width: 150px; height: 150px; background: rgba(210,31,38,.14); clip-path: polygon(0 0, 100% 0, 0 100%)')+d('right: 0; bottom: 0; width: 150px; height: 150px; background: rgba(210,31,38,.14); clip-path: polygon(100% 0, 100% 100%, 0 100%)'),)+D['Diagonal'][2:]
def add(k,*a): D[k]=a
add('S1','7 · Long stroke',stroke('left: 0; right: 0; bottom: 18px',40,GW)+stroke('left: 0; right: 0; bottom: 0',14,'rgba(210,31,38,.22)'),'#fff',False,0,58,
  stroke('left: 0; right: 0; bottom: 30px',46,WH),G,True,0,70)
add('S2','8 · Red, white stroke',stroke('left: 0; right: 0; bottom: 18px',40,WH)+tri('left: -110px; bottom: -40px',420,360,'rgba(255,255,255,.06)'),RED2,True,0,58,
  stroke('left: 0; right: 0; bottom: 30px',44,GW),'#fff',False,0,70)
add('S3','9 · The A peak',tri('left: 50%; margin-left: -330px; top: 10px',660,560,'linear-gradient(180deg, #FFE9E6, rgba(255,255,255,0) 85%)')+stroke('left: 0; right: 0; bottom: 14px',36,GW),'#fff',False,0,50,
  tri('left: 50%; margin-left: -330px; top: 10px',660,560,'linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 85%)')+stroke('left: 0; right: 0; bottom: 26px',40,WH),G,True,0,66)
add('S4','10 · Twin strokes',stroke('left: 0; width: 520px; top: 0',26,'linear-gradient(90deg, #7A0A10, #D21F26 55%, #FF8A80)',True)+stroke('right: 0; width: 620px; bottom: 16px',38,GW),'#fff',False,20,54,
  stroke('left: 0; width: 520px; top: 0',34,'rgba(255,255,255,.7)',True)+stroke('right: 0; width: 620px; bottom: 30px',46,WH),RED2,True,30,76)
add('S5','11 · Slanted red base',d('left: 0; right: 0; bottom: 0; height: 74px; background: '+G+'; clip-path: polygon(0 78%, 100% 0, 100% 100%, 0 100%)')+d('left: 0; top: 0; bottom: 0; width: 14px; background: linear-gradient(180deg, #FF5A4E, #D21F26 50%, #7A0A10)'),'#fff',False,0,62,
  d('left: 0; right: 0; top: 0; height: 90px; background: rgba(255,255,255,.12); clip-path: polygon(0 0, 100% 0, 100% 22%, 0 100%)')+stroke('left: 0; right: 0; bottom: 30px',40,WH),G,True,20,70)
add('S6','12 · Stroke through red',stroke('left: 0; right: 0; bottom: 30px',26,WH)+stroke('left: 0; right: 0; bottom: 8px',16,'rgba(255,255,255,.3)'),'linear-gradient(160deg, #FF5A4E, #D21F26 45%, #5E070C)',True,0,56,
  stroke('left: 0; right: 0; bottom: 50px',30,GW)+stroke('left: 0; right: 0; bottom: 18px',20,'rgba(210,31,38,.25)'),'#fff',False,0,80)
# global-brand inspired
add('G1','13 · Pure white (Apple calm)','','#fff',False,0,0,'',' #D21F26',True,0,0)
add('G2','14 · Four tiles (Microsoft grid)',sq('left: 30px; top: 30px',26,'#D21F26')+sq('left: 60px; top: 30px',26,'#FF8A80')+sq('left: 30px; top: 60px',26,'#7A0A10')+sq('left: 60px; top: 60px',26,'#FFC9C3')+sq('right: 30px; bottom: 30px',26,'#D21F26')+sq('right: 60px; bottom: 30px',26,'#FF8A80')+sq('right: 30px; bottom: 60px',26,'#7A0A10')+sq('right: 60px; bottom: 60px',26,'#FFC9C3'),'#fff',False,0,0,
  sq('left: 30px; top: 30px',26,'#fff')+sq('left: 60px; top: 30px',26,'rgba(255,255,255,.6)')+sq('left: 30px; top: 60px',26,'rgba(255,255,255,.35)')+sq('left: 60px; top: 60px',26,'rgba(255,255,255,.8)')+sq('right: 30px; bottom: 30px',26,'#fff')+sq('right: 60px; bottom: 30px',26,'rgba(255,255,255,.6)')+sq('right: 30px; bottom: 60px',26,'rgba(255,255,255,.35)')+sq('right: 60px; bottom: 60px',26,'rgba(255,255,255,.8)'),'#C4141C',True,0,0)
add('G3','15 · Thin frame (Emirates / luxury)',d('left: 16px; right: 16px; top: 16px; bottom: 16px; border: 3px solid #D21F26; border-radius: 10px')+d('left: 24px; right: 24px; top: 24px; bottom: 24px; border: 1px solid rgba(210,31,38,.4); border-radius: 6px'),'#fff',False,0,0,
  d('left: 16px; right: 16px; top: 16px; bottom: 16px; border: 3px solid #fff; border-radius: 10px')+d('left: 24px; right: 24px; top: 24px; bottom: 24px; border: 1px solid rgba(255,255,255,.5); border-radius: 6px'),G,True,0,0)
add('G4','16 · Side bars (Toyota / Coca-Cola red)',d('left: 0; top: 0; bottom: 0; width: 30px; background: #D21F26')+d('right: 0; top: 0; bottom: 0; width: 30px; background: #D21F26')+d('left: 38px; top: 0; bottom: 0; width: 5px; background: rgba(210,31,38,.3)')+d('right: 38px; top: 0; bottom: 0; width: 5px; background: rgba(210,31,38,.3)'),'#fff',False,0,0,
  d('left: 38px; top: 0; bottom: 0; width: 5px; background: rgba(255,255,255,.4)')+d('right: 38px; top: 0; bottom: 0; width: 5px; background: rgba(255,255,255,.4)'),'#D21F26',True,0,0)
add('G5','17 · Twin circles (Mastercard)',d('left: -110px; top: -110px; width: 220px; height: 220px; border-radius: 50%; background: #D21F26')+d('left: -20px; top: -110px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,138,128,.75)')+d('right: -110px; bottom: -110px; width: 220px; height: 220px; border-radius: 50%; background: #D21F26')+d('right: -20px; bottom: -110px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,138,128,.75)'),'#fff',False,0,0,
  d('left: -110px; top: -110px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.22)')+d('left: -20px; top: -110px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.14)')+d('right: -110px; bottom: -110px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.22)')+d('right: -20px; bottom: -110px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,.14)'),G,True,0,0)
add('G6','18 · Soft gradient (Samsung / Google calm)',d('left: 0; right: 0; top: 0; height: 10px; background: linear-gradient(90deg, #7A0A10, #D21F26, #FF8A80, #D21F26, #7A0A10)')+d('left: 0; right: 0; bottom: 0; height: 10px; background: linear-gradient(90deg, #7A0A10, #D21F26, #FF8A80, #D21F26, #7A0A10)'),'radial-gradient(ellipse at 50% 45%, #fff 45%, #FFE7E3 100%)',False,10,10,
  d('left: 0; right: 0; top: 0; height: 10px; background: rgba(255,255,255,.6)')+d('left: 0; right: 0; bottom: 0; height: 10px; background: rgba(255,255,255,.6)'),'radial-gradient(ellipse at 50% 45%, #E3242B 30%, #7A0A10 100%)',True,10,10)
cap='<div style="font-size: 26px; font-weight: 700; color: #6b655c">%s</div>\n'
O=('محمد مروان فتال','Mohamad Marwan Fattal','OWNER · <span dir="rtl">المالك</span>','+886 966 404 681','marwanaat@gmail.com')
C=('عبدالرحمن محمد','Abdulrahman Mohammad','CEO · <span dir="rtl">المدير التنفيذي</span>','+886 000 000 000','ceo@aatworld.com')
SHEET='<div style="width: 1920px; height: 1300px; box-sizing: border-box; padding: 40px; background: #F3EFEA; font-family: \'Alexandria\', sans-serif; color: #1b1a18; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px">\n\n%s</div>'
canvas={"v":3,"createdOnFiles":{"v":1,"at":"2026-10-11T01:15:00Z"},"title":"AAT Name Cards","launch":{"view":"canvas"},"pages":[],"boards":{},"order":[],"notes":{"head":{"x":0,"y":-300,"text":"AAT name cards · 18 directions","kind":"title1","maxW":5920}},"designSystems":[]}
for n,(k,(t,fd,fbg,fdk,fpt,fpb,bd,bbg,bdk,bpt,bpb)) in enumerate(D.items()):
    cards=[(front(fd,fbg,fdk,fpt,fpb,*O,True),'Front · owner · with 45 years'),(back(bd,bbg,bdk,bpt,bpb),'Back'),(front(fd,fbg,fdk,fpt,fpb,*O,False),'Front · owner · without 45 years'),(front(fd,fbg,fdk,fpt,fpb,*C,True),'Front · CEO')]
    body=''.join('<div style="display: flex; flex-direction: column; gap: 14px">\n'+c+cap%l+'</div>\n\n' for c,l in cards)
    sheet=SHEET%body
    open('project/%s.dc.html'%k,'w').write('''<!doctype html>
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
%s
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
'''%(t,sheet))
    loc=sheet.replace(R,'aat-logo-red.svg').replace(W,'aat-logo-white.svg')
    css=''.join('<link rel="stylesheet" href="node_modules/@fontsource/alexandria/%d.css">'%w for w in (400,500,700,800))
    open('r_%02d_%s.html'%(n+1,k),'w').write('<!doctype html><meta charset="utf-8">'+css+'<style>body{margin:0}</style>'+loc)
    f=k+'.dc.html'; canvas['boards'][f]={"x":(n%3)*2000,"y":(n//3)*1420,"w":1920,"h":1300,"title":t}; canvas['order'].append(f)
json.dump(canvas,open('project/canvas.json','w'),ensure_ascii=False)
