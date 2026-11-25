"""One PDF per article and per news item (owner, 2 Nov 2026): the October magazine's (issue 560) font and text size,
   magazine page templates, no page numbers.  python3 _work/pdf-news/build_items.py -> _work/pdf-news/items/*.pdf"""
import json, re, os, subprocess, shutil
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(ROOT)
OUT = '_work/pdf-news'; ITEMS = OUT + '/items'
shutil.rmtree(ITEMS, ignore_errors=True); os.makedirs(ITEMS)
src = open('assets/js/data/extra2.js', encoding='utf-8').read().split('\n')
X = lambda i: json.loads(re.search(r'var X = (\[.*\]);', src[i]).group(1))
ARTS = sorted([a for a in X(14) if re.fullmatch(r'ar26-(1[4-9]|2[0-8])', a['id'])], key=lambda a: int(a['id'].split('-')[1]))
NEWS = sorted([n for n in X(8) if re.fullmatch(r'arn(1[4-9]|2[0-5])', n['img'])], key=lambda n: int(n['img'][3:]))
assert len(ARTS) == 15 and len(NEWS) == 12
mag = open('issue560/index.html', encoding='utf-8').read()
styles = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', mag, re.S))
def ratio(p): w, h = Image.open(p).size; return round(w / h, 4)
def safe(t): return re.sub(r'[\\/:*?"<>|«»“”"\']+', '', t).strip()[:70].strip(' .،')
jobs = [('مقال', {'id': a['id'], 'kind': 'art', 'title': a['title']['ar'], 'img': '../assets/img/' + a['img'], 'ratio': ratio('assets/img/' + a['img']), 'body': a['body']['ar']}) for a in ARTS]
jobs += [('خبر', {'id': n['img'], 'kind': 'news', 'title': n['title'], 'img': '../assets/img/' + n['img'] + '.jpg', 'ratio': ratio('assets/img/' + n['img'] + '.jpg'), 'body': n['body']}) for n in NEWS]
for k, (label, it) in enumerate(jobs, 1):
    data = {'arts': [it], 'news': [], 'fs': 1.1}
    doc = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><base href="../../issue560/">'
           '<style>' + styles + '</style><link rel="stylesheet" href="../_work/pdf-news/mag-print.css"><link rel="stylesheet" href="../_work/pdf-news/item-print.css"></head>'
           '<body class="aatpdf"><div id="book"></div><script>window.PDFDATA=' + json.dumps(data, ensure_ascii=False) + ';</script>'
           '<script src="../_work/pdf-news/paginate.js"></script></body></html>')
    open(OUT + '/doc_item.html', 'w', encoding='utf-8').write(doc)
    name = '%02d %s - %s.pdf' % (k, label, safe(it['title']))
    subprocess.run(['node', OUT + '/render_item.js', ITEMS + '/' + name], check=True)
