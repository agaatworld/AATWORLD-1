"""EZICARGO ads for AAT magazine: centre spread (2 x A4) + cover box.
   python3 _work/ads/ezicargo/build.py      -> out/ (300 dpi JPG + PDF, with and without 3 mm bleed)"""
import json, os, re, subprocess
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
ui = open('../../../assets/js/ui.js', encoding='utf-8').read()
APP = json.loads(re.search(r'var APP_IC = (\{.*?\});', ui).group(1))

def svg(body, vb='0 0 24 24', fill='none', stroke='#fff', sw='1.9'):
    return '<svg viewBox="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (vb, fill, stroke, sw, body)
ICONS = {
    'FACTORY': svg('<path d="M3 21V10.5l5 3v-3l5 3v-3l5 3V4h3v17z"/><path d="M7 17h2M11 17h2M15 17h2"/>'),
    'TALK': svg('<path d="M4 5h11v7H9l-3.5 3V12H4z"/><path d="M15 9h5v7h-1.5v3L15 16h-3.5"/><path d="M7.5 8.5h4"/>'),
    'PALM': svg('<path d="M12 21c0-5 .5-8 2-11"/><path d="M14 10c-1.5-3-4.5-4-8-3 2.2.4 4 1.6 5 3.5"/><path d="M14 10c1-3 4-4.5 7-3.5-2.4.2-4.4 1.4-5.6 3.3"/><path d="M14 10c3 .2 5.3 2.3 5.6 5-1.4-1.7-3.4-2.8-5.6-3"/><path d="M3 21h18"/>'),
    'KEY': svg('<circle cx="8" cy="15" r="4.2"/><path d="M11 12l8.5-8.5M16.5 6.5l2.5 2.5M14 9l2 2"/>'),
    'MAIL': svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>', stroke='#D9B36C'),
    'WEB': svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>', stroke='#D9B36C'),
    'PIN': svg('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>', stroke='#D9B36C'),
}
def app(name):
    a = APP[name]
    return '<i style="background:%s"><svg viewBox="0 0 24 24" fill="#fff"><path d="%s"/></svg></i>' % (a['c'], a['p'])
APPS = app('WhatsApp') + '<i><img src="../../../assets/img/apps/imo.png" alt=""></i>' + app('Viber') + app('LINE')

def fill(src, dst):
    s = open(src, encoding='utf-8').read()
    for k, v in ICONS.items(): s = s.replace('{{%s}}' % k, v)
    s = s.replace('{{APPS}}', APPS)
    assert '{{' not in s, re.findall(r'\{\{\w+\}\}', s)
    open(dst, 'w', encoding='utf-8').write(s)

os.makedirs('out', exist_ok=True)
fill('spread.html', '_spread.html')
if os.path.exists('cover.html'): fill('cover.html', '_cover.html')
subprocess.run(['node', 'render.js'], check=True)
