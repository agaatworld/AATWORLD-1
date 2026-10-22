/* =============================================================================
   AAT World v3 · "Trade Bridge" · js/app.js — THE SHARED CORE
   SHARED FILE, owned by the architect. Page builders: READ ONLY (CONTRACT.md).

   Plain ES2017, no modules, no build step. One global: window.AAT.
   Load order (shell.html → page.html): data/data.js, js/app.js, js/pages/*.js,
   js/boot.js. Page modules register into AAT.pages / AAT.strings / AAT.acts
   while loading; js/boot.js calls AAT.boot() last.

   What lives here
     AAT.data                 the content (data/data.json, via data/data.js)
     language                 AAT.lang · AAT.o · AAT.rtl · AAT.setLang(code)
     text                     AAT.t(key, vars) · AAT.L(v) · AAT.Lh(v) · AAT.esc(s)
                              AAT.lt(s) · AAT.ltb(s) · AAT.arx(s) · AAT.rtlb(s) · AAT.txt(s)
     numbers and dates        AAT.num · AAT.count · AAT.fmtDate · AAT.fmtRange · AAT.fmtMonth
                              AAT.monthName · AAT.pagesLabel
     pictures                 AAT.img(path, opts) · AAT.src(path) · AAT.pageImg(n) · AAT.thumb(n)
     data lookups             AAT.company · AAT.product · AAT.show · AAT.article · AAT.newsItem
                              AAT.modernItem · AAT.country · AAT.field · AAT.cat · AAT.origin
                              AAT.LINE · AAT.stats
     router                   AAT.go(hash) · AAT.setHash(hash) · AAT.route (current ctx)
     events                   AAT.acts[name] = fn(el, ev, ctx)  (one delegated click + submit handler)
     UI components            AAT.ui.*  (each returns an HTML string)
     helpers                  AAT.toast · AAT.copy · AAT.openAssistant · AAT.icon · AAT.$ · AAT.$$
                              AAT.debounce · AAT.uid
   Every function is documented where it is defined.
============================================================================= */
(function () {
  'use strict';
  var W = window;
  var AAT = W.AAT = W.AAT || {};
  AAT.pages = AAT.pages || {};      // page modules: AAT.pages.<name> = { render, mount, unmount, update, title, chrome, contactBand, init }
  AAT.strings = AAT.strings || {};  // UI strings per module: AAT.strings.<name> = { ar:{}, en:{} }
  AAT.acts = AAT.acts || {};        // delegated actions: AAT.acts['<prefix>-<verb>'] = function (el, ev, ctx) {}
  AAT.ui = AAT.ui || {};
  var D = AAT.data = W.AAT_DATA_V3 || {};
  var FILES = null;                 // set of shipped picture paths (written by tools/build.js)
  if (W.AAT_FILES) { FILES = {}; W.AAT_FILES.forEach(function (f) { FILES[f] = 1; }); }

  /* ======================================================================
     Small DOM and function helpers
     ====================================================================== */
  /** AAT.$(sel, root?) → first match; AAT.$$(sel, root?) → array of matches */
  AAT.$ = function (sel, root) { return (root || document).querySelector(sel); };
  AAT.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  /** AAT.debounce(fn, ms) → a function that runs fn once, ms after the last call */
  AAT.debounce = function (fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; };
  var uidN = 0;
  /** AAT.uid(prefix) → a page-unique id, e.g. "u12" */
  AAT.uid = function (p) { uidN += 1; return (p || 'u') + uidN; };

  /* ======================================================================
     Escaping and direction isolation (DESIGN.md §7)
     ====================================================================== */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  /** AAT.esc(s) → HTML-escaped text. Use for EVERY data string put into HTML (text and attributes). */
  AAT.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };
  /** AAT.lt(s) → inline LTR isolate: <bdi dir="ltr" class="lt">s</bdi> (names, phones, e-mails, ranges inside Arabic). */
  AAT.lt = function (s) { return s == null || s === '' ? '' : '<bdi dir="ltr" class="lt">' + AAT.esc(s) + '</bdi>'; };
  /** AAT.ltb(s, tag?, cls?) → LTR block (for Latin names that wrap or clamp): <span dir="ltr" class="ltb cls">s</span> */
  AAT.ltb = function (s, tag, cls) { tag = tag || 'span'; return '<' + tag + ' dir="ltr" class="ltb' + (cls ? ' ' + cls : '') + '">' + AAT.esc(s) + '</' + tag + '>'; };
  /** AAT.rtlb(s, tag?, cls?) → Arabic block inside an LTR page: <span dir="rtl" lang="ar" class="rtb cls">s</span> */
  AAT.rtlb = function (s, tag, cls) { tag = tag || 'span'; return '<' + tag + ' dir="rtl" lang="ar" class="rtb' + (cls ? ' ' + cls : '') + '">' + AAT.esc(s) + '</' + tag + '>'; };
  // Latin runs (keeping their parentheses), e-mails, URLs, and number ranges such as "11–13"
  var LATIN_RUN = /\([A-Za-z0-9][A-Za-z0-9.&'’\-\/ ×@:_+%]*\)|[A-Za-z][A-Za-z0-9.&'’\-\/ ×@:_+%]*[A-Za-z0-9)]|[A-Za-z]|\d[\d,.]*\s*[–—-]\s*\d[\d,.]*/g;
  /**
   * AAT.arx(s) → escaped text with every Latin run / number range wrapped in <bdi dir="ltr" class="lt">.
   * Use for Arabic sentences that contain Latin words: "مزايا AAT Tube", "(TiTE)", "info@aatworld.com".
   */
  AAT.arx = function (raw) {
    raw = String(raw == null ? '' : raw);
    var out = '', last = 0, m;
    LATIN_RUN.lastIndex = 0;
    while ((m = LATIN_RUN.exec(raw))) {
      out += AAT.esc(raw.slice(last, m.index)) + '<bdi dir="ltr" class="lt">' + AAT.esc(m[0]) + '</bdi>';
      last = m.index + m[0].length;
    }
    return out + AAT.esc(raw.slice(last));
  };
  var HAS_AR = /[؀-ۿ]/, HAS_LAT = /[A-Za-z]/;
  /**
   * AAT.txt(s) → escaped text that is safe in the current page direction:
   *  RTL page → AAT.arx(s) (Latin runs isolated);
   *  LTR page + Arabic text → <bdi dir="rtl" lang="ar">;  otherwise plain escaped text.
   */
  AAT.txt = function (s) {
    if (s == null || s === '') return '';
    s = String(s);
    if (AAT.rtl) return HAS_LAT.test(s) || /\d\s*[–—-]\s*\d/.test(s) ? AAT.arx(s) : AAT.esc(s);
    if (HAS_AR.test(s)) return '<bdi dir="rtl" lang="ar">' + AAT.esc(s) + '</bdi>';
    return AAT.esc(s);
  };

  /* ======================================================================
     Language (DESIGN.md §7)
     ====================================================================== */
  var LANG_ORDER = ['ar', 'en', 'zh-TW', 'zh-CN', 'ms'];
  var LANGS = {};
  ((D.config && D.config.languages) || []).forEach(function (l) { LANGS[l.code] = l; });
  function validLang(c) { return !!(c && LANGS[c]); }
  function readLang() {
    var q = /[?&]lang=([A-Za-z-]+)/.exec(W.location ? W.location.search || '' : '');
    if (q && validLang(q[1])) return q[1];
    try { var s = W.localStorage.getItem('aat3.lang'); if (validLang(s)) return s; } catch (e) { /* storage blocked */ }
    return 'ar';
  }
  /** AAT.langs → [{code,name,short,dir}] in menu order: العربية · English · 繁體中文 · 简体中文 · Bahasa Melayu */
  AAT.langs = LANG_ORDER.filter(validLang).map(function (c) { return LANGS[c]; });
  function setLangVars(code) {
    AAT.lang = code;                               // 'ar' | 'en' | 'zh-TW' | 'zh-CN' | 'ms'
    AAT.rtl = code === 'ar';                       // page direction
    AAT.dir = AAT.rtl ? 'rtl' : 'ltr';
    AAT.o = AAT.rtl ? 'ar' : 'en';                 // the content key for ar/en-only fields ("ar" or "en")
  }
  setLangVars(validLang('ar') ? 'ar' : 'en');

  /* ======================================================================
     Strings: AAT.t (UI) and AAT.L (content)
     ====================================================================== */
  function fill(s, vars) {
    if (!vars) return s;
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  var warned = {};
  /**
   * AAT.t(key, vars?) → UI string in the current language with {placeholders} filled.
   *   "ns.key"  → AAT.strings[ns][lang][key]  (fallback: en, then ar)
   *   "key"     → data.json i18n[lang][key]   (fallback: en, then ar), then AAT.strings.app
   * Example: AAT.t('app.nav_home') → "الرئيسية";  AAT.t('mb_read', {n: 560}) → "اقرأ العدد 560"
   */
  AAT.t = function (key, vars) {
    var v, i = key.indexOf('.'), lang = AAT.lang;
    if (i > 0) {
      var S = AAT.strings[key.slice(0, i)], k = key.slice(i + 1);
      if (S) v = (S[lang] && S[lang][k] != null) ? S[lang][k] : (lang !== 'ar' && S.en && S.en[k] != null) ? S.en[k] : (S.ar && S.ar[k] != null ? S.ar[k] : (S.en && S.en[k]));
    } else {
      var I = D.i18n || {};
      v = (I[lang] && I[lang][key] != null && I[lang][key] !== '') ? I[lang][key] : (I.en && I.en[key]) || (I.ar && I.ar[key]);
      if (v == null) { var A = AAT.strings.app || {}; v = (A[lang] && A[lang][key]) || (A.en && A.en[key]) || (A.ar && A.ar[key]); }
    }
    if (v == null) { if (!warned[key]) { warned[key] = 1; if (W.console) console.warn('AAT.t: missing string', key); } return key; }
    return fill(v, vars);
  };
  /** AAT.tx(enString) → the zh-TW / zh-CN / ms translation of an English content string (data.tx), or null */
  AAT.tx = function (en) { var T = D.tx && D.tx[AAT.lang]; return (T && en && T[en]) || null; };
  /**
   * AAT.L(v) → content text in the visitor's language. v is {ar,en,(zh-TW,zh-CN,ms)} or a string.
   *   ar → v.ar, else v.en · en → v.en, else v.ar · zh/ms → v[lang], else tx(v.en), else v.en, else v.ar
   * Returns plain text (escape it, or use AAT.Lh for HTML with direction isolation).
   */
  AAT.L = function (v) {
    if (v == null) return '';
    if (typeof v === 'string') return AAT.lang === 'ar' || AAT.lang === 'en' ? v : (AAT.tx(v) || v);
    var l = AAT.lang;
    if (v[l]) return v[l];
    if (l === 'ar') return v.ar || v.en || '';
    if (l !== 'en' && v.en) return AAT.tx(v.en) || v.en;
    return v.en || v.ar || '';
  };
  /** AAT.Lh(v) → AAT.L(v) as HTML, direction-isolated with AAT.txt (Arabic fallback in English gets an RTL bdi). */
  AAT.Lh = function (v) { return AAT.txt(AAT.L(v)); };
  /** AAT.isAr(s) → true when s contains Arabic letters */
  AAT.isAr = function (s) { return HAS_AR.test(String(s || '')); };

  /* ======================================================================
     Numbers, counted nouns, dates (DESIGN.md §7, §8.3)
     ====================================================================== */
  /** AAT.num(1464) → "1,464" (Western digits, thousands comma) */
  AAT.num = function (n) { n = Number(n); return isFinite(n) ? n.toLocaleString('en-US') : ''; };
  /**
   * Counted nouns. AAT.nouns[key] = { ar:[one, few(3–10), many(11–99)], en:[one, other] }.
   * Arabic rule (§8.3): n mod 100 = 3–10 → plural; 11–99 → singular accusative; 0–2 → singular.
   * AAT.count(1464, 'show') → "1,464 معرضاً" / "1,464 shows".  AAT.count(n, key, true) → noun only.
   * Builders may add nouns: AAT.nouns.booth = {ar:[...], en:[...]} (from their own module).
   */
  AAT.nouns = {
    show: { ar: ['معرض', 'معارض', 'معرضاً'], en: ['show', 'shows'] },
    intl: { ar: ['معرض دولي', 'معارض دولية', 'معرضاً دولياً'], en: ['international exhibition', 'international exhibitions'] },
    company: { ar: ['شركة', 'شركات', 'شركة'], en: ['company', 'companies'] },
    advertiser: { ar: ['شركة معلنة', 'شركات معلنة', 'شركة معلنة'], en: ['advertiser', 'advertisers'] },
    product: { ar: ['منتج', 'منتجات', 'منتجاً'], en: ['product', 'products'] },
    member: { ar: ['عضو', 'أعضاء', 'عضواً'], en: ['member', 'members'] },
    article: { ar: ['مقال', 'مقالات', 'مقالاً'], en: ['article', 'articles'] },
    news: { ar: ['خبر', 'أخبار', 'خبراً'], en: ['news item', 'news items'] },
    page: { ar: ['صفحة', 'صفحات', 'صفحة'], en: ['page', 'pages'] },
    country: { ar: ['دولة', 'دول', 'دولة'], en: ['country', 'countries'] },
    year: { ar: ['عام', 'أعوام', 'عاماً'], en: ['year', 'years'] },
    issue: { ar: ['عدد', 'أعداد', 'عدداً'], en: ['issue', 'issues'] },
    field: { ar: ['مجال', 'مجالات', 'مجالاً'], en: ['field', 'fields'] },
    name: { ar: ['اسم', 'أسماء', 'اسماً'], en: ['name', 'names'] },
    language: { ar: ['لغة', 'لغات', 'لغة'], en: ['language', 'languages'] }
  };
  /** AAT.arForm(n, [one, few, many]) → the right Arabic form for n */
  AAT.arForm = function (n, f) { var r = Math.abs(n) % 100; if (r >= 3 && r <= 10) return f[1]; if (r >= 11) return f[2]; return f[0]; };
  AAT.count = function (n, key, nounOnly) {
    var N = AAT.nouns[key]; if (!N) return AAT.num(n);
    var w = AAT.lang === 'ar' ? AAT.arForm(n, N.ar) : (n === 1 ? N.en[0] : N.en[1]);
    return nounOnly ? w : AAT.num(n) + ' ' + w;
  };
  var MONTHS = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ms: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
  };
  function isZh() { return AAT.lang === 'zh-TW' || AAT.lang === 'zh-CN'; }
  /** AAT.monthName(m1to12) → "مارس" / "March" (zh: "3月") */
  AAT.monthName = function (m) { if (isZh()) return m + '月'; return (MONTHS[AAT.lang] || MONTHS.en)[m - 1]; };
  function ymd(s) { var p = String(s || '').split('-'); return { y: +p[0], m: +p[1] || 1, d: +p[2] || 1 }; }
  /** AAT.fmtMonth('2027-03' | '2027-03-02') → "مارس 2027" / "March 2027" (zh "2027年3月") */
  AAT.fmtMonth = function (s) { var a = ymd(s); return isZh() ? a.y + '年' + a.m + '月' : AAT.monthName(a.m) + ' ' + a.y; };
  /** AAT.fmtDate('2027-03-02') → "2 مارس 2027" / "2 March 2027" (zh "2027年3月2日"). Plain text. */
  AAT.fmtDate = function (s) { if (!s) return ''; var a = ymd(s); return isZh() ? a.y + '年' + a.m + '月' + a.d + '日' : a.d + ' ' + AAT.monthName(a.m) + ' ' + a.y; };
  /**
   * AAT.fmtRange(start, end, approx?) → HTML (number ranges LTR-isolated so they never flip in RTL):
   *   approx (month only)       → "مارس 2027"
   *   same day                  → "2 مارس 2027"
   *   same month                → "<bdi dir=ltr>2–7</bdi> مارس 2027"
   *   across months / years     → "28 فبراير – 2 مارس 2027" / "30 December 2027 – 2 January 2028"
   */
  AAT.fmtRange = function (start, end, approx) {
    if (!start) return '';
    var a = ymd(start), b = ymd(end || start);
    if (approx) return AAT.esc(AAT.fmtMonth(start));
    if (isZh()) return AAT.esc(AAT.fmtDate(start) + (end && end !== start ? ' – ' + AAT.fmtDate(end) : ''));
    if (a.y === b.y && a.m === b.m) {
      if (a.d === b.d) return AAT.esc(AAT.fmtDate(start));
      return '<bdi dir="ltr" class="lt">' + a.d + '–' + b.d + '</bdi> ' + AAT.esc(AAT.monthName(a.m) + ' ' + a.y);
    }
    var left = a.d + ' ' + AAT.monthName(a.m) + (a.y !== b.y ? ' ' + a.y : '');
    return AAT.esc(left + ' – ' + AAT.fmtDate(end));
  };
  /** AAT.fmtRangeText(start, end, approx?) → the same as plain text (for title/aria attributes) */
  AAT.fmtRangeText = function (s, e, ap) { return AAT.fmtRange(s, e, ap).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'); };
  /** AAT.pagesLabel([18,19]) → "18–19" (contiguous run), [2,11] → "2" (first page) */
  AAT.pagesLabel = function (p) {
    if (!p || !p.length) return '';
    var run = p.every(function (x, i) { return !i || x === p[i - 1] + 1; });
    return p.length > 1 && run ? p[0] + '–' + p[p.length - 1] : String(p[0]);
  };

  /* ======================================================================
     Pictures (prototype policy: only shipped files under img/)
     ====================================================================== */
  /** AAT.src(path) → path when the file is shipped (img/…), else '' */
  AAT.src = function (p) { if (!p) return ''; if (FILES && !FILES[p]) return ''; return p; };
  /**
   * AAT.img(path, opts?) → '<img …>' or '' when path is null / not shipped (then render NO picture box).
   * opts: { alt:'', w, h, cls, eager:false, ratio:'16/9', style }
   * Always gives width/height (or aspect-ratio), loading="lazy" (unless eager) and decoding="async".
   */
  AAT.img = function (p, o) {
    o = o || {};
    var s = AAT.src(p); if (!s) return '';
    var st = (o.ratio ? 'aspect-ratio:' + o.ratio + ';' : '') + (o.style || '');
    return '<img src="' + AAT.esc(s) + '" alt="' + AAT.esc(o.alt || '') + '"' + (o.w ? ' width="' + o.w + '"' : '') + (o.h ? ' height="' + o.h + '"' : '') +
      (o.cls ? ' class="' + o.cls + '"' : '') + (st ? ' style="' + st + '"' : '') + (o.eager ? '' : ' loading="lazy"') + ' decoding="async">';
  };
  function pad3(n) { return ('00' + n).slice(-3); }
  /** AAT.pageImg(n) → 'img/mag560/p006.jpg' when page n is shipped (1–12), else '' ; AAT.thumb(n) → thumbnail path or '' */
  AAT.pageImg = function (n) { var M = D.magazine || {}; return n >= 1 && n <= (M.prototypePages || 0) ? AAT.src(String(M.pageImage).replace('NNN', pad3(n))) : ''; };
  AAT.thumb = function (n) { var M = D.magazine || {}; return n >= 1 && n <= (M.prototypePages || 0) ? AAT.src(String(M.thumb).replace('NNN', pad3(n))) : ''; };

  /* ======================================================================
     Data lookups and computed counts (every count comes from data.json)
     ====================================================================== */
  var IX = { lc: {}, show: {}, art: {}, news: {}, field: {} };
  (D.companies || []).forEach(function (c) { IX.lc[c.id] = c; });
  (D.shows || []).forEach(function (s) { IX.show[s.id] = s; });
  (D.articles || []).forEach(function (a) { IX.art[a.id] = a; });
  (D.news || []).forEach(function (n) { IX.news[n.id] = n; });
  (D.fields || []).forEach(function (f) { IX.field[f.id] = f; });
  /** AAT.company(id) → company or null */
  AAT.company = function (id) { return IX.lc[id] || null; };
  /** AAT.product(companyId, k) → { c, p } or null */
  AAT.product = function (cid, k) { var c = IX.lc[cid]; if (!c) return null; var p = (c.products || []).filter(function (x) { return String(x.k) === String(k); })[0]; return p ? { c: c, p: p } : null; };
  /** AAT.show(id), AAT.article(id), AAT.newsItem(id), AAT.modernItem(n), AAT.field(id) → item or null */
  AAT.show = function (id) { return IX.show[id] || null; };
  AAT.article = function (id) { return IX.art[id] || null; };
  AAT.newsItem = function (id) { return IX.news[id] || null; };
  AAT.modernItem = function (n) { return (D.modern || [])[n] || null; };
  AAT.field = function (id) { return IX.field[id] || null; };
  /** AAT.country(cc) → {ar,en,flag,shows} or null ; AAT.cat(key) → {ar,en} or null */
  AAT.country = function (cc) { return (D.countries || {})[cc] || null; };
  AAT.cat = function (k) { return (D.cats || {})[k] || null; };
  /** AAT.LINE → country codes with shows, in trade-line order Taiwan → Algeria (never af / ye) */
  AAT.LINE = ['tw', 'id', 'my', 'pk', 'om', 'ae', 'qa', 'kw', 'sa', 'iq', 'sy', 'tr', 'eg', 'dz'].filter(function (cc) { var c = AAT.country(cc); return c && c.shows > 0; });
  var ORIGIN = { Taiwan: 'tw', Syria: 'sy', Malaysia: 'my', Indonesia: 'id', Pakistan: 'pk', Turkey: 'tr', 'Saudi Arabia': 'sa', UAE: 'ae' };
  /**
   * AAT.origin(company) → { cc, country, en, ar, text } — where the company is:
   * cc = flag country code (null for India: no flag shipped), en/ar = city line, text = in the visitor's language.
   */
  AAT.origin = function (c) {
    var en = ((c && c.city && c.city.en) || '').split(' · ')[0];
    var ar = ((c && c.city && c.city.ar) || '').split(' · ')[0];
    var country = en.split(',').pop().trim();
    return { cc: ORIGIN[country] || null, country: country, en: en, ar: ar, text: AAT.lang === 'ar' ? (ar || en) : en };
  };
  /** AAT.stats → the site's facts, computed once from data.json */
  AAT.stats = (function () {
    var cos = D.companies || [], shows = D.shows || [];
    var products = 0, prodCos = 0, pictured = 0;
    cos.forEach(function (c) { var n = (c.products || []).length; products += n; if (n) prodCos += 1; (c.products || []).forEach(function (p) { if (AAT.src(p.img)) pictured += 1; }); });
    var M = D.magazine || {};
    return {
      shows: shows.length, showCountries: AAT.LINE.length, companies: cos.length, logos: cos.filter(function (c) { return c.logo; }).length,
      products: products, prodCos: prodCos, pictured: pictured, modern: (D.modern || []).length, modernGroups: (D.modernGroups || []).length,
      articlesFresh: (D.articles || []).filter(function (a) { return a.fresh; }).length, articles: (D.articles || []).length, news: (D.news || []).length,
      members: (D.club && D.club.members && D.club.members.count) || 0, issue: M.number, pages: M.pages, shipped: M.prototypePages, years: M.years, since: M.since
    };
  }());

  /* ======================================================================
     App UI strings (header, footer, contact band, shared components)
     Page builders add their own: AAT.strings.<module> = { ar:{…}, en:{…} }.
     ====================================================================== */
  AAT.strings.app = {
    ar: {
      nav_home: 'الرئيسية', nav_magazine: 'المجلة', nav_exhibitions: 'معارض دولية', nav_companies: 'دليل الشركات', nav_products: 'المنتجات',
      nav_reading: 'مقالات وأخبار', nav_club: 'نادي رجال الأعمال', nav_contact: 'تواصل معنا', nav_about: 'من نحن', nav_advertise: 'أعلن معنا', nav_privacy: 'الخصوصية',
      tab_magazine: 'المجلة', tab_exhibitions: 'معارض دولية', tab_products: 'المنتجات', tab_ask: 'اسأل AAT',
      lang_switch: 'English', globe: 'اللغات', sections: 'الأقسام', close: 'إغلاق', chat: 'محادثة 24 ساعة', skip: 'انتقل إلى المحتوى', menu_label: 'القائمة الرئيسية',
      call: 'اتصل بنا', home_logo: 'AAT · التجارة العربية الآسيوية · الصفحة الرئيسية', sheet_search: 'ابحث أو اسأل AAT', search: 'ابحث', more_pages: 'صفحات أخرى',
      con_title: 'تواصل معنا', con_phone: 'الهاتف وواتساب', con_mail: 'البريد الإلكتروني', con_addr: 'العنوان', editor: 'رئيس التحرير',
      nl_line: 'أرسل كلمة «اشتراك» من بريدك إلى', nl_write: 'اكتب الرسالة', nl_copy: 'انسخ العنوان', nl_subject: 'اشتراك في النشرة',
      copy: 'نسخ', copied: 'تم النسخ', copy_num: 'انسخ الرقم', num_copied: 'تم نسخ الرقم', copy_sel: 'النص محدَّد، انسخه الآن', open_chat: 'افتح المحادثة في',
      ft_sections: 'الأقسام', ft_contact: 'تواصل معنا', ft_langs: 'اللغات', rights: '© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة',
      page_stamp: 'ص. {n}', pages_n: '{n} صفحة', issue_n: 'العدد {n}', read_issue: 'اقرأ العدد', pdf: 'PDF',
      no_results: 'لا توجد نتائج لهذا الاختيار', clear: 'إلغاء التصفية', cols_date: 'التاريخ', cols_show: 'المعرض', cols_place: 'المدينة والدولة', cols_field: 'المجال',
      all_countries: 'كل الدول', trade_line: 'خط التجارة: {c} · {s} من يناير 2027', products_n: '{n}'
    },
    en: {
      nav_home: 'Home', nav_magazine: 'Magazine', nav_exhibitions: 'International exhibitions', nav_companies: 'Company directory', nav_products: 'Products',
      nav_reading: 'Articles & news', nav_club: 'AAT Business Club', nav_contact: 'Contact', nav_about: 'About us', nav_advertise: 'Advertise with us', nav_privacy: 'Privacy',
      tab_magazine: 'Magazine', tab_exhibitions: 'Exhibitions', tab_products: 'Products', tab_ask: 'Ask AAT',
      lang_switch: 'العربية', globe: 'Languages', sections: 'Sections', close: 'Close', chat: '24-hour chat', skip: 'Skip to content', menu_label: 'Main menu',
      call: 'Call us', home_logo: 'AAT · Arab Asian Trade · Home', sheet_search: 'Search or ask AAT', search: 'Search', more_pages: 'More pages',
      con_title: 'Contact us', con_phone: 'Phone and WhatsApp', con_mail: 'Email', con_addr: 'Address', editor: 'Editor',
      nl_line: 'Send the word “Subscribe” from your e-mail to', nl_write: 'Write the e-mail', nl_copy: 'Copy address', nl_subject: 'Newsletter subscription',
      copy: 'Copy', copied: 'Copied', copy_num: 'Copy the number', num_copied: 'Number copied', copy_sel: 'The text is selected, copy it now', open_chat: 'Open a chat on',
      ft_sections: 'Sections', ft_contact: 'Contact us', ft_langs: 'Languages', rights: '© 2026 Arab Asian Trade Group · All rights reserved',
      page_stamp: 'p. {n}', pages_n: '{n} pages', issue_n: 'Issue {n}', read_issue: 'Read the issue', pdf: 'PDF',
      no_results: 'No results for this choice', clear: 'Clear filters', cols_date: 'Dates', cols_show: 'Exhibition', cols_place: 'City and country', cols_field: 'Field',
      all_countries: 'All countries', trade_line: 'The trade line: {c} · {s} from January 2027', products_n: '{n}'
    }
  };
  // zh-TW / zh-CN / ms: menu words that data.json i18n already has in those languages (others fall back to English)
  (function () {
    var I = D.i18n || {}, map = { nav_home: 'home', nav_magazine: 'nav_magazine', nav_exhibitions: 'nav_exhibitions', nav_products: 'prod_tab', nav_club: 'nav_membership',
      nav_contact: 'nav_contact', nav_about: 'nav_about', nav_advertise: 'adv_btn', nav_privacy: 'privacy', tab_magazine: 'nav_magazine', tab_exhibitions: 'nav_exhibitions',
      tab_products: 'prod_tab', chat: 'chat_cta', skip: 'skip', copy: 'copy', copied: 'copied', close: 'v_close', con_title: 'contact_title', con_mail: 'contact_email', con_addr: 'contact_address' };
    ['zh-TW', 'zh-CN', 'ms'].forEach(function (l) {
      if (!I[l]) return;
      var o = AAT.strings.app[l] = { lang_switch: 'العربية' };
      Object.keys(map).forEach(function (k) { if (I[l][map[k]]) o[k] = I[l][map[k]]; });
    });
  }());

  /* ======================================================================
     Icons: AAT.icon(name, size?) → inline SVG line icon (aria-hidden).
     Names: globe phone chat search menu close book cal box mail pin arrow (flips in RTL)
            back (flips) check copy ext pdf full zoom plus minus home users building news grid
     ====================================================================== */
  var ICONS = {
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20"/>',
    phone: '<path fill="currentColor" stroke="none" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/>',
    chat: '<path stroke-linejoin="round" d="M4 5h16v11H9l-5 4z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path stroke-linecap="round" d="M15.5 15.5 21 21"/>',
    menu: '<path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/>',
    book: '<path stroke-linejoin="round" d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    box: '<path stroke-linejoin="round" d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    ext: '<path stroke-linecap="round" stroke-linejoin="round" d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    pdf: '<path stroke-linejoin="round" d="M6 3h9l4 4v14H6zM14 3v5h5"/><path stroke-linecap="round" d="M9 13h7M9 17h5"/>',
    full: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path stroke-linecap="round" d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/>',
    plus: '<path stroke-linecap="round" d="M12 5v14M5 12h14"/>',
    minus: '<path stroke-linecap="round" d="M5 12h14"/>',
    home: '<path stroke-linejoin="round" d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.6 3.2-6 6.5-6s6 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3.3 2.9 3.5 6"/>',
    building: '<path stroke-linejoin="round" d="M4 21V5l8-2v18M12 8l8 2v11M2 21h20M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
    news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path stroke-linecap="round" d="M7 8h10M7 12h10M7 16h6"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'
  };
  AAT.icon = function (name, size) {
    var b = ICONS[name]; if (!b) return '';
    size = size || 24;
    return '<svg class="ic ic-' + name + (name === 'arrow' || name === 'back' ? ' ic-flip' : '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true" focusable="false">' + b + '</svg>';
  };

  /* ======================================================================
     Toast, copy, assistant entry
     ====================================================================== */
  var toastTimer;
  /** AAT.toast(message, ms = 2500) → shows a short status line (role=status) at the bottom */
  AAT.toast = function (msg, ms) {
    var el = AAT.$('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.innerHTML = '<span>' + AAT.esc(msg) + '</span>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.innerHTML = ''; }, ms || 2500);
  };
  function selectText(node) {
    try { var r = document.createRange(); r.selectNodeContents(node); var s = W.getSelection(); s.removeAllRanges(); s.addRange(r); return true; } catch (e) { return false; }
  }
  /**
   * AAT.copy(text, okMessage?, selectNode?) — copies inside the click handler with navigator.clipboard;
   * on rejection selects selectNode (the visible text) and says "selected, copy it now". Never claims a copy that failed.
   */
  AAT.copy = function (text, ok, node) {
    var done = function () { AAT.toast(ok || AAT.t('app.copied')); };
    var fail = function () { if (node && selectText(node)) AAT.toast(AAT.t('app.copy_sel')); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    } catch (e) { fail(); }
  };
  /**
   * AAT.openAssistant(query?) — opens the assistant panel (implemented by js/pages/assistant.js as
   * AAT.pages.assistant.open(query)). Every "محادثة 24 ساعة" button, search box and the "اسأل AAT" tab call this.
   */
  AAT.openAssistant = function (q) {
    var m = AAT.pages.assistant;
    if (m && typeof m.open === 'function') return m.open(q || '');
  };

  /* ======================================================================
     UI components — every function returns an HTML string.
     Data strings are escaped inside; pass HTML only where a parameter says "html".
     ====================================================================== */
  var ui = AAT.ui, esc = AAT.esc, t = AAT.t;
  function attrs(o) { if (!o) return ''; return Object.keys(o).map(function (k) { return o[k] == null || o[k] === false ? '' : ' ' + k + (o[k] === true ? '' : '="' + esc(o[k]) + '"'); }).join(''); }
  /** AAT.ui.attrs({a:1, 'data-x':'y'}) → ' a="1" data-x="y"' (escaped; null/false skipped, true → bare attribute) */
  ui.attrs = attrs;

  /**
   * AAT.ui.button({label, html, href, act, kind, size, icon, iconEnd, attrs, newTab, cls, type, block}) → <a> or <button>
   *   kind: 'red' (one primary per section) | 'navy' (section action on light) | 'line' (secondary on light) | 'ghost' (secondary on navy)
   *   size: 's' (48px masthead/compact). label is text (escaped); html is pre-built HTML (use one of them).
   *   href → <a>; act → <button data-act>; newTab → target=_blank rel=noopener.
   * e.g. AAT.ui.button({label:'كل المعارض الدولية', href:'#exhibitions', kind:'navy'})
   */
  ui.button = function (o) {
    var cls = 'btn btn-' + (o.kind || 'red') + (o.size === 's' ? ' btn-s' : '') + (o.block ? ' btn-block' : '') + (o.cls ? ' ' + o.cls : '');
    var inner = (o.icon ? AAT.icon(o.icon, o.size === 's' ? 22 : 24) : '') + '<span>' + (o.html != null ? o.html : AAT.txt(o.label)) + '</span>' + (o.iconEnd ? AAT.icon(o.iconEnd, 22) : '');
    var a = Object.assign({}, o.attrs || {});
    if (o.href) {
      if (o.newTab) { a.target = '_blank'; a.rel = 'noopener'; }
      return '<a class="' + cls + '" href="' + esc(o.href) + '"' + attrs(a) + '>' + inner + '</a>';
    }
    if (o.act) a['data-act'] = o.act;
    return '<button class="' + cls + '" type="' + (o.type || 'button') + '"' + attrs(a) + '>' + inner + '</button>';
  };

  /**
   * AAT.ui.section({id, band, title, titleHtml, meta, metaHtml, action, body, cls, h:'h2', untitled, attrs}) → full-width band
   *   band: 'paper' | 'floor' | 'night' (alternate them; never two neighbours of one colour)
   *   action: a button() options object (kind defaults to 'navy' on light, 'ghost' on night) — ONE per section
   *   body: html. untitled:true only for a lone text block under a short board (privacy, 404).
   * e.g. AAT.ui.section({band:'paper', title:'دليل الشركات', meta:'35 شركة معلنة', action:{label:'…', href:'#companies'}, body:html})
   */
  ui.section = function (o) {
    var band = o.band || 'paper', id = o.id || AAT.uid('s'), hid = id + '-h';
    var act = '';
    if (o.action) act = ui.button(Object.assign({ kind: band === 'night' ? 'ghost' : 'navy' }, o.action));
    var head = '';
    if (!o.untitled) {
      var H = o.h || 'h2';
      head = '<div class="shead"><div><' + H + ' id="' + hid + '"' + (H !== 'h2' ? ' class="h2"' : '') + '>' + (o.titleHtml != null ? o.titleHtml : AAT.txt(o.title)) + '</' + H + '>' +
        (o.meta || o.metaHtml ? '<p class="meta">' + (o.metaHtml != null ? o.metaHtml : AAT.txt(o.meta)) + '</p>' : '') + '</div>' + act + '</div>';
    }
    return '<section id="' + esc(id) + '" class="band b-' + band + (o.cls ? ' ' + o.cls : '') + '"' + (o.untitled ? ' data-untitled' : ' aria-labelledby="' + hid + '"') + attrs(o.attrs) +
      '><div class="wrap">' + head + (o.body || '') + '</div></section>';
  };

  /**
   * AAT.ui.openingBoard({h1, h1Html, h1Attrs, lead, leadHtml, meta, figure:{n,label}, search, actions, picture, short, cls, id}) → the navy opening band (§4.4)
   *   figure: brass figure, e.g. {n:'1,464', label:'معرضاً دولياً في 14 دولة'} (n is LTR-isolated)
   *   search: {act, placeholder, label, name:'q', value, button} → white search box with red button (form data-act=act)
   *   actions: html (buttons) · picture: html for the end side (frame(), cover board, seal(), logo fan…)
   *   short: true → min-height 200 (privacy, 404)
   */
  ui.openingBoard = function (o) {
    var fig = o.figure ? '<p class="ob-fig"><b><bdi dir="ltr">' + esc(o.figure.n) + '</bdi></b><span>' + (o.figure.labelHtml != null ? o.figure.labelHtml : AAT.txt(o.figure.label)) + '</span></p>' : '';
    var search = o.search ? ui.searchBox(o.search) : '';
    var text = '<div class="ob-text"><h1' + attrs(o.h1Attrs) + '>' + (o.h1Html != null ? o.h1Html : AAT.txt(o.h1)) + '</h1>' +
      (o.lead || o.leadHtml ? '<p class="ob-lead">' + (o.leadHtml != null ? o.leadHtml : AAT.txt(o.lead)) + '</p>' : '') +
      (o.meta ? '<p class="ob-meta">' + o.meta + '</p>' : '') + fig + search + (o.actions ? '<div class="ob-acts">' + o.actions + '</div>' : '') + (o.extra || '') + '</div>';
    var pic = o.picture ? '<div class="ob-pic">' + o.picture + '</div>' : '';
    return '<section class="ob' + (o.short ? ' ob-short' : '') + (o.cls ? ' ' + o.cls : '') + '"' + (o.id ? ' id="' + esc(o.id) + '"' : '') + '><div class="wrap"><div class="ob-grid' + (pic ? '' : ' ob-solo') + '">' +
      text + pic + '</div>' + (o.after || '') + '</div></section>';
  };

  /**
   * AAT.ui.searchBox({act, placeholder, label, name, value, button, cls}) → <form class="sbox" data-act=act role=search>
   * The submit is delegated: AAT.acts[act](form, ev, ctx); read the text with form.elements.q.value.
   * act defaults to 'ask' (opens the assistant with the query).
   */
  ui.searchBox = function (o) {
    o = o || {};
    var id = AAT.uid('q'), name = o.name || 'q';
    return '<form class="sbox' + (o.cls ? ' ' + o.cls : '') + '" role="search" data-act="' + esc(o.act || 'ask') + '"><label class="sr" for="' + id + '">' + esc(o.label || o.placeholder) + '</label>' +
      '<span class="s-ic">' + AAT.icon('search', 28) + '</span><input id="' + id + '" name="' + esc(name) + '" type="search" autocomplete="off" placeholder="' + esc(o.placeholder) + '" value="' + esc(o.value || '') + '">' +
      '<button class="btn btn-red" type="submit">' + esc(o.button || t('app.search')) + '</button></form>';
  };

  /**
   * AAT.ui.chips(items, {cls, scroll, label}) → filter chips (§4.9).
   *   item: {label, html, n, sel, href, act, flag (cc), disabled, attrs}
   *   href → <a>; act → <button data-act aria-pressed>; n → the count tile.
   */
  ui.chips = function (items, o) {
    o = o || {};
    return '<div class="chips' + (o.scroll ? ' chips-scroll' : '') + (o.cls ? ' ' + o.cls : '') + '"' + (o.label ? ' role="group" aria-label="' + esc(o.label) + '"' : '') + '>' + items.map(function (it) {
      var inner = (it.flag ? ui.flag(it.flag, 30, 20) : '') + '<span>' + (it.html != null ? it.html : AAT.txt(it.label)) + '</span>' + (it.n != null ? '<span class="n"><bdi dir="ltr">' + esc(typeof it.n === 'number' ? AAT.num(it.n) : it.n) + '</bdi></span>' : '');
      var cls = 'chip' + (it.sel ? ' on' : '') + (it.cls ? ' ' + it.cls : '');
      var a = Object.assign({}, it.attrs || {});
      if (it.href) return '<a class="' + cls + '" href="' + esc(it.href) + '"' + (it.sel ? ' aria-current="true"' : '') + attrs(a) + '>' + inner + '</a>';
      a['data-act'] = it.act; a['aria-pressed'] = it.sel ? 'true' : 'false'; if (it.disabled) a.disabled = true;
      return '<button class="' + cls + '" type="button"' + attrs(a) + '>' + inner + '</button>';
    }).join('') + '</div>';
  };
  /** AAT.ui.qchips([{label, q}]) → pill chips on navy that ask the assistant (data-act="ask" data-q) */
  ui.qchips = function (items) {
    return '<ul class="qchips">' + items.map(function (it) { return '<li><button class="qchip" type="button" data-act="ask" data-q="' + esc(it.q || it.label) + '">' + AAT.txt(it.label) + '</button></li>'; }).join('') + '</ul>';
  };
  /** AAT.ui.tag(text) → field tag pill */
  ui.tag = function (s) { return '<span class="tag">' + AAT.txt(s) + '</span>'; };
  /** AAT.ui.flag(cc, w=40, h=27) → flag <img> ('' for unknown, Afghanistan, Yemen or no shipped file) */
  ui.flag = function (cc, w, h) {
    var c = AAT.country(cc); if (!c || cc === 'af' || !c.shows) return '';
    return AAT.img(c.flag, { alt: '', w: w || 40, h: h || 27, cls: 'flag' });
  };
  /** AAT.ui.stamp(text) → the big red outlined stamp ("العدد 560") */
  ui.stamp = function (s) { return '<span class="stamp">' + AAT.txt(s) + '</span>'; };
  /**
   * AAT.ui.folio(pages | n, {tilt, chip}) → page stamp "ص. 18–19" / "p. 18–19" (numbers LTR-isolated).
   *   pages: array (contiguous run → range, else first page) or a number. chip:true → navy page chip (on navy bands).
   */
  ui.folio = function (p, o) {
    o = o || {};
    var lbl = Array.isArray(p) ? AAT.pagesLabel(p) : String(p);
    var txt = esc(t('app.page_stamp', { n: '\u0000' })).replace('\u0000', '<bdi dir="ltr" class="lt">' + esc(lbl) + '</bdi>');
    return '<span class="' + (o.chip ? 'pgno' : 'pstamp' + (o.tilt ? ' tilt' : '')) + '">' + txt + '</span>';
  };
  /** AAT.ui.brass({n, label}) → brass figure + label (only on navy) */
  ui.brass = function (o) { return '<p class="ob-fig"><b><bdi dir="ltr">' + esc(o.n) + '</bdi></b><span>' + AAT.txt(o.label) + '</span></p>'; };
  /**
   * AAT.ui.counters([{n, label, sub, href}]) → row of white counter boards with red top edges (§2.2 motif 3).
   * n is a number (formatted) or text; sub-lines that are number ranges are LTR-isolated.
   */
  ui.counters = function (list, o) {
    return '<div class="cnts' + (o && o.cls ? ' ' + o.cls : '') + '">' + list.map(function (k) {
      var tag = k.href ? 'a' : 'div';
      return '<' + tag + ' class="cnt"' + (k.href ? ' href="' + esc(k.href) + '"' : '') + '><b><bdi dir="ltr">' + esc(typeof k.n === 'number' ? AAT.num(k.n) : k.n) + '</bdi></b><span>' + AAT.txt(k.label) + '</span>' +
        (k.sub ? '<i>' + AAT.txt(k.sub) + '</i>' : '') + '</' + tag + '>';
    }).join('') + '</div>';
  };
  /** AAT.ui.figures([{n, label, year}]) → brass figures in a ruled row (club band; navy only). Numbers get a thousands comma unless year:true (1982). */
  ui.figures = function (list) {
    return '<ul class="figs">' + list.map(function (f) { return '<li><b><bdi dir="ltr">' + esc(typeof f.n === 'number' && !f.year ? AAT.num(f.n) : f.n) + '</bdi></b><span>' + AAT.txt(f.label) + '</span></li>'; }).join('') + '</ul>';
  };
  /**
   * AAT.ui.frame({src, alt, w, h, ratio, cap, sub, href, eager, drift, contain, cls}) → framed picture (§2.2 motif 6).
   * Returns '' when src is not shipped. cap/sub → caption label at the top-start corner.
   */
  ui.frame = function (o) {
    var img = AAT.img(o.src, { alt: o.alt || o.cap || '', w: o.w, h: o.h, eager: o.eager, ratio: o.ratio || (o.w && o.h ? o.w + '/' + o.h : null) });
    if (!img) return '';
    var cap = o.cap ? '<figcaption class="cap"><b>' + AAT.txt(o.cap) + '</b>' + (o.sub ? '<span>' + AAT.txt(o.sub) + '</span>' : '') + '</figcaption>' : '';
    var cls = 'frame' + (o.drift ? ' frame-drift' : '') + (o.contain ? ' frame-contain' : '') + (o.cls ? ' ' + o.cls : '');
    var inner = img + cap;
    return o.href ? '<a class="' + cls + '" href="' + esc(o.href) + '"><figure>' + inner + '</figure></a>' : '<figure class="' + cls + '">' + inner + '</figure>';
  };
  /** AAT.ui.coverBoard({stamp:true, buttons:true}) → the issue 560 cover on a white board (magazine / about boards) */
  ui.coverBoard = function (o) {
    o = o || {};
    var M = D.magazine;
    return '<div class="cover-board">' + AAT.img(M.cover, { alt: t('app.issue_n', { n: M.number }) + ' · ' + AAT.L(M.month), w: 617, h: 873, eager: true }) +
      (o.stamp !== false ? ui.stamp(t('app.issue_n', { n: M.number })) : '') +
      (o.buttons ? '<div class="btnrow">' + ui.button({ label: t('mb_read', { n: M.number }), href: '#flip-1' }) + ui.button({ html: '<bdi dir="ltr">PDF</bdi>', href: M.pdf, kind: 'line', newTab: true, icon: 'pdf' }) + '</div>' : '') + '</div>';
  };
  /**
   * AAT.ui.spread({a:2, b:3, caption, cls}) → the open spread of two shipped magazine pages in a white frame.
   * The printed book reads right to left: the lower page number sits on the RIGHT in every language.
   * Returns '' when a page is not shipped.
   */
  ui.spread = function (o) {
    o = o || {};
    var a = o.a || 2, b = o.b || a + 1, A = AAT.pageImg(a), B = AAT.pageImg(b);
    if (!A || !B) return '';
    var pg = function (n, s) { return AAT.img(s, { alt: (AAT.rtl ? 'صفحة ' : 'Page ') + n, w: 1100, h: 1555, eager: o.eager }); };
    return '<figure class="spread' + (o.cls ? ' ' + o.cls : '') + '"><div class="spread-pages" dir="rtl">' + pg(a, A) + pg(b, B) + '</div>' +
      (o.caption ? '<figcaption>' + AAT.txt(o.caption) + '</figcaption>' : '') + '</figure>';
  };
  /** AAT.ui.issueCard({cls}) → white issue card: cover, stamp, name, "أكتوبر 2026 · 100 صفحة", اقرأ العدد + PDF (home board) */
  ui.issueCard = function (o) {
    var M = D.magazine;
    return '<div class="icard' + (o && o.cls ? ' ' + o.cls : '') + '">' + AAT.img(M.cover, { alt: t('app.issue_n', { n: M.number }) + ' · ' + AAT.L(M.month), w: 617, h: 873, cls: 'icard-cover', eager: true }) +
      '<div class="icard-body">' + ui.stamp(t('app.issue_n', { n: M.number })) + '<b class="icard-name">' + AAT.Lh(M.name) + '</b><span class="icard-sub">' + esc(AAT.L(M.month)) + ' · ' + esc(t('app.pages_n', { n: M.pages })) + '</span>' +
      '<div class="btnrow">' + ui.button({ label: t('app.read_issue'), href: '#flip-1' }) + ui.button({ html: '<bdi dir="ltr">PDF</bdi>', href: M.pdf, kind: 'line', newTab: true }) + '</div></div></div>';
  };
  /**
   * AAT.ui.seal(size=300) → the owner-approved AAT Business Club seal (clubMark() of the old views.js, ring text unchanged).
   * Render at ≥ 220px. On navy it gets a drop shadow from CSS.
   */
  ui.seal = function (size) {
    size = size || 300;
    var u = AAT.uid('sl');
    return '<svg class="seal" style="--seal:' + size + 'px" width="' + size + '" height="' + size + '" viewBox="0 0 200 200" role="img" aria-label="AAT Business Club · نادي رجال الأعمال">' +
      '<defs><path id="' + u + 't" d="M30 100a70 70 0 0 1 140 0"/><path id="' + u + 'b" d="M13 100a87 87 0 0 0 174 0"/></defs>' +
      '<circle cx="100" cy="100" r="98" fill="#D21F26"/><circle cx="100" cy="100" r="93" fill="none" stroke="#fff" stroke-width="1.5"/>' +
      '<circle cx="100" cy="100" r="64" fill="#fff"/><circle cx="100" cy="100" r="59" fill="none" stroke="#D21F26" stroke-width="1.5"/>' +
      '<text font-family="Changa, \'Readex Pro\', Arial, sans-serif" font-weight="800" font-size="17" letter-spacing="2.2" fill="#fff" text-anchor="middle"><textPath href="#' + u + 't" startOffset="50%">BUSINESS CLUB</textPath></text>' +
      '<text font-family="Changa, \'Readex Pro\', Tahoma, sans-serif" font-weight="700" font-size="17" fill="#fff" text-anchor="middle" direction="rtl"><textPath href="#' + u + 'b" startOffset="50%">نادي رجال الأعمال</textPath></text>' +
      '<circle cx="20" cy="100" r="3.5" fill="#fff"/><circle cx="180" cy="100" r="3.5" fill="#fff"/>' +
      '<g transform="translate(88 50)" fill="none" stroke="#111" stroke-width="2.2" stroke-linejoin="round"><rect x="0" y="5" width="24" height="16" rx="2.5"/><path d="M8 5V2.5h8V5M0 12h24"/></g>' +
      '<image href="' + esc(AAT.src(D.config.logo.red)) + '" x="52" y="80" width="96" height="32"/>' +
      '<g fill="#D21F26"><path d="M84 140l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/><path d="M100 143l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/><path d="M116 140l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/></g></svg>';
  };
  /**
   * AAT.ui.tradeLine({sel, all, act, caption}) → the trade line of the 14 countries with shows (§2.2 motif 2).
   *   default: each stop links to #exhibitions-<cc>.
   *   all:true → first stop "كل الدول · 1,464" (exhibitions filter); sel: 'all' | cc → selected stop (white board, red underline).
   *   act → stops are <button data-act=act data-cc=cc> instead of links. caption:false hides the caption.
   */
  ui.tradeLine = function (o) {
    o = o || {};
    var stops = AAT.LINE.map(function (cc) { return { cc: cc, c: AAT.country(cc) }; });
    function stop(s, isAll) {
      var cc = isAll ? 'all' : s.cc, n = isAll ? AAT.stats.shows : s.c.shows;
      var pic = isAll ? '<span class="tl-all-ic">' + AAT.icon('globe', 22) + '</span>' : AAT.img(s.c.flag, { alt: '', w: 54, h: 36, eager: true });
      var inner = pic + '<b>' + esc(isAll ? t('app.all_countries') : AAT.L(s.c)) + '</b><span>' + esc(AAT.count(n, 'show')) + '</span>';
      var on = o.sel === cc ? ' on' : '';
      if (o.act) return '<li><button type="button" class="tl-stop' + on + '" data-act="' + esc(o.act) + '" data-cc="' + cc + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + inner + '</button></li>';
      return '<li><a class="tl-stop' + on + '" href="#exhibitions' + (isAll ? '' : '-' + cc) + '"' + (on ? ' aria-current="true"' : '') + '>' + inner + '</a></li>';
    }
    var list = (o.all ? [stop(null, true)] : []).concat(stops.map(function (s) { return stop(s); })).join('');
    var cap = o.caption === false ? '' : '<p class="tl-cap"><span class="tl-pulse" aria-hidden="true"></span><span>' +
      esc(t('app.trade_line', { c: AAT.count(AAT.stats.showCountries, 'country'), s: AAT.count(AAT.stats.shows, 'intl') })) + '</span></p>';
    return '<div class="tl' + (o.all ? ' tl-filter' : '') + '">' + cap + '<div class="tl-track">' + (o.all ? '' : '<span class="tl-glint" aria-hidden="true"></span>') +
      '<ol class="tl-stops" style="--stops:' + (stops.length + (o.all ? 1 : 0)) + '">' + list + '</ol></div></div>';
  };
  /**
   * AAT.ui.dateStamp(show) → navy date stamp: "11–13" over "يناير 2027"; month-only shows: month over year.
   */
  ui.dateStamp = function (s) {
    var a = ymd(s.start), b = ymd(s.end || s.start);
    if (s.approx) return '<span class="ds ds-m"><b>' + esc(isZh() ? a.m + '月' : AAT.monthName(a.m)) + '</b><i>' + a.y + '</i></span>';
    if (a.y === b.y && a.m === b.m) return '<span class="ds"><b dir="ltr">' + (a.d === b.d ? a.d : a.d + '–' + b.d) + '</b><i>' + esc(isZh() ? a.y + '年' + a.m + '月' : AAT.monthName(a.m) + ' ' + a.y) + '</i></span>';
    return '<span class="ds ds-x"><b>' + esc(a.d + ' ' + AAT.monthName(a.m)) + '</b><i>' + esc('– ' + b.d + ' ' + AAT.monthName(b.m) + ' ' + b.y) + '</i></span>';
  };
  /** AAT.showCity(show) → HTML city in the visitor's language (Arabic city when present on the Arabic site, else the Latin one isolated) */
  AAT.showCity = function (s) {
    if (!s.city) return '';
    if (AAT.lang === 'ar' && s.city.ar) return esc(s.city.ar);
    return s.city.en ? (AAT.rtl ? AAT.lt(s.city.en) : esc(s.city.en)) : '';
  };
  /**
   * AAT.ui.showRow(show, {href}) → one departure-board row (§4.9): date stamp | name + venue | flag + city + country | field tag.
   * Unknown parts are left out. Default link #exhibition-<id>.
   */
  ui.showRow = function (s, o) {
    o = o || {};
    var c = AAT.country(s.cc) || {}, f = AAT.field(s.field);
    var venue = s.venue && (AAT.lang === 'ar' && s.venue.ar ? s.venue.ar : s.venue.en);
    var city = AAT.showCity(s);
    return '<a class="srow' + (s.approx ? ' approx' : '') + '" href="' + esc(o.href || '#exhibition-' + s.id) + '">' +
      '<span class="s-date">' + ui.dateStamp(s) + '</span>' +
      '<span class="s-name">' + AAT.ltb(s.name, 'b') + (venue ? (AAT.isAr(venue) ? '<span class="s-venue">' + AAT.arx(venue) + '</span>' : AAT.ltb(venue, 'span', 's-venue')) : '') + '</span>' +
      '<span class="s-place">' + ui.flag(s.cc, 40, 27) + '<span>' + (city ? '<b>' + city + '</b>' : '') + '<span>' + esc(AAT.L(c)) + '</span></span></span>' +
      '<span class="s-field">' + (f ? ui.tag(AAT.L(f)) : '') + '</span></a>';
  };
  /** AAT.ui.showBoard(rowsHtml, {head:true}) → the white departure board with the navy header row (hidden on laptop/phone) */
  ui.showBoard = function (rows, o) {
    o = o || {};
    var head = o.head === false ? '' : '<div class="dhead" aria-hidden="true"><span>' + esc(t('app.cols_date')) + '</span><span>' + esc(t('app.cols_show')) + '</span><span>' +
      esc(t('app.cols_place')) + '</span><span>' + esc(t('app.cols_field')) + '</span></div>';
    return '<div class="dboard' + (o.cls ? ' ' + o.cls : '') + '">' + head + rows + '</div>';
  };
  /**
   * AAT.ui.logoCell(company, {products:false}) → company card (§4.5): real logo or the typeset name, Arabic name,
   * Latin name (LTR block, 3-line clamp), flag + city, page stamp; products:true adds "4 منتجات". Links #company-<id>.
   */
  ui.logoCell = function (c, o) {
    o = o || {};
    var og = AAT.origin(c);
    var logo = c.logo && AAT.src(c.logo) ? AAT.img(c.logo, { alt: c.company, w: 200, h: 80 }) :
      '<span class="typeset" dir="ltr">' + esc(c.company.replace(/ (Co\.|Corp\.|Technologies|Electronic|Plastic|Industry|Industrial|·).*$/, '').trim()) + '</span>';
    var name = AAT.lang === 'ar' && c.nameAr ? '<b class="lc-ar">' + esc(c.nameAr) + '</b>' + AAT.ltb(c.company, 'span', 'lc-lt clamp3') : AAT.ltb(c.company, 'b', 'lc-lt clamp3');
    var np = o.products && c.products && c.products.length ? '<span class="lc-np">' + esc(AAT.count(c.products.length, 'product')) + '</span>' : '';
    return '<a class="lc" href="#company-' + c.id + '"><span class="lc-logo">' + logo + '</span>' + name +
      '<span class="lc-city">' + (og.cc ? ui.flag(og.cc, 27, 18) : '') + '<span>' + esc(og.text) + '</span></span>' +
      '<span class="lc-foot">' + ui.folio(c.pages) + np + '</span></a>';
  };
  /**
   * AAT.ui.productCell(company, product, {eager}) → product card (§4.5), or '' when the picture is not shipped
   * (use AAT.ui.productRow for those). Links #product-<companyId>-<k>.
   */
  ui.productCell = function (c, p, o) {
    o = o || {};
    var pic = AAT.img(p.img, { alt: p.n, w: 300, h: 220, eager: o.eager });
    if (!pic) return '';
    var og = AAT.origin(c);
    return '<a class="pc" href="#product-' + c.id + '-' + p.k + '"' + (o.attrs ? attrs(o.attrs) : '') + '><span class="pc-pic">' + pic + ui.folio(c.pages[0], { tilt: true }) + '</span>' +
      AAT.ltb(p.n, 'span', 'pc-name clamp2') +
      '<span class="pc-maker">' + (c.logo ? AAT.img(c.logo, { alt: '', w: 76, h: 30 }) : '') + AAT.ltb(c.company, 'span', 'clamp1') + '</span>' +
      '<span class="pc-place">' + (og.cc ? ui.flag(og.cc, 27, 18) : '') + '<span>' + esc(og.text) + '</span></span></a>';
  };
  /** AAT.ui.productRow(company, product) → a text row for a product without a shipped picture: name · maker · page stamp */
  ui.productRow = function (c, p) {
    return '<a class="row" href="#product-' + c.id + '-' + p.k + '">' + AAT.ltb(p.n, 'span', 'row-t') + AAT.ltb(c.company, 'span', 'muted clamp1') + ui.folio(c.pages[0]) + '</a>';
  };
  var GPIC = { pack: 'img/modern/m2.jpg', food: 'img/modern/m20.jpg', plastic: 'img/modern/m10.jpg', health: 'img/modern/m0.jpg', metal: 'img/modern/m12.jpg', home: 'img/modern/m16.jpg' };
  /** AAT.modernArName(item) → the Arabic name = the text before the first Latin letter ("جهاز تدفئة احترافي") */
  AAT.modernArName = function (m) { return String((m.name && m.name.ar) || '').replace(/\s*[A-Za-z].*$/, '').trim() || (m.name && m.name.en) || ''; };
  /** AAT.ui.modernCard(group) → modern-industry card (§4.5, §6.2 home 6): photo, group name + count, first three items. Links #modern-<group> */
  ui.modernCard = function (g) {
    var items = (D.modern || []).filter(function (m) { return m.group === g.id; }).slice(0, 3);
    return '<a class="mc" href="#modern-' + esc(g.id) + '">' + (AAT.src(GPIC[g.id]) ? '<span class="mc-pic">' + AAT.img(GPIC[g.id], { alt: '', w: 480, h: 270 }) + '</span>' : '') +
      '<span class="mc-body"><span class="mc-head"><b>' + esc(AAT.L(g.name)) + '</b><i><bdi dir="ltr">' + g.count + '</bdi></i></span><span class="mc-items">' +
      items.map(function (m) { return AAT.lang === 'ar' ? '<span class="clamp1">' + esc(AAT.modernArName(m)) + '</span>' : '<span class="clamp1" dir="ltr">' + esc(AAT.L(m.name)) + '</span>'; }).join('') + '</span></span></a>';
  };
  /** AAT.byLine(article) → "بقلم <author>" / "By <Latin part of the author>" or '' */
  AAT.byLine = function (a) {
    if (!a.author) return '';
    if (AAT.lang === 'ar') return t('ar_by') + ' ' + a.author;
    var lat = a.author.replace(/^[^(]*\(([^)]+)\).*$/, '$1').replace(/[؀-ۿ]/g, '').replace(/\s+/g, ' ').trim();
    return lat ? t('ar_by') + ' ' + lat : '';
  };
  /**
   * AAT.ui.articleCard(item, {kind:'article'|'news', lead:false, summary}) → article/news card (§4.5).
   * Picture only if shipped. Title in the visitor's language (Arabic block on LTR pages when only Arabic exists).
   */
  ui.articleCard = function (a, o) {
    o = o || {};
    var kind = o.kind || 'article', href = '#' + kind + '-' + a.id;
    var pic = AAT.img(a.img, { alt: '', w: o.lead ? 800 : 480, h: o.lead ? 400 : 270 });
    var title = AAT.L(a.title), sum = o.lead ? (o.summary != null ? o.summary : AAT.L(a.summary || null)) : '';
    var meta = [];
    if (kind === 'article') { var by = AAT.byLine(a); if (by) meta.push(AAT.txt(by)); if (a.magPage) meta.push(ui.folioText(a.magPage)); }
    else if (a.date) meta.push(esc(AAT.fmtDate(a.date)));
    return '<a class="ac' + (o.lead ? ' ac-lead' : '') + '" href="' + href + '">' + (pic ? '<span class="ac-pic">' + pic + '</span>' : '') + '<span class="ac-body">' +
      blockText(title, 'b', 'ac-t' + (o.lead ? '' : ' clamp3')) + (sum ? blockText(sum, 'span', 'ac-sum clamp2') : '') + (meta.length ? '<span class="ac-meta">' + meta.join(' · ') + '</span>' : '') + '</span></a>';
  };
  /** AAT.ui.folioText(n) → "ص. 56" as inline HTML (no box), numbers isolated */
  ui.folioText = function (n) { return esc(t('app.page_stamp', { n: '\u0000' })).replace('\u0000', '<bdi dir="ltr" class="lt">' + esc(Array.isArray(n) ? AAT.pagesLabel(n) : n) + '</bdi>'); };
  function blockText(s, tag, cls) {
    if (!AAT.rtl && HAS_AR.test(s)) return AAT.rtlb(s, tag, cls);
    if (AAT.rtl && HAS_LAT.test(s) && !HAS_AR.test(s)) return AAT.ltb(s, tag, cls);
    return '<' + tag + ' class="' + cls + '">' + AAT.txt(s) + '</' + tag + '>';
  }
  /** AAT.ui.blockText(text, tag='span', cls='') → a text block with the right direction for its script (Latin block in Arabic, Arabic block in English) */
  ui.blockText = function (s, tag, cls) { return blockText(String(s == null ? '' : s), tag || 'span', cls || ''); };
  /** AAT.ui.headlineRow(item, {kind:'news'|'article', pic:true}) → headline row: picture 150px 3:2 (only if shipped) + title (3-line clamp) + date / by-line */
  ui.headlineRow = function (a, o) {
    o = o || {};
    var kind = o.kind || 'news';
    var pic = o.pic === false ? '' : AAT.img(a.img, { alt: '', w: 150, h: 100 });
    var sub = kind === 'news' ? (a.date ? esc(AAT.fmtDate(a.date)) : '') : AAT.txt(AAT.byLine(a));
    return '<a class="hl" href="#' + kind + '-' + esc(a.id) + '">' + pic + '<span>' + blockText(AAT.L(a.title), 'b', 'clamp3') + (sub ? '<i>' + sub + '</i>' : '') + '</span></a>';
  };
  /** AAT.ui.facts([{k:'التاريخ', v:html}]) → white board of definition rows (rows with empty v are dropped) */
  ui.facts = function (rows) {
    return '<dl class="facts">' + rows.filter(function (r) { return r && r.v; }).map(function (r) { return '<div><dt>' + esc(r.k) + '</dt><dd>' + r.v + '</dd></div>'; }).join('') + '</dl>';
  };
  /** AAT.ui.empty({act, href}) → "لا توجد نتائج لهذا الاختيار" + btn-line "إلغاء التصفية" */
  ui.empty = function (o) {
    o = o || {};
    return '<div class="empty" role="status"><span>' + esc(t('app.no_results')) + '</span>' + ((o.act || o.href) ? ui.button({ label: t('app.clear'), kind: 'line', act: o.act, href: o.href }) : '') + '</div>';
  };
  /** AAT.ui.pager({label, act, attrs}) → centred btn-line "show more" (e.g. "عرض 300 اسماً آخر") */
  ui.pager = function (o) { return '<div class="more">' + ui.button({ label: o.label, act: o.act, kind: 'line', attrs: o.attrs }) + '</div>'; };
  /**
   * AAT.ui.copyField(text, {label, ltr:true, cls}) → selectable text + "نسخ" button (data-act="copy").
   * The visible text stays selectable; the button copies with navigator.clipboard and falls back to selecting it.
   */
  ui.copyField = function (text, o) {
    o = o || {};
    var id = AAT.uid('cp');
    return '<span class="cf' + (o.cls ? ' ' + o.cls : '') + '"><span class="cf-t" id="' + id + '"' + (o.ltr === false ? '' : ' dir="ltr"') + '>' + esc(text) + '</span>' +
      ui.button({ label: o.label || t('app.copy'), kind: o.kind || 'line', size: 's', act: 'copy', icon: 'copy', attrs: { 'data-copy': text, 'data-target': id } }) + '</span>';
  };
  /** AAT.ui.phone({big, copy:true}) → the AAT phone number (tel: link, LTR) + optional "انسخ الرقم" button */
  ui.phone = function (o) {
    o = o || {};
    var C = D.config, id = AAT.uid('ph');
    return '<a class="bigph" id="' + id + '" href="tel:' + esc(C.tel) + '"><bdi dir="ltr">' + esc(C.phone) + '</bdi></a>' +
      (o.copy === false ? '' : ui.button({ label: t('app.copy_num'), kind: o.night ? 'ghost' : 'line', size: 's', act: 'copy', icon: 'copy', attrs: { 'data-copy': C.phone, 'data-target': id, 'data-ok': t('app.num_copied') } }));
  };
  /** AAT.ui.mail(address, {copy}) → e-mail as an underlined link (blue on light, white on navy) + optional Copy button */
  ui.mail = function (addr, o) {
    o = o || {};
    var id = AAT.uid('ml');
    return '<a class="mail" id="' + id + '" href="mailto:' + esc(addr) + '">' + AAT.icon('mail', 22) + '<bdi dir="ltr">' + esc(addr) + '</bdi></a>' +
      (o.copy ? ui.button({ label: o.copyLabel || t('app.copy'), kind: o.night ? 'ghost' : 'line', size: 's', act: 'copy', icon: 'copy', attrs: { 'data-copy': addr, 'data-target': id } }) : '');
  };
  /** AAT.ui.address() → the Taiwan address, ALWAYS in English, LTR, with a red pin */
  ui.address = function () { return '<p class="addr" dir="ltr">' + AAT.icon('pin', 22) + '<span>' + esc(D.config.address.en) + '</span></p>'; };
  /**
   * AAT.ui.appIcons({size:52, tiles:false}) → the six real app icons. WhatsApp and Viber open a chat (new tab);
   * Botim, imo, BiP and LINE copy the number and toast "تم نسخ الرقم".
   */
  ui.appIcons = function (o) {
    o = o || {};
    var size = o.size || 52;
    return '<ul class="apps' + (o.tiles ? ' tiles' : '') + '" style="--app:' + size + 'px">' + D.config.apps.map(function (a) {
      var key = a.name.toLowerCase();
      var icon = a.icon ? '<span class="app-i">' + AAT.img(a.icon, { alt: '', w: size, h: size }) + '</span>' :
        '<span class="app-i sq app-' + key + '">' + AAT.img('img/apps/' + key + '.svg', { alt: '', w: size, h: size }) + '</span>';
      var name = '<span dir="ltr">' + esc(a.name) + '</span>';
      if (a.action === 'chat' && a.url) return '<li><a class="app" href="' + esc(a.url) + '" target="_blank" rel="noopener" title="' + esc(t('app.open_chat') + ' ' + a.name) + '">' + icon + name + '</a></li>';
      return '<li><button class="app" type="button" data-act="copy-num" title="' + esc(t('app.copy_num') + ' · ' + a.name) + '">' + icon + name + '</button></li>';
    }).join('') + '</ul>';
  };
  /**
   * AAT.ui.contactCards({big, editor, cls}) → the three contact cards of §5.5 (phone + apps · e-mail + address · newsletter).
   * big:true → contact page sizes (phone 48px, icons 64px); editor:true adds marwan@ as "رئيس التحرير".
   */
  ui.contactCards = function (o) {
    o = o || {};
    var C = D.config, nl = C.newsletter || {};
    var mailto = 'mailto:' + C.email + '?subject=' + encodeURIComponent(t('app.nl_subject'));
    return '<div class="cc-grid' + (o.big ? ' cc-big' : '') + '">' +
      '<div class="cc"><h3>' + esc(t('app.con_phone')) + '</h3>' + ui.phone() + ui.appIcons({ size: o.big ? 64 : 52 }) + '</div>' +
      '<div class="cc"><h3>' + esc(t('app.con_mail')) + '</h3>' + ui.mail(C.email, { copy: true }) +
      (o.editor ? '<p class="cc-who">' + esc(t('app.editor')) + '</p>' + ui.mail(C.editorEmail, { copy: true }) : '') +
      '<h3>' + esc(t('app.con_addr')) + '</h3>' + ui.address() + '</div>' +
      '<div class="cc"><h3>' + AAT.Lh(nl.title) + '</h3><p>' + AAT.txt(t('app.nl_line')) + '</p>' + ui.mail(C.email) +
      '<div class="btnrow">' + ui.button({ label: t('app.nl_write'), href: mailto, icon: 'mail' }) + ui.button({ label: t('app.nl_copy'), kind: 'line', act: 'copy', attrs: { 'data-copy': C.email, 'data-ok': t('app.copied') } }) + '</div></div></div>';
  };
  /** AAT.ui.contactBand() → the floor contact band above the footer (every page except #contact) */
  ui.contactBand = function () {
    return ui.section({ id: 'contact-band', band: 'floor', title: t('app.con_title'), body: ui.contactCards() });
  };

  /* ---------- header, phone header, sheet, tab bar, footer ---------- */
  var NAV = [
    ['home', '#home'], ['magazine', '#magazine'], ['exhibitions', '#exhibitions'], ['companies', '#companies'],
    ['products', '#products'], ['reading', '#reading'], ['club', '#club'], ['contact', '#contact']
  ];
  var MORE = [['about', '#about'], ['advertise', '#advertise'], ['privacy', '#privacy']];
  function names(short) {
    var C = D.config.siteName;
    var ar = '<span lang="ar" dir="rtl">' + esc(C.ar) + '</span>', en = '<span lang="en" dir="ltr">' + esc(C.en) + '</span>', zh = '<span lang="zh-TW" class="zh">' + esc(C.zh) + '</span>';
    var dot = '<span class="dot" aria-hidden="true">·</span>';
    var list = short ? [AAT.rtl ? ar : en, zh] : (AAT.rtl ? [ar, en, zh] : [en, ar, zh]);
    return list.join(dot);
  }
  /** AAT.issueLine() → "العدد 560 · أكتوبر 2026" / "Issue 560 · October 2026" */
  AAT.issueLine = function () { return t('mb_issue', { n: D.magazine.number, m: AAT.L(D.magazine.month) }); };
  function langMenu() {
    return AAT.langs.map(function (l) {
      var cur = l.code === AAT.lang;
      return '<li><button type="button" data-act="lang" data-lang="' + l.code + '" aria-current="' + cur + '"><span lang="' + l.code + '" dir="' + l.dir + '">' + esc(l.name) + '</span>' + (cur ? '<span class="tick">' + AAT.icon('check', 22) + '</span>' : '') + '</button></li>';
    }).join('');
  }
  /** AAT.ui.header() → ribbon + masthead row (+ language menu) + sticky menu bar. Rendered into #hdr by the app. */
  ui.header = function () {
    var C = D.config, other = AAT.rtl ? 'en' : 'ar';
    return '<a class="skip" href="#view">' + esc(t('app.skip')) + '</a>' +
      '<div class="rib"><div class="wrap rib-in"><p class="rib-names rib-full">' + names(false) + '</p><p class="rib-names rib-short">' + names(true) + '</p><p class="rib-issue">' + AAT.txt(AAT.issueLine()) + '</p></div></div>' +
      '<header class="mast"><div class="wrap mast-in">' +
      '<a class="mast-logo" href="#home" aria-label="' + esc(t('app.home_logo')) + '"><img src="' + esc(C.logo.red) + '" alt="AAT · Ideas For Business" width="192" height="64"></a>' +
      '<div class="mast-group"><b>' + esc(AAT.L(C.groupName)) + '</b><span>' + esc(AAT.L(D.magazine.tagline)) + '</span></div>' +
      '<div class="mast-end">' +
      '<a class="mast-ph" href="tel:' + esc(C.tel) + '" aria-label="' + esc(t('app.call') + ' ' + C.phone) + '"><span class="mast-ph-ic">' + AAT.icon('phone', 22) + '</span><bdi dir="ltr">' + esc(C.phone) + '</bdi></a>' +
      '<button class="btn btn-line btn-s mast-lang" type="button" data-act="lang" data-lang="' + other + '" lang="' + other + '" dir="' + (other === 'ar' ? 'rtl' : 'ltr') + '">' + esc(other === 'ar' ? 'العربية' : 'English') + '</button>' +
      '<div class="lm-wrap"><button class="btn btn-line btn-s mast-globe" type="button" data-act="globe" aria-expanded="false" aria-controls="lm">' + AAT.icon('globe', 22) + '<span>' + esc(t('app.globe')) + '</span></button>' +
      '<ul class="lm" id="lm" hidden>' + langMenu() + '</ul></div>' +
      '<button class="btn btn-red btn-s mast-chat" type="button" data-act="assistant">' + AAT.icon('chat', 22) + '<span>' + esc(t('app.chat')) + '</span></button>' +
      '<button class="btn btn-navy btn-s mast-secs" type="button" data-act="sheet" aria-expanded="false">' + AAT.icon('menu', 22) + '<span>' + esc(t('app.sections')) + '</span></button>' +
      '</div></div></header>' +
      '<nav class="nav" aria-label="' + esc(t('app.menu_label')) + '"><div class="wrap"><ul class="nav-l">' +
      NAV.map(function (n) { return '<li><a href="' + n[1] + '" data-nav="' + n[0] + '">' + esc(t('app.nav_' + n[0])) + '</a></li>'; }).join('') + '</ul></div></nav>';
  };
  /** AAT.ui.tabBar() → the phone bottom tab bar (≤ 960px): المجلة · معارض دولية · المنتجات · اسأل AAT */
  ui.tabBar = function () {
    return '<nav class="tabs" aria-label="' + esc(t('app.sections')) + '">' +
      '<a href="#magazine" data-nav="magazine">' + AAT.icon('book', 26) + '<span>' + esc(t('app.tab_magazine')) + '</span></a>' +
      '<a href="#exhibitions" data-nav="exhibitions">' + AAT.icon('cal', 26) + '<span>' + esc(t('app.tab_exhibitions')) + '</span></a>' +
      '<a href="#products" data-nav="products">' + AAT.icon('box', 26) + '<span>' + esc(t('app.tab_products')) + '</span></a>' +
      '<button type="button" class="ask" data-act="assistant">' + AAT.icon('chat', 26) + '<span>' + AAT.txt(t('app.tab_ask')) + '</span></button></nav>';
  };
  /** AAT.ui.sectionsSheet() → the full-screen "الأقسام" sheet (phone): search, 8 sections, more pages, phone + apps, languages */
  ui.sectionsSheet = function () {
    var cur = AAT.route ? AAT.route.nav : '';
    return '<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h">' +
      '<div class="sheet-head"><div class="wrap"><h2 id="sheet-h">' + esc(t('app.sections')) + '</h2>' + ui.button({ label: t('app.close'), kind: 'ghost', size: 's', act: 'sheet-close', icon: 'close' }) + '</div></div>' +
      '<div class="wrap"><div class="sheet-sec">' + ui.searchBox({ act: 'ask', placeholder: t('app.sheet_search') }) + '</div>' +
      '<nav class="sheet-sec sheet-nav" aria-label="' + esc(t('app.sections')) + '">' + NAV.map(function (n) {
        return '<a href="' + n[1] + '" data-nav="' + n[0] + '"' + (cur === n[0] ? ' class="on" aria-current="page"' : '') + '>' + esc(t('app.nav_' + n[0])) + '</a>';
      }).join('') + '</nav>' +
      '<nav class="sheet-sec sheet-nav" aria-label="' + esc(t('app.more_pages')) + '">' + MORE.map(function (n) { return '<a href="' + n[1] + '"' + (cur === n[0] ? ' class="on" aria-current="page"' : '') + '>' + esc(t('app.nav_' + n[0])) + '</a>'; }).join('') + '</nav>' +
      '<div class="sheet-sec"><h3>' + esc(t('app.con_phone')) + '</h3>' + ui.phone() + '<div style="margin-top:16px">' + ui.appIcons() + '</div></div>' +
      '<div class="sheet-sec sheet-nav"><h3>' + esc(t('app.globe')) + '</h3>' + AAT.langs.map(function (l) {
        return '<button type="button" data-act="lang" data-lang="' + l.code + '" lang="' + l.code + '" dir="' + l.dir + '"' + (l.code === AAT.lang ? ' aria-current="true"' : '') + '>' + esc(l.name) + (l.code === AAT.lang ? '&nbsp;' + AAT.icon('check', 22) : '') + '</button>';
      }).join('') + '</div></div></div>';
  };
  /** AAT.ui.footer() → the navy footer (§5.6) */
  ui.footer = function () {
    var C = D.config;
    return '<footer class="ft"><div class="wrap"><div class="ft-top">' +
      '<div><img class="ft-logo" src="' + esc(C.logo.white) + '" alt="AAT · Ideas For Business" width="216" height="72" loading="lazy"><p class="ft-names">' + names(false) + '</p><p class="ft-claim">' + AAT.Lh(D.about.claim) + '</p></div>' +
      '<div><h2>' + esc(t('app.ft_sections')) + '</h2><ul class="ft-links">' + NAV.concat(MORE).map(function (n) { return '<li><a href="' + n[1] + '">' + esc(t('app.nav_' + n[0])) + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h2>' + esc(t('app.ft_contact')) + '</h2><a class="ft-ph" href="tel:' + esc(C.tel) + '"><bdi dir="ltr">' + esc(C.phone) + '</bdi></a>' +
      '<a class="ft-mail" href="mailto:' + esc(C.email) + '"><bdi dir="ltr">' + esc(C.email) + '</bdi></a><p class="ft-addr" dir="ltr">' + esc(C.address.en) + '</p></div>' +
      '<div><h2>' + esc(t('app.ft_langs')) + '</h2><ul class="ft-links ft-langs">' + AAT.langs.map(function (l) { return '<li><button type="button" data-act="lang" data-lang="' + l.code + '" lang="' + l.code + '" dir="' + l.dir + '">' + esc(l.name) + '</button></li>'; }).join('') + '</ul></div>' +
      '</div><p class="ft-rights">' + esc(t('app.rights')) + '</p></div></footer>';
  };

  /* ======================================================================
     Router (DESIGN.md §6.1)
     ====================================================================== */
  /** head token → module name. Every route of DESIGN.md §6.1. */
  AAT.ROUTES = {
    '': 'home', home: 'home',
    magazine: 'magazine', flip: 'magazine',
    companies: 'companies', company: 'companies',
    exhibitions: 'exhibitions', exhibition: 'exhibitions',
    products: 'products', product: 'products', modern: 'products',
    reading: 'reading', articles: 'reading', news: 'reading', article: 'reading',
    club: 'club',
    about: 'pages', advertise: 'pages', contact: 'pages', privacy: 'pages', '404': 'pages'
  };
  /** head token → which menu item is marked current (null: none) */
  var NAV_OF = { '': 'home', home: 'home', magazine: 'magazine', flip: 'magazine', companies: 'companies', company: 'companies', exhibitions: 'exhibitions', exhibition: 'exhibitions',
    products: 'products', product: 'products', modern: 'products', reading: 'reading', articles: 'reading', news: 'reading', article: 'reading', club: 'club', contact: 'contact',
    about: 'about', advertise: 'advertise', privacy: 'privacy' };
  /** old routes → new (§6.1) */
  var ALIASES = { exhibition: 'exhibitions', 'club-join': 'club', calendar: 'exhibitions', membership: 'club', search: 'home' };
  /**
   * AAT.parse(hash) → ctx: { hash, head, rest, id, parts, module, nav }
   *   "#product-4-2" → head 'product', rest '4-2', id null, parts ['4','2']
   *   "#company-18"  → head 'company', rest '18', id 18
   *   "#exhibitions-ae-food-and-beverage" → head 'exhibitions', rest 'ae-food-and-beverage', parts ['ae','food','and','beverage']
   * Tokens: letters, digits, "." "_" "~" "-". Anything else or an unknown head → home.
   */
  AAT.parse = function (hash) {
    var h = String(hash || '').replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* keep raw */ }
    h = h.trim();
    if (ALIASES[h]) h = ALIASES[h];
    if (!/^[A-Za-z0-9._~-]*$/.test(h)) h = '';
    var i = h.indexOf('-'), head = (i < 0 ? h : h.slice(0, i)).toLowerCase(), rest = i < 0 ? '' : h.slice(i + 1);
    if (!(head in AAT.ROUTES)) { head = 'home'; rest = ''; h = 'home'; }
    return { hash: h, head: head, rest: rest, id: /^\d+$/.test(rest) ? +rest : null, parts: rest ? rest.split('-') : [], module: AAT.ROUTES[head], nav: NAV_OF[head] || null };
  };
  var view, cur = { mod: null, ctx: null };
  function setNavActive(nav) {
    AAT.$$('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === nav;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function fail(e) { setTimeout(function () { throw e; }, 0); }
  /** AAT.render(ctx?) — renders the current (or given) route into #view. Normally called by the router only. */
  AAT.render = function (ctx, opts) {
    opts = opts || {};
    if (!ctx) {
      ctx = AAT.parse(W.location.hash);
      // old or unknown routes: show the canonical hash (#exhibition → #exhibitions, #xyz → #home)
      var raw = String(W.location.hash || '').replace(/^#/, '');
      if (raw && raw !== ctx.hash) { try { W.history.replaceState(W.history.state, '', '#' + ctx.hash); } catch (e) { /* ignore */ } }
    }
    ctx.lang = AAT.lang; ctx.o = AAT.o; ctx.rtl = AAT.rtl; ctx.prev = cur.ctx;
    var mod = AAT.pages[ctx.module];
    closeOverlays();
    // same module and it can update in place (filters, reader pages): no full re-render
    if (!opts.full && mod && cur.mod === mod && cur.ctx && cur.ctx.lang === ctx.lang && typeof mod.update === 'function') {
      var handled = false;
      try { handled = mod.update(ctx, view) === true; } catch (e) { fail(e); }
      if (handled) { AAT.route = ctx; cur.ctx = ctx; setNavActive(ctx.nav); return; }
    }
    if (cur.mod && typeof cur.mod.unmount === 'function') { try { cur.mod.unmount(); } catch (e) { fail(e); } }
    var html = null;
    if (mod && typeof mod.render === 'function') { try { html = mod.render(ctx); } catch (e) { fail(e); html = null; } }
    if (html == null) { // module missing, item not found or render error → the 404 page
      var P = AAT.pages.pages; ctx = Object.assign({}, ctx, { head: '404', module: 'pages', nav: null, notFound: true }); mod = P;
      html = P && P.render ? P.render(ctx) : '';
    }
    AAT.route = ctx; cur.ctx = ctx; cur.mod = mod;
    var chrome = !(mod && mod.chrome && mod.chrome(ctx) === false);
    document.documentElement.classList.toggle('no-chrome', !chrome);
    view.innerHTML = html;
    var band = chrome && !(mod && mod.contactBand && mod.contactBand(ctx) === false);
    var slot = AAT.$('#contact-slot');
    if (slot) slot.innerHTML = band ? ui.contactBand() : '';
    setNavActive(ctx.nav);
    var h1 = AAT.$('h1', view);
    var title = mod && mod.title ? mod.title(ctx) : (h1 ? h1.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '');
    document.title = (title ? title + ' · ' : '') + 'AAT';
    if (!opts.keepScroll) { try { W.scrollTo(0, 0); } catch (e) { /* ignore */ } }
    if (h1 && !opts.noFocus) { h1.setAttribute('tabindex', '-1'); try { h1.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    if (mod && typeof mod.mount === 'function') { try { mod.mount(ctx, view); } catch (e) { fail(e); } }
    Object.keys(AAT.pages).forEach(function (k) { var m = AAT.pages[k]; if (m && typeof m.onRoute === 'function') { try { m.onRoute(ctx); } catch (e) { fail(e); } } });
  };
  /** AAT.go('#exhibitions-ae') — navigate (re-renders even when the hash is already current) */
  AAT.go = function (hash) {
    hash = '#' + String(hash).replace(/^#/, '');
    if (W.location.hash === hash || (hash === '#home' && !W.location.hash)) AAT.render(null, { full: true });
    else W.location.hash = hash;
  };
  /**
   * AAT.setHash('exhibitions-ae-food-and-beverage') — record a filter/page in the hash with history.replaceState,
   * WITHOUT re-rendering (use for filters and reader page turns). Safe when replaceState is unavailable.
   */
  AAT.setHash = function (hash) {
    hash = '#' + String(hash).replace(/^#/, '');
    try { W.history.replaceState(W.history.state, '', hash); } catch (e) { /* sandboxed viewer: ignore */ }
    var ctx = AAT.parse(hash); ctx.lang = AAT.lang; ctx.o = AAT.o; ctx.rtl = AAT.rtl;
    AAT.route = ctx; cur.ctx = ctx; setNavActive(ctx.nav);
  };

  /* ======================================================================
     Chrome rendering, language switching, menu fitting
     ====================================================================== */
  function renderChrome() {
    var h = AAT.$('#hdr'), f = AAT.$('#ftr'), tb = AAT.$('#tabs');
    if (h) h.innerHTML = ui.header();
    if (f) f.innerHTML = ui.footer();
    if (tb) tb.innerHTML = ui.tabBar();
    fitNav();
  }
  /** keep the 8 menu items in one row when they fit, otherwise two even rows of 4 (never 7 + 1, never hidden) */
  function fitNav() {
    var ul = AAT.$('.nav-l'); if (!ul || W.innerWidth <= 960) return;
    ul.classList.remove('two');
    if (getComputedStyle(ul).display === 'grid') return; // CSS already uses two rows at this width
    if (ul.scrollWidth > ul.clientWidth + 1) ul.classList.add('two');
  }
  var ZH_FONTS = { 'zh-TW': 'Noto+Sans+TC', 'zh-CN': 'Noto+Sans+SC' };
  function applyLang() {
    var de = document.documentElement;
    de.lang = AAT.lang; de.dir = AAT.dir;
    var fam = ZH_FONTS[AAT.lang];
    if (fam && !document.getElementById('font-' + AAT.lang)) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.id = 'font-' + AAT.lang;
      l.href = 'https://fonts.googleapis.com/css2?family=' + fam + ':wght@400;700&display=swap';
      document.head.appendChild(l);
    }
  }
  /** AAT.setLang(code) — switch language without reload: sets lang/dir, stores the choice, re-renders chrome + route */
  AAT.setLang = function (code) {
    if (!validLang(code)) return;
    setLangVars(code); applyLang();
    try { W.localStorage.setItem('aat3.lang', code); } catch (e) { /* storage blocked: fine */ }
    renderChrome();
    Object.keys(AAT.pages).forEach(function (k) { var m = AAT.pages[k]; if (m && typeof m.onLang === 'function') { try { m.onLang(code); } catch (e) { fail(e); } } });
    AAT.render(null, { full: true, keepScroll: true, noFocus: true });
  };

  /* ======================================================================
     Overlays: language menu, sections sheet
     ====================================================================== */
  var lastFocus = null;
  function closeOverlays() {
    var lm = AAT.$('#lm'); if (lm && !lm.hidden) { lm.hidden = true; var g = AAT.$('.mast-globe'); if (g) g.setAttribute('aria-expanded', 'false'); }
    var s = AAT.$('#sheet-slot'); if (s && s.innerHTML) { s.innerHTML = ''; document.documentElement.classList.remove('locked'); var b = AAT.$('.mast-secs'); if (b) b.setAttribute('aria-expanded', 'false'); if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }
  /** AAT.closeOverlays() — closes the language menu and the sections sheet */
  AAT.closeOverlays = closeOverlays;

  /* ======================================================================
     Delegated events: one click handler + one submit handler for the whole page
     ====================================================================== */
  // core actions (modules add theirs: AAT.acts['ex-month'] = function (el, ev, ctx) {...})
  AAT.acts.lang = function (el) { closeOverlays(); AAT.setLang(el.getAttribute('data-lang')); };
  AAT.acts.globe = function (el) {
    var lm = AAT.$('#lm'); if (!lm) return;
    lm.hidden = !lm.hidden; el.setAttribute('aria-expanded', String(!lm.hidden));
    if (!lm.hidden) { var b = AAT.$('button', lm); if (b) b.focus(); }
  };
  AAT.acts.sheet = function (el) {
    var s = AAT.$('#sheet-slot'); if (!s) return;
    lastFocus = el; s.innerHTML = ui.sectionsSheet(); document.documentElement.classList.add('locked'); el.setAttribute('aria-expanded', 'true');
    var c = AAT.$('#sheet [data-act="sheet-close"]'); if (c) c.focus();
  };
  AAT.acts['sheet-close'] = function () { closeOverlays(); };
  AAT.acts.assistant = function (el) { closeOverlays(); AAT.openAssistant(el.getAttribute('data-q') || ''); };
  AAT.acts.ask = function (el) {
    var q = el.getAttribute('data-q');
    if (q == null && el.tagName === 'FORM') { var inp = el.elements.q || AAT.$('input', el); q = inp ? inp.value.trim() : ''; }
    closeOverlays(); AAT.openAssistant(q || '');
  };
  AAT.acts.copy = function (el) {
    var tgt = el.getAttribute('data-target'); AAT.copy(el.getAttribute('data-copy') || '', el.getAttribute('data-ok') || null, tgt ? document.getElementById(tgt) : null);
  };
  AAT.acts['copy-num'] = function (el) { AAT.copy(D.config.phone, AAT.t('app.num_copied'), el.closest('.cc, .sheet-sec, section') && AAT.$('.bigph', el.closest('.cc, .sheet-sec, section'))); };
  AAT.acts.go = function (el) { AAT.go(el.getAttribute('data-href')); };
  AAT.acts.toast = function (el) { AAT.toast(el.getAttribute('data-msg') || ''); };

  function onClick(ev) {
    var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
    // clicks outside the language menu close it
    var lm = AAT.$('#lm'); if (lm && !lm.hidden && !ev.target.closest('.lm-wrap')) { lm.hidden = true; var g = AAT.$('.mast-globe'); if (g) g.setAttribute('aria-expanded', 'false'); }
    if (el && el.tagName !== 'FORM') {
      var fn = AAT.acts[el.getAttribute('data-act')];
      if (fn) { ev.preventDefault(); fn(el, ev, AAT.route); }
      return;
    }
    // a link to the route we are on: re-render from the top (hashchange would not fire)
    var a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (a && !ev.defaultPrevented && !ev.metaKey && !ev.ctrlKey) {
      var href = a.getAttribute('href');
      if (href === '#view') { ev.preventDefault(); if (view) view.focus(); return; } // skip link: never a route
      closeOverlays();
      if (href === W.location.hash || (href === '#home' && !W.location.hash)) { ev.preventDefault(); AAT.render(null, { full: true }); }
    }
  }
  function onSubmit(ev) {
    var f = ev.target; if (!f || f.tagName !== 'FORM') return;
    ev.preventDefault(); // forms never leave the page and never claim to have sent anything
    var fn = AAT.acts[f.getAttribute('data-act')];
    if (fn) fn(f, ev, AAT.route);
  }
  function onKey(ev) { if (ev.key === 'Escape') closeOverlays(); }

  /* ======================================================================
     Boot (called by js/boot.js after every module has registered)
     ====================================================================== */
  var booted = false;
  /** AAT.boot() — applies the language, renders chrome and the route from location.hash, wires the events. Idempotent. */
  AAT.boot = function () {
    if (booted) return; booted = true;
    view = AAT.$('#view');
    setLangVars(readLang()); applyLang();
    renderChrome();
    Object.keys(AAT.pages).forEach(function (k) { var m = AAT.pages[k]; if (m && typeof m.init === 'function') { try { m.init(); } catch (e) { fail(e); } } });
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKey);
    W.addEventListener('hashchange', function () { AAT.render(); });
    W.addEventListener('resize', AAT.debounce(fitNav, 120));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav, function () {});
    AAT.render(null, { noFocus: true });
  };
}());
