"""One command for a release, so nothing is forgotten:
     python3 _work/tools/release.py 35        (local server on :8765 must be running for the magazine PDF)
   - version.txt            -> "AAT update 35 - <today>"
   - index.html ?v=...      -> new cache-buster (so browsers fetch the new css/js)
   - assets/js/config.js    -> window.AAT_UPDATE = 35 (old copies of the page reload themselves)
   - magazine PDF           -> rebuilt from the flipbook, link gets ?v=35
   - _release/aat-update-35.zip with the site files (never _work, never WordPress)"""
import datetime, os, re, subprocess, sys, zipfile
N = int(sys.argv[1]); root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(root)
today = datetime.date.today().isoformat()
open('version.txt', 'w').write('AAT update %d - %s\n' % (N, today))
h = open('index.html', encoding='utf-8').read()
old = re.search(r'\?v=(\d{8})([a-z]*)', h).group(0)
stamp = today.replace('-', '')
cur = re.search(r'\?v=(\d{8})([a-z]*)', h)
suffix = chr(ord(cur.group(2)[-1]) + 1) if cur.group(1) == stamp and cur.group(2) else 'a'
h = h.replace(old, '?v=' + stamp + suffix); open('index.html', 'w', encoding='utf-8').write(h)
c = open('assets/js/config.js', encoding='utf-8').read()
c = re.sub(r'window\.AAT_UPDATE = \d+;', 'window.AAT_UPDATE = %d;' % N, c); open('assets/js/config.js', 'w', encoding='utf-8').write(c)
subprocess.run(['node', '_work/tools/mag_pdf.js'], check=True)
subprocess.run(['python3', '_work/tools/mag_pdf.py'], check=True)
fs = ['index.html', 'version.txt', 'issue560/index.html', 'issue560/AAT-560-October-2026.pdf', 'members/list.php', 'members/hidden.json', 'api/subscribe.php']
for d in ['assets/css', 'assets/js', 'assets/img/apps']:
    for r, _, f in os.walk(d): fs += [os.path.join(r, x) for x in f]
os.makedirs('_release', exist_ok=True)
# two zips: the site (small) and the magazine PDF alone (big), so each can be sent in chat (limit ~30 MB); both extract into public_html
site = [f for f in fs if not f.endswith('.pdf')]
outs = [('_release/aat-update-%d.zip' % N, site), ('_release/aat-update-%d-pdf.zip' % N, ['issue560/AAT-560-October-2026.pdf'])]
for out, files in outs:
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in files:
            if os.path.exists(f): z.write(f)
    print('release', N, '?v=' + stamp + suffix, out, os.path.getsize(out) // 1024, 'KB')
