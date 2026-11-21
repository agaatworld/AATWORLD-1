// node render.js <html-file> ... → ../exports/<dir>/<name>.png   (deviceScaleFactor 2: square 2160², landscape 3840×2160)
// env OUT=previews|final  SCALE=1|2
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = path.join(__dirname, '..', 'exports', process.env.OUT || 'previews');
  fs.mkdirSync(out, { recursive: true });
  const scale = +(process.env.SCALE || 2);
  const b = await chromium.launch();
  const files = process.argv.slice(2);
  const report = [];
  for (const f of files) {
    const ls = f.includes('-ls-');
    const W = ls ? 1920 : 1080, H = 1080;
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
    await p.goto('http://localhost:8777/html/' + path.basename(f));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(250);
    // QC: elements that spill out of the page or overlap the page edge, smallest font used
    const qc = await p.evaluate(() => {
      const W = innerWidth, H = innerHeight, bad = [];
      let minFont = 99, minEl = '';
      for (const el of document.querySelectorAll('.page *')) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cs = getComputedStyle(el);
        const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (hasText) {
          const fs = parseFloat(cs.fontSize);
          if (fs < minFont) { minFont = fs; minEl = el.textContent.trim().slice(0, 30); }
          if (r.right > W + 1 || r.left < -1 || r.bottom > H + 1 || r.top < -1)
            if (!el.closest('.big')) bad.push(el.textContent.trim().slice(0, 40) + ` [${r.left|0},${r.top|0},${r.right|0},${r.bottom|0}]`);
        }
      }
      // text-on-text collisions between different elements
      const boxes = [];
      const tw = document.createTreeWalker(document.querySelector('.page'), NodeFilter.SHOW_TEXT);
      let n; while ((n = tw.nextNode())) {
        if (!n.textContent.trim() || n.parentElement.closest('.big')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) if (r.width > 2) { const h = r.height * .18; boxes.push({ el: n.parentElement, l: r.left, r: r.right, t: r.top + h, b: r.bottom - h, s: n.textContent.trim().slice(0, 22) }); }
      }
      const hits = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i], B = boxes[j];
        if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const ox = Math.min(A.r, B.r) - Math.max(A.l, B.l), oy = Math.min(A.b, B.b) - Math.max(A.t, B.t);
        if (ox > 3 && oy > 3) hits.push(A.s + ' ✕ ' + B.s);
      }
      bad.push(...[...new Set(hits)].slice(0, 12).map(h => 'COLLIDE ' + h));
      const fam = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + f.weight);
      return { bad, minFont, minEl, fam };
    });
    const name = path.basename(f, '.html') + '.png';
    await p.screenshot({ path: path.join(out, name) });
    report.push({ name, errs, ...qc });
    await p.close();
  }
  await b.close();
  for (const r of report) console.log(r.name, '| min', r.minFont, JSON.stringify(r.minEl), '| fonts', r.fam.length, r.errs.length ? '| ERR ' + r.errs.join(' ; ') : '', r.bad.length ? '\n   OUT: ' + r.bad.join('\n   OUT: ') : '');
})();
