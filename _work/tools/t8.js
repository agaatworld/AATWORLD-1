const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [w,h,n] of [[1843,900,'pc'],[390,844,'m']]) { const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:8765/index.html#flip'); await p.waitForTimeout(2500);
    console.log(n, JSON.stringify(await p.evaluate(() => { const r = e => { e = document.querySelector(e); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), getComputedStyle(e).position]; }; return { hdr: r('#hdr'), fbx: r('.fbx'), ifr: r('.fbx iframe'), body: document.body.className, html: document.documentElement.className }; })));
    await p.screenshot({ path: 'flip-' + n + '.png', clip: { x: 0, y: 0, width: w, height: 260 } }); }
  await b.close(); })();
