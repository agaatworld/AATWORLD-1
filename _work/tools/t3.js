const { chromium } = require('playwright');
const [,, W, H, lang, pages, tag] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.addInitScript(l => { try { localStorage.setItem('aat.lang', JSON.stringify(l)); } catch (e) {} }, lang);
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.click('.mz-sc[data-mz="so"]'); await p.waitForTimeout(1200);
  console.log('lang', await p.evaluate(() => document.documentElement.lang + ' ' + document.documentElement.dir), 'slides', await p.evaluate(() => document.querySelectorAll('.mz-bs').length), 'full', await p.evaluate(() => !!document.querySelector('.mz-reel.mz-full')));
  for (const pg of pages.split(',')) {
    const n = await p.evaluate(pg => { const s = [...document.querySelectorAll('.mz-bs')].find(s => (s.querySelector('.mz-bmore') || {}).hash === '#company-' + pg); if (!s) return -1; s.scrollIntoView(); window._s = s; return s.querySelectorAll('.mz-bnav [data-t]').length - 1; }, pg);
    if (n < 0) { console.log('no slide', pg); continue; }
    for (let t = -1; t < n; t++) {
      await p.evaluate(t => window._s.querySelector('.mz-bnav [data-t="' + t + '"]').click(), t); await p.waitForTimeout(350);
      const info = await p.evaluate(() => { const pane = window._s.querySelector('.mz-bpane.on'); const pg = pane.firstElementChild; return [pane.className, pane.clientHeight, pane.scrollHeight, window._s.clientWidth]; });
      console.log(pg, t, info.join(' '));
      await p.screenshot({ path: `s-${tag}-${pg}-${t}.png` });
    }
  }
  await b.close();
})();
