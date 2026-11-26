//! Native window control.
//!
//! On Windows this module owns the safety-critical behaviour of the overlays:
//!  * a style guard (WM_STYLECHANGING subclass) that re-asserts click-through
//!    (`WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE`) whenever any
//!    code — including tao's own style refreshes — rewrites the extended
//!    style while the overlay is supposed to be click-through, and always
//!    keeps overlays out of Alt+Tab (`WS_EX_TOOLWINDOW`);
//!  * a z-order/activation guard (WM_WINDOWPOSCHANGING) that keeps overlays
//!    directly below the toolbar and prevents them from taking focus while
//!    click-through;
//!  * a system watcher on the toolbar window for display changes, work-area
//!    changes and resume from sleep.
//!
//! Other platforms get no-op fallbacks so the crate builds and tests anywhere.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SystemEvent {
    DisplayChanged,
    WorkAreaChanged,
    Resumed,
}

#[cfg(windows)]
mod win;
#[cfg(windows)]
pub use win::*;

#[cfg(not(windows))]
mod fallback {
    use super::SystemEvent;
    pub fn init_process() {}
    pub fn install_overlay_guard(_hwnd: isize) {}
    pub fn set_clickthrough_desired(_hwnd: isize, _clickthrough: bool) {}
    pub fn force_clickthrough(_hwnd: isize) {}
    pub fn set_toolbar(_hwnd: isize) {}
    pub fn install_system_watch(_hwnd: isize, _cb: fn(SystemEvent)) {}
    pub fn raise_topmost(_hwnd: isize) {}
    pub fn ex_style(_hwnd: isize) -> u32 {
        0
    }
    pub fn root_window_at(_x: i32, _y: i32) -> isize {
        0
    }
    pub fn foreground() -> isize {
        0
    }
    pub fn set_foreground(_hwnd: isize) {}
    pub fn is_visible(_hwnd: isize) -> bool {
        false
    }
    pub fn is_window(_hwnd: isize) -> bool {
        false
    }
    pub fn cursor_pos() -> Option<(i32, i32)> {
        None
    }
    pub fn wait_for_process_exit(_pid: u32, _timeout_ms: u32) {}
    pub fn os_version() -> String {
        std::env::consts::OS.to_string()
    }
    pub const WS_EX_TRANSPARENT: u32 = 0x20;
    pub const WS_EX_LAYERED: u32 = 0x80000;
    pub const WS_EX_NOACTIVATE: u32 = 0x0800_0000;
    pub const WS_EX_TOOLWINDOW: u32 = 0x80;
    pub const WS_EX_TOPMOST: u32 = 0x8;
}
#[cfg(not(windows))]
pub use fallback::*;
