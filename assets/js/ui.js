/* AAT World v2 — reusable interface parts. Every function returns an HTML string;
   all data values pass through esc() before they reach the page. */
(function (W) {
  "use strict";
  var A = W.AAT, esc = A.esc, t = A.t, L = A.L, img = A.img, D = A.D;

  var ICONS = {
    menu: "M4 7h16M4 12h16M4 17h16", x: "M6 6l12 12M18 6L6 18", search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
    sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
    moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z", globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z",
    arrow: "M5 12h14M13 6l6 6-6 6", megaphone: "M3 10v4h4l6 4V6L7 10zM17 9a4 4 0 0 1 0 6", chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
    mail: "M3 6h18v12H3zM3 7l9 6 9-6", book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5", play: "M8 5l11 7-11 7z", pause: "M8 5v14M16 5v14",
    check: "M5 12l5 5L20 7", star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z", phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
    pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    send: "M4 12l16-8-6 16-3-7z", calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", zoom: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4M11 8v6M8 11h6",
    chev: "M9 6l6 6-6 6", spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"
  };
  function ic(name, size) {
    var s = size || 20;
    return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + ICONS[name] + '"/></svg>';
  }
  function logo(h) { if (A.mag && A.mag.logoHTML) return A.mag.logoHTML(h); return '<img src="' + img("logo.png") + '" alt="AAT, Ideas For Business" width="' + Math.round(h * 3) + '" height="' + h + '">'; }

  var NAV = [["magazine", "nav_magazine"], ["articles", "ar_nav"], ["exhibitions", "nav_exhibitions"], ["products", "nav_products"], ["club", "nav_membership"], ["about", "nav_about"], ["contact", "nav_contact"]];
  var NEWS_W = { en: "News", ar: "الأخبار", "zh-TW": "新聞", "zh-CN": "新闻", ms: "Berita" };
  /* Arabic has Articles and News; every other language has News only */
  function navList() { var ar = A.state.lang === "ar", out = []; NAV.forEach(function (n) { if (n[0] === "articles") { if (ar) out.push(n); out.push(["news", "@news"]); } else out.push(n); }); return out; }
  function navT(k) { return k === "@news" ? (NEWS_W[A.state.lang] || NEWS_W.en) : t(k); }
  function langItems() {
    return A.LANGS.map(function (x) { return '<button type="button" role="menuitemradio" aria-checked="' + (x[0] === A.state.lang) + '" data-act="lang" data-lang="' + x[0] + '" lang="' + x[0] + '"><b>' + x[2] + "</b>" + x[1] + "</button>"; }).join("");
  }
  function header() {
    var links = navList().map(function (n) { return '<a href="#' + n[0] + '" data-nav="' + n[0] + '">' + navT(n[1]) + "</a>"; }).join("");
    var cur = A.LANGS.filter(function (x) { return x[0] === A.state.lang; })[0];
    return '<div class="hd"><a class="hd-brand" href="#home" aria-label="' + esc(t("brand_full")) + '">' + logo(34) + "</a>" +
      '<nav class="hd-nav" aria-label="' + esc(t("menu")) + '">' + links + '<i class="hd-ind" aria-hidden="true"></i></nav>' +
      '<div class="hd-act"><button type="button" class="ib" data-act="theme" aria-label="' + esc(t("theme_toggle")) + '"><span class="i-sun">' + ic("sun") + '</span><span class="i-moon">' + ic("moon") + "</span></button>" +
      '<div class="lang"><button type="button" class="lang-b" data-act="lang-open" aria-haspopup="true" aria-expanded="false" aria-label="' + esc(t("lang_choose")) + '">' + ic("globe", 17) + "<span>" + cur[2] + '</span></button><div class="lang-m" role="menu" hidden>' + langItems() + "</div></div>" +
      '<a class="btn btn-adv hd-adv" href="#advertise">' + ic("megaphone", 16) + "<span>" + t("adv_btn") + "</span></a>" +
      '<button type="button" class="ib hd-menu" data-act="menu" aria-expanded="false" aria-controls="mnav" aria-label="' + esc(t("menu")) + '">' + ic("menu", 24) + "</button></div></div>" +
      '<nav id="mnav" class="mnav" hidden aria-label="' + esc(t("menu")) + '">' + links + '<a class="btn btn-adv" href="#advertise">' + ic("megaphone", 16) + t("adv_btn") + '</a><div class="mnav-l">' + langItems() + "</div></nav>";
  }

  function tierBadge() { return ""; }
  function head(kicker, title, link) {
    return '<div class="sh"><div><p class="kick">' + kicker + '</p><h2 class="h2 split">' + title + "</h2></div>" + (link ? '<a class="more" href="#' + link[0] + '">' + link[1] + '<span class="flip">' + ic("arrow", 16) + "</span></a>" : "") + "</div>";
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map(function (i) { return i[1] ? '<a href="#' + i[1] + '">' + esc(i[0]) + "</a>" : '<span aria-current="page">' + esc(i[0]) + "</span>"; }).join('<i aria-hidden="true">/</i>') + "</nav>";
  }
  function pageHead(trail, title, lead) {
    return '<header class="ph"><div class="wrap">' + crumbs(trail) + '<h1 class="h1 split" tabindex="-1">' + esc(title) + "</h1>" + (lead ? '<p class="lead">' + esc(lead) + "</p>" : "") + "</div></header>";
  }
  /* WhatsApp and email side by side: some countries have no WhatsApp */
  function contactButtons(text, big) {
    var c = D.config, cls = big ? " btn-lg" : "";
    return '<div class="row"><a class="btn btn-wa' + cls + '" href="' + A.waLink(text) + '" target="_blank" rel="noopener noreferrer">' + ic("chat", 18) + t("wa") + '</a><a class="btn btn-line' + cls + '" href="' + A.mailLink(c.email, "AAT World", text) + '">' + ic("mail", 18) + t("email_word") + "</a></div>";
  }

  function companyCard(c) {
    var lg = A.logoOf(c);
    return '<a class="cc rv" href="#company-' + c.page + '"><span class="cc-img"><img src="' + A.companyImg(c) + '" alt="" loading="lazy"></span>' +
      '<span class="cc-b">' + tierBadge(c) + (lg ? '<img class="cc-logo" src="' + img(lg) + '" alt="" loading="lazy">' : "") + "<b>" + esc(c.company) + '</b><small>' + esc(L(A.cats[c.cat])) + " · " + esc(L(c.city)) + "</small></span></a>";
  }
  function productCard(p) {
    return '<a class="pc rv" href="#product-' + p.c.page + "-" + p.k + '"><span class="pc-img"><img src="' + img(p.it.img) + '" alt="" loading="lazy"></span>' +
      '<span class="pc-b"><b>' + esc(p.it.n) + '</b><small>' + esc(p.c.company) + '</small><span class="pc-p">' + (A.safeUrl(p.c.web) ? esc(String(p.c.web).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")) + " ↗" : esc(L(A.cats[p.c.cat]))) + "</span></span></a>";
  }
  function articleCard(a, big) {
    var lg = A.articleLang();
    return '<a class="ac rv' + (big ? " big" : "") + '" href="#article-' + a.id + '">' + (a.img ? '<span class="ac-img"><img src="' + img(a.img) + '" alt="" loading="lazy"></span>' : "") +
      '<span class="ac-b"><b>' + esc(a.title[lg] || a.title.en || a.title.ar) + '</b><span class="ac-s">' + esc(a.sum[lg] || a.sum.en || a.sum.ar || "") + '</span>' + (a.custom ? "" : "<small>" + t("ed_page", { n: a.pages[0] }) + "</small>") + "</span></a>";
  }
  function newsCard(n, i) {
    var b = A.newsBody[i];
    return '<a class="nc rv" href="#news-' + i + '"><span class="nc-img"><img src="' + img(n.img) + '" alt="" loading="lazy"></span><span class="nc-b">' + (b && b.date ? "<small>" + esc(A.fmtDate(b.date)) + "</small>" : "") + "<b>" + esc(L(n.title)) + "</b></span></a>";
  }
  function eventRow(e) {
    var d = A.parseDate(e.start), days = A.daysUntil(e, new Date());
    var mon; try { mon = new Intl.DateTimeFormat(A.state.lang === "ar" ? "ar-u-nu-latn" : A.state.lang, { month: "short" }).format(d); } catch (x) { mon = d.getMonth() + 1; }
    var cn = (A.D.countries || {})[e.country];
    return '<a class="er rv" data-c="' + (e.country || "") + '" href="#exhibition-' + e.id + '"><span class="er-d"><b>' + d.getDate() + "</b><small>" + esc(mon) + '</small></span><span class="er-b"><b>' + esc(e.name) + "</b><small>" + esc(A.fmtRange(e.start, e.end)) + " · " + esc(L(e.venue)) + (cn ? " · " + esc(L(cn)) : "") + '</small></span><span class="er-n">' + (days > 0 ? t("days_to_go", { n: days }) : t("on_now")) + "</span></a>";
  }

  /* Live view: dotted map, glowing two-way trade lines between Asia, the Arab region and Africa (general, no single country) */
  var ROUTES = [[[114, 30], [51, 25]], [[114, 30], [31, 29]], [[103, 12], [46, 22]], [[103, 12], [38, -2]], [[78, 21], [4, 34]], [[121, 24], [8, 8]], [[78, 21], [26, -27]], [[135, 35], [56, 23]]];
  function tradeMap() {
    var M = W.AAT_MAP; if (!M) return "";
    function xy(p) { return [(p[0] - M.L0) * M.k, (M.B1 - p[1]) * M.k * 1.12]; }
    var arcs = "", glow = "", ends = "";
    ROUTES.forEach(function (r, i) {
      var a = xy(r[0]), b = xy(r[1]), dx = b[0] - a[0], dy = b[1] - a[1], k = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.22, 46);
      var d = "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " Q" + ((a[0] + b[0]) / 2).toFixed(1) + " " + ((a[1] + b[1]) / 2 - k).toFixed(1) + " " + b[0].toFixed(1) + " " + b[1].toFixed(1);
      arcs += '<path class="tm-arc" d="' + d + '"/>';
      glow += '<path class="tm-glow' + (i % 2 ? " rev" : "") + '" pathLength="100" d="' + d + '" style="--t:' + (5.5 + (i % 4) * 1.1) + "s;--dl:-" + (i * 1.3).toFixed(1) + 's"/>';
      ends += '<circle class="tm-end" cx="' + a[0].toFixed(1) + '" cy="' + a[1].toFixed(1) + '" r="2.6" style="--i:' + i + '"/><circle class="tm-end" cx="' + b[0].toFixed(1) + '" cy="' + b[1].toFixed(1) + '" r="2.6" style="--i:' + (i + 3) + '"/>';
    });
    function label(p, key, cls) {
      var q = xy(p), tx = t(key), lg = A.state.lang, w = Math.max(54, tx.length * (lg === "ar" ? 6.6 : lg === "en" || lg === "ms" ? 7.6 : 14) + 22);
      return '<g class="tm-lb ' + (cls || "") + '" transform="translate(' + q[0].toFixed(1) + " " + q[1].toFixed(1) + ')"><rect x="' + (-w / 2).toFixed(1) + '" y="-13" width="' + w.toFixed(1) + '" height="26" rx="13"/><text y="5">' + esc(tx) + "</text></g>";
    }
    return '<svg class="tm" viewBox="0 0 ' + M.W + " " + M.H + '" role="img" aria-label="' + esc(t("rn_line")) + '"><path class="tm-d o" d="' + M.o + '"/><path class="tm-d s" d="' + M.s + '"/><path class="tm-d f" d="' + M.f + '"/><path class="tm-d a" d="' + M.a + '"/>' +
      arcs + ends + glow + label([100, 50], "rn_asia", "hub") + label([64, 13], "rn_arab", "ar") + label([2, -16], "rn_africa") + "</svg>";
  }

  function newsletter(id) {
    return '<form class="nl" data-form="newsletter" novalidate><label class="sr" for="' + id + '">' + t("nl_label") + '</label><input id="' + id + '" name="email" type="email" autocomplete="email" required placeholder="' + esc(t("nl_label")) + '"><button class="btn btn-red" type="submit">' + t("nl_btn") + '</button><p class="nl-msg" role="status" aria-live="polite"></p></form>';
  }
  function footer() {
    var c = D.config, back = A.companies.filter(function (x) { return x.tier === "back"; })[0];
    return (back ? '<a class="bc" href="#company-' + back.page + '"><span class="wrap bc-in">' + (A.logoOf(back) ? '<img src="' + img(A.logoOf(back)) + '" alt="">' : "") + "<span><b>" + esc(back.company) + '</b></span><span class="bc-go">' + t("ed_open") + '<span class="flip">' + ic("arrow", 16) + "</span></span></span></a>" : "") +
      '<div class="wrap ft"><div class="ft-nl"><div><h2 class="h3">' + t("nl_title") + "</h2><p>" + t("nl_lead") + "</p></div>" + newsletter("ft-email") + "</div>" +
      '<div class="ft-g"><div class="ft-a"><a class="ft-brand" href="#home">' + logo(46) + '</a><p class="ft-n"><b>' + t("brand_full") + "</b><span>" + t("brand_other") + "</span></p><p>" + t("mb_claim") + "</p></div>" +
      '<div><h2 class="ft-h">' + t("footer_explore") + "</h2><ul>" + navList().slice(0, 5).map(function (n) { return '<li><a href="#' + n[0] + '">' + navT(n[1]) + "</a></li>"; }).join("") + '<li><a href="#advertise">' + t("adv_btn") + "</a></li></ul></div>" +
      '<div><h2 class="ft-h">' + t("nav_contact") + "</h2><ul><li>" + esc(L(c.address)) + '</li><li><a href="' + A.waLink() + '" target="_blank" rel="noopener noreferrer" dir="ltr">' + esc(c.phoneDisplay) + '</a></li><li><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li><li><a href="mailto:' + esc(c.clubEmail) + '">' + esc(c.clubEmail) + '</a></li><li><a href="' + esc(A.safeUrl(c.social.youtube)) + '" target="_blank" rel="noopener noreferrer">' + t("yt") + "</a></li></ul></div></div>" +
      '<div class="ft-b"><span>© ' + new Date().getFullYear() + " " + t("brand_full") + " · AAT World · " + t("since82") + ". " + t("footer_rights") + '</span><a href="#privacy">' + t("privacy") + "</a></div></div>";
  }

  W.AAT.ui = { newsWord: function () { return navT("@news"); }, ic: ic, logo: logo, NAV: NAV, header: header, footer: footer, tierBadge: tierBadge, head: head, crumbs: crumbs, pageHead: pageHead, contactButtons: contactButtons,
    companyCard: companyCard, productCard: productCard, articleCard: articleCard, newsCard: newsCard, eventRow: eventRow, tradeMap: tradeMap, newsletter: newsletter };
})(window);
