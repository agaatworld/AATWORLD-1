//! Shared application state.
//!
//! LOCKING RULE: never hold one of these mutexes while calling a Tauri
//! window/webview API. Those calls may wait for the main thread, and the main
//! thread may be waiting for the same lock → deadlock. Copy what you need,
//! drop the guard, then talk to windows.

use explainer_core::storage::{Paths, WorkspaceIndex};
use explainer_core::history::HistoryRouter;
use explainer_core::mode::ModeMachine;
use explainer_core::monitor::MonitorInfo;
use explainer_core::settings::SettingsDoc;
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicBool, AtomicU64};
use std::sync::{Condvar, Mutex, MutexGuard};

#[derive(Debug, Clone, Default)]
pub struct OverlayState {
    pub label: String,
    pub ready: bool,
    pub has_content: bool,
    pub last_heartbeat_ms: u64,
    pub hwnd: isize,
    pub generation: u32,
}

#[derive(Debug, Clone, Copy, Default)]
pub struct ToolbarState {
    pub ready: bool,
    pub visible: bool,
    /// Pill top-left in physical virtual-screen px.
    pub anchor: (f64, f64),
    /// Pill size and offset inside the window, LOGICAL px (from the frontend).
    pub pill: (f64, f64),
    pub offset: (f64, f64),
    pub window: (f64, f64),
    pub hwnd: isize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutStatus {
    pub action: String,
    pub accelerator: String,
    pub ok: bool,
    pub error: Option<String>,
}

#[derive(Debug, Default)]
pub struct EscapeRequest {
    pub id: u64,
    pub pending: Vec<String>,
    pub consumed: bool,
}

pub struct AppState {
    pub paths: Paths,
    pub mode: Mutex<ModeMachine>,
    pub settings: Mutex<SettingsDoc>,
    pub history: Mutex<HistoryRouter>,
    /// (group id, time) of the last recorded edit, to merge "clear all" acks.
    pub last_group: Mutex<Option<(String, u64)>>,
    pub monitors: Mutex<Vec<MonitorInfo>>,
    pub overlays: Mutex<HashMap<String, OverlayState>>,
    pub toolbar: Mutex<ToolbarState>,
    pub workspaces: Mutex<WorkspaceIndex>,
    pub shortcuts: Mutex<Vec<ShortcutStatus>>,
    pub escape: Mutex<EscapeRequest>,
    pub flush: Mutex<(u64, Vec<String>)>,
    pub settings_dirty: (Mutex<bool>, Condvar),
    pub watchdog: (Mutex<bool>, Condvar),
    pub counter: AtomicU64,
    pub self_test: AtomicBool,
    pub force_overlays_visible: AtomicBool,
    pub pause_heartbeat_check: AtomicBool,
    pub last_toggle_ms: AtomicU64,
    pub loaded_once: Mutex<HashSet<String>>,
    /// Overlays currently capturing input (drawing mode applied).
    pub capturing: AtomicBool,
    /// Overlay labels reported as failed, rebuilt by the next recovery.
    pub pending_rebuild: Mutex<Vec<String>>,
    /// Bumped on workspace switch / restore; saves from an older generation
    /// are refused so a late save can never land in the wrong workspace.
    pub scene_generation: AtomicU64,
    /// Main-thread guard: last ping sent / answered.
    pub ping_sent: AtomicU64,
    pub ping_acked: AtomicU64,
}

impl AppState {
    pub fn new(paths: Paths, settings: SettingsDoc, workspaces: WorkspaceIndex) -> Self {
        Self {
            paths,
            mode: Mutex::new(ModeMachine::default()),
            settings: Mutex::new(settings),
            history: Mutex::new(HistoryRouter::default()),
            last_group: Mutex::new(None),
            monitors: Mutex::new(Vec::new()),
            overlays: Mutex::new(HashMap::new()),
            toolbar: Mutex::new(ToolbarState { visible: true, ..Default::default() }),
            workspaces: Mutex::new(workspaces),
            shortcuts: Mutex::new(Vec::new()),
            escape: Mutex::new(EscapeRequest::default()),
            flush: Mutex::new((0, Vec::new())),
            settings_dirty: (Mutex::new(false), Condvar::new()),
            watchdog: (Mutex::new(false), Condvar::new()),
            counter: AtomicU64::new(1),
            self_test: AtomicBool::new(false),
            force_overlays_visible: AtomicBool::new(false),
            pause_heartbeat_check: AtomicBool::new(false),
            last_toggle_ms: AtomicU64::new(0),
            loaded_once: Mutex::new(HashSet::new()),
            capturing: AtomicBool::new(false),
            pending_rebuild: Mutex::new(Vec::new()),
            scene_generation: AtomicU64::new(1),
            ping_sent: AtomicU64::new(0),
            ping_acked: AtomicU64::new(0),
        }
    }

    pub fn next_id(&self) -> u64 {
        self.counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    }
}

/// Lock that survives a poisoned mutex (a panic elsewhere must not take the
/// whole app down with it; the data inside is still consistent because every
/// critical section here is a simple field update).
pub fn lock<T>(m: &Mutex<T>) -> MutexGuard<'_, T> {
    m.lock().unwrap_or_else(|p| p.into_inner())
}
