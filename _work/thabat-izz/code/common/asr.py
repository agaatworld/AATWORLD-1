import sys, json, os
os.environ['HF_HUB_DISABLE_XET'] = '1'
import soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel('large-v3', device='cpu', compute_type='int8')
for f in sys.argv[1:]:
    x, sr = sf.read(f)
    r, info = m.transcribe(x.astype('float32'), language='ar', beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
    out = []
    for s in r:
        out.append({'start': round(s.start, 2), 'end': round(s.end, 2), 'text': s.text.strip(), 'words': [[w.word.strip(), round(w.start, 2), round(w.end, 2), round(w.probability, 2)] for w in s.words]})
        print(f, round(s.start, 2), round(s.end, 2), s.text.strip(), flush=True)
    json.dump(out, open(f[:-4] + '.json', 'w'), ensure_ascii=False, indent=0)
