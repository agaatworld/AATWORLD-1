"""Procedural, non-musical sound effects stem (no tones, no melodies, no rhythm loops).
Every spot effect comes from the cue list in film.json, which is tied to drawn actions.
No effects at all during the Qur'anic quotation (film['calm'])."""
import json, numpy as np, soundfile as sf, subprocess
from scipy.signal import butter, sosfilt

SR = 44100
film = json.load(open('/home/user/miqdad_film/build/film.json'))
DUR = film['dur']
N = int(DUR * SR)
rng = np.random.default_rng(1234)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)
def smooth_noise(n, rate_hz, seed):
    r = np.random.default_rng(seed)
    k = max(2, int(n / SR * rate_hz) + 2)
    pts = r.uniform(0, 1, k)
    return np.interp(np.linspace(0, k - 1, n), np.arange(k), pts)
def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak

def wind(dur, seed=1, bright=1.0):
    n = int(dur * SR)
    w = rng.standard_normal(n)
    body = lp(w, 700)
    a = smooth_noise(n, 0.25, seed) * 0.7 + 0.3
    b = smooth_noise(n, 0.12, seed + 9)
    mid = bp(w, 250, 1400) * (0.35 + 0.65 * b)
    hi = bp(rng.standard_normal(n), 1800, 4200) * 0.10 * bright * smooth_noise(n, 0.3, seed + 4)
    return norm((body * 0.8 + mid * 0.7 + hi) * a, 0.5)

def fire(dur, seed=2):
    n = int(dur * SR)
    rum = lp(rng.standard_normal(n), 180) * (0.6 + 0.4 * smooth_noise(n, 1.5, seed))
    rum = norm(rum, 0.25)
    out = rum.copy()
    t = 0.0
    r = np.random.default_rng(seed)
    while t < dur:
        t += r.exponential(1 / 9.0)
        i = int(t * SR)
        L = int(r.uniform(0.002, 0.009) * SR)
        if i + L >= n:
            break
        burst = r.standard_normal(L) * np.exp(-np.linspace(0, 6, L))
        burst = bp(burst, 900, 6500) if r.random() < 0.8 else bp(burst, 300, 1500)
        out[i:i + L] += burst * r.uniform(0.15, 0.9)
    return norm(out, 0.5)

def env_ad(n, a=0.01, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)

def snort(far=False):
    d = 0.7
    n = int(d * SR)
    x = rng.standard_normal(n)
    x = bp(x, 250, 2600)
    t = np.arange(n) / SR
    flutter = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * (24 + 6 * rng.random()) * t + rng.standard_normal(n).cumsum() * 0.02))
    e = env_ad(n, 0.03, 0.18) * (0.6 + 0.4 * flutter)
    breath = bp(rng.standard_normal(n), 900, 4000) * env_ad(n, 0.08, 0.3) * 0.4
    y = x * e + breath
    if far:
        y = lp(y, 1100)
    return norm(y, 1.0)

def hoof():
    n = int(0.25 * SR)
    th = lp(rng.standard_normal(n), 170) * env_ad(n, 0.004, 0.05) * 3
    clk = bp(rng.standard_normal(n), 1000, 3200) * env_ad(n, 0.001, 0.012)
    cr = np.zeros(n)
    for g in range(7):
        i = int(rng.uniform(0.005, 0.07) * SR); L = int(0.004 * SR)
        cr[i:i + L] += hp(rng.standard_normal(L), 2200) * rng.uniform(0.2, 0.6)
    return norm(th + clk * 0.6 + cr, 1.0)

def swish(d=0.4):
    n = int(d * SR)
    x = rng.standard_normal(n)
    a = bp(x, 700, 1600); b = bp(x, 1600, 3200)
    k = np.linspace(0, 1, n)
    e = np.sin(np.pi * k) ** 2
    return norm((a * (1 - k) + b * k) * e, 1.0)

def rustle(d=0.45, bumps=5, lo=1500, hi=6500):
    n = int(d * SR)
    x = bp(rng.standard_normal(n), lo, hi)
    e = np.zeros(n)
    for _ in range(bumps):
        c = rng.uniform(0.05, 0.9) * n; w = rng.uniform(0.03, 0.12) * SR
        e += rng.uniform(0.4, 1.0) * np.exp(-0.5 * ((np.arange(n) - c) / w) ** 2)
    return norm(x * e, 1.0)

def cloak():
    return norm(rustle(0.5, 3, 350, 3000) * 0.8 + rustle(0.5, 2, 1500, 5000) * 0.4, 1.0)

def step():
    n = int(0.22 * SR)
    th = lp(rng.standard_normal(n), 200) * env_ad(n, 0.006, 0.04) * 1.5
    cr = np.zeros(n)
    for g in range(16):
        i = int(rng.uniform(0.0, 0.12) * SR); L = int(rng.uniform(0.002, 0.007) * SR)
        if i + L < n:
            cr[i:i + L] += hp(rng.standard_normal(L), 1800) * rng.uniform(0.2, 0.8) * np.exp(-i / SR / 0.08)
    return norm(th + cr, 1.0)

def leather():
    """irregular stick-slip creak: jittered impulse spacing so it never forms a pitch."""
    d = 0.42; n = int(d * SR)
    y = np.zeros(n); t = 0.0
    while t < d - 0.01:
        t += rng.uniform(0.012, 0.045)
        i = int(t * SR); L = int(0.006 * SR)
        if i + L < n:
            y[i:i + L] += bp(rng.standard_normal(L), 500, 2400) * np.exp(-np.linspace(0, 5, L)) * rng.uniform(0.3, 1.0)
    return norm(y * np.sin(np.linspace(0, np.pi, n)) ** 0.5, 1.0)

SPOT = {'snort': lambda: snort(), 'snort_far': lambda: snort(True), 'hoof': hoof, 'tailswish': lambda: swish(0.42),
        'rustle': lambda: rustle(0.42, 5), 'rustle_long': lambda: rustle(1.25, 11), 'cloak': cloak, 'step': step, 'leather': leather}

mix = np.zeros(N)
calm0, calm1 = film['calm']
for ev in film['sfx']:
    if 't0' in ev:
        t0, t1 = ev['t0'], ev['t1']
        d = t1 - t0
        seg = {'wind': lambda: wind(d, seed=int(t0 * 10)), 'fire': lambda: fire(d, seed=int(t0 * 10) + 1),
               'dawn_air': lambda: wind(d, seed=int(t0 * 10) + 2, bright=0.4) * 0.6}[ev['k']]()
        lvl = {'wind': 0.095, 'fire': 0.11, 'dawn_air': 0.07}[ev['k']] * ev['g']
        n = len(seg); fade = int(0.55 * SR)
        e = np.ones(n); e[:fade] = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2; e[-fade:] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
        i0 = int(t0 * SR)
        mix[i0:i0 + n] += (seg * e * lvl)[:N - i0]
    else:
        snd = SPOT[ev['k']]()
        lvl = 0.22 * ev['g']
        i0 = int(ev['t'] * SR)
        mix[i0:i0 + len(snd)] += (snd * lvl)[:max(0, N - i0)]

# hard guarantee: nothing during the Qur'anic quotation (with a gentle 0.35 s edge either side)
k0, k1 = int((calm0 - 0.35) * SR), int((calm1 + 0.2) * SR)
ramp = int(0.35 * SR)
g = np.ones(N)
g[k0:k0 + ramp] = np.cos(np.linspace(0, np.pi / 2, ramp)) ** 2
g[k0 + ramp:k1] = 0.0
g[k1:k1 + ramp] = np.sin(np.linspace(0, np.pi / 2, ramp)) ** 2
mix *= g
mix = np.tanh(mix * 1.2) / 1.2
peak = np.max(np.abs(mix))
print('sfx peak dBFS %.1f, rms dBFS %.1f' % (20 * np.log10(peak + 1e-9), 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-9)))
sf.write('/home/user/miqdad_film/audio/sfx.wav', mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/home/user/miqdad_film/audio/sfx.wav', '-c:a', 'libmp3lame', '-b:a', '64k',
                '/home/user/miqdad_film/audio/sfx.mp3'], check=True)
