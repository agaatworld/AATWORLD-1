/* AAT World v2 — application shell: routing, events (one delegated listener per type), motion, flipbook, assistant. */
(function (W) {
  "use strict";
  var A = W.AAT, U = A.ui, V = A.views, esc = A.esc, t = A.t, doc = document, root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduce = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hdr, app, ftr, route = { v: "home" }, timers = [];

  /* ---------- theme and language ---------- */
  function applyTheme(th) { root.setAttribute("data-theme", th); var m = $('meta[name="theme-color"]'); if (m) m.setAttribute("content", th === "dark" ? "#0D0D0F" : "#FFFFFF"); }
  function initPrefs() {
    var th = A.store.get("theme", null) || (W.matchMedia && W.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(th);
    A.setLang(A.store.get("lang", null) || "ar");
  }
  function chrome() {
    root.lang = A.state.lang; root.dir = A.dir();
    hdr.innerHTML = U.header(); ftr.innerHTML = U.footer();
    applyLook(); applyText(hdr); applyText(ftr);
    var sk = $(".skip"); if (sk) sk.textContent = t("skip");
    chatRender(true); navSync();
  }

  /* ---------- customisation: colours, logo, section order, added blocks, text replacements (read-only on the public site) ---------- */
  var THEME_VARS = { red: ["--red", "--red-2"], bg: ["--bg"], surface: ["--surface"], ink: ["--ink"], radius: ["--r"] };
  function applyLook() {
    var th = (A.getCustom().theme) || {}, st = root.style;
    Object.keys(THEME_VARS).forEach(function (k) { THEME_VARS[k].forEach(function (v) { if (th[k] && root.getAttribute("data-theme") !== "dark" || (th[k] && (k === "red" || k === "radius"))) st.setProperty(v, k === "radius" ? (+th[k] || 0) + "px" : th[k]); else st.removeProperty(v); }); });
    if (th.scale) st.setProperty("font-size", clampNum(th.scale, 85, 125) + "%"); else st.removeProperty("font-size");
  }
  function clampNum(v, a, b) { v = +v || 100; return Math.max(a, Math.min(b, v)); }
  function sigOf(el, list) { var c = (el.className || "").split(" ")[0] || "x", key = el.tagName.toLowerCase() + "." + c, n = 0; for (var i = 0; i < list.length && list[i] !== el; i++) if ((list[i].tagName.toLowerCase() + "." + ((list[i].className || "").split(" ")[0] || "x")) === key) n++; return key + "#" + n; }
  function blockHtml(b) {
    var L = A.L, href = b.href && (/^#/.test(b.href) ? b.href : A.safeUrl(b.href));
    return '<section class="sec xb ' + (b.style === "dark" ? "cta" : b.style === "alt" ? "alt" : "") + '" data-block="' + esc(b.id) + '"><div class="wrap xb-in' + (b.img ? " pic" : "") + '">' + (b.img ? '<img class="xb-img" src="' + esc(A.img(b.img)) + '" alt="">' : "") +
      '<div class="xb-t">' + (L(b.title) ? '<h2 class="h2">' + esc(L(b.title)) + "</h2>" : "") + String(L(b.body) || "").split(/\n+/).filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      (href && L(b.btn) ? '<div class="row"><a class="btn btn-red" href="' + esc(href) + '"' + (/^#/.test(href) ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(L(b.btn)) + "</a></div>" : "") + "</div></div></section>";
  }
  function applyLayout() {
    var c = A.getCustom(), view = $(".view", app); if (!view) return;
    var page = route.v, lay = (c.pages && c.pages[page]) || {}, kids = Array.prototype.slice.call(view.children);
    kids.forEach(function (el) { el.setAttribute("data-sig", sigOf(el, kids)); });
    (c.blocks || []).filter(function (b) { return b.page === page; }).forEach(function (b) {
      var tmp = doc.createElement("div"); tmp.innerHTML = blockHtml(b); var el = tmp.firstChild; el.setAttribute("data-sig", "block." + b.id);
      var ref = b.pos && b.pos !== "top" && b.pos !== "bottom" ? view.querySelector('[data-sig="' + String(b.pos).replace(/"/g, "") + '"]') : null;
      if (b.pos === "top") view.insertBefore(el, view.firstChild); else if (ref) view.insertBefore(el, ref.nextSibling); else view.appendChild(el);
    });
    if (lay.order && lay.order.length) lay.order.forEach(function (sig) { var el = view.querySelector('[data-sig="' + String(sig).replace(/"/g, "") + '"]'); if (el) view.appendChild(el); });
    (lay.hide || []).forEach(function (sig) { var el = view.querySelector('[data-sig="' + String(sig).replace(/"/g, "") + '"]'); if (el) el.setAttribute("data-off", "1"); });
  }
  function applyText(rootEl) {
    var map = (A.getCustom().text || {})[A.state.lang]; if (!map || !Object.keys(map).length) return;
    var w = doc.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (node) { var k = node.nodeValue.trim(); if (k && Object.prototype.hasOwnProperty.call(map, k)) node.nodeValue = node.nodeValue.replace(k, map[k]); });
  }

  /* ---------- router ---------- */
  function render(keepScroll) {
    route = A.parseRoute(location.hash);
    var v = V.view(route);
    timers.forEach(clearInterval); timers = [];
    app.innerHTML = '<div class="view">' + v.html + "</div>";
    applyLayout(); applyText(app);
    doc.title = (v.title ? v.title + " · " : "") + t("brand_full") + " | AAT World";
    $$("[data-nav]").forEach(function (a) { if (a.getAttribute("data-nav") === route.nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    closeMenus(); navSync(); motion(); sliderStart(); flipStart();
    if (!keepScroll) { W.scrollTo(0, 0); var h1 = $("h1", app); if (h1 && route.v !== "home") try { h1.focus({ preventScroll: true }); } catch (e) { /* older browsers */ } }
  }
  function closeMenus() {
    var m = $("#mnav"), b = $("[data-act=menu]"); if (m) m.hidden = true; if (b) b.setAttribute("aria-expanded", "false");
    var lm = $(".lang-m"), lb = $("[data-act=lang-open]"); if (lm) lm.hidden = true; if (lb) lb.setAttribute("aria-expanded", "false");
    hsClose();
  }

  /* ---------- motion ---------- */
  function splitWords(el) {
    if (el.getAttribute("data-split")) return; el.setAttribute("data-split", "1");
    /* in a right-to-left page a run of several Latin words must stay whole, or its word order flips */
    if (A.dir() === "rtl" && /[A-Za-z0-9&().]+\s+[A-Za-z0-9&().]/.test(el.textContent)) { el.classList.add("fade"); return; }
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var parts = ch.textContent.split(/(\s+)/), frag = doc.createDocumentFragment();
          if (!parts.join("").trim()) return;
          parts.forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(doc.createTextNode(w)); return; }
            var o = doc.createElement("span"), n = doc.createElement("span"); o.className = "sw"; n.textContent = w; n.style.setProperty("--i", i++); o.appendChild(n); frag.appendChild(o);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== "svg") walk(ch);
      });
    })(el);
  }
  function countUp(el) {
    var to = +el.getAttribute("data-to"), t0 = null;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function rollDigits(el) {
    var txt = el.textContent;
    el.innerHTML = txt.split("").map(function (d, i) { var col = ""; for (var k = 0; k <= +d; k++) col += "<span>" + k + "</span>"; return '<span class="dg" style="--d:' + d + ";--i:" + i + '"><span>' + col + "</span></span>"; }).join("");
    el.classList.add("rolling");
  }
  function motion() {
    if (reduce || !("IntersectionObserver" in W)) return;
    var vh = W.innerHeight;
    var heads = $$(".split", app); heads.forEach(splitWords);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (!en.isIntersecting) return; var el = en.target; io.unobserve(el); if (el.classList.contains("count")) countUp(el); else el.classList.add("in"); });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    $$(".rv, .split, .sh, .lead", app).forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("in"); }); });
      else { el.classList.add("pre"); io.observe(el); }
    });
    $$(".count", app).forEach(function (el) { io.observe(el); });
    var roll = $("[data-roll]", app); if (roll) rollDigits(roll);
  }

  /* header: shrinks, hides while scrolling down, returns when scrolling up; red line follows the pointer in the menu */
  function headerScroll() {
    var last = W.scrollY, tick = false, bar = $("#progress");
    function upd() {
      tick = false; var y = W.scrollY, h = root.scrollHeight - W.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0).toFixed(4) + ")";
      hdr.classList.toggle("scrolled", y > 24);
      var open = ($("#mnav") && !$("#mnav").hidden) || ($(".lang-m") && !$(".lang-m").hidden);
      if (!open && y > 260 && y > last + 4) { hdr.classList.add("hide"); root.classList.add("hdr-off"); }
      else if (y < last - 4 || y < 260) { hdr.classList.remove("hide"); root.classList.remove("hdr-off"); }
      if (Math.abs(y - last) > 4) last = y;
    }
    W.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }
  function navPlace(a) {
    var nav = $(".hd-nav"), ind = $(".hd-ind"); if (!nav || !ind) return;
    if (!a) { ind.style.opacity = "0"; return; }
    var nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    ind.style.width = Math.max(r.width - 20, 8) + "px"; ind.style.transform = "translateX(" + (r.left - nr.left + 10) + "px)"; ind.style.opacity = "1";
  }
  function navSync() { setTimeout(function () { navPlace($(".hd-nav a[aria-current=page]")); }, 50); }

  /* ---------- featured slider ---------- */
  function sliderGo(i) {
    var sl = $("[data-sl]", app); if (!sl) return;
    var n = $$(".sl-t", sl).length; i = (i + n) % n; sl.setAttribute("data-i", i);
    [".sl-img", ".sl-s", ".sl-t"].forEach(function (c) { $$(c, sl).forEach(function (el, k) { el.classList.toggle("on", k === i); if (c === ".sl-s") el.setAttribute("aria-hidden", String(k !== i)); if (c === ".sl-t") el.setAttribute("aria-selected", String(k === i)); }); });
  }
  function sliderStart() {
    var sl = $("[data-sl]", app); if (!sl || reduce) return;
    sl.addEventListener("animationend", function (e) { if (e.animationName === "slFill") sliderGo(+sl.getAttribute("data-i") + 1); });
    ["pointerenter", "focusin"].forEach(function (ev) { sl.addEventListener(ev, function (e) { if (ev === "focusin" || e.pointerType === "mouse") sl.classList.add("paused"); }); });
    ["pointerleave", "focusout"].forEach(function (ev) { sl.addEventListener(ev, function () { sl.classList.remove("paused"); }); });
  }

  /* ---------- flipbook (the magazine is bound on the right, like the printed Arabic edition) ---------- */
  var fb = null;
  function fbSpread(p, single, n) { if (single) return [p]; if (p <= 1) return [1]; if (p >= n && n % 2 === 0) return [n]; var low = p % 2 === 0 ? p : p - 1; return low + 1 > n ? [low] : [low, low + 1]; }
  function fbSrc(p) { return A.img("mag/p" + p + ".jpg"); }
  function fbShow() {
    var s = fbSpread(fb.page, fb.single, fb.n), book = fb.book;
    book.classList.toggle("one", s.length === 1);
    fb.r.src = fbSrc(s[0]); fb.r.alt = t("ed_page", { n: s[0] });
    if (s[1]) { fb.l.src = fbSrc(s[1]); fb.l.alt = t("ed_page", { n: s[1] }); }
    fb.lbl.textContent = s.length > 1 ? t("fl_pages", { a: s[0], b: s[1], n: fb.n }) : t("ed_page", { n: s[0] }) + " / " + fb.n;
    fb.range.value = s[0];
    var links = "";
    A.companies.forEach(function (c) { if (A.companyPages(c).some(function (p) { return s.indexOf(p) > -1; })) links += '<a class="chip" href="#company-' + c.page + '">' + esc(c.company) + "</a>"; });
    A.articlesFor(A.state.lang).forEach(function (a) { if (a.pages.some(function (p) { return s.indexOf(p) > -1; })) links += '<a class="chip" href="#article-' + a.id + '">' + esc(a.title[A.articleLang()] || a.title.en || a.title.ar) + "</a>"; });
    fb.links.innerHTML = links;
    $(".fb-nav.prev", fb.el).disabled = s[0] <= 1; $(".fb-nav.next", fb.el).disabled = s[s.length - 1] >= fb.n;
    [s[s.length - 1] + 1, s[s.length - 1] + 2, s[0] - 1].forEach(function (p) { if (p >= 1 && p <= fb.n) { var im = new Image(); im.src = fbSrc(p); } });
  }
  function fbGo(d) {
    if (!fb || fb.busy) return;
    var cur = fbSpread(fb.page, fb.single, fb.n), target = d > 0 ? cur[cur.length - 1] + 1 : cur[0] - 1;
    if (target < 1 || target > fb.n) return;
    var nxt = fbSpread(target, fb.single, fb.n);
    if (reduce || fb.single || cur.length < 2 || nxt.length < 2) { fb.book.classList.add("fade"); fb.page = nxt[0]; fbShow(); setTimeout(function () { fb.book.classList.remove("fade"); }, 260); return; }
    /* a leaf turns over the spine: forward lifts the left (higher) page, back lifts the right (lower) page */
    fb.busy = true; var leaf = fb.leaf, f = $(".f img", leaf), b = $(".b img", leaf);
    leaf.className = "fb-leaf " + (d > 0 ? "fwd" : "bwd");
    if (d > 0) { f.src = fbSrc(cur[1]); b.src = fbSrc(nxt[0]); fb.l.src = fbSrc(nxt[1]); }
    else { f.src = fbSrc(cur[0]); b.src = fbSrc(nxt[1]); fb.r.src = fbSrc(nxt[0]); }
    void leaf.offsetWidth; leaf.classList.add("go");
    setTimeout(function () { fb.page = nxt[0]; fbShow(); leaf.className = "fb-leaf"; fb.busy = false; }, 620);
  }
  function flipStart() {
    var el = $("[data-fb]", app); fb = null; if (!el) return;
    fb = { el: el, n: +el.getAttribute("data-n"), page: +el.getAttribute("data-page"), book: $(".fb-book", el), r: $(".fb-p.r img", el), l: $(".fb-p.l img", el), leaf: $(".fb-leaf", el), lbl: $(".fb-lbl", el), range: $("#fb-r", el), links: $(".fb-links", el), single: W.innerWidth < 760, busy: false };
    fbShow();
    fb.range.addEventListener("input", function () { fb.page = +fb.range.value; fbShow(); });
    var x0 = null;
    fb.book.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    fb.book.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) fbGo(dx > 0 ? 1 : -1); }, { passive: true });
    fb.book.addEventListener("click", function (e) { var r = fb.book.getBoundingClientRect(); fbGo(e.clientX < r.left + r.width / 2 ? 1 : -1); });
  }

  /* ---------- hotspots, zoom ---------- */
  function hsClose() { var p = $(".hsp"); if (p) p.remove(); }
  function hsOpen(k) {
    hsClose(); var c = A.company(route.id); if (!c || !c.hot[k]) return;
    var h = c.hot[k], btn = $('.adp .hs[data-k="' + k + '"]', app); if (!btn) return;
    var fig = btn.parentNode, prod = -1; A.productsOf(c).forEach(function (it, j) { if (it.hk === k && prod < 0) prod = j; });
    var pop = doc.createElement("div"); pop.className = "hsp" + (h.x > 55 ? " left" : "") + (h.y > 60 ? " up" : ""); pop.style.left = h.x + "%"; pop.style.top = h.y + "%"; pop.setAttribute("role", "dialog");
    pop.innerHTML = "<b>" + esc(h.name) + "</b><span>" + esc(A.L(h.d)) + "</span>" + (prod > -1 ? '<a class="btn btn-red btn-sm" href="#product-' + c.page + "-" + prod + '">' + t("details") + "</a>" : "");
    fig.appendChild(pop);
    if (fig.getBoundingClientRect().top < 0 || fig.getBoundingClientRect().bottom > W.innerHeight) btn.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }
  function zoomOpen(src, alt) {
    var z = doc.createElement("div"); z.className = "zm"; z.setAttribute("role", "dialog"); z.setAttribute("aria-modal", "true");
    z.innerHTML = '<button type="button" class="ib" aria-label="' + esc(t("v_close")) + '">' + U.ic("x", 24) + '</button><img src="' + esc(src) + '" alt="' + esc(alt || "") + '">';
    z.addEventListener("click", function () { z.remove(); }); doc.body.appendChild(z); $("button", z).focus();
  }

  /* ---------- newsletter ---------- */
  function newsletterSubmit(form) {
    var inp = form.elements.email, msg = $(".nl-msg", form), v = (inp.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = t("x_nl_bad"); msg.className = "nl-msg bad"; inp.setAttribute("aria-invalid", "true"); inp.focus(); return; }
    inp.removeAttribute("aria-invalid");
    var api = W.AAT_NEWSLETTER_API;
    function viaMail() { msg.className = "nl-msg ok"; msg.innerHTML = esc(t("x_nl_mail")) + ' <a href="' + A.mailLink(A.D.config.email, "Newsletter subscription", "Please add this address to the AAT World newsletter: " + v) + '">' + esc(t("x_nl_send")) + "</a>"; }
    if (!api) { viaMail(); return; }
    fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: v, lang: A.state.lang }) })
      .then(function (r) { if (!r.ok) throw 0; msg.className = "nl-msg ok"; msg.textContent = t("x_nl_ok"); form.reset(); }).catch(viaMail);
  }

  /* ---------- assistant: own API > Claude (inside claude.ai) > built-in quick answers ---------- */
  var chat = { open: false, log: [], turns: [], mode: null, sample: null, busy: false };
  function aiInit() {
    if (W.AAT_ASSISTANT_API) { chat.mode = "api"; return; }
    if (W.claude && typeof W.claude.use === "function") W.claude.use("sample").then(function (fn) { if (fn) { chat.sample = fn; chat.mode = "claude"; if (chat.open) chatRender(false); } }).catch(function () {});
  }
  function links(list) { return '<div class="res">' + list.map(function (x) { return '<a href="' + x[0] + '"' + (/^#/.test(x[0]) ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(x[1]) + (x[2] ? "<small>" + esc(x[2]) + "</small>" : "") + "</a>"; }).join("") + "</div>"; }
  function contactRes() { var c = A.D.config; return links([[A.waLink(), t("wa"), c.phoneDisplay], ["mailto:" + c.email, t("email_word"), c.email]]); }
  function has(q, words) { return words.some(function (w) { return q.indexOf(w) > -1; }); }
  function quickAnswer(raw) {
    var q = " " + raw.toLowerCase() + " ";
    if (has(q, ["whatsapp", "contact", "phone", "email", "call", "واتس", "تواصل", "اتصال", "هاتف", "بريد", "聯絡", "联系", "hubungi"])) return esc(t("chat_contact")) + contactRes();
    if (has(q, ["advertis", " ad ", "اعلان", "إعلان", "أعلن", "廣告", "广告", "iklan"])) return esc(t("ad_title")) + links([["#advertise", t("adv_btn")]]) + contactRes();
    if (has(q, ["show", "expo", "exhibition", "fair", "معرض", "معارض", "展", "pameran"])) { var ev = A.eventsWindow(new Date(), 3); return ev.length ? esc(t("chat_shows")) + links(ev.slice(0, 5).map(function (e) { return ["#exhibition-" + e.id, e.name, A.fmtRange(e.start, e.end)]; })) : esc(t("x_ex_none")); }
    if (has(q, ["club", "aatbc", "نادي", "俱樂部", "俱乐部", "kelab"])) return esc(t("cb_goals_p")) + links([["#club", t("mem_title")]]);
    if (has(q, ["magazine", "issue", "مجلة", "العدد", "雜誌", "杂志", "majalah"])) return esc(t("mb_claim")) + links([["#flip", t("fl_open")], ["#articles", t("ar_nav")]]);
    var words = raw.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 2; });
    var hits = A.allProducts().filter(function (p) { return words.some(function (w) { return A.matchProduct(p, w, ""); }); }).slice(0, 5);
    if (hits.length) return esc(t("hot_title")) + links(hits.map(function (p) { return ["#product-" + p.c.page + "-" + p.k, p.it.n, p.c.company]; }));
    return esc(t("chat_no_sup")) + links([["#products", t("nav_products")]]) + contactRes();
  }
  function aiRules() {
    var names = { en: "English", ar: "Arabic", "zh-TW": "Traditional Chinese", "zh-CN": "Simplified Chinese", ms: "Malay" }, c = A.D.config, M = A.D.magazine, out = [];
    out.push("MAGAZINE: Arab Asian Trade (AAT) / التجارة العربية الآسيوية / 中阿商業雜誌. Established in Taiwan in 1982 by Mr. Muhammad Marwan Fattal. The only monthly bilingual (Arabic and English) advertising publication of its kind. Current issue " + M.issue + " (" + M.month.en + ").");
    out.push("CONTACT: WhatsApp " + c.phoneDisplay + " · email " + c.email + " · club and support " + c.clubEmail + " · address " + c.address.en);
    out.push("COMPANIES IN THIS ISSUE (page #company-N, its products #company-N.products):");
    A.companies.forEach(function (x) { out.push("- #company-" + x.page + " | " + x.company + " | " + ((A.cats[x.cat] || {}).en || x.cat) + " | " + ((x.city && x.city.en) || "") + " | " + ((x.about && x.about.en) || "") + (x.email ? " | " + x.email : "") + (x.web ? " | " + x.web : "") + " | products: " + A.productsOf(x).slice(0, 6).map(function (i) { return i.n; }).join("; ")); });
    out.push("EXHIBITIONS IN THE NEXT THREE MONTHS (#exhibition-ID):");
    A.eventsWindow(new Date(), 3).forEach(function (e) { out.push("- #exhibition-" + e.id + " | " + e.name + " | " + e.start + " to " + e.end + " | " + e.venue.en); });
    out.push("ARTICLES (#article-ID):"); A.articles.forEach(function (a) { out.push("- #article-" + a.id + " | " + (a.title.en || "") + " | " + (a.title.ar || "")); });
    out.push("OTHER PAGES: #advertise (ad positions; rates on request), #products, #flip (read the magazine), #club (AAT Business Club), #about, #contact.");
    return "You are the assistant on the website of AAT World, publisher of the Arab Asian Trade magazine. Answer ONLY from the DATA below; never invent companies, prices, dates or claims. If the answer is not in the data, say so briefly and suggest contacting the team by WhatsApp or email. " +
      "Reply in " + (names[A.state.lang] || "the user's language") + " unless the user writes in another language. Be short and clear (about 120 words at most), plain text. When you mention a page of this site, write a markdown link with its hash address, for example [YE I Machinery](#company-3).\n\nDATA:\n" + out.join("\n").slice(0, 60000);
  }
  function aiHtml(text) {
    var h = esc(text).replace(/\[([^\]]{1,120})\]\((#[A-Za-z0-9_.\-~]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]{1,200})\*\*/g, "<b>$1</b>");
    return h.split(/\n{2,}/).map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; }).join("");
  }
  function chatRender(reset) {
    if (reset) chat.log = [{ who: "bot", html: esc(t("chat_hello")) }];
    var el = $("#chat"); if (!el) return;
    el.innerHTML = '<button type="button" class="chat-b" data-act="chat-open" aria-label="' + esc(t("chat_open")) + '"' + (chat.open ? " hidden" : "") + ">" + U.ic("chat", 22) + "<span><b>" + t("chat_cta") + "</b><small>" + t("chat_cta2") + "</small></span></button>" +
      '<section class="chat" role="dialog" aria-label="' + esc(t("chat_title")) + '"' + (chat.open ? "" : " hidden") + '><header><div><b>' + t("chat_title") + "</b><small>" + (chat.mode ? t("ai_on") : t("chat_sub")) + '</small></div><button type="button" class="ib" data-act="chat-close" aria-label="' + esc(t("chat_close")) + '">' + U.ic("x", 20) + "</button></header>" +
      '<div class="chat-log" id="chat-log" aria-live="polite">' + chat.log.map(function (m) { return '<div class="msg ' + m.who + '">' + m.html + "</div>"; }).join("") + "</div>" + (chat.mode ? '<p class="chat-n">' + t("ai_note") + "</p>" : "") +
      '<form data-form="chat"><label class="sr" for="chat-in">' + t("chat_ph") + '</label><input id="chat-in" name="q" autocomplete="off" maxlength="400" placeholder="' + esc(t("chat_ph")) + '"><button type="submit" class="ib" aria-label="' + esc(t("chat_send")) + '"><span class="flip">' + U.ic("send", 18) + "</span></button></form></section>";
    var log = $("#chat-log"); if (log) log.scrollTop = log.scrollHeight;
  }
  function chatAsk(q) {
    q = (q || "").trim().slice(0, 400); if (!q || chat.busy) return;
    chat.log.push({ who: "me", html: esc(q) });
    if (!chat.mode) { chat.log.push({ who: "bot", html: quickAnswer(q) }); chatRender(false); $("#chat-in").focus(); return; }
    var msg = { who: "bot", html: '<span class="think">' + esc(t("ai_thinking")) + "</span>" }; chat.log.push(msg); chatRender(false);
    chat.turns.push({ role: "user", content: q }); chat.turns = chat.turns.slice(-12); chat.busy = true;
    var paint = function (tx) { msg.html = aiHtml(tx); var log = $("#chat-log"); if (log && log.lastElementChild) { log.lastElementChild.innerHTML = msg.html; log.scrollTop = log.scrollHeight; } };
    var p = chat.mode === "api"
      ? fetch(W.AAT_ASSISTANT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: A.state.lang, system: aiRules(), messages: chat.turns }) }).then(function (r) { if (!r.ok) throw { code: "http_" + r.status }; return r.json(); }).then(function (j) { if (!j || !j.text) throw { code: "empty" }; return String(j.text); })
      : chat.sample([{ role: "user", content: aiRules() }].concat(chat.turns), { cache: false, modelTier: "quick", onText: function (u) { paint(u.text); } }).then(function (r) { return r.text; });
    p.then(function (tx) { chat.turns.push({ role: "assistant", content: tx }); paint(tx); })
      .catch(function (e) {
        chat.turns.pop(); var code = (e && e.code) || "error";
        if (/not_granted|sampling_disabled|not_declared|capability_/.test(code)) chat.mode = null;
        msg.html = "<p>" + esc(t(code === "not_granted" ? "ai_allow" : "ai_fail")) + "</p>" + quickAnswer(q); chatRender(false);
      }).then(function () { chat.busy = false; });
  }

  /* ---------- intro (once per visit) ---------- */
  function intro() {
    if (reduce && !(A.mag && A.mag.intro)) return;
    try { if (W.sessionStorage.getItem("aat2.intro")) return; W.sessionStorage.setItem("aat2.intro", "1"); } catch (e) { return; }
    var el = doc.createElement("div"); el.id = "intro"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div>' + (A.mag && A.mag.logoHTML ? '<span class="in-logo">' + A.mag.logoHTML(0, true) + "</span>" : '<img src="' + A.img("logo.png") + '" alt="">') + '<p class="in-n"><b>0</b><span>' + esc(t("yrs_word")) + '</span></p><p class="in-s">' + esc(t("yrs_since")) + '</p><p class="in-t">' + esc(t("h82_first")) + '</p></div><button type="button">' + esc(t("intro_skip")) + "</button>";
    doc.body.appendChild(el); root.classList.add("intro-on");
    var b = $("b", el), s = performance.now(), to = A.D.magazine.years, ended = false;
    function done() { if (ended) return; ended = true; el.classList.add("out"); setTimeout(function () { root.classList.remove("intro-on"); }, 350); setTimeout(function () { el.remove(); }, 800); }
    $("button", el).addEventListener("click", done);
    if (A.mag && A.mag.intro && A.mag.intro(el, done)) return;
    (function step(now) { var p = Math.min((now - s) / 900, 1); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else setTimeout(done, 550); })(s);
  }

  /* ---------- events ---------- */
  function bind() {
    doc.addEventListener("click", function (e) {
      var tg = e.target, a = tg.closest && tg.closest("[data-act]");
      if (!(tg.closest && tg.closest(".lang"))) { var lm = $(".lang-m"); if (lm && !lm.hidden) { lm.hidden = true; $("[data-act=lang-open]").setAttribute("aria-expanded", "false"); } }
      if (!(tg.closest && tg.closest(".hs, .hsp, .hsl"))) hsClose();
      if (!a) return;
      var act = a.getAttribute("data-act");
      if (act === "skip") { e.preventDefault(); var h1s = $("h1", app) || app; h1s.setAttribute("tabindex", "-1"); h1s.focus(); }
      else if (act === "theme") { var th = root.getAttribute("data-theme") === "dark" ? "light" : "dark"; applyTheme(th); A.store.set("theme", th); applyLook(); }
      else if (act === "lang-open") { var m = $(".lang-m"); m.hidden = !m.hidden; a.setAttribute("aria-expanded", String(!m.hidden)); }
      else if (act === "lang") { A.setLang(a.getAttribute("data-lang")); A.store.set("lang", A.state.lang); chrome(); render(true); }
      else if (act === "menu") { var mn = $("#mnav"); mn.hidden = !mn.hidden; a.setAttribute("aria-expanded", String(!mn.hidden)); }
      else if (act === "sl") sliderGo(+a.getAttribute("data-i"));
      else if (act === "fb") { e.stopPropagation(); fbGo(+a.getAttribute("data-d")); }
      else if (act === "hs") { e.stopPropagation(); hsOpen(+a.getAttribute("data-k")); }
      else if (act === "zoom") zoomOpen(a.getAttribute("src"), a.getAttribute("alt"));
      else if (act === "cat") { var list = $("#pr-list"); list.setAttribute("data-cat", a.getAttribute("data-cat")); $$("[data-act=cat]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === a)); }); list.innerHTML = V.productList($("#pr-q").value.trim(), a.getAttribute("data-cat")); $$(".rv", list).forEach(function (x) { x.classList.add("in"); }); }
      else if (act === "copy") { var txt = a.getAttribute("data-copy"), orig = a.textContent; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { a.textContent = t("copied"); setTimeout(function () { a.textContent = orig; }, 1600); }).catch(function () { a.textContent = txt; }); }
      else if (act === "chat-open") { chat.open = true; chatRender(false); $("#chat-in").focus(); }
      else if (act === "chat-close") { chat.open = false; chatRender(false); $(".chat-b").focus(); }
    });
    doc.addEventListener("submit", function (e) {
      var f = e.target, kind = f.getAttribute && f.getAttribute("data-form"); if (!kind) return; e.preventDefault();
      if (kind === "newsletter") newsletterSubmit(f);
      if (kind === "chat") { var q = f.elements.q.value; f.elements.q.value = ""; chatAsk(q); }
    });
    doc.addEventListener("input", function (e) {
      var id = e.target.id;
      if (id === "pr-q") { var list = $("#pr-list"); list.innerHTML = V.productList(e.target.value.trim(), list.getAttribute("data-cat")); $$(".rv", list).forEach(function (x) { x.classList.add("in"); }); }
      if (id === "co-q") { var q = e.target.value.trim().toLowerCase(), shown = 0; $$("#co-list .cc").forEach(function (c) { var ok = !q || c.textContent.toLowerCase().indexOf(q) > -1; c.hidden = !ok; if (ok) shown++; }); $("#co-none").hidden = shown > 0; }
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { var z = $(".zm"); if (z) z.remove(); else if ($(".hsp")) hsClose(); else if (chat.open) { chat.open = false; chatRender(false); } else closeMenus(); }
      if (fb && !/INPUT|TEXTAREA/.test(e.target.tagName)) { if (e.key === "ArrowLeft") fbGo(1); if (e.key === "ArrowRight") fbGo(-1); }
    });
    doc.addEventListener("pointerover", function (e) { var a = e.target.closest && e.target.closest(".hd-nav a"); if (a) navPlace(a); });
    doc.addEventListener("pointerout", function (e) { if (e.target.closest && e.target.closest(".hd-nav") && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".hd-nav"))) navPlace($(".hd-nav a[aria-current=page]")); });
    W.addEventListener("hashchange", function () { render(false); });
    var rt; W.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { navSync(); if (fb) { var s = W.innerWidth < 760; if (s !== fb.single) { fb.single = s; fbShow(); } } }, 150); });
  }

  W.AAT.app = { render: function () { chrome(); render(true); }, route: function () { return route; }, applyTheme: applyTheme };
  function start() {
    hdr = $("#hdr"); app = $("#app"); ftr = $("#ftr");
    initPrefs(); chrome(); render(true); bind(); headerScroll(); aiInit(); intro();
    root.classList.add("js");
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start); else start();
})(window);
