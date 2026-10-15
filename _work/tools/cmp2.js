const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 700 } });
  p.on('requestfailed', r => console.log('FAIL', r.url()));
  await p.goto('http://localhost:8765/_cmp.html'); await p.evaluate(async () => { await Promise.all([document.fonts.load('400 30px U', 'قبل'), document.fonts.load('400 30px AL', 'قبل')]); await document.fonts.ready; }); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status).join(' | ')));
  await (await p.$('#u')).screenshot({ path: 'cmp-u.png' }); await (await p.$('#a')).screenshot({ path: 'cmp-a.png' }); await b.close(); })();
