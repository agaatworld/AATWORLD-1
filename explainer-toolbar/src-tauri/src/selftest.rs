//! `explainer-toolbar.exe --self-test <report.json>`
//!
//! Runs the real application, drives the mode machine and inspects the REAL
//! Win32 state of the overlay windows: extended styles, which window a click
//! at a point would reach (WindowFromPoint), the foreground window and
//! visibility. Used by Windows CI; writes a JSON report and exits 0/1.

use crate::native;
use crate::state::{lock, AppState};
use crate::windows::{hwnd_of, TOOLBAR};
use explainer_core::mode::{Mode, ModeEvent};
use serde::Serialize;
use serde_json::json;
use std::path::PathBuf;
use std::sync::atomic::Ordering;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Serialize)]
struct Check {
    name: String,
    pass: bool,
    detail: String,
}

/// (monitor key, overlay HWND, monitor rect x, y, width, height)
type OverlayProbe = (String, isize, (i32, i32, u32, u32));

struct T {
    app: AppHandle,
    checks: Vec<Check>,
}

impl T {
    fn check(&mut self, name: &str, pass: bool, detail: impl Into<String>) {
        let detail = detail.into();
        log::info!("self-test {} {name}: {detail}", if pass { "PASS" } else { "FAIL" });
        self.checks.push(Check { name: name.into(), pass, detail });
    }

    fn on_main<R: Send + 'static>(&self, f: impl FnOnce(&AppHandle) -> R + Send + 'static) -> Option<R> {
        self.on_main_within(Duration::from_secs(10), f)
    }

    fn on_main_within<R: Send + 'static>(&self, limit: Duration, f: impl FnOnce(&AppHandle) -> R + Send + 'static) -> Option<R> {
        let (tx, rx) = std::sync::mpsc::channel();
        let a = self.app.clone();
        self.app.run_on_main_thread(move || {
            let _ = tx.send(f(&a));
        })
        .ok()?;
        rx.recv_timeout(limit).ok()
    }

    fn mode(&self, e: ModeEvent) {
        self.on_main(move |a| crate::modes::request(a, e, "self-test"));
    }

    fn current(&self) -> Mode {
        lock(&self.app.state::<AppState>().mode).mode()
    }

    fn wait_for(&self, timeout: Duration, f: impl Fn(&Self) -> bool) -> bool {
        let start = Instant::now();
        while start.elapsed() < timeout {
            if f(self) {
                return true;
            }
            std::thread::sleep(Duration::from_millis(100));
        }
        f(self)
    }

    fn overlays(&self) -> Vec<OverlayProbe> {
        let st = self.app.state::<AppState>();
        let mons = lock(&st.monitors).clone();
        let out = lock(&st.overlays)
            .iter()
            .filter_map(|(k, o)| mons.iter().find(|m| &m.key == k).map(|m| (k.clone(), o.hwnd, (m.x, m.y, m.width, m.height))))
            .collect();
        out
    }

    fn toolbar_center(&self) -> Option<(i32, i32, isize)> {
        let w = self.app.get_webview_window(TOOLBAR)?;
        let p = w.outer_position().ok()?;
        let s = w.outer_size().ok()?;
        Some((p.x + s.width as i32 / 2, p.y + s.height as i32 / 2, hwnd_of(&w)))
    }

    /// Point on the monitor far from the toolbar (right-hand third).
    fn probe_point(r: (i32, i32, u32, u32)) -> (i32, i32) {
        (r.0 + (r.2 as i32 * 3) / 4, r.1 + r.3 as i32 / 2)
    }

    fn expect_clickthrough(&mut self, phase: &str) {
        // Skip windows that are being destroyed/rebuilt at this instant.
        for (key, hwnd, r) in self.overlays().into_iter().filter(|(_, h, _)| native::is_window(*h)) {
            let style = native::ex_style(hwnd);
            let flags = native::WS_EX_TRANSPARENT | native::WS_EX_LAYERED | native::WS_EX_NOACTIVATE;
            self.check(&format!("{phase}: {key} has click-through styles"), style & flags == flags, format!("exstyle=0x{style:08x}"));
            self.check(&format!("{phase}: {key} hidden from Alt+Tab"), style & native::WS_EX_TOOLWINDOW != 0, format!("exstyle=0x{style:08x}"));
            let (x, y) = Self::probe_point(r);
            let at = native::root_window_at(x, y);
            self.check(&format!("{phase}: a click at {x},{y} passes through {key}"), at != hwnd, format!("window at point=0x{at:x}, overlay=0x{hwnd:x}"));
            let fg = native::foreground();
            self.check(&format!("{phase}: {key} did not take focus"), fg != hwnd, format!("foreground=0x{fg:x}"));
        }
    }

    fn expect_capture(&mut self, phase: &str) {
        for (key, hwnd, r) in self.overlays() {
            let style = native::ex_style(hwnd);
            self.check(&format!("{phase}: {key} accepts input"), style & native::WS_EX_TRANSPARENT == 0, format!("exstyle=0x{style:08x}"));
            let (x, y) = Self::probe_point(r);
            let at = native::root_window_at(x, y);
            self.check(&format!("{phase}: a click at {x},{y} reaches {key}"), at == hwnd, format!("window at point=0x{at:x}, overlay=0x{hwnd:x}"));
        }
        if let Some((x, y, tb)) = self.toolbar_center() {
            let at = native::root_window_at(x, y);
            self.check(&format!("{phase}: toolbar stays above the overlay"), at == tb, format!("window at toolbar=0x{at:x}, toolbar=0x{tb:x}"));
        }
    }
}

pub fn spawn(app: AppHandle, report: PathBuf) {
    // Hard limit so CI can never hang on us.
    let r2 = report.clone();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(180));
        let _ = std::fs::write(&r2, json!({"passed": false, "error": "self-test timed out"}).to_string());
        std::process::exit(2);
    });
    std::thread::spawn(move || {
        let st = app.state::<AppState>();
        st.self_test.store(true, Ordering::Relaxed);
        let mut t = T { app: app.clone(), checks: Vec::new() };
        let windows = cfg!(windows);

        let ready = t.wait_for(Duration::from_secs(40), |t| {
            let st = t.app.state::<AppState>();
            let ov = lock(&st.overlays);
            !ov.is_empty() && ov.values().all(|o| o.ready) && lock(&st.toolbar).ready
        });
        t.check("toolbar and every overlay page loaded", ready, format!("{} overlay(s)", t.overlays().len()));
        t.check("starts in desktop mode", t.current() == Mode::Desktop, format!("{:?}", t.current()));

        // Desktop mode with the overlays forced visible: the worst case.
        st.force_overlays_visible.store(true, Ordering::Relaxed);
        t.on_main(crate::modes::reapply);
        std::thread::sleep(Duration::from_millis(900));
        if windows {
            for (key, hwnd, _) in t.overlays() {
                t.check(&format!("desktop: {key} is visible for the test"), native::is_visible(hwnd), "");
            }
            t.expect_clickthrough("desktop");
        }

        t.mode(ModeEvent::EnterAnnotation);
        std::thread::sleep(Duration::from_millis(900));
        t.check("drawing mode entered", t.current() == Mode::Annotating, format!("{:?}", t.current()));
        t.check("Escape safety key registered while drawing", crate::shortcuts::escape_active(), "");
        if windows {
            t.expect_capture("drawing");
        }

        t.mode(ModeEvent::ExitAnnotation);
        std::thread::sleep(Duration::from_millis(700));
        t.check("Escape safety key released after drawing", !crate::shortcuts::escape_active(), "");
        if windows {
            t.expect_clickthrough("after exit");
            let fg = native::foreground();
            let tb = t.toolbar_center().map(|c| c.2).unwrap_or(0);
            t.check("after exit: keyboard focus is not left on the toolbar", fg != tb || tb == 0, format!("foreground=0x{fg:x}"));
        }

        // Toggle storm from several threads: must end consistent.
        let handles: Vec<_> = (0..4)
            .map(|_| {
                let a = app.clone();
                std::thread::spawn(move || {
                    for _ in 0..50 {
                        let a2 = a.clone();
                        let _ = a.run_on_main_thread(move || {
                            let _ = crate::modes::request(&a2, ModeEvent::ToggleAnnotation, "self-test-storm");
                        });
                    }
                })
            })
            .collect();
        for h in handles {
            let _ = h.join();
        }
        // Main-thread tasks run in order: once this marker has run, all 200
        // toggles have been applied.
        let start = std::time::Instant::now();
        let drained = t.on_main_within(Duration::from_secs(60), |_| ()).is_some();
        let took = start.elapsed().as_millis();
        std::thread::sleep(Duration::from_millis(500));
        t.check("200 rapid toggles end in desktop mode", drained && t.current() == Mode::Desktop, format!("{:?}, applied in {took} ms", t.current()));
        if windows {
            t.expect_clickthrough("after toggle storm");
        }

        // Escape safety key: the pages answer "not consumed" → exit.
        t.mode(ModeEvent::EnterAnnotation);
        std::thread::sleep(Duration::from_millis(600));
        t.on_main(crate::modes::on_escape);
        let ok = t.wait_for(Duration::from_secs(2), |t| t.current() == Mode::Desktop);
        t.check("Escape leaves drawing mode", ok, format!("{:?}", t.current()));

        // A frozen overlay page: heartbeats stop → recovery → desktop.
        t.mode(ModeEvent::EnterAnnotation);
        std::thread::sleep(Duration::from_millis(600));
        let labels_before: Vec<String> = lock(&st.overlays).values().map(|o| o.label.clone()).collect();
        let _ = app.emit("selftest://freeze", ());
        let left = t.wait_for(Duration::from_secs(8), |t| t.current() != Mode::Annotating);
        t.check("a frozen page is detected and input is released", left, format!("{:?}", t.current()));
        if windows && t.current() == Mode::Recovering {
            t.expect_clickthrough("recovering");
        }
        let back = t.wait_for(Duration::from_secs(25), |t| {
            let st = t.app.state::<AppState>();
            t.current() == Mode::Desktop && lock(&st.overlays).values().all(|o| o.ready)
        });
        t.check("the frozen overlay was rebuilt and desktop mode restored", back, format!("{:?}", t.current()));
        let labels_after: Vec<String> = lock(&st.overlays).values().map(|o| o.label.clone()).collect();
        t.check(
            "the frozen overlay is a NEW window after recovery",
            !labels_after.is_empty() && labels_after.iter().all(|l| !labels_before.contains(l)),
            format!("before {labels_before:?}, after {labels_after:?}"),
        );
        std::thread::sleep(Duration::from_millis(700));
        if windows {
            t.expect_clickthrough("after recovery");
        }

        // Hide / show ink.
        st.force_overlays_visible.store(false, Ordering::Relaxed);
        t.mode(ModeEvent::HideInk);
        std::thread::sleep(Duration::from_millis(500));
        if windows {
            let all_hidden = t.overlays().iter().all(|(_, h, _)| !native::is_visible(*h));
            t.check("hide drawings hides every overlay", all_hidden, "");
        }
        // A page failure while drawings are hidden must keep them hidden.
        let lbl: Vec<String> = lock(&st.overlays).values().map(|o| o.label.clone()).collect();
        crate::modes::report_lost(&app, lbl, "self-test");
        let hidden_again = t.wait_for(Duration::from_secs(25), |t| {
            let st = t.app.state::<AppState>();
            t.current() == Mode::Hidden && lock(&st.overlays).values().all(|o| o.ready)
        });
        t.check("a failure while drawings are hidden keeps them hidden", hidden_again, format!("{:?}", t.current()));
        if windows {
            std::thread::sleep(Duration::from_millis(400));
            let all_hidden = t.overlays().iter().all(|(_, h, _)| !native::is_visible(*h));
            t.check("no overlay became visible after that recovery", all_hidden, "");
        }
        t.mode(ModeEvent::ShowInk);
        std::thread::sleep(Duration::from_millis(300));
        t.check("show drawings returns to desktop mode", t.current() == Mode::Desktop, format!("{:?}", t.current()));

        // Shortcuts registered?
        let sc = lock(&st.shortcuts).clone();
        let failed: Vec<String> = sc.iter().filter(|s| !s.ok).map(|s| format!("{}: {:?}", s.accelerator, s.error)).collect();
        t.check("global shortcuts registered", failed.is_empty(), if failed.is_empty() { format!("{} ok", sc.len()) } else { failed.join("; ") });

        let passed = t.checks.iter().all(|c| c.pass);
        let mons = lock(&st.monitors).clone();
        let out = json!({
            "passed": passed,
            "version": env!("CARGO_PKG_VERSION"),
            "platform": native::os_version(),
            "windowsChecks": windows,
            "monitors": mons,
            "checks": t.checks,
        });
        let _ = std::fs::write(&report, serde_json::to_string_pretty(&out).unwrap_or_default());
        log::info!("self-test finished: {}", if passed { "PASSED" } else { "FAILED" });
        // Leave cleanly (exercises the real quit path), then exit with status.
        t.mode(ModeEvent::Quit);
        crate::commands::flush_overlays(&app, Duration::from_millis(1500));
        t.on_main(crate::shortcuts::unregister_everything);
        std::process::exit(if passed { 0 } else { 1 });
    });
}
