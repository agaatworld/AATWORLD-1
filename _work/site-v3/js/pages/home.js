/* =============================================================================
   AAT World v3 · js/pages/home.js — STUB written by the architect.
   Owner: the home page builder (replace this stub completely). Only this builder edits this file
   and css/home.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'home' and the empty hash
   Spec: DESIGN.md §6.2. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .hm-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('home.' + k, v); };

  AAT.strings.home = {
    ar: { h1a: 'من مصانع آسيا', h1b: 'إلى أسواق العرب وأفريقيا' },
    en: { h1a: "From Asia's factories", h1b: 'to Arab and African markets' }
  };

  AAT.pages.home = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      return AAT.ui.openingBoard({ h1Html: AAT.esc(t('h1a')) + '<br>' + AAT.esc(t('h1b')), lead: AAT.L(AAT.data.about.claim) });
    }
  };
}());
