"""AAT issue 561 (November 2026): 100 pages -> print PDF (A4 + 3 mm bleed, 300 dpi) + plain A4 pages for the web.
   python3 build.py            (sources in src/P<n>.*, cover from cover.html, page 6 from page6.html)
   Steps: render cover + page 6; every page -> A4 2480 x 3508 (ratio kept: <=2.5 % off is fitted, more is centred
   on a soft extension of its own edges); the AAT footer strip (grey band + page-number box) is redrawn with the
   right page number on the outer edge; bleed made from the page's own edges; PDF."""
import glob, json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
W, HH, BLEED = 2480, 3508, 35                       # A4 at 300 dpi, 3 mm bleed
os.makedirs('build', exist_ok=True); os.makedirs('out/pages', exist_ok=True); os.makedirs('out/web', exist_ok=True)

def sh(*a): subprocess.run(list(a), check=True)
if not os.path.exists('build/cover.png') or os.path.getmtime('cover.html') > os.path.getmtime('build/cover.png'): sh('node', 'shot.js', 'cover.html', 'build', '1')
if not os.path.exists('build/p6.png') or os.path.getmtime('page6.html') > os.path.getmtime('build/p6.png') or Image.open('build/p6.png').width < 2000:
    sh('node', 'shot.js', 'page6.html', 'build', '3.125')

src = {int(re.match(r'P(\d+)', os.path.basename(f)).group(1)): f for f in glob.glob('src/P*') if re.search(r'\.(jpe?g|png)$', f, re.I)}
src[1] = 'build/cover.png'; src[6] = 'build/p6.png'
assert sorted(src) == list(range(1, 101)), sorted(set(range(1, 101)) - set(src))

def to_a4(im):
    im = im.convert('RGB'); w, h = im.size; r = (h / w) / (HH / W)
    up = W / w
    if abs(r - 1) <= 0.025:
        out = im.resize((W, HH), Image.LANCZOS)
    else:                                            # keep the whole page: centre it on a blurred copy of itself
        bg = im.resize((W, HH), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
        s = min(W / w, HH / h); fg = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        bg.paste(fg, ((W - fg.width) // 2, (HH - fg.height) // 2)); out = bg; up = s
    if up > 1.3: out = out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
    return out, up

def band(a):
    """AAT footer strip: a light-grey full-width band near the bottom with a red number box at one corner."""
    g = (np.abs(a[..., 0] - 230) < 10) & (np.abs(a[..., 1] - 231) < 10) & (np.abs(a[..., 2] - 232) < 10)
    red = (a[..., 0] > 190) & (a[..., 1] < 75) & (a[..., 2] < 85)
    rows = [y for y in range(int(HH * .92), HH) if g[y].mean() > 0.30]
    runs = []                                        # longest run of consecutive grey rows
    for y in rows:
        if runs and y == runs[-1][1] + 1: runs[-1][1] = y
        else: runs.append([y, y])
    if not runs: return None
    y0, y1 = max(runs, key=lambda r: r[1] - r[0])
    if y1 - y0 < 20: return None
    mid = (y0 + y1) // 2; side = None
    if red[y0 + 3:y1 - 2, 0:40].mean() > .85: side = 'L'
    elif red[y0 + 3:y1 - 2, W - 40:W].mean() > .85: side = 'R'
    if not side: return None
    return y0, y1, side

if __name__ == '__main__':
    info = {}
    for n in range(1, 101):
        f = 'build/a4-%03d.png' % n
        if os.path.exists(f) and os.path.getmtime(f) > os.path.getmtime(src[n]):
            im = Image.open(f); up = json.load(open('build/info.json')).get(str(n), {}).get('up', 1) if os.path.exists('build/info.json') else 1
        else:
            im, up = to_a4(Image.open(src[n])); im.save(f)
        a = np.asarray(im.convert('RGB')).astype(int)
        info[n] = {'up': round(up, 2), 'band': band(a) if n != 1 else None}
    json.dump(info, open('build/info.json', 'w'))
    print('no footer strip:', [k for k, v in info.items() if not v['band']])
    print('low resolution (enlarged more than 2x):', [(k, v['up']) for k, v in info.items() if v['up'] > 2])
