import math
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
def bez(p0,p1,p2,p3,n=80):
    o=[]
    for i in range(n+1):
        t=i/n;u=1-t;o.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    return o
def spiral(c,R,turns=1.12,rend=0.40,n=220):
    b=math.log(1/rend)/(turns*2*math.pi);o=[]
    for i in range(n+1):
        a=turns*2*math.pi*i/n;r=R*math.exp(-b*a);ph=-math.pi/2+a
        o.append((c[0]+r*math.cos(ph),c[1]+r*math.sin(ph)))
    return o,(lambda a:R*math.exp(-b*a))
def ribbon(pts,widths):
    N=len(pts);L=[];Rr=[]
    for i,(x,y) in enumerate(pts):
        a=pts[max(0,i-1)];b=pts[min(N-1,i+1)];dx,dy=b[0]-a[0],b[1]-a[1];l=math.hypot(dx,dy) or 1
        nx,ny=-dy/l,dx/l;w=widths[i]/2;L.append((x+nx*w,y+ny*w));Rr.append((x-nx*w,y-ny*w))
    return unary_union([Polygon([L[i],L[i+1],Rr[i+1],Rr[i]]).buffer(0.02) for i in range(N-1)])
def sm(t):return t*t*(3-2*t)
PHI=55
def wave_line(k=3,R=34,gapx=None,wmax=13,wmin=3.2,lead=60,scale=None,ball=True):
    gapx=gapx or 2.55*R
    parts=[];start=(-lead,0);prev_tan=(1,0)
    for i in range(k):
        s=scale[i] if scale else 1; r=R*s
        c=(i*gapx+ (0 if not scale else sum((scale[j]-1)*gapx*0.5 for j in range(i))), -r*0.98)
        top=(c[0],c[1]-r)
        sp,rf=spiral(c,r)
        # back slope: from start to top, arriving horizontal
        p0=start; d=top[0]-p0[0]
        back=bez(p0,(p0[0]+prev_tan[0]*d*0.4,p0[1]+prev_tan[1]*d*0.4),(top[0]-d*0.5,top[1]),top,90)
        pts=back[:-1]+sp
        n1=len(back)-1;N=len(pts);ws=[]
        for j in range(N):
            if j<n1:
                t=j/n1
                if i==0: w=wmin*0.35+(wmax*0.55*s-wmin*0.35)*sm(t)
                else:
                    w0=wmax*0.75*s; wm=wmin*1.2*s; w1=wmax*0.55*s
                    w=w0+(wm-w0)*sm(min(1,t/0.45)) if t<0.45 else wm+(w1-wm)*sm((t-0.45)/0.55)
            else:
                t=(j-n1)/(N-n1)
                # thick on the falling front, thinner into the spiral
                w=wmax*s*(0.55+0.45*math.sin(min(1,t*2.2)*math.pi)) if t<0.45 else wmax*s*(0.55+0.45*math.sin(0.99*math.pi))*(1-sm((t-0.45)/0.55))+wmin*0.9*s*sm((t-0.45)/0.55)
            ws.append(w)
        for _ in range(6): ws=[sum(ws[max(0,j-3):j+4])/len(ws[max(0,j-3):j+4]) for j in range(N)]
        g=ribbon(pts,ws)
        if ball:
            ex,ey=sp[-1];g=unary_union([g,Point(ex,ey).buffer(wmin*1.35*s,48)])
        parts.append(g)
        # next starts at bottom of the spiral's first turn
        ph=math.radians(PHI); a=ph+math.pi/2; start=(c[0]+rf(a)*math.cos(ph), c[1]+rf(a)*math.sin(ph)); prev_tan=(math.sin(ph),-math.cos(ph))
    return unary_union(parts).buffer(1.6,64).buffer(-1.6,64).buffer(-0.6,64).buffer(0.6,64).simplify(0.04)
