/* =============================================================================
   AAT World v3 · js/pages/companies.js — COMPANY DIRECTORY + COMPANY PAGES
   Owner: the companies page builder. Only this builder edits this file and css/companies.css.
   Routes (DESIGN.md §6.1, §6.5, §6.6):
     #companies                     the directory: navy board (logo fan + search) → sticky filter deck
                                    (country chips + field chips, counts recompute) → one band per field
                                    → navy "your printed ad becomes an online page" band
     #companies-<cat>               field filter (cat = data.cats key, e.g. #companies-machinery)
     #companies-<country>           country filter (origin slug: taiwan, syria, malaysia, uae, indonesia,
                                    turkey, india, saudi-arabia, pakistan)
     #companies-<country>-<cat>     both filters
     #company-<id>                  company page: board (name, place, folio, logo + product picture)
                                    → about + facts + contact card → products → in the magazine
                                    → from the company website (only when its content is shown)
                                    → more companies in the directory
   Filters update in place (AAT.setHash, no re-render). The board search filters while typing.
   CSS prefix .co- (css/companies.css). Shared components used: openingBoard, searchBox, section,
   chips, flag, folio, frame, facts, tag, button, mail, empty, logoCell, productCell, blockText.
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT, D = AAT.data, ui = AAT.ui, esc = AAT.esc;
  var t = function (k, v) { return AAT.t('companies.' + k, v); };

  /* UI copy that is not in data.json (DESIGN.md §8). zh/ms fall back to English. */
  AAT.strings.companies = {
    ar: {
      search: 'ابحث عن شركة أو منتج', in_issue: 'في العدد {n}', country: 'الدولة', field: 'المجال', all_fields: 'كل المجالات',
      from_c: 'شركات من {c}', results: 'نتائج البحث عن «{q}»', in_field: 'في مجال {f}',
      p1: 'صفحة في العدد {n}', p2: 'صفحتان في العدد {n}', pn: 'صفحات في العدد {n}',
      web: 'الموقع الإلكتروني', wa: 'راسل الشركة على واتساب', ask: 'اسأل AAT عن هذه الشركة',
      ask_msg: 'مرحباً AAT، أسأل عن شركة: {c}', prods_t: 'منتجات الشركة', from_site: 'من موقع الشركة', in_en: 'بالإنجليزية',
      mag_lead: 'إعلان الشركة مطبوع في هذا العدد:', pg_row: 'الصفحة {n} من {t}', toc: 'فهرس العدد', pdf_full: 'العدد كاملاً بصيغة PDF',
      more_t: 'شركات أخرى في الدليل', change: 'تغيير التصفية'
    },
    en: {
      search: 'Search a company or a product', in_issue: 'in issue {n}', country: 'Country', field: 'Field', all_fields: 'All fields',
      from_c: 'Companies from {c}', results: 'Results for “{q}”', in_field: 'in {f}',
      p1: 'page in issue {n}', p2: 'pages in issue {n}', pn: 'pages in issue {n}',
      web: 'Website', wa: 'Message the company on WhatsApp', ask: 'Ask AAT about this company',
      ask_msg: 'Hello AAT, I am asking about the company: {c}', prods_t: 'Company products', from_site: 'From the company website', in_en: 'in English',
      mag_lead: 'The company’s advertisement is printed in this issue:', pg_row: 'Page {n} of {t}', toc: 'Issue contents', pdf_full: 'The full issue as PDF',
      more_t: 'More companies in the directory', change: 'Change filters'
    }
  };

  /* ======================================================================
     Data prepared once: origin countries, fields, search index
     ====================================================================== */
  var COS = D.companies || [], CATS = D.cats || {}, M = D.magazine || {};
  function slugOf(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  // Arabic + Latin normalisation for the search (alef forms, ya, ta marbuta, tashkeel, case)
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^0-9a-z؀-ۿ]+/g, ' ').trim();
  }
  var ORIG = {}, ORDER_C = [], INFO = {};
  COS.forEach(function (c) {
    var og = AAT.origin(c), slug = slugOf(og.country);
    var arC = (og.ar.split('،').pop() || '').trim();
    if (!ORIG[slug]) { ORIG[slug] = { slug: slug, en: og.country, ar: arC || og.country, cc: og.cc, n: 0, first: c.id }; ORDER_C.push(slug); }
    ORIG[slug].n += 1;
    var hay = [c.company, c.nameAr, c.city && c.city.ar, c.city && c.city.en, c.about && c.about.ar, c.about && c.about.en, c.certs,
      CATS[c.cat] && CATS[c.cat].ar, CATS[c.cat] && CATS[c.cat].en, og.country, arC];
    (c.products || []).forEach(function (p) { hay.push(p.n); if (p.d) { hay.push(p.d.ar); hay.push(p.d.en); } });
    INFO[c.id] = { slug: slug, hay: ' ' + norm(hay.filter(Boolean).join(' ')) + ' ' };
  });
  ORDER_C.sort(function (a, b) { return ORIG[b].n - ORIG[a].n || ORIG[a].first - ORIG[b].first; });
  var FIELDS = [];
  Object.keys(CATS).forEach(function (k) {
    var list = COS.filter(function (c) { return c.cat === k; });
    if (list.length) FIELDS.push({ key: k, n: list.length, first: list[0].id });
  });
  FIELDS.sort(function (a, b) { return b.n - a.n || a.first - b.first; });
  var FIELD_OK = {}; FIELDS.forEach(function (f) { FIELD_OK[f.key] = 1; });

  /** visitor-language name of an origin country (flag countries use data.countries, India uses the city line) */
  function countryName(slug) {
    var o = ORIG[slug]; if (!o) return '';
    var c = o.cc ? AAT.country(o.cc) : null;
    return c ? AAT.L(c) : AAT.L({ ar: o.ar, en: o.en });
  }
  function catName(k) { return AAT.L(CATS[k]); }
  function productsOf(list) { return list.reduce(function (s, c) { return s + (c.products || []).length; }, 0); }
  function shippedProducts(c) { return (c.products || []).filter(function (p) { return AAT.src(p.img); }); }
  /** the company's names in display order: [primary, secondary] (Arabic name first on the Arabic site) */
  function primaryName(c) { return AAT.lang === 'ar' && c.nameAr ? c.nameAr : c.company; }
  function shortName(c) { return c.company.replace(/ (Co\.|Corp\.|Technologies|Electronic|Plastic|Industry|Industrial|·).*$/, '').trim(); }
  /* Local direction isolation for Arabic sentences (work-around, see the result notes): AAT.arx keeps a closing ")"
     inside a Latin run that did not open it and leaves "(US 11,503,915 B1)" in pieces, which reorders the text in RTL.
     Here a parenthesised Latin group is one run, and a run never ends with ")". */
  var RUN = /\([^()\u0600-\u06FF]*[A-Za-z][^()\u0600-\u06FF]*\)|[A-Za-z][A-Za-z0-9.,&'’\-\/ ×@:_+%]*[A-Za-z0-9]|[A-Za-z]|\d[\d,.]*\s*[–—-]\s*\d[\d,.]*/g;
  function isoAr(raw) {
    raw = String(raw == null ? '' : raw);
    var out = '', last = 0, m; RUN.lastIndex = 0;
    while ((m = RUN.exec(raw))) { out += esc(raw.slice(last, m.index)) + '<bdi dir="ltr" class="lt">' + esc(m[0]) + '</bdi>'; last = m.index + m[0].length; }
    return out + esc(raw.slice(last));
  }
  function txt(s) {
    if (s == null || s === '') return '';
    s = String(s);
    if (AAT.rtl) return /[A-Za-z]|\d\s*[–—-]\s*\d/.test(s) ? isoAr(s) : esc(s);
    return AAT.txt(s);
  }
  /** a text block whose direction follows its script (as AAT.ui.blockText, with the local isolation above) */
  function block(s, tag, cls) {
    s = String(s == null ? '' : s);
    if (!AAT.rtl && AAT.isAr(s)) return AAT.rtlb(s, tag, cls);
    if (AAT.rtl && /[A-Za-z]/.test(s) && !AAT.isAr(s)) return AAT.ltb(s, tag, cls);
    return '<' + tag + ' class="' + cls + '">' + txt(s) + '</' + tag + '>';
  }
  function waHref(num, msg) { return 'https://wa.me/' + String(num).replace(/\D/g, '') + (msg ? '?text=' + encodeURIComponent(msg) : ''); }

  /* ======================================================================
     Directory state and route parsing
     ====================================================================== */
  var st = { country: null, cat: null, q: '' };
  var bound = null; // listeners bound in mount (released in unmount)
  /** '#companies-taiwan-machinery' rest → {country, cat}; null when a token is unknown (→ 404) */
  function parseDir(rest) {
    var s = { country: null, cat: null }, r = String(rest || '').toLowerCase();
    if (!r) return s;
    Object.keys(FIELD_OK).some(function (k) {
      if (r === k) { s.cat = k; r = ''; return true; }
      if (r.slice(-(k.length + 1)) === '-' + k) { s.cat = k; r = r.slice(0, -(k.length + 1)); return true; }
      return false;
    });
    if (r && r !== 'all') { if (!ORIG[r]) return null; s.country = r; }
    return s;
  }
  function dirHash(s) { return 'companies' + (s.country ? '-' + s.country : '') + (s.cat ? '-' + s.cat : ''); }
  function matches(c, s, skip) {
    if (skip !== 'country' && s.country && INFO[c.id].slug !== s.country) return false;
    if (skip !== 'cat' && s.cat && c.cat !== s.cat) return false;
    if (s.q) {
      var hay = INFO[c.id].hay, words = norm(s.q).split(' ').filter(Boolean);
      for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) < 0) return false;
    }
    return true;
  }
  function filtered(s, skip) { return COS.filter(function (c) { return matches(c, s, skip); }); }

  /* ======================================================================
     Directory components
     ====================================================================== */
  /** number of columns for n cards when at most m fit: rows stay full or the last row is nearly full (§4.7) */
  function bestCols(n, m) {
    if (n <= m) return Math.max(n, 1);
    var best = m, bestEmpty = (m - n % m) % m;
    for (var c = m - 1; c >= 2; c--) { var e = (c - n % c) % c; if (e < bestEmpty) { best = c; bestEmpty = e; } }
    return best;
  }
  /** the directory card: logo zone with the page stamp, names, place, about line, product pictures + count */
  function card(c, o) {
    o = o || {};
    var og = AAT.origin(c), prods = c.products || [], pics = shippedProducts(c).slice(0, 2);
    var logo = c.logo && AAT.src(c.logo) ? AAT.img(c.logo, { alt: c.company, w: 200, h: 80 }) : '<span class="co-type" dir="ltr">' + esc(shortName(c)) + '</span>';
    var names = AAT.lang === 'ar' && c.nameAr ? '<b class="co-n-ar">' + esc(c.nameAr) + '</b>' + AAT.ltb(c.company, 'span', 'co-n-lt clamp2') : AAT.ltb(c.company, 'b', 'co-n-one clamp2');
    var about = AAT.L(c.about);
    var foot = '<span class="co-foot">' + (pics.length ? '<span class="co-pics">' + pics.map(function (p) { return '<span class="co-pic">' + AAT.img(p.img, { alt: '', w: 72, h: 66 }) + '</span>'; }).join('') + '</span>' : '') +
      (prods.length ? '<span class="co-np">' + esc(AAT.count(prods.length, 'product')) + '</span>' : '') + '<span class="co-stamp">' + ui.folio(c.pages) + '</span></span>';
    return '<a class="co-card" href="#company-' + c.id + '"><span class="co-logo">' + logo + '</span><span class="co-body">' + names +
      '<span class="co-city">' + (og.cc ? ui.flag(og.cc, 27, 18) : '') + '<span>' + esc(og.text) + '</span></span>' +
      (o.tag ? '<span class="co-tagrow">' + ui.tag(catName(c.cat)) + '</span>' : '') +
      (about ? block(about, 'span', 'co-about clamp2') : '') + foot + '</span></a>';
  }
  function cardGrid(list, o) {
    var n = list.length;
    return '<div class="co-grid w' + bestCols(n, 4) + ' l' + bestCols(n, 3) + ' t' + bestCols(n, 2) + '">' + list.map(function (c) { return card(c, o); }).join('') + '</div>';
  }
  function countMeta(list) {
    var p = productsOf(list);
    return AAT.count(list.length, 'advertiser') + (p ? ' · ' + AAT.count(p, 'product') : '');
  }
  /** the sticky filter deck: country chips (with flags) and field chips, counts follow the other filter + the search */
  function deckInner() {
    var nAllC = filtered(st, 'country').length, nAllF = filtered(st, 'cat').length;
    var cItems = [{ label: AAT.t('app.all_countries'), n: nAllC, sel: !st.country, act: 'co-f', attrs: { 'data-k': 'country', 'data-v': '' } }].concat(ORDER_C.map(function (slug) {
      var n = filtered({ country: slug, cat: st.cat, q: st.q }).length, sel = st.country === slug;
      return { label: countryName(slug), n: n, sel: sel, flag: ORIG[slug].cc, act: 'co-f', disabled: !n && !sel, attrs: { 'data-k': 'country', 'data-v': slug } };
    }));
    var fItems = [{ label: t('all_fields'), n: nAllF, sel: !st.cat, act: 'co-f', attrs: { 'data-k': 'cat', 'data-v': '' } }].concat(FIELDS.map(function (f) {
      var n = filtered({ country: st.country, cat: f.key, q: st.q }).length, sel = st.cat === f.key;
      return { label: catName(f.key), n: n, sel: sel, act: 'co-f', disabled: !n && !sel, attrs: { 'data-k': 'cat', 'data-v': f.key } };
    }));
    return '<div class="co-frow"><span class="co-flab" aria-hidden="true">' + esc(t('country')) + '</span>' + ui.chips(cItems, { cls: 'co-chips', label: t('country') }) + '</div>' +
      '<div class="co-frow"><span class="co-flab" aria-hidden="true">' + esc(t('field')) + '</span>' + ui.chips(fItems, { cls: 'co-chips', label: t('field') }) + '</div>';
  }
  /** the result bands: one per field when nothing is chosen, else one band for the choice (always starting on floor) */
  function bands() {
    var bandOf = function (i) { return i % 2 ? 'paper' : 'floor'; };
    if (!st.country && !st.cat && !st.q) {
      return FIELDS.map(function (f, i) {
        var list = COS.filter(function (c) { return c.cat === f.key; });
        return ui.section({ id: 'co-f-' + f.key, band: bandOf(i), title: catName(f.key), meta: countMeta(list), body: cardGrid(list), cls: 'co-band' });
      }).join('');
    }
    var list = filtered(st), parts = [];
    if (st.cat) parts.push(catName(st.cat));
    if (st.country) parts.push(st.cat ? countryName(st.country) : t('from_c', { c: countryName(st.country) }));
    if (st.q) parts.push(t('results', { q: st.q }));
    return ui.section({
      id: 'co-res', band: 'floor', title: parts.join(' · '), meta: list.length ? countMeta(list) : '', cls: 'co-band',
      action: { label: AAT.t('v_back'), act: 'co-clear', icon: 'grid' },
      body: list.length ? cardGrid(list, { tag: !st.cat }) : ui.empty({ act: 'co-clear' })
    });
  }
  /** the board picture: the first six real logos on white tiles, slightly overlapping (§4.4) */
  function logoFan() {
    var six = COS.filter(function (c) { return c.logo && AAT.src(c.logo); }).slice(0, 6);
    if (!six.length) return '';
    return '<div class="co-fan">' + six.map(function (c) {
      return '<a class="co-fan-t" href="#company-' + c.id + '" aria-label="' + esc(primaryName(c)) + '">' + AAT.img(c.logo, { alt: c.company, w: 200, h: 80, eager: true }) + '</a>';
    }).join('') + '</div>';
  }
  /** the closing navy band: a printed ad becomes an online page (the advertiser of the first shipped ad page as the example) */
  function adBand() {
    var A = D.advertise || {}, dg = A.digital || {};
    var ex = COS.filter(function (c) { return c.logo && AAT.src(c.logo) && (c.products || []).length && AAT.pageImg(c.pages[0]); })[0];
    var vis = ex ? '<div class="co-adv-vis">' + ui.frame({ src: AAT.pageImg(ex.pages[0]), alt: AAT.t('app.page_stamp', { n: ex.pages[0] }), w: 1100, h: 1555, href: '#flip-' + ex.pages[0], cls: 'co-adv-page' }) +
      '<span class="co-adv-arrow">' + AAT.icon('arrow', 40) + '</span><div class="co-adv-card">' + ui.logoCell(ex, { products: true }) + '</div></div>' : '';
    return ui.section({
      id: 'co-adv', band: 'night', title: AAT.L(dg.title), cls: 'co-advband',
      action: { label: AAT.t('adv_btn'), href: '#advertise', kind: 'red' },
      body: '<div class="co-adv"><div class="co-adv-text"><p class="lead">' + AAT.Lh(dg.text) + '</p><p class="co-adv-lead">' + AAT.Lh(A.lead) + '</p></div>' + vis + '</div>'
    });
  }
  function directory(ctx) {
    var S = AAT.stats;
    var board = ui.openingBoard({
      h1: AAT.t('app.nav_companies'), lead: AAT.t('ed_lead'), cls: 'co-ob',
      figure: { n: AAT.num(S.companies), label: AAT.count(S.companies, 'advertiser', true) + ' ' + t('in_issue', { n: M.number }) },
      search: { act: 'co-search', placeholder: AAT.o === AAT.lang ? t('search') : AAT.t('ed_search'), label: AAT.o === AAT.lang ? t('search') : AAT.t('ed_search'), value: st.q, cls: 'co-sbox' },
      picture: logoFan()
    });
    return board + '<div class="co-dir" id="co-dir"><div class="co-deck" id="co-deck"><div class="wrap co-deck-in">' + deckInner() + '</div></div>' +
      '<div class="co-mini" id="co-mini" aria-hidden="true"><div class="wrap co-mini-in">' + miniInner() + '</div></div>' + bands() + '</div>' + adBand();
  }
  /** the compact bar that stays under the menu while the results scroll (PC): the current choice + "change" */
  function miniInner() {
    var n = filtered(st).length;
    var part = function (lbl, v) { return '<span class="co-mini-p"><span>' + esc(lbl) + ':</span> <b>' + AAT.txt(v) + '</b></span>'; };
    return '<p class="co-mini-t">' + AAT.icon('grid', 24) + part(t('country'), st.country ? countryName(st.country) : AAT.t('app.all_countries')) +
      part(t('field'), st.cat ? catName(st.cat) : t('all_fields')) + (st.q ? part(AAT.t('app.search'), st.q) : '') +
      '<span class="co-mini-n">' + esc(AAT.count(n, 'advertiser')) + '</span></p><span class="btnrow">' +
      ui.button({ label: t('change'), kind: 'navy', size: 's', act: 'co-top', icon: 'search', attrs: { tabindex: '-1' } }) +
      (st.country || st.cat || st.q ? ui.button({ label: AAT.t('v_back'), kind: 'line', size: 's', act: 'co-clear', attrs: { tabindex: '-1' } }) : '') + '</span>';
  }
  /** show the compact bar only while the deck is above the window and results are still on screen */
  function miniWatch() {
    var deck = AAT.$('#co-deck'), dir = AAT.$('#co-dir'), mini = AAT.$('#co-mini');
    if (!deck || !dir || !mini) return;
    var top = AAT.$('.nav') ? AAT.$('.nav').getBoundingClientRect().bottom : 0;
    var show = window.innerWidth > 960 && deck.getBoundingClientRect().bottom < top && dir.getBoundingClientRect().bottom > top + 160;
    if (show) mini.style.top = Math.max(0, Math.round(top)) + 'px'; // under the menu bar (one or two rows)
    if (show !== mini.classList.contains('on')) {
      mini.classList.toggle('on', show); mini.setAttribute('aria-hidden', show ? 'false' : 'true');
      AAT.$$('button', mini).forEach(function (b) { if (show) b.removeAttribute('tabindex'); else b.setAttribute('tabindex', '-1'); });
    }
  }

  /** re-draw the deck and the result bands in place (filters, search) */
  function refresh(focusSel) {
    var dir = AAT.$('#co-dir'), deck = AAT.$('#co-deck .co-deck-in');
    if (!dir || !deck) return;
    deck.innerHTML = deckInner();
    var mini = AAT.$('#co-mini .co-mini-in'); if (mini) { mini.innerHTML = miniInner(); var on = AAT.$('#co-mini').classList.contains('on'); if (!on) AAT.$$('button', mini).forEach(function (b) { b.setAttribute('tabindex', '-1'); }); }
    AAT.$$('section.band', dir).forEach(function (s) { s.parentNode.removeChild(s); });
    dir.insertAdjacentHTML('beforeend', bands());
    if (focusSel) { var f = AAT.$(focusSel, deck); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    // keep the selected chips in view inside their scrolling rows
    AAT.$$('.chip.on', deck).forEach(function (ch) { var row = ch.parentNode; if (row.scrollWidth > row.clientWidth) { try { ch.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ } } });
  }
  /** when the deck is stuck (results scrolled), bring the top of the results back under it */
  function toResults(force) {
    var dir = AAT.$('#co-dir'), deck = AAT.$('#co-deck'); if (!dir || !deck) return;
    var nav = AAT.$('.nav'), mast = AAT.$('.mast');
    var bar = window.innerWidth > 960 ? (nav ? nav.getBoundingClientRect().height : 0) : (mast ? mast.getBoundingClientRect().height : 0);
    var y = deck.getBoundingClientRect().top + window.pageYOffset - bar;
    if (force || window.pageYOffset > y + deck.offsetHeight) { try { window.scrollTo({ top: Math.max(0, y), behavior: 'auto' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); } }
  }

  /* ---------- directory actions ---------- */
  AAT.acts['co-f'] = function (el) {
    var k = el.getAttribute('data-k'), v = el.getAttribute('data-v') || null;
    if (k === 'country') st.country = v; else st.cat = v;
    AAT.setHash(dirHash(st));
    refresh('[data-k="' + k + '"][data-v="' + (v || '') + '"]');
    toResults(false);
  };
  AAT.acts['co-clear'] = function () {
    st.country = null; st.cat = null; st.q = '';
    var inp = AAT.$('.co-sbox input'); if (inp) inp.value = '';
    AAT.setHash('companies');
    refresh();
    toResults(false);
  };
  AAT.acts['co-search'] = function (form) {
    var inp = form.elements.q || AAT.$('input', form);
    st.q = inp ? inp.value.trim() : '';
    refresh();
    toResults(true);
  };
  AAT.acts['co-top'] = function () {
    toResults(true);
    var f = AAT.$('#co-deck .chip.on') || AAT.$('#co-deck .chip'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    miniWatch();
  };
  AAT.acts['co-jump'] = function (el) {
    var tg = document.getElementById(el.getAttribute('data-to')); if (!tg) return;
    // the sticky bar may be the PC menu (one or two rows) or the phone logo row: scroll below whichever is there
    var nav = AAT.$('.nav'), mast = AAT.$('.mast'), bar = window.innerWidth > 960 ? (nav ? nav.offsetHeight : 0) : (mast ? mast.offsetHeight : 0);
    var y = tg.getBoundingClientRect().top + window.pageYOffset - bar;
    try { window.scrollTo({ top: Math.max(0, y), behavior: 'auto' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); }
    var h = AAT.$('h2', tg); if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  };

  /* ======================================================================
     Company page (§6.6)
     ====================================================================== */
  function telHref(s) { var d = String(s).replace(/\(.*?\)/g, '').trim(); var plus = /^\s*\+/.test(d) || /^00/.test(d.replace(/\D/g, '')); var dig = d.replace(/\D/g, '').replace(/^00/, ''); return 'tel:' + (plus ? '+' : '') + dig; }
  function telText(s) { return String(s).replace(/\s*\((WhatsApp)\)\s*/i, '').trim(); }
  function domainOf(u) { return String(u || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, ''); }
  /** the board picture: first shipped product picture framed (else the first shipped magazine page), with the logo board over its corner */
  function boardPicture(c) {
    var p = shippedProducts(c)[0], page = c.pages.filter(function (n) { return AAT.pageImg(n); })[0];
    var main = '';
    if (p) main = ui.frame({ src: p.img, alt: p.n, w: 496, h: 456, contain: true, eager: true, href: '#product-' + c.id + '-' + p.k, cap: p.n, sub: catName(c.cat), cls: 'co-bp-main' });
    else if (page) main = ui.frame({ src: AAT.pageImg(page), alt: AAT.t('app.page_stamp', { n: page }), w: 1100, h: 1555, eager: true, href: '#flip-' + page, cls: 'co-bp-main co-bp-page' });
    else if (AAT.src(M.cover)) main = '<a class="frame co-bp-main co-bp-page co-bp-cover" href="#magazine"><figure>' + AAT.img(M.cover, { alt: AAT.issueLine(), w: 617, h: 873, eager: true }) +
      '<span class="co-bp-stamp">' + ui.folio(c.pages, { tilt: true }) + '</span></figure></a>';
    var logo = c.logo && AAT.src(c.logo) ? AAT.img(c.logo, { alt: c.company, w: 240, h: 96, eager: true }) : '<span class="co-type co-type-l" dir="ltr">' + esc(shortName(c)) + '</span>';
    return '<div class="co-bp' + (main ? '' : ' co-bp-solo') + (main && !p ? ' co-bp-pg' : '') + '">' + main + '<div class="co-lb">' + logo + '</div></div>';
  }
  function figLabel(c) {
    var n = c.pages.length;
    if (AAT.lang === 'ar') return t(n === 1 ? 'p1' : n === 2 ? 'p2' : 'pn', { n: M.number });
    return t(n === 1 ? 'p1' : 'pn', { n: M.number });
  }
  function figNumber(c) {
    var p = c.pages, run = p.every(function (x, i) { return !i || x === p[i - 1] + 1; });
    return p.length > 1 && !run ? p.join(' · ') : AAT.pagesLabel(p);
  }
  /** the contact card (§6.6): phones with copy buttons, WhatsApp, e-mail (copy), website, address; only known facts */
  function contactCard(c) {
    var blocks = [];
    var tels = (c.tels && c.tels.length ? c.tels : (c.tel ? String(c.tel).split(' / ') : [])).map(telText).filter(Boolean);
    if (tels.length) {
      blocks.push('<div class="co-ci"><span class="co-cl">' + esc(AAT.t('contact_phone')) + '</span>' + tels.map(function (s) {
        var id = AAT.uid('cot');
        return '<div class="co-tel"><a class="co-tel-n" id="' + id + '" href="' + esc(telHref(s)) + '"><bdi dir="ltr">' + esc(s) + '</bdi></a>' +
          ui.button({ label: AAT.t('app.copy'), kind: 'line', size: 's', act: 'copy', icon: 'copy', attrs: { 'data-copy': s, 'data-target': id, 'data-ok': AAT.t('app.num_copied') } }) + '</div>';
      }).join('') + '</div>');
    }
    if (c.whatsapp) blocks.push('<div class="co-ci">' + ui.button({ label: t('wa'), href: waHref(c.whatsapp), newTab: true, icon: 'chat', block: true }) + '</div>');
    if (c.email) blocks.push('<div class="co-ci"><span class="co-cl">' + esc(AAT.t('contact_email')) + '</span><div class="cf co-mailrow">' + ui.mail(c.email, { copy: true }) + '</div></div>');
    if (c.web) blocks.push('<div class="co-ci"><span class="co-cl">' + esc(t('web')) + '</span><a class="weblink co-web" href="' + esc(c.web) + '" target="_blank" rel="noopener">' + AAT.icon('ext', 22) + '<bdi dir="ltr">' + esc(domainOf(c.web)) + '</bdi></a></div>');
    if (c.address) blocks.push('<div class="co-ci"><span class="co-cl">' + esc(AAT.t('contact_address')) + '</span>' +
      (AAT.isAr(c.address) ? '<p class="addr co-addr">' + AAT.icon('pin', 22) + '<span>' + esc(c.address) + '</span></p>' : '<p class="addr co-addr" dir="ltr">' + AAT.icon('pin', 22) + '<span>' + esc(c.address) + '</span></p>') + '</div>');
    blocks.push('<div class="co-ci co-ask">' + ui.button({ label: t('ask'), kind: 'line', href: waHref(D.config.whatsapp, t('ask_msg', { c: c.company })), newTab: true, icon: 'chat', block: true }) + '</div>');
    return '<aside class="co-cc" aria-labelledby="co-cc-h"><h3 id="co-cc-h" class="h3">' + esc(AAT.t('v_contact')) + '</h3>' + blocks.join('') + '</aside>';
  }
  /** site content worth showing: about/products/application sections without contact lines; hidden when it belongs to another company */
  function siteOf(c) {
    var S = c.site; if (!S) return null;
    var txt = JSON.stringify(S).toLowerCase(), toks = [];
    if (c.web) toks.push(domainOf(c.web).split('.')[0].toLowerCase());
    if (c.email && !/gmail|hinet|yahoo|hotmail/i.test(c.email)) toks.push(String(c.email.split('@')[1] || '').split('.')[0].toLowerCase());
    (c.company.toLowerCase().match(/[a-z]{3,}/g) || []).slice(0, 2).forEach(function (w) { if (!/^(co|ltd|corp|the|and|company|industry|industrial|international|group|for|limited)$/.test(w)) toks.push(w); });
    var hit = toks.some(function (w) { return w && txt.indexOf(w) >= 0; });
    var foreign = (txt.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).length > 0;
    if (!hit && foreign) return null; // e.g. a mini-site that describes another company: never shown
    var CONTACT = /@|^(tel|fax|mobile|phone|e-?mail|address|vat)\b|\bno\.\s*\d|\b(rd|road|st|street|dist)\.?,/i;
    var secs = (S.sections || []).filter(function (s) { return (s.kind === 'about' || s.kind === 'products' || (s.kind === 'solutions' && /applic|solution|equipment/i.test(s.name))); })
      .map(function (s) { return { name: s.name, items: (s.items || []).filter(function (x) { return x && !CONTACT.test(x); }) }; })
      .filter(function (s) { return s.items.length >= 2; });
    if (secs.reduce(function (n, s) { return n + s.items.length; }, 0) < 5) secs = []; // too little to make a band
    return { headline: S.headline || '', slogans: (S.slogans || []).filter(Boolean), secs: secs };
  }
  function prodRow(c, p) {
    var d = p.d ? AAT.L(p.d) : '';
    return '<a class="row co-prow" href="#product-' + c.id + '-' + p.k + '"><span class="co-prow-t">' + AAT.ltb(p.n, 'b', 'co-prow-n') + (d ? block(d, 'span', 'co-prow-d clamp2') : '') + '</span>' +
      (p.src === 'ad' ? ui.folio(c.pages[0]) : '') + '</a>';
  }
  function productsBody(c) {
    var prods = c.products || [], pics = shippedProducts(c);
    var cards = pics.map(function (p) { return ui.productCell(c, p); }).join('');
    var rest = prods.filter(function (p) { return pics.indexOf(p) < 0; });
    var rows = (rest.length ? rest : prods).map(function (p) { return prodRow(c, p); }).join('');
    return '<div class="co-prods' + (pics.length ? ' co-k' + Math.min(pics.length, 2) : '') + '">' + (cards ? '<div class="co-pcards">' + cards + '</div>' : '') + '<div class="rows co-prows">' + rows + '</div></div>';
  }
  function magazineBody(c, night) {
    var shipped = c.pages.filter(function (n) { return AAT.pageImg(n); });
    var pics = shipped.length ? '<div class="co-mpages co-mp' + Math.min(shipped.length, 2) + '">' + shipped.slice(0, 2).map(function (n) {
      return '<a class="co-mpage" href="#flip-' + n + '">' + AAT.img(AAT.pageImg(n), { alt: AAT.t('app.page_stamp', { n: n }), w: 1100, h: 1555 }) + '<span class="co-mpage-n">' + ui.folioText(n) + '</span></a>';
    }).join('') + '</div>' : '<div class="co-mpages co-mcover"><span class="co-mcover-in">' + AAT.img(M.cover, { alt: AAT.issueLine(), w: 617, h: 873 }) + ui.folio(c.pages, { tilt: true }) + '</span></div>';
    var iss = '<div class="co-iss">' + (shipped.length ? '<span class="co-iss-c">' + AAT.img(M.cover, { alt: AAT.issueLine(), w: 617, h: 873 }) + '</span>' : '') +
      '<span class="co-iss-t"><b>' + AAT.Lh(M.name) + '</b><span>' + AAT.txt(AAT.issueLine() + ' · ' + AAT.t('app.pages_n', { n: M.pages })) + '</span></span></div>';
    var rows = c.pages.map(function (n) {
      var on = AAT.pageImg(n);
      return '<a class="row co-mrow" href="' + (on ? '#flip-' + n : '#magazine') + '">' + ui.folio(n) + '<span class="row-t">' + esc(t('pg_row', { n: n, t: M.pages })) + '</span><span class="co-mrow-go">' +
        esc(on ? AAT.t('ar_in_mag') : t('toc')) + '</span></a>';
    }).join('');
    var second = night ? 'ghost' : 'line';
    var btns = '<div class="btnrow">' + (shipped.length ?
      ui.button({ label: AAT.t('ar_in_mag'), href: '#flip-' + shipped[0], icon: 'book' }) + ui.button({ html: txt(t('pdf_full')), href: M.pdf, kind: second, newTab: true, icon: 'pdf' }) :
      ui.button({ html: txt(t('pdf_full')), href: M.pdf, newTab: true, icon: 'pdf' }) + ui.button({ label: AAT.t('mb_read', { n: M.number }), href: '#flip-1', kind: second, icon: 'book' })) + '</div>';
    return '<div class="co-mag">' + pics + '<div class="co-mag-text"><p class="lead">' + AAT.txt(t('mag_lead', { i: AAT.issueLine() })) + '</p>' + iss + '<div class="rows co-mrows">' + rows + '</div>' + btns + '</div></div>';
  }
  function siteBody(s) {
    var n = s.secs.length, cols = n <= 3 ? n : (n === 4 ? 2 : 3);
    return '<div class="co-scards co-sc' + cols + '">' + s.secs.map(function (x) {
      return '<article class="co-scard" dir="ltr"><h3 class="h3">' + esc(x.name) + '</h3><ul>' + x.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></article>';
    }).join('') + '</div>';
  }
  function morePicks(c) {
    var out = [], seen = {}; seen[c.id] = 1;
    var add = function (x) { if (!seen[x.id] && out.length < 7) { seen[x.id] = 1; out.push(x); } };
    COS.filter(function (x) { return x.cat === c.cat; }).forEach(add);
    COS.filter(function (x) { return INFO[x.id].slug === INFO[c.id].slug; }).forEach(add);
    var i = COS.indexOf(c);
    for (var d = 1; out.length < 7 && d < COS.length; d++) { if (COS[i + d]) add(COS[i + d]); if (COS[i - d]) add(COS[i - d]); }
    return out;
  }
  /** colours for the light bands so neighbours differ and the last band is not floor (the contact band is floor) */
  function colourBands(list) {
    var col = function () { list.forEach(function (b, i) { b.band = i % 2 ? 'floor' : 'paper'; }); };
    col();
    if (list.length && list[list.length - 1].band === 'floor') {
      var mi = -1; list.forEach(function (b, i) { if (b.navyOk) mi = i; });
      if (mi >= 0) {
        list.forEach(function (b, i) { if (i < mi) b.band = i % 2 ? 'floor' : 'paper'; });
        list[mi].band = 'night';
        var r = list.length - mi - 1;
        for (var k = 1; k <= r; k++) list[mi + k].band = (r - k) % 2 ? 'floor' : 'paper';
      }
    }
    return list;
  }
  function companyPage(c) {
    var og = AAT.origin(c), cat = AAT.cat(c.cat), S = siteOf(c);
    var h1 = AAT.lang === 'ar' && c.nameAr ? '<span class="co-h1a">' + esc(c.nameAr) + '</span>' + AAT.ltb(c.company, 'span', 'co-h1b') :
      (AAT.rtl ? AAT.ltb(c.company, 'span', 'co-h1a') : '<span class="co-h1a">' + esc(c.company) + '</span>') + (!AAT.rtl && c.nameAr ? AAT.rtlb(c.nameAr, 'span', 'co-h1b') : '');
    var meta = '<span class="co-om">' + (og.cc ? ui.flag(og.cc, 36, 24) : '') + '<span>' + esc(og.text) + '</span></span>' + (cat ? '<span class="co-om-f">' + esc(AAT.L(cat)) + '</span>' : '');
    var page = c.pages.filter(function (n) { return AAT.pageImg(n); })[0];
    var acts = ui.button({ label: AAT.t('v_contact'), act: 'co-jump', icon: 'phone', attrs: { 'data-to': 'co-about' } }) +
      (page ? ui.button({ label: AAT.t('ar_in_mag'), href: '#flip-' + page, kind: 'ghost', icon: 'book' }) :
        (c.products && c.products.length ? ui.button({ label: t('prods_t'), act: 'co-jump', kind: 'ghost', icon: 'box', attrs: { 'data-to': 'co-prods' } }) : ''));
    var board = ui.openingBoard({
      h1Html: h1, h1Attrs: { class: 'co-h1' + (c.company.length > 42 && !(AAT.lang === 'ar' && c.nameAr) ? ' co-h1-long' : '') }, meta: meta, cls: 'co-ob co-ob-c',
      figure: { n: figNumber(c), label: figLabel(c) }, actions: acts, picture: boardPicture(c)
    });
    // band 1: about + facts | contact card
    var about = AAT.L(c.about);
    var certs = c.certs ? String(c.certs).split(/\s*·\s*/).filter(Boolean).map(function (x) { return ui.tag(x); }).join(' ') : '';
    var facts = ui.facts([
      { k: AAT.t('app.cols_field'), v: cat ? '<a class="co-flink" href="#companies-' + esc(c.cat) + '">' + esc(AAT.L(cat)) + '</a>' : '' },
      { k: AAT.t('app.cols_place'), v: '<span class="co-fplace">' + (og.cc ? ui.flag(og.cc, 30, 20) : '') + '<span>' + esc(og.text) + '</span></span>' },
      { k: AAT.t('v_certs'), v: certs ? '<span class="co-certs">' + certs + '</span>' : '' },
      { k: AAT.t('pd_mag'), v: ui.folio(c.pages) + ' <span class="co-fiss">' + AAT.txt(AAT.issueLine()) + '</span>' },
      { k: AAT.t('sl_products'), v: c.products && c.products.length ? '<a class="co-flink" href="#product-' + c.id + '-' + c.products[0].k + '" data-act="co-jump" data-to="co-prods">' + esc(AAT.count(c.products.length, 'product')) + '</a>' : '' }
    ]);
    var quote = S && (S.headline || S.slogans.length) ? '<figure class="co-quote"><figcaption>' + esc(t('from_site')) + (AAT.rtl ? ' · ' + esc(t('in_en')) : '') + '</figcaption>' +
      (S.headline ? AAT.ltb(S.headline, 'blockquote', 'co-quote-t') : '') + (S.slogans.length ? '<ul class="co-slogans" dir="ltr">' + S.slogans.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</figure>' : '';
    var list = [];
    list.push({ id: 'co-about', title: AAT.t('v_about'), body: '<div class="co-ab"><div class="co-ab-main">' + (about ? block(about, 'p', 'co-ab-lead') : '') + facts + quote + '</div>' + contactCard(c) + '</div>' });
    if (c.products && c.products.length) list.push({ id: 'co-prods', title: t('prods_t'), meta: AAT.count(c.products.length, 'product'), body: productsBody(c) });
    list.push({ id: 'co-mag', title: AAT.t('pd_mag'), body: function (night) { return magazineBody(c, night); }, navyOk: true });
    if (S && S.secs.length) list.push({ id: 'co-site', title: t('from_site'), metaHtml: (AAT.rtl ? esc(t('in_en')) + ' · ' : '') + (c.web ? AAT.lt(domainOf(c.web)) : ''), body: siteBody(S) });
    var picks = morePicks(c), sameField = picks.filter(function (x) { return x.cat === c.cat; }).length;
    list.push({ id: 'co-more', title: t('more_t'), meta: sameField && cat ? AAT.count(sameField, 'advertiser') + ' ' + t('in_field', { f: AAT.L(cat) }) : '',
      action: { label: AAT.t('app.nav_companies'), href: '#companies' + (sameField ? '-' + c.cat : ''), icon: 'grid' },
      body: '<div class="co-more">' + picks.map(function (x) { return ui.logoCell(x, { products: true }); }).join('') + '</div>' });
    colourBands(list);
    return board + list.map(function (b) {
      return ui.section({ id: b.id, band: b.band, title: b.title, meta: b.meta, metaHtml: b.metaHtml, action: b.action, body: typeof b.body === 'function' ? b.body(b.band === 'night') : b.body, cls: 'co-band co-' + b.band });
    }).join('');
  }

  /* ======================================================================
     Module
     ====================================================================== */
  AAT.pages.companies = {
    render: function (ctx) {
      if (ctx.head === 'company') {
        var c = ctx.id != null ? AAT.company(ctx.id) : null;
        return c ? companyPage(c) : null; // unknown company → 404
      }
      var s = parseDir(ctx.rest); if (!s) return null;
      st = { country: s.country, cat: s.cat, q: '' };
      return directory(ctx);
    },
    /** filters change in place through AAT.setHash; any other hash change (menu, back, links) renders the page again */
    update: function (ctx, view) {
      if (ctx.head !== 'companies' || !AAT.$('#co-dir', view)) return false;
      var s = parseDir(ctx.rest);
      return !!s && s.country === st.country && s.cat === st.cat;
    },
    mount: function (ctx, view) {
      var inp = AAT.$('.co-sbox input', view); if (!inp) return;
      var run = AAT.debounce(function () { var q = inp.value.trim(); if (q === st.q) return; st.q = q; refresh(); }, 150);
      var raf = 0, watch = function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; miniWatch(); }); };
      inp.addEventListener('input', run);
      window.addEventListener('scroll', watch, { passive: true });
      window.addEventListener('resize', watch);
      bound = { inp: inp, run: run, watch: watch };
    },
    unmount: function () {
      if (!bound) return;
      bound.inp.removeEventListener('input', bound.run);
      window.removeEventListener('scroll', bound.watch); window.removeEventListener('resize', bound.watch);
      bound = null;
    },
    title: function (ctx) {
      if (ctx.head === 'company') { var c = AAT.company(ctx.id); return c ? primaryName(c) : ''; }
      return AAT.t('app.nav_companies');
    }
  };
}());
