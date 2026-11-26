//! Safety watchdogs. Both threads sleep on a condition variable while the
//! app is not in drawing mode, so they cost nothing when idle.
//!
//! 1. Heartbeat watchdog: in drawing mode each overlay page sends a
//!    heartbeat every second. If one stops for 3.5 s (page frozen or crashed)
//!    the app switches to `Recovering`: every overlay becomes click-through
//!    at once and the frozen one is rebuilt.
//! 2. Main-thread guard: if the native window thread itself stops answering
//!    for 6 s while the overlays capture input, nothing inside the process
//!    can release the desktop, so the process restarts itself (the new
//!    instance waits for the old one to exit, then restores the drawings).

use crate::state::{lock, AppState};
use explainer_core::mode::{Mode, ModeEvent};
use std::sync::atomic::Ordering;
use std::time::Duration;
use tauri::{AppHandle, Manager};

fn wait_armed(st: &AppState) {
    let (m, cv) = &st.watchdog;
    let mut armed = lock(m);
    while !*armed {
        armed = cv.wait(armed).unwrap_or_else(|p| p.into_inner());
    }
}

pub fn spawn(app: AppHandle) {
    let a = app.clone();
    std::thread::Builder::new()
        .name("heartbeat-watchdog".into())
        .spawn(move || loop {
            let st = a.state::<AppState>();
            wait_armed(&st);
            std::thread::sleep(Duration::from_millis(500));
            if lock(&st.mode).mode() != Mode::Annotating || st.pause_heartbeat_check.load(Ordering::Relaxed) {
                continue;
            }
            let now = explainer_core::util::unix_ms();
            let stale: Vec<String> = lock(&st.overlays)
                .values()
                .filter(|o| o.ready && now.saturating_sub(o.last_heartbeat_ms) > 3500)
                .map(|o| o.label.clone())
                .collect();
            if !stale.is_empty() {
                log::error!("no heartbeat from {stale:?}; releasing the desktop and rebuilding");
                let _ = crate::modes::request(&a, ModeEvent::FrontendLost, "watchdog");
            }
        })
        .ok();

    std::thread::Builder::new()
        .name("main-thread-guard".into())
        .spawn(move || {
            let st = app.state::<AppState>();
            loop {
                wait_armed(&st);
                st.main_alive_ms.store(explainer_core::util::unix_ms(), Ordering::Relaxed);
                let mut since_armed = 0u64;
                loop {
                    std::thread::sleep(Duration::from_millis(1000));
                    since_armed += 1000;
                    if lock(&st.mode).mode() != Mode::Annotating {
                        break;
                    }
                    let a2 = app.clone();
                    let _ = app.run_on_main_thread(move || {
                        a2.state::<AppState>().main_alive_ms.store(explainer_core::util::unix_ms(), Ordering::Relaxed);
                    });
                    let silent = explainer_core::util::unix_ms().saturating_sub(st.main_alive_ms.load(Ordering::Relaxed));
                    if since_armed > 2000 && silent > 6000 {
                        emergency_restart();
                    }
                }
            }
        })
        .ok();
}

fn emergency_restart() -> ! {
    log::error!("the window thread stopped responding while drawing; restarting to release the desktop");
    if let Ok(exe) = std::env::current_exe() {
        let _ = std::process::Command::new(exe).args(["--recovered", "--wait-pid", &std::process::id().to_string()]).spawn();
    }
    std::process::exit(3);
}
