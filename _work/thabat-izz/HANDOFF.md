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

H. **Light-theme motion-graphics reels** (24 Nov) — `/home/user/final/reels-light/` + code `code/reels-light/` (engine `mg.py`).
   01 «سجل يا تاريخ» (speaker, source page «نفحات جهادية», their frame cropped away), 02 «كيف يا قرآن ربيت الرجال» (Quran ceremony + nasheed, vocals only),
   03 comparison «الحوثي يسب / السنة» (`v12.py`): the WHOLE Houthi compilation first, each clip pinned as a photo into a gallery strip, then a wall; then the ceremony + its wall; final both walls.
   Owner rules learned: NO text on faces; NO titles invented by me — only real captions + the owner's labels («السنة», «الحوثي يسب»); every video starts with its cover for 0.2 s
   (`with_cover.sh`) and covers must be designed and varied, with «كلنا مقاومة»; strong words + covers in **NT Panorama Naskh** (owner-supplied font, private — not in this repo;
   path in `mg.py` = `<scratch>/fonts_user/NTPanoramaNaskh-Regular.ttf`), captions in Almarai; light theme (cream/amber/navy, a little dark); no music, synthesized SFX (`sfx.py`) allowed.
   Captions studio has keys lt1, lt2, cmp (merged into the live studio, version 8). Source uploads: «1df57dd0…video.mp4», «f1c3803f/211390dd…video.mp4» (same ceremony file), «c19d005a…video_2.mp4».
   v3 of the comparison (`v13.py`, owner's latest brief): split screen — «السنة» top / «الحوثي يسب الصحابة» bottom with a divider; the speaking side plays big with its
   words as kinetic typography (insults in big red with impact/shake/red rays; good words gold/glow) while the other side is frozen, greyed and «eclipsed» with a pause mark;
   15 alternating turns (whole Houthi video in 8 parts, nasheed in 7), fierce strobe finale + the dark half shatters, light fills. Label must be «الحوثي يسب الصحابة» (not «يسب»).
   Houthi compilation 1:28–1:35 is unintelligible — not captioned (owner may type it in the studio). Transcripts: `data/transcripts/reels-light-transcripts.txt`.

I. **«الكلمة مقاومة» (Kalima Muqawama) brand identity + motion system** (26 Nov). Owner's long brief (was titled "NAVY & GOLD CHANNEL"; owner said the correct
   name is **Kalima Muqawama**) with the logo 80008.png (2048², navy seal: «الكلمة» / «مقاومة» stone lettering, fighter-on-crutches photo, «الثبات» + orange «عز»).
   Done = Phases 1–4 only (analysis, 3 directions A Midnight Atlas / B Imperial Archive / C Olive & Bronze, styleframes, comparison). **Waiting for Phase 5 approval:**
   1) direction (I recommended A), 2) original orange-gold or Antique Gold #DDA653, 3) emblem crop (inner circle only) for tiny sizes, 4) «عز» stays orange (unchanged so far).
   Kit folder `/home/user/final/Kalima_Muqawama_Brand_Kit/` (owner's folder layout) + 3 zips `Kalima_Muqawama_Brand_Kit_part1-3.zip`. Board artifact
   https://claude.ai/artifact/8WuVZZWzWA3WyC37uSZmbR (page source `code/brand-km/board.html`, media in `<scratch>/board/m/`).
   Code `code/brand-km/`: `kit.py` (palettes, soft masks from the ORIGINAL pixels, class-aware RBF colour LUT that recolours only the frame — photo disc copied untouched,
   grunge grounds, metal fill, bevel, extrusion), `mkcache.py A refined|dark|light|gold<HEX>` → `<scratch>/brand/cache/`, `opener.py` (5 s logo opener built from the logo's own
   layers: gold circles drawn with spark heads, dashes grow, triangles slide, slate ring rotates in, photo iris, lettering RTL wipe, gold sheen, «كلنا مقاومة»; `op_all.sh` renders A/B/C),
   `sonic.py` (sonic logo from Mixkit 1492/2350/788/2353/1296, no music), `frames.py` (caption, Reels cover, carousel 4:5, motion frame, 3D type from the logo's own letterforms), `sheets.py`.
   Rules kept: never retype or redraw the logo words; original logo file always included unchanged; no music; no text on faces; only real captions/owner titles.
   Logo image is NOT in this repo (keep it in the private artifact if needed). Phase 6 list (after approval) is in the kit's `Deliverables/Brand_Guidelines/` doc.

J. **Brand B «Imperial Archive» chosen (26 Nov)** — owner answered «B». Defaults told to him: B bronze metal (not the orange gold), «عز» stays orange, emblem crop only as an OPTION.
   Final kit `/home/user/final/Kalima_Muqawama_Brand_Kit/Deliverables/` (owner's folder layout; exploration moved to `Exploration_Phase1-4_A_B_C/`), zips `KM_B_Final_part1-6.zip`.
   Guide artifact (same link, v3): https://claude.ai/artifact/8WuVZZWzWA3WyC37uSZmbR + PDF in Brand_Guidelines. Code `code/brand-km/`: `km.py` (B tokens, archive grounds, cards, seals),
   `vids.py` (outro 4 s, sting 1.5 s, caption demo, kinetic demo, 14 transitions + library), `tpl.py` (logo files, covers ×3, carousel ×4, X, FB, quote, story, profile, components).
   **Owner's layout lesson (he was angry):** everything on ONE centre axis x=540; groups centred on their circle/card; equal gaps; no drifting text; balanced line breaks (no orphan word);
   text never meets the corner logo (logo at 118,348 → keep text ≤680 px wide in the top band). Check every frame for this before delivering.
K. **Video 1 «الصوت والطريق والقصيدة»** (in-car qasida, 1:58.9) — `/home/user/final/video1-qasida/` (full 1080×1920 voice-only + with-sfx, 122 MB each; SEND_* 29 MB versions were sent;
   4 covers; REPORT_Video1.md). Code `code/video1-qasida/q1.py` (6 scenes, YuNet face tracking keeps text above/below the head, micro-jitter stabilisation, per-scene grades),
   `covers1.py`, `sfx1.py`. Owner asked: no restrictions on the peak («أحرق… برصاصاتي») → typography/ember/streak treatment, no violence imagery. Uncertain words listed in the report.
   YuNet model: HF `opencv/face_detection_yunet` (cv2 5 has no CascadeClassifier).
L. **Video 2 «القفل الحديدي»** (elderly Taizi woman, 10 s) — `/home/user/final/video2-iron-lock/` (video, 3 covers, report). Her 16:9 frame on top, word panel below,
   real Unsplash photo (Alex Gorin, id Bw3m7HqLsMc) of a padlock + bolt slides in on «قفلة حديد». Dialect words to confirm: كحران / أخوتي (أُخيّتي?) / مردحة. Voice only.
M. Analysis texts of 4 videos for ChatGPT: `/home/user/final/video-analysis/Video_1..4_*.md` (line + word timings). Video 4 brief not received yet.
N. **Video 1 redone twice after owner notes (26 Nov).**
   - **Owner rules from this round, for every video:**
     - ONE style through the whole video, with small variations inside it.
     - Transcript first: he edits it in the studio, then I render.
     - No rings or circles.
     - **NO captions on faces, ever.**
     - No box behind captions.
     - Brighter, lighter, cinematic grade. He hated the dark navy grade and the dark bands.
     - The videos are **for Facebook**: keep all text inside the 4:5 feed crop (y 285–1635) and the Reels safe zones.
   - **Current Video 1 = `code/video1-qasida/q1d.py`** (imports q1c → q1b → q1).
   - **Grade:** `bright()`, a local shadow lift.
     - Shadows: chroma is neutralised before the lift (green camera noise).
     - Flat dark areas: an edge-preserving blur, to hide the macroblocks.
     - Highlights: filmic shoulder, then warm highlights, lifted blacks and a soft bloom.
   - **Captions:** Panorama in ivory (first hemistich) and bronze (second), plus ember words.
     - No box: a navy 9 px stroke plus a soft navy halo.
     - Placement is tested against the YuNet face box in EVERY frame, with a 12 px margin. Order of tries:
       1. Whole line (2 rows) at the bottom, top, or high-top.
       2. The hemistichs one after another.
       3. A hemistich split by time.
       4. Smaller type: 96 → 80, then 72/64/56 as a last resort.
     - The high-top zone is centred on 540 and 700 wide, so it never meets the logo.
   - **Cover:** `cover1d.py` → `cover-v4-ya-dahru.jpg`.
O. **Video 3 «أنا من تعزّ»** (44 s, Taiz drone montage, reciter Nasr Mansour, photographer Hossam Al-Qulaiah). Code: `code/video3-ana-min-taiz/q3.py`.
   - **Look:** the footage top 1417 px with a slow continuous drift, melting into a navy band. Two Panorama rows, one gold word per line, a word-by-word wipe reveal, credits.
   - **Source overlays:**
     - The top band (credit, «تعز تقاوم», plum caption boxes) is cropped (TOPCUT 335).
     - The photographer watermark is removed with fixed masks: `wmshot.py` builds per-shot temporal medians of the high-pass, then `wmbuild.py` makes the `wm_fixed.npz` masks. Then TELEA inpaint plus grain borrowed from just above.
   - **Audio:** Demucs vocals (`--repo demrepo -n htdemucs`; the weights are local, the internet download is blocked), two-pass loudnorm to −14.
   - **Studio:** tab q3 added (v13) for the owner's corrections. «ومكّةُ» is uncertain.
P. **Video 2 redone «قافلة حديد» (27 Nov)**, after the owner wrote: "very distinctive, very strong, like a strong leader's voice".
   - **Owner's text (studio db `lines` q2-001/002):** «كحلان [[عسير]]، مو [[مو طلعك يا حوثي]]؟» / «[[قافلة حديد ومندحة حناشة]]».
   - **Code:** `code/video2-iron-lock/q2b.py` (+ `depth_all.py`, `audio2.py`).
   - **Picture:**
     - Depth-Anything-V2-Base (local HF cache) gives a subject mask. The background is darkened, cooled and blurred; she gets a warm key light.
     - Footage ×2.5 with the face kept right of the spine (x 528). Words stack in a left column (centre 278, ≤440 wide).
     - Each word has its own strike (slide / slam / drop / rise / pop), plus visual-echo ghosts, bronze lines shooting in and a growing spine.
     - Sentence 2 is forged metal: steel, then bronze, with a sheen.
     - A mirrored, blurred continuation hides the picture edges.
     - The slam/echo scale is capped so words never cross the spine. `python3 q2b.py faces` prints the closest face-to-text gap (59 px).
   - **Audio:** the voice gets a 5-tap hall echo whose send swells on the strong words. Mixkit hits: 2299 bass, 788 big impact on «قافلة», 1143 on «حناشة», 166/1474 swooshes. Two-pass loudnorm to −14.
   - **Word onsets used:** 0.88 1.84 2.28 2.58 2.92 3.56 3.74 | 4.62 5.72 6.28 6.86.
   - The old v1 is in `/home/user/final/video2-iron-lock/old-version-1/`.
Q. **Video 4 «خطاب المقاتل»** (2:16 speech in a frosty field). Code: `code/video4-fighter-address/q4.py`, `lines4.py` (36 phrases), `cover4.py`.
   - **Owner's studio edits** are read from `db/lines/q4-*.json`: lines 10 إخوتي, 11 الجبان, 13 بواطل, 33 فنسأل من الله.
   - **Layout:** the picture is ×1.5 and moved down 130 px; the sky above it is extended with a soft mirror. A slow dolly-in on the face. Two caption zones are checked against the face plus turban in every frame:
     - **Sky band (y 296–520, 660 wide, clear of the logo):** Quran verses and «لله درّكم».
       - Verses are in Amiri Quran (`taiz/fonts/g_AmiriQuran-Regular.ttf`, also in `/home/user/final/kahlani/fonts/`): navy fill with a gold edge.
       - Each word descends from −64 px with blur. A warm light beam, drifting shafts and falling gold motes appear while a verse is on screen, with an 8-point gold star ornament (the owner asked for a "spiritual" verse motion).
       - «لله درّكم» uses forged bronze with a sheen, held while its sentence continues (HOLD).
     - **Lower band:** Almarai ExtraBold 78 (no tashkeel), ivory; hadith «» in gold; STRONG words in ember with a small pop. Each unit has two rows at most; row breaks avoid small words and broken quotes, and a smaller size is used if needed.
   - **Audio:** source voice, highpass 70, two-pass loudnorm to −14.
   - **Still open:** credit (source page and speaker name).
R. **Video 4, owner's notes (27 Nov):**
   - **All captions go up in the sky with the verses.** Picture lowered 300 px; his words sit right above his head, under «لله درّكم».
   - **Fonts:**
     - Ordinary captions use the owner's **Hail Elastic Light** (uploaded; private copy in `scratchpad/fonts_user/HailElastic-Light.ttf`; NEVER commit it).
     - Strong/special words and «لله درّكم» use **Thmanyah Serif Display Black** (owner: «ثمانية» instead of Panorama).
     - Lyon Arabic was requested first, but the file was not available.
   - **Line 13 is «بواطن»** (owner).
   - **«Make the whole video one time, no preview»:** never send partial previews; render and send the full video only.
   - **Strong words get a MEANING effect** (`fx4.py` EFFECTS by line):
     - melt (الجبان / الضعفاء / هان / والهزائم): a liquid wobble that greys and slumps into a puddle;
     - quake (الجبال / الشدائد): a cracked-mud Voronoi patch spreads behind the word, plus shake and dust;
     - shatter (الخذلان / كسر); twist (تلوون); shock rings (تصم / الآذان); rise (تترفعون / بالآخرة); gold sheen + sparkles;
     - sink (القعود); wobble (الأغبياء); trail (ألف عام); heartbeat (حبيبكم); anchor (يثبتنا ويثبتكم); wound (القرح); slam.
     - Effects are capped above his head and stretched by ≤0.5 s when the word ends a line.




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
