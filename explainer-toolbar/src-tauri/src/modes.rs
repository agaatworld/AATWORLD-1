//! Applies the core state machine to real windows.

use crate::native;
use crate::state::{lock, AppState};
use crate::windows::{create_overlay, hwnd_of, TOOLBAR};
use explainer_core::mode::{effects, Mode, ModeEvent, Outcome, OverlayVisibility};
use serde::Serialize;
use std::sync::atomic::Ordering;
use std::sync::OnceLock;
use std::thread::ThreadId;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModeInfo {
    pub mode: Mode,
    pub revision: u64,
}

pub fn current(app: &AppHandle) -> ModeInfo {
    let st = app.state::<AppState>();
    let mm = lock(&st.mode);
    ModeInfo { mode: mm.mode(), revision: mm.revision() }
}

static MAIN_THREAD: OnceLock<ThreadId> = OnceLock::new();

/// Called once from `setup` (which runs on the main thread).
pub fn mark_main_thread() {
    let _ = MAIN_THREAD.set(std::thread::current().id());
}

fn on_main_thread() -> bool {
    MAIN_THREAD.get().map(|id| *id == std::thread::current().id()).unwrap_or(true)
}

/// The single entry point for every mode request (toolbar, hotkeys, tray,
/// watchdog, recovery, self-test). Thread-safe and idempotent: requests from
/// other threads are executed on the main thread, so the transition and the
/// window changes it implies are applied strictly one after another and can
/// never interleave (an interleaving could leave an overlay capturing input
/// in desktop mode).
pub fn request(app: &AppHandle, event: ModeEvent, source: &str) -> Result<ModeInfo, String> {
    if on_main_thread() {
        return request_now(app, event, source);
    }
    let (tx, rx) = std::sync::mpsc::channel();
    let a = app.clone();
    let src = source.to_string();
    app.run_on_main_thread(move || {
        let _ = tx.send(request_now(&a, event, &src));
    })
    .map_err(|e| e.to_string())?;
    rx.recv_timeout(Duration::from_secs(5)).map_err(|_| "the window thread did not answer".to_string())?
}

fn request_now(app: &AppHandle, event: ModeEvent, source: &str) -> Result<ModeInfo, String> {
    let st = app.state::<AppState>();
    let (outcome, revision) = {
        let mut mm = lock(&st.mode);
        let o = mm.apply(event);
        (o, mm.revision())
    };
    match outcome {
        Outcome::Rejected { mode, reason, .. } => {
            log::info!("mode request {event:?} from {source} rejected in {mode:?}: {reason}");
            Err(reason.to_string())
        }
        Outcome::Unchanged(mode) => {
            // Re-assert effects anyway: cheap, and heals any drift.
            apply_effects(app, mode);
            Ok(ModeInfo { mode, revision })
        }
        Outcome::Changed { from, to } => {
            log::info!("mode {from:?} -> {to:?} ({event:?} from {source})");
            apply_effects(app, to);
            let info = ModeInfo { mode: to, revision };
            let _ = app.emit("mode://changed", &info);
            if to == Mode::Recovering {
                start_recovery(app.clone());
            }
            Ok(info)
        }
    }
}

/// Re-apply the effects of the current mode (after monitor changes etc.).
pub fn reapply(app: &AppHandle) {
    if on_main_thread() {
        let mode = current(app).mode;
        apply_effects(app, mode);
    } else {
        let a = app.clone();
        let _ = app.run_on_main_thread(move || reapply(&a));
    }
}

fn apply_effects(app: &AppHandle, mode: Mode) {
    let st = app.state::<AppState>();
    let e = effects(mode);
    let force_visible = st.force_overlays_visible.load(Ordering::Relaxed);
    let overlays: Vec<(String, bool, bool, isize)> =
        lock(&st.overlays).values().map(|o| (o.label.clone(), o.ready, o.has_content, o.hwnd)).collect();

    // 1. Safety first: drop input capture before anything else changes.
    if !e.overlays_capture_input {
        for (label, _, _, hwnd) in &overlays {
            native::set_clickthrough_desired(*hwnd, true);
            if let Some(w) = app.get_webview_window(label) {
                let _ = w.set_ignore_cursor_events(true);
                let _ = w.set_focusable(false);
            }
        }
    }

    // 2. Visibility. Showing a window can activate it; if an overlay ends
    //    up in the foreground outside drawing mode, hand focus back.
    let fg_before = native::foreground();
    for (label, ready, has_content, _) in &overlays {
        let Some(w) = app.get_webview_window(label) else { continue };
        let show = match e.overlays_visible {
            OverlayVisibility::Always => *ready,
            OverlayVisibility::WhenContent => *ready && (*has_content || force_visible),
            OverlayVisibility::Hidden => false,
        };
        let visible = w.is_visible().unwrap_or(false);
        if show && !visible {
            let _ = w.show();
        } else if !show && visible {
            let _ = w.hide();
        }
    }

    if !e.overlays_capture_input {
        let fg = native::foreground();
        if fg != fg_before && overlays.iter().any(|(_, _, _, h)| *h == fg) {
            log::warn!("an overlay took focus while click-through; restoring the previous window");
            native::set_foreground(fg_before);
        }
    }

    // 3. Capture input only now, on ready overlays.
    if e.overlays_capture_input {
        let cursor = native::cursor_pos();
        let monitors = lock(&st.monitors).clone();
        let focus_key = cursor
            .and_then(|(x, y)| explainer_core::layout::monitor_for_point(&monitors, x as f64, y as f64))
            .map(|m| m.key.clone());
        let ov = lock(&st.overlays).clone();
        for (key, o) in ov.iter() {
            if !o.ready {
                continue;
            }
            native::set_clickthrough_desired(o.hwnd, false);
            if let Some(w) = app.get_webview_window(&o.label) {
                let _ = w.set_focusable(true);
                let _ = w.set_ignore_cursor_events(false);
                if focus_key.as_deref() == Some(key.as_str()) {
                    let _ = w.set_focus();
                }
            }
        }
    }

    // 4. Escape hotkey, watchdog, toolbar on top.
    crate::shortcuts::set_escape_hotkey(app, e.escape_hotkey);
    {
        let now = explainer_core::util::unix_ms();
        for o in lock(&st.overlays).values_mut() {
            o.last_heartbeat_ms = now;
        }
        let (m, cv) = &st.watchdog;
        *lock(m) = e.watchdog;
        cv.notify_all();
    }
    if let Some(tb) = app.get_webview_window(TOOLBAR) {
        native::raise_topmost(hwnd_of(&tb));
    }
}

// ───────────────────────── Escape ─────────────────────────

/// Global Escape (registered only while drawing). Every webview gets a
/// chance to consume it (cancel a gesture, close a popover); if nobody
/// answers within 350 ms — e.g. a frozen page — drawing mode ends anyway.
pub fn on_escape(app: &AppHandle) {
    let st = app.state::<AppState>();
    let id = st.next_id();
    let mut pending: Vec<String> = lock(&st.overlays).values().filter(|o| o.ready).map(|o| o.label.clone()).collect();
    pending.push(TOOLBAR.into());
    {
        let mut esc = lock(&st.escape);
        esc.id = id;
        esc.pending = pending;
        esc.consumed = false;
    }
    let _ = app.emit("escape://request", id);
    let app2 = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(350));
        let st = app2.state::<AppState>();
        let decide = {
            let esc = lock(&st.escape);
            esc.id == id && !esc.consumed && !esc.pending.is_empty()
        };
        if decide {
            log::warn!("escape: no answer from {:?}; leaving drawing mode", lock(&st.escape).pending);
            let _ = request(&app2, ModeEvent::ExitAnnotation, "escape-timeout");
        }
    });
}

pub fn escape_reply(app: &AppHandle, id: u64, label: &str, consumed: bool) {
    let st = app.state::<AppState>();
    let exit = {
        let mut esc = lock(&st.escape);
        if esc.id != id {
            return;
        }
        esc.pending.retain(|l| l != label);
        if consumed {
            esc.consumed = true;
        }
        let done = esc.pending.is_empty() && !esc.consumed;
        if done {
            esc.id = 0; // decided
        }
        done
    };
    if exit {
        let _ = request(app, ModeEvent::ExitAnnotation, "escape");
    }
}

// ───────────────────────── recovery ─────────────────────────

/// Rebuild overlays that stopped responding. The mode is already
/// `Recovering`, so every overlay is click-through while this runs.
fn start_recovery(app: AppHandle) {
    std::thread::spawn(move || {
        let st = app.state::<AppState>();
        let now = explainer_core::util::unix_ms();
        let stale: Vec<(String, String, u32)> = lock(&st.overlays)
            .iter()
            .filter(|(_, o)| !o.ready || now.saturating_sub(o.last_heartbeat_ms) > 2500)
            .map(|(k, o)| (k.clone(), o.label.clone(), o.generation))
            .collect();
        let monitors = lock(&st.monitors).clone();
        for (key, label, generation) in &stale {
            log::warn!("rebuilding overlay {label}");
            lock(&st.history).forget(key);
            let app2 = app.clone();
            let label = label.clone();
            let m = monitors.iter().find(|m| &m.key == key).cloned();
            let generation = *generation;
            let _ = app.run_on_main_thread(move || {
                if let Some(w) = app2.get_webview_window(&label) {
                    let _ = w.destroy();
                }
                if let Some(m) = m {
                    if let Err(e) = create_overlay(&app2, &m, generation + 1) {
                        log::error!("overlay rebuild failed: {e}");
                    }
                }
            });
        }
        // Wait for the new overlays to report ready (max 15 s).
        for _ in 0..150 {
            std::thread::sleep(Duration::from_millis(100));
            if lock(&st.overlays).values().all(|o| o.ready) {
                break;
            }
        }
        let _ = request(&app, ModeEvent::RecoveryDone, "recovery");
    });
}
