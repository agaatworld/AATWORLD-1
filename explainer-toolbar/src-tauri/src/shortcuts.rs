//! Global shortcuts (RegisterHotKey via tauri-plugin-global-shortcut).

use crate::state::{lock, AppState, ShortcutStatus};
use explainer_core::mode::ModeEvent;
use explainer_core::shortcut::normalize;
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Action {
    ToggleAnnotation,
    ToggleToolbar,
    ToggleInk,
    ClearAll,
    Escape,
}

fn action_name(a: Action) -> &'static str {
    match a {
        Action::ToggleAnnotation => "toggleAnnotation",
        Action::ToggleToolbar => "toggleToolbar",
        Action::ToggleInk => "toggleInk",
        Action::ClearAll => "clearAll",
        Action::Escape => "escape",
    }
}

static BINDINGS: std::sync::Mutex<Vec<(Shortcut, Action)>> = std::sync::Mutex::new(Vec::new());

/// Plugin handler: only key-down, debounced (holding a key repeats).
pub fn handle(app: &AppHandle, shortcut: &Shortcut, state: ShortcutState) {
    if state != ShortcutState::Pressed {
        return;
    }
    let action = lock(&BINDINGS).iter().find(|(s, _)| s == shortcut).map(|(_, a)| *a);
    let Some(action) = action else { return };
    let st = app.state::<AppState>();
    let now = explainer_core::util::unix_ms();
    if action != Action::Escape {
        let last = st.last_toggle_ms.swap(now, Ordering::Relaxed);
        if now.saturating_sub(last) < 220 {
            return;
        }
    }
    log::info!("hotkey {}", action_name(action));
    run(app, action);
}

pub fn run(app: &AppHandle, action: Action) {
    match action {
        Action::ToggleAnnotation => {
            let _ = crate::modes::request(app, ModeEvent::ToggleAnnotation, "hotkey");
        }
        Action::ToggleInk => {
            let _ = crate::modes::request(app, ModeEvent::ToggleInk, "hotkey");
        }
        Action::ToggleToolbar => {
            let visible = lock(&app.state::<AppState>().toolbar).visible;
            crate::windows::show_toolbar(app, !visible);
        }
        Action::ClearAll => crate::commands::clear_all_ink(app),
        Action::Escape => crate::modes::on_escape(app),
    }
}

/// (Re)register the configured shortcuts. Safe to call repeatedly — after
/// a settings change and after Windows resumes from sleep.
///
/// Always runs on the main thread: the plugin's `unregister_all` holds its
/// internal lock while waiting for the main thread, so calling it from any
/// other thread can deadlock against a hotkey press or an Escape
/// registration happening at the same moment.
pub fn register_all(app: &AppHandle) {
    if !crate::modes::is_main_thread() {
        let a = app.clone();
        let _ = app.run_on_main_thread(move || register_all(&a));
        return;
    }
    let st = app.state::<AppState>();
    let sc = lock(&st.settings).shortcuts();
    let gs = app.global_shortcut();
    let escape_on = lock(&BINDINGS).iter().any(|(_, a)| *a == Action::Escape);
    if let Err(e) = gs.unregister_all() {
        log::warn!("unregister_all failed: {e}");
    }
    lock(&BINDINGS).clear();
    let wanted = [
        (Action::ToggleAnnotation, sc.toggle_annotation),
        (Action::ToggleToolbar, sc.toggle_toolbar),
        (Action::ToggleInk, sc.toggle_ink),
        (Action::ClearAll, sc.clear_all),
    ];
    let mut status = Vec::new();
    let mut taken: Vec<String> = Vec::new();
    for (action, raw) in wanted {
        let name = action_name(action).to_string();
        if raw.trim().is_empty() {
            status.push(ShortcutStatus { action: name, accelerator: String::new(), ok: true, error: None });
            continue;
        }
        let res = normalize(&raw).map_err(|e| e.to_string()).and_then(|n| {
            if taken.contains(&n) {
                return Err("already used by another action".to_string());
            }
            let s: Shortcut = n.parse().map_err(|e| format!("{e}"))?;
            gs.register(s).map_err(|e| format!("another program is using it ({e})"))?;
            taken.push(n.clone());
            Ok((s, n))
        });
        match res {
            Ok((s, n)) => {
                lock(&BINDINGS).push((s, action));
                status.push(ShortcutStatus { action: name, accelerator: n, ok: true, error: None });
            }
            Err(e) => {
                log::warn!("shortcut {name} = {raw}: {e}");
                status.push(ShortcutStatus { action: name, accelerator: raw.clone(), ok: false, error: Some(e) });
            }
        }
    }
    *lock(&st.shortcuts) = status.clone();
    let _ = app.emit("shortcuts://status", &status);
    if escape_on {
        set_escape_hotkey(app, true);
    }
}

/// Main thread only (called from the mode controller).
pub fn set_escape_hotkey(app: &AppHandle, on: bool) {
    debug_assert!(crate::modes::is_main_thread());
    let has = lock(&BINDINGS).iter().any(|(_, a)| *a == Action::Escape);
    if on == has {
        return;
    }
    let gs = app.global_shortcut();
    let esc: Shortcut = match "Escape".parse() {
        Ok(s) => s,
        Err(_) => return,
    };
    if on {
        match gs.register(esc) {
            Ok(()) => lock(&BINDINGS).push((esc, Action::Escape)),
            Err(e) => log::warn!("cannot register Escape as a safety key: {e} (the page still handles Esc)"),
        }
    } else {
        let _ = gs.unregister(esc);
        lock(&BINDINGS).retain(|(_, a)| *a != Action::Escape);
    }
}

/// True while the Escape safety key is registered.
pub fn escape_active() -> bool {
    lock(&BINDINGS).iter().any(|(_, a)| *a == Action::Escape)
}

pub fn unregister_everything(app: &AppHandle) {
    let _ = app.global_shortcut().unregister_all();
    lock(&BINDINGS).clear();
}
