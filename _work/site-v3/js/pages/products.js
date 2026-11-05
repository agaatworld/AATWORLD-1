/* =============================================================================
   AAT World v3 · js/pages/products.js — PRODUCTS + MODERN INDUSTRIES
   Owner: the products page builder. Spec: DESIGN.md §6.9, §6.10, §6.11. Contract: CONTRACT.md.
   CSS: css/products.css (prefixes .pr- products, .md- modern industries).

   Routes (module 'products' in AAT.ROUTES):
     #products            navy board (H1, brass 127, scoped search, fan of three product pictures)
                          → [search results, paper, only while searching] → floor: the moving conveyor
                          → sticky field index (chips) → one band per field (paper/floor…): picture cards,
                            text rows for products without a shipped picture, the makers of the field
                          → navy: the six modern-industry groups
     #products-CAT        the same page, scrolled to that field's band (title bar highlighted)
     #product-NN-K        board (name, brass page, picture or maker logo) → product details + supplier card
                          → more from the supplier → similar products (bands alternate; the last is never floor)
     #modern              board (H1, brass 40, framed m10.jpg) → group index → six group bands → navy conveyor
     #modern-GROUP        the same page, scrolled to that group's band
     #modern-N            board (Arabic name, English lead, picture if shipped) → details + contact card → more in the group

   Pictures: only shipped files (AAT.src / AAT.img / ui.productCell return '' otherwise): an item without a
   shipped picture is a text row, never an empty picture box.
   The conveyor moves on every computer at ~42 px/s (as the home conveyor, owner rule of update 34): driven by
   requestAnimationFrame (transform only), pauses on hover, keyboard focus and touch (resumes 2 s after the
   touch ends), can be dragged, has two arrow buttons, and sleeps while off screen or in a hidden tab.
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT, D = AAT.data, ui = AAT.ui, esc = AAT.esc, W = window;
  var t = function (k, v) { return AAT.t('products.' + k, v); };

  AAT.strings.products = {
    ar: {
      from: 'من', search_s: 'ابحث عن منتج أو شركة', fields: 'المجالات', makers: 'الشركات المصنّعة',
      belt_t: 'منتجات المعلنين في العدد {n}', belt: 'شريط منتجات المعلنين، يتحرك ببطء', prev: 'السابق', next: 'التالي',
      modern: 'منتجات وصناعات حديثة', modern_all: 'كل الصناعات الحديثة', modern_and: 'وصناعة في',
      md_lead: 'صفحات تعرّف بمصانع وآلات حديثة من آسيا، مع وسائل التواصل مع كل مصنع.',
      res_t: 'نتائج البحث', res_clear: 'إلغاء البحث', ask_q: 'اسأل AAT عن «{q}»', res_cos: 'الشركات',
      details: 'تفاصيل المنتج', f_field: 'المجال', f_page: 'في المجلة', f_src: 'مصدر المنتج', src_web: 'من موقع الشركة',
      co_page: 'صفحة الشركة', ask_btn: 'اسأل AAT عن هذا المنتج', ask_msg: 'مرحباً AAT، أسأل عن: {p} ({c})',
      prod_url: 'صفحة المنتج على موقع الشركة',
      phone: 'الهاتف', email: 'البريد الإلكتروني', web: 'الموقع', addr: 'العنوان', certs: 'الشهادات', wa: 'واتساب الشركة',
      more_from: 'منتجات أخرى من {c}', all_cat: 'كل منتجات {cat}',
      page_in: 'صفحة في العدد {n}', pages_in: 'صفحات في العدد {n}',
      more_n: 'عرض باقي المنتجات ({n})', md_contact: 'للتواصل', md_more: 'منتجات أخرى في {g}', in_ar: ''
    },
    en: {
      from: 'from', search_s: 'A product or a company', fields: 'Fields', makers: 'The makers',
      belt_t: 'Advertisers’ products in issue {n}', belt: 'Advertisers’ products, moving slowly', prev: 'Previous', next: 'Next',
      modern: 'Modern products and industries', modern_all: 'All modern industries', modern_and: 'and industries in',
      md_lead: 'Pages about modern factories and machines from Asia, with the contact details of each maker.',
      res_t: 'Search results', res_clear: 'Clear the search', ask_q: 'Ask AAT about “{q}”', res_cos: 'Companies',
      details: 'Product details', f_field: 'Field', f_page: 'In the magazine', f_src: 'Product source', src_web: 'From the maker’s website',
      co_page: 'Company page', ask_btn: 'Ask AAT about this product', ask_msg: 'Hello AAT, I am asking about: {p} ({c})',
      prod_url: 'The product page on the maker’s website',
      phone: 'Phone', email: 'Email', web: 'Website', addr: 'Address', certs: 'Certificates', wa: 'Company WhatsApp',
      more_from: 'More products from {c}', all_cat: 'All products in {cat}',
      page_in: 'page in issue {n}', pages_in: 'pages in issue {n}',
      more_n: 'Show the other {n} products', md_contact: 'Contact the maker', md_more: 'More in {g}', in_ar: 'The text of this page is in Arabic.'
    }
  };

  /* ======================================================================
     Data helpers (everything from data.json; counts computed)
     ====================================================================== */
  var ALL = null;
  /** every product as {c, p} in company page order */
  function all() {
    if (!ALL) { ALL = []; (D.companies || []).forEach(function (c) { (c.products || []).forEach(function (p) { ALL.push({ c: c, p: p }); }); }); }
    return ALL;
  }
  function hasPic(x) { return !!AAT.src(x.p.img); }
  /** the fields (cats) that have products, in data order: [{k, cat, items}] */
  function cats() {
    return Object.keys(D.cats || {}).map(function (k) { return { k: k, cat: D.cats[k], items: all().filter(function (x) { return x.c.cat === k; }) }; })
      .filter(function (g) { return g.items.length; });
  }
  function coCount(items) { var s = {}; items.forEach(function (x) { s[x.c.id] = 1; }); return Object.keys(s).length; }
  function group(id) { return (D.modernGroups || []).filter(function (g) { return g.id === id; })[0] || null; }
  function groupItems(id) { return (D.modern || []).filter(function (m) { return m.group === id; }); }
  /** Arabic name of a modern item: the text before the first Latin letter; when the name starts in Latin, its Arabic run */
  function mAr(m) {
    var s = AAT.modernArName(m).replace(/[\s\d.,:;\-–(]+$/, '');
    if (AAT.isAr(s)) return s;
    var a = String((m.name && m.name.ar) || '').replace(/[A-Za-z][^؀-ۿ]*/g, ' ').replace(/\s+/g, ' ').trim();
    return a || (m.name && m.name.en) || '';
  }
  /** "127 منتجاً من 28 شركة" / "127 products from 28 companies" (noun only when nounOnly) */
  function prodFrom(n, nco, nounOnly) { return (nounOnly ? AAT.count(n, 'product', true) : AAT.count(n, 'product')) + ' ' + t('from') + ' ' + AAT.count(nco, 'company'); }
  function waAAT(msg) { return 'https://wa.me/' + D.config.whatsapp + '?text=' + encodeURIComponent(msg); }
  function webHref(u) { u = String(u || '').trim(); return /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^\/+/, ''); }
  function webText(u) { return String(u || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, ''); }
  /**
   * ax(s) → escaped Arabic text with every Latin run (commas, e-mails and URLs kept inside the run), phone number
   * and number range isolated LTR ("NO. 15 & 17, LORONG …, MALAYSIA", "+603 3323 1657" never come out reversed).
   */
  var RUN = /\([A-Za-z0-9][A-Za-z0-9.,&'’\-\/ ×@:_+%#]*\)|\+?\d[\d ,\-–()\/.]*\d|[A-Za-z@][A-Za-z0-9.,&'’\-\/ ×@:_+%#()]*[A-Za-z0-9)]|[A-Za-z]/g;
  function ax(raw) {
    raw = String(raw == null ? '' : raw);
    var out = '', last = 0, m;
    RUN.lastIndex = 0;
    while ((m = RUN.exec(raw))) {
      var run = m[0];
      if (/^\d[\d.,]*$/.test(run)) continue; // a lone number keeps its place by itself
      out += esc(raw.slice(last, m.index)) + '<bdi dir="ltr" class="lt">' + esc(run) + '</bdi>';
      last = m.index + run.length;
    }
    return out + esc(raw.slice(last));
  }
  /** a text block in the direction of its script, Latin runs isolated with ax() (Arabic block on LTR pages) */
  function blk(s, tag, cls) {
    s = String(s == null ? '' : s); tag = tag || 'p';
    if (!AAT.isAr(s)) return AAT.rtl && /[A-Za-z]/.test(s) ? AAT.ltb(s, tag, cls) : '<' + tag + ' class="' + cls + '">' + esc(s) + '</' + tag + '>';
    return '<' + tag + (AAT.rtl ? '' : ' dir="rtl" lang="ar"') + ' class="' + (AAT.rtl ? '' : 'rtb ') + cls + '">' + ax(s) + '</' + tag + '>';
  }
  function isLatin(s) { return /[A-Za-z]/.test(s) && !AAT.isAr(s); }

  /* ======================================================================
     Small markup helpers (own markup under .pr- / .md-; shared parts from AAT.ui)
     ====================================================================== */
  /** company name in the visitor's language: Arabic name on the Arabic site when known, else the Latin name (isolated) */
  function coNameHtml(c) { return AAT.lang === 'ar' && c.nameAr ? esc(c.nameAr) : (AAT.rtl ? AAT.lt(c.company) : esc(c.company)); }
  function shortName(c) { return c.company.replace(/ (Co\.|Corp\.|Technologies|Electronic|Plastic|Industry|Industrial|·).*$/, '').trim(); }
  function logoOrName(c, w, h) {
    return c.logo && AAT.src(c.logo) ? AAT.img(c.logo, { alt: c.company, w: w, h: h }) : '<span class="pr-type" dir="ltr">' + esc(shortName(c)) + '</span>';
  }
  function place(c) {
    var og = AAT.origin(c);
    return '<span class="pr-place">' + (og.cc ? ui.flag(og.cc, 27, 18) : '') + '<span>' + AAT.txt(og.text) + '</span></span>';
  }
  /** picture cards in a flow whose last row is centred */
  function flow(list, o) {
    o = o || {};
    if (!list.length) return '';
    return '<ul class="pr-flow' + (o.cls ? ' ' + o.cls : '') + '">' + list.map(function (x, i) { return '<li>' + ui.productCell(x.c, x.p, { eager: o.eager && i < 4 }) + '</li>'; }).join('') + '</ul>';
  }
  /** text rows (products without a shipped picture): name · maker · page stamp */
  var FOLD = 5;   // phones show the first 5 rows of a long list, then "عرض باقي المنتجات (8)"
  function fold(n) {
    return n > FOLD + 1 ? '<div class="pr-fold-w">' + ui.pager({ label: t('more_n', { n: n - FOLD }), act: 'pr-more', attrs: { 'aria-expanded': 'false' } }) + '</div>' : '';
  }
  function rows(list) {
    if (!list.length) return '';
    return '<div class="pr-rows' + (list.length === 1 ? ' pr-rows-1' : '') + (list.length > FOLD + 1 ? ' pr-fold' : '') + '">' +
      list.map(function (x) { return ui.productRow(x.c, x.p); }).join('') + '</div>' + fold(list.length);
  }
  /** a short board of names + descriptions, beside one or two lone cards (so the band is never half empty) */
  function descBoard(list) {
    var c = list[0].c, about = list.length === 1 ? AAT.L(c.about) : '';
    return '<div class="pr-descs">' + list.map(function (x) {
      return '<a class="pr-dl" href="#product-' + x.c.id + '-' + x.p.k + '">' + AAT.ltb(x.p.n, 'b', 'pr-dl-n') + blk(AAT.L(x.p.d), 'span', 'pr-dl-d') + '</a>';
    }).join('') + (about ? '<a class="pr-dl pr-dl-co" href="#company-' + c.id + '"><b class="pr-dl-n">' + coNameHtml(c) + '</b>' + blk(about, 'span', 'pr-dl-d') + '</a>' : '') + '</div>';
  }
  /**
   * products of one group: cards for shipped pictures, rows for the rest.
   * One or two cards sit beside their rows (or beside their descriptions) instead of alone in a wide row.
   */
  function mix(list, o) {
    var pics = list.filter(hasPic), rest = list.filter(function (x) { return !hasPic(x); });
    if (pics.length && pics.length <= 2) {
      return '<div class="pr-mix pr-mix-' + pics.length + '">' + flow(pics, o) + (rest.length ? rows(rest) : descBoard(pics)) + '</div>';
    }
    return flow(pics, o) + rows(rest);
  }
  /** the makers of a field: compact white rows (logo or typeset name, name, city, product count) → company page */
  function makers(items) {
    var list = [], n = {};
    items.forEach(function (x) { if (!n[x.c.id]) { n[x.c.id] = 0; list.push(x.c); } n[x.c.id] += 1; });
    return '<aside class="pr-makers"><h3 class="h3">' + esc(t('makers')) + '</h3><ul>' + list.map(function (c) {
      var name = AAT.lang === 'ar' && c.nameAr ? '<b class="pr-mk-n">' + esc(c.nameAr) + '</b>' : AAT.ltb(c.company, 'b', 'pr-mk-n clamp2');
      return '<li><a class="pr-mk" href="#company-' + c.id + '"><span class="pr-mk-logo">' + logoOrName(c, 120, 48) + '</span><span class="pr-mk-t">' + name + place(c) +
        '<span class="pr-mk-c">' + esc(AAT.count(n[c.id], 'product')) + '</span></span></a></li>';
    }).join('') + '</ul></aside>';
  }
  /** bands after the opening board: paper → floor → paper …; a last floor band becomes navy (the app adds the floor contact band) */
  function bands(list) {
    list = list.filter(Boolean);
    return list.map(function (o, i) {
      var b = i % 2 ? 'floor' : 'paper';
      if (i === list.length - 1 && b === 'floor') b = 'night';
      var s = ui.section(Object.assign({ band: b }, o));
      return o.after ? s.replace(/<\/section>$/, o.after + '</section>') : s;
    }).join('');
  }

  /* ---------- the conveyor (markup) ---------- */
  function conveyor() {
    var cells = [], dup = [];
    all().forEach(function (x) {
      if (!hasPic(x)) return;
      cells.push('<li>' + ui.productCell(x.c, x.p, { eager: cells.length < 4 }) + '</li>');
      dup.push('<li aria-hidden="true">' + ui.productCell(x.c, x.p, { attrs: { tabindex: '-1' } }) + '</li>');
    });
    if (!cells.length) return '';
    var arw = function (k, icon) { return '<button class="pr-arw pr-' + k + '" type="button" data-act="pr-belt" data-d="' + (k === 'next' ? 1 : -1) + '" aria-label="' + esc(t(k)) + '">' + AAT.icon(icon, 28) + '</button>'; };
    return '<div class="pr-conv"><div class="pr-belt" role="region" aria-label="' + esc(t('belt')) + '"><ul class="pr-track">' + cells.join('') + dup.join('') + '</ul></div>' +
      '<div class="pr-ctl">' + arw('prev', 'back') + arw('next', 'arrow') + '</div></div>';
  }
  function beltBand(band) {
    return ui.section({ id: 'pr-belt-band', band: band, cls: 'pr-beltband', title: t('belt_t', { n: D.magazine.number }),
      meta: band === 'night' ? prodFrom(AAT.stats.products, AAT.stats.prodCos) : null,
      action: band === 'night' ? { label: AAT.t('hot_all'), href: '#products', iconEnd: 'arrow' } : null }).replace(/<\/section>$/, conveyor() + '</section>');
  }

  /* ======================================================================
     #products — المنتجات (§6.9)
     ====================================================================== */
  /** three product pictures from three different fields, fanned in white frames */
  function fan() {
    var want = [[2, 0], [4, 1], [84, 0]], used = {}, list = [];
    want.forEach(function (w) { var r = AAT.product(w[0], w[1]); if (r && hasPic(r) && !used[r.c.cat]) { used[r.c.cat] = 1; list.push(r); } });
    all().forEach(function (x) { if (list.length < 3 && hasPic(x) && !used[x.c.cat]) { used[x.c.cat] = 1; list.push(x); } });
    return '<div class="pr-fan">' + list.map(function (x) {
      return '<a class="pr-fan-i" href="#product-' + x.c.id + '-' + x.p.k + '">' + ui.frame({ src: x.p.img, alt: x.p.n, w: 300, h: 240, contain: true, eager: true }) + ui.folio(x.c.pages[0], { tilt: true }) + '</a>';
    }).join('') + '</div>';
  }
  function productsPage(ctx) {
    var S = AAT.stats, G = cats(), sel = ctx.rest;
    var board = ui.openingBoard({
      cls: 'pr-ob', h1: AAT.t('prod_tab'), lead: AAT.t('prod_all_lead'),
      figure: { n: AAT.num(S.products), label: prodFrom(S.products, S.prodCos, true) },
      search: { act: 'pr-search', placeholder: AAT.t('pr_search'), cls: 'pr-sbox' },
      picture: fan()
    });
    var chips = G.map(function (g) { return { label: AAT.L(g.cat), n: g.items.length, act: 'pr-cat', sel: g.k === sel, attrs: { 'data-cat': g.k } }; })
      .concat([{ label: t('modern'), n: S.modern, href: '#modern', cls: 'pr-chip-md' }]);
    var deck = '<nav class="pr-deck" id="pr-deck" aria-label="' + esc(t('fields')) + '"><div class="wrap">' + ui.chips(chips, { scroll: true, cls: 'pr-chips' }) + '</div></nav>';
    var list = G.map(function (g, i) {
      return ui.section({
        id: 'pr-' + g.k, band: i % 2 ? 'floor' : 'paper', cls: 'pr-band', title: AAT.L(g.cat), meta: prodFrom(g.items.length, coCount(g.items)),
        attrs: { 'data-cat': g.k },
        body: '<div class="pr-cat"><div class="pr-main">' + mix(g.items) + '</div>' + makers(g.items) + '</div>'
      });
    }).join('');
    var teaser = ui.section({
      id: 'pr-modern', band: 'night', title: t('modern'), meta: AAT.count(S.modern, 'product') + ' ' + t('modern_and') + ' ' + AAT.count(S.modernGroups, 'field'),
      action: { label: t('modern_all'), href: '#modern', iconEnd: 'arrow' },
      body: '<div class="grid g-3 pr-mds">' + (D.modernGroups || []).map(function (g) { return ui.modernCard(g); }).join('') + '</div>'
    });
    // navy board → [results, paper] → floor conveyor → field index + field bands (paper/floor…) → navy teaser
    return board + '<div id="pr-res-slot" class="pr-res-slot"></div>' + beltBand('floor') + '<div class="pr-cats">' + deck + list + '</div>' + teaser;
  }

  /* ---------- the scoped search on the products board (filters in place; asks AAT when nothing matches) ---------- */
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/[^a-z0-9؀-ۿ一-鿿]+/g, ' ').trim();
  }
  function tokens(q) {
    return norm(q).split(' ').filter(function (w) { return w.length > 1; }).map(function (w) { return w.length > 4 ? w.replace(/^(وال|بال|لل|ال)/, '') : w; });
  }
  var IDX = null;
  function index() {
    if (IDX) return IDX;
    var L = function (v) { return v ? [v.ar, v.en, v['zh-TW'], v['zh-CN'], v.ms].join(' ') : ''; };
    IDX = {
      p: all().map(function (x) { var c = x.c; return { x: x, h: norm([x.p.n, L(x.p.d), c.company, c.nameAr, L(D.cats[c.cat]), L(c.city)].join(' ')) }; }),
      m: (D.modern || []).map(function (m) { var g = group(m.group); return { m: m, h: norm([m.name.ar, m.name.en, m.description && m.description.ar, g && L(g.name)].join(' ')) }; }),
      c: (D.companies || []).map(function (c) { return { c: c, h: norm([c.company, c.nameAr, L(D.cats[c.cat]), L(c.city), L(c.about)].join(' ')) }; })
    };
    return IDX;
  }
  /** score every item by the query words it holds */
  function score(list, tk) { return list.map(function (e, i) { var s = 0; tk.forEach(function (w) { if (e.h.indexOf(w) >= 0) s += 1; }); return { e: e, s: s, i: i }; }); }
  /** items holding every word (full) or, when nothing anywhere holds them all, at least half of them (best first) */
  function pick(sc, tk, full) {
    var need = full ? tk.length : Math.max(1, Math.ceil(tk.length / 2));
    return sc.filter(function (r) { return r.s >= need; }).sort(function (a, b) { return b.s - a.s || a.i - b.i; }).map(function (r) { return r.e; });
  }
  function resultsHtml(q) {
    var tk = tokens(q), I = index();
    var sp = score(I.p, tk), sm = score(I.m, tk), sc = score(I.c, tk);
    var full = tk.length && [sp, sm, sc].some(function (l) { return l.some(function (r) { return r.s === tk.length; }); });
    var P = tk.length ? pick(sp, tk, full).map(function (e) { return e.x; }) : [];
    var M = tk.length ? pick(sm, tk, full).map(function (e) { return e.m; }) : [];
    var Cs = tk.length ? pick(sc, tk, full).map(function (e) { return e.c; }) : [];
    var n = P.length + M.length;
    var meta = '<bdi class="pr-q">«' + esc(q) + '»</bdi> · ' + esc(AAT.count(n, 'product')) + (Cs.length ? ' · ' + esc(AAT.count(Cs.length, 'company')) : '');
    var body;
    if (!n && !Cs.length) {
      body = '<div class="pr-none">' + ui.empty({ act: 'pr-clear' }) + '<div class="btnrow">' + ui.button({ label: t('ask_q', { q: q }), act: 'ask', icon: 'chat', attrs: { 'data-q': q } }) + '</div></div>';
    } else {
      body = '<div class="pr-main">' + mix(P) +
        (M.length ? '<h3 class="h3 pr-res-h">' + esc(t('modern')) + '</h3>' + mdRows(M) : '') +
        (Cs.length ? '<h3 class="h3 pr-res-h">' + esc(t('res_cos')) + '</h3><div class="pr-res-cos">' + Cs.map(function (c) { return ui.logoCell(c, { products: true }); }).join('') + '</div>' : '') + '</div>';
    }
    return ui.section({ id: 'pr-results', band: 'paper', cls: 'pr-res', title: t('res_t'), metaHtml: meta, action: { label: t('res_clear'), act: 'pr-clear', kind: 'line', icon: 'close' }, body: body });
  }
  function showResults(q, scroll) {
    var slot = AAT.$('#pr-res-slot'); if (!slot) return;
    slot.innerHTML = resultsHtml(q);
    if (scroll) scrollToEl(AAT.$('#pr-results'), false);
  }
  function hideResults() { var slot = AAT.$('#pr-res-slot'); if (slot) slot.innerHTML = ''; }
  AAT.acts['pr-search'] = function (form) {
    var inp = form.elements.q, q = inp ? inp.value.trim() : '';
    if (q) showResults(q, true); else hideResults();
  };
  AAT.acts['pr-clear'] = function () {
    hideResults();
    var inp = AAT.$('.pr-sbox input'); if (inp) { inp.value = ''; try { inp.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    var ob = AAT.$('.pr-ob'); if (ob) scrollToEl(ob, false, true);
  };

  /* ======================================================================
     #product-NN-K — product page (§6.10)
     ====================================================================== */
  function supplier(c) {
    var og = AAT.origin(c), out = [];
    var names = (AAT.lang === 'ar' && c.nameAr ? '<b class="pr-sup-ar">' + esc(c.nameAr) + '</b>' + AAT.ltb(c.company, 'span', 'pr-sup-lt') : AAT.ltb(c.company, 'b', 'pr-sup-n'));
    out.push('<a class="pr-sup-co" href="#company-' + c.id + '"><span class="pr-sup-logo">' + logoOrName(c, 200, 80) + '</span><span class="pr-sup-names">' + names + place(c) + '</span></a>');
    var about = AAT.L(c.about); if (about) out.push(ui.blockText(about, 'p', 'pr-sup-about'));
    var tels = (c.tels && c.tels.length ? c.tels : (c.tel ? [c.tel] : [])).map(function (s) { return String(s).replace(/\s*\([^)]*\)\s*$/, '').trim(); }).filter(Boolean);
    if (tels.length) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('phone')) + '</span>' + tels.map(function (s) { return ui.copyField(s); }).join('') + '</div>');
    if (c.email) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('email')) + '</span><div class="cf pr-mcf">' + ui.mail(c.email, { copy: true }) + '</div></div>');
    if (c.web) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('web')) + '</span><a class="weblink pr-web" href="' + esc(webHref(c.web)) + '" target="_blank" rel="noopener" dir="ltr">' + esc(webText(c.web)) + AAT.icon('ext', 20) + '</a></div>');
    if (c.address) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('addr')) + '</span>' + (isLatin(c.address) ? AAT.ltb(c.address, 'p', 'pr-sup-addr') : '<p class="pr-sup-addr">' + AAT.txt(c.address) + '</p>') + '</div>');
    if (c.certs) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('certs')) + '</span><p class="pr-sup-addr">' + AAT.txt(c.certs) + '</p></div>');
    if (c.whatsapp) out.push('<div class="btnrow">' + ui.button({ label: t('wa'), href: 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, ''), newTab: true, kind: 'line', icon: 'chat' }) + '</div>');
    return '<aside class="board board-red pr-sup" aria-label="' + esc(AAT.t('pd_supplier')) + '"><h3 class="h3">' + esc(AAT.t('pd_supplier')) + '</h3>' + out.join('') + '</aside>';
  }
  function productPage(ctx) {
    if (ctx.parts.length !== 2) return null;
    var r = AAT.product(ctx.parts[0], ctx.parts[1]); if (!r) return null;
    var c = r.c, p = r.p, cat = AAT.cat(c.cat), M = D.magazine;
    var pl = AAT.pagesLabel(c.pages), multi = pl.indexOf('–') > 0;
    var picture = hasPic(r) ?
      '<div class="pr-shot">' + ui.frame({ src: p.img, alt: p.n, w: 500, h: 400, contain: true, eager: true }) + ui.folio(c.pages[0], { tilt: true }) + '</div>' :
      '<a class="pr-logob" href="#company-' + c.id + '"><span class="pr-logob-i">' + logoOrName(c, 280, 112) + '</span>' + ui.blockText(AAT.lang === 'ar' && c.nameAr ? c.nameAr : c.company, 'b', 'pr-logob-n') + place(c) + '</a>';
    var desc = AAT.L(p.d), short = !!desc && desc.length <= 150;
    var board = ui.openingBoard({
      cls: 'pr-ob pr-ob-item',
      h1Html: AAT.rtl ? AAT.ltb(p.n, 'span') : esc(p.n), h1Attrs: p.n.length > 44 ? { class: 'pr-long' } : null,
      leadHtml: short ? (AAT.isAr(desc) ? (AAT.rtl ? ax(desc) : AAT.rtlb(desc, 'span')) : (AAT.rtl ? AAT.ltb(desc, 'span') : esc(desc))) : null,
      meta: '<span class="pr-obm">' + AAT.icon('building', 22) + '<span>' + coNameHtml(c) + ' · ' + AAT.txt(AAT.origin(c).text) + '</span></span>',
      figure: { n: pl, label: t(multi ? 'pages_in' : 'page_in', { n: M.number }) },
      actions: ui.button({ label: t('co_page'), href: '#company-' + c.id, icon: 'building' }) +
        ui.button({ label: t('ask_btn'), href: waAAT(t('ask_msg', { p: p.n, c: c.company })), newTab: true, kind: 'ghost', icon: 'chat' }),
      picture: picture
    });
    var facts = ui.facts([
      { k: t('f_field'), v: cat ? '<a class="pr-flink" href="#products-' + esc(c.cat) + '">' + ui.tag(AAT.L(cat)) + '</a>' : '' },
      { k: t('f_page'), v: ui.folio(c.pages) },
      { k: t('f_src'), v: esc(p.src === 'web' ? t('src_web') : AAT.t('prod_from_ad')) }
    ]);
    var url = p.url ? '<p class="pr-url"><a class="weblink" href="' + esc(webHref(p.url)) + '" target="_blank" rel="noopener">' + esc(t('prod_url')) + AAT.icon('ext', 20) + '</a></p>' : '';
    var details = {
      id: 'pr-details', title: t('details'),
      body: '<div class="pr-det"><div class="pr-det-main">' + (desc && !short ? blk(desc, 'p', 'pr-desc') : '') + facts + url + '</div>' + supplier(c) + '</div>'
    };
    var others = (c.products || []).filter(function (q) { return q !== p; }).map(function (q) { return { c: c, p: q }; });
    var more = others.length ? {
      id: 'pr-more', titleHtml: esc(t('more_from', { c: '\u0000' })).replace('\u0000', coNameHtml(c)), meta: AAT.count(others.length, 'product'),
      body: '<div class="pr-main">' + mix(others) + '</div>'
    } : null;
    // similar: other makers' products in the same field (pictures first); else products of other fields
    var same = all().filter(function (x) { return x.c.cat === c.cat && x.c.id !== c.id; });
    var simPics = same.filter(hasPic).slice(0, 8), simRest = same.filter(function (x) { return !hasPic(x); });
    var sim;
    if (same.length) {
      var pick = simPics.concat(simPics.length < 4 ? simRest.slice(0, 6) : []);
      sim = { id: 'pr-similar', title: AAT.t('pd_similar'), meta: prodFrom(same.length, coCount(same)) + ' · ' + AAT.L(cat),
        action: { label: t('all_cat', { cat: AAT.L(cat) }), href: '#products-' + c.cat, iconEnd: 'arrow' }, body: '<div class="pr-main">' + mix(pick) + '</div>' };
    } else {
      var seen = {}, round = [];
      all().forEach(function (x) { if (round.length < 8 && hasPic(x) && x.c.id !== c.id && !seen[x.c.cat]) { seen[x.c.cat] = 1; round.push(x); } });
      sim = { id: 'pr-similar', title: t('belt_t', { n: M.number }), meta: prodFrom(AAT.stats.products, AAT.stats.prodCos),
        action: { label: AAT.t('hot_all'), href: '#products', iconEnd: 'arrow' }, body: '<div class="pr-main">' + mix(round) + '</div>' };
    }
    return board + bands([details, more, sim]);
  }

  /* ======================================================================
     #modern — منتجات وصناعات حديثة (§6.11)
     ====================================================================== */
  function mdCard(m) {
    var pic = AAT.img(m.image, { alt: AAT.lang === 'ar' ? mAr(m) : m.name.en, w: 480, h: 300 });
    var d = m.description && m.description.ar;
    var body = AAT.lang === 'ar' ?
      '<b class="md-t clamp3">' + ax(mAr(m)) + '</b>' + (m.name.en ? AAT.ltb(m.name.en, 'span', 'md-en clamp2') : '') + (d ? '<span class="md-desc clamp3">' + ax(d) + '</span>' : '') :
      '<b class="md-t clamp3">' + esc(AAT.L(m.name)) + '</b><span dir="rtl" lang="ar" class="rtb md-en clamp2">' + ax(mAr(m)) + '</span>' + (d ? '<span dir="rtl" lang="ar" class="rtb md-desc clamp3">' + ax(d) + '</span>' : '');
    return '<li><a class="md-card" href="#modern-' + m.id + '">' + (pic ? '<span class="md-pic">' + pic + '</span>' : '') + '<span class="md-body">' + body + '</span></a></li>';
  }
  function mdRows(list) {
    if (!list.length) return '';
    return '<div class="pr-rows md-rows' + (list.length === 1 ? ' pr-rows-1' : '') + (list.length > FOLD + 1 ? ' pr-fold' : '') + '">' + list.map(function (m) {
      var main = AAT.lang === 'ar' ? '<b class="md-row-t clamp2">' + ax(mAr(m)) + '</b>' + (m.name.en ? AAT.ltb(m.name.en, 'span', 'md-row-en clamp1') : '') :
        '<b class="md-row-t clamp2">' + esc(AAT.L(m.name)) + '</b><span dir="rtl" lang="ar" class="rtb md-row-en clamp1">' + ax(mAr(m)) + '</span>';
      return '<a class="row md-row" href="#modern-' + m.id + '"><span class="md-row-x">' + main + '</span>' + AAT.icon('arrow', 22) + '</a>';
    }).join('') + '</div>' + fold(list.length);
  }
  function mdBody(items) {
    var pics = items.filter(function (m) { return AAT.src(m.image); }), rest = items.filter(function (m) { return !AAT.src(m.image); });
    return '<div class="pr-main">' + (pics.length ? '<ul class="pr-flow md-flow">' + pics.map(mdCard).join('') + '</ul>' : '') + mdRows(rest) + '</div>';
  }
  function modernPage(ctx) {
    var S = AAT.stats, sel = ctx.rest, m10 = AAT.modernItem(10), g10 = m10 && group(m10.group);
    var cap = m10 ? (AAT.lang === 'ar' ? mAr(m10).split('،')[0] : String(AAT.L(m10.name)).split(' (')[0]) : '';
    var board = ui.openingBoard({
      cls: 'pr-ob md-ob', h1: t('modern'), lead: t('md_lead'), meta: AAT.rtl ? '' : esc(t('in_ar')),
      figure: { n: AAT.num(S.modern), label: AAT.count(S.modern, 'product', true) + ' ' + t('modern_and') + ' ' + AAT.count(S.modernGroups, 'field') },
      picture: m10 ? ui.frame({ src: m10.image, alt: cap, w: 600, h: 445, eager: true, drift: true, href: '#modern-' + m10.id, cap: cap, sub: g10 ? AAT.L(g10.name) : '', cls: 'md-ob-f' }) : ''
    });
    var G = D.modernGroups || [];
    var chips = G.map(function (g) { return { label: AAT.L(g.name), n: groupItems(g.id).length, act: 'md-grp', sel: g.id === sel, attrs: { 'data-g': g.id } }; })
      .concat([{ label: AAT.t('prod_tab'), n: S.products, href: '#products', cls: 'pr-chip-md' }]);
    var deck = '<nav class="pr-deck" id="pr-deck" aria-label="' + esc(t('fields')) + '"><div class="wrap">' + ui.chips(chips, { scroll: true, cls: 'pr-chips' }) + '</div></nav>';
    var list = G.map(function (g, i) {
      var items = groupItems(g.id);
      return ui.section({ id: 'md-' + g.id, band: i % 2 ? 'floor' : 'paper', cls: 'pr-band md-band', title: AAT.L(g.name), meta: AAT.count(items.length, 'product'), attrs: { 'data-g': g.id }, body: mdBody(items) });
    }).join('');
    // navy board → group index + six group bands (paper/floor…) → navy: the products conveyor
    return board + '<div class="pr-cats">' + deck + list + '</div>' + beltBand('night');
  }

  /* ---------- #modern-N ---------- */
  function mdContact(m) {
    var C = m.contact || {}, out = [], sites = [], seen = {};
    (C.urls || []).concat(m.web ? [m.web] : []).forEach(function (u) { var k = webText(u).toLowerCase().replace(/^www\./, ''); if (u && !seen[k]) { seen[k] = 1; sites.push(u); } });
    var mails = (C.emails || []).filter(function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); });
    var phones = []; (C.phones || []).forEach(function (s) { String(s).split(/\n+/).forEach(function (x) { x = x.trim(); if (x) phones.push(x); }); });
    if (mails.length) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('email')) + '</span>' + mails.map(function (e) { return '<div class="cf pr-mcf">' + ui.mail(e, { copy: true }) + '</div>'; }).join('') + '</div>');
    if (sites.length) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('web')) + '</span>' + sites.map(function (u) { return '<a class="weblink pr-web" href="' + esc(webHref(u)) + '" target="_blank" rel="noopener" dir="ltr">' + esc(webText(u)) + AAT.icon('ext', 20) + '</a>'; }).join('') + '</div>');
    if (phones.length) out.push('<div class="pr-sup-r"><span class="label">' + esc(t('phone')) + '</span>' + phones.map(function (s) { return ui.copyField(s); }).join('') + '</div>');
    var name = AAT.lang === 'ar' ? mAr(m) : AAT.L(m.name);
    out.push('<div class="btnrow">' + ui.button({ label: t('ask_btn'), href: waAAT(t('ask_msg', { p: name, c: AAT.L(group(m.group) && group(m.group).name) })), newTab: true, icon: 'chat' }) + '</div>');
    return '<aside class="board board-red pr-sup md-aside"><h3 class="h3">' + esc(t('md_contact')) + '</h3>' + out.join('') + '</aside>';
  }
  function mdText(m) {
    var html = (m.sections || []).map(function (s) {
      var lines = []; (s.lines || []).forEach(function (l) { String(l).split(/\n+/).forEach(function (x) { x = x.trim(); if (x) lines.push(x); }); });
      var body = lines.map(function (x) { return /^[•·\-–]\s*/.test(x) ? '<li>' + ax(x.replace(/^[•·\-–]\s*/, '')) + '</li>' : '<p>' + ax(x) + '</p>'; }).join('')
        .replace(/((?:<li>[\s\S]*?<\/li>)+)/g, '<ul class="md-list">$1</ul>');
      return (s.heading ? '<h3>' + ax(s.heading) + '</h3>' : '') + body;
    }).join('');
    return '<div class="prose md-read"' + (AAT.rtl ? '' : ' dir="rtl" lang="ar"') + '>' + html + '</div>';
  }
  function modernItemPage(ctx) {
    var m = AAT.modernItem(ctx.id); if (!m) return null;
    var g = group(m.group), ar = mAr(m), title = AAT.lang === 'ar' ? ar : AAT.L(m.name);
    var pic = AAT.src(m.image) ? ui.frame({ src: m.image, alt: title, ratio: '16/10', contain: true, eager: true, cap: g ? AAT.L(g.name) : '', cls: 'md-item-f' }) : '';
    var board = ui.openingBoard({
      cls: 'pr-ob md-ob-item', h1: title, h1Attrs: title.length > 44 ? { class: 'pr-long' } : null,
      leadHtml: AAT.lang === 'ar' ? (m.name.en ? AAT.ltb(m.name.en, 'span') : '') : AAT.rtlb(ar, 'span'),
      meta: AAT.rtl ? '' : esc(t('in_ar')),
      picture: pic
    });
    var details = { id: 'md-details', title: t('details'), body: '<div class="md-det">' + mdText(m) + mdContact(m) + '</div>' };
    var others = groupItems(m.group).filter(function (x) { return x !== m; });
    others = others.filter(function (x) { return AAT.src(x.image); }).concat(others.filter(function (x) { return !AAT.src(x.image); }));
    var more = others.length && g ? { id: 'md-more', title: t('md_more', { g: AAT.L(g.name) }), meta: AAT.count(others.length, 'product'),
      action: { label: t('modern_all'), href: '#modern-' + g.id, iconEnd: 'arrow' }, body: mdBody(others) } : null;
    return board + bands([details, more]);
  }

  /* ======================================================================
     Scrolling to a field / group band, the index chips, scroll spy
     ====================================================================== */
  function reduced() { try { return W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  /** height of the sticky bar above the page (PC menu bar: 64px, or 112px when it shows two rows; phone: the logo row) */
  function barH() {
    var nav = AAT.$('.nav'), mast = AAT.$('.mast');
    if (nav && getComputedStyle(nav).display !== 'none') return nav.offsetHeight;
    return mast && getComputedStyle(mast).position === 'sticky' ? mast.offsetHeight : 0;
  }
  var rootEl = null;
  var syncTop = AAT.debounce(function () { if (rootEl) rootEl.style.setProperty('--pr-top', barH() + 'px'); }, 100);
  function stickyOffset() {
    var nav = barH();
    var deck = AAT.$('#pr-deck'), dh = deck && getComputedStyle(deck).position === 'sticky' ? deck.offsetHeight : 0;
    return nav + dh + 12;
  }
  function scrollToEl(el, smooth, top) {
    if (!el) return;
    var y = top ? 0 : el.getBoundingClientRect().top + W.pageYOffset - stickyOffset();
    try { W.scrollTo({ top: Math.max(0, y), behavior: smooth && !reduced() ? 'smooth' : 'auto' }); } catch (e) { W.scrollTo(0, Math.max(0, y)); }
  }
  var hitT = 0;
  function goBand(id, smooth) {
    var el = document.getElementById(id); if (!el) return;
    scrollToEl(el, smooth);
    AAT.$$('.pr-hit').forEach(function (x) { x.classList.remove('pr-hit'); });
    el.classList.add('pr-hit'); clearTimeout(hitT); hitT = setTimeout(function () { el.classList.remove('pr-hit'); }, 2200);
    var k = el.getAttribute('data-cat') || el.getAttribute('data-g'); if (k) markChip(k);
  }
  function markChip(k) {
    var strip = AAT.$('#pr-deck .chips'); if (!strip) return;
    var on = null;
    AAT.$$('.chip[data-act]', strip).forEach(function (ch) {
      var me = (ch.getAttribute('data-cat') || ch.getAttribute('data-g')) === k;
      ch.classList.toggle('on', me); ch.setAttribute('aria-pressed', me ? 'true' : 'false'); if (me) on = ch;
    });
    if (!k) { strip.scrollLeft = 0; return; }
    if (on && strip.scrollWidth > strip.clientWidth) {
      var sr = strip.getBoundingClientRect(), cr = on.getBoundingClientRect();
      strip.scrollLeft += (cr.left - sr.left) - (sr.width - cr.width) / 2;
    }
  }
  AAT.acts['pr-cat'] = function (el) { var k = el.getAttribute('data-cat'); goBand('pr-' + k, true); AAT.setHash('products-' + k); };
  AAT.acts['md-grp'] = function (el) { var k = el.getAttribute('data-g'); goBand('md-' + k, true); AAT.setHash('modern-' + k); };

  /* ======================================================================
     The conveyor (one per page while shown) — transform only, ~42 px/s
     ====================================================================== */
  var SPEED = 42;
  var P_HOVER = 1, P_FOCUS = 2, P_TOUCH = 4, P_DRAG = 8, P_HIDDEN = 16, P_OFF = 32;
  function Belt(root) {
    var belt = root.querySelector('.pr-belt'), track = root.querySelector('.pr-track');
    var dir = AAT.rtl ? 1 : -1;  // Arabic: items travel to the right; LTR: to the left
    var Wd = 0, pos = 0, last = 0, raf = 0, paused = 0, resumeT = 0, nudge = null, alive = true, drag = null, suppress = false, io = null;
    function measure() { var li = track.children, half = li.length / 2; Wd = half ? Math.abs(li[half].getBoundingClientRect().left - li[0].getBoundingClientRect().left) : 0; }
    function norm1() { if (Wd > 0) pos = ((pos % Wd) + Wd) % Wd; }
    function paint() { track.style.transform = 'translate3d(' + (dir * pos).toFixed(2) + 'px,0,0)'; }
    function step(ts) {
      raf = 0; if (!alive) return;
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts;
      if (nudge) { var k = Math.min(1, (ts - nudge.t0) / nudge.ms), e = 1 - Math.pow(1 - k, 3); pos = nudge.from + (nudge.to - nudge.from) * e; if (k >= 1) nudge = null; }
      else if (!paused) pos += SPEED * dt;
      norm1(); paint();
      if ((!paused || nudge) && !(paused & (P_HIDDEN | P_OFF))) raf = requestAnimationFrame(step); else last = 0;
    }
    function kick() { if (!raf && alive) { last = 0; raf = requestAnimationFrame(step); } }
    function set(flag, on) { if (on) paused |= flag; else paused &= ~flag; kick(); }
    function go(d) {
      var li = track.children[0], card = li ? li.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 24) : 324;
      var from = nudge ? nudge.to : pos;
      nudge = { from: pos, to: from + d * card, t0: performance.now(), ms: 450 }; kick();
    }
    function reveal(el) {
      var li = el && el.closest ? el.closest('.pr-track > li') : null; if (!li) return;
      if (belt.scrollLeft) belt.scrollLeft = 0;
      var br = belt.getBoundingClientRect(), r = li.getBoundingClientRect(), m = br.width * 0.08, dx = 0;
      if (r.left < br.left + m) dx = br.left + m - r.left; else if (r.right > br.right - m) dx = br.right - m - r.right;
      if (dx) { nudge = null; pos = Math.max(0, pos + dir * dx); paint(); }
    }
    var h = {
      enter: function (e) { if (e.pointerType === 'mouse') set(P_HOVER, true); },
      leave: function (e) { if (e.pointerType === 'mouse') set(P_HOVER, false); },
      focusin: function (e) { var kb = false; try { kb = e.target.matches(':focus-visible'); } catch (x) { kb = true; } if (!kb) return; set(P_FOCUS, true); var el = e.target; requestAnimationFrame(function () { reveal(el); }); },
      focusout: function (e) { if (!root.contains(e.relatedTarget)) set(P_FOCUS, false); },
      down: function (e) { if (e.button > 0) return; clearTimeout(resumeT); if (e.pointerType !== 'mouse') set(P_TOUCH, true); drag = { id: e.pointerId, x: e.clientX, pos: pos, moved: false, type: e.pointerType }; },
      move: function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; set(P_DRAG, true); nudge = null; try { belt.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } root.classList.add('pr-dragging'); }
        if (drag.moved) { pos = drag.pos + dir * dx; norm1(); paint(); }
      },
      up: function (e) {
        if (!drag || (e && e.pointerId !== drag.id)) return;
        if (drag.moved) { suppress = true; setTimeout(function () { suppress = false; }, 0); }
        var touch = drag.type !== 'mouse'; drag = null; root.classList.remove('pr-dragging'); set(P_DRAG, false);
        if (touch) { clearTimeout(resumeT); resumeT = setTimeout(function () { set(P_TOUCH, false); }, 2000); }
      },
      click: function (e) { if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; } },
      dragstart: function (e) { e.preventDefault(); },
      scroll: function () { if (belt.scrollLeft) belt.scrollLeft = 0; },
      vis: function () { set(P_HIDDEN, document.hidden); },
      resize: AAT.debounce(function () { var f = Wd ? pos / Wd : 0; measure(); pos = f * Wd; norm1(); paint(); }, 150)
    };
    root.addEventListener('pointerenter', h.enter); root.addEventListener('pointerleave', h.leave);
    root.addEventListener('focusin', h.focusin); root.addEventListener('focusout', h.focusout);
    belt.addEventListener('pointerdown', h.down); belt.addEventListener('pointermove', h.move);
    belt.addEventListener('pointerup', h.up); belt.addEventListener('pointercancel', h.up);
    belt.addEventListener('click', h.click, true); belt.addEventListener('dragstart', h.dragstart); belt.addEventListener('scroll', h.scroll);
    document.addEventListener('visibilitychange', h.vis); W.addEventListener('resize', h.resize);
    if ('IntersectionObserver' in W) { io = new IntersectionObserver(function (en) { set(P_OFF, !en[0].isIntersecting); }, { rootMargin: '120px 0px' }); io.observe(root); }
    measure(); paint(); h.vis(); kick();
    return {
      go: go,
      state: function () { return { pos: pos, W: Wd, paused: paused, running: !!raf, speed: SPEED }; },
      destroy: function () {
        alive = false; if (raf) cancelAnimationFrame(raf); raf = 0; clearTimeout(resumeT);
        document.removeEventListener('visibilitychange', h.vis); W.removeEventListener('resize', h.resize); if (io) io.disconnect();
      }
    };
  }
  var belt = null;
  /** phones: open a folded list of rows */
  AAT.acts['pr-more'] = function (el) {
    var w = el.closest('.pr-fold-w'), list = w && w.previousElementSibling;
    if (list) list.classList.add('open');
    if (w) w.parentNode.removeChild(w);
    var first = list && list.children[FOLD]; if (first && first.focus) try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  };
  AAT.acts['pr-belt'] = function (el) { if (belt) belt.go(+el.getAttribute('data-d') || 1); };

  /* ======================================================================
     The module
     ====================================================================== */
  var view = null;      // 'products' | 'modern' | 'product' | 'modern-item'
  var spy = null, inp = null, onInput = null, phMq = null, phSet = null;
  function which(ctx) {
    if (ctx.head === 'product') return 'product';
    if (ctx.head === 'modern') return ctx.id != null ? 'modern-item' : 'modern';
    return 'products';
  }
  function validRest(ctx) {
    if (!ctx.rest) return true;
    if (ctx.head === 'products') return !!(D.cats && D.cats[ctx.rest]);
    if (ctx.head === 'modern') return !!group(ctx.rest);
    return false;
  }
  function startSpy(root) {
    if (!('IntersectionObserver' in W)) return;
    var list = AAT.$$('.pr-band', root), last = '';
    function pick() {
      var y = W.innerHeight * 0.38, k = '';
      list.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) k = s.getAttribute('data-cat') || s.getAttribute('data-g') || ''; });
      if (k !== last) { last = k; markChip(k); }
    }
    spy = new IntersectionObserver(pick, { rootMargin: '-38% 0px -61% 0px' });
    list.forEach(function (s) { spy.observe(s); });
  }
  AAT.pages.products = {
    /** render(ctx) → the HTML of the route, or null (unknown product, group or field → the 404 page) */
    render: function (ctx) {
      var v = which(ctx);
      if (v === 'product') return productPage(ctx);
      if (v === 'modern-item') return modernItemPage(ctx);
      if (!validRest(ctx)) return null;
      return v === 'modern' ? modernPage(ctx) : productsPage(ctx);
    },
    mount: function (ctx, root) {
      view = which(ctx);
      rootEl = root; root.style.setProperty('--pr-top', barH() + 'px'); W.addEventListener('resize', syncTop);
      var conv = AAT.$('.pr-conv', root); if (conv) belt = Belt(conv);
      AAT.productsBelt = belt;                                  // for QA scripts (speed, pause state)
      if (view === 'products' || view === 'modern') {
        startSpy(root);
        if (ctx.rest) requestAnimationFrame(function () { goBand((view === 'modern' ? 'md-' : 'pr-') + ctx.rest, false); });
      }
      inp = AAT.$('.pr-sbox input', root);
      if (inp && W.matchMedia) {   // a placeholder that fits the phone search field
        phMq = W.matchMedia('(max-width:480px)');
        phSet = function () { inp.placeholder = phMq.matches ? t('search_s') : AAT.t('pr_search'); };
        phSet(); if (phMq.addEventListener) phMq.addEventListener('change', phSet); else if (phMq.addListener) phMq.addListener(phSet);
      }
      if (inp) {
        onInput = AAT.debounce(function () { var q = inp.value.trim(); if (q.length >= 2) showResults(q, false); else if (!q) hideResults(); }, 220);
        inp.addEventListener('input', onInput);
      }
    },
    unmount: function () {
      if (belt) belt.destroy(); belt = null; AAT.productsBelt = null;
      if (spy) spy.disconnect(); spy = null;
      if (inp && onInput) inp.removeEventListener('input', onInput); inp = onInput = null;
      if (phMq && phSet) { if (phMq.removeEventListener) phMq.removeEventListener('change', phSet); else if (phMq.removeListener) phMq.removeListener(phSet); } phMq = phSet = null;
      clearTimeout(hitT); view = null;
      W.removeEventListener('resize', syncTop); if (rootEl) rootEl.style.removeProperty('--pr-top'); rootEl = null;
    },
    /** a field / group chip or #products-CAT on the same page: scroll there instead of re-rendering */
    update: function (ctx) {
      var v = which(ctx);
      if (v !== view || (v !== 'products' && v !== 'modern') || !validRest(ctx)) return false;
      if (ctx.rest) goBand((v === 'modern' ? 'md-' : 'pr-') + ctx.rest, true);
      else { var ob = AAT.$('.pr-ob'); if (ob) scrollToEl(ob, true, true); }
      return true;
    }
  };
}());
