/* The brain: moods, reactions to every touch and hit, idle life, the phone's context, advice, questions.
   It talks to the page through `ui` (speech bubbles, answer buttons, vibration, chat, event log). */
(function () {
'use strict';
const CL = window.CL, u = CL.u, R = CL.R, M = Math, PI = M.PI, TAU = PI * 2;
const { rnd, pick, clamp, lerp, chance } = u;
const wait = CL.wait, tween = CL.tween, until = CL.until;
const AR = '٠١٢٣٤٥٦٧٨٩';
const RELIGIOUS = { quran: 1, tasbih: 1, dua: 1, hadith: 1 };

class Brain {
  constructor(world, ui, opts) {
    this.w = world; this.ui = ui; this.opts = opts || {}; this.arena = !!this.opts.arena;
    const c = (this.c = world.addBot('clawd'));
    this.f = null;
    const tool = (this.tool = new CL.Tool(world)); world.tool = tool;
    tool.kind = this.s.tool && this.s.tools[this.s.tool] ? this.s.tool : 'stick';
    tool.onHit = (info) => this.onToolHit(info);
    tool.onQueue = () => this.attack(0, { rapid: true });
    tool.onFlyStep = () => this.toolFlyStep();
    world.onBotLand = (b, vn, air, trick) => this.onLand(b, vn, air, trick);
    world.onBotWall = (b, e, v) => this.onWall(b, e, v);
    world.drawHooks.push((ctx, layer) => this.drawExtras(ctx, layer));
    const bd = world.bounds, h = this.home();
    c.x = h.x; c.y = bd.y1; c.ground = { e: 'b' };
    tool.userPlaced = false; this.placeTool(true);
    if (this.s.toolEdge !== false) { this.stowTool(true); tool.x = tool.homeX; tool.y = tool.homeY; } // waits behind the right edge
    this.pain = 0; this.anger = 0; this.combo = 0; this.lastHit = -9; this.hits = []; this.lastAttack = -9;
    this.rapport = CL.store('rapport') == null ? 60 : CL.store('rapport');
    this.lastUser = 0; this.nextIdle = 3; this.lastQuestion = 0; this.lastActs = []; this.activity = null;
    this.rightfulUntil = -1; this.adviceAt = -999; this.away = false; this.hiding = false; this.asking = null;
    this.confiscated = false; this.grabCooldown = 0; this.defenseBias = null; this.helmetUntil = 0; this.shieldUntil = 0;
    this.typing = false; this.field = null; this.lastTypeReact = 0; this.appKind = 'other';
    this.videoStart = null; this.lastVideoAdvice = -999; this.sessionStart = 0; this.lastUsageAdvice = 0; this.nightAdvised = '';
    this.present = true; this.praisePending = false; this.chatOpen = false; this.chatRect = null;
    this.dizzyUntil = 0; this.ko = false; this.taps = []; this.events = []; this.snowHits = [];
    this.icons = []; this.dawahNow = false;
  }
  get s() { return CL.settings; }
  get T() { return this.w.T; }
  num(n) { return String(n).replace(/\d/g, (d) => AR[d]); }
  home() {
    const bd = this.w.bounds, U = this.w.U * (this.c ? this.c.scale.v : 1);
    if (this.arena) return { x: (bd.x0 + bd.x1) / 2 - 4 * U, y: bd.y1 };
    return { x: bd.x0 + 8 * U, y: bd.y1 };
  }
  log(txt) { this.events.push({ t: Date.now(), txt: txt }); if (this.events.length > 14) this.events.shift(); if (this.ui.log) this.ui.log(txt); }
  sfx(name, a) { if (this.s.sound && CL.sfx[name]) CL.sfx[name](a); }
  vib(ms) { if (this.s.vib && this.ui.vib) this.ui.vib(ms); }
  mark(b, txt) { this.w.fx.mark(txt, b.head.x, b.head.y - b.u, M.max(13, b.u * 1.5), '#6B4E2E'); }
  toolPos() { return this.tool.hidden ? null : { x: this.tool.x, y: this.tool.y }; }
  touch() { this.lastUser = this.T; if (this.c.scale.t < 1 && !this.arena) this.c.scale.t = 1; }

  /* ---------------- speech */
  say(b, key, o) { const l = CL.line(key); return this.sayText(b, l.text, o); }
  sayText(b, text, o) {
    o = o || {}; if (!text) return 0;
    const dur = o.dur || clamp(1.2 + text.length * 0.055, 1.4, 5);
    if (this.ui.say(b, text, { dur: dur, prio: o.prio || 1, shout: o.prio >= 3, quran: o.quran, small: o.small })) {
      if (!o.quran) b.talkT = M.min(dur * 0.6, 2.2);
      if (!o.small && !o.quran) this.sfx('voice', o.mood || 'hurt', M.min(5, 1 + ((text.length / 5) | 0)));
    }
    return dur;
  }

  /* ---------------- each frame */
  update(dt) {
    const T = this.T, c = this.c, s = this.s, since = T - this.lastHit;
    // cold from snowballs: he shivers and rubs his hands, then warms up
    if (c.frozen > 0.35) { if (!this.cold) { this.cold = true; this.sayText(c, CL.lineOf(['s|برد! 🥶', 'e|ساقعة! 🥶', 'y|برد برد! 🥶', 'g|برد! 🥶', 'f|بارد! 🥶']), { prio: 2, mood: 'hurt' }); }
      if (!c.busy(2)) { c.tremble = M.max(c.tremble, 0.3 * c.frozen); c.fwdL.t = c.fwdR.t = 0.7; c.aL.t = c.aR.t = -0.5 + M.sin(T * 14) * 0.15; } }
    else if (this.cold && c.frozen < 0.08) { this.cold = false; c.tremble = 0; if (!c.busy(2)) { c.fwdL.t = c.fwdR.t = 0; c.aL.t = c.aR.t = 0; }
      c.setFace('relieved', 2); this.sayText(c, CL.lineOf(['s|الحمد لله… دفيت ☀️', 'e|الحمد لله دفيت ☀️', 'y|الحمد لله قده دفيت ☀️', 'f|الحمد لله، دفئت ☀️']), { prio: 2, mood: 'happy' }); }
    this.usageTick(dt); this.prayT = (this.prayT || 0) + dt; if (this.prayT > 15) { this.prayT = 0; this.prayTick(); }
    if (this.pendingKb && !(this.activity && RELIGIOUS[this.activity])) { const f = this.pendingKb; this.pendingKb = null; this.onKeyboard(true, f); }
    this.pain = M.max(0, this.pain - dt * (since > 1.5 ? 9 : 2));
    this.anger = M.max(0, this.anger - dt * (since > 2.5 ? 5 : 0));
    if (since > 0.6 && this.combo && this.tool.state !== 'attack') this.combo = 0;
    c.flush = M.max(this.anger > 45 ? M.min(0.9, this.anger / 100) : 0, c.flush - dt * 0.8);
    if (this.anger > 55 && chance(dt * 6)) this.w.fx.puff(c.head.x + pick([-3.5, 3.5]) * c.u, c.head.y, c.u, '#e9e7e1');
    // tiny when left alone
    const idle = T - this.lastUser;
    const tiny = !this.arena && s.shrink && idle > s.shrinkSec && !this.typing && !this.hiding && !this.asking && !this.away && !this.f && !this.chatOpen;
    c.scale.t = this.raging ? this.rageScale : c.strollScale ? c.strollScale : tiny ? 0.34 : (this.typing ? 0.62 : 1);
    // phone laid flat on a table: after a moment he steps "into" the screen and walks around on it
    if (this.w.gmag < 0.35 && s.td3d && s.acts.stroll !== false) { this.flatFor = (this.flatFor || 0) + dt; } else this.flatFor = 0;
    if (this.flatFor > 2.5 && c.mode !== 'top' && !c.busy(2) && !this.away && !this.hiding && !this.typing && c.ground) { this.flatFor = -30; c.play(R.stroll(this, c), 1); }
    this.tool.scale.t = this.confiscated ? 0.01 : tiny ? 0.5 : 1;
    if (this.helmetUntil && T > this.helmetUntil) { this.helmetUntil = 0; c.outfit.helmet = 0; }
    if (this.shieldUntil && T > this.shieldUntil) { this.shieldUntil = 0; if (c.prop && c.prop.kind === 'shield') c.prop = null; }
    this.placeTool(false);
    if (this.confiscated && T > this.confiscatedUntil) this.giveBackTool();
    // idle life
    if (!c.busy(1) && !this.away && !this.hiding && T > this.nextIdle && !c.held) this.pickIdle();
    // phone use reminders (they put him "in the right")
    if (s.usage && this.present && !this.arena) {
      const sess = T - this.sessionStart;
      void sess; // the hourly count of today's phone use (usageTick) replaced the old per-session reminder
      const hr = new Date().getHours(), day = new Date().toDateString();
      if (s.night && hr < 4 && sess > 20 * 60 && this.nightAdvised !== day) { this.nightAdvised = day; this.advise('usage_night'); }
      if (this.videoStart != null && T - this.videoStart > s.videoMin * 60 && T - this.lastVideoAdvice > s.videoMin * 60) { this.lastVideoAdvice = T; this.advise('usage_video'); }
    }
  }
  rightful() { return this.s.dignity && (this.T < this.rightfulUntil || RELIGIOUS[this.activity] || this.dawahNow); }

  /* ---------------- the tool waits behind the right edge; you pull it out, or push it back when he's doing right */
  stowTool(quiet) {
    const t = this.tool; if (t.stowed) return;
    t.stowed = true; t.held = false; t.state = 'idle'; t.userPlaced = true; t.charge = 0;
    t.homeX = this.w.W + 5 * t.u; t.homeY = this.w.bounds.y1 - 0.2 * t.u;
    if (!quiet && !this.away && !this.hiding) {
      const c = this.c; c.setFace(pick(['relieved', 'happy', 'serene']), 1.6);
      this.say(c, 'tool_hidden', { prio: 2, mood: 'happy' }); this.rapport = M.min(100, this.rapport + 1);
    }
  }
  unstowTool(y) {
    const t = this.tool, c = this.c; if (!t.stowed) return;
    t.stowed = false; t.x = this.w.W + 2 * t.u; t.y = y != null ? y : t.homeY; this.touch();
    if (this.away || this.hiding || c.busy(3)) return;
    c.look.tx = t.x > c.x ? 1 : -1; setTimeout(() => (c.look.tx = 0), 1500);
    if (this.rightful()) { c.setFace('serious', 2); this.say(c, 'unjust', { prio: 2, mood: 'serious' }); }
    else { c.setFace(pick(['nervous', 'surprised', 'skeptical', 'sideeye']), 1.6); this.say(c, 'tool_peek', { prio: 2, mood: 'scared' }); }
  }
  /* ---------------- thanks (a pat on the head), double tap, voice */
  onPat() {
    const c = this.c; this.touch(); if (this.away || this.ko || (this.activity && RELIGIOUS[this.activity])) return;
    this.patN = (this.patN || 0) + 1;
    c.setFace(pick(['serene', 'love', 'relieved', 'happy']), 2); c.blush = 1; c.sy.t = 0.93;
    if (this.patN % 2 === 1) this.w.fx.heart(c.head.x + rnd(-2, 2) * c.u, c.head.y, c.u);
    if (this.patN === 2) this.say(c, 'pat', { prio: 2, mood: 'happy' });
  }
  onPatEnd() {
    const c = this.c; c.sy.t = 1;
    if ((this.patN || 0) >= 2) { this.rapport = M.min(100, this.rapport + 3); CL.store('rapport', this.rapport); this.say(c, 'thanks', { prio: 3, mood: 'happy' }); this.log('صاحبه شكره وملّس على راسه'); }
    this.patN = 0;
  }
  onChatOpenTap() { this.touch(); this.c.setFace('wideHappy', 1.2); }
  canListen() { return !this.away && !this.ko && !this.hiding && !(this.activity && RELIGIOUS[this.activity]); }
  onVoiceStart() {
    const c = this.c; this.touch(); c.setFace('think', 10); c.look.ty = -0.4;
    this.sayText(c, '🎙️ ' + (CL.line('voice_listen').text || 'تفضّل، سامعك…'), { prio: 3, dur: 10, mood: 'calm' });
  }
  voiceHeard(text) {
    const c = this.c;
    if (!text) { c.look.ty = 0; c.setFace('puzzled', 2); this.sayText(c, CL.lineOf(['s|ما سمعت منيح، عيدها؟', 'e|مسمعتش كويس، عيدها تاني؟', 'y|ما سمعتش زين، عيدها؟', 'f|لم أسمع جيداً، أعد من فضلك']), { prio: 3, mood: 'calm' }); return; }
    c.setFace('think', 12); this.sayText(c, '«' + text + '» …', { prio: 3, dur: 12, mood: 'calm', small: true });
  }
  voiceReply(text, face) {
    const c = this.c; c.look.ty = 0; if (face && CL.FACES[face]) c.setFace(face, 4);
    this.sayText(c, text, { prio: 3, mood: 'calm', dur: M.min(14, 2.5 + text.length * 0.08) });
  }

  placeTool(force) {
    const t = this.tool, c = this.c;
    if (t.userPlaced || t.held || (t.state !== 'idle' && !force)) return;
    const bd = this.w.bounds, side = c.x < (bd.x0 + bd.x1) / 2 ? 1 : -1;
    const x = clamp(c.x + side * 10 * c.u, bd.x0 + 3 * c.u, bd.x1 - 3 * c.u);
    t.restTo(x, (c.ground && c.ground.e === 'b' ? c.y : bd.y1) - 0.2 * c.u);
    if (force) { t.x = t.homeX; t.y = t.homeY; }
  }

  /* ---------------- idle scheduling */
  pickIdle() {
    const T = this.T, s = this.s, c = this.c;
    this.nextIdle = T + rnd(4, 9);
    if (this.asking) return;
    if (this.typing || this.chatOpen) { if (chance(0.3)) c.play(pick(R.idleSmall)(this, c), 1); return; }
    if (s.questions && T - this.lastQuestion > s.qEvery * 60 && T - this.lastUser < 600 && chance(0.6)) { this.askRandom(); return; }
    const tiny = c.scale.t < 0.5;
    const r = M.random();
    if (r < 0.48) { const a = this.chooseActivity(tiny); if (a) { this.startActivity(a); return; } }
    if (r < 0.66) {
      if (!tiny && this.appKind === 'home' && this.w.platOn && s.parkour && this.w.gdir.y > 0.7 && chance(0.55)) { c.play(R.iconTour(this, c), 1); return; }
      if (!tiny && s.td3d && s.acts.stroll !== false && (this.appKind === 'home' || !this.appInfo) && this.w.gdir.y > 0.7 && chance(0.2)) { this.startActivity('stroll'); return; }
      // without "Clawd's eyes" we never learn which app is open, so allow parkour anywhere
      if (!tiny && s.parkour && s.acts.parkour && (this.appKind === 'home' || this.arena || !this.appInfo) && this.w.gdir.y > 0.7 && chance(this.appInfo ? 0.6 : 0.3)) { c.play(R.parkourShow(this, c), 1); return; }
      if (s.roam && this.w.gdir.y > 0.7) { c.play(R.roam(this, c), 1); this.nextIdle = T + rnd(3, 6); return; } // small walks even when he is tiny
    }
    if (!tiny && !this.arena && M.abs(c.x - this.home().x) > 40 * c.u && chance(0.5)) { c.play(R.goHome(this, c), 1); return; }
    if (this.worshipGlow > T) { if (chance(0.25)) this.say(c, 'after_worship', { mood: 'calm' }); }
    else if (T - this.lastUser > 30 && chance(0.12)) this.say(c, 'idle', { mood: 'calm' });
    c.play(R.idleSmall[CL.bag('idleSmall', R.idleSmall.length)](this, c), 1);
  }
  chooseActivity(tiny) {
    const s = this.s, hr = new Date().getHours();
    const map = { tasbih: R.tasbih, dua: R.dua, quran: R.quran, hadith: R.hadith, martial: R.martial, study: R.study, exercise: R.exercise,
      book: R.book, tea: R.tea, sleep: R.sleep, juggle: R.juggle, plant: R.plant, friend: R.friendVisit, stroll: R.stroll };
    const small = { tasbih: 1, dua: 1, quran: 1, hadith: 1, study: 1, book: 1, tea: 1, sleep: 1 };
    const w = { tasbih: 3, dua: 2, quran: 3, hadith: 2, martial: 2, study: 2, exercise: 2, book: 2, tea: 2, sleep: 1, juggle: 1.5, plant: 1, friend: 2, stroll: 1.6 };
    if (hr >= 4 && hr < 9) { w.tasbih += 3; w.quran += 3; w.dua += 2; }
    if (hr >= 16 && hr < 19) { w.tasbih += 2; w.dua += 1; }
    if (hr >= 22 || hr < 4) { w.sleep += 5; w.martial = 0.5; }
    if (!s.td3d || this.w.gdir.y < 0.7) w.stroll = 0;
    const keys = Object.keys(map).filter((k) => s.acts[k] !== false && w[k] > 0 && (!tiny || small[k]) && this.lastActs.indexOf(k) < 0);
    if (!keys.length) return null;
    let tot = 0; keys.forEach((k) => (tot += w[k]));
    let x = M.random() * tot;
    for (const k of keys) { x -= w[k]; if (x <= 0) return k; }
    return keys[0];
  }
  startActivity(k) {
    const map = { tasbih: R.tasbih, dua: R.dua, quran: R.quran, hadith: R.hadith, martial: R.martial, study: R.study, exercise: R.exercise,
      book: R.book, tea: R.tea, sleep: R.sleep, juggle: R.juggle, plant: R.plant, friend: R.friendVisit, stroll: R.stroll };
    if (!map[k]) return;
    this.lastActs.push(k); if (this.lastActs.length > 4) this.lastActs.shift();
    const names = { tasbih: 'عم يسبّح', dua: 'عم يدعي', quran: 'عم يقرأ قرآن', hadith: 'عم يقرأ حديث', martial: 'عم يتمرن قتال', study: 'عم يذاكر', exercise: 'عم يعمل رياضة',
      book: 'عم يقرأ كتاب', tea: 'عم يشرب شاي', sleep: 'نايم', juggle: 'عم يلعب بالطابات', plant: 'عم يسقي نبتته', friend: 'صاحبه بكسل زاره', stroll: 'عم يتمشى فوق التطبيقات' };
    this.log('كلود ' + names[k]);
    this.c.play(map[k](this, this.c), RELIGIOUS[k] ? 3 : 1); // worship isn't interrupted by pokes and play
  }

  /* ---------------- friend */
  spawnFriend() { const f = this.w.addBot('friend'); this.f = f; f.ledCol = pick(['#7DF9FF', '#9DFF8A', '#FFD27D']); return f; }
  dropFriend() { if (!this.f) return; this.f.stop(); this.w.bots = this.w.bots.filter((b) => b !== this.f); this.ui.say(this.f, '', { dur: 0 }); this.f = null; }

  /* ---------------- questions */
  askRandom() {
    this.lastQuestion = this.T;
    const r = M.random();
    if (r < 0.15) return this.askQuiz(CL.QUIZ[CL.bag('quiz', CL.QUIZ.length)]);
    if (r < 0.25) return this.askQuiz(CL.RIDDLES[CL.bag('riddle', CL.RIDDLES.length)], true);
    const ids = Object.keys(CL.QUESTIONS).filter((k) => k !== 'tired');
    this.askQ(ids[CL.bag('questions', ids.length)]);
  }
  askQ(id) {
    const q = CL.QUESTIONS[id]; if (!q) return;
    const c = this.c; this.c.scale.t = 1;
    c.setFace(pick(['puzzled', 'think', 'normal', 'wideHappy']), 3);
    this.ask(c, CL.lineOf(q.q, 'q:' + id), q.o.map((o) => o.t), (i) => this.answer(q.o[i]));
  }
  ask(b, text, opts, cb) {
    this.asking = { text: text, cb: cb };
    this.ui.ask(b, text, opts, (i) => { this.asking = null; this.touch(); this.rapport = M.min(100, this.rapport + 1.5); cb(i); });
  }
  answer(o) {
    const c = this.c;
    if (o.face) c.setFace(o.face, 2.5);
    let d = 0;
    if (o.joke) d = this.sayText(c, CL.lineOf(CL.JOKES, 'jokes'), { prio: 2, mood: 'happy', dur: 4 });
    else if (o.r) d = this.sayText(c, CL.lineOf(o.r), { prio: 2, mood: 'happy' });
    if (o.advice) { this.rightfulUntil = this.T + 300; this.adviceAt = this.T; this.log('كلود نصح صاحبه: ' + (o.t || '')); }
    if (o.quiet) this.lastQuestion = this.T + o.quiet;
    const after = () => {
      if (o.verse) { const v = CL.verse(); this.sayText(c, '﴿' + v.t + '﴾  ' + v.r, { prio: 2, quran: true, dur: 5 }); }
      else if (o.hadith) { const h = CL.hadith(); this.sayText(c, '«' + h.t + '» ' + h.r, { prio: 2, dur: 5 }); }
      else if (o.next) setTimeout(() => this.askQ(o.next), 600);
      else if (o.chat) this.offerChat(o.chat);
      else if (o.act === 'parkourShow') c.play(R.parkourShow(this, c), 2);
    };
    setTimeout(after, (d || 1) * 1000 + 300);
  }
  askQuiz(qz, riddle) {
    const c = this.c; c.scale.t = 1; c.setFace(riddle ? 'mischief' : 'think', 3);
    this.ask(c, (riddle ? 'لغز: ' : 'سؤال: ') + qz.q, qz.o, (i) => {
      if (i === qz.a) { c.setFace('joy', 2); this.sayText(c, CL.lineOf(CL.QA.right), { prio: 2, mood: 'happy' }); this.w.fx.burst(c.head.x, c.head.y, 10, 0.3, c.u); this.sfx('chime'); }
      else { c.setFace('skeptical', 2); this.sayText(c, CL.lineOf(CL.QA.wrong) + qz.o[qz.a], { prio: 2, mood: 'calm' }); }
    });
  }
  offerChat(seed) {
    this.ask(this.c, CL.lineOf(['s|بدك نكمّل حكي بالدردشة؟', 'e|تحب نكمل كلام في الشات؟', 'f|هل تريد أن نكمل الحديث في الدردشة؟']), ['إي، افتحها', 'لا شكراً'], (i) => {
      if (i === 0) this.ui.openChat(seed); else this.say(this.c, 'answered', { prio: 2, mood: 'happy' });
    });
  }

  /* ---------------- advice (after it he is "in the right" for a while) */
  advise(key) {
    const c = this.c;
    this.rightfulUntil = this.T + 300; this.adviceAt = this.T; this.lastUser = this.T;
    c.play((function* (B) {
      c.scale.t = 1;
      c.setFace(pick(['serious', 'pleading', 'think']), 4);
      if (c.ground && c.ground.e === 'b') { c.vy = -30 * c.u; c.ground = null; yield* until(() => c.ground, 2); }
      c.aR.t = -1.2; c.fwdR.t = 0.5;
      const d = B.say(c, key, { prio: 3, mood: 'serious', dur: 4.5 });
      yield* wait(d + 0.3); c.aR.t = 0; c.fwdR.t = 0;
      if (chance(0.5)) { const h = chance(0.5) ? CL.hadith() : null, v = h ? null : CL.verse();
        B.sayText(c, h ? '«' + h.t + '» ' + h.r : '﴿' + v.t + '﴾  ' + v.r, { prio: 3, quran: !!v, dur: 5 }); yield* wait(5); }
    })(this), 3);
    this.log('كلود نصح صاحبه (' + key + ')');
  }

  /* ---------------- touches on Clawd */
  onCharTap() {
    const T = this.T, c = this.c; this.touch();
    if (this.away) return;
    if (this.asking) { this.ui.showOptions(); return; }
    if (this.hiding) { if (this.hideAsk) this.hideAsk(); return; }
    if (this.ko) { this.say(c, 'hit_while_ko', { prio: 2, mood: 'sad' }); return; }
    this.taps = this.taps.filter((t) => T - t < 2.2); this.taps.push(T);
    const n = this.taps.length;
    if (this.activity && RELIGIOUS[this.activity]) { c.setFace(pick(['serene', 'happy', 'wink']), 1.2); this.say(c, 'quran_tap', { prio: 2, mood: 'calm' }); return; }
    if (this.activity === 'sleep') { c.stop(); c.play(this.r_wake(), 2); return; }
    if (this.anger > 55) { c.setFace('annoyed', 1.2); this.say(c, 'notnow', { prio: 2, mood: 'angry' }); c.vy = -20 * c.u; c.ground = null; this.sfx('stomp'); return; }
    if (n >= 4) { this.rapport = M.min(100, this.rapport + 0.5); c.play(this.r_tickle(n), 2); return; }
    if (this.activity && c.taskPrio <= 1 && chance(0.6)) { c.setFace(pick(['puzzled', 'normal', 'wink']), 1); this.say(c, 'busy', { prio: 2 }); return; }
    const P = this.POKES();
    c.play(P[CL.bag('pokes', P.length)](), 2);
    this.log('صاحبه نقر على كلود');
  }
  onCharDouble() {
    this.touch();
    if (this.s.chat !== false && this.ui.openChat) { this.c.setFace('wideHappy', 1.5); this.say(this.c, 'chat_open', { prio: 2, mood: 'happy' }); this.ui.openChat(''); }
  }
  onCharLong() {
    const c = this.c; this.touch(); if (this.away || this.ko) return;
    this.rapport = M.min(100, this.rapport + 2); CL.store('rapport', this.rapport);
    c.play((function* (B) {
      c.setFace(pick(['serene', 'love', 'joy', 'relieved']), 2.4); c.sy.t = 0.9; c.sx.t = 1.08; c.blush = 1;
      B.say(c, 'pat', { prio: 2, mood: 'happy' });
      for (let i = 0; i < 3; i++) { B.w.fx.heart(c.head.x + rnd(-3, 3) * c.u, c.head.y, c.u); yield* wait(0.5); }
      c.sy.t = 1; c.sx.t = 1;
    })(this), 2);
    this.log('صاحبه ملّس على راس كلود');
  }
  onCharDragStart() {
    const c = this.c; this.touch(); if (this.away) return;
    if (this.activity && RELIGIOUS[this.activity]) { // not a time for play: he stays put and says so (now and then)
      if (this.T - (this.busySaid || -9) > 5) { this.busySaid = this.T; c.setFace('serious', 1.5); this.say(c, 'quran_busy', { prio: 3, mood: 'calm' }); }
      return;
    }
    if (this.ko) this.revive();
    c.stop(); c.held = true; c.mode = 'side'; c.pv.t = 0.12; c.rollOverride = null; this.hiding = false; c.noClip = false;
    c.setFace(pick(['surprised', 'wideHappy', 'scared', 'joy']), 30); this.say(c, 'drag', { prio: 2, mood: 'scared' });
    c.play((function* () { let t = 0; while (c.held) { const dt = yield; t += dt; for (let i = 0; i < 4; i++) c.legs[i] = M.sin(t * 20 + i * 1.7) * 0.6; c.aL.t = -1 + M.sin(t * 18) * 0.5; c.aR.t = -1 - M.sin(t * 18) * 0.5; } })(), 4);
  }
  onCharDrag(x, y, vx) {
    const c = this.c; if (!c.held) return;
    c.x = x; c.y = y + 4.5 * c.u; c.rollOverride = clamp(-vx * 0.0006, -0.7, 0.7);
  }
  onCharDragEnd(vx, vy) {
    const c = this.c; if (!c.held) return;
    c.held = false; c.stop(); c.poseReset(); c.rollOverride = null; c.setFace('normal', 0.1);
    c.vx = clamp(vx, -3500, 3500); c.vy = clamp(vy, -3500, 3500); c.ground = null; c.airTime = 0;
    const sp = M.hypot(vx, vy);
    if (sp > 900 && this.s.parkour) { c.trick = R.trick(c, 0.8); this.sfx('flip'); this.say(c, 'tilt', { prio: 2, mood: 'scared' }); }
    this.log('صاحبه حمل كلود ورماه');
  }
  onLand(b, vn, air, trick) {
    if (b !== this.c || this.ko) return;
    if ((trick || air > 0.55) && !b.busy(2)) b.play(R.landing(this, b, vn, air, trick), 2);
    else if (vn > 900 * this.w.U / 7 && !b.busy(2)) { b.setFace(pick(['ouch', 'hurt', 'dizzy']), 1); this.say(b, chance(0.5) ? 'dhikr_land' : 'land', { prio: 1 }); this.sfx('land'); }
  }
  onWall(b, e, v) {
    if (b !== this.c) return;
    this.sfx('heavy', 0.3); this.vib(50); b.setFace('hurt', 0.8); this.w.shake = 0.5 * b.u;
    if (chance(0.5)) this.say(b, 'wall', { prio: 2, mood: 'hurt' });
  }
  onTilt(big) {
    const c = this.c; this.touch();
    if (!this.s.gravity) return;
    if (big && !c.busy(3) && chance(0.65)) this.say(c, chance(0.55) ? 'dhikr_flip' : this.w.gdir.y < -0.6 ? 'upside' : 'tilt', { prio: 2, mood: 'calm' });
    if (big) { c.setFace(pick(['surprised', 'scared', 'wideHappy', 'shocked']), 1.5); this.log('صاحبه قلب التلفون'); }
    if (!c.ground && c.airTime < 0.1 && this.s.parkour && !c.trick) c.trick = R.trick(c, 0.7);
  }
  onShake() {
    const c = this.c; this.touch(); if (this.ko) return;
    this.dizzyUntil = this.T + 2.2; c.setFace('dizzy', 2.2); c.roll.vel += 8; this.say(c, chance(0.5) ? 'dhikr_shake' : 'dizzy', { prio: 3, mood: 'hurt' }); this.vib(80);
    this.log('صاحبه هزّ التلفون ودوّخ كلود');
  }

  POKES() {
    const B = this, c = this.c;
    const s = (key, mood) => B.say(c, key, { prio: 2, mood: mood || 'happy' });
    return [
      () => (function* () { c.setFace('surprised', 1.2); c.vy = -35 * c.u; c.ground = null; s('poke'); yield* until(() => c.ground, 2); })(),
      () => (function* () { c.setFace('sideeye', 1.8); s('poke', 'calm'); yield* wait(1.8); })(),
      () => (function* () { s('poke'); yield* R.turnAround(B, c); c.setFace('wink', 1); })(),
      () => R.wave(B, c),
      () => (function* () { c.setFace('wideHappy', 1.6); c.aR.t = -2.7; B.sayText(c, CL.lineOf(['s|كفّك! ✋', 'e|كفك! ✋', 'g|كفك! ✋', 'f|صافحني! ✋']), { prio: 2, mood: 'happy' }); yield* wait(1.6); c.aR.t = 0; })(),
      () => (function* () { c.setFace('embarrassed', 1.8); c.blush = 1; c.look.ty = 0.7; yield* wait(1.8); c.look.ty = 0; })(),
      () => (function* () { c.setFace('ko', 1.2); c.rollOverride = -1.4; B.sayText(c, CL.lineOf(['s|آآه… أغمى عليّ', 'e|آه… أنا اتغمى عليا', 'f|أوه… سقطت']), { prio: 2, mood: 'sad' }); yield* wait(1.2); c.rollOverride = null; c.setFace('laugh', 1.2); B.sfx('giggle'); yield* wait(1); })(),
      () => (function* () { c.fwdL.t = c.fwdR.t = 1; c.aL.t = c.aR.t = -2.1; c.setFace('happy', 1.2); yield* wait(1); c.fwdL.t = c.fwdR.t = 0; c.aL.t = c.aR.t = 0; c.setFace('wideHappy', 1); B.sayText(c, 'بخ! 😄', { prio: 2, mood: 'happy' }); c.sy.vel += 8; yield* wait(0.8); })(),
      () => (function* () { if (c.ground) { c.vy = -55 * c.u; c.ground = null; c.trick = { t: 0, dur: 0.6, flip: TAU }; B.sfx('flip'); } yield* until(() => c.ground, 2); })(),
      () => (function* () { c.setFace('proud', 1.5); c.aL.t = c.aR.t = -2.6; yield* wait(1.2); c.aL.t = c.aR.t = 0; })(),
      () => (function* () { c.setFace('puzzled', 1.6); B.mark(c, '؟'); s('poke', 'calm'); yield* wait(1.4); })(),
      () => (function* () { c.setFace('love', 1.6); B.w.fx.heart(c.head.x, c.head.y, c.u); s('pat'); yield* wait(1.2); })(),
      () => R.sneeze(B, c),
      () => (function* () { c.setFace('sleep', 1.2); yield* wait(1.1); c.setFace('wink', 1.2); B.sayText(c, CL.lineOf(['s|شفتك 😏', 'e|شايفك 😏', 'f|رأيتك 😏']), { prio: 2, mood: 'happy' }); yield* wait(1); })(),
      () => (function* () { c.setFace('tongue', 1.4); B.sfx('giggle'); yield* wait(1.4); })(),
      () => (function* () { c.setFace('cool', 2); B.sayText(c, CL.lineOf(['s|أنا كول اليوم 😎', 'e|أنا روش النهارده 😎', 'f|أنا رائع اليوم 😎']), { prio: 2, mood: 'happy' }); yield* wait(2); })(),
      () => R.peekCamera(B, c)
    ];
  }
  r_tickle(n) {
    const B = this, c = this.c;
    return (function* () {
      c.setFace(n >= 9 ? 'love' : n >= 6 ? 'crylaugh' : 'laugh', 1.6); c.aL.t = c.aR.t = 0.8;
      B.sfx('giggle'); B.vib(10);
      B.say(c, n >= 9 && n % 3 === 0 ? 'love' : n >= 5 ? 'tickle2' : 'tickle', { prio: 2, mood: 'happy' });
      yield* R.loop(1.2, (t) => { c.rollOverride = M.sin(t * 18) * 0.25; c.sy.t = 1 + M.sin(t * 24) * 0.05; });
      c.rollOverride = null; c.sy.t = 1; c.aL.t = c.aR.t = 0;
      if (n >= 8) { c.sit.t = 1; yield* R.loop(1.4, (t) => { c.rollOverride = M.sin(t * 9) * 0.6; }); c.rollOverride = null; c.sit.t = 0; }
    })();
  }
  r_wake() {
    const B = this, c = this.c;
    return (function* () { c.setFace('shocked', 1); c.vy = -45 * c.u; c.ground = null; B.say(c, 'wake', { prio: 2, mood: 'scared' }); yield* until(() => c.ground, 2); c.setFace('embarrassed', 1.2); })();
  }

  /* ---------------- the tool: holding, threatening, hitting */
  onToolDown() {
    const T = this.T, c = this.c; this.touch();
    if (this.away || this.ko || this.hiding || c.held) return;
    if (T < this.grabCooldown || c.busy(3)) return;
    this.grabCooldown = T + rnd(5, 9);
    if (this.rightful()) { c.setFace(pick(['serious', 'skeptical', 'sideeye']), 2.5); this.say(c, 'unjust', { prio: 2, mood: 'serious' }); return; }
    if (chance(0.25)) return; // sometimes he just watches
    const G = this.GRABS();
    const g = G[CL.bag('grabs', G.length)];
    g();
  }
  GRABS() {
    const B = this, c = this.c, s = this.s;
    const list = [
      () => { c.setFace('pleading', 2.5); c.fwdL.t = c.fwdR.t = 1; c.aL.t = c.aR.t = -1.2; B.say(c, 'tool_grab', { prio: 2, mood: 'scared' }); setTimeout(() => { c.fwdL.t = c.fwdR.t = 0; c.aL.t = c.aR.t = 0; }, 2200); },
      () => { c.setFace('determined', 3); c.sit.t = 0.35; B.defenseBias = { kind: 'dodge', until: B.T + 4, p: 0.6 }; B.say(c, 'dodge', { prio: 2, mood: 'happy' }); setTimeout(() => (c.sit.t = 0), 3000); },
      () => B.maybeRun(),
      () => c.play(B.r_hide(), 3),
      () => { c.outfit.helmet = 1; B.helmetUntil = B.T + 20; c.setFace('cool', 2); B.say(c, 'helmet', { prio: 2, mood: 'happy' }); B.sfx('pop'); },
      () => { c.prop = { kind: 'shield' }; B.shieldUntil = B.T + 15; c.setFace('determined', 2); B.say(c, 'shield', { prio: 2, mood: 'happy' }); B.sfx('pop'); },
      () => { c.setFace('nervous', 2.5); B.say(c, 'negotiate', { prio: 2, mood: 'calm' }); },
      () => c.play((function* () { c.sit.t = 1; c.setFace('sleep', 6); B.say(c, 'fake_sleep', { prio: 2, mood: 'calm' }); B.fakeSleep = true; yield* wait(6); B.fakeSleep = false; c.sit.t = 0; })(), 2),
      () => { c.setFace(pick(['smug', 'sideeye', 'cool']), 2.5); B.sayText(c, CL.lineOf(['s|جرّب إذا بتقدر 😏', 'e|جرب كده 😏', 'g|جرّب 😏', 'f|جرّب إن استطعت 😏']), { prio: 2, mood: 'happy' }); }
    ];
    if (s.acts.friend && !this.f) list.push(() => c.play(this.r_callFriend(), 3));
    return list;
  }
  toolChargeStart() {
    const c = this.c, t = this.tool;
    if (this.confiscated || t.state !== 'idle') return;
    t.state = 'charge'; t.charge = 0; this.touch();
    if (this.hiding || this.ko || c.busy(3)) return;
    if (this.rightful()) { c.setFace('serious', 3); this.say(c, 'unjust', { prio: 2, mood: 'serious' }); return; }
    if (chance(0.1)) { c.play(this.r_hide(), 3); return; }
    if (this.maybeRun(0.75)) return; // holding the tool = he runs for it (most of the time)
    c.play((function* (B) {
      let lastPlea = -9;
      while (t.state === 'charge') {
        const dt = yield; c.tremble = 0.25 + t.charge * 0.9;
        c.setFace(t.charge > 0.7 ? 'shocked' : 'scared', 0.3); c.look.tx = t.x > c.x ? 1 : -1;
        c.sy.t = 1 - t.charge * 0.12; c.fwdL.t = c.fwdR.t = 0.8; c.aL.t = c.aR.t = -1.1;
        if (B.T - lastPlea > 1.1) { lastPlea = B.T; B.say(c, 'tool_charge', { prio: 2, mood: 'scared', dur: 1.1 }); }
        if (chance(dt * 3)) B.w.fx.drop(c.head.x + (c.look.tx > 0 ? -1 : 1) * 3.6 * c.u, c.head.y + c.u, -c.look.tx * rnd(1, 3) * c.u, -rnd(2, 5) * c.u, c.u);
        if ((t.charge * 10 | 0) !== (((t.charge - dt / 1.5) * 10) | 0)) B.sfx('charge', t.charge);
      }
      c.tremble = 0; c.sy.t = 1; c.fwdL.t = c.fwdR.t = 0; c.aL.t = c.aR.t = 0; c.look.tx = 0;
    })(this), 2);
  }
  toolCancelCharge() { if (this.tool.state === 'charge') { this.tool.state = 'idle'; this.tool.charge = 0; } }
  onToolDragStart() { const t = this.tool; this.touch(); if (t.state === 'charge') t.state = 'idle'; t.held = true; t.userPlaced = true; t.state = 'idle'; this.maybeRun(0.85); }
  onToolDrag(x, y, vx, vy) {
    const t = this.tool, c = this.c;
    t.x = x; t.y = y + t.def.len * t.u * 0.45; t.homeX = t.x; t.homeY = t.y;
    t.a = lerp(t.a, clamp(vx * 0.0009, -1.1, 1.1), 0.3);
    // swinging the tool straight into him hits too
    const sp = M.hypot(vx, vy), h = t.headPoint(), bb = c.bbox;
    // bringing the tool close while he isn't running: off he goes
    if (!this.running && this.T > (this.runRetry || 0)) {
      this.runRetry = this.T + 1.2;
      if (M.hypot(h.x - (bb.x + bb.w / 2), h.y - (bb.y + bb.h / 2)) < this.w.W * 0.38) this.maybeRun(0.7);
    }
    if (sp > 900 && this.T - (this.lastSmash || 0) > 0.3 && h.x > bb.x && h.x < bb.x + bb.w && h.y > bb.y && h.y < bb.y + bb.h) {
      this.lastSmash = this.T;
      const rel = (h.y - bb.y) / (bb.h || 1);
      this.impact(rel < 0.3 ? 'head' : rel < 0.55 ? 'face' : rel < 0.8 ? 'belly' : 'legs', clamp(sp / 3500, 0.12, 0.9), { x: h.x, y: h.y, smash: true });
    }
  }
  onToolRelease(kind, vx, vy) {
    const t = this.tool; this.touch();
    if (kind === 'tap') return this.attack(0);
    if (kind === 'charge') { const ch = t.charge; t.state = 'idle'; t.charge = 0; return this.attack(ch >= 1 ? 1 : M.max(0.16, ch)); }
    t.held = false;
    if (kind === 'fling' && M.hypot(vx, vy) > 700) {
      t.state = 'fly'; t.vx = vx; t.vy = vy; t.va = (vx > 0 ? 1 : -1) * rnd(8, 16); t.flyHit = false;
      t.onLanded = () => { t.homeX = t.x; t.homeY = t.y; };
      return;
    }
    t.state = 'idle'; t.homeX = t.x; t.homeY = t.y;
  }
  toolFlyStep() {
    const t = this.tool, c = this.c; if (t.flyHit || t.thrownByClawd) return;
    const bb = c.bbox, h = { x: t.x, y: t.y - t.def.len * t.u * 0.5 };
    if (h.x > bb.x && h.x < bb.x + bb.w && h.y > bb.y && h.y < bb.y + bb.h) {
      t.flyHit = true; const sp = M.hypot(t.vx, t.vy);
      t.vx *= -0.3; t.vy = -M.abs(t.vy) * 0.3 - 200;
      if (this.rightful() && chance(0.6)) { c.aR.t = -2.2; this.sfx('catch'); this.say(c, 'block', { prio: 3, mood: 'serious' }); return; }
      this.impact('belly', clamp(sp / 3000, 0.2, 1), { x: h.x, y: h.y, thrown: true });
    }
  }
  setTool(kind, quiet) { // pick a tool by name (app buttons, the list, or Claude in the chat)
    const s = this.s, t = this.tool;
    if (!CL.TOOLS[kind]) return false;
    if (s.tools[kind] === false) { s.tools[kind] = true; }
    if (t.kind === kind && !t.hidden && !t.stowed) return true;
    if (t.stowed) { t.stowed = false; t.userPlaced = false; this.placeTool(true); }
    t.kind = kind; t.scale.v = 0.2; t.hidden = this.confiscated; this.sfx('pop');
    s.tool = kind; if (this.ui.saveSetting) this.ui.saveSetting('tool', kind);
    this.w.fx.mark(CL.TOOLS[kind].name, t.x, t.y - t.def.len * t.u - 10, 16, '#141413');
    if (!quiet && chance(0.7)) this.say(this.c, 'tool_switch', { prio: 2, mood: 'scared' });
    this.log('صاحبه بدّل الأداة لـ' + CL.TOOLS[kind].name);
    return true;
  }

  chooseLoc(power, kind) {
    const d = CL.TOOLS[kind];
    if (d.throwable) return chance(0.5) ? 'head' : 'belly';
    if (d.tickle) return 'belly';
    if (d.punch) return pick(['face', 'belly', 'face']);
    if (power > 0.55) return chance(0.75) ? 'head' : 'belly';
    const w = { head: 30, face: 26, belly: 20, arm: 13, legs: 13 };
    if (this.lastLoc) w[this.lastLoc] *= 0.25;
    let tot = 0, k; for (k in w) tot += w[k];
    let r = M.random() * tot;
    for (k in w) { r -= w[k]; if (r <= 0) return (this.lastLoc = k); }
    return 'head';
  }
  targetPoint(loc, side) {
    const c = this.c, P = CL.makeProjector(c, c.u), o = [0, 0, 0];
    if (this.hiding) { P(rnd(-2, 2), 8, 0, o); return { x: o[0], y: o[1] }; }
    const pts = { head: [rnd(-1, 1.2), 10.0, 0], face: [1.5 * side, 8.0, 2.1], arm: [3.9 * side, 6.6, 0], belly: [1.5 * side, 4.5, 2.1], legs: [1.8 * side, 1, 0.8] };
    const p = pts[loc] || pts.belly;
    if (this.ko) P(0, 4, 2, o); else P(p[0], p[1], p[2], o);
    return { x: o[0], y: o[1] };
  }
  defense(power, rapid) {
    const c = this.c, T = this.T;
    if (this.hiding || this.ko || c.held) return 'ok';
    if (this.rightful()) {
      const opts = ['catch', 'catch', 'block', 'confiscate', 'complain', 'catch', 'block'];
      return opts[CL.bag('rightful', opts.length)];
    }
    if (this.fakeSleep) return 'ok';
    if (this.friendGuard && T < this.friendGuard) return 'friend';
    if (this.shieldUntil > T && chance(0.5)) return 'block';
    const db = this.defenseBias;
    if (db && T < db.until && chance(db.p)) { this.defenseBias = null; return 'dodge'; }
    if (!rapid && power < 0.2 && this.combo === 0 && this.hits.length > 4 && chance(0.08)) return 'dodge';
    if (this.hits.filter((h) => T - h < 12).length >= 6 && chance(0.22)) return chance(0.6) ? 'tryCatch' : 'block';
    return 'ok';
  }
  attack(power, opts) {
    opts = opts || {};
    const t = this.tool, c = this.c, T = this.T;
    if (this.confiscated || this.away || t.hidden) return;
    if (t.state === 'attack' || t.state === 'recoil' || t.state === 'respawn') { t.queue = M.min(4, t.queue + 1); return; }
    if (t.state !== 'idle' && t.state !== 'charge') return;
    const rapid = opts.rapid || T - this.lastAttack < 0.45; this.lastAttack = T;
    // the further away the tool is, the harder it lands
    const cx = c.bbox.x + c.bbox.w / 2, cy = c.bbox.y + c.bbox.h / 2;
    const dist = M.hypot(t.x - cx, t.y - cy), far = clamp((dist - 18 * c.u) / (this.w.W * 0.75), 0, 0.85);
    if (!rapid && far > 0.15) power = M.max(power, far);
    const side = t.x >= cx ? 1 : -1;
    const def = this.defense(power, rapid);
    const loc = def === 'catch' || def === 'block' || def === 'confiscate' || def === 'tryCatch' ? 'arm' : this.chooseLoc(power, t.kind);
    const target = this.targetPoint(loc, side);
    if (this.running && def === 'ok' && chance(0.55)) { this.runFreeze = T + 0.8; c.walk = 0; c.tv *= 0.15; c.setFace('shocked', 0.8); }
    t.attack(target, power, { loc: loc, def: def, rapid: rapid, side: side, far: far });
    if (def === 'dodge') c.play(this.r_dodge(side), 3);
    else if (def === 'catch' || def === 'block' || def === 'confiscate' || def === 'tryCatch') { c.stop(); c.setFace(def === 'block' ? 'determined' : 'serious', 1.5); (side > 0 ? c.aR : c.aL).t = -2.0; (side > 0 ? c.fwdR : c.fwdL).t = 0.3; c.yaw.t = 0.35 * side; }
    else if (def === 'friend' && this.f) { this.f.aL.t = this.f.aR.t = -2; }
  }
  r_dodge(side) {
    const B = this, c = this.c;
    return (function* () {
      if (chance(0.5)) { c.sy.t = 0.55; c.sx.t = 1.25; yield* wait(0.4); c.sy.t = 1; c.sx.t = 1; }
      else if (c.ground) { c.tv = -side * 14 * c.u; c.vy = -40 * c.u; c.vx = -side * 14 * c.u; c.ground = null; c.trick = { t: 0, dur: 0.5, flip: -TAU * side }; }
      c.setFace('mischief', 1.4);
      yield* wait(0.3); c.outfit.shades = 1; B.say(c, 'dodge', { prio: 3, mood: 'happy' }); B.sfx('giggle');
      yield* wait(1.6); c.outfit.shades = 0;
    })();
  }
  onToolHit(info) {
    const c = this.c, o = info.opts || {}, t = this.tool;
    if (o.def === 'dodge') { this.sfx('whiff'); this.w.fx.word('ووووش', info.x, info.y, c.u * 1.4, '#fff'); return; }
    if (o.def === 'catch') return this.catchAndThrow(o.side);
    if (o.def === 'tryCatch') { // he goes for it: half the time he gets it, otherwise it lands and he owns it
      if (chance(0.5)) return this.catchAndThrow(o.side);
      c.aL.t = c.aR.t = 0; c.fwdL.t = c.fwdR.t = 0; c.yaw.t = 0;
      this.impact('arm', info.power, { x: info.x, y: info.y });
      c.setFace('determined', 1.6); this.sayText(c, CL.lineOf(['s|كانت رح تمسك! المرة الجاية', 'e|كنت هلقطها! المرة الجاية', 'y|كدت أمسكها! المرة الجاية', 'f|كدتُ أمسكها! في المرة القادمة']), { prio: 3, mood: 'serious' });
      return;
    }
    if (o.def === 'confiscate') return this.confiscate();
    if (o.def === 'block') {
      this.sfx('catch'); this.vib(30); this.w.fx.burst(info.x, info.y, 6, 0.2, c.u, ['#fff', '#ddd']);
      c.play((function* (B) { B.say(c, 'block', { prio: 3, mood: 'serious', dur: 1 }); yield* wait(1.1); c.aL.t = c.aR.t = 0; c.fwdL.t = c.fwdR.t = 0; c.yaw.t = 0;
        if (B.rightful()) { c.setFace('serious', 3); B.say(c, B.activity && RELIGIOUS[B.activity] ? 'unjust_worship' : 'unjust', { prio: 3, mood: 'serious' }); } })(this), 3);
      this.log('كلود صدّ الضربة'); return;
    }
    if (o.def === 'friend' && this.f) { this.sfx('catch'); this.say(this.f, 'block', { prio: 3, mood: 'serious' }); this.f.aL.t = this.f.aR.t = 0; return; }
    // missed because he moved away?
    const bb = c.bbox, m = 2.5 * c.u;
    if (!this.hiding && (info.x < bb.x - m || info.x > bb.x + bb.w + m || info.y < bb.y - m || info.y > bb.y + bb.h + m)) {
      this.sfx('whiff'); this.w.fx.word('فاتتك!', info.x, info.y, c.u * 1.3, '#fff'); if (chance(0.5)) this.say(c, 'dodge', { prio: 2, mood: 'happy' }); return;
    }
    this.impact(o.loc || 'belly', info.power, { x: info.x, y: info.y, complain: o.def === 'complain', far: o.far });
  }

  /* ---------------- impact: pain, moods and a reaction routine */
  impact(loc, p, info) {
    const c = this.c, T = this.T, t = this.tool, kind = info.thrown || info.smash ? t.kind : t.kind;
    const d = CL.TOOLS[kind] || CL.TOOLS.stick, soft = d.soft || 0;
    const mega = p >= 0.999, heavy = p > 0.15;
    this.combo = T - this.lastHit < 0.6 ? this.combo + 1 : 1; this.lastHit = T;
    this.hits.push(T); this.hits = this.hits.filter((h) => T - h < 60);
    const dmg = (mega ? 45 : heavy ? 12 + p * 30 : 5) * (1 - soft * 0.8);
    this.pain = M.min(140, this.pain + dmg); this.anger = M.min(120, this.anger + dmg * (this.combo > 4 ? 0.9 : 0.5));
    this.rapport = M.max(0, this.rapport - (this.rightful() ? 3 : heavy ? 1.2 : 0.4)); CL.store('rapport', this.rapport);
    if (this.ui.stat) this.ui.stat(dmg);
    const sx = info.x, sy = info.y, U = c.u;
    this.lastUser = T; c.scale.t = 1;
    // effects
    if (this.s.sound) { const f = CL.sfx[d.sfx]; if (f) f(p); if (heavy && !soft) CL.sfx.heavy(p); if (mega) CL.sfx.mega(); }
    this.vib(mega ? 220 : heavy ? 60 + p * 120 : 18);
    if (kind === 'pillow') this.w.fx.feathers(sx, sy, U, 8 + p * 10);
    else if (kind === 'balloon') { this.w.fx.water(sx, sy, U, 22); c.wet = M.min(1, c.wet + 0.6); }
    else if (kind === 'snow') { this.w.fx.snow(sx, sy, U, 18); c.frozen = M.min(1, c.frozen + 0.45); this.snowHits.push(T); }
    else this.w.fx.burst(sx, sy, heavy ? 10 + p * 16 : 5, p, U);
    if (heavy) { this.w.shake = (0.3 + p * 0.7) * U; this.w.flash = 0.25 + p * 0.4; }
    if (mega) this.w.fx.word(pick(['طرااااخ!!!', 'بوووووم!!!']), sx, sy - 2 * U, U * 2.4, CL.COL.red);
    else if (heavy && !soft) this.w.fx.word(pick(['طراخ!!', 'بووم!', 'دُوم!']), sx, sy - U, U * (1.4 + p), p > 0.6 ? CL.COL.red : CL.COL.yellow);
    else if (kind === 'hammer') this.w.fx.word(pick(['طوط!', 'بيب!', 'زمّور!']), sx, sy - U, U * 1.3, '#FFD43B');
    else if (this.combo > 2 && this.combo % 4 === 0) this.w.fx.word(pick(['طق!', 'طاخ!', 'بَك!']), sx, sy - U, U * 1.2);
    if (loc === 'head' && !soft && (chance(0.35 + p) || mega)) this.addLump(mega ? 2.6 : 0.8 + p * 1.4);
    if (this.helmetUntil > T && loc === 'head') { this.sfx('bell'); this.w.fx.word('طنغ!', sx, sy - U, U * 1.4, '#fff'); this.pain = M.max(0, this.pain - dmg * 0.7); }
    this.log(this.hitText(kind, loc, p, mega, heavy));
    if (this.hiding) { c.setFace('ouch', 0.8); this.say(c, 'hit_head', { prio: 2, mood: 'hurt' }); this.hideDuck = true; return; }
    if (this.ko) { c.vy = -6 * U * (1 + p); c.ground = null; this.say(c, 'hit_while_ko', { prio: 3, mood: 'sad' }); return; }
    if (this.fakeSleep) { this.fakeSleep = false; c.stop(); c.play(this.r_wake(), 3); return; }
    // he is in the right: takes it, but tells you off
    if (info.complain) { c.stop(); c.play(this.r_unjust(), 3); return; }
    // enough is enough: he grows big and defends himself (not every time)
    if (!this.raging && !this.hiding && T > (this.rageCool || 0) && (this.combo >= 12 || this.hits.filter((h) => T - h < 20).length >= 18) && chance(0.6)) { c.stop(); c.play(this.r_rage(), 4); return; }
    if (this.combo >= 26 || this.pain >= 120) { this.knockOut(); return; }
    if (mega) { c.stop(); c.play(this.r_mega(), 3); return; }
    // dignity: too many hits in a short time and he leaves for a while
    if (this.s.dignity && this.hits.filter((h) => T - h < 45).length >= 38) { c.stop(); c.play(this.r_leave(), 4); return; }
    if (kind === 'snow' && this.snowHits.filter((h) => T - h < 6).length >= 3) { this.snowHits = []; c.stop(); c.play(this.r_iceBlock(), 3); return; }
    const rx = this.reactionFor(kind, loc, p, heavy);
    c.stop(); c.play(rx, 2);
    // speech, depending on the combo
    const n = this.combo;
    if (soft > 0.6 && !heavy) { if (n === 1 || chance(0.3)) this.say(c, kind === 'pillow' ? 'pillow' : kind === 'feather' ? 'feather' : kind === 'balloon' ? 'balloon' : 'snow', { prio: 2, mood: 'happy' }); }
    else if (heavy) this.say(c, chance(0.5) ? 'hit_heavy' : 'hit_' + loc, { prio: 3, mood: 'hurt' });
    else if (n === 1 || (n < 8 && chance(0.25))) this.say(c, kind === 'hammer' && chance(0.5) ? 'hammer' : kind === 'glove' && chance(0.4) ? 'glove' : chance(0.55) ? 'hit_' + loc : 'hit_light', { prio: 1, mood: 'hurt' });
    if (n === 8 || (n > 8 && n < 16 && n % 5 === 0)) this.say(c, 'combo_angry', { prio: 3, mood: 'angry' });
    if (n === 16 || (n > 16 && n % 6 === 0)) this.say(c, 'dhikr_hit', { prio: 3, mood: 'serious' });
    else if (n > 3 && n % 7 === 0) this.say(c, 'dhikr_hit', { prio: 2, mood: 'serious' });
    clearTimeout(this.afterTimer);
    this.afterTimer = setTimeout(() => this.aftermath(), 1700);
  }
  hitText(kind, loc, p, mega, heavy) {
    const where = { head: 'الراس', face: 'الوجه', arm: 'الإيد', belly: 'البطن', legs: 'الرجل' }[loc] || 'جسمه';
    const tool = (CL.TOOLS[kind] || {}).name || 'العصا';
    return 'صاحبه ضرب كلود ' + (mega ? 'ضربة ساحقة' : heavy ? 'ضربة قوية' : 'ضربة') + ' بـ' + tool + ' على ' + where + (this.combo > 3 ? ' (كومبو ' + this.combo + ')' : '');
  }
  addLump(h) {
    const c = this.c, x = clamp(rnd(-2.5, 2.5), -3, 3);
    for (const l of c.lumps) if (M.abs(l.x - x) < 1.6) { l.h = M.min(2.6, l.h + h * 0.5); l.born = this.T; l.pop = 1; return; }
    if (c.lumps.length >= 3) c.lumps.shift();
    c.lumps.push({ x: x, h: M.min(2.6, h), born: this.T, pop: 1 });
  }
  reactionFor(kind, loc, p, heavy) {
    const B = this, c = this.c, k = 1 + p * 2.2, side = this.tool.x >= c.x ? 1 : -1;
    const hurtFace = () => pick(heavy ? ['ko', 'dizzy', 'hurt', 'shocked'] : this.combo >= 16 ? ['cry', 'crylaugh', 'pleading'] : this.combo >= 8 ? ['angry', 'furious', 'annoyed'] : ['hurt', 'ouch', 'surprised', 'shocked', 'annoyed']);
    const kick = (v) => { if (c.ground) c.tv += v; };
    if (heavy && p > 0.5) this.dizzyUntil = this.T + 1.6;
    // quick reactions during combos so it keeps up
    if (this.combo > 3 && !heavy) {
      return (function* () { c.setFace(hurtFace(), 0.5); c.sy.vel -= 6; c.sx.vel += 4; kick(-side * 3 * c.u); c.roll.vel += rnd(-2, 2); yield* wait(0.25); })();
    }
    if (kind === 'feather') return (function* () { c.setFace(pick(['laugh', 'crylaugh', 'joy']), 1.6); B.sfx('giggle'); yield* R.loop(1.4, (t) => { c.rollOverride = M.sin(t * 20) * 0.3; c.aL.t = c.aR.t = 0.9; }); c.rollOverride = null; c.aL.t = c.aR.t = 0; })();
    if (kind === 'pillow') {
      const v = [
        () => (function* () { c.setFace('laugh', 1.5); c.rollOverride = -side * 1.3; yield* wait(1); c.rollOverride = null; })(),
        () => (function* () { c.setFace('mischief', 2); c.prop = { kind: 'shield' }; B.sayText(c, CL.lineOf(['s|خود هي! 😄', 'e|خد دي! 😄', 'f|خذ هذه! 😄']), { prio: 2, mood: 'happy' }); B.tool.x += side * 3 * c.u; B.tool.a += side * 0.6; B.sfx('puff'); yield* wait(1); c.prop = null; })(),
        () => (function* () { c.setFace('ko', 1.8); yield* tween(1.2, (e) => { c.rollOverride = -side * e * 1.45; }); yield* wait(0.5); c.rollOverride = null; c.setFace('joy', 1); })()
      ];
      return v[CL.bag('pillowRx', v.length)]();
    }
    if (kind === 'hammer') return (function* () { c.setFace(pick(['dizzy', 'ko', 'hurt']), 1.4); c.sy.v = 0.45; c.sx.v = 1.5; c.sy.t = 0.5; yield* wait(0.5); c.sy.t = 1; B.sfx('boing'); })();
    if (kind === 'glove') {
      if (chance(0.35)) return (function* () { c.outfit.gloves = 1; c.setFace('determined', 2.5); B.say(c, 'glove', { prio: 2, mood: 'angry' });
        for (let i = 0; i < 3; i++) { yield* R.move(B, c, i % 2 ? 'punchR' : 'punchL'); yield* wait(0.15); } yield* wait(0.8); c.outfit.gloves = 0; })();
      return (function* () { c.setFace(hurtFace(), 1); if (c.ground) { c.ground = null; c.vx = -side * 30 * c.u * k; c.vy = -35 * c.u; c.trick = { t: 0, dur: 0.6, flip: -TAU * side }; } yield* until(() => c.ground, 2); })();
    }
    if (kind === 'balloon') return (function* () { c.setFace(pick(['shocked', 'annoyed', 'sideeye', 'sad']), 1.6); yield* wait(0.5); yield* R.loop(0.8, (t) => { c.yaw.t = M.sin(t * 40) * 0.5; }); c.yaw.t = 0; for (let i = 0; i < 6; i++) B.w.fx.drop(c.head.x + rnd(-4, 4) * c.u, c.head.y + 3 * c.u, rnd(-8, 8) * c.u, -rnd(4, 9) * c.u, c.u); })();
    if (kind === 'snow') return (function* () { c.setFace(pick(['nervous', 'shocked', 'scared']), 1.8); c.tremble = 0.6; yield* wait(1.4); c.tremble = 0; })();
    if (heavy) {
      const v = [
        () => (function* () { c.setFace(hurtFace(), 1.4); if (c.ground) { c.ground = null; c.vx = -side * 26 * c.u * k; c.vy = -45 * c.u * (0.6 + p); c.trick = { t: 0, dur: 0.7, flip: -TAU * side }; } yield* until(() => c.ground, 3); })(),
        () => (function* () { c.setFace('ko', 1.2); c.sy.v = 0.4; c.sx.v = 1.6; c.sy.t = 0.45; yield* wait(0.5); c.sy.t = 1; B.sfx('boing'); })(),
        () => (function* () { c.setFace('dizzy', 1.8); yield* R.loop(1.2, (t) => { c.rollOverride = M.sin(t * 9) * 0.5; }); c.rollOverride = null; })(),
        () => (function* () { c.setFace('shocked', 1.2); c.lockYaw = true; yield* tween(0.6, (e) => { c.yaw.t = e * TAU * side; }); c.yaw.set(0); c.lockYaw = false; c.setFace('dizzy', 1); })()
      ];
      return v[CL.bag('heavyRx', v.length)]();
    }
    const v = [
      () => (function* () { c.setFace(hurtFace(), 0.7); c.sy.vel -= 9 * k; c.sx.vel += 6 * k; yield* wait(0.5); })(),
      () => (function* () { c.setFace(hurtFace(), 0.8); kick(-side * 14 * c.u * k); c.roll.vel -= 4 * side; yield* wait(0.6); })(),
      () => (function* () { c.setFace('ouch', 1); (side > 0 ? c.aR : c.aL).t = -2.4; yield* R.loop(1, (t) => { (side > 0 ? c.aR : c.aL).t = -2.4 + M.sin(t * 20) * 0.2; }); c.aL.t = c.aR.t = 0; })(),
      () => (function* () { c.setFace(pick(['annoyed', 'sideeye', 'sideeyeL']), 1.8); c.lockYaw = true; c.yaw.t = -side * 1.2; yield* wait(1.4); c.yaw.t = 0; c.lockYaw = false; })(),
      () => (function* () { c.setFace(hurtFace(), 0.6); yield* wait(0.4); c.setFace('laugh', 1); B.sfx('giggle'); yield* wait(0.8); })(),
      () => (function* () { c.setFace('angry', 1.6); (side > 0 ? c.aR : c.aL).t = -1.4; (side > 0 ? c.fwdR : c.fwdL).t = 0.6; yield* R.loop(1.2, (t) => { c.yaw.t = side * 0.4 + M.sin(t * 14) * 0.15; }); c.aL.t = c.aR.t = 0; c.fwdL.t = c.fwdR.t = 0; c.yaw.t = 0; })(),
      () => (function* () { c.setFace('ko', 0.9); yield* tween(0.35, (e) => { c.rollOverride = -side * e * 0.9; }); yield* wait(0.4); c.rollOverride = null; c.setFace('hurt', 0.6); })(),
      () => (function* () { c.setFace(hurtFace(), 0.9); c.sit.t = 0.9; yield* wait(0.9); c.sit.t = 0; })(),
      () => (function* () { c.setFace(hurtFace(), 0.8); if (c.ground) { c.vy = -40 * c.u; c.ground = null; } c.legs[3] = -1.4; yield* until(() => c.ground, 2); })(),
      () => (function* () { c.setFace('dizzy', 1); yield* R.loop(0.8, (t) => { c.yaw.t = M.sin(t * 30) * 0.6; }); c.yaw.t = 0; })()
    ];
    if (loc === 'legs') return (function* () { c.setFace('hurt', 1); if (c.ground) { c.vy = -45 * c.u; c.ground = null; } c.legs[3] = -1.6; c.legs[2] = -1; yield* until(() => c.ground, 2); c.rollOverride = 0.25 * side; yield* wait(0.5); c.rollOverride = null; })();
    if (loc === 'arm') return v[2]();
    return v[CL.bag('lightRx', v.length)]();
  }
  aftermath() {
    const c = this.c;
    if (this.ko || this.away || c.busy(3) || this.T - this.lastHit < 1.5) return;
    this.combo = 0;
    const recent = this.hits.filter((h) => this.T - h < 30).length;
    c.play((function* (B) {
      if (B.anger > 60) { c.setFace('angry', 2.6); B.say(c, 'mad', { prio: 3, mood: 'angry' }); c.flush = 1;
        yield* R.loop(2.4, (t, dt) => { c.aL.t = c.aR.t = -1.2 + M.sin(t * 22) * 0.5; if (chance(dt * 4) && c.ground) { c.vy = -20 * c.u; c.ground = null; B.sfx('stomp'); } }); c.aL.t = c.aR.t = 0; }
      else if (B.pain > 35) { c.setFace('sad', 3); c.look.tx = -1; c.look.ty = 0.6; B.say(c, 'sulk', { prio: 2, mood: 'sad' }); c.sit.t = 0.6; yield* wait(3); c.sit.t = 0; c.look.tx = c.look.ty = 0; }
      else { c.sx.vel += 8; c.roll.vel += 3; if (chance(0.6)) B.say(c, 'mock', { prio: 2, mood: 'happy' }); c.setFace(pick(['smug', 'cool', 'tongue']), 1.6); yield* wait(1.5); }
      if (recent >= 15 && chance(0.55)) {
        yield* wait(0.6);
        B.ask(c, CL.lineOf(['s|حاسس إنك متضايق من شي… بدك نحكي؟', 'e|حاسس إنك متضايق… تحب نتكلم؟', 'g|كأنك متضايق… تبي نسولف؟', 'f|يبدو أنك متضايق… هل تريد أن نتحدث؟']),
          ['إي، بدي احكي', 'لا، الحمد لله تمام'], (i) => { if (i === 0) B.ui.openChat('متضايق من شي وبدي احكي'); else { c.setFace('joy', 2); B.say(c, 'calm', { prio: 2, mood: 'happy' }); } });
      } else { yield* wait(0.5); if (chance(0.6)) B.say(c, 'calm', { prio: 1, mood: 'calm' }); }
    })(this), 2);
  }
  r_unjust() {
    const B = this, c = this.c;
    return (function* () {
      c.setFace('serious', 4); c.fwdL.t = c.fwdR.t = 0.8; c.aL.t = c.aR.t = 0.6; // arms crossed
      B.say(c, B.activity && RELIGIOUS[B.activity] ? 'unjust_worship' : 'unjust', { prio: 3, mood: 'serious', dur: 3.5 });
      yield* wait(3.6); c.fwdL.t = c.fwdR.t = 0; c.aL.t = c.aR.t = 0;
    })();
  }
  catchAndThrow(side) {
    const B = this, c = this.c, t = this.tool;
    this.sfx('catch'); this.vib(40); t.state = 'caught';
    this.log('كلود مسك العصا ورماها بعيد لأنه كان على حق');
    c.play((function* () {
      c.setFace('serious', 3); const hand = side > 0 ? c.aR : c.aL;
      hand.t = -2.4;
      yield* R.loop(0.6, () => { t.x = c.head.x + side * 6 * c.u; t.y = c.head.y + 2 * c.u; t.a = side * 0.4; });
      B.say(c, 'catch_throw', { prio: 3, mood: 'serious' });
      yield* tween(0.25, (e) => { hand.t = -2.4 + e * 3.4; });
      const off = B.s.toolEdge !== false; // with the edge on, it goes behind the screen and you pull it out again
      t.state = 'fly'; t.thrownByClawd = true; t.vx = (off ? 1 : -side) * rnd(1300, 1900) * (B.w.U / 7); t.vy = -rnd(900, 1300) * (B.w.U / 7); t.va = (off ? 1 : -side) * 18; t.userPlaced = true;
      t.onLanded = () => { t.thrownByClawd = false; if (off) B.stowTool(true); };
      if (off) setTimeout(() => { if (t.state === 'fly' || t.x > B.w.W - 2 * t.u) { t.state = 'idle'; t.thrownByClawd = false; B.stowTool(true); } }, 1300);
      B.sfx('throwAway');
      yield* wait(0.8); hand.t = 0; c.yaw.t = 0;
      if (chance(0.6)) { yield* wait(0.6); B.say(c, B.activity && RELIGIOUS[B.activity] ? 'unjust_worship' : 'unjust', { prio: 3, mood: 'serious' }); }
    })(), 3);
  }
  r_rage() { // he grows big, stamps, boxes at the screen and knocks the tool away, then calms down
    const B = this, c = this.c, t = this.tool;
    return (function* () {
      B.raging = true; B.rageScale = 1; B.rageCool = B.T + 90; B.combo = 0; c.outfit.gloves = 1;
      try {
        c.setFace('determined', 8); B.say(c, 'rage', { prio: 4, mood: 'angry', dur: 2.4 }); B.sfx('stomp'); B.vib(80);
        yield* tween(0.7, (k) => { B.rageScale = 1 + k * 1.3; });
        for (let i = 0; i < 3; i++) { if (c.ground) { c.vy = -18 * c.u; c.ground = null; } yield* until(() => c.ground, 1); B.w.shake = c.u * 1.6; B.sfx('stomp'); B.vib(70); yield* wait(0.15); }
        for (let i = 0; i < 3; i++) {
          yield* R.move(B, c, i % 2 ? 'punchR' : 'punchL');
          B.screenPunch = { t0: B.T, side: i % 2 ? 1 : -1, x: c.head.x, y: c.head.y + 3 * c.u }; B.w.shake = c.u * 2.6; B.sfx('punch'); B.vib(90);
          yield* wait(0.5);
        }
        if (!t.stowed && !t.hidden) { t.state = 'fly'; t.thrownByClawd = true; t.vx = rnd(1500, 2000) * (B.w.U / 7); t.vy = -rnd(900, 1200) * (B.w.U / 7); t.va = 20; t.onLanded = () => { t.thrownByClawd = false; B.stowTool(true); };
          setTimeout(() => { if (!t.stowed) { t.state = 'idle'; t.thrownByClawd = false; B.stowTool(true); } }, 1300); B.sfx('throwAway'); }
        yield* wait(0.8);
        yield* tween(0.8, (k) => { B.rageScale = 2.3 - k * 1.3; });
        c.setFace('serious', 3); B.say(c, 'rage_end', { prio: 3, mood: 'serious' });
      } finally { B.raging = false; B.rageScale = 1; c.outfit.gloves = 0; }
    })();
  }
  confiscate() {
    const B = this, c = this.c, t = this.tool;
    this.sfx('catch'); this.confiscated = true; this.confiscatedUntil = this.T + 40; t.state = 'caught';
    this.log('كلود صادر العصا لفترة');
    c.play((function* () {
      c.setFace('serious', 3); B.say(c, 'confiscate', { prio: 3, mood: 'serious' });
      yield* tween(0.6, (e) => { t.x = lerp(t.x, c.head.x, e); t.y = lerp(t.y, c.head.y + 4 * c.u, e); t.scale.t = 1 - e; });
      t.hidden = true; t.state = 'idle'; c.aL.t = c.aR.t = 0; c.fwdL.t = c.fwdR.t = 0; c.yaw.t = 0;
    })(), 3);
  }
  giveBackTool() {
    const t = this.tool, c = this.c; this.confiscated = false; t.hidden = false; t.userPlaced = false; t.scale.v = 0.2; this.placeTool(true); this.sfx('pop');
    this.sayText(c, CL.lineOf(['s|خود العصا، بس بالعقل 😊', 'e|خد العصاية، بس بالعقل', 'g|خذ العصا، بس بعقل', 'f|خذ العصا، ولكن بحكمة']), { prio: 2, mood: 'calm' });
  }
  knockOut() {
    const B = this, c = this.c;
    if (this.ko) return;
    this.ko = true; this.combo = 0; c.stop();
    this.w.fx.word('K.O.', c.head.x, c.head.y, c.u * 2.6, CL.COL.red); this.sfx('ko'); this.vib(300); this.w.shake = c.u;
    setTimeout(() => this.sfx('ding'), 350);
    this.say(c, 'ko', { prio: 4, mood: 'sad' }); this.log('كلود انضرب لحد ما صار K.O.');
    c.play((function* () {
      const s = B.tool.x > c.x ? -1 : 1;
      c.setFace('ko', 4); B.dizzyUntil = B.T + 3.4;
      yield* tween(0.4, (e) => { c.rollOverride = s * e * 1.5; });
      yield* wait(3); B.revive();
    })(), 4);
  }
  revive() {
    const c = this.c; this.ko = false; c.rollOverride = null; c.bandage = 1; this.pain = 20; this.anger = 30;
    if (c.ground) { c.vy = -45 * c.u; c.ground = null; }
    c.setFace('determined', 1.5); this.sfx('up'); this.say(c, 'revive', { prio: 4, mood: 'happy' });
  }
  r_mega() {
    const B = this, c = this.c;
    return (function* () {
      c.sy.v = 0.28; c.sx.v = 1.7; c.sy.t = 0.3; c.sx.t = 1.65; c.setFace('ko', 2.2); B.dizzyUntil = B.T + 2.4; c.flush = 1;
      for (let i = 0; i < 6; i++) B.w.fx.star(c.head.x + rnd(-2, 2) * c.u, c.head.y, c.u);
      B.say(c, 'hit_mega', { prio: 4, mood: 'hurt' });
      yield* wait(0.8); c.sy.t = 1; c.sx.t = 1; c.sy.vel = 28; c.sx.vel = -12; B.sfx('boing'); c.legs = [-0.8, -0.5, -0.8, -0.5];
      yield* wait(1);
      if (B.pain >= 100) B.knockOut();
    })();
  }
  r_iceBlock() {
    const B = this, c = this.c;
    return (function* () {
      c.frozen = 1; c.setFace('shocked', 3); B.iceBlock = 1; B.sfx('crunch');
      B.sayText(c, CL.lineOf(['s|تجمّدت!!', 'e|اتجمدت!!', 'g|تجمّدت!!', 'f|تجمدت!!']), { prio: 3, mood: 'scared' });
      yield* wait(2.5); c.tremble = 1; yield* wait(0.6); c.tremble = 0; B.iceBlock = 0;
      B.w.fx.snow(c.head.x, c.head.y + 4 * c.u, c.u, 30); B.sfx('crunch'); c.vy = -40 * c.u; c.ground = null; c.setFace('determined', 1.4);
      B.sayText(c, CL.lineOf(['s|طلعت! 💪', 'e|خرجت! 💪', 'f|حررت نفسي! 💪']), { prio: 3, mood: 'happy' });
    })();
  }
  /* ---------------- running away while the tool is held (charging or dragging it) */
  canRun() {
    const c = this.c;
    return this.s.flee !== false && this.T > (this.runCool || 0) && !(this.away || this.ko || this.hiding || c.held || this.running ||
      this.fakeSleep || this.confiscated || this.typing || this.rightful() || c.busy(3));
  }
  maybeRun(p) { if (this.canRun() && chance(p == null ? 1 : p)) { this.c.play(this.r_run(), 3); return true; } return false; }
  r_run() {
    const B = this, c = this.c, t = this.tool, u = c.u;
    return (function* () {
      B.running = true; B.runFreeze = 0;
      const t0 = B.T;
      let released = B.T, nextSay = B.T + rnd(1.6, 2.4), lastJump = -9, dust = 0, cower = 0, cowerFor = 0, nearSaid = -9, lastCh = 0, ph = 0, escapes = 0;
      const flail = (on) => { c.aL.t = on ? -1.3 - M.sin(ph * 16) * 0.4 : 0; c.aR.t = on ? -1.3 + M.sin(ph * 16) * 0.4 : 0; };
      try {
        c.setFace(pick(['shocked', 'scared', 'surprised']), 0.9);
        B.say(c, 'run_start', { prio: 3, mood: 'scared', dur: 1.5 });
        if (c.ground && (c.ground.e === 'b' || c.ground.plat != null) && B.w.gdir.y > 0.7) { c.vy = -30 * u; c.vx = 0; c.ground = null; B.sfx('jump'); }
        yield* until(() => c.ground, 2.5);
        while (true) {
          const dt = yield; ph += dt;
          const held = t.held || t.state === 'charge';
          if (held) released = B.T;
          else if (B.T - released > 0.9 && t.state !== 'attack' && t.state !== 'fly') break;
          if (B.T - t0 > 24) { yield* B.runTired(); return; }
          // charge sound keeps telling you how strong the hit will be
          if (t.state === 'charge') { const k = (t.charge * 10) | 0; if (k !== lastCh) { lastCh = k; B.sfx('charge', t.charge); } }
          if (!c.ground) continue;
          if (B.T < B.runFreeze) { c.walk = 0; c.runLean = 0; c.tremble = 0.5; flail(false); continue; }
          // the line he runs along (the floor he stands on) and where the tool is on it
          const e = c.ground.plat != null ? 'b' : c.ground.e, bd = B.w.bounds;
          const horiz = e === 'b' || e === 't', dir = e === 'b' || e === 'l' ? 1 : -1;
          const me = horiz ? c.x : c.y, lo = (horiz ? bd.x0 : bd.y0) + 6 * u, hi = (horiz ? bd.x1 : bd.y1) - 6 * u;
          const ty = t.y - t.def.len * t.u * 0.5, tp = horiz ? t.x : ty;
          const away = me >= tp ? 1 : -1;
          const d2 = M.hypot(c.x - t.x, c.y - 4 * u - ty), W = M.min(B.w.W, B.w.H);
          const cornered = (away > 0 && me > hi - 5 * u) || (away < 0 && me < lo + 5 * u);
          const near = d2 < W * 0.3, mid = d2 < W * 0.6;
          if (cornered && (near || cower > 0)) {
            // nowhere left to run: escape over the tool / up the wall, or plead with hands up first
            c.walk = 0; c.runLean = 0; flail(false);
            const canJump = e === 'b' && B.w.gdir.y > 0.7;
            if (cower === 0) {
              cowerFor = canJump && (escapes === 0 || chance(0.45)) ? 0.25 : rnd(1.3, 2.4);
              if (cowerFor > 1) { B.say(c, 'run_corner', { prio: 3, mood: 'scared', dur: 1.8 }); c.setFace(pick(['pleading', 'scared', 'nervous']), 3); }
            }
            cower += dt;
            if (cowerFor > 1) { c.sit.t = 0.35; c.aL.t = c.aR.t = -2.5; c.fwdL.t = c.fwdR.t = 0.3; c.tremble = 0.6 + (t.state === 'charge' ? t.charge * 0.6 : 0); }
            if (!near && cower > 1) { cower = 0; c.sit.t = 0; c.tremble = 0; c.fwdL.t = c.fwdR.t = 0; continue; }
            if (cower > cowerFor && B.T - lastJump > 1.2) {
              cower = 0; c.sit.t = 0; c.tremble = 0; c.fwdL.t = c.fwdR.t = 0; c.aL.t = c.aR.t = 0; lastJump = B.T; escapes++;
              if (e === 'b' && B.w.gdir.y > 0.7) {
                B.say(c, 'run_jump', { prio: 3, mood: 'happy', dur: 1.3 });
                if (B.s.parkour && chance(0.35)) yield* R.wallRun(B, c);
                else yield* R.jump(B, c, clamp(t.x - away * 20 * u, bd.x0 + 8 * u, bd.x1 - 8 * u), bd.y1, rnd(14, 20) * u, true);
                c.setFace(pick(['mischief', 'wideHappy', 'smug']), 1.2);
              }
            }
            continue;
          }
          cower = 0; c.sit.t = 0; c.fwdL.t = c.fwdR.t = 0;
          if (!mid && !held) { c.walk = 0; continue; }
          if (cornered || !mid && t.state === 'charge' || !mid && d2 > W * 0.75) {
            // far enough: stop and keep an eye on it, trembling more as the charge grows
            c.walk = 0; c.runLean = 0; flail(false); c.look.tx = t.x > c.x ? 1 : -1;
            c.tremble = 0.2 + (t.state === 'charge' ? t.charge * 0.8 : 0); c.setFace(t.charge > 0.7 ? 'shocked' : 'nervous', 0.4);
            if (B.T > nextSay) { nextSay = B.T + rnd(2.2, 3.4); B.say(c, t.state === 'charge' ? 'tool_charge' : 'run_go', { prio: 3, mood: 'scared', dur: 1.3 }); }
            continue;
          }
          // run! faster the closer it is
          const sp = (near ? 30 : 21) * u;
          c.walk = away * dir * sp; c.tremble = 0; c.look.tx = 0;
          c.runLean = 0.2 * M.sign(c.walk); flail(true);
          c.setFace(near ? 'shocked' : pick(['scared', 'scared', 'wideHappy']), 0.5);
          if (near && B.T - nearSaid > 3.5) { nearSaid = B.T; B.say(c, 'run_near', { prio: 3, mood: 'scared', dur: 1.2 }); nextSay = B.T + 2; }
          else if (B.T > nextSay) { nextSay = B.T + rnd(2.4, 3.6); B.say(c, 'run_go', { prio: 3, mood: 'happy', dur: 1.3 }); }
          dust += dt;
          if (dust > 0.11 && M.abs(c.tv) > 14 * u) {
            dust = 0; const n = B.w.fx;
            n.puff(c.x - M.sign(c.tv) * 3 * u * (horiz ? 1 : 0), c.y - (horiz ? 0 : M.sign(c.tv) * 3 * u), u * 0.8, '#E9E4DA', rnd(1, 2.5));
            if (chance(0.35)) n.drop(c.head.x, c.head.y - u, -M.sign(c.tv) * rnd(4, 8) * u, -rnd(3, 6) * u, u);
          }
        }
        // the tool is down: catch his breath
        c.walk = 0; c.runLean = 0; flail(false); c.tremble = 0; c.sit.t = 0;
        c.setFace(pick(['relieved', 'relieved', 'embarrassed']), 2.2);
        B.say(c, 'run_safe', { prio: 3, mood: 'happy', dur: 2 });
        yield* R.loop(1.6, (k) => { c.sy.t = 1 + M.sin(k * 14) * 0.05; c.fwdL.t = c.fwdR.t = 0.4; });
      } finally {
        B.running = false; c.runLean = 0; c.walk = 0; c.tremble = 0; c.sit.t = 0; c.sy.t = 1;
        c.aL.t = c.aR.t = 0; c.fwdL.t = c.fwdR.t = 0; c.look.tx = 0;
      }
    })();
  }
  *runTired() {
    const c = this.c; this.runCool = this.T + 10;
    c.walk = 0; c.runLean = 0; c.aL.t = c.aR.t = 0; c.sit.t = 1; c.setFace('relieved', 4);
    this.say(c, 'run_tired', { prio: 3, mood: 'calm', dur: 2.6 });
    yield* R.loop(3, (k) => { c.sy.t = 1 + M.sin(k * 12) * 0.06; });
    c.sit.t = 0; c.sy.t = 1;
  }
  r_flee() {
    const B = this, c = this.c, t = this.tool;
    return (function* () {
      B.say(c, 'flee', { prio: 3, mood: 'scared' }); c.setFace(pick(['scared', 'shocked', 'wideHappy']), 6);
      const t0 = B.T;
      while (B.T - t0 < 6) {
        if (!c.ground) { yield; continue; }
        const away = c.x >= t.x ? 1 : -1, bd = B.w.bounds;
        if (c.hitWall || (away > 0 && c.x > bd.x1 - 9 * c.u) || (away < 0 && c.x < bd.x0 + 9 * c.u)) {
          if (B.s.parkour && chance(0.6)) yield* R.wallRun(B, c);
          else yield* R.jump(B, c, clamp(c.x - away * 30 * c.u, bd.x0 + 8 * c.u, bd.x1 - 8 * c.u), bd.y1, 10 * c.u);
        } else c.walk = away * 13 * c.u;
        yield;
        if (M.abs(t.x - c.x) > 45 * c.u && !t.held && t.state === 'idle') break;
      }
      c.walk = 0; c.setFace('relieved', 1.5); B.sayText(c, CL.lineOf(['s|هيييه… نجيت', 'e|الحمد لله نجيت', 'f|نجوت!']), { prio: 2, mood: 'happy' });
    })();
  }
  r_hide() {
    const B = this, c = this.c;
    return (function* () {
      B.hiding = true; c.noClip = true; c.ground = { e: 'b' }; c.setFace('scared', 2);
      B.sayText(c, CL.lineOf(['s|بتخبّى!', 'e|هستخبى!', 'g|بتخبّى!', 'f|سأختبئ!']), { prio: 3, mood: 'scared' });
      const H = B.w.H, y0 = c.y;
      try {
        yield* tween(0.6, (e) => { c.y = lerp(y0, H + 10.6 * c.u, e); });
        yield* wait(1.2);
        let n = 0, done = false;
        B.hideAsk = () => {
          B.ask(c, CL.line('hide_peek').text, ['خلص اطلع، ما رح اضربك', 'ضربة وحدة بس!', 'اطلع ولا بجيبك 😠'], (i) => {
            if (i === 0) { B.say(c, 'hide_ok', { prio: 3, mood: 'happy' }); B.rapport = M.min(100, B.rapport + 3); done = 'ok'; }
            else if (i === 1) { B.say(c, 'negotiate', { prio: 3, mood: 'calm' }); done = 'one'; }
            else { B.say(c, 'hide_scared', { prio: 3, mood: 'scared' }); done = 'scared'; }
          });
        };
        while (!done && n < 6) {
          yield* tween(0.5, (e) => { c.y = lerp(H + 10.6 * c.u, H + 7.9 * c.u, e); c.look.ty = -1; });
          c.setFace(pick(['pleading', 'nervous', 'scared']), 3);
          if (n === 0 || chance(0.6)) B.say(c, 'hide_peek', { prio: 3, mood: 'scared', dur: 2.5 });
          let w = 0; B.hideDuck = false;
          while (w < 3 && !done && !B.hideDuck) w += yield;
          if (done) break;
          yield* tween(0.3, (e) => { c.y = lerp(H + 7.9 * c.u, H + 10.6 * c.u, e); });
          yield* wait(B.hideDuck ? 1.6 : rnd(0.8, 1.6)); n++;
        }
        if (done === 'scared') yield* wait(3);
        B.ui.cancelAsk && B.ui.cancelAsk(); B.asking = null;
        // come back up
        c.noClip = false; c.ground = null; c.y = H + 7.6 * c.u; c.vy = -70 * c.u; c.vx = 0;
        yield* until(() => c.ground, 3);
        c.setFace(done === 'ok' ? 'joy' : 'nervous', 2);
      } finally { B.hiding = false; B.hideAsk = null; c.noClip = false; c.look.ty = 0; if (c.y > B.w.bounds.y1 + 1) { c.y = B.w.bounds.y1; c.ground = { e: 'b' }; } }
    })();
  }
  r_callFriend() {
    const B = this, c = this.c;
    return (function* () {
      B.say(c, 'call_friend', { prio: 3, mood: 'scared' }); c.setFace('pleading', 2);
      const f = B.spawnFriend(), bd = B.w.bounds, side = c.x < (bd.x0 + bd.x1) / 2 ? -1 : 1;
      try {
        f.x = side > 0 ? bd.x1 + 10 * f.u : bd.x0 - 10 * f.u; f.y = bd.y1; f.ground = { e: 'b' }; f.noEdge = true;
        const toolSide = B.tool.x > c.x ? 1 : -1, guard = clamp(c.x + toolSide * 10 * c.u, bd.x0 + 7 * f.u, bd.x1 - 7 * f.u);
        let t = 0; while (M.abs(f.x - guard) > f.u && t < 5) { f.walk = M.sign(guard - f.x) * 14 * f.u; t += yield; }
        f.walk = 0; f.tv = 0; f.noEdge = false; f.setFace('determined', 6); f.aL.t = f.aR.t = -1.6;
        B.sayText(f, CL.lineOf(['s|خلص يا جماعة! بالعقل', 'e|خلاص يا جماعة! بالراحة', 'f|كفى يا جماعة! بالحكمة']), { prio: 3, mood: 'serious' });
        B.friendGuard = B.T + 8; yield* wait(8);
        f.aL.t = f.aR.t = 0; B.say(c, 'friend_bye', { prio: 2, mood: 'happy' }); f.noEdge = true;
        const out = side > 0 ? bd.x1 + 12 * f.u : bd.x0 - 12 * f.u; t = 0;
        while (M.abs(f.x - out) > f.u && t < 5) { f.walk = M.sign(out - f.x) * 8 * f.u; t += yield; }
      } finally { B.friendGuard = 0; B.dropFriend(); }
    })();
  }
  r_leave() {
    const B = this, c = this.c;
    return (function* () {
      B.away = true; c.setFace('serious', 4); B.say(c, 'dignity_leave', { prio: 4, mood: 'serious', dur: 4 });
      B.log('كلود زعل من كتر الضرب وراح يتمشى');
      yield* wait(3); const bd = B.w.bounds, side = c.x > (bd.x0 + bd.x1) / 2 ? 1 : -1;
      c.noEdge = true; c.lockYaw = false;
      try {
        let t = 0; const out = side > 0 ? bd.x1 + 14 * c.u : bd.x0 - 14 * c.u;
        while (M.abs(c.x - out) > c.u && t < 8) { c.walk = side * 6 * c.u; t += yield; }
        c.walk = 0; c.alpha = 0;
        yield* wait(50);
        c.alpha = 1; const back = B.home().x; t = 0;
        while (M.abs(c.x - back) > c.u && t < 8) { c.walk = M.sign(back - c.x) * 5 * c.u; t += yield; }
        c.walk = 0;
      } finally { c.noEdge = false; c.alpha = 1; B.away = false; B.hits = []; B.anger = 0; B.pain = 0; }
      c.setFace('serious', 3);
      B.ask(c, CL.line('dignity_back').text, ['زعلان من شي', 'كنت عم إمزح', 'آسف'], (i) => {
        if (i === 0) { c.setFace('pleading', 2); B.ui.openChat('زعلان من شي وبدي احكي'); }
        else if (i === 1) { c.setFace('smug', 2); B.sayText(c, CL.lineOf(['s|ماشي، بس المزح إلو حدود 😊', 'e|ماشي، بس الهزار ليه حدود 😊', 'f|حسناً، لكن للمزاح حدود 😊']), { prio: 3, mood: 'calm' }); }
        else { c.setFace('love', 2); B.rapport = M.min(100, B.rapport + 6); B.say(c, 'calm', { prio: 3, mood: 'happy' }); }
      });
    })();
  }

  /* ---------------- phone context (needs the accessibility helper on Android) */
  onApp(kind, label) {
    const prev = this.appKind; this.appKind = kind; this.appInfo = true;
    this.w.platOn = kind === 'home' && this.icons.length > 0;
    if (kind === 'video') { if (this.videoStart == null) { this.videoStart = this.T; if (chance(0.5)) setTimeout(() => this.say(this.c, 'app_video', { prio: 2, mood: 'calm' }), 1500); } }
    else this.videoStart = null;
    if (kind === prev) return;
    if (kind === 'chat' && this.s.chatRead && this.T - (this.lastChatPeek || -999) > 120) { this.lastChatPeek = this.T; this.c.play(this.r_readChat(), 2); }
    if (kind === 'home' && chance(0.25)) this.say(this.c, 'app_home', { prio: 1, mood: 'happy' });
    this.log('صاحبه فتح ' + (label || kind));
  }
  onIcons(rects) {
    this.icons = rects || [];
    this.w.platforms = this.typing ? this.w.platforms : this.icons.map((r) => ({ x0: r.x + r.w * 0.15, x1: r.x + r.w * 0.85, y: r.y }));
    this.w.platOn = this.appKind === 'home' && this.icons.length > 0 && !this.typing;
  }
  r_readChat() {
    const B = this, c = this.c;
    return (function* () {
      c.scale.t = 0.8; const bd = B.w.bounds;
      yield* R.walkTo(B, c, bd.x0 + (bd.x1 - bd.x0) * 0.62, 7 * c.u);
      c.outfit.glasses = 1; c.look.ty = -1; c.look.tx = -0.4; c.pv.t = 0.35; c.setFace(pick(['suspicious', 'think', 'wideHappy']), 4);
      B.say(c, 'app_chat', { prio: 2, mood: 'happy' });
      yield* wait(5); c.outfit.glasses = 0; c.look.ty = c.look.tx = 0; c.pv.t = 0.12;
    })();
  }
  onKeyboard(open, field) {
    if (!this.s.typing) return;
    const c = this.c;
    if (!open) this.pendingKb = null;
    else if (this.activity && RELIGIOUS[this.activity]) { this.pendingKb = field; return; } // after his reading
    if (open && field) {
      const first = !this.typing; this.typing = true; this.field = field; if (first) { this.longSaid = false; this.typeStart = 0; this.lastTypeAt = 0; }
      const W = this.w.W, x0 = clamp(field.x + field.w * 0.12, 30, W - 60), x1 = x0 + M.min(field.w * 0.3, 120);
      this.w.platforms = [{ x0: x0, x1: x1, y: field.y }]; this.w.platOn = true;
      if (first) { c.stop(); c.play(this.r_toField(), 2); this.log('صاحبه عم يكتب رسالة'); }
    } else if (!open && this.typing) {
      if (this.typeStart && this.lastTypeAt - this.typeStart > 4 && chance(0.6)) this.say(c, 'typing_done', { prio: 2, mood: 'happy' });
      this.typing = false; this.field = null; this.typeStart = 0; this.onIcons(this.icons);
      c.outfit.glasses = 0; c.sit.t = 0; c.look.ty = 0;
      c.stop(); c.play(R.goHome(this, c), 1);
    }
  }
  r_toField() {
    const B = this, c = this.c;
    return (function* () {
      c.scale.t = 0.62; yield* wait(0.15);
      if (!c.ground) yield* until(() => c.ground, 3);
      const p = B.w.platforms[0]; if (!p) return;
      B.say(c, 'typing_start', { prio: 2, mood: 'happy' });
      yield* R.jump(B, c, (p.x0 + p.x1) / 2, p.y, 6 * c.u, chance(0.5));
      c.sit.t = 1; c.outfit.glasses = 1; c.look.ty = 0.8; c.look.tx = 0.3; c.baseFace = 'normal';
      while (B.typing) { yield* wait(rnd(2.5, 5)); if (!B.typing) break; c.look.tx = rnd(-0.8, 0.8); if (chance(0.25)) c.setFace(pick(['think', 'suspicious', 'normal']), 1); }
    })();
  }
  onTypingActivity() { // only "the user is typing"; he never sees the words
    if (!this.s.typing || !this.typing) return;
    const T = this.T, c = this.c;
    if (!this.typeStart) this.typeStart = T;
    this.lastTypeAt = T;
    if (T - this.lastTypeReact < 7) return;
    this.lastTypeReact = T;
    if (T - this.typeStart > 60 && !this.longSaid) { this.longSaid = true; c.setFace(pick(['shocked', 'laugh', 'wideHappy']), 2); this.say(c, 'typing_long', { prio: 2, mood: 'happy' }); return; }
    if (chance(0.35)) { c.setFace(pick(['suspicious', 'think', 'wideHappy', 'sideeye', 'happy', 'wink']), 1.8); this.say(c, 'typing_watch', { prio: 1, mood: 'calm' }); }
    else c.setFace(pick(['think', 'normal', 'happy', 'sideeye']), 1.2);
  }
  /* ---------------- prayer times: a reminder when it's time, and an hour later "did you pray it on time?" */
  prayTick() {
    if (this.arena || this.s.prayOn === false || !CL.PRAY) return;
    const now = new Date(), day = now.toDateString();
    if (this.prayDay !== day) { this.prayDay = day; this.prayList = CL.PRAY.today(this.s, now) || []; this.prayDone = CL.store('prayDone:' + day) || {}; }
    if (!this.prayList.length || !this.present || this.asking || this.away || this.ko || (this.activity && RELIGIOUS[this.activity])) return;
    for (const p of this.prayList) {
      const d = now.getTime() - p.at.getTime(), st = this.prayDone[p.k] || 0;
      if (st === 0 && d >= 0 && d < 40 * 60000) { this.prayDone[p.k] = 1; CL.store('prayDone:' + day, this.prayDone); this.announcePrayer(p); return; }
      if (st <= 1 && d >= 60 * 60000 && d < 4 * 3600000) { this.prayDone[p.k] = 2; CL.store('prayDone:' + day, this.prayDone); this.askPrayed(p); return; }
    }
  }
  prayLine(key, p) { return (CL.line(key).text || '').replace(/\{p\}/g, p.name); }
  announcePrayer(p) {
    const c = this.c; c.scale.t = 1;
    c.play((function* (B) {
      c.setFace('serene', 3); B.sfx('chime');
      B.sayText(c, '🕌 ' + (B.prayLine('prayer_now', p) || 'حان وقت صلاة ' + p.name), { prio: 4, mood: 'calm', dur: 5 });
      yield* wait(5.2);
      B.sayText(c, CL.lineOf(['s|قوم توضّا وصلّي، وأنا بستناك 🤲', 'e|قوم اتوضى وصلّي، أنا مستنيك', 'y|قم توضّأ وصلِّ، وأنا أنتظرك', 'f|قم فتوضأ وصلِّ، وأنا في انتظارك']), { prio: 3, mood: 'calm', dur: 4 });
    })(this), 3);
    this.log('ذكّر صاحبه بصلاة ' + p.name);
  }
  askPrayed(p) {
    const c = this.c; c.scale.t = 1;
    this.ask(c, this.prayLine('prayer_check', p) || ('صلّيت ' + p.name + ' بوقتها؟'), ['الحمد لله صلّيتها بوقتها', 'لسّا، رح صلّي هلّق', 'فاتتني'], (i) => {
      if (i === 0) { c.setFace('proud', 2.5); this.say(c, 'prayer_yes', { prio: 3, mood: 'happy' }); this.w.fx.burst(c.head.x, c.head.y, 10, 0.3, c.u); this.rapport = M.min(100, this.rapport + 2); }
      else { c.setFace(i === 1 ? 'determined' : 'pleading', 2.5); this.say(c, 'prayer_no', { prio: 3, mood: 'calm' }); this.rightfulUntil = this.T + 120; }
      this.log('سأل صاحبه عن صلاة ' + p.name);
    });
    this.ui.showOptions();
  }
  /* ---------------- today's phone use (screen on time): every full hour he says how long and reminds of Allah's question */
  usageTick(dt) {
    if (this.arena || !this.present) return;
    const day = new Date().toDateString();
    if (this.useDay !== day) { this.useDay = day; this.useSec = +(CL.store('use:' + day) || 0); this.useHour = M.floor(this.useSec / 3600); }
    this.useSec += dt; this.useSave = (this.useSave || 0) + dt;
    if (this.useSave > 15) { this.useSave = 0; CL.store('use:' + day, M.round(this.useSec)); }
    const h = M.floor(this.useSec / 3600);
    if (h > this.useHour) { this.useHour = h; if (this.s.usage !== false) this.usageNag(h); }
  }
  usageNag(h) {
    const c = this.c; c.scale.t = 1;
    const head = h === 1 ? 'ساعة كاملة على الهاتف اليوم ⏱️' : h === 2 ? 'ساعتين على الهاتف اليوم! ⏱️' : this.num(h) + ' ساعات على الهاتف اليوم! ⏱️';
    const H = [{ t: 'نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ', r: 'رواه البخاري' },
      { t: 'اغتنم خمساً قبل خمس: شبابك قبل هرمك، وصحتك قبل سقمك، وغناك قبل فقرك، وفراغك قبل شغلك، وحياتك قبل موتك', r: 'رواه الحاكم وصححه الألباني' },
      { t: 'لا تزول قدما عبد يوم القيامة حتى يُسأل عن عمره فيمَ أفناه، وعن علمه فيمَ فعل، وعن ماله من أين اكتسبه وفيمَ أنفقه، وعن جسمه فيمَ أبلاه', r: 'رواه الترمذي' }];
    const hd = H[CL.bag('useHadith', H.length)];
    c.play((function* (B) {
      c.setFace('serious', 3); B.sayText(c, head, { prio: 4, mood: 'serious', dur: 3.2 }); yield* wait(3.4);
      B.say(c, h >= 3 ? 'usage_3h' : h === 2 ? 'usage_2h' : 'usage_1h', { prio: 4, mood: 'serious', dur: 4.5 }); yield* wait(4.7);
      B.sayText(c, '«' + hd.t + '» ' + hd.r, { prio: 4, mood: 'calm', dur: clamp(2 + hd.t.length * 0.06, 5, 10) });
    })(this), 3);
    this.log('نبّه صاحبه إنه صار له ' + h + ' ساعة على الهاتف');
  }
  usageToday() { return M.round(this.useSec || +(CL.store('use:' + new Date().toDateString()) || 0)); }

  onScreen(state, awayMs) {
    const T = this.T, c = this.c;
    if (state === 'off') { this.present = false; if (T - this.adviceAt < 180) this.praisePending = true; return; }
    if (state !== 'present') return;
    this.present = true; this.sessionStart = T; this.videoStart = null;
    if (this.praisePending) { this.praisePending = false; c.setFace('proud', 2); this.say(c, 'praise', { prio: 3, mood: 'happy' }); this.w.fx.burst(c.head.x, c.head.y, 10, 0.3, c.u); return; }
    if (!this.s.greet || (awayMs || 0) < 5 * 60 * 1000) return;
    this.lastUser = T; c.scale.t = 1;
    const hr = new Date().getHours();
    const key = hr >= 4 && hr < 11 ? 'greet_morning' : hr >= 17 && hr < 23 && chance(0.5) ? 'greet_evening' : 'greet_back';
    c.play((function* (B) { c.setFace(pick(['joy', 'wideHappy', 'happy']), 2.5); yield* R.wave(B, c); B.say(c, key, { prio: 3, mood: 'happy' }); yield* wait(3);
      if (chance(0.55) && B.s.questions) B.askQ('mood'); })(this), 3);
    this.log('صاحبه رجع للتلفون بعد غياب');
  }

  /* ---------------- chat with Claude */
  onChatState(open, rect) {
    this.chatOpen = open; this.chatRect = rect || null;
    const c = this.c;
    if (open && rect && this.w.gdir.y > 0.7 && rect.y - 9.5 * c.u * 0.7 > this.w.bounds.y0) {
      this.w.platforms = [{ x0: rect.x + 20, x1: rect.x + M.min(rect.w - 20, 140), y: rect.y }]; this.w.platOn = true;
      c.stop(); c.play((function* (B) { c.scale.t = 0.7; yield* wait(0.2); if (!c.ground) yield* until(() => c.ground, 3); const p = B.w.platforms[0]; if (p) yield* R.jump(B, c, (p.x0 + p.x1) / 2, p.y, 5 * c.u, false); c.sit.t = 1; })(this), 2);
    } else if (!open) { c.sit.t = 0; this.onIcons(this.icons); c.play(R.goHome(this, c), 1); }
  }
  onChatReply(face, act, streaming) {
    const c = this.c; this.touch();
    if (streaming) { c.talkT = 0.4; return; }
    if (face && CL.FACES[face]) c.setFace(face, 4);
    const acts = { wave: R.wave, dance: R.wave, think: R.scratch, jump: R.hop, flip: (B, b) => (function* () { if (b.ground) { b.vy = -55 * b.u; b.ground = null; b.trick = { t: 0, dur: 0.6, flip: TAU }; } yield* until(() => b.ground, 2); })(),
      laugh: (B, b) => B.r_tickle(4), stretch: R.stretch, spin: R.turnAround, hearts: (B, b) => (function* () { for (let i = 0; i < 4; i++) { B.w.fx.heart(b.head.x + rnd(-3, 3) * b.u, b.head.y, b.u); yield* wait(0.3); } })(),
      sad: (B, b) => (function* () { b.sit.t = 0.6; yield* wait(2); b.sit.t = 0; })(), proud: R.stretch };
    if (act && acts[act]) c.play(acts[act](this, c), 2);
  }
  chatContext() { // short description of what is happening, sent with each chat message
    const ago = (t) => { const s = ((Date.now() - t) / 1000) | 0; return s < 60 ? 'قبل ' + s + ' ثانية' : 'قبل ' + ((s / 60) | 0) + ' دقيقة'; };
    const mood = this.ko ? 'مغمى عليه' : this.anger > 50 ? 'معصّب' : this.pain > 40 ? 'متألم' : this.rapport > 75 ? 'مبسوط ومحب' : this.rapport < 30 ? 'زعلان شوي' : 'عادي';
    return {
      mood: mood, rapport: M.round(this.rapport), activity: this.activity || 'لا شي', hitsLastMinute: this.hits.length,
      inTheRight: !!this.rightful(), recent: this.events.slice(-8).map((e) => ago(e.t) + ': ' + e.txt)
    };
  }

  /* ---------------- extras drawn on top: dizzy stars, focus aura, ice block */
  drawExtras(ctx, layer) {
    if (layer !== 'front') return;
    const c = this.c, T = this.T;
    if (this.screenPunch) { // his glove flies at the screen and cracks the glass
      const sp = this.screenPunch, k = (T - sp.t0) / 0.9;
      if (k >= 1) this.screenPunch = null;
      else {
        const W = this.w.W, H = this.w.H, cx = W / 2 + sp.side * W * 0.12, cy = H * 0.42, g = M.min(1, k * 3.2);
        if (k > 0.3) { ctx.save(); ctx.globalAlpha = M.min(1, (1 - k) * 2.2); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.2;
          for (let i = 0; i < 9; i++) { const a = i * 0.7 + sp.side, r1 = 18 + (i % 3) * 30, r2 = r1 + 40 + (i % 2) * 50; ctx.beginPath(); ctx.moveTo(cx + M.cos(a) * 8, cy + M.sin(a) * 8); ctx.lineTo(cx + M.cos(a + 0.12) * r1, cy + M.sin(a + 0.12) * r1); ctx.lineTo(cx + M.cos(a - 0.05) * r2, cy + M.sin(a - 0.05) * r2); ctx.stroke(); }
          ctx.restore(); }
        ctx.save(); ctx.globalAlpha = k < 0.6 ? 1 : (1 - k) / 0.4;
        ctx.translate(lerp(sp.x, cx, g), lerp(sp.y, cy, g)); ctx.rotate(sp.side * 0.3); const s = lerp(c.u * 0.9, c.u * 9, g * g); ctx.translate(0, CL.TOOLS.glove.len * s * 0.5);
        CL.drawTool(ctx, 'glove', s, 0, T); ctx.restore();
      }
    }
    if (T < this.dizzyUntil || (this.ko && c.alpha > 0)) {
      for (let i = 0; i < 4; i++) { const a = T * 4 + i * PI / 2; CL.glyph(ctx, CL.STAR, c.head.x + M.cos(a) * 4 * c.u, c.head.y - 0.8 * c.u + M.sin(a) * 1.1 * c.u, c.u * 0.28); }
    }
    if (c.focusAura > 0) {
      ctx.strokeStyle = 'rgba(217,119,87,' + c.focusAura * 0.6 + ')'; ctx.lineWidth = M.max(1, c.u * 0.25);
      const bb = c.bbox; for (let i = 0; i < 3; i++) { const g = (i + 1) * c.u * 0.9 + M.sin(T * 3 + i) * c.u * 0.3; ctx.strokeRect(bb.x - g, bb.y - g, bb.w + 2 * g, bb.h + 2 * g); }
    }
    if (this.iceBlock) { const bb = c.bbox, g = c.u; ctx.fillStyle = 'rgba(190,230,250,.45)'; ctx.fillRect(bb.x - g, bb.y - g, bb.w + 2 * g, bb.h + 2 * g); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.strokeRect(bb.x - g, bb.y - g, bb.w + 2 * g, bb.h + 2 * g); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(bb.x, bb.y, g, bb.h * 0.5); }
  }
}
CL.Brain = Brain;
})();
