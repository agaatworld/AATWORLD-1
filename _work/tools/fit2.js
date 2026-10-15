const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 860, height: 1300 } });
  await p.goto('http://localhost:8765/issue560/index.html#p-6'); await p.waitForTimeout(2500);
  for (const [W, lh, pad] of [[290, 1.7, 34], [262, 1.7, 30], [262, 1.62, 28], [240, 1.62, 26]]) console.log(W, lh, await p.evaluate(async ([W, lh, pad]) => { await document.fonts.ready; const sh = document.getElementById('p-6'), sig = sh.querySelector('.sig'), fo = sh.querySelector('.folio'), body = sh.querySelector('.body'), rail = sh.querySelector('.rail'), ed = sh.querySelector('.ed'), ttl = sh.querySelector('.ttl');
    rail.style.width = W + 'px'; body.style.right = W + 'px'; body.style.padding = '0 ' + pad + 'px 60px ' + pad + 'px'; ttl.style.marginLeft = -pad + 'px'; ttl.style.marginTop = '28px'; ed.style.setProperty('line-height', lh, 'important'); ed.style.marginTop = '12px';
    for (let fs = 20; fs >= 13; fs -= 0.25) { sh.style.setProperty('--edfs', fs + 'px'); if (sig.offsetTop + sig.offsetHeight <= fo.offsetTop - 8) return 'FIT ' + fs; } return 'none'; }, [W, lh, pad]));
  await b.close(); })();
