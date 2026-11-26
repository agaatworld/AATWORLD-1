//! Explainer Toolbar — native application layer.
//!
//! Windows: one transparent overlay per monitor (drawing surface), one small
//! floating toolbar, an optional settings window and a tray icon. The input
//! state machine lives in `explainer-core`; `modes.rs` applies it.

mod commands;
mod modes;
mod native;
mod selftest;
mod shortcuts;
mod state;
mod tray;
mod watchdog;
mod windows;

use explainer_core::mode::ModeEvent;
use explainer_core::{storage, util};
use state::{lock, AppState};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::OnceLock;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, RunEvent, WindowEvent};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind};

static APP: OnceLock<AppHandle> = OnceLock::new();
static SYSTEM_EVENT_GEN: AtomicU64 = AtomicU64::new(0);

/// Called from the toolbar window procedure (must not block): debounce,
/// then reconcile monitors / re-register hotkeys on the main thread.
pub(crate) fn on_system_event(ev: native::SystemEvent) {
    let Some(app) = APP.get().cloned() else { return };
    let gen = SYSTEM_EVENT_GEN.fetch_add(1, Ordering::SeqCst) + 1;
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(700));
        if SYSTEM_EVENT_GEN.load(Ordering::SeqCst) != gen {
            return; // a newer event will handle it
        }
        log::info!("system event: {ev:?}");
        let a = app.clone();
        let _ = app.run_on_main_thread(move || {
            windows::reconcile_monitors(&a);
            if ev == native::SystemEvent::Resumed {
                shortcuts::register_all(&a);
            }
            modes::reapply(&a);
        });
    });
}

fn arg_value(args: &[String], name: &str) -> Option<String> {
    args.iter().position(|a| a == name).and_then(|i| args.get(i + 1).cloned())
}

pub fn run() {
    let args: Vec<String> = std::env::args().collect();
    if let Some(pid) = arg_value(&args, "--wait-pid").and_then(|p| p.parse::<u32>().ok()) {
        native::wait_for_process_exit(pid, 8000);
    }
    let self_test = arg_value(&args, "--self-test").map(PathBuf::from);
    native::init_process();

    let mut builder = tauri::Builder::default();
    if self_test.is_none() {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            windows::show_toolbar(app, true);
        }));
    }
    let app = builder
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([Target::new(TargetKind::LogDir { file_name: Some("explainer".into()) }), Target::new(TargetKind::Stdout)])
                .max_file_size(1_000_000)
                .rotation_strategy(RotationStrategy::KeepSome(5))
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| shortcuts::handle(app, shortcut, event.state()))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_bootstrap,
            commands::request_mode,
            commands::overlay_ready,
            commands::heartbeat,
            commands::report_content,
            commands::report_failure,
            commands::toolbar_layout,
            commands::toolbar_start_drag,
            commands::update_settings,
            commands::validate_shortcut,
            commands::shortcut_status,
            commands::record_edit,
            commands::undo,
            commands::redo,
            commands::clear_all,
            commands::escape_reply,
            commands::flush_done,
            commands::load_scene,
            commands::save_scene,
            commands::read_asset,
            commands::import_image_bytes,
            commands::pick_image,
            commands::overlay_command,
            commands::create_workspace,
            commands::rename_workspace,
            commands::delete_workspace,
            commands::switch_workspace,
            commands::backup_now,
            commands::list_backups,
            commands::restore_backup,
            commands::open_folder,
            commands::diagnostics,
            commands::open_settings,
            commands::set_toolbar_visible,
            commands::reset_toolbar_position,
            commands::quit_app,
        ])
        .setup(move |app| {
            modes::mark_main_thread();
            let handle = app.handle().clone();
            let _ = APP.set(handle.clone());
            std::panic::set_hook(Box::new(|info| log::error!("panic: {info}")));

            let root = app.path().app_local_data_dir()?;
            let logs = app.path().app_log_dir().unwrap_or_else(|_| root.join("logs"));
            let paths = storage::Paths { root, logs };
            paths.ensure();
            let stamp = util::utc_stamp();
            if self_test.is_none() && storage::auto_backup_due(&paths, &stamp) {
                match storage::backup_now(&paths, &stamp) {
                    Ok(n) => log::info!("daily backup {n}"),
                    Err(e) => log::warn!("daily backup failed: {e}"),
                }
            }
            let settings = storage::load_settings(&paths);
            let workspaces = storage::load_workspaces(&paths);
            log::info!(
                "Explainer Toolbar {} starting; data in {}{}",
                env!("CARGO_PKG_VERSION"),
                paths.root.display(),
                if args.iter().any(|a| a == "--recovered") { " (restarted after the window thread stopped responding)" } else { "" }
            );
            app.manage(AppState::new(paths, settings, workspaces));

            let monitors = windows::query_monitors(&handle);
            log::info!("{} monitor(s): {:?}", monitors.len(), monitors.iter().map(|m| (&m.key, m.width, m.height, m.scale)).collect::<Vec<_>>());
            *lock(&app.state::<AppState>().monitors) = monitors.clone();

            windows::create_toolbar(&handle)?;
            for m in &monitors {
                if let Err(e) = windows::create_overlay(&handle, m, 0) {
                    log::error!("cannot create overlay for {}: {e}", m.key);
                }
            }
            shortcuts::register_all(&handle);
            if let Err(e) = tray::create(&handle) {
                log::error!("tray icon failed: {e}");
            }
            commands::spawn_settings_writer(handle.clone());
            watchdog::spawn(handle.clone());
            let _ = modes::request(&handle, ModeEvent::Ready, "startup");
            if let Some(report) = self_test.clone() {
                selftest::spawn(handle.clone(), report);
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            let app = window.app_handle();
            let label = window.label().to_string();
            match event {
                WindowEvent::CloseRequested { api, .. } => {
                    if label == windows::TOOLBAR {
                        api.prevent_close();
                        commands::graceful_quit(app.clone());
                    } else if label.starts_with("overlay-") {
                        // Alt+F4 on an overlay: just leave drawing mode.
                        api.prevent_close();
                        let _ = modes::request(app, ModeEvent::ExitAnnotation, "alt-f4");
                    }
                }
                WindowEvent::Moved(pos) if label == windows::TOOLBAR => windows::on_toolbar_moved(app, *pos),
                WindowEvent::ScaleFactorChanged { .. } if label == windows::TOOLBAR => {
                    let _ = app.emit_to(windows::TOOLBAR, "toolbar://relayout", ());
                }
                WindowEvent::Focused(true) if label.starts_with("overlay-") => {
                    let mode = lock(&app.state::<AppState>().mode).mode();
                    if mode != explainer_core::mode::Mode::Annotating {
                        log::warn!("{label} received focus outside drawing mode");
                    }
                }
                _ => {}
            }
        })
        .build(tauri::generate_context!());

    let app = match app {
        Ok(a) => a,
        Err(e) => {
            eprintln!("Explainer Toolbar could not start: {e}");
            std::process::exit(1);
        }
    };
    app.run(|_app, event| {
        if let RunEvent::ExitRequested { api, code, .. } = event {
            // Only an explicit quit (code set) may end the app; closing or
            // rebuilding windows must never exit it by accident.
            if code.is_none() {
                api.prevent_exit();
            }
        }
    });
}
