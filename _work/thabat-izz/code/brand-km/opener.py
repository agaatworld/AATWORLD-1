# Logo opener / animated logo test (1080x1920, 5 s) built from the ORIGINAL logo's own pixels (recoloured per direction)
# usage: python3 opener.py A render <part> <nparts> | python3 opener.py A still <t> <out.jpg>
from kit import *
import mg
W, H, FPS = 1080, 1920, 30
DUR = 5.0
K = ARGV[1]; d = DIRS[K]
SC = 1060 / LS; LW = 1060; CX, CY = 540, 860
def rs(a): return cv2.resize(a, (LW, LW), interpolation=cv2.INTER_AREA)
L = cv2.imread(B + f'cache/{K}_refined.png').astype(np.float32)
Ls = rs(L)
# ---- masks at screen scale
mG, mT, mS, mP, mD = [rs(m) for m in (M_GOLD, M_TEXT, M_SLATE, M_PHOTO, M_DISC)]
oc = ((OC[0]) * SC, (OC[1]) * SC); pc = (PC[0] * SC, PC[1] * SC)
y_, x_ = np.mgrid[0:LW, 0:LW].astype(np.float32)
RO = np.hypot(x_ - oc[0], y_ - oc[1]); RPs = np.hypot(x_ - pc[0], y_ - pc[1])
# vector circles under the lettering (hidden by the letters in the final frame; let the stroke read during drawing)
circ = np.zeros((LW * 4, LW * 4), np.uint8)
for R in (R_IN, R_OUT): cv2.circle(circ, (int(oc[0] * 16), int(oc[1] * 16)), int(R * SC * 16), 255, max(1, int(5.5 * SC * 4)), cv2.LINE_AA, shift=2)
circ = cv2.resize(circ, (LW, LW), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
gold_col = np.median(Ls[mG > 0.9], 0)
gA = np.maximum(mG, circ * (1 - mT)); gI = Ls * (mG[..., None] > 0.05) + gold_col * (mG[..., None] <= 0.05)
tri = ((np.abs(y_ - oc[1]) < 150 * SC) & (RO > 680 * SC) & (RO < 880 * SC)).astype(np.float32)
oncirc = ((np.abs(RO - R_IN * SC) < 5) | (np.abs(RO - R_OUT * SC) < 5)).astype(np.float32) * (1 - tri)
theta = np.arctan2(x_ - oc[0], -(y_ - oc[1]))                     # 0 at top, clockwise
p_out = (theta % (2 * np.pi)) / (2 * np.pi)
p_in = ((np.pi - theta) % (2 * np.pi)) / (2 * np.pi)                # from the bottom, counter-clockwise
is_out = (np.abs(RO - R_OUT * SC) < 5)
P_CIRC = np.where(is_out, p_out, p_in)
P_DASH = np.clip((RO - 250) / (530 - 250), 0, 1)
# photo border ring + disc
bA = np.clip(mP - mD, 0, 1); thp = np.arctan2(x_ - pc[0], -(y_ - pc[1])); P_BOR = (thp % (2 * np.pi)) / (2 * np.pi)
# slate ring: remove lettering from it (inpaint) so the ring can move alone
band = (mS > 0.01).astype(np.uint8)
hole = ((mT > 0.05) & (band > 0)).astype(np.uint8); hole = cv2.dilate(hole, np.ones((3, 3), np.uint8), iterations=2)
slate_img = cv2.inpaint(np.clip(Ls, 0, 255).astype(np.uint8), hole, 6, cv2.INPAINT_TELEA).astype(np.float32)
SLATE = np.dstack([slate_img, mS])
PHOTO = np.dstack([Ls, mD]); BORDER = np.dstack([Ls, bA])
# lettering: split top / bottom words
def crop_rgba(img, a, ys):
    m = a.copy(); m[:ys[0]] = 0; m[ys[1]:] = 0
    yy0, xx0 = np.where(m > 0.02); y0, y1, x0, x1 = yy0.min() - 4, yy0.max() + 5, xx0.min() - 4, xx0.max() + 5
    return np.dstack([img[y0:y1, x0:x1], m[y0:y1, x0:x1]]), ((x0 + x1) / 2, (y0 + y1) / 2)
TTOP, ctop = crop_rgba(Ls, mT, (0, int(LW * 0.5)))
TBOT, cbot = crop_rgba(Ls, mT, (int(LW * 0.5), LW))
def L2S(p, s=1.0): return CX + (p[0] - LW / 2) * s, CY + (p[1] - LW / 2) * s
# ---- ground
GROUND = grunge(H, W, d, seed=7)
glow = np.exp(-((mg.xx - CX) ** 2 + (mg.yy - CY) ** 2) / (2 * 520 ** 2))[..., None]
GROUND = GROUND + (d['steel'] - GROUND) * glow * 0.22
GROUND = vignette(GROUND, 0.55, CX, CY)
SLOGAN = text([('كلنا مقاومة', d['text'])], 'almarai', 54)
# astrolabe rings with ticks (drawn at 4x for AA)
def ticks_ring(r, n, ln, rot, col, a, w=2):
    m = np.zeros((H, W), np.float32); S8 = 8
    cv2.circle(m, (int(CX * S8), int(CY * S8)), int(r * S8), 1.0, w, cv2.LINE_AA, shift=3)
    for i in range(n):
        an = np.deg2rad(rot + 360 * i / n); L_ = ln * (2.2 if i % 5 == 0 else 1)
        p0 = (CX + np.sin(an) * r, CY - np.cos(an) * r); p1 = (CX + np.sin(an) * (r + L_), CY - np.cos(an) * (r + L_))
        cv2.line(m, (int(p0[0] * S8), int(p0[1] * S8)), (int(p1[0] * S8), int(p1[1] * S8)), 1.0, w, cv2.LINE_AA, shift=3)
    return m * a, col
DUST = mg.Dust(26, seed=4, col=d['gold'], size=(1.5, 3.2), speed=(-10, -30), alpha=0.5)

def comp(c, rgba, cx, cy, s=1.0, a=1.0, rot=0.0):
    return mg.put(c, rgba, cx, cy, s, a, rot=rot)

def frame(t):
    c = GROUND.copy()
    up = ease(seg(t, 0.0, 0.5)); c = c * (0.25 + 0.75 * up)
    # astrolabe rings (behind)
    ra = eio(seg(t, 0.5, 1.6))
    if ra > 0:
        for r, n, ln, sp, a in ((585, 72, 9, 6, 0.32), (660, 120, 6, -4, 0.20), (760, 0, 0, 0, 0.14)):
            m, col = ticks_ring(r * (1.12 - 0.12 * ease(seg(t, 0.5, 1.8))), n, ln, sp * t, d['steel'], a * ra)
            c = c + (col - c) * m[..., None]
    # ---- gold line drawing (logo-space layer, then placed)
    pc_ = ease(seg(t, 0.20, 1.35)) * 1.002
    ac = np.clip((pc_ - P_CIRC) / 0.015, 0, 1) * oncirc
    pdash = ease(seg(t, 0.65, 1.45)); ad = np.clip((pdash - P_DASH) / 0.05, 0, 1) * (1 - oncirc) * (1 - tri)
    trs = ease(seg(t, 0.95, 1.45))
    A = gA * np.clip(ac + ad, 0, 1)
    sheen = seg(t, 2.55, 3.35)
    gimg = gI
    if 0 < sheen < 1:
        v = (x_ + y_ * 0.7) / (LW * 1.7); hl = np.exp(-((v - (sheen * 1.4 - 0.2)) / 0.06) ** 2)[..., None]
        gimg = gI + (255 - gI) * hl * 0.75
    GL = np.dstack([gimg, A])
    s = 1.0
    c = comp(c, GL, CX, CY, s)
    # triangles slide in from the sides
    if trs > 0:
        TL = np.dstack([gimg, gA * tri * (x_ < LW / 2)]); TR = np.dstack([gimg, gA * tri * (x_ >= LW / 2)])
        off = (1 - trs) * 140
        c = comp(c, TL, CX - off, CY, s, trs); c = comp(c, TR, CX + off, CY, s, trs)
    # drawing heads (sparks)
    if 0.2 < t < 1.42:
        for R, pp, ccw in ((R_OUT, pc_, False), (R_IN, pc_, True)):
            an = 2 * np.pi * pp; an = (np.pi - an) if ccw else an
            hx_ = CX + (oc[0] - LW / 2) + np.sin(an) * R * SC; hy_ = CY + (oc[1] - LW / 2) - np.cos(an) * R * SC
            g = np.exp(-((mg.xx - hx_) ** 2 + (mg.yy - hy_) ** 2) / (2 * 9 ** 2))[..., None]
            g2 = np.exp(-((mg.xx - hx_) ** 2 + (mg.yy - hy_) ** 2) / (2 * 40 ** 2))[..., None]
            c = c + (255 - c) * g * 0.9 + (d['gold'] - c) * g2 * 0.35
    # ---- slate ring: scale + rotate in
    sr = ease(seg(t, 1.05, 1.95))
    if sr > 0:
        ss = 1.22 - 0.22 * sr
        sh = np.dstack([np.zeros((LW, LW, 3), np.float32), cv2.GaussianBlur(mS, (0, 0), 12) * 0.7])
        c = comp(c, sh, CX + 6, CY + 12, ss, sr, rot=-28 * (1 - sr))
        c = comp(c, SLATE, CX, CY, ss, sr, rot=-28 * (1 - sr))
    # ---- photo border draws, disc irises open
    pb = ease(seg(t, 1.45, 1.95))
    if pb > 0:
        BA = BORDER.copy(); BA[..., 3] = bA * np.clip((pb * 1.01 - P_BOR) / 0.02, 0, 1)
        c = comp(c, BA, CX, CY)
    ir = ease(seg(t, 1.70, 2.30))
    if ir > 0:
        PH = PHOTO.copy(); PH[..., 3] = mD * np.clip((ir * R_PHOTO * SC - RPs) / 3, 0, 1)
        zz = 1.12 - 0.12 * ease(seg(t, 1.7, 3.2))
        # zoom photo content inside the fixed iris
        Mz = cv2.getRotationMatrix2D(pc, 0, zz); PH[..., :3] = cv2.warpAffine(Ls, Mz, (LW, LW), borderMode=cv2.BORDER_REFLECT)
        c = comp(c, PH, CX, CY)
    # ---- lettering (RTL wipe + rise) with shadow
    for img, cen, t0 in ((TTOP, ctop, 2.05), (TBOT, cbot, 2.20)):
        w = ease(seg(t, t0, t0 + 0.42))
        if w > 0:
            px, py = L2S(cen); rise = 26 * (1 - ease(seg(t, t0, t0 + 0.6)))
            shd = np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), 7) * 0.75 * w * w])
            c = mg.put(c, shd, px + 5, py + 9 + rise, 1.0, 1.0, wipe=w)
            c = mg.put(c, img, px, py + rise, 1.0, 1.0, wipe=w)
    # impact flash at the letters' landing
    fl = np.exp(-max(0, t - 2.25) / 0.12) if t >= 2.25 else 0
    if fl > 0.01:
        g = np.exp(-((mg.xx - CX) ** 2 + (mg.yy - CY) ** 2) / (2 * 600 ** 2))[..., None]
        c = c + (d['gold'] - c) * g * 0.10 * fl
    # slogan
    sl = ease(seg(t, 3.0, 3.7))
    if sl > 0:
        ys = 1462; c = mg.put(c, SLOGAN, CX, ys + 16 * (1 - sl), 1.0, sl)
        hw = SLOGAN.shape[1] / 2 + 30
        for sgn in (-1, 1):
            m = np.zeros((H, W), np.float32); x0 = CX + sgn * hw; x1 = CX + sgn * (hw + 90 * sl)
            cv2.line(m, (int(x0 * 8), ys * 8), (int(x1 * 8), ys * 8), 1.0, 2, cv2.LINE_AA, shift=3)
            c = c + (d['gold'] - c) * m[..., None] * sl
    c = DUST.draw(c, t, 0.8 * ease(seg(t, 1.0, 2.0)))
    # camera push
    z = 1.0 + 0.035 * eio(seg(t, 2.3, DUR))
    if z > 1.0005:
        M = cv2.getRotationMatrix2D((CX, CY), 0, z); c = cv2.warpAffine(c, M, (W, H), borderMode=cv2.BORDER_REFLECT)
    return c

def fin(c, t):
    g = np.random.default_rng(int(t * FPS)).standard_normal((H, W, 1)).astype(np.float32) * 3.0
    return np.clip(c + g, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    mode = ARGV[2]
    if mode == 'still':
        t = float(ARGV[3]); save(fin(frame(t), t), ARGV[4])
    elif mode == 'render':
        part, n = int(ARGV[3]), int(ARGV[4]); N = int(DUR * FPS)
        os.makedirs(B + f'op_{K}', exist_ok=True)
        for i in range(part, N, n):
            p = B + f'op_{K}/f{i:04d}.jpg'
            if os.path.exists(p): continue
            cv2.imwrite(p, fin(frame(i / FPS), i / FPS), [cv2.IMWRITE_JPEG_QUALITY, 95])
        print('done', part)
