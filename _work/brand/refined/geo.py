import re, json, numpy as np
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely import affinity
def rings_from_d(d,n=16):
    toks=re.findall(r'[MCLZ]|-?\d*\.?\d+',d);i=0;rings=[];cur=None;pos=None
    while i<len(toks):
        t=toks[i]
        if t=='M':pos=(float(toks[i+1]),float(toks[i+2]));cur=[pos];rings.append(cur);i+=3
        elif t=='L':pos=(float(toks[i+1]),float(toks[i+2]));cur.append(pos);i+=3
        elif t=='C':
            c=[float(x) for x in toks[i+1:i+7]];p0=np.array(pos);p1,p2,p3=np.array(c[:2]),np.array(c[2:4]),np.array(c[4:])
            for tt in np.linspace(0,1,n)[1:]:
                u=1-tt;cur.append(tuple(u**3*p0+3*u*u*tt*p1+3*u*tt*tt*p2+tt**3*p3))
            pos=tuple(p3);i+=7
        else:i+=1
    return rings
def geom_from_d(d):
    g=None
    for r in rings_from_d(d):
        if len(r)<3:continue
        p=Polygon(r).buffer(0);g=p if g is None else g.symmetric_difference(p)
    return g
def to_d(g,dp=2,tol=0.02):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    f=lambda v:f"{v:.{dp}f}".rstrip('0').rstrip('.')
    for p in gs:
        for r in [p.exterior]+list(p.interiors):
            cs=list(r.simplify(tol).coords)[:-1];o+='M'+'L'.join(f(x)+' '+f(y) for x,y in cs)+'Z'
    return o
def swash():
    R=json.load(open('parts.json'));A1=geom_from_d(R['A1'])
    k=413/2000;clip=Polygon([(x*k,y*k) for x,y in [(0,0),(850,0),(668,392),(600,480),(600,700),(0,700)]])
    sw=A1.intersection(clip);sw=max(sw.geoms,key=lambda g:g.area) if sw.geom_type!='Polygon' else sw
    return sw
