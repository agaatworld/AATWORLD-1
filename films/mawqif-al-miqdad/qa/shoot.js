// Render stills from the film in real Chromium. usage: node shoot.js <url> <outdir> t1 t2 ...  (or "all" = every 0.5 s)
const { chromium } = require('playwright');
(async () => {
  const [url, outdir, ...ts] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 1 });
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', r => { const u = r.url(); if (!u.startsWith('data:')) requests.push(u); });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  let times = ts;
  if (ts[0] === 'all') { times = []; for (let t = 0.25; t < 66.4; t += 0.5) times.push(t.toFixed(2)); }
  const fs = require('fs'); fs.mkdirSync(outdir, { recursive: true });
  for (const t of times) {
    const data = await page.evaluate((tt) => { window.__renderAt(parseFloat(tt)); return document.getElementById('c').toDataURL('image/jpeg', 0.86); }, t);
    fs.writeFileSync(`${outdir}/t_${String(parseFloat(t).toFixed(2)).padStart(6, '0')}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log(JSON.stringify({ errors, requests: requests.slice(0, 20), nreq: requests.length }));
  await browser.close();
})();
