'use strict';
/* Talk (تكلّم) — push-to-talk walkie-talkie PWA. Pairing by QR, direct phone-to-phone (WebRTC data channels),
   no server. Audio = 16 kHz mu-law frames over an unreliable data channel. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LS = {
  get(k, d) { try { const v = localStorage.getItem('aat.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('aat.' + k, JSON.stringify(v)); } catch {} }
};
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join('');

/* ---------------- text ---------------- */
const TX = {
ar: {
  welcomeTitle: 'أهلاً بك 👋', welcomeSub: 'اكتب اسمك ليظهر لأصحابك على شاشتهم', namePh: 'اكتب اسمك هنا', start: 'ابدأ',
  hi: 'أهلاً', add: 'إضافة صديق', settings: 'الإعدادات',
  idle: 'جاهز — لا أحد يتكلم الآن', speaking: 'يتكلم الآن', speakingGrp: 'يتكلم مع الجميع',
  selAll: 'الكل', selNone: 'لا أحد', selected: 'المحدد', online: 'متصل', offline: 'غير متصل — اضغط للربط',
  emptyT: 'لا يوجد أصدقاء بعد', emptyS: 'اضغط ＋ واربط تليفون صديقك بالكيو آر. بعدها تتكلمان مثل اللاسلكي.', addFriend: 'إضافة صديق',
  alert: 'تنبيه', holdTalk: 'اضغط باستمرار وتكلّم', tapTalk: 'اضغط مرة للكلام', tapStop: 'اضغط للإيقاف', talking: 'جارٍ الكلام…',
  talkTo: 'تتكلم مع', talkToNone: 'اختر شخصاً من القائمة', noTarget: 'اختر شخصاً متصلاً أولاً', micErr: 'لم أستطع تشغيل الميكروفون — اسمح به من إعدادات المتصفح',
  pairIntro: 'اربط تليفونين: شخص يعرض الكود والآخر يمسحه. تتم العملية مرتين ثم يتصلان.',
  pHost: 'أنا أعرض الكود', pJoin: 'أنا أمسح كود صديقي', pairNet: 'يجب أن يكون التليفونان على نفس الواي فاي (أو فعّل «شبكات مختلفة» من الإعدادات).',
  hostStep1: 'اطلب من صديقك أن يضغط «أنا أمسح» ويمسح هذا الكود', hostStep2: 'ثم امسح الكود الذي سيظهر عنده',
  making: 'جارٍ التجهيز…', copyCode: 'نسخ الكود', shareCode: 'مشاركة', scanReply: 'مسح رد صديقي', pasteInstead: 'أو الصق الكود يدوياً', connect: 'اتصال',
  scanOffer: 'وجّه الكاميرا نحو الكود على تليفون صديقك', scanAnswer: 'وجّه الكاميرا نحو الكود الظاهر عند صديقك',
  ansStep: 'تم! اعرض هذا الكود لصديقك ليمسحه', waitingOther: 'بانتظار صديقك ليمسح الكود…', done: 'تم',
  paired: 'تم الربط مع', badCode: 'الكود غير صحيح أو انتهى. ابدأ من جديد.', camErr: 'تعذّر تشغيل الكاميرا — استخدم «الصق الكود يدوياً».', copied: 'تم النسخ ✓',
  yourName: 'اسمك', language: 'اللغة', optVib: 'هزاز عندما يتكلم أحد', optBoss: 'وضع المدير: مجموعات وملاحظات وتنبيهات', optToggle: 'اضغط مرة للبدء ومرة للإيقاف (بدون إمساك)',
  optSchedNotif: 'عرض الجدول كإشعار على شاشة القفل', optWake: 'إبقاء الشاشة مضاءة (يستهلك بطارية أكثر)', optStun: 'شبكات مختلفة / إنترنت (يزيد حجم الكود)',
  iosHint: 'لوضع أيقونة على الشاشة الرئيسية: في آيفون اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية». في أندرويد: قائمة المتصفح ثم «تثبيت التطبيق».', batteryNote: 'التطبيق لا يستهلك شيئاً تقريباً وهو ساكن: لا يعمل الميكروفون إلا أثناء الكلام، ولا توجد عمليات تتكرر في الخلفية.',
  testVib: 'تجربة الهزاز', vibYes: 'هذا الجهاز يدعم الهزاز ✓', vibNo: 'هذا الجهاز (آيفون/سفاري) لا يسمح للمواقع بالهزاز — سيظهر وميض ونغمة بدلاً منه.',
  isBoss: 'هذا هو الرئيس (يقبل تنبيهاته)', reconnect: 'إعادة الربط', remove: 'حذف', close: 'إغلاق',
  alertT: 'إرسال تنبيه', alertDur: 'مدة الهزاز والصوت', sec: 'ثانية', untilAck: 'حتى يؤكدوا', alertTo: 'إلى', toAll: 'كل المتصلين', toSel: 'المحددين فقط',
  alertMsgPh: 'رسالة قصيرة (اختياري)', alertSend: 'إرسال التنبيه الآن', alertCancel: 'إيقاف التنبيه', sentTo: 'أُرسل إلى', confirmed: 'أكّد',
  alertFrom: 'تنبيه من', gotIt: 'تم الاستلام ✓', secsLeft: 'ثانية متبقية', alertIgnored: 'تنبيه من شخص ليس رئيساً عندك', nobodyOnline: 'لا يوجد أحد متصل',
  unnamed: 'بدون اسم', you: 'أنت', members: 'أشخاص',
  msgPh: 'اكتب رسالة…', noMsgs: 'لا توجد رسائل بعد — اكتب أول رسالة', toSelected: 'رسالة للمحددين', sentOk: 'تم الإرسال ✓', pendingMsg: 'ستصل عندما يتصل', pickFirst: 'اختر أشخاصاً أولاً',
  schedT: 'الجدول', addRow: '＋ إضافة بند', resetSched: 'استرجاع الجدول الأصلي', todayLbl: 'اليوم', noSched: 'تعذّر تحميل الجدول', confirmReset: 'استرجاع الجدول الأصلي؟ ستضيع تعديلاتك.',
  groupsT: 'المجموعات', groupHow: 'اختر الأشخاص من القائمة ثم اكتب اسماً واحفظهم كمجموعة. بعدها بضغطة واحدة تختارهم كلهم.', gNamePh: 'اسم المجموعة (مثال: المبيعات)', saveGroup: 'حفظ المحدد كمجموعة', notePh: 'ملاحظة عن الشخص (مثال: محاسب، مندوب)', tagsT: 'المجموعات', newGroup: 'مجموعة', deleteG: 'حذف', noSel: 'اختر أشخاصاً من القائمة أولاً'
},
en: {
  welcomeTitle: 'Welcome 👋', welcomeSub: 'Type your name so your friends see it on their screen', namePh: 'Type your name', start: 'Start',
  hi: 'Hello', add: 'Add friend', settings: 'Settings',
  idle: 'Ready — nobody is talking', speaking: 'is talking', speakingGrp: 'is talking to everyone',
  selAll: 'All', selNone: 'None', selected: 'Selected', online: 'Online', offline: 'Offline — tap to link',
  emptyT: 'No friends yet', emptyS: 'Tap ＋ and link a friend’s phone with a QR code. Then talk like a walkie-talkie.', addFriend: 'Add friend',
  alert: 'Alert', holdTalk: 'Hold to talk', tapTalk: 'Tap to talk', tapStop: 'Tap to stop', talking: 'Talking…',
  talkTo: 'Talking to', talkToNone: 'Select someone from the list', noTarget: 'Select a connected person first', micErr: 'Could not start the microphone — allow it in browser settings',
  pairIntro: 'Link two phones: one shows the code, the other scans it. Done twice, then they connect.',
  pHost: 'I show the code', pJoin: 'I scan my friend’s code', pairNet: 'Both phones must be on the same Wi-Fi (or turn on “Different networks” in Settings).',
  hostStep1: 'Ask your friend to tap “I scan” and scan this code', hostStep2: 'Then scan the code shown on their phone',
  making: 'Preparing…', copyCode: 'Copy code', shareCode: 'Share', scanReply: 'Scan friend’s reply', pasteInstead: 'Or paste the code manually', connect: 'Connect',
  scanOffer: 'Point the camera at the code on your friend’s phone', scanAnswer: 'Point the camera at the code on your friend’s screen',
  ansStep: 'Done! Show this code to your friend to scan', waitingOther: 'Waiting for your friend to scan…', done: 'Done',
  paired: 'Linked with', badCode: 'Invalid or expired code. Start again.', camErr: 'Camera unavailable — use “paste the code manually”.', copied: 'Copied ✓',
  yourName: 'Your name', language: 'Language', optVib: 'Vibrate when someone talks', optBoss: 'Manager mode: groups, notes and alerts', optToggle: 'Tap once to start, again to stop (no holding)',
  optSchedNotif: 'Show schedule as a lock-screen notification', optWake: 'Keep screen on (uses more battery)', optStun: 'Different networks / internet (bigger code)',
  iosHint: 'To put an icon on your home screen: iPhone — tap Share, then “Add to Home Screen”. Android — browser menu, then “Install app”.', batteryNote: 'Idle cost is near zero: the microphone runs only while you talk and nothing repeats in the background.',
  testVib: 'Test vibration', vibYes: 'This device supports vibration ✓', vibNo: 'This device (iPhone/Safari) does not let websites vibrate — a flash and tone are used instead.',
  isBoss: 'This is the boss (accept their alerts)', reconnect: 'Reconnect', remove: 'Remove', close: 'Close',
  alertT: 'Send alert', alertDur: 'Vibration & sound length', sec: 'sec', untilAck: 'Until confirmed', alertTo: 'To', toAll: 'Everyone online', toSel: 'Selected only',
  alertMsgPh: 'Short message (optional)', alertSend: 'Send alert now', alertCancel: 'Stop alert', sentTo: 'Sent to', confirmed: 'confirmed',
  alertFrom: 'Alert from', gotIt: 'Got it ✓', secsLeft: 'sec left', alertIgnored: 'Alert from someone who is not your boss', nobodyOnline: 'Nobody is online',
  unnamed: 'No name', you: 'You', members: 'people',
  msgPh: 'Type a message…', noMsgs: 'No messages yet — write the first one', toSelected: 'Message to selected', sentOk: 'Sent ✓', pendingMsg: 'Will arrive when online', pickFirst: 'Select people first',
  schedT: 'Schedule', addRow: '＋ Add item', resetSched: 'Restore original schedule', todayLbl: 'Today', noSched: 'Could not load the schedule', confirmReset: 'Restore the original schedule? Your edits will be lost.',
  groupsT: 'Groups', groupHow: 'Select people in the list, type a name and save them as a group. Then pick them all with one tap.', gNamePh: 'Group name (e.g. Sales)', saveGroup: 'Save selected as group', notePh: 'Note about this person (e.g. accountant)', tagsT: 'Groups', newGroup: 'Group', deleteG: 'Delete', noSel: 'Select people in the list first'
}};
const tt = k => (TX[S.lang] && TX[S.lang][k]) || TX.en[k] || k;

/* ---------------- state ---------------- */
const S = {
  me: LS.get('me', null),
  contacts: LS.get('contacts', {}),
  sel: new Set(LS.get('sel', [])),
  set: Object.assign({ vib: true, wake: false, toggle: false, stun: false }, LS.get('set', {})),
  groups: LS.get('groups', []),
  lang: LS.get('lang', 'ar')
};
const peers = [];
const speakers = {};            // id -> {name, grp, t}
const stats = { audioIn: 0, audioOut: 0, maxRms: 0, vibCalls: 0, timers: 0 };
window.__aat = { S, peers, stats, speakers };
const persist = () => { LS.set('me', S.me); LS.set('contacts', S.contacts); LS.set('sel', [...S.sel]); LS.set('set', S.set); LS.set('lang', S.lang); LS.set('groups', S.groups); };

/* ---------------- helpers ---------------- */
const show = id => { ['welcome', 'home', 'pair', 'settings', 'chat', 'sched'].forEach(s => $('#' + s).classList.toggle('hidden', s !== id)); };
let toastT;
function toast(msg) { const e = $('#toast'); e.textContent = msg; e.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.add('hidden'), 2600); }
const canVib = () => !!window.AATNative || typeof navigator.vibrate === 'function';
function vib(p) {
  if (!canVib()) return false;
  try {
    stats.vibCalls++;
    if (window.AATNative) { if (p === 0 || (Array.isArray(p) && !p.length)) { AATNative.cancelVibrate(); return true; } AATNative.vibrate([].concat(p).map(x => Math.round(x)).join(','), -1); return true; }
    return navigator.vibrate(p);
  } catch { return false; }
}
const initial = n => ([...(n || '?').trim()][0] || '?').toUpperCase();
const color = id => 'c' + (parseInt((id || '0').slice(0, 4), 16) % 5);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function applyLang() {
  document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i]').forEach(e => e.textContent = tt(e.dataset.i));
  $$('[data-ph]').forEach(e => e.placeholder = tt(e.dataset.ph));
  $$('[data-aria]').forEach(e => e.setAttribute('aria-label', tt(e.dataset.aria)));
  $$('[data-lang]').forEach(e => e.classList.toggle('on', e.dataset.lang === S.lang));
  $('#pairBack').textContent = S.lang === 'ar' ? '→' : '←'; $('#setBack').textContent = S.lang === 'ar' ? '→' : '←';
  renderAll();
}

/* ---------------- peers ---------------- */
const openPeer = id => peers.find(p => p.id === id && p.open);
function sendCtl(p, m) { try { if (p.ctl.readyState === 'open') p.ctl.send(JSON.stringify(m)); } catch {} }
let pairWait = null;
function mkPeer() {
  const pc = new RTCPeerConnection({ iceServers: S.set.stun ? [{ urls: 'stun:stun.l.google.com:19302' }] : [] });
  const ctl = pc.createDataChannel('c', { negotiated: true, id: 0 });
  const aud = pc.createDataChannel('a', { negotiated: true, id: 1, ordered: false, maxRetransmits: 0 });
  aud.binaryType = 'arraybuffer';
  const p = { pc, ctl, aud, id: null, name: '', open: false };
  peers.push(p);
  ctl.onopen = () => { p.open = !!p.id; sendCtl(p, { k: 'hello', id: S.me.id, name: S.me.name, boss: !!S.me.boss }); };
  ctl.onclose = () => dropPeer(p);
  ctl.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch { return; } onMsg(p, m); };
  aud.onmessage = e => onAudio(p, e.data);
  pc.onconnectionstatechange = () => {
    const s = pc.connectionState;
    if (s === 'failed' || s === 'closed') dropPeer(p);
    else if (s === 'disconnected') { p.open = false; renderList(); }
    else if (s === 'connected' && p.id) { p.open = ctl.readyState === 'open'; renderList(); }
  };
  return p;
}
function dropPeer(p) {
  const i = peers.indexOf(p); if (i >= 0) peers.splice(i, 1);
  p.open = false; if (p.id) clearSpeaker(p.id);
  try { p.pc.close(); } catch {}
  renderAll();
}

function onMsg(p, m) {
  switch (m.k) {
    case 'hello': {
      if (!m.id || m.id === S.me.id) return;
      peers.filter(q => q !== p && q.id === m.id).forEach(q => { q.ctl.onclose = null; dropPeerQuiet(q); });
      p.id = m.id; p.name = String(m.name || '').slice(0, 24); p.open = p.ctl.readyState === 'open';
      const old = S.contacts[m.id];
      S.contacts[m.id] = Object.assign({ tags: [], note: '' }, old || {}, { id: m.id, name: p.name, boss: old ? old.boss : !!m.boss });
      persist(); renderAll();
      flushPending(p.id);
      if (pairWait && pairWait.p === p) { pairWait.done(p); }
      break;
    }
    case 'name': if (p.id && S.contacts[p.id]) { p.name = String(m.name || '').slice(0, 24); S.contacts[p.id].name = p.name; persist(); renderAll(); } break;
    case 'talk': if (!p.id) return; if (m.on) setSpeaker(p, !!m.grp); else clearSpeaker(p.id); break;
    case 'alert': onAlert(p, m); break;
    case 'alertoff': if (alertCur && alertCur.id === m.id) endAlert(true); break;
    case 'ack': onAck(p, m); break;
    case 'msg': onChatMsg(p, m); break;
    case 'msgack': onMsgAck(p, m); break;
  }
}
function dropPeerQuiet(q) { const i = peers.indexOf(q); if (i >= 0) peers.splice(i, 1); q.open = false; try { q.pc.close(); } catch {} }

/* ---------------- render ---------------- */
function renderAll() { if (!S.me) return; renderHeader(); renderGroups(); renderList(); renderBanner(); renderPTT(); }
function renderHeader() {
  if (!S.me) return;
  $('#meName').textContent = S.me.name; $('#meAv').textContent = initial(S.me.name);
  $('#btnAlert').classList.toggle('hidden', !S.me.boss);
}
function renderList() {
  const ul = $('#list'); if (!ul || !S.me) return;
  const arr = Object.values(S.contacts).sort((a, b) => (!!openPeer(b.id) - !!openPeer(a.id)) || a.name.localeCompare(b.name));
  $('#empty').classList.toggle('hidden', arr.length > 0);
  $('.listhead').classList.toggle('hidden', arr.length === 0);
  ul.classList.toggle('hidden', arr.length === 0);
  ul.innerHTML = arr.map(c => {
    const on = !!openPeer(c.id), sel = S.sel.has(c.id);
    return `<li class="card ${sel ? 'sel' : ''} ${on ? '' : 'off'} ${speakers[c.id] ? 'speak' : ''}" data-id="${c.id}">
      <span class="avatar ${color(c.id)}">${esc(initial(c.name))}</span>
      <div class="cinfo"><div class="cname">${esc(c.name || tt('unnamed'))}${c.boss ? '<span class="crown">👑</span>' : ''}</div>
      <div class="cstat ${on ? 'on' : ''}">${on ? '● ' + tt('online') : tt('offline')}${noteLine(c)}</div></div>
      <button class="msgbtn" data-chat="${c.id}" aria-label="chat">💬${(unread[c.id] || 0) ? '<span class="badge">' + unread[c.id] + '</span>' : ''}</button><span class="check">✓</span><button class="more" data-more="${c.id}" aria-label="menu">⋯</button></li>`;
  }).join('');
  $('#selCount').textContent = tt('selected') + ': ' + [...S.sel].filter(id => S.contacts[id]).length;
}
const gName = id => (S.groups.find(g => g.id === id) || {}).name;
function noteLine(c) {
  const tags = (c.tags || []).map(gName).filter(Boolean);
  const bits = [c.note ? esc(c.note) : '', tags.length ? tags.map(x => '#' + esc(x)).join(' ') : ''].filter(Boolean);
  return bits.length ? ' <span class="cnote">· ' + bits.join(' · ') + '</span>' : '';
}
const members = gid => Object.values(S.contacts).filter(c => (c.tags || []).includes(gid)).map(c => c.id);
function renderGroups() {
  const box = $('#groups'); if (!box || !S.me) return;
  box.classList.toggle('hidden', !S.me.boss);
  if (!S.me.boss) return;
  box.innerHTML = S.groups.map(g => {
    const ms = members(g.id), on = ms.filter(id => openPeer(id)).length, all = ms.length > 0 && ms.every(id => S.sel.has(id));
    return `<button class="chip g ${all ? 'on' : ''}" data-g="${g.id}">${esc(g.name)} <small>${on}/${ms.length}</small></button>`;
  }).join('') + `<button class="chip gnew" data-gnew="1">＋ ${tt('newGroup')}</button>`;
}
function toggleGroup(gid) {
  const ms = members(gid); if (!ms.length) { toast(tt('noSel')); return; }
  const all = ms.every(id => S.sel.has(id));
  ms.forEach(id => all ? S.sel.delete(id) : S.sel.add(id)); persist(); renderList(); renderGroups(); renderPTT();
}
function openGroups() {
  $('#gName').value = ''; renderGList(); $('#gSheet').classList.remove('hidden');
}
function renderGList() {
  $('#gList').innerHTML = S.groups.map(g => `<div class="row"><span>${esc(g.name)} <small class="cnote">(${members(g.id).length})</small></span><button class="chip" data-gdel="${g.id}">${tt('deleteG')}</button></div>`).join('');
}
function saveGroup() {
  const name = $('#gName').value.trim(); const sel = [...S.sel].filter(id => S.contacts[id]);
  if (!sel.length) { toast(tt('noSel')); return; } if (!name) { $('#gName').focus(); return; }
  let g = S.groups.find(x => x.name === name); if (!g) { g = { id: rid(), name }; S.groups.push(g); }
  sel.forEach(id => { const c = S.contacts[id]; c.tags = c.tags || []; if (!c.tags.includes(g.id)) c.tags.push(g.id); });
  persist(); $('#gName').value = ''; renderGList(); renderAll(); toast(tt('sentOk'));
}
function renderCTags() {
  const id = $('#cSheet').dataset.id, c = S.contacts[id]; if (!c) return;
  $('#cTags').innerHTML = S.groups.length ? S.groups.map(g => `<button class="chip ${(c.tags || []).includes(g.id) ? 'on' : ''}" data-t="${g.id}">${esc(g.name)}</button>`).join('') : '<span class="hint">—</span>';
}
function renderBanner() {
  const b = $('#banner'), ids = Object.keys(speakers);
  if (!ids.length) { b.className = 'banner idle'; $('#bannerTxt').textContent = tt('idle'); return; }
  b.className = 'banner hear';
  $('#bannerTxt').textContent = ids.map(id => speakers[id].name + ' ' + (speakers[id].grp ? tt('speakingGrp') : tt('speaking'))).join(' · ');
}
function targets() { return [...S.sel].filter(id => openPeer(id)); }
function renderPTT() {
  if (!S.me) return;
  const t = targets(), btn = $('#ptt');
  btn.classList.toggle('dis', t.length === 0 && !talking);
  btn.classList.toggle('live', talking);
  $('#pttIcon').textContent = talking ? '🔴' : '🎙️';
  $('#pttTxt').textContent = talking ? (S.set.toggle ? tt('tapStop') : tt('talking')) : (S.set.toggle ? tt('tapTalk') : tt('holdTalk'));
  const names = t.map(id => S.contacts[id].name);
  const gm = S.me.boss ? S.groups.find(g => { const ms = members(g.id); return ms.length > 1 && ms.length === t.length && ms.every(x => t.includes(x)); }) : null;
  $('#talkTo').innerHTML = names.length ? tt('talkTo') + ': <b>' + esc(gm ? gm.name + ' (' + t.length + ')' : names.length > 2 ? names.slice(0, 2).join('، ') + ' +' + (names.length - 2) : names.join(S.lang === 'ar' ? '، ' : ', ')) + '</b>' : tt('talkToNone');
}

/* ---------------- speaker (incoming) ---------------- */
let beepCtxOk = true;
function setSpeaker(p, grp) {
  const first = !speakers[p.id];
  speakers[p.id] = { name: p.name || (S.contacts[p.id] || {}).name || '?', grp, t: Date.now() };
  armSpeakerGC();
  if (first) {
    if (S.set.vib) { if (!vib([180, 60, 180])) blip(); }
    flashScreen();
  }
  renderBanner(); renderList();
}
function clearSpeaker(id) { if (speakers[id]) { delete speakers[id]; renderBanner(); renderList(); } if (!Object.keys(speakers).length) { clearInterval(gcT); gcT = 0; } }
let gcT = 0;
function armSpeakerGC() { if (gcT) return; gcT = setInterval(() => { const n = Date.now(); Object.keys(speakers).forEach(id => { if (n - speakers[id].t > 4000) clearSpeaker(id); }); }, 1000); }
function flashScreen() { const b = $('#banner'); b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 300 }); }

/* ---------------- audio ---------------- */
const MU = (() => { const t = new Float32Array(256); for (let i = 0; i < 256; i++) { let u = ~i & 0xFF; const s = u & 0x80, e = (u >> 4) & 7, m = u & 15; let v = (((m << 3) + 132) << e) - 132; t[i] = (s ? -v : v) / 32768; } return t; })();
function muEnc(x) { let s = x < 0 ? 0x80 : 0; let v = Math.min(32635, Math.abs(Math.round(x * 32768))) + 132; let e = 7; for (let m = 0x4000; (v & m) === 0 && e > 0; e--, m >>= 1); return ~(s | (e << 4) | ((v >> (e + 3)) & 15)) & 0xFF; }
let actx = null;
function ctx() { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; actx = new C({ latencyHint: 'interactive' }); } if (actx.state !== 'running') actx.resume().catch(() => {}); return actx; }
['pointerdown', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { try { ctx(); } catch {} }, { passive: true }));
function blip() { try { const c = ctx(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + .12); } catch {} }

/* playback */
const rx = {};
function onAudio(p, buf) {
  if (!p.id || talking) return;
  const u = new Uint8Array(buf); if (u.length < 4 || u[0] !== 1) return;
  if (!speakers[p.id]) setSpeaker(p, true);
  speakers[p.id].t = Date.now();
  const n = u.length - 3, f = new Float32Array(n); let e = 0;
  for (let i = 0; i < n; i++) { const v = MU[u[i + 3]]; f[i] = v; e += v * v; }
  stats.audioIn++; const rms = Math.sqrt(e / n); if (rms > stats.maxRms) stats.maxRms = rms;
  const c = ctx(), ab = c.createBuffer(1, n, 16000); ab.copyToChannel(f, 0);
  const s = c.createBufferSource(); s.buffer = ab; s.connect(c.destination);
  const st = rx[p.id] || (rx[p.id] = { next: 0 });
  const now = c.currentTime;
  if (st.next < now + 0.02) st.next = now + 0.12;      // jitter buffer
  if (st.next - now > 1.2) st.next = now + 0.12;        // too far behind: resync
  s.start(st.next); st.next += n / 16000;
}

/* capture */
let talking = false, micStream = null, micNodes = null, micIdleT = 0, seq = 0, pressing = false, pendingStart = false, talkTargets = [];
async function getMic() {
  clearTimeout(micIdleT);
  if (micStream && micStream.getTracks().some(t => t.readyState === 'live')) return;
  micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const c = ctx();
  const src = c.createMediaStreamSource(micStream), proc = c.createScriptProcessor(2048, 1, 1), mute = c.createGain();
  mute.gain.value = 0; src.connect(proc); proc.connect(mute); mute.connect(c.destination);
  proc.onaudioprocess = ev => { if (talking) pushFrame(ev.inputBuffer.getChannelData(0), c.sampleRate); };
  micNodes = { src, proc, mute };
}
function releaseMic() {
  if (talking) return;
  try { micNodes && (micNodes.proc.onaudioprocess = null, micNodes.src.disconnect(), micNodes.proc.disconnect(), micNodes.mute.disconnect()); } catch {}
  micNodes = null;
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
}
function pushFrame(inp, sr) {
  const ratio = sr / 16000, n = Math.floor(inp.length / ratio), out = new Uint8Array(3 + n);
  out[0] = 1; out[1] = (seq >> 8) & 255; out[2] = seq & 255; seq = (seq + 1) & 0xFFFF;
  for (let i = 0; i < n; i++) { const a = Math.floor(i * ratio), b = Math.max(a + 1, Math.floor((i + 1) * ratio)); let s = 0; for (let j = a; j < b; j++) s += inp[j]; out[3 + i] = muEnc(Math.max(-1, Math.min(1, s / (b - a)))); }
  for (const id of talkTargets) { const p = openPeer(id); if (p && p.aud.readyState === 'open' && p.aud.bufferedAmount < 65536) { try { p.aud.send(out); stats.audioOut++; } catch {} } }
}
async function startTalk() {
  if (talking || pendingStart) return;
  const t = targets();
  if (!t.length) { toast(tt('noTarget')); vib(80); return; }
  pendingStart = true; pressing = true;
  try { await getMic(); } catch (e) { pendingStart = false; pressing = false; toast(tt('micErr')); return; }
  pendingStart = false;
  if (!pressing) { micIdleT = setTimeout(releaseMic, 8000); return; }  // released before mic was ready
  talkTargets = t; talking = true; seq = 0;
  t.forEach(id => { const p = openPeer(id); if (p) sendCtl(p, { k: 'talk', on: 1, grp: t.length > 1 }); });
  vib(40); renderPTT();
}
function stopTalk() {
  pressing = false;
  if (!talking) return;
  talking = false;
  talkTargets.forEach(id => { const p = openPeer(id); if (p) sendCtl(p, { k: 'talk', on: 0 }); });
  talkTargets = []; renderPTT();
  clearTimeout(micIdleT); micIdleT = setTimeout(releaseMic, 8000);   // keep mic warm 8 s for quick replies, then free it (battery)
}

/* ---------------- alerts ---------------- */
let alertCur = null, alertOut = null;
function onAlert(p, m) {
  const c = S.contacts[p.id];
  if (!c || !c.boss) { toast(tt('alertIgnored') + ': ' + (c ? c.name : '?')); return; }
  if (alertCur) endAlert(true);
  const secs = Math.max(0, Math.min(600, +m.secs || 0));
  alertCur = { id: m.id, from: p, secs, start: Date.now(), vibT: 0, sirenT: 0, tickT: 0, osc: null, active: true };
  $('#alFrom').textContent = tt('alertFrom') + ' ' + c.name;
  $('#alMsg').textContent = m.msg || '';
  $('#alertOv').classList.remove('hidden');
  const a = alertCur;
  const pulse = () => { if (!vib([900, 150, 900, 150])) { /* no vibration API (iOS) → rely on siren + flash */ } };
  pulse(); a.vibT = setInterval(pulse, 2000);
  try { const c2 = ctx(); a.osc = c2.createOscillator(); a.g = c2.createGain(); a.g.gain.value = .35; a.osc.type = 'square'; a.osc.connect(a.g); a.g.connect(c2.destination); a.osc.start(); let f = 0; a.sirenT = setInterval(() => { try { a.osc.frequency.value = (f++ % 2) ? 1100 : 760; } catch {} }, 380); } catch {}
  const tick = () => {
    const left = secs ? Math.max(0, secs - Math.round((Date.now() - a.start) / 1000)) : null;
    $('#alTimer').textContent = secs ? left + ' ' + tt('secsLeft') : '';
    if (secs && left <= 0) stopEffects(a);
  };
  tick(); a.tickT = setInterval(tick, 500);
  stats.alertShown = (stats.alertShown || 0) + 1;
}
function stopEffects(a) {
  if (!a || !a.active) return; a.active = false;
  clearInterval(a.vibT); clearInterval(a.sirenT); clearInterval(a.tickT);
  try { a.osc && a.osc.stop(); } catch {} vib(0);
}
function endAlert(silent) {
  const a = alertCur; if (!a) return;
  stopEffects(a); alertCur = null;
  $('#alertOv').classList.add('hidden');
  if (!silent && a.from) sendCtl(a.from, { k: 'ack', id: a.id });
}
function onAck(p, m) {
  if (!alertOut || alertOut.id !== m.id) return;
  alertOut.acks.add(p.id); renderAlertStat();
}
function renderAlertStat() {
  const o = alertOut; if (!o) { $('#aStat').textContent = ''; return; }
  const names = [...o.acks].map(id => (S.contacts[id] || {}).name).filter(Boolean);
  $('#aStat').innerHTML = tt('sentTo') + ' ' + o.sent.length + ' — <span class="ok">' + names.length + ' ' + tt('confirmed') + (names.length ? ': ' + esc(names.join('، ')) : '') + '</span>';
  $('#aCancel').classList.toggle('hidden', false);
}
function sendAlert() {
  const secs = +$('#aDur .on').dataset.s, scope = $('#aTo .on').dataset.to, msg = $('#aMsg').value.trim();
  let ids = scope === 'all' ? peers.filter(p => p.open && p.id).map(p => p.id) : targets();
  ids = [...new Set(ids)];
  if (!ids.length) { toast(tt('nobodyOnline')); return; }
  const id = rid();
  alertOut = { id, sent: ids, acks: new Set() };
  ids.forEach(pid => { const p = openPeer(pid); if (p) sendCtl(p, { k: 'alert', id, secs, msg }); });
  vib(60); renderAlertStat();
}
function cancelAlert() { if (!alertOut) return; alertOut.sent.forEach(pid => { const p = openPeer(pid); if (p) sendCtl(p, { k: 'alertoff', id: alertOut.id }); }); alertOut = null; renderAlertStat(); $('#aCancel').classList.add('hidden'); }

/* ---------------- text messages (stored only on the phones, sent directly) ---------------- */
const threads = {}, unread = LS.get('unread', {});
const getT = id => threads[id] || (threads[id] = LS.get('chat.' + id, []));
const saveT = id => { const t = getT(id); if (t.length > 300) t.splice(0, t.length - 300); LS.set('chat.' + id, t); };
const saveUnread = () => LS.set('unread', unread);
let chatId = null;
window.__aat.getT = getT; window.__aat.unread = unread;
function openChat(id) {
  chatId = id; if (id !== '*') { unread[id] = 0; saveUnread(); }
  const sel = [...S.sel].filter(x => S.contacts[x]);
  $('#chatTitle').textContent = id === '*' ? tt('toSelected') + ' (' + sel.length + ')' : (S.contacts[id] || {}).name || '';
  show('chat'); renderChat(); renderList(); setTimeout(() => $('#chatIn').focus(), 50);
}
function renderChat() {
  const box = $('#chatList'); if (!box || chatId == null || $('#chat').classList.contains('hidden')) return;
  if (chatId === '*') { box.innerHTML = '<div class="chatempty">' + esc(tt('toSelected')) + '</div>'; return; }
  const t = getT(chatId);
  box.innerHTML = t.length ? t.map(m => '<div class="bub ' + (m.me ? 'me' : 'them') + '">' + esc(m.x) + '<small>' + new Date(m.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + (m.me ? ' ' + (m.s === 'd' ? '✓✓' : m.s === 's' ? '✓' : '⏳') : '') + '</small></div>').join('') : '<div class="chatempty">' + esc(tt('noMsgs')) + '</div>';
  box.scrollTop = box.scrollHeight;
}
function sendMsg(ids, text) {
  text = String(text || '').trim().slice(0, 1000); if (!text) return false;
  ids.forEach(id => {
    const m = { i: rid(), me: 1, t: Date.now(), x: text, s: 'p' };
    getT(id).push(m);
    const p = openPeer(id); if (p) { sendCtl(p, { k: 'msg', id: m.i, t: m.t, x: text }); m.s = 's'; }
    saveT(id);
  });
  renderChat(); return true;
}
function flushPending(id) {
  const p = openPeer(id); if (!p) return; let n = 0;
  getT(id).forEach(m => { if (m.me && m.s === 'p') { sendCtl(p, { k: 'msg', id: m.i, t: m.t, x: m.x }); m.s = 's'; n++; } });
  if (n) { saveT(id); renderChat(); }
}
function onChatMsg(p, m) {
  if (!p.id) return;
  const t = getT(p.id), mid = String(m.id || '');
  if (!t.some(x => x.i === mid)) {
    t.push({ i: mid, me: 0, t: +m.t || Date.now(), x: String(m.x || '').slice(0, 1000) }); saveT(p.id);
    const viewing = chatId === p.id && !$('#chat').classList.contains('hidden');
    if (!viewing) { unread[p.id] = (unread[p.id] || 0) + 1; saveUnread(); toast('💬 ' + p.name + ': ' + String(m.x).slice(0, 60)); }
    if (S.set.vib) { if (!vib([120, 60, 120])) blip(); }
    renderList(); renderChat();
  }
  sendCtl(p, { k: 'msgack', id: mid });
}
function onMsgAck(p, m) { if (!p.id) return; const x = getT(p.id).find(y => y.i === m.id); if (x && x.s !== 'd') { x.s = 'd'; saveT(p.id); renderChat(); } }

/* ---------------- pairing ---------------- */
const b64u = u8 => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function pack(o) {
  const raw = new TextEncoder().encode(JSON.stringify(o));
  if (window.CompressionStream) { const cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(raw); w.close(); return 'AAT1.' + b64u(new Uint8Array(await new Response(cs.readable).arrayBuffer())); }
  return 'AAT0.' + b64u(raw);
}
async function unpack(code) {
  code = String(code || '').trim().replace(/\s+/g, '');
  const m = /^AAT([01])\.(.+)$/.exec(code); if (!m) throw new Error('bad');
  let u = unb64u(m[2]);
  if (m[1] === '1') { const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(u); w.close(); u = new Uint8Array(await new Response(ds.readable).arrayBuffer()); }
  return JSON.parse(new TextDecoder().decode(u));
}
const cleanSdp = sdp => sdp.split(/\r?\n/).filter(l => !(l.startsWith('a=candidate') && (/ tcp /i.test(l) || /fe80:/i.test(l)))).join('\r\n');
function gather(pc) {
  return new Promise(res => {
    if (pc.iceGatheringState === 'complete') return res();
    let t; const done = () => { pc.removeEventListener('icegatheringstatechange', h); clearTimeout(t); res(); };
    const h = () => { if (pc.iceGatheringState === 'complete') done(); };
    pc.addEventListener('icegatheringstatechange', h); t = setTimeout(done, 3500);
  });
}
function drawQR(code, cv) {
  const qr = qrcode(0, 'L'); qr.addData(code); qr.make();
  const n = qr.getModuleCount(), q = 3, cell = Math.max(3, Math.floor(900 / (n + 2 * q)));
  cv.width = cv.height = (n + 2 * q) * cell; const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) x.fillRect((c + q) * cell, (r + q) * cell, cell, cell);
  cv.parentElement.classList.add('ready');
}
let pairCode = { host: '', ans: '' }, camStream = null, camT = 0, pairErrT;
window.__aat.pairCode = pairCode;
const panel = id => { ['pChoose', 'pHost', 'pScan', 'pAnswer', 'pDone'].forEach(x => $('#' + x).classList.toggle('hidden', x !== id)); $('#pairErr').textContent = ''; };
function pairErr(msg) { $('#pairErr').textContent = msg; }
function openPair() { stopCam(); resetPair(); show('pair'); panel('pChoose'); }
function resetPair() { if (pairWait && pairWait.p && !pairWait.p.open) dropPeerQuiet(pairWait.p); pairWait = null; $$('.qrbox').forEach(b => b.classList.remove('ready')); }
function waitConnect(p) {
  pairWait = { p, done: pp => { stopCam(); $('#doneTxt').textContent = tt('paired') + ' ' + pp.name; panel('pDone'); pairWait = null; vib([80, 40, 80]); } };
  p.pc.addEventListener('connectionstatechange', () => { if (p.pc.connectionState === 'failed' && pairWait && pairWait.p === p) { pairErr(tt('badCode')); } });
}
async function doHost() {
  resetPair(); panel('pHost');
  try {
    const p = mkPeer(); waitConnect(p);
    await p.pc.setLocalDescription(await p.pc.createOffer()); await gather(p.pc);
    pairCode.host = await pack({ t: 'o', s: cleanSdp(p.pc.localDescription.sdp) });
    drawQR(pairCode.host, $('#hostQR'));
  } catch (e) { pairErr(tt('badCode')); }
}
async function hostGotAnswer(code) {
  try { const o = await unpack(code); if (o.t !== 'a' || !pairWait) throw 0; await pairWait.p.pc.setRemoteDescription({ type: 'answer', sdp: o.s }); stopCam(); panel('pHost'); }
  catch { pairErr(tt('badCode')); }
}
async function joinGotOffer(code) {
  try {
    const o = await unpack(code); if (o.t !== 'o') throw 0;
    stopCam(); panel('pAnswer');
    const p = mkPeer(); waitConnect(p);
    await p.pc.setRemoteDescription({ type: 'offer', sdp: o.s });
    await p.pc.setLocalDescription(await p.pc.createAnswer()); await gather(p.pc);
    pairCode.ans = await pack({ t: 'a', s: cleanSdp(p.pc.localDescription.sdp) });
    drawQR(pairCode.ans, $('#ansQR'));
  } catch (e) { pairErr(tt('badCode')); panel('pChoose'); }
}
let scanCb = null;
async function startCam(title, cb) {
  scanCb = cb; panel('pScan'); $('#scanTitle').textContent = title; $('#camErr').textContent = '';
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
    const v = $('#cam'); v.srcObject = camStream; await v.play();
    const cv = $('#scanCv'), cx = cv.getContext('2d', { willReadFrequently: true });
    camT = setInterval(() => {
      if (!v.videoWidth) return;
      const w = Math.min(960, v.videoWidth), h = Math.round(v.videoHeight * w / v.videoWidth); cv.width = w; cv.height = h; cx.drawImage(v, 0, 0, w, h);
      const r = jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
      if (r && /^AAT[01]\./.test(r.data)) { const f = scanCb; stopCam(); f && f(r.data); }
    }, 140);
  } catch { $('#camErr').textContent = tt('camErr'); }
}
function stopCam() { clearInterval(camT); camT = 0; if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } const v = $('#cam'); if (v) v.srcObject = null; }
async function copyText(s) { try { await navigator.clipboard.writeText(s); toast(tt('copied')); } catch { const t = document.createElement('textarea'); t.value = s; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast(tt('copied')); } catch {} t.remove(); } }
async function shareText(s) { if (navigator.share) { try { await navigator.share({ text: s }); return; } catch {} } copyText(s); }

/* ---------------- wake lock ---------------- */
let wl = null;
async function wakeSync() { try { if (S.set.wake && 'wakeLock' in navigator && document.visibilityState === 'visible') { if (!wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } else if (wl) { await wl.release(); wl = null; } } catch {} }
document.addEventListener('visibilitychange', () => { wakeSync(); });

/* ---------------- UI wiring ---------------- */
function openContact(id) {
  const c = S.contacts[id]; if (!c) return;
  $('#cName').textContent = c.name; $('#cBoss').checked = !!c.boss; $('#cSheet').dataset.id = id;
  $('#cMgr').classList.toggle('hidden', !S.me.boss); $('#cNote').value = c.note || ''; renderCTags();
  $('#cSheet').classList.remove('hidden');
}
function wire() {
  $('#wStart').onclick = () => {
    const n = $('#wName').value.trim(); if (!n) { $('#wName').focus(); return; }
    S.me = { id: rid(), name: n, boss: false }; persist(); show('home'); applyLang();
  };
  $('#wName').addEventListener('keydown', e => { if (e.key === 'Enter') $('#wStart').click(); });
  $$('[data-lang]').forEach(b => b.onclick = () => { S.lang = b.dataset.lang; persist(); applyLang(); });
  $('#btnAdd').onclick = openPair; $('#emptyAdd').onclick = openPair;
  $('#btnSet').onclick = () => { $('#sName').value = S.me.name; $('#oVib').checked = S.set.vib; $('#oBoss').checked = !!S.me.boss; $('#oToggle').checked = S.set.toggle; $('#oWake').checked = S.set.wake; const hasN = !!(window.AATNative && AATNative.getScheduleNotification); $('#rowSN').classList.toggle('hidden', !hasN); if (hasN) $('#oSN').checked = !!AATNative.getScheduleNotification(); $('#oStun').checked = S.set.stun; $('#vibSupport').textContent = canVib() ? tt('vibYes') : tt('vibNo'); show('settings'); };
  $('#setBack').onclick = () => { show('home'); renderAll(); };
  $('#sName').oninput = e => { const n = e.target.value.trim(); if (!n) return; S.me.name = n; persist(); peers.forEach(p => sendCtl(p, { k: 'name', name: n })); renderHeader(); };
  $('#oVib').onchange = e => { S.set.vib = e.target.checked; persist(); };
  $('#oBoss').onchange = e => { S.me.boss = e.target.checked; persist(); renderHeader(); renderGroups(); peers.forEach(p => sendCtl(p, { k: 'hello', id: S.me.id, name: S.me.name, boss: !!S.me.boss })); };
  $('#oToggle').onchange = e => { S.set.toggle = e.target.checked; persist(); renderPTT(); };
  $('#oSN').onchange = e => { try { AATNative.setScheduleNotification(e.target.checked); } catch {} };
  $('#oWake').onchange = e => { S.set.wake = e.target.checked; persist(); wakeSync(); };
  $('#oStun').onchange = e => { S.set.stun = e.target.checked; persist(); };
  $('#testVib').onclick = () => { if (!vib([300, 100, 300])) { blip(); toast(tt('vibNo')); } };

  $('#selAll').onclick = () => { Object.keys(S.contacts).forEach(id => S.sel.add(id)); persist(); renderList(); renderPTT(); };
  $('#selNone').onclick = () => { S.sel.clear(); persist(); renderList(); renderPTT(); };
  $('#list').onclick = e => {
    const cb = e.target.closest('[data-chat]'); if (cb) { openChat(cb.dataset.chat); return; }
    const mb = e.target.closest('[data-more]'); if (mb) { openContact(mb.dataset.more); return; }
    const li = e.target.closest('.card'); if (!li) return; const id = li.dataset.id;
    if (!openPeer(id)) { openPair(); return; }
    S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); persist(); renderList(); renderPTT();
  };
  $('#cClose').onclick = () => { $('#cSheet').classList.add('hidden'); renderAll(); };
  $('#cNote').oninput = e => { const c = S.contacts[$('#cSheet').dataset.id]; if (c) { c.note = e.target.value.trim(); persist(); } };
  $('#cTags').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; const c = S.contacts[$('#cSheet').dataset.id]; if (!c) return; c.tags = c.tags || []; const i = c.tags.indexOf(b.dataset.t); i >= 0 ? c.tags.splice(i, 1) : c.tags.push(b.dataset.t); persist(); renderCTags(); };
  $('#groups').onclick = e => { const g = e.target.closest('[data-g]'); if (g) { toggleGroup(g.dataset.g); return; } if (e.target.closest('[data-gnew]')) openGroups(); };
  $('#gSave').onclick = saveGroup; $('#gClose').onclick = () => { $('#gSheet').classList.add('hidden'); renderAll(); };
  $('#gList').onclick = e => { const d = e.target.closest('[data-gdel]'); if (!d) return; const gid = d.dataset.gdel; S.groups = S.groups.filter(g => g.id !== gid); Object.values(S.contacts).forEach(c => c.tags = (c.tags || []).filter(x => x !== gid)); persist(); renderGList(); renderAll(); };
  $('#cBoss').onchange = e => { const id = $('#cSheet').dataset.id; if (S.contacts[id]) { S.contacts[id].boss = e.target.checked; persist(); renderList(); } };
  $('#cDel').onclick = () => { const id = $('#cSheet').dataset.id; delete S.contacts[id]; S.sel.delete(id); peers.filter(p => p.id === id).forEach(p => { p.ctl.onclose = null; dropPeerQuiet(p); }); persist(); $('#cSheet').classList.add('hidden'); renderAll(); };
  $('#cReco').onclick = () => { $('#cSheet').classList.add('hidden'); openPair(); };

  $('#chatBack').onclick = () => { chatId = null; show('home'); renderAll(); };
  const doSend = () => {
    const el = $('#chatIn'); const ids = chatId === '*' ? [...S.sel].filter(x => S.contacts[x]) : [chatId];
    if (!ids.length) { toast(tt('pickFirst')); return; }
    if (sendMsg(ids, el.value)) { el.value = ''; el.style.height = ''; if (chatId === '*') toast(tt('sentOk')); }
    el.focus();
  };
  $('#chatSend').onclick = doSend;
  $('#chatIn').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
  $('#chatIn').addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px'; });
  $('#selMsg').onclick = () => { if (![...S.sel].some(x => S.contacts[x])) { toast(tt('pickFirst')); return; } openChat('*'); };

  /* push to talk */
  const ptt = $('#ptt');
  ptt.addEventListener('contextmenu', e => e.preventDefault());
  ptt.addEventListener('pointerdown', e => { e.preventDefault(); try { ptt.setPointerCapture(e.pointerId); } catch {} ctx(); if (S.set.toggle) { talking ? stopTalk() : startTalk(); } else startTalk(); });
  const up = e => { if (!S.set.toggle) stopTalk(); };
  ptt.addEventListener('pointerup', up); ptt.addEventListener('pointercancel', up);
  addEventListener('keydown', e => { if (e.code === 'Space' && !e.repeat && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !$('#home').classList.contains('hidden')) { e.preventDefault(); if (S.set.toggle) { talking ? stopTalk() : startTalk(); } else startTalk(); } });
  addEventListener('keyup', e => { if (e.code === 'Space' && !S.set.toggle) stopTalk(); });
  addEventListener('blur', () => { if (!S.set.toggle) stopTalk(); });

  /* pairing */
  $('#pairBack').onclick = () => { stopCam(); resetPair(); show('home'); renderAll(); };
  $('#pHostBtn').onclick = doHost;
  $('#pJoinBtn').onclick = () => { resetPair(); startCam(tt('scanOffer'), joinGotOffer); };
  $('#hostScan').onclick = () => startCam(tt('scanAnswer'), hostGotAnswer);
  $('#hostCopy').onclick = () => copyText(pairCode.host); $('#hostShare').onclick = () => shareText(pairCode.host);
  $('#ansCopy').onclick = () => copyText(pairCode.ans); $('#ansShare').onclick = () => shareText(pairCode.ans);
  $('#hostPasteGo').onclick = () => hostGotAnswer($('#hostPaste').value);
  $('#scanPasteGo').onclick = () => (scanCb || (() => {}))($('#scanPaste').value);
  $('#doneBtn').onclick = () => { show('home'); renderAll(); };

  /* alerts */
  $('#btnAlert').onclick = () => { $('#aSheet').classList.remove('hidden'); renderAlertStat(); };
  $('#aClose').onclick = () => $('#aSheet').classList.add('hidden');
  $$('#aDur .chip').forEach(c => c.onclick = () => { $$('#aDur .chip').forEach(x => x.classList.toggle('on', x === c)); });
  $$('#aTo .chip').forEach(c => c.onclick = () => { $$('#aTo .chip').forEach(x => x.classList.toggle('on', x === c)); });
  $('#aSend').onclick = sendAlert; $('#aCancel').onclick = cancelAlert;
  $('#alOk').onclick = () => endAlert(false);
}

/* ---------------- daily schedule ---------------- */
let SCH = null, schDay = null, schEdit = false, schT = 0, schSaveT = 0;
const mins = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : 0; };
const shortT = t => String(t || '').replace(/^0/, '');
async function fetchOriginalSched() { const r = await fetch('schedule.json?v=' + Date.now()); return r.json(); }
async function loadSched() {
  if (SCH) return SCH;
  let raw = null;
  try { if (window.AATNative && AATNative.loadSchedule) { const s = AATNative.loadSchedule(); if (s) raw = JSON.parse(s); } } catch {}
  if (!raw) raw = LS.get('sched', null);
  if (!raw) { try { raw = await fetchOriginalSched(); } catch {} }
  SCH = raw && raw.days ? raw : null; return SCH;
}
function pickDay(days, wd) {
  const hit = days.find(d => d.wd === wd); if (hit) return hit.id;
  for (let k = 1; k <= 7; k++) { const w = ((wd - 1 + k) % 7) + 1; const d = days.find(x => x.wd === w); if (d) return d.id; }
  return days[0].id;
}
function curIdx(items, nowMin) { let r = -1; items.forEach((it, i) => { if (mins(it.t) <= nowMin) r = i; }); return r; }
function pushSched() { LS.set('sched', SCH); try { if (window.AATNative && AATNative.saveSchedule) AATNative.saveSchedule(JSON.stringify(SCH)); } catch {} }
function saveSched() { clearTimeout(schSaveT); schSaveT = setTimeout(pushSched, 300); }
async function openSched() {
  show('sched'); await loadSched();
  if (!SCH) { $('#schRows').innerHTML = '<div class="schempty">' + esc(tt('noSched')) + '</div>'; return; }
  const d = new Date(); if (!schDay || !SCH.days.some(x => x.id === schDay)) schDay = pickDay(SCH.days, d.getDay() + 1);
  schEdit = false; renderSched(true);
  clearInterval(schT); schT = setInterval(() => { if (!schEdit) renderSched(false); }, 60000);   // only while this screen is open
}
function closeSched() {
  clearInterval(schT); schT = 0; clearTimeout(schSaveT); if (SCH) pushSched();
  show('home'); renderAll(); if (location.hash === '#schedule') history.replaceState(null, '', location.pathname + location.search);
}
function renderSched(scroll) {
  if (!SCH) return;
  const now = new Date(), todayId = (SCH.days.find(x => x.wd === now.getDay() + 1) || {}).id;
  $('#schDays').innerHTML = SCH.days.map(d => `<button class="sday ${d.id === schDay ? 'on' : ''}" data-day="${d.id}">${esc(d.name)}${d.id === todayId ? '<small>' + tt('todayLbl') + '</small>' : ''}</button>`).join('');
  const day = SCH.days.find(x => x.id === schDay), items = day.items;
  const cur = day.id === todayId ? curIdx(items, now.getHours() * 60 + now.getMinutes()) : -1;
  $('#schTools').classList.toggle('hidden', !schEdit); $('#schEdit').textContent = schEdit ? '✓' : '✎';
  $('#schRows').innerHTML = items.map((it, i) => schEdit
    ? `<div class="srow edit"><button data-del="${i}" aria-label="delete">✕</button><input type="time" value="${esc(it.t)}" data-ti="${i}"><input class="tx" value="${esc(it.x)}" data-xi="${i}" maxlength="80"></div>`
    : `<div class="srow ${day.id === todayId ? (i < cur ? 'past' : i === cur ? 'now' : '') : ''}" ${i === cur ? 'id="schNow"' : ''}><span class="stime">${esc(shortT(it.t))}</span><span class="sx">${esc(it.x)}</span></div>`).join('');
  if (scroll) { const n = $('#schNow'); if (n) n.scrollIntoView({ block: 'center' }); else $('#schBox').scrollTop = 0; }
}
function wireSched() {
  $('#btnSched').onclick = openSched; $('#schBack').onclick = closeSched;
  $('#schEdit').onclick = () => { if (!SCH) return; if (schEdit) { SCH.days.forEach(d => d.items.sort((a, b) => mins(a.t) - mins(b.t))); pushSched(); } schEdit = !schEdit; renderSched(false); };
  $('#schDays').onclick = e => { const b = e.target.closest('[data-day]'); if (!b) return; schDay = b.dataset.day; renderSched(true); };
  $('#schRows').addEventListener('input', e => {
    const day = SCH.days.find(x => x.id === schDay), t = e.target;
    if (t.dataset.ti != null) day.items[+t.dataset.ti].t = t.value || '00:00'; else if (t.dataset.xi != null) day.items[+t.dataset.xi].x = t.value;
    saveSched();
  });
  $('#schRows').onclick = e => { const d = e.target.closest('[data-del]'); if (!d) return; SCH.days.find(x => x.id === schDay).items.splice(+d.dataset.del, 1); saveSched(); renderSched(false); };
  $('#schAdd').onclick = () => { const day = SCH.days.find(x => x.id === schDay); day.items.push({ t: '12:00', x: '' }); saveSched(); renderSched(false); const xs = $$('#schRows input.tx'); xs[xs.length - 1].focus(); };
  $('#schReset').onclick = async () => { if (!confirm(tt('confirmReset'))) return; try { SCH = await fetchOriginalSched(); pushSched(); schEdit = false; renderSched(true); } catch {} };
  addEventListener('hashchange', () => { if (location.hash === '#schedule' && S.me) openSched(); });
}

/* ---------------- boot ---------------- */
function boot() {
  wire(); wireSched();
  if (S.me) { show('home'); } else { show('welcome'); }
  applyLang();
  if (S.me && location.hash === '#schedule') openSched();
  wakeSync();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
})();
