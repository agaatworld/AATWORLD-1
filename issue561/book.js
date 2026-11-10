/* AAT issue 561 flipbook. Pages are pictures (pages/p001.jpg ... p100.jpg). Arabic magazine: it turns right to left,
   so the pages are given to StPageFlip in reverse order and the book starts at its last sheet.
   The page fits the window height; two pages side by side when both fit, else one. Pictures load only near the open page. */
(function () {
  var N = 100, V = '20261110a', book = document.getElementById('book'), pf = null, cur = 1, last = null;
  var q = new URLSearchParams(location.search), EN = q.get('lang') === 'en';
  var T = EN ? { home: 'Website', page: 'Page', of: 'of ' + N, full: 'Full screen', exit: 'Exit full screen', pdf: 'PDF', prev: 'Previous', next: 'Next' }
             : { home: 'الموقع', page: 'صفحة', of: 'من ' + N, full: 'ملء الشاشة', exit: 'إنهاء ملء الشاشة', pdf: 'PDF', prev: 'السابق', next: 'التالي' };
  if (EN) { document.documentElement.lang = 'en'; document.getElementById('bar').dir = 'ltr'; }
  var I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
    r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
  };
  function $(id) { return document.getElementById(id); }
  $('bHome').innerHTML = I.home + '<span class="t">' + T.home + '</span>'; $('bHome').href = '../#magazine';
  $('bPdf').innerHTML = I.pdf + '<span class="t">' + T.pdf + '</span>';
  $('lPage').textContent = T.page; $('lOf').textContent = T.of;
  /* Arabic: the "previous" button is on the right and points right; "next" on the left points left */
  $('bPrev').innerHTML = I.r; $('bNext').innerHTML = I.l; $('bPrev').setAttribute('aria-label', T.prev); $('bNext').setAttribute('aria-label', T.next);
  function setFull() { var on = !!document.fullscreenElement; $('bFull').innerHTML = I.full + '<span class="t">' + (on ? T.exit : T.full) + '</span>'; }
  setFull(); document.addEventListener('fullscreenchange', setFull);
  $('bFull').onclick = function () { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) {} };
  if (!document.fullscreenEnabled) $('bFull').style.display = 'none';

  function src(n) { return 'pages/p' + String(n).padStart(3, '0') + '.jpg?v=' + V; }
  var els = [];
  for (var n = N; n >= 1; n--) {          /* reversed: element 0 is page 100 */
    var d = document.createElement('div'); d.className = 'page'; d.setAttribute('data-density', n === 1 || n === N ? 'hard' : 'soft');
    var im = document.createElement('img'); im.alt = (EN ? 'Page ' : 'صفحة ') + n; im.setAttribute('data-src', src(n)); im.decoding = 'async';
    d.appendChild(im); els.push(d);
  }
  function load(p) { for (var k = p - 3; k <= p + 4; k++) { if (k < 1 || k > N) continue; var im = els[N - k].querySelector('img'); if (!im.src) im.src = im.getAttribute('data-src'); } }

  function dims() {
    var vw = window.innerWidth, vh = $('stage').clientHeight - 16, h = Math.max(200, vh), w = Math.round(h / 1.4143);
    var two = 2 * w + 140 <= vw;
    if (!two && w > vw - 24) { w = vw - 24; h = Math.round(w * 1.4143); }
    return { w: w, h: h, two: two };
  }
  function idx2page(i) { return N - i; }
  function show() {
    $('iPage').value = cur;
    $('bPrev').disabled = cur <= 1; $('bNext').disabled = cur >= N;
    if (location.hash !== '#p-' + cur) history.replaceState(null, '', '#p-' + cur);
    load(cur);
    var d = last || dims(); book.style.transform = !d.two ? '' : cur === 1 ? 'translateX(' + Math.round(d.w / 2) + 'px)' : cur === N ? 'translateX(' + (-Math.round(d.w / 2)) + 'px)' : '';
  }
  function build() {
    var d = dims(), html = book;
    if (pf) { try { pf.destroy(); } catch (e) {} pf = null; html = document.createElement('div'); html.id = 'book'; $('stage').appendChild(html); book = html; }
    els.forEach(function (e) { e.style.width = ''; e.style.height = ''; });
    pf = new St.PageFlip(book, { width: d.w, height: d.h, size: 'fixed', usePortrait: !d.two, showCover: true, startPage: N - cur,
      drawShadow: true, maxShadowOpacity: .4, flippingTime: 800, mobileScrollSupport: false, swipeDistance: 24, showPageCorners: true, useMouseEvents: true, autoSize: false, startZIndex: 2 });
    pf.loadFromHTML(els);
    pf.on('flip', function (e) { cur = idx2page(e.data); if (d.two && cur > 1 && cur % 2 === 1) cur = Math.min(N, cur); show(); });
    show();
  }
  function go(p) { p = Math.max(1, Math.min(N, p | 0)); cur = p; if (pf) pf.turnToPage(N - p); show(); }
  function next() { if (pf) pf.flipPrev(); }   /* reversed order: the next magazine page is the previous sheet */
  function prev() { if (pf) pf.flipNext(); }
  $('bNext').onclick = next; $('bPrev').onclick = prev;
  $('iPage').addEventListener('change', function () { go(+this.value); });
  document.addEventListener('keydown', function (e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(1); else if (e.key === 'End') go(N);
  });
  var m = /^#p-(\d+)$/.exec(location.hash); if (m) cur = Math.max(1, Math.min(N, +m[1]));
  load(cur);
  window.addEventListener('hashchange', function () { var m = /^#p-(\d+)$/.exec(location.hash); if (m && +m[1] !== cur) go(+m[1]); });
  var rt = 0; last = dims(); window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var d = dims(); if (d.w !== last.w || d.h !== last.h || d.two !== last.two) { last = d; build(); } }, 200); });
  build();
})();
