"""Bundle the film. dev: assets by relative URL (serve /home/user/miqdad_film). final: everything inline as data URIs."""
import json, base64, os, sys, glob

ROOT = '/home/user/miqdad_film'
mode = sys.argv[1] if len(sys.argv) > 1 else 'dev'
out = sys.argv[2] if len(sys.argv) > 2 else (f'{ROOT}/build/dev.html' if mode == 'dev' else '/home/user/mawqif_al_miqdad.html')

film = json.load(open(f'{ROOT}/build/film.json'))
cman = json.load(open(f'{ROOT}/art/chars/manifest.json'))
hman = json.load(open(f'{ROOT}/art/horses/manifest.json'))

MIME = {'.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2'}
def src(path):
    if mode == 'dev':
        return os.path.relpath(path, f'{ROOT}/build')
    ext = os.path.splitext(path)[1]
    return f'data:{MIME[ext]};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

assets = {}
used_chars, used_horses, used_imgs = {}, {}, set()
for s in film['shots']:
    for e in s['els']:
        if e['type'] == 'char':
            for a in e['acts']:
                used_chars.setdefault(e['who'], set()).add(a['seq'])
        elif e['type'] == 'horse':
            for a in e['acts']:
                used_horses.setdefault(e['coat'], set()).add(a['seq'])
        elif e['type'] == 'img':
            used_imgs.add(e['img'])
for k in used_imgs:
    assets[k] = src(f'{ROOT}/art/{k}.webp')
for k in ['props/campfire', 'fx/moon', 'fx/glow', 'fx/ember', 'fx/smoke'] + [f'fx/flame_{i:02d}' for i in range(12)]:
    assets[k] = src(f'{ROOT}/art/{k}.webp')

man = {'chars': {}, 'horses': {}}
for who, seqs in used_chars.items():
    man['chars'][who] = {'H': cman[who]['H'], 'seqs': {}}
    for sq in seqs:
        frames = cman[who]['seqs'][sq]
        man['chars'][who]['seqs'][sq] = frames
        for fr in frames:
            assets['chars/' + fr['f'].replace('.webp', '')] = src(f"{ROOT}/art/chars/{fr['f']}")
for coat, seqs in used_horses.items():
    man['horses'][coat] = {'H': hman[coat]['H'], 'seqs': {}}
    for sq in seqs:
        frames = hman[coat]['seqs'][sq]
        man['horses'][coat]['seqs'][sq] = frames
        for fr in frames:
            assets['horses/' + fr['f'].replace('.webp', '')] = src(f"{ROOT}/art/horses/{fr['f']}")
assets['audio/narration'] = src(f'{ROOT}/audio/narration.mp3')
assets['audio/sfx'] = src(f'{ROOT}/audio/sfx.mp3')

def font(fn):
    return 'data:font/woff2;base64,' + base64.b64encode(open(f'{ROOT}/art/fonts/{fn}', 'rb').read()).decode()

html = open(f'{ROOT}/build/player_template.html', encoding='utf-8').read()
html = html.replace('__FONT_AMIRI_B__', font('amiri-arabic-700-normal.woff2'))
html = html.replace('__FONT_AMIRI_R__', font('amiri-arabic-400-normal.woff2'))
html = html.replace('__FONT_AMIRI_Q__', font('amiri-quran-arabic-400-normal.woff2'))
html = html.replace('__FONT_NASKH__', font('noto-naskh-arabic-arabic-600-normal.woff2'))
html = html.replace('__ASSETS_JSON__', json.dumps(assets, separators=(',', ':')))
html = html.replace('__FILM_JSON__', json.dumps(film, ensure_ascii=False, separators=(',', ':')))
html = html.replace('__MANIFEST_JSON__', json.dumps(man, separators=(',', ':')))
open(out, 'w', encoding='utf-8').write(html)
print(mode, out, f'{os.path.getsize(out)/1e6:.2f} MB', 'assets', len(assets))
