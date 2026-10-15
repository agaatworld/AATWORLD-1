const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1687, height: 876 } });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3000);
  console.log(JSON.stringify(await p.evaluate(() => {
    const out=[];
    document.querySelectorAll('*').forEach(e=>{
      for (const ps of [null,'::before','::after']) { const s=getComputedStyle(e,ps); const fs=parseFloat(s.fontSize);
        const txt = ps? s.content : (e.childElementCount===0?e.textContent.trim():'');
        if (fs>150 && txt && txt!=='none') out.push([e.tagName, e.className, ps, txt.slice(0,20), fs, s.opacity, s.color, e.getAttribute('data-n')||'']); }
    }); return out; }),null,0));
  await b.close();
})();
