"""Join the flipbook page pictures (made by mag_pdf.js) into the magazine PDF, A4 pages."""
import glob, os, img2pdf
here = os.path.dirname(os.path.abspath(__file__))
pages = sorted(glob.glob(os.path.join(here, 'pdfpages', 'p*.jpg')))
out = os.path.join(here, '..', '..', 'issue560', 'AAT-560-October-2026.pdf')
a4 = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))
with open(out, 'wb') as f:
    f.write(img2pdf.convert(pages, layout_fun=img2pdf.get_layout_fun(a4, fit=img2pdf.FitMode.into), title='AAT 560 - October 2026'))
print(len(pages), 'pages ->', os.path.normpath(out), os.path.getsize(out) // 1024, 'KB')
