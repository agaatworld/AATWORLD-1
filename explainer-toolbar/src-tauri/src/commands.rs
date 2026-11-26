//! Commands invoked by the webviews. All are `async` so that file I/O and
//! waiting never block the main (window) thread.

use crate::modes::{self, ModeInfo};
use crate::state::{lock, AppState, ShortcutStatus};
use explainer_core::storage::{self, WorkspaceIndex, WorkspaceMeta};
use crate::windows::{self, LayoutReply, LayoutRequest};
use explainer_core::mode::{Mode, ModeEvent};
use explainer_core::monitor::MonitorInfo;
use serde::Serialize;
use serde_json::{json, Value};
use std::time::Duration;
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Emitter, Manager, State, WebviewWindow};
use tauri_plugin_dialog::DialogExt;

type R<T> = Result<T, String>;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsSnapshot {
    pub revision: u64,
    pub doc: Value,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HistoryState {
    pub can_undo: bool,
    pub can_redo: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Bootstrap {
    pub label: String,
    pub monitor: Option<MonitorInfo>,
    pub monitors: Vec<MonitorInfo>,
    pub mode: ModeInfo,
    pub settings: SettingsSnapshot,
    pub workspaces: WorkspaceIndex,
    pub shortcuts: Vec<ShortcutStatus>,
    pub history: HistoryState,
    pub version: String,
    pub self_test: bool,
    pub toolbar_visible: bool,
}

fn monitor_of_label(st: &AppState, label: &str) -> Option<String> {
    lock(&st.overlays).iter().find(|(_, o)| o.label == label).map(|(k, _)| k.clone())
}

fn history_state(st: &AppState) -> HistoryState {
    let h = lock(&st.history);
    HistoryState { can_undo: h.can_undo(), can_redo: h.can_redo() }
}

fn emit_history(app: &AppHandle) {
    let hs = history_state(&app.state::<AppState>());
    let _ = app.emit("history://state", hs);
}

pub fn settings_snapshot(st: &AppState) -> SettingsSnapshot {
    let s = lock(&st.settings);
    SettingsSnapshot { revision: s.revision(), doc: s.doc().clone() }
}

pub fn mark_settings_dirty(st: &AppState) {
    let (m, cv) = &st.settings_dirty;
    *lock(m) = true;
    cv.notify_all();
}

/// Background writer: coalesces bursts of changes into one atomic write.
pub fn spawn_settings_writer(app: AppHandle) {
    std::thread::Builder::new()
        .name("settings-writer".into())
        .spawn(move || loop {
            let st = app.state::<AppState>();
            {
                let (m, cv) = &st.settings_dirty;
                let mut dirty = lock(m);
                while !*dirty {
                    dirty = cv.wait(dirty).unwrap_or_else(|p| p.into_inner());
                }
                *dirty = false;
            }
            std::thread::sleep(Duration::from_millis(350));
            write_settings_now(&st);
        })
        .ok();
}

pub fn write_settings_now(st: &AppState) {
    let doc = lock(&st.settings).doc().clone();
    if let Err(e) = storage::save_settings(&st.paths, &doc) {
        log::error!("saving settings failed: {e}");
    }
}

pub fn persist_anchor(app: &AppHandle, x: f64, y: f64) {
    let st = app.state::<AppState>();
    let r = lock(&st.settings).apply(&json!({"toolbar": {"anchor": {"x": x.round(), "y": y.round()}}}));
    if r.is_ok() {
        mark_settings_dirty(&st);
    }
}

#[tauri::command]
pub async fn get_bootstrap(window: WebviewWindow, state: State<'_, AppState>) -> R<Bootstrap> {
    let label = window.label().to_string();
    let monitors = lock(&state.monitors).clone();
    let key = monitor_of_label(&state, &label);
    let monitor = key.and_then(|k| monitors.iter().find(|m| m.key == k).cloned());
    let mode = {
        let mm = lock(&state.mode);
        ModeInfo { mode: mm.mode(), revision: mm.revision() }
    };
    Ok(Bootstrap {
        label,
        monitor,
        monitors,
        mode,
        settings: settings_snapshot(&state),
        workspaces: lock(&state.workspaces).clone(),
        shortcuts: lock(&state.shortcuts).clone(),
        history: history_state(&state),
        version: env!("CARGO_PKG_VERSION").to_string(),
        self_test: state.self_test.load(std::sync::atomic::Ordering::Relaxed),
        toolbar_visible: lock(&state.toolbar).visible,
    })
}

#[tauri::command]
pub async fn request_mode(app: AppHandle, event: ModeEvent) -> R<ModeInfo> {
    modes::request(&app, event, "ui")
}

#[tauri::command]
pub async fn overlay_ready(app: AppHandle, window: WebviewWindow, has_content: bool) -> R<()> {
    let st = app.state::<AppState>();
    let label = window.label().to_string();
    {
        let mut ov = lock(&st.overlays);
        if let Some(o) = ov.values_mut().find(|o| o.label == label) {
            o.ready = true;
            o.has_content = has_content;
            o.last_heartbeat_ms = explainer_core::util::unix_ms();
        }
    }
    log::info!("{label} ready (content: {has_content})");
    modes::reapply(&app);
    Ok(())
}

#[tauri::command]
pub async fn heartbeat(window: WebviewWindow, state: State<'_, AppState>) -> R<()> {
    let label = window.label();
    if let Some(o) = lock(&state.overlays).values_mut().find(|o| o.label == label) {
        o.last_heartbeat_ms = explainer_core::util::unix_ms();
    }
    Ok(())
}

#[tauri::command]
pub async fn report_content(app: AppHandle, window: WebviewWindow, has_content: bool) -> R<()> {
    let st = app.state::<AppState>();
    let label = window.label().to_string();
    let changed = {
        let mut ov = lock(&st.overlays);
        match ov.values_mut().find(|o| o.label == label) {
            Some(o) if o.has_content != has_content => {
                o.has_content = has_content;
                true
            }
            _ => false,
        }
    };
    if changed {
        modes::reapply(&app);
    }
    Ok(())
}

#[tauri::command]
pub async fn report_failure(app: AppHandle, window: WebviewWindow, message: String) -> R<()> {
    log::error!("{} reported a failure: {}", window.label(), message.chars().take(500).collect::<String>());
    if window.label().starts_with("overlay-") {
        let _ = modes::request(&app, ModeEvent::FrontendLost, "frontend-error");
    }
    Ok(())
}

#[tauri::command]
pub async fn toolbar_layout(app: AppHandle, request: LayoutRequest) -> R<LayoutReply> {
    let (tx, rx) = std::sync::mpsc::channel();
    let app2 = app.clone();
    app.run_on_main_thread(move || {
        let _ = tx.send(windows::layout_toolbar(&app2, request));
    })
    .map_err(|e| e.to_string())?;
    rx.recv_timeout(Duration::from_secs(5)).map_err(|_| "timed out".to_string())?
}

#[tauri::command]
pub async fn toolbar_start_drag(window: WebviewWindow) -> R<()> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_settings(app: AppHandle, patch: Value) -> R<u64> {
    let st = app.state::<AppState>();
    let before = lock(&st.settings).shortcuts();
    let (revision, doc, after) = {
        let mut s = lock(&st.settings);
        let r = s.apply(&patch).map_err(|e| e.to_string())?;
        (r, s.doc().clone(), s.shortcuts())
    };
    mark_settings_dirty(&st);
    let _ = app.emit("settings://changed", json!({ "revision": revision, "doc": doc }));
    if before != after {
        crate::shortcuts::register_all(&app);
    }
    Ok(revision)
}

#[tauri::command]
pub async fn validate_shortcut(state: State<'_, AppState>, action: String, accelerator: String) -> R<String> {
    let n = explainer_core::shortcut::normalize(&accelerator).map_err(|e| e.to_string())?;
    let sc = lock(&state.settings).shortcuts();
    let others = [
        ("toggleAnnotation", sc.toggle_annotation),
        ("toggleToolbar", sc.toggle_toolbar),
        ("toggleInk", sc.toggle_ink),
        ("clearAll", sc.clear_all),
    ];
    for (name, s) in others {
        if name != action && explainer_core::shortcut::normalize(&s).ok().as_deref() == Some(n.as_str()) {
            return Err(format!("already used by \"{name}\""));
        }
    }
    Ok(n)
}

#[tauri::command]
pub async fn shortcut_status(state: State<'_, AppState>) -> R<Vec<ShortcutStatus>> {
    Ok(lock(&state.shortcuts).clone())
}

// ───────────────────────── history ─────────────────────────

#[tauri::command]
pub async fn record_edit(app: AppHandle, window: WebviewWindow, group: Option<String>) -> R<()> {
    let st = app.state::<AppState>();
    let Some(key) = monitor_of_label(&st, window.label()) else { return Ok(()) };
    let now = explainer_core::util::unix_ms();
    let had_redo = {
        let mut h = lock(&st.history);
        let mut lg = lock(&st.last_group);
        match group {
            Some(g) if lg.as_ref().map(|(x, t)| *x == g && now - *t < 5000).unwrap_or(false) => {
                h.extend_last(key);
                false
            }
            Some(g) => {
                *lg = Some((g, now));
                h.record(vec![key])
            }
            None => {
                *lg = None;
                h.record(vec![key])
            }
        }
    };
    if had_redo {
        let _ = app.emit("history://clear-redo", ());
    }
    emit_history(&app);
    Ok(())
}

fn route_history(app: &AppHandle, undo: bool) -> R<bool> {
    let st = app.state::<AppState>();
    let targets = {
        let mut h = lock(&st.history);
        if undo {
            h.undo()
        } else {
            h.redo()
        }
    };
    *lock(&st.last_group) = None;
    let done = targets.is_some();
    if let Some(t) = targets {
        let _ = app.emit("history://apply", json!({ "op": if undo { "undo" } else { "redo" }, "targets": t }));
    }
    emit_history(app);
    Ok(done)
}

#[tauri::command]
pub async fn undo(app: AppHandle) -> R<bool> {
    route_history(&app, true)
}

#[tauri::command]
pub async fn redo(app: AppHandle) -> R<bool> {
    route_history(&app, false)
}

pub fn clear_all_ink(app: &AppHandle) {
    let id = app.state::<AppState>().next_id();
    let _ = app.emit("scene://clear", json!({ "group": format!("clear-{id}") }));
}

#[tauri::command]
pub async fn clear_all(app: AppHandle) -> R<()> {
    clear_all_ink(&app);
    Ok(())
}

// ───────────────────────── escape / flush ─────────────────────────

#[tauri::command]
pub async fn escape_reply(app: AppHandle, window: WebviewWindow, id: u64, consumed: bool) -> R<()> {
    modes::escape_reply(&app, id, window.label(), consumed);
    Ok(())
}

#[tauri::command]
pub async fn flush_done(window: WebviewWindow, state: State<'_, AppState>, id: u64) -> R<()> {
    let mut f = lock(&state.flush);
    if f.0 == id {
        let label = window.label().to_string();
        f.1.retain(|l| *l != label);
    }
    Ok(())
}

/// Ask every overlay to save now and wait (bounded) for their answers.
/// Must not run on the main thread.
pub fn flush_overlays(app: &AppHandle, timeout: Duration) {
    let st = app.state::<AppState>();
    let id = st.next_id();
    let pending: Vec<String> = lock(&st.overlays).values().filter(|o| o.ready).map(|o| o.label.clone()).collect();
    if pending.is_empty() {
        return;
    }
    *lock(&st.flush) = (id, pending);
    let _ = app.emit("app://flush", id);
    let start = std::time::Instant::now();
    while start.elapsed() < timeout {
        if lock(&st.flush).1.is_empty() {
            return;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    log::warn!("flush: no answer from {:?}", lock(&st.flush).1);
}

// ───────────────────────── scenes ─────────────────────────

fn active_ws(st: &AppState) -> String {
    lock(&st.workspaces).active.clone()
}

#[tauri::command]
pub async fn load_scene(window: WebviewWindow, state: State<'_, AppState>) -> R<Option<String>> {
    let Some(key) = monitor_of_label(&state, window.label()) else { return Ok(None) };
    // "Restore drawings at start-up" only affects the first load of each
    // monitor in this run; workspace switches and rebuilds always load.
    let first = lock(&state.loaded_once).insert(key.clone());
    let restore = lock(&state.settings).doc().pointer("/ui/restoreOnStart").and_then(Value::as_bool).unwrap_or(true);
    if first && !restore {
        return Ok(None);
    }
    Ok(storage::load_scene(&state.paths, &active_ws(&state), &key))
}

#[tauri::command]
pub async fn save_scene(window: WebviewWindow, state: State<'_, AppState>, json: String) -> R<()> {
    let Some(key) = monitor_of_label(&state, window.label()) else { return Ok(()) };
    let ws = active_ws(&state);
    storage::save_scene(&state.paths, &ws, &key, &json).inspect_err(|e| log::error!("saving the drawing failed: {e}"))
}

// ───────────────────────── images ─────────────────────────

#[tauri::command]
pub async fn read_asset(state: State<'_, AppState>, name: String) -> R<Response> {
    storage::read_asset(&state.paths, &name).map(Response::new)
}

#[tauri::command]
pub async fn import_image_bytes(state: State<'_, AppState>, request: Request<'_>) -> R<String> {
    match request.body() {
        InvokeBody::Raw(bytes) => storage::store_asset(&state.paths, bytes),
        _ => Err("expected image bytes".into()),
    }
}

/// Toolbar "Image…" button: pick a file, store it, send it to the overlay
/// on the toolbar's monitor and enter drawing mode so it can be placed.
#[tauri::command]
pub async fn pick_image(app: AppHandle) -> R<Option<String>> {
    let picked = app
        .dialog()
        .file()
        .set_title("Insert an image")
        .add_filter("Images", &["png", "jpg", "jpeg", "gif", "webp", "bmp"])
        .blocking_pick_file();
    let Some(fp) = picked else { return Ok(None) };
    let path = fp.into_path().map_err(|e| e.to_string())?;
    let st = app.state::<AppState>();
    let name = storage::import_asset_file(&st.paths, &path)?;
    send_overlay_command(&app, json!({ "type": "insertImage", "asset": name }));
    let _ = modes::request(&app, ModeEvent::EnterAnnotation, "insert-image");
    Ok(Some(name))
}

/// Send a command to the overlay of the monitor the toolbar is on.
pub fn send_overlay_command(app: &AppHandle, command: Value) {
    let st = app.state::<AppState>();
    let anchor = lock(&st.toolbar).anchor;
    let monitors = lock(&st.monitors).clone();
    let key = explainer_core::layout::monitor_for_point(&monitors, anchor.0, anchor.1).map(|m| m.key.clone());
    let _ = app.emit("overlay://command", json!({ "target": key, "command": command }));
}

#[tauri::command]
pub async fn overlay_command(app: AppHandle, command: Value) -> R<()> {
    send_overlay_command(&app, command);
    Ok(())
}

// ───────────────────────── workspaces ─────────────────────────

fn save_ws(app: &AppHandle, idx: WorkspaceIndex) -> R<WorkspaceIndex> {
    let st = app.state::<AppState>();
    storage::save_workspaces(&st.paths, &idx).map_err(|e| e.to_string())?;
    *lock(&st.workspaces) = idx.clone();
    let _ = app.emit("workspaces://list", &idx);
    Ok(idx)
}

#[tauri::command]
pub async fn create_workspace(app: AppHandle, name: String) -> R<WorkspaceIndex> {
    let mut idx = lock(&app.state::<AppState>().workspaces).clone();
    if idx.list.len() >= 50 {
        return Err("you can keep up to 50 workspaces".into());
    }
    let id = storage::new_workspace_id(&idx);
    idx.list.push(WorkspaceMeta { id, name: storage::clean_name(&name) });
    save_ws(&app, idx)
}

#[tauri::command]
pub async fn rename_workspace(app: AppHandle, id: String, name: String) -> R<WorkspaceIndex> {
    let mut idx = lock(&app.state::<AppState>().workspaces).clone();
    let w = idx.list.iter_mut().find(|w| w.id == id).ok_or("workspace not found")?;
    w.name = storage::clean_name(&name);
    save_ws(&app, idx)
}

#[tauri::command]
pub async fn delete_workspace(app: AppHandle, id: String) -> R<WorkspaceIndex> {
    let st = app.state::<AppState>();
    let mut idx = lock(&st.workspaces).clone();
    if idx.active == id {
        return Err("switch to another workspace before deleting this one".into());
    }
    if idx.list.len() <= 1 {
        return Err("at least one workspace must remain".into());
    }
    // Keep a copy in the backups before removing anything.
    let _ = storage::backup_now(&st.paths, &explainer_core::util::utc_stamp());
    idx.list.retain(|w| w.id != id);
    let dir = st.paths.workspaces().join(explainer_core::store::safe_file_stem(&id));
    if dir.starts_with(st.paths.workspaces()) && dir != st.paths.workspaces() {
        let _ = std::fs::remove_dir_all(dir);
    }
    save_ws(&app, idx)
}

#[tauri::command]
pub async fn switch_workspace(app: AppHandle, id: String) -> R<WorkspaceIndex> {
    let st = app.state::<AppState>();
    let mut idx = lock(&st.workspaces).clone();
    if !idx.list.iter().any(|w| w.id == id) {
        return Err("workspace not found".into());
    }
    if idx.active == id {
        return Ok(idx);
    }
    flush_overlays(&app, Duration::from_millis(1500));
    idx.active = id;
    let idx = save_ws(&app, idx)?;
    lock(&st.history).clear();
    let _ = app.emit("workspace://switched", &idx);
    emit_history(&app);
    Ok(idx)
}

// ───────────────────────── backups / folders / diagnostics ─────────────────────────

#[tauri::command]
pub async fn backup_now(app: AppHandle) -> R<String> {
    flush_overlays(&app, Duration::from_millis(1500));
    let st = app.state::<AppState>();
    write_settings_now(&st);
    storage::backup_now(&st.paths, &explainer_core::util::utc_stamp())
}

#[tauri::command]
pub async fn list_backups(state: State<'_, AppState>) -> R<Vec<String>> {
    Ok(storage::list_backups(&state.paths))
}

#[tauri::command]
pub async fn restore_backup(app: AppHandle, name: String) -> R<()> {
    let st = app.state::<AppState>();
    flush_overlays(&app, Duration::from_millis(1500));
    write_settings_now(&st);
    // Safety copy of the current state first.
    storage::backup_now(&st.paths, &format!("{}-0", explainer_core::util::utc_stamp()))?;
    storage::restore_backup(&st.paths, &name)?;
    *lock(&st.settings) = storage::load_settings(&st.paths);
    *lock(&st.workspaces) = storage::load_workspaces(&st.paths);
    lock(&st.history).clear();
    let snap = settings_snapshot(&st);
    let idx = lock(&st.workspaces).clone();
    let _ = app.emit("settings://changed", json!({ "revision": snap.revision, "doc": snap.doc }));
    let _ = app.emit("workspace://switched", &idx);
    crate::shortcuts::register_all(&app);
    log::info!("restored backup {name}");
    Ok(())
}

#[tauri::command]
pub async fn open_folder(state: State<'_, AppState>, kind: String) -> R<()> {
    let p = match kind.as_str() {
        "logs" => state.paths.logs.clone(),
        "data" => state.paths.root.clone(),
        "backups" => state.paths.backups(),
        _ => return Err("unknown folder".into()),
    };
    let _ = std::fs::create_dir_all(&p);
    #[cfg(windows)]
    {
        std::process::Command::new("explorer.exe").arg(&p).spawn().map_err(|e| e.to_string())?;
    }
    #[cfg(not(windows))]
    {
        log::info!("open folder {}", p.display());
    }
    Ok(())
}

#[tauri::command]
pub async fn diagnostics(app: AppHandle) -> R<String> {
    let st = app.state::<AppState>();
    let mut out = String::new();
    use std::fmt::Write;
    let _ = writeln!(out, "Explainer Toolbar {} on {}", env!("CARGO_PKG_VERSION"), crate::native::os_version());
    let _ = writeln!(out, "Mode: {:?}", lock(&st.mode).mode());
    for m in lock(&st.monitors).iter() {
        let _ = writeln!(out, "Monitor {}: {}x{} at {},{} scale {} {}", m.key, m.width, m.height, m.x, m.y, m.scale, if m.primary { "(primary)" } else { "" });
    }
    for (k, o) in lock(&st.overlays).iter() {
        let style = crate::native::ex_style(o.hwnd);
        let _ = writeln!(out, "Overlay {k}: ready={} content={} exstyle=0x{style:08x}", o.ready, o.has_content);
    }
    for s in lock(&st.shortcuts).iter() {
        let _ = writeln!(out, "Shortcut {} = {} {}", s.action, s.accelerator, if s.ok { "ok".to_string() } else { format!("FAILED: {}", s.error.clone().unwrap_or_default()) });
    }
    let _ = writeln!(out, "Data folder: {}", st.paths.root.display());
    let _ = writeln!(out, "Log folder: {}", st.paths.logs.display());
    // Last lines of the newest log file (never screen contents).
    if let Ok(rd) = std::fs::read_dir(&st.paths.logs) {
        let mut files: Vec<_> = rd.flatten().filter(|e| e.path().extension().map(|x| x == "log").unwrap_or(false)).collect();
        files.sort_by_key(|e| e.metadata().and_then(|m| m.modified()).ok());
        if let Some(f) = files.last() {
            if let Ok(text) = std::fs::read_to_string(f.path()) {
                let lines: Vec<&str> = text.lines().collect();
                let _ = writeln!(out, "--- last log lines ---");
                for l in lines.iter().skip(lines.len().saturating_sub(60)) {
                    let _ = writeln!(out, "{l}");
                }
            }
        }
    }
    Ok(out)
}

#[tauri::command]
pub async fn open_settings(app: AppHandle) -> R<()> {
    let app2 = app.clone();
    app.run_on_main_thread(move || windows::open_settings(&app2)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_toolbar_visible(app: AppHandle, visible: bool) -> R<()> {
    let app2 = app.clone();
    app.run_on_main_thread(move || windows::show_toolbar(&app2, visible)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn reset_toolbar_position(app: AppHandle) -> R<()> {
    let app2 = app.clone();
    app.run_on_main_thread(move || windows::reset_toolbar_position(&app2)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn quit_app(app: AppHandle) -> R<()> {
    graceful_quit(app);
    Ok(())
}

/// Release input, save everything, unregister hotkeys, exit.
pub fn graceful_quit(app: AppHandle) {
    std::thread::spawn(move || {
        let st = app.state::<AppState>();
        if lock(&st.mode).mode() == Mode::ShuttingDown {
            return;
        }
        log::info!("quitting");
        let _ = modes::request(&app, ModeEvent::Quit, "quit");
        flush_overlays(&app, Duration::from_millis(1500));
        write_settings_now(&st);
        let app3 = app.clone();
        let _ = app.run_on_main_thread(move || {
            crate::shortcuts::unregister_everything(&app3);
            app3.exit(0);
        });
    });
}
