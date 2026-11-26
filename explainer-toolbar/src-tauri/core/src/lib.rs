//! Platform-independent core of Explainer Toolbar.
//!
//! Everything here is plain Rust with no Tauri or Win32 dependency, so it can
//! be unit-tested on any machine. The Tauri application (`src-tauri/src`)
//! wires these pieces to real windows.

pub mod history;
pub mod layout;
pub mod mode;
pub mod monitor;
pub mod settings;
pub mod shortcut;
pub mod storage;
pub mod store;
pub mod util;
