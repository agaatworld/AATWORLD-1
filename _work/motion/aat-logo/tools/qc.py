"""Quality control: the last frame of every intro/outro must match the original logo exactly.
   python3 tools/qc.py -> prints per-file: mean colour error in the logo area, red sample, % differing pixels.
   The reference is the original SVG rendered at the same place and size (same composition maths as lib.tsx)."""
import glob, json, os, subprocess, sys
import numpy as np
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, '..'); os.chdir(R)
L = json.load(open('src/logo.json')); SCR = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
SIZE = {'16x9': (1920, 1080), '1x1': (1080, 1080), '9x16': (1080, 1920)}
def ref(a, mark_only=False):
    W, Hh = SIZE[a]; share = {'16x9': .5, '1x1': .74, '9x16': .8}[a]; k = W * share / 413
    cy = Hh * .47 if a == '9x16' else Hh * .5; x0 = W / 2 - 413 * k / 2; y0 = cy - 138 * k / 2
    paths = ''.join('<path fill-rule="evenodd" fill="#000" d="%s"/>' % d for n, d in L['paths'].items() if not (mark_only and n in ('ideas', 'for', 'business')))
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d"><rect width="%d" height="%d" fill="#fff"/><g transform="translate(%f %f) scale(%f)">%s</g></svg>' % (W, Hh, W, Hh, x0, y0, k, paths)
    f = '%s/ref-%s%s.svg' % (SCR, a, '-m' if mark_only else ''); open(f, 'w').write(svg)
    subprocess.run(['node', '-e', "const {chromium}=require('/opt/node-tools/node_modules/playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:%d,height:%d}});await p.goto('file://%s');await p.screenshot({path:'%s.png'});await b.close()})()" % (W, Hh, f, f)], check=True)
    return np.asarray(Image.open(f + '.png').convert('L')) < 128, (x0, y0, k)
REF = {(a, mo): ref(a, mo) for a in SIZE for mo in (False, True)}   # ultra versions are the mark only (tagline too small)
bad = 0; rows = []
for f in sorted(x for x in glob.glob('out/c*/*-*-*-*.mp4') if '-transition-' not in x):   # transitions end on footage, not on the logo
    if f.endswith('_sfx.mp4'): continue
    a = f.split('-')[-1][:-4]; png = SCR + '/last.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.05', '-i', f, '-frames:v', '1', '-update', '1', png], check=True)
    im = np.asarray(Image.open(png).convert('RGB')).astype(int)
    m, _ = REF[(a, '-ultra-' in f)]
    red = (im[..., 0] - im[..., 1] > 90) & (im[..., 0] > 150)      # pixels that are logo red in the video
    inner = m.copy()                                                # compare away from anti-aliased edges
    for s in ((1, 0), (-1, 0), (0, 1), (0, -1)): inner &= np.roll(m, s, (0, 1))
    outer = ~m.copy()
    for s in ((2, 0), (-2, 0), (0, 2), (0, -2)): outer &= ~np.roll(m, s, (0, 1))
    miss = (inner & ~red).sum() / inner.sum() * 100; extra = (outer & red).sum() / max(1, inner.sum()) * 100
    col = np.median(im[inner & red], axis=0).astype(int) if (inner & red).any() else [0, 0, 0]
    ok = miss < 0.5 and extra < 0.5 and abs(col[0] - 210) <= 6 and abs(col[1] - 31) <= 6 and abs(col[2] - 38) <= 6
    bad += not ok; rows.append(f'{"OK " if ok else "BAD"} {os.path.basename(f):34s} missing {miss:5.2f}%  extra {extra:5.2f}%  red {tuple(col)}')
print('\n'.join(rows)); print(f'{len(rows)} files, {bad} not matching')
