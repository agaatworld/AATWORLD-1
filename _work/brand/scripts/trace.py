import numpy as np,json
from PIL import Image,ImageFilter
from skimage import measure
from shapely.geometry import Polygon
from shapely.ops import unary_union
from shapely import affinity as A
U='/root/.claude/uploads/3d82459c-1cb2-560a-871e-3578e4d8b00b/'
def trace(f):
    im=np.asarray(Image.open(f).convert('RGB')).astype(float)
    r,g,b=im[...,0],im[...,1],im[...,2]
    m=((r-g)>80).astype(float)
    m=np.asarray(Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))).astype(float)/255
    cs=measure.find_contours(m,0.5)
    polys=[Polygon([(p[1],p[0]) for p in c]).buffer(0) for c in cs if len(c)>30]
    polys=[p for p in polys if p.area>200]
    g=unary_union(polys).simplify(0.5)
    x0,y0,x1,y1=g.bounds
    return A.translate(g,-x0,-y0),(x1-x0,y1-y0)
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.1f %.1f'%c for c in r.coords)+'Z'
    return o
out={}
for k,f in (('pair','ea45c652-image.png'),('one','8f027f00-image.png')):
    g,(w,h)=trace(U+f); out[k]={'d':path(g),'w':w,'h':h}
    print(k,w,h,len(out[k]['d']))
    open('mark/AAT-user-%s.svg'%k,'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.1f %.1f" fill="#D21F26"><path d="%s"/></svg>'%(w,h,out[k]['d']))
json.dump(out,open('mark/user_symbols.json','w'))
