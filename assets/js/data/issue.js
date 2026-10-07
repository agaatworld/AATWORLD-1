/* AAT digital magazine: Issue 559, August 2026.
   Each advertiser page from the PDF becomes an interactive page.
   hot: product hotspots, x/y = centre of the product on the page in % (0–100).
   To add a new issue: render each page to assets/img/mag/pN.jpg and add entries below. */

window.AAT_ISSUE = {
  number: 559,
  month: { en: "August 2026", ar: "أغسطس 2026" },
  cover: "p1.jpg",
  pages: 100,

  cats: {
    machinery: { en: "Industrial machinery", ar: "الآلات الصناعية" },
    plastics:  { en: "Plastics & packaging", ar: "البلاستيك والتغليف" },
    tools:     { en: "Tools & auto service", ar: "العدد وأدوات السيارات" },
    auto:      { en: "Auto parts & mobility", ar: "قطع السيارات والتنقّل" },
    hardware:  { en: "Hardware & components", ar: "الخردوات والمكوّنات" },
    fitness:   { en: "Fitness & sport", ar: "اللياقة والرياضة" },
    medical:   { en: "Medical & health", ar: "الطبي والصحي" },
    food:      { en: "Food & beverage", ar: "الأغذية والمشروبات" },
    event:     { en: "Trade shows", ar: "المعارض" }
  },

  ads: [
    {
      page: 3, cat: "plastics", company: "YE I Machinery Factory Co., Ltd.", city: { en: "Tainan, Taiwan", ar: "تاينان، تايوان" },
      about: { en: "Turnkey plastic recycling and blown-film lines: one place, all solutions for the circular economy.", ar: "خطوط متكاملة لإعادة تدوير البلاستيك ونفخ الأفلام: مكان واحد لكل حلول الاقتصاد الدائري." },
      tel: "+886-6-253-6066", email: "service@yei.com.tw", web: "https://www.yei.com.tw",
      address: "6 Min Dong Rd., Yong Kang Dist., Tainan City, Taiwan", certs: "ISO 9001 · CE",
      hot: [
        { x: 72, y: 16, name: "YDS Series", d: { en: "Touch-screen plastic waste recycling machine", ar: "آلة إعادة تدوير نفايات البلاستيك بشاشة لمس" } },
        { x: 22, y: 36, name: "YE I-DL Series", d: { en: "ABA co-extrusion film blown line", ar: "خط نفخ أفلام ثلاثي الطبقات ABA" } },
        { x: 78, y: 42, name: "HSRT Series", d: { en: "Oscillating take-up co-extrusion blown film line", ar: "خط نفخ أفلام متعدد الطبقات بلفّ متأرجح" } },
        { x: 40, y: 63, name: "YDN-HPELB Series", d: { en: "Strand-type PET recycling machine", ar: "آلة إعادة تدوير PET" } },
        { x: 58, y: 78, name: "YDN Series", d: { en: "Two-stage plastic recycling machine", ar: "آلة إعادة تدوير بلاستيك على مرحلتين" } }
      ]
    },
    {
      page: 4, cat: "plastics", company: "Kang Chyau Industry Co., Ltd.", city: { en: "New Taipei, Taiwan", ar: "تايبيه الجديدة، تايوان" },
      about: { en: "Whole plants for plastic bag making: HDPE / LDPE / LLDPE blown film machines.", ar: "مصانع متكاملة لإنتاج الأكياس البلاستيكية: آلات نفخ أفلام HDPE وLDPE وLLDPE." },
      tel: "+886-2-22856880", email: "kang.chyau@msa.hinet.net", web: "http://www.kangchyau.com.tw",
      address: "No. 2-10, Aly. 28, Ln. 227, Fuxing Rd., Luzhou Dist., New Taipei City 247, Taiwan", certs: "SGS · UKAS",
      hot: [
        { x: 74, y: 37, name: "KMTL-4545T", d: { en: "Twin-head A/B/A layer plastic inflation machine", ar: "آلة نفخ بلاستيك برأسين ثلاثية الطبقات" } },
        { x: 30, y: 52, name: "KMTL-50S", d: { en: "Super high-speed two-layer inflation machine", ar: "آلة نفخ فائقة السرعة بطبقتين" } }
      ]
    },
    {
      page: 5, cat: "machinery", company: "Ten Sheeg Machinery Co., Ltd.", city: { en: "Tainan, Taiwan", ar: "تاينان، تايوان" },
      about: { en: "Splitting machines for foam, PU and leather, made since 1973.", ar: "آلات شقّ الإسفنج والبولي يوريثان والجلود، منذ 1973." },
      tel: "+886-932-800-692", email: "sales@tensheeg.com", web: "https://www.tensheeg.com",
      address: "No. 89, Xinji 2nd Rd., Annan Dist., Tainan City 709007, Taiwan", certs: "CE",
      hot: [
        { x: 32, y: 25, name: "SM-690C", d: { en: "Automatic horizontal vacuum splitting machine", ar: "آلة شقّ أفقية أوتوماتيكية بالتفريغ" } },
        { x: 68, y: 40, name: "SM-668", d: { en: "PU bandknife horizontal loop vacuum splitter", ar: "آلة شقّ PU بسكين شريطية حلقية" } },
        { x: 32, y: 64, name: "SM-690T", d: { en: "Loop jointing and splitting machine", ar: "آلة وصل وشقّ حلقية" } },
        { x: 68, y: 73, name: "SM-61 Series", d: { en: "Bandknife splitting machine", ar: "آلة شقّ بسكين شريطية" } }
      ]
    },
    {
      page: 7, cat: "auto", company: "Hwang Yu Automobile Parts Co., Ltd.", city: { en: "Taiwan", ar: "تايوان" },
      about: { en: "Steering and suspension parts: honesty, efficiency, professionalism.", ar: "قطع التوجيه والتعليق: أمانة وكفاءة واحترافية." },
      web: "https://www.hwangyu.com",
      hot: [
        { x: 50, y: 62, name: "Idler arm & tie rod end", d: { en: "Steering linkage parts", ar: "قطع وصلات التوجيه" } },
        { x: 78, y: 14, name: "Stabilizer link", d: { en: "Suspension stabilizer link", ar: "وصلة عمود التوازن" } },
        { x: 78, y: 26, name: "Ball joint", d: { en: "Suspension ball joint", ar: "كرسي مقص (بول جوينت)" } }
      ]
    },
    {
      page: 8, cat: "machinery", company: "Hann Kuen Machinery & Hardware Co., Ltd. (HARDY)", city: { en: "Taichung, Taiwan", ar: "تايتشونغ، تايوان" },
      about: { en: "Spindle heads, power units and servo slide tables for machine tools. Taiwan Excellence award winner.", ar: "رؤوس دوّارة ووحدات قدرة وطاولات انزلاق سيرفو لآلات التصنيع. حائزة على جائزة Taiwan Excellence." },
      tel: "+886-4-2486-0602", email: "hann.kuen@hardy.com.tw", web: "http://www.hardy-tw.com",
      address: "No. 22, Liou Shun Rd., East District, Taichung City 401, Taiwan", certs: "ISO 9001", line: "hann.kuen",
      hot: [
        { x: 20, y: 29, name: "Servo drilling / tapping spindle head", d: { en: "Servo type drilling and tapping unit", ar: "وحدة ثقب وقلووظ سيرفو" } },
        { x: 81, y: 29, name: "Built-in motor spindle unit", d: { en: "Built-in motor spindle", ar: "عمود دوران بمحرك مدمج" } },
        { x: 40, y: 51, name: "Belt driven spindle", d: { en: "Belt driven spindle", ar: "عمود دوران بسير" } },
        { x: 61, y: 73, name: "XYZ servo slide table", d: { en: "XYZ servo slide table with milling head", ar: "طاولة انزلاق سيرفو XYZ مع رأس تفريز" } }
      ]
    },
    {
      page: 9, cat: "event", company: "ArabPlast 2027", city: { en: "Dubai, UAE", ar: "دبي، الإمارات" },
      about: { en: "18th international trade show for plastics, recycling, petrochemicals, packaging and rubber. 24–26 March 2027, Dubai World Trade Centre, Halls 1–8. New: Recycling Pavilion.", ar: "المعرض الدولي الثامن عشر للبلاستيك وإعادة التدوير والبتروكيماويات والتغليف والمطاط. 24–26 مارس 2027، مركز دبي التجاري العالمي، القاعات 1–8. جديد: جناح إعادة التدوير." },
      web: "https://www.arabplast.info", address: "Dubai World Trade Centre, Dubai, UAE",
      hot: [
        { x: 30, y: 21, name: "24–26 March 2027", d: { en: "Halls 1–8, Dubai World Trade Centre", ar: "القاعات 1–8، مركز دبي التجاري العالمي" } },
        { x: 40, y: 82, name: "Recycling Pavilion", d: { en: "New dedicated platform for sustainability and circularity", ar: "منصة جديدة للاستدامة والاقتصاد الدائري" } },
        { x: 84, y: 88, name: "Book your stand", d: { en: "Exhibitor registration", ar: "حجز جناح للعارضين" } }
      ]
    },
    {
      page: 10, cat: "fitness", company: "JK Fitness (JK Exercise)", city: { en: "Taipei, Taiwan", ar: "تايبيه، تايوان" },
      about: { en: "Premium fitness equipment since 1981, exported to more than 60 countries. Taiwan government award for excellent performance.", ar: "معدات لياقة متميزة منذ 1981، تُصدَّر إلى أكثر من 60 دولة. حائزة على جائزة «الأداء المتميز» من الحكومة التايوانية." },
      tel: "+886-2-25373397", email: "sales@jkexer.com", web: "https://www.jkexer.com/en",
      address: "9F, No. 26, Min Chuan E. Rd., Sec. 2, Taipei, Taiwan",
      hot: [
        { x: 64, y: 43, name: "Electric treadmills", d: { en: "Motorised treadmills", ar: "أجهزة المشي الكهربائية" } },
        { x: 86, y: 66, name: "Air bikes", d: { en: "Air (fan) bikes", ar: "دراجات هوائية" } },
        { x: 40, y: 66, name: "Indoor fitness bikes", d: { en: "Upright and recumbent bikes", ar: "دراجات اللياقة الداخلية" } },
        { x: 50, y: 78, name: "Multi-gym stations", d: { en: "Multi-function training stations", ar: "أجهزة تمارين متعددة" } }
      ]
    },
    {
      page: 22, cat: "hardware", company: "Unipex Global Co., Ltd.", city: { en: "Taiwan", ar: "تايوان" },
      about: { en: "Anti-slip, gaffer, floor-marking and PVC tapes.", ar: "أشرطة مانعة للانزلاق وأشرطة Gaffer وأشرطة تحديد الأرضيات وأشرطة PVC." },
      email: "sales@unipexglobal.com.tw", web: "https://www.unipexglobal.com",
      hot: [
        { x: 78, y: 26, name: "Anti-slip tape", d: { en: "Safety anti-slip tape", ar: "شريط مانع للانزلاق" } },
        { x: 55, y: 42, name: "Floor marking tape", d: { en: "Colour floor marking tape", ar: "شريط تحديد الأرضيات الملوّن" } },
        { x: 50, y: 62, name: "Gaffer & PVC tape", d: { en: "Gaffer and PVC tapes in many colours", ar: "أشرطة Gaffer وPVC بألوان متعددة" } }
      ]
    },
    {
      page: 33, cat: "medical", company: "Kanewell Industrial Co., Ltd.", city: { en: "Taiwan", ar: "تايوان" },
      about: { en: "Medical saddle stool manufacturer with saddle seat patents in the USA (US 11,503,915 B1) and Germany.", ar: "مصنّع كراسي سرجية طبية، ولديه براءات اختراع للمقعد في الولايات المتحدة (US 11,503,915 B1) وألمانيا." },
      email: "kanewell@ms43.hinet.net", web: "https://www.kanewellchairs.com", certs: "US & DE patents",
      hot: [
        { x: 22, y: 36, name: "903SNL-2F", d: { en: "Saddle stool, adjustable seat width", ar: "كرسي سرجي بعرض مقعد قابل للتعديل" } },
        { x: 80, y: 38, name: "900SAV-2F", d: { en: "Saddle stool with arm support", ar: "كرسي سرجي مع مسند ذراع" } },
        { x: 24, y: 66, name: "908SNL-2F-AB", d: { en: "Saddle stool, much wider seat", ar: "كرسي سرجي بمقعد أعرض" } },
        { x: 80, y: 68, name: "908SBL-3F-AB", d: { en: "Saddle stool with back rest", ar: "كرسي سرجي مع مسند ظهر" } }
      ]
    },
    {
      page: 36, cat: "machinery", company: "Kou Yi Iron Works Co., Ltd.", city: { en: "Taichung, Taiwan", ar: "تايتشونغ، تايوان" },
      about: { en: "Specialized manufacturer of shoe injection moulding machines: sandals, slippers, soles, sport shoes and rain boots.", ar: "مصنّع متخصص لآلات حقن الأحذية: الصنادل والشباشب والنعال والأحذية الرياضية وأحذية المطر." },
      tel: "+886-4-25331108", email: "kouyi@ms15.hinet.net", web: "http://www.kouyi.com.tw",
      address: "No. 5, Alley 50, Lane 305, Chungshan Rd., Sec. 3, Tanzi Dist., Taichung City 427, Taiwan",
      hot: [
        { x: 55, y: 27, name: "NSK-375-2C", d: { en: "Two-colour rain boot injection moulding machine", ar: "آلة حقن أحذية مطر بلونين" } },
        { x: 20, y: 48, name: "EVA & sandal machines", d: { en: "E.V.A. foam and sandal injection machines", ar: "آلات حقن إيفا والصنادل" } },
        { x: 80, y: 62, name: "Sport shoe machines", d: { en: "One/two/three-colour sport shoe injection", ar: "آلات حقن الأحذية الرياضية بعدة ألوان" } }
      ]
    },
    {
      page: 47, cat: "fitness", company: "Pin Link Industry Co., Ltd. (Yingliang)", city: { en: "Taiwan", ar: "تايوان" },
      about: { en: "The most patented fitness equipment: inversion chairs and under-desk mini bikes.", ar: "معدات لياقة بأكبر عدد من براءات الاختراع: كراسي الانعكاس ودراجات صغيرة أسفل المكتب." },
      tel: "+886-3-3672169", email: "rita.chen@zsyingliang.com", web: "https://www.zsyingliang.com",
      hot: [
        { x: 72, y: 30, name: "Inversion chair", d: { en: "Back-care inversion chair", ar: "كرسي انعكاس لراحة الظهر" } },
        { x: 50, y: 66, name: "Under-desk mini bike", d: { en: "Compact pedal exerciser", ar: "دراجة تمارين صغيرة أسفل المكتب" } }
      ]
    },
    {
      page: 51, cat: "tools", company: "Leadvane Industrial Co., Ltd. (TBL Turbo Land)", city: { en: "Taichung, Taiwan", ar: "تايتشونغ، تايوان" },
      about: { en: "Professional air tools and accessories manufacturer.", ar: "مصنّع محترف للعدد الهوائية وملحقاتها." },
      tel: "+886-4-22657358", email: "sales@leadvane.com", web: "https://www.leadvane.com",
      address: "No. 8, Lane 115, Gung-shiue 2nd Street, South Dist., Taichung City 402, Taiwan",
      hot: [
        { x: 40, y: 42, name: "TI-5810", d: { en: "Air impact wrench", ar: "مفك صدمات هوائي" } },
        { x: 78, y: 37, name: "OSC-60H", d: { en: "Random orbital sander", ar: "صنفرة مدارية" } },
        { x: 80, y: 52, name: "TG-7G", d: { en: "Air angle grinder", ar: "صاروخ جلخ هوائي" } },
        { x: 18, y: 64, name: "TS-2001G", d: { en: "Spray gun", ar: "مسدس رش" } },
        { x: 50, y: 72, name: "TD-4329C", d: { en: "Air drill", ar: "دريل هوائي" } }
      ]
    },
    {
      page: 63, cat: "auto", company: "Li Yuan Transmission Co., Ltd.", city: { en: "Nantou, Taiwan", ar: "نانتو، تايوان" },
      about: { en: "Transmissions and drive systems for e-scooters, cargo trikes and power wheelchairs. ISO 9001 (2015) certified.", ar: "ناقلات حركة وأنظمة دفع للسكوترات الكهربائية والدراجات ثلاثية العجلات والكراسي المتحركة الكهربائية. حاصلة على ISO 9001." },
      tel: "+886-49-2567892", email: "k2113786@sms13.hinet.net", web: "https://li-yuan.tw", certs: "ISO 9001:2015",
      hot: [
        { x: 27, y: 52, name: "E-scooter drive", d: { en: "Electric scooter", ar: "سكوتر كهربائي" } },
        { x: 50, y: 58, name: "Gear transmission", d: { en: "Motor gear transmission unit", ar: "وحدة ناقل حركة للمحرك" } },
        { x: 76, y: 56, name: "Electric cargo trike", d: { en: "Electric cargo tricycle", ar: "دراجة شحن كهربائية بثلاث عجلات" } },
        { x: 38, y: 72, name: "Power wheelchair drive", d: { en: "Wheelchair drive system", ar: "نظام دفع للكرسي المتحرك" } },
        { x: 66, y: 72, name: "Electric utility scooter", d: { en: "Three-wheel electric utility scooter", ar: "سكوتر خدمات كهربائي بثلاث عجلات" } }
      ]
    },
    {
      page: 67, cat: "hardware", company: "ABA UFO International Corp.", city: { en: "New Taipei, Taiwan", ar: "تايبيه الجديدة، تايوان" },
      about: { en: "Lock supplier backed by R&D: intelligent combination locks, T-handle locks, cam locks and padlocks.", ar: "مورّد أقفال مدعوم بالبحث والتطوير: أقفال رقمية ذكية وأقفال بمقبض T وأقفال كامة وأقفال معلّقة." },
      tel: "+886-2-2906-8181", email: "mkt@abalocks.com", web: "http://www.abalocks.com",
      address: "P.O. Box 13-222, Hsinchuang Dist., New Taipei City, Taiwan",
      hot: [
        { x: 55, y: 22, name: "Intelligent combination locks", d: { en: "With override key to retrieve forgotten codes", ar: "مع مفتاح تجاوز لاسترجاع الرمز المنسي" } },
        { x: 50, y: 57, name: "T-handle locks", d: { en: "Lock cylinder changeable", ar: "أسطوانة القفل قابلة للتغيير" } },
        { x: 35, y: 79, name: "Cam locks", d: { en: "New cam lock range", ar: "مجموعة أقفال كامة جديدة" } },
        { x: 73, y: 79, name: "Padlocks", d: { en: "Brass padlocks", ar: "أقفال معلّقة نحاسية" } }
      ]
    },
    {
      page: 80, cat: "tools", company: "U-Port Industrial Co., Ltd. (SGEAR)", city: { en: "Taichung, Taiwan", ar: "تايتشونغ، تايوان" },
      about: { en: "Special tools and auto service tools: fuel syringes, brake bleeders, under-car and cooling system tools.", ar: "عدد خاصة وأدوات خدمة السيارات: محاقن الوقود، ومفرّغات سائل الفرامل، وعدد أسفل السيارة ونظام التبريد." },
      tel: "+886-4-24250366", email: "service@u-port.com.tw", web: "http://www.u-port.com.tw",
      address: "No. 30, Lane 808, Zhongqing Rd., Sec. 2, Beitun Dist., Taichung City 40676, Taiwan",
      hot: [
        { x: 50, y: 20, name: "Fuel supply / extraction syringes", d: { en: "212-1581, 218-200, 218-550, 218-1500", ar: "محاقن تعبئة وسحب الوقود" } },
        { x: 50, y: 41, name: "Vacuum brake fluid bleeder", d: { en: "664201B, 218-507, GS2119K", ar: "مفرّغ سائل الفرامل بالتفريغ" } },
        { x: 50, y: 59, name: "Under car tools", d: { en: "208-0041, 312-8000, 208-0045", ar: "عدد أسفل السيارة" } },
        { x: 50, y: 78, name: "Cooling system service", d: { en: "212-1012, 212-1015, 212-1019E", ar: "أدوات صيانة نظام التبريد" } }
      ]
    },
    {
      page: 81, cat: "hardware", company: "Y.H Caster Co., Ltd.", city: { en: "Changhua, Taiwan", ar: "تشانغهوا، تايوان" },
      about: { en: "Stable quality casters from 25 mm to 250 mm (1\"–8\"). ISO 9001 and ISO 14001 certified by TÜV, Panasonic-audited manufacturer.", ar: "عجلات بجودة ثابتة من 25 إلى 250 مم. حاصلة على ISO 9001 وISO 14001 من TÜV، ومصنّع معتمد من Panasonic." },
      tel: "+886-4-7637070", email: "yhcaster@hotmail.com", web: "https://www.yhcaster.com",
      address: "No. 42, Ln. 251, Kouzhuang St., Huatan Township, Changhua County 50353, Taiwan", certs: "ISO 9001 · ISO 14001 · TÜV",
      hot: [
        { x: 32, y: 55, name: "Swivel caster with brake", d: { en: "Industrial swivel caster, total lock", ar: "عجلة دوّارة صناعية مع فرامل" } },
        { x: 78, y: 46, name: "Plate caster", d: { en: "Top-plate caster, 25–250 mm", ar: "عجلة بقاعدة تثبيت، 25–250 مم" } }
      ]
    },
    {
      page: 84, cat: "fitness", company: "Pro-Supra International Corp.", city: { en: "Taipei, Taiwan", ar: "تايبيه، تايوان" },
      about: { en: "Your global partner for exercise equipment (Aeromax Fitness).", ar: "شريكك العالمي لمعدات التمارين (Aeromax Fitness)." },
      tel: "+886-2-27198935", email: "jacklee@pro-supra.com.tw", web: "https://www.pro-supra.com",
      address: "7F-2, No. 75, Sec. 4, Nanking E. Rd., Taipei 105, Taiwan",
      hot: [
        { x: 30, y: 22, name: "SPR-XNK45222", d: { en: "Commercial air bike", ar: "دراجة هوائية تجارية" } },
        { x: 70, y: 24, name: "SPR-XNZ12000", d: { en: "Air bike", ar: "دراجة هوائية" } },
        { x: 25, y: 47, name: "SPR-XNK1160", d: { en: "Commercial magnetic orbit elliptical", ar: "جهاز بيضاوي مغناطيسي تجاري" } },
        { x: 68, y: 50, name: "SPR-XNK1040", d: { en: "Spin bike", ar: "دراجة سبين" } },
        { x: 25, y: 73, name: "SPR-XNO36T", d: { en: "Motorised treadmill", ar: "جهاز مشي كهربائي" } },
        { x: 68, y: 73, name: "SPR-XNC1252B", d: { en: "Magnetic bike", ar: "دراجة مغناطيسية" } }
      ]
    },
    {
      page: 85, cat: "auto", company: "Ming Yang Model Co., Ltd. (CY Racing)", city: { en: "Taichung, Taiwan", ar: "تايتشونغ، تايوان" },
      about: { en: "Radio-control cars and parts: professional design and manufacturer.", ar: "سيارات التحكم عن بُعد وقطعها: تصميم وتصنيع احترافي." },
      tel: "+886-4-25348026", email: "cymodel@ms27.hinet.net", web: "https://cymodel.en.taiwantrade.com/",
      address: "No. 26, Nan Men St., Tanzi Dist., Taichung City 42758, Taiwan",
      hot: [
        { x: 55, y: 24, name: "Caracal electric buggy", d: { en: "1/8 scale 4WD off-road buggy, ESC 4S 150A", ar: "باجي كهربائي 4WD بمقياس 1/8" } },
        { x: 55, y: 49, name: "Caracal nitro buggy", d: { en: "4.6 cc / 28 size engine", ar: "باجي نيترو بمحرك 4.6 سم³" } },
        { x: 28, y: 80, name: "E-starter", d: { en: "Electric starter for nitro engines", ar: "مشغّل كهربائي لمحركات النيترو" } },
        { x: 60, y: 76, name: "Iron", d: { en: "Covering film iron", ar: "مكواة أفلام التغليف" } }
      ]
    },
    {
      page: 99, cat: "machinery", company: "Taiwan Winch Industrial Co., Ltd.", city: { en: "Taichung, Taiwan", ar: "تايتشونغ، تايوان" },
      about: { en: "Electric hoists and winches for construction, household, store and factory use. Lifting capacity 170–2000 kg.", ar: "روافع ورافعات كهربائية للبناء والمنازل والمتاجر والمصانع. قدرة رفع 170–2000 كغ." },
      tel: "+886-4-25571784", email: "hoist@ms2.hinet.net", web: "http://www.winch.com.tw",
      address: "No. 17-2, Fangliao Rd., Houli Dist., Taichung City 421, Taiwan", certs: "CE",
      hot: [
        { x: 82, y: 22, name: "Electric hoist", d: { en: "Mini electric hoist", ar: "رافعة كهربائية صغيرة" } },
        { x: 38, y: 74, name: "Electric wire rope winch", d: { en: "Wire rope winches", ar: "ونش كهربائي بحبل فولاذي" } },
        { x: 80, y: 72, name: "Electric chain hoist", d: { en: "Chain hoist, up to 2000 kg", ar: "رافعة بالسلسلة حتى 2000 كغ" } }
      ]
    },
    {
      page: 2, cat: "food", company: "Shammout & Kiddeh Food Company (SH&KD)", city: { en: "Syria", ar: "سوريا" },
      about: { en: "Winner Original 3-in-1 coffee: coffee, creamer and sugar. Start your day and go.", ar: "قهوة Winner الأصلية 3 في 1: قهوة وكريمة وسكر. ابدأ يومك وانطلق." },
      tel: "+963-11-8219004", email: "info@sh-kd.co", web: "https://www.sh-kd.co",
      hot: [
        { x: 45, y: 45, name: "Winner 3-in-1", d: { en: "Coffee & creamer & sugar sticks", ar: "أعواد قهوة وكريمة وسكر" } }
      ]
    }
  ],

  /* Industrial directory list (pages 12–14): readers choose, AAT sends the lists */
  directory: [
    { en: "Fluid power machineries", ar: "مكائن الطاقة المائية" },
    { en: "Packaging & food machineries", ar: "آلات التعبئة والتغليف والأغذية" },
    { en: "Fluid power systems", ar: "أنظمة الطاقة الهيدروليكية" },
    { en: "Asian packaging and wrapping", ar: "مصانع التعبئة والتغليف الآسيوية" },
    { en: "Taiwan plastics and rubber industries", ar: "صناعات البلاستيك والمطاط في تايوان" },
    { en: "Taiwan locks & hardware factories", ar: "مصانع الأقفال والأدوات المعدنية في تايوان" },
    { en: "Medical & health equipment factories", ar: "مصانع المعدات الطبية والصحية" },
    { en: "Factories of medical & health supplies", ar: "مصانع المستلزمات الطبية" },
    { en: "Display and optics technologies", ar: "مصانع تقنيات الشاشات والبصريات" },
    { en: "Smart manufacturing of machine tools", ar: "مصانع التصنيع الذكي لأدوات المكائن" },
    { en: "Bio & powder and liquid materials", ar: "المواد الحيوية والمواد المسحوقة والسائلة" },
    { en: "Hardware, remote control, electric power tools", ar: "الأجهزة وأدوات التحكم عن بعد ومعدات الطاقة الكهربائية" },
    { en: "Sportswear, rackets, golf, fitness, balls", ar: "ملابس رياضية ومضارب وجولف ولياقة وكرات" },
    { en: "Halal food & products", ar: "الأطعمة والمنتجات الحلال" },
    { en: "Automation factories in Taiwan", ar: "مصانع الأتمتة في تايوان" },
    { en: "Advanced energy components", ar: "مكوّنات الطاقة المتقدمة" },
    { en: "Dental tools emergency total solution", ar: "حلول طوارئ شاملة لأدوات طب الأسنان" },
    { en: "Screen printing, drying and automated lines", ar: "معدات الطباعة بالشاشة والتجفيف وخطوط الإنتاج الآلية" },
    { en: "Fasteners, furniture and machine screws", ar: "المثبتات ومسامير الأثاث والآلات" },
    { en: "Automation machinery equipment and peripherals", ar: "معدات آلات التشغيل الآلي وملحقاتها" },
    { en: "Turnkey projects", ar: "مشاريع تسليم المفتاح" },
    { en: "Muslim travellers directory to Indonesia", ar: "دليل المسافرين المسلمين إلى إندونيسيا" },
    { en: "Malaysian solar and related products", ar: "مصانع ماليزية للطاقة الشمسية والمنتجات ذات الصلة" },
    { en: "Electric vehicle & automobile electronics", ar: "المركبات الكهربائية وإلكترونيات السيارات" },
    { en: "Malaysian halal products", ar: "منتجات الحلال الماليزية" },
    { en: "Taiwan cycle technology industries", ar: "صناعات تكنولوجيا الدراجات في تايوان" }
  ]
};
