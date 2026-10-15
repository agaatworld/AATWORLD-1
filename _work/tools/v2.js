const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const st = p => p.evaluate(() => document.getElementById('pn').textContent);
  { const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('http://localhost:8765/issue560/index.html#p-6'); await p.waitForTimeout(2500);
    console.log('pc', await st(p), await p.evaluate(() => { const c = document.getElementById('clip'), s = document.getElementById('stage'); return 'clip ' + c.style.width + 'x' + c.style.height + ' stage ' + s.clientWidth + 'x' + s.clientHeight + ' scrollH ' + s.scrollHeight + ' scrollW ' + s.scrollWidth + ' tb ' + getComputedStyle(document.querySelector('.tb')).display; }));
    await p.screenshot({ path: 'v2-pc.png' });
    await p.click('#nx'); await p.waitForTimeout(1500); console.log('next', await st(p));
    await p.click('#mBtn'); await p.waitForTimeout(400); await p.screenshot({ path: 'v2-drw.png' });
    await p.click('#bZoom'); await p.waitForTimeout(900); console.log('whole', await p.evaluate(() => document.getElementById('clip').style.width + ' drawer hidden ' + document.getElementById('drw').hidden)); await p.screenshot({ path: 'v2-whole.png' });
    await p.click('#mBtn'); await p.click('#bToc'); await p.waitForTimeout(300); await p.click('#toc .ls a:nth-child(2)'); await p.waitForTimeout(800); console.log('toc', await st(p));
    await p.keyboard.press('Home'); await p.waitForTimeout(700); console.log('home', await st(p)); await p.close(); }
  { const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('http://localhost:8765/issue560/index.html#p-6'); await p.waitForTimeout(2500); console.log('m', await st(p)); await p.screenshot({ path: 'v2-m.png' }); await p.click('#nx'); await p.waitForTimeout(1500); console.log('m next', await st(p)); await p.click('#mBtn'); await p.waitForTimeout(300); await p.screenshot({ path: 'v2-mdrw.png' }); await c.close(); }
  { const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('http://localhost:8765/index.html#flip'); await p.waitForTimeout(3500); await p.screenshot({ path: 'v2-site.png' });
    const fr = p.frames().find(f => /issue560/.test(f.url())); await fr.click('#mBtn'); await fr.click('[data-site="articles"]'); await p.waitForTimeout(1500); console.log('site nav →', await p.evaluate(() => location.hash + ' hdr ' + getComputedStyle(document.getElementById('hdr')).display)); await p.close(); }
  await b.close(); })();
