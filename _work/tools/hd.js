const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[1600, 900], [390, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2000); const seen = new Set();
    for (const y of [0, 30, 60, 200, 300, 800, 2000, 4000, 3900, 3000, 500, 100, 0]) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(350); seen.add(await p.evaluate(() => { const r = document.querySelector('#hdr .hd').getBoundingClientRect(); return Math.round(r.top) + ',' + Math.round(r.height) + ',' + Math.round(r.width) + ' ' + document.getElementById('hdr').className + '|' + document.documentElement.className.replace(/js|mz-bgon|mz-h-shelf/g, '').trim(); })); }
    console.log(w, [...seen].join('  ||  ')); await p.close(); }
  await b.close(); })();
