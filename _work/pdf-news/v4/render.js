const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const out = path.join(__dirname, process.env.OUT || 'pages'); fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (/^\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(out, f));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: Number(process.env.SCALE || 2.5) });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/doc.html', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 300000 });
  const fonts = await p.evaluate(() => [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))].join(','));
  const pgs = await p.$$('.pg'); console.log('pages', pgs.length, 'fonts', fonts, errs.length ? 'ERR ' + errs.join('|') : '');
  for (let i = 0; i < pgs.length; i++) await pgs[i].screenshot({ path: path.join(out, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 90 });
  await b.close();
})();
