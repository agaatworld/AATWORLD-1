// Screenshots of the style tiles. Run: node shoot.js
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const here = __dirname;
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const jobs = [
    ['tile-ar.html', 1920, 950, 'tile-ar-1920.png', false],
    ['tile-en.html', 1920, 950, 'tile-en-1920.png', false],
    ['tile-ar.html', 390, 844, 'tile-ar-390.png', false],
    ['tile-ar.html', 1920, 950, 'tile-ar-full.png', true],
    ['tile-ar.html', 390, 844, 'tile-ar-390-full.png', true],
    ['tile-ar.html', 1366, 768, 'tile-ar-1366.png', false],
    ['tile-en.html', 390, 844, 'tile-en-390.png', false],
    ['tile-en.html', 1920, 950, 'tile-en-full.png', true],
  ];
  for (const [file, w, h, out, full] of jobs) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
    await page.goto('file://' + path.join(here, file), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(1200);
    // stop the shelf so the shot is deterministic
    await page.addStyleTag({ content: '.track{animation-play-state:paused !important}' });
    await page.screenshot({ path: path.join(here, out), fullPage: full });
    const info = await page.evaluate(() => {
      const fonts = Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family + '/' + f.weight);
      // smallest rendered text and any broken images
      let min = 999, minEl = '';
      document.querySelectorAll('body *').forEach(el => {
        if (!el.childNodes.length) return;
        const txt = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
        if (!txt) return;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < min) { min = fs; minEl = el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0, 30) + '"'; }
      });
      const broken = Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
      const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
      return { fonts: [...new Set(fonts)], min, minEl, broken, hscroll: sw > cw ? sw + '>' + cw : 'no', height: document.documentElement.scrollHeight };
    });
    console.log(out, JSON.stringify(info), errs.length ? 'ERRORS ' + errs.join(' | ') : '');
    await ctx.close();
  }
  await browser.close();
})();
