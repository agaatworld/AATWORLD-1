# AAT World — project guide for Claude

Read this whole file before doing anything. It replaces the long chat history.

## Who and what
- Owner: **Mohamad Marwan Fattal (محمد مروان فتال)**, founder of **Arab Asian Trade (AAT) · التجارة العربية الآسيوية · 中阿商業雜誌**, a printed + online B2B trade magazine since 1982, Taiwan office (P.O. BOX 568, Yonghe, New Taipei City 234964, Taiwan R.O.C., +886 966 404 681, marwan@aatworld.com, www.aatworld.com).
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
- **Magazine PDF = picture of the flipbook.** `issue560/AAT-560-October-2026.pdf` is made FROM the flipbook, page by page: `node _work/tools/mag_pdf.js && python3 _work/tools/mag_pdf.py` (server on :8765). Run it after EVERY change to `issue560/index.html` and put the PDF in the release zip. (19 Oct: owner found the PDF "totally different" from the flip — it was printed once on 8 Oct and never remade.)
- **Biggest recurring problem:** the owner says "nothing changed" because the zip was extracted into a sub-folder or Hostinger cache/CDN served old files. Always tell him to check `/version.txt`.
- Better (not yet done): Hostinger hPanel → Websites → Advanced → **Git** → repo `https://github.com/agaatworld/AATWORLD-1`, branch `main`, directory `public_html`… BUT Hostinger Git deploy wants an empty folder, and public_html holds WordPress. Safer: deploy to a sub-folder and point the domain, or keep zips. Discuss with him before changing.
- Git: push to `main` and also `main:gh-pages` (GitHub Pages preview). Commit messages end with the attribution lines the session gives.

## Brand
- Red `#D21F26` (also #C4141C, deep #7A0A10), white. Logo SVGs: `_work/brand/logo/`.
- Brand symbol: the long swash of the "A" in the logo. Owner-approved shapes: single swash (`_work/brand/symbols/AAT-user-one.svg`) and the hooked pair (`AAT-user-pair.svg` — two swashes interlocked at their thick curled ends). Background pattern = small hooked pairs, darker red on red, compact.
- Business card (approved direction, v5): white side = logo top centre, two arcs of hooked pairs (top-left and bottom-right corners), name/OWNER/phone/email bottom-left, small vCard QR bottom-right; red side = company name in 3 languages on top, white box with the logo and the single symbol placed between the first and second "A", hooked-pair pattern background, address then website at the bottom. Files: `_work/brand/business-card/`, generator `_work/brand/scripts/bcard.py`.
- Design board artifact (Claude): "AAT Name Cards" https://claude.ai/artifact/23umBYa17bkqmMshRp5sGe (18 name-card designs + BusinessCard board). Project doc `claude/aat-brand-kit.md`, rules `claude/aat-website-rules.md` in the claude.ai project "AAT WORLD".

## Exhibitions data
- Source: EventsEye, read automatically. The environment allows `*.eventseye.com` (Limited network, Allowed domains).
- `cd _work/exhibitions && python3 scrape_ee.py` reads, for each of the 16 countries, the monthly chart on the country page and every month page from January 2027 on (2027 = suffix `_1`, 2028 = `_2`), compares rows read with the chart count (`ee_check.txt`, "DIFFERENT" marks a mismatch), drops education/MBA/student fairs → `ee_scrape.json`. Then `python3 build_scrape.py` → `ee2027.json` and replaces ONLY the `var X = [...]` of the block starting `/* international exhibitions January to December 2027` in `assets/js/data/extra2.js` (rows: name, start, end, country, city, venue, sector en, sector ar (field group), month only, EventsEye page).
- Country slugs: taiwan, indonesia, malaysia, pakistan, algeria, egypt, iraq, kuwait, oman, qatar, saudi-arabia, syria, **uae-united-arab-emirates**, turkey. Afghanistan and Yemen have no EventsEye page (no shows).
- Status 19 Oct 2026: 1,460 shows (1,039 in 2027 + 421 already listed for 2028); every month equals EventsEye's chart. The exhibitions page filters by country AND field (18 field groups from keywords in `build_scrape.py`).
- Old hand-made lists (`*.txt`, `build.py`) are kept only for their sector labels.

## Owner decisions (19 Oct 2026)
- The Taiwan address is ALWAYS shown in English (P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.), even on the Arabic site.
- Header: "English"/"العربية" switch + separate globe button with all languages. No dark mode, no advertise button in the header, no breadcrumbs.
- Contact: number + app icons (WhatsApp, Viber link; Botim, imo, BiP, LINE copy the number). No YouTube.
- AAT assistant ("محادثة 24 ساعة") is ON again (`assistant: true` in `assets/js/data/data.js`), working without an API: `assets/js/assistant.js` answers from the site content (exhibitions by country/city/month/field/name incl. Arabic spellings of famous shows, companies, products, articles, news, FAQs, contact, advertising, club, magazine, about). An AI-backed version can come later if he gets an API.
- Live site was on update 23 (17 Oct); updates 24–28 sent 19 Oct (28 includes all, plus members/list.php). `.htaccess` lines for the owner: `_release/htaccess-add-at-top.txt` (not yet confirmed added).
- Update 27 (19 Oct): speed (date formatters reused, show index, exhibition rows sized by CSS, mag.js observer once per frame: exhibitions 3.1s→0.4s on a slow phone), every visible text ≥16px (second floorText pass after mag.js draws), security (Content-Security-Policy meta in index.html — no inline scripts allowed, put settings in config.js; escaped image/link addresses; list.php 10-min cache + nosniff), index.html static copy refreshed in Arabic with `node _work/tools/snapshot.js` (run it after big header/footer/hero changes), page titles without focus box, no small labels above headings, club join = number + app icons.
- Told the owner (not done by us, needs hPanel): add to the top of public_html/.htaccess — no-cache for index.html and version.txt (the Hostinger CDN cached index.html for 7 days → "nothing changed"), and block xmlrpc.php; keep WordPress/plugins updated or disabled.

- Update 29 (19 Oct evening): blue only for web/e-mail addresses on light backgrounds (never in buttons/red boxes); header menu in two rows at 860–1179px; no intro splash, static copy hidden until the real page is drawn (no jump); shelf always moves; no "date to be announced" text and no EventsEye links; one title per section (no "see all" link); assistant finds products and modern industries; newsletter saves to `api/subscribe.php` (CSV in api/data, e-mail to info@); original Botim/imo/BiP logos in `assets/img/apps/` (cut from real pictures); new AAT Business Club seal (`clubMark()` in views.js); clear separators between all sections (line + red bar, alternating white bands).
- Update 30 (19 Oct): every inner page opens with a red brand banner (hooked-pair pattern `assets/img/brand/pair-pattern.svg`, big white swash pair `pair-white.svg`, white title + bar) starting behind the floating menu; fixed the dark "تواصل معنا" box that the white-band rule had turned white (bands now skip `.cta` and `.facts`).
- Update 31 (19 Oct): owner: "remove the symbol, not on the site now" — banner is plain red gradient (pattern + big swash removed, files deleted). Don't add the AAT symbol to the site until he asks.
- Update 32 (19 Oct): exhibition page hides the Organizer row when unknown (was "—").
- Promo video (19 Oct): Remotion project `_work/video/aat-promo` (25 s, 1080×1920, English, male voice = Piper "ryan-high" generated locally, music synthesized by `music.py` idea, real site screenshots in `public/`). Render: `npx remotion render AatPromo out/aat-services-25s.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` (Google Fonts can't load in the renderer here; fonts are local in public/fonts).
- Update 33 (19 Oct): new magazine PDF made from the flipbook (100 pages, matches exactly); page 6 mailing address = P.O. Box 568, Yonghe, New Taipei City 234964 (was an old P.O. Box 5, Yongqiao address); owner's email everywhere = marwan@aatworld.com (business card + vCard QR, 18 name-card designs, claude.ai design board).
- **Skill `aat-web`** (`.claude/skills/aat-web/SKILL.md`, also `_release/aat-web-skill.zip` for claude.ai): a GENERAL way of thinking for any website (owner asked it not be AAT-specific). AAT facts stay in this file. Load it on every web task.

## Open tasks (as of 15 Oct 2026)
1. Confirm the owner uploaded **update 15** (`version.txt`). Live site had been showing an old magazine (top bar, "See page 52", small footer) — evidence earlier updates weren't extracted correctly.
2. (done 19 Oct) UAE exhibitions re-checked: all months match EventsEye.
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
