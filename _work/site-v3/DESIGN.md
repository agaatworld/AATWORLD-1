# AAT site v3 — BINDING DESIGN BRIEF: "Trade Bridge" (جسر التجارة)

This brief is binding for every builder. It **replaces** `DESIGN-gazette.md` completely. The owner rejected the gazette identity on 22 Oct 2026: "I HATE IT … WHAT A USELESS TASK … I WANT TO REDO TO BE BETTER, DIFFERENT, ATTRACTIVE, LIFE-CHANGING, NOT DULL!" He praised the other three concept tiles: "THE OTHER 3 PICTURES FOR THE WEB ARE VERY GOOD. CONTINUE AND IMPROVE!" Do not reuse anything from the gazette identity: the white newspaper look, black-only ink, serif Naskh or Newsreader, hairline grids instead of cards, the centred masthead logo, the "no shadows, no rounded corners" rules. Only the gazette's *structure* survives (site map, routes, page contents, phone tab bar, contact band, assistant, RTL and copy rules), rewritten here in the new identity.

Do not reuse CSS, class names or markup from today's `assets/css/app.css` either. Build fresh.

When this brief is silent, choose what fits the idea: **a dark navy board that welcomes, white boards that work, red where you act, real pictures everywhere, big type.**

**Inputs**
- Content: `/home/user/AATWORLD-1/_work/site-v3/data/data.json` (schema in `data/README.md`). Every text and number on the site comes from it, plus the UI strings defined in §8.
- Pictures: `/home/user/AATWORLD-1/_work/site-v3/img/` (prototype sample; paths in data.json are relative to it).
- Style tile (the visual reference; when it and this text disagree, this text wins): `concepts/fusion/tile-ar.html`, `tile-en.html`, built by `concepts/fusion/build_tile.js` + `tile.css` from data.json. Screenshots `tile-ar-1920.png`, `tile-en-1920.png`, `tile-ar-1366.png`, `tile-ar-1100.png`, `tile-ar-390.png`, `tile-en-390.png`, `tile-ar-full.png`, `tile-en-full.png`, `tile-ar-390-full.png`; `ref-vs-new.png` (today vs new, 1366×768). Checks: `node shoot.js` (smallest text, fonts loaded, broken images, sideways overflow, loose Latin in RTL, any `af.png`).
- The three liked concepts: `concepts/exchange/` ("The Trade Floor"), `concepts/club/` ("The Business Club"), `concepts/bridge/` ("Asia ↔ Arabia"). Rejected: `concepts/gazette/`.
- Owner rules: `/home/user/AATWORLD-1/CLAUDE.md` and `/home/user/AATWORLD-1/.claude/skills/aat-web/SKILL.md`.

---

## 0. What is different from today, and what was kept

### 0.1 What the owner must see in 3 seconds

Today (`concepts/gazette/ref-home-ar.png`): a floating white pill menu over a shelf of tall gradient cards, then a red gradient banner with a giant "45 عاماً" and a tilted cover.

New (`concepts/fusion/tile-ar-1920.png`):
1. **A red trilingual ribbon** on top: التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌, with the issue line "العدد 560 · أكتوبر 2026".
2. **A white masthead row** with the big red AAT logo, the group name and the magazine's own tagline, the phone number in a red call button, the "English" and "اللغات" buttons and a red "محادثة 24 ساعة" button.
3. **A dark navy menu bar** with the 8 sections across the full width, the current one marked by a red bar.
4. **A deep navy opening board**, lit from inside, with the huge white two-line headline **من مصانع آسيا / إلى أسواق العرب وأفريقيا** and its English twin, a big white search field with a red "ابحث" button, four white counter boards with red top edges (1,464 · 35 · 127 · 2,831), a large real factory photograph in a white frame, and the issue 560 cover on a white board with a red stamp "العدد 560" and the buttons "اقرأ العدد" and "PDF".
5. **The trade line** across the bottom of the board: 14 flags on a line, each with its number of shows, with a light that travels from Taiwan to Algeria.
6. **Bands that alternate** dark navy → white → light floor → dark navy all the way down, with framed white cards that lift when touched, real photographs, a moving product conveyor and the club seal with gold figures.

Nothing of today's look remains: no floating pill, no gradient cards, no red gradient banner, no giant "45", no tilted cover.

### 0.2 Kept from the three tiles the owner liked

| From | Kept (and where) |
|---|---|
| **The Trade Floor** (exchange) | The dark navy opening board with a big white Arabic headline (§4.4, §6 home 1); the big search field with the red button (§6 home 1); the four counters on white boards with red top edges (§2 motif 3); the issue 560 cover on a white board with a red stamp and "اقرأ العدد" + "PDF" (§2 motif 4); the navy menu bar with the red active bar (§5.1); the departure-board list of shows with a navy header row (§4.9); the company directory as a first-class section (§6 #companies); the merged "مقالات وأخبار"; the phone bottom tab bar (§5.3); the red stamp on pages and products. |
| **Asia ↔ Arabia** (bridge) | The headline "من مصانع آسيا إلى أسواق العرب وأفريقيا" with its English twin line (§8.2); the large real factory photograph in a white frame with a caption (§2 motif 6); the flag trade line with show counts that links to each country's shows (§2 motif 2); the date stamp for shows (§2 motif 5); Changa + Readex Pro, each carrying Arabic and Latin in one voice (§3.3); the warm photographic feel: real products, factories and article pictures, never stock or AI pictures; the real app icons. |
| **The Business Club** | The red trilingual ribbon on top of every page (§5.1); the formal tone: the group name and the magazine tagline beside the logo, an invitation to join as a first-rank button; the round club seal (the owner-approved `clubMark()`, §2 motif 7); the big figures in one warm accent, brass, on the dark club band (2,831 · 45 · 560 · 1982); red primary + outlined secondary buttons. |

What was **not** kept: the gazette's white newspaper, serifs and hairlines (rejected); three different dark grounds across the tiles (navy, teal and near-black ink): there is now one dark ground, navy; the club tile's invented seal ring text ("TAIPEI · SINCE 1982"); the bridge tile's Afghanistan banner and Yemen stop with no count; the exchange tile's yellow highlighter and "الشهر فقط"; the floating chat pill that covered content.

---

## 1. Concept

**"Trade Bridge" (جسر التجارة).** AAT's own words: "جسر بين الأعمال العربية والآسيوية منذ 1982" (`i18n.am_title`). The site is that bridge, built as a lit trade hall:
- every page opens on a **deep navy board** that welcomes the visitor with a big white headline, a fact in large figures and a real picture or the seal;
- the work happens on **white boards and cards** that sit on alternating white and light bands, framed and lifted with a soft shadow, so each part of the page is a visible object;
- **red** marks where the visitor acts and where he is: the logo, the ribbon, buttons, the active menu item, the counters' top edges, the stamps, the bar under every title;
- the **trade line** of 14 flags with real counts and the **moving product conveyor** show that trade flows from Asia's factories to Arab and African markets;
- the **magazine** is present everywhere: the cover on the opening board, page stamps on every product and company, an open spread on the home page.

The memorable idea in one picture: **the navy board with the white headline, the framed factory photograph, the stamped issue cover, and the line of flags with a light travelling along it.**

---

## 2. Identity

### 2.1 Logo
The only mark is the full red script logo "AAT · Ideas For Business". Never redraw, recolour (except the supplied white file), crop, rotate or shadow it.

| Place | File | Size |
|---|---|---|
| Masthead row, inline start (PC) | `img/brand/aat-logo-red.svg` on white | 64 px tall (≈192 px wide) |
| Masthead row (phone) | same | 46 px tall |
| Inside the club seal | same, in the white centre | 96 × 32 in the 200-unit seal |
| Reader top bar | `img/brand/aat-logo-white.svg` on navy | 40 px tall |
| Footer | white logo on navy | 216 px wide (phone 180) |
| Favicon / app icon | white logo centred on a solid `--red` square | 32 / 180 px |

The logo always sits on white, except the white logo on navy. Never on a photograph, never red on navy (2.98:1). The tagline "Ideas For Business" lives only inside the logo.

### 2.2 Motifs (all from AAT's own world)
1. **The navy board.** Every page opens with it (§4.4). Navy `--night` with two soft light pools (a blue one behind the picture side, a faint red one at the bottom corner of the picture side) so it is never a flat dark block. White headline in Changa 800 with an 8 × 120 px red bar under it.
2. **The trade line.** 14 flags (3:2, 2 px white frame, 4 px radius, soft shadow) on a 3 px line, in route order **Taiwan → Indonesia → Malaysia → Pakistan → Oman → UAE → Qatar → Kuwait → Saudi Arabia → Iraq → Syria → Türkiye → Egypt → Algeria**; each stop = flag + country name + "125 معرضاً". Each stop links to `#exhibitions-<cc>`. A white light with a red ring travels along the line from Taiwan to Algeria (9 s loop). Caption above with a pulsing red dot: "خط التجارة: 14 دولة · 1,464 معرضاً دولياً من يناير 2027". **Afghanistan and Yemen (0 shows) are never stops, and `img/flags/af.png` is never displayed.**
3. **The counter board.** A white board, 8 px radius, 6 px `--red` top edge, shadow `--sh-n` on navy: big figure (Changa 800 navy), label (Readex Pro 700), sub-line (`--muted`). Used for the four home counters and the facts on inner boards that need more than one figure.
4. **The stamp.** A red outlined box (3 px `--red`, 6 px radius, Changa 800), rotated 4° (−4° in LTR): "العدد 560" on the cover board; "ص. 7" on every product card; "ص. 18–19" on every company card. It always means "printed on this page of issue 560".
5. **The date stamp.** A filled `--night` tile, 10 px radius: the day range in Changa 800 white ("11–13"), the month and year under it in `--mist` ("يناير 2027"). Month-only shows: the month name in the big line and the year under it, nothing else.
6. **The framed photograph.** Real pictures only, in a white frame (10 px padding, 14 px radius, `--sh-n` on navy / `--sh-1` on light) with a caption label (white box, 5 px red start edge): what it shows and where ("خلاط صحي · ماليزيا" / "منتجات وصناعات حديثة"). The opening photograph drifts very slowly (scale 1 → 1.06 over 26 s, alternate); nothing else in it moves.
7. **The club seal.** The owner-approved `clubMark()` from `/home/user/AATWORLD-1/assets/js/views.js` (lines 257–269), ported as it is: red disc, white ring line, "BUSINESS CLUB" on the top arc, "نادي رجال الأعمال" on the bottom arc (both upright), white dots at 9 and 3 o'clock, a briefcase, the real red logo in the white centre, three red stars. Ring text in Changa 800/700. Never add or change ring text (no "AATBC", "TAIPEI", "TAIWAN", "SINCE 1982"). Render at **≥ 220 px** so the ring text stays ≥ 18 px; on navy add `filter: drop-shadow(0 18px 36px rgba(0,0,0,.45))`. Used on the home club band (320 px), the club page board (300 px), the join confirmation; never on product or exhibition pages.
8. **The red title bar.** Every section title (H2) has a 72 × 6 px `--red` bar under it, 12 px below the text, at the inline start (the owner asked for "the red bar" under every section title in update 34). The home H1 has the bigger 120 × 8 px bar.

### 2.3 Photography rules
- Only real pictures from `img/` (products, modern industries, article and news pictures, magazine pages, the cover, logos, flags, app icons). No stock, no AI pictures, no sector tiles borrowed from unrelated items.
- Big where the sample has a good one: the home opening uses `img/modern/m5.jpg` (Astral Venture, Klang, Malaysia: a worker at a sanitary mixer, 1000×528). Modern-industry cards use a photo per group (§6 home 7). Articles and news use their own pictures.
- Products and logos are `contain` on white (never cropped); photographs are `cover`.
- An item without a shipped picture has **no picture box** (never a grey placeholder).

### 2.4 Forbidden in the identity
- the swash, swoosh or hooked-pair symbol and its pattern (owner removed it on 19 Oct)
- red gradient banners, red backgrounds behind paragraphs, gradient cards
- a second dark colour (teal/deep sea, near-black ink): navy is the only dark ground
- brass anywhere except big figures on navy
- serif fonts, hairline-only layouts, a centred masthead logo
- a tilted cover, the giant decorative "45", the dotted trade map, sector photo tiles
- redrawn logos or seals with invented text; the Taliban banner `af.png`
- dark mode, YouTube

---

## 3. Tokens

Put these in `:root` with these exact names. Light theme only (`color-scheme: light`, no `prefers-color-scheme` rules).

### 3.1 Colours

| Token | Hex | Role |
|---|---|---|
| `--night` | `#0B2341` | **The one dark ground**: opening boards, the issue band, the club band, the footer, the board header row, date stamps, filled navy buttons, the phone tab bar. Also the text colour (`--ink` = same hex). |
| `--night-2` | `#163A63` | The menu bar, raised panels and chips on navy, the page-number chips in the issue band, month bars in the exhibitions list, hover on navy. |
| `--night-line` | `#2E527D` | Rules and dividers on navy (decorative, never text). |
| `--mist` | `#C9D6E8` | Secondary text on navy (leads, sub-lines, captions, footer secondary). |
| `--brass` | `#E2BC6A` | **Only** big figures (≥ 44 px, Changa 800) on `--night`: the club band figures and the brass figure of every inner opening board. Never on light backgrounds, never for text. |
| `--red` | `#D21F26` | The logo red: ribbon, primary buttons, the active menu bar, counters' top edges, title bars, stamps, the trade-line light ring, the "اسأل AAT" tab, contact card top edges, the footer's top rule. |
| `--red-deep` | `#A8161C` | Hover and pressed red. |
| `--paper` | `#FFFFFF` | Page background, white bands, boards, cards, inputs, the masthead row. |
| `--floor` | `#EEF3F8` | The light band (alternating), chip and tag fill, row hover. Cool, not cream. |
| `--ink` | `#0B2341` | All text on light backgrounds (same hex as `--night`). |
| `--muted` | `#43546B` | Secondary text on light backgrounds (cities, venues, sub-lines, meta). |
| `--line` | `#CCD6E2` | Borders and rules on light (decorative, never text). |
| `--link` | `#0B57D0` | Web and e-mail addresses on `--paper` / `--floor` only. On navy and in buttons addresses are white and underlined. |
| `--placeholder` | `#56667C` | Input placeholders. |

Shadows (navy-tinted, restrained):
- `--sh-1: 0 1px 2px rgba(11,35,65,.08), 0 8px 22px rgba(11,35,65,.10)` (cards at rest on light)
- `--sh-2: 0 2px 6px rgba(11,35,65,.12), 0 18px 40px rgba(11,35,65,.20)` (cards on hover/focus)
- `--sh-n: 0 20px 48px rgba(0,0,0,.38), 0 4px 12px rgba(0,0,0,.25)` (white objects on navy)

**Text/background pairs (WCAG 2.1, computed).** Only these pairs may carry text.

| Text on background | Ratio | Use |
|---|---|---|
| ink on paper | 15.78 | all text |
| ink on floor | 14.13 | all text on light bands, chips, tags |
| muted on paper | 7.72 | secondary text |
| muted on floor | 6.92 | secondary text on light bands |
| placeholder on paper | 5.85 | placeholders |
| white on night | 15.78 | boards, footer, date stamps, navy buttons |
| white on night-2 | 11.54 | menu bar, month bars, page chips |
| white on night-line | 8.02 | (allowed, rarely needed) |
| mist on night | 10.72 | secondary text on navy |
| mist on night-2 | 7.84 | secondary text on navy panels |
| brass on night | 8.74 | big figures only |
| white on red | 5.30 | ribbon, primary buttons, red tab, number squares |
| white on red-deep | 7.51 | hover/pressed |
| red on paper | 5.30 | stamps, card meta like "ص. 56" (≥ 17 px bold) |
| red on floor | 4.75 | stamps only, ≥ 17 px bold |
| link on paper | 6.39 | addresses |
| link on floor | 5.72 | addresses |
| ~~red on night~~ | 2.98 | **forbidden** as text (a red *button* with white text on navy is fine) |
| ~~brass on paper~~ | 1.80 | **forbidden** |
| ~~line as text~~ | 1.47 | **forbidden** |

**Proportion (home, PC):** about 40 % navy (board, issue band, club band, footer), 45 % white/floor, 15 % red and pictures' colour. The page must never read as pale.

**Third-party colours** only inside real app icons: WhatsApp `#25D366`, Viber `#7360F2`, LINE `#06C755` (glyphs `img/apps/whatsapp.svg`, `viber.svg`, `line.svg`, drawn white on the brand colour in a 12 px-radius tile), and the Botim, imo and BiP PNGs as they are.

### 3.2 Fonts

One Google Fonts link (+ preconnect to fonts.googleapis.com and fonts.gstatic.com):
```
https://fonts.googleapis.com/css2?family=Changa:wght@500..800&family=Readex+Pro:wght@400..700&display=swap
```
A second link for the ribbon's Chinese name only:
```
https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&text=%E4%B8%AD%E9%98%BF%E5%95%86%E6%A5%AD%E9%9B%9C%E8%AA%8C&display=swap
```
Inject full `Noto Sans TC` / `Noto Sans SC` (400;700) only when the visitor picks zh-TW / zh-CN. All three URLs return 200 and load in the tile (checked 22 Oct 2026: Changa 500–800, Readex Pro 400–700, Noto Sans TC 700).

| Role | Family | Weights | Stack |
|---|---|---|---|
| Display: H1, H2, H3, big figures, date-stamp days, stamps, the phone number display, typeset company names | **Changa** (Arabic + Latin in one design: strong, slightly condensed, very bold presence) | 600 / 700 / 800 | `'Changa','Readex Pro',Tahoma,sans-serif` |
| Text and UI: paragraphs, menu, buttons, chips, rows, cards, inputs, footer | **Readex Pro** (Arabic + Latin, built on Lexend for reading ease and low vision: wide, open shapes, large x-height) | 400 / 500 / 600 / 700 | `'Readex Pro','Changa',Tahoma,sans-serif` |
| Chinese | Noto Sans TC / SC | 400 / 700 | `'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif` |
| Malay | as English | | |

Both families carry Arabic and Latin, so a Latin company name inside an Arabic line keeps one voice. Set `font-variant-numeric: lining-nums tabular-nums` on the body. Western digits everywhere (as the magazine and today's site).

### 3.3 Type scale (LARGE MODE)

Nothing renders under **16 px** (audit it). Paragraphs ≥ 19 px. Menu and buttons ≥ 18 px bold. Breakpoints: **wide** ≥ 1700, **pc** 1181–1699, **laptop** 961–1180, **phone** ≤ 960 (≤ 760 single column).

| Role | Font / weight | wide | pc | laptop | phone | Line height ar / en |
|---|---|---|---|---|---|---|
| H1, home board (Arabic) | Changa 800 | 72 | 58 | 54 | 38 | 1.22 |
| H1, home board (English) | Changa 800 | 56 | 46 | 42 | 32 | 1.1 |
| H1, inner boards | Changa 800 | 60 | 52 | 46 | 34 | 1.25 / 1.1 |
| Twin line under the home H1 | Changa 600 | 28 | 28 | 26 | 21 | 1.35 |
| Board lead | Readex 400 | 22 | 22 | 21 | 19 | 1.65 / 1.55 |
| H2, section title | Changa 700 | 46 | 42 | 38 | 30 | 1.25 |
| H3, card title, sub-head | Changa 700 | 26 | 26 | 24 | 22 | 1.3 |
| Body paragraph | Readex 400 | 20 | 20 | 20 | 19 | 1.75 / 1.6 |
| Article reading text | Readex 400 | 22 | 22 | 21 | 20 | 1.95 / 1.7 |
| Row / card title (show, product, company, headline) | Readex 700 | 21 | 21 | 20 | 19 | 1.4 |
| Secondary line (city, venue, maker, meta) | Readex 500, `--muted` / `--mist` | 17–18 | 17–18 | 17 | 17 | 1.4 |
| Menu items | Readex 600 (active 700) | 20 | 20 | 20 | — | 1.2 |
| Phone sheet items | Readex 700 | — | — | — | 22 | 1.3 |
| Tab bar labels | Readex 600 | — | — | — | 16 | 1.15 |
| Buttons | Readex 700 | 20 (56 tall) | 20 | 20 | 18–20 (52–56 tall) | 1.2 |
| Small buttons (masthead) | Readex 700 | 19 (48 tall) | 19 | 19 | 18 (46 tall) | 1.2 |
| Chips, tags, month chips | Readex 600–700 | 18 (tags 17) | 18 | 18 | 17 | 1.2 |
| Counter figure (white board) | Changa 800 | 48 | 44 | 44 | 36 | 1.05 |
| Brass figure (club band, inner boards) | Changa 800 | 64 | 64 | 56 | 44 | 1 |
| Date stamp: days / month | Changa 800 / Readex 600 | 30 / 17 | 30 / 17 | 28 / 17 | 26 / 17 | 1.1 / 1.3 |
| Stamps ("العدد 560", "ص. 7") | Changa 800 / Readex 800 | 24 / 17 | 24 / 17 | 22 / 17 | 20 / 17 | 1.3 |
| Phone number display (contact) | Changa 800 | 42 | 42 | 40 | 32 | 1.1 |
| Ribbon text | Readex 700 | 19 | 19 | 18 | 17 | 1.3 |
| Inputs | Readex 500 | 22 (home search) / 20 | 20 | 20 | 19 | 1.3 |
| Absolute floor | any | 16 | 16 | 16 | 16 | |

16 px is allowed only for: app names under icons, tab-bar labels, trade-line stop labels on phones, sub-lines of counters on phones. Everything else ≥ 17 px.

### 3.4 Spacing, widths, radius, borders

- Spacing steps (px): `4 8 12 16 24 32 44 56 76`. Band padding 76 (phone 48). Title block to content 36 (phone 24). Card padding 18–28. Grid gaps 14–26.
- Content max width `--wrap`: **1560 px** at ≥ 1700, **1400 px** at 1181–1699; gutters `--g` 40 px (laptop 28, phone 16).
- Radius: `--r` **12 px** (boards, cards, photo frames 14), `--r-s` **8 px** (buttons, inputs, chips, counter boards, month chips), 6 px (stamps, page chips), 3–4 px (flags). Pills (999 px) only for the quick-search chips on navy and the field tags.
- Borders: cards 1 px `--line` (product, modern and article cards may drop the border and rely on `--sh-1`); inputs 2 px; secondary buttons 2 px; red top edges 6 px; title bars 6 px; footer top rule 6 px `--red`.
- Focus ring: `outline: 3px solid var(--red); outline-offset: 3px`; on navy `outline-color: #fff`.

### 3.5 Motion

| Moves | How |
|---|---|
| Product conveyor (home, products page top) | Always moves, **~42 px/s** (duration = width of one copy ÷ 42), duplicated track, linear. Pauses on hover, keyboard focus and touch; resumes 2 s after touch end. Arabic: items travel to the right; English: to the left. Runs on every device including weak phones (transform only). |
| Trade-line light | 9 s loop from the first stop to the last; the caption's red dot pulses (2.4 s). |
| Opening photograph | Slow drift, scale 1 → 1.06, 26 s alternate. |
| Hover/focus lift | Cards, counter boards, the issue card, page thumbnails, trade-line stops: `translateY(-4…-6px)` + `--sh-2`, 200 ms `cubic-bezier(.2,.7,.2,1)`; photos inside modern cards zoom to 1.05 (500 ms). Rows: `--floor` fill + a 5 px red bar growing at the inline start. |
| Sheets and panels (assistant, company panel, phone menu) | 200 ms slide from their edge. |
| Reader page turn | 250 ms slide of the spread. |

Never: content that appears late (reveal-on-scroll, fade-in), counting-up numbers, parallax, auto-rotating banners, splash screens, layout jumps (reserve every image box with `width/height` or `aspect-ratio`). **Motion never hides or replaces content at rest:** everything is complete on first paint.
`prefers-reduced-motion: reduce`: the conveyor stops and becomes a horizontally scrollable row with two 48 px arrow buttons; the light, the pulse and the drift stop; lifts become colour changes.

---

## 4. Layout language

### 4.1 Breakpoints and header modes

| Name | Range | Header | Grids |
|---|---|---|---|
| wide | ≥ 1700 | ribbon + masthead row (with group block) + menu bar in one row | home board 2 columns; directory 7 cols; trade line 14 in one row |
| pc | 1181–1699 | same; the group block hides ≤ 1400; menu in one row or two even rows (§5.1) | directory 7 (≤ 1400: 5); trade line 7 × 2 ≤ 1400 |
| laptop | 961–1180 | same, menu in two even rows of 4 | board, issue, club and articles stack to one column; show rows become 2-column blocks |
| phone | ≤ 960 | ribbon + logo row + bottom tab bar | ≤ 760 single column; trade line 4 per row |

Test at 1920, 1366, 1100, 960 and 390, Arabic and English.

### 4.2 Bands (section backgrounds)
Every section is a full-width band. Order on every page: the navy opening board, then bands alternating **paper → floor → (navy feature band where the page has one) → paper → floor…**, then the floor contact band and the navy footer. Two neighbours never share a colour. Navy feature bands on home: the issue and the club; on inner pages at most one (e.g. the club page's join band, the magazine page's spread).

### 4.3 Section anatomy (every light or navy band)
1. A **title row**: the H2 at the inline start with the red title bar under it; under the bar an optional **meta line** (18 px `--muted`, on navy `--mist`) that states a count or the issue: "1,464 معرضاً في 14 دولة · من يناير 2027". At the inline end of the same row, **one** action button (`btn-navy` on light, `btn-ghost` on navy), aligned to the bottom of the title block. No kicker label above the title, no "see all" link beside it, no duplicate title.
2. The content (boards, cards, rows).
3. Nothing else. One title per section, one action per section.

### 4.4 Opening board (every page)

The page's first band, directly under the menu bar, `--night` with the two light pools (§2.2).

- **Home**: see §6 home 1.
- **Inner pages**: a two-part board, `padding-block: 56px 48px` (phone 36/32), min-height 300 px on PC:
  - **start side**: H1 (60 px) with the red 120 × 8 bar under it; a lead line (`--mist`, 22 px, max 2 lines); where the page has a search, the scoped search field (white, 64 px, red button); the **brass figure** (64 px) with its label (19 px `--mist`) beside or under the lead.
  - **end side**: the page's **picture**: a framed photograph, the cover, a fan of real logos or product pictures, the seal, or the trade line (table below). On phones the picture comes after the text, full width (max 360 px tall).
  - No breadcrumbs, no small label above the H1.

| Page | H1 (ar / en) | Brass figure + label | Picture side |
|---|---|---|---|
| `#magazine` | المجلة / The magazine | 560 · العدد · أكتوبر 2026 | the cover (300 px) on a white board with the stamp "العدد 560", buttons اقرأ العدد 560 / PDF |
| `#companies` | دليل الشركات / Company directory | 35 · شركة معلنة في العدد 560 | a 3 × 2 fan of the first six real logos on white tiles (`--sh-n`), slightly overlapping; plus the scoped search |
| `#company-NN` | Arabic name (if any) over the Latin name | the folio ("18–19") · صفحة في العدد 560 | the logo on a white board + the first shipped product picture framed |
| `#exhibitions` | معارض دولية / International exhibitions | 1,464 (or the filtered count) · معرضاً دولياً في 14 دولة (follows the filter: "216 معرضاً في الإمارات") | full-width trade line as the country filter (§6 #exhibitions) + the scoped search |
| `#exhibition-ID` | the show name (Latin block) | the date: "11–13" over "يناير 2027" (month-only: the month name) | the country flag 120 × 80 framed + city + venue |
| `#products` | المنتجات / Products | 127 · منتجاً من 28 شركة | three product pictures (three different fields) fanned in white frames; plus the scoped search |
| `#product-NN-K` | product name (Latin block) | the folio · صفحة في العدد 560 | the product picture in a white frame (only if shipped; else the maker's logo board) |
| `#modern` | منتجات وصناعات حديثة / Modern products and industries | 40 · في 6 مجالات | framed photograph `img/modern/m10.jpg` with caption |
| `#modern-N` | the Arabic name; lead = English name | none | the item picture if shipped; otherwise the title spans the board |
| `#reading` | مقالات وأخبار / Articles & news | 13 · مقالاً في العدد 560 (en: 26 · news items) | the lead article's picture framed |
| `#article-ID` | the title | the folio (issue-560 articles) | the article picture if shipped |
| `#news-ID` | the title | the date if known, else none | the news picture if shipped |
| `#club` | نادي رجال الأعمال / AAT Business Club | 2,831 · عضواً | the seal, 300 px |
| `#about` | من نحن / About us | 1982 · صدر العدد الأول من المجلة | the cover framed + two counter boards (45 عاماً في النشر التجاري · 560 عدداً من المجلة) |
| `#advertise` | أعلن معنا / Advertise with us | 560 · عدداً من المجلة | the open spread of pages 2–3 framed |
| `#contact` | تواصل معنا / Contact us | none; the phone number in white Changa 800 48 px (`<bdi dir=ltr>`) | the six app icons at 64 px on white tiles |
| `#privacy` | الخصوصية / Privacy | none | none (short board, min-height 200) |
| 404 | الصفحة غير موجودة | none | buttons الرئيسية / معارض دولية |

### 4.5 Cards (white boards)
- White, `--r` 12, 1 px `--line` border or `--sh-1`; hover/focus = lift + `--sh-2` (border becomes transparent). The whole card is one link; no lone arrow icons.
- **Product card** (conveyor and grids): 300 px wide (phone 250); picture box 220 px tall (phone 180) white, `contain`, 12 px padding, 1 px rule under it; the red stamp "ص. N" at the picture's top-start corner; name (Readex 700 19 px, 2-line clamp, LTR block); maker row (real logo 30 px tall, max 76 px wide + company name 17 px `--muted`, 1-line clamp); origin row (flag 27×18 + city, 17 px 600).
- **Company card** (logo card): logo area 96 px tall (phone row layout: 104 px logo column), real logo `contain` max 80 px tall; companies without a logo show their **name typeset** in Changa 800 23 px navy (never a grey box or initials); Arabic name (19 px 700, if `nameAr`), Latin name (17 px, 3-line clamp, LTR block, `overflow-wrap:anywhere`); flag + city (17 px `--muted`); the red stamp with the page or contiguous range ("ص. 18–19"; non-contiguous pages show the first page).
- **Modern-industry card**: picture 16:9 `cover` with a 4 px red rule under it; group name (H3 26 px) + count in a navy tile (Changa 800 22 px white); three item names (18 px `--muted`, red bullet).
- **Article card**: picture 2:1 (lead) or 16:9 (small) `cover`; title (lead: Changa 700 30 px; small: Readex 700 21 px, 3-line clamp); summary (19 px `--muted`, 2-line clamp, lead only); meta "بقلم … · ص. 56" (17 px 600 `--red`).
- **Contact card**: white, 6 px red top edge, `--sh-1`, 26–28 px padding.
- **Counter board**: §2.2 motif 3.
- **Issue card** (home board): white, `--r`, 18 px padding, `--sh-n`: cover 150 px (phone 104) with a 1 px rule and its own shadow, the stamp "العدد 560", the magazine name (Changa 700 24), "أكتوبر 2026 · 100 صفحة", buttons اقرأ العدد (red) + PDF (outline).

### 4.6 Rows
- Used for shows, contents, news headlines, filter lists, advertising positions.
- Min height 64 px (show rows 96 px), 14–16 px vertical padding, 1 px `--line` between rows; hover = `--floor` fill + 5 px red bar at the inline start.
- Composed from known parts only (`[city, venue].filter(Boolean)`), so no dangling "·".

### 4.7 Grids
- Directory: 7 columns (≤ 1400: 5, ≤ 760: 1 column of rows). 35 fills 7 × 5 and 5 × 7 evenly.
- Modern industries: 3 × 2 (laptop 2, phone 1).
- Product grids: `repeat(auto-fill, minmax(280px, 1fr))` (phone 2 columns of 170 px cards or 1 column ≤ 400).
- Never a lone card in a wide row: size grids so rows are full, or centre the last row.

### 4.8 Buttons
| Type | Look | Use |
|---|---|---|
| `btn-red` (primary) | `--red` fill, white text, soft red shadow; hover `--red-deep` + lift 2 px | one per section: ابحث, اقرأ العدد 560, انضم إلى نادي رجال الأعمال, اكتب الرسالة, أرسل, محادثة 24 ساعة |
| `btn-navy` | `--night` fill, white text; hover `--night-2` | the one section action on light bands: كل المعارض الدولية, كل المنتجات, افتح دليل الشركات |
| `btn-line` (secondary on light) | white, 2 px `--ink` border, ink text; hover `--floor` | PDF, English, اللغات, انسخ العنوان, filters |
| `btn-ghost` (secondary on navy) | transparent, 2 px white border, white text; hover white 12 % | PDF and secondary actions on navy |
- 56 px tall (masthead 48), 28 px side padding, 20 px Readex 700, `--r-s` 8 px. Phone: full width inside sections, 52–56 px.
- Never blue, never pill-shaped, never gradient.

### 4.9 Chips, tags, the departure board
- **Quick-search chips** (home board): pill, 44 px, 2 px white 55 % border, white 18 px 600 text; each runs that query through the assistant/search.
- **Filter chips** (light): 48–52 px, `--r-s`, 2 px `--line`, 18–19 px 700, optional flag 30×20 and a count tile (`--floor`, 18 px 700). Selected: `--night` fill, white text, count tile `--red`.
- **Month chips**: same as filter chips; text "يناير 2027" + count.
- **Field tag** (in rows): pill, `--floor` fill, 1 px `--line`, 17 px 600 ink.
- **The departure board** (shows): a white board (`--r`, `--sh-1`, overflow hidden) with a `--night` header row (58 px, white 18 px 700 labels: التاريخ · المعرض · المدينة والدولة · المجال) and rows `date 180 | show 1fr | place 300 | field 270` (pc: 170 | 1fr | 260 | 240). Laptop: no header; rows become `date | (name / place / field)` blocks. Phone: one column (date stamp inline: "9–17 يناير 2027", then name, venue, place, tag).

### 4.10 Inputs
- 64 px on the boards (home search 64 px inside an 80 px white box with 8 px padding and `--sh-n`), 56 px elsewhere (phone 56); 2 px `--ink` border on light; `--r-s`; 20–22 px text; placeholder `--placeholder`.
- A visible label above every input on light pages (18 px 700); on the boards the label is visually hidden but present, and the placeholder says what to type.

### 4.11 Image frames
- Photographs: white frame 10 px, `--r` 14 px, shadow; `cover`; caption label as §2.2 motif 6.
- Products and logos: `contain` on white with padding.
- The cover and magazine pages: flat, 1 px rule or 3–12 px white frame, never tilted.
- Every `<img>` has `width`/`height` or `aspect-ratio`, `loading="lazy"` (except the logo, the opening photograph, the cover and the first four conveyor cards), `decoding="async"` and a real `alt`.

### 4.12 Empty and unknown data
- Unknown facts are **hidden**: no "—", "غير معروف", "TBA", "يُعلن لاحقاً", "قريباً" as a stand-in, "الشهر فقط", "approx", "coming soon".
- No picture → no picture box. No logo → typeset name.
- A filter with no result shows one line "لا توجد نتائج لهذا الاختيار" / "No results for this choice" and a `btn-line` "إلغاء التصفية" / "Clear filters".

---

## 5. Header, phone header, tab bar, assistant, contact band, footer

### 5.1 PC header (≥ 961 px)
1. **Ribbon** (`--red`, 44 px, full bleed): start = the three names "التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌" (Readex 700 19 px white, Chinese in Noto Sans TC, each name isolated); end = "العدد 560 · أكتوبر 2026" (600 18 px). English order: Arab Asian Trade · التجارة العربية الآسيوية · 中阿商業雜誌.
2. **Masthead row** (`--paper`, 94 px, 1 px `--line` under it):
   - start: the red logo (64 px tall), then (≥ 1401 px) the **group block** after a 2 px `--line` divider: `config.groupName` (Changa 700 23 px) over `magazine.tagline` (Readex 500 18 px `--muted`): "مجموعة التجارة العربية الآسيوية / مفتاح النجاح بين المستوردين والمصدّرين".
   - end: the phone (44 px red circle with a white phone glyph + "+886 966 404681" Readex 700 23 px, `tel:`, `<bdi dir=ltr>`), the language button ("English" on Arabic, "العربية" on every other language; `btn-line` small), the globe button (`btn-line` small, globe icon + "اللغات"), opening a menu of the five languages in their own scripts (العربية · English · 繁體中文 · 简体中文 · Bahasa Melayu; 52 px rows, 20 px, a tick on the current one), and the red **"محادثة 24 ساعة"** button (chat icon + text) that opens the assistant.
3. **Menu bar** (`--night-2`, 64 px, `position: sticky; top: 0`, shadow `0 6px 18px rgba(11,35,65,.25)`):
   - 8 items, in this order, spread across the full width (`justify-content: space-between`), Readex 600 20 px white, 15 px side padding:
     **الرئيسية · المجلة · معارض دولية · دليل الشركات · المنتجات · مقالات وأخبار · نادي رجال الأعمال · تواصل معنا**
     English: Home · Magazine · International exhibitions · Company directory · Products · Articles & news · AAT Business Club · Contact.
   - Current item: 700 weight, white 7 % background, a 5 px `--red` bar at the bottom (rounded top). Hover: white 8 % background.
   - **Never hidden on PC.** When the 8 items do not fit in one row they become **two even rows of 4** (grid, centred labels, 56 px rows), never 7 + 1. In the tile: Arabic ≤ 1300 px, English (and zh/ms) ≤ 1500 px. Measure each language; do not guess.
   - Only the menu bar sticks; the ribbon and masthead row scroll away.

Header height: 44 + 94 + 64 = 202 px (two-row menu: 250 px).

### 5.2 Phone header (≤ 960 px)
1. Ribbon (40 px, centred): two names only: Arabic site "التجارة العربية الآسيوية · 中阿商業雜誌"; other languages "Arab Asian Trade · 中阿商業雜誌". Must fit one line at 360 px.
2. Logo row (76 px, white, sticky): logo 46 px at the start; at the end "English"/"العربية" (`btn-line`, 46 px) and **"الأقسام"** (`btn-navy`, 46 px, three-line icon + word).
3. No menu bar.

**"الأقسام" sheet** (full screen, `--paper`, slides from the top; header row with "الأقسام" and "إغلاق"): a search field "ابحث أو اسأل AAT"; the 8 sections as 60 px rows (Readex 700 22 px), the current one with a 5 px red bar at the inline start; then من نحن · أعلن معنا · الخصوصية; then the phone number (call link) and the six app icons; then the five languages.

### 5.3 Phone bottom tab bar (≤ 960 px)
Fixed, `--night`, 72 px + safe-area inset, 4 px `--red` top rule, shadow up. Four equal tabs, each a 26 px line icon (white) above a label (Readex 600 16 px white, up to 2 lines):

| Tab | ar | en | Target |
|---|---|---|---|
| 1 | المجلة | Magazine | `#magazine` |
| 2 | معارض دولية | Exhibitions | `#exhibitions` |
| 3 | المنتجات | Products | `#products` |
| 4 | اسأل AAT (red tab) | Ask AAT | opens the assistant |

Active tab: a 4 px red bar on top of it and bold label. Home is the logo. `body { padding-bottom: 76px + safe-area }`. The bar hides in the reader (`#flip`).

### 5.4 Assistant entry and panel
- Entries: the red "محادثة 24 ساعة" button in the masthead row; the big search on the home board and the scoped searches on inner boards (same engine); the phone tab 4; a "اسأل AAT" button on the contact page.
- **Floating button (PC only, after the masthead row has scrolled out of view):** a 64 px red circle with the white chat icon and a 3 px white ring, fixed at the **bottom-left** (physical left in every language, owner's "chat left"), 24 px from the edges. On hover/focus it extends to the left-to-right label "محادثة 24 ساعة" (18 px 700). It hides while the panel is open and over the footer (the footer reserves 96 px bottom padding). QA must show it covers no heading, count, button or cover at 1920, 1366 and 1100.
- **Panel**: PC 480 px at the left edge, full height, 50 % navy scrim; phone full screen. Header `--night` 72 px: "مساعد AAT · محادثة 24 ساعة" (Changa 700 24 white) and "إغلاق". Body white; `config.assistant.hello` first; messages Readex 20 px; visitor's messages on `--floor` at the inline end, answers on white at the inline start. Suggested chips: "معارض الإمارات في مارس" · "شركات تايوان" · "آلات التغليف" · "كيف أعلن؟". Input 56 px + `btn-red` "أرسل".
- **Answers come from the site content only.** Port the matching logic of `/home/user/AATWORLD-1/assets/js/assistant.js` (shows by country, city, month, field or name incl. Arabic spellings of famous shows; companies; products; modern items; articles; news; `faqs`; contact; advertising; club; magazine; about). Answers render as the **same components** (show rows with date stamps, company cards, product cards, headline rows), max 6, then one `btn-navy` "عرض الكل في <page>" to the filtered route (e.g. `#exhibitions-ae`). No AI disclaimer, no "thinking" text.

### 5.5 Contact band (above the footer on every page except `#contact`)
`--floor` band, H2 "تواصل معنا" with the red bar, then three contact cards (stacked on laptop and phone):

| Card | Content |
|---|---|
| 1 · الهاتف وواتساب | the number (Changa 800 42 px, `tel:`, LTR), then the 6 app icons (52 px tiles, name 16 px under each). WhatsApp and Viber open a chat (`config.apps[].url`); Botim, imo, BiP and LINE copy the number and show a 2.5 s toast "تم نسخ الرقم" / "Number copied". |
| 2 · البريد الإلكتروني / العنوان | info@aatworld.com in `--link` (mailto, underlined); the address **always in English**, LTR, Readex 600 19 px, with a red pin icon: "P.O. Box 568, Yonghe, New Taipei City 234964, Taiwan R.O.C." |
| 3 · `config.newsletter.title` (لا تخسر العروض والفرص التجارية) | the line "أرسل كلمة «اشتراك» من بريدك إلى", the address in `--link`, `btn-red` "اكتب الرسالة" (mailto, subject "اشتراك في النشرة" / "Newsletter subscription") and `btn-line` "انسخ العنوان" ("تم النسخ"). No input box in the prototype (it cannot send); the full build may use `api/subscribe.php` with a real success state. |

### 5.6 Footer (every page)
`--night`, 6 px `--red` top rule, padding 60/30 (+96 px bottom on PC for the floating button).
1. **Brand column** (1.5 fr): white logo 216 px; the three names (Readex 700 20 px white, isolated); `about.claim` (18 px `--mist`).
2. **الأقسام**: the 8 sections + من نحن · أعلن معنا · الخصوصية, in two columns, 19 px white links (hover underline).
3. **تواصل معنا**: phone (Changa 800 28 px white), e-mail info@aatworld.com (white, underlined; never blue on navy), the address in English (LTR, 18 px `--mist`).
4. **اللغات**: the five languages as links (in two columns).
5. Bottom line after a 1 px `--night-line` rule: "© 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة" / "© 2026 Arab Asian Trade Group · All rights reserved" (18 px `--mist`).
Nothing in the footer under 18 px. No YouTube, no social icons, no credits to data sources.

---

## 6. Site map, routes and page specs

### 6.1 Routes
Hash routes; the parser splits on the first "-": a numeric remainder is an item, any other remainder a filter or group.

| Route | Page | Notes |
|---|---|---|
| `#home` (and empty hash) | الرئيسية | |
| `#magazine` | المجلة | cover, contents, pages, advertising teaser, about the magazine |
| `#flip`, `#flip-NN` | the reader | full screen; opens at page NN (1–12 ship) |
| `#companies`, `#companies-CAT`, `#companies-CC` | دليل الشركات | CAT = `cats` key; CC = origin slug (`taiwan`, `syria`, `malaysia`…) |
| `#company-NN` | company page | NN = company id = first page |
| `#exhibitions`, `#exhibitions-CC`, `#exhibitions-CC-FIELD` | معارض دولية | CC = 2-letter code or `all`; FIELD = `fields[].id` |
| `#exhibition-ID` | show page | |
| `#products`, `#products-CAT` | المنتجات | |
| `#product-NN-K` | product page | |
| `#modern`, `#modern-GROUP`, `#modern-N` | منتجات وصناعات حديثة | GROUP non-numeric, N numeric |
| `#reading` (+ `#articles`, `#news` scroll to their part) | مقالات وأخبار | |
| `#article-ID`, `#news-ID` | reading pages | |
| `#club` | نادي رجال الأعمال | |
| `#about` | من نحن | footer, sheet, magazine page |
| `#advertise` | أعلن معنا | footer, sheet, magazine page |
| `#contact` | تواصل معنا | |
| `#privacy` | الخصوصية | `i18n.x_privacy`, paragraphs split on "\|" |

Unknown routes → `#home`. Old routes: `#exhibition` → `#exhibitions`, `#club-join` → `#club`. Each route sets `document.title` "<page> · AAT", scrolls to the top and moves focus to the H1.

### 6.2 HOME, in order (bands: navy → paper → floor → navy → paper → floor → navy → paper → floor → navy)

**1. Opening board** (`--night`, padding 46/34; grid `1.12fr | 0.88fr`, gap 56; laptop/phone one column):
- **Text side** (start):
  - H1 two lines, Changa 800 72 px white: "من مصانع آسيا" / "إلى أسواق العرب وأفريقيا"; the 120 × 8 red bar under it.
  - Twin line (other language, its own direction, aligned to the page's start edge): "From Asia's factories to Arab and African markets" (Changa 600 28 px `--mist`).
  - Lead: `about.claim` (22 px `--mist`, max 52 ch).
  - **Search**: white box (80 px, 8 px inner padding, `--r`, `--sh-n`): magnifier, input "ابحث عن معرض أو شركة أو منتج" (22 px), `btn-red` "ابحث" (64 px, 22 px). Submit opens the assistant panel with the query and its answers.
  - **Quick chips**: معارض الإمارات · آلات التغليف · شركات تايوان · معارض الأغذية.
  - **Four counter boards** (one row of 4; laptop/phone 2 × 2), each a link:
    | Figure | Label | Sub-line | Link |
    |---|---|---|---|
    | 1,464 | معرضاً دولياً | 2027 – 2028 | `#exhibitions` |
    | 35 | شركة معلنة | في العدد 560 | `#companies` |
    | 127 | منتجاً | من 28 شركة | `#products` |
    | 2,831 | عضواً | في نادي رجال الأعمال | `#club` |
- **Picture side** (end):
  - The framed photograph `img/modern/m5.jpg` (aspect 1000/528) with the caption label at its top-start corner: "خلاط صحي · ماليزيا" / "منتجات وصناعات حديثة" (links to `#modern-5`).
  - The **issue card** overlapping the photograph's bottom by 74 px, offset 64 px from the start side (z-index above): cover, stamp "العدد 560", "التجارة العربية الآسيوية", "أكتوبر 2026 · 100 صفحة", `btn-red` "اقرأ العدد" → `#flip-1`, `btn-line` "PDF" → `magazine.pdf` (new tab). Phone: no overlap, the card follows the photo with 16 px gap.
- **Trade line** (§2.2 motif 2) across the full width at the bottom of the board, after a 1 px `--night-line` rule: caption + 14 stops (≤ 1400: 7 × 2; phone: 4 per row; the line and light show only when all 14 are on one row).

First-screen check: at **1920 × 950** the H1, twin line, lead, search, chips, all four counters, the photograph and the issue card are visible, and the trade line starts at the fold; at **1366 × 768** the H1, twin, lead, search and photograph are visible; at **390 × 844** the H1, twin, lead, search and quick chips are visible above the tab bar.

**2. أقرب المعارض الدولية / Next international exhibitions** (paper). Meta "1,464 معرضاً في 14 دولة · من يناير 2027"; action `btn-navy` "كل المعارض الدولية".
- **Month chips**: the first six months that have shows, with counts from the data (يناير 2027 · 55, فبراير 2027 · 31, مارس 2027 · 46, أبريل 2027 · 120, مايو 2027 · 81, يونيو 2027 · 78); the first is selected; a chip opens `#exhibitions` at that month.
- **The departure board** (§4.9) with the next **8 dated** shows (earliest start, then name): date stamp, name (Latin block) + venue, flag + city (Arabic `city.ar` when present) + country, field tag. Each row → `#exhibition-ID`.

**3. منتجات المعلنين في العدد 560 / Advertisers' products in issue 560** (floor). Meta "127 منتجاً من 28 شركة"; action "كل المنتجات".
- The **conveyor**: full-bleed, edge fade (mask 6 % each side), all products with a shipped picture (53 now, 114 with full assets) in company page order, product cards (§4.5). Each card → `#product-NN-K`. Motion §3.5.

**4. العدد 560 · أكتوبر 2026 / Issue 560 · October 2026** (navy). Grid 1 fr | 1 fr:
- **Start**: the open **spread of pages 2 and 3** (white frame 12 px, `--sh-n`; page 2 on the right in every language: the printed book reads right to left), caption "صفحتا 2 و3 من العدد".
- **End**: H2 with red bar; `magazine.coverText` (22 px white); `btn-red` "اقرأ العدد 560" → `#flip-1`, `btn-ghost` "PDF"; H3 "في هذا العدد"; the first 7 `toc.articles` as rows: page chip (`--night-2`, "ص. 16") + title (19 px white) → `#article-ID`.
- Under both: H3 "صفحات العدد" and the strip of the 12 shipped page thumbnails (12 in a row; ≤ 1400: 6; phone: 3) with 3 px white frames, page numbers under them (18 px `--mist`) → `#flip-NN`.
- English: the contents keep the Arabic titles in RTL blocks under "In this issue (articles in Arabic)".

**5. دليل الشركات / Company directory** (paper). Meta "35 شركة معلنة في العدد 560"; action "افتح دليل الشركات".
- All 35 company cards (§4.5) in page order, 7 × 5 (≤ 1400: 5 × 7; phone: one column of row cards). Each → `#company-NN`.

**6. منتجات وصناعات حديثة / Modern products and industries** (floor). Meta "40 منتجاً وصناعة في 6 مجالات"; action "كل الصناعات الحديثة".
- Six modern-industry cards (§4.5), one per `modernGroups` in data order, 3 × 2. Photos: pack `img/modern/m2.jpg` · food `m20.jpg` · plastic `m10.jpg` · health `m0.jpg` · metal `m12.jpg` · home `m16.jpg`. Items: the first three of the group; Arabic name = the text before the first Latin letter (e.g. "جهاز تدفئة احترافي"). Card → `#modern-GROUP`.

**7. نادي رجال الأعمال / AAT Business Club** (navy with a blue light pool behind the seal). Grid 360 px | 1 fr (laptop/phone: the seal first, centred):
- The seal (320 px; phone 250).
- H2 + red bar; `club.lead` (22 px `--mist`, max 60 ch).
- **Four brass figures** in a ruled row (`--night-line` rules; phone 2 × 2): 2,831 عضواً في نادي رجال الأعمال · 45 عاماً في النشر التجاري · 560 عدداً من المجلة · 1982 صدر العدد الأول من المجلة.
- Benefits 1–4 (`club.benefits`) in two columns: number tile (42 px `--red` square, white Changa 800 "01") + text 19 px white.
- `btn-red` "انضم إلى نادي رجال الأعمال" → `#club` join part; `btn-ghost` `club.join.more` "اطّلع على مزايا الأعضاء" → `#club` benefits.

**8. مقالات وأخبار / Articles & news** (paper). Meta "13 مقالاً في العدد 560 · 26 خبراً"; action "كل المقالات والأخبار". Grid 1.55 fr | 1 fr:
- Main: the lead article card (Arabic: the first fresh article whose picture is a photograph, `ar26-5`, with summary and "ص. 56"), then two small article cards side by side (`ar26-6`, `ar26-1`).
- Side: H3 "الأخبار" over a 3 px ink rule and 4 news rows (picture 150 px 3:2 only if shipped + title 3-line clamp + date when known), visitor's language first.
- English: the lead and small cards are the English news with pictures (n2, n0, n1); the side list is "Articles": four older articles with English titles and authors (Latin part of the author only).

**9. Contact band** (floor), **10. Footer** (navy): §5.5, §5.6.

### 6.3 `#magazine` — المجلة
1. Opening board (§4.4).
2. **"فهرس العدد"** (paper): two columns. Articles: 13 rows (page chip + title) → `#article-ID`. Advertisers: 45 ad pages grouped by company: page stamp, company (Arabic name if any + Latin), field; rows → `#company-NN`; AudiFeL (pages 88–91, no record) is a non-link row.
3. **"صفحات العدد"** (navy band): the 12 shipped thumbnails in a 6-column grid (phone 3), page number under each → `#flip-NN`. Only shipped pages appear.
4. **"أعلن معنا"** (floor): the 6 `advertise.positions` as rows (name · print line), `btn-navy` "تفاصيل الإعلان" → `#advertise`.
5. **"عن المجلة"** (paper): `i18n.am_p1` + `btn-line` "من نحن" → `#about`.

### 6.4 `#flip` — the reader
Full screen over the site: no ribbon, masthead, tab bar or contact band. Desk = `--night` with a soft light pool.
- **Top bar** (`--night-2`, 64 px): white logo 40 px; "العدد 560 · أكتوبر 2026" (white 18 px 700); page counter "2–3 / 100" (Changa 700 22 px, LTR); buttons (`btn-ghost`, 48 px, 18 px): المحتويات · PDF · ملء الشاشة · تكبير · إغلاق. Phone: only المحتويات and إغلاق; the rest go into the contents sheet.
- **Page size** (owner's rule): `h = innerHeight − 64 − 72`, `w = h × 1100 / 1555`. Two pages side by side when `2w + 2×64 + 32 ≤ innerWidth` and the company panel is closed; otherwise one. The whole page is always visible, never cropped. Pages sit on the desk with a 4 px white edge and `--sh-n`.
- **Spreads** (RTL book, as printed): [1], [2|3], [4|5]…, the lower page number on the right, in every language.
- **Controls**: 64 px round `btn-ghost` arrows outside the pages (in RTL "next" is the left arrow); keyboard arrows, swipe, click on the outer half of a page. **Bottom bar** (`--night-2`, 72 px): page-jump field "الصفحة" (1–100) + "اذهب"; on PC the 12 thumbnails. "تكبير" toggles 2× with drag to pan. Fullscreen via the Fullscreen API.
- **Contents drawer** (inline-end, 420 px; phone full sheet): 13 articles and 45 ad pages with page stamps; a page beyond 12 opens the article page or the company panel (prototype).
- **Advertiser pages** (`magazine.companyPages`): a tap **opens the company panel and never changes the page**. PC: 440 px panel at the inline end (the spread recalculates to one page if needed); phone: bottom sheet at 75 %. Panel: navy header with the stamp and field; logo on white; Arabic + Latin name; city; about (visitor's language); up to 4 product rows (picture only if shipped); contact facts (phone LTR, WhatsApp, e-mail and web in `--link`); `btn-navy` "صفحة الشركة" → `#company-NN`, `btn-line` "إغلاق". Hover hint on PC: a 3 px red outline around the ad page; no text over the page.
- **End of the prototype**: after page 12 the next arrow shows one end panel on the desk: H2 "اقرأ العدد كاملاً بصيغة PDF" (white), `btn-red` PDF, `btn-ghost` "الفهرس". A real action, not a placeholder.
- `#flip-NN` updates with `replaceState` as pages turn.

### 6.5 `#companies` — دليل الشركات
1. Opening board (§4.4) with a search "ابحث عن شركة أو منتج".
2. **Filters** (paper, sticky under the menu bar): row 1 "الدولة": "كل الدول 35" + origin countries from `city.en` after the last comma (cut at " · "): Taiwan 20 · Syria 5 · Malaysia 4 · UAE · Indonesia · Turkey · India · Saudi Arabia · Pakistan, Arabic names from `city.ar`; flags only where a shipped flag exists (India has none: no flag, no placeholder). Row 2 "المجال": "كل المجالات" + the `cats` that have companies, with counts. Phone: two scrollable chip rows with a visible scrollbar.
3. One band per field when no filter is set (H2 = field name, meta = count), alternating paper/floor, company cards in a 7-column grid (+ "4 منتجات" line when the company has products).

### 6.6 `#company-NN` — company page
1. Opening board (§4.4).
2. (paper) Two columns: start = `about` (visitor's language, fallback en→ar) + `certs`; end = a contact card (red top edge): phones (`tel:`, LTR), `btn-red` WhatsApp (if `whatsapp`), e-mail and web in `--link`, address (as given, LTR when Latin).
3. (floor) **"منتجات الشركة"** + count: product cards grid; products without a picture follow as rows (name · page stamp).
4. (paper) **"في المجلة"**: its pages as shipped thumbnails (→ `#flip-NN`) and, for unshipped pages, page rows to the contents.
5. (floor) **"من موقع الشركة"**, only when `site` exists: its sections (English, LTR blocks, H3 per section, lists as rows).
6. Section action: `btn-navy` "دليل الشركات".

### 6.7 `#exhibitions` — معارض دولية
1. **Opening board**: H1, the brass figure with the filtered count and a label that follows the filter, the scoped search "ابحث باسم المعرض أو المدينة" (matches the English name, `city.en`, `city.ar` and the Arabic spellings the assistant knows), and the **trade line as the country filter**: first stop "كل الدول · 1,464", then the 14 countries; the selected stop gets a white board behind it (navy text) and a red underline. Phone: the stops wrap 4 per row.
2. **Filter deck** (paper, sticky under the menu bar, 1 px `--line` under it): the **field chips** (18 `fields` with counts that recompute for the chosen country; fields with 0 stay visible but disabled in `--muted`, so the deck never jumps) and the **month strip** (scrollable month chips "يناير 2027 · 55" … "يوليو 2028 · 53", a tap scrolls to that month). Phone: "المجال: كل المجالات" as a full-width `btn-line` opening a sheet of 56 px rows; the month strip stays.
3. **The list**: grouped by start month. Each month opens with a **month bar** (`--night-2`, white Changa 700 22 px "مارس 2027 · 46 معرضاً"), sticky below the deck while that month scrolls. Rows = the departure-board row (§4.9) inside one white board per month. **Month-only shows** (`approx: 1`, 999 rows) come at the end of their month, after a 1 px ink rule; their date stamp shows only the month name over the year. No day, no "الشهر فقط", no highlight colour. Sort by start, then name.
4. **Rendering**: month blocks built lazily (IntersectionObserver), ≤ 60 rows per batch, never 1,464 rows at first paint; filters re-render from an in-memory index, debounced 150 ms; interactive in < 1 s on a 4× throttled CPU.
5. **Routes**: `#exhibitions-ae` preselects the country; `#exhibitions-all-food-and-beverage` the field; filter changes update the hash with `replaceState`.

### 6.8 `#exhibition-ID` — show page
1. Opening board (§4.4): H1 the name (Latin block); brass date; flag 120 × 80 framed + city + venue on the picture side.
2. (paper) **Facts** as a white board of definition rows (only known rows): التاريخ · الدولة · المدينة · مكان المعرض · المجال (tag) · القطاع (`sector`, English, LTR); for the 4 Taiwan shows also نبذة (`summary`), المحاور (`themes`), الموقع (`web`, `--link`). No organiser row, no EventsEye link.
3. (floor) **"معارض أخرى في <city>"**: up to 6 rows, only when the city has others.
4. (paper) **"معارض أخرى في <month> في مجال <field>"**: up to 6 rows. Action `btn-navy` "كل المعارض الدولية".

### 6.9 `#products` — المنتجات
1. Opening board (§4.4) with "ابحث عن منتج أو آلة أو شركة" (`i18n.pr_search`).
2. (floor) The conveyor (as home 3), full bleed.
3. Field index: chips of the `cats` that have products, with counts, + "منتجات وصناعات حديثة" chip → `#modern` (sticky on PC; phone scrollable).
4. One band per cat (alternating paper/floor; H2 = cat name, meta = count): product cards in `repeat(auto-fill, minmax(280px,1fr))`; products without a shipped picture follow as rows (name · maker · page stamp), no picture box. `#products-CAT` scrolls to that band and highlights its title bar.
5. (navy) Teaser of "منتجات وصناعات حديثة" (the six modern cards as on home 6) → `#modern`.

### 6.10 `#product-NN-K` — product page
1. Opening board (§4.4).
2. (paper) Two columns: the picture (only if shipped, `contain`, max 560 px, white frame) and the text: maker row (logo, name, city → `#company-NN`); description in the visitor's language (fallback en→ar; hidden if null); `btn-red` "صفحة الشركة" → `#company-NN`; `btn-line` "اسأل AAT عن هذا المنتج" (WhatsApp to AAT's number with "مرحباً AAT، أسأل عن: <product> (<company>)" / "Hello AAT, I am asking about: …"); the maker's own product page (`url`) as a `--link` line "صفحة المنتج على موقع الشركة".
3. (floor) **"منتجات أخرى من <company>"**: product cards or rows.

### 6.11 `#modern` and `#modern-N`
- `#modern`: opening board; six bands (alternating), one per `modernGroups` (H2 = group name, meta = count); items as cards in `minmax(320px,1fr)`: picture 16:10 `cover` (only if shipped), Arabic name (Readex 700 21 px; the part before the first Latin letter), English name (17 px, LTR), `description.ar` 3-line clamp (19 px). `#modern-GROUP` scrolls to its band.
- `#modern-N`: opening board without figure; picture if shipped; `sections[]` as H3 + paragraphs or rows (reading column, §6.13); **"للتواصل"**: `contact.emails` and `urls` in `--link`, `phones` LTR `tel:`. English and other languages: an English line "This page is available in Arabic" and the Arabic text in an RTL block.

### 6.12 `#reading` — مقالات وأخبار
1. Opening board (§4.4).
2. (paper) **"مقالات العدد 560"**: the 13 fresh articles (Arabic site only): a lead card with picture, then cards (picture only if shipped) or rows: headline, summary (2 lines), "بقلم <author>", page stamp.
3. (floor) **"مقالات من أعداد سابقة"** / "Articles from past issues": the 24 older articles in the visitor's language.
4. (paper) **"الأخبار"** / "News": 26 items, the visitor's language first; date when known; picture only if shipped.
5. English: part 2 becomes "From issue 560 (in Arabic)" with Arabic titles in RTL blocks.

### 6.13 `#article-ID` and `#news-ID`
- Opening board (§4.4); meta line (18 px `--mist`): "بقلم <author>" · "العدد 560 · ص. N" · source (news); only known parts.
- (paper) Picture 2:1 at the text width (only if shipped). **Reading column** max 760 px at the inline start: Readex 400 22 px, line height 1.95 (ar), 28 px between paragraphs; "## " sub-heads as H3 (Changa 700 28 px, 40 px above); Latin runs isolated; lists as rows. PC ≥ 1181: a 320 px sticky aside at the inline end: "في هذا العدد" with 6 other article rows and, for fresh articles, `btn-red` "شاهدها في المجلة" → `#flip-N` (only if N ≤ 12) or PDF.
- (floor) **"مقالات أخرى"**: 4 article cards; action "كل المقالات والأخبار".

### 6.14 `#club` — نادي رجال الأعمال
1. Opening board: H1 `club.name`, lead `club.lead`, brass 2,831 عضواً, the seal (300 px) on the picture side.
2. (paper) **"أهداف نادي رجال الأعمال"**: `goals.p1`, `goals.p2` (21 px) beside the four brass-free counter boards (45 · 560 · 1982 · 1,464 with their labels) on a white board row.
3. (navy) **"مزايا الأعضاء"** (`club.benefitsTitle`): the 8 benefits in two columns (phone one): red number tile "01"…"08" + text 20 px white.
4. (paper) **"شركاؤنا"**: `partners.text`.
5. (floor) **"سجل الأعضاء"** (meta "2,831 عضواً"): search "ابحث بالاسم"; names in 4 columns (laptop 2, phone 1) as 19 px rows; 300 shown, then `btn-line` "عرض 300 اسماً آخر"; the search filters all 2,831.
6. (paper) **"دراسات أولية لمشاريع صناعية"** (`turnkey.ar.title`): intro paragraphs, the includes list as rows, `groups` as `<details>` blocks (56 px summary row, Readex 700 21 px + count; projects as rows). English: H2 "Industrial project studies", the line "Details are available in Arabic" and the Arabic blocks in RTL.
7. (navy) **"للمشاركة في نادي رجال الأعمال"** (`join.title`): the number (Changa 800 42 white), `btn-red` WhatsApp with `join.message`, the app icons on white tiles, `clubEmail` (white, underlined). After a join tap: a confirmation board with the seal.

### 6.15 `#about` — من نحن
1. Opening board (§4.4).
2. (paper) The old WordPress text **word for word** (`about.paragraphs`), 20 px, 760 px column; aside (white board, red top edge): the founder line `i18n.ab4`, `about.claim`.
3. (floor) **"المجلة"**: `i18n.am_p1`–`am_p3`. No CEO name (unconfirmed).

### 6.16 `#advertise` — أعلن معنا
1. Opening board (§4.4); lead `i18n.ad_lead`.
2. (paper) **"المواقع الإعلانية"**: the 6 positions (cover, back, spread, premium, full, half) as white boards in order: name (H3), print line, web benefits as rows, and the example company's real logo card when `exampleCompanyId` has a logo.
3. (floor) `digital.title` + text.
4. (navy) `contactTitle`: phone, `btn-red` WhatsApp with `advertise.message`, app icons, e-mail.
No prices; `services` and `plans` are not used.

### 6.17 `#contact` — تواصل معنا
1. Opening board (§4.4).
2. (paper) The three contact cards of §5.5, larger (phone 48 px, app icons 64 px), plus marwan@aatworld.com labelled "رئيس التحرير" / "Editor" in card 2.
3. (floor) **"اسأل AAT"**: one line + `btn-red` that opens the assistant.
The contact band is not repeated below.

### 6.18 `#privacy`, 404
Short opening board; the text in a 760 px reading column on paper.

---

## 7. RTL and languages
- `<html lang="ar" dir="rtl">` by default. Switching sets `lang` and `dir` (ar = rtl; en, zh-TW, zh-CN, ms = ltr) and re-renders the current route without a reload. Store the choice in `localStorage['aat3.lang']` (every access in try/catch; the page works without it).
- **Logical CSS only** (`margin-inline-*`, `padding-inline-*`, `inset-inline-*`, `border-inline-*`, `text-align: start/end`). Physical left/right only for: the floating chat button and the assistant panel (physically left), and `text-align: right` inside LTR Latin blocks on the Arabic site.
- **Latin inside Arabic**: every company, product, show, venue and sector name, phone number, e-mail, URL and the address goes in `<bdi dir="ltr">` (inline) or a `dir="ltr"` block (when it can wrap or clamp). Latin runs **inside Arabic sentences** (benefits "AAT Tube", news "(TiTE)", "(Panjit)") are wrapped by a helper that isolates each Latin run, keeping parentheses with their run (`arx()` in `concepts/fusion/build_tile.js`). **Number ranges** ("11–13", "ص. 18–19", "2027 – 2028") are LTR-isolated or they flip to "19–18". The check script (`shoot.js`, `latinLoose`) must report 0.
- **Arabic inside English** (group name, Arabic article titles) goes in `<bdi dir="rtl">` / `dir="rtl" lang="ar"` blocks.
- **Clamping**: `-webkit-line-clamp` on a block whose `dir` matches its text, so the ellipsis is at the end; never `text-overflow` on an RTL container holding LTR text; never clip the start of a name.
- **Mirroring**: the board's text is at the start (right in Arabic), the picture at the end; the trade line runs from the start side (Taiwan on the right in Arabic); the red title bar sits at the start; the conveyor moves toward the start's opposite (Arabic: to the right). Spreads keep the printed RTL order in every language.
- The **twin line** under the home H1 is set in the other language's direction and aligned to the page's start edge.
- Arrows and chevrons are drawn with CSS/SVG and flip under `[dir=rtl]`; ticks, the magnifier, phone and chat icons never flip.
- **Numbers**: Western digits, thousands comma (1,464), en dash for ranges. **Months**: يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر; English full month names.
- **English is a first-class site**: same structure and components; H1 sized for Latin (§3.3); the ribbon and footer show all three names; content without English (fresh articles, 13 Arabic-only news, modern bodies, turnkey) is shown in Arabic RTL blocks with a factual English label, never hidden silently and never machine-translated.
- **zh-TW, zh-CN, ms**: UI strings from `i18n[lang]`; content via `tx` (English → translation), else English, else Arabic; LTR with the English layout; Chinese in Noto Sans TC/SC at the same sizes (body 19 px, line height 1.8).
- **The Taiwan address** is always the English string, LTR, in every language.

---

## 8. Copy

### 8.1 Owner's exact wording, everywhere
- "نادي رجال الأعمال" (never "نادي الأعمال"); English "AAT Business Club".
- "مجموعة التجارة العربية الآسيوية" (never "مجموعة AAT"); English "Arab Asian Trade Group".
- "معارض دولية" for the section (never التقويم / calendar in visible text); English "International exhibitions".
- "التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌" as the names.
- "محادثة 24 ساعة" for the assistant button; "مساعد AAT · محادثة 24 ساعة" as its title; "اسأل AAT" only as the phone tab and the contact-page button.
- "دليل الشركات" / "Company directory"; "مقالات وأخبار" / "Articles & news"; "المنتجات" / "Products"; "تواصل معنا" / "Contact".

### 8.2 Fixed UI strings of this design (approved by the owner on the concept tiles)
| Where | ar | en |
|---|---|---|
| Home H1 | من مصانع آسيا / إلى أسواق العرب وأفريقيا | From Asia's factories / to Arab and African markets |
| Twin line | (the other language's H1 on one line) | |
| Home search | ابحث عن معرض أو شركة أو منتج · ابحث | Search a show, a company or a product · Search |
| Quick chips | معارض الإمارات · آلات التغليف · شركات تايوان · معارض الأغذية | Shows in the UAE · Packaging machines · Taiwan companies · Food shows |
| Trade line caption | خط التجارة: 14 دولة · 1,464 معرضاً دولياً من يناير 2027 | The trade line: 14 countries · 1,464 international exhibitions from January 2027 |
| Home section titles | أقرب المعارض الدولية · منتجات المعلنين في العدد 560 · العدد 560 · أكتوبر 2026 · دليل الشركات · منتجات وصناعات حديثة · نادي رجال الأعمال · مقالات وأخبار · تواصل معنا | Next international exhibitions · Advertisers' products in issue 560 · Issue 560 · October 2026 · Company directory · Modern products and industries · AAT Business Club · Articles & news · Contact us |
| Photo caption | خلاط صحي · ماليزيا / منتجات وصناعات حديثة | Sanitary mixer · Malaysia / Modern products and industries |
| Spread caption | صفحتا 2 و3 من العدد | Pages 2 and 3 of the issue |
| Page stamp | ص. N | p. N |

All other texts come from data.json (`i18n`, `config`, `about`, `club`, `magazine`, `advertise`).

### 8.3 Counts and numbers
- Exact and computed from data.json at runtime: shows **1,464** (1,043 in 2027 + 421 in 2028; 465 dated, 999 month-only) in **14** countries with shows (the site covers 16; Afghanistan and Yemen have none); **35** advertisers (29 with a logo); **127** products from **28** companies (53 pictures in the sample); **40** modern items in **6** groups; **37** articles (13 in issue 560 + 24 older); **26** news; **2,831** members; issue **560**, **100** pages, **45** years, since **1982**. The cover text's "36 معلناً" stays as printed.
- **Arabic counted nouns**: n mod 100 = 3–10 → plural (9 معارض، 105 معارض، 3 شركات); 11–99 → singular accusative (125 معرضاً، 1,464 معرضاً، 35 شركة، 127 منتجاً، 2,831 عضواً); 0–2 (100, 200, 101…) → singular (100 معرض، 200 منتج). Use this rule everywhere a count is printed.

### 8.4 Tone and rules
- Formal, inviting, short. Facts before adjectives. No exclamation marks or emojis in UI copy.
- One title per section; no small kicker labels above headings (do not show any `*_kicker` i18n key); no "see all" links beside titles.
- No placeholder text (TBA, "to be announced", "يُعلن لاحقاً", "قريباً", "الشهر فقط", "approx", "coming soon", "—"). Unknown is hidden.
- No links or credits to EventsEye or other sources. No "Brands you can trust" strip (files not available).
- Blue only for web and e-mail addresses on light backgrounds.
- No prices, plans or services lists; no CEO name (unconfirmed).

---

## 9. Don't (owner rules and the judges' still-valid findings)
1. No text under 16 px (17 px for anything but the four exceptions in §3.3); no thin grey secondary text; no body under 19 px.
2. No dull opening: every page starts with the navy board (title + figure + picture or seal). No pale title on an empty background.
3. No white newspaper look, serif fonts, hairline-only layout, centred masthead logo (the rejected gazette).
4. No second dark colour (no teal/deep sea, no near-black), no brass outside big figures on navy, no yellow highlighter, no gradients except the soft light pools on navy bands, the conveyor's 6 % edge fade and the trade line's own line.
5. No red gradient banners, red background behind paragraphs, gradient cards, tilted cover, giant decorative "45", dotted map, sector photo tiles.
6. No swash, swoosh or hooked-pair symbol or pattern; no redrawn logos; no seal with invented ring text; no upside-down ring text.
7. No generic glyph buttons for WhatsApp, Viber or LINE: use the real app icons.
8. **No Taliban banner (`img/flags/af.png`) anywhere; no country with 0 shows (Afghanistan, Yemen) in any chooser, trade line or count.**
9. No floating pill menu, no hamburger-only PC menu, no menu wrapping 7 + 1 (use two even rows of 4), no hidden menu at any PC width.
10. No floating chat element covering headings, counts, buttons or the cover at any width; no element covering content.
11. No Latin names clipped at the start, ellipsis at the wrong end, flipped word order or flipped ranges ("19–18") in RTL; no dangling "·".
12. No half-empty sections, no lone card in a wide row, no white voids.
13. No duplicate actions in one section; no two search fields on one screen (the home board's search replaces any other search on that screen).
14. No dark mode, no YouTube, no splash or intro, no layout jump after first paint, no reveal-on-scroll, no counting numbers.
15. No form that pretends to send; no newsletter input in the prototype.
16. No placeholder images; an item without a shipped picture has no picture box.
17. No stock or AI photographs; only the real pictures in `img/`.

---

## 10. Builders' QA (before saying "done")

### 10.1 Checks
- Screenshots of every route in **ar and en** at **1920, 1366, 1100, 960 and 390**, after scrolling so lazy content loads. Look at them yourself, against `concepts/fusion/tile-*.png`.
- **0** page errors and **0** failed requests.
- Automated scan (extend `concepts/fusion/shoot.js`): smallest rendered text ≥ 16 px (list every element under 17 px and check it is one of the four exceptions); text/background pairs only from §3.1; Latin outside `bdi`/`[dir=ltr]` inside `[dir=rtl]` = 0; broken images = 0; elements outside the viewport sideways = 0; horizontal scroll = no; `af.png` never in the DOM; fonts loaded = Changa, Readex Pro (and Noto Sans TC for the ribbon).
- First-screen checks of §6.2 home 1 at 1920 × 950, 1366 × 768 and 390 × 844.
- Menu: one row or two even rows of 4 at every PC width in every language; never hidden; sticky.
- Conveyor moves at ~42 px/s on a 4× throttled CPU, pauses on hover/touch, stops under reduced motion.
- Exhibitions interactive in < 1 s on a 4× throttled CPU; counts per country, field and month equal data.json.
- Reader: the page fits the window height, two pages only when both fit, an ad tap opens the panel and never changes the page.
- The image sample stays under 180 files and 8 MB (`node data/verify.js`).

### 10.2 mustFix (judges' findings) → where they are resolved

| mustFix | Resolved in |
|---|---|
| Dull opening ("like inviting an old guest"); "warmer, redder opening" | §4.4 navy board on every page, §2.2 motifs, §5.1 red ribbon, red buttons and counters' edges |
| RTL clipping and wrong-end ellipsis of Latin names in shelf, grids and cards | §4.5 card rules, §7 clamping + `arx()` + check script |
| Restructure visible in the menu (directory, merged reading, about/advertise out of the menu) | §5.1 menu, §6.1 routes |
| Phone first screen (no 4-row bar; content visible) | §5.2 phone header, §5.3 tab bar, §6.2 first-screen checks |
| Real app icons; no redrawn seal | §3.1 app icons, §2.2 motif 7 (approved `clubMark()`) |
| Weak-eyesight pass | §3.2 Readex Pro, §3.3 scale (body 20, secondary 17–18, nothing under 16) |
| Layout gaps (lone card, half-empty blocks) | §4.7 grids, §9.12 |
| Chat tab overlaps | §5.4 (masthead button; PC floating button only after scroll, bottom-left, checked; phone tab) |
| English menu wrap at 1366 | §5.1 two even rows of 4, measured per language |
| Country counts link to `#exhibitions-CC`; field on every row; month-only at the end of the month; per-month rendering | §2.2 motif 2, §6.7 |
| Reader: fit to height, two pages only when both fit, ad tap opens the panel | §6.4 |
| Seal ring text upside-down / invented | §2.2 motif 7 |
| Afghanistan flag; countries with 0 shows | §2.2 motif 2, §9.8 |
| Flipped number ranges ("ص. 55–52") | §7 number ranges |
