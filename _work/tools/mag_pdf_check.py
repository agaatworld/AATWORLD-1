"""Compare every PDF page with its flipbook picture (from mag_pdf.js); list the pages that differ most."""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageChops, ImageStat
here = os.path.dirname(os.path.abspath(__file__)); pdf = os.path.join(here, '..', '..', 'issue560', 'AAT-560-October-2026.pdf')
pics = sorted(glob.glob(os.path.join(here, 'pdfpages', 'p*.jpg'))); t = tempfile.mkdtemp()
subprocess.run(['pdftoppm', '-r', '40', '-png', pdf, os.path.join(t, 'q')], check=True)
qs = sorted(glob.glob(os.path.join(t, 'q-*.png')))
if len(qs) != len(pics): sys.exit('PDF %d pages, flipbook %d' % (len(qs), len(pics)))
r = []
for i, (a, b) in enumerate(zip(qs, pics), 1):
    A = Image.open(a).convert('L').resize((60, 85), Image.BOX); B = Image.open(b).convert('L').resize((60, 85), Image.BOX)
    r.append((round(ImageStat.Stat(ImageChops.difference(A, B)).mean[0], 1), i))
r.sort(reverse=True); print('most different pages:', r[:10], 'median', sorted(x[0] for x in r)[len(r) // 2])
