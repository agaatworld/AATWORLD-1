/* Floating chat window. Android sends the message to Claude and streams the answer back through window.chat.* */
(function () {
'use strict';
const NATIVE = typeof window.A !== 'undefined';
const Q = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const call = (fn, ...a) => { if (NATIVE && A[fn]) { try { return A[fn](...a); } catch (e) { console.error(e); } } return undefined; };
const msgs = $('msgs'), inp = $('inp'), send = $('send');
let botName = 'كلود';
try { const st = JSON.parse(call('getSettings') || '{}'); if (st.botName) botName = st.botName; } catch (e) {}
$('who').firstChild.textContent = botName; inp.placeholder = 'اكتب لـ' + botName + '…';
let cur = null, curText = '', busy = false;

// Clawd at the top of the chat: his face follows [[face:X]] and [[say:...]] shows his short reaction
const hero = (function () {
  if (!window.CL || !CL.World) return { face() {}, say() {}, think() {}, idle() {} };
  const cv = $('cl'), w = new CL.World(cv, { arena: true }), b = new CL.Bot(w);
  w.insets = { top: 0, bottom: 4, left: 0, right: 0 }; w.bots.push(b);
  const place = () => { w.resize(); w.insets = { top: 0, bottom: 4, left: 0, right: 0 }; b.x = w.W * 0.55; b.y = w.bounds.y1; b.ground = { e: 'b' }; };
  place(); window.addEventListener('resize', place);
  let last = performance.now(), hideAt = 0, thinking = false;
  (function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (thinking && Math.random() < dt * 2) b.look.tx = Math.random() < 0.5 ? -0.8 : 0.8;
    w.update(dt); w.draw();
    if (hideAt && now > hideAt) { $('say').classList.remove('on'); hideAt = 0; }
    requestAnimationFrame(frame);
  })(last);
  const jump = () => { if (b.ground) { b.vy = -38 * b.u; b.ground = null; } };
  return {
    face(f) { if (f) { b.setFace(f, 8); thinking = false; b.look.tx = 0; if (f === 'joy' || f === 'laugh' || f === 'surprised' || f === 'love') jump(); } },
    say(t) { const s = $('say'); s.textContent = t; s.classList.add('on'); hideAt = performance.now() + Math.max(4000, t.length * 120); },
    think() { thinking = true; b.setFace('think', 30); },
    idle() { thinking = false; b.look.tx = 0; }
  };
})();
let sawFace = false, sawSay = false;
function watchTags(t) {
  if (!sawFace) { const m = t.match(/\[\[face:([a-zA-Z]+)\]\]/); if (m) { sawFace = true; hero.face(m[1]); } }
  if (!sawSay) { const m = t.match(/\[\[say:([^\]]+)\]\]/); if (m) { sawSay = true; hero.say(m[1].trim()); } }
}

const clean = (t) => t.replace(/\[\[[a-z]+:[^\]]*\]\]\s*/gi, '').replace(/\[\[[^\]]*$/, '');
function add(role, text) {
  const d = document.createElement('div'); d.className = 'm ' + role; d.textContent = text; msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight; return d;
}
// his messages: verses ﴿…﴾ shown in the Quran font
const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function fill(el, text) { el.innerHTML = esc(text).replace(/﴿[^﴾]*﴾?/g, (v) => '<span class="q">' + v + '</span>'); }
function typing() { cur = add('a', ''); cur.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; curText = ''; }
function setBusy(b) { busy = b; send.disabled = b; }
function doSend() {
  const t = inp.value.trim(); if (!t || busy) return;
  inp.value = ''; autosize(); add('u', t); typing(); setBusy(true); sawFace = sawSay = false; hero.think();
  if (NATIVE) call('chatSend', t); else mockReply(t);
}
send.onclick = doSend;
inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
function autosize() { inp.style.height = 'auto'; inp.style.height = Math.min(110, inp.scrollHeight) + 'px'; }
inp.addEventListener('input', autosize);
$('bClose').onclick = () => { if (NATIVE) call('chatClose'); else parent.postMessage({ clawd: 'chatClose' }, '*'); };
$('bMin').onclick = () => { if (NATIVE) call('chatMin'); else parent.postMessage({ clawd: 'chatClose' }, '*'); };
$('bBig').onclick = () => call('chatBig');

window.chat = {
  delta(t) { if (!cur) typing(); curText += t; watchTags(curText); fill(cur, clean(curText)); msgs.scrollTop = msgs.scrollHeight; },
  done(full, note) { if (!cur) typing(); watchTags(full || curText); if (!sawFace) hero.face('happy'); hero.idle(); fill(cur, clean(full || curText) || '…'); if (note) add('sys', note); cur = null; setBusy(false); },
  error(msg) { if (cur && !curText) cur.remove(); cur = null; add('err', msg); setBusy(false); hero.face('embarrassed'); },
  seed(text) { if (text) { inp.value = text; autosize(); } setTimeout(() => inp.focus(), 150); },
  history(json) { msgs.innerHTML = ''; let h = []; try { h = JSON.parse(json) || []; } catch (e) {} h.forEach((m) => { const d = add(m.r === 'u' ? 'u' : 'a', clean(m.t)); if (m.r !== 'u') fill(d, clean(m.t)); });
    if (!h.length) add('sys', 'أهلين! أنا ' + botName + ' 😊 احكيلي شو بدك، وإذا ضربتني بالعصا رح أعرف 😄');
    hero.face('joy'); hero.say(h.length ? 'رجعت؟ 😊' : 'أهلين! 👋'); },
  font(px) { document.documentElement.style.setProperty('--fs', px + 'px'); }
};
// report the header as the drag handle
function zone() { const r = $('head').getBoundingClientRect(); call('setDragZone', r.left, r.top, r.right - 130, r.bottom); }
window.addEventListener('resize', zone);
setTimeout(zone, 100);

if (NATIVE) { window.chat.history(call('chatHistory') || '[]'); const f = +call('fontSize'); if (f) window.chat.font(f + 1); call('chatReady'); }
else window.chat.history('[]');
if (Q.get('seed')) window.chat.seed(Q.get('seed'));

/* browser preview only: a pretend answer, no internet */
function mockReply(t) {
  const txt = '[[face:joy]][[say:سمعتك يا غالي! 😄]][[act:wave]](وضع تجربة بدون إنترنت) سمعتك! على التلفون رح يرد عليك الذكاء الحقيقي (Gemini المجاني أو Claude) بعد ما تحط المفتاح بالإعدادات 😊';
  let i = 0; const iv = setInterval(() => { window.chat.delta(txt.slice(i, i + 4)); i += 4; if (i >= txt.length) { clearInterval(iv); window.chat.done(txt); try { parent.postMessage({ clawd: 'reply', face: 'joy', act: 'wave' }, '*'); } catch (e) {} } }, 40);
}
})();
