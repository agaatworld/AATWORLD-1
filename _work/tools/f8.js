const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html#p-20'); await p.waitForTimeout(2500);
  await p.evaluate(() => { window.L = []; const f = AATFlip.flipController; const o = f.stopMove.bind(f); f.stopMove = function () { if (f.calc) L.push('dir=' + f.calc.getDirection() + ' x=' + Math.round(f.calc.getPosition().x) + ' pw=' + f.getBoundsRect().pageWidth); return o(); }; });
  const cdp = await c.newCDPSession(p); const y = 420;
  for (const [x1, x2] of [[60, 350], [350, 60], [60, 200], [350, 200]]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y }] }); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 10, y }] }); await p.waitForTimeout(45); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1500); await p.evaluate(a => L.push(a + ' → ' + document.getElementById('pn').textContent), x1 + '→' + x2); }
  console.log((await p.evaluate(() => L)).join('\n'));
  await b.close(); })();
