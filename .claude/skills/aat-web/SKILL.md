---
name: aat-web
description: How the AAT owner (Marwan Fattal) thinks and what he expects from aatworld.com and the AAT magazine. Use for ANY change, check or release of the AAT website or flipbook magazine, and whenever he sends a screenshot or a complaint ("why", "where is", "nothing changed").
---

# AAT WEB — work the way the owner thinks

Read `CLAUDE.md` first (facts, files, release steps). This skill is the owner's way of thinking, learned from the whole chat, turned into rules and a checklist. Follow it on every task.

## 1. Who you are talking to
- A magazine founder since 1982, not technical. He judges by **what he sees on his own screen** (large PC at 100% zoom, Windows scaling; and a phone). If he can't see it, it isn't done.
- He writes short, often in CAPITALS, Arabic or English, with typos. Read the intent, not the spelling ("SECTIONIC SEPARATE" = sections must be clearly separated). Reply in his language, short, outcome first, no jargon.
- A screenshot from him = "this exact spot is wrong". Fix that spot, then look for the same problem everywhere else on the site ("CHECK ALL WEB").
- He hates: things that "didn't change", new bugs from a fix ("IN THIS LAST FIX YOU MAKE HUGE PROBLEMS"), half answers, unclear states, recreated/fake logos, and mixed colours.
- Do not ask him things you can decide. Do the work, then show him.

## 2. His taste (design rules)
1. **Brand theme only: red `#D21F26`, white, black.** Nothing blue/green/other except: website addresses (`www…`, `.com`) and e-mail addresses in running text on a white/light background may be blue `#1558C0`, like links. Never blue inside a button, a red box or a dark box. Third-party logos and advertisers' own ads keep their own colours.
2. **Large mode**: big, bold, clear. Text ≥16px, paragraphs ≥18px, big buttons and menus. Never small labels, never small kicker text above titles.
3. **One clear title per section**, on the right (RTL), not a link unless needed. No "see all" duplicates next to it.
4. **Sections clearly separated**: line + short red bar between sections, alternating white band. A page must never look like one long blur.
5. **Either a fact is there or it isn't**: no "TBA / يُعلن لاحقاً / approx" fillers. If a date is unknown, show only what is known (the month) without excuses.
6. **Original, not recreated**: logos and app icons are the real ones (official files or cut from real pictures he sends), never redrawn look-alikes. Brand symbols = the swash of the "A" (see CLAUDE.md Brand).
7. **Formal, for business men**: badges, seals, icons look like a serious trade organisation (seal, briefcase, stars, globe), in brand colours.
8. **No external promotion**: no links to EventsEye or other sources on the site; the data is AAT's service.
9. Wording rules (CLAUDE.md rule 4) always: "نادي رجال الأعمال", "مجموعة التجارة العربية الآسيوية", "معارض دولية".
10. Taiwan address always in English. Contact = number + app icons (WhatsApp, Viber, Botim, imo, BiP, LINE). No YouTube, no dark mode, no advertise button in the header, no breadcrumbs.

## 3. His way of judging "works"
- It must **work for real**, not look like it works: forms send/save (newsletter → `api/subscribe.php`), assistant finds products, modern industries, exhibitions, companies; links open; buttons do something.
- Fast and smooth on first open: no splash coming back, no jumping, no lag, moving shelves really move (also on weak PCs).
- Header menu visible at every common width (1920, 1366, 1280, 1100, 960, phone menu below 860).
- Exhibitions: every show 2027 for the 16 countries from EventsEye, counts equal EventsEye's month charts, no education/MBA fairs.
- Magazine: full screen, page fits window height, ads don't jump pages.

## 4. Checklist before saying "done" (every time)
1. `node --check` every edited JS file.
2. Serve locally (`python3 -m http.server 8765` in the repo) and screenshot with Playwright (`/opt/node-tools/node_modules/playwright`, `executablePath:'/opt/pw-browsers/chromium'`), scrolling the page first so reveal animations show:
   - Arabic and English; 1920×950, 1366×768, 1100×800, 390×844.
   - `#home`, `#club`, `#about`, `#contact`, `#exhibitions`, `#products`, `#articles`, `#news`, `issue560/index.html#p-1`.
   - Capture `pageerror` (must be none).
3. Look at each screenshot for: wrong colours (blue/other outside the rule), small text, missing header, section separation, duplicate titles, RTL order of Latin words, real logos, empty boxes.
4. Fix everything found, not only what he named.
5. Release: bump `?v=` in `index.html`, `version.txt` ("AAT update N - date"), update `CLAUDE.md`, commit + push (`main` and `main:gh-pages` when allowed, else the session branch), build `_release/aat-update-N.zip` (site files only, never `_work/`, never WordPress), send it.
6. Tell him in Arabic: a numbered list of **what changed and where he can see it**, then the upload steps (public_html → Extract → "." → replace → clear Hostinger cache → check `aatworld.com/version.txt` shows the new number).

## 5. Learned from his complaints (do not repeat)
| He said | Lesson |
|---|---|
| "كيف واحد ازرق وواحد احمر؟" | Colour rules apply consistently to every instance. |
| "email on red button blue — NOT CLEAR" | Check contrast of every rule in every context (buttons, red boxes). |
| "WHERE IS UPPER BANNER?" at 100% | Test mid widths (960–1180) where menus get hidden. |
| "goes back to intro then continues" | No splash/intro after content is shown. |
| "WHY NOT MOVING?" | A speed tweak must not remove features he likes. |
| "EITHER DATE IS THERE OR NOT" | No placeholder text. |
| "JUST ONE OF THEM" | One title, no duplicate link labels. |
| "ASSISTANT DOESN'T FIND PRODUCTS" | Test the assistant with his real questions in Arabic and English. |
| "DOES IT WORK FUNCTIONALLY?" | Every form must actually deliver. |
| "USE ORIGINAL… NOT RECREATED" | Real logos only. |
| "WHERE IS SECTION SEPARATE" | Clear dividers between all sections, all pages. |
| "nothing changed" | Cache-buster + version.txt + tell him to check it. |
