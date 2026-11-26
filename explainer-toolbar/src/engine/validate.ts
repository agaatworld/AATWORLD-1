import { newId, type Board, type Dash, type SceneDoc, type SceneObj } from "./model";

/**
 * Defensive loading of scene files. A malformed or hostile file must never
 * crash the overlay: invalid objects are dropped (and counted), numbers are
 * clamped to sane ranges, strings are length-limited, ids de-duplicated.
 */

const MAX_OBJECTS = 50_000;
const MAX_POINTS = 120_000; // numbers per stroke (40k points)
const MAX_TEXT = 20_000;
const LIMIT = 1_000_000; // coordinate magnitude limit (device px)

const COLOR_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function isColor(v: unknown): v is string {
  return typeof v === "string" && COLOR_RE.test(v);
}

const num = (v: unknown, lo: number, hi: number, d: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
const coord = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= LIMIT ? v : null);
const bool = (v: unknown, d = false): boolean => (typeof v === "boolean" ? v : d);
const color = (v: unknown, d: string): string => (isColor(v) ? v : d);
const dash = (v: unknown): Dash => (v === "dash" || v === "dot" ? v : "solid");
const str = (v: unknown, max: number): string | null => (typeof v === "string" ? v.slice(0, max) : null);

function flat(v: unknown, stride: number): number[] | null {
  if (!Array.isArray(v) || v.length < stride || v.length > MAX_POINTS) return null;
  const out: number[] = [];
  for (let i = 0; i + stride - 1 < v.length; i += stride) {
    const x = coord(v[i]);
    const y = coord(v[i + 1]);
    if (x === null || y === null) return null;
    out.push(x, y);
    if (stride === 3) out.push(num(v[i + 2], 0, 1, 0.5));
  }
  return out;
}

export function sanitizeObject(raw: unknown): SceneObj | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" && r.id.length > 0 && r.id.length <= 80 ? r.id : newId();
  const locked = bool(r.locked);
  switch (r.kind) {
    case "stroke": {
      const pts = flat(r.pts, 3);
      if (!pts) return null;
      return {
        id,
        locked,
        kind: "stroke",
        tool: r.tool === "highlighter" ? "highlighter" : "pen",
        pts,
        color: color(r.color, "#ff5a36"),
        width: num(r.width, 0.5, 400, 4),
        opacity: num(r.opacity, 0.02, 1, 1),
        dash: dash(r.dash),
        pressure: bool(r.pressure),
      };
    }
    case "erase": {
      const pts = flat(r.pts, 2);
      if (!pts) return null;
      return { id, locked: false, kind: "erase", pts, width: num(r.width, 1, 2000, 30) };
    }
    case "shape": {
      const s = r.shape;
      if (s !== "rect" && s !== "ellipse" && s !== "line" && s !== "arrow") return null;
      const x1 = coord(r.x1), y1 = coord(r.y1), x2 = coord(r.x2), y2 = coord(r.y2);
      if (x1 === null || y1 === null || x2 === null || y2 === null) return null;
      const boxy = s === "rect" || s === "ellipse";
      return {
        id,
        locked,
        kind: "shape",
        shape: s,
        x1: boxy ? Math.min(x1, x2) : x1,
        y1: boxy ? Math.min(y1, y2) : y1,
        x2: boxy ? Math.max(x1, x2) : x2,
        y2: boxy ? Math.max(y1, y2) : y2,
        color: color(r.color, "#ff5a36"),
        width: num(r.width, 0.5, 400, 4),
        opacity: num(r.opacity, 0.02, 1, 1),
        dash: dash(r.dash),
        fill: r.fill === null || r.fill === undefined ? null : isColor(r.fill) ? r.fill : null,
        fillOpacity: num(r.fillOpacity, 0, 1, 0.25),
        rotation: boxy ? num(r.rotation, -Math.PI * 2, Math.PI * 2, 0) : 0,
        radius: num(r.radius, 0, 10_000, 0),
        heads: r.heads === "both" ? "both" : "end",
      };
    }
    case "text": {
      const text = str(r.text, MAX_TEXT);
      const x = coord(r.x), y = coord(r.y);
      if (text === null || text.length === 0 || x === null || y === null) return null;
      return {
        id,
        locked,
        kind: "text",
        x,
        y,
        text,
        font: (str(r.font, 120) ?? "Segoe UI").replace(/[^\p{L}\p{N} _.-]/gu, "") || "Segoe UI",
        size: num(r.size, 4, 2000, 32),
        bold: bool(r.bold),
        italic: bool(r.italic),
        color: color(r.color, "#ffffff"),
        opacity: num(r.opacity, 0.02, 1, 1),
        align: r.align === "center" || r.align === "end" ? r.align : "start",
        dir: r.dir === "ltr" || r.dir === "rtl" ? r.dir : "auto",
        background: isColor(r.background) ? r.background : null,
        rotation: num(r.rotation, -Math.PI * 2, Math.PI * 2, 0),
        w: num(r.w, 1, LIMIT, 10),
        h: num(r.h, 1, LIMIT, 10),
      };
    }
    case "marker": {
      const x = coord(r.x), y = coord(r.y);
      if (x === null || y === null) return null;
      return {
        id,
        locked,
        kind: "marker",
        x,
        y,
        n: Math.round(num(r.n, 0, 9999, 1)),
        size: num(r.size, 4, 1000, 22),
        color: color(r.color, "#ff5a36"),
        opacity: num(r.opacity, 0.02, 1, 1),
      };
    }
    case "image": {
      const asset = typeof r.asset === "string" && /^[a-f0-9]{16,64}\.(png|jpg|gif|webp|bmp)$/.test(r.asset) ? r.asset : null;
      const x = coord(r.x), y = coord(r.y), w = coord(r.w), h = coord(r.h);
      if (!asset || x === null || y === null || w === null || h === null || w <= 0 || h <= 0) return null;
      return {
        id,
        locked,
        kind: "image",
        asset,
        x,
        y,
        w,
        h,
        rotation: num(r.rotation, -Math.PI * 2, Math.PI * 2, 0),
        flipX: bool(r.flipX),
        flipY: bool(r.flipY),
        opacity: num(r.opacity, 0.02, 1, 1),
      };
    }
    default:
      return null;
  }
}

export interface SanitizeResult {
  doc: SceneDoc;
  dropped: number;
}

export function emptyScene(): SceneDoc {
  return { format: "explainer-scene", version: 1, background: "none", objects: [] };
}

export function sanitizeScene(raw: unknown): SanitizeResult {
  const doc = emptyScene();
  if (!raw || typeof raw !== "object") return { doc, dropped: 0 };
  const r = raw as Record<string, unknown>;
  const bg = r.background;
  doc.background = (bg === "whiteboard" || bg === "blackboard" ? bg : "none") as Board;
  const m = r.monitor as Record<string, unknown> | undefined;
  if (m && typeof m === "object" && typeof m.key === "string") {
    doc.monitor = { key: m.key.slice(0, 80), width: num(m.width, 1, 100000, 1920), height: num(m.height, 1, 100000, 1080), scale: num(m.scale, 0.5, 8, 1) };
  }
  const list = Array.isArray(r.objects) ? r.objects : [];
  let dropped = 0;
  const seen = new Set<string>();
  for (const item of list.slice(0, MAX_OBJECTS)) {
    const o = sanitizeObject(item);
    if (!o) {
      dropped++;
      continue;
    }
    if (seen.has(o.id)) o.id = newId();
    seen.add(o.id);
    doc.objects.push(o);
  }
  dropped += Math.max(0, list.length - MAX_OBJECTS);
  return { doc, dropped };
}

/** Parse JSON text safely. */
export function parseScene(text: string | null | undefined): SanitizeResult {
  if (!text) return { doc: emptyScene(), dropped: 0 };
  try {
    return sanitizeScene(JSON.parse(text));
  } catch {
    return { doc: emptyScene(), dropped: 1 };
  }
}
