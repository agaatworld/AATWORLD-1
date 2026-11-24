# synthesized cinematic sound effects (no music): whooshes, impacts, rumble, shimmer, glitch, riser
import numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
rng = np.random.default_rng(1)
def _env(n, a, d, curve=3.0):
    t = np.linspace(0, 1, n); e = np.minimum(1, t / max(a, 1e-4)) * (1 - t) ** curve; return e
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, btype='high', fs=SR, output='sos'), x)
def whoosh(dur=0.6, lo=300, hi=6000, dark=False, rev=False):
    n = int(dur * SR); x = rng.standard_normal(n); p = np.linspace(0, 1, n)
    a = bp(x, max(30, lo * 0.5), lo * 2.0); b = bp(x, hi * 0.4, min(hi * 1.5, SR / 2 - 200)); k = np.sin(np.pi * p) ** 1.5
    y = (a * (1 - k) + b * k) * np.sin(np.pi * p) ** 2
    if dark: y = lp(y, 1800) * 1.4
    if rev: y = y[::-1] * p ** 2
    return y / (np.abs(y).max() + 1e-9)
def impact(dur=1.4, f0=90, f1=38, dark=True):
    n = int(dur * SR); t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (3.0 if dark else 6.0)); click = lp(rng.standard_normal(n), 3000 if dark else 9000) * np.exp(-t * 40)
    y = body * 1.0 + click * 0.35
    return y / (np.abs(y).max() + 1e-9)
def rumble(dur=3.0):
    n = int(dur * SR); y = lp(rng.standard_normal(n), 110) * (0.6 + 0.4 * np.sin(np.linspace(0, 7, n)) ** 2)
    e = np.minimum(1, np.linspace(0, 1, n) / 0.25) * np.minimum(1, np.linspace(1, 0, n) / 0.3); y = y * e
    return y / (np.abs(y).max() + 1e-9)
def shimmer(dur=1.6, base=2200):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, m in enumerate((1, 1.5, 2.0, 2.5, 3.01, 4.0)):
        y += np.sin(2 * np.pi * base * m * t + k) * (0.7 ** k) * (0.6 + 0.4 * np.sin(2 * np.pi * (5 + k) * t))
    y = y * np.minimum(1, t / 0.05) * np.exp(-t * 2.2); y = hp(y, 1500)
    return y / (np.abs(y).max() + 1e-9)
def glitch(dur=0.25):
    n = int(dur * SR); y = np.zeros(n); i = 0
    while i < n:
        L = int(rng.uniform(0.008, 0.03) * SR); f = rng.uniform(200, 2500); t = np.arange(min(L, n - i)) / SR
        y[i:i + len(t)] = np.sign(np.sin(2 * np.pi * f * t)) * rng.uniform(0.3, 1.0); i += L + int(rng.uniform(0, 0.01) * SR)
    y = bp(y, 300, 5000)
    return y / (np.abs(y).max() + 1e-9)
def riser(dur=1.2, dark=False):
    n = int(dur * SR); t = np.linspace(0, 1, n); x = rng.standard_normal(n)
    y = hp(x, 800 if not dark else 200) * t ** 3; y = lp(y, 9000 if not dark else 2500)
    return y / (np.abs(y).max() + 1e-9)
def place(track, clip, t, db):
    i = int(t * SR); g = 10 ** (db / 20); j = min(len(track), i + len(clip))
    if j > i: track[i:j, 0] += clip[:j - i] * g; track[i:j, 1] += clip[:j - i] * g
