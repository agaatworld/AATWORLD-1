# Timeline of the tribute (seconds on the source clock). Every phrase is either the narrator's own words or a short poetic line with no facts in it.
W_, A_, O_ = WHITE, AMBER, ORANGE

# ---- I. Opening: out of darkness (0–17)
phrase(0.8, 7.2, [([('حين يرحل الرجال..', W_)], 1.0), ([('تمشي خلفهم', W_), ('المدن', A_)], 1.0)], 'loss', y=900, size=112, dark=0.5, stagger=[0, 1.6])

# ---- II. The scale, and the man (18–44)
cap(18.6, 21.82, 'بهذه الحشود المهيبة', [18.6, 20.64, 21.18])
cap(21.82, 24.9, '[[عشرات الآلاف]] في تعز', [21.82, 23.52, 24.24, 24.38])
cap(24.9, 28.52, 'تودّع شهيدها البطل', [24.9, 26.74, 27.56])
cap(28.52, 30.6, 'المجاهد', [28.52])
PHOTO.append((30.4, 41.0, 1))                                                       # the coffin under the flag → his face
phrase(31.0, 38.6, [([('الشهيد', A_)], 0.42), ([('رائد الكحلاني', W_)], 1.0), ([('ورفاقه الشهداء', W_)], 0.42)], 'name', y=1380, size=132, dark=0.0, stagger=[0, 0.3, 1.9])

# ---- III. Taiz comes out (44–74)
phrase(47.1, 53.2, [([('تعزّ', O_), ('تخرج', W_)], 1.0), ([('عن بكرة أبيها', W_)], 0.78)], 'scale', y=980, size=138, dark=0.45, stagger=[0, 1.1])
cap(53.4, 56.5, 'في وداع الشهيد [[رائد الكحلاني]]', [53.4, 54.0, 54.6, 55.22])
phrase(60.56, 64.6, [([('رحمة الله تغشاك', W_)], 1.0), ([('شهيدنا', A_)], 1.0)], 'remember', y=940, size=92, dark=0.45, stagger=[0, 1.2])
cap(64.8, 68.48, 'بهذا الحشد المهيب، بهذه العشرات الآلاف')
cap(68.48, 70.66, 'من أبناء [[تعز]]')

# ---- IV. "What is this love" — the eyes, then the whole photograph (74–90)
cap(74.38, 76.3, 'ما هذا الحب يا الله!')
PHOTO.append((75.6, 89.0, 2))
phrase(76.6, 86.0, [([('هذا الرجل أحبّه الله', W_)], 1.0), ([('وأحبّه', W_), ('الناس', O_)], 1.0)], 'remember', y=1380, size=90, dark=0.0, stagger=[0, 2.4])

# ---- V. Taiz rises (98–120)
cap(98.34, 101.2, 'هذه تعز [[الحيّة]]', [98.34, 100.14, 100.76])
cap(101.2, 105.26, 'هذه تعز بأبنائها ورجالها', [101.2, 102.92, 103.7, 104.4])
phrase(106.6, 112.4, [([('تنتفض', O_)], 1.25), ([('من وسط الرماد', W_)], 0.72), ([('من وسط النار', W_)], 0.72), ([('من وسط الحصار', A_)], 0.72)],
       'strength', y=960, size=120, dark=0.55, stagger=[0, 0.92, 2.42, 3.42])
cap(112.68, 116.2, 'هذه تعز [[المحاصرة]] رغم الحصار', [112.68, 113.6, 114.18, 114.9, 115.2])

# ---- VI. The long march (139–176)
cap(139.78, 144.26, 'أكثر من ساعة والحشود تمشي في الشارع')
cap(144.26, 150.66, 'تتوافد بهذا الشكل الكبير')
cap(151.8, 154.68, 'إلى مقبرة السعيد في تعز')
phrase(154.68, 158.3, [([('رائد الكحلاني', W_)], 1.0)], 'name', y=960, size=112, dark=0.5)
cap(158.5, 163.26, 'الشهيد رائد الكحلاني الذي [[ارتقت روحه]] اليوم', [158.5, 160.1, 160.46, 161.22, 161.56, 162.34, 162.8])
cap(163.26, 166.26, 'بعد إصابته قبل أسبوعين في جبهة جبل صبر', [163.26, 163.48, 164.1, 164.42, 165.08, 165.28, 165.72, 166.0])
cap(166.26, 171.7, 'هؤلاء أبناء تعز، وهذه [[صبر]] ورجالها', [166.26, 168.0, 168.46, 168.88, 169.94, 170.7])
phrase(171.7, 178.5, [([('تعز اليوم', W_)], 0.8), ([('كما لم تحتشد', O_)], 1.0), ([('من قبل', W_)], 0.8)], 'scale', y=960, size=124, dark=0.5, stagger=[0, 2.6, 3.9])

# ---- VII. Only the crowd (178–222): the picture speaks; two quiet lines
phrase(186.0, 194.5, [([('آلافٌ يمضون..', W_)], 1.0), ([('وقلبٌ واحدٌ', A_), ('يودّع', W_)], 1.0)], 'loss', y=940, size=104, dark=0.5, stagger=[0, 2.2])
phrase(211.5, 220.5, [([('ليسوا يحملون جسداً فحسب..', W_)], 0.86), ([('إنما يحملون', W_), ('ذكرى رجل', A_)], 1.0)], 'remember', y=960, size=96, dark=0.55, stagger=[0, 2.6])

# ---- VIII. The climax: "who left a thousand commanders" (229–268)
cap(229.48, 231.98, 'تعز خرجت عن بكرة أبيها')
cap(239.38, 241.86, 'تعز [[المحاصرة]] اليوم')
cap(241.86, 244.58, 'هذه تعز')
cap(244.58, 247.82, 'اليوم تودّع شهيدها')
cap(249.5, 251.5, 'وقائدها البطل', [249.5, 250.62])
PHOTO.append((251.0, 266.0, 3))
phrase(251.5, 259.0, [([('الذي خلّف', W_)], 0.62), ([('ألف قائد', O_)], 1.0)], 'strength', y=560, size=150, dark=0.0, stagger=[0, 0.98])
cap(254.76, 258.56, 'رائد الكحلاني الذي خلّف ألف قائد [[بعده]]', [254.76, 255.82, 256.56, 256.9, 257.42, 257.8, 258.14])
cap(258.56, 261.8, 'تعز وجبل صبر [[صامدة]]', [258.56, 260.08, 260.9, 261.26])
cap(261.8, 264.6, 'مرابطة ثابتة', [261.8, 263.68])
cap(265.56, 268.16, 'في وجه العدو الحوثي')

# ---- IX. Steadfast (277–352)
cap(277.52, 281.32, 'هذه تعز التي تثبت اليوم')
cap(281.32, 287.08, 'أنها تحب أبطالها، تودّعهم')
cap(288.52, 292.82, 'الذين ارتقوا [[شهداء]]')
cap(295.24, 298.1, 'هذه الجموع بإذن الله')
cap(298.1, 301.9, 'هي من ستحرّر البلاد من دنس الحوثي')
cap(301.9, 305.86, 'وتستعيد الجمهورية إن شاء الله')
cap(310.7, 314.0, 'فخرجت اليوم عن بكرة أبيها', [310.7, 312.42, 312.94, 313.14, 313.58])
phrase(315.8, 321.5, [([('عشرات الآلاف', O_)], 1.0), ([('في شوارع تعز', W_)], 0.7)], 'scale', y=960, size=140, dark=0.5, stagger=[0, 1.9])
cap(321.5, 326.4, 'تعز تؤكد كل يوم أنها ضد المشروع السلالي', [321.58, 322.12, 322.28, 322.92, 323.66, 324.1, 324.6])
cap(326.4, 333.6, 'بكل أطيافهم، بكل انتماءاتهم، بكل توجّهاتهم', [326.4, 328.34, 329.04, 330.44, 331.28, 332.76])
phrase(333.7, 338.0, [([('على قلب', W_)], 0.7), ([('رجل واحد', O_)], 1.0)], 'strength', y=960, size=150, dark=0.55, stagger=[0, 0.8])
cap(338.0, 341.6, 'اليوم تودّع الشهيد، وغداً تودّع الشهداء', [338.0, 338.32, 338.94, 339.56, 340.5, 341.1])
cap(343.4, 346.5, 'ولكنها [[صامدة]]', [343.4, 345.28])
cap(345.9, 349.5, 'تخرج بروح القوي لا بروح الضعيف', [345.9, 346.5, 347.26, 347.86, 348.72, 349.1])
phrase(349.52, 353.0, [([('رحمة الله تغشى', W_)], 1.0), ([('شهداءنا', A_)], 1.0)], 'remember', y=940, size=92, dark=0.5, stagger=[0, 1.6])

# ---- X. Farewell (353–end)
PHOTO.append((357.6, 367.4, 4))
phrase(358.6, 365.0, [([('رحل الجسد..', W_)], 1.0), ([('وبقي', W_), ('الأثر', A_)], 1.0)], 'legacy', y=1380, size=104, dark=0.0, stagger=[0, 2.0])
phrase(368.2, 379.8, [([('الشهيد النقيب', A_)], 0.5), ([('رائد الكحلاني', W_)], 1.0), ([('4/4/1984 — 18/11/2026', W_)], 0.42), ([('تعز على العهد والوعد', W_)], 0.5)],
       'legacy', y=930, size=124, dark=0.62, stagger=[0, 0.6, 2.4, 4.6])
phrase(375.0, 380.4, [([('الثبات عز', A_), ('·', W_), ('الكلمة مقاومة', W_)], 1.0)], 'legacy', y=1420, size=44, dark=0.0)

# ---------------------------------------------------------------- sound: the source voice without the music; a few quiet cues, never on top of the voice
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
    v, sr = sf.read(WK + 'sep/htdemucs/all/vocals.wav', dtype='float32')
    if sr != SR: v = resample_poly(v, SR, sr, axis=0).astype(np.float32)
    n = int(DUR * SR); v = v[:n]; v = np.pad(v, ((0, n - len(v)), (0, 0)))
    v = sosfilt(butter(2, 60 / (SR / 2), 'highpass', output='sos'), v, axis=0)
    e = np.linspace(0, 1, int(1.2 * SR))[:, None]; v[:len(e)] *= e                                     # sound rises with the picture
    v[-int(2.5 * SR):] *= np.linspace(1, 0, int(2.5 * SR))[:, None]
    mono = v.mean(1); env = np.sqrt(np.maximum(uniform_filter1d(mono ** 2, int(0.3 * SR)), 0)); env = np.clip(env / (np.percentile(env, 90) + 1e-6), 0, 1)
    fx = np.zeros(n, np.float32)
    def add(x, t, db):
        k = int(t * SR); m = min(len(x), n - k)
        if m > 0: fx[k:k + m] += x[:m] * 10 ** (db / 20)
    add(clip(167, 0.0, 2.6), 0.2, -27)              # a long breath of air as the picture opens
    add(clip(498, 0, 2.2), 30.3, -25)               # photo 1: one deep, soft heartbeat
    add(clip(1437, 0.75, 1.15), 75.4, -27)          # photo 2: the lens finds his eyes
    add(clip(1143, 0.1, 2.6), 106.5, -27)           # «تنتفض»
    add(clip(788, 0, 3.0), 252.3, -30)              # «ألف قائد»: a distant, low impact
    add(clip(490), 357.5, -22)                      # farewell: one heartbeat
    add(clip(1482, 0, 2.5), 367.4, -30)             # the last view: wind settles
    fx = sosfilt(butter(2, 110 / (SR / 2), 'highpass', output='sos'), fx) * (1 - 0.45 * env)
    out = v + fx[:, None]; sf.write(WK + 'film_mixraw.wav', out, SR); loudnorm(WK + 'film_mixraw.wav', WK + 'film_mix.wav')
