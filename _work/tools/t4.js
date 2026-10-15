const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
  console.log(await p.evaluate(() => { const A = window.AAT || window.App || null; const IS = window.AAT_ISSUE; const B = window.AAT_BRAND;
    return IS.ads.map(x => { const br = B[x.page]; const blob = br ? JSON.stringify(br).toLowerCase() : ''; const tok = x.company.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !['ltd','inc','corp','company','the','and','factory','machinery','industrial','enterprise','industry','technologies','international','group','sdn','bhd'].includes(w)); const dom = (x.web||'').replace(/^https?:\/\/(www\.)?/,'').split(/[\/.]/)[0].toLowerCase(); const hit = tok.some(w => blob.includes(w)) || (dom && blob.includes(dom));
      return x.page + ' ' + x.company + ' | ' + (br ? (br.m ? 'pages' : 'colors') : 'none') + ' | ' + (br && br.m ? (hit ? 'ok' : 'MISMATCH ' + (br.h||'')) : ''); }).join('\n'); }));
  await b.close();
})();
