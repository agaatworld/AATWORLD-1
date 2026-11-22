import sys; sys.path.insert(0,'.')
from rig import *
from costumes import COSTUMES
from PIL import Image
H=900
stand = pose()
kneel = pose(hip=(-0.03,0.17), torso=6, neck=6, near_ankle=(-0.07,0.012), far_ankle=(-0.09,0.012), near_foot=180, far_foot=180,
             near_arm=(25,0.62,-1), far_arm=(20,0.62,-1), robe_cover=1.0, near_hand='relax')
chest = pose(near_arm=(40,0.42,-1), near_hand='flat', near_hand_rot=-80, hturn=0.6)
openarm = pose(near_arm=(78,0.95,-1), near_hand='open', near_hand_rot=-20, hturn=0.9, torso=4)
front = pose(hturn=0.0)
imgs=[]
for name,ps in [('miqdad',stand),('miqdad',kneel),('miqdad',chest),('miqdad',openarm),('miqdad',front),('abubakr',stand),('umar',stand),('ibnmasud',stand),('ans1',stand),('muh2',stand),('ans4',kneel)]:
    arr,J,o = draw_character(COSTUMES[name], ps, H=H)
    imgs.append(Image.fromarray(arr))
W=sum(i.width for i in imgs); Hh=max(i.height for i in imgs)
sheet=Image.new('RGBA',(W,Hh),(40,48,70,255)); x=0
for i in imgs: sheet.alpha_composite(i,(x,0)); x+=i.width
sheet.convert('RGB').resize((W//2,Hh//2)).save('/home/user/miqdad_film/qa/rig_test.jpg',quality=88)
