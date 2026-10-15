const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1688, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  const m = async (label, qs) => console.log(label, JSON.stringify(await p.evaluate(qs => qs.map(q => { const e = document.querySelector(q); if (!e) return q + ': none'; const s = getComputedStyle(e); return q + ': ' + s.fontSize + '/w' + s.fontWeight + '/lh' + s.lineHeight + ' <' + e.className + '>'; }), qs), null, 1));
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2000);
  await m('home', ['body', '#hdr nav a', '.hd a', '.h2', '.kick', '.lead', '.ac-b b', '.ac-s', '.nc-b b', '.pc-b b', '.ind-c b', '.ind-c small', '.el b', '#ftr a', '.btn', 'main p']);
  await p.goto('http://localhost:8765/index.html#article-ar26-2'); await p.waitForTimeout(1500);
  await m('article', ['main h1', 'main article p', 'main p', 'main h2', 'main h3', 'main figcaption', 'main article', 'main .wrap > *']);
  console.log(await p.evaluate(() => { const ps = [...document.querySelectorAll('main p')].filter(x => x.textContent.length > 150)[0]; if (!ps) return 'no long p'; const s = getComputedStyle(ps); let chain = []; for (let e = ps; e && e.tagName !== 'MAIN'; e = e.parentElement) chain.push(e.tagName + '.' + e.className); return s.fontSize + ' lh ' + s.lineHeight + ' width ' + Math.round(ps.getBoundingClientRect().width) + ' :: ' + chain.join(' < '); }));
  await b.close(); })();
