import sys; sys.path.insert(0,'.')
from rig import *
from costumes import COSTUMES
from PIL import Image
H=1100
imgs=[]
for name,ps in [('miqdad',pose(hturn=1.0)),('miqdad',pose(hturn=0.55)),('miqdad',pose(hturn=0.0, torso=0, neck=0))]:
    arr,J,o = draw_character(COSTUMES[name], ps, H=H)
    imgs.append(Image.fromarray(arr))
W=sum(i.width for i in imgs); Hh=max(i.height for i in imgs)
sheet=Image.new('RGBA',(W,Hh),(40,48,70,255)); x=0
for i in imgs: sheet.alpha_composite(i,(x,0)); x+=i.width
sheet.convert('RGB').save('/home/user/miqdad_film/qa/rig_big.jpg',quality=88)
print(sheet.size)
