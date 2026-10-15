const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  const st = p => p.evaluate(() => document.getElementById('pn').textContent);
  { const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('http://localhost:8765/issue560/index.html#p-20'); await p.waitForTimeout(2500); console.log('pc at', await st(p));
    const r = await p.evaluate(() => { const c = document.getElementById('clip').getBoundingClientRect(); return [c.left, c.top, c.width, c.height]; });
    /* drag the left page's outer top corner to the right: reading-next in Arabic */
    await p.mouse.move(r[0] + 12, r[1] + 14); await p.mouse.down(); for (let i = 1; i <= 12; i++) { await p.mouse.move(r[0] + 12 + i * (r[2] * 0.8 / 12), r[1] + 14 + i * 4); await p.waitForTimeout(25); if (i === 6) await p.screenshot({ path: 'f-pc-drag.png' }); } await p.mouse.up(); await p.waitForTimeout(1500); console.log('pc after drag left→right', await st(p));
    /* click a link inside a page: the cover's "see page 52" */
    await p.keyboard.press('Home'); await p.waitForTimeout(600); await p.click('.pgw .cv-see'); await p.waitForTimeout(900); console.log('pc after cover link', await st(p));
    await p.click('#bZoom'); await p.waitForTimeout(700); console.log('zoom', await st(p), await p.evaluate(() => document.getElementById('clip').style.width)); await p.click('#bZoom'); await p.waitForTimeout(600);
    await p.setViewportSize({ width: 1000, height: 700 }); await p.waitForTimeout(900); console.log('resized', await st(p), await p.evaluate(() => document.getElementById('clip').style.width));
    await p.click('#bToc'); await p.waitForTimeout(300); await p.click('#toc .ls a:nth-child(3)'); await p.waitForTimeout(800); console.log('toc jump', await st(p));
    await p.setViewportSize({ width: 1600, height: 900 }); await p.waitForTimeout(900); await p.click('#nx'); await p.waitForTimeout(430); await p.screenshot({ path: 'f-pc-soft.png' }); await p.waitForTimeout(900); await p.screenshot({ path: 'f-pc-spread.png' }); await p.close(); }
  { const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('http://localhost:8765/issue560/index.html#p-20'); await p.waitForTimeout(2500); console.log('m at', await st(p));
    const sw = async (x1, x2) => { const cdp = await c.newCDPSession(p); const y = 400; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y }] }); for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 8, y }] }); await p.waitForTimeout(20); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1500); };
    await sw(80, 330); console.log('m swipe left→right', await st(p)); await sw(330, 80); console.log('m swipe right→left', await st(p));
    await p.click('#nx'); await p.waitForTimeout(430); await p.screenshot({ path: 'f-m-mid.png' }); await p.waitForTimeout(1000); await p.screenshot({ path: 'f-m-1.png' }); await c.close(); }
  { const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('http://localhost:8765/index.html#flip'); await p.waitForTimeout(3000); await p.screenshot({ path: 'f-site.png' }); await p.close(); }
  await b.close(); })();
