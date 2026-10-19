/* AAT World settings (see api/README-assistant.md).
   AAT_ASSISTANT_API:  address of your assistant endpoint, e.g. "/api/assistant.php". Empty = Claude inside claude.ai, or built-in quick answers.
   AAT_NEWSLETTER_API: address that receives {email, lang} by POST. Empty = the visitor confirms by email. */
window.AAT_ASSISTANT_API = window.AAT_ASSISTANT_API || "";
window.AAT_NEWSLETTER_API = window.AAT_NEWSLETTER_API || "api/subscribe.php"; /* saves the address on the server (api/data/subscribers.csv) and e-mails the office */
/* the home page opens with the magazine shelf (this line used to sit inside index.html; inline scripts are now blocked by the security policy) */
window.AAT_MZ_HOME = "shelf";
/* the update these files belong to (same number as version.txt). If the server already has a newer update but this
   browser kept an old copy of the page (Hostinger lets browsers keep index.html for 7 days), load the new one once. */
window.AAT_UPDATE = 36;
(function () {
  if (!window.fetch) return;
  fetch("version.txt?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (t) {
    var m = /update (\d+)/.exec(t), live = m ? +m[1] : 0, key = "aat-upd-" + live;
    if (live <= window.AAT_UPDATE) return;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch (e) { return; }
    location.replace(location.pathname + "?u=" + live + location.hash);
  }).catch(function () {});
})();
