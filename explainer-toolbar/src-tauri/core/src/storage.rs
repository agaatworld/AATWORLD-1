//! On-disk layout (all under the local app-data folder, never deleted by
//! updates):
//!
//! ```text
//! settings.json (+ .bak)
//! workspaces/index.json
//! workspaces/<workspace-id>/<monitor-key>.json      one scene per monitor
//! assets/<content-hash>.<ext>                       imported images
//! backups/<YYYYMMDD-HHMMSS>/                        copies of settings + workspaces
//! ```

use crate::settings::SettingsDoc;
use crate::store::{self, ReadOutcome};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};

pub const MAX_SCENE_BYTES: usize = 64 * 1024 * 1024;
pub const MAX_ASSET_BYTES: usize = 40 * 1024 * 1024;
pub const KEEP_BACKUPS: usize = 10;

#[derive(Debug, Clone)]
pub struct Paths {
    pub root: PathBuf,
    pub logs: PathBuf,
}

impl Paths {
    pub fn settings(&self) -> PathBuf {
        self.root.join("settings.json")
    }
    pub fn workspaces(&self) -> PathBuf {
        self.root.join("workspaces")
    }
    pub fn workspace_index(&self) -> PathBuf {
        self.workspaces().join("index.json")
    }
    pub fn assets(&self) -> PathBuf {
        self.root.join("assets")
    }
    pub fn backups(&self) -> PathBuf {
        self.root.join("backups")
    }
    pub fn scene(&self, workspace: &str, monitor: &str) -> PathBuf {
        self.workspaces().join(store::safe_file_stem(workspace)).join(format!("{}.json", store::safe_file_stem(monitor)))
    }
    pub fn ensure(&self) {
        for d in [self.root.clone(), self.workspaces(), self.assets(), self.backups()] {
            if let Err(e) = fs::create_dir_all(&d) {
                log::error!("cannot create {}: {e}", d.display());
            }
        }
        let n = store::clean_temp_files(&self.root) + store::clean_temp_files(&self.workspaces());
        if n > 0 {
            log::warn!("removed {n} temporary files left by an interrupted save");
        }
    }
}

// ───────────────────────── settings ─────────────────────────

pub fn load_settings(paths: &Paths) -> SettingsDoc {
    match store::read_with_recovery(&paths.settings(), store::is_json_object) {
        Ok(ReadOutcome::Ok(b)) => SettingsDoc::from_stored(serde_json::from_slice(&b).unwrap_or_default()),
        Ok(ReadOutcome::Recovered(b)) => {
            log::warn!("settings.json was damaged; restored the previous copy");
            SettingsDoc::from_stored(serde_json::from_slice(&b).unwrap_or_default())
        }
        Ok(ReadOutcome::Missing) => SettingsDoc::default(),
        Err(e) => {
            log::error!("reading settings failed: {e}; using defaults");
            SettingsDoc::default()
        }
    }
}

pub fn save_settings(paths: &Paths, doc: &serde_json::Value) -> std::io::Result<()> {
    let bytes = serde_json::to_vec_pretty(doc).map_err(std::io::Error::other)?;
    store::atomic_write(&paths.settings(), &bytes)
}

// ───────────────────────── workspaces ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceMeta {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceIndex {
    pub active: String,
    pub list: Vec<WorkspaceMeta>,
}

impl Default for WorkspaceIndex {
    fn default() -> Self {
        Self { active: "default".into(), list: vec![WorkspaceMeta { id: "default".into(), name: "Workspace 1".into() }] }
    }
}

impl WorkspaceIndex {
    pub fn repaired(mut self) -> Self {
        self.list.retain(|w| !w.id.is_empty() && store::safe_file_stem(&w.id) == w.id);
        self.list.dedup_by(|a, b| a.id == b.id);
        for w in self.list.iter_mut() {
            w.name = clean_name(&w.name);
        }
        if self.list.is_empty() {
            return Self::default();
        }
        if !self.list.iter().any(|w| w.id == self.active) {
            self.active = self.list[0].id.clone();
        }
        self
    }
}

pub fn clean_name(s: &str) -> String {
    let t: String = s.chars().filter(|c| !c.is_control()).take(60).collect();
    let t = t.trim().to_string();
    if t.is_empty() {
        "Workspace".into()
    } else {
        t
    }
}

pub fn load_workspaces(paths: &Paths) -> WorkspaceIndex {
    match store::read_with_recovery(&paths.workspace_index(), store::is_json_object) {
        Ok(ReadOutcome::Ok(b)) | Ok(ReadOutcome::Recovered(b)) => {
            serde_json::from_slice::<WorkspaceIndex>(&b).map(WorkspaceIndex::repaired).unwrap_or_default()
        }
        _ => WorkspaceIndex::default(),
    }
}

pub fn save_workspaces(paths: &Paths, idx: &WorkspaceIndex) -> std::io::Result<()> {
    let bytes = serde_json::to_vec_pretty(idx).map_err(std::io::Error::other)?;
    store::atomic_write(&paths.workspace_index(), &bytes)
}

pub fn new_workspace_id(idx: &WorkspaceIndex) -> String {
    let mut n = idx.list.len() + 1;
    loop {
        let id = format!("ws-{n}");
        if !idx.list.iter().any(|w| w.id == id) {
            return id;
        }
        n += 1;
    }
}

// ───────────────────────── scenes ─────────────────────────

pub fn load_scene(paths: &Paths, workspace: &str, monitor: &str) -> Option<String> {
    let p = paths.scene(workspace, monitor);
    match store::read_with_recovery(&p, store::is_json_object) {
        Ok(ReadOutcome::Ok(b)) => String::from_utf8(b).ok(),
        Ok(ReadOutcome::Recovered(b)) => {
            log::warn!("scene {} was damaged; restored the previous copy", p.display());
            String::from_utf8(b).ok()
        }
        Ok(ReadOutcome::Missing) => None,
        Err(e) => {
            log::error!("reading scene {} failed: {e}", p.display());
            None
        }
    }
}

pub fn save_scene(paths: &Paths, workspace: &str, monitor: &str, json: &str) -> Result<(), String> {
    if json.len() > MAX_SCENE_BYTES {
        return Err("the drawing is too large to save".into());
    }
    if !store::is_json_object(json.as_bytes()) {
        return Err("refusing to save a malformed drawing".into());
    }
    store::atomic_write(&paths.scene(workspace, monitor), json.as_bytes()).map_err(|e| e.to_string())
}

// ───────────────────────── assets ─────────────────────────

/// Recognise supported image formats by their magic bytes (never by the
/// file extension). SVG is deliberately not accepted.
pub fn sniff_image(b: &[u8]) -> Option<&'static str> {
    if b.starts_with(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A]) {
        Some("png")
    } else if b.starts_with(&[0xFF, 0xD8, 0xFF]) {
        Some("jpg")
    } else if b.starts_with(b"GIF87a") || b.starts_with(b"GIF89a") {
        Some("gif")
    } else if b.len() >= 12 && &b[0..4] == b"RIFF" && &b[8..12] == b"WEBP" {
        Some("webp")
    } else if b.starts_with(b"BM") && b.len() > 26 {
        Some("bmp")
    } else {
        None
    }
}

fn content_name(b: &[u8], ext: &str) -> String {
    let mut h1 = DefaultHasher::new();
    b.hash(&mut h1);
    let mut h2 = DefaultHasher::new();
    (b.len() as u64).hash(&mut h2);
    b.iter().rev().step_by(7).for_each(|x| x.hash(&mut h2));
    format!("{:016x}{:016x}.{ext}", h1.finish(), h2.finish())
}

pub fn valid_asset_name(name: &str) -> bool {
    let (stem, ext) = match name.rsplit_once('.') {
        Some(x) => x,
        None => return false,
    };
    (16..=64).contains(&stem.len())
        && stem.chars().all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase())
        && matches!(ext, "png" | "jpg" | "gif" | "webp" | "bmp")
}

pub fn store_asset(paths: &Paths, bytes: &[u8]) -> Result<String, String> {
    if bytes.is_empty() {
        return Err("the image is empty".into());
    }
    if bytes.len() > MAX_ASSET_BYTES {
        return Err("the image is larger than 40 MB".into());
    }
    let ext = sniff_image(bytes).ok_or("this file is not a PNG, JPEG, GIF, WebP or BMP image")?;
    let name = content_name(bytes, ext);
    let path = paths.assets().join(&name);
    if !path.exists() {
        store::atomic_write(&path, bytes).map_err(|e| e.to_string())?;
    }
    Ok(name)
}

pub fn import_asset_file(paths: &Paths, file: &Path) -> Result<String, String> {
    let meta = fs::metadata(file).map_err(|e| format!("cannot open the file: {e}"))?;
    if !meta.is_file() {
        return Err("not a file".into());
    }
    if meta.len() as usize > MAX_ASSET_BYTES {
        return Err("the image is larger than 40 MB".into());
    }
    let bytes = fs::read(file).map_err(|e| format!("cannot read the file: {e}"))?;
    store_asset(paths, &bytes)
}

pub fn read_asset(paths: &Paths, name: &str) -> Result<Vec<u8>, String> {
    if !valid_asset_name(name) {
        return Err("invalid image reference".into());
    }
    fs::read(paths.assets().join(name)).map_err(|_| "image file missing".to_string())
}

// ───────────────────────── backups ─────────────────────────

pub fn backup_now(paths: &Paths, stamp: &str) -> Result<String, String> {
    store::make_backup(&[paths.settings(), paths.workspaces()], &paths.backups(), stamp, KEEP_BACKUPS)
        .map(|p| p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default())
        .map_err(|e| e.to_string())
}

pub fn list_backups(paths: &Paths) -> Vec<String> {
    store::list_backups(&paths.backups())
}

pub fn valid_backup_name(name: &str) -> bool {
    !name.is_empty() && name.len() <= 40 && name.chars().all(|c| c.is_ascii_digit() || c == '-')
}

/// Restore settings + workspaces from a backup (a safety backup of the
/// current state is taken first by the caller).
pub fn restore_backup(paths: &Paths, name: &str) -> Result<(), String> {
    if !valid_backup_name(name) {
        return Err("invalid backup name".into());
    }
    let src = paths.backups().join(name);
    if !src.is_dir() {
        return Err("backup not found".into());
    }
    let s = src.join("settings.json");
    if s.exists() {
        let b = fs::read(&s).map_err(|e| e.to_string())?;
        if store::is_json_object(&b) {
            store::atomic_write(&paths.settings(), &b).map_err(|e| e.to_string())?;
        }
    }
    let w = src.join("workspaces");
    if w.is_dir() {
        let staging = paths.root.join("workspaces.restoring");
        let _ = fs::remove_dir_all(&staging);
        store::copy_tree(&w, &staging).map_err(|e| e.to_string())?;
        let old = paths.root.join("workspaces.old");
        let _ = fs::remove_dir_all(&old);
        if paths.workspaces().exists() {
            fs::rename(paths.workspaces(), &old).map_err(|e| e.to_string())?;
        }
        if let Err(e) = fs::rename(&staging, paths.workspaces()) {
            // put the old data back rather than leave nothing
            let _ = fs::rename(&old, paths.workspaces());
            return Err(e.to_string());
        }
        let _ = fs::remove_dir_all(&old);
    }
    Ok(())
}

/// Daily automatic backup: only if the newest backup is older than a day.
pub fn auto_backup_due(paths: &Paths, today_stamp: &str) -> bool {
    match list_backups(paths).first() {
        None => paths.settings().exists() || paths.workspaces().join("default").exists(),
        Some(newest) => newest.get(0..8) != today_stamp.get(0..8),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp(tag: &str) -> Paths {
        let d = std::env::temp_dir().join(format!("explainer-storage-{tag}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        let p = Paths { root: d.clone(), logs: d.join("logs") };
        p.ensure();
        p
    }

    #[test]
    fn image_sniffing_uses_magic_bytes() {
        assert_eq!(sniff_image(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A, 0]), Some("png"));
        assert_eq!(sniff_image(b"<svg xmlns=..."), None);
        assert_eq!(sniff_image(b"RIFF\0\0\0\0WEBPVP8 "), Some("webp"));
        assert_eq!(sniff_image(b""), None);
    }

    #[test]
    fn assets_are_content_addressed_and_validated() {
        let p = tmp("assets");
        let png = [0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3];
        let a = store_asset(&p, &png).unwrap();
        let b = store_asset(&p, &png).unwrap();
        assert_eq!(a, b);
        assert!(valid_asset_name(&a));
        assert_eq!(read_asset(&p, &a).unwrap(), png);
        assert!(read_asset(&p, "../settings.json").is_err());
        assert!(read_asset(&p, "ABCDEF0123456789.png").is_err());
        assert!(store_asset(&p, b"not an image").is_err());
    }

    #[test]
    fn scenes_round_trip_and_reject_garbage() {
        let p = tmp("scenes");
        save_scene(&p, "default", "DISPLAY1", "{\"objects\":[]}").unwrap();
        assert_eq!(load_scene(&p, "default", "DISPLAY1").unwrap(), "{\"objects\":[]}");
        assert!(save_scene(&p, "default", "DISPLAY1", "[1,2]").is_err());
        assert!(load_scene(&p, "default", "OTHER").is_none());
        // path traversal in ids is neutralised
        assert!(p.scene("../../x", "..\\y").starts_with(p.workspaces()));
    }

    #[test]
    fn workspace_index_repair() {
        let idx = WorkspaceIndex { active: "gone".into(), list: vec![WorkspaceMeta { id: "a/b".into(), name: "x".into() }] }.repaired();
        assert_eq!(idx, WorkspaceIndex::default());
        let idx = WorkspaceIndex {
            active: "gone".into(),
            list: vec![WorkspaceMeta { id: "ws-2".into(), name: "  \u{7}Lesson ".into() }],
        }
        .repaired();
        assert_eq!(idx.active, "ws-2");
        assert_eq!(idx.list[0].name, "Lesson");
    }

    #[test]
    fn backup_and_restore() {
        let p = tmp("backup");
        save_settings(&p, &serde_json::json!({"ui": {"theme": "dark"}})).unwrap();
        save_scene(&p, "default", "D1", "{\"v\":1}").unwrap();
        let name = backup_now(&p, "20261126-101010").unwrap();
        save_settings(&p, &serde_json::json!({"ui": {"theme": "light"}})).unwrap();
        save_scene(&p, "default", "D1", "{\"v\":2}").unwrap();
        restore_backup(&p, &name).unwrap();
        assert_eq!(load_scene(&p, "default", "D1").unwrap(), "{\"v\":1}");
        assert_eq!(load_settings(&p).doc()["ui"]["theme"], "dark");
        assert!(restore_backup(&p, "../x").is_err());
        assert!(!auto_backup_due(&p, "20261126-235959"));
        assert!(auto_backup_due(&p, "20261127-000001"));
    }
}
