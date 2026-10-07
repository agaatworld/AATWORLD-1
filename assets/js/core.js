/* AAT World v2 — core: utilities, safe storage, languages, data model.
   No DOM writes here. Everything in this file is a pure function or a read-only lookup,
   so it can be unit-tested in Node (see tests/unit.test.js). */
(function (root) {
  "use strict";
  var W = root.window || root;
  var D = W.AAT_DATA, IS = W.AAT_ISSUE, I18N = W.AAT_I18N || {}, TX = W.AAT_TX || {};

  /* ---------- utilities ---------- */
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  /* only http(s) links from data are ever placed in href */
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || "")) ? String(u) : ""; }
  function parseDate(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }

  var store = {
    get: function (k, d) { try { var v = W.localStorage.getItem("aat2." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { W.localStorage.setItem("aat2." + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- languages ---------- */
  var LANGS = [["en", "English", "EN"], ["ar", "العربية", "ع"], ["zh-TW", "繁體中文", "繁"], ["zh-CN", "简体中文", "简"], ["ms", "Bahasa Melayu", "BM"]];
  var LOCALE = { en: "en-GB", ar: "ar-u-nu-latn", "zh-TW": "zh-TW", "zh-CN": "zh-CN", ms: "ms-MY" };
  function isLang(l) { return LANGS.some(function (x) { return x[0] === l; }); }
  function detectLang(nav) {
    var n = String(nav || "").toLowerCase();
    if (n.indexOf("ar") === 0) return "ar";
    if (n === "zh-tw" || n === "zh-hk" || n.indexOf("zh-hant") === 0) return "zh-TW";
    if (n.indexOf("zh") === 0) return "zh-CN";
    if (n.indexOf("ms") === 0) return "ms";
    return "en";
  }
  var state = { lang: "en" };
  function setLang(l) { state.lang = isLang(l) ? l : "en"; return state.lang; }
  function dir() { return state.lang === "ar" ? "rtl" : "ltr"; }

  /* UI text. A missing key is shown as ⟦key⟧ so tests (and people) catch it at once. */
  function t(key, vars) {
    var dict = I18N[state.lang] || {}, s = dict[key];
    if (s == null) s = (I18N.en || {})[key];
    if (s == null) return "⟦" + key + "⟧";
    if (vars && typeof s === "string") Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  /* Content text: {en, ar, …} objects; other languages fall back to the translation map, then English. */
  function L(o) {
    if (o == null) return "";
    if (typeof o === "string") return (TX[state.lang] && TX[state.lang][o]) || o;
    if (o[state.lang] != null) return o[state.lang];
    var m = TX[state.lang];
    if (m && o.en != null && m[o.en] != null) return m[o.en];
    return o.en != null ? o.en : "";
  }
  function fmtDate(s) { try { return new Intl.DateTimeFormat(LOCALE[state.lang], { day: "numeric", month: "long", year: "numeric" }).format(parseDate(s)); } catch (e) { return s; } }
  function fmtRange(a, b) {
    try {
      var f = new Intl.DateTimeFormat(LOCALE[state.lang], { day: "numeric", month: "short", year: "numeric" });
      return f.formatRange ? f.formatRange(parseDate(a), parseDate(b)) : f.format(parseDate(a)) + " – " + f.format(parseDate(b));
    } catch (e) { return a + " – " + b; }
  }

  /* ---------- data model ---------- */
  var TIER_RANK = { cover: 0, back: 1, spread: 2, premium: 3, full: 4 };
  function tierOf(a) { return a.page === 2 ? "cover" : a.page === 100 ? "back" : (a.pages && a.pages.length > 1) ? "spread" : a.page <= 10 ? "premium" : "full"; }
  function byTier(list) { return list.slice().sort(function (a, b) { return (TIER_RANK[a.tier] - TIER_RANK[b.tier]) || (a.page - b.page); }); }

  /* ---------- customisation layer ----------
     The public site only READS window.AAT_CUSTOM (assets/js/custom.js). It has no editing code.
     AAT Studio (a separate, private link) writes that file. */
  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  var BASE = { D: clone(D), IS: clone(IS), X: clone(W.AAT_ADS_EXTRA || []), P: clone(W.AAT_PRODUCTS || {}), PX: clone(W.AAT_PROD_EXTRA || {}), CX: clone(W.AAT_CATS_EXTRA || {}), ART: clone(W.AAT_ARTICLES || []), NB: clone(W.AAT_NEWS_BODY || []), LOGOS: clone(W.AAT_LOGOS || {}), I18N: clone(I18N) };
  var custom = {};
  var companies = [], cats = {}, products = {}, logos = {}, articles = [], newsBody = [];
  function restore(target, src) { Object.keys(target).forEach(function (k) { delete target[k]; }); var c = clone(src); Object.keys(c).forEach(function (k) { target[k] = c[k]; }); }
  function patchList(list, patch, idOf) {
    if (!patch) return list;
    var out = list.map(function (x) { var id = String(idOf(x)); return Object.prototype.hasOwnProperty.call(patch, id) ? patch[id] : x; }).filter(function (x) { return x != null; });
    Object.keys(patch).forEach(function (id) { if (patch[id] && !list.some(function (x) { return String(idOf(x)) === id; })) out.push(patch[id]); });
    return out;
  }
  function setCustom(c) {
    custom = (c && typeof c === "object") ? c : {};
    if (!IS || !D) return;
    restore(D, BASE.D); restore(IS, BASE.IS);
    LANGS.forEach(function (l) { I18N[l[0]] = clone(BASE.I18N[l[0]] || {}); var o = custom.i18n && custom.i18n[l[0]]; if (o) Object.keys(o).forEach(function (k) { if (typeof o[k] === "string") I18N[l[0]][k] = o[k]; }); });
    var st = custom.site || {};
    if (st.config) Object.keys(st.config).forEach(function (k) { if (k === "youtube") D.config.social.youtube = st.config[k]; else D.config[k] = st.config[k]; });
    if (st.magazine) Object.keys(st.magazine).forEach(function (k) { D.magazine[k] = st.magazine[k]; });
    if (st.issue && +st.issue.pages > 0) IS.pages = Math.min(400, Math.round(+st.issue.pages));
    var col = custom.col || {};
    D.events = patchList(D.events, col.events, function (x) { return x.id; });
    /* news: title and picture live in one list, date/source/body in another; the Studio edits them as one item */
    var news = D.news.map(function (n, i) { var b = BASE.NB[i] || {}; return { id: "n" + i, img: n.img + ".jpg", title: n.title, only: n.only, date: b.date, source: b.source, body: b.body || {} }; });
    news = patchList(news, col.news, function (x) { return x.id; });
    D.news = news.map(function (n) { return { id: n.id, img: n.img, title: n.title, only: n.only }; });
    newsBody.length = 0; news.forEach(function (n) { newsBody.push({ date: n.date, source: n.source, body: n.body || {} }); });
    articles.length = 0; patchList(clone(BASE.ART), col.articles, function (x) { return x.id; }).forEach(function (a) { a.pages = a.pages && a.pages.length ? a.pages : [1]; a.title = a.title || {}; a.sum = a.sum || {}; a.body = a.body || {}; articles.push(a); });
    Object.keys(cats).forEach(function (k) { delete cats[k]; });
    Object.keys(IS.cats).forEach(function (k) { cats[k] = IS.cats[k]; });
    var CX = BASE.CX; Object.keys(CX).forEach(function (k) { if (!cats[k]) cats[k] = clone(CX[k]); });
    Object.keys(logos).forEach(function (k) { delete logos[k]; }); Object.keys(BASE.LOGOS).forEach(function (k) { logos[k] = BASE.LOGOS[k]; });
    var seen = {}, all = [];
    IS.ads.concat(clone(BASE.X)).forEach(function (a) { if (seen[a.page]) return; seen[a.page] = 1; all.push(a); });
    all = patchList(all, col.companies, function (x) { return x.page; });
    companies.length = 0; Object.keys(products).forEach(function (k) { delete products[k]; });
    all.forEach(function (a) {
      a.page = +a.page; a.tier = a.tierSet || tierOf(a); a.hot = a.hot || []; a.city = a.city || {}; a.about = a.about || {}; if (!cats[a.cat]) a.cat = Object.keys(cats)[0];
      if (a.logo) logos[a.page] = a.logo;
      var src = a.products ? { items: a.products } : (BASE.P[a.page] && BASE.P[a.page].items.length) ? BASE.P[a.page] : BASE.PX[a.page];
      products[a.page] = src ? clone(src.items) : []; if (a.products) products[a.page].forEach(function (it) { if (!it.img) it.img = a.image || a.logo || "logo.png"; }); companies.push(a);
    });
    companies.sort(function (a, b) { return a.page - b.page; });
  }
  function getCustom() { return custom; }
  setCustom(W.AAT_CUSTOM || null);
  function company(p) { for (var i = 0; i < companies.length; i++) if (companies[i].page === +p) return companies[i]; return null; }
  function companyImg(c, p) { return c.image ? img(c.image) : inMagazine(c) ? img("mag/p" + (p || c.page) + ".jpg") : img(c.logo || "logo.png"); }
  function hasPage(c) { return !!c.image || inMagazine(c); }
  function inMagazine(c) { return !c.image && c.page >= 1 && c.page <= (IS.pages || 0); }
  function companyPages(c) { return c.pages && c.pages.length ? c.pages : [c.page]; }
  function logoOf(c) { return logos[c.page] || null; }
  function productsOf(c) { return products[c.page] || []; }
  function productDesc(c, it) { if (it.d) return L(it.d); if (it.hk != null && c.hot[it.hk]) return L(c.hot[it.hk].d); return ""; }
  /* flat product list, web photos first, ordered by the company's print position */
  function allProducts() {
    var out = [];
    byTier(companies).forEach(function (c) { productsOf(c).forEach(function (it, k) { if (it.img) out.push({ c: c, it: it, k: k }); }); });
    return out.sort(function (a, b) { return (a.it.src === "web" ? 0 : 1) - (b.it.src === "web" ? 0 : 1); });
  }
  function usedCats() { return Object.keys(cats).filter(function (k) { return companies.some(function (c) { return c.cat === k && productsOf(c).length; }); }); }
  function matchProduct(p, q, cat) {
    if (cat && p.c.cat !== cat) return false;
    if (!q) return true;
    var hay = (p.it.n + " " + productDesc(p.c, p.it) + " " + p.c.company + " " + L(cats[p.c.cat])).toLowerCase();
    return hay.indexOf(String(q).toLowerCase()) > -1;
  }
  /* Arabic site reads the Arabic articles; every other language reads the ones that have English text */
  function articlesFor(lang) { if (lang !== "ar") return []; return articles.filter(function (a) { return a.lang === "both" || a.lang === "ar"; }); }
  function article(id) { for (var i = 0; i < articles.length; i++) if (articles[i].id === id) return articles[i]; return null; }
  function articleLang() { return state.lang === "ar" ? "ar" : "en"; }

  /* exhibitions that start between today and three months from today (or are running now) */
  function eventsWindow(now, months) {
    var from = new Date(now.getFullYear(), now.getMonth(), now.getDate()), to = new Date(from); to.setMonth(to.getMonth() + (months || 3));
    return (D.events || []).filter(function (e) { return parseDate(e.end) >= from && parseDate(e.start) <= to; })
      .sort(function (a, b) { return parseDate(a.start) - parseDate(b.start); });
  }
  function eventById(id) { var l = D.events || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function daysUntil(e, now) { var a = new Date(now.getFullYear(), now.getMonth(), now.getDate()); return Math.round((parseDate(e.start) - a) / 864e5); }

  var INDUSTRIES = [
    { slug: "automation", img: "u8", ind: ["machinery"], cats: ["machinery", "plastics"] },
    { slug: "cnc", img: "u15", ind: ["machinery"], cats: ["machinery", "tools"] },
    { slug: "food", img: "u91", ind: ["food"], cats: ["food"] },
    { slug: "tools", img: "u68", ind: ["hardware"], cats: ["tools", "hardware"] },
    { slug: "e-mobility", img: "u82", ind: ["mobility"], cats: ["auto"] },
    { slug: "medical", img: "u29", ind: ["health"], cats: ["medical", "fitness"] },
    { slug: "solar", img: "u10", ind: ["energy"], cats: [] },
    { slug: "electronics", img: "u51", ind: ["electronics"], cats: [] },
    { slug: "marine", img: "u58", ind: ["marine"], cats: [] },
    { slug: "steel", img: "u87", ind: ["hardware"], cats: ["hardware", "tools"] },
    { slug: "manufacturing", img: "u20", ind: ["machinery"], cats: ["plastics", "machinery", "auto"] },
    { slug: "ports", img: "u2", ind: [], cats: [] }
  ];
  function industry(slug) { for (var i = 0; i < INDUSTRIES.length; i++) if (INDUSTRIES[i].slug === slug) return INDUSTRIES[i]; return null; }

  /* ---------- routes ---------- */
  var ALIAS = { membership: "club", suppliers: "products", sourcing: "contact", services: "contact", subscribe: "home", "": "home" };
  function parseRoute(hash) {
    var h = String(hash || "").replace(/^#\/?/, "");
    try { h = decodeURIComponent(h); } catch (e) { /* keep raw */ }
    h = h.replace(/[^\w.\-~]/g, "");
    if (Object.prototype.hasOwnProperty.call(ALIAS, h)) h = ALIAS[h];
    var m;
    if ((m = /^(?:company|ad)-(\d+)(?:\.(page|products|contact|company))?$/.exec(h))) return { v: "company", id: +m[1], tab: m[2] === "company" ? "contact" : (m[2] || "page"), nav: "magazine" };
    if ((m = /^product-(\d+)-(\d+)$/.exec(h))) return { v: "product", id: +m[1], k: +m[2], nav: "products" };
    if ((m = /^products(?:\.([\w-]+))?$/.exec(h))) return { v: "products", cat: m[1] || "", nav: "products" };
    if ((m = /^industry-([\w-]+)$/.exec(h))) return { v: "industry", id: m[1], nav: "products" };
    if ((m = /^(?:article|read)-([\w-]+)$/.exec(h))) return { v: "article", id: m[1], nav: "articles" };
    if ((m = /^modern-(\d+)$/.exec(h))) return { v: "modern", id: +m[1], nav: "products" };
    if ((m = /^news-(\d+)$/.exec(h))) return { v: "newsitem", id: +m[1], nav: "news" };
    if ((m = /^(?:exhibition|event)-([\w-]+)$/.exec(h))) return { v: "exhibition", id: m[1], nav: "exhibitions" };
    if ((m = /^flip(?:-(\d+))?$/.exec(h))) return { v: "flip", page: m[1] ? +m[1] : 1, nav: "magazine" };
    if (/^request-/.test(h)) return { v: "contact", nav: "contact" };
    var simple = { home: "", magazine: "magazine", articles: "articles", news: "news", modern: "products", exhibitions: "exhibitions", club: "club", about: "about", advertise: "advertise", contact: "contact", privacy: "" };
    if (Object.prototype.hasOwnProperty.call(simple, h)) return { v: h, nav: simple[h] };
    return { v: "404", nav: "" };
  }

  /* ---------- contact links ---------- */
  function waLink(text) { return "https://wa.me/" + D.config.whatsapp + (text ? "?text=" + encodeURIComponent(text) : ""); }
  function mailLink(to, subject, body) { return "mailto:" + to + "?subject=" + encodeURIComponent(subject || "AAT World") + (body ? "&body=" + encodeURIComponent(body) : ""); }
  /* picture address: files of the site, pictures replaced in the Studio, uploaded pictures ("media:id") or full addresses */
  function img(p) {
    p = String(p == null ? "" : p);
    if (custom.img && custom.img[p]) p = custom.img[p];
    if (p.indexOf("media:") === 0) return (custom.media && custom.media[p.slice(6)]) || "";
    if (/^(https?:|data:image\/|\/|assets\/)/.test(p)) return p;
    return "assets/img/" + p;
  }

  root.AAT = {
    D: D, IS: IS, esc: esc, pad2: pad2, clamp: clamp, safeUrl: safeUrl, parseDate: parseDate, store: store,
    LANGS: LANGS, isLang: isLang, detectLang: detectLang, state: state, setLang: setLang, dir: dir, t: t, L: L, fmtDate: fmtDate, fmtRange: fmtRange,
    companies: companies, cats: cats, company: company, companyPages: companyPages, logoOf: logoOf, productsOf: productsOf, productDesc: productDesc,
    allProducts: allProducts, usedCats: usedCats, matchProduct: matchProduct, byTier: byTier, tierOf: tierOf,
    articles: articles, articlesFor: articlesFor, article: article, articleLang: articleLang, newsBody: newsBody,
    eventsWindow: eventsWindow, eventById: eventById, daysUntil: daysUntil, INDUSTRIES: INDUSTRIES, industry: industry,
    parseRoute: parseRoute, waLink: waLink, mailLink: mailLink, img: img, companyImg: companyImg, hasPage: hasPage, inMagazine: inMagazine, setCustom: setCustom, getCustom: getCustom, clone: clone, BASE: BASE
  };
})(typeof window !== "undefined" ? window : globalThis);
