//! Global undo/redo routing across monitors.
//!
//! Each overlay keeps its own object history. This router remembers *which*
//! overlays were touched by each user action, in order, so a single Undo
//! (from the toolbar, a hotkey, or Ctrl+Z on any monitor) always reverts the
//! most recent action wherever it happened. A "group" entry (e.g. Clear all)
//! targets several overlays at once.

use std::collections::VecDeque;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HistoryRouter {
    undo: VecDeque<Vec<String>>,
    redo: Vec<Vec<String>>,
    limit: usize,
}

impl Default for HistoryRouter {
    fn default() -> Self {
        Self::new(500)
    }
}

impl HistoryRouter {
    pub fn new(limit: usize) -> Self {
        Self { undo: VecDeque::new(), redo: Vec::new(), limit: limit.max(1) }
    }

    /// Record a committed action. Returns `true` when a redo stack existed and
    /// was discarded, so the overlays must drop their local redo stacks too.
    pub fn record(&mut self, targets: Vec<String>) -> bool {
        let mut targets = targets;
        targets.sort();
        targets.dedup();
        if targets.is_empty() {
            return false;
        }
        self.undo.push_back(targets);
        while self.undo.len() > self.limit {
            self.undo.pop_front();
        }
        let had_redo = !self.redo.is_empty();
        self.redo.clear();
        had_redo
    }

    /// Add a target to the most recent entry (several overlays acknowledging
    /// one grouped action such as "Clear all"). Returns false if there is no
    /// entry to extend.
    pub fn extend_last(&mut self, target: String) -> bool {
        match self.undo.back_mut() {
            Some(last) => {
                if !last.contains(&target) {
                    last.push(target);
                    last.sort();
                }
                true
            }
            None => false,
        }
    }

    pub fn undo(&mut self) -> Option<Vec<String>> {
        let t = self.undo.pop_back()?;
        self.redo.push(t.clone());
        Some(t)
    }

    pub fn redo(&mut self) -> Option<Vec<String>> {
        let t = self.redo.pop()?;
        self.undo.push_back(t.clone());
        Some(t)
    }

    pub fn can_undo(&self) -> bool {
        !self.undo.is_empty()
    }
    pub fn can_redo(&self) -> bool {
        !self.redo.is_empty()
    }

    /// A monitor disappeared or its scene was replaced (workspace switch):
    /// remove it from every entry and drop entries that become empty.
    pub fn forget(&mut self, target: &str) {
        for e in self.undo.iter_mut() {
            e.retain(|t| t != target);
        }
        self.undo.retain(|e| !e.is_empty());
        for e in self.redo.iter_mut() {
            e.retain(|t| t != target);
        }
        self.redo.retain(|e| !e.is_empty());
    }

    pub fn clear(&mut self) {
        self.undo.clear();
        self.redo.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn v(s: &[&str]) -> Vec<String> {
        s.iter().map(|x| x.to_string()).collect()
    }

    #[test]
    fn undo_follows_global_order_across_monitors() {
        let mut h = HistoryRouter::default();
        h.record(v(&["A"]));
        h.record(v(&["B"]));
        h.record(v(&["A"]));
        assert_eq!(h.undo(), Some(v(&["A"])));
        assert_eq!(h.undo(), Some(v(&["B"])));
        assert_eq!(h.redo(), Some(v(&["B"])));
        assert_eq!(h.undo(), Some(v(&["B"])));
        assert_eq!(h.undo(), Some(v(&["A"])));
        assert_eq!(h.undo(), None);
    }

    #[test]
    fn new_action_discards_redo_and_reports_it() {
        let mut h = HistoryRouter::default();
        assert!(!h.record(v(&["A"])));
        h.undo();
        assert!(h.can_redo());
        assert!(h.record(v(&["B"])));
        assert!(!h.can_redo());
    }

    #[test]
    fn groups_are_deduplicated_and_empty_groups_ignored() {
        let mut h = HistoryRouter::default();
        assert!(!h.record(vec![]));
        assert!(!h.can_undo());
        h.record(v(&["B", "A", "B"]));
        assert_eq!(h.undo(), Some(v(&["A", "B"])));
    }

    #[test]
    fn forgetting_a_monitor_drops_its_entries() {
        let mut h = HistoryRouter::default();
        h.record(v(&["A"]));
        h.record(v(&["A", "B"]));
        h.record(v(&["B"]));
        h.forget("B");
        assert_eq!(h.undo(), Some(v(&["A"])));
        assert_eq!(h.undo(), Some(v(&["A"])));
        assert_eq!(h.undo(), None);
    }

    #[test]
    fn grouped_actions_extend_the_last_entry() {
        let mut h = HistoryRouter::default();
        assert!(!h.extend_last("A".into()));
        h.record(v(&["B"]));
        assert!(h.extend_last("A".into()));
        assert!(h.extend_last("A".into()));
        assert_eq!(h.undo(), Some(v(&["A", "B"])));
    }

    #[test]
    fn limit_is_respected() {
        let mut h = HistoryRouter::new(3);
        for i in 0..10 {
            h.record(vec![format!("m{i}")]);
        }
        let mut n = 0;
        while h.undo().is_some() {
            n += 1;
        }
        assert_eq!(n, 3);
    }
}
