const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [w,h,n] of [[1600,900,'pc'],[390,800,'m']]) { const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: n==='m' });
    p.on('pageerror', e => console.log(n,'ERR', e.message)); p.on('console', m => { if (m.type()==='error' && !/Failed to load resource/.test(m.text())) console.log(n,'CON', m.text().slice(0,200)); });
    await p.goto('http://localhost:8765/issue560/index.html'); await p.waitForTimeout(2500);
    const st = () => p.evaluate(() => document.getElementById('pn').textContent + ' hash=' + location.hash + ' vis=' + [...document.querySelectorAll('.pgw')].filter(e => e.style.display === 'block').map(e => e.querySelector('.sheet').getAttribute('data-p')).join(','));
    console.log(n, 'start', await st()); await p.screenshot({ path: 'f-' + n + '-0.png' });
    await p.click('#nx'); await p.waitForTimeout(450); await p.screenshot({ path: 'f-' + n + '-mid.png' }); await p.waitForTimeout(1200); console.log(n, 'next', await st()); await p.screenshot({ path: 'f-' + n + '-1.png' });
    await p.click('#nx'); await p.waitForTimeout(1500); console.log(n, 'next', await st());
    await p.click('#pv'); await p.waitForTimeout(1500); console.log(n, 'prev', await st());
    await p.evaluate(() => { location.hash = '#p-52'; }); await p.waitForTimeout(900); console.log(n, 'hash52', await st()); await p.screenshot({ path: 'f-' + n + '-52.png' });
    await p.keyboard.press('End'); await p.waitForTimeout(700); console.log(n, 'end', await st());
    await p.keyboard.press('Home'); await p.waitForTimeout(700); console.log(n, 'home', await st());
    await p.close(); }
  await b.close(); })();
