import re,sys,cairosvg
sys.path.insert(0,'.')
from refine import *
from PIL import Image
kw=eval('dict('+(sys.argv[1] if len(sys.argv)>1 else '')+')')
svg=open('../logo/AAT-logo-red.svg').read()
ps=re.findall(r'<path[^>]*d="([^"]+)"',svg)
out=[to_d([refine_ring(r,**kw) for r in parse_rings(d)]) for d in ps[:3]]
body=''.join(f'<path fill-rule="evenodd" d="{d}"/>' for d in out)+f'<path d="{ps[3]}"/>'
s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 413 138" fill="#D21F26">{body}</svg>'
open('test.svg','w').write(s)
S='/tmp/claude-0/-home-user-AATWORLD-1/d5f456b7-d2ee-5851-a737-ee6ace2a186c/scratchpad/'
cairosvg.svg2png(bytestring=s.encode(),write_to=S+'r4k.png',output_width=4000,background_color='white')
im=Image.open(S+'r4k.png');a=Image.open(S+'o4k.png')
for nm,box,sz in [('a',(0,500,2100,1340),(1050,420)),('t',(2400,0,4000,1150),(800,575))]:
  o=Image.new('RGB',(sz[0],sz[1]*2+10),'white');o.paste(a.crop(box).resize(sz),(0,0));o.paste(im.crop(box).resize(sz),(0,sz[1]+10));o.save(S+'cmp_'+nm+'.png')
print(len(s))
