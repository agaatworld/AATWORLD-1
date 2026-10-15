const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1688, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2200); await p.screenshot({ path: 'z-home.png' });
  console.log('hdr overflow', await p.evaluate(() => { const n = document.querySelector('.hd-nav'); return n.scrollWidth + ' vs ' + n.clientWidth; }));
  await p.goto('http://localhost:8765/index.html#article-ar26-2'); await p.waitForTimeout(1500); await p.evaluate(() => window.scrollTo(0, 700)); await p.waitForTimeout(500); await p.screenshot({ path: 'z-art.png' });
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(800);
  const h = await p.evaluate(() => { const t = document.querySelector('.ticks'); return t ? 'on home' : null; }); console.log('ticks', h);
  for (const r of ['#turnkey', '#studies', '#club', '#about', '#advertise', '#article-turnkey-projects', '#article-industrial-project-studies']) { await p.goto('http://localhost:8765/index.html' + r); await p.waitForTimeout(900); const n = await p.evaluate(() => document.querySelectorAll('.ticks li').length); if (n) { console.log(r, n); const el = await p.$('.ticks'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await el.screenshot({ path: 'z-ticks.png' }); break; } }
  await p.setViewportSize({ width: 1250, height: 800 }); await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(1200); console.log('hdr@1250', await p.evaluate(() => { const n = document.querySelector('.hd-nav'); return n.scrollWidth + ' vs ' + n.clientWidth; }));
  await b.close(); })();
