import numpy as np, cairosvg
from shapely import affinity
from shapely.ops import unary_union
from logo_modern import seg_cubic, seg_spiral, path, stroke, to_d
def swash(P):
    tail=np.array(P['tail']);c=np.array(P['c']);r0=P['r0']
    start=c+np.array([0,r0])            # bottom of spiral
    cu=seg_cubic(tail,tail+np.array(P['h1']),start+np.array([-P['h2'],0]),start)
    sp=seg_spiral(c,r0,P['r1'],90,90-P['turn'],ease=1.4)
    return stroke(path(cu,sp),P['w'],ball=P['ball'])
P=dict(tail=(30,322),h1=(90,40),h2=105,c=(256,214),r0=62,r1=22,turn=400,
       w=[(0,4),(0.25,26),(0.5,34),(0.72,24),(0.9,16),(1,22)],ball=12)
def build(P=P,gap=9):
    a=swash(P);b=affinity.rotate(a,180,origin=(200,200))
    a2=a.difference(b.buffer(gap))
    return a2,b
if __name__=='__main__':
    a,b=build()
    d1,d2=to_d(a),to_d(b)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800"><rect width="400" height="400" fill="#fff"/><path fill="#D21F26" d="{d1}"/><path fill="#7A0A10" d="{d2}"/></svg>'
    cairosvg.svg2png(bytestring=svg.encode(),write_to='/tmp/claude-0/-home-user-AATWORLD-1/d5f456b7-d2ee-5851-a737-ee6ace2a186c/scratchpad/sym.png')
