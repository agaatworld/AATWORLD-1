"""Turn ee_scrape.json (from scrape_ee.py) into the exhibitions list of the website.

Writes ee2027.json and replaces ONLY the `var X = [...]` of the block that starts with
"/* international exhibitions January to December 2027" in assets/js/data/extra2.js.
Row: [name, start, end, country, city, venue, sector, sector in Arabic, month only, EventsEye page]
Run from this folder:  python3 build_scrape.py
"""
import calendar, collections, datetime, json, re

# the keyword -> Arabic sector table used before (copied from build.py, which must not be imported: it rebuilds the old list)
AR=[('hotel|hospitality|tourism|travel|caravan|leisure|amusement|entertainment|attraction|event show|mice|pool|spa\\b|shisha|film|comic|cosplay|music|photograph|marathon|festival|wedding','سياحة وفنادق وترفيه'),
('food|bever|bakery|coffee|tea|halal|horeca|snack|confection|meat|seafood|dairy|chocolate|ingredient|wine|organic|natural product|date|dates|nut','أغذية ومشروبات'),
('plastic|rubber|packag|print|label|carton|paper|tissue|polyurethane','بلاستيك وتغليف وطباعة'),('textile|garment|fashion|apparel|denim|leather|footwear|sewing|underwear|hosiery|swimwear|yarn|fabric','نسيج وملابس'),
('machine|machinery|tool|metal|steel|weld|cnc|fastener|hardware|mould|die|material handling|handling|storage|powder|bulk|mining|drone','آلات وأدوات ومعادن'),('automation|robot|manufactur|industr|engineering|subcon','صناعة وأتمتة'),
('electr|semicon|pcb|led|lighting|display|touch|cable|wire','إلكترونيات وإضاءة'),('energy|power|solar|oil|gas|petro|battery|wind|renewable|hydrogen','طاقة ونفط وغاز'),
('construct|build|concrete|stone|façade|facade|ceramic|floor|window|door|interior|furniture|architect|home|kitchen|decor|real estate|property|elevator|escalator|lift|road|bridge|tunnel|workspace|glass','بناء وأثاث وديكور'),
('auto|vehicle|motor|truck|tyre|bike|bicycle|cycl|transport|logistic|marine|ship|port|rail|aviation|aero|airport|mobility','نقل وسيارات ولوجستيات'),
('medical|health|pharma|dental|lab|beauty|cosmetic|optic|wellness|biotech|aesthetic|medicine|otorhinolaryngology|audiology|hospital|surg','صحة وتجميل وأدوية'),('agri|farm|livestock|palm|fertil|horti|aquacult|fisher|greenhouse|rice|sugar|mill|animal|feed|poultry|veterin','زراعة'),
('chemic|coating|paint|dye|pigment|lubric','كيماويات وطلاءات'),('water|waste|recycl|environment|hvac|refrigera|cold|carbon|climate|sustainab','مياه وبيئة وتبريد'),
('security|safety|fire|defen|police','أمن وسلامة'),('it|digital|data|cyber|ai|tech|internet|telecom|cloud|fintech|bank|payment|infocomm|invention|innovation|software|smart','تقنية واتصالات'),
('jewel|gold|gift|toy|baby|pet|book|art|sport|outdoor|diving|franchise|housewares|homelife|stationery|office|consumer|retail|game','سلع استهلاكية وخدمات'),
('multi-sector|multisector|investment|trade expo|trade fair|sourcing|international fair|foire|export|import|business','معارض عامة ومتعددة القطاعات')]
def ar(sec):
    s=sec.lower()
    for k,v in AR:
        if re.search(r'\b('+k+')',s): return v
    return 'معارض عامة ومتعددة القطاعات'

EN = {"أغذية ومشروبات": "Food and beverage", "بلاستيك وتغليف وطباعة": "Plastics, packaging and printing", "نسيج وملابس": "Textiles and clothing",
      "آلات وأدوات ومعادن": "Machinery, tools and metal", "صناعة وأتمتة": "Industry and automation", "إلكترونيات وإضاءة": "Electronics and lighting",
      "طاقة ونفط وغاز": "Energy, oil and gas", "بناء وأثاث وديكور": "Building, furniture and interiors", "نقل وسيارات ولوجستيات": "Transport, vehicles and logistics",
      "صحة وتجميل وأدوية": "Health, beauty and pharma", "زراعة": "Agriculture", "كيماويات وطلاءات": "Chemicals and coatings",
      "مياه وبيئة وتبريد": "Water, environment and cooling", "أمن وسلامة": "Security and safety", "تقنية واتصالات": "Technology and telecom",
      "سلع استهلاكية وخدمات": "Consumer goods and services", "معارض عامة ومتعددة القطاعات": "General and multi-sector", "سياحة وفنادق وترفيه": "Tourism, hotels and leisure"}


def key(n):
    return re.sub(r"[^a-z0-9]", "", n.lower())[:28]


def nice(n):
    n = re.sub(r"\s+", " ", n).strip()
    return n.title() if n.isupper() else n


old = {}
try:  # sector labels written by hand for the earlier list
    for r in json.load(open("ee2027.json")):
        old[(key(r[0]), r[3])] = (r[6], r[7])
except FileNotFoundError:
    pass

rows, seen = [], set()
for r in json.load(open("ee_scrape.json")):
    k = (r["url"] or key(r["name"]), r["country"], r["start"])  # one row per edition: a yearly show is listed for 2027 and 2028
    if k in seen:
        continue
    seen.add(k)
    y, m, d = map(int, r["start"].split("-"))
    if r["approx"]:
        end = "%d-%02d-%02d" % (y, m, calendar.monthrange(y, m)[1])
    else:
        end = (datetime.date(y, m, d) + datetime.timedelta(days=max(r["days"], 1) - 1)).isoformat()
    sec_ar = ar(r["name"])  # the name first (descriptions are prose: words like "it" or "led" mislead)
    if sec_ar == "معارض عامة ومتعددة القطاعات":
        sec_ar = ar(r["desc"])
    o = old.get((key(r["name"]), r["country"]))
    sec_en, sec_ar = (o[0], o[1]) if o and o[1] in EN and o[1] != "معارض عامة ومتعددة القطاعات" and o[1] != "معرض تجاري" else (EN[sec_ar], sec_ar)
    venue = "" if r["venue"] in ("?", "") else r["venue"]
    city = "" if r["city"] in ("?", "") else r["city"]
    rows.append([nice(r["name"]), r["start"], end, r["country"], city, venue, sec_en, sec_ar, r["approx"], r["url"]])

rows.sort(key=lambda r: (r[1], r[0]))
cnt = collections.Counter(r[3] for r in rows)
print(len(rows), "shows;", dict(sorted(cnt.items(), key=lambda x: -x[1])))
print("by year:", dict(collections.Counter(r[1][:4] for r in rows)))
json.dump(rows, open("ee2027.json", "w"), ensure_ascii=False)

p = "../../assets/js/data/extra2.js"
s = open(p, encoding="utf-8").read()
i = s.index("/* international exhibitions January to December 2027")
j = s.index("var X = ", i)
k = s.index("];\n", j)
s = s[:j] + "var X = " + json.dumps(rows, ensure_ascii=False) + s[k + 1:]
open(p, "w", encoding="utf-8").write(s)
print("extra2.js updated")
