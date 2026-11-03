// Renders _spread.html (and _cover.html) to 300 dpi images and print PDFs.  SCALE env: 1 for a quick look.
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs'); const path = require('path');
const S = Number(process.env.SCALE || 3.125);   // 96 css px per inch -> 300 dpi
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [name, w, h] of [['spread', 1612, 1147], ['cover', 0, 0]]) {
    const f = path.join(__dirname, '_' + name + '.html'); if (!fs.existsSync(f)) continue;
    const p = await b.newPage({ viewport: { width: (w || 1200) + 40, height: (h || 1200) + 40 }, deviceScaleFactor: S });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('FAILED ' + r.url()));
    await p.goto('file://' + f, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    const info = await p.evaluate(() => [...new Set([...document.fonts].filter(x => x.status === 'loaded').map(x => x.family))].join(','));
    for (const el of await p.$$('[data-shot]')) {
      const id = await el.getAttribute('data-shot');
      await el.screenshot({ path: path.join(__dirname, 'out', id + (S < 2 ? '-preview' : '') + '.png') });
    }
    console.log(name, 'fonts:', info, errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
    await p.close();
  }
  await b.close();
})();
