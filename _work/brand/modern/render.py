import sys,re,io,json, cairosvg
from PIL import Image
sys.path.insert(0,'.')
from logo_modern import build,to_d
import importlib, params; importlib.reload(params)
S=build(params.V)
from logo_modern import text_d
TG,_=text_d('IDEAS FOR BUSINESS','fonts/manrope-latin-700-normal.woff2',24,338,0.16,right=994)
orig=open('../logo/AAT-logo-red.svg').read()
ps=re.findall(r'<path[^>]*d="([^"]+)"',orig)
under=''.join(f'<path fill-rule="evenodd" d="{d}"/>' for d in ps)
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 1020 360" width="2040" height="720"><rect x="-10" y="-10" width="1020" height="360" fill="#fff"/>
<g transform="scale({1000/413})" fill="#3b82f6" opacity="{sys.argv[1] if len(sys.argv)>1 else .25}">{under}</g>
<g fill="#D21F26" opacity=".85">{''.join(f'<path d="{to_d(g)}"/>' for g in S.values())}<path d="{TG}"/></g></svg>'''
cairosvg.svg2png(bytestring=svg.encode(),write_to='/tmp/claude-0/-home-user-AATWORLD-1/d5f456b7-d2ee-5851-a737-ee6ace2a186c/scratchpad/m.png')
