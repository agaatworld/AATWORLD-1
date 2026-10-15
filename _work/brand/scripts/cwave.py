import math,json
from shapely.geometry import Polygon,Point,LineString
from shapely.ops import unary_union
from smooth import cr
def nib(C,wmin,wmax,pen=-40,taper_end=0.12,taper_start=0.0,ball=None,n=40):
    pts=cr(C,n);N=len(pts);L=[0]
    for a,b in zip(pts,pts[1:]):L.append(L[-1]+math.dist(a,b))
    T=L[-1];polys=[]
    ws=[]
    for i in range(N):
        a=pts[max(0,i-1)];b=pts[min(N-1,i+1)];th=math.atan2(b[1]-a[1],b[0]-a[0])
        w=wmin+(wmax-wmin)*abs(math.sin(th-math.radians(pen)))
        s=L[i]/T
        if s>1-taper_end: t=(1-s)/taper_end; w*= (t*t*(3-2*t))*0.92+0.08
        if taper_start and s<taper_start: t=s/taper_start; w*=(t*t*(3-2*t))*0.85+0.15
        ws.append(w)
    # smooth widths
    for _ in range(3): ws=[ (ws[max(0,i-2)]+ws[max(0,i-1)]+ws[i]+ws[min(N-1,i+1)]+ws[min(N-1,i+2)])/5 for i in range(N)]
    # union of quads along path (robust for self-crossing loops)
    left=[];right=[]
    for i,(x,y) in enumerate(pts):
        a=pts[max(0,i-1)];b=pts[min(N-1,i+1)];dx,dy=b[0]-a[0],b[1]-a[1];l=math.hypot(dx,dy) or 1
        nx,ny=-dy/l,dx/l;w=ws[i]/2;left.append((x+nx*w,y+ny*w));right.append((x-nx*w,y-ny*w))
    for i in range(N-1):
        q=Polygon([left[i],left[i+1],right[i+1],right[i]]).buffer(0.05)
        polys.append(q)
    g=unary_union(polys)
    if ball: g=unary_union([g,Point(*ball[:2]).buffer(ball[2],48)])
    return g.buffer(0.5,32).buffer(-0.5,32).simplify(0.04)
def period(x0,h=1.0,s=1.0):
    # one wave: trough -> rise -> crest -> curl back over (crossing) -> trough
    P=[(0,70),(22,64),(44,50),(62,30),(74,12),(84,3),(94,4),(98,14),(92,26),(80,30),(72,24),(76,40),(88,56),(104,66)]
    return [(x0+x*s,70-(70-y)*h*s) for x,y in P]
def chain(k,heights=None,s=None):
    C=[(-10,74)];x=0
    for i in range(k):
        h=heights[i] if heights else 1; sc=s[i] if s else 1
        pp=period(x,h,sc); C+=pp[1:] if i else pp; x+=104*sc
    return C
def troch(k=3,d=1.6,A=26,P=70,shear=0.35,grow=None,start=-math.pi,steps=64):
    C=[]
    T0=start;T1=2*math.pi*(k-1)+math.pi*0.9
    n=int((T1-T0)/(2*math.pi)*steps)
    for i in range(n+1):
        t=T0+(T1-T0)*i/n
        g=1 if not grow else grow[0]+(grow[1]-grow[0])*(t-T0)/(T1-T0)
        x=P/(2*math.pi)*(t-d*math.sin(t))*1
        y=-A*g*math.cos(t)
        x+=shear*(-y)
        C.append((x,y))
    return C
