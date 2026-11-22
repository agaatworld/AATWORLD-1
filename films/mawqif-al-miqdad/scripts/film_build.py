"""Master timeline (single source of truth) -> build/film.json
Times are seconds on the narration clock. Shot boundaries follow the measured word timings
(Whisper large-v3, checked against the v6 burned-in captions)."""
import json

DUR = 66.4
NARR_END = 61.84

# ---------------------------------------------------------------- subtitles (verbatim narration)
H = 'عليه الصلاة والسلام'
R = 'رضي الله عنه'
CUES = [
    (0.00, 2.70, [('هنا خلاص أيقنَ الآن أصحابُ النبيِّ ', 0), (H, 1)]),
    (2.70, 5.20, [('بأنه لا مندوحةَ من القتال', 0)]),
    (5.20, 7.48, [('هنا قام النبيُّ ', 0), (H, 1), (' وقال', 0)]),
    (7.48, 10.24, [('أشيروا عليَّ أيها الناس', 0)]),
    (10.24, 12.34, [('وإنما يريد النبيُّ ', 0), (H, 1), (' الأنصار', 0)]),
    (12.34, 13.82, [('لأنهم كانوا أكثرَ الناس', 0)]),
    (13.82, 15.96, [('وأنهم بايعوه في العقبة', 0)]),
    (15.96, 19.20, [('فخشي النبيُّ ', 0), (H, 1), (' أنَّ الأنصار', 0)]),
    (19.20, 23.02, [('لا يرون بأنَّ نُصرةَ النبيِّ ', 0), (H, 1), (' واجبة', 0)]),
    (23.02, 25.00, [('إذا كانت خارجَ المدينة', 0)]),
    (25.00, 26.78, [('قال: أشيروا عليَّ أيها الناس', 0)]),
    (26.78, 30.08, [('فقام أبو بكر الصديق فتكلَّم فأحسن ', 0), (R, 1)]),
    (30.08, 33.64, [('ثم قام عمر الفاروق فتكلَّم فأحسن ', 0), (R, 1)]),
    (33.64, 36.68, [('ثم قام المقداد وقال كلامًا عظيمًا', 0)]),
    (36.68, 39.54, [('قال: يا رسول الله، آمنّا بك وصدّقناك', 0)]),
    (39.54, 41.84, [('واللهِ يا رسول الله لا نقول لك', 0)]),
    (41.84, 43.96, [('كما قال قومُ موسى لموسى', 0)]),
    (43.96, 47.68, [('﴿ اذْهَبْ أَنتَ وَرَبُّكَ فَقَاتِلَا إِنَّا هَاهُنَا قَاعِدُونَ ﴾', 2)]),
    (47.68, 50.42, [('بل نقول: اذهب أنت وربك فقاتلا', 0)]),
    (50.42, 52.90, [('إنا معكما مقاتلون', 0)]),
    (52.90, 54.66, [('فسُرَّ النبيُّ ', 0), (H, 1)]),
    (54.66, 55.92, [('وابنُ مسعود كان يقول:', 0)]),
    (55.92, 59.38, [('شهدتُ موقفًا من المقداد وددتُ أني صاحبُه', 0)]),
    (59.38, 60.72, [('والحياة يا إخوة مواقف', 0)]),
    (60.72, 61.84, [('الحياة مواقف', 0)]),
]

NIGHT = [0.50, 0.57, 0.78]
NIGHT_FIRE = [0.56, 0.58, 0.74]
DAWN = [0.80, 0.78, 0.86]

# ---------------------------------------------------------------- reusable staging
def ch(who, x, y, h, acts, flip=False, p=1.0, z=None, light=None):
    return dict(type='char', who=who, x=x, y=y, h=h, flip=flip, p=p, z=z if z is not None else y, acts=acts, light=light)

def hs(coat, x, y, h, acts, flip=False, p=1.0, z=None):
    return dict(type='horse', coat=coat, x=x, y=y, h=h, flip=flip, p=p, z=z if z is not None else y, acts=acts)

def img(name, x, y, w, ax=0.5, ay=1.0, p=1.0, z=None, flip=False, alpha=1.0, rot=0):
    return dict(type='img', img=name, x=x, y=y, w=w, ax=ax, ay=ay, p=p, z=z if z is not None else y, flip=flip, alpha=alpha, rot=rot)

def bg(name, sky_p=0.25, land_p=1.0):
    return [dict(type='img', img=f'bg/{name}_sky', x=540, y=960, w=1080, ax=0.5, ay=0.5, p=sky_p, z=-1000),
            dict(type='img', img=f'bg/{name}_land', x=540, y=960, w=1080, ax=0.5, ay=0.5, p=land_p, z=-900)]

def moon(x, y, s=1.0, p=0.12):
    return dict(type='moon', x=x, y=y, s=s, p=p, z=-950)

def fire(x, y, s=1.0, p=1.0, glow=1.0, boost=None):
    return dict(type='fire', x=x, y=y, s=s, p=p, z=y, glow=glow, boost=boost)

def dust(y0, y1, n=40, wind=18, p=1.0, col='#cbb896', a=0.22, z=5000):
    return dict(type='dust', y0=y0, y1=y1, n=n, wind=wind, p=p, col=col, a=a, z=z)

def cam(*keys):
    """keys: (t, zoom, cx, cy, ease)"""
    return [dict(t=k[0], z=k[1], x=k[2], y=k[3], e=k[4] if len(k) > 4 else 'inout') for k in keys]

# consultation ground (BG03) seating chart, everyone faces the unseen point beyond frame-left
FRONT_Y, BACK_Y, THIRD_Y = 1352, 1228, 1135
SEAT = {
    'abubakr': (318, FRONT_Y, 360), 'umar': (472, FRONT_Y + 8, 370), 'miqdad': (628, FRONT_Y - 4, 370), 'muh1': (790, FRONT_Y + 6, 350),
    'ibnmasud': (395, BACK_Y, 300), 'muh3': (550, BACK_Y - 4, 300), 'ans1': (705, BACK_Y + 4, 305), 'ans3': (858, BACK_Y, 308), 'ans2': (1000, BACK_Y + 6, 300),
    'ans4': (782, THIRD_Y, 245), 'ans5': (930, THIRD_Y - 4, 245), 'muh2': (632, THIRD_Y + 2, 240),
}
TURN_ORDER = ['abubakr', 'umar', 'ibnmasud', 'miqdad', 'muh3', 'muh1', 'ans1', 'muh2', 'ans3', 'ans4', 'ans2', 'ans5']

def group(skip=(), overrides=None, turn_at=None, nods=None, idle_h=None):
    els = []
    overrides = overrides or {}
    for i, who in enumerate(TURN_ORDER):
        if who in skip:
            continue
        x, y, h = SEAT[who]
        if who in overrides:
            acts = overrides[who]
        elif turn_at is not None:
            acts = [dict(t=-99, seq='kneel_turn', hold_first=True), dict(t=turn_at + i * 0.13 + (0.05 if i % 2 else 0), seq='kneel_turn')]
        else:
            acts = [dict(t=-99, seq='kneel_turn', frame=-1)]
        if nods and who in nods:
            acts = acts + [dict(t=nods[who], seq='kneel_nod')]
        els.append(ch(who, x, y, h, acts, flip=True, light='fire'))
    return els

FIRE03 = (168, 1470)

def consult_set(extra=(), fg=True):
    e = bg('bg03', 0.3, 1.0) + [fire(*FIRE03, s=0.62), dust(1050, 1600, n=26, wind=10, a=0.14)]
    e += [img('props/bedroll', 1010, 1395, 150, z=1395), img('props/waterskin', 92, 1300, 100, z=1300),
          img('props/spear', 1046, 1230, 17, ay=1.0, z=1100, rot=4), img('props/shield', 1000, 1250, 110, z=1251)]
    if fg:
        e.append(img('fx/fg_rocks_a', 540, 1990, 1500, ay=1.0, p=1.35, z=9000))
    return e + list(extra)

SHOTS = []
def shot(name, t0, t1, els, camera, grade='night', light=None, trans_in=None, sfx_amb=None, note=''):
    SHOTS.append(dict(name=name, t0=t0, t1=t1, els=els, cam=camera, grade=grade, light=light or {}, trans_in=trans_in, note=note))

# SH01 establishing: the expedition's camp, tiny, deep in Wadi Dhafran
camp_far = [img('props/tent_a', 575, 1068, 92, z=1068), img('props/tent_b', 655, 1056, 70, z=1056),
            fire(612, 1080, s=0.09, glow=0.5), hs('bay', 690, 1075, 15, [dict(t=-99, seq='idle', loop=True)], z=1075),
            hs('chestnut', 535, 1078, 14, [dict(t=-99, seq='idle', loop=True)], flip=True, z=1078)]
shot('SH01', 0.0, 3.6, bg('bg01', 0.12) + [moon(362, 162)] + camp_far + [dust(1100, 1900, n=30, wind=26, a=0.16)],
     cam((0.0, 1.0, 560, 980), (3.6, 1.16, 600, 1050)), note='Wadi Dhafran at night, slow push-in revealing the camp')

# SH02 the camp: weapons ready, horses, fire
camp = bg('bg02', 0.18) + [moon(357, 163)] + [
    img('props/tent_b', 885, 1105, 360, z=1105), img('props/tent_a', 250, 1185, 470, z=1185),
    img('props/spear', 452, 1196, 19, z=1197, rot=-3), img('props/spear', 480, 1200, 19, z=1201, rot=5),
    img('props/shield', 505, 1215, 118, z=1216), img('props/waterskin', 120, 1225, 120, z=1226),
    img('props/bedroll', 700, 1206, 150, z=1206), img('props/saddlebags', 985, 1208, 150, z=1209),
    img('props/bundle', 640, 1196, 90, z=1196), img('props/rope', 760, 1225, 90, z=1226),
    hs('bay', 850, 1350, 238, [dict(t=-99, seq='idle', loop=True), dict(t=3.95, seq='look'), dict(t=5.1, seq='idle', loop=True)], flip=True),
    hs('chestnut', 160, 1300, 205, [dict(t=-99, seq='idle', loop=True), dict(t=4.45, seq='tail'), dict(t=5.3, seq='idle', loop=True)]),
    fire(560, 1500, s=0.5),
    ch('muh2', 372, 1572, 300, [dict(t=-99, seq='kneel_idle')], light='fire'),
    ch('ans2', 770, 1590, 305, [dict(t=-99, seq='kneel_idle')], flip=True, light='fire'),
    ch('muh3', 610, 1395, 235, [dict(t=-99, seq='kneel_turn', frame=2)], light='fire'),
    img('props/bowl', 655, 1585, 72, z=1586),
    img('props/sword', 300, 1830, 420, p=1.18, z=8000, rot=-6),
    dust(1150, 1750, n=34, wind=20, a=0.16)]
shot('SH02', 3.0, 5.30, camp, cam((3.0, 1.02, 540, 1300), (5.3, 1.12, 560, 1390)), trans_in=dict(kind='dissolve', d=0.6),
     note='the camp: spears planted, shield, sword - fighting is now certain')

# SH03 the consultation: heads turn toward the unseen point as he stands
shot('SH03', 5.30, 10.24, consult_set(group(turn_at=5.46, nods={'umar': 8.7, 'ans3': 9.25, 'muh1': 9.6})),
     cam((5.30, 1.0, 590, 1170), (10.24, 1.07, 560, 1180)), note='group turns toward the off-screen point, no figure shown')

# SH04 pan from the Muhajirun to the Ansar
shot('SH04', 10.24, 15.96, consult_set(group(nods={'ans5': 14.7}, overrides={'ans1': [dict(t=-99, seq='kneel_turn', frame=-1), dict(t=13.95, seq='kneel_chest')]})),
     cam((10.24, 1.55, 430, 1190), (10.6, 1.55, 430, 1190), (13.6, 1.55, 810, 1170), (15.96, 1.6, 830, 1170)),
     note='camera pans to the Ansar (more numerous); one places a hand on his chest at "bay\'ahu fil-\'Aqabah"')

# SH05 the Ansar, still and attentive
shot('SH05', 15.96, 20.2, consult_set(group(nods={'ans2': 18.4})),
     cam((15.96, 1.9, 850, 1160), (20.2, 1.98, 845, 1165)), note='Ansar close, stillness, firelight')

# SH06 the camp alone in the vast valley - "outside Madinah"
shot('SH06', 19.6, 25.0, bg('bg01', 0.12) + [moon(362, 162)] + camp_far + [dust(1100, 1900, n=30, wind=30, a=0.18)],
     cam((19.6, 1.5, 610, 1060), (25.0, 1.0, 560, 990)), trans_in=dict(kind='dissolve', d=0.6),
     note='slow pull-out: the small camp far from Madinah in the open wadi')

# SH07 the question again
shot('SH07', 25.0, 26.78, consult_set(group()), cam((25.0, 1.22, 560, 1190), (26.78, 1.25, 560, 1192)), note='stillness')

# SH08 Abu Bakr rises and speaks well
ab = [dict(t=-99, seq='kneel_turn', frame=-1), dict(t=26.92, seq='stand_up'), dict(t=28.36, seq='speak'), dict(t=29.62, seq='lower')]
shot('SH08', 26.78, 30.08, consult_set(group(overrides={'abubakr': ab})),
     cam((26.78, 1.62, 360, 1150), (30.08, 1.66, 362, 1140)), note='Abu Bakr rises, gestures, speaks well')

# SH09 Umar rises and speaks well
um = [dict(t=-99, seq='kneel_turn', frame=-1), dict(t=30.42, seq='stand_up'), dict(t=31.62, seq='speak'), dict(t=33.0, seq='lower')]
shot('SH09', 30.08, 33.64, consult_set(group(overrides={'umar': um})),
     cam((30.08, 1.45, 520, 1170), (33.64, 1.5, 515, 1160)), note='Umar rises and speaks')

# SH10 al-Miqdad rises
mq = [dict(t=-99, seq='kneel_turn', frame=-1), dict(t=33.78, seq='stand_up'), dict(t=35.2, seq='stand_idle', loop=True)]
shot('SH10', 33.64, 35.5, consult_set(group(overrides={'miqdad': mq})),
     cam((33.64, 1.85, 628, 1215), (35.5, 2.0, 628, 1160)), note='al-Miqdad prepares, shifts weight and rises; cloak settles')

# BG04 - his speaking position (reverse angle, same place)
def bg04_back(seated=True):
    e = bg('bg04', 0.2) + [moon(243, 386, s=1.25, p=0.1), dust(1250, 1900, n=30, wind=14, a=0.14)]
    if seated:
        for who, x, y, h in (('abubakr', 120, 1330, 205), ('umar', 225, 1338, 215), ('muh3', 330, 1322, 190), ('ans1', 860, 1322, 190),
                             ('ans3', 960, 1334, 205), ('ibnmasud', 1040, 1318, 170)):
            e.append(ch(who, x, y, h, [dict(t=-99, seq='kneel_turn', frame=-1)], flip=True, p=0.95))
    return e

shot('SH11', 35.5, 42.1, bg04_back() + [
    ch('miqdad', 590, 1830, 1160, [dict(t=-99, seq='turn', hold_first=True), dict(t=36.72, seq='turn'), dict(t=37.62, seq='chest')], flip=True, light='moon_rim')],
    cam((35.5, 1.0, 540, 1000), (42.1, 1.05, 545, 990)), note='medium low-angle; hand to chest on "amanna bika wa saddaqnak"')

# SH12 calm, still: the verse quoted (no effects, no movement but a very slow push)
shot('SH12', 41.84, 47.68, bg04_back() + [
    ch('miqdad', 560, 1395, 430, [dict(t=-99, seq='chest', frame=-1)], flip=True, light='moon_rim')],
    cam((41.84, 1.0, 540, 960), (47.68, 1.025, 540, 950)), trans_in=dict(kind='dissolve', d=0.5), grade='night_calm',
    note='sacred quotation: calm, still, silence of effects')

# SH13 "bal naqul ...": the arm opens toward the way ahead, one step forward, firm stillness
mq13 = [dict(t=-99, seq='chest', frame=-1), dict(t=48.32, seq='chest_to_open'), dict(t=50.42, seq='step')]
shot('SH13', 47.68, 52.9, bg04_back() + [ch('miqdad', 830, 1880, 1060, mq13, flip=True, light='moon_rim')],
     cam((47.68, 1.08, 600, 1040), (50.3, 1.1, 590, 1035), (52.9, 1.13, 570, 1030)), note='peak: low angle, stillness after the step')

# SH14 the Prophet was pleased: companions' reactions, warmth rises (no figure shown)
mq14 = [dict(t=-99, seq='step_lower', hold_first=True), dict(t=53.0, seq='step_lower')]
shot('SH14', 52.9, 54.66, consult_set(group(skip=('miqdad',), nods={'abubakr': 53.05, 'umar': 53.25, 'muh1': 53.5, 'ans1': 53.7, 'ans3': 53.9, 'ibnmasud': 54.05}) +
                                       [ch('miqdad', 560, FRONT_Y - 30, 400, mq14, flip=True, light='fire', z=FRONT_Y - 30)]),
     cam((52.9, 1.12, 560, 1180), (54.66, 1.16, 560, 1175)), light=dict(fire_boost=[52.9, 54.6]), note='warm light swells; quiet acknowledgement')

# SH15 Ibn Mas'ud: "I witnessed a stand from al-Miqdad I wished were mine"
im15 = [dict(t=-99, seq='kneel_turn', frame=-1), dict(t=58.05, seq='kneel_chest')]
shot('SH15', 54.66, 59.9, consult_set(group(skip=('miqdad', 'ibnmasud', 'muh1', 'ans1', 'ans3', 'ans2')) + [
    ch('miqdad', 560, FRONT_Y - 30, 400, [dict(t=-99, seq='step_lower', frame=-1)], flip=True, light='fire', z=FRONT_Y - 30),
    ch('ibnmasud', 820, 1585, 980, im15, flip=True, p=1.1, light='fire', z=8500)], fg=False),
     cam((54.66, 1.0, 600, 1300), (59.9, 1.06, 640, 1330)), note='over Ibn Masud toward al-Miqdad; hand to chest on "wadidtu"')

# SH16/17 before dawn: time has passed; al-Miqdad with his horse, the camp readying; title
dawn = bg('bg05', 0.2) + [
    hs('chestnut', 395, 1345, 150, [dict(t=-99, seq='idle', loop=True), dict(t=61.2, seq='tail'), dict(t=62.3, seq='idle', loop=True)], flip=True),
    ch('muh1', 488, 1352, 235, [dict(t=-99, seq='strap', loop=True)], light='dawn'),
    hs('bay', 720, 1560, 300, [dict(t=-99, seq='idle', loop=True), dict(t=60.3, seq='look'), dict(t=61.6, seq='idle', loop=True),
                               dict(t=62.9, seq='snort'), dict(t=63.9, seq='shift'), dict(t=64.75, seq='idle', loop=True)]),
    ch('miqdad', 300, 1790, 760, [dict(t=-99, seq='hold_rope', loop=True)], light='dawn'),
    dust(1300, 1900, n=46, wind=22, a=0.2, col='#e8c99a'),
    img('fx/fg_rocks_b', 540, 2010, 1500, ay=1.0, p=1.3, z=9000, alpha=0.9)]
shot('SH16', 59.2, 66.4, dawn, cam((59.2, 1.12, 560, 1360), (62.0, 1.06, 550, 1300), (66.4, 1.0, 540, 1240)), grade='dawn',
     trans_in=dict(kind='dawn', d=0.9), note='pre-dawn valley: same mountains, time passed; title')

TITLE = dict(t0=62.15, t1=66.4, main='موقف المقداد', sub='رضي الله عنه', fade_out=[65.75, 66.4])

# ---------------------------------------------------------------- SFX cue list (synced to the actions above)
def sfx():
    ev = []
    # ambience beds: (t0, t1, kind, level)
    ev += [dict(k='wind', t0=0, t1=3.6, g=0.9), dict(k='wind', t0=3.0, t1=5.3, g=0.55), dict(k='fire', t0=3.0, t1=5.3, g=0.9),
           dict(k='wind', t0=5.3, t1=19.9, g=0.38), dict(k='fire', t0=5.3, t1=19.9, g=0.42),
           dict(k='wind', t0=19.6, t1=25.0, g=1.0), dict(k='fire', t0=25.0, t1=35.5, g=0.42), dict(k='wind', t0=25.0, t1=35.5, g=0.35),
           dict(k='wind', t0=35.5, t1=41.7, g=0.45),
           # sacred quotation 41.84-47.68: no effects at all (beds fade out before, return after)
           dict(k='wind', t0=47.9, t1=52.9, g=0.42), dict(k='fire', t0=52.9, t1=59.6, g=0.5), dict(k='wind', t0=52.9, t1=59.6, g=0.3),
           dict(k='wind', t0=59.3, t1=66.4, g=0.7), dict(k='dawn_air', t0=59.3, t1=66.4, g=0.6)]
    # spot effects, each tied to a visible action (peak lands on the drawing that causes it)
    ev += [dict(k='snort_far', t=1.9, g=0.25),
           dict(k='hoof', t=4.05, g=0.5), dict(k='tailswish', t=4.55, g=0.45),
           dict(k='rustle', t=5.5, g=0.35), dict(k='rustle', t=5.9, g=0.3), dict(k='rustle', t=6.35, g=0.28),
           dict(k='rustle', t=14.0, g=0.3),
           dict(k='rustle_long', t=27.0, g=0.55), dict(k='step', t=27.35, g=0.45), dict(k='step', t=28.15, g=0.35), dict(k='rustle', t=28.45, g=0.35),
           dict(k='rustle_long', t=30.5, g=0.55), dict(k='step', t=30.85, g=0.45), dict(k='step', t=31.6, g=0.35), dict(k='rustle', t=31.7, g=0.35),
           dict(k='rustle_long', t=33.86, g=0.65), dict(k='step', t=34.22, g=0.5), dict(k='step', t=35.0, g=0.42), dict(k='cloak', t=35.12, g=0.45),
           dict(k='rustle', t=37.72, g=0.4),
           dict(k='cloak', t=48.55, g=0.55), dict(k='step', t=50.93, g=0.75), dict(k='cloak', t=51.0, g=0.5),
           dict(k='rustle', t=53.1, g=0.3), dict(k='rustle', t=53.6, g=0.25),
           dict(k='rustle', t=58.15, g=0.32),
           dict(k='hoof', t=60.45, g=0.4), dict(k='leather', t=60.0, g=0.4), dict(k='leather', t=60.75, g=0.35), dict(k='leather', t=61.5, g=0.35),
           dict(k='tailswish', t=61.3, g=0.35), dict(k='leather', t=62.25, g=0.3), dict(k='snort', t=63.1, g=0.55),
           dict(k='hoof', t=64.3, g=0.5), dict(k='hoof', t=64.55, g=0.35), dict(k='leather', t=63.0, g=0.28)]
    return ev

film = dict(W=1080, H=1920, fps=24, dur=DUR, narr_end=NARR_END, cues=CUES, shots=SHOTS, title=TITLE, sfx=sfx(),
            calm=[41.84, 47.68])
json.dump(film, open('/home/user/miqdad_film/build/film.json', 'w'), ensure_ascii=False, indent=1)
print('shots', len(SHOTS), 'cues', len(CUES), 'sfx', len(film['sfx']))
