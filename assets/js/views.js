/* AAT World v2 — pages. One function per route; each returns { title, html }. */
(function (W) {
  "use strict";
  var A = W.AAT, U = A.ui, esc = A.esc, t = A.t, L = A.L, img = A.img, ic = U.ic, D = A.D, IS = A.IS;
  function LA(o) { var l = (o && (o[A.state.lang] || o.en)) || []; var m = (W.AAT_TX || {})[A.state.lang]; return l.map(function (x) { return (m && !o[A.state.lang] && m[x]) || x; }); }
  function sec(cls, inner) { return '<section class="sec ' + (cls || "") + '"><div class="wrap">' + inner + "</div></section>"; }
  /* news for the current language: items marked for one language appear only in it, newest of them first */
  function newsList() { var lg = A.state.lang, own = [], rest = []; D.news.forEach(function (n, i) { if (n.only) { if ((n.only === "ar") === (lg === "ar")) own.push([n, i]); } else rest.push([n, i]); }); return own.concat(rest); }
  function newsCards(skip, max) { return newsList().filter(function (p) { return p[1] !== skip; }).slice(0, max || 999).map(function (p) { return U.newsCard(p[0], p[1]); }).join(""); }
  function paras(list) {
    return (list || []).map(function (p) {
      if (/^##\s*/.test(p)) return '<h2 class="h3">' + esc(p.replace(/^##\s*/, "")) + "</h2>";
      if (/^[•\-]\s*/.test(p)) return '<p class="bullet">' + esc(p.replace(/^[•\-]\s*/, "")) + "</p>";
      return "<p>" + esc(p) + "</p>";
    }).join("");
  }

  /* ---------- home ---------- */
  function slider() {
    var list = A.byTier(A.companies).filter(function (c) { return c.tier !== "full"; }).slice(0, 6);
    return '<div class="sl" data-sl data-i="0"><div class="sl-media">' + list.map(function (c, i) { return '<a class="sl-img' + (i ? "" : " on") + '" href="#company-' + c.page + '" tabindex="-1" aria-hidden="true"><img src="' + A.companyImg(c) + '" alt="" loading="' + (i ? "lazy" : "eager") + '"></a>'; }).join("") + "</div>" +
      '<div class="sl-body">' + list.map(function (c, i) {
        var lg = A.logoOf(c);
        return '<article class="sl-s' + (i ? "" : " on") + '"' + (i ? ' aria-hidden="true"' : "") + '><div class="sl-top">' + U.tierBadge(c) + '<span class="sl-n" dir="ltr">' + A.pad2(i + 1) + " / " + A.pad2(list.length) + "</span></div>" + (lg ? '<img class="sl-logo" src="' + img(lg) + '" alt="">' : "") +
          '<h3 class="sl-name">' + esc(c.company) + '</h3><p class="sl-meta">' + esc(L(A.cats[c.cat])) + " · " + esc(L(c.city)) + '</p><p class="sl-about">' + esc(L(c.about)) + '</p><div class="row"><a class="btn btn-red" href="#company-' + c.page + '">' + t("sl_view") + '</a><a class="btn btn-line" href="#company-' + c.page + '.products">' + t("sl_products") + "</a></div></article>";
      }).join("") + '</div><div class="sl-nav" role="tablist">' + list.map(function (c, i) { return '<button type="button" role="tab" class="sl-t' + (i ? "" : " on") + '" data-act="sl" data-i="' + i + '" aria-selected="' + !i + '" aria-label="' + esc(c.company) + '"><b dir="ltr">' + A.pad2(i + 1) + '</b><i><u></u></i></button>'; }).join("") + "</div></div>";
  }
  function home() {
    var M = D.magazine, ev = A.eventsWindow(new Date(), 3).filter(function (e) { return !e.ext; }), nx = ev[0], arts = A.articlesFor(A.state.lang).filter(function (a) { return A.state.lang === "ar" || !a.fresh; });
    var logos = A.byTier(A.companies).filter(function (c) { return A.logoOf(c); }).map(function (c) { return '<a class="lg" href="#company-' + c.page + '" title="' + esc(c.company) + '"><img src="' + img(A.logoOf(c)) + '" alt="' + esc(c.company) + '" loading="lazy"></a>'; }).join("");
    var html =
      '<section class="hero"><div class="wrap hero-g"><div class="hero-c">' +
      '<p class="kick">' + esc(t("mb_issue", { n: M.issue, m: L(M.month) })) + "</p>" +
      '<div class="yrs"><span class="sr">' + t("yrs_sr") + '</span><b class="yrs-n" aria-hidden="true" data-roll>' + M.years + '</b><span class="yrs-w" aria-hidden="true">' + t("yrs_word") + '</span><span class="yrs-s" aria-hidden="true">' + t("yrs_since") + "</span></div>" +
      '<h1 class="h0" tabindex="-1"><span class="scrib">' + t("h82_first") + '<svg viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9 C 60 3, 120 12, 180 6 S 262 3, 297 8"/></svg></span></h1>' +
      '<p class="lead">' + t("hero_lead") + '</p><div class="row"><a class="btn btn-adv btn-lg" href="#advertise">' + ic("megaphone", 20) + t("adv_btn") + '</a><a class="btn btn-line btn-lg" href="#flip">' + ic("book", 18) + t("mb_read", { n: M.issue }) + "</a></div></div>" +
      '<a class="hero-cover" href="#flip" aria-label="' + esc(t("fl_open")) + '"><span class="book"><img src="' + img("magazine-559.jpg") + '" alt="' + esc(L(M.name)) + '" width="617" height="768"></span><span class="hero-cover-t">' + ic("book", 16) + t("fl_open") + "</span></a></div></section>" +

      '<section class="live"><div class="wrap live-g"><div class="live-map">' + U.tradeMap() + '</div><div class="live-s"><p class="live-k"><i></i>' + t("rp_live") + '</p><h2 class="h2">' + t("rn_line") + "</h2>" +
      '<div class="live-kpi"><a href="#flip"><b class="count" data-to="' + M.issue + '">' + M.issue + "</b><span>" + t("mb_f2") + '</span></a><a href="#about"><b>1982</b><span>' + t("mb_f1") + "</span></a>" +
      (nx ? '<a href="#exhibition-' + nx.id + '"><b>' + Math.max(A.daysUntil(nx, new Date()), 0) + "</b><span>" + t("rp_days") + " " + esc(nx.name) + "</span></a>" : "") + "</div></div></div></section>" +

      '<section class="sec logos"><div class="wrap">' + U.head(t("lw_kicker"), t("lw_title"), ["magazine", t("mb_brands")]) + '</div><div class="lw" dir="ltr"><div class="lw-row">' + logos + logos.replace(/<a class="lg"/g, '<a class="lg" tabindex="-1" aria-hidden="true"') + "</div></div></section>" +

      sec("", U.head(t("fa_kicker"), t("fa_title"), ["advertise", t("fa_how")]) + slider()) +

      sec("alt", U.head(t("cats_kicker"), t("cats_title"), ["products", t("hot_all")]) + '<div class="ind">' + A.INDUSTRIES.map(function (x) { return '<a class="ind-c" href="#industry-' + x.slug + '"><img src="' + img("u/" + x.img + ".jpg") + '" alt="" loading="lazy"><span><b>' + esc(t("ln_" + x.img)) + "</b><small>" + esc(t("ln_" + x.img + "_d")) + "</small></span></a>"; }).join("") + "</div>") +

      sec("", U.head(t("hot_kicker"), t("hot_title"), ["products", t("hot_all")]) + '<div class="pg">' + A.allProducts().slice(0, 8).map(U.productCard).join("") + "</div>") +

      (arts.length ? sec("alt", U.head(t("ar_nav"), t("art_home_t"), ["articles", t("ar_back")]) + '<div class="ag">' + arts.slice(0, 5).map(function (a, i) { return U.articleCard(a, i === 0); }).join("") + "</div>") : "") +

      sec("", U.head(t("news_kicker"), t("news_title"), ["news", t("news_btn")]) + '<div class="ng">' + newsCards(-1, 3) + "</div>") +

      (ev.length ? sec("alt", U.head(t("shows_kicker"), t("x_ex_window"), ["exhibitions", t("nav_exhibitions")]) + '<div class="el">' + ev.slice(0, 4).map(U.eventRow).join("") + "</div>") : "") +

      sec("", '<div class="am"><div><p class="kick">' + t("am_kicker") + '</p><h2 class="h2 split">' + t("am_title") + '</h2><p class="lead">' + t("am_p1") + "</p><p>" + t("am_p2") + "</p><p>" + t("am_p3") + '</p><a class="more" href="#about">' + t("am_more") + '<span class="flip">' + ic("arrow", 16) + "</span></a></div>" +
        '<div class="am-p"><div class="am-c dark"><small>' + t("am_founder") + "</small><b>" + (A.state.lang === "ar" ? "محمد مروان فتال" : "Muhammad Marwan Fattal") + '</b><i>1982</i></div><div class="am-c"><small>' + t("am_ceo") + "</small><b>" + (A.state.lang === "ar" ? "مروان أنس" : "Marwan Anas") + "</b></div>" +
        '<a class="am-c club" href="#club"><small>AATBC</small><b>' + t("cb_more") + "</b></a></div></div>") +

      '<section class="sec cta"><div class="wrap cta-in"><div><h2 class="h2">' + t("chat_person") + "</h2><p>" + t("tn_p2") + "</p></div>" + U.contactButtons("", true) + "</div></section>";
    return { title: "", html: html };
  }

  /* ---------- magazine ---------- */
  function magazine() {
    var M = D.magazine;
    return { title: t("nav_magazine"), html:
      '<section class="iss"><div class="wrap iss-g"><a class="iss-cover" href="#flip"><img src="' + img("mag/" + IS.cover) + '" alt="' + esc(t("ed_title")) + '" width="794" height="1123"></a><div>' + U.crumbs([[t("home"), "home"], [t("nav_magazine")]]) +
      '<p class="kick">' + t("ed_kicker") + " · " + esc(L(M.month)) + '</p><h1 class="h1 split" tabindex="-1">' + t("ed_title") + '</h1><p class="lead">' + t("ed_lead") + '</p><div class="row"><a class="btn btn-red btn-lg" href="#flip">' + ic("book", 18) + t("fl_open") + '</a><a class="btn btn-adv btn-lg" href="#advertise">' + ic("megaphone", 18) + t("adv_btn") + "</a></div></div></div></section>" +
      '<div class="bar"><div class="wrap"><label class="sr" for="co-q">' + t("ed_search") + '</label><div class="srch">' + ic("search", 18) + '<input id="co-q" type="search" placeholder="' + esc(t("ed_search")) + '" autocomplete="off"></div></div></div>' +
      sec("", '<div class="cg" id="co-list">' + A.byTier(A.companies).map(U.companyCard).join("") + '</div><p class="empty" id="co-none" hidden>' + t("ed_none") + "</p>") };
  }
  function flip(page) {
    var n = IS.pages;
    return { title: t("fl_title"), html:
      '<section class="fb" data-fb data-page="' + A.clamp(page || 1, 1, n) + '" data-n="' + n + '"><div class="wrap">' + U.crumbs([[t("home"), "home"], [t("nav_magazine"), "magazine"], [t("fl_title")]]) +
      '<div class="fb-top"><h1 class="h2" tabindex="-1">' + t("ed_title") + '</h1><span class="fb-lbl" aria-live="polite"></span></div>' +
      '<div class="fb-stage"><button type="button" class="ib fb-nav prev" data-act="fb" data-d="-1" aria-label="' + esc(t("prev")) + '">' + ic("chev", 24) + '</button><div class="fb-book" dir="rtl"><div class="fb-p r"><img alt=""></div><div class="fb-p l"><img alt=""></div><div class="fb-leaf" aria-hidden="true"><div class="f"><img alt=""></div><div class="b"><img alt=""></div></div></div><button type="button" class="ib fb-nav next" data-act="fb" data-d="1" aria-label="' + esc(t("next")) + '">' + ic("chev", 24) + "</button></div>" +
      '<div class="fb-ctl"><label class="sr" for="fb-r">' + t("fl_jump") + '</label><input id="fb-r" type="range" min="1" max="' + n + '" value="' + (page || 1) + '" dir="ltr"><div class="fb-links"></div></div></div></section>' };
  }

  /* ---------- company ---------- */
  function company(id, tab) {
    var c = A.company(id); if (!c) return notFound();
    var list = A.byTier(A.companies), i = list.indexOf(c), prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
    var lg = A.logoOf(c), pages = A.companyPages(c), prods = A.productsOf(c), web = A.safeUrl(c.web);
    var tabs = [["page", "tab_page"], ["products", "prod_tab"], ["contact", "tab_company"]];
    var pageTab = '<p class="hint">' + ic("zoom", 16) + t("v_tap") + '</p><div class="adp' + (pages.length > 1 ? " two" : "") + '">' + pages.map(function (p) {
      return '<figure class="adp-f"><img src="' + A.companyImg(c, p) + '" alt="' + esc(c.company + " · " + t("ed_page", { n: p })) + '" data-act="zoom">' +
        c.hot.map(function (h, k) { return (h.p || c.page) === p ? '<button type="button" class="hs" data-act="hs" data-k="' + k + '" style="left:' + h.x + "%;top:" + h.y + '%" aria-label="' + esc(h.name) + '">' + (k + 1) + "</button>" : ""; }).join("") + "</figure>";
    }).join("") + "</div>" + (c.hot.length ? '<ol class="hsl">' + c.hot.map(function (h, k) { return '<li><button type="button" data-act="hs" data-k="' + k + '"><b>' + esc(h.name) + "</b><span>" + esc(L(h.d)) + "</span></button></li>"; }).join("") + "</ol>" : "");
    var prodTab = prods.length ? '<div class="pg">' + prods.map(function (it, k) { return it.img ? U.productCard({ c: c, it: it, k: k }) : ""; }).join("") + "</div>" : '<p class="empty">' + t("prod_none") + "</p>";
    var rows = [];
    if (c.address) rows.push([t("contact_address"), esc(c.address)]);
    if (c.tel) rows.push([t("contact_phone"), '<a href="tel:' + esc(String(c.tel).replace(/[^\d+]/g, "")) + '" dir="ltr">' + esc(c.tel) + "</a>"]);
    if (c.email) rows.push([t("contact_email"), '<a href="mailto:' + esc(c.email) + '" dir="ltr">' + esc(c.email) + "</a>"]);
    if (web) rows.push([t("v_web"), '<a href="' + esc(web) + '" target="_blank" rel="noopener noreferrer" dir="ltr">' + esc(web.replace(/^https?:\/\//, "").replace(/\/$/, "")) + "</a>"]);
    if (c.certs) rows.push([t("v_certs"), esc(c.certs)]);
    var contactTab = '<div class="cod"><div><h2 class="h3">' + t("v_about") + '</h2><p class="lead">' + esc(L(c.about)) + "</p></div><dl class=\"spec\">" + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl></div>";
    if (!A.hasPage(c)) { tabs.shift(); if (tab !== "contact") tab = "products"; }
    var panel = tab === "products" ? prodTab : tab === "contact" ? contactTab : pageTab;
    return { title: c.company, html:
      '<header class="ph co"><div class="wrap">' + U.crumbs([[t("home"), "home"], [t("nav_magazine"), "magazine"], [c.company]]) + '<div class="co-h">' + (lg ? '<img class="co-logo" src="' + img(lg) + '" alt="">' : "") + "<div>" + U.tierBadge(c) + '<h1 class="h1" tabindex="-1">' + esc(c.company) + '</h1><p class="lead">' + esc(L(A.cats[c.cat])) + " · " + esc(L(c.city)) + (A.inMagazine(c) ? " · " + t("ed_page", { n: c.page }) : "") + "</p></div></div>" +
      '<div class="row">' + (c.email ? '<a class="btn btn-red" href="mailto:' + esc(c.email) + '">' + ic("mail", 18) + t("v_contact") + "</a>" : "") + (web ? '<a class="btn btn-line" href="' + esc(web) + '" target="_blank" rel="noopener noreferrer">' + ic("link", 18) + t("v_web") + "</a>" : "") + (A.inMagazine(c) ? '<a class="btn btn-line" href="#flip-' + c.page + '">' + ic("book", 18) + t("pd_mag") + "</a>" : "") + "</div></div></header>" +
      '<div class="bar"><div class="wrap tabs" role="tablist">' + tabs.map(function (x) { return '<a role="tab" class="tab" href="#company-' + c.page + (x[0] === "page" ? "" : "." + x[0]) + '" aria-selected="' + (tab === x[0]) + '">' + t(x[1]) + "</a>"; }).join("") + "</div></div>" +
      sec("", panel) +
      '<nav class="pager" aria-label="' + esc(t("v_back")) + '"><a href="#company-' + prev.page + '" aria-label="' + esc(t("v_prev")) + '"><span class="flip back">' + ic("chev", 18) + '</span></a><span dir="ltr">' + (i + 1) + " / " + list.length + '</span><a href="#company-' + next.page + '" aria-label="' + esc(t("v_next")) + '"><span class="flip">' + ic("chev", 18) + "</span></a></nav>" };
  }

  /* ---------- products ---------- */
  function products(cat) {
    var cats = A.usedCats(); if (cats.indexOf(cat) < 0) cat = "";
    return { title: t("nav_products"), html: U.pageHead([[t("home"), "home"], [t("nav_products")]], t("nav_products"), t("prod_all_lead")) + prodSwitch("mag") +
      '<div class="bar sticky"><div class="wrap"><label class="sr" for="pr-q">' + t("pr_search") + '</label><div class="srch">' + ic("search", 18) + '<input id="pr-q" type="search" placeholder="' + esc(t("pr_search")) + '" autocomplete="off"></div>' +
      '<div class="chips" role="group" aria-label="' + esc(t("pd_category")) + '"><button type="button" class="chip" data-act="cat" data-cat="" aria-pressed="' + (!cat) + '">' + t("ed_all") + "</button>" + cats.map(function (k) { return '<button type="button" class="chip" data-act="cat" data-cat="' + k + '" aria-pressed="' + (cat === k) + '">' + esc(L(A.cats[k])) + "</button>"; }).join("") + "</div></div></div>" +
      sec("", '<div class="pg" id="pr-list" data-cat="' + cat + '">' + productList("", cat) + "</div>") };
  }
  function productList(q, cat) {
    var l = A.allProducts().filter(function (p) { return A.matchProduct(p, q, cat); });
    return l.length ? l.map(U.productCard).join("") : '<p class="empty">' + t("pr_none") + "</p>";
  }
  function product(id, k) {
    var c = A.company(id), it = c && A.productsOf(c)[k]; if (!it) return notFound();
    var desc = A.productDesc(c, it), lg = A.logoOf(c), web = A.safeUrl(it.url) || A.safeUrl(c.web);
    var more = A.productsOf(c).map(function (x, j) { return { c: c, it: x, k: j }; }).filter(function (p) { return p.k !== k && p.it.img; }).slice(0, 4);
    var similar = A.allProducts().filter(function (p) { return p.c !== c && p.c.cat === c.cat; }).slice(0, 4);
    var spec = [[t("pd_supplier"), '<a href="#company-' + c.page + '">' + esc(c.company) + "</a>"], [t("pd_location"), esc(L(c.city))], [t("pd_category"), esc(L(A.cats[c.cat]))]];
    if (c.certs) spec.push([t("pd_certs"), esc(c.certs)]);
    if (A.inMagazine(c)) spec.push([t("pd_source"), it.src === "web" ? t("prod_view") : t("prod_from_ad")], [t("pd_mag"), '<a href="#flip-' + c.page + '">' + t("ed_page", { n: c.page }) + "</a>"]);
    return { title: it.n, html:
      '<section class="sec pd"><div class="wrap">' + U.crumbs([[t("home"), "home"], [t("nav_products"), "products"], [L(A.cats[c.cat]), "products." + c.cat], [it.n]]) + '<div class="pd-g"><div class="pd-m"><img src="' + img(it.img) + '" alt="' + esc(it.n) + '" data-act="zoom"></div><div class="pd-i">' +
      '<h1 class="h1" tabindex="-1">' + esc(it.n) + "</h1>" + (desc ? '<p class="lead">' + esc(desc) + "</p>" : "") +
      (function () { var u = A.safeUrl(c.web), lg = A.state.lang, W1 = { en: "Manufacturer’s website", ar: "موقع الشركة المصنّعة", "zh-TW": "製造商網站", "zh-CN": "制造商网站", ms: "Laman web pengilang" }, W2 = { en: "Visit website", ar: "زيارة الموقع", "zh-TW": "前往網站", "zh-CN": "访问网站", ms: "Lawati laman web" };
        return u ? '<a class="pd-price pd-go" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><small>' + (W1[lg] || W1.en) + "</small><b>" + esc(u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")) + "</b><span>" + (W2[lg] || W2.en) + " ↗</span></a>"
          : '<a class="pd-price pd-go" href="#company-' + c.page + '.contact"><small>' + esc(L(A.cats[c.cat])) + "</small><b>" + esc(c.company) + "</b><span>" + t("nav_contact") + "</span></a>"; })() +
      '<div class="row">' + (c.email ? '<a class="btn btn-red btn-lg" href="' + A.mailLink(c.email, it.n) + '">' + ic("mail", 18) + t("prod_contact") + "</a>" : "") + (web ? '<a class="btn btn-line btn-lg" href="' + esc(web) + '" target="_blank" rel="noopener noreferrer">' + ic("link", 18) + t("v_web") + "</a>" : "") + "</div>" +
      '<a class="pd-co" href="#company-' + c.page + '">' + (lg ? '<img src="' + img(lg) + '" alt="">' : "") + "<span><b>" + esc(c.company) + "</b><small>" + esc(L(c.city)) + '</small></span><span class="flip">' + ic("arrow", 18) + "</span></a>" +
      '<dl class="spec">' + spec.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl></div></div></div></section>" +
      (more.length ? sec("alt", U.head(esc(c.company), t("pd_more"), ["company-" + c.page + ".products", t("hot_all")]) + '<div class="pg">' + more.map(U.productCard).join("") + "</div>") : "") +
      (similar.length ? sec("", U.head(esc(L(A.cats[c.cat])), t("pd_similar"), ["products." + c.cat, t("hot_all")]) + '<div class="pg">' + similar.map(U.productCard).join("") + "</div>") : "") };
  }
  function industry(slug) {
    var x = A.industry(slug); if (!x) return notFound();
    var prods = A.allProducts().filter(function (p) { return x.cats.indexOf(p.c.cat) > -1; });
    var ev = A.eventsWindow(new Date(), 3).filter(function (e) { return x.ind.indexOf(e.industry) > -1; });
    var name = t("ln_" + x.img);
    return { title: name, html:
      '<header class="ih"><img src="' + img("u/" + x.img + ".jpg") + '" alt=""><div class="wrap">' + U.crumbs([[t("home"), "home"], [t("nav_products"), "products"], [name]]) + '<h1 class="h1" tabindex="-1">' + esc(name) + '</h1><p class="lead">' + esc(t("ln_" + x.img + "_d")) + "</p></div></header>" +
      (prods.length ? sec("", U.head(t("hot_kicker"), t("hot_title"), ["products", t("hot_all")]) + '<div class="pg">' + prods.slice(0, 12).map(U.productCard).join("") + "</div>") : "") +
      (ev.length ? sec("alt", U.head(t("shows_kicker"), t("x_ex_window")) + '<div class="el">' + ev.map(U.eventRow).join("") + "</div>") : "") +
      (!prods.length && !ev.length ? sec("", '<p class="empty">' + t("pr_none") + '</p><div class="row"><a class="btn btn-red" href="#products">' + t("hot_all") + "</a></div>") : "") +
      sec("alt", U.head(t("cats_kicker"), t("cats_title")) + '<div class="chips">' + A.INDUSTRIES.filter(function (y) { return y !== x; }).map(function (y) { return '<a class="chip" href="#industry-' + y.slug + '">' + esc(t("ln_" + y.img)) + "</a>"; }).join("") + "</div>") };
  }

  /* ---------- articles and news ---------- */
  function articles() {
    var all = A.articlesFor(A.state.lang), list = all.filter(function (a) { return !a.fresh; }), fresh = all.filter(function (a) { return a.fresh; }), isAr = A.state.lang === "ar";
    return { title: t("ar_nav"), html: U.pageHead([[t("home"), "home"], [t("ar_nav")]], isAr ? t("ar_title") : t("news_title"), isAr ? t("ar_lead", { n: D.magazine.issue }) : "") +
      (fresh.length ? sec("", U.head(isAr ? "جديد" : "New · العربية", isAr ? "مقالات هذا الشهر" : "This month's articles") + '<div class="ag three ag-new" lang="ar" dir="rtl">' + fresh.map(function (a) { return U.articleCard(a, false); }).join("") + "</div>") : "") +
      (list.length ? sec(fresh.length ? "alt" : "", '<div class="ag">' + list.map(function (a, i) { return U.articleCard(a, i === 0); }).join("") + "</div>") : "") };
  }
  /* "Modern products and industries": AAT's own selection of factories, kept apart from the magazine's advertisers */
  var MW = {
    sw1: { en: "From this month’s magazine", ar: "من مجلة هذا الشهر", "zh-TW": "本月雜誌產品", "zh-CN": "本月杂志产品", ms: "Daripada majalah bulan ini" },
    sw1s: { en: "Advertisers’ products", ar: "منتجات المعلنين", "zh-TW": "廣告客戶產品", "zh-CN": "广告客户产品", ms: "Produk pengiklan" },
    sw2: { en: "Modern products and industries", ar: "منتجات وصناعات حديثة", "zh-TW": "現代產品與產業", "zh-CN": "现代产品与产业", ms: "Produk dan industri moden" },
    sw2s: { en: "AAT’s selection of factories", ar: "مختارات AAT من المصانع", "zh-TW": "AAT 精選工廠", "zh-CN": "AAT 精选工厂", ms: "Pilihan kilang AAT" },
    lead: { en: "Machines, products and project ideas gathered by AAT from factories in Taiwan and Asia. This section is separate from the advertisers of the monthly magazine.", ar: "آلات ومنتجات وأفكار مشاريع جمعتها AAT من مصانع في تايوان وآسيا. هذا القسم مستقل عن معلني المجلة الشهرية.", "zh-TW": "AAT 自台灣及亞洲工廠彙整的機械、產品與專案構想，與每月雜誌廣告客戶分開呈現。", "zh-CN": "AAT 自台湾及亚洲工厂汇整的机械、产品与项目构想，与每月杂志广告客户分开呈现。", ms: "Mesin, produk dan idea projek yang dikumpulkan AAT daripada kilang di Taiwan dan Asia, berasingan daripada pengiklan majalah bulanan." },
    note: { en: "The details below are in Arabic, as published by AAT.", "zh-TW": "以下內容為 AAT 發布的阿拉伯文原文。", "zh-CN": "以下内容为 AAT 发布的阿拉伯文原文。", ms: "Butiran di bawah dalam bahasa Arab, seperti diterbitkan oleh AAT." },
    visit: { en: "Visit the factory’s website", ar: "زيارة موقع المصنع", "zh-TW": "前往工廠網站", "zh-CN": "访问工厂网站", ms: "Lawati laman web kilang" },
    back: { en: "All modern products", ar: "كل المنتجات الحديثة", "zh-TW": "全部現代產品", "zh-CN": "全部现代产品", ms: "Semua produk moden" }
  };
  function mw(k) { var o = MW[k]; return o[A.state.lang] || o.en; }
  function mTitle(x) { return A.state.lang === "ar" ? x.t : (x.en || x.t); }
  function prodSwitch(on) {
    var M = W.AAT_MODERN || []; if (!M.length) return "";
    return '<div class="wrap"><div class="psw" role="tablist"><a class="psw-i' + (on === "mag" ? " on" : "") + '" href="#products" role="tab" aria-selected="' + (on === "mag") + '">' + ic("book", 22) + "<span><b>" + mw("sw1") + "</b><small>" + mw("sw1s") + " · " + A.allProducts().length + '</small></span></a><a class="psw-i psw-m' + (on === "mod" ? " on" : "") + '" href="#modern" role="tab" aria-selected="' + (on === "mod") + '">' + ic("spark", 22) + "<span><b>" + mw("sw2") + "</b><small>" + mw("sw2s") + " · " + M.length + "</small></span></a></div></div>";
  }
  function modernList() {
    var M = W.AAT_MODERN || [], G = W.AAT_MODERN_G || {}, keys = Object.keys(G), n = 0;
    function gname(k) { return G[k][A.state.lang] || G[k].en; }
    return { title: mw("sw2"), html: U.pageHead([[t("home"), "home"], [t("nav_products"), "products"], [mw("sw2")]], mw("sw2"), mw("lead")) + prodSwitch("mod") +
      '<section class="sec mod"><div class="wrap"><nav class="mod-nav" aria-label="' + esc(mw("sw2")) + '">' + keys.map(function (k) { var c = M.filter(function (x) { return x.g === k; }).length; return '<button type="button" class="chip" data-modg="' + k + '">' + esc(gname(k)) + " <small>" + c + "</small></button>"; }).join("") + "</nav>" +
      keys.map(function (k, gi) { var items = []; M.forEach(function (x, i) { if (x.g === k) items.push([x, i]); });
        return '<section class="mod-g" id="modg-' + k + '"><header><i>' + A.pad2(gi + 1) + "</i><h2 class=\"h3\">" + esc(gname(k)) + "</h2><small>" + items.length + '</small></header><div class="mod-l">' + items.map(function (p) { n++; return '<a class="mod-c rv" href="#modern-' + p[1] + '"><span class="mod-im"><img src="' + esc(p[0].img) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></span><span class="mod-b"><b>' + esc(mTitle(p[0])) + "</b>" + (p[0].web ? "<small>" + esc(p[0].web.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")) + "</small>" : "") + '</span><span class="mod-go flip">' + ic("arrow", 18) + "</span></a>"; }).join("") + "</div></section>"; }).join("") + "</div></section>" };
  }
  function modern(i) {
    var x = (W.AAT_MODERN || [])[i]; if (!x) return notFound(); var u = A.safeUrl(x.web), ar = A.state.lang === "ar", G = W.AAT_MODERN_G || {}, gn = G[x.g] ? (G[x.g][A.state.lang] || G[x.g].en) : "";
    return { title: mTitle(x), html: '<article class="rd rd-mod"><div class="wrap rd-w">' + U.crumbs([[t("home"), "home"], [mw("sw2"), "modern"], [mTitle(x)]]) + (gn ? '<p class="kick">' + esc(gn) + "</p>" : "") + '<h1 class="h1" tabindex="-1">' + esc(mTitle(x)) + "</h1>" + (ar ? "" : '<p class="rd-m" lang="ar" dir="rtl">' + esc(x.t) + "</p>") +
      '<img class="rd-img rd-fit" src="' + esc(x.img) + '" alt="" referrerpolicy="no-referrer">' + (ar ? "" : '<p class="mod-note">' + mw("note") + "</p>") + '<div class="prose" lang="ar" dir="rtl">' + paras(x.body) + '</div><div class="row">' +
      (u ? '<a class="btn btn-red" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + ic("link", 18) + mw("visit") + "</a>" : "") + '<a class="btn btn-line" href="#modern">' + mw("back") + "</a></div></div></article>" };
  }
  function newsPage() {
    return { title: U.newsWord(), html: U.pageHead([[t("home"), "home"], [U.newsWord()]], t("news_title"), "") + sec("", '<div class="ng">' + newsCards(-1) + "</div>") };
  }
  function article(id) {
    var a = A.article(id); if (!a) return notFound();
    var lg = A.articleLang(), body = (a.body[lg] && a.body[lg].length) ? a.body[lg] : (a.body.en && a.body.en.length ? a.body.en : a.body.ar || []);
    var bodyLang = (a.body[lg] && a.body[lg].length) ? lg : (a.body.en && a.body.en.length ? "en" : "ar"), title = a.title[bodyLang] || a.title.en || a.title.ar;
    var author = ""; if (a.author) { var m = String(a.author).match(/^(.*?)\s*\((.*)\)\s*$/); author = m ? (bodyLang === "ar" ? m[1] : m[2]) : a.author; }
    var others = A.articlesFor(A.state.lang).filter(function (x) { return x.id !== a.id; }).slice(0, 3);
    return { title: title, html:
      '<article class="rd" lang="' + bodyLang + '" dir="' + (bodyLang === "ar" ? "rtl" : "ltr") + '"><div class="wrap rd-w">' + '<div dir="' + A.dir() + '">' + U.crumbs([[t("home"), "home"], [t("ar_nav"), "articles"], [title]]) + "</div>" +
      '<h1 class="h1" tabindex="-1">' + esc(title) + '</h1><p class="rd-m">' + (author ? t("ar_by") + " " + esc(author) + " · " : "") + t("mb_issue", { n: D.magazine.issue, m: L(D.magazine.month) }) + "</p>" +
      (a.img ? '<img class="rd-img" src="' + img(a.img) + '" alt="">' : "") + '<div class="prose">' + paras(body) + '</div><div class="row" dir="' + A.dir() + '"><a class="btn btn-line" href="#' + (a.custom ? "articles" : "flip-" + a.pages[0]) + '">' + ic("book", 18) + (a.custom ? t("ar_back") : t("ar_in_mag")) + "</a></div></div></article>" +
      (others.length ? sec("alt", U.head(t("ar_nav"), t("ar_more"), ["articles", t("ar_back")]) + '<div class="ag three">' + others.map(function (x) { return U.articleCard(x, false); }).join("") + "</div>") : "") };
  }
  function newsItem(i) {
    var n = D.news[i], b = A.newsBody[i]; if (!n) return notFound();
    var body = b ? (b.body[A.state.lang] || b.body.en || b.body.ar || []) : [], src = b ? A.safeUrl(b.source) : "";
    return { title: L(n.title), html:
      '<article class="rd"><div class="wrap rd-w">' + U.crumbs([[t("home"), "home"], [U.newsWord(), "news"], [L(n.title)]]) + '<h1 class="h1" tabindex="-1">' + esc(L(n.title)) + "</h1>" + (b && b.date ? '<p class="rd-m">' + esc(A.fmtDate(b.date)) + "</p>" : "") +
      '<img class="rd-img" src="' + img(n.img) + '" alt=""><div class="prose">' + paras(body) + "</div>" + (src ? '<div class="row"><a class="btn btn-line" href="' + esc(src) + '" target="_blank" rel="noopener noreferrer">' + ic("link", 18) + t("news_source") + "</a></div>" : "") + "</div></article>" +
      sec("alt", U.head(t("news_kicker"), t("news_more"), ["news", t("news_all")]) + '<div class="ng">' + newsCards(i, 4) + "</div>") };
  }

  /* ---------- exhibitions ---------- */
  function exhibitions() {
    var ev = A.eventsWindow(new Date(), 2), cn = D.countries || {}, cnt = {}, isAr = A.state.lang === "ar";
    ev.forEach(function (e) { cnt[e.country] = (cnt[e.country] || 0) + 1; });
    var chips = Object.keys(cn).length ? '<div class="chips exc" role="tablist"><button type="button" class="chip on" data-exc="">' + (isAr ? "كل الدول" : "All countries") + " <small>" + ev.length + "</small></button>" + Object.keys(cn).map(function (k) { return '<button type="button" class="chip' + (cnt[k] ? "" : " none") + '" data-exc="' + k + '"' + (cnt[k] ? "" : " disabled") + ">" + esc(L(cn[k])) + " <small>" + (cnt[k] || 0) + "</small></button>"; }).join("") + "</div>" : "";
    return { title: t("nav_exhibitions"), html: U.pageHead([[t("home"), "home"], [t("nav_exhibitions")]], t("nav_exhibitions"), t("x_ex_window")) +
      sec("", ev.length ? chips + '<div class="el">' + ev.map(U.eventRow).join("") + "</div>" : '<p class="empty">' + t("x_ex_none") + "</p>") };
  }
  function exhibition(id) {
    var e = A.eventById(id); if (!e) return notFound();
    var url = A.safeUrl(e.url), themes = LA(e.themes);
    return { title: e.name, html: U.pageHead([[t("home"), "home"], [t("nav_exhibitions"), "exhibitions"], [e.name]], e.name, L(e.summary)) +
      sec("", '<div class="cod"><dl class="spec"><dt>' + t("x_ex_dates") + "</dt><dd>" + esc(A.fmtRange(e.start, e.end)) + "</dd><dt>" + t("x_ex_venue") + "</dt><dd>" + esc(L(e.venue)) + "</dd><dt>" + t("x_ex_org") + "</dt><dd>" + esc(e.organizer) + "</dd></dl>" +
        "<div>" + (themes.length ? '<h2 class="h3">' + t("x_ex_themes") + '</h2><ul class="ticks">' + themes.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
        '<div class="row">' + (url ? '<a class="btn btn-red" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + ic("link", 18) + t("x_ex_site") + "</a>" : "") + '<a class="btn btn-line" href="#exhibitions">' + t("nav_exhibitions") + "</a></div></div></div>") };
  }

  /* ---------- club, about, advertise, contact ---------- */
  function clubMark() { return '<span class="cbm" aria-label="AAT Business Club"><b>AAT</b><small>BUSINESS CLUB</small></span>'; }
  function clubJoin() { return '<div class="row"><a class="btn btn-wa btn-lg" href="' + A.waLink(t("cb_join_wa")) + '" target="_blank" rel="noopener noreferrer">' + ic("chat", 18) + t("wa") + '</a><a class="btn btn-line btn-lg" href="' + A.mailLink(D.config.clubEmail, "AAT Business Club", t("cb_join_wa")) + '">' + ic("mail", 18) + t("email_word") + "</a></div>"; }
  function club() {
    return { title: t("mem_title"), html: U.pageHead([[t("home"), "home"], [t("nav_membership")]], t("mem_title"), t("mem_lead")) +
      sec("", '<div class="cb-top">' + clubMark() + '<div><h2 class="h2">' + t("cb_goals") + '</h2><p class="lead">' + t("cb_goals_p") + "</p><p>" + t("cb_goals_p2") + "</p>" + clubJoin() + "</div></div>") +
      sec("alt", U.head("AATBC", t("cb_ben")) + '<ol class="cb-l">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<li class="rv"><b>' + A.pad2(n) + "</b><span>" + t("cb_b" + n) + "</span></li>"; }).join("") + "</ol>") +
      sec("", '<div class="two"><div><h2 class="h2">' + t("cb_partners") + '</h2><p class="lead">' + t("cb_partners_p") + '</p></div><div class="card"><h2 class="h3">' + t("cb_join") + "</h2>" + clubJoin() + "</div></div>") + turnkey() };
  }
  /* turnkey projects: first studies for industrial projects, a benefit of the club (Arabic) */
  function turnkey() {
    var T = W.AAT_TURNKEY; if (!T || A.state.lang !== "ar") return "";
    return sec("alt", U.head(esc(T.sub), esc(T.title)) + '<div class="two tk"><div class="prose">' + T.intro.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + '</div><div class="card"><h3 class="h3">' + esc(T.incT) + '</h3><ul class="ticks">' + T.inc.map(function (x) { return typeof x === "string" ? "<li>" + esc(x) + "</li>" : "<li>" + esc(x[0]) + '<ul class="tk-sub">' + x[1].map(function (y) { return "<li>" + esc(y) + "</li>"; }).join("") + "</ul></li>"; }).join("") + "</ul></div></div>" +
      '<div class="tk-g">' + T.groups.map(function (g) { return '<div class="card tk-c rv"><h3 class="h3">' + esc(g[0]) + " <small>" + g[1].length + "</small></h3><ul>" + g[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>"; }).join("") + '</div><p class="lead tk-e">' + esc(T.end) + "</p>" + clubJoin());
  }
  function about() {
    var M = D.magazine;
    return { title: t("about_title"), html: U.pageHead([[t("home"), "home"], [t("nav_about")]], t("about_title"), t("about_lead")) +
      sec("", '<div class="two"><div class="prose">' + [1, 2, 3, 4, 5].map(function (n) { return "<p>" + t("ab" + n) + "</p>"; }).join("") + '</div><div><a class="ab-cover" href="#flip"><img src="' + img("magazine-559.jpg") + '" alt="' + esc(L(M.name)) + '" width="617" height="768" loading="lazy"></a></div></div>') +
      '<section class="sec facts"><div class="wrap facts-g"><div><b class="count" data-to="' + M.years + '">' + M.years + "</b><span>" + t("fact_years") + '</span></div><div><b class="count" data-to="' + M.issue + '">' + M.issue + "</b><span>" + t("fact_issues") + "</span></div><div><b>" + M.since + "</b><span>" + t("fact_since") + "</span></div></div></section>" +
      '<section class="sec cta"><div class="wrap cta-in"><div><h2 class="h2">' + t("chat_person") + "</h2><p>" + t("tn_p2") + "</p></div>" + U.contactButtons("", true) + "</div></section>" };
  }
  var POS = ["cover", "back", "spread", "premium", "full", "half"];
  function advertise() {
    var M = D.magazine, noReport = /report|تقرير|報告|报告|laporan/i;
    return { title: t("adv_btn"), html:
      '<header class="ph adv"><div class="wrap">' + U.crumbs([[t("home"), "home"], [t("adv_btn")]]) + '<p class="kick">' + t("ad_kicker") + '</p><h1 class="h1 split" tabindex="-1">' + t("ad_title") + '</h1><p class="lead">' + t("ad_lead") + "</p>" +
      '<div class="facts-g"><div><b>' + M.since + "</b><span>" + t("mb_f1") + "</span></div><div><b>" + M.issue + "</b><span>" + t("mb_f2") + "</span></div><div><b>5</b><span>" + t("ad_langs") + "</span></div></div>" + U.contactButtons(t("ad_wa"), true) + "</div></header>" +
      sec("", U.head(t("ad_pos_kicker"), t("ad_pos_title")) + '<div class="pos">' + POS.map(function (k, i) {
        var ex = A.companies.filter(function (c) { return c.tier === k; })[0];
        return '<article class="pos-c rv"><span class="pos-n">' + A.pad2(i + 1) + '</span><h3 class="h3">' + t("pos_" + k) + '</h3><p class="pos-p">' + t("pos_" + k + "_p") + '</p><ul class="ticks">' + t("pos_" + k + "_w").split("|").filter(function (w) { return !noReport.test(w); }).map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul>" +
          (ex ? '<a class="more" href="#company-' + ex.page + '">' + t("pos_example") + " " + esc(ex.company) + "</a>" : "") + "</article>";
      }).join("") + "</div>") +
      '<section class="sec cta"><div class="wrap cta-in"><div><h2 class="h2">' + t("ad_digital_t") + "</h2><p>" + t("ad_digital_d") + "</p></div>" + U.contactButtons(t("ad_wa"), true) + "</div></section>" };
  }
  function contact() {
    var c = D.config;
    function tile(icon, label, val, btns, ltr) { return '<div class="ct rv"><span class="ct-i">' + ic(icon, 22) + "</span><small>" + label + "</small><b" + (ltr ? ' dir="ltr"' : "") + ">" + val + '</b><div class="row">' + btns + "</div></div>"; }
    function copyBtn(v) { return '<button type="button" class="btn btn-line btn-sm" data-act="copy" data-copy="' + esc(v) + '">' + t("copy") + "</button>"; }
    return { title: t("contact_title"), html: U.pageHead([[t("home"), "home"], [t("nav_contact")]], t("contact_title"), "") +
      sec("", '<div class="ctg">' +
        tile("chat", t("contact_whatsapp"), esc(c.phoneDisplay), '<a class="btn btn-wa btn-sm" href="' + A.waLink() + '" target="_blank" rel="noopener noreferrer">' + t("wa") + "</a>" + copyBtn(c.phoneDisplay), 1) +
        tile("mail", t("contact_email"), esc(c.email), '<a class="btn btn-red btn-sm" href="mailto:' + esc(c.email) + '">' + t("email_word") + "</a>" + copyBtn(c.email), 1) +
        tile("mail", t("contact_support"), esc(c.clubEmail), '<a class="btn btn-red btn-sm" href="mailto:' + esc(c.clubEmail) + '">' + t("email_word") + "</a>" + copyBtn(c.clubEmail), 1) +
        tile("pin", t("contact_address"), esc(L(c.address)), "") +
        tile("play", t("yt"), "AAT World video", '<a class="btn btn-line btn-sm" href="' + esc(A.safeUrl(c.social.youtube)) + '" target="_blank" rel="noopener noreferrer">' + t("yt") + "</a>") + "</div>") };
  }
  function privacy() { return { title: t("privacy_title"), html: U.pageHead([[t("home"), "home"], [t("privacy_title")]], t("privacy_title"), "") + sec("", '<div class="prose">' + t("x_privacy").split("|").map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>") }; }
  function notFound() { return { title: t("nf_title"), html: U.pageHead([[t("home"), "home"]], t("nf_title"), t("nf_lead")) + sec("", '<div class="row"><a class="btn btn-red" href="#home">' + t("home") + "</a></div>") }; }

  function view(r) {
    switch (r.v) {
      case "home": return home();
      case "magazine": return magazine();
      case "flip": return flip(r.page);
      case "company": return company(r.id, r.tab);
      case "products": return products(r.cat);
      case "modern": return r.id === undefined ? modernList() : modern(r.id);
      case "product": return product(r.id, r.k);
      case "industry": return industry(r.id);
      case "articles": return A.state.lang === "ar" ? articles() : newsPage(); case "news": return newsPage();
      case "article": return article(r.id);
      case "newsitem": return newsItem(r.id);
      case "exhibitions": return exhibitions();
      case "exhibition": return exhibition(r.id);
      case "club": return club();
      case "about": return about();
      case "advertise": return advertise();
      case "contact": return contact();
      case "privacy": return privacy();
      default: return notFound();
    }
  }
  W.AAT.views = { view: view, productList: productList };
})(window);
