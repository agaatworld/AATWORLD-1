const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter(f => f.family.includes('Jazeera')).map(f => f.family + ' ' + f.weight + ' ' + f.status).join(' | '); }));
  await p.evaluate(() => window.scrollTo(0, 620)); await p.waitForTimeout(900); await p.screenshot({ path: 'font-home.png' });
  await p.goto('http://localhost:8765/issue560/index.html#p-6'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter(f => /Kufi|Naskh/.test(f.family)).map(f => f.family + ' ' + f.weight + ' ' + f.status).join(' | '); }));
  await p.screenshot({ path: 'font-mag.png' }); await b.close(); })();
