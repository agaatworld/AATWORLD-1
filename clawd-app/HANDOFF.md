# Clawd ("فشّة خلق") — handoff / where work stopped

Branch: `claude/interactive-claude-character-app-33bzzn` in `agaatworld/AATWORLD-1`, folder `clawd-app/`.
Not part of the AAT website. Owner talks Arabic; reply in Arabic, short, outcome first.

## Stop point (18 Oct 2026, ~01:25 UTC)
- **Floating overlay confirmed on the emulator** (build of `be60ced`): second `stage ready` at full screen
  (412×915dp), overlay + pad windows present, Clawd visible over home, Phone app and Settings
  (`dist/08_home_floating.png`, `09_home_tap.png`, `10_over_settings.png`).
- **Play Protect** on the owner's Samsung blocked v2 ("App blocked to protect your device"): its enhanced fraud
  protection blocks sideloaded apps that declare an accessibility service. So there are now two flavors:
  - `lite` (`dist/clawd-lite.apk`): no `ClawdEyes`; installs normally. Settings show «عيون كلود» as unavailable.
  - `full` (`dist/clawd.apk`): with `ClawdEyes`; needs Play Protect scanning off for the install.
  The service declaration lives in `app/src/full/AndroidManifest.xml`. Both were sent to the owner.
- CI can't open the chat window (`am startservice` → service not exported). Chat is only tested in the browser mock.
- Next: wait for the owner's feedback from the real phone (lite first). Small polish noticed: on the home screen
  Clawd stands on the Google search bar at the very bottom; consider a higher resting spot.

## What exists
Web layer (all in `app/src/main/assets/`, plain JS, no build step):
- `js/engine.js` — 3D box renderer (orthographic cuboids; front face textured with pixel faces), ~45 faces,
  props (mushaf on rehal, tasbih, book, tea, plant…), 7 tools (stick, pillow, squeaky hammer, boxing glove,
  water balloon, snowball, feather), particles, world physics (gravity from device tilt, walls, platforms),
  sounds (WebAudio synth), no-repeat "bags" persisted in localStorage.
- `js/content.js` — settings defaults, dialect helpers, Quran verses + hadith (only well-known authentic ones with
  sources), dhikr, question trees with answers, quiz, riddles, jokes, friend talks + gentle da'wah talks.
- `js/lines1.js`, `js/lines2.js` — big speech database, 7 dialects (s شامي, e مصري, y يمني, g خليجي, i عراقي, m مغربي, f فصحى).
- `js/acts.js` — generator routines: idle moves, activities (tasbih, dua, Quran in jalabiya+taqiyah, study with
  glasses, focus, martial arts, exercise, book, tea, sleep, juggle, plant, dabke), parkour, 3D top-down stroll,
  friend Pixel visit (spar / talk / da'wah).
- `js/brain.js` — moods, rapport, every reaction (touch, hits, combos, KO, dodge, flee, hide-under-screen with
  answer options, helmet/shield, call friend), dignity ("in the right" after advice or during worship → sometimes
  catches the stick and throws it away / confiscates / blocks and scolds; leaves for a walk after too many hits),
  questions, advice on long phone / short-video use, greetings after absence, keyboard → sits on the text field,
  chat state, chat context for Claude.
- `js/stage.js` — page glue: bubbles, answer buttons, gestures, touch pads for Android, gravity/shake, native API
  `window.clawd.*`, browser mock (`stage.html?mock=1`: fake home screen, keyboard, apps, tilt buttons).
- `index.html` + `js/app.js` — app screen: "Welcome, Claw'd" splash, arena, stats, full settings, permissions, Claude key.
- `chat.html` + `js/chat.js` — floating chat window UI (streams replies; strips `[[face:x]][[act:y]]` tags).
- `stage.html` — the floating overlay page.

Android (`app/src/main/java/com/aat/clawd/`):
- `OverlayService` — full-screen pass-through (NOT_TOUCHABLE) WebView with `stage.html`, plus small touchable
  pad windows over Clawd/tool/buttons (pad goes full-screen during a drag); accelerometer → gravity/shake;
  screen on/off; floating chat window (`ChatWindow`, focusable, drag by header, back closes).
- `ClaudeClient` — raw HTTPS + SSE to the Messages API (no SDK; small, Android-safe). Model from settings
  (default `claude-opus-5-5`), effort low, server-side fallback header for Opus/Sonnet.
- `ClawdEyes` — accessibility service: foreground app kind (home/chat/video/other), keyboard open + field bounds,
  "typing" signal **without reading the text** (deliberate: reading typed text from other apps = keylogger),
  best-effort home-icon bounds.
- `Bridge` (`window.A`), `MainActivity`, `Prefs`, `Perms`, `Bus`, `BootReceiver`.
- Compiles locally: `javac -cp android34.jar` (android.jar from raw.githubusercontent Reginer/aosp-android-jar)
  with an `R` stub. Google's dl host is blocked here, so APKs are built by `.github/workflows/clawd-apk.yml`,
  which also runs `ci/emu.sh` on an emulator and commits `dist/clawd.apk` + screenshots back to the branch.

## Verified
- Browser (Playwright, same JS): every tool, combos, KO, catch-and-throw, hide/peek with answers, parkour,
  tilt incl. upside-down, typing perch, questions, Quran/tasbih/study visuals, friend spar, chat mock, settings.
- Emulator (build #7/#8): app screen, splash, arena hits, settings/help render, accessibility service bound, no crashes.

## Not yet verified / next steps
1. Overlay rendering over other apps (build #9 — see stop point).
2. Real phone only: Claude chat with the owner's API key, real tilt/flip, typing perch on a real keyboard,
   icon-hopping on the owner's launcher.
3. Polish ideas: tune overlay battery use (frame skipping when tiny), more dialect lines per key,
   larger default size option for weak eyesight.

## Decisions to keep
- No slipper/shoe/newspaper as tools (insulting). Tools listed above only.
- Never read typed text from other apps. Keyboard/field position + "typing" signal only.
- Religious text: only authentic, well-known verses/hadith with sources; da'wah gentle, «لا إكراه في الدين».
