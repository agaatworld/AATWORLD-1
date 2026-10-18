/* Clawd engine: utilities, sound, pixel faces, 3D box renderer, tools, particles, world physics.
   Everything is drawn on one canvas. Character parts are boxes ("cuboids") projected orthographically,
   so the same model looks flat 2D from the front and turns into real 3D when it yaws, flips or is seen from above. */
(function () {
'use strict';
const CL = (window.CL = window.CL || {});
const M = Math, PI = M.PI, TAU = PI * 2;
const rnd = (a, b) => a + M.random() * (b - a);
const pick = (a) => a[(M.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - M.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - M.pow(-2 * t + 2, 3) / 2);
const wrap = (a) => { a %= TAU; if (a > PI) a -= TAU; if (a < -PI) a += TAU; return a; };
const chance = (p) => M.random() < p;
CL.u = { rnd, pick, clamp, lerp, easeOut, easeIn, easeInOut, wrap, chance, PI, TAU };

/* ---------------------------------------------------------------- storage + no-repeat bags */
CL.store = function (k, v) {
  try {
    if (v === undefined) { const s = localStorage.getItem('clawd.' + k); return s == null ? null : JSON.parse(s); }
    localStorage.setItem('clawd.' + k, JSON.stringify(v));
  } catch (e) { return null; }
};
let bags = CL.store('bags') || {}, bagTimer = 0;
/* returns 0..n-1; every index comes once before any repeats, across app restarts */
CL.bag = function (key, n) {
  if (n <= 1) return 0;
  let st = bags[key];
  if (!st || st.n !== n || !Array.isArray(st.o)) st = bags[key] = { n: n, o: [], i: 0 };
  if (st.i >= st.o.length) {
    const last = st.o[st.o.length - 1];
    const o = []; for (let i = 0; i < n; i++) o.push(i);
    for (let i = n - 1; i > 0; i--) { const j = (M.random() * (i + 1)) | 0; const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (o[0] === last) { const j = 1 + ((M.random() * (n - 1)) | 0); o[0] = o[j]; o[j] = last; }
    st.o = o; st.i = 0;
  }
  const r = st.o[st.i++];
  clearTimeout(bagTimer); bagTimer = setTimeout(() => CL.store('bags', bags), 1500);
  return r;
};
CL.pickBag = (key, arr) => arr[CL.bag(key, arr.length)];

/* ---------------------------------------------------------------- springs + generator helpers */
class Spring {
  constructor(v, k, c) { this.v = v; this.t = v; this.vel = 0; this.k = k; this.c = c; }
  step(dt) { const a = -this.k * (this.v - this.t) - this.c * this.vel; this.vel += a * dt; this.v += this.vel * dt; }
  set(v) { this.v = this.t = v; this.vel = 0; }
}
CL.Spring = Spring;
CL.wait = function* (s) { let t = 0; while (t < s) t += yield; };
CL.tween = function* (s, fn, ease) { let t = 0; fn(0); while (t < s) { t += yield; const k = M.min(1, t / s); fn(ease ? ease(k) : k); } };
CL.until = function* (pred, max) { let t = 0; max = max || 30; while (!pred() && t < max) t += yield; };
CL.all = function* () { // run generators side by side until all finish
  const gs = [].slice.call(arguments).filter(Boolean); gs.forEach((g) => g.next(0));
  let live = gs.slice();
  while (live.length) { const dt = yield; live = live.filter((g) => !g.next(dt).done); }
};

/* ---------------------------------------------------------------- sound */
const SND = (CL.snd = { on: true, ctx: null, master: null, noise: null });
function ac() {
  if (!SND.on) return null;
  if (!SND.ctx) {
    try { SND.ctx = new (window.AudioContext || window.webkitAudioContext)(); SND.master = SND.ctx.createGain(); SND.master.gain.value = 0.5; SND.master.connect(SND.ctx.destination); }
    catch (e) { SND.ctx = null; }
  }
  if (SND.ctx && SND.ctx.state === 'suspended') SND.ctx.resume();
  return SND.ctx;
}
function tone(f0, f1, dur, type, vol, delay) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(M.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(SND.master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol, freq, delay, q, type) {
  const a = ac(); if (!a) return;
  if (!SND.noise) { SND.noise = a.createBuffer(1, a.sampleRate * 0.6, a.sampleRate); const d = SND.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = M.random() * 2 - 1; }
  const t = a.currentTime + (delay || 0), s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = SND.noise; f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq || 1200, t); f.Q.value = q || 1;
  g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(SND.master); s.start(t); s.stop(t + dur + 0.02);
}
CL.sfx = {
  bonk: () => { tone(520, 140, 0.09, 'square', 0.22); noise(0.06, 0.35, 1800); },
  heavy: (p) => { tone(220, 50, 0.25 + p * 0.15, 'square', 0.3); noise(0.18, 0.5, 600); tone(160, 40, 0.3, 'sine', 0.4); },
  mega: () => { tone(180, 30, 0.5, 'sawtooth', 0.3); noise(0.4, 0.6, 400); tone(90, 30, 0.6, 'sine', 0.5); },
  puff: () => { noise(0.25, 0.35, 500, 0, 0.5, 'lowpass'); },
  squeak: () => { tone(900, 1500, 0.08, 'square', 0.18); tone(1500, 700, 0.12, 'square', 0.15, 0.08); },
  punch: () => { noise(0.1, 0.5, 300, 0, 0.8, 'lowpass'); tone(120, 60, 0.12, 'sine', 0.4); },
  splash: () => { noise(0.4, 0.45, 2500, 0, 0.4); noise(0.3, 0.3, 900, 0.05); },
  crunch: () => { noise(0.12, 0.4, 3500, 0, 2); noise(0.1, 0.3, 1500, 0.04, 2); },
  tickle: () => { for (let i = 0; i < 3; i++) noise(0.05, 0.12, 5000, i * 0.06, 3); },
  boing: () => { const a = ac(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), g = a.createGain(), l = a.createOscillator(), lg = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(520, t + 0.35);
    l.frequency.value = 18; lg.gain.value = 60; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(SND.master); o.start(t); l.start(t); o.stop(t + 0.52); l.stop(t + 0.52); },
  whiff: () => { noise(0.22, 0.25, 900, 0, 0.6); noise(0.18, 0.2, 2400, 0.05, 0.8); },
  swish: () => noise(0.08, 0.12, 3000, 0, 0.7),
  ding: () => { tone(1320, 1300, 0.5, 'triangle', 0.25); tone(1320, 1300, 0.5, 'triangle', 0.25, 0.28); },
  ko: () => [660, 520, 400, 300].forEach((f, i) => tone(f, f * 0.97, 0.16, 'square', 0.16, i * 0.14)),
  up: () => [400, 500, 640, 820].forEach((f, i) => tone(f, f * 1.02, 0.1, 'square', 0.15, i * 0.07)),
  pop: () => tone(300, 900, 0.07, 'sine', 0.25),
  click: () => tone(1800, 1700, 0.02, 'square', 0.06),
  page: () => noise(0.12, 0.15, 4000, 0, 0.5, 'highpass'),
  jump: () => tone(260, 620, 0.12, 'square', 0.1),
  land: () => { tone(110, 60, 0.08, 'square', 0.18); noise(0.06, 0.2, 400); },
  flip: () => noise(0.18, 0.12, 1800, 0, 0.6),
  kiai: () => { tone(330, 220, 0.12, 'sawtooth', 0.12); noise(0.08, 0.25, 900); },
  charge: (c) => tone(200 + c * 500, 210 + c * 520, 0.06, 'triangle', 0.07),
  catch: () => { tone(700, 300, 0.06, 'square', 0.15); noise(0.05, 0.3, 2000); },
  throwAway: () => { noise(0.3, 0.2, 1500, 0, 0.5); tone(500, 200, 0.3, 'triangle', 0.1); },
  voice: (mood, n) => {
    const base = { scared: 620, angry: 210, sad: 300, happy: 520, hurt: 440, calm: 400, serious: 260 }[mood] || 420;
    for (let i = 0; i < n; i++) { const f = base * rnd(0.85, 1.25); tone(f, f * rnd(0.8, 1.3), 0.055, mood === 'angry' ? 'sawtooth' : 'square', 0.06, i * 0.075); }
  },
  giggle: () => { for (let i = 0; i < 5; i++) { const f = 700 + i * 40 + rnd(-30, 30); tone(f, f * 1.25, 0.06, 'square', 0.08, i * 0.09); } },
  stomp: () => { tone(90, 50, 0.12, 'square', 0.25); noise(0.08, 0.3, 300); },
  bell: () => { tone(880, 870, 0.6, 'sine', 0.15); tone(1320, 1310, 0.5, 'sine', 0.08, 0.02); },
  chime: () => [880, 1100, 1320].forEach((f, i) => tone(f, f, 0.3, 'sine', 0.08, i * 0.09))
};

/* ---------------------------------------------------------------- colours */
const shadeCache = {};
function hex2rgb(h) { const p = parseInt(h.slice(1), 16); return [(p >> 16) & 255, (p >> 8) & 255, p & 255]; }
function shade(hex, b) { // b = brightness factor (1 = as is)
  const q = M.round(b * 40) / 40, key = hex + q;
  let s = shadeCache[key]; if (s) return s;
  const c = hex2rgb(hex);
  const f = (v) => (q <= 1 ? v * q : v + (255 - v) * (q - 1) * 0.9) | 0;
  s = shadeCache[key] = 'rgb(' + f(c[0]) + ',' + f(c[1]) + ',' + f(c[2]) + ')';
  return s;
}
function mixHex(a, b, t) {
  if (t <= 0.01) return a; if (t >= 0.99) return b;
  const x = hex2rgb(a), y = hex2rgb(b), q = M.round(t * 20) / 20;
  const h = (v) => ('0' + (v | 0).toString(16)).slice(-2);
  return '#' + h(lerp(x[0], y[0], q)) + h(lerp(x[1], y[1], q)) + h(lerp(x[2], y[2], q));
}
CL.shade = shade; CL.mixHex = mixHex;
const COL = (CL.COL = {
  orange: '#D97757', orangeL: '#EE9C80', red: '#D9443A', ink: '#141413', white: '#FFFFFF',
  yellow: '#FFD43B', blue: '#5BB8F5', pink: '#F28B9A', robe: '#F4F1EA', cap: '#FBFAF6', gold: '#C9A227',
  wood: '#8A5A2E', woodL: '#B9824A', woodD: '#5A3818', grip: '#EADCC5', gripD: '#C9B596',
  friend: '#4F8FD6', visor: '#1B2340', led: '#7DF9FF', green: '#2E7D4F', mushaf: '#1F6B45', paper: '#F6EEDB',
  ice: '#A9D8F0', wet: '#9A5A48'
});

/* ---------------------------------------------------------------- pixel glyphs (face parts), drawn in face units */
const G = {
  sq: ['####', '####', '####', '####'],
  blink: ['####'],
  half: ['####', '####'],
  squint: ['####', '####'],
  small: ['##', '##'],
  dot: ['##', '##'],
  gt: ['##..', '.##.', '..##', '.##.', '##..'],
  lt: ['..##', '.##.', '##..', '.##.', '..##'],
  x: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  happy: ['..#..', '.#.#.', '#...#'],
  sadArc: ['#...#', '.#.#.', '..#..'],
  line: ['#####'],
  shut: ['#####', '.###.'],
  heart: ['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'],
  wide: ['.###.', '#####', '##w##', '#####', '.###.'],
  big: ['.###.', '#ww##', '#w###', '#####', '.###.'],
  white: ['.###.', '#www#', '#w#w#', '#www#', '.###.'],
  star: ['..y..', 'yyyyy', '.yyy.', 'y...y'],
  spiral: ['#####', '#...#', '#.#.#', '#.###', '#....'],
  sleepy: ['#...#', '.###.']
};
const MOUTH = {
  o: ['.##.', '####', '####', '.##.'],
  O: ['.###.', '#####', '#####', '#####', '.###.'],
  os: ['##', '##'],
  smile: ['#....#', '.####.'],
  smiles: ['#..#', '.##.'],
  grin: ['#......#', '.######.', '..####..'],
  flat: ['#####'],
  frown: ['.####.', '#....#'],
  smirk: ['....#', '####.'],
  cat: ['#.#.#', '.#.#.'],
  tongue: ['######', '..rr..', '..rr..'],
  teeth: ['######', '#w#w##', '######'],
  waveA: ['.#..#.', '#.##.#'],
  waveB: ['#.##.#', '.#..#.']
};
const GC = { '#': COL.ink, r: COL.red, w: '#fff', y: COL.yellow, b: COL.blue };
function glyph(ctx, rows, cx, cy, s, col) {
  const h = rows.length, w = rows[0].length, x0 = cx - (w * s) / 2, y0 = cy - (h * s) / 2;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const c = rows[j][i]; if (c === '.') continue;
    ctx.fillStyle = col || GC[c] || COL.ink; ctx.fillRect(x0 + i * s, y0 + j * s, s + 0.03, s + 0.03);
  }
}
CL.glyph = glyph;
const STAR = ['..y..', '.yyy.', 'yyyyy', '.yyy.', '.y.y.'];
const DROP = ['.b.', 'bbb', 'bbb', '.b.'];
const HEART = ['.r.r.', 'rrrrr', '.rrr.', '..r..'];
CL.STAR = STAR; CL.DROP = DROP; CL.HEART = HEART;

/* facial expressions: eyes L/R, brows, mouth, extras, look offset */
const FACES = (CL.FACES = {
  normal: { L: 'sq', R: 'sq' },
  happy: { L: 'happy', R: 'happy', m: 'smile' },
  laugh: { L: 'happy', R: 'happy', m: 'O' },
  joy: { L: 'happy', R: 'happy', m: 'grin', ex: ['blush'] },
  crylaugh: { L: 'happy', R: 'happy', m: 'O', ex: ['tears'] },
  sad: { L: 'sq', R: 'sq', b: 'sad', m: 'frown' },
  cry: { L: 'sadArc', R: 'sadArc', b: 'sad', m: 'wave', ex: ['tears'] },
  angry: { L: 'half', R: 'half', b: 'angry', m: 'flat', ex: ['vein'] },
  furious: { L: 'half', R: 'half', b: 'angry', m: 'teeth', ex: ['vein'] },
  surprised: { L: 'wide', R: 'wide', m: 'o' },
  shocked: { L: 'white', R: 'white', m: 'O' },
  scared: { L: 'dot', R: 'dot', b: 'worried', m: 'wave', ex: ['sweat'] },
  sideeye: { L: 'half', R: 'half', b: 'flat', look: { x: 1, y: 0.2 } },
  sideeyeL: { L: 'half', R: 'half', b: 'flat', look: { x: -1, y: 0.2 } },
  bored: { L: 'half', R: 'half', b: 'flat', m: 'flat' },
  puzzled: { L: 'sq', R: 'small', b: 'raise', m: 'smirk' },
  skeptical: { L: 'squint', R: 'sq', b: 'raise', m: 'flat' },
  suspicious: { L: 'squint', R: 'squint', m: 'flat', look: { x: 0.8, y: 0 } },
  cool: { L: 'sq', R: 'sq', m: 'smirk', shades: true },
  love: { L: 'heart', R: 'heart', m: 'smile', ex: ['blush'] },
  wink: { L: 'happy', R: 'sq', m: 'smirk' },
  smug: { L: 'half', R: 'half', b: 'raise', m: 'smirk' },
  sleepy: { L: 'line', R: 'line', m: 'os' },
  sleep: { L: 'sleepy', R: 'sleepy' },
  dizzy: { L: 'spiral', R: 'spiral', m: 'wave' },
  ko: { L: 'x', R: 'x', m: 'O' },
  hurt: { L: 'gt', R: 'lt', m: 'teeth' },
  ouch: { L: 'shut', R: 'shut', m: 'frown' },
  focus: { L: 'squint', R: 'squint', b: 'focus', m: 'flat' },
  think: { L: 'sq', R: 'sq', m: 'smirk', look: { x: -0.8, y: -0.9 } },
  embarrassed: { L: 'happy', R: 'happy', m: 'wave', ex: ['blush', 'sweat'], look: { x: 0, y: 0.6 } },
  proud: { L: 'happy', R: 'happy', m: 'grin' },
  pleading: { L: 'big', R: 'big', b: 'sad', m: 'wave' },
  annoyed: { L: 'half', R: 'half', b: 'angry', m: 'frown', ex: ['vein'] },
  mischief: { L: 'squint', R: 'happy', m: 'grin' },
  relieved: { L: 'happy', R: 'happy', m: 'os' },
  serene: { L: 'happy', R: 'happy', m: 'smiles' },
  starry: { L: 'star', R: 'star', m: 'O' },
  determined: { L: 'sq', R: 'sq', b: 'focus', m: 'teeth' },
  nervous: { L: 'sq', R: 'sq', b: 'worried', m: 'wave', ex: ['sweat'] },
  tongue: { L: 'happy', R: 'sq', m: 'tongue' },
  yuck: { L: 'shut', R: 'shut', m: 'tongue' },
  serious: { L: 'sq', R: 'sq', b: 'focus', m: 'flat' },
  wideHappy: { L: 'wide', R: 'wide', m: 'grin' },
  talk: { L: 'sq', R: 'sq' }
});

function drawBrow(ctx, kind, x, y, side) {
  ctx.fillStyle = COL.ink;
  let a = 0, dy = -1.15;
  if (kind === 'angry') a = 0.45 * side;
  else if (kind === 'sad' || kind === 'worried') a = -0.4 * side;
  else if (kind === 'focus') { a = 0.18 * side; dy = -0.85; }
  else if (kind === 'flat') { a = 0; dy = -0.95; }
  else if (kind === 'raise') { if (side < 0) { a = -0.25; dy = -1.55; } else { a = 0.05; dy = -0.95; } }
  ctx.save(); ctx.translate(x, y + dy); ctx.rotate(a); ctx.fillRect(-0.6, -0.15, 1.2, 0.3); ctx.restore();
}

/* face texture: drawn in face coordinates (x right, y down, 1 = one body unit; body front spans x -4..4, y -8..-2) */
function drawFaceTex(ctx, b, T) {
  const f = FACES[b.faceNow()] || FACES.normal;
  let lookX = b.look.x, lookY = b.look.y;
  if (f.look) { lookX = f.look.x * b.lookSide; lookY = f.look.y; }
  const s = 0.25, ex = 0.42 * lookX, ey = 0.38 * lookY;
  const lx = -2.5 + ex, rx = 2.5 + ex, y = -6.5 + ey;
  let L = f.L, R = f.R;
  if (b.blinking && (L === 'sq' || L === 'wide' || L === 'big' || L === 'small')) L = 'blink';
  if (b.blinking && (R === 'sq' || R === 'wide' || R === 'big' || R === 'small')) R = 'blink';
  if (f.shades || b.outfit.shades) {
    ctx.fillStyle = COL.ink;
    ctx.fillRect(-4.1, -7.0, 8.2, 0.45); ctx.fillRect(-3.7, -7.0, 2.6, 1.25); ctx.fillRect(1.1, -7.0, 2.6, 1.25);
    ctx.fillStyle = '#fff'; ctx.fillRect(-3.35, -6.7, 0.45, 0.28); ctx.fillRect(1.45, -6.7, 0.45, 0.28);
  } else {
    const off = (g) => (g === 'half' || g === 'squint' ? 0.25 : g === 'blink' || g === 'line' ? 0.35 : g === 'sleepy' ? 0.3 : 0);
    glyph(ctx, G[L] || G.sq, lx, y + off(L), s);
    glyph(ctx, G[R] || G.sq, rx, y + off(R), s);
    if (f.b) { drawBrow(ctx, f.b, lx, y, -1); drawBrow(ctx, f.b, rx, y, 1); }
  }
  // glasses (study / reading) go over the eyes
  if (b.outfit.glasses && !f.shades) {
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 0.22;
    ctx.strokeRect(lx - 0.95, y - 0.9, 1.9, 1.75); ctx.strokeRect(rx - 0.95, y - 0.9, 1.9, 1.75);
    ctx.fillStyle = COL.ink; ctx.fillRect(lx + 0.95, y - 0.35, rx - lx - 1.9, 0.22);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(lx - 0.7, y - 0.65, 0.35, 0.3); ctx.fillRect(rx - 0.7, y - 0.65, 0.35, 0.3);
  }
  // mouth (talking flaps when no explicit mouth)
  let m = f.m;
  if (b.talkT > 0 && (!m || m === 'flat' || m === 'smirk' || m === 'smiles')) m = (M.sin(T * 26) > 0) ? 'os' : (m || null);
  if (m === 'wave') m = M.sin(T * 30) > 0 ? 'waveA' : 'waveB';
  if (m && MOUTH[m]) glyph(ctx, MOUTH[m], 0 + ex * 0.6, -4.35, s);
  // extras
  const ext = f.ex || [];
  if (ext.indexOf('blush') >= 0 || b.blush > 0.1) { ctx.fillStyle = COL.pink; ctx.fillRect(-3.7, -5.35, 1.2, 0.5); ctx.fillRect(2.5, -5.35, 1.2, 0.5); }
  if (ext.indexOf('sweat') >= 0) { const k = (T * 0.8) % 1; glyph(ctx, DROP, 3.55, -7.4 + k * 1.6, 0.22); }
  if (ext.indexOf('vein') >= 0) { ctx.fillStyle = COL.red; const v = [[0, 0], [0.5, 0], [0.25, -0.3], [0.25, 0.3]]; v.forEach((p) => ctx.fillRect(2.6 + p[0] - 0.12, -7.45 + p[1] - 0.12, 0.3, 0.3)); ctx.fillRect(2.6, -7.75, 0.25, 0.9); ctx.fillRect(2.3, -7.45, 0.9, 0.25); }
  if (ext.indexOf('tears') >= 0) {
    ctx.fillStyle = COL.blue;
    for (let i = 0; i < 3; i++) { const k = ((T * 2.2 + i / 3) % 1); ctx.fillRect(lx - 0.4, y + 0.6 + k * 2.6, 0.32, 0.45); ctx.fillRect(rx + 0.1, y + 0.6 + ((k + 0.5) % 1) * 2.6, 0.32, 0.45); }
  }
  if (b.cheek > 0.05) { ctx.globalAlpha = b.cheek * 0.8; ctx.fillStyle = COL.red; ctx.fillRect(2.2, -5.25, 1.6, 0.7); ctx.globalAlpha = 1; }
  if (b.bandage > 0.05) {
    ctx.save(); ctx.globalAlpha = M.min(1, b.bandage * 3); ctx.translate(2.4, -7.55); ctx.rotate(0.5);
    ctx.fillStyle = '#F4E9DA'; ctx.fillRect(-1.3, -0.35, 2.6, 0.7); ctx.fillRect(-0.35, -1.3, 0.7, 2.6);
    ctx.fillStyle = '#D8C6AE'; ctx.fillRect(-0.15, -0.15, 0.3, 0.3); ctx.restore();
  }
}

/* friend face: dark visor with glowing LED eyes */
function drawFriendFace(ctx, b, T) {
  const f = FACES[b.faceNow()] || FACES.normal;
  ctx.fillStyle = COL.visor; ctx.fillRect(-3.4, -7.4, 6.8, 2.4);
  const led = b.ledCol || COL.led, s = 0.25;
  const lx = -1.7 + 0.35 * b.look.x, rx = 1.7 + 0.35 * b.look.x, y = -6.2 + 0.25 * b.look.y;
  let L = f.L, R = f.R; if (b.blinking) { L = R = 'blink'; }
  glyph(ctx, G[L] || G.sq, lx, y, s, led); glyph(ctx, G[R] || G.sq, rx, y, s, led);
  let m = f.m; if (b.talkT > 0 && !m) m = M.sin(T * 26) > 0 ? 'os' : null;
  if (m === 'wave') m = M.sin(T * 30) > 0 ? 'waveA' : 'waveB';
  if (m && MOUTH[m]) glyph(ctx, MOUTH[m], 0, -3.9, s, COL.visor);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-3.2, -7.25, 2.2, 0.35);
}

function drawRobeFront(ctx) { // jalabiya front: collar, placket, buttons, pocket
  ctx.fillStyle = '#E4DFD3'; ctx.fillRect(-1.2, -3.98, 2.4, 0.28);
  ctx.fillStyle = '#DCD6C8'; ctx.fillRect(-0.12, -3.7, 0.24, 2.5);
  ctx.fillStyle = '#B9B2A2'; [-3.45, -2.85, -2.25].forEach((y) => ctx.fillRect(-0.18, y, 0.36, 0.3));
  ctx.fillStyle = '#E9E4D8'; ctx.fillRect(1.6, -2.6, 1.3, 0.12);
}
function drawCapFront(ctx) { // taqiyah embroidery
  ctx.fillStyle = '#D7D2C4';
  for (let x = -2.6; x <= 2.6; x += 0.8) { ctx.fillRect(x, -8.75, 0.3, 0.3); }
  ctx.fillRect(-2.9, -8.35, 5.8, 0.1);
}

/* ---------------------------------------------------------------- 3D box model */
// corner index bits: x=1, y=2, z=4 ; faces wound counter-clockwise from outside
const FACE_DEF = [
  { n: [0, 0, 1], v: [4, 5, 7, 6], name: 'front' },
  { n: [0, 0, -1], v: [1, 0, 2, 3], name: 'back' },
  { n: [1, 0, 0], v: [5, 1, 3, 7], name: 'right' },
  { n: [-1, 0, 0], v: [0, 4, 6, 2], name: 'left' },
  { n: [0, 1, 0], v: [6, 7, 3, 2], name: 'top' },
  { n: [0, -1, 0], v: [0, 1, 5, 4], name: 'bottom' }
];
const LIGHT = (() => { const v = [-0.25, 0.85, 0.47], l = M.hypot(v[0], v[1], v[2]); return v.map((x) => x / l); })();

function makeProjector(b, k) {
  const sx = b.sx.v, sy = b.sy.v, sz = (sx + 1) / 2;
  const F = b.flip, cF = M.cos(F), sF = M.sin(F), cy = (b.pivotY || 5) * sy;
  const th = b.yaw.v + b.twist, cT = M.cos(th), sT = M.sin(th);
  const ph = b.pv.v, cP = M.cos(ph), sP = M.sin(ph);
  const ro = b.roll.v, cR = M.cos(ro), sR = M.sin(ro);
  const ox = b.x + b.ox, oy = b.y + b.oy;
  const P = function (x, y, z, out) {
    x *= sx; y *= sy; z *= sz;
    const yy = y - cy, y1 = cy + yy * cF - z * sF, z1 = yy * sF + z * cF;
    const x2 = x * cT + z1 * sT, z2 = -x * sT + z1 * cT;
    const y3 = y1 * cP - z2 * sP, z3 = y1 * sP + z2 * cP;
    out[0] = ox + (x2 * cR - y3 * sR) * k; out[1] = oy - (x2 * sR + y3 * cR) * k; out[2] = z3;
    return out;
  };
  P.normal = function (n, a) { // rotate a normal (a = optional pre-rotation about z)
    let x = n[0], y = n[1], z = n[2];
    if (a) { const c = M.cos(a), s = M.sin(a); const nx = x * c - y * s; y = x * s + y * c; x = nx; }
    const y1 = y * cF - z * sF, z1 = y * sF + z * cF;
    const x2 = x * cT + z1 * sT, z2 = -x * sT + z1 * cT;
    const y3 = y1 * cP - z2 * sP, z3 = y1 * sP + z2 * cP;
    return [x2 * cR - y3 * sR, x2 * sR + y3 * cR, z3];
  };
  return P;
}
CL.makeProjector = makeProjector;

function preRot(px, py, a) { // rotation about the z axis around a pivot (shoulders)
  const c = M.cos(a), s = M.sin(a);
  return (p) => { const dx = p[0] - px, dy = p[1] - py; p[0] = px + dx * c - dy * s; p[1] = py + dx * s + dy * c; };
}

function buildBoxes(b, T) {
  const out = [], col = b.bodyColor(), fr = b.kind === 'friend';
  const sit = b.sit.v, walk = b.walkAmt, ph = b.walkPhase;
  const bodyDrop = sit * 1.7, w = fr ? 3.5 : 4, d = fr ? 2.2 : 2.5, top = fr ? 7.6 : 8;
  const robe = b.outfit.robe;
  const shY = (fr ? 4.6 : 5) - bodyDrop;
  // the jalabiya is its own block under the arms, and the body block starts where it ends: no overlapping boxes,
  // so the depth sort can't flip between them (that made the robe flicker on and off while rocking or tilting)
  const robeY0 = M.max(0.05, 0.35 - bodyDrop), cut = robe ? M.min(2 - bodyDrop + 2.7, shY - 1.02) : 2 - bodyDrop;
  // legs
  const legX = fr ? [-3, -1.2, 0.2, 2] : [-4, -2, 1, 3];
  for (let i = 0; i < 4; i++) {
    const swing = M.sin(ph + (i % 2) * PI) * walk;
    let lift = b.legs[i] + M.max(0, -swing) * 0.8 * walk;
    let h = 2 * (1 - sit) + 0.35 * sit, z0 = -1 + swing * 0.9 + sit * 1.4;
    let y0 = lift * (1 - sit), y1 = y0 + h;
    if (robe) { if (sit >= 0.5 || y0 >= robeY0 - 0.02) continue; y1 = robeY0; } // only the feet show under the hem
    out.push({ x0: legX[i], x1: legX[i] + 1, y0: y0, y1: y1, z0: z0, z1: z0 + 2, col: robe ? '#B9583A' : col });
  }
  const by0 = 2 - bodyDrop, by1 = top - bodyDrop;
  // body (front face is textured with the face)
  out.push({ x0: -w, x1: w, y0: robe ? cut : by0, y1: by1, z0: -d, z1: d, col: col, tex: fr ? 'friendFace' : 'face', body: true });
  // robe (jalabiya): the lower body down to the ground, a little wider than the body
  if (robe) out.push({ x0: -w - 0.2, x1: w + 0.2, y0: robeY0, y1: cut, z0: -d - 0.2, z1: d + 0.2, col: COL.robe, tex: 'robe' });
  // arms (rotate at the shoulders; fwd brings them to the front to hold things)
  [[-1, b.aL.v, b.fwdL.v], [1, b.aR.v, b.fwdR.v]].forEach(function (a) {
    const side = a[0], ang = a[1] * side, fwd = a[2];
    const x0 = side < 0 ? -w - 2 : w, x1 = side < 0 ? -w : w + 2;
    const shift = fwd * 1.4 * -side;
    const box = { x0: x0 + shift, x1: x1 + shift, y0: shY - 1, y1: shY + 1, z0: -1 + fwd * 2.2, z1: 1 + fwd * 2.2, col: robe ? COL.robe : col, rot: ang, pre: preRot(side * w + shift, shY, ang) };
    if (robe) box.col = mixHex(COL.robe, col, 0.0);
    out.push(box);
    if (b.outfit.gloves) out.push({ x0: (side < 0 ? x0 - 0.6 : x1 - 0.2) + shift, x1: (side < 0 ? x0 + 0.6 : x1 + 0.6) + shift, y0: shY - 1.2, y1: shY + 1.2, z0: -1.2 + fwd * 2.2, z1: 1.2 + fwd * 2.2, col: '#D7263D', rot: ang, pre: preRot(side * w + shift, shY, ang) });
  });
  // accessories on the head
  if (b.outfit.cap) {
    out.push({ x0: -w + 0.6, x1: w - 0.6, y0: by1, y1: by1 + 0.8, z0: -d + 0.4, z1: d - 0.4, col: COL.cap, tex: 'cap' });
    out.push({ x0: -w + 1.2, x1: w - 1.2, y0: by1 + 0.8, y1: by1 + 1.15, z0: -d + 0.9, z1: d - 0.9, col: COL.cap });
  }
  if (b.outfit.headband) out.push({ x0: -w - 0.15, x1: w + 0.15, y0: by1 - 1.3, y1: by1 - 0.6, z0: -d - 0.15, z1: d + 0.15, col: b.outfit.headband === 'black' ? '#222' : '#D7263D' });
  if (b.outfit.nightcap) {
    out.push({ x0: -w + 0.5, x1: w - 0.5, y0: by1, y1: by1 + 0.9, z0: -d + 0.5, z1: d - 0.5, col: '#4A6FB5' });
    out.push({ x0: -w + 1.5, x1: w - 2.5, y0: by1 + 0.9, y1: by1 + 1.9, z0: -1, z1: 1, col: '#4A6FB5' });
    out.push({ x0: w - 3, x1: w - 1.6, y0: by1 + 1.2, y1: by1 + 2.4, z0: -0.7, z1: 0.7, col: '#FFFFFF' });
  }
  if (b.outfit.helmet) { // a cooking pot on the head, for defence
    out.push({ x0: -w - 0.2, x1: w + 0.2, y0: by1 - 0.6, y1: by1 + 1.8, z0: -d - 0.2, z1: d + 0.2, col: '#9AA3AD' });
    out.push({ x0: w + 0.2, x1: w + 1.8, y0: by1 + 0.9, y1: by1 + 1.3, z0: -0.4, z1: 0.4, col: '#3B3F45' });
  }
  if (fr) { // antenna
    out.push({ x0: -0.25, x1: 0.25, y0: by1, y1: by1 + 1.6, z0: -0.25, z1: 0.25, col: '#2C3E57' });
    out.push({ x0: -0.55, x1: 0.55, y0: by1 + 1.6, y1: by1 + 2.6, z0: -0.55, z1: 0.55, col: b.ledCol || COL.led });
  }
  // lumps from head hits
  b.lumps.forEach(function (l) {
    const h = l.h * (1 + l.pop * 0.35), ww = 0.7 + h * 0.18;
    out.push({ x0: l.x - ww, x1: l.x + ww, y0: by1, y1: by1 + h * 0.6, z0: -0.9, z1: 0.9, col: col });
    out.push({ x0: l.x - ww * 0.6, x1: l.x + ww * 0.6, y0: by1 + h * 0.5, y1: by1 + h, z0: -0.6, z1: 0.6, col: col });
  });
  return out;
}

/* draws a bot; also measures its screen box, head top and lowest point */
const tmp = [0, 0, 0];
function drawBot(ctx, b, T) {
  if (b.alpha <= 0.01 || b.gone) return;
  const k = b.world.U * b.scale.v;
  const P = makeProjector(b, k);
  const boxes = buildBoxes(b, T);
  const polys = [];
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  const pts = [];
  boxes.forEach(function (bx, bi) {
    const cs = [];
    for (let i = 0; i < 8; i++) {
      const p = [(i & 1) ? bx.x1 : bx.x0, (i & 2) ? bx.y1 : bx.y0, (i & 4) ? bx.z1 : bx.z0];
      if (bx.pre) bx.pre(p);
      P(p[0], p[1], p[2], tmp); cs.push([tmp[0], tmp[1], tmp[2]]);
    }
    pts.push(cs);
  });
  // auto lift: when tipped over on the ground, rest on the lowest corner instead of sinking in
  let lift = 0;
  const gd = b.world.gdir;
  if (b.ground && !b.noClip) {
    let ext = -1e9;
    pts.forEach((cs) => cs.forEach((c) => { const e = (c[0] - b.x - b.ox) * gd.x + (c[1] - b.y - b.oy) * gd.y; if (e > ext) ext = e; }));
    if (ext > 0.5) lift = ext;
  }
  const lx = -gd.x * lift, ly = -gd.y * lift;
  boxes.forEach(function (bx, bi) {
    const cs = pts[bi];
    cs.forEach((c) => { c[0] += lx; c[1] += ly;
      if (c[0] < minX) minX = c[0]; if (c[0] > maxX) maxX = c[0]; if (c[1] < minY) minY = c[1]; if (c[1] > maxY) maxY = c[1];
    });
    FACE_DEF.forEach(function (fd) {
      const a = cs[fd.v[0]], bb = cs[fd.v[1]], c = cs[fd.v[2]], d = cs[fd.v[3]];
      const cross = (bb[0] - a[0]) * (c[1] - bb[1]) - (bb[1] - a[1]) * (c[0] - bb[0]);
      if (cross >= -0.01) return;
      const n = P.normal(fd.n, bx.rot);
      const lit = M.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      const br = (0.6 + 0.4 * lit) / 0.788;
      polys.push({ p: [a, bb, c, d], z: (a[2] + bb[2] + c[2] + d[2]) / 4 + (bx.body ? 0 : 0.001), col: shade(bx.col, br), tex: fd.name === 'front' ? bx.tex : null, bx: bx, cs: cs, br: br });
    });
  });
  // head point: centre top along "up"
  const cxs = (minX + maxX) / 2, cys = (minY + maxY) / 2;
  const reach = M.abs(gd.x) * (maxX - minX) / 2 + M.abs(gd.y) * (maxY - minY) / 2;
  b.head = { x: cxs - gd.x * reach, y: cys - gd.y * reach };
  b.bbox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  polys.sort((p, q) => p.z - q.z);
  ctx.save(); ctx.globalAlpha = b.alpha;
  polys.forEach(function (pl) {
    const p = pl.p;
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath();
    ctx.fillStyle = pl.col; ctx.fill();
    // tiny seam so neighbouring faces don't show gaps
    ctx.strokeStyle = pl.col; ctx.lineWidth = 0.6; ctx.stroke();
    if (pl.tex) {
      const bx = pl.bx, cs = pl.cs;
      const P6 = cs[6], P7 = cs[7], P4 = cs[4];
      const ex = [(P7[0] - P6[0]) / (bx.x1 - bx.x0), (P7[1] - P6[1]) / (bx.x1 - bx.x0)];
      const ey = [(P4[0] - P6[0]) / (bx.y1 - bx.y0), (P4[1] - P6[1]) / (bx.y1 - bx.y0)];
      // face coords: u = local x, v = -(local y); when sitting the body drops, so the features move with it
      const shiftY = b.sit.v * 1.7;
      const O = [P6[0] - bx.x0 * ex[0] + bx.y1 * ey[0], P6[1] - bx.x0 * ex[1] + bx.y1 * ey[1]];
      ctx.save(); ctx.clip();
      ctx.transform(ex[0], ex[1], ey[0], ey[1], O[0], O[1]);
      if (shiftY) ctx.translate(0, shiftY);
      if (pl.tex === 'face') drawFaceTex(ctx, b, T);
      else if (pl.tex === 'friendFace') drawFriendFace(ctx, b, T);
      else if (pl.tex === 'robe') drawRobeFront(ctx);
      else if (pl.tex === 'cap') drawCapFront(ctx);
      ctx.restore();
      if (pl.tex === 'face' || pl.tex === 'friendFace') b._front = true;
    }
  });
  // props in front of the body
  if (b.prop && b._front && CL.PROPS[b.prop.kind]) {
    const fb = b.bodyBoxFront(P, lx, ly);
    ctx.save(); ctx.transform(fb.ex[0], fb.ex[1], fb.ey[0], fb.ey[1], fb.O[0], fb.O[1]); if (fb.drop) ctx.translate(0, fb.drop); CL.PROPS[b.prop.kind](ctx, b, T, b.prop); ctx.restore();
  }
  ctx.restore();
  b._front = null;
}
CL.drawBot = drawBot;

/* ---------------------------------------------------------------- props (drawn in the plane just in front of the body; x right, y down, units) */
const PROPS = (CL.PROPS = {
  mushaf: function (ctx, b, T, p) { // open mushaf on a wooden rehal
    ctx.fillStyle = COL.woodD; ctx.save(); ctx.translate(0, -0.6);
    ctx.save(); ctx.rotate(0.55); ctx.fillRect(-2.6, -0.2, 5.2, 0.4); ctx.restore();
    ctx.save(); ctx.rotate(-0.55); ctx.fillRect(-2.6, -0.2, 5.2, 0.4); ctx.restore(); ctx.restore();
    ctx.fillStyle = COL.mushaf; ctx.fillRect(-3.2, -2.9, 6.4, 1.9);
    ctx.fillStyle = COL.paper; ctx.fillRect(-3.0, -2.75, 2.9, 1.6); ctx.fillRect(0.1, -2.75, 2.9, 1.6);
    ctx.fillStyle = '#9C8B6A';
    for (let i = 0; i < 4; i++) { ctx.fillRect(-2.75, -2.5 + i * 0.36, 2.4, 0.08); ctx.fillRect(0.35, -2.5 + i * 0.36, 2.4, 0.08); }
    ctx.fillStyle = COL.gold; ctx.fillRect(-0.08, -2.9, 0.16, 1.9);
    if (p.turn > 0) { ctx.fillStyle = COL.paper; const w = 2.9 * M.cos(p.turn * PI); ctx.fillRect(0.1, -2.75, w, 1.6); }
  },
  tasbih: function (ctx, b, T, p) { // string of beads hanging from the right hand
    const n = 11, cx = 2.6, cy = -4.3;
    ctx.strokeStyle = '#6B4A2A'; ctx.lineWidth = 0.08;
    const pts = [];
    for (let i = 0; i < n; i++) { const a = PI * (i / (n - 1)); pts.push([cx + M.cos(a) * 1.0 - 0.0, cy + M.sin(a) * 1.9]); }
    ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    const act = (p.count || 0) % n;
    pts.forEach((q, i) => { ctx.fillStyle = i === act ? '#2FA36B' : '#1E6B47'; const s = i === act ? 0.5 : 0.38; ctx.fillRect(q[0] - s / 2, q[1] - s / 2 + (i === act ? 0.15 : 0), s, s); });
    ctx.fillStyle = COL.gold; ctx.fillRect(cx - 0.12, cy + 1.9, 0.24, 0.7);
  },
  book: function (ctx, b, T, p) {
    ctx.fillStyle = p.color || '#3A5BA0'; ctx.fillRect(-2.6, -5.2, 5.2, 2.6);
    ctx.fillStyle = COL.paper; ctx.fillRect(-2.4, -5.0, 2.3, 2.2); ctx.fillRect(0.1, -5.0, 2.3, 2.2);
    ctx.fillStyle = '#A99C80'; for (let i = 0; i < 5; i++) { ctx.fillRect(-2.2, -4.7 + i * 0.38, 1.9, 0.07); ctx.fillRect(0.3, -4.7 + i * 0.38, 1.9, 0.07); }
    if (p.turn > 0) { ctx.fillStyle = '#FFF8E8'; ctx.fillRect(0.1, -5.0, 2.3 * M.cos(p.turn * PI), 2.2); }
  },
  study: function (ctx, b, T, p) { // notebook on the floor + pencil in hand
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-3.2, -1.3, 4.6, 1.1);
    ctx.fillStyle = '#9EC5E8'; for (let i = 0; i < 3; i++) ctx.fillRect(-3.0, -1.1 + i * 0.3, 4.2, 0.05);
    ctx.fillStyle = '#555'; const n = (p.lines || 0) % 14; for (let i = 0; i < n; i++) ctx.fillRect(-2.9 + (i % 7) * 0.55, -1.15 + ((i / 7) | 0) * 0.3, 0.4, 0.06);
    ctx.save(); ctx.translate(1.6 + M.sin(T * 9) * 0.5, -1.2); ctx.rotate(-0.7);
    ctx.fillStyle = '#F2C230'; ctx.fillRect(-0.15, -1.8, 0.3, 1.6); ctx.fillStyle = '#F5D0B5'; ctx.fillRect(-0.15, -0.2, 0.3, 0.25); ctx.fillStyle = '#333'; ctx.fillRect(-0.05, 0.05, 0.1, 0.12);
    ctx.fillStyle = '#E88'; ctx.fillRect(-0.15, -2.05, 0.3, 0.25); ctx.restore();
  },
  tea: function (ctx, b, T, p) { // Arabic tea glass on a saucer, held in the right hand
    const x = 4.3 + (p.sip || 0) * -2.6, y = -4.4 - (p.sip || 0) * 1.6;
    ctx.fillStyle = '#C8C8C8'; ctx.fillRect(x - 0.9, y + 0.75, 1.8, 0.2);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x - 0.55, y - 0.9, 1.1, 1.65);
    ctx.fillStyle = '#B5541C'; ctx.fillRect(x - 0.48, y - 0.5, 0.96, 1.2);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x - 0.45, y - 0.85, 0.15, 1.5);
  },
  dumbbells: function (ctx, b, T, p) {
    [-1, 1].forEach((s) => { const x = s * 5.2, y = -4 - (p.up || 0) * 2.2 * (s < 0 ? 1 : 1);
      ctx.fillStyle = '#333'; ctx.fillRect(x - 0.8, y - 0.15, 1.6, 0.3); ctx.fillRect(x - 0.9, y - 0.6, 0.35, 1.2); ctx.fillRect(x + 0.55, y - 0.6, 0.35, 1.2); });
  },
  juggle: function (ctx, b, T, p) {
    const cols = ['#E94F37', '#3F88C5', '#F6AE2D'];
    for (let i = 0; i < 3; i++) { const ph = T * 4.2 + i * (TAU / 3); const x = M.cos(ph) * 2.6; const y = -9 - M.abs(M.sin(ph)) * 4;
      ctx.fillStyle = cols[i]; ctx.fillRect(x - 0.45, y - 0.45, 0.9, 0.9); }
  },
  plant: function (ctx, b, T, p) { // pot to the right of Clawd; grows over days
    const g = clamp(p.grow || 0.2, 0.1, 1), x = 7.2;
    ctx.fillStyle = '#B5653A'; ctx.fillRect(x - 1.1, -1.5, 2.2, 1.5); ctx.fillStyle = '#9A522D'; ctx.fillRect(x - 1.3, -1.7, 2.6, 0.4);
    ctx.fillStyle = '#3E9B4F'; const h = 1 + g * 4; ctx.fillRect(x - 0.12, -1.7 - h, 0.24, h);
    for (let i = 0; i < 1 + g * 5; i++) { const yy = -2 - i * 0.75; const s = i % 2 ? 1 : -1; ctx.fillRect(x + (s > 0 ? 0.1 : -0.9), yy, 0.8, 0.35); }
    if (g > 0.85) { ctx.fillStyle = '#F2C230'; ctx.fillRect(x - 0.45, -2.2 - h, 0.9, 0.9); ctx.fillStyle = '#E94F37'; ctx.fillRect(x - 0.2, -1.95 - h, 0.4, 0.4); }
    if (p.water) { ctx.fillStyle = '#7FB3D5'; ctx.fillRect(3.2, -6.8, 2.2, 1.3); ctx.fillRect(5.4, -6.6, 1.4, 0.3);
      ctx.fillStyle = COL.blue; for (let i = 0; i < 4; i++) { const k = (T * 3 + i / 4) % 1; ctx.fillRect(6.6 + k * 0.6, -6.3 + k * 3.5, 0.2, 0.3); } }
  },
  shield: function (ctx, b, T, p) { // pot lid shield
    ctx.fillStyle = '#AEB6BF'; ctx.fillRect(2.2, -7.2, 3.6, 4.6); ctx.fillStyle = '#8D959E'; ctx.fillRect(2.6, -6.8, 2.8, 3.8);
    ctx.fillStyle = '#3B3F45'; ctx.fillRect(3.6, -5.2, 0.8, 0.6);
  },
  phoneSelfie: function (ctx) { ctx.fillStyle = '#222'; ctx.fillRect(4.4, -7.6, 1.4, 2.4); ctx.fillStyle = '#7FD1F7'; ctx.fillRect(4.55, -7.4, 1.1, 1.9); },
  dua: function () {}, // hands only
  sign: function (ctx, b, T, p) { // little board with text
    ctx.fillStyle = COL.woodD; ctx.fillRect(-0.15, -12.5, 0.3, 4.5);
    ctx.fillStyle = '#FFF7E0'; ctx.fillRect(-3.6, -14.2, 7.2, 2.2); ctx.strokeStyle = COL.woodD; ctx.lineWidth = 0.18; ctx.strokeRect(-3.6, -14.2, 7.2, 2.2);
    ctx.save(); ctx.scale(0.06, 0.06); ctx.fillStyle = COL.ink; ctx.font = '900 18px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text || '', 0, -13.1 / 0.06); ctx.restore();
  }
});

/* ---------------------------------------------------------------- tools (world objects, screen pixels) */
const TOOLS = (CL.TOOLS = {
  stick:   { name: 'عصا', len: 8.4, swing: true, sfx: 'bonk', soft: 0 },
  pillow:  { name: 'مخدة', len: 4.6, swing: true, sfx: 'puff', soft: 0.8 },
  hammer:  { name: 'مطرقة بتزمّر', len: 7.6, swing: true, sfx: 'squeak', soft: 0.5 },
  glove:   { name: 'قفاز ملاكمة', len: 5, swing: false, punch: true, sfx: 'punch', soft: 0.2 },
  balloon: { name: 'بالون مي', len: 3, throwable: true, sfx: 'splash', soft: 0.7 },
  snow:    { name: 'كرة ثلج', len: 3, throwable: true, sfx: 'crunch', soft: 0.5 },
  feather: { name: 'ريشة', len: 6.5, swing: false, tickle: true, sfx: 'tickle', soft: 1 }
});
function drawTool(ctx, kind, u, glow, T) {
  const px = (x, y, w, h) => ctx.fillRect(x * u, y * u, w * u + 0.4, h * u + 0.4);
  const L = TOOLS[kind].len;
  if (glow > 0) { ctx.shadowColor = 'rgba(255,90,40,' + glow * 0.9 + ')'; ctx.shadowBlur = 6 + glow * 16; }
  if (kind === 'stick') {
    ctx.fillStyle = mixHex(COL.wood, '#E2462A', glow * 0.7); px(-0.52, -L, 1.05, L);
    ctx.shadowBlur = 0;
    ctx.fillStyle = mixHex(COL.woodL, '#FF8A50', glow * 0.7); px(-0.52, -L, 0.35, L);
    ctx.fillStyle = COL.woodD; px(0.28, -L, 0.25, L);
    ctx.fillStyle = mixHex(COL.wood, '#E2462A', glow * 0.7); px(-0.8, -L - 0.2, 1.6, 2.2);
    ctx.fillStyle = mixHex(COL.woodL, '#FF8A50', glow * 0.7); px(-0.8, -L - 0.2, 0.4, 2.2);
    ctx.fillStyle = COL.woodD; px(0.5, -L - 0.2, 0.3, 2.2); px(-0.2, -L + 1, 0.45, 0.3); px(-0.1, -L * 0.55, 0.4, 0.4);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? COL.gripD : COL.grip; px(-0.62, -2.4 + i * 0.6, 1.25, 0.6); }
  } else if (kind === 'pillow') {
    ctx.fillStyle = '#E9E4F7'; px(-0.3, -1.7, 0.6, 1.7); ctx.shadowBlur = 0;
    ctx.fillStyle = '#B7A9E8'; px(-1.4, -L, 2.8, 3.0); ctx.fillStyle = '#CFC4F2'; px(-1.25, -L + 0.15, 2.5, 2.7);
    ctx.fillStyle = '#9C8BDB'; px(-1.6, -L - 0.15, 0.45, 0.45); px(1.15, -L - 0.15, 0.45, 0.45); px(-1.6, -L + 2.7, 0.45, 0.45); px(1.15, -L + 2.7, 0.45, 0.45);
    ctx.fillStyle = '#fff'; px(-0.8, -L + 0.6, 0.6, 0.3);
  } else if (kind === 'hammer') {
    ctx.fillStyle = '#F6C445'; px(-0.4, -L + 2, 0.8, L - 2); ctx.shadowBlur = 0;
    ctx.fillStyle = '#E8473B'; px(-2.4, -L, 4.8, 2.4); ctx.fillStyle = '#FF6B5E'; px(-2.4, -L, 4.8, 0.6);
    ctx.fillStyle = '#B5322A'; px(-2.6, -L + 0.2, 0.4, 2.0); px(2.2, -L + 0.2, 0.4, 2.0);
    ctx.fillStyle = '#3B82C4'; px(-0.5, -1.6, 1.0, 1.6);
  } else if (kind === 'glove') {
    ctx.fillStyle = '#B21E2E'; px(-1.3, -1.2, 2.6, 1.6); ctx.shadowBlur = 0;
    ctx.fillStyle = '#D7263D'; px(-1.8, -L, 3.6, 4.0); ctx.fillStyle = '#F04A5E'; px(-1.6, -L + 0.2, 1.2, 3.4);
    ctx.fillStyle = '#B21E2E'; px(1.0, -L + 1.4, 1.2, 1.8); ctx.fillStyle = '#fff'; px(-1.3, -1.0, 2.6, 0.3);
  } else if (kind === 'balloon') {
    ctx.fillStyle = '#4FA3E8'; px(-1.4, -3.4, 2.8, 2.8); px(-1.0, -3.8, 2.0, 3.6); ctx.shadowBlur = 0;
    ctx.fillStyle = '#9FD0FA'; px(-0.9, -3.2, 0.7, 0.7); ctx.fillStyle = '#2F7FC4'; px(-0.3, -0.4, 0.6, 0.5);
  } else if (kind === 'snow') {
    ctx.fillStyle = '#FFFFFF'; px(-1.4, -3.2, 2.8, 2.6); px(-1.0, -3.6, 2.0, 3.4); ctx.shadowBlur = 0;
    ctx.fillStyle = '#D6E9F5'; px(0.2, -1.6, 1.0, 0.8); px(-1.0, -1.2, 0.6, 0.5);
  } else if (kind === 'feather') {
    ctx.fillStyle = '#C9A26B'; px(-0.12, -L, 0.24, L); ctx.shadowBlur = 0;
    for (let i = 0; i < 9; i++) { const y = -L + 0.4 + i * 0.6, w = 1.6 * M.sin(((i + 1) / 10) * PI);
      ctx.fillStyle = i % 2 ? '#F4D9A8' : '#FFFFFF'; px(-w, y, w, 0.55); px(0.12, y, w, 0.55); }
    ctx.fillStyle = '#E57C3A'; px(-0.6, -L, 1.2, 0.7);
  }
  ctx.shadowBlur = 0;
}
CL.drawTool = drawTool;

/* ---------------------------------------------------------------- particles + floating words */
class FX {
  constructor() { this.parts = []; this.texts = []; }
  burst(x, y, n, power, u, cols) {
    for (let i = 0; i < n; i++) { const a = rnd(0, TAU), sp = rnd(4, 14) * u * (0.6 + power);
      this.parts.push({ k: 'sq', x, y, vx: M.cos(a) * sp, vy: M.sin(a) * sp, g: 20 * u, life: rnd(0.25, 0.5), t: 0, s: rnd(0.35, 0.7) * u, c: pick(cols || [COL.yellow, '#fff', COL.yellow, COL.orangeL]) }); }
  }
  star(x, y, u) { this.parts.push({ k: 'star', x, y, vx: rnd(-6, 6) * u, vy: rnd(-12, -6) * u, g: 24 * u, life: 0.8, t: 0, s: u * 0.28 }); }
  drop(x, y, vx, vy, u, life) { this.parts.push({ k: 'drop', x, y, vx, vy, g: 30 * u, life: life || 0.9, t: 0, s: u * 0.22 }); }
  puff(x, y, u, c, up) { this.parts.push({ k: 'puff', x, y, vx: rnd(-1, 1) * u, vy: -(up || rnd(3, 5)) * u, g: 0, life: rnd(0.6, 0.9), t: 0, s: u * rnd(0.5, 0.8), c: c || '#fff', grow: u }); }
  feathers(x, y, u, n) { for (let i = 0; i < n; i++) this.parts.push({ k: 'feather', x, y, vx: rnd(-8, 8) * u, vy: rnd(-10, -2) * u, g: 3 * u, life: rnd(1.2, 2), t: 0, s: u * rnd(0.5, 0.9), r: rnd(0, TAU), vr: rnd(-6, 6) }); }
  snow(x, y, u, n) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), sp = rnd(3, 10) * u; this.parts.push({ k: 'sq', x, y, vx: M.cos(a) * sp, vy: M.sin(a) * sp - 4 * u, g: 18 * u, life: rnd(0.4, 0.8), t: 0, s: rnd(0.25, 0.5) * u, c: pick(['#fff', '#E3F2FB']) }); } }
  water(x, y, u, n) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), sp = rnd(4, 13) * u; this.parts.push({ k: 'drop', x, y, vx: M.cos(a) * sp, vy: M.sin(a) * sp - 5 * u, g: 30 * u, life: rnd(0.4, 0.9), t: 0, s: u * 0.2 }); } }
  heart(x, y, u) { this.parts.push({ k: 'heart', x, y, vx: rnd(-1, 1) * u, vy: -4 * u, g: 0, life: 1.4, t: 0, s: u * 0.25 }); }
  note(x, y, u) { this.texts.push({ txt: pick(['♪', '♫']), x, y, s: u * 1.6, c: '#6B6A66', t: 0, life: 1.6, r: 0, float: true, vx: u * rnd(-1, 1) }); }
  zzz(x, y, u) { this.texts.push({ txt: 'Z', x, y, s: u * rnd(1.1, 1.6), c: '#6B6A66', t: 0, life: 2.2, r: 0, float: true, vx: u * rnd(0.5, 1.2) }); }
  word(txt, x, y, size, col) { this.texts.push({ txt, x, y, s: size, c: col || COL.yellow, t: 0, life: 0.8, r: rnd(-0.25, 0.25) }); }
  mark(txt, x, y, size, col) { this.texts.push({ txt, x, y, s: size, c: col || COL.ink, t: 0, life: 1.4, r: 0, float: true, vx: 0, plain: true }); }
  update(dt) {
    this.parts = this.parts.filter((p) => { p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === 'puff') p.s += dt * p.grow; if (p.k === 'feather') { p.r += p.vr * dt; p.vx *= M.pow(0.3, dt); p.vy = M.min(p.vy, 3 * p.s); }
      return p.t < p.life; });
    this.texts = this.texts.filter((p) => { p.t += dt; if (p.float) { p.y -= dt * p.s * 1.2; p.x += M.sin(p.t * 3) * dt * p.vx; } return p.t < p.life; });
  }
  draw(ctx) {
    this.parts.forEach((p) => {
      const k = 1 - p.t / p.life;
      if (p.k === 'star') { ctx.globalAlpha = k; glyph(ctx, STAR, p.x, p.y, p.s); }
      else if (p.k === 'drop') { ctx.globalAlpha = M.min(1, k * 2); glyph(ctx, DROP, p.x, p.y, p.s); }
      else if (p.k === 'heart') { ctx.globalAlpha = M.min(1, k * 2); glyph(ctx, HEART, p.x, p.y, p.s); }
      else if (p.k === 'feather') { ctx.globalAlpha = M.min(1, k * 2); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = '#fff'; ctx.fillRect(-p.s, -p.s * 0.2, p.s * 2, p.s * 0.4); ctx.fillStyle = '#ddd'; ctx.fillRect(-p.s, -p.s * 0.05, p.s * 2, p.s * 0.1); ctx.restore(); }
      else if (p.k === 'puff') { ctx.globalAlpha = k * 0.9; ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
      else { ctx.globalAlpha = k; ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    });
    ctx.globalAlpha = 1;
    this.texts.forEach((p) => {
      const k = p.t / p.life, sc = p.float ? 1 : k < 0.15 ? 0.4 + (k / 0.15) * 0.8 : 1.2 - (k - 0.15) * 0.25;
      ctx.save(); ctx.translate(p.x, p.y - (p.float ? 0 : k * p.s * 1.2)); ctx.rotate(p.r); ctx.scale(sc, sc);
      ctx.globalAlpha = p.float ? M.min(1, (1 - k) * 2) : k > 0.75 ? (1 - k) * 4 : 1;
      ctx.font = '900 ' + M.round(p.s) + 'px system-ui,"Noto Sans Arabic",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      if (!p.float || p.plain) { ctx.lineWidth = M.max(3, p.s * 0.18); ctx.strokeStyle = p.plain ? '#fff' : COL.ink; ctx.strokeText(p.txt, 0, 0); }
      ctx.fillStyle = p.c; ctx.fillText(p.txt, 0, 0); ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
}
CL.FX = FX;

/* ---------------------------------------------------------------- the bot (Clawd or his friend) */
class Bot {
  constructor(world, kind) {
    this.world = world; this.kind = kind || 'clawd';
    this.x = 0; this.y = 0; this.ox = 0; this.oy = 0; this.vx = 0; this.vy = 0;
    this.ground = null; this.tv = 0; this.walk = 0; this.walkPhase = 0; this.walkAmt = 0;
    this.mode = 'side'; this.heading = 0;
    this.scale = new Spring(1, 90, 14);
    this.sx = new Spring(1, 320, 13); this.sy = new Spring(1, 320, 13);
    this.yaw = new Spring(0, 60, 11); this.pv = new Spring(0.12, 40, 10); this.roll = new Spring(0, 90, 12);
    this.flip = 0; this.twist = 0; this.pivotY = 5; this.rollOverride = null;
    this.aL = new Spring(0, 160, 9); this.aR = new Spring(0, 160, 9); this.fwdL = new Spring(0, 90, 12); this.fwdR = new Spring(0, 90, 12);
    this.sit = new Spring(0, 60, 12);
    this.legs = [0, 0, 0, 0];
    this.face = 'normal'; this.faceUntil = 0; this.baseFace = 'normal';
    this.look = { x: 0, y: 0, tx: 0, ty: 0 }; this.lookSide = 1;
    this.blinkAt = 2; this.blinking = false; this.talkT = 0;
    this.outfit = {}; this.prop = null;
    this.flush = 0; this.wet = 0; this.frozen = 0; this.blush = 0; this.cheek = 0; this.bandage = 0; this.lumps = [];
    this.alpha = 1; this.gone = false; this.noClip = false; this.held = false; this.tremble = 0;
    this.task = null; this.taskPrio = 0; this.airTime = 0; this.trick = null; this.onLand = null;
    this.head = { x: 0, y: 0 }; this.bbox = { x: 0, y: 0, w: 0, h: 0 };
    this.ledCol = null;
  }
  get u() { return this.world.U * this.scale.v; }
  bodyColor() {
    let c = this.kind === 'friend' ? COL.friend : COL.orange;
    if (this.flush > 0.02) c = mixHex(c, COL.red, this.flush * 0.55);
    if (this.wet > 0.02) c = mixHex(c, this.kind === 'friend' ? '#2F5E99' : COL.wet, this.wet * 0.6);
    if (this.frozen > 0.02) c = mixHex(c, COL.ice, this.frozen * 0.75);
    return c;
  }
  setFace(f, dur) { this.face = f; this.faceUntil = this.world.T + (dur == null ? 1.2 : dur); }
  faceNow() { return this.world.T < this.faceUntil ? this.face : this.baseFace; }
  play(gen, prio) {
    prio = prio || 1;
    if (this.task && this.taskPrio > prio) return false;
    this.stop();
    this.task = gen; this.taskPrio = prio;
    try { const r = gen.next(0); if (r.done) this.task = null; } catch (e) { console.error(e); this.task = null; }
    return true;
  }
  stop() { if (this.task) { const t = this.task; this.task = null; try { t.return(); } catch (e) {} } this.taskPrio = 0; }
  busy(p) { return this.task && this.taskPrio >= (p || 1); }
  poseReset() {
    this.aL.t = 0; this.aR.t = 0; this.fwdL.t = 0; this.fwdR.t = 0; this.sit.t = 0; this.sx.t = 1; this.sy.t = 1;
    this.yaw.t = 0; this.rollOverride = null; this.walk = 0; this.tremble = 0;
  }
  bodyBoxFront(P, lx, ly) { // plane slightly in front of the body, for props; same coordinates as the face
    const d = (this.kind === 'friend' ? 2.2 : 2.5) + 0.9;
    const o = P(0, 0, d, [0, 0, 0]), a = P(1, 0, d, [0, 0, 0]), c = P(0, -1, d, [0, 0, 0]);
    return { ex: [a[0] - o[0], a[1] - o[1]], ey: [c[0] - o[0], c[1] - o[1]], O: [o[0] + lx, o[1] + ly], drop: this.sit.v * 1.7 };
  }
}
CL.Bot = Bot;

/* roll target without spinning the long way round */
function setRoll(b, a) { b.roll.t = b.roll.v + wrap(a - b.roll.v); }
CL.setRoll = setRoll;

/* ---------------------------------------------------------------- the world */
class World {
  constructor(canvas, opts) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.opts = opts || {};
    this.T = 0; this.W = 0; this.H = 0; this.DPR = 1; this.U = 7; this.baseU = 7; this.sizeMul = 1;
    this.insets = { top: 24, bottom: 48, left: 0, right: 0 };
    this.kbTop = null; this.platforms = []; this.platOn = false;
    this.g = { x: 0, y: 9.8 }; this.gmag = 1; this.gdir = { x: 0, y: 1 };
    this.bots = []; this.fx = new FX(); this.shake = 0; this.flash = 0;
    this.tool = null; this.drawHooks = [];
    this.arena = !!this.opts.arena;
    this.resize();
  }
  resize() {
    const r = this.cv.getBoundingClientRect();
    this.DPR = M.min(3, window.devicePixelRatio || 1);
    this.W = r.width || window.innerWidth; this.H = r.height || window.innerHeight;
    this.cv.width = M.round(this.W * this.DPR); this.cv.height = M.round(this.H * this.DPR);
    if (this.arena) this.baseU = M.max(7, M.min(this.W / 22, this.H / 26));
    else this.baseU = 7;
    this.U = this.baseU * this.sizeMul;
  }
  get bounds() {
    const i = this.insets;
    let y1 = this.H - i.bottom;
    if (this.kbTop != null && this.gdir.y > 0.7) y1 = M.min(y1, this.kbTop);
    return { x0: i.left, y0: i.top, x1: this.W - i.right, y1: y1 };
  }
  setGravity(gx, gy) { // device gravity projected on the screen, m/s^2, +y = towards the bottom of the screen
    this.g.x = gx; this.g.y = gy;
    const m = M.hypot(gx, gy);
    this.gmag = m / 9.8;
    if (this.axis == null) { this.axis = 0; this.tilt = 0; }
    if (m < 3) { this.tilt *= 0.9; return; } // phone lying flat: keep the current floor
    const th = M.atan2(gx, gy); // 0 = straight down the screen
    // the floor is one of the four screen edges; switch only when the phone is clearly turned (about 55 degrees)
    let best = this.axis, bd = 9;
    [0, PI / 2, PI, -PI / 2].forEach((a) => { const d = M.abs(wrap(th - a)); if (d < bd) { bd = d; best = a; } });
    if (best !== this.axis && bd < 0.6) this.axis = best;
    this.tilt = lerp(this.tilt, wrap(th - this.axis), 0.35);
    this.gdir.x = M.round(M.sin(this.axis)); this.gdir.y = M.round(M.cos(this.axis));
  }
  gravity() { const G = 2600 * this.U / 7; return { x: this.gdir.x * G, y: this.gdir.y * G }; }
  addBot(kind) { const b = new Bot(this, kind); this.bots.push(b); return b; }

  /* ---------- physics for one bot ---------- */
  stepBot(b, dt) {
    const T = this.T;
    // springs
    b.scale.step(dt); b.sx.step(dt); b.sy.step(dt); b.yaw.step(dt); b.pv.step(dt); b.roll.step(dt);
    b.aL.step(dt); b.aR.step(dt); b.fwdL.step(dt); b.fwdR.step(dt); b.sit.step(dt);
    b.sx.v = clamp(b.sx.v, 0.2, 2.2); b.sy.v = clamp(b.sy.v, 0.15, 2);
    b.look.x = lerp(b.look.x, b.look.tx, M.min(1, dt * 10)); b.look.y = lerp(b.look.y, b.look.ty, M.min(1, dt * 10));
    if (T > b.blinkAt) { b.blinking = true; if (T > b.blinkAt + 0.12) { b.blinking = false; b.blinkAt = T + rnd(2, 5.5); } }
    b.talkT = M.max(0, b.talkT - dt);
    b.cheek = M.max(0, b.cheek - dt * 0.5); b.wet = M.max(0, b.wet - dt * 0.05); b.frozen = M.max(0, b.frozen - dt * 0.06);
    b.blush = M.max(0, b.blush - dt * 0.4); b.bandage = M.max(0, b.bandage - dt / 40);
    b.lumps = b.lumps.filter((l) => { l.pop = M.max(0, l.pop - dt * 4); return T - l.born < 20; });
    for (let i = 0; i < 4; i++) b.legs[i] = lerp(b.legs[i], 0, M.min(1, dt * 6));
    if (b.tremble > 0) b.ox = rnd(-1, 1) * b.tremble * 0.25 * b.u; else b.ox = 0;
    // task
    if (b.task) { try { const r = b.task.next(dt); if (r.done) { b.task = null; b.taskPrio = 0; } } catch (e) { console.error(e); b.task = null; } }
    if (b.held) { b.ground = null; b.vx = b.vy = 0; b.walkAmt = lerp(b.walkAmt, 0, dt * 8); return; }
    if (b.mode === 'top') return this.stepTop(b, dt);
    this.stepSide(b, dt);
  }
  stepTop(b, dt) {
    const bd = this.bounds, u = b.u;
    b.ground = { e: 'top' }; b.rollOverride = 0;
    const sp = b.walk;
    b.x += M.sin(b.heading) * sp * dt; b.y += M.cos(b.heading) * sp * dt;
    b.yaw.t = b.yaw.v + wrap(b.heading - b.yaw.v); setRoll(b, 0);
    if (b.x < bd.x0 + 5 * u || b.x > bd.x1 - 5 * u) { b.heading = -b.heading; b.x = clamp(b.x, bd.x0 + 5 * u, bd.x1 - 5 * u); }
    if (b.y < bd.y0 + 7 * u || b.y > bd.y1 - 1 * u) { b.heading = PI - b.heading; b.y = clamp(b.y, bd.y0 + 7 * u, bd.y1 - u); }
    b.walkPhase += M.abs(sp) * dt / (u * 1.1); b.walkAmt = lerp(b.walkAmt, M.min(1, M.abs(sp) / (u * 4)), M.min(1, dt * 8));
  }
  stepSide(b, dt) {
    const g = this.gravity(), bd = this.bounds, u = b.u, gd = this.gdir;
    const Gm = M.hypot(g.x, g.y) || 1;
    const hw = 6 * u, hh = 8.5 * u;
    if (b.ground) {
      let n, t;
      if (b.ground.plat != null) {
        const p = this.platforms[b.ground.plat];
        if (!p || !this.platOn || gd.y < 0.7) { b.ground = null; return this.stepSide(b, dt); }
        n = { x: 0, y: -1 };
        b.y = p.y;
      } else {
        const e = b.ground.e;
        n = e === 'b' ? { x: 0, y: -1 } : e === 't' ? { x: 0, y: 1 } : e === 'l' ? { x: 1, y: 0 } : { x: -1, y: 0 };
        if (e === 'b') b.y = b.noClip ? b.y : bd.y1; else if (e === 't') b.y = bd.y0; else if (e === 'l') b.x = bd.x0; else b.x = bd.x1;
      }
      t = { x: -n.y, y: n.x };
      const gn = -(g.x * n.x + g.y * n.y), gt = g.x * t.x + g.y * t.y;
      if (gn < Gm * 0.35 && !b.noClip) { // floor no longer below: fall
        b.vx = t.x * b.tv; b.vy = t.y * b.tv; b.ground = null; b.airTime = 0; return;
      }
      // walking + sliding when the phone is tilted more than ~20 degrees
      const tl = this.tilt || 0, over = M.abs(tl) - 0.35, seated = b.sit.t > 0.5;
      const slide = over > 0 && !seated ? M.sign(tl) * M.min(1, over * 2.2) * Gm * 0.22 : 0; void gt;
      b.tv += (b.walk - b.tv) * M.min(1, dt * 7) + slide * dt;
      b.x += t.x * b.tv * dt; b.y += t.y * b.tv * dt;
      // stay inside along the floor
      if (b.ground.plat != null) {
        const p = this.platforms[b.ground.plat];
        if (b.x < p.x0 - u * 1.5 || b.x > p.x1 + u * 1.5) { b.vx = b.tv; b.vy = 0; b.ground = null; b.airTime = 0; }
      } else if (b.noEdge) {
        b.hitWall = 0;
      } else if (t.x !== 0) {
        const lo = bd.x0 + hw, hi = bd.x1 - hw;
        if (b.x < lo) { b.x = lo; b.hitWall = -1; if (b.tv < 0) b.tv = 0; } else if (b.x > hi) { b.x = hi; b.hitWall = 1; if (b.tv > 0) b.tv = 0; } else b.hitWall = 0;
      } else {
        const lo = bd.y0 + hw, hi = bd.y1 - hw;
        if (b.y < lo) { b.y = lo; if (b.tv * t.y < 0) b.tv = 0; } else if (b.y > hi) { b.y = hi; if (b.tv * t.y > 0) b.tv = 0; }
      }
      // small tilts: he leans to stay upright against the real gravity
      const lean = (b.rollOverride != null || b.task && b.taskPrio >= 2 ? 0 : clamp(this.tilt || 0, -0.5, 0.5) * (seated ? 0.25 : 0.55)) + (b.runLean || 0);
      setRoll(b, b.rollOverride != null ? b.rollOverride : M.atan2(-n.x, -n.y) + lean);
      b.walkPhase += M.abs(b.tv) * dt / (u * 1.1);
      b.walkAmt = lerp(b.walkAmt, M.min(1, M.abs(b.tv) / (u * 5)), M.min(1, dt * 8));
      if (seated && !b.lockYaw) b.yaw.t = 0;
      else if (this.opts.yaw3d !== false && M.abs(b.tv) > u * 0.8 && b.rollOverride == null && !b.lockYaw) b.yaw.t = M.sign(b.tv) * 0.6;
      else if (!b.lockYaw && M.abs(b.walk) < u * 0.3 && M.abs(b.tv) < u * 1.2) b.yaw.t = 0; // face the user when not walking
      return;
    }
    // airborne
    b.airTime += dt;
    b.vx += g.x * dt; b.vy += g.y * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.walkAmt = lerp(b.walkAmt, 0, M.min(1, dt * 4));
    if (b.trick) this.doTrick(b, dt);
    else setRoll(b, b.rollOverride != null ? b.rollOverride : M.atan2(gd.x, gd.y));
    if (b.noClip) return;
    // platforms (only when gravity points down the screen)
    if (this.platOn && gd.y > 0.7 && b.vy > 0) {
      for (let i = 0; i < this.platforms.length; i++) {
        const p = this.platforms[i];
        if (b.x > p.x0 - u && b.x < p.x1 + u && b.y >= p.y && b.y - b.vy * dt <= p.y + 1) { b.y = p.y; this.land(b, { plat: i }, { x: 0, y: -1 }); return; }
      }
    }
    // screen edges: centre of a box around the body
    const up = { x: -gd.x, y: -gd.y };
    const cx = b.x + up.x * 4 * u, cy = b.y + up.y * 4 * u;
    const rx = M.abs(gd.y) > M.abs(gd.x) ? hw : 4.2 * u, ry = M.abs(gd.y) > M.abs(gd.x) ? 4.2 * u : hw;
    const edges = [];
    if (cy + ry > bd.y1) edges.push(['b', { x: 0, y: -1 }]);
    if (cy - ry < bd.y0) edges.push(['t', { x: 0, y: 1 }]);
    if (cx - rx < bd.x0) edges.push(['l', { x: 1, y: 0 }]);
    if (cx + rx > bd.x1) edges.push(['r', { x: -1, y: 0 }]);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i][0], n = edges[i][1];
      const into = b.vx * n.x + b.vy * n.y; // negative = moving into the edge
      const floorish = n.x * up.x + n.y * up.y > 0.6;
      // push back inside
      if (e === 'b') b.y -= cy + ry - bd.y1; else if (e === 't') b.y += bd.y0 - (cy - ry); else if (e === 'l') b.x += bd.x0 - (cx - rx); else b.x -= cx + rx - bd.x1;
      if (floorish && into <= 0) { this.land(b, { e: e }, n); return; }
      if (into < 0) {
        if (b.onWall && b.onWall(e, n)) return;
        const k = 1.35; b.vx -= n.x * into * k; b.vy -= n.y * into * k;
        if (-into > 600 * this.U / 7 && this.onBotWall) this.onBotWall(b, e, -into);
      }
    }
  }
  land(b, ground, n) {
    const t = { x: -n.y, y: n.x };
    const vn = -(b.vx * n.x + b.vy * n.y);
    b.tv = (b.vx * t.x + b.vy * t.y) * 0.5;
    b.ground = ground; b.vx = b.vy = 0;
    const air = b.airTime; b.airTime = 0;
    const trick = b.trick; b.trick = null;
    if (trick) { b.flip = 0; b.twist = 0; }
    if (vn > 300 * this.U / 7) { b.sy.vel -= M.min(14, vn / (b.u * 10)); b.sx.vel += 4; }
    if (b.onLand) { const f = b.onLand; b.onLand = null; f(vn, air, trick); }
    else if (this.onBotLand) this.onBotLand(b, vn, air, trick);
  }
  doTrick(b, dt) {
    const tr = b.trick; tr.t += dt;
    const k = M.min(1, tr.t / tr.dur);
    const e = easeInOut(k);
    if (tr.flip) b.flip = tr.flip * e;
    if (tr.twist) b.twist = tr.twist * e;
    if (tr.spin) b.rollOverride = M.atan2(this.gdir.x, this.gdir.y) + tr.spin * e;
    if (k >= 1) { b.flip = 0; b.twist = 0; if (tr.spin) b.rollOverride = null; b.trick = null; b.sx.vel += 2; }
    else { b.sy.t = 1; }
    setRoll(b, b.rollOverride != null ? b.rollOverride : M.atan2(this.gdir.x, this.gdir.y));
  }
  jumpTo(b, tx, ty, apex) { // ballistic jump under the current gravity (down the screen)
    const G = this.gravity().y || 2600;
    const top = M.max(M.min(b.y, ty) - (apex || 6 * b.u), this.bounds.y0 + 8.9 * b.u); // keep the head below the top edge
    const vy = -M.sqrt(M.max(1, 2 * G * (b.y - top)));
    const tu = -vy / G, td = M.sqrt(M.max(0, 2 * (ty - top) / G));
    const T = tu + td;
    b.ground = null; b.vx = (tx - b.x) / T; b.vy = vy; b.airTime = 0;
    return T;
  }
  update(dt) {
    this.T += dt;
    this.bots.forEach((b) => this.stepBot(b, dt));
    if (this.tool) this.tool.update(dt);
    this.fx.update(dt);
    this.shake = M.max(0, this.shake - dt * this.U * 4); this.flash = M.max(0, this.flash - dt * 3.5);
  }
  draw() {
    const ctx = this.ctx, D = this.DPR;
    ctx.setTransform(D, 0, 0, D, 0, 0); ctx.clearRect(0, 0, this.W, this.H);
    if (this.shake) ctx.translate(rnd(-this.shake, this.shake), rnd(-this.shake, this.shake));
    this.drawHooks.forEach((h) => h(ctx, 'back'));
    // shadows
    this.bots.forEach((b) => {
      if (b.gone || b.alpha < 0.05) return;
      const u = b.u;
      if (b.mode === 'top') {
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 0.2 * u, 5.4 * u, 1.9 * u, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 0.2 * u, 7 * u, 2.6 * u, 0, 0, PI * 2); ctx.fill(); ctx.restore(); return;
      }
      if (this.gdir.y > 0.7 && !b.noClip) {
        const fy = b.ground ? b.y : this.bounds.y1; const air = clamp((fy - b.y) / (10 * u), 0, 1);
        if (fy - b.y < 14 * u) { ctx.fillStyle = 'rgba(0,0,0,' + (0.16 * (1 - air * 0.7)) + ')'; const sw = 10 * u * b.sx.v * (1 - air * 0.4); ctx.fillRect(b.x - sw / 2, fy + 0.05 * u, sw, 0.5 * u); }
      }
    });
    const order = this.bots.slice().sort((a, b) => (a.mode === 'top' ? a.y : 0) - (b.mode === 'top' ? b.y : 0));
    order.forEach((b) => drawBot(ctx, b, this.T));
    if (this.tool) this.tool.draw(ctx);
    this.fx.draw(ctx);
    this.drawHooks.forEach((h) => h(ctx, 'front'));
    if (this.flash > 0) { ctx.setTransform(D, 0, 0, D, 0, 0); ctx.fillStyle = 'rgba(255,255,255,' + this.flash * 0.45 + ')'; ctx.fillRect(0, 0, this.W, this.H); }
  }
}
CL.World = World;

/* ---------------------------------------------------------------- the hitting tool */
class Tool {
  constructor(world) {
    this.w = world; this.kind = 'stick'; this.x = 0; this.y = 0; this.a = 0; this.homeX = 0; this.homeY = 0;
    this.state = 'idle'; this.charge = 0; this.glow = 0; this.scale = new Spring(1, 80, 14); this.alpha = 1;
    this.anim = null; this.vx = 0; this.vy = 0; this.va = 0; this.held = false; this.hidden = false; this.target = null;
    this.onHit = null; this.lastHit = -9; this.queue = 0; this.pressT = 0;
  }
  get u() { return this.w.baseU * this.w.sizeMul * this.scale.v; }
  get def() { return TOOLS[this.kind]; }
  headPoint() { const L = this.def.len * this.u * (this.def.throwable ? 0.6 : 1); return { x: this.x + M.sin(this.a) * L, y: this.y - M.cos(this.a) * L }; }
  bboxRect() {
    const L = this.def.len * this.u, h = this.headPoint();
    const x0 = M.min(this.x, h.x) - 2.6 * this.u, x1 = M.max(this.x, h.x) + 2.6 * this.u, y0 = M.min(this.y, h.y) - 2.6 * this.u, y1 = M.max(this.y, h.y) + 1.5 * this.u;
    void L; return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  restTo(x, y) { this.homeX = x; this.homeY = y; if (this.state === 'idle') { this.x = x; this.y = y; } }
  attack(target, power, opts) { // target: {x,y} screen point; returns duration
    opts = opts || {};
    const d = this.def, from = { x: this.x, y: this.y, a: this.a };
    const dx = from.x - target.x, dy = from.y - target.y, dist = M.hypot(dx, dy) || 1;
    const L = d.len * this.u;
    let gx, gy, ga;
    if (d.throwable) { gx = target.x; gy = target.y; ga = 0; }
    else if (d.punch) { const nx = dx / dist, ny = dy / dist; gx = target.x + nx * L * 0.95; gy = target.y + ny * L * 0.95; ga = M.atan2(-nx, ny); }
    else {
      const side = dx >= 0 ? 1 : -1; // strike from the side the tool is on, coming slightly from above
      const ang = side > 0 ? -1.85 + (opts.down || 0) : 1.85 - (opts.down || 0);
      gx = target.x - M.sin(ang) * L; gy = target.y + M.cos(ang) * L; ga = ang;
    }
    const rapid = opts.rapid;
    const travel = M.hypot(gx - from.x, gy - from.y);
    const dur = d.throwable ? clamp(0.25 + travel / 2200, 0.25, 0.7) : rapid ? clamp(0.09 + travel / 6000, 0.09, 0.2) : clamp(0.16 + travel / 3000, 0.16, 0.45);
    this.state = 'attack'; this.queue = 0;
    this.anim = { t: 0, dur: dur, from: from, to: { x: gx, y: gy, a: ga }, wind: rapid || d.throwable || d.punch ? 0 : 0.35, power: power, target: target, info: opts, side: dx >= 0 ? 1 : -1 };
    CL.sfx.swish();
    return dur;
  }
  update(dt) {
    this.scale.step(dt);
    this.glow = this.state === 'charge' ? this.charge : M.max(0, this.glow - dt * 3);
    if (this.state === 'idle' && !this.held) {
      const bob = M.sin(this.w.T * 1.7) * 0.25 * this.u;
      this.x = lerp(this.x, this.homeX, M.min(1, dt * 10)); this.y = lerp(this.y, this.homeY + bob, M.min(1, dt * 10));
      const ta = this.def.throwable ? M.sin(this.w.T * 1.3) * 0.08 : -0.12 * this.side() + M.sin(this.w.T * 1.3) * 0.04;
      this.a = lerp(this.a, ta, M.min(1, dt * 10));
    } else if (this.state === 'charge') {
      this.charge = M.min(1, this.charge + dt / 1.5);
      const tr = this.charge * 0.06 * M.sin(this.w.T * 55);
      this.a = lerp(this.a, this.side() * (0.5 + this.charge * 0.5) + tr, 0.3);
    } else if (this.state === 'attack') {
      const A = this.anim; A.t += dt / A.dur;
      const t = M.min(1, A.t), f = A.from, to = A.to, w = A.wind;
      if (this.def.throwable) {
        const e = t; this.x = lerp(f.x, to.x, e); this.y = lerp(f.y, to.y, e) - M.sin(t * PI) * 60 * (this.w.U / 7); this.a += dt * 12;
      } else if (t < w) {
        const k = easeOut(t / w); this.a = lerp(f.a, f.a + 0.9 * A.side, k); A.wa = this.a; A.wx = this.x; A.wy = this.y;
      } else {
        const k = easeIn((t - w) / (1 - w)), bx = w ? A.wx : f.x, by = w ? A.wy : f.y, ba = w ? A.wa : f.a;
        this.x = lerp(bx, to.x, k); this.y = lerp(by, to.y, k); this.a = lerp(ba, to.a, k);
      }
      if (this.kind === 'feather' && t >= 1) { // tickle wiggle before the "hit"
        if (!A.tick) { A.tick = 0; }
        A.tick += dt; this.a = to.a + M.sin(A.tick * 40) * 0.35; this.x = to.x + M.sin(A.tick * 30) * this.u;
        if (A.tick < 0.45) return;
      }
      if (A.t >= 1) {
        this.lastHit = this.w.T;
        const info = { power: A.power, x: A.target.x, y: A.target.y, kind: this.kind, opts: A.info };
        if (this.def.throwable) { this.alpha = 0; this.state = 'respawn'; this.anim = { t: 0 }; }
        else { this.state = 'recoil'; this.anim = { t: 0, dur: this.queue ? 0.05 : 0.26, from: { x: this.x, y: this.y, a: this.a } }; }
        if (this.onHit) this.onHit(info);
      }
    } else if (this.state === 'recoil') {
      const A = this.anim; A.t += dt / A.dur;
      const e = easeInOut(M.min(1, A.t)), kk = M.sin(M.min(1, A.t) * PI) * 0.35;
      this.x = lerp(A.from.x, this.homeX, e); this.y = lerp(A.from.y, this.homeY, e); this.a = lerp(A.from.a + kk, 0, e);
      if (A.t >= 1) { this.state = 'idle'; if (this.queue && this.onQueue) { this.queue--; this.onQueue(); } }
    } else if (this.state === 'respawn') {
      this.anim.t += dt; this.x = this.homeX; this.y = this.homeY;
      if (this.anim.t > 0.35) { this.alpha = 1; this.scale.v = 0.2; this.scale.t = this.scale.t || 1; this.state = 'idle'; CL.sfx.pop(); if (this.queue && this.onQueue) { this.queue--; this.onQueue(); } }
    } else if (this.state === 'fly') { // thrown by the user or by Clawd
      const g = this.w.gravity();
      this.vx *= M.pow(0.7, dt); this.vy += g.y * 0.7 * dt; this.vx += g.x * 0.7 * dt;
      this.x += this.vx * dt; this.y += this.vy * dt; this.a += this.va * dt;
      const bd = this.w.bounds, m = 2 * this.u;
      if (this.x < bd.x0 + m) { this.x = bd.x0 + m; this.vx = M.abs(this.vx) * 0.4; }
      if (this.x > bd.x1 - m) { this.x = bd.x1 - m; this.vx = -M.abs(this.vx) * 0.4; }
      if (this.y < bd.y0 + this.def.len * this.u) { this.y = bd.y0 + this.def.len * this.u; this.vy = M.abs(this.vy) * 0.3; }
      if (this.y > bd.y1) { this.y = bd.y1; this.vy = -M.abs(this.vy) * 0.3; this.va *= 0.5; if (M.abs(this.vy) < 120) { this.state = 'idle'; this.homeX = this.x; this.homeY = bd.y1; this.vy = 0; CL.sfx.land(); if (this.onLanded) this.onLanded(); } }
      if (this.onFlyStep) this.onFlyStep(dt);
    }
  }
  side() { const b = this.w.bots[0]; return b && this.x < b.x ? -1 : 1; }
  draw(ctx) {
    if (this.hidden || this.alpha <= 0.02) return;
    const u = this.u;
    ctx.save(); ctx.globalAlpha = this.alpha; ctx.translate(this.x, this.y); ctx.rotate(this.a);
    drawTool(ctx, this.kind, u, this.glow, this.w.T);
    ctx.restore();
    if (this.state === 'charge') {
      const bw = 4.4 * u, bh = 0.7 * u, bx = this.x - bw / 2, by = this.y + 0.9 * u;
      ctx.fillStyle = COL.ink; ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4); ctx.fillStyle = '#fff'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = this.charge >= 1 ? (M.sin(this.w.T * 30) > 0 ? COL.red : COL.yellow) : mixHex('#FFD43B', '#D9443A', this.charge);
      ctx.fillRect(bx, by, bw * this.charge, bh);
    }
  }
}
CL.Tool = Tool;
})();
