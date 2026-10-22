/* =============================================================================
   AAT World v3 · js/pages/magazine.js — STUB written by the architect.
   Owner: the magazine page builder (replace this stub completely). Only this builder edits this file
   and css/magazine.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'magazine', 'flip' (#flip, #flip-NN: the full-screen reader)
   Spec: DESIGN.md §6.3, §6.4. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .mg- / .rd-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('magazine.' + k, v); };

  AAT.strings.magazine = {
    ar: { h1: 'المجلة' },
    en: { h1: 'The magazine' }
  };

  AAT.pages.magazine = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      return AAT.ui.openingBoard({ h1: t('h1'), lead: AAT.issueLine() });
    },
    // the reader hides the site chrome (ribbon, masthead, menu, tab bar, contact band, footer):
    // chrome: function (ctx) { return ctx.head !== 'flip'; },
  };
}());
