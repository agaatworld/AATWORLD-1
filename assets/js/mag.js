/* AAT World v3 — digital editions of the magazine, built into the site.
   One goal: show the advertiser, then send the reader to the advertiser's own website.
   Adds: the advertiser spotlight at the top of the home page, a "Digital editions" page under Magazine
   (reels, company guide, arcade, orbit, discover, spotlight), and a main "Visit website" button on company pages.
   Uses the site's own data, routes, colours and fonts; nothing here changes the existing pages' structure. */
(function (W) {
  "use strict";
  var A = W.AAT, doc = document;
  if (!A || !A.views) return;
  var esc = A.esc, L = A.L, img = A.img;
  var still = !!(W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- words (English and Arabic; other languages read the English) ---------- */
  var TXT = {
    en: { visit: "Visit website", contact: "Contact", details: "Details", products: "Products", lines: "Product lines", read: "Read", article: "Article", sponsored: "Sponsored", spot: "Advertiser spotlight",
      digital: "Digital editions", digitalLead: "The issue as reels you can swipe through. Every advertiser leads to its own website.", allCos: "All companies", more: "More ways to browse this issue",
      v_reels: "Reels", v_guide: "Company guide", v_souq: "Arcade", v_wall: "Souq wall", v_brand: "Brand pages", d_brand: "Each advertiser opens as its own page, in its own colours and words.", d_wall: "Every advertiser in one view. Press a logo and it opens.", v_orbit: "Orbit", v_play: "Discover", v_spot: "Spotlight",
      d_reels: "Swipe up through the advertisers, one screen each.", d_guide: "One company per screen: logo, products, details.", d_souq: "Walk past every storefront.", d_orbit: "Logos circle the issue; pick an industry.", d_play: "Spin for an industry, get three picks.", d_spot: "One advertiser at a time, front and centre.",
      full: "Full screen", exit: "Close", swipe: "Swipe up or sideways", next: "Up next", all: "All industries", spin: "Spin", adv: "advertisers", copied: "Link copied", share: "Share", of: "of", back: "Back", tapLogo: "Logos change every few seconds. Tap one to open the company.", drag: "Drag sideways", playAll: "Play all", onsite: "This section has no text we could bring in. Use Visit website to open it on the company's own site.", dir: "Swipe direction", swipeH: "Swipe sideways" },
    ar: { visit: "زيارة الموقع", contact: "تواصل", details: "التفاصيل", products: "المنتجات", lines: "خطوط المنتجات", read: "اقرأ", article: "مقال", sponsored: "إعلان", spot: "معلن تحت الضوء",
      digital: "الإصدارات الرقمية", digitalLead: "العدد في مقاطع تتصفحها بالسحب. وكل معلن يقودك إلى موقعه.", allCos: "كل الشركات", more: "طرق أخرى لتصفح هذا العدد",
      v_reels: "مقاطع", v_guide: "دليل الشركات", v_souq: "الرواق", v_wall: "جدار السوق", v_brand: "صفحات الشركات", d_brand: "كل معلن يفتح كصفحته الخاصة بألوانه وكلماته.", d_wall: "كل المعلنين في نظرة واحدة. اضغط شعارًا ليفتح.", v_orbit: "المدار", v_play: "اكتشف", v_spot: "تحت الضوء",
      d_reels: "اسحب للأعلى بين المعلنين، شاشة لكل معلن.", d_guide: "شركة في كل شاشة: الشعار والمنتجات والتفاصيل.", d_souq: "تجوّل أمام كل الواجهات.", d_orbit: "الشعارات تدور حول العدد؛ اختر صناعة.", d_play: "دوّر لتحصل على صناعة وثلاثة اختيارات.", d_spot: "معلن واحد في كل مرة في الواجهة.",
      full: "ملء الشاشة", exit: "إغلاق", swipe: "اسحب للأعلى أو جانبًا", next: "التالي", all: "كل الصناعات", spin: "دوّر", adv: "معلنًا", copied: "تم نسخ الرابط", share: "مشاركة", of: "من", back: "رجوع", tapLogo: "الشعارات تتبدل كل بضع ثوانٍ. اضغط أحدها لفتح الشركة.", drag: "اسحب جانبًا", playAll: "تشغيل الكل", onsite: "لا يوجد نص أمكن جلبه لهذا القسم. استخدم زر زيارة الموقع لفتحه في موقع الشركة.", dir: "اتجاه السحب", swipeH: "اسحب جانبًا" }
  };
  function t(k) { return (TXT[A.state.lang] || TXT.en)[k] || TXT.en[k] || k; }
  var VERS = ["reels"], HOME = VERS.indexOf(W.AAT_MZ_HOME) > -1 || W.AAT_MZ_HOME === "shelf" ? W.AAT_MZ_HOME : "spot";
  var COL = { machinery: "#E8890C", plastics: "#0E9F6E", tools: "#2563EB", auto: "#DC2626", hardware: "#7C3AED", fitness: "#0891B2", medical: "#0D9488", food: "#CA8A04", event: "#EA580C", instruments: "#65A30D", services: "#475569", consumer: "#DB2777", chemicals: "#16A34A" };
  var SHORT = { machinery: { en: "Machines", ar: "آلات" }, plastics: { en: "Plastics", ar: "بلاستيك" }, tools: { en: "Tools", ar: "عدد" }, auto: { en: "Auto", ar: "سيارات" }, hardware: { en: "Hardware", ar: "خردوات" }, fitness: { en: "Fitness", ar: "لياقة" }, medical: { en: "Medical", ar: "طبي" }, food: { en: "Food", ar: "أغذية" }, event: { en: "Shows", ar: "معارض" }, instruments: { en: "Instruments", ar: "أجهزة" }, services: { en: "Services", ar: "خدمات" }, consumer: { en: "Care", ar: "عناية" }, chemicals: { en: "Chemicals", ar: "كيماويات" } };

  /* ---------- the issue, read through the site's own model ---------- */
  function col(c) { return COL[c.cat] || "#6B7280"; }
  function catName(k) { return L(A.cats[k]) || k; }
  function shortName(k) { var s = SHORT[k]; return s ? (s[A.state.lang] || s.en) : catName(k); }
  function clip(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s; }
  function ads() { return A.companies.slice(); }
  function adsIn(k) { return A.companies.filter(function (c) { return c.cat === k; }); }
  function cats() { return Object.keys(A.cats).filter(function (k) { return adsIn(k).length; }).sort(function (a, b) { return adsIn(b).length - adsIn(a).length; }); }
  /* only photos taken from the advertiser's own website; cut-outs from the printed page are not used here */
  function prods(c) { return A.productsOf(c).filter(function (it) { return it.img && it.src !== "ad"; }); }
  function lines(c) { var seen = {}, out = []; A.productsOf(c).map(function (it) { return it.n; }).concat((c.hot || []).map(function (h) { return h.name; })).forEach(function (n) { if (n && !seen[n] && out.length < 6) { seen[n] = 1; out.push(n); } }); return out; }
  function logo(c) { var l = A.logoOf(c); return l ? img(l) : ""; }
  function web(c) { return A.safeUrl(c.web); }
  function domain(u) { return String(u || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, ""); }
  function arts() { return A.articlesFor(A.state.lang).filter(function (a) { return A.state.lang === "ar" || !a.fresh; }); }
  function aTitle(a) { var g = A.articleLang(); return a.title[g] || a.title.en || a.title.ar || ""; }
  function aSum(a) { var g = A.articleLang(); return a.sum[g] || a.sum.en || a.sum.ar || ""; }
  function seq() { return ads().map(function (c) { return { ad: c, p: c.page }; }).concat(arts().map(function (a) { return { art: a, p: a.pages[0] }; })).sort(function (x, y) { return x.p - y.p; }); }
  function hrefCo(c, tab) { return "#company-" + c.page + (tab ? "." + tab : ""); }

  /* the one main action */
  function cta(c, cls) {
    var u = web(c);
    if (u) return '<a class="mz-cta ' + (cls || "") + '" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><span><b>' + t("visit") + "</b><small>" + esc(domain(u)) + '</small></span><i aria-hidden="true">↗</i></a>';
    return '<a class="mz-cta mz-off ' + (cls || "") + '" href="' + hrefCo(c, "contact") + '"><span><b>' + t("contact") + "</b><small>" + esc(c.tel || c.email || "") + "</small></span></a>";
  }
  /* the moving picture of an ad: website photos cross-fading, or the logo with the product lines */
  function media(c) {
    var ps = prods(c), lg = logo(c);
    if (ps.length) return '<span class="mz-media" style="--c:' + col(c) + '">' + ps.map(function (p, i) { return '<img class="' + (i ? "" : "on") + '" src="' + img(p.img) + '" alt="' + (i ? "" : esc(p.n)) + '" loading="' + (i ? "lazy" : "eager") + '">'; }).join("") + "</span>";
    return '<span class="mz-media mz-brand" style="--c:' + col(c) + '">' + (lg ? '<img class="mz-blogo" src="' + lg + '" alt="' + esc(c.company) + '">' : "") + '<span class="mz-lines">' + lines(c).map(function (n) { return "<span>" + esc(clip(n, 24)) + "</span>"; }).join("") + "</span></span>";
  }
  if (!still) setInterval(function () {
    Array.prototype.forEach.call(doc.querySelectorAll(".mz-media:not(.mz-brand)"), function (m) { var im = m.children, n = im.length; if (n < 2 || !m.offsetParent) return; for (var i = 0; i < n; i++) if (im[i].classList.contains("on")) { im[i].classList.remove("on"); im[(i + 1) % n].classList.add("on"); break; } });
  }, 2600);

  /* per-mount bookkeeping so nothing keeps running after the page changes */
  function ctx() {
    var offs = [], alive = true;
    return { on: function (el, ev, fn, o) { el.addEventListener(ev, fn, o); offs.push(function () { el.removeEventListener(ev, fn, o); }); },
      every: function (ms, fn) { var id = setInterval(fn, ms); offs.push(function () { clearInterval(id); }); },
      later: function (ms, fn) { var id = setTimeout(function () { if (alive) fn(); }, ms); offs.push(function () { clearTimeout(id); }); },
      raf: function (fn) { (function loop(ts) { if (!alive) return; fn(ts || 0); requestAnimationFrame(loop); })(0); },
      alive: function () { return alive; }, off: function () { alive = false; offs.forEach(function (f) { f(); }); } };
  }
  function q(root, s) { return root.querySelector(s); }
  function qa(root, s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }
  var IC = { info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>', grid: '<svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>', share: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>', full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>', x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>' };

  var COMP = {};

  /* ===== 1. Spotlight: one advertiser at a time, every logo moving underneath ===== */
  COMP.spot = function (root, c, opt) {
    var list = ads(), i = 0, prog = 0, hold = false, d = null, rows = (opt && opt.rows) || 2;
    function slide(from) {
      var x = list[i], lg = logo(x);
      q(root, ".mz-spot-st").innerHTML = '<div class="mz-spot-card" style="--c:' + col(x) + ";--from:" + (from || 0) + 'px"><i class="mz-blob"></i><a class="mz-spot-pic" href="' + hrefCo(x) + '" aria-label="' + esc(x.company) + '">' + media(x) + "</a>" +
        '<div class="mz-spot-info"><span class="mz-tag">' + t("spot") + " · " + esc(shortName(x.cat)) + '</span><a class="mz-who" href="' + hrefCo(x) + '">' + (lg ? '<span class="mz-lg"><img src="' + lg + '" alt=""></span>' : "") + "<span><b>" + esc(x.company) + "</b><small>" + esc(L(x.city)) + "</small></span></a>" +
        "<p>" + esc(L(x.about)) + '</p><div class="mz-acts">' + cta(x) + '<a class="btn btn-line" href="' + hrefCo(x) + '">' + t("details") + "</a></div></div></div>";
      qa(root, ".mz-tile").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-p") === x.page); });
      q(root, ".mz-pos").textContent = (i + 1) + " / " + list.length;
    }
    function go(n) { i = (i + n + list.length) % list.length; prog = 0; slide(n > 0 ? 40 : -40); }
    var withLogo = list.filter(logo), wall = "";
    for (var r = 0; r < rows; r++) { var part = withLogo.filter(function (_, k) { return k % rows === r; }), one = part.map(function (x) { return '<button type="button" class="mz-tile" data-mz="pick" data-p="' + x.page + '" aria-label="' + esc(x.company) + '"><img src="' + logo(x) + '" alt="" loading="lazy"></button>'; }).join(""); wall += '<div class="mz-wrow"><div class="mz-wtrack" style="--t:' + (part.length * 4) + 's">' + one + one + "</div></div>"; }
    root.innerHTML = '<div class="mz-spot"><div class="mz-spot-st"></div><button type="button" class="mz-arr l" data-mz="prev" aria-label="Previous">‹</button><button type="button" class="mz-arr r" data-mz="next" aria-label="Next">›</button>' +
      '<div class="mz-tline"><div class="mz-tbar"><i></i></div><span class="mz-pos"></span></div><div class="mz-wall" dir="ltr">' + wall + "</div></div>";
    slide(0);
    c.on(root, "click", function (ev) { var b = ev.target.closest("[data-mz]"); if (!b) return; var a = b.getAttribute("data-mz"); if (a === "next") go(1); else if (a === "prev") go(-1); else if (a === "pick") { var p = +b.getAttribute("data-p"); for (var k = 0; k < list.length; k++) if (list[k].page === p) { i = k; prog = 0; slide(40); break; } } });
    var st = q(root, ".mz-spot-st");
    c.on(st, "pointerdown", function (ev) { if (ev.target.closest("a.mz-cta,.btn")) return; d = { x: ev.clientX, y: ev.clientY, dx: 0, on: false }; });
    c.on(W, "pointermove", function (ev) { if (!d) return; var dx = ev.clientX - d.x, dy = ev.clientY - d.y; if (!d.on) { if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.3) d.on = true; else return; } d.dx = dx; var k = q(root, ".mz-spot-card"); if (k) { k.style.animation = "none"; k.style.transform = "translateX(" + dx + "px)"; } });
    function end() { if (!d) return; var z = d; d = null; if (!z.on) return; st._drag = true; setTimeout(function () { st._drag = false; }, 60); if (Math.abs(z.dx) > 60) go(z.dx < 0 ? 1 : -1); else { var k = q(root, ".mz-spot-card"); if (k) k.style.transform = ""; } }
    c.on(W, "pointerup", end); c.on(W, "pointercancel", end);
    c.on(st, "click", function (ev) { if (st._drag) { ev.preventDefault(); ev.stopPropagation(); st._drag = false; } }, true);
    c.on(st, "pointerenter", function (ev) { if (ev.pointerType === "mouse") hold = true; }); c.on(st, "pointerleave", function () { hold = false; });
    if (!still) c.every(110, function () { if (hold || d || doc.hidden) return; var r = root.getBoundingClientRect(); if (r.bottom < 60 || r.top > W.innerHeight - 60) return; prog += 2; q(root, ".mz-tbar i").style.width = prog + "%"; if (prog >= 100) go(1); });
  };

  /* ===== 2 and 3. Reels: full-bleed, swipe up. "guide" turns each reel into a company guide ===== */
  function fullBtn() { return '<button type="button" class="mz-fs" data-mz="full" aria-label="' + t("full") + '">' + IC.full + "</button>"; }
  function reelShell(root, c, slides, storyAds, auto) {
    var i = 0, prog = 0, touch = false, hinted = false;
    root.innerHTML = '<div class="mz-reel"><div class="mz-phone"><div class="mz-feed">' + slides.join("") + '</div><div class="mz-rtop"><div class="mz-tbar"><i></i></div><div class="mz-rrow"><div class="mz-stories" dir="ltr">' +
      storyAds.map(function (x) { return '<button type="button" class="mz-st" data-mz="jump" data-k="' + x.k + '" aria-label="' + esc(x.c.company) + '"><img src="' + logo(x.c) + '" alt="" loading="lazy"></button>'; }).join("") + "</div>" + '<button type="button" class="mz-fs mz-dirb" data-mz="dir" hidden></button>' + fullBtn() + '</div></div><span class="mz-hint"></span></div></div>';
    var box = q(root, ".mz-reel"), feed = q(box, ".mz-feed"), n = slides.length;
    var hz = false, kids = feed.children;
    function to(k, smooth) { k = (k + n) % n; var o = { behavior: smooth && !still ? "smooth" : "auto" }; if (hz) o.left = k * feed.clientWidth; else o.top = k * feed.clientHeight; feed.scrollTo(o); }
    function cur() { for (var j = 0; j < n; j++) kids[j].classList.toggle("mz-cur", Math.abs(j - i) <= 2); for (var d2 = 1; d2 <= 4; d2++) if (kids[i + d2]) qa(kids[i + d2], "img").forEach(function (im) { im.loading = "eager"; if (im.decode && !im._mzd) { im._mzd = 1; im.decode().catch(function () {}); } }); }
    /* fetch every picture of the reel in the background, nearest slides first, so nothing loads while swiping */
    c.later(500, function () { var all = qa(feed, 'img[loading="lazy"]'), k = 0; (function more() { for (var z = 0; z < 8 && k < all.length; z++, k++) all[k].loading = "eager"; if (k < all.length) c.later(220, more); })(); });
    function setDir(h) { var k = i; hz = h; box.style.setProperty("--mzdir", A.dir()); feed.classList.toggle("mz-h", hz); q(box, ".mz-dirb").textContent = hz ? "↔" : "↕"; var hn = q(box, ".mz-hint"); hn.textContent = hz ? "← " + t("swipeH") + " →" : "↑ " + t("swipe"); try { localStorage.setItem("mz-dir", hz ? "h" : "v"); } catch (e) { /* storage unavailable */ } feed.style.scrollSnapType = "none"; to(k, false); requestAnimationFrame(function () { to(k, false); feed.style.scrollSnapType = ""; }); }
    function marks() { qa(box, ".mz-st").forEach(function (b) { var on = +b.getAttribute("data-k") === i; b.classList.toggle("now", on); if (on) { var s = q(box, ".mz-stories"); s.scrollLeft = b.offsetLeft - 90; } }); }
    c.on(feed, "scroll", function () { var h = hz ? feed.clientWidth : feed.clientHeight; if (!h) return; var k = Math.round((hz ? feed.scrollLeft : feed.scrollTop) / h); if (k !== i) { i = k; prog = 0; cur(); if (!hinted) { hinted = true; q(box, ".mz-hint").hidden = true; } marks(); } }, { passive: true });
    c.on(feed, "pointerdown", function () { touch = true; }); c.on(W, "pointerup", function () { touch = false; });
    /* full screen: the reel moves to the top of the page so nothing of the site sits over it, and moves back on close */
    function setFull(on) { if (on) doc.body.appendChild(box); else root.appendChild(box); box.classList.toggle("mz-full", on); doc.documentElement.classList.toggle("mz-lock", on); var fb = q(box, '.mz-fs[data-mz="full"]'); fb.innerHTML = on ? IC.x : IC.full; fb.setAttribute("aria-label", on ? t("exit") : t("full")); var k = i; requestAnimationFrame(function () { to(k, false); }); }
    c.on(box, "click", function (ev) {
      var b = ev.target.closest("[data-mz]"); if (!b) return; var a = b.getAttribute("data-mz");
      if (a === "jump") to(+b.getAttribute("data-k"), false);
      else if (a === "full") setFull(!box.classList.contains("mz-full"));
      else if (a === "dir") setDir(!hz);
      else if (a === "share") { var u = b.getAttribute("data-u"); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { var s = b.querySelector("small"); if (s) { var o = s.textContent; s.textContent = t("copied"); setTimeout(function () { s.textContent = o; }, 1300); } }).catch(function () {}); }
    });
    c.on(W, "resize", function () { to(i, false); });
    c.on(doc, "keydown", function (ev) { if (ev.key === "Escape" && box.classList.contains("mz-full")) setFull(false); });
    c.on(doc, "keydown", function (ev) { var r = box.getBoundingClientRect(); if (r.bottom < 80 || r.top > W.innerHeight - 80 || /INPUT|TEXTAREA/.test((ev.target || {}).tagName || "")) return; var rtl = A.dir() === "rtl", d = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[ev.key]; if (d && i + d >= 0 && i + d < n) { ev.preventDefault(); to(i + d, true); } });
    /* sideways swipes work too, any time: the screen follows the finger, then the next reel slides in */
    var g = null;
    function side(d, sgn) { var k = i + d; if (k < 0 || k >= n) { feed.style.transition = "transform .2s ease-out"; feed.style.transform = ""; return; }
      feed.style.transition = "transform .16s ease-in, opacity .16s"; feed.style.transform = "translateX(" + (-sgn * 45) + "%)"; feed.style.opacity = "0";
      c.later(160, function () { to(k, false); feed.style.transition = "none"; feed.style.transform = "translateX(" + (sgn * 45) + "%)"; void feed.offsetWidth; feed.style.transition = "transform .24s cubic-bezier(.2,.8,.2,1), opacity .2s"; feed.style.transform = ""; feed.style.opacity = ""; }); }
    c.on(feed, "touchstart", function (ev) { var t1 = ev.touches[0], inner = ev.target.closest && ev.target.closest(".mz-bnav > div, .mz-prow, .mz-bstrip"); g = ev.touches.length === 1 && !(inner && inner.scrollWidth > inner.clientWidth + 4) ? { x: t1.clientX, y: t1.clientY, lock: 0 } : null; }, { passive: true });
    c.on(feed, "touchmove", function (ev) { if (!g) return; var t1 = ev.touches[0], dx = t1.clientX - g.x, dy = t1.clientY - g.y; if (!g.lock && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) g.lock = Math.abs(dx) > Math.abs(dy) * 1.2 ? 1 : 2; if (g.lock === 1) { g.dx = dx; feed.style.transition = "none"; feed.style.transform = "translateX(" + dx * .85 + "px)"; } }, { passive: true });
    c.on(feed, "touchend", function () { if (!g || g.lock !== 1) { g = null; return; } var dx = g.dx || 0, rtl = A.dir() === "rtl"; g = null; if (Math.abs(dx) < 56) { feed.style.transition = "transform .2s ease-out"; feed.style.transform = ""; return; } var sgn = dx < 0 ? 1 : -1; side(rtl ? -sgn : sgn, sgn); }, { passive: true });
    box._mz = { open: function (k) { setFull(true); i = k; marks(); cur(); requestAnimationFrame(function () { to(k, false); }); } };
    marks(); cur(); setDir(hz);
    if (auto && !still) c.every(100, function () { if (touch || doc.hidden) return; var r = feed.getBoundingClientRect(); if (r.bottom < 120 || r.top > W.innerHeight - 120) return; prog += 100 / (auto * 10); q(box, ".mz-tbar i").style.width = Math.min(100, prog) + "%"; if (prog >= 100) { prog = 0; to(i + 1, true); } });
    return function () { doc.documentElement.classList.remove("mz-lock"); if (box.parentNode === doc.body) doc.body.removeChild(box); };
  }
  function rail(x) {
    var u = web(x);
    return '<span class="mz-rail"><a href="' + hrefCo(x) + '">' + IC.info + "<small>" + t("details") + '</small></a><a href="' + hrefCo(x, "products") + '">' + IC.grid + "<small>" + t("products") + "</small></a>" + (u ? '<button type="button" data-mz="share" data-u="' + esc(u) + '">' + IC.share + "<small>" + t("share") + "</small></button>" : "") + "</span>";
  }
  COMP.reels = function (root, c) {
    var s = seq(), story = [];
    var slides = s.map(function (o, k) {
      if (o.ad) { var x = o.ad, lg = logo(x); if (lg) story.push({ c: x, k: k });
        return '<section class="mz-slide" style="--c:' + col(x) + '">' + media(x) + rail(x) + '<div class="mz-cap"><a class="mz-who" href="' + hrefCo(x) + '">' + (lg ? '<span class="mz-lg"><img src="' + lg + '" alt=""></span>' : "") + "<span><b>" + esc(x.company) + "</b><small>" + t("sponsored") + " · " + esc(catName(x.cat)) + "</small></span></a><p>" + esc(L(x.about)) + "</p>" + cta(x) + "</div></section>"; }
      var a = o.art;
      return '<section class="mz-slide mz-art"' + (a.img ? ' style="--bgi:url(&quot;' + esc(img(a.img)) + '&quot;)"' : "") + '>' + (a.img ? '<img class="mz-bg" src="' + img(a.img) + '" alt="" loading="lazy">' : "") + '<div class="mz-cap"><span class="mz-tag">' + t("article") + "</span><h3>" + esc(aTitle(a)) + "</h3><p>" + esc(aSum(a)) + '</p><a class="mz-read" href="#article-' + esc(a.id) + '">' + t("read") + "</a></div></section>";
    });
    return reelShell(root, c, slides, story, 7);
  };
  COMP.guide = function (root, c) {
    var list = ads(), story = [];
    var slides = list.map(function (x, k) {
      var ps = prods(x), lg = logo(x), u = web(x), row; if (lg) story.push({ c: x, k: k });
      if (ps.length) row = ps.map(function (p) { var inner = '<span class="mz-ph"><img src="' + img(p.img) + '" alt="" loading="lazy"></span><b>' + esc(p.n) + "</b>"; var pu = A.safeUrl(p.url); return pu ? '<a class="mz-pc" href="' + esc(pu) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>" : '<span class="mz-pc">' + inner + "</span>"; }).join("");
      else row = lines(x).map(function (nm, j) { return '<span class="mz-pc mz-ln"><em>' + (j < 9 ? "0" : "") + (j + 1) + "</em><b>" + esc(nm) + "</b></span>"; }).join("");
      var facts = [L(x.city), x.certs, x.tel, x.email].filter(Boolean).map(function (f) { return "<span>" + esc(f) + "</span>"; }).join("");
      return '<section class="mz-slide mz-g" style="--c:' + col(x) + '"><a class="mz-ban" href="' + hrefCo(x) + '">' + (lg ? '<span class="mz-lg"><img src="' + lg + '" alt=""></span>' : "") + "<span><small>" + esc(catName(x.cat)) + " · " + (k + 1) + " / " + list.length + "</small><b>" + esc(x.company) + "</b><small>" + esc(L(x.city)) + (u ? " · " + esc(domain(u)) : "") + "</small></span></a>" +
        (row ? '<div class="mz-sub"><span>' + t(ps.length ? "products" : "lines") + "</span><span>" + t("drag") + '</span></div><div class="mz-prow">' + row + "</div>" : '<div class="mz-prow"></div>') +
        '<div class="mz-gabout"><p>' + esc(L(x.about)) + '</p><div class="mz-facts">' + facts + "</div></div><div class=\"mz-gft\">" + cta(x) + '<a class="btn btn-line" href="' + hrefCo(x) + '">' + t("details") + "</a></div></section>";
    });
    return reelShell(root, c, slides, story, 0);
  };

  /* ===== 4. Arcade: storefronts in the issue's order, articles between them ===== */
  COMP.souq = function (root, c) {
    var h = "";
    seq().forEach(function (o) {
      if (o.ad) { var x = o.ad, lg = logo(x);
        h += '<article class="mz-store" style="--c:' + col(x) + '"><a class="mz-fascia" href="' + hrefCo(x) + '">' + (lg ? '<span class="mz-lg"><img src="' + lg + '" alt="" loading="lazy"></span>' : "") + "<span><small>" + esc(catName(x.cat)) + "</small><b>" + esc(x.company) + "</b><small>" + esc(L(x.city)) + '</small></span></a><a class="mz-win" href="' + hrefCo(x, "products") + '" aria-label="' + t("products") + '">' + media(x) + '</a><div class="mz-base">' + cta(x, "mz-sm") + "</div></article>"; }
      else { var a = o.art; h += '<a class="mz-edit" href="#article-' + esc(a.id) + '">' + (a.img ? '<span class="mz-eph"><img src="' + img(a.img) + '" alt="" loading="lazy"></span>' : "") + '<span class="mz-etx"><small>' + t("article") + "</small><b>" + esc(aTitle(a)) + "</b><u>" + t("read") + " →</u></span></a>"; }
    });
    var s = seq();
    root.innerHTML = '<div class="mz-souq"><div class="mz-street" dir="ltr"><div class="mz-lane" dir="' + A.dir() + '">' + h + '</div></div><div class="mz-mini" dir="ltr">' + s.map(function (o) { return '<i class="' + (o.ad ? "a" : "r") + '"></i>'; }).join("") + "<u></u></div></div>";
    var st = q(root, ".mz-street"), mini = q(root, ".mz-mini"), mk = q(root, ".mz-mini u"), d = null, moved = false;
    function mark() { var max = st.scrollWidth - st.clientWidth, r = max > 0 ? Math.abs(st.scrollLeft) / max : 0; mk.style.left = (r * (mini.clientWidth - 12)) + "px"; }
    c.on(st, "scroll", mark, { passive: true }); c.on(W, "resize", mark); mark();
    c.on(mini, "click", function (ev) { var b = mini.getBoundingClientRect(), r = Math.max(0, Math.min(1, (ev.clientX - b.left) / b.width)); st.scrollTo({ left: r * (st.scrollWidth - st.clientWidth), behavior: still ? "auto" : "smooth" }); });
    c.on(st, "pointerdown", function (ev) { if (ev.pointerType !== "mouse") return; d = { x: ev.clientX, s: st.scrollLeft }; moved = false; });
    c.on(W, "pointermove", function (ev) { if (!d) return; var dx = ev.clientX - d.x; if (Math.abs(dx) > 6) moved = true; st.scrollLeft = d.s - dx; });
    c.on(W, "pointerup", function () { d = null; });
    c.on(st, "click", function (ev) { if (moved) { ev.preventDefault(); ev.stopPropagation(); moved = false; } }, true);
  };

  /* ===== 5. Orbit: logos circle the issue and change every few seconds; industries on the outer ring ===== */
  COMP.orbit = function (root, c) {
    var S = { cat: null, ang: 0, vel: 0, batch: 0 }, B = [], drag = null, moved = false, last = 0, all = ads(), ks = cats();
    root.innerHTML = '<div class="mz-orbit"><button type="button" class="btn btn-line mz-oback" data-mz="back" hidden></button><div class="mz-ring r0"></div><div class="mz-ring r1"></div><button type="button" class="mz-sun" data-mz="sun"></button><div class="mz-bodies"></div><p class="mz-otip">' + t("tapLogo") + "</p></div>";
    var sp = q(root, ".mz-orbit"), bodies = q(root, ".mz-bodies");
    function build() {
      var list = [];
      function moon(x) { var lg = logo(x); list.push({ ring: 0, html: '<a class="mz-b mz-moon" href="' + hrefCo(x) + '" style="--c:' + col(x) + '"><span class="mz-orb">' + (lg ? '<img src="' + lg + '" alt="">' : "") + '</span><span class="mz-lbl">' + esc(clip(x.company, 20)) + "</span></a>" }); }
      if (!S.cat) { for (var k = 0; k < 5; k++) moon(all[(S.batch * 5 + k) % all.length]);
        ks.forEach(function (key) { var n = adsIn(key).length; list.push({ ring: 1, html: '<button type="button" class="mz-b mz-planet" data-mz="cat" data-k="' + key + '" style="--c:' + (COL[key] || "#6B7280") + '"><span class="mz-orb"><b>' + n + '</b></span><span class="mz-lbl">' + esc(shortName(key)) + "</span></button>" }); });
      } else adsIn(S.cat).forEach(moon);
      var cnt = [0, 0]; list.forEach(function (b) { b.i = cnt[b.ring]++; });
      bodies.innerHTML = list.map(function (b) { return b.html; }).join("");
      B = list.map(function (b, k) { return { el: bodies.children[k], ring: b.ring, a0: b.i / cnt[b.ring] * Math.PI * 2 }; });
      q(root, ".mz-oback").hidden = !S.cat; q(root, ".mz-oback").textContent = "‹ " + t("all");
      q(root, ".mz-sun").innerHTML = S.cat ? esc(shortName(S.cat)) + "<small>" + adsIn(S.cat).length + " " + t("adv") + "</small>" : "AAT<small>" + A.IS.number + "</small>";
      place();
    }
    function place() {
      var w = sp.clientWidth, h = sp.clientHeight; if (!w) return; var cx = w / 2, cy = h / 2;
      var rx = [Math.max(64, Math.min(w * 0.27, 190)), Math.max(110, Math.min(w / 2 - 34, 400))], ry = [Math.max(60, Math.min(h * 0.24, 130)), Math.max(104, Math.min(h / 2 - 44, 230))];
      [0, 1].forEach(function (k) { var r = q(root, ".mz-ring.r" + k); r.style.width = rx[k] * 2 + "px"; r.style.height = ry[k] * 2 + "px"; r.style.left = (cx - rx[k]) + "px"; r.style.top = (cy - ry[k]) + "px"; });
      B.forEach(function (b) { var a = b.a0 + (b.ring ? -S.ang * 0.7 : S.ang), x = cx + rx[b.ring] * Math.cos(a), y = cy + ry[b.ring] * Math.sin(a); b.el.style.transform = "translate(" + (x - b.el.offsetWidth / 2) + "px," + (y - b.el.offsetHeight / 2) + "px) scale(" + (0.88 + 0.12 * Math.sin(a)) + ")"; b.el.style.zIndex = Math.round(10 + y); });
    }
    c.on(sp, "pointerdown", function (ev) { drag = { x: ev.clientX }; moved = false; });
    c.on(W, "pointermove", function (ev) { if (!drag) return; var dx = ev.clientX - drag.x; if (Math.abs(dx) > 6) moved = true; var r = sp.getBoundingClientRect(), up = ev.clientY < r.top + r.height / 2 ? 1 : -1, d = dx * up / 170; S.ang += d; S.vel = d * 0.5; drag.x = ev.clientX; if (still) place(); });
    c.on(W, "pointerup", function () { drag = null; });
    c.on(sp, "click", function (ev) { if (moved) { ev.preventDefault(); ev.stopPropagation(); moved = false; return; } var b = ev.target.closest("[data-mz]"); if (!b) return; var a = b.getAttribute("data-mz"); if (a === "cat") { S.cat = b.getAttribute("data-k"); build(); } else if (a === "back" || (a === "sun" && S.cat)) { S.cat = null; build(); } else if (a === "sun") S.vel += 0.14; }, true);
    c.on(W, "resize", place);
    build();
    if (!still) { c.raf(function (ts) { var dt = last ? Math.min(50, ts - last) : 16; last = ts; if (!drag) S.ang += dt * 0.00013; S.ang += S.vel; S.vel *= 0.94; place(); }); c.every(5200, function () { if (!S.cat && !drag && !doc.hidden) { S.batch++; build(); } }); }
  };

  /* ===== 6. Discover: spin for an industry, get two advertisers and an article ===== */
  COMP.play = function (root, c) {
    var ks = cats(), N = ks.length, SEG = 360 / N, rot = 0, busy = false, d = null;
    var grad = ks.map(function (k, i) { return (COL[k] || "#6B7280") + " " + (i * SEG) + "deg " + ((i + 1) * SEG) + "deg"; }).join(",");
    root.innerHTML = '<div class="mz-play"><div class="mz-wheelbox"><span class="mz-pin"></span><div class="mz-wheel" style="background:conic-gradient(' + grad + ')">' + ks.map(function (k, i) { return '<span class="mz-wl" style="transform:rotate(' + (i * SEG + SEG / 2) + 'deg)"><span>' + esc(shortName(k)) + "</span></span>"; }).join("") + '</div><button type="button" class="mz-spin" data-mz="spin">' + t("spin") + '</button></div><div class="mz-pright"><div class="mz-result"></div><div class="mz-hand"></div></div></div>';
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
    function deal(k, flipped) {
      var two = shuffle(adsIn(k)).slice(0, 2), as = shuffle(arts()).slice(0, 3 - two.length), cl = COL[k] || "#6B7280";
      q(root, ".mz-result").innerHTML = '<b style="--c:' + cl + '">' + esc(catName(k)) + "</b><small>" + adsIn(k).length + " " + t("adv") + "</small>";
      q(root, ".mz-hand").innerHTML = two.map(function (x) { var ps = prods(x), pic = ps.length ? img(ps[0].img) : logo(x); return '<div class="mz-fc' + (flipped ? " flip" : "") + '" style="--c:' + cl + '"><div class="mz-in"><span class="mz-bk">AAT</span><div class="mz-ft"><a class="mz-fpic" href="' + hrefCo(x) + '">' + (pic ? '<img src="' + pic + '" alt="">' : "") + '</a><a class="mz-fnm" href="' + hrefCo(x) + '"><b>' + esc(x.company) + "</b></a>" + cta(x, "mz-sm") + "</div></div></div>"; }).join("") +
        as.map(function (a) { return '<div class="mz-fc' + (flipped ? " flip" : "") + '"><div class="mz-in"><span class="mz-bk">AAT</span><div class="mz-ft"><a class="mz-fpic mz-photo" href="#article-' + esc(a.id) + '">' + (a.img ? '<img src="' + img(a.img) + '" alt="">' : "") + '</a><a class="mz-fnm" href="#article-' + esc(a.id) + '"><b>' + esc(aTitle(a)) + '</b></a><a class="btn btn-line" href="#article-' + esc(a.id) + '">' + t("read") + "</a></div></div></div>"; }).join("");
      if (!flipped) qa(root, ".mz-fc").forEach(function (el, i) { c.later(still ? 0 : 380 + i * 170, function () { el.classList.add("flip"); }); });
    }
    function spin() { if (busy) return; busy = true; rot += 1080 + Math.floor(Math.random() * 360); q(root, ".mz-wheel").style.transform = "rotate(" + rot + "deg)"; c.later(still ? 30 : 3300, function () { var top = (360 - (rot % 360)) % 360; busy = false; deal(ks[Math.floor(top / SEG) % N], false); }); }
    c.on(root, "click", function (ev) { if (ev.target.closest('[data-mz="spin"]')) spin(); });
    var wh = q(root, ".mz-wheel"); c.on(wh, "pointerdown", function (ev) { d = { x: ev.clientX, y: ev.clientY }; }); c.on(W, "pointerup", function (ev) { if (!d) return; var m = Math.abs(ev.clientX - d.x) + Math.abs(ev.clientY - d.y); d = null; if (m > 30) spin(); });
    deal(ks[0], true);
  };

  /* ---------- pages ---------- */
  /* ===== 8. Brand pages: each advertiser opens as its own small site, in its own colours, words and menu ===== */
  var BR = W.AAT_BRAND || {}, FONTS = { machinery: "'Barlow Condensed'", tools: "'Barlow Condensed'", auto: "'Barlow Condensed'", hardware: "'Archivo'", plastics: "'Archivo'", food: "'Fraunces'", consumer: "'Fraunces'", fitness: "'Sora'", medical: "'Sora'", instruments: "'Space Grotesk'", chemicals: "'Space Grotesk'", services: "'Space Grotesk'", event: "'Sora'" };
  function brandSlide(x, o) {
    o = o || {}; var b = BR[x.page] || { a: col(x), b: "#1f2937", on: "#fff" }, lg = logo(x), ps = prods(x), ln = lines(x), ar = A.state.lang === "ar", T = b.t || {};
    var lay = b.dk ? 2 : [0, 1, 3, 4, 1, 0, 4, 3][x.page % 8];
    var head = (!ar && b.h) || L(x.tagline) || x.company, slo = (b.s || []).concat(b.s ? [] : ln.slice(0, 4));
    var tabs = (b.m || []).map(function (o2) { return { n: o2.n, k: o2.k, tx: o2.s || "", it: o2.i || [] }; });
    function chips(arr) { return arr && arr.length ? '<div class="mz-bch">' + arr.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div>" : ""; }
    function grid(n) { return ps.length ? '<div class="mz-bgrid">' + ps.slice(0, n).map(function (p) { return '<span class="mz-bp"><img src="' + img(p.img) + '" alt="" loading="lazy"><b>' + esc(clip(p.n, 26)) + "</b></span>"; }).join("") + "</div>" : '<div class="mz-bch mz-bnum">' + ln.map(function (n2, j) { return "<span><em>" + (j < 9 ? "0" : "") + (j + 1) + "</em>" + esc(clip(n2, 34)) + "</span>"; }).join("") + "</div>"; }
    function more() { return "<h5>" + t(ps.length ? "products" : "lines") + "</h5>" + grid(6); }
    function con() { return '<div class="mz-bcon">' + (x.tel ? '<a href="tel:' + esc(String(x.tel).replace(/[^+\d]/g, "")) + '"><small>Tel</small>' + esc(x.tel) + "</a>" : "") + (x.email ? '<a href="mailto:' + esc(x.email) + '"><small>Email</small>' + esc(x.email) + "</a>" : "") + "</div>"; }
    function pane(tb) {
      var h = (tb.tx ? "<p>" + esc(tb.tx) + "</p>" : "") + chips(tb.it), empty = !tb.tx && !tb.it.length;
      if (tb.k === "p") return h + (ps.length || empty ? grid(6) : "");
      if (tb.k === "a") return h + (empty ? "<p>" + esc(L(x.about)) + "</p>" : "") + more();
      if (tb.k === "c") return h + con();
      return (empty ? '<p class="mz-bnone">' + t("onsite") + "</p>" : h) + more();
    }
    return '<section class="mz-slide mz-bs mz-L' + lay + (o.wall ? " mz-bw" : "") + '" data-w="' + esc(web(x) || "") + '" style="--a:' + b.a + ";--b:" + b.b + ";--on:" + b.on + ";--f:" + (FONTS[x.cat] || "'Archivo'") + '">' +
      '<nav class="mz-bnav"><button type="button" class="mz-blg" data-mz="bt" data-t="-1" aria-label="' + esc(x.company) + '">' + (lg ? '<img src="' + lg + '" alt="">' : "<b>" + esc(clip(x.company, 18)) + "</b>") + '</button><div dir="' + (b.m ? "ltr" : A.dir()) + '">' + (tabs.length ? "" : '<b class="mz-bname">' + esc(x.company) + "</b>") + tabs.map(function (tb, j) { return '<button type="button" data-mz="bt" data-t="' + j + '">' + esc(tb.n) + "</button>"; }).join("") + "</div>" + (o.x || "") + "</nav>" +
      '<div class="mz-bbody"><div class="mz-bpane on" data-p="-1"><div class="mz-bhero"><i class="mz-bpat" aria-hidden="true"></i><div class="mz-btx"><small>' + esc(x.company) + "</small><h3>" + esc(head) + "</h3><p>" + esc(clip(L(x.about), 110)) + '</p></div><div class="mz-bwin">' + (ps.length ? media(x) : '<span class="mz-bset">' + ln.slice(0, 4).map(function (n2) { return "<i>" + esc(clip(n2, 22)) + "</i>"; }).join("") + "</span>") + "</div></div>" +
      (slo.length ? '<div class="mz-btick" dir="ltr"><div>' + slo.concat(slo, slo, slo).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div></div>" : "") + '<div class="mz-bsec">' + grid(6) + '<p class="mz-babt">' + esc(L(x.about)) + "</p>" + chips([L(x.city), x.certs].filter(Boolean)) + "</div></div>" +
      tabs.map(function (tb, j) { return '<div class="mz-bpane" data-p="' + j + '"><div class="mz-bsec"><h4>' + esc(tb.n) + "</h4>" + pane(tb) + "</div></div>"; }).join("") + "</div>" +
      '<footer class="mz-bft">' + (o.pre || "") + cta(x, "mz-sm") + '<a class="mz-bmore" href="' + hrefCo(x) + '">' + t("details") + "</a>" + (o.post || "") + "</footer></section>";
  }
  doc.addEventListener("click", function (ev) { var b = ev.target.closest && ev.target.closest('[data-mz="bt"]'); if (!b) return; var s = b.closest(".mz-bs"), k = b.getAttribute("data-t"); if (!s) return;
    qa(s, ".mz-bpane").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-p") === k); }); qa(s, ".mz-bnav [data-t]").forEach(function (x2) { x2.classList.toggle("on", x2 === b && k !== "-1"); }); });
  var FCAT = "";
  /* articles in the reels: picture on top (the illustration cut out of the banner), then the headline as real text, then the writer */
  function artBy(a) { if (!a.author) return ""; return '<span class="mz-by">' + (a.face ? '<img src="' + img(a.face) + '" alt="" loading="lazy">' : '<i aria-hidden="true"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3"/></svg></i>') + "<u>" + esc(a.author) + "</u></span>"; }
  function artSlide(a) { var pic = a.cut || a.img;
    return '<section class="mz-slide mz-art mz-art2' + (a.fit ? " mz-fit" : "") + '"' + (pic ? ' style="--bgi:url(&quot;' + esc(img(pic)) + '&quot;)"' : "") + '>' + (pic ? '<div class="mz-av"><img src="' + img(pic) + '" alt="" loading="lazy"></div>' : "") +
      '<div class="mz-cap"><span class="mz-tag">' + t("article") + "</span><h3>" + esc(aTitle(a)) + "</h3>" + artBy(a) + "<p>" + esc(aSum(a)) + '</p><a class="mz-read" href="#article-' + esc(a.id) + '">' + t("read") + "</a></div></section>"; }
  function brandFeed() { var a = ads().filter(function (x) { return !FCAT || x.cat === FCAT; }).sort(function (x, y) { return (prods(y).length ? 1 : 0) - (prods(x).length ? 1 : 0) || x.page - y.page; }), r = FCAT ? [] : arts(), out = [], j = 0;
    a.forEach(function (x, i) { out.push({ ad: x }); var want = Math.floor((i + 1) * r.length / a.length); while (j < want) out.push({ art: r[j++] }); }); return out; }
  /* ===== product reels: the products are the show, turning on a 3D ring ===== */
  var PROD = W.AAT_MZ_REEL === "prod";
  function prodItems(x) { var ps = prods(x), it = ps.length ? ps.map(function (p) { return { n: p.n, d: L(p.d) || "", img: img(p.img) }; }) : lines(x).map(function (n2) { return { n: n2, d: "" }; });
    if (!it.length) it = [{ n: x.company, d: "" }]; var base = it.slice(); while (it.length < 6) it = it.concat(base); return { all: it.slice(0, 12), uniq: base.length }; }
  function prodSlide(x) { var b = BR[x.page] || { a: col(x), b: "#1f2937", on: "#fff" }, lg = logo(x), pi = prodItems(x), n = pi.all.length;
    return '<section class="mz-slide mz-ps" data-w="' + esc(web(x) || "") + '" style="--a:' + b.a + ";--b:" + b.b + ";--on:" + b.on + '" data-n="' + n + '" data-u="' + pi.uniq + '">' +
      '<header class="mz-phd"><a class="mz-plg" href="' + esc(web(x) || hrefCo(x)) + '"' + (web(x) ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' + (lg ? '<img src="' + lg + '" alt="">' : "") + '</a><span><b>' + esc(x.company) + "</b><small>" + esc(catName(x.cat)) + " · " + esc(L(x.city)) + "</small></span></header>" +
      '<div class="mz-rw"><i class="mz-rglow"></i><i class="mz-rfloor"></i><div class="mz-ring">' + pi.all.map(function (p, i) { return '<div class="mz-ri" data-i="' + i + '" data-n="' + esc(p.n) + '" data-d="' + esc(clip(p.d || L(x.about), 150)) + '"><span class="mz-rc">' + (p.img ? '<img src="' + p.img + '" alt="" loading="lazy">' : '<b>' + esc(clip(p.n, 40)) + "</b>") + "</span></div>"; }).join("") + "</div></div>" +
      '<footer class="mz-pft"><div class="mz-pnfo"><a class="mz-pall" href="' + hrefCo(x, "products") + '"><em></em><span>' + (A.state.lang === "ar" ? "كل منتجات الشركة" : "All company products") + ' ›</span></a><b></b><p></p></div><div class="mz-pmt"><a class="mz-pcat" href="#reels-' + x.cat + '"><i></i>' + esc(catName(x.cat)) + " ›</a>" + cta(x, "mz-sm") + "</div></footer></section>"; }
  function prodRun(feed, c) { var act = null, anims = [], held = false, downAt = 0, raf = 0;
    function setup(s) { if (s._p) return s._p; var ring = q(s, ".mz-ring"), its = qa(s, ".mz-ri"), n = its.length, th = 360 / n, w = ring.clientWidth || 240, r = Math.round(w / 2 / Math.tan(Math.PI / n) + w * .16);
      its.forEach(function (e, i) { e.style.transform = "rotateY(" + (i * th) + "deg) translateZ(" + r + "px)"; e._b = e.style.transform; });
      return (s._p = { ring: ring, its: its, n: n, th: th, r: r, k: 0, u: +s.getAttribute("data-u") || n }); }
    function T(p, deg) { return "translateZ(" + (-p.r) + "px) rotateY(" + deg + "deg)"; }
    function info(s, p) { var e = p.its[p.k % p.n], box = q(s, ".mz-pnfo"); box.classList.remove("sw"); void box.offsetWidth; box.classList.add("sw");
      q(box, "em").textContent = ("0" + ((p.k % p.u) + 1)).slice(-2) + " / " + ("0" + p.u).slice(-2); q(box, "b").textContent = e.getAttribute("data-n"); q(box, "p").textContent = e.getAttribute("data-d");
      p.its.forEach(function (x, i) { x.classList.toggle("on", i === p.k % p.n); x.classList.toggle("was", p.k > 0 && i === (p.k - 1) % p.n && p.n > 1); }); }
    function clear() { cancelAnimationFrame(raf); anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* gone */ } }); anims = []; }
    /* one cycle is one animation: a slow drift right to left, then a fast turn to the next product; no hand-over, so no hitch */
    var SLOW = 2700, FAST = 760;
    function cycle(s, p, skip) { if (act !== s) return; clear(); var base = -p.k * p.th, next = base - p.th, D = SLOW + FAST, f = SLOW / D, e = p.its[(p.k + 1) % p.n], swapped = false;
      var ring = p.ring.animate([{ transform: T(p, base + 7), offset: 0, easing: "linear" }, { transform: T(p, base - 7), offset: f, easing: "cubic-bezier(.45,0,.12,1)" }, { transform: T(p, next + 7), offset: 1 }], { duration: D, fill: "forwards" });
      var g = q(s, ".mz-rglow").animate([{ opacity: .45, transform: "scale(1)", offset: 0 }, { opacity: .45, transform: "scale(1)", offset: f }, { opacity: .8, transform: "scale(1.12)", offset: f + (1 - f) * .55 }, { opacity: .45, transform: "scale(1)", offset: 1 }], { duration: D });
      anims = [ring, g]; if (skip) anims.forEach(function (a) { a.currentTime = SLOW; }); if (held) anims.forEach(function (a) { a.pause(); });
      (function watch() { if (act !== s || anims[0] !== ring) return; var t0 = ring.currentTime || 0; if (!swapped && t0 >= SLOW + FAST * .38) { swapped = true; p.k++; info(s, p); } if (t0 >= D - 1) { if (!swapped) { p.k++; info(s, p); } cycle(s, p); return; } raf = requestAnimationFrame(watch); })(); }
    function start(s) { if (act === s) return; stop(); act = s; var p = setup(s); info(s, p); if (still || !p.ring.animate) { p.ring.style.transform = T(p, -p.k * p.th); return; } cycle(s, p); }
    function stop() { clear(); if (act) act.classList.remove("mz-hold"); act = null; held = false; }
    if ("IntersectionObserver" in W) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio > .6) start(e.target); else if (act === e.target) stop(); }); }, { root: feed, threshold: [0, .6, .9] });
      qa(feed, ".mz-ps").forEach(function (s) { io.observe(s); }); }
    /* press and hold (mouse or finger): the ring stops and the product in front steps forward with its full details; let go and it carries on. A quick tap goes to the next product. */
    function hold(on) { if (!act || held === on) return; held = on; act.classList.toggle("mz-hold", on); anims.forEach(function (a) { try { if (on) a.pause(); else a.play(); } catch (e) { /* gone */ } }); }
    c.on(feed, "pointerdown", function (ev) { var rw = ev.target.closest && ev.target.closest(".mz-rw"); if (!rw || still || rw.closest(".mz-ps") !== act) return; downAt = Date.now(); hold(true); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n2) { c.on(feed, n2, function () { if (held) hold(false); }); });
    c.on(feed, "scroll", function () { if (held) hold(false); }, { passive: true });
    c.on(feed, "click", function (ev) { var rw = ev.target.closest && ev.target.closest(".mz-rw"); if (!rw || still) return; var s = rw.closest(".mz-ps"); void s; });
    c.on(feed, "contextmenu", function (ev) { if (ev.target.closest && ev.target.closest(".mz-rw")) ev.preventDefault(); });
    c.on(W, "resize", function () { qa(feed, ".mz-ps").forEach(function (s) { s._p = null; }); if (act) { var s = act; stop(); start(s); } }); }
  COMP.brand = function (root, c) {
    var story = [];
    var done = reelShell(root, c, brandFeed().map(function (o, k) {
      if (o.ad) { if (logo(o.ad)) story.push({ c: o.ad, k: k }); return PROD ? prodSlide(o.ad) : brandSlide(o.ad); }
      return artSlide(o.art);
    }), story, 0);
    q(root, ".mz-reel").classList.add("mz-m-brand"); if (PROD) { q(root, ".mz-reel").classList.add("mz-m-prod"); prodRun(q(root, ".mz-feed"), c); } return done;
  };
  COMP.reels = function (root, c) { return COMP.brand(root, c); };
  /* ===== Reels shelf: a row of tall cards inside the page; a tap opens the full-screen player ===== */
  COMP.shelf = function (root, c, o) {
    FCAT = (o && o.cat) || ""; var myCat = FCAT, grid = !!(o && o.grid); if (grid) root.classList.add("mz-grid");
    var feed = brandFeed(), done = null, box = null;
    root.innerHTML = '<div class="mz-shelf"><header><span class="mz-sico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><b>' + t("v_reels") + '</b><button type="button" data-mz="so" data-k="0">' + t("playAll") + '</button></header><div class="mz-srow" dir="' + A.dir() + '">' +
      feed.map(function (o, k) {
        if (o.ad) { var x = o.ad, b = BR[x.page] || { a: col(x), b: "#1f2937", on: "#fff" }, lg = logo(x), ps = prods(x);
          return '<button type="button" class="mz-sc" data-mz="so" data-k="' + k + '" style="--a:' + b.a + ";--b:" + b.b + '" aria-label="' + esc(x.company) + '">' + (ps.length ? '<span class="mz-scp"><img src="' + img(ps[0].img) + '" alt="" loading="lazy"></span>' : '<span class="mz-scl">' + lines(x).slice(0, 3).map(function (n2) { return "<i>" + esc(clip(n2, 20)) + "</i>"; }).join("") + "</span>") + '<span class="mz-sct">' + (lg ? '<span class="mz-scg"><img src="' + lg + '" alt="" loading="lazy"></span>' : "") + "<b>"  + esc(clip(x.company, 34)) + "</b><small>" + esc(shortName(x.cat)) + "</small></span></button>"; }
        var a = o.art, pic = a.cut || a.img; return '<button type="button" class="mz-sc mz-sca mz-sca2' + (a.fit ? " mz-fit" : "") + '" data-mz="so" data-k="' + k + '"' + (pic ? ' style="--bgi:url(&quot;' + esc(img(pic)) + '&quot;)"' : "") + '>' + (pic ? '<span class="mz-scv"><img src="' + img(pic) + '" alt="" loading="lazy"></span>' : "") + '<span class="mz-sct"><em>' + t("article") + "</em><b>" + esc(clip(aTitle(a), 70)) + "</b>" + artBy(a) + "</span></button>";
      }).join("") + '</div></div><div class="mz-shelfreel"></div>';
    var holder = q(root, ".mz-shelfreel"), row = q(root, ".mz-srow"), d = null, moved = false;
    c.later(300, function () { var all = qa(row, 'img[loading="lazy"]'), k = 0; (function more() { for (var z = 0; z < 10 && k < all.length; z++, k++) { all[k].decoding = "async"; all[k].loading = "eager"; } if (k < all.length) c.later(180, more); })(); });
    c.on(root, "click", function (ev) { var b = ev.target.closest('[data-mz="so"]'); if (!b) return; if (moved) { moved = false; return; }
      if (!box) { FCAT = myCat; done = COMP.brand(holder, c); box = q(holder, ".mz-reel"); doc.documentElement.classList.add("mz-nochat"); }
      box._mz.open(+b.getAttribute("data-k")); });
    c.on(row, "pointerdown", function (ev) { if (ev.pointerType !== "mouse") return; d = { x: ev.clientX, s: row.scrollLeft }; moved = false; });
    c.on(W, "pointermove", function (ev) { if (!d) return; var dx = ev.clientX - d.x; if (Math.abs(dx) > 6) moved = true; row.scrollLeft = d.s - dx; });
    c.on(W, "pointerup", function () { d = null; });
    return function () { if (done) done(); };
  };

  /* ===== 7. Wall: every advertiser in one view, cut into industries; press one and it zooms open ===== */
  COMP.wall = function (root, c) {
    var ks = cats(), list = [], cur = -1;
    var rooms = ks.map(function (k, r) { var xs = adsIn(k).sort(function (p, q2) { return p.page - q2.page; });
      return '<section class="mz-room mz-r' + Math.min(xs.length, 5) + '" data-k="' + k + '" style="--c:' + (COL[k] || "#6B7280") + ";--d:" + (r * 60) + 'ms"><header><i></i><b>' + esc(catName(k)) + "</b><em>" + xs.length + '</em></header><div class="mz-rin">' + xs.map(function (x) { var i = list.push(x) - 1, lg = logo(x);
        return '<button type="button" class="mz-wt" data-mz="wo" data-i="' + i + '" aria-label="' + esc(x.company) + '">' + (lg ? '<span class="mz-wl"><img src="' + lg + '" alt="" loading="lazy"></span>' : '<span class="mz-wl mz-wn">' + esc(clip(x.company, 22)) + "</span>") + "<b>" + esc(clip(x.company, 24)) + "</b></button>"; }).join("") + "</div></section>"; }).join("");
    root.innerHTML = '<div class="mz-wall"><div class="mz-wbg" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="mz-wbar">' + ks.map(function (k) { return '<button type="button" data-mz="wf" data-k="' + k + '" style="--c:' + (COL[k] || "#6B7280") + '"><i></i>' + esc(shortName(k)) + " <em>" + adsIn(k).length + "</em></button>"; }).join("") + "</div>" +
      '<div class="mz-wgrid">' + rooms + '</div></div><div class="mz-wz" hidden></div>';
    var wall = q(root, ".mz-wall"), z = q(root, ".mz-wz"), tiles = qa(root, ".mz-wt"), n = list.length;
    function from(i) { var a = tiles[i].getBoundingClientRect(), b = z.getBoundingClientRect(); return "translate(" + (a.left - b.left) + "px," + (a.top - b.top) + "px) scale(" + (a.width / b.width) + "," + (a.height / b.height) + ")"; }
    function open(i, slide) { cur = i; z.innerHTML = brandSlide(list[i], { wall: 1, x: '<button type="button" class="mz-wx" data-mz="wx" aria-label="' + t("exit") + '">' + IC.x + "</button>", pre: '<button type="button" class="mz-wnav" data-mz="wp" aria-label="' + t("back") + '">‹</button>', post: '<button type="button" class="mz-wnav" data-mz="wn" aria-label="' + t("next") + '">›</button>' });
      if (z.parentNode !== doc.body) doc.body.appendChild(z); z.hidden = false; doc.documentElement.classList.add("mz-zopen");
      if (still) return; z.style.transition = "none"; z.style.transform = ""; z.style.transform = slide ? "translateX(" + (slide * 40) + "px)" : from(i); z.style.opacity = slide ? "0" : ".3"; void z.offsetWidth; z.style.transition = ""; z.style.transform = ""; z.style.opacity = ""; }
    function close() { if (cur < 0) return; var i = cur; cur = -1; doc.documentElement.classList.remove("mz-zopen"); if (still) { z.hidden = true; return; } z.style.transform = ""; var f = from(i); z.style.transform = f; z.style.opacity = "0"; c.later(300, function () { if (cur < 0) { z.hidden = true; z.style.transform = ""; z.style.opacity = ""; } }); }
    function step(d) { open((cur + d + n) % n, d); }
    function act(ev) { var b = ev.target.closest("[data-mz]"); if (!b) { if (ev.target === z) close(); return; } var a = b.getAttribute("data-mz");
      if (a === "wo") open(+b.getAttribute("data-i")); else if (a === "wx") close(); else if (a === "wn") step(1); else if (a === "wp") step(-1);
      else if (a === "wf") { var rm = q(root, '.mz-room[data-k="' + b.getAttribute("data-k") + '"]'); if (rm) { rm.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" }); rm.classList.remove("mz-ping"); void rm.offsetWidth; rm.classList.add("mz-ping"); } } }
    c.on(wall, "click", act); c.on(z, "click", act);
    c.on(doc, "keydown", function (ev) { if (cur < 0) return; if (ev.key === "Escape") close(); else if (ev.key === "ArrowRight") step(1); else if (ev.key === "ArrowLeft") step(-1); });
    var sx = null; c.on(z, "touchstart", function (ev) { sx = ev.touches[0].clientX; }, { passive: true });
    c.on(z, "touchend", function (ev) { if (sx == null) return; var dx = ev.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 60 && !ev.target.closest(".mz-bnav")) step(dx < 0 ? 1 : -1); }, { passive: true });
    if (!still) { c.every(1600, function () { if (cur > -1 || !wall.offsetParent) return; var b = tiles[Math.floor(Math.random() * n)]; b.classList.add("hot"); c.later(1400, function () { b.classList.remove("hot"); }); });
      c.on(wall, "pointermove", function (ev) { if (ev.pointerType !== "mouse") return; var r = wall.getBoundingClientRect(); wall.style.setProperty("--mx", ((ev.clientX - r.left) / r.width - .5).toFixed(3)); wall.style.setProperty("--my", ((ev.clientY - r.top) / r.height - .5).toFixed(3)); }); }
    return function () { doc.documentElement.classList.remove("mz-zopen"); if (z.parentNode === doc.body) doc.body.removeChild(z); };
  };

  function strip(cur) {
    return '<div class="mz-vers">' + VERS.map(function (v) { return '<a class="mz-ver' + (v === cur ? " on" : "") + '" href="#digital-' + v + '"><b>' + t("v_" + v) + "</b><small>" + t("d_" + v) + "</small></a>"; }).join("") + "</div>";
  }
  /* all reels, or the reels of one industry; the other industries stay one tap away at the top */
  function reelsPage(cat) {
    var U = A.ui, ar = A.state.lang === "ar", ttl = t("v_reels") + (cat ? " · " + catName(cat) : "");
    var tabs = '<a role="tab" class="tab" href="#reels" aria-selected="' + !cat + '">' + (ar ? "الكل" : "All") + "</a>" + cats().map(function (k) { return '<a role="tab" class="tab" href="#reels-' + k + '" aria-selected="' + (k === cat) + '">' + esc(shortName(k)) + " <small>" + adsIn(k).length + "</small></a>"; }).join("");
    return { title: ttl, html:
      '<header class="ph mz-ph"><div class="wrap">' + U.crumbs([[A.t("home"), "home"], [t("v_reels"), "reels"]].concat(cat ? [[catName(cat)]] : [])) + '<h1 class="h1" tabindex="-1">' + esc(ttl) + '</h1><p class="lead"><a class="mz-allp" href="#products' + (cat ? "." + cat : "") + '">' + (ar ? "كل منتجات " + (cat ? catName(cat) : "المجلة") : "All " + (cat ? catName(cat) + " " : "") + "products") + " <span aria-hidden=\"true\">→</span></a></p></div></header>" +
      '<div class="bar"><div class="wrap tabs mz-rtabs" role="tablist">' + tabs + "</div></div>" +
      '<section class="sec mz-sec"><div class="wrap"><div class="mz-mount mz-m-shelf" data-mz-ver="shelf" data-grid data-cat="' + cat + '"></div></div></section>' };
  }
  function digitalView(ver) {
    var U = A.ui, tabs = '<a role="tab" class="tab" href="#magazine" aria-selected="false">' + t("allCos") + "</a>" + VERS.map(function (v) { return '<a role="tab" class="tab" href="#digital-' + v + '" aria-selected="' + (v === ver) + '">' + t("v_" + v) + "</a>"; }).join("");
    return { title: t("digital") + " · " + t("v_" + ver), html:
      '<header class="ph mz-ph"><div class="wrap">' + U.crumbs([[A.t("home"), "home"], [A.t("nav_magazine"), "magazine"], [t("digital")]]) + '<h1 class="h1" tabindex="-1">' + t("v_" + ver) + '</h1><p class="lead">' + t("d_" + ver) + "</p></div></header>" +
      '<div class="bar"><div class="wrap tabs" role="tablist">' + tabs + "</div></div>" +
      '<section class="sec mz-sec"><div class="wrap"><div class="mz-mount mz-m-' + ver + '" data-mz-ver="' + ver + '"></div></div></section>' };
  }
  doc.documentElement.classList.add("mz-h-" + HOME);
  /* ---------- the AAT logo as live outlines ---------- */
  var LG = W.AAT_LOGO, LM = LG && LG.M;
  function logoDefs() { if (!LG || doc.getElementById("lgdefs")) return; var h = '<svg id="lgdefs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>', k, l;
    for (k in LG.G) h += '<path id="lg' + k + '" fill-rule="evenodd" d="' + LG.G[k] + '"/>';
    for (l in LM) { h += '<clipPath id="lgc' + l + '"><use href="#lg' + l + '"/></clipPath>'; LM[l].forEach(function (s) { h += '<clipPath id="lgq' + l + s.k + '"><path d="' + s.cell + '"/></clipPath>'; }); }
    h += '<clipPath id="lgcT"><use href="#lgW1"/><use href="#lgW2"/><use href="#lgW3"/></clipPath><linearGradient id="lggB" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><filter id="lgsoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter></defs></svg>';
    doc.body.insertAdjacentHTML("afterbegin", h); }
  function logoHTML(h, band) { if (!LG) return ""; var s = '<svg class="mz-lgo" viewBox="0 0 413 138" ' + (h ? 'width="' + Math.round(h * 2.993) + '" height="' + h + '"' : "") + ' role="img" aria-label="AAT, Ideas For Business"><use href="#lgA1"/><use href="#lgA2"/><use href="#lgT"/><use href="#lgW1"/><use href="#lgW2"/><use href="#lgW3"/>', l;
    for (l in LM) LM[l].forEach(function (x) { s += '<g clip-path="url(#lgc' + l + ')"><g clip-path="url(#lgq' + l + x.k + ')"><path class="mz-lt" data-l="' + l + '" data-k="' + x.k + '" d="' + x.d + '" stroke-width="' + (x.w + 6) + '" filter="url(#lgsoft)" stroke-dasharray="46 9999" stroke-dashoffset="47"/></g></g>'; });
    s += '<g clip-path="url(#lgcT)"><rect class="mz-lband2" x="-30" y="106" width="60" height="36" fill="url(#lggB)" opacity="0"/></g>';
    if (band) s += '<g clip-path="url(#lgcT)"><rect class="mz-lband" x="150" y="112" width="46" height="30" fill="url(#lggB)"/></g>';
    return s + "</svg>"; }
  /* one light per letter, all in step; a branch leaves when the line reaches its junction */
  function logoLights(root, D, P, delay) { if (!LG || still || !root) return; var chain = { A1: ["S", "R"], A2: ["S", "R"], T: ["S", "BR"] }, l, DL = 46, tot = 0, cl = {}, st = {}, TAG = .16;
    qa(root, ".mz-lt,.mz-lband2").forEach(function (e) { if (e.getAnimations) e.getAnimations().forEach(function (a) { a.cancel(); }); });
    for (l in LM) { var b0 = {}; LM[l].forEach(function (s) { b0[s.k] = s; }); cl[l] = b0[chain[l][1]].at * b0[chain[l][0]].len + b0[chain[l][1]].len + DL; st[l] = tot; tot += cl[l] * .86; }
    var v = tot / (D * (1 - TAG));
    for (l in LM) (function (l) { var by = {}, t0 = {}; LM[l].forEach(function (s) { by[s.k] = s; });
      LM[l].forEach(function (s) { t0[s.k] = s.par ? t0[s.par] + s.at * by[s.par].len / v : st[l] / v; var e = q(root, '.mz-lt[data-l="' + l + '"][data-k="' + s.k + '"]'), n = s.len; if (!e || !e.animate) return;
        e.animate([{ strokeDashoffset: DL + 1, offset: 0 }, { strokeDashoffset: DL + 1, offset: Math.min(.99, t0[s.k] / P) }, { strokeDashoffset: -n, offset: Math.min(.999, (t0[s.k] + (n + DL) / v) / P) }, { strokeDashoffset: -n, offset: 1 }], { duration: P * 1000, delay: (delay || 0) * 1000, iterations: Infinity, easing: "linear" }); }); })(l);
    var bd = q(root, ".mz-lband2"); if (bd && bd.animate) { var a0 = D * (1 - TAG) * .94 / P, a1 = Math.min(.999, D * 1.05 / P);
      bd.animate([{ transform: "translateX(150px)", opacity: 0, offset: 0 }, { transform: "translateX(150px)", opacity: 0, offset: a0 }, { transform: "translateX(190px)", opacity: 1, offset: a0 + (a1 - a0) * .15 }, { transform: "translateX(400px)", opacity: 1, offset: a0 + (a1 - a0) * .9 }, { transform: "translateX(430px)", opacity: 0, offset: a1 }, { transform: "translateX(430px)", opacity: 0, offset: 1 }], { duration: P * 1000, delay: (delay || 0) * 1000, iterations: Infinity, easing: "linear" }); } }
  /* opening screen: the big outline of AAT is drawn left to right behind the number, the digits roll, then everything settles */
  function introShow(el, done) { if (!LG) return false; logoDefs();
    var yrs = String(A.D.magazine.years), box = q(el, "div"), bn = q(el, ".in-n b");
    var big = '<svg class="in-bg" viewBox="-4 -4 421 126" aria-hidden="true">' + LG.O.map(function (o, i) { return '<path data-i="' + i + '" d="' + o.d + '"/>'; }).join("") + "</svg>";
    el.insertAdjacentHTML("afterbegin", big);
    if (bn) { var to = +yrs, s0 = performance.now(); (function step(now) { var p = Math.min((now - s0 - 120) / 1050, 1); if (p < 0) p = 0; bn.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1 && el.parentNode) requestAnimationFrame(step); })(s0); }
    var T0 = { A1: 0, A2: .28, T: .56 }, DUR = .85, span = {};
    LG.O.forEach(function (o) { if (!span[o.l] || o.x1 - o.x0 > span[o.l][1] - span[o.l][0]) span[o.l] = [o.x0, o.x1]; });
    qa(el, ".in-bg path").forEach(function (p) { var o = LG.O[+p.getAttribute("data-i")], n = p.getTotalLength(), s = span[o.l], inner = o.x1 - o.x0 < (s[1] - s[0]) * .6, f0 = inner ? (o.x0 - s[0]) / (s[1] - s[0]) : 0, dur = inner ? DUR * .45 : DUR;
      p.style.strokeDasharray = "0 " + n;
      if (p.animate) p.animate([{ strokeDasharray: "0 " + n, strokeDashoffset: 0 }, { strokeDasharray: n + " 0", strokeDashoffset: n / 2 }], { duration: dur * 1000, delay: (T0[o.l] + f0 * DUR + .05) * 1000, fill: "both", easing: "cubic-bezier(.45,0,.3,1)" }); else p.style.strokeDasharray = "none"; });
    el.classList.add("in-go"); logoLights(el, 1.25, 4.6, .1);
    setTimeout(function () { el.classList.add("in-land"); }, 1250); setTimeout(done, 2050); return true; }
  /* the hero number rolls when it is actually on screen, with a faint large echo behind it */
  function heroYears() { var y = doc.querySelector(".yrs"); if (!y || y.getAttribute("data-mz")) return; y.setAttribute("data-mz", "1"); y.setAttribute("data-n", A.D.magazine.years); var hs = y.closest(".hero"); if (hs) hs.setAttribute("data-n", A.D.magazine.years);
    if (!("IntersectionObserver" in W) || still) { y.classList.add("mz-go"); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !doc.documentElement.classList.contains("intro-on")) { y.classList.add("mz-go"); io.disconnect(); } else if (e.isIntersecting) setTimeout(function () { y.classList.add("mz-go"); }, 2300); }); }, { threshold: .6 }); io.observe(y); }
  function logoHeader() { if (!LG) return; logoDefs();
    Array.prototype.forEach.call(doc.querySelectorAll('#hdr img[src*="logo.png"], #ftr img[src$="img/logo.png"]'), function (im) { var h = +im.getAttribute("height") || 34; im.insertAdjacentHTML("afterend", logoHTML(h)); im.parentNode.removeChild(im); });
    Array.prototype.forEach.call(doc.querySelectorAll("#hdr .mz-lgo:not([data-on])"), function (sv) { sv.setAttribute("data-on", "1"); logoLights(sv, 4.4, 7.5, 1.2); sv.addEventListener("pointerenter", function () { logoLights(sv, 3.2, 7.5, 0); }); }); }
  var view0 = A.views.view, parse0 = A.parseRoute;
  A.parseRoute = function (h) {
    var s = String(h || "").replace(/^#\/?/, ""), m = /^digital(?:-([a-z]+))?$/.exec(s);
    if (m && (!m[1] || VERS.indexOf(m[1]) > -1)) return { v: "digital", ver: m[1] || "reels", nav: "magazine" };
    if ((m = /^reels(?:-([a-z]+))?$/.exec(s)) && (!m[1] || A.cats[m[1]])) return { v: "digital", ver: "reels", cat: m[1] || "", nav: "magazine" };
    return parse0(h);
  };
  A.views.view = function (r) {
    if (r.v === "digital") return r.cat !== undefined ? reelsPage(r.cat) : digitalView(r.ver);
    var v = view0(r);
    if (r.v === "home") v = { title: v.title, html: '<section class="mz-top"><div class="wrap"><div class="mz-mount mz-m-' + HOME + '" data-mz-ver="' + HOME + '" data-rows="1"></div></div></section>' + v.html };
    else if (r.v === "magazine" && VERS.length) v.html = v.html.replace('<div class="bar">', '<section class="mz-strip"><div class="wrap"><p class="kick">' + t("digital") + "</p>" + strip("") + '</div></section><div class="bar">');
    return v;
  };

  /* mount the edition that the page asks for; tidy the previous one */
  var live = [];
  function scan() {
    live.forEach(function (x) { try { x.c.off(); if (x.done) x.done(); } catch (e) { /* already gone */ } }); live = [];
    Array.prototype.forEach.call(doc.querySelectorAll(".mz-mount"), function (el) {
      var ver = el.getAttribute("data-mz-ver"); if (!COMP[ver]) return;
      var c = ctx(), done; try { done = COMP[ver](el, c, { rows: +el.getAttribute("data-rows") || 2, cat: el.getAttribute("data-cat") || "", grid: el.hasAttribute("data-grid") }); } catch (e) { if (W.console) console.error(e); }
      live.push({ c: c, done: done });
    });
    doc.documentElement.classList.toggle("mz-nochat", !!doc.querySelector(".mz-reel")); heroYears();
    /* company pages: the website button becomes the main action */
    var row = doc.querySelector(".ph.co .row"), wl = row && row.querySelector('a.btn[target="_blank"]');
    if (wl && !wl.classList.contains("mz-cta")) { var u = wl.getAttribute("href"); wl.className = "mz-cta mz-lgc"; wl.innerHTML = "<span><b>" + t("visit") + "</b><small>" + esc(domain(u)) + '</small></span><i aria-hidden="true">↗</i>'; row.insertBefore(wl, row.firstChild); var ml = row.querySelector('a.btn-red[href^="mailto:"]'); if (ml) { ml.classList.remove("btn-red"); ml.classList.add("btn-line"); } }
  }
  var appEl = doc.getElementById("app");
  if (appEl && W.MutationObserver) new MutationObserver(scan).observe(appEl, { childList: true });
  var hdrEl = doc.getElementById("hdr"); logoHeader();
  if (hdrEl && W.MutationObserver) new MutationObserver(logoHeader).observe(hdrEl, { childList: true, subtree: true });
  W.AAT.mag = { scan: scan, versions: VERS, logoHTML: function (h, band) { logoDefs(); return logoHTML(h, band); }, logoLights: logoLights, intro: introShow, logo: logo, prods: prods, web: web, img: img, brand: BR, catName: catName, clip: clip, lines: lines };
})(window);

/* ───────── living page background + changing trade routes ───────── */
(function (W) {
  "use strict";
  var doc = W.document, root = doc.documentElement;
  var still = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── background: drifting line icons of trade, business and publishing, softly linked ── */
  var IC = [
    "M0 30h34M5 30V20h5v10M14 30V13h5v17M23 30V6h5v24M3 12l9-7 6 4 10-8M24 1h4v4",
    "M17 7C13 4 7 3 1 4v24c6-1 12 0 16 3 4-3 10-4 16-3V4c-6-1-12 0-16 3zM17 7v24M5 10h8M5 15h8M5 20h8M21 10h8M21 15h8M21 20h8",
    "M17 2a11 11 0 0 0-6 20v4h12v-4a11 11 0 0 0-6-20zM12 30h10M14 34h6M17 14v8M13 14h8",
    "M3 9h28a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3zM11 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M0 19h34M15 17h4v4h-4z",
    "M2 17a15 15 0 1 0 30 0a15 15 0 1 0-30 0M2 17h30M17 2c-7 8-7 22 0 30M17 2c7 8 7 22 0 30M5 9h24M5 25h24",
    "M3 13v8h5l14 8V5L8 13zM8 21l2 9h4l-2-8M26 12c3 2 3 8 0 10M30 8c5 4 5 14 0 18",
    "M2 17a15 15 0 1 0 30 0a15 15 0 1 0-30 0M8 17a9 9 0 1 0 18 0a9 9 0 1 0-18 0M14 17a3 3 0 1 0 6 0a3 3 0 1 0-6 0M17 17L31 3M27 3h4v4",
    "M3 4h22a2 2 0 0 1 2 2v26H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM27 10h5v19a3 3 0 0 1-6 0M6 10h16v7H6zM6 22h16M6 27h10",
    "M5 1h17l8 8v24H5zM22 1v8h8M10 15h14M10 20h14M10 25h9",
    "M3 6h28a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM1 8l16 12L33 8",
    "M5 5h24a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM2 12h30M10 2v6M24 2v6M8 18h4M15 18h4M22 18h4M8 24h4M15 24h4",
    "M1 12l7-4 8 3 3-2 7 1 7 3v10l-5 1-7 6-4-2-3 1-5-5-8-2zM16 11l-5 6c2 2 5 1 7-1l3 1 7 7",
    "M2 22h30l-4 8H6zM8 22v-8h18v8M12 14V8h10v6M17 8V3",
    "M2 16L32 3 22 31l-6-11zM32 3L16 20",
    "M1 4h5l4 17h17l4-12H8M10 28a2 2 0 1 0 4 0a2 2 0 1 0-4 0M23 28a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
    "M2 2h13l17 17-13 13L2 15zM7 9a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
    "M2 31V14l9 6v-6l9 6v-6l9 6v11zM25 14V4h4v12M7 26h4M15 26h4M23 26h4",
    "M17 2l14 7v16l-14 7-14-7V9zM3 9l14 7 14-7M17 16v16"
  ];
  function bg() {
    if (doc.getElementById("mz-bg") || !W.Path2D) return;
    var cv = doc.createElement("canvas"); cv.id = "mz-bg"; cv.setAttribute("aria-hidden", "true");
    doc.body.insertBefore(cv, doc.body.firstChild); root.classList.add("mz-bgon");
    var g = cv.getContext("2d"), P = IC.map(function (d) { return new Path2D(d); });
    var w = 0, h = 0, dpr = 1, its = [], pulses = [], mx = 0, my = 0, tx = 0, ty = 0, sy = 0, last = 0, raf = 0;
    var TINT = [[236, 29, 37], [37, 99, 235], [217, 119, 6], [13, 148, 136]], TINTD = [[255, 77, 84], [96, 165, 250], [251, 191, 36], [45, 212, 191]];
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function seed() {
      var n = Math.max(9, Math.min(26, Math.round(w * h / 46000))), cols = Math.ceil(Math.sqrt(n * w / h)), rows = Math.ceil(n / cols), i = 0; its = [];
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols && i < n; c++, i++) {
        var z = rnd(.45, 1), k = Math.random();
        its.push({ x: (c + rnd(.15, .85)) * w / cols, y: (r + rnd(.15, .85)) * h / rows, z: z, s: (w < 700 ? 26 : 34) * (.6 + z * .8) / 34, p: (i * 7 + r) % P.length,
          vx: rnd(-1, 1) * 5, vy: -rnd(3, 9) * z, a0: rnd(0, 6.28), ar: rnd(.12, .32) * (Math.random() < .5 ? -1 : 1), af: rnd(.1, .25), bf: rnd(.15, .35), ph: rnd(0, 6.28),
          c: -1 });
      }
      pulses = [];
    }
    function size() {
      var nw = W.innerWidth, nh = W.innerHeight; if (nw === w && Math.abs(nh - h) < 140 && its.length) return;
      w = nw; h = nh; dpr = Math.min(W.devicePixelRatio || 1, 2); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); seed(); if (still) draw(0, 0);
    }
    function draw(t, dt) {
      var dark = root.getAttribute("data-theme") === "dark", ink = dark ? "255,255,255" : "24,24,32", T = dark ? TINTD : TINT, base = dark ? .15 : .13, M = 70, HH = h + M * 2, WW = w + M * 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); g.lineCap = "round"; g.lineJoin = "round";
      tx += (mx - tx) * .05; ty += (my - ty) * .05;
      var i, j, a, b, pos = [];
      for (i = 0; i < its.length; i++) {
        a = its[i]; a.x += a.vx * dt; a.y += a.vy * dt;
        var x = a.x + Math.sin(t * a.bf + a.ph) * 10 + tx * 26 * a.z, y = a.y - sy * .1 * a.z + Math.cos(t * a.bf * .8 + a.ph) * 8 + ty * 18 * a.z;
        x = ((x + M) % WW + WW) % WW - M; y = ((y + M) % HH + HH) % HH - M; pos.push([x, y]);
      }
      /* every icon keeps its own space */
      var MIN = w < 700 ? 96 : 130;
      for (i = 0; i < its.length; i++) for (j = i + 1; j < its.length; j++) {
        var ex = pos[i][0] - pos[j][0], ey = pos[i][1] - pos[j][1], ed = Math.sqrt(ex * ex + ey * ey) || 1;
        if (ed < MIN) { var f = (MIN - ed) / ed * .5 * Math.min(1, (dt || .03) * 3); its[i].x += ex * f; its[i].y += ey * f; its[j].x -= ex * f; its[j].y -= ey * f; pos[i][0] += ex * f; pos[i][1] += ey * f; pos[j][0] -= ex * f; pos[j][1] -= ey * f; }
      }
      /* links: a quiet trade network between neighbours */
      var R = w < 700 ? 170 : 240;
      for (i = 0; i < its.length; i++) for (j = i + 1; j < its.length; j++) {
        var dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1], d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          var q = 1 - Math.sqrt(d2) / R; g.strokeStyle = "rgba(" + ink + "," + (q * (dark ? .13 : .1)).toFixed(3) + ")"; g.lineWidth = 1;
          g.beginPath(); g.moveTo(pos[i][0], pos[i][1]); g.lineTo(pos[j][0], pos[j][1]); g.stroke();
          if (!still && pulses.length < 5 && q > .35 && Math.random() < .004) pulses.push({ i: i, j: j, k: 0 });
        }
      }
      for (i = pulses.length - 1; i >= 0; i--) {
        var pu = pulses[i]; pu.k += dt * .45; a = pos[pu.i]; b = pos[pu.j];
        if (pu.k >= 1 || Math.abs(a[0] - b[0]) > R * 1.3 || Math.abs(a[1] - b[1]) > R * 1.3) { pulses.splice(i, 1); continue; }
        var e = pu.k * pu.k * (3 - 2 * pu.k), al = Math.sin(pu.k * 3.1416);
        g.fillStyle = "rgba(" + ink + "," + (al * .4).toFixed(3) + ")"; g.beginPath(); g.arc(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, 2.3, 0, 6.2832); g.fill();
      }
      for (i = 0; i < its.length; i++) {
        a = its[i]; var col = a.c < 0 ? ink : T[a.c].join(","), al2 = (a.c < 0 ? base : base + .14) * (.55 + a.z * .55) * (.82 + .18 * Math.sin(t * .5 + a.ph));
        g.save(); g.translate(pos[i][0], pos[i][1]); g.rotate(a.a0 * .08 + Math.sin(t * a.af + a.ph) * a.ar); g.scale(a.s, a.s); g.translate(-17, -17);
        g.strokeStyle = "rgba(" + col + "," + al2.toFixed(3) + ")"; g.lineWidth = 1.5 / a.s * (.9 + a.z * .4); g.stroke(P[a.p]); g.restore();
      }
    }
    function frame(ts) {
      raf = W.requestAnimationFrame(frame); if (ts - last < 33) return; if (root.classList.contains("mz-quiet")) { last = ts; return; }
      var dt = Math.min((ts - last) / 1000, .08); last = ts; draw(ts / 1000, dt);
    }
    function run() { W.cancelAnimationFrame(raf); if (!still && !doc.hidden) { last = W.performance.now(); raf = W.requestAnimationFrame(frame); } }
    W.addEventListener("resize", size); W.addEventListener("scroll", function () { sy = W.pageYOffset || 0; }, { passive: true });
    W.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") { mx = e.clientX / w - .5; my = e.clientY / h - .5; } }, { passive: true });
    doc.addEventListener("visibilitychange", run);
    if (W.MutationObserver) new MutationObserver(function () { if (still) draw(0, 0); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    size(); run();
  }

  /* ── trade map: a few routes at a time, each between new places, never tangled ── */
  var PL = {
    as: [[121.5, 25], [121.5, 31.2], [113.3, 23.1], [127, 37.5], [139.7, 35.7], [100.5, 13.7], [101.7, 3.1], [106.8, -6.2], [121, 14.6], [105.8, 21], [72.9, 19.1], [77.2, 28.6], [67, 24.9], [90.4, 23.8], [116.4, 39.9], [80, 7]],
    ar: [[55.3, 25.2], [46.7, 24.7], [39.2, 21.5], [51.5, 25.3], [48, 29.4], [58.4, 23.6], [44.4, 33.3], [35.9, 31.9], [31.2, 30], [13.2, 32.9], [10.2, 36.8], [3, 36.7], [-7.6, 33.6], [32.5, 15.6], [44.2, 15.4]],
    af: [[3.4, 6.5], [-0.2, 5.6], [-17.4, 14.7], [36.8, -1.3], [38.7, 9], [39.3, -6.8], [28, -26.2], [13.2, -8.8], [15.3, -4.3], [-4, 5.3], [18.4, -33.9], [32.6, -25.9], [47.5, -18.9]]
  };
  var PAIRS = [["as", "ar"], ["as", "af"], ["ar", "af"], ["as", "as"], ["af", "as"], ["ar", "ar"], ["ar", "as"], ["af", "af"], ["as", "af"], ["af", "ar"]];
  function cross(a, b, c, d) {
    function o(p, q, r) { return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); }
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  }
  function liveMap() {
    var svg = doc.querySelector("#app .live svg.tm"); if (!svg || svg._mz) return; svg._mz = 1;
    var M = W.AAT_MAP; if (!M) return;
    [].slice.call(svg.querySelectorAll(".tm-arc,.tm-glow,.tm-end")).forEach(function (n) { n.parentNode.removeChild(n); });
    var NS = "http://www.w3.org/2000/svg", lay = doc.createElementNS(NS, "g"), lb = svg.querySelector(".tm-lb"); lay.setAttribute("class", "mz-rts");
    if (lb) svg.insertBefore(lay, lb); else svg.appendChild(lay);
    function xy(p) { return [(p[0] - M.L0) * M.k, (M.B1 - p[1]) * M.k * 1.12]; }
    var act = [], turn = Math.floor(Math.random() * PAIRS.length), n = 5, far = 0;
    function pick() {
      var best = null, bs = -1e9;
      for (var tr = 0; tr < 60; tr++) {
        var pr = PAIRS[(turn + (tr > 25 ? tr : 0)) % PAIRS.length], A = PL[pr[0]], B = PL[pr[1]], a = xy(A[Math.floor(Math.random() * A.length)]), b = xy(B[Math.floor(Math.random() * B.length)]);
        var len = Math.hypot(a[0] - b[0], a[1] - b[1]); if (len < 60) continue;
        var sc = (far % 2 ? len > 230 : len < 200) ? 0 : -60, near = 1e9;
        act.forEach(function (r) {
          if (cross(a, b, r.a, r.b)) sc -= 300;
          [r.a, r.b].forEach(function (e) { near = Math.min(near, Math.hypot(a[0] - e[0], a[1] - e[1]), Math.hypot(b[0] - e[0], b[1] - e[1])); });
          var m1 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m2 = [(r.a[0] + r.b[0]) / 2, (r.a[1] + r.b[1]) / 2]; near = Math.min(near, Math.hypot(m1[0] - m2[0], m1[1] - m2[1]) * 1.2);
        });
        sc += Math.min(near, 90); if (sc > bs) { bs = sc; best = { a: a, b: b, len: len }; } if (sc >= 46) break;
      }
      turn++; far++; return best;
    }
    function el(tag, at) { var e = doc.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
    function spawn() {
      if (!svg.isConnected) return; var r = pick(); if (!r) return;
      var a = r.a, b = r.b, k = Math.min(r.len * .22, 46), d = "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " Q" + ((a[0] + b[0]) / 2).toFixed(1) + " " + ((a[1] + b[1]) / 2 - k).toFixed(1) + " " + b[0].toFixed(1) + " " + b[1].toFixed(1);
      var T = Math.max(3, Math.min(5.2, r.len / 62)), g = el("g", { "class": "mz-rt", style: "--t:" + T.toFixed(2) + "s" });
      g.appendChild(el("path", { "class": "mz-ra", pathLength: 100, d: d })); g.appendChild(el("path", { "class": "mz-rg", pathLength: 100, d: d }));
      g.appendChild(el("circle", { "class": "mz-rr", cx: b[0].toFixed(1), cy: b[1].toFixed(1), r: 3 }));
      g.appendChild(el("circle", { "class": "mz-re a", cx: a[0].toFixed(1), cy: a[1].toFixed(1), r: 2.8 })); g.appendChild(el("circle", { "class": "mz-re b", cx: b[0].toFixed(1), cy: b[1].toFixed(1), r: 2.8 }));
      lay.appendChild(g); r.g = g; act.push(r);
      if (still) { g.classList.add("in"); return; }
      W.requestAnimationFrame(function () { W.requestAnimationFrame(function () { g.classList.add("in"); }); });
      W.setTimeout(function () {
        g.classList.remove("in"); g.classList.add("out");
        W.setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); act.splice(act.indexOf(r), 1); W.setTimeout(spawn, 500); }, 1700);
      }, (2.4 + T * 3) * 1000);
    }
    for (var i = 0; i < n; i++) (function (i) { if (still) spawn(); else W.setTimeout(spawn, 300 + i * 2700); })(i);
  }

  /* in the reels every picture, name and product leads to the advertiser's own website */
  var dn = 0;
  doc.addEventListener("pointerdown", function () { dn = Date.now(); }, true);
  doc.addEventListener("click", function (ev) {
    var tg = ev.target; if (!tg.closest || tg.closest("a,button,input,select,textarea,[data-mz]")) return;
    var sl = tg.closest(".mz-slide"); if (!sl || Date.now() - dn > 700) return;
    if (sl.classList.contains("mz-art")) { var rd = sl.querySelector("a.mz-read"); if (rd) rd.click(); return; }
    var u = sl.getAttribute("data-w"); if (!u) { var ct = sl.querySelector("a.mz-cta"); if (ct) ct.click(); return; }
    if (sl.classList.contains("mz-ps") || tg.closest(".mz-bp,.mz-bgrid,img,h2,h3,h4,b")) W.open(u, "_blank", "noopener,noreferrer");
  });
  /* header: very small once the page moves, gone after the map (PC: the logo then floats alone); plus a back-to-top button */
  function chrome() {
    if (doc.getElementById("mz-top")) return;
    var top = doc.createElement("button"); top.id = "mz-top"; top.type = "button"; top.setAttribute("aria-label", "Back to top");
    top.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11l6-6 6 6"/></svg>';
    var fl = doc.createElement("a"); fl.id = "mz-flogo"; fl.href = "#home"; fl.setAttribute("aria-label", "AAT"); fl.innerHTML = W.AAT && W.AAT.mag && W.AAT.mag.logoHTML ? W.AAT.mag.logoHTML(24) : "AAT";
    doc.body.appendChild(top); doc.body.appendChild(fl);
    function up(ev) { if (ev) ev.preventDefault(); W.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }); }
    top.addEventListener("click", up); fl.addEventListener("click", function (ev) { if (/^#?(home)?$/.test(location.hash)) up(ev); });
    var tick = 0;
    function upd() { tick = 0; var y = W.pageYOffset || 0, hdr = doc.getElementById("hdr"), lv = doc.querySelector("#app .live"), thr = lv ? lv.getBoundingClientRect().bottom + y - 70 : 720, past = y > thr;
      root.classList.toggle("mz-tiny", y > 40); root.classList.toggle("mz-past", past);
      root.classList.toggle("mz-float", past && !!hdr && hdr.classList.contains("hide")); root.classList.toggle("mz-totop", y > 700); }
    function req() { if (!tick) tick = W.requestAnimationFrame(function () { W.setTimeout(upd, 0); }); }
    W.addEventListener("scroll", req, { passive: true }); W.addEventListener("resize", req); W.addEventListener("hashchange", function () { W.setTimeout(upd, 120); }); upd();
  }
  /* rows of cards drift slowly sideways on their own until someone touches them */
  function drift() {
    [].slice.call(doc.querySelectorAll("#app .mz-mount:not(.mz-grid) .mz-srow, #app .ind")).forEach(function (el) {
      if (el._dr || still) return; el._dr = 1; var dir = 1, pos = null, idle = 0, lastT = 0, vis = true;
      function wait(ms) { idle = W.performance.now() + ms; pos = null; }
      ["pointerdown", "pointermove", "wheel", "touchstart", "touchmove", "focusin"].forEach(function (n) { el.addEventListener(n, function (e) { if (n !== "pointermove" || e.pointerType === "mouse") wait(n === "pointermove" ? 900 : 3500); }, { passive: true }); });
      if ("IntersectionObserver" in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(el);
      (function step(ts) {
        if (!el.isConnected) return; W.requestAnimationFrame(step);
        var dt = Math.min(ts - lastT, 60); lastT = ts;
        if (!vis || doc.hidden || ts < idle || root.classList.contains("mz-lock") || el.scrollWidth <= el.clientWidth + 4) { pos = null; return; }
        if (pos === null) pos = el.scrollLeft;
        var before = el.scrollLeft; pos += dir * dt * .022; el.scrollLeft = pos;
        if (Math.abs(pos - el.scrollLeft) > 2 || (el.scrollLeft === before && Math.abs(pos - before) > 1.5)) { dir = -dir; pos = el.scrollLeft; idle = ts + 1200; }
      })(0);
    });
  }
  /* reading pages carry a few advertisers: rails at the sides on PC, slim banners between paragraphs on phones; they change by themselves */
  function ads() {
    var rd = doc.querySelector("#app article.rd"); if (!rd || rd._ads) return; var A = W.AAT, G = A && A.mag; if (!G || !G.web) return; rd._ads = 1;
    var rank = { cover: 0, back: 1, spread: 2, premium: 3, full: 4 }, ar = A.state.lang === "ar";
    var pool = A.companies.filter(function (c) { return G.web(c) && G.logo(c); }).map(function (c) { var tr = c.tierSet || (A.tierOf ? A.tierOf(c) : c.tier) || ""; return { c: c, r: rank[tr] === undefined ? 5 : rank[tr] }; })
      .sort(function (a, b) { return a.r - b.r || a.c.page - b.c.page; }).map(function (o) { return o.c; });
    if (pool.length < 2) return;
    var top = pool.slice(0, Math.min(pool.length, 14)), seed = 0, h = location.hash, i; for (i = 0; i < h.length; i++) seed = (seed * 31 + h.charCodeAt(i)) % 9973;
    function esc(v) { return String(v == null ? "" : v).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }
    function L(v) { return v && typeof v === "object" ? (v[A.state.lang] || v.en || v.ar || "") : (v || ""); }
    function unit(x, kind) {
      var b = G.brand[x.page] || {}, a = b.a || "#EC1D25", ps = G.prods(x).slice(0, 4), u = G.web(x), line = (!ar && b.h) || L(x.tagline) || G.catName(x.cat);
      var pics = ps.map(function (p, k) { return '<img src="' + G.img(p.img) + '" alt="" style="--k:' + k + ";--n:" + ps.length + '">'; }).join("");
      var ln = G.lines(x).slice(0, 3), what = ps.length ? ps.slice(0, 2).map(function (p) { return G.clip(p.n, 38); }).join(" · ") : ln.join(" · ");
      if (ln.length && ps.length) what = ln.slice(0, 3).join(" · "); if (!what) what = line;
      return '<a class="mz-ad mz-ad-' + kind + (ps.length ? "" : " mz-ad-np") + '" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer sponsored" style="--a:' + a + ";--b:" + (b.b || "#15161a") + '">' +
        '<small class="mz-adl">' + (ar ? "إعلان" : "Advertisement") + "</small>" + (ps.length ? '<span class="mz-adp">' + pics + "</span>" : '<span class="mz-adp mz-adpl"><img src="' + G.logo(x) + '" alt=""></span>') +
        '<span class="mz-adx"><em class="mz-adk">' + esc(G.catName(x.cat)) + '</em><b class="mz-adh">' + esc(G.clip(what, kind === "tower" ? 70 : 90)) + '</b><span class="mz-adco">' + (ps.length ? '<img src="' + G.logo(x) + '" alt="">' : "") + "<i>" + esc(x.company) + '</i></span><span class="mz-adc">' + (ar ? "زيارة الموقع" : "Visit website") + " ↗</span></span></a>";
    }
    var slots = [], wide = W.innerWidth >= 1240;
    function slot(parent, kind, before) { var d = doc.createElement("div"); d.className = "mz-slot mz-slot-" + kind; if (before) parent.insertBefore(d, before); else parent.appendChild(d); slots.push({ el: d, kind: kind, k: slots.length }); }
    if (wide) { ["l", "r"].forEach(function (sd, j) { var as = doc.createElement("aside"); as.className = "mz-arail mz-arail-" + sd; as.setAttribute("aria-label", "Advertisements"); var inn = doc.createElement("div"); as.appendChild(inn); rd.appendChild(as); slot(inn, j ? "card" : "tower"); slot(inn, j ? "tower" : "card"); }); }
    else { var pr = rd.querySelector(".prose") || rd.querySelector(".rd-w"), ps2 = pr ? [].slice.call(pr.children) : []; if (ps2.length > 3) slot(pr, "strip", ps2[3]); if (ps2.length > 9) slot(pr, "card", ps2[9]); else if (pr) slot(pr, "card"); }
    var step = 0;
    function fill(sl, first) { var x = top[(seed + sl.k * 3 + step * slots.length + (step ? sl.k : 0)) % top.length], used = slots.map(function (o) { return o.cur; }), g = 0; while (used.indexOf(x) > -1 && g++ < top.length) x = top[(top.indexOf(x) + 1) % top.length];
      sl.cur = x; if (first || still) { sl.el.innerHTML = unit(x, sl.kind); return; }
      sl.el.classList.add("mz-sw"); W.setTimeout(function () { if (!sl.el.isConnected) return; sl.el.innerHTML = unit(x, sl.kind); sl.el.classList.remove("mz-sw"); }, 520); }
    slots.forEach(function (sl) { fill(sl, true); });
    /* two of them change every 40 seconds, in turn */
    var turn = 0, iv = W.setInterval(function () { if (!rd.isConnected) { W.clearInterval(iv); return; } if (doc.hidden || !slots.length) return; step++;
      for (var z = 0; z < Math.min(2, slots.length); z++) { (function (sl, dl) { W.setTimeout(function () { sl.cur = null; fill(sl); }, dl); })(slots[(turn + z) % slots.length], z * 700); } turn += 2; }, 40000);
  }
  /* ── exhibitions: choose a country first; every row carries its country's flag and colour ── */
  function star(cx, cy, r, fill, rot) { var p = [], i, a; for (i = 0; i < 10; i++) { a = (rot || -90) * Math.PI / 180 + i * Math.PI / 5; p.push((cx + Math.cos(a) * (i % 2 ? r * .4 : r)).toFixed(1) + "," + (cy + Math.sin(a) * (i % 2 ? r * .4 : r)).toFixed(1)); } return '<polygon points="' + p.join(" ") + '" fill="' + fill + '"/>'; }
  function cres(cx, cy, r, fill, bg, dx) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"/><circle cx="' + (cx + (dx || r * .32)) + '" cy="' + cy + '" r="' + (r * .82).toFixed(1) + '" fill="' + bg + '"/>'; }
  function h3(a, b, c) { return '<rect width="60" height="14" fill="' + a + '"/><rect y="13.3" width="60" height="13.4" fill="' + b + '"/><rect y="26.6" width="60" height="13.4" fill="' + c + '"/>'; }
  var FL = {
    tw: ["#D6202B", function () { var r = ""; for (var i = 0; i < 12; i++) r += '<polygon points="15,3.6 16.3,8 13.7,8" fill="#fff" transform="rotate(' + i * 30 + ' 15 10)"/>'; return '<rect width="60" height="40" fill="#D6202B"/><rect width="30" height="20" fill="#1B3F9C"/>' + r + '<circle cx="15" cy="10" r="4.1" fill="#1B3F9C"/><circle cx="15" cy="10" r="3.4" fill="#fff"/>'; }],
    id: ["#D6202B", function () { return '<rect width="60" height="40" fill="#fff"/><rect width="60" height="20" fill="#D6202B"/>'; }],
    my: ["#1B3F9C", function () { var r = '<rect width="60" height="40" fill="#fff"/>'; for (var i = 0; i < 7; i++) r += '<rect y="' + (i * 5.714).toFixed(2) + '" width="60" height="2.857" fill="#CC0001"/>'; return r + '<rect width="30" height="22.86" fill="#010066"/>' + cres(12, 11.4, 6.6, "#FFCC00", "#010066", 2) + star(19.5, 11.4, 5, "#FFCC00"); }],
    pk: ["#0B6B3A", function () { return '<rect width="60" height="40" fill="#01411C"/><rect width="15" height="40" fill="#fff"/>' + cres(37, 20, 10, "#fff", "#01411C", 2.8) + star(42.5, 15.5, 4, "#fff", -60); }],
    af: ["#1c1c1c", function () { return '<rect width="60" height="40" fill="#D32011"/><rect width="20" height="40" fill="#000"/><rect x="40" width="20" height="40" fill="#007A36"/><circle cx="30" cy="20" r="6" fill="none" stroke="#fff" stroke-width="1.4"/>'; }],
    dz: ["#0B7A3E", function () { return '<rect width="60" height="40" fill="#fff"/><rect width="30" height="40" fill="#006233"/>' + cres(30, 20, 10, "#D21034", "#fff", 2.6) + '<rect width="30" height="40" fill="#006233" clip-path="inset(0)" opacity="0"/>' + star(35, 20, 4.6, "#D21034", -90); }],
    eg: ["#C8102E", function () { return h3("#CE1126", "#fff", "#000") + '<path d="M27 16h6l-1 7h-4z" fill="#C09300"/><circle cx="30" cy="15.6" r="1.6" fill="#C09300"/>'; }],
    iq: ["#C8102E", function () { return h3("#CE1126", "#fff", "#000") + '<text x="30" y="23.6" text-anchor="middle" font-family="Almarai, Tahoma, Arial" font-weight="800" font-size="7" fill="#007A3D">الله أكبر</text>'; }],
    kw: ["#0B7A3E", function () { return h3("#007A3D", "#fff", "#CE1126") + '<polygon points="0,0 15,13.3 15,26.6 0,40" fill="#000"/>'; }],
    ye: ["#C8102E", function () { return h3("#CE1126", "#fff", "#000"); }],
    om: ["#C8102E", function () { return h3("#fff", "#DB161B", "#008000") + '<rect width="16" height="40" fill="#DB161B"/><path d="M5 5l6 6M11 5l-6 6" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>'; }],
    qa: ["#8A1538", function () { var p = "0,0 17,0", i; for (i = 0; i < 9; i++) p += " 23," + (i * 4.444 + 2.222).toFixed(2) + " 17," + ((i + 1) * 4.444).toFixed(2); return '<rect width="60" height="40" fill="#8A1538"/><polygon points="' + p + ' 0,40" fill="#fff"/>'; }],
    sa: ["#0B6B3A", function () { return '<rect width="60" height="40" fill="#005430"/><image href="assets/img/flag-sa.png" x="8" y="-2" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>'; }],
    sy: ["#0B7A3E", function () { return h3("#007A3D", "#fff", "#000") + star(18, 20, 3.4, "#CE1126") + star(30, 20, 3.4, "#CE1126") + star(42, 20, 3.4, "#CE1126"); }],
    ae: ["#0B7A3E", function () { return h3("#00732F", "#fff", "#000") + '<rect width="15" height="40" fill="#FF0000"/>'; }],
    tr: ["#E30A17", function () { return '<rect width="60" height="40" fill="#E30A17"/>' + cres(22, 20, 10, "#fff", "#E30A17", 2.5) + star(34, 20, 5, "#fff", -18); }]
  };
  function flag(k, cls) { var f = FL[k]; return f ? '<svg class="' + (cls || "fl") + '" viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + f[1]() + "</svg>" : ""; }
  function exRows() {
    var A = W.AAT, cn = (A && A.D.countries) || {};
    [].forEach.call(doc.querySelectorAll("#app a.er[data-c]:not(.er-x)"), function (r) { var k = r.getAttribute("data-c"), f = FL[k]; if (!f) return; r.classList.add("er-x"); r.style.setProperty("--ca", f[0]);
      r.insertAdjacentHTML("afterbegin", '<i class="er-bg" aria-hidden="true">' + flag(k) + "</i>");
      var b = r.querySelector(".er-b"), ev = A.eventById((r.getAttribute("href") || "").replace("#exhibition-", "")), city = ev ? (A.D.cities && A.D.cities[ev.city] ? A.L(A.D.cities[ev.city]) : ev.city) : "", cname = cn[k] ? A.L(cn[k]) : "";
      if (b) { b.insertAdjacentHTML("afterbegin", '<span class="er-cn" title="' + A.esc(cname) + '">' + flag(k) + "<em>" + A.esc(city || cname) + "</em></span>");
        var sm = b.querySelector("small"); if (sm) { var tx = sm.textContent; if (cname && tx.slice(-(cname.length + 3)) === " · " + cname) tx = tx.slice(0, -(cname.length + 3)); if (city && tx.slice(-(city.length + 2)) === ", " + city) tx = tx.slice(0, -(city.length + 2)); if (city && tx.slice(-(city.length + 3)) === " · " + city) tx = tx.slice(0, -(city.length + 3)); sm.textContent = tx; } } });
  }
  function exPick() {
    var bar = doc.querySelector("#app .exc"); if (!bar || bar._x) return; bar._x = 1; var A = W.AAT, cn = A.D.countries || {}, ar = A.state.lang === "ar", list = doc.querySelector("#app .el"), wrap = bar.parentNode;
    var cnt = {}, tot = 0; [].forEach.call(list.querySelectorAll(".er"), function (r) { var k = r.getAttribute("data-c"); cnt[k] = (cnt[k] || 0) + 1; tot++; });
    var keys = Object.keys(cn).sort(function (a, b) { return (cnt[b] ? 1 : 0) - (cnt[a] ? 1 : 0); });
    var h = '<div class="xco"><p class="xco-t">' + (ar ? "اختر الدولة" : "Choose a country") + '</p><div class="xco-g"><button type="button" class="xc xc-all" data-xc=""><span class="xc-f"><i>' + keys.slice(0, 9).map(function (k) { return flag(k); }).join("") + '</i></span><span class="xc-b"><b>' + (ar ? "كل الدول" : "All countries") + "</b><small>" + tot + " " + (ar ? "معرضاً" : "exhibitions") + "</small></span></button>" +
      keys.map(function (k, i) { var n = cnt[k] || 0; return '<button type="button" class="xc' + (n ? "" : " xc-0") + '" data-xc="' + k + '" style="--ca:' + FL[k][0] + ";--i:" + i + '"' + (n ? "" : " disabled") + '><span class="xc-f">' + flag(k) + '</span><span class="xc-b"><b>' + A.esc(A.L(cn[k])) + "</b><small>" + (n ? n + " " + (ar ? "معرضاً" : "exhibitions") : (ar ? "لا معارض مؤكدة" : "none confirmed")) + "</small></span></button>"; }).join("") + "</div></div>";
    wrap.insertAdjacentHTML("afterbegin", h); wrap.classList.add("xpg", "xpg-pick");
    bar.insertAdjacentHTML("afterbegin", '<button type="button" class="chip xback" data-xback>' + (ar ? "→ الدول" : "← Countries") + "</button>");
    [].forEach.call(bar.querySelectorAll("[data-exc]"), function (c) { var k = c.getAttribute("data-exc"); if (k && FL[k]) c.insertAdjacentHTML("afterbegin", flag(k)); });
    wrap.addEventListener("click", function (ev) { var t = ev.target.closest && ev.target.closest("[data-xc],[data-xback]"); if (!t) return;
      if (t.hasAttribute("data-xback")) { wrap.classList.add("xpg-pick"); return; }
      var k = t.getAttribute("data-xc"), chip = bar.querySelector('[data-exc="' + k + '"]'); wrap.classList.remove("xpg-pick"); if (chip) chip.click();
      var y = wrap.getBoundingClientRect().top + W.pageYOffset - 90; W.scrollTo({ top: y, behavior: still ? "auto" : "smooth" }); });
  }
  function exAll() { exPick(); exRows(); }
  doc.addEventListener("click", function (ev) { var b = ev.target.closest && ev.target.closest("[data-modg]"); if (!b) return; var g = doc.getElementById("modg-" + b.getAttribute("data-modg")); if (g) W.scrollTo({ top: g.getBoundingClientRect().top + W.pageYOffset - 84, behavior: still ? "auto" : "smooth" }); });
  /* exhibitions: filter the list by country */
  doc.addEventListener("click", function (ev) { var b = ev.target.closest && ev.target.closest(".exc [data-exc]"); if (!b) return; var k = b.getAttribute("data-exc"), box = b.parentNode;
    [].forEach.call(box.children, function (x) { x.classList.toggle("on", x === b); });
    [].forEach.call(doc.querySelectorAll("#app .el .er"), function (r) { r.style.display = !k || r.getAttribute("data-c") === k ? "" : "none"; r.classList.add("in"); }); });
  /* news and articles are for reading: a still, quiet page */
  function readMode() { root.classList.toggle("mz-quiet", /^#?\/?(articles|news|article-|read-)/.test(location.hash)); }
  W.addEventListener("hashchange", readMode); readMode();
  /* the full-screen reel is sized to the part of the screen that is really visible (phone browser bars come and go) */
  function vh() { var v = W.visualViewport, h = Math.round(v ? v.height : W.innerHeight), t = Math.round(v ? v.offsetTop : 0); root.style.setProperty("--mzvh", h + "px"); root.style.setProperty("--mzvt", t + "px"); }
  vh(); W.addEventListener("resize", vh); W.addEventListener("orientationchange", function () { W.setTimeout(vh, 250); }); if (W.visualViewport) { W.visualViewport.addEventListener("resize", vh); W.visualViewport.addEventListener("scroll", vh); }
  function go() { bg(); liveMap(); chrome(); drift(); ads(); exAll(); readMode(); }
  var app = doc.getElementById("app");
  if (app && W.MutationObserver) new MutationObserver(function () { liveMap(); drift(); ads(); exAll(); }).observe(app, { childList: true, subtree: true });
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", go); else go();
  W.addEventListener("load", go);
})(window);
