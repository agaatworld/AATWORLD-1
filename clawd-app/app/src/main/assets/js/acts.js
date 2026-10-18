/* Routines: little animated scripts written as generators. Each `yield` waits one frame and returns dt.
   B = the brain (speech, settings, world), b = the bot that acts. */
(function () {
'use strict';
const CL = window.CL, u = CL.u, M = Math, PI = M.PI, TAU = PI * 2;
const { rnd, pick, clamp, lerp, chance } = u;
const wait = CL.wait, tween = CL.tween, until = CL.until;
const R = (CL.R = {});
function* loop(dur, fn) { let t = 0; while (t < dur) { const dt = yield; t += dt; if (fn && fn(t, dt) === false) return; } }
R.loop = loop;

/* ---------------------------------------------------------------- small idle actions */
R.lookAround = function* (B, b) {
  const seq = [[-1, 0], [1, 0], [0.6, -0.8], [0, 0]];
  for (const s of seq) { b.look.tx = s[0]; b.look.ty = s[1]; yield* wait(rnd(0.4, 0.8)); }
  if (chance(0.35)) b.setFace(pick(['sideeye', 'sideeyeL', 'suspicious', 'puzzled']), 1.4);
};
R.wave = function* (B, b) {
  b.setFace(pick(['happy', 'joy', 'wink', 'wideHappy']), 1.5);
  yield* loop(1.3, (t) => { b.aR.t = -2.3 + M.sin(t * 16) * 0.45; });
  b.aR.t = 0;
};
R.stretch = function* (B, b) {
  b.setFace('relieved', 1.6); b.aL.t = -2.6; b.aR.t = -2.6; b.sy.t = 1.18; b.sx.t = 0.9;
  yield* wait(0.9); b.sy.t = 1; b.sx.t = 1; b.aL.t = 0; b.aR.t = 0; yield* wait(0.3);
};
const calm = (B) => B.worshipGlow > B.T; // a few minutes after worship: peaceful, never bored or sleepy-looking
R.yawn = function* (B, b) { if (calm(B)) { yield* R.lookAround(B, b); return; } b.setFace('sleepy', 0.4); yield* wait(0.3); b.setFace('laugh', 1); b.sy.t = 1.08; b.aR.t = -1.2; b.fwdR.t = 0.6; yield* wait(1); b.sy.t = 1; b.aR.t = 0; b.fwdR.t = 0; };
R.scratch = function* (B, b) { b.setFace(pick(['puzzled', 'think', 'skeptical']), 1.6); B.mark(b, '؟'); yield* loop(1.4, (t) => { b.aR.t = -2.5 + M.sin(t * 22) * 0.18; b.fwdR.t = 0.3; }); b.aR.t = 0; b.fwdR.t = 0; };
R.hop = function* (B, b) { if (!b.ground || b.ground.e !== 'b' && b.ground.plat == null) return; b.vy = -55 * b.u; b.vx = 0; b.ground = null; CL.sfx.jump(); yield* until(() => b.ground, 3); };
R.sideEyeTool = function* (B, b) {
  const tp = B.toolPos(); if (!tp) return;
  b.look.tx = tp.x > b.x ? 1 : -1; b.look.ty = 0; b.setFace(tp.x > b.x ? 'sideeye' : 'sideeyeL', 2.2);
  if (chance(0.5)) B.say(b, 'look_tool', { prio: 1 });
  yield* wait(2.2); b.look.tx = 0;
};
R.watch = function* (B, b) { b.fwdL.t = 1; b.aL.t = -0.6; b.look.tx = -0.6; b.look.ty = 0.6; b.setFace('think', 1.4); yield* wait(1.4); b.fwdL.t = 0; b.aL.t = 0; b.look.tx = b.look.ty = 0; };
R.sneeze = function* (B, b) {
  b.setFace('shut', 0.6); b.sy.t = 1.12; yield* wait(0.5);
  b.sy.t = 0.8; b.vx = 0; B.w.fx.puff(b.head.x, b.head.y + 4 * b.u, b.u, '#fff', 2); B.w.fx.word('عطس!', b.head.x, b.head.y, b.u * 1.3, '#fff');
  CL.sfx.whiff(); yield* wait(0.3); b.sy.t = 1; B.sayText(b, CL.lineOf(['s|الحمد لله', 'e|الحمد لله', 'f|الحمد لله']), { prio: 1, mood: 'calm' });
};
R.stare = function* (B, b) { b.look.tx = 0; b.look.ty = 0.3; b.setFace(pick(calm(B) ? ['serene', 'happy', 'relieved'] : ['bored', 'suspicious', 'skeptical', 'smug']), 2.5); b.pv.t = 0.3; yield* wait(2.5); b.pv.t = 0.12; };
R.sitAWhile = function* (B, b) { b.sit.t = 1; b.setFace(pick(calm(B) ? ['serene', 'happy', 'normal'] : ['bored', 'normal', 'sideeye']), 3); b.look.tx = pick([-1, 1]); yield* wait(rnd(3, 5)); b.look.tx = 0; b.sit.t = 0; };
R.pushups = function* (B, b) { yield* R.exercise(B, b, 'pushups', 6); };
R.peekCamera = function* (B, b) { b.pv.t = 0.36; b.setFace(pick(['wideHappy', 'surprised', 'tongue']), 1.6); b.look.ty = -1; yield* wait(1.6); b.pv.t = 0.12; b.look.ty = 0; };
R.turnAround = function* (B, b) { b.lockYaw = true; yield* tween(0.9, (k) => { b.yaw.t = k * TAU; }); b.yaw.set(0); b.lockYaw = false; };
R.idleSmall = [R.lookAround, R.wave, R.stretch, R.yawn, R.scratch, R.hop, R.sideEyeTool, R.watch, R.sneeze, R.stare, R.sitAWhile, R.peekCamera, R.turnAround];

/* ---------------------------------------------------------------- dressing helpers */
function dress(B, b, o) { const prev = Object.assign({}, b.outfit); Object.keys(o).forEach((k) => { b.outfit[k] = o[k]; }); return prev; }
function dressFx(B, b) { // a little white puff so changing clothes looks deliberate, not like a glitch
  const bb = b.bbox; if (!bb || !B.w.fx) return;
  for (let i = 0; i < 7; i++) B.w.fx.puff(bb.x + rnd(0.1, 0.9) * bb.w, bb.y + rnd(0.3, 1) * bb.h, b.u, '#FFFFFF', rnd(1, 3));
}
function religious(B, b) { if (B.s.outfit && !b.outfit.robe) { dress(B, b, { robe: 1, cap: 1 }); dressFx(B, b); } }
function undress(B, b) { if (b.outfit.robe || b.outfit.cap) { b.outfit.robe = b.outfit.cap = 0; dressFx(B, b); } }

/* ---------------------------------------------------------------- activities (long, interruptible) */
R.tasbih = function* (B, b) {
  B.activity = 'tasbih'; religious(B, b); B.say(b, 'act_tasbih');
  try {
    yield* wait(1); b.sit.t = 1; b.prop = { kind: 'tasbih', count: 0 }; b.baseFace = 'serene'; b.aR.t = -0.4; b.fwdR.t = 0.5;
    const start = CL.bag('tasbih-start', 3);
    for (let s = start; s < start + 3; s++) {
      const item = CL.TASBIH[s % 3];
      B.sayText(b, item[0], { prio: 1, mood: 'calm', small: true, dur: 2 });
      for (let i = 1; i <= item[1]; i++) {
        yield* wait(0.55); b.prop.count++; if (B.s.sound && i % 3 === 0) CL.sfx.click();
        if (i % 11 === 0) B.mark(b, item[0] + ' ' + B.num(i));
      }
    }
    B.sayText(b, CL.DHIKR[9], { prio: 1, mood: 'calm', dur: 4 }); yield* wait(4);
  } finally { b.prop = null; b.sit.t = 0; b.baseFace = 'normal'; b.aR.t = 0; b.fwdR.t = 0; undress(B, b); B.worshipGlow = B.T + 180; B.activity = null; }
};
R.dua = function* (B, b) {
  B.activity = 'dua'; religious(B, b);
  try {
    b.sit.t = 1; yield* wait(0.6); b.baseFace = 'serene'; b.fwdL.t = 1; b.fwdR.t = 1; b.aL.t = -0.9; b.aR.t = -0.9;
    B.say(b, 'act_dua', { mood: 'calm' }); yield* wait(2.2);
    const d = CL.DUA[CL.bag('dua', CL.DUA.length)];
    B.sayText(b, d, { prio: 1, mood: 'calm', dur: 4 }); yield* wait(4.5);
    B.sayText(b, 'آمين 🤲', { prio: 1, mood: 'calm', dur: 1.6 });
    yield* tween(1.2, (k) => { b.aL.t = b.aR.t = -0.9 - k * 1.2; }); // wiping face
    yield* wait(0.4);
  } finally { b.sit.t = 0; b.baseFace = 'normal'; b.fwdL.t = b.fwdR.t = 0; b.aL.t = b.aR.t = 0; undress(B, b); B.worshipGlow = B.T + 180; B.activity = null; }
};
R.quran = function* (B, b) {
  B.activity = 'quran'; religious(B, b); B.say(b, 'act_quran', { mood: 'calm' });
  try {
    yield* wait(1.2); b.sit.t = 1; b.prop = { kind: 'mushaf', turn: 0 }; b.baseFace = 'serene'; b.look.ty = 0.7; b.fwdL.t = 0.4; b.fwdR.t = 0.4;
    const dur = rnd(40, 70); let nextVerse = 6, nextPage = 9;
    yield* loop(dur, (t) => {
      b.flip = M.sin(t * 2.4) * 0.06; // gentle rocking while reading
      if (t > nextPage) { nextPage = t + rnd(8, 12); b.prop.turn = 0.01; if (B.s.sound) CL.sfx.page(); }
      if (b.prop.turn > 0) { b.prop.turn += 0.05; if (b.prop.turn >= 1) b.prop.turn = 0; }
      if (t > nextVerse) { nextVerse = t + rnd(14, 20); const v = CL.verse(); B.sayText(b, '﴿' + v.t + '﴾  ' + v.r, { prio: 1, mood: 'calm', dur: 5, quran: true }); }
    });
    B.say(b, 'act_done', { mood: 'calm' });
  } finally { b.flip = 0; b.prop = null; b.sit.t = 0; b.baseFace = 'normal'; b.look.ty = 0; b.fwdL.t = b.fwdR.t = 0; undress(B, b); B.worshipGlow = B.T + 180; B.activity = null; }
};
R.study = function* (B, b) {
  B.activity = 'study'; b.outfit.glasses = 1; B.say(b, 'act_study');
  try {
    yield* wait(0.8); b.sit.t = 1; b.prop = { kind: 'study', lines: 0 }; b.baseFace = 'focus'; b.look.ty = 0.8; b.fwdR.t = 0.6; b.aR.t = 0.3;
    const dur = rnd(30, 55); let aha = rnd(12, dur - 5), done = false, next = 1;
    yield* loop(dur, (t, dt) => {
      if (t > next) { next = t + rnd(0.5, 1.2); b.prop.lines++; }
      if (chance(dt * 0.12)) { b.setFace(pick(['think', 'puzzled', 'skeptical']), 1.5); B.mark(b, pick(['؟', '…', '؟؟'])); }
      if (!done && t > aha) { done = true; b.setFace('starry', 1.5); B.say(b, 'study_aha', { prio: 1, mood: 'happy' }); b.vy = -40 * b.u; b.ground = null; }
    });
  } finally { b.prop = null; b.sit.t = 0; b.baseFace = 'normal'; b.look.ty = 0; b.fwdR.t = 0; b.aR.t = 0; b.outfit.glasses = 0; B.activity = null; }
};
R.martial = function* (B, b) {
  B.activity = 'martial'; b.outfit.headband = 1; B.say(b, 'act_martial');
  try {
    b.baseFace = 'determined'; yield* wait(0.8);
    const moves = ['punchL', 'punchR', 'kick', 'block', 'jumpKick', 'spinKick', 'punchR', 'kick'];
    for (let n = 0; n < 9; n++) {
      const m = moves[CL.bag('kata', moves.length)];
      yield* R.move(B, b, m);
      if (chance(0.35)) { B.say(b, 'kiai', { prio: 1, mood: 'angry', dur: 0.8 }); if (B.s.sound) CL.sfx.kiai(); }
      yield* wait(rnd(0.2, 0.5));
    }
    b.flip = 0.4; yield* wait(0.6); b.flip = 0; // bow
  } finally { b.baseFace = 'normal'; b.outfit.headband = 0; b.aL.t = b.aR.t = 0; b.fwdL.t = b.fwdR.t = 0; b.flip = 0; B.activity = null; }
};
R.move = function* (B, b, m) { // one martial-arts move (also used when sparring)
  const s = b.facing || 1;
  if (m === 'punchL' || m === 'punchR') {
    const L = m === 'punchL';
    (L ? b.fwdL : b.fwdR).t = 1; (L ? b.aL : b.aR).t = -1.4; b.yaw.t = 0.5 * s; b.sx.vel += 3;
    yield* wait(0.18); (L ? b.fwdL : b.fwdR).t = 0; (L ? b.aL : b.aR).t = 0; yield* wait(0.1);
  } else if (m === 'kick') {
    b.yaw.t = 1.2 * s; b.legs[3] = -1.6; b.legs[2] = -1.2; yield* wait(0.25); b.yaw.t = 0;
  } else if (m === 'block') {
    b.aL.t = -1.9; b.aR.t = -1.9; b.fwdL.t = 0.6; b.fwdR.t = 0.6; yield* wait(0.4); b.aL.t = b.aR.t = 0; b.fwdL.t = b.fwdR.t = 0;
  } else if (m === 'jumpKick') {
    if (b.ground) { b.vy = -60 * b.u; b.ground = null; b.trick = { t: 0, dur: 0.55, twist: TAU * s }; CL.sfx.jump(); }
    b.legs[3] = -1.6; yield* until(() => b.ground, 2);
  } else if (m === 'spinKick') {
    b.lockYaw = true; yield* tween(0.45, (k) => { b.yaw.t = k * TAU * s; b.legs[3] = -1.4; }); b.yaw.set(0); b.lockYaw = false;
  }
};
R.exercise = function* (B, b, kind, reps) {
  B.activity = 'exercise'; b.outfit.headband = 1;
  kind = kind || pick(['pushups', 'squats', 'jacks']); reps = reps || ((rnd(8, 14)) | 0);
  B.say(b, 'act_exercise');
  try {
    yield* wait(0.8); b.baseFace = 'determined';
    if (kind === 'pushups') {
      b.lockYaw = true; b.yaw.t = PI / 2; b.pivotY = 2; yield* tween(0.5, (k) => { b.flip = k * PI / 2; });
      for (let i = 1; i <= reps; i++) { yield* tween(0.35, (k) => { b.oy = -M.sin(k * PI) * 1.4 * b.u; }); B.mark(b, B.num(i)); }
      yield* tween(0.5, (k) => { b.flip = (1 - k) * PI / 2; }); b.yaw.t = 0; b.lockYaw = false; b.pivotY = 5; b.oy = 0;
    } else if (kind === 'squats') {
      b.fwdL.t = b.fwdR.t = 1; b.aL.t = b.aR.t = -1.5;
      for (let i = 1; i <= reps; i++) { b.sit.t = 0.8; yield* wait(0.4); b.sit.t = 0; yield* wait(0.4); B.mark(b, B.num(i)); }
      b.fwdL.t = b.fwdR.t = 0; b.aL.t = b.aR.t = 0;
    } else {
      for (let i = 1; i <= reps; i++) { b.aL.t = b.aR.t = -2.8; if (b.ground) { b.vy = -30 * b.u; b.ground = null; } yield* wait(0.35); b.aL.t = b.aR.t = 0; yield* wait(0.3); B.mark(b, B.num(i)); }
    }
    b.setFace('proud', 1.5); b.flush = 0.4;
  } finally { b.baseFace = 'normal'; b.outfit.headband = 0; b.flip = 0; b.pivotY = 5; b.oy = 0; b.lockYaw = false; b.sit.t = 0; b.fwdL.t = b.fwdR.t = 0; b.aL.t = b.aR.t = 0; B.activity = null; }
};
R.book = function* (B, b) {
  B.activity = 'book'; B.say(b, 'act_book');
  try {
    if (chance(0.5)) b.outfit.glasses = 1;
    b.sit.t = 1; b.prop = { kind: 'book', turn: 0, color: pick(['#3A5BA0', '#8E3B46', '#2E7D4F', '#6B4E8E']) }; b.fwdL.t = 1; b.fwdR.t = 1; b.aL.t = -0.6; b.aR.t = -0.6; b.look.ty = 0.5; b.baseFace = 'normal';
    let next = 6;
    yield* loop(rnd(25, 45), (t, dt) => {
      if (t > next) { next = t + rnd(6, 10); b.prop.turn = 0.01; if (B.s.sound) CL.sfx.page(); }
      if (b.prop.turn > 0) { b.prop.turn += 0.05; if (b.prop.turn >= 1) b.prop.turn = 0; }
      if (chance(dt * 0.1)) b.setFace(pick(['surprised', 'laugh', 'think', 'sad', 'starry', 'puzzled']), 1.4);
    });
  } finally { b.prop = null; b.sit.t = 0; b.fwdL.t = b.fwdR.t = 0; b.aL.t = b.aR.t = 0; b.look.ty = 0; b.outfit.glasses = 0; B.activity = null; }
};
R.tea = function* (B, b) {
  B.activity = 'tea'; B.say(b, 'act_tea');
  try {
    b.sit.t = 1; b.prop = { kind: 'tea', sip: 0 }; b.aR.t = -0.3; b.fwdR.t = 0.5; b.baseFace = 'relieved';
    for (let i = 0; i < 4; i++) {
      yield* loop(rnd(3, 5), (t, dt) => { if (chance(dt * 3)) B.w.fx.puff(b.x + 4.3 * b.u, b.y - 6 * b.u, b.u * 0.4, 'rgba(255,255,255,.8)', 2); });
      yield* tween(0.5, (k) => { b.prop.sip = k; b.aR.t = -0.3 - k * 1.2; }); b.setFace('relieved', 1);
      yield* wait(0.6); yield* tween(0.5, (k) => { b.prop.sip = 1 - k; b.aR.t = -1.5 + k * 1.2; });
      if (i === 1) B.say(b, 'tea_sip', { prio: 1, mood: 'calm' });
    }
  } finally { b.prop = null; b.sit.t = 0; b.aR.t = 0; b.fwdR.t = 0; b.baseFace = 'normal'; B.activity = null; }
};
R.sleep = function* (B, b) {
  B.activity = 'sleep'; b.outfit.nightcap = 1;
  try {
    b.sit.t = 1; b.baseFace = 'sleep';
    yield* loop(rnd(30, 60), (t, dt) => { b.sy.t = 0.95 + M.sin(t * 1.6) * 0.03; if (chance(dt * 0.9)) B.w.fx.zzz(b.head.x + 2 * b.u, b.head.y, b.u); });
  } finally { b.sit.t = 0; b.sy.t = 1; b.baseFace = 'normal'; b.outfit.nightcap = 0; B.activity = null; }
};
R.juggle = function* (B, b) {
  B.activity = 'juggle'; B.say(b, 'act_juggle', { mood: 'happy' });
  try {
    b.prop = { kind: 'juggle' }; b.fwdL.t = b.fwdR.t = 0.8; b.baseFace = 'wideHappy';
    yield* loop(rnd(6, 10), (t) => { b.aL.t = -0.8 + M.sin(t * 8.4) * 0.5; b.aR.t = -0.8 - M.sin(t * 8.4) * 0.5; b.look.ty = -1; b.look.tx = M.sin(t * 4.2) * 0.8; });
    if (chance(0.4)) { b.setFace('shocked', 1.2); B.sayText(b, CL.lineOf(['s|أوبس!', 'e|أوبا!', 'f|أوه!']), { prio: 1, mood: 'scared' }); }
  } finally { b.prop = null; b.fwdL.t = b.fwdR.t = 0; b.aL.t = b.aR.t = 0; b.look.tx = b.look.ty = 0; b.baseFace = 'normal'; B.activity = null; }
};
R.plant = function* (B, b) {
  B.activity = 'plant';
  const g = CL.store('plant') || { grow: 0.15, day: '' };
  const today = new Date().toDateString();
  B.say(b, 'act_plant');
  try {
    b.prop = { kind: 'plant', grow: g.grow, water: 1 }; b.aR.t = -0.8; b.fwdR.t = 0.3; b.baseFace = 'joy'; b.yaw.t = 0.5;
    yield* wait(4);
    if (g.day !== today) { g.grow = M.min(1, g.grow + 0.08); g.day = today; CL.store('plant', g); }
    b.prop.water = 0; b.prop.grow = g.grow; b.aR.t = 0; b.fwdR.t = 0;
    yield* wait(2.5);
  } finally { b.prop = null; b.aR.t = 0; b.fwdR.t = 0; b.baseFace = 'normal'; b.yaw.t = 0; B.activity = null; }
};
/* ---------------------------------------------------------------- parkour and moving around */
R.trick = function (b, T) { // pick an air trick that fits the time in the air
  const s = b.vx >= 0 ? 1 : -1;
  const opts = T > 0.9 ? [{ flip: 2 * TAU * s }, { flip: TAU * s, twist: TAU }, { twist: 2 * TAU }, { flip: -2 * TAU * s }]
    : T > 0.5 ? [{ flip: TAU * s }, { flip: -TAU * s }, { twist: TAU }, { spin: TAU * -s }, { flip: TAU * s, twist: PI * 2 }]
    : [{ flip: TAU * s }, { twist: TAU }];
  const o = Object.assign({ t: 0, dur: T * 0.82 }, opts[CL.bag('trick' + opts.length, opts.length)]);
  return o;
};
R.jump = function* (B, b, tx, ty, apex, trick) {
  const T = B.w.jumpTo(b, tx, ty, apex);
  if (trick !== false && T > 0.42 && B.s.parkour) { b.trick = R.trick(b, T); if (B.s.sound) CL.sfx.flip(); }
  else if (B.s.sound) CL.sfx.jump();
  yield* until(() => b.ground, T + 2);
};
R.walkTo = function* (B, b, x, speed) {
  speed = speed || 5 * b.u;
  let t = 0;
  while (b.ground && M.abs(b.x - x) > b.u * 0.8 && t < 10) { b.walk = M.sign(x - b.x) * speed; t += yield; if (b.hitWall) break; }
  b.walk = 0;
};
R.wallRun = function* (B, b) {
  if (!b.ground || b.ground.e !== 'b') return;
  const bd = B.w.bounds, side = b.x > (bd.x0 + bd.x1) / 2 ? 1 : -1;
  const target = side > 0 ? bd.x1 : bd.x0;
  yield* R.walkTo(B, b, target, 11 * b.u);
  if (!b.ground) return;
  // run up the wall
  b.ground = null; b.vx = 0; b.vy = -95 * b.u;
  b.rollOverride = side > 0 ? PI / 2 : -PI / 2; // feet on the wall
  b.walkAmt = 1;
  const t0 = B.w.T;
  while (B.w.T - t0 < 0.45 && b.vy < 0) { b.walkPhase += 0.6; b.walkAmt = 1; b.x = target - side * 4 * b.u; yield; }
  // kick off with a back flip
  b.rollOverride = null; b.vx = -side * 32 * b.u; b.vy = -40 * b.u;
  b.trick = { t: 0, dur: 0.7, flip: -TAU * side }; if (B.s.sound) CL.sfx.flip();
  yield* until(() => b.ground, 3);
};
R.handstand = function* (B, b) {
  b.pivotY = 4.3; yield* tween(0.4, (k) => { b.flip = k * PI; });
  b.oy = -8.6 * b.u * 0.0; b.setFace('wideHappy', 3);
  const s = chance(0.5) ? 1 : -1;
  yield* loop(2.2, (t) => { b.walk = s * 2 * b.u; b.legs[0] = M.sin(t * 12) * 0.5; b.legs[3] = -M.sin(t * 12) * 0.5; });
  b.walk = 0; yield* tween(0.4, (k) => { b.flip = PI + k * PI; }); b.flip = 0; b.pivotY = 5;
};
R.landing = function* (B, b, vn, air, trick) { // landing styles after big falls / tricks
  const styles = ['stick', 'roll', 'superhero', 'kneel', 'tada'];
  const st = styles[CL.bag('landing', styles.length)];
  if (B.s.sound) CL.sfx.land();
  if (st === 'roll') { const s = M.sign(b.tv || 1); b.tv = s * 6 * b.u; yield* tween(0.45, (k) => { b.flip = k * TAU * s; }); b.flip = 0; b.tv = 0; }
  else if (st === 'superhero') { b.sy.v = 0.6; b.sx.v = 1.25; b.aR.t = 1.4; b.setFace('cool', 1.5); yield* wait(0.8); b.aR.t = 0; }
  else if (st === 'kneel') { b.sit.t = 0.7; b.setFace('determined', 1.2); yield* wait(0.6); b.sit.t = 0; }
  else { b.aL.t = -2.6; b.aR.t = -2.6; b.setFace(pick(['proud', 'joy', 'cool']), 1.4); yield* wait(0.8); b.aL.t = b.aR.t = 0; }
  if (chance(0.45)) B.say(b, 'parkour', { prio: 1, mood: 'happy' });
};
R.parkourShow = function* (B, b) {
  B.activity = 'parkour';
  try {
    const bd = B.w.bounds, plats = B.w.platOn ? B.w.platforms : [];
    const n = (rnd(3, 6)) | 0;
    for (let i = 0; i < n; i++) {
      if (!b.ground || B.w.gdir.y < 0.7) break;
      const r = M.random();
      if (plats.length && r < 0.55) { // hop to an app icon
        const p = plats[(M.random() * plats.length) | 0];
        yield* R.jump(B, b, (p.x0 + p.x1) / 2, p.y, rnd(3, 8) * b.u);
        if (chance(0.4)) B.say(b, 'hop', { prio: 1, mood: 'happy', dur: 0.9 });
      } else if (r < 0.7) { yield* R.wallRun(B, b); }
      else if (r < 0.82) { yield* R.handstand(B, b); }
      else { const x = clamp(b.x + rnd(-1, 1) * 30 * b.u, bd.x0 + 8 * b.u, bd.x1 - 8 * b.u); yield* R.jump(B, b, x, bd.y1, rnd(8, 14) * b.u); }
      yield* wait(rnd(0.15, 0.4));
    }
    // back to the floor and home
    if (b.ground && b.ground.plat != null) yield* R.jump(B, b, B.home().x, B.w.bounds.y1, 4 * b.u);
  } finally { B.activity = null; }
};
R.iconTour = function* (B, b) { // hop from app icon to app icon on the home screen
  const plats = B.w.platforms; if (!B.w.platOn || !plats.length || !b.ground || B.w.gdir.y < 0.7) return;
  B.activity = 'parkour';
  try {
    const n = 2 + ((M.random() * 4) | 0);
    for (let i = 0; i < n && b.ground; i++) {
      const p = plats[(M.random() * plats.length) | 0];
      yield* R.jump(B, b, (p.x0 + p.x1) / 2, p.y, rnd(3, 7) * b.u, chance(0.6));
      if (chance(0.35)) B.say(b, 'hop', { prio: 1, mood: 'happy', dur: 0.9 });
      yield* wait(rnd(0.3, 0.9));
    }
    if (b.ground && b.ground.plat != null) yield* R.jump(B, b, B.home().x, B.w.bounds.y1, 4 * b.u);
  } finally { B.activity = null; }
};
R.roam = function* (B, b) { // wander along the floor, sometimes look at things
  const bd = B.w.bounds;
  const x = clamp(rnd(bd.x0, bd.x1), bd.x0 + 8 * b.u, bd.x1 - 8 * b.u);
  yield* R.walkTo(B, b, x, rnd(3, 6) * b.u);
  if (chance(0.4)) yield* R.lookAround(B, b);
};
R.goHome = function* (B, b) {
  const h = B.home();
  if (!b.ground) yield* until(() => b.ground, 4);
  if (b.ground && b.ground.plat != null) yield* R.jump(B, b, h.x, B.w.bounds.y1, 3 * b.u);
  if (b.ground && b.ground.e === 'b') yield* R.walkTo(B, b, h.x, 6 * b.u);
};
R.stroll = function* (B, b) { // dive "into" the phone and walk over the apps, seen from above
  if (!B.s.td3d || !b.ground || B.w.gdir.y < 0.6) return;
  B.activity = 'stroll';
  try {
    B.say(b, 'stroll', { mood: 'happy' });
    b.vy = -55 * b.u; b.ground = null; b.trick = { t: 0, dur: 0.5, flip: TAU }; CL.sfx.flip();
    yield* until(() => b.vy > 0, 2);
    b.trick = null; b.flip = 0; b.mode = 'top'; b.pv.t = 0.5; b.strollScale = 1.18; b.heading = rnd(PI * 0.6, PI * 1.4);
    const bd = B.w.bounds; b.y = clamp(b.y, bd.y0 + 10 * b.u, bd.y1 - 2 * b.u);
    let t = 0; const dur = rnd(14, 24);
    while (t < dur || (B.w.gmag < 0.35 && t < 90)) { // phone lying flat: he keeps walking around on it
      const dt = yield; t += dt; b.walk = 4.2 * b.u;
      if (chance(dt * 0.45)) b.heading += rnd(-1.3, 1.3);
      if (chance(dt * 0.2)) { // stop, turn to face you, then carry on
        b.walk = 0; const h = b.heading; b.heading = 0;
        b.setFace(pick(['wideHappy', 'happy', 'surprised', 'wink', 'joy', 'puzzled']), 1.6);
        if (chance(0.4)) b.aR.t = -2.2;
        yield* wait(rnd(1.1, 1.8)); b.aR.t = 0;
        b.heading = chance(0.6) ? rnd(-1.2, 1.2) : h;
      }
    }
    b.walk = 0; b.mode = 'side'; b.pv.t = 0.12; b.yaw.t = 0; b.ground = null; b.vy = -35 * b.u; b.vx = 0;
    yield* until(() => b.ground, 4);
  } finally { b.strollScale = 0; if (b.mode === 'top') { b.mode = 'side'; b.pv.t = 0.12; b.ground = null; } B.activity = null; }
};

/* ---------------------------------------------------------------- his friend Pixel */
R.friendVisit = function* (B, b) {
  if (!B.s.acts.friend || B.f) return;
  B.activity = 'friend';
  const bd = B.w.bounds, f = B.spawnFriend();
  try {
    const side = b.x < (bd.x0 + bd.x1) / 2 ? 1 : -1;
    const meet = clamp(b.x + side * 13 * b.u, bd.x0 + 8 * b.u, bd.x1 - 8 * b.u);
    f.x = side > 0 ? bd.x1 + 10 * f.u : bd.x0 - 10 * f.u; f.y = bd.y1; f.ground = { e: 'b' }; f.noEdge = true;
    // walk in
    let t = 0;
    while (M.abs(f.x - meet) > f.u && t < 8) { f.walk = M.sign(meet - f.x) * 6 * f.u; t += yield; }
    f.walk = 0; f.tv = 0; f.noEdge = false;
    b.facing = side; f.facing = -side;
    b.yaw.t = 0.45 * side; f.yaw.t = -0.45 * side; b.lockYaw = f.lockYaw = true;
    B.say(b, 'friend_arrive', { mood: 'happy' }); b.setFace('joy', 2); f.setFace('joy', 2);
    yield* R.wave(B, f);
    const k = M.random(), canDawah = B.s.acts.dawah;
    if (k < 0.35) yield* R.spar(B, b, f);
    else if (canDawah && k < 0.7) yield* R.talk(B, b, f, CL.DAWAH_TALKS[CL.bag('dawah', CL.DAWAH_TALKS.length)], true);
    else yield* R.talk(B, b, f, CL.FRIEND_TALKS[CL.bag('ftalk', CL.FRIEND_TALKS.length)]);
    B.say(b, 'friend_bye', { mood: 'happy' }); yield* R.wave(B, f);
    f.lockYaw = false; f.noEdge = true;
    const out = side > 0 ? bd.x1 + 12 * f.u : bd.x0 - 12 * f.u;
    t = 0; while (M.abs(f.x - out) > f.u && t < 6) { f.walk = M.sign(out - f.x) * 7 * f.u; t += yield; }
  } finally { B.dropFriend(); b.lockYaw = false; b.yaw.t = 0; b.facing = 1; B.activity = null; B.dawahNow = false; }
};
R.talk = function* (B, b, f, script, dawah) {
  B.dawahNow = !!dawah;
  for (const line of script) {
    const who = line[0] === 'c' ? b : f, other = who === b ? f : b;
    who.setFace(line[2] || 'talk', 3); other.setFace('normal', 0.1);
    other.look.tx = who.x > other.x ? 1 : -1; who.look.tx = other.x > who.x ? 1 : -1;
    const dur = clamp(1.6 + line[1].length * 0.07, 2, 6);
    B.sayText(who, line[1], { prio: 2, mood: who === b ? 'calm' : 'happy', dur: dur, quran: line[1].indexOf('﴿') >= 0 });
    yield* wait(dur + 0.3);
  }
  b.look.tx = f.look.tx = 0; B.dawahNow = false;
};
R.spar = function* (B, b, f) {
  B.say(b, 'spar_start', { mood: 'happy' }); b.outfit.headband = 1; f.outfit.headband = 'black';
  b.baseFace = f.baseFace = 'determined';
  try {
    yield* wait(1.2);
    for (let i = 0; i < 8; i++) {
      const att = i % 2 ? f : b, def = att === b ? f : b;
      const m = pick(['punchL', 'punchR', 'kick', 'jumpKick', 'spinKick']);
      const blocked = chance(0.5);
      yield* CL.all(R.move(B, att, m), blocked ? R.move(B, def, 'block') : null);
      if (!blocked) { def.ground && (def.tv = (def.facing || 1) * -9 * def.u); def.setFace(pick(['hurt', 'ouch', 'surprised']), 0.6); B.w.fx.burst(def.head.x, def.head.y + 3 * def.u, 6, 0.3, def.u); if (B.s.sound) CL.sfx.punch(); }
      else if (B.s.sound) CL.sfx.catch();
      yield* wait(0.35);
    }
    b.flip = 0.45; f.flip = 0.45; yield* wait(0.8); b.flip = f.flip = 0;
    B.say(b, 'spar_end', { mood: 'happy' }); yield* wait(1.5);
  } finally { b.outfit.headband = 0; f.outfit.headband = 0; b.baseFace = f.baseFace = 'normal'; b.flip = f.flip = 0; }
};
})();
