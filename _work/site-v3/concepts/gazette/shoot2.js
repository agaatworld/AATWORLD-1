const { chromium } = require('/opt/node-tools/node_modules/playwright');
const out = '/home/user/AATWORLD-1/_work/site-v3/concepts/gazette/';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  await page.goto('file://' + out + 'tile-ar.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/claude-0/-home-user/ac4d4ddb-24de-5266-a1be-7cec3105c99f/scratchpad/gz-1366.png' });
  // seal + club column crop at 1920
  const ctx2 = await browser.newContext({ viewport: { width: 1920, height: 950 } });
  const p2 = await ctx2.newPage();
  await p2.goto('file://' + out + 'tile-ar.html', { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(800);
  await p2.evaluate(() => window.scrollTo(0, 520));
  await p2.screenshot({ path: '/tmp/claude-0/-home-user/ac4d4ddb-24de-5266-a1be-7cec3105c99f/scratchpad/gz-1920-b.png' });
  await browser.close();
})();
