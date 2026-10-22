/* =============================================================================
   AAT World v3 · js/pages/products.js — STUB written by the architect.
   Owner: the products page builder (replace this stub completely). Only this builder edits this file
   and css/products.css. Shared files (js/app.js, css/site.css, shell.html, tools/*) are READ ONLY.
   Routes (head tokens, see AAT.ROUTES in js/app.js): 'products', 'product', 'modern'
   Spec: DESIGN.md §6.9, §6.10, §6.11. Contract: CONTRACT.md. Pattern to copy: js/pages/pages.js.
   CSS class prefix: .pr- (products) / .md- (modern)
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  var t = function (k, v) { return AAT.t('products.' + k, v); };

  AAT.strings.products = {
    ar: { h1: 'المنتجات', modern: 'منتجات وصناعات حديثة' },
    en: { h1: 'Products', modern: 'Modern products and industries' }
  };

  AAT.pages.products = {
    /** render(ctx) → HTML string for #view, or null for "not found" (the app then shows the 404 page) */
    render: function (ctx) {
      return AAT.ui.openingBoard({ h1: ctx.head === 'modern' ? t('modern') : t('h1') });
    }
  };
}());
