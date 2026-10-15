const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pages = (process.argv[2] || '1,6').split(',');
  const p = await b.newPage({ viewport: { width: 860, height: 1300 } }); p.on('pageerror', e => console.log('ERR', e.message));
  for (const n of pages) { await p.goto('http://localhost:8765/issue560/index.html#p-' + n); await p.reload(); await p.waitForTimeout(2200); await p.evaluate(() => document.querySelectorAll('img[loading]').forEach(i => i.removeAttribute('loading'))); await p.waitForTimeout(700);
    const el = await p.$('.pgw[style*="display: block"]') || await p.$('#clip'); await el.screenshot({ path: 'mg-' + n + '.png' }); }
  await b.close(); })();
