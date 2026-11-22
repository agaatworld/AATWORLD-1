"""Production boards as HTML (rendered to PNG with Chromium for correct Arabic shaping):
style sheet, character reference sheet, storyboard."""
import json, os, glob
ROOT = '/home/user/miqdad_film'
D = f'{ROOT}/docs'
film = json.load(open(f'{ROOT}/build/film.json'))
parts = json.load(open(f'{D}/ref/parts.json'))
from importlib.machinery import SourceFileLoader
COS = parts['costumes']; NAMES = parts['names']

CSS = """
@font-face{font-family:A;src:url(../art/fonts/amiri-arabic-700-normal.woff2)}
@font-face{font-family:N;src:url(../art/fonts/noto-naskh-arabic-arabic-600-normal.woff2)}
body{margin:0;background:#15161c;color:#eadfca;font-family:N,sans-serif;padding:36px;width:1900px}
h1{font:700 54px A,serif;margin:0 0 6px;color:#f3e6c8} h2{font:700 30px A,serif;color:#d9b56a;margin:28px 0 12px;border-bottom:1px solid #3a3a46;padding-bottom:6px}
.row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-end}
.card{background:#1f2029;border:1px solid #33343f;border-radius:12px;padding:12px;text-align:center}
.card img{display:block;margin:0 auto;background:#2a3350}
.cap{font-size:17px;margin-top:6px;color:#cfc2a8} .en{font:14px sans-serif;color:#9a927f}
.sw{width:120px;height:70px;border-radius:8px;border:1px solid #444}
p,li{font-size:19px;line-height:1.6} .note{font:15px sans-serif;color:#b8ae98}
table{border-collapse:collapse} td{padding:6px 10px;border-bottom:1px solid #2c2d37;vertical-align:top}
"""

def page(name, title, body):
    open(f'{D}/{name}.html', 'w', encoding='utf-8').write(f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{CSS}</style></head><body><h1>{title}</h1>{body}</body></html>')

# ---------------- style sheet
bgs = ''.join(f'<div class="card"><img src="../art/bg/{b}_full.webp" width="260"><div class="cap">{c}</div></div>' for b, c in
              [('bg01', 'BG01 وادي ذَفِران — ليلًا'), ('bg02', 'BG02 أرض المعسكر'), ('bg03', 'BG03 موضع المشورة'), ('bg04', 'BG04 موقف المقداد'), ('bg05', 'BG05 الوادي قبيل الفجر')])
pal = [('#0f1630', 'سماء الليل'), ('#2b3550', 'ظل القمر'), ('#7d6a52', 'صخر بازلت/رملي'), ('#c2a27a', 'حصى الوادي'), ('#ff9a46', 'ضوء النار'),
       ('#ffd08a', 'جمر'), ('#e8c99a', 'ضوء الفجر'), ('#d9b56a', 'ذهبي العنوان')]
sw = ''.join(f'<div class="card"><div class="sw" style="background:{c}"></div><div class="cap">{n}</div><div class="en">{c}</div></div>' for c, n in pal)
props = ''.join(f'<div class="card"><img src="../art/props/{p}.webp" style="max-height:150px;max-width:220px"><div class="en">{p}</div></div>' for p in
                ['tent_a', 'tent_b', 'campfire', 'waterskin', 'bedroll', 'bundle', 'rope', 'bowl', 'sword', 'shield', 'saddlebags'])
fx = ''.join(f'<div class="card"><img src="../art/fx/{p}.webp" style="max-height:150px;max-width:200px"><div class="en">{p}</div></div>' for p in
             ['flame_00', 'flame_04', 'flame_08', 'moon', 'smoke', 'dust_02', 'dust_05'])
page('style_sheet', 'ورقة الأسلوب — موقف المقداد رضي الله عنه', f"""
<p>المبدأ: شخصيات بسيطة جدًا (رجال عصويون بعمائم ولحى، رؤوس بلا ملامح)، وعالم مرسوم بغنى: خلفيات مرسومة يدويًا بأسلوب الغواش في أفلام الأنمي السينمائية اليابانية.
الشخصيات والخيول والأدوات «سِلّ» مرسوم بخط حبر وحبيبات غواش، تُركَّب فوق الخلفيات طبقاتٍ منفصلة بشفافية حقيقية.</p>
<h2>الخلفيات (بلا أشخاص ولا حيوانات ولا أدوات ولا نصوص) — جغرافيا واحدة متصلة</h2><div class="row">{bgs}</div>
<h2>لوحة الألوان والإضاءة</h2><div class="row">{sw}</div>
<p class="note">Night grade: sprite multiply rgb(0.50,0.57,0.78) + warm firelight falloff; dawn grade rgb(0.80,0.78,0.86) + horizon warmth. One moon sprite reused for every night plate (baked moons painted out).</p>
<h2>الأدوات التاريخية (الحجاز، القرن السابع)</h2><div class="row">{props}</div>
<h2>المؤثرات</h2><div class="row">{fx}</div>
<h2>قواعد ثابتة</h2><ul>
<li>النبي ﷺ لا يظهر أبدًا: لا شخص ولا ظل ولا يد ولا نور على هيئة إنسان؛ يُفهم موضعه من اتجاه الصحابة إلى نقطة خارج الإطار.</li>
<li>الوجوه: رأس واضح بلا عيون ولا حواجب ولا أنف ولا فم — اللحية وحدها. التمثيل بالجسد واليد والرأس فقط، بلا تحريك فم.</li>
<li>لا موسيقى إطلاقًا: صوت الشيخ الأصلي + مؤثرات طبيعية خفيفة، ولا مؤثرات أثناء الآية الكريمة.</li>
<li>لا معركة ولا أحداث مخترعة؛ اللقطات تتبع نص السرد وتوقيته.</li></ul>
<h2>الخط</h2><div class="row"><div class="card" style="padding:20px 30px"><div style="font:700 80px A,serif;color:#f6ead0">موقف المقداد</div><div class="en">Amiri Bold — title</div></div>
<div class="card" style="padding:20px 30px"><div style="font:600 44px N,serif">أشيروا عليَّ أيها الناس</div><div class="en">Noto Naskh Arabic 600 — subtitles</div></div></div>
""")

# ---------------- character sheet
def turn(who, big=True):
    w = 200 if big else 120
    cells = ''.join(f'<div class="card"><img src="ref/{who}_{v}.png" style="max-height:{360 if big else 210}px;max-width:{w}px"><div class="en">{v}</div></div>' for v in ['profile', 'threeq', 'front', 'kneel'])
    head = f'<div class="card"><img src="ref/{who}_head.png" width="{240 if big else 150}"><div class="en">head ×4 — beard only</div></div>'
    c = COS[who]
    sw = ''.join(f'<span title="{k}" style="display:inline-block;width:26px;height:26px;border-radius:5px;background:{c[k]};margin:2px;border:1px solid #555"></span>'
                 for k in ['turban', 'beard', 'skin', 'robe', 'cloak', 'sash'] if c.get(k))
    return f'<h2>{NAMES[who]} <span class="en">({who})</span></h2><div class="row">{cells}{head}<div class="card">{sw}<div class="en">turban · beard · skin · robe · cloak · sash</div></div></div>'

keyposes = ''
for seq, idxs in [('stand_up', [0, 3, 6, 9, 12, 16]), ('chest', [0, 5, 10]), ('chest_to_open', [2, 6, 12]), ('step', [3, 6, 12])]:
    for i in idxs:
        keyposes += f'<div class="card"><img src="../art/chars/miqdad/{seq}/{i:03d}.webp" style="max-height:300px;max-width:200px"><div class="en">{seq} #{i}</div></div>'
extras = ''.join(f'<div class="card"><img src="ref/{w}_threeq.png" style="max-height:220px"><div class="cap">{NAMES[w]}</div><div class="en">{w}</div></div>' for w in
                 ['muh1', 'muh2', 'muh3', 'ans1', 'ans2', 'ans3', 'ans4', 'ans5'])
horses = ''.join(f'<div class="card"><img src="ref/horse_{c}.png" width="420"><div class="cap">{n}</div></div>' for c, n in
                 [('bay', 'فرس المقداد — كُمَيت داكن (bay)'), ('chestnut', 'فرس ثانية — أشقر/كستنائي (chestnut)')])
page('character_sheet', 'ورقة الشخصيات المرجعية', turn('miqdad') + f'<h2>وضعيات المقداد المفتاحية — من رسومات الحركة الفعلية</h2><div class="row">{keyposes}</div>' +
     turn('abubakr') + turn('umar') + turn('ibnmasud') + f'<h2>بقية الصحابة (المهاجرون والأنصار)</h2><div class="row">{extras}</div>' +
     f'<h2>الخيل (لم يكن مع المسلمين يوم بدر إلا فرسان أو ثلاثة، أحدها للمقداد)</h2><div class="row">{horses}</div>' +
     '<p class="note">Rig rules: head = plain shaded ellipse; beard = the only facial shape, oriented with head turn; no code path draws eyes, brows, nose, mouth or ears. Proportions/costume fixed per character in costumes.py.</p>')

# ---------------- storyboard (thumbnails come from real renders of the film)
rows = ''
for s in film['shots']:
    mid = (s['t0'] + s['t1']) / 2
    cues = ' / '.join(''.join(r[0] for r in c[2]) for c in film['cues'] if c[0] < s['t1'] and c[1] > s['t0'])
    thumbs = ''.join(f'<img src="story/{s["name"]}_{k}.jpg" width="150" style="margin-left:6px;border-radius:6px">' for k in ('a', 'b', 'c'))
    rows += f'<tr><td style="white-space:nowrap"><b>{s["name"]}</b><br><span class="en">{s["t0"]:.2f}–{s["t1"]:.2f}s</span></td><td>{thumbs}</td><td style="width:520px">{cues}<div class="note">{s.get("note", "")}</div></td></tr>'
page('storyboard', 'لوحة القصة — اللقطات بتوقيت السرد', f'<table>{rows}</table>')
print('boards written')
