import json, os, sys, shutil
from PIL import Image
ship = json.load(open(sys.argv[1]))
OUT = '/home/user/AATWORLD-1/_work/site-v3/'
done = 0
for row in ship:
    src, dest = row[0], row[1]; kind = row[2] if len(row) > 2 else 'copy'
    d = os.path.join(OUT, dest); os.makedirs(os.path.dirname(d), exist_ok=True)
    if kind == 'page' or kind == 'thumb':
        im = Image.open(src).convert('RGB'); w = 1100 if kind == 'page' else 220; q = 72 if kind == 'page' else 70
        h = round(im.height * w / im.width); im = im.resize((w, h), Image.LANCZOS); im.save(d, 'JPEG', quality=q, optimize=True, progressive=True)
    elif os.path.getsize(src) > 300 * 1024 and not src.endswith('.svg'):
        im = Image.open(src); scale = 1400 / max(im.size)
        if scale < 1: im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        if src.lower().endswith('.png'): im.save(d, 'PNG', optimize=True)
        else: im.convert('RGB').save(d, 'JPEG', quality=80, optimize=True)
        print('downscaled', src)
    else:
        shutil.copyfile(src, d)
    done += 1
print('shipped', done)
