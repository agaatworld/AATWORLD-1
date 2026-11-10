"""Arabic articles + Arabic news -> PDF made with the magazine's OWN page templates and styles (issue560/index.html).
   Owner (1 Nov 2026): same design as the latest magazine; no cover, no contents, no back page; large text; pictures never cut.
   python3 _work/pdf-news/build_mag.py  -> _work/pdf-news/AAT-articles-news.pdf"""
import json, re, os, subprocess
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(ROOT)
OUT = '_work/pdf-news'
src = open('assets/js/data/extra2.js', encoding='utf-8').read().split('\n')
X = lambda i: json.loads(re.search(r'var X = (\[.*\]);', src[i]).group(1))
ARTS = [a for a in X(14) if a['id'] in ['ar26-%d' % i for i in list(range(19, 29)) + list(range(14, 19))]]
ARTS.sort(key=lambda a: (int(a['id'].split('-')[1]) < 19, int(a['id'].split('-')[1])))
NEWS = [n for n in X(8) if n['img'] in ['arn%d' % i for i in list(range(19, 26)) + list(range(14, 19))]]
NEWS.sort(key=lambda n: (int(n['img'][3:]) < 19, int(n['img'][3:])))
assert len(ARTS) == 15 and len(NEWS) == 12
mag = open('issue560/index.html', encoding='utf-8').read()
styles = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', mag, re.S))
def ratio(p):
    w, h = Image.open(p).size; return round(w / h, 4)
data = {'arts': [{'id': a['id'], 'title': a['title']['ar'], 'img': '../assets/img/' + a['img'], 'ratio': ratio('assets/img/' + a['img']), 'body': a['body']['ar']} for a in ARTS],
        'news': [{'title': n['title'], 'img': '../assets/img/' + n['img'] + '.jpg', 'ratio': ratio('assets/img/' + n['img'] + '.jpg'), 'body': n['body']} for n in NEWS]}
doc = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><base href="../../issue560/">'
       '<style>' + styles + '</style><link rel="stylesheet" href="../_work/pdf-news/mag-print.css"></head>'
       '<body class="aatpdf"><div id="book"></div><script>window.PDFDATA=' + json.dumps(data, ensure_ascii=False) + ';</script>'
       '<script src="../_work/pdf-news/paginate.js"></script></body></html>')
open(OUT + '/doc_mag.html', 'w', encoding='utf-8').write(doc)
subprocess.run(['node', OUT + '/render_mag.js'], check=True)
