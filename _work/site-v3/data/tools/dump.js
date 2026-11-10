const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.AAT && window.AAT.companies && window.AAT.companies.length > 0, null, { timeout: 30000 });
  const raw = await page.evaluate(() => {
    const A = window.AAT, D = A.D, W = window;
    function clone(o) { return JSON.parse(JSON.stringify(o === undefined ? null : o)); }
    const companies = A.companies.map(c => {
      const o = clone(c);
      o._logo = A.logoOf(c); o._products = clone(A.productsOf(c)); o._pages = A.companyPages(c); o._tier = c.tier;
      o._inMag = A.inMagazine(c); o._hasPage = A.hasPage(c);
      o._prodDesc = A.productsOf(c).map(it => ({ en: (A.setLang('en'), A.productDesc(c, it)), ar: (A.setLang('ar'), A.productDesc(c, it)) }));
      return o;
    });
    A.setLang('ar');
    const allP = A.allProducts().map(p => ({ page: p.c.page, k: p.k, n: p.it.n, img: p.it.img, src: p.it.src }));
    const ev = (D.events || []).filter(e => String(e.start) >= '2027-01-01');
    const evWin = A.eventsWindow(new Date()).length;
    return {
      config: clone(D.config), magazine: clone(D.magazine), IS: { number: A.IS.number, month: clone(A.IS.month), cover: A.IS.cover, pages: A.IS.pages, cats: clone(A.IS.cats), adsPages: A.IS.ads.map(a => a.page) },
      cats: clone(A.cats), catsExtra: clone(W.AAT_CATS_EXTRA), usedCats: A.usedCats(), companies, allP, allPCount: allP.length,
      articles: clone(A.articles), news: clone(D.news), newsBody: clone(A.newsBody),
      events: clone(ev), evWin, eventsAll: (D.events || []).length, events2026: (D.events || []).filter(e => String(e.start) < '2027-01-01').map(e => ({ id: e.id, name: e.name, start: e.start, end: e.end, country: e.country })),
      countries: clone(D.countries), cities: clone(D.cities), industriesD: clone(D.industries),
      modern: clone(W.AAT_MODERN), modernG: clone(W.AAT_MODERN_G), turnkey: clone(W.AAT_TURNKEY),
      i18n: clone(W.AAT_I18N), tx: clone(W.AAT_TX), map: clone(W.AAT_MAP),
      services: clone(D.services), plans: clone(D.plans), faqs: clone(D.faqs), suppliers: clone(D.suppliers),
      INDUSTRIES: clone(A.INDUSTRIES), indPics: Object.fromEntries(A.INDUSTRIES.map(x => [x.slug, A.indPic(x.img)])),
      logos: clone(W.AAT_LOGOS), langs: A.LANGS, custom: clone(W.AAT_CUSTOM), mzHome: W.AAT_MZ_HOME, update: W.AAT_UPDATE,
      brandKeys: Object.keys(W.AAT_BRAND || {}),
    };
  });
  fs.writeFileSync(process.argv[2], JSON.stringify(raw));
  console.log('pageerrors', errs);
  console.log('companies', raw.companies.length, 'allProducts', raw.allPCount, 'articles', raw.articles.length, 'news', raw.news.length, 'events2027+', raw.events.length, 'evWin', raw.evWin, 'eventsAll', raw.eventsAll, 'modern', raw.modern.length, 'countries', Object.keys(raw.countries).length);
  console.log('2026 events', raw.events2026.length);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
