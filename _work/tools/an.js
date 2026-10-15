const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(3000);
  console.log(await p.evaluate(() => { const m = {}; document.getAnimations().forEach(a => { if (a.playState !== 'running') return; const e = a.effect && a.effect.target; if (!e) return; const it = a.effect.getComputedTiming().iterations; const k = (a.animationName || 'transition/waapi') + ' | ' + (e.tagName + '.' + String(e.className.baseVal ?? e.className).slice(0, 40)) + ' | iter=' + it + ' | pos=' + getComputedStyle(e).position + ' | ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height); m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(x => x[1] + '× ' + x[0]).join('\n'); }));
  await b.close(); })();
