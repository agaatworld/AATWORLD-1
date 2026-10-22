/* =============================================================================
   AAT World v3 · js/pages/companies.js — STUB written by the architect.
   Owner: the companies page builder (replace this stub completely). Only this builder edits this file
   and css/companies.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'companies', 'company'
   Spec: DESIGN.md §6.5, §6.6. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .co-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('companies.' + k, v); };

  AAT.strings.companies = {
    ar: { h1: 'دليل الشركات' },
    en: { h1: 'Company directory' }
  };

  AAT.pages.companies = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      if (ctx.head === 'company' && !AAT.company(ctx.id)) return null; // unknown company → 404
      return AAT.ui.openingBoard({ h1: t('h1'), figure: { n: String(AAT.stats.companies), label: AAT.count(AAT.stats.companies, 'advertiser', true) } });
    }
  };
}());
