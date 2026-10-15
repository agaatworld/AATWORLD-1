const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1730, height: 900 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000); await p.click('.mz-sc[data-mz="so"]'); await p.waitForTimeout(1000);
  console.log((await p.evaluate(() => [...document.querySelectorAll('.mz-bs')].map(s => s.querySelector('.mz-bmore').hash.slice(9) + ' | ' + s.querySelector('.mz-blg').getAttribute('aria-label') + ' | tabs ' + (s.querySelectorAll('.mz-bnav [data-t]').length - 1) + ' | ' + ((s.querySelector('.mz-pn-top h4') || {}).textContent || '-').slice(0, 40) + ' | ' + ((s.querySelector('.mz-pfx') || {}).innerText || '').replace(/\n/g, ' ').slice(0, 90)))).join('\n'));
  await b.close(); })();
