/* AAT World v3 · js/boot.js — loaded LAST (architect). Every module has registered by now:
   boot at once when the page markup is there, otherwise on DOMContentLoaded. */
(function () {
  'use strict';
  if (document.getElementById('view')) window.AAT.boot();
  else document.addEventListener('DOMContentLoaded', function () { window.AAT.boot(); });
}());
