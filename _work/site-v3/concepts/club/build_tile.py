# Builds tile-ar.html and tile-en.html for the "Business Club" concept from the real content package.
# Run: python3 -I build_tile.py   (writes next to this file)
import json, html, os

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, '..', '..', 'data', 'data.json'), encoding='utf-8'))
IMG = '../../'          # concepts/club/ -> site-v3/ (data paths start with img/)
E = html.escape

AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

T = {
 'ar': dict(
  lang='ar', dir='rtl', other='English', other_code='en', langs='اللغات',
  ribbon_name='<bdi>التجارة العربية الآسيوية</bdi> · <bdi>Arab Asian Trade</bdi> · <bdi>中阿商業雜誌</bdi>', ribbon_issue='العدد 560 · أكتوبر 2026',
  nav=['الرئيسية', 'المجلة', 'منتجات وصناعات حديثة', 'معارض دولية', 'نادي رجال الأعمال', 'تواصل معنا'],
  menu='القائمة',
  h1=D['config']['groupName']['ar'], sub=D['about']['first']['ar'], lead=D['about']['heroLead']['ar'],
  b_join='انضم إلى نادي رجال الأعمال', b_read='اقرأ العدد 560',
  figs=[('45', 'عاماً في النشر التجاري'), ('560', 'عدداً من المجلة'), ('2,831', 'عضواً في نادي رجال الأعمال'), ('1,464', 'معرضاً دولياً في 2027')],
  seal_caption='ختم نادي رجال الأعمال · تايبيه · منذ 1982',
  s_shelf='واجهة العرض — منتجات معلني العدد 560',
  s_issue='العدد 560 · أكتوبر 2026', issue_cover=D['about']['cover']['ar'], toc_title='مقالات العدد', page_word='ص',
  b_issue='اقرأ العدد كاملاً', b_pdf='نسخة PDF', ads_line='45 صفحة إعلانية من 36 معلناً · 100 صفحة',
  s_adv='المعلنون في هذا العدد', page_stamp='صفحة',
  s_shows='معارض دولية — يناير 2027', th=['التاريخ', 'المعرض', 'المدينة والدولة', 'المجال'], b_shows='كل المعارض الدولية · 1,464 معرضاً',
  s_club='نادي رجال الأعمال', club_lead=D['club']['lead']['ar'], ben_title=D['club']['benefitsTitle']['ar'],
  members_line='2,831 عضواً من التجار ورجال الأعمال والمصنّعين', b_club=D['club']['join']['title']['ar'], b_ben=D['club']['join']['more']['ar'],
  f_explore='تصفّح', f_services='الخدمات', services=['الإعلان في المجلة', 'نادي رجال الأعمال', 'مشاريع تسليم المفتاح', 'توزيع البروشورات في المعارض'],
  f_contact='تواصل معنا', f_phone='الهاتف · واتساب', f_email='البريد الإلكتروني', f_address='العنوان',
  rights='© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة', privacy='الخصوصية',
  chat='محادثة 24 ساعة', chat2='اضغط هنا',
  title='AAT — نادي رجال الأعمال (style tile)',
 ),
 'en': dict(
  lang='en', dir='ltr', other='العربية', other_code='ar', langs='Languages',
  ribbon_name='<bdi>Arab Asian Trade</bdi> · <bdi>التجارة العربية الآسيوية</bdi> · <bdi>中阿商業雜誌</bdi>', ribbon_issue='Issue No. 560 · October 2026',
  nav=['Home', 'Magazine', 'Products & modern industries', 'International exhibitions', 'Business Club', 'Contact'],
  menu='Menu',
  h1=D['config']['groupName']['en'], sub=D['about']['first']['en'], lead=D['about']['heroLead']['en'],
  b_join='Join the AAT Business Club', b_read='Read issue 560',
  figs=[('45', 'years of trade publishing'), ('560', 'magazine issues'), ('2,831', 'AAT Business Club members'), ('1,464', 'international exhibitions in 2027')],
  seal_caption='Seal of the AAT Business Club · Taipei · since 1982',
  s_shelf='The showcase — products of the issue 560 advertisers',
  s_issue='Issue No. 560 · October 2026', issue_cover=D['about']['cover']['en'], toc_title='Articles in this issue', page_word='p.',
  b_issue='Read the whole issue', b_pdf='PDF copy', ads_line='45 advertisement pages from 36 advertisers · 100 pages',
  s_adv='Advertisers in this issue', page_stamp='page',
  s_shows='International exhibitions — January 2027', th=['Date', 'Exhibition', 'City and country', 'Field'], b_shows='All international exhibitions · 1,464 shows',
  s_club='AAT Business Club', club_lead=D['club']['lead']['en'], ben_title=D['club']['benefitsTitle']['en'],
  members_line='2,831 members: traders, businessmen and manufacturers', b_club=D['club']['join']['title']['en'], b_ben=D['club']['join']['more']['en'],
  f_explore='Explore', f_services='Services', services=['Advertising in the magazine', 'AAT Business Club', 'Turnkey projects', 'Brochure distribution at exhibitions'],
  f_contact='Contact', f_phone='Phone · WhatsApp', f_email='Email', f_address='Address',
  rights='© 2026 Arab Asian Trade Group · All rights reserved', privacy='Privacy',
  chat='24-hour chat', chat2='Click here',
  title='AAT — The Business Club (style tile)',
 ),
}

CSS = r"""
:root{
  --ink:#141821; --ink2:#242B38; --red:#D21F26; --red-deep:#A4161C; --brass:#8A6B2D; --brass-l:#D4B46A;
  --paper:#FFFFFF; --panel:#EDEFF2; --line:#C9CDD6; --muted:#4A5160; --link:#0B4F9C;
  --display:'Newsreader','Amiri',Georgia,serif; --body:'Source Serif 4','Noto Naskh Arabic',Georgia,serif;
  --wrap:1320px; --gut:24px;
}
html[lang=ar]{ --display:'Newsreader','Amiri',Georgia,serif; --body:'Source Serif 4','Noto Naskh Arabic',Georgia,serif; }
*{box-sizing:border-box} html,body{margin:0}
body{background:var(--paper);color:var(--ink);font-family:var(--body);font-size:20px;line-height:1.85;font-variant-numeric:lining-nums tabular-nums;-webkit-font-smoothing:antialiased}
html[lang=en] body{font-size:19px;line-height:1.7}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
bdi,.ltr{unicode-bidi:isolate} .ltr{direction:ltr;display:inline-block}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 var(--gut)}
h1,h2,h3{font-family:var(--display);font-weight:700;margin:0;line-height:1.3}
html[lang=ar] h1,html[lang=ar] h2,html[lang=ar] h3{line-height:1.45}
h1{font-size:52px} h2{font-size:40px} h3{font-size:26px}
.sm{font-size:17px} .md{font-size:18px}
/* 1. red ribbon = the trilingual band of the printed cover */
.ribbon{background:var(--red);color:#fff;font-weight:700;font-size:17px;line-height:1.5}
.ribbon .wrap{display:flex;justify-content:space-between;gap:16px;padding-top:9px;padding-bottom:9px;flex-wrap:wrap}
/* 2. masthead */
.mast{background:var(--paper);border-bottom:1px solid var(--line)}
.mast .row1{display:flex;align-items:center;justify-content:space-between;gap:24px;height:100px}
.mast .logo img{height:64px;width:auto}
.navbar{border-top:1px solid var(--line)}
.nav{display:flex;gap:36px;flex-wrap:wrap}
.nav a{font-weight:700;font-size:21px;line-height:1.3;padding:13px 2px 11px;border-bottom:4px solid transparent;white-space:nowrap}
.nav a.on{border-bottom-color:var(--red)}
.langs{display:flex;gap:12px;align-items:center}
.lbtn{border:2px solid var(--ink);padding:8px 16px;font-weight:700;font-size:18px;line-height:1.3;display:inline-flex;align-items:center;gap:8px}
.lbtn.globe{border-color:var(--line)}
.menubtn{display:none}
/* 3. opening = the invitation */
.open{background:var(--ink);color:#fff;border-top:6px solid var(--brass-l)}
.open .wrap{display:grid;grid-template-columns:7fr 5fr;gap:48px;align-items:center;padding-top:64px;padding-bottom:64px}
.open h1{color:#fff}
.open .sub{font-family:var(--display);font-size:28px;font-weight:700;color:var(--brass-l);margin:12px 0 18px;line-height:1.45}
.open .lead{font-size:22px;max-width:40ch;margin:0 0 30px}
html[lang=ar] .open .lead{font-size:23px}
.btns{display:flex;gap:16px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-weight:700;font-size:20px;line-height:1.2;padding:16px 30px;border:2px solid var(--red);background:var(--red);color:#fff;min-height:58px;white-space:nowrap}
.btn:hover{background:var(--red-deep);border-color:var(--red-deep)}
.btn.line{background:transparent;color:var(--ink);border-color:var(--ink)}
.open .btn.line,.club .btn.line{color:#fff;border-color:#fff}
.figs{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:46px;border-top:1px solid var(--brass-l)}
.figs div{padding:18px 18px 8px 0;border-inline-end:1px solid rgba(212,180,106,.45)}
html[dir=rtl] .figs div{padding:18px 0 8px 18px}
.figs div:last-child{border:0}
.figs b{display:block;font-family:var(--display);font-size:56px;line-height:1.05;color:var(--brass-l);font-weight:600}
.figs span{display:block;font-size:18px;margin-top:6px;color:#fff}
.sealbox{text-align:center}
.seal{width:260px;height:260px;margin:0 auto}
.sealbox p{margin:14px 0 0;font-size:18px;color:var(--brass-l)}
/* sections */
.sec{padding:64px 0}
.sec.panel{background:var(--panel)}
.sec.white{background:var(--paper)}
.sec+.sec{border-top:1px solid var(--line)}
.stitle{margin:0 0 30px}
.stitle h2{display:inline-block;padding-bottom:12px;border-bottom:4px solid var(--red)}
/* 4. shelf (moving) */
.shelf{padding:40px 0 48px;overflow:hidden;background:var(--paper);border-top:1px solid var(--line)}
.shelf .stitle{margin-bottom:22px}
.track{display:flex;gap:22px;width:max-content;animation:roll 70s linear infinite}
html[dir=rtl] .track{animation-name:roll-rtl}
.shelf:hover .track{animation-play-state:paused}
@keyframes roll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes roll-rtl{from{transform:translateX(0)}to{transform:translateX(50%)}}
.pcard{width:262px;background:var(--paper);border:1px solid var(--line);flex:none}
.pcard .pic{height:186px;display:flex;align-items:center;justify-content:center;padding:12px;border-bottom:1px solid var(--line)}
.pcard .pic img{max-height:100%;width:auto;max-width:100%;object-fit:contain}
.pcard .meta{padding:12px 16px 16px}
.pcard .co{display:flex;align-items:center;gap:10px;min-height:34px}
.pcard .co img{height:30px;width:auto;max-width:96px;object-fit:contain}
.pcard .co span{font-size:16px;color:var(--muted);line-height:1.3;font-weight:600}
.pcard .pn{font-weight:700;font-size:18px;line-height:1.35;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
html[dir=rtl] .pcard .pn{text-align:right}
/* 5. the issue */
.issue .grid{display:grid;grid-template-columns:360px 1fr;gap:48px;align-items:start}
.cover{border:1px solid var(--line);background:#fff;padding:10px}
.cover img{width:100%;height:auto}
.toc{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.toc li{display:flex;gap:18px;padding:11px 0;border-bottom:1px solid var(--line);align-items:baseline;font-size:19px;line-height:1.5}
.toc .pg{flex:none;width:74px;font-family:var(--display);font-weight:600;color:var(--brass);font-size:21px}
.issue h3{margin:0 0 10px}
.issue .about{font-size:20px;margin:0 0 18px}
.issue .btns{margin-top:26px}
/* 6. advertisers (logo cards) */
.lgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:18px}
.lcard{background:var(--paper);border:1px solid var(--line);position:relative}
.lcard .box{height:132px;display:flex;align-items:center;justify-content:center;padding:18px;border-bottom:1px solid var(--line)}
.lcard .box img{max-height:84px;max-width:150px;width:auto;object-fit:contain}
.lcard .box .nm{font-family:var(--display);font-weight:700;font-size:24px;line-height:1.3;text-align:center}
.lcard .meta{padding:12px 14px 14px}
.lcard .meta b{display:block;font-size:17px;line-height:1.35;min-height:46px}
.lcard .meta span{display:block;font-size:16px;color:var(--muted);margin-top:4px}
.stamp{position:absolute;top:8px;inset-inline-end:8px;border:2px solid var(--red);color:var(--red);font-size:16px;font-weight:700;line-height:1;padding:4px 7px;letter-spacing:.02em;background:#fff}
/* 7. show ledger */
.ledger{width:100%;border-collapse:collapse;background:var(--paper);border:1px solid var(--line)}
.ledger th{font-size:17px;text-align:start;color:var(--muted);padding:12px 16px;border-bottom:2px solid var(--ink);font-weight:700;background:var(--paper)}
.ledger td{padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:top;font-size:19px;line-height:1.5}
.ledger td.d{white-space:nowrap;font-family:var(--display);font-weight:600;font-size:22px;color:var(--brass);width:220px}
.ledger td.n{font-weight:700}
.ledger .flag{display:inline-flex;align-items:center;gap:10px}
.ledger .flag img{width:30px;height:20px;object-fit:cover;border:1px solid var(--line)}
.shows .btns{margin-top:28px}
/* 8. club band */
.club{background:var(--ink);color:#fff;padding:64px 0;border-top:6px solid var(--brass-l)}
.club .wrap{display:grid;grid-template-columns:300px 1fr;gap:48px;align-items:start}
.club h2{color:#fff;border-bottom-color:var(--red)}
.club .lead{font-size:22px;margin:0 0 20px;max-width:60ch}
.club ol{margin:0 0 26px;padding:0;list-style:none;counter-reset:b;border-top:1px solid rgba(212,180,106,.5)}
.club li{counter-increment:b;display:flex;gap:18px;padding:12px 0;border-bottom:1px solid rgba(212,180,106,.5);font-size:19px;line-height:1.6}
.club li::before{content:counter(b);font-family:var(--display);font-weight:600;color:var(--brass-l);font-size:28px;line-height:1;min-width:34px}
.club .mem{font-size:18px;color:var(--brass-l);margin:0 0 22px}
.club .seal{width:240px;height:240px}
/* 9. footer */
footer{background:var(--ink2);color:#fff;padding:56px 0 28px;border-top:1px solid var(--brass-l)}
footer .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.3fr;gap:40px}
footer .flogo img{height:56px;width:auto}
footer .tri{font-size:18px;margin:16px 0 0;line-height:1.7}
footer h3{font-size:20px;color:var(--brass-l);margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid rgba(212,180,106,.5)}
footer ul{list-style:none;margin:0;padding:0}
footer li{font-size:18px;line-height:1.6;padding:4px 0}
footer .addr{font-size:18px;line-height:1.6}
footer .bottom{margin-top:40px;padding-top:18px;border-top:1px solid rgba(255,255,255,.2);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:17px}
/* assistant tab */
.chat{position:fixed;bottom:0;left:24px;background:var(--red);color:#fff;font-weight:700;font-size:18px;line-height:1.25;padding:12px 20px;border:2px solid #fff;border-bottom:0;z-index:5}
.chat small{display:block;font-size:16px;font-weight:400}
/* phone */
@media (max-width:1100px){
  .lgrid{grid-template-columns:repeat(4,1fr)}
  .nav{gap:24px}
  .nav a{font-size:20px}
}
@media (max-width:700px){
  :root{--gut:16px}
  body{font-size:19px}
  h1{font-size:36px} h2{font-size:30px} h3{font-size:22px}
  .ribbon{font-size:16px} .ribbon .wrap{justify-content:center;text-align:center}
  .ribbon .rn{display:none}
  .mast .row1{height:auto;gap:10px;padding:10px var(--gut)}
  .mast .logo img{height:44px}
  .langs{gap:8px}
  .lbtn{padding:7px 9px;font-size:18px}
  .lbtn.globe{display:none}
  .navbar{display:none}
  .menubtn{display:inline-flex}
  .open .wrap{grid-template-columns:1fr;gap:34px;padding-top:40px;padding-bottom:44px}
  .sealbox{order:-1}
  .seal{width:240px;height:240px}
  .open .sub{font-size:23px}
  .open .lead{font-size:20px}
  .btn{width:100%;white-space:normal;text-align:center;line-height:1.3}
  .figs{grid-template-columns:1fr 1fr}
  .figs div{padding:14px 0 6px;border:0;border-bottom:1px solid rgba(212,180,106,.45)}
  .figs b{font-size:42px}
  .sec{padding:44px 0}
  .pcard{width:230px}
  .issue .grid{grid-template-columns:1fr;gap:28px}
  .cover{max-width:300px}
  .lgrid{grid-template-columns:1fr 1fr;gap:12px}
  .lcard .box{height:112px;padding:14px}
  .lcard .box img{max-height:70px}
  .ledger thead{display:none}
  .ledger tr{display:block;padding:12px 14px;border-bottom:1px solid var(--line)}
  .ledger td{display:block;padding:2px 0;border:0}
  .ledger td.d{width:auto;font-size:21px}
  .club .wrap{grid-template-columns:1fr;gap:28px}
  .club .seal{margin:0 auto}
  footer .cols{grid-template-columns:1fr;gap:28px}
}
@media (min-width:1600px){ :root{--wrap:1440px} }
"""

def seal(t, size):
    ring = 'AAT BUSINESS CLUB · TAIPEI · SINCE 1982 · '
    return f'''<svg class="seal" viewBox="0 0 240 240" width="{size}" height="{size}" role="img" aria-label="{E(t['seal_caption'])}" direction="ltr">
<defs><path id="ring" d="M120,120 m-95,0 a95,95 0 1,1 190,0 a95,95 0 1,1 -190,0"/></defs>
<circle cx="120" cy="120" r="119" fill="#fff"/>
<circle cx="120" cy="120" r="113" fill="none" stroke="#D21F26" stroke-width="3"/>
<circle cx="120" cy="120" r="77" fill="none" stroke="#D21F26" stroke-width="2"/>
<text font-family="Newsreader, Georgia, serif" font-size="18" font-weight="700" letter-spacing="2.9" fill="#141821" direction="ltr"><textPath href="#ring" textLength="594" lengthAdjust="spacing">{ring}</textPath></text>
<image href="{IMG}img/logo.png" x="58" y="84" width="124" height="41.5"/>
<text x="120" y="152" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="17" font-weight="700" letter-spacing="2" fill="#8A6B2D" direction="ltr">1982 · 2026</text>
</svg>'''

def fmt_date(s, e, lang):
    y1, m1, d1 = int(s[:4]), int(s[5:7]), int(s[8:10]); y2, m2, d2 = int(e[:4]), int(e[5:7]), int(e[8:10])
    M = AR_MONTHS if lang == 'ar' else EN_MONTHS
    if (y1, m1) == (y2, m2):
        rng = f'<span class="ltr">{d1}–{d2}</span>' if lang == 'ar' else f'{d1}–{d2}'
        return f'{rng} {M[m1-1]} {y1}' if d1 != d2 else f'{d1} {M[m1-1]} {y1}'
    return f'{d1} {M[m1-1]} – {d2} {M[m2-1]} {y2}'

def build(lang):
    t = T[lang]; L = lang
    g = lambda o, k='': (o.get(L) if isinstance(o, dict) else o) or (o.get('en') if isinstance(o, dict) else '')
    co = {c['id']: c for c in D['companies']}
    # --- shelf: one pictured product per company (first 16 companies that have one)
    cards = []
    for c in D['companies']:
        p = next((p for p in c['products'] if p['img']), None)
        if not p: continue
        name = c['nameAr'] if (L == 'ar' and c['nameAr']) else c['company']
        logo = f'<img src="{IMG}{c["logo"]}" alt="">' if c['logo'] else ''
        cards.append(f'<div class="pcard"><div class="pic"><img src="{IMG}{p["img"]}" alt=""></div><div class="meta"><div class="co">{logo}<span><bdi>{E(name)}</bdi></span></div><div class="pn" dir="ltr">{E(p["n"])}</div></div></div>')
        if len(cards) >= 16: break
    track = ''.join(cards) * 2
    # --- toc
    toc = ''.join(f'<li><span class="pg">{t["page_word"]} {a["page"]}</span><span>{E(g(a["title"]) or "")}</span></li>' for a in D['magazine']['toc']['articles'] if g(a['title']))
    # --- advertisers (first 12, keeps 2 without a logo on purpose)
    lc = []
    for c in D['companies'][:12]:
        name = c['nameAr'] if (L == 'ar' and c['nameAr']) else c['company']
        box = f'<img src="{IMG}{c["logo"]}" alt="">' if c['logo'] else f'<div class="nm"><bdi dir="ltr">{E(c["company"].split(" Co.")[0].split(" (")[0].split(" Corp")[0])}</bdi></div>'
        cat = D['cats'][c['cat']][L]
        city = g(c['city'])
        lc.append(f'<div class="lcard"><span class="stamp">{t["page_stamp"]} {c["page"]}</span><div class="box">{box}</div><div class="meta"><b><bdi>{E(name)}</bdi></b><span>{E(cat)} · {E(city)}</span></div></div>')
    # --- shows: exact-date January 2027 rows
    F = {f['id']: f for f in D['fields']}
    rows = [s for s in D['shows'] if not s['approx'] and s['start'][:7] == '2027-01']
    rows.sort(key=lambda s: (s['start'], s['name']))
    pick = ['Steelfab', 'Anfas Food Product Exhibition', 'Gulf Print & Pack', 'World Future Energy Summit', 'Cosmetica North Africa', 'Mijf - Malaysia International Jewellery Fair', 'Iiff - Istanbul International Furniture Fair']
    rows = [s for s in rows if s['name'] in pick]
    tr = ''
    for s in rows:
        c = D['countries'][s['cc']]
        city = (s['city'] or {}).get(L) or (s['city'] or {}).get('en') or ''
        tr += (f'<tr><td class="d">{fmt_date(s["start"], s["end"], L)}</td><td class="n"><bdi dir="ltr">{E(s["name"])}</bdi></td>'
               f'<td><span class="flag"><img src="{IMG}{c["flag"]}" alt="">{E(city)}، {E(c[L])}</span></td><td>{E(F[s["field"]][L])}</td></tr>') if L == 'ar' else \
              (f'<tr><td class="d">{fmt_date(s["start"], s["end"], L)}</td><td class="n">{E(s["name"])}</td>'
               f'<td><span class="flag"><img src="{IMG}{c["flag"]}" alt="">{E(city)}, {E(c[L])}</span></td><td>{E(F[s["field"]][L])}</td></tr>')
    th = ''.join(f'<th>{E(x)}</th>' for x in t['th'])
    # --- club benefits (first 4)
    ben = ''.join(f'<li>{E(b[L])}</li>' for b in D['club']['benefits'][:4])
    cfg = D['config']
    navs = ''.join(f'<a href="#" class="{"on" if i == 0 else ""}">{E(n)}</a>' for i, n in enumerate(t['nav']))
    globe = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>'
    menu_ic = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'
    figs = ''.join(f'<div><b>{n}</b><span>{E(l)}</span></div>' for n, l in t['figs'])
    sep = ' · '
    foot_nav = ''.join(f'<li>{E(n)}</li>' for n in t['nav'])
    foot_srv = ''.join(f'<li>{E(n)}</li>' for n in t['services'])
    sep_ar = '، '
    page = f'''<!doctype html>
<html lang="{L}" dir="{t['dir']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(t['title'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<div class="ribbon"><div class="wrap"><span class="rn">{t['ribbon_name']}</span><span>{E(t['ribbon_issue'])}</span></div></div>
<header class="mast">
  <div class="wrap row1">
    <a class="logo" href="#home"><img src="{IMG}img/logo.png" alt="AAT · Ideas For Business"></a>
    <div class="langs"><a class="lbtn" href="#">{E(t['other'])}</a><a class="lbtn globe" href="#">{globe}{E(t['langs'])}</a><a class="lbtn menubtn" href="#">{menu_ic}{E(t['menu'])}</a></div>
  </div>
  <div class="navbar"><nav class="wrap nav">{navs}</nav></div>
</header>

<section class="open" id="home"><div class="wrap">
  <div>
    <h1>{E(t['h1'])}</h1>
    <p class="sub">{E(t['sub'])}</p>
    <p class="lead">{E(t['lead'])}</p>
    <div class="btns"><a class="btn" href="#club">{E(t['b_join'])}</a><a class="btn line" href="#magazine">{E(t['b_read'])}</a></div>
    <div class="figs">{figs}</div>
  </div>
  <div class="sealbox">{seal(t, 260)}<p>{E(t['seal_caption'])}</p></div>
</div></section>

<section class="shelf"><div class="wrap stitle"><h2>{E(t['s_shelf'])}</h2></div><div class="track">{track}</div></section>

<section class="sec panel issue"><div class="wrap">
  <div class="stitle"><h2>{E(t['s_issue'])}</h2></div>
  <div class="grid">
    <div class="cover"><img src="{IMG}img/magazine-560.jpg" alt=""></div>
    <div>
      <p class="about">{E(t['issue_cover'])}</p>
      <h3>{E(t['toc_title'])}</h3>
      <ul class="toc">{toc}</ul>
      <p class="md" style="margin:14px 0 0;color:var(--muted)">{E(t['ads_line'])}</p>
      <div class="btns"><a class="btn" href="#magazine">{E(t['b_issue'])}</a><a class="btn line" href="#">{E(t['b_pdf'])}</a></div>
    </div>
  </div>
</div></section>

<section class="sec white adv"><div class="wrap">
  <div class="stitle"><h2>{E(t['s_adv'])}</h2></div>
  <div class="lgrid">{''.join(lc)}</div>
</div></section>

<section class="sec panel shows"><div class="wrap">
  <div class="stitle"><h2>{E(t['s_shows'])}</h2></div>
  <table class="ledger"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>
  <div class="btns"><a class="btn line" href="#exhibitions">{E(t['b_shows'])}</a></div>
</div></section>

<section class="club" id="club"><div class="wrap">
  <div>{seal(t, 240)}</div>
  <div>
    <div class="stitle"><h2>{E(t['s_club'])}</h2></div>
    <p class="lead">{E(t['club_lead'])}</p>
    <p class="mem">{E(t['members_line'])}</p>
    <h3 style="margin:0 0 10px">{E(t['ben_title'])}</h3>
    <ol>{ben}</ol>
    <div class="btns"><a class="btn" href="#">{E(t['b_club'])}</a><a class="btn line" href="#">{E(t['b_ben'])}</a></div>
  </div>
</div></section>

<footer><div class="wrap">
  <div class="cols">
    <div><div class="flogo"><img src="{IMG}img/brand/aat-logo-white.svg" alt="AAT · Ideas For Business"></div>
      <p class="tri">{E(cfg['siteName']['ar'])}<br>{E(cfg['siteName']['en'])} · {E(cfg['siteName']['zh'])}<br>{E(D['about']['claim'][L])}</p></div>
    <div><h3>{E(t['f_explore'])}</h3><ul>{foot_nav}</ul></div>
    <div><h3>{E(t['f_services'])}</h3><ul>{foot_srv}</ul></div>
    <div><h3>{E(t['f_contact'])}</h3>
      <ul><li>{E(t['f_phone'])}: <bdi dir="ltr">{E(cfg['phone'])}</bdi></li><li>{E(t['f_email'])}: <bdi dir="ltr">{E(cfg['email'])}</bdi></li></ul>
      <p class="addr"><b>{E(t['f_address'])}</b><br><span class="ltr">{E(cfg['address']['en'])}</span></p></div>
  </div>
  <div class="bottom"><span>{E(t['rights'])}</span><span>{E(t['privacy'])}</span></div>
</div></footer>
<a class="chat" href="#">{E(t['chat'])}<small>{E(t['chat2'])}</small></a>
</body></html>'''
    out = os.path.join(HERE, f'tile-{L}.html')
    open(out, 'w', encoding='utf-8').write(page)
    print('wrote', out, len(page), 'bytes')

build('ar'); build('en')
