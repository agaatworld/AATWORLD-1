"""Arabic articles + Arabic news -> one A4 PDF in the magazine's style (owner, 1 Nov 2026).
   python3 _work/pdf-news/build.py   (from the repo root) -> _work/pdf-news/AAT-articles-news.pdf
   Pass 1 renders, finds on which page each item starts (hidden markers), pass 2 renders again with the real page numbers in the contents."""
import json, re, os, html, subprocess, sys
from pypdf import PdfReader
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(ROOT)
OUT = '_work/pdf-news'
src = open('assets/js/data/extra2.js', encoding='utf-8').read().split('\n')
X = lambda i: json.loads(re.search(r'var X = (\[.*\]);', src[i]).group(1))
ARTS = [a for a in X(14) if a['id'] in ['ar26-%d' % i for i in list(range(19, 29)) + list(range(14, 19))]]
ARTS.sort(key=lambda a: (int(a['id'].split('-')[1]) < 19, int(a['id'].split('-')[1])))
NEWS = [n for n in X(8) if n['img'] in ['arn%d' % i for i in list(range(19, 26)) + list(range(14, 19))]]
NEWS.sort(key=lambda n: (int(n['img'][3:]) < 19, int(n['img'][3:])))
assert len(ARTS) == 15 and len(NEWS) == 12, (len(ARTS), len(NEWS))
e = lambda s: html.escape(s or '')
def isolate(t):  # raw text -> escaped HTML; Latin runs inside Arabic are isolated so their order never flips
    out, last = [], 0
    for m in re.finditer(r"[A-Za-z][A-Za-z0-9 .,&’'()/+:@-]*[A-Za-z0-9)]", t):
        out.append(html.escape(t[last:m.start()], quote=False)); out.append('<bdi dir="ltr">' + html.escape(m.group(0), quote=False) + '</bdi>'); last = m.end()
    out.append(html.escape(t[last:], quote=False)); return ''.join(out)
def body(paras, skip_first=False, sub='h3'):
    o = []
    for k, p in enumerate(paras):
        if skip_first and k == 0: continue
        if p.startswith('## '): o.append('<%s class="sh">' % sub + isolate((p[3:])) + '</%s>' % sub)
        else: o.append('<p>' + isolate((p)) + '</p>')
    return ''.join(o)
def short(t, n=60): return t if len(t) <= n else t[:n].rsplit(' ', 1)[0] + '…'
def img(path): return '../../assets/img/' + path

def build(pages):
    css = open(OUT + '/style.css', encoding='utf-8').read()
    named = []
    h = []
    # cover
    pics = [img(a['img']) for a in ARTS[:6]]
    h.append('<section class="cover"><div class="cv-top"><img class="cv-logo" src="../brand/logo/AAT-logo-red.svg" alt=""><div class="cv-names">التجارة العربية الآسيوية · <bdi dir="ltr">Arab Asian Trade</bdi> · 中阿商業雜誌</div></div>'
             '<div class="cv-band"><h1>مقالات وأخبار</h1><p>مختارات التجارة العربية الآسيوية · <bdi dir="ltr">2026</bdi></p></div>'
             '<div class="cv-grid">' + ''.join('<div class="cv-c" style="background-image:url(\'%s\')"></div>' % p for p in pics) + '</div>'
             '<div class="cv-foot"><span>%d مقالاً</span><span>%d خبراً</span><span><bdi dir="ltr">www.aatworld.com</bdi></span></div></section>' % (len(ARTS), len(NEWS)))
    # contents
    row = lambda t, k: '<li><span class="t">%s</span><i></i><b>%s</b></li>' % (isolate((short(t, 78))), pages.get(k, '00'))
    h.append('<section class="toc"><h2 class="sec-h">المحتويات</h2><h3 class="toc-h">المقالات</h3><ol>' + ''.join(row(a['title']['ar'], a['id']) for a in ARTS) + '</ol>'
             '<h3 class="toc-h">الأخبار</h3><ol>' + ''.join(row(n['title'], n['img']) for n in NEWS) + '</ol></section>')
    # articles: three openings in turn, so pages do not repeat
    for i, a in enumerate(ARTS):
        pg = 'a' + a['id'].replace('-', '')
        named.append('@page %s { @top-left { content: "%s"; } }' % (pg, short(a['title']['ar'], 58).replace('"', '\\"')))
        t = isolate((a['title']['ar'])); paras = a['body']['ar']
        first = next((p for p in paras if not p.startswith('## ')), '')
        lead = '<p class="lead">%s</p>' % isolate((first))
        rest = body(paras[paras.index(first) + 1:] if first else paras)
        pre = body(paras[:paras.index(first)]) if first else ''
        fit = ' fit' if a.get('fit') else ''
        mark = '<span class="mk">QQ%sQQ</span>' % a['id'].replace('-', '')
        v = i % 3
        if v == 0:
            top = '<figure class="hero%s"><img src="%s" alt=""></figure><h2 class="ttl">%s</h2>%s' % (fit, img(a['img']), t, lead)
        elif v == 1:
            top = '<div class="side"><figure class="%s"><img src="%s" alt=""></figure><div><h2 class="ttl">%s</h2>%s</div></div>' % (fit.strip(), img(a['img']), t, lead)
        else:
            top = '<div class="band"><h2 class="ttl">%s</h2></div><figure class="wide%s"><img src="%s" alt=""></figure>%s' % (t, fit, img(a['img']), lead)
        h.append('<article class="art v%d" style="page:%s">%s%s<div class="cols">%s%s</div></article>' % (v, pg, mark, top, pre, rest))
    # news
    cards = []
    for k, n in enumerate(NEWS):
        mark = '<span class="mk">QQ%sQQ</span>' % n['img']
        cls = 'nw big' if k == 0 else 'nw'
        cards.append('<div class="%s">%s<figure><img src="%s" alt=""></figure><h3 class="nt">%s</h3>%s</div>' % (cls, mark, img(n['img'] + '.jpg'), isolate((n['title'])), body(n['body'], sub='h4')))
    h.append('<section class="news" style="page:news"><div class="band nb"><h2 class="ttl">أخبار</h2></div><div class="ncols">%s</div></section>' % ''.join(cards))
    # back page
    h.append('<section class="back"><img src="../brand/logo/AAT-logo-white.svg" alt=""><div class="b-names">التجارة العربية الآسيوية · <bdi dir="ltr">Arab Asian Trade</bdi> · 中阿商業雜誌</div>'
             '<div class="b-lines"><p>مجلة تجارية مطبوعة وإلكترونية منذ عام <bdi dir="ltr">1982</bdi></p>'
             '<p><bdi dir="ltr">+886 966 404 681</bdi></p><p><bdi dir="ltr">info@aatworld.com</bdi></p><p><bdi dir="ltr">www.aatworld.com</bdi></p>'
             '<p class="addr" dir="ltr">P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.</p></div></section>')
    doc = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap">'
           '<style>' + css + '\n' + '\n'.join(named) + '</style></head><body>' + ''.join(h) + '</body></html>')
    open(OUT + '/doc.html', 'w', encoding='utf-8').write(doc)
    subprocess.run(['node', OUT + '/render.js'], check=True)

def find_pages():
    """page of every article and news item, from the PDF bookmarks the browser makes from the headings.
       Read by position (the bookmark text of wrapped Arabic titles can come out jumbled):
       level 1 = contents, the 15 articles in order, then "أخبار"; the news titles are the bookmarks under "أخبار"."""
    r = PdfReader(OUT + '/AAT-articles-news.pdf')
    top = r.outline[1] if len(r.outline) > 1 and isinstance(r.outline[1], list) else []
    lvl1, kids = [], {}
    for i, it in enumerate(top):
        if isinstance(it, list): kids[len(lvl1) - 1] = it
        else: lvl1.append(it)
    pg = lambda it: r.get_destination_page_number(it) + 1
    arts = lvl1[1:1 + len(ARTS)]; news_head = len(lvl1) - 1
    news = [it for it in kids.get(news_head, []) if not isinstance(it, list)]
    assert len(arts) == len(ARTS) and len(news) == len(NEWS), (len(arts), len(news), [x.title[:20] for x in lvl1])
    out = {a['id']: pg(arts[k]) for k, a in enumerate(ARTS)}
    out.update({n['img']: pg(news[k]) for k, n in enumerate(NEWS)})
    return out, len(r.pages)

build({}); p1, n1 = find_pages(); build(p1); p2, n2 = find_pages()
print('pages', n2, 'stable' if p1 == p2 else 'CHANGED', p2)
