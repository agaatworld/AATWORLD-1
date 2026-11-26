//! The application input/visibility state machine.
//!
//! Desktop safety rule: the overlays capture mouse/pen input ONLY in
//! [`Mode::Annotating`]. Every other state leaves the desktop fully usable.
//! The Rust side owns this machine; the frontends only *request* events.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Mode {
    /// Windows are being created; nothing captures input.
    Initializing,
    /// Ink (if any) is visible; every click goes to the applications below.
    Desktop,
    /// The overlays capture input so the user can draw.
    Annotating,
    /// Ink is hidden (kept in memory and on disk); desktop fully usable.
    Hidden,
    /// A frontend stopped responding; overlays are forced click-through
    /// while the failed window is rebuilt.
    Recovering,
    /// Terminal state: saving and releasing native resources.
    ShuttingDown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ModeEvent {
    Ready,
    EnterAnnotation,
    ExitAnnotation,
    ToggleAnnotation,
    HideInk,
    ShowInk,
    ToggleInk,
    FrontendLost,
    RecoveryDone,
    Quit,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Outcome {
    Changed { from: Mode, to: Mode },
    /// The request was valid but already satisfied (idempotent repeat).
    Unchanged(Mode),
    Rejected { mode: Mode, event: ModeEvent, reason: &'static str },
}

impl Outcome {
    pub fn mode(&self) -> Mode {
        match *self {
            Outcome::Changed { to, .. } => to,
            Outcome::Unchanged(m) => m,
            Outcome::Rejected { mode, .. } => mode,
        }
    }
}

/// When the overlays should be shown.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum OverlayVisibility {
    Hidden,
    /// Shown only on monitors that have ink (saves GPU/composition work and
    /// avoids Windows treating an empty overlay as a full-screen app).
    WhenContent,
    Always,
}

/// What the native layer must do in a given mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Effects {
    pub overlays_capture_input: bool,
    pub overlays_visible: OverlayVisibility,
    /// Register a bare Escape global hotkey (works even if a webview hangs).
    pub escape_hotkey: bool,
    /// Expect heartbeats from the overlays and recover if they stop.
    pub watchdog: bool,
}

pub fn effects(mode: Mode) -> Effects {
    use OverlayVisibility::*;
    let (capture, visible) = match mode {
        Mode::Initializing => (false, Hidden),
        Mode::Desktop => (false, WhenContent),
        Mode::Annotating => (true, Always),
        Mode::Hidden => (false, Hidden),
        Mode::Recovering => (false, WhenContent),
        Mode::ShuttingDown => (false, Hidden),
    };
    Effects {
        overlays_capture_input: capture,
        overlays_visible: visible,
        escape_hotkey: capture,
        watchdog: capture,
    }
}

/// Pure transition function. Never panics; unknown combinations are rejected.
pub fn next(mode: Mode, event: ModeEvent) -> Outcome {
    use Mode::*;
    use ModeEvent::*;
    let to = match (mode, event) {
        (ShuttingDown, Quit) => return Outcome::Unchanged(mode),
        (ShuttingDown, _) => return reject(mode, event, "the application is closing"),
        (_, Quit) => ShuttingDown,

        (Initializing, Ready) => Desktop,
        (Initializing, FrontendLost) => Recovering,
        (Initializing, _) => return reject(mode, event, "the application is still starting"),

        (Desktop, EnterAnnotation | ToggleAnnotation) => Annotating,
        (Desktop, HideInk | ToggleInk) => Hidden,
        (Desktop, FrontendLost) => Recovering,
        (Desktop, _) => Desktop,

        (Annotating, ExitAnnotation | ToggleAnnotation) => Desktop,
        (Annotating, HideInk | ToggleInk) => Hidden,
        (Annotating, FrontendLost) => Recovering,
        (Annotating, _) => Annotating,

        (Hidden, ShowInk | ToggleInk) => Desktop,
        (Hidden, EnterAnnotation | ToggleAnnotation) => Annotating,
        (Hidden, FrontendLost) => Recovering,
        (Hidden, _) => Hidden,

        (Recovering, RecoveryDone) => Desktop,
        (Recovering, EnterAnnotation | ToggleAnnotation) => {
            return reject(mode, event, "a window is being restored; try again in a moment")
        }
        (Recovering, HideInk | ShowInk | ToggleInk) => {
            return reject(mode, event, "a window is being restored; try again in a moment")
        }
        (Recovering, _) => Recovering,
    };
    if to == mode {
        Outcome::Unchanged(mode)
    } else {
        Outcome::Changed { from: mode, to }
    }
}

fn reject(mode: Mode, event: ModeEvent, reason: &'static str) -> Outcome {
    Outcome::Rejected { mode, event, reason }
}

/// Stateful wrapper with a revision counter so frontends can ignore stale
/// broadcasts that arrive out of order.
#[derive(Debug, Clone)]
pub struct ModeMachine {
    mode: Mode,
    revision: u64,
}

impl Default for ModeMachine {
    fn default() -> Self {
        Self { mode: Mode::Initializing, revision: 0 }
    }
}

impl ModeMachine {
    pub fn mode(&self) -> Mode {
        self.mode
    }
    pub fn revision(&self) -> u64 {
        self.revision
    }
    pub fn apply(&mut self, event: ModeEvent) -> Outcome {
        let out = next(self.mode, event);
        if let Outcome::Changed { to, .. } = out {
            self.mode = to;
            self.revision += 1;
        }
        out
    }
}

pub const ALL_MODES: [Mode; 6] = [
    Mode::Initializing,
    Mode::Desktop,
    Mode::Annotating,
    Mode::Hidden,
    Mode::Recovering,
    Mode::ShuttingDown,
];

pub const ALL_EVENTS: [ModeEvent; 10] = [
    ModeEvent::Ready,
    ModeEvent::EnterAnnotation,
    ModeEvent::ExitAnnotation,
    ModeEvent::ToggleAnnotation,
    ModeEvent::HideInk,
    ModeEvent::ShowInk,
    ModeEvent::ToggleInk,
    ModeEvent::FrontendLost,
    ModeEvent::RecoveryDone,
    ModeEvent::Quit,
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_annotating_captures_input() {
        for m in ALL_MODES {
            assert_eq!(effects(m).overlays_capture_input, m == Mode::Annotating, "{m:?}");
            // Escape hotkey and watchdog follow capture exactly.
            assert_eq!(effects(m).escape_hotkey, effects(m).overlays_capture_input);
            assert_eq!(effects(m).watchdog, effects(m).overlays_capture_input);
        }
    }

    #[test]
    fn transition_table_is_total_and_never_panics() {
        for m in ALL_MODES {
            for e in ALL_EVENTS {
                let _ = next(m, e);
            }
        }
    }

    #[test]
    fn quit_always_reaches_shutdown_and_shutdown_is_terminal() {
        for m in ALL_MODES {
            assert_eq!(next(m, ModeEvent::Quit).mode(), Mode::ShuttingDown);
        }
        for e in ALL_EVENTS {
            let out = next(Mode::ShuttingDown, e);
            assert_eq!(out.mode(), Mode::ShuttingDown);
        }
    }

    #[test]
    fn frontend_loss_never_leaves_input_captured() {
        for m in ALL_MODES {
            let out = next(m, ModeEvent::FrontendLost);
            assert!(!effects(out.mode()).overlays_capture_input, "{m:?} -> {:?}", out.mode());
        }
    }

    #[test]
    fn cannot_annotate_before_ready_or_while_recovering() {
        assert!(matches!(next(Mode::Initializing, ModeEvent::EnterAnnotation), Outcome::Rejected { .. }));
        assert!(matches!(next(Mode::Recovering, ModeEvent::ToggleAnnotation), Outcome::Rejected { .. }));
    }

    #[test]
    fn repeated_requests_are_idempotent() {
        let mut mm = ModeMachine::default();
        mm.apply(ModeEvent::Ready);
        assert!(matches!(mm.apply(ModeEvent::EnterAnnotation), Outcome::Changed { .. }));
        let rev = mm.revision();
        for _ in 0..10 {
            assert_eq!(mm.apply(ModeEvent::EnterAnnotation), Outcome::Unchanged(Mode::Annotating));
        }
        assert_eq!(mm.revision(), rev, "no-op requests must not bump the revision");
        mm.apply(ModeEvent::ExitAnnotation);
        assert_eq!(mm.apply(ModeEvent::ExitAnnotation), Outcome::Unchanged(Mode::Desktop));
    }

    #[test]
    fn toggle_storm_ends_in_a_consistent_state() {
        let mut mm = ModeMachine::default();
        mm.apply(ModeEvent::Ready);
        for _ in 0..1001 {
            mm.apply(ModeEvent::ToggleAnnotation);
        }
        assert_eq!(mm.mode(), Mode::Annotating);
        mm.apply(ModeEvent::ToggleAnnotation);
        assert_eq!(mm.mode(), Mode::Desktop);
    }

    #[test]
    fn hiding_ink_from_annotation_releases_input() {
        let out = next(Mode::Annotating, ModeEvent::HideInk);
        assert_eq!(out.mode(), Mode::Hidden);
        assert!(!effects(Mode::Hidden).overlays_capture_input);
    }

    #[test]
    fn recovery_returns_to_desktop() {
        let mut mm = ModeMachine::default();
        mm.apply(ModeEvent::Ready);
        mm.apply(ModeEvent::EnterAnnotation);
        mm.apply(ModeEvent::FrontendLost);
        assert_eq!(mm.mode(), Mode::Recovering);
        mm.apply(ModeEvent::RecoveryDone);
        assert_eq!(mm.mode(), Mode::Desktop);
    }
}
