import smooth
from shapely import affinity as A
from shapely.ops import unary_union
SW=smooth.swash()
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.1f %.1f'%c for c in r.coords)+'Z'
    return o
V={}
for k,o in {'ball':(45,72),'mid':(36,83.5),'mid2':(33,86),'loop':(27,95)}.items():
    V[k]=unary_union([SW,A.rotate(SW,180,origin=o)])
h='<body style="margin:0;display:flex;flex-wrap:wrap;width:1500px">'
for k,g in V.items():
    mx,my,Mx,My=g.bounds;h+='<div style="width:700px;height:420px;margin:10px;background:#fff;font:22px sans-serif">%s<svg width="680" height="380" viewBox="%g %g %g %g"><path fill="#D21F26" d="%s"/></svg></div>'%(k,mx-8,my-8,Mx-mx+16,My-my+16,path(g))
open('mark/hook.html','w').write(h)
