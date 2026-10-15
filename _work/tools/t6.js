const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1688, height: 900 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  for (const h of ['#articles', '#industry-cnc', '#about', '#magazine', '#flip', '#company-63']) { await p.goto('http://localhost:8765/index.html' + h); await p.waitForTimeout(1500); console.log(h, await p.evaluate(() => document.querySelector('main') ? document.querySelector('main').innerText.length : -1)); }
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(1500);
  const el = await p.$('.ind'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); await el.screenshot({ path: 'ind.png' });
  await b.close(); })();
