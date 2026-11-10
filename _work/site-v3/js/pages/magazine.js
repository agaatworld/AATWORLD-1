/* =============================================================================
   AAT World v3 · js/pages/magazine.js — #magazine (المجلة) and the reader #flip / #flip-NN
   Owner: the magazine page builder. Only this builder edits this file and css/magazine.css.
   Spec: DESIGN.md §6.3 (#magazine) and §6.4 (#flip). Contract: CONTRACT.md. Prefixes: .mg- (page), .rd- (reader).

   #magazine   navy opening board (H1, brass 560, counters, the cover on a white board)
               → paper "فهرس العدد" (articles board + advertisers board, rows link to articles / companies)
               → navy "صفحات العدد" (the shipped page thumbnails → #flip-NN)
               → floor "أعلن معنا" (the 6 ad positions as rows) → paper "عن المجلة" (am_p1 + 3 counters)
               → (the app adds the floor contact band and the navy footer)
   #flip-NN    full screen reader over the site (chrome:false). Pages fit the window HEIGHT (never cropped);
               two pages side by side only when both fit; spreads [1],[2|3]… with the lower page on the RIGHT
               in every language (the printed book reads right to left, so "next" is the LEFT arrow);
               arrows, keyboard (← next, → previous, Home, End, Esc), swipe, click on the outer half of a page;
               contents drawer; page jump; zoom 2× with drag; fullscreen (click only, rejection handled);
               advertiser pages open the company panel and NEVER change the page; after the last shipped page
               the end panel with the PDF; the last page is remembered (localStorage 'aat3.flip', try/catch).
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT, D = AAT.data, ui = AAT.ui, esc = AAT.esc, W = window;
  var M = D.magazine || {}, TOC = M.toc || { articles: [], ads: [] };
  var t = function (k, v) { return AAT.t('magazine.' + k, v); };

  AAT.nouns.adpage = { ar: ['صفحة إعلانية', 'صفحات إعلانية', 'صفحة إعلانية'], en: ['ad page', 'ad pages'] };

  AAT.strings.magazine = {
    ar: {
      h1: 'المجلة', fig: 'العدد · {m}', toc_h: 'فهرس العدد', arts_h: 'المقالات', ads_h: 'المعلنون', pages_h: 'صفحات العدد',
      pdf_full: 'العدد كاملاً بصيغة PDF', adv_more: 'تفاصيل الإعلان', about_h: 'عن المجلة',
      contents: 'المحتويات', full: 'ملء الشاشة', full_exit: 'إنهاء ملء الشاشة', full_na: 'ملء الشاشة غير متاح في هذا العرض',
      zoom: 'تكبير', zoom_out: 'تصغير', close: 'إغلاق', page: 'الصفحة', go: 'اذهب', next: 'الصفحة التالية', prev: 'الصفحة السابقة',
      jump_bad: 'اكتب رقم صفحة من 1 إلى {n}', end_h: 'اقرأ العدد كاملاً بصيغة PDF', end_rest: 'الصفحات {a}–{b} في ملف PDF',
      end_one: 'الصفحة {n} في ملف PDF', open_pdf: 'افتح ملف PDF', toc_btn: 'الفهرس', co_page: 'صفحة الشركة', read_art: 'اقرأ المقال',
      pages: 'الصفحات', ad_open: '{c} · افتح بطاقة الشركة', page_n: 'صفحة {n}', stage: 'صفحات المجلة', thumbs: 'صفحات العدد',
      products_n: '{n} في صفحة الشركة', address: 'العنوان'
    },
    en: {
      h1: 'The magazine', fig: 'Issue · {m}', toc_h: 'Contents of the issue', arts_h: 'Articles (in Arabic)', ads_h: 'Advertisers', pages_h: 'Pages of the issue',
      pdf_full: 'The full issue as a PDF', adv_more: 'Advertising details', about_h: 'About the magazine',
      contents: 'Contents', full: 'Full screen', full_exit: 'Exit full screen', full_na: 'Full screen is not available in this view',
      zoom: 'Zoom in', zoom_out: 'Zoom out', close: 'Close', page: 'Page', go: 'Go', next: 'Next page', prev: 'Previous page',
      jump_bad: 'Type a page number from 1 to {n}', end_h: 'Read the full issue as a PDF', end_rest: 'Pages {a}–{b} are in the PDF',
      end_one: 'Page {n} is in the PDF', open_pdf: 'Open the PDF', toc_btn: 'Contents', co_page: 'Company page', read_art: 'Read the article',
      pages: 'Pages', ad_open: '{c} · open the company card', page_n: 'Page {n}', stage: 'Magazine pages', thumbs: 'Pages of the issue',
      products_n: '{n} on the company page', address: 'Address'
    }
  };

  /* ======================================================================
     Data helpers (everything from data.json)
     ====================================================================== */
  var RATIO = ((M.pageSize && M.pageSize.w) || 1100) / ((M.pageSize && M.pageSize.h) || 1555);
  var PAGES = M.pages || 100;
  var LAST = 0;                                  // last shipped page (1–12 in the prototype)
  while (LAST < (M.prototypePages || 0) && AAT.pageImg(LAST + 1)) LAST += 1;
  var END = LAST + 1;                            // the end panel ("read the full issue as a PDF")
  var CO_OF = {}, ART_OF = {}, AD_OF = {};       // page → companyId / toc article / toc ad
  (M.companyPages || []).forEach(function (x) { (x.pages || []).forEach(function (p) { CO_OF[p] = x.companyId; }); });
  (TOC.articles || []).forEach(function (a) { ART_OF[a.page] = a; });
  (TOC.ads || []).forEach(function (a) { AD_OF[a.page] = a; });

  /** contiguous runs of page numbers: [2,11] → [[2],[11]] ; [52,53,54,55] → [[52,53,54,55]] */
  function runs(pages) {
    var out = [], cur = null;
    pages.slice().sort(function (a, b) { return a - b; }).forEach(function (p) {
      if (cur && p === cur[cur.length - 1] + 1) cur.push(p); else { cur = [p]; out.push(cur); }
    });
    return out;
  }
  /** the 45 ad pages of the TOC grouped by advertiser, in page order: {c (company or null), row (toc row), pages[]} */
  var GROUPS = (function () {
    var out = [], by = {};
    (TOC.ads || []).forEach(function (a) {
      var key = a.companyId != null ? 'c' + a.companyId : 'n' + a.company;
      var g = by[key];
      if (!g) { g = by[key] = { c: a.companyId != null ? AAT.company(a.companyId) : null, row: a, pages: [] }; out.push(g); }
      g.pages.push(a.page);
    });
    return out;
  }());
  function shortName(s) { return String(s || '').replace(/ (Co\.|Corp\.|Technologies|Electronic|Plastic|Industry|Industrial|·).*$/, '').trim(); }
  function pageAlt(n) {
    var cid = CO_OF[n], c = cid != null ? AAT.company(cid) : null;
    return t('page_n', { n: n }) + (c ? ' · ' + c.company : '');
  }
  function stamps(pages) { return runs(pages).map(function (r) { return ui.folio(r); }).join(''); }
  /** advertiser names: Arabic name (Arabic site) over the Latin name, or the Latin name alone */
  function names(g, cls) {
    var c = g.c, lat = c ? c.company : g.row.company, ar = c ? c.nameAr : g.row.nameAr;
    if (AAT.lang === 'ar' && ar) return '<b class="' + cls + '-ar">' + esc(ar) + '</b>' + AAT.ltb(lat, 'span', cls + '-lt ' + cls + '-sub');
    return AAT.ltb(lat, 'b', cls + '-lt');
  }
  function catOf(g) { return (g.c && AAT.cat(g.c.cat)) || g.row.cat || null; }
  function fullscreenOk() { var d = document; return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled); }
  function isFull() { var d = document; return !!(d.fullscreenElement || d.webkitFullscreenElement); }
  function store(n) { try { W.localStorage.setItem('aat3.flip', String(n)); } catch (e) { /* storage blocked: fine */ } }
  function stored() {
    try { var v = parseInt(W.localStorage.getItem('aat3.flip'), 10); return v >= 1 && v <= LAST ? v : null; } catch (e) { return null; }
  }

  /* ======================================================================
     #magazine — المجلة (DESIGN.md §6.3)
     ====================================================================== */
  function magazinePage() {
    var S = AAT.stats, arts = (TOC.articles || []).length, adPages = (TOC.ads || []).length;

    /* 1. opening board: H1, lead, brass 560, three counters; the cover on a white board with the stamp and the read/PDF buttons */
    var board = ui.openingBoard({
      cls: 'mg-ob', h1: t('h1'), lead: AAT.t('mb_claim'),
      figure: { n: String(M.number), label: t('fig', { m: AAT.L(M.month) }) },
      extra: ui.counters([
        { n: PAGES, label: AAT.count(PAGES, 'page', true), href: '#flip-1' },
        { n: arts, label: AAT.count(arts, 'article', true), href: '#reading' },
        { n: S.companies, label: AAT.count(S.companies, 'advertiser', true), href: '#companies' }
      ], { cls: 'mg-cnts' }),
      picture: ui.coverBoard({ buttons: true })
    });

    /* 2. فهرس العدد (paper): the articles board and the advertisers board */
    var artRows = (TOC.articles || []).map(function (a) {
      var inner = ui.folio(a.page, { chip: true }) + ui.blockText(AAT.L(a.title), 'span', 'mg-art-t');
      return AAT.article(a.articleId) ? '<a class="row mg-art" href="#article-' + esc(a.articleId) + '">' + inner + '</a>' : '<div class="row mg-art">' + inner + '</div>';
    }).join('');
    var adRows = GROUPS.map(function (g) {
      var c = g.c, cat = catOf(g);
      var logo = c && c.logo && AAT.src(c.logo) ? '<span class="mg-ad-logo">' + AAT.img(c.logo, { alt: '', w: 120, h: 52 }) + '</span>' : '';
      var inner = '<span class="mg-ad-pg">' + stamps(g.pages) + '</span><span class="mg-ad-n">' + names(g, 'mg-ad') +
        (cat ? '<span class="mg-ad-f">' + AAT.txt(AAT.L(cat)) + '</span>' : '') + '</span>' + logo;
      return c ? '<a class="row mg-ad" href="#company-' + c.id + '">' + inner + '</a>' : '<div class="row mg-ad">' + inner + '</div>';
    }).join('');
    var toc = ui.section({
      id: 'mg-toc', band: 'paper', title: t('toc_h'),
      meta: [AAT.count(PAGES, 'page'), AAT.count(arts, 'article'), AAT.count(adPages, 'adpage')].join(' · '),
      action: { label: AAT.t('fl_open'), href: '#flip-1', icon: 'book' },
      body: '<div class="mg-toc">' +
        '<div class="mg-box"><div class="mg-box-h"><h3>' + esc(t('arts_h')) + '</h3><p>' + esc(AAT.count(arts, 'article')) + '</p></div><div class="mg-list mg-arts">' + artRows + '</div></div>' +
        '<div class="mg-box"><div class="mg-box-h"><h3>' + esc(t('ads_h')) + '</h3><p>' + esc(AAT.count(adPages, 'adpage')) + '</p></div><div class="mg-list mg-ads">' + adRows + '</div></div>' +
        '</div>'
    });

    /* 3. صفحات العدد (navy): the shipped page thumbnails → the reader at that page */
    var th = '';
    for (var n = 1; n <= LAST; n++) {
      if (!AAT.thumb(n)) continue;
      th += '<li><a class="mg-th" href="#flip-' + n + '">' + AAT.img(AAT.thumb(n), { alt: pageAlt(n), w: 220, h: 311 }) + '<span class="mg-th-n">' + ui.folioText(n) + '</span></a></li>';
    }
    var pages = th ? ui.section({
      id: 'mg-pages', band: 'night', title: t('pages_h'), meta: AAT.t('fl_pages', { a: 1, b: LAST, n: PAGES }),
      action: { label: t('pdf_full'), href: M.pdf, newTab: true, icon: 'pdf' },
      body: '<ol class="mg-ths">' + th + '</ol>'
    }) : '';

    /* 4. أعلن معنا (floor): the six ad positions as rows (name · print line · example advertiser's real logo) */
    var A = D.advertise || {};
    var pos = (A.positions || []).slice().sort(function (a, b) { return a.order - b.order; }).map(function (p, i) {
      var ex = p.exampleCompanyId != null ? AAT.company(p.exampleCompanyId) : null;
      var exHtml = ex && ex.logo && AAT.src(ex.logo) ? '<a class="mg-pos-ex" href="#company-' + ex.id + '" title="' + esc(AAT.L(A.exampleLabel) + ' ' + ex.company) + '">' +
        AAT.img(ex.logo, { alt: ex.company, w: 120, h: 56 }) + '</a>' : '';
      return '<div class="mg-pos-r"><span class="mg-pos-i"><bdi dir="ltr">' + ('0' + (i + 1)).slice(-2) + '</bdi></span><span class="mg-pos-t"><b>' + esc(AAT.L(p.name)) + '</b><span>' +
        AAT.txt(AAT.L(p.print)) + '</span></span>' + exHtml + '</div>';
    }).join('');
    var adv = ui.section({
      id: 'mg-advertise', band: 'floor', title: AAT.t('adv_btn'), meta: AAT.L(A.positionsTitle),
      action: { label: t('adv_more'), href: '#advertise', icon: 'arrow' },
      body: '<div class="mg-pos">' + pos + '</div>'
    });

    /* 5. عن المجلة (paper): am_p1 + the three facts of the magazine */
    var F = (D.about && D.about.facts) || {}, L = F.labels || {};
    var about = ui.section({
      id: 'mg-about', band: 'paper', title: t('about_h'),
      action: { label: AAT.t('app.nav_about'), href: '#about', kind: 'line' },
      body: '<div class="mg-about"><div class="prose"><p>' + AAT.txt(AAT.t('am_p1')) + '</p></div>' + ui.counters([
        { n: F.years, label: AAT.L(L.years) },
        { n: F.issues, label: AAT.L(L.issues) },
        { n: String(F.since), label: AAT.L(L.since) }
      ], { cls: 'mg-facts' }) + '</div>'
    });

    return board + toc + pages + adv + about; // navy → paper → navy → floor → paper → (floor contact band) → navy footer
  }

  /* ======================================================================
     #flip — the reader (DESIGN.md §6.4)
     ====================================================================== */
  var R = null;            // reader state while it is mounted
  var backHash = null;     // where "إغلاق" returns to (the route before the reader)
  var PRE = {};            // preloaded page pictures

  /** #flip → remembered page (or 1); #flip-N → page N (1..LAST) or the end panel for N in LAST+1..100; anything else → null (404) */
  function parseFlip(ctx) {
    if (!ctx.rest) return { p: stored() || 1, req: null };
    if (ctx.id == null || ctx.id < 1 || ctx.id > PAGES) return null;
    return ctx.id <= LAST ? { p: ctx.id, req: null } : { p: END, req: ctx.id };
  }
  /** pages shown for page p: [1], [2,3], [4,5] … [12,END]; one page when two do not fit; END alone when a page beyond the sample was asked for */
  function spreadOf(p, two) {
    if (p >= END && R && R.req) return [END];
    if (!two || p === 1) return [Math.min(p, END)];
    var a = p % 2 === 0 ? p : p - 1;
    if (a >= END) return [END];
    return [a, Math.min(a + 1, END)];
  }
  function nextOf(s) { var l = s[s.length - 1]; return l >= END ? null : l + 1; }
  function prevOf(s) { var f = s[0]; return f <= 1 ? null : (R.two ? Math.max(1, f - 1) : f - 1); }

  function arrow(kind, bar) {
    return '<button type="button" class="rd-arrow rd-' + kind + (bar ? ' rd-barr' : ' rd-desk-arr') + '" data-act="rd-' + kind + '" aria-label="' + esc(t(kind)) + '">' +
      AAT.icon(kind === 'next' ? 'arrow' : 'back', bar ? 28 : 32) + '</button>';
  }
  function closeBtn() { return ui.button({ label: t('close'), act: 'rd-side-close', kind: 'ghost', size: 's', icon: 'close', cls: 'rd-x' }); }
  function pdfBtn(kind, cls) { return ui.button({ html: '<bdi dir="ltr">PDF</bdi>', href: M.pdf, newTab: true, kind: kind, size: 's', icon: 'pdf', cls: cls }); }

  function readerHtml() {
    var fs = fullscreenOk(), C = D.config;
    var top = '<header class="rd-top"><div class="rd-top-in">' +
      '<a class="rd-logo" href="#home" aria-label="' + esc(AAT.t('app.home_logo')) + '"><img src="' + esc(AAT.src(C.logo.white)) + '" alt="AAT · Ideas For Business" width="120" height="40"></a>' +
      '<h1 class="rd-h1">' + AAT.txt(AAT.issueLine()) + '</h1>' +
      '<p class="rd-count"><bdi dir="ltr" id="rd-count"></bdi></p>' +
      '<div class="rd-tbtns">' +
      ui.button({ label: t('contents'), act: 'rd-toc', kind: 'ghost', size: 's', icon: 'menu', cls: 'rd-tb rd-tb-toc', attrs: { 'aria-expanded': 'false', 'aria-controls': 'rd-side' } }) +
      pdfBtn('ghost', 'rd-tb rd-tb-x') +
      (fs ? ui.button({ label: t('full'), act: 'rd-full', kind: 'ghost', size: 's', icon: 'full', cls: 'rd-tb rd-tb-x rd-full', attrs: { 'aria-pressed': 'false' } }) : '') +
      ui.button({ label: t('zoom'), act: 'rd-zoom', kind: 'ghost', size: 's', icon: 'zoom', cls: 'rd-tb rd-tb-x rd-zoom', attrs: { 'aria-pressed': 'false' } }) +
      ui.button({ label: t('close'), act: 'rd-close', kind: 'ghost', size: 's', icon: 'close', cls: 'rd-tb' }) +
      '</div></div></header>';
    var main = '<div class="rd-main"><div class="rd-desk" id="rd-desk" dir="rtl">' +
      '<div class="rd-stage" id="rd-stage" role="group" aria-label="' + esc(t('stage')) + '"></div>' + arrow('prev') + arrow('next') + '</div>' +
      '<div class="rd-scrim" data-act="rd-side-close" aria-hidden="true" hidden></div>' +
      '<aside class="rd-side" id="rd-side" role="dialog" aria-labelledby="rd-side-t" hidden></aside></div>';
    var th = '';
    for (var n = 1; n <= LAST; n++) {
      th += '<li><button type="button" class="rd-th" data-act="rd-go" data-p="' + n + '" aria-label="' + esc(t('page_n', { n: n })) + '">' +
        AAT.img(AAT.thumb(n), { alt: '', w: 37, h: 52, eager: true }) + '</button></li>';
    }
    var bot = '<footer class="rd-bot"><div class="rd-bot-in" dir="rtl">' + arrow('prev', true) +
      '<form class="rd-jump" data-act="rd-jump" novalidate dir="' + AAT.dir + '"><label for="rd-n">' + esc(t('page')) + '</label>' +
      '<span class="rd-jn" dir="ltr"><input id="rd-n" name="n" type="number" inputmode="numeric" min="1" max="' + PAGES + '" value="1" autocomplete="off">' +
      '<span class="rd-of">/ ' + PAGES + '</span></span><button class="btn btn-ghost btn-s rd-go" type="submit">' + esc(t('go')) + '</button></form>' +
      (th ? '<ol class="rd-ths" dir="rtl" aria-label="' + esc(t('thumbs')) + '">' + th + '</ol>' : '') + arrow('next', true) + '</div></footer>';
    return '<div class="rd" id="rd">' + top + main + bot + '</div>';
  }

  /** one page of the spread. idx/len tell which outer half turns the page (right page → previous, left page → next) */
  function pageHtml(n, idx, len, canPrev, canNext) {
    if (n >= END) return endHtml(len === 1);
    var src = AAT.pageImg(n), th = AAT.thumb(n), cid = CO_OF[n], c = cid != null ? AAT.company(cid) : null;
    var img = '<img src="' + esc(src) + '" alt="' + esc(pageAlt(n)) + '" width="1100" height="1555" decoding="async" draggable="false">';
    var bg = th ? ' style="background-image:url(&quot;' + esc(th) + '&quot;)"' : '';
    if (c) return '<button type="button" class="rd-pg rd-ad" data-p="' + n + '" data-co="' + c.id + '" aria-label="' + esc(t('ad_open', { c: c.company }) + ' · ' + t('page_n', { n: n })) + '"' + bg + '>' + img + '</button>';
    var zones = '';
    if (canPrev && (len === 1 || idx === 0)) zones += '<span class="rd-hz rd-hz-prev" aria-hidden="true"></span>';
    if (canNext && (len === 1 || idx === len - 1)) zones += '<span class="rd-hz rd-hz-next" aria-hidden="true"></span>';
    return '<div class="rd-pg" data-p="' + n + '"' + bg + '>' + img + zones + '</div>';
  }
  /** the end panel on the desk: "اقرأ العدد كاملاً بصيغة PDF" + PDF + الفهرس (+ the article or company of a page asked for beyond the sample) */
  function endHtml(solo) {
    var req = R && R.req, a = req ? ART_OF[req] : null, ad = req ? AD_OF[req] : null;
    var c = ad && ad.companyId != null ? AAT.company(ad.companyId) : null;
    var line = req ? t('end_one', { n: req }) : t('end_rest', { a: END, b: PAGES });
    var what = '', act = '';
    if (a) {
      what = ui.blockText(AAT.L(a.title), 'p', 'rd-end-what');
      if (AAT.article(a.articleId)) act = ui.button({ label: t('read_art'), href: '#article-' + a.articleId, kind: 'ghost', icon: 'news' });
    } else if (ad) {
      what = '<p class="rd-end-what">' + (AAT.lang === 'ar' && (c ? c.nameAr : ad.nameAr) ? esc(c ? c.nameAr : ad.nameAr) : AAT.lt(c ? c.company : ad.company)) + '</p>';
      if (c) act = ui.button({ label: t('co_page'), act: 'rd-co', kind: 'ghost', icon: 'building', attrs: { 'data-co': c.id, 'data-p': req } });
    }
    return '<div class="rd-pg rd-end' + (solo ? ' rd-end-solo' : '') + '" data-p="' + END + '"><div class="rd-end-in">' +
      AAT.img(M.cover, { alt: AAT.issueLine(), w: 617, h: 873, cls: 'rd-end-cv', eager: true }) +
      '<h2>' + AAT.txt(t('end_h')) + '</h2><p>' + AAT.txt(line) + '</p>' + what +
      '<div class="rd-end-acts">' + ui.button({ label: t('open_pdf'), href: M.pdf, newTab: true, icon: 'pdf' }) + act +
      ui.button({ label: t('toc_btn'), act: 'rd-toc', kind: 'ghost', icon: 'menu' }) + '</div></div></div>';
  }

  /** contents drawer: (phone: tools + page thumbnails) · 13 articles · the advertisers with their page stamps */
  function tocHtml() {
    var fs = fullscreenOk();
    var tools = '<div class="rd-d-tools">' + pdfBtn('red', 'rd-d-pdf') +
      (fs ? ui.button({ label: isFull() ? t('full_exit') : t('full'), act: 'rd-full', kind: 'line', size: 's', icon: 'full', cls: 'rd-full', attrs: { 'aria-pressed': String(isFull()) } }) : '') +
      ui.button({ label: R && R.zoom > 1 ? t('zoom_out') : t('zoom'), act: 'rd-zoom', kind: 'line', size: 's', icon: 'zoom', cls: 'rd-zoom', attrs: { 'aria-pressed': String(!!(R && R.zoom > 1)) } }) + '</div>';
    var th = '';
    for (var n = 1; n <= LAST; n++) {
      th += '<li><button type="button" class="rd-d-th" data-act="rd-go" data-p="' + n + '">' + AAT.img(AAT.thumb(n), { alt: '', w: 110, h: 156 }) + '<span>' + ui.folioText(n) + '</span></button></li>';
    }
    var arts = (TOC.articles || []).map(function (a) {
      var inner = ui.folio(a.page) + ui.blockText(AAT.L(a.title), 'span', 'rd-d-t');
      return AAT.article(a.articleId) ? '<a class="row rd-d-row" href="#article-' + esc(a.articleId) + '">' + inner + '</a>' : '<div class="row rd-d-row">' + inner + '</div>';
    }).join('');
    var ads = GROUPS.map(function (g) {
      return '<button type="button" class="row rd-d-row" data-act="rd-ad" data-p="' + g.pages[0] + '"' + (g.c ? ' data-co="' + g.c.id + '"' : '') + '>' +
        '<span class="rd-d-st">' + stamps(g.pages) + '</span><span class="rd-d-n">' + names(g, 'rd-d') + '</span></button>';
    }).join('');
    return '<div class="rd-side-h"><h2 id="rd-side-t">' + esc(t('contents')) + '</h2>' + closeBtn() + '</div><div class="rd-side-b">' + tools +
      (th ? '<h3 class="rd-d-h rd-d-ph">' + esc(t('pages')) + '</h3><ol class="rd-d-ths" dir="rtl">' + th + '</ol>' : '') +
      '<h3 class="rd-d-h">' + esc(t('arts_h')) + '</h3><div class="rd-d-list">' + arts + '</div>' +
      '<h3 class="rd-d-h">' + esc(t('ads_h')) + '</h3><div class="rd-d-list">' + ads + '</div></div>';
  }

  /** company panel (advertiser page tapped): stamp + field, logo, names, city, about, up to 4 products, contact facts, company page */
  function telHtml(tel) {
    var id = AAT.uid('rt'), dial = String(tel).replace(/\(.*?\)/g, '').replace(/[^\d+]/g, '');
    return '<span class="cf"><a class="rd-tel" id="' + id + '" href="tel:' + esc(dial) + '" dir="ltr">' + esc(tel) + '</a>' +
      ui.button({ label: AAT.t('app.copy'), kind: 'line', size: 's', act: 'copy', icon: 'copy', attrs: { 'data-copy': tel, 'data-target': id } }) + '</span>';
  }
  function coHtml(c, page) {
    var og = AAT.origin(c), cat = AAT.cat(c.cat), pages = (c.pages && c.pages.length) ? c.pages : [c.id];
    var stamp = ui.folio(runs(pages).length === 1 ? pages : (page && pages.indexOf(page) >= 0 ? page : pages[0]));
    var head = '<div class="rd-side-h"><div class="rd-side-ht">' + stamp + (cat ? ui.tag(AAT.L(cat)) : '') + '</div>' + closeBtn() + '</div>';
    var logo = c.logo && AAT.src(c.logo) ? AAT.img(c.logo, { alt: c.company, w: 240, h: 96, eager: true }) : '<span class="typeset" dir="ltr">' + esc(shortName(c.company)) + '</span>';
    var nm = AAT.lang === 'ar' && c.nameAr ? '<h2 class="rd-co-n" id="rd-side-t">' + esc(c.nameAr) + '</h2>' + AAT.ltb(c.company, 'p', 'rd-co-lt') :
      '<h2 class="rd-co-n" id="rd-side-t">' + AAT.ltb(c.company, 'span') + '</h2>';
    var city = og.text ? '<p class="rd-co-city">' + (og.cc ? ui.flag(og.cc, 30, 20) : '') + '<span>' + AAT.txt(og.text) + '</span></p>' : '';
    var about = AAT.L(c.about);
    var aboutHtml = about ? '<div class="rd-co-sec"><h3>' + esc(AAT.t('v_about')) + '</h3>' + ui.blockText(about, 'p', 'rd-co-p') + '</div>' : '';
    var all = c.products || [], prods = all.slice(0, 4);
    var prodHtml = prods.length ? '<div class="rd-co-sec"><h3>' + esc(AAT.t('sl_products')) + '</h3><div class="rd-co-prs">' + prods.map(function (p) {
      return '<a class="row rd-pr" href="#product-' + c.id + '-' + esc(p.k) + '">' + AAT.img(p.img, { alt: '', w: 72, h: 56 }) + AAT.ltb(p.n, 'span', 'row-t clamp2') + '</a>';
    }).join('') + '</div>' + (all.length > prods.length ? '<p class="rd-co-more">' + esc(t('products_n', { n: AAT.count(all.length, 'product') })) + '</p>' : '') + '</div>' : '';
    var facts = [];
    var tels = c.tels && c.tels.length ? c.tels : (c.tel ? [c.tel] : []);
    var wa = c.whatsapp ? String(c.whatsapp).replace(/\D/g, '') : '';
    if (tels.length || wa) {
      facts.push('<div><dt>' + esc(AAT.t('contact_phone')) + '</dt><dd>' + tels.map(telHtml).join('') +
        (wa ? '<a class="btn btn-line btn-s rd-wa" href="https://wa.me/' + esc(wa) + '" target="_blank" rel="noopener"><span class="app-i sq app-whatsapp">' +
          AAT.img('img/apps/whatsapp.svg', { alt: '', w: 30, h: 30 }) + '</span><span>' + esc(AAT.t('wa')) + '</span></a>' : '') + '</dd></div>');
    }
    if (c.email) facts.push('<div><dt>' + esc(AAT.t('contact_email')) + '</dt><dd><span class="cf">' + ui.mail(c.email, { copy: true }) + '</span></dd></div>');
    if (c.web && /^https?:\/\//i.test(c.web)) {
      facts.push('<div><dt>' + esc(AAT.t('v_web')) + '</dt><dd><a class="weblink rd-web" href="' + esc(c.web) + '" target="_blank" rel="noopener" dir="ltr">' +
        esc(c.web.replace(/^https?:\/\//i, '').replace(/\/$/, '')) + '</a></dd></div>');
    }
    if (c.address) facts.push('<div><dt>' + esc(t('address')) + '</dt><dd>' + ui.blockText(c.address, 'p', 'rd-co-addr') + '</dd></div>');
    var contact = facts.length ? '<div class="rd-co-sec"><h3>' + esc(AAT.t('v_contact')) + '</h3><dl class="rd-facts">' + facts.join('') + '</dl></div>' : '';
    return head + '<div class="rd-side-b"><div class="rd-co-logo">' + logo + '</div>' + nm + city + aboutHtml + prodHtml + contact +
      '<div class="btnrow rd-co-acts">' + ui.button({ label: t('co_page'), href: '#company-' + c.id, kind: 'navy', icon: 'building' }) +
      ui.button({ label: t('close'), act: 'rd-side-close', kind: 'line' }) + '</div></div>';
  }

  /* ---------- layout and drawing ---------- */
  /** fit the pages to the desk HEIGHT (whole page visible), two side by side only when both fit, then (re)draw the stage */
  function draw(dir) {
    if (!R) return;
    var phone = W.innerWidth <= 760;
    var Wd = R.desk.clientWidth, Hd = R.desk.clientHeight;
    var pad = phone ? 10 : 14, edge = 8, reserve = phone ? 16 : 160;   // arrows 64 + 64 and their gaps outside the pages on PC
    var hFit = Math.max(140, Hd - 2 * pad - edge), wFit = Math.floor(hFit * RATIO);
    var two = 2 * wFit + edge + reserve <= Wd;
    var w = two ? wFit : Math.max(90, Math.min(wFit, Math.floor(Wd - reserve - edge)));
    var h = two ? hFit : Math.floor(w / RATIO);
    R.two = two;
    R.spread = spreadOf(R.p, two);
    var shown = R.side === 'co' && R.focus && !two ? [R.focus] : R.spread;
    var np = nextOf(R.spread), pp = prevOf(R.spread);
    var key = shown.join(',') + '|' + (R.req || '') + '|' + (np != null) + (pp != null) + '|' + AAT.lang;
    if (key !== R.key) {
      R.stage.innerHTML = shown.map(function (n, i) { return pageHtml(n, i, shown.length, pp != null, np != null); }).join('');
      R.key = key;
    }
    R.shown = shown;
    var ew = Math.max(w, Math.min(Math.floor(Wd - reserve - edge), 400));
    R.stage.style.setProperty('--pw', w + 'px');
    R.stage.style.setProperty('--ph', h + 'px');
    R.stage.style.setProperty('--ew', ew + 'px');
    R.stage.classList.toggle('rd-sm', h < 460 || w < 260);   // small pages (landscape phones): compact end panel
    // counter, jump field, thumbnails, arrows, the open company's pages
    var real = shown.filter(function (n) { return n < END; });
    var txt = real.length ? (real.length > 1 ? real[0] + '–' + real[real.length - 1] : String(real[0])) : (R.req ? String(R.req) : END + '–' + PAGES);
    if (R.count) R.count.textContent = txt + ' / ' + PAGES;
    if (R.input && document.activeElement !== R.input) R.input.value = String(R.req || shown[0]);
    AAT.$$('.rd-th, .rd-d-th', R.root).forEach(function (b) {
      var on = shown.indexOf(+b.getAttribute('data-p')) >= 0;
      b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    AAT.$$('.rd-next', R.root).forEach(function (b) { b.disabled = np == null; });
    AAT.$$('.rd-prev', R.root).forEach(function (b) { b.disabled = pp == null; });
    AAT.$$('.rd-ad', R.stage).forEach(function (b) { b.classList.toggle('on', R.side === 'co' && +b.getAttribute('data-co') === R.coId); });
    if (dir) animate(dir);
    preload([np, pp].filter(function (x) { return x != null; }).reduce(function (a, p) { return a.concat(spreadOf(p, two)); }, []));
  }
  function animate(dir) {
    var s = R.stage;
    s.classList.remove('rd-a-next', 'rd-a-prev'); void s.offsetWidth;
    s.classList.add(dir > 0 ? 'rd-a-next' : 'rd-a-prev');
    clearTimeout(R.at);
    R.at = setTimeout(function () { s.classList.remove('rd-a-next', 'rd-a-prev'); }, 320);
  }
  function preload(list) {
    list.forEach(function (n) {
      if (n > LAST || PRE[n]) return;
      PRE[n] = 1; var im = new Image(); im.decoding = 'async'; im.src = AAT.pageImg(n);
    });
  }
  function hashNow() { if (R) AAT.setHash('flip-' + (R.req || R.spread[0])); }

  /** go to page p (END = the end panel; req = the page asked for beyond the sample). Never called by an advertiser page tap. */
  function goTo(p, req, dir) {
    if (!R) return;
    p = Math.max(1, Math.min(END, p | 0));
    var before = R.spread ? R.spread[0] : p;
    if (dir == null) dir = p > before ? 1 : (p < before ? -1 : 0);
    R.p = p; R.req = p === END ? (req || null) : null;
    if (R.side === 'co') closeSide(true);
    if (R.zoom > 1) setZoom(false);
    draw(dir);
    store(Math.min(R.spread[0], LAST));
    hashNow();
  }
  function next() { var n = R && nextOf(R.spread); if (n != null) goTo(n, null, 1); }
  function prev() { var n = R && prevOf(R.spread); if (n != null) goTo(n, null, -1); }

  /* ---------- side panels (contents drawer, company panel) ---------- */
  function openSide(kind, html, ret) {
    R.side = kind; R.ret = ret || document.activeElement;
    R.sideEl.className = 'rd-side rd-side-' + kind;
    R.sideEl.innerHTML = html; R.sideEl.hidden = false; R.scrim.hidden = false;
    R.sideEl.scrollTop = 0;
    if (R.tocBtn) R.tocBtn.setAttribute('aria-expanded', String(kind === 'toc'));
    draw(0);
    var x = AAT.$('.rd-x', R.sideEl); if (x) try { x.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function closeSide(silent) {
    if (!R || !R.side) return;
    var ret = R.ret;
    R.side = null; R.focus = null; R.coId = null;
    R.sideEl.hidden = true; R.sideEl.innerHTML = ''; R.scrim.hidden = true;
    if (R.tocBtn) R.tocBtn.setAttribute('aria-expanded', 'false');
    if (!silent) {
      draw(0);
      if (ret && ret.isConnected && ret.focus) try { ret.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
  }
  /** the company panel: opens over/next to the pages and NEVER changes the page */
  function openCo(cid, page, from) {
    var c = AAT.company(cid); if (!c || !R) return;
    if (R.zoom > 1) setZoom(false);
    var ret = from && from.closest && from.closest('.rd-side') ? R.tocBtn : from;
    R.coId = c.id; R.focus = page && page <= LAST && R.spread.indexOf(page) >= 0 ? page : null;
    openSide('co', coHtml(c, page), ret);
  }

  /* ---------- zoom (2×, drag to pan) and fullscreen ---------- */
  function setZoom(on) {
    if (!R) return;
    R.zoom = on ? 2 : 1; R.tx = 0; R.ty = 0;
    R.desk.classList.toggle('rd-zoomed', !!on);
    applyZoom();
    AAT.$$('.rd-zoom', R.root).forEach(function (b) {
      b.setAttribute('aria-pressed', String(!!on));
      var s = AAT.$('span', b); if (s) s.textContent = on ? t('zoom_out') : t('zoom');
    });
  }
  function clampPan() {
    var sw = R.stage.offsetWidth * R.zoom, sh = R.stage.offsetHeight * R.zoom;
    var mx = Math.max(0, (sw - R.desk.clientWidth) / 2 + 12), my = Math.max(0, (sh - R.desk.clientHeight) / 2 + 12);
    R.tx = Math.max(-mx, Math.min(mx, R.tx)); R.ty = Math.max(-my, Math.min(my, R.ty));
  }
  function applyZoom() { R.stage.style.transform = R.zoom > 1 ? 'translate(' + Math.round(R.tx) + 'px,' + Math.round(R.ty) + 'px) scale(' + R.zoom + ')' : ''; }
  function syncFull() {
    if (!R) return;
    var on = isFull();
    AAT.$$('.rd-full', R.root).forEach(function (b) {
      b.setAttribute('aria-pressed', String(on));
      var s = AAT.$('span', b); if (s) s.textContent = on ? t('full_exit') : t('full');
    });
    draw(0);
  }

  /* ---------- pointer: swipe to turn, drag to pan, tap on an advertiser page → company panel ---------- */
  function onDown(e) {
    if (!R || (e.pointerType === 'mouse' && e.button !== 0)) return;
    R.swallow = 0;                 // a new gesture: only a click that ends a drag is swallowed
    if (e.target.closest('.rd-arrow')) return;
    R.ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, tx: R.tx, ty: R.ty, moved: false };
    if (R.zoom > 1) { try { R.desk.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
  }
  function onMove(e) {
    var P = R && R.ptr; if (!P || P.id !== e.pointerId) return;
    var dx = e.clientX - P.x, dy = e.clientY - P.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) P.moved = true;
    if (R.zoom > 1) { R.tx = P.tx + dx; R.ty = P.ty + dy; clampPan(); applyZoom(); }
  }
  function onUp(e) {
    var P = R && R.ptr; if (!P || P.id !== e.pointerId) return;
    R.ptr = null;
    var dx = e.clientX - P.x, dy = e.clientY - P.y;
    if (P.moved) R.swallow = Date.now();
    // the book reads right to left: a swipe to the right brings the next pages (they come from the left)
    if (R.zoom === 1 && e.type === 'pointerup' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx > 0) next(); else prev(); }
  }
  function onDeskClick(e) {
    if (!R) return;
    if (R.swallow && Date.now() - R.swallow < 450) { R.swallow = 0; e.preventDefault(); e.stopPropagation(); return; }
    var ad = e.target.closest('.rd-ad');
    if (ad) { e.preventDefault(); openCo(+ad.getAttribute('data-co'), +ad.getAttribute('data-p'), ad); return; }
    if (R.zoom > 1) return;
    var z = e.target.closest('.rd-hz');
    if (z) { if (z.classList.contains('rd-hz-next')) next(); else prev(); }
  }
  function onKey(e) {
    if (!R || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) && e.key !== 'Escape') return;
    switch (e.key) {
      case 'ArrowLeft': case 'PageDown': next(); break;
      case 'ArrowRight': case 'PageUp': prev(); break;
      case 'Home': goTo(1); break;
      case 'End': goTo(END); break;
      case 'Escape':
        if (R.side) closeSide(); else if (R.zoom > 1) setZoom(false); else if (isFull()) toggleFull(); else closeReader();
        break;
      default: return;
    }
    e.preventDefault();
  }
  function toggleFull() {
    var d = document, el = d.documentElement;
    try {
      if (isFull()) { var x = (d.exitFullscreen || d.webkitExitFullscreen); if (x) { var px = x.call(d); if (px && px.catch) px.catch(function () {}); } return; }
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) { AAT.toast(t('full_na')); return; }
      var pr = req.call(el);
      if (pr && pr.catch) pr.catch(function () { AAT.toast(t('full_na')); });
    } catch (err) { AAT.toast(t('full_na')); }
  }
  function closeReader() { AAT.go('#' + (backHash || 'magazine')); }

  function mountReader(ctx, view) {
    var st = parseFlip(ctx); if (!st) return;
    var root = AAT.$('#rd', view); if (!root) return;
    R = { p: st.p, req: st.req, zoom: 1, tx: 0, ty: 0, side: null, key: '', spread: null, shown: [], root: root,
      desk: AAT.$('#rd-desk', root), stage: AAT.$('#rd-stage', root), sideEl: AAT.$('#rd-side', root), scrim: AAT.$('.rd-scrim', root),
      count: AAT.$('#rd-count', root), input: AAT.$('#rd-n', root), tocBtn: AAT.$('.rd-tb-toc', root) };
    document.documentElement.classList.add('rd-open');
    var raf = 0;
    R.onResize = function () { if (raf) return; raf = W.requestAnimationFrame(function () { raf = 0; if (R) { draw(0); if (R.zoom > 1) { clampPan(); applyZoom(); } } }); };
    R.onKey = onKey; R.onFs = syncFull;
    W.addEventListener('resize', R.onResize);
    document.addEventListener('keydown', R.onKey);
    document.addEventListener('fullscreenchange', R.onFs);
    document.addEventListener('webkitfullscreenchange', R.onFs);
    R.desk.addEventListener('pointerdown', onDown);
    R.desk.addEventListener('pointermove', onMove);
    R.desk.addEventListener('pointerup', onUp);
    R.desk.addEventListener('pointercancel', onUp);
    R.desk.addEventListener('click', onDeskClick);
    draw(0);
    syncFull();
    store(Math.min(R.spread[0], LAST));
    hashNow();
  }
  function unmountReader() {
    if (!R) return;
    W.removeEventListener('resize', R.onResize);
    document.removeEventListener('keydown', R.onKey);
    document.removeEventListener('fullscreenchange', R.onFs);
    document.removeEventListener('webkitfullscreenchange', R.onFs);
    clearTimeout(R.at);
    R = null;
    document.documentElement.classList.remove('rd-open');
    if (isFull()) { try { var d = document, x = d.exitFullscreen || d.webkitExitFullscreen; var p = x && x.call(d); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ } }
  }

  /* ---------- delegated actions (data-act="rd-…") ---------- */
  AAT.acts['rd-next'] = function () { next(); };
  AAT.acts['rd-prev'] = function () { prev(); };
  AAT.acts['rd-go'] = function (el) {
    if (!R) return;
    if (el.closest('.rd-side') && W.innerWidth <= 960) closeSide(true);
    goTo(+el.getAttribute('data-p'));
  };
  AAT.acts['rd-jump'] = function (form) {
    if (!R) return;
    var v = parseInt(form.elements.n.value, 10);
    if (!(v >= 1 && v <= PAGES)) { AAT.toast(t('jump_bad', { n: PAGES })); return; }
    form.elements.n.blur();
    if (v <= LAST) goTo(v); else goTo(END, v);
  };
  AAT.acts['rd-toc'] = function (el) {
    if (!R) return;
    if (R.side === 'toc') { closeSide(); return; }
    openSide('toc', tocHtml(), el.closest('.rd-stage') ? R.tocBtn : el);
  };
  AAT.acts['rd-side-close'] = function () { closeSide(); };
  /** contents drawer advertiser row: a shipped page → go there; a later page → the company panel; no company record → the end panel for that page */
  AAT.acts['rd-ad'] = function (el) {
    if (!R) return;
    var p = +el.getAttribute('data-p'), cid = el.getAttribute('data-co');
    if (p <= LAST) { if (W.innerWidth <= 960) closeSide(true); goTo(p); return; }
    if (cid) { openCo(+cid, p, el); return; }
    closeSide(true); goTo(END, p);
  };
  AAT.acts['rd-co'] = function (el) { if (R) openCo(+el.getAttribute('data-co'), +el.getAttribute('data-p'), el); };
  AAT.acts['rd-zoom'] = function () { if (R) setZoom(R.zoom === 1); };
  AAT.acts['rd-full'] = function () { toggleFull(); };
  AAT.acts['rd-close'] = function () { closeReader(); };

  /* ======================================================================
     Module
     ====================================================================== */
  AAT.pages.magazine = {
    render: function (ctx) {
      if (ctx.head === 'flip') {
        if (!parseFlip(ctx) || !LAST) return null;
        if (ctx.prev && ctx.prev.head !== 'flip' && !ctx.prev.notFound) backHash = ctx.prev.hash || 'home';
        return readerHtml();
      }
      if (ctx.rest) return null;            // "#magazine-x" is not a page
      return magazinePage();
    },
    mount: function (ctx, view) { if (ctx.head === 'flip') mountReader(ctx, view); },
    unmount: function () { unmountReader(); },
    /** page turns inside the reader (#flip-N → #flip-M) update in place; everything else renders again */
    update: function (ctx) {
      if (!R || ctx.head !== 'flip') return false;
      var st = parseFlip(ctx); if (!st) return false;
      goTo(st.p, st.req);
      return true;
    },
    title: function (ctx) { return ctx.head === 'flip' ? AAT.t('fl_title') + ' · ' + AAT.issueLine() : t('h1'); },
    chrome: function (ctx) { return ctx.head !== 'flip'; }
  };
}());
