const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 3 }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2200); await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(600);
  const el = await p.$('.hero .btn:not(.btn-adv), .hero a[href="#flip"].btn'); const all = await p.$$('a[href="#flip"]'); console.log(all.length);
  for (const a of all) { const bx = await a.boundingBox(); if (bx && bx.width > 60 && bx.height < 80) { await a.screenshot({ path: 'ic.png' }); break; } }
  await b.close(); })();
