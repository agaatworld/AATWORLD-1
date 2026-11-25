/* Best-quality magazine PDF: REAL text and the original images (sharp at any zoom), copied from the flipbook pages as readers see them.
   Every grid/flex box is pinned to its on-screen size so the PDF printer cannot lay a page out differently.
   Run (server on :8765): node _work/tools/mag_pdf_text.js  → writes issue560/AAT-560-October-2026.pdf
   Then python3 _work/tools/mag_pdf_check.py compares every page with the flipbook pictures from mag_pdf.js. */
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const PDF = __dirname + '/../../issue560/AAT-560-October-2026.pdf';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 1300 }, colorScheme: 'light' });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/issue560/index.html#p-1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const N = await p.evaluate(() => document.querySelectorAll('.stf__item').length);
  for (let n = 1; n <= N; n++) {
    await p.evaluate(n => { location.hash = '#p-' + n; }, n);
    await p.waitForTimeout(n === 1 ? 900 : 1300);
    await p.evaluate(n => { const s = document.querySelector('.stf__item .sheet[data-p="' + n + '"]'); const c = s.cloneNode(true); c.style.transform = 'none';
      const live = [s, ...s.querySelectorAll('*')], copy = [c, ...c.querySelectorAll('*')];
      live.forEach((e, i) => { const cs = getComputedStyle(e), d = copy[i]; if (!d || !d.style) return;
        if (cs.display.includes('grid')) { d.style.gridTemplateRows = cs.gridTemplateRows; d.style.gridTemplateColumns = cs.gridTemplateColumns; }
        if (cs.display.includes('grid') || cs.display.includes('flex') || cs.overflow === 'hidden' || cs.columnCount !== 'auto') { d.style.height = cs.height; d.style.minHeight = '0'; d.style.boxSizing = 'border-box'; }
        if (cs.columnCount !== 'auto') d.style.columnFill = 'auto'; });
      c.querySelectorAll('img').forEach(i => { if (!i.getAttribute('src') && i.dataset.src) i.src = i.dataset.src; i.loading = 'eager'; });
      (window.__prt = window.__prt || []).push(c.outerHTML); }, n);
    if (n % 20 === 0) console.log('page', n);
  }
  await p.evaluate(async () => {
    const box = document.createElement('div'); box.id = 'printAll';
    box.innerHTML = window.__prt.map(h => '<div class="pgw prt">' + h + '</div>').join('');
    document.body.appendChild(box);
    await Promise.all([...box.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    const st = document.createElement('style');
    st.textContent = '@page{size:794px 1123px;margin:0}html,body{margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important;height:auto!important}' +
      'body>*:not(#printAll){display:none!important}#printAll .prt{position:relative!important;width:794px;height:1123px;overflow:hidden;break-after:page;box-shadow:none}' +
      '#printAll .prt:last-child{break-after:auto}#printAll .sheet{transform:none!important}';
    document.head.appendChild(st);
  });
  await p.waitForTimeout(800);
  await p.emulateMedia({ media: 'screen' });
  await p.pdf({ path: PDF, width: '794px', height: '1123px', printBackground: true, preferCSSPageSize: true });
  console.log('pages', N, 'errors', errs.length, errs[0] || '');
  await b.close();
})();
