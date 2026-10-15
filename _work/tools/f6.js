const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const st = p => p.evaluate(() => document.getElementById('pn').textContent);
  const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html#p-20'); await p.waitForTimeout(2500); console.log('m at', await st(p));
  const cdp = await c.newCDPSession(p);
  const sw = async (x1, x2, n, d, shot) => { const y = 420; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y }] }); for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / n, y }] }); if (d) await p.waitForTimeout(d); if (shot && i === Math.floor(n * .6)) await p.screenshot({ path: shot }); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1600); };
  await sw(80, 330, 2, 0); console.log('fast swipe left→right (expect 21)', await st(p));
  await sw(330, 80, 2, 0); console.log('fast swipe right→left (expect 20)', await st(p));
  await sw(60, 350, 14, 40, 'f-m-drag.png'); console.log('slow drag left→right (expect 21)', await st(p));
  await sw(350, 60, 14, 40); console.log('slow drag right→left (expect 20)', await st(p));
  /* a vertical scroll must not turn the page */
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] }); for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 203, y: 600 - i * 50 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1200); console.log('vertical swipe (expect 20)', await st(p));
  await b.close(); })();
