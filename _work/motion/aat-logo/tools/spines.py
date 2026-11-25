"""Centre lines of the AAT letterforms (for traced reveals). Rasterises each glyph from src/logo.json,
skeletonises it, takes the shortest skeleton route between chosen endpoints, smooths it -> src/spines.json (logo units)."""
import json, os, subprocess, sys, heapq, math
import numpy as np
from PIL import Image
from skimage.morphology import skeletonize
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, '..'); S = 8   # px per logo unit
L = json.load(open(os.path.join(R, 'src/logo.json')))
SCR = sys.argv[1]
def raster(name):
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 413 138" width="%d" height="%d"><rect width="413" height="138" fill="#fff"/><path fill-rule="evenodd" fill="#000" d="%s"/></svg>' % (413*S, 138*S, L['paths'][name])
    open(SCR + '/g.svg', 'w').write(svg)
    subprocess.run(['node', '-e', "const {chromium}=require('/opt/node-tools/node_modules/playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:%d,height:%d}});await p.goto('file://%s/g.svg');await p.screenshot({path:'%s/g.png'});await b.close()})()" % (413*S, 138*S, SCR, SCR)], check=True)
    return np.asarray(Image.open(SCR + '/g.png').convert('L')) < 128
def route(sk, a, b):
    ys, xs = np.nonzero(sk); pts = set(zip(ys.tolist(), xs.tolist()))
    def near(p): return min(pts, key=lambda q: (q[0]-p[1]*S)**2 + (q[1]-p[0]*S)**2)
    s, t = near(a), near(b); dist = {s: 0}; prev = {}; pq = [(0, s)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == t: break
        if d > dist[u]: continue
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                v = (u[0]+dy, u[1]+dx)
                if v in pts and v != u:
                    nd = d + math.hypot(dy, dx)
                    if nd < dist.get(v, 1e18): dist[v] = nd; prev[v] = u; heapq.heappush(pq, (nd, v))
    path = [t]
    while path[-1] != s: path.append(prev[path[-1]])
    path = path[::-1]
    P = np.array([(x / S, y / S) for y, x in path], float)
    k = 31; K = np.ones(k) / k                                    # smooth, then resample every ~3 units
    Ps = np.stack([np.convolve(np.pad(P[:, i], k // 2, mode='edge'), K, 'valid') for i in range(2)], 1)
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(Ps, axis=0).T))]; n = max(2, int(seg[-1] / 3))
    q = np.linspace(0, seg[-1], n); Q = np.stack([np.interp(q, seg, Ps[:, i]) for i in range(2)], 1)
    return 'M' + ' L'.join('%.1f %.1f' % (x, y) for x, y in Q), float(seg[-1])
# (start, end) in logo units: curl tip -> apex, then apex -> right foot; T: left hook -> right end of bar, top of stem -> foot
ENDS = {'a1': [((45, 72), (172, 3)), ((180, 4), (195, 104))],
        'a2': [((146, 109), (279, 3)), ((287, 4), (298, 104))],
        't':  [((298, 31), (409, 30)), ((355, 14), (355, 108))]}
out = {}
for name, pairs in ENDS.items():
    sk = skeletonize(raster(name)); segs = [route(sk, a, b) for a, b in pairs]
    out[name] = {'d': ' '.join(s for s, _ in segs), 'parts': [{'d': s, 'len': round(l, 1)} for s, l in segs]}
    print(name, [round(l) for _, l in segs])
json.dump(out, open(os.path.join(R, 'src/spines.json'), 'w'))
