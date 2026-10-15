from cwave import nib
from smooth import cr
from shapely.ops import unary_union
from shapely.geometry import Point
import cwave,math
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
    return o
def wave(x0,y0,s=1.0):
    P=[(0,66),(20,62),(38,48),(50,30),(64,14),(82,8),(98,13),(108,28),(107,45),(97,57),(84,59),(75,51),(77,41),(86,38)]
    return [(x0+x*s,y0+(y-66)*s) for x,y in P]
def build(k,P=88,sc=None,w=(2.5,12),lead=True):
    parts=[];x=0;y=66
    for i in range(k):
        s=sc[i] if sc else 1
        C=wave(x,y,s)
        if i==0 and lead: C=[(x-40*s,y+2*s),(x-18*s,y+1*s)]+C
        g=nib(C,w[0]*s,w[1]*s,pen=-35,taper_end=0.0,taper_start=0.18 if (i==0 and lead) else 0)
        bx,by=C[-1]; g=unary_union([g,Point(bx,by).buffer(w[1]*0.55*s,48)])
        parts.append(g)
        # next wave starts at curl bottom
        x=x+ (90)*s; y=y+(59-66)*s+ (6*s)
    return unary_union(parts).buffer(0.6,32).buffer(-0.6,32)
V={'3':build(3),'2':build(2),'3grow':build(3,sc=[0.8,0.92,1.05]),'4':build(4)}
h='<body style="margin:0;display:flex;flex-wrap:wrap;width:1500px">'
for k,g in V.items():
    mx,my,Mx,My=g.bounds;h+='<div style="width:720px;height:420px;margin:10px;background:#fff;font:22px sans-serif">%s<svg width="700" height="380" viewBox="%g %g %g %g"><path fill="#D21F26" d="%s"/></svg></div>'%(k,mx-8,my-8,Mx-mx+16,My-my+16,path(g))
open('mark/cw.html','w').write(h)
