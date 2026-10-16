"""Re-trace each logo part with potrace for smooth, clean Bezier outlines.
python3 retrace.py  -> parts.json (A1,A2,T paths in 413x138 units)"""
import re, io, json, sys, time
import numpy as np, cairosvg, potrace
from PIL import Image, ImageFilter
SRC='../logo/AAT-logo-red.svg'
W=int(sys.argv[1]) if len(sys.argv)>1 else 3304   # px width for 413 units -> 8 px/unit
BLUR=float(sys.argv[2]) if len(sys.argv)>2 else 0.45 # units
ALPHA=float(sys.argv[3]) if len(sys.argv)>3 else 1.0
PAD=10
k=W/413.0; WW=int((413+2*PAD)*k); H=int((138+2*PAD)*k)
svg=open(SRC).read(); ps=re.findall(r'<path[^>]*d="([^"]+)"',svg)
def trace_path(d):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-PAD} {-PAD} {413+2*PAD} {138+2*PAD}" width="{WW}" height="{H}"><path fill-rule="evenodd" fill="#000" d="{d}"/></svg>'
    im=Image.open(io.BytesIO(cairosvg.svg2png(bytestring=s.encode(),background_color="white"))).convert('L')
    if BLUR>0: im=im.filter(ImageFilter.GaussianBlur(BLUR*k))
    a=np.array(im)<128
    bm=potrace.Bitmap(a); pl=bm.trace(turdsize=20,turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,alphamax=ALPHA,opticurve=True,opttolerance=0.25)
    f=lambda p:f"{p.x/k-PAD:.3f} {p.y/k-PAD:.3f}"
    out=''
    for c in pl:
        xs=[c.start_point.x]+[sg.end_point.x for sg in c.segments]; ys=[c.start_point.y]+[sg.end_point.y for sg in c.segments]
        if min(xs)<2 and min(ys)<2 and max(xs)>WW-3: continue
        out+='M'+f(c.start_point)
        for sg in c.segments:
            if sg.is_corner: out+='L'+f(sg.c)+'L'+f(sg.end_point)
            else: out+='C'+f(sg.c1)+' '+f(sg.c2)+' '+f(sg.end_point)
        out+='Z'
    return out
t=time.time(); R={}
for name,d in zip(('A1','A2','T'),ps[:3]): R[name]=trace_path(d); print(name,len(R[name]),round(time.time()-t,1))
json.dump(R,open('parts.json','w'))
