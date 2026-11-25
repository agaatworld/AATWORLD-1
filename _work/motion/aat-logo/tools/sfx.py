"""AAT sound design for the logo animations: synthesised sound effects only, NO music.
   python3 tools/sfx.py cues.json out.wav     (cues.json = {"dur": seconds, "cues": [{t, type, len?, level?, f0?, f1?}]})
   Every sound is generated here from noise and tones (original, no stock samples). 48 kHz, 24-bit stereo, peak -3 dBFS.
   'lock' is the AAT sound signature: a soft low body, a felt click and a two-note bell (D5 + A5, the fifth = 'confidence')."""
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)

def env(n, a, r, shape=2.0):
    a = max(1, int(a * SR)); r = max(1, int(r * SR)); e = np.ones(n)
    e[:min(a, n)] = np.linspace(0, 1, min(a, n)) ** shape
    if r < n: e[-r:] *= np.linspace(1, 0, r) ** shape
    return e

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.exp(-0.5 * ((np.log(np.maximum(f, 1)) - np.log(np.sqrt(lo * hi))) / (np.log(hi / lo) / 2 + 1e-9)) ** 2)
    return np.fft.irfft(X * g, len(x))

def swept_noise(n, c0, c1, q=1.4):
    """noise through a band-pass whose centre glides c0 -> c1 (overlap-add, 2048-sample frames)"""
    N = 2048; hop = N // 4; out = np.zeros(n + N); win = np.hanning(N); src = rng.standard_normal(n + N)
    f = np.fft.rfftfreq(N, 1 / SR)
    for i, s in enumerate(range(0, n, hop)):
        c = c0 * (c1 / c0) ** min(1, s / max(1, n))
        g = np.exp(-0.5 * (np.log(np.maximum(f, 1) / c) / (np.log(2) / q)) ** 2)
        out[s:s + N] += np.fft.irfft(np.fft.rfft(src[s:s + N] * win) * g, N) * win
    return out[:n] / 1.5

def norm(x): m = np.max(np.abs(x)) or 1; return x / m

def sound(c):
    t = c['type']; L = float(c.get('len', 0.3)); lv = float(c.get('level', 1))
    if t == 'whoosh':
        n = int(max(0.12, L) * SR); x = norm(swept_noise(n, 350, 2600)) * env(n, L * 0.55, L * 0.45, 1.6)
        return x * 0.55 * lv, 0.0
    if t == 'air':
        n = int(max(0.3, L) * SR); x = norm(swept_noise(n, 180, 700, 0.9)) * env(n, L * 0.7, L * 0.3, 2.2)
        return x * 0.45 * lv, 0.0
    if t == 'rush':
        n = int(max(0.3, L) * SR); x = norm(swept_noise(n, 3000, 260, 1.1)) * env(n, L * 0.15, L * 0.6, 1.4)
        return x * 0.5 * lv, 0.0
    if t == 'sweep':
        n = int(max(0.15, L) * SR); tt = np.arange(n) / SR; f0 = c.get('f0', 220); f1 = c.get('f1', 660)
        f = f0 * (f1 / f0) ** (tt / tt[-1]); ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)) * env(n, L * 0.5, L * 0.5, 2)
        return x * 0.22 * lv, 0.0
    if t == 'impact':
        n = int(0.9 * SR); tt = np.arange(n) / SR
        body = np.sin(2 * np.pi * (52 * tt + 30 * (1 - np.exp(-tt * 18)) / 18)) * np.exp(-tt * 5.5)
        tr = band(rng.standard_normal(n), 120, 900) * np.exp(-tt * 45)
        return (body * 0.7 + norm(tr) * 0.25) * lv * 0.8, 0.0
    if t == 'shimmer':
        n = int(max(0.3, L) * SR); tt = np.arange(n) / SR; x = np.zeros(n)
        for i, fr in enumerate([2349, 2793, 3136, 3520]):
            x += np.sin(2 * np.pi * fr * tt + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (7 + i) * tt + i * 1.3))
        return x / 4 * env(n, L * 0.4, L * 0.6, 2) * 0.12 * lv, 0.0
    if t == 'turn':
        n = int(max(0.3, L) * SR); tt = np.arange(n) / SR
        x = norm(swept_noise(n, 140, 420, 1.0)) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.5 * tt)) + 0.4 * np.sin(2 * np.pi * 73 * tt)
        return x * env(n, L * 0.5, L * 0.4, 1.8) * 0.4 * lv, 0.0
    if t == 'resonance':
        n = int(max(0.6, L + 0.6) * SR); tt = np.arange(n) / SR; x = np.zeros(n)
        for fr, a, d in [(311, 1, 2.2), (622.8, .5, 3), (933, .25, 4), (1568, .12, 5)]:
            x += a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * d)
        return x * env(n, 0.04, 0.1) * 0.16 * lv, 0.0
    if t == 'click':
        n = int(0.06 * SR); tt = np.arange(n) / SR
        x = norm(band(rng.standard_normal(n), 1500, 6000)) * np.exp(-tt * 160) + 0.5 * np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 120)
        return x * 0.4 * lv, 0.0
    if t == 'tick':
        n = int(0.05 * SR); tt = np.arange(n) / SR
        return np.sin(2 * np.pi * 2637 * tt) * np.exp(-tt * 90) * 0.12 * lv, 0.0
    if t == 'lock':   # the AAT signature
        n = int(1.6 * SR); tt = np.arange(n) / SR
        body = np.sin(2 * np.pi * 73.4 * tt) * np.exp(-tt * 6) * 0.55                      # D2 body
        felt = norm(band(rng.standard_normal(n), 600, 3500)) * np.exp(-tt * 90) * 0.35
        bell = np.zeros(n)
        for fr, a in [(587.3, 1), (880, .7), (1174.7, .25), (1761, .12)]:               # D5, A5, D6, A6
            bell += a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * (2.2 + fr / 900))
        bell *= np.minimum(1, tt / 0.006)
        return (body + felt + bell * 0.22) * lv * 0.85, 0.0
    raise ValueError(t)

def main(cfile, out):
    C = json.load(open(cfile)); n = int(C['dur'] * SR) + 1
    L = np.zeros(n); R = np.zeros(n)
    for c in C['cues']:
        x, _ = sound(c); s = int(max(0, c['t']) * SR)
        if s >= n: continue
        x = x[:n - s]
        pan = {'whoosh': 0.25, 'rush': -0.2, 'sweep': 0.15}.get(c['type'], 0) * (1 if hash(round(c['t'], 2)) % 2 else -1)
        L[s:s + len(x)] += x * (1 - pan) ; R[s:s + len(x)] += x * (1 + pan)
    # tiny room: two short reflections, keeps it elegant rather than dry
    for d, g in [(0.023, 0.18), (0.041, 0.11)]:
        k = int(d * SR); L[k:] += R[:-k] * g; R[k:] += L[:-k] * g
    fade = int(0.08 * SR); L[-fade:] *= np.linspace(1, 0, fade); R[-fade:] *= np.linspace(1, 0, fade)
    peak = max(np.abs(L).max(), np.abs(R).max(), 1e-9); g = 10 ** (-3 / 20) / peak
    st = np.stack([L * g, R * g], 1)
    pcm = (np.clip(st, -1, 1) * (2 ** 23 - 1)).astype('<i4')
    b = pcm.tobytes(); b24 = b''.join(b[i:i + 3] for i in range(0, len(b), 4))
    with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b24)

if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
