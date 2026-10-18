/* Page glue for the floating stage (full screen, over other apps) and the in-app arena.
   Touches arrive either from the browser (pointer events) or from Android's small touch pads (window.clawd.touch).
   Everything Android sends goes through window.clawd.* */
(function () {
'use strict';
const CL = window.CL, u = CL.u, M = Math;
const NATIVE = typeof window.A !== 'undefined';
const call = (fn, ...a) => { if (NATIVE && A[fn]) { try { return A[fn](...a); } catch (e) { console.error(fn, e); } } return undefined; };

CL.startStage = function (opts) {
  opts = opts || {};
  const cv = opts.canvas, root = opts.root || document.body;
  const Q = new URLSearchParams(location.search);
  const MOCK = !!opts.mock;
  // settings
  let saved = null;
  try { saved = NATIVE && A.getSettings ? JSON.parse(A.getSettings() || 'null') : CL.store('settings'); } catch (e) { saved = null; }
  CL.applySettings(saved); CL.snd.on = CL.settings.sound;
  const world = new CL.World(cv, { arena: !!opts.arena });
  const sizeMul = { s: 0.8, m: 1, l: 1.3 };
  world.sizeMul = sizeMul[CL.settings.size] || 1; world.resize();
  if (opts.arena) world.insets = { top: 0, bottom: M.max(14, world.H * 0.06), left: 0, right: 0 };
  else if (!NATIVE) world.insets = { top: MOCK ? 96 : 28, bottom: 64, left: 0, right: 0 };

  /* ---------------- UI layer: bubbles, answer buttons, little buttons */
  const ui = document.createElement('div'); ui.className = 'cl-ui'; root.appendChild(ui);
  const bubbles = new Map();
  let optsBox = null, optsCb = null, optsShown = false, askBot = null, hintUntil = 0;
  const chatBtn = document.createElement('div'); chatBtn.className = 'cl-btn cl-chat'; chatBtn.textContent = '💬'; ui.appendChild(chatBtn);
  const swBtn = document.createElement('div'); swBtn.className = 'cl-btn cl-switch'; swBtn.textContent = '⇄'; ui.appendChild(swBtn);
  function bubbleFor(b) {
    let e = bubbles.get(b);
    if (!e) { e = { el: document.createElement('div'), until: 0, prio: 0, scale: 1 }; e.el.className = 'cl-bub'; ui.appendChild(e.el); bubbles.set(b, e); }
    return e;
  }
  const UI = {
    say(b, text, o) {
      const e = bubbleFor(b), T = world.T;
      if (!text) { e.until = 0; e.el.classList.remove('on'); return false; }
      if (T < e.until && (o.prio || 1) < e.prio && !e.asking) return false;
      if (e.asking && b === askBot && (o.prio || 1) < 3) return false;
      e.el.textContent = text; e.until = T + o.dur; e.prio = o.prio || 1; e.scale = 1.22;
      e.el.className = 'cl-bub on' + (o.shout ? ' shout' : '') + (o.quran ? ' quran' : '') + (o.small ? ' small' : '');
      return true;
    },
    ask(b, text, options, cb) {
      UI.cancelAsk();
      const e = bubbleFor(b); askBot = b; optsCb = cb; e.asking = true;
      e.el.textContent = text; e.until = world.T + 600; e.prio = 5; e.scale = 1.22;
      e.el.className = 'cl-bub on asking';
      const hint = document.createElement('span'); hint.className = 'cl-hint'; hint.textContent = 'اضغط لتجاوب'; e.el.appendChild(hint);
      optsBox = document.createElement('div'); optsBox.className = 'cl-opts';
      options.forEach((t, i) => { const d = document.createElement('div'); d.className = 'cl-opt'; d.textContent = t; d.dataset.i = i; optsBox.appendChild(d); });
      ui.appendChild(optsBox); optsShown = !!opts.arena || CL.settings.showOptions === true;
      optsBox.style.display = optsShown ? 'flex' : 'none';
      CL.sfx.chime && CL.settings.sound && CL.sfx.chime();
    },
    showOptions() { if (optsBox) { optsShown = true; optsBox.style.display = 'flex'; } },
    cancelAsk() {
      if (optsBox) { optsBox.remove(); optsBox = null; }
      optsShown = false; optsCb = null;
      if (askBot) { const e = bubbles.get(askBot); if (e) { e.asking = false; e.until = 0; } askBot = null; }
    },
    vib(ms) { if (NATIVE) call('vibrate', ms | 0); else try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} },
    openChat(seed) { if (NATIVE) call('openChat', seed || ''); else if (opts.onChat) opts.onChat(seed || ''); },
    log(txt) { call('logEvent', txt); },
    toolHint() { hintUntil = world.T + 3.5; },
    saveSetting(k, v) { CL.settings[k] = v; persist(); },
    stat(d) { if (opts.onStat) opts.onStat(d); }
  };
  function persist() { if (NATIVE) call('setSettings', JSON.stringify(CL.settings)); else CL.store('settings', CL.settings); }
  function answer(i) { const cb = optsCb; const b = askBot; UI.cancelAsk(); if (b) { const e = bubbles.get(b); if (e) e.until = 0; } if (cb) cb(i); }

  const brain = new CL.Brain(world, UI, { arena: !!opts.arena });
  CL.world = world; CL.brain = brain;

  /* ---------------- layout each frame: bubbles, buttons, touch pads */
  function rectOf(el) { const r = el.getBoundingClientRect(), rr = root.getBoundingClientRect(); return { x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height }; }
  function layout() {
    const T = world.T, W = world.W, H = world.H;
    bubbles.forEach((e, b) => {
      if (T >= e.until || b.alpha < 0.05 || b.gone || !world.bots.includes(b)) { if (e.el.classList.contains('on')) e.el.classList.remove('on'); if (!world.bots.includes(b) && b !== brain.c) { e.el.remove(); bubbles.delete(b); } return; }
      e.scale = u.lerp(e.scale, 1, 0.25);
      const bw = e.el.offsetWidth, bh = e.el.offsetHeight;
      let x = u.clamp(b.head.x - bw / 2, 6, W - bw - 6), y = b.head.y - bh - 12;
      const top = world.insets.top + 4;
      if (y < top) y = M.min(b.bbox.y + b.bbox.h + 12, H - bh - 6);
      if (y > H - bh - 4) y = H - bh - 4;
      e.el.style.setProperty('--tail', u.clamp(b.head.x - x, 16, bw - 16) + 'px');
      e.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + e.scale.toFixed(3) + ')';
      e.x = x; e.y = y; e.w = bw; e.h = bh;
    });
    if (optsBox) {
      const e = bubbles.get(askBot);
      const ow = optsBox.offsetWidth, oh = optsBox.offsetHeight;
      let x = u.clamp((askBot ? askBot.head.x : W / 2) - ow / 2, 8, W - ow - 8);
      let y = e ? e.y - oh - 10 : H / 2 - oh / 2;
      if (y < world.insets.top + 4) y = e ? M.min(e.y + e.h + 10, H - oh - 8) : 40;
      if (askBot && y + oh > askBot.bbox.y && y < askBot.bbox.y + askBot.bbox.h && e) y = M.max(world.insets.top + 4, askBot.bbox.y - oh - 8);
      optsBox.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    const c = brain.c, big = c.scale.v > 0.8;
    const showChat = CL.settings.chatBtn && big && !brain.away && !brain.hiding && !c.held && !opts.noChatBtn;
    chatBtn.style.display = showChat ? 'flex' : 'none';
    if (showChat) { const bx = u.clamp(c.bbox.x + c.bbox.w + 2, 4, W - 46), by = u.clamp(c.bbox.y - 30, world.insets.top, H - 46); chatBtn.style.transform = 'translate(' + bx + 'px,' + by + 'px)'; }
    const t = brain.tool, showSw = !t.hidden && t.state === 'idle' && !t.held && !brain.asking && (big || T < hintUntil);
    swBtn.style.display = showSw ? 'flex' : 'none';
    if (showSw) { const r = t.bboxRect(); swBtn.style.transform = 'translate(' + u.clamp(r.x + r.w + 4, 4, W - 50) + 'px,' + u.clamp(r.y - 10, world.insets.top, H - 50) + 'px)'; }
  }
  function grow(r, min) { const w = M.max(r.w, min), h = M.max(r.h, min); return { x: r.x - (w - r.w) / 2, y: r.y - (h - r.h) / 2, w: w, h: h }; }
  function targets() { // in priority order
    const out = [], c = brain.c, t = brain.tool;
    if (optsBox && optsShown) [].forEach.call(optsBox.children, (d) => out.push({ id: 'opt' + d.dataset.i, r: rectOf(d) }));
    if (swBtn.style.display !== 'none') out.push({ id: 'switch', r: grow(rectOf(swBtn), 48) });
    if (chatBtn.style.display !== 'none') out.push({ id: 'chatbtn', r: grow(rectOf(chatBtn), 48) });
    bubbles.forEach((e, b) => { if (e.asking && world.T < e.until && e.w) out.push({ id: 'bubble', r: { x: e.x, y: e.y, w: e.w, h: e.h } }); });
    if (!t.hidden && t.alpha > 0.1 && t.state !== 'caught' && t.state !== 'fly') out.push({ id: 'tool', r: grow(t.bboxRect(), 52) });
    if (c.alpha > 0.1 && !brain.away) { const bb = c.bbox, m = c.u * 1.2; out.push({ id: 'char', r: grow({ x: bb.x - m, y: bb.y - m, w: bb.w + 2 * m, h: bb.h + 2 * m }, 48) }); }
    return out;
  }
  function hit(x, y) { const ts = targets(); for (const t of ts) { const r = t.r; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return t.id; } return null; }
  let lastPads = '', lastPadT = 0;
  function sendPads(now) {
    if (!NATIVE || opts.arena) return;
    if (now - lastPadT < 60) return;
    const ts = targets().map((t) => [t.id, M.round(t.r.x), M.round(t.r.y), M.round(t.r.w), M.round(t.r.h)]);
    const s = JSON.stringify(ts);
    if (s === lastPads) return;
    lastPads = s; lastPadT = now; call('setPads', s);
  }

  /* ---------------- gestures */
  const G = new Map(); let lastCharTap = 0;
  function gDown(pid, id, x, y) {
    const now = performance.now() / 1000;
    const g = { id: id, x0: x, y0: y, lx: x, ly: y, lt: now, t0: now, vx: 0, vy: 0, moved: false, long: false, charging: false, timer: 0 };
    G.set(pid, g);
    if (id === 'char') g.timer = setTimeout(() => { if (!g.moved) { g.long = true; brain.onCharLong(); } }, 480);
    else if (id === 'tool') { brain.onToolDown(); g.timer = setTimeout(() => { if (!g.moved) { g.charging = true; brain.toolChargeStart(); } }, 260); }
  }
  function gMove(pid, x, y) {
    const g = G.get(pid); if (!g) return;
    const now = performance.now() / 1000, dt = M.max(0.008, now - g.lt);
    g.vx = u.lerp(g.vx, (x - g.lx) / dt, 0.5); g.vy = u.lerp(g.vy, (y - g.ly) / dt, 0.5); g.lx = x; g.ly = y; g.lt = now;
    if (!g.moved && M.hypot(x - g.x0, y - g.y0) > 12) {
      g.moved = true; clearTimeout(g.timer);
      if (g.id === 'char' && !g.long) brain.onCharDragStart();
      else if (g.id === 'tool') { brain.toolCancelCharge(); brain.onToolDragStart(); }
    }
    if (!g.moved) return;
    if (g.id === 'char') brain.onCharDrag(x, y, g.vx);
    else if (g.id === 'tool') brain.onToolDrag(x, y, g.vx, g.vy);
  }
  function gUp(pid, x, y, cancel) {
    const g = G.get(pid); if (!g) return; G.delete(pid); clearTimeout(g.timer);
    const now = performance.now() / 1000, dur = now - g.t0;
    if (g.id === 'char') {
      if (g.moved) {
        // a quick short flick upwards opens the chat
        if (!cancel && dur < 0.32 && g.y0 - y > 40 && M.abs(x - g.x0) < 60 && M.hypot(x - g.x0, y - g.y0) < 170) { brain.onCharDragEnd(0, 0); UI.openChat(''); return; }
        brain.onCharDragEnd(g.vx, g.vy);
      } else if (!g.long && !cancel) { brain.onCharTap(); lastCharTap = now; }
    } else if (g.id === 'tool') {
      if (cancel) { brain.toolCancelCharge(); return; }
      if (g.moved) brain.onToolRelease(M.hypot(g.vx, g.vy) > 700 ? 'fling' : 'drop', g.vx, g.vy);
      else brain.onToolRelease(g.charging ? 'charge' : 'tap');
    } else if (!cancel && !g.moved) {
      if (g.id === 'bubble') UI.showOptions();
      else if (g.id === 'chatbtn') UI.openChat('');
      else if (g.id === 'switch') { brain.chooseTool(); hintUntil = 0; }
      else if (g.id.indexOf('opt') === 0) answer(+g.id.slice(3));
    }
  }
  // browser input
  const surface = opts.arena ? root : document;
  function pt(e) { const r = root.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  surface.addEventListener('pointerdown', (e) => {
    if (NATIVE && !opts.arena) return;
    const p = pt(e), id = hit(p.x, p.y); if (!id) return;
    e.preventDefault(); try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
    gDown(e.pointerId, id, p.x, p.y);
  }, { passive: false });
  surface.addEventListener('pointermove', (e) => { if (G.has(e.pointerId)) { const p = pt(e); gMove(e.pointerId, p.x, p.y); } });
  surface.addEventListener('pointerup', (e) => { if (G.has(e.pointerId)) { const p = pt(e); gUp(e.pointerId, p.x, p.y, false); } });
  surface.addEventListener('pointercancel', (e) => { if (G.has(e.pointerId)) { const p = pt(e); gUp(e.pointerId, p.x, p.y, true); } });

  /* ---------------- gravity, tilt, shake */
  let prevDir = { x: 0, y: 1 }, prevT = 0, lastShake = 0;
  function gravity(gx, gy) {
    if (!CL.settings.gravity) { world.setGravity(0, 9.8); return; }
    world.setGravity(gx, gy);
    const d = world.gdir, T = world.T;
    const ang = M.acos(u.clamp(d.x * prevDir.x + d.y * prevDir.y, -1, 1));
    if (ang > 0.7 && T - prevT > 0.6) { prevT = T; brain.onTilt(ang > 1.2); prevDir = { x: d.x, y: d.y }; }
    else if (ang > 0.25) prevDir = { x: lerpN(prevDir.x, d.x), y: lerpN(prevDir.y, d.y) };
  }
  function lerpN(a, b) { return a + (b - a) * 0.1; }
  function shake() { if (world.T - lastShake > 1.5) { lastShake = world.T; brain.onShake(); } }
  if (!NATIVE) window.addEventListener('devicemotion', (e) => {
    const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
    const o = (screen.orientation && screen.orientation.angle) || 0;
    let gx = -a.x, gy = a.y; // browsers report the reaction force
    if (o === 90) { const t = gx; gx = -gy; gy = t; } else if (o === 270 || o === -90) { const t = gx; gx = gy; gy = -t; }
    gravity(gx, gy);
    if (M.hypot(a.x, a.y, a.z) > 26) shake();
  });

  /* ---------------- what Android tells us */
  const native = (window.clawd = {
    touch(id, type, x, y) { if (type === 'down') gDown('n', id, x, y); else if (type === 'move') gMove('n', x, y); else gUp('n', x, y, type === 'cancel'); },
    gravity: gravity, shake: shake,
    app(kind, label) { brain.onApp(kind, label); },
    icons(json) { try { brain.onIcons(JSON.parse(json)); } catch (e) {} },
    keyboard(open, json) { let f = null; try { f = json ? JSON.parse(json) : null; } catch (e) {} if (f && open) world.kbTop = f.kbTop || null; else world.kbTop = null; brain.onKeyboard(open, f); },
    typing() { brain.onTypingActivity(); },
    screen(state, awayMs) { brain.onScreen(state, awayMs); },
    chat(open, json) { let r = null; try { r = json ? JSON.parse(json) : null; } catch (e) {} brain.onChatState(open, r); },
    chatReply(face, act, streaming) { brain.onChatReply(face, act, streaming); },
    settings(json) {
      try { CL.applySettings(JSON.parse(json)); } catch (e) { return; }
      CL.snd.on = CL.settings.sound; world.sizeMul = sizeMul[CL.settings.size] || 1; world.resize();
      const t = brain.tool; if (CL.settings.tools[CL.settings.tool] !== false && t.kind !== CL.settings.tool) { t.kind = CL.settings.tool; t.scale.v = 0.2; }
      if (!Object.keys(CL.TOOLS).some((k) => CL.settings.tools[k] !== false)) t.hidden = true; else if (!brain.confiscated) t.hidden = false;
      document.documentElement.style.setProperty('--fs', (CL.settings.font || 16) + 'px');
    },
    insets(t, b, l, r) { world.insets = { top: t, bottom: b, left: l || 0, right: r || 0 }; },
    ctx() { return JSON.stringify(brain.chatContext()); },
    setTool(kind) { brain.setTool(kind); },
    test(name) { if (name === 'ask') brain.askRandom(); else if (brain.startActivity && CL.R[name]) brain.startActivity(name); }
  });
  native.settings(JSON.stringify(CL.settings));
  if (!Object.keys(CL.TOOLS).some((k) => CL.settings.tools[k] !== false)) brain.tool.hidden = true;

  /* ---------------- loop */
  let last = performance.now(), running = true, skip = 0;
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = M.min(0.05, (now - last) / 1000); last = now;
    if (!opts.arena) { const r = cv.getBoundingClientRect(); if (Math.abs((r.width || 0) - world.W) > 1 || Math.abs((r.height || 0) - world.H) > 1) world.resize(); }
    // save battery: when tiny and calm, draw at half rate
    const calm = brain.c.scale.v < 0.5 && !brain.c.task && !world.fx.parts.length && !world.fx.texts.length && brain.tool.state === 'idle' && !G.size;
    if (calm && (skip++ & 1)) { world.T += dt; return; }
    brain.update(dt); world.update(dt); world.draw(); layout(); sendPads(now);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } });
  window.addEventListener('resize', () => { world.resize(); });
  requestAnimationFrame(frame);
  // report the real canvas size so the native side can confirm the stage is laid out
  (function awaitSize(n){ world.resize(); if ((world.W < 2 || world.H < 2) && n < 60) return setTimeout(function(){ awaitSize(n + 1); }, 50); call('ready', JSON.stringify({ w: world.W, h: world.H, dpr: world.DPR })); })(0);
  setTimeout(() => { if (!opts.quiet) { brain.say(brain.c, 'hello', { prio: 2, mood: 'happy' }); brain.c.play(CL.R.wave(brain, brain.c), 1); } }, opts.helloDelay || 700);
  brain.touch();

  /* ---------------- browser mock of a phone: home screen icons, keyboard, apps, tilt (for testing and the preview) */
  if (MOCK) setupMock(root, world, brain, native);
  return { world: world, brain: brain, ui: UI, native: native };
};

function setupMock(root, world, brain, native) {
  const bar = document.createElement('div'); bar.className = 'mock-bar';
  const btns = [['🏠 الرئيسية', () => { native.app('home', 'الشاشة الرئيسية'); }], ['⌨️ كتابة', toggleKb], ['💬 واتساب', () => native.app('chat', 'واتساب')], ['🎬 مقاطع', () => native.app('video', 'مقاطع')],
    ['↙️ ميل', () => tilt(-6.5, 7)], ['↘️ ميل', () => tilt(6.5, 7)], ['🙃 قلب', () => tilt(0, -9.8)], ['📱 عدّل', () => tilt(0, 9.8)], ['🛋 مسطّح', () => tilt(0.3, 1.2)],
    ['📳 هز', () => native.shake()], ['👋 رجوع', () => { native.screen('off'); setTimeout(() => native.screen('present', 20 * 60000), 300); }], ['❓ سؤال', () => brain.askRandom()],
    ['📿', () => brain.startActivity('tasbih')], ['📖', () => brain.startActivity('quran')], ['🥋', () => brain.startActivity('martial')], ['🤖', () => brain.startActivity('friend')], ['🧊 3D', () => brain.startActivity('stroll')], ['🤸', () => brain.c.play(CL.R.parkourShow(brain, brain.c), 2)]];
  btns.forEach((b) => { const e = document.createElement('button'); e.textContent = b[0]; e.onclick = (ev) => { ev.stopPropagation(); b[1](); }; bar.appendChild(e); });
  document.body.appendChild(bar);
  function tilt(x, y) { let k = 0; const fx = world.g.x, fy = world.g.y; const iv = setInterval(() => { k += 0.1; native.gravity(fx + (x - fx) * k, fy + (y - fy) * k); if (k >= 1) clearInterval(iv); }, 30); }
  // fake icons as platforms
  const grid = document.getElementById('mockIcons');
  function icons() {
    if (!grid) return;
    const rr = root.getBoundingClientRect();
    const rects = [].map.call(grid.querySelectorAll('i'), (e) => { const r = e.getBoundingClientRect(); return { x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height }; });
    native.icons(JSON.stringify(rects));
  }
  setTimeout(() => { icons(); native.app('home', 'الشاشة الرئيسية'); }, 300);
  window.addEventListener('resize', icons);
  // fake keyboard
  let kb = null;
  function toggleKb() {
    if (kb) { kb.remove(); kb = null; native.keyboard(false); return; }
    kb = document.createElement('div'); kb.className = 'mock-kb';
    kb.innerHTML = '<input class="mock-input" placeholder="اكتب رسالة…" dir="auto"><div class="mock-keys"></div>';
    document.body.appendChild(kb);
    const inp = kb.querySelector('input'); inp.focus();
    const report = () => { const r = inp.getBoundingClientRect(), k = kb.querySelector('.mock-keys').getBoundingClientRect(); native.keyboard(true, JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height, kbTop: k.top })); };
    setTimeout(report, 50);
    inp.addEventListener('input', () => native.typing());
  }
}
})();
