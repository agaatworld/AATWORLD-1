/**
 * Scene object model.
 *
 * COORDINATE SYSTEM (see docs/COORDINATES.md): every coordinate and length
 * stored in a scene is in MONITOR-LOCAL PHYSICAL PIXELS ("device px"), with
 * (0,0) at the top-left of the monitor the overlay covers. This keeps ink at
 * the same physical place on the screen even if Windows scaling changes.
 * Tool settings (pen width, font size…) are chosen in logical px and are
 * multiplied by the device pixel ratio once, when an object is created.
 */

export type Id = string;
export type Dash = "solid" | "dash" | "dot";

interface Common {
  id: Id;
  locked?: boolean;
}

export interface StrokeObj extends Common {
  kind: "stroke";
  tool: "pen" | "highlighter";
  /** Flat [x, y, pressure, x, y, pressure, …]; pressure in 0..1. */
  pts: number[];
  color: string;
  width: number;
  opacity: number;
  dash: Dash;
  /** True when the points carry real pen pressure. */
  pressure: boolean;
}

export type ShapeKind = "rect" | "ellipse" | "line" | "arrow";

export interface ShapeObj extends Common {
  kind: "shape";
  shape: ShapeKind;
  /** rect/ellipse: box corners (normalised so x1<=x2, y1<=y2). line/arrow: endpoints. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
  dash: Dash;
  fill: string | null;
  fillOpacity: number;
  /** Radians around the box centre (rect/ellipse only; lines bake rotation into endpoints). */
  rotation: number;
  /** Rounded-corner radius for rectangles (device px). */
  radius: number;
  /** Arrow heads: "end" or "both". */
  heads: "end" | "both";
}

export interface TextObj extends Common {
  kind: "text";
  /** Top-left of the text box before rotation. */
  x: number;
  y: number;
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color: string;
  opacity: number;
  align: "start" | "center" | "end";
  dir: "auto" | "ltr" | "rtl";
  background: string | null;
  rotation: number;
  /** Measured box (device px). Recomputed whenever text or font changes. */
  w: number;
  h: number;
}

export interface MarkerObj extends Common {
  kind: "marker";
  /** Centre. */
  x: number;
  y: number;
  n: number;
  /** Radius. */
  size: number;
  color: string;
  opacity: number;
}

export interface ImageObj extends Common {
  kind: "image";
  asset: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  opacity: number;
}

/** Pixel eraser path: removes ink drawn BELOW it (destination-out). */
export interface EraseObj extends Common {
  kind: "erase";
  /** Flat [x, y, x, y, …]. */
  pts: number[];
  width: number;
}

export type SceneObj = StrokeObj | ShapeObj | TextObj | MarkerObj | ImageObj | EraseObj;
export type ObjKind = SceneObj["kind"];

export interface SceneDoc {
  format: "explainer-scene";
  version: 1;
  monitor?: { key: string; width: number; height: number; scale: number };
  background: Board;
  objects: SceneObj[];
}

export type Board = "none" | "whiteboard" | "blackboard";

let counter = 0;
export function newId(): Id {
  counter = (counter + 1) % 1e9;
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `id-${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isSelectable(o: SceneObj): boolean {
  return o.kind !== "erase";
}
