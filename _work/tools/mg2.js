const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 1700 } }); p.on('pageerror', e => console.log('ERR', e.message));
  for (const n of process.argv[2].split(',')) { await p.goto('http://localhost:8765/issue560/index.html#p-' + n); await p.reload(); await p.waitForTimeout(2300); await p.evaluate(() => document.querySelectorAll('img[loading]').forEach(i => i.removeAttribute('loading'))); await p.waitForTimeout(800);
    const el = await p.$('#clip'); await el.screenshot({ path: 'mg2-' + n + '.png' }); }
  console.log(await p.evaluate(() => document.getElementById('clip').style.width)); await b.close(); })();
