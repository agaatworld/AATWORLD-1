/* =============================================================================
   AAT World v3 · js/pages/home.js — HOME (#home and the empty hash)
   Owner: the home page builder. Spec: DESIGN.md §6.2. Contract: CONTRACT.md.
   CSS: css/home.css (prefix .hm-). Shared components only from AAT.ui (js/app.js).

   Bands, in order (navy → paper → floor → navy → paper → floor → navy → paper; the app adds
   the floor contact band and the navy footer):
     1. opening board  · H1 + twin line + lead + search + quick chips + 4 counters | framed photo + issue card; trade line
     2. hm-shows       · أقرب المعارض الدولية: month chips (switch the board in place) + departure board (8 rows)
     3. hm-products    · منتجات المعلنين في العدد 560: the moving product conveyor (full bleed, JS-driven)
     4. hm-issue       · العدد 560 · أكتوبر 2026: spread of pages 2–3, cover text, contents, 12 page thumbnails
     5. hm-dir         · دليل الشركات: the 35 company cards
     6. hm-modern      · منتجات وصناعات حديثة: the six group cards
     7. hm-club        · نادي رجال الأعمال: seal, lead, brass figures, benefits 1–4, join buttons
     8. hm-reading     · مقالات وأخبار: lead + two cards, side list (news on Arabic, articles on LTR)

   The conveyor moves on EVERY computer at ~42 px/s, also with "reduce motion" / animations off in the
   OS (owner: "it must move", CLAUDE.md update 34). It is driven by requestAnimationFrame (transform only),
   pauses on mouse hover, keyboard focus and touch (resumes 2 s after the touch ends), can be dragged or
   swiped, has two arrow buttons, and sleeps while off screen or in a hidden tab.
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT, D = AAT.data, ui = AAT.ui, esc = AAT.esc;
  var t = function (k, v) { return AAT.t('home.' + k, v); };

  AAT.strings.home = {
    ar: {
      title: 'التجارة العربية الآسيوية',
      h1a: 'من مصانع آسيا', h1b: 'إلى أسواق العرب وأفريقيا',
      search_ph: 'ابحث عن معرض أو شركة أو منتج', search_ph_s: 'معرض أو شركة أو منتج', search_btn: 'ابحث',
      q1: 'معارض الإمارات', q2: 'آلات التغليف', q3: 'شركات تايوان', q4: 'معارض الأغذية',
      photo_cap: 'خلاط صحي · ماليزيا', photo_sub: 'منتجات وصناعات حديثة',
      in_issue: 'في العدد {n}', from: 'من {x}', of_club: 'في {club}',
      shows_t: 'أقرب المعارض الدولية', shows_meta: '{s} في {c} · من {m}', shows_all: 'كل المعارض الدولية', months: 'اختر الشهر',
      prod_t: 'منتجات المعلنين في العدد {n}', prod_meta: '{p} من {c}', prod_all: 'كل المنتجات',
      belt: 'منتجات المعلنين، شريط متحرك', prev: 'المنتجات السابقة', next: 'المنتجات التالية',
      issue_meta: '{p} · {a} · {c}', spread_cap: 'صفحتا 2 و3 من العدد', in_this: 'في هذا العدد', pages_t: 'صفحات العدد', page_n: 'صفحة {n}',
      dir_meta: '{c} في العدد {n}', dir_open: 'افتح دليل الشركات',
      mod_t: 'منتجات وصناعات حديثة', mod_meta: '{p} وصناعة في {f}', mod_all: 'كل الصناعات الحديثة',
      club_join: 'انضم إلى نادي رجال الأعمال',
      art_meta: '{a} في العدد {n} · {w}', art_all: 'كل المقالات والأخبار', news_h: 'الأخبار', arts_h: 'المقالات'
    },
    en: {
      title: 'Arab Asian Trade',
      h1a: "From Asia's factories", h1b: 'to Arab and African markets',
      search_ph: 'Search a show, a company or a product', search_ph_s: 'Show, company or product', search_btn: 'Search',
      q1: 'Shows in the UAE', q2: 'Packaging machines', q3: 'Taiwan companies', q4: 'Food shows',
      photo_cap: 'Sanitary mixer · Malaysia', photo_sub: 'Modern products and industries',
      in_issue: 'in issue {n}', from: 'from {x}', of_club: 'of the {club}',
      shows_t: 'Next international exhibitions', shows_meta: '{s} in {c} · from {m}', shows_all: 'All international exhibitions', months: 'Choose the month',
      prod_t: "Advertisers' products in issue {n}", prod_meta: '{p} from {c}', prod_all: 'All products',
      belt: "Advertisers' products, moving belt", prev: 'Previous products', next: 'Next products',
      issue_meta: '{p} · {a} · {c}', spread_cap: 'Pages 2 and 3 of the issue', in_this: 'In this issue (articles in Arabic)', pages_t: 'Pages of the issue', page_n: 'Page {n}',
      dir_meta: '{c} in issue {n}', dir_open: 'Open the company directory',
      mod_t: 'Modern products and industries', mod_meta: '{p} and industries in {f}', mod_all: 'All modern industries',
      club_join: 'Join the AAT Business Club',
      art_meta: '{a} in issue {n} · {w}', art_all: 'All articles and news', news_h: 'News', arts_h: 'Articles'
    }
  };
  /** a home string in a GIVEN language (the twin line shows the other language's H1) */
  function tIn(lang, k) { var S = AAT.strings.home; return (S[lang] && S[lang][k]) || S.en[k]; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- shows: upcoming (from today), months, rows ---------- */
  var TODAY = (function () { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }());
  var UP = null;
  function upcoming() {
    if (UP) return UP;
    var all = D.shows || [];
    UP = all.filter(function (s) { return (s.end || s.start) >= TODAY; });
    if (!UP.length) UP = all.slice();
    return UP;
  }
  function byStart(a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : String(a.name).localeCompare(String(b.name)); }
  /** the first six months (YYYY-MM) that have upcoming shows, with their counts */
  function months() {
    var n = {};
    upcoming().forEach(function (s) { var k = String(s.start).slice(0, 7); n[k] = (n[k] || 0) + 1; });
    return Object.keys(n).sort().slice(0, 6).map(function (k) { return { m: k, n: n[k] }; });
  }
  /** up to 8 shows of a month: dated ones by start then name, then month-only ones (DESIGN §6.7: month-only at the end) */
  function rowsOf(m) {
    var inM = upcoming().filter(function (s) { return String(s.start).slice(0, 7) === m; });
    var dated = inM.filter(function (s) { return !s.approx; }).sort(byStart);
    var only = inM.filter(function (s) { return s.approx; }).sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
    return dated.concat(only).slice(0, 8);
  }
  function boardHtml(m) { return ui.showBoard(rowsOf(m).map(function (s) { return ui.showRow(s); }).join('')); }

  /* ---------- 1. opening board ---------- */
  function opening() {
    var S = AAT.stats, M = D.magazine;
    var years = (D.shows || []).map(function (s) { return +String(s.start).slice(0, 4); });
    var y0 = Math.min.apply(null, years), y1 = Math.max.apply(null, years);
    var twinLang = AAT.rtl ? 'en' : 'ar';
    var twinText = tIn(twinLang, 'h1a') + ' ' + tIn(twinLang, 'h1b');
    var twin = AAT.rtl ? AAT.ltb(twinText, 'p', 'hm-twin') : AAT.rtlb(twinText, 'p', 'hm-twin');
    var counters = ui.counters([
      { n: S.shows, label: AAT.count(S.shows, 'intl', true), sub: y0 === y1 ? String(y0) : y0 + ' – ' + y1, href: '#exhibitions' },
      { n: S.companies, label: AAT.count(S.companies, 'advertiser', true), sub: t('in_issue', { n: M.number }), href: '#companies' },
      { n: S.products, label: AAT.count(S.products, 'product', true), sub: t('from', { x: AAT.count(S.prodCos, 'company') }), href: '#products' },
      { n: S.members, label: AAT.count(S.members, 'member', true), sub: t('of_club', { club: AAT.L(D.club.name) }), href: '#club' }
    ], { cls: 'hm-cnts' });
    var extra = twin +
      '<p class="hm-lead">' + AAT.txt(AAT.t('mb_claim')) + '</p>' +
      ui.searchBox({ act: 'ask', placeholder: t('search_ph'), button: t('search_btn'), cls: 'hm-sbox' }) +
      ui.qchips([{ label: t('q1') }, { label: t('q2') }, { label: t('q3') }, { label: t('q4') }]) +
      counters;
    var media = '<div class="hm-media">' +
      ui.frame({ src: 'img/modern/m5.jpg', w: 1000, h: 528, alt: t('photo_cap'), cap: t('photo_cap'), sub: t('photo_sub'), href: '#modern-5', eager: true, drift: true, cls: 'hm-photo' }) +
      ui.issueCard({ cls: 'hm-icard' }) + '</div>';
    return ui.openingBoard({
      id: 'hm-board', cls: 'hm-ob',
      h1Html: esc(t('h1a')) + '<br>' + esc(t('h1b')),
      extra: extra, picture: media,
      after: ui.tradeLine()
    });
  }

  /* ---------- 2. next international exhibitions ---------- */
  function shows() {
    var S = AAT.stats, ms = months();
    if (!ms.length) return '';
    var first = (D.shows || []).reduce(function (a, s) { return !a || s.start < a ? s.start : a; }, '');
    var chips = ui.chips(ms.map(function (x, i) {
      return { label: AAT.fmtMonth(x.m), n: x.n, act: 'hm-month', sel: i === 0, attrs: { 'data-m': x.m } };
    }), { label: t('months'), cls: 'hm-months' });
    return ui.section({
      id: 'hm-shows', band: 'paper', title: t('shows_t'),
      meta: t('shows_meta', { s: AAT.count(S.shows, 'show'), c: AAT.count(S.showCountries, 'country'), m: AAT.fmtMonth(first) }),
      action: { label: t('shows_all'), href: '#exhibitions', iconEnd: 'arrow' },
      body: chips + '<div class="hm-board-rows" id="hm-board-rows" aria-live="polite">' + boardHtml(ms[0].m) + '</div>'
    });
  }

  /* ---------- 3. advertisers' products: the conveyor ---------- */
  function products() {
    var S = AAT.stats, cells = [], dup = [];
    (D.companies || []).forEach(function (c) {
      (c.products || []).forEach(function (p) {
        if (!AAT.src(p.img)) return;
        var i = cells.length;
        cells.push('<li>' + ui.productCell(c, p, { eager: i < 4 }) + '</li>');
        dup.push('<li aria-hidden="true">' + ui.productCell(c, p, { attrs: { tabindex: '-1' } }) + '</li>');
      });
    });
    var head = ui.section({
      id: 'hm-products', band: 'floor', cls: 'hm-prod', title: t('prod_t', { n: D.magazine.number }),
      meta: t('prod_meta', { p: AAT.count(S.products, 'product'), c: AAT.count(S.prodCos, 'company') }),
      action: { label: t('prod_all'), href: '#products', iconEnd: 'arrow' }
    });
    if (!cells.length) return head;
    var arw = function (k, icon) { return '<button class="hm-arw hm-' + k + '" type="button" data-act="hm-belt" data-d="' + (k === 'next' ? 1 : -1) + '" aria-label="' + esc(t(k)) + '">' + AAT.icon(icon, 28) + '</button>'; };
    var belt = '<div class="hm-conv" id="hm-conv">' +
      '<div class="hm-belt" role="region" aria-label="' + esc(t('belt')) + '"><ul class="hm-track">' + cells.join('') + dup.join('') + '</ul></div>' +
      '<div class="hm-ctl">' + arw('prev', 'back') + arw('next', 'arrow') + '</div></div>';
    return head.replace(/<\/section>$/, belt + '</section>');
  }

  /* ---------- 4. the issue ---------- */
  function issue() {
    var M = D.magazine, S = AAT.stats;
    var spread = ui.spread({ a: 2, b: 3, caption: t('spread_cap') });
    var toc = ((M.toc && M.toc.articles) || []).slice(0, 7).map(function (a) {
      var href = a.articleId && AAT.article(a.articleId) ? '#article-' + a.articleId : '#magazine';
      return '<a class="row hm-toc" href="' + esc(href) + '">' + ui.folio(a.page, { chip: true }) + ui.blockText(AAT.L(a.title), 'span', 'hm-toc-t') + '</a>';
    }).join('');
    var thumbs = '';
    for (var n = 1; n <= (M.prototypePages || 0); n++) {
      var th = AAT.thumb(n);
      if (!th) continue;
      thumbs += '<li><a class="hm-thumb" href="#flip-' + n + '">' + AAT.img(th, { alt: t('page_n', { n: n }), w: 220, h: 311 }) + '<span><bdi dir="ltr">' + n + '</bdi></span></a></li>';
    }
    var text = '<div class="hm-iss-text"><p class="hm-cover-text">' + AAT.Lh(M.coverText) + '</p>' +
      '<div class="btnrow">' + ui.button({ label: AAT.t('mb_read', { n: M.number }), href: '#flip-1', icon: 'book' }) +
      ui.button({ html: '<bdi dir="ltr">PDF</bdi>', href: M.pdf, kind: 'ghost', newTab: true, icon: 'pdf' }) + '</div>' +
      (toc ? '<h3 class="h3 hm-iss-h3">' + esc(t('in_this')) + '</h3><div class="rows hm-tocs">' + toc + '</div>' : '') + '</div>';
    var pages = thumbs ? '<div class="hm-pages"><h3 class="h3 hm-iss-h3">' + esc(t('pages_t')) + '</h3><ol class="hm-thumbs">' + thumbs + '</ol></div>' : '';
    return ui.section({
      id: 'hm-issue', band: 'night', cls: 'hm-issue', title: AAT.issueLine(),
      meta: t('issue_meta', { p: AAT.count(M.pages, 'page'), a: AAT.count(S.articlesFresh, 'article'), c: AAT.count(S.companies, 'advertiser') }),
      body: (spread ? '<a class="hm-spread" href="#flip-2">' + spread + '</a>' : '') + text + pages
    });
  }

  /* ---------- 5. company directory ---------- */
  function directory() {
    var S = AAT.stats;
    return ui.section({
      id: 'hm-dir', band: 'paper', title: AAT.t('app.nav_companies'),
      meta: t('dir_meta', { c: AAT.count(S.companies, 'advertiser'), n: D.magazine.number }),
      action: { label: t('dir_open'), href: '#companies', iconEnd: 'arrow' },
      body: '<div class="grid g-dir hm-dir">' + (D.companies || []).map(function (c) { return ui.logoCell(c); }).join('') + '</div>'
    });
  }

  /* ---------- 6. modern products and industries ---------- */
  function modern() {
    var S = AAT.stats;
    return ui.section({
      id: 'hm-modern', band: 'floor', title: t('mod_t'),
      meta: t('mod_meta', { p: AAT.count(S.modern, 'product'), f: AAT.count(S.modernGroups, 'field') }),
      action: { label: t('mod_all'), href: '#modern', iconEnd: 'arrow' },
      body: '<div class="grid g-3 hm-mods">' + (D.modernGroups || []).map(function (g) { return ui.modernCard(g); }).join('') + '</div>'
    });
  }

  /* ---------- 7. AAT Business Club ---------- */
  function club() {
    var C = D.club, S = AAT.stats, F = D.about.facts;
    var figs = ui.figures([
      { n: S.members, label: AAT.count(S.members, 'member', true) + ' ' + t('of_club', { club: AAT.L(C.name) }) },
      { n: F.years, label: AAT.L(F.labels.years) },
      { n: F.issues, label: AAT.L(F.labels.issues) },
      { n: F.since, label: AAT.L(F.labels.since), year: true }
    ]);
    var bens = (C.benefits || []).slice(0, 4).map(function (b) {
      return '<li><span class="hm-bn"><bdi dir="ltr">' + pad2(b.n) + '</bdi></span><span class="hm-bt">' + AAT.Lh(b) + '</span></li>';
    }).join('');
    var text = '<div class="hm-club-text"><p class="hm-club-lead">' + AAT.Lh(C.lead) + '</p>' + figs +
      (bens ? '<ol class="hm-bens">' + bens + '</ol>' : '') +
      '<div class="btnrow hm-club-btns">' + ui.button({ label: t('club_join'), href: '#club', icon: 'users' }) + ui.button({ label: AAT.L(C.join.more), href: '#club', kind: 'ghost' }) + '</div></div>';
    return ui.section({
      id: 'hm-club', band: 'night', cls: 'hm-club', title: AAT.L(C.name),
      body: '<div class="hm-seal">' + ui.seal(320) + '</div>' + text
    });
  }

  /* ---------- 8. articles and news ---------- */
  var SIDE_N = 7;          // side list rows on PC (the column then matches the lead + pair height); phones show 4 (CSS)
  function firstPara(n) { var B = n.body || {}; var p = (B[AAT.lang] && B[AAT.lang][0]) || (B[AAT.o] && B[AAT.o][0]) || ''; return String(p).replace(/^##\s*/, ''); }
  function reading() {
    var S = AAT.stats, main, side, sideH;
    var hasTitle = function (x) { return !!(x.title && x.title[AAT.o]); };
    if (AAT.rtl) {
      var fresh = (D.articles || []).filter(function (a) { return a.fresh; });
      var pic = fresh.filter(function (a) { return AAT.src(a.img); });
      var lead = AAT.article('ar26-5') || pic[0] || fresh[0];
      var small = ['ar26-6', 'ar26-1'].map(AAT.article).filter(Boolean);
      if (small.length < 2) small = pic.filter(function (a) { return a !== lead; }).slice(0, 2);
      main = ui.articleCard(lead, { kind: 'article', lead: true }) + '<div class="hm-pair">' + small.map(function (a) { return ui.articleCard(a, { kind: 'article' }); }).join('') + '</div>';
      var news = (D.news || []).filter(hasTitle);
      news = news.filter(function (n) { return AAT.src(n.img); }).concat(news.filter(function (n) { return !AAT.src(n.img); })).slice(0, SIDE_N);
      sideH = AAT.t('news_title');
      side = news.map(function (n) { return ui.headlineRow(n, { kind: 'news' }); }).join('');
    } else {
      var en = (D.news || []).filter(function (n) { return hasTitle(n) && AAT.src(n.img); });
      var order = ['n2', 'n0', 'n1'].map(AAT.newsItem).filter(function (n) { return n && hasTitle(n) && AAT.src(n.img); });
      if (order.length < 3) order = en.slice(0, 3);
      main = ui.articleCard(order[0], { kind: 'news', lead: true, summary: firstPara(order[0]) }) +
        '<div class="hm-pair">' + order.slice(1, 3).map(function (n) { return ui.articleCard(n, { kind: 'news' }); }).join('') + '</div>';
      sideH = t('arts_h');
      side = (D.articles || []).filter(function (a) { return !a.fresh && hasTitle(a); }).slice(0, SIDE_N + 1).map(function (a) { return ui.headlineRow(a, { kind: 'article' }); }).join('');
    }
    return ui.section({
      id: 'hm-reading', band: 'paper', title: AAT.t('app.nav_reading'),
      meta: t('art_meta', { a: AAT.count(S.articlesFresh, 'article'), n: D.magazine.number, w: AAT.count(S.news, 'news') }),
      action: { label: t('art_all'), href: '#reading', iconEnd: 'arrow' },
      body: '<div class="hm-arts"><div class="hm-arts-main">' + main + '</div><aside class="hm-side"><h3 class="h3 hm-side-h">' + esc(sideH) + '</h3><div class="hm-side-l">' + side + '</div></aside></div>'
    });
  }

  /* ======================================================================
     The conveyor (one instance while the home page is shown)
     ====================================================================== */
  var SPEED = 42;          // px per second (DESIGN §3.5)
  var P_HOVER = 1, P_FOCUS = 2, P_TOUCH = 4, P_DRAG = 8, P_HIDDEN = 16, P_OFF = 32;
  function Belt(root) {
    var belt = root.querySelector('.hm-belt'), track = root.querySelector('.hm-track');
    var dir = AAT.rtl ? 1 : -1;        // Arabic: items travel to the right; LTR: to the left
    var W = 0, pos = 0, last = 0, raf = 0, paused = 0, resumeT = 0, nudge = null, alive = true;
    var drag = null, suppress = false, io = null;
    function measure() {
      var li = track.children, half = li.length / 2;
      if (!half) { W = 0; return; }
      W = Math.abs(li[half].getBoundingClientRect().left - li[0].getBoundingClientRect().left);
    }
    function norm() { if (W > 0) pos = ((pos % W) + W) % W; }
    function paint() { track.style.transform = 'translate3d(' + (dir * pos).toFixed(2) + 'px,0,0)'; }
    function step(ts) {
      raf = 0;
      if (!alive) return;
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      if (nudge) {
        var k = Math.min(1, (ts - nudge.t0) / nudge.ms), e = 1 - Math.pow(1 - k, 3);
        pos = nudge.from + (nudge.to - nudge.from) * e;
        if (k >= 1) nudge = null;
      } else if (!paused) pos += SPEED * dt;
      norm(); paint();
      if ((!paused || nudge) && !(paused & (P_HIDDEN | P_OFF))) raf = requestAnimationFrame(step);
      else last = 0;
    }
    function kick() { if (!raf && alive) { last = 0; raf = requestAnimationFrame(step); } }
    function set(flag, on) { if (on) paused |= flag; else paused &= ~flag; kick(); }
    /** move one card forward (+1) or back (−1), animated */
    function go(d) {
      var li = track.children[0], card = li ? li.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 24) : 324;
      var from = nudge ? nudge.to : pos;
      nudge = { from: pos, to: from + d * card, t0: performance.now(), ms: 450 };
      kick();
    }
    function onEnter(e) { if (e.pointerType === 'mouse') set(P_HOVER, true); }
    function onLeave(e) { if (e.pointerType === 'mouse') set(P_HOVER, false); }
    /** keyboard focus on a card: stop, and slide the belt (never scroll it) so the focused card is fully in view */
    function reveal(el) {
      var li = el && el.closest ? el.closest('.hm-track > li') : null; if (!li) return;
      if (belt.scrollLeft) belt.scrollLeft = 0;
      var br = belt.getBoundingClientRect(), r = li.getBoundingClientRect(), m = br.width * 0.08, dx = 0;
      if (r.left < br.left + m) dx = br.left + m - r.left; else if (r.right > br.right - m) dx = br.right - m - r.right;
      // the first card of the list sits at the start edge when pos = 0: never go below it (the copy that follows is behind)
      if (dx) { nudge = null; pos = Math.max(0, pos + dir * dx); paint(); }
    }
    function onFocusIn(e) {
      var kb = false; try { kb = e.target.matches(':focus-visible'); } catch (x) { kb = true; }
      if (!kb) return;
      set(P_FOCUS, true);
      var el = e.target; requestAnimationFrame(function () { reveal(el); });
    }
    function onScroll() { if (belt.scrollLeft) belt.scrollLeft = 0; }
    function onFocusOut(e) { if (!root.contains(e.relatedTarget)) set(P_FOCUS, false); }
    function onDown(e) {
      if (e.button > 0) return;
      clearTimeout(resumeT);
      if (e.pointerType !== 'mouse') set(P_TOUCH, true);
      drag = { id: e.pointerId, x: e.clientX, pos: pos, moved: false, type: e.pointerType };
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true; set(P_DRAG, true); nudge = null;
        try { belt.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
        root.classList.add('hm-dragging');
      }
      if (drag.moved) { pos = drag.pos + dir * dx; norm(); paint(); }
    }
    function onUp(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      if (drag.moved) { suppress = true; setTimeout(function () { suppress = false; }, 0); }
      var touch = drag.type !== 'mouse';
      drag = null; root.classList.remove('hm-dragging'); set(P_DRAG, false);
      if (touch) { clearTimeout(resumeT); resumeT = setTimeout(function () { set(P_TOUCH, false); }, 2000); }
    }
    function onClick(e) { if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; } }
    function onVis() { set(P_HIDDEN, document.hidden); }
    var onResize = AAT.debounce(function () { var f = W ? pos / W : 0; measure(); pos = f * W; norm(); paint(); }, 150);
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    belt.addEventListener('pointerdown', onDown);
    belt.addEventListener('pointermove', onMove);
    belt.addEventListener('pointerup', onUp);
    belt.addEventListener('pointercancel', onUp);
    belt.addEventListener('click', onClick, true);
    belt.addEventListener('dragstart', function (e) { e.preventDefault(); });
    belt.addEventListener('scroll', onScroll);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', onResize);
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (en) { set(P_OFF, !en[0].isIntersecting); }, { rootMargin: '120px 0px' });
      io.observe(root);
    }
    measure(); paint(); onVis(); kick();
    return {
      go: go,
      speed: function () { return SPEED; },
      state: function () { return { pos: pos, W: W, paused: paused, running: !!raf }; },
      destroy: function () {
        alive = false; if (raf) cancelAnimationFrame(raf); raf = 0; clearTimeout(resumeT);
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('resize', onResize);
        if (io) io.disconnect();
      }
    };
  }
  var belt = null, phMq = null, phSet = null;
  AAT.acts['hm-belt'] = function (el) { if (belt) belt.go(+el.getAttribute('data-d') || 1); };
  AAT.acts['hm-month'] = function (el) {
    var box = document.getElementById('hm-board-rows'), m = el.getAttribute('data-m');
    if (!box || !m) return;
    AAT.$$('.hm-months .chip').forEach(function (c) { var on = c === el; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    box.innerHTML = boardHtml(m);
  };

  AAT.pages.home = {
    /** render(ctx) → the whole home page as one string (inserted once by the router) */
    render: function (ctx) {
      if (ctx.rest) return null;                       // "#home-x" is not a page
      return opening() + shows() + products() + issue() + directory() + modern() + club() + reading();
    },
    mount: function (ctx, view) {
      // a placeholder that fits the phone search field (the full one is cut at 390 px in English)
      var inp = AAT.$('.hm-sbox input', view);
      if (inp && window.matchMedia) {
        phMq = window.matchMedia('(max-width:480px)');
        phSet = function () { inp.placeholder = phMq.matches ? t('search_ph_s') : t('search_ph'); };
        phSet();
        if (phMq.addEventListener) phMq.addEventListener('change', phSet); else if (phMq.addListener) phMq.addListener(phSet);
      }
      var root = AAT.$('#hm-conv', view);
      if (root) belt = Belt(root);
      AAT.homeBelt = belt;                             // for QA scripts (speed, pause state)
    },
    unmount: function () {
      if (belt) belt.destroy(); belt = null; AAT.homeBelt = null;
      if (phMq && phSet) { if (phMq.removeEventListener) phMq.removeEventListener('change', phSet); else if (phMq.removeListener) phMq.removeListener(phSet); }
      phMq = phSet = null;
    },
    title: function () { return /^zh/.test(AAT.lang) && D.config.siteName.zh ? D.config.siteName.zh : t('title'); }
  };
}());
