// Builds tile-ar.html and tile-en.html: the style tile of the fused identity "Trade Bridge" (جسر التجارة).
// Every text and number comes from ../../data/data.json; every picture from ../../img/. Run: node build_tile.js
'use strict';
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'data.json'), 'utf8'));
const IMG = '../../';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// wrap runs of Latin letters/digits inside Arabic text in <bdi dir=ltr> so their order never flips (DESIGN.md §7)
function arx(raw) {
  raw = String(raw == null ? '' : raw);
  const re = /\([A-Za-z0-9][A-Za-z0-9.&'’\-\/ ×]*\)|[A-Za-z][A-Za-z0-9.&'’\-\/ ×]*[A-Za-z0-9.]|[A-Za-z]/g;
  let out = '', last = 0, m;
  while ((m = re.exec(raw))) { out += esc(raw.slice(last, m.index)) + '<bdi dir="ltr">' + esc(m[0]) + '</bdi>'; last = m.index + m[0].length; }
  return out + esc(raw.slice(last));
}
// pages of an advertiser: a contiguous run is a range (18–19, 52–55), otherwise the first page
const pagesLabel = p => (p.length > 1 && p.every((x, i) => !i || x === p[i - 1] + 1)) ? p[0] + '–' + p[p.length - 1] : String(p[0]);
const num = n => Number(n).toLocaleString('en-US');
const MONTHS = {
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
// Arabic counted nouns: 3–10 plural, 11–99 singular accusative, 100s/1–2 singular (rule written in DESIGN.md §8)
function arCount(n, one, few, many) { const r = n % 100; if (r >= 3 && r <= 10) return few; if (r >= 11) return many; return one; }
const shows = D.shows;
const C = D.countries;
const LINE = ['tw', 'id', 'my', 'pk', 'om', 'ae', 'qa', 'kw', 'sa', 'iq', 'sy', 'tr', 'eg', 'dz'].filter(cc => C[cc].shows > 0); // never af / ye (0 shows)
const nCountries = LINE.length;
const fields = Object.fromEntries(D.fields.map(f => [f.id, f]));
const prodAll = D.companies.reduce((a, c) => a + c.products.length, 0);
const prodCos = D.companies.filter(c => c.products.length).length;
const pictured = [];
D.companies.forEach(c => c.products.forEach(p => { if (p.img) pictured.push({ c, p }); }));
const dated = shows.filter(s => !s.approx).sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
const ORIGIN = { Taiwan: 'tw', Syria: 'sy', Malaysia: 'my', Indonesia: 'id', Pakistan: 'pk', Turkey: 'tr', 'Saudi Arabia': 'sa', UAE: 'ae', India: null };
function origin(c) {
  const en = ((c.city && c.city.en) || '').split(' · ')[0];
  const last = en.split(',').pop().trim();
  const ar = ((c.city && c.city.ar) || '').split(' · ')[0];
  return { cc: ORIGIN[last] || null, en, ar };
}
function seal(size) {
  // the owner-approved clubMark() of assets/js/views.js, ported as it is (ring text unchanged), with the real logo in the centre
  return `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="AAT Business Club · نادي رجال الأعمال">
<defs><path id="sl-t" d="M30 100a70 70 0 0 1 140 0"/><path id="sl-b" d="M13 100a87 87 0 0 0 174 0"/></defs>
<circle cx="100" cy="100" r="98" fill="#D21F26"/><circle cx="100" cy="100" r="93" fill="none" stroke="#fff" stroke-width="1.5"/>
<circle cx="100" cy="100" r="64" fill="#fff"/><circle cx="100" cy="100" r="59" fill="none" stroke="#D21F26" stroke-width="1.5"/>
<text font-family="Changa, 'Readex Pro', Arial, sans-serif" font-weight="800" font-size="17" letter-spacing="2.2" fill="#fff" text-anchor="middle"><textPath href="#sl-t" startOffset="50%">BUSINESS CLUB</textPath></text>
<text font-family="Changa, 'Readex Pro', Tahoma, sans-serif" font-weight="700" font-size="17" fill="#fff" text-anchor="middle" direction="rtl"><textPath href="#sl-b" startOffset="50%">نادي رجال الأعمال</textPath></text>
<circle cx="20" cy="100" r="3.5" fill="#fff"/><circle cx="180" cy="100" r="3.5" fill="#fff"/>
<g transform="translate(88 50)" fill="none" stroke="#111" stroke-width="2.2" stroke-linejoin="round"><rect x="0" y="5" width="24" height="16" rx="2.5"/><path d="M8 5V2.5h8V5M0 12h24"/></g>
<image href="${IMG}img/brand/aat-logo-red.svg" x="52" y="80" width="96" height="32"/>
<g fill="#D21F26"><path d="M84 140l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/><path d="M100 143l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/><path d="M116 140l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/></g>
</svg>`;
}
const appPath = n => (fs.readFileSync(path.join(ROOT, 'img', 'apps', n + '.svg'), 'utf8').match(/ d="([^"]+)"/) || [])[1];
const APPCOL = { WhatsApp: '#25D366', Viber: '#7360F2', LINE: '#06C755' };
function apps(T) {
  return '<ul class="apps">' + D.config.apps.map(a => {
    const icon = a.icon ? `<img src="${IMG}${a.icon}" alt="" width="52" height="52">`
      : `<span class="appsq" style="background:${APPCOL[a.name]}"><svg viewBox="-4 -4 32 32" aria-hidden="true"><path fill="#fff" d="${appPath(a.name.toLowerCase())}"/></svg></span>`;
    const tag = a.action === 'chat' ? `a href="${esc(a.url)}"` : 'button type="button"';
    return `<li><${tag} class="app" title="${esc(a.action === 'chat' ? a.name : T.copyNum)}">${icon}<span dir="ltr">${esc(a.name)}</span></${tag.split(' ')[0]}></li>`;
  }).join('') + '</ul>';
}
const ICON = {
  globe: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20"/></svg>',
  phone: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  box: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
};

const T = {
  ar: {
    lang: 'ar', dir: 'rtl', o: 'ar', title: 'التجارة العربية الآسيوية · جسر التجارة',
    issue: `العدد ${D.magazine.number} · ${D.magazine.month.ar}`,
    langBtn: 'English', globe: 'اللغات', sections: 'الأقسام', chat: 'محادثة 24 ساعة', ask: 'اسأل AAT',
    nav: ['الرئيسية', 'المجلة', 'معارض دولية', 'دليل الشركات', 'المنتجات', 'مقالات وأخبار', 'نادي رجال الأعمال', 'تواصل معنا'],
    tabs: ['المجلة', 'معارض دولية', 'المنتجات', 'اسأل AAT'],
    h1: 'من مصانع آسيا<br>إلى أسواق العرب وأفريقيا', twin: "From Asia's factories to Arab and African markets", twinDir: 'ltr',
    searchPh: 'ابحث عن معرض أو شركة أو منتج', searchBtn: 'ابحث',
    quick: ['معارض الإمارات', 'آلات التغليف', 'شركات تايوان', 'معارض الأغذية'],
    k: [
      [num(shows.length), arCount(shows.length, 'معرض دولي', 'معارض دولية', 'معرضاً دولياً'), '2027 – 2028'],
      [num(D.companies.length), 'شركة معلنة', `في العدد ${D.magazine.number}`],
      [num(prodAll), 'منتجاً', `من ${prodCos} شركة`],
      [num(D.club.members.count), 'عضواً', 'في نادي رجال الأعمال'],
    ],
    photoCap: 'خلاط صحي · ماليزيا', photoSub: 'منتجات وصناعات حديثة',
    issueStamp: `العدد ${D.magazine.number}`, issueSub: `${D.magazine.month.ar} · ${D.magazine.pages} صفحة`, read: 'اقرأ العدد', pdf: 'PDF',
    lineCap: `خط التجارة: ${nCountries} دولة · ${num(shows.length)} ${arCount(shows.length, 'معرض دولي', 'معارض دولية', 'معرضاً دولياً')} من يناير 2027`,
    showsW: n => `${num(n)} ${arCount(n, 'معرض', 'معارض', 'معرضاً')}`,
    nearT: 'أقرب المعارض الدولية', nearM: `${num(shows.length)} ${arCount(shows.length, 'معرض', 'معارض', 'معرضاً')} في ${nCountries} دولة · من يناير 2027`, nearBtn: 'كل المعارض الدولية',
    cols: ['التاريخ', 'المعرض', 'المدينة والدولة', 'المجال'],
    convT: `منتجات المعلنين في العدد ${D.magazine.number}`, convM: `${prodAll} منتجاً من ${prodCos} شركة`, convBtn: 'كل المنتجات', page: n => `ص. <bdi dir="ltr">${n}</bdi>`,
    issT: `العدد ${D.magazine.number} · ${D.magazine.month.ar}`, inIssue: 'في هذا العدد', readFull: `اقرأ العدد ${D.magazine.number}`,
    pagesL: 'صفحات العدد', spreadCap: 'صفحتا 2 و3 من العدد', pg: 'صفحة',
    dirT: 'دليل الشركات', dirM: `${D.companies.length} شركة معلنة في العدد ${D.magazine.number}`, dirBtn: 'افتح دليل الشركات',
    modT: 'منتجات وصناعات حديثة', modM: `${D.modern.length} منتجاً وصناعة في ${D.modernGroups.length} مجالات`, modBtn: 'كل الصناعات الحديثة',
    clubT: 'نادي رجال الأعمال', clubFig: [
      [num(D.club.members.count), 'عضواً في نادي رجال الأعمال'], [String(D.about.facts.years), D.about.facts.labels.years.ar],
      [String(D.about.facts.issues), D.about.facts.labels.issues.ar], [String(D.about.facts.since), D.about.facts.labels.since.ar]],
    join: 'انضم إلى نادي رجال الأعمال',
    artT: 'مقالات وأخبار', artM: `${D.articles.filter(a => a.fresh).length} مقالاً في العدد ${D.magazine.number} · ${D.news.length} خبراً`, artBtn: 'كل المقالات والأخبار', by: 'بقلم', news: 'الأخبار',
    conT: 'تواصل معنا', phoneL: 'الهاتف وواتساب', mailL: 'البريد الإلكتروني', addrL: 'العنوان', copyNum: 'انسخ الرقم',
    nlLine: 'أرسل كلمة «اشتراك» من بريدك إلى', nlCopy: 'انسخ العنوان', nlWrite: 'اكتب الرسالة',
    ftSec: 'الأقسام', ftCon: 'تواصل معنا', ftLang: 'اللغات', more: ['من نحن', 'أعلن معنا', 'الخصوصية'],
    rights: '© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة',
  },
  en: {
    lang: 'en', dir: 'ltr', o: 'en', title: 'Arab Asian Trade · Trade Bridge',
    issue: `Issue ${D.magazine.number} · ${D.magazine.month.en}`,
    langBtn: 'العربية', globe: 'Languages', sections: 'Sections', chat: '24-hour chat', ask: 'Ask AAT',
    nav: ['Home', 'Magazine', 'International exhibitions', 'Company directory', 'Products', 'Articles & news', 'AAT Business Club', 'Contact'],
    tabs: ['Magazine', 'Exhibitions', 'Products', 'Ask AAT'],
    h1: "From Asia's factories<br>to Arab and African markets", twin: 'من مصانع آسيا إلى أسواق العرب وأفريقيا', twinDir: 'rtl',
    searchPh: 'Search a show, a company or a product', searchBtn: 'Search',
    quick: ['Shows in the UAE', 'Packaging machines', 'Taiwan companies', 'Food shows'],
    k: [
      [num(shows.length), 'international exhibitions', '2027 – 2028'],
      [num(D.companies.length), 'advertisers', `in issue ${D.magazine.number}`],
      [num(prodAll), 'products', `from ${prodCos} companies`],
      [num(D.club.members.count), 'members', 'of the AAT Business Club'],
    ],
    photoCap: 'Sanitary mixer · Malaysia', photoSub: 'Modern products and industries',
    issueStamp: `Issue ${D.magazine.number}`, issueSub: `${D.magazine.month.en} · ${D.magazine.pages} pages`, read: 'Read the issue', pdf: 'PDF',
    lineCap: `The trade line: ${nCountries} countries · ${num(shows.length)} international exhibitions from January 2027`,
    showsW: n => `${num(n)} shows`,
    nearT: 'Next international exhibitions', nearM: `${num(shows.length)} shows in ${nCountries} countries · from January 2027`, nearBtn: 'All international exhibitions',
    cols: ['Dates', 'Exhibition', 'City and country', 'Field'],
    convT: `Advertisers' products in issue ${D.magazine.number}`, convM: `${prodAll} products from ${prodCos} companies`, convBtn: 'All products', page: n => `p. ${n}`,
    issT: `Issue ${D.magazine.number} · ${D.magazine.month.en}`, inIssue: 'In this issue (articles in Arabic)', readFull: `Read issue ${D.magazine.number}`,
    pagesL: 'Pages of the issue', spreadCap: 'Pages 2 and 3 of the issue', pg: 'Page',
    dirT: 'Company directory', dirM: `${D.companies.length} advertisers in issue ${D.magazine.number}`, dirBtn: 'Open the directory',
    modT: 'Modern products and industries', modM: `${D.modern.length} products and industries in ${D.modernGroups.length} fields`, modBtn: 'All modern industries',
    clubT: 'AAT Business Club', clubFig: [
      [num(D.club.members.count), 'members of the AAT Business Club'], [String(D.about.facts.years), D.about.facts.labels.years.en],
      [String(D.about.facts.issues), D.about.facts.labels.issues.en], [String(D.about.facts.since), D.about.facts.labels.since.en]],
    join: 'Join the AAT Business Club',
    artT: 'Articles & news', artM: `${D.news.length} news items · ${D.articles.filter(a => !a.fresh && a.title.en).length} articles in English`, artBtn: 'All articles and news', by: 'By', news: 'News',
    conT: 'Contact us', phoneL: 'Phone and WhatsApp', mailL: 'Email', addrL: 'Address', copyNum: 'Copy the number',
    nlLine: 'Send the word “Subscribe” from your e-mail to', nlCopy: 'Copy address', nlWrite: 'Write the e-mail',
    ftSec: 'Sections', ftCon: 'Contact us', ftLang: 'Languages', more: ['About us', 'Advertise with us', 'Privacy'],
    rights: '© 2026 Arab Asian Trade Group · All rights reserved',
  },
};

function dateStamp(s, t) {
  const m = MONTHS[t.lang];
  const [y1, m1, d1] = s.start.split('-').map(Number), [y2, m2, d2] = s.end.split('-').map(Number);
  if (s.approx) return `<span class="ds ds-m"><b>${m[m1 - 1]}</b><i>${y1}</i></span>`;
  if (m1 === m2) return `<span class="ds"><b dir="ltr">${d1 === d2 ? d1 : d1 + '–' + d2}</b><i>${m[m1 - 1]} ${y1}</i></span>`;
  return `<span class="ds ds-x"><b>${d1} ${m[m1 - 1]}</b><i>– ${d2} ${m[m2 - 1]} ${y2}</i></span>`;
}

function build(lang) {
  const t = T[lang], o = t.o, rtl = lang === 'ar';
  const L = v => (v && (v[o] || v.en || v.ar)) || '';
  const lt = s => `<bdi dir="ltr" class="lt">${esc(s)}</bdi>`;

  /* ---------------- header ---------------- */
  const names = `<span>التجارة العربية الآسيوية</span><span class="dot">·</span><span dir="ltr">Arab Asian Trade</span><span class="dot">·</span><span lang="zh-TW">中阿商業雜誌</span>`;
  const header = `
<a class="skip" href="#main">${rtl ? 'انتقل إلى المحتوى' : 'Skip to content'}</a>
<div class="ribbon"><div class="wrap ribbon-in">
  <p class="names">${names}</p>
  <p class="rib-issue">${esc(t.issue)}</p>
</div></div>
<header class="mast"><div class="wrap mast-in">
  <a class="logo" href="#home" aria-label="AAT · Arab Asian Trade"><img src="${IMG}img/brand/aat-logo-red.svg" alt="AAT · Ideas For Business" width="198" height="66"></a>
  <div class="group"><b>${esc(L(D.config.groupName))}</b><span>${esc(L(D.magazine.tagline))}</span></div>
  <div class="mast-end">
    <a class="ph" href="tel:${esc(D.config.tel)}"><span class="ph-ic">${ICON.phone}</span><bdi dir="ltr">${esc(D.config.phone)}</bdi></a>
    <a class="btn btn-line btn-s lang-btn" href="#" lang="${rtl ? 'en' : 'ar'}" dir="${rtl ? 'ltr' : 'rtl'}">${t.langBtn}</a>
    <button class="btn btn-line btn-s globe" type="button" aria-label="${t.globe}">${ICON.globe}<span>${t.globe}</span></button>
    <a class="btn btn-red btn-s chat" href="#">${ICON.chat}<span>${t.chat}</span></a>
    <button class="btn btn-navy btn-s secs" type="button">${ICON.menu}<span>${t.sections}</span></button>
  </div>
</div></header>
<nav class="navbar" aria-label="${t.sections}"><div class="wrap nav-in">
  <ul class="nav">${t.nav.map((n, i) => `<li><a href="#" ${i === 0 ? 'class="on" aria-current="page"' : ''}>${esc(n)}</a></li>`).join('')}</ul>
</div></nav>`;

  /* ---------------- opening board ---------------- */
  const stops = LINE.map(cc => `<li><a class="stop" href="#exhibitions-${cc}"><img src="${IMG}${C[cc].flag}" alt="" width="54" height="36"><b>${esc(C[cc][o])}</b><span>${t.showsW(C[cc].shows)}</span></a></li>`).join('');
  const counters = t.k.map(([n, a, b], i) => `<a class="kpi" href="#"><b>${n}</b><span>${esc(a)}</span><i>${/^[\d\s–-]+$/.test(b) ? `<bdi dir="ltr">${esc(b)}</bdi>` : esc(b)}</i></a>`).join('');
  const opening = `
<section class="open" id="home"><div class="wrap">
  <div class="open-grid">
    <div class="open-text">
      <h1>${t.h1}</h1>
      <p class="twin" dir="${t.twinDir}">${esc(t.twin)}</p>
      <p class="o-lead">${esc(L(D.about.claim))}</p>
      <form class="search" role="search" onsubmit="return false">
        <label class="sr" for="q">${t.searchPh}</label>
        <span class="s-ic">${ICON.search}</span>
        <input id="q" type="search" placeholder="${t.searchPh}">
        <button class="btn btn-red" type="submit">${t.searchBtn}</button>
      </form>
      <ul class="quick">${t.quick.map(q => `<li><a href="#">${esc(q)}</a></li>`).join('')}</ul>
      <div class="kpis">${counters}</div>
    </div>
    <div class="open-media">
      <figure class="photo"><img src="${IMG}img/modern/m5.jpg" alt="${esc(t.photoCap)}" width="1000" height="528">
        <figcaption><b>${esc(t.photoCap)}</b><span>${esc(t.photoSub)}</span></figcaption></figure>
      <div class="issue-card">
        <img class="cover" src="${IMG}${D.magazine.cover}" alt="${esc(t.issT)}" width="617" height="873">
        <div class="ic-body">
          <span class="stamp">${esc(t.issueStamp)}</span>
          <b class="ic-name">${esc(L(D.magazine.name))}</b>
          <span class="ic-sub">${esc(t.issueSub)}</span>
          <div class="ic-btns"><a class="btn btn-red" href="#">${t.read}</a><a class="btn btn-line" href="#"><bdi dir="ltr">${t.pdf}</bdi></a></div>
        </div>
      </div>
    </div>
  </div>
  <div class="tline">
    <p class="tl-cap"><span class="pulse" aria-hidden="true"></span>${esc(t.lineCap)}</p>
    <div class="tl-track"><span class="glint" aria-hidden="true"></span><ol class="stops">${stops}</ol></div>
  </div>
</div></section>`;

  /* ---------------- nearest shows ---------------- */
  const rows = dated.slice(0, 8).map(s => {
    const city = s.city ? (o === 'ar' && s.city.ar ? esc(s.city.ar) : lt(s.city.en)) : '';
    const f = fields[s.field];
    return `<a class="srow" href="#exhibition-${esc(s.id)}">
      <span class="c-date">${dateStamp(s, t)}</span>
      <span class="c-name"><b dir="ltr" class="ltb">${esc(s.name)}</b>${s.venue && s.venue.en ? `<span dir="ltr" class="ltb venue">${esc(s.venue.en)}</span>` : ''}</span>
      <span class="c-place"><img src="${IMG}${C[s.cc].flag}" alt="" width="40" height="27"><span><b>${city}</b><span>${esc(C[s.cc][o])}</span></span></span>
      <span class="c-field"><span class="tag">${esc(f[o])}</span></span>
    </a>`;
  }).join('');
  const byMonth = {};
  shows.forEach(x => { const k = x.start.slice(0, 7); byMonth[k] = (byMonth[k] || 0) + 1; });
  const months = Object.keys(byMonth).sort().slice(0, 6).map((k, i) => `<li><a href="#exhibitions" ${i === 0 ? 'class="on"' : ''}><b>${MONTHS[t.lang][+k.slice(5) - 1]} ${k.slice(0, 4)}</b><span>${num(byMonth[k])}</span></a></li>`).join('');
  const near = `
<section class="band paper" aria-labelledby="h-near"><div class="wrap">
  <div class="shead"><div><h2 id="h-near">${t.nearT}</h2><p class="meta">${t.nearM}</p></div><a class="btn btn-navy" href="#">${t.nearBtn}</a></div>
  <ul class="months">${months}</ul>
  <div class="board">
    <div class="b-head" aria-hidden="true">${t.cols.map(c => `<span>${c}</span>`).join('')}</div>
    ${rows}
  </div>
</div></section>`;

  /* ---------------- product conveyor ---------------- */
  const card = ({ c, p }) => {
    const og = origin(c);
    const place = og.cc ? `<img src="${IMG}${C[og.cc].flag}" alt="" width="27" height="18">` : '';
    return `<li><a class="pcard" href="#product-${c.id}-${p.k}" tabindex="-1">
      <span class="p-pic"><img src="${IMG}${p.img}" alt="${esc(p.n)}" loading="lazy" decoding="async"><span class="p-stamp">${t.page(c.id)}</span></span>
      <span class="p-name" dir="ltr">${esc(p.n)}</span>
      <span class="p-maker">${c.logo ? `<img src="${IMG}${c.logo}" alt="" loading="lazy">` : ''}<span dir="ltr">${esc(c.company)}</span></span>
      <span class="p-place">${place}<span>${esc(o === 'ar' ? og.ar : og.en)}</span></span>
    </a></li>`;
  };
  const track = pictured.map(card).join('');
  const conveyor = `
<section class="band floor" aria-labelledby="h-conv"><div class="wrap">
  <div class="shead"><div><h2 id="h-conv">${t.convT}</h2><p class="meta">${t.convM}</p></div><a class="btn btn-navy" href="#">${t.convBtn}</a></div>
</div>
  <div class="conv"><ul class="track">${track}${track.replace(/<li>/g, '<li aria-hidden="true">')}</ul></div>
</section>`;

  /* ---------------- the issue ---------------- */
  const tocRows = D.magazine.toc.articles.slice(0, 7).map(a => `<li><a href="#article"><span class="pgno">${t.page(a.page)}</span><span class="toc-t" ${o === 'en' ? 'dir="rtl" lang="ar"' : ''}>${esc(a.title.ar)}</span></a></li>`).join('');
  const thumbs = Array.from({ length: D.magazine.prototypePages }, (_, i) => i + 1).map(n => {
    const nn = String(n).padStart(3, '0');
    return `<li><a href="#flip-${n}"><img src="${IMG}img/mag560/t/p${nn}.jpg" alt="${t.pg} ${n}" width="220" height="311" loading="lazy"><span>${n}</span></a></li>`;
  }).join('');
  const issue = `
<section class="band night" aria-labelledby="h-issue"><div class="wrap">
  <div class="iss-grid">
    <figure class="spread">
      <div class="pages"><img src="${IMG}img/mag560/p002.jpg" alt="${t.pg} 2" width="1100" height="1555" loading="lazy"><img src="${IMG}img/mag560/p003.jpg" alt="${t.pg} 3" width="1100" height="1555" loading="lazy"></div>
      <figcaption>${t.spreadCap}</figcaption>
    </figure>
    <div class="iss-text">
      <h2 id="h-issue">${t.issT}</h2>
      <p class="iss-lead">${esc(L(D.magazine.coverText))}</p>
      <div class="btnrow"><a class="btn btn-red" href="#">${t.readFull}</a><a class="btn btn-ghost" href="#"><bdi dir="ltr">${t.pdf}</bdi></a></div>
      <h3>${t.inIssue}</h3>
      <ol class="toc">${tocRows}</ol>
    </div>
  </div>
  <h3 class="thumbs-t">${t.pagesL}</h3>
  <ol class="thumbs">${thumbs}</ol>
</div></section>`;

  /* ---------------- company directory ---------------- */
  const cells = D.companies.map(c => {
    const og = origin(c);
    const logo = c.logo ? `<img src="${IMG}${c.logo}" alt="${esc(c.company)}" loading="lazy">` : `<span class="typeset" dir="ltr">${esc(c.company.replace(/ (Co\.|Corp\.|Technologies|Electronic|Plastic|Industry|Industrial|·).*$/, '').trim())}</span>`;
    const nm = o === 'ar' && c.nameAr ? `<b class="co-ar">${esc(c.nameAr)}</b><span class="co-lt" dir="ltr">${esc(c.company)}</span>` : `<b class="co-lt" dir="ltr">${esc(c.company)}</b>`;
    return `<li><a class="co" href="#company-${c.id}"><span class="co-logo">${logo}</span>${nm}<span class="co-city">${og.cc ? `<img src="${IMG}${C[og.cc].flag}" alt="" width="27" height="18">` : ''}<span>${esc(o === 'ar' ? og.ar : og.en)}</span></span><span class="co-pg">${t.page(pagesLabel(c.pages))}</span></a></li>`;
  }).join('');
  const directory = `
<section class="band paper" aria-labelledby="h-dir"><div class="wrap">
  <div class="shead"><div><h2 id="h-dir">${t.dirT}</h2><p class="meta">${t.dirM}</p></div><a class="btn btn-navy" href="#">${t.dirBtn}</a></div>
  <ul class="cos">${cells}</ul>
</div></section>`;

  /* ---------------- modern industries ---------------- */
  const GPIC = { pack: 'img/modern/m2.jpg', food: 'img/modern/m20.jpg', plastic: 'img/modern/m10.jpg', health: 'img/modern/m0.jpg', metal: 'img/modern/m12.jpg', home: 'img/modern/m16.jpg' };
  const mcards = D.modernGroups.map(g => {
    const items = D.modern.filter(m => m.group === g.id).slice(0, 3);
    return `<li><a class="mcard" href="#modern-${g.id}"><span class="m-pic"><img src="${IMG}${GPIC[g.id]}" alt="" loading="lazy"></span>
      <span class="m-body"><span class="m-head"><b>${esc(g.name[o] || g.name.en)}</b><i>${g.count}</i></span>
      <span class="m-items">${items.map(m => `<span ${o === 'ar' ? '' : 'dir="ltr"'}>${esc(o === 'ar' ? m.name.ar.replace(/\s*[A-Za-z].*$/, '').trim() : m.name.en)}</span>`).join('')}</span></span></a></li>`;
  }).join('');
  const modern = `
<section class="band floor" aria-labelledby="h-mod"><div class="wrap">
  <div class="shead"><div><h2 id="h-mod">${t.modT}</h2><p class="meta">${t.modM}</p></div><a class="btn btn-navy" href="#">${t.modBtn}</a></div>
  <ul class="mods">${mcards}</ul>
</div></section>`;

  /* ---------------- club ---------------- */
  const club = `
<section class="band night club" aria-labelledby="h-club"><div class="wrap club-grid">
  <div class="club-seal">${seal(300)}</div>
  <div class="club-text">
    <h2 id="h-club">${t.clubT}</h2>
    <p class="club-lead">${esc(L(D.club.lead))}</p>
    <ul class="figs">${t.clubFig.map(([n, l]) => `<li><b>${n}</b><span>${esc(l)}</span></li>`).join('')}</ul>
    <ol class="bens">${D.club.benefits.slice(0, 4).map(b => `<li><span class="bn">${String(b.n).padStart(2, '0')}</span><span>${o === 'ar' ? arx(b.ar) : esc(b.en)}</span></li>`).join('')}</ol>
    <div class="btnrow"><a class="btn btn-red" href="#">${t.join}</a><a class="btn btn-ghost" href="#">${esc(L(D.club.join.more))}</a></div>
  </div>
</div></section>`;

  /* ---------------- articles & news ---------------- */
  let artHTML;
  if (o === 'ar') {
    const A = id => D.articles.find(a => a.id === id);
    const lead = A('ar26-5'), s1 = A('ar26-6'), s2 = A('ar26-1');
    const newsRows = ['n0', 'n2', 'n6', 'n7'].map(id => D.news.find(n => n.id === id)).map(n => `<li><a class="nrow" href="#news-${n.id}"><img src="${IMG}${n.img}" alt="" loading="lazy"><span><b>${arx(n.title.ar)}</b>${n.date ? `<i>${+n.date.slice(8)} ${MONTHS.ar[+n.date.slice(5, 7) - 1]} ${n.date.slice(0, 4)}</i>` : ''}</span></a></li>`).join('');
    const small = a => `<a class="acard small" href="#article-${a.id}"><span class="a-pic"><img src="${IMG}${a.img}" alt="" loading="lazy"></span><span class="a-body"><b>${esc(a.title.ar)}</b><i>${a.author ? esc(t.by + ' ' + a.author) + ' · ' : ''}${t.page(a.magPage)}</i></span></a>`;
    artHTML = `<div class="arts"><div class="arts-main">
      <a class="acard lead" href="#article-${lead.id}"><span class="a-pic"><img src="${IMG}${lead.img}" alt="" loading="lazy"></span><span class="a-body"><b>${esc(lead.title.ar)}</b><span class="a-sum">${esc(lead.summary.ar)}</span><i>${t.page(lead.magPage)}</i></span></a>
      <div class="arts-pair">${small(s1)}${small(s2)}</div></div>
      <div class="arts-news"><h3>${t.news}</h3><ul>${newsRows}</ul></div></div>`;
  } else {
    const N = id => D.news.find(n => n.id === id);
    const lead = N('n2'), s1 = N('n0'), s2 = N('n1');
    const fmt = n => n.date ? `${+n.date.slice(8)} ${MONTHS.en[+n.date.slice(5, 7) - 1]} ${n.date.slice(0, 4)}` : '';
    const small = n => `<a class="acard small" href="#news-${n.id}"><span class="a-pic"><img src="${IMG}${n.img}" alt="" loading="lazy"></span><span class="a-body"><b>${esc(n.title.en)}</b><i>${fmt(n)}</i></span></a>`;
    const arts = D.articles.filter(a => !a.fresh && a.title.en).slice(0, 4);
    artHTML = `<div class="arts"><div class="arts-main">
      <a class="acard lead" href="#news-${lead.id}"><span class="a-pic"><img src="${IMG}${lead.img}" alt="" loading="lazy"></span><span class="a-body"><b>${esc(lead.title.en)}</b><span class="a-sum">${esc(lead.body.en[0])}</span><i>${fmt(lead)}</i></span></a>
      <div class="arts-pair">${small(s1)}${small(s2)}</div></div>
      <div class="arts-news"><h3>Articles</h3><ul>${arts.map(a => `<li><a class="nrow txt" href="#article-${a.id}"><span><b>${esc(a.title.en)}</b>${a.author ? `<i>${esc('By ' + a.author.replace(/^[^(]*\(([^)]+)\).*$/, '$1').replace(/[؀-ۿ]/g, '').trim())}</i>` : ''}</span></a></li>`).join('')}</ul></div></div>`;
  }
  const articles = `
<section class="band paper" aria-labelledby="h-art"><div class="wrap">
  <div class="shead"><div><h2 id="h-art">${t.artT}</h2><p class="meta">${t.artM}</p></div><a class="btn btn-navy" href="#">${t.artBtn}</a></div>
  ${artHTML}
</div></section>`;

  /* ---------------- contact band + footer ---------------- */
  const contact = `
<section class="band floor" aria-labelledby="h-con"><div class="wrap">
  <div class="shead"><div><h2 id="h-con">${t.conT}</h2></div></div>
  <div class="con-grid">
    <div class="con-card"><h3>${t.phoneL}</h3><a class="big-ph" href="tel:${esc(D.config.tel)}"><bdi dir="ltr">${esc(D.config.phone)}</bdi></a>${apps(t)}</div>
    <div class="con-card"><h3>${t.mailL}</h3><a class="mail" href="mailto:${D.config.email}">${ICON.mail}<bdi dir="ltr">${D.config.email}</bdi></a>
      <h3>${t.addrL}</h3><p class="addr" dir="ltr">${ICON.pin}<span>${esc(D.config.address.en)}</span></p></div>
    <div class="con-card"><h3>${esc(L(D.config.newsletter.title))}</h3><p>${t.nlLine}</p><a class="mail" href="mailto:${D.config.email}">${ICON.mail}<bdi dir="ltr">${D.config.email}</bdi></a>
      <div class="btnrow"><a class="btn btn-red" href="#">${t.nlWrite}</a><button class="btn btn-line" type="button">${t.nlCopy}</button></div></div>
  </div>
</div></section>`;
  const footer = `
<footer class="foot"><div class="wrap">
  <div class="f-top">
    <div class="f-brand"><img src="${IMG}img/brand/aat-logo-white.svg" alt="AAT · Ideas For Business" width="216" height="72">
      <p class="f-names">${names}</p><p class="f-claim">${esc(L(D.about.claim))}</p></div>
    <div><h3>${t.ftSec}</h3><ul class="f-links">${t.nav.concat(t.more).map(n => `<li><a href="#">${esc(n)}</a></li>`).join('')}</ul></div>
    <div><h3>${t.ftCon}</h3><a class="f-ph" href="tel:${esc(D.config.tel)}"><bdi dir="ltr">${esc(D.config.phone)}</bdi></a>
      <a class="f-mail" href="mailto:${D.config.email}"><bdi dir="ltr">${D.config.email}</bdi></a><p class="f-addr" dir="ltr">${esc(D.config.address.en)}</p></div>
    <div><h3>${t.ftLang}</h3><ul class="f-links">${D.config.languages.map(l => `<li><a href="#" lang="${l.code}" dir="${l.dir}">${esc(l.name)}</a></li>`).join('')}</ul></div>
  </div>
  <p class="f-rights">${t.rights}</p>
</div></footer>
<nav class="tabbar" aria-label="${t.sections}">
  <a href="#">${ICON.book}<span>${t.tabs[0]}</span></a><a href="#">${ICON.cal}<span>${t.tabs[1]}</span></a><a href="#">${ICON.box}<span>${t.tabs[2]}</span></a><a href="#" class="ask">${ICON.chat}<span>${rtl ? arx(t.tabs[3]) : esc(t.tabs[3])}</span></a>
</nav>`;

  const css = fs.readFileSync(path.join(HERE, 'tile.css'), 'utf8');
  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Changa:wght@500..800&family=Readex+Pro:wght@400..700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&text=%E4%B8%AD%E9%98%BF%E5%95%86%E6%A5%AD%E9%9B%9C%E8%AA%8C&display=swap">
<style>
${css}
</style>
</head>
<body>
${header}
<main id="main">
${opening}
${near}
${conveyor}
${issue}
${directory}
${modern}
${club}
${articles}
${contact}
</main>
${footer}
</body>
</html>
`;
}

for (const lang of ['ar', 'en']) {
  fs.writeFileSync(path.join(HERE, `tile-${lang}.html`), build(lang));
  console.log('wrote tile-' + lang + '.html');
}
