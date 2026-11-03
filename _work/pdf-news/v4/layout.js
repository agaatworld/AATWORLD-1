/* Lays out the Arabic articles, Arabic news and English news on A4 pages in the style of the July 2026 issue.
   Every page: red top bar, faint AAT logo, two columns, the red footer line, an EMPTY page-number box.
   Articles: picture on one half, title (+ start of the text) on the other; the text continues in two columns.
   Space left at the end of an article is filled with whole news items under the red "أخبار NEWS" ribbon;
   whatever space is still left is shared out by opening the line spacing a little (vertical justification). */
window.addEventListener('load', function () {
  /* load every font face (Arabic, Latin, digits, ـ) BEFORE measuring, or late fonts re-flow the finished pages */
  var T = 'اب ـ Aa 1 2 «» % ، ؟ — é', F = ['700 18px "Noto Naskh Arabic"', '800 20px "Noto Kufi Arabic"', '700 18px Arimo', '700 18px Tinos', '800 20px "Roboto Condensed"'];
  Promise.all(F.map(function (f) { return document.fonts.load(f, T); })).then(function () { return document.fonts.ready; }).then(function () {
  var D = window.D, book = document.getElementById('book'), count = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function iso(t, ar) {
    t = String(t); if (!ar) return esc(t);
    var re = /[A-Za-z+][A-Za-z0-9 .,&'’()\/+:@_-]*[A-Za-z0-9).]/g, out = '', last = 0, m;
    while ((m = re.exec(t))) { out += esc(t.slice(last, m.index)) + '<bdi dir="ltr" class="lt">' + esc(m[0]) + '</bdi>'; last = re.lastIndex; }
    return out + esc(t.slice(last));
  }
  function node(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; }
  function newPage(lang) {
    count++; var pg = document.createElement('section');
    pg.className = 'pg ' + lang + (count % 2 ? ' odd' : ' even'); pg.lang = lang;
    pg.innerHTML = '<div class="bar"></div><img class="wm" src="' + D.logo + '" alt=""><div class="body"></div>' +
      '<div class="ft">عند التواصل مع المعلنين بالمجلة.. ننصحكم بذكر: مجلة التجارة العربية الآسيوية</div>' +
      '<div class="fb"><i class="st"></i><span class="ur">www.aatworld.com</span><i class="no"></i></div>';
    book.appendChild(pg); return pg;
  }
  function fits(pg) {
    var b = pg.querySelector('.body'), br = b.getBoundingClientRect();
    for (var i = 0; i < b.children.length; i++) {
      var rs = b.children[i].getClientRects();
      for (var j = 0; j < rs.length; j++) { var r = rs[j]; if (!r.height) continue; if (r.left < br.left - 1 || r.right > br.right + 1 || r.bottom > br.bottom + 1) { window.WHY = 'rect ' + b.children[i].className + ' ' + Math.round(r.left - br.left) + ' ' + Math.round(r.bottom - br.bottom); return false; } }
    }
    var fr = pg.querySelectorAll('.hd .fr');
    for (var k = 0; k < fr.length; k++) if (fr[k].scrollHeight > fr[k].clientHeight + 1) { window.WHY = 'frame ' + fr[k].scrollHeight + '>' + fr[k].clientHeight; return false; }
    var tt = pg.querySelectorAll('.hd .tt');
    for (var q = 0; q < tt.length; q++) if (tt[q].scrollHeight > tt[q].clientHeight + 1) { window.WHY = 'tt ' + tt[q].scrollHeight + '>' + tt[q].clientHeight; return false; }
    return true;
  }
  function para(t, ar, end) {
    if (t.indexOf('## ') === 0) return '<h3>' + iso(t.slice(3), ar) + '</h3>';
    if (/^بقلم/.test(t)) return '<p class="by">' + iso(t, ar) + '</p>';
    return '<p' + (end ? ' class="endp"' : '') + '>' + iso(t, ar) + '</p>';
  }
  /* split the paragraph html so that as many words as possible stay in the container */
  function splitInto(container, okfn, html) {
    var b = node(html); if (b.tagName !== 'P') return null;
    var cls = b.className, ar = /[\u0600-\u06FF]/.test(b.textContent), words = b.textContent.split(' '), lo = 0, hi = words.length - 4;
    function mk(n, c) { return node('<p class="' + c + '">' + iso(words.slice(0, n).join(' '), ar) + '</p>'); }
    while (lo < hi) { var mid = (lo + hi + 1) >> 1, t = mk(mid, cls.replace('endp', '')); container.appendChild(t); var ok = okfn(); container.removeChild(t); if (ok) lo = mid; else hi = mid - 1; }
    if (lo < 5) return null;
    container.appendChild(mk(lo, cls.replace('endp', '') + ' sp'));
    return '<p class="' + cls + '">' + iso(words.slice(lo).join(' '), ar) + '</p>';
  }
  /* head: title half + picture half; the title half's free space takes the first paragraphs */
  function picH(img, w, h, nat) {
    var whole = Math.abs(nat - h) < 2;
    return '<div class="pic' + (whole ? '' : ' fx') + '" style="height:' + Math.round(h) + 'px">' + (whole ? '' : '<i style="background-image:url(\'' + esc(img) + '\')"></i>') + '<img src="' + esc(img) + '" alt="" style="' + (whole ? '' : 'object-fit:contain;position:relative;z-index:1') + '"></div>';
  }
  /* v (news): 0 = title + text beside a half-width picture; 1 = title across, picture one column wide at the top of the text;
     2 = title across, picture one column wide after the first paragraph. Articles: wide pictures alternate with a banner across the page. */
  function head(pg, it, big, ar, blocks, v) {
    var cw = (714 - 26) / 2, r = it.ratio || 1.5, wide = !!it.titleInImg;
    if (!big && !it.nopic && v) {
      var ch = Math.max(150, Math.min(300, cw / r)), fig = '<figure class="cf" data-r="' + r + '">' + picH(it.img, cw, ch, cw / r) + '</figure>';
      var e2 = node('<div class="hd wide nopic vcol"><h2>' + iso(it.title, ar) + '</h2></div>'); pg.querySelector('.body').appendChild(e2);
      var at = v === 2 && blocks.length > 1 && blocks[0].indexOf('<p') === 0 ? 1 : 0; blocks.splice(at, 0, fig);
      return e2;
    }
    if (big && !wide && it.banner) {
      var bh = Math.max(230, Math.min(360, 714 / r));
      var e3 = node('<div class="hd wide banner">' + picH(it.img, 714, bh, 714 / r) + '<h1>' + iso(it.title, ar) + '</h1></div>'); pg.querySelector('.body').appendChild(e3);
      e3.setAttribute('data-r', r); return e3;
    }
    var w = wide ? 714 : cw, nat = w / r, minH = big ? (wide ? 200 : 250) : 150, maxH = big ? (wide ? 330 : 400) : 270;
    var h = Math.max(minH, Math.min(maxH, nat)), whole = Math.abs(nat - h) < 2;
    var pic = '<div class="pic' + (whole ? '' : ' fx') + '" style="height:' + Math.round(h) + 'px">' + (whole ? '' : '<i style="background-image:url(\'' + esc(it.img) + '\')"></i>') + '<img src="' + esc(it.img) + '" alt="" style="' + (whole ? '' : 'object-fit:contain;position:relative;z-index:1') + '"></div>';
    var T = big ? 'h1' : 'h2', el;
    if (it.nopic) { el = node('<div class="hd wide nopic"><' + T + '>' + iso(it.title, ar) + '</' + T + '></div>'); pg.querySelector('.body').appendChild(el); return el; }
    if (wide) el = node('<div class="hd wide">' + pic + '</div>');
    else el = node('<div class="hd"><div class="tt" style="height:' + Math.round(h) + 'px"><' + T + '>' + iso(it.title, ar) + '</' + T + '><div class="fr"></div></div>' + pic + '</div>');
    el.setAttribute('data-r', r); el.setAttribute('data-img', it.img); if (!big) el.classList.add('news');
    pg.querySelector('.body').appendChild(el);
    if (!wide) {   /* long title: smaller until it leaves room for at least three lines of text */
      var hh = el.querySelector(T), px = parseFloat(getComputedStyle(hh).fontSize);
      while (hh.offsetHeight > h - 90 && px > 20) { px -= 1; hh.style.fontSize = px + 'px'; }
      var fr = el.querySelector('.fr'), ok = function () { return fr.scrollHeight <= fr.clientHeight + 1; };
      while (blocks.length && blocks[0].indexOf('<h3') !== 0) {
        var b = node(blocks[0]); fr.appendChild(b);
        if (ok()) { blocks.shift(); continue; }
        fr.removeChild(b); var rest = splitInto(fr, ok, blocks[0]); if (rest) blocks[0] = rest; break;
      }
    }
    return el;
  }
  function ribbon() { var s = ''; for (var i = 0; i < 14; i++) s += '<span><b>أخبار</b>NEWS</span>'; return '<div class="rb">' + s + '</div>'; }
  /* pour the blocks; at the page end split a paragraph; returns the page where the text ended */
  function pour(pg, blocks, lang) {
    var body = pg.querySelector('.body');
    while (blocks.length) {
      var b = node(blocks[0]); body.appendChild(b);
      if (fits(pg)) { blocks.shift(); continue; }
      body.removeChild(b);
      if (blocks[0].indexOf('<figure') === 0 && blocks.length > 1 && blocks[1].indexOf('<p') === 0) { var f0 = blocks.shift(); blocks.splice(1, 0, f0); continue; }
      var rest = splitInto(body, function () { return fits(pg); }, blocks[0]);
      if (rest) blocks[0] = rest;
      else if (body.lastElementChild && body.lastElementChild.tagName === 'H3') { blocks.unshift(body.lastElementChild.outerHTML); body.removeChild(body.lastElementChild); }
      pg = newPage(lang); body = pg.querySelector('.body');
    }
    return pg;
  }
  function itemBlocks(n, ar) { return n.body.map(function (p, j) { return para(p, ar, j === n.body.length - 1); }); }
  /* put a whole news item on the page if it fits; otherwise leave the page as it was */
  function hole(pg) {   /* a column picture pushed into the next column must not leave the column before it half empty */
    var b = pg.querySelector('.body'), br = b.getBoundingClientRect(), figs = b.querySelectorAll('figure.cf');
    for (var i = 0; i < figs.length; i++) {
      var f = figs[i], fr = f.getBoundingClientRect(), prev = f.previousElementSibling; if (!prev || f.classList.contains('span')) continue;
      var rs = prev.getClientRects(), lr = rs[rs.length - 1]; if (!lr || Math.abs(lr.right - fr.right) < 20) continue;
      var segB = br.bottom, nx = f.nextElementSibling;
      while (nx) { var cs = getComputedStyle(nx).columnSpan; if (cs === 'all') { segB = nx.getBoundingClientRect().top; break; } nx = nx.nextElementSibling; }
      if (segB - lr.bottom > 45) return true;
    }
    return false;
  }
  /* white space left on a page with column pictures: the pictures grow (never past their own shape), then one may go across both columns */
  function growFig(pg) {
    var figs = [].slice.call(pg.querySelectorAll('.body figure.cf')); if (!figs.length) return;
    figs.forEach(function (f) {
      if (gapOf(pg) < 25) return;
      var pc = f.querySelector('.pic'), img = f.querySelector('img').getAttribute('src'), r = +f.getAttribute('data-r'), cw = f.getBoundingClientRect().width;
      var cur = pc.offsetHeight, nat = cw / r, top = Math.max(cur, Math.min(nat, 520));
      function setH(h) { f.innerHTML = picH(img, cw, h, nat); }
      var lo = cur, hi = top; setH(hi);
      if (!(fits(pg) && !hole(pg))) { for (var k = 0; k < 9; k++) { var m = (lo + hi) / 2; setH(m); if (fits(pg) && !hole(pg)) lo = m; else hi = m; } setH(lo); }
    });
    if (gapOf(pg) < 120) return;
    var f = figs[figs.length - 1], keep = f.outerHTML, img = f.querySelector('img').getAttribute('src'), r = +f.getAttribute('data-r'), nat = 714 / r;
    f.classList.add('span');
    function setW(h) { f.innerHTML = picH(img, 714, h, nat); }
    var lo = Math.min(200, nat), hi = Math.min(nat, 430); setW(lo);
    if (!fits(pg)) { var o = node(keep); f.parentNode.replaceChild(o, f); return; }
    setW(hi); if (!fits(pg)) { for (var k = 0; k < 9; k++) { var m = (lo + hi) / 2; setW(m); if (fits(pg)) lo = m; else hi = m; } setW(lo); }
  }
  var vN = 0;
  function tryItem(pg, n, ar, withRibbon, nopic) {
    var body = pg.querySelector('.body'), mark = body.children.length;
    var pref = n.ratio < 1.05 ? [1, 2, 0] : [[0, 1, 2], [2, 0, 1], [1, 2, 0]][vN % 3], vs = nopic ? [0] : pref;
    for (var t = 0; t < vs.length; t++) {
      if (withRibbon) body.appendChild(node(ribbon()));
      var bl = itemBlocks(n, ar); head(pg, nopic ? Object.assign({}, n, { nopic: true }) : n, false, ar, bl, vs[t]);
      bl.forEach(function (h) { body.appendChild(node(h)); });
      if (fits(pg) && !hole(pg)) { vN++; return true; }
      while (body.children.length > mark) body.removeChild(body.lastElementChild);
    }
    return false;
  }
  function fillWith(pg, pool, ar, ribbonFirst) {
    var placed = 0, again = true;
    while (again && pool.length) {
      again = false;
      var order = pool.slice().sort(function (a, b) { return b.len - a.len; });
      for (var v = 0; v < 2 && !again; v++)
        for (var i = 0; i < order.length; i++) {
          if (tryItem(pg, order[i], ar, pg.querySelector('.body').children.length > 0, v === 1)) { pool.splice(pool.indexOf(order[i]), 1); placed++; again = true; break; }
        }
    }
    return placed;
  }
  /* vertical justification: open the line spacing (and then paragraph spacing) until the page is full */
  function gapOf(pg) {
    var b = pg.querySelector('.body'), br = b.getBoundingClientRect(), m = br.top;
    [].forEach.call(b.children, function (c) { [].forEach.call(c.getClientRects(), function (r) { if (r.height) m = Math.max(m, r.bottom); }); });
    return br.bottom - m;
  }
  /* a big space left on the page: the last news picture goes across the full width, as large as the space allows (never cut) */
  function widen(pg) {
    var hs = pg.querySelectorAll('.body > .hd.news:not(.wide)'); if (!hs.length) return;
    var hd = hs[hs.length - 1], r = +hd.getAttribute('data-r') || 1.5, img = hd.getAttribute('data-img');
    var keep = hd.innerHTML, t = hd.querySelector('h2'), fr = hd.querySelector('.fr'), moved = [].slice.call(fr.children);
    var nat = 714 / r, pic = hd.querySelector('.pic');
    hd.className = 'hd wide news'; hd.innerHTML = ''; hd.appendChild(pic); pic.className = 'pic'; pic.innerHTML = '<img src="' + img + '" alt="">'; hd.appendChild(t);
    var after = hd.nextSibling; moved.forEach(function (m) { hd.parentNode.insertBefore(m, after); });
    function setH(h) { var whole = h >= nat - 1; pic.style.height = Math.round(h) + 'px'; pic.className = 'pic' + (whole ? '' : ' fx'); pic.innerHTML = (whole ? '' : '<i style="background-image:url(\'' + img + '\')"></i>') + '<img src="' + img + '" alt=""' + (whole ? '' : ' style="object-fit:contain;position:relative;z-index:1"') + '>'; }
    var lo = 180, hi = nat; setH(lo);
    if (!fits(pg)) { moved.forEach(function (m) { m.parentNode.removeChild(m); }); hd.className = 'hd news'; hd.innerHTML = keep; return; }
    setH(hi); if (!fits(pg)) { for (var i = 0; i < 9; i++) { var m = (lo + hi) / 2; setH(m); if (fits(pg)) lo = m; else hi = m; } setH(lo); }
  }
  /* space left at the end of an article and no news fits: a quote from the article across both columns, sized to the space */
  function quote(pg, art) {
    var body = pg.querySelector('.body'), kids = [].slice.call(body.children).filter(function (e) { return e.tagName === 'P' && !e.classList.contains('by'); });
    if (kids.length < 2) return;
    /* plain Arabic sentences only: no contact details, links, e-mails, Latin words or lists */
    var paras = art.body.filter(function (p) { return p.indexOf('## ') !== 0 && !/^بقلم/.test(p) && !/[A-Za-z@:]/.test(p); });
    var sents = [];
    paras.forEach(function (p) { p.split(/[.؛!؟]\s*/).forEach(function (x) { x = x.trim(); if (x.length > 230) x = x.slice(0, 200).replace(/\s+\S*$/, '').replace(/[،,]\s*[^،,]*$/, ''); if (x.length >= 45 && x.length <= 230) sents.push(x); }); });
    if (!sents.length) return;
    sents.sort(function (a, b) { return Math.abs(a.length - 120) - Math.abs(b.length - 120); });
    var q = node('<blockquote class="pq">' + iso(sents[0], true) + '</blockquote>');
    body.insertBefore(q, kids[Math.floor(kids.length / 2)]);
    var lo = 19, hi = 30; q.style.fontSize = lo + 'px';
    if (!fits(pg)) { body.removeChild(q); return; }
    q.style.fontSize = hi + 'px';
    if (!fits(pg)) { for (var i = 0; i < 7; i++) { var m = (lo + hi) / 2; q.style.fontSize = m + 'px'; if (fits(pg)) lo = m; else hi = m; } q.style.fontSize = lo + 'px'; }
  }
  function finish(pg, last, art) {
    if (!last) return;
    pg.querySelector('.body').style.columnFill = 'balance';
    growFig(pg);
    if (gapOf(pg) > 150) widen(pg);
    if (art && gapOf(pg) > 100) quote(pg, art);
    var base = pg.classList.contains('ar') ? 1.72 : 1.5, body = pg.querySelector('.body');
    function setLH(v) { body.style.lineHeight = v; pg.querySelectorAll('.hd .fr').forEach(function (f) { f.style.lineHeight = base; }); }
    var lo = base, hi = base + 0.45;
    setLH(hi); if (!fits(pg)) { for (var i = 0; i < 10; i++) { var m = (lo + hi) / 2; setLH(m); if (fits(pg)) lo = m; else hi = m; } setLH(lo); }
    var ps = 6, ph = 30; body.style.setProperty('--ps', ph + 'px');
    if (!fits(pg)) { for (var k = 0; k < 8; k++) { var mm = (ps + ph) / 2; body.style.setProperty('--ps', mm + 'px'); if (fits(pg)) ps = mm; else ph = mm; } body.style.setProperty('--ps', ps + 'px'); }
  }

  var arPool = D.arNews.slice(), enPool = D.enNews.slice();
  var wideN = 0;
  D.arts.forEach(function (a) {
    if (!a.titleInImg && a.ratio >= 1.55) a.banner = (wideN++ % 2 === 1);
    var pg = newPage('ar'), bl = a.body.map(function (p, j) { return para(p, true, j === a.body.length - 1); });
    head(pg, a, true, true, bl);
    pg = pour(pg, bl, 'ar');
    fillWith(pg, arPool, true, true);
    finish(pg, true, a);
  });
  /* news pages: whole items first; when the next item does not fit whole, it starts in the space left and runs on to the next page */
  function newsPages(pool, lang) {
    var ar = lang === 'ar'; if (!pool.length) return;
    var pg = newPage(lang);
    while (pool.length) {
      fillWith(pg, pool, ar, false);
      if (!pool.length) break;
      var body = pg.querySelector('.body'), mark = body.children.length, n = pool[0], bl = itemBlocks(n, ar);
      if (mark) body.appendChild(node(ribbon()));
      head(pg, n, false, ar, bl);
      if (!fits(pg)) { while (body.children.length > mark) body.removeChild(body.lastElementChild); finish(pg, true); pg = newPage(lang); continue; }
      pool.shift(); pg = pour(pg, bl, lang);
    }
    pullBack(pg);
    finish(pg, true);
  }
  /* a short tail (a few lines) alone on the last page: bring it back to the previous page with slightly closer lines */
  function pullBack(pg) {
    var prev = pg.previousElementSibling; if (!prev || gapOf(pg) < 760) return;
    var tail = [].slice.call(pg.querySelector('.body').children).map(function (e) { return e.outerHTML; });
    var pb = prev.querySelector('.body'), base = prev.classList.contains('ar') ? 1.72 : 1.5, mark = pb.children.length;
    for (var lh = base; lh >= base - 0.16; lh -= 0.02) {
      pb.style.lineHeight = lh; tail.forEach(function (h) { pb.appendChild(node(h)); });
      if (fits(prev)) { pg.parentNode.removeChild(pg); count--; return; }
      while (pb.children.length > mark) pb.removeChild(pb.lastElementChild);
    }
    pb.style.lineHeight = '';
  }
  newsPages(arPool, 'ar');
  newsPages(enPool, 'en');
  /* ـ (kashida) fills the justified Arabic lines instead of wide gaps between the words */
  var JOIN = 'بتثجحخسشصضطظعغفقكلمنهيئىـ', LET = /[\u0621-\u064A]/, HAR = /[\u064B-\u0652\u0670]/;
  function spots(w) {   /* places inside a word where a ـ can go, best first (near the end of the word) */
    if (HAR.test(w)) return [];
    var out = [];
    for (var i = w.length - 2; i >= 1; i--) {
      var a = w[i], b = w[i + 1];
      if (JOIN.indexOf(a) < 0 || !LET.test(b) || b === 'ء' || (a === 'ل' && 'اأإآ'.indexOf(b) >= 0)) continue;
      if (!LET.test(w[i - 1]) && i === 0) continue;
      out.push(i + 1);
    }
    return out;
  }
  function kashidaPara(p, tw, en) {
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), tn = [], t;
    while ((t = walker.nextNode())) if (!t.parentNode.closest('bdi')) tn.push(t);
    tn.forEach(function (n) {
      var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
      parts.forEach(function (x) { if (!x) return; if (/^\s+$/.test(x)) frag.appendChild(document.createTextNode(x)); else { var sp = document.createElement('span'); sp.className = 'kw'; sp.textContent = x; frag.appendChild(sp); } });
      n.parentNode.replaceChild(frag, n);
    });
    var toks = [].slice.call(p.querySelectorAll('span.kw, bdi'));
    function lines() {
      var L = [], cur = null;
      toks.forEach(function (k) { var r = k.getClientRects()[0]; if (!r) return; if (!cur || Math.abs(r.top - cur.top) > 4) { cur = { top: r.top, toks: [], l: r.left, r: r.right }; L.push(cur); } cur.toks.push(k); cur.l = Math.min(cur.l, r.left); cur.r = Math.max(cur.r, r.right); });
      return L;
    }
    p.style.textAlign = en ? 'left' : 'right'; p.style.textAlignLast = en ? 'left' : 'right';
    var L0 = lines(), W = p.getClientRects()[0].width, sig = L0.map(function (l) { return l.toks.length; }).join();
    var lastFull = p.classList.contains('sp');
    if (lastFull && L0.length) { var ll = L0[L0.length - 1]; if ((ll.r - ll.l) / W < 0.8) { p.classList.remove('sp'); lastFull = false; } }
    L0.forEach(function (l, li) {
      if (li === L0.length - 1 && !lastFull) return;
      var slack = W - (l.r - l.l);
      if (en) {   /* English: a touch of letter spacing takes most of the stretch, so the word gaps stay normal */
        var sps = l.toks.length - 1, chars = l.toks.reduce(function (a, k) { return a + k.textContent.length; }, 0), extra = slack - sps * 3.5;
        if (sps < 1 || extra <= 0) return; var ls = Math.min(1.1, extra / chars);
        l.toks.forEach(function (k) { k.style.letterSpacing = ls.toFixed(2) + 'px'; }); return;
      }
      var n = Math.floor((slack - 2) / tw); if (n < 1) return;
      var cands = l.toks.filter(function (k) { return k.tagName === 'SPAN' && spots(k.textContent).length; });
      if (!cands.length) return;
      cands.sort(function (a, b) { return b.textContent.length - a.textContent.length; });
      var add = cands.map(function () { return 0; }), cap = 3, given = 0;
      while (given < n) { var any = false; for (var c = 0; c < cands.length && given < n; c++) if (add[c] < cap) { add[c]++; given++; any = true; } if (!any) break; }
      cands.forEach(function (k, c) { if (!add[c]) return; var w = k.textContent, sp = spots(w), out = w; 
        var use = sp.slice(0, 1), each = {}; for (var z = 0; z < add[c]; z++) { var at = use[z % use.length]; each[at] = (each[at] || 0) + 1; }
        Object.keys(each).map(Number).sort(function (a, b) { return b - a; }).forEach(function (at) { out = out.slice(0, at) + Array(each[at] + 1).join('ـ') + out.slice(at); });
        k.textContent = out; });
    });
    /* a line that grew too long would re-flow the paragraph: take ـ out again until the lines are as before */
    for (var guard = 0; guard < 40; guard++) {
      var L1 = lines(), s1 = L1.map(function (l) { return l.toks.length; }).join(); if (s1 === sig) break;
      var bad = null; for (var q = 0; q < L1.length; q++) if (!L0[q] || L1[q].toks.length !== L0[q].toks.length) { bad = L0[q] || L0[L0.length - 1]; break; }
      var done = false;
      if (en) { bad.toks.forEach(function (k) { var v = parseFloat(k.style.letterSpacing) || 0; if (v > 0) { k.style.letterSpacing = Math.max(0, v - 0.15).toFixed(2) + 'px'; done = true; } }); }
      else bad.toks.slice().reverse().forEach(function (k) { if (!done && k.tagName === 'SPAN' && k.textContent.indexOf('ـ') >= 0) { k.textContent = k.textContent.replace('ـ', ''); done = true; } });
      if (!done) break;
    }
    p.style.textAlign = ''; p.style.textAlignLast = '';
    return lines().map(function (l) { return l.toks.length; }).join() === sig;
  }
  if (!/nok/.test(location.search)) [].forEach.call(document.querySelectorAll('.pg'), function (pg) {
    var en = pg.classList.contains('en');
    var ps = [].slice.call(pg.querySelectorAll('.body p:not(.by), .hd .fr p')), keep = ps.map(function (p) { return p.innerHTML; });
    if (!ps.length) return;
    var m = document.createElement('span'); m.textContent = 'ــــــــــ'; ps[0].appendChild(m); var tw = m.getBoundingClientRect().width / 10; ps[0].removeChild(m);
    var ok0 = fits(pg);
    ps.forEach(function (p, i) { if (!kashidaPara(p, tw, en)) p.innerHTML = keep[i]; });
    for (var i = ps.length - 1; i >= 0 && ok0 && !fits(pg); i--) ps[i].innerHTML = keep[i];
  });
  document.body.setAttribute('data-pages', count);
}); });
