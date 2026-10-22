#!/usr/bin/env python3
"""Builds tile-ar.html and tile-en.html (style tiles for the "Asia <-> Arabia" / bridge concept)
from the real prototype data package _work/site-v3/data/data.json. Run from anywhere."""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))          # _work/site-v3
D = json.load(open(os.path.join(ROOT, 'data', 'data.json'), encoding='utf-8'))
IMG = '../../'                                              # relative to the tile file
E = lambda s: html.escape(str(s), quote=True)

MONTHS = {'ar': ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
          'en': ['January','February','March','April','May','June','July','August','September','October','November','December']}
STOPS = ['tw','id','my','pk','af','om','ae','qa','kw','sa','ye','iq','sy','tr','eg','dz']   # the trade line, Asia -> Gulf -> Mediterranean/Africa

L = {
 'ar': dict(
  title='التجارة العربية الآسيوية · لوحة الطرق', issue='العدد 560 · أكتوبر 2026', langbtn='English', globe='اللغات',
  nav=['الأسواق','معارض دولية','منتجات وصناعات حديثة','المجلة','نادي رجال الأعمال','مقالات وأخبار','تواصل معنا'], menu='القائمة',
  h1='من مصانع آسيا<br>إلى أسواق العرب وأفريقيا', h1b="From Asia's factories to Arab and African markets",
  
  btn1='تصفّح العدد 560', btn2='معارض دولية',
  photo_cap='منتجات وصناعات حديثة',
  route_cap=lambda n: f'خط التجارة: 16 سوقاً من تايوان إلى الجزائر · {n:,} معرضاً دولياً من يناير 2027', shows_w=lambda n: f'{n:,} معرضاً',
  shelf_t='منتجات المعلنين', shelf_n=lambda p, c: f'{p} منتجاً من {c} شركة',
  shows_t='معارض دولية', shows_n=lambda n: f'كل المعارض: {n:,}', all_markets='كل الأسواق', details='التفاصيل', shows_btn='كل المعارض الدولية حسب السوق والمجال',
  sup_t='موردون من آسيا والعالم العربي', sup_n=lambda n: f'{n} شركة في العدد 560',
  from_tw='من تايوان', from_sy='من سورية', from_other='من ماليزيا وإندونيسيا وباكستان وتركيا والهند والسعودية',
  co_w=lambda n: f'{n} شركة' if n>=11 or n==1 else f'{n} شركات',
  ft_site='الموقع', ft_markets='الأسواق', ft_contact='تواصل معنا', 
  ft_links=['المجلة','معارض دولية','منتجات وصناعات حديثة','نادي رجال الأعمال','مقالات وأخبار','من نحن','أعلن معنا','تواصل معنا'],
  copy='© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة', ft_phone_l='الهاتف وتطبيقات المحادثة', ft_email_l='البريد الإلكتروني', ft_addr_l='العنوان',
  assist='مساعد AAT', assist2='محادثة 24 ساعة', since='منذ 1982',
 ),
 'en': dict(
  title='Arab Asian Trade · Route board', issue='Issue 560 · October 2026', langbtn='العربية', globe='Languages',
  nav=['Markets','International exhibitions','Products & modern industries','Magazine','Business Club','Articles & news','Contact'], menu='Menu',
  h1="From Asia's factories<br>to Arab and African markets", h1b='من مصانع آسيا إلى أسواق العرب وأفريقيا',
  
  btn1='Read issue 560', btn2='International exhibitions',
  photo_cap='Modern products and industries',
  route_cap=lambda n: f'The trade line: 16 markets from Taiwan to Algeria · {n:,} international trade shows from January 2027', shows_w=lambda n: f'{n:,} shows',
  shelf_t="Advertisers' products", shelf_n=lambda p, c: f'{p} products from {c} companies',
  shows_t='International exhibitions', shows_n=lambda n: f'All shows: {n:,}', all_markets='All markets', details='Details', shows_btn='All international exhibitions by market and field',
  sup_t='Suppliers from Asia and the Arab world', sup_n=lambda n: f'{n} companies in issue 560',
  from_tw='From Taiwan', from_sy='From Syria', from_other='From Malaysia, Indonesia, Pakistan, Türkiye, India and Saudi Arabia',
  co_w=lambda n: f'{n} companies' if n!=1 else '1 company',
  ft_site='Site', ft_markets='Markets', ft_contact='Contact us', 
  ft_links=['Magazine','International exhibitions','Products & modern industries','Business Club','Articles & news','About us','Advertise with us','Contact'],
  copy='© 2026 Arab Asian Trade Group · All rights reserved', ft_phone_l='Phone and chat apps', ft_email_l='Email', ft_addr_l='Address',
  assist='AAT Assistant', assist2='24-hour chat', since='Since 1982',
 )}

# official app logos (Simple Icons paths, as the current site uses) + original pictures for Botim/imo/BiP
APP_SVG = {
 'WhatsApp': ('#25D366', 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'),
 'Viber': ('#7360F2', 'M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z'),
 'LINE': ('#00C300', 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314'),
}
GLOBE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20"/></svg>'
CHAT = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'

def app_icons():
    out = []
    for a in D['config']['apps']:
        n = a['name']
        if n in APP_SVG:
            c, p = APP_SVG[n]
            out.append(f'<a href="{E(a["url"] or "#")}" title="{E(n)}" style="background:{c}"><svg viewBox="-5 -5 34 34" aria-hidden="true"><path fill="#fff" d="{p}"/></svg></a>')
        else:
            out.append(f'<button type="button" title="{E(n)}"><img src="{IMG}{a["icon"]}" alt="{E(n)}"></button>')
    return ''.join(out)

def origin_cc(c):
    s = (c['city']['en'] if isinstance(c['city'], dict) else c['city']) or ''
    for k, v in {'Taiwan':'tw','Syria':'sy','Malaysia':'my','Indonesia':'id','Pakistan':'pk','Turkey':'tr','India':'in','Saudi':'sa'}.items():
        if k in s: return v
    return None

def build(lang):
    T = L[lang]; rtl = lang == 'ar'; o = 'ar' if rtl else 'en'
    C = D['countries']; cats = D['cats']; fields = {f['id']: f for f in D['fields']}
    comps = [c for c in D['companies'] if c.get('cat') != 'event']
    n_prod = sum(len(c.get('products', [])) for c in D['companies']); n_pco = sum(1 for c in D['companies'] if c.get('products'))
    # ---- header
    nav = ''.join(f'<a href="#" class="{"on" if i==0 else ""}">{E(n)}</a>' for i, n in enumerate(T['nav']))
    header = f'''
<header class="hd">
 <div class="deck1"><div class="wrap">
  <div class="nameplate"><span>التجارة العربية الآسيوية</span><span class="sep">·</span><span dir="ltr">Arab Asian Trade</span><span class="sep">·</span><span lang="zh-TW">中阿商業雜誌</span></div>
  <div class="d1end"><span class="issue">{T['issue']}</span><a class="ph" href="tel:{E(D['config']['tel'])}" dir="ltr">{E(D['config']['phone'])}</a><a class="langbtn" href="#">{T['langbtn']}</a><a class="globe" href="#" title="{T['globe']}">{GLOBE}<span>{T['globe']}</span></a></div>
 </div></div>
 <div class="deck2"><div class="wrap">
  <a class="logo" href="#home"><img src="{IMG}img/brand/aat-logo-red.svg" alt="AAT · Ideas For Business"></a>
  <nav class="main">{nav}</nav>
  <button type="button" class="menubtn"><span class="bars"></span>{T['menu']}</button>
 </div></div>
</header>'''
    # ---- opening + route line
    m5 = next(m for m in D['modern'] if m.get('image') == 'img/modern/m5.jpg')
    stops = ''
    for cc in STOPS:
        n = C[cc]['shows']
        cnt = f'<span>{T["shows_w"](n)}</span>' if n else ''
        stops += f'<li><a class="stop" href="#market-{cc}"><img src="{IMG}{C[cc]["flag"]}" alt=""><span class="tx"><b>{E(C[cc][o])}</b>{cnt}</span></a></li>'
    opening = f'''
<section class="open" id="home">
 <div class="wrap open-grid">
  <div class="open-text">
   <h1>{T['h1']}</h1>
   <p class="h1b" dir="{'ltr' if rtl else 'rtl'}">{E(T['h1b'])}</p>
   <p class="lead">{E(D['about']['claim'][o])}</p>
   <div class="btns"><a class="btn btn-red" href="#magazine">{T['btn1']}</a><a class="btn btn-ghost" href="#exhibitions">{T['btn2']}</a></div>
  </div>
  <figure class="photo"><img src="{IMG}img/modern/m5.jpg" alt=""><figcaption><span>{E(T['photo_cap'])}</span><span class="cap2">{E(m5['name'][o])} · {E(C['my'][o])}</span></figcaption></figure>
 </div>
 <div class="wrap"><div class="route">
  <p class="route-cap"><span class="dot"></span>{E(T['route_cap'](len(D['shows'])))}</p>
  <ol class="stops">{stops}</ol>
 </div></div>
</section>'''
    # ---- shelf (moving products)
    tiles = ''
    picked = []
    for c in comps:
        for p in c.get('products', []):
            if p.get('img'): picked.append((c, p))
    picked = picked[:26]
    for c, p in picked:
        cc = origin_cc(c)
        flag = f'<img class="fl" src="{IMG}{C[cc]["flag"]}" alt="">' if cc and cc in C else ''
        logo = f'<img class="lg" src="{IMG}{c["logo"]}" alt="">' if c.get('logo') else ''
        city = c['city'][o] if isinstance(c['city'], dict) else c['city']
        tiles += f'<a class="tile" href="#company-{c["id"]}"><div class="pimg"><img src="{IMG}{p["img"]}" alt=""></div><div class="pn"><bdi>{E(p["n"])}</bdi></div><div class="pc">{logo}{flag}<span>{E(city)}</span></div></a>'
    shelf = f'''
<section class="sec band shelf-sec">
 <div class="wrap"><div class="sec-h"><h2>{T['shelf_t']}</h2><span class="rule"></span><span class="sec-n">{T['shelf_n'](n_prod, n_pco)}</span></div></div>
 <div class="shelf"><div class="track">{tiles}{tiles}</div></div>
</section>'''
    # ---- shows
    chips = f'<a class="chip on" href="#">{T["all_markets"]}</a>'
    for cc in STOPS:
        if C[cc]['shows']:
            chips += f'<a class="chip" href="#"><img src="{IMG}{C[cc]["flag"]}" alt="">{E(C[cc][o])}<span>{C[cc]["shows"]:,}</span></a>'
    exact = [s for s in D['shows'] if not s.get('approx') and s.get('city') and s['city'].get(o)]
    rows_sel = []
    for cc in ['ae','tr','dz','tw','sa','eg','my']:
        cand = sorted([s for s in exact if s['cc'] == cc and s['start'][:7] == s['end'][:7]], key=lambda s: s['start'])
        if cand: rows_sel.append(cand[0])
    rows_sel.sort(key=lambda s: s['start'])
    rows = ''
    for s in rows_sel[:7]:
        y, m, d1 = s['start'].split('-'); d2 = s['end'].split('-')[2]
        days = f'{int(d1)}–{int(d2)}' if d1 != d2 else f'{int(d1)}'
        mon = f'{MONTHS[lang][int(m)-1]} {y}'
        f = fields.get(s['field'], {})
        rows += f'''<div class="row">
   <div class="stamp"><b dir="ltr">{days}</b><span>{mon}</span></div>
   <div class="place"><img src="{IMG}{C[s['cc']]['flag']}" alt=""><div><b>{E(C[s['cc']][o])}</b><span>{E(s['city'][o])}</span></div></div>
   <div class="show"><h3><bdi>{E(s['name'])}</bdi></h3><span class="fld">{E(f.get(o, ''))}</span></div>
   <a class="btn btn-line" href="#show-{E(s['id'])}">{T['details']}</a>
  </div>'''
    shows = f'''
<section class="sec">
 <div class="wrap">
  <div class="sec-h"><h2>{T['shows_t']}</h2><span class="rule"></span><a class="sec-n" href="#exhibitions">{T['shows_n'](len(D['shows']))}</a></div>
  <div class="chips">{chips}</div>
  <div class="rows">{rows}</div>
  <p class="more"><a class="btn btn-sea" href="#exhibitions">{T['shows_btn']}</a></p>
 </div>
</section>'''
    # ---- suppliers by origin
    def lcard(c):
        logo = f'<div class="lg"><img src="{IMG}{c["logo"]}" alt=""></div>' if c.get('logo') else ''
        name = c['nameAr'] if (rtl and c.get('nameAr')) else c['company']
        city = c['city'][o] if isinstance(c['city'], dict) else c['city']
        cat = cats.get(c.get('cat'), {}).get(o, '')
        return f'<a class="lcard{"" if logo else " nologo"}" href="#company-{c["id"]}">{logo}<b><bdi>{E(name)}</bdi></b><span>{E(cat)}</span><span class="ct">{E(city)}</span></a>'
    tw = [c for c in comps if origin_cc(c) == 'tw']
    sy = [c for c in comps if origin_cc(c) == 'sy']
    other = [c for c in comps if origin_cc(c) in ('my','id','pk','tr','in','sa')]
    n_tw = sum(1 for c in comps if origin_cc(c) == 'tw'); n_sy = sum(1 for c in comps if origin_cc(c) == 'sy'); n_ot = sum(1 for c in comps if origin_cc(c) in ('my','id','pk','tr','in','sa'))
    def group(title, flag_cc, n, lst):
        fl = f'<img src="{IMG}{C[flag_cc]["flag"]}" alt="">' if flag_cc else ''
        return f'<h3 class="origin">{fl}{E(title)}<span>{T["co_w"](n)}</span></h3><div class="lgrid">{"".join(lcard(c) for c in lst)}</div>'
    suppliers = f'''
<section class="sec band">
 <div class="wrap">
  <div class="sec-h"><h2>{T['sup_t']}</h2><span class="rule"></span><span class="sec-n">{T['sup_n'](len(comps))}</span></div>
  {group(T['from_tw'], 'tw', n_tw, tw)}
  {group(T['from_sy'], 'sy', n_sy, sy)}
  {group(T['from_other'], None, n_ot, other)}
 </div>
</section>'''
    # ---- footer
    mk = ''.join(f'<li><a href="#market-{cc}">{E(C[cc][o])}</a></li>' for cc in STOPS)
    links = ''.join(f'<li><a href="#">{E(x)}</a></li>' for x in T['ft_links'])
    cfg = D['config']
    footer = f'''
<footer class="ft">
 <div class="wrap ft-grid">
  <div class="ft-brand"><img src="{IMG}img/brand/aat-logo-white.svg" alt="AAT · Ideas For Business"><p class="np"><span>التجارة العربية الآسيوية</span> · <span dir="ltr">Arab Asian Trade</span> · <span lang="zh-TW">中阿商業雜誌</span></p><p>{E(D['about']['heroLead'][o])}</p></div>
  <div class="ft-col"><h3>{T['ft_site']}</h3><ul>{links}</ul></div>
  <div class="ft-col markets"><h3>{T['ft_markets']}</h3><ul>{mk}</ul></div>
  <div class="ft-col"><h3>{T['ft_contact']}</h3>
   <a class="phone" href="tel:{E(cfg['tel'])}" dir="ltr">{E(cfg['phone'])}</a>
   <div class="apps">{app_icons()}</div>
   <p class="mail"><a href="mailto:{E(cfg['email'])}" dir="ltr">{E(cfg['email'])}</a></p>
   <p class="addr" dir="ltr">{E(cfg['address']['en'])}</p>
  </div>
 </div>
 <div class="ft-bottom"><div class="wrap"><span>{T['copy']}</span><span dir="ltr">AAT · Arab Asian Trade · www.aatworld.com</span></div></div>
</footer>
<a class="assist" href="#assistant">{CHAT}<span><span class="a1">{T['assist']}</span><br class="abr"><span class="a2">{T['assist2']}</span></span></a>'''
    page = f'''<!doctype html>
<html lang="{lang}" dir="{'rtl' if rtl else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(T['title'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Changa:wght@600;700;800&family=Readex+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500&display=swap&text=%E4%B8%AD%E9%98%BF%E5%95%86%E6%A5%AD%E9%9B%9C%E8%AA%8C" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
{header}
{opening}
{shelf}
{shows}
{suppliers}
{footer}
</body>
</html>'''
    with open(os.path.join(HERE, f'tile-{lang}.html'), 'w', encoding='utf-8') as fh:
        fh.write(page)
    print('wrote', f'tile-{lang}.html', len(page))

CSS = r'''
:root{--paper:#FFFFFF;--ink:#14202A;--muted:#4A5A63;--sea:#0B3C49;--sea-pale:#E3EFF1;--line:#C9DADE;--red:#D21F26;--red-deep:#A5161C;--link:#0B57D0;
 --fd:'Changa',sans-serif;--fb:'Readex Pro',sans-serif}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fb);font-size:19px;line-height:1.8;font-variant-numeric:tabular-nums}
html[dir=ltr] body{line-height:1.6}
a{color:inherit;text-decoration:none}
a:hover{text-decoration:underline}
img{display:block;max-width:100%}
bdi{unicode-bidi:isolate}
.wrap{max-width:1760px;margin:0 auto;padding:0 40px}
h1,h2,h3{margin:0;font-family:var(--fd);line-height:1.3}
[lang=zh-TW]{font-family:'Noto Sans TC',var(--fb)}
p{margin:0}
/* header: two decks */
.deck1{background:var(--sea);color:#fff;font-size:17px;font-weight:500}
.deck1 .wrap{display:flex;align-items:center;justify-content:space-between;min-height:48px;gap:16px;flex-wrap:wrap}
.nameplate{display:flex;gap:12px;align-items:center;white-space:nowrap}
.nameplate .sep{opacity:.7}
.d1end{display:flex;gap:22px;align-items:center}
.d1end a{color:#fff}
.langbtn{border:2px solid #fff;border-radius:6px;padding:2px 14px;font-weight:600;font-size:17px;min-height:34px;display:inline-flex;align-items:center}
.globe{display:inline-flex;align-items:center;gap:8px}
.deck2{background:#fff;border-bottom:3px solid var(--sea)}
.deck2 .wrap{display:flex;align-items:center;gap:36px;min-height:96px}
.logo img{height:60px;width:auto}
nav.main{display:flex;gap:4px;flex-wrap:wrap;flex:1}
nav.main a{font-weight:600;font-size:20px;padding:8px 14px;border-bottom:4px solid transparent;line-height:1.4;white-space:nowrap}
nav.main a.on{border-bottom-color:var(--red);color:var(--red)}
nav.main a:hover{text-decoration:none;border-bottom-color:var(--sea)}
.menubtn{display:none}
/* opening: the route board */
.open{background:var(--sea);color:#fff;padding:44px 0 0}
.open-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:56px;align-items:center}
.open h1{font-size:56px;font-weight:800;line-height:1.3;color:#fff}
html[dir=ltr] .open h1{line-height:1.12}
.h1b{font-family:var(--fd);font-weight:600;font-size:30px;line-height:1.4;margin:12px 0 18px}
html[dir=rtl] .h1b{text-align:right}
html[dir=ltr] .h1b{text-align:left}
.open .lead{font-size:21px;line-height:1.8;max-width:820px;margin:0 0 30px}
.btns{display:flex;gap:16px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:10px 28px;border-radius:6px;font-weight:600;font-size:19px;border:2px solid transparent;line-height:1.3;text-align:center}
.btn:hover{text-decoration:none}
.btn-red{background:var(--red);color:#fff;border-color:var(--red)}
.btn-red:hover{background:var(--red-deep);border-color:var(--red-deep)}
.btn-ghost{border-color:#fff;color:#fff}
.btn-ghost:hover{background:#fff;color:var(--sea)}
.btn-sea{background:var(--sea);color:#fff;border-color:var(--sea)}
.btn-line{border-color:var(--sea);color:var(--sea);background:#fff}
.btn-line:hover{background:var(--sea);color:#fff}
.photo{margin:0;border:4px solid #fff;background:#fff}
.photo img{width:100%;height:360px;object-fit:cover}
.photo figcaption{background:#fff;color:var(--ink);padding:12px 18px;font-size:18px;font-weight:600;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;line-height:1.4}
.photo .cap2{color:var(--sea)}
.route{margin-top:40px;padding:24px 0 36px;border-top:1px solid rgba(255,255,255,.3)}
.route-cap{font-size:19px;font-weight:600;margin:0 0 20px;display:flex;gap:12px;align-items:center;line-height:1.5}
.route-cap .dot{width:16px;height:16px;border-radius:50%;background:var(--red);flex:none;box-shadow:0 0 0 3px #fff}
.stops{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(16,minmax(0,1fr));gap:6px;position:relative}
.stops:before{content:"";position:absolute;left:3%;right:3%;top:21px;height:3px;background:rgba(255,255,255,.55)}
.stop{position:relative;text-align:center;display:block;padding-top:0;color:#fff}
.stop:hover{text-decoration:none}
.stop:hover b{text-decoration:underline}
.stop img{width:46px;height:31px;object-fit:cover;margin:0 auto 12px;border:2px solid #fff;border-radius:3px;position:relative;background:#fff;box-shadow:0 0 0 7px var(--sea)}
.stop b{display:block;font-size:18px;font-weight:600;line-height:1.35}
.stop span{display:block;font-size:17px;line-height:1.4}
/* sections */
.sec{padding:56px 0}
.band{background:var(--sea-pale)}
.sec-h{display:flex;align-items:center;gap:22px;margin:0 0 30px}
.sec-h:before{content:"";width:16px;height:16px;border-radius:50%;background:var(--red);flex:none}
.sec-h h2{font-size:38px;font-weight:700;line-height:1.3;white-space:nowrap}
.sec-h .rule{flex:1;height:2px;background:var(--line);min-width:24px}
.band .sec-h .rule{background:#fff}
.sec-h .sec-n{font-size:20px;font-weight:600;color:var(--sea);white-space:nowrap}
/* shelf */
.shelf{overflow:hidden}
.track{display:flex;gap:18px;width:max-content;animation:run-ltr 95s linear infinite;padding:4px 0}
html[dir=rtl] .track{animation-name:run-rtl}
.shelf:hover .track{animation-play-state:paused}
@keyframes run-ltr{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes run-rtl{from{transform:translateX(0)}to{transform:translateX(50%)}}
.tile{width:232px;background:#fff;border:1px solid var(--line);border-radius:6px;padding:14px;flex:none;display:block}
.tile:hover{text-decoration:none;border-color:var(--sea)}
.tile .pimg{height:160px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.tile .pimg img{max-height:160px;max-width:100%;width:auto;object-fit:contain}
.tile .pn{font-size:18px;font-weight:600;line-height:1.4;height:50px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.tile .pc{display:flex;align-items:center;gap:10px;margin-top:10px;font-size:17px;color:var(--muted);line-height:1.3}
.tile .pc .lg{height:28px;width:auto;max-width:84px}
.tile .pc .fl{width:26px;height:18px;object-fit:cover;border:1px solid var(--line);flex:none}
.tile .pc span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* chips + show rows */
.chips{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 28px}
.chip{display:inline-flex;align-items:center;gap:10px;min-height:46px;padding:4px 16px;border:2px solid var(--line);border-radius:6px;font-size:18px;font-weight:600;background:#fff;color:var(--ink);line-height:1.3}
.chip:hover{text-decoration:none;border-color:var(--sea)}
.chip.on{background:var(--sea);border-color:var(--sea);color:#fff}
.chip img{width:28px;height:19px;object-fit:cover;border:1px solid var(--line)}
.chip span{font-weight:500;color:var(--muted);font-size:17px}
.rows{border-top:3px solid var(--sea)}
.row{display:grid;grid-template-columns:140px 270px minmax(0,1fr) auto;gap:28px;align-items:center;padding:16px 0;border-bottom:1px solid var(--line)}
.stamp{border:2px solid var(--sea);border-radius:6px;text-align:center;padding:4px 8px 8px}
.stamp b{display:block;font-family:var(--fd);font-size:32px;font-weight:700;line-height:1.15;color:var(--sea)}
.stamp span{display:block;font-size:17px;font-weight:600;line-height:1.3}
.place{display:flex;align-items:center;gap:12px}
.place img{width:48px;height:32px;object-fit:cover;border:1px solid var(--line);flex:none}
.place b{display:block;font-size:19px;font-weight:600;line-height:1.3}
.place span{display:block;font-size:17px;color:var(--muted);line-height:1.3}
.show h3{font-family:var(--fb);font-size:22px;font-weight:600;line-height:1.35}
.show .fld{display:inline-block;margin-top:6px;font-size:17px;font-weight:500;background:var(--sea-pale);color:var(--sea);padding:2px 12px;border-radius:4px;line-height:1.5}
.more{margin-top:28px}
/* suppliers by origin */
.origin{display:flex;align-items:center;gap:14px;margin:34px 0 16px;font-family:var(--fb);font-size:22px;font-weight:600;flex-wrap:wrap}
.origin img{width:40px;height:27px;object-fit:cover;border:1px solid var(--line)}
.origin span{font-size:18px;color:var(--muted);font-weight:500}
.lgrid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:16px}
.lcard{background:#fff;border:1px solid var(--line);border-radius:6px;padding:18px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;min-height:210px;min-width:0}
.lcard:hover{text-decoration:none;border-color:var(--sea)}
.lcard .lg{height:64px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.lcard .lg img{max-height:64px;max-width:100%;width:auto}
.lcard b{font-size:18px;font-weight:600;line-height:1.4}
.lcard span{font-size:17px;color:var(--muted);margin-top:6px;line-height:1.4}
.lcard .ct{color:var(--sea);font-weight:500}
.lcard.nologo{justify-content:center}
.lcard.nologo b{font-family:var(--fd);font-size:24px;font-weight:700;line-height:1.25;color:var(--sea)}
/* footer */
.ft{background:var(--sea);color:#fff;padding:56px 0 0}
.ft-grid{display:grid;grid-template-columns:1.3fr .9fr 1fr 1.3fr;gap:40px}
.ft-brand img{height:64px;width:auto;margin-bottom:18px}
.ft-brand .np{font-weight:600;font-size:19px;margin-bottom:8px}
.ft-brand .np span{white-space:nowrap;display:inline-block}
.ft-brand p{font-size:18px;line-height:1.7}
.ft h3{font-family:var(--fd);font-size:24px;font-weight:700;margin-bottom:12px}
.ft a{color:#fff}
.ft ul{list-style:none;margin:0;padding:0;font-size:18px;line-height:1.75}
.ft .markets ul{columns:2;column-gap:24px}
.ft .phone{font-size:26px;font-weight:700;display:block;margin-bottom:12px;font-family:var(--fd)}
.apps{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 16px}
.apps a,.apps button{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:0;padding:0;overflow:hidden;background:#fff;cursor:pointer}
.apps svg{width:46px;height:46px}
.apps img{width:46px;height:46px;object-fit:cover}
.ft .mail{font-size:19px;margin-bottom:8px}
.ft .addr{font-size:18px;line-height:1.6}
html[dir=rtl] .ft .addr,html[dir=rtl] .ft .mail{text-align:right}
.ft-bottom{border-top:1px solid rgba(255,255,255,.3);margin-top:44px;padding:18px 0;font-size:17px}
.ft-bottom .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
/* assistant */
.assist{position:fixed;bottom:20px;inset-inline-end:20px;background:var(--sea);color:#fff;border:2px solid #fff;border-radius:8px;padding:10px 18px;display:flex;gap:12px;align-items:center;box-shadow:0 6px 20px rgba(0,0,0,.3);font-weight:600;font-size:18px;line-height:1.3;z-index:50}
/* laptops: the trade line becomes two rows of stop cards */
@media(max-width:1500px){
 .deck2 .wrap{gap:22px}
 nav.main{gap:0}
 nav.main a{padding:8px 9px;font-size:19px}
 .stops{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
 .stops:before{display:none}
 .stop{display:flex;align-items:center;gap:14px;text-align:start;padding:8px 12px;border:1px solid rgba(255,255,255,.4);border-radius:6px;min-width:0;overflow:hidden}
 .stop img{margin:0;box-shadow:none;width:46px;height:31px;flex:none}
 .stop .tx{min-width:0;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
 .stop b,.stop span{white-space:nowrap}
}
@media(max-width:1100px){
 .stops{grid-template-columns:repeat(2,minmax(0,1fr))}
}
/* mid widths */
@media(max-width:1180px){
 .lgrid{grid-template-columns:repeat(4,minmax(0,1fr))}
 .ft-grid{grid-template-columns:1fr 1fr}
}
/* phone */
@media(max-width:640px){
 .wrap{padding:0 16px}
 .deck1 .issue,.deck1 .ph,.globe span{display:none}
 .deck1 .wrap{min-height:44px}
 .nameplate{font-size:16px;gap:8px}
 .nameplate span[lang],.nameplate span[dir],.nameplate .sep{display:none}
 .deck2 .wrap{min-height:76px;gap:12px;justify-content:space-between}
 .logo img{height:46px}
 nav.main{display:none}
 .menubtn{display:inline-flex;align-items:center;gap:10px;background:var(--red);color:#fff;border:0;border-radius:6px;font:600 18px var(--fb);padding:0 18px;min-height:48px}
 .menubtn .bars{width:22px;height:3px;background:#fff;box-shadow:0 -7px 0 #fff,0 7px 0 #fff;display:block}
 .open{padding-top:32px}
 .open-grid{grid-template-columns:1fr;gap:26px}
 .open h1{font-size:36px}
 .h1b{font-size:22px;margin:8px 0 14px}
 .open .lead{font-size:18px}
 .btns .btn{flex:1 1 100%}
 .photo img{height:220px}
 .photo figcaption{font-size:17px}
 .route{margin-top:30px;padding:22px 0 30px}
 .route-cap{font-size:18px}
 .stops{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 .stop .tx{display:block}
 .stop b,.stop span{white-space:normal}
 .stop{padding:6px 8px;gap:10px}
 .stop img{width:36px;height:24px}
 .stop b{font-size:17px}
 .stop span{font-size:16px}
 .sec{padding:40px 0}
 .sec-h{gap:14px;flex-wrap:wrap;margin-bottom:22px}
 .sec-h h2{font-size:28px;white-space:normal;flex:1 1 0;min-width:0}
 .sec-h .rule{display:none}
 .sec-h .sec-n{font-size:17px;white-space:normal;flex-basis:100%;padding-inline-start:30px}
 .tile{width:196px}
 .tile .pimg{height:130px}
 .tile .pimg img{max-height:130px}
 .chip{min-height:44px;padding:4px 12px;font-size:17px}
 .row{grid-template-columns:112px 1fr;gap:12px 14px}
 .stamp b{font-size:28px}
 .row .show{grid-column:1/-1}
 .row .btn{grid-column:1/-1;min-height:50px}
 .show h3{font-size:20px}
 .lgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .lcard{padding:14px 10px;min-height:0}
 .origin{font-size:20px}
 .ft{padding-top:40px}
 .ft-grid{grid-template-columns:1fr;gap:30px}
 .ft .markets ul{columns:2}
 .assist{bottom:14px;inset-inline-end:14px;padding:8px 14px;font-size:17px;gap:10px}
 .assist .a1,.assist .abr{display:none}
 .assist svg{width:24px;height:24px}
}
'''
for lg in ('ar', 'en'):
    build(lg)
