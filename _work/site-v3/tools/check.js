#!/usr/bin/env node
/* =============================================================================
   AAT World v3 · tools/check.js — automated QA for routes × languages × sizes (architect)
   Usage:
     node tools/check.js [--routes about,advertise,contact,privacy] [--langs ar,en] [--sizes 1920x950,1366x768,390x844] [--json out.json] [--verbose]
   Defaults: every main route, ar + en, 1920x950 · 1366x768 · 390x844. Report JSON: tools/check-report.json.
   Per case it reports (FAIL = must be fixed):
     errors     page errors, console errors, failed requests
     small      visible text with computed font-size < 16px (selector + text)               FAIL
     s16        text at 16–16.9px (allowed only for app names, tab labels, trade-line labels on phones,
                counter sub-lines on phones: DESIGN.md §3.3) — listed for review              info
     hscroll    document wider than the window (sideways page scroll)                        FAIL
     outside    elements sticking out of the window sideways (not inside a clipping box)     FAIL
     images     pictures that failed to load                                                  FAIL
     contrast   text/background contrast < 4.5 (< 3 for ≥24px, or ≥18.66px bold)            FAIL
     noH2       section.band without a visible <h2> (except [data-untitled])                  FAIL
     empty      #view has no text                                                             FAIL
     latin      Latin letters / number ranges in RTL text outside .lt / [dir=ltr]            FAIL
     af         img/flags/af.png in the DOM                                                   FAIL
     bands      two neighbouring bands with the same background colour                        FAIL
     nav        PC menu not in one row or two even rows of 4                                  FAIL
     placeholder  visible "TBA", "قريباً", "—", "coming soon" … text                           FAIL
   Server: http://localhost:8790/index.html (override with AAT_BASE=...).
============================================================================= */
'use strict';
const path = require('path');
const fs = require('fs');
const { launch, openPage } = require('./pw');

const ALL = ['home', 'magazine', 'exhibitions', 'companies', 'products', 'reading', 'club', 'about', 'advertise', 'contact', 'privacy'];
const a = process.argv.slice(2);
const opt = (n, d) => { const i = a.indexOf(n); return i < 0 ? d : a[i + 1]; };
const routes = opt('--routes', ALL.join(',')).split(',').filter(Boolean);
const langs = opt('--langs', 'ar,en').split(',').filter(Boolean);
const sizes = opt('--sizes', '1920x950,1366x768,390x844').split(',').map(s => s.split('x').map(Number));
const jsonOut = opt('--json', path.join(__dirname, 'check-report.json'));
const verbose = a.includes('--verbose');

/* runs inside the page */
function audit() {
  const out = { small: [], s16: [], outside: [], images: [], contrast: [], noH2: [], latin: [], bands: [], placeholder: [] };
  const vis = el => {
    if (!el || el.closest('[hidden],.sr,[aria-hidden=true]')) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  };
  const sel = el => {
    let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.');
    const p = el.parentElement; if (p && p !== document.body) { let ps = p.tagName.toLowerCase(); if (p.className && typeof p.className === 'string') ps += '.' + p.className.trim().split(/\s+/)[0]; s = ps + ' > ' + s; }
    return s;
  };
  const ownText = el => Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  // colours
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (x, y) => { const a1 = lum(x), b1 = lum(y); return (Math.max(a1, b1) + 0.05) / (Math.min(a1, b1) + 0.05); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  function bgOf(el) {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
    return bg;
  }
  const PLACE = /(^|\s)(TBA|TBD|coming soon|to be announced|قريباً|يُعلن لاحقاً|يعلن لاحقا|الشهر فقط|غير معروف|approx\.?)(\s|$)|^[—–-]$/i;
  document.querySelectorAll('body *').forEach(el => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|svg|SVG|TITLE|META|LINK|OPTION)$/.test(el.tagName) || el.closest('svg')) return;
    const txt = ownText(el); if (!txt || !vis(el)) return;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
    const item = sel(el) + ' ' + fs + 'px "' + txt.slice(0, 40) + '"';
    if (fs < 16) out.small.push(item); else if (fs < 17) out.s16.push(item);
    if (PLACE.test(txt)) out.placeholder.push(item);
    const col = parse(cs.color); if (!col || col.a === 0) return;
    if (el.closest('input,textarea,select')) return;
    const bg = bgOf(el), fg = col.a < 1 ? blend(col, bg) : col;
    const r = ratio(fg, bg), need = (fs >= 24 || (fs >= 18.66 && fw >= 700)) ? 3 : 4.5;
    if (r < need) out.contrast.push(item + ' ratio ' + r.toFixed(2) + ' < ' + need);
  });
  // sideways overflow (ignoring content clipped by a scrolling/hidden box, e.g. the conveyor)
  const W = document.documentElement.clientWidth;
  document.querySelectorAll('body *').forEach(el => {
    if (!vis(el) || el.closest('.skip')) return;
    const r = el.getBoundingClientRect(); if (r.right <= W + 1 && r.left >= -1) return;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const ox = getComputedStyle(p).overflowX; if (ox !== 'visible') return; }
    out.outside.push(sel(el) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
  });
  out.images = Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
  document.querySelectorAll('section.band').forEach(s => {
    if (s.hasAttribute('data-untitled') || !vis(s)) return;
    const h = Array.from(s.querySelectorAll('h2')).find(vis); if (!h) out.noH2.push(sel(s) + (s.id ? '' : ' (no id)'));
  });
  // neighbouring bands (opening board, bands, contact band, footer) never share a background colour
  const seq = Array.from(document.querySelectorAll('#view > section, #view > * > section.band, #contact-slot > section, .ft')).filter(vis);
  for (let i = 1; i < seq.length; i++) {
    const c1 = getComputedStyle(seq[i - 1]).backgroundColor, c2 = getComputedStyle(seq[i]).backgroundColor;
    if (c1 === c2) out.bands.push(sel(seq[i - 1]) + ' / ' + sel(seq[i]) + ' both ' + c1);
  }
  // Latin letters or number ranges in RTL text outside .lt / [dir=ltr]
  if (document.documentElement.dir === 'rtl') {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const s = n.textContent; if (!/[A-Za-z]|\d\s*[–—-]\s*\d/.test(s)) continue;
      const p = n.parentElement; if (!p || p.closest('script,style,svg,noscript,[hidden],.sr')) continue;
      const d = p.closest('[dir]'); if (d && d.getAttribute('dir') === 'ltr') continue;
      if (p.closest('.lt,[lang^=zh],.zh') || !vis(p)) continue;
      out.latin.push(sel(p) + ' "' + s.trim().slice(0, 40) + '"');
    }
  }
  const view = document.getElementById('view');
  const nav = document.querySelector('.nav-l');
  let navInfo = 'hidden';
  if (nav && vis(nav)) {
    const tops = {}; nav.querySelectorAll('li').forEach(li => { const t = Math.round(li.getBoundingClientRect().top); tops[t] = (tops[t] || 0) + 1; });
    const rows = Object.values(tops); navInfo = rows.length === 1 ? '1 row' : rows.join('+');
  }
  const fonts = document.fonts ? Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')) : [];
  return Object.assign(out, {
    hscroll: document.documentElement.scrollWidth > window.innerWidth ? document.documentElement.scrollWidth + '>' + window.innerWidth : '',
    empty: !view || !view.innerText.trim(),
    af: !!document.querySelector('img[src*="flags/af.png"],img[srcset*="flags/af.png"],[style*="flags/af.png"],image[href*="flags/af.png"]'),
    nav: navInfo, fonts: [...new Set(fonts)].sort(), title: document.title, height: document.documentElement.scrollHeight
  });
}

module.exports = { audit };
if (require.main === module) (async () => {
  const browser = await launch();
  const report = [];
  let fails = 0;
  for (const route of routes) for (const lang of langs) for (const [w, h] of sizes) {
    const { ctx, page, errors } = await openPage(browser, { route, lang, w, h });
    const r = await page.evaluate(audit);
    await ctx.close();
    const navBad = w > 960 && !(r.nav === '1 row' || r.nav === '4+4');
    const bad = {
      errors: errors.length, small: r.small.length, hscroll: r.hscroll ? 1 : 0, outside: r.outside.length, images: r.images.length, contrast: r.contrast.length,
      noH2: r.noH2.length, empty: r.empty ? 1 : 0, latin: r.latin.length, af: r.af ? 1 : 0, bands: r.bands.length, nav: navBad ? 1 : 0, placeholder: r.placeholder.length
    };
    const failed = Object.keys(bad).filter(k => bad[k]);
    if (failed.length) fails++;
    const fontsOk = ['Changa', 'Readex Pro'].every(f => r.fonts.includes(f));
    console.log(`[${lang} ${w}x${h} #${route}] ${failed.length ? 'FAIL ' + failed.map(k => k + '=' + bad[k]).join(' ') : 'OK'}  · nav ${r.nav} · s16 ${r.s16.length} · fonts ${fontsOk ? 'ok' : 'MISSING ' + r.fonts.join('/')} · "${r.title}"`);
    const show = (k, list) => { if (list && list.length) console.log('   ' + k + ': ' + list.slice(0, verbose ? 50 : 6).join(' | ')); };
    show('errors', errors); show('small', r.small); show('hscroll', r.hscroll ? [r.hscroll] : []); show('outside', r.outside); show('images', r.images); show('contrast', r.contrast);
    show('noH2', r.noH2); show('latin', r.latin); show('bands', r.bands); show('placeholder', r.placeholder); if (r.af) show('af', ['af.png present']);
    if (verbose) show('s16', r.s16);
    report.push({ route, lang, size: w + 'x' + h, failed, errors, ...r });
  }
  await browser.close();
  fs.writeFileSync(jsonOut, JSON.stringify(report, null, 1));
  console.log(`${report.length} cases, ${fails} failing · report ${jsonOut}`);
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exit(2); });
