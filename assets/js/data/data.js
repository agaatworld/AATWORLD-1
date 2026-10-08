/* AAT World — site content.
   Edit this file to update shows, articles, services, suppliers and contact details.
   Every text field has an English (en) and Arabic (ar) version. */

window.AAT_DATA = {
  config: {
    whatsapp: "886966404681",            // WhatsApp number, international format, digits only (confirm this number uses WhatsApp)
    phoneDisplay: "+886 966 404681",     // Taiwan phone, as on aatworld.com
    email: "info@aatworld.com",
    editorEmail: "marwanaat@gmail.com",
    clubEmail: "aatclub@gmail.com",      // support / AAT Business Club
    newsUrl: "https://aatworld.com/news/",
    siteUrl: "https://aatworld.com/",
    leadEndpoint: "",                    // optional: a form backend URL (Formspree, your CRM, etc.). Leave empty to send leads by WhatsApp.
    address: {
      en: "P.O. Box 5, Yongqiao, Taipei City 100916, Taiwan R.O.C.",
      ar: "ص.ب 5، يونغتشياو، مدينة تايبيه 100916، تايوان"
    },
    social: {
      youtube: "https://www.youtube.com/@aatworldvideo608"
    },
    calendarNote: {
      en: "Dates are taken from organizer and trade-fair listings as of September 2026. Always confirm on the official show website before booking travel.",
      ar: "التواريخ مأخوذة من المنظّمين وقوائم المعارض التجارية حتى سبتمبر 2026. تأكّد دائماً من الموقع الرسمي للمعرض قبل حجز السفر."
    }
  },

  magazine: {
    issue: 559, since: 1982, years: 45,
    month: { en: "August 2026", ar: "أغسطس 2026" },
    name: { en: "Arab Asian Trade", ar: "التجارة العربية الآسيوية" },
    chinese: "中阿商業雜誌",
    tagline: { en: "The source of quality suppliers", ar: "مفتاح النجاح بين المستوردين والمصدّرين" },
    cover: { en: "This issue: a list of industrial directories. Choose the product, machine or service you need, and we connect you with the factories you select.", ar: "في هذا العدد: لائحة بالأدلة الصناعية. اختر المنتج أو الآلة أو الخدمة التي تريدها، ونصلك بالمصانع التي تختارها." }
  },

  /* Latest news from aatworld.com (image keys refer to assets/img/newsN.jpg) */
  news: [
    { img: "news1", title: { en: "TiTE x IHT launches Global Buyer Program to strengthen hardware sourcing", ar: "معرض تايوان للعدد (TiTE) ومعرض IHT يطلقان برنامج المشترين الدوليين لتعزيز توريد العدد والخردوات" } },
    { img: "news2", title: { en: "Taiwan AI certification gains momentum as adoption accelerates", ar: "شهادات الذكاء الاصطناعي في تايوان تكتسب زخماً مع تسارع التبنّي" } },
    { img: "news3", title: { en: "Panjit expands power semiconductor portfolio for AI and automotive markets", ar: "شركة بانجيت (Panjit) توسّع منتجاتها من أشباه موصلات الطاقة لأسواق الذكاء الاصطناعي والسيارات" } },
    { img: "news4", title: { en: "Taipei Cycle highlights the future of the global bicycle industry", ar: "معرض تايبيه للدراجات يرسم مستقبل صناعة الدراجات العالمية" } },
    { img: "news5", title: { en: "TDS-DYISHENG: proven reliability for modern industry", ar: "TDS-DYISHENG: موثوقية مثبتة للصناعة الحديثة" } },
    { img: "news6", title: { en: "Nitto Denko opens new Kaohsiung manufacturing and R&D facility", ar: "شركة نيتو دينكو (Nitto Denko) تفتتح منشأة جديدة للتصنيع والبحث والتطوير في كاوشيونغ" } }
  ],

  industries: {
    energy:      { en: "Renewable energy",       ar: "الطاقة المتجددة" },
    hardware:    { en: "Hardware & fasteners",   ar: "العدد والبراغي" },
    electronics: { en: "Electronics & AIoT",     ar: "الإلكترونيات وإنترنت الأشياء" },
    machinery:   { en: "Machinery",              ar: "الآلات والمعدات" },
    food:        { en: "Food & agri-tech",       ar: "الغذاء والتقنيات الزراعية" },
    mobility:    { en: "Auto parts & mobility",  ar: "قطع السيارات والتنقّل" },
    health:      { en: "Healthcare",             ar: "الرعاية الصحية" },
    safety:      { en: "Safety & security",      ar: "السلامة والأمن" },
    marine:      { en: "Marine",                 ar: "البحرية واليخوت" }
  },

  cities: {
    TPE: { en: "Taipei",    ar: "تايبيه" },
    TXG: { en: "Taichung",  ar: "تايتشونغ" },
    KHH: { en: "Kaohsiung", ar: "كاوشيونغ" },
    TNN: { en: "Tainan",    ar: "تاينان" }
  },

  events: [
    {
      id: "energy-taiwan-2026",
      name: "Energy Taiwan & Net-Zero Taiwan 2026",
      start: "2026-10-14", end: "2026-10-16", city: "TPE", industry: "energy",
      venue: { en: "Taipei Nangang Exhibition Center, Hall 1", ar: "مركز نانغانغ للمعارض في تايبيه، القاعة 1" },
      organizer: "TAITRA & SEMI GESA",
      url: "https://www.energytaiwan.com.tw/en/",
      delegation: true, featured: true,
      summary: {
        en: "Taiwan’s largest B2B trade show for renewable energy and net-zero solutions, covering the full supply chain from components to system integration and maintenance.",
        ar: "أكبر معرض تجاري في تايوان للطاقة المتجددة وحلول الحياد الكربوني، يغطي سلسلة التوريد كاملة من المكوّنات إلى تكامل الأنظمة والصيانة."
      },
      themes: {
        en: ["PV Taiwan", "Wind Taiwan", "Smart Storage Taiwan", "Emerging Power: hydrogen, geothermal, ocean, biomass", "Net-Zero: CBAM strategy, carbon management, green finance, circular economy"],
        ar: ["الطاقة الشمسية PV Taiwan", "طاقة الرياح Wind Taiwan", "التخزين الذكي Smart Storage", "الطاقة الناشئة: الهيدروجين والحرارة الجوفية وطاقة المحيطات والكتلة الحيوية", "الحياد الكربوني: استراتيجية CBAM وإدارة الكربون والتمويل الأخضر والاقتصاد الدائري"]
      },
      highlights: {
        en: ["Business matchmaking sessions between buyers and suppliers", "Forums on net-zero action and AI-driven energy transition", "Sustainability Awards with on-site voting", "Online visitor pre-registration is open"],
        ar: ["جلسات مطابقة تجارية بين المشترين والموردين", "منتديات عن العمل المناخي والتحوّل في الطاقة بالذكاء الاصطناعي", "جوائز الاستدامة مع تصويت في الموقع", "التسجيل المسبق للزوار متاح عبر الإنترنت"]
      }
    },
    {
      id: "taiwan-industry-week-2026",
      name: "Taiwan Industry Week 2026",
      start: "2026-10-20", end: "2026-10-22", city: "TPE", industry: "hardware",
      venue: { en: "Taipei Nangang Exhibition Center", ar: "مركز نانغانغ للمعارض في تايبيه" },
      delegation: true,
      summary: {
        en: "Four trade shows under one roof: Taiwan Hardware Show (THS), International Metal Technology Taiwan (IMT), T-SAFE Occupational Safety and Refrigeration & HVAC Taiwan.",
        ar: "أربعة معارض تجارية تحت سقف واحد: معرض تايوان للعدد (THS)، وتقنيات المعادن (IMT)، والسلامة المهنية T-SAFE، ومعرض التبريد والتكييف."
      },
      themes: {
        en: ["Hardware, tools and fasteners", "Steel and metal technology", "Industrial and workplace safety", "Refrigeration and HVAC"],
        ar: ["العدد والأدوات والبراغي", "الصلب وتقنيات المعادن", "السلامة الصناعية وسلامة بيئة العمل", "التبريد والتكييف"]
      }
    },
    {
      id: "tite-2026",
      name: "Taiwan International Tools & Hardware Expo (TiTE) 2026",
      start: "2026-10-20", end: "2026-10-22", city: "TXG", industry: "hardware",
      venue: { en: "Taichung International Convention & Exhibition Center", ar: "مركز تايتشونغ الدولي للمؤتمرات والمعارض" },
      summary: {
        en: "Hand tools, power tools and hardware from central Taiwan, the island’s main tool-making cluster. Held together with International Hardware Expo Taiwan (IHT).",
        ar: "العدد اليدوية والكهربائية ومنتجات الخردوات من وسط تايوان، أكبر تجمّع لصناعة العدد في الجزيرة. يُقام مع معرض الخردوات الدولي IHT."
      },
      themes: { en: ["Hand tools", "Power tools", "Hardware manufacturing"], ar: ["العدد اليدوية", "العدد الكهربائية", "تصنيع الخردوات"] }
    },
    {
      id: "taitronics-aiot-2026",
      name: "TAITRONICS & AIoT Taiwan 2026",
      start: "2026-10-20", end: "2026-10-22", city: "TPE", industry: "electronics",
      venue: { en: "Taipei Nangang Exhibition Center", ar: "مركز نانغانغ للمعارض في تايبيه" },
      summary: {
        en: "Electronic components, communications technology, artificial intelligence and IoT solutions. The TPCA Show for printed circuit boards runs the same week.",
        ar: "المكوّنات الإلكترونية وتقنيات الاتصالات والذكاء الاصطناعي وحلول إنترنت الأشياء. ويُقام معرض TPCA للوحات الدوائر المطبوعة في الأسبوع نفسه."
      },
      themes: { en: ["Electronic components", "AI and IoT", "Communications", "PCB (TPCA Show)"], ar: ["المكوّنات الإلكترونية", "الذكاء الاصطناعي وإنترنت الأشياء", "الاتصالات", "لوحات الدوائر المطبوعة (TPCA)"] }
    },
    {
      id: "kaohsiung-food-show-2026",
      name: "Kaohsiung Food Show 2026",
      start: "2026-10-22", end: "2026-10-25", city: "KHH", industry: "food",
      venue: { en: "Kaohsiung Exhibition Center", ar: "مركز كاوشيونغ للمعارض" },
      summary: {
        en: "Food products, ingredients and processing from southern Taiwan’s port city, a practical stop for importers of packaged and specialty foods.",
        ar: "منتجات غذائية ومكوّنات وتقنيات تصنيع من مدينة الميناء في جنوب تايوان، محطة عملية لمستوردي الأغذية المعلّبة والمتخصصة."
      },
      themes: { en: ["Packaged food", "Ingredients", "Food processing"], ar: ["الأغذية المعلّبة", "المكوّنات الغذائية", "تصنيع الأغذية"] }
    },
    {
      id: "taiwan-boat-show-2026",
      name: "Taiwan International Boat Show 2026",
      start: "2026-11-13", end: "2026-11-15", city: "KHH", industry: "marine",
      venue: { en: "KhaShing Pier 22, Kaohsiung", ar: "رصيف كاشينغ رقم 22، كاوشيونغ" },
      summary: {
        en: "Yachts, boats and marine equipment. Taiwan is one of the world’s leading builders of luxury yachts.",
        ar: "اليخوت والقوارب والمعدات البحرية. تُعدّ تايوان من أبرز الدول المصنّعة لليخوت الفاخرة في العالم."
      },
      themes: { en: ["Yachts", "Marine equipment"], ar: ["اليخوت", "المعدات البحرية"] }
    },
    {
      id: "healthcare-expo-2026",
      name: "Healthcare+ Expo Taiwan 2026",
      start: "2026-12-03", end: "2026-12-06", city: "TPE", industry: "health",
      venue: { en: "Taipei Nangang Exhibition Center", ar: "مركز نانغانغ للمعارض في تايبيه" },
      summary: {
        en: "Medical devices, smart healthcare and biotechnology, with Taiwan’s hospital groups exhibiting alongside manufacturers.",
        ar: "الأجهزة الطبية والرعاية الصحية الذكية والتقنيات الحيوية، بمشاركة مجموعات المستشفيات التايوانية إلى جانب المصنّعين."
      },
      themes: { en: ["Medical devices", "Smart healthcare", "Biotech"], ar: ["الأجهزة الطبية", "الرعاية الصحية الذكية", "التقنيات الحيوية"] }
    },
    {
      id: "timtos-2027",
      name: "TIMTOS 2027",
      start: "2027-03-02", end: "2027-03-07", city: "TPE", industry: "machinery",
      venue: { en: "Taipei World Trade Center (TWTC)", ar: "مركز تايبيه التجاري العالمي (TWTC)" },
      delegation: true,
      summary: {
        en: "Taipei International Machine Tool Show: CNC machines, cutting tools and smart manufacturing systems.",
        ar: "معرض تايبيه الدولي لآلات التصنيع: آلات CNC وأدوات القطع وأنظمة التصنيع الذكي."
      },
      themes: { en: ["Machine tools", "CNC", "Smart manufacturing"], ar: ["آلات التصنيع", "آلات CNC", "التصنيع الذكي"] }
    },
    {
      id: "taipei-cycle-2027",
      name: "Taipei Cycle 2027",
      start: "2027-03-24", end: "2027-03-27", city: "TPE", industry: "mobility",
      venue: { en: "Taipei Nangang Exhibition Center", ar: "مركز نانغانغ للمعارض في تايبيه" },
      url: "https://www.taipeicycle.com.tw/en/index.html",
      summary: {
        en: "One of the world’s leading bicycle trade shows: bikes, e-bikes, parts and accessories.",
        ar: "من أبرز معارض الدراجات في العالم: الدراجات والدراجات الكهربائية وقطع الغيار والإكسسوارات."
      },
      themes: { en: ["Bicycles", "E-bikes", "Parts & accessories"], ar: ["الدراجات", "الدراجات الكهربائية", "القطع والإكسسوارات"] }
    },
    {
      id: "taipei-ampa-2027",
      name: "Taipei AMPA & E-Mobility Taiwan 2027",
      start: "2027-04-13", end: "2027-04-16", city: "TPE", industry: "mobility",
      venue: { en: "Taipei Nangang Exhibition Center", ar: "مركز نانغانغ للمعارض في تايبيه" },
      delegation: true,
      summary: {
        en: "Auto and motorcycle parts and accessories, held with E-Mobility Taiwan and AUTOTRONICS. A key show for aftermarket importers.",
        ar: "قطع غيار وإكسسوارات السيارات والدراجات النارية، ويُقام مع E-Mobility Taiwan وAUTOTRONICS. معرض أساسي لمستوردي قطع ما بعد البيع."
      },
      themes: { en: ["Auto parts", "Motorcycle parts", "Electric vehicles", "Automotive electronics"], ar: ["قطع السيارات", "قطع الدراجات النارية", "المركبات الكهربائية", "إلكترونيات السيارات"] }
    },
    {
      id: "secutech-2027",
      name: "Secutech Taiwan & Fire & Safety 2027",
      start: "2027-04-21", end: "2027-04-23", city: "TPE", industry: "safety",
      venue: { en: "Taipei Nangang Exhibition Center", ar: "مركز نانغانغ للمعارض في تايبيه" },
      summary: {
        en: "Security, surveillance, fire protection and safety technology.",
        ar: "الأمن والمراقبة والحماية من الحرائق وتقنيات السلامة."
      },
      themes: { en: ["Surveillance", "Access control", "Fire protection"], ar: ["المراقبة", "التحكم في الدخول", "الحماية من الحرائق"] }
    },
    {
      id: "fastener-taiwan-2026",
      name: "Fastener Taiwan 2026",
      start: "2026-04-22", end: "2026-04-24", city: "KHH", industry: "hardware",
      venue: { en: "Kaohsiung Exhibition Center", ar: "مركز كاوشيونغ للمعارض" },
      organizer: "International Trade Administration · TAITRA · Taiwan Industrial Fasteners Institute",
      article: "fastener-taiwan-2026",
      summary: {
        en: "Taiwan’s dedicated fastener show, focused on sustainable, high-precision and high-value fastener production for industries from construction to aerospace.",
        ar: "معرض تايوان المتخصص في البراغي والمثبّتات، ويركّز على الإنتاج المستدام عالي الدقة والقيمة لصناعات تمتد من البناء إلى الطيران."
      },
      themes: { en: ["Precision fasteners", "Fastener machinery", "Materials and coatings"], ar: ["البراغي الدقيقة", "آلات تصنيع البراغي", "المواد والطلاءات"] }
    },
    {
      id: "agri-tech-2025",
      name: "Asia Agri-Tech Expo & Forum 2025",
      start: "2025-06-11", end: "2025-06-13", city: "TNN", industry: "food",
      venue: { en: "ICC Tainan", ar: "مركز تاينان الدولي للمؤتمرات ICC" },
      organizer: "Informa Markets (Taiwan Branch)",
      url: "https://www.agritechtaiwan.com",
      summary: {
        en: "Taiwan’s only B2B trade show dedicated to agriculture, livestock and aquaculture, held with Livestock Taiwan and Aquaculture Taiwan. The 2024 edition drew more than 27,000 professionals.",
        ar: "المعرض التجاري الوحيد في تايوان المخصّص للزراعة والثروة الحيوانية والاستزراع المائي، ويُقام مع Livestock Taiwan وAquaculture Taiwan. استقطبت دورة 2024 أكثر من 27 ألف مختص."
      },
      themes: { en: ["Smart agriculture", "Livestock", "Aquaculture"], ar: ["الزراعة الذكية", "الثروة الحيوانية", "الاستزراع المائي"] }
    }
  ],

  services: [
    {
      id: "delegations", icon: "group",
      title: { en: "Buyer delegations", ar: "وفود المشترين" },
      summary: {
        en: "Travel to a Taiwan trade show with the AAT team. We plan the trip around meetings with suppliers who fit your order.",
        ar: "سافر إلى معرض تجاري في تايوان مع فريق AAT. نخطّط الرحلة حول اجتماعات مع موردين يناسبون طلبك."
      },
      includes: {
        en: ["Show registration and badges", "Hotel and airport transfers", "Interpreter: Arabic, English, Chinese", "At least five pre-booked supplier meetings", "Optional factory visits"],
        ar: ["التسجيل في المعرض وبطاقات الدخول", "الفندق والتنقّل من المطار وإليه", "مترجم: عربي وإنجليزي وصيني", "خمسة اجتماعات على الأقل محجوزة مسبقاً مع موردين", "زيارات اختيارية للمصانع"]
      },
      price: { en: "Quote per show", ar: "عرض سعر لكل معرض" }
    },
    {
      id: "matchmaking", icon: "swap",
      title: { en: "Trade matchmaking", ar: "المطابقة التجارية" },
      summary: {
        en: "Send us your specification. Our Taiwan team shortlists three to five suppliers, collects quotes and introduces you.",
        ar: "أرسل لنا مواصفاتك، ويختار فريقنا في تايوان من ثلاثة إلى خمسة موردين، ويجمع عروض الأسعار ويعرّفك بهم."
      },
      includes: {
        en: ["Specification review with you", "Shortlist of 3–5 suppliers", "Quotes, MOQ and lead times compared", "Introduction by email or video call"],
        ar: ["مراجعة المواصفات معك", "قائمة مختصرة من 3 إلى 5 موردين", "مقارنة الأسعار والحد الأدنى للطلب ومدة التسليم", "تعريف عبر البريد أو مكالمة فيديو"]
      },
      price: { en: "Fixed fee per request", ar: "رسوم ثابتة لكل طلب" }
    },
    {
      id: "meetings", icon: "video",
      title: { en: "Online supplier meetings", ar: "اجتماعات مرئية مع الموردين" },
      summary: {
        en: "Meet a Taiwanese supplier by video without travelling. We schedule across time zones and join as interpreter if you need one.",
        ar: "قابِل مورداً تايوانياً عبر الفيديو دون سفر. ننسّق المواعيد بين المناطق الزمنية وننضم كمترجمين عند الحاجة."
      },
      includes: {
        en: ["Scheduling across time zones", "Agenda and product questions prepared", "Interpreter on the call", "Written summary afterwards"],
        ar: ["تنسيق المواعيد بين المناطق الزمنية", "تحضير جدول الأعمال وأسئلة المنتج", "مترجم خلال المكالمة", "ملخص مكتوب بعد الاجتماع"]
      },
      price: { en: "Included for Club members", ar: "مشمولة لأعضاء النادي" }
    },
    {
      id: "verification", icon: "shield",
      title: { en: "Supplier verification", ar: "توثيق الموردين" },
      summary: {
        en: "Before you pay a deposit, we check that the supplier is real, licensed and able to deliver.",
        ar: "قبل أن تدفع أي عربون، نتحقق من أن المورّد حقيقي ومرخّص وقادر على التسليم."
      },
      includes: {
        en: ["Business registration check in Taiwan", "Factory visit with photos", "Export history and references", "Written report within an agreed time"],
        ar: ["التحقق من السجل التجاري في تايوان", "زيارة المصنع مع صور", "سجل التصدير والمراجع", "تقرير مكتوب في مدة متفق عليها"]
      },
      price: { en: "Fixed fee per supplier", ar: "رسوم ثابتة لكل مورّد" }
    },
    {
      id: "visibility", icon: "megaphone",
      title: { en: "Supplier visibility", ar: "الظهور للموردين" },
      summary: {
        en: "For Taiwanese exporters: a profile, features in AAT Magazine and meetings with our buyer delegations.",
        ar: "للمصدّرين التايوانيين: ملف تعريفي، وظهور في مجلة AAT، واجتماعات مع وفود المشترين لدينا."
      },
      includes: {
        en: ["Directory profile in English and Arabic", "Magazine feature or interview", "Priority in delegation meetings"],
        ar: ["ملف في الدليل بالإنجليزية والعربية", "مقال أو مقابلة في المجلة", "أولوية في اجتماعات الوفود"]
      },
      price: { en: "Annual partner plan", ar: "باقة شراكة سنوية" }
    }
  ],

  plans: [
    {
      id: "reader",
      name: { en: "Reader", ar: "قارئ" },
      price: { en: "Free", ar: "مجاناً" },
      who: { en: "For anyone following trade with Taiwan.", ar: "لكل من يتابع التجارة مع تايوان." },
      features: {
        en: ["AAT Magazine and show guides", "Exhibitions calendar and show alerts", "Weekly newsletter", "AAT Assistant on the website"],
        ar: ["مجلة AAT وأدلة المعارض", "تقويم المعارض وتنبيهاتها", "النشرة الأسبوعية", "مساعد AAT على الموقع"]
      },
      cta: { en: "Subscribe free", ar: "اشترك مجاناً" }
    },
    {
      id: "club", highlight: true,
      name: { en: "AAT Business Club member", ar: "عضو نادي AAT للأعمال" },
      price: { en: "Annual fee on request", ar: "الرسوم السنوية عند الطلب" },
      who: { en: "For importers and traders who buy from Taiwan.", ar: "للمستوردين والتجّار الذين يشترون من تايوان." },
      features: {
        en: ["Everything in Reader", "Online supplier meetings included", "Member rates on delegations and matchmaking", "Supplier contact details in the directory", "Members-only networking events"],
        ar: ["كل مزايا باقة القارئ", "الاجتماعات المرئية مع الموردين مشمولة", "أسعار خاصة للوفود والمطابقة", "بيانات تواصل الموردين في الدليل", "فعاليات تواصل للأعضاء فقط"]
      },
      cta: { en: "Apply to join", ar: "قدّم طلب الانضمام" }
    },
    {
      id: "partner",
      name: { en: "Supplier partner", ar: "شريك مورّد" },
      price: { en: "Annual fee on request", ar: "الرسوم السنوية عند الطلب" },
      who: { en: "For Taiwanese manufacturers and exporters.", ar: "للمصنّعين والمصدّرين التايوانيين." },
      features: {
        en: ["Bilingual directory profile", "Feature in AAT Magazine", "Meetings with buyer delegations at shows"],
        ar: ["ملف ثنائي اللغة في الدليل", "ظهور في مجلة AAT", "اجتماعات مع وفود المشترين في المعارض"]
      },
      cta: { en: "Apply as a supplier", ar: "قدّم كمورّد" }
    }
  ],

  /* SAMPLE listings to show how the directory works.
     Replace with real, verified suppliers before launch. */
  suppliers: [
    {
      id: "s1", sample: true, verified: true, city: "KHH", industry: "hardware",
      name: { en: "Precision fastener maker", ar: "مصنّع براغي دقيقة" },
      products: { en: "Stainless and alloy bolts, nuts and screws (M3–M36)", ar: "براغي وصواميل ومسامير من الفولاذ المقاوم للصدأ والسبائك (M3–M36)" },
      moq: "5,000 pcs", lead: "30–45", certs: "ISO 9001", exports: { en: "GCC, EU, North America", ar: "دول الخليج وأوروبا وأمريكا الشمالية" },
      event: "taiwan-industry-week-2026"
    },
    {
      id: "s2", sample: true, verified: true, city: "TNN", industry: "energy",
      name: { en: "Solar mounting systems manufacturer", ar: "مصنّع أنظمة تثبيت الألواح الشمسية" },
      products: { en: "Aluminium and steel PV mounting for rooftop and ground", ar: "هياكل تثبيت شمسية من الألمنيوم والصلب للأسطح والأرض" },
      moq: "1 container", lead: "25–40", certs: "ISO 9001, ISO 14001", exports: { en: "Saudi Arabia, UAE, Japan", ar: "السعودية والإمارات واليابان" },
      event: "energy-taiwan-2026"
    },
    {
      id: "s3", sample: true, verified: true, city: "TXG", industry: "hardware",
      name: { en: "Hand tools exporter", ar: "مصدّر عدد يدوية" },
      products: { en: "Wrenches, sockets and tool sets, OEM and private label", ar: "مفاتيح ربط ولقم وأطقم عدد، تصنيع لعلامات الغير وعلامات خاصة" },
      moq: "500 sets", lead: "45–60", certs: "ISO 9001", exports: { en: "Middle East, Europe", ar: "الشرق الأوسط وأوروبا" },
      event: "tite-2026"
    },
    {
      id: "s4", sample: true, verified: false, city: "TPE", industry: "electronics",
      name: { en: "Industrial IoT sensor company", ar: "شركة حساسات إنترنت الأشياء الصناعية" },
      products: { en: "Temperature, vibration and energy sensors with cloud dashboard", ar: "حساسات الحرارة والاهتزاز والطاقة مع لوحة تحكم سحابية" },
      moq: "200 units", lead: "20–30", certs: "CE, FCC", exports: { en: "Southeast Asia, Europe", ar: "جنوب شرق آسيا وأوروبا" },
      event: "taitronics-aiot-2026"
    },
    {
      id: "s5", sample: true, verified: true, city: "KHH", industry: "food",
      name: { en: "Specialty food and tea producer", ar: "منتج أغذية وشاي متخصص" },
      products: { en: "Oolong tea, dried fruit and snack products, halal options", ar: "شاي أولونغ وفواكه مجففة ووجبات خفيفة، مع خيارات حلال" },
      moq: "1 pallet", lead: "20–30", certs: "HACCP, Halal", exports: { en: "Malaysia, GCC", ar: "ماليزيا ودول الخليج" },
      event: "kaohsiung-food-show-2026"
    },
    {
      id: "s6", sample: true, verified: false, city: "TXG", industry: "machinery",
      name: { en: "CNC machine builder", ar: "مصنّع آلات CNC" },
      products: { en: "Vertical machining centres and CNC lathes", ar: "مراكز تشغيل رأسية ومخارط CNC" },
      moq: "1 unit", lead: "60–90", certs: "CE", exports: { en: "Turkey, India, GCC", ar: "تركيا والهند ودول الخليج" },
      event: "timtos-2027"
    }
  ],

  articles: [
    {
      id: "energy-taiwan-2026-guide",
      date: "2026-09-27", industry: "energy", minutes: 4, event: "energy-taiwan-2026",
      title: {
        en: "Energy Taiwan & Net-Zero Taiwan 2026: a buyer’s guide",
        ar: "دليل المشتري إلى معرض تايوان للطاقة والحياد الكربوني 2026"
      },
      excerpt: {
        en: "Three days in Nangang Hall 1 cover solar, wind, storage and decarbonization services. Here is how to plan your visit.",
        ar: "ثلاثة أيام في قاعة نانغانغ 1 تغطي الطاقة الشمسية والرياح والتخزين وخدمات خفض الكربون. إليك كيف تخطط لزيارتك."
      },
      body: {
        en: [
          "Energy Taiwan and Net-Zero Taiwan return to the Taipei Nangang Exhibition Center, Hall 1, from 14 to 16 October 2026. The shows are co-organized by TAITRA and the Green Energy and Sustainability Alliance (GESA) under SEMI.",
          "Energy Taiwan is divided into four areas. PV Taiwan covers solar modules, inverters and mounting. Wind Taiwan covers offshore and onshore wind supply chains. Smart Storage Taiwan covers batteries and energy management. Emerging Power covers hydrogen, geothermal, small hydropower, ocean energy and biomass.",
          "Net-Zero Taiwan is aimed at companies that need to cut emissions. Exhibitors offer CBAM response strategies, deep energy saving, carbon management, renewable energy trading, green finance, circular-economy solutions and inspection and verification services.",
          "For buyers from the Gulf and Southeast Asia, the most useful parts are the business matchmaking sessions and the full supply chain on one floor. You can meet component makers, system integrators and maintenance firms in the same day.",
          "Our advice: register online before you travel, send your specifications to suppliers two weeks ahead, and book meetings for the first two days. Use the third day for follow-up visits and forums. AAT can arrange all of this as part of our buyer delegation."
        ],
        ar: [
          "يعود معرضا الطاقة في تايوان (Energy Taiwan) والحياد الكربوني (Net-Zero Taiwan) إلى مركز نانغانغ للمعارض في تايبيه، القاعة 1، من 14 إلى 16 أكتوبر 2026، بتنظيم مشترك بين TAITRA وتحالف الطاقة الخضراء والاستدامة GESA التابع لـ SEMI.",
          "ينقسم معرض الطاقة في تايوان إلى أربعة أقسام: PV Taiwan للألواح الشمسية والعاكسات وهياكل التثبيت، وWind Taiwan لسلاسل توريد طاقة الرياح البحرية والبرية، وSmart Storage Taiwan للبطاريات وإدارة الطاقة، وقسم الطاقة الناشئة للهيدروجين والحرارة الجوفية والطاقة المائية الصغيرة وطاقة المحيطات والكتلة الحيوية.",
          "أما معرض الحياد الكربوني فموجّه للشركات التي تحتاج إلى خفض انبعاثاتها، ويقدّم العارضون فيه استراتيجيات الاستجابة لآلية CBAM، وترشيد الطاقة، وإدارة الكربون، وتداول الطاقة المتجددة، والتمويل الأخضر، وحلول الاقتصاد الدائري، وخدمات الفحص والتحقق.",
          "بالنسبة للمشترين من الخليج وجنوب شرق آسيا، فإن أكثر ما يفيد هو جلسات المطابقة التجارية ووجود سلسلة التوريد كاملة في قاعة واحدة، إذ يمكنك مقابلة مصنّعي المكوّنات ومكاملي الأنظمة وشركات الصيانة في اليوم نفسه.",
          "نصيحتنا: سجّل عبر الإنترنت قبل السفر، وأرسل مواصفاتك إلى الموردين قبل أسبوعين، واحجز الاجتماعات في اليومين الأولين، واترك اليوم الثالث للمتابعة والمنتديات. ويمكن لـ AAT ترتيب كل ذلك ضمن وفد المشترين."
        ]
      }
    },
    {
      id: "fastener-taiwan-2026",
      date: "2026-04-19", industry: "hardware", minutes: 3, event: "fastener-taiwan-2026",
      source: "https://aatworld.com/fastener-taiwan-2026-to-highlight-sustainable-high-precision-manufacturing/",
      title: {
        en: "Fastener Taiwan 2026 highlights sustainable, high-precision manufacturing",
        ar: "معرض تايوان للبراغي والمثبّتات 2026 يسلّط الضوء على التصنيع المستدام عالي الدقة"
      },
      excerpt: {
        en: "The “Kingdom of Fasteners” met in Kaohsiung as tariffs and net-zero targets push the industry toward green, digital production.",
        ar: "اجتمعت «مملكة البراغي» في كاوشيونغ بينما تدفع الرسوم الجمركية وأهداف الحياد الكربوني الصناعة نحو إنتاج أخضر ورقمي."
      },
      body: {
        en: [
          "Fastener Taiwan 2026 took place from 22 to 24 April at the Kaohsiung Exhibition Center. It was organized by the International Trade Administration and implemented by TAITRA and the Taiwan Industrial Fasteners Institute.",
          "Taiwan is often called the “Kingdom of Fasteners”. Strong industrial clusters and a complete supply chain let its makers supply fasteners for construction, automotive and aerospace customers around the world.",
          "This year the focus was sustainability, smart manufacturing and research. With tariff pressure and net-zero targets, many producers are moving to greener processes and digital production lines.",
          "The show covered the full range: forming machinery, materials, coatings and precision fasteners for advanced uses. Exhibitors included SPEC, JERN YAO and CHIEN TSAI Machinery, alongside international brands such as Dörken Coatings and Fukae Spring. Forums and networking events supported business matching.",
          "Buyers who missed the show can still meet Kaohsiung fastener makers through AAT matchmaking or at Taiwan Industry Week in Taipei this October."
        ],
        ar: [
          "أُقيم معرض Fastener Taiwan 2026 من 22 إلى 24 أبريل في مركز كاوشيونغ للمعارض، بتنظيم من إدارة التجارة الدولية وتنفيذ TAITRA ومعهد تايوان للمثبّتات الصناعية.",
          "تُلقّب تايوان بـ«مملكة البراغي»، إذ تتيح لها التجمعات الصناعية القوية وسلسلة التوريد المتكاملة تزويد عملاء البناء والسيارات والطيران حول العالم.",
          "ركّزت دورة هذا العام على الاستدامة والتصنيع الذكي والبحث والتطوير. ومع ضغوط الرسوم الجمركية وأهداف الحياد الكربوني، يتجه كثير من المنتجين إلى عمليات أنظف وخطوط إنتاج رقمية.",
          "غطّى المعرض الطيف الكامل: آلات التشكيل والمواد والطلاءات والبراغي الدقيقة للاستخدامات المتقدمة. ومن العارضين SPEC وJERN YAO وCHIEN TSAI Machinery، إلى جانب علامات دولية مثل Dörken Coatings وFukae Spring، مع منتديات وفعاليات للتواصل والمطابقة التجارية.",
          "يمكن للمشترين الذين فاتهم المعرض مقابلة مصنّعي البراغي في كاوشيونغ عبر خدمة المطابقة من AAT أو في أسبوع تايوان الصناعي في تايبيه في أكتوبر."
        ]
      }
    },
    {
      id: "how-to-source-from-taiwan",
      date: "2026-09-27", industry: "hardware", minutes: 5,
      title: {
        en: "How to source from Taiwan in five steps",
        ar: "كيف تستورد من تايوان في خمس خطوات"
      },
      excerpt: {
        en: "A practical checklist for importers buying from Taiwan for the first time, from specification to first shipment.",
        ar: "قائمة عملية للمستوردين الذين يشترون من تايوان لأول مرة، من المواصفات حتى أول شحنة."
      },
      body: {
        en: [
          "1. Write a clear specification. Include materials, dimensions, standards, quantity, packaging, target price and delivery port. Suppliers answer faster and quote more accurately when the request is complete.",
          "2. Build a shortlist, not a long list. Three to five qualified suppliers are enough. Look at what they already export, which certifications they hold and whether they exhibit at the main trade show for your product.",
          "3. Verify before you pay. Check the business registration, ask for export references and, for larger orders, arrange a factory visit. A deposit is much harder to recover than a delay is to accept.",
          "4. Meet in person or by video. A trade show lets you compare several suppliers in one day. A video call with an interpreter works well for follow-up and for smaller orders.",
          "5. Start with a trial order. Agree quality checks and Incoterms in writing, then scale up once the first shipment arrives as agreed.",
          "AAT can help at every step: matchmaking to build the shortlist, verification before payment, and delegations and online meetings to meet suppliers."
        ],
        ar: [
          "1. اكتب مواصفات واضحة تشمل المواد والأبعاد والمعايير والكمية والتغليف والسعر المستهدف وميناء التسليم. يرد الموردون أسرع ويقدّمون أسعاراً أدق عندما يكون الطلب كاملاً.",
          "2. ابنِ قائمة مختصرة لا طويلة. يكفي ثلاثة إلى خمسة موردين مؤهلين. انظر إلى ما يصدّرونه حالياً، وشهاداتهم، وهل يشاركون في المعرض الرئيسي لمنتجك.",
          "3. تحقّق قبل أن تدفع. راجع السجل التجاري، واطلب مراجع تصدير، ورتّب زيارة للمصنع في الطلبات الكبيرة. استرداد العربون أصعب بكثير من تقبّل تأخير.",
          "4. قابِل الموردين حضورياً أو عبر الفيديو. يتيح لك المعرض مقارنة عدة موردين في يوم واحد، وتناسب مكالمة الفيديو مع مترجم المتابعة والطلبات الأصغر.",
          "5. ابدأ بطلب تجريبي. اتفق كتابياً على فحوص الجودة وشروط التسليم (Incoterms)، ثم وسّع الطلبات بعد وصول الشحنة الأولى كما اتُّفق.",
          "تساعدك AAT في كل خطوة: المطابقة لبناء القائمة المختصرة، والتوثيق قبل الدفع، والوفود والاجتماعات المرئية لمقابلة الموردين."
        ]
      }
    },
    {
      id: "taiwan-industry-week-2026-preview",
      date: "2026-09-27", industry: "hardware", minutes: 3, event: "taiwan-industry-week-2026",
      title: {
        en: "October 20–22: Taiwan’s busiest week for industrial buyers",
        ar: "20–22 أكتوبر: الأسبوع الأكثر ازدحاماً للمشترين الصناعيين في تايوان"
      },
      excerpt: {
        en: "Hardware, metal, safety, HVAC, electronics and PCB shows run the same three days in Taipei, with tools and hardware in Taichung.",
        ar: "معارض العدد والمعادن والسلامة والتكييف والإلكترونيات ولوحات الدوائر تُقام في الأيام الثلاثة نفسها في تايبيه، ومعرض العدد في تايتشونغ."
      },
      body: {
        en: [
          "From 20 to 22 October 2026, the Taipei Nangang Exhibition Center hosts Taiwan Industry Week. It brings together the Taiwan Hardware Show, International Metal Technology Taiwan, T-SAFE Occupational Safety and Refrigeration & HVAC Taiwan.",
          "The same days, TAITRONICS, AIoT Taiwan and the TPCA Show cover electronic components, AI and IoT, and printed circuit boards, also in Nangang.",
          "In Taichung, the Taiwan International Tools & Hardware Expo (TiTE) and International Hardware Expo Taiwan run in parallel. Central Taiwan is the island’s main tool-making cluster, so many factories are within an hour of the venue.",
          "For a buyer this is an efficient week: two days in Taipei and one in Taichung, connected by high-speed rail in under an hour. It follows Energy Taiwan (14–16 October), so energy buyers can combine both trips.",
          "AAT is organizing a buyer delegation for this week. Contact us to reserve a seat and tell us which products you want to source."
        ],
        ar: [
          "من 20 إلى 22 أكتوبر 2026 يستضيف مركز نانغانغ للمعارض في تايبيه أسبوع تايوان الصناعي، الذي يجمع معرض تايوان للعدد، ومعرض تقنيات المعادن، ومعرض السلامة المهنية T-SAFE، ومعرض التبريد والتكييف.",
          "وفي الأيام نفسها تغطي معارض TAITRONICS وAIoT Taiwan وTPCA المكوّنات الإلكترونية والذكاء الاصطناعي وإنترنت الأشياء ولوحات الدوائر المطبوعة، في نانغانغ أيضاً.",
          "وفي تايتشونغ يُقام معرض تايوان الدولي للعدد والخردوات TiTE بالتوازي مع معرض الخردوات الدولي. ووسط تايوان هو أكبر تجمّع لصناعة العدد في الجزيرة، لذا تقع مصانع كثيرة على بُعد ساعة من مكان المعرض.",
          "بالنسبة للمشتري، هذا أسبوع فعّال: يومان في تايبيه ويوم في تايتشونغ، يربط بينهما القطار السريع في أقل من ساعة. ويأتي بعد معرض Energy Taiwan (14–16 أكتوبر)، فيمكن لمشتري الطاقة الجمع بين الرحلتين.",
          "تنظّم AAT وفداً من المشترين لهذا الأسبوع. تواصل معنا لحجز مقعدك وأخبرنا بالمنتجات التي تريد استيرادها."
        ]
      }
    }
  ],

  faqs: [
    {
      q: { en: "Who is AAT World for?", ar: "لمن صُمّم موقع التجارة العربية الآسيوية؟" },
      a: { en: "Importers, traders and distributors who buy from Taiwan, and Taiwanese manufacturers and exporters who want serious international buyers.", ar: "للمستوردين والتجّار والموزّعين الذين يشترون من تايوان، وللمصنّعين والمصدّرين التايوانيين الذين يبحثون عن مشترين دوليين جادّين." }
    },
    {
      q: { en: "Do I need a membership to use your services?", ar: "هل أحتاج إلى عضوية لاستخدام خدماتكم؟" },
      a: { en: "No. Anyone can book a delegation, matchmaking or verification. Club members pay member rates and get online meetings included.", ar: "لا. يمكن لأي شخص حجز وفد أو مطابقة أو توثيق. يحصل أعضاء النادي على أسعار خاصة والاجتماعات المرئية مشمولة." }
    },
    {
      q: { en: "What does “AAT verified” mean?", ar: "ماذا تعني شارة «موثّق من AAT»؟" },
      a: { en: "Our team has checked the company’s business registration in Taiwan, visited the factory and reviewed its export history. The badge shows the date of the last check and is renewed every year.", ar: "تحقّق فريقنا من السجل التجاري للشركة في تايوان، وزار المصنع، وراجع سجل التصدير. تُظهر الشارة تاريخ آخر فحص وتُجدَّد سنوياً." }
    },
    {
      q: { en: "Which languages do you work in?", ar: "بأي لغات تعملون؟" },
      a: { en: "Arabic, English and Chinese, the same three languages as our Arab Asian Trade magazine. Our interpreters join meetings at shows and on video calls.", ar: "العربية والإنجليزية والصينية، وهي لغات مجلتنا «التجارة العربية الآسيوية» نفسها. ينضم مترجمونا إلى الاجتماعات في المعارض وعبر مكالمات الفيديو." }
    },
    {
      q: { en: "How quickly will you reply?", ar: "متى ستردّون عليّ؟" },
      a: { en: "We reply to WhatsApp messages and requests on working days in Taiwan and Malaysia time (GMT+8).", ar: "نردّ على رسائل واتساب والطلبات في أيام العمل بتوقيت تايوان وماليزيا (GMT+8)." }
    },
    {
      q: { en: "Can suppliers pay to be listed as verified?", ar: "هل يمكن للموردين الدفع للحصول على شارة التوثيق؟" },
      a: { en: "No. Suppliers can pay for a partner plan, but the verified badge is only given after our inspection.", ar: "لا. يمكن للموردين الاشتراك في باقة الشراكة، لكن شارة التوثيق لا تُمنح إلا بعد فحصنا." }
    }
  ]
};
