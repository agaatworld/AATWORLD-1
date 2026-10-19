import math,segno,io
import smooth
from shapely import affinity as A
from shapely.ops import unary_union
SW=smooth.swash(); bx0,by0,bx1,by1=SW.bounds; SW=A.translate(SW,-bx0,-by0); W,H=bx1-bx0,by1-by0
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.1f %.1f'%c for c in r.coords)+'Z'
    return o
SWP=path(SW)
import math as _m
DIR=_m.degrees(_m.atan2(-(H-0)+20, W-30))  # ball->tip direction approx
PAIR=unary_union([SW,A.translate(A.rotate(smooth.swash(),180,origin=(36,83.5)),-bx0,-by0)])
px0,py0,px1,py1=PAIR.bounds; PAIRP=path(A.translate(PAIR,-px0,-py0)); PW,PH=px1-px0,py1-py0
import json as _j
_U=_j.load(open('mark/user_symbols.json'))
PAIRP,PW,PH=_U['pair']['d'],_U['pair']['w'],_U['pair']['h']
ONEP,OW,OH=_U['one']['d'],_U['one']['w'],_U['one']['h']
logo_red=open('aat-logo-red.svg').read(); logo_white=open('aat-logo-white.svg').read()
def inner(svg): return svg[svg.index('>')+1:svg.rindex('</svg>')]
# vCard QR
vc='\r\n'.join(['BEGIN:VCARD','VERSION:3.0','N:Fattal;Mohamad Marwan','FN:Mohamad Marwan Fattal','ORG:AAT','TEL:+886966404681','EMAIL:marwan@aatworld.com','URL:aatworld.com','END:VCARD'])
q=segno.make(vc,error='l',micro=False)
buf=io.BytesIO(); q.save(buf,kind="svg",scale=1,border=0,dark="#1b1a18",xmldecl=False,svgns=True,nl=False,omitsize=True); QR=buf.getvalue().decode()
qn=q.symbol_size(scale=1,border=0)[0]
q.save('bc/AAT-vcard-qr.png',scale=20,border=2)
CW,CH=1050,600
FONT=''.join('<link rel="stylesheet" href="../node_modules/@fontsource/alexandria/%d.css">'%w for w in (400,500,700,800))
def sym(x,y,s,rot=0,fill='#D21F26',flip=False):
    # place swash centre at x,y
    return '<g transform="translate(%g %g) rotate(%g) scale(%g %g) translate(%g %g)"><path fill="%s" d="%s"/></g>'%(x,y,rot,-s if flip else s,s,-W/2,-H/2,fill,SWP)
# ---- WHITE side ----
import math as m2
PD=-27.8   # pair's main axis (bottom-left -> top-right)
def pair(x,y,sc,rot,fill='#D21F26'):
    return '<g transform="translate(%g %g) rotate(%g) scale(%g) translate(%g %g)"><path fill="%s" d="%s"/></g>'%(x,y,rot,sc,-PW/2,-PH/2,fill,PAIRP)
def arc_at(cx,cy,R,a0,a1,n,sc,sgn):
    o=''
    for i in range(n):
        t=m2.radians(a0+(a1-a0)*i/(n-1))
        x=cx+sgn*R*m2.cos(t); y=cy+sgn*R*m2.sin(t)
        tang=m2.degrees(t)+90
        o+=pair(x,y,sc,tang-PD)
    return o
arc=arc_at(0,0,255,16,74,3,0.085,1)
arc2=arc_at(CW,CH,415,14,76,4,0.085,-1)
front=('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'%(CW,CH,CW,CH)+
 '<rect width="%d" height="%d" fill="#fff"/>'%(CW,CH)+arc+arc2+
 '<g transform="translate(%g 52) scale(%g)" fill="#D21F26">%s</g>'%((CW-390)/2,390/413,inner(logo_red))+
 '</svg>')
F=('<div style="position:relative;width:%dpx;height:%dpx;overflow:hidden;background:#fff;font-family:Alexandria,sans-serif;color:#1b1a18">'%(CW,CH)+front+
 
 '<div style="position:absolute;left:60px;bottom:52px;display:flex;flex-direction:column;gap:6px">'
 '<div dir="rtl" style="font-size:40px;font-weight:800;line-height:1.25;text-align:left">محمد مروان فتال</div>'
 '<div style="font-size:33px;font-weight:800;line-height:1.15">Mohamad Marwan Fattal</div>'
 '<div style="font-size:24px;font-weight:800;color:#D21F26;letter-spacing:2px;margin-bottom:26px">OWNER · <span dir="rtl">المالك</span></div>'
 '<div style="font-size:28px;font-weight:700">+886 966 404 681</div>'
 '<div style="font-size:28px;font-weight:700">marwan@aatworld.com</div></div>'
 '<div style="position:absolute;right:56px;bottom:52px;display:flex;flex-direction:column;align-items:center;gap:8px">'
 '<div style="width:142px;height:142px;padding:7px;box-sizing:border-box;background:#fff;border:3px solid #D21F26;border-radius:12px">'+QR.replace('<svg ','<svg width="122" height="122" style="display:block" ',1)+'</div>'
 '<div style="font-size:16px;font-weight:700;color:#6b655c">Scan to save</div></div></div>')
# ---- RED side ----
sc=0.058;tw=PW*sc+16;th=PH*sc+14
pat=('<defs><pattern id="pp" width="%g" height="%g" patternUnits="userSpaceOnUse" patternTransform="rotate(-4)">'%(tw,th*2)+
 '<g transform="translate(8 7) scale(%g)"><path fill="#A80F17" d="%s"/></g>'%(sc,PAIRP)+
 '<g transform="translate(%g %g) scale(%g)"><path fill="#A80F17" d="%s"/></g>'%(8+tw/2,7+th,sc,PAIRP)+
 '<g transform="translate(%g %g) scale(%g)"><path fill="#A80F17" d="%s"/></g></pattern>'%(8-tw/2,7+th,sc,PAIRP)+
'<linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E3242B"/><stop offset=".6" stop-color="#D21F26"/><stop offset="1" stop-color="#B5161D"/></linearGradient></defs>')
back=('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'%(CW,CH,CW,CH)+pat+
 '<rect width="%d" height="%d" fill="url(#rg)"/><rect width="%d" height="%d" fill="url(#pp)"/></svg>'%(CW,CH,CW,CH))
BOXW,BOXH=470,230
SYMX,SYMY,SYMW=200,8,58
Bk=('<div style="position:relative;width:%dpx;height:%dpx;overflow:hidden;font-family:Alexandria,sans-serif;color:#fff">'%(CW,CH)+back.replace('<svg ','<svg style="position:absolute;inset:0" ',1)+
 '<div style="position:absolute;left:0;right:0;top:34px;text-align:center;font-size:25px;font-weight:800;letter-spacing:.5px;white-space:nowrap;text-shadow:0 2px 6px rgba(80,0,0,.35)">Arab Asian Trade · <span dir="rtl">التجارة العربية الآسيوية</span> · <span style="font-family:\'Noto Sans CJK TC\',\'Noto Sans TC\',sans-serif">中阿商業雜誌</span></div>'
 '<div style="position:absolute;left:50%%;top:92px;width:%dpx;height:%dpx;margin-left:-%dpx;background:#fff;border-radius:26px;box-shadow:0 18px 40px -16px rgba(60,0,0,.65);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px">'%(BOXW,BOXH,BOXW//2)+
 
 '<svg width="380" height="%d" viewBox="0 0 413 138" style="display:block" fill="#D21F26">%s<g transform="translate(%g %g) scale(%g)"><path d="%s"/></g></svg></div>'%(380*138/413,inner(logo_red),SYMX,SYMY,SYMW/OW,ONEP)+
 '<div style="position:absolute;left:0;right:0;bottom:34px;text-align:center;font-size:34px;font-weight:800;letter-spacing:1px;text-shadow:0 2px 6px rgba(80,0,0,.35)">www.aatworld.com</div>'
 '<div style="position:absolute;left:44px;right:30px;bottom:100px;font-size:24px;font-weight:600;white-space:nowrap;text-shadow:0 2px 6px rgba(80,0,0,.35)">P.O. BOX 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.</div></div>')
base='<!doctype html><meta charset="utf-8">'+FONT+'<style>body{margin:0}</style>'
open('bc/front.html','w').write(base+F); open('bc/back.html','w').write(base+Bk)
open('bc/both.html','w').write(base+'<div style="background:#F3EFEA;padding:50px;display:flex;flex-direction:column;gap:50px;width:%dpx">'%CW+'<div style="box-shadow:0 26px 50px -26px rgba(0,0,0,.5);border-radius:18px;overflow:hidden">'+F+'</div><div style="box-shadow:0 26px 50px -26px rgba(0,0,0,.5);border-radius:18px;overflow:hidden">'+Bk+'</div></div>')
