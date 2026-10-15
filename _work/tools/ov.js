const { chromium } = require('playwright');
const FLOOR = +(process.argv[2] || 13);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 860, height: 1300 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/issue560/index.html'); await p.waitForTimeout(3000);
  const r = await p.evaluate(async FLOOR => { await document.fonts.ready; document.querySelectorAll('.pgw').forEach(w => { w.style.display = 'block'; w.style.position = 'absolute'; w.style.transform = 'none'; w.style.clipPath = 'none'; }); document.querySelectorAll('.sheet').forEach(s => s.style.transform = 'none');
    function scan(sh) { const R = sh.getBoundingClientRect(); let bad = 0; const els = sh.querySelectorAll('*'); for (const e of els) { if (!e.firstChild) continue; let hasText = false; for (const c of e.childNodes) if (c.nodeType === 3 && c.nodeValue.trim().length > 1) { hasText = true; break; } if (!hasText) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const r = e.getBoundingClientRect(); if (!r.width) continue;
        if (r.bottom > R.bottom + 3 || r.right > R.right + 3 || r.left < R.left - 3) { bad++; continue; }
        if ((cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis') && (e.scrollHeight > e.clientHeight + 3 || e.scrollWidth > e.clientWidth + 3)) { bad++; continue; }
        for (let a = e.parentElement; a && a !== sh; a = a.parentElement) { const as = getComputedStyle(a); if (as.overflowY !== 'visible') { const ar = a.getBoundingClientRect(); if (r.bottom > ar.bottom + 3) { bad++; } break; } } } return bad; }
    const sheets = [...document.querySelectorAll('.sheet')]; const base = sheets.map(scan);
    sheets.forEach(sh => { sh.querySelectorAll('*').forEach(e => { let hasText = false; for (const c of e.childNodes) if (c.nodeType === 3 && c.nodeValue.trim().length > 1) { hasText = true; break; } if (!hasText) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < FLOOR) e.style.setProperty('font-size', FLOOR + 'px', 'important'); }); });
    const after = sheets.map(scan); return sheets.map((s, i) => [s.getAttribute('data-p'), s.className.replace(/sheet|odd|even/g, '').trim(), base[i], after[i]]); }, FLOOR);
  const worse = r.filter(x => x[3] > x[2]); console.log('floor', FLOOR, 'sheets with baseline overflow:', r.filter(x => x[2]).map(x => x[0] + '(' + x[2] + ')').join(' '));
  console.log('worse after floor:', worse.map(x => 'p' + x[0] + ' ' + x[1] + ' ' + x[2] + '→' + x[3]).join(' | ') || 'none');
  await b.close(); })();
