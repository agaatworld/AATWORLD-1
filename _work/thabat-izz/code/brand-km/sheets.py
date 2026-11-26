# Sheets for the kit: palette (03), logo variations, small-scale test, gold/bronze test, type specimen, comparison
from kit import *
import mg
from PIL import Image, ImageDraw
KIT = '/home/user/final/Kalima_Muqawama_Brand_Kit/'
BI = KIT + 'Deliverables/Brand_Identity/'
NEUTRAL = C('0D131C'); LABEL = C('E9E1D4'); DIM = C('8C9AAB')

def lab(txt, size=34, col=LABEL, fk='almarai'): return text([(txt, col)], fk, size)
def lat(txt, size=26, col=DIM):
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', size) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf') else font('almarai', size)
    w = int(f.getlength(txt)) + 20; im = Image.new('RGBA', (w, size + 18), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((10, 4), txt, font=f, fill=tuple(int(v) for v in col[::-1]) + (255,)); return to_f(im)
from PIL import ImageFont

def grid(tiles, cols, tw, th, title_ar, title_en, bg=NEUTRAL, gap=40, top=200, labh=120):
    rows = (len(tiles) + cols - 1) // cols
    Wd = cols * tw + (cols + 1) * gap; Ht = top + rows * (th + labh + gap) + gap
    c = np.zeros((Ht, Wd, 3), np.float32); c[:] = bg
    t = lab(title_ar, 64); c = paste(c, t, Wd - gap - t.shape[1] / 2, 80)
    e = lat(title_en, 30); c = paste(c, e, gap + e.shape[1] / 2, 86)
    for i, (img, ar, en) in enumerate(tiles):
        r, k = divmod(i, cols); k = cols - 1 - k                              # RTL order
        x = gap + k * (tw + gap); y = top + r * (th + labh + gap)
        im = img
        if im.shape[2] == 4:
            base = c[y:y + th, x:x + tw].copy(); a = cv2.resize(im, (tw, th), interpolation=cv2.INTER_AREA)
            c[y:y + th, x:x + tw] = base * (1 - a[..., 3:]) + a[..., :3] * a[..., 3:]
        else: c[y:y + th, x:x + tw] = cv2.resize(im, (tw, th), interpolation=cv2.INTER_AREA)
        l1 = fitw(lab(ar, 34), tw); c = paste(c, l1, x + tw - l1.shape[1] / 2, y + th + 34)
        l2 = fitw(lat(en, 22), tw); c = paste(c, l2, x + tw - l2.shape[1] / 2, y + th + 82)
    return c

def load(k, m): return cv2.imread(B + f'cache/{k}_{m}.png').astype(np.float32)

def dark_ink_mono(ink, paper):
    L = cv2.cvtColor(LOGO.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    L = np.clip((L - 0.08) / 0.8, 0, 1) ** 0.9
    return ink + (paper - ink) * L[..., None]

def avatar_tile(img, d, size=900):
    crop, m = circle_crop(img, R_OUT + 34, out=size)
    t = np.zeros((size, size, 3), np.float32); t[:] = d['depth'][0] * 0.8
    return t * (1 - m[..., None]) + crop * m[..., None]

def emblem(img, size=900):
    crop, m = circle_crop(img, R_SLATE - 6, cx=PC[0], cy=PC[1], out=size)
    return np.dstack([crop, m])

def logo_variations(k):
    d = DIRS[k]; R = load(k, 'refined')
    tiles = [(LOGO, 'الأصل (محفوظ كما هو)', 'Original - preserved'),
             (R, 'ألوان محسّنة', 'Refined colour'),
             (load(k, 'dark'), 'نسخة داكنة', 'Dark version'),
             (load(k, 'light'), 'نسخة فاتحة', 'Light version'),
             (mono(d['gold'], d['bg']), 'لون واحد: ذهبي', 'Mono - gold on ground'),
             (dark_ink_mono(d['bg'], d['text']), 'لون واحد: داكن', 'Mono - ink on paper'),
             (avatar_tile(R, d), 'صورة الحساب (دائرة)', 'Avatar - circle crop'),
             (emblem(R), 'الشارة الصغيرة (مقترح)', 'Emblem - proposal')]
    c = grid(tiles, 4, 620, 620, f'تنويعات الشعار - الاتجاه {k}: {d["ar"]}', f'Logo variations - {k} {d["name"]}')
    save(c, BI + f'{k}_Logo_Variations.jpg', 92)
    os.makedirs(BI + k, exist_ok=True)
    names = ['01_original', '02_refined', '03_dark', '04_light', '05_mono_gold', '06_mono_ink', '07_avatar', '08_emblem_proposal']
    for (img, _, _), n in zip(tiles, names):
        if img.shape[2] == 4:
            out = np.dstack([cv2.resize(img[..., :3], (1080, 1080), interpolation=cv2.INTER_AREA), cv2.resize(img[..., 3], (1080, 1080), interpolation=cv2.INTER_AREA) * 255])
            cv2.imwrite(BI + k + f'/{k}_{n}.png', np.clip(out, 0, 255).astype(np.uint8))
        else: save(cv2.resize(img, (1080, 1080), interpolation=cv2.INTER_AREA), BI + k + f'/{k}_{n}.jpg', 93)

def small_scale(k):
    d = DIRS[k]; R = load(k, 'refined'); Lt = load(k, 'light')
    sizes = [512, 180, 96, 48, 32]
    Wd = 2400; Ht = 1500; c = np.zeros((Ht, Wd, 3), np.float32); c[:] = NEUTRAL
    t = lab(f'اختبار الأحجام الصغيرة - الاتجاه {k}', 60); c = paste(c, t, Wd - 60 - t.shape[1] / 2, 80)
    e = lat('Small-scale test: full logo vs emblem crop, dark and light ground', 28); c = paste(c, e, 60 + e.shape[1] / 2, 86)
    rows = [('الشعار كاملاً', R, 'full', d['bg']), ('الشارة (مقترح)', R, 'emb', d['bg']), ('الشعار الفاتح', Lt, 'full', d['text'])]
    y = 200
    for name, img, kind, bgc in rows:
        c[y:y + 400, 40:Wd - 40] = bgc
        l1 = lab(name, 36, LABEL if kind != 'full' or bgc is d['bg'] else d['bg']); c = paste(c, l1, Wd - 80 - l1.shape[1] / 2, y + 200)
        x = Wd - 360
        for s in sizes:
            sz = min(s, 380)
            if kind == 'emb': rgba = emblem(img, 1024)
            else:
                crop, m = circle_crop(img, R_OUT + 34, out=1024); rgba = np.dstack([crop, m])
            a = cv2.resize(rgba, (s, s), interpolation=cv2.INTER_AREA)
            if s > 380: a = cv2.resize(a, (380, 380), interpolation=cv2.INTER_AREA)
            elif s <= 96: a = cv2.resize(a, (s, s), interpolation=cv2.INTER_AREA)
            hh = a.shape[0]; yy0 = y + 200 - hh // 2; xx0 = int(x - hh)
            reg = c[yy0:yy0 + hh, xx0:xx0 + hh]; c[yy0:yy0 + hh, xx0:xx0 + hh] = reg * (1 - a[..., 3:]) + a[..., :3] * a[..., 3:]
            l2 = lat(f'{s}px', 22, DIM if bgc is d['bg'] else d['bg']); c = paste(c, l2, xx0 + hh / 2, y + 200 + max(hh // 2, 20) + 22)
            x = xx0 - 70
        y += 430
    save(c, BI + f'{k}_Small_Scale_Test.jpg', 92)

def gold_test():
    tiles = [(LOGO, 'الأصل: ذهبي برتقالي', 'Original gold F4B25E'),
             (load('A', 'refined'), 'ذهب عتيق DDA653', 'Antique Gold (A)'),
             (load('A', 'goldE8B86A'), 'ذهب مطروق فاتح E8B86A', 'Forged Gold light'),
             (load('A', 'goldA8844F'), 'برونز معتّق A8844F', 'Aged Bronze (B)'),
             (load('A', 'goldA97A3C'), 'برونز قديم A97A3C', 'Ancient Bronze (C)')]
    big = []
    for img, ar, en in tiles:
        z = img[120:620, 1150:1950]                                            # detail: lettering + circles + dashes
        big.append((np.vstack([cv2.resize(img, (800, 800), interpolation=cv2.INTER_AREA), cv2.resize(z, (800, 500), interpolation=cv2.INTER_AREA)]), ar, en))
    c = grid(big, 5, 520, 845, 'اختبار الذهبي والبرونزي على الشعار (الاتجاه A)', 'Gold and bronze tests - logo frame only, photo untouched')
    save(c, BI + 'Gold_Bronze_Test.jpg', 92)

def palette_sheet():
    colw = 1100; Wd = colw * 3; Ht = 2650; c = np.zeros((Ht, Wd, 3), np.float32)
    for i, k in enumerate('ABC'):
        d = DIRS[k]; x0 = Wd - (i + 1) * colw
        c[:, x0:x0 + colw] = grunge(Ht, colw, d, seed=40 + i)
        t = lab(f'{k} - {d["ar"]}', 62, d['text'], 'almarai'); c = paste(c, t, x0 + colw - 60 - t.shape[1] / 2, 80)
        e = lat(d['name'], 32, d['steel'] + (d['text'] - d['steel']) * 0.5); c = paste(c, e, x0 + colw - 60 - e.shape[1] / 2, 150)
        y = 210
        for j, (nm, hx_, role) in enumerate(d['sw']):
            col = C(hx_); c[y:y + 150, x0 + colw - 260:x0 + colw - 60] = col
            cv2.rectangle(c, (x0 + colw - 260, y), (x0 + colw - 60, y + 150), tuple(float(v) for v in d['text'] * 0.35), 1)
            l1 = lab(role, 34, d['text']); c = paste(c, l1, x0 + colw - 290 - l1.shape[1] / 2, y + 50)
            l2 = lat(f'{nm}  #{hx_}', 26, d['text'] * 0.8); c = paste(c, l2, x0 + colw - 290 - l2.shape[1] / 2, y + 108)
            y += 175
        y += 30
        for nm, stops in d['grads']:
            g = grad([C(h) for h in stops], colw - 120); c[y:y + 110, x0 + 60:x0 + colw - 60] = g[None, :, :]
            l = lat(nm + '   ' + ' > '.join('#' + h for h in stops), 20, d['text'] * 0.85); c = paste(c, l, x0 + 60 + l.shape[1] / 2, y + 132)
            y += 170
        y += 20
        # type sample with the caption system colours
        smp = text([('الكلمة', d['text']), ('مقاومة', d['gold'])], 'naskh', 120); c = paste(c, smp, x0 + colw / 2, y + 60)
        cap_ = text([('أمام رائد ورفاقه', d['text']), ('سؤال', d['gold']), ('صعب', d['ember'])], 'almarai', 54); c = paste(c, cap_, x0 + colw / 2, y + 190)
        av, m = circle_crop(load(k, 'refined'), R_OUT + 34, out=300)
        c = paste(c, np.dstack([av, m]), x0 + colw / 2, Ht - 230)
    save(c, KIT + '03_Kalima_Muqawama_Palette.png')

def type_specimen():
    d = DIRS['A']; Wd, Ht = 2400, 2500; c = vignette(grunge(Ht, Wd, d, seed=50), 0.3)
    t = lab('الخطوط والتسلسل الطباعي', 70, d['text']); c = paste(c, t, Wd - 80 - t.shape[1] / 2, 90)
    e = lat('Arabic typography hierarchy - candidates and roles', 30, d['steel']); c = paste(c, e, 80 + e.shape[1] / 2, 96)
    rows = [('naskh', 'NT Panorama Naskh', 'العناوين والكلمات القوية والأغلفة (قاعدة القناة)', 'الكلمة مقاومة', 130),
            ('almarai', 'Almarai ExtraBold', 'الكابشن (قاعدة القناة)', 'أمام رائد ورفاقه سؤال صعب', 84),
            ('readex', 'Readex Pro', 'نص ثانوي، كاروسيل (A)', 'سجل يا تاريخ: أول منجزٍ صنعته', 70),
            ('amiri', 'Amiri Bold', 'اقتباسات وشعر وأرشيف (B)', 'كيف يا قرآنُ ربّيتَ الرجال', 84),
            ('kufi_n', 'Noto Kufi Arabic', 'لوحات المعلومات والأرقام (C)', 'كلنا مقاومة ١ ٢ ٣ ٤ ٥', 70),
            ('plex', 'IBM Plex Sans Arabic', 'واجهات وبيانات صغيرة', 'المصدر: مركز دار القرآن', 66),
            ('noto_naskh', 'Noto Naskh Arabic', 'نص طويل للقراءة', 'تشهد الأيامُ لكنْ كلما سطّروا أمجادَها', 70)]
    y = 230
    for fk, en, role, sample, sz in rows:
        s_ = text([(sample, d['text'] if fk != 'naskh' else d['gold'])], fk, sz); c = paste(c, s_, Wd - 80 - s_.shape[1] / 2, y + 90)
        r_ = lab(role, 32, d['steel'] + (d['text'] - d['steel']) * 0.5); c = paste(c, r_, Wd - 80 - r_.shape[1] / 2, y + 200)
        n_ = lat(en, 30, d['gold']); c = paste(c, n_, 80 + n_.shape[1] / 2, y + 90)
        m = np.zeros((Ht, Wd), np.float32); cv2.line(m, (80 * 8, (y + 250) * 8), ((Wd - 80) * 8, (y + 250) * 8), 1.0, 1, cv2.LINE_AA, shift=3); c = c + (d['steel'] - c) * (m * 0.5)[..., None]
        y += 300
    os.makedirs(KIT + 'References/Typography', exist_ok=True)
    save(c, KIT + 'References/Typography/Type_Specimen_and_Hierarchy.jpg', 92)

def comparison():
    F = B + 'frames/'; tw, th = 300, 533
    names = [('opener', 'الافتتاحية'), ('caption', 'الكابشن'), ('thumb', 'الغلاف'), ('motion', 'موشن'), ('type3d', 'خط ثلاثي الأبعاد')]
    Wd = 60 + 5 * (tw + 30) + 440 + 60; Ht = 200 + 3 * (th + 90) + 40
    c = np.zeros((Ht, Wd, 3), np.float32); c[:] = NEUTRAL
    t = lab('مقارنة الاتجاهات الثلاثة', 64); c = paste(c, t, Wd - 60 - t.shape[1] / 2, 80)
    e = lat('A Midnight Atlas / B Imperial Archive / C Olive & Bronze', 28); c = paste(c, e, 60 + e.shape[1] / 2, 86)
    for r, k in enumerate('ABC'):
        y = 200 + r * (th + 90); x = Wd - 60
        lk = lab(f'{k}  {DIRS[k]["ar"]}', 40); c = paste(c, lk, Wd - 60 - lk.shape[1] / 2, y - 26 + 10)
        y += 20
        for n, ar in names:
            p = B + f'op_{k}/f0140.jpg' if n == 'opener' else F + f'{k}_{n}.jpg'
            im = cv2.resize(cv2.imread(p).astype(np.float32), (tw, th), interpolation=cv2.INTER_AREA)
            c[y:y + th, x - tw:x] = im; x -= tw + 30
        car = cv2.imread(F + f'{k}_carousel.jpg').astype(np.float32); car = cv2.resize(car, (426, th), interpolation=cv2.INTER_AREA)
        c[y:y + th, x - 426:x] = car
    save(c, BI + 'Comparison_A_B_C.jpg', 92)

if __name__ == '__main__':
    w = ARGV[1]
    if w == 'var': logo_variations(ARGV[2])
    elif w == 'small': small_scale(ARGV[2])
    elif w == 'gold': gold_test()
    elif w == 'palette': palette_sheet()
    elif w == 'type': type_specimen()
    elif w == 'cmp': comparison()
    print('ok', ARGV[1:])
