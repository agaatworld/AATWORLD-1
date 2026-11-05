"""Stage 2 (after build.py): footer strips with the right page numbers, bleed, spine, PDFs.
   python3 finish.py [spine_mm]      (spine width: ask the printer; default 9 mm: 96 inner pages on 180 gsm + 300 gsm cover)
   out/print/  AAT-561-November-2026-print.pdf   100 pages, 216 x 303 mm (A4 + 3 mm bleed), TrimBox = A4
               AAT-561-cover-spread-with-spine.pdf/.jpg   front | spine | back (Arabic binding on the right)
   out/web/    p001.jpg ... p100.jpg (A4, no bleed, 1240 px wide) + AAT-561-November-2026.pdf (A4, for download)"""
import io, json, os, sys
import numpy as np, img2pdf, pikepdf
from PIL import Image, ImageDraw, ImageFont, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
W, HH, B = 2480, 3508, 35
SPINE_MM = float(sys.argv[1]) if len(sys.argv) > 1 else 9.0
FB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
for d in ('out/print', 'out/web', 'out/pages'): os.makedirs(d, exist_ok=True)
info = json.load(open('build/info.json'))
FIX = {100: [(120, 3345, 255, 3445)], 5: [(2288, 3482, 2388, 3508)], 7: [(2338, 3392, 2408, 3452)], 19: [(2338, 3395, 2428, 3455)],
       51: [(2338, 3395, 2428, 3455)], 74: [(2338, 3395, 2410, 3455)], 75: [(2343, 3452, 2438, 3502)], 96: [(2338, 3402, 2412, 3452)]}
# old page numbers printed inside the advertisers' own files (from the issues they first ran in); covered with the colour around them
def unfolio(im, box):
    a = np.asarray(im.convert('RGB')).astype(int); x0, y0, x1, y1 = box; m = 8
    ring = np.concatenate([a[max(0, y0 - m):y0, x0:x1].reshape(-1, 3), a[y0:y1, max(0, x0 - m):x0].reshape(-1, 3), a[y0:y1, x1:x1 + m].reshape(-1, 3)])
    ImageDraw.Draw(im).rectangle(box, fill=tuple(int(v) for v in np.median(ring, axis=0)))   # back cover: old page number '35 |' from the ad's earlier issue
RED, GREY, YEL = (237, 28, 36), (230, 231, 232), (247, 181, 0)

def strip(n, h):
    """The AAT footer strip (grey band, number box on the outer edge, www box, yellow slash) for page n, h px tall."""
    k = h / 24.0; im = Image.new('RGB', (W, h), GREY); d = ImageDraw.Draw(im)
    left = n % 2 == 1                                  # Arabic magazine: odd pages are left-hand pages, outer edge = left
    def X(x): return x if left else W - x             # mirror for right-hand (even) pages
    nb, gap, ux, uw, sx, sw = 64 * k, 6 * k, 70 * k, 180 * k, 238 * k, 30 * k
    d.polygon([(X(0), 0), (X(nb), 0), (X(nb), h), (X(0), h)], fill=RED)
    d.polygon([(X(ux), 0), (X(ux + uw), 0), (X(ux + uw - 14 * k), h), (X(ux), h)], fill=RED)
    d.polygon([(X(sx + 14 * k), 0), (X(sx + sw), 0), (X(sx + 16 * k), h), (X(sx), h)], fill=YEL)
    f = ImageFont.truetype(FB, round(15 * k)); t = 'www.aatworld.com'
    tw = d.textlength(t, font=f); cx = ux + (uw - 10 * k) / 2
    d.text((X(cx) - tw / 2, h / 2), t, font=f, fill='white', anchor='lm')
    f2 = ImageFont.truetype(FB, round(18 * k)); s = str(n); w2 = d.textlength(s, font=f2)
    d.text((X(nb / 2) - w2 / 2, h / 2), s, font=f2, fill='white', anchor='lm')
    return im

SCALES = {}
def fill(im, band, n, m=62, gap=34):
    """Owner (6 Nov): pages whose picture sits inside a wide white frame (an ad or a box smaller than the page) are
       enlarged to fill the page, keeping the shape and a 5 mm safe margin; the footer strip stays where it is."""
    if n in (1, 6): return im, 1.0
    a = np.asarray(im.convert('L')).astype(int); yend = band[0] - 8 if band else HH
    ink = a[:yend] < 235; xs = np.where(ink.mean(axis=0) > .004)[0]; ys = np.where(ink.mean(axis=1) > .004)[0]
    if not len(xs): return im, 1.0
    x0, x1, y0, y1 = xs[0], xs[-1] + 1, ys[0], ys[-1] + 1
    if min(x0, W - x1) < W * .04 or min(y0, yend - y1) < HH * .03: return panel(im, yend, x0, x1, y0, y1)
    top, bot = m, (yend - gap if band else HH - m)
    s = min((W - 2 * m) / (x1 - x0), (bot - top) / (y1 - y0))
    if s < 1.03: return im, 1.0
    part = im.crop((x0, y0, x1, y1)).resize((round((x1 - x0) * s), round((y1 - y0) * s)), Image.LANCZOS)
    if s > 1.15: part = part.filter(ImageFilter.UnsharpMask(radius=1.4, percent=40, threshold=2))
    out = im.copy(); ImageDraw.Draw(out).rectangle((0, 0, W, yend), fill='white')
    out.paste(part, ((W - part.width) // 2, top + (bot - top - part.height) // 2))
    return out, round(s, 3)

def panel(im, yend, x0, x1, y0, y1):
    """A coloured box inside a white frame (e.g. the Audifel pages): its own edge colour is carried out to the page edges."""
    if max(x0, W - x1) < W * .03 and max(y0, yend - y1) < HH * .02: return im, 1.0
    a = np.asarray(im.convert('RGB')).astype(int); e = 6
    edges = np.concatenate([a[y0:y1, x0:x0 + e].reshape(-1, 3), a[y0:y1, x1 - e:x1].reshape(-1, 3)])
    if y0 > HH * .02: edges = np.concatenate([edges, a[y0:y0 + e, x0:x1].reshape(-1, 3)])
    lum = edges.mean(axis=1)
    if lum.mean() > 244 or (lum < 200).mean() > .5: return im, 1.0     # white page with normal margins, or no clean box edge
    med = np.median(edges, axis=0)
    def line(v):                       # edge colours along one side; photos touching the edge are ignored
        v = v.astype(float); bad = np.abs(v - med).sum(axis=1) > 45; idx = np.arange(len(v))
        if bad.all(): return np.tile(med, (len(v), 1))
        if bad.any():
            for c in range(3): v[bad, c] = np.interp(idx[bad], idx[~bad], v[~bad, c])
        k = 81; ker = np.ones(k) / k
        return np.stack([np.convolve(np.pad(v[:, c], k // 2, mode='edge'), ker, 'valid') for c in range(3)], 1)
    can = np.empty((yend, W, 3)); can[:] = med
    L = line(a[y0:y1, x0 + 2]); R = line(a[y0:y1, x1 - 3])
    can[y0:y1, :x0] = L[:, None, :]; can[y0:y1, x1:] = R[:, None, :]
    if y0 > 0: can[:y0, x0:x1] = line(a[y0 + 2, x0:x1])[None, :, :]
    if yend > y1: can[y1:, x0:x1] = line(a[y1 - 3, x0:x1])[None, :, :]
    can[y0:y1, x0:x1] = a[y0:y1, x0:x1]
    out = im.copy(); out.paste(Image.fromarray(can.clip(0, 255).astype('uint8')), (0, 0))
    return out, 'panel'

def bleed(im, px=B):
    a = np.asarray(im.convert('RGB')); return Image.fromarray(np.pad(a, ((px, px), (px, px), (0, 0)), mode='symmetric'))

def jpg(im, q=95):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, dpi=(300, 300), subsampling=0); return b.getvalue()

def mm(px): return px / 300 * 25.4

print_pages, web_pages = [], []
for n in range(1, 101):
    im = Image.open('build/a4-%03d.png' % n).convert('RGB')
    for box in FIX.get(n, []): unfolio(im, box)
    im, sc = fill(im, info[str(n)]['band'], n); SCALES[n] = sc
    bd = info[str(n)]['band']
    if bd:
        y0, y1, _ = bd; y0 -= 2; y1 += 2
        im.paste(strip(n, y1 - y0 + 1), (0, y0))
    im.save('out/pages/%03d.jpg' % n, quality=95, dpi=(300, 300), subsampling=0)
    print_pages.append(jpg(bleed(im)))
    w = im.resize((1240, 1754), Image.LANCZOS); w.save('out/web/p%03d.jpg' % n, quality=84, optimize=True, progressive=True)
    web_pages.append(jpg(im.resize((1654, 2339), Image.LANCZOS), 85))
    print(n, 'strip' if bd else '', flush=True)

def boxes(path, trim_pt=None):
    pdf = pikepdf.open(path, allow_overwriting_input=True)
    for pg in pdf.pages:
        x0, y0, x1, y1 = [float(v) for v in pg.MediaBox]
        if trim_pt:
            pg.TrimBox = pikepdf.Array([x0 + trim_pt, y0 + trim_pt, x1 - trim_pt, y1 - trim_pt]); pg.BleedBox = pg.MediaBox
    pdf.docinfo['/Title'] = 'AAT Arab Asian Trade - Issue 561 - November 2026'
    pdf.docinfo['/Author'] = 'Arab Asian Trade (AAT) Magazine'
    pdf.save(path, linearize=True)

PT = 72 / 25.4
lay = img2pdf.get_layout_fun((img2pdf.mm_to_pt(mm(W + 2 * B)), img2pdf.mm_to_pt(mm(HH + 2 * B))))
open('out/print/AAT-561-November-2026-print.pdf', 'wb').write(img2pdf.convert(print_pages, layout_fun=lay))
boxes('out/print/AAT-561-November-2026-print.pdf', trim_pt=3 * PT)
lay = img2pdf.get_layout_fun((img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297)))
open('out/web/AAT-561-November-2026.pdf', 'wb').write(img2pdf.convert(web_pages, layout_fun=lay))
boxes('out/web/AAT-561-November-2026.pdf')

# ---- cover spread: front | spine | back, 3 mm bleed all round (spine strip made by spine.html) ----
sp = round(SPINE_MM / 25.4 * 300)
front = Image.open('out/pages/001.jpg'); back = Image.open('out/pages/100.jpg')
spine = Image.open('build/spine.png').convert('RGB').resize((sp, HH), Image.LANCZOS)
cs = Image.new('RGB', (2 * W + sp, HH), 'white'); cs.paste(front, (0, 0)); cs.paste(spine, (W, 0)); cs.paste(back, (W + sp, 0))
cs = bleed(cs); cs.save('out/print/AAT-561-cover-spread-with-spine.jpg', quality=95, dpi=(300, 300), subsampling=0)
lay = img2pdf.get_layout_fun((img2pdf.mm_to_pt(mm(cs.width)), img2pdf.mm_to_pt(mm(cs.height))))
open('out/print/AAT-561-cover-spread-with-spine.pdf', 'wb').write(img2pdf.convert([jpg(cs)], layout_fun=lay))
boxes('out/print/AAT-561-cover-spread-with-spine.pdf', trim_pt=3 * PT)
print('filled:', {k: v for k, v in SCALES.items() if v != 1.0}); print('spine', SPINE_MM, 'mm =', sp, 'px; spread', cs.size)
