"""Join the flipbook page pictures (made by mag_pdf.js) into the magazine PDF (A4 pages), check it, and give the PDF link
the update number (Hostinger keeps a file 30 days by its address, so each release needs a fresh address)."""
import glob, hashlib, os, re, sys, img2pdf
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.normpath(os.path.join(here, '..', '..'))
pages = sorted(glob.glob(os.path.join(here, 'pdfpages', 'p*.jpg')))
if len({hashlib.md5(open(f, 'rb').read()).hexdigest() for f in pages}) != len(pages): sys.exit('two pictures are the same page: page turning failed')
out = os.path.join(root, 'issue560', 'AAT-560-October-2026.pdf')
a4 = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))
with open(out, 'wb') as f:
    f.write(img2pdf.convert(pages, layout_fun=img2pdf.get_layout_fun(a4, fit=img2pdf.FitMode.into), title='AAT 560 - October 2026'))
print(len(pages), 'pages ->', out, os.path.getsize(out) // 1024 // 1024, 'MB')
upd = re.search(r'update (\d+)', open(os.path.join(root, 'version.txt')).read()).group(1)
fl = os.path.join(root, 'issue560', 'index.html'); h = open(fl, encoding='utf-8').read()
open(fl, 'w', encoding='utf-8').write(re.sub(r'href="AAT-560-October-2026\.pdf(\?v=\d+)?"', 'href="AAT-560-October-2026.pdf?v=%s"' % upd, h))
print('PDF link -> AAT-560-October-2026.pdf?v=%s' % upd)
