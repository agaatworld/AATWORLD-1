const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/index.html#home'); await p.waitForTimeout(2500);
  console.log((await p.evaluate(() => [...document.querySelectorAll('main section')].map(s => s.className + ' | ' + ((s.querySelector('.kick') || {}).textContent || '-') + ' | ' + ((s.querySelector('h2,h1') || {}).textContent || '').slice(0, 40) + ' | rows ' + s.querySelectorAll('.el > *').length))).join('\n'));
  console.log('text check', await p.evaluate(() => ['مقاطع', 'تشغيل الكل', 'معلنو هذا الشهر', 'استكشف', 'التقويم', 'علامات تثقون', 'شركاؤنا', 'عن المجلة', 'نادي الأعمال', 'مجموعة AAT', 'الأشهر الثلاثة'].filter(w => document.body.innerText.includes(w)).join(',') || 'none found'));
  await p.evaluate(async () => { document.querySelectorAll('img[loading]').forEach(i => i.loading = 'eager'); for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0, 0); }); await p.waitForTimeout(1200);
  await p.screenshot({ path: 'h2-full.png', fullPage: true });
  for (const r of ['#exhibitions', '#about', '#club', '#articles', '#article-ar26-2', '#flip']) { await p.goto('http://localhost:8765/index.html' + r); await p.waitForTimeout(1300); console.log(r, await p.evaluate(() => (document.querySelector('main') || document.body).innerText.length)); }
  await p.goto('http://localhost:8765/index.html#exhibitions'); await p.waitForTimeout(1500); console.log(await p.evaluate(() => (document.querySelector('.xc-all') || {}).innerText));
  await b.close(); })();
