import wave, sys, json
from piper import PiperVoice
from piper.config import SynthesisConfig
v = PiperVoice.load("en-us-ryan-high.onnx")
lines = json.load(open("lines.json"))
ls = float(sys.argv[1]) if len(sys.argv) > 1 else 0.9
for k, t in lines.items():
    with wave.open(f"{k}.wav", "wb") as w:
        v.synthesize_wav(t, w, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.8))
    with wave.open(f"{k}.wav") as w: print(k, round(w.getnframes() / w.getframerate(), 2), t)
