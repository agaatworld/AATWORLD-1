const { chromium } = require('/opt/node-tools/node_modules/playwright');
const out = '/home/user/AATWORLD-1/_work/site-v3/concepts/gazette/';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const jobs = [
    ['tile-ar.html', 1920, 950, 'tile-ar-1920.png', false],
    ['tile-en.html', 1920, 950, 'tile-en-1920.png', false],
    ['tile-ar.html', 390, 844, 'tile-ar-390.png', false],
    ['tile-ar.html', 1920, 950, 'tile-ar-full.png', true],
  ];
  for (const [file, w, h, name, full] of jobs) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto('file://' + out + file, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).filter((v, i, a) => a.indexOf(v) === i));
    // smallest text + horizontal overflow check
    const audit = await page.evaluate(() => {
      const small = []; let min = 999;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) { if (!n.nodeValue.trim()) continue; const el = n.parentElement; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const fs = parseFloat(cs.fontSize); if (fs < min) min = fs; if (fs < 16) small.push(fs + 'px: ' + n.nodeValue.trim().slice(0, 40)); }
      return { min, small: small.slice(0, 10), scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, h: document.documentElement.scrollHeight };
    });
    await page.screenshot({ path: out + name, fullPage: full });
    console.log(name, JSON.stringify(audit), 'errors:', errs, '\n  fonts:', fonts.join(', '));
    await ctx.close();
  }
  await browser.close();
})();
