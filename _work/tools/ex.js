const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html#exhibitions'); await p.waitForTimeout(2000); console.log(await p.evaluate(() => [...document.querySelectorAll('.xc')].map(c => c.innerText.replace(/\n/g, ' ')).join(' | ')));
  await p.click('.xc-all'); await p.waitForTimeout(1200); await p.screenshot({ path: 'ex.png' }); await b.close(); })();
