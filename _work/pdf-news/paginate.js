/* Lays the articles and news out on the magazine's own page templates, filling each page before moving on (owner: same design as the latest magazine). */
window.addEventListener('load', function () { document.fonts.ready.then(function () {
  var D = window.PDFDATA, book = document.getElementById('book'), page = 0, FS = 1.32;
  var FOOT = 'التجارة العربية الآسيوية · مقالات وأخبار · 2026';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Latin words, phone numbers and web addresses inside Arabic keep their own direction */
  function iso(t) {
    var re = /[A-Za-z+][A-Za-z0-9 .,&'’()\/+:@_-]*[A-Za-z0-9).]/g, out = '', last = 0, m;
    t = String(t);
    while ((m = re.exec(t))) { out += esc(t.slice(last, m.index)) + '<bdi dir="ltr">' + esc(m[0]) + '</bdi>'; last = re.lastIndex; }
    return out + esc(t.slice(last));
  }
  function folio(n) { return '<footer class="folio"><b>' + n + '</b><span class="fw"><span class="eml">www.aatworld.com</span></span><span class="fi">' + FOOT + '</span></footer>'; }
  function sheet(cls, inner) {
    page++; var s = document.createElement('section');
    s.className = 'sheet ' + cls + (page % 2 ? ' odd' : ' even'); s.style.setProperty('--fs', FS);
    s.innerHTML = inner + folio(page); book.appendChild(s); return s;
  }
  function fits(s) {
    var f = s.querySelector('.flow'), fol = s.querySelector('.folio'); if (!f) return true;
    var fr = f.getBoundingClientRect(), lim = Math.min(fr.bottom, fol.getBoundingClientRect().top - 6);
    var kids = f.children;
    for (var i = 0; i < kids.length; i++) {
      var rs = kids[i].getClientRects();
      for (var j = 0; j < rs.length; j++) { var r = rs[j]; if (r.height === 0) continue; if (r.left < fr.left - 1 || r.right > fr.right + 1 || r.bottom > lim + 1) return false; }
    }
    return true;
  }
  function node(html) { var t = document.createElement('div'); t.innerHTML = html; return t.firstChild; }
  function para(t) { return t.indexOf('## ') === 0 ? '<h3>' + iso(t.slice(3)) + '</h3>' : '<p>' + iso(t) + '</p>'; }
  /* pour blocks into the page; when a paragraph does not fit, split it word by word; then open continuation pages */
  function pour(s, blocks, contCls, runhd) {
    var f = s.querySelector('.flow');
    while (blocks.length) {
      var b = node(blocks[0]); f.appendChild(b);
      if (fits(s)) { blocks.shift(); continue; }
      f.removeChild(b);
      if (b.tagName === 'P') {
        var words = b.textContent.split(' '), mk = function (w) { return iso(w.join(' ')); }, lo = 0, hi = words.length, cls = b.className;
        while (lo < hi) { var mid = (lo + hi + 1) >> 1; var t = node('<p class="' + cls + '">' + mk(words.slice(0, mid)) + '</p>'); f.appendChild(t); var ok = fits(s); f.removeChild(t); if (ok) lo = mid; else hi = mid - 1; }
        if (lo >= 3) { f.appendChild(node('<p class="' + cls + '">' + mk(words.slice(0, lo)) + '</p>')); blocks[0] = '<p class="cont">' + mk(words.slice(lo)) + '</p>'; }
      } else if (b.classList && b.classList.contains('brief') && f.children.length === 0) { f.appendChild(b); blocks.shift(); }
      s = sheet(contCls, '<div class="pad">' + runhd + '<div class="flow' + (contCls.indexOf('L-briefs') > -1 ? '' : ' bal') + '"></div></div>'); f = s.querySelector('.flow');
    }
  }
  var LAY = ['L-feature', 'L-band', 'L-split'];
  D.arts.forEach(function (a, i) {
    var t = iso(a.title), im = '<img src="' + esc(a.img) + '" alt="">', paras = a.body.slice(), lay = LAY[i % 3], s;
    if (/^بقلم/.test(paras[0] || '') && i % 2) lay = 'L-essay';
    if (lay === 'L-feature') s = sheet('art L-feature', '<div class="hero" style="height:400px">' + im + '</div><div class="pad" style="top:420px"><header class="ah"><h1>' + t + '</h1></header><div class="flow"></div></div>');
    else if (lay === 'L-band') s = sheet('art L-band', '<div class="pad"><header class="ah"><h1>' + t + '</h1><div class="strip">' + im + '</div></header><div class="flow"></div></div>');
    else if (lay === 'L-split') s = sheet('art L-split', '<div class="top"><div class="im">' + im + '</div><div class="tt"><h1>' + t + '</h1></div></div><div class="pad"><div class="flow"></div></div>');
    else s = sheet('art L-essay', '<div class="pad"><header class="ah"><span class="q">”</span><h1>' + t + '</h1><div class="im" style="--r:2.2">' + im + '</div></header><div class="flow"></div></div>');
    pour(s, paras.map(para), 'art ' + lay + ' cont', '<div class="runhd"><b>مقالات</b><span>' + t + '</span></div>');
  });
  /* news: the magazine's briefs page ("سورية في شهر"), every item with its own picture */
  var briefs = [];
  D.news.forEach(function (n, k) {
    briefs.push('<div class="nhead' + (k ? '' : ' first') + '"><div class="bimg"><img src="' + esc(n.img) + '" alt=""></div><b>' + esc(n.title) + '</b></div>');
    n.body.forEach(function (p) { briefs.push(para(p)); });
  });
  var s = sheet('art L-briefs', '<div class="pad"><header class="ah nh1"><div><h1>أخبار التجارة والصناعة</h1></div></header><div class="flow"></div></div>');
  pour(s, briefs, 'art L-briefs cont', '<div class="runhd"><b>أخبار</b><span>أخبار التجارة والصناعة</span></div>');
  document.body.setAttribute('data-pages', page);
}); });
