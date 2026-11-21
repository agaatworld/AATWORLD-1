# QC for the finished reels: size, fps, duration, loudness, true peak, music check (Demucs), frame sheet, frozen-frame check
import subprocess, json, sys, os, numpy as np, soundfile as sf
from PIL import Image, ImageDraw
S = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'; WK = S + 'fb4/work/qc/'; os.makedirs(WK, exist_ok=True)
rows = []
for f in sys.argv[1:]:
    nm = os.path.basename(f)[:-4]
    p = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate:format=duration', '-of', 'json', f], capture_output=True, text=True).stdout)
    v = [s for s in p['streams'] if s['codec_type'] == 'video'][0]; dur = float(p['format']['duration'])
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = [l for l in r.splitlines() if l.strip().startswith('I:')][-1].split()[1]; TP = [l for l in r.splitlines() if l.strip().startswith('Peak:')][-1].split()[1]
    # music check on the whole file (voice part and outro)
    wav = WK + nm + '.wav'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-ac', '2', '-ar', '44100', wav], check=True)
    subprocess.run(['python3', '-m', 'demucs', '--repo', S + 'demrepo', '-n', 'htdemucs', '--two-stems', 'vocals', '-o', WK + 'sep', wav], capture_output=True)
    vo, sr = sf.read(WK + f'sep/htdemucs/{nm}/vocals.wav'); no, _ = sf.read(WK + f'sep/htdemucs/{nm}/no_vocals.wav')
    db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    body_end = dur - 4.63 + 0.6
    vb, nb = vo[:int(body_end * sr)], no[:int(body_end * sr)]
    # frames: sheet + frozen check
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', 'fps=30,scale=108:192', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 192, 108).astype(np.float32); d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
    still = 0; mx = 0
    for x in d:
        still = still + 1 if x < 0.05 else 0; mx = max(mx, still)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-vf', 'fps=1.5,scale=216:384,tile=12x3', '-frames:v', '1', WK + nm + '_sheet.jpg'])
    rows.append((nm, f"{v['width']}x{v['height']}", v['r_frame_rate'], round(dur, 2), I, TP, round(db(vb) - db(nb), 1), mx))
    print(nm, rows[-1][1:], flush=True)
print('\nname | size | fps | dur s | LUFS | true peak | voice minus accompaniment dB (body) | longest still run (frames)')
for r in rows: print(' | '.join(str(x) for x in r))
