// ref-vs-new.png: today's home (1366x768, Arabic) beside the new style tile at the same size, labelled. Run: node compare.js
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const here = __dirname;
const ref = 'file://' + path.join(here, '..', 'gazette', 'ref-home-ar.png');
const neu = 'file://' + path.join(here, 'tile-ar-1366.png');
const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Changa:wght@700;800&family=Readex+Pro:wght@500;600&display=swap">
<style>body{margin:0;background:#E9EEF4;font-family:'Readex Pro',sans-serif;color:#0B2341}
.row{display:flex;gap:36px;padding:28px 36px 36px;direction:ltr}
.col{display:flex;flex-direction:column;gap:14px}
.lab{display:flex;align-items:center;gap:14px;font:800 34px/1.2 Changa,sans-serif;direction:rtl;justify-content:flex-end}
.lab span{font:600 22px/1.3 'Readex Pro',sans-serif;color:#43546B}
.tag{display:inline-block;padding:4px 16px;border-radius:8px;color:#fff;font:800 26px/1.4 Changa,sans-serif}
.old .tag{background:#6B7785}.new .tag{background:#D21F26}
img{display:block;width:1366px;height:768px;border-radius:10px;box-shadow:0 10px 30px rgba(11,35,65,.25)}</style></head>
<body><div class="row">
<div class="col old"><div class="lab"><b class="tag">اليوم</b>الموقع الحالي <span dir="ltr">aatworld.com · 1366×768</span></div><img src="${ref}"></div>
<div class="col new"><div class="lab"><b class="tag">الجديد</b>جسر التجارة <span dir="ltr">Trade Bridge · 1366×768</span></div><img src="${neu}"></div>
</div></body></html>`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 2840, height: 900 } });
  const tmp = path.join(require('os').tmpdir(), 'aat-ref-vs-new.html');
  require('fs').writeFileSync(tmp, html);
  await p.goto('file://' + tmp, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(here, 'ref-vs-new.png'), fullPage: true });
  await b.close();
  console.log('wrote ref-vs-new.png');
})();
