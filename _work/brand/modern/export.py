"""Write the modern AAT logo + symbol as SVG/PNG/JSON. python3 export.py"""
import json, os, cairosvg
import params
from logo_modern import build, to_d, text_d
import symbol
os.makedirs('out',exist_ok=True)
S=build(params.V)
L={k:to_d(g,2) for k,g in S.items()}
TG,tb=text_d('IDEAS FOR BUSINESS','fonts/manrope-latin-700-normal.woff2',24,338,0.16,right=994)
L['TAG']=TG
a,b=symbol.build()
from shapely.ops import unary_union
bx=unary_union([a,b]).bounds
Y={'a':to_d(a,2),'b':to_d(b,2),'box':[round(v,1) for v in bx]}
json.dump({'logo':L,'symbol':Y},open('out/aat-modern.json','w'))
RED,DEEP,WHITE,INK='#D21F26','#7A0A10','#FFFFFF','#1A1314'
def logo_svg(col,tag=True,pad=8):
    x0,y0,x1,y1=6,6,998,(344 if tag else 316)
    body=''.join(f'<path d="{L[k]}"/>' for k in ('A1','A2','T'))+(f'<path d="{L["TAG"]}"/>' if tag else '')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0-pad} {y0-pad} {x1-x0+2*pad} {y1-y0+2*pad}" fill="{col}">{body}</svg>\n'
def sym_svg(ca,cb,pad=12):
    x0,y0,x1,y1=bx
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0-pad:.1f} {y0-pad:.1f} {x1-x0+2*pad:.1f} {y1-y0+2*pad:.1f}"><path fill="{ca}" d="{Y["a"]}"/><path fill="{cb}" d="{Y["b"]}"/></svg>\n'
files={'AAT-modern-logo-red.svg':logo_svg(RED),'AAT-modern-logo-white.svg':logo_svg(WHITE),'AAT-modern-logo-black.svg':logo_svg(INK),
 'AAT-modern-logo-red-no-tagline.svg':logo_svg(RED,False),
 'AAT-symbol-two-tone.svg':sym_svg(RED,DEEP),'AAT-symbol-red.svg':sym_svg(RED,RED),'AAT-symbol-white.svg':sym_svg(WHITE,WHITE),'AAT-symbol-black.svg':sym_svg(INK,INK)}
for n,s in files.items():
    open('out/'+n,'w').write(s)
    cairosvg.svg2png(bytestring=s.encode(),write_to='out/'+n.replace('.svg','.png'),output_width=4000 if 'logo' in n else 2000)
print('ok',bx)
