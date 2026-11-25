const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
  await p.goto('file://' + __dirname + '/doc.html', { waitUntil: 'networkidle' }); await p.waitForFunction(() => document.body.getAttribute('data-pages'), null, { timeout: 300000 });
  console.log(await p.evaluate(() => {
    const pgs = [...document.querySelectorAll('.pg')]; const out = [];
    for (const i of [36, 37, 42]) { const pg = pgs[i], b = pg.querySelector('.body'), br = b.getBoundingClientRect();
      let maxb = 0; [...b.children].forEach(c => [...c.getClientRects()].forEach(r => { if (r.height) maxb = Math.max(maxb, r.bottom); }));
      const p0 = b.querySelector('p'); out.push(i + 1 + ' children ' + b.children.length + ' bodyH ' + Math.round(br.height) + ' used ' + Math.round(maxb - br.top) + ' lh ' + b.style.lineHeight + ' font ' + getComputedStyle(p0).fontFamily + ' / ' + getComputedStyle(p0).fontSize + ' scrollW ' + b.scrollWidth + ' clientW ' + b.clientWidth);
    }
    return out.join('\n');
  })); await b.close(); })();
