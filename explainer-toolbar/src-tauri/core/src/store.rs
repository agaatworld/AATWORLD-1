//! Crash-safe file storage.
//!
//! * `atomic_write` writes to a temporary file in the same folder, flushes it
//!   to disk, keeps the previous version as `<name>.bak`, then renames the
//!   temporary file over the target. A crash at any point leaves either the
//!   old or the new file intact, never a half-written one.
//! * `read_with_recovery` validates what it reads; a corrupt file is moved
//!   aside (`<name>.corrupt-<n>`) and the backup is used instead.

use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

static COUNTER: AtomicU64 = AtomicU64::new(0);

fn sibling(path: &Path, suffix: &str) -> PathBuf {
    let mut name = path.file_name().map(|n| n.to_os_string()).unwrap_or_default();
    name.push(suffix);
    path.with_file_name(name)
}

pub fn backup_path(path: &Path) -> PathBuf {
    sibling(path, ".bak")
}

pub fn atomic_write(path: &Path, bytes: &[u8]) -> io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let n = COUNTER.fetch_add(1, Ordering::Relaxed);
    let tmp = sibling(path, &format!(".tmp-{}-{n}", std::process::id()));
    let result = (|| {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(bytes)?;
        f.sync_all()?;
        drop(f);
        if path.exists() {
            // Best effort: a missing backup must not block saving new data.
            let _ = fs::copy(path, backup_path(path));
        }
        fs::rename(&tmp, path)
    })();
    if result.is_err() {
        let _ = fs::remove_file(&tmp);
    }
    result
}

#[derive(Debug, PartialEq, Eq)]
pub enum ReadOutcome {
    Ok(Vec<u8>),
    /// The main file was missing or corrupt; this came from `<name>.bak`.
    Recovered(Vec<u8>),
    Missing,
}

pub fn read_with_recovery(path: &Path, valid: impl Fn(&[u8]) -> bool) -> io::Result<ReadOutcome> {
    if path.exists() {
        let bytes = fs::read(path)?;
        if valid(&bytes) {
            return Ok(ReadOutcome::Ok(bytes));
        }
        quarantine(path)?;
    }
    let bak = backup_path(path);
    if bak.exists() {
        let bytes = fs::read(&bak)?;
        if valid(&bytes) {
            atomic_write(path, &bytes)?;
            return Ok(ReadOutcome::Recovered(bytes));
        }
    }
    Ok(ReadOutcome::Missing)
}

fn quarantine(path: &Path) -> io::Result<PathBuf> {
    let ts = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0);
    let target = sibling(path, &format!(".corrupt-{ts}"));
    fs::rename(path, &target)?;
    Ok(target)
}

pub fn is_json_object(bytes: &[u8]) -> bool {
    serde_json::from_slice::<serde_json::Value>(bytes).map(|v| v.is_object()).unwrap_or(false)
}

/// Remove stale temporary files left by a crash during `atomic_write`.
pub fn clean_temp_files(dir: &Path) -> usize {
    let mut n = 0;
    if let Ok(rd) = fs::read_dir(dir) {
        for e in rd.flatten() {
            let name = e.file_name().to_string_lossy().to_string();
            if name.contains(".tmp-") && fs::remove_file(e.path()).is_ok() {
                n += 1;
            }
        }
    }
    n
}

/// Copy `sources` (files or folders) into `root/<stamp>/`, then keep only the
/// newest `keep` backups. Returns the new backup folder.
pub fn make_backup(sources: &[PathBuf], root: &Path, stamp: &str, keep: usize) -> io::Result<PathBuf> {
    let dest = root.join(stamp);
    fs::create_dir_all(&dest)?;
    for s in sources {
        if !s.exists() {
            continue;
        }
        let name = s.file_name().map(|n| n.to_os_string()).unwrap_or_default();
        copy_tree(s, &dest.join(name))?;
    }
    prune_backups(root, keep)?;
    Ok(dest)
}

pub fn list_backups(root: &Path) -> Vec<String> {
    let mut v: Vec<String> = fs::read_dir(root)
        .map(|rd| {
            rd.flatten()
                .filter(|e| e.path().is_dir())
                .map(|e| e.file_name().to_string_lossy().to_string())
                .collect()
        })
        .unwrap_or_default();
    v.sort();
    v.reverse();
    v
}

fn prune_backups(root: &Path, keep: usize) -> io::Result<()> {
    let all = list_backups(root);
    for old in all.iter().skip(keep.max(1)) {
        fs::remove_dir_all(root.join(old))?;
    }
    Ok(())
}

pub fn copy_tree(src: &Path, dst: &Path) -> io::Result<()> {
    if src.is_dir() {
        fs::create_dir_all(dst)?;
        for e in fs::read_dir(src)? {
            let e = e?;
            let name = e.file_name();
            let s = name.to_string_lossy();
            if s.contains(".tmp-") {
                continue;
            }
            copy_tree(&e.path(), &dst.join(&name))?;
        }
        Ok(())
    } else {
        if let Some(p) = dst.parent() {
            fs::create_dir_all(p)?;
        }
        fs::copy(src, dst).map(|_| ())
    }
}

/// Keep file names safe on every file system (workspace ids, monitor keys).
pub fn safe_file_stem(input: &str) -> String {
    let s: String = input
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .take(80)
        .collect();
    let s = s.trim_matches('_').to_string();
    if s.is_empty() {
        "item".into()
    } else {
        s
    }
}

#[cfg(test)]
pub(crate) mod tests {
    use super::*;

    pub fn temp_dir(tag: &str) -> PathBuf {
        let n = COUNTER.fetch_add(1, Ordering::Relaxed);
        let d = std::env::temp_dir().join(format!("explainer-core-test-{tag}-{}-{n}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn write_then_read() {
        let d = temp_dir("rw");
        let p = d.join("a.json");
        atomic_write(&p, b"{\"v\":1}").unwrap();
        assert_eq!(read_with_recovery(&p, is_json_object).unwrap(), ReadOutcome::Ok(b"{\"v\":1}".to_vec()));
        atomic_write(&p, b"{\"v\":2}").unwrap();
        assert_eq!(fs::read(backup_path(&p)).unwrap(), b"{\"v\":1}");
        assert!(fs::read_dir(&d).unwrap().all(|e| !e.unwrap().file_name().to_string_lossy().contains(".tmp-")));
    }

    #[test]
    fn corrupt_main_file_falls_back_to_backup_and_is_quarantined() {
        let d = temp_dir("corrupt");
        let p = d.join("s.json");
        atomic_write(&p, b"{\"good\":true}").unwrap();
        atomic_write(&p, b"{\"good\":2}").unwrap();
        fs::write(&p, b"{\"trunc").unwrap(); // simulate a torn write by another tool
        let out = read_with_recovery(&p, is_json_object).unwrap();
        assert_eq!(out, ReadOutcome::Recovered(b"{\"good\":true}".to_vec()));
        assert_eq!(fs::read(&p).unwrap(), b"{\"good\":true}", "main file restored");
        let names: Vec<String> = fs::read_dir(&d).unwrap().map(|e| e.unwrap().file_name().to_string_lossy().to_string()).collect();
        assert!(names.iter().any(|n| n.contains(".corrupt-")), "{names:?}");
    }

    #[test]
    fn missing_everything_is_reported_not_an_error() {
        let d = temp_dir("missing");
        assert_eq!(read_with_recovery(&d.join("none.json"), is_json_object).unwrap(), ReadOutcome::Missing);
    }

    #[test]
    fn stale_temp_files_are_cleaned() {
        let d = temp_dir("tmp");
        fs::write(d.join("x.json.tmp-1-2"), b"partial").unwrap();
        fs::write(d.join("x.json"), b"{}").unwrap();
        assert_eq!(clean_temp_files(&d), 1);
        assert!(d.join("x.json").exists());
    }

    #[test]
    fn backups_rotate() {
        let d = temp_dir("bk");
        let src = d.join("data");
        fs::create_dir_all(src.join("sub")).unwrap();
        fs::write(src.join("sub/f.json"), b"{}").unwrap();
        let root = d.join("backups");
        for i in 0..5 {
            make_backup(std::slice::from_ref(&src), &root, &format!("2026-11-2{i}"), 3).unwrap();
        }
        let list = list_backups(&root);
        assert_eq!(list, vec!["2026-11-24", "2026-11-23", "2026-11-22"]);
        assert!(root.join("2026-11-24/data/sub/f.json").exists());
    }

    #[test]
    fn safe_names() {
        assert_eq!(safe_file_stem("\\\\.\\DISPLAY1"), "DISPLAY1");
        assert_eq!(safe_file_stem("../../etc"), "etc");
        assert_eq!(safe_file_stem("  "), "item");
        assert_eq!(safe_file_stem("work-space_2"), "work-space_2");
    }
}
