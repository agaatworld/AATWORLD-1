/* verifies data.json: counts, image paths, sample budget. Run: node _work/site-v3/data/verify.js */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
const products = D.companies.reduce((a, c) => a + c.products.length, 0);
const productsWithImage = D.companies.reduce((a, c) => a + c.products.filter(p => p.img).length, 0);
const counts = { companies: D.companies.length, products, productsWithImage, productsPicturedOnOldSite: D.companies.reduce((a, c) => a + c.products.filter(p => p.hasImage).length, 0),
  logos: D.companies.filter(c => c.logo).length, modern: D.modern.length, modernPictured: D.modern.filter(m => m.image).length, articles: D.articles.length, articlesPictured: D.articles.filter(a => a.img).length,
  news: D.news.length, newsPictured: D.news.filter(n => n.img).length, shows: D.shows.length, shows2027: D.shows.filter(s => s.start < '2028').length, shows2028plus: D.shows.filter(s => s.start >= '2028').length,
  showsMonthOnly: D.shows.filter(s => s.approx).length, countries: Object.keys(D.countries).length, fields: D.fields.length, fieldsSum: D.fields.reduce((a, f) => a + f.count, 0), members: D.club.members.names.length,
  i18nLangs: Object.keys(D.i18n), i18nKeys: Object.keys(D.i18n.ar).length, tocArticles: D.magazine.toc.articles.length, tocAds: D.magazine.toc.ads.length };
/* every "img/..." string anywhere in the data must exist */
const refs = new Set(); (function walk(v) { if (typeof v === 'string') { if (/^img\//.test(v) && !/NNN/.test(v)) refs.add(v); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(D);
const missing = [...refs].filter(p => !fs.existsSync(path.join(ROOT, p)));
/* magazine prototype pages */
for (let p = 1; p <= D.magazine.prototypePages; p++) { const n = String(p).padStart(3, '0'); [D.magazine.pageImage, D.magazine.thumb].forEach(pat => { const f = pat.replace('NNN', n); if (!fs.existsSync(path.join(ROOT, f))) missing.push(f); }); }
/* old-site paths that slipped through */
const stale = []; (function walk(v, k) { if (typeof v === 'string' && /^assets\/img\//.test(v)) stale.push(k + ': ' + v); else if (Array.isArray(v)) v.forEach((x, i) => walk(x, k + '[' + i + ']')); else if (v && typeof v === 'object') Object.keys(v).forEach(kk => walk(v[kk], k + '.' + kk)); })(D, '$');
/* files and bytes under img */
let files = 0, bytes = 0; (function du(d) { fs.readdirSync(d).forEach(f => { const p = path.join(d, f), st = fs.statSync(p); if (st.isDirectory()) du(p); else { files++; bytes += st.size; } }); })(path.join(ROOT, 'img'));
const mb = bytes / 1048576;
console.log(JSON.stringify(counts, null, 1));
console.log('image refs', refs.size, 'missing', missing.length, missing.slice(0, 10));
console.log('stale assets/img paths', stale.length, stale.slice(0, 5));
console.log('img files', files, 'MB', mb.toFixed(2), files < 180 && mb < 8 ? 'OK (under 180 files and 8 MB)' : 'OVER BUDGET');
console.log('data.json MB', (fs.statSync(path.join(__dirname, 'data.json')).size / 1048576).toFixed(2));
if (missing.length || stale.length || files >= 180 || mb >= 8) process.exit(1);
