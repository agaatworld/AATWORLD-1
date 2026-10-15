const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto('http://localhost:8765/issue560/index.html#p-6'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => { const s = document.getElementById('stage'), cs = getComputedStyle(s); return [s.className, cs.overflowY, cs.overflowX, s.clientHeight, s.scrollHeight, cs.display, cs.touchAction].join(' | '); }));
  await p.mouse.move(800, 400); await p.mouse.wheel(0, 500); await p.waitForTimeout(600); console.log('after wheel', await p.evaluate(() => document.getElementById('stage').scrollTop));
  await p.evaluate(() => { document.getElementById('stage').scrollTop = 400; }); await p.waitForTimeout(300); console.log('after set', await p.evaluate(() => document.getElementById('stage').scrollTop));
  await b.close(); })();
