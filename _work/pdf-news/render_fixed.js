const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const out = process.argv[2]; const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/doc_item.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 120000 });
  const r = await p.evaluate(() => [document.body.getAttribute('data-pages'), document.body.getAttribute('data-fill'), document.body.getAttribute('data-used'), getComputedStyle(document.querySelector('.flow p')).fontSize, getComputedStyle(document.querySelector('.flow p')).lineHeight]);
  await p.pdf({ path: out, width: '794px', height: '1123px', printBackground: true, preferCSSPageSize: true });
  console.log('pages', r[0], 'fill', r[1], 'font', r[3], 'line', r[4], 'used:' + r[2], errs.join('|')); await b.close(); })();
