/* Lays the Arabic articles and news out on the magazine's own page templates (issue 560), following magazine rules:
   - each article's opening is chosen from its picture's shape, so the picture fills the width and is never cut:
     tall/square -> L-split (picture beside the red title box), normal -> L-feature (big picture on top), wide -> L-band (strip)
   - a picture that would need cropping is shown whole over a blurred copy of itself (no empty bars)
   - long titles shrink to fit; the writer's line ("بقلم") sits under the title; the first paragraph is the standfirst
   - long articles get a pull quote; every article ends with a red mark; no heading is left alone at the bottom of a page
   - when an article ends with a lot of space left, the next article starts on the same page under a red rule
   Owner, 1 Nov 2026: same design as the latest magazine, large text, whole pictures, no cover / contents / back page. */
window.addEventListener('load', function () { document.fonts.ready.then(function () {
  var D = window.PDFDATA, book = document.getElementById('book'), page = 0, FS = window.FSOVR || D.fs || 1.1, W = 794;
  var FOOT = 'التجارة العربية الآسيوية · مقالات وأخبار · 2026';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Latin words, phone numbers and web addresses inside Arabic keep their own direction */
  function iso(t) {
    var re = /[A-Za-z+][A-Za-z0-9 .,&'’()\/+:@_-]*[A-Za-z0-9).]/g, out = '', last = 0, m; t = String(t);
    while ((m = re.exec(t))) { out += esc(t.slice(last, m.index)) + '<bdi dir="ltr">' + esc(m[0]) + '</bdi>'; last = re.lastIndex; }
    return out + esc(t.slice(last));
  }
  function folio(n) { return '<footer class="folio"><b>' + n + '</b><span class="fw"><span class="eml">www.aatworld.com</span></span><span class="fi">' + FOOT + '</span></footer>'; }
  function sheet(cls, inner) {
    page++; var s = document.createElement('section');
    s.className = 'sheet ' + cls + (page % 2 ? ' odd' : ' even'); s.style.setProperty('--fs', FS);
    s.innerHTML = inner + folio(page); book.appendChild(s); return s;
  }
  function node(html) { var t = document.createElement('div'); t.innerHTML = html; return t.firstChild; }
  function lim(s) { return s.querySelector('.folio').getBoundingClientRect().top - 8; }
  function fits(s) {
    var f = s.querySelector('.flow'); if (!f) return true;
    var fr = f.getBoundingClientRect(), L = lim(s), kids = f.children;
    for (var i = 0; i < kids.length; i++) {
      var rs = kids[i].getClientRects();
      for (var j = 0; j < rs.length; j++) { var r = rs[j]; if (r.height === 0) continue; if (r.left < fr.left - 1 || r.right > fr.right + 1 || r.bottom > L + 1) return false; }
    }
    return true;
  }
  /* a picture box of the given width: real proportions when they fit between minH and maxH, otherwise the whole picture over a blurred copy */
  function fig(src, ratio, w, minH, maxH, cls) {
    var h = Math.round(w / ratio), whole = h >= minH && h <= maxH; h = Math.max(minH, Math.min(maxH, h));
    var inner = whole ? '<img src="' + esc(src) + '" alt="">' : '<i style="background-image:url(\'' + esc(src) + '\')"></i><img src="' + esc(src) + '" alt="">';
    return { h: h, html: '<div class="' + (whole ? 'fig' : 'fx') + (cls ? ' ' + cls : '') + '" style="height:' + h + 'px">' + inner + '</div>' };
  }
  function para(t, end) { return t.indexOf('## ') === 0 ? '<h3>' + iso(t.slice(3)) + '</h3>' : '<p' + (end ? ' class="endp"' : '') + '>' + iso(t) + '</p>'; }
  /* fill pages; split a paragraph word by word at the page end; never leave a heading alone at the bottom */
  function pour(s, blocks, contCls, runhd) {
    var f = s.querySelector('.flow');
    while (blocks.length) {
      var b = node(blocks[0]); f.appendChild(b);
      if (fits(s)) { blocks.shift(); continue; }
      f.removeChild(b);
      var placed = false;
      if (b.tagName === 'P') {
        var cls = b.className, words = b.textContent.split(' '), lo = 0, hi = words.length - 6;
        var mk = function (n) { return node('<p class="' + cls + '">' + iso(words.slice(0, n).join(' ')) + '</p>'); };
        while (lo < hi) { var mid = (lo + hi + 1) >> 1, t = mk(mid); f.appendChild(t); var ok = fits(s); f.removeChild(t); if (ok) lo = mid; else hi = mid - 1; }
        if (lo >= 6) { f.appendChild(mk(lo)); blocks[0] = '<p class="cont' + (cls.indexOf('endp') > -1 ? ' endp' : '') + '">' + iso(words.slice(lo).join(' ')) + '</p>'; placed = true; }
      }
      if (!placed && f.lastElementChild && f.lastElementChild.tagName === 'H3') { blocks.unshift(f.lastElementChild.outerHTML); f.removeChild(f.lastElementChild); }
      s = sheet(contCls, '<div class="pad">' + runhd + '<div class="flow' + (contCls.indexOf('L-briefs') > -1 ? '' : ' bal') + '"></div></div>'); f = s.querySelector('.flow');
    }
    return s;
  }
  /* the title in a fixed box gets smaller until title + writer's line fit inside the box (never below 22px) */
  function fitTitle(box) {
    var h = box.querySelector('h1'), px = parseFloat(getComputedStyle(h).fontSize);
    function over() {
      var cs = getComputedStyle(box), avail = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), used = 0;
      [].forEach.call(box.children, function (c) { var m = getComputedStyle(c); used += c.offsetHeight + parseFloat(m.marginTop) + parseFloat(m.marginBottom); });
      return used > avail;
    }
    while (over() && px > 22) { px -= 1; h.style.fontSize = px + 'px'; h.style.lineHeight = '1.45'; }
  }
  function prep(a) {
    var p = a.body.slice(), by = '', dek = '';
    if (/^بقلم/.test(p[0] || '')) by = p.shift();
    if (p[0] && p[0].indexOf('## ') !== 0 && p[0].length <= 380) dek = p.shift();
    var blocks = p.map(function (t, i) { return para(t, i === p.length - 1); });
    if (p.length >= 9) {  /* pull quote: a strong sentence from the middle of the article */
      for (var k = Math.round(p.length * 0.45); k < p.length - 2; k++) {
        if (p[k].indexOf('## ') === 0) continue;
        var sent = (p[k].split(/[.؛!؟]/)[0] || '').trim();
        if (sent.length >= 50 && sent.length <= 170) { blocks.splice(k + 1, 0, '<blockquote class="pq">' + iso(sent) + '</blockquote>'); break; }
      }
    }
    if (blocks.length && blocks[blocks.length - 1].indexOf('<h3') === 0) blocks.push('<p class="endp"></p>');
    return { by: by, dek: dek, blocks: blocks };
  }
  function byline(by) { return by ? '<div class="byl">' + iso(by) + '</div>' : ''; }
  function dekHtml(d) { return d ? '<p class="dek">' + iso(d) + '</p>' : ''; }

  var s = null;
  D.arts.forEach(function (a, i) {
    var t = iso(a.title), r = a.ratio || 1.5, P = prep(a), run = '<div class="runhd"><b>' + (a.kind === 'news' ? 'أخبار' : 'مقالات') + '</b><span>' + t + '</span></div>';
    var cont = 'art ' + (r < 1.25 ? 'L-split' : r <= 2 ? 'L-feature' : 'L-band') + ' cont';
    /* next article on the same page, when the last page of the previous one is less than ~60 % full */
    if (s) {
      var f = s.querySelector('.flow');
      if (!f.classList.contains('bal')) f.classList.add('bal');
      var room = lim(s) - f.getBoundingClientRect().bottom, area = lim(s) - s.querySelector('.pad').getBoundingClientRect().top;
      if (room > area * 0.36) {
        var fw = f.getBoundingClientRect().width;
        /* try: picture up to 230px with the standfirst, then a smaller picture with the standfirst as a normal paragraph */
        var tries = [[230, true], [170, false]];
        for (var q = 0; q < tries.length; q++) {
          var im = fig(a.img, r, fw, 150, tries[q][0], 'inim'), added = [];
          var head = node('<div class="inhd"><h1>' + t + '</h1>' + byline(P.by) + im.html + '</div>'); f.appendChild(head); added.push(head);
          var blocks = P.blocks.slice();
          if (P.dek) { if (tries[q][1]) { var dk = node(dekHtml(P.dek)); f.appendChild(dk); added.push(dk); } else blocks.unshift(para(P.dek)); }
          /* only the start of the first paragraph has to fit here: the rest continues in the next column or page */
          var first = node(blocks[0]);
          if (first.tagName === 'P') { var w0 = first.textContent.split(' '); if (w0.length > 24) first = node('<p>' + iso(w0.slice(0, 24).join(' ')) + '</p>'); }
          f.appendChild(first);
          var ok = fits(s); f.removeChild(first);
          if (ok) { s = pour(s, blocks, cont, run); break; }
          added.forEach(function (e) { f.removeChild(e); });
        }
        if (q < tries.length) return;
      }
    }
    if (r < 1.25) {  /* tall or square picture: beside the red title box */
      var im1 = fig(a.img, r, W / 2, 400, 560);
      s = sheet('art L-split', '<div class="top" style="height:' + im1.h + 'px"><div class="im">' + im1.html + '</div><div class="tt"><h1>' + t + '</h1>' + byline(P.by) + '</div></div><div class="pad" style="top:' + (im1.h + 26) + 'px"><div class="flow">' + dekHtml(P.dek) + '</div></div>');
      fitTitle(s.querySelector('.tt'));
    } else if (r <= 2) {  /* normal picture: big on top, title card over its lower edge */
      var im2 = fig(a.img, r, W, 300, 470, 'hero');
      s = sheet('art L-feature', im2.html + '<div class="pad" style="top:' + (im2.h - 64) + 'px"><header class="ah"><h1>' + t + '</h1>' + byline(P.by) + '</header><div class="flow">' + dekHtml(P.dek) + '</div></div>');
    } else {  /* wide picture: strip across the page under the title */
      var im3 = fig(a.img, r, W, 200, 400, 'strip');
      s = sheet('art L-band', '<div class="pad"><header class="ah"><h1>' + t + '</h1>' + byline(P.by) + im3.html + '</header><div class="flow">' + dekHtml(P.dek) + '</div></div>');
    }
    s = pour(s, P.blocks.slice(), cont, run);
  });

  if (D.news && D.news.length) {
  /* news: the magazine's briefs pages, every item with its own picture at its real proportions */
    var briefs = [];
    D.news.forEach(function (n, k) {
      var im = fig(n.img, n.ratio || 1.5, 330, 140, 210);
      briefs.push('<div class="nhead' + (k ? '' : ' first') + '">' + im.html + '<b>' + iso(n.title) + '</b></div>');
      n.body.forEach(function (p, j) { briefs.push(para(p, j === n.body.length - 1)); });
    });
    s = sheet('art L-briefs', '<div class="pad"><header class="ah nh1"><div><h1>أخبار التجارة والصناعة</h1></div></header><div class="flow"></div></div>');
    pour(s, briefs, 'art L-briefs cont', '<div class="runhd"><b>أخبار</b><span>أخبار التجارة والصناعة</span></div>');
  }
  /* how full the last page is (0-1), so the builder can tighten the text size when only a few lines spill over */
  var last = book.lastElementChild, lf = last && last.querySelector('.flow');
  if (lf) { var top = last.querySelector('.pad').getBoundingClientRect().top, bot = 0; [].forEach.call(lf.querySelectorAll('*'), function (e) { var r = e.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom); });
    var fr = lf.getBoundingClientRect(), cols = 0; [].forEach.call(lf.children, function (e) { [].forEach.call(e.getClientRects(), function (r) { if (r.height) cols = Math.max(cols, r.left < fr.left + fr.width / 2 ? 2 : 1); }); });
    var h = last.querySelector('.folio').getBoundingClientRect().top - top; document.body.setAttribute('data-fill', ((bot - top) / h * (cols === 2 ? 1 : .5)).toFixed(2)); }
  document.body.setAttribute('data-pages', page);
}); });
