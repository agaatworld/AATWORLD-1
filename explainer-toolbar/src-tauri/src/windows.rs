//! Window creation, monitor reconciliation and toolbar placement.

use crate::native;
use crate::state::{lock, AppState, OverlayState};
use explainer_core::layout;
use explainer_core::monitor::{assign_keys, reconcile, MonitorInfo};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

pub const TOOLBAR: &str = "toolbar";
pub const SETTINGS: &str = "settings";

pub fn hwnd_of(w: &WebviewWindow) -> isize {
    #[cfg(windows)]
    {
        w.hwnd().map(|h| h.0 as isize).unwrap_or(0)
    }
    #[cfg(not(windows))]
    {
        let _ = w;
        0
    }
}

/// Read the current monitors (physical px).
pub fn query_monitors(app: &AppHandle) -> Vec<MonitorInfo> {
    let list = match app.available_monitors() {
        Ok(l) => l,
        Err(e) => {
            log::error!("cannot list monitors: {e}");
            return Vec::new();
        }
    };
    let primary = app.primary_monitor().ok().flatten();
    let names: Vec<String> = list.iter().map(|m| m.name().cloned().unwrap_or_default()).collect();
    let keys = assign_keys(&names);
    list.iter()
        .zip(keys)
        .map(|(m, key)| {
            let wa = m.work_area();
            let is_primary = primary.as_ref().map(|p| p.position() == m.position() && p.size() == m.size()).unwrap_or(false);
            MonitorInfo {
                key,
                name: m.name().cloned().unwrap_or_default(),
                x: m.position().x,
                y: m.position().y,
                width: m.size().width,
                height: m.size().height,
                scale: m.scale_factor(),
                work_x: wa.position.x,
                work_y: wa.position.y,
                work_width: wa.size.width,
                work_height: wa.size.height,
                primary: is_primary,
            }
        })
        .collect()
}

pub fn create_toolbar(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    let w = WebviewWindowBuilder::new(app, TOOLBAR, WebviewUrl::App("index.html?view=toolbar".into()))
        .title("Explainer Toolbar")
        .decorations(false)
        .transparent(true)
        .shadow(false)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .focused(false)
        .inner_size(64.0, 420.0)
        .disable_drag_drop_handler()
        .build()?;
    let hwnd = hwnd_of(&w);
    native::set_toolbar(hwnd);
    native::install_system_watch(hwnd, crate::on_system_event);
    lock(&app.state::<AppState>().toolbar).hwnd = hwnd;
    Ok(w)
}

fn overlay_label(m: &MonitorInfo, generation: u32) -> String {
    if generation == 0 {
        format!("overlay-{}", m.key)
    } else {
        format!("overlay-{}-g{generation}", m.key)
    }
}

/// Overlays are one physical pixel shorter than the monitor so Windows does
/// not classify them as a full-screen application (which would drop the
/// taskbar's always-on-top state and silence notifications). The free row
/// at the bottom also lets an auto-hidden taskbar appear.
pub fn overlay_height(m: &MonitorInfo) -> u32 {
    m.height.saturating_sub(1).max(1)
}

pub fn create_overlay(app: &AppHandle, m: &MonitorInfo, generation: u32) -> tauri::Result<WebviewWindow> {
    let label = overlay_label(m, generation);
    let st = app.state::<AppState>();
    // Register BEFORE the page exists: a fast page must always be able to
    // find its monitor (otherwise it could not load or save its drawings).
    lock(&st.overlays).insert(
        m.key.clone(),
        OverlayState { label: label.clone(), ready: false, has_content: false, last_heartbeat_ms: explainer_core::util::unix_ms(), hwnd: 0, generation },
    );
    let url = format!("index.html?view=overlay&monitor={}", m.key);
    let built = WebviewWindowBuilder::new(app, &label, WebviewUrl::App(url.into()))
        .title("Explainer Overlay")
        .decorations(false)
        .transparent(true)
        .shadow(false)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focusable(false)
        .focused(false)
        .visible(false)
        .disable_drag_drop_handler()
        .build();
    let w = match built {
        Ok(w) => w,
        Err(e) => {
            lock(&st.overlays).remove(&m.key);
            return Err(e);
        }
    };
    // Click-through from the very first moment, before the page loads.
    w.set_ignore_cursor_events(true)?;
    let hwnd = hwnd_of(&w);
    native::install_overlay_guard(hwnd);
    place_physical(&w, m.x, m.y, m.width, overlay_height(m));
    if let Some(o) = lock(&st.overlays).get_mut(&m.key) {
        o.hwnd = hwnd;
    }
    Ok(w)
}

/// Place a window at an exact physical rectangle. Moving across monitors
/// with different DPI makes Windows resize the window (WM_DPICHANGED), so
/// the size is applied after the move and verified.
pub fn place_physical(w: &WebviewWindow, x: i32, y: i32, width: u32, height: u32) {
    for attempt in 0..3 {
        let _ = w.set_position(PhysicalPosition::new(x, y));
        let _ = w.set_size(PhysicalSize::new(width, height));
        let ok = matches!((w.outer_position(), w.outer_size()), (Ok(p), Ok(s)) if p.x == x && p.y == y && s.width == width && s.height == height);
        if ok {
            return;
        }
        if attempt == 2 {
            log::warn!("window {} did not reach {x},{y} {width}x{height}", w.label());
        }
    }
}

pub fn overlay_window(app: &AppHandle, key: &str) -> Option<WebviewWindow> {
    let label = lock(&app.state::<AppState>().overlays).get(key).map(|o| o.label.clone())?;
    app.get_webview_window(&label)
}

/// Bring the windows in line with the current monitors.
pub fn reconcile_monitors(app: &AppHandle) {
    let current = query_monitors(app);
    if current.is_empty() {
        return;
    }
    let st = app.state::<AppState>();
    let previous = lock(&st.monitors).clone();
    let plan = reconcile(&previous, &current);
    *lock(&st.monitors) = current.clone();
    if plan.is_empty() {
        return;
    }
    log::info!("monitors changed: +{} -{} ~{}", plan.create.len(), plan.remove.len(), plan.reposition.len());
    for key in &plan.remove {
        let label = lock(&st.overlays).remove(key).map(|o| o.label);
        lock(&st.history).forget(key);
        if let Some(w) = label.and_then(|l| app.get_webview_window(&l)) {
            let _ = w.destroy();
        }
    }
    for m in &plan.reposition {
        if let Some(w) = overlay_window(app, &m.key) {
            place_physical(&w, m.x, m.y, m.width, overlay_height(m));
        }
    }
    for m in &plan.create {
        if let Err(e) = create_overlay(app, m, 0) {
            log::error!("cannot create overlay for {}: {e}", m.key);
        }
    }
    let _ = app.emit("monitors://changed", &current);
    // Keep the toolbar reachable (e.g. its monitor was unplugged).
    let _ = app.emit("toolbar://relayout", ());
    crate::modes::reapply(app);
}

#[derive(Debug, Clone, Copy, Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LayoutRequest {
    /// Window size and pill offset/size in LOGICAL px.
    pub width: f64,
    pub height: f64,
    pub dx: f64,
    pub dy: f64,
    pub pill_width: f64,
    pub pill_height: f64,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LayoutReply {
    /// Actual pill offset inside the window (logical px).
    pub dx: f64,
    pub dy: f64,
    /// Free space around the pill on its monitor (logical px).
    pub space_left: f64,
    pub space_right: f64,
    pub space_top: f64,
    pub space_bottom: f64,
    /// Work area of the toolbar's monitor (logical px).
    pub work_width: f64,
    pub work_height: f64,
    pub scale: f64,
}

/// Size/position the toolbar window around its pill (see core::layout).
pub fn layout_toolbar(app: &AppHandle, req: LayoutRequest) -> Result<LayoutReply, String> {
    let st = app.state::<AppState>();
    let monitors = lock(&st.monitors).clone();
    let saved = lock(&st.settings).toolbar_anchor();
    let (anchor, first) = {
        let tb = lock(&st.toolbar);
        if tb.ready {
            (tb.anchor, false)
        } else {
            (saved.map(|a| (a.x, a.y)).unwrap_or_else(|| layout::default_anchor(&monitors)), true)
        }
    };
    let m = layout::monitor_for_point(&monitors, anchor.0, anchor.1).cloned().ok_or("no monitor")?;
    let s = m.scale;
    let area = layout::work_area(&m);
    let p = layout::place(
        anchor,
        (req.pill_width * s, req.pill_height * s),
        (req.width * s, req.height * s),
        (req.dx * s, req.dy * s),
        area,
    );
    {
        let mut tb = lock(&st.toolbar);
        tb.anchor = (p.anchor_x, p.anchor_y);
        tb.pill = (req.pill_width, req.pill_height);
        tb.offset = (p.pill_dx / s, p.pill_dy / s);
        tb.window = (req.width, req.height);
        tb.ready = true;
    }
    if let Some(w) = app.get_webview_window(TOOLBAR) {
        place_physical(&w, p.window.x.round() as i32, p.window.y.round() as i32, p.window.w.round() as u32, p.window.h.round() as u32);
        if first && lock(&st.toolbar).visible {
            let _ = w.show();
        }
        native::raise_topmost(hwnd_of(&w));
    }
    if first || saved.map(|a| (a.x, a.y)) != Some((p.anchor_x, p.anchor_y)) {
        crate::commands::persist_anchor(app, p.anchor_x, p.anchor_y);
    }
    Ok(LayoutReply {
        dx: p.pill_dx / s,
        dy: p.pill_dy / s,
        space_left: (p.anchor_x - area.x) / s,
        space_right: (area.right() - (p.anchor_x + req.pill_width * s)) / s,
        space_top: (p.anchor_y - area.y) / s,
        space_bottom: (area.bottom() - (p.anchor_y + req.pill_height * s)) / s,
        work_width: area.w / s,
        work_height: area.h / s,
        scale: s,
    })
}

/// After the user dragged the toolbar window, derive the new pill anchor.
pub fn on_toolbar_moved(app: &AppHandle, pos: PhysicalPosition<i32>) {
    let st = app.state::<AppState>();
    let monitors = lock(&st.monitors).clone();
    let (dx, dy) = {
        let tb = lock(&st.toolbar);
        if !tb.ready {
            return;
        }
        tb.offset
    };
    let scale = layout::monitor_for_point(&monitors, pos.x as f64, pos.y as f64).map(|m| m.scale).unwrap_or(1.0);
    let anchor = (pos.x as f64 + dx * scale, pos.y as f64 + dy * scale);
    lock(&st.toolbar).anchor = anchor;
    crate::commands::persist_anchor(app, anchor.0, anchor.1);
}

pub fn reset_toolbar_position(app: &AppHandle) {
    let st = app.state::<AppState>();
    let monitors = lock(&st.monitors).clone();
    let a = layout::default_anchor(&monitors);
    lock(&st.toolbar).anchor = a;
    crate::commands::persist_anchor(app, a.0, a.1);
    show_toolbar(app, true);
    let _ = app.emit("toolbar://relayout", ());
}

pub fn show_toolbar(app: &AppHandle, visible: bool) {
    let st = app.state::<AppState>();
    lock(&st.toolbar).visible = visible;
    if let Some(w) = app.get_webview_window(TOOLBAR) {
        if visible {
            let _ = w.show();
            native::raise_topmost(hwnd_of(&w));
        } else {
            let _ = w.hide();
        }
    }
    let _ = app.emit("toolbar://visibility", visible);
}

pub fn open_settings(app: &AppHandle) {
    if let Some(w) = app.get_webview_window(SETTINGS) {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }
    let r = WebviewWindowBuilder::new(app, SETTINGS, WebviewUrl::App("index.html?view=settings".into()))
        .title("Explainer Toolbar — Settings")
        .inner_size(860.0, 640.0)
        .min_inner_size(640.0, 480.0)
        .center()
        .always_on_top(false)
        .visible(true)
        .focused(true)
        .disable_drag_drop_handler()
        .build();
    if let Err(e) = r {
        log::error!("cannot open settings: {e}");
    }
}
