import sys, glob
from PIL import Image, ImageDraw
d, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(f'{d}/t_*.jpg'))
w, h = 300, 533
ims = [Image.open(f).resize((w, h)) for f in fs]
rows = (len(ims) + cols - 1) // cols
s = Image.new('RGB', (w * cols, h * rows))
for i, (f, im) in enumerate(zip(fs, ims)):
    dd = ImageDraw.Draw(im); dd.rectangle([0, 0, 70, 18], fill=(200, 0, 0)); dd.text((3, 3), f.split('t_')[1][:-4], fill=(255, 255, 255))
    s.paste(im, ((i % cols) * w, (i // cols) * h))
s.save(out, quality=85)
