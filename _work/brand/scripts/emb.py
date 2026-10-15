import smooth
from shapely import affinity as A
from shapely.ops import unary_union
SW=smooth.swash(); W,H=SW.bounds[2],SW.bounds[3]
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
    return o
V=[(70,-20),(78,-28),(86,-18),(64,-30),(92,-30),(80,-10)]
h='<body style="margin:0;display:flex;flex-wrap:wrap;width:1500px">'
for x,y in V:
    b=A.translate(A.rotate(SW,180,origin=(W/2,H/2)),x,y); a=SW
    g=unary_union([a,b]); mx,my,Mx,My=g.bounds
    h+='<div style="width:480px;height:420px;margin:10px;background:#fff;font:20px sans-serif">%d,%d gap=%.1f<svg width="460" height="380" viewBox="%g %g %g %g"><path fill="#D21F26" d="%s"/></svg></div>'%(x,y,a.distance(b),mx-8,my-8,Mx-mx+16,My-my+16,path(g))
open('mark/emb.html','w').write(h)
