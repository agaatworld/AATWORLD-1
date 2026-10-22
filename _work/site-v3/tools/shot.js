#!/usr/bin/env node
/* =============================================================================
   AAT World v3 · tools/shot.js — screenshot one route (architect)
   Usage:
     node tools/shot.js <route> <WxH> <lang> [out.png] [--full] [--click "<css selector>"] [--scroll <px|css selector>] [--wait <ms>]
   Examples:
     node tools/shot.js about 1920x950 ar
     node tools/shot.js contact 390x844 en /tmp/c.png --full
     node tools/shot.js home 390x844 ar --click ".mast-secs"          (the phone "الأقسام" sheet)
     node tools/shot.js home 1366x768 en --click ".mast-globe"        (the language menu)
     node tools/shot.js about 1366x768 ar --scroll "#contact-band"
   Default output: shots/<route>-<lang>-<W>x<H>[-full].png under _work/site-v3/.
   Waits for fonts and every picture (lazy ones forced), freezes animations, prints page errors.
   Server: http://localhost:8790/index.html (override with AAT_BASE=...). LOOK at the PNG (Read it).
============================================================================= */
'use strict';
const path = require('path');
const fs = require('fs');
const { launch, openPage, freeze } = require('./pw');

(async () => {
  const a = process.argv.slice(2);
  const flag = n => { const i = a.indexOf(n); if (i < 0) return null; const v = a[i + 1]; a.splice(i, 2); return v; };
  const has = n => { const i = a.indexOf(n); if (i < 0) return false; a.splice(i, 1); return true; };
  const click = flag('--click'), scroll = flag('--scroll'), wait = +(flag('--wait') || 0), full = has('--full');
  const [route = 'home', size = '1366x768', lang = 'ar', outArg] = a;
  const [w, h] = size.split('x').map(Number);
  const outDir = path.join(__dirname, '..', 'shots');
  if (!outArg) fs.mkdirSync(outDir, { recursive: true });
  const out = outArg || path.join(outDir, `${route.replace(/[^\w.-]/g, '_')}-${lang}-${w}x${h}${full ? '-full' : ''}${click ? '-click' : ''}.png`);
  const browser = await launch();
  const { page, errors } = await openPage(browser, { route, lang, w, h });
  if (click) { await page.click(click); await page.waitForTimeout(350); }
  if (scroll) {
    if (/^\d+$/.test(scroll)) await page.evaluate(y => window.scrollTo(0, y), +scroll);
    else await page.evaluate(s => { const el = document.querySelector(s); if (el) el.scrollIntoView({ block: 'start' }); }, scroll);
    await page.waitForTimeout(250);
  }
  if (wait) await page.waitForTimeout(wait);
  await freeze(page);
  await page.screenshot({ path: out, fullPage: full });
  console.log(out + (errors.length ? '\nERRORS:\n  ' + errors.join('\n  ') : ''));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
