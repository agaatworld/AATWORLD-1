"""Best-quality magazine PDF = real-text pages (mag_pdf_text.js) wherever they match the flipbook exactly, and a very
high-resolution picture (3x, ~290 dpi) of the flipbook page for the few pages the PDF printer lays out differently.
Run (server on :8765):  node _work/tools/mag_pdf.js && node _work/tools/mag_pdf_text.js && python3 _work/tools/mag_pdf_best.py"""
import glob, io, os, re, subprocess, sys, tempfile, json
from PIL import Image, ImageChops, ImageStat
import img2pdf, pypdf
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.normpath(os.path.join(here, '..', '..'))
pdf = os.path.join(root, 'issue560', 'AAT-560-October-2026.pdf')
pics = sorted(glob.glob(os.path.join(here, 'pdfpages', 'p*.jpg'))); t = tempfile.mkdtemp()
subprocess.run(['pdftoppm', '-r', '40', '-png', pdf, os.path.join(t, 'q')], check=True)
qs = sorted(glob.glob(os.path.join(t, 'q-*.png')))
assert len(qs) == len(pics), (len(qs), len(pics))
bad = []
for i, (a, b) in enumerate(zip(qs, pics), 1):
    A = Image.open(a).convert('L').resize((60, 85), Image.BOX); B = Image.open(b).convert('L').resize((60, 85), Image.BOX)
    if ImageStat.Stat(ImageChops.difference(A, B)).mean[0] > 5.0: bad.append(i)
print('pages printed as high-resolution pictures:', bad)
hi = os.path.join(here, 'pdfpages_hi'); os.makedirs(hi, exist_ok=True)
subprocess.run(['node', os.path.join(here, 'mag_pdf_hi.js'), json.dumps(bad), hi], check=True)
a4 = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))
src = pypdf.PdfReader(pdf); out = pypdf.PdfWriter()
for i, pg in enumerate(src.pages, 1):
    if i in bad:
        one = img2pdf.convert([os.path.join(hi, 'p%03d.jpg' % i)], layout_fun=img2pdf.get_layout_fun(a4, fit=img2pdf.FitMode.into))
        pg = pypdf.PdfReader(io.BytesIO(one)).pages[0]; pg.scale_to(float(src.pages[i - 1].mediabox.width), float(src.pages[i - 1].mediabox.height))
    out.add_page(pg)
out.add_metadata({'/Title': 'AAT 560 - October 2026'})
with open(pdf, 'wb') as f: out.write(f)
print('PDF', os.path.getsize(pdf) // 1024 // 1024, 'MB')
upd = re.search(r'update (\d+)', open(os.path.join(root, 'version.txt')).read()).group(1)
fl = os.path.join(root, 'issue560', 'index.html'); h = open(fl, encoding='utf-8').read()
open(fl, 'w', encoding='utf-8').write(re.sub(r'href="AAT-560-October-2026\.pdf(\?v=\d+)?"', 'href="AAT-560-October-2026.pdf?v=%s"' % upd, h))
