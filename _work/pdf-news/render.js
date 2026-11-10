const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
  await p.goto('file://' + __dirname + '/doc.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: __dirname + '/AAT-articles-news.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true, outline: true, tagged: true });
  await b.close(); })();
