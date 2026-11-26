import type { MarkerObj, SceneObj, ShapeObj, StrokeObj, TextObj, ImageObj } from "../../src/engine/model";

let n = 0;
export const id = () => `t${++n}`;

export function stroke(pts: number[], width = 4, extra: Partial<StrokeObj> = {}): StrokeObj {
  const flat: number[] = [];
  for (let i = 0; i + 1 < pts.length; i += 2) flat.push(pts[i], pts[i + 1], 0.5);
  return { id: id(), kind: "stroke", tool: "pen", pts: flat, color: "#ff0000", width, opacity: 1, dash: "solid", pressure: false, ...extra };
}

export function rect(x1: number, y1: number, x2: number, y2: number, extra: Partial<ShapeObj> = {}): ShapeObj {
  return { id: id(), kind: "shape", shape: "rect", x1, y1, x2, y2, color: "#00ff00", width: 4, opacity: 1, dash: "solid", fill: null, fillOpacity: 0.3, rotation: 0, radius: 0, heads: "end", ...extra };
}

export function text(x: number, y: number, extra: Partial<TextObj> = {}): TextObj {
  return { id: id(), kind: "text", x, y, text: "Hello", font: "Segoe UI", size: 32, bold: false, italic: false, color: "#ffffff", opacity: 1, align: "start", dir: "auto", background: null, rotation: 0, w: 100, h: 40, ...extra };
}

export function marker(x: number, y: number, n = 1): MarkerObj {
  return { id: id(), kind: "marker", x, y, n, size: 20, color: "#ff5a36", opacity: 1 };
}

export function image(x: number, y: number, w: number, h: number): ImageObj {
  return { id: id(), kind: "image", asset: "0123456789abcdef0123.png", x, y, w, h, rotation: 0, flipX: false, flipY: false, opacity: 1 };
}

export function snapshot(objs: readonly SceneObj[]): string {
  return JSON.stringify(objs);
}
