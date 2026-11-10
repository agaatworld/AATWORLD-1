const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/doc_mag.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 120000 });
  console.log('pages', await p.evaluate(() => document.body.getAttribute('data-pages')), 'errors', errs.length, errs.slice(0, 3).join(' | '));
  await p.pdf({ path: __dirname + '/AAT-articles-news.pdf', width: '794px', height: '1123px', printBackground: true, preferCSSPageSize: true });
  await b.close(); })();
