# Clawd ("فشّة خلق") — handoff / where work stopped

Branch: `claude/interactive-claude-character-app-33bzzn` in `agaatworld/AATWORLD-1`, folder `clawd-app/`.
Not part of the AAT website. Owner talks Arabic; reply in Arabic, short, outcome first.

## Stop point (18 Oct 2026, ~02:30 UTC)
- Owner feedback on v2 (real Samsung): phone froze completely (had to restart), couldn't change the tool,
  doesn't want dancing / singing / yoga-like poses, asked "where is the run? I want him to run when I hold the stick".
- v3 (`5044d23`, versionCode 3):
  - **Run mode** (`brain.r_run`, `canRun`, `maybeRun`): holding the tool (charge) or dragging it → he runs from it,
    sprints when close, jumps over it / wall-runs when cornered, or pleads «آخر مرة» first; stops at a safe distance
    and watches; pants when released; tired after 24 s. Freezes on 55% of swings mid-run so hits land. Not when
    `rightful()`. Setting `flee` («يهرب لما تمسك العصا»). Lines `run_*` in `lines2.js`. `c.runLean` in engine.
  - **Freeze fixes**: chat window `FLAG_NOT_TOUCH_MODAL|FLAG_WATCH_OUTSIDE_TOUCH` + unfocus on outside touch; pads never
    go full screen (a gesture stays with the window that got DOWN anyway); stage alpha ≤ 0.8 on Android 12+ (untrusted
    touch occlusion); low-importance notification with «إيقاف».
  - Removed dabke, mini-dance, humming, focus pose; system prompt says no dancing/singing.
  - Logging: `touch <id> down x y` (native pad) and `js gesture <id> tap|long|drag|charge` (JS) in logcat tag `Clawd`.
  - CI `emu.sh` now also drags the tool towards him (`09f_run1`, `09g_run2`, `09h_run_end`).
- Later the same night (owner requests): jalabiya flicker fixed (robe and body blocks no longer overlap, so the depth
  sort can't flip; white puff on dress/undress); the ⇄ tool chooser is gone from the floating Clawd: tools are chosen
  only in the app (toolbar under the arena + settings) or by asking in the chat; the floating Clawd hides while the app
  screen is in front (`OverlayService.appInFront`); the app reloads settings on resume; no "bored/fed up" lines at all
  in idle talk, and for 3 minutes after tasbih/dua/Quran (`B.worshipGlow`) no bored/sleepy faces, only `after_worship`
  lines; chat system prompt forbids boredom about worship.
- CI app screenshots right after install (`02_app`, `03`) are often blank: the emulator's first WebView start is slow
  (~8 s with swiftshader); later shots (`05`+, `13_app_again`) render. Not an app bug. CI now reopens the app later (`13_app_again`), taps
  «مخدة» via `uiautomator dump`, and checks the floating Clawd (`13c_home_pillow`, log `js tool pillow`).
- **v3 APKs sent to the owner** (build `e9415bb`: `fasha-khulq-v3-lite.apk`, `fasha-khulq-v3-full.apk`). CI proved: app renders,
  arena hits, app toolbar «مخدة» → floating Clawd gets the pillow (log `js tool pillow`, tool pad 228→160 px), run mode on
  the emulator («من فوقك!» then «الحمد لله… فكّة»). After sending: the floating stage now hides with window alpha 0 instead
  of GONE (GONE showed a stale frame for a moment when it came back); CI `4203e95` confirms the pillow right away
  (`13c_home_pillow`). That change is not in the v3 APKs sent. Waiting for the owner's real-phone feedback.
- Pads were verified at the right pixels in CI (after the first ~5 s, when the stage re-sizes to full screen).
- Next: check CI shots/log for v3, send `dist/clawd-lite.apk` + `dist/clawd.apk` to the owner, wait for real-phone feedback.

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
  glasses, martial arts, exercise, book, tea, sleep, juggle, plant), parkour, 3D top-down stroll, run-away mode,
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
  pad windows over Clawd/tool/buttons (the gesture stays with the pad that got DOWN); accelerometer → gravity/shake;
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
