"""Key poses + in-betweens for every character action. Each sequence is a list of drawings
(24 fps timeline, mostly animated on twos: one drawing per 2 frames = 12 drawings/s).
Secondary motion (cloak hem sway, turban tail) is simulated with a damped spring so cloth
lags behind the body (follow-through) instead of moving rigidly."""
import json, os, sys, math, copy
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from PIL import Image
from rig import pose, lerp_pose, ease, draw_character
from costumes import COSTUMES

OUT = '/home/user/miqdad_film/art/chars'

KNEEL = dict(hip=(-0.03, 0.17), torso=6, neck=5, near_ankle=(-0.075, 0.012), far_ankle=(-0.095, 0.012),
             near_foot=180, far_foot=180, near_arm=(26, 0.60, -1), far_arm=(22, 0.60, -1), robe_cover=1.0)
STAND = dict(hip=(0.0, 0.508), torso=2.0, neck=4.0, near_ankle=(0.035, 0.028), far_ankle=(-0.035, 0.028),
             near_foot=0, far_foot=0, near_arm=(8.0, 0.97, -1), far_arm=(-4.0, 0.97, -1), robe_cover=0.80)

def P(base=None, **kw):
    d = dict(base or {})
    d.update(kw)
    return pose(**d)

def build(keys, n):
    """keys: list of (drawing_index, pose_dict, ease_kind). returns list of poses length n."""
    out = []
    for i in range(n):
        for (a, pa, _), (b, pb, e) in zip(keys, keys[1:]):
            if a <= i <= b:
                t = 0 if b == a else (i - a) / (b - a)
                out.append(lerp_pose(pa, pb, ease(t, e)))
                break
        else:
            out.append(copy.deepcopy(keys[-1][1]))
    return out

def secondary(poses, k=0.35, damp=0.55, gain=9.0):
    """Spring-driven cloak sway & turban-tail sway from hip/torso motion."""
    pos = 0.0; vel = 0.0; tpos = 0.0; tvel = 0.0
    prev = None
    for p in poses:
        hx = p['hip'][0] + math.sin(math.radians(p['torso'])) * 0.3
        drive = 0.0 if prev is None else -(hx - prev) * gain
        prev = hx
        vel = vel * damp + (drive - pos) * k
        pos += vel
        tvel = tvel * 0.6 + (drive * 1.3 - tpos) * 0.28
        tpos += tvel
        p['sway'] = max(-1.4, min(1.4, p.get('sway', 0) + pos))
        p['tail_sway'] = max(-1.5, min(1.5, p.get('tail_sway', 0) + tpos))
    return poses

# ------------------------------------------------------------------ sequences
def seq_kneel_idle(c):
    return [P(KNEEL, hturn=0.75)]

def seq_kneel_turn(c, h0=0.15, h1=0.95):
    a = P(KNEEL, hturn=h0, neck=8)
    b = P(KNEEL, hturn=h1 + 0.05, neck=2, torso=4)
    b2 = P(KNEEL, hturn=h1, neck=3, torso=5)
    return secondary(build([(0, a, 'lin'), (1, a, 'lin'), (6, b, 'out'), (8, b2, 'inout')], 9))

def seq_kneel_nod(c):
    a = P(KNEEL, hturn=0.9, neck=4)
    b = P(KNEEL, hturn=0.85, neck=16, torso=9)
    return build([(0, a, 'lin'), (4, b, 'inout'), (7, b, 'lin'), (11, a, 'inout')], 12)

def seq_kneel_chest(c):
    """seated: hand slowly to chest (wish/pledge)."""
    a = P(KNEEL, hturn=0.9)
    b = P({**KNEEL, 'near_arm': (40, 0.40, -1)}, hturn=0.92, neck=9, torso=8, near_hand='flat', near_hand_rot=-82)
    mid = P({**KNEEL, 'near_arm': (48, 0.52, -1)}, hturn=0.9, neck=6, torso=7, near_hand='relax', near_hand_rot=-40)
    return build([(0, a, 'lin'), (4, mid, 'in'), (8, b, 'out'), (9, b, 'lin')], 10)

def seq_stand_up(c):
    k0 = P(KNEEL, hturn=0.85)
    k1 = P({**KNEEL, 'near_arm': (30, 0.55, -1)}, hturn=0.9, torso=14, neck=12)                       # anticipation
    k2 = P(hip=(-0.02, 0.21), torso=16, neck=10, near_ankle=(0.15, 0.028), far_ankle=(-0.10, 0.012),   # near foot planted
           near_foot=0, far_foot=180, near_arm=(55, 0.55, -1), far_arm=(20, 0.62, -1), robe_cover=0.95, hturn=0.9,
           near_hand='relax')
    k3 = P(hip=(0.03, 0.36), torso=24, neck=8, near_ankle=(0.14, 0.028), far_ankle=(-0.07, 0.03),       # push up
           near_foot=0, far_foot=30, near_arm=(40, 0.75, -1), far_arm=(10, 0.85, -1), robe_cover=0.88, hturn=0.9)
    k4 = P(hip=(0.06, 0.49), torso=8, neck=5, near_ankle=(0.12, 0.028), far_ankle=(0.0, 0.03),
           near_foot=0, far_foot=0, near_arm=(14, 0.95, -1), far_arm=(0, 0.95, -1), robe_cover=0.81, hturn=0.85)
    k5 = P(hip=(0.075, 0.512), torso=-1.5, neck=2, near_ankle=(0.11, 0.028), far_ankle=(0.035, 0.028),  # overshoot
           near_arm=(6, 0.97, -1), far_arm=(-6, 0.97, -1), robe_cover=0.80, hturn=0.8)
    k6 = P(hip=(0.072, 0.508), torso=2, neck=4, near_ankle=(0.11, 0.028), far_ankle=(0.035, 0.028),
           near_arm=(8, 0.97, -1), far_arm=(-4, 0.97, -1), robe_cover=0.80, hturn=0.8)
    keys = [(0, k0, 'lin'), (2, k1, 'inout'), (5, k2, 'inout'), (9, k3, 'inout'), (12, k4, 'out'), (14, k5, 'out'), (16, k6, 'inout')]
    return secondary(build(keys, 17))

STANDX = dict(STAND, hip=(0.072, 0.508), near_ankle=(0.11, 0.028), far_ankle=(0.035, 0.028))

def seq_stand_idle(c, h=0.8):
    a = P(STANDX, hturn=h)
    b = P(STANDX, hturn=h, torso=2.6, neck=3.2)
    return build([(0, a, 'lin'), (3, b, 'inout'), (6, a, 'inout')], 6)

def seq_speak(c, h=0.85):
    """speaking gesture: forearm rises, palm opens toward the unseen listener, small emphasis, hold."""
    a = P(STANDX, hturn=h)
    b = P({**STANDX, 'near_arm': (55, 0.62, -1)}, hturn=h, neck=2, near_hand='relax', near_hand_rot=-30)
    cpose = P({**STANDX, 'near_arm': (72, 0.80, -1)}, hturn=h + 0.05, neck=0, torso=3.5, near_hand='open', near_hand_rot=-55)
    d = P({**STANDX, 'near_arm': (66, 0.76, -1)}, hturn=h, neck=3, torso=3, near_hand='open', near_hand_rot=-50)
    keys = [(0, a, 'lin'), (3, b, 'in'), (6, cpose, 'out'), (9, d, 'inout'), (11, cpose, 'inout'), (12, d, 'inout')]
    return secondary(build(keys, 13))

def seq_lower(c, h=0.85):
    d = P({**STANDX, 'near_arm': (66, 0.76, -1)}, hturn=h, neck=3, torso=3, near_hand='open', near_hand_rot=-50)
    m = P({**STANDX, 'near_arm': (35, 0.85, -1)}, hturn=h, neck=5, torso=2.5, near_hand='relax', near_hand_rot=-10)
    a = P(STANDX, hturn=h, neck=5)
    return secondary(build([(0, d, 'lin'), (4, m, 'in'), (8, a, 'out')], 9))

def seq_turn(c, h0=0.3, h1=0.95):
    a = P(STANDX, hturn=h0, neck=5)
    b = P(STANDX, hturn=h1 + 0.04, neck=1, torso=2.5)
    b2 = P(STANDX, hturn=h1, neck=2)
    return secondary(build([(0, a, 'lin'), (5, b, 'out'), (7, b2, 'inout')], 8))

def seq_chest(c, h=0.95):
    """hand moves to the chest: 'آمنا بك وصدقناك'."""
    a = P(STANDX, hturn=h, neck=2)
    m = P({**STANDX, 'near_arm': (45, 0.66, -1)}, hturn=h, neck=4, torso=3, near_hand='relax', near_hand_rot=-40)
    b = P({**STANDX, 'near_arm': (42, 0.40, -1)}, hturn=h, neck=8, torso=4, near_hand='flat', near_hand_rot=-84)
    b2 = P({**STANDX, 'near_arm': (41, 0.40, -1)}, hturn=h, neck=6, torso=3.5, near_hand='flat', near_hand_rot=-84)
    return secondary(build([(0, a, 'lin'), (4, m, 'in'), (8, b, 'out'), (10, b2, 'inout')], 11))

def seq_chest_to_open(c, h=0.95):
    """from the chest the arm opens outward toward the way ahead; strong, not exaggerated."""
    a = P({**STANDX, 'near_arm': (41, 0.40, -1)}, hturn=h, neck=6, torso=3.5, near_hand='flat', near_hand_rot=-84)
    ant = P({**STANDX, 'near_arm': (36, 0.36, -1)}, hturn=h, neck=8, torso=2, near_hand='flat', near_hand_rot=-80)
    m = P({**STANDX, 'near_arm': (70, 0.70, -1)}, hturn=h, neck=2, torso=4, near_hand='relax', near_hand_rot=-30)
    b = P({**STANDX, 'near_arm': (84, 0.96, -1)}, hturn=1.0, neck=-3, torso=4.5, near_hand='open', near_hand_rot=-18)
    b2 = P({**STANDX, 'near_arm': (81, 0.95, -1)}, hturn=1.0, neck=-1, torso=4, near_hand='open', near_hand_rot=-20)
    return secondary(build([(0, a, 'lin'), (2, ant, 'inout'), (6, m, 'in'), (9, b, 'out'), (12, b2, 'inout')], 13))

def seq_step(c, h=1.0):
    """one deliberate step forward with the arm extended, then a firm still stance."""
    arm = (81, 0.95, -1)
    base = dict(STANDX, near_arm=arm)
    a = P(base, hturn=h, neck=-1, torso=4, near_hand='open', near_hand_rot=-20)
    lift = P({**base, 'hip': (0.10, 0.50), 'near_ankle': (0.17, 0.085), 'near_foot': -18}, hturn=h, neck=-1, torso=6,
             near_hand='open', near_hand_rot=-20)
    plant = P({**base, 'hip': (0.16, 0.495), 'near_ankle': (0.27, 0.028), 'near_foot': 0}, hturn=h, neck=-2, torso=7,
              near_hand='open', near_hand_rot=-20)
    settle = P({**base, 'hip': (0.17, 0.505), 'near_ankle': (0.27, 0.028), 'far_ankle': (0.05, 0.028)}, hturn=h, neck=-2, torso=3,
               near_hand='open', near_hand_rot=-18, near_arm=(84, 0.97, -1))
    hold = P({**base, 'hip': (0.168, 0.506), 'near_ankle': (0.27, 0.028), 'far_ankle': (0.05, 0.028)}, hturn=h, neck=-1, torso=3.5,
             near_hand='open', near_hand_rot=-19, near_arm=(83, 0.97, -1))
    return secondary(build([(0, a, 'lin'), (3, lift, 'in'), (6, plant, 'out'), (9, settle, 'inout'), (12, hold, 'inout')], 13), gain=12)

def seq_step_lower(c, h=1.0):
    base = dict(STANDX, hip=(0.168, 0.506), near_ankle=(0.27, 0.028), far_ankle=(0.05, 0.028))
    a = P({**base, 'near_arm': (83, 0.97, -1)}, hturn=h, neck=-1, torso=3.5, near_hand='open', near_hand_rot=-19)
    m = P({**base, 'near_arm': (45, 0.9, -1)}, hturn=h, neck=4, torso=3, near_hand='relax', near_hand_rot=-10)
    b = P({**base, 'near_arm': (10, 0.97, -1)}, hturn=h * 0.9, neck=8, torso=4, near_hand='relax')
    return secondary(build([(0, a, 'lin'), (5, m, 'in'), (10, b, 'out')], 11))

def seq_hold_rope(c):
    """final scene: standing beside his horse holding the lead rope, quiet breathing."""
    base = dict(STANDX, near_arm=(30, 0.80, -1))
    a = P(base, hturn=0.95, neck=6, near_hand='grip', near_hand_rot=-30)
    b = P(base, hturn=0.95, neck=4.5, torso=2.6, near_hand='grip', near_hand_rot=-30)
    return build([(0, a, 'lin'), (4, b, 'inout'), (8, a, 'inout')], 8)

def seq_strap(c):
    """companion securing the saddle strap: both hands at girth height, a firm pull, release."""
    base = dict(STANDX, torso=16, neck=10, hip=(0.03, 0.49), near_ankle=(0.12, 0.028), far_ankle=(-0.04, 0.028))
    a = P({**base, 'near_arm': (62, 0.80, -1), 'far_arm': (58, 0.78, -1)}, hturn=1.0, near_hand='grip', far_hand='grip', near_hand_rot=-40, far_hand_rot=-40)
    b = P({**base, 'near_arm': (50, 0.66, -1), 'far_arm': (48, 0.64, -1), 'torso': 11, 'hip': (0.0, 0.49)}, hturn=1.0,
          near_hand='grip', far_hand='grip', near_hand_rot=-30, far_hand_rot=-30)
    return secondary(build([(0, a, 'lin'), (3, b, 'in'), (5, b, 'lin'), (8, a, 'inout')], 9))

PLAN = {
    'miqdad': dict(H=1300, seqs=['kneel_idle', 'kneel_turn', 'stand_up', 'stand_idle', 'turn', 'chest', 'chest_to_open', 'step', 'step_lower', 'hold_rope']),
    'abubakr': dict(H=950, seqs=['kneel_idle', 'kneel_turn', 'stand_up', 'speak', 'lower', 'stand_idle', 'kneel_nod']),
    'umar': dict(H=950, seqs=['kneel_idle', 'kneel_turn', 'stand_up', 'speak', 'lower', 'stand_idle', 'kneel_nod']),
    'ibnmasud': dict(H=1000, seqs=['kneel_idle', 'kneel_turn', 'kneel_chest', 'kneel_nod']),
    'muh1': dict(H=700, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod', 'strap']),
    'muh2': dict(H=700, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod']),
    'muh3': dict(H=700, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod']),
    'ans1': dict(H=760, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod', 'kneel_chest']),
    'ans2': dict(H=760, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod']),
    'ans3': dict(H=760, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod']),
    'ans4': dict(H=760, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod']),
    'ans5': dict(H=760, seqs=['kneel_idle', 'kneel_turn', 'kneel_nod']),
}

def render_all(only=None):
    manifest = {}
    for name, plan in PLAN.items():
        if only and name not in only:
            continue
        cos = COSTUMES[name]
        H = plan['H']
        size = (int(H * 1.25), int(H * 1.30))
        origin = (size[0] * 0.40, size[1] - H * 0.05)
        manifest[name] = dict(H=H, seqs={})
        for sname in plan['seqs']:
            poses = globals()['seq_' + sname](cos)
            d = f'{OUT}/{name}/{sname}'
            os.makedirs(d, exist_ok=True)
            frames = []
            for i, p in enumerate(poses):
                arr, J, (ox, oy) = draw_character(cos, p, H=H, size=size, origin=origin, seed=i % 3)
                im = Image.fromarray(arr)
                bb = im.getbbox()
                im = im.crop(bb)
                fn = f'{d}/{i:03d}.webp'
                im.save(fn, 'WEBP', quality=84, method=6)
                frames.append(dict(f=os.path.relpath(fn, OUT), x=bb[0] - ox, y=bb[1] - oy, w=im.width, h=im.height))
            manifest[name]['seqs'][sname] = frames
            print(name, sname, len(frames), flush=True)
    tag = '_'.join(sorted(manifest.keys()))
    json.dump(manifest, open(OUT + f'/manifest_part_{tag}.json', 'w'), indent=0)
    merged = {}
    import glob
    for fn in sorted(glob.glob(OUT + '/manifest_part_*.json')):
        merged.update(json.load(open(fn)))
    json.dump(merged, open(OUT + '/manifest.json', 'w'), indent=0)

if __name__ == '__main__':
    render_all(sys.argv[1:] or None)
