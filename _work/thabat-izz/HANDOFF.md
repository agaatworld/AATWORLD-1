# «الثبات عز» — channel handoff for the next Claude Code session

Read this whole file before doing anything. It replaces the long chat history of the session that ended on 21 Nov 2026.

## 0. Start here (first 10 minutes of the new session)
1. This file lives in the public repo `agaatworld/AATWORLD-1`, branch `claude/taiz-logo-design-edits-fcpctx`, folder `_work/thabat-izz/`
   (code, configs, transcripts, studio edits). The repo is PUBLIC: never commit fonts, private photos or unreleased videos there.
2. Private files (fonts, photos, enhanced portraits, brand kit, sound effects, branded images) are in the PRIVATE handoff artifact:
   **https://claude.ai/artifact/GxcScwGz3SNA6y3e78vVs7** (Thabat Izz handoff). Get them with the Artifact tool, `action: "read"`, `path: "<published path>"`
   (list them with `action: "list", scope: "files"`). Paths are listed in §9.
3. Run `_work/thabat-izz/setup.sh <your-scratchpad-dir>` after fetching the private files into `<scratchpad>/handoff/private/`.
   It rebuilds the folder layout the scripts expect and rewrites the old hard-coded paths (see §8).
4. Models are NOT in the bundle (too big): faster-whisper `large-v3` downloads itself from huggingface.co (allowed);
   Demucs `htdemucs` weights (`955717e8-8726e21a.th`, `04573f0d-f3cf25b2.th` + `htdemucs.yaml`) go in `<scratchpad>/demrepo/`
   (`python3 -m demucs --repo <scratchpad>/demrepo -n htdemucs --two-stems vocals …`). Real-ESRGAN `RealESRGAN_x4plus.pth` → `<scratchpad>/models/`.
   Python packages that were installed: demucs 4.1, faster-whisper 1.2.1, torch, opencv-python-headless, pillow, rembg, spandrel, scipy, soundfile; ffmpeg; yt-dlp; Playwright + Chromium (preinstalled).
5. Final videos from the old session are NOT transferable here (container is gone). The owner already has every delivered video in the chat.
   Re-render from sources when a change is needed. Source videos must be re-downloaded (links in §6) or re-uploaded by the owner (§6).

## 1. Who and how to talk
- Owner of the Facebook channel/page **«الثبات عز»** — Taiz, Yemen. Logo slogan **«الكلمة مقاومة»**, cover slogan **«كلنا مقاومة»**.
- Writes Arabic (sometimes English, sometimes capitals). **Reply in short, plain Arabic.** Outcome first, no jargon. Say exactly what changed and where.
- Sends Facebook links in batches, uploads videos/photos, and long "MASTER PROMPTS" written by ChatGPT. When a master prompt conflicts with the
  standing rules below (e.g. "keep the song", "green/red palette"), follow the owner's own standing rules and say so in one line.
- Always look at the result (frames/contact sheets) before saying it is done. Send files with SendUserFile.

## 2. Standing rules (owner's, non-negotiable)
1. **No music.** Every video is checked; any music/instruments are removed (Demucs two-stem) and only voices stay (speech, chants, vocal-only nasheed).
   Exception only if the owner explicitly asks for a song — and then still remove instruments unless he says otherwise.
2. **Landscape source → square 1:1 (1080×1080)**: video panel in the middle, the rest designed in channel style. Vertical sources → Reels 1080×1920.
3. **Captions inside the Reels safe zone**: keep clear of top 270 px, bottom 420 px, right 120 px (on 1080×1920). Word-by-word with the voice.
   Strong words get an effect (orange, scale-slam, glow, underline, sparks, small picture punch) — 1–2 per line, never every word.
4. Main person always in the centre; never cover a speaker's face/mouth with text.
5. Rings draw themselves at the start, then rotate slowly with the voice; amber arrows (chevrons) enter on each new idea.
6. Outro: smooth 0.6 s cross-fade into the brand outro — **no frozen frame**. Intro/outro = lens/iris effect, calm foley (camera, wind, air), hold 1–2 s, fade.
7. Source always credited clearly at the bottom («المصدر: …»), no extra empty space under it.
8. Logo in ONE corner only. Never show other channels' logos, handles, end cards, CapCut screens.
9. Covers use **«كلنا مقاومة»** (not «الكلمة مقاومة»).
10. When adding a nasheed: a strong part that fits the meaning, vocal only.
11. Caption text: owner corrects it in the **captions studio** (§5). Use his wording exactly. Leave unclear lines uncaptioned unless he supplies the words.
12. Don't caption dehumanising sectarian lines (e.g. a verse calling a whole sect «أنتن الخلق» was cut from the poem); explain briefly. Political chants
    against the Houthi militia are the owner's content and were kept.
13. Sound effects: from Mixkit (free licence), matched to context (wind for mountains, sea for Bab al-Mandab, heartbeat for martyrs), quiet,
    ducked under the voice, no heavy bass, nothing repeated. Mixkit downloads: `https://assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`.
14. Export for phones: **H.264 High, yuv420p, level 4.1, AAC 48 kHz, +faststart, ~−14 LUFS**. (A yuv444 export once failed to play on the owner's phone.)

## 3. Brand
- Colours (60/30/10): navy `#0F1B2D` (backgrounds) · steel blue `#2E4A68` (rings, panels) · amber `#F2A541` (lines, arrows, frames) ·
  warm white `#F4E9D8` (all text) · orange `#FF8A3D` («عز» and the ONE highlighted word). Muted grey `#A8B3C1` for source credits.
  Forbidden: long red/orange text, more than 2 highlighted words, pure white on pure black.
- Fonts: **Thmanyah Serif Display** (titles), **Thmanyah Sans** (captions, body, «الثبات عز»). Also Thmanyah Serif Text, Amiri Quran (verses), Reem Kufi.
  Fonts are in the private artifact only (do not redistribute publicly).
- Logo: round, dark version on screens (`01-logo/logo-dark-round-*.png`), video corner badge `01-logo/video-corner-badge-256.png`. Never stretched/recoloured.
- Brand kit (private artifact, `brand-kit/…`): logos, colour sheet, font sheet, intro/outro videos (vertical 1080×1920, 1080×1440, landscape),
  Facebook covers (1640×924, many options), post/reel templates, 6 backgrounds, icons, one-page guide.
- Generators that made the kit (public repo `_work/thabat-izz/code/brand/`): `anim5.py` (logo intro/outro lens animation + foley),
  `kit.py`/`guide.py`/`bgpat2.py` (kit pages, backgrounds), `cov.py`/`cover5.py` (Facebook covers).

## 4. Pipelines (all in `_work/thabat-izz/code/`)
- **Download**: `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 --write-info-json <facebook link>`. Some reels fail with "Cannot parse data"
  (login-only) → ask the owner for the file. YouTube: hosts are allowed now but YouTube answers "Sign in to confirm you're not a bot" — do NOT try to
  bypass it (switching clients was blocked as unauthorised); ask the owner to upload the audio/video file.
- **Music removal**: `python3 -m demucs --repo <scratch>/demrepo -n htdemucs --two-stems vocals -o sep in.wav` → `sep/htdemucs/<name>/vocals.wav`.
  Check: voice minus accompaniment in dB (qc.py prints it; >30 dB = clean).
- **Transcription**: `code/common/asr.py file.wav …` (faster-whisper large-v3, int8, Arabic, word timestamps → `file.json`).
  Known hallucinations on silence/music: «اشتركوا في القناة», «ترجمة نانسي قنقر» — ignore. Dialect lines are often wrong → owner fixes in studio.
- **Captions studio** (§5) → owner edits/approves → read edits with ArtifactData → re-render.
- **Renderers**
  - `reels/kreel.py cfg.json` — full-screen motion-graphics reel (word-by-word, strong-word slam/glow/sparks, sound-only clips over b-roll). Configs `data/configs/k_r*.json`.
  - `fb-reels/fbreel2.py v1|v2|v3 [still t…]` — vertical 1080×1920 reel with the clip in a framed panel on the navy stage, cover card 0.8 s with lens flash,
    word-by-word captions, rings/chevrons/dust, context foley mix, brand outro. Edits for the first Facebook batch (§6-B).
  - `square/fbsq.py cfg.json render <part> <parts> | finish <parts> | still t…` — square 1:1 for landscape sources (parallel parts, then finish = concat +
    sound mix + outro). Configs: `data/configs/cfg_khatib.json`, `cfg_poem.json`, `cfg_taiz.json` (segments, crop, panel, captions, sfx, beds).
  - `procession-film/film.py render <part> <parts> | still t… | finish <parts>` + `timeline.py` — the 6-minute cinematic funeral film (§7-A).
  - `memorial-design/` — biography designs of الشهيد رائد الكحلاني (HTML → PNG with Playwright): `src/content.py` (all text), `src/build.py`, `src/render.js`.
- **QC**: `qc.py file.mp4` → size, fps, duration, LUFS, true peak, music check (Demucs), longest frozen run, contact sheet. Always also look at frames.
- Long renders: run parts in parallel with `nohup … &`, wait with the Monitor tool (until-loop), never `sleep` chains. Disk is limited (~250 GB shared,
  the session allowance filled up once) — delete `*_p*.mp4`, `*_body*.mp4`, `sep/` folders after finishing.

## 5. Artifacts (claude.ai, private to the owner)
- **Captions studio**: https://claude.ai/artifact/MTuMYL8NLb2d5eiqMLB2cm — one tab per video, ▶ per line, owner edits text and presses «تم ✓».
  Data: `code/studio/data.json` (videos, lines with times, review notes) rendered into `template.html` (`__DATA__`). Audio per video at `audio/<key>.mp3`.
  Saved edits live in its database, collection `lines`, doc id `<key>-<nnn>` (`text`, `done`, `a`, `b`, `original`). Export of all saved edits at the
  time of handoff: `data/studio-edits/lines/*.json`. Keys: r1 r2 r3 girl nasheed field saghir jafri (older reels), fb1 fb2 fb3 (first Facebook batch),
  sq1 sq2 sq3 (khatib, poem, Taiz — **not reviewed yet**).
  To add a video: append to data.json, rebuild index.html from template, publish with `files: {"audio/<key>.mp3": …}` to the same URL.
- **Private handoff bundle**: https://claude.ai/artifact/GxcScwGz3SNA6y3e78vVs7
- Other: "AAT Name Cards" artifact belongs to the OTHER project in this repo (AAT World) — not this channel.

## 6. Every link the owner sent (status at handoff)
A. Older work (before 20 Nov): 7 videos transcribed and edited, reels in `reels-nov20` (01 «نحن أحفاد الصحابة», 02 «طفلة من تعز… يا رب», 03 «وصيّة أمّ من تعز»),
   Facebook covers, logo/brand work, brand kit. Delivered.
B. First Facebook batch (20 Nov) — edited with `fbreel2.py`, delivered v2 (cover, word captions with effects, foley, owner's studio edits):
   - https://www.facebook.com/share/v/1Ea3DaNvRr — فهيم المخلافي, elderly woman with rifle → `01-umm-taiz-mansoorin.mp4` (line 7 «إنّا نشتي…» left uncaptioned: unclear).
   - https://www.facebook.com/share/v/1CvuFAbkzS — مقدام الدباء, «سنقاوم سنقاتل» → `02-raed-alkahlani-sanuqawim.mp4` (AI fighter replaced by the real photo; music removed; ends at «بإذن الله»; voice NOT attributed to the martyr).
   - https://www.facebook.com/share/r/19xev832Dr — أديم الأرض, Bab al-Mandab → `03-bab-almandab.mp4` (insults 10.3–16.6 s cut; owner edits «طب أين هي»، «الموت لأمريكا»، «استهداف المسلمين»).
   - https://www.facebook.com/share/v/1NKSQzgwV4 (= reel 1762821274824063) — **login-only, never downloaded. Need the file.**
   - Analysis text for ChatGPT: `data/reports/analysis-4-videos.txt`.
C. Second batch (21 Nov) — square 1:1 with `fbsq.py`, delivered, **captions awaiting owner review in studio tabs sq1–sq3**:
   - https://www.facebook.com/share/v/1JYSt8dTMC — عدي فهد الكحلاني, khatib of Al-Saeed mosque at the funeral → `04-khatib-alsaeed-raed-alkahlani.mp4` (CapCut end screen removed).
   - https://www.facebook.com/share/v/1WcVh15q9v — عدنان رزيق القميشي, poem «قبلة المدن» → `05-qiblat-almudun.mp4` (text taken from the burned-in subtitles; music intro removed; sectarian verse 127.6–133.6 s cut).
   - https://www.facebook.com/share/v/1D7uqmMLur — login-only; the owner UPLOADED it («369K views… video.mp4», Taiz «قالت تعزّ قلت عزّ», منصة عبدالله خليدي) → `06-taiz-ishqtuki.mp4` (other page's red card + logo cropped out; music removed).
   - Two photos (embrace B&W, boy with jambiya) → light brand touch: `brand-touch/hug-brand.jpg`, `boy-brand.jpg`.
D. Funeral procession film — 5 uploaded parts «00-00…01-30», «01-30…03-00», «03-00…04-30», «04-30…05-30», «05-30…06-22» (406×720, total 6:22)
   + song «قسماً بربك يا شهيد» https://youtu.be/Cs-W6tCbp4o (YouTube refused the download: "Sign in to confirm you're not a bot" — do NOT bypass; the owner UPLOADED the song video instead, 6:11, 450×360).
   DONE and delivered (21 Nov):
   - `procession-film/janazat-raed-alkahlani-taiz.mp4` — crowd/commentator sound version, 6:26 (`film.py` + `timeline.py`).
   - `procession-film/qasaman-ya-shahid-raed-alkahlani-film.mp4` — SONG version, 4:19, 1080×1920, −14 LUFS (`film2.py` + `timeline2.py`), the one the owner asked for.
   - `song-qasaman/` — song without the music-only intro, music removed (mp4 + vocals mp3) and the transcript (`data/transcripts/song-qasaman.txt`).
   Waiting for the owner's verdict on the song film. If the owner sends 2–3 photos of the martyr, swap them into PHOTO in `timeline2.py`.
E. Last batch (21 Nov, sent just before handoff, no instruction yet — channel-style edits expected; ask nothing, just follow the rules):
   - https://www.facebook.com/reel/1503231298323095/ — أحمد عبدالعليم الرامسي, 98.6 s, 360×640, about «القائد رائد رحل وترك خلفه ألف قائد» (fighters seated on rocks; a speech with verses, ends «نستشهد ألفاً كي تعيش عقيدته…»), no music — NEW.
   - https://www.facebook.com/reel/4558136637739612 — محمد مهيوب احمد علي, 239 s, 720×960, nasheed «ما وهنا» (حمزة عبدالجبار الحميدي, on stage: «قباب الحق خوذتنا… خذ دمانا نحن من يروي اللواء»), no music detected — NEW.
   - https://www.facebook.com/reel/1762821274824063 — login-only (same as B-4). Need the file.
   - https://www.facebook.com/share/r/1E41LhZXJk/ — قناة يمن شباب, «وصية أم من تعز» 21 s — ALREADY DONE (reel 03, Nov 20).
   - https://www.facebook.com/share/r/1CSznNJEbC/ — يوسف العليمي, «طفلة من تعز» 19 s — ALREADY DONE (reel 02 / girl).
   - https://www.facebook.com/share/r/19zkmR88d1/ — ابراهيم الجندبي, العميد عمار الجندبي 20.7 s, 960×1280 («الحوثيون الآن يدافعون عن صنعاء في تعز…»), no music — NEW.
   - https://www.facebook.com/share/r/1AFS3YXyUN/ — عبدالله قديش, 28.6 s, 1080×1920, man on a mountain road singing «نحن أحفاد الصحابة» — ALREADY DONE (reel 01, Nov 20; owner's wording «يدكّ معاقل الرفض العين», not «اللعين»). Has music.
   - https://www.facebook.com/share/v/18oUrC9BuU/ — ميون للإنتاج الفني والإعلامي, nasheed «حي على الجهاد» 25.8 s, 1920×1080 (landscape → square; «سنعيش أحرارا وقادة…»), heavy music → vocals only — NEW.
   - Repeated in that message (already done): 1D7uqmMLur, 1WcVh15q9v, 1JYSt8dTMC (with the khatib caption text).
   - Raw transcripts + music check of this batch: `data/transcripts/new-batch-all.txt` and `new-batch-*.json` (not reviewed by the owner yet).
   - So the NEW ones to edit: 1503231298323095 (الرامسي), 4558136637739612 (ما وهنا), 19zkmR88d1 (الجندبي), 18oUrC9BuU (حي على الجهاد).

## 7. Open tasks (in priority order)
A. **Song film — owner's verdict** (`procession-film/film2.py` + `timeline2.py`). Film clock = song clock; 0 = first «قسماً» (= 42.3 s in the uploaded song).
   Song audio: `<scratch>/fb8/work/v_norm.wav` (Demucs vocals of 42.3–295.3 s, −14 LUFS) — recreate from the uploaded song if the scratchpad is gone:
   cut 42.3–295.3 → Demucs two-stems → loudnorm −14. Shot plan `SEGS`, camera keys, `mood(t)`, effects (warm sweep, amber streaks, heritage frame,
   converge «عدنٌ/وصنعا», expand «كلُّ الحدود», pulse «تجري بقلبي كالدمِ»), climax «الكلُّ شعبٌ واحدٌ سيعيشُ خفّاقَ البنود», designed closing frame
   (logo + «الثبات عز» + «الكلمة مقاومة», no animated outro — the owner's prompt forbids a generic outro). Uncertain word «ولْتَزُلْ» could not be verified → omitted on screen.
   Commands: `python3 film2.py render <i> 4` ×4 in parallel, then `python3 film2.py finish 4`.
   The crowd film's closing card says «18/11/2026» (from the biography); the owner corrected video 02 to 19/11 — ask if the film card should also be 19/11.
B. **Square videos sq1–sq3**: read the owner's studio edits (`ArtifactData query lines where key in [sq1,sq2,sq3]`), patch `caps` in the cfg JSONs, re-render.
   Points to confirm: khatib line 2 «الهصور» (heard «اليسور»), line 6 «معركة ذات المصابيح»; poem lines 9–10 (not in the burned subtitles); the whole Taiz poem.
C. **Last batch (§6-E)**: edit the 4 NEW videos in channel style (vertical → reel with fbreel2-style panel; landscape nasheed → square with fbsq), add them to the studio.
D. **Memorial design** (`memorial-design/`): owner to choose 1 of 3 (سجلّ الشرف / القائد / الوثيقة); asks pending: photographer credit name (cut-off «…اد البريهي»
   on the original photo), whether «يوليو 2016» should be «يوليو 2015». Cut-out was redone to keep both his arms and the rifle hand. Main points are big, details small.
E. Need the file for reel 1762821274824063.
F. **«شاهد على العصر» transcript** (asked 21 Nov): PDF + TXT, easy to read, sectioned by question/answer, NO added titles except the episode title,
   clickable table of contents ("glossary"). Waiting for the owner to say WHICH episode (guest + episode number) or send the file/link.

G. **«معركة ضاويله الليلية» animated short** (23 Nov, delivered `/home/user/final/dhawila/maarakat-dhawila-allayliya.mp4` + cover).
   Source: owner's upload «01-raed-dars-akbar-min-alrutba-preview.mp4», narration 32.6–72.12 s (voice نائف الوافي), captions text = the video's own captions.
   Owner rules for this style: characters FACELESS (no eyes/eyebrows/nose/mouth; keep hair, beard, head wraps); no women; no music; the 4 Qwen-Image scenes are the approved look.
   Code `code/dhawila/`: `dhawila.py` (12 shots, depth-parallax camera, light effects, captions, closing), `faceless.py` (face polygons), `upscale.py` (Real-ESRGAN x4 → x2), `cover.py`.
   Scene images came from HF Qwen-Image (free ZeroGPU quota ran out after 5 images; resets daily) — regenerate missing scenes (teamwork, rooftop solar, courtyard) when quota allows.
   Background song https://m.youtube.com/watch?v=Y7F6BczCJNc — YouTube blocked the download (bot check, do NOT bypass): **owner must upload the file**; then add its vocals only, ducked under the narration.

## 8. Paths the scripts expect (setup.sh recreates them)
- Old scratchpad prefix in code: `/tmp/claude-0/-home-user/8669a2c6-823d-5c8d-abc7-7cd4bd87201e/scratchpad/` → replace with the new scratchpad (setup.sh does it).
- `<scratch>/taiz/fonts/th/*.ttf` (Thmanyah), `<scratch>/sfx3/m<id>.wav` (sound effects; scripts also look in sfx/s and sfx2/m),
  `<scratch>/demrepo/` (Demucs weights), `/home/user/final/brand-kit/` (brand kit), `/home/user/final/kahlani/assets/` (portraits, logo, textures),
  outputs: `/home/user/final/fb-edits/`, `/home/user/final/fb-edits2/`, `/home/user/final/procession-film/`, `/home/user/final/song-qasaman/`.
- Song work files: `<scratch>/fb8/song.mp4` (uploaded), `<scratch>/fb8/work/` (`asr.py`, `voc.json`, `v_norm.wav`); `film2.py` reads `fb8/work/v_norm.wav`.

## 9. Private artifact contents (published paths)
- `fonts/*.ttf` — Thmanyah Sans/Serif Display/Serif Text (all weights), Amiri Quran, Reem Kufi
- `brand-kit/…` — the whole kit (logos, colours, fonts sheet, intro/outro mp4, covers, templates, backgrounds, icons, guide, channel-rules.txt)
- `assets/kahlani/…` — portrait_focus_full.jpg (him in focus), portrait_focus_tall.jpg, portrait_cut.png (clean cut-out, both arms), portrait_original.jpg,
  portrait_enhanced_x4.jpg, logo.png, topo.png, paper.jpg, navy.jpg, distress.png, distress_soft.png
- `photos/…` — raed-original-p1.jpg (real photo), raed-p2-ai-like-not-used.jpg, hug-original.jpg, boy-original.jpg
- `brand-touch/…` — hug-brand.jpg, boy-brand.jpg
- `sfx/m<id>.wav` — Mixkit clips used: 163 166 167 490 494 498 788 1143 1196 1267 1432 1433 1436 1437 1461 1474 1482 1489 2299 2427 2658 3077
  (ids → names: 1433 camera lens shutter, 1436 camera auto focus, 1437 lens autofocus, 1432 digital shutter, 1474 transition windy swoosh,
  1461 short wind swoosh, 1482 ending wind swoosh, 1489 air woosh, 166 fast small sweep, 163 slow sweeping swoosh, 167 air sweep, 1143 cinematic whoosh deep impact,
  788 big cinematic impact, 2299 short bass hit, 498 deep heartbeat impact, 490 single heartbeat, 494 slow heartbeat, 1267 wind on mountain top,
  2427 breeze through trees, 2658 wind blowing ambience, 1196 sea waves loop, 3077 ship engine loop)

## 10. Pitfalls learned
- Phones refused a yuv444 H.264 file → always `-pix_fmt yuv420p -profile:v high -level 4.1`.
- Disk filled during a render (exit 228) → clear `~/.cache/pip`, old `vid*` scratch folders, part files.
- `np.convolve` on minutes of audio is extremely slow → use `scipy.ndimage.uniform_filter1d`.
- Shell: `sleep N; cmd` chains are blocked → use Monitor with an until-loop. Background jobs die after 30 min unless `nohup … &`.
- Whisper large-v3 hallucinates on music/silence; dialect needs the owner's correction.
- Facebook reels sometimes need login → owner uploads the file. YouTube bot check → owner uploads the file.
- Arabic text: render with PIL + RAQM (`layout_engine=ImageFont.Layout.RAQM`, `direction='rtl', language='ar'`); give words at least 0.40× size spacing
  (tight spacing made «أكبر ولله» look joined); numbers keep LTR inside Arabic.
- CSS `mask-image` with file:// fails (CORS) → serve HTML over `python3 -m http.server` for Playwright renders.
- The repos in this session are PUBLIC — keep private material in artifacts.
