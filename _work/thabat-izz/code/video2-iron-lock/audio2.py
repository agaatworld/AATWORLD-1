# voice with a strong hall echo that swells on the strong words, plus restrained impacts on word entrances (no music)
import soundfile as sf, numpy as np
from scipy.signal import butter, sosfilt
S = '/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/'
v, sr = sf.read(S + 'q2/voice.wav'); v = v if v.ndim == 2 else np.c_[v, v]
N = len(v) + int(sr * 1.2); out = np.zeros((N, 2))
out[:len(v)] += v
W = [('كحلان', 0.88, 0), ('عسير', 1.84, 1), ('مو', 2.28, 0), ('مو', 2.58, 1), ('طلعك', 2.92, 1), ('يا', 3.56, 1), ('حوثي', 3.74, 1),
     ('قافلة', 4.62, 2), ('حديد', 5.72, 2), ('ومندحة', 6.28, 2), ('حناشة', 6.86, 2)]
# echo send envelope: 0.55 base, 1.0 on strong words (onset → +0.55 s)
t = np.arange(len(v)) / sr; env = np.full(len(v), 0.55)
for w, s0, k in W:
    if k: env = np.maximum(env, np.clip(1 - np.abs(t - (s0 + 0.25)) / 0.45, 0, 1) * 1.0)
env = np.convolve(env, np.ones(int(sr * 0.03)) / int(sr * 0.03), 'same')
send = v * env[:, None]
sos = butter(2, [180, 4200], btype='band', fs=sr, output='sos'); send = sosfilt(sos, send, axis=0)
for d, g, sp in ((0.13, 0.46, 0.0), (0.27, 0.32, 0.004), (0.44, 0.21, 0.0), (0.66, 0.13, 0.006), (0.92, 0.07, 0.0)):
    oL = int(d * sr); oR = int((d + sp) * sr)                                   # a few ms between ears: a wider hall
    out[oL:oL + len(v), 0] += send[:, 0] * g; out[oR:oR + len(v), 1] += send[:, 1] * g
def load(fn, gain_db):
    x, r = sf.read(S + fn); x = x if x.ndim == 2 else np.c_[x, x]
    if r != sr:
        from scipy.signal import resample_poly; x = resample_poly(x, sr, r, axis=0)
    return x * 10 ** (gain_db / 20)
def at(x, t0):
    o = int(t0 * sr); n = min(len(x), N - o); out[o:o + n] += x[:n]
sw = load('sfx3/m166.wav', -26)
for w, s0, k in W:
    if k == 0: at(sw, s0 - 0.12)
at(load('sfx/s2299.wav', -16), 1.84)                 # عسير
at(load('sfx/s2299.wav', -17), 3.74)                 # حوثي
at(load('sfx2/m1474.wav', -24), 4.30)                # the column clears
at(load('sfx/s788.wav', -15), 4.62)                  # قافلة
at(load('sfx/s2299.wav', -15), 5.72)                 # حديد
at(load('sfx/s2299.wav', -18), 6.28)                 # ومندحة
at(load('sfx/s1143.wav', -17), 6.80)                 # حناشة
out = out[:int(sr * 10.03)]
sf.write('mix_pre.wav', out.astype(np.float32), sr); print('peak', np.abs(out).max())
