// Screenshots + checks of the fusion style tiles. Run: node shoot.js
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const here = __dirname;
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const jobs = [
    ['tile-ar.html', 1920, 950, 'tile-ar-1920.png', false],
    ['tile-en.html', 1920, 950, 'tile-en-1920.png', false],
    ['tile-ar.html', 390, 844, 'tile-ar-390.png', false],
    ['tile-ar.html', 1920, 950, 'tile-ar-full.png', true],
    ['tile-ar.html', 1366, 768, 'tile-ar-1366.png', false],
    ['tile-ar.html', 390, 844, 'tile-ar-390-full.png', true],
    ['tile-en.html', 1920, 950, 'tile-en-full.png', true],
    ['tile-en.html', 390, 844, 'tile-en-390.png', false],
    ['tile-ar.html', 1100, 900, 'tile-ar-1100.png', false],
  ];
  const only = process.argv[2];
  for (const [file, w, h, out, full] of jobs) {
    if (only && !out.includes(only)) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
    await page.goto('file://' + path.join(here, file), { waitUntil: 'load' });
    // scroll through so lazy pictures load
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; });
      const wait = Promise.all([document.fonts.ready, ...Array.from(document.images).map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))]);
      await Promise.race([wait, new Promise(r => setTimeout(r, 8000))]);
    });
    await page.waitForTimeout(700);
    // freeze motion so the shot is deterministic
    await page.addStyleTag({ content: '.track,.glint,.pulse,.photo img{animation-play-state:paused !important;animation-delay:-0.9s !important}' });
    await page.screenshot({ path: path.join(here, out), fullPage: full });
    const info = await page.evaluate(() => {
      const fonts = Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + '/' + f.weight);
      let min = 999, minEl = '', small = [];
      document.querySelectorAll('body *').forEach(el => {
        const txt = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
        if (!txt) return;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || el.closest('.sr')) return;
        const fs = parseFloat(cs.fontSize);
        if (fs < 16) small.push(el.tagName + '.' + el.className + ' ' + fs + ' "' + el.textContent.trim().slice(0, 24) + '"');
        if (fs < min) { min = fs; minEl = el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 30) + '"'; }
      });
      const broken = Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
      const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
      // elements sticking out of the viewport sideways (ignoring the conveyor track, which is clipped on purpose)
      const out = [];
      document.querySelectorAll('body *').forEach(el => {
        if (el.closest('.conv') || el.closest('.sr') || el.classList.contains('skip')) return;
        const r = el.getBoundingClientRect(); if (!r.width) return;
        if (r.right > cw + 1 || r.left < -1) out.push(el.tagName + '.' + el.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      });
      // Latin letters inside the Arabic page that are not isolated (bdi / dir=ltr)
      let latinLoose = [];
      if (document.documentElement.dir === 'rtl') {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) {
          if (!/[A-Za-z]|\d\s*[–-]\s*\d/.test(n.textContent)) continue;
          const p = n.parentElement; if (p.closest('[dir=ltr],bdi,script,style,.sr,svg,[lang=zh-TW]')) continue;
          latinLoose.push(n.textContent.trim().slice(0, 40));
        }
      }
      const af = document.documentElement.outerHTML.includes('af.png');
      return { fonts: [...new Set(fonts)].sort(), min, minEl, small: small.slice(0, 8), broken, hscroll: sw > cw ? sw + '>' + cw : 'no', outside: out.slice(0, 8), latinLoose: latinLoose.slice(0, 12), af, height: document.documentElement.scrollHeight };
    });
    console.log(out, JSON.stringify(info), errs.length ? 'ERRORS ' + errs.join(' | ') : '');
    await ctx.close();
  }
  await browser.close();
})();
