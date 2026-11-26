# four different covers for Video 1 — real frames + real words from the poem, one centre axis, faces kept clear
import sys
sys.argv = [sys.argv[0], 'none']
import q1
from q1 import *
OUTD = '/home/user/final/video1-qasida/'
os.makedirs(OUTD, exist_ok=True)
def fr(t, mode='natural'):
    q1.CAP = None; return tone(frame_src(int(t * FPS)), mode)
def slogan(c, y=1480, col=BRONZE_L):
    sl = text([('كلنا', col), ('مقاومة', col)], 'almarai', 44); c = paste(c, sl, CX, y); hw = sl.shape[1] / 2 + 24
    for sg in (-1, 1): c = hair(c, CX + sg * hw, y, CX + sg * (hw + 100), y, col, 1.0, 3)
    return c
def finishc(c, name):
    c = mg.put(c, LOGO118, 118, 348); save(np.clip(c + np.random.default_rng(1).standard_normal((H, W, 1)) * 2.2, 0, 255), OUTD + name, 94); print('ok', name)
def T(words, fk, size, cols): return text(list(zip(words, cols)), fk, size)

# 1 — PEAK: the real frame, monumental words above the face
c = fr(22.0, 'peak'); c = vignette(c, 0.5); c = dark_band(c, 240, 640, 0.7); c = dark_band(c, 1290, 1560, 0.7)
t1 = T(['يا', 'دهرُ'], 'naskh', 230, [PARCH, PARCH]); t2 = T(['أفِق', 'حدِّق'], 'naskh', 140, [BRONZE_L, BRONZE_L])
c = paste(c, np.dstack([np.zeros(t1.shape[:2] + (3,), np.float32), cv2.GaussianBlur(t1[..., 3], (0, 0), 14) * 0.8]), CX + 6, 440 + 12); c = paste(c, t1, CX, 440)
c = paste(c, t2, CX, 1335); c = slogan(c)
finishc(c, 'cover-1-peak-ya-dahru.jpg')

# 2 — ARCHIVE PRINT: parchment, taped photograph, title and the real line in manuscript
c = G_PAR.copy(); f = np.clip(fr(66.0, 'archive') * 1.1 + 8, 0, 255)
c = place_footage(c, f, int(66.0 * FPS), 110, 300, 860, 760, fit=0.01, border=(PARCH, 10), rot=-1.5)
tape = np.dstack([np.broadcast_to(C('D9CDB2'), (56, 190, 3)).astype(np.float32), np.full((56, 190), 0.85, np.float32)])
c = paste(c, tape, 200, 320, 1, 1, -36); c = paste(c, tape, 880, 320, 1, 1, 38)
c = paste(c, T(['ابنُ', 'الأنصارِ'], 'naskh', 150, [INK, BRONZE_D]), CX, 1185)
c = paste(c, T(['أنا يا قومُ ابنُ الأنصارِ، ابنُ الأخيارِ الأثباتِ'], 'amiri', 50, [INK]), CX, 1340)
c = paste(c, seal_stamp(220, SEAL), 880, 1020, 1, 0.85, -14); c = slogan(c, col=BRONZE_D)
finishc(c, 'cover-2-archive-ibn-alansar.jpg')

# 3 — SEAL CIRCLE: the driver inside the brand rings, the closing vow sealed below
c = vignette(G_DARK.copy(), 0.45)
OY = 680
for r, a, tk, rot in ((400, 0.45, 120, 3), (460, 0.26, 72, -2)): c = ring(c, CX, OY, r, SILVER, a, 2, ticks=tk, tick_len=7, rot=rot)
f = fr(15.5, 'natural'); c = place_footage(c, f, int(15.5 * FPS), CX - 360, OY - 360, 720, 720, mask=round_mask(720, 720, 360), fit=0.7, border=(BRONZE_L, 4))
c = ring(c, CX, OY, 430, BRONZE_L, 1.0, 4, arc=(-30, 235)); c = spark(c, CX + np.sin(np.deg2rad(235)) * 430, OY - np.cos(np.deg2rad(235)) * 430, BRONZE_L, 1.0)
c = paste(c, T(['ماضٍ', 'في', 'جِدّي'], 'naskh', 110, [PARCH, PARCH, PARCH]), CX, 1185)
c = paste(c, seal_stamp(180, BRONZE_L), CX, 1345); c = paste(c, T(['وثباتي'], 'naskh', 80, [BRONZE_L]), CX, 1345); c = slogan(c)
finishc(c, 'cover-3-seal-wa-thabati.jpg')

# 4 — THE STAFF: typographic cover, a bronze staff divides the frame, the footage as a slim window
c = G_DARK.copy(); f = fr(40.5, 'duo')
c = place_footage(c, f, int(40.5 * FPS), 140, 760, 800, 500, mask=round_mask(800, 500, 16), fit=0.01, border=(BRONZE * 0.9, 2))
c = hair(c, CX, 735, CX, 1285, BRONZE_L, 1.0, 6); c = c + (BRONZE_L - c) * (np.exp(-((xx - CX) / 22) ** 2) * ((yy > 735) & (yy < 1285)) * 0.25)[..., None]
c = paste(c, T(['فعصا', 'الحقِّ'], 'naskh', 170, [BRONZE_L, BRONZE_L]), CX, 455)
c = paste(c, T(['ستبتلعُ', 'الفرعونَ'], 'naskh', 100, [PARCH, PARCH]), CX, 640)
c = paste(c, T(['وكلَّ', 'الحيّاتِ'], 'naskh', 96, [PARCH, SEAL_L]), CX, 1370)
c = slogan(c)
finishc(c, 'cover-4-staff-fa-asa-alhaqq.jpg')
