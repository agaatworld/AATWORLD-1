"""Sample for the owner: articles at 13 pt, tighter lines, smaller pictures, short news filling the end of the last page."""
import json, re, os, subprocess
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(ROOT)
OUT = '_work/pdf-news'; os.makedirs(OUT + '/sample', exist_ok=True)
src = open('assets/js/data/extra2.js', encoding='utf-8').read().split('\n')
X = lambda i: json.loads(re.search(r'var X = (\[.*\]);', src[i]).group(1))
A = {a['id']: a for a in X(14)}
NEWS = sorted([n for n in X(8) if re.fullmatch(r'arn(1[4-9]|2[0-5])', n['img'])], key=lambda n: int(n['img'][3:]))
mag = open('issue560/index.html', encoding='utf-8').read(); styles = ''.join(re.findall(r'<style[^>]*>(.*?)</style>', mag, re.S))
def ratio(p): w, h = Image.open(p).size; return round(w / h, 4)
TITLE_IN_IMG = {'ar26-19', 'ar26-20', 'ar26-27'}  # pictures that carry the article title
FS = round(13 / 0.75 / 15, 4)  # 13 pt = 17.33 px; magazine flow = 15 px x fs
fill = [{'id': n['img'], 'title': n['title'], 'img': '../assets/img/' + n['img'] + '.jpg', 'ratio': ratio('assets/img/' + n['img'] + '.jpg'), 'body': n['body'], 'len': sum(map(len, n['body']))} for n in NEWS]
used = []
for k, aid in enumerate(['ar26-26', 'ar26-20'], 1):
    a = A[aid]; it = {'id': aid, 'kind': 'art', 'title': a['title']['ar'], 'img': '../assets/img/' + a['img'], 'ratio': ratio('assets/img/' + a['img']), 'body': a['body']['ar'], 'titleInImg': aid in TITLE_IN_IMG}
    data = {'arts': [it], 'news': [], 'fs': FS, 'fill': [f for f in fill if f['id'] not in used]}
    doc = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><base href="../../issue560/"><style>' + styles + '</style>'
           '<link rel="stylesheet" href="../_work/pdf-news/mag-print.css"><link rel="stylesheet" href="../_work/pdf-news/item-print.css"></head>'
           '<body class="aatpdf"><div id="book"></div><script>window.PDFDATA=' + json.dumps(data, ensure_ascii=False) + ';</script><script src="../_work/pdf-news/paginate.js"></script></body></html>')
    open(OUT + '/doc_item.html', 'w', encoding='utf-8').write(doc)
    r = subprocess.run(['node', OUT + '/render_fixed.js', OUT + '/sample/نموذج %d.pdf' % k], check=True, capture_output=True, text=True).stdout.strip()
    print(r); m = re.search(r'used:(\S*)', r); used += [x for x in (m.group(1) if m else '').split(',') if x]
