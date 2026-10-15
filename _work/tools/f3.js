const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 800 }, hasTouch: true });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => { const P = AATFlip; P.turnToPage(50); const f = P.flipController, r = P.render.getRect(); const out = [JSON.stringify(r), JSON.stringify(P.render.convertToBook({x:10,y:1}))];
    const pc = P.getPageCollection(); out.push('spreadIdx ' + pc.currentSpreadIndex + ' pageIdx ' + pc.currentPageIndex);
    try { const fp = pc.getFlippingPage(1); out.push('fp ok ' + !!fp); const bp = pc.getBottomPage(1); out.push('bp ok ' + !!bp); } catch (e) { out.push('EXC ' + e.message); }
    out.push('dir ' + f.getDirectionByPoint(P.render.convertToBook({x:10,y:1})) + ' start ' + f.start({x:10,y:1}) + ' calc ' + (f.calc ? f.calc.getDirection() : null));
    return out.join('\n'); }));
  await b.close(); })();
