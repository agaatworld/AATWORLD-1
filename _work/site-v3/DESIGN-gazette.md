# AAT site v3 — FINAL DESIGN BRIEF: "The Trade Gazette"

This brief is binding for every builder. When it is silent, choose the option that matches the gazette idea: rules, ink, red used sparingly, real facts, big type. Do not reuse any CSS, class name or markup pattern from today's `assets/css/app.css`. Build fresh.

**Inputs**
- Content: `/home/user/AATWORLD-1/_work/site-v3/data/data.json` (schema in `data/README.md`)
- Pictures: `/home/user/AATWORLD-1/_work/site-v3/img/` (the prototype sample; paths in data.json are relative to it)
- Base concept: `concepts/gazette/` (BRIEF.md plus its tiles)
- Grafts: `concepts/exchange/`, `concepts/bridge/`, `concepts/club/`
- Owner rules: `/home/user/AATWORLD-1/CLAUDE.md` and `/home/user/AATWORLD-1/.claude/skills/aat-web/SKILL.md`

**How the base was chosen.** The owner-lens score counts double.

| Concept | Owner lens ×2 | Design critic | Usability | Combined |
|---|---|---|---|---|
| **gazette** | 54×2 = 108 | 55 | 54 | **217** (base) |
| exchange | 53×2 = 106 | 48 | 52 | 206 (runner-up, main grafts) |
| bridge | 51×2 = 102 | 50 | 50 | 202 |
| club | 46×2 = 92 | 48 | 51 | 191 |

**What this brief changes in the gazette concept**
- **Grafts:**
  - From exchange: the company directory, the merged "مقالات وأخبار", search, and the phone bottom tab bar.
  - From bridge: the flag "trade line" with real counts that links to each country's shows, and the real app icons.
  - From club: the side-column filters on the exhibitions page, catalogue units per advertiser, and month-only shows placed at the end of each month.
- **Every mustFix is resolved.** They are listed in §10.

---

## 0. What is different from today

The owner must see each of these points at once.

1. **Top of the site.** Today a floating white pill menu sits over a card shelf, with a small logo at the end. **New:** a newspaper masthead.
   - The full red AAT logo is centred and large.
   - The red three-language nameplate band comes from the printed cover.
   - A solid black section bar follows, with the current section shown as a red block.
2. **Menu.** Today there are 8 media-type links: المجلة · المقالات · الأخبار · معارض دولية · منتجات وصناعات حديثة · نادي رجال الأعمال · من نحن · تواصل معنا. **New:** sections a buyer looks for:
   - الرئيسية · المجلة · معارض دولية · **دليل الشركات** (new) · المنتجات · **مقالات وأخبار** (merged) · نادي رجال الأعمال · تواصل معنا
   - A search field ("ابحث أو اسأل AAT") sits in the same bar.
   - من نحن and أعلن معنا leave the bar. They move to the magazine page and the footer.
3. **Home page.** Today it is a marketing scroll: shelf → red "45 عاماً" banner with a tilted cover → dotted map → logo strip → sector photo tiles → cards. **New:** a **front page** with three ruled columns:
   - "في هذا العدد": the cover and contents with page numbers.
   - "معارض دولية": dated shows and the flag line with counts.
   - "نادي رجال الأعمال": the seal and 2,831 members.
   - Below the columns: a red figures strip, the advertisers' classified grid of real logos, and articles & news.
4. **Moving shelf.** Today it is tall gradient cards mixing articles and products. **New:** a **product ticker** between rules. Each item shows the product picture, the name, the maker's real logo and the red page folio "ص. 7". It is still the first thing under the menu and still moving.
5. **Phone.** Today there is a hamburger menu and a floating chat. **New:**
   - A slim logo row and the red nameplate band.
   - A **fixed bottom tab bar**: المجلة · معارض دولية · المنتجات · اسأل AAT.
   - A "الأقسام" button for everything else.
6. **Inner page openings.** Today a red gradient banner sits behind the menu. **New:** a **section front**:
   - A 10 px red rule, then the page title in large Naskh.
   - A solid red **figure box** with the page's key fact (1,464 معرضاً · 2,831 عضواً · ص. 18).
   - No gradient, no banner image.
7. **Layout language.** Today: rounded cards, soft shadows, pill chips, gradients and cream/white bands. **New:** square corners, no shadows, no gradients. Structure comes from **rules**:
   - A 3 px ink rule plus a red square opens every section.
   - Hairlines separate rows and columns.
   - Dotted leaders run in the contents lists.
8. **Typography.** Today one rounded Arabic sans is used everywhere. **New:** a newspaper voice:
   - **Noto Naskh Arabic** for headlines and text.
   - **Noto Kufi Arabic** for menus, buttons and labels.
   - **Newsreader** serif for every big figure and English headline.
   - **Libre Franklin** for English UI and every Latin name inside Arabic pages.
9. **Colour.** Today red is a background everywhere (banners, gradient cards, red newsletter, dark-red footer). **New:** black ink on white paper, with AAT red in exact places:
   - the logo, the nameplate band, the active menu block, the figure boxes, the figures strip, folios and primary buttons
   - a black colophon footer and one light grey contact band
10. **The magazine is the spine.** Today the magazine, the companies and the products are separate worlds. **New:** every company, product and issue article carries its **page folio** ("ص. 18"), so site and print are one publication.
11. **Exhibitions.** Today big flag cards lead to rows. **New:** a **calendar of fairs**:
    - side-column filters on PC (country with flag and count, 18 fields with counts, search)
    - black month bars with counts
    - rows with a big date cell, name, city, venue and field tag
    - one tap from any country count on home to that country's shows
12. **Companies.** Today company mini-sites are hidden behind the magazine. **New:** a first-class **company directory** with 35 advertisers, real logos, origin and field filters, product counts and page folios.
13. **Magazine reader.** Today it is a beige flipbook with floating pill buttons. **New:** a **reading room**:
    - a grey desk and a black tool bar
    - pages fitted exactly to the window height, two side by side when they fit
    - tapping an ad page opens the company panel beside the page and never jumps
14. **Feel.** Today it reads as "a modern app with a red theme". **New:** "a serious trade paper printed in Taiwan since 1982, now open in the browser".

---

## 1. Concept

**The Trade Gazette.** AAT is a 45-year-old printed trade paper, so the website is its daily edition online. The home page is the **front page**:
- a dateline (issue 560 · October 2026 · year 45 · since 1982)
- the masthead with the red logo
- the cover's red nameplate band
- a black section bar
- the product ticker
- three ruled columns
- a red line of hard figures
- the classified grid of advertisers

Every inner page is a **section of the paper** that opens with a section front. The magazine, the companies, the products and the fairs are cross-referenced like a printed index: page folios, counts, dates.

Nothing is decoration unless it is also information. Rules separate. Red marks where you are and what matters. Numbers are facts.

**The one memorable idea: the masthead plus the folio.** The centred red AAT logo over the red three-language band (التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌) says "our magazine" in one second. The red folio "ص. 18" beside every company, product and article says "this is printed in the issue". The site and the paper are visibly the same publication.

---

## 2. Identity

### Logo

The only mark is the full red script logo "AAT · Ideas For Business". Never redraw, recolour, crop, rotate or shadow it.

| Place | File | Size |
|---|---|---|
| Home masthead (centred) | `img/brand/aat-logo-red.svg` on paper | 300 px wide PC (≥1700 px viewport: 340 px); 1181–1699: 280 px |
| Inner-page masthead (centred) | same | 200 px wide PC |
| Phone logo row (inline-start) | same | 132 px wide |
| Sticky section bar (PC, appears only when stuck, inline-start) | `img/brand/aat-logo-white.svg` on ink | 104 px wide |
| Reader tool bar | white logo on ink | 96 px wide |
| Footer colophon | white logo on ink | 220 px wide (phone 180) |
| Club seal centre | red logo inside the approved `clubMark()` ring | per the seal |
| Favicon | inline SVG data URI: white square, the red logo scaled to fit (the "AAT" letters dominate) | 32/180 px |

Clear space around the logo is at least the height of the "T" crossbar. The logo never sits on a photo, on red or on grey.

### Tagline
"Ideas For Business" lives only inside the logo. It is never typed as a headline.

### Motifs
There are only five, all taken from print.

1. **The nameplate band.** It is red (`--red`) and full-bleed. White Noto Kufi Arabic 700, Libre Franklin 700 and Noto Sans TC 700 text, separated by " · ".
   - PC: 52 px tall, text 22 px. Order in Arabic: التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌. In English: Arab Asian Trade · التجارة العربية الآسيوية · 中阿商業雜誌.
   - Phone: 44 px tall, 18 px text. Only two names: Arabic site "التجارة العربية الآسيوية · 中阿商業雜誌"; other languages "Arab Asian Trade · 中阿商業雜誌". It must fit one line at 360 px.
   - Under it sits a 2 px paper gap, then the ink section bar.
2. **Rules.**
   - Every section opens with a 3 px ink rule across the content width.
   - 1 px hairlines separate rows, columns and grid cells.
   - The section front uses a 10 px red rule.
   - A 6 px red rule sits above the footer.
   - Contents lists use dotted leaders (2 px dots, `--ink-2`).
3. **The red square.** It is 18×18 px (phone 14) and sits before every H2, aligned to the cap height. Column titles use the same square at 14 px. No other bullets or icons go before titles.
4. **The page folio.** "ص. 18" in Arabic, "p. 18" in English. Spreads read "ص. 18–19" and "ص. 52–55". Set in Noto Kufi Arabic or Libre Franklin 700, 18 px, `--red`. It appears on every company, product, issue article, contents row and ticker item. It always means "printed on this page of issue 560".
5. **The figure box.** A solid red block with a white Newsreader 700 figure and a white Kufi or Franklin 700 label. Used in the section front of every inner page, in the figures strip, and for the date of a show page.

**The club seal** is the owner-approved `clubMark()` from `/home/user/AATWORLD-1/assets/js/views.js` lines 257–269:
- a red ring with "BUSINESS CLUB" on the top arc and "نادي رجال الأعمال" on the bottom arc (both upright)
- a briefcase and three stars
- the real red AAT logo in the white centre
Port the SVG as it is, with the logo SVG inlined in the centre. Render it at a minimum of 200 px so its ring text stays at 16 px or more. Never add or change ring text: no "AATBC", "TAIPEI", "TAIWAN" or "SINCE 1982".

### Forbidden in the identity
- the swash, swoosh or hooked-pair symbol and its pattern (removed by the owner on 19 Oct)
- gradients, drop shadows, glows and rounded cards
- a tilted cover
- the giant decorative "45"
- the dotted trade map
- AI sector photos
- any redrawn logo or seal with invented text
- the gold/brass, navy or teal colourways of the other concepts
- dark mode

---

## 3. Tokens

Put these in `:root` with these exact custom-property names. Light theme only: no `prefers-color-scheme` rules, and `color-scheme: light`.

### Colours

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FFFFFF` | page background, cells, inputs, secondary buttons |
| `--desk` | `#F0F0EE` | the contact band, the reader desk, hover fill of rows and cells, the selected-filter background on phone sheets. Neutral grey, **not cream**. |
| `--ink` | `#141414` | all primary text, 3 px rules, the section bar, month bars, the footer, selected chips |
| `--ink-2` | `#363636` | secondary text (cities, venues, notes, meta lines). Never lighter than this for anything a reader must read. |
| `--hover-ink` | `#2E2E2E` | hover background of section-bar items |
| `--hair` | `#BDBDBD` | hairlines and frames **only**; never carries text |
| `--red` | `#D21F26` | the logo red: logo, nameplate band, active section block, red squares, folios, figure boxes, figures strip, primary buttons, the "قريباً" tag outline and text, the 6 px rule above the footer |
| `--red-deep` | `#7A0A10` | hover and pressed state of red buttons and blocks; link hover on headlines |
| `--blue` | `#0B4F9C` | web and e-mail addresses on `--paper` or `--desk` only. Never inside buttons, never on red, ink or in the footer. |
| `--foot-2` | `#D4D4D4` | secondary text on the ink footer |
| `--placeholder` | `#595959` | input placeholder text |

**Text and background pairs** (WCAG 2.1, computed). Every pair a builder may use is listed. Any other pair is not allowed.

| Text on background | Ratio | Allowed use |
|---|---|---|
| ink on paper | 18.42 | all text |
| ink on desk | 16.14 | all text |
| ink-2 on paper | 12.08 | secondary text |
| ink-2 on desk | 10.59 | secondary text |
| white on ink | 18.42 | section bar, month bars, footer, selected chips |
| foot-2 on ink | 12.43 | footer secondary |
| white on hover-ink | 13.58 | section-bar hover |
| white on red | 5.30 | nameplate band, active section, buttons, figure boxes, figures strip |
| white on red-deep | 11.18 | hover and pressed |
| red on paper | 5.30 | folios, "قريباً" tag, red text links in rows (all ≥18 px bold) |
| red on desk | 4.64 | folios only (18 px bold) |
| red-deep on paper | 11.18 | headline hover |
| blue on paper | 8.04 | addresses |
| blue on desk | 7.04 | addresses |
| placeholder on paper | 7.00 | input placeholders |
| ~~red on ink~~ | 3.48 | **forbidden** (no red text on black; a red *block* beside black is fine) |
| ~~hair as text~~ | 1.88 | **forbidden** |

**Proportion target.** Roughly 80 % paper or desk, 14 % ink, 6 % red. Red appears on:
- the masthead band
- the active menu block
- the figures strip and figure boxes
- buttons and folios

That is enough to read as AAT and never as a pale page. Do not add any other red areas.

**Third-party brand colours** appear only inside real app icons:
- WhatsApp `#25D366`
- Viber `#7360F2`
- LINE `#00C300`
- the Botim, imo and BiP PNGs as they are

### Fonts

Load one `<link>` from Google Fonts. Add `preconnect` to fonts.googleapis.com and fonts.gstatic.com.

```
https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400..700&family=Noto+Kufi+Arabic:wght@500..800&family=Newsreader:opsz,wght@6..72,400..800&family=Libre+Franklin:wght@400..800&display=swap
```

Load a second link for the nameplate band's Chinese name only, subset by `text=`:

```
https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&text=%E4%B8%AD%E9%98%BF%E5%95%86%E6%A5%AD%E9%9B%9C%E8%AA%8C&display=swap
```

Inject the full `Noto Sans TC:wght@400;700` or `Noto Sans SC:wght@400;700` at runtime only when the visitor picks zh-TW or zh-CN. Both URLs above returned HTTP 200 on 22 Oct 2026.

| Role | Family | Weights | Fallback stack |
|---|---|---|---|
| Arabic text and headlines | `"Noto Naskh Arabic"` | body 500, strong 600, headlines 700 | `"Noto Naskh Arabic", "Geeza Pro", "Traditional Arabic", "Times New Roman", serif` |
| Arabic UI (section bar, buttons, labels, folios, dates, nameplate band, tabs) | `"Noto Kufi Arabic"` | 600 / 700 / 800 | `"Noto Kufi Arabic", "Segoe UI", Tahoma, "Geeza Pro", sans-serif` |
| English headlines and text, all big figures in every language | `"Newsreader"` | text 400–450, headlines 700, figures 700 | `Newsreader, Georgia, "Times New Roman", serif` |
| English UI, and every Latin run inside Arabic (company, product, show and venue names, phone, addresses, URLs) | `"Libre Franklin"` | 500 / 600 / 700 / 800 | `"Libre Franklin", "Franklin Gothic Medium", Arial, sans-serif` |
| Chinese | `"Noto Sans TC"` / `"Noto Sans SC"` | 400 / 700 | `"PingFang TC", "Microsoft JhengHei", sans-serif` |
| Malay | same as English | | |

Set `font-variant-numeric: lining-nums tabular-nums` on figures, dates, counts, folios and phone numbers. Use Western digits everywhere, as the site and the printed magazine do today.

### Type scale (LARGE MODE)

Nothing renders under 16 px, ever: audit it. Paragraphs are at least 19 px. Menus and buttons are at least 18 px bold. The "≥1700" column applies when the viewport is at least 1700 px wide.

| Role | Font (ar / en) | PC 1181–1699 | ≥1700 | Phone ≤760 | Line height ar / en |
|---|---|---|---|---|---|
| H1, section-front title | Naskh 700 / Newsreader 700 | 56 | 62 | 36 | 1.35 / 1.15 |
| H1, lead headline in "في هذا العدد" | Naskh 700 / Newsreader 700 | 30 | 34 | 26 | 1.45 / 1.25 |
| H2, section title (with red square) | Naskh 700 / Newsreader 700 | 38 | 42 | 28 | 1.35 / 1.2 |
| H3, column title, card name, article sub-head | Naskh 700 / Newsreader 700 | 27 | 29 | 23 | 1.4 / 1.25 |
| Body paragraph | Naskh 500 / Newsreader 400 | **20** | 21 | **19** | **1.9** / 1.6 |
| Article reading text | Naskh 500 / Newsreader 400 | 22 | 23 | 20 | 2.0 / 1.65 |
| Lead line under H1 or H2 | Naskh 500 / Newsreader 400 | 21 | 22 | 19 | 1.8 / 1.5 |
| Secondary line (city, venue, meta, company under a product) | Naskh 500 or Franklin 500 / Franklin 500, `--ink-2` | **18** | 19 | **18** | 1.6 / 1.45 |
| Row title (show name, product name, headline in a list) | Franklin 700 (Latin) or Naskh 700 (Arabic) | 20 | 21 | 19 | 1.5 / 1.35 |
| Section bar items | Kufi 700 / Franklin 700 | 20 | 21 | — | 1 |
| Phone tab bar labels | Kufi 700 / Franklin 700 | — | — | 16 (single line) | 1.2 |
| Buttons | Kufi 700 / Franklin 700 | 20, min height 54 | 21 | 19, min height 52 | 1 |
| Chips, filters, tags | Kufi 700 / Franklin 700 | 18 (field tag 17) | 18 | 18 | 1.2 |
| Folios, labels, counts in notes | Kufi 700 / Franklin 700 | 18 | 18 | 17 | 1.3 |
| Date cell: day range | Kufi 800 (digits Franklin 800) | 26 | 28 | 24 | 1.1 |
| Date cell: month and year | Kufi 700 / Franklin 700 | 18 | 18 | 17 | 1.3 |
| Figures strip number | Newsreader 700 | 64 | 72 | 44 | 1 |
| Figure box number | Newsreader 700 | 56 | 60 | 40 | 1 |
| Club member number (front page column) | Newsreader 700 | 64 | 72 | 52 | 1 |
| Phone number display (contact) | Franklin 800 | 40 | 44 | 30 | 1.1 |
| Input text | Naskh 500 or Franklin 500 | 20 | 20 | 19 | 1.4 |
| Absolute floor | any | 16 | 16 | 16 | |

### Spacing scale (px)

`--s1:4 --s2:8 --s3:12 --s4:16 --s5:24 --s6:32 --s7:44 --s8:56 --s9:72 --s10:96`

- Between sections: 56 on PC, 40 on phone.
- After a section title: 24.
- Rows: 16 vertical padding.
- Column padding: 28 on PC.
- Page gutters: 32 on PC, 16 on phone.

### Radius

`0` everywhere: buttons, inputs, cells, images, chips, panels, the chat tab. The only exception is the **app icons**, which keep their own app shape: WhatsApp, Viber and LINE are drawn as their official glyph in white on the brand colour in a 22 %-radius tile, matching the Botim, imo and BiP PNGs.

### Borders and elevation
- Rules: 3 px ink for section openings, 1 px `--hair` hairlines, 2 px ink for input borders and secondary buttons, 10 px red for the section front, 6 px red above the footer.
- **No box-shadow anywhere.**
- Overlays (assistant panel, company panel, phone sheets) are separated by a 2 px ink border and a 50 % ink scrim (`rgba(20,20,20,.5)`).
- Focus ring: `outline: 3px solid var(--ink); outline-offset: 2px`. On ink or red backgrounds: `outline-color: #fff`.

### Motion

| Moves | How |
|---|---|
| Product ticker | continuous, 42 px/s, driven by `requestAnimationFrame` (so it never stalls); duplicated track; pauses on hover, focus-within and touch; resumes 2 s after touch end |
| Reader page turn | 250 ms horizontal slide of the spread |
| Assistant panel, company panel, phone sheets | 200 ms slide-in from their edge |
| Section bar becoming sticky | no animation, instant |

Never moves:
- headlines, columns, grids or bands (no reveal-on-scroll, no parallax, no hover lift, no zoom on hover, no counting-up numbers)
- splash screens or intro overlays
- anything that shifts the layout after first paint (reserve image boxes with `aspect-ratio`)

Under `prefers-reduced-motion: reduce`:
- The ticker stops and becomes a horizontally scrollable row with two 48 px arrow buttons.
- Slides become instant.

---

## 4. Layout language

### Width and grid
- Content max width 1480 px, centred, with 32 px gutters (16 on phone).
- 12-column grid with 24 px gaps.
- Full-bleed elements: the nameplate band, the section bar, the ticker, the figures strip, the contact band and the footer.

### Breakpoints

| Name | Range | Header mode |
|---|---|---|
| wide | ≥1700 | PC; type uses the ≥1700 column |
| pc | 1181–1699 | PC |
| laptop-narrow | 961–1180 | PC; the section bar may wrap into 2 rows (never hidden); front-page columns become lead full-width + two side by side |
| tablet/phone | ≤960 | phone header plus bottom tab bar; ≤760 single column |

Test at 1920, 1366, 1100, 960 and 390.

### Section anatomy (every section on every page)
1. A 3 px ink rule across the content width.
2. A title row:
   - the red square, then the H2 (one title per section, no kicker, no "see all" link beside it)
   - optionally, at the end of the same row, a **note** in 18 px Kufi 700 `--ink-2`: a count or the issue line only, for example "1,464 معرضاً" or "العدد 560 · أكتوبر 2026"
3. Optionally, one lead line under the title (21 px).
4. The content.
5. Optionally, **one** action at the foot: a secondary button. Never two actions for the same destination in one section.

Sections are separated by the rule plus 56 px of space. Backgrounds stay `--paper`, with three exceptions:
- the red figures strip (home)
- the `--desk` contact band (every page)
- the ink footer

There are no alternating bands; the rules do the separating.

### Section front (opening of every inner page)
- A 10 px red rule across the content width directly under the header, then 32 px of space.
- A two-part row:
  - **start side:** the H1 (56 px), then an optional lead line (21 px `--ink-2`, maximum 2 lines).
  - **end side:** the **figure box**, a solid red block, min-width 240 px, 28 px padding, white figure (56 px Newsreader 700) above a white label (18 px Kufi or Franklin 700, maximum 2 lines).
- A 3 px ink rule closes the section front.
- On phone the figure box goes under the title, full width, as one line: figure 40 px plus label beside it.

Figure box per page (real data, computed at runtime):

| Page | Figure | Label ar / en |
|---|---|---|
| #magazine | 560 | العدد · أكتوبر 2026 / Issue · October 2026 |
| #exhibitions | 1,464 (or the filtered count) | معرضاً دولياً في 14 دولة / international exhibitions in 14 countries (label follows the filter: "معرضاً في الإمارات") |
| #companies | 35 | شركة معلنة في العدد 560 / advertisers in issue 560 |
| #products | 127 | منتجاً من 28 شركة / products from 28 companies |
| #modern | 40 | منتجاً وصناعة في 6 مجالات / products and industries in 6 fields |
| #reading | count of items listed in the visitor's language | مقالاً وخبراً / articles and news |
| #club | 2,831 | عضواً في نادي رجال الأعمال / members of the AAT Business Club |
| #about | 1982 | صدر العدد الأول من المجلة (`about.facts.labels.since`) |
| #advertise | 560 | عدداً من المجلة (`about.facts.labels.issues`) |
| #contact | +886 966 404681 (Franklin 800 40 px, `<bdi dir=ltr>`) | هاتف وواتساب / Phone and WhatsApp |
| #company-NN | ص. 18 (folio of first page or spread) | في العدد 560 / in issue 560 |
| #product-NN-K | ص. N | في العدد 560 / in issue 560 |
| #exhibition-ID | the date ("11–13" over "يناير 2027", or the month for month-only) | the country with its flag (24×16) |
| #article-ID | ص. N (issue-560 articles only; older articles have no box) | في العدد 560 |
| #news-ID | the date when known, else no box | |
| #modern-N | none (no box) | |
| #privacy | none | |

When a page has no box, the title spans the full width.

### Rows (the main unit; most content is rows, not cards)
- Full width, with 1 px hairlines between rows, 16 px vertical padding and a minimum height of 64 px.
- The whole row is one link with a `--desk` hover fill.
- No row ends in a lone arrow icon.

### Cards
They are used for one thing only: the **company panel or card** (reader side panel, company page header). It has:
- a 2 px ink frame
- a header strip with a 3 px ink rule, the folio and the field
- the logo, name, city, about, up to 2 products and 2 buttons
- web and e-mail in blue

Everything else is rows or hairline grids.

### Hairline grids (logo cells, product cells)
- Built with CSS grid; cells share 1 px `--hair` borders, collapsed by giving the container a 1 px border and cells `margin:-1px 0 0 -1px` or an equivalent technique.
- Cells are square-cornered on paper, with a `--desk` hover.

### Buttons

| Type | Look | Use |
|---|---|---|
| Primary | `--red` fill, white text, no border | one per section at most: اقرأ العدد 560, انضم إلى نادي رجال الأعمال, واتساب, أرسل |
| Secondary | `--paper` fill, 2 px ink border, ink text; hover `--desk` | PDF, كل المعارض الدولية, دليل الشركات, filters |
| Text | ink text, 2 px ink underline offset 6 px, 20 px Kufi 700, with a CSS chevron that flips in RTL; hover `--red-deep` | "more" line at the foot of a column only |

- Size: 54 px tall (52 on phone), 24 px side padding, 20 px bold.
- Full width inside front-page columns and on phone.
- Hover changes colour only. Pressed = `--red-deep` or ink.
- Never blue, never rounded, never pill-shaped.

### Chips, filters and tags
- **Filter chip or tab:** rectangular, 48 px tall minimum, 2 px `--hair` border, 18 px Kufi 700, with an optional flag (30×20, 1 px hair frame) and a count in Franklin 700. Selected = ink fill, white text, white count.
- **Field tag (on rows):** 1.5 px ink border, 17 px Kufi 700 ink, 4 px 10 px padding.
- **"قريباً / Soon" tag:** 1.5 px red border, red text 17 px Kufi 700. Applies to shows starting within 90 days of today (computed). Nothing else uses it.
- No pills, no tinted chips.

### Inputs
- 56 px tall (52 on phone), 2 px ink border, square, 20 px text, placeholder `--placeholder`.
- A visible label above every input (18 px Kufi 700); a placeholder alone is not enough.
- The search field in the ink section bar: white field, 48 px tall, 280 px wide, placeholder "ابحث أو اسأل AAT" / "Search or ask AAT", with an accessible label. Beside it sits a red square button, 48 px, with a magnifier icon and the visible word "بحث" / "Search" (18 px).

### Tables
Only the exhibitions calendar uses a table look. It is built as a CSS grid of rows, not `<table>`, so it can stack on phone.

### Image frames
- 1 px `--hair` frame, square corners, white background.
- Product and logo pictures: `object-fit: contain` with 8 px padding.
- Article and news photos: `object-fit: cover` at 2:1 (thumbnails 3:2).
- The cover: flat, never tilted or shadowed.
- Every image has `width`/`height` or `aspect-ratio`, `loading="lazy"` (except the masthead logo, cover and the first 4 ticker items), `decoding="async"` and a real `alt` (the product or company name).

### Logo cells
- A logo area 80 px tall (phone 64), the logo `contain`ed, max 180 px wide.
- A company without a logo shows its **name typeset** in the logo area (Franklin 800 22 px ink, 2 lines max). This is a name, not a fake logo. Never a grey box or initials badge.

### Empty and unknown data
- Unknown facts are **hidden**: no "—", no "غير معروف", no "TBA", no "قريباً" as a stand-in, no "الشهر فقط", no "coming soon".
- Compose secondary lines from known parts only: `[city, venue].filter(Boolean).join(' · ')`. This prevents a dangling "مسقط ·".
- An item without a shipped picture renders **without a picture box**: a text row or text cell. Never a grey placeholder.
- A filter with zero results shows one line, "لا توجد نتائج لهذا الاختيار" / "No results for this choice", plus a secondary button "إلغاء التصفية" / "Clear filters". This is a real state, not a placeholder.

---

## 5. Header and footer

### PC header (≥961 px)

1. **Ears row** (56 px, paper, 1 px hair rule under it), on all pages:
   - **Start:** the dateline on two lines. Line 1, Kufi 700 18 px ink: "العدد 560 · أكتوبر 2026". Line 2, 18 px ink-2: "السنة 45 · تصدر في تايوان منذ 1982". English: "Issue 560 · October 2026" / "Year 45 · Published in Taiwan since 1982".
   - **End:** the phone number "+886 966 404681" (Franklin 800 22 px, `tel:` link, `<bdi dir=ltr>`), then the language button "English" (on Arabic) or "العربية" (on every other language) as a secondary button 44 px tall, then the globe button (44×44, icon plus accessible name "اللغات").
   - The globe opens a menu panel with the 5 languages in their own scripts: العربية · English · 繁體中文 · 简体中文 · Bahasa Melayu. Rows are 52 px, 20 px text, with a tick on the current language.
2. **Masthead.** The red logo, centred, with 20 px space above and below. 300 px wide on home; 200 px on inner pages.
3. **Nameplate band** (red, full-bleed, 52 px).
4. **Section bar** (ink, full-bleed, 60 px):
   - Items in Kufi or Franklin 700, 20 px, white, with 18 px side padding.
   - The current section is a **solid red block** with white text. Hover = `--hover-ink`.
   - Item order: الرئيسية · المجلة · معارض دولية · دليل الشركات · المنتجات · مقالات وأخبار · نادي رجال الأعمال · تواصل معنا
   - English labels: Home · Magazine · International exhibitions · Company directory · Products · Articles & news · AAT Business Club · Contact
   - At the inline end sits the search field (see Inputs). Submitting opens the assistant panel with that query.
   - **Sticky:** when the visitor scrolls past it, the section bar alone sticks to the top (`position: sticky`). While stuck it shows the white logo (104 px) at the inline start. No other part of the header sticks.
   - Between 961 and 1180 px, or whenever the items do not fit (English at 1366 is likely), the bar wraps into two rows. It is never hidden or put behind a hamburger. Measure the wrap; do not guess it.

Header height before content: home ≈ 56 + 140 + 52 + 60 = 308 px; inner ≈ 56 + 104 + 52 + 60 = 272 px.

### Phone header (≤960 px)
1. **Logo row** (64 px, paper, sticky): the red logo 132 px at the inline start; at the inline end the "English"/"العربية" button (44 px) and the "الأقسام / Sections" button (44 px, ink fill, white Kufi 700 17 px, with a 3-line icon before the word).
2. **Nameplate band** (red, 44 px, two names), not sticky.
3. Nothing else. There is no section bar on phone.

**"الأقسام" sheet** (full screen, paper; header row with the title "الأقسام" and an "إغلاق" button):
- A search field "ابحث أو اسأل AAT".
- All 8 sections as 60 px rows (22 px Kufi 700), current one with a red block at the inline start.
- Then من نحن · أعلن معنا · الخصوصية.
- Then the phone number (call link) and the app icons.
- Then the 5 languages.

**Bottom tab bar** (fixed, 68 px plus safe-area inset, paper, 3 px ink rule on top). Four equal tabs, each an icon (26 px line glyph, ink) above a label (16 px, 700, single line):

| Tab | ar | en | Target |
|---|---|---|---|
| 1 | المجلة | Magazine | #magazine |
| 2 | معارض دولية | Exhibitions | #exhibitions |
| 3 | المنتجات | Products | #products |
| 4 | اسأل AAT | Ask AAT | opens the assistant panel |

- The active tab: red label and a 4 px red bar on top.
- Home is the logo.
- Page content gets `padding-bottom: 68px + safe-area`, so nothing is covered.
- The bar hides in the reader (#flip).

### Assistant entry point
- PC: the section-bar search (always visible while the bar is sticky).
- Phone: tab 4.
- At ≥1700 px **only**, a red tab is also fixed at the bottom-left page margin, physically left in every language (owner's "chat left"): 64 px tall, white Kufi 700 18 px "اسأل AAT · محادثة 24 ساعة", max 200 px wide. It must sit in the empty margin outside the 1480 px content; check that it covers nothing.
- Below 1700 px there is no floating button.

### Contact band (above the footer, on every page except #contact)
- `--desk` background, 56 px vertical padding.
- One H2 "تواصل معنا" / "Contact us", then three equal columns (stacked on phone):

| Column | Content |
|---|---|
| 1 | Phone 40 px (`tel:`), then the 6 app icons (48 px tiles, app name 16 px under each). WhatsApp and Viber open a chat (`config.apps[].url`); Botim, imo, BiP and LINE copy the number and show a 16 px toast "تم نسخ الرقم" / "Number copied" for 2.5 s. |
| 2 | E-mail info@aatworld.com in blue (mailto). The address, **always English**, LTR, Franklin 600 19 px: "P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C." |
| 3 | **Newsletter** (the prototype cannot send). See below. |

Newsletter column content:
- H3: `config.newsletter.title` (لا تخسر العروض والفرص التجارية).
- The line "أرسل كلمة «اشتراك» من بريدك إلى" / "Send the word “Subscribe” from your e-mail to".
- The address info@aatworld.com in blue.
- A secondary button "انسخ العنوان" / "Copy address" (shows "تم النسخ" / "Copied").
- A primary button "اكتب الرسالة" / "Write the e-mail" (mailto with subject "اشتراك في النشرة" / "Newsletter subscription").
- No input box in the prototype.

App icon files:
- `img/apps/botim.png`, `imo.png`, `bip.png` (real).
- `img/apps/whatsapp.svg`, `viber.svg`, `line.svg`: the official glyphs from simple-icons 13.21.0 (CC0). Draw each white on its brand colour in a 22 %-radius tile.
- Use them the same way everywhere: contact band, footer, club join, contact page, company panel when it shows AAT's number.

### Footer colophon (every page; ink background; 6 px red rule on top)
1. **Row 1:**
   - The white logo, 220 px, at the inline start.
   - Beside it, the three names: Kufi 700 22 px white "التجارة العربية الآسيوية", Franklin 700 20 px "Arab Asian Trade", Noto Sans TC 700 20 px "中阿商業雜誌".
   - Under them: "تصدر في تايوان منذ 1982 · العدد 560 · أكتوبر 2026" (18 px `--foot-2`).
   - Then `about.claim` (19 px `--foot-2`).
2. **Row 2, three columns:**
   - **الأقسام:** all 8 sections plus من نحن · أعلن معنا · الخصوصية (20 px white links, 44 px rows).
   - **تواصل معنا:** phone (white, Franklin 800 24 px), app icons, e-mail info@aatworld.com (**white, underlined**, never blue on ink), the address in English (LTR, `--foot-2`).
   - **اللغات:** the 5 languages as links.
3. **Row 3:** a 1 px `#3A3A3A` rule, then "© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة" / "© 2026 Arab Asian Trade Group · All rights reserved" (18 px `--foot-2`).

Nothing in the footer is under 18 px. No YouTube.

---

## 6. Site map, routes and page specs

### Routes
All are hash routes. The parser splits on the first "-"; a numeric remainder means an item, any other remainder means a filter or group.

| Route | Page | Notes |
|---|---|---|
| `#home` (also empty hash) | Front page | |
| `#magazine` | المجلة / The issue | cover, contents, pages, advertising positions teaser, about-the-magazine |
| `#flip`, `#flip-NN` | Reading room | opens at page NN (1–12 ship); full screen |
| `#companies`, `#companies-CAT`, `#companies-CC` | دليل الشركات | CAT = `cats` key; CC = origin country slug (`taiwan`, `syria`, `malaysia`…) |
| `#company-NN` | Company page | NN = company id = first page |
| `#exhibitions`, `#exhibitions-CC`, `#exhibitions-CC-FIELD` | معارض دولية | CC = 2-letter code or `all`; FIELD = `fields[].id` |
| `#exhibition-ID` | Show page | |
| `#products`, `#products-CAT` | المنتجات | |
| `#product-NN-K` | Product page | |
| `#modern`, `#modern-GROUP`, `#modern-N` | منتجات وصناعات حديثة | GROUP = `modernGroups[].id` (non-numeric), N = item id (numeric) |
| `#reading` | مقالات وأخبار | one page, three parts |
| `#articles`, `#news` | same page, scrolled to the articles or news part | keep for old links |
| `#article-ID`, `#news-ID` | Reading pages | |
| `#club` | نادي رجال الأعمال | |
| `#about` | من نحن | footer and magazine page |
| `#advertise` | أعلن معنا | footer and magazine page |
| `#contact` | تواصل معنا | |
| `#privacy` | الخصوصية | `i18n.x_privacy`, paragraphs split on "\|" |

- Unknown routes go to `#home`.
- Each route sets `document.title` as "<page> · AAT", resets the scroll to the top, and moves focus to the H1.
- Old routes also map: `#exhibition`, `#club-join` → `#club`.

### HOME — the front page, in order

**1. Masthead.** As §5.

**2. Ticker "منتجات العدد 560" / "Products of issue 560".**
- Source: every product with an `img` (53 in the prototype), ordered by company page.
- Full-bleed band between the section bar and a 1 px hair rule, 148 px tall (phone 124).
- **Title cell** (PC): fixed at the inline start, 280 px wide, paper, with a 3 px ink rule on its inline-end edge; the red square plus the title in Naskh 700 26 px.
- **Phone:** the title becomes a 20 px line above the band.
- **Items:**
  - Width: PC 400 px, phone 300.
  - Picture: PC 112×112, phone 88, contained, in a hair frame.
  - Product name: Franklin 700 19 px, **2-line clamp, ellipsis at the end**.
  - Maker line: real logo 28 px tall plus company name, 18 px 600 ink-2, 1-line clamp with ellipsis at the end.
  - Folio "ص. 7" in red.
  - Hairline between items.
- The whole item links to `#product-NN-K`.
- Motion as in §3. The item order moves toward the inline start (Arabic: items travel to the right; English: to the left).
- **Latin text inside an Arabic item** is a block with `dir="ltr"` and `text-align: right` (Arabic) or `left` (English). The start of a name is never clipped. Never use `white-space: nowrap` with `overflow: hidden` on names.

**3. Front-page columns.**
- 12-column grid, with 1 px hair column rules and 28 px padding.
- PC: 5 / 4 / 3. 961–1180: col A full width, B and C side by side. ≤760: stacked A, B, C.

- **Column A, "في هذا العدد" / "In this issue"** (note: "العدد 560 · أكتوبر 2026").
  - Row: the cover (`magazine.cover`, flat, hair frame, 240 px wide; phone 100 % up to 320) beside the lead block.
  - Lead block:
    - `magazine.coverText` as the H1 lead (30 px Naskh 700)
    - `about.claim` (20 px)
    - primary button "اقرأ العدد 560" → `#flip-1`
    - secondary button "PDF" → `magazine.pdf`, new tab
  - Below: "المحتويات" (H3) with the 13 `toc.articles` as contents rows: title (Naskh 600 19 px), dotted leader, folio. Show the first 8; under them a text button "الفهرس كاملاً" → `#magazine`.
  - English: articles have no English titles. Show the Arabic title in a `<bdi dir=rtl>` Naskh span; the folio stays "p. N".
- **Column B, "معارض دولية" / "International exhibitions"** (note: "1,464 معرضاً").
  - Lead line: "القادمة ابتداءً من يناير 2027" / "Coming up from January 2027".
  - The next **6 dated** shows (non-approx, earliest start). Each is a show row in compact form:
    - date cell 120 px
    - name (Franklin 700 20 px, 2-line clamp)
    - flag 28×19 plus city
    - venue (18 px ink-2, own line)
    - field tag
    - "قريباً" tag when it applies
  - Then H3 "حسب الدولة" / "By country": the **trade line**, 14 countries with shows, sorted by count descending, as a 2-column list of 52 px rows (flag 30×20 · name 19 px Kufi 700 · count Newsreader 700 22 px at the end). Each row links to `#exhibitions-CC`.
  - Foot: secondary button "كل المعارض الدولية · 1,464" → `#exhibitions`.
  - **Afghanistan and Yemen (0 shows) never appear**, and `img/flags/af.png` (a white shahada banner, not the national flag) is **never displayed anywhere**.
- **Column C, "نادي رجال الأعمال" / "AAT Business Club".**
  - The seal (200 px).
  - Then "2,831" (Newsreader 700 64 px) over "عضواً" (Kufi 700 20 px).
  - `club.lead` (20 px).
  - Benefits 1–3 as a numbered list: number in Newsreader 700 26 px red, text 19 px.
  - Primary button "انضم إلى نادي رجال الأعمال" → `#club` (scrolled to the join part).

**4. Figures strip.**
- Full-bleed red band, 40 px padding, no title (it is a strip of facts, not a section).
- 6 equal cells separated by 1 px `rgba(255,255,255,.45)` rules.
- Each cell: number (Newsreader 700 64 px white) above a label (Kufi 700 18 px white, up to 2 lines, centred within its own cell, 20 px side padding so labels never touch the rules).

| Number | ar | en |
|---|---|---|
| 1982 | صدر العدد الأول | First issue |
| 560 | عدداً من المجلة | magazine issues |
| 45 | عاماً في النشر التجاري | years of trade publishing |
| 1,464 | معرضاً دولياً | international exhibitions |
| 2,831 | عضواً في نادي رجال الأعمال | AAT Business Club members |
| 5 | لغات للموقع | website languages |

Phone: a 2×3 grid with figures at 44 px.

**5. "معلنو العدد 560" / "Advertisers of issue 560"** (note: "35 شركة").
- A hairline grid of **all 35** companies as logo cells, in page order. Columns: 7 at ≥1400 px content width, 5 at 961–1399, 3 at 761–960 (35 fills every one evenly).
- Each cell: logo area (or typeset name), Arabic name if `nameAr` (Kufi 700 19 px), Latin name (Franklin 700 18 px, 2-line clamp, LTR block), city (18 px ink-2), folio.
- Phone: one-column rows (logo 64 px at the start, name, city and folio beside it).
- Foot: secondary button "دليل الشركات" → `#companies`.

**6. "مقالات وأخبار" / "Articles & news".**
- Two columns, 7 / 5 (stacked on phone).
- **Articles column:**
  - The lead article: the first fresh article with a picture (Arabic) or the first English article (English site). Picture 2:1 only when shipped, H3 28 px, summary 20 px, meta "بقلم <author> · ص. N".
  - Then 6 headline rows (Naskh 700 20 px plus folio).
- **News column:** 3 news items in the visitor's language first, each a row with a 3:2 thumbnail (only if shipped, 160 px) plus the headline and date when known. Then 3 headline rows.
- Foot: one secondary button "كل المقالات والأخبار" → `#reading`.

**7. "منتجات وصناعات حديثة" / "Modern products & industries"** (note: "40 في 6 مجالات").
- 3×2 hairline grid (phone: 1 column), one cell per `modernGroups`.
- Each cell: one shipped picture of the group (3:2 cover), the group name H3, the count (Newsreader 700 22 px), then 3 item names as links (19 px).
- The cell title links to `#modern-GROUP`.

**8. Contact band, 9. footer.** As §5.

**First-screen checks**
- **1920×950:** ears, masthead, band and bar end at ≈308 px; the ticker ends at ≈456; the three column titles, the cover top and the first show row are visible.
- **1366×768:** column titles visible.
- **390×844:** logo row, band, ticker title, ticker and the "في هذا العدد" title are visible above the tab bar.

### #magazine — المجلة
1. Section front (figure 560).
2. **"العدد 560 · أكتوبر 2026"** (H2):
   - the cover 320 px, flat, plus `magazine.coverText`, `about.claim`
   - primary button "اقرأ العدد 560" → `#flip-1`, secondary button "PDF"
   - a note line "100 صفحة · من تايوان منذ 1982"
3. **"فهرس العدد"** (H2): two columns.
   - Articles: 13 contents rows → `#article-ID`.
   - Advertisers: 45 ad pages grouped by company: folio, company (Arabic name if any plus the Latin name), field. Rows link to `#company-NN`; AudiFeL (no record) is a non-link row.
4. **"صفحات العدد"** (H2): the 12 shipped thumbnails in a hairline grid (6 per row PC, 3 phone), page number under each (18 px). A tap opens `#flip-NN`. Only shipped pages appear.
5. **"أعلن معنا"** (H2): the 6 `advertise.positions` as rows (name · print line), then a secondary button "تفاصيل الإعلان" → `#advertise`.
6. **"عن المجلة"** (H2): `i18n.am_p1` plus a text button "من نحن" → `#about`.

### #flip — the reading room

Full screen over the site: no masthead, no tab bar, no contact band. `--desk` background.

**Top bar** (ink, 64 px):
- white logo 96 px
- "العدد 560 · أكتوبر 2026" (white Kufi 700 18 px)
- the page counter "2–3 / 100" (Franklin 700 20 px, LTR)
- buttons (white on ink, 2 px white border, 48 px tall, 18 px bold): المحتويات · PDF · ملء الشاشة · تكبير · إغلاق
- on phone only المحتويات and إغلاق stay; the rest move into the المحتويات sheet

**Page size:**
- `h = innerHeight − 64 (top) − 72 (bottom)`, `w = h × 1100 / 1555`.
- Two pages side by side when `2w + 2×64 (arrows) + 32 ≤ innerWidth` (and the company panel is closed); otherwise one page.
- The whole page is always visible, never cropped. This is the owner's rule.

**Spreads** (RTL book, as printed): [1], [2|3], [4|5]…, the **lower page number on the right**. Same order in every language.

**Controls:**
- 64 px arrow buttons at both sides, outside the pages. In RTL "next" is the left arrow.
- Keyboard arrows, swipe on touch, and click on the outer half of a page turn pages.
- **Bottom bar** (72 px, ink): a page-jump field "الصفحة" (number input 1–100, 48 px) with a button "اذهب"; on PC also the 12 thumbnails strip.
- **Zoom:** "تكبير" toggles 2× on the current page. Drag pans; "تصغير" returns.
- **Fullscreen** uses the Fullscreen API.
- **Contents drawer** (inline-end side on PC, 420 px; full sheet on phone): the 13 articles and 45 ad pages with folios. A tap on a shipped page goes to it. A tap on a page beyond 12 opens the article page or the company panel instead (prototype). Nothing shows a placeholder page.
- **End of the prototype:** after page 12 the next arrow opens one end panel on the desk: "اقرأ العدد كاملاً بصيغة PDF" (H2 white-on-ink box, 28 px) with the PDF primary button and "الفهرس" secondary button. This is a real action, not a placeholder.

**Advertiser pages** (`magazine.companyPages`): a tap on such a page **opens the company panel and never changes the page**.
- PC: the panel is 440 px at the inline-end side; the spread recalculates to one page if two no longer fit.
- Phone: a bottom sheet at 75 % height.
- Panel contents: 3 px rule header with folio and field; logo; Arabic and Latin name; city; about (visitor's language); up to 4 product rows (picture only if shipped); contact facts (phone LTR, WhatsApp, e-mail and web in blue); buttons "صفحة الشركة" → `#company-NN` (secondary) and "إغلاق".
- A hover hint (PC) on ad pages: a 3 px red outline around the page. No text overlay on the page.

**URL:** `#flip-NN` updates (`replaceState`) as pages turn.

### #companies — دليل الشركات
1. Section front (35).
2. Filters: two rows of chips.
   - **الدولة:** "كل الدول 35" plus origin countries derived from `city.en` after the last comma, cut at " · ": Taiwan 20 · Syria 5 · Malaysia 4 · UAE · Indonesia · Turkey · India · Saudi Arabia · Pakistan. Arabic names from `city.ar`'s last part. Flags only where a shipped flag exists (no India flag file, so no flag; never a placeholder).
   - **المجال:** "كل المجالات" plus the 13 `cats` with counts.
   - On phone the two chip rows are horizontally scrollable with a visible scrollbar.
3. One section per field when no filter is set (H2 = field name, note = count). The grid is the logo-cell grid from home, plus a line "4 منتجات" (18 px) when the company has products.
4. Rows link to `#company-NN`.

### #company-NN — company page
1. Section front: H1 = Arabic name (if any) over the Latin name (Franklin 700 40 px, LTR block); the lead is the city; figure box = folio.
2. A two-column row:
   - **start:** the logo cell (240 px, or the typeset name) plus `about` (visitor's language, fallback en→ar) plus `certs`
   - **end (contact card, 2 px ink frame):** phones (each `tel:`, LTR), WhatsApp button (if `whatsapp`), e-mail and web in blue, address (as given, LTR when Latin)
3. **"منتجات الشركة"** (H2, count): product cells grid. Cells without a picture appear as text rows below the grid.
4. **"في المجلة"** (H2): its pages, as shipped thumbnails (→ `#flip-NN`) and, for unshipped pages, folio rows linking to `#flip` contents (no image box).
5. **"من موقع الشركة"** (H2), only when `site` exists: its sections (English, LTR blocks, H3 per section, lists as rows).
6. Foot: secondary button "دليل الشركات".

### #exhibitions — معارض دولية (calendar of fairs)

1. **Section front** (figure = filtered count; label follows the filter).

2. **PC layout:**
   - A **side column** of 340 px at the inline start, sticky under the section bar, with its own scroll. It holds:
     - a search input "ابحث باسم المعرض أو المدينة" / "Search by show name or city" (matches the English name, `city.en` and `city.ar`, and the Arabic spellings the assistant knows)
     - the H3 "الدولة": "كل الدول 1,464" then the 14 countries by count, as 52 px rows (flag 30×20, name 19 px Kufi 700, count Franklin 700); selected = ink fill, white text
     - the H3 "المجال": "كل المجالات" then the 18 `fields` with counts (counts recompute for the chosen country; fields with 0 are shown disabled at ink-2, not hidden, so the list never jumps)
   - The **main column:**
     - a **month strip**: horizontally scrollable tabs for every month that has shows ("يناير 2027 · 98"), 48 px; a tap scrolls to that month
     - the **calendar**

3. **Phone layout:**
   - Under the section front: the search input, then two full-width secondary buttons side by side, "الدولة: كل الدول" and "المجال: كل المجالات" (each shows the current choice).
   - Each opens a full-screen sheet of 56 px rows with flags and counts, plus an "إلغاء التصفية" button.
   - The month strip stays.

4. **Calendar:**
   - Grouped by month (start date). Each month opens with a **month bar**: ink, white Kufi 700 22 px, "مارس 2027 · 46 معرضاً". It is sticky below the section bar while that month scrolls.
   - **Row grid** (PC): `date 150px | show 1fr | place 300px | field 220px`.
     - **date cell:** day range in Kufi or Franklin 800, 26 px, LTR isolated ("11–13"; across months "28 فبراير – 3 مارس" on two lines), over the month and year in 18 px.
     - **show:** name in Franklin 700 20 px (LTR block, 2 lines max, ellipsis at end), then the "قريباً" tag when it applies, then for the 4 Taiwan shows with `summary` one line of summary in 18 px.
     - **place:** flag 28×19 plus city (Arabic `city.ar` when present, else `city.en` LTR) in 19 px; under it the venue in 18 px ink-2, LTR block. Parts that are null are omitted; no separators are left behind.
     - **field:** the field tag (`fields[].ar/en`).
   - **Month-only shows** (`approx: 1`, 999 rows) come **at the end of their month**, after the dated rows, under a 1 px ink rule. Their date cell shows only the month name ("مارس" 24 px over "2027"). No day, no "الشهر فقط", no highlight colour.
   - Sort by start, then name.
   - **Tablet and phone:** rows stack. Line 1: date (day range plus month, one line, 22 px), plus the tags. Line 2: name. Line 3: flag, city · venue. The field tag stays.
   - **Rendering:** build month blocks lazily (IntersectionObserver on a sentinel), at most about 60 rows per batch. Never 1,464 rows at first paint. Filtering re-renders from the in-memory index, debounced at 150 ms. The exhibitions page must be interactive in under 1 s on a 4× throttled CPU.
   - A row links to `#exhibition-ID`.

5. **Routes:** `#exhibitions-ae` preselects the country; `#exhibitions-all-food-and-beverage` preselects the field. Changing filters updates the hash with `replaceState`.

### #exhibition-ID — show page
1. Section front: H1 = name (Franklin 700 44 px, LTR block); figure box = date (or month); label = flag plus country.
2. A **facts list** (definition rows, hairlines). Show only known rows:
   - التاريخ
   - الدولة
   - المدينة
   - مكان المعرض (venue)
   - المجال (field)
   - القطاع (`sector`, English, LTR)
   - for the 4 Taiwan shows: نبذة (`summary`), المحاور (`themes`), الموقع (`web`, blue)
   - No organizer row and no EventsEye link.
3. **"معارض أخرى في <city>"** (H2): up to 6 rows, only when the city has others.
4. **"معارض أخرى في <month> في مجال <field>"** (H2): up to 6 rows.
5. Foot: secondary button "كل المعارض الدولية".

### #products — المنتجات
1. Section front (127).
2. A search input "ابحث عن منتج أو شركة" plus the PC side index.
   - The side index (300 px, sticky) lists the 13 `cats` with counts (only cats that have products), then the H3 "منتجات وصناعات حديثة" with the 6 groups and counts (links to `#modern-GROUP`).
   - Phone: the index becomes a horizontally scrollable chip row.
3. **One section per cat** (H2 = cat name, note = count):
   - **Pictured products** in a hairline grid (`repeat(auto-fill, minmax(260px,1fr))`; phone 2 columns). Each cell: picture square (contain), name (Franklin 700 19 px, 2-line clamp, LTR block), maker (logo 24 px plus name 18 px ink-2), folio.
   - **Products without a shipped picture** follow as **rows** under the grid: name · maker · folio. No picture box.
   - `#products-CAT` scrolls to and highlights that section (3 px red rule instead of ink).
4. Foot: the section "منتجات وصناعات حديثة" teaser (as home section 7) → `#modern`.

### #product-NN-K — product page
1. Section front: H1 = product name (LTR block when Latin); figure box = folio.
2. Two columns: the picture (only if shipped, contain, max 560 px, hair frame) and the text block.
   - Text block: maker row (logo, name, city → `#company-NN`); description in the visitor's language (fallback en→ar; hidden if null).
   - Buttons: primary "صفحة الشركة" → `#company-NN`; secondary "اسأل AAT عن هذا المنتج" opens WhatsApp to AAT's number with the text "مرحباً AAT، أسأل عن: <product> (<company>)" (en: "Hello AAT, I am asking about: …").
   - The maker's own product page (`url`) appears as a blue link line "صفحة المنتج على موقع الشركة".
3. **"منتجات أخرى من <company>"** (H2): product cells or rows.

### #modern — منتجات وصناعات حديثة
1. Section front (40).
2. Six sections (H2 = group name, note = count), in `modernGroups` order.
   - Items in a hairline grid of cells (`minmax(320px,1fr)`).
   - Cell: picture 3:2 cover (only if shipped), Arabic name (Naskh 700 22 px), English name (Franklin 600 18 px, LTR), `description.ar` (or English name only on en) as a 3-line clamp at 19 px.
   - Cells without a picture keep the same text layout with no picture box.
3. `#modern-GROUP` scrolls to that section.

### #modern-N — item page
- Section front without a figure box: H1 Arabic name, lead = English name.
- Picture if shipped.
- `sections[]` rendered as H3 plus paragraphs or rows.
- **"للتواصل"** (H2): `contact.emails` and `urls` in blue, `phones` LTR `tel:`.
- English and other languages: the Arabic text shows as an RTL block in Naskh under an English line "This page is available in Arabic" (a real statement of fact), with the name in English.

### #reading — مقالات وأخبار
1. Section front (figure = items listed).
2. Three parts, each a section:
   - **"مقالات العدد 560"**: the 13 fresh articles, Arabic site only. The lead item has the picture; the others are rows: picture thumbnail only if shipped (3:2, 200 px), headline, summary 2 lines, "بقلم <author>", folio.
   - **"مقالات من أعداد سابقة"** / "Articles from past issues": the 24 older articles in the visitor's language (Arabic: all 24 have Arabic; English: those with English).
   - **"الأخبار"** / "News": 26 items, the visitor's language first; date when known.
3. On the English site the first part is "From issue 560 (in Arabic)": rows with Arabic titles in RTL blocks, so the issue stays reachable.

### #article-ID and #news-ID — reading pages
- Section front: H1 (Naskh 700 48 px, PC); lead = summary; figure box = folio (fresh articles) or date (news); otherwise none.
- Meta line (18 px ink-2): "بقلم <author>" · "العدد 560 · ص. N" · source (news). Only known parts.
- A picture 2:1 at the text width, only if shipped.
- **Reading column:** max 760 px (Arabic about 70 characters, English about 72), on the inline start side of the 12-column grid.
  - The end side (PC ≥1181) holds a 320 px sticky aside: "في هذا العدد" with 6 other article rows, and for fresh articles a "شاهدها في المجلة" button → `#flip-N` (only if N ≤ 12) or "PDF".
  - Text: 22 px Naskh 500, line height 2.0, 28 px between paragraphs.
  - "## " sub-heads: H3 29 px Naskh 700, 40 px above.
  - Latin runs are isolated. Lists are rows.
- Foot: "مقالات أخرى" (H2) with 4 rows, then the secondary button "كل المقالات والأخبار".

### #club — نادي رجال الأعمال
1. Section front: H1 `club.name`; lead `club.lead`; figure box 2,831.
2. **"أهداف نادي رجال الأعمال"** (H2): a two-column row, the seal (240 px) at the start and `goals.p1` and `p2` (20 px) at the end.
3. **"مزايا الأعضاء"** (H2, `club.benefitsTitle`): an ordered list of the **8 benefits**. Each item is a row: number "01"…"08" in Newsreader 700 32 px red, then the text in 20 px. Two columns on PC (1–4, 5–8), one on phone.
4. **"شركاء النادي"** (H2): `partners.text`.
5. **"سجل الأعضاء"** (H2, note "2,831 عضواً"):
   - A search input "ابحث بالاسم".
   - Names in newspaper columns (4 PC, 2 tablet, 1 phone), 19 px, hairline rows.
   - Show 300, then a secondary button "عرض 300 اسماً آخر" (the count is real). The search filters all 2,831.
6. **"دراسات أولية لمشاريع صناعية"** (H2, `turnkey.ar.title`):
   - `intro` paragraphs, the includes list as rows.
   - `groups` as collapsible blocks: a `<details>` with a 56 px summary row, the group name in 21 px Naskh 700 and a count; projects as rows.
   - English: an English H2 "Industrial project studies", a line "Details are available in Arabic", and the Arabic blocks in RTL.
7. **"للانضمام"** (H2, `join.title`):
   - phone 40 px, the WhatsApp primary button with `join.message`, the app icons, `clubEmail` in blue (mailto)
   - all on one row on PC, stacked on phone

### #about — من نحن
1. Section front (1982).
2. The old WordPress text **word for word** (`about.paragraphs`), 20 px, max 760 px column. The aside holds the founder line "أسّسها السيد محمد مروان فتال في تايوان عام 1982" (`i18n.ab4`), the figures 1982 · 560 · 45 as three figure rows, and `about.claim`.
3. **"المجلة"** (H2): `i18n.am_p1`–`am_p3`. No CEO name (unconfirmed).

### #advertise — أعلن معنا
1. Section front (560 issues).
2. Lead `i18n.ad_lead`.
3. **"المواقع الإعلانية"** (H2): the 6 positions as rows in order. Each row: name (H3), print line, web benefits as a bulleted row list, and an example company's real logo cell when `exampleCompanyId` has a logo.
4. **`digital.title`** (H2) plus text.
5. **`contactTitle`** (H2): phone, WhatsApp primary button with `advertise.message`, app icons, e-mail.
- No prices. `services` and `plans` are **not used**.

### #contact — تواصل معنا
1. Section front (phone number).
2. The three contact-band columns, larger: phone 44 px, app icons 56 px tiles, e-mails info@ and marwan@ (`editorEmail`, label "رئيس التحرير / Editor"), the address in English, the newsletter column.
3. **"اسأل AAT"** (H2): one line plus a primary button that opens the assistant.
4. The contact band is not repeated below.

### Assistant (search and chat in one)
- **Panel:** PC 480 px at the left edge, full height, with a scrim; phone full screen.
- **Header:** a 3 px ink rule, "مساعد AAT · محادثة 24 ساعة" (H3), and "إغلاق".
- `config.assistant.hello` as the first message.
- Messages in Naskh 500 20 px:
  - The visitor's messages are ink text on a `--desk` block at the inline end.
  - Answers sit on paper at the inline start.
- Input 56 px plus a primary button "أرسل". Suggested question chips under the hello: "معارض الإمارات في مارس" · "شركات تايوان" · "آلات التغليف" · "كيف أعلن؟".
- **Answers come from site content only.** Port the matching logic of `/home/user/AATWORLD-1/assets/js/assistant.js`:
  - shows by country, city, month, field or name, including Arabic spellings of famous shows
  - companies, products, modern items, articles, news, `faqs`, contact, advertising, club, magazine, about
- Answers render as the **same components**: compact show rows, company cells, product rows, headline rows. Maximum 6, then one secondary button "عرض الكل في <page>" that goes to the filtered route (e.g. `#exhibitions-ae`) and closes the panel.
- No AI disclaimer and no "thinking" text; the answer is immediate.
- Nothing under 16 px.

---

## 7. RTL and languages
- `<html lang="ar" dir="rtl">` by default. Switching sets `lang` and `dir` (`ar` = rtl; en, zh-TW, zh-CN, ms = ltr) and re-renders the current route without a reload.
- Store the choice in `localStorage['aat3.lang']`, with every access in try/catch; the page works without it.
- **Logical CSS only:** `margin-inline-*`, `padding-inline-*`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`. Mirroring is automatic. Never write `left`/`right` except for:
  - the physically-left assistant tab and panel
  - `text-align: right` inside LTR Latin blocks on the Arabic site
- **Latin inside Arabic:** every company, product, show, venue and sector name, phone number, e-mail, URL and the address goes in `<bdi dir="ltr" class="lt">` (inline) or a `dir="ltr"` block (when it can wrap or clamp), set in Libre Franklin. Day ranges ("11–13"), years and folio numbers are isolated the same way, so "11–13" and "+886 966 404681" never flip.
  - Run a check script that finds text nodes containing Latin letters outside `.lt` or `[dir=ltr]` inside `[dir=rtl]`; it must report 0.
- **Arabic inside English** (group name, Arabic article titles) goes in `<bdi dir="rtl">` set in Naskh.
- **Clamping:** use `-webkit-line-clamp` on a block whose `dir` matches its text, so the ellipsis is always at the end. Never `text-overflow` on an RTL container holding LTR text. Never clip the start.
- **Arrows and chevrons:** CSS-drawn, flipped by `[dir=rtl]`. Ticks, the magnifier and phone icons never flip.
- **Numbers:** Western digits, thousands comma (1,464), en dash for ranges.
- **Arabic months:** يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر. English uses full month names ("11–13 January 2027").
- **Arabic plural forms:** use the counts' noun forms given in this brief: معرضاً، شركة، منتجاً، عضواً.
- **English is a first-class site,** not a translation layer:
  - Newsreader headlines and text, Franklin UI.
  - The nameplate band and footer show all three names.
  - Content without English: fresh articles, 13 Arabic-only news, modern bodies, turnkey. These are shown in Arabic RTL blocks with a factual English label, never hidden silently and never machine-translated.
- **zh-TW, zh-CN and ms:**
  - UI strings come from `i18n[lang]`.
  - Content uses `tx` (English → translation) where available, else English, else Arabic.
  - Layout is LTR with the English type, Chinese in Noto Sans TC/SC (loaded on demand) at the same sizes (Chinese body 19 px, line height 1.8).
- **The Taiwan address** is always the English string, LTR, in every language.

---

## 8. Copy rules
- **Owner's exact wording, everywhere:**
  - "نادي رجال الأعمال" (never "نادي الأعمال"); English "AAT Business Club"
  - "مجموعة التجارة العربية الآسيوية" (never "مجموعة AAT")
  - "معارض دولية" for the section (never التقويم or calendar in visible text); English "International exhibitions"
  - "التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌" as the names
  - "اسأل AAT · محادثة 24 ساعة" for the assistant
  - "دليل الشركات" / "Company directory"; "مقالات وأخبار" / "Articles & news"
- **Address:** "P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C." always in English. Phone "+886 966 404681". E-mail info@aatworld.com (editor: marwan@aatworld.com; club: `config.clubEmail`).
- **Tone:** formal, inviting, short. Facts before adjectives ("1,464 معرضاً في 14 دولة", "ص. 18"). No marketing-app slogans like "اعثر على ... في ثوانٍ", no exclamation marks, no emojis.
- **One title per section.** No small kicker labels above headings. Do not use the `*_kicker` i18n keys as visible text. No "see all" links beside titles.
- **No placeholder text:** no TBA, "to be announced", "يُعلن لاحقاً", "قريباً" as a stand-in for missing data, "الشهر فقط", "approx", "coming soon", "—". Unknown is hidden.
- **Counts are exact** and from the data:
  - shows: 1,464 in **14** countries that have shows (the site covers 16; Afghanistan and Yemen have none)
  - 35 advertisers, 127 products from 28 companies, 40 modern items, 2,831 members
  - the cover text's "36 معلناً" stays as printed
- **No links or credit to EventsEye** or other sources. No "Brands you can trust" partner strip (files not available).
- **Blue only for web and e-mail addresses** on paper or desk.

---

## 9. Don't (the owner rejected these, or the judges caught them)
1. No text under 16 px; no grey thin secondary text; no Naskh at 400 for body.
2. No floating pill menu, no hamburger-only phone menu, no section bar wrapping into 4 rows on phone.
3. No red gradient banners, gradients of any kind, shadows, rounded cards, pills, cream bands, tilted cover, giant decorative "45", dotted map, sector photo tiles.
4. No navy, teal, gold/brass, near-black hero, or yellow highlighter. The colours are those in §3, nothing else.
5. No swash, swoosh or hooked-pair symbol or pattern; no redrawn logos; no seal with invented text ("AATBC", "TAIPEI", "TAIWAN · SINCE 1982"); no upside-down ring text.
6. No generic glyph buttons for WhatsApp, Viber or LINE: use the real app icons.
7. No Taliban banner (`img/flags/af.png`) anywhere; no country with 0 shows in any chooser.
8. No Latin names clipped at the start, no ellipsis at the wrong end, no flipped word order in RTL, no dangling "·".
9. No floating chat button over content; no element covering headings, counts or the cover at any width.
10. No half-empty sections or white voids: grids sized to fill (35 = 7×5); no lone card in a wide band.
11. No duplicate actions (two "كل المعارض الدولية" buttons in one section); no two search fields on one screen.
12. No dark mode, no YouTube, no splash or intro, no layout jump after first paint, no reveal-on-scroll, no counting numbers.
13. No "تواصل" form that pretends to send; no newsletter input in the prototype (address plus copy button instead).
14. No prices, plans or services lists; no CEO name.
15. No placeholder images. An item without a shipped picture has no picture box.

---

## 10. mustFix → where it is resolved

| mustFix (judges) | Resolved in |
|---|---|
| RTL clipping and ellipsis of Latin names in the ticker, grids and cards | §6 ticker, §4 logo cells, §7 clamping rule plus the check script |
| Restructure visible in the menu (directory, merged reading, about/advertise out) | §0.2, §5 section bar, §6 routes |
| Phone first screen (no 4-row bar; ticker visible) | §5 phone header plus bottom tab bar, §6 first-screen checks |
| Real app icons; no redrawn seal | §5 app icon files (`img/apps/whatsapp.svg`, `viber.svg`, `line.svg` added), §2 clubMark |
| Weak-eyesight pass (secondary 18 px, darker ink-2, Naskh 500) | §3 colours (`--ink-2` #363636) and type scale |
| Warmer, redder opening | §2 nameplate band, §5 ink bar with red active block, §6 red figures strip, §4 red figure box on every inner page |
| Layout gaps (lone company card, half-empty newsletter) | removed from home; §5 contact band in 3 columns; §4 grid sizing |
| Chat tab overlaps | §5 assistant entry (no floating button below 1700 px; tab bar slot on phone; bottom padding) |
| Tighten the first PC screen (masthead ≈490 → ≈308 px) | §5 header heights, logo 300 px |
| Folio readability (≥18 px bold) | §3 type scale and the red-on-desk rule |
| English nav wrap at 1366 | §5 section bar (wraps to 2 rows, measured, never hidden) |
| Country counts link to `#exhibitions-CC`; field on every row; month-only at the end of the month; per-month rendering | §6 home column B and #exhibitions |
| Reading room: fit to height, two pages only when both fit, ad tap opens the panel | §6 #flip |
| Seal ring text upside-down | §2: the approved clubMark arcs read upright |
| Afghanistan flag | §6 home column B, §9.7 |

**Builders' QA, before saying done** (from the aat-web skill):
- Screenshots of every route in ar and en at 1920, 1366, 1100, 960 and 390. Look at them yourself.
- 0 page errors.
- An automated scan for text under 16 px, text pairs not in §3, Latin outside `bdi`, empty boxes and broken images.
- The image sample stays under 180 files and 8 MB (now 162 files).
