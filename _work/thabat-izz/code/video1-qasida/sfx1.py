# restrained SFX under the voice (version B): only at structural moments; no music
import soundfile as sf, numpy as np
SR = 48000; SFX = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/sfxmk/'
v, sr = sf.read('voice_only.wav'); out = v.copy() if v.ndim == 2 else np.c_[v, v]
EV = [(1492, 24.92, 1.079, -20),   # into the confrontation
      (1286, 24.95, 0.594, -17),   # «فالكفرُ أتى»
      (2902, 41.50, 1.304, -19),   # the staff descends
      (1492, 45.12, 1.079, -21),   # into history
      (1687, 54.65, 0.06, -20),    # «قيصرَ» engraved
      (2350, 61.00, 0.457, -21),   # «كسرى»
      (2353, 76.30, 1.023, -22),   # «فتوحاتي»
      (784, 87.74, 0.123, -18),    # «يا دهرُ»
      (1286, 88.22, 0.594, -16),
      (1300, 90.34, 1.112, -15),   # «أحرِقْ»
      (2186, 91.62, 0.108, -17),   # «برصاصاتي»
      (1296, 92.70, 0.492, -21),   # rings of sound
      (2353, 95.80, 1.023, -20),   # «وثباتي» sealed
      (2350, 96.70, 0.457, -23)]   # devotional light
for sid, at, peak, db in EV:
    x, s2 = sf.read(SFX + f'{sid}.wav'); x = np.c_[x, x] if x.ndim == 1 else x[:, :2]
    st = at - peak; off = 0
    if st < 0: off = int(-st * SR); st = 0
    x = x[off:]; a = int(st * SR); n = min(len(x), len(out) - a)
    if n > 0: out[a:a + n] += x[:n] * 10 ** (db / 20)
pk = np.abs(out).max()
if pk > 0.89: out *= 0.89 / pk
sf.write('voice_sfx_raw.wav', out, SR); print('ok', round(pk, 3))
