# three distinct covers (shown as the first frames of each video) — «كلنا مقاومة»
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.argv = ['x', 'none']
OUT = '/home/user/final/reels-light/'
from mg import *
def chip(txt, fg, bg, edge, size=58):
    im = text([(txt, fg)], 'almarai', size); h, w = im.shape[:2]; P = np.zeros((h + 24, w + 70, 4), np.float32); m = round_mask(w + 70, h + 24, (h + 24) // 2 - 1)
    P[..., :3] = bg; P[..., 3] = m; e = m - cv2.erode(m, np.ones((3, 3), np.uint8), iterations=3); P[..., :3] = P[..., :3] * (1 - e[..., None]) + edge * e[..., None]
    a = im[..., 3:]; P[12:12 + h, 35:35 + w, :3] = P[12:12 + h, 35:35 + w, :3] * (1 - a) + im[..., :3] * a; return P
def poly(c, pts, col, a=1.0, blur=0):
    m = np.zeros((H, W), np.float32); cv2.fillPoly(m, [(np.array(pts, np.float32) * 8).astype(np.int32)], 1.0, cv2.LINE_AA, shift=3)
    if blur: m = cv2.GaussianBlur(m, (0, 0), blur)
    return c + (col - c) * (m * a)[..., None]
def save(c, name):
    cv2.imwrite(OUT + name, np.clip(c, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94]); print('ok', name)

# ---------------------------------------------------------------- 01 «سجل يا تاريخ» — editorial ledger, navy/orange bands
import v9
v9.RD = v9.Reader(10.0)
c = background(3.0, leak=0.6)
m = np.zeros((H, W), np.float32)                                                                  # ledger lines
for y in range(300, 1700, 64): cv2.line(m, (60 * 8, y * 8), (1020 * 8, y * 8), 1.0, 2, cv2.LINE_AA, shift=3)
c = c + (AMBER - c) * (m * 0.20)[..., None]
c = poly(c, [(-60, 1440), (1140, 1090), (1140, 1440), (-60, 1790)], NAVY, 0.97)                 # navy band (rises to the right)
c = poly(c, [(-60, 1405), (1140, 1055), (1140, 1075), (-60, 1425)], ORANGE, 1.0)
c = poly(c, [(-60, 1815), (1140, 1465), (1140, 1480), (-60, 1830)], AMBER, 1.0)
blk = np.zeros((840, 760, 3), np.float32); blk[:] = ORANGE
c = place(c, blk, v9.ARCH, 572, 652, 1.0, 1.0, -2.0, shadow=0.0)
c = v9.panel(c, 10.0, 540, 630, 1.0, 1.0, 1.05, rot=-2.0)
c = put(c, fitw(text([('سجل', PAPER), ('يا تاريخ', ORANGE)], 'naskh', 170), 900), 545, 1432, 1.0, 1.0, rot=-16.3, shadow=0.5)
c = put(c, chip('كلنا مقاومة', NAVY, PAPER, ORANGE), 800, 1135, 1.0, 1.0, rot=-16.3)
c = brand_corner(c, 0, 1.0)
save(finish_frame(c, 0.0, 0.10), 'cover-01-sajjil-ya-tarikh.jpg')

# ---------------------------------------------------------------- 02 «كيف يا قرآن» — luminous gold, rosette, circle frame
import v10
GOLD = v10.GOLD; LG = v10.LIGHTGOLD
c = np.broadcast_to(PAPER, (H, W, 3)).astype(np.float32).copy()
g = np.clip(1 - np.hypot(xx - 540, yy - 860) / 1100, 0, 1)[..., None]; c = c + (LG - c) * g * 0.75
c = v10.godrays(c, 0.0, 540, 860, 1.0, 24, LG)
m = np.zeros((H, W), np.float32)                                                                 # rosette of 8-point stars
for r in (330, 420, 520, 640, 780):
    for k in range(16):
        an = 2 * np.pi * k / 16 + r * 0.01; star8(m, 540 + np.cos(an) * r, 860 + np.sin(an) * r, 34 + r * 0.03, 2)
for rr in (400, 405, 470): cv2.circle(m, (540 * 8, 860 * 8), rr * 8, 1.0, 3, cv2.LINE_AA, shift=3)
c = c + (GOLD - c) * (m * 0.55)[..., None]
f, _ = v10.footage(3.4); fh, fw = f.shape[:2]; D_ = 740; sc = max(D_ / fw, D_ / fh) * 1.05
M = np.float32([[sc, 0, -(fw * sc - D_) / 2], [0, sc, -(fh * sc - D_) * 0.30]]); img = cv2.warpAffine(f, M, (D_, D_))
c = place(c, img, round_mask(D_, D_, D_ // 2), 540, 860, 1.0, 1.0, 0.0, border=10, border_col=GOLD, shadow=0.4)
c = v10.BOKEH.draw(c, 3.0, 0.8); c = v10.sparkle(c, 0.6, 0.0, 540, 470, 14, 420, 1.3, 2)
c = put(c, text([('كيف يا', NAVY), ('قرآن', ORANGE)], 'naskh', 130), 520, 330, 1.0, 1.0, glow=0.5, glow_col=LG)
c = put(c, text([('ربّيت الرجال', NAVY)], 'naskh', 150), 520, 1350, 1.0, 1.0, glow=0.5, glow_col=LG)
c = put(c, chip('كلنا مقاومة', PAPER, NAVY, GOLD), 540, 1500, 1.0, 1.0)
c = brand_corner(c, 0, 1.0)
save(finish_frame(c, 0.0, 0.06), 'cover-02-kayfa-ya-quran.jpg')

# ---------------------------------------------------------------- 03 «الحوثي يسب / السنة» — diagonal split with a gold crack
import v12
D = v12.D
top = background(2.0, leak=1.0); top = v10.godrays(top, 0.0, 540, 300, 1.0, 18, LG)
bot = D.dark_bg(4.0); bot = D.ASHD.draw(bot, 2.0, 1.0)
pts = [(0, 975)]; r = np.random.default_rng(5)
for i in range(1, 14): pts.append((i * 1080 / 14, 960 + r.uniform(-34, 34) * (1 if i % 2 else -1)))
pts.append((1080, 945))
m = np.zeros((H, W), np.float32); cv2.fillPoly(m, [(np.array(pts + [(W, H), (0, H)], np.float32) * 8).astype(np.int32)], 1.0, cv2.LINE_AA, shift=3)
c = top * (1 - m[..., None]) + bot * m[..., None]
bot_m = m
c = v12.thumb(c, v12.LSTILL[1], 530, 520, 760, 470, -3.0, 1.0, border=PAPER)                         # graduates, seated
c = put(c, text([('السنة', NAVY)], 'naskh', 150), 520, 845, 1.0, 1.0, glow=0.5, glow_col=LG)
c = put(c, text([('الحوثي', D.IVORY), ('يسب', C('D2483E'))], 'naskh', 125, 3, D.BLACK), 520, 1068, 1.0, 1.0)
c = v12.thumb(c, v12.STILL[13], 550, 1370, 760, 400, 3.0, 1.0, border=D.MRED)                        # poet, shouting
ln = np.zeros((H, W), np.float32); cv2.polylines(ln, [(np.array(pts, np.float32) * 8).astype(np.int32)], False, 1.0, 6, cv2.LINE_AA, shift=3)
c = c + (GOLD - c) * np.clip(ln + cv2.GaussianBlur(ln, (0, 0), 8) * 2.0, 0, 1)[..., None]
c = put(c, chip('كلنا مقاومة', D.IVORY, NAVY, GOLD), 540, 962, 1.0, 1.0)
c = brand_corner(c, 0, 1.0)
save(finish_frame(c, 0.0, 0.08), 'cover-03-alhouthi-yasub-wa-alsunna.jpg')
