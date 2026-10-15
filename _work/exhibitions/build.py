import re,glob,json,calendar,collections
MON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
AR=[('food|bever|bakery|coffee|tea|halal|horeca|hospitality|snack|confection|meat|seafood|dairy|chocolate|ingredient|wine','أغذية ومشروبات'),
('plastic|rubber|packag|print|label|carton|paper|tissue','بلاستيك وتغليف وطباعة'),('textile|garment|fashion|apparel|denim|leather|footwear|sewing','نسيج وملابس'),
('machine|machinery|tool|metal|steel|weld|cnc|fastener|hardware|mould|die','آلات وأدوات ومعادن'),('automation|robot|manufactur|industr|engineering|subcon','صناعة وأتمتة'),
('electr|semicon|pcb|led|lighting|display|touch','إلكترونيات وإضاءة'),('energy|power|solar|oil|gas|petro|battery|wind|renewable','طاقة ونفط وغاز'),
('construct|build|concrete|stone|façade|facade|ceramic|floor|window|door|interior|furniture|architect|home|kitchen|decor|real estate|property','بناء وأثاث وديكور'),
('auto|vehicle|motor|truck|tyre|bike|bicycle|cycl|transport|logistic|marine|ship|port|rail|aviation|aero|airport|mobility','نقل وسيارات ولوجستيات'),
('medical|health|pharma|dental|lab|beauty|cosmetic|optic|wellness','صحة وتجميل وأدوية'),('agri|farm|livestock|palm|fertil|horti|aquacult|fisher|greenhouse|rice|sugar|mill','زراعة'),
('chemic|coating|paint|dye|pigment|lubric','كيماويات وطلاءات'),('water|waste|recycl|environment|hvac|refrigera|cold','مياه وبيئة وتبريد'),
('security|safety|fire|defen|police','أمن وسلامة'),('it|digital|data|cyber|ai|tech|internet|telecom|cloud|fintech|bank|payment','تقنية واتصالات'),
('jewel|gold|gift|toy|baby|pet|book|art|sport|outdoor|travel|diving|education|mba|franchise','سلع استهلاكية وخدمات')]
def ar(sec):
    s=sec.lower()
    for k,v in AR:
        if re.search(r'\b('+k+')',s): return v
    return 'معرض تجاري'
rows=[];cur=None
for f in sorted(glob.glob('*.txt')):
    for l in open(f):
        l=l.strip()
        if not l: continue
        if l.startswith('#'): cur=l[1:].strip(); continue
        c=cur if f in ('small.txt','gaps.txt') else f[:2]
        p=[x.strip() for x in l.split('|')]
        if len(p)>=6: name,d,days,city,venue,sec=p[:6]
        else:
            name,d,city,venue,sec=(p+['']*5)[:5]; m=re.search(r'\((\d+) day',d) or re.search(r' (\d+) day',d); days=m.group(1) if m else '?'
        m=re.match(r'(\d\d)/(\d\d)/2027',d)
        if m:
            mo,da=int(m.group(1)),int(m.group(2)); n=int(days) if str(days).isdigit() else 1
            start='2027-%02d-%02d'%(mo,da); import datetime
            e=datetime.date(2027,mo,da)+datetime.timedelta(days=max(n,1)-1); end=e.isoformat(); approx=0
        else:
            mm=re.match(r'([A-Za-z]{3})',d)
            if not mm or '2027' not in d: continue
            mo=MON.index(mm.group(1).lower())+1; start='2027-%02d-01'%mo; end='2027-%02d-%02d'%(mo,calendar.monthrange(2027,mo)[1]); approx=1
        bad=lambda x: x in ('?','Not listed','Not specified','Venue unlisted (?)','(venue not listed)')
        city='' if bad(city) else city; venue='' if bad(venue) else venue
        if 'ACCESS MBA' in name or 'ACCESS MASTERS' in name: continue
        rows.append([name.title() if name.isupper() else name,start,end,c,city,venue,sec[:1].upper()+sec[1:],ar(sec),approx])
seen=set();out=[]
for r in sorted(rows,key=lambda r:(r[1],r[0])):
    k=(re.sub(r'[^a-z0-9]','',r[0].lower())[:28],r[3],r[1][:7])
    if k in seen: continue
    seen.add(k); out.append(r)
# prefer exact-dated duplicates over month-only ones
ex={(re.sub(r'[^a-z0-9]','',r[0].lower())[:28],r[3]) for r in out if not r[8]}
out=[r for r in out if not (r[8] and (re.sub(r'[^a-z0-9]','',r[0].lower())[:28],r[3]) in ex)]
cnt=collections.Counter(r[3] for r in out); print(len(out),dict(cnt))
fix={'Taipei Ampa':'Taipei AMPA'}
json.dump(out,open('ee2027.json','w'),ensure_ascii=False)
