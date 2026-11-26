# Competitor analysis: Windows screen-annotation overlays

Researched 2026-11-26. **Source notes:** learn.microsoft.com, epicpen.com, reddit, trustpilot and filehorse could not be reached from the sandbox (DNS blocked). I read the ZoomIt docs from their GitHub source files ([sysinternals zoomit.md](https://github.com/MicrosoftDocs/sysinternals/blob/main/sysinternals/downloads/zoomit.md), [PowerToys zoomit.md](https://github.com/MicrosoftDocs/windows-dev-docs/blob/docs/hub/powertoys/zoomit.md)). I also read the ZoomIt C++ source ([PowerToys src/modules/ZoomIt](https://github.com/microsoft/PowerToys/tree/main/src/modules/ZoomIt)) and cloned gInk, ppInk and DrawPen. **Epic Pen facts come only from search-engine extracts of epicpen.com pages and third-party reviews, so all of them are secondary and marked (unverified).**

---

## 1. Microsoft ZoomIt (Sysinternals v12.31, 5 Nov 2026; also shipped in PowerToys)

**Tools / organisation.** ZoomIt has no toolbar. Everything is driven from the keyboard, plus a tray settings dialog. Users ask for a button bar ([PowerToys #37212](https://github.com/microsoft/PowerToys/issues/37212): remembering the shortcuts is "quite taxing"). There is one pen at a time. Colours are picked by letter, and holding Shift on the letter gives the highlighter version of that colour. Width is changed with Ctrl+wheel or the arrow keys. Text, blur and white/black boards are available. The default font is Microsoft Sans Serif.

**Global hotkeys** (defaults in [ZoomItSettings.h](https://github.com/microsoft/PowerToys/blob/main/src/modules/ZoomIt/ZoomIt/ZoomItSettings.h)):

| Hotkey | Action |
|---|---|
| Ctrl+1 | Zoom |
| Ctrl+2 | Draw without zoom |
| Ctrl+3 | Break timer (default 10 min) |
| Ctrl+4 | LiveZoom |
| Ctrl+Shift+4 | LiveDraw |
| Ctrl+5 | Record. Ctrl+Shift+5 records a cropped area, Ctrl+Alt+5 records one window |
| Ctrl+6 | Snip to clipboard. Ctrl+Shift+6 snips to a file, Ctrl+Alt+6 snips with OCR |
| Ctrl+7 | DemoType. Ctrl+Shift+7 goes back one snippet |
| Ctrl+8 | Panorama. Ctrl+Shift+8 saves it |
| Ctrl+9 | DemoMirror |

Each hotkey is registered with `RegisterHotKey`, some with `MOD_NOREPEAT`.

**Keys inside draw mode** ([doc](https://github.com/MicrosoftDocs/sysinternals/blob/main/sysinternals/downloads/zoomit.md)):

| Key | Action |
|---|---|
| R G B Y O P | Pen colour: red, green, blue, yellow, orange, pink. Shift+letter gives the highlighter version |
| X | Blur pen |
| Hold Shift | Straight line |
| Hold Ctrl | Rectangle |
| Hold Tab | Ellipse |
| Hold Ctrl+Shift | Arrow |
| Ctrl+Z | Undo |
| E | Erase all |
| W / K | Whiteboard / blackboard |
| T / Shift+T | Text, left- / right-aligned |
| Space | Centre the cursor |
| Ctrl+C / Ctrl+S | Copy / save a screenshot. Add Shift to crop first |
| Esc or right-click | Exit |

**Switching modes.** Ctrl+2 freezes a screenshot of the monitor under the cursor (`CaptureScreenshot` → `MonitorFromPoint(cursor)`) and lets you draw on that image. The desktop cannot be used until you exit, and the ink is discarded when you leave. LiveDraw (Ctrl+Shift+4) uses a colour-keyed layered window (`LWA_COLORKEY` on black). A source comment says mouse messages "pass through to lower windows unless the system cursor is above a painted area", so clicks pass through except where there is ink. Blur and highlighter are disabled in LiveDraw (Zoomit.cpp ~L8252). **Escape** first leaves text mode; a second press leaves zoom/draw. Right-click always exits (`WM_RBUTTONDOWN → WM_USER_EXIT_MODE`).

**Multi-monitor / DPI.** The manifest declares `PerMonitorV2`. ZoomIt only ever works on one monitor, the one under the cursor. Reported problems:
- LiveZoom is broken on a secondary screen ([#38872](https://github.com/microsoft/PowerToys/issues/38872); [#40112](https://github.com/microsoft/PowerToys/issues/40112) "needs multi monitor support").
- The cursor is invisible on the second display ([#47736](https://github.com/microsoft/PowerToys/issues/47736)).
- Annotations do not appear for remote viewers in a Zoom screen share ([#37750](https://github.com/microsoft/PowerToys/issues/37750)).

**Top complaints** (PowerToys label Product-ZoomIt):
1. **AltGr = Ctrl+Alt.** On AZERTY, QWERTZ and Nordic layouts, typing `[`, `]` or `(` fires the Ctrl+Alt+digit hotkeys ([#37143](https://github.com/microsoft/PowerToys/issues/37143), 18 comments; [#37197](https://github.com/microsoft/PowerToys/issues/37197); [#37322](https://github.com/microsoft/PowerToys/issues/37322)). The DemoMirror default caused the same conflict ([#50125](https://github.com/microsoft/PowerToys/issues/50125)).
2. Shortcuts cannot be turned off one by one, and the error "hotkey already in use" appears ([#37155](https://github.com/microsoft/PowerToys/issues/37155), [#37139](https://github.com/microsoft/PowerToys/issues/37139), [#37629](https://github.com/microsoft/PowerToys/issues/37629), [#37817](https://github.com/microsoft/PowerToys/issues/37817)).
3. Cursor problems with pens and Windows Ink ([#37495](https://github.com/microsoft/PowerToys/issues/37495), [#41415](https://github.com/microsoft/PowerToys/issues/41415), [#37290](https://github.com/microsoft/PowerToys/issues/37290)).
4. Users want a persistent overlay with a floating toolbar, fading ink, objects that can be moved and deleted one at a time, and a laser pen ([#46084](https://github.com/microsoft/PowerToys/issues/46084), [#50817](https://github.com/microsoft/PowerToys/issues/50817), [#48716](https://github.com/microsoft/PowerToys/issues/48716)). A maintainer replied that ZoomIt "was built for this purpose". **This is the clearest gap for us.**
5. LiveZoom shows a black screen ([#37726](https://github.com/microsoft/PowerToys/issues/37726)) or a duplicate taskbar ([#48857](https://github.com/microsoft/PowerToys/issues/48857)). The ellipse cannot be drawn on some keyboards ([#43709](https://github.com/microsoft/PowerToys/issues/43709)).

**Ideas worth borrowing:** Shift+colour for the highlighter; the hold-modifier shape gestures; W/K boards; T/Shift+T text alignment; the break timer (with opacity, position and a lock-workstation option); LiveZoom; snip with OCR; right-click as a universal "get me out".

---

## 2. gInk ([geovens/gInk](https://github.com/geovens/gInk), C# WinForms on .NET Framework, MIT; v1.2.0 released 13 Feb 2023, last commit Feb 2025, effectively unmaintained)

**Tools / organisation.** One horizontal toolbar, docked at the bottom of the primary screen and sliding in. Its height is a fraction of the primary screen's height (`Toolbar_Height = 0.05`), and dragging it is off by default (`Allow_Dragging_Toolbar = False`). Buttons, in order: pens, eraser, pan, pointer, pen-width (hidden by default), ink visible, snapshot, undo, clear, dock, exit. There are **10 pen slots**, each a fixed colour + alpha + width in `pens.ini`. Five are enabled by default: red, blue, yellow, green, and an orange highlighter (alpha 80, width 500). There are no shapes or text; the README sends you to ppInk for those.

**Hotkeys** ([bin/hotkeys.ini](https://github.com/geovens/gInk/blob/master/bin/hotkeys.ini)):

| Hotkey | Action |
|---|---|
| **Ctrl+Alt+G** (global) | Start inking. Pressed again it switches between pointer mode and the last pen |
| 0–9 | Select pen |
| E | Eraser |
| V | Show/hide ink |
| Ctrl+Z / Ctrl+Y | Undo / redo |
| Ctrl+Alt+S | Snapshot |
| Esc | Exit |

Pointer, pan and clear have no hotkey. Only the global hotkey uses `RegisterHotKey(IntPtr.Zero…)` (Root.cs). The in-mode keys are read with `GetKeyState` in a 15 ms timer tick (FormCollection.cs ~L1100). `Allow_Hotkey_In_Pointer_Mode = False` by default.

**Click-through implementation** (FormDisplay.cs, FormCollection.cs, FormButtonHitter.cs). It uses **one set of windows spanning the whole virtual screen** (`SystemInformation.VirtualScreen`, height −2 px so an auto-hide taskbar can still be reached; changelog v1.0.5):
- *FormDisplay* is permanently `WS_EX_LAYERED|WS_EX_TRANSPARENT|WS_EX_TOOLWINDOW` and `HWND_TOPMOST`. It renders a GDI bitmap with `UpdateLayeredWindow(ULW_ALPHA)`.
- *FormCollection* captures input through a `Microsoft.Ink InkOverlay`. It is layered with `SetLayeredWindowAttributes(alpha=1, LWA_ALPHA)`, which keeps it invisible but still hit-testable. Pointer mode adds `WS_EX_TRANSPARENT` (`ToThrough`); drawing mode removes it (`ToUnThrough`).
- *FormButtonHitter* is a small topmost window placed over the toolbar, so the buttons can still be clicked in pointer mode.
- The manifest says `dpiAware=false`, so Windows bitmap-scales the overlay. This is the root of the DPI bugs listed below.

**Escape:** closes the snip, then the width panel, then exits. It is ignored in pointer mode.

**Recurring issues:**
1. Crash at launch after Windows updates: "Could not load file or assembly 'Microsoft.Ink'… built by a runtime newer" ([#238](https://github.com/geovens/gInk/issues/238), [#240](https://github.com/geovens/gInk/issues/240), [#236](https://github.com/geovens/gInk/issues/236); about KB5065426, Sep 2025).
2. Pen offset from the drawn line on a pen display ([#61](https://github.com/geovens/gInk/issues/61)). The fix offered is the mixed-DPI workaround.
3. Drawing covers only the top-left ~720p of the screen ([#187](https://github.com/geovens/gInk/issues/187)). Snapshot of a multi-screen setup is offset ([#156](https://github.com/geovens/gInk/issues/156)). The toolbar and width panel scale wrongly ([#182](https://github.com/geovens/gInk/issues/182)). The official workaround is the compatibility setting "Override high DPI → Application".
4. Stuck in pointer mode: the buttons are click-through or off-screen, and the only way out is the tray ([#17](https://github.com/geovens/gInk/issues/17)). The toolbar is missing or unavailable ([#150](https://github.com/geovens/gInk/issues/150), [#67](https://github.com/geovens/gInk/issues/67), [#58](https://github.com/geovens/gInk/issues/58) disappears after a snapshot).
5. UIThreadException after toggling the global hotkey 20–30 times ([#147](https://github.com/geovens/gInk/issues/147)). Crash when switching pens quickly ([#69](https://github.com/geovens/gInk/issues/69)). "Crash on Windows 10" ([#65](https://github.com/geovens/gInk/issues/65)).
6. Lag grows with the amount of ink ([#127](https://github.com/geovens/gInk/issues/127)). Memory keeps growing ([#157](https://github.com/geovens/gInk/issues/157)).
7. Stylus strokes are not anti-aliased ([#73](https://github.com/geovens/gInk/issues/73), 17 comments). No Wintab, and Windows Ink makes the pen feel like touch ([#131](https://github.com/geovens/gInk/issues/131)).
8. Snapshot is grey or covers the wrong area ([#11](https://github.com/geovens/gInk/issues/11), [#3](https://github.com/geovens/gInk/issues/3)). The ink-visible hotkey fails ([#51](https://github.com/geovens/gInk/issues/51)). Requests for a whiteboard ([#46](https://github.com/geovens/gInk/issues/46)) and for a smaller cursor ([#130](https://github.com/geovens/gInk/issues/130), [#95](https://github.com/geovens/gInk/issues/95)).

---

## 3. ppInk ([pubpub-zz/ppInk](https://github.com/pubpub-zz/ppInk); jeffcao/ppInk is a fork of it. Fork of gInk, v1.9.100, active: last commit 7 Nov 2026)

**Tools / organisation.** The toolbar can be horizontal or vertical. The pens sit on two rows (`Pens_On_Two_Lines = True`), and an optional secondary toolbar shows the sub-options of the current tool. A dock button (Space) folds the bar. Most buttons have several functions, chosen by clicking again or by a long/right click (1.2 s timer); a long click on a pen opens its settings dialog. Tools:
- hand, line/polyline/polygon, rectangle, ellipse;
- arrow, with custom PNG heads;
- **numbered tags**, with transparent, white, black or editable backgrounds;
- left- or right-aligned text;
- move/copy, edit, lasso, resize/rotate;
- cliparts, including animated APNG/GIF;
- pattern-along-stroke;
- clear-board, with a choice of white, black or custom background;
- two zoom modes (dynamic and frozen), spot mode, snapshot;
- video via FFmpeg or OBS;
- pages; save/load strokes; a REST API (for Stream Deck); window mode.

Fill cycles: none → pen colour → outside → white → black. Line styles: Stroke (pressure), Solid, Dash, Dot, DashDot, DashDotDot ([README](https://github.com/pubpub-zz/ppInk)). There are 10+ pens; the defaults in `pens.ini` are grey, red, blue, yellow, green, orange highlighter, white, pink and teal, plus a second page of highlighters.

**Default hotkeys** ([ppInk/hotkeys.ini](https://github.com/pubpub-zz/ppInk/blob/master/ppInk/hotkeys.ini)):

| Hotkey | Action |
|---|---|
| **Ctrl+Alt+G** (global) | Start inking, or toggle click-through |
| Ctrl+Shift+I (global) | Create an index entry |
| Esc | Close |
| Space | Dock/undock |
| H, L, R, O, A, T, N | Hand, Line, Rect, Oval, Arrow, Text, Number tag |
| M | Edit |
| G | Magnet |
| C | Clipart |
| Z | Zoom |
| Q | Lasso |
| P | Pan |
| S | Scale/rotate |
| E | Eraser |
| V | Show/hide ink |
| F | Toggle fading |
| D | Line style |
| K | Snapshot |
| Alt+R | Video |
| `~` / Ctrl+`~` | Colour pick / colour edit |
| Ctrl+Z / Ctrl+Y | Undo / redo |
| Ctrl+Shift+←/→ | Previous / next page |
| Ctrl+Shift+S / Ctrl+Shift+L | Save / load strokes |

Pens are on 1, 6, 2, 7, 3, 8, 4, 9, 5, 0, interleaved so they match the two rows. The mouse wheel sets the width and Shift+wheel switches pens; the two can be swapped in options. **Alt held = temporary tool**: the tool reverts when Alt is released (`Alt_As_Temporary_Command = True`, with `Spot_On_Alt` and `Arrow_On_Alt`). **Magnet**: Ctrl snaps to points, vertices, midpoints and text boxes; Shift snaps to horizontal, vertical and 15° steps (`Magnetic_Angle = 15`).

**Mode switching.** The same architecture as gInk (FormDisplay/FormCollection, `0x80000|0x20` toggles, virtual-screen-sized, `dpiAware=false`). An optional Direct2D output exists (`DirectX = False` by default; SharpDX/GameOverlay.dll).
- `AltTab_Pointer = True`: pressing Alt+Tab switches to pointer mode automatically.
- Snapping while in pointer mode is triggered by holding Shift or double-pressing Ctrl.
- `Erase_On_FocusLost` is an option.
- Ink is autosaved when inking ends.
- "Window mode" limits the canvas to a rectangle, so clicks outside it reach other apps.

**Recurring issues:**
1. Won't start after the Windows 11 update of Aug 2025 (KB5064401/KB5064081). .NET loaded the GAC copy of Microsoft.Ink.dll ([#346](https://github.com/pubpub-zz/ppInk/issues/346), 85 comments). Follow-up `UIPermission` crash in 1.9.99 ([#357](https://github.com/pubpub-zz/ppInk/issues/357), 58 comments).
2. Memory leak in fading made it crash as strokes piled up ([#75](https://github.com/pubpub-zz/ppInk/issues/75), 56 comments). Reports that shapes vanish were never reproduced.
3. Frequent crashes ([#43](https://github.com/pubpub-zz/ppInk/issues/43) 50 comments, [#68](https://github.com/pubpub-zz/ppInk/issues/68), [#158](https://github.com/pubpub-zz/ppInk/issues/158), [#120](https://github.com/pubpub-zz/ppInk/issues/120), [#199](https://github.com/pubpub-zz/ppInk/issues/199) "3x Z", [#381](https://github.com/pubpub-zz/ppInk/issues/381) switching tool by hotkey while the stylus is down). Crash on Turkish Windows ([#360](https://github.com/pubpub-zz/ppInk/issues/360)).
4. Pointer mode leaves on its own: clicking the screen goes back to paint mode, and the cursor is wrong ([#195](https://github.com/pubpub-zz/ppInk/issues/195), 26 comments, fixed in the Alt+Tab path). Closing another app gives focus to ppInk, which unfolds into draw mode ([#321](https://github.com/pubpub-zz/ppInk/issues/321), open). Toggling pointer mode with an Alt hotkey changes the fill mode ([#388](https://github.com/pubpub-zz/ppInk/issues/388)).
5. Toolbar invisible or not placeable on a multi-monitor setup ([#244](https://github.com/pubpub-zz/ppInk/issues/244), [#227](https://github.com/pubpub-zz/ppInk/issues/227), [#256](https://github.com/pubpub-zz/ppInk/issues/256), [#201](https://github.com/pubpub-zz/ppInk/issues/201), [#149](https://github.com/pubpub-zz/ppInk/issues/149)). Cannot be used on the 3rd monitor with mixed 125%/150% scaling ([#329](https://github.com/pubpub-zz/ppInk/issues/329)). A 4K secondary monitor is only partly covered ([#191](https://github.com/pubpub-zz/ppInk/issues/191)). Zoom shows the wrong region ([#132](https://github.com/pubpub-zz/ppInk/issues/132)). The answer is always the README DPI tip.
6. Stylus input lost after the tablet reconnects; it only comes back after opening a dialog. The maintainer blames Windows, and Epic Pen fails the same way ([#382](https://github.com/pubpub-zz/ppInk/issues/382)).
7. Esc exits the current drawing ([#277](https://github.com/pubpub-zz/ppInk/issues/277)). Win-key hotkeys cannot be set ([#330](https://github.com/pubpub-zz/ppInk/issues/330)). Two apps can share the same hotkey ([#297](https://github.com/pubpub-zz/ppInk/issues/297)). Jagged freehand strokes ([#232](https://github.com/pubpub-zz/ppInk/issues/232)).
8. Mirrored cursor is the wrong size ([#45](https://github.com/pubpub-zz/ppInk/issues/45)). The antivirus flags new builds ([#145](https://github.com/pubpub-zz/ppInk/issues/145)).

---

## 4. Epic Pen (commercial, Windows + macOS; v3.12.206, 6 Oct 2026) — all (unverified, secondary)

- **Tools.** Pen, highlighter, eraser, clear, screenshot, text, shapes (line, arrow, rectangle, ellipse), whiteboard/blackboard, fading ink, and a "highlighted cursor" halo. The free/Pro split is contradictory. An older user guide puts text, shapes, boards, fading ink and extra colours in Pro. The current creators page reportedly lists all of them, and 16 colours, as free ([search extract of epicpen.com/userguide, /creators](https://epicpen.com/userguide)).
- **Toolbar.** A small floating toolbar that can be dragged, with a colour palette (four quick colours in a [2023 blog](https://blog.epicpen.com/2023/05/10/5-things-you-didnt-know-about-epic-pen/)). The mouse wheel changes pen size, as an option. **Ghost Mode** hides the toolbar completely, after which you work only with hotkeys.
- **Hotkeys.** "Set a hotkey for every tool… must use Ctrl, Alt, Shift or Win". The defaults differ between sources:
  - [Windows Report](https://windowsreport.com/epic-pen-tool/): Ctrl+1 pen, Ctrl+2 highlighter, Ctrl+3 eraser, Ctrl+4/5 undo/redo, Ctrl+E clear, Ctrl+H toolbar.
  - [gHacks 2013](https://www.ghacks.net/2013/06/19/epic-pen-draw-directly-on-your-computer-screen/): Ctrl+1 hide ink, Ctrl+2 cursor mode.

  Either way, **Ctrl+1/Ctrl+2 clash with ZoomIt**. Customising hotkeys may be Pro-only.
- **Mode switching.** "While a drawing tool is selected, your clicks go to Epic Pen. Select the cursor (or press your hotkey) to go back to using your apps — your ink stays on screen" (user guide extract).
- **Multi-monitor, DPI and pressure.** Pressure works with Wacom and Surface. Version-history fixes include: "ink intermittently not working correctly on some multi monitor set ups" (3.12.200, 30 Sep 2026), moving the toolbar between monitors, a misaligned halo on multi-monitor, a fading-ink/halo offset (3.12.1), a blurry toolbar, and high-DPI UI scaling (2019) ([versionhistory](https://epicpen.com/versionhistory)).
- **Complaints** ([Trustpilot](https://www.trustpilot.com/review/epic-pen.com), 3.5/5 from 138 reviews):
  - features moved behind a subscription;
  - freezes on Windows 11, with the toolbar becoming unresponsive;
  - with several virtual desktops, the ink ends up on a different desktop than the toolbar (the vendor says it is aware of the problem);
  - high CPU use;
  - a licence that was never delivered.

---

## 5. Others (brief)

- **DrawPen** ([DmytroVasin/DrawPen](https://github.com/DmytroVasin/DrawPen), Electron, MIT, v0.0.62, 14 Nov 2026). This is the closest analogue to a webview stack like ours.
  - Global hotkey **Ctrl+Shift+A** switches between draw and pointer mode.
  - Tool keys: B/1 brush, P fade pen, A/R/D/O/S shapes (or 2), T/3 text, H/4 highlighter, L/5 laser, E/6 eraser, 7 cycles colour, 8 cycles width, `[` `]` width. Ctrl+T toolbar, Ctrl+E whiteboard, Ctrl+K clear.
  - Settings choose horizontal or vertical toolbar orientation and which tools/groups show. There is a Stamp figure and a Zoom mode (beta).
  - The overlay is one transparent `alwaysOnTop` window on **one display**: under the cursor, active, or fixed (`getLockedMonitor`/`getUnderCursorMonitor`). **Pointer mode hides the overlay window** (`hideWindow(mainWindow)`) and shows a small separate toolbar window. It does not use click-through, so the ink is not visible while you use other apps.
  - A display change hides the app (`handleDisplayChange`).
  - Wayland segfaults are listed as a known issue.
- **Presentation Pointer / PointerFocus** (Softpedia listings only, unverified). These are cursor tools: spotlight/highlight, click visualisation, large on-screen keystroke display, a simple screen pen, and a magnifier. Their **keystroke visualiser** and **cursor spotlight** are features none of the ink tools above have.

---

## 6. Hotkey conflict map (what to avoid / borrow)

| Combination | Taken by |
|---|---|
| Ctrl+1…Ctrl+9 (plus Shift/Alt variants on 4–8) | ZoomIt, default-on in PowerToys |
| Ctrl+1–5 | Epic Pen (unverified) |
| Ctrl+Alt+G | gInk/ppInk |
| Ctrl+Shift+A | DrawPen |
| **Any Ctrl+Alt+key** | Fires from AltGr on non-US layouts (ZoomIt's #1 bug class) |

**Conventions worth keeping inside draw mode** (they are not global):
- ZoomIt's colour letters, plus Shift for the highlighter variant.
- Hold Shift for a line, hold Ctrl for a rectangle.
- E, Ctrl+Z, T, W/K.
- Esc and right-click to exit.

ppInk uses R for Rectangle and G for Magnet, which collides with ZoomIt's R = red and G = green. Pick one scheme; ZoomIt's is the one more people already know.

---

## 7. Synthesis

| Capability | Who does it well | Convenient | Overcomplicated | Limitations | Opportunity for us |
|---|---|---|---|---|---|
| Toolbar | ppInk (orientation, two rows, dock); DrawPen (per-tool hide) | Dock or fold; Space to dock; Ghost Mode (Epic) | ppInk's multi-click/long-click buttons and fill cycles nobody finds | ZoomIt has none; gInk is fixed to the bottom, sized by % of the primary screen | Floating H/V bar, few big buttons, keys shown in tooltips, Ghost/hidden mode |
| Pens/colours | ZoomIt letters; gInk preset slots | Fixed presets (colour + width + alpha) in one click; wheel = width | ppInk's 20 pens over 2 pages plus a REST API | ZoomIt has one pen and 6 colours | 6–8 preset slots on 1–8; colour letters; Shift = highlighter |
| Shapes | ZoomIt modifier gestures; ppInk magnet | Hold Shift/Ctrl/Tab while dragging | ppInk's 5-state fill cycles | gInk has no shapes; LiveDraw has no blur or highlighter | Modifier gestures plus magnet at 15° on Shift |
| Draw ↔ click-through | Epic Pen and ppInk (ink stays visible) | A single global toggle; ppInk Alt+Tab goes to pointer mode | Mode changes driven by focus (ppInk #195, #321) | ZoomIt draws on a frozen image and loses the ink; DrawPen hides the ink | Persistent ink + `set_ignore_cursor_events` (tao sets `WS_EX_TRANSPARENT\|WS_EX_LAYERED`, the same as gInk's `ToThrough`); toolbar in its own window that is never click-through |
| Escape / recovery | ZoomIt (layered: text first, then exit; right-click) | Right-click to exit | ppInk Esc closes everything (#277) | gInk can get stuck in pointer mode (#17) | Esc = cancel shape → deselect → click-through, never clear; tray item "reset toolbar position" |
| Multi-monitor / DPI | Nobody does it fully | ZoomIt's monitor under the cursor is predictable | — | gInk/ppInk `dpiAware=false` on one virtual-screen window causes offsets, partial coverage and lost toolbars; ZoomIt and DrawPen cover one monitor only | One PerMonitorV2 overlay **per monitor**; clamp the toolbar to a work area on `WM_DISPLAYCHANGE` |
| Pen input | ppInk (pressure line style) | Pressure through Windows Ink | — | Microsoft.Ink.dll broke both apps in 2025 Windows updates; no Wintab; jagged stylus strokes; input lost after the tablet reconnects | Web Pointer Events with pressure, plus our own smoothing (perfect-freehand style); no dependency on legacy COM ink |
| Fading / laser | ppInk (fading per pen); DrawPen (fade pen and laser); Epic Pen | F toggles fading | ppInk fade timer settings | ppInk had a leak in fading (#75) | Laser and fade pens as first-class tools; ZoomIt users are asking for this (#48716) |
| Step tags / text | ppInk numbered tags; ZoomIt T/Shift+T | Auto-incrementing numbers | ppInk's text pop-up box (#342) | — | Click to place 1, 2, 3; edit text in place |
| Boards / zoom / timer / snip | ZoomIt (W/K, LiveZoom, break timer, OCR snip); ppInk spot mode | One key for a board | ppInk OBS/FFmpeg recording | ZoomIt's LiveZoom is buggy on a secondary monitor | Boards, spotlight and snip-to-clipboard; leave recording out |
| Persistence | ppInk (autosave, pages) | — | Pages UI | ZoomIt and gInk lose the ink on exit | Autosave the session and restore it on re-entry |

**Decision-relevant takeaways:**
1. Avoid Ctrl+digits and every Ctrl+Alt combination as defaults. Make every hotkey possible to unbind.
2. Use a separate toolbar window that never becomes click-through, and a per-monitor overlay.
3. Keep ink visible in click-through mode (Epic Pen, gInk and ppInk do; DrawPen and ZoomIt don't).
4. Make mode changes explicit, never driven by focus.
5. Don't depend on Microsoft.Ink.
6. Clear demand exists: PowerToys users are asking for exactly this persistent overlay with a toolbar ([#46084](https://github.com/microsoft/PowerToys/issues/46084), [#50817](https://github.com/microsoft/PowerToys/issues/50817)).
