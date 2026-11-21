# Song timeline — «قسماً بربك يا شهيد» (بلال الأغبري), vocals only. Film clock = song clock; word starts from Whisper (word level).
# Lyrics exactly as the owner approved; the uncertain word «ولْتَزُلْ» is NOT shown (not verifiable from the audio).
W_, A_, O_ = WHITE, AMBER, ORANGE

# ======================= MOVEMENT I — THE MARTYR (0 – 68.7)
phrase(0.30, 5.4, [([('قسماً بربّك يا', W_)], 0.56), ([('شهيد', A_)], 1.0)], 'name', y=820, size=190, dark=0.45, stagger=[0, 2.34])
phrase(3.34, 5.6, [([('يا رمزَ ثورتنا الأبي', W_)], 1.0)], 'remember', y=1150, size=74, dark=0.0)
phrase(5.74, 8.0, [([('يا مشعلَ', W_), ('الفجرِ', A_), ('الجديد', W_)], 1.0)], 'remember', y=960, size=88, dark=0.4)
GLOWS.append((5.9, 2.8, 0.20))
phrase(8.14, 10.2, [([('يا شمسَ كلّ العربِ', W_)], 1.0)], 'name', y=960, size=96, dark=0.4)
GLOWS.append((8.0, 3.0, 0.32))
cap(10.34, 13.0, 'قسماً بربّك يا [[شهيد]]', [10.34, 11.18, 12.06, 12.28])
cap(13.04, 15.3, 'يا رمزَ ثورتنا الأبي', [13.04, 13.22, 13.64, 14.62])
cap(15.3, 17.76, 'يا مشعلَ الفجر الجديد', [15.3, 15.62, 16.18, 17.1])
cap(17.76, 19.8, 'يا شمسَ كلّ العربِ', [17.76, 17.98, 18.6, 18.86])
phrase(19.88, 24.8, [([('إني سأبقى', W_), ('ثائراً', O_)], 1.0), ([('إمّا الردى أو مطلبي', W_)], 0.6)], 'strength', y=940, size=118, dark=0.5, stagger=[0, 2.48])
phrase(24.88, 31.5, [([('هذي الحروفُ تسعّرت', W_)], 0.78), ([('نحو العدا', W_), ('كالشُّهُبِ', O_)], 1.0)], 'scale', y=900, size=118, dark=0.5, stagger=[0, 2.38])
STREAK_T.append(28.78)
PHOTO.append((31.6, 43.7, 1))                                                     # the coffin under the flag → his face
phrase(33.0, 42.6, [([('الشهيد', A_)], 0.42), ([('رائد الكحلاني', W_)], 1.0)], 'name', y=1190, size=120, dark=0.0, stagger=[0, 0.3])
cap(31.78, 36.9, 'قسماً بربّك يا [[شهيد]]', [31.78, 32.66, 36.06, 36.28])
cap(36.96, 39.1, 'يا رمزَ ثورتنا الأبي', [36.96, 37.32, 37.68, 38.74])
cap(39.18, 41.7, 'يا مشعلَ الفجر الجديد', [39.18, 39.54, 40.22, 41.12])
cap(41.78, 43.8, 'يا شمسَ كلّ العربِ', [41.78, 42.0, 42.6, 42.88])
cap(43.84, 46.5, 'قسماً بربّك يا شهيد', [43.84, 44.78, 45.64, 45.86])
cap(46.6, 48.85, 'يا رمزَ ثورتنا الأبي', [46.6, 46.84, 47.28, 48.28])
cap(48.9, 51.5, 'يا مشعلَ [[الفجر]] الجديد', [48.9, 49.16, 49.8, 50.7])
GLOWS.append((49.0, 3.2, 0.24))                                                   # the camera rises to the sky of Taiz
cap(51.58, 53.5, 'يا شمسَ كلّ العربِ', [51.58, 51.82, 52.38, 52.6])
cap(53.62, 56.1, 'إني سأبقى [[ثائراً]]', [53.62, 54.3, 55.16])
cap(56.2, 58.3, 'إمّا الردى أو مطلبي', [56.2, 56.78, 57.54, 57.74])
cap(58.38, 60.8, 'هذي الحروفُ تسعّرت', [58.38, 58.8, 59.96])
cap(60.84, 64.2, 'نحو العدا [[كالشُّهُبِ]]', [60.84, 61.46, 62.26])
STREAK_T.append(62.26)
cap(66.88, 68.6, 'قسماً..', [66.88])
PHOTO.append((69.0, 85.8, 2))                                                     # the interlude: close on his eyes, then the whole photograph

# ======================= MOVEMENT II — YEMEN AND THE PROMISE (86.1 – 166.7)
phrase(86.1, 91.9, [([('ما دمتُ حيّاً يا', W_)], 0.56), ([('يمن', O_)], 1.0)], 'scale', y=860, size=210, dark=0.5, stagger=[0, 2.96])
SPECIAL.append((89.52, 92.0, 'pulse', dict(img=fitw(text_img([('تجري بقلبي', W_), ('كالدمِ', O_)], 'thmanyahserifdisplay-Black.ttf', 86), 960), y=1130)))
phrase(92.06, 97.6, [([('فأنا ابنُ أرض الجنّتين', W_)], 1.0), ([('إلى الحضارة', A_), ('أنتمي', W_)], 1.0)], 'legacy', y=960, size=94, dark=0.62, stagger=[0, 2.58])
HERITAGE = [(92.06, 97.6, 960), (192.8, 195.4, 1100)]
cap(97.64, 100.3, 'ما دمتُ حيّاً يا [[يمن]]', [97.64, 98.34, 98.94, 99.62, 99.84])
cap(100.32, 103.0, 'تجري بقلبي كالدمِ', [100.32, 101.04, 102.04])
cap(103.04, 108.9, 'إلى الحضارة أنتمي', [103.04, 103.66, 106.8])
phrase(109.02, 113.4, [([('أقسمتُ أن أمضي إلى', W_)], 1.0)], 'strength', y=860, size=86, dark=0.5)
phrase(111.04, 113.4, [([('صُنعِ', W_), ('الغدِ المتبسّمِ', A_)], 1.0)], 'remember', y=1060, size=100, dark=0.0)
GLOWS.append((111.0, 3.6, 0.22))
phrase(113.56, 118.2, [([('وأظلّ أشدو دائماً', W_)], 1.0), ([('شدوَ الشغوفِ المُغرَمِ', W_)], 0.86)], 'loss', y=960, size=100, dark=0.58, stagger=[0, 2.54])
cap(118.38, 120.6, 'أقسمتُ أن أمضي إلى', [118.38, 119.18, 119.52, 120.32])
cap(120.64, 123.1, 'صُنعِ [[الغدِ المتبسّمِ]]', [120.64, 121.44, 121.9])
cap(123.18, 125.5, 'وأظلّ أشدو دائماً', [123.18, 123.98, 124.66])
cap(125.54, 129.6, 'شدوَ الشغوفِ المُغرَمِ', [125.54, 126.26, 127.02])
cap(129.78, 135.3, 'قسماً بربّك يا [[شهيد]]', [129.78, 131.12, 134.44, 134.64])
cap(135.38, 137.6, 'يا رمزَ ثورتنا الأبي', [135.38, 135.6, 136.06, 137.12])
cap(137.66, 140.1, 'يا مشعلَ الفجر الجديد', [137.66, 138.08, 138.58, 139.46])
cap(140.14, 142.3, 'يا شمسَ كلّ العربِ', [140.14, 140.38, 140.98, 141.24])
cap(142.36, 145.15, 'قسماً بربّك يا شهيد', [142.36, 142.98, 143.92, 144.22])
cap(145.2, 147.3, 'يا رمزَ ثورتنا الأبي', [145.2, 145.26, 145.6, 146.62])
cap(147.34, 149.7, 'يا مشعلَ الفجر الجديد', [147.34, 147.68, 148.16, 148.98])
cap(149.72, 151.9, 'يا شمسَ كلّ العربِ', [149.72, 150.02, 150.44, 150.8])
cap(151.94, 154.5, 'إني سأبقى [[ثائراً]]', [151.94, 152.62, 153.36])
cap(154.52, 156.8, 'إمّا الردى أو مطلبي', [154.52, 155.02, 155.84, 156.06])
cap(156.84, 159.2, 'هذي الحروفُ تسعّرت', [156.84, 157.36, 158.34])
cap(159.22, 161.9, 'نحو العدا [[كالشُّهُبِ]]', [159.22, 159.78, 160.6])
STREAK_T.append(160.6)
cap(161.98, 166.0, 'قسماً.. قسماً', [161.98, 163.68])
PHOTO.append((167.2, 184.0, 3))                                                   # second interlude: he stands above the moving people

# ======================= MOVEMENT III — DETERMINATION, HISTORY, UNITY (184.8 – 253)
phrase(184.8, 190.3, [([('إني سأبقى سائراً', W_)], 1.0)], 'strength', y=860, size=96, dark=0.55)
phrase(187.92, 190.3, [([('بعزيمتي', O_)], 1.0), ([('رغمَ الحسود', W_)], 0.5)], 'strength', y=1080, size=150, dark=0.0, stagger=[0, 1.2])
phrase(190.44, 195.4, [([('حتى أحقّقَ', W_), ('ثورتي', O_)], 1.0)], 'strength', y=880, size=100, dark=0.55)
phrase(192.8, 195.4, [([('وأعيدَ تاريخَ الجدود', W_)], 1.0)], 'legacy', y=1100, size=84, dark=0.0)
cap(195.5, 197.6, 'إني سأبقى سائراً', [195.5, 196.0, 196.8])
cap(197.68, 200.0, 'بعزيمتي رغمَ الحسود', [197.68, 198.78, 199.36])
cap(200.08, 202.5, 'حتى أحقّقَ ثورتي', [200.08, 200.86, 201.7])
cap(202.54, 205.0, 'وأعيدَ تاريخَ [[الجدود]]', [202.54, 203.34, 204.1])
SPECIAL.append((205.1, 208.3, 'converge', dict(top=text_img([('فلتلتقِ', W_)], 'thmanyahserifdisplay-Black.ttf', 100),
               a=text_img([('عدنٌ', O_)], 'thmanyahserifdisplay-Black.ttf', 150), b=text_img([('وصنعا', A_)], 'thmanyahserifdisplay-Black.ttf', 150),
               y=960, b_in=206.4, meet0=206.6, meet1=207.7)))
SPECIAL.append((208.38, 209.6, 'expand', dict(img=text_img([('كلُّ الحدود', W_)], 'thmanyahsans-Black.ttf', 120), y=960)))
phrase(209.72, 217.4, [([('الكلُّ', W_)], 0.5), ([('شعبٌ', W_), ('واحدٌ', O_)], 1.0), ([('سيعيشُ خفّاقَ البنود', A_)], 0.46)], 'scale', y=930, size=170, dark=0.55, stagger=[0, 0.6, 2.26])
cap(216.74, 221.6, 'قسماً بربّك يا [[شهيد]]', [216.74, 217.44, 220.8, 221.02])
cap(221.7, 224.0, 'يا رمزَ ثورتنا الأبي', [221.7, 221.96, 222.62, 223.42])
cap(224.12, 226.5, 'يا مشعلَ الفجر الجديد', [224.12, 224.44, 224.96, 225.86])
cap(226.54, 228.7, 'يا شمسَ كلّ العربِ', [226.54, 226.74, 227.34, 227.58])
cap(228.72, 231.2, 'قسماً بربّك يا شهيد', [228.72, 229.4, 230.4, 230.6])
cap(231.3, 233.4, 'يا رمزَ ثورتنا الأبي', [231.3, 231.62, 232.02, 233.04])
cap(233.5, 236.2, 'يا مشعلَ الفجر الجديد', [233.5, 233.78, 234.52, 235.5])
cap(236.3, 238.2, 'يا شمسَ كلّ العربِ', [236.3, 236.38, 236.92, 237.2])
PHOTO.append((238.0, 250.8, 4))                                                   # the farewell photograph
cap(238.32, 240.8, 'إني سأبقى ثائراً', [238.32, 238.96, 239.8])
cap(240.88, 243.1, 'إمّا الردى أو مطلبي', [240.88, 241.42, 242.22, 242.46])
cap(243.2, 245.5, 'هذي الحروفُ تسعّرت', [243.2, 243.68, 244.7])
cap(245.58, 249.4, 'نحو العدا كالشُّهُبِ', [245.58, 246.16, 247.04])
phrase(249.76, 252.4, [([('قسماً..', A_)], 1.0)], 'name', y=940, size=150, dark=0.5)

# ---------------------------------------------------------------- sound: the song's voice only, and six barely-there cues
SR = 48000
def clip(i, a=0.0, b=None):
    for p in SFXD:
        if os.path.exists(p + f'{i}.wav'):
            x, sr = sf.read(p + f'{i}.wav', dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
            if sr != SR: x = resample_poly(x, SR, sr).astype(np.float32)
            x = x[int(a * SR):(int(b * SR) if b else None)]; n = len(x); f_ = np.ones(n, np.float32); k1 = min(n // 4, int(0.02 * SR)); k2 = min(n // 3, int(0.12 * SR))
            f_[:k1] = np.linspace(0, 1, k1); f_[-k2:] = np.linspace(1, 0, k2); return x * f_
    raise FileNotFoundError(i)
def loudnorm(src, dst, target=-14):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000", '-ac', '2', dst], check=True)
def audio():
    from scipy.ndimage import uniform_filter1d
    v, sr = sf.read(SONG, dtype='float32')
    if v.ndim == 1: v = np.stack([v, v], 1)
    if sr != SR: v = resample_poly(v, SR, sr, axis=0).astype(np.float32)
    n = int(DUR * SR); v = np.pad(v[:n], ((0, max(0, n - len(v))), (0, 0)))
    mono = v.mean(1); env = np.sqrt(np.maximum(uniform_filter1d(mono ** 2, int(0.3 * SR)), 0)); env = np.clip(env / (np.percentile(env, 90) + 1e-6), 0, 1)
    fx = np.zeros(n, np.float32)
    def add(x, t, db):
        k = int(t * SR); m = min(len(x), n - k)
        if m > 0: fx[k:k + m] += x[:m] * 10 ** (db / 20)
    add(clip(167, 0.0, 2.6), 0.05, -30)          # air as the image opens
    add(clip(498, 0, 2.2), 31.5, -27)            # photo 1: one deep, soft heartbeat
    add(clip(1437, 0.75, 1.15), 69.0, -28)       # photo 2: the lens finds his eyes
    add(clip(1482, 0, 2.5), 167.2, -31)          # photo 3: wind settles
    add(clip(788, 0, 3.0), 210.3, -32)           # «شعبٌ واحدٌ»: a distant, low swell
    add(clip(490), 253.1, -24)                   # the closing frame: one heartbeat
    fx = sosfilt(butter(2, 110 / (SR / 2), 'highpass', output='sos'), fx) * (1 - 0.5 * env)
    out = v + fx[:, None]; sf.write(WK + 'song_mixraw.wav', out, SR); loudnorm(WK + 'song_mixraw.wav', WK + 'song_mix.wav')
