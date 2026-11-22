# PROMPT FOR MANUS — Historical anime film: «موقف المقداد رضي الله عنه»

Attached file: **موقف المقداد_v6.mp4** (66.4 s, portrait 1080×1920, 30 fps, mono AAC). It is a short from the channel «نفائس الهاجري»: the narration is Sheikh Ahmed Al-Hajri's voice.

## 0. HOW TO WORK (read first)

- You are the whole studio: director, storyboard artist, background painter, character animator, compositor, sound designer and creative web developer.
- **Do the production, not a plan.** Work in your sandbox, build the real assets, render the real film, and check it yourself before you deliver.
- Don't stop to ask questions unless you are truly blocked. When something is unclear, choose the calmer, more respectful option, note it, and continue.
- Show progress in short updates: what you are doing now, and what is finished.
- **Final deliverables (both are required):**
  1. `mawqif_al_miqdad.html`: ONE self-contained, offline HTML film player.
  2. `mawqif_al_miqdad.mp4`: the same film rendered as a video, 1080×1920, 24 fps, 66.4 s, H.264 + AAC, Arabic subtitles burned in, loudness −14 LUFS (true peak ≤ −1.5 dBTP).
- **Also deliver:**
  - the Arabic transcript with timings;
  - a style sheet image;
  - a character reference sheet image;
  - a storyboard image made from real rendered frames;
  - a ZIP of all sources and scripts.

## 1. ABSOLUTE RULES (never break them)

1. **The Prophet Muhammad ﷺ never appears in any form.** That means no person, silhouette, shadow, reflection, hand, body, glowing human shape, or light "standing in" for him. His presence is shown only by where the companions face (a point beyond the left edge of the frame), their respectful reactions, and the narration.
2. **Faces:**
   - Every human character has a clearly visible head with NO eyes, pupils, eyebrows, nose, mouth, ears, expressions or markings.
   - **The beard is the only facial feature.** It is a separate dark shape below the chin that follows the direction the head is turned.
   - Never generate normal faces and then cover or blur them: build the characters featureless from the start.
   - No lip-sync and no mouth movement. Acting is done only with the body, hands and head.
3. **No music anywhere:** no score, melody, percussion, musical transition or loop, and no music-generation tools. The audio is the original narration plus restrained natural sound effects. The source contains no music; it ends with a channel end card from about 62 s, which you must NOT use.
4. **Qur'anic quotation (43.96–47.68 s): calm and still.** No sound effects at all from 41.84 s to 47.68 s; let the ambience fade out before and come back after. No camera tricks; at most a very slow push-in.
5. **Do not invent events.**
   - Do not show the battle.
   - Do not show Sa'd ibn Mu'adh's reply: it is NOT in this narration.
   - Do not show a march away from the camp: the narration ends on a reflection.
   - Follow only what the narration says.
6. **Historical accuracy for the early 7th-century Hijaz:**
   - Allowed: goat-hair or leather tents on wooden poles, water skins (qirba), wool bedrolls, rope, wooden bowls, straight double-edged swords in leather scabbards, plain spears, round leather shields, woven saddlebags.
   - Horses wear a rope halter, a saddle blanket and a girth, with **no stirrups**.
   - Robes stop at mid-shin.
   - Not allowed: Ottoman, European or modern architecture or clothing, metal lanterns, fantasy armour.
   - Badr detail: the Muslims had only 2–3 horses, and one belonged to al-Miqdad. Show exactly 2 horses.
7. **Backgrounds contain no** people, animals, tents, fire, weapons, objects, text, logos or watermarks. Everything else is a separate transparent layer.

## 2. VERIFIED NARRATION (use these exact words and timings)

These timings come from Whisper large-v3 word timestamps, checked against the burned-in captions of v6. Confirm them against the audio yourself. Note: the sheikh clearly says «لا نقول **لك**»; the v6 captions dropped «لك», so include it.

| from (s) | to (s) | subtitle text (verbatim) |
|---|---|---|
| 0.00 | 2.70 | هنا خلاص أيقنَ الآن أصحابُ النبيِّ عليه الصلاة والسلام |
| 2.70 | 5.20 | بأنه لا مندوحةَ من القتال |
| 5.20 | 7.48 | هنا قام النبيُّ عليه الصلاة والسلام وقال |
| 7.48 | 10.24 | أشيروا عليَّ أيها الناس |
| 10.24 | 12.34 | وإنما يريد النبيُّ عليه الصلاة والسلام الأنصار |
| 12.34 | 13.82 | لأنهم كانوا أكثرَ الناس |
| 13.82 | 15.96 | وأنهم بايعوه في العقبة |
| 15.96 | 19.20 | فخشي النبيُّ عليه الصلاة والسلام أنَّ الأنصار |
| 19.20 | 23.02 | لا يرون بأنَّ نُصرةَ النبيِّ عليه الصلاة والسلام واجبة |
| 23.02 | 25.00 | إذا كانت خارجَ المدينة |
| 25.00 | 26.78 | قال: أشيروا عليَّ أيها الناس |
| 26.78 | 30.08 | فقام أبو بكر الصديق فتكلَّم فأحسن رضي الله عنه |
| 30.08 | 33.64 | ثم قام عمر الفاروق فتكلَّم فأحسن رضي الله عنه |
| 33.64 | 36.68 | ثم قام المقداد وقال كلامًا عظيمًا |
| 36.68 | 39.54 | قال: يا رسول الله، آمنّا بك وصدّقناك |
| 39.54 | 41.84 | واللهِ يا رسول الله لا نقول لك |
| 41.84 | 43.96 | كما قال قومُ موسى لموسى |
| 43.96 | 47.68 | ﴿ اذْهَبْ أَنتَ وَرَبُّكَ فَقَاتِلَا إِنَّا هَاهُنَا قَاعِدُونَ ﴾ (Al-Ma'idah 5:24, as the sheikh recites it) |
| 47.68 | 50.42 | بل نقول: اذهب أنت وربك فقاتلا |
| 50.42 | 52.90 | إنا معكما مقاتلون |
| 52.90 | 54.66 | فسُرَّ النبيُّ عليه الصلاة والسلام |
| 54.66 | 55.92 | وابنُ مسعود كان يقول: |
| 55.92 | 59.38 | شهدتُ موقفًا من المقداد وددتُ أني صاحبُه |
| 59.38 | 60.72 | والحياة يا إخوة مواقف |
| 60.72 | 61.84 | الحياة مواقف |
| 61.84 | 66.40 | (no narration): final title «موقف المقداد — رضي الله عنه» |

**Subtitle rules:**
- Arabic, RTL, at most 2 lines. Balance the line lengths.
- Never split the honorifics «عليه الصلاة والسلام» or «رضي الله عنه» across two lines. Show them slightly smaller, in gold.
- Show the verse in a Qur'anic Naskh font (for example Amiri Quran) in a gold tone, with full tashkeel exactly as written above.
- Use large, readable type (about 64 px on a 1080-px-wide frame) on a soft dark band, with fade in/out of 0.12 s.
- Fonts must be embedded and OFL-licensed (Amiri, Amiri Quran, Noto Naskh Arabic).

## 3. STORY → SHOT LIST (cut on the words)

The world is one connected location: Wadi Dhafran at night, then pre-dawn. The companions always face a point beyond the left edge of the frame.

| shot | time (s) | picture |
|---|---|---|
| SH01 | 0.0–3.6 | BG01 night establishing shot. Slow push-in revealing a tiny camp (two tents, fire glow, two tiny horses) far down the valley. Wind. |
| SH02 | 3.0–5.3 (dissolve in) | The camp (BG02): two tents, spears planted beside them, a shield and a sword in the foreground ("no escape from fighting"), 3 companions kneeling round the fire. The bay horse looks around; the chestnut flicks its tail. |
| SH03 | 5.3–10.24 | Consultation ground (BG03): 12 companions kneeling in 3 loose rows, the fire at the left. At «قام النبي» they turn their heads toward frame-left **one after another**, not all at once. At «أشيروا» a few nod as they think. |
| SH04 | 10.24–15.96 | The camera pans from the Muhajirun to the larger group of Ansar (more people). At «بايعوه في العقبة» one Ansari slowly puts his hand on his chest. |
| SH05 | 15.96–20.2 | The Ansar close up: stillness and firelight. |
| SH06 | 19.6–25.0 (dissolve in) | BG01 again: slow pull-out until the camp is tiny in the huge wadi ("outside Madinah"). |
| SH07 | 25.0–26.78 | Group shot, everyone still. |
| SH08 | 26.78–30.08 | Abu Bakr rises from kneeling, makes an open-hand speaking gesture, then lowers his arm. |
| SH09 | 30.08–33.64 | Umar rises and speaks the same way (different framing). |
| SH10 | 33.64–35.5 | Al-Miqdad, framed tight: anticipation, weight shift, half-kneel, push up, settle. He must never just jump up. |
| SH11 | 35.5–42.1 | His speaking position (BG04, reverse angle, low camera, moon): medium shot. At «يا رسول الله» his head turns toward frame-left. At «آمنّا بك وصدّقناك» his hand moves to his chest and stays there. |
| SH12 | 41.84–47.68 (dissolve in) | Calm wide shot: al-Miqdad small and still under the moon, hand on chest. No movement, **no effects**. |
| SH13 | 47.68–52.9 | Peak (low angle). At «بل نقول» his arm opens from his chest toward the way ahead. At «إنا معكما» he takes ONE deliberate step forward, then holds firm and still. Keep his open hand in frame. Not a superhero pose. |
| SH14 | 52.9–54.66 | «فسُرّ النبي»: the companions bow their heads slightly, one by one; the firelight swells gently. No figure of the Prophet ﷺ. |
| SH15 | 54.66–59.9 | Ibn Mas'ud (short and slender, as the sources describe him) seated large in the foreground, al-Miqdad standing in the middle ground. At «وددت أني صاحبه» Ibn Mas'ud puts his hand on his chest. |
| SH16 | 59.2–66.4 (dawn dissolve) | Pre-dawn valley (BG05, the same mountains): al-Miqdad stands beside his bay horse holding the lead rope; behind them a companion tightens the strap on the chestnut. The light slowly brightens. The title fades in at 62.15 s, then everything fades to black at 65.75–66.4 s. |

## 4. LOOK AND ART DIRECTION

**Principle: simple characters, an extraordinarily beautiful world.**

### Backgrounds

- Paint 5 backgrounds, each 1080×1920, in classic Japanese theatrical-animation style: gouache, delicate brushwork, atmospheric depth, rocky Hijazi wadi (dark basalt and brown sandstone, pale gravel, sparse shrubs).
- **Do not make it an endless sand desert.**
- The five scenes:
  - BG01: night, elevated establishing view;
  - BG02: camp ground at ground level;
  - BG03: a naturally sheltered clearing with a curved rock wall;
  - BG04: a low-angle open foreground under a tall night sky;
  - BG05: pre-dawn version of BG01 (same seed or same composition, a blue sky lightening to an amber horizon).
- Reject and regenerate any plate that contains steps, walls, ruins, roads or people.
- **One moon for all the night plates:**
  - Paint out any moon the image generator bakes in.
  - Composite a single crescent sprite instead.
  - The owner chose a crescent; mid-Ramadan would really be nearly full. Keep the crescent unless told otherwise.
- **Grade for night:**
  - Grade every night plate the same way: cool, low-key, foreground darker.
  - Split sky and land into layers for parallax.
  - Clamp the camera so the edge of a plate is never visible (overscan the sky layer).

### Characters

- Elegant historical stickmen: slim robe to mid-shin with fold lines, an outer cloak open at the front, a sash, sleeves, thin stick forearms and shins, simple mitten hands with a separate thumb, small sandals, and a round, plain, shaded head with a turban and the beard.
- **Build the characters as drawn cel art**, using code-drawn vector shapes rendered to raster frames with real transparency (for example Python + skia/cairo), with ink outlines and gouache-grain texture.
  - This guarantees featureless heads and identical proportions in every frame.
  - Do NOT use AI image generation for people.
- Draw the beard on top of the shoulder and sleeve so it always reads (in my first pass the shoulder covered the beard).

**Costume bible (identical in every shot):**

| character | build | turban | beard | robe | cloak | other |
|---|---|---|---|---|---|---|
| al-Miqdad | tall, brown skin | cream/ivory #E9DFC6, with a tail (ʿadhaba) | deep brown #3A2216 | sand #CDB68C | dark olive #4F4A2E | brown sash |
| Abu Bakr | slight, slender | white | henna/katam red-brown #8A3B1C, pointed | light | fawn | |
| Umar | very tall, strongly built | charcoal | dark | undyed wool | deep brown | |
| Ibn Mas'ud | short, very slender, dark skin | small plain turban | short dark | plain | none | |
| 3 Muhajirun extras | | one wears a head-cloth | | muted earth tones | | |
| 5 Ansar extras | | indigo or madder | | | indigo or madder-dyed Yemeni cloth | |

**Horses:**
- 2 Arabian horses, drawn the same cel way: a **bay** (al-Miqdad's, black lower legs) and a **chestnut** (white blaze, one sock).
- Natural anatomy: arched neck, dished face, high tail carriage. A small calm eye is fine for horses.
- Rope halter, striped saddle blanket and girth, no stirrups.

**Props and effects:**
- Props are separate transparent assets (see rule 6).
- Effects:
  - a hand-painted 12-drawing flame loop;
  - embers, smoke and drifting dust;
  - firelight that warms nearby figures;
  - a moon halo;
  - dark, out-of-focus foreground rocks for multiplane depth.
- Never use magic circles, lens flares, glowing particles for their own sake, or screen shake.

## 5. ANIMATION

- Use a 24 fps master timeline. Characters animate on twos (12 drawings per second), with held drawings.
- Use key poses, anticipation, follow-through and natural pauses. Cloak hems and turban tails lag behind the body (simulate this with a spring).
- Never animate everyone at the same moment.

**Sequences to draw:**
- Every principal character:
  - kneel idle;
  - kneel head-turn (from near-frontal to profile, 9 drawings);
  - kneel nod (12 drawings);
  - rise from kneeling (17 drawings: kneel → hands on knee → half-kneel with the front foot planted → push → stand → slight overshoot → settle).
- Abu Bakr and Umar: speaking gesture (13), lower arm (9).
- Al-Miqdad:
  - stand idle (breathing);
  - head turn (8);
  - hand to chest (11);
  - chest → arm opening toward the way ahead (13);
  - one step forward with the arm extended (13);
  - lower arm after the step (11);
  - holding the lead rope (8).
- Ibn Mas'ud and one Ansari: seated hand to chest (10).
- Extra: tightening the saddle strap, a looping pull (9).
- Horses:
  - idle breathing (8);
  - look around (14);
  - tail flick with follow-through (10);
  - weight shift resting a hind hoof (10);
  - snort with a head toss (12).
  - No walk cycle: the narration has no movement.

## 6. SOUND (no music)

- **Narration:** the original track, 0–62.0 s (fade out at 61.86 s). Do not cut, reorder or speed-change any words. Normalise it.
- **Sound-effects stem:**
  - Use procedural or natural sounds with no tones and no rhythm loops: wind, campfire crackle, fabric rustle, cloak flap, footsteps on gravel, hoof on gravel, tail swish, horse snort, and leather creaking (with irregular timing so it never forms a pitch).
  - Every effect must have a visible cause and peak on the drawing that causes it: rises, the step at about 50.9 s, the snort at about 63.1 s, and so on.
  - Keep the narration clearly dominant.
  - **Silence from 41.84 to 47.68 s.**
- **Mix target:** −14 LUFS integrated, true peak ≤ −1.5 dBTP.

## 7. TECHNICAL BUILD

- **Runtime:** a Canvas 2D compositor at 1080×1920 inside one HTML file.
  - Layers: sky, land, props, characters, horses, foreground, effects, subtitles/title.
  - Use `drawImage` with real raster sprites (WebP with alpha), driven by one master timeline JSON that holds shots, camera keys, character actions, subtitle cues and sound-effect cues.
  - The audio clock (Web Audio) drives the picture. Render on a 24 fps quantised clock.
- **Light:**
  - Grade each sprite per shot: multiply by the night or dawn colour, add warm firelight falloff or a cool moon rim, then clip to the sprite's alpha.
  - Add a vignette.
- **Transitions:** cuts on the words; dissolves only where listed; a dawn light transition into SH16.
- **Everything embedded as data URIs:** images, fonts, narration MP3 and effects MP3. No CDN, no network, no server.
- **Controls (discreet, auto-hiding):** play/pause, replay, seekable progress bar, Arabic subtitles on/off, narration volume, effects mute/unmute, fullscreen.
- **MP4:** render every frame from the same player in a headless browser (for example Playwright calling a `renderAt(t)` hook), pipe the frames to ffmpeg (H.264, CRF about 18), then mux the narration + effects mix at −14 LUFS.

## 8. QUALITY CONTROL (do it before you deliver)

1. **Render stills in a real browser every 0.5 s for the whole film** and look at them. Fix:
   - exposed plate edges;
   - wrong scale (spears about 1.4 × a man's height, horse withers about 0.85 × a man's height);
   - characters too bright against the night;
   - lost hands or arms outside the frame;
   - the title overlapping a character.
2. Zoom in on heads at 4×: no eyes, nose, mouth, brows, ears or marks. The beard must be visible.
3. Check every background for figures or objects that shouldn't be there.
4. Check frame by frame that the rises, gestures and step are not mechanical.
5. Check subtitle timing against the audio, Arabic shaping, RTL order and the unbroken honorifics.
6. Confirm there is no music, and no effects under the verse (measure it).
7. Open the HTML from `file://` with the network turned OFF: it must load, play, seek and toggle, with 0 external requests and 0 console errors.
8. Extract frames from the MP4 and compare them with the HTML. Measure the loudness.

## 9. FINAL REPORT (short, plain language)

- What was made and where the files are, and how long each file is and how big.
- What was checked, with the numbers.
- What you could not check (for example, if you cannot listen to audio, say so).
- Any deviations, with one line of reason for each.
