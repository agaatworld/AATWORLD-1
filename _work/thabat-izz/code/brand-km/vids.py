# Kalima Muqawama — B «Imperial Archive» motion pieces
# python3 vids.py <name> render <part> <nparts>  |  python3 vids.py <name> finish
# names: outro, sting, captions, kinetic, trans
from km import *
import soundfile as sf, subprocess, json
W, H, FPS = 1080, 1920, 30
NAME = ARGS[1]; MODE = ARGS[2]
OUTV = B + f'v_{NAME}/'
SFX = S_ + 'sfxmk/'
xx, yy = mg.xx, mg.yy

def sh(rgba, k=0.7, blur=14):
    return np.dstack([np.zeros(rgba.shape[:2] + (3,), np.float32), cv2.GaussianBlur(rgba[..., 3], (0, 0), blur) * k])
def iris_mask(cx, cy, r, soft=3.0):
    return np.clip((r - np.hypot(xx - cx, yy - cy)) / soft, 0, 1)[..., None]
def head_spark(c, cx, cy, r, ang, k=1.0, col=BRONZE_L):
    a = np.deg2rad(ang); return spark(c, cx + np.sin(a) * r, cy - np.cos(a) * r, col, k)
def plate_line(words, size=70, fk='almarai'):
    """words: [(w, col)] → list of (img, x_offset) laid RTL, shared baseline; returns imgs, total width"""
    f = font(fk, size); sp = size * 0.28; imgs = [rtl_line([(w, col)], fk, size) for w, col in words]
    ws = [f.getlength(w, direction='rtl', language='ar') for w, _ in words]; tot = sum(ws) + sp * (len(ws) - 1)
    return imgs, ws, tot, sp

# ============================================================== OUTRO (4.0 s)
def outro_setup():
    global G_OUT, L900, R900, SLOG
    G_OUT = archive_ground(H, W, seed=61); L900 = logo_rgba(900)
    y_, x_ = np.mgrid[0:900, 0:900].astype(np.float32); R900 = np.hypot(x_ - 450, y_ - 450)
    SLOG = text([('كلنا مقاومة', BRONZE_L)], 'almarai', 56)
def outro(t):
    c = G_OUT.copy(); c = c * (0.35 + 0.65 * ease(seg(t, 0, 0.4)))
    ra = ease(seg(t, 0.0, 1.0))
    for r, a_, w, tk, sp_ in ((560, 0.35, 2, 72, 5), (640, 0.22, 2, 120, -3), (760, 0.12, 2, 0, 0)):
        c = ring(c, 540, 900, r * (1.15 - 0.15 * ra), SILVER, a_ * ra, w, ticks=tk, tick_len=7, rot=sp_ * t)
    p = ease(seg(t, 0.15, 1.15))
    if p > 0:
        c = ring(c, 540, 900, 505, BRONZE_L, 1.0, 4, arc=(0, 360 * p))
        if p < 1: c = head_spark(c, 540, 900, 505, 360 * p)
    ir = ease(seg(t, 0.55, 1.35))
    if ir > 0:
        L = L900.copy(); L[..., 3] = L[..., 3] * np.clip((ir * 470 - R900) / 3, 0, 1)
        shn = seg(t, 1.5, 2.2)
        if 0 < shn < 1:
            v = (np.arange(900)[None, :] + np.arange(900)[:, None] * 0.7) / (900 * 1.7)
            hl = np.exp(-((v - (shn * 1.4 - 0.2)) / 0.05) ** 2)[..., None]; L[..., :3] = L[..., :3] + (255 - L[..., :3]) * hl * 0.45
        s = 0.9 + 0.1 * ease(seg(t, 0.55, 1.7))
        c = mg.put(c, sh(L, 0.6, 18), 548, 916, s); c = mg.put(c, L, 540, 900, s)
    fl = np.exp(-max(0, t - 1.40) / 0.15) if t >= 1.40 else 0
    if fl > 0.01: c = c + (BRONZE_L - c) * np.exp(-((xx - 540) ** 2 + (yy - 900) ** 2) / (2 * 620 ** 2))[..., None] * 0.12 * fl
    sl = ease(seg(t, 1.7, 2.3))
    if sl > 0:
        ys = 1450; c = mg.put(c, SLOG, 540, ys + 14 * (1 - sl), 1.0, sl)
        hw = SLOG.shape[1] / 2 + 28
        for sg in (-1, 1): c = hair(c, 540 + sg * hw, ys, 540 + sg * (hw + 100 * sl), ys, BRONZE_L, sl, 3)
    cl = eio(seg(t, 3.25, 3.95))
    if cl > 0:
        R = 1250 * (1 - cl); m = np.clip((np.hypot(xx - 540, yy - 900) - R) / 4, 0, 1)[..., None]; c = c * (1 - m) + DEEP * m
        if 0.02 < cl < 0.98: c = ring(c, 540, 900, R, BRONZE_L, 0.9, 4)
    return c
def outro_audio():
    return [(2350, 0.62, 0.457, -12), (2902, 1.40, 1.304, -4), (2353, 1.85, 1.023, -12), (1296, 1.75, 0.492, -18), (1492, 3.55, 1.079, -10)]

# ============================================================== STING (1.5 s)
def sting_setup():
    global G_ST, L520
    G_ST = archive_ground(H, W, seed=71); L520 = logo_rgba(520)
def sting(t):
    c = G_ST.copy()
    p = ease(seg(t, 0.0, 0.42))
    c = ring(c, 540, 900, 330, BRONZE_L, 1.0, 5, arc=(0, 360 * p))
    if p < 1: c = head_spark(c, 540, 900, 330, 360 * p)
    c = ring(c, 540, 900, 380 + 120 * ease(seg(t, 1.0, 1.5)), SILVER, 0.4 * (1 - seg(t, 1.0, 1.5)), 2, ticks=72, tick_len=7, rot=40 * t)
    s = back(seg(t, 0.30, 0.62)) * (1 + 0.6 * ease(seg(t, 1.05, 1.5))); a = min(1, seg(t, 0.30, 0.4)) * (1 - ease(seg(t, 1.15, 1.5)))
    if s > 0.01:
        c = mg.put(c, sh(L520, 0.6, 16), 546, 914, s, a); c = mg.put(c, L520, 540, 900, s, a, blur=6 * seg(t, 1.1, 1.5))
    fl = np.exp(-max(0, t - 0.42) / 0.12) if t >= 0.42 else 0
    if fl > 0.01: c = c + (PARCH - c) * np.exp(-((xx - 540) ** 2 + (yy - 900) ** 2) / (2 * 380 ** 2))[..., None] * 0.35 * fl
    return c
def sting_audio():
    return [(1492, 0.28, 1.079, -10), (788, 0.42, 2.172, -3), (2353, 0.62, 1.023, -14)]

# ============================================================== CAPTIONS demo (Dhawila film 9.3–17.5 s)
T0C = 9.3; DUR_C = 8.2
CAPL = [(9.61, 11.5, [('أمام', 't'), ('رائد', 't'), ('ورفاقه', 't'), ('سؤال', 'k'), ('صعب', 'e')], [9.61, 10.07, 10.41, 10.83, 11.21]),
        (11.57, 12.98, [('هيا', 't'), ('كيف', 't'), ('نواجه', 't'), ('هجوم', 't'), ('ليلي', 't')], [11.57, 11.81, 12.09, 12.37, 12.67]),
        (13.01, 14.25, [('وإحنا', 't'), ('ما', 't'), ('معاناش', 't'), ('ذخيرة', 'k'), ('كثير؟', 'k')], [13.01, 13.27, 13.39, 13.63, 13.87]),
        (14.55, 16.25, [('قال', 't'), ('لهم:', 't'), ('اجلسوا', 't'), ('وفكّروا', 'k')], [14.55, 14.69, 14.99, 15.55]),
        (16.29, 17.12, [('من', 'k'), ('خارج', 'k'), ('الصندوق', 'k')], [16.29, 16.39, 16.65])]
COLS = {'t': PARCH, 'k': BRONZE_L, 'e': SEAL_L}
def captions_setup():
    global BG1, BG2, CL, AV
    BG1 = bg_from(still('gather'), fy=0.42, z=1.08, k=1.0); BG2 = bg_from(still('think'), fy=0.45, z=1.08)
    CL = []
    for a, b, ws, st in CAPL:
        imgs, wl, tot, sp = plate_line([(w, COLS[k]) for w, k in ws], 70)
        xs = []; x = 540 + tot / 2
        for wd in wl: xs.append(x - wd / 2); x -= wd + sp
        CL.append(dict(a=a, b=b, imgs=imgs, wl=wl, xs=xs, st=st, tot=tot, kinds=[k for _, k in ws]))
    AV = None
def captions(t):
    ft = T0C + t
    def push(bg, t0, t1):
        z = 1.0 + 0.06 * seg(ft, t0, t1); M = cv2.getRotationMatrix2D((540, 860), 0, z); M[0, 2] -= 14 * seg(ft, t0, t1)
        return cv2.warpAffine(bg, M, (W, H), borderMode=cv2.BORDER_REFLECT)
    A = push(BG1, 9.3, 14.6)
    if ft < 14.35: c = A
    else:
        Bc = push(BG2, 14.35, 17.5); p = ease(seg(ft, 14.35, 14.75))
        m = iris_mask(540, 860, p * 1250, 4); c = A * (1 - m) + Bc * m
        if 0 < p < 1: c = ring(c, 540, 860, p * 1250, BRONZE_L, 1.0, 5)
    band = np.clip((yy - 1050) / 500, 0, 1)[..., None] ** 1.3; c = c * (1 - 0.42 * band)
    y = 1330
    for L in CL:
        if not (L['a'] - 0.2 <= ft < L['b'] + 0.45): continue
        pin = ease(seg(ft, L['a'] - 0.2, L['a'] + 0.05)); pout = ease(seg(ft, L['b'] + 0.15, L['b'] + 0.45)); a = pin * (1 - pout)
        pw = int(L['tot'] + 70); P = plate(pw, 118, 30, INK, 0.84, edge=BRONZE * 0.95)
        c = mg.put(c, P, 540, y - 4, 1.0, a)
        nxt = L['st'][1:] + [L['b']]
        for i, (im, x, wd) in enumerate(zip(L['imgs'], L['xs'], L['wl'])):
            if ft < L['st'][i]: continue
            q = ft - L['st'][i]; aa = min(1, q / 0.1) * (1 - pout)
            c = mg.put(c, im, x, y + 12 * (1 - ease(q / 0.2)), 1.0 + 0.06 * (1 - ease(q / 0.18)), aa)
            if L['st'][i] <= ft < nxt[i] + 0.03:
                col = SEAL_L if L['kinds'][i] == 'e' else BRONZE_L
                c = hair(c, x - wd / 2 + 2, y + 40, x + wd / 2 - 2, y + 40, col, aa, 5)
    c = mg.put(c, logo_rgba(118), 118, 348)
    return c
def captions_audio(): return []

# ============================================================== KINETIC demo (v9 speaker voice 0–13.3 s)
DUR_K = 13.3
def kinetic_setup():
    global GK, GKL, QP, SEAL1, SEAL2, CARD, T, LOGO118, CRED
    GK = archive_ground(H, W, seed=81); GKL = archive_ground(H, W, seed=82, light=True)
    QP = cover_fit(grade(still('qpage'), 0.3), 640, 640, fy=0.4)
    SEAL1 = seal_stamp(760, BRONZE_L); SEAL2 = seal_stamp(380, SEAL_L)
    CARD = card(900, 760, light=True)
    T = dict(sajjil=text([('سجل', PARCH)], 'naskh', 320), ya=text([('يا', BRONZE_L), ('تاريخ', BRONZE_L)], 'naskh', 180),
             w1=rtl_line([('أن', INK)], 'naskh', 120), w2=rtl_line([('أول', INK)], 'naskh', 120), w3=rtl_line([('منجزٍ', BRONZE_D)], 'naskh', 120), w4=rtl_line([('صنعته', INK)], 'naskh', 120),
             kadh=text([('أكذوبة', SEAL_L)], 'naskh', 230), masira=text([('المسيرة', PARCH), ('القرآنية', PARCH)], 'naskh', 104),
             tabia=text([('التابعة للحركة', SILVER)], 'plex', 66), huth=text([('الحوثية', PARCH)], 'naskh', 230), irh=text([('الإرهابية', SEAL_L)], 'naskh', 210),
             ighlaq=text([('إغلاق', BRONZE_L)], 'naskh', 210), marakiz=text([('مراكز', PARCH), ('تحفيظ', PARCH)], 'naskh', 104), quran=text([('القرآن', BRONZE_L), ('الكريم', BRONZE_L)], 'naskh', 104))
    LOGO118 = logo_rgba(118); CRED = credit('المصدر: نفحات جهادية', 30)
def slam(c, img, x, y, t0, t, rot=0.0, big=1.5, dur=0.16, shake=10):
    q = t - t0
    if q < 0: return c
    s = 1.0 + (big - 1) * (1 - ease(q / dur)); a = min(1, q / 0.06)
    jx = shake * np.sin(q * 90) * np.exp(-q / 0.12) if q < 0.5 else 0
    c = mg.put(c, sh(img, 0.7, 12), x + 8 + jx, y + 14, s, a, rot=rot); return mg.put(c, img, x + jx, y, s, a, rot=rot)
def stack_pos(imgs, cy, gaps):
    """centres of vertically stacked images so the whole group is centred on cy"""
    hs = [im.shape[0] for im in imgs]; tot = sum(hs) + sum(gaps); y = cy - tot / 2; out = []
    for k, h in enumerate(hs):
        out.append(y + h / 2); y += h + (gaps[k] if k < len(gaps) else 0)
    return out
def line_words(words, fk, size, cx):
    """one RTL line centred on cx: returns [(img, x)] in reading order (shared baseline)"""
    f = font(fk, size); sp = size * 0.32; ws = [f.getlength(w, direction='rtl', language='ar') for w, _ in words]
    tot = sum(ws) + sp * (len(ws) - 1); x = cx + tot / 2; out = []
    for (w, col), wl in zip(words, ws):
        out.append((rtl_line([(w, col)], fk, size), x - wl / 2)); x -= wl + sp
    return out
def kinetic(t):
    # ---- scene A 0–1.3: «سجل» stamped inside a seal, «يا تاريخ» under the seal (one centre axis x=540)
    if t < 1.3:
        c = GK.copy(); SY = 760
        c = slam(c, SEAL1, 540, SY, 0.0, t, big=1.35, dur=0.2, shake=0)
        c = slam(c, T['sajjil'], 540, SY, 0.02, t, big=1.45, dur=0.18, shake=14)
        w = ease(seg(t, 0.62, 1.0)); yy_ = SY + 357 + 60 + T['ya'].shape[0] / 2
        if w > 0: c = mg.put(c, T['ya'], 540, yy_, 1.0, 1.0, wipe=w)
    # ---- scene B 1.15–6.6: archive card, words typed on a centred two-line grid, stamp centred below
    if 1.0 <= t < 6.6:
        Cb = GKL.copy() if t >= 1.15 else None
        if Cb is not None:
            up = ease(seg(t, 1.15, 1.5)); dy = 260 * (1 - up); CY = 860
            Cb = mg.put(Cb, sh(CARD, 0.35, 20), 552, CY + 22 + dy); Cb = mg.put(Cb, CARD, 540, CY + dy)
            L1 = line_words([('أن', INK), ('أول', INK)], 'naskh', 120, 540); L2 = line_words([('منجزٍ', BRONZE_D), ('صنعته', INK)], 'naskh', 120, 540)
            times = [1.18, 1.76, 2.18, 2.82]
            for (img, x), y, t0 in zip(L1 + L2, [640, 640, 800, 800], times):
                if t >= t0:
                    q = t - t0; Cb = mg.put(Cb, img, x, y + dy - 8 * (1 - ease(q / 0.12)), 1.0, min(1, q / 0.08))
            if t >= 4.04:
                Cb = slam(Cb, SEAL2, 540, 1045 + dy, 4.04, t, big=1.6, dur=0.14, shake=0)
                Cb = slam(Cb, T['kadh'], 540, 1040 + dy, 4.06, t, big=1.6, dur=0.14, shake=16)
            if t >= 4.72:
                q = t - 4.72; bw = int(900 * ease(seg(t, 4.72, 5.0)))
                if bw > 4:
                    band = np.dstack([np.broadcast_to(ROYAL, (150, bw, 3)).astype(np.float32), np.ones((150, bw), np.float32)])
                    Cb = mg.put(Cb, band, 540, 1355)
                Cb = mg.put(Cb, T['masira'], 540, 1355 + 20 * (1 - ease(q / 0.3)), 1.0, min(1, q / 0.2))
            if t < 1.3:
                p = ease(seg(t, 1.0, 1.3)); xe = W * (1 - p) * 1.1 - 50
                m = np.clip((xx - xe) / 6, 0, 1)[..., None]; c = c * (1 - m) + Cb * m
                c = hair(c, xe, 0, xe - 120, H, BRONZE_L, 1.0, 6) if 0 < p < 1 else c
            else: c = Cb
    # ---- scene C 6.2–10.0: rings centred at (540, 920); the 3-line group is centred on the ring centre
    if 6.2 <= t < 10.0:
        Cc = GK.copy(); RC = 920
        for r, a_ in ((420, 0.3), (520, 0.18), (640, 0.1)): Cc = ring(Cc, 540, RC, r, SILVER, a_, 2, ticks=72 if r == 420 else 0, tick_len=7, rot=6 * t)
        ys = stack_pos([T['tabia'], T['huth'], T['irh']], RC, [40, 14])
        if t >= 6.38: Cc = mg.put(Cc, T['tabia'], 540, ys[0], 1.0, min(1, (t - 6.38) / 0.25))
        Cc = slam(Cc, T['huth'], 540, ys[1], 8.38, t, big=1.5, shake=14)
        Cc = slam(Cc, T['irh'], 540, ys[2], 8.96, t, big=1.5, shake=16)
        if t >= 9.0:
            hw = T['irh'].shape[1] / 2 - 10; yl = ys[2] + T['irh'].shape[0] / 2 + 22
            p = ease(seg(t, 9.0, 9.4)); Cc = hair(Cc, 540 + hw, yl, 540 + hw - 2 * hw * p, yl, BRONZE_L, 1.0, 5)
        if t < 6.55:
            p = ease(seg(t, 6.2, 6.55)); m = iris_mask(540, RC, p * 1250, 4); c = c * (1 - m) + Cc * m
            if 0 < p < 1: c = ring(c, 540, RC, p * 1250, BRONZE_L, 1.0, 5)
        else: c = Cc
    # ---- scene D 9.7–13.3: Quran page in a circle that CLOSES on «إغلاق»; text stack under the circle
    if t >= 9.7:
        Cd = GK.copy(); QC = 640
        for r, a_ in ((360, 0.32), (420, 0.18)): Cd = ring(Cd, 540, QC, r, SILVER, a_, 2, ticks=72 if r == 360 else 0, tick_len=7, rot=-5 * t)
        op = ease(seg(t, 9.75, 10.1)); cl = ease(seg(t, 10.42, 10.95)); r = 320 * op * (1 - cl)
        if r > 1:
            Q = np.dstack([QP, np.clip((r - np.hypot(np.arange(640)[None, :] - 320, np.arange(640)[:, None] - 320)) / 2.5, 0, 1)])
            Cd = mg.put(Cd, Q, 540, QC); Cd = ring(Cd, 540, QC, r + 3, BRONZE_L, 1.0, 5)
        if cl >= 1: Cd = ring(Cd, 540, QC, 6, BRONZE_L, 1.0, 6)
        grp = [T['ighlaq'], T['marakiz'], T['quran']]; gaps = [22, 18]; top = QC + 420 + 30
        ys = stack_pos(grp, top + (sum(g.shape[0] for g in grp) + sum(gaps)) / 2, gaps)
        Cd = slam(Cd, T['ighlaq'], 540, ys[0], 10.4, t, big=1.5, shake=14)
        if t >= 11.04:
            q = t - 11.04; Cd = mg.put(Cd, T['marakiz'], 540, ys[1] + 24 * (1 - ease(q / 0.3)), 1.0, min(1, q / 0.2))
        if t >= 12.24:
            q = t - 12.24; Cd = mg.put(Cd, T['quran'], 540, ys[2] + 24 * (1 - ease(q / 0.3)), 1.0, min(1, q / 0.2))
            hw = T['quran'].shape[1] / 2 - 10; yl = ys[2] + T['quran'].shape[0] / 2 + 18
            p = ease(seg(t, 12.5, 12.95)); Cd = hair(Cd, 540 + hw, yl, 540 + hw - 2 * hw * p, yl, BRONZE_L, 1.0, 4)
        if t < 9.95:
            p = ease(seg(t, 9.7, 9.95)); xe = W * (1 - p) * 1.1 - 50
            m = np.clip((xx - xe) / 6, 0, 1)[..., None]; c = c * (1 - m) + Cd * m
            if 0 < p < 1: c = hair(c, xe, 0, xe - 120, H, BRONZE_L, 1.0, 6)
        else: c = Cd
    c = mg.put(c, LOGO118, 118, 348); c = mg.put(c, CRED, 59 + CRED.shape[1] / 2, 348 + 59 + 18 + CRED.shape[0] / 2)
    fo = ease(seg(t, 12.95, 13.3)); c = c * (1 - 0.85 * fo)
    return c
def kinetic_audio():
    return [(2908, 0.02, 0.925, -9), (1492, 1.15, 1.079, -14), (1280, 4.05, 0.493, -10), (1492, 6.4, 1.079, -14), (1286, 8.38, 0.594, -10),
            (2186, 8.96, 0.108, -12), (2350, 9.85, 0.457, -14), (1687, 10.4, 0.06, -8), (2353, 12.5, 1.023, -16)]

# ============================================================== TRANSITIONS (14 × 1.2 s)
TDUR = 1.2
TR = [('circle', 'village', 'gather', 'مسح دائري'), ('metal', 'gather', 'think', 'مسح بخط معدني'), ('arch', 'think', 'mosque', 'قناع معماري (قوس)'),
      ('tunnel', 'mosque', 'grads', 'نفق منظوري'), ('layers', 'grads', 'qpage', 'كشف فوتوغرافي بطبقات'), ('typo', 'qpage', 'village', 'انتقال بالكلمة'),
      ('emblem', 'village', 'sit', 'انتقال الشارة الدائرية'), ('rotate', 'sit', 'peak', 'دوران هندسي'), ('push', 'peak', 'gather', 'اندفاع الكاميرا'),
      ('displace', 'gather', 'mosque', 'إزاحة محكومة'), ('match', 'village', 'grads', 'قطع مطابق'), ('parallax', 'village', 'gather', 'انتقال بالعمق'),
      ('object', 'think', 'sit', 'انتقال بجسم ثلاثي الأبعاد'), ('line', 'sit', 'village', 'رسم الخط البرونزي')]
TSFX = {'circle': [(1492, 0.6, 1.079, -10)], 'metal': [(2350, 0.55, 0.457, -10)], 'arch': [(1492, 0.6, 1.079, -10)], 'tunnel': [(2918, 0.62, 3.037, -10)],
        'layers': [(1492, 0.45, 1.079, -14), (1492, 0.7, 1.079, -16)], 'typo': [(2902, 0.7, 1.304, -10)], 'emblem': [(788, 0.45, 2.172, -8), (2353, 0.75, 1.023, -16)],
        'rotate': [(1492, 0.55, 1.079, -10)], 'push': [(2918, 0.6, 3.037, -10)], 'displace': [(2599, 0.6, 3.8, -16)], 'match': [(2353, 0.55, 1.023, -12)],
        'parallax': [(1492, 0.6, 1.079, -12)], 'object': [(784, 0.6, 0.123, -10)], 'line': [(2350, 0.4, 0.457, -12), (2353, 0.75, 1.023, -14)]}
def trans_setup():
    global FR, DEPTH, LETTER, LZ, LOGO600, ARCH
    ARCH = mg.arch_mask(540, 1056, top=0.30)
    src = {'village': still('village'), 'gather': still('gather'), 'think': still('think'), 'sit': still('sit'), 'mosque': still('mosque'), 'peak': still('peak'),
           'qpage': still('qpage'), 'grads': video_frame('v10/src/in_h264.mp4', 3.4)}
    FR = {k: bg_from(v, fy=0.3 if k == 'village' else 0.45) for k, v in src.items()}
    DEPTH = {}
    for k, f in (('village', 'A_depth.png'), ('gather', 'D_depth.png')):
        dm = cv2.imread(S_ + 'dw/anim/img/' + f, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
        DEPTH[k] = cover_fit(np.dstack([dm] * 3), W, H, fy=0.3 if k == 'village' else 0.45)[..., 0]
    Lr = cv2.imread(B + 'cache/B_refined.png').astype(np.float32)
    mt = M_TEXT.copy(); mt[:100] = 0; mt[480:] = 0
    ys, xs = np.where(mt > 0.02); a0, a1, b0, b1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5
    LETTER = mt[a0:a1, b0:b1]
    dt = cv2.distanceTransform((LETTER > 0.5).astype(np.uint8), cv2.DIST_L2, 5); yx = np.unravel_index(np.argmax(dt), dt.shape); LZ = (yx[1], yx[0])
    LOGO600 = logo_rgba(600)
def zoom_about(img, cx, cy, z, tx=None, ty=None):
    tx = cx if tx is None else tx; ty = cy if ty is None else ty
    M = np.float32([[z, 0, tx - z * cx], [0, z, ty - z * cy]]); return cv2.warpAffine(img, M, (W, H), borderMode=cv2.BORDER_REFLECT)
def tframe(i, t):
    kind, ka, kb, _ = TR[i]; A0, B0 = FR[ka], FR[kb]
    A = zoom_about(A0, 540, 960, 1.0 + 0.03 * t / TDUR); Bm = zoom_about(B0, 540, 960, 1.03 - 0.03 * t / TDUR)
    p = seg(t, 0.15, 0.95); e = ease(p); ei = eio(p)
    if p <= 0: return A
    if p >= 1 and kind not in ('line',): return Bm
    if kind == 'circle':
        r = e * 1200; m = iris_mask(540, 960, r, 4); c = A * (1 - m) + Bm * m
        c = ring(c, 540, 960, r, BRONZE_L, 1.0, 6); return ring(c, 540, 960, max(0, r - 40), SILVER, 0.5, 2)
    if kind == 'metal':
        xe = W + 300 - ei * (W + 700); m = np.clip(((xx - xe) + (yy - 960) * 0.27) / 5, 0, 1)[..., None]; c = A * (1 - m) + Bm * m
        ln = np.clip(1 - np.abs((xx - xe) + (yy - 960) * 0.27) / 5, 0, 1); gl = np.exp(-(((xx - xe) + (yy - 960) * 0.27) / 40) ** 2)
        return c + (BRONZE_L - c) * ln[..., None] + (PARCH - c) * (gl * 0.35)[..., None]
    if kind == 'arch':
        s = 0.05 + 1.9 * e; aw, ah = int(W * s), int(H * 1.1 * s)
        if aw < 4: return A
        am = cv2.resize(ARCH, (aw, ah), interpolation=cv2.INTER_LINEAR); m = np.zeros((H, W), np.float32)
        x0 = 540 - aw // 2; y0 = H - ah
        xs0, ys0 = max(0, x0), max(0, y0); xs1, ys1 = min(W, x0 + aw), H
        m[ys0:ys1, xs0:xs1] = am[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
        edge = cv2.dilate(m, np.ones((7, 7), np.uint8)) - m
        c = A * (1 - m[..., None]) + Bm * m[..., None]; return c + (BRONZE_L - c) * edge[..., None]
    if kind == 'tunnel':
        Az = zoom_about(A0, 540, 960, 1 + 2.2 * ei); r = ei * 1150; m = iris_mask(540, 960, r, 30)
        Bz = zoom_about(B0, 540, 960, 0.5 + 0.5 * e); c = Az * (1 - m) + Bz * m
        for k in range(5):
            rr = ((p * 2.2 + k / 5) % 1.0) ** 2 * 1300; c = ring(c, 540, 960, rr, BRONZE_L if k % 2 else SILVER, 0.6 * (1 - p), 3)
        return c
    if kind == 'layers':
        c = A.copy()
        for k in range(3):
            q = ease(seg(p, k * 0.18, k * 0.18 + 0.55)); y0 = k * 640; strip = Bm[y0:y0 + 640]
            fr_ = np.dstack([strip, np.ones(strip.shape[:2], np.float32)]); brd = np.zeros((660, W + 20, 4), np.float32); brd[..., :3] = PARCH; brd[..., 3] = 1
            brd[10:650, 10:W + 10] = fr_
            x = 540 + (1 - q) * (W + 200); rot = (-2.5 + k * 2) * (1 - q)
            c = mg.put(c, sh(brd, 0.5, 18), x + 10, y0 + 320 + 16, 1.0, 1.0, rot=rot); c = mg.put(c, brd, x, y0 + 320, 1.0, 1.0, rot=rot)
        return c
    if kind == 'typo':
        z = 0.7 * (1 + 40 * ei ** 2.6); lh, lw = LETTER.shape
        M = np.float32([[z, 0, 540 - z * LZ[0]], [0, z, 960 - z * LZ[1]]]); m = cv2.warpAffine(LETTER, M, (W, H))
        m = np.maximum(m, np.clip((p - 0.85) / 0.15, 0, 1))[..., None]
        c = A * (1 - m) + Bm * m
        e2 = cv2.warpAffine(cv2.dilate(LETTER, np.ones((3, 3), np.uint8)) - LETTER, M, (W, H)) * (1 - p)
        return c + (BRONZE_L - c) * np.clip(e2, 0, 1)[..., None]
    if kind == 'emblem':
        if p < 0.45:
            q = back(p / 0.45); c = mg.put(A.copy(), sh(LOGO600, 0.6, 18), 548, 978, q); return mg.put(c, LOGO600, 540, 960, q, 1.0, rot=90 * (1 - min(1, p / 0.45)))
        q = ease((p - 0.45) / 0.55); r = q * 1200; m = iris_mask(540, 960, r, 4); c = A * (1 - m) + Bm * m
        s = 1 + 4 * q; c = mg.put(c, LOGO600, 540, 960, s, 1 - q, blur=4 * q); return ring(c, 540, 960, r, BRONZE_L, 1 - q, 5)
    if kind == 'rotate':
        ang = (np.degrees(np.arctan2(xx - 540, -(yy - 960))) % 45) / 45
        m = (ang < e).astype(np.float32); m = cv2.GaussianBlur(m, (0, 0), 1.2)[..., None]
        Br = cv2.warpAffine(B0, cv2.getRotationMatrix2D((540, 960), -10 * (1 - e), 1.03), (W, H), borderMode=cv2.BORDER_REFLECT)
        c = A * (1 - m) + Br * m
        for k in range(8):
            an = np.deg2rad(45 * k + 45 * e); c = hair(c, 540, 960, 540 + np.sin(an) * 1400, 960 - np.cos(an) * 1400, BRONZE_L, 0.9 * (1 - p) + 0.1, 3)
        return c
    if kind == 'push':
        if p < 0.5:
            q = ease(p / 0.5); acc = 0
            for k, zz in enumerate(np.linspace(1, 1 + 1.4 * q, 6)): acc = acc + zoom_about(A0, 540, 960, zz)
            c = acc / 6
        else:
            q = ease((p - 0.5) / 0.5); acc = 0
            for zz in np.linspace(0.72 + 0.28 * q, 0.72 + 0.28 * q + 0.25 * (1 - q), 5): acc = acc + zoom_about(B0, 540, 960, zz)
            c = acc / 5
        fl = np.exp(-abs(p - 0.5) / 0.06); return c + (PARCH - c) * 0.35 * fl
    if kind == 'displace':
        amp = 46 * np.sin(np.pi * p); r = np.hypot(xx - 540, yy - 960)
        dx = amp * np.sin(r / 38 - p * 14); mx = (xx + dx * (xx - 540) / (r + 1)).astype(np.float32); my = (yy + dx * (yy - 960) / (r + 1)).astype(np.float32)
        Ad = cv2.remap(A, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); Bd = cv2.remap(Bm, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        k = eio(seg(p, 0.35, 0.65)); return Ad * (1 - k) + Bd * k
    if kind == 'match':
        mx, my = 778, 226
        if p < 0.5:
            q = ease(p / 0.5); z = 1 + 7 * q; return zoom_about(A0, mx, my, z, mx + (540 - mx) * q, my + (960 - my) * q)
        q = ease((p - 0.5) / 0.5); r = 300 + q * 950; m = iris_mask(540, 960, r, 3)
        Az = zoom_about(A0, mx, my, 8, 540, 960); c = Az * (1 - m) + Bm * m; return ring(c, 540, 960, r, BRONZE_L, 1 - q * 0.6, 5)
    if kind == 'parallax':
        xe = W * (1 - ei); dA = DEPTH['village']; dB = DEPTH['gather']
        offA = -ei * 420 * (0.35 + 0.65 * dA); offB = (1 - ei) * 420 * (0.35 + 0.65 * dB)
        Ad = cv2.remap(A0, (xx - offA).astype(np.float32), yy.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        Bd = cv2.remap(B0, (xx - offB).astype(np.float32), yy.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        m = np.clip((xx - xe) / 30, 0, 1)[..., None]; c = Ad * (1 - m) + Bd * m
        return hair(c, xe, 0, xe, H, BRONZE_L, 1.0 if 0 < p < 1 else 0, 4)
    if kind == 'object':
        th = np.pi * ei; sx = max(0.02, abs(np.cos(th))); s = 0.5 + 3.6 * ei ** 2
        c = A if ei < 0.5 else Bm
        face = LOGO600 if ei < 0.5 else np.dstack([np.broadcast_to(ROYAL, (600, 600, 3)).astype(np.float32), LOGO600[..., 3]])
        depth = int(26 * np.sin(th) * s) + 1; edge = np.dstack([np.broadcast_to(BRONZE_D, (600, 600, 3)).astype(np.float32), LOGO600[..., 3]])
        a = 1 - ease(seg(p, 0.75, 1.0))
        for k in range(0, depth, max(2, depth // 10)): c = mg.put(c, edge, 540 + k * (1 if ei < 0.5 else -1), 960, s, a, sx=sx)
        return mg.put(c, face, 540, 960, s, a, sx=sx)
    if kind == 'line':
        c = A.copy(); q1 = ease(seg(p, 0.0, 0.45)); c = ring(c, 540, 960, 420, BRONZE_L, 1.0, 5, arc=(0, 360 * q1))
        if q1 < 1: c = head_spark(c, 540, 960, 420, 360 * q1)
        q2 = ease(seg(p, 0.2, 0.5))
        for k in range(8):
            an = np.deg2rad(45 * k); c = hair(c, 540 + np.sin(an) * 430, 960 - np.cos(an) * 430, 540 + np.sin(an) * (430 + 700 * q2), 960 - np.cos(an) * (430 + 700 * q2), BRONZE_L, 0.8 * (1 - seg(p, 0.7, 1.0)), 2)
        q3 = ease(seg(p, 0.4, 0.65)); q4 = ease(seg(p, 0.65, 1.0)); r = 420 * q3 + 800 * q4
        if r > 0:
            m = iris_mask(540, 960, r, 3); c = c * (1 - m) + Bm * m; c = ring(c, 540, 960, r + 2, BRONZE_L, 1 - q4, 5)
        return c
    return Bm
LAB = {}
def trans_label(i):
    if i not in LAB:
        _, _, _, ar = TR[i]; im = text([(f'{i + 1:d}  ' + ar, PARCH)], 'almarai', 48); h, w = im.shape[:2]
        P = plate(w + 60, h + 26, (h + 26) // 2, INK, 0.82, edge=BRONZE); rgb = paste(P[..., :3].copy(), im, (w + 60) / 2, (h + 26) / 2)
        LAB[i] = np.dstack([rgb, P[..., 3]])
    return LAB[i]

# ============================================================== render / finish
SPEC = {'outro': (4.0, outro_setup, outro, outro_audio), 'sting': (1.5, sting_setup, sting, sting_audio),
        'captions': (DUR_C, captions_setup, captions, captions_audio), 'kinetic': (DUR_K, kinetic_setup, kinetic, kinetic_audio)}
def fin(c, i):
    g = np.random.default_rng(i).standard_normal((H, W, 1)).astype(np.float32) * 2.6
    return np.clip(c + g, 0, 255).astype(np.uint8)
def mix(events, dur, voice=None, voice_db=0.0):
    SR = 48000; out = np.zeros((int(SR * dur) + 1, 2))
    if voice is not None:
        v, sr = voice; v = v if v.ndim == 2 else np.c_[v, v]
        if sr != SR:
            idx = np.arange(0, len(v), sr / SR); v = np.stack([np.interp(idx, np.arange(len(v)), v[:, ch]) for ch in range(2)], 1)
        n = min(len(v), len(out)); out[:n] += v[:n] * 10 ** (voice_db / 20)
    for sid, at, peak, db in events:
        x, sr = sf.read(SFX + f'{sid}.wav'); x = np.c_[x, x] if x.ndim == 1 else x[:, :2]
        st = at - peak; off = 0
        if st < 0: off = int(-st * SR); st = 0
        x = x[off:]; a = int(st * SR); n = min(len(x), len(out) - a)
        if n > 0: out[a:a + n] += x[:n] * 10 ** (db / 20)
    t = np.arange(len(out)) / SR; out *= np.clip((dur - t) / 0.25, 0, 1)[:, None]
    return out, SR
def encode(frames_dir, wav, out, fps=30):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', frames_dir + 'f%04d.jpg', '-i', wav, '-map', '0:v', '-map', '1:a',
                    '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-maxrate', '8M', '-bufsize', '16M',
                    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)

if __name__ == '__main__':
    os.makedirs(OUTV, exist_ok=True)
    if NAME == 'trans':
        trans_setup(); N = int(TDUR * FPS)
        if MODE == 'render':
            part, n = int(ARGS[3]), int(ARGS[4])
            jobs = [(i, k) for i in range(len(TR)) for k in range(N)]
            for j, (i, k) in enumerate(jobs):
                if j % n != part: continue
                os.makedirs(OUTV + f't{i:02d}/', exist_ok=True); p = OUTV + f't{i:02d}/f{k:04d}.jpg'
                if os.path.exists(p): continue
                cv2.imwrite(p, fin(tframe(i, k / FPS), i * 100 + k), [cv2.IMWRITE_JPEG_QUALITY, 94])
            print('done', part)
        else:
            outd = FINAL + 'Transitions/'; os.makedirs(outd, exist_ok=True); allw = []
            comp = OUTV + 'comp/'; os.makedirs(comp, exist_ok=True); fi = 0
            for i, (kind, _, _, ar) in enumerate(TR):
                w, SR = mix(TSFX[kind], TDUR); sf.write(OUTV + f't{i:02d}.wav', w, SR); allw.append(w[:int(SR * TDUR)])
                encode(OUTV + f't{i:02d}/', OUTV + f't{i:02d}.wav', outd + f'KM_Transition_{i + 1:02d}_{kind}.mp4')
                for k in range(N):
                    im = cv2.imread(OUTV + f't{i:02d}/f{k:04d}.jpg').astype(np.float32)
                    im = mg.put(im, trans_label(i), 540, 1440); cv2.imwrite(comp + f'f{fi:04d}.jpg', np.clip(im, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92]); fi += 1
            sf.write(OUTV + 'comp.wav', np.concatenate(allw), 48000)
            encode(comp, OUTV + 'comp.wav', outd + 'KM_Transitions_Library_All_14.mp4'); print('finished trans')
    else:
        dur, setup, fn, aud = SPEC[NAME]; setup(); N = int(round(dur * FPS))
        if MODE == 'render':
            part, n = int(ARGS[3]), int(ARGS[4])
            for k in range(part, N, n):
                p = OUTV + f'f{k:04d}.jpg'
                if os.path.exists(p): continue
                cv2.imwrite(p, fin(fn(k / FPS), k), [cv2.IMWRITE_JPEG_QUALITY, 94])
            print('done', part)
        elif MODE == 'still':
            t = float(ARGS[3]); cv2.imwrite(OUTV + f'still_{t}.jpg', fin(fn(t), 0))
        else:
            voice = None
            if NAME == 'captions':
                x, sr = sf.read(S_ + 'dw/anim/work/mix.wav'); voice = (x[int(T0C * sr):int((T0C + dur) * sr)], sr)
            if NAME == 'kinetic':
                x, sr = sf.read(S_ + 'v9/work/v1.wav'); voice = (x[:int(dur * sr)], sr)
            w, SR = mix(aud(), dur, voice); sf.write(OUTV + 'mix.wav', w, SR)
            names = {'outro': 'KM_Outro_4s', 'sting': 'KM_Sting_1.5s', 'captions': 'KM_Caption_System_Demo', 'kinetic': 'KM_Kinetic_Typography_Demo'}
            sub = {'outro': 'Logo_Animation/', 'sting': 'Logo_Animation/', 'captions': 'Captions/', 'kinetic': 'Kinetic_Typography/'}[NAME]
            os.makedirs(FINAL + sub, exist_ok=True); encode(OUTV, OUTV + 'mix.wav', FINAL + sub + names[NAME] + '.mp4'); print('finished', NAME)
