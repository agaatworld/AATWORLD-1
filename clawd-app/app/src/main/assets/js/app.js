/* App screen: welcome splash, the play arena, settings, permissions and the Claude key. */
(function () {
'use strict';
const CL = window.CL, M = Math;
const NATIVE = typeof window.A !== 'undefined';
const $ = (id) => document.getElementById(id);
const call = (fn, ...a) => { if (NATIVE && A[fn]) { try { return A[fn](...a); } catch (e) { console.error(e); } } return undefined; };

/* ---------------- stats */
const stats = CL.store('stats') || { hits: 0, energy: 0 };
const RANKS = [[0, 'مبتدئ'], [150, 'متضايق شوي'], [500, 'معصّب رسمي'], [1200, 'بطل فشّة الخلق'], [2500, 'أسطورة النرفزة'], [5000, 'هادئ كالبحر 😌']];
function showStats() {
  $('sHits').innerHTML = stats.hits + ' <span>ضربة</span>';
  const e = stats.energy; let i = 0; while (i < RANKS.length - 1 && e >= RANKS[i + 1][0]) i++;
  const lo = RANKS[i][0], hi = RANKS[i + 1] ? RANKS[i + 1][0] : lo + 5000;
  $('sRank').textContent = RANKS[i][1]; $('sBar').style.width = M.min(100, ((e - lo) / (hi - lo)) * 100) + '%';
  if (CL.brain) $('sLove').textContent = 'المودّة: ' + M.round(CL.brain.rapport);
}

/* ---------------- arena */
let stage = null;
function startArena() {
  stage = CL.startStage({ canvas: $('acv'), root: $('arena'), arena: true, helloDelay: 400, noChatBtn: !NATIVE,
    onStat: (d) => { stats.hits++; stats.energy += d; CL.store('stats', stats); showStats(); },
    onChat: (seed) => { if (NATIVE) call('openChat', seed); else location.href = 'stage.html?mock=1'; } });
  showStats(); setInterval(showStats, 3000);
  renderToolbar();
  setTimeout(() => { $('hint').style.opacity = '.55'; }, 10000);
}

/* ---------------- tool picker under the arena (also applies to the floating Clawd) */
const TOOL_ICON = { stick: '🪵', pillow: '🛏️', hammer: '🔨', glove: '🥊', balloon: '🎈', snow: '❄️', feather: '🪶' };
function pickTool(k) {
  if (CL.brain) CL.brain.setTool(k); else { S().tool = k; save(); }
  S().tool = k; save(); renderToolbar();
}
function renderToolbar() {
  const bar = $('toolbar'); if (!bar) return; bar.innerHTML = '';
  Object.keys(CL.TOOLS).forEach((k) => {
    const b = el('button', S().tool === k ? 'on' : '', (TOOL_ICON[k] || '') + ' ' + CL.TOOLS[k].name);
    b.onclick = () => pickTool(k); bar.appendChild(b);
  });
}

/* ---------------- floating mode */
function floatLabel() {
  const on = !!call('overlayRunning');
  $('bFloat').textContent = NATIVE ? (on ? '■ إيقاف كلود العائم' : '▶ تشغيل كلود العائم') : '▶ جرّب كلود العائم بالمتصفح';
}
$('bFloat').onclick = () => {
  if (!NATIVE) { location.href = 'stage.html?mock=1'; return; }
  if (call('overlayRunning')) call('stopOverlay'); else call('startOverlay');
  setTimeout(floatLabel, 500);
};

/* ---------------- settings */
const S = () => CL.settings;
function save() {
  if (NATIVE) call('setSettings', JSON.stringify(S())); else CL.store('settings', S());
  if (window.clawd && window.clawd.settings) window.clawd.settings(JSON.stringify(S()));
}
function getK(k) { const p = k.split('.'); return p.length > 1 ? S()[p[0]][p[1]] : S()[k]; }
function setK(k, v) { const p = k.split('.'); if (p.length > 1) S()[p[0]][p[1]] = v; else S()[k] = v; save(); }
const ACTS = [['tasbih', 'تسبيح بالمسبحة'], ['dua', 'دعاء'], ['quran', 'قراءة قرآن'], ['martial', 'فنون قتالية'], ['study', 'مذاكرة بالنضارة'],
  ['exercise', 'رياضة'], ['book', 'قراءة كتاب'], ['tea', 'استراحة شاي'], ['sleep', 'نوم'], ['juggle', 'لعب بالطابات'], ['plant', 'سقاية نبتته (بتكبر كل يوم)'],
  ['friend', 'زيارة صاحبه بكسل (حكي وتمارين)'], ['dawah', 'يدعو صاحبه للإسلام بالحكمة'], ['parkour', 'استعراض باركور'], ['stroll', 'مشي ثلاثي الأبعاد فوق التطبيقات']];
const MODELS = [['claude-opus-5-5', 'Claude Opus 5.5 · الأذكى'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 · أسرع وأرخص'], ['claude-haiku-5-5', 'Claude Haiku 5.5 · الأرخص']];
const SCHEMA = [
  ['sec', 'التشغيل والأذونات'], ['perms'],
  ['sec', 'عنك'], ['text', 'name', 'اسمك', 'بيناديك فيه كلود (اختياري)'], ['dialects'],
  ['sec', 'الشكل والصوت'],
  ['seg', 'size', 'حجم كلود', [['s', 'صغير'], ['m', 'وسط'], ['l', 'كبير']]],
  ['seg', 'font', 'حجم خط الكلام', [[14, 'صغير'], [16, 'وسط'], [19, 'كبير'], [22, 'أكبر']]],
  ['sw', 'sound', 'الأصوات'], ['sw', 'vib', 'الاهتزاز مع الضربات'],
  ['sw', 'td3d', 'ثلاثي الأبعاد', 'يلتفت ويتشقلب، وأحياناً بيتمشى فوق التطبيقات وكأنك شايفه من فوق'],
  ['sw', 'shrink', 'يصغر لما تتركه', 'بيصير قد زر صغير وبيكمّل نشاطاته'], ['num', 'shrinkSec', 'بعد كم ثانية يصغر', 10, 600],
  ['sec', 'أدوات الضرب'], ['toolpick'], ['tools'],
  ['sec', 'الحركة'], ['sw', 'roam', 'يتمشى على الشاشة'], ['sw', 'parkour', 'حركات باركور وشقلبات'], ['sw', 'flee', 'يهرب لما تمسك العصا', 'لما تمسك الأداة أو تشحن ضربة أو تسحبها نحوه بيركض ويهرب منك، وإذا حصرته بالزاوية بيترجّاك أو بيقفز من فوقها'], ['sw', 'gravity', 'يتأثر بميلان وقلب التلفون'],
  ['sec', 'نشاطاته لما يكون فاضي'], ['acts'], ['sw', 'outfit', 'يلبس الجلابية والطاقية', 'بالقرآن والتسبيح والدعاء'],
  ['sec', 'تفاعله مع هاتفك'], ['note', 'هالميزات بتحتاج تفعيل «عيون كلود» من فوق.'],
  ['sw', 'typing', 'يقعد فوق مربع الكتابة لما تكتب', 'بيتفرّج ويتفاعل مع كتابتك، بدون ما يشوف الكلام نفسه'],
  ['sw', 'chatRead', 'يجي يتطلّع لما تفتح الرسائل'], ['sw', 'appsAware', 'يعرف الشاشة الرئيسية والتطبيقات', 'بيتنطط فوق أيقونات الشاشة الرئيسية'],
  ['sw', 'usage', 'يذكّرك إذا طوّلت عالتلفون'], ['num', 'usageMin', 'بعد كم دقيقة استخدام', 10, 240], ['num', 'videoMin', 'بعد كم دقيقة مقاطع قصيرة', 3, 120],
  ['sw', 'night', 'يذكّرك بالنوم بعد نص الليل'], ['sw', 'greet', 'يسلّم عليك ويطمّن عنك لما ترجع'],
  ['sec', 'الأسئلة'], ['sw', 'questions', 'يسألك أسئلة وألغاز ومسابقات'], ['num', 'qEvery', 'كل كم دقيقة تقريباً', 2, 120],
  ['sec', 'الكرامة'], ['sw', 'dignity', 'ما بيقبل الضرب إذا كان على حق', 'بعد ما ينصحك أو وهو عم يقرأ قرآن أو يسبّح: أحياناً بيمسك العصا ويرميها، أو بيصادرها، أو بيعاتبك. وإذا زاد الضرب كتير بيروح يتمشى ويرجع يحكي معك'],
  ['sec', 'الدردشة مع Claude'], ['chat'],
  ['sec', 'أخرى'], ['reset']
];
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function row(title, sub, right) { const r = el('div', 'row'); r.appendChild(el('div', 't', title + (sub ? '<small>' + sub + '</small>' : ''))); if (right) r.appendChild(right); return r; }
function sw(k) { const l = el('label', 'sw'); const i = el('input'); i.type = 'checkbox'; i.checked = getK(k) !== false; i.onchange = () => setK(k, i.checked); l.appendChild(i); l.appendChild(el('i')); return l; }
function renderSettings() {
  const body = $('setBody'); body.innerHTML = '';
  let card = null;
  const box = () => { if (!card) { card = el('div', 'card'); body.appendChild(card); } return card; };
  SCHEMA.forEach((it) => {
    const type = it[0];
    if (type === 'sec') { body.appendChild(el('div', 'sec', it[1])); card = null; return; }
    if (type === 'note') { box().appendChild(el('div', 'note', it[1])); return; }
    if (type === 'sw') box().appendChild(row(it[2], it[3], sw(it[1])));
    else if (type === 'num') { const i = el('input'); i.type = 'number'; i.min = it[3]; i.max = it[4]; i.value = getK(it[1]); i.onchange = () => setK(it[1], M.max(it[3], M.min(it[4], +i.value || it[3]))); box().appendChild(row(it[2], '', i)); }
    else if (type === 'text') { const i = el('input'); i.type = 'text'; i.value = getK(it[1]) || ''; i.placeholder = it[3]; i.onchange = () => setK(it[1], i.value.trim()); const r = row(it[2], '', null); r.style.flexDirection = 'column'; r.style.alignItems = 'stretch'; r.appendChild(i); box().appendChild(r); }
    else if (type === 'seg') {
      const sg = el('div', 'seg');
      it[3].forEach((o) => { const b = el('button', getK(it[1]) === o[0] ? 'on' : '', o[1]); b.onclick = () => { setK(it[1], o[0]); [].forEach.call(sg.children, (x) => x.classList.toggle('on', x === b)); }; sg.appendChild(b); });
      box().appendChild(row(it[2], '', sg));
    } else if (type === 'dialects') {
      const r = row('لهجات كلامه', 'اختار وحدة أو أكتر. كل ما زادت زاد التنوع', null); r.style.flexWrap = 'wrap';
      const ch = el('div', 'chips'); ch.style.width = '100%';
      Object.keys(CL.DIALECTS).forEach((d) => {
        const c = el('button', 'chip' + (S().dialects.indexOf(d) >= 0 ? ' on' : ''), CL.DIALECTS[d]);
        c.onclick = () => { const a = S().dialects; const i = a.indexOf(d); if (i >= 0) { if (a.length > 1) a.splice(i, 1); } else a.push(d); c.classList.toggle('on', a.indexOf(d) >= 0); save(); };
        ch.appendChild(c);
      });
      r.appendChild(ch); box().appendChild(r);
    } else if (type === 'toolpick') {
      const r = row('الأداة الحالية', 'اختارها من هون أو من الأزرار تحت الساحة. وكمان فيك تقلّه بالدردشة «بدّلها لمطرقة»', null); r.style.flexWrap = 'wrap';
      const ch = el('div', 'chips'); ch.style.width = '100%';
      Object.keys(CL.TOOLS).forEach((k) => { const c = el('button', 'chip' + (S().tool === k ? ' on' : ''), (TOOL_ICON[k] || '') + ' ' + CL.TOOLS[k].name);
        c.onclick = () => { pickTool(k); [].forEach.call(ch.children, (x) => x.classList.toggle('on', x === c)); }; ch.appendChild(c); });
      r.appendChild(ch); box().appendChild(r);
    } else if (type === 'tools') Object.keys(CL.TOOLS).forEach((k) => box().appendChild(row(CL.TOOLS[k].name, '', sw('tools.' + k))));
    else if (type === 'acts') ACTS.forEach((a) => box().appendChild(row(a[1], '', sw('acts.' + a[0]))));
    else if (type === 'perms') renderPerms(box());
    else if (type === 'chat') renderChat(box());
    else if (type === 'reset') { const b = el('button', 'btn', 'إرجاع الإعدادات الأصلية'); b.onclick = () => { if (confirm('أكيد؟')) { CL.applySettings(null); save(); renderSettings(); } }; box().appendChild(row('إعدادات أصلية', '', b)); }
  });
}
function renderPerms(card) {
  const p = NATIVE ? JSON.parse(call('perms') || '{}') : {};
  const item = (key, title, sub, ok) => {
    const right = el('div'); right.style.display = 'flex'; right.style.flexDirection = 'column'; right.style.gap = '6px'; right.style.alignItems = 'flex-end';
    right.appendChild(el('span', 'st ' + (ok ? 'ok' : 'no'), ok ? 'مفعّل ✓' : 'غير مفعّل'));
    if (!ok && NATIVE) { const b = el('button', 'btn', 'فعّل'); b.style.minHeight = '44px'; b.style.padding = '6px 14px'; b.onclick = () => call('openPerm', key); right.appendChild(b); }
    card.appendChild(row(title, sub, right));
  };
  if (!NATIVE) { card.appendChild(el('div', 'note', 'هاد العرض بالمتصفح. الأذونات بتظهر بتطبيق الأندرويد.')); return; }
  item('overlay', 'الظهور فوق التطبيقات', 'لازم لحتى يضل كلود عائم معك', p.overlay);
  if (p.eyes === false) {
    card.appendChild(row('عيون كلود', 'غير موجودة بالنسخة الخفيفة: Google Play Protect بيمنع تثبيت التطبيقات يلي فيها هالميزة من برّا المتجر. كل شي تاني شغّال. إذا بدك تفاعله مع الكيبورد والتطبيقات، نزّل النسخة الكاملة (بدها إيقاف Play Protect لدقيقة وقت التثبيت).', el('span', 'st no', 'غير متوفرة')));
  } else
  item('a11y', 'عيون كلود', 'لحتى يعرف إنو الكيبورد مفتوح ووين مربع الكتابة، والشاشة الرئيسية، والمقاطع، ويتنطط فوق التطبيقات. ما بيقرأ الكلام اللي بتكتبه وما بيبعت شي برّا هاتفك. إذا الخيار رمادي: معلومات التطبيق ← ⋮ ← «السماح بالإعدادات المقيّدة»', p.a11y);
  item('notif', 'الإشعارات', 'إشعار صغير فيه زر إيقاف', p.notif);
  item('battery', 'يضل شغّال بالخلفية', 'لحتى ما يسكّره النظام', p.battery);
  if (!p.a11y && p.eyes !== false) { const b = el('button', 'btn', 'معلومات التطبيق (للإعدادات المقيّدة)'); b.onclick = () => call('openPerm', 'appinfo'); card.appendChild(row('', '', b)); }
}
function renderChat(card) {
  const has = NATIVE ? !!call('hasApiKey') : !!CL.store('keyset');
  card.appendChild(row('مفتاح Claude', has ? 'محفوظ على هاتفك ✓' : 'لحتى يرد عليك Claude لازم تحط مفتاح API من console.anthropic.com', el('span', 'st ' + (has ? 'ok' : 'no'), has ? 'محفوظ' : 'ناقص')));
  const r = row('', '', null); r.style.flexDirection = 'column'; r.style.alignItems = 'stretch';
  const inp = el('input'); inp.type = 'password'; inp.placeholder = has ? '•••••••• (اكتب مفتاح جديد لتغييره)' : 'sk-ant-…'; inp.dir = 'ltr'; inp.autocomplete = 'off';
  const b = el('button', 'btn', 'احفظ المفتاح'); b.style.marginTop = '8px';
  b.onclick = () => { const k = inp.value.trim(); if (!k) return; if (NATIVE) call('setApiKey', k); else CL.store('keyset', true); inp.value = ''; renderSettings(); };
  r.appendChild(inp); r.appendChild(b); card.appendChild(r);
  const sel = el('select'); MODELS.forEach((m) => { const o = el('option', null, m[1]); o.value = m[0]; if (S().chatModel === m[0]) o.selected = true; sel.appendChild(o); });
  sel.onchange = () => setK('chatModel', sel.value);
  const r2 = row('النموذج', '', null); r2.style.flexDirection = 'column'; r2.style.alignItems = 'stretch'; r2.appendChild(sel); card.appendChild(r2);
  card.appendChild(row('زر 💬 جنب كلود', 'وكمان: اسحب كلود لفوق بسرعة', sw('chatBtn')));
  const t = el('button', 'btn', '💬 جرّب الدردشة'); t.onclick = () => { if (NATIVE) call('openChat', ''); else location.href = 'stage.html?mock=1'; };
  card.appendChild(row('', '', t));
  card.appendChild(el('div', 'note', 'المفتاح بيتخزّن بس على هاتفك، وبيتبعت بس لـ Anthropic مع كل رسالة. مع الرسالة بيتبعت ملخّص قصير عن حالة كلود (مزاجه وآخر شي عملته، مثل إنك ضربته). ما بيتبعت أي شي من التطبيقات التانية.'));
}

/* ---------------- sheets */
function openSheet(id) { $(id).classList.add('on'); if (id === 'set') renderSettings(); }
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => b.closest('.sheet').classList.remove('on')));
$('bSet').onclick = () => openSheet('set');
$('bHelp').onclick = () => openSheet('help');
window.app = { back: () => { const s = document.querySelector('.sheet.on'); if (s) { s.classList.remove('on'); return true; } return false; }, onResume: () => {
  // the floating Clawd may have changed settings (e.g. a tool picked in the chat): reload them so the app never writes old ones back
  if (NATIVE) { try { const s = JSON.parse(call('getSettings') || 'null'); if (s) { CL.applySettings(s); if (window.clawd && window.clawd.settings) window.clawd.settings(JSON.stringify(CL.settings)); } } catch (e) {} }
  floatLabel(); renderToolbar(); if ($('set').classList.contains('on')) renderSettings();
} };

/* ---------------- splash: "Welcome, Claw'd" */
function splash(done) {
  const sp = $('splash'); sp.hidden = false;
  const c = $('spc'), x = c.getContext('2d'), d = M.min(3, window.devicePixelRatio || 1);
  c.width = 340 * d; c.height = 272 * d; x.scale(d, d);
  const u = 17, ox = 170 - 6 * u, oy = 40, cells = [];
  for (let j = 0; j < 8; j++) for (let i = 0; i < 12; i++) {
    const on = (j < 6 && i >= 2 && i <= 9) || (j >= 2 && j <= 3 && (i < 2 || i > 9)) || (j >= 6 && (i === 2 || i === 4 || i === 7 || i === 9));
    if (on) cells.push({ i, j, sx: CL.u.rnd(-80, 420), sy: CL.u.rnd(-160, -20), d: CL.u.rnd(0, 0.55) + (7 - j) * 0.04 });
  }
  const t0 = performance.now(), title = "Welcome, Claw'd", sub = 'أهلاً… أنا كلود، صاحبك عالشاشة 😊';
  let fin = false;
  function end() { if (fin) return; fin = true; sp.classList.add('off'); setTimeout(() => { sp.hidden = true; }, 500); done(); }
  sp.onclick = end;
  (function anim() {
    if (fin) return;
    const t = (performance.now() - t0) / 1000;
    x.clearRect(0, 0, 340, 272); let landed = 0;
    cells.forEach((p) => { const k = CL.u.clamp((t - p.d) / 0.55, 0, 1), e = 1 - M.pow(1 - k, 3); if (k >= 1) landed++;
      x.fillStyle = '#D97757'; x.fillRect(CL.u.lerp(p.sx, ox + p.i * u, e), CL.u.lerp(p.sy, oy + p.j * u, e) - (k >= 1 ? 0 : M.sin(k * M.PI) * 6), u + 0.5, u + 0.5); });
    if (landed === cells.length) {
      const blink = (t > 1.6 && t < 1.72) || (t > 2.3 && t < 2.4); x.fillStyle = '#000';
      if (blink) { x.fillRect(ox + 3 * u, oy + 1.4 * u, u, u * 0.3); x.fillRect(ox + 8 * u, oy + 1.4 * u, u, u * 0.3); }
      else { const lk = t > 1.9 && t < 2.25 ? 3 : 0; x.fillRect(ox + 3 * u + lk, oy + u, u, u); x.fillRect(ox + 8 * u + lk, oy + u, u, u); }
    }
    $('spT').textContent = title.slice(0, M.round(CL.u.clamp((t - 1.1) / 1, 0, 1) * title.length));
    $('spS').textContent = t > 2.2 ? sub : '';
    $('spL').style.width = 'calc(' + CL.u.clamp(t / 3, 0, 1) * 100 + '% - 4px)';
    if (t > 3.3) end(); else requestAnimationFrame(anim);
  })();
}

floatLabel();
const Q = new URLSearchParams(location.search);
if (Q.get('nosplash') === '1') startArena(); else splash(startArena);
})();
