const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html#club'); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('img[loading]').forEach(i => i.loading = 'eager'));
  const el = await p.$('.tk-g'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); await el.screenshot({ path: 'z-tk.png' }); await b.close(); })();
