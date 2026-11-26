# What is verified, and how

Honest status of every safety- or quality-relevant behaviour. "Windows" means a real Windows machine or the Windows CI runner; the browser preview simulates the native side and proves nothing about Windows.

| Area | How it is checked | Where |
|---|---|---|
| Mode state machine: only drawing mode captures input; quit/recovery always release | exhaustive unit tests | `cargo test -p explainer-core` |
| Global undo routing, grouped clear | unit tests | core |
| Settings merge patches, concurrent updates, corrupt/partial files | unit tests | core |
| Atomic writes, backup rotation, restore, corrupt-file recovery, path traversal | unit tests | core (`store`, `storage`) |
| Hotkey validation (needs Ctrl/Alt, reserved combos, duplicates) | unit tests | core |
| Toolbar placement on negative-coordinate / mixed monitors (math) | unit tests | core (`layout`) |
| Drawing engine: strokes, shapes, fill kept after edits, text, markers, images, erasers, select/move/resize/rotate, arrange, lock, duplicate, layered Escape, clear+undo, 2000-stroke stress, randomised undo/redo replay | unit tests | `npm test` |
| Scene file validation (garbage, NaN, huge numbers, bad colours, path-like image names) | unit tests | `npm test` |
| Toolbar panel geometry, adaptive tool capacity | unit + UI tests | `npm test`, `npm run test:e2e` |
| Toolbar, panels, inspector, settings, Arabic RTL, dark/light, typing into text labels, Escape layering, two-step clear, toolbar fits small screens, transparent overlay in dark mode | UI tests in Chromium with the simulated backend + reviewed screenshots | `npm run test:e2e` |
| **Overlay click-through is real** (extended styles + `WindowFromPoint` at a probe point reaches the window below) | `--self-test` on Windows | Windows CI |
| Overlay captures clicks while drawing; toolbar stays above overlays | `--self-test` | Windows CI |
| Overlays never take focus in desktop mode | `--self-test` (foreground window check) | Windows CI |
| 200 rapid toggles from 4 threads end consistent | `--self-test` | Windows CI |
| Escape safety key leaves drawing mode | `--self-test` | Windows CI |
| Frozen overlay page → input released → overlay rebuilt | `--self-test` (simulated freeze) | Windows CI |
| Hide/show drawings, global hotkeys registered | `--self-test` | Windows CI |
| NSIS installer builds | CI artifact | Windows CI |

## Still needs a person on real Windows hardware

The CI runner has one 1024×768 virtual display, no pen, no sleep/resume and no monitor hot-plug. Please test, in this order, with the emergency exit ready (**Esc**, or your start/stop shortcut, or the tray icon; last resort **Ctrl + Shift + Esc → Task Manager → Explainer Toolbar → End task**):

1. Install, start: toolbar appears at the left; desktop fully usable (click icons, type in apps).
2. Start drawing, draw, press Esc: back to the mouse; drawings stay visible and click-through.
3. Windows 10 **and** Windows 11: drawings over a browser, PowerPoint slideshow, a video; transparent areas must not turn black (known open WebView2/Tauri issues on some builds).
4. Two monitors with different scaling (100 % + 150 %), including a monitor left of / above the main one: draw on both, move the toolbar across, change scaling while running, unplug/replug a monitor.
5. Sleep and resume: hotkeys still work.
6. Pen/tablet: pressure, the eraser end of the pen (not specially handled yet).
7. Taskbar and notifications while drawings are visible (the overlay is 1 px shorter than the screen and marked "non-rude" to avoid full-screen detection — unverified).

## Measured performance (browser preview, 26 Nov 2026)

Headless Chromium in a Linux container **with software rendering (no GPU)** — real Windows PCs with WebView2 and GPU compositing should be faster. Scene: 3 000 strokes × 40 points.

| Measurement | Result |
|---|---|
| Overlay load + first full render | ≈ 1.1 s (includes page load) |
| Animation frames requested while idle (2 s) | **0** — no work when nothing happens |
| Drawing a 120-sample stroke over the full scene | no long tasks (> 50 ms) |
| Undo (clipped region redraw) | no long tasks |
| Clear all + undo (two full redraws) | one 73 ms task |
| Overlay JavaScript heap | ≈ 25 MB |

Not yet measured on Windows: CPU/GPU cost of the transparent overlay windows themselves (WebView2 composition), memory of the native process, pen latency.
