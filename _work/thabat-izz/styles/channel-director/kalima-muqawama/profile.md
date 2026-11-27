# Channel profile — الكلمة مقاومة (`kalima-muqawama`)
Filled 2026-11-27 from the owner's words in the production chat. Full style library and code paths: `STYLES.md` (same folder in the
AATWORLD-1 repo, `_work/thabat-izz/styles/STYLES.md`). Owner's words now › this profile › learn/status.md.

## 1. Identity
- Name / handle: «الكلمة مقاومة» (Kalima Muqawama). It was formerly «الثبات عز». The logo is a disc with «الكلمة / الثبات / عز / مقاومة».
- Language(s) and direction: Arabic, RTL (Classical poetry, sermons, Taizi dialect).
- Platform(s) and format:
  - Facebook reels and feed.
  - 9:16, 1080×1920, 30 fps, H.264 yuv420p high@4.1, −14 LUFS.
- Typical length: 10 s to 2:30.
- Content type:
  - Recited poems (in-car, over city footage).
  - Short Taizi sayings.
  - Fighters' and preachers' addresses with Quran and hadith.

## 2. Goal and audience
- Goal: inspire steadfastness and pride; report and share what is said in Taiz/Yemen ("for media and as a reporter").
- Audience: Yemeni and Arab Facebook viewers, mostly on phones.
- Success: strong, distinctive, shareable reels. The words must be exact.

## 3. Hard borders
- **B1 On-screen text:**
  - Only the real spoken words, from the owner-corrected transcript in the studio. No invented titles.
  - Credits allowed: «إلقاء / تصوير / المصدر».
- **B2 Sacred text:**
  - Quran verses: a calm "spiritual" motion only (descend with light, Amiri Quran). No slam, bounce or glitch.
  - Hadith in gold.
- **B3 Faces:**
  - Never put captions or effects on a face (tested per frame).
  - Generated characters: faceless, no women.
- **B4 Audio:**
  - The voice only. No music, ever.
  - SFX only where the style uses them (strong sayings).
  - The brand sonic logo (built from SFX) is allowed on the outro unless the owner says otherwise.
- **B5 Brand, legal, privacy:**
  - Credit the sources; remove other pages' logos and watermarks.
  - Fonts, logo, photos and unreleased videos stay private (the repo is public).
  - Don't upload the footage to third-party renderers.
- **B6 Process:**
  - Transcript approval first.
  - ONE full render per round. No previews.

## 4. Look
- **Allowed styles** (references/13_styles.md):
  - ALLOWED: S1 (speaker-led), S2 (text-led kinetic, only for short strong sayings), S20 (luxury dark accents, metal words), S23 (documentary footage).
  - ASK first: S5, S8.
  - NEVER: S10, S17 (glitch), S19 (bounce), S13 (generic dark AI look).
  - The channel's own four styles (S1–S4 in STYLES.md) come first.
- **Style family:** cinematic-documentary with kinetic Arabic typography. One style per video.
- **Palette (B «Imperial Archive»):**
  - Navy #080D18 and royal #1E3A6E.
  - Silver #A3A9AF.
  - Bronze #A8844F (#C9A46A on dark).
  - Parchment #EDE3CC.
  - Seal wax #8E3B2F (#C0604E on dark).
  - Ember #F08A4B for strong words.
  - The picture is bright, not dark.
- **Fonts:**
  - Ordinary captions: Hail Elastic Light (owner's file).
  - Strong/special words and refrains: Thmanyah (Serif Display Black; Sans offered, pending A/B).
  - Quran: Amiri Quran.
  - Panorama Naskh only for covers if asked.
  - Minimum size: about 64 px caption height at 1080 wide.
- **Logo and safe zones:**
  - Logo at top-left (118,348), in one corner only.
  - Feed crop y 285–1635; Reels safe: top 270, bottom 420, right 120. Centre axis x 540.
- **Grounds:** the real footage (preferred); navy archive ground with grain for bands; cracked earth only as a word effect.
- **Default energy:** follow the voice. Strong sayings: energetic. Sermons and poems: steady, with peaks on strong words.

## 5. Motion preferences
- **Preferred:**
  - Word-by-word reveal timed to the voice.
  - Meaning effects on strong words (`code/video4-fighter-address/fx4.py`).
  - Slow continuous camera drift or push.
  - Captions in the free space (sky/wall) above the speaker.
  - Verses descending in light.
- **Banned:** see learn/status.md.
  - Rings/circles decoration.
  - Caption boxes.
  - Dark grades and dark bands.
  - Changing the style inside one video.
  - Colour-only emphasis.
  - Text on faces.
  - Captions at the bottom when there is free space above.
  - Partial previews.
- **Transitions:** inside the style only.
  - Sentence sweep-out / sentence-in.
  - Verse fade.
  - The outro transition: A "close → outro" or B "outro enters while open" (STYLES.md §5).
- **Camera:** a gentle push-in per line or a continuous drift; jolts on strong words; a shake only on the biggest hit.
- **Sound / SFX:** the voice at −14 LUFS. Style S2 only: hall echo swelling on strong words, plus impacts (Mixkit 2299 / 788 / 1143) and swooshes (166 / 1474).

## 6. Engine and assets
- **Engine:** Python (OpenCV + PIL RAQM).
  - Frames are piped to FFmpeg. Analysis: YuNet faces, faster-whisper word timings, Demucs vocals, Depth-Anything.
  - Owner was offered Remotion for the animation layer (Python keeps the analysis). Pending his answer.
- **Code:**
  - AATWORLD-1 `_work/thabat-izz/code/` (video1-qasida, video2-iron-lock, video3-ana-min-taiz, video4-fighter-address, brand-km).
  - Studio artifact `MTuMYL8NLb2d5eiqMLB2cm` (transcripts, collection `lines`).
- **Assets:** the owner's footage. Unsplash only if a phrase names a real object. No AI faces.

## 7. Tools allowed for this channel
- Unsplash (real photos); Hugging Face models run locally (whisper, demucs, depth, YuNet).
- No upload of the owner's footage to outside renderers. Ask first.

## 8. Review
- **Checklist (every final render):**
  - Frame count; duration; LUFS −14 and peak; blackdetect = 0.
  - Face-to-text gap ≥ 10 px in every frame.
  - A 20-frame contact sheet viewed before sending.
- **Approval flow:**
  1. The transcript in the studio.
  2. One full video, with its cover and a short Arabic report.
  3. The owner's notes become new rules here.

## 9. Change log
- 2026-11-27: profile created from the owner's verdicts on Videos 1–4 (see learn/history.jsonl).
- 2026-11-27: next videos end with the brand-kit intro used as the outro (STYLES.md §5).
