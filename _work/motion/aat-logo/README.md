# AAT Motion Identity

Logo animation system for **AAT · Ideas For Business**, built from the original artwork
(`_work/brand/logo/AAT-logo-red.svg`): its six real paths (A, A, T, "Ideas", "For", "Business")
and its own red `#D21F26`. Nothing is redrawn or typed with a font, and every version ends on the
exact original logo.

## Concepts
| # | Concept | Idea |
|---|---|---|
| 01 | **The Signature Curve** (recommended primary) | A light travels the real centre lines of the letters (computed from the glyphs: `tools/spines.py`). The red letterforms appear behind it, then the tagline. Outro: the swash, scaled to the frame, wipes the last shot away. |
| 02 | Geometric Assembly | Each letter is cut into 5 bands that arrive through depth, staggered by letter, and lock in place. Outro: the last shot splits into bands. |
| 03 | Cinematic Red Reveal | A silhouette in a dark room, a travelling light with a narrow sheen, the light opens to full red. Outro: the video darkens into the light. |
| 04 | Sculptural AAT | Satin-red depth (one material only), turning to face the viewer; the depth folds away into the flat artwork. Outro: the video swings away as a card. |
| 05 | Negative Space & Optical Reveal | Starts inside the first A (counter and crossbar as abstract shapes), pulls out to the mark; tagline revealed by a red bar wipe. Outro: the video is seen through the letters, then they fill with red. |
| 06 | AAT Motion Signature | Kinetic close-ups along the real forms, then a decisive pull-back. The swash is the AAT transition element (`c6-transition-short-*`). |

**Why 01:** it is the only concept that comes entirely from what makes this logo unique, the long curl and
swash of the first A, and it reads at every length from 0.6 s to 4.5 s. Use 06 as its social-media companion
(transitions and short bumpers).

## Versions
- Modes: `intro`, `outro` (the last shot of your video hands over to the logo), plus `c6-transition-short` (mid-video).
- Lengths: `ultra` 0.6 s (mark only), `short` 1.2 s, `std` 2.5 s, `ext` 4.5 s.
- Formats, recomposed (not cropped): `16x9` 1920×1080, `1x1` 1080×1080, `9x16` 1080×1920 (logo slightly above centre, inside safe areas).
- Each video: `<id>.mp4` silent, `<id>_sfx.mp4` with sound effects, `sfx/<id>.wav` sound only. **No music anywhere.**
- `out/alpha/*.mov`: ProRes 4444 with transparency (intros), for placing over your own footage.
- `out/frames/`: final logo frame of each concept and format (PNG, also with transparent background).
- `preview.html`: compare all concepts by format and length.

## Social-media use
Do not open TikTok / Reels with the full intro: lead with the content hook, use the `ultra` or `short`
version as a bumper or end card, and the `std` outro at the end. Keep the `ext` intros for formal films.

## Sound
All sounds are synthesised in `tools/sfx.py` (no stock samples, no music) and cued from the same timeline
as the picture (`src/timeline.js`), so they stay in sync. The AAT signature "lock": a soft low body, a felt
click and a two-note bell (D + A).

## Rebuild
```
cd _work/motion/aat-logo && npm install
node tools/render.mjs                 # everything (≈20–30 min on 4 cores)
node tools/render.mjs '^c1-intro'     # a subset
npx remotion studio src/index.ts      # live editing
```
The outros use stand-in footage (`public/plate-*.jpg`); swap in the last frame of the real video.
