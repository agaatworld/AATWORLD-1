import re
from svgpathtools import parse_path
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely import affinity
s=open('aat-logo-red.svg').read(); d=re.search(r' d="([^"]+)"',s).group(1)
P=parse_path(d); subs=P.continuous_subpaths()
geo=None
for sp in subs:
    pts=[]
    for seg in sp:
        for i in range(12): z=seg.point(i/12); pts.append((z.real,z.imag))
    if len(pts)<3: continue
    pg=Polygon(pts).buffer(0)
    geo=pg if geo is None else geo.symmetric_difference(pg)
k=413/2000
clip=Polygon([(x*k,y*k) for x,y in [(0,0),(850,0),(668,392),(600,480),(600,700),(0,700)]])
sw=geo.intersection(clip)
sw=max(sw.geoms,key=lambda g:g.area) if sw.geom_type!='Polygon' else sw
minx,miny,maxx,maxy=sw.bounds; print(sw.bounds, sw.area)
sw=affinity.translate(sw,-minx,-miny)
def topath(g):
    out=''
    for ring in [g.exterior]+list(g.interiors):
        c=list(ring.coords); out+='M'+' L'.join('%.2f %.2f'%p for p in c)+'Z'
    return out
open('mark/swash_path.txt','w').write('%.2f %.2f\n'%(maxx-minx,maxy-miny)+topath(sw.simplify(0.05)))
