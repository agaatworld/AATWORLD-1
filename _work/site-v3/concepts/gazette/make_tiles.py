#!/usr/bin/env python3
"""Builds the style tiles of the concept "The Trade Gazette" (tile-ar.html, tile-en.html)
from the real site data (dump2.json made by the scratchpad dump2.js) and the app icons."""
import json, os, html, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCR = '/tmp/claude-0/-home-user/ac4d4ddb-24de-5266-a1be-7cec3105c99f/scratchpad/gz/'
D = json.load(open(SCR + 'dump2.json', encoding='utf8'))
APPIC = json.load(open(SCR + 'appic.json'))
IMG = '../../../../assets/img/'          # repo assets, relative to this folder
LOGO = '../../../brand/logo/aat-logo-red.svg'
ROOT = '/home/user/AATWORLD-1/assets/img/'

def esc(s): return html.escape(str(s), quote=True)
def exists(rel): return os.path.exists(ROOT + rel)
def bdi(s): return '<bdi>' + esc(s) + '</bdi>'

FLAG = {c: (c + ('.png' if c in ('af', 'eg', 'my', 'om') else '.svg')) for c in 'tw id my pk af dz eg iq kw ye om qa sa sy ae tr'.split()}
CN = {'tw': ('تايوان', 'Taiwan'), 'id': ('إندونيسيا', 'Indonesia'), 'my': ('ماليزيا', 'Malaysia'), 'pk': ('باكستان', 'Pakistan'),
      'af': ('أفغانستان', 'Afghanistan'), 'dz': ('الجزائر', 'Algeria'), 'eg': ('مصر', 'Egypt'), 'iq': ('العراق', 'Iraq'),
      'kw': ('الكويت', 'Kuwait'), 'ye': ('اليمن', 'Yemen'), 'om': ('عُمان', 'Oman'), 'qa': ('قطر', 'Qatar'),
      'sa': ('السعودية', 'Saudi Arabia'), 'sy': ('سوريا', 'Syria'), 'ae': ('الإمارات', 'UAE'), 'tr': ('تركيا', 'Turkey')}
MON = {'ar': ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
       'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}

T = {
 'ar': dict(lang='ar', dir='rtl', title='التجارة العربية الآسيوية · الصفحة الأولى',
   pub='تصدر في تايوان منذ 1982', today='الأربعاء 21 أكتوبر 2026', switch='English', langs='اللغات',
   name1='التجارة العربية الآسيوية', name2='Arab Asian Trade', name3='中阿商業雜誌',
   nav=['الصفحة الأولى', 'العدد 560', 'المنتجات', 'معارض دولية', 'المقالات', 'الأخبار', 'نادي رجال الأعمال', 'من نحن', 'تواصل معنا'],
   sections='الأقسام', ticker='منتجات المعلنين في هذا العدد',
   stamp_m='أكتوبر 2026', h1='مجموعة اليحيى على الغلاف، ولائحة بالأدلة الصناعية، و36 معلناً من آسيا والعالم العربي',
   lead='العدد 560 من مجلة التجارة العربية الآسيوية · 100 صفحة · أكتوبر 2026. مفتاح النجاح بين المستوردين والمصدّرين.',
   read='تصفّح العدد 560', pdf='نسخة PDF', cover_alt='غلاف العدد 560',
   figs=[('1982', 'صدر العدد الأول'), ('560', 'عدداً حتى اليوم'), ('45', 'عاماً من الصدور'), ('2,831', 'عضواً في نادي رجال الأعمال')],
   toc='في هذا العدد', toc_all='المحتويات الكاملة · 100 صفحة', page='ص',
   next='معارض قريبة', next_fact='يناير 2027', next_all='كل المعارض · 1,460 معرضاً في 16 دولة',
   adv='المعلنون في هذا العدد', adv_fact='العدد 560 · أكتوبر 2026',
   arts='مقالات العدد', arts_fact='13 مقالاً', news='الأخبار', news_all='كل الأخبار', src='المصدر',
   modern='منتجات وصناعات حديثة', modern_fact='40 منتجاً في 6 مجموعات', items='منتجات',
   club='نادي رجال الأعمال', club_fact='2,831 عضواً', members='عضواً', seal_top='AAT BUSINESS CLUB', seal_bottom='نادي رجال الأعمال',
   benefits='مزايا الأعضاء', join='للمشاركة في نادي رجال الأعمال', join_btn='انضم عبر واتساب',
   contact='تواصل معنا', phone='الهاتف', email='البريد الإلكتروني', address='العنوان', chat='محادثة 24 ساعة', chat2='اضغط هنا',
   apps_hint='واتساب وفايبر يفتحان المحادثة، والبقية تنسخ الرقم', copy='انسخ الرقم',
   f_pub='تصدر في تايوان منذ 1982 · 560 عدداً', f_sections='الأقسام', f_more=['أعلن معنا', 'الخصوصية'], f_contact='تواصل معنا',
   f_addr='العنوان', nl='اشترك في نشرة AAT', nl_ph='البريد الإلكتروني', nl_btn='اشتراك',
   rights='© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة · العدد 560 · أكتوبر 2026',
   more='المزيد'),
 'en': dict(lang='en', dir='ltr', title='Arab Asian Trade · Front Page',
   pub='Published in Taiwan since 1982', today='Wednesday, 21 October 2026', switch='العربية', langs='Languages',
   name1='Arab Asian Trade', name2='التجارة العربية الآسيوية', name3='中阿商業雜誌',
   nav=['Front Page', 'Issue 560', 'Products', 'International Exhibitions', 'Articles', 'News', 'Business Club', 'About', 'Contact'],
   sections='Sections', ticker='Products of the advertisers in this issue',
   stamp_m='October 2026', h1='Al Yahya Group on the cover, the industrial directories list, and 36 advertisers from Asia and the Arab world',
   lead='Issue 560 of Arab Asian Trade · 100 pages · October 2026. The source of quality suppliers.',
   read='Read issue 560', pdf='PDF copy', cover_alt='Cover of issue 560',
   figs=[('1982', 'first issue printed'), ('560', 'issues to date'), ('45', 'years in print'), ('2,831', 'Business Club members')],
   toc='In this issue', toc_all='Full contents · 100 pages', page='p.',
   next='Coming shows', next_fact='January 2027', next_all='All exhibitions · 1,460 shows in 16 countries',
   adv='Advertisers in this issue', adv_fact='Issue 560 · October 2026',
   arts='Articles of the issue', arts_fact='13 articles', news='News', news_all='All news', src='Source',
   modern='Products and modern industries', modern_fact='40 products in 6 groups', items='products',
   club='Business Club', club_fact='2,831 members', members='members', seal_top='AAT BUSINESS CLUB', seal_bottom='نادي رجال الأعمال',
   benefits='Member benefits', join='To join the AAT Business Club', join_btn='Join on WhatsApp',
   contact='Contact us', phone='Phone', email='E-mail', address='Address', chat='24-hour chat', chat2='Click here',
   apps_hint='WhatsApp and Viber open a chat; the others copy the number', copy='Copy the number',
   f_pub='Published in Taiwan since 1982 · 560 issues', f_sections='Sections', f_more=['Advertise with us', 'Privacy'], f_contact='Contact',
   f_addr='Address', nl='Subscribe to the AAT newsletter', nl_ph='E-mail address', nl_btn='Subscribe',
   rights='© 2026 Arab Asian Trade Group · All rights reserved · Issue 560 · October 2026',
   more='More'),
}

CSS = r"""
:root{--paper:#FFFFFF;--news:#F2F2EF;--rule:#C8C6C0;--ink:#141414;--ink2:#4A4A4A;--red:#D21F26;--red2:#9E1419;--blue:#0B4FA8;
 --fd:'Noto Naskh Arabic',serif;--fb:'Readex Pro',sans-serif;--fn:'Newsreader',Georgia,serif;--lh:1.8;--w:1480px}
html[lang=en]{--fd:'Newsreader',Georgia,serif;--lh:1.6}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--paper);color:var(--ink);font:400 20px/var(--lh) var(--fb);font-variant-numeric:lining-nums tabular-nums;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}a.ul{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}
a.blue{color:var(--blue);text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:4px}
img{display:block;max-width:100%}
.wrap{max-width:var(--w);margin:0 auto;padding:0 32px}
.num{font-family:var(--fn);font-variant-numeric:lining-nums tabular-nums}
.disp{font-family:var(--fd);font-weight:700}
/* dateline */
.dateline{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:48px;border-bottom:1px solid var(--rule);font-size:18px;color:var(--ink2)}
.dateline .c{font-weight:500;color:var(--ink)}
.dateline .e{display:flex;gap:10px}
.lbtn{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border:2px solid var(--ink);color:var(--ink);font:600 18px var(--fb);background:var(--paper)}
.lbtn svg{width:20px;height:20px}
/* masthead */
.mast{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:32px;padding:28px 0 22px}
.mast .n{font-family:var(--fd);font-weight:700;font-size:30px;line-height:1.4}
.mast .n.s{text-align:start}.mast .n.e{text-align:end}
.mast .n small{display:block;font-family:'Noto Sans TC','Microsoft JhengHei',sans-serif;font-weight:700;font-size:22px;line-height:1.4}
.mast .n .lat{font-family:var(--fn);font-weight:700;font-size:28px;display:block}
html[lang=ar] .mast .n .lat{font-family:var(--fn)}
html[lang=en] .mast .n .arb{font-family:'Noto Naskh Arabic',serif;font-weight:700;font-size:28px;display:block}
.mast .logo{width:420px}
.drule{height:11px;border-top:6px solid var(--red);border-bottom:1px solid var(--ink)}
/* section bar */
.secbar{display:flex;border-bottom:1px solid var(--ink)}
.secbar a{flex:1 1 auto;text-align:center;padding:14px 10px;font:600 20px/1.3 var(--fb);border-inline-start:1px solid var(--rule);white-space:nowrap}
.secbar a:first-child{border-inline-start:0}
.secbar a.cur{box-shadow:inset 0 -5px 0 var(--red)}
.secbar .menu{display:none}
/* compact sticky bar */
.compact{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--paper);border-bottom:1px solid var(--ink);transform:translateY(-110%);transition:transform .15s}
.compact.on{transform:none}
.compact .wrap{display:flex;align-items:center;gap:24px;min-height:72px}
.compact img{width:130px}
.compact nav{display:flex;flex:1}
.compact nav a{padding:8px 12px;font:600 19px var(--fb);border-inline-start:1px solid var(--rule)}
.compact nav a:first-child{border-inline-start:0}
/* ticker */
.ticker{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);position:relative;margin-top:0}
.tape{overflow:hidden;direction:ltr}
.ticker .lbl{position:absolute;inset-inline-start:0;top:0;bottom:0;z-index:2;background:var(--paper);display:flex;align-items:center;padding:0 24px;font:600 18px var(--fb);border-inline-end:1px solid var(--ink);max-width:220px;line-height:1.4}
.track{display:flex;width:max-content;direction:ltr;animation:tape 150s linear infinite}
html[lang=ar] .track{animation-name:tape-rtl}
.ticker:hover .track{animation-play-state:paused}
@keyframes tape{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes tape-rtl{from{transform:translateX(-50%)}to{transform:translateX(0)}}
.tk{display:flex;align-items:center;gap:14px;padding:12px 22px;border-inline-end:1px solid var(--rule);direction:ltr}
html[lang=ar] .tk{direction:rtl}
.tk img{width:76px;height:76px;object-fit:contain;border:1px solid var(--rule);background:#fff}
.tk>span{direction:ltr;text-align:left;min-width:0}
.tk b{display:block;font:600 18px/1.3 var(--fb);max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tk span{display:block;font-size:17px;color:var(--ink2);white-space:nowrap;max-width:240px;overflow:hidden;text-overflow:ellipsis}
/* section head */
.sechead{display:flex;justify-content:space-between;align-items:baseline;gap:24px;border-top:6px solid var(--red);border-bottom:1px solid var(--ink);padding:12px 0 10px;margin:0 0 24px}
.sechead h2{margin:0;font-family:var(--fd);font-weight:700;font-size:40px;line-height:1.3}
.sechead .fact{font-size:20px;color:var(--ink2);font-weight:500;white-space:nowrap}
section{padding:56px 0 0}
/* front page */
.front{display:grid;grid-template-columns:6fr 3fr 3fr;gap:0;margin-top:32px}
.front>div{padding:0 28px}
.front>div:first-child{padding-inline-start:0}
.front>div:last-child{padding-inline-end:0}
.front>div+div{border-inline-start:1px solid var(--rule)}
.stamp{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid var(--ink);background:var(--news);min-width:84px;padding:8px 10px;text-align:center;line-height:1}
.stamp .d{font:700 32px/1 var(--fn);color:var(--red)}
.stamp .m{font:500 18px/1.2 var(--fb);color:var(--ink);margin-top:6px}
.stamp.big .d{font-size:44px}
.issue{display:grid;grid-template-columns:1fr 300px;gap:32px}
.issue h1{font-family:var(--fd);font-weight:700;font-size:46px;line-height:1.35;margin:16px 0 12px}
.issue p{margin:0 0 24px;font-size:20px}
.cover{border:1px solid var(--rule);background:#fff}
.btns{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:56px;padding:0 26px;font:600 20px var(--fb);border:2px solid var(--ink);color:var(--ink);background:var(--paper);cursor:pointer}
.btn.red{background:var(--red);border-color:var(--red);color:#fff}
.btn.red:hover{background:var(--red2);border-color:var(--red2)}
.btn:hover{background:var(--ink);color:#fff}
html[lang=en] .btn{letter-spacing:.02em}
.figs{display:grid;grid-template-columns:repeat(4,1fr);margin-top:36px;border-top:1px solid var(--ink);border-bottom:1px solid var(--rule)}
.figs div{padding:18px 20px;border-inline-start:1px solid var(--rule)}
.figs div:first-child{border-inline-start:0;padding-inline-start:0}
.figs b{display:block;font:700 72px/1 var(--fn);letter-spacing:-.01em}
.figs span{display:block;font-size:18px;color:var(--ink2);margin-top:8px;line-height:1.4}
.col h3{margin:0 0 6px;font-family:var(--fd);font-weight:700;font-size:28px;line-height:1.4;padding-bottom:8px;border-bottom:1px solid var(--ink)}
.toc{list-style:none;margin:0;padding:0}
.toc li{display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--rule);font-size:19px;line-height:1.5}
.folio{font:700 18px var(--fb);color:var(--red);white-space:nowrap}
.tail{display:block;margin-top:14px;font:600 19px var(--fb)}
.tail:after{content:" \2190";font-weight:400}
html[lang=en] .tail:after{content:" \2192"}
/* ledger */
.ledger{list-style:none;margin:0;padding:0}
.row{display:grid;grid-template-columns:84px 1fr;gap:16px;padding:12px 0;border-bottom:1px solid var(--rule);align-items:start}
.row:hover{background:var(--news)}
.row b{display:block;font:600 21px/1.4 var(--fb)}
.row .v{font-size:18px;color:var(--ink2);line-height:1.5}
.row .cty{display:inline-flex;align-items:center;gap:8px;font-size:18px;margin-top:4px}
.row .cty img{width:30px;height:20px;object-fit:cover;border:1px solid var(--rule)}
/* logo index */
.lgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule)}
.lgrid a{background:var(--paper);min-width:0;padding:18px 16px 14px;display:flex;flex-direction:column;align-items:center;text-align:center;min-height:200px}
.lgrid img{height:72px;width:auto;max-width:100%;object-fit:contain;margin-bottom:12px}
.lgrid b{font:500 18px/1.4 var(--fb);display:block}
.lgrid .nolg{font:700 24px/1.3 var(--fd);display:flex;align-items:center;flex:1;margin-bottom:8px}
.lgrid .folio{margin-top:auto;padding-top:6px}
/* reading */
.reading{display:grid;grid-template-columns:8fr 4fr}
.reading>div+div{border-inline-start:1px solid var(--rule);padding-inline-start:28px}
.reading>div:first-child{padding-inline-end:28px}
.leadart{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding-bottom:20px;border-bottom:1px solid var(--ink)}
.leadart img{border:1px solid var(--rule);aspect-ratio:16/9;object-fit:cover;width:100%}
.leadart h3,.ent h3{margin:0 0 8px;font-family:var(--fd);font-weight:700;font-size:28px;line-height:1.45}
.leadart p,.ent p{margin:0;font-size:19px;color:var(--ink2);line-height:1.7}
.ents{display:grid;grid-template-columns:1fr 1fr;gap:0 28px}
.ent{padding:16px 0;border-bottom:1px solid var(--rule)}
.ent h3{font-size:24px}
.briefs{list-style:none;margin:0;padding:0}
.briefs li{padding:12px 0;border-bottom:1px solid var(--rule);font:600 20px/1.5 var(--fb)}
.briefs li span{display:block;font:400 17px var(--fb);color:var(--ink2);margin-top:4px}
/* groups */
.groups{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule)}
.groups a{background:var(--paper);padding:16px;display:block}
.groups img{aspect-ratio:4/3;object-fit:cover;width:100%;border:1px solid var(--rule);margin-bottom:12px}
.groups b{display:block;font:600 20px/1.4 var(--fb)}
.groups span{font-size:18px;color:var(--ink2)}
/* notice boxes */
.notice{border:2px solid var(--ink);padding:32px;position:relative}
.notice.dbl{border-top:8px solid var(--red)}
.clubgrid{display:grid;grid-template-columns:240px 1fr;gap:40px;align-items:start}
.seal{width:220px;height:220px}
.clubgrid p{font-size:20px;margin:0 0 14px}
.bign{font:700 64px/1 var(--fn);display:block;margin-bottom:6px}
.bign small{font:500 20px var(--fb);color:var(--ink2)}
.ben{columns:2;column-gap:40px;column-rule:1px solid var(--rule);list-style:none;margin:16px 0 0;padding:0;counter-reset:b}
.ben li{break-inside:avoid;display:flex;gap:14px;padding:10px 0;border-bottom:1px solid var(--rule);font-size:19px;line-height:1.6;counter-increment:b}
.ben li:before{content:counter(b,decimal-leading-zero);font:700 28px/1.3 var(--fn);color:var(--red);min-width:44px}
.apps{display:flex;gap:10px;list-style:none;margin:0;padding:0;flex-wrap:wrap}
.apps li{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:17px;color:var(--ink2);min-width:64px}
.app-i{width:52px;height:52px;display:flex;align-items:center;justify-content:center;border:1px solid var(--rule)}
.app-i svg{width:36px;height:36px}.app-i img{width:52px;height:52px}
.imprint{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:0}
.imprint>div{padding:0 28px}
.imprint>div:first-child{padding-inline-start:0}
.imprint>div+div{border-inline-start:1px solid var(--rule)}
.imprint h3{margin:0 0 10px;font:600 18px var(--fb);color:var(--ink2);text-transform:uppercase;letter-spacing:.04em}
html[lang=ar] .imprint h3{text-transform:none;letter-spacing:0}
.tel{font:700 32px/1.2 var(--fn);direction:ltr;display:inline-block;margin-bottom:14px}
.addr{direction:ltr;text-align:left;font-size:19px;line-height:1.6;font-family:var(--fb)}
.mail{font-size:20px;line-height:2}
/* footer */
footer{margin-top:64px}
.ft{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr;gap:0;padding:36px 0 40px}
.ft>div{padding:0 28px}
.ft>div:first-child{padding-inline-start:0}
.ft>div+div{border-inline-start:1px solid var(--rule)}
.ft h3{margin:0 0 12px;font-family:var(--fd);font-weight:700;font-size:24px}
.ft ul{list-style:none;margin:0;padding:0}
.ft li{padding:5px 0;font-size:19px}
.ft .logo{width:240px;margin-bottom:12px}
.ft .names{font:700 20px/1.6 var(--fd)}
.ft .names .lat{font-family:var(--fn)}
.ft p{margin:8px 0 0;font-size:18px;color:var(--ink2)}
.nlf{display:flex;margin-top:12px}
.nlf input{flex:1;min-width:0;min-height:52px;border:2px solid var(--ink);border-inline-end:0;padding:0 12px;font:400 18px var(--fb);background:var(--news)}
.nlf button{min-height:52px;padding:0 18px;border:2px solid var(--red);background:var(--red);color:#fff;font:600 18px var(--fb)}
.band{background:var(--red);color:#fff;font:500 18px/1.5 var(--fb);padding:16px 0}
.band .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
/* chat tab */
.chattab{position:fixed;top:50%;transform:translateY(-50%);z-index:40;background:var(--red);color:#fff;border:0;padding:16px 10px;writing-mode:vertical-rl;font:600 19px var(--fb);letter-spacing:.02em;cursor:pointer}
html[lang=ar] .chattab{left:0;transform:translateY(-50%) rotate(180deg)}
html[lang=en] .chattab{right:0}
/* phone */
@media (max-width:1180px){.secbar{flex-wrap:wrap}.secbar a{flex:1 1 30%}.lgrid{grid-template-columns:repeat(4,1fr)}.groups{grid-template-columns:repeat(3,1fr)}.front{grid-template-columns:1fr 1fr}.front>div:last-child{grid-column:1/-1;border-inline-start:0;padding:0;border-top:1px solid var(--rule);margin-top:24px;padding-top:24px}.compact nav{display:none}}
@media (max-width:760px){
 .wrap{padding:0 16px}body{font-size:19px}
 .dateline{font-size:17px;min-height:44px}.dateline .c{display:none}
 .mast{grid-template-columns:1fr;gap:6px;padding:18px 0 14px;text-align:center}
 .mast .logo{width:200px;margin:0 auto}.mast .n{font-size:18px;line-height:1.5}.mast .n.e{display:none}.mast .n small,.mast .n .lat,.mast .n .arb{display:none}
 .secbar{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}.secbar::-webkit-scrollbar{display:none}
 .secbar a{flex:0 0 auto;font-size:19px;padding:12px 14px}.secbar .menu{display:inline-flex;align-items:center;gap:8px;background:var(--ink);color:#fff;position:sticky;inset-inline-start:0}
 .ticker .lbl{display:none}.tk img{width:64px;height:64px}
 .front{grid-template-columns:1fr;margin-top:24px}.front>div{padding:0!important;border:0!important}.front>div+div{margin-top:28px}
 .issue{grid-template-columns:1fr}.issue h1{font-size:34px;line-height:1.4}.cover{width:200px}
 .figs{grid-template-columns:1fr 1fr}.figs div{padding:14px 12px;border-bottom:1px solid var(--rule)}.figs div:nth-child(odd){border-inline-start:0;padding-inline-start:0}.figs b{font-size:52px}
 .sechead{flex-direction:column;align-items:flex-start;gap:2px}.sechead h2{font-size:30px}.sechead .fact{font-size:18px}
 section{padding-top:40px}
 .lgrid{grid-template-columns:1fr 1fr}.lgrid a{min-height:160px}
 .reading{grid-template-columns:1fr}.reading>div{padding:0!important;border:0!important}.reading>div+div{margin-top:40px}
 .leadart{grid-template-columns:1fr}.ents{grid-template-columns:1fr}.leadart h3{font-size:24px}.ent h3{font-size:22px}
 .groups{grid-template-columns:1fr 1fr}
 .notice{padding:20px 16px}.clubgrid{grid-template-columns:1fr}.seal{width:200px;height:200px;margin:0 auto}.ben{columns:1}.bign{font-size:52px}
 .imprint{grid-template-columns:1fr}.imprint>div{padding:0!important;border:0!important}.imprint>div+div{margin-top:24px;padding-top:20px!important;border-top:1px solid var(--rule)!important}
 .ft{grid-template-columns:1fr;padding:28px 0}.ft>div{padding:0!important;border:0!important}.ft>div+div{margin-top:24px}
 .chattab{top:auto;bottom:0;left:0!important;right:0!important;transform:none!important;writing-mode:horizontal-tb!important;padding:14px 16px;text-align:center}
}
"""

def flag(c, L):
    return '<span class="cty"><img src="%sflags/%s" alt="">%s</span>' % (IMG, FLAG[c], esc(CN[c][0 if L == 'ar' else 1]))

def show_row(r, L):
    y, m, d = r[1].split('-'); y2, m2, d2 = r[2].split('-')
    mon = MON[L][int(m) - 1]
    if r[8]:  # month only: the stamp shows only the month, no placeholder
        stamp = '<span class="stamp"><span class="m">%s<br>%s</span></span>' % (esc(mon), y)
        dates = '%s %s' % (mon, y)
    else:
        stamp = '<span class="stamp"><span class="d">%s</span><span class="m">%s</span></span>' % (int(d), esc(mon))
        if m == m2: dates = '<bdi>%d–%d</bdi> %s %s' % (int(d), int(d2), mon, y)
        else: dates = '<bdi>%d</bdi> %s – <bdi>%d</bdi> %s %s' % (int(d), mon, int(d2), MON[L][int(m2) - 1], y)
    city = r[4]; cityL = D['cityAr'].get(city, city) if L == 'ar' else city
    place = esc(cityL) if cityL else ''
    return '<li class="row">%s<div><b>%s</b><div class="v">%s%s</div>%s</div></li>' % (
        stamp, bdi(r[0]), place, (' · ' + dates) if place else dates, flag(r[3], L))

def company_short(n):
    for s in [' Co., Ltd.', ' Co., Ltd', ' Corp.', ' Sdn. Bhd.', ' Ltd.', ' Company Ltd.', ' Industry Co., Ltd.']:
        n = n.replace(s, '')
    return n

def ticker_items(L):
    out = []
    comps = sorted(D['companies'], key=lambda c: c['page'])
    for c in comps:
        items = [i for i in D['products'].get(str(c['page']), []) if i.get('img') and exists(i['img'])][:2]
        for i in items:
            out.append('<a class="tk" href="#product-%s"><img src="%s%s" alt="" loading="lazy"><span><b>%s</b><span>%s</span></span></a>' % (
                c['page'], IMG, i['img'], bdi(i['n']), bdi(company_short(c['company']))))
    return out

def app_icons(L):
    order = ['WhatsApp', 'Viber', 'Botim', 'Imo', 'BiP', 'LINE']
    IMGAPP = {'Botim': 'botim', 'Imo': 'imo', 'BiP': 'bip'}
    out = []
    for x in order:
        a = APPIC[x]
        if x in IMGAPP:
            ic = '<span class="app-i"><img src="%sapps/%s.png" alt=""></span>' % (IMG, IMGAPP[x])
        else:
            ic = '<span class="app-i" style="background:%s"><svg viewBox="-3 -3 30 30"><path fill="#fff" d="%s"/></svg></span>' % (a['c'], a['p'])
        label = {'Imo': 'imo'}.get(x, x)
        out.append('<li>%s<span>%s</span></li>' % (ic, esc(label)))
    return '<ul class="apps">' + ''.join(out) + '</ul>'

def seal(t):
    return ('<svg class="seal" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"/></defs>'
            '<circle cx="100" cy="100" r="96" fill="none" stroke="#9E1419" stroke-width="4"/><circle cx="100" cy="100" r="86" fill="none" stroke="#9E1419" stroke-width="1.5"/>'
            '<circle cx="100" cy="100" r="58" fill="none" stroke="#9E1419" stroke-width="1.5"/>'
            '<text font-family="Readex Pro, sans-serif" font-weight="700" font-size="17" fill="#9E1419" letter-spacing="2"><textPath href="#ring" startOffset="50%%" text-anchor="middle">%s</textPath></text>'
            '<image href="%s" x="52" y="66" width="96" height="32"/>'
            '<text x="100" y="128" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-weight="700" font-size="17" fill="#9E1419">%s</text>'
            '<text x="100" y="152" text-anchor="middle" font-family="Newsreader, serif" font-weight="700" font-size="17" fill="#9E1419">SINCE 1982</text></svg>') % (esc(t['seal_top']), LOGO, esc(t['seal_bottom']))

GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>'

def build(L):
    t = T[L]; ar = L == 'ar'
    comps = sorted(D['companies'], key=lambda c: c['page'])
    # --- header
    nav = ''.join('<a href="#%s"%s>%s</a>' % (['home', 'issue', 'products', 'exhibitions', 'articles', 'news', 'club', 'about', 'contact'][i], ' class="cur"' if i == 0 else '', esc(n)) for i, n in enumerate(t['nav']))
    names_start = '<div class="n s">%s</div>' % esc(t['name1'])
    if ar:
        names_end = '<div class="n e"><span class="lat">%s</span><small>%s</small></div>' % (esc(t['name2']), esc(t['name3']))
    else:
        names_end = '<div class="n e"><span class="arb">%s</span><small>%s</small></div>' % (esc(t['name2']), esc(t['name3']))
    header = f'''
<div class="compact" id="compact"><div class="wrap"><a href="#home"><img src="{LOGO}" alt="AAT"></a><nav>{nav}</nav><a class="lbtn" href="#lang">{esc(t['switch'])}</a></div></div>
<header class="wrap">
 <div class="dateline"><span class="s">{esc(t['pub'])}</span><span class="c">{esc(t['today'])}</span><span class="e"><a class="lbtn" href="#lang">{esc(t['switch'])}</a><a class="lbtn" href="#langs">{GLOBE}{esc(t['langs'])}</a></span></div>
 <div class="mast">{names_start}<a href="#home"><img class="logo" src="{LOGO}" alt="AAT · Ideas For Business"></a>{names_end}</div>
 <div class="drule"></div>
 <nav class="secbar"><a class="menu" href="#sections">&#9776; {esc(t['sections'])}</a>{nav}</nav>
</header>'''
    # --- ticker
    tk = ticker_items(L)
    ticker = '<div class="ticker"><div class="lbl">%s</div><div class="tape"><div class="track">%s%s</div></div></div>' % (esc(t['ticker']), ''.join(tk), ''.join(tk))
    # --- front page lead
    figs = ''.join('<div><b class="num">%s</b><span>%s</span></div>' % (n, esc(l)) for n, l in t['figs'])
    # contents: companies + articles by page, sampled across the issue
    toc_src = [(c['page'], company_short(c['company'])) for c in comps if c['page'] <= 100]
    for a in D['articles']:
        tt = a.get('ar') if ar else (a.get('en') or a.get('ar'))
        if a['pages'] and a['pages'][0] > 1: toc_src.append((a['pages'][0], tt))
    toc_src = sorted(toc_src, key=lambda x: x[0])
    step = max(1, len(toc_src) // 13)
    toc = [(1, '__COVER__')] + toc_src[::step][:12]
    def tocname(n):
        if n == '__COVER__': return (esc('الغلاف') + ' · ' + bdi('Al Yahya Group')) if ar else ('The cover · ' + bdi('Al Yahya Group'))
        return bdi(n) if n.isascii() else esc(n)
    toc_html = ''.join('<li><span>%s</span><span class="folio">%s <bdi>%s</bdi></span></li>' % (tocname(n), esc(t['page']), p) for p, n in toc)
    # next shows: first with real dates, distinct countries
    seen, rows = set(), []
    for r in D['shows2027']:
        if r[8] or r[3] in seen: continue
        if r[0].startswith('World Stadium') or 'Book Fair' in r[0]: continue
        seen.add(r[3]); rows.append(r)
        if len(rows) == 6: break
    ledger = '<ul class="ledger">' + ''.join(show_row(r, L) for r in rows) + '</ul>'
    front = f'''
<section class="wrap" id="front">
 <div class="front">
  <div class="issue-col"><div class="issue"><div>
    <span class="stamp big"><span class="d">560</span><span class="m">{esc(t['stamp_m'])}</span></span>
    <h1>{esc(t['h1'])}</h1><p>{esc(t['lead'])}</p>
    <div class="btns"><a class="btn red" href="#issue">{esc(t['read'])}</a><a class="btn" href="#pdf">{esc(t['pdf'])}</a></div>
   </div><a href="#issue"><img class="cover" src="{IMG}magazine-560.jpg" alt="{esc(t['cover_alt'])}" width="617" height="873"></a></div>
   <div class="figs">{figs}</div></div>
  <div class="col"><h3>{esc(t['toc'])}</h3><ol class="toc">{toc_html}</ol><a class="tail" href="#issue">{esc(t['toc_all'])}</a></div>
  <div class="col"><h3>{esc(t['next'])} · <span class="num">{esc(t['next_fact'])}</span></h3>{ledger}<a class="tail" href="#exhibitions">{esc(t['next_all'])}</a></div>
 </div>
</section>'''
    # --- advertisers index
    cells = []
    for c in comps:
        name = company_short(c['company'])
        if c['logo'] and exists(c['logo']):
            cells.append('<a href="#company-%d"><img src="%s%s" alt="%s"><b>%s</b><span class="folio">%s <bdi>%d</bdi></span></a>' % (c['page'], IMG, c['logo'], esc(name), bdi(name), esc(t['page']), c['page']))
        else:
            cells.append('<a href="#company-%d"><span class="nolg">%s</span><span class="folio">%s <bdi>%d</bdi></span></a>' % (c['page'], bdi(name), esc(t['page']), c['page']))
    adv = f'''
<section class="wrap"><div class="sechead"><h2>{esc(t['adv'])}</h2><span class="fact">{esc(t['adv_fact'])}</span></div>
 <div class="lgrid">{''.join(cells)}</div></section>'''
    # --- reading
    A = {a['id']: a for a in D['articles']}
    if ar:
        lead, ents = A['ar26-1'], [A['ar26-3'], A['global-economy-2026'], A['discount-traps-smart-shopping'], A['crowdfunding-platforms']]
        news = [n for n in D['news'] if n['img'].startswith('arn')][:6]
    else:
        lead, ents = A['global-economy-2026'], [A['ota-physical-ai-computex'], A['end-of-traditional-job'], A['crowdfunding-platforms'], A['intellectual-property']]
        news = [n for n in D['news'] if n['img'].startswith('news')][:6]
    def ttl(a): return (a.get('ar') if ar else (a.get('en') or a.get('ar')))
    def summ(a): return (a.get('sumAr') if ar else (a.get('sumEn') or '')) or ''
    def folio(a):
        if not a['pages'] or a['pages'][0] <= 1: return ''
        return '<span class="folio">%s <bdi>%s</bdi></span>' % (esc(t['page']), '–'.join(str(x) for x in [a['pages'][0], a['pages'][-1]]) if len(a['pages']) > 1 else a['pages'][0])
    leadart = '<article class="leadart"><a href="#article-%s"><img src="%s%s" alt=""></a><div><h3>%s</h3><p>%s</p>%s</div></article>' % (lead['id'], IMG, lead['img'], esc(ttl(lead)), esc(summ(lead)[:170]), folio(lead))
    ents_html = ''.join('<article class="ent"><h3>%s</h3><p>%s</p>%s</article>' % (esc(ttl(a)), esc(summ(a)[:120]), folio(a)) for a in ents)
    briefs = ''.join('<li>%s%s</li>' % (esc(n['ar'] if ar else n['en']), ('<span>%s: %s</span>' % (esc(t['src']), esc(n['src']))) if n.get('src') else '') for n in news)
    reading = f'''
<section class="wrap"><div class="reading">
 <div><div class="sechead"><h2>{esc(t['arts'])}</h2><span class="fact">{esc(t['arts_fact'])}</span></div>{leadart}<div class="ents">{ents_html}</div></div>
 <div><div class="sechead"><h2>{esc(t['news'])}</h2></div><ul class="briefs">{briefs}</ul><a class="tail" href="#news">{esc(t['news_all'])}</a></div>
</div></section>'''
    # --- modern groups
    G = D['modernG']; pic = {'pack': 'm2', 'food': 'm1', 'plastic': 'm31', 'health': 'm0', 'metal': 'm11', 'home': 'm16'}
    cnt = {}
    for m in D['modern']: cnt[m['g']] = cnt.get(m['g'], 0) + 1
    groups = ''.join('<a href="#industry-%s"><img src="%smodern/%s.jpg" alt=""><b>%s</b><span>%d %s</span></a>' % (g, IMG, pic[g], esc(G[g]['ar' if ar else 'en']), cnt.get(g, 0), esc(t['items'])) for g in ['pack', 'food', 'plastic', 'health', 'metal', 'home'])
    modern = f'''
<section class="wrap"><div class="sechead"><h2>{esc(t['modern'])}</h2><span class="fact">{esc(t['modern_fact'])}</span></div><div class="groups">{groups}</div></section>'''
    # --- club notice
    tx = D['tx']; lg = 'ar' if ar else 'en'
    ben = ''.join('<li><span>%s</span></li>' % esc(tx['cb_b%d' % i][lg]) for i in range(1, 9))
    club = f'''
<section class="wrap"><div class="sechead"><h2>{esc(t['club'])}</h2><span class="fact">{esc(t['club_fact'])}</span></div>
 <div class="notice dbl"><div class="clubgrid">{seal(t)}<div>
   <span class="bign num">2,831 <small>{esc(t['members'])}</small></span>
   <p>{esc(tx['cb_goals_p'][lg])}</p><p>{esc(tx['cb_goals_p2'][lg])}</p>
   <h3 style="margin:18px 0 0;font:700 26px var(--fd)">{esc(t['benefits'])}</h3><ol class="ben">{ben}</ol>
   <p style="margin-top:22px"><b>{esc(t['join'])}</b></p>
   <div class="btns" style="align-items:center"><a class="btn red" href="https://wa.me/886966404681">{esc(t['join_btn'])}</a><span class="tel" style="margin:0">+886 966 404 681</span></div>
 </div></div></div></section>'''
    # --- contact imprint
    contact = f'''
<section class="wrap"><div class="sechead"><h2>{esc(t['contact'])}</h2></div>
 <div class="notice"><div class="imprint">
  <div><h3>{esc(t['phone'])}</h3><a class="tel" href="tel:+886966404681">+886 966 404 681</a>{app_icons(L)}<p style="font-size:17px;color:var(--ink2);margin:10px 0 0">{esc(t['apps_hint'])}</p></div>
  <div><h3>{esc(t['email'])}</h3><div class="mail"><a class="blue" href="mailto:info@aatworld.com">info@aatworld.com</a><br><a class="blue" href="mailto:marwan@aatworld.com">marwan@aatworld.com</a></div>
       <p style="margin-top:16px"><a class="btn" href="#chat">{esc(t['chat'])}</a></p></div>
  <div><h3>{esc(t['address'])}</h3><div class="addr">Arab Asian Trade (AAT)<br>P.O. Box 568, Yonghe,<br>New Taipei City 234964,<br>Taiwan R.O.C.</div></div>
 </div></div></section>'''
    # --- footer
    fsec = ''.join('<li><a href="#">%s</a></li>' % esc(n) for n in t['nav'] + t['f_more'])
    footer = f'''
<footer><div class="wrap"><div class="drule"></div>
 <div class="ft">
  <div><img class="logo" src="{LOGO}" alt="AAT"><div class="names">{esc(t['name1'])}<br><span class="lat">Arab Asian Trade</span> · 中阿商業雜誌</div><p>{esc(t['f_pub'])}</p></div>
  <div><h3>{esc(t['f_sections'])}</h3><ul>{fsec}</ul></div>
  <div><h3>{esc(t['f_contact'])}</h3><a class="tel" href="tel:+886966404681" style="font-size:24px">+886 966 404 681</a>{app_icons(L)}<p class="mail" style="color:var(--ink)"><a class="blue" href="mailto:info@aatworld.com">info@aatworld.com</a><br><a class="blue" href="mailto:marwan@aatworld.com">marwan@aatworld.com</a><br><a class="blue" href="https://www.aatworld.com">www.aatworld.com</a></p></div>
  <div><h3>{esc(t['f_addr'])}</h3><div class="addr">P.O. Box 568, Yonghe,<br>New Taipei City 234964,<br>Taiwan R.O.C.</div>
       <h3 style="margin-top:22px">{esc(t['nl'])}</h3><form class="nlf" onsubmit="return false"><input type="email" placeholder="{esc(t['nl_ph'])}" aria-label="{esc(t['nl_ph'])}"><button type="submit">{esc(t['nl_btn'])}</button></form></div>
 </div></div>
 <div class="band"><div class="wrap"><span>{esc(t['rights'])}</span><span dir="ltr">www.aatworld.com · info@aatworld.com</span></div></div>
</footer>
<button class="chattab" type="button">{esc(t['chat'])} · {esc(t['chat2'])}</button>'''
    js = '''<script>(function(){var c=document.getElementById('compact'),m=document.querySelector('.secbar');function f(){var r=m.getBoundingClientRect();c.classList.toggle('on',r.bottom<0)}window.addEventListener('scroll',f,{passive:true});f()})();</script>'''
    page = f'''<!doctype html>
<html lang="{L}" dir="{t['dir']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(t['title'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@700&family=Readex+Pro:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,700&family=Noto+Sans+TC:wght@700&display=swap" rel="stylesheet">
<style>{CSS}</style></head>
<body>{header}{ticker}{front}{adv}{reading}{modern}{club}{contact}{footer}{js}</body></html>'''
    open(os.path.join(HERE, 'tile-%s.html' % L), 'w', encoding='utf8').write(page)
    print('wrote tile-%s.html' % L, len(page) // 1024, 'KB', 'ticker items', len(tk))

for L in ('ar', 'en'): build(L)
