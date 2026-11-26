import { localBox, rotatePt, rotationOf, type Pt, type Rect } from "./geometry";
import type { SceneObj } from "./model";

/** Translate any object by (dx, dy). Returns a new object. */
export function translate(o: SceneObj, dx: number, dy: number): SceneObj {
  switch (o.kind) {
    case "stroke": {
      const pts = o.pts.slice();
      for (let i = 0; i + 1 < pts.length; i += 3) {
        pts[i] += dx;
        pts[i + 1] += dy;
      }
      return { ...o, pts };
    }
    case "erase": {
      const pts = o.pts.slice();
      for (let i = 0; i + 1 < pts.length; i += 2) {
        pts[i] += dx;
        pts[i + 1] += dy;
      }
      return { ...o, pts };
    }
    case "shape":
      return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
    case "text":
    case "image":
    case "marker":
      return { ...o, x: o.x + dx, y: o.y + dy };
  }
}

function mapPt(p: Pt, origin: Pt, sx: number, sy: number): Pt {
  return { x: origin.x + (p.x - origin.x) * sx, y: origin.y + (p.y - origin.y) * sy };
}

/**
 * Scale about `origin`. Unrotated objects scale exactly per axis; rotated
 * boxes keep their aspect and use the geometric mean so they never shear.
 */
export function scale(o: SceneObj, origin: Pt, sx: number, sy: number): SceneObj {
  const uniform = Math.sqrt(Math.abs(sx * sy)) || 1;
  switch (o.kind) {
    case "stroke": {
      const pts = o.pts.slice();
      for (let i = 0; i + 1 < pts.length; i += 3) {
        const p = mapPt({ x: pts[i], y: pts[i + 1] }, origin, sx, sy);
        pts[i] = p.x;
        pts[i + 1] = p.y;
      }
      return { ...o, pts, width: Math.max(0.5, o.width * Math.min(uniform, 8)) };
    }
    case "erase":
      return o;
    case "shape": {
      if (o.shape === "line" || o.shape === "arrow" || !o.rotation) {
        const a = mapPt({ x: o.x1, y: o.y1 }, origin, sx, sy);
        const b = mapPt({ x: o.x2, y: o.y2 }, origin, sx, sy);
        if (o.shape === "line" || o.shape === "arrow") return { ...o, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
        return { ...o, x1: Math.min(a.x, b.x), y1: Math.min(a.y, b.y), x2: Math.max(a.x, b.x), y2: Math.max(a.y, b.y) };
      }
      const r = localBox(o);
      const c = mapPt({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, origin, sx, sy);
      const w = r.w * uniform;
      const h = r.h * uniform;
      return { ...o, x1: c.x - w / 2, y1: c.y - h / 2, x2: c.x + w / 2, y2: c.y + h / 2 };
    }
    case "text": {
      const r = localBox(o);
      const k = o.rotation ? uniform : Math.abs(sy) || 1;
      const c = mapPt({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, origin, sx, sy);
      const w = r.w * k;
      const h = r.h * k;
      return { ...o, size: Math.max(4, o.size * k), x: c.x - w / 2, y: c.y - h / 2, w, h };
    }
    case "image": {
      const r = localBox(o);
      const c = mapPt({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, origin, sx, sy);
      const w = Math.max(4, r.w * (o.rotation ? uniform : Math.abs(sx)));
      const h = Math.max(4, r.h * (o.rotation ? uniform : Math.abs(sy)));
      return { ...o, x: c.x - w / 2, y: c.y - h / 2, w, h, flipX: sx < 0 ? !o.flipX : o.flipX, flipY: sy < 0 ? !o.flipY : o.flipY };
    }
    case "marker": {
      const c = mapPt({ x: o.x, y: o.y }, origin, sx, sy);
      return { ...o, x: c.x, y: c.y, size: Math.max(6, o.size * uniform) };
    }
  }
}

/** Rotate around `center` by `a` radians. */
export function rotate(o: SceneObj, center: Pt, a: number): SceneObj {
  switch (o.kind) {
    case "stroke": {
      const pts = o.pts.slice();
      for (let i = 0; i + 1 < pts.length; i += 3) {
        const p = rotatePt({ x: pts[i], y: pts[i + 1] }, center, a);
        pts[i] = p.x;
        pts[i + 1] = p.y;
      }
      return { ...o, pts };
    }
    case "erase":
      return o;
    case "shape": {
      if (o.shape === "line" || o.shape === "arrow") {
        const p = rotatePt({ x: o.x1, y: o.y1 }, center, a);
        const q = rotatePt({ x: o.x2, y: o.y2 }, center, a);
        return { ...o, x1: p.x, y1: p.y, x2: q.x, y2: q.y };
      }
      const r = localBox(o);
      const c = rotatePt({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, center, a);
      return { ...o, x1: c.x - r.w / 2, y1: c.y - r.h / 2, x2: c.x + r.w / 2, y2: c.y + r.h / 2, rotation: normAngle(o.rotation + a) };
    }
    case "text":
    case "image": {
      const r = localBox(o);
      const c = rotatePt({ x: r.x + r.w / 2, y: r.y + r.h / 2 }, center, a);
      return { ...o, x: c.x - r.w / 2, y: c.y - r.h / 2, rotation: normAngle(rotationOf(o) + a) };
    }
    case "marker": {
      const c = rotatePt({ x: o.x, y: o.y }, center, a);
      return { ...o, x: c.x, y: c.y };
    }
  }
}

export function normAngle(a: number): number {
  const t = Math.PI * 2;
  let r = a % t;
  if (r > Math.PI) r -= t;
  if (r < -Math.PI) r += t;
  return Math.abs(r) < 1e-9 ? 0 : r;
}

/** Axis-aligned frame around a selection (unrotated boxes, then rotated bounds). */
export function selectionFrame(objs: readonly SceneObj[]): Rect | null {
  let r: Rect | null = null;
  for (const o of objs) {
    const lb = localBox(o);
    const rot = rotationOf(o);
    const b = rot ? rotatedAabb(lb, rot) : lb;
    r = r ? unionRect(r, b) : b;
  }
  return r;
}

function rotatedAabb(r: Rect, a: number): Rect {
  const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  const ps = [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x, y: r.y + r.h },
  ].map((p) => rotatePt(p, c, a));
  const x = Math.min(...ps.map((p) => p.x));
  const y = Math.min(...ps.map((p) => p.y));
  return { x, y, w: Math.max(...ps.map((p) => p.x)) - x, h: Math.max(...ps.map((p) => p.y)) - y };
}

function unionRect(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}
