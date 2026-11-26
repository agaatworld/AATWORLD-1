# sonic logo «الكلمة مقاومة» — no music: whoosh (rings) → shimmer (ring/photo) → big impact (letters land) → glitter (gold sheen) → low rumble tail
import soundfile as sf, numpy as np
SR = 48000; DUR = 5.0; SFX = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/sfxmk/'
out = np.zeros((int(SR * DUR), 2))
def put(i, peak_at, peak_in, db, fade_end=None):
    x, sr = sf.read(SFX + f'{i}.wav'); x = np.c_[x, x] if x.ndim == 1 else x[:, :2]
    st = peak_at - peak_in; off = 0
    if st < 0: off = int(-st * SR); st = 0
    x = x[off:]; a = int(st * SR); n = min(len(x), len(out) - a)
    seg = x[:n] * 10 ** (db / 20)
    out[a:a + n] += seg
put(1492, 0.95, 1.079, -9)     # rings sweep
put(2350, 1.55, 0.457, -11)    # slate ring + photo iris
put(788, 2.25, 2.172, 0)       # letters land: the hit
put(2353, 2.90, 1.023, -9)     # gold sheen
put(1296, 2.30 + 0.35, 0.492, -15)  # low tail
t = np.arange(len(out)) / SR; f = np.clip((DUR - t) / 0.6, 0, 1); out *= f[:, None]
out /= max(1e-6, np.abs(out).max()) / 0.9
sf.write('sonic_raw.wav', out, SR)
print('ok')
