"""Painted cel props and effect sprites (transparent WebP). Same ink + gouache-grain treatment as the
characters so cel elements sit together over the painted backgrounds.
7th-century Hijaz: goat-hair / leather tents on wooden poles, qirba water skins, wool bedrolls,
rope, wooden bowls, straight double-edged swords in leather scabbards, plain spears, round leather
shields (daraqa), woven saddlebags. No stirrups, no metal lanterns."""
import os, sys, math, json
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import skia
from PIL import Image
from rig import hexc, mix, fill_shape, stroke, catmull_closed, catmull_open, tube, resample, poly_path

OUT = '/home/user/miqdad_film/art/props'
FX = '/home/user/miqdad_film/art/fx'
os.makedirs(OUT, exist_ok=True); os.makedirs(FX, exist_ok=True)

def canvas(w, h):
    s = skia.Surface(w, h); c = s.getCanvas(); c.clear(skia.Color(0, 0, 0, 0)); return s, c

def save(surf, fn, crop=True, q=86):
    arr = surf.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType, alphaType=skia.AlphaType.kUnpremul_AlphaType)
    im = Image.fromarray(arr)
    bb = im.getbbox()
    if crop and bb:
        im = im.crop(bb)
    im.save(fn, 'WEBP', quality=q, method=6)
    return im.size

def tent(fn, w=900, h=620, cloth='#2f2620', seed=1):
    """Bedouin-style goat-hair tent: ridge on poles, sloping roof cloth, guy ropes, open front."""
    surf, c = canvas(w, h)
    H = h
    gy = h - 20
    # guy ropes + stakes (behind)
    for x0, x1, y1 in ((0.05, 0.2, 0.32), (0.95, 0.8, 0.32), (0.02, 0.14, 0.55), (0.98, 0.86, 0.55)):
        stroke(c, catmull_open([(w * x0, gy - 4), (w * x1, h * y1)], 0.5), '#2a1c13', 4)
        stroke(c, catmull_open([(w * x0, gy - 4), (w * x1, h * y1)], 0.5), '#9c8460', 2)
        stroke(c, catmull_open([(w * x0, gy + 2), (w * x0 + 4, gy - 24)], 0.5), '#3a2618', 6)
    # back wall (dark interior)
    back = [(w * 0.18, gy), (w * 0.2, h * 0.36), (w * 0.5, h * 0.22), (w * 0.8, h * 0.36), (w * 0.82, gy)]
    fill_shape(c, poly_path(back), '#140e0a', H=H, grain=True)
    # roof cloth with sag between poles
    roof = [(w * 0.08, h * 0.60), (w * 0.17, h * 0.33), (w * 0.33, h * 0.25), (w * 0.5, h * 0.17), (w * 0.67, h * 0.25),
            (w * 0.83, h * 0.33), (w * 0.92, h * 0.60), (w * 0.75, h * 0.47), (w * 0.5, h * 0.42), (w * 0.25, h * 0.47)]
    rp = catmull_closed(roof, 0.35)
    fill_shape(c, rp, cloth, shade=mix(cloth, '#000000', 0.6), shade_dir=(0, 1), seed=seed, H=H * 2,
               light=(0.45, 0.1, 0.8, '#8a7a68'))
    c.save(); c.clipPath(rp, doAntiAlias=True)
    for i in range(14):   # woven strips
        y = h * (0.18 + i * 0.035)
        stroke(c, catmull_open([(0, y + 30), (w * 0.5, y), (w, y + 30)], 0.5), mix(cloth, '#a89880', 0.25), 3, alpha=150)
    c.restore()
    # side walls (front open, sides hang)
    for side in (-1, 1):
        x_out = w * (0.5 + side * 0.42); x_in = w * (0.5 + side * 0.30)
        wall = [(x_out, h * 0.60), (x_in, h * 0.47), (x_in + side * 8, gy), (x_out + side * 10, gy)]
        fill_shape(c, catmull_closed(wall, 0.2), mix(cloth, '#000000', 0.25), shade=mix(cloth, '#000000', 0.7), shade_dir=(0, 1), seed=seed + 3, H=H * 2)
    # poles
    for x, y in ((0.5, 0.17), (0.33, 0.25), (0.67, 0.25)):
        stroke(c, catmull_open([(w * x, h * y), (w * x + 2, gy)], 0.5), '#2a1c13', 11)
        stroke(c, catmull_open([(w * x, h * y), (w * x + 2, gy)], 0.5), '#7a5a3a', 6)
    return save(surf, fn)

def waterskin(fn, w=260, h=200):
    surf, c = canvas(w, h)
    body = [(30, 120), (60, 60), (140, 45), (210, 70), (230, 130), (190, 175), (90, 180), (40, 160)]
    fill_shape(c, catmull_closed(body, 0.5), '#7a5536', shade='#2e1c10', shade_dir=(0, 1), seed=5, H=400, light=(0.4, 0.2, 0.6, '#c49a6c'))
    neck = [(205, 80), (240, 50), (252, 62), (225, 95)]
    fill_shape(c, catmull_closed(neck, 0.4), '#6a4a2e', H=400)
    stroke(c, catmull_open([(232, 56), (246, 70)], 0.5), '#c2a77a', 5)
    for x in (80, 120, 160):
        stroke(c, catmull_open([(x, 60), (x - 8, 120), (x + 4, 175)], 0.5), '#4a3020', 2, alpha=150)
    return save(surf, fn)

def bedroll(fn, w=320, h=150, col='#8c6a46', stripe='#3d4d63'):
    surf, c = canvas(w, h)
    r = skia.Path(); r.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(20, 30, 300, 130), 50, 50))
    fill_shape(c, r, col, shade=mix(col, '#000000', 0.6), shade_dir=(0, 1), seed=7, H=400, light=(0.5, 0.1, 0.6, '#e8d2aa'))
    c.save(); c.clipPath(r, doAntiAlias=True)
    for x in (70, 90, 230, 250):
        stroke(c, catmull_open([(x, 25), (x + 6, 135)], 0.5), stripe, 9, alpha=220)
    c.restore()
    e = skia.Path(); e.addOval(skia.Rect.MakeLTRB(255, 30, 310, 130))
    fill_shape(c, e, mix(col, '#e8d2aa', 0.3), H=400)
    for k in range(3):
        el = skia.Path(); el.addOval(skia.Rect.MakeLTRB(262 + k * 8, 42 + k * 12, 304 - k * 6, 118 - k * 12))
        stroke(c, el, mix(col, '#000000', 0.45), 2)
    for x in (120, 190):   # rope ties
        stroke(c, catmull_open([(x, 26), (x + 4, 134)], 0.5), '#2a1c13', 9); stroke(c, catmull_open([(x, 26), (x + 4, 134)], 0.5), '#b49a6e', 5)
    return save(surf, fn)

def bundle(fn, w=240, h=200, col='#a2865c'):
    surf, c = canvas(w, h)
    b = [(30, 180), (20, 120), (60, 60), (120, 40), (190, 70), (220, 140), (200, 185)]
    fill_shape(c, catmull_closed(b, 0.5), col, shade=mix(col, '#000000', 0.6), shade_dir=(0.2, 1), seed=9, H=400, light=(0.4, 0.2, 0.6, '#efdcb8'))
    knot = [(100, 50), (120, 15), (140, 50), (125, 60)]
    fill_shape(c, catmull_closed(knot, 0.5), mix(col, '#000000', 0.15), H=400)
    for pts in ([(60, 70), (110, 120), (200, 170)], [(185, 75), (130, 110), (40, 165)]):
        stroke(c, catmull_open(pts, 0.5), mix(col, '#000000', 0.45), 2.5, alpha=180)
    return save(surf, fn)

def rope_coil(fn, w=220, h=120):
    surf, c = canvas(w, h)
    for k in range(5):
        e = skia.Path(); e.addOval(skia.Rect.MakeLTRB(20 + k * 5, 30 + k * 4, 200 - k * 5, 105 - k * 3))
        stroke(c, e, '#2a1c13', 10); stroke(c, e, '#b09468', 6)
    stroke(c, catmull_open([(190, 70), (215, 95), (205, 112)], 0.5), '#2a1c13', 10)
    stroke(c, catmull_open([(190, 70), (215, 95), (205, 112)], 0.5), '#b09468', 6)
    return save(surf, fn)

def bowl(fn, w=200, h=110):
    surf, c = canvas(w, h)
    b = skia.Path(); b.moveTo(15, 35); b.cubicTo(25, 105, 175, 105, 185, 35); b.close()
    fill_shape(c, b, '#6e4a2a', shade='#2a180c', shade_dir=(0, 1), seed=11, H=300, light=(0.4, 0.3, 0.6, '#c08a58'))
    rim = skia.Path(); rim.addOval(skia.Rect.MakeLTRB(15, 22, 185, 50))
    fill_shape(c, rim, '#3a2414', H=300)
    return save(surf, fn)

def sword(fn, w=760, h=110):
    """straight double-edged sword sheathed in a leather scabbard, with a leather baldric."""
    surf, c = canvas(w, h)
    sc = skia.Path(); sc.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(150, 40, 740, 70), 14, 14))
    fill_shape(c, sc, '#4a2e1c', shade='#1c100a', shade_dir=(0, 1), seed=13, H=300, light=(0.5, 0.2, 0.7, '#9a6a44'))
    for x in (230, 560):
        r = skia.Path(); r.addRect(skia.Rect.MakeLTRB(x, 36, x + 16, 74)); fill_shape(c, r, '#2e1d12', H=300)
    grip = skia.Path(); grip.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(40, 46, 140, 64), 8, 8))
    fill_shape(c, grip, '#3a2618', H=300)
    for x in range(52, 138, 12):
        stroke(c, catmull_open([(x, 46), (x + 6, 64)], 0.5), '#7a5a3a', 2)
    guard = skia.Path(); guard.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(138, 26, 152, 84), 5, 5))
    fill_shape(c, guard, '#8a7a62', H=300)
    pom = skia.Path(); pom.addOval(skia.Rect.MakeLTRB(22, 42, 46, 68)); fill_shape(c, pom, '#8a7a62', H=300)
    stroke(c, catmull_open([(240, 74), (400, 104), (570, 74)], 0.5), '#2a1c13', 9); stroke(c, catmull_open([(240, 74), (400, 104), (570, 74)], 0.5), '#6b4a2c', 5)
    return save(surf, fn)

def spear(fn, w=90, h=1100):
    surf, c = canvas(w, h)
    shaft = catmull_open([(45, 160), (47, 1090)], 0.5)
    stroke(c, shaft, '#2a1c13', 15); stroke(c, shaft, '#7a5634', 9)
    stroke(c, catmull_open([(43, 300), (44, 900)], 0.5), '#a07a52', 2, alpha=150)
    blade = [(45, 10), (66, 95), (58, 150), (45, 168), (32, 150), (24, 95)]
    fill_shape(c, catmull_closed(blade, 0.35), '#8e8f88', shade='#3c3d38', shade_dir=(1, 0.3), seed=15, H=400, light=(0.3, 0.3, 0.5, '#e8e6dc'))
    stroke(c, catmull_open([(45, 20), (45, 160)], 0.5), '#5a5b55', 2)
    for y in (168, 178):
        stroke(c, catmull_open([(36, y), (56, y + 2)], 0.5), '#3a2618', 5)
    return save(surf, fn)

def shield(fn, w=300, h=300):
    surf, c = canvas(w, h)
    s = skia.Path(); s.addCircle(150, 150, 130)
    fill_shape(c, s, '#7c5434', shade='#2e1b0e', shade_dir=(0.4, 1), seed=17, H=500, light=(0.35, 0.3, 0.6, '#c99a66'))
    rim = skia.Path(); rim.addCircle(150, 150, 118)
    stroke(c, rim, '#4a2e1a', 6)
    for r in (80, 45):
        e = skia.Path(); e.addCircle(150, 150, r); stroke(c, e, '#5a3a22', 3, alpha=180)
    boss = skia.Path(); boss.addCircle(150, 150, 24); fill_shape(c, boss, '#5c3d24', H=500, light=(0.3, 0.3, 0.7, '#b48a5a'))
    for a in range(0, 360, 30):
        x, y = 150 + 122 * math.cos(math.radians(a)), 150 + 122 * math.sin(math.radians(a))
        stroke(c, catmull_open([(x, y), (x + 0.1, y + 0.1)], 0.5), '#2a1c13', 6)
    return save(surf, fn)

def saddlebags(fn, w=360, h=230):
    surf, c = canvas(w, h)
    for x0 in (20, 190):
        b = skia.Path(); b.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x0, 50, x0 + 150, 200), 26, 26))
        fill_shape(c, b, '#7a3324', shade='#2c0f09', shade_dir=(0, 1), seed=19, H=400, light=(0.4, 0.2, 0.6, '#c8805a'))
        c.save(); c.clipPath(b, doAntiAlias=True)
        for y in (90, 130, 170):
            stroke(c, catmull_open([(x0, y), (x0 + 150, y)], 0.5), '#c9a96b', 8, alpha=220)
            for xx in range(x0 + 10, x0 + 150, 22):
                stroke(c, catmull_open([(xx, y - 6), (xx + 8, y + 6)], 0.5), '#3d4d63', 3, alpha=200)
        c.restore()
        for xx in range(x0 + 12, x0 + 150, 16):
            stroke(c, catmull_open([(xx, 200), (xx + 2, 222)], 0.5), '#5a2418', 4)
    band = skia.Path(); band.addRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(150, 40, 210, 80), 10, 10)); fill_shape(c, band, '#6b4a2c', H=400)
    return save(surf, fn)

def campfire_base(fn, w=420, h=170):
    surf, c = canvas(w, h)
    for i, (x, y, r) in enumerate([(60, 120, 34), (120, 140, 30), (200, 148, 36), (285, 140, 32), (355, 122, 34), (110, 95, 26), (310, 95, 26)]):
        s = skia.Path(); s.addOval(skia.Rect.MakeLTRB(x - r, y - r * 0.7, x + r, y + r * 0.7))
        fill_shape(c, s, '#5a5048', shade='#1e1a16', shade_dir=(0, 1), seed=21 + i, H=300, light=(0.5, 0.2, 0.6, '#a08a72'))
    for a, b in (((110, 120), (300, 70)), ((130, 70), (310, 118)), ((180, 130), (250, 55))):
        stroke(c, catmull_open([a, b], 0.5), '#1a110c', 22)
        stroke(c, catmull_open([a, b], 0.5), '#3e2a1c', 15)
        stroke(c, catmull_open([((a[0] + b[0]) / 2 - 20, (a[1] + b[1]) / 2), ((a[0] + b[0]) / 2 + 20, (a[1] + b[1]) / 2)], 0.5), '#c2501c', 6, alpha=200)
    # ember bed
    g = skia.GradientShader.MakeRadial((210, 105), 90, [hexc('#ffb050', 220), hexc('#c2400e', 120), hexc('#c2400e', 0)])
    c.drawOval(skia.Rect.MakeLTRB(130, 75, 290, 135), skia.Paint(AntiAlias=True, Shader=g, BlendMode=skia.BlendMode.kScreen))
    return save(surf, fn)

def flames(n=12, w=260, h=420):
    """Hand-painted flame cycle: layered tongues with per-frame noise displacement."""
    rng = np.random.default_rng(5)
    phases = rng.uniform(0, 6.28, 6)
    meta = []
    for i in range(n):
        t = i / n * 2 * math.pi
        surf, c = canvas(w, h)
        def tongue(cx, hgt, wid, ph, col_out, col_in, k):
            pts = []
            steps = 14
            for j in range(steps + 1):
                u = j / steps
                y = h - 30 - u * hgt
                sway = math.sin(t * 1.0 + ph + u * 3.2) * 14 * u + math.sin(t * 2 + ph * 1.7 + u * 6) * 5 * u
                half = wid * (math.sin(math.pi * min(1, u * 1.15)) ** 0.8) * (1 - u) ** 0.4 * 0.5
                pts.append((cx + sway - half, y))
            for j in range(steps, -1, -1):
                u = j / steps
                y = h - 30 - u * hgt
                sway = math.sin(t * 1.0 + ph + u * 3.2) * 14 * u + math.sin(t * 2 + ph * 1.7 + u * 6) * 5 * u
                half = wid * (math.sin(math.pi * min(1, u * 1.15)) ** 0.8) * (1 - u) ** 0.4 * 0.5
                pts.append((cx + sway + half, y))
            path = catmull_closed(pts[::2], 0.45)
            g = skia.GradientShader.MakeLinear([(cx, h - 30), (cx, h - 30 - hgt)], [hexc(col_in), hexc(col_out), hexc(col_out, 0)], [0, 0.6, 1])
            c.drawPath(path, skia.Paint(AntiAlias=True, Shader=g))
        for k, (cx, hg, wd, co, ci) in enumerate([(130, 300, 150, '#c2400e', '#ff8a2a'), (100, 220, 90, '#e0601a', '#ffb050'),
                                                   (165, 240, 95, '#e0601a', '#ffb050'), (130, 170, 80, '#ffb347', '#fff0c0'), (118, 110, 50, '#fff2c8', '#ffffff')]):
            hgt = hg * (0.88 + 0.12 * math.sin(t + phases[k]))
            tongue(cx, hgt, wd, phases[k], co, ci, k)
        meta.append(save(surf, f'{FX}/flame_{i:02d}.webp', crop=False, q=88))
    return meta

def soft_sprite(fn, r=64, col='#ffffff', a=255, power=2.0):
    surf, c = canvas(r * 2, r * 2)
    g = skia.GradientShader.MakeRadial((r, r), r, [hexc(col, a), hexc(col, 0)], [0, 1])
    c.drawCircle(r, r, r, skia.Paint(AntiAlias=True, Shader=g))
    return save(surf, fn, crop=False)

def smoke_sprite(fn, w=256, h=256, seed=3):
    surf, c = canvas(w, h)
    rng = np.random.default_rng(seed)
    for k in range(9):
        x, y, r = rng.uniform(70, 186), rng.uniform(70, 186), rng.uniform(40, 80)
        g = skia.GradientShader.MakeRadial((x, y), r, [hexc('#b8b4ae', 60), hexc('#b8b4ae', 0)])
        c.drawCircle(x, y, r, skia.Paint(AntiAlias=True, Shader=g))
    return save(surf, fn, crop=False)

def dust_puff(n=8, w=300, h=160):
    for i in range(n):
        t = i / (n - 1)
        surf, c = canvas(w, h)
        rng = np.random.default_rng(11)
        for k in range(12):
            ang = rng.uniform(-0.3, 1.0) * math.pi
            d = 20 + t * rng.uniform(60, 120)
            x = w / 2 + math.cos(ang) * d * 1.3
            y = h - 30 - abs(math.sin(ang)) * d * 0.5 - t * 15
            r = 14 + t * 36
            al = int(110 * (1 - t) ** 1.3)
            g = skia.GradientShader.MakeRadial((x, y), r, [hexc('#c9b79a', al), hexc('#c9b79a', 0)])
            c.drawCircle(x, y, r, skia.Paint(AntiAlias=True, Shader=g))
        save(surf, f'{FX}/dust_{i:02d}.webp', crop=False)

def moon(fn, r=60):
    """crescent with painted halo (one consistent moon for every night background)."""
    S = int(r * 6)
    surf, c = canvas(S, S)
    cx = cy = S / 2
    g = skia.GradientShader.MakeRadial((cx, cy), S / 2, [hexc('#cfe0ff', 70), hexc('#8fa8d8', 22), hexc('#8fa8d8', 0)], [0, 0.35, 1])
    c.drawCircle(cx, cy, S / 2, skia.Paint(AntiAlias=True, Shader=g))
    disk = skia.Path(); disk.addCircle(cx, cy, r)
    cut = skia.Path(); cut.addCircle(cx + r * 0.42, cy - r * 0.22, r * 0.86)
    cres = skia.Op(disk, cut, skia.PathOp.kDifference_PathOp)
    gg = skia.GradientShader.MakeRadial((cx - r * 0.5, cy + r * 0.2), r * 1.2, [hexc('#fffbe8'), hexc('#e8e2c4')])
    c.drawPath(cres, skia.Paint(AntiAlias=True, Shader=gg))
    c.drawPath(cres, skia.Paint(AntiAlias=True, Color=hexc('#fffbe8', 120), Style=skia.Paint.kStroke_Style, StrokeWidth=2,
                                MaskFilter=skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 4)))
    return save(surf, fn, crop=False)

def fg_rocks(fn, w=1400, h=520, seed=2, col='#141218'):
    """out-of-focus dark foreground rock & shrub silhouettes for multiplane depth."""
    surf, c = canvas(w, h)
    rng = np.random.default_rng(seed)
    pts = [(0, h)]
    x = 0
    while x < w:
        x += rng.uniform(60, 160)
        y = h * rng.uniform(0.25, 0.75) if (x < w * 0.35 or x > w * 0.65) else h * rng.uniform(0.75, 0.95)
        pts.append((min(x, w), y))
    pts.append((w, h))
    path = catmull_closed(pts, 0.3)
    c.drawPath(path, skia.Paint(AntiAlias=True, Color=hexc(col), MaskFilter=skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 6)))
    c.drawPath(path, skia.Paint(AntiAlias=True, Color=hexc('#4a5878', 70), Style=skia.Paint.kStroke_Style, StrokeWidth=6,
                                MaskFilter=skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, 5)))
    # shrubs
    for k in range(5):
        bx = rng.uniform(0.05, 0.95) * w
        if w * 0.35 < bx < w * 0.65:
            continue
        by = h * 0.45
        for j in range(14):
            a = math.radians(rng.uniform(-80, 80) - 90)
            L = rng.uniform(60, 140)
            stroke(c, catmull_open([(bx, by + 40), (bx + math.cos(a) * L * 0.5 + rng.uniform(-10, 10), by + 40 + math.sin(a) * L * 0.5),
                                    (bx + math.cos(a) * L, by + 40 + math.sin(a) * L)], 0.5), col, 6)
    return save(surf, fn, crop=False)

if __name__ == '__main__':
    info = {}
    info['tent_a'] = tent(f'{OUT}/tent_a.webp', cloth='#2f2620', seed=1)
    info['tent_b'] = tent(f'{OUT}/tent_b.webp', w=760, h=520, cloth='#3a2e22', seed=4)
    info['waterskin'] = waterskin(f'{OUT}/waterskin.webp')
    info['bedroll'] = bedroll(f'{OUT}/bedroll.webp')
    info['bedroll2'] = bedroll(f'{OUT}/bedroll2.webp', col='#6d5a42', stripe='#7a3324')
    info['bundle'] = bundle(f'{OUT}/bundle.webp')
    info['rope'] = rope_coil(f'{OUT}/rope.webp')
    info['bowl'] = bowl(f'{OUT}/bowl.webp')
    info['sword'] = sword(f'{OUT}/sword.webp')
    info['spear'] = spear(f'{OUT}/spear.webp')
    info['shield'] = shield(f'{OUT}/shield.webp')
    info['saddlebags'] = saddlebags(f'{OUT}/saddlebags.webp')
    info['campfire'] = campfire_base(f'{OUT}/campfire.webp')
    flames()
    soft_sprite(f'{FX}/glow.webp', 128, '#ffffff')
    soft_sprite(f'{FX}/ember.webp', 16, '#ffd08a')
    smoke_sprite(f'{FX}/smoke.webp')
    dust_puff()
    moon(f'{FX}/moon.webp')
    fg_rocks(f'{FX}/fg_rocks_a.webp', seed=2)
    fg_rocks(f'{FX}/fg_rocks_b.webp', seed=9, col='#100e12')
    json.dump(info, open(f'{OUT}/props.json', 'w'))
    print(info)
