// Offline + playback test: load the single HTML from file:// with ALL network blocked, click play, sample the clock.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, offline: true });
  const page = await ctx.newPage();
  const errors = [], ext = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('file:')) ext.push(u); });
  const t0 = Date.now();
  await page.goto('file:///home/user/mawqif_al_miqdad.html');
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  const loadS = (Date.now() - t0) / 1000;
  await page.click('#cover');
  await page.waitForTimeout(4000);
  const st = await page.evaluate(() => document.getElementById('time').textContent);
  await page.screenshot({ path: '/home/user/miqdad_film/qa/offline_playing.png' });
  // toggles
  await page.mouse.move(270, 900); await page.waitForTimeout(200); await page.click('#bSub'); await page.mouse.move(272, 902); await page.click('#bSfx'); await page.waitForTimeout(300);
  const st2 = await page.evaluate(() => document.getElementById('time').textContent);
  console.log(JSON.stringify({ loadS, time_after_4s: st, time2: st2, errors, external_requests: ext }));
  await browser.close();
})();
