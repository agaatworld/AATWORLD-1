# Explainer Toolbar

Draw, point and explain over any Windows application. A small floating toolbar and a click-through drawing layer on every monitor.

> **Emergency exit** — if the screen ever seems blocked: press **Esc**, or your *Start / stop drawing* shortcut (default **Ctrl + Shift + Space**), or right-click the tray icon → *Start / stop drawing*. Last resort: **Ctrl + Shift + Esc** → Task Manager → *Explainer Toolbar* → **End task**. Drawings are saved automatically.

## Install

1. Open the latest successful run of the **Explainer Toolbar** workflow on GitHub (Actions tab) and download the artifact **Explainer-Toolbar-Windows-installer**.
2. Unzip it and run `Explainer Toolbar_0.1.0_x64-setup.exe`. It installs for your user only (no administrator needed).
3. Windows SmartScreen may warn because the installer is not code-signed: choose *More info → Run anyway*.

Updating: run the newer installer. Your settings, drawings and backups are kept.

## Using it

| | |
|---|---|
| Start / stop drawing | the big button at the top of the toolbar, **Ctrl + Shift + Space**, or right-click while drawing |
| Back to the mouse | **Esc** (first Esc cancels/deselects, the next one returns to the mouse; it never clears drawings) |
| Tools | P pen · H highlighter · L laser · A arrow · I line · R rectangle · O ellipse · T text · N numbered step · E eraser (whole strokes) · X eraser (partial) · V select · W whiteboard · K blackboard |
| While drawing | 1–9 colours · [ ] size · Shift = straight/square/15° · Alt = from centre · Ctrl+Z / Ctrl+Y · Delete · Ctrl+D duplicate · Ctrl+A select all · arrows nudge · Ctrl+V paste an image |
| Hide / show drawings | **Ctrl + Shift + F11** |
| Show / hide toolbar | **Ctrl + Shift + F12** |
| Clear all drawings | **Ctrl + Shift + F10** (undoable) |

All global shortcuts can be changed or turned off in Settings → Shortcuts.

## Develop

```
npm ci
npm run dev                     # browser preview with a simulated backend (http://localhost:1420)
npm test                        # engine unit tests
npm run build && npm run test:e2e   # UI tests (Chromium)
cd src-tauri && cargo test -p explainer-core
npx tauri dev                   # the real app (Windows)
npx tauri build --bundles nsis  # installer
src-tauri/target/release/explainer-toolbar.exe --self-test report.json   # native safety checks
```

* [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — windows, state machine, safety layers, coordinates, storage.
* [docs/TESTING.md](docs/TESTING.md) — what is verified where, and what still needs real hardware.
* [docs/research/](docs/research/) — competitor analysis (ZoomIt, Epic Pen, gInk, ppInk) and Tauri/WebView2 findings.
* [CHANGELOG.md](CHANGELOG.md)
