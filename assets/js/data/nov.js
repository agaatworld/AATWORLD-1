/* November 2026 (issue 561): the site moves from issue 560 to 561. Loaded after oct.js, before core.js.
   The magazine is read in issue561/ (page pictures). The company, product and logo data still come from issue 560,
   so their "see page" links open the October issue (#flip560-N). */
(function (W) {
  var IS = W.AAT_ISSUE, D = W.AAT_DATA;
  IS.number = 561; IS.month = { en: "November 2026", ar: "نوفمبر 2026" }; IS.pages = 100; IS.cover = "cover-561.jpg";
  D.magazine.issue = 561; D.magazine.month = IS.month;
  D.magazine.cover = { en: "This issue: international trade fairs in Malaysia with EZICARGO on the cover, trade and industry news and articles, and advertisers from Asia and the Arab world.",
                       ar: "في هذا العدد: المعارض الدولية في ماليزيا مع ايزي كارجو على الغلاف، وأخبار ومقالات التجارة والصناعة، وإعلانات شركات من آسيا والعالم العربي." };
  var X = W.AAT_I18N || {};
  Object.keys(X).forEach(function (l) { Object.keys(X[l]).forEach(function (k) { var v = X[l][k]; if (typeof v === "string" && v.indexOf("560") > -1) X[l][k] = v.replace(/560/g, "561"); }); });
})(window);
