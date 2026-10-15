"""AAT modern logo geometry. Swashes are built from a line + one cubic sweep + a
shrinking spiral, stroked with a smooth width profile, then everything is unioned."""
import math
import numpy as np
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union

def seg_line(a,b,n=200):
    t=np.linspace(0,1,n)[:,None];return (1-t)*np.array(a)+t*np.array(b)
def seg_cubic(p0,p1,p2,p3,n=400):
    t=np.linspace(0,1,n)[:,None];u=1-t;P=[np.array(p) for p in (p0,p1,p2,p3)]
    return u**3*P[0]+3*u*u*t*P[1]+3*u*t*t*P[2]+t**3*P[3]
def seg_spiral(c,r0,r1,th0,th1,n=500,ease=1.0):
    t=np.linspace(0,1,n);th=np.radians(th0+(th1-th0)*t);r=r0+(r1-r0)*(t**ease)
    return np.c_[c[0]+r*np.cos(th),c[1]+r*np.sin(th)]
def path(*segs):
    pts=[segs[0]]+[s[1:] for s in segs[1:]];return np.vstack(pts)
def widths(keys,s):
    out=np.empty_like(s)
    for i,v in enumerate(s):
        for a,b in zip(keys,keys[1:]):
            if a[0]<=v<=b[0]:
                t=(v-a[0])/(b[0]-a[0]) if b[0]>a[0] else 0;t=t*t*(3-2*t);out[i]=a[1]+(b[1]-a[1])*t;break
        else: out[i]=keys[-1][1]
    return out
def stroke(c,keys,ball=None,start_ball=None):
    d=np.r_[0,np.cumsum(np.hypot(*np.diff(c,axis=0).T))];s=d/d[-1]
    # resample uniformly by arclength
    u=np.linspace(0,d[-1],int(d[-1]*3));c=np.c_[np.interp(u,d,c[:,0]),np.interp(u,d,c[:,1])];s=u/u[-1]
    w=widths(keys,s)
    k=4;tg=np.r_[c[k:]-c[:-k]]
    tg=np.r_[np.repeat(tg[:1],k//2,0),tg,np.repeat(tg[-1:],k-k//2,0)]
    tg/=np.hypot(tg[:,0],tg[:,1])[:,None];nr=np.c_[-tg[:,1],tg[:,0]]
    L=c+nr*w[:,None]/2;R=c-nr*w[:,None]/2
    parts=[Polygon(np.r_[L,R[::-1]]).buffer(0)]
    if ball:parts.append(Point(c[-1]).buffer(ball,resolution=64))
    if start_ball:parts.append(Point(c[0]).buffer(start_ball,resolution=64))
    return unary_union(parts)
def quad(a,b,top,base):return Polygon([(a[0],top),(a[1],top),(b[1],base),(b[0],base)])

def build(v):
    S={}
    for k in ('A1','A2'):
        p=v[k];leg=p['leg']
        top_pt=leg['top'];join=leg['join'];bot=leg['bottom']
        dirv=np.subtract(join,top_pt);dirv=dirv/np.hypot(*dirv)
        c=path(seg_line(top_pt,join),
               seg_cubic(join,np.add(join,dirv*leg['k1']),np.add(bot,(leg['k2'],0)),bot),
               seg_spiral(leg['c'],leg['r0'],leg['r1'],90,leg['th1'],ease=leg.get('ease',1.0)))
        by=p['bar_y'];i=np.argmin(np.abs(c[:len(c)//3,1]-(by[0]+by[1])/2));lx=c[i,0]
        bx1=np.interp((by[0]+by[1])/2,[v['top'],v['base']],[p['stem_top'][0],p['stem_bot'][0]])+6
        bar=Polygon([(lx,by[0]),(bx1,by[0]),(bx1,by[1]),(lx-(by[1]-by[0])*0.45,by[1])])
        S[k]=unary_union([quad(p['stem_top'],p['stem_bot'],v['top'],v['base']),
                          stroke(c,p['w'],ball=p['ball']),bar])
    t=v['T'];bar=seg_cubic(*t['bar'])
    S['T']=unary_union([stroke(bar,t['bw'],ball=t['cap'],start_ball=t['cap']),Polygon(t['stem'])])
    return S
def to_d(geom,dp=2):
    f=lambda x:f"{x:.{dp}f}".rstrip('0').rstrip('.')
    gs=geom.geoms if hasattr(geom,'geoms') else [geom];d=''
    for g in gs:
        for ring in [g.exterior]+list(g.interiors):
            cs=list(ring.simplify(0.05).coords)[:-1]
            d+='M'+'L'.join(f(x)+' '+f(y) for x,y in cs)+'Z'
    return d

def text_d(txt,font,cap,base,track=0.0,x=None,right=None,dp=2):
    """Outline text with fontTools. track in em. Aligns left at x or right edge at right."""
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.pens.boundsPen import BoundsPen
    f=TTFont(font);gs=f.getGlyphSet();cm=f.getBestCmap();hm=f['hmtx'];upm=f['head'].unitsPerEm
    s=cap/f['OS/2'].sCapHeight
    adv=[];pen_x=0
    for ch in txt: adv.append(pen_x);pen_x+=hm[cm[ord(ch)]][0]+track*upm
    # true right edge of last glyph
    bp=BoundsPen(gs);gs[cm[ord(txt[-1])]].draw(bp);last_r=adv[-1]+bp.bounds[2]
    bp=BoundsPen(gs);gs[cm[ord(txt[0])]].draw(bp);first_l=bp.bounds[0]
    x0=(right-last_r*s) if right is not None else x-first_l*s
    pen=SVGPathPen(gs,ntos=lambda v:f"{v:.{dp}f}".rstrip('0').rstrip('.'))
    for ch,a in zip(txt,adv):
        if ch==' ':continue
        gs[cm[ord(ch)]].draw(TransformPen(pen,(s,0,0,-s,x0+a*s,base)))
    return pen.getCommands(),(x0+first_l*s,base-cap,x0+last_r*s,base)
