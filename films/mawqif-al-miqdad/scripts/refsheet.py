"""Model sheets: turnarounds, head close-ups (featureless head + beard only), palette, horses, props.
Produces PNG parts + an HTML board rendered to PNG by Playwright (proper Arabic shaping)."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
from rig import pose, draw_character
from costumes import COSTUMES, NAMES
from sequences import KNEEL
from horse import draw_horse

D = '/home/user/miqdad_film/docs/ref'
os.makedirs(D, exist_ok=True)

def save(arr, fn):
    im = Image.fromarray(arr); im = im.crop(im.getbbox()); im.save(fn); return im.size

parts = {}
for who in ['miqdad', 'abubakr', 'umar', 'ibnmasud', 'muh1', 'muh2', 'muh3', 'ans1', 'ans2', 'ans3', 'ans4', 'ans5']:
    cos = COSTUMES[who]
    H = 520 if who in ('miqdad', 'abubakr', 'umar', 'ibnmasud') else 300
    views = [('profile', pose(hturn=1.0)), ('threeq', pose(hturn=0.55)), ('front', pose(hturn=0.0, torso=0, neck=0)),
             ('kneel', pose(**{**KNEEL, 'hturn': 0.8}))]
    for v, p in views:
        arr, _, _ = draw_character(cos, p, H=H, size=(int(H * 1.0), int(H * 1.3)), origin=(H * 0.45, H * 1.25))
        parts[f'{who}_{v}'] = save(arr, f'{D}/{who}_{v}.png')
    # head close-up at 4x scale
    arr, J, (ox, oy) = draw_character(cos, pose(hturn=0.55), H=1600, size=(1500, 2000), origin=(700, 1960))
    im = Image.fromarray(arr)
    hx, hy = ox + J['hc'][0] * 1600, oy - J['hc'][1] * 1600
    im.crop((int(hx - 210), int(hy - 230), int(hx + 210), int(hy + 230))).save(f'{D}/{who}_head.png')
for coat in ('bay', 'chestnut'):
    save(draw_horse(coat, H=300), f'{D}/horse_{coat}.png')
json.dump(dict(parts=parts, names=NAMES, costumes=COSTUMES), open(f'{D}/parts.json', 'w'), ensure_ascii=False)
print('ok')
