# B «Imperial Archive» templates + components + final logo files
# python3 tpl.py <group>   groups: logo covers carousel social components
from km import *
OUT = FINAL
def P(c, img, x, y, s=1.0, a=1.0, rot=0.0, shadow=0.0, blur=12):
    if shadow > 0: c = paste(c, np.dstack([np.zeros(img.shape[:2] + (3,), np.float32), cv2.GaussianBlur(img[..., 3], (0, 0), blur) * shadow]), x + 6, y + 12, s, 1.0, rot)
    return paste(c, img, x, y, s, a, rot)
def save_png(rgba, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = np.dstack([rgba[..., :3], rgba[..., 3] * 255]); cv2.imwrite(path, np.clip(out, 0, 255).astype(np.uint8))
def sv(c, path, q=94): save(finish(c, 2.0, seed=len(path)), path, q)
def slogan(c, x, y, col=BRONZE_L, size=46, rule=110):
    sl = text([('كلنا مقاومة', col if col is not None else BRONZE_L)], 'almarai', size); c = P(c, sl, x, y); hw = sl.shape[1] / 2 + 24
    for sg in (-1, 1): c = hair(c, x + sg * hw, y, x + sg * (hw + rule), y, col, 1.0, 3)
    return c
def mark(c, x, y, size=118):
    av = logo_rgba(size); ring_ = np.dstack([np.broadcast_to(BRONZE_L, av.shape[:2] + (3,)).astype(np.float32), cv2.dilate(av[..., 3], np.ones((3, 3), np.uint8), iterations=3)])
    c = P(c, ring_, x, y, shadow=0.5); return P(c, av, x, y)
def title_block(c, lines, x, ytop, gap=20, shadow=0.75):
    y = ytop
    for img in lines:
        h = img.shape[0]; c = P(c, img, x, y + h / 2, shadow=shadow, blur=14); y += h + gap
    return c, y
def lettering():
    """the logo's own «الكلمة» and «مقاومة» letterforms (B colours), as RGBA crops"""
    L = cv2.imread(B + 'cache/B_refined.png').astype(np.float32); out = []
    for y0, y1 in ((100, 480), (1580, 1970)):
        mt = M_TEXT.copy(); mt[:y0] = 0; mt[y1:] = 0; ys, xs = np.where(mt > 0.02)
        a0, a1, b0, b1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5; out.append(np.dstack([L[a0:a1, b0:b1], mt[a0:a1, b0:b1]]))
    return out

# ------------------------------------------------------------------ final logo files
def g_logo():
    d_ = OUT + 'Brand_Identity/Logo/'; os.makedirs(d_, exist_ok=True)
    import shutil; shutil.copy(B + 'logo.png', d_ + 'KM_Logo_00_ORIGINAL_untouched.png')
    for k, n in (('refined', '01_B_refined'), ('dark', '02_B_dark'), ('light', '03_B_light')):
        shutil.copy(B + f'cache/B_{k}.png', d_ + f'KM_Logo_{n}_2048.png')
    import sheets
    cv2.imwrite(d_ + 'KM_Logo_04_B_mono_bronze_2048.png', np.clip(mono(BRONZE_L, INK), 0, 255).astype(np.uint8))
    cv2.imwrite(d_ + 'KM_Logo_05_B_mono_ink_2048.png', np.clip(sheets.dark_ink_mono(INK, PARCH), 0, 255).astype(np.uint8))
    for sz in (1080, 512, 400, 180, 96):
        save_png(logo_rgba(sz), d_ + f'KM_Profile_Avatar_B_{sz}.png')
    L = cv2.imread(B + 'cache/B_refined.png').astype(np.float32)
    crop, m = circle_crop(L, R_SLATE - 6, cx=PC[0], cy=PC[1], out=512); save_png(np.dstack([crop, m]), d_ + 'KM_Emblem_OPTION_needs_approval_512.png')
    for sz in (64, 48, 32):
        crop, m = circle_crop(L, R_SLATE - 6, cx=PC[0], cy=PC[1], out=sz); save_png(np.dstack([crop, m]), d_ + f'KM_Emblem_OPTION_favicon_{sz}.png')
    # watermark: avatar + bronze ring, and a placement guide
    av = logo_rgba(150); rg = cv2.dilate(av[..., 3], np.ones((3, 3), np.uint8), iterations=4)
    wm = np.zeros((170, 170, 4), np.float32); wm[..., :3] = BRONZE_L; wm[..., 3] = 0
    wm = np.dstack([paste(np.broadcast_to(BRONZE_L, (170, 170, 3)).astype(np.float32).copy(), av, 85, 85), cv2.copyMakeBorder(rg, 10, 10, 10, 10, cv2.BORDER_CONSTANT)])
    save_png(wm, OUT + 'Logo_Animation/KM_Watermark_Corner_170px.png')
    g = bg_from(still('gather'), fy=0.42); g = g * 0.55
    for (y0, y1) in ((0, 270), (1500, 1920)): g[y0:y1] = g[y0:y1] * 0.4 + SEAL * 0.6 * 0.5
    g[:, 960:] = g[:, 960:] * 0.4 + SEAL * 0.3
    g = P(g, wm, 118, 348)
    for txt, x, y in (('العلامة هنا فقط (زاوية واحدة)', 540, 500), ('ممنوع النص: أعلى 270', 540, 135), ('ممنوع النص: أسفل 420', 540, 1700), ('يمين 120', 1000, 960)):
        g = P(g, label(txt, 40, PARCH, 'almarai'), x, y)
    sv(g, OUT + 'Logo_Animation/KM_Watermark_Placement_Guide_Reels.jpg')

# ------------------------------------------------------------------ Reels / TikTok covers (3 layouts) + blanks + safe guide
def cover_a(blank=False):
    c = bg_from(still('village'), fy=0.3); band = np.clip((mg.yy - 820) / 700, 0, 1)[..., None]; c = c * (1 - 0.62 * band) + INK * 0.62 * band
    for r, a, w, tk in ((120, 0.85, 3, 0), (165, 0.45, 2, 60), (250, 0.26, 2, 0)): c = ring(c, 778, 226, r, BRONZE_L, a, w, ticks=tk, tick_len=8)
    c = ring(c, 778, 226, 205, BRONZE_L, 0.9, 4, arc=(-40, 210)); c = spark(c, 778 + np.sin(np.deg2rad(210)) * 205, 226 - np.cos(np.deg2rad(210)) * 205, BRONZE_L, 0.9)
    if not blank:
        c, _ = title_block(c, [text([('معركة', PARCH)], 'naskh', 150), metal_text('ضاويله', 'naskh', 250, METAL), text([('الليلية', PARCH)], 'naskh', 140)], 540, 900, gap=6)
    c = slogan(c, 540, 1520); return mark(c, 118, 348)
def cover_b(blank=False):
    c = vignette(archive_ground(H := 1920, W := 1080, seed=91), 0.45, 540, 760)
    fr_ = video_frame('v10/src/in_h264.mp4', 3.4); D_ = 760; ph = cover_fit(grade(fr_, 0.25), D_, D_, fy=0.55)
    for r, a, w, tk, rot in ((430, 0.45, 2, 120, 3), (500, 0.28, 2, 72, -2), (600, 0.16, 2, 0, 0)): c = ring(c, 540, 760, r, SILVER, a, w, ticks=tk, tick_len=7, rot=rot)
    rm = round_mask(D_, D_, D_ // 2); c = P(c, np.dstack([ph, rm]), 540, 760, shadow=0.7, blur=18); c = ring(c, 540, 760, D_ / 2 + 4, BRONZE_L, 1.0, 6)
    c = ring(c, 540, 760, 455, BRONZE_L, 1.0, 4, arc=(-30, 235)); c = spark(c, 540 + np.sin(np.deg2rad(235)) * 455, 760 - np.cos(np.deg2rad(235)) * 455, BRONZE_L, 1.0)
    if not blank:
        c, _ = title_block(c, [text([('كيف يا', PARCH), ('قرآنُ', BRONZE_L)], 'naskh', 140), text([('ربّيتَ', PARCH), ('الرجال', BRONZE_L)], 'naskh', 156)], 540, 1180, gap=4)
        c = P(c, credit('المصدر: مركز دار القرآن', 28), 260, 440)
    c = slogan(c, 540, 1520); return mark(c, 118, 348)
def cover_c(blank=False):
    c = archive_ground(1920, 1080, seed=92, light=True)
    for r, a in ((300, 0.5), (360, 0.3)): c = ring(c, 880, 300, r, SILVER_D, a, 2, ticks=72 if r == 300 else 0, tick_len=8)
    ph = cover_fit(grade(still('mosque'), 0.3), 820, 640, fy=0.4)
    pr = np.zeros((700, 880, 4), np.float32); pr[..., :3] = PARCH; pr[..., 3] = 1; pr[30:670, 30:850, :3] = ph
    c = P(c, pr, 540, 720, rot=3, shadow=0.45, blur=20)
    tape = np.dstack([np.broadcast_to(C('D9CDB2'), (60, 200, 3)).astype(np.float32), np.full((60, 200), 0.85, np.float32)])
    c = P(c, tape, 230, 400, rot=-38); c = P(c, tape, 860, 400, rot=40)
    if not blank:
        c, yb = title_block(c, [text([('سجل', INK), ('يا تاريخ', BRONZE_D)], 'naskh', 190)], 540, 1150, shadow=0.25)
        st = seal_stamp(280, SEAL); c = P(c, st, 900, 1000, rot=-14, a=0.85)
        c = P(c, credit('المصدر: نفحات جهادية', 28), 300, 1440)
    c = slogan(c, 540, 1520, col=BRONZE_D); return mark(c, 118, 348)
def g_covers():
    d_ = OUT + 'Social_Media/Reels_TikTok_Covers/'
    for f, n in ((cover_a, 'A_photo_band'), (cover_b, 'B_seal_circle'), (cover_c, 'C_archive_print_light')):
        sv(f(False), d_ + f'KM_Cover_{n}_EXAMPLE_1080x1920.jpg'); sv(f(True), d_ + f'KM_Cover_{n}_BLANK_1080x1920.jpg')
    g = cover_a(True) * 0.6
    ov = g.copy(); ov[:270] = SEAL; ov[1500:] = SEAL; ov[:, 960:] = SEAL; g = g * 0.55 + ov * 0.45
    for txt, x, y in (('أعلى 270 بكسل: بدون نص', 540, 135), ('أسفل 420 بكسل: أزرار المنصة', 540, 1710), ('منطقة العنوان الآمنة', 480, 900)):
        g = P(g, label(txt, 44, PARCH, 'almarai'), x, y)
    g = P(g, label('120', 40, PARCH, 'almarai'), 1020, 960); sv(g, d_ + 'KM_Reels_Safe_Zone_Guide.jpg')

# ------------------------------------------------------------------ carousel 4:5 (4 slides, speaker's exact words)
def slide(n, total, light, body_html=None, title=None, end=False):
    w, h = 1080, 1350; c = archive_ground(h, w, seed=100 + n, light=light)
    lc = SILVER_D if light else SILVER; tx = INK if light else PARCH; key = BRONZE_D if light else BRONZE_L; emo = SEAL if light else SEAL_L
    for r, a, tk in ((330, 0.5, 72), (420, 0.28, 0)): c = ring(c, 1010, 250, r, lc, a, 2, ticks=tk, tick_len=8)
    c = ring(c, 1010, 250, 375, key, 0.95, 4, arc=(150, 330)); c = spark(c, 1010 + np.sin(np.deg2rad(150)) * 375, 250 - np.cos(np.deg2rad(150)) * 375, key, 0.7)
    num = '١٢٣٤٥٦٧٨٩'; c = P(c, label(f'{num[n - 1]} / {num[total - 1]}', 40, lc, 'almarai'), 120, 110)
    y = 330
    if title:
        t1 = text(title, 'naskh', 170); c = P(c, t1, 1000 - t1.shape[1] / 2, 400, shadow=0.4 if not light else 0.15); c = hair(c, 1000, 525, 820, 525, key, 1.0, 4); y = 640
    if body_html:
        FB = 62
        for runs in wrap(tokens(body_html, tx, (key, emo)), 'amiri', FB, 880):
            li = rtl_line(runs, 'amiri', FB); c = P(c, li, 1000 - li.shape[1] / 2, y); y += int(FB * 1.75)
    if end:
        L1, L2 = lettering(); s = 520 / L1.shape[1]
        c = P(c, cv2.resize(L1, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), 540, y + 170, shadow=0.5)
        c = P(c, cv2.resize(L2, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), 540, y + 330, shadow=0.5)
        c = slogan(c, 540, y + 470, col=key)
    av = logo_rgba(96); c = P(c, av, 1000 - 48, 1230); nm = text([('الكلمة مقاومة', tx)], 'almarai', 40); c = P(c, nm, 1000 - 110 - nm.shape[1] / 2, 1230)
    cr = credit('المصدر: نفحات جهادية', 28); c = P(c, cr, 80 + cr.shape[1] / 2 + 120, 1230)
    if not end:
        ax, ay = 110, 1230
        for (x0, y0, x1, y1) in ((ax + 40, ay, ax - 30, ay), (ax - 30, ay, ax - 8, ay - 22), (ax - 30, ay, ax - 8, ay + 22)): c = hair(c, x0, y0, x1, y1, key, 1.0, 5)
    return c
def g_carousel():
    d_ = OUT + 'Social_Media/Carousel_4x5/'
    S = [dict(light=False, title=[('سجل', PARCH), ('يا تاريخ', BRONZE_L)]),
         dict(light=True, body_html='أن أول منجزٍ صنعته {{أكذوبة}} «المسيرة القرآنية» التابعة للحركة الحوثية الإرهابية، هي [[إغلاق مراكز تحفيظ القرآن الكريم]]'),
         dict(light=True, body_html='وفتح فروعٍ لمؤسسات [[الجباية،]] {{وطرد أئمة المساجد،}} وإحلال كوادر طائفيةٍ مكانها'),
         dict(light=False, body_html='حتى أن متحوثاً {{قتل أخاه}} في مدينة التربة لأنه لم يقل «حيّ على خير العمل» في الأذان', end=True)]
    for i, kw in enumerate(S):
        sv(slide(i + 1, 4, **kw), d_ + f'KM_Carousel_{i + 1}of4_EXAMPLE_1080x1350.jpg')
    sv(slide(1, 4, False), d_ + 'KM_Carousel_dark_BLANK_1080x1350.jpg'); sv(slide(2, 4, True), d_ + 'KM_Carousel_light_BLANK_1080x1350.jpg')

# ------------------------------------------------------------------ X, Facebook, quote, story, profile
def g_social():
    d_ = OUT + 'Social_Media/'
    L1, L2 = lettering()
    # X post 1600x900 — quote from the ceremony nasheed, photo in a circle
    w, h = 1600, 900; c = vignette(archive_ground(h, w, seed=111), 0.4)
    fr_ = video_frame('v10/src/in_h264.mp4', 3.4); D_ = 600; ph = cover_fit(grade(fr_, 0.25), D_, D_, fy=0.55)
    for r, a, tk in ((330, 0.4, 96), (390, 0.22, 0)): c = ring(c, 400, 450, r, SILVER, a, 2, ticks=tk, tick_len=7)
    c = P(c, np.dstack([ph, round_mask(D_, D_, D_ // 2)]), 400, 450, shadow=0.6, blur=16); c = ring(c, 400, 450, D_ / 2 + 4, BRONZE_L, 1.0, 5)
    c = P(c, text([('كيف يا', PARCH), ('قرآنُ', BRONZE_L)], 'naskh', 120), 1150, 300, shadow=0.6)
    c = P(c, text([('ربّيتَ', PARCH), ('الرجال', BRONZE_L)], 'naskh', 132), 1150, 470, shadow=0.6)
    c = P(c, text([('كيف صاروا هكذا مثلَ الجبال', PARCH)], 'amiri', 58), 1150, 630)
    c = P(c, credit('المصدر: مركز دار القرآن', 28), 1150, 760); c = P(c, logo_rgba(96), 1500, 90)
    sv(c, d_ + 'X/KM_X_Post_Quote_EXAMPLE_1600x900.jpg')
    # X header 1500x500 — the logo's own lettering side by side
    w, h = 1500, 500; c = archive_ground(h, w, seed=112)
    for r, a, tk in ((260, 0.4, 72), (330, 0.22, 0), (420, 0.12, 0)): c = ring(c, 1200, 250, r, SILVER, a, 2, ticks=tk, tick_len=7)
    s = 1180 / (L1.shape[1] + L2.shape[1]); l1 = cv2.resize(L1, None, fx=s, fy=s, interpolation=cv2.INTER_AREA); l2 = cv2.resize(L2, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    xr = 1420; c = P(c, l1, xr - l1.shape[1] / 2, 215, shadow=0.6); c = P(c, l2, xr - l1.shape[1] - 50 - l2.shape[1] / 2, 215, shadow=0.6); c = slogan(c, xr - (l1.shape[1] + 50 + l2.shape[1]) / 2, 425)
    sv(c, d_ + 'X/KM_X_Header_1500x500.jpg')
    # Facebook cover 1640x924 + guide
    w, h = 1640, 924; c = archive_ground(h, w, seed=113)
    for r, a, tk in ((330, 0.45, 96), (400, 0.25, 0), (520, 0.14, 0), (680, 0.08, 0)): c = ring(c, 820, 440, r, SILVER, a, 2, ticks=tk, tick_len=8)
    c = ring(c, 820, 440, 360, BRONZE_L, 1.0, 4, arc=(-60, 200)); c = spark(c, 820 + np.sin(np.deg2rad(200)) * 360, 440 - np.cos(np.deg2rad(200)) * 360, BRONZE_L, 0.9)
    s = 1240 / (L1.shape[1] + L2.shape[1]); l1 = cv2.resize(L1, None, fx=s, fy=s, interpolation=cv2.INTER_AREA); l2 = cv2.resize(L2, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    tot = l1.shape[1] + 60 + l2.shape[1]; xr = 820 + tot / 2
    c = P(c, l1, xr - l1.shape[1] / 2, 420, shadow=0.65); c = P(c, l2, xr - l1.shape[1] - 60 - l2.shape[1] / 2, 420, shadow=0.65); c = slogan(c, 820, 650, size=50, rule=140)
    sv(c, d_ + 'Facebook/KM_Facebook_Cover_1640x924.jpg')
    g = c.copy(); m = np.zeros((h, w), np.float32); m[:150] = 1; m[774:] = 1; g = g * (1 - 0.5 * m[..., None]) + SEAL * 0.5 * m[..., None]
    cv2.circle(g, (180, 760), 170, tuple(float(v) for v in SEAL), -1)
    for txt, x, y in (('يقصّ على الهاتف', 820, 75), ('يقصّ على الهاتف', 820, 850), ('صورة الحساب (كمبيوتر)', 180, 760)): g = P(g, label(txt, 34, PARCH, 'almarai'), x, y)
    sv(g, d_ + 'Facebook/KM_Facebook_Cover_SAFE_AREA_Guide.jpg')
    # quote post 1080x1080 — parchment index card
    w, h = 1080, 1080; c = archive_ground(h, w, seed=114)
    cd = card(900, 760, light=True); c = P(c, cd, 540, 520, rot=-1.5, shadow=0.5, blur=22)
    c = P(c, text([('كيف يا قرآنُ ربّيتَ', INK), ('الرجال؟', BRONZE_D)], 'amiri', 76), 540, 420, rot=-1.5)
    c = P(c, text([('كيف صاروا هكذا مثلَ', INK), ('الجبال؟', BRONZE_D)], 'amiri', 76), 540, 560, rot=-1.5)
    c = P(c, text([('تشهد الأيامُ لكنْ كلما سطّروا أمجادَها', INK)], 'amiri', 50), 540, 690, rot=-1.5)
    c = P(c, seal_stamp(200, SEAL), 820, 800, rot=-12, a=0.8); c = P(c, credit('المصدر: مركز دار القرآن', 28), 330, 980)
    c = slogan(c, 760, 980, size=40, rule=70); sv(c, d_ + 'Quote/KM_Quote_Post_EXAMPLE_1080x1080.jpg')
    # story 1080x1920 — Dhawila narration line
    c = bg_from(still('think'), fy=0.45) * 0.75; band = np.clip((mg.yy - 900) / 600, 0, 1)[..., None]; c = c * (1 - 0.6 * band) + INK * 0.6 * band
    c = mark(c, 540, 330, 150)
    cd = card(900, 420, light=False); c = P(c, cd, 540, 1200, shadow=0.5)
    c = P(c, text([('قال لهم: اجلسوا', PARCH), ('وفكّروا', BRONZE_L)], 'naskh', 104), 540, 1140)
    c = P(c, text([('من خارج الصندوق', BRONZE_L)], 'naskh', 96), 540, 1290); c = slogan(c, 540, 1480)
    sv(c, d_ + 'Story/KM_Story_EXAMPLE_1080x1920.jpg')
    # profile picture preview on dark and light
    pv = np.zeros((600, 1200, 3), np.float32); pv[:, :600] = C('18191B'); pv[:, 600:] = C('F0F2F5')
    for x in (300, 900):
        for sz, yy_ in ((360, 260),): pv = paste(pv, logo_rgba(sz), x, yy_)
        pv = paste(pv, logo_rgba(64), x - 120, 520); pv = paste(pv, logo_rgba(40), x, 520)
    sv(pv, d_ + 'Profile/KM_Profile_Picture_Preview_dark_light.jpg')
    save_png(logo_rgba(1080), d_ + 'Profile/KM_Profile_Picture_1080.png')

# ------------------------------------------------------------------ components (transparent PNGs)
def g_components():
    d_ = OUT + 'Video_Motion_Graphics/Components_PNG/'
    save_png(credit('المصدر: اسم الصفحة', 34), d_ + 'KM_Source_Pill_EXAMPLE.png')
    sl = np.zeros((90, 560, 4), np.float32); sl = np.dstack([slogan(np.zeros((90, 560, 3), np.float32), 280, 45), np.zeros((90, 560), np.float32)])
    t = text([('كلنا مقاومة', BRONZE_L)], 'almarai', 46); a = np.zeros((90, 560), np.float32); tmp = paste(np.zeros((90, 560, 3), np.float32), np.dstack([np.ones_like(t[..., :3]) * 255, t[..., 3:]]), 280, 45)[..., 0] / 255
    m = tmp.copy()
    for sg in (-1, 1): m = hair(m[..., None].repeat(3, 2), 280 + sg * (t.shape[1] / 2 + 24), 45, 280 + sg * (t.shape[1] / 2 + 134), 45, np.full(3, 1.0), 1.0, 3)[..., 0]
    save_png(np.dstack([np.broadcast_to(BRONZE_L, (90, 560, 3)).astype(np.float32), np.clip(m, 0, 1)]), d_ + 'KM_Slogan_Kulluna_Muqawama.png')
    save_png(seal_stamp(600, BRONZE_L), d_ + 'KM_Seal_Stamp_Bronze.png'); save_png(seal_stamp(600, SEAL_L), d_ + 'KM_Seal_Stamp_Wax.png')
    save_png(card(900, 600, light=True), d_ + 'KM_Archive_Card_Light.png'); save_png(card(900, 600, light=False), d_ + 'KM_Archive_Card_Dark.png')
    save_png(plate(900, 118, 30, INK, 0.84, edge=BRONZE * 0.95), d_ + 'KM_Caption_Plate_900.png')
    # ring set + compass (bronze/silver on transparent)
    S2 = 1000; c = np.zeros((S2, S2, 3), np.float32); al = np.zeros((S2, S2, 3), np.float32)
    for r, a_, tk in ((420, 1.0, 120), (480, 0.6, 72)): al = ring(al, 500, 500, r, np.full(3, 255.0), a_, 2, ticks=tk, tick_len=8)
    al = ring(al, 500, 500, 360, np.full(3, 255.0), 1.0, 5)
    for k in range(8):
        an = np.deg2rad(45 * k); al = hair(al, 500 + np.sin(an) * 100, 500 - np.cos(an) * 100, 500 + np.sin(an) * 350, 500 - np.cos(an) * 350, np.full(3, 255.0), 0.8, 2)
    save_png(np.dstack([np.broadcast_to(BRONZE_L, (S2, S2, 3)).astype(np.float32), al[..., 0] / 255]), d_ + 'KM_Rings_Compass_Bronze.png')
    save_png(np.dstack([np.broadcast_to(SILVER, (S2, S2, 3)).astype(np.float32), al[..., 0] / 255]), d_ + 'KM_Rings_Compass_Silver.png')
    # lower third (blank) with bronze rule
    lt = np.zeros((170, 980, 4), np.float32); lt[..., :3] = INK; lt[..., 3] = round_mask(980, 170, 24) * 0.86; lt[18:22, 40:940, :3] = BRONZE_L
    save_png(lt, d_ + 'KM_Lower_Third_Blank.png')
    L1, L2 = lettering(); save_png(L1, d_ + 'KM_Logo_Lettering_Alkalima_ORIGINAL.png'); save_png(L2, d_ + 'KM_Logo_Lettering_Muqawama_ORIGINAL.png')
    # contact sheet
    import glob
    fs = sorted(glob.glob(d_ + '*.png')); tiles = []
    for f in fs:
        im = cv2.imread(f, cv2.IMREAD_UNCHANGED).astype(np.float32); s = min(300 / im.shape[1], 220 / im.shape[0]); im = cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        t_ = np.zeros((260, 320, 3), np.float32); t_[:] = C('3A4250'); t_ = paste(t_, np.dstack([im[..., :3], im[..., 3] / 255]), 160, 130); tiles.append(t_)
    while len(tiles) % 4: tiles.append(np.zeros((260, 320, 3), np.float32))
    sheet = np.vstack([np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)]); sv(sheet, d_ + '../KM_Components_Sheet.jpg')

if __name__ == '__main__':
    for g in ARGS[1:]: globals()['g_' + g](); print('ok', g)
