const { chromium } = require('/opt/node-tools/node_modules/playwright'); const D = __dirname;
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
  await p.goto('file://' + D + '/youtube.html', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  console.log(await p.evaluate(() => ['.names', '.tag', '.box'].map(s => { const e = document.querySelector(s), r = document.createRange(); r.selectNodeContents(e); const q = s === '.box' ? e.getBoundingClientRect() : r.getBoundingClientRect(); return s + ' x' + Math.round(q.left) + '-' + Math.round(q.right) + ' y' + Math.round(q.top) + '-' + Math.round(q.bottom); }).join(' | ')));
  await p.screenshot({ path: D + '/AAT-youtube-banner-2560x1440.png', type: 'png' });
  await p.evaluate(() => document.getElementById('g').hidden = false); await p.screenshot({ path: D + '/yt-guides.png' });
  await b.close(); })();
