const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
  await p.goto('file://' + __dirname + '/doc.html', { waitUntil: 'networkidle' }); await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 300000 });
  console.log(await p.evaluate(() => [...document.querySelectorAll('.pg')].map((pg, i) => { const b = pg.querySelector('.body'), br = b.getBoundingClientRect(); let m = 0;
    [...b.children].forEach(c => [...c.getClientRects()].forEach(r => { if (r.height) m = Math.max(m, r.bottom); })); return (i + 1) + ':' + Math.round(br.bottom - m); }).join(' '))); await b.close(); })();
