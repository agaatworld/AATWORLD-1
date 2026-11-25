/* =============================================================================
   AAT World v3 · js/pages/club.js — STUB written by the architect.
   Owner: the club page builder (replace this stub completely). Only this builder edits this file
   and css/club.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'club'
   Spec: DESIGN.md §6.14. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .cl-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('club.' + k, v); };

  AAT.strings.club = {
    ar: { h1: 'نادي رجال الأعمال' },
    en: { h1: 'AAT Business Club' }
  };

  AAT.pages.club = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      return AAT.ui.openingBoard({ h1: t('h1'), picture: AAT.ui.seal(300) });
    }
  };
}());
