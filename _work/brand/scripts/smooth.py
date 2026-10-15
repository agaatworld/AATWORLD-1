import math,re,json
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
def cr(P,n=60):
    P=[P[0]]+P+[P[-1]];out=[]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        for j in range(n):
            t=j/n;t2=t*t;t3=t2*t
            out.append(tuple(0.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3) for k in (0,1)))
    out.append(P[-2]);return out
def interp(keys,s):  # smooth keyframe interpolation
    for (s0,w0),(s1,w1) in zip(keys,keys[1:]):
        if s0<=s<=s1:
            t=(s-s0)/(s1-s0); t=t*t*(3-2*t); return w0+(w1-w0)*t
    return keys[-1][1]
# centreline (swash coords, y down), from ball to tip
C=[(45,72),(36,66.5),(24,67.5),(13,76),(7,91),(9,106),(19,118),(35,125),(55,127),(78,121),(100,106),(122,82),(142,54),(160,28),(175,1)]
K=[(0,14.4),(0.06,16),(0.14,15),(0.25,12.5),(0.4,12.5),(0.55,10),(0.72,5.5),(0.9,2),(1,0.6)]
def swash(C=C,K=K,ball=(45,72,7.2)):
    pts=cr(C);L=[0]
    for a,b in zip(pts,pts[1:]):L.append(L[-1]+math.dist(a,b))
    T=L[-1];left=[];right=[]
    for i,(x,y) in enumerate(pts):
        a=pts[max(0,i-1)];b=pts[min(len(pts)-1,i+1)];dx,dy=b[0]-a[0],b[1]-a[1];l=math.hypot(dx,dy) or 1
        nx,ny=-dy/l,dx/l;w=interp(K,L[i]/T)/2
        left.append((x+nx*w,y+ny*w));right.append((x-nx*w,y-ny*w))
    g=unary_union([Polygon(left+right[::-1]).buffer(0),Point(ball[0],ball[1]).buffer(ball[2],64)])
    return g.buffer(0.6,64).buffer(-0.6,64).simplify(0.03)
if __name__=='__main__':
    g=swash()
    def path(g):
        gs=g.geoms if hasattr(g,'geoms') else [g];o=''
        for p in gs:
            for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
        return o
    old=open('mark/swash_path.txt').read().split('\n',1)[1]
    open('mark/cmp.html','w').write('<body style="margin:0;background:#fff"><svg width="1100" height="860" viewBox="-5 -5 186 146"><path d="%s" fill="#000" opacity=".18"/><path d="%s" fill="#D21F26" opacity=".85"/></svg>'%(old,path(g)))
