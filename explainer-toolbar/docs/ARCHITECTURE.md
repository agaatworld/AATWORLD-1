# Architecture

Explainer Toolbar is a Tauri 2 application: a Rust process that owns every native window, and small web pages (React + TypeScript) rendered by WebView2 inside those windows.

```
┌──────────────────────── Rust process ────────────────────────┐
│ explainer-core (pure Rust, unit-tested anywhere)             │
│   mode.rs      input state machine + effects                 │
│   history.rs   global undo routing across monitors           │
│   settings.rs  JSON-merge-patch settings with revisions      │
│   store.rs     atomic writes, backups, corruption recovery   │
│   storage.rs   files: settings, workspaces, images, backups  │
│   shortcut.rs  hotkey validation and conflict detection      │
│   monitor.rs / layout.rs   monitor diffing, toolbar placement│
│ src/ (Tauri app)                                             │
│   modes.rs     applies the state machine to real windows     │
│   native/      Win32 guards (styles, z-order, focus, watch)  │
│   windows.rs   overlays per monitor, toolbar, settings       │
│   watchdog.rs  heartbeat watchdog + main-thread guard        │
│   shortcuts.rs global hotkeys, Escape safety key             │
│   selftest.rs  --self-test: inspects real Win32 state        │
└──────────────────────────────────────────────────────────────┘
        ▲ commands (invoke)            │ events (broadcast)
        │                              ▼
┌ toolbar page ┐  ┌ overlay page × monitors ┐  ┌ settings page ┐
│ ToolbarApp   │  │ OverlayApp + Editor      │  │ SettingsApp   │
└──────────────┘  └──────────────────────────┘  └───────────────┘
```

## Windows

| Window | Purpose | Native properties |
|---|---|---|
| `toolbar` | floating pill, panels | borderless, transparent, topmost, not in taskbar; resized around open panels |
| `overlay-<monitor>` | one drawing surface per monitor | borderless, transparent, topmost, `WS_EX_TOOLWINDOW`, click-through unless drawing, 1 px shorter than the monitor |
| `settings` | normal window | created on demand |
| tray icon | always-available control | start/stop drawing, show/hide drawings, show toolbar, reset position, clear, settings, logs, quit |

One overlay **per monitor** (instead of one window spanning the virtual screen) means each overlay renders at its own monitor's DPI — the most common source of offset bugs in older annotation tools.

## Input state machine (desktop safety)

`explainer-core/src/mode.rs` — states `Initializing → Desktop ⇄ Annotating`, `Hidden`, `Recovering`, `ShuttingDown`.

* Overlays capture input **only** in `Annotating`. Every other state is click-through (unit-tested exhaustively).
* `Quit` is accepted from every state; `ShuttingDown` is terminal.
* `FrontendLost` from any state goes to `Recovering`, which never captures input.
* Repeated requests are idempotent (no revision bump, effects re-asserted).
* All transitions execute on the main window thread, one at a time, so window changes from two transitions can never interleave. Global-shortcut plugin calls also run only on the main thread (the plugin holds an internal lock while waiting for the main thread, so calling it elsewhere could deadlock).

Order of effects when leaving drawing mode: input capture is dropped **first**, then visibility changes.

## Layers of protection against a blocked desktop

1. **Native click-through**: `WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE` (via tao's own flags, so its style refreshes agree).
2. **Style guard** (`WM_STYLECHANGING` subclass): whenever anything rewrites the extended style while the overlay should be click-through, the click-through bits are put back; overlays always keep `WS_EX_TOOLWINDOW` (not in Alt+Tab; exempt from Chromium occlusion tracking).
3. **Activation guard** (`WM_WINDOWPOSCHANGING`, `WM_MOUSEACTIVATE`): click-through overlays cannot take focus; overlays stay below the toolbar in z-order.
4. **Focus hand-back**: a `SetWinEventHook(EVENT_SYSTEM_FOREGROUND)` tracker remembers the last window of *another* application; when drawing ends (or an overlay is ever foreground outside drawing mode) focus goes back to it, so the presenter's keys reach their slides immediately.
5. **Escape safety key**: a global `Escape` hotkey is registered only while drawing. Pages may consume it (cancel a gesture, close a panel); if no page answers within 350 ms, drawing mode ends anyway.
6. **Heartbeat watchdog**: each overlay page sends a heartbeat every second while drawing. 3.5 s of silence → `Recovering` (all click-through) → exactly the silent overlay is destroyed and rebuilt; drawings reload from disk. If drawings were hidden, they stay hidden.
7. **Main-thread guard**: numbered pings to the native window thread while drawing; 8 unanswered in a row → the process terminates (`TerminateProcess`) and relaunches. Counting pings (not wall-clock time) means sleep/resume can never trigger it.
8. **Ghosting disabled** (`DisableProcessWindowsGhosting`): Windows' "not responding" ghost window would not keep the click-through style.
9. **Crashed page**: an error boundary in the overlay reports the failure → recovery.
10. **Tray menu and the start/stop hotkey** work even when the toolbar is hidden or off-screen. Last resort: `Ctrl + Shift + Esc` → Task Manager → End task (all drawings are autosaved).

## Coordinate system

One rule: **scene coordinates are monitor-local physical pixels** ("device px"), origin at the monitor's top-left.

| Space | Used by | Conversion |
|---|---|---|
| virtual-screen physical px | Rust window placement, monitors (may be negative) | from Tauri `Monitor` |
| monitor-local physical px | everything stored in a scene | = virtual − monitor origin |
| CSS px (logical) | pointer events, DOM layout | device = CSS × `devicePixelRatio` |
| canvas backing store | rendering | canvas size = CSS size × `devicePixelRatio`; drawn 1:1 in device px |

* Pointer: `x = clientX × devicePixelRatio`. No other conversion exists in the engine.
* Tool sizes (pen width, font size) are chosen in logical px and multiplied by the ratio **once**, when an object is created, so ink stays at the same physical place and size if Windows scaling changes.
* Toolbar layout requests are logical; Rust converts with the scale of the toolbar's monitor and works in physical px (`explainer-core/src/layout.rs`).

## Drawing engine (`src/engine`)

* Immutable objects in an ordered list (z-order) + id index + uniform-grid spatial index (`spatial.ts`) for hit-testing and partial redraws.
* Two canvas layers: **base** (committed ink, updated incrementally or by clipped region redraw) and **live** (gesture preview, selection handles, laser, eraser ring). Pointer events only update state; drawing happens once per animation frame; idle = no work.
* Strokes: perfect-freehand outlines (pressure, streamline smoothing), cached `Path2D` per immutable object.
* Undo/redo: every action records `{object, z-index}` before/after; a property-based test replays thousands of random actions forward and backward.
* Global undo order across monitors is kept by Rust (`history.rs`); "Clear all" is one grouped step.
* Object eraser removes whole objects; the partial eraser records an `erase` object rendered with `destination-out` (undoable).
* Text: canvas text with per-line direction (Arabic/Hebrew lines right-to-left), editing in a textarea styled to match.

## Persistence (`explainer-core/src/storage.rs`)

`%LOCALAPPDATA%\com.explainertoolbar.desktop\` — `settings.json`, `workspaces/<id>/<monitor>.json`, `assets/` (images, content-addressed), `backups/<timestamp>/`, `logs/`.

* Every write: temp file → flush → keep `.bak` → atomic rename. A torn file is moved aside (`.corrupt-<time>`) and the backup is used.
* Scene saves carry a *scene generation* that changes on workspace switch and backup restore; a late save from before the switch is refused, so it can never land in the wrong workspace. Saves from one overlay run strictly one after another.
* Settings: one writer thread, coalesced writes; updates are JSON merge patches, so two windows changing different settings never overwrite each other.
* Scenes are validated object by object on load (`src/engine/validate.ts`): malformed items are dropped, numbers clamped, colours and image names checked — a damaged file can never crash the overlay.
* Images are accepted by magic bytes (PNG, JPEG, GIF, WebP, BMP; no SVG), max 40 MB, decoded asynchronously and downscaled to 4096 px.
* Daily automatic backup (10 kept); manual backup and restore in Settings (restore takes a safety copy first).
* The NSIS installer installs per user and does not touch this folder on update; on uninstall, data is deleted only if the user ticks the box.

## Logging

`tauri-plugin-log`, file `logs/explainer.log`, 1 MB per file, 5 files kept. Mode transitions, window/monitor changes, hotkey registration results, recoveries, storage errors and page errors are logged. Screen contents and images are never logged. Settings → Help & diagnostics → "Copy diagnostic report".
