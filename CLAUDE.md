# AAT World — project guide for Claude

Read this whole file before doing anything. It replaces the long chat history.

## Who and what
- Owner: **Mohamad Marwan Fattal (محمد مروان فتال)**, founder of **Arab Asian Trade (AAT) · التجارة العربية الآسيوية · 中阿商業雜誌**, a printed + online B2B trade magazine since 1982, Taiwan office (P.O. BOX 568, Yonghe, New Taipei City 234964, Taiwan R.O.C., +886 966 404 681, marwanaat@gmail.com, www.aatworld.com).
- He is not technical. He writes in Arabic or English (often capitals). **Reply in Arabic when he writes Arabic.** Short, plain, outcome first, no jargon. He gets angry when something "didn't change": always say exactly what changed and how he can see it.
- CEO name is unconfirmed: magazine page 6 says **عبدالرحمن محمد / Abdulrahman Mohammad**; the old site said **مروان أنس / Marwan Anas**. CEO phone/email unknown.

## STANDING RULES (non-negotiable)
1. **LARGE MODE everywhere.** Readers have weak eyesight. Website and magazine: large, bold, clear text, menus, buttons, labels, footers. No small text. Site floor: 16px any text, 18px paragraphs (enforced by `floorText()` in `assets/js/main.js`), then CSS `zoom` enlarges on wide screens. Magazine has `floorize()`.
2. **Magazine**: opens full screen; the page fits the window **height** exactly (whole page visible, not zoomed in). Two pages side by side if both fit at full height, else one.
3. **Exhibitions** ("معارض دولية"): every trade show **1 Jan – 31 Dec 2027** for all 16 covered countries (tw id my pk af dz eg iq kw ye om qa sa sy ae tr), from **EventsEye**, double-checked month by month against EventsEye's monthly counts. No education/student fairs or MBA events.
4. Wording: "نادي رجال الأعمال" (never نادي الأعمال); "مجموعة التجارة العربية الآسيوية" (never مجموعة AAT); "معارض دولية" (never التقويم/calendar). No small kicker labels above section headings.
5. Clicking an ad in the magazine must NOT jump to another page. Cover: images, logos, company names only — no prices/details/links.
6. Always **look at the result yourself** (screenshots with Playwright) before telling him it's done. Check RTL Arabic and the English version.

## The website (this repo)
- Static single-page site, hash routes (`#home`, `#magazine`, `#flip`, `#articles`, `#news`, `#exhibitions`, `#exhibition-<id>`, `#products`, `#club`, `#about`, `#contact`, `#company-<page>`…). No build step.
- `index.html` — shell; asset links carry a cache-buster `?v=YYYYMMDDx`. **Bump it on every release** or visitors keep old files.
- `assets/js/core.js` (data helpers, routes, `eventsWindow`, dates), `ui.js` (components: header, `head()`, cards, `eventRow`, trade map), `views.js` (every page), `main.js` (router, events, fullscreen, flipbook embed, chat, `floorText`), `mag.js` (company mini-sites), `i18n.js` (all UI text: ar/en/zh), `data/*.js` (content; `data/extra2.js` ends with the 2027 EventsEye block).
- `assets/css/app.css` (site; late blocks override earlier ones), `mag.css`.
- Fonts: Al-Jazeera-Arabic Regular/Bold (owner supplied) in `assets/fonts/aljazeera-*.ttf`, used as "Jazeera".
- `issue560/index.html` — the flipbook magazine (issue 560, 100 pages), one big HTML file with inline CSS/JS blocks (`<style id="r2">`, `<style id="r3">` = latest overrides). Page turning: StPageFlip (`issue560/assets/page-flip.js`, MIT) with RTL by loading pages reversed and several monkeypatches. Side drawer opened by the AAT logo button `#mBtn` (hover on desktop, tap on phone). `dims()` sets page size.
- `version.txt` — "AAT update N · date". Bump each release; the owner checks aatworld.com/version.txt.
- `_work/` — NOT part of the site: exhibitions source lists + `build.py`, brand files (logo, symbols, business card, name-card designs), helper scripts. Exclude from release zips.

## Testing locally
```
cd <repo> && python3 -m http.server 8765 &
```
Then Playwright (Chromium is preinstalled; `npm i playwright` in a scratch folder; launch with `executablePath:'/opt/pw-browsers/chromium'`). Screenshot `http://localhost:8765/` (Arabic default), `#exhibitions`, `issue560/index.html#p-1`, `#p-6`, at 1366×768 and 390×844. Capture `pageerror`. Run `node --check` on every edited JS file.

## Releasing to the live site (Hostinger)
- Live: **aatworld.com** on Hostinger, files in `public_html`. The OLD WordPress site + Business Club data stay in the same `public_html`, hidden by `.htaccess` (DirectoryIndex index.html; non-file URLs redirect home except `/wp-admin|wp-login|wp-json|wp-content|wp-includes`). **Never delete WordPress files.**
- Current method: build a zip of `index.html version.txt assets/css assets/js assets/img/flags assets/fonts/aljazeera-*.ttf issue560/index.html issue560/assets/page-flip.js issue560/assets/fonts/aljazeera-*.ttf` (plus any new images) and the owner uploads it into `public_html` → Extract → folder "." → replace → clear Hostinger cache → check `/version.txt`.
- **Biggest recurring problem:** the owner says "nothing changed" because the zip was extracted into a sub-folder or Hostinger cache/CDN served old files. Always tell him to check `/version.txt`.
- Better (not yet done): Hostinger hPanel → Websites → Advanced → **Git** → repo `https://github.com/agaatworld/AATWORLD-1`, branch `main`, directory `public_html`… BUT Hostinger Git deploy wants an empty folder, and public_html holds WordPress. Safer: deploy to a sub-folder and point the domain, or keep zips. Discuss with him before changing.
- Git: push to `main` and also `main:gh-pages` (GitHub Pages preview). Commit messages end with the attribution lines the session gives.

## Brand
- Red `#D21F26` (also #C4141C, deep #7A0A10), white. Logo SVGs: `_work/brand/logo/`.
- Brand symbol: the long swash of the "A" in the logo. Owner-approved shapes: single swash (`_work/brand/symbols/AAT-user-one.svg`) and the hooked pair (`AAT-user-pair.svg` — two swashes interlocked at their thick curled ends). Background pattern = small hooked pairs, darker red on red, compact.
- Business card (approved direction, v5): white side = logo top centre, two arcs of hooked pairs (top-left and bottom-right corners), name/OWNER/phone/email bottom-left, small vCard QR bottom-right; red side = company name in 3 languages on top, white box with the logo and the single symbol placed between the first and second "A", hooked-pair pattern background, address then website at the bottom. Files: `_work/brand/business-card/`, generator `_work/brand/scripts/bcard.py`.
- Design board artifact (Claude): "AAT Name Cards" https://claude.ai/artifact/23umBYa17bkqmMshRp5sGe (18 name-card designs + BusinessCard board). Project doc `claude/aat-brand-kit.md`, rules `claude/aat-website-rules.md` in the claude.ai project "AAT WORLD".

## Exhibitions data
- Source text per country: `_work/exhibitions/*.txt` (`small.txt` and `gaps.txt` use `#cc` country headers). `python3 build.py` → `ee2027.json` → replace ONLY the `var X = [...]` inside the block that starts with `/* international exhibitions January to December 2027` in `assets/js/data/extra2.js` (the file has 5 other `var X =` blocks — a careless regex once replaced the wrong one).
- EventsEye is reachable only through the WebFetch tool (shell curl is blocked). URL patterns: `https://www.eventseye.com/fairs/c1_trade-shows_<country>.html`, `_1.html`, `_2.html` (50 rows per page, chronological); month pages `cd1_trade-shows_<country>_<month>_1.html` (`_1` = 2027). The country page sidebar gives monthly counts for verification. Slugs: taiwan, indonesia, malaysia, pakistan, afghanistan, algeria, egypt, iraq, kuwait, yemen, oman, qatar, saudi-arabia, syria, united-arab-emirates, turkey.
- Status 15 Oct 2026: 948 shows. All countries verified except **UAE** (pages failed to load that day; July/December unverified). Month-only shows have `approx` and show "اليوم يُعلن لاحقاً".

## Open tasks (as of 15 Oct 2026)
1. Confirm the owner uploaded **update 15** (`version.txt`). Live site had been showing an old magazine (top bar, "See page 52", small footer) — evidence earlier updates weren't extracted correctly.
2. UAE exhibitions July & December 2027: re-check on EventsEye.
3. Sector pictures on the home page are poor matches — need real photos from the owner or a stock source.
4. "من نحن / About us": owner wants the exact text of the old WordPress page (`https://aatworld.com/about-us/`, page id 1970). Tools only returned a summary; ask him to paste the text from WordPress → Pages → About Us.
5. Magazine pages 95–96 (exhibitions in the printed issue) still show Nov 2026; ask whether to replace with 2027.
6. CEO name/phone/email for the CEO business card.
7. Email forwarding info@aatworld.com → ag.aatworld@gmail.com and aatworld3@gmail.com (steps were given; completion unknown).
8. Optional: Hostinger Git auto-deploy (see above).

## Pitfalls learned
- Arabic RTL: runs of several Latin words must be wrapped or their order flips; check ticks/arrows direction.
- Don't trust "looks done" — render and look. Measure text sizes; the owner reads on a large PC screen and a phone.
- Class name clashes in CSS: search before adding new class names (`.mz-*` had clashes).
- Brand data in the magazine is keyed by company (`brOf()`), not by page.
- Shell `rm` with variables/globs can be blocked by the safety check; use explicit paths.
- Zips over ~30 MB can't be sent in chat; split them.
