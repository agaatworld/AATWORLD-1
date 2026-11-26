//! Global shortcut validation and normalisation.
//!
//! Accepted form: modifiers then one key, joined by `+`, e.g. `Ctrl+Shift+D`.
//! The normalised string is understood by tauri-plugin-global-shortcut
//! (global-hotkey crate). A global shortcut must contain Ctrl or Alt (or be
//! F13–F24) so the app never steals plain typing keys from other programs.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ShortcutError {
    Empty,
    UnknownToken(String),
    MissingKey,
    TwoKeys,
    NeedsModifier,
    Reserved(&'static str),
}

impl std::fmt::Display for ShortcutError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ShortcutError::Empty => write!(f, "the shortcut is empty"),
            ShortcutError::UnknownToken(t) => write!(f, "'{t}' is not a key this app understands"),
            ShortcutError::MissingKey => write!(f, "add a key after the modifiers"),
            ShortcutError::TwoKeys => write!(f, "use only one key besides Ctrl/Alt/Shift"),
            ShortcutError::NeedsModifier => write!(f, "include Ctrl or Alt so normal typing is not affected"),
            ShortcutError::Reserved(why) => write!(f, "reserved by Windows: {why}"),
        }
    }
}

const MODS: [&str; 4] = ["Ctrl", "Alt", "Shift", "Super"];

fn key_name(token: &str) -> Option<String> {
    let t = token.trim();
    let u = t.to_ascii_uppercase();
    if u.len() == 1 {
        let c = u.chars().next()?;
        if c.is_ascii_alphanumeric() {
            return Some(u);
        }
    }
    if let Some(n) = u.strip_prefix('F') {
        if let Ok(n) = n.parse::<u8>() {
            if (1..=24).contains(&n) {
                return Some(format!("F{n}"));
            }
        }
    }
    let named = [
        "Space", "Backspace", "Delete", "Insert", "Home", "End", "PageUp", "PageDown", "Up", "Down", "Left",
        "Right", "Enter", "Tab", "Escape",
    ];
    named.iter().find(|n| n.eq_ignore_ascii_case(t)).map(|n| n.to_string()).or_else(|| match u.as_str() {
        "ESC" => Some("Escape".into()),
        "DEL" => Some("Delete".into()),
        "RETURN" => Some("Enter".into()),
        "ARROWUP" => Some("Up".into()),
        "ARROWDOWN" => Some("Down".into()),
        "ARROWLEFT" => Some("Left".into()),
        "ARROWRIGHT" => Some("Right".into()),
        _ => None,
    })
}

fn mod_name(token: &str) -> Option<&'static str> {
    match token.trim().to_ascii_uppercase().as_str() {
        "CTRL" | "CONTROL" | "COMMANDORCONTROL" | "CMDORCTRL" => Some("Ctrl"),
        "ALT" | "OPTION" => Some("Alt"),
        "SHIFT" => Some("Shift"),
        "SUPER" | "WIN" | "META" | "CMD" | "COMMAND" => Some("Super"),
        _ => None,
    }
}

/// Parse and normalise (`ctrl + shift + d` -> `Ctrl+Shift+D`).
pub fn normalize(input: &str) -> Result<String, ShortcutError> {
    let tokens: Vec<&str> = input.split('+').map(str::trim).filter(|t| !t.is_empty()).collect();
    if tokens.is_empty() {
        return Err(ShortcutError::Empty);
    }
    let mut mods: Vec<&'static str> = Vec::new();
    let mut key: Option<String> = None;
    for t in tokens {
        if let Some(m) = mod_name(t) {
            if !mods.contains(&m) {
                mods.push(m);
            }
        } else if let Some(k) = key_name(t) {
            if key.is_some() {
                return Err(ShortcutError::TwoKeys);
            }
            key = Some(k);
        } else {
            return Err(ShortcutError::UnknownToken(t.to_string()));
        }
    }
    let key = key.ok_or(ShortcutError::MissingKey)?;
    mods.sort_by_key(|m| MODS.iter().position(|x| x == m));
    let high_f = key.strip_prefix('F').and_then(|n| n.parse::<u8>().ok()).map(|n| n >= 13).unwrap_or(false);
    if !(mods.contains(&"Ctrl") || mods.contains(&"Alt") || high_f) {
        return Err(ShortcutError::NeedsModifier);
    }
    if mods.contains(&"Super") {
        return Err(ShortcutError::Reserved("Windows-key shortcuts belong to the system"));
    }
    if mods == ["Ctrl", "Alt"] && key == "Delete" {
        return Err(ShortcutError::Reserved("Ctrl+Alt+Delete"));
    }
    if mods == ["Ctrl", "Shift"] && key == "Escape" {
        return Err(ShortcutError::Reserved("Ctrl+Shift+Esc opens Task Manager"));
    }
    let mut parts: Vec<String> = mods.iter().map(|m| m.to_string()).collect();
    parts.push(key);
    Ok(parts.join("+"))
}

/// Return groups of action names that share the same normalised shortcut.
pub fn duplicates<'a>(items: &[(&'a str, &str)]) -> Vec<Vec<&'a str>> {
    let mut by: BTreeMap<String, Vec<&'a str>> = BTreeMap::new();
    for (name, sc) in items {
        if let Ok(n) = normalize(sc) {
            by.entry(n).or_default().push(name);
        }
    }
    by.into_values().filter(|v| v.len() > 1).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalises_case_spacing_order_and_aliases() {
        assert_eq!(normalize(" shift + ctrl + d ").unwrap(), "Ctrl+Shift+D");
        assert_eq!(normalize("Control+Alt+f5").unwrap(), "Ctrl+Alt+F5");
        assert_eq!(normalize("ctrl+shift+space").unwrap(), "Ctrl+Shift+Space");
        assert_eq!(normalize("Ctrl+esc").unwrap(), "Ctrl+Escape");
        assert_eq!(normalize("F13").unwrap(), "F13");
    }

    #[test]
    fn rejects_bad_shortcuts() {
        assert_eq!(normalize(""), Err(ShortcutError::Empty));
        assert_eq!(normalize("Ctrl+Shift"), Err(ShortcutError::MissingKey));
        assert_eq!(normalize("Ctrl+A+B"), Err(ShortcutError::TwoKeys));
        assert_eq!(normalize("Shift+D"), Err(ShortcutError::NeedsModifier));
        assert_eq!(normalize("D"), Err(ShortcutError::NeedsModifier));
        assert!(matches!(normalize("Ctrl+Banana"), Err(ShortcutError::UnknownToken(_))));
        assert!(matches!(normalize("Ctrl+Shift+Esc"), Err(ShortcutError::Reserved(_))));
        assert!(matches!(normalize("Ctrl+Alt+Del"), Err(ShortcutError::Reserved(_))));
        assert!(matches!(normalize("Win+Ctrl+D"), Err(ShortcutError::Reserved(_))));
    }

    #[test]
    fn finds_duplicates_after_normalisation() {
        let d = duplicates(&[("a", "Ctrl+Shift+D"), ("b", "shift+ctrl+d"), ("c", "Ctrl+Shift+E")]);
        assert_eq!(d, vec![vec!["a", "b"]]);
    }

    #[test]
    fn defaults_are_valid_and_distinct() {
        let s = crate::settings::Shortcuts::default();
        let items = [
            ("toggleAnnotation", s.toggle_annotation.as_str()),
            ("toggleToolbar", s.toggle_toolbar.as_str()),
            ("toggleInk", s.toggle_ink.as_str()),
            ("clearAll", s.clear_all.as_str()),
        ];
        for (_, sc) in items {
            assert!(normalize(sc).is_ok(), "{sc}");
        }
        assert!(duplicates(&items).is_empty());
    }
}
