const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const out = process.argv[2]; const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  /* the October issue sizes each article between 0.86 and 1.26 of the base; start at 1.1 and tighten (not below 0.92) while the last page holds only a few lines */
  let fs = 1.1, n, fill;
  for (;;) {
    await p.addInitScript(v => { window.FSOVR = v; }, fs);
    await p.goto('file://' + __dirname + '/doc_item.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 120000 });
    n = +(await p.evaluate(() => document.body.getAttribute('data-pages'))); fill = +(await p.evaluate(() => document.body.getAttribute('data-fill')));
    if (n === 1 || fill >= 0.3 || fs <= 0.92) break;
    fs = Math.round((fs - 0.03) * 100) / 100;
  }
  await p.pdf({ path: out, width: '794px', height: '1123px', printBackground: true, preferCSSPageSize: true });
  console.log(String(n).padStart(2), 'pages fs', fs, 'fill', fill, errs.length ? 'ERR ' + errs.join(' | ') : '', out.split('/').pop()); await b.close(); })();
