// node tools/still.mjs <compId> <out-dir> <frame,frame,...>   quick stills for checking
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer'; import path from 'path';
const [id, out, frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
for (const cid of id.split(',')) {
  const comp = await selectComposition({ serveUrl, id: cid, browserExecutable });
  for (const f of frames.split(',').map(Number)) {
    const fr = f < 0 ? comp.durationInFrames + f : f;
    await renderStill({ composition: comp, serveUrl, output: path.join(out, `${cid}_${String(fr).padStart(3, '0')}.png`), frame: fr, browserExecutable, imageFormat: 'png', scale: 0.5 });
  }
}
console.log('ok');
