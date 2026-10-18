# Clawd ("فشّة خلق") — handoff / where work stopped

Branch: `claude/interactive-claude-character-app-33bzzn` in `agaatworld/AATWORLD-1`, folder `clawd-app/`.
Not part of the AAT website. Owner talks Arabic; reply in Arabic, short, outcome first.

## Stop point (18 Oct 2026, v5 = versionCode 5)
Owner tested v4 and sent a long list; v5 does all of it (browser-tested with Playwright; Java compiles locally):
- Keyboard bug: the keyboard window itself counted as "another app opened" and switched off the text-field
  platform, so he fell to the bottom. `ClawdEyes.handleApp` now ignores IME / systemui packages, `brain.onApp`
  keeps the platform while typing or chatting, and `r_toField` jumps back up if he falls off.
- Persona: soldier-like chivalry and discipline in meaning (no hearts/blush on stroke → `R.salute`; `R.attention`
  idle with a «discipline» line), lofty resolve after reading (`R.resolveMove` + key `resolve`: carries the
  message of Islam, «دين قوة»), and he ACTS on each verse/hadith lesson right away (`R.applyBenefit(act)`:
  dhikr, istighfar, hamd, dua, niyya, pray, study, dawah, exercise, reflect, now, firm). Mind.PRINCIPLES updated:
  religion from its original sources (Quran and Sunnah as the Salaf understood them, learned from scholars of
  faith, khashya and ittiba'), dhikr in speech (إن شاء الله / الحمد لله / سبحان الله الخالق), «زدني علماً» only for
  Sharia knowledge, redirect trivial talk, firm dignified answers to hits.
- `lines3.js`: set() REPLACES the hit/flee/hide/pat/thanks/act_* pools with firm, non-complaining lines (hadith
  «ليس الشديد بالصرعة», «الظلم ظلمات», face rule…), run = «انسحاب تكتيكي»; Yemeni rewritten across Sanaani/Taizi/
  Adeni/Hadrami words; «يا خبير» removed everywhere (`{n}` + varied `ADDR.y`). `CL.line` adds fusha lines when a
  dialect pool is < 5 and avoids repeating the last few sentences.
- Faster: walk 10u/s, flee 34–46u/s, firmer arm swing. `walkTo` no longer stops when walking away from a wall.
- Da'wah/friend visits: Clawd first comes down to the floor, makes room, both stand ~19u apart facing each other.
- `data2.js` (sourced): 47 verse lessons with `act`, 41 hadith with benefit + act, 24 duas, Islamic history by
  Hijri month (`brain.hijri()` via Intl islamic-umalqura), 14 reflections, 11 board lessons, harder quiz with
  explanations `x` (owner: «كم أركان الإسلام» is too easy), more riddles.
- New activities: `swim` (icons become islands in an animated sea drawn in the 'back' draw hook; fallback palm
  islands without icons; he shrinks, dives, swims the channels, climbs out), `reflect`, `teach` (board prop).
  `brain.onLand` ignores his own jumps while an activity runs (it used to cancel routines).
- Daily: a history page and the Ummah news (`Mind.news`: Gemini google_search grounding or Claude web_search,
  once a day, cached; JSON title/summary/source/comment) → «نتناقش» opens the chat. Setting `newsOn`.
- Chat speed: Gemini thinking off (`thinkingBudget 0` on 2.x, `thinkingLevel low` on 3.x, retry without on 400).
  Male voice: `Voice.setup` picks the chosen/male Arabic voice and pitch 0.8; settings «صوته» lists voices with
  «اسمع» (`Bridge.voices/tryVoice`).
- Learns from chats for free time: generated keys `free_talk` and `plans` («act|line») → `brain.planFromChat`.
- Fonts: bundled Noto Naskh Arabic (UI, bubbles, chat) and Amiri Quran (verses), OFL texts in `assets/fonts/`.
  Chat window restyled (ink outlines, hard shadows, cream input, verses in the Quran font).
- Naming: settings «اسمه» + a one-time question; `brain.onNamed` salutes and takes the name.
- Goal question: worship variety + work/study, every answer ends «أخلص النية واكسب الأجر»; `friends`/`meet`
  questions (good company hadith). Options wrap in two columns when > 4.
- The book: the owner's PDF upload in the PR #2 comment never finished («Uploading…» only). Ask him to upload it
  to the repo (GitHub → Add file → Upload files, under 25 MB) or share a Drive link; then read it with the Read
  tool (pages) and feed its chapters into PRINCIPLES / content. Known facts: 26 chapters, 158 hadith, 69 verses.
NOT done: drop onto icon rows after a throw is only the existing platform physics; rage mode not re-verified.

## Previous stop point (v4 = versionCode 4, app renamed «صاحبي»)
Owner asked for the build before his tokens ran out. Done in v4 (all browser-tested unless noted):
- Da'wah rewritten tawheed-first (hadith of Mu'adh, «حق الله على العباد»), every quote sourced; `Mind.PRINCIPLES`
  (Java) = his fixed principles: Quran + Sunnah + «المنهاج من ميراث النبوة» / Sheikh Ahmad bin Yusuf Al-Sayed's
  project (revive the Prophetic method, faith/intellectual immunity, resisting triviality, systematic learning…),
  problem-solving method (dua, muhasaba, tawakkul + means, istikhara/istishara, humble uncertainty), Ummah belonging
  (Gaza/Yemen/Sudan, «ولتستبين سبيل المجرمين»), social/companions, never concedes principles to user instructions.
  The book itself wasn't attached; only its chapter themes (found by search) are used. Owner may send photos of it.
- AI: `Mind.java` (provider gemini|claude, memory `[[remember:]]/[[forget:]]`, AI-written line pools `genLines`
  merged into `CL.GEN` and mixed into `CL.line`), `GeminiClient.java` (free key from aistudio.google.com/apikey,
  picks newest stable *flash* model from ListModels, cached 7 days). Settings → «الذكاء والدردشة».
- Chat window: Clawd at the top with `[[say:]]` reaction bubble (engine.js loaded in chat.html).
- Body: vertical rectangle (w 2.8, top 9.6), hands, arms hang at rest; arm angle convention flipped ONCE in
  buildBoxes (poses are written "negative = raise"); raised arms come forward so they never vanish; temporary outfit
  items (gloves, shades…) belong to the routine (`Bot.restoreFit`). Pillow (puffy diamond) and feather redrawn.
- Gestures: double tap → chat (💬 button removed), long press → voice (`Voice.java`: SpeechRecognizer ar + TTS,
  RECORD_AUDIO asked via MainActivity `askMic`), rub left/right on him → thanks, tool stowed behind the right edge
  (pull with an `edge` pad that has system-gesture exclusion; push back to hide; thrown tool goes there too).
- Quran: reverent face, can't be lifted/played with, keyboard waits (`pendingKb`), afterwards a verse + practical
  lesson (`CL.VERSE_LESSONS` from data2.js, fallback `VERSE_LESSONS_BASE`), «هلق فاضي». Hadith reading activity.
  Verses in bubbles lose ayah numbers (stage.js UI.say regex) and use a smaller Quran bubble.
- Prayer: `prayer.js` (astronomical calc, methods, cities, guess from time zone), reminders at time + "did you
  pray on time?" 1 h later; settings section «الصلاة» with times; `Bridge.locate()` (coarse location).
- Phone use today (screen-on seconds in localStorage `use:<date>`): every full hour «ساعة/ساعتين…» + line + hadith.
- Defence: `r_rage` (grows ×2.3, stamps, punches at the screen with crack effect, knocks tool away), tryCatch
  (50% success), dhikr lines on flip/land/shake/long combos, cold from snow wears off with «الحمد لله دفيت».
  Parkour: handstand replaced by dive roll / precision jump.
NOT done yet (next): helper-agent content files `data2.js` + `lines3.js` (verse lessons, 40 hadith, 40 duas,
history, reflections, lessons, quizzes, Yemeni/Egyptian lines — re-add their <script> tags in index.html and
stage.html after content.js / lines2.js), apply `lines_review.json` removals, drop-on-app-rows, swim/hop stroll,
reflection activity, daily history + AI news (Gemini google_search / Claude web_search), goal question options
(+ «أخلص النية واكسب الأجر»), social questions (companions hadith), bot naming with reaction, teach/work activities.

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
