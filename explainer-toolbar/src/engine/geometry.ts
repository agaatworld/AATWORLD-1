import type { SceneObj, ShapeObj, StrokeObj, TextObj, ImageObj, MarkerObj } from "./model";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Pt {
  x: number;
  y: number;
}

export const EMPTY_RECT: Rect = { x: 0, y: 0, w: 0, h: 0 };

export function rectFromPoints(x1: number, y1: number, x2: number, y2: number): Rect {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

export function union(a: Rect | null, b: Rect | null): Rect | null {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

export function inflate(r: Rect, d: number): Rect {
  return { x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d };
}

export function intersects(a: Rect, b: Rect): boolean {
  return a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;
}

export function containsRect(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.w <= outer.x + outer.w && inner.y + inner.h <= outer.y + outer.h;
}

export function rotatePt(p: Pt, c: Pt, a: number): Pt {
  if (!a) return { x: p.x, y: p.y };
  const s = Math.sin(a);
  const k = Math.cos(a);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * k - dy * s, y: c.y + dx * s + dy * k };
}

/** Axis-aligned bounds of a box rotated around its centre. */
export function rotatedBounds(r: Rect, a: number): Rect {
  if (!a) return { ...r };
  const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  const pts = [
    rotatePt({ x: r.x, y: r.y }, c, a),
    rotatePt({ x: r.x + r.w, y: r.y }, c, a),
    rotatePt({ x: r.x + r.w, y: r.y + r.h }, c, a),
    rotatePt({ x: r.x, y: r.y + r.h }, c, a),
  ];
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function pointsBounds(pts: number[], stride: number): Rect {
  if (pts.length < stride) return { ...EMPTY_RECT };
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (let i = 0; i + 1 < pts.length; i += stride) {
    const x = pts[i];
    const y = pts[i + 1];
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function shapeBox(o: ShapeObj): Rect {
  return rectFromPoints(o.x1, o.y1, o.x2, o.y2);
}

export function textBox(o: TextObj): Rect {
  return { x: o.x, y: o.y, w: o.w, h: o.h };
}

export function imageBox(o: ImageObj): Rect {
  return { x: o.x, y: o.y, w: o.w, h: o.h };
}

export function markerBox(o: MarkerObj): Rect {
  return { x: o.x - o.size, y: o.y - o.size, w: o.size * 2, h: o.size * 2 };
}

/** The unrotated box an object occupies (used for selection frames). */
export function localBox(o: SceneObj): Rect {
  switch (o.kind) {
    case "stroke":
      return pointsBounds(o.pts, 3);
    case "erase":
      return pointsBounds(o.pts, 2);
    case "shape":
      return shapeBox(o);
    case "text":
      return textBox(o);
    case "image":
      return imageBox(o);
    case "marker":
      return markerBox(o);
  }
}

export function rotationOf(o: SceneObj): number {
  return o.kind === "shape" || o.kind === "text" || o.kind === "image" ? o.rotation : 0;
}

/** Conservative axis-aligned bounds including stroke width (for redraw/culling). */
export function bounds(o: SceneObj): Rect {
  switch (o.kind) {
    case "stroke":
      return inflate(pointsBounds(o.pts, 3), o.width + 2);
    case "erase":
      return inflate(pointsBounds(o.pts, 2), o.width / 2 + 2);
    case "shape": {
      const pad = o.width * (o.shape === "arrow" ? 3 : 1) + 2;
      if (o.shape === "line" || o.shape === "arrow") return inflate(shapeBox(o), pad);
      return inflate(rotatedBounds(shapeBox(o), o.rotation), pad);
    }
    case "text":
      return inflate(rotatedBounds(textBox(o), o.rotation), 2);
    case "image":
      return inflate(rotatedBounds(imageBox(o), o.rotation), 1);
    case "marker":
      return inflate(markerBox(o), 3);
  }
}

function strokeHit(o: StrokeObj, x: number, y: number, tol: number): boolean {
  const r = o.width / 2 + tol;
  const p = o.pts;
  if (p.length < 3) return false;
  if (p.length === 3) return Math.hypot(p[0] - x, p[1] - y) <= r;
  for (let i = 0; i + 5 < p.length; i += 3) {
    if (distToSegment(x, y, p[i], p[i + 1], p[i + 3], p[i + 4]) <= r) return true;
  }
  return false;
}

function shapeHit(o: ShapeObj, x: number, y: number, tol: number): boolean {
  const half = o.width / 2 + tol;
  if (o.shape === "line" || o.shape === "arrow") {
    return distToSegment(x, y, o.x1, o.y1, o.x2, o.y2) <= half + (o.shape === "arrow" ? o.width : 0);
  }
  const b = shapeBox(o);
  const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const p = rotatePt({ x, y }, c, -o.rotation);
  if (o.shape === "rect") {
    const inside = p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
    if (inside && o.fill) return true;
    const dx = Math.max(b.x - p.x, 0, p.x - (b.x + b.w));
    const dy = Math.max(b.y - p.y, 0, p.y - (b.y + b.h));
    const outside = Math.hypot(dx, dy);
    if (!inside) return outside <= half;
    const edge = Math.min(p.x - b.x, b.x + b.w - p.x, p.y - b.y, b.y + b.h - p.y);
    return edge <= half;
  }
  // ellipse: compare normalised radius against the stroke band
  const rx = Math.max(b.w / 2, 0.5);
  const ry = Math.max(b.h / 2, 0.5);
  const nx = (p.x - c.x) / rx;
  const ny = (p.y - c.y) / ry;
  const d = Math.hypot(nx, ny);
  if (o.fill && d <= 1) return true;
  const approxDist = Math.abs(d - 1) * Math.min(rx, ry);
  return approxDist <= half;
}

function boxHit(b: Rect, rot: number, x: number, y: number, tol: number): boolean {
  const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const p = rotatePt({ x, y }, c, -rot);
  return p.x >= b.x - tol && p.x <= b.x + b.w + tol && p.y >= b.y - tol && p.y <= b.y + b.h + tol;
}

/** Precise hit test at (x, y) with tolerance `tol` (device px). */
export function hitTest(o: SceneObj, x: number, y: number, tol: number): boolean {
  switch (o.kind) {
    case "stroke":
      return strokeHit(o, x, y, tol);
    case "shape":
      return shapeHit(o, x, y, tol);
    case "text":
      return boxHit(textBox(o), o.rotation, x, y, tol);
    case "image":
      return boxHit(imageBox(o), o.rotation, x, y, tol);
    case "marker":
      return Math.hypot(o.x - x, o.y - y) <= o.size + tol;
    case "erase":
      return false;
  }
}

/** Does the eraser segment a→b with radius r touch the object? */
export function segmentTouches(o: SceneObj, ax: number, ay: number, bx: number, by: number, r: number): boolean {
  const len = Math.hypot(bx - ax, by - ay);
  const steps = Math.max(1, Math.ceil(len / Math.max(1, r / 2)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (hitTest(o, ax + (bx - ax) * t, ay + (by - ay) * t, r)) return true;
  }
  return false;
}

export function snapAngle(dx: number, dy: number, stepDeg: number): { dx: number; dy: number } {
  const len = Math.hypot(dx, dy);
  const step = (stepDeg * Math.PI) / 180;
  const a = Math.round(Math.atan2(dy, dx) / step) * step;
  return { dx: Math.cos(a) * len, dy: Math.sin(a) * len };
}
