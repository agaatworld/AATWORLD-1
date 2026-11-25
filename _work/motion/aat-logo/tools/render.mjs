// Renders the AAT motion identity.  node tools/render.mjs [filter-regex]
//   out/<concept>/<id>.mp4        H.264, silent (crf 16)
//   out/<concept>/<id>_sfx.mp4    same picture + sound effects (AAC 256k), no music
//   out/<concept>/sfx/<id>.wav    the sound effects alone (48 kHz 24-bit)
//   out/alpha/<id>.mov            ProRes 4444 with alpha (intros; selected list below)
//   out/frames/<concept>-<aspect>.png (+ -alpha.png)   final logo frame
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import fs from 'fs'; import path from 'path';
import { ASPECTS, CONCEPTS, DUR, cues } from '../src/timeline.js';

const filter = new RegExp(process.argv[2] || '.');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = path.resolve('out'); fs.mkdirSync(OUT, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const jobs = [];
for (const c of CONCEPTS) for (const mode of ['intro', 'outro']) for (const dur of Object.keys(DUR)) for (const a of Object.keys(ASPECTS)) jobs.push({ id: `${c}-${mode}-${dur}-${a}`, c, mode, dur });
for (const a of Object.keys(ASPECTS)) jobs.push({ id: `c6-transition-short-${a}`, c: 'c6', mode: 'outro', dur: 'short', tr: true });
const ALPHA = ['16x9', '1x1', '9x16'].flatMap((a) => CONCEPTS.map((c) => `${c}-intro-std-${a}-alpha`)).concat(['16x9', '9x16'].map((a) => `c1-intro-short-${a}-alpha`));

const t0 = Date.now();
for (const j of jobs.filter((j) => filter.test(j.id))) {
  const dir = path.join(OUT, j.c); fs.mkdirSync(path.join(dir, 'sfx'), { recursive: true });
  const mp4 = path.join(dir, `${j.id}.mp4`);
  if (!fs.existsSync(mp4)) {
    const composition = await selectComposition({ serveUrl, id: j.id, browserExecutable });
    await renderMedia({ composition, serveUrl, codec: 'h264', crf: 16, outputLocation: mp4, browserExecutable, muted: true, concurrency: 4, imageFormat: 'jpeg', jpegQuality: 95, x264Preset: 'slow', pixelFormat: 'yuv420p' });
  }
  const D = DUR[j.dur]; const q = j.tr ? [{ t: 0.02, type: 'whoosh', len: D * 0.4, level: 0.8 }, { t: D * 0.3, type: 'tick', level: 0.5 }, { t: D * 0.55, type: 'whoosh', len: D * 0.4, level: 0.6 }] : cues(j.c, j.mode, j.dur);
  const cj = path.join(dir, 'sfx', `${j.id}.json`); fs.writeFileSync(cj, JSON.stringify({ dur: D, cues: q }));
  const wav = path.join(dir, 'sfx', `${j.id}.wav`);
  execFileSync('python3', ['tools/sfx.py', cj, wav]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(dir, `${j.id}_sfx.mp4`)]);
  console.log(j.id, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
if (filter.test('alpha')) {
  fs.mkdirSync(path.join(OUT, 'alpha'), { recursive: true });
  for (const id of ALPHA) {
    const out = path.join(OUT, 'alpha', `${id}.mov`); if (fs.existsSync(out)) continue;
    const composition = await selectComposition({ serveUrl, id, browserExecutable });
    await renderMedia({ composition, serveUrl, codec: 'prores', proResProfile: '4444', imageFormat: 'png', pixelFormat: 'yuva444p10le', outputLocation: out, browserExecutable, muted: true, concurrency: 4 });
    console.log(id);
  }
}
if (filter.test('frames')) {
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
  for (const c of CONCEPTS) for (const a of Object.keys(ASPECTS)) for (const al of [false, true]) {
    const id = `${c}-intro-std-${a}${al ? '-alpha' : ''}`; const composition = await selectComposition({ serveUrl, id, browserExecutable });
    await renderStill({ composition, serveUrl, frame: composition.durationInFrames - 1, output: path.join(OUT, 'frames', `${c}-${a}${al ? '-alpha' : ''}.png`), browserExecutable, imageFormat: 'png' });
  }
  console.log('frames');
}
