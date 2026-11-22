"""Painted cel Arabian horse, side profile facing right, drawn per frame from a rig.
Units: H ~ height at withers. Origin = ground under the barrel centre (pose y up)."""
import math
import numpy as np
import skia
from rig import hexc, mix, fill_shape, stroke, catmull_closed, catmull_open, tube, resample, INK

COATS = {
    'bay': dict(coat='#5e3824', shade='#22120a', light='#b07a55', mane='#17110d', hoof='#2c2520', blanket='#7c6a4f',
                blanket2='#3d4d63', sock=None, blaze=False, lower='#2a1a12'),
    'chestnut': dict(coat='#8e4c27', shade='#3c1c0b', light='#d89766', mane='#6a361a', hoof='#3a2c24', blanket='#7a3324',
                     blanket2='#c9a96b', sock='#ddd0b6', blaze=True, lower=None),
}

def leg_pts(top, a1, a2, a3, l1, l2, l3):
    k = (top[0] + l1 * math.sin(math.radians(a1)), top[1] - l1 * math.cos(math.radians(a1)))
    f = (k[0] + l2 * math.sin(math.radians(a2)), k[1] - l2 * math.cos(math.radians(a2)))
    h = (f[0] + l3 * math.sin(math.radians(a3)), f[1] - l3 * math.cos(math.radians(a3)))
    return top, k, f, h

def leg_path(P, H, top, a1, a2, a3, l1, l2, l3, w_top, w_joint, w_low):
    t, k, f, h = leg_pts(top, a1, a2, a3, l1, l2, l3)
    up = (t[0], t[1] + 0.06)
    pts = [P(up), P(t), P(((t[0] + k[0]) / 2, (t[1] + k[1]) / 2)), P(k), P(((k[0] + f[0]) / 2, (k[1] + f[1]) / 2)), P(f), P(h)]
    ws = [w_top * 1.15, w_top, w_top * 0.72, w_joint, w_low, w_joint * 0.9, w_low * 0.95]
    pts2 = resample(pts, H * 0.012)
    seg = [0]
    for a, b in zip(pts, pts[1:]):
        seg.append(seg[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    acc = [0]
    for a, b in zip(pts2, pts2[1:]):
        acc.append(acc[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    wl = [H * float(np.interp(d / acc[-1] * seg[-1], seg, ws)) for d in acc]
    out = tube(pts2, wl)
    return catmull_closed(out[::2] if len(out) > 40 else out, 0.4), (t, k, f, h)

def hoof_path(P, H, h, a3, w):
    hp = P(h)
    hw = w * H * 1.3
    hh = H * 0.05
    pts = [(hp[0] - hw * 0.85, hp[1] - hh * 0.2), (hp[0] + hw * 1.0, hp[1] - hh * 0.2), (hp[0] + hw * 1.55, hp[1] + hh * 0.8),
           (hp[0] - hw * 0.95, hp[1] + hh * 0.8)]
    return catmull_closed(pts, 0.12)

def draw_horse(coat='bay', H=600, size=None, origin=None, head=0.0, nod=0.0, tail=0.0, tail_lift=0.0, shift=0.0,
               legs=None, ear=0.0, breathe=0.0, bob=0.0, tack=True, seed=0, blink=0.0):
    C = COATS[coat]
    W, Hc = size or (int(H * 2.1), int(H * 1.7))
    ox, oy = origin or (W * 0.47, Hc - H * 0.06)
    surf = skia.Surface(W, Hc)
    c = surf.getCanvas(); c.clear(skia.Color(0, 0, 0, 0))
    P = lambda q: (ox + q[0] * H, oy - q[1] * H)
    bx, by = shift * 0.012, bob * 0.014
    B = lambda x, y: (x + bx, y + by)

    # --- head/neck skinning: rotate points around the neck root with a weight ramp
    piv = B(0.36, 0.95)
    def skin(q, w):
        a = math.radians(head * w)
        dx, dy = q[0] - piv[0], q[1] - piv[1]
        r = (piv[0] + dx * math.cos(a) - dy * math.sin(a), piv[1] + dx * math.sin(a) + dy * math.cos(a))
        return r
    def hd(x, y):
        # head local nod around the poll
        poll = B(0.585, 1.40)
        a = math.radians(nod)
        q = B(x, y)
        dx, dy = q[0] - poll[0], q[1] - poll[1]
        q = (poll[0] + dx * math.cos(a) - dy * math.sin(a), poll[1] + dx * math.sin(a) + dy * math.cos(a))
        return skin(q, 1.0)
    def nk(x, y, w):
        return skin(B(x, y), w)

    body = [B(-0.40, 1.00), B(-0.20, 0.98), B(0.02, 0.962), B(0.20, 0.99), B(0.27, 1.03),
            nk(0.37, 1.15, 0.45), nk(0.47, 1.29, 0.8), hd(0.585, 1.405), hd(0.64, 1.385), hd(0.70, 1.30), hd(0.775, 1.19),
            hd(0.815, 1.125), hd(0.80, 1.085), hd(0.745, 1.085), hd(0.70, 1.13), hd(0.665, 1.19), hd(0.625, 1.245),
            nk(0.60, 1.08, 0.55), nk(0.55, 0.92, 0.25), B(0.50, 0.80), B(0.44, 0.69), B(0.36, 0.60),
            B(0.24, 0.565 - breathe * 0.006), B(0.0, 0.535 - breathe * 0.008), B(-0.24, 0.565), B(-0.38, 0.64),
            B(-0.50, 0.73), B(-0.60, 0.86), B(-0.585, 0.95)]
    body_path = catmull_closed([P(q) for q in body], 0.5)

    legs = legs or {}
    rest = max(0.0, -shift)
    g = lambda name, d: legs.get(name, d)
    FL = g('fl', (2, 0, 26)); FR = g('fr', (-3, 0, 24))
    HL = g('hl', (-17, 3, 22)); HR = g('hr', (-14 + rest * 8, 8 + rest * 14, 26 + rest * 40))
    FL_top, FR_top, HL_top, HR_top = B(0.38, 0.70), B(0.31, 0.70), B(-0.40, 0.74), B(-0.46, 0.74)
    fl_ = dict(l1=0.30, l2=0.255, l3=0.085, w_top=0.07, w_joint=0.036, w_low=0.026)
    hl_ = dict(l1=0.31, l2=0.29, l3=0.085, w_top=0.085, w_joint=0.04, w_low=0.027)

    # --- far legs (behind, darker)
    for top, ang, prm in ((FR_top, FR, fl_), (HR_top, HR, hl_)):
        lp, (t, k, f, h) = leg_path(P, H, top, *ang, prm['l1'], prm['l2'], prm['l3'], prm['w_top'], prm['w_joint'], prm['w_low'])
        dcol = mix(C['coat'], '#000000', 0.38)
        fill_shape(c, lp, dcol, shade=C['shade'], shade_dir=(0.3, 1), seed=41, H=H)
        if C['lower']:
            c.save(); c.clipPath(lp, doAntiAlias=True)
            c.drawRect(skia.Rect.MakeLTRB(0, P(k)[1] - H * 0.02, W, Hc), skia.Paint(AntiAlias=True, Color=hexc(mix(C['lower'], '#000000', 0.3))))
            c.restore(); c.drawPath(lp, skia.Paint(AntiAlias=True, Color=INK, Style=skia.Paint.kStroke_Style, StrokeWidth=max(1.5, H * 0.006)))
        if C['sock'] and top is HR_top:
            c.save(); c.clipPath(lp, doAntiAlias=True)
            c.drawRect(skia.Rect.MakeLTRB(0, P(f)[1] - H * 0.07, W, Hc), skia.Paint(AntiAlias=True, Color=hexc(mix(C['sock'], '#000000', 0.35))))
            c.restore(); c.drawPath(lp, skia.Paint(AntiAlias=True, Color=INK, Style=skia.Paint.kStroke_Style, StrokeWidth=max(1.5, H * 0.006)))
        fill_shape(c, hoof_path(P, H, h, ang[2], prm['w_low']), mix(C['hoof'], '#000000', 0.3), H=H, grain=False, lw=max(1.5, H * 0.006))

    # --- tail (behind hindquarters), high Arabian carriage
    root = B(-0.585, 0.95)
    tp = [root]
    n = 10
    for i in range(1, n + 1):
        t = i / n
        ang = math.radians(135 + 125 * t ** 0.8 - tail_lift * 35 * (1 - t) + tail * 30 * t ** 1.2)
        prev = tp[-1]
        seg = 0.062 - 0.001 * i
        tp.append((prev[0] + seg * math.cos(ang), prev[1] + seg * math.sin(ang)))
    tps = [P(q) for q in tp]
    ws = [H * w for w in [0.028, 0.04, 0.052, 0.06, 0.064, 0.064, 0.06, 0.054, 0.046, 0.036, 0.022]]
    tail_path = catmull_closed(tube(tps, ws), 0.45)
    fill_shape(c, tail_path, C['mane'], shade=mix(C['mane'], '#000000', 0.6), shade_dir=(0.3, 1), seed=43, H=H,
               light=(0.3, 0.2, 0.6, mix(C['mane'], '#d8c0a0', 0.35)))
    c.save(); c.clipPath(tail_path, doAntiAlias=True)
    for k_ in range(8):
        off = (k_ - 3.5) * 0.011
        sp = [(q[0] + off * H * (0.3 + i / len(tps)), q[1] + off * H * 0.3 * (i / len(tps))) for i, q in enumerate(tps)]
        stroke(c, catmull_open(sp, 0.5), mix(C['mane'], '#c8a888', 0.3), max(1, H * 0.0028), alpha=130)
    c.restore()
    # wisps at the tail end
    for k_ in range(4):
        e = tps[-1]
        d = (tps[-1][0] - tps[-2][0], tps[-1][1] - tps[-2][1])
        wp = [tps[-3], (e[0] + (k_ - 1.5) * H * 0.012, e[1]), (e[0] + d[0] * 0.8 + (k_ - 1.5) * H * 0.02, e[1] + d[1] * 1.2)]
        stroke(c, catmull_open(wp, 0.5), '#2a1c13', H * 0.008); stroke(c, catmull_open(wp, 0.5), C['mane'], H * 0.004)

    # --- near legs unioned with body into one silhouette
    near = []
    for top, ang, prm in ((FL_top, FL, fl_), (HL_top, HL, hl_)):
        lp, pts = leg_path(P, H, top, *ang, prm['l1'], prm['l2'], prm['l3'], prm['w_top'], prm['w_joint'], prm['w_low'])
        near.append((lp, pts, ang, prm))
    sil = body_path
    for lp, *_ in near:
        sil = skia.Op(sil, lp, skia.PathOp.kUnion_PathOp) or sil
    fill_shape(c, sil, C['coat'], shade=C['shade'], shade_dir=(-0.15, 1.0), seed=47 + seed, H=H, light=(0.6, 0.12, 0.7, C['light']))
    c.save(); c.clipPath(sil, doAntiAlias=True)
    if C['lower']:   # bay: black lower legs
        for lp, (t, k, f, h), *_ in near:
            c.save(); c.clipPath(lp, doAntiAlias=True)
            c.drawRect(skia.Rect.MakeLTRB(0, P(k)[1] - H * 0.03, W, Hc), skia.Paint(AntiAlias=True, Color=hexc(C['lower'])))
            c.restore()
    if C['sock']:
        lp, (t, k, f, h), *_ = near[1]
        c.save(); c.clipPath(lp, doAntiAlias=True)
        c.drawRect(skia.Rect.MakeLTRB(0, P(f)[1] - H * 0.07, W, Hc), skia.Paint(AntiAlias=True, Color=hexc(C['sock'])))
        c.restore()
    fl_col = mix(C['coat'], C['shade'], 0.68)
    # form lines: shoulder, elbow, stifle, gaskin, belly, joints
    for seg_ in ([B(0.28, 1.0), B(0.36, 0.86), B(0.40, 0.72)], [B(-0.28, 0.95), B(-0.36, 0.80), B(-0.40, 0.70)],
                 [B(-0.05, 0.60), B(0.18, 0.585)], [B(0.43, 0.83), B(0.46, 0.75)]):
        stroke(c, catmull_open([P(q) for q in seg_], 0.5), fl_col, H * 0.0042, alpha=170)
    for lp, (t, k, f, h), ang, prm in near:
        kk = P(k)
        stroke(c, catmull_open([(kk[0] - H * 0.02, kk[1] - H * 0.005), (kk[0] + H * 0.012, kk[1] + H * 0.006)], 0.5), fl_col, H * 0.0035, alpha=190)
    stroke(c, catmull_open([P(B(-0.40, 0.985)), P(B(-0.1, 0.958)), P(B(0.2, 0.985))], 0.5), C['light'], H * 0.009, alpha=80)
    # blaze + muzzle shading
    if C['blaze']:
        bl = [hd(0.62, 1.37), hd(0.67, 1.33), hd(0.78, 1.17), hd(0.80, 1.13), hd(0.76, 1.16), hd(0.64, 1.33)]
        c.drawPath(catmull_closed([P(q) for q in bl], 0.4), skia.Paint(AntiAlias=True, Color=hexc('#eadfc8')))
    muz = skia.Path(); m = P(hd(0.79, 1.11)); muz.addOval(skia.Rect.MakeXYWH(m[0] - H * 0.05, m[1] - H * 0.04, H * 0.09, H * 0.07))
    c.drawPath(muz, skia.Paint(AntiAlias=True, Color=hexc(mix(C['shade'], '#000000', 0.2), 120)))
    c.restore()
    for lp, (t, k, f, h), ang, prm in near:
        fill_shape(c, hoof_path(P, H, h, ang[2], prm['w_low']), C['hoof'], H=H, grain=False, lw=max(1.5, H * 0.006))

    # face details for the animal (natural anatomy): calm eye, nostril, mouth line, jaw
    e = P(hd(0.645, 1.325))
    eye = skia.Path(); eye.addOval(skia.Rect.MakeXYWH(e[0] - H * 0.014, e[1] - H * (0.008 - blink * 0.006), H * 0.028, H * (0.016 - blink * 0.012)))
    c.drawPath(eye, skia.Paint(AntiAlias=True, Color=hexc('#120a06')))
    if blink < 0.5:
        c.drawCircle(e[0] + H * 0.004, e[1] - H * 0.003, H * 0.0035, skia.Paint(AntiAlias=True, Color=hexc('#cdb89a')))
    nos = P(hd(0.785, 1.14))
    nn = skia.Path(); nn.addOval(skia.Rect.MakeXYWH(nos[0] - H * 0.01, nos[1] - H * 0.007, H * 0.02, H * 0.013))
    c.drawPath(nn, skia.Paint(AntiAlias=True, Color=hexc('#140b07')))
    stroke(c, catmull_open([P(hd(0.75, 1.10)), P(hd(0.795, 1.098))], 0.5), '#1a100a', H * 0.0035)
    stroke(c, catmull_open([P(hd(0.62, 1.30)), P(hd(0.645, 1.20)), P(hd(0.70, 1.15))], 0.5), fl_col, H * 0.004, alpha=170)

    # ears
    for k_, dx in enumerate((0.0, -0.028)):
        e0 = hd(0.585 + dx, 1.40); e1 = hd(0.625 + dx, 1.395)
        tip = hd(0.575 + dx - ear * 0.03, 1.49 - ear * 0.01)
        ep = catmull_closed([P(e0), P(((e0[0] + tip[0]) / 2 - 0.01, (e0[1] + tip[1]) / 2)), P(tip), P(((e1[0] + tip[0]) / 2 + 0.01, (e1[1] + tip[1]) / 2)), P(e1)], 0.3)
        fill_shape(c, ep, mix(C['coat'], '#000000', 0.3 if k_ else 0.0), shade=C['shade'], seed=53, H=H)

    # mane: falls on the near side of the crest
    crest = [nk(0.27, 1.035, 0.0), nk(0.33, 1.10, 0.3), nk(0.40, 1.19, 0.55), nk(0.47, 1.285, 0.8), hd(0.54, 1.36), hd(0.585, 1.405)]
    cp = [P(q) for q in crest]
    mo = [(q[0] - H * 0.006, q[1] - H * 0.012) for q in cp]
    for j, q in enumerate(reversed(cp)):
        i = len(cp) - 1 - j
        drop = H * (0.075 + 0.03 * math.sin(i * 2.3 + seed * 0.7)) * (0.45 if i == len(cp) - 1 else 1.0)
        mo.append((q[0] + H * 0.012, q[1] + drop))
    mp = catmull_closed(mo, 0.5)
    fill_shape(c, mp, C['mane'], shade=mix(C['mane'], '#000000', 0.5), seed=59, H=H, light=(0.5, 0.2, 0.6, mix(C['mane'], '#c8b090', 0.3)))
    c.save(); c.clipPath(mp, doAntiAlias=True)
    for i in range(len(cp) - 1):
        a = cp[i]; stroke(c, catmull_open([a, (a[0] + H * 0.015, a[1] + H * 0.07)], 0.5), mix(C['mane'], '#c8b090', 0.3), max(1, H * 0.003), alpha=120)
    c.restore()
    fpp = [P(hd(0.585, 1.40)), P(hd(0.625, 1.39)), P(hd(0.665, 1.345)), P(hd(0.63, 1.355))]
    fill_shape(c, catmull_closed(fpp, 0.4), C['mane'], seed=61, H=H)

    if tack:
        rope_dark, rope = '#2a1c13', '#b49a6e'
        for seg_ in ([hd(0.60, 1.40), hd(0.625, 1.30), hd(0.655, 1.21), hd(0.70, 1.15)],
                     [hd(0.69, 1.25), hd(0.76, 1.205), hd(0.80, 1.17)], [hd(0.70, 1.15), hd(0.745, 1.115), hd(0.79, 1.13)]):
            pth = catmull_open([P(q) for q in seg_], 0.5)
            stroke(c, pth, rope_dark, H * 0.014); stroke(c, pth, rope, H * 0.008)
        chin = hd(0.71, 1.12)
        lead = [P(chin), P((chin[0] - 0.01, chin[1] - 0.18)), P((chin[0] + 0.02, chin[1] - 0.36)), P((chin[0] + 0.04, 0.48 + by))]
        stroke(c, catmull_open(lead, 0.5), rope_dark, H * 0.011); stroke(c, catmull_open(lead, 0.5), '#a88f64', H * 0.006)
        bl = [B(-0.24, 1.00), B(0.16, 1.005), B(0.20, 0.73), B(0.12, 0.70), B(-0.15, 0.70), B(-0.27, 0.73)]
        bp = catmull_closed([P(q) for q in bl], 0.25)
        fill_shape(c, bp, C['blanket'], shade=mix(C['blanket'], '#000000', 0.55), shade_dir=(0, 1), seed=67, H=H)
        c.save(); c.clipPath(bp, doAntiAlias=True)
        for yy in (0.93, 0.85, 0.77):
            stroke(c, catmull_open([P(B(-0.3, yy)), P(B(0.25, yy + 0.005))], 0.5), C['blanket2'], H * 0.015, alpha=230)
        # fringe
        for xx in np.linspace(-0.25, 0.17, 12):
            stroke(c, catmull_open([P(B(xx, 0.715)), P(B(xx + 0.004, 0.695))], 0.5), mix(C['blanket'], '#000000', 0.4), H * 0.004)
        c.restore()
        pad = [B(-0.17, 0.995), B(-0.13, 1.045), B(0.09, 1.05), B(0.14, 1.0)]
        fill_shape(c, catmull_closed([P(q) for q in pad], 0.4), '#6b4a2c', shade='#2e1d10', seed=71, H=H)
        gp = [P(B(0.09, 0.995)), P(B(0.115, 0.78)), P(B(0.105, 0.57))]
        stroke(c, catmull_open(gp, 0.5), '#2a1c13', H * 0.026); stroke(c, catmull_open(gp, 0.5), '#5c3d24', H * 0.018)

    img = surf.makeImageSnapshot()
    return img.toarray(colorType=skia.ColorType.kRGBA_8888_ColorType, alphaType=skia.AlphaType.kUnpremul_AlphaType)
