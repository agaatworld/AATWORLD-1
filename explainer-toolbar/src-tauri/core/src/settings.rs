//! The settings document.
//!
//! Settings are one JSON object. Rust owns the authoritative copy, applies
//! updates as RFC 7386 JSON Merge Patches (so two windows changing different
//! keys at the same time never overwrite each other), bumps a revision and
//! broadcasts the full document. Rust only interprets the parts it needs
//! (global shortcuts, toolbar anchor); the frontend validates the rest.

use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};

pub const SCHEMA_VERSION: u64 = 1;
/// Settings larger than this are rejected (protects against runaway writes).
pub const MAX_SETTINGS_BYTES: usize = 512 * 1024;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Shortcuts {
    pub toggle_annotation: String,
    pub toggle_toolbar: String,
    pub toggle_ink: String,
    pub clear_all: String,
}

impl Default for Shortcuts {
    fn default() -> Self {
        Self {
            toggle_annotation: "Ctrl+Shift+Space".into(),
            toggle_toolbar: "Ctrl+Shift+F12".into(),
            toggle_ink: "Ctrl+Shift+F11".into(),
            clear_all: "Ctrl+Shift+F10".into(),
        }
    }
}

pub fn defaults() -> Value {
    json!({
        "schemaVersion": SCHEMA_VERSION,
        "shortcuts": serde_json::to_value(Shortcuts::default()).unwrap_or(Value::Null),
        "toolbar": { "anchor": null }
    })
}

/// RFC 7386 JSON Merge Patch.
pub fn merge_patch(target: &mut Value, patch: &Value) {
    match patch {
        Value::Object(p) => {
            if !target.is_object() {
                *target = Value::Object(Map::new());
            }
            if let Value::Object(t) = target {
                for (k, v) in p {
                    if v.is_null() {
                        t.remove(k);
                    } else {
                        merge_patch(t.entry(k.clone()).or_insert(Value::Null), v);
                    }
                }
            }
        }
        other => *target = other.clone(),
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum UpdateError {
    NotAnObject,
    TooLarge(usize),
    ReservedKey(&'static str),
}

impl std::fmt::Display for UpdateError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UpdateError::NotAnObject => write!(f, "settings update must be a JSON object"),
            UpdateError::TooLarge(n) => write!(f, "settings would be {n} bytes, above the limit"),
            UpdateError::ReservedKey(k) => write!(f, "'{k}' cannot be changed this way"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct SettingsDoc {
    revision: u64,
    doc: Value,
}

impl Default for SettingsDoc {
    fn default() -> Self {
        Self { revision: 0, doc: defaults() }
    }
}

impl SettingsDoc {
    /// Build from a stored document, filling gaps with defaults. Unknown keys
    /// are kept (newer versions may have written them).
    pub fn from_stored(stored: Value) -> Self {
        let mut doc = defaults();
        if stored.is_object() {
            merge_patch(&mut doc, &stored);
        }
        // Repair the parts Rust depends on.
        let sc = shortcuts_of(&doc);
        if let Some(obj) = doc.as_object_mut() {
            obj.insert("schemaVersion".into(), json!(SCHEMA_VERSION));
            obj.insert("shortcuts".into(), serde_json::to_value(sc).unwrap_or(Value::Null));
            if !obj.get("toolbar").map(Value::is_object).unwrap_or(false) {
                obj.insert("toolbar".into(), json!({ "anchor": null }));
            }
        }
        Self { revision: 0, doc }
    }

    pub fn revision(&self) -> u64 {
        self.revision
    }
    pub fn doc(&self) -> &Value {
        &self.doc
    }

    /// Apply a frontend patch. `schemaVersion` is reserved.
    pub fn apply(&mut self, patch: &Value) -> Result<u64, UpdateError> {
        let p = patch.as_object().ok_or(UpdateError::NotAnObject)?;
        if p.contains_key("schemaVersion") {
            return Err(UpdateError::ReservedKey("schemaVersion"));
        }
        let mut next = self.doc.clone();
        merge_patch(&mut next, patch);
        let size = serde_json::to_vec(&next).map(|v| v.len()).unwrap_or(usize::MAX);
        if size > MAX_SETTINGS_BYTES {
            return Err(UpdateError::TooLarge(size));
        }
        // Keep the Rust-interpreted parts well-formed.
        let repaired = Self::from_stored(next);
        self.doc = repaired.doc;
        self.revision += 1;
        Ok(self.revision)
    }

    pub fn shortcuts(&self) -> Shortcuts {
        shortcuts_of(&self.doc)
    }

    pub fn toolbar_anchor(&self) -> Option<Anchor> {
        self.doc
            .get("toolbar")
            .and_then(|t| t.get("anchor"))
            .and_then(|a| serde_json::from_value(a.clone()).ok())
    }
}

/// Toolbar anchor in physical virtual-screen pixels (top-left of the pill).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Anchor {
    pub x: f64,
    pub y: f64,
}

fn shortcuts_of(doc: &Value) -> Shortcuts {
    let d = Shortcuts::default();
    let s = doc.get("shortcuts");
    let pick = |key: &str, fallback: &str| -> String {
        s.and_then(|s| s.get(key))
            .and_then(Value::as_str)
            .map(str::to_string)
            .unwrap_or_else(|| fallback.to_string())
    };
    Shortcuts {
        toggle_annotation: pick("toggleAnnotation", &d.toggle_annotation),
        toggle_toolbar: pick("toggleToolbar", &d.toggle_toolbar),
        toggle_ink: pick("toggleInk", &d.toggle_ink),
        clear_all: pick("clearAll", &d.clear_all),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn merge_patch_rfc7386_examples() {
        let mut t = json!({"a": "b"});
        merge_patch(&mut t, &json!({"a": "c"}));
        assert_eq!(t, json!({"a": "c"}));
        let mut t = json!({"a": "b"});
        merge_patch(&mut t, &json!({"b": "c"}));
        assert_eq!(t, json!({"a": "b", "b": "c"}));
        let mut t = json!({"a": "b"});
        merge_patch(&mut t, &json!({"a": null}));
        assert_eq!(t, json!({}));
        let mut t = json!({"a": [{"b": "c"}]});
        merge_patch(&mut t, &json!({"a": [1]}));
        assert_eq!(t, json!({"a": [1]}));
        let mut t = json!({"e": null});
        merge_patch(&mut t, &json!({"a": {"bb": {"ccc": null}}}));
        assert_eq!(t, json!({"e": null, "a": {"bb": {}}}));
    }

    #[test]
    fn concurrent_patches_to_different_keys_do_not_lose_updates() {
        let mut s = SettingsDoc::default();
        // Window A and window B both started from revision 0.
        s.apply(&json!({"ui": {"theme": "dark"}})).unwrap();
        s.apply(&json!({"ui": {"orientation": "horizontal"}})).unwrap();
        assert_eq!(s.doc()["ui"]["theme"], "dark");
        assert_eq!(s.doc()["ui"]["orientation"], "horizontal");
        assert_eq!(s.revision(), 2);
    }

    #[test]
    fn corrupt_or_partial_documents_are_repaired() {
        let s = SettingsDoc::from_stored(json!({"shortcuts": {"toggleAnnotation": 42}, "toolbar": 7}));
        assert_eq!(s.shortcuts(), Shortcuts::default());
        assert!(s.doc()["toolbar"].is_object());
        let s = SettingsDoc::from_stored(json!("garbage"));
        assert_eq!(s.doc()["schemaVersion"], SCHEMA_VERSION);
    }

    #[test]
    fn unknown_keys_survive() {
        let s = SettingsDoc::from_stored(json!({"future": {"x": 1}}));
        assert_eq!(s.doc()["future"]["x"], 1);
    }

    #[test]
    fn rejects_non_objects_reserved_and_huge() {
        let mut s = SettingsDoc::default();
        assert_eq!(s.apply(&json!(3)), Err(UpdateError::NotAnObject));
        assert_eq!(s.apply(&json!({"schemaVersion": 9})), Err(UpdateError::ReservedKey("schemaVersion")));
        let big = "x".repeat(MAX_SETTINGS_BYTES + 10);
        assert!(matches!(s.apply(&json!({"ui": {"blob": big}})), Err(UpdateError::TooLarge(_))));
        assert_eq!(s.revision(), 0, "failed updates must not change the revision");
    }

    #[test]
    fn anchor_round_trip() {
        let mut s = SettingsDoc::default();
        assert!(s.toolbar_anchor().is_none());
        s.apply(&json!({"toolbar": {"anchor": {"x": -1200.0, "y": 300.5}}})).unwrap();
        assert_eq!(s.toolbar_anchor(), Some(Anchor { x: -1200.0, y: 300.5 }));
    }
}
