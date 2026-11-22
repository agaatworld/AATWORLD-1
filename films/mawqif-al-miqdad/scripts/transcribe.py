import json, sys
from faster_whisper import WhisperModel
model_name = sys.argv[1] if len(sys.argv) > 1 else "large-v3"
m = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4)
import soundfile as sf
audio, _sr = sf.read("/home/user/miqdad_film/source/audio_16k.wav", dtype="float32")
segs, info = m.transcribe(audio, language="ar", word_timestamps=True,
                          beam_size=5, vad_filter=False, condition_on_previous_text=True,
                          initial_prompt="المقداد رضي الله عنه، النبي صلى الله عليه وسلم، أشيروا علي أيها الناس، الأنصار، العقبة، أبو بكر الصديق، عمر الفاروق، اذهب أنت وربك فقاتلا إنا هاهنا قاعدون، ابن مسعود")
out = []
for s in segs:
    out.append({"start": s.start, "end": s.end, "text": s.text,
                "words": [{"w": w.word, "s": w.start, "e": w.end, "p": w.probability} for w in (s.words or [])]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}", flush=True)
json.dump(out, open(f"/home/user/miqdad_film/analysis/whisper_{model_name.replace('/','_')}.json", "w"), ensure_ascii=False, indent=1)
