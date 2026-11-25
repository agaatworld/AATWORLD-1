"""Articles + Arabic news + English news in the July 2026 issue style -> one JPEG per page.
   python3 _work/pdf-news/v4/build.py   (SCALE=1 for a quick look; default 2.5 = 1985x2808 px per page)"""
import json, re, os, subprocess
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')); os.chdir(ROOT)
V = '_work/pdf-news/v4'
src = open('assets/js/data/extra2.js', encoding='utf-8').read().split('\n')
X = lambda i: json.loads(re.search(r'var X = (\[.*\]);', src[i]).group(1))
def ratio(p):
    w, h = Image.open(p).size
    return round(w / h, 4)
TITLE_IN_IMG = {'ar26-19', 'ar26-20', 'ar26-27'}   # pictures that already carry the article title
arts = sorted([a for a in X(14) if re.fullmatch(r'ar26-(1[4-9]|2[0-8])', a['id'])], key=lambda a: int(a['id'].split('-')[1]))
arn = sorted([n for n in X(8) if re.fullmatch(r'arn(1[4-9]|2[0-5])', n['img'])], key=lambda n: int(n['img'][3:]))
enn = sorted([n for n in X(19) if re.fullmatch(r'enn([89]|1[0-3])', n['img'])], key=lambda n: int(n['img'][3:]))
assert (len(arts), len(arn), len(enn)) == (15, 12, 6), (len(arts), len(arn), len(enn))
def fix(x): return x[:-20] + 'وحصولها على تصنيف IP67.' if x.endswith('وحصولها على تصنيف من') else x   # text cut in the source document
AR = lambda b: [fix(x) for x in b if not (x.startswith('## ') and not re.search('[\u0600-\u06FF]', x))]   # drop English sub-heads inside Arabic items
I = lambda p: '../../../assets/img/' + p
def news(n, ar=False): return {'title': n['title'], 'img': I(n['img'] + '.jpg'), 'ratio': ratio('assets/img/' + n['img'] + '.jpg'), 'body': AR(n['body']) if ar else n['body'], 'len': sum(map(len, n['body']))}
D = {'logo': '../../brand/logo/AAT-logo-red.svg',
     'arts': [{'id': a['id'], 'title': a['title']['ar'], 'img': I(a['img']), 'ratio': ratio('assets/img/' + a['img']), 'body': AR(a['body']['ar']), 'titleInImg': a['id'] in TITLE_IN_IMG} for a in arts],
     'arNews': [news(n, True) for n in arn], 'enNews': [news(n) for n in enn]}
html = ('<!doctype html><html><head><meta charset="utf-8">'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&family=Noto+Kufi+Arabic:wght@800&family=Arimo:wght@700&family=Tinos:wght@700&family=Roboto+Condensed:wght@800&display=block">'
        '<link rel="stylesheet" href="style.css"></head><body><div id="book"></div><script>window.D=' + json.dumps(D, ensure_ascii=False) + ';</script><script src="layout.js"></script></body></html>')
open(V + '/doc.html', 'w', encoding='utf-8').write(html)
subprocess.run(['node', V + '/render.js'], check=True)
