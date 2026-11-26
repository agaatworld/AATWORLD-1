//! Toolbar window placement (physical virtual-screen pixels).
//!
//! The toolbar "pill" has an anchor (its top-left corner on screen). The
//! toolbar *window* can be larger than the pill while a popover is open; the
//! frontend asks for a window size and the pill's offset inside it. We keep
//! the pill exactly where it was unless the window would leave the monitor's
//! work area, in which case the window shifts (never the other way round).

use crate::monitor::MonitorInfo;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

impl Rect {
    pub fn right(&self) -> f64 {
        self.x + self.w
    }
    pub fn bottom(&self) -> f64 {
        self.y + self.h
    }
}

pub fn work_area(m: &MonitorInfo) -> Rect {
    Rect { x: m.work_x as f64, y: m.work_y as f64, w: m.work_width as f64, h: m.work_height as f64 }
}

fn clamp_axis(pos: f64, size: f64, lo: f64, hi: f64) -> f64 {
    if size >= hi - lo {
        lo
    } else {
        pos.max(lo).min(hi - size)
    }
}

/// Move `r` the minimum distance needed to lie inside `area`.
pub fn clamp_into(r: Rect, area: Rect) -> Rect {
    Rect { x: clamp_axis(r.x, r.w, area.x, area.right()), y: clamp_axis(r.y, r.h, area.y, area.bottom()), ..r }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Placement {
    pub window: Rect,
    /// Pill offset inside the window (physical px).
    pub pill_dx: f64,
    pub pill_dy: f64,
    /// Where the pill ended up (new anchor).
    pub anchor_x: f64,
    pub anchor_y: f64,
}

/// * `anchor` – current pill top-left.
/// * `pill` – pill size.
/// * `window` – requested window size; `(dx, dy)` – requested pill offset.
pub fn place(anchor: (f64, f64), pill: (f64, f64), window: (f64, f64), offset: (f64, f64), area: Rect) -> Placement {
    // 1. The pill itself must be fully visible.
    let pill_r = clamp_into(Rect { x: anchor.0, y: anchor.1, w: pill.0, h: pill.1 }, area);
    // 2. Place the window around it, then clamp the window.
    let want = Rect { x: pill_r.x - offset.0, y: pill_r.y - offset.1, w: window.0, h: window.1 };
    let win = clamp_into(want, area);
    // 3. Keep the pill where it is if the window still contains it; otherwise
    //    shift the pill with the window.
    let px = pill_r.x.max(win.x).min(win.right() - pill.0);
    let py = pill_r.y.max(win.y).min(win.bottom() - pill.1);
    Placement { window: win, pill_dx: px - win.x, pill_dy: py - win.y, anchor_x: px, anchor_y: py }
}

/// Pick the monitor that contains the point, else the nearest one by centre
/// distance, else `None` when there are no monitors.
pub fn monitor_for_point(monitors: &[MonitorInfo], x: f64, y: f64) -> Option<&MonitorInfo> {
    if let Some(m) = monitors.iter().find(|m| m.contains(x, y)) {
        return Some(m);
    }
    monitors.iter().min_by(|a, b| {
        let da = dist2(a, x, y);
        let db = dist2(b, x, y);
        da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
    })
}

fn dist2(m: &MonitorInfo, x: f64, y: f64) -> f64 {
    let cx = m.x as f64 + m.width as f64 / 2.0;
    let cy = m.y as f64 + m.height as f64 / 2.0;
    (cx - x).powi(2) + (cy - y).powi(2)
}

/// Default anchor: left edge of the primary monitor's work area, a quarter
/// of the way down.
pub fn default_anchor(monitors: &[MonitorInfo]) -> (f64, f64) {
    let m = monitors.iter().find(|m| m.primary).or_else(|| monitors.first());
    match m {
        Some(m) => {
            let a = work_area(m);
            (a.x + 16.0 * m.scale, a.y + a.h * 0.22)
        }
        None => (16.0, 200.0),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::monitor::tests::mon;

    fn area() -> Rect {
        Rect { x: 0.0, y: 0.0, w: 1920.0, h: 1032.0 }
    }

    #[test]
    fn pill_stays_put_when_popover_fits() {
        let p = place((100.0, 200.0), (56.0, 400.0), (400.0, 400.0), (0.0, 0.0), area());
        assert_eq!((p.anchor_x, p.anchor_y), (100.0, 200.0));
        assert_eq!(p.window, Rect { x: 100.0, y: 200.0, w: 400.0, h: 400.0 });
    }

    #[test]
    fn window_shifts_at_the_right_edge_but_pill_stays() {
        // Pill near right edge, popover requested to the right of it.
        let p = place((1850.0, 200.0), (56.0, 400.0), (400.0, 400.0), (0.0, 0.0), area());
        assert_eq!(p.window.right(), 1920.0);
        assert_eq!((p.anchor_x, p.anchor_y), (1850.0, 200.0));
        assert_eq!(p.pill_dx, 1850.0 - p.window.x);
    }

    #[test]
    fn offscreen_anchor_is_pulled_back_in() {
        let p = place((5000.0, -300.0), (56.0, 400.0), (56.0, 400.0), (0.0, 0.0), area());
        assert_eq!((p.anchor_x, p.anchor_y), (1920.0 - 56.0, 0.0));
    }

    #[test]
    fn oversized_window_aligns_top_left_and_keeps_pill_visible() {
        let p = place((10.0, 10.0), (56.0, 400.0), (4000.0, 3000.0), (0.0, 0.0), area());
        assert_eq!(p.window.x, 0.0);
        assert_eq!(p.window.y, 0.0);
        assert!(p.anchor_x >= 0.0 && p.anchor_x + 56.0 <= 1920.0);
    }

    #[test]
    fn negative_coordinate_monitor() {
        let a = Rect { x: -2560.0, y: -200.0, w: 2560.0, h: 1368.0 };
        // x = -60 already fits (ends at -4); only y must move down into the area.
        let p = place((-60.0, -500.0), (56.0, 400.0), (56.0, 400.0), (0.0, 0.0), a);
        assert_eq!((p.anchor_x, p.anchor_y), (-60.0, -200.0));
        // Partly beyond the right edge (x = -20 would end at +36): pulled left.
        let p = place((-20.0, 0.0), (56.0, 400.0), (56.0, 400.0), (0.0, 0.0), a);
        assert_eq!(p.anchor_x, -56.0);
    }

    #[test]
    fn nearest_monitor_fallback_and_default_anchor() {
        let ms = vec![mon("A", 0, 0, 1920, 1080, 1.0), mon("B", 1920, 0, 2560, 1440, 1.5)];
        assert_eq!(monitor_for_point(&ms, 2000.0, 10.0).unwrap().key, "B");
        assert_eq!(monitor_for_point(&ms, 99999.0, 10.0).unwrap().key, "B");
        assert!(monitor_for_point(&[], 0.0, 0.0).is_none());
        let (x, _y) = default_anchor(&ms);
        assert_eq!(x, 16.0);
    }
}
