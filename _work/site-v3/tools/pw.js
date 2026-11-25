/* =============================================================================
   AAT World v3 · tools/pw.js — shared Playwright helpers for shot.js and check.js (architect)
============================================================================= */
'use strict';
const path = require('path');
const fs = require('fs');
let playwright;
for (const p of ['/opt/node-tools/node_modules/playwright', path.join(__dirname, 'node_modules', 'playwright'), 'playwright']) {
  try { playwright = require(p); break; } catch (e) { /* try next */ }
}
if (!playwright) { console.error('Playwright not found: npm i playwright in ' + __dirname); process.exit(2); }
const BASE = process.env.AAT_BASE || 'http://localhost:8790/index.html';

async function launch() {
  return playwright.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
}
/** url for a route + language: index.html?lang=en#about */
function urlFor(route, lang, base) {
  return (base || BASE) + (lang && lang !== 'ar' ? '?lang=' + encodeURIComponent(lang) : '') + '#' + String(route || 'home').replace(/^#/, '');
}
/** open a page at WxH, collect errors, wait for fonts + every picture (lazy ones forced), optionally scroll through */
async function openPage(browser, { route, lang, w, h, base, scrollThrough = true }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { const u = (m.location() || {}).url || ''; if (m.type() === 'error' && !/favicon/.test(u)) errors.push('console: ' + m.text() + ' ' + u); });
  page.on('requestfailed', r => /favicon/.test(r.url()) || errors.push('requestfailed: ' + r.url() + ' ' + ((r.failure() && r.failure().errorText) || '')));
  await page.goto(urlFor(route, lang, base), { waitUntil: 'load' });
  await settle(page, scrollThrough);
  return { ctx, page, errors };
}
async function settle(page, scrollThrough) {
  if (scrollThrough) {
    await page.evaluate(async () => {
      const H = () => document.documentElement.scrollHeight;
      for (let y = 0; y < H(); y += Math.max(400, innerHeight * 0.8)) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
  }
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; });
    const imgs = Array.from(document.images).map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); }));
    await Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0].concat(imgs)), new Promise(r => setTimeout(r, 8000))]);
  });
  await page.waitForTimeout(300);
}
/** freeze animations so screenshots are stable */
async function freeze(page) {
  await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;animation-delay:-1s!important;transition:none!important;caret-color:transparent!important}' });
}
module.exports = { launch, urlFor, openPage, settle, freeze, BASE };
