  function brandSlide(x, o) {
    o = o || {}; var b = BR[x.page] || { a: col(x), b: "#1f2937", on: "#fff" }, lg = logo(x), ps = prods(x), ln = lines(x), ar = A.state.lang === "ar";
    var lay = b.dk ? 2 : [0, 1, 3, 4, 1, 0, 4, 3][x.page % 8];
    var head = (!ar && b.h) || L(x.tagline) || b.h || x.company, slo = (b.s || []).concat(b.s ? [] : ln.slice(0, 4));
    function tr(en, a2) { return ar ? a2 : en; }
    function au(s, tag, c2) { return "<" + tag + (c2 ? ' class="' + c2 + '"' : "") + ' dir="auto">' + esc(s) + "</" + tag + ">"; }
    /* what kind of line is this: phone, fax, email, address, founding year, opening hours */
    function kindOf(s) {
      if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return "em";
      if (/\d{3}/.test(s) && /(tel|phone|mobile|fax|whatsapp|line id)/i.test(s)) return /fax/i.test(s) ? "fx" : "tl";
      if (/^(founded|established|since)\b/i.test(s)) return "yr";
      if (/^(mon|tue|office hours|opening|hours)\b/i.test(s)) return "hr";
      if (s.length > 22 && /\d/.test(s) && /(rd\.|road|st\.|street|dist|city|taiwan|no\.\s?\d|sec\.|town|jalan|malaysia|china|syria|hsien|\dF,)/i.test(s)) return "ad";
      return "";
    }
    /* the advertiser's own menu, folded into at most five pages: about, products, applications, news, contact */
    function group(m) { if (m.k === "a" || m.k === "p" || m.k === "c") return m.k; if (/news|event|insight|edm|exhibition/i.test(m.n)) return "n"; if (/applic|solution|equipment|custom|portfolio|service|industr/i.test(m.n)) return "x"; return ""; }
    var G = {}, order = [];
    (b.m || []).forEach(function (m) { var g = group(m), it = m.i || []; if (!g || (!m.s && !it.length)) return;
      if (!G[g]) { G[g] = { k: g, n: m.n, tx: m.s || "", it: [] }; order.push(g); } it.forEach(function (s) { if (G[g].it.indexOf(s) < 0) G[g].it.push(s); }); });
    if (!G.a) { G.a = { k: "a", n: "About", tx: "", it: [] }; order.unshift("a"); }
    if (!G.p && (ps.length || ln.length)) { G.p = { k: "p", n: "Products", tx: "", it: [] }; order.splice(1, 0, "p"); }
    if (!G.c && (x.tel || x.email || web(x))) { G.c = { k: "c", n: "Contact", tx: "", it: [] }; order.push("c"); }
    var NAME = { a: "من نحن", p: "المنتجات", x: "التطبيقات", n: "الأخبار", c: "تواصل معنا" };
    var tabs = order.map(function (g) { var tb = G[g]; if (ar) tb.n = NAME[g]; return tb; });
    var all = []; tabs.forEach(function (tb) { tb.it.forEach(function (s) { all.push(s); }); });
    var yr = (all.concat([b.h || "", G.a.tx, L(x.about), x.company]).join(" · ").match(/(?:founded|established|since|est\.)\D{0,14}((?:19|20)\d{2})/i) || [])[1];
    function pick(k) { var seen = {}, out = []; all.forEach(function (s) { if (kindOf(s) === k && !seen[s]) { seen[s] = 1; out.push(s); } }); return out; }
    var addr = x.address || pick("ad")[0] || "";
    function kick(s) { return '<span class="mz-kick">' + esc(s) + "</span>"; }
    function pcard(p, big) { return '<span class="mz-bp' + (big ? " mz-big" : "") + '"><img src="' + img(p.img) + '" alt="" loading="lazy"><b dir="auto">' + esc(clip(p.n, 40)) + "</b>" + (big && L(p.d) ? "<small dir=\"auto\">" + esc(clip(L(p.d), 90)) + "</small>" : "") + "</span>"; }
    function grid(n) { return ps.length ? '<div class="mz-bgrid">' + ps.slice(0, n).map(function (p) { return pcard(p); }).join("") + "</div>" : '<div class="mz-bch mz-bnum">' + ln.map(function (n2, j) { return "<span><em>" + (j < 9 ? "0" : "") + (j + 1) + "</em>" + esc(clip(n2, 34)) + "</span>"; }).join("") + "</div>"; }
    function stat(v, l) { return v ? '<div class="mz-st"><b dir="ltr">' + esc(v) + "</b><small>" + esc(l) + "</small></div>" : ""; }
    /* About: the story on one side, the facts on the other */
    function pA(tb) {
      var feats = tb.it.filter(function (s) { return !kindOf(s) && s !== x.company; }), yrs = yr ? new Date().getFullYear() - (+yr) : 0;
      return '<div class="mz-pg mz-pa"><div class="mz-pa-main">' + kick(tr("About the company", "عن الشركة")) + au(x.company, "h4") + au(L(x.about) || tb.tx, "p", "mz-lead") + (!ar && tb.tx && L(x.about) ? au(tb.tx, "p") : "") +
        (feats.length ? '<ul class="mz-feat">' + feats.slice(0, 10).map(function (s) { return au(s, "li"); }).join("") + "</ul>" : "") +
        (ps.length ? '<div class="mz-pa-strip">' + ps.slice(0, 4).map(function (p) { return '<img src="' + img(p.img) + '" alt="" loading="lazy">'; }).join("") + "</div>" : "") + "</div>" +
        '<aside class="mz-pa-side">' + (lg ? '<span class="mz-pa-lg"><img src="' + lg + '" alt=""></span>' : "") + '<div class="mz-sts">' + stat(yr, tr("Founded", "سنة التأسيس")) + stat(yrs > 0 ? yrs + "+" : "", tr("Years of experience", "عامًا من الخبرة")) + stat(ps.length || ln.length || "", tr("Products in this issue", "منتجًا في هذا العدد")) + stat(x.certs ? String(x.certs).split(/\s*[·,]\s*/)[0] : "", tr("Certified", "شهادة الجودة")) + "</div>" +
        '<dl class="mz-facts">' + (L(x.city) ? "<dt>" + tr("Location", "الموقع") + "</dt>" + au(L(x.city), "dd") : "") + (addr ? "<dt>" + tr("Address", "العنوان") + "</dt>" + au(addr, "dd") : "") + (x.certs ? "<dt>" + tr("Certificates", "الشهادات") + "</dt>" + au(x.certs, "dd") : "") + (catName(x.cat) ? "<dt>" + tr("Industry", "القطاع") + "</dt><dd>" + esc(catName(x.cat)) + "</dd>" : "") + "</dl></aside></div>";
    }
    /* Products: a catalogue, the range listed beside large product cards */
    function pP(tb) {
      var range = tb.it.length ? tb.it : ln;
      return '<div class="mz-pg mz-pp"><aside class="mz-pp-cat">' + kick(tr("Product range", "مجموعة المنتجات")) + (tb.tx && !ar ? au(tb.tx, "p") : "") + "<ol>" + range.slice(0, 12).map(function (s) { return au(clip(s, 48), "li"); }).join("") + "</ol></aside>" +
        '<div class="mz-pp-grid' + (ps.length ? "" : " mz-none") + '">' + (ps.length ? ps.slice(0, 8).map(function (p) { return pcard(p, 1); }).join("") : range.slice(0, 8).map(function (s, j) { return '<span class="mz-tile"><em>' + (j < 9 ? "0" : "") + (j + 1) + "</em>" + au(clip(s, 60), "b") + "</span>"; }).join("")) + "</div></div>";
    }
    /* Applications: numbered tiles, where the products are used */
    function pX(tb) {
      return '<div class="mz-pg mz-px"><header>' + kick(tr("Where it is used", "مجالات الاستخدام")) + au(tb.n, "h4") + (tb.tx && !ar ? au(tb.tx, "p") : au(L(x.about), "p")) + '</header><div class="mz-px-grid">' + tb.it.slice(0, 12).map(function (s, j) { return '<span class="mz-tile"><em>' + (j < 9 ? "0" : "") + (j + 1) + "</em>" + au(clip(s, 60), "b") + "</span>"; }).join("") + "</div>" +
        (ps.length ? '<div class="mz-px-strip">' + ps.slice(0, 5).map(function (p) { return pcard(p); }).join("") + "</div>" : "") + "</div>";
    }
    /* News: the newest story large, the rest as a dated list */
    function pN(tb) {
      var it = tb.it.map(function (s) { var m = s.match(/^(.*?)\s*\(([^)]*\d{4}[^)]*)\)\s*$/) || s.match(/^(.*?(?:19|20)\d{2})?,\s*(.*\d{4}.*)$/); if (m && m[1]) return { h: m[1], d: m[2] }; var y = s.match(/(?:19|20)\d{2}/); return { h: s, d: y ? y[0] : "" }; });
      if (!it.length) return '<div class="mz-pg mz-pn"><article class="mz-pn-top">' + kick(tr("News", "الأخبار")) + au(tb.tx, "h4") + "</article></div>";
      return '<div class="mz-pg mz-pn"><article class="mz-pn-top">' + kick(tr("Latest news", "آخر الأخبار")) + (it[0].d ? '<em dir="ltr">' + esc(it[0].d) + "</em>" : "") + au(it[0].h, "h4") + (tb.tx && !ar ? au(tb.tx, "p") : "") + (lg ? '<span class="mz-pa-lg"><img src="' + lg + '" alt=""></span>' : "") + "</article>" +
        '<ol class="mz-pn-list">' + it.slice(1, 8).map(function (n2) { return "<li>" + (n2.d ? '<em dir="ltr">' + esc(n2.d) + "</em>" : "<em>—</em>") + au(n2.h, "b") + "</li>"; }).join("") + "</ol></div>";
    }
    /* Contact: the address card beside one-tap ways to reach the company */
    function pC(tb) {
      var seen = {}, rows = [];
      function row(l, v, href) { var key = String(v).replace(/\D/g, "") || v; if (!v || seen[key]) return; seen[key] = 1; rows.push("<" + (href ? 'a href="' + esc(href) + '"' : "div") + "><small>" + esc(l) + '</small><b dir="ltr">' + esc(v) + "</b></" + (href ? "a" : "div") + ">"); }
      if (x.tel) row(tr("Phone", "الهاتف"), x.tel, "tel:" + String(x.tel).replace(/[^+\d]/g, ""));
      pick("tl").forEach(function (s) { var v = s.replace(/^[^+\d(]*/, ""), l = s.slice(0, s.length - v.length).trim() || "Tel"; row(l, v, /whatsapp/i.test(s) ? "https://wa.me/" + v.replace(/\D/g, "") : "tel:" + v.replace(/[^+\d]/g, "")); });
      pick("fx").forEach(function (s) { row(tr("Fax", "الفاكس"), s.replace(/^[^+\d(]*/, "")); });
      if (x.email) row(tr("Email", "البريد الإلكتروني"), x.email, "mailto:" + x.email);
      pick("em").forEach(function (s) { row(tr("Email", "البريد الإلكتروني"), s, "mailto:" + s); });
      if (web(x)) row(tr("Website", "الموقع الإلكتروني"), String(web(x)).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), web(x));
      var hrs = pick("hr")[0];
      return '<div class="mz-pg mz-pc"><div class="mz-pc-card">' + (lg ? '<span class="mz-pa-lg"><img src="' + lg + '" alt=""></span>' : "") + kick(tr("Get in touch", "تواصل مع الشركة")) + au(x.company, "h4") + (addr ? au(addr, "p") : "") + (L(x.city) && !addr ? au(L(x.city), "p") : "") + (hrs ? au(hrs, "p", "mz-hrs") : "") + cta(x, "mz-sm") + "</div>" +
        '<div class="mz-pc-act">' + rows.slice(0, 8).join("") + "</div></div>";
    }
    var PANE = { a: pA, p: pP, x: pX, n: pN, c: pC };
    return '<section class="mz-slide mz-bs mz-L' + lay + (o.wall ? " mz-bw" : "") + '" data-w="' + esc(web(x) || "") + '" style="--a:' + b.a + ";--b:" + b.b + ";--on:" + b.on + ";--f:" + (FONTS[x.cat] || "'Archivo'") + '">' +
      '<nav class="mz-bnav"><button type="button" class="mz-blg" data-mz="bt" data-t="-1" aria-label="' + esc(x.company) + '">' + (lg ? '<img src="' + lg + '" alt="">' : "<b>" + esc(clip(x.company, 18)) + "</b>") + '</button><div dir="' + A.dir() + '">' + tabs.map(function (tb, j) { return '<button type="button" data-mz="bt" data-t="' + j + '">' + esc(tb.n) + "</button>"; }).join("") + "</div>" + (o.x || "") + "</nav>" +
      '<div class="mz-bbody"><div class="mz-bpane on" data-p="-1"><div class="mz-bhero"><i class="mz-bpat" aria-hidden="true"></i><div class="mz-btx">' + (head !== x.company ? au(x.company, "small") : "") + au(head, "h3") + au(clip(L(x.about), 150), "p") + '</div><div class="mz-bwin">' + (ps.length ? media(x) : '<span class="mz-bset">' + ln.slice(0, 4).map(function (n2) { return "<i>" + esc(clip(n2, 22)) + "</i>"; }).join("") + "</span>") + "</div></div>" +
      (slo.length ? '<div class="mz-btick" dir="ltr"><div>' + slo.concat(slo, slo, slo).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div></div>" : "") + '<div class="mz-bsec mz-bhome">' + grid(6) + '<div class="mz-bhf">' + stat(yr, tr("Founded", "سنة التأسيس")) + stat(L(x.city), tr("Location", "الموقع")) + stat(x.certs, tr("Certificates", "الشهادات")) + stat(catName(x.cat), tr("Industry", "القطاع")) + "</div></div></div>" +
      tabs.map(function (tb, j) { return '<div class="mz-bpane mz-k' + tb.k + '" data-p="' + j + '">' + PANE[tb.k](tb) + "</div>"; }).join("") + "</div>" +
      '<footer class="mz-bft">' + (o.pre || "") + cta(x, "mz-sm") + '<a class="mz-bmore" href="' + hrefCo(x) + '">' + t("details") + "</a>" + (o.post || "") + "</footer></section>";
  }
