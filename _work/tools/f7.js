const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html#p-20'); await p.waitForTimeout(2500);
  await p.evaluate(() => { window.L = []; const P = AATFlip, f = P.flipController; ['startUserTouch', 'userMove', 'userStop'].forEach(n => { const o = P[n].bind(P); P[n] = function (a, b2) { L.push(n + ':' + Math.round(a.x) + (b2 === undefined ? '' : ',' + b2) + ' st=' + P.getState() + ' ut=' + P.isUserTouch); return o(a, b2); }; }); ['fold', 'start', 'stopMove'].forEach(n => { const o = f[n].bind(f); f[n] = function (a) { let r; try { r = o(a); } catch (e) { L.push(n + ' EXC ' + e.message); throw e; } L.push(n + '→' + r + ' calc=' + !!f.calc); return r; }; }); window.addEventListener('touchmove', e => L.push('tm cancelable=' + e.cancelable), true); });
  const cdp = await c.newCDPSession(p); const y = 420;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 60, y }] }); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 60 + 29 * i, y }] }); await p.waitForTimeout(45); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1400);
  console.log((await p.evaluate(() => L)).join('\n'));
  await b.close(); })();
