//! Notification-area icon: always-available control, even if the toolbar
//! is hidden, off-screen or its page stopped responding.

use crate::state::AppState;
use explainer_core::mode::ModeEvent;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};

pub fn create(app: &AppHandle) -> tauri::Result<()> {
    let draw = MenuItem::with_id(app, "draw", "Start / stop drawing", true, None::<&str>)?;
    let ink = MenuItem::with_id(app, "ink", "Show / hide drawings", true, None::<&str>)?;
    let toolbar = MenuItem::with_id(app, "toolbar", "Show toolbar", true, None::<&str>)?;
    let reset = MenuItem::with_id(app, "reset", "Reset toolbar position", true, None::<&str>)?;
    let clear = MenuItem::with_id(app, "clear", "Clear all drawings (can be undone)", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings…", true, None::<&str>)?;
    let logs = MenuItem::with_id(app, "logs", "Open log folder", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Explainer Toolbar", true, None::<&str>)?;
    let sep = || PredefinedMenuItem::separator(app);
    let menu = Menu::with_items(app, &[&draw, &ink, &sep()?, &toolbar, &reset, &clear, &sep()?, &settings, &logs, &sep()?, &quit])?;
    let mut b = TrayIconBuilder::with_id("main")
        .tooltip("Explainer Toolbar")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, e| match e.id.as_ref() {
            "draw" => {
                let _ = crate::modes::request(app, ModeEvent::ToggleAnnotation, "tray");
            }
            "ink" => {
                let _ = crate::modes::request(app, ModeEvent::ToggleInk, "tray");
            }
            "toolbar" => crate::windows::show_toolbar(app, true),
            "reset" => crate::windows::reset_toolbar_position(app),
            "clear" => crate::commands::clear_all_ink(app),
            "settings" => crate::windows::open_settings(app),
            "logs" => {
                let p = app.state::<AppState>().paths.logs.clone();
                #[cfg(windows)]
                {
                    let _ = std::process::Command::new("explorer.exe").arg(p).spawn();
                }
                #[cfg(not(windows))]
                {
                    log::info!("logs at {}", p.display());
                }
            }
            "quit" => crate::commands::graceful_quit(app.clone()),
            _ => {}
        })
        .on_tray_icon_event(|tray, e| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = e {
                crate::windows::show_toolbar(tray.app_handle(), true);
            }
        });
    if let Some(icon) = app.default_window_icon() {
        b = b.icon(icon.clone());
    }
    b.build(app)?;
    Ok(())
}
