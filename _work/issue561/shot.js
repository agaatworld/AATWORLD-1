// node shot.js <html> <outdir> [scale]  -> one PNG per [data-shot] element (scale 3.125 = 300 dpi for a 794 px wide A4 page)
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path');
(async () => {
  const [file, out, sc] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 2600, height: 3700 }, deviceScaleFactor: Number(sc || 3.125) });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('FAILED ' + r.url()));
  await p.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  for (const el of await p.$$('[data-shot]')) await el.screenshot({ path: path.join(out, (await el.getAttribute('data-shot')) + '.png') });
  console.log(file, 'fonts', await p.evaluate(() => [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))].join(',')), errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
  await b.close();
})();
