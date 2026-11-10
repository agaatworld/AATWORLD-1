/* =============================================================================
   AAT World v3 · js/pages/exhibitions.js — STUB written by the architect.
   Owner: the exhibitions page builder (replace this stub completely). Only this builder edits this file
   and css/exhibitions.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'exhibitions', 'exhibition'
   Spec: DESIGN.md §6.7, §6.8. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .ex-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('exhibitions.' + k, v); };

  AAT.strings.exhibitions = {
    ar: { h1: 'معارض دولية' },
    en: { h1: 'International exhibitions' }
  };

  AAT.pages.exhibitions = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      if (ctx.head === 'exhibition' && !AAT.show(ctx.rest)) return null; // unknown show → 404
      return AAT.ui.openingBoard({ h1: t('h1'), figure: { n: AAT.num(AAT.stats.shows), label: AAT.count(AAT.stats.shows, 'intl', true) } });
    }
  };
}());
