const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1688, height: 900 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  const secs = await p.evaluate(() => [...document.querySelectorAll('main > section, main section.sec, section.sec, section.live')].map((s, i) => { s.setAttribute('data-si', i); return i + ' ' + s.className + ' | ' + ((s.querySelector('h2') || {}).textContent || '').slice(0, 50) + ' | h=' + s.offsetHeight; }));
  console.log(secs.join('\n'));
  await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager')); 
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } }); await p.waitForTimeout(800);
  for (const k of (process.argv[2] || '').split(',').filter(Boolean)) { const el = await p.$('[data-si="' + k + '"]'); if (el) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await el.screenshot({ path: 'sec-' + k + '.png' }); } }
  await b.close();
})();
