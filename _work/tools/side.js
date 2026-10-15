const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html#p-1'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(async () => { await document.fonts.ready; const sh = document.getElementById('p-1'), box = sh.querySelector('.cv-side'), sp = box.querySelector('span'); for (let fs = 44; fs >= 20; fs -= 0.5) { sh.style.setProperty('--sidefs', fs + 'px'); if (sp.offsetHeight <= box.clientHeight - 30 && sp.offsetWidth <= box.clientWidth - 8) return 'FIT ' + fs + ' span ' + sp.offsetHeight + 'x' + sp.offsetWidth + ' box ' + box.clientHeight + 'x' + box.clientWidth; } return 'none'; }));
  console.log('view', await p.evaluate(() => document.getElementById('clip').style.width + ' x ' + document.getElementById('clip').style.height + ' single ' + document.getElementById('stage').className));
  await b.close(); })();
