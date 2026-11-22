"""Horse animation drawings. Weighted timing: slow-in/slow-out head moves with overshoot,
tail flick with follow-through, weight shift that rests a hind hoof, a head-toss snort."""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
from horse import draw_horse
from rig import ease

OUT = '/home/user/miqdad_film/art/horses'
HH = 600

def keyed(n, keys):
    """keys: list of (i, dict, ease). linear blend of numeric params."""
    out = []
    for i in range(n):
        for (a, pa, _), (b, pb, e) in zip(keys, keys[1:]):
            if a <= i <= b:
                t = 0 if a == b else ease((i - a) / (b - a), e)
                out.append({k: pa.get(k, 0) + (pb.get(k, 0) - pa.get(k, 0)) * t for k in set(pa) | set(pb)})
                break
        else:
            out.append(dict(keys[-1][1]))
    return out

SEQS = {
    'idle': keyed(8, [(0, dict(breathe=0, tail=0), 'lin'), (4, dict(breathe=1, tail=0.08), 'inout'), (8, dict(breathe=0, tail=0), 'inout')]),
    'look': keyed(14, [(0, dict(head=0, nod=0), 'lin'), (2, dict(head=-2, nod=2), 'inout'), (7, dict(head=9, nod=-7, ear=0.6), 'inout'),
                       (9, dict(head=8, nod=-6, ear=0.5), 'lin'), (13, dict(head=0, nod=0, ear=0), 'inout')]),
    'tail': keyed(10, [(0, dict(tail=0), 'lin'), (2, dict(tail=0.9, tail_lift=0.3), 'out'), (4, dict(tail=-0.5, tail_lift=0.15), 'inout'),
                       (6, dict(tail=0.35), 'inout'), (8, dict(tail=-0.1), 'inout'), (10, dict(tail=0), 'inout')]),
    'shift': keyed(10, [(0, dict(shift=0), 'lin'), (5, dict(shift=-1, head=-3, nod=3), 'inout'), (10, dict(shift=-1, head=-2, nod=2), 'inout')]),
    'unshift': keyed(8, [(0, dict(shift=-1, head=-2, nod=2), 'lin'), (8, dict(shift=0, head=0, nod=0), 'inout')]),
    'snort': keyed(12, [(0, dict(head=0, nod=0), 'lin'), (2, dict(head=-4, nod=5), 'in'), (4, dict(head=7, nod=-9, ear=0.8), 'out'),
                        (6, dict(head=3, nod=-3, ear=0.4), 'inout'), (8, dict(head=5, nod=-5), 'inout'), (12, dict(head=0, nod=0, ear=0), 'inout')]),
    'graze': keyed(12, [(0, dict(head=0, nod=0), 'lin'), (8, dict(head=-16, nod=10, ear=0.3), 'inout'), (12, dict(head=-15, nod=9, ear=0.2), 'inout')]),
}

def main():
    man = {}
    for coat in ('bay', 'chestnut'):
        man[coat] = dict(H=HH, seqs={})
        for name, frames in SEQS.items():
            d = f'{OUT}/{coat}/{name}'
            os.makedirs(d, exist_ok=True)
            fl = []
            for i, prm in enumerate(frames):
                W, Hc = int(HH * 2.25), int(HH * 1.75)
                ox, oy = W * 0.55, Hc - HH * 0.06
                arr = draw_horse(coat, H=HH, size=(W, Hc), origin=(ox, oy), seed=i % 2, **prm)
                im = Image.fromarray(arr)
                bb = im.getbbox(); im = im.crop(bb)
                fn = f'{d}/{i:03d}.webp'
                im.save(fn, 'WEBP', quality=84, method=6)
                fl.append(dict(f=os.path.relpath(fn, OUT), x=bb[0] - ox, y=bb[1] - oy, w=im.width, h=im.height))
            man[coat]['seqs'][name] = fl
            print(coat, name, len(fl), flush=True)
    json.dump(man, open(f'{OUT}/manifest.json', 'w'), indent=0)

if __name__ == '__main__':
    main()
