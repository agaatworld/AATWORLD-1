/* =============================================================================
   AAT World v3 · js/pages/reading.js — مقالات وأخبار (the reading builder)
   Routes: #reading · #articles (scrolls to the issue-560 articles) · #news (scrolls to the news)
           #article-ID · #news-ID
   Spec: DESIGN.md §4.4 (opening boards), §6.12 (#reading), §6.13 (reading pages). Contract: CONTRACT.md.
   CSS: css/reading.css, prefix .rg-

   #reading  navy board (H1 · lead · brass 13 مقالاً في العدد 560 / 26 news items · jump buttons ·
             the lead item's picture framed)
             → paper  "مقالات العدد 560" (EN: "From issue 560 (in Arabic)"): the 6 pictured articles as cards,
                      then the 7 others as rows (page stamp, headline, summary, by-line) beside the cover board
             → floor  "مقالات من أعداد سابقة": the 24 older articles as text cards (no picture box)
             → paper  "الأخبار": lead card + pictured headline rows, the other news as rows,
                      then the news in the other language under a factual sub-head
             (→ the app's floor contact band → navy footer)
   #article-ID / #news-ID
             navy board (title · by-line / issue / source · brass page or date · picture if shipped,
             or the issue cover stamped with the page for issue-560 articles)
             → paper  reading column (≤ 760 px) + sticky aside (PC) · previous / next
             → navy   "مقالات أخرى" / "مزيد من الأخبار": 4 cards (the floor contact band follows, so this
                      band is navy, not floor: two floor bands may never touch)
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT, D = AAT.data, ui = AAT.ui, esc = AAT.esc, W = window;
  var t = function (k, v) { return AAT.t('reading.' + k, v); };

  AAT.strings.reading = {
    ar: {
      h_issue: 'مقالات العدد {n}', h_older: 'مقالات من أعداد سابقة', in_issue: 'في هذا العدد',
      news_other: 'أخبار باللغة الإنجليزية', page_in: 'صفحة في العدد {n}', in_n: 'في العدد {n}', all: 'كل المقالات والأخبار',
      jumps: 'أقسام الصفحة', pn_article: 'المقال السابق والتالي', pn_news: 'الخبر السابق والتالي',
      only_article: 'هذا المقال منشور باللغة الإنجليزية فقط.', only_news: 'هذا الخبر منشور باللغة الإنجليزية فقط.',
      cover_alt: 'غلاف العدد {n} · ص. {p}'
    },
    en: {
      h_issue: 'From issue {n} (in Arabic)', h_older: 'Articles from past issues', in_issue: 'In this issue',
      news_other: 'News in Arabic', page_in: 'page in issue {n}', in_n: 'in issue {n}', all: 'All articles and news',
      jumps: 'Parts of this page', pn_article: 'Previous and next article', pn_news: 'Previous and next news item',
      only_article: 'This article is published in Arabic only.', only_news: 'This news item is published in Arabic only.',
      en_article: 'This article is shown in English.', en_news: 'This news item is shown in English.',
      cover_alt: 'Cover of issue {n} · p. {p}'
    }
  };

  /* ======================================================================
     Data helpers
     ====================================================================== */
  var M = D.magazine || {};
  /** natural size of the shipped pictures, and 'c' = a graphic with text (shown whole, never cropped). Unknown → 16:9, cover. */
  var PIC = {
    'img/art/ar26-1.jpg': [1200, 675, 'c'], 'img/art/ar26-2.jpg': [1200, 448, 'c'], 'img/art/ar26-3.jpg': [1200, 564, 'c'],
    'img/art/ar26-4.jpg': [1200, 544, 'c'], 'img/art/ar26-5.jpg': [680, 383], 'img/art/ar26-6.jpg': [1200, 570, 'c'],
    'img/news1.jpg': [905, 447], 'img/news2.jpg': [905, 447], 'img/news3.jpg': [905, 447],
    'img/arn1.jpg': [500, 360], 'img/arn2.jpg': [678, 452], 'img/enn1.jpg': [939, 705, 'c']
  };
  function pic(x) { return AAT.src(x && x.img); }
  function fitCls(x) { var p = PIC[x && x.img]; return p && p[2] === 'c' ? ' rg-fit-c' : ''; }
  /** the 13 articles of issue 560, in page order */
  function fresh() { return (D.articles || []).filter(function (a) { return a.fresh; }).sort(function (a, b) { return (a.magPage || 0) - (b.magPage || 0); }); }
  /** the 24 articles of past issues, in data order */
  function older() { return (D.articles || []).filter(function (a) { return !a.fresh; }); }
  function hasOwnTitle(x) { return !!(x.title && x.title[AAT.o]); }
  /** news in the visitor's language first (Arabic site: items with an Arabic title; other sites: items with an English title) */
  function newsSplit() {
    var own = [], other = [];
    (D.news || []).forEach(function (n) { (hasOwnTitle(n) ? own : other).push(n); });
    return { own: own, other: other, all: own.concat(other) };
  }
  var MARKS = /^[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]+/;
  /** the body in the visitor's language: own language, else English on LTR sites, else Arabic, else English */
  function bodyOf(x) {
    var B = x.body || {}, has = function (k) { return B[k] && B[k].length; };
    if (has(AAT.lang)) return { lang: AAT.lang, list: B[AAT.lang] };
    if (AAT.lang !== 'ar' && has('en')) return { lang: 'en', list: B.en };
    if (has('ar')) return { lang: 'ar', list: B.ar };
    if (has('en')) return { lang: 'en', list: B.en };
    return { lang: AAT.lang, list: [] };
  }
  /** first text paragraph of a news body (the summary on news cards) */
  function firstPara(x) {
    var b = bodyOf(x).list || [];
    for (var i = 0; i < b.length; i++) { var p = String(b[i] || '').replace(MARKS, '').trim(); if (p && !/^##/.test(p)) return p.replace(/^(\*\*|[•*\-–])\s+/, ''); }
    return '';
  }
  var HAS_AR = /[\u0600-\u06ff]/;
  /** the author's names: "جمال خطاب (Jamal Khattab)" → {ar:"جمال خطاب", lat:"Jamal Khattab"}; Arabic only → lat '' */
  function authorOf(a) {
    var s = String((a && a.author) || '').trim(); if (!s) return null;
    var m = /^(.*?)\s*\(([^)]*[A-Za-z][^)]*)\)\s*$/.exec(s);
    return { ar: (m ? m[1] : s).trim() || s, lat: m ? m[2].trim() : (HAS_AR.test(s) ? '' : s) };
  }
  /** "بقلم …" / "By …": Arabic site → the Arabic name; LTR sites → the Latin part (lists hide an Arabic-only name;
      the reading page itself keeps it in an RTL isolate: "By جمال خطاب") */
  function byHtml(a, full) {
    var p = authorOf(a); if (!p) return '';
    if (AAT.lang === 'ar') return AAT.txt(AAT.t('ar_by') + ' ' + p.ar);
    if (p.lat) return esc(AAT.t('ar_by') + ' ' + p.lat);
    return full ? esc(AAT.t('ar_by')) + ' <bdi dir="rtl" lang="ar">' + esc(p.ar) + '</bdi>' : '';
  }
  /** a copy of an article for the shared cards/rows, with the author as this page shows it (so AAT.byLine prints the same) */
  function forCard(a) {
    var p = authorOf(a); if (!p) return a;
    return Object.assign({}, a, { author: AAT.lang === 'ar' ? p.ar : (p.lat || null) });
  }
  /** a summary without the body's list markers ("** …", "• …") and direction marks */
  function clean(s) { return String(s || '').replace(MARKS, '').replace(/^(\*\*|[•*\-–])\s*/, '').trim(); }
  function host(u) { var m = /^https?:\/\/(?:www\.)?([^\/?#]+)/i.exec(String(u || '')); return m ? m[1] : ''; }
  function pdfAt(p) { return M.pdf ? M.pdf + (p ? '#page=' + p : '') : ''; }

  /* ======================================================================
     Small components of this page (built from AAT.ui parts)
     ====================================================================== */
  /** a shared article / news card, wrapped so pictures with text are shown whole */
  function card(x, kind, o) {
    return '<div class="rg-cell' + fitCls(x) + '">' + ui.articleCard(kind === 'article' ? forCard(x) : x, Object.assign({ kind: kind }, o || {})) + '</div>';
  }
  /** a text card (no picture box): headline, summary (3 lines), by-line / page / date */
  function textCard(x, kind) {
    var title = AAT.L(x.title), sum = kind === 'article' ? clean(AAT.L(x.summary)) : firstPara(x), meta = [];
    if (kind === 'article') { var by = byHtml(x); if (by) meta.push(by); if (x.magPage) meta.push(ui.folioText(x.magPage)); }
    else if (x.date) meta.push(esc(AAT.fmtDate(x.date)));
    return '<a class="rg-tc" href="#' + kind + '-' + esc(x.id) + '">' + ui.blockText(title, 'b', 'rg-tc-t clamp3') +
      (sum ? ui.blockText(sum, 'span', 'rg-tc-s clamp3') : '') + (meta.length ? '<span class="rg-tc-m">' + meta.join(' · ') + '</span>' : '') + '</a>';
  }
  /** an issue-560 article row: page stamp | headline, summary (2 lines), by-line */
  function issueRow(a) {
    var by = byHtml(a);
    return '<a class="rg-row" href="#article-' + esc(a.id) + '"><span class="rg-row-p" dir="' + AAT.dir + '">' + ui.folio(a.magPage) + '</span><span class="rg-row-b">' + ui.blockText(AAT.L(a.title), 'b', 'rg-row-t') +
      (clean(AAT.L(a.summary)) ? ui.blockText(clean(AAT.L(a.summary)), 'span', 'rg-row-s clamp2') : '') + (by ? '<span class="rg-row-m">' + by + '</span>' : '') + '</span></a>';
  }
  /** a headline row (shared), wrapped for the picture fit */
  function hlRow(x, kind, picToo) {
    return '<div class="rg-hlw' + fitCls(x) + '">' + ui.headlineRow(x, { kind: kind, pic: picToo !== false }) + '</div>';
  }
  /** article body → HTML: "## " sub-heads as H3, "•"/"-"/"**" lines as list rows, "1- " lines with a number tile */
  function bodyHtml(list, lang) {
    var out = [], items = [], ar = lang === 'ar';
    var tx = function (s) { return ar ? AAT.arx(s) : esc(s); };
    var flush = function () { if (items.length) { out.push('<ul class="rg-list">' + items.join('') + '</ul>'); items = []; } };
    (list || []).forEach(function (raw) {
      var p = String(raw == null ? '' : raw).replace(MARKS, '').trim(), m;
      if (!p) return;
      if (/^##/.test(p)) { flush(); var h = p.replace(/^##\s*/, '').replace(/^[:：]\s*/, ''); if (h) out.push('<h3>' + tx(h) + '</h3>'); return; }
      if ((m = /^(?:\*\*|[•*\-–])\s*(.+)$/.exec(p)) && !/^-?\d/.test(p)) { items.push('<li>' + tx(m[1]) + '</li>'); return; }
      flush();
      if ((m = /^(\d{1,2})\s*[-.)]\s+(.+)$/.exec(p))) { out.push('<p class="rg-step"><b class="rg-n"><bdi dir="ltr">' + m[1] + '</bdi></b><span>' + tx(m[2]) + '</span></p>'); return; }
      out.push('<p>' + tx(p) + '</p>');
    });
    flush();
    return out.join('');
  }

  /* ======================================================================
     #reading — مقالات وأخبار (§6.12)
     ====================================================================== */
  var PARTS = { articles: 'rg-issue', news: 'rg-news', article: 'rg-issue' };
  var SIDE_N = 7;   // news rows beside the lead card (pictured ones first), so the side column matches the card
  function jump(label, n, to, hash) {
    return ui.button({ kind: 'ghost', size: 's', act: 'rg-jump', cls: 'rg-jump', attrs: { 'data-to': to, 'data-hash': hash },
      html: '<span>' + AAT.txt(label) + '</span><span class="rg-jn"><bdi dir="ltr">' + AAT.num(n) + '</bdi></span>' });
  }
  function readingPage() {
    var S = AAT.stats, F = fresh(), O = older(), N = newsSplit();
    var ar = AAT.rtl;
    /* the opening board: Arabic → the issue's lead article (its photograph); other languages → the first news item with a picture */
    var leadArt = AAT.article('ar26-5');
    if (!leadArt || !pic(leadArt)) leadArt = F.filter(pic)[0] || null;
    var leadNews = N.own.filter(pic)[0] || null;
    var picture = '';
    if (ar && leadArt) {
      var pa = PIC[leadArt.img] || [1600, 900];
      picture = ui.frame({ src: leadArt.img, alt: AAT.L(leadArt.title), w: pa[0], h: pa[1], eager: true, href: '#article-' + leadArt.id, cls: 'rg-obf',
        cap: AAT.L(leadArt.title), sub: AAT.issueLine().split(' · ')[0] + ' · ' + AAT.t('app.page_stamp', { n: leadArt.magPage }) });
    } else if (leadNews) {
      var pn = PIC[leadNews.img] || [1600, 900];
      picture = ui.frame({ src: leadNews.img, alt: AAT.L(leadNews.title), w: pn[0], h: pn[1], eager: true, href: '#news-' + leadNews.id, cls: 'rg-obf',
        cap: AAT.L(leadNews.title), sub: leadNews.date ? AAT.fmtDate(leadNews.date) : '' });
    }
    var figure = ar ? { n: AAT.num(S.articlesFresh), label: AAT.count(S.articlesFresh, 'article', true) + ' ' + t('in_n', { n: M.number }) }
      : { n: AAT.num(S.news), label: AAT.count(S.news, 'news', true) };
    var jumps = '<div class="rg-jumps" role="group" aria-label="' + esc(t('jumps')) + '">' +
      jump(t('h_issue', { n: M.number }), F.length, 'rg-issue', 'articles') + jump(t('h_older'), O.length, 'rg-older', 'reading') + jump(AAT.t('news_title'), N.all.length, 'rg-news', 'news') + '</div>';
    var board = ui.openingBoard({ h1: AAT.t('app.nav_reading'), lead: AAT.t('ar_lead', { n: M.number }), figure: figure, actions: jumps, picture: picture, cls: 'rg-ob' });

    /* 2. the issue-560 articles (paper): pictured cards, then rows beside the cover board */
    var withPic = F.filter(pic), noPic = F.filter(function (a) { return !pic(a); });
    var cards = withPic.length ? '<div class="rg-pics' + (withPic.length % 3 === 0 || withPic.length < 3 ? '' : ' rg-pics-2') + '">' + withPic.map(function (a) { return card(a, 'article'); }).join('') + '</div>' : '';
    var rows = noPic.length ? '<div class="rg-more2"><div class="board rg-rows"' + (ar ? '' : ' dir="rtl" lang="ar"') + '>' + noPic.map(issueRow).join('') + '</div><div class="rg-cvw">' + ui.coverBoard({ buttons: true }) + '</div></div>' : '';
    var issue = ui.section({ id: 'rg-issue', band: 'paper', title: t('h_issue', { n: M.number }),
      meta: AAT.count(F.length, 'article') + ' · ' + AAT.issueLine(), body: cards + rows });

    /* 3. articles of past issues (floor): text cards in the visitor's language */
    var past = ui.section({ id: 'rg-older', band: 'floor', title: t('h_older'), meta: AAT.count(O.length, 'article'),
      body: '<div class="rg-tcs">' + O.map(function (a) { return textCard(a, 'article'); }).join('') + '</div>' });

    /* 4. news (paper): lead card + pictured rows, then the other news as rows, then the other language's news */
    var ownPic = N.own.filter(pic), lead = ownPic[0] || null, picSide = ownPic.slice(1, 5);
    var used = {}; if (lead) used[lead.id] = 1; picSide.forEach(function (n) { used[n.id] = 1; });
    var rest = N.own.filter(function (n) { return !used[n.id]; });
    var fill = lead ? Math.max(0, SIDE_N - picSide.length) : 0;
    var side = picSide.concat(rest.slice(0, fill)); rest = rest.slice(fill);
    var top = lead ? '<div class="rg-ntop"><div class="rg-nlead' + fitCls(lead) + '">' + ui.articleCard(lead, { kind: 'news', lead: true, summary: firstPara(lead) }) + '</div>' +
      (side.length ? '<div class="rg-nside">' + side.map(function (n) { return hlRow(n, 'news'); }).join('') + '</div>' : '') + '</div>' : '';
    var list = rest.length ? '<div class="rg-hls">' + rest.map(function (n) { return hlRow(n, 'news'); }).join('') + '</div>' : '';
    var otherL = N.other.length ? '<h3 class="h3 rg-sub">' + esc(t('news_other')) + ' <span class="rg-subn"><bdi dir="ltr">' + AAT.num(N.other.length) + '</bdi></span></h3>' +
      '<div class="rg-hls" dir="' + (ar ? 'ltr' : 'rtl') + '" lang="' + (ar ? 'en' : 'ar') + '">' + N.other.map(function (n) { return hlRow(n, 'news'); }).join('') + '</div>' : '';
    var news = ui.section({ id: 'rg-news', band: 'paper', title: AAT.t('news_title'), meta: AAT.count(N.all.length, 'news'), body: top + list + otherL });

    return board + issue + past + news;   // navy → paper → floor → paper → (floor contact band) → navy footer
  }

  /* ======================================================================
     #article-ID and #news-ID (§6.13)
     ====================================================================== */
  function seqOf(x, kind) {
    if (kind === 'news') return newsSplit().all;
    return x.fresh ? fresh() : older();
  }
  /** n items after x in its sequence (wrapping), without x */
  function after(seq, x, n) {
    var i = seq.indexOf(x), out = [];
    for (var k = 1; k < seq.length && out.length < n; k++) out.push(seq[(i + k) % seq.length]);
    return out;
  }
  function itemPage(ctx, kind) {
    var x = kind === 'news' ? AAT.newsItem(ctx.rest) : AAT.article(ctx.rest);
    if (!x) return null;
    var B = bodyOf(x), title = AAT.L(x.title);
    if (!title && !B.list.length) return null;
    var isFresh = kind === 'article' && x.fresh && x.magPage;

    /* opening board */
    var meta = [];
    if (kind === 'article') { var by = byHtml(x, true); if (by) meta.push(by); if (isFresh) meta.push(AAT.txt(AAT.issueLine())); }
    else if (x.source && host(x.source)) meta.push(esc(AAT.t('news_source')) + ': ' + AAT.lt(host(x.source)));
    var figure = null;
    if (isFresh) figure = { n: String(x.magPage), label: t('page_in', { n: M.number }) };
    else if (kind === 'news' && x.date) {
      var d = x.date.split('-');
      figure = /^(zh-TW|zh-CN)$/.test(AAT.lang) ? { n: AAT.fmtDate(x.date), label: '' } : { n: String(+d[2]), label: AAT.monthName(+d[1]) + ' ' + d[0] };
    }
    var picture = '';
    if (pic(x)) {
      var pp = PIC[x.img] || [1600, 900];
      picture = ui.frame({ src: x.img, alt: title, w: pp[0], h: pp[1], eager: true, cls: 'rg-obf' + (pp[2] === 'c' ? ' rg-obf-c' : '') });
    } else if (isFresh && AAT.src(M.cover)) {
      picture = '<a class="rg-cov" href="#magazine">' + AAT.img(M.cover, { alt: t('cover_alt', { n: M.number, p: x.magPage }), w: 617, h: 873, eager: true }) +
        ui.stamp(AAT.t('app.page_stamp', { n: x.magPage })) + '</a>';
    }
    var lead = kind === 'article' && !x.fresh ? clean(AAT.L(x.summary)) : '';
    var board = ui.openingBoard({ h1: title, lead: lead, meta: meta.length ? meta.join(' · ') : '', figure: figure, picture: picture, cls: 'rg-ob rg-ob-item' });

    /* the reading column: a factual note when the text is in another language, the text, previous / next */
    var note = '';
    if (B.lang === 'ar' && !AAT.rtl) note = t(kind === 'news' ? 'only_news' : 'only_article');
    else if (B.lang === 'en' && AAT.rtl) note = AAT.strings.reading.ar[kind === 'news' ? 'only_news' : 'only_article'];
    else if (B.lang === 'en' && AAT.lang !== 'en') note = t(kind === 'news' ? 'en_news' : 'en_article');
    var bdir = B.lang === 'ar' ? 'rtl' : 'ltr';
    var prose = '<div class="prose rg-prose" dir="' + bdir + '" lang="' + esc(B.lang) + '">' + bodyHtml(B.list, B.lang) + '</div>';
    var seq = seqOf(x, kind), i = seq.indexOf(x), prev = i > 0 ? seq[i - 1] : null, next = i >= 0 && i < seq.length - 1 ? seq[i + 1] : null;
    var pn = function (y, which) {
      if (!y) return '';
      var lbl = AAT.t(which === 'prev' ? 'prev' : 'next');
      var ic = which === 'prev' ? AAT.icon('back', 24) : AAT.icon('arrow', 24);
      return '<a class="rg-pn-i rg-' + which + '" href="#' + kind + '-' + esc(y.id) + '"><span class="rg-pn-k">' + (which === 'prev' ? ic + '<span>' + esc(lbl) + '</span>' : '<span>' + esc(lbl) + '</span>' + ic) + '</span>' +
        ui.blockText(AAT.L(y.title), 'b', 'rg-pn-t clamp2') + '</a>';
    };
    var pnav = prev || next ? '<nav class="rg-pn" aria-label="' + esc(t(kind === 'news' ? 'pn_news' : 'pn_article')) + '">' + pn(prev, 'prev') + pn(next, 'next') + '</nav>' : '';

    /* the aside: six more of the same kind; issue articles add "شاهدها في المجلة" (the PDF at that page; pages 1–12 open the reader) */
    var others = after(seq, x, 6), asideH, rowsA;
    if (kind === 'news') { asideH = AAT.t('news_title'); rowsA = others.map(function (n) { return ui.headlineRow(n, { kind: 'news', pic: false }); }).join(''); }
    else if (x.fresh) {
      asideH = t('in_issue');
      rowsA = others.map(function (a) { return '<a class="row rg-arow" href="#article-' + esc(a.id) + '">' + ui.folio(a.magPage) + ui.blockText(AAT.L(a.title), 'span', 'rg-arow-t clamp2') + '</a>'; }).join('');
    } else { asideH = t('h_older'); rowsA = others.map(function (a) { return ui.headlineRow(forCard(a), { kind: 'article', pic: false }); }).join(''); }
    var magBtn = '';
    if (isFresh) {
      magBtn = x.magPage <= (M.prototypePages || 0) ? ui.button({ label: AAT.t('ar_in_mag'), href: '#flip-' + x.magPage, icon: 'book', block: true })
        : (pdfAt(x.magPage) ? ui.button({ label: AAT.t('ar_in_mag'), href: pdfAt(x.magPage), newTab: true, icon: 'pdf', block: true }) : '');
    }
    var aside = rowsA ? '<aside class="board board-red rg-aside" aria-labelledby="rg-aside-h"><h2 class="rg-aside-h" id="rg-aside-h">' + esc(asideH) + '</h2><div class="rg-aside-l">' + rowsA + '</div>' + (magBtn ? '<div class="rg-aside-b">' + magBtn + '</div>' : '') + '</aside>' : '';
    var text = ui.section({ id: 'rg-text', band: 'paper', untitled: true, cls: 'rg-textband',
      body: '<div class="rg-read' + (aside ? '' : ' rg-read-solo') + '"><div class="rg-main">' + (note ? '<p class="rg-note">' + AAT.txt(note) + '</p>' : '') + prose + pnav + '</div>' + aside + '</div>' });

    /* more (navy): four cards; pictured ones when there are enough, else text cards */
    var pool;
    if (kind === 'news') pool = newsSplit().own;
    else if (AAT.rtl) pool = fresh().concat(older());
    else pool = older().concat(fresh());
    pool = pool.filter(function (y) { return y !== x; });
    var pics = pool.filter(pic), moreHtml;
    if (pics.length >= 3) {
      var k = Math.min(4, pics.length);
      moreHtml = '<div class="grid g-' + k + ' rg-mcards">' + pics.slice(0, k).map(function (y) { return card(y, kind); }).join('') + '</div>';
    } else {
      var same = kind === 'news' ? pool : pool.filter(function (y) { return !!y.fresh === !!x.fresh; });
      moreHtml = '<div class="grid g-4 rg-mcards">' + (same.length >= 4 ? same : pool).slice(0, 4).map(function (y) { return textCard(y, kind); }).join('') + '</div>';
    }
    var more = ui.section({ id: 'rg-more', band: 'night', title: AAT.t(kind === 'news' ? 'news_more' : 'ar_more'),
      action: kind === 'news' ? { label: AAT.t('news_all'), href: '#news', iconEnd: 'arrow' } : { label: t('all'), href: '#reading', iconEnd: 'arrow' }, body: moreHtml });

    return board + text + more;   // navy → paper → navy → (floor contact band) → navy footer
  }

  /* ======================================================================
     Scrolling to a part (#articles, #news, the board's jump buttons)
     ====================================================================== */
  var state = { list: false, pending: null };
  function reduced() { try { return W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function toPart(id, smooth) {
    var el = document.getElementById(id); if (!el) return;
    try { el.scrollIntoView({ block: 'start', behavior: smooth && !reduced() ? 'smooth' : 'auto' }); } catch (e) { el.scrollIntoView(true); }
    var h = AAT.$('h2', el);
    if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }
  AAT.acts['rg-jump'] = function (el) {
    var to = el.getAttribute('data-to'), hash = el.getAttribute('data-hash');
    toPart(to, true);
    if (hash) AAT.setHash(hash);
  };
  function isList(ctx) {
    if (ctx.head === 'reading' || ctx.head === 'articles') return !ctx.rest;
    if (ctx.head === 'news' || ctx.head === 'article') return !ctx.rest;
    return false;
  }

  AAT.pages.reading = {
    /** #reading · #articles · #news → the list page; #article-ID · #news-ID → a reading page; anything else → null (404) */
    render: function (ctx) {
      state.list = false;
      if (isList(ctx)) { state.list = true; return readingPage(); }
      if (ctx.head === 'article') return itemPage(ctx, 'article');
      if (ctx.head === 'news') return itemPage(ctx, 'news');
      return null;
    },
    /** #articles / #news open the list page at their part */
    mount: function (ctx) {
      var id = state.list ? PARTS[ctx.head] : null;
      state.pending = id || null;
      if (!id) return;
      toPart(id, false);
      if (document.fonts && document.fonts.status !== 'loaded' && document.fonts.ready) {
        document.fonts.ready.then(function () { if (state.pending === id && state.list) toPart(id, false); }, function () {});
      }
    },
    unmount: function () { state.list = false; state.pending = null; },
    /** on the list page, #reading / #articles / #news only scroll (no re-render) */
    update: function (ctx) {
      if (!state.list || !isList(ctx)) return false;
      state.pending = null;
      var id = PARTS[ctx.head];
      if (id) toPart(id, true);
      else {
        try { W.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) { W.scrollTo(0, 0); }
        var h1 = AAT.$('#view h1'); if (h1) { h1.setAttribute('tabindex', '-1'); try { h1.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      }
      return true;
    }
  };
}());
