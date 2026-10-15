const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const p = await b.newPage({ viewport: { width: 1687, height: 876 } });
  p.on('response', r => { if (r.status() >= 400) console.log('FAIL', r.status(), r.url()); });
  p.on('requestfailed', r => console.log('REQFAIL', r.url()));
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3000);
  console.log(await p.evaluate(() => [...document.querySelectorAll('.book img')].map(i => i.getAttribute('src') + ' ' + i.naturalWidth)));
  await p.screenshot({ path: 'home.png' });
  await b.close();
})();
