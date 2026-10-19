/* Make the magazine PDF FROM the flipbook: every page is a sharp, high-resolution picture of the flipbook page
   (about 1800 x 2550 px, ~220 dpi on A4), so the PDF always shows exactly what readers see in the flipbook.
   (A "real text" print was tried on 19 Oct: the PDF printer re-flows columns and lists, e.g. pages 15, 39, 40, so it
   did not match the flipbook. Pictures of the real pages always match.)
   Run after ANY change to issue560/index.html (local server on :8765, repo root):
     node _work/tools/mag_pdf.js && python3 _work/tools/mag_pdf.py */
const fs = require('fs');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const OUT = __dirname + '/pdfpages';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 1300 }, deviceScaleFactor: 2.4, colorScheme: 'light' });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/issue560/index.html#p-1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  // hide the reader's own buttons and bars that float over the page
  await p.addStyleTag({ content: '#mBtn,#sideTools,.tb,.ub,.nav,.navb,[class*="arrow"],.drw,#drw,.prog,.bar,.pager,button{visibility:hidden!important} *{animation:none!important;transition:none!important}' });
  const N = await p.evaluate(() => document.querySelectorAll('.stf__item').length);
  for (let n = 1; n <= N; n++) {
    await p.evaluate(n => { location.hash = '#p-' + n; }, n);
    await p.waitForTimeout(n === 1 ? 900 : 1300);
    await p.evaluate(() => Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 3000); }))));
    const box = await p.evaluate(() => {
      const v = [...document.querySelectorAll('.stf__item')].filter(e => { const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 50 && r.right > 0 && r.left < innerWidth; });
      if (v.length !== 1) return { n: v.length };
      const r = v[0].getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    if (!box.width) throw new Error('page ' + n + ': ' + box.n + ' pages visible');
    await p.screenshot({ path: `${OUT}/p${String(n).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 62, clip: box });
    if (n % 20 === 0) console.log('page', n);
  }
  console.log('pages', N, 'errors', errs.length, errs[0] || '');
  await b.close();
})();
