// Builds tile-ar.html and tile-en.html for the "Trade Floor" concept from the shared data package.
// node build-tile.js
const fs = require('fs');
const path = require('path');
const D = require('/home/user/AATWORLD-1/_work/site-v3/data/data.json');
const OUT = __dirname;
const IMG = '../../img/'; // relative from concepts/exchange/ to _work/site-v3/img/

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = n => Number(n).toLocaleString('en-US');

const MONTHS = {
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

function fmtDate(s, L) {
  const [y1, m1, d1] = s.start.split('-').map(Number);
  const [y2, m2, d2] = s.end.split('-').map(Number);
  const M = MONTHS[L];
  if (s.approx) return { main: M[m1 - 1] + ' ' + y1, month: true };
  if (m1 === m2) return { main: (d1 === d2 ? String(d1) : d1 + '–' + d2), tail: M[m1 - 1] + ' ' + y1 };
  return { main: d1 + ' ' + M[m1 - 1] + ' – ' + d2 + ' ' + M[m2 - 1], tail: String(y2) };
}

const T = {
  ar: {
    dir: 'rtl', lang: 'ar', other: 'English', otherHref: 'tile-en.html',
    searchPh: 'ابحث عن معرض أو مصنع أو منتج…', search: 'ابحث', contact: 'تواصل معنا', phone: '+886 966 404681',
    nav: ['الرئيسية', 'معارض دولية', 'دليل المصانع', 'المنتجات', 'المجلة', 'نادي رجال الأعمال', 'الأخبار والمقالات', 'من نحن'],
    tabs: ['الرئيسية', 'معارض', 'مصانع', 'منتجات', 'المجلة'],
    h1a: 'سوق التجارة العربية الآسيوية',
    h1b: 'اعثر على معرض أو مصنع أو منتج في ثوانٍ',
    lead: 'مجلة التجارة العربية الآسيوية تنقل مصانع آسيا إلى مستوردي العالم العربي وأفريقيا منذ 1982. كل ما يحتاجه المشتري هذا الأسبوع في لوحة واحدة.',
    stats: [['معرضاً دولياً', '2027 – 2028'], ['مصنعاً معلناً', 'في العدد 560'], ['منتجاً', 'بصور وبيانات المصنع'], ['عضواً', 'في نادي رجال الأعمال']],
    issue: 'العدد 560', issueMonth: 'أكتوبر 2026', pages: '100 صفحة', read: 'اقرأ العدد', pdf: 'PDF',
    secShows: 'أقرب المعارض', showsCount: n => nf(n) + ' معرضاً من يناير 2027', allShows: 'كل المعارض الدولية', allCountries: 'كل الدول',
    cols: ['التاريخ', 'المعرض', 'المدينة', 'الدولة', 'المجال'], monthOnly: 'الشهر فقط',
    showing: (a, b) => 'عرض ' + a + ' من ' + nf(b) + ' معرضاً',
    secShelf: 'منتجات المصانع المعلنة', shelfCount: n => nf(n) + ' منتجاً من ' + '35 مصنعاً', allProducts: 'كل المنتجات',
    secSup: 'دليل المصانع', supCount: n => nf(n) + ' مصنعاً معلناً في العدد 560', allSup: 'الدليل الكامل', supMore: 'بقية المصانع',
    secMag: 'المجلة · العدد 560', contents: 'في هذا العدد', ads: 'معلناً', articles: 'مقالات',
    assistant: 'مساعد AAT', assistant2: 'محادثة 24 ساعة',
    fGroup: 'مجموعة التجارة العربية الآسيوية', fGroupEn: 'Arab Asian Trade Group', fZh: '中阿商業雜誌',
    fSince: 'مجلة تجارية مطبوعة وإلكترونية منذ 1982 · تنقل مصانع آسيا إلى مستوردي العالم العربي وأفريقيا.',
    fNav: 'تصفّح', fContact: 'تواصل معنا', fPhone: 'الهاتف · واتساب', fEmail: 'البريد الإلكتروني', fAddr: 'العنوان', fApps: 'الرقم نفسه على',
    rights: '© 2026 AAT (Arab Asian Trade) · جميع الحقوق محفوظة', tagline: 'Ideas For Business',
    page: 'صفحة'
  },
  en: {
    dir: 'ltr', lang: 'en', other: 'العربية', otherHref: 'tile-ar.html',
    searchPh: 'Search a show, a factory or a product…', search: 'Search', contact: 'Contact us', phone: '+886 966 404681',
    nav: ['Home', 'International exhibitions', 'Factory directory', 'Products', 'Magazine', 'Business Club', 'News & articles', 'About'],
    tabs: ['Home', 'Shows', 'Factories', 'Products', 'Magazine'],
    h1a: 'The Arab Asian trade floor',
    h1b: 'Find a show, a factory or a product in seconds',
    lead: 'Arab Asian Trade magazine has carried Asia’s factories to Arab and African importers since 1982. Everything a buyer needs this week, on one board.',
    stats: [['international shows', '2027 – 2028'], ['advertising factories', 'in issue 560'], ['products', 'with pictures and maker data'], ['members', 'of the AAT Business Club']],
    issue: 'Issue 560', issueMonth: 'October 2026', pages: '100 pages', read: 'Read the issue', pdf: 'PDF',
    secShows: 'Nearest shows', showsCount: n => nf(n) + ' shows from January 2027', allShows: 'All international exhibitions', allCountries: 'All countries',
    cols: ['Date', 'Show', 'City', 'Country', 'Field'], monthOnly: 'month only',
    showing: (a, b) => 'Showing ' + a + ' of ' + nf(b) + ' shows',
    secShelf: 'Products of the advertising factories', shelfCount: n => nf(n) + ' products from 35 factories', allProducts: 'All products',
    secSup: 'Factory directory', supCount: n => nf(n) + ' advertising factories in issue 560', allSup: 'Full directory', supMore: 'More factories',
    secMag: 'Magazine · Issue 560', contents: 'In this issue', ads: 'advertisers', articles: 'articles',
    assistant: 'AAT Assistant', assistant2: '24-hour chat',
    fGroup: 'Arab Asian Trade Group', fGroupEn: 'مجموعة التجارة العربية الآسيوية', fZh: '中阿商業雜誌',
    fSince: 'A printed and online trade magazine since 1982 · carrying Asia’s factories to Arab and African importers.',
    fNav: 'Browse', fContact: 'Contact us', fPhone: 'Phone · WhatsApp', fEmail: 'Email', fAddr: 'Address', fApps: 'Same number on',
    rights: '© 2026 AAT (Arab Asian Trade) · All rights reserved', tagline: 'Ideas For Business',
    page: 'page'
  }
};

// ---------- data slices ----------
const shows = D.shows.slice().sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
// prefer rows with a known day first within January so the board shows real dates; keep month-only rows too
const janDay = shows.filter(s => s.start.startsWith('2027-01') && !s.approx).slice(0, 7);
const janMonth = shows.filter(s => s.start.startsWith('2027-01') && s.approx).slice(0, 3);
const boardRows = janMonth.concat(janDay).sort((a, b) => a.start.localeCompare(b.start));
const countries = Object.entries(D.countries).map(([cc, c]) => ({ cc, ...c })).filter(c => c.shows > 0).sort((a, b) => b.shows - a.shows);
const companies = D.companies;
const products = [];
companies.forEach(c => c.products.forEach(p => { if (p.img) products.push({ ...p, company: c }); }));
const totalProducts = companies.reduce((n, c) => n + c.products.length, 0);
const shelf = products.filter(p => p.company.logo).slice(0, 18);
const supShown = companies.slice(0, 18);

const flag = c => `<img class="flag" src="${IMG}${c.flag.replace(/^img\//, '')}" alt="">`;

function page(L) {
  const t = T[L];
  const navHtml = t.nav.map((n, i) => `<a href="#" class="${i === 0 ? 'on' : ''}">${esc(n)}</a>`).join('');
  const countryHtml = countries.map(c => `<a href="#" class="cty"><span class="cty-flag">${flag(c)}</span><span class="cty-name">${esc(c[L])}</span><span class="cty-n num">${nf(c.shows)}</span></a>`).join('');
  const rowsHtml = boardRows.map(s => {
    const d = fmtDate(s, L);
    const city = s.city[L] || s.city.en || '';
    const c = D.countries[s.cc];
    const f = D.fields.find(f => f.id === s.field);
    const dateCell = d.month
      ? `<span class="d-main mark">${esc(d.main)}</span><span class="d-note">${esc(t.monthOnly)}</span>`
      : `<span class="d-main num"><bdi dir="ltr">${esc(d.main)}</bdi></span><span class="d-tail">${esc(d.tail)}</span>`;
    return `<a href="#" class="row">
      <span class="c-date">${dateCell}</span>
      <span class="c-name"><bdi dir="ltr">${esc(s.name)}</bdi>${s.venue.en ? `<span class="venue"><bdi dir="ltr">${esc(s.venue.en)}</bdi></span>` : ''}</span>
      <span class="c-city">${city ? `<bdi>${esc(city)}</bdi>` : ''}</span>
      <span class="c-cty">${flag(c)}<span>${esc(c[L])}</span></span>
      <span class="c-field"><span class="chip">${esc(f[L])}</span></span>
    </a>`;
  }).join('');
  const shelfTile = p => {
    const c = p.company;
    return `<a href="#" class="ptile">
      <span class="pimg"><img src="${IMG}${p.img.replace(/^img\//, '')}" alt=""></span>
      <span class="pname"><bdi dir="ltr">${esc(p.n)}</bdi></span>
      <span class="pco"><img src="${IMG}${c.logo.replace(/^img\//, '')}" alt=""><bdi dir="ltr">${esc(c.company)}</bdi></span>
    </a>`;
  };
  const shelfHtml = shelf.map(shelfTile).join('');
  const supHtml = supShown.map(c => {
    const name = L === 'ar' && c.nameAr ? c.nameAr : c.company;
    const logo = c.logo ? `<img src="${IMG}${c.logo.replace(/^img\//, '')}" alt="">` : `<span class="noLogo"><bdi dir="ltr">${esc(c.company.replace(/\s*\(.*\)\s*$/, ''))}</bdi></span>`;
    const cat = D.cats[c.cat] ? D.cats[c.cat][L] : '';
    const city = c.city ? (c.city[L] || c.city.en) : '';
    const sub = L === 'ar' && c.nameAr && c.logo ? `<span class="s-en"><bdi dir="ltr">${esc(c.company)}</bdi></span>` : '';
    // without a logo the Latin name already sits large in the logo area: show only the Arabic name under it (if any)
    const nameLine = c.logo ? `<span class="sname"><bdi>${esc(name)}</bdi></span>` : (L === 'ar' && c.nameAr ? `<span class="sname"><bdi>${esc(c.nameAr)}</bdi></span>` : '');
    return `<a href="#" class="stile">
      <span class="slogo">${logo}</span>
      ${nameLine}${sub}
      <span class="smeta"><span>${esc(city)}</span><span class="dot"></span><span>${esc(cat)}</span></span>
      <span class="scount num">${c.products.length ? nf(c.products.length) + (L === 'ar' ? ' منتجات' : ' products') : (L === 'ar' ? 'صفحة ' + c.page : 'page ' + c.page)}</span>
    </a>`;
  }).join('');

  const tabIcons = [
    '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9H3z"/><path d="M10 20v-6h4v6"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M3 21V9l6 4V9l6 4V5h6v16z"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z"/></svg>'
  ];
  const tabsHtml = t.tabs.map((n, i) => `<a href="#" class="${i === 0 ? 'on' : ''}">${tabIcons[i]}<span>${esc(n)}</span></a>`).join('');

  const toc = D.magazine.toc.articles.slice(0, 6).map(a => `<li><span class="num pg">${a.page}</span><span>${esc(a.title.ar)}</span></li>`).join('');

  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AAT Trade Floor</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&family=Archivo:wdth,wght@75..125,500..900&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#0F2238; --navy:#1B3657; --signal:#D21F26; --deep:#9E1419; --paper:#FFFFFF; --floor:#EEF1F4; --rule:#C7CED6; --slate:#4A5868; --mark:#FFE873;
  --ar:"Readex Pro", "Segoe UI", Tahoma, sans-serif; --lat:"Archivo", "Readex Pro", Arial, sans-serif;
  --w:1760px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--floor)}
body{font-family:var(--ar);color:var(--ink);background:var(--paper);font-size:18px;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
bdi{unicode-bidi:isolate}
.num{font-family:var(--lat);font-variant-numeric:tabular-nums;font-weight:700}
.wrap{max-width:var(--w);margin:0 auto;padding:0 32px}

/* ---------- header: white top bar + navy rail ---------- */
.top{background:var(--paper);border-bottom:1px solid var(--rule)}
.top .wrap{display:flex;align-items:center;gap:28px;min-height:96px}
.logo img{height:60px;width:auto}
.search{flex:1;display:flex;border:2px solid var(--ink);border-radius:4px;background:var(--paper);min-height:60px;overflow:hidden}
.search input{flex:1;border:0;font:500 20px/1.4 var(--ar);padding:0 20px;color:var(--ink);min-width:0;background:transparent}
.search input::placeholder{color:var(--slate);opacity:1}
.search button{border:0;background:var(--signal);color:#fff;font:700 20px var(--ar);padding:0 28px;cursor:pointer;display:flex;align-items:center;gap:10px}
.search button svg{width:24px;height:24px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:56px;padding:0 24px;border-radius:4px;font:700 20px/1.2 var(--ar);border:2px solid var(--ink);color:var(--ink);background:var(--paper);white-space:nowrap;cursor:pointer}
.btn.red{background:var(--signal);border-color:var(--signal);color:#fff}
.btn.red:hover{background:var(--deep);border-color:var(--deep)}
.btn.ink{background:var(--ink);border-color:var(--ink);color:#fff}
.btn.ghost{background:transparent;border-color:#fff;color:#fff}
.btn .num{font-size:20px}
.lang{display:flex;align-items:center;gap:10px}
.lang .btn{min-height:52px}
.globe{width:52px;height:52px;border:2px solid var(--ink);border-radius:4px;display:flex;align-items:center;justify-content:center}
.globe svg{width:26px;height:26px;fill:none;stroke:var(--ink);stroke-width:2}
.menuBtn{display:none}
.rail{background:var(--navy)}
.rail .wrap{display:flex;flex-wrap:wrap;gap:0 8px}
.rail a{display:block;color:#fff;font:600 20px/1.2 var(--ar);padding:19px 18px 15px;border-bottom:5px solid transparent}
.rail a.on{border-bottom-color:var(--signal)}
.rail a:hover{background:rgba(255,255,255,.08)}
[dir=ltr] .rail a{font-family:var(--lat);font-weight:700;font-stretch:95%;font-size:20px;letter-spacing:.01em}

/* ---------- opening board ---------- */
.open{background:var(--ink);color:#fff}
.open .wrap{display:grid;grid-template-columns:1fr 420px;gap:48px;padding-top:56px;padding-bottom:56px;align-items:center}
.open h1{font:700 48px/1.3 var(--ar);margin-bottom:8px}
.open h1 span{display:block;color:#fff}
.open h1 .b{font-size:34px;font-weight:600;line-height:1.4;margin-top:6px;opacity:.95}
[dir=ltr] .open h1{font-family:var(--lat);font-weight:800;font-stretch:92%;font-size:56px;line-height:1.1}
[dir=ltr] .open h1 .b{font-family:var(--ar);font-weight:500;font-size:30px;font-stretch:100%}
.open p.lead{font-size:20px;line-height:1.75;max-width:900px;margin:14px 0 28px;color:#E6ECF3}
.bigsearch{display:flex;background:#fff;border-radius:4px;overflow:hidden;min-height:76px;max-width:980px;border:3px solid #fff}
.bigsearch input{flex:1;border:0;font:500 22px var(--ar);padding:0 24px;color:var(--ink);min-width:0}
.bigsearch input::placeholder{color:var(--slate);opacity:1}
.bigsearch button{border:0;background:var(--signal);color:#fff;font:700 22px var(--ar);padding:0 36px;cursor:pointer}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:32px;max-width:980px}
.stat{background:#fff;color:var(--ink);border-radius:4px;padding:18px 20px 16px;border-top:6px solid var(--signal)}
.stat .n{font:800 44px/1 var(--lat);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.stat .l{font:700 18px/1.3 var(--ar);margin-top:8px}
.stat .s{font:400 16px/1.4 var(--ar);color:var(--slate);margin-top:2px}
.issue{position:relative;background:#fff;border-radius:4px;padding:20px;color:var(--ink);display:grid;grid-template-columns:150px 1fr;gap:20px;align-items:center}
.issue img{width:150px;border:1px solid var(--rule)}
.stamp{display:inline-block;border:3px solid var(--signal);color:var(--signal);font:800 20px/1.1 var(--lat);text-transform:uppercase;letter-spacing:.06em;padding:8px 10px;border-radius:3px;transform:rotate(-4deg);margin-bottom:12px}
[dir=rtl] .stamp{font-family:var(--ar);font-weight:700;text-transform:none;letter-spacing:0;transform:rotate(4deg)}
.issue .t{font:700 22px/1.35 var(--ar)}
.issue .m{font:500 18px/1.4 var(--ar);color:var(--slate);margin:4px 0 14px}
.issue .acts{display:flex;gap:10px;flex-wrap:wrap}
.issue .btn{min-height:48px;font-size:18px;padding:0 18px}

/* ---------- sections ---------- */
.sec{padding:48px 0 56px}
.sec.floor{background:var(--floor)}
.sec-head{border-top:4px solid var(--ink);padding-top:22px;margin-bottom:26px;display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap}
.sec-head h2{font:700 38px/1.25 var(--ar);display:flex;align-items:center;gap:16px}
[dir=ltr] .sec-head h2{font-family:var(--lat);font-weight:800;font-stretch:92%;font-size:42px;line-height:1.1}
.sec-head h2::before{content:"";width:18px;height:18px;background:var(--signal);flex:none}
.sec-head .cnt{font:500 18px/1.4 var(--ar);color:var(--slate);margin-top:8px;padding-inline-start:34px}
.sec-head .acts{display:flex;gap:12px;flex-wrap:wrap}

/* countries strip */
.ctys{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px}
.cty{display:inline-flex;align-items:center;gap:10px;border:2px solid var(--rule);border-radius:4px;padding:8px 14px 8px 10px;background:#fff;min-height:52px}
[dir=rtl] .cty{padding:8px 10px 8px 14px}
.cty:hover{border-color:var(--ink)}
.cty.on{border-color:var(--ink);background:var(--ink);color:#fff}
.cty-name{font:600 18px/1 var(--ar)}
.cty-n{font-size:17px;color:var(--slate);background:var(--floor);border-radius:3px;padding:3px 7px}
.cty.on .cty-n{color:#fff;background:rgba(255,255,255,.18)}
.flag{width:30px;height:21px;object-fit:cover;border:1px solid var(--rule);border-radius:2px;flex:none}

/* board (table of shows) */
.board{border:2px solid var(--ink);border-radius:4px;overflow:hidden;background:#fff}
.board .hd,.board .row{display:grid;grid-template-columns:230px minmax(0,1fr) 200px 220px 280px;gap:0 20px;align-items:center;padding:0 22px}
.board .hd{background:var(--navy);color:#fff;font:700 18px/1.2 var(--ar);min-height:56px}
.board .row{min-height:76px;padding-top:12px;padding-bottom:12px;border-top:1px solid var(--rule);font-size:19px;line-height:1.45}
.board .row:nth-child(even){background:#F8FAFC}
.board .row:hover{background:var(--floor)}
.c-date{display:flex;flex-direction:column;gap:2px}
.d-main{font:700 21px/1.25 var(--lat);font-variant-numeric:tabular-nums}
[dir=rtl] .d-main{font-family:var(--ar)}
.d-main.mark{display:inline-block;background:var(--mark);padding:2px 8px;border-radius:3px;align-self:flex-start;font-family:var(--ar)}
.d-tail{font:500 17px/1.3 var(--ar);color:var(--slate)}
.d-note{font:400 16px/1.3 var(--ar);color:var(--slate)}
.c-name{font:700 20px/1.35 var(--lat);display:flex;flex-direction:column;gap:2px;min-width:0}
.c-name .venue{font:400 16px/1.35 var(--ar);color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c-city{font:500 18px/1.3 var(--ar);color:var(--slate)}
.c-cty{display:flex;align-items:center;gap:10px;font:600 18px/1.2 var(--ar)}
.chip{display:inline-block;border:2px solid var(--rule);border-radius:3px;padding:5px 10px;font:500 16px/1.25 var(--ar);color:var(--ink);background:#fff}
.board-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:18px;font:500 18px var(--ar);color:var(--slate)}

/* conveyor shelf */
.belt{overflow:hidden;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);background:#fff;padding:18px 0}
.track{display:flex;gap:16px;width:max-content;animation:belt 70s linear infinite}
[dir=rtl] .track{animation-name:belt-rtl}
.belt:hover .track{animation-play-state:paused}
@keyframes belt{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes belt-rtl{from{transform:translateX(0)}to{transform:translateX(50%)}}
.ptile{width:300px;flex:none;border:2px solid var(--rule);border-radius:4px;background:#fff;display:flex;flex-direction:column;overflow:hidden;direction:ltr;text-align:left}
.ptile>*{min-width:0}
.pco bdi{display:block;min-width:0}
.ptile:hover{border-color:var(--ink)}
.pimg{height:210px;display:flex;align-items:center;justify-content:center;background:#fff;border-bottom:1px solid var(--rule);padding:10px}
.pimg img{max-height:100%;max-width:100%;object-fit:contain}
.pname{font:700 18px/1.4 var(--lat);padding:0 14px;margin:12px 0 6px;max-height:50px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-align:start}
.pco{display:flex;align-items:center;gap:10px;padding:4px 14px 14px;font:500 16px/1.3 var(--lat);color:var(--slate)}
.pco img{height:34px;width:60px;object-fit:contain;border:1px solid var(--rule);border-radius:3px;padding:2px;background:#fff;flex:none}
.pco bdi{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* supplier grid */
.sgrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}
.stile{border:2px solid var(--rule);border-radius:4px;background:#fff;padding:16px 16px 14px;display:flex;flex-direction:column;gap:4px;min-height:260px;min-width:0}
.stile>*{min-width:0;max-width:100%}
.s-en{display:block}
.stile:hover{border-color:var(--ink)}
.slogo{height:92px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.slogo img{max-height:84px;max-width:100%;object-fit:contain}
.noLogo{font:800 24px/1.15 var(--lat);font-stretch:90%;color:var(--ink);text-align:center}
.sname{font:700 18px/1.4 var(--ar);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
[dir=ltr] .sname{font-family:var(--lat)}
.s-en{font:500 16px/1.3 var(--lat);color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:start}
[dir=rtl] .s-en,[dir=rtl] .c-name .venue{text-align:right}
.c-name .venue{direction:ltr}
.smeta{font:400 16px/1.4 var(--ar);color:var(--slate);display:flex;flex-wrap:wrap;gap:0 8px;align-items:center;margin-top:auto;padding-top:8px}
.dot{width:5px;height:5px;background:var(--rule);border-radius:50%;display:inline-block}
.scount{font-size:16px;color:var(--ink);margin-top:4px;font-family:var(--ar)}

/* magazine strip */
.magstrip{display:grid;grid-template-columns:220px 1fr auto;gap:32px;align-items:start;border:2px solid var(--ink);border-radius:4px;padding:24px;background:#fff}
.magstrip img{width:220px;border:1px solid var(--rule)}
.magstrip h3{font:700 24px/1.3 var(--ar);margin-bottom:10px}
.magstrip ol{list-style:none;columns:2;column-gap:32px}
.magstrip li{display:flex;gap:12px;font:500 18px/1.5 var(--ar);padding:6px 0;border-bottom:1px solid var(--rule);break-inside:avoid}
.magstrip .pg{color:var(--signal);min-width:34px;font-size:18px}
.magstrip .acts{display:flex;flex-direction:column;gap:10px}

/* assistant */
.assist{position:fixed;bottom:24px;inset-inline-end:24px;background:var(--signal);color:#fff;border-radius:4px;padding:12px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 6px 20px rgba(15,34,56,.25);z-index:5}
.assist b{display:block;font:700 18px/1.2 var(--ar)}
.assist span{font:400 16px/1.2 var(--ar)}
.assist svg{width:30px;height:30px;fill:none;stroke:#fff;stroke-width:2}

/* footer */
footer{background:var(--ink);color:#fff;padding:48px 0 0}
footer .wrap.cols{display:grid;grid-template-columns:1.4fr 1fr 1.3fr;gap:48px;padding-bottom:40px}
footer .flogo img{height:64px;width:auto;margin-bottom:16px}
footer .names{font:700 20px/1.6 var(--ar)}
footer .names .en{font-family:var(--lat);font-weight:700}
footer p{font-size:17px;line-height:1.7;color:#D5DEE8;margin-top:10px;max-width:520px}
footer h4{font:700 20px/1.3 var(--ar);margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid rgba(255,255,255,.25)}
footer ul{list-style:none}
footer li{font:500 18px/1.5 var(--ar);padding:5px 0}
footer .cl{font:400 16px/1.4 var(--ar);color:#B9C6D4}
footer .cv{font:600 19px/1.5 var(--ar);margin-bottom:12px;word-break:break-word}
footer .cv .num{font-size:20px}
footer .apps{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
footer .apps span{border:1px solid rgba(255,255,255,.4);border-radius:3px;padding:4px 10px;font:500 16px/1.3 var(--lat)}
footer .bottom{border-top:1px solid rgba(255,255,255,.2);padding:18px 0;font:500 16px/1.5 var(--ar);color:#D5DEE8}
footer .bottom .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.tagline{font:700 17px var(--lat);color:#fff;letter-spacing:.02em}
.tabbar{display:none}

/* ---------- responsive ---------- */
@media (max-width:1500px){.sgrid{grid-template-columns:repeat(4,minmax(0,1fr))}.open .wrap{grid-template-columns:1fr 380px}}
@media (max-width:1180px){
  .top .wrap{flex-wrap:wrap;min-height:0;padding-top:12px;padding-bottom:12px}
  .search{order:3;flex-basis:100%}
  .open .wrap{grid-template-columns:1fr}
  .stats{grid-template-columns:repeat(2,1fr)}
  .board .hd{display:none}
  .board .row{grid-template-columns:1fr 1fr;gap:6px 16px;padding:14px 18px}
  .board .row .c-date{grid-column:1/-1;flex-direction:row;align-items:baseline;gap:10px}
  .board .row .c-name{grid-column:1/-1}
  .board .row .c-field{grid-column:1/-1}
  .magstrip{grid-template-columns:160px 1fr}
  .magstrip .acts{grid-column:1/-1;flex-direction:row}
  footer .wrap.cols{grid-template-columns:1fr 1fr}
}
@media (max-width:760px){
  body{padding-bottom:84px}
  .wrap{padding:0 16px}
  .top .wrap{gap:12px;flex-wrap:nowrap}
  .logo img{height:44px}
  .top .search{order:0;flex-basis:auto;min-height:52px}
  .top .search input{font-size:18px;padding:0 12px}
  .top .search button{padding:0 14px}
  .top .search button span{display:none}
  .top .contactBtn,.top .lang{display:none}
  .menuBtn{display:flex;width:52px;height:52px;border:2px solid var(--ink);border-radius:4px;align-items:center;justify-content:center;flex:none}
  .menuBtn svg{width:28px;height:28px;stroke:var(--ink);stroke-width:2.5;fill:none;stroke-linecap:round}
  .rail{display:none}
  .open .wrap{padding-top:32px;padding-bottom:32px;gap:24px}
  .open h1{font-size:32px}
  .open h1 .b{font-size:24px}
  [dir=ltr] .open h1{font-size:38px}
  [dir=ltr] .open h1 .b{font-size:22px}
  .open p.lead{font-size:18px}
  .bigsearch{min-height:62px}
  .bigsearch input{font-size:19px;padding:0 14px}
  .bigsearch button{font-size:19px;padding:0 20px}
  .stats{gap:10px;margin-top:22px}
  .stat{padding:14px 14px 12px}
  .stat .n{font-size:34px}
  .stat .l{font-size:17px}
  .issue{grid-template-columns:110px 1fr;gap:14px;padding:14px}
  .issue img{width:110px}
  .issue .t{font-size:19px}
  .sec{padding:32px 0 40px}
  .sec-head h2{font-size:30px}
  [dir=ltr] .sec-head h2{font-size:34px}
  .sec-head .acts .btn{min-height:52px;font-size:18px;padding:0 18px}
  .cty{min-height:48px;padding:6px 10px}
  .cty-name{font-size:17px}
  .board .row{grid-template-columns:1fr;gap:4px}
  .board .row .c-date{grid-column:auto}
  .board .row .c-name,.board .row .c-field{grid-column:auto}
  .c-name .venue{white-space:normal}
  .ptile{width:240px}
  .pimg{height:170px}
  .sgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .stile{padding:12px;min-height:0}
  .slogo{height:70px}
  .slogo img{max-height:64px}
  .noLogo{font-size:19px}
  .sname{font-size:17px}
  .magstrip{grid-template-columns:1fr;padding:16px}
  .magstrip img{width:140px}
  .magstrip ol{columns:1}
  footer .wrap.cols{grid-template-columns:1fr;gap:28px}
  .assist{bottom:96px;padding:10px 14px}
  .tabbar{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;background:var(--navy);border-top:3px solid var(--signal);z-index:6}
  .tabbar a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#fff;font:700 16px/1.1 var(--ar);padding:9px 2px 8px;min-height:76px}
  .tabbar a.on{background:var(--ink)}
  .tabbar svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linejoin:round}
}
</style>
</head>
<body>

<header class="top">
  <div class="wrap">
    <a class="logo" href="#"><img src="${IMG}brand/aat-logo-red.svg" alt="AAT · Ideas For Business"></a>
    <form class="search" onsubmit="return false">
      <input type="search" placeholder="${esc(t.searchPh)}" aria-label="${esc(t.search)}">
      <button type="submit"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span>${esc(t.search)}</span></button>
    </form>
    <a class="btn red contactBtn" href="#"><span>${esc(t.contact)}</span><span class="num" dir="ltr">${esc(t.phone)}</span></a>
    <div class="lang"><a class="btn" href="${t.otherHref}">${esc(t.other)}</a><a class="globe" href="#" aria-label="Languages"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg></a></div>
    <a class="menuBtn" href="#" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></a>
  </div>
  <nav class="rail"><div class="wrap">${navHtml}</div></nav>
</header>

<section class="open">
  <div class="wrap">
    <div>
      <h1><span>${esc(t.h1a)}</span><span class="b">${esc(t.h1b)}</span></h1>
      <p class="lead">${esc(t.lead)}</p>
      <form class="bigsearch" onsubmit="return false"><input type="search" placeholder="${esc(t.searchPh)}" aria-label="${esc(t.search)}"><button type="submit">${esc(t.search)}</button></form>
      <div class="stats">
        <div class="stat"><div class="n">${nf(D.shows.length)}</div><div class="l">${esc(t.stats[0][0])}</div><div class="s">${esc(t.stats[0][1])}</div></div>
        <div class="stat"><div class="n">${companies.length}</div><div class="l">${esc(t.stats[1][0])}</div><div class="s">${esc(t.stats[1][1])}</div></div>
        <div class="stat"><div class="n">${totalProducts}</div><div class="l">${esc(t.stats[2][0])}</div><div class="s">${esc(t.stats[2][1])}</div></div>
        <div class="stat"><div class="n">${nf(D.club.members.count)}</div><div class="l">${esc(t.stats[3][0])}</div><div class="s">${esc(t.stats[3][1])}</div></div>
      </div>
    </div>
    <div class="issue">
      <img src="${IMG}magazine-560.jpg" alt="">
      <div>
        <div class="stamp">${esc(t.issue)}</div>
        <div class="t">${esc(D.magazine.name[L])}</div>
        <div class="m">${esc(t.issueMonth)} · ${esc(t.pages)}</div>
        <div class="acts"><a class="btn red" href="#">${esc(t.read)}</a><a class="btn" href="#">${esc(t.pdf)}</a></div>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <div><h2>${esc(t.secShows)}</h2><div class="cnt">${esc(t.showsCount(D.shows.length))}</div></div>
      <div class="acts"><a class="btn ink" href="#">${esc(t.allShows)}</a></div>
    </div>
    <div class="ctys"><a href="#" class="cty on"><span class="cty-name">${esc(t.allCountries)}</span><span class="cty-n num">${nf(D.shows.length)}</span></a>${countryHtml}</div>
    <div class="board">
      <div class="hd">${t.cols.map(c => `<span>${esc(c)}</span>`).join('')}</div>
      ${rowsHtml}
    </div>
    <div class="board-foot"><span>${esc(t.showing(boardRows.length, D.shows.length))}</span><a class="btn" href="#">${esc(t.allShows)}</a></div>
  </div>
</section>

<section class="sec floor">
  <div class="wrap">
    <div class="sec-head">
      <div><h2>${esc(t.secShelf)}</h2><div class="cnt">${esc(t.shelfCount(totalProducts))}</div></div>
      <div class="acts"><a class="btn ink" href="#">${esc(t.allProducts)}</a></div>
    </div>
  </div>
  <div class="belt"><div class="track">${shelfHtml}${shelfHtml}</div></div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <div><h2>${esc(t.secSup)}</h2><div class="cnt">${esc(t.supCount(companies.length))}</div></div>
      <div class="acts"><a class="btn ink" href="#">${esc(t.allSup)}</a></div>
    </div>
    <div class="sgrid">${supHtml}</div>
    <div class="board-foot"><span>${esc(t.showing(supShown.length, companies.length)).replace(/معرضاً|shows/, L === 'ar' ? 'مصنعاً' : 'factories')}</span><a class="btn" href="#">${esc(t.supMore)}</a></div>
  </div>
</section>

<a class="assist" href="#"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg><span><b>${esc(t.assistant)}</b><span>${esc(t.assistant2)}</span></span></a>

<footer>
  <div class="wrap cols">
    <div class="flogo">
      <img src="${IMG}brand/aat-logo-white.svg" alt="AAT">
      <div class="names"><div>${esc(t.fGroup)}</div><div class="en"><bdi dir="ltr">${esc(t.fGroupEn)}</bdi> · <bdi dir="ltr">${esc(t.fZh)}</bdi></div></div>
      <p>${esc(t.fSince)}</p>
    </div>
    <div>
      <h4>${esc(t.fNav)}</h4>
      <ul>${t.nav.slice(1).map(n => `<li><a href="#">${esc(n)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h4>${esc(t.fContact)}</h4>
      <div class="cl">${esc(t.fPhone)}</div><div class="cv"><span class="num" dir="ltr">${esc(t.phone)}</span></div>
      <div class="cl">${esc(t.fApps)}</div><div class="apps"><span>WhatsApp</span><span>Viber</span><span>Botim</span><span>imo</span><span>BiP</span><span>LINE</span></div>
      <div class="cl" style="margin-top:14px">${esc(t.fEmail)}</div><div class="cv"><bdi dir="ltr">info@aatworld.com</bdi></div>
      <div class="cl">${esc(t.fAddr)}</div><div class="cv"><bdi dir="ltr">${esc(D.config.address.en)}</bdi></div>
    </div>
  </div>
  <div class="bottom"><div class="wrap"><span>${esc(t.rights)}</span><span class="tagline"><bdi dir="ltr">AAT · ${esc(t.tagline)} · www.aatworld.com</bdi></span></div></div>
</footer>

<nav class="tabbar">${tabsHtml}</nav>
<script>
// phones: a short placeholder in the narrow top search field
(function(){var i=document.querySelector('.top .search input');if(!i)return;var full=i.placeholder;function f(){i.placeholder=window.innerWidth<761?${JSON.stringify(t.search)}:full;}f();window.addEventListener('resize',f);})();
</script>
</body>
</html>`;
}

for (const L of ['ar', 'en']) {
  const html = page(L);
  fs.writeFileSync(path.join(OUT, `tile-${L}.html`), html);
  console.log(`tile-${L}.html`, html.length, 'bytes');
}
