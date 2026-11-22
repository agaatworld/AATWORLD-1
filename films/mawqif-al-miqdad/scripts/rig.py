"""Painterly historical stickman renderer (skia).

Every drawing is produced as a raster frame with real alpha. Heads are
featureless by construction: the head is a plain shaded ellipse, the ONLY
facial element is the beard shape. There is no code path that draws eyes,
brows, nose, mouth or ears.

Units: H = standing height (1.0). Character faces +x (right). Ground y = 0,
up is +y in pose space; converted to skia (y down) when drawing.
"""
import math, copy
import numpy as np
import skia

INK = 0xFF2A1C13

def hexc(s, a=255):
    s = s.lstrip('#')
    return skia.Color(int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), a)

def mix(c1, c2, t):
    a = [int(c1[i:i+2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i+2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{int(round(a[i] + (b[i]-a[i])*t)):02x}' for i in range(3))

# ---------------------------------------------------------------- lengths
L = dict(torso=0.295, neck=0.03, up=0.165, fore=0.15, hand=0.06, thigh=0.245, shin=0.235,
         ankle=0.028, foot=0.068, head_rx=0.052, head_ry=0.064)

# ---------------------------------------------------------------- pose helpers
BASE_POSE = dict(
    hip=(0.0, 0.508), torso=2.0, neck=4.0, hturn=0.55,
    near_arm=(8.0, 0.97, -1), far_arm=(-4.0, 0.97, -1),   # (angle deg from down, reach, elbow side)
    near_hand='relax', far_hand='relax', near_hand_rot=0.0, far_hand_rot=0.0,
    near_ankle=(0.035, 0.028), far_ankle=(-0.035, 0.028),
    near_foot=0.0, far_foot=0.0, robe_cover=0.80, sway=0.0, tail_sway=0.0, cloak_open=1.0,
)

def lerp(a, b, t):
    if isinstance(a, tuple):
        return tuple(lerp(x, y, t) if not isinstance(x, int) or not isinstance(y, int) else (x if t < 0.5 else y) for x, y in zip(a, b))
    if isinstance(a, str):
        return a if t < 0.5 else b
    return a + (b - a) * t

def lerp_pose(p, q, t):
    out = {}
    for k in p:
        out[k] = lerp(p[k], q[k], t)
    return out

def ease(t, kind='inout'):
    t = max(0.0, min(1.0, t))
    if kind == 'lin':
        return t
    if kind == 'in':
        return t * t
    if kind == 'out':
        return 1 - (1 - t) ** 2
    if kind == 'in3':
        return t ** 3
    if kind == 'out3':
        return 1 - (1 - t) ** 3
    return t * t * (3 - 2 * t)  # smoothstep in/out

def pose(**kw):
    p = copy.deepcopy(BASE_POSE)
    p.update(kw)
    return p

def ik2(root, target, l1, l2, bend):
    """2-bone IK in pose space. bend=+1 puts the joint toward +x side of the root->target line."""
    rx, ry = root; tx, ty = target
    dx, dy = tx - rx, ty - ry
    d = math.hypot(dx, dy)
    d = max(1e-6, min(d, l1 + l2 - 1e-6))
    a = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
    a = max(-1.0, min(1.0, a))
    ang = math.atan2(dy, dx)
    off = math.acos(a)
    j = ang + off * bend
    jx, jy = rx + l1 * math.cos(j), ry + l1 * math.sin(j)
    # clamp target to reachable
    ex = jx + l2 * math.cos(math.atan2(ty - jy, tx - jx))
    ey = jy + l2 * math.sin(math.atan2(ty - jy, tx - jx))
    return (jx, jy), (ex, ey)

def solve(p, cos):
    """Return joint positions (pose space) for pose p and costume cos."""
    s = cos['scale']
    hx, hy = p['hip'][0] * s, p['hip'][1] * s
    ta = math.radians(p['torso'])
    tlen = L['torso'] * s
    nb = (hx + tlen * math.sin(ta), hy + tlen * math.cos(ta))            # neck base
    sh = (hx + tlen * 0.90 * math.sin(ta), hy + tlen * 0.90 * math.cos(ta))  # shoulder
    na = math.radians(p['torso'] + p['neck'])
    nt = (nb[0] + L['neck'] * s * math.sin(na), nb[1] + L['neck'] * s * math.cos(na))
    ry = L['head_ry'] * s * cos.get('head', 1.0)
    hc = (nt[0] + ry * 0.92 * math.sin(na), nt[1] + ry * 0.92 * math.cos(na))
    J = dict(hip=(hx, hy), nb=nb, sh=sh, nt=nt, hc=hc, head_ang=p['torso'] + p['neck'])
    for side in ('near', 'far'):
        ang, reach, ebend = p[side + '_arm']
        a = math.radians(ang)
        full = (L['up'] + L['fore']) * s
        r = full * reach
        shp = (sh[0] + (-0.012 * s if side == 'far' else 0.0), sh[1])
        w = (shp[0] + r * math.sin(a), shp[1] - r * math.cos(a))
        e, w2 = ik2(shp, w, L['up'] * s, L['fore'] * s, ebend)
        J[side + '_sh'] = shp; J[side + '_el'] = e; J[side + '_wr'] = w2
        ax, ay = p[side + '_ankle'][0] * s, p[side + '_ankle'][1] * s
        hipj = (hx + (-0.01 * s if side == 'far' else 0.01 * s), hy)
        k, an = ik2(hipj, (ax, ay), L['thigh'] * s, L['shin'] * s, -1 if (ax - hx) * 0 == 0 else 1)
        # knee should point forward (+x): choose bend so knee x >= line
        k1, an1 = ik2(hipj, (ax, ay), L['thigh'] * s, L['shin'] * s, 1)
        k2, an2 = ik2(hipj, (ax, ay), L['thigh'] * s, L['shin'] * s, -1)
        k, an = (k1, an1) if k1[0] >= k2[0] else (k2, an2)
        J[side + '_hipj'] = hipj; J[side + '_kn'] = k; J[side + '_an'] = an
    return J

# ---------------------------------------------------------------- drawing utils
class Painter:
    def __init__(self, canvas, H, ox, oy):
        self.c = canvas; self.H = H; self.ox = ox; self.oy = oy
    def P(self, pt):
        return (self.ox + pt[0] * self.H, self.oy - pt[1] * self.H)

def catmull_closed(pts, tension=0.5):
    path = skia.Path()
    n = len(pts)
    if n < 3:
        return path
    path.moveTo(*pts[0])
    for i in range(n):
        p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3)
        path.cubicTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    path.close()
    return path

def catmull_open(pts, tension=0.5):
    path = skia.Path()
    path.moveTo(*pts[0])
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3)
        path.cubicTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    return path

def hull(points):
    pts = sorted(set((round(x, 3), round(y, 3)) for x, y in points))
    if len(pts) <= 2:
        return pts
    def cross(o, a, b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

def tube(pts, widths):
    """Closed outline around a polyline with per-point half widths (screen coords)."""
    left, right = [], []
    n = len(pts)
    for i in range(n):
        if i == 0:
            dx, dy = pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]
        elif i == n - 1:
            dx, dy = pts[-1][0] - pts[-2][0], pts[-1][1] - pts[-2][1]
        else:
            dx, dy = pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]
        d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d
        left.append((pts[i][0] + nx * widths[i], pts[i][1] + ny * widths[i]))
        right.append((pts[i][0] - nx * widths[i], pts[i][1] - ny * widths[i]))
    return left + right[::-1]

def resample(pts, step):
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        d = math.hypot(b[0] - a[0], b[1] - a[1])
        n = max(1, int(d / step))
        for i in range(1, n + 1):
            out.append((a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n))
    return out

_noise_cache = {}
def _grain_image(seed):
    import numpy as _np
    r = _np.random.default_rng(seed)
    N = 512
    acc = _np.zeros((N, N), _np.float32)
    for k, cell in enumerate((128, 64, 32, 16)):
        g = r.standard_normal((N // cell + 1, N // cell + 1)).astype(_np.float32)
        g[-1, :] = g[0, :]; g[:, -1] = g[:, 0]
        from PIL import Image as _I
        up = _np.asarray(_I.fromarray(g).resize((N + cell, N + cell), _I.BICUBIC))[:N, :N]
        acc += up * (0.5 ** k)
    acc = (acc - acc.min()) / (acc.max() - acc.min())
    v = (acc * 255).astype(_np.uint8)
    rgba = _np.dstack([v, v, v, _np.full_like(v, 255)])
    return skia.Image.fromarray(rgba, colorType=skia.ColorType.kRGBA_8888_ColorType)

def grain_paint(seed, H, alpha=40, mode=skia.BlendMode.kMultiply, freq=1.6):
    key = (seed, alpha, mode, freq)
    if key not in _noise_cache:
        img = _grain_image(seed)
        sc = 1.6 / freq
        sh = img.makeShader(skia.TileMode.kRepeat, skia.TileMode.kRepeat, skia.SamplingOptions(skia.FilterMode.kLinear),
                            skia.Matrix.Scale(sc, sc))
        p = skia.Paint(Shader=sh, AntiAlias=True, BlendMode=mode)
        p.setAlphaf(alpha / 255)
        _noise_cache[key] = p
    return _noise_cache[key]

def fill_shape(c, path, color, shade=None, shade_dir=(0, 1), seed=1, H=1000, outline=True, lw=None,
               grain=True, light=None):
    """Painted fill: base colour + soft gradient shading + paper grain + ink outline."""
    b = path.computeTightBounds()
    p = skia.Paint(AntiAlias=True, Color=hexc(color))
    c.drawPath(path, p)
    if shade:
        cx, cy = b.centerX(), b.centerY()
        hw, hh = b.width() / 2 + 1, b.height() / 2 + 1
        x0, y0 = cx - shade_dir[0] * hw, cy - shade_dir[1] * hh
        x1, y1 = cx + shade_dir[0] * hw, cy + shade_dir[1] * hh
        g = skia.GradientShader.MakeLinear([(x0, y0), (x1, y1)], [hexc(shade, 0), hexc(shade, 150)])
        c.save(); c.clipPath(path, doAntiAlias=True)
        c.drawPaint(skia.Paint(Shader=g, AntiAlias=True))
        c.restore()
    if light:
        cx, cy = b.centerX(), b.centerY()
        g = skia.GradientShader.MakeRadial((b.left() + b.width() * light[0], b.top() + b.height() * light[1]),
                                           max(b.width(), b.height()) * light[2], [hexc(light[3], 110), hexc(light[3], 0)])
        c.save(); c.clipPath(path, doAntiAlias=True)
        c.drawPaint(skia.Paint(Shader=g, AntiAlias=True, BlendMode=skia.BlendMode.kScreen))
        c.restore()
    if grain:
        c.save(); c.clipPath(path, doAntiAlias=True)
        c.drawPaint(grain_paint(seed, H))
        c.drawPaint(grain_paint(seed + 7, H, alpha=26, mode=skia.BlendMode.kScreen, freq=3.1))
        c.restore()
    if outline:
        sp = skia.Paint(AntiAlias=True, Color=INK, Style=skia.Paint.kStroke_Style,
                        StrokeWidth=lw or max(1.5, H * 0.0042), StrokeJoin=skia.Paint.kRound_Join,
                        StrokeCap=skia.Paint.kRound_Cap)
        c.drawPath(path, sp)

def stroke(c, path, color, w, alpha=255, cap=True):
    sp = skia.Paint(AntiAlias=True, Color=hexc(color, alpha), Style=skia.Paint.kStroke_Style, StrokeWidth=w,
                    StrokeJoin=skia.Paint.kRound_Join, StrokeCap=skia.Paint.kRound_Cap if cap else skia.Paint.kButt_Cap)
    c.drawPath(path, sp)

def poly_path(pts):
    path = skia.Path()
    path.moveTo(*pts[0])
    for q in pts[1:]:
        path.lineTo(*q)
    path.close()
    return path

# ---------------------------------------------------------------- body parts
def draw_hand(c, pt, ang, kind, color, H, dark=False, scale=1.0):
    """Simple mitten hand with a separate thumb. ang: direction (radians, screen space) the hand points."""
    s = H * scale
    c.save()
    c.translate(*pt)
    c.rotate(math.degrees(ang))
    if kind == 'flat':      # lying flat (on chest): long thin mitten
        palm = skia.Path(); palm.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-0.004*s, -0.017*s, 0.058*s, 0.015*s), 0.016*s, 0.015*s))
        thumb = catmull_open([(0.006*s, -0.012*s), (0.02*s, -0.03*s), (0.034*s, -0.03*s)], 0.5)
    elif kind == 'open':    # open palm facing out, fingers together, thumb apart
        palm = skia.Path(); palm.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-0.004*s, -0.019*s, 0.056*s, 0.017*s), 0.018*s, 0.016*s))
        thumb = catmull_open([(0.008*s, -0.015*s), (0.022*s, -0.036*s), (0.036*s, -0.042*s)], 0.5)
    elif kind == 'fist':
        palm = skia.Path(); palm.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-0.004*s, -0.02*s, 0.036*s, 0.02*s), 0.017*s, 0.017*s))
        thumb = catmull_open([(0.01*s, -0.016*s), (0.026*s, -0.02*s)], 0.5)
    elif kind == 'grip':    # holding a rope / strap
        palm = skia.Path(); palm.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-0.004*s, -0.019*s, 0.04*s, 0.019*s), 0.017*s, 0.017*s))
        thumb = catmull_open([(0.012*s, -0.017*s), (0.03*s, -0.024*s)], 0.5)
    else:                   # relax: soft curled mitten
        palm = skia.Path(); palm.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-0.004*s, -0.016*s, 0.05*s, 0.016*s), 0.017*s, 0.016*s))
        thumb = catmull_open([(0.006*s, -0.013*s), (0.018*s, -0.027*s), (0.03*s, -0.026*s)], 0.5)
    col = mix(color, '#000000', 0.25) if dark else color
    fill_shape(c, palm, col, shade=mix(col, '#2a1a10', 0.5), shade_dir=(0, 1), seed=31, H=H, lw=max(1.2, H*0.0036))
    stroke(c, thumb, '#2a1c13', max(4, H * 0.0125))
    stroke(c, thumb, col, max(2, H * 0.0125 - H * 0.0072))
    if kind in ('open', 'flat', 'relax'):
        # two faint finger-division lines keep the hand readable at large sizes
        for yy in (-0.005, 0.006):
            stroke(c, catmull_open([(0.03*s, yy*s), (0.052*s, yy*s)], 0.5), mix(col, '#2a1c13', 0.55), max(1, H*0.0022))
    c.restore()

def draw_foot(c, pt, ang, H, color='#3b2618', dark=False):
    s = H
    c.save(); c.translate(*pt); c.rotate(math.degrees(ang))
    path = skia.Path(); path.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-0.016*s, -0.010*s, 0.062*s, 0.008*s), 0.01*s, 0.008*s))
    col = mix(color, '#000000', 0.3) if dark else color
    fill_shape(c, path, col, H=H, lw=max(1.2, H*0.0034), grain=False)
    # sandal strap
    stroke(c, catmull_open([(0.004*s, -0.012*s), (0.018*s, 0.006*s)], 0.5), mix(col, '#c9a77a', 0.35), max(1, H*0.003))
    c.restore()

def limb_stick(c, a, b, H, color, w=0.0115, dark=False):
    col = mix(color, '#000000', 0.25) if dark else color
    path = catmull_open([a, b], 0.5)
    stroke(c, path, '#2a1c13', H * (w + 0.0075))
    stroke(c, path, col, H * w)

# ---------------------------------------------------------------- main draw
def draw_character(cos, p, H=1000, size=None, origin=None, seed=0):
    """Render one drawing; returns RGBA numpy array."""
    W, Hc = size or (int(H * 0.95), int(H * 1.22))
    ox, oy = origin or (W * 0.5, Hc - H * 0.06)
    surf = skia.Surface(W, Hc)
    c = surf.getCanvas()
    c.clear(skia.Color(0, 0, 0, 0))
    D = Painter(c, H, ox, oy)
    J = solve(p, cos)
    s = cos['scale']
    sp = lambda q: D.P(q)

    torso_ang = math.radians(p['torso'])
    perp = (math.cos(torso_ang), -math.sin(torso_ang))     # pose-space vector pointing to the front of the torso
    up = (math.sin(torso_ang), math.cos(torso_ang))
    wsh = 0.064 * s * cos.get('build', 1.0)

    def ofs(pt, v, d):
        return (pt[0] + v[0] * d, pt[1] + v[1] * d)

    # ---------------- far arm (behind)
    def arm(side, dark):
        shp, el, wr = sp(J[side + '_sh']), sp(J[side + '_el']), sp(J[side + '_wr'])
        sleeve_col = cos['sleeve']
        # exposed forearm end + hand
        cut = 0.78 if p.get(side + '_hand') != 'flat' else 0.82
        sw = (el[0] + (wr[0] - el[0]) * cut, el[1] + (wr[1] - el[1]) * cut)
        limb_stick(c, sw, wr, H, cos['skin'], dark=dark)
        hand_ang = math.atan2(wr[1] - el[1], wr[0] - el[0]) + math.radians(p.get(side + '_hand_rot', 0.0))
        draw_hand(c, wr, hand_ang, p.get(side + '_hand', 'relax'), cos['skin'], H * s, dark=dark)
        pts = resample([shp, el, sw], H * 0.02)
        n = len(pts)
        ws = []
        for i in range(n):
            t = i / (n - 1)
            ws.append(H * s * (0.033 - 0.012 * t + (0.004 if t > 0.92 else 0)))
        outline = tube(pts, ws)
        col = mix(sleeve_col, '#000000', 0.28) if dark else sleeve_col
        path = catmull_closed(outline[::max(1, len(outline)//28)] if len(outline) > 40 else outline, 0.35)
        cap = skia.Path(); r0 = ws[0] * 1.02
        cap.addCircle(shp[0], shp[1], r0)
        path = skia.Op(path, cap, skia.PathOp.kUnion_PathOp) or path
        fill_shape(c, path, col, shade=mix(col, '#1d120b', 0.55), shade_dir=(0.3, 1), seed=11 + (side == 'far'), H=H)
        # cuff line
        cdir = math.atan2(sw[1] - el[1], sw[0] - el[0])
        nx, ny = -math.sin(cdir), math.cos(cdir)
        cw = H * s * 0.022
        cuff = catmull_open([(sw[0] - nx * cw - math.cos(cdir) * H*0.012, sw[1] - ny * cw - math.sin(cdir) * H*0.012),
                             (sw[0] - math.cos(cdir) * H * 0.006, sw[1] - math.sin(cdir) * H * 0.006),
                             (sw[0] + nx * cw - math.cos(cdir) * H*0.012, sw[1] + ny * cw - math.sin(cdir) * H*0.012)], 0.5)
        stroke(c, cuff, mix(col, '#20140c', 0.5), max(1, H * 0.0028))
        # elbow fold
        stroke(c, catmull_open([(el[0] - H*0.01, el[1] - H*0.008), (el[0] + H*0.004, el[1] + H*0.004)], 0.5),
               mix(col, '#20140c', 0.45), max(1, H * 0.0026))

    if not p.get('far_front', False):
        arm('far', True)

    # ---------------- legs / feet (visible below the robe)
    def leg(side, dark):
        k, an = J[side + '_kn'], J[side + '_an']
        cover = p['robe_cover']
        # visible shin part from cover point to ankle
        vis_a = (k[0] + (an[0] - k[0]) * cover, k[1] + (an[1] - k[1]) * cover)
        if cover < 0.999:
            limb_stick(c, sp(vis_a), sp(an), H, cos['skin'], w=0.0105, dark=dark)
        fa = math.radians(p[side + '_foot'])
        draw_foot(c, sp(an), -fa, H * s, color=cos.get('sandal', '#3b2618'), dark=dark)
    leg('far', True)

    # ---------------- robe: explicit slim silhouette (izar/thawb to mid-shin)
    hipp = J['hip']
    nb, shp = J['nb'], J['sh']
    bw = s * cos.get('build', 1.0)
    def tor(f):
        return (hipp[0] + (nb[0] - hipp[0]) * f, hipp[1] + (nb[1] - hipp[1]) * f)
    cover = p['robe_cover']
    legs = {}
    for side in ('near', 'far'):
        hj, k, an = J[side + '_hipj'], J[side + '_kn'], J[side + '_an']
        legs[side] = dict(k=k, an=an, hem=(k[0] + (an[0] - k[0]) * cover, k[1] + (an[1] - k[1]) * cover))
    sw = p['sway'] * 0.018 * s
    kf = max(legs.values(), key=lambda d: d['k'][0])
    kb = min(legs.values(), key=lambda d: d['k'][0])
    hf = max(legs.values(), key=lambda d: d['hem'][0])
    hb = min(legs.values(), key=lambda d: d['hem'][0])
    pts = [
        ofs(tor(1.0), perp, 0.026 * bw), ofs(tor(0.93), perp, 0.048 * bw), ofs(tor(0.72), perp, 0.058 * bw),
        ofs(tor(0.42), perp, 0.05 * bw), ofs(tor(0.12), perp, 0.05 * bw),
        (kf['k'][0] + 0.03 * s, kf['k'][1] + 0.012 * s),
        (hf['hem'][0] + 0.058 * s + sw, max(0.006, hf['hem'][1] - 0.008 * s)),
        ((hf['hem'][0] + hb['hem'][0]) / 2 + sw * 0.6, max(0.004, min(hf['hem'][1], hb['hem'][1]) - 0.012 * s)),
        (hb['hem'][0] - 0.05 * s + sw * 0.8, max(0.006, hb['hem'][1] - 0.006 * s)),
        (kb['k'][0] - 0.03 * s, kb['k'][1]) if kb['k'][1] < hipp[1] - 0.05 else ofs(hipp, perp, -0.05 * bw),
        ofs(ofs(hipp, up, 0.02 * s), perp, -0.05 * bw), ofs(tor(0.45), perp, -0.044 * bw), ofs(tor(0.9), perp, -0.046 * bw),
        ofs(tor(1.0), perp, -0.024 * bw),
    ]
    hp0 = hull(pts)
    hp = []
    for i in range(len(hp0)):
        a, b = hp0[i], hp0[(i + 1) % len(hp0)]
        hp.append(a)
        L_ = math.hypot(b[0] - a[0], b[1] - a[1])
        low = a[1] < 0.06 * s and b[1] < 0.06 * s
        if L_ > 0.13 * s and not low:
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            front = mx > hipp[0]
            f = (0.22 if front else 0.08) * min(1.0, (L_ - 0.13 * s) / (0.12 * s) + 0.3)
            hp.append((mx + (hipp[0] - mx) * f, my + (hipp[1] - my) * f * 0.4))
    robe_path = catmull_closed([sp(q) for q in hp], 0.45)
    fill_shape(c, robe_path, cos['robe'], shade=cos['robe_shade'], shade_dir=(-0.55, 0.85), seed=3 + seed, H=H,
               light=(0.78, 0.25, 0.9, cos.get('robe_light', '#fff4dc')))
    c.save(); c.clipPath(robe_path, doAntiAlias=True)
    fold_col = mix(cos['robe'], cos['robe_shade'], 0.75)
    for side in ('near', 'far'):
        k, hem = legs[side]['k'], legs[side]['hem']
        for off in (-0.016, 0.014):
            a = ofs(ofs(hipp, up, 0.05 * s), perp, off * 1.5 * s)
            m = (k[0] + off * s, k[1] + 0.01 * s)
            b = (hem[0] + off * 1.8 * s + sw * 0.7, hem[1] + 0.004 * s)
            stroke(c, catmull_open([sp(a), sp(m), sp(b)], 0.5), fold_col, max(1, H * 0.003), alpha=190)
    cq = tor(0.7)
    stroke(c, catmull_open([sp(ofs(cq, perp, 0.034 * bw)), sp(ofs(ofs(cq, up, -0.08 * s), perp, 0.042 * bw))], 0.5), fold_col, max(1, H * 0.003), alpha=160)
    c.restore()

    leg('near', False)

    # ---------------- cloak: hangs from the shoulders over the back, open at the front
    if cos.get('cloak'):
        sway = p['sway']
        cl_len = cos.get('cloak_len', 0.27)
        hem_y = max(0.012, hipp[1] - cl_len * s)
        back_x_at = lambda y: min(q[0] for q in hp if abs(q[1] - y) < 0.12 * s) if any(abs(q[1] - y) < 0.12 * s for q in hp) else hipp[0] - 0.05 * s
        top = ofs(tor(1.0), up, 0.004 * s)
        c_pts = [
            ofs(tor(1.0), perp, -0.03 * bw),                       # nape
            ofs(ofs(shp, up, 0.03 * s), perp, 0.012 * bw),          # top of shoulder
            ofs(ofs(shp, up, 0.014 * s), perp, 0.036 * bw),         # front of shoulder
            ofs(ofs(shp, up, -0.035 * s), perp, 0.014 * bw),
        ]
        fx = c_pts[-1][0]
        front_bottom = (fx + 0.004 * s + sway * 0.03 * s - 0.01 * s * (1 - p.get('cloak_open', 1.0)), hem_y)
        mid_front = ((c_pts[-1][0] + front_bottom[0]) / 2 + 0.006 * s, (c_pts[-1][1] + front_bottom[1]) / 2)
        bx = back_x_at(hem_y + 0.02 * s)
        back_bottom = (bx - 0.035 * s - sway * 0.02 * s, hem_y + 0.006 * s)
        hem_mid = ((front_bottom[0] + back_bottom[0]) / 2 + sway * 0.012 * s, hem_y - 0.012 * s)
        back_mid = ofs(ofs(hipp, up, 0.1 * s), perp, -0.06 * bw)
        back_up = ofs(tor(0.75), perp, -0.058 * bw)
        cl = [c_pts[0], c_pts[1], c_pts[2], c_pts[3], mid_front, front_bottom, hem_mid, back_bottom, back_mid, back_up]
        cloak_path = catmull_closed([sp(q) for q in cl], 0.42)
        fill_shape(c, cloak_path, cos['cloak'], shade=cos.get('cloak_shade', mix(cos['cloak'], '#000000', 0.5)),
                   shade_dir=(-0.6, 0.8), seed=5 + seed, H=H, light=(0.82, 0.18, 0.75, '#ffe9c8'))
        c.save(); c.clipPath(cloak_path, doAntiAlias=True)
        lin = catmull_open([sp(c_pts[2]), sp(c_pts[3]), sp(mid_front), sp(front_bottom)], 0.5)
        stroke(c, lin, cos.get('cloak_lining', mix(cos['cloak'], '#e8d6b0', 0.45)), H * 0.011 * s)
        fc = mix(cos['cloak'], '#120a05', 0.55)
        for k_ in range(3):
            t = 0.2 + k_ * 0.27
            a = (c_pts[1][0] + (back_up[0] - c_pts[1][0]) * t, c_pts[1][1] - 0.05 * s)
            b = (front_bottom[0] + (back_bottom[0] - front_bottom[0]) * (0.2 + t * 0.8), hem_y + 0.004 * s)
            m = ((a[0] + b[0]) / 2 - 0.006 * s, (a[1] + b[1]) / 2)
            stroke(c, catmull_open([sp(a), sp(m), sp(b)], 0.5), fc, max(1, H * 0.0032), alpha=180)
        c.restore()
        c.drawPath(cloak_path, skia.Paint(AntiAlias=True, Color=INK, Style=skia.Paint.kStroke_Style,
                                          StrokeWidth=max(1.5, H * 0.0042), StrokeJoin=skia.Paint.kRound_Join))

    # ---------------- sash / belt
    if cos.get('sash'):
        a = ofs(ofs(hipp, up, 0.035 * s), perp, 0.07 * s)
        b = ofs(ofs(hipp, up, 0.045 * s), perp, -0.06 * s)
        path = catmull_open([sp(a), sp(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.006 * s)), sp(b)], 0.5)
        stroke(c, path, '#2a1c13', H * 0.022)
        stroke(c, path, cos['sash'], H * 0.015)

    # ---------------- near arm (drawn before the head so the beard always reads over the shoulder)
    arm('near', False)

    # ---------------- head
    ha = math.radians(J['head_ang'])
    hc = sp(J['hc'])
    rx = L['head_rx'] * s * cos.get('head', 1.0) * H
    ry = L['head_ry'] * s * cos.get('head', 1.0) * H
    ht = p['hturn']
    tail_dir = -1 if ht >= 0 else 1
    # neck stick
    limb_stick(c, sp(J['nb']), sp(J['nt']), H, cos['skin'], w=0.016)
    c.save()
    c.translate(*hc)
    c.rotate(math.degrees(ha) * 0.9)
    # turban tail (behind head)
    if cos.get('turban_style') in ('tail', 'tail_long') and abs(ht) > 0.12:
        tl = H * s * (0.13 if cos['turban_style'] == 'tail' else 0.19)
        tsw = p['tail_sway']
        x0 = tail_dir * rx * 0.55 * min(1, abs(ht) * 1.6)
        tpts_ = resample([(x0, -ry * 0.25), (x0 + tail_dir * rx * 0.35 + tsw * H * 0.01, ry * 0.4),
                          (x0 + tail_dir * rx * 0.55 + tsw * H * 0.025, -ry * 0.25 + tl)], H * 0.015)
        tail = tube(tpts_, [H * s * w for w in np.linspace(0.02, 0.014, len(tpts_))])
        tp = catmull_closed(tail[::2] if len(tail) > 30 else tail, 0.4)
        fill_shape(c, tp, mix(cos['turban'], '#000000', 0.18), shade=cos.get('turban_shade', mix(cos['turban'], '#000000', 0.4)),
                   seed=17, H=H)
    if cos.get('turban_style') == 'cloth':
        # head cloth falling to the shoulders (drawn behind head)
        cl = [(-rx * 1.18 * (1 if ht >= 0 else -1) * 0 - rx * 1.1, -ry * 0.55), (-rx * 1.25, ry * 0.6), (-rx * 1.05, ry * 1.55),
              (rx * 0.2 * (1 - abs(ht)), ry * 1.45), (rx * 0.95, ry * 1.25), (rx * 1.12, ry * 0.2), (rx * 0.9, -ry * 0.75), (0, -ry * 1.12), (-rx * 0.95, -ry * 0.85)]
        if ht < 0:
            cl = [(-x, y) for x, y in cl]
        cpath = catmull_closed(cl, 0.45)
        fill_shape(c, cpath, mix(cos['turban'], '#000000', 0.12), shade=cos.get('turban_shade', mix(cos['turban'], '#000000', 0.4)),
                   shade_dir=(0, 1), seed=19, H=H)
    # head
    head = skia.Path(); head.addOval(skia.Rect.MakeLTRB(-rx, -ry, rx, ry))
    fill_shape(c, head, cos['skin'], shade=mix(cos['skin'], '#2b170d', 0.55), shade_dir=(-0.5 * (1 if ht >= 0 else -1), 0.75),
               seed=23, H=H, light=(0.72 if ht >= 0 else 0.28, 0.3, 0.55, '#fff0d8'))
    # beard: the ONLY facial element
    h = max(-1.0, min(1.0, ht))
    th1 = math.radians(150 - 45 * h)
    th2 = math.radians(30 - 15 * h)
    bl = cos['beard_len'] * H * s
    tipx = 0.72 * rx * h
    pts_b = []
    for t in np.linspace(0, 1, 9):
        th = th1 + (th2 - th1) * t
        pts_b.append((rx * 1.02 * math.cos(th), ry * 1.02 * math.sin(th)))
    shape = cos.get('beard_shape', 'round')
    chin = pts_b[-1]
    if shape == 'pointed':
        tip = [(tipx + rx * 0.10 * (1 if h >= 0 else -1), ry * 0.80 + bl * 0.55), (tipx, ry * 0.86 + bl)]
    elif shape == 'short':
        tip = [(tipx + rx * 0.12 * h, ry * 0.94 + bl * 0.6), (tipx - rx * 0.1 * h, ry * 0.96 + bl * 0.75)]
    else:
        tip = [(tipx + rx * 0.22 * h + rx * 0.08, ry * 0.84 + bl * 0.6), (tipx, ry * 0.9 + bl), (tipx - rx * 0.3, ry * 0.86 + bl * 0.75)]
    back = [(pts_b[0][0] * 0.92, pts_b[0][1] + bl * 0.25)]
    bpts = pts_b + tip + back
    bpath = catmull_closed(bpts, 0.35)
    bcol = cos['beard']
    fill_shape(c, bpath, bcol, shade=mix(bcol, '#000000', 0.55), shade_dir=(0, 1), seed=29, H=H,
               light=(0.6, 0.15, 0.6, cos.get('beard_light', '#a88a6a')))
    c.save(); c.clipPath(bpath, doAntiAlias=True)
    for k_ in range(6):
        t = (k_ + 0.5) / 6
        x = pts_b[0][0] + (pts_b[-1][0] - pts_b[0][0]) * t
        stroke(c, catmull_open([(x, ry * 0.55), (x + (tipx - x) * 0.35, ry * 0.85 + bl * 0.5), (x + (tipx - x) * 0.55, ry * 0.9 + bl * 0.85)], 0.5),
               mix(bcol, '#e6d2b4', 0.3), max(1, H * 0.0022), alpha=120)
    c.restore()
    # turban wrap on top of head
    if cos.get('turban_style') != 'cloth':
        th_ = cos.get('turban_h', 1.0)
        fdir = 1 if ht >= 0 else -1
        fh = abs(h)
        # bottom edge: front lower on forehead, back slightly lower
        bf = (rx * 1.08 * fdir, -ry * (0.08 + 0.12 * (1 - fh)))
        bb = (-rx * 1.1 * fdir, -ry * (0.0 + 0.06 * (1 - fh)))
        top = [(-rx * 1.12 * fdir, -ry * 0.55), (-rx * 0.85 * fdir, -ry * (1.05 + 0.18 * th_)), (0, -ry * (1.17 + 0.22 * th_)),
               (rx * 0.85 * fdir, -ry * (1.08 + 0.18 * th_)), (rx * 1.14 * fdir, -ry * 0.55)]
        tpts = [bb] + top + [bf, (0, -ry * (0.02 + 0.1 * (1 - fh)) + ry * 0.02)]
        if fdir < 0:
            pass
        tpath = catmull_closed(tpts, 0.42)
        fill_shape(c, tpath, cos['turban'], shade=cos.get('turban_shade', mix(cos['turban'], '#000000', 0.4)), shade_dir=(-0.4 * fdir, 0.9),
                   seed=37, H=H, light=(0.65 if fdir > 0 else 0.35, 0.2, 0.7, '#fffaf0'))
        c.save(); c.clipPath(tpath, doAntiAlias=True)
        wc = mix(cos['turban'], cos.get('turban_shade', '#000000'), 0.7)
        for k_, yy in enumerate((-0.25, -0.52, -0.80)):
            dy = yy * ry * (1 + 0.2 * th_)
            stroke(c, catmull_open([(-rx * 1.3 * fdir, dy + ry * 0.18), (-rx * 0.2 * fdir, dy - ry * 0.08 + k_ * ry * 0.02),
                                    (rx * 1.3 * fdir, dy - ry * 0.22)], 0.5), wc, max(1, H * 0.0034), alpha=210)
        c.restore()
        # cap (taqiyah) tip showing on some turbans
        if cos.get('cap'):
            cp = skia.Path(); cp.addOval(skia.Rect.MakeLTRB(-rx * 0.45, -ry * (1.32 + 0.22 * th_), rx * 0.45, -ry * (1.05 + 0.2 * th_)))
            c.save(); c.clipPath(tpath, skia.ClipOp.kDifference, doAntiAlias=True)
            fill_shape(c, cp, cos['cap'], H=H, lw=max(1.2, H * 0.0036))
            c.restore()
    c.restore()

    if p.get('far_front', False):
        arm('far', True)

    img = surf.makeImageSnapshot()
    arr = img.toarray(colorType=skia.ColorType.kRGBA_8888_ColorType, alphaType=skia.AlphaType.kUnpremul_AlphaType)
    return arr, J, (ox, oy)
