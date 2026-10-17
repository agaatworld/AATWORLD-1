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
    mail: "M3 6h18v12H3zM3 7l9 6 9-6", book: "M12 6.5C10.4 5.2 7.9 4.5 3 4.5v13.2c4.9 0 7.4.7 9 2 1.6-1.3 4.1-2 9-2V4.5c-4.9 0-7.4.7-9 2zM12 6.5v13.2M6 8.8c1.5.1 2.7.4 3.6.8M6 12.2c1.5.1 2.7.4 3.6.8M18 8.8c-1.5.1-2.7.4-3.6.8M18 12.2c-1.5.1-2.7.4-3.6.8", play: "M8 5l11 7-11 7z", pause: "M8 5v14M16 5v14",
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
    return '<div class="hd"><a class="hd-brand" href="#home" aria-label="' + esc(t("brand_full")) + '">' + logo(34) + "</a>" +
      '<nav class="hd-nav" aria-label="' + esc(t("menu")) + '">' + links + '<i class="hd-ind" aria-hidden="true"></i></nav>' +
      /* one plain language switch: "English" on the Arabic site, "العربية" on every other language (no dark mode, no advertise button in the header) */
      '<div class="hd-act"><button type="button" class="lang-b lang-sw" data-act="lang" data-lang="' + (A.state.lang === "ar" ? "en" : "ar") + '" lang="' + (A.state.lang === "ar" ? "en" : "ar") + '">' + ic("globe", 18) + "<span>" + (A.state.lang === "ar" ? "English" : "العربية") + "</span></button>" +
      '<button type="button" class="ib hd-menu" data-act="menu" aria-expanded="false" aria-controls="mnav" aria-label="' + esc(t("menu")) + '">' + ic("menu", 24) + "</button></div></div>" +
      '<nav id="mnav" class="mnav" hidden aria-label="' + esc(t("menu")) + '">' + links + '<div class="mnav-l">' + langItems() + "</div></nav>";
  }

  function tierBadge() { return ""; }
  function head(kicker, title, link) {
    return '<div class="sh"><div>' + '<h2 class="h2 split">' + title + "</h2></div>" + (link ? '<a class="more" href="#' + link[0] + '">' + link[1] + '<span class="flip">' + ic("arrow", 16) + "</span></a>" : "") + "</div>";
  }
  /* the owner asked for no "Home / page" trail on any page: the header menu is enough */
  function crumbs() { return ""; }
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
    var lg = A.articleLang(), pic = a.cut || a.img, pen = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3"/></svg>';
    return '<a class="ac rv' + (big ? " big" : "") + (a.cut ? " cut" : "") + '" href="#article-' + a.id + '">' + (pic ? '<span class="ac-img"><img src="' + img(pic) + '" alt="" loading="lazy"></span>' : "") +
      '<span class="ac-b"><b>' + esc(a.title[lg] || a.title.en || a.title.ar) + '</b><span class="ac-s">' + esc(a.sum[lg] || a.sum.en || a.sum.ar || "") + '</span>' + (a.author ? '<span class="ac-by">' + (a.face ? '<img src="' + img(a.face) + '" alt="" loading="lazy">' : "<i>" + pen + "</i>") + "<u>" + esc(String(a.author).replace(/\s*\([^)]*\)\s*$/, "")) + "</u>" + (a.face ? "<i>" + pen + "</i>" : "") + "</span>" : "") + (a.custom ? "" : "<small>" + t("ed_page", { n: a.pages[0] }) + "</small>") + "</span></a>";
  }
  function newsCard(n, i) {
    var b = A.newsBody[i];
    return '<a class="nc rv" href="#news-' + i + '"><span class="nc-img"><img src="' + img(n.img) + '" alt="" loading="lazy"></span><span class="nc-b">' + (b && b.date ? "<small>" + esc(A.fmtDate(b.date)) + "</small>" : "") + "<b>" + esc(L(n.title)) + "</b></span></a>";
  }
  var fmtCache = {};
  function eventRow(e) {
    var d = A.parseDate(e.start), days = A.daysUntil(e, new Date());
    var mon; try { var fk = A.state.lang; fmtCache[fk] = fmtCache[fk] || new Intl.DateTimeFormat(fk === "ar" ? "ar-u-nu-latn" : fk, { month: "short" }); mon = fmtCache[fk].format(d); } catch (x) { mon = d.getMonth() + 1; }
    var cn = (A.D.countries || {})[e.country];
    var when = e.approx ? A.fmtMonth(e.start) : A.fmtRange(e.start, e.end);
    return '<a class="er rv" data-c="' + (e.country || "") + '" href="#exhibition-' + e.id + '"><span class="er-d' + (e.approx ? " mo" : "") + '"><b>' + (e.approx ? esc(mon) : d.getDate()) + "</b><small>" + (e.approx ? d.getFullYear() : esc(mon)) + '</small></span><span class="er-b"><b>' + esc((A.state.lang === "ar" && e.nameAr || e.name)) + "</b>" + (e.sector ? '<em class="er-s">' + esc(L(e.sector)) + "</em>" : "") + "<small>" + esc(when) + (L(e.venue) ? " · " + esc(L(e.venue)) : "") + (cn ? " · " + esc(L(cn)) : "") + '</small></span><span class="er-n">' + (e.approx ? (A.state.lang === "ar" ? "اليوم يُعلن لاحقاً" : "Day to be announced") : days > 0 ? t("days_to_go", { n: days }) : t("on_now")) + "</span></a>";
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
  /* the messaging apps the AAT phone number works on */
  /* app icons: WhatsApp, Viber and LINE are the official logos (Simple Icons, CC0); Botim, imo and BiP are drawn as their name on the app's colour */
  var APP_IC = {"WhatsApp":{"c":"#25D366","p":"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"},"Viber":{"c":"#7360F2","p":"M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z"},"LINE":{"c":"#00C300","p":"M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"},"Botim":{"c":"#1A9BF0","w":"botim","fs":8.2},"Imo":{"c":"#2D8CF0","w":"imo","fs":10.5},"BiP":{"c":"#0A5CE6","w":"BiP","fs":10.5}};
  function appIcon(x) {
    var a = APP_IC[x]; if (!a) return esc(x);
    var g = a.p ? '<path fill="#fff" d="' + a.p + '"/>' : '<text x="12" y="12" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="' + a.fs + '" fill="#fff">' + esc(a.w) + "</text>";
    return '<span class="app-i" style="background:' + a.c + '"><svg viewBox="' + (a.p ? "-3 -3 30 30" : "0 0 24 24") + '" width="30" height="30" aria-hidden="true" focusable="false">' + g + '</svg></span><span class="sr">' + esc(x) + "</span>";
  }
  function apps() { var l = D.config.apps || []; return l.length ? '<ul class="apps" aria-label="' + (A.state.lang === "ar" ? "متاح على" : "Available on") + '">' + l.map(function (x) { return '<li title="' + esc(x) + '">' + appIcon(x) + "</li>"; }).join("") + "</ul>" : ""; }
  function footer() {
    var c = D.config, back = A.companies.filter(function (x) { return x.tier === "back"; })[0];
    return (back ? '<a class="bc" href="#company-' + back.page + '"><span class="wrap bc-in">' + (A.logoOf(back) ? '<img src="' + img(A.logoOf(back)) + '" alt="">' : "") + "<span><b>" + esc(back.company) + '</b></span><span class="bc-go">' + t("ed_open") + '<span class="flip">' + ic("arrow", 16) + "</span></span></span></a>" : "") +
      '<div class="wrap ft"><div class="ft-nl"><div><h2 class="h3">' + t("nl_title") + "</h2><p>" + t("nl_lead") + "</p></div>" + newsletter("ft-email") + "</div>" +
      '<div class="ft-g"><div class="ft-a"><a class="ft-brand" href="#home">' + logo(46) + '</a><p class="ft-n"><b>' + t("brand_full") + "</b><span>" + t("brand_other") + "</span></p><p>" + t("mb_claim") + "</p></div>" +
      '<div><h2 class="ft-h">' + t("footer_explore") + "</h2><ul>" + navList().slice(0, 5).map(function (n) { return '<li><a href="#' + n[0] + '">' + navT(n[1]) + "</a></li>"; }).join("") + '<li><a href="#advertise">' + t("adv_btn") + "</a></li></ul></div>" +
      '<div><h2 class="ft-h">' + t("nav_contact") + "</h2><ul><li>" + esc(L(c.address)) + '</li><li><a href="' + A.waLink() + '" target="_blank" rel="noopener noreferrer" dir="ltr">' + esc(c.phoneDisplay) + "</a>" + apps() + '</li><li><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li><li><a href="mailto:' + esc(c.clubEmail) + '">' + esc(c.clubEmail) + "</a></li></ul></div></div>" +
      '<div class="ft-b"><span>' + t("brand_full") + ' · <bdi dir="ltr">AAT (ARAB ASIAN TRADE)</bdi> · ' + t("since82") + ' · <span class="ft-r">' + t("footer_rights") + ' <bdi dir="ltr">© ' + new Date().getFullYear() + '</bdi></span></span><a href="#privacy">' + t("privacy") + "</a></div></div>";
  }

  W.AAT.ui = { newsWord: function () { return navT("@news"); }, ic: ic, logo: logo, NAV: NAV, header: header, footer: footer, tierBadge: tierBadge, head: head, crumbs: crumbs, pageHead: pageHead, contactButtons: contactButtons,
    companyCard: companyCard, productCard: productCard, articleCard: articleCard, newsCard: newsCard, eventRow: eventRow, tradeMap: tradeMap, newsletter: newsletter, apps: apps };
})(window);
