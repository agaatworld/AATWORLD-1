"""Clean the traced AAT outlines without changing the design:
corner-preserving Gaussian smoothing + snapping near-straight runs to lines.
python3 refine.py in.svg out.svg [sigma] [step]"""
import re, sys
import numpy as np
from shapely.geometry import LineString

def parse_rings(d):
    toks=re.findall(r'[MCLZmclz]|-?\d*\.?\d+(?:e-?\d+)?',d); i=0; rings=[]; cur=None; pos=None
    while i<len(toks):
        t=toks[i]
        if t=='M': pos=np.array([float(toks[i+1]),float(toks[i+2])]); cur=[pos]; rings.append(cur); i+=3
        elif t=='L':
            i+=1
            while i<len(toks) and toks[i] not in 'MCLZmclz': pos=np.array([float(toks[i]),float(toks[i+1])]); cur.append(pos); i+=2
        elif t=='C':
            i+=1
            while i<len(toks) and toks[i] not in 'MCLZmclz':
                c=[float(x) for x in toks[i:i+6]]; p0=pos; p1=np.array(c[0:2]); p2=np.array(c[2:4]); p3=np.array(c[4:6])
                for t_ in np.linspace(0,1,25)[1:]:
                    u=1-t_; cur.append(u**3*p0+3*u*u*t_*p1+3*u*t_*t_*p2+t_**3*p3)
                pos=p3; i+=6
        else: i+=1
    return [np.array(r) for r in rings]

def resample(r,step):
    r=np.vstack([r,r[:1]]); d=np.r_[0,np.cumsum(np.hypot(*np.diff(r,axis=0).T))]
    n=max(8,int(d[-1]/step)); u=np.linspace(0,d[-1],n,endpoint=False)
    return np.c_[np.interp(u,d,r[:,0]),np.interp(u,d,r[:,1])]

def corners(r,k,thr):
    n=len(r); a=np.zeros(n)
    for i in range(n):
        v1=r[i]-r[i-k]; v2=r[(i+k)%n]-r[i]
        c=np.dot(v1,v2)/(np.hypot(*v1)*np.hypot(*v2)+1e-12); a[i]=np.degrees(np.arccos(np.clip(c,-1,1)))
    idx=[i for i in range(n) if a[i]>thr and a[i]==max(a[(i+j)%n] for j in range(-2*k,2*k+1))]
    # dedupe equal maxima
    out=[]
    for i in idx:
        if not out or min(abs(i-out[-1]),n-abs(i-out[-1]))>2*k: out.append(i)
    return out

def gsmooth_open(seg,sig):
    if len(seg)<5 or sig<=0: return seg
    m=int(3*sig)+1
    a,b=seg[0],seg[-1]
    left=2*a-seg[1:m+1][::-1]; right=2*b-seg[-m-1:-1][::-1]
    ext=np.vstack([left,seg,right]); x=np.arange(-m,m+1); k=np.exp(-x*x/(2*sig*sig)); k/=k.sum()
    sm=np.c_[np.convolve(ext[:,0],k,'same'),np.convolve(ext[:,1],k,'same')][m:m+len(seg)]
    sm[0]=a; sm[-1]=b; return sm

def snap_lines(seg,tol,minlen):
    a,b=seg[0],seg[-1]; L=np.hypot(*(b-a))
    if L<minlen: return seg
    v=seg-a; dev=np.abs((b-a)[0]*v[:,1]-(b-a)[1]*v[:,0])/L
    if dev.max()<tol: return np.linspace(a,b,len(seg))
    return seg

def refine_ring(r,step=0.12,sig_units=1.0,corner_deg=40,line_tol=0.3,line_min=5,kw_units=1.2):
    r=resample(r,step); n=len(r); k=max(3,int(kw_units/step))
    cs=corners(r,k,corner_deg); sig=sig_units/step
    if not cs:
        # closed smooth ring: circular convolution
        m=int(3*sig)+1; x=np.arange(-m,m+1); kk=np.exp(-x*x/(2*sig*sig)); kk/=kk.sum()
        ext=np.vstack([r[-m:],r,r[:m]]); return np.c_[np.convolve(ext[:,0],kk,'same'),np.convolve(ext[:,1],kk,'same')][m:m+n]
    out=[]
    for j,c in enumerate(cs):
        e=cs[(j+1)%len(cs)]; L=((e-c)%n) or n; idx=[(c+t)%n for t in range(L+1)]
        seg=gsmooth_open(r[idx],sig); seg=snap_lines(seg,line_tol,line_min)
        out.append(seg[:-1])
    return np.vstack(out)

def to_d(rings,tol=0.02,dp=3):
    f=lambda v:f"{v:.{dp}f}".rstrip('0').rstrip('.')
    d=''
    for r in rings:
        ls=LineString(np.vstack([r,r[:1]])).simplify(tol); cs=list(ls.coords)[:-1]
        d+='M'+'L'.join(f(x)+' '+f(y) for x,y in cs)+'Z'
    return d
