# Builds the editable HTML designs (one file per concept × format × portrait treatment) into ../html/.
# Every text comes from content.py (nothing is retyped here). Render to PNG with render.js.
import os, re, html
from content import *
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'html'); os.makedirs(OUT, exist_ok=True)
E = html.escape

BASE = """
@font-face{font-family:ThSans;src:url(../fonts/thmanyahsans-Medium.ttf);font-weight:500}
@font-face{font-family:ThSans;src:url(../fonts/thmanyahsans-Bold.ttf);font-weight:700}
@font-face{font-family:ThSans;src:url(../fonts/thmanyahsans-Black.ttf);font-weight:900}
@font-face{font-family:ThSerif;src:url(../fonts/thmanyahserifdisplay-Bold.ttf);font-weight:700}
@font-face{font-family:ThSerif;src:url(../fonts/thmanyahserifdisplay-Black.ttf);font-weight:900}
@font-face{font-family:ThText;src:url(../fonts/thmanyahseriftext-Medium.ttf);font-weight:500}
@font-face{font-family:ThText;src:url(../fonts/thmanyahseriftext-Bold.ttf);font-weight:700}
@font-face{font-family:Quran;src:url(../fonts/g_AmiriQuran-Regular.ttf)}
:root{--navy:#0F1B2D;--navy2:#15253B;--steel:#2E4A68;--amber:#F2A541;--orange:#FF8A3D;--white:#F4E9D8;--mute:#A8B3C1;--ink:#1F2A44;--paper:#F1E6D3}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--W);height:var(--H);overflow:hidden}
body{direction:rtl;font-family:ThSans,sans-serif;color:var(--white);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.page{position:relative;width:var(--W);height:var(--H);overflow:hidden}
.num{font-weight:700;direction:ltr;unicode-bidi:isolate;font-variant-numeric:lining-nums tabular-nums}
ul,ol{list-style:none}
.logo{position:absolute;width:var(--logo,96px);height:var(--logo,96px);border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,.45);z-index:5}
.verse{font-family:Quran;line-height:1.9}
.cols2{column-count:2;column-gap:var(--cg,34px)}
.cols2 li{break-inside:avoid}
.key{font-weight:900;font-size:1.24em;line-height:1.25}
"""
def dims(fmt): return (1080, 1080) if fmt == 'sq' else (1920, 1080)

def portrait(kind, cls='portrait', pos='54% 30%'):
    if kind == 'cut': return f'<img class="{cls} cut" src="../assets/portrait_cut.png" alt="">'
    return f'<img class="{cls} focus" src="../assets/portrait_focus_tall.jpg" style="object-position:{pos}" alt="">'

def D(s):
    """escape, then wrap digits (dates, years, numbers) so they keep their direction"""
    return re.sub(r'([0-9][0-9/]*[0-9]|[0-9])', r'<span class="num">\1</span>', E(s))
def K(s, keys=()):
    """like D(), and the key phrases become <b class="key"> (shown big)"""
    t = E(s)
    for k in keys:
        ek = E(k); i = t.find(ek); assert i >= 0, k
        t = t[:i] + '\x01' + ek + '\x02' + t[i + len(ek):]
    t = re.sub(r'([0-9][0-9/]*[0-9]|[0-9])', r'<span class="num">\1</span>', t)
    return t.replace('\x01', '<b class="key">').replace('\x02', '</b>')
def personal():
    return '<dl class="kv">' + ''.join(f'<div><dt>{E(k)}</dt><dd>{D(v)}</dd></div>' for k, v in PERSONAL) + '</dl>'
def qual():
    """all six qualification facts; the three «بدرجة امتياز» courses grouped as badges"""
    badges = ''.join(f'<span class="badge">{E(b)} <b>امتياز</b></span>' for b in EXCELLENCE)
    return (f'<ul class="qual"><li>{K(QUAL[0], QUAL_KEYS[0])}</li><li>{D(QUAL[1])}</li>'
            f'<li class="badges">{badges}</li><li>{K(QUAL[5], QUAL_KEYS[5])}</li></ul>')
def career(cls=''):
    out = f'<ol class="career {cls}">'
    for i, (d, t) in enumerate(CAREER, 1):
        tag = f'<span class="when">{D(d)}</span>' if d else ''
        out += f'<li><i class="n num">{i:02d}</i><p>{tag}{K(t, CAREER_KEYS[i-1])}</p></li>'
    return out + '</ol>'
def wounds(cls='', martyr=True):
    """lab + date on one line, then «place: text»"""
    out = f'<ol class="wounds {cls}">'
    for i, (lab, when, where, txt) in enumerate(WOUNDS, 1):
        w = f'<span class="w-when">{D(when)}</span>' if when else ''
        pl = f'<span class="w-where">{E(where)}:</span> ' if where else ''
        out += f'<li class="w{i}"><i class="dot"></i><div class="w-head"><b class="w-lab">{E(lab)}</b>{w}</div><p>{pl}{K(txt, WOUND_KEYS[i-1])}</p></li>'
    if martyr:
        out += (f'<li class="martyr"><i class="dot"></i><div class="w-head"><b class="w-lab">{E(MARTYRDOM[0])}</b>'
                f'<span class="w-when">{D(MARTYRDOM[1])}</span></div><p>{E(MARTYRDOM[2])}</p></li>')
    return out + '</ol>'
def sec(title, body, cls='', style=''):
    return f'<section class="sec {cls}" style="{style}"><h3>{E(title)}</h3>{body}</section>'
def verse(ref=True):
    r = f' <small class="vref">{E(VERSE_REF)}</small>' if ref else ''
    return f'<div class="verse">﴿{E(VERSE)}﴾{r}</div>'

# =====================================================================================================
# 1 «سِجلّ الشرف» — luxury military editorial: navy + topo, hair-thin amber rules, serif display name, arched portrait
C1 = """
.page{background:var(--navy) url(../assets/navy.jpg);background-size:cover}
.page:before{content:"";position:absolute;inset:0;background:url(../assets/topo.png);background-size:1400px;opacity:.06}
.frame{position:absolute;inset:26px;border:1px solid rgba(242,165,65,.45)}
.kick{display:flex;align-items:center;gap:14px;color:var(--amber);font:700 var(--kick) ThSans}
.kick:after{content:"";flex:1;height:1px;background:linear-gradient(to left,rgba(242,165,65,.7),transparent)}
.rank{font:700 var(--rank) ThSerif;color:var(--amber);margin-top:8px}
.name{font:900 var(--name)/1.12 ThSerif;color:var(--white);text-shadow:0 3px 18px rgba(0,0,0,.5)}
.life{display:flex;align-items:center;gap:16px;margin-top:12px}
.life .num{font:900 var(--life) ThSerif;color:var(--white)}
.life i{width:46px;height:1px;background:var(--amber)}
.ph{position:absolute;overflow:hidden;border-radius:999px 999px 6px 6px;box-shadow:0 20px 50px rgba(0,0,0,.55)}
.ph:after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(242,165,65,.7)}
.phline{position:absolute;border:1px solid rgba(242,165,65,.35);border-radius:999px 999px 6px 6px}
.ph img{width:100%;height:100%;object-fit:cover}
.ph img.cut{object-position:50% 0;background:radial-gradient(70% 55% at 50% 30%,#2E4A68,#0F1B2D)}
.sec h3{font:700 var(--h3) ThSerif;color:var(--amber);margin-bottom:8px;display:flex;align-items:center;gap:10px}
.sec h3:before{content:"";width:9px;height:9px;transform:rotate(45deg);background:var(--amber);flex:none}
.kv div{display:flex;gap:10px;font-size:var(--body);line-height:1.55}
.kv dt{color:var(--mute);flex:none;width:var(--kw)}.kv dd{color:var(--white)}
.qual li{position:relative;padding-inline-start:16px;font-size:var(--body);line-height:1.55}
.qual li:before{content:"";position:absolute;inset-inline-start:0;top:.75em;width:7px;height:1px;background:var(--amber)}
.qual li.badges{padding:5px 0;display:flex;gap:7px;flex-wrap:wrap}.qual li.badges:before{display:none}
.badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(242,165,65,.55);border-radius:3px;padding:1px 9px;font-size:var(--small)}
.badge b{color:var(--amber)}
.career li{display:flex;gap:12px;font-size:var(--body);line-height:1.55;margin-bottom:7px}
.career .n{font:900 var(--h3) ThSerif;color:var(--amber);font-style:normal;flex:none;width:28px;line-height:1.3}
.career .when{display:inline-block;color:var(--navy);background:var(--amber);font-weight:700;font-size:var(--small);padding:0 7px;border-radius:2px;margin-inline-end:7px;line-height:1.5}
.wounds li{position:relative;font-size:var(--small);line-height:1.45}
.wounds .w-head{display:flex;align-items:baseline;gap:10px}
.wounds .w-lab{color:var(--amber);font-weight:700}
.wounds .w-when{font:900 var(--body) ThSerif;color:var(--white)}
.wounds .w-where{color:var(--mute)}
.wounds li.martyr .w-lab,.wounds li.martyr .w-when{color:var(--orange)}
.wounds li.martyr .w-when{font-size:var(--life)}
/* vertical (square) */
.wounds.v{position:relative;display:grid;gap:9px;padding-inline-start:24px}
.wounds.v:before{content:"";position:absolute;inset-inline-start:6px;top:8px;bottom:14px;width:1px;background:linear-gradient(rgba(242,165,65,.85),rgba(255,138,61,.95))}
.wounds.v .dot{position:absolute;inset-inline-start:-24px;top:5px;width:13px;height:13px;border-radius:50%;background:var(--navy);border:2px solid var(--amber)}
.wounds.v li.martyr .dot{background:var(--orange);border-color:var(--orange);box-shadow:0 0 0 5px rgba(255,138,61,.2)}
/* horizontal (landscape) */
.wounds.h{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:20px}
.wounds.h:before{content:"";position:absolute;inset-inline:6px;top:7px;height:1px;background:linear-gradient(to left,rgba(242,165,65,.8),rgba(255,138,61,.9))}
.wounds.h li{padding-top:26px}
.wounds.h .w-head{display:block}.wounds.h .w-lab,.wounds.h .w-when{display:block}
.wounds.h .dot{position:absolute;top:0;inset-inline-start:0;width:15px;height:15px;border-radius:50%;background:var(--navy);border:2px solid var(--amber)}
.wounds.h li.martyr .dot{background:var(--orange);border-color:var(--orange);box-shadow:0 0 0 6px rgba(255,138,61,.2)}
.foot{position:absolute;text-align:center;color:var(--white)}
.foot .verse{font-size:var(--verse)}.foot .vref{font:500 var(--small) ThSans;color:var(--mute)}
.foot .close{font:700 var(--body) ThSerif;color:var(--amber);margin-top:4px}
.career p,.qual li,.wounds p{color:#CBD3DE}.key{color:var(--white)}
.prow{display:grid;grid-template-columns:auto auto 1fr;gap:22px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(242,165,65,.35)}
.prow span{display:block;font:700 var(--small) ThSans;color:var(--amber)}.prow b{display:block;font:700 var(--body)/1.4 ThSans;color:var(--white)}
.ph .pv{position:absolute;left:0;right:0;bottom:0;padding:40px 12px 8px;text-align:center;background:linear-gradient(transparent,rgba(15,27,45,.94) 45%)}
.ph .pv .verse{font-size:var(--verse);line-height:1.75;color:var(--white)}.ph .pv .vref{font:500 13px ThSans;color:var(--mute)}
.qrow .sec{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start}
.qrow .qual{display:grid;grid-template-columns:1fr 1fr;gap:4px 26px}
.qrow .qual li:nth-child(1){grid-area:1/1}.qrow .qual li:nth-child(2){grid-area:1/2}.qrow .qual li:nth-child(4){grid-area:2/1}.qrow .qual li.badges{grid-area:2/2;padding:4px 0 0;align-content:start}
.qrow.l3 .qual{grid-template-columns:1fr 1fr 1fr}.qrow.l3 .qual li:nth-child(1){grid-area:1/1}.qrow.l3 .qual li:nth-child(2){grid-area:2/1}.qrow.l3 .qual li:nth-child(4){grid-area:1/2/3/3}.qrow.l3 .qual li.badges{grid-area:1/3/3/4}
.wounds.g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 18px}
.wounds.g li{border-top:2px solid var(--amber);padding-top:6px}
.wounds.g .w-head{justify-content:space-between}
.wounds.g .w-when{font-size:var(--wd)}
.wounds.g li.martyr{border-top-color:var(--orange);background:linear-gradient(rgba(255,138,61,.16),rgba(255,138,61,0));padding:6px 10px 0}
.wounds.g li.martyr .w-when{font-size:calc(var(--wd)*1.45)}
.wounds.g li.martyr p{font:700 var(--body) ThSerif;color:var(--orange)}
"""
def c1(fmt, ph):
    if fmt == 'sq':
        v = "--kick:20px;--rank:30px;--name:60px;--life:34px;--h3:24px;--body:16.5px;--small:15.5px;--verse:17px;--logo:80px;--kw:92px;--wd:24px"
        prow = ''.join(f'<div><span>{E(k)}</span><b>{D(v)}</b></div>' for k, v in PERSONAL)
        body = f"""
<div class="frame"></div>
<img class="logo" src="../assets/logo.png" style="left:40px;top:40px">
<div class="phline" style="left:44px;top:66px;width:300px;height:362px"></div>
<div class="ph" style="left:56px;top:54px;width:300px;height:362px">{portrait(ph)}<div class="pv">{verse()}</div></div>
<div style="position:absolute;right:52px;width:640px;top:46px">
  <div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div>
  <div class="name">{E(NAME_L1)}<br>{E(NAME_L2)}</div>
  <div class="life"><span class="num">{BORN}</span><i></i><span class="num">{MARTYR}</span></div>
  <div class="prow">{prow}</div>
</div>
<div style="position:absolute;right:52px;left:52px;top:438px;bottom:42px;display:flex;flex-direction:column;justify-content:space-between">
  {sec('المسيرة الميدانية', career('cols2'))}
  <div class="qrow">{sec('التأهيل العسكري', qual())}</div>
  {wounds("g")}
</div>"""
    else:
        v = "--kick:24px;--rank:34px;--name:78px;--life:42px;--h3:28px;--body:20.5px;--small:18.5px;--verse:21px;--logo:100px;--kw:104px;--wd:28px;--cg:44px"
        prow = ''.join(f'<div><span>{E(k)}</span><b>{D(v)}</b></div>' for k, v in PERSONAL)
        body = f"""
<div class="frame"></div>
<img class="logo" src="../assets/logo.png" style="left:50px;top:50px">
<div class="phline" style="right:60px;top:74px;width:450px;height:676px"></div>
<div class="ph" style="right:74px;top:60px;width:450px;height:676px">{portrait(ph)}<div class="pv">{verse()}</div></div>
<div style="position:absolute;right:580px;left:64px;top:54px;bottom:290px;display:flex;flex-direction:column;justify-content:space-between">
 <div style="white-space:nowrap">
  <div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div>
  <div class="name">{E(NAME)}</div>
  <div class="life"><span class="num">{BORN}</span><i></i><span class="num">{MARTYR}</span></div>
 </div>
 <div class="prow" style="margin-top:0">{prow}</div>
 {sec('المسيرة الميدانية', career('cols2'))}
 <div class="qrow l3">{sec('التأهيل العسكري', qual())}</div>
</div>
<div style="position:absolute;right:74px;left:64px;bottom:44px">{sec('الإصابات والتضحيات', wounds('h'))}</div>"""
    return C1, v, body

# =====================================================================================================
# 2 «القائد» — powerful military identity: near-black, huge outline surname, big portrait, amber cut line, heavy cards
C2 = """
.page{background:#0A1220}
.page:before{content:"";position:absolute;inset:0;background:radial-gradient(60% 55% at 22% 34%,rgba(46,74,104,.6),transparent 70%),url(../assets/navy.jpg);background-size:cover;opacity:.95}
.diag{position:absolute;background:var(--amber);transform:skewX(-14deg)}
.diag2{position:absolute;background:rgba(242,165,65,.12);transform:skewX(-14deg)}
.big{position:absolute;font:900 var(--big)/0.9 ThSans;color:transparent;-webkit-text-stroke:1.5px rgba(242,165,65,.2);white-space:nowrap}
.cutwrap{position:absolute;overflow:hidden}
.cutwrap img{position:absolute;left:0;bottom:0;width:100%;height:auto;filter:contrast(1.06) drop-shadow(0 0 1.5px rgba(242,165,65,.95)) drop-shadow(12px 0 30px rgba(0,0,0,.6))}
.cutwrap img.focus{top:0;height:100%;object-fit:cover;filter:contrast(1.06)}
.cutwrap img.cut{left:50%;width:auto;height:100%;transform:translateX(-50%)}
.cutwrap:has(img.cut):after{display:none}
.cutwrap:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,#0A1220 0%,rgba(10,18,32,.6) 16%,rgba(10,18,32,0) 36%)}
.title .kick{font:700 var(--kick) ThSans;color:var(--amber)}
.title .rank{display:inline-block;font:900 var(--rank)/1.25 ThSans;color:#0A1220;background:var(--amber);padding:0 14px;margin:8px 0 6px;transform:skewX(-8deg)}
.title .name{font:900 var(--name)/1.08 ThSans;color:var(--white);-webkit-mask:url(../assets/distress_soft.png);-webkit-mask-size:1100px;padding:.18em 0 .3em;margin:-.18em 0 -.3em}
.title .life{display:flex;gap:14px;align-items:center;margin-top:12px;font:900 var(--life) ThSans;color:var(--white)}
.title .life i{width:60px;height:4px;background:var(--orange)}
.sec h3{font:900 var(--h3) ThSans;color:var(--amber);margin-bottom:6px;display:flex;align-items:center;gap:10px}
.sec h3:after{content:"";flex:1;height:2px;background:rgba(242,165,65,.3)}
.kv div{display:flex;gap:10px;font-size:var(--body);line-height:1.55}.kv dt{color:var(--amber);font-weight:700;flex:none;width:var(--kw)}
.qual li{font-size:var(--body);line-height:1.5;padding-inline-start:16px;position:relative}
.qual li:before{content:"";position:absolute;inset-inline-start:0;top:.6em;width:8px;height:8px;background:var(--orange);transform:skewX(-14deg)}
.qual li.badges{display:flex;gap:8px;flex-wrap:wrap;padding:5px 0}.qual li.badges:before{display:none}
.badge{background:rgba(242,165,65,.14);border-inline-start:4px solid var(--amber);padding:2px 10px;font-size:var(--small)}.badge b{color:var(--amber);margin-inline-start:6px}
.career li{display:flex;gap:10px;font-size:var(--body);line-height:1.5;margin-bottom:6px}
.career .n{font:900 var(--h3) ThSans;color:var(--orange);font-style:normal;flex:none;width:30px;line-height:1.2}
.career .when{color:var(--amber);font-weight:900;margin-inline-end:6px}
.wounds{display:grid;gap:10px;counter-reset:w}
.wounds li{position:relative;background:rgba(10,18,32,.82);border-top:4px solid var(--amber);padding:8px 12px 8px;font-size:var(--small);line-height:1.45}
.wounds li:before{content:counter(w);counter-increment:w;position:absolute;bottom:4px;inset-inline-end:10px;font:900 46px/1 ThSans;color:rgba(242,165,65,.16)}
.wounds .dot{display:none}
.wounds .w-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:2px}
.wounds .w-lab{font-weight:900;color:var(--amber);font-size:var(--body)}
.wounds .w-when{font:900 var(--h3) ThSans;color:var(--white)}
.wounds .w-where{color:var(--amber)}
.wounds li.martyr{background:var(--orange);border-top-color:var(--white);color:#1A0C04}
.wounds li.martyr:before{content:none}
.wounds li.martyr .w-lab,.wounds li.martyr .w-when{color:#1A0C04}
.wounds li.martyr .w-when{font-size:var(--life)}
.career p,.qual li,.wounds p{color:#C9D1DC}.key{color:var(--white)}
.wounds li.martyr p{color:#1A0C04;font-weight:900;font-size:var(--body)}
.wounds.c6{grid-template-columns:repeat(6,1fr)}.wounds.stack .w-head{display:block}.wounds.stack .w-lab,.wounds.stack .w-when{display:block}
.prow{display:grid;grid-template-columns:auto auto 1fr;gap:20px;border-top:2px solid rgba(242,165,65,.3);padding-top:8px}
.prow span{display:block;font:900 var(--small) ThSans;color:var(--amber)}.prow b{display:block;font:700 var(--body)/1.4 ThSans;color:var(--white)}
.foot{position:absolute;text-align:center}.foot .verse{color:var(--white);font-size:var(--verse);text-shadow:0 2px 10px #000}.foot .vref{font:500 var(--small) ThSans;color:var(--mute);white-space:nowrap}
"""
def c2(fmt, ph):
    img = portrait(ph, 'p', '50% 22%')
    if fmt == 'sq':
        v = "--big:300px;--kick:20px;--rank:30px;--name:64px;--life:34px;--h3:24px;--body:16.5px;--small:15.5px;--verse:19px;--logo:84px;--kw:84px"
        body = f"""
<div class="big" style="left:-30px;top:330px">الكحلاني</div>
<div class="diag2" style="left:330px;top:0;width:80px;height:640px"></div>
<div class="cutwrap" style="left:0;top:40px;width:440px;height:500px">{img}</div>
<img class="logo" src="../assets/logo.png" style="left:30px;top:30px">
<div style="position:absolute;right:44px;width:590px;top:24px;height:504px;display:flex;flex-direction:column;justify-content:space-between">
 <div class="title"><div class="kick">{E(KICKER)}</div><span class="rank">{E(RANK)}</span>
 <div class="name">{E(NAME_L1)}<br>{E(NAME_L2)}</div><div class="life"><span class="num">{BORN}</span><i></i><span class="num">{MARTYR}</span></div></div>
 <div class="prow">{''.join(f'<div><span>{E(k)}</span><b>{D(v)}</b></div>' for k, v in PERSONAL)}</div>
 {sec('التأهيل العسكري', qual())}
</div>
<div class="diag" style="left:24px;top:540px;width:1032px;height:5px"></div>
<div style="position:absolute;right:40px;left:40px;top:556px;bottom:24px;display:flex;flex-direction:column;justify-content:space-between">
 {sec('المسيرة الميدانية', career('cols2'))}
 {wounds().replace('class="wounds ', 'class="wounds " style="grid-template-columns:repeat(3,1fr)" ')}
</div>"""
    else:
        v = "--big:420px;--kick:24px;--rank:34px;--name:80px;--life:40px;--h3:27px;--body:20px;--small:18.5px;--verse:25px;--logo:100px;--kw:96px"
        body = f"""
<div class="big" style="right:-40px;top:330px">الكحلاني</div>
<div class="diag2" style="left:560px;top:0;width:110px;height:820px"></div>
<div class="cutwrap" style="left:30px;top:36px;width:640px;height:780px">{img}</div>
<img class="logo" src="../assets/logo.png" style="left:40px;top:40px">
<div style="position:absolute;right:66px;left:720px;top:40px;height:760px;display:flex;flex-direction:column;justify-content:space-between">
 <div class="title" style="white-space:nowrap"><div class="kick">{E(KICKER)}</div><span class="rank">{E(RANK)}</span>
 <div class="name">{E(NAME)}</div><div class="life"><span class="num">{BORN}</span><i></i><span class="num">{MARTYR}</span></div></div>
 <div class="prow">{''.join(f'<div><span>{E(k)}</span><b>{D(v)}</b></div>' for k, v in PERSONAL)}</div>
 <div style="display:grid;grid-template-columns:1.75fr 1fr;gap:40px">{sec('المسيرة الميدانية', career())}{sec('التأهيل العسكري', qual())}</div>
</div>
<div class="diag" style="left:0;top:822px;width:1920px;height:5px"></div>
<div style="position:absolute;right:66px;left:50px;top:846px">{wounds('stack c6')}</div>"""
    return C2, v, body

# =====================================================================================================
# 3 «الوثيقة» — historical memorial: warm archival paper, navy ink, oval portrait in double ring, ledger of wounds
C3 = """
.page{background:var(--paper) url(../assets/paper.jpg);background-size:cover;color:var(--ink)}
.page:before{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,transparent 55%,rgba(96,64,30,.28))}
.border{position:absolute;inset:22px;border:2px solid var(--ink);opacity:.85}
.border:after{content:"";position:absolute;inset:6px;border:1px solid var(--ink);opacity:.6}
.verse{color:var(--ink)}
.oval{position:absolute;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px var(--paper),0 0 0 5px var(--ink),0 0 0 11px var(--paper),0 0 0 12px #A0662B}
.oval img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) sepia(.38) contrast(1.12) brightness(1.04)}
.oval img.cut{object-position:50% 2%;background:#DCCDB5}
.kick{font:700 var(--kick) ThText;color:#8A4F1F}
.name{font:900 var(--name)/1.18 ThSerif;color:var(--ink)}
.rank{font:700 var(--rank) ThSerif;color:#8A4F1F}
.life{display:flex;align-items:center;justify-content:center;gap:14px;font:700 var(--life) ThSerif;color:var(--ink);white-space:nowrap}
.life i{font-style:normal;color:#A0662B;font-size:.7em}
.orn{display:flex;align-items:center;gap:12px;color:#A0662B}
.orn:before,.orn:after{content:"";flex:1;height:1px;background:currentColor}
.sec h3{font:700 var(--h3) ThSerif;color:#8A4F1F;border-bottom:1px solid rgba(31,42,68,.35);padding-bottom:4px;margin-bottom:8px}
.kv div{display:flex;gap:10px;font:500 var(--body)/1.6 ThText}.kv dt{color:#8A4F1F;flex:none;width:var(--kw)}
.qual li{font:500 var(--body)/1.55 ThText;padding-inline-start:14px;position:relative}
.qual li:before{content:"◆";position:absolute;inset-inline-start:0;font-size:.55em;top:.6em;color:#A0662B}
.qual li.badges{display:flex;gap:6px;flex-wrap:wrap;padding:4px 0}.qual li.badges:before{display:none}
.badge{border:1px solid var(--ink);padding:0 8px;font:500 var(--small) ThText}.badge b{color:#8A4F1F;margin-inline-start:6px}
.career li{display:flex;gap:8px;font:500 var(--body)/1.55 ThText;margin-bottom:5px}
.career .n{font:700 var(--body) ThSerif;color:#A0662B;font-style:normal;flex:none;width:24px}
.career .when{font-weight:700;color:#8A4F1F;margin-inline-end:6px}
.ledger .wounds li{display:grid;grid-template-columns:1fr;padding:6px 0;border-bottom:1px dashed rgba(31,42,68,.35);font:500 var(--small)/1.45 ThText}
.ledger .wounds .dot{display:none}
.ledger .wounds .w-head{display:flex;justify-content:space-between;align-items:baseline}
.ledger .wounds .w-lab{font-weight:700;color:#8A4F1F}
.ledger .wounds .w-when{font:700 var(--h3) ThSerif;color:var(--ink)}
.ledger .wounds .w-where{color:#6B5A44;font-weight:700}
.ledger .wounds li.martyr{border:0;background:var(--ink);color:var(--paper);padding:8px 12px;margin-top:8px}
.ledger .wounds li.martyr .w-lab,.ledger .wounds li.martyr .w-when{color:#F2A541}
.seal{position:absolute;display:flex;align-items:center;gap:14px;font:700 var(--body) ThSerif;color:#6B5A44}
.seal img{width:var(--logo);height:var(--logo);border-radius:50%;filter:sepia(.2);flex:none}
.career p,.qual li,.ledger .wounds p{color:#3E4A63}.key{color:var(--ink);font-family:ThText;font-weight:700}
.ledger .wounds li.martyr p{color:var(--paper)}
.prow{display:flex;justify-content:center;gap:26px;margin-top:8px;text-align:center}.prow span{display:block;font:700 var(--small) ThText;color:#8A4F1F}.prow b{display:block;font:700 var(--body)/1.35 ThText;color:var(--ink)}
"""
def c3(fmt, ph):
    img = portrait(ph, 'p', '54% 22%')
    if fmt == 'sq':
        v = "--kick:19px;--name:50px;--rank:28px;--life:30px;--h3:23px;--body:17.5px;--small:16px;--verse:22px;--logo:64px;--kw:86px"
        prow = ''.join(f'<div><span>{E(k)}</span><b>{D(v)}</b></div>' for k, v in PERSONAL)
        body = f"""
<div class="border"></div>
<div style="position:absolute;left:60px;right:60px;top:40px;text-align:center;font-size:var(--verse)">{verse(False)}</div>
<div class="oval" style="right:78px;top:104px;width:204px;height:258px">{img}</div>
<div style="position:absolute;right:316px;left:56px;top:104px;text-align:center">
 <div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div><div class="name">{E(NAME)}</div>
 <div class="orn" style="margin:6px 30px"><span class="life"><span class="num">{BORN}</span><i>✦</i><span class="num">{MARTYR}</span></span></div>
 <div class="prow">{prow}</div>
</div>
<div style="position:absolute;right:56px;left:56px;top:386px;bottom:44px;display:grid;grid-template-columns:1.4fr 1fr;gap:30px">
 <div style="display:flex;flex-direction:column;justify-content:space-between">{sec('المسيرة الميدانية', career())}{sec('التأهيل العسكري', qual())}</div>
 <div style="display:flex;flex-direction:column;justify-content:space-between"><div class="ledger">{sec('سجلّ الإصابات والتضحيات', wounds())}</div>
 <div class="seal" style="position:static"><img src="../assets/logo.png"><span>{E(CLOSING)}</span></div></div>
</div>"""
    else:
        v = "--kick:22px;--name:52px;--rank:30px;--life:32px;--h3:27px;--body:22px;--small:20.5px;--verse:34px;--logo:92px;--kw:120px"
        body = f"""
<div class="border"></div>
<div class="oval" style="right:110px;top:110px;width:340px;height:430px">{img}</div>
<div style="position:absolute;right:56px;width:450px;top:580px;text-align:center">
 <div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div><div class="name">{E(NAME_L1)}<br>{E(NAME_L2)}</div>
 <div class="orn" style="margin:10px 0"><span class="life"><span class="num">{BORN}</span><i>✦</i><span class="num">{MARTYR}</span></span></div>
 <div class="seal" style="position:static;justify-content:center;margin-top:18px"><img src="../assets/logo.png"><span>{E(CLOSING)}</span></div>
</div>
<div style="position:absolute;right:550px;left:70px;top:70px;text-align:center;font-size:var(--verse)">{verse()}</div>
<div style="position:absolute;right:550px;left:70px;top:190px;display:grid;grid-template-columns:1fr 1.32fr 1.12fr;gap:44px">
 <div>{sec('البيانات الشخصية', personal())}<div style="height:16px"></div>{sec('التأهيل العسكري', qual())}</div>
 <div>{sec('المسيرة الميدانية', career())}</div>
 <div class="ledger">{sec('سجلّ الإصابات والتضحيات', wounds())}</div>
</div>"""
    return C3, v, body

# =====================================================================================================
# 4 «الضوء الأخير» — modern cinematic: full-bleed graded photo, letterbox, glass panels, film-strip of wounds
C4 = """
.page{background:#070D17}
.bleed{position:absolute;overflow:hidden}
.bleed img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.0) saturate(.88) brightness(.93)}
.bleed img.cut{object-fit:cover;object-position:50% 0;background:radial-gradient(60% 55% at 50% 30%,#2E4A68,#070D17 75%)}
.bleed:after{content:"";position:absolute;inset:0;background:var(--grad)}
.light{position:absolute;inset:0;background:radial-gradient(40% 35% at var(--lx) 26%,rgba(242,165,65,.16),transparent 70%);mix-blend-mode:screen}
.bar{position:absolute;left:0;right:0;height:var(--bar);background:#000;z-index:4}
.name{font:900 var(--name)/1.04 ThSans;color:var(--white);text-shadow:0 8px 40px rgba(0,0,0,.7)}
.kick{font:700 var(--kick) ThSans;color:var(--amber);letter-spacing:.06em}
.rank{font:700 var(--rank) ThSerif;color:var(--white);opacity:.9}
.life{display:flex;gap:14px;align-items:baseline;margin-top:10px;font:700 var(--life) ThSans;color:var(--white)}
.life .sep{color:var(--orange)}
.glass{position:absolute;background:rgba(15,27,45,.66);border:1px solid rgba(244,233,216,.13);border-radius:14px;padding:14px 18px;backdrop-filter:blur(10px)}
.sec h3{font:700 var(--h3) ThSans;color:var(--amber);margin-bottom:6px}
.kv div{display:flex;gap:8px;font-size:var(--body);line-height:1.55}.kv dt{color:var(--mute);flex:none;width:var(--kw)}
.qual li{font-size:var(--body);line-height:1.5;padding-inline-start:12px;position:relative}
.qual li:before{content:"";position:absolute;inset-inline-start:0;top:.65em;width:5px;height:5px;border-radius:50%;background:var(--amber)}
.qual li.badges{display:flex;gap:6px;flex-wrap:wrap;padding:4px 0}.qual li.badges:before{display:none}
.badge{border-radius:99px;background:rgba(242,165,65,.16);padding:1px 10px;font-size:var(--small)}.badge b{color:var(--amber);margin-inline-start:5px}
.career li{display:flex;gap:8px;font-size:var(--body);line-height:1.5;margin-bottom:6px}
.career .n{font:900 var(--body) ThSans;color:var(--amber);font-style:normal;flex:none;width:24px}
.career .when{color:var(--amber);font-weight:700;margin-inline-end:5px}
.strip h3{font:700 var(--h3) ThSans;color:var(--amber);margin-bottom:12px}
.wounds{display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid rgba(244,233,216,.28)}
.wounds li{position:relative;padding:14px 12px 4px;border-inline-start:1px solid rgba(244,233,216,.16);font-size:var(--small);line-height:1.45}
.wounds li:first-child{border-inline-start:0;padding-inline-start:0}
.wounds .dot{position:absolute;top:-6px;inset-inline-start:12px;width:11px;height:11px;border-radius:50%;background:var(--amber)}
.wounds li:first-child .dot{inset-inline-start:0}
.wounds .w-lab{display:block;color:var(--mute);font-weight:700}
.wounds .w-when{display:block;font:900 var(--h3) ThSans;color:var(--white)}
.wounds .w-where{color:var(--amber)}
.wounds li.martyr{background:linear-gradient(180deg,rgba(255,138,61,.22),rgba(255,138,61,0))}
.wounds li.martyr .dot{background:var(--orange);box-shadow:0 0 18px var(--orange)}
.wounds li.martyr .w-lab{color:var(--orange)}.wounds li.martyr .w-when{font-size:var(--life);color:var(--orange)}
.foot{position:absolute}.foot .verse{color:var(--white);font-size:var(--verse)}.foot .vref{font:500 var(--small) ThSans;color:var(--mute)}
"""
def c4(fmt, ph):
    img = portrait(ph, 'p', '50% 4%' if fmt == 'sq' else '50% 16%')
    if fmt == 'sq':
        v = ("--name:60px;--kick:16px;--rank:24px;--life:28px;--h3:18px;--body:15px;--small:14px;--verse:19px;--bar:24px;--logo:80px;--kw:78px;--lx:24%;--cg:30px;"
             "--grad:linear-gradient(to left,#070D17 0%,rgba(7,13,23,.85) 22%,rgba(7,13,23,0) 50%),linear-gradient(to top,#070D17 22%,rgba(7,13,23,0) 52%)")
        body = f"""
<div class="bleed" style="left:0;top:0;width:640px;height:800px">{img}</div><div class="light"></div>
<img class="logo" src="../assets/logo.png" style="left:34px;top:44px">
<div style="position:absolute;right:46px;top:52px;width:580px">
 <div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div><div class="name">{E(NAME_L1)}<br>{E(NAME_L2)}</div>
 <div class="life"><span class="num">{BORN}</span><span class="sep">—</span><span class="num">{MARTYR}</span></div></div>
<div class="glass" style="right:46px;top:300px;width:600px;display:grid;grid-template-columns:200px 1fr;gap:20px">{sec('البيانات الشخصية', personal())}{sec('التأهيل العسكري', qual())}</div>
<div class="glass" style="right:40px;left:40px;top:526px">{sec('المسيرة الميدانية', career('cols2'))}</div>
<div class="strip" style="position:absolute;right:40px;left:40px;top:790px"><h3>الإصابات والتضحيات</h3>{wounds()}</div>
<div class="bar" style="top:0"></div><div class="bar" style="bottom:0"></div>"""
    else:
        v = ("--name:92px;--kick:20px;--rank:30px;--life:40px;--h3:21px;--body:17px;--small:15.5px;--verse:23px;--bar:36px;--logo:100px;--kw:92px;--lx:78%;"
             "--grad:linear-gradient(to right,#070D17 0%,rgba(7,13,23,.9) 22%,rgba(7,13,23,0) 56%),linear-gradient(to top,#070D17 22%,rgba(7,13,23,0) 50%)")
        body = f"""
<div class="bleed" style="right:0;top:0;width:980px;height:1080px">{img}</div><div class="light"></div>
<img class="logo" src="../assets/logo.png" style="left:50px;top:62px">
<div style="position:absolute;right:600px;top:70px;width:1100px">
 <div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div><div class="name">{E(NAME)}</div>
 <div class="life"><span class="num">{BORN}</span><span class="sep">—</span><span class="num">{MARTYR}</span></div></div>
<div class="glass" style="right:820px;top:350px;width:330px">{sec('البيانات الشخصية', personal())}<div style="height:12px"></div>{sec('التأهيل العسكري', qual())}</div>
<div class="glass" style="right:1170px;left:60px;top:350px">{sec('المسيرة الميدانية', career())}</div>
<div class="strip" style="position:absolute;right:60px;left:60px;top:812px"><h3>الإصابات والتضحيات</h3>{wounds()}</div>
<div class="bar" style="top:0"></div><div class="bar" style="bottom:0"></div>"""
    return C4, v, body

# =====================================================================================================
# 5 «الهدوء» — minimalist premium: flat navy, hairlines, small round portrait, quiet type, strict grid
C5 = """
.page{background:var(--navy)}
.round{position:absolute;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px var(--amber),0 0 0 10px var(--navy),0 0 0 11px rgba(242,165,65,.35)}
.round img{width:100%;height:100%;object-fit:cover}
.round img.cut{object-position:50% 4%;background:var(--steel)}
.kick{font:500 var(--small) ThSans;color:var(--mute);letter-spacing:.06em}
.name{font:700 var(--name)/1.2 ThSans;color:var(--white)}
.name b{font-weight:500;color:var(--amber)}
.life{font:500 var(--body) ThSans;color:var(--mute);margin-top:6px}.life .num{color:var(--white)}
.rule{position:absolute;height:1px;background:rgba(168,179,193,.25)}
.sec h3{font:500 var(--small) ThSans;color:var(--amber);letter-spacing:.06em;margin-bottom:10px}
.kv div{display:grid;grid-template-columns:var(--kw) 1fr;font-size:var(--body);line-height:1.7}.kv dt{color:var(--mute)}
.qual li{font-size:var(--body);line-height:1.6}
.qual li.badges{display:flex;flex-wrap:wrap;gap:4px 14px;color:var(--white)}
.badge{font-size:var(--body)}.badge b{display:none}
.qual li.badges:after{content:"— بدرجة امتياز";font-size:var(--body);color:var(--amber)}
.career li{display:grid;grid-template-columns:24px 1fr;column-gap:10px;font-size:var(--body);line-height:1.6;margin-bottom:7px}
.career .n{font:500 var(--small) ThSans;color:var(--mute);font-style:normal;padding-top:3px}
.career .when{color:var(--amber);margin-inline-end:6px}
.wounds li{padding:8px 0;border-top:1px solid rgba(168,179,193,.18);font-size:var(--small);line-height:1.5}
.wounds .dot{display:none}
.wounds .w-head{display:flex;justify-content:space-between;align-items:baseline}
.wounds .w-lab{color:var(--mute);font-weight:500}
.wounds .w-when{font:700 var(--body) ThSans;color:var(--white)}
.wounds .w-where{color:var(--amber)}
.wounds li.martyr{border-top:1px solid var(--orange)}
.wounds li.martyr .w-when,.wounds li.martyr .w-lab{color:var(--orange)}
.foot{position:absolute}.foot .verse{font-size:var(--verse);color:var(--white)}.foot .vref{font:500 var(--small) ThSans;color:var(--mute)}
"""
def c5(fmt, ph):
    img = portrait(ph, 'p', '54% 18%')
    if fmt == 'sq':
        v = "--name:40px;--body:16px;--small:14.5px;--verse:20px;--logo:64px;--kw:100px"
        body = f"""
<div class="round" style="right:64px;top:64px;width:156px;height:156px">{img}</div>
<div style="position:absolute;right:252px;top:80px;width:620px"><div class="kick">{E(KICKER)}</div>
 <div class="name"><b>{E(RANK)}</b> {E(NAME)}</div><div class="life"><span class="num">{BORN}</span> — <span class="num">{MARTYR}</span></div></div>
<img class="logo" src="../assets/logo.png" style="left:64px;top:76px">
<div class="rule" style="left:64px;right:64px;top:262px"></div>
<div style="position:absolute;right:64px;left:64px;top:290px;display:grid;grid-template-columns:1fr 1fr;gap:48px">
 <div>{sec('البيانات الشخصية', personal())}<div style="height:16px"></div>{sec('الإصابات والتضحيات', wounds())}</div>
 <div>{sec('المسيرة الميدانية', career())}<div style="height:12px"></div>{sec('التأهيل العسكري', qual())}</div>
</div>
<div class="foot" style="left:64px;right:64px;bottom:44px;text-align:center">{verse()}</div>"""
    else:
        v = "--name:52px;--body:18px;--small:16px;--verse:22px;--logo:76px;--kw:112px"
        body = f"""
<div class="round" style="right:90px;top:84px;width:200px;height:200px">{img}</div>
<div style="position:absolute;right:330px;top:104px;width:1100px"><div class="kick">{E(KICKER)}</div>
 <div class="name"><b>{E(RANK)}</b> {E(NAME)}</div><div class="life"><span class="num">{BORN}</span> — <span class="num">{MARTYR}</span></div></div>
<img class="logo" src="../assets/logo.png" style="left:90px;top:104px">
<div class="rule" style="left:90px;right:90px;top:334px"></div>
<div style="position:absolute;right:90px;left:90px;top:366px;display:grid;grid-template-columns:1fr 1.45fr 1.25fr;gap:64px">
 <div>{sec('البيانات الشخصية', personal())}<div style="height:22px"></div>{sec('التأهيل العسكري', qual())}</div>
 <div>{sec('المسيرة الميدانية', career())}</div>
 <div>{sec('الإصابات والتضحيات', wounds())}</div>
</div>
<div class="foot" style="right:90px;width:560px;bottom:60px">{verse()}</div>"""
    return C5, v, body

# =====================================================================================================
# 6 «خطّ العمر» — documentary infographic: one life-line by year; service on one side, wounds on the other
C6 = """
.page{background:var(--navy) url(../assets/navy.jpg);background-size:cover}
.page:before{content:"";position:absolute;inset:0;background:url(../assets/topo.png);background-size:1200px;opacity:.07}
.medal{position:absolute;border-radius:50%;overflow:hidden;box-shadow:0 0 0 4px var(--amber),0 14px 40px rgba(0,0,0,.6)}
.medal img{width:100%;height:100%;object-fit:cover}.medal img.cut{object-position:50% 4%;background:var(--steel)}
.kick{font:700 var(--small) ThSans;color:var(--amber)}
.name{font:900 var(--name)/1.12 ThSans;color:var(--white)}
.rank{font:700 var(--rank) ThSans;color:var(--amber)}
.life{font:700 var(--body) ThSans;color:var(--mute);margin-top:4px}.life .num{color:var(--white)}
.tg{position:absolute;display:grid}
.tg .yr{position:relative;z-index:2;display:flex;align-items:flex-start;justify-content:center}
.tg .yr b{font:900 var(--yr) ThSans;color:var(--navy);background:var(--amber);border-radius:99px;padding:2px 10px;line-height:1.25}
.tg .yr.last b{background:var(--orange)}
.tg .c,.tg .w{font-size:var(--small);line-height:1.45;color:var(--white)}
.tg .e{margin-bottom:6px}.tg .e:last-child{margin-bottom:0}
.tg .t{color:var(--amber);font-weight:900;margin-inline-end:6px}
.tg .w .t{color:var(--orange)}
.tg .w .pl{color:var(--mute);font-weight:700}
.tg .hd{font:900 var(--body) ThSans;color:var(--amber);padding-bottom:4px;border-bottom:2px solid rgba(242,165,65,.45)}
.tg .hd.w{color:var(--orange);border-color:rgba(255,138,61,.55)}
.tg .martyr{background:var(--orange);color:#1A0C04;border-radius:6px;padding:8px 14px;text-align:center}
.tg .martyr .t{color:#1A0C04}.tg .martyr .mdate{display:block;font:900 var(--yr) ThSans}
.badge{background:rgba(242,165,65,.15);padding:0 8px;border-radius:3px;margin-inline-end:4px;white-space:nowrap}.badge b{color:var(--amber);margin-inline-start:4px}
.foot{position:absolute}.foot .verse{color:var(--white);font-size:var(--verse)}.foot .vref{font:500 var(--small) ThSans;color:var(--mute)}
/* square: vertical spine */
.tg.v{grid-template-columns:1fr var(--yc) 1fr;column-gap:18px;row-gap:15px}
.tg.v:before{content:"";position:absolute;left:50%;top:40px;bottom:10px;width:3px;transform:translateX(-50%);background:linear-gradient(var(--amber),var(--orange));border-radius:2px}
/* landscape: horizontal spine */
.tg.h{grid-auto-flow:column;grid-template-rows:auto 64px auto;column-gap:22px}
.tg.h:before{content:"";position:absolute;left:0;right:0;top:var(--spine);height:3px;background:linear-gradient(to left,var(--amber),var(--orange));border-radius:2px}
.tg.h .yr{align-items:center}
.tg.h .c{align-self:end}
"""
def _e(title, txt, cls=''):
    t = f'<span class="t">{D(title)}</span>' if title else ''
    return f'<div class="e {cls}">{t}{txt}</div>'
def _wound(i):
    lab, when, where, txt = WOUNDS[i]
    title = f'{lab} · {when}' if when else lab
    pl = f'<span class="pl">{E(where)}:</span> ' if where else ''
    return _e(title, pl + D(txt))
def timeline_rows():
    badges = ''.join(f'<span class="badge">{E(b)} <b>امتياز</b></span>' for b in EXCELLENCE)
    c = CAREER
    rows = [
        ('1984', _e('الميلاد ' + BORN, D(PERSONAL[2][1]) + ' · ' + E(PERSONAL[1][1])), ''),
        ('2004', _e('', D(QUAL[0]) + ' ' + D(QUAL[1])) + _e('', badges), ''),
        ('2010', _e('', D(QUAL[5])), ''),
        ('2015', _e(c[0][0], D(c[0][1])) + _e('', D(c[1][1])) + _e(c[4][0], D(c[4][1])), _wound(0)),
        ('2016', _e(c[5][0], D(c[5][1])) + _e(c[2][0], D(c[2][1])) + _e('', D(c[3][1])), _wound(1)),
        ('2018', '', _wound(2)),
        ('2026', f'<div class="martyr"><span class="t">{E(MARTYRDOM[0])}</span><span class="mdate num">{MARTYRDOM[1]}</span>{E(MARTYRDOM[2])}</div>', _wound(3) + _wound(4)),
    ]
    return rows
def c6(fmt, ph):
    img = portrait(ph, 'p', '54% 18%')
    rows = timeline_rows()
    if fmt == 'sq':
        v = "--name:44px;--rank:22px;--body:17px;--small:15px;--yr:20px;--yc:86px;--verse:21px;--logo:80px"
        cells = '<div class="hd">الخدمة والقيادة</div><div></div><div class="hd w">الإصابات</div>'
        for i, (y, cc, ww) in enumerate(rows):
            cells += f'<div class="c">{cc}</div><div class="yr{" last" if i == len(rows)-1 else ""}"><b class="num">{y}</b></div><div class="w">{ww}</div>'
        body = f"""
<div class="medal" style="right:52px;top:46px;width:150px;height:150px">{img}</div>
<div style="position:absolute;right:226px;top:54px;width:640px"><div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div><div class="name">{E(NAME)}</div>
 <div class="life"><span class="num">{BORN}</span> — <span class="num">{MARTYR}</span></div></div>
<img class="logo" src="../assets/logo.png" style="left:40px;top:50px">
<div class="tg v" style="right:40px;left:40px;top:222px">{cells}</div>
<div class="foot" style="left:40px;right:40px;bottom:34px;text-align:center">{verse()}</div>"""
    else:
        v = "--name:62px;--rank:28px;--body:18px;--small:15px;--yr:24px;--verse:22px;--logo:96px;--spine:0px"
        weights = ['1fr', '1.25fr', '1fr', '2.3fr', '2.5fr', '1fr', '1.9fr']
        cells = ''
        for i, (y, cc, ww) in enumerate(rows):
            cells += f'<div class="c">{cc}</div><div class="yr{" last" if i == len(rows)-1 else ""}"><b class="num">{y}</b></div><div class="w" style="text-align:right">{ww}</div>'
        body = f"""
<div class="medal" style="right:80px;top:56px;width:190px;height:190px">{img}</div>
<div style="position:absolute;right:300px;top:66px;width:1100px"><div class="kick">{E(KICKER)}</div><div class="rank">{E(RANK)}</div><div class="name">{E(NAME)}</div>
 <div class="life"><span class="num">{BORN}</span> — <span class="num">{MARTYR}</span></div></div>
<img class="logo" src="../assets/logo.png" style="left:70px;top:66px">
<div class="tg h" id="tg" style="right:70px;left:70px;top:300px;grid-template-columns:{' '.join(weights)}">{cells}</div>
<div class="foot" style="left:70px;bottom:40px">{verse()}</div>
<script>/* put the spine through the year row */const g=document.getElementById('tg'),y=g.querySelector('.yr');g.style.setProperty('--spine',(y.offsetTop+y.offsetHeight/2-1)+'px')</script>"""
    return C6, v, body

CONCEPTS = {1: ('editorial', c1), 2: ('commander', c2), 3: ('archive', c3), 4: ('cinematic', c4), 5: ('minimal', c5), 6: ('timeline', c6)}

def build(n, fmt, ph):
    slug, fn = CONCEPTS[n]; css, v, body = fn(fmt, ph); W, H = dims(fmt)
    page = (f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{n}-{slug}</title>'
            f'<style>:root{{--W:{W}px;--H:{H}px}}{BASE}{css}</style></head>'
            f'<body><div class="page" style="{v}">{body}</div></body></html>')
    name = f'{n}-{slug}-{fmt}-{ph}.html'
    open(os.path.join(OUT, name), 'w').write(page); return name

if __name__ == '__main__':
    out = [build(n, fmt, ph) for n in CONCEPTS for fmt in ('sq', 'ls') for ph in ('focus', 'cut')]
    print(len(out), 'pages')
