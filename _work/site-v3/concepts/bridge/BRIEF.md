# Concept "Asia ↔ Arabia" (slug: bridge) — design brief

AAT is the bridge between Asia's factories and the buyers of the Arab world and Africa. The new site is built as that bridge: it is organised by **markets and routes** (country → shows, suppliers, products), it speaks **Arabic and Latin in one typographic voice**, it uses a **deep-sea second colour** beside the fixed AAT red, and it is **photographic and human** (real factories, real logos, real flags). Everything that is content stays (magazine, 127 products from 28 companies, 40 modern industries, 1,464 shows, the club, articles, news, contact facts); everything that is structure, layout, type and colour is new.

Files: `tile-ar.html`, `tile-en.html` (style tiles built from `_work/site-v3/data/data.json` by `make_tile.py`; every number in them is counted from the data), screenshots `tile-ar-1920.png`, `tile-en-1920.png`, `tile-ar-390.png`, `tile-ar-390-full.png`, `tile-ar-full.png`, `tile-ar-1366.png`, `ref-vs-new.png`; current site references `ref-*.png`. Checked 22 Oct: 0 page errors, 0 failed requests, 0 text elements under 16px and no horizontal scroll at 1920, 1366 and 390; Changa, Readex Pro and Noto Sans TC load (no fallback fonts).

---

## 1. Difference statement (today → new)

The owner must see the difference in 3 seconds. He opens the home page and sees a deep-sea masthead with a trilingual nameplate, a bilingual headline beside a factory photograph, and a line of 16 flags with show counts. Nothing of the red gradient, the "45", the tilted cover or the floating white pill remains.

1. **Navigation** — today: one floating white pill with 8 flat pages (المجلة، المقالات، الأخبار، معارض دولية، منتجات وصناعات حديثة، نادي رجال الأعمال، من نحن، تواصل معنا) → new: a **two-deck masthead**: a deep-sea strip (nameplate in 3 languages, issue, phone, language switch, globe) and a white deck with the logo and **7 tabs**, the first one being **الأسواق / Markets**. The site is entered by market, not by content type.
2. **Home opening** — today: red gradient, "45 عاماً", the issue label and a tilted magazine cover → new: a **route board** on deep sea: a bilingual headline ("من مصانع آسيا إلى أسواق العرب وأفريقيا" + "From Asia's factories to Arab and African markets"), a real photograph from the modern-industries pages (a worker at a sanitary mixer, Malaysia), the owner's own one-line claim ("the only monthly Arabic–English trade advertising magazine of its kind, published in Taiwan since 1982"), two buttons, and the **trade line**: 16 flags on one line from Taiwan to Algeria, each with its number of shows.
3. **How content is grouped** — today: by type (magazine / articles / news / shows / products) → new: by **market and route**. Every one of the 16 countries gets a hub page (`#market-tw` …) that gathers its shows from January 2027, the suppliers from there, their products, and the articles and news about it. Suppliers on every page are grouped **by origin country** ("من تايوان · 20 شركة", "من سورية · 5 شركات").
4. **Shows** — today: flag cards → chips → white cards → new: one **date-stamp row** used everywhere (home, exhibitions, market pages, assistant answers): a stamped date box (days big, month under), flag + country + city, name + field chip, a details button. 1,464 rows read like a departures board.
5. **Layout language** — today: rounded cards with coloured gradients, pill chips, shadows, a bouncing red chat pill → new: **flat paper and sea bands**, 6px radii, 1–3px rules, square bordered flags, square logo cards, no shadows except the fixed assistant tab.
6. **Section titles** — today: every page opens with a red gradient banner and each section title carries a red bar under it → new: one Changa title sitting on a **route line** (red dot — title — line — count or "all" link at the far end), sections alternating white and sea-pale bands. No page banners in red; page openings are sea.
7. **Typography** — today: Al-Jazeera Arabic (rounded, bold) with an Inter-like Latin, two voices → new: **Changa** for display and **Readex Pro** for text; each family carries Arabic and Latin, so Arabic and English pages have one voice. Readex Pro is the Arabic + Latin extension of Lexend, a family drawn for reading ease (wide spacing, open shapes, large x-height) — right for the owner's older readers.
8. **Colour** — today: red gradients on every page opening, warm off-white (#F7F1EF) bands → new: red is kept for the logo, primary buttons, the active tab and the route dots only; structure (masthead, openings, footer, stamps) is **deep sea #0B3C49**, bands are **sea-pale #E3EFF1**, blue appears only on e-mail/web addresses on white.
9. **Articles and news** — today: two pages and two home sections → new: one page and one home section, **مقالات وأخبار**, Arabic articles first, then news.
10. **About and advertise** — today: in the main menu → new: out of the menu, into the footer and the contact page. The 7 menu items are all about trade.
11. **Phone header** — today: pill with a globe and a hamburger → new: the sea strip (Arabic nameplate, English, globe) + logo + a red **القائمة** button that opens a full-screen sea sheet with the 7 items at 24px, the languages and the phone number.
12. **Feel** — today: consumer app (pills, gradients, badges) → new: a **trade publication and port office**: nameplate in three languages, date stamps, flags, real logos, photographs of real factories, large bold type.

---

## 2. Identity

- **The mark** is the full red AAT script logo ("AAT · Ideas For Business"). Header: red logo on the white deck at the start side, 60px tall on PC, 46px on phone. Footer: the white logo on sea, 64px tall. Favicon and app icon: a red square (#D21F26) with the white AAT wordmark centred (the logo file without the tagline, which is illegible at 32px). The tagline is never typeset separately; it lives inside the logo files only.
- **The nameplate**: the magazine's own three-language masthead line as printed on every cover — **التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌** — is the top strip of every page and the first line of the footer. It says "we are a magazine, since 1982, in three languages" without a word of marketing.
- **Motif 1 — the trade line.** A line with flags as stops, from Taiwan (start side) to Algeria (end side), through Indonesia, Malaysia, Pakistan, Afghanistan, Oman, UAE, Qatar, Kuwait, Saudi Arabia, Yemen, Iraq, Syria, Türkiye, Egypt. It is the home opening, the country filter of the exhibitions page, the market index in the footer, and the order of every country list. It is not decoration: every stop is a link with a real count.
- **Motif 2 — the date stamp.** Show dates are set in a stamped box (days in Changa 32px, month under in 17px) with a 2px sea border, like a customs or post stamp. The issue label ("العدد 560 · أكتوبر 2026") and the magazine's archive use the same stamp.
- **Motif 3 — the flag plate.** Flags are always rectangular, 3:2, with a 1px line border (46×31 on the trade line, 48×32 in rows, 28×19 in chips, 26×18 in product tiles). Never round, never emoji.
- What makes it unmistakably AAT: the red script logo on white, the trilingual nameplate, and the sixteen flags of AAT's own markets. No swoosh, no symbol, no pattern (removed by the owner on 19 Oct).
- Photographs: only real pictures from the data (factories, products, modern industries, article pictures). Framed with a 4px white border on sea, no filters, no overlays, a white caption bar under the picture with what it shows (e.g. "خلاط صحي · ماليزيا").

---

## 3. Colour tokens (light theme only)

| Token | Hex | Role |
|---|---|---|
| `paper` | #FFFFFF | Page background, cards, tiles, the white deck of the header, the inside of stamps |
| `ink` | #14202A | All body text, titles, nav tabs, card names |
| `ink-muted` | #4A5A63 | Secondary text: cities, field names in tiles, chip counts, captions (never below 17px) |
| `sea` | #0B3C49 | The structure colour: top strip, page openings, footer, stamp borders and day numbers, filled "sea" buttons, chip "on" state, the assistant tab, section counts |
| `sea-pale` | #E3EFF1 | Alternating section bands, field chips, hover tint of rows |
| `line` | #C9DADE | Rules, card and flag borders, the route line of section titles (decorative, not text) |
| `aat-red` | #D21F26 | The logo's red. Used for: primary buttons (white text), the active tab (text + 4px underline), the red dot of every section title and of the route caption, the phone menu button. Hover/pressed = #A5161C (red darkened 20%, not a separate token). |
| `link` | #0B57D0 | Only e-mail and web addresses, only on `paper` / `sea-pale`. Never in buttons, never on sea or red. |

Where red is **not** used: page backgrounds, bands, text on sea or sea-pale, borders, gradients. There are no gradients anywhere.

Contrast (WCAG, computed):

| Text | Background | Ratio | Use |
|---|---|---|---|
| ink | paper | 16.5 : 1 | body, titles |
| ink | sea-pale | 14.1 : 1 | body on bands |
| ink-muted | paper | 7.2 : 1 | secondary text |
| ink-muted | sea-pale | 6.1 : 1 | secondary text on bands |
| sea | paper | 12.0 : 1 | stamp numbers, counts, outline buttons |
| sea | sea-pale | 10.2 : 1 | field chips |
| white | sea | 12.0 : 1 | strip, opening, footer, sea buttons |
| white | aat-red | 5.3 : 1 | red buttons, phone menu button |
| aat-red | paper | 5.3 : 1 | active tab text |
| aat-red | sea-pale | 4.5 : 1 | allowed only at ≥ 24px bold (large text ≥ 3:1); normal red text never on bands |
| link | paper | 6.4 : 1 | addresses |
| link | sea-pale | 5.4 : 1 | addresses on bands |
| aat-red | sea | 2.3 : 1 | **never used for text**; a red button on sea is a filled block with white text (5.3:1) |

All text pairs in use are ≥ 4.5:1.

---

## 4. Typography

- **Arabic and Latin display: Changa** (Google Fonts), weights 700 and 800. A strong, slightly condensed face with matched Arabic and Latin; the bilingual headline of the opening and every section title are set in it, so an Arabic title and its English twin have the same weight, height and rhythm.
- **Arabic and Latin text/UI: Readex Pro** (Google Fonts), weights 400, 500, 600, 700. Built on Lexend, which was drawn for reading ease: open counters, generous x-height, wide default spacing, Arabic and Latin drawn together. Used for body, navigation, buttons, chips, rows, cards, footer.
- Chinese (中阿商業雜誌 in the nameplate, and the zh-TW/zh-CN versions): Noto Sans TC / Noto Sans SC (Google Fonts, 500) with Changa/Readex Pro for digits and Latin. Malay: Readex Pro.
- Why not the earlier kit (Fraunces + Source Sans 3 + IBM Plex Sans Arabic): three families = three voices and a 12px "eyebrow" style. The new voice is two families that each hold both scripts, and no eyebrows at all.

**Type scale (LARGE MODE)**

| Role | PC (≥ 1500px) | Phone (≤ 640px) | Family / weight | Line-height AR / EN |
|---|---|---|---|---|
| H1 opening | 56px | 36px | Changa 800 | 1.3 / 1.12 |
| Bilingual twin line under H1 | 30px | 22px | Changa 600 | 1.4 / 1.3 |
| H2 section title | 38px | 28px | Changa 700 | 1.3 / 1.2 |
| H3 origin / group heading | 22px | 20px | Readex Pro 600 | 1.4 |
| Row / card title | 22px | 20px | Readex Pro 600 | 1.35 |
| Body paragraph | 19px (lead 21px) | 18px | Readex Pro 400 | 1.8 / 1.6 |
| Navigation tabs | 20px | 24px in the sheet | Readex Pro 600 | 1.4 |
| Buttons | 19px, min height 54px | 19px, full width | Readex Pro 600 | 1.3 |
| Chips / filters | 18px, min height 46px | 17px, 44px | Readex Pro 600 | 1.3 |
| Labels, cities, captions, counts, footer bottom line | 17px | 16–17px | Readex Pro 500 | 1.4 |
| Stamp day numbers | 32px | 28px | Changa 700 | 1.15 |
| Big figures (club members, years) | 60px | 44px | Changa 800 | 1.1 |

Floor: **no text under 16px** anywhere (the tile scan reports zero elements below 16px at 1920 and 390); paragraphs ≥ 18px; nav and buttons ≥ 18px. On wide screens nothing is zoomed: the sizes above are the real sizes at 1920px / 100%.

**Numerals**: Western digits (0–9) in every language, as on the magazine cover and the current site, so 1982, 560 and the show dates read the same in Arabic and English. `font-variant-numeric: tabular-nums` so columns of dates and counts align. Thousands with a comma (1,464). Day ranges with an en dash and no spaces (11–14), always wrapped as an LTR run.

---

## 5. Layout language

- **Grid**: content width up to 1760px (40px gutters on PC, 16px on phone); 12-column mental grid, but each section defines its own simple grid: opening 1.15 / 0.85, logo cards 8 per row (4 at ≤ 1180px, 2 on phone), show rows one per line, footer 4 columns (2, then 1).
- **Spacing rhythm**: 8px base; 16 inside cards, 28 between row cells, 56px section padding on PC (40 on phone), 30px under a section title.
- **Sections**: full-width bands that alternate `paper` and `sea-pale`, with the sea openings and footer as the dark bookends. Each band has **one title** on the route line: red dot — Changa title — 2px line — count or link in sea at the far end. No kicker, no subtitle, no "see all" link except as that far-end text of the same title line.
- **Cards**: white, 1px `line` border, 6px radius, no shadow. Hover = border turns sea. Supplier card: logo (max 64px tall, real file, centred), company name 18px 600, field 17px muted, city 17px sea. Product tile: 232px wide, picture box 160px (object-fit contain on white), name 18px 600 (2 lines), then logo 28px + flag 26×18 + city. Items without a shipped picture are the same tile without the picture box (name, description, logo/flag), never a placeholder.
- **Buttons**: 54px min height, 6px radius, 19px 600. Primary = red/white; secondary on sea = white outline; secondary on paper = sea outline; "all …" buttons = filled sea. Buttons are never blue.
- **Chips/filters**: 46px high, white with a 2px `line` border; flag + name + count; "on" = filled sea with white text. Fields as 17px sea-on-sea-pale tags inside rows.
- **Show rows**: `stamp | flag + place | name + field | details`, 1px `line` between rows, 3px sea rule above the list. On phone: stamp + place on the first line, name + field under, the details button full width.
- **Tables** (magazine contents, ad positions): the same row style, no zebra colours, 3px sea rule on top.
- **Images**: photos edge-to-edge inside a 4px white frame on sea, or a 1px `line` border on paper; product pictures contained on white; no crops to circles, no hover zoom.
- **Logo cards**: real logo files only, on white, never recoloured, never stretched; a logo card without a logo file shows the company name in Changa 24px instead (never a drawn substitute).

---

## 6. Site structure

**Site map** (hash routes, one page = one route):

| Route | Page | What it is for | Compared with today |
|---|---|---|---|
| `#home` | Route board | Welcome, the trade line, and one section per part of the site | New opening and order (below) |
| `#markets`, `#market-<cc>` ×16 | الأسواق / Markets | Hub per country: flag, name, its shows from January 2027 by month, suppliers from there, their products, articles and news about it, the magazine ads from there | **New**; the organising idea |
| `#exhibitions`, `#show-<id>` | معارض دولية | All 1,464 shows (1,043 in 2027 + 421 already listed for 2028), filters by market, field, month, search; show page | Same content, new table layout, country entry through the trade line |
| `#products`, `#company-<id>` | منتجات وصناعات حديثة | Advertisers' products grouped by origin country then field; modern industries in 6 bands; company panel | Regrouped by origin; the company panel also serves the magazine reader |
| `#magazine`, `#flip`, `#flip-<page>` | المجلة | Issue 560 reader (100 pages), contents, archive (559) | Reader rebuilt as a "reading desk" (see 7) |
| `#club` | نادي رجال الأعمال | Goals, 8 benefits, 2,831 members, turnkey projects, join | Same content, new seal and layout |
| `#reading`, `#article-<id>`, `#news-<id>` | مقالات وأخبار | Arabic articles, then news (English + Arabic) | **Merged** from two pages |
| `#contact` (with `#about`, `#advertise` anchors) | تواصل معنا | Phone + apps, e-mail, address (English), newsletter, then "من نحن" and "أعلن معنا" | About and advertise **moved** here and to the footer; out of the menu |
| `#assistant` | مساعد AAT | The 24-hour chat as a side sheet over any page | Same engine, new look |

**Home page, in order** (content source → why here):

1. **Route board opening** (config, countries, one real factory photo) — says in one bilingual sentence what AAT is and who it is for; the two buttons go to the two things readers come for: the issue and the shows.
2. **The trade line** (countries.shows) — inside the opening band: 16 flags with counts, each a link to its market hub. The structure of the site, visible at once.
3. **منتجات المعلنين — the moving shelf** (companies.products with pictures; 127 products from 28 companies, 114 with a picture on the old site, 53 shipped in the prototype) — the owner loves the moving shelf; it is the first thing after the opening, and now every tile carries its company logo and origin flag.
4. **معارض دولية** (shows, fields) — market chips with counts, then the next 7 dated shows as stamp rows, and a sea button to the full page. Shows are the most-used data on the site, so they come before anything editorial.
5. **موردون من آسيا والعالم العربي** (companies, cats) — real logos grouped by origin: Taiwan (20), Syria (5), then Malaysia, Indonesia, Pakistan, Türkiye, India, Saudi Arabia (7) = all 32 supplier companies of issue 560 (the 3 trade-show advertisers appear with the shows). The 5 suppliers without a logo file (HIWIN, JARRER, Young Shang, Feng Tien, HoneyB2B) get a name card in Changa, never a drawn logo. This is the "bridge" made visible: suppliers on the Asian side and the Arab side of the same page.
6. **المجلة · العدد 560** (magazine) — cover with a stamp label, the first 12 pages as thumbnails in a strip, the contents of the issue (articles with page numbers), "تصفّح العدد" button.
7. **مقالات وأخبار** (articles 6 with pictures, news 3) — three article cards with pictures and author, three news rows with dates.
8. **نادي رجال الأعمال** (club) — the lead sentence, "2,831 عضواً" as a big figure, the 8 benefits as numbered lines, join = number + app icons.
9. **أعلن في المجلة** (advertise.positions) — four positions (cover partner, back cover, spread, page) as rows with their print and web lines; one button to WhatsApp with the prepared message.
10. **تواصل معنا** (config) — phone in Changa 32px, six app icons, e-mail (link blue), the address in English, the newsletter box.
11. **Footer** — see below.

**Header** (every page):
- PC: deck 1, sea, 48px: nameplate (3 languages) at the start; issue label, phone, "English/العربية" outline button and a globe with "اللغات" at the end. Deck 2, white, 96px, 3px sea line under it: logo at the start, 7 tabs (الأسواق · معارض دولية · منتجات وصناعات حديثة · المجلة · نادي رجال الأعمال · مقالات وأخبار · تواصل معنا), the current one in red with a 4px red underline. Deck 2 sticks to the top while scrolling (compacts to 72px with a 44px logo). Between 860 and 1180px the tabs wrap into two rows; nothing is hidden.
- Phone: deck 1 shows the Arabic nameplate, the language button and the globe; deck 2 shows the logo and a red "القائمة" button; the menu is a full-screen sea sheet: 7 items at 24px, a languages row, the phone number, a close button at the top. The language switch keeps the current route.

**Footer** (sea): column 1 — white logo, the nameplate, one sentence about the magazine; column 2 — "الموقع": the 7 pages plus من نحن and أعلن معنا; column 3 — "الأسواق": the 16 markets in trade-line order, two columns; column 4 — "تواصل معنا": phone (Changa 26px), the six app icons (WhatsApp, Viber open a chat; Botim, imo, BiP, LINE copy the number), e-mail (white on sea — blue only on light backgrounds), the address in English, LTR. Bottom line: "© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة" and "AAT · Arab Asian Trade · www.aatworld.com". No YouTube, no credits to data sources.

---

## 7. Key screens

**Exhibitions (`#exhibitions`)** — Sea opening with the title "معارض دولية", the total (1,464), and the trade line as the country filter (tap a stop = that market; "كل الأسواق" first). Under it a white filter deck that sticks under the header: a 20px search box ("ابحث عن معرض أو مدينة أو مجال"), the 18 field chips with counts in a wrapping row, and a month strip (يناير 2027 … ديسمبر 2028, with counts) as 46px chips. Results: stamp rows, grouped under month headings (Readex Pro 22px, sea, on a sea-pale band line — headings inside the list, the page itself has one title). Rows render 60 at a time with a sea "إظهار المزيد" button (fast on slow phones); the count line above the list always says how many match ("283 معرضاً في إندونيسيا · أغذية ومشروبات: 60"). Show page (`#show-<id>`): the stamp big (days 48px), flag + city + venue, name, field chip, the Arabic/English summary and themes, then "معارض أخرى في السوق نفسه" rows and an "اسأل مساعد AAT" button. No organizer row when unknown, no EventsEye links, no "to be announced" text — a show known only by month shows the month stamp without days.

**Products (`#products`)** — Sea opening "منتجات وصناعات حديثة" with "127 منتجاً · 28 شركة · 40 صناعة حديثة". Search box. Then origin groups: "من تايوان · 20 شركة" → the companies' products as the shelf tile in a wrapping grid (8 per row on PC, 2 on phone), each tile with logo + flag + city; "من سورية", "من ماليزيا …". Then six sea-pale bands for the modern industries (آلات التعبئة والتغليف 13 · تصنيع الأغذية والمخابز 5 · البلاستيك وإعادة التدوير 7 · الرعاية الصحية والحركة 6 · المعادن والقطع والعدد 5 · الأثاث والبناء والترفيه 4) with photo tiles where a picture ships and text tiles where not. Company panel (`#company-<id>`, also opened from the reader): logo, name (Arabic name when it exists), flag + city, about, the product tiles, contact (phone, WhatsApp, e-mail and website in link blue), and the thumbnails of its magazine pages.

**Magazine reader (`#flip`)** — A "reading desk": sea background, the page pictures on it with a 4px white edge. The spread **fits the window height** exactly; on PC two pages side by side when both fit at full height (page 1 alone, as a printed magazine), otherwise one; on phone one page, swipe or the big ‹ › buttons. Page turning is a 250ms slide (RTL: the next page comes from the left), no 3D curl, no shadow fold. Tools on the inline-start side on PC as 48px sea-outline buttons: المحتويات (articles with page numbers, advertisers A–Z), صفحة واحدة / صفحتان, ملء الشاشة, PDF, اللغة, and a page stamp "12 / 100" with a slider. On phone the tools sit in a bottom bar (prev · page stamp · next · menu). **Tapping an ad never jumps**: it opens the company panel as a side sheet over the desk (the route stays `#flip-<page>`), and tapping a product hotspot opens that product inside the panel. The cover shows only the picture. Prototype: the first 12 pages ship; pages 13–100 show the page stamp and the contents entry, not a placeholder image — the reader simply stops at 12 in the prototype and the contents list says "صفحات 13–100 بعد الموافقة" (an honest status line in the prototype only, removed in the full build).

**Business Club (`#club`)** — Sea opening with "نادي رجال الأعمال" and the big figure "2,831 عضواً". The seal: a rectangular **membership stamp** in sea with a 3px red frame — "نادي رجال الأعمال · AAT Business Club · 1982" in Changa — formal, no cartoon, no swoosh. Sections: أهداف النادي (two paragraphs, 21px), مزايا الأعضاء (the 8 benefits as rows: number in Changa 48px red, text 20px), شركاؤنا, مشاريع تسليم المفتاح (title, sub, intro and the list from the data), then "للمشاركة في نادي رجال الأعمال": phone + the six app icons + e-mail (aatclub@gmail.com in link blue on white).

**Contact (`#contact`)** — Sea opening "تواصل معنا". A white card with the number in Changa 32px (LTR), the six app icons at 56px (WhatsApp and Viber open a chat; Botim, imo, BiP and LINE copy the number and show "تم نسخ الرقم" for 2 s), e-mail in link blue, and the address as an English LTR block (P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C.) with the Taiwan flag plate — in Arabic too. Then the newsletter (one e-mail field 20px + red "اشترك", saving to the existing `api/subscribe.php`), then "من نحن" (the owner's exact text once he pastes it; until then the current lead and three paragraphs), then "أعلن معنا" with the four positions and the WhatsApp button.

**Assistant** — A fixed tab at the bottom-end corner: sea, white border, chat glyph, "مساعد AAT / محادثة 24 ساعة" (18px). It opens a side sheet (420px on PC, full screen on phone): sea header with the title and a close button, white body, messages at 19px, four quick buttons (معارض حسب الدولة · المنتجات · المجلة · تواصل معنا), a 20px input with a red send button. Answers reuse the site's own pieces: stamp rows for shows, product tiles, logo cards, contact card. Same engine as today (answers from the site content, no API).

---

## 8. RTL

- Arabic is the default and the source of the layout: `dir="rtl"` on `<html>`, every grid and flex mirrors by itself (logical properties: `inset-inline-start`, `padding-inline-start`, `text-align: start`). The trade line runs from the start side (Taiwan at the right in Arabic) to the end side (Algeria at the left); in English it runs left to right. The red dot of a section title sits at the start side in both.
- Latin runs inside Arabic (company names, show names, model numbers, "P.O. Box …") are wrapped in `<bdi>` so their word order never flips; the phone number, e-mail, web addresses and the address block are `dir="ltr"` elements aligned to the start side. Day ranges ("11–14") are LTR runs inside the stamp. Digits are Western everywhere.
- The bilingual twin line under the H1 is the other language's direction (`dir="ltr"` on the Arabic page, `dir="rtl"` on the English page) and is aligned to the page's start edge, so both lines begin at the same edge.
- Arrows and chevrons are drawn with `scaleX(-1)` under `[dir=rtl]`; the reader's ‹ › buttons swap meaning (next page is on the left in Arabic).
- The English version is the same structure, same components, same sizes, with LTR line-heights (body 1.6, H1 1.12) because Latin needs less leading than Arabic; the nameplate stays trilingual in the same order; the Taiwan address is identical.
- zh-TW, zh-CN and Malay: same templates with Noto Sans TC/SC for the Chinese text; the nameplate and the logo never change.

---

## 9. Motion

Moves:
- **The shelf** of advertisers' products: a continuous loop at ~42px/s (CSS transform, duplicated track), pauses while the pointer or a finger is on it, resumes after. Runs on every device, including "lite" mode.
- **The trade line** on the home opening draws itself once on first paint: the line grows from the start stop to the end stop over 1.2s and the flags appear in order (CSS only, `prefers-reduced-motion` skips it). It never repeats.
- **Page turns** in the reader: a 250ms slide. **Sheets** (menu, company panel, assistant): a 200ms slide-in.

Never moves: no parallax, no auto-rotating banners, no fade-in-on-scroll, no counters that count up, no hover zoom on pictures, no bouncing chat button, no splash. Hover states change a border or an underline only. The page is complete on first paint; nothing appears after the content.

---

## 10. Why the owner will love it

1. "**Make sure it is VERY DIFFERENT**": the first screen is a deep-sea masthead with a bilingual headline, a factory photograph and sixteen flags on a line — not one pixel of the red gradient, the "45" or the floating pill survives.
2. "**LARGE MODE everywhere**": body 19px, nothing under 16px (scanned: 0 small texts at 1920 and 390), tabs 20px bold, buttons 54px tall, and a text face (Readex Pro, built on the reading-ease family Lexend) with open, wide letters for readers with weak eyesight.
3. "**Why is it not moving any more?**": the moving shelf is the second thing on the home page and runs on every device; it now carries each company's real logo and origin flag.
4. "**Where are the section separators?**" / "**Just one of them!**": every section has exactly one title on a red-dot route line and sits on its own white or sea-pale band; openings and the footer are sea, so the structure is visible from across the room.
5. "**Either the date is there or it isn't**" / "**use original logos**": every number on the page is computed from the data (125 shows for Taiwan, 20 companies from Taiwan), Afghanistan and Yemen show no count instead of a fake one, logos are the real files, the address is always in English, and blue appears only on e-mail and web addresses.
