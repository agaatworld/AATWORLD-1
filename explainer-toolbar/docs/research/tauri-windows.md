# Tauri 2 on Windows: per-monitor transparent click-through overlays + floating toolbar

Research date: 2026-11-26. Method: live crates.io / npm registry queries; `git clone` of tauri, tao, wry,
plugins-workspace, global-hotkey, tauri-action, tauri-docs (HEAD of default branches on 2026-11-25/26, plus
tag `tao-v0.37.3`); published `.crate` files for tauri-utils 2.10.4, tauri-bundler 2.10.6,
tauri-plugin-log 2.10.2, tauri-plugin-global-shortcut 2.4.1, global-hotkey 0.8.0; GitHub issue pages;
Microsoft docs read from the official MicrosoftDocs GitHub mirrors (learn.microsoft.com, docs.rs and
v2.tauri.app were not reachable from this sandbox, so canonical URLs are given but content was read from
the mirror repos `MicrosoftDocs/win32`, `MicrosoftDocs/sdk-api`, `MicrosoftDocs/webview2-win32-reference`,
`tauri-apps/tauri-docs`).

Legend: **[V]** verified in source code or primary doc; **[I]** my inference from verified code;
**[U]** unverified / community report only / must be tested.

---

## 0. Decision summary

1. Pin `tauri 2.12.7` + `tauri-build 2.7.6` + `@tauri-apps/cli 2.12.6` + `@tauri-apps/api 2.12.5`; Windows
   interop with `windows = "0.62"` (same major as tao/wry/tauri, so `WebviewWindow::hwnd()` returns a
   type-compatible `windows::Win32::Foundation::HWND`). [V]
2. `set_ignore_cursor_events(true)` on Windows = tao adds `WS_EX_TRANSPARENT | WS_EX_LAYERED` to the
   ex-style it recomputes from its own flag set and writes with `SetWindowLongW(GWL_EXSTYLE)` +
   `SetWindowPos(SWP_FRAMECHANGED|SWP_NOACTIVATE|...)`. It never calls `SetLayeredWindowAttributes`. It is
   whole-window only (no per-pixel / `forward` option). [V]
3. tao rewrites the **entire** GWL_STYLE/GWL_EXSTYLE on **every** flag change (show/hide, always-on-top,
   focusable, ignore-cursor, resizable, ...). Any ex-style you add yourself (e.g. `WS_EX_TOOLWINDOW`) is
   wiped on the next such call. Pin extra bits with a `WM_STYLECHANGING` subclass, not one-shot
   `SetWindowLongPtrW`. [V for the rewrite; I for the remedy]
4. Overlay builder: `decorations(false) transparent(true) shadow(false) resizable(false) always_on_top(true)
   skip_taskbar(true) focusable(false) focused(false) visible(true)` placed on its monitor at creation; do not
   use `fullscreen`/`set_fullscreen*` (forces activation, Alt-key `SendInput` hack). [V]
   `no_redirection_bitmap(true)` (new in 2.12.0) removes the white flash but its interaction with
   `WS_EX_LAYERED` (click-through) is untested anywhere I could find: **spike this first**. [U]
5. Toggle click-through only on mode switches (rare): frequent toggling of `WS_EX_LAYERED` is the suspected
   trigger of an open Win10 "black transparent area / black wallpaper" bug (tauri#15947). [V that it is
   reported; U root cause]
6. A topmost, transparent window exactly covering a monitor makes Explorer's "Rude Window Manager" treat the
   monitor as running a fullscreen app (taskbar loses topmost, notifications suppressed). Mitigation: make
   overlays 1 px smaller than the monitor (or offset 1 px) and/or set the `NonRudeHWND` window property. [V
   mechanism via reverse-engineering writeup; U mitigations]
7. In annotation mode (no `WS_EX_TRANSPARENT`/`WS_EX_LAYERED`) a monitor-sized overlay is counted as an
   **opaque occluder** by Chromium's native occlusion tracker, so Chrome/Edge/Electron/WebView2 apps under it
   may stop painting. Pinning `WS_EX_TOOLWINDOW` exempts the overlay. [V in Chromium source]
8. No tao/Tauri event for display changes or power resume on Windows: subclass an overlay/toolbar HWND
   (`SetWindowSubclass`, main thread) for `WM_DISPLAYCHANGE`, `WM_DPICHANGED`, `WM_SETTINGCHANGE(SPI_SETWORKAREA)`,
   `WM_POWERBROADCAST`, debounce, then rebuild overlays **outside** the window procedure (window creation
   from a sync context deadlocks on Windows). [V]
9. Global shortcuts = `RegisterHotKey` with `MOD_NOREPEAT` (no auto-repeat) on a hidden window; `Released` is
   synthesized by polling `GetAsyncKeyState` every 50 ms. Bare `Escape` works but steals Escape system-wide:
   register it only while in annotation mode. [V]
10. Keep the toolbar above overlays with raw `SetWindowPos(toolbar, HWND_TOPMOST, ..., SWP_NOACTIVATE)` after
    overlay z-changes and/or a `WM_WINDOWPOSCHANGING` guard on overlays; `set_always_on_top(true)` is a
    no-op if already set. [V]
11. CI: `windows-latest` (= Windows Server 2025 image) has an interactive desktop (1024x768 default, max
    1920x1080 via `Set-DisplayResolution`), Evergreen WebView2 present but un-pinned; native Win32 smoke tests
    (WindowFromPoint/SendInput) are feasible; tauri-driver/msedgedriver is broken on WebView2 >= 133. [V via
    runner-images maintainers]

---

## 1. Current versions (queried 2026-11-26)

| Package | Latest stable | Published | Notes |
|---|---|---|---|
| crate `tauri` | **2.12.7** | 2026-11-18 | deps: `tauri-runtime-wry ~2.12.5`, `windows ^0.62`, `webview2-com ^0.39` |
| crate `tauri-build` | **2.7.6** | 2026-11-18 | |
| crate `tauri-runtime-wry` | 2.12.5 | | **published** 2.12.5 depends on `tao ^0.37.0`, `wry ^0.57.0` -> resolves tao **0.37.3**, wry **0.57.4** |
| crate `tao` | 0.38.0 (2026-11-24) | | not yet used by a released tauri; tauri `dev` branch Cargo.toml already bumped to tao 0.38 / wry 0.58.1 (unreleased) |
| crate `wry` | 0.58.1 (2026-11-25) | | idem |
| crate `windows` (used by tao 0.37.3/0.38, wry, tauri) | **0.62.2** | 2025-10-06 | tao 0.37.0 changelog: "Updated `windows` and `windows-core` to 0.62, this drop Windows 7 support" |
| crate `webview2-com` | 0.39.1 | | |
| crate `tauri-plugin-global-shortcut` | **2.4.1** | 2026-10-14 | published crate depends on **`global-hotkey ^0.8`** (repo HEAD already on 0.10) |
| crate `global-hotkey` | 0.10.0 (0.8.0 used by plugin 2.4.1) | | Windows backend uses `windows-sys 0.59` |
| crate `tauri-plugin-log` | **2.10.2** | 2026-11-10 | uses `fern 0.7` |
| crate `tauri-plugin-single-instance` | **2.5.5** | 2026-10-28 | Windows backend: `windows-sys 0.61`, named mutex + `WM_COPYDATA`; no npm package (404) |
| crate `tauri-plugin-dialog` | **2.8.4** | 2026-10-28 | npm `@tauri-apps/plugin-dialog` 2.8.4 |
| crate `tauri-cli` | 2.12.6 | | pins `tauri-bundler =2.10.6` |
| npm `@tauri-apps/api` | **2.12.5** | 2026-11-16 | `next` = 3.0.0-alpha.3 |
| npm `@tauri-apps/cli` | **2.12.6** | 2026-11-18 | `next` = 3.0.0-alpha.6 |
| npm `@tauri-apps/plugin-global-shortcut` | **2.4.1** | 2026-10-10 | |
| npm `@tauri-apps/plugin-log` | **2.10.2** | 2026-11-10 | |
| GitHub Action `tauri-apps/tauri-action` | **v1** (v1.0.0) | | v1 dropped Tauri v1 support; `includeUpdaterJson` -> `uploadUpdaterJson`, `assetNamePattern` -> `releaseAssetNamePattern` |
| `actions/checkout` / `setup-node` / `upload-artifact` | v7.0.1 / v7.1.0 / v7.0.2 | | tauri docs example still shows `setup-node@v6` |
| `Swatinem/rust-cache` | v2.9.3 | | |

Sources: `https://crates.io/api/v1/crates/<name>` and `/<name>/<ver>/dependencies`;
`https://registry.npmjs.org/<pkg>`; `git ls-remote --tags` of each action repo;
tao CHANGELOG `https://github.com/tauri-apps/tao/blob/dev/CHANGELOG.md` (0.37.0 entry f8722bd3, #1292).
MSRV: tao 0.38 = Rust 1.92 (CHANGELOG); runner image ships Rust 1.100.

Suggested manifests:

```toml
# src-tauri/Cargo.toml
[build-dependencies]
tauri-build = { version = "2.7.6", features = [] }

[dependencies]
tauri = { version = "2.12.7", features = [] }
tauri-plugin-global-shortcut = "2.4.1"
tauri-plugin-log = "2.10.2"
tauri-plugin-single-instance = "2.5.5"   # register FIRST (plugin README: plugins run in registration order)
tauri-plugin-dialog = "2.8.4"
log = "0.4"

[target.'cfg(windows)'.dependencies]
windows = { version = "0.62", features = [
  "Win32_Foundation", "Win32_UI_WindowsAndMessaging", "Win32_UI_Shell",
  "Win32_Graphics_Gdi", "Win32_Graphics_Dwm", "Win32_UI_Input_KeyboardAndMouse",
  "Win32_System_RemoteDesktop",   # WTSRegisterSessionNotification (lock/unlock), optional
] }
```

```json
// package.json (excerpt)
"dependencies": { "@tauri-apps/api": "2.12.5", "@tauri-apps/plugin-global-shortcut": "2.4.1", "@tauri-apps/plugin-log": "2.10.2" },
"devDependencies": { "@tauri-apps/cli": "2.12.6" }
```

---

## 2. How the window flags are implemented on Windows (tao 0.37.3; identical in 0.38.0 except event_loop.rs)

Files: `tao/src/platform_impl/windows/window_state.rs`, `window.rs`, `event_loop.rs`
(`https://github.com/tauri-apps/tao/tree/tao-v0.37.3/src/platform_impl/windows`).

### 2.1 Flag -> style mapping (`WindowFlags::to_window_styles`) [V]

```rust
// window_state.rs (tao 0.37.3)
style |= WS_CAPTION | WS_CLIPSIBLINGS | WS_SYSMENU;
style_ex |= WS_EX_WINDOWEDGE | WS_EX_ACCEPTFILES;
if self.contains(WindowFlags::ON_TASKBAR)     { style_ex |= WS_EX_APPWINDOW; }   // set for every unowned window
if self.contains(WindowFlags::ALWAYS_ON_TOP)  { style_ex |= WS_EX_TOPMOST; }
if self.contains(WindowFlags::NO_BACK_BUFFER) { style_ex |= WS_EX_NOREDIRECTIONBITMAP; }
if self.contains(WindowFlags::POPUP)          { style |= WS_POPUP; }              // owned windows (Parent::OwnedBy)
if self.contains(WindowFlags::IGNORE_CURSOR_EVENT) { style_ex |= WS_EX_TRANSPARENT | WS_EX_LAYERED; }
if !self.contains(WindowFlags::FOCUSABLE)     { style_ex |= WS_EX_NOACTIVATE; }
```

### 2.2 Applying a change (`WindowFlags::apply_diff`) [V]

Every setter below goes through `WindowState::set_window_flags(lock, hwnd, |f| f.set(FLAG, v))`, which
diffs **tao's remembered flags** (not the real HWND style) and, if anything differs:

```rust
if diff.contains(ALWAYS_ON_TOP) {
  SetWindowPos(hwnd, Some(if new.contains(ALWAYS_ON_TOP) { HWND_TOPMOST } else { HWND_NOTOPMOST }),
               0,0,0,0, SWP_ASYNCWINDOWPOS | SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
}
...
if !new.contains(VISIBLE) { ShowWindow(hwnd, SW_HIDE); }          // runs on ANY diff while tao thinks it is hidden
if diff != empty {
  let (mut style, style_ex) = new.to_window_styles();             // full recompute
  if !old.contains(VISIBLE) { style &= !WS_VISIBLE; }
  if !new.contains(MINIMIZED) {
    SetWindowLongW(hwnd, GWL_STYLE,   style.0 as i32);
    SetWindowLongW(hwnd, GWL_EXSTYLE, style_ex.0 as i32);          // <- overwrites your own ex-style bits
  }
  let mut flags = SWP_NOZORDER | SWP_NOMOVE | SWP_NOSIZE | SWP_FRAMECHANGED;
  if !fullscreen { flags |= SWP_NOACTIVATE; }                     // fullscreen windows ARE activated
  SetWindowPos(hwnd, None, 0,0,0,0, flags);
}
if new.contains(VISIBLE) {
  ShowWindow(hwnd, if old.contains(MARKER_DONT_FOCUS) { SW_SHOWNOACTIVATE } else { SW_SHOW });
}
```

Consequences (all [I] from the code above):
- `set_ignore_cursor_events` state is **sticky** across `set_always_on_top`, `set_focusable`, show/hide etc.
  because those re-derive styles from the same flag set. No "reset after X" bug exists for the tao-managed
  path; I found no such report.
- Manually-set ex-style bits are **lost** on the next tao flag change. Manually-set `WS_EX_TRANSPARENT` is
  invisible to tao: `set_ignore_cursor_events(false)` would be a no-op (diff empty) and leave your bit.
  Never mix manual and tao-managed control of the same bits.
- Repeating a setter with the same value is a no-op: `set_always_on_top(true)` on an already-topmost window
  does **not** re-raise it. Re-raise with raw `SetWindowPos(hwnd, Some(HWND_TOPMOST), ...)`.
- `SetWindowPos` for topmost uses `SWP_ASYNCWINDOWPOS`; Tauri setters are also asynchronous messages to the
  event loop (`WindowMessage::SetIgnoreCursorEvents` -> `send_user_message`, `tauri-runtime-wry/src/lib.rs`),
  executed inline only when already on the main thread. Tests must wait/poll before asserting styles.
- If you show a window with raw `ShowWindow` while tao thinks it is hidden, the next tao style change
  hides it again (`SW_HIDE` + `WS_VISIBLE` stripped). Let tao own visibility.
- `show()` after creation uses `SW_SHOW` (activates) because `MARKER_DONT_FOCUS` is cleared right after
  `CreateWindowExW`; only the **initial** show of a `focused(false)` window uses `SW_SHOWNOACTIVATE`.
  tao 0.37.1 changelog confirms: windows created with `with_focused(false)` now get focus on later
  `set_visible(true)`. -> create overlays `visible(true) + focused(false)` and never hide/show them; hide
  strokes in CSS instead. (Whether `SW_SHOW` actually activates a `WS_EX_NOACTIVATE` window: [U].)

### 2.3 `set_ignore_cursor_events` [V]

```rust
// window.rs
pub fn set_ignore_cursor_events(&self, ignore: bool) -> Result<(), ExternalError> {
  let window = self.window; let window_state = Arc::clone(&self.window_state);
  self.thread_executor.execute_in_thread(move || {
    WindowState::set_window_flags(window_state.lock(), window.hwnd(), |f| f.set(WindowFlags::IGNORE_CURSOR_EVENT, ignore));
  });
  Ok(())
}
```
- Styles: `WS_EX_TRANSPARENT | WS_EX_LAYERED` via `SetWindowLongW(GWL_EXSTYLE)` (32-bit setter; fine since
  styles are 32-bit). No `SetLayeredWindowAttributes`/`UpdateLayeredWindow`.
- Why it works: MS docs (window-features, "Layered Windows"): "if the layered window has the
  **WS_EX_TRANSPARENT** extended window style, the shape of the layered window will be ignored and the mouse
  events will be passed to other windows underneath the layered window." [V]
  https://learn.microsoft.com/en-us/windows/win32/winmsg/window-features#layered-windows
- Caveats [V docs, I impact]:
  - MS docs: `WS_EX_LAYERED` "cannot be used if the window has a class style of either CS_OWNDC or
    CS_CLASSDC" - tao registers its class with `CS_HREDRAW | CS_VREDRAW | CS_OWNDC`. Works in practice; may
    relate to composition glitches [U].
  - MS docs: a layered window "will not become visible until SetLayeredWindowAttributes or
    UpdateLayeredWindow" is called (stated for CreateWindowEx; tao itself relies on this to keep its hidden
    message window invisible). With the default (redirection bitmap + DWM blur-behind) path, Tauri users
    report the webview stays visible after toggling. With `no_redirection_bitmap(true)` I found **no**
    report either way -> test.
  - Do NOT call `SetLayeredWindowAttributes(hwnd,0,255,LWA_ALPHA)` yourself: Wails reports it turns the
    WebView2 per-pixel transparency into an opaque white sheet (https://github.com/wailsapp/wails/issues/6088). [U]
- Whole-window only. No equivalent of Electron's `setIgnoreMouseEvents(true,{forward:true})`
  (https://github.com/tauri-apps/tauri/issues/6164, open). `WM_NCHITTEST -> HTTRANSPARENT` only passes clicks
  "to underlying windows in the **same thread**" (MS docs wm-nchittest) so it cannot implement per-pixel
  click-through to other apps. [V]
- Known bug (open): https://github.com/tauri-apps/tauri/issues/15947 "Windows 10: transparent always-on-top
  window sporadically renders transparent areas / desktop wallpaper black (composition race when toggling
  cursor events or minimizing)" - Tauri 2.10.3/tao 0.34.8, 1440x900 `transparent alwaysOnTop decorations:false
  shadow:false`, frequent `set_ignore_cursor_events` toggles. Reporter workaround: debounce toggles, never
  minimize; suggested structural fix `noRedirectionBitmap`. No maintainer reply.
- Related open: https://github.com/tauri-apps/tauri/issues/16341 (Win11 long-lived transparent window turns
  black; reporter's prototype recovery on `WM_DISPLAYCHANGE`/`WM_DWMCOMPOSITIONCHANGED`: re-apply
  `DwmEnableBlurBehindWindow(DWM_BB_ENABLE|DWM_BB_BLURREGION, CreateRectRgn(0,0,-1,-1))`, then
  `SetWindowPos(SWP_FRAMECHANGED|SWP_NOMOVE|SWP_NOSIZE|SWP_NOZORDER)` + `InvalidateRect`; unvalidated).
- Note: setting click-through does not move keyboard focus. If the overlay was focused in annotation mode,
  keystrokes keep going to it after switching to desktop mode; remember `GetForegroundWindow()` before
  annotating and restore it with `SetForegroundWindow(prev)` on exit (or keep overlays non-focusable). [I]

### 2.4 `skip_taskbar` / `set_skip_taskbar` [V]

```rust
pub(crate) unsafe fn set_skip_taskbar(hwnd: HWND, skip: bool) -> Result<(), ExternalError> {
  com_initialized();
  let taskbar_list: ITaskbarList = CoCreateInstance(&TaskbarList, None, CLSCTX_SERVER)?;
  if skip { taskbar_list.DeleteTab(hwnd)?; } else { taskbar_list.AddTab(hwnd)?; }
  Ok(())
}
```
- Applied in `on_create` (before first show) and re-applied when Explorer restarts (`TaskbarCreated` ->
  `S_U_TASKBAR_RESTART`). It does **not** use `WS_EX_TOOLWINDOW`; `WS_EX_APPWINDOW` stays set
  (`ON_TASKBAR` for unowned windows), and the window still appears in **Alt+Tab**.
- Reports of it intermittently failing: https://github.com/tauri-apps/tauri/issues/10422 (open, needs info).
  Maintainer declined `WS_EX_TOOLWINDOW` in core ("behaves very different than normal windows"). Zebar
  (Tauri app) overwrites `GWL_EXSTYLE` with `WS_EX_TOOLWINDOW`
  (https://github.com/glzr-io/zebar/blob/main/packages/desktop/src/common/windows/window_ext_windows.rs).
- MS docs (taskbar "Managing Taskbar Buttons"): unowned + `WS_EX_TOOLWINDOW` -> no button; or make a hidden
  window the **owner** of the visible window; to change dynamically you must hide, restyle, show. [V]
  https://learn.microsoft.com/en-us/windows/win32/shell/taskbar#managing-taskbar-buttons

### 2.5 `always_on_top` [V]
`WS_EX_TOPMOST` in the recomputed ex-style (ineffective via SetWindowLong per MS docs) **plus**
`SetWindowPos(HWND_TOPMOST/HWND_NOTOPMOST, SWP_ASYNCWINDOWPOS|SWP_NOMOVE|SWP_NOSIZE|SWP_NOACTIVATE)` only when
the flag changes. Among topmost windows, the last one raised wins; see section 9.

### 2.6 `focusable(false)` / `set_focusable` [V]
Exists in Tauri 2 (builder `.focusable(bool)`, `WebviewWindow::set_focusable`, config `focusable`, JS
`setFocusable`, permission `core:window:allow-set-focusable`). tao maps `!FOCUSABLE` -> `WS_EX_NOACTIVATE`
(no `WM_MOUSEACTIVATE` handling in tao). MS docs: such a window "does not become the foreground window when
the user clicks it". Known limitation: WebView2 receives **no keyboard input** in a non-focusable window
(https://github.com/tauri-apps/tauri/issues/14386, open; maintainer: "we're blocked by webview2"). Mouse /
pointer input still works [U for pen/touch]. `set_focus()` uses `force_window_active`: `SetForegroundWindow`,
and if that fails it injects a synthetic **Left-Alt down/up via `SendInput`** then retries - can interfere
with the foreground app and with Alt-based hotkeys. [V]

### 2.7 `shadow(false)` [V]
Config default `shadow: true`. On undecorated windows tao sets `MARKER_UNDECORATED_SHADOW` (DWM frame, 1 px
border, Win11 rounded corners; extra insets added to the requested size in `init`/`set_inner_size`;
`WM_NCHITTEST` returns `HTTOP` for the top border). `shadow(false)` removes all of that so outer size ==
client size. Also set `resizable(false)`: for `resizable && !decorated` windows Tauri attaches a child window
`TAURI_DRAG_RESIZE_BORDERS` (`tauri-runtime-wry/src/undecorated_resizing.rs`) and tao's `WM_NCHITTEST`
returns resize codes at the edges - unwanted capture zones on an overlay.

### 2.8 `transparent(true)` [V]
- tao (`window.rs::on_create`): if `transparent && !no_redirection_bitmap`:
  `DwmEnableBlurBehindWindow(hwnd, {DWM_BB_ENABLE|DWM_BB_BLURREGION, hRgnBlur: CreateRectRgn(0,0,-1,-1)})`
  (empty-region blur-behind hack). FIXME in event_loop.rs: "detect WM_DWMCOMPOSITIONCHANGED and call
  DwmEnableBlurBehindWindow if necessary" -> not re-applied after DWM changes (cf. #16341).
- wry (`src/webview2/mod.rs`): transparent => `ICoreWebView2ControllerOptions3::SetDefaultBackgroundColor
  {0,0,0,0}` at controller creation (avoids the post-creation flicker), else `ICoreWebView2Controller2::
  put_DefaultBackgroundColor`; any alpha != 0 forced to 255; Windows 7 unsupported. WebView2 docs: "The only
  supported alpha values are 0 and 255 ... Semi-transparent colors are not currently supported"; Win7 rejects
  non-255; alternative env var `WEBVIEW2_DEFAULT_BACKGROUND_COLOR` (hex AARRGGBB, `0` = transparent) avoids
  the white flicker of the API path. Page CSS must also be transparent (`html,body{background:transparent}`).
  https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2controller2
- OS: Windows 10/11 in practice (windows 0.62 dropped Win7; WebView2 transparency unsupported on Win7). [V]
- WebView2 hosting is **windowed** (`CreateCoreWebView2ControllerWithOptions(hwnd)`) inside a wry child
  container `WRY_WEBVIEW` (`WS_CHILD|WS_CLIPCHILDREN`); wry subclasses the parent (`SetWindowSubclass`) for
  `WM_SIZE`/`WM_MOVE`/`WM_SETFOCUS`. `WindowFromPoint` over the webview returns the browser-process child
  `Chrome_RenderWidgetHostHWND`; use `GetAncestor(hit, GA_ROOT)` to compare with your overlay HWND. [V/I]
- `no_redirection_bitmap(true)` (Tauri **2.12.0+**, PR https://github.com/tauri-apps/tauri/pull/15410,
  builder `.no_redirection_bitmap()`, config `app.windows[].noRedirectionBitmap`, JS option
  `noRedirectionBitmap`): sets `WS_EX_NOREDIRECTIONBITMAP` and therefore skips the blur-behind hack. Fixes the
  white flash on create/show (https://github.com/tauri-apps/tauri/issues/14831, /15490; WebView2 144 era).
  Interaction with `set_ignore_cursor_events` (adds `WS_EX_LAYERED`): untested -> spike. [U]
- Flash/regression history worth guarding against (Evergreen runtime changes under you):
  - WebView2 144: white flash on transparent windows (#14831/#15490), ghost title bar showing page `<title>`
    during drag/focus (https://github.com/tauri-apps/tauri/issues/14764; fixed in runtime 146).
  - WebView2 145 prerelease: transparency lost, gray/white bg (https://github.com/MicrosoftEdge/WebView2Feedback/issues/5481, fixed 145.0.3800.36 beta).
  - WebView2 154.0.4258.62 stable, dark mode: opaque theme-derived background despite alpha 0
    (https://github.com/MicrosoftEdge/WebView2Feedback/issues/5752, open, no MS reply).
  Mitigation: CI/user telemetry of `webview_version()`, test on Edge Beta/Canary, keep a
  `webviewInstallMode: fixedRuntime` fallback build. [I]
- Do not set `contentProtected` (`WDA_EXCLUDEFROMCAPTURE`) - it would hide annotations from screen shares.

### 2.9 Fullscreen APIs: avoid for overlays [V]
`init`: `if fullscreen.is_some() { window.set_fullscreen(...); force_window_active(hwnd); }` and
`apply_diff` omits `SWP_NOACTIVATE` for fullscreen windows ("must be activated so that they appear on top of
the taskbar"). New 2.12.0 `set_fullscreen_on_monitor` goes the same way. Size the window to the monitor
rect instead.

### 2.10 Recommended overlay creation (Rust)

```rust
use tauri::{AppHandle, Manager, Monitor, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

pub fn create_overlay(app: &AppHandle, idx: usize, m: &Monitor) -> tauri::Result<WebviewWindow> {
    let (p, s, sf) = (*m.position(), *m.size(), m.scale_factor());
    // Builder takes LOGICAL units; tao (>=0.37.3, PR #1397) picks the monitor whose origin is closest to
    // the position converted with that monitor's scale -> dividing by the target monitor's own scale
    // makes the target monitor match exactly, so the window is born there (no WM_DPICHANGED).
    let h = s.height.saturating_sub(1); // 1px shorter: avoid "rude"/fullscreen detection [U]
    let w = WebviewWindowBuilder::new(app, format!("overlay-{idx}"), WebviewUrl::App("overlay.html".into()))
        .title("")                      // WebView2 144 ghost-titlebar bug rendered <title>
        .decorations(false).transparent(true).shadow(false).resizable(false)
        .no_redirection_bitmap(true)    // 2.12.0+; SPIKE: verify together with click-through
        .always_on_top(true).skip_taskbar(true)
        .focusable(false).focused(false) // WS_EX_NOACTIVATE; first show = SW_SHOWNOACTIVATE
        .visible(true)                   // show once, never hide()/show() later
        .position(p.x as f64 / sf, p.y as f64 / sf)
        .inner_size(s.width as f64 / sf, h as f64 / sf)
        .build()?;
    // Post-check in physical pixels (same monitor => no DPI change => exact)
    w.set_position(PhysicalPosition::new(p.x, p.y))?;
    w.set_size(PhysicalSize::new(s.width, h))?;
    w.set_ignore_cursor_events(true)?; // desktop mode by default
    Ok(w)
}
```
Must run where window creation is allowed: `setup` hook, an **async** command, or a spawned task. Tauri docs
on `WebviewWindowBuilder::new`: "On Windows, this function deadlocks when used in a synchronous command and
event handlers ... use async commands and separate threads". [V]

### 2.11 Pinning extra ex-styles against tao rewrites (WM_STYLECHANGING) [I, technique documented by MS]

MS docs: `WM_STYLECHANGING` is "Sent to a window when the SetWindowLong function is about to change one or
more of the window's styles ... An application can examine the styles and, if necessary, change them."
https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-stylechanging

```rust
use std::sync::atomic::{AtomicIsize, Ordering};
use windows::Win32::{Foundation::*, UI::{Shell::*, WindowsAndMessaging::*}};

pub static TOOLBAR_HWND: AtomicIsize = AtomicIsize::new(0);
const OVERLAY_SUBCLASS_ID: usize = 0xA0A1;

unsafe extern "system" fn overlay_subclass(hwnd: HWND, msg: u32, wp: WPARAM, lp: LPARAM, _id: usize, _ref: usize) -> LRESULT {
    match msg {
        WM_STYLECHANGING if wp.0 as i32 == GWL_EXSTYLE.0 => {
            let ss = &mut *(lp.0 as *mut STYLESTRUCT);
            // keep out of Alt+Tab and out of Chromium's occlusion math; drop APPWINDOW
            ss.styleNew = (ss.styleNew | WS_EX_TOOLWINDOW.0) & !WS_EX_APPWINDOW.0;
        }
        WM_WINDOWPOSCHANGING => {            // section 9: stay directly below the toolbar
            let wpos = &mut *(lp.0 as *mut WINDOWPOS);
            let tb = HWND(TOOLBAR_HWND.load(Ordering::Relaxed) as _);
            if !tb.0.is_null() && (wpos.flags & SWP_NOZORDER).0 == 0
                && (wpos.hwndInsertAfter == HWND_TOP || wpos.hwndInsertAfter == HWND_TOPMOST) {
                wpos.hwndInsertAfter = tb;
            }
        }
        WM_DISPLAYCHANGE | WM_POWERBROADCAST | WM_DPICHANGED => crate::monitors::schedule_reconcile(),
        WM_SETTINGCHANGE if wp.0 == SPI_SETWORKAREA.0 as usize => crate::monitors::schedule_reconcile(),
        WM_NCDESTROY => { let _ = RemoveWindowSubclass(hwnd, Some(overlay_subclass), OVERLAY_SUBCLASS_ID); }
        _ => {}
    }
    DefSubclassProc(hwnd, msg, wp, lp)
}

/// Call on the MAIN thread (setup hook or app.run_on_main_thread): "You cannot use the subclassing helper
/// functions to subclass a window across threads" (MS SetWindowSubclass remarks).
pub fn install(w: &tauri::WebviewWindow) -> tauri::Result<()> {
    let hwnd = w.hwnd()?;
    unsafe {
        let _ = SetWindowSubclass(hwnd, Some(overlay_subclass), OVERLAY_SUBCLASS_ID, 0);
        // trigger one restyle now so the pin applies immediately
        let ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex);
        let _ = SetWindowPos(hwnd, None, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED);
    }
    Ok(())
}
```
Subclass procs run before tao's wndproc (DefSubclassProc chains to it), and coexist with wry's own
`SetWindowSubclass` on the same HWND (different callback/id pair). Signatures above follow windows 0.62 usage
in tao/wry (e.g. `SetWindowPos(hwnd, Some(HWND_TOPMOST), ...)` returns `Result`); compile-check. [I]

---

## 3. Fullscreen-sized transparent topmost windows on Win10/11: known problems and mitigations

### 3.1 "Rude window" / fullscreen detection (taskbar, notifications, Focus Assist) [V mechanism, U fixes]
- Explorer's `twinui!CGlobalRudeWindowManager` decides per monitor whether the **top window in z-order** on
  that monitor is "full screen" (window added to a fullscreen set via shell-hook `0x35`/`0x36`, based on
  `GetWindowRect` vs monitor). "If that transparent full screen window happens to also be 'always on top' ...
  the monitor will be considered rude. As a result, the taskbar loses its always on top status." Applies to
  transparent, click-through, non-listed windows too. (Reverse-engineered, Win11 21H2:
  https://github.com/dechamps/RudeWindowFixer#readme ; windows larger than the monitor also count:
  https://github.com/dechamps/RudeWindowFixer/issues/4 .)
- Tauri report: https://github.com/tauri-apps/tauri/issues/7328 (Win11, `transparent` + monitor-sized, with or
  without `fullscreen`; closed not-planned, maintainer: intended Windows behavior). Reporter workarounds that
  worked: `SetPropW(hwnd, "NonRudeHWND", handle)` before showing; or moving the window 1 px
  (`setPosition(new LogicalPosition(1, 0))`).
- Counter-evidence: `NonRudeHWND` did not help in PowerToys Shortcut Guide z-order demotion
  (https://github.com/microsoft/PowerToys/issues/50855) nor in tauri#11176. Treat both as best-effort.
- Notifications: `SHQueryUserNotificationState` returns `QUNS_BUSY` "A full-screen application is running";
  "there are no notifications sent when the user starts or stops a full-screen application."
  https://learn.microsoft.com/en-us/windows/win32/api/shellapi/ne-shellapi-query_user_notification_state
  Use it in your smoke test to detect whether your overlays trip fullscreen detection.
- Recommended: overlay rect = monitor rect minus 1 px (bottom row) **and** `NonRudeHWND` property:
  ```rust
  unsafe { let _ = SetPropW(hwnd, windows::core::w!("NonRudeHWND"), Some(HANDLE(1 as _))); }
  ```
  (SetPropW call shape copied from tao `dark_mode.rs`.) Verify on Win10 22H2 and Win11 24H2/25H2 with
  `SHQueryUserNotificationState` + checking taskbar `Shell_TrayWnd` z-order. `WS_EX_TOOLWINDOW` does **not**
  exempt a window from rude detection (RudeWindowFixer lists "not listed in window lists" windows as
  affected).

### 3.2 Chromium occlusion tracking (other apps freeze under the overlay) [V]
Chromium `ui/gfx/win/hwnd_util.cc::IsWindowVisibleAndFullyOpaque` (used by
`ui/aura/native_window_occlusion_tracker_win.cc`) **ignores** windows with `WS_EX_TRANSPARENT`, with
`WS_EX_TOOLWINDOW` (except the taskbar), layered windows whose `GetLayeredWindowAttributes` fails or alpha
< 255 / color key, complex regions, cloaked windows. Everything else counts as an opaque occluder.
- Desktop mode (tao adds `WS_EX_TRANSPARENT|WS_EX_LAYERED`): ignored. Good.
- Annotation mode (styles removed): a monitor-sized overlay counts as opaque, so Chrome/Edge/Electron/VS Code/
  Teams windows beneath may be marked occluded and stop rendering (frozen video under your ink). Pin
  `WS_EX_TOOLWINDOW` (section 2.11) to avoid. [I impact]
https://github.com/chromium/chromium/blob/main/ui/gfx/win/hwnd_util.cc

### 3.3 Composition glitches [V reports]
- #15947 (Win10, toggling `WS_EX_LAYERED`, minimize) and #16341 (Win11, long-lived) above. Mitigations:
  toggle click-through only on explicit mode changes, never minimize overlays, consider re-applying
  blur-behind + `SWP_FRAMECHANGED` on `WM_DISPLAYCHANGE`/`WM_DWMCOMPOSITIONCHANGED` when NOT using
  `no_redirection_bitmap`.

### 3.4 Performance [I - no Windows-specific measurement found]
- No Windows CPU/GPU-cost issue for transparent windows found in tauri/WebView2Feedback trackers
  (searched "transparent GPU usage"); macOS has one (https://github.com/tauri-apps/tauri/issues/15471:
  `transparent:true` causes continuous recomposite, ~8x GPU power).
- All overlays share one WebView2 browser + GPU process when they share data dir and browser args (wry
  `create_environment`; Tauri default data dir = `app_local_data_dir()` for every webview). Per overlay you pay
  one renderer + monitor-sized swap chain(s) (4K BGRA ~= 33 MB per buffer).
- Draw on demand (no permanent `requestAnimationFrame` loop), size the canvas backing store to physical pixels
  once, avoid full-canvas CSS filters/blur. `backgroundThrottling` config is unsupported on Windows.
- GitHub-hosted runners have no GPU; WebView2 falls back to software rendering there. [I]

### 3.5 Virtual desktops
`visibleOnAllWorkspaces` is "Windows / iOS / Android: Unsupported" (tauri-utils config docs). Overlays live on
one virtual desktop. (Tool windows being shown on all desktops: [U].)

---

## 4. Per-monitor DPI

### 4.1 Facts [V]
- tao calls `SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2)` (fallbacks: PMv1,
  `SetProcessDpiAwareness`, `SetProcessDPIAware`) in `dpi.rs::become_dpi_aware`; Tauri's default manifest
  does not declare DPI awareness. All `Monitor::position()/size()/work_area()` and window positions are
  **physical** virtual-screen pixels; monitors left/above the primary have negative coordinates.
- Builder `.position(x,y)`/`.inner_size(w,h)` are **logical** (`LogicalPosition`/`LogicalSize` in
  tauri-runtime-wry). tao `init` chooses the target monitor for a logical position by converting it with each
  monitor's DPI and picking "the one the position is closest to its origin on" (fix d12848aa / PR #1397 in
  **tao 0.37.3**; earlier versions used enumeration order and could pick the wrong monitor with mixed scales).
- `set_outer_position(pos)` converts with the window's **current** scale factor
  (`position.to_physical::<i32>(self.scale_factor())`) and calls `SetWindowPos(..., SWP_ASYNCWINDOWPOS|...)`;
  `set_inner_size` likewise (`set_inner_size_physical` also async). -> `LogicalPosition` aimed at another
  monitor is computed with the wrong scale. Always pass `PhysicalPosition`/`PhysicalSize`. JS: pending
  `@tauri-apps/api` change says Size/Position setters "only accept whole physical pixels" (use `.round()`).
- `WM_DPICHANGED` handler: computes `new_inner = old_physical.to_logical(old_sf).to_physical(new_sf)` (keeps
  logical size), emits `ScaleFactorChanged`, then `SetWindowPos` to the suggested rect (Win11) or a
  nudged/adjusted rect (Win10, `build < 22000`); skips resizing if "Show window contents while dragging" is
  off. Tauri's `WindowEvent::ScaleFactorChanged { scale_factor, new_inner_size }` is read-only.
  Consequence: moving a monitor-sized overlay to a monitor with a different scale (or the user changing that
  monitor's scale) rescales it; your size must be re-applied **after** the DPI change.
- Known bug: https://github.com/tauri-apps/tauri/issues/6843 (open): window created on a secondary monitor with
  a different scale ends up too large; a commenter traced a second `ScaleFactorChanged` resize. Also
  https://github.com/tauri-apps/tauri/issues/15841 (open feature request for a pre-show HWND hook; maintainer
  declined for now) - so do exact placement while the window is still where tao created it.

### 4.2 Robust placement recipe
1. Create on the target monitor (section 2.10) -> no DPI transition.
2. Re-check `outer_position()`/`inner_size()` (physical) against `monitor.position()/size()`.
3. For corrections or moves across monitors, do it raw and twice on the main thread:
```rust
unsafe fn place_exact(hwnd: HWND, x: i32, y: i32, w: i32, h: i32) -> windows::core::Result<()> {
    let f = SWP_NOZORDER | SWP_NOACTIVATE;           // synchronous (no SWP_ASYNCWINDOWPOS) on owner thread
    SetWindowPos(hwnd, None, x, y, w, h, f)?;        // may cross DPI boundary -> tao rescales in WM_DPICHANGED
    SetWindowPos(hwnd, None, x, y, w, h, f)          // now on target monitor: exact rect sticks
}
```
4. Also re-fit on `WindowEvent::ScaleFactorChanged` (user changed scale of that monitor).
5. On hot-plug prefer destroy + recreate over moving.

### 4.3 `window.devicePixelRatio` in WebView2 [V docs, I composition]
- WebView2: "The rasterization scale is the combination of the monitor DPI scale and text scaling set by the
  user"; with `ShouldDetectMonitorScaleChanges = TRUE` (default) "the WebView will track monitor DPI scale
  changes, update the RasterizationScale property, and raises RasterizationScaleChanged".
  https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2controller3
- wry leaves `BoundsMode`/`ShouldDetectMonitorScaleChanges` at defaults (no references in
  `src/webview2/mod.rs`); zoom hotkeys are disabled by default (`zoomHotkeysEnabled: false` ->
  `SetIsZoomControlEnabled(false)`), zoom factor 1.0.
- So `devicePixelRatio == RasterizationScale * zoom` ~= monitor scale (1.25, 1.5...). Whether the Windows
  "Text size" accessibility factor is folded in automatically: [U] - cross-check in JS
  `Math.round(innerWidth * devicePixelRatio) === physicalWidth` (from Rust `inner_size()`), and size the canvas
  from the Rust physical size when they disagree. Listen to `getCurrentWindow().onScaleChanged(...)` and
  `matchMedia('(resolution: Xdppx)')` changes.

---

## 5. Monitor hot-plug, sleep/resume, global shortcuts

### 5.1 No events from tao/Tauri [V]
- tao Windows backend handles no `WM_DISPLAYCHANGE`, `WM_POWERBROADCAST`, `WM_WTSSESSION_CHANGE` or
  `WM_DEVICECHANGE` (grep of `src/platform_impl/windows`); `Event::Suspended/Resumed` are documented
  "Linux / macOS / Windows: Unsupported". Tauri `RunEvent` has no monitor/power variant. Only per-window
  `ScaleFactorChanged`, `Moved`, `Resized`.
- Message facts (MS docs): `WM_DISPLAYCHANGE` "is sent to all windows when the display resolution has
  changed ... only sent to top-level windows"; `WM_POWERBROADCAST` with `PBT_APMRESUMEAUTOMATIC` (0x12) "sent
  every time the system resumes", followed by `PBT_APMRESUMESUSPEND` (0x7) if resumed by user input;
  `PBT_APMSUSPEND` (0x4). Message-only (HWND_MESSAGE) windows do "not receive broadcast messages" -> hook a
  real top-level window (an overlay or the toolbar).
  https://learn.microsoft.com/en-us/windows/win32/gdi/wm-displaychange ,
  https://learn.microsoft.com/en-us/windows/win32/power/wm-powerbroadcast
- Prior art: Chromium refreshes its display list on `WM_DISPLAYCHANGE`, `WM_ACTIVATEAPP(TRUE)` and
  `WM_SETTINGCHANGE(SPI_SETWORKAREA)`, invalidates cached HMONITORs on `WM_DISPLAYCHANGE`, and (feature
  `kSkipEmptyDisplayHotplugEvent`) ignores transient "no displays detected" states during hot-plug
  (`ui/display/win/screen_win.cc`).

### 5.2 Recommended approach [I]
- Subclass (section 2.11) on the main thread. In the proc only **signal** (e.g. `tokio::sync::Notify` /
  channel); do the work in an async task: debounce 500-1000 ms, call `app.available_monitors()`, ignore an
  empty list, diff by (position,size,scale) (monitor `name()` is `\\.\DISPLAYn`, not stable across replug),
  then destroy/recreate/reposition overlays. Never create windows inside the wndproc or a sync handler
  (deadlock, section 2.10).
- Optional extra triggers: `WTSRegisterSessionNotification(hwnd, NOTIFY_FOR_THIS_SESSION)` ->
  `WM_WTSSESSION_CHANGE`/`WTS_SESSION_UNLOCK`; `RegisterPowerSettingNotification(GUID_CONSOLE_DISPLAY_STATE)`
  for monitor-off/on. DisplayPort monitors that deep-sleep can vanish/reappear, so windows get moved by the
  system - reconcile after resume and after unlock.
- After resume / display change, also re-assert z-order (raw `SetWindowPos(HWND_TOPMOST)` for overlays then
  toolbar) and, if not using `no_redirection_bitmap`, optionally the blur-behind re-apply from #16341.

### 5.3 Global shortcuts (tauri-plugin-global-shortcut 2.4.1 -> global-hotkey 0.8.0) [V]
- Windows impl (`global-hotkey/src/platform_impl/windows/mod.rs`): a hidden window
  (`WS_EX_NOACTIVATE|WS_EX_TRANSPARENT|WS_EX_LAYERED|WS_EX_TOOLWINDOW`) created on the main thread (the plugin
  marshals register/unregister through `run_on_main_thread`, inline if already on it);
  `RegisterHotKey(hwnd, hotkey.id(), MOD_NOREPEAT | mods, vk)`.
- **Key repeat**: `MOD_NOREPEAT` is always set -> one `WM_HOTKEY` per physical press.
- **Pressed/Released**: `Pressed` on `WM_HOTKEY`; then a spawned thread polls `GetAsyncKeyState(vk)` every
  50 ms (`std::thread::sleep(50ms)`, fix for https://github.com/tauri-apps/global-hotkey/issues/176) and emits
  `Released` when the main key is up (modifiers not tracked). Filter on `state === 'Pressed'` in handlers or
  you act twice.
- **Bare Escape**: `"Escape"`/`"Esc"` parse to `Code::Escape`; `HotKey::new(None, Code::Escape)` registers with
  no modifiers - allowed by `RegisterHotKey`, but the key is then **consumed system-wide** (other apps never
  see Escape; cf. https://github.com/tauri-apps/global-hotkey/issues/87 "Input events are always consumed").
  Register it on entering annotation mode, unregister on leaving. MS docs: F12 "is reserved for use by the
  debugger at all times, so it should not be registered".
- **Failure reporting**: `ERROR_HOTKEY_ALREADY_REGISTERED` -> `global_hotkey::Error::AlreadyRegistered`, other
  errors -> `OsError`; the plugin wraps them as `Error::GlobalHotkey(String)` (JS promise rejects).
  `is_registered()` only checks the plugin's own map ("If the shortcut is registered by another application,
  it will still return `false`"). Handle registration failure at startup and offer an alternative chord.
- **Sleep/resume**: nothing in global-hotkey/plugin reacts to power events; registrations are bound to the
  HWND/thread and are not documented to be dropped on sleep; no GitHub issue found reporting loss after
  resume (searched tauri-apps org). [I/U] Re-registering blindly is not needed (MS: re-registering same
  hWnd/id "is maintained along with the new hot key").
- Other limits [U]: some games swallow keys (tauri#7318 per a third-party summary); secure desktop (UAC,
  lock screen) blocks hotkeys; ids are `(mods<<16)|code`, outside MS's documented 0x0000-0xBFFF app range
  but accepted in practice.
- Rust usage:
```rust
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
app.handle().plugin(tauri_plugin_global_shortcut::Builder::new()
    .with_handler(|app, sc, ev| if ev.state == ShortcutState::Pressed { /* dispatch */ })
    .build())?;
let toggle = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyD);
app.global_shortcut().register(toggle)?;                              // Err => tell the user
let esc = Shortcut::new(None, Code::Escape);                          // only while annotating
app.global_shortcut().register(esc)?; /* ... */ app.global_shortcut().unregister(esc)?;
```

---

## 6. tauri-plugin-log 2.10.2 [V]

- Defaults: targets `[Stdout, LogDir { file_name: None }]`; `max_file_size` **40_000 bytes**; rotation
  `KeepOne`; timezone `UseUtc`; `FileOpenStrategy::Append`.
- `RotationStrategy::{KeepAll, KeepOne, KeepSome(usize)}`: KeepAll renames to `<name>_<YYYY-MM-DD_HH-MM-SS>.log`;
  KeepOne deletes the full file; KeepSome(n) keeps n archives (`n-1` + the one being rotated; use n >= 1, the
  code does `keep_count - 1`). `FileOpenStrategy::{Append, Rotate}` (Rotate = new file each session).
  `TimezoneStrategy::{UseUtc, UseLocal}`. `max_file_size(u128)` clamps to u64.
- Location (`TargetKind::LogDir`): `app_log_dir()` = `{FOLDERID_LocalAppData}\{bundleIdentifier}\logs`, e.g.
  `C:\Users\Alice\AppData\Local\com.example.app\logs\<productName>.log` (file name defaults to
  `package_info().name`). Overridable by `app > appDirectoriesOverride` (tauri config).
- Targets: `Stdout`, `Stderr`, `Folder { path, file_name }`, `LogDir { file_name }`, `Webview` (emits
  `log://log`, needs JS `attachConsole()` and `core:event` listen permission), `Dispatch(fern::Dispatch)`;
  per-target `.filter(...)`; builder `.level()`, `.level_for(module, level)`, `.clear_targets()`, `.target()`,
  `.targets()`.
- JS permission `log:default` = `log:allow-log`.
```rust
use tauri_plugin_log::{Builder, RotationStrategy, Target, TargetKind, TimezoneStrategy};
Builder::new()
  .clear_targets()
  .targets([Target::new(TargetKind::Stdout), Target::new(TargetKind::LogDir { file_name: Some("app".into()) })])
  .max_file_size(2_000_000)
  .rotation_strategy(RotationStrategy::KeepSome(5))
  .timezone_strategy(TimezoneStrategy::UseLocal)
  .level(log::LevelFilter::Info)
  .build()
```
Note: NSIS "Delete the application data" removes `%LOCALAPPDATA%\{identifier}` incl. logs and the WebView2
user-data folder (section 7).

---

## 7. NSIS bundling, CI build, signing

### 7.1 Config keys (tauri-utils 2.10.4 = released) [V]
```json
{
  "identifier": "com.example.annotate",
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "windows": {
      "webviewInstallMode": { "type": "downloadBootstrapper", "silent": true },
      "allowDowngrades": true,
      "nsis": {
        "installMode": "currentUser",
        "languages": ["English", "German"],
        "displayLanguageSelector": false,
        "startMenuFolder": null,
        "installerHooks": "./windows/hooks.nsh"
      }
    }
  }
}
```
- `installMode` (`NSISInstallerMode`): `currentUser` (default; no admin; `%LOCALAPPDATA%\<productName>`; HKCU),
  `perMachine` (Program Files, admin, HKLM), `both` (user chooses; "will require Administrator access even if
  the user wants to install it for the current user only").
- `webviewInstallMode` lives under **`bundle.windows`** (not `nsis`): `{type: "downloadBootstrapper", silent}`
  (default), `embedBootstrapper` (~1.8 MB), `offlineInstaller` (~127 MB), `fixedRuntime {path}` (~180 MB,
  extracted `.cab` folder), `skip`. Docs table calls it "fixedVersion" but the JSON tag is `fixedRuntime`.
  `bundle.windows.minimumWebview2Version` triggers an update if older (the `nsis.minimumWebview2Version` key is
  deprecated since 2.10.0).
- `languages`: NSIS language names, default `["English"]`; OS language used if present, else the first;
  Tauri ships custom strings for 23 languages in released tauri-bundler 2.10.6 (Polish pending in `dev`)
  (`tauri-bundler/src/bundle/windows/nsis/languages/*.nsh`, incl. Arabic);
  `customLanguageFiles` for others.
- Hooks: `NSIS_HOOK_PREINSTALL/POSTINSTALL/PREUNINSTALL/POSTUNINSTALL` (released). `NSIS_HOOK_PREFINISHPAGE`,
  `installerTarget`, `TAURIDIR` define, `/DELETEAPPDATA` uninstaller flag, `NSIS_PATH` reuse are in `dev`
  `.changes` (unreleased as of tauri-bundler 2.10.6).
- App data on uninstall/update (released template `installer.nsi`, `Section Uninstall`): a checkbox
  "Delete the application data" is added to the confirm page **unchecked by default**; only if checked and not
  in `/UPDATE` mode it runs `RmDir /r "$APPDATA\${BUNDLEID}"` and `RmDir /r "$LOCALAPPDATA\${BUNDLEID}"` and
  removes the HKCU/SHCTX product keys. Silent `/S` uninstall skips the page -> data kept. Updates (installer
  run over an existing install / updater `/UPDATE`) never delete app data. There is no config switch to hide
  the checkbox (https://github.com/tauri-apps/tauri/issues/15983; closed by author; options are a custom
  `template` or hook-level MUI hacks).
- Output: `src-tauri/target/release/bundle/nsis/<productName>_<version>_<arch>-setup.exe` (e.g. `_x64-setup.exe`);
  with `--target x86_64-pc-windows-msvc`: `target/x86_64-pc-windows-msvc/release/bundle/nsis/`. In a cargo
  workspace `target/` is at the workspace root. The bundler downloads NSIS 3.13 from
  `github.com/tauri-apps/binary-releases` and the `nsis_tauri_utils` plugin from GitHub (needs network on CI).

### 7.2 Minimal GitHub Actions (windows-latest) [V components]
`windows-latest` = Windows Server 2025 + VS 2026 image (runner-images README), Rust 1.100, Node 22 preinstalled.

Variant A, plain CLI + artifact:
```yaml
name: windows-build
on: { push: { branches: [main] }, workflow_dispatch: {} }
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: lts/*, cache: npm }
      - uses: dtolnay/rust-toolchain@stable
      - uses: swatinem/rust-cache@v2
        with: { workspaces: './src-tauri -> target' }
      - run: npm ci
      - run: npx tauri build --bundles nsis      # -b/--bundles: space/comma list; --ci is implied by CI=true
      - uses: actions/upload-artifact@v7
        with:
          name: nsis-installer
          path: src-tauri/target/release/bundle/nsis/*.exe
          if-no-files-found: error
```
Variant B, tauri-action (release + optional workflow artifacts):
```yaml
      - uses: tauri-apps/tauri-action@v1
        env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
        with:
          tagName: app-v__VERSION__
          releaseName: 'App v__VERSION__'
          releaseDraft: true
          args: '--bundles nsis'
          uploadWorkflowArtifacts: true         # omit tagName/releaseName/releaseId to build without a release
# job needs: permissions: { contents: write }
```

### 7.3 Signing [V tauri-docs `distribute/Sign/windows.mdx`]
Not required to run or install. Unsigned downloads get a SmartScreen "unrecognized app" warning; "Windows 11
with Smart App Control turned on ... blocks unknown unsigned apps even if they weren't downloaded from the
browser". Since 2024 EV certificates no longer grant instant SmartScreen reputation; OV and EV build
reputation the same way. Signing config: `bundle.windows.certificateThumbprint`/`digestAlgorithm`/`timestampUrl`
or `signCommand` (e.g. Azure Trusted Signing / osslsigncode).

---

## 8. Capabilities / permissions

Files in `src-tauri/capabilities/*.json` are all enabled automatically unless `app.security.capabilities` lists
some explicitly. `windows` entries match window **labels** and accept globs (`"overlay-*"`). [V]

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "overlay-toolbar",
  "description": "Toolbar + per-monitor overlays",
  "windows": ["toolbar", "overlay-*"],
  "permissions": [
    "core:default",
    "core:window:allow-set-ignore-cursor-events",
    "core:window:allow-set-focusable",
    "core:window:allow-set-focus",
    "core:window:allow-set-always-on-top",
    "core:window:allow-set-position",
    "core:window:allow-set-size",
    "core:window:allow-start-dragging",
    "global-shortcut:allow-register",
    "global-shortcut:allow-unregister",
    "global-shortcut:allow-unregister-all",
    "global-shortcut:allow-is-registered",
    "log:default"
  ]
}
```
Pitfalls [V unless noted]:
- `core:default` = `core:{path,event,window,webview,app,image,resources,menu,tray}:default` (generated in
  `crates/tauri/build.rs`). `core:window:default` contains only getters (`allow-scale-factor`,
  `allow-inner-position`, `allow-outer-size`, `allow-available-monitors`, `allow-monitor-from-point`,
  `allow-cursor-position`, `allow-is-always-on-top`, ...): every setter (`set-ignore-cursor-events`,
  `set-position`, `set-size`, `set-focusable`, `show`, `hide`, `start-dragging` for `data-tauri-drag-region`)
  must be granted explicitly.
- `core:event:default` = `allow-listen`, `allow-unlisten`, `allow-emit`, `allow-emit-to` (needed for
  `listen()`, log `attachConsole()`, cross-window events).
- `global-shortcut:default` is **empty** by design; list the commands you call.
- Plugin prefix = crate name without `tauri-plugin-` (`global-shortcut:`, `log:`, `dialog:`).
- ACL only gates IPC from the webview. Rust calls (`window.set_ignore_cursor_events()` in a command) need no
  permission, and your own `#[tauri::command]`s are allowed for all windows unless you opt into
  `tauri_build::AppManifest::commands(&[...])`. Prefer doing mode switches in one Rust command.
- Windows created later from Rust are covered if their label matches a capability glob.

---

## 9. Keeping the toolbar above the (topmost) overlays

Facts [V MS docs]:
- Topmost windows are ordered among themselves; "When an application creates a window, the system puts it at
  the top of the z-order for windows of the same type"; activation brings a window to the top of its band.
- "An owned window is always above its owner in the z-order"; destroyed with its owner; hidden when the owner
  is minimized; "Any window ... owned by a topmost window is itself made a topmost window". Changing the owner
  later: `SetWindowLongPtrW(hwnd, GWLP_HWNDPARENT, owner)` - MS: "GWLP_HWNDPARENT is used to change the owner
  of a top-level window" (window-features page says ownership cannot be transferred; the two pages
  disagree, but GWLP_HWNDPARENT is widely used).
- `WM_WINDOWPOSCHANGING`: "modifying any of the values in WINDOWPOS affects the window's new size, position,
  or place in the Z order" (note: changes to SWP_NOACTIVATE/SWP_NOOWNERZORDER are ignored).
- `set_always_on_top(true)` repeated = no-op in tao (section 2.2).

Options:
1. **Re-raise** (simplest) [I]: after every mode switch, overlay creation, resume/display change, and in the
   overlay subclass on `WM_ACTIVATE`/`WM_WINDOWPOSCHANGED`:
   ```rust
   SetWindowPos(toolbar, Some(HWND_TOPMOST), 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_NOOWNERZORDER)?;
   ```
2. **Guard on overlays** (section 2.11 code): in `WM_WINDOWPOSCHANGING` of each overlay, when z-order changes
   to `HWND_TOP`/`HWND_TOPMOST`, set `hwndInsertAfter = toolbar_hwnd` so the overlay is placed directly under
   the toolbar. Leave `HWND_NOTOPMOST`/`HWND_BOTTOM` requests alone. Combine with (1).
3. **Owner relationship**: create the toolbar with `.owner(&overlay)` (Windows-only builder API; tao uses
   `Parent::OwnedBy` -> `WS_POPUP`, no taskbar button) -> always above that overlay. Downsides: only one owner
   (the toolbar overlaps only the overlay of the monitor it is on, so re-owner with `GWLP_HWNDPARENT` when the
   toolbar moves to another monitor), and the toolbar is destroyed with its owner (hot-plug recreation of that
   overlay kills the toolbar). Not recommended as the sole mechanism. [I]
4. Beyond app-level: other apps' topmost windows can still interleave; the only way above all normal topmost
   windows is the UIAccess z-band (`uiAccess="true"` manifest, signed, installed in a secure location) - not
   viable for an unsigned app. [I]

---

## 10. GUI smoke tests on GitHub-hosted `windows-latest`

Facts [V]:
- x64 Windows images run an **interactive** desktop session; foreground activation works on
  `windows-latest`, fails on `windows-11-arm` ("the difference is foreground, not interactivity", maintainer,
  https://github.com/actions/runner-images/issues/14049).
- Default resolution 1024x768; `Set-DisplayResolution -Width 1920 -Height 1080 -Force` works; "max possible
  resolution is 1080p" (https://github.com/actions/runner-images/issues/2935). One display only: no
  multi-monitor / mixed-DPI coverage on hosted runners (needs a self-hosted runner or a virtual display
  driver [U]).
- WebView2 Runtime is Evergreen, present, auto-updating, **not pinned** by the image; msedgedriver/tauri-driver
  WebDriver automation "works through runtime 132 and breaks from 133 onward"
  (https://github.com/actions/runner-images/issues/14738 -> WebView2Feedback#5415). Avoid WebDriver; use native
  Win32 assertions, or Playwright `connectOverCDP` with `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`
  (https://github.com/microsoft/playwright/blob/main/docs/src/webview2.md). Caveat: wry passes its own
  `--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection`; whether the env var is merged with
  app-supplied args: [U].
- `SendInput` "is subject to UIPI ... inject input only into applications that are at an equal or lesser
  integrity level"; requires an unlocked interactive desktop. `WindowFromPoint` skips hidden/disabled windows.

Smoke test design (built into the app behind `--smoke-test`, exit code via `app.exit(code)`; since 2.12.0 the
code propagates to `run_return`) [I]:
1. Wait for overlays; for each overlay HWND assert `GetWindowLongPtrW(GWL_EXSTYLE)` has
   `WS_EX_TRANSPARENT|WS_EX_LAYERED|WS_EX_TOPMOST|WS_EX_NOACTIVATE` (+ `WS_EX_TOOLWINDOW` if pinned).
2. Create a native sentinel window (or use the desktop) under the overlay; `WindowFromPoint(center)`:
   `GetAncestor(hit, GA_ROOT) != overlay` in desktop mode. `SendInput` a left click; sentinel must receive
   `WM_LBUTTONDOWN`.
3. Switch to annotation mode; poll until styles change (setters are async); `GetAncestor(WindowFromPoint(c),
   GA_ROOT) == overlay` (hit will be the `Chrome_RenderWidgetHostHWND` child); SendInput a drag; ask the page
   (custom command/event) whether a stroke was recorded.
4. `SHQueryUserNotificationState` should not be `QUNS_BUSY` (rude-window check, section 3.1); toolbar must be
   above overlay: walk `GetWindow(toolbar, GW_HWNDNEXT)` chain.
5. Global shortcut: `SendInput` the chord -> handler fires (Pressed then Released).
6. Screenshot (e.g. PowerShell `System.Drawing` CopyFromScreen) to an artifact; note no GPU (software
   compositing), so visual results may differ from real hardware.

```yaml
      - name: Display 1080p
        shell: pwsh
        run: Set-DisplayResolution -Width 1920 -Height 1080 -Force
      - name: Smoke test
        shell: pwsh
        run: |
          $p = Start-Process -FilePath "src-tauri/target/release/app.exe" -ArgumentList "--smoke-test" -PassThru
          if (-not $p.WaitForExit(120000)) { $p.Kill(); throw "timeout" }
          if ($p.ExitCode -ne 0) { throw "smoke test failed: $($p.ExitCode)" }
```

---

## 11. Must-test list (things no source settles)

1. `no_redirection_bitmap(true)` + `set_ignore_cursor_events(true)`: webview still visible, transparent and
   click-through on Win10 22H2 and Win11 24H2+? If not, drop `no_redirection_bitmap` and avoid hide/show
   (white flash only matters at show time).
2. 1 px-short overlay and/or `NonRudeHWND`: taskbar stays topmost, `QUNS_BUSY` not reported, Focus Assist /
   DND not auto-enabled.
3. Chromium apps under the overlay keep rendering in annotation mode with `WS_EX_TOOLWINDOW` pinned.
4. Pen/touch input in a `WS_EX_NOACTIVATE` overlay.
5. Mixed-DPI placement (125% + 150% + negative-coordinate monitor) incl. the user changing scale at runtime.
6. Sleep/resume + monitor power-off/DisplayPort disconnect: overlays reconcile, hotkeys still fire.
7. WebView2 Beta/Canary channel run (`WEBVIEW2_RELEASE_CHANNEL_PREFERENCE` or Canary install) to catch
   transparency regressions early.

## Sources (primary)
- Versions: https://crates.io/api/v1/crates/{tauri,tauri-build,tauri-runtime-wry,tao,wry,windows,tauri-plugin-global-shortcut,tauri-plugin-log,tauri-plugin-single-instance,tauri-plugin-dialog,global-hotkey,tauri-cli} ; https://registry.npmjs.org/@tauri-apps/{api,cli,plugin-global-shortcut,plugin-log,plugin-dialog}
- tao: https://github.com/tauri-apps/tao/tree/tao-v0.37.3/src/platform_impl/windows (window_state.rs `to_window_styles`/`apply_diff`; window.rs `set_ignore_cursor_events`, `set_skip_taskbar`, `set_outer_position`, `init`, `on_create`, `force_window_active`; event_loop.rs `WM_DPICHANGED`, `WM_NCHITTEST`, `WM_NCCALCSIZE`, `WM_WINDOWPOSCHANGING`; dpi.rs) ; CHANGELOG https://github.com/tauri-apps/tao/blob/dev/CHANGELOG.md
- wry: https://github.com/tauri-apps/wry/blob/dev/src/webview2/mod.rs ; https://github.com/tauri-apps/wry/blob/dev/src/lib.rs
- tauri: https://github.com/tauri-apps/tauri/tree/dev/crates (tauri/src/webview/webview_window.rs, tauri/src/manager/webview.rs, tauri/build.rs, tauri-runtime-wry/src/{lib.rs,undecorated_resizing.rs}, tauri-utils/src/config.rs, tauri-bundler/src/bundle/windows/nsis/{installer.nsi,mod.rs,includes/pages/uninstall-confirm.nsh}) ; CHANGELOG crates/tauri/CHANGELOG.md ; PR https://github.com/tauri-apps/tauri/pull/15410
- Plugins: https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/{global-shortcut,log,single-instance} ; https://github.com/tauri-apps/global-hotkey/blob/dev/src/platform_impl/windows/mod.rs
- tauri-action: https://github.com/tauri-apps/tauri-action (README, CHANGELOG v1.0.0)
- Tauri docs (repo tauri-apps/tauri-docs): https://v2.tauri.app/distribute/windows-installer/ , /distribute/sign/windows/ , /distribute/pipelines/github/ , /security/capabilities/ , /plugin/logging/ , /plugin/global-shortcut/
- Microsoft (read via MicrosoftDocs GitHub mirrors): https://learn.microsoft.com/en-us/windows/win32/winmsg/extended-window-styles ; .../winmsg/window-features ; .../api/winuser/nf-winuser-setwindowpos ; .../api/winuser/nf-winuser-setwindowlongptrw ; .../winmsg/wm-windowposchanging ; .../winmsg/wm-stylechanging ; .../gdi/wm-displaychange ; .../power/wm-powerbroadcast ; .../power/pbt-apmresumeautomatic ; .../api/winuser/nf-winuser-registerhotkey ; .../api/shellapi/ne-shellapi-query_user_notification_state ; .../api/commctrl/nf-commctrl-setwindowsubclass ; .../inputdev/wm-nchittest ; .../api/winuser/nf-winuser-windowfrompoint ; .../api/winuser/nf-winuser-sendinput ; .../shell/taskbar ; https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2controller2 , .../icorewebview2controller3
- Issues: tauri #15947 #16341 #14831 #15490 #14764 #7328 #11176 #10422 #14386 #6843 #15841 #11052 #11461 #6164 #15983 #15471 ; WebView2Feedback #5481 #5752 #5668 ; wails #6088 ; global-hotkey #176 #87 ; PowerToys #50855 ; dechamps/RudeWindowFixer README + #4 ; runner-images #14049 #2935 #14738 + README ; Chromium ui/gfx/win/hwnd_util.cc, ui/display/win/screen_win.cc ; Zebar window_ext_windows.rs
