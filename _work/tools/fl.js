const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('response', r => { if (r.status() >= 400 && /flag/.test(r.url())) console.log('404', r.url()); });
  await p.goto('http://localhost:8765/index.html#exhibitions'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => document.querySelectorAll('image').length));
  const el = await p.$('.xc-all'); if (el) { const box = await p.evaluateHandle(e => e.parentElement, el); await box.asElement().screenshot({ path: 'flags.png' }); } else await p.screenshot({ path: 'flags.png' });
  await b.close(); })();
