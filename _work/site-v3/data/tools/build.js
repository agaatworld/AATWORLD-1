/* builds _work/site-v3/data/data.json from the runtime dump (raw.json), source constants (src.json) and the members list */
const fs = require('fs'), path = require('path');
const S = '/tmp/claude-0/-home-user/ac4d4ddb-24de-5266-a1be-7cec3105c99f/scratchpad';
const R = JSON.parse(fs.readFileSync(S + '/v3/raw.json', 'utf8'));
const SRC = JSON.parse(fs.readFileSync(S + '/v3/src.json', 'utf8'));
const MEM = JSON.parse(fs.readFileSync(S + '/members.json', 'utf8'));
const OLD = '/home/user/AATWORLD-1/assets/img/';
const OUT = '/home/user/AATWORLD-1/_work/site-v3/';
const ship = []; // [srcAbs, destRel under site root]
const shipped = new Set();
function shipImg(oldRel, destRel) { // oldRel: path under assets/img (or absolute); destRel: under site root e.g. img/logos/p3.png
  if (!oldRel) return null;
  const src = oldRel.startsWith('/') ? oldRel : OLD + oldRel.replace(/^assets\/img\//, '');
  if (!fs.existsSync(src)) { console.warn('MISSING source image', src); return null; }
  destRel = destRel || ('img/' + oldRel.replace(/^assets\/img\//, ''));
  if (!shipped.has(destRel)) { shipped.add(destRel); ship.push([src, destRel]); }
  return destRel;
}
const nz = v => (v === undefined || v === '' ? null : v);
const bi = (o, keys) => { // {ar,en,...} with null for missing
  if (!o) return { ar: null, en: null };
  const out = {}; (keys || ['ar', 'en']).forEach(k => { out[k] = nz(o[k]); });
  Object.keys(o).forEach(k => { if (!(k in out) && o[k] != null && o[k] !== '') out[k] = o[k]; });
  return out;
};
const I = R.i18n, T = (k) => ({ ar: nz(I.ar[k]), en: nz(I.en[k]), 'zh-TW': nz(I['zh-TW'][k]), 'zh-CN': nz(I['zh-CN'][k]), ms: nz(I.ms[k]) });
const T2 = (k) => ({ ar: nz(I.ar[k]), en: nz(I.en[k]) });

/* ---------- config ---------- */
const C = R.config;
const APPS = [
  { name: 'WhatsApp', action: 'chat', url: 'https://wa.me/' + C.whatsapp, icon: null },
  { name: 'Viber', action: 'chat', url: 'viber://chat?number=%2B' + C.whatsapp, icon: null },
  { name: 'Botim', action: 'copy', url: null, icon: shipImg('apps/botim.png') },
  { name: 'imo', action: 'copy', url: null, icon: shipImg('apps/imo.png') },
  { name: 'BiP', action: 'copy', url: null, icon: shipImg('apps/bip.png') },
  { name: 'LINE', action: 'copy', url: null, icon: null }
];
const config = {
  siteName: { ar: 'التجارة العربية الآسيوية', en: 'Arab Asian Trade', zh: '中阿商業雜誌' },
  groupName: { ar: 'مجموعة التجارة العربية الآسيوية', en: 'Arab Asian Trade Group' },
  tagline: 'Ideas For Business',
  owner: 'Mohamad Marwan Fattal',
  phone: C.phoneDisplay, whatsapp: C.whatsapp, tel: '+' + C.whatsapp,
  email: C.email, editorEmail: C.editorEmail, clubEmail: C.clubEmail,
  address: { en: C.address.en, ar: C.address.ar, rule: 'Always shown in English, even on the Arabic site (owner decision 19 Oct 2026).' },
  siteUrl: C.siteUrl, since: R.magazine.since, years: R.magazine.years,
  apps: APPS,
  logo: { png: shipImg('logo.png'), red: shipImg('/home/user/AATWORLD-1/_work/brand/logo/aat-logo-red.svg', 'img/brand/aat-logo-red.svg'), white: shipImg('/home/user/AATWORLD-1/_work/brand/logo/aat-logo-white.svg', 'img/brand/aat-logo-white.svg'), red_hex: '#D21F26' },
  languages: R.langs.map(l => ({ code: l[0], name: l[1], short: l[2], dir: l[0] === 'ar' ? 'rtl' : 'ltr' })),
  newsletter: { title: T2('nl_title'), lead: T2('nl_lead'), button: T2('nl_btn'), label: T2('nl_label'), endpoint: 'api/subscribe.php' },
  assistant: { enabled: true, title: T2('chat_title'), hello: T2('chat_hello'), placeholder: T2('chat_ph') },
  calendarNote: bi(C.calendarNote)
};

/* ---------- categories ---------- */
const cats = {}; Object.keys(R.cats).forEach(k => { cats[k] = bi(R.cats[k], ['ar', 'en']); });

/* ---------- companies ---------- */
const tocAds = SRC.toc.ads;
const companies = R.companies.map(c => {
  const cname = c.company.replace(/\s*\(.*\)\s*$/, '').trim();
  const tocRows = tocAds.filter(a => a.n === c.company || a.n === cname || c._pages.includes(a.p));
  const pages = Array.from(new Set([].concat(c._pages, tocRows.map(a => a.p)))).sort((a, b) => a - b);
  const t0 = tocRows[0] || {};
  const prods = c._products.map((it, k) => {
    let d = it.d ? bi(it.d) : (c._prodDesc[k] && (c._prodDesc[k].en || c._prodDesc[k].ar) ? { ar: nz(c._prodDesc[k].ar), en: nz(c._prodDesc[k].en) } : null);
    return { k, n: it.n, d, img: it.img || null, url: nz(it.url), src: it.src, hasImage: !!it.img };
  });
  // prototype: first 2 pictures per company
  let n = 0; prods.forEach(p => { if (p.img && n < 2) { p.img = shipImg(p.img); n++; } else p.img = null; });
  return {
    id: c.page, page: c.page, pages, cat: c.cat, company: c.company, nameAr: nz(t0.ar),
    city: bi(c.city), about: bi(c.about), tel: nz(c.tel), tels: t0.tels && t0.tels.length ? t0.tels : (c.tel ? [c.tel] : []), whatsapp: nz(t0.wa),
    email: nz(c.email), web: nz(c.web), address: nz(c.address), certs: nz(c.certs),
    logo: c._logo ? shipImg(c._logo) : null, tier: c._tier, inMagazine: !!c._inMag,
    products: prods
  };
});
// brand mini-site content (from assets/js/brand.js, English, keyed by page)
const BR = (() => { const W = {}; global.window = W; eval(fs.readFileSync('/home/user/AATWORLD-1/assets/js/brand.js', 'utf8')); return W.AAT_BRAND || {}; })();
const KIND = { a: 'about', p: 'products', c: 'contact', x: 'solutions' };
companies.forEach(c => {
  const b = BR[String(c.page)];
  c.site = b ? { colors: { main: b.a, second: b.b, text: b.on }, headline: nz(b.h), slogans: b.s || [], sections: (b.m || []).map(m => ({ name: m.n, kind: KIND[m.k] || 'other', summary: nz(m.s), items: m.i || [] })) } : null;
});

/* ---------- modern products and industries ---------- */
const sectorPics = new Set(Object.values(R.indPics).filter(Boolean).map(p => p.replace('assets/img/', '')));
const modernGroups = Object.keys(R.modernG).map(k => ({ id: k, name: bi(R.modernG[k], ['ar', 'en', 'zh-TW', 'zh-CN', 'ms']), count: R.modern.filter(m => m.g === k).length }));
const modernPick = new Set();
modernGroups.forEach(g => {
  const items = R.modern.map((m, i) => ({ m, i })).filter(x => x.m.g === g.id);
  items.sort((a, b) => (sectorPics.has(a.m.img.replace('assets/img/', '')) ? 0 : 1) - (sectorPics.has(b.m.img.replace('assets/img/', '')) ? 0 : 1) || a.i - b.i);
  items.slice(0, 3).forEach(x => modernPick.add(x.i));
});
function parseModern(body) {
  /* generic: "## " lines open a section; contact facts are picked by pattern from the whole text */
  const sections = []; let cur = { heading: null, lines: [] };
  body.forEach(line => { if (/^##\s*/.test(line)) { if (cur.lines.length || cur.heading) sections.push(cur); cur = { heading: line.replace(/^##\s*/, '').trim(), lines: [] }; } else cur.lines.push(line); });
  if (cur.lines.length || cur.heading) sections.push(cur);
  const all = body.join('\n');
  const emails = Array.from(new Set((all.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) || [])));
  const urls = Array.from(new Set((all.match(/(?:https?:\/\/|www\.)[^\s\u0600-\u06FF"']+/g) || []).map(u => u.replace(/[.,;:)]+$/, ''))));
  const phones = Array.from(new Set((all.match(/(?:\+|00)\d[\d\s\-\u2013()]{7,}\d/g) || []).map(x => x.trim())));
  const firstPara = body.find(l => !/^##/.test(l) && l.length >= 80) || body.find(l => !/^##/.test(l)) || null;
  return { sections, contact: { emails, urls, phones }, firstPara };
}
const modern = R.modern.map((m, i) => {
  const p = parseModern(m.body);
  return { id: i, group: m.g, name: { ar: m.t, en: nz(m.en) }, web: nz(m.web), image: modernPick.has(i) ? shipImg(m.img.replace('assets/img/', '')) : null,
    sections: p.sections, contact: p.contact, body: m.body, description: { ar: p.firstPara, en: null } };
});

/* ---------- home sectors (industry tiles) ---------- */
const homeSectors = R.INDUSTRIES.map(x => {
  const pic = R.indPics[x.slug] ? R.indPics[x.slug].replace('assets/img/', '') : '';
  const picRel = pic ? 'img/' + pic : null;
  return { slug: x.slug, title: T2('ln_' + x.img), desc: T2('ln_' + x.img + '_d'), cats: x.cats, modernGroups: x.ind, image: picRel && shipped.has(picRel) ? picRel : null };
});

/* ---------- articles ---------- */
const tocArt = SRC.toc.articles;
const norm = s => String(s || '').replace(/\s+/g, '');
const ARTPICS = ['ar26-1', 'ar26-2', 'ar26-3', 'ar26-4', 'ar26-5', 'ar26-6'];
const articles = R.articles.map(a => {
  const tp = tocArt.find(t => norm(t.t) === norm(a.title.ar));
  const body = {}; ['ar', 'en'].forEach(l => { body[l] = Array.isArray(a.body[l]) && a.body[l].length ? a.body[l] : null; });
  return { id: a.id, lang: a.lang, fresh: !!a.fresh, title: bi(a.title), summary: bi(a.sum), author: nz(a.author), date: null, cat: nz(a.cat),
    img: ARTPICS.includes(a.id) ? shipImg(a.img) : null, hasImage: !!a.img, magPage: tp ? tp.p : null, body };
});

/* ---------- news ---------- */
const NEWSPICS = ['news1.jpg', 'news2.jpg', 'news3.jpg', 'arn1.jpg', 'arn2.jpg', 'enn1.jpg'];
const news = R.news.map((n, i) => {
  const b = R.newsBody[i] || {};
  const body = {}; Object.keys(b.body || {}).forEach(l => { if (Array.isArray(b.body[l]) && b.body[l].length) body[l] = b.body[l]; });
  if (!body.ar) body.ar = null; if (!body.en) body.en = null;
  return { id: n.id, lang: n.only || 'both', title: bi(n.title), date: nz(b.date), source: nz(b.source), img: NEWSPICS.includes(n.img) ? shipImg(n.img) : null, hasImage: true, body };
});

/* ---------- exhibitions ---------- */
const SEC_EN = SRC.SEC_EN;
const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fieldIds = {}; Object.keys(SEC_EN).forEach(ar => { fieldIds[ar] = slug(SEC_EN[ar]); });
const HAND_FIELD = { machinery: 'آلات وأدوات ومعادن', mobility: 'نقل وسيارات ولوجستيات', safety: 'أمن وسلامة', energy: 'طاقة ونفط وغاز', electronics: 'إلكترونيات وإضاءة', hardware: 'آلات وأدوات ومعادن', food: 'أغذية ومشروبات', health: 'صحة وتجميل وأدوية', marine: 'نقل وسيارات ولوجستيات' };
const cityAr = R.cities;
const shows = R.events.map(e => {
  const cityKey = e.city || '';
  const cityEn = cityAr[cityKey] ? cityAr[cityKey].en : (cityKey || null);
  const cityA = cityAr[cityKey] ? nz(cityAr[cityKey].ar) : null;
  let venue = e.venue && e.venue.en ? e.venue.en : null;
  if (venue && cityEn && venue.endsWith(', ' + cityEn)) venue = venue.slice(0, -(cityEn.length + 2));
  if (venue && cityEn && venue === cityEn) venue = null;
  const venueAr = e.venue && e.venue.ar && e.venue.ar !== e.venue.en ? e.venue.ar : null;
  const fieldAr = e.sector ? e.sector.ar : HAND_FIELD[e.industry];
  const o = { id: e.id, name: e.name, start: e.start, end: e.end, cc: e.country, city: { en: cityEn, ar: cityA }, venue: { en: venue, ar: venueAr },
    sector: e.sector ? e.sector.en : (e.themes && e.themes.en ? e.themes.en.join(', ') : null), field: fieldIds[fieldAr] || null, approx: e.approx ? 1 : 0 };
  if (!e.ext) { o.summary = bi(e.summary); o.themes = e.themes || null; if (e.url && !/eventseye/.test(e.url)) o.web = e.url; }
  return o;
});
const fields = Object.keys(SEC_EN).map(ar => ({ id: fieldIds[ar], ar, en: SEC_EN[ar], count: shows.filter(s => s.field === fieldIds[ar]).length })).sort((a, b) => b.count - a.count);
const countries = {}; Object.keys(R.countries).forEach(cc => {
  const f = fs.existsSync(OLD + 'flags/' + cc + '.svg') ? 'flags/' + cc + '.svg' : 'flags/' + cc + '.png';
  countries[cc] = { ar: R.countries[cc].ar, en: R.countries[cc].en, flag: shipImg(f), shows: shows.filter(s => s.cc === cc).length };
});

/* ---------- club ---------- */
const club = {
  title: T2('mem_title'), name: { ar: 'نادي رجال الأعمال', en: 'AAT Business Club' }, lead: T2('mem_lead'),
  goals: { title: T2('cb_goals'), p1: T2('cb_goals_p'), p2: T2('cb_goals_p2') },
  benefitsTitle: T2('cb_ben'), benefits: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ n, ar: I.ar['cb_b' + n], en: I.en['cb_b' + n] })),
  partners: { title: T2('cb_partners'), text: T2('cb_partners_p') },
  join: { title: T2('cb_join'), message: T2('cb_join_wa'), more: T2('cb_more'), email: C.clubEmail, phone: C.phoneDisplay, whatsapp: C.whatsapp },
  members: { count: MEM.count, source: 'https://aatworld.com/members/list.php (21 Oct 2026)', names: MEM.members.map(m => m.name) },
  turnkey: { ar: R.turnkey, en: null, relatedArticles: ['turnkey-projects', 'industrial-project-studies'] }
};

/* ---------- about, advertise ---------- */
const about = {
  title: T2('about_title'), lead: T2('about_lead'), paragraphs: { ar: SRC.about.ar, en: SRC.about.en },
  facts: { years: R.magazine.years, since: R.magazine.since, issues: R.magazine.issue, labels: { years: T2('fact_years'), issues: T2('fact_issues'), since: T2('fact_since'), published: { ar: 'أصدرنا', en: 'We have published' } } },
  claim: T2('mb_claim'), first: T2('h82_first'), heroLead: T2('hero_lead'), yearsWord: T2('yrs_word'), sinceWord: T2('yrs_since'),
  cover: bi(R.magazine.cover), tagline: bi(R.magazine.tagline)
};
const noReport = /report|تقرير|報告|报告|laporan/i;
const POS = ['cover', 'back', 'spread', 'premium', 'full', 'half'];
const advertise = {
  kicker: T2('ad_kicker'), title: T2('ad_title'), lead: T2('ad_lead'), languagesLabel: T2('ad_langs'), languagesCount: 5, message: T2('ad_wa'),
  positionsTitle: T2('ad_pos_title'), positionsKicker: T2('ad_pos_kicker'), exampleLabel: T2('pos_example'),
  positions: POS.map((k, i) => { const ex = companies.find(c => c.tier === k); return { id: k, order: i + 1, name: T2('pos_' + k), print: T2('pos_' + k + '_p'),
    web: { ar: I.ar['pos_' + k + '_w'].split('|').filter(w => !noReport.test(w)), en: I.en['pos_' + k + '_w'].split('|').filter(w => !noReport.test(w)) }, exampleCompanyId: ex ? ex.id : null }; }),
  digital: { title: T2('ad_digital_t'), text: T2('ad_digital_d') }, contactText: T2('tn_p2'), contactTitle: T2('chat_person')
};

/* ---------- magazine ---------- */
const magazine = {
  number: 560, month: bi(R.magazine.month), pages: 100, prototypePages: 12, since: R.magazine.since, years: R.magazine.years,
  name: bi(R.magazine.name), chinese: R.magazine.chinese, tagline: bi(R.magazine.tagline), coverText: bi(R.magazine.cover),
  cover: shipImg('magazine-560.jpg'), pdf: 'https://aatworld.com/issue560/AAT-560-October-2026.pdf?v=36',
  pageImage: 'img/mag560/pNNN.jpg', thumb: 'img/mag560/t/pNNN.jpg', pageSize: { w: 1100, h: 1555 }, thumbSize: { w: 220, h: 311 },
  toc: {
    articles: tocArt.map(t => { const a = articles.find(x => norm(x.title.ar) === norm(t.t)); return { page: t.p, title: { ar: t.t, en: a && a.title.en ? a.title.en : null }, articleId: a ? a.id : null }; }),
    ads: tocAds.map(a => { const c = companies.find(x => x.pages.includes(a.p)); return { page: a.p, companyId: c ? c.id : null, company: a.n, nameAr: nz(a.ar), cat: a.cat, city: a.city, web: nz(a.web), email: nz(a.email), tels: a.tels || [] }; })
  },
  companyPages: companies.map(c => ({ companyId: c.id, pages: c.pages }))
};
for (let p = 1; p <= 12; p++) { const n = String(p).padStart(3, '0'); ship.push(['/home/user/AATWORLD-1/_work/tools/pdfpages/p' + n + '.jpg', 'img/mag560/p' + n + '.jpg', 'page']); ship.push(['/home/user/AATWORLD-1/_work/tools/pdfpages/p' + n + '.jpg', 'img/mag560/t/p' + n + '.jpg', 'thumb']); }

/* translation map for content strings (zh-TW, zh-CN, ms): drop stale keys (old address, issue 559 month) */
const tx = {}; Object.keys(R.tx).forEach(l => { tx[l] = {}; Object.keys(R.tx[l]).forEach(k => { if (/Yongqiao|P\.O\. Box 5,|August 2026/.test(k)) return; tx[l][k] = R.tx[l][k]; }); });
/* ---------- assemble ---------- */
const data = {
  meta: { built: new Date().toISOString().slice(0, 10), source: 'aatworld.com repo AATWORLD-1 (update 36), runtime objects read from http://localhost:8765/ with Playwright', prototype: true, imageRule: 'img: null means the picture exists on the old site but is not shipped in the prototype sample; show the item without a picture box.' },
  config, magazine, cats, companies, modernGroups, modern, homeSectors, articles, news, shows, countries, fields, club, about, advertise,
  services: R.services, plans: R.plans, faqs: R.faqs, i18n: R.i18n, tx: tx, tradeMap: R.map
};
fs.mkdirSync(OUT + 'data', { recursive: true });
fs.writeFileSync(OUT + 'data/data.json', JSON.stringify(data, null, 1));
fs.writeFileSync(S + '/v3/ship.json', JSON.stringify(ship));
console.log('data.json', (fs.statSync(OUT + 'data/data.json').size / 1e6).toFixed(2), 'MB; ship list', ship.length, 'files');
console.log('companies', companies.length, 'products', companies.reduce((a, c) => a + c.products.length, 0), 'with pic on old site', companies.reduce((a, c) => a + c.products.filter(p => p.hasImage).length, 0), 'shipped pics', companies.reduce((a, c) => a + c.products.filter(p => p.img).length, 0));
console.log('modern', modern.length, 'pics', modern.filter(m => m.image).length, 'articles', articles.length, 'pics', articles.filter(a => a.img).length, 'news', news.length, 'pics', news.filter(n => n.img).length, 'shows', shows.length, 'no field', shows.filter(s => !s.field).length, 'fields', fields.length, 'members', club.members.count, club.members.names.length);
console.log('homeSectors with pic', homeSectors.filter(h => h.image).length, 'logos', companies.filter(c => c.logo).length);
console.log('modern with emails', modern.filter(m => m.contact.emails.length).length, 'urls', modern.filter(m => m.contact.urls.length).length, 'phones', modern.filter(m => m.contact.phones.length).length, 'sections avg', (modern.reduce((a, m) => a + m.sections.length, 0) / modern.length).toFixed(1));
