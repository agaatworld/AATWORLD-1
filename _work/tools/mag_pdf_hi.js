/* very high-resolution pictures (3x) of chosen flipbook pages: node mag_pdf_hi.js "[61,75]" outdir */
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const pages = JSON.parse(process.argv[2]), OUT = process.argv[3];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 1300 }, deviceScaleFactor: 3, colorScheme: 'light' });
  await p.goto('http://localhost:8765/issue560/index.html#p-1', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await p.addStyleTag({ content: '#mBtn,#sideTools,.tb,.ub,.nav,.navb,[class*="arrow"],.drw,#drw,.prog,.bar,.pager,button{visibility:hidden!important} *{animation:none!important;transition:none!important}' });
  for (const n of pages) {
    await p.evaluate(n => { location.hash = '#p-' + n; }, n); await p.waitForTimeout(1500);
    const box = await p.evaluate(() => { const v = [...document.querySelectorAll('.stf__item')].filter(e => { const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 50 && r.right > 0 && r.left < innerWidth; }); const r = v[0].getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await p.screenshot({ path: `${OUT}/p${String(n).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 90, clip: box });
  }
  await b.close();
})();
