/* =============================================================================
   AAT World v3 · js/pages/reading.js — STUB written by the architect.
   Owner: the reading page builder (replace this stub completely). Only this builder edits this file
   and css/reading.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'reading', 'articles', 'news', 'article'
   Spec: DESIGN.md §6.12, §6.13. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .rg-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('reading.' + k, v); };

  AAT.strings.reading = {
    ar: { h1: 'مقالات وأخبار' },
    en: { h1: 'Articles & news' }
  };

  AAT.pages.reading = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      return AAT.ui.openingBoard({ h1: t('h1') });
    }
  };
}());
