from cwave import *
from smooth import cr
import cwave
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
    return o
cwave.cr=lambda C,n=1:C   # points already dense
V={'d1.6':nib(troch(3,1.6),2,10,taper_end=0.1,taper_start=0.12),'d2.0':nib(troch(3,2.0),2,10,taper_end=0.1,taper_start=0.12),
   'd1.8 shear.6':nib(troch(3,1.8,shear=0.6),2,10,taper_end=0.1,taper_start=0.12),'2 waves':nib(troch(2,1.8,shear=0.5),2.2,11,taper_end=0.1,taper_start=0.12)}
h='<body style="margin:0;display:flex;flex-wrap:wrap;width:1500px">'
for k,g in V.items():
    mx,my,Mx,My=g.bounds;h+='<div style="width:720px;height:420px;margin:10px;background:#fff;font:22px sans-serif">%s<svg width="700" height="380" viewBox="%g %g %g %g"><path fill="#D21F26" d="%s"/></svg></div>'%(k,mx-8,my-8,Mx-mx+16,My-my+16,path(g))
open('mark/cw.html','w').write(h)
