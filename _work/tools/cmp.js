const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 700 } });
  await p.goto('http://localhost:8765/_cmp.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await (await p.$('#u')).screenshot({ path: 'cmp-u.png' }); await (await p.$('#a')).screenshot({ path: 'cmp-a.png' }); await b.close(); })();
