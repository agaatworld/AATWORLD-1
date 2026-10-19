/* AAT assistant without an API: answers from the site's own content (exhibitions, companies, products, articles, news, common questions, contact).
   A.answer(question) returns ready HTML. Arabic and English questions; the reply follows the site language (Arabic or English). */
(function (W) {
  var A = W.AAT; if (!A) return;
  var D = A.D;

  function esc(s) { return A.esc(String(s == null ? "" : s)); }
  /* the reply follows the language of the question: Arabic letters -> Arabic, Latin letters only -> English, otherwise the site language */
  var force = null;
  function ar() { return force != null ? force : A.state.lang === "ar"; }
  function tr(en, a) { return ar() ? a : en; }
  function L(o) { return o ? (ar() ? (o.ar || o.en) : (o.en || o.ar)) || "" : ""; }

  /* Arabic and English text made comparable: no diacritics, one form of alef/ya/ta marbuta, lower case, no punctuation */
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }
  /* Arabic words carry "و" (and) and "ال" (the) in front: compare without them */
  function bare(w) { return w.replace(/^(و?ال|و|ب|ل|لل)(?=..)/, ""); }
  var STOP = {};
  ("اليوم الان كم لو سمحت فضلك من فضلك في من على عن الى الي ما ماذا هل كيف اين متي هي هو هذا هذه ذلك التي الذي او و يا انا انت نحن لي لكم عندكم عندك اريد ابحث بحث ممكن اعطني اعرف معلومات شي شيء كل اي " +
    "today now please the a an of in on at for to from is are was be what when where how which who do does did can could i me my you your we our us please want need find show list about any some with and or tell give").split(" ").forEach(function (w) { STOP[w] = 1; });
  function words(q) { return norm(q).split(" ").filter(function (w) { return w.length > 1 && !STOP[w] && !STOP[bare(w)]; }); }
  /* a word of the list starts a word of the question (with or without "ال"/"و" in front); words of 3 letters or less must match a whole word */
  function hasAny(qn, list) {
    var t = " " + qn + " ";
    return list.some(function (w) { w = norm(w); var e = w.length <= 3 ? " " : ""; return [" ", " ال", " وال", " و", " بال", " لل"].some(function (pre) { return t.indexOf(pre + w + e) > -1; }); });
  }

  /* ---------- what a question is about ---------- */
  var COUNTRY_ALIAS = {
    tw: ["taiwan", "تايوان", "taipei", "تايبيه", "تايبيه", "kaohsiung", "taichung"], id: ["indonesia", "اندونيسيا", "jakarta", "جاكرتا", "surabaya", "bali"],
    my: ["malaysia", "ماليزيا", "kuala", "كوالالمبور", "كوالا", "penang"], pk: ["pakistan", "باكستان", "karachi", "كراتشي", "lahore", "لاهور", "islamabad"],
    af: ["afghanistan", "افغانستان", "kabul"], dz: ["algeria", "الجزائر", "جزائر", "algiers", "oran", "وهران"], eg: ["egypt", "مصر", "cairo", "القاهره", "قاهره", "alexandria"],
    iq: ["iraq", "العراق", "عراق", "baghdad", "بغداد", "erbil", "اربيل", "basra"], kw: ["kuwait", "الكويت", "كويت"], ye: ["yemen", "اليمن", "يمن", "sanaa"],
    om: ["oman", "عمان", "muscat", "مسقط"], qa: ["qatar", "قطر", "doha", "الدوحه", "دوحه"], sa: ["saudi", "السعوديه", "سعوديه", "riyadh", "الرياض", "رياض", "jeddah", "جده", "dammam", "الدمام"],
    sy: ["syria", "سوريا", "سوريه", "damascus", "دمشق", "aleppo", "حلب"], ae: ["uae", "emirates", "الامارات", "امارات", "dubai", "دبي", "abu dhabi", "ابوظبي", "ابو ظبي", "sharjah", "الشارقه"],
    tr: ["turkey", "turkiye", "تركيا", "istanbul", "اسطنبول", "استنبول", "ankara", "انقره", "izmir", "ازمير", "antalya", "انطاليا", "bursa"]
  };
  function countryOf(qn) { for (var k in COUNTRY_ALIAS) if (hasAny(qn, COUNTRY_ALIAS[k])) return k; return ""; }

  var MONTHS = [["january", "jan", "يناير", "كانون الثاني"], ["february", "feb", "فبراير", "شباط"], ["march", "mar", "مارس", "اذار"], ["april", "apr", "ابريل", "نيسان"],
    ["may", "مايو", "ايار"], ["june", "jun", "يونيو", "حزيران"], ["july", "jul", "يوليو", "تموز"], ["august", "aug", "اغسطس", "اب"], ["september", "sep", "سبتمبر", "ايلول"],
    ["october", "oct", "اكتوبر", "تشرين الاول"], ["november", "nov", "نوفمبر", "تشرين الثاني"], ["december", "dec", "ديسمبر", "كانون الاول"]];
  function monthOf(qn) { var t = " " + qn + " "; for (var i = 0; i < 12; i++) if (MONTHS[i].some(function (m) { return t.indexOf(" " + norm(m) + " ") > -1; })) return i + 1; return 0; }
  function yearOf(qn) { var m = /\b(2027|2028)\b/.exec(qn); return m ? m[1] : ""; }

  /* the field groups used on the exhibitions page, with the words people use for them */
  var FIELDS = [
    ["أغذية ومشروبات", "Food and beverage", "food beverage drink halal coffee bakery horeca غذاء غذائيه اغذيه طعام اطعمه مشروبات حلال قهوه حلويات مخابز"],
    ["بلاستيك وتغليف وطباعة", "Plastics, packaging and printing", "plastic packaging printing paper بلاستيك تغليف طباعه ورق"],
    ["نسيج وملابس", "Textiles and clothing", "textile garment fashion clothing leather shoes نسيج ملابس اقمشه ازياء جلود احذيه"],
    ["آلات وأدوات ومعادن", "Machinery, tools and metal", "machine machinery tools metal steel hardware الات اله ماكينات معدات عدد ادوات معادن حديد صلب"],
    ["صناعة وأتمتة", "Industry and automation", "industry industrial automation robot manufacturing صناعه صناعي صناعيه اتمته روبوت مصانع تصنيع"],
    ["إلكترونيات وإضاءة", "Electronics and lighting", "electronics lighting led cable electrical الكترونيات اضاءه كهرباء كهربائيه كابلات"],
    ["طاقة ونفط وغاز", "Energy, oil and gas", "energy oil gas solar power petroleum طاقه نفط غاز شمسيه بترول كهرباء"],
    ["بناء وأثاث وديكور", "Building, furniture and interiors", "construction building furniture interior decor real estate بناء انشاءات اثاث ديكور عقار عقارات مقاولات"],
    ["نقل وسيارات ولوجستيات", "Transport, vehicles and logistics", "auto automotive car vehicle transport logistics shipping marine aviation سيارات سياره نقل شحن لوجستي لوجستيات بحري طيران قطع غيار"],
    ["صحة وتجميل وأدوية", "Health, beauty and pharma", "health medical pharma beauty cosmetics dental hospital صحه طبي طبيه ادويه تجميل مستشفيات اسنان"],
    ["زراعة", "Agriculture", "agriculture farming livestock poultry fishing زراعه زراعي مزارع دواجن مواشي اسماك"],
    ["كيماويات وطلاءات", "Chemicals and coatings", "chemicals coatings paint كيماويات كيميائيه دهانات طلاء"],
    ["مياه وبيئة وتبريد", "Water, environment and cooling", "water environment waste recycling hvac cooling مياه بيئه نفايات تدوير تبريد تكييف"],
    ["أمن وسلامة", "Security and safety", "security safety fire defense امن سلامه حرائق دفاع"],
    ["تقنية واتصالات", "Technology and telecom", "technology tech it digital telecom software ai تقنيه تكنولوجيا اتصالات برمجيات رقمي ذكاء"],
    ["سلع استهلاكية وخدمات", "Consumer goods and services", "consumer gifts toys jewelry sports books retail سلع هدايا العاب مجوهرات رياضه كتب استهلاكيه"],
    ["سياحة وفنادق وترفيه", "Tourism, hotels and leisure", "tourism travel hotel hospitality leisure entertainment سياحه سفر فنادق ضيافه ترفيه"]
  ];
  function fieldsOf(qn) { return FIELDS.filter(function (f) { return hasAny(qn, f[2].split(" ")); }).map(function (f) { return f[0]; }); }
  function fieldOf(qn) { return fieldsOf(qn)[0] || ""; }
  function fieldEn(f) { for (var i = 0; i < FIELDS.length; i++) if (FIELDS[i][0] === f) return FIELDS[i][1]; return f; }

  /* ---------- pieces of an answer ---------- */
  function links(list) {
    return '<div class="res">' + list.map(function (x) { return '<a href="' + esc(x[0]) + '"' + (/^#/.test(x[0]) ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(x[1]) + (x[2] ? "<small>" + esc(x[2]) + "</small>" : "") + "</a>"; }).join("") + "</div>";
  }
  function p(t) { return "<p>" + t + "</p>"; }
  function contact() {
    var c = D.config;
    return p(esc(tr("Our team replies on these apps and by e-mail:", "يرد فريقنا على هذه التطبيقات وبالبريد الإلكتروني:"))) +
      '<p dir="ltr"><b>' + esc(c.phoneDisplay) + "</b></p>" + (A.ui && A.ui.apps ? A.ui.apps() : "") + links([["mailto:" + c.email, c.email]]);
  }
  function showLine(e) { return [ "#exhibition-" + e.id, (ar() && e.nameAr) || e.name, (e.approx ? A.fmtMonth(e.start) : A.fmtRange(e.start, e.end)) + " · " + L((D.countries || {})[e.country]) ]; }

  function shows(qn, toks) {
    var c = countryOf(qn), m = monthOf(qn), y = yearOf(qn), fs = fieldsOf(qn), all = A.eventsWindow(new Date(), 3);
    /* Arabic spellings of well-known show names */
    var ALIAS = { "جلفود": "gulfood", "جيتكس": "gitex", "بيج 5": "big 5", "بيغ 5": "big 5", "كومبيوتكس": "computex", "تيمتوس": "timtos", "اندكس": "index", "ارابلاب": "arablab", "عرب هيلث": "arab health", "انترباك": "interpack", "سيال": "sial", "هوريكا": "horeca", "اوتوميكانيكا": "automechanika", "تايبي بلاس": "taipei plas" };
    Object.keys(ALIAS).forEach(function (k) { if (qn.indexOf(norm(k)) > -1) toks = toks.concat(ALIAS[k].split(" ")); });
    var list = all.filter(function (e) {
      if (c && e.country !== c) return false;
      if (fs.length && !(e.sector && fs.indexOf(e.sector.ar) > -1)) return false;
      if (y && e.start.slice(0, 4) !== y) return false;
      if (m && +e.start.slice(5, 7) !== m) return false;
      return true;
    });
    /* words left over may name a show ("taipei plas", "gulfood") */
    var EXW = ["معرض", "معارض", "expo", "exhibition", "exhibitions", "shows", "fair", "fairs", "trade", "اكسبو", "المعرض", "المعارض", "دوليه", "international", "2027", "2028"];
    /* words that named the country or the field are not show names */
    var used = {}; Object.keys(COUNTRY_ALIAS).forEach(function (k) { COUNTRY_ALIAS[k].forEach(function (w) { norm(w).split(" ").forEach(function (x) { used[x] = 1; }); }); });
    FIELDS.forEach(function (f) { f[2].split(" ").forEach(function (x) { used[norm(x)] = 1; }); });
    var rest = toks.filter(function (w) { return w.length > 2 && EXW.indexOf(w) < 0 && EXW.indexOf(bare(w)) < 0 && !used[w] && !used[bare(w)] && !Object.keys(used).some(function (u) { return u.length > 3 && w.indexOf(u) === 0; }); });
    var named = list.filter(function (e) { var n = " " + norm(e.name + " " + (e.city || "")) + " "; return rest.some(function (w) { return w.length > 2 && /[a-z]/.test(w) && n.indexOf(" " + w) > -1; }); });
    var note = "";
    if (named.length) list = named;
    else if (rest.some(function (w) { return /[a-z]/.test(w) && w.length > 3; })) note = p(esc(tr("No show with this name from January 2027 on (some shows are held every two years). Other shows that match:", "لا يوجد معرض بهذا الاسم من يناير 2027 فما فوق (بعض المعارض تُقام كل سنتين). معارض أخرى مطابقة:")));
    else if (!c && !m && !y && !fs.length && rest.some(function (w) { return /[a-z]/.test(w) || !STOP[w]; }) && rest.length) {
      /* a show asked by a name we could not find */
      return p(esc(tr("I could not find a show with this name. Shows are listed by their English names; you can browse them all:", "لم أجد معرضاً بهذا الاسم. المعارض مكتوبة بأسمائها الإنجليزية، ويمكنك تصفّحها كلها:"))) + links([["#exhibitions", tr("All international exhibitions", "كل المعارض الدولية")]]);
    }
    var what = [];
    if (fs.length) what.push(ar() ? "مجال " + fs.join(" / ") : "field: " + fs.map(fieldEn).join(" / "));
    if (c) what.push(L((D.countries || {})[c]));
    if (m) what.push(ar() ? MONTHS[m - 1][2] : MONTHS[m - 1][0].replace(/^./, function (x) { return x.toUpperCase(); }));
    if (y) what.push(y);
    if (!list.length) {
      if (c === "af" || c === "ye") return p(esc(tr("EventsEye lists no trade shows in this country for 2027.", "لا توجد معارض مسجّلة في هذه الدولة على EventsEye لعام 2027."))) + links([["#exhibitions", tr("All international exhibitions", "كل المعارض الدولية")]]);
      return p(esc(tr("I found no show for this search", "لم أجد معرضاً لهذا البحث")) + (what.length ? " (" + esc(what.join(" · ")) + ")" : "") + ".") + links([["#exhibitions", tr("All international exhibitions", "كل المعارض الدولية")]]);
    }
    return note + p(esc(tr("Shows found", "عدد المعارض")) + (what.length ? " (" + esc(what.join(" · ")) + ")" : "") + ": <b>" + list.length + "</b>" + (list.length > 6 ? esc(tr(". The first six:", ". أول ستة:")) : "")) +
      links(list.slice(0, 6).map(showLine)) + links([["#exhibitions", tr("See all, filter by country and field", "عرض الكل والتصفية حسب الدولة والمجال")]]);
  }

  /* ---------- free search over the site ---------- */
  function score(text, toks) {
    var n = " " + norm(text) + " ", s = 0;
    toks.forEach(function (w) { var b = bare(w); if (n.indexOf(" " + w) > -1 || (b.length > 2 && (n.indexOf(" " + b) > -1 || n.indexOf(" ال" + b) > -1))) s += w.length > 3 ? 2 : 1; });
    return s;
  }
  function search(toks) {
    if (!toks.length) return "";
    var out = [];
    function top(items, text, line, min) {
      return items.map(function (x) { return { x: x, s: score(text(x), toks) }; }).filter(function (r) { return r.s >= min; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (r) { return line(r.x); });
    }
    var need = toks.length > 1 ? 2 : 1;
    var cos = top(A.companies || [], function (c) { return c.company + " " + L(c.about) + " " + (c.about && c.about.en || "") + " " + L((A.cats || {})[c.cat]) + " " + L(c.city); }, function (c) { return ["#company-" + c.page, c.company, L((A.cats || {})[c.cat]) + " · " + L(c.city)]; }, need);
    var pr = top(A.allProducts ? A.allProducts() : [], function (x) { return x.it.n + " " + (x.it.d || "") + " " + x.c.company; }, function (x) { return ["#product-" + x.c.page + "-" + x.k, x.it.n, x.c.company]; }, need);
    /* "Modern products and industries": AAT's own selection of factories (assets/js/data, AAT_MODERN) */
    var MG = W.AAT_MODERN_G || {};
    var mod = top((W.AAT_MODERN || []).map(function (m, i) { return { m: m, i: i }; }), function (o) { var m = o.m, g = MG[m.g || m.group || m.k] || {}; return [m.t, m.en, m.name, (m.body || []).join(" "), g.ar, g.en, m.web].filter(Boolean).join(" "); },
      function (o) { var g = MG[o.m.g || o.m.group || o.m.k]; return ["#modern-" + o.i, o.m.t || o.m.en || o.m.name, g ? L(g) : tr("Modern products and industries", "منتجات وصناعات حديثة")]; }, need);
    var arts = top((A.articles || []).filter(function (a) { return ar() || a.lang !== "ar"; }), function (a) { return (a.title.ar || "") + " " + (a.title.en || "") + " " + L(a.sum); }, function (a) { return ["#article-" + a.id, L(a.title)]; }, need);
    var news = top((D.news || []).map(function (n, i) { return { n: n, i: i }; }), function (o) { return (o.n.title.ar || "") + " " + (o.n.title.en || ""); }, function (o) { return ["#news-" + o.i, L(o.n.title)]; }, need);
    var evs = top(A.eventsWindow(new Date(), 3), function (e) { return e.name + " " + (e.city || "") + " " + L(e.sector); }, showLine, Math.max(need, 2));
    if (cos.length) out.push(p("<b>" + esc(tr("Companies", "شركات")) + "</b>") + links(cos));
    if (pr.length) out.push(p("<b>" + esc(tr("Products in this issue", "منتجات هذا العدد")) + "</b>") + links(pr));
    if (mod.length) out.push(p("<b>" + esc(tr("Modern products and industries", "منتجات وصناعات حديثة")) + "</b>") + links(mod));
    if (evs.length) out.push(p("<b>" + esc(tr("International exhibitions", "معارض دولية")) + "</b>") + links(evs));
    if (arts.length) out.push(p("<b>" + esc(tr("Articles", "مقالات")) + "</b>") + links(arts));
    if (news.length) out.push(p("<b>" + esc(tr("News", "أخبار")) + "</b>") + links(news));
    return out.join("");
  }
  function faq(qn, toks) {
    var best = null, bs = 0;
    (D.faqs || []).forEach(function (f) { var s = score((f.q.ar || "") + " " + (f.q.en || ""), toks); if (s > bs) { bs = s; best = f; } });
    return bs >= 3 ? p("<b>" + esc(L(best.q)) + "</b>") + p(esc(L(best.a))) : "";
  }


  /* general trade questions importers and exporters ask (general guidance, not offers; for a deal the team answers) */
  var KB = [
    { k: "fob cif exw incoterm incoterms شروط_الشحن فوب سيف", en: "Common shipping terms (Incoterms): EXW = you collect the goods at the factory. FOB = the seller loads the goods on the ship at the port of origin; you pay sea freight and insurance from there. CIF = the seller pays the goods, insurance and freight to your port. Agree the term in writing with the supplier.", ar: "أشهر شروط الشحن (Incoterms): EXW تستلم البضاعة من المصنع. FOB البائع يحمّل البضاعة على السفينة في ميناء بلده، وأنت تدفع الشحن البحري والتأمين بعدها. CIF البائع يدفع ثمن البضاعة والتأمين والشحن حتى ميناء بلدك. اتفق على الشرط كتابياً مع المورّد." },
    { k: "payment pay tt l/c lc letter_of_credit deposit دفع الدفع ادفع ندفع يدفع تحويل اعتماد مستندي عربون دفعه", en: "Usual ways to pay a factory: bank transfer (T/T), often a deposit (for example 30%) and the rest before shipment; or a letter of credit (L/C) for larger orders, which protects both sides through the banks. The exact terms are agreed with each supplier.", ar: "طرق الدفع المعتادة للمصانع: تحويل بنكي (T/T)، وغالباً دفعة مقدّمة (مثلاً 30٪) والباقي قبل الشحن؛ أو اعتماد مستندي (L/C) للطلبات الكبيرة، وهو يحمي الطرفين عن طريق البنوك. الشروط الدقيقة يُتفق عليها مع كل مورّد." },
    { k: "moq minimum_order الحد_الادني اقل_كميه كميه", en: "The minimum order quantity (MOQ) is set by each factory and depends on the product. Ask the supplier directly, or ask our team to ask for you.", ar: "الحد الأدنى للطلب (MOQ) يحدده كل مصنع حسب المنتج. اسأل المورّد مباشرة، أو اطلب من فريقنا أن يسأل عنك." },
    { k: "sample samples عينه عينات", en: "Most factories send samples. Usually the buyer pays the sample and the courier, and some factories deduct it from the first order.", ar: "معظم المصانع ترسل عينات. عادة يدفع المشتري ثمن العينة والشحن السريع، وبعض المصانع تخصمه من أول طلبية." },
    { k: "verify trust reliable scam fraud genuine inspection موثوق ثقه احتيال نصب تاكد فحص تفتيش", en: "To check a supplier: ask for the company registration, visit the factory or meet them at a trade show, start with a small order, use a third-party inspection before shipment, and prefer a letter of credit for large orders.", ar: "للتأكد من المورّد: اطلب سجل الشركة، زر المصنع أو قابله في معرض، ابدأ بطلبية صغيرة، استخدم شركة فحص مستقلة قبل الشحن، وفضّل الاعتماد المستندي في الطلبات الكبيرة." },
    { k: "shipping_time transit how_long مده_الشحن كم_يوم كم_اسبوع شحن_بحري شحن_جوي يستغرق", en: "Roughly: by sea from Taiwan or East Asia to the Gulf about 3 to 5 weeks, to North Africa longer; by air a few days. A freight forwarder gives the exact time and price.", ar: "تقريباً: الشحن البحري من تايوان أو شرق آسيا إلى الخليج حوالي 3 إلى 5 أسابيع، وإلى شمال أفريقيا أطول؛ والجوي أيام قليلة. وكيل الشحن يعطيك المدة والسعر بدقة." },
    { k: "customs duty duties hs_code tariff جمارك جمركي رسوم_جمركيه", en: "Each product has an HS code; import duties are set by the customs of the importing country. A customs broker in your country can give the exact duty.", ar: "لكل منتج رمز جمركي (HS Code)، والرسوم يحددها جمرك بلد الاستيراد. المخلّص الجمركي في بلدك يعطيك الرسوم بدقة." },
    { visa: 1, k: "visa invitation letter badge register visitor تاشيره فيزا دعوه زائر تسجيل", en: "To visit a trade show: register as a visitor on the show's website to get your badge. For a visa, ask the organizer for an invitation letter; visa rules depend on your nationality (for Taiwan, see the Bureau of Consular Affairs).", ar: "لزيارة معرض: سجّل كزائر في موقع المعرض لتحصل على بطاقة الدخول. وللتأشيرة اطلب خطاب دعوة من المنظّم؛ وشروط التأشيرة حسب جنسيتك (لتايوان راجع مكتب الشؤون القنصلية)." },
    { k: "currency dollar twd ntd عمله دولار تايواني", en: "Taiwan's currency is the New Taiwan Dollar (TWD). Export prices are usually quoted in US dollars.", ar: "عملة تايوان هي الدولار التايواني الجديد (TWD). أسعار التصدير تُعطى عادة بالدولار الأمريكي." },
    { low: 1, k: "supplier factory manufacturer find source sourcing مورد موردين مصنع مصانع", en: "Look at the companies and products of this issue on the site, or tell our team what you need and we connect you with suitable factories.", ar: "تصفّح الشركات والمنتجات في الموقع، أو أخبر فريقنا بما تحتاجه ونربطك بالمصانع المناسبة." }
  ];
  /* which: "first" = before the exhibition search (all but the general supplier answer; with a show word only the visa answer), "last" = any */
  function kb(qn, which, exWord) {
    var best = null, bs = 0;
    KB.forEach(function (e) {
      if (which === "first" && (e.low || (exWord && !e.visa))) return;
      var n = e.k.split(" ").filter(function (w) { w = w.replace(/_/g, " "); return w.length > 1 && hasAny(qn, [w]); }).length; /* "_" joins the words of a phrase */ if (n > bs) { bs = n; best = e; }
    });
    return bs ? p(esc(ar() ? best.ar : best.en)) : "";
  }
  function clock(qn) {
    if (!hasAny(qn, ["time", "clock", "الساعه", "الوقت", "date", "التاريخ", "تاريخ اليوم"]) && !/(^| )(what day|today s date|اي يوم)( |$)/.test(qn)) return "";
    var now = new Date(), tw = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
    var f = function (d, o) { try { return new Intl.DateTimeFormat(ar() ? "ar-u-nu-latn" : "en", o).format(d); } catch (e) { return d.toString(); } };
    if (hasAny(qn, ["taiwan", "تايوان"]) || hasAny(qn, ["time", "clock", "الساعه", "الوقت"]))
      return p(esc(tr("Time in Taiwan now: ", "الوقت الآن في تايوان: ")) + "<b>" + esc(f(tw, { hour: "2-digit", minute: "2-digit", weekday: "long" })) + "</b>" + esc(tr(" (UTC+8). Office days: Monday to Friday.", " (UTC+8). أيام العمل: من الاثنين إلى الجمعة.")));
    return p(esc(tr("Today is ", "اليوم هو ")) + "<b>" + esc(f(now, { weekday: "long", day: "numeric", month: "long", year: "numeric" })) + "</b>.");
  }
  function answer(raw) {
    force = /[\u0600-\u06FF]/.test(raw || "") ? true : /[A-Za-z]/.test(raw || "") ? false : null;
    /* dates and names follow the reply language too (the site language is switched only while the reply is built) */
    var keep = A.state.lang; if (force === true) A.state.lang = "ar"; else if (force === false && keep === "ar") A.state.lang = "en";
    try { return reply(raw); } finally { force = null; A.state.lang = keep; }
  }
  function reply(raw) {
    var qn = norm(raw), toks = words(raw), M = D.magazine || {};
    if (!qn) return p(esc(tr("Type your question.", "اكتب سؤالك.")));
    if (/^(hi|hello|hey|salam|مرحبا|اهلا|السلام عليكم|السلام|صباح الخير|مساء الخير)( .*)?$/.test(qn) && toks.length <= 3)
      return p(esc(tr("Hello! Ask me about international exhibitions (by country, month or field), companies and products in the magazine, articles, or how to reach us.",
        "أهلاً وسهلاً! اسألني عن المعارض الدولية (حسب الدولة أو الشهر أو المجال)، أو عن الشركات والمنتجات في المجلة، أو المقالات، أو كيف تتواصل معنا.")));
    if (hasAny(qn, ["شكرا", "thanks", "thank", "مشكور", "يعطيك العافيه"])) return p(esc(tr("You are welcome! Anything else?", "العفو! هل تحتاج شيئاً آخر؟")));

    var exWord = hasAny(qn, ["معرض", "معارض", "expo", "exhibition", "exhibitions", "shows", "fair", "fairs", "trade show", "اكسبو"]);
    /* time and date, then trade questions (shipping terms, payment, visa...), then exhibitions, the most asked */
    var cl = clock(qn); if (cl) return cl;
    var g0 = kb(qn, "first", exWord); if (g0) return g0 + contact();
    if (exWord || ((countryOf(qn) || monthOf(qn)) && !hasAny(qn, ["شركه", "شركات", "company", "منتج", "product"]))) return shows(qn, toks);

    if (hasAny(qn, ["عنوان", "address", "location", "مكتب", "office", "موقعكم", "where are you"]))
      return p(esc(tr("Our office in Taiwan:", "مكتبنا في تايوان:"))) + '<p dir="ltr"><b>' + esc(D.config.address.en) + "</b></p>" + contact();
    if (hasAny(qn, ["تواصل", "اتواصل", "نتواصل", "يتواصل", "التواصل", "اتصال", "اتصل", "اكلم", "نكلم", "اراسل", "مراسله", "راسلني", "كلمني", "رقم", "هاتف", "جوال", "واتس", "واتساب", "ايميل", "بريد", "contact", "phone", "call", "number", "whatsapp", "email", "mail", "viber", "botim", "imo"]))
      return contact();
    if (hasAny(qn, ["اعلان", "اعلن", "اعلانات", "يعلن", "نعلن", "advertise", "advertising", "advert", "ad", "ads"]))
      return p(esc(tr("Advertising in the magazine and on the website: prices are sent on request.", "الإعلان في المجلة وعلى الموقع: الأسعار تُرسل عند الطلب."))) + links([["#advertise", tr("Advertise with us", "أعلن معنا")]]) + contact();
    if (hasAny(qn, ["نادي", "عضويه", "عضو", "اعضاء", "club", "member", "members", "membership"]))
      return p(esc(A.t("cb_goals_p"))) + links([["#club", tr("AAT Business Club and its members", "نادي رجال الأعمال وأعضاؤه")]]) + contact();
    if (hasAny(qn, ["مجله", "العدد", "عدد", "اقرا", "قراءه", "magazine", "issue", "read", "pdf"]))
      return p(esc(tr("Issue " + M.issue + " (" + ((M.month || {}).en || "") + ") can be read online, page by page.", "العدد " + M.issue + " (" + ((M.month || {}).ar || "") + ") متاح للقراءة على الموقع صفحة صفحة."))) +
        links([["#flip", tr("Read the magazine", "اقرأ المجلة")], ["#magazine", tr("Companies in this issue", "شركات هذا العدد")], ["#articles", tr("Articles", "المقالات")]]);
    if (hasAny(qn, ["من انتم", "من نحن", "عنكم", "تاسست", "تاسيس", "مؤسس", "1982", "تاريخ", "about", "who are", "founded", "founder", "history"]))
      return p(esc(tr("Arab Asian Trade (AAT) is a monthly Arabic and English trade magazine, founded in Taiwan in 1982 by Mr. Mohamad Marwan Fattal. It links traders, importers, exporters and manufacturers in the Arab countries, Africa and Asia.",
        "التجارة العربية الآسيوية (AAT) مجلة تجارية شهرية بالعربية والإنجليزية، أسسها السيد محمد مروان فتال في تايوان عام 1982. تربط التجار والمستوردين والمصدّرين والمصنّعين في الدول العربية وأفريقيا وآسيا."))) + links([["#about", tr("About us", "من نحن")]]);

    var f = faq(qn, toks); if (f) return f;
    /* products, factories, articles... found on the site come first; general advice only when nothing is found */
    var found = search(toks.filter(function (w) { return ["ابحث", "اريد", "ابغي", "عن", "مصنع", "مصانع", "factory", "supplier", "مورد"].indexOf(w) < 0; }).length ? toks.filter(function (w) { return ["ابحث", "اريد", "ابغي", "عن", "مصنع", "مصانع", "factory", "supplier", "مورد"].indexOf(w) < 0; }) : toks);
    if (found) return p(esc(tr("This is what I found on the site:", "هذا ما وجدته في الموقع:"))) + found;
    var g = kb(qn, "last", exWord); if (g) return g + contact();
    /* a field alone ("plastic machines") also points to the shows of that field */
    if (fieldOf(qn)) return shows(qn, toks);
    return p(esc(tr("I could not find this on the site. Our team will answer you directly:", "لم أجد هذا في الموقع. سيجيبك فريقنا مباشرة:"))) + contact();
  }

  A.answer = answer;
})(window);
