const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2500); await p.evaluate(() => document.querySelectorAll('img[loading]').forEach(i => i.loading = 'eager'));
  const H = await p.evaluate(() => document.documentElement.scrollHeight); let i = 0;
  for (const y of [0, 800, 1600, 2500, 3400, 4300, 5200, 6100]) { if (y > H) break; await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(1100); await p.screenshot({ path: 'h3-' + (i++) + '.png' }); }
  console.log('H', H, 'shots', i, 'hscroll', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  const m = await b.newPage({ viewport: { width: 390, height: 800 } }); m.on('pageerror', e => console.log('ERR', e.message)); await m.goto('http://localhost:8765/index.html#home'); await m.waitForTimeout(2500);
  console.log('mobile hscroll', await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)); await m.evaluate(() => window.scrollTo(0, 700)); await m.waitForTimeout(900); await m.screenshot({ path: 'h3-m.png' });
  await b.close(); })();
