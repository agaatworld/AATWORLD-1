# Puts the current site's home (ref-home-ar.png, 1366x768) next to the new concept's home (tile-ar-1920.png)
# at the same height, with a label over each. Run: python3 -I compare.py  -> ref-vs-new.png
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
H = 800                      # common height of both pictures
GAP, PAD, TOP = 40, 24, 64
BG, INK, RED = (236, 238, 241), (20, 24, 33), (210, 31, 38)

ref = Image.open(os.path.join(HERE, 'ref-home-ar.png')).convert('RGB')
new = Image.open(os.path.join(HERE, 'tile-ar-1920.png')).convert('RGB')
ref = ref.resize((round(ref.width * H / ref.height), H), Image.LANCZOS)
new = new.resize((round(new.width * H / new.height), H), Image.LANCZOS)

W = PAD + ref.width + GAP + new.width + PAD
out = Image.new('RGB', (W, TOP + H + PAD), BG)
d = ImageDraw.Draw(out)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 30)
d.text((PAD, 16), 'aatworld.com today (1366 px)', fill=INK, font=font)
d.text((PAD + ref.width + GAP, 16), 'Concept "The Business Club" - new home (1920 px, same height)', fill=RED, font=font)
out.paste(ref, (PAD, TOP))
out.paste(new, (PAD + ref.width + GAP, TOP))
# thin frames so the white edges of the pages stay visible
d.rectangle([PAD - 1, TOP - 1, PAD + ref.width, TOP + H], outline=(170, 175, 185))
d.rectangle([PAD + ref.width + GAP - 1, TOP - 1, PAD + ref.width + GAP + new.width, TOP + H], outline=(170, 175, 185))
out.save(os.path.join(HERE, 'ref-vs-new.png'), optimize=True)
print('wrote ref-vs-new.png', out.size)
