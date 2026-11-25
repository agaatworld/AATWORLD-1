const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => errs.push('console ' + m.text()));
  await p.goto('file://' + __dirname + '/doc.html', { waitUntil: 'networkidle' }); await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 300000 });
  console.log(await p.evaluate(() => [...document.querySelectorAll('.pg')].map((pg, i) => { const b = pg.querySelector('.body'); return (i + 1) + ' ' + b.style.columnFill + ' lh' + b.style.lineHeight + ' ps' + b.style.getPropertyValue('--ps') + ' q' + b.querySelectorAll('.pq').length; }).slice(10, 26).join('\n')), errs.slice(0, 5)); await b.close(); })();
