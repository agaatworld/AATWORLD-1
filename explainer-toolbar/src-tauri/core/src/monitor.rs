//! Monitor identity and change reconciliation.
//!
//! Coordinates here are PHYSICAL virtual-screen pixels (they can be negative
//! for monitors left of / above the primary one). One overlay window exists
//! per monitor so every overlay renders at its own monitor's DPI.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorInfo {
    /// Stable, file-name-safe identifier (derived from the system name).
    pub key: String,
    pub name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale: f64,
    pub work_x: i32,
    pub work_y: i32,
    pub work_width: u32,
    pub work_height: u32,
    pub primary: bool,
}

impl MonitorInfo {
    pub fn contains(&self, px: f64, py: f64) -> bool {
        px >= self.x as f64
            && py >= self.y as f64
            && px < self.x as f64 + self.width as f64
            && py < self.y as f64 + self.height as f64
    }
    pub fn same_geometry(&self, o: &MonitorInfo) -> bool {
        self.x == o.x
            && self.y == o.y
            && self.width == o.width
            && self.height == o.height
            && (self.scale - o.scale).abs() < 1e-6
    }
}

/// Build unique keys from system names. Two monitors reporting the same name
/// (seen with some docks) get `-2`, `-3` suffixes in position order.
pub fn assign_keys(names: &[String]) -> Vec<String> {
    let mut out: Vec<String> = Vec::with_capacity(names.len());
    for (i, n) in names.iter().enumerate() {
        let base = crate::store::safe_file_stem(n);
        let base = if base == "item" { format!("monitor-{}", i + 1) } else { base };
        let mut k = base.clone();
        let mut c = 2;
        while out.contains(&k) {
            k = format!("{base}-{c}");
            c += 1;
        }
        out.push(k);
    }
    out
}

#[derive(Debug, Default, Clone, PartialEq)]
pub struct Reconcile {
    pub create: Vec<MonitorInfo>,
    pub remove: Vec<String>,
    pub reposition: Vec<MonitorInfo>,
}

impl Reconcile {
    pub fn is_empty(&self) -> bool {
        self.create.is_empty() && self.remove.is_empty() && self.reposition.is_empty()
    }
}

pub fn reconcile(existing: &[MonitorInfo], current: &[MonitorInfo]) -> Reconcile {
    let mut r = Reconcile::default();
    for c in current {
        match existing.iter().find(|e| e.key == c.key) {
            None => r.create.push(c.clone()),
            Some(e) if !e.same_geometry(c) => r.reposition.push(c.clone()),
            Some(_) => {}
        }
    }
    for e in existing {
        if !current.iter().any(|c| c.key == e.key) {
            r.remove.push(e.key.clone());
        }
    }
    r
}

#[cfg(test)]
pub(crate) mod tests {
    use super::*;

    pub fn mon(key: &str, x: i32, y: i32, w: u32, h: u32, scale: f64) -> MonitorInfo {
        MonitorInfo {
            key: key.into(),
            name: key.into(),
            x,
            y,
            width: w,
            height: h,
            scale,
            work_x: x,
            work_y: y,
            work_width: w,
            work_height: h.saturating_sub((48.0 * scale) as u32),
            primary: x == 0 && y == 0,
        }
    }

    #[test]
    fn keys_are_unique_and_safe() {
        let k = assign_keys(&["\\\\.\\DISPLAY1".into(), "\\\\.\\DISPLAY1".into(), "".into()]);
        assert_eq!(k, vec!["DISPLAY1", "DISPLAY1-2", "monitor-3"]);
    }

    #[test]
    fn reconcile_detects_hotplug_and_scale_change() {
        let a = mon("A", 0, 0, 1920, 1080, 1.0);
        let b = mon("B", -2560, -200, 2560, 1440, 1.5);
        let r = reconcile(std::slice::from_ref(&a), &[a.clone(), b.clone()]);
        assert_eq!(r.create, vec![b.clone()]);
        assert!(r.remove.is_empty() && r.reposition.is_empty());

        let r = reconcile(&[a.clone(), b.clone()], std::slice::from_ref(&a));
        assert_eq!(r.remove, vec!["B".to_string()]);

        let mut a2 = a.clone();
        a2.scale = 1.25;
        let r = reconcile(std::slice::from_ref(&a), std::slice::from_ref(&a2));
        assert_eq!(r.reposition, vec![a2]);
        assert!(reconcile(std::slice::from_ref(&a), std::slice::from_ref(&a)).is_empty());
    }

    #[test]
    fn contains_handles_negative_coordinates() {
        let b = mon("B", -2560, -200, 2560, 1440, 1.5);
        assert!(b.contains(-1.0, -200.0));
        assert!(!b.contains(0.0, 0.0));
        assert!(!b.contains(-2561.0, 0.0));
    }
}
