const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
  await p.goto('file://' + __dirname + '/doc.html', { waitUntil: 'networkidle' }); await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 300000 });
  console.log(await p.evaluate(() => (window.WHYS || []).slice(-30).join('\n'))); await b.close(); })();
