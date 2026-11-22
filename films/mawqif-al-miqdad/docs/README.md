# موقف المقداد رضي الله عنه — production notes

Deliverable: `mawqif_al_miqdad.html` — one self-contained file (~15 MB). Open it in any modern browser, offline. No server, no CDN, no network requests (verified with the network disabled).

## What is in it
- **Narration:** the original Arabic voice from `موقف المقداد_v6.mp4`, 0–61.84 s, untouched (only trimmed before the channel end card and loudness-normalised to −16 LUFS). The source has no music bed (checked on the spectrogram); the end card is not used.
- **No music anywhere.** The only other track is a procedural effects stem (wind, fire crackle, fabric, gravel steps, hooves, tail swish, snorts, leather), with no tones and no rhythm. Hard silence of effects during the Qur'anic quotation (41.84–47.68 s).
- **Picture:** Canvas 2D compositor at 1080×1920 on a 24 fps master clock (the audio clock drives it). Characters animate on twos (12 drawings/s) with held drawings.
  - 5 painted backgrounds (Z-Image Turbo, then graded, baked moons painted out, sky/land split for parallax). BG06 (forward route) was not used: the narration ends on a reflection, not a march.
  - 12 companions as painted cel stickmen: plain featureless heads with the beard as the ONLY facial shape. About 330 animation drawings (rise from kneeling, hand to chest, arm opening, step forward, speaking gestures, head turns, nods, strap pulling).
  - 2 Arabian horses (bay = al-Miqdad's, chestnut): idle breathing, look around, tail flick, weight shift, snort. Period tack: rope halter, saddle blanket and girth, no stirrups.
  - Props: goat-hair tents, campfire, water skin, bedrolls, bundle, rope, bowl, sword in a leather scabbard, spears, round leather shield, saddlebags. Effects: 12-drawing flame loop, embers, smoke, dust, moon.
- **The Prophet ﷺ never appears** in any form. His position is only implied by the companions turning toward a point beyond frame-left.
- **Story:** follows the narration exactly: certainty of battle → consultation → the Ansar → Abu Bakr → Umar → al-Miqdad rises and speaks (hand to chest, arm opens, one step) → the quotation, held still → the Prophet was pleased (companions' reaction) → Ibn Mas'ud's wish → «الحياة مواقف» at pre-dawn → title.
  - Sa'd ibn Mu'adh's reply is **not** in this narration, so it was not invented.

## Rebuild
`scripts/`: `rig.py`, `costumes.py`, `sequences.py` (characters), `horse.py`, `horse_seq.py`, `props.py`, `bgproc.py`, `film_build.py` (master timeline → `build/film.json`), `sfx.py`, `bundle.py` (`dev` or `final`).

Order: `bgproc → props → sequences → horse_seq → film_build → sfx → bundle final`.

QA: `qa/shoot.js` (stills from Chromium), `qa/offline_play.js` (offline + playback test).

## Docs
- `transcript_ar.md`: verbatim narration with timings.
- `style_sheet.png`, `character_sheet.png`, `storyboard.png`: boards rendered from the real assets and frames.
