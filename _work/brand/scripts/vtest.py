from vit import *
def path(g):
    gs=g.geoms if hasattr(g,'geoms') else [g];o=''
    for p in gs:
        for r in [p.exterior]+list(p.interiors):o+='M'+' L'.join('%.2f %.2f'%c for c in r.coords)+'Z'
    return o
V={'3':wave_line(3),'2':wave_line(2),'3 grow':wave_line(3,scale=[0.78,0.9,1.04]),'1':wave_line(1)}
h='<body style="margin:0;display:flex;flex-wrap:wrap;width:1500px">'
for k,g in V.items():
    mx,my,Mx,My=g.bounds;h+='<div style="width:720px;height:420px;margin:10px;background:#fff;font:22px sans-serif">%s<svg width="700" height="380" viewBox="%g %g %g %g"><path fill="#D21F26" d="%s"/></svg></div>'%(k,mx-8,my-8,Mx-mx+16,My-my+16,path(g))
open('mark/cw.html','w').write(h)
