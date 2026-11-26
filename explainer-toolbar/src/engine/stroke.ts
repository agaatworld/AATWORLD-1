import { getStroke } from "perfect-freehand";
import type { StrokeObj } from "./model";

/**
 * Stroke outline generation. Solid pen/highlighter strokes are filled
 * polygons from perfect-freehand (MIT): pressure-aware variable width with
 * streamline stabilisation. Mouse input gets gentle simulated pressure so
 * handwriting still looks natural; the highlighter is constant width.
 */

export interface StrokeTuning {
  /** 0..1 – how strongly the line is stabilised (lags behind the pointer). */
  smoothing: number;
}

export function outlineFor(o: StrokeObj, tuning: StrokeTuning = { smoothing: 0.5 }): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i + 2 < o.pts.length; i += 3) pts.push([o.pts[i], o.pts[i + 1], o.pts[i + 2]]);
  const hl = o.tool === "highlighter";
  const s = Math.min(1, Math.max(0, tuning.smoothing));
  return getStroke(pts, {
    size: o.width,
    thinning: hl ? 0 : o.pressure ? 0.6 : 0.28,
    smoothing: 0.5 + s * 0.3,
    streamline: 0.25 + s * 0.5,
    simulatePressure: !hl && !o.pressure,
    start: { cap: true, taper: 0 },
    end: { cap: true, taper: 0 },
    last: true,
  });
}

/** Closed SVG-style path ("M … Q … Z") through outline midpoints. */
export function outlineToPath(outline: number[][]): string {
  const n = outline.length;
  if (n === 0) return "";
  if (n < 3) {
    const [x, y] = outline[0];
    return `M ${x} ${y} Z`;
  }
  const f = (v: number) => v.toFixed(2);
  let d = `M ${f(outline[0][0])} ${f(outline[0][1])} Q`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % n];
    d += ` ${f(x0)} ${f(y0)} ${f((x0 + x1) / 2)} ${f((y0 + y1) / 2)}`;
  }
  return d + " Z";
}

/** Smoothed centre-line path for dashed/dotted strokes (constant width). */
export function centerlinePath(o: { pts: number[] }, stride: number): string {
  const p = o.pts;
  const n = Math.floor(p.length / stride);
  if (n === 0) return "";
  if (n === 1) return `M ${p[0]} ${p[1]} L ${p[0] + 0.01} ${p[1]}`;
  let d = `M ${p[0]} ${p[1]}`;
  for (let i = 1; i < n - 1; i++) {
    const x = p[i * stride];
    const y = p[i * stride + 1];
    const nx = p[(i + 1) * stride];
    const ny = p[(i + 1) * stride + 1];
    d += ` Q ${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`;
  }
  d += ` L ${p[(n - 1) * stride]} ${p[(n - 1) * stride + 1]}`;
  return d;
}

/** Drop points closer than `minDist` to the previous kept point. */
export function appendPoint(pts: number[], x: number, y: number, p: number, minDist: number): boolean {
  const n = pts.length;
  if (n >= 3) {
    const dx = x - pts[n - 3];
    const dy = y - pts[n - 2];
    if (dx * dx + dy * dy < minDist * minDist) return false;
  }
  pts.push(x, y, p);
  return true;
}
