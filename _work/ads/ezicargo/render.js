// Renders every data-shot element of _ad.html to PNG.  SCALE env: 1 for a quick look, default 3.125 = 300 dpi.
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs'); const path = require('path');
const S = Number(process.env.SCALE || 3.125);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 1300 }, deviceScaleFactor: S });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('FAILED ' + r.url()));
  await p.goto('file://' + path.join(__dirname, '_ad.html'), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForFunction(() => document.body.getAttribute('data-ready')); await p.waitForTimeout(300);
  const fonts = await p.evaluate(() => [...new Set([...document.fonts].filter(x => x.status === 'loaded').map(x => x.family))].join(','));
  for (const el of await p.$$('[data-shot]')) {
    const id = await el.getAttribute('data-shot');
    await el.screenshot({ path: path.join(__dirname, 'out', id + (S < 2 ? '-preview' : '') + '.png') });
  }
  console.log('fonts:', fonts, errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
  await b.close();
})();
