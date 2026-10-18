/* Floating chat window. Android sends the message to Claude and streams the answer back through window.chat.* */
(function () {
'use strict';
const NATIVE = typeof window.A !== 'undefined';
const Q = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const call = (fn, ...a) => { if (NATIVE && A[fn]) { try { return A[fn](...a); } catch (e) { console.error(e); } } return undefined; };
const msgs = $('msgs'), inp = $('inp'), send = $('send');
let cur = null, curText = '', busy = false;

// small Clawd face in the header
(function () { const c = $('av').getContext('2d'), s = 4; c.fillStyle = '#fff'; c.fillRect(2 * s, 0, 11 * s, 8 * s); c.fillRect(0, 3 * s, 15 * s, 3 * s);
  c.fillStyle = '#D97757'; c.fillRect(3 * s, 1 * s, 9 * s, 6 * s); c.fillRect(1 * s, 3.5 * s, 13 * s, 2 * s); c.fillStyle = '#141413'; c.fillRect(4.5 * s, 2.5 * s, 1.5 * s, 1.5 * s); c.fillRect(9 * s, 2.5 * s, 1.5 * s, 1.5 * s); })();

const clean = (t) => t.replace(/\[\[[a-z]+:[^\]]*\]\]\s*/gi, '');
function add(role, text) {
  const d = document.createElement('div'); d.className = 'm ' + role; d.textContent = text; msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight; return d;
}
function typing() { cur = add('a', ''); cur.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; curText = ''; }
function setBusy(b) { busy = b; send.disabled = b; }
function doSend() {
  const t = inp.value.trim(); if (!t || busy) return;
  inp.value = ''; autosize(); add('u', t); typing(); setBusy(true);
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
  delta(t) { if (!cur) typing(); curText += t; cur.textContent = clean(curText); msgs.scrollTop = msgs.scrollHeight; },
  done(full, note) { if (!cur) typing(); cur.textContent = clean(full || curText) || '…'; if (note) add('sys', note); cur = null; setBusy(false); },
  error(msg) { if (cur && !curText) cur.remove(); cur = null; add('err', msg); setBusy(false); },
  seed(text) { if (text) { inp.value = text; autosize(); } setTimeout(() => inp.focus(), 150); },
  history(json) { msgs.innerHTML = ''; let h = []; try { h = JSON.parse(json) || []; } catch (e) {} h.forEach((m) => add(m.r === 'u' ? 'u' : 'a', clean(m.t)));
    if (!h.length) add('sys', 'أهلين! أنا كلود 😊 احكيلي شو بدك، وإذا ضربتني بالعصا رح أعرف 😄'); },
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
  const txt = '[[face:joy]][[act:wave]](وضع تجربة بدون إنترنت) سمعتك! على التلفون رح يرد عليك Claude الحقيقي بعد ما تحط المفتاح بالإعدادات 😊';
  let i = 0; const iv = setInterval(() => { window.chat.delta(txt.slice(i, i + 4)); i += 4; if (i >= txt.length) { clearInterval(iv); window.chat.done(txt); try { parent.postMessage({ clawd: 'reply', face: 'joy', act: 'wave' }, '*'); } catch (e) {} } }, 40);
}
})();
