# The Trade Gazette — concept brief (slug: `gazette`)

A 45-year trade paper that moved online. The home page is the front page of a publication (masthead, issue line, columns, rules, big figures), not a landing page. Everything the reader sees carries the weight of "printed in Taiwan since 1982, issue 560".

Files: `tile-ar.html`, `tile-en.html` (built by `build_tile.js` from `../../data/data.json`, every text real), screenshots `tile-ar-1920.png`, `tile-en-1920.png`, `tile-ar-390.png`, `tile-ar-full.png`, comparison `ref-vs-new.png`, current-site references `ref-*.png`.

---

## 1. Difference statement (today → the gazette)

1. **Navigation.** Today: a floating white pill bar (logo at the end, 8 links, "English" pill, globe) hovering over a card shelf. → New: a newspaper masthead: the issue line in the "ears" (العدد 560 · أكتوبر 2026 / السنة 45 · تصدر في تايوان منذ 1982), the full red AAT logo centred, the tri-lingual red name strip under it (copied from the printed cover), then a bold black **section bar** between a thick and a thin rule. The bar is always fully visible (it wraps into rows on narrow screens, no hamburger) and sticks to the top when scrolling.
2. **Home page.** Today: a landing page (shelf → red gradient "45 عاماً" banner with a tilted cover → dotted trade map → logo strip → photo tiles → cards). → New: a **front page** in three ruled columns: "في هذا العدد" (cover, this-issue text, table of contents with dotted leaders and page numbers), "معارض دولية" (dated rows of the next shows + counts by country), "نادي رجال الأعمال" (seal, 2,831, first benefits, join). Then a figures strip and the advertisers' classifieds grid.
3. **Grouping of content.** Today: one page per media type, each with its own red banner (magazine, flipbook, articles, news, products, modern industries, exhibitions, club, advertise, about, contact). → New: three bodies: **the issue** (reader, contents, articles, advertisers, products of the issue, ad positions), **the directories** (calendar of fairs; products directory incl. "منتجات وصناعات حديثة"), **the club**; plus news, about, contact. Every company, product and article carries its page folio "ص. 18" — the site and the printed magazine are one thing.
4. **Layout language.** Today: rounded cards with shadows, dark gradient cards, pill chips, red gradient banners, alternating beige bands. → New: **square corners, no shadows, no gradients**. Structure is made of rules: a 3px ink rule + red square opens every section, hairlines separate rows and columns, logos sit in a hairline classifieds grid, the only framed box is the company card.
5. **Typography.** Today: one Arabic sans (Al-Jazeera/Rubik-like) at every size, white on red. → New: a **typographic identity**: Noto Naskh Arabic headlines (the Naskh of Arabic newspapers), Noto Kufi Arabic for the section bar/buttons/labels, Newsreader (a news serif) for English headlines, text and all big figures, Libre Franklin (the Franklin Gothic of newspapers) for English UI and for every Latin name inside Arabic pages.
6. **Colour.** Today: red is the background (gradient banners, red newsletter, dark contact box, beige bands, gradient cards). → New: **two-colour print: black ink on white paper**, red only as ink accents (logo, name strip, red squares, folios, primary buttons, active underline, the chat tab, the rule above the footer). One grey newsprint band (contact) and one black colophon (footer). Blue only for web/e-mail addresses on light backgrounds.
7. **Numbers.** Today: "45" as a giant decorative numeral on red. → New: figures are **editorial facts in the serif**: the figures strip 1982 · 560 · 45 · 1,464 · 2,831 · 5 with hairlines, the club's 2,831 as a headline number, tabular day ranges in the show rows.
8. **Pictures.** Today: AI-ish sector photos in gradient tiles, products on gradient cards, a tilted cover. → New: **documentary pictures**: the cover flat in a hairline frame, products on white in hairline boxes, real logos on white in a grid, article photos above the headline. Anything without a picture is a text row — no empty boxes, no placeholders.
9. **The moving shelf.** Today: tall gradient cards mixing products and articles. → New: the **ticker**: a continuous band of products between rules with the product name, the company logo and the page folio, titled "منتجات العدد 560" in a fixed cell; pauses on hover/touch. Still first under the menu, still moving ~42 px/s.
10. **Exhibitions.** Today: big flag cards to pick a country, then rows. → New: a **calendar of fairs**: month header bars with counts, a table (date | show | city with flag | venue | field), a rule-framed filter strip (country, field, month, search). Month-only shows print the month name in the date column, never a day.
11. **Magazine reader.** Today: a beige flipbook with floating white pill buttons. → New: a **reading room**: a grey desk, pages fitted to the window height, two pages side by side on PC, a top rule bar with the issue line, page x/100, contents, PDF, full screen; tapping an ad page opens the company card beside the page.
12. **Feel.** Today: "a modern app with a red theme". → New: "a serious trade paper printed since 1982 that now opens in the browser". The owner sees it in three seconds: centred masthead, red name strip, black section bar, ruled columns.

---

## 2. Identity

- **Logo.** The full red script logo (`img/brand/aat-logo-red.svg`) is the masthead, centred, 340 px wide on PC, 230 px on phones; never recoloured, cropped or rotated. Footer: the white logo on the black colophon at 220 px. Favicon: the red "AAT" letters of the logo on white. The reader's top bar uses the red logo at 90 px.
- **Tagline.** "Ideas For Business" lives inside the logo and is not repeated as text.
- **The tri-lingual name strip.** White Kufi/Franklin/Noto Sans TC on `aat-red`: التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌 — the red band of the printed cover. With the logo above it, this is unmistakably AAT.
- **Motifs from AAT's own world (print and trade):**
  1. *Rules*: the thick + thin double rule of the section bar, the 3px rule + red square that opens every section, hairline column rules, dotted leaders in the table of contents.
  2. *Page folios*: "ص. 18" / "p. 18" in red Kufi/Franklin on every advertiser, product, article and in the ticker — the reader is always told where it is printed.
  3. *The issue line as a dateline*: issue number, month, year of publication, "since 1982" in the masthead ears and at every section note.
  4. *The postmark seal* for the club: a double red ring, "AAT BUSINESS CLUB • SINCE 1982 • TAIWAN" on the ring, the logo and نادي رجال الأعمال inside — a stamp, the trader's mark of trust.
- No swoosh, no pattern, no gradient. Nothing is decorative that is not also information.

---

## 3. Colour tokens (light theme only)

| Token | Hex | Role |
|---|---|---|
| `paper` | `#FFFFFF` | page background, cards, ticker, table rows, buttons (secondary) |
| `newsprint` | `#F1EFEA` | the contact band, hover state of grid cells, zebra rows in long tables |
| `ink` | `#141414` | all primary text, thick rules, month header bars, the colophon footer background |
| `ink-2` | `#4A4A4A` | secondary text: dates, cities, section notes, labels (never under 16px) |
| `hairline` | `#C9C5BD` | decorative rules and frames only — never text |
| `aat-red` | `#D21F26` | the logo, the name strip, red squares, folios, primary buttons, active nav underline, the chat tab, the 6px rule above the footer |
| `red-deep` | `#8E1116` | hover/pressed red; hover colour of headlines |
| `link-blue` | `#0B4F9C` | web and e-mail addresses on `paper`/`newsprint` only; never inside buttons, never on red or black |

Contrast (computed, WCAG): ink/paper **18.4**; ink/newsprint **16.0**; ink-2/paper **8.9**; ink-2/newsprint **7.7**; white/aat-red **5.3**; white/red-deep **9.4**; aat-red text/paper **5.3**; aat-red text/newsprint **4.6**; link-blue/paper **8.0**; link-blue/newsprint **7.0**; white/ink (footer) **18.4**; `#E6E3DD`/ink (footer secondary) **14.9**. Every text pair is ≥ 4.5:1; the `hairline` never carries text.

Where red is **not** used: section backgrounds, cards, tables, the reader's desk, the footer body, the newsletter box, filters. A page is ~85 % paper, ~12 % ink, ~3 % red — the red counts because it is rare.

---

## 4. Typography

**Arabic**
- *Noto Naskh Arabic* 400 / 600 / 700 — headlines, paragraphs, lists, table of contents, article text. The Naskh of printed Arabic newspapers: the reader has read it all his life; large counters and a tall body make it clear at 19–20 px for weak eyesight.
- *Noto Kufi Arabic* 600 / 700 / 800 — the section bar, buttons, filters, dates, labels, folios, figure labels, the name strip. Geometric and bold: a section flag must be recognised at a glance, and Arabic papers set their section heads in Kufi.

**Latin**
- *Newsreader* (variable, optical size 6–72) 400–800 — English headlines, body, and **all big figures** in both languages (1982, 560, 2,831): serif numerals read as facts from a dateline.
- *Libre Franklin* 500–800 — English UI (section bar, buttons, labels) and **every Latin name inside Arabic pages**: company, product, show, venue, phone number, web address, the Taiwan address. Franklin Gothic is the sans of newspapers.
- Chinese slots (strip, zh versions): Noto Sans TC/SC.

**Scale — LARGE MODE (PC / phone)**

| Role | Arabic | English |
|---|---|---|
| H1 page title / lead headline | 56 / 36, Naskh 700, lh 1.3 | 60 / 36, Newsreader 700, lh 1.15 |
| H2 section title | 36 / 28, Naskh 700, lh 1.3 (+ 18px red square) | 38 / 28, Newsreader 700 |
| H3 column title, card name | 26 / 22 | 27 / 22 |
| Lead article headline | 34 / 26 | 34 / 26 |
| Body paragraphs | **20 / 19**, lh **1.85** | **19 / 18**, lh 1.6 |
| Lists, TOC rows, benefits | 18, lh 1.5–1.6 | 18 |
| Section bar | 20 / 18, Kufi 700 | 20 / 18, Franklin 700 |
| Buttons | 20, Kufi 700, min height 54 px | 20, Franklin 700, 54 px |
| Show row date | 22 (day range, Kufi 800) + 16 (month-year) | same, Franklin |
| Notes, labels, folios, captions | **16–17** (floor 16 px, audited) | 16–17 |
| Figures strip | Newsreader 700, 64 / 48 | same |
| Club number, phone number | 64 / 52; phone Franklin 800 44 / 32 | same |

Arabic line-heights: 1.85 body, 1.6 lists, 1.3–1.4 headlines (Naskh needs air above and below). Latin paragraphs 1.6.

**Numerals.** Western digits everywhere (as in the current site and the printed magazine), `font-variant-numeric: tabular-nums`, thousands separators (1,464), dates "11–13 يناير 2027" with an en dash. Digits and Latin inside Arabic text are isolated (`<bdi dir="ltr">`) so "11–13" and "+886 966 404681" never flip.

---

## 5. Layout language

- **Grid.** 12 columns, max width 1480 px, 24 px gutters (16 px on phones). The front page is 5 / 4 / 3 columns with 1 px hairline column rules and 28 px column padding. ≤ 1180 px: the lead column spans the width, the two others sit under it; ≤ 760 px: one column.
- **Rhythm.** 44 px between sections on PC (28–36 on phones); rows 12 px with hairlines; columns 28 px; no section backgrounds except the newsprint contact band and the black colophon.
- **Section title (the one title, no kicker).** A 3 px ink rule across the section, then the title (Naskh/Newsreader 700, 36 px) with an 18 px red square before it, and optionally a 17 px grey note at the end of the same line (count, issue line). Column titles use the same treatment at 26 px. No "see all" links beside titles; a section's single action is a button or an underlined "more" line at its foot.
- **Cards.** Used for one thing only: the **company card** (reader side panel and company page): 1 px ink frame, header row with a 3 px rule (page folio + category), logo, name, city, about, two product boxes, two buttons, web address in link-blue. Everything else is rows and grids.
- **Buttons.** Rectangular. Primary: solid `aat-red`, white text; secondary: 2 px ink border on paper. 54 px tall, 20 px bold. Hover: red-deep / newsprint fill. Full-width in columns and on phones.
- **Filters/chips.** Rectangular tabs inside a rule-framed strip; selected = solid ink with white text; counts in the label ("الإمارات 216"); no pills, no rounded corners.
- **Show rows.** Grid 118 px | 1fr: date cell (day range 22 px Kufi 800 over month-year 16 px grey), name (Franklin 700, 19 px), city with a 28×19 flag + venue (Franklin 17 px grey); hairline between rows. On the exhibitions page the same row gains a field tag and sits under month header bars.
- **Images.** Hairline frames, square corners; products `object-fit: contain` on white, photos `cover` at 2:1; no tilt, no overlay, no mask. No picture → no box: the item becomes a text row.
- **Logo cells.** Classifieds grid (`minmax(228px, 1fr)`), hairline borders, logo max 60 px high at the start side, company name 17 px Kufi 700 (Arabic name where the TOC has one), city 16 px grey, red folio at the end.
- **Ticker.** 360 px items: 96 px product picture in a hairline box, product name (Franklin 700 18 px, 2 lines), company logo 22 px + company name 16 px, folio; title cell fixed at the start with a 3 px rule; the band sits between the section bar and the front page.

---

## 6. Site structure

**Site map (hash routes)**

| Route | Page | Content and purpose |
|---|---|---|
| `#home` | Front page | see below |
| `#magazine` | The issue | cover + "اقرأ العدد 560" + PDF; contents (13 articles + 45 ad pages with page numbers); advertisers of the issue (36, logos); **ad positions ("أعلن معنا")** — moved here from today's separate advertise page, because it is about the printed magazine |
| `#reader`, `#reader-18` | Reading room | full-screen reader (opens at page 18) |
| `#company-18` | Company page | the company card in full: about, all products, contact, its magazine pages, mini-site content |
| `#exhibitions`, `#exhibitions-ae` | Calendar of fairs | 1,464 shows; the country route preselects the filter; a row expands in place (no separate show page) |
| `#products`, `#product-4-0`, `#modern-7` | Products directory | part 1: advertisers' products by field (13 categories, 127 products, each with company + folio); part 2: **منتجات وصناعات حديثة** (40 items in 6 groups) |
| `#club` | نادي رجال الأعمال | goals, 8 benefits, members register (2,831 names), turnkey studies, join |
| `#articles`, `#article-ar26-1` | Articles | 13 of the issue + 24 older |
| `#news`, `#news-n0` | News | 26 items, the visitor's language first |
| `#about` | من نحن | the WordPress text word for word, the figures, founder, the claim |
| `#contact` | تواصل معنا | phone + apps, e-mail, English address, newsletter |

Merged compared with today: advertise → inside the magazine page; modern industries → part 2 of the products directory; magazine / flipbook / company mini-sites → one "issue" area. Dropped: the flag-card country chooser (countries are a filter and a route), the dotted trade map, the sector photo tiles (poor pictures; the figures strip and the advertisers grid carry the message instead).

**Home — the front page, in order**

| # | Section | Source | Why here |
|---|---|---|---|
| 1 | Masthead: ears (issue line / language + globe / phone), logo, tri-lingual strip, section bar | `config`, `magazine` | Identity first; the dateline says "issue 560, year 45, since 1982" before anything else |
| 2 | Ticker "منتجات العدد 560" | `companies[].products` with pictures (29 in the prototype) | The owner's moving shelf, first under the menu |
| 3a | Column "في هذا العدد": cover, cover text, the claim, buttons, contents with page numbers | `magazine`, `about.claim`, `magazine.toc.articles` | The magazine is the product |
| 3b | Column "معارض دولية": the next 8 dated shows from January 2027, button "كل المعارض: 1,464 معرضاً في 16 دولة", counts by country | `shows`, `countries` | The most used data on the site |
| 3c | Column "نادي رجال الأعمال": seal, 2,831, lead, benefits 1–3, join | `club` | The business offer |
| 4 | Figures strip 1982 · 560 · 45 · 1,464 · 2,831 · 5 | `about.facts`, `shows`, `club.members`, `config.languages` | The credibility line |
| 5 | "معلنو العدد 560": 29 logos with city and page (the 6 companies without a logo are listed by name) | `companies` | Real logos — the heart of an advertising paper |
| 6 | "مقالات العدد": lead article with picture + 10 headlines with author and page | `articles` (fresh) | The editorial voice |
| 7 | "الأخبار": 3 dated news with pictures + headline list | `news` | Freshness |
| 8 | "منتجات وصناعات حديثة": 6 groups with counts and 3 pictures each | `modernGroups`, `modern` | The owner's modern-industries section (not in the tile) |
| 9 | Contact band (newsprint): lead, phone, apps, e-mail, English address, newsletter | `config` | Every visit ends with a way to call |
| 10 | Colophon footer (black): white logo, tri-lingual names, publisher line, claim, sections, contact, © 2026 مجموعة التجارة العربية الآسيوية | `config`, `about` | The imprint |

**Header / nav behaviour.** PC: ears → logo → strip → section bar; on scroll the masthead leaves and the section bar sticks at the top with the active section underlined in red; between 860 and 1180 px the bar wraps into two rows (never hidden). Phone: row 1 = phone number + language + globe, row 2 = issue line, logo 230 px, strip, the section bar wraps into 3–4 rows of 18 px bold items (always visible, no hamburger); after 400 px of scrolling a compact sticky bar (logo 90 px + "الأقسام" button that opens the full list in 22 px rows) takes over.

**Footer.** As row 10 above; e-mail is white underlined on the black footer (blue is for light backgrounds only); the address is English LTR.

---

## 7. Key screens

- **Exhibitions (1,464 shows).** Title + note "1,464 معرضاً · 16 دولة · من يناير 2027". A rule-framed filter strip: country tabs (flag + name + count, "كل الدول"), field select (18 groups with counts), month tabs (يناير 2027 … يوليو 2028), a search box (show name / city). Below, the calendar table grouped by month: a month header bar (ink, white text: "مارس 2027 · 46 معرضاً"), rows date | show (Franklin 700) | city with flag | venue | field tag (rectangular, grey). Month-only rows print the month in the date column and close the month. Rows are rendered per month on demand (never 1,464 DOM rows at once); a row expands in place with its details. Phone: rows stack (date on top), the filter strip becomes a sticky "تصفية" button opening a full-screen panel.
- **Products directory.** PC: a side index of the 13 fields with counts and the 6 modern groups; main: one band per field with the section title + count, products in a hairline grid (`minmax(240px,1fr)`): picture on white (if shipped), name (Franklin 700 18 px), company (16 px) + folio; without a picture the cell is a text row. Search above the index. Part 2, "منتجات وصناعات حديثة": six group sections, each item a row with its Arabic/English name, first paragraph and picture when it exists.
- **Magazine reader.** Full screen on a `newsprint` desk. Top bar 60 px: logo 90 px, "العدد 560 · أكتوبر 2026", "4 / 100", buttons المحتويات · PDF · ملء الشاشة · إغلاق (18 px bold). Page height = window height − 60 − 70; two pages side by side when 2 × (h × 1100 / 1555) fits the width, else one; RTL order (right page first); 56 px arrows at the sides; a 70 px thumbnail strip at the bottom; keyboard and swipe turn pages. **Tapping an ad page opens the company card as a side panel (PC) or bottom sheet (phone) — never navigates.** Contents opens a list of articles and advertisers with page numbers.
- **Business Club.** Title; seal + 2,831 + lead; "أهداف نادي رجال الأعمال" (two paragraphs); "مزايا الأعضاء" 1–8 as a numbered list with 30 px red serif numerals; "سجل الأعضاء": a search box and 2,831 names in four newspaper columns (one on phones); "دراسات أولية لمشاريع صناعية" as rule-separated groups; join block with phone, apps and e-mail.
- **Contact.** The newsprint band of the tile: lead line, phone 44 px, apps row (real icons for Botim, imo, BiP; WhatsApp, Viber and LINE as labelled buttons until official icons are supplied), e-mail in link-blue, the address in English LTR, newsletter box with a 54 px input and red button.
- **Assistant.** A red tab fixed at the bottom-start corner, "اسأل AAT · محادثة 24 ساعة". It opens a 420 px panel (full screen on phones) with a 3 px-rule header "مساعد AAT", messages in Naskh 19 px, answers built from the same components (show rows, company cells, article headlines), a 54 px input and an "أرسل" button. Nothing in it is smaller than 16 px.

---

## 8. RTL and languages

- `html dir="rtl"` for Arabic. All CSS uses logical properties (`margin-inline-start`, `border-inline-start`, `inset-inline-start`), so columns, rules, the ticker direction and the chat tab mirror themselves; the English version is `dir="ltr"` with the same markup.
- Latin runs inside Arabic — company, product, show and venue names, the phone number, web and e-mail addresses — are wrapped in `<bdi dir="ltr">`/`.lt` and set in Libre Franklin, so their word order never flips; day ranges and years are isolated the same way.
- The Taiwan address is always English, LTR, aligned to the paragraph side (right edge in Arabic).
- Arrows (reader, ticker, "more" lines) are CSS glyphs flipped by `[dir=rtl]`; ticks and numbers keep their shape.
- English: Newsreader headlines and text, Franklin UI, the strip reads "Arab Asian Trade · التجارة العربية الآسيوية · 中阿商業雜誌". zh-TW / zh-CN / Malay use the same slots (Noto Sans TC/SC for Chinese; Latin faces for Malay).

---

## 9. Motion

Moves: the product ticker (continuous, ~42 px/s, pauses on hover and touch, resumes); page turns in the reader (a 300 ms slide); the section bar becoming sticky. Never moves: headlines, columns, grids, backgrounds — no reveal-on-scroll, no parallax, no splash, no counting numbers, no hover lifts, no layout jump after first paint. The front page is as still as paper.

---

## 10. Why the owner will love it

1. **LARGE MODE** — nothing under 16 px (audited in the tile: minimum 16 px), body 20 px Naskh, section bar 20 px bold Kufi, 54 px buttons, 64 px figures, a 44 px phone number.
2. **"VERY DIFFERENT, I want to see the restructure"** — a centred masthead, red name strip, black section bar and three ruled columns replace the floating pill menu, gradient banner and cards; the difference is visible before the first scroll (`ref-vs-new.png`).
3. **"Sections must be visibly separated" / "Just one of them!"** — every section opens with a 3 px rule, a red square and one title; hairlines between rows; no kicker labels, no duplicate "see all" links.
4. **"Why is it not moving any more?"** — the product shelf is still the first thing under the menu, now the ticker with real products, logos and page numbers; the magazine still opens full screen with pages fitted to the height.
5. **"Use original logos, not recreated"** — 29 real logos in a classifieds grid, the real cover, real product pictures on white; items without a picture become text rows, never placeholders.
