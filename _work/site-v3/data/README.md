# AAT site v3 — content package (prototype)

Everything the builders of the new aatworld.com need, so nobody has to read the old code.

- `data/data.json` — ALL content (UTF-8, pretty JSON, 1.6 MB). Every text is real, taken from the live site's merged runtime objects (`window.AAT`, `AAT_I18N`, `AAT_MODERN`, …) read with Playwright on 21 Oct 2026 (site update 36), plus the flipbook table of contents (`issue560/index.html` → `window.TOC`), the "About us" text from `views.js`, and the members list from `https://aatworld.com/members/list.php`.
- `img/` — the SAMPLE of pictures for the prototype (159 files, 7.1 MB). Paths in data.json are relative to the site root (`img/logos/p3.png`).
- `data/tools/` — `dump.js` (reads the old site's runtime objects with Playwright), `build.js` (writes data.json + the ship list), `ship.py` (copies/downscales the sample); rerun them for the full-asset version.
- `data/verify.js` — `node _work/site-v3/data/verify.js` prints the counts, checks that every picture named in data.json exists, and that the sample stays under 180 files / 8 MB.

## Counts (data.json = live site, 21 Oct 2026)

| What | Count | Notes |
|---|---|---|
| companies (advertisers of issue 560) | 35 | 29 have a logo; 6 have none on the old site (pages 10, 21, 51, 59, 73, 77) |
| products | 127 | 114 have a picture on the old site; **53 pictures shipped** (first 2 per company) |
| modern products & industries | 40 in 6 groups | 18 pictures shipped (3 per group) |
| articles | 37 | 13 fresh Arabic-only (issue 560) + 24 older Arabic+English; 6 pictures shipped |
| news | 26 | 6 bilingual (5 languages), 13 Arabic-only, 7 English-only; 6 pictures shipped |
| shows (exhibitions) | 1,464 | 1,043 in 2027 + 421 in 2028; 999 "month only"; = the live site's "كل الدول 1464" |
| countries | 16 | all 16 flags shipped (Afghanistan and Yemen have 0 shows) |
| field groups | 18 | counts sum to 1,464 |
| club members | 2,831 | names only (no photos) |
| i18n | 252 keys × 5 languages | ar, en, zh-TW, zh-CN, ms |
| magazine TOC | 13 articles + 45 ad pages | from the flipbook drawer |

The task brief said "133 products, 1,460 shows": the live site today shows 114 pictured products (127 incl. those without a picture) and 1,464 shows (1,460 EventsEye + 4 hand-made Taiwan shows: TIMTOS, Taipei Cycle, Taipei AMPA, Secutech 2027). data.json matches the live site, checked by counting on the rendered pages.

## Prototype picture policy (owner: "full assets after approval")

Shipped (all under `img/`, same relative paths as the old `assets/img/`):

| Folder | What | Files |
|---|---|---|
| `img/logos/` | ALL company logos (PNG, kept as PNG) | 29 |
| `img/prod/` | first 2 product pictures of every company | 53 |
| `img/modern/` | 3 pictures per modern group (preferring the ones also used as home sector tiles) | 18 |
| `img/art/` | the 6 newest article pictures (ar26-1 … ar26-6) | 6 |
| `img/news1-3.jpg, arn1-2.jpg, enn1.jpg` | 6 news pictures: 3 bilingual, 2 Arabic-only, 1 English-only | 6 |
| `img/flags/` | 16 flags (svg/png as on the old site) | 16 |
| `img/apps/` | Botim, imo, BiP icons (the only app icons the old site has as files) | 3 |
| `img/magazine-560.jpg` | the cover (617×873) | 1 |
| `img/logo.png` | the AAT logo (413×138 PNG) | 1 |
| `img/brand/aat-logo-red.svg`, `aat-logo-white.svg` | the AAT script logo "Ideas For Business" (vector) | 2 |
| `img/mag560/p001-p012.jpg` | magazine pages 1–12 for the reader, 1100×1555, JPEG q72 | 12 |
| `img/mag560/t/p001-p012.jpg` | thumbnails 220×311, JPEG q70 | 12 |

Rules:
- **`img: null` / `image: null` means "exists on the old site, not shipped in the prototype"**. The item stays in the data. Show it WITHOUT a picture box (never a grey placeholder). `hasImage: true` on products/articles tells you a picture will come after approval.
- No image above 300 KB was shipped without downscaling (none needed it; biggest is 220 KB).
- `assets/img/mag/` (the old flipbook pictures) was NOT copied; the reader uses `img/mag560/`.
- Full assets later: copy the rest of `assets/img/{prod,modern,art}`, `news*.jpg`, `arn*.jpg`, `enn*.jpg`, and render pages 13–100 from `_work/tools/pdfpages/` the same way.

## Schema of data.json

Every bilingual text is `{ "ar": "...", "en": "..." }`; a missing translation is `null` (never invented). Some fields carry `zh-TW`, `zh-CN`, `ms` too.

### `meta`
`built` (date), `source`, `prototype: true`, `imageRule`.

### `config`
| field | meaning |
|---|---|
| `siteName {ar,en,zh}` | التجارة العربية الآسيوية / Arab Asian Trade / 中阿商業雜誌 |
| `groupName {ar,en}` | مجموعة التجارة العربية الآسيوية (owner's exact wording) |
| `tagline` | "Ideas For Business" (on the logo) |
| `owner` | Mohamad Marwan Fattal |
| `phone` | "+886 966 404681" display form; `whatsapp` "886966404681" digits; `tel` "+886966404681" |
| `email` info@aatworld.com, `editorEmail` marwan@aatworld.com, `clubEmail` aatclub@gmail.com |
| `address {en, ar, rule}` | **show `en` always**, even on the Arabic site (owner decision) |
| `apps[]` | `{name, action: "chat"|"copy", url, icon}`: WhatsApp and Viber open a chat (`url`), Botim/imo/BiP/LINE copy the number; `icon` is a shipped PNG or null (WhatsApp, Viber, LINE: use a vector icon of your own) |
| `logo {png, red, white, red_hex}` | logo files; red is fixed #D21F26 |
| `languages[]` | `{code, name, short, dir}` for ar, en, zh-TW, zh-CN, ms |
| `newsletter {title, lead, button, label, endpoint}` | texts + `api/subscribe.php` |
| `assistant {enabled, title, hello, placeholder}` | the 24-hour chat texts |
| `calendarNote {ar,en}` | shows disclaimer (currently not displayed on the site) |

Example: `"apps":[{"name":"WhatsApp","action":"chat","url":"https://wa.me/886966404681","icon":null}, …]`

### `magazine`
`number` 560 · `month {ar,en}` · `pages` 100 · `prototypePages` 12 · `since` 1982 · `years` 45 · `name {ar,en}` · `chinese` · `tagline {ar,en}` · `coverText {ar,en}` · `cover` "img/magazine-560.jpg" · `pdf` "https://aatworld.com/issue560/AAT-560-October-2026.pdf?v=36" · `pageImage` "img/mag560/pNNN.jpg" (NNN = 001…100; only 001–012 shipped) · `thumb` "img/mag560/t/pNNN.jpg" · `pageSize {w:1100,h:1555}` · `thumbSize {w:220,h:311}` ·
`toc.articles[]` `{page, title{ar,en}, articleId}` (13 rows; `articleId` links to `articles[].id`, `en` is null — the issue-560 articles are Arabic-only) ·
`toc.ads[]` `{page, companyId, company, nameAr, cat{ar,en}, city{ar,en}, web, email, tels[]}` (45 rows, one per ad page; `companyId` null for AudiFeL pages 88–91, which has no company record) ·
`companyPages[]` `{companyId, pages[]}` — which magazine pages belong to which company (the reader shows the company panel on those pages).

### `cats` — id → `{ar,en}` (13 categories: machinery, plastics, tools, auto, hardware, fitness, medical, food, event, instruments, services, consumer, chemicals)

### `companies[]` (35, sorted by first page)
| field | meaning |
|---|---|
| `id` = `page` | first magazine page (the old site's route `#company-<page>`) |
| `pages[]` | all pages of this advertiser in issue 560 (spreads: 18–19, 52–55, 97–98; Shammout 2 and 11) |
| `cat` | key into `cats` |
| `company` | name (English/Latin, as printed) · `nameAr` Arabic name from the flipbook TOC or null |
| `city {ar,en}`, `about {ar,en}` | short line about the company |
| `tel`, `tels[]`, `whatsapp`, `email`, `web`, `address`, `certs` | contact facts (null when unknown) |
| `logo` | "img/logos/pN.png" or null (6 companies have no logo file) |
| `tier` | cover / back / spread / premium (pages ≤10) / full — the ad position |
| `inMagazine` | true for every advertiser (all have a printed page) |
| `products[]` | `{k, n, d{ar,en,…}, img, url, src, hasImage}`: `n` name, `d` description (null if none), `img` shipped picture or null, `url` the maker's product page (web products), `src` "ad" (cut from the printed ad) or "web" (from the maker's website) |
| `site` | the company mini-site content from the old flipbook (English): `{colors{main,second,text}, headline, slogans[], sections[{name, kind: about|products|contact|solutions|other, summary, items[]}]}` or null |

Product route on the old site: `#product-<companyId>-<k>`.

### `modernGroups[]` — `{id, name{ar,en,zh-TW,zh-CN,ms}, count}` (6 groups: pack 13, plastic 7, health 6, food 5, metal 5, home 4)

### `modern[]` (40 "منتجات وصناعات حديثة", Arabic content)
`{id (index, old route #modern-<id>), group, name{ar,en}, web, image, sections[{heading, lines[]}], contact{emails[],urls[],phones[]}, body[], description{ar,en:null}}` — `body` is the original Arabic text (lines starting with "## " are headings); `sections` is the same text split at the headings; `contact` is picked from the text by pattern; `description.ar` is the first real paragraph. English exists only for the name.

### `homeSectors[]` (12 sector tiles of the old home page)
`{slug, title{ar,en}, desc{ar,en}, cats[], modernGroups[], image}` — pictures are borrowed modern pictures (CLAUDE.md notes they are poor matches); 10 shipped, 2 null.

### `articles[]` (37)
`{id, lang: "ar"|"both"|"en", fresh, title{ar,en}, summary{ar,en}, author, date: null, cat, img, hasImage, magPage, body{ar[],en[]}}` — `body` paragraphs in order, a paragraph starting with "## " is a sub-heading. `fresh: true` = this month's 13 Arabic articles (issue 560); `magPage` = their page in issue 560 (from the TOC). The 24 older articles (Arabic + English, from issue 559) have `magPage: null`. No article has a date on the old site. `lang` "both"/"en" articles have English text; the old Arabic site lists only ar/both, other languages list none (the old site's rule, not a must).

### `news[]` (26)
`{id, lang: "both"|"ar"|"en", title{ar,en}, date, source, img, hasImage, body{ar[],en[],zh-TW?,zh-CN?,ms?}}` — bilingual items have dates (5) and 5-language bodies; Arabic-only and English-only items have no date. The old site shows the visitor's own language's items first.

### `shows[]` (1,464 exhibitions, 1 Jan 2027 onward)
`{id, name, start, end, cc, city{en,ar}, venue{en,ar}, sector, field, approx}` ·
`approx: 1` = only the month is known (start/end = first/last day of the month; show "March 2027", never a day) ·
`cc` = key into `countries` · `city.ar` from the old site's Arabic city list (1,339 of 1,464 have it) · `venue.en` without the city; null when EventsEye has none (103 rows); 61 rows have no city ·
`sector` = EventsEye's English sector line · `field` = id into `fields` (the 18 groups used for filtering) ·
The 4 hand-made Taiwan shows also carry `summary{ar,en}`, `themes{ar,en}` and (Taipei Cycle) `web`. EventsEye URLs were dropped (owner: no EventsEye links).

### `countries` — cc → `{ar, en, flag, shows}` (16: tw id my pk af dz eg iq kw ye om qa sa sy ae tr)
### `fields[]` — `{id, ar, en, count}` sorted by count (18 groups, e.g. food-and-beverage 191)

### `club`
`title{ar,en}` "نادي رجال الأعمال (AATBC)" · `name{ar,en}` · `lead` · `goals{title,p1,p2}` · `benefitsTitle` · `benefits[8] {n,ar,en}` · `partners{title,text}` · `join{title,message,more,email,phone,whatsapp}` · `members{count: 2831, source, names[]}` · `turnkey{ar: {title, sub, intro[], incT, inc[] (string or [title, [sub…]]), groups[] ([groupName, [projects…]]), end, extra[]}, en: null, relatedArticles[]}` — turnkey projects (دراسات أولية لمشاريع صناعية) exist in Arabic only; the articles `turnkey-projects` and `industrial-project-studies` have English versions of the subject.

### `about`
`title`, `lead`, `paragraphs{ar[3], en[2]}` (the old WordPress "About Us" text word for word), `facts{years:45, since:1982, issues:560, labels{years, issues, since, published}}`, `claim` ("the only monthly Arabic–English trade advertising magazine…"), `first` (h82 headline), `heroLead`, `yearsWord`, `sinceWord`, `cover`, `tagline`.

### `advertise`
`kicker, title, lead, languagesLabel + languagesCount (5), message` (WhatsApp text), `positionsTitle, positionsKicker, exampleLabel`, `positions[6] {id, order, name{ar,en}, print{ar,en}, web{ar[],en[]}, exampleCompanyId}` (cover, back, spread, premium, full, half), `digital{title,text}`, `contactTitle, contactText`.

### `services[]`, `plans[]`, `faqs[]`
From AAT_DATA (bilingual). **`faqs` (6) are used by the assistant. `services` (5) and `plans` (3) are NOT displayed anywhere on the current site** (left from the first v2 draft; prices like "Annual fee on request" are unconfirmed by the owner) — use with care or not at all. The AAT_DATA `suppliers` list was dropped: it is sample data (`sample: true`).

### `i18n` — the full UI dictionary, 252 keys for `ar`, `en`, `zh-TW`, `zh-CN`, `ms` (menu, buttons, page titles, labels, privacy text `x_privacy` with "|" between paragraphs). Keys `yt`/YouTube and `dark mode` strings exist but the owner removed both features.
### `tx` — translation map for CONTENT strings into zh-TW, zh-CN, ms (English string → translation), used when an item has only en/ar.
### `tradeMap` — the dotted map of Africa–Arabia–Asia (`W`, `H`, `L0`, `B1`, `k`, path data `a` land dots, `f`/`s`/`o` highlight sets) from the old home page.

## GAPS (what could not be captured or is missing)

1. English is missing for: the 13 fresh articles (title, summary, body), the 13 Arabic-only news items, all `modern[]` bodies (names have English), turnkey projects, Arabic names of 16 companies (`nameAr` exists for 19, from the TOC). Arabic is missing for: the 7 English-only news items; 125 show cities and all EventsEye venues; show names (English only, as on the live site).
2. No dates for articles and for 21 of 26 news items (the old site has none).
3. Magazine: only pages 1–12 are shipped; pages 13–100 come after approval from `_work/tools/pdfpages/p013…p100.jpg`. The TOC has 13 article pages and 45 ad pages; pages 95–96 (printed exhibitions list) still show Nov 2026 in print.
4. AudiFeL (pages 88–91) advertises in the issue but has no company record, logo or products on the old site (only an older article `audifel-custom-hearing-aids`).
5. 6 advertisers have no logo file (HIWIN, JARRER, Young Shang, Feng Tien, SIBEX, HoneyB2B) and 7 have no products (ArabPlast, HIWIN, JARRER, Young Shang, Feng Tien, PALMEX, SIBEX — 3 of them are trade-show ads).
6. Company mini-site `site` content is English only and absent for 4 companies (pages 21, 24, 37, 77).
7. 61 shows have no city and 103 no venue on EventsEye; 999 shows are "month only".
8. The old "About us" English text says "Business Men's Club"; the owner's wording rule is "AAT Business Club" / "نادي رجال الأعمال" — prefer the rule when building UI, keep the paragraph text as it is.
9. Home partner logos ("Brands you can trust": pakarpertanian, Watertech, SIMEM, IMLAB, AIPS, Al-Meswak, NS Expo, Transport Events…) load from aatworld.com/wp-content and are not in the repo; not included.
10. CEO name/phone/email unconfirmed (CLAUDE.md). YouTube link exists in old data but the owner removed YouTube.
11. The 375 shows dated before 2027 (Oct–Dec 2026 and the 2026 Taiwan shows with rich details) are not included: the site shows 2027 onward only.
12. Members list: names only (photos exist on the server as `members/photos/...` but were not stored, per the brief).
