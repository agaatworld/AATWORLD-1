"""Stage 2 (after build.py): footer strips with the right page numbers, bleed, spine, PDFs.
   python3 finish.py [spine_mm]      (spine width: ask the printer; default 6 mm for 100 pages)
   out/print/  AAT-561-November-2026-print.pdf   100 pages, 216 x 303 mm (A4 + 3 mm bleed), TrimBox = A4
               AAT-561-cover-spread-with-spine.pdf/.jpg   front | spine | back (Arabic binding on the right)
   out/web/    p001.jpg ... p100.jpg (A4, no bleed, 1240 px wide) + AAT-561-November-2026.pdf (A4, for download)"""
import io, json, os, sys
import numpy as np, img2pdf, pikepdf
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
W, HH, B = 2480, 3508, 35
SPINE_MM = float(sys.argv[1]) if len(sys.argv) > 1 else 6.0
FB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
for d in ('out/print', 'out/web', 'out/pages'): os.makedirs(d, exist_ok=True)
info = json.load(open('build/info.json'))
FIX = {100: [(120, 3345, 255, 3445)]}   # back cover: old page number '35 |' from the ad's earlier issue
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

def bleed(im, px=B):
    a = np.asarray(im.convert('RGB')); return Image.fromarray(np.pad(a, ((px, px), (px, px), (0, 0)), mode='symmetric'))

def jpg(im, q=95):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, dpi=(300, 300), subsampling=0); return b.getvalue()

def mm(px): return px / 300 * 25.4

print_pages, web_pages = [], []
for n in range(1, 101):
    im = Image.open('build/a4-%03d.png' % n).convert('RGB')
    for box in FIX.get(n, []): ImageDraw.Draw(im).rectangle(box, fill='white')
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
print('spine', SPINE_MM, 'mm =', sp, 'px; spread', cs.size)
