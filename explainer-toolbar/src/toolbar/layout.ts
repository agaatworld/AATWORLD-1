/**
 * Toolbar window geometry (logical px). The pill sits inside a transparent
 * margin (room for its shadow). When a popover opens, the window grows to
 * the union of the pill box and the popover box; Rust keeps the pill fixed on
 * screen and only moves the window if it would leave the monitor.
 */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Space {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LayoutInput {
  pill: { w: number; h: number };
  margin: number;
  orientation: "vertical" | "horizontal";
  /** Popover size and the opener's box relative to the pill content. */
  pop: { w: number; h: number; anchor: Box } | null;
  space: Space | null;
  gap?: number;
}

export interface LayoutOutput {
  window: { w: number; h: number };
  /** Pill box (pill + margin) top-left inside the window. */
  pillBox: Box;
  /** Popover box (popover + margin) relative to the pill box. */
  popBox: Box | null;
  side: "left" | "right" | "top" | "bottom" | null;
}

export function computeLayout(i: LayoutInput): LayoutOutput {
  const m = i.margin;
  const gap = i.gap ?? 6;
  const pillBox: Box = { x: 0, y: 0, w: i.pill.w + 2 * m, h: i.pill.h + 2 * m };
  if (!i.pop) return { window: { w: pillBox.w, h: pillBox.h }, pillBox, popBox: null, side: null };
  const sp = i.space ?? { left: 9999, right: 9999, top: 9999, bottom: 9999 };
  const pw = i.pop.w + 2 * m;
  const ph = i.pop.h + 2 * m;
  let side: LayoutOutput["side"];
  let pop: Box;
  if (i.orientation === "vertical") {
    const needed = i.pop.w + gap;
    side = sp.right >= needed || sp.right >= sp.left ? "right" : "left";
    const x = side === "right" ? m + i.pill.w + gap - m : m - gap - i.pop.w - m;
    let y = m + i.pop.anchor.y - 6 - m;
    // keep inside the monitor vertically
    y = Math.min(y, pillBox.h + sp.bottom - ph);
    y = Math.max(y, -sp.top);
    pop = { x, y, w: pw, h: ph };
  } else {
    const needed = i.pop.h + gap;
    side = sp.bottom >= needed || sp.bottom >= sp.top ? "bottom" : "top";
    const y = side === "bottom" ? m + i.pill.h + gap - m : m - gap - i.pop.h - m;
    let x = m + i.pop.anchor.x - 6 - m;
    x = Math.min(x, pillBox.w + sp.right - pw);
    x = Math.max(x, -sp.left);
    pop = { x, y, w: pw, h: ph };
  }
  const minX = Math.min(0, pop.x);
  const minY = Math.min(0, pop.y);
  const maxX = Math.max(pillBox.w, pop.x + pop.w);
  const maxY = Math.max(pillBox.h, pop.y + pop.h);
  return {
    window: { w: Math.ceil(maxX - minX), h: Math.ceil(maxY - minY) },
    pillBox: { ...pillBox, x: minX < 0 ? -minX : 0, y: minY < 0 ? -minY : 0 },
    popBox: pop,
    side,
  };
}

/** Place the popover inside the actual window (after Rust may have shifted the pill). */
export function placePopover(win: { w: number; h: number }, pillAt: { x: number; y: number }, pop: Box): Box {
  const x = Math.max(0, Math.min(win.w - pop.w, pillAt.x + pop.x));
  const y = Math.max(0, Math.min(win.h - pop.h, pillAt.y + pop.y));
  return { ...pop, x, y };
}
