// Render every frame of the HTML film (24 fps) straight into ffmpeg -> silent H.264, then audio is muxed separately.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const FPS = 24, DUR = 66.4, N = Math.round(DUR * FPS);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file:///home/user/mawqif_al_miqdad.html');
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '/home/user/miqdad_film/video/picture.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    const b64 = await page.evaluate((t) => { window.__renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95).split(',')[1]; }, (i + 0.5) / FPS);
    const ok = ff.stdin.write(Buffer.from(b64, 'base64'));
    if (!ok) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 240 === 0) console.log('frame', i, '/', N);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(JSON.stringify({ frames: N, errors }));
  await browser.close();
})();
