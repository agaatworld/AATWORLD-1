"""Re-trace any filled SVG path with potrace. trace_d(d, vb_w, vb_h, px_w, blur_units)"""
import io, numpy as np, cairosvg, potrace
from PIL import Image, ImageFilter
def trace_d(d,vw,vh,pxw=3000,blur=0.0,alpha=1.0,rule='nonzero',dp=2):
    pad=0.03*vw;k=pxw/vw;W=int((vw+2*pad)*k);H=int((vh+2*pad)*k)
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {vw+2*pad} {vh+2*pad}" width="{W}" height="{H}"><path fill-rule="{rule}" d="{d}"/></svg>'
    im=Image.open(io.BytesIO(cairosvg.svg2png(bytestring=s.encode(),background_color='white'))).convert('L')
    if blur>0: im=im.filter(ImageFilter.GaussianBlur(blur*k))
    pl=potrace.Bitmap(np.array(im)<128).trace(turdsize=20,turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,alphamax=alpha,opticurve=True,opttolerance=0.25)
    f=lambda p:f"{p.x/k-pad:.{dp}f} {p.y/k-pad:.{dp}f}"
    out=''
    for c in pl:
        xs=[c.start_point.x]+[sg.end_point.x for sg in c.segments]; ys=[c.start_point.y]+[sg.end_point.y for sg in c.segments]
        if min(xs)<3 and min(ys)<3 and max(xs)>W-4: continue
        out+='M'+f(c.start_point)
        for sg in c.segments:
            out+=('L'+f(sg.c)+'L'+f(sg.end_point)) if sg.is_corner else ('C'+f(sg.c1)+' '+f(sg.c2)+' '+f(sg.end_point))
        out+='Z'
    return out
