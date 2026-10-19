/* AAT World settings (see api/README-assistant.md).
   AAT_ASSISTANT_API:  address of your assistant endpoint, e.g. "/api/assistant.php". Empty = Claude inside claude.ai, or built-in quick answers.
   AAT_NEWSLETTER_API: address that receives {email, lang} by POST. Empty = the visitor confirms by email. */
window.AAT_ASSISTANT_API = window.AAT_ASSISTANT_API || "";
window.AAT_NEWSLETTER_API = window.AAT_NEWSLETTER_API || "";
/* the home page opens with the magazine shelf (this line used to sit inside index.html; inline scripts are now blocked by the security policy) */
window.AAT_MZ_HOME = "shelf";
