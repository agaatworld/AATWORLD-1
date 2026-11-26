//! Windows implementation (see mod.rs for the rationale).
//!
//! `unsafe` is limited to Win32 calls on window handles owned by this
//! process; every pointer dereference is of a message parameter that Windows
//! documents for that message.

use super::SystemEvent;
use std::collections::HashMap;
use std::ffi::c_void;
use std::sync::atomic::{AtomicIsize, Ordering};
use std::sync::{Mutex, OnceLock};
use windows::core::w;
use windows::Win32::Foundation::{CloseHandle, HANDLE, HWND, LPARAM, LRESULT, POINT, WPARAM};
use windows::Win32::System::Threading::{OpenProcess, WaitForSingleObject, PROCESS_SYNCHRONIZE};
use windows::Win32::UI::Shell::{DefSubclassProc, RemoveWindowSubclass, SetWindowSubclass};
use windows::Win32::UI::WindowsAndMessaging::{
    DisableProcessWindowsGhosting, GetAncestor, GetCursorPos, GetForegroundWindow, GetWindowLongPtrW, IsWindow, IsWindowVisible,
    SetForegroundWindow, SetPropW, SetWindowLongPtrW, SetWindowPos, WindowFromPoint, GA_ROOT, GWL_EXSTYLE, HWND_TOPMOST, MA_NOACTIVATE, STYLESTRUCT,
    SWP_FRAMECHANGED, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER, WINDOWPOS, WM_DISPLAYCHANGE,
    WM_MOUSEACTIVATE, WM_NCDESTROY, WM_POWERBROADCAST, WM_SETTINGCHANGE, WM_STYLECHANGING, WM_WINDOWPOSCHANGING,
};

pub const WS_EX_TRANSPARENT: u32 = 0x0000_0020;
pub const WS_EX_LAYERED: u32 = 0x0008_0000;
pub const WS_EX_NOACTIVATE: u32 = 0x0800_0000;
pub const WS_EX_TOOLWINDOW: u32 = 0x0000_0080;
pub const WS_EX_APPWINDOW: u32 = 0x0004_0000;
pub const WS_EX_TOPMOST: u32 = 0x0000_0008;
const CLICKTHROUGH: u32 = WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE;
const GWL_EXSTYLE_I: i32 = -20;
const SPI_SETWORKAREA: usize = 0x002F;
const PBT_APMRESUMESUSPEND: usize = 0x0007;
const PBT_APMRESUMEAUTOMATIC: usize = 0x0012;
const OVERLAY_SUBCLASS_ID: usize = 0xE7_0001;
const TOOLBAR_SUBCLASS_ID: usize = 0xE7_0002;

static TOOLBAR: AtomicIsize = AtomicIsize::new(0);
static GUARDS: OnceLock<Mutex<HashMap<isize, bool>>> = OnceLock::new();
static WATCH: OnceLock<fn(SystemEvent)> = OnceLock::new();

fn guards() -> &'static Mutex<HashMap<isize, bool>> {
    GUARDS.get_or_init(|| Mutex::new(HashMap::new()))
}

fn h(v: isize) -> HWND {
    HWND(v as *mut c_void)
}

fn desired_clickthrough(hwnd: isize) -> Option<bool> {
    guards().lock().ok().and_then(|g| g.get(&hwnd).copied())
}

/// Called once at start-up.
pub fn init_process() {
    // A hung window would otherwise be replaced by an opaque "ghost" window
    // that does NOT keep WS_EX_TRANSPARENT and would block the desktop.
    unsafe { DisableProcessWindowsGhosting() };
}

unsafe extern "system" fn overlay_proc(hwnd: HWND, msg: u32, wp: WPARAM, lp: LPARAM, _id: usize, _data: usize) -> LRESULT {
    let key = hwnd.0 as isize;
    match msg {
        WM_STYLECHANGING if wp.0 as i32 == GWL_EXSTYLE_I => {
            let ss = lp.0 as *mut STYLESTRUCT;
            if !ss.is_null() {
                let mut s = (*ss).styleNew;
                s = (s | WS_EX_TOOLWINDOW) & !WS_EX_APPWINDOW;
                if desired_clickthrough(key).unwrap_or(true) {
                    s |= CLICKTHROUGH;
                }
                (*ss).styleNew = s;
            }
        }
        WM_WINDOWPOSCHANGING => {
            let wp_ptr = lp.0 as *mut WINDOWPOS;
            if !wp_ptr.is_null() {
                if desired_clickthrough(key).unwrap_or(true) {
                    (*wp_ptr).flags |= SWP_NOACTIVATE;
                }
                let tb = TOOLBAR.load(Ordering::Relaxed);
                let topmost_toolbar = tb != 0 && (GetWindowLongPtrW(h(tb), GWL_EXSTYLE) as u32 & WS_EX_TOPMOST) != 0;
                if topmost_toolbar && ((*wp_ptr).flags & SWP_NOZORDER).0 == 0 && tb != key {
                    // Keep every overlay directly below the toolbar.
                    (*wp_ptr).hwndInsertAfter = h(tb);
                }
            }
        }
        WM_MOUSEACTIVATE if desired_clickthrough(key).unwrap_or(true) => {
            return LRESULT(MA_NOACTIVATE as isize);
        }
        WM_NCDESTROY => {
            if let Ok(mut g) = guards().lock() {
                g.remove(&key);
            }
            let _ = RemoveWindowSubclass(hwnd, Some(overlay_proc), OVERLAY_SUBCLASS_ID);
        }
        _ => {}
    }
    DefSubclassProc(hwnd, msg, wp, lp)
}

/// Install the guard on an overlay. Starts in click-through.
pub fn install_overlay_guard(hwnd: isize) {
    if let Ok(mut g) = guards().lock() {
        g.insert(hwnd, true);
    }
    unsafe {
        // Tell the shell this monitor-sized topmost window is not a
        // full-screen application (keeps the taskbar and notifications
        // working while drawings are visible). Community-documented property.
        if SetPropW(h(hwnd), w!("NonRudeHWND"), Some(HANDLE(std::ptr::dangling_mut::<c_void>())) /* any non-zero value */).is_err() {
            log::warn!("could not mark the overlay as non-full-screen");
        }
        let ok = SetWindowSubclass(h(hwnd), Some(overlay_proc), OVERLAY_SUBCLASS_ID, 0);
        if !ok.as_bool() {
            log::error!("could not install the overlay style guard");
        }
    }
    force_clickthrough(hwnd);
}

pub fn set_clickthrough_desired(hwnd: isize, clickthrough: bool) {
    if let Ok(mut g) = guards().lock() {
        g.insert(hwnd, clickthrough);
    }
    if clickthrough {
        force_clickthrough(hwnd);
    }
}

/// Apply click-through immediately (in addition to tao's own flag change).
pub fn force_clickthrough(hwnd: isize) {
    unsafe {
        let cur = GetWindowLongPtrW(h(hwnd), GWL_EXSTYLE) as u32;
        let want = ((cur | CLICKTHROUGH | WS_EX_TOOLWINDOW) & !WS_EX_APPWINDOW) as isize;
        if cur as isize != want {
            SetWindowLongPtrW(h(hwnd), GWL_EXSTYLE, want);
            let _ = SetWindowPos(h(hwnd), None, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED);
        }
    }
}

pub fn set_toolbar(hwnd: isize) {
    TOOLBAR.store(hwnd, Ordering::Relaxed);
}

unsafe extern "system" fn toolbar_proc(hwnd: HWND, msg: u32, wp: WPARAM, lp: LPARAM, _id: usize, _data: usize) -> LRESULT {
    let ev = match msg {
        WM_DISPLAYCHANGE => Some(SystemEvent::DisplayChanged),
        WM_SETTINGCHANGE if wp.0 == SPI_SETWORKAREA => Some(SystemEvent::WorkAreaChanged),
        WM_POWERBROADCAST if wp.0 == PBT_APMRESUMEAUTOMATIC || wp.0 == PBT_APMRESUMESUSPEND => Some(SystemEvent::Resumed),
        WM_NCDESTROY => {
            let _ = RemoveWindowSubclass(hwnd, Some(toolbar_proc), TOOLBAR_SUBCLASS_ID);
            None
        }
        _ => None,
    };
    if let (Some(ev), Some(cb)) = (ev, WATCH.get()) {
        // The callback only queues work; it never blocks the window procedure.
        cb(ev);
    }
    DefSubclassProc(hwnd, msg, wp, lp)
}

pub fn install_system_watch(hwnd: isize, cb: fn(SystemEvent)) {
    let _ = WATCH.set(cb);
    unsafe {
        if !SetWindowSubclass(h(hwnd), Some(toolbar_proc), TOOLBAR_SUBCLASS_ID, 0).as_bool() {
            log::error!("could not watch for display changes");
        }
    }
}

pub fn raise_topmost(hwnd: isize) {
    unsafe {
        let _ = SetWindowPos(h(hwnd), Some(HWND_TOPMOST), 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
    }
}

pub fn ex_style(hwnd: isize) -> u32 {
    unsafe { GetWindowLongPtrW(h(hwnd), GWL_EXSTYLE) as u32 }
}

/// Top-level window that would receive a mouse click at (x, y) (physical px).
pub fn root_window_at(x: i32, y: i32) -> isize {
    unsafe {
        let w = WindowFromPoint(POINT { x, y });
        if w.0.is_null() {
            return 0;
        }
        GetAncestor(w, GA_ROOT).0 as isize
    }
}

/// Give focus back to a window (used if an overlay ever took it while it
/// was meant to be click-through).
pub fn set_foreground(hwnd: isize) {
    if hwnd != 0 {
        unsafe {
            let _ = SetForegroundWindow(h(hwnd));
        }
    }
}

pub fn foreground() -> isize {
    unsafe { GetForegroundWindow().0 as isize }
}

/// True while the handle refers to an existing window.
pub fn is_window(hwnd: isize) -> bool {
    hwnd != 0 && unsafe { IsWindow(Some(h(hwnd))).as_bool() }
}

pub fn is_visible(hwnd: isize) -> bool {
    unsafe { IsWindowVisible(h(hwnd)).as_bool() }
}

pub fn cursor_pos() -> Option<(i32, i32)> {
    let mut p = POINT::default();
    unsafe { GetCursorPos(&mut p).ok().map(|_| (p.x, p.y)) }
}

/// Used by a relaunched instance to wait for the hung one to disappear.
pub fn wait_for_process_exit(pid: u32, timeout_ms: u32) {
    unsafe {
        if let Ok(hp) = OpenProcess(PROCESS_SYNCHRONIZE, false, pid) {
            let _ = WaitForSingleObject(hp, timeout_ms);
            let _ = CloseHandle(hp);
        }
    }
}

pub fn os_version() -> String {
    // RtlGetVersion is not exported through the windows crate features we
    // use; the build number in the environment is good enough for logs.
    let v = std::env::var("OS").unwrap_or_else(|_| "Windows".into());
    format!("{v} ({})", std::env::consts::ARCH)
}

#[allow(dead_code)]
fn _assert_types() {
    let _ = WS_EX_LAYERED;
}
