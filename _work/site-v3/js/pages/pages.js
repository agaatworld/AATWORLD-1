/* =============================================================================
   AAT World v3 · js/pages/pages.js — #about · #advertise · #contact · #privacy · 404
   Owner: the architect. THIS IS THE PATTERN PAGE BUILDERS COPY:
     1. strings in AAT.strings.<module> = { ar:{…}, en:{…} } (only UI copy that is not in data.json)
     2. one render function per route, built from AAT.ui components, returning an HTML string
     3. bands: navy opening board → paper → floor → (one navy feature band) → … ; the app adds the
        floor contact band and the navy footer, so the last band of a page must NOT be floor.
     4. AAT.pages.<module> = { render(ctx), title?(ctx), contactBand?(ctx), mount?(ctx, view), unmount?() }
   Styles for this module live in css/site.css §12 (classes .pg-*).
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT, D = AAT.data, ui = AAT.ui, esc = AAT.esc;
  var t = function (k, v) { return AAT.t('pages.' + k, v); };

  AAT.strings.pages = {
    ar: {
      ways: 'طرق التواصل', ask_btn: 'اسأل AAT', home: 'الرئيسية', exhibitions: 'معارض دولية', magazine: 'المجلة',
      example: 'مثال من هذا العدد:', wa: 'راسلنا على واتساب'
    },
    en: {
      ways: 'Ways to reach us', ask_btn: 'Ask AAT', home: 'Home', exhibitions: 'International exhibitions', magazine: 'The magazine',
      example: 'Example this issue:', wa: 'Message us on WhatsApp'
    }
  };

  /** WhatsApp link to AAT's number with a ready message (opens in a new tab) */
  function waHref(msg) { return 'https://wa.me/' + D.config.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function paras(list) { return (list || []).map(function (p) { return '<p>' + AAT.txt(p) + '</p>'; }).join(''); }

  /* ---------- #about — من نحن (DESIGN.md §6.15) ---------- */
  function about() {
    var A = D.about, F = A.facts, M = D.magazine;
    var picture = '<div class="pg-about-pic">' + ui.frame({ src: M.cover, alt: AAT.issueLine(), w: 617, h: 873, eager: true, cls: 'pg-cover' }) +
      ui.counters([
        { n: F.years, label: AAT.L(F.labels.years) },
        { n: F.issues, label: AAT.L(F.labels.issues) }
      ], { cls: 'pg-cnts' }) + '</div>';
    var board = ui.openingBoard({
      h1: AAT.L(A.title), lead: AAT.t('am_title'),
      figure: { n: String(F.since), label: AAT.L(F.labels.since) },
      picture: picture
    });
    var text = '<div class="cols pg-about"><div class="prose">' + paras(A.paragraphs[AAT.o] && A.paragraphs[AAT.o].length ? A.paragraphs[AAT.o] : A.paragraphs.ar) + '</div>' +
      '<aside class="board board-red board-pad pg-aside"><p class="pg-aside-t">' + AAT.txt(AAT.t('ab4')) + '</p><p>' + AAT.Lh(A.claim) + '</p></aside></div>';
    var group = ui.section({ id: 'about-group', band: 'paper', title: AAT.L(D.config.groupName), body: text });
    var mag = ui.section({
      id: 'about-magazine', band: 'night', title: t('magazine'),
      action: { label: AAT.t('mb_read', { n: M.number }), href: '#flip-1', kind: 'red' },
      body: '<div class="cols pg-mag"><div class="prose pg-on-night">' + paras([AAT.t('am_p1'), AAT.t('am_p2'), AAT.t('am_p3')]) + '</div>' +
        ui.spread({ a: 2, b: 3, caption: AAT.rtl ? 'صفحتا 2 و3 من العدد' : 'Pages 2 and 3 of the issue' }) + '</div>'
    });
    return board + group + mag; // navy → paper → navy → (floor contact band) → navy footer
  }

  /* ---------- #advertise — أعلن معنا (DESIGN.md §6.16) ---------- */
  function advertise() {
    var A = D.advertise, M = D.magazine, S = AAT.stats;
    var board = ui.openingBoard({
      h1: AAT.t('adv_btn'), lead: AAT.L(A.lead),
      figure: { n: String(M.number), label: AAT.L(D.about.facts.labels.issues) },
      picture: ui.spread({ a: 2, b: 3, eager: true, caption: AAT.rtl ? 'صفحتا 2 و3 من العدد' : 'Pages 2 and 3 of the issue' })
    });
    var cards = A.positions.slice().sort(function (a, b) { return a.order - b.order; }).map(function (p) {
      var ex = p.exampleCompanyId != null ? AAT.company(p.exampleCompanyId) : null;
      var exHtml = ex && AAT.src(ex.logo) ? '<div class="pg-ex"><span class="label">' + esc(AAT.L(A.exampleLabel)) + '</span><a class="pg-ex-co" href="#company-' + ex.id + '">' +
        AAT.img(ex.logo, { alt: ex.company, w: 160, h: 64 }) + (AAT.lang === 'ar' && ex.nameAr ? '<b>' + esc(ex.nameAr) + '</b>' : AAT.ltb(ex.company, 'b', 'clamp2')) + '</a></div>' : '';
      var web = (p.web && (p.web[AAT.o] || p.web.en)) || [];
      return '<article class="board board-red pg-pos"><h3 class="h3">' + esc(AAT.L(p.name)) + '</h3><p class="pg-print">' + AAT.txt(AAT.L(p.print)) + '</p>' +
        '<ul class="pg-web">' + web.map(function (w) { return '<li>' + AAT.icon('check', 22) + '<span>' + AAT.txt(w) + '</span></li>'; }).join('') + '</ul>' + exHtml + '</article>';
    }).join('');
    var positions = ui.section({ id: 'ad-positions', band: 'paper', title: AAT.L(A.positionsKicker), meta: AAT.L(A.positionsTitle), body: '<div class="grid g-3 pg-poss">' + cards + '</div>' });
    var digital = ui.section({
      id: 'ad-digital', band: 'floor', title: AAT.L(A.digital.title),
      body: '<p class="lead pg-digital">' + AAT.Lh(A.digital.text) + '</p>' + ui.counters([
        { n: S.companies, label: AAT.count(S.companies, 'advertiser', true), sub: AAT.t('app.issue_n', { n: M.number }), href: '#companies' },
        { n: S.products, label: AAT.count(S.products, 'product', true), sub: (AAT.rtl ? 'من ' : 'from ') + AAT.count(S.prodCos, 'company'), href: '#products' },
        { n: A.languagesCount, label: AAT.L(A.languagesLabel) }
      ], { cls: 'pg-cnts3' })
    });
    var C = D.config;
    var reach = ui.section({
      id: 'ad-contact', band: 'night', title: AAT.L(A.kicker),
      body: '<div class="cols pg-reach"><div class="stack"><p class="lead pg-mist">' + AAT.Lh(A.contactText) + '</p>' +
        '<div class="cf">' + ui.phone({ night: true }) + '</div>' +
        '<div class="btnrow">' + ui.button({ label: t('wa'), href: waHref(AAT.L(A.message)), newTab: true, icon: 'chat' }) + '</div>' +
        '<div class="cf">' + ui.mail(C.email, { copy: true, night: true }) + '</div></div>' +
        '<div class="pg-apps-panel">' + ui.appIcons({ size: 64 }) + '</div></div>'
    });
    return board + positions + digital + reach; // navy → paper → floor → navy → (floor contact band)
  }

  /* ---------- #contact — تواصل معنا (DESIGN.md §6.17) ---------- */
  function contact() {
    var C = D.config;
    var board = ui.openingBoard({
      h1: AAT.t('app.con_title'), lead: AAT.t('tn_p2'),
      extra: '<p class="pg-bigph"><a href="tel:' + esc(C.tel) + '"><bdi dir="ltr">' + esc(C.phone) + '</bdi></a></p>',
      picture: '<div class="pg-apps-panel">' + ui.appIcons({ size: 64 }) + '</div>'
    });
    var ways = ui.section({ id: 'contact-ways', band: 'paper', title: t('ways'), body: ui.contactCards({ big: true, editor: true }) });
    var ask = ui.section({
      id: 'contact-ask', band: 'floor', title: AAT.L(C.assistant.title),
      body: '<div class="pg-ask"><p class="lead">' + AAT.txt(AAT.t('chat_sub')) + '</p>' + ui.button({ label: t('ask_btn'), act: 'assistant', icon: 'chat' }) + '</div>'
    });
    return board + ways + ask; // navy → paper → floor → navy footer (no contact band on this page)
  }

  /* ---------- #privacy — الخصوصية (DESIGN.md §6.18) ---------- */
  function privacy() {
    var board = ui.openingBoard({ h1: AAT.t('privacy_title'), short: true });
    var text = String(AAT.t('x_privacy')).split('|').map(function (p) { return p.trim(); }).filter(Boolean);
    return board + ui.section({ id: 'privacy-text', band: 'paper', untitled: true, body: '<div class="prose">' + paras(text) + '</div>' });
  }

  /* ---------- 404 — الصفحة غير موجودة ---------- */
  function notFound() {
    return ui.openingBoard({
      h1: AAT.t('nf_title'), lead: AAT.t('nf_lead'), short: true,
      actions: ui.button({ label: t('home'), href: '#home', icon: 'home' }) + ui.button({ label: t('exhibitions'), href: '#exhibitions', kind: 'ghost', icon: 'cal' })
    });
  }

  var VIEWS = { about: about, advertise: advertise, contact: contact, privacy: privacy, '404': notFound };
  AAT.pages.pages = {
    /** render(ctx) → HTML for #about, #advertise, #contact, #privacy and the 404 page (also used by the router for unknown items) */
    render: function (ctx) {
      if (ctx.rest && ctx.head !== '404') return null;       // "#about-x" is not a page → 404
      var fn = VIEWS[ctx.head] || notFound;
      return fn(ctx);
    },
    /** the contact page shows its own cards, so the band above the footer is left out there */
    contactBand: function (ctx) { return ctx.head !== 'contact'; }
  };
}());
