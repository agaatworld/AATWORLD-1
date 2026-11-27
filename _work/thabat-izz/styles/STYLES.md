# «الكلمة مقاومة»: video style library (saved 27 Nov 2026)

The owner asked: "Save each style of the 4 videos, so you use it for such and similar, but improving of course."
Pick the style (S1–S5) whose **material** matches the new video, then improve it. Never mix two styles inside one video (owner rule).
Code for each style is in `../code/<folder>/`; private fonts, logo and photos are NOT in this public repo (see HANDOFF §9).

---

## 0. Rules for every style (owner's verdicts; these win over anything below)

### Format and workflow
- **Platform:** Facebook (reels and feed). 1080×1920, 30 fps, H.264 yuv420p high@4.1, −14 LUFS.
- **Safe areas:** keep all text inside the 4:5 feed crop (y 285–1635) and the Reels safe zones (top 270, bottom 420, right 120).
- **Workflow:**
  1. Put the transcript in the studio first (artifact `MTuMYL8NLb2d5eiqMLB2cm`, collection `lines`).
  2. The owner corrects it.
  3. Render with his words.
  4. Strong words can be marked by him with [[ ]].
- **One finished video, rendered once in full.** No partial previews (27 Nov).

### Style and layout
- **ONE style per video.** Vary only inside that style; never change the look every few seconds (26 Nov).
- **Grid:**
  - One centre axis x = 540.
  - Equal gaps and balanced rows; no orphan word, no line ending on a small word.
  - Never break inside a «quote».
  - Text never meets the corner logo (logo at 118,348).
- **Captions:**
  - **No captions on faces, ever.** Test the YuNet face box in every frame, with a margin.
  - **No box behind captions.** Use a navy stroke plus a soft halo instead.
  - **Free space wins.** If there is empty sky or wall above the speaker, put the captions there, not at the bottom (27 Nov).

### Look
- **Bright, light, cinematic grade.** No dark navy grades, dark bands or vignettes that darken the picture (26 Nov).
- **No rings or circles** as decoration (26 Nov).

### Fonts
- **Ordinary captions:** the owner's **Hail Elastic Light** (`fonts_user/HailElastic-Light.ttf`). He first asked for Lyon Arabic, but there is no file for it.
- **Strong and special words, plus «لله درّكم»-type refrains:** **Thmanyah**.
  - Used so far: Serif Display Black. The owner also uploaded Thmanyah **Sans** (woff2 → `fonts_user/thmanyah_sans/*.ttf`).
  - Ask A (Serif Display) or B (Sans) if he has not answered.
- **Panorama Naskh:** no longer used for captions (replaced by Thmanyah, 27 Nov). It stays the brand's display face for covers and titles only if he asks.
- **Quran verses:** Amiri Quran, navy with a gold edge, in a "spiritual" motion: each word descends from above with blur → sharp, with a warm light beam, drifting light shafts, falling gold motes, and a gold 8-point star ornament under the verse.

### Strong words
- **Strong words get an effect that matches their MEANING, not colour only** (owner's examples: «الجبان» weak, liquid, collapsing; «الجبال» strong, cracking the place, earth texture).
- Effect library: `../code/video4-fighter-address/fx4.py`:
  - melt
  - quake + cracked-earth patch
  - shatter
  - twist
  - shock rings
  - rise into light
  - gold sheen + sparkles
  - sink
  - jelly wobble
  - time trail
  - heartbeat
  - anchor
  - wound
  - slam
- Choose by meaning, cap effects above or away from faces, and give an end-of-line effect word ≤ 0.5 s more time.

### Audio, content and credit
- **Audio:** the voice only, cleaned. No music, ever. SFX only where the style uses them (style 2).
- **Text:** only the real words. No invented titles.
- **Credit and logos:** credit the source (reciter / photographer / page) and remove other pages' logos and watermarks.
- **Cover:** shown for the first 0.2 s of the video. Use the same style as the video, the speaker's real frame, and his own words.
- **Generated characters** (if ever): faceless, no women.

---

## 1. Style S1 «الإلقاء في مشهد واحد» (one-take recitation with a face)
- **Source:** Video 1, the in-car qasida, 1:59 (`../code/video1-qasida/q1d.py` → imports `q1c` → `q1b` → `q1`).
- **Use for:**
  - A poem or speech filmed in ONE continuous take.
  - The face moves a lot, as in a close-up, a car, or a handheld shot.
- **Picture:**
  - The real take, full frame.
  - Micro-jitter stabilised (≤ 18 px; the real movements are kept).
  - A gentle push per line, and jolts on the strong words.
- **Grade:** `bright()`.
  - A local shadow lift; chroma is neutralised in the dark areas before the lift (green camera noise).
  - An edge-preserving clean-up of the macroblocks.
  - Filmic shoulder for the windows, lifted blacks, warm highlights and a soft bloom.
- **Captions:** each line is split at its hemistich comma.
  - First hemistich: ivory. Second: bronze. Strong words: ember.
  - Placement search per line, tested on every frame:
    1. The whole line (2 rows) under the face, then above it, then high top.
    2. The hemistichs one after another.
    3. A hemistich split by time.
    4. A smaller size: 96 → 80, then 72 / 64 / 56 as a last resort.
- **Improve next time:**
  - Fonts → Hail Elastic + Thmanyah.
  - Strong words → meaning effects from `fx4.py`.
  - Use free sky/roof space before the bottom band.

## 2. Style S2 «صوت القائد» (short, powerful saying)
- **Source:** Video 2, «قافلة حديد», 10 s (`../code/video2-iron-lock/q2b.py`, `audio2.py`, `depth_all.py`).
- **Use for:**
  - A short (≤ 20 s) punchy line, proverb or slogan.
  - One speaker, where the owner wants "very strong, like a leader's voice".
- **Picture:**
  - Depth-Anything-V2 subject mask. The background is darker, cooler and soft (depth of field); a warm key light on the speaker pulses with the strong words.
  - The footage is scaled ×2.5, with the face kept on one side.
  - A mirrored, blurred continuation hides the picture edges.
  - Slow push-in, jolts on the strong words, a shake on the biggest hit.
- **Words:**
  - A vertical column in the free side (x 58–498), next to a bronze spine that grows with each row.
  - Sentence 1 fills the column, then sweeps out; sentence 2 replaces it.
  - Every word has its own strike: slide / slam with a white flash / drop / rise / pop.
  - Visual echo: ghost copies expand and fade.
  - Bronze lines shoot in from the edge.
  - The last sentence is forged metal (steel → bronze) with a sheen.
  - Slam scale is capped so words never cross the spine.
- **Audio:**
  - The voice gets a 5-tap hall echo whose send swells on the strong words.
  - Mixkit hits: 2299 bass, 788 big impact, 1143 deep impact, 166 / 1474 swooshes.
  - Two-pass loudnorm.
- **Improve next time:**
  - Fonts → Hail Elastic + Thmanyah.
  - Meaning effects for the strike words.
  - Get the owner's verdict on the echo level.

## 3. Style S3 «قصيدة على مشاهد المدينة» (poem over a footage montage)
- **Source:** Video 3, «أنا من تعزّ», 44 s (`../code/video3-ana-min-taiz/q3.py`, `covers3.py`, `wmshot.py`, `wmbuild.py`).
- **Use for:** a recited poem or voice-over on landscape, drone or city shots without a speaking face.
- **Picture:**
  - The footage fills the top (1417 px).
  - ONE slow continuous camera drift (zoom 1.045 ± 0.025, small x/y sway, 0.25° roll).
  - It melts through a soft gradient into a navy archive band.
  - Brighter grade (gamma 0.86).
- **Words:**
  - Each line in two rows on the centre axis, split at the real hemistich break (metre), not the comma.
  - One gold word per line.
  - Every word emerges with a soft right-to-left wipe and blur.
  - A gold hairline under the final row.
  - Credits line: «إلقاء: …» / «تصوير: …».
- **Clean-up:**
  - Crop the source's top band (other page's credit, logo, caption boxes).
  - Remove a static watermark with masks from per-shot temporal medians of the high-pass, then TELEA inpaint plus borrowed grain.
  - Hold the last clean frame before a white/black flash.
- **Improve next time:**
  - Fonts → Hail Elastic + Thmanyah.
  - One meaning effect per key word.

## 4. Style S4 «الخطاب» (locked-off speech, sermon tone)
- **Source:** Video 4, «خطاب المقاتل», 2:16 (`../code/video4-fighter-address/q4.py`, `fx4.py`, `lines4.py`, `cover4.py`).
- **Use for:**
  - A long talk or khutbah from a fixed camera with open space above the speaker (sky or wall).
  - Contains Quran or hadith.
- **Picture:**
  - The take ×1.5, lowered 300 px; the sky above is extended with a soft mirror.
  - A very slow dolly-in on the face.
  - A bright frosty-morning grade with bloom, and floating frost motes.
- **All text in the space above his head:**
  - Refrain («لله درّكم») at the top in forged bronze with a sheen, held while its sentence continues.
  - His words under it: word by word, at most 2 rows per unit, row breaks never after a small word.
  - Hadith «…» in gold.
  - Strong words in Thmanyah with meaning effects.
  - Verses in the same space: Amiri Quran, descending with light. His words step aside while a verse is on screen.
- **Audio:** the source voice, highpass 70, two-pass loudnorm.
- **Improve next time:**
  - Credit line (source page and speaker): still unknown for V4.
  - Outro (below).

---

## 6. Style S5 «شهادة وثائقية» (documentary testimony; Video 5, owner's brief 27 Nov)
- **Source:** Video 5, «أطفال تعز», a Suhail TV report, 16:9 1920×1080 25 fps (`../code/video5-taiz-children/q5.py`).
- **Use for:**
  - Real reports or interviews from another channel, children's testimonies, anything where truth and dignity come first.
  - Keep the source format: here 16:9.
- **Picture:**
  - The footage untouched: no zoom, no added shake, natural colours (light per-shot grade only).
  - The broadcaster's lower third is cut away: source rows 0–800 kept, melting into a navy band.
  - The broadcaster's corner logo is hidden under the channel badge, which also carries «المصدر: <channel>».
  - Microphone flags stay (real objects).
- **Two caption systems inside one style:**
  - **Personal appeal:** word-by-word ivory Hail Elastic, centred in the band, a few gold Thmanyah words. The list words go on the empty wall beside the speaker.
  - **Formal recital:** right-aligned phrase reveals on a gold rule. Repeated phrases build a structured stack on a left navy panel, with the repeated word in gold.
- **Rules from the brief:**
  - The hard cut between speakers stays.
  - No SFX, no music, no emotional effects.
  - Names only as the source wrote them.
  - Uncertain words are flagged.
- **Ending:** hold the last clean frame, soften it and sink it into navy, then the brand intro as a SILENT outro (horizontal layout via `opener_layer()`).

---

## 5. Outro: from the next video on (owner, 27 Nov)
"Consider next time": end every video with the brand-kit **intro** used as the **outro**.

**The file**
- `Deliverables/Logo_Animation/KM_Intro_Logo_Opener_5s.mp4` (5 s, 1080×1920, with the sonic logo).
- Also on the guide artifact as `m2/intro.mp4`.
- Code: `../code/brand-km/opener.py`.
- **The animation:** astrolabe rings draw in with sparks → the slate ring → the photo disc → «الكلمة / عز / مقاومة» → «كلنا مقاومة».
- **The sonic logo** is made from SFX (Mixkit 1492 / 2350 / 788 / 2353 / 1296), not music. Ask the owner once if he wants it silent.

**Two ways in (choose per video and say which in the report)**
- **A. Close then outro:**
  - On the last word, the picture pushes in slowly, blurs and sinks into the navy archive ground.
  - The opener's rings start drawing on the darkening picture.
  - Then the 5 s outro plays.
  - Best after a calm ending (S3, S4).
- **B. Outro enters while the video is still open:**
  - The rings and sparks draw over the live footage while the speaker finishes.
  - The background then cross-fades from the footage to the navy ground, and the logo assembles.
  - Best after a strong ending (S1, S2), so the energy is not cut.

**Rules**
- The last spoken word is never covered.
- The voice ends before the sonic logo peaks.
- The whole video is still ONE render (cover 0.2 s → video → transition → outro).

**Build plan**
- Render the opener frames from `opener.py` straight into the video's frame loop, so the transition is drawn frame by frame.
- Do not crossfade a separate mp4.
