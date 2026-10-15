const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  console.log(await p.evaluate(async () => { const fs = { U4: ['assets/fonts/aljazeera-regular.ttf', 400], U7: ['assets/fonts/aljazeera-bold.ttf', 700] }; for (const k in fs) { const f = new FontFace(k, 'url(' + fs[k][0] + ')'); await f.load(); document.fonts.add(f); }
    const c = document.createElement('canvas').getContext('2d'); const S = ['قبل أن يبلغ العشرين من عمره', 'المجلة التجارية العربية الآسيوية', 'ء ة ك ي ه ع غ ف ق ص ض ط ظ', '0123456789', 'لا إله ـــ ﷲ']; const r = {};
    for (const k in fs) { c.font = '400 100px ' + k; r[k] = S.map(s => { const m = c.measureText(s); return Math.round(m.width * 100) / 100 + '/' + Math.round(m.actualBoundingBoxAscent) + '/' + Math.round(m.actualBoundingBoxDescent); }); } return JSON.stringify(r); }));
  await b.close(); })();
