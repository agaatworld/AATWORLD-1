---
name: aat-web
description: A general way of thinking for building, fixing, checking and releasing ANY website (any owner, any brand, any language), learned from a demanding non-technical owner. Use it for every website task (new site, redesign, bug fix, content import, data lists, speed, security, release) and whenever the owner sends a screenshot or a complaint ("why", "where is", "nothing changed", "not working").
---

# AAT WEB: how to think about any website

This is a way of thinking, not one project's facts. The facts for a project (brand colours, files, people, rules) live in that project's `CLAUDE.md` or notes. Read them first. Then apply everything below.

## 1. Think like the owner, judge like the visitor
- **The truth is what the owner sees on their own screen.** Their PC at 100% zoom with system scaling, and their phone, not your test size. If they can't see it there, it isn't done.
- **Read the intent, not the spelling.** Short, angry, capital-letter messages with typos are precise requests. Decode them ("SECTIONIC SEPARATE" means "sections must be visibly separated").
- **A screenshot means "this exact spot is wrong, and probably others like it."** Fix the spot, then search the whole site for the same class of problem. Never fix only the example.
- **Don't ask what you can decide.** Choose the sensible option, do it, show it. Ask only about facts you can't know (names, texts, approvals, money).
- **Visitors are real people**: older readers, weak eyesight, slow phones, other languages. Design for the weakest reader, not the best device.

## 2. Critical thinking before touching code
1. **What is actually being asked?** Restate it in one sentence. What would make the owner say "yes, that's it"?
2. **Why did it happen?** Find the root cause (which rule, which file, which width, which cache), not the symptom.
3. **Where else does it happen?** Same component, other pages, other languages, other screen sizes, the static copy, the print/magazine version.
4. **What could my fix break?** Speed tweaks that kill animations, colour rules that reach buttons, hiding things that are needed at another width. Every fix gets a regression check.
5. **Is it real or only looks real?** A form that shows "thank you" but saves nothing, a chat that answers nothing useful, a list that is "about right": all count as broken.
6. **Is the data true?** Compare against the source. Count totals (per month, per category, per country), compare them with the source's own counts, and record the check.
7. **Be adversarial with your own work.** Before saying "done", try to prove it is wrong.

## 3. Design principles (any brand)
1. **One fixed theme.** Use the brand colours plus neutral black and white, and nothing else. Exceptions must have a clear rule (e.g. links/addresses in link-blue only on light backgrounds, never inside buttons or coloured boxes). Apply each rule identically everywhere. Mixed colours look like chaos.
2. **Large, bold, clear.** Minimum ~16px for any text and ~18px for paragraphs, big buttons and big menus. Measure it, don't guess. No tiny labels or kicker text.
3. **Clear structure.** One title per section, in the reading direction's start side. Clear visible separation between sections. No duplicate titles or "see all" clutter.
4. **Either a fact is there or it isn't.** No "TBA", "coming soon", "approx", "to be announced", or empty boxes. Show what is known, cleanly, or hide it.
5. **Original assets only.** Use real logos, real icons and real photos (official files, or cut from real pictures). Never redraw a famous logo; look-alikes look fake.
6. **Formal and trustworthy for a business audience.** Seals, badges and icons in the brand style, no cartoons.
7. **The site promotes its owner, not others.** No links or credit lines that send visitors to data sources or competitors, unless the owner wants them.
8. **Right-to-left done right.** Mirror the layout, wrap Latin runs inside Arabic/Hebrew text, check arrows and ticks, and keep things the owner wants in a fixed language (e.g. a postal address) fixed.
9. **Every language version is a first-class site.** Check each one, not just the default.
10. **Respect the owner's wording.** Use the exact names and terms they choose, everywhere, consistently.

## 4. Function, speed, stability
- **Works for real.** Forms save and notify, search finds things, the assistant answers from real content, buttons and links do something, contact icons open the right app or copy the number.
- **First open is calm.** No splash after the content, no jumping layout, no flash of an old version. Reserve space or keep placeholders invisible until ready.
- **Fast on weak devices.** Test with CPU throttling and a slow network. Lazy-load images, batch heavy lists, cache expensive work, keep image weight low. Never "optimise" by removing what the owner likes.
- **The header and menu are visible at every width** (wide, laptop, mid ~960–1180, tablet, phone).
- **No errors in the console.**

## 5. Security basics (every site)
- Escape everything that goes into HTML. Use a Content-Security-Policy with no inline scripts, `nosniff`, a frame policy, and a referrer policy.
- Server endpoints: validate input, rate-limit, store data outside public reach, never put secrets in the repo.
- Old systems living next to the new site (old CMS, plugins) are the weakest door: close known attack paths, keep them updated, never delete the owner's old data.

## 6. Checklist before saying "done"
1. Syntax-check every edited file.
2. Run the site locally and take real screenshots with a headless browser, after scrolling so lazy and reveal content shows:
   - every main page, every language, at ~1920, 1366, ~1100, ~960 and phone ~390 widths;
   - a slow-CPU first load, to look for jumps or flashes;
   - capture page errors (must be zero).
3. Automated scans: text smaller than the minimum, colours outside the theme, empty boxes, broken links and images.
4. Look at the screenshots yourself: theme, sizes, separation, titles, RTL, real logos, nothing missing.
5. Fix everything found, not only what was named, then check again.

## 7. Releasing so the owner actually sees it
- **"Nothing changed" is usually caching or a wrong upload, not the code.** Every release bumps the cache-buster on asset links and a visible version file (e.g. `/version.txt`). Ask the host to not cache the HTML.
- Give simple, numbered upload steps, and one way to confirm ("open /version.txt, it must say update N").
- Ship only site files, never working or source folders, and never touch the owner's other data on the server.
- Commit with a clear message and keep the project notes (`CLAUDE.md`) updated with decisions and open tasks.

## 8. Talking to the owner
- Use their language. Lead with the outcome. Give a short numbered list of **what changed and where to see it**. No jargon.
- Say plainly what is still waiting on them (texts, photos, settings only they can change) and why it matters.
- Never claim done without having looked. If something can't be done, say so and offer the nearest alternative.

## 9. Lessons from real complaints
| Complaint | Lesson |
|---|---|
| "Why is one blue and one red?" | One rule, applied identically everywhere. |
| "Email on the red button is unreadable" | Check every rule in every context (buttons, coloured boxes). |
| "Where is the top menu?" (at 100% zoom) | Test mid widths and system scaling. |
| "It shows the page, then goes back to the intro" | Nothing may appear after content is shown; no layout jumps. |
| "Why is it not moving any more?" | Optimisations must not remove features. |
| "Either the date is there or not!" | No placeholder text. |
| "Just one of them!" | One title, no duplicates. |
| "The assistant doesn't find products" | Test features with the owner's own real questions, in every language. |
| "Does it work functionally?" | Every form must deliver for real. |
| "Use original logos, not recreated" | Real assets only. |
| "Where are the section separators?" | Make the page structure visible. |
| "Nothing changed" | Cache-buster + version file + clear upload steps. |
| "In this last fix you made huge problems" | Regression-check everything around a fix. |
