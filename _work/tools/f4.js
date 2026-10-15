const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 800 }, hasTouch: true });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => { AATFlip.turnToPage(50); window.L = []; AATFlip.on('changeState', e => L.push(e.data)); AATFlip.on('flip', e => L.push('flip' + e.data)); AATFlip.flipPrev('top'); });
  await p.waitForTimeout(400); await p.screenshot({ path: 'f-m-mid.png' }); await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => L.join(',') + ' idx ' + AATFlip.getCurrentPageIndex() + ' src ' + AATFlip.flipController.flipPrev.toString().slice(0, 80)));
  console.log(await p.evaluate(() => AATFlip.flipController.flip.toString().slice(0, 700)));
  await b.close(); })();
