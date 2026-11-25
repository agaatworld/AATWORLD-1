/* Builds tile-ar.html and tile-en.html for the "Trade Gazette" concept from the real data.json.
   Run: node build_tile.js   (writes next to itself) */
const fs = require('fs'), path = require('path');
const HERE = __dirname;
const D = JSON.parse(fs.readFileSync(path.join(HERE, '../../data/data.json'), 'utf8'));
const IMG = '../../';                           // data paths already start with img/ (prototype sample in site-v3/img)
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = n => Number(n).toLocaleString('en-US');

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const T = {
  ar: {
    dir: 'rtl', lang: 'ar', htmlLang: 'ar', title: 'التجارة العربية الآسيوية — الصحيفة التجارية (نموذج)',
    issueLine1: 'العدد 560 · أكتوبر 2026', issueLine2: 'السنة 45 · تصدر في تايوان منذ 1982',
    strip: ['التجارة العربية الآسيوية', 'Arab Asian Trade', '中阿商業雜誌'],
    langSwitch: 'English', langAll: 'اللغات', phoneLabel: 'الهاتف والواتساب',
    nav: ['الرئيسية', 'المجلة', 'معارض دولية', 'المنتجات', 'نادي رجال الأعمال', 'المقالات', 'الأخبار', 'من نحن', 'تواصل معنا'],
    tickTitle: 'منتجات العدد 560', page: 'ص.',
    inThisIssue: 'في هذا العدد', readIssue: 'اقرأ العدد 560', pdf: 'PDF', contents: 'محتويات العدد', allContents: 'كل المحتويات والمعلنين',
    shows: 'معارض دولية', showsNext: 'القادمة ابتداءً من يناير 2027', allShows: 'كل المعارض: 1,464 معرضاً في 16 دولة', byCountry: 'حسب الدولة',
    club: 'نادي رجال الأعمال', members: 'عضواً', benefits: 'من مزايا الأعضاء', join: 'انضم إلى النادي', clubMore: 'المزايا الثماني كاملة',
    figs: [['1982', 'صدر العدد الأول'], ['560', 'عدداً من المجلة'], ['45', 'عاماً في النشر التجاري'], ['1,464', 'معرضاً دولياً'], ['2,831', 'عضواً في النادي'], ['5', 'لغات للموقع']],
    advertisers: 'معلنو العدد 560', advNote: '36 معلناً من آسيا والعالم العربي، كلٌّ منهم في صفحته من المجلة',
    articles: 'مقالات العدد', by: 'بقلم', articleLead: 'المقال الرئيسي', moreArticles: 'كل مقالات العدد (13)',
    news: 'الأخبار', newsDate: d => d ? `${+d.slice(8, 10)} ${AR_MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}` : '',
    contact: 'تواصل معنا', contactLead: 'للإعلان أو الاشتراك أو الاستفسار عن المورّدين، اتصل بنا أو راسلنا على الرقم نفسه عبر التطبيقات.',
    apps: 'الرقم نفسه على التطبيقات', copy: 'انسخ الرقم', email: 'البريد الإلكتروني', address: 'العنوان',
    nlTitle: D.config.newsletter.title.ar, nlLead: D.config.newsletter.lead.ar, nlBtn: D.config.newsletter.button.ar, nlLabel: D.config.newsletter.label.ar,
    footPub: 'تصدر عن مجموعة التجارة العربية الآسيوية · تايوان · منذ 1982', footSections: 'الأقسام', footRights: '© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة',
    footClaim: 'المجلة الإعلانية الاقتصادية الشهرية الوحيدة من نوعها باللغتين العربية والإنجليزية، تصدر من تايوان منذ 1982.',
    chat: 'اسأل AAT · محادثة 24 ساعة',
    dateRange: (s, e, approx) => {
      const y = s.slice(0, 4), m = +s.slice(5, 7) - 1, d1 = +s.slice(8, 10), d2 = +e.slice(8, 10), m2 = +e.slice(5, 7) - 1;
      if (approx) return { big: AR_MONTHS[m], small: y };
      if (m === m2) return { big: d1 === d2 ? String(d1) : `${d1}–${d2}`, small: `${AR_MONTHS[m]} ${y}` };
      return { big: `${d1} ${AR_MONTHS[m]} – ${d2} ${AR_MONTHS[m2]}`, small: y };
    },
    city: s => s.city.ar || s.city.en || '', country: cc => D.countries[cc].ar,
    cardTitle: 'بطاقة الشركة', cardLead: 'في القارئ: الضغط على صفحة إعلان يفتح بطاقة الشركة بجانب الصفحة، ولا ينتقل القارئ إلى صفحة أخرى.', contactCo: 'تواصل مع الشركة', seeProducts: 'منتجات الشركة', inMag: 'في المجلة',
    groupName: 'مجموعة التجارة العربية الآسيوية'
  },
  en: {
    dir: 'ltr', lang: 'en', htmlLang: 'en', title: 'Arab Asian Trade — The Trade Gazette (prototype)',
    issueLine1: 'Issue 560 · October 2026', issueLine2: 'Year 45 · Published in Taiwan since 1982',
    strip: ['Arab Asian Trade', 'التجارة العربية الآسيوية', '中阿商業雜誌'],
    langSwitch: 'العربية', langAll: 'Languages', phoneLabel: 'Phone and WhatsApp',
    nav: ['Home', 'Magazine', 'International exhibitions', 'Products', 'Business Club', 'Articles', 'News', 'About', 'Contact'],
    tickTitle: 'Products of issue 560', page: 'p.',
    inThisIssue: 'In this issue', readIssue: 'Read issue 560', pdf: 'PDF', contents: 'Contents', allContents: 'Full contents and advertisers',
    shows: 'International exhibitions', showsNext: 'Coming up from January 2027', allShows: 'All shows: 1,464 in 16 countries', byCountry: 'By country',
    club: 'AAT Business Club', members: 'members', benefits: 'Member benefits', join: 'Join the club', clubMore: 'All eight benefits',
    figs: [['1982', 'first issue published'], ['560', 'magazine issues'], ['45', 'years of trade publishing'], ['1,464', 'international exhibitions'], ['2,831', 'club members'], ['5', 'website languages']],
    advertisers: 'Advertisers in issue 560', advNote: '36 advertisers from Asia and the Arab world, each on its own page of the magazine',
    articles: 'Articles of the issue', by: 'By', articleLead: 'Lead article', moreArticles: 'All 13 articles of the issue',
    news: 'News', newsDate: d => d ? `${+d.slice(8, 10)} ${EN_MONTHS_LONG[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}` : '',
    contact: 'Contact us', contactLead: 'For advertising, subscriptions or supplier enquiries, call us or message the same number on the apps.',
    apps: 'The same number on the apps', copy: 'Copy the number', email: 'Email', address: 'Address',
    nlTitle: D.config.newsletter.title.en, nlLead: D.config.newsletter.lead.en, nlBtn: D.config.newsletter.button.en, nlLabel: D.config.newsletter.label.en,
    footPub: 'Published by Arab Asian Trade Group · Taiwan · since 1982', footSections: 'Sections', footRights: '© 2026 Arab Asian Trade Group · All rights reserved',
    footClaim: 'The only monthly Arabic–English trade advertising magazine of its kind, published in Taiwan since 1982.',
    chat: 'Ask AAT · 24-hour chat',
    dateRange: (s, e, approx) => {
      const y = s.slice(0, 4), m = +s.slice(5, 7) - 1, d1 = +s.slice(8, 10), d2 = +e.slice(8, 10), m2 = +e.slice(5, 7) - 1;
      if (approx) return { big: EN_MONTHS_LONG[m], small: y };
      if (m === m2) return { big: d1 === d2 ? String(d1) : `${d1}–${d2}`, small: `${EN_MONTHS[m]} ${y}` };
      return { big: `${d1} ${EN_MONTHS[m]} – ${d2} ${EN_MONTHS[m2]}`, small: y };
    },
    city: s => s.city.en || '', country: cc => D.countries[cc].en,
    cardTitle: 'Company card', cardLead: 'In the reader: tapping an ad page opens the company card beside the page; the reader never jumps to another page.', contactCo: 'Contact the company', seeProducts: 'Company products', inMag: 'In the magazine',
    groupName: 'Arab Asian Trade Group'
  }
};

/* ---------- content picks (all real) ---------- */
const byId = {}; D.companies.forEach(c => byId[c.id] = c);
// ticker: one pictured product per company, by page order
const tick = D.companies.filter(c => c.products.some(p => p.img) && c.logo).map(c => ({ c, p: c.products.find(p => p.img) }));
// upcoming shows: first exact-dated shows from Jan 2027 + two famous ones
const sorted = D.shows.filter(s => !s.approx).sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
const pick = (name, from) => sorted.find(s => s.name.toLowerCase().includes(name.toLowerCase()) && s.start >= (from || '2027'));
const showRows = [pick('Idf Oman'), pick('Steelfab'), pick('World Future Energy Summit'), pick('Arab Health'), pick('TIMTOS 2027'), pick('Gulfood Exhibition'), pick('Taipei Cycle 2027'), pick('Big 5 Saudi')].filter(Boolean);
const countryRows = Object.entries(D.countries).filter(([, c]) => c.shows > 0).sort((a, b) => b[1].shows - a[1].shows);
const toc = D.magazine.toc.articles.slice().sort((a, b) => a.page - b.page);
const fresh = D.articles.filter(a => a.fresh).sort((a, b) => a.magPage - b.magPage);
const lead = D.articles.find(a => a.id === 'ar26-1');
const newsPick = D.news.filter(n => n.img && n.lang === 'both').slice(0, 3);
const advertisers = D.companies.filter(c => c.logo).sort((a, b) => a.id - b.id);

function build(L) {
  const t = T[L];
  const ar = L === 'ar';
  const txt = o => (o && (o[L] || o.en || o.ar)) || '';
  const flag = cc => `<img class="flag" src="${IMG}${D.countries[cc].flag}" alt="${esc(t.country(cc))}">`;

  const navHtml = t.nav.map((n, i) => `<a href="#" class="${i === 0 ? 'on' : ''}">${esc(n)}</a>`).join('');
  const tickItems = tick.map(({ c, p }) => `
      <div class="ti">
        <img src="${IMG}${p.img}" alt="" loading="lazy">
        <div class="ti-t">
          <div class="ti-n"><bdi>${esc(p.n)}</bdi></div>
          <div class="ti-c"><img src="${IMG}${c.logo}" alt="" class="ti-logo"><bdi>${esc(c.company)}</bdi></div>
          <div class="ti-p">${esc(t.page)} ${c.page}</div>
        </div>
      </div>`).join('');

  const tocHtml = toc.slice(0, 8).map(a => `<li><span class="t">${esc(txt(a.title))}</span><span class="dots"></span><span class="pg">${a.page}</span></li>`).join('');

  const showHtml = showRows.map(s => {
    const d = t.dateRange(s.start, s.end, s.approx);
    return `<div class="show">
        <div class="sd"><bdi dir="ltr">${esc(d.big)}</bdi><small>${esc(d.small)}</small></div>
        <div class="sn"><div class="sn-n"><bdi dir="ltr">${esc(s.name)}</bdi></div><div class="sn-c">${flag(s.cc)}<span>${esc(t.city(s))}</span>${s.venue && s.venue.en ? ` · <bdi dir="ltr">${esc(s.venue.en)}</bdi>` : ''}</div></div>
      </div>`;
  }).join('');

  const countryHtml = countryRows.map(([cc, c]) => `<li>${flag(cc)}<span>${esc(txt(c))}</span><b>${nf(c.shows)}</b></li>`).join('');

  const benefits = D.club.benefits.slice(0, 3).map(b => `<li><span class="n">${b.n}</span><span>${esc(b[L])}</span></li>`).join('');
  const figs = t.figs.map(([n, l]) => `<div class="fig"><div class="fn">${n}</div><div class="fl">${esc(l)}</div></div>`).join('');

  const advHtml = advertisers.map(c => `<a class="adv" href="#">
      <span class="adv-logo"><img src="${IMG}${c.logo}" alt=""></span>
      <span class="adv-n"><bdi>${esc(ar && c.nameAr ? c.nameAr : c.company)}</bdi></span>
      <span class="adv-c"><span>${esc(txt(c.city))}</span><span class="pg">${esc(t.page)} ${c.page}</span></span>
    </a>`).join('');

  const artList = fresh.filter(a => a.id !== lead.id).slice(0, 10).map(a => `<li>
      <a href="#" class="al-t">${esc(txt(a.title))}</a>
      <div class="al-m">${a.author ? `<span>${esc(t.by)} ${esc(a.author)}</span>` : ''}<span class="pg">${esc(t.page)} ${a.magPage}</span></div>
    </li>`).join('');

  const newsHtml = newsPick.map(n => `<a class="nw" href="#">
      <img src="${IMG}${n.img}" alt="">
      <span class="nw-t">${esc(txt(n.title))}</span>
      <span class="nw-d">${esc(t.newsDate(n.date))}</span>
    </a>`).join('');

  const appsHtml = D.config.apps.map(a => a.icon
    ? `<a class="app" href="#"><img src="${IMG}${a.icon}" alt=""><span>${esc(a.name)}</span></a>`
    : `<a class="app" href="#"><span class="app-g">${a.name === 'WhatsApp' ? '✆' : a.name === 'Viber' ? '☏' : '✉'}</span><span>${esc(a.name)}</span></a>`).join('');

  // the sample "company card" (the card component) — Kang Chyau, page 4
  const card = byId[4];
  const cardProducts = card.products.filter(p => p.img).slice(0, 2).map(p => `<li><img src="${IMG}${p.img}" alt=""><span><bdi>${esc(p.n)}</bdi></span></li>`).join('');

  const fontLink = 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..700&family=Libre+Franklin:wght@500;600;700;800&display=swap';

  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontLink}">
<style>
:root{
  --paper:#FFFFFF; --news:#F1EFEA; --ink:#141414; --ink2:#4A4A4A; --hair:#C9C5BD; --red:#D21F26; --red2:#8E1116; --blue:#0B4F9C;
  --ar-text:"Noto Naskh Arabic","Noto Naskh Arabic UI",serif; --ar-ui:"Noto Kufi Arabic",sans-serif;
  --la-text:"Newsreader",Georgia,serif; --la-ui:"Libre Franklin",Arial,sans-serif;
  --text:${ar ? 'var(--ar-text)' : 'var(--la-text)'}; --ui:${ar ? 'var(--ar-ui)' : 'var(--la-ui)'};
  --body:${ar ? '20px' : '19px'}; --lh:${ar ? '1.85' : '1.6'};
  --h1:${ar ? '56px' : '60px'}; --h2:${ar ? '36px' : '38px'}; --h3:${ar ? '26px' : '27px'};
  --max:1480px; --gut:24px;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--text);font-size:var(--body);line-height:var(--lh);font-variant-numeric:tabular-nums}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
bdi{unicode-bidi:isolate}
.lt{font-family:var(--la-ui);direction:ltr;unicode-bidi:isolate}
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--gut)}
.ui{font-family:var(--ui)}
.pg{font-family:var(--ui);font-weight:700;font-size:16px;color:var(--red);white-space:nowrap}

/* ===== masthead ===== */
.ears{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;padding:14px 0 10px;border-bottom:1px solid var(--hair)}
.ear{font-family:var(--ui);font-size:17px;line-height:1.5;color:var(--ink2)}
.ear b{display:block;color:var(--ink);font-size:18px;font-weight:700}
.ear.mid{display:flex;justify-content:center;align-items:center;gap:8px;white-space:nowrap}
.ear.end{display:flex;justify-content:flex-end;align-items:center;gap:12px}
.lang{font-family:var(--ui);font-weight:700;font-size:18px;color:var(--ink);border:2px solid var(--ink);padding:9px 16px;min-height:48px;display:inline-flex;align-items:center;gap:8px;background:var(--paper)}
.lang.globe{padding:9px 12px}
.lang svg{width:22px;height:22px}
.masthead{text-align:center;padding:26px 0 18px}
.masthead img{width:340px;height:auto;margin:0 auto}
.strip{background:var(--red);color:#fff;font-family:var(--ui);font-weight:700;font-size:20px;line-height:1.5;text-align:center;padding:10px 16px;display:flex;justify-content:center;gap:0 28px;flex-wrap:wrap}
.strip span{white-space:nowrap}
.strip .zh{font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}

/* ===== section bar (nav) ===== */
.nav{position:sticky;top:0;z-index:20;background:var(--paper);border-top:3px solid var(--ink);box-shadow:inset 0 4px 0 var(--paper),inset 0 5px 0 var(--ink);border-bottom:1px solid var(--ink)}
.nav .wrap{display:flex;flex-wrap:wrap;justify-content:center;gap:0}
.nav a{font-family:var(--ui);font-weight:700;font-size:20px;line-height:1.3;padding:18px 18px 14px;border-bottom:5px solid transparent;margin-bottom:-1px;white-space:nowrap}
.nav a.on,.nav a:hover{border-bottom-color:var(--red);color:var(--red2)}
.nav a.on{color:var(--red)}

/* ===== product ticker (the moving shelf) ===== */
.tick{display:flex;border-bottom:1px solid var(--ink);background:var(--paper)}
.tick-title{flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:0 22px;border-inline-end:3px solid var(--ink);font-family:var(--ui);font-weight:800;font-size:20px;line-height:1.3}
.tick-title i{width:14px;height:14px;background:var(--red);display:inline-block;flex:none}
.tick-rail{flex:1 1 auto;overflow:hidden}
.tick-track{display:flex;width:max-content;animation:tick 75s linear infinite}
.tick-rail:hover .tick-track{animation-play-state:paused}
@keyframes tick{from{transform:translateX(0)}to{transform:translateX(${ar ? '' : '-'}50%)}}
.ti{display:flex;align-items:center;gap:16px;width:360px;padding:14px 20px;border-inline-end:1px solid var(--hair);flex:none}
.ti>img{width:96px;height:96px;object-fit:contain;border:1px solid var(--hair);background:#fff;flex:none}
.ti-t{min-width:0}
.ti-n{font-family:var(--la-ui);font-weight:700;font-size:18px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ti-c{display:flex;align-items:center;gap:8px;font-family:var(--ui);font-size:16px;color:var(--ink2);line-height:1.4;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ti-logo{height:22px;width:auto;max-width:70px;flex:none}
.ti-p{margin-top:4px;font-family:var(--ui);font-weight:700;font-size:16px;color:var(--red)}

/* ===== section title treatment: thick rule + red square + one title ===== */
.sec{border-top:3px solid var(--ink);padding-top:12px;margin:0 0 20px;display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap}
.sec h2{margin:0;font-family:var(--text);font-weight:700;font-size:var(--h2);line-height:1.3;display:flex;align-items:center;gap:14px}
.sec h2::before{content:"";width:18px;height:18px;background:var(--red);flex:none}
.sec .note{font-family:var(--ui);font-size:17px;color:var(--ink2);line-height:1.5}
.sec.sm h2{font-size:var(--h3)}

/* ===== buttons ===== */
.btn{font-family:var(--ui);font-weight:700;font-size:20px;line-height:1.2;min-height:54px;padding:12px 24px;border:2px solid var(--ink);background:var(--paper);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;text-align:center}
.btn.red{background:var(--red);border-color:var(--red);color:#fff}
.btn.red:hover{background:var(--red2);border-color:var(--red2)}
.btn:hover{background:var(--news)}
.btn.red:hover{background:var(--red2)}
.btn.wide{width:100%}
.btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}

/* ===== front page ===== */
.front{display:grid;grid-template-columns:5fr 4fr 3fr;margin-top:28px}
.col{padding:0 28px;min-width:0}
.col:first-child{padding-inline-start:0}
.col:last-child{padding-inline-end:0}
.col+.col{border-inline-start:1px solid var(--hair)}
.lead-cover{display:grid;grid-template-columns:250px 1fr;gap:26px;align-items:start}
.lead-cover img{border:1px solid var(--hair)}
.lead-h{font-family:var(--text);font-weight:700;font-size:var(--h3);line-height:1.4;margin:0 0 10px}
.lead-p{margin:0 0 10px;color:var(--ink)}
.lead-p.q{color:var(--ink2);font-size:18px;line-height:1.7}
.toc{list-style:none;margin:16px 0 0;padding:0;border-top:1px solid var(--ink)}
.toc li{display:flex;align-items:baseline;gap:10px;padding:9px 0;border-bottom:1px solid var(--hair);font-size:18px;line-height:1.5}
.toc .t{flex:0 1 auto;font-weight:600}
.toc .dots{flex:1 1 24px;min-width:24px;border-bottom:2px dotted var(--hair);transform:translateY(-7px)}
.toc .pg{font-size:18px}
.more{display:block;margin-top:14px;font-family:var(--ui);font-weight:700;font-size:18px;color:var(--ink);text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px}

.show{display:grid;grid-template-columns:118px 1fr;gap:14px;padding:12px 0;border-bottom:1px solid var(--hair)}
.sd{font-family:var(--ui);font-weight:800;font-size:22px;line-height:1.15;color:var(--ink)}
.sd small{display:block;font-size:16px;font-weight:600;color:var(--ink2);margin-top:3px}
.sn-n{font-family:var(--la-ui);font-weight:700;font-size:19px;line-height:1.35}
.sn-c bdi{font-family:var(--la-ui)}
.sn-c{display:flex;align-items:center;gap:8px;font-size:17px;line-height:1.5;color:var(--ink2);margin-top:4px;flex-wrap:wrap}
.flag{width:28px;height:19px;object-fit:cover;border:1px solid var(--hair);flex:none}
.clist{list-style:none;margin:10px 0 0;padding:0;columns:2;column-gap:24px;font-family:var(--ui);font-size:17px}
.clist li{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--hair);break-inside:avoid}
.clist li span{flex:1}
.clist b{font-weight:800}

.seal{width:200px;height:200px;margin:0 auto 14px;position:relative}
.seal svg{width:100%;height:100%}
.seal .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:46px}
.seal .in img{width:92px}
.seal .in b{font-family:var(--ui);font-weight:800;font-size:16px;line-height:1.2;color:var(--red);white-space:nowrap}
.big{font-family:var(--la-text);font-weight:700;font-size:64px;line-height:1;color:var(--ink);text-align:center;margin:0}
.big+.bl{font-family:var(--ui);font-size:18px;text-align:center;color:var(--ink2);margin:6px 0 14px}
.ben{list-style:none;margin:14px 0 0;padding:0;border-top:1px solid var(--ink)}
.ben li{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--hair);font-size:18px;line-height:1.6}
.ben .n{font-family:var(--la-text);font-weight:700;font-size:30px;line-height:1;color:var(--red);flex:none;min-width:30px;text-align:center;padding-top:4px}

/* ===== figures strip ===== */
.figs{display:grid;grid-template-columns:repeat(6,1fr);border-top:3px solid var(--ink);border-bottom:1px solid var(--ink);margin:36px 0 0}
.fig{padding:22px 16px 18px;text-align:center}
.fig+.fig{border-inline-start:1px solid var(--hair)}
.fn{font-family:var(--la-text);font-weight:700;font-size:64px;line-height:1;letter-spacing:-.01em}
.fl{font-family:var(--ui);font-size:17px;line-height:1.5;color:var(--ink2);margin-top:8px}

/* ===== advertisers (classifieds grid) ===== */
.advs{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));border-top:1px solid var(--hair);border-inline-start:1px solid var(--hair)}
.adv{background:var(--paper);border-inline-end:1px solid var(--hair);border-bottom:1px solid var(--hair);padding:18px 16px 14px;display:flex;flex-direction:column;gap:8px;min-width:0}
.adv:hover{background:var(--news)}
.adv-logo{height:64px;display:flex;align-items:center;justify-content:flex-start}
.adv-logo img{max-height:60px;max-width:170px;width:auto;height:auto}
.adv-n{font-family:var(--ui);font-weight:700;font-size:17px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.adv-c{display:flex;justify-content:space-between;gap:8px;font-family:var(--ui);font-size:16px;color:var(--ink2);line-height:1.4}
.adv-c>span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ===== articles ===== */
.arts{display:grid;grid-template-columns:7fr 5fr;gap:0}
.arts>div{min-width:0}
.arts>div+div{border-inline-start:1px solid var(--hair);padding-inline-start:28px;margin-inline-start:28px}
.al-pic{border:1px solid var(--hair)}
.al-h{font-family:var(--text);font-weight:700;font-size:34px;line-height:1.35;margin:16px 0 8px}
.al-p{margin:0 0 8px;color:var(--ink)}
.al-m{font-family:var(--ui);font-size:16px;color:var(--ink2);display:flex;gap:16px;flex-wrap:wrap;line-height:1.5}
.alist{list-style:none;margin:0;padding:0}
.alist li{padding:12px 0;border-bottom:1px solid var(--hair)}
.alist li:first-child{padding-top:0}
.al-t{font-family:var(--text);font-weight:700;font-size:22px;line-height:1.45;display:block}
.al-t:hover{color:var(--red2)}

/* ===== news row ===== */
.news{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.nw img{aspect-ratio:2/1;object-fit:cover;border:1px solid var(--hair);width:100%}
.nw-t{display:block;font-family:var(--text);font-weight:700;font-size:21px;line-height:1.45;margin-top:12px}
.nw-d{display:block;font-family:var(--ui);font-size:16px;color:var(--ink2);margin-top:6px}

/* ===== card component (company card) ===== */
.card{border:1px solid var(--ink);background:var(--paper);max-width:520px}
.card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:3px solid var(--ink);font-family:var(--ui);font-weight:800;font-size:18px}
.card-b{padding:18px}
.card-b img.logo{max-height:56px;width:auto}
.card-n{font-family:var(--ui);font-weight:700;font-size:22px;line-height:1.4;margin:10px 0 2px}
.card-c{font-family:var(--ui);font-size:17px;color:var(--ink2)}
.card-p{margin:10px 0 0;font-size:18px;line-height:1.7}
.card ul{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.card ul li{border:1px solid var(--hair);padding:10px;font-family:var(--ui);font-size:16px;line-height:1.4;font-weight:600}
.card ul img{width:100%;aspect-ratio:1/1;object-fit:contain;margin-bottom:8px}
.card .btns{margin-top:16px}
.card .link{font-family:var(--la-ui);color:var(--blue);text-decoration:underline;text-underline-offset:4px;font-size:18px;font-weight:600;direction:ltr;unicode-bidi:isolate}

/* ===== contact band ===== */
.band{background:var(--news);border-top:3px solid var(--ink);margin-top:44px;padding:36px 0 40px}
.band .sec{border-top:0;padding-top:0}
.contact{display:grid;grid-template-columns:1.2fr 1fr;gap:40px}
.tel{font-family:var(--la-ui);font-weight:800;font-size:44px;line-height:1.1;letter-spacing:.01em;direction:ltr;unicode-bidi:isolate;display:inline-block}
.apps{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.app{display:inline-flex;align-items:center;gap:8px;border:2px solid var(--ink);background:var(--paper);padding:8px 14px;min-height:48px;font-family:var(--la-ui);font-weight:700;font-size:17px}
.app img{width:28px;height:28px}
.app-g{font-size:22px;line-height:1;width:28px;text-align:center}
.kv{margin:18px 0 0;font-family:var(--ui);font-size:17px;line-height:1.6}
.kv dt{font-weight:700;color:var(--ink2)}
.kv dd{margin:0 0 10px;font-size:18px}
.kv a{color:var(--blue);text-decoration:underline;text-underline-offset:4px;font-family:var(--la-ui);font-weight:600}
.addr{direction:ltr;unicode-bidi:isolate;font-family:var(--la-ui);font-weight:600;text-align:${ar ? 'right' : 'left'}}
.nl{border:1px solid var(--ink);background:var(--paper);padding:22px}
.nl h3{margin:0 0 8px;font-family:var(--text);font-weight:700;font-size:var(--h3);line-height:1.35}
.nl p{margin:0 0 14px;font-size:18px;line-height:1.7;color:var(--ink2)}
.nl form{display:flex;gap:10px;flex-wrap:wrap}
.nl input{flex:1 1 220px;min-height:54px;font:600 18px var(--la-ui);padding:0 14px;border:2px solid var(--ink);background:#fff;direction:ltr}

/* ===== footer (colophon) ===== */
.foot{background:var(--ink);color:#fff;margin-top:0;padding:40px 0 28px;border-top:6px solid var(--red)}
.foot .wrap{display:grid;grid-template-columns:1.4fr 1fr 1.2fr;gap:40px}
.foot img.logo{width:220px}
.foot .names{font-family:var(--ui);font-weight:700;font-size:18px;line-height:1.6;margin-top:14px}
.foot p{margin:10px 0 0;font-size:18px;line-height:1.7;color:#E6E3DD;max-width:520px}
.foot h4{margin:0 0 10px;font-family:var(--ui);font-size:18px;font-weight:800;color:#fff;border-bottom:1px solid #4a4a4a;padding-bottom:8px}
.foot ul{list-style:none;margin:0;padding:0;font-family:var(--ui);font-size:18px;line-height:1.5;columns:2;column-gap:20px}
.foot li{padding:5px 0}
.foot .kv{color:#fff}
.foot .kv dt{color:#CFCBC3}
.foot .kv a{color:#fff}
.foot .bottom{grid-column:1/-1;border-top:1px solid #4a4a4a;padding-top:16px;font-family:var(--ui);font-size:16px;color:#E6E3DD;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}

/* ===== assistant tab ===== */
.chat{position:fixed;bottom:0;inset-inline-start:24px;z-index:30;background:var(--red);color:#fff;font-family:var(--ui);font-weight:800;font-size:18px;line-height:1.2;padding:14px 22px;border:2px solid #fff;border-bottom:0;display:inline-flex;align-items:center;gap:10px;box-shadow:0 -2px 0 var(--red2)}
.chat svg{width:24px;height:24px}

/* ===== widths ===== */
@media (max-width:1500px){
  .lead-cover{grid-template-columns:200px 1fr;gap:20px}
}
@media (max-width:1180px){
  .front{grid-template-columns:1fr 1fr}
  .front .col:first-child{grid-column:1/-1;padding:0 0 24px;border-bottom:1px solid var(--hair);margin-bottom:24px}
  .front .col:nth-child(2){padding-inline-start:0;border-inline-start:0}
  .figs{grid-template-columns:repeat(3,1fr)}
  .fig:nth-child(4){border-inline-start:0}
  .fig:nth-child(n+4){border-top:1px solid var(--hair)}
  .arts{grid-template-columns:1fr}
  .arts>div+div{border-inline-start:0;padding-inline-start:0;margin-inline-start:0;border-top:1px solid var(--hair);padding-top:20px;margin-top:20px}
  .contact{grid-template-columns:1fr}
  .foot .wrap{grid-template-columns:1fr 1fr}
}
@media (max-width:760px){
  :root{--gut:16px;--h1:36px;--h2:28px;--h3:22px;--body:${ar ? '19px' : '18px'}}
  .ears{grid-template-columns:1fr auto;padding:10px 0;gap:10px}
  .ear.start{grid-column:1/-1;order:3;border-top:1px solid var(--hair);padding-top:8px}
  .ear.mid{justify-content:flex-end;order:2}
  .ear.end{justify-content:flex-start;order:1}
  .masthead{padding:16px 0 12px}
  .masthead img{width:230px}
  .strip{font-size:17px;gap:0 16px;padding:8px 10px}
  .nav a{font-size:18px;padding:12px 10px 9px;border-bottom-width:4px}
  .tick{flex-direction:column}
  .tick-title{padding:10px 16px;font-size:18px;border-inline-end:0;border-bottom:1px solid var(--ink)}
  .ti{width:300px;padding:12px 14px}
  .front{grid-template-columns:1fr;margin-top:20px}
  .front .col{padding:0;border-inline-start:0}
  .front .col:nth-child(2){border-bottom:1px solid var(--hair);padding-bottom:24px;margin-bottom:24px}
  .lead-cover{grid-template-columns:1fr}
  .lead-cover img{width:220px}
  .figs{grid-template-columns:repeat(2,1fr)}
  .fig:nth-child(3){border-inline-start:0}
  .fig:nth-child(n+3){border-top:1px solid var(--hair)}
  .fn{font-size:48px}
  .big{font-size:52px}
  .advs{grid-template-columns:repeat(2,1fr)}
  .adv-logo img{max-width:100%}
  .news{grid-template-columns:1fr;gap:22px}
  .al-h{font-size:26px}
  .tel{font-size:32px}
  .foot .wrap{grid-template-columns:1fr;gap:28px}
  .foot ul{columns:2}
  .chat{inset-inline-start:12px;font-size:17px;padding:12px 16px}
}
</style>
</head>
<body>

<header>
  <div class="wrap">
    <div class="ears">
      <div class="ear start"><b>${esc(t.issueLine1)}</b>${esc(t.issueLine2)}</div>
      <div class="ear mid"><a class="lang" href="#">${esc(t.langSwitch)}</a> <a class="lang globe" href="#" aria-label="${esc(t.langAll)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20"/></svg></a></div>
      <div class="ear end"><span class="lt" style="font-weight:800;font-size:20px;color:var(--ink)">+886 966 404681</span></div>
    </div>
    <div class="masthead"><img src="${IMG}img/brand/aat-logo-red.svg" alt="AAT · Ideas For Business"></div>
  </div>
  <div class="strip">${t.strip.map((s, i) => `<span class="${i === 2 ? 'zh' : ''}">${esc(s)}</span>${i < 2 ? '<span aria-hidden="true">·</span>' : ''}`).join('')}</div>
  <nav class="nav"><div class="wrap">${navHtml}</div></nav>
</header>

<section class="tick" aria-label="${esc(t.tickTitle)}">
  <div class="tick-title"><i></i>${esc(t.tickTitle)}</div>
  <div class="tick-rail"><div class="tick-track">${tickItems}${tickItems}</div></div>
</section>

<main class="wrap">
  <div class="front">
    <div class="col">
      <div class="sec"><h2>${esc(t.inThisIssue)}</h2><span class="note">${esc(t.issueLine1)}</span></div>
      <div class="lead-cover">
        <img src="${IMG}${D.magazine.cover}" alt="">
        <div>
          <h3 class="lead-h">${esc(txt(D.magazine.coverText))}</h3>
          <p class="lead-p q">${esc(txt(D.about.claim))}</p>
          <div class="btns"><a class="btn red" href="#">${esc(t.readIssue)}</a><a class="btn" href="#">${esc(t.pdf)}</a></div>
        </div>
      </div>
      <div class="sec sm" style="margin-top:26px"><h2>${esc(t.contents)}</h2><span class="note">13 ${ar ? 'مقالاً · 45 صفحة إعلان · 100 صفحة' : 'articles · 45 ad pages · 100 pages'}</span></div>
      <ul class="toc">${tocHtml}</ul>
      <a class="more" href="#">${esc(t.allContents)}</a>
    </div>

    <div class="col">
      <div class="sec"><h2>${esc(t.shows)}</h2><span class="note">${esc(t.showsNext)}</span></div>
      <div class="shows">${showHtml}</div>
      <div class="btns"><a class="btn red wide" href="#">${esc(t.allShows)}</a></div>
      <div class="sec sm" style="margin-top:26px"><h2>${esc(t.byCountry)}</h2></div>
      <ul class="clist">${countryHtml}</ul>
    </div>

    <div class="col">
      <div class="sec"><h2>${esc(t.club)}</h2></div>
      <div class="seal">
        <svg viewBox="0 0 200 200"><defs><path id="ring" d="M100,100 m-77,0 a77,77 0 1,1 154,0 a77,77 0 1,1 -154,0"/></defs>
          <circle cx="100" cy="100" r="98" fill="none" stroke="#D21F26" stroke-width="3"/><circle cx="100" cy="100" r="90" fill="none" stroke="#D21F26" stroke-width="1.5"/><circle cx="100" cy="100" r="63" fill="none" stroke="#D21F26" stroke-width="1.5"/>
          <text direction="ltr" style="direction:ltr;unicode-bidi:isolate" font-family="Libre Franklin, Arial, sans-serif" font-weight="800" font-size="16" fill="#D21F26"><textPath href="#ring" startOffset="0" textLength="480" lengthAdjust="spacing">AAT BUSINESS CLUB • SINCE 1982 • TAIWAN •</textPath></text>
        </svg>
        <div class="in"><img src="${IMG}img/brand/aat-logo-red.svg" alt=""><b>${ar ? 'نادي رجال الأعمال' : 'AATBC'}</b></div>
      </div>
      <p class="big">2,831</p>
      <p class="bl">${esc(t.members)}</p>
      <p style="margin:0;font-size:18px;line-height:1.75">${esc(txt(D.club.lead))}</p>
      <ul class="ben">${benefits}</ul>
      <div class="btns"><a class="btn red wide" href="#">${esc(t.join)}</a><a class="btn wide" href="#">${esc(t.clubMore)}</a></div>
    </div>
  </div>

  <div class="figs">${figs}</div>

  <section style="margin-top:44px">
    <div class="sec"><h2>${esc(t.advertisers)}</h2><span class="note">${esc(t.advNote)}</span></div>
    <div class="advs">${advHtml}</div>
  </section>

  <section style="margin-top:44px">
    <div class="sec"><h2>${esc(t.articles)}</h2><span class="note">${esc(t.issueLine1)}</span></div>
    <div class="arts">
      <div>
        <img class="al-pic" src="${IMG}${lead.img}" alt="">
        <h3 class="al-h">${esc(txt(lead.title))}</h3>
        <p class="al-p">${esc(txt(lead.summary))}</p>
        <div class="al-m"><span class="pg">${esc(t.page)} ${lead.magPage}</span></div>
      </div>
      <div>
        <ul class="alist">${artList}</ul>
        <a class="more" href="#">${esc(t.moreArticles)}</a>
      </div>
    </div>
  </section>

  <section style="margin-top:44px">
    <div class="sec"><h2>${esc(t.news)}</h2></div>
    <div class="news">${newsHtml}</div>
  </section>

  <section style="margin-top:44px">
    <div class="sec"><h2>${esc(t.cardTitle)}</h2><span class="note">${esc(t.cardLead)}</span></div>
    <div class="card">
      <div class="card-h"><span>${esc(t.inMag)} · ${esc(t.page)} ${card.page}</span><span class="pg" style="color:var(--ink2)">${esc(txt(D.cats[card.cat]))}</span></div>
      <div class="card-b">
        <img class="logo" src="${IMG}${card.logo}" alt="">
        <div class="card-n"><bdi>${esc(card.company)}</bdi></div>
        <div class="card-c">${esc(txt(card.city))}</div>
        <p class="card-p">${esc(txt(card.about))}</p>
        <ul>${cardProducts}</ul>
        <div class="btns"><a class="btn red" href="#">${esc(t.contactCo)}</a><a class="btn" href="#">${esc(t.seeProducts)}</a></div>
        <p style="margin:14px 0 0"><a class="link" href="#">${esc(card.web.replace(/^https?:\/\//, ''))}</a></p>
      </div>
    </div>
  </section>
</main>

<section class="band">
  <div class="wrap">
    <div class="sec"><h2>${esc(t.contact)}</h2></div>
    <div class="contact">
      <div>
        <p style="margin:0 0 10px">${esc(t.contactLead)}</p>
        <a class="tel" href="tel:+886966404681">+886 966 404681</a>
        <div class="kv" style="margin-top:10px"><b>${esc(t.apps)}</b></div>
        <div class="apps">${appsHtml}</div>
        <dl class="kv">
          <dt>${esc(t.email)}</dt><dd><a href="mailto:info@aatworld.com">info@aatworld.com</a></dd>
          <dt>${esc(t.address)}</dt><dd class="addr">P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.</dd>
        </dl>
      </div>
      <div class="nl">
        <h3>${esc(t.nlTitle)}</h3>
        <p>${esc(t.nlLead)}</p>
        <form onsubmit="return false"><input type="email" placeholder="name@company.com" aria-label="${esc(t.nlLabel)}"><button class="btn red" type="submit">${esc(t.nlBtn)}</button></form>
      </div>
    </div>
  </div>
</section>

<footer class="foot">
  <div class="wrap">
    <div>
      <img class="logo" src="${IMG}img/brand/aat-logo-white.svg" alt="AAT">
      <div class="names">${t.strip.join(' · ')}</div>
      <p>${esc(t.footPub)}</p>
      <p>${esc(t.footClaim)}</p>
    </div>
    <div>
      <h4>${esc(t.footSections)}</h4>
      <ul>${t.nav.slice(1).map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    </div>
    <div>
      <h4>${esc(t.contact)}</h4>
      <dl class="kv">
        <dt>${esc(t.phoneLabel)}</dt><dd class="lt" style="font-weight:800;font-size:22px">+886 966 404681</dd>
        <dt>${esc(t.email)}</dt><dd><a href="mailto:info@aatworld.com">info@aatworld.com</a></dd>
        <dt>${esc(t.address)}</dt><dd class="addr">P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.</dd>
      </dl>
    </div>
    <div class="bottom"><span>${esc(t.footRights)}</span><span class="lt">www.aatworld.com</span></div>
  </div>
</footer>

<a class="chat" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 5h16v11H9l-5 4z"/></svg>${esc(t.chat)}</a>
</body>
</html>`;
}

for (const L of ['ar', 'en']) {
  const html = build(L);
  fs.writeFileSync(path.join(HERE, `tile-${L}.html`), html);
  console.log('wrote tile-' + L + '.html', (html.length / 1024).toFixed(1), 'KB');
}
