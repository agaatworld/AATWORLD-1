const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[1920, 1000], [1600, 900], [1366, 700], [1024, 700], [390, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => console.log('ERR', e.message));
    for (const r of ['#home', '#articles', '#exhibitions', '#club', '#article-ar26-2', '#products']) { await p.goto('http://localhost:8765/index.html' + r); await p.waitForTimeout(1300); const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 1) console.log(w, r, 'HSCROLL', o); }
    if (w === 1600 || w === 1366 || w === 390) { await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2000); await p.evaluate(() => window.scrollTo(0, 2600)); await p.waitForTimeout(1200); await p.screenshot({ path: 'h4-' + w + '.png' }); await p.goto('http://localhost:8765/index.html#article-ar26-2'); await p.waitForTimeout(1500); await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(700); await p.screenshot({ path: 'h4a-' + w + '.png' }); }
    await p.close(); }
  await b.close(); console.log('done'); })();
