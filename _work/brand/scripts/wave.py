import smooth,json,sys
from shapely import affinity as A
from shapely.ops import unary_union
SW=smooth.swash(); W,H=SW.bounds[2],SW.bounds[3]
WV=A.rotate(SW,180,origin=(W/2,H/2))   # crest: thin rises from bottom-left, curls over at top-right
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
    return o
def T(g,x=0,y=0,s=1,r=0,fx=False):
    if fx: g=A.scale(g,-1,1,origin=(W/2,H/2))
    g=A.rotate(g,r,origin=(W/2,H/2)); g=A.scale(g,s,s,origin=(W/2,H/2)); return A.translate(g,x,y)
V={}
EMB=unary_union([SW,T(WV,86,-18)])
def tang(dy):
    best=None
    for dx in [x*0.5 for x in range(120,400)]:
        b=A.translate(WV,dx,dy); inter=WV.intersection(b).area
        if inter>0 and inter<6: best=dx
    return best
W2=A.translate(WV,86,-18)
V['w1']=A.rotate(EMB,48)
V['w2']=unary_union([SW,W2,A.translate(W2,111.5,20)])
V['w3']=unary_union([WV,A.translate(WV,111.5,20)])
V['w4']=unary_union([WV,A.translate(WV,111.5,20),A.translate(WV,223,40)])
V['w5']=A.rotate(unary_union([SW,W2,A.translate(W2,111.5,20)]),20)
json.dump({k:path(g) for k,g in V.items()},open('mark/waves.json','w'))
h='<body style="margin:0;display:flex;flex-wrap:wrap;width:1500px">'
for k,g in V.items():
    mx,my,Mx,My=g.bounds;h+='<div style="width:480px;height:420px;margin:10px;background:#fff;font:22px sans-serif">%s<svg width="460" height="380" viewBox="%g %g %g %g"><path fill="#D21F26" d="%s"/></svg></div>'%(k,mx-8,my-8,Mx-mx+16,My-my+16,path(g))
open('mark/wave.html','w').write(h)
