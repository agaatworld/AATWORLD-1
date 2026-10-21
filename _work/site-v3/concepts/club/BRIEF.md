# Concept "The Business Club" (slug `club`) — design brief for the new aatworld.com

AAT is a 45-year-old trade publication whose owner also runs a Business Club of 2,831 members. This concept organises the whole site as that club: a formal house with a reception, a reading room, a members' directory, an exhibitions ledger and a membership office. Deep ink, the logo's red, one brass accent, serif type, seals and ruled ledgers. Everything the owner loves is kept (large clear text, the moving product shelf, real logos, the red AAT script logo); everything else is rebuilt.

Style tiles: `tile-ar.html` / `tile-en.html` (screenshots `tile-ar-1920.png`, `tile-en-1920.png`, `tile-ar-390.png`, `tile-ar-full.png`, `tile-ar-1366.png`, `tile-en-full.png`, `ref-vs-new.png`). Built by `build_tile.py` from `../../data/data.json` (every text is real); screenshots by `shoot.js` (which also prints the smallest rendered text, loaded fonts, broken images and horizontal overflow); `ref-vs-new.png` by `compare.py`. Contrast figures from `contrast.py`.

---

## 1. Difference statement (today → new)

1. **Header.** Today: a floating white rounded pill with eight menu words, logo squeezed at the end. → A newspaper masthead on a white page: a red trilingual ribbon on top ("التجارة العربية الآسيوية · Arab Asian Trade · 中阿商業雜誌" and the issue number, exactly like the band on the printed cover), a 64px logo on its own row, a square-cornered nav bar of six items beneath it, a brass rule closing it.
2. **Home opening.** Today: the moving shelf first, then a red gradient banner with a giant "45". → An ink (near-black) invitation card: the group's name in serif, the claim line in brass, the welcome paragraph, two rectangular buttons ("انضم إلى نادي رجال الأعمال" / "اقرأ العدد 560"), a row of four brass figures (45 · 560 · 2,831 · 1,464) and the club seal. The owner sees ink + seal + serif within one second; nothing of the current red-gradient look remains.
3. **Navigation and site map.** Today: 8 items (Magazine, Articles, News, Exhibitions, Products, Club, About, Contact). → 6 items. Articles and News are merged into the Magazine ("قاعة القراءة" inside the issue page); Advertising and Turnkey projects are merged into the Business Club as "services"; About lives in the footer and on the home page. Fewer doors, each one bigger.
4. **How content is grouped.** Today: products in bands per field; companies behind a separate route. → The catalogue is organised **by member (advertiser)**: each company is a card with its logo, city, magazine page stamp and its own products beneath; modern industries follow in their six groups. The advertiser is the unit, as in the printed magazine.
5. **Exhibitions.** Today: 16 flag tiles, a chip row, then rounded rows. → A **ledger**: month headings in serif, ruled rows (date in brass tabular figures | show | city and country with flag | field), with country and field lists in a side column on PC and two big filter buttons on the phone.
6. **Layout language.** Today: rounded cards (16–24px radius), gradients, shadows, pill buttons, dark hero blocks, red bands between everything. → **Square corners everywhere**, one-pixel hairlines, no shadows, no gradients; sections separated by alternating white / cool-grey bands and hairlines; ink bands only for the invitation, the club and the footer.
7. **Typography.** Today: one Kufi-style sans (Jazeera) for everything, Rubik-like Latin. → A serif voice: **Amiri** for Arabic headings, **Noto Naskh Arabic** for Arabic text, **Newsreader** for Latin headings, figures and the seal, **Source Serif 4** for Latin text. Reads like a printed trade journal and a club charter, not like an app.
8. **Colour.** Today: red gradients as backgrounds on every page opening, section titles red, white/cream bands. → Red is used only where it means something: the logo, the ribbon, the primary button, the seal rings, the 4px rule under section titles, page stamps. Backgrounds are ink, white and cool grey; brass (#7E6128 / #D4B46A) is the single accent for figures, dates and rules.
9. **Motifs.** Today: nothing branded beyond the logo and the (removed) swoosh. → Two motifs from AAT's own world: the **seal** (round stamp "AAT BUSINESS CLUB · TAIPEI · SINCE 1982" with the real logo inside) and the **ledger / catalogue rule** (hairlines, page stamps "صفحة 3", tabular dates). No swoosh anywhere.
10. **Section titles.** Today: title with a short red bar, sometimes a count badge, sometimes a "see all" link. → One serif title per section with a 4px red underline, nothing else beside it; actions are buttons at the end of the section.
11. **Figures and dates.** Today: numbers in the same bold sans as words. → All numbers (counts, dates, page numbers, phone) in Newsreader/Source Serif lining tabular figures, brass where they are the point (dates, totals), so a date column lines up like a printed timetable.
12. **The feel.** Today: a bright, busy marketplace. → A quiet, established house: more whitespace, fewer colours, heavier type, and the visitor is addressed as a guest being invited into a circle ("انضم إلى نادي رجال الأعمال" is the first button on the site).

## 2. Identity

- **The logo** (`img/brand/aat-logo-red.svg`, `img/logo.png`; white version in the footer) is the only mark. Header: red logo, 64px high on PC, 44px on phones, at the reading-start side of its own masthead row. Footer: white logo 56px high on ink. Inside the seal: the red logo on a white disc. Favicon: a 32px white disc with a red double ring and "AAT" in Newsreader bold (the seal reduced), so the tab icon matches the seal on the page; never a cropped letter from the logo.
- **Tagline** "Ideas For Business" is only ever shown as part of the logo (it is printed in it). The seal caption and the footer line use the magazine's real claim ("المجلة الإعلانية الاقتصادية الشهرية الوحيدة من نوعها…").
- **Motif 1 — the seal.** An SVG: white disc, outer red ring (3px), inner red ring (2px), ring text "AAT BUSINESS CLUB · TAIPEI · SINCE 1982 ·" in Newsreader 700, 18px at 240px diameter (never smaller than 240px so the ring text stays ≥ 16px), the real logo inside, "1982 · 2026" in brass beneath. Uses: home opening, club page opening, club band, join confirmation, membership certificate print, 404. It is a stamp of membership, not decoration: it never appears on product or exhibition pages.
- **Motif 2 — the ledger.** Hairline-ruled rows, a brass figure column, serif month/page headings, and the small red **page stamp** ("صفحة 3" / "page 3") on every advertiser card, which ties the site to the printed issue.
- **Motif 3 — the cover ribbon.** The red trilingual band from the printed cover becomes the first strip of every page; it carries the issue number and month. This is what makes the site unmistakably AAT: the printed cover's own top band, the real logo, and the seal.

## 3. Colour tokens (light theme only)

| token | hex | role |
|---|---|---|
| `ink` | #141821 | all text on light backgrounds; background of the invitation, the club band, the magazine reader |
| `ink-2` | #242B38 | footer background; hover row on ink; secondary panel on ink |
| `red` | #D21F26 | the logo's red (fixed): ribbon, primary button, seal rings, 4px rule under section titles, page stamps, active nav underline, chat tab |
| `red-deep` | #A4161C | primary button hover/pressed |
| `brass` | #7E6128 | accent on light backgrounds: dates in the ledger, page numbers in the contents, figures; text only at ≥ 17px bold (passes 4.5:1 on paper and on panel, so no large-text exception is needed) |
| `brass-light` | #D4B46A | accent on ink: the big figures, rules, footer column titles, the sub-line of the invitation; the 6px rule under the masthead |
| `paper` | #FFFFFF | page and card background |
| `panel` | #EDEFF2 | alternating section band (cool grey, not cream) |
| `line` | #C9CDD6 | hairlines, card borders, table rules (decorative, never text) |
| `muted` | #4A5160 | secondary text (categories, cities, captions), always ≥ 16px |
| `link` | #0B4F9C | web and e-mail addresses on light backgrounds only; never inside buttons, red boxes or on ink (there they are white) |

Where red is **not** used: no red backgrounds behind text blocks, no red section bands, no red titles, no red text on ink (3.35:1 fails), no red hover washes. Red stays small and sharp so it reads as the logo's colour.

Contrast (WCAG, computed by `contrast.py`):

| text on background | ratio | pass |
|---|---|---|
| ink on paper | 17.76:1 | AA |
| ink on panel | 15.42:1 | AA |
| muted on paper | 7.96:1 | AA |
| muted on panel | 6.91:1 | AA |
| brass on paper | 5.79:1 | AA |
| brass on panel | 5.03:1 | AA |
| white on red | 5.30:1 | AA |
| white on red-deep | 7.75:1 | AA |
| white on ink | 17.76:1 | AA |
| white on ink-2 | 14.21:1 | AA |
| brass-light on ink | 8.91:1 | AA |
| brass-light on ink-2 | 7.13:1 | AA |
| link on paper | 8.04:1 | AA |
| link on panel | 6.98:1 | AA |
| red on paper (stamps, counts) | 5.30:1 | AA |
| red on panel | 4.60:1 | AA |
| red on ink | 3.35:1 | **not used for text** |

## 4. Typography

| role | face (Google Fonts) | weights | why |
|---|---|---|---|
| Arabic headings (H1–H3, figures captions) | **Amiri** | 700 | A book Naskh with real calligraphic authority; looks like the titles of a printed Arabic trade journal, nothing like the Kufi sans of today. |
| Arabic text, menu, buttons, tables | **Noto Naskh Arabic** | 400 / 600 / 700 | The newspaper Naskh older readers have read all their lives; very even at 19–21px, strong bold for menus. |
| Latin headings, figures, dates, seal | **Newsreader** (opsz 6–72) | 600 / 700 | A news serif with an optical-size axis: crisp at 56px figures and at 18px ring text; formal without being Playfair. |
| Latin text, menu, buttons, tables | **Source Serif 4** (opsz 8–60) | 400 / 600 / 700 | Wide, open serif with lining tabular figures; pairs naturally with Noto Naskh in mixed lines. |

Font stacks per character: `--display: 'Newsreader','Amiri'` and `--body: 'Source Serif 4','Noto Naskh Arabic'` — Latin letters and digits always take the Latin face, Arabic letters the Arabic face, so a Latin company name inside an Arabic line keeps one voice.

LARGE MODE scale (PC / phone):

| element | PC | phone | line-height |
|---|---|---|---|
| H1 (page opening) | 52px | 36px | 1.45 Arabic / 1.3 Latin |
| H2 (section title) | 40px | 30px | 1.45 / 1.3 |
| H3 (sub-title, card title) | 26px | 22px | 1.45 / 1.3 |
| opening sub-line | 28px brass-light, 700 | 23px | 1.45 |
| big figures | 56px Newsreader 600 | 42px | 1.05 |
| lead paragraph | 23px Arabic / 22px Latin | 20px | 1.85 / 1.7 |
| body paragraph | 20px Arabic / 19px Latin | 19px | 1.85 / 1.7 |
| menu | 21px bold | menu button 18px bold | 1.3 |
| buttons | 20px bold, 58px tall, 16×30px padding | same, full width | 1.2 |
| ledger date | 22px Newsreader 600 brass | 21px | 1.5 |
| ledger cells, lists | 19px | 19px | 1.5 |
| captions, categories, stamps, ribbon | 17px (16px minimum anywhere) | 16px | 1.4 |

Arabic line-height is 1.85 for text and 1.45 for headings (Amiri needs room for its tall ascenders and deep descenders). Numerals: Western digits everywhere (as the data has them), `font-variant-numeric: lining-nums tabular-nums` on the whole page so figures and dates align; day ranges are isolated (`<span dir="ltr">11–14</span>`) so they never flip in RTL. Nothing on the site is under 16px; a `floorText()`-style pass remains in the build as a safety net but the scale above already satisfies it.

## 5. Layout language

- **Grid.** 12 columns, content width 1320px (1440px above 1600px screens), 24px gutters on PC, 16px on phone. Two-column sections use 7/5 (invitation), 360px + rest (the issue), 300px + rest (club); card grids 6 → 4 → 2 columns.
- **Rhythm.** Section padding 64px (44px phone); 30px from a section title to its content; cards gap 18px; ledger rows 14px padding. Spacing steps: 8, 12, 16, 24, 32, 48, 64.
- **Section separation.** Alternating bands: white → panel (#EDEFF2) → white, each separated by a 1px `line`; ink bands (invitation, club) carry a 6px brass rule on top. No red bands.
- **Section title.** One H2 at the reading start, with a 4px red underline the width of the title. No kicker above, no count badge, no "see all" link beside it. Actions are buttons at the end of the section.
- **Cards.** Square corners, 1px `line` border, white, no shadow, no hover lift. Logo card: 152px logo box with a 42px zone reserved at the top for the red page stamp (the stamp never touches the logo; 132px box with a 40px zone on phones), logo ≤ 84px high (70px on phones), real file, never redrawn; a company without a logo file shows its Latin name in Newsreader 24px in the box — no grey placeholder), name 17px bold, category · city 16px muted, red page stamp top corner. Product card (shelf): 186px picture box on white, logo chip + company, product name 18px bold two lines.
- **Buttons.** Rectangular, 2px border, 20px bold, 58px tall. Primary: red fill, white text. Secondary: ink outline on light, white outline on ink. Never blue, never rounded, never a gradient.
- **Chips / filters.** Rectangular tabs with a hairline, 18px bold; the active one is ink with white text. On PC the exhibition filters are vertical lists (flag + name + count) in a side column; on phones two full-width buttons ("الدولة", "المجال") open a full-screen list.
- **Tables / rows.** The ledger: header row 17px muted with a 2px ink rule, rows with 1px `line`, date column brass tabular, name bold, flag 30×20 with a hairline. On phones each row stacks (date, name, place, field) inside the same ruled block.
- **Images.** Square-cornered frames with a hairline and 10px white mat (the cover), product pictures `object-fit: contain` on white, article pictures 16:9 `cover`. Items without a shipped picture are laid out without a picture box.
- **Logo cards** are the only place logos appear besides the shelf chips; always on white, never on ink or red.

## 6. Site structure

Routes (hash): `#home`, `#magazine` (+ `#article-<id>`, `#news`, `#news-<id>`, `#flip` = the reader), `#products` (+ `#company-<id>`, `#product-<id>-<k>`, `#modern-<id>`), `#exhibitions` (+ `#exhibition-<id>`), `#club` (+ anchors `#advertise`, `#turnkey`), `#contact`, `#about`.

| page | what it is for | compared with today |
|---|---|---|
| الرئيسية `#home` | the reception: invitation, this month's issue, advertisers, next month's shows, reading room, the club, contact | rebuilt (see list below) |
| المجلة `#magazine` | the issue: cover + contents, the reader, **articles**, **news**, PDF, previous issue | Articles and News pages **merged** here |
| منتجات وصناعات حديثة `#products` | catalogue by advertiser (logo card + products), then modern industries in 6 groups, with search and field chips | regrouped: per company instead of per field |
| معارض دولية `#exhibitions` | the ledger of 1,464 shows, filters by country, field, search | rebuilt as a ledger with a side column |
| نادي رجال الأعمال `#club` | membership: goals, 8 benefits, 2,831 members, join; **services**: advertising positions, turnkey projects, brochure distribution | Advertise page **merged** here as "services" |
| تواصل معنا `#contact` | phone + app icons, e-mail, address (English), newsletter, the assistant | kept, simplified |
| من نحن `#about` | the old WordPress text, facts, the owner | removed from the top menu; linked from the footer and the "45" figure |

**Home, in order** (content source → reason):
1. Ribbon + masthead (config.siteName, magazine.number/month) — identity first, like the printed cover.
2. Invitation (config.groupName, about.first, about.heroLead, facts, club.members.count, shows count, the seal) — says who AAT is and invites the visitor to join; the two most valuable actions (join, read) are the first buttons.
3. Showcase shelf (one pictured product per advertiser, moving) — the owner's favourite element, placed right under the invitation where the eye lands after the figures.
4. The issue (magazine cover, coverText, toc.articles with page numbers, ads count; buttons read / PDF) — the magazine is the product.
5. Advertisers in this issue (companies: logo, Arabic/Latin name, category · city, page stamp; 36 cards) — the members' wall; every advertiser gets equal, dignified space.
6. International exhibitions — next month (exact-date shows of the coming month, 8 rows, then one button to the ledger) — the second reason readers visit.
7. Reading room (3 fresh articles + 3 news in one ruled list, pictures where shipped) — editorial content below the commercial content, as in the magazine.
8. The Business Club band (seal, lead, the 8 benefits as a numbered ledger in two columns — one column on phones — members line, join buttons) — the membership office, dark and formal, close to the end where a decided visitor acts.
9. Contact (phone, app icons, e-mail in link blue, English address, newsletter) — every page ends with a way to reach the owner.
10. Footer (white logo, trilingual name, claim, Explore, Services, Contact, address, ©, privacy).

**Header behaviour.** PC (≥ 700px): ribbon (17px) → masthead row (logo start, "English"/"العربية" switch + "اللغات" globe button end, 100px) → nav bar (six items, 21px bold, active item 4px red underline). The header is static (scrolls away); a slim 56px sticky bar with the logo and "القائمة" appears after the invitation is passed, so the menu is reachable without the tall masthead following the reader. 700–1100px: same, nav gaps 24px, items wrap to two lines if needed (never hidden). Phone: ribbon shows only the issue line; masthead row = logo 44px + "English" + "القائمة" (icon + word); the menu opens a full-screen ink panel with the six items at 24px, the five languages, phone and WhatsApp.

**Footer.** Ink-2 band: white logo; the three names and the claim; "تصفّح" (six items + من نحن); "الخدمات" (الإعلان في المجلة، نادي رجال الأعمال، مشاريع تسليم المفتاح، توزيع البروشورات في المعارض); "تواصل معنا" (phone, e-mail, address in English, LTR); bottom line © 2026 مجموعة التجارة العربية الآسيوية · جميع الحقوق محفوظة · الخصوصية. No YouTube, no social icons, no credits.

## 7. Key screens

- **Exhibitions ledger.** Ink opening: "معارض دولية" + "1,464 معرضاً في 16 دولة، من يناير 2027". PC: side column (start side, 300px) with a search field (20px), the country list (flag, name, count; the selected row turns ink) and the field list (18, with counts); main column: month headings in Amiri/Newsreader ("يناير 2027 — 76 معرضاً"), ledger rows date | show | city, country | field; shows known only by month are listed at the end of the month block with the month as their date (a fact, not a placeholder). Rows are rendered in batches of 60 as the reader scrolls (1,464 rows stay fast on a slow phone). Phone: two full-width filter buttons and a search field above the list; rows stack. `#exhibition-<id>`: a ledger card with name, dates, city, country, venue (row hidden when unknown), field, sector, and a button to ask the assistant about it.
- **Products / modern industries.** Ink opening; search field + field chips; then one block per advertiser: the logo card as a header (logo, name, city, page stamp, "تواصل" and "في المجلة" buttons), its products as square frames in a row (picture + name; without a shipped picture, name + description in a ruled list); then "صناعات حديثة" in 6 groups, each a ruled list with the 3 shipped pictures where they exist. `#company-<id>` repeats the block in full with about/contact; `#product-<id>-<k>` is a two-column sheet: picture (if any) and the facts, with "على موقعهم" in link blue.
- **Magazine reader.** Full-screen, ink background. The red ribbon stays as a 40px bar: "العدد 560 · أكتوبر 2026" and "ص 12 / 100". Page pictures (1100×1555) are scaled so the page height equals the window height minus the bar; two pages side by side on PC when 2 × page width fits, one on phones. Side column on PC (start side) with: المحتويات, PDF, ملء الشاشة, English, تكبير; on phones a bottom bar with the same five at 18px. Tapping an advertiser's page opens the **company panel** sliding in from the end side (logo, about, products, tel/e-mail/web buttons, "صفحة 3") and never turns the page; closing it returns to the same spread. The contents drawer lists the 13 articles and 45 ad pages with thumbnails and page stamps.
- **Business Club.** Ink opening with the 260px seal and "نادي رجال الأعمال (AATBC)"; white: goals (two paragraphs); panel: the 8 benefits as a numbered ledger; white: "شركاؤنا" + "2,831 عضواً" with an index of names (first 60, button for the rest); ink band: "للمشاركة في نادي رجال الأعمال" — phone, app icons, e-mail, WhatsApp message button; then **services**: advertising positions (6 rows: position | in print | online, each row stamped with the example company's page), turnkey projects (7 groups in a ledger), brochure distribution (benefit 8). A member who joins gets a seal-stamped confirmation screen.
- **Contact.** The phone number at 40px Newsreader, under it the app row (WhatsApp, Viber open a chat; Botim, imo, BiP, LINE copy the number — real icons where files exist, otherwise the name in a rectangular chip), e-mail in link blue, the address in English in an LTR block, the newsletter box, the privacy line.
- **Assistant.** A red tab at the bottom-left of every page ("محادثة 24 ساعة"). Opens a 420px panel (full screen on phones) styled as the club's concierge: ink header with a 48px seal and "مساعد AAT", white body, 19px text, the visitor's lines on panel grey, AAT's lines on white with a brass rule; six quick questions as rectangular chips (معارض في دبي، معارض الأغذية، منتجات البلاستيك، كيف أعلن، كيف أنضم، رقم الهاتف). Answers come from the site's own data as today.

## 8. RTL and languages

- Arabic is the default: `<html lang="ar" dir="rtl">`; all CSS uses logical properties (`inset-inline-start`, `padding-inline`, `border-inline-end`) so the English version is the same stylesheet with `dir="ltr"`. Mirrored: masthead (logo right in Arabic, left in English), nav order, the invitation (text right, seal left), ledger columns (date first = right), card stamps (top-start corner), the chat tab stays at the physical bottom-left in both (owner's decision).
- Latin runs inside Arabic (company and show names, product codes, e-mails, phone, "AAT Tube") are wrapped in `<bdi>` / `dir="ltr"` so their word order and punctuation never flip; product names are LTR blocks right-aligned in Arabic cards so the ellipsis falls at the end. Day ranges "11–14" are LTR spans. The address is always the English text in an LTR block, even on the Arabic site.
- English version: Newsreader / Source Serif 4, 19px body, same structure; the ribbon reads "Arab Asian Trade · التجارة العربية الآسيوية · 中阿商業雜誌". zh-TW, zh-CN and Malay use the same layout with Noto Sans TC / Noto Sans SC / Source Serif 4 and the existing 252-key dictionary; Arabic-only content (fresh articles, modern industries) shows in Arabic with the item name translated, as today.
- Arrows and ticks are drawn as inline SVG that flips with `dir` (`transform: scaleX(-1)` under `[dir=rtl]`).

## 9. Motion

- **Moves:** the showcase shelf, continuously at ~40px/s (70s per loop, duplicated track), pauses while the pointer is over it or a card is focused; direction follows the reading direction. The company panel in the reader slides in (250ms). The menu panel on phones slides down (200ms). The assistant panel opens with a 200ms fade.
- **Never moves:** the seal (no rotation), headings, figures (no counting animation), backgrounds (no parallax, no gradients, no splash screen), cards (no hover lift), page turns in the reader use the existing StPageFlip turn only when the reader taps the page edge.
- No motion starts after the content is shown; the layout is reserved so nothing jumps on first open.

## 10. Why the owner will love it

1. "I want to see the restructure" — ink masthead, seal, serif, six-item nav and a ledger instead of tiles: nothing on the first screen looks like today's site, and the site map itself changed (8 pages → 6 doors).
2. "LARGE MODE everywhere" — menu 21px, buttons 20px, body 20px Naskh, dates 22px, figures 56px, nothing under 16px; measured in the tile, not assumed.
3. "Use original logos, not recreated" / "reels must move" — the only pictures of brands are the real logo files on white; the moving shelf is the second thing on the home page and moves on every device.
4. "Where are the section separators?" / "Just one of them!" — alternating white and grey bands with hairlines, one serif title with a red rule per section, no kicker, no "see all", no duplicate titles.
5. "The opening is dull, like inviting an old guest" — every page opens with an ink banner, a serif title, a brass rule and (on home and club) the seal; the visitor is literally invited to join the club in the first button.

## Risks for this owner

- He has read his own site in a bold Kufi sans for years; the Naskh/Amiri voice is a real change and he may call it "old". Mitigation: the weights are 700 and the sizes are large; the English side stays in a modern news serif.
- Ink (near-black) openings instead of red may feel "less AAT" to him at first; the ribbon, logo, seal rings and buttons keep the red present on every screen.
- "Advertise" and "Articles/News" are no longer menu words; he may look for them. Both are reachable in two taps and sit in the footer; the wording rules are kept.
- A tall masthead costs ~200px at the top on PC; a sticky slim bar compensates after scrolling.
- The seal must stay ≥ 240px so its ring text stays ≥ 16px; it cannot be used as a small badge (the favicon is a simplified version without the ring text).
