/* Refresh the static copy of the header, the top of the home page and the footer inside index.html
   (what visitors see for a moment before the scripts run, and what search engines read).
   Run from the repo root with the local server on :8765 and Playwright installed:
     node _work/tools/snapshot.js
   It renders the Arabic home page, keeps the header, the hero and the footer, and writes them into index.html. */
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(process.env.PW || 'playwright')); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  await p.goto('http://localhost:8765/#home', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const parts = await p.evaluate(() => {
    const clean = el => {
      const c = el.cloneNode(true);
      c.querySelectorAll('canvas, script, .mz-top, [hidden], .chat, .lang-m, #mnav').forEach(x => x.remove());
      c.querySelectorAll('[class]').forEach(x => { x.classList.remove('pre', 'in', 'rolling', 'scrolled'); });
      c.querySelectorAll('[style]').forEach(x => { if (/font-size/.test(x.getAttribute('style'))) x.style.removeProperty('font-size'); if (!x.getAttribute('style').trim()) x.removeAttribute('style'); });
      return c;
    };
    const app = document.createElement('div'); app.className = 'view';
    const hero = document.querySelector('#app .hero'); if (hero) app.appendChild(clean(hero));
    return { hdr: clean(document.querySelector('#hdr')).innerHTML, app: app.outerHTML, ftr: clean(document.querySelector('#ftr')).innerHTML };
  });
  await b.close();
  let s = fs.readFileSync('index.html', 'utf8');
  const put = (open, close, html) => { const i = s.indexOf(open); const j = s.indexOf(close, i); if (i < 0 || j < 0) throw new Error('not found: ' + open); s = s.slice(0, i + open.length) + html + s.slice(j); };
  put('<header id="hdr">', '</header>', parts.hdr);
  put('<main id="app" tabindex="-1">', '</main>', parts.app);
  put('<footer id="ftr">', '</footer>', parts.ftr);
  fs.writeFileSync('index.html', s);
  console.log('index.html static copy refreshed:', parts.hdr.length, parts.app.length, parts.ftr.length, 'characters');
})();
