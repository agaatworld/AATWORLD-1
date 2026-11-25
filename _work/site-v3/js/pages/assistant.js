/* =============================================================================
   AAT World v3 · js/pages/assistant.js — STUB written by the architect.
   Owner: the assistant builder (replace this stub completely). Only this builder edits this file
   and css/assistant.css. Shared files are READ ONLY.
   Not a route: the "محادثة 24 ساعة" panel and the PC floating chat button (DESIGN.md §5.4).
   The app calls:  AAT.pages.assistant.init()        once at boot (after the chrome is rendered)
                   AAT.pages.assistant.open(query)   from AAT.openAssistant(q): masthead button, tab bar
                                                     "اسأل AAT", every search box (data-act="ask"), quick chips
                   AAT.pages.assistant.onRoute(ctx)  after every route render
                   AAT.pages.assistant.onLang(code)  after a language switch
   Mount the panel into <div id="assistant-root"> (in shell.html). CSS class prefix: .as-
============================================================================= */
(function () {
  'use strict';
  var AAT = window.AAT;
  AAT.strings.assistant = {
    ar: {},
    en: {}
  };
  AAT.pages.assistant = {
    init: function () {},
    /** open(query) → show the panel with the query answered (stub: until the builder delivers, says the hello line) */
    open: function (q) { AAT.toast(AAT.L(AAT.data.config.assistant.hello).slice(0, 90)); }
  };
}());
