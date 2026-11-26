import { bounds, hitTest, inflate, intersects, rectFromPoints, segmentTouches, snapAngle, union, type Pt, type Rect } from "./geometry";
import { History, type Action } from "./history";
import { isSelectable, newId, type Board, type Dash, type ImageObj, type MarkerObj, type SceneDoc, type SceneObj, type ShapeObj, type StrokeObj, type TextObj } from "./model";
import { drawObject, type Ctx, type RenderEnv } from "./render";
import { Scene, type Change } from "./scene";
import { appendPoint } from "./stroke";
import { approxMeasure, fontString, measureText } from "./text";
import { rotate, scale, selectionFrame, translate } from "./transform";

export type ToolId =
  | "select"
  | "pen"
  | "highlighter"
  | "laser"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "marker"
  | "eraser"
  | "pixelEraser";

/** Style for the active tool, in LOGICAL px (converted with dpr on creation). */
export interface ToolStyle {
  color: string;
  width: number;
  opacity: number;
  fill: string | null;
  fillOpacity: number;
  dash: Dash;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  textBackground: string | null;
  align: TextObj["align"];
  markerSize: number;
  heads: ShapeObj["heads"];
  radius: number;
  smoothing: number;
  pressure: boolean;
  eraserSize: number;
}

export interface PointerSample {
  x: number; // device px
  y: number;
  pressure: number;
  type: "mouse" | "pen" | "touch";
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  time: number;
}

export interface TextEdit {
  /** Existing object being edited, or null for a new text. */
  id: string | null;
  draft: TextObj;
}

export type EditorEvent =
  | { type: "committed"; label: string }
  | { type: "changed" }
  | { type: "selection"; ids: string[] }
  | { type: "textedit"; edit: TextEdit | null }
  | { type: "cursor"; cursor: string };

export interface EditorHost {
  base: Ctx | null;
  live: Ctx | null;
  raf(cb: () => void): void;
  now(): number;
  emit(e: EditorEvent): void;
  accent: string;
}

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "rot";

type Gesture =
  | { kind: "stroke"; obj: StrokeObj; straight: Pt | null }
  | { kind: "shape"; start: Pt; cur: Pt; shift: boolean; alt: boolean }
  | { kind: "move"; start: Pt; dx: number; dy: number; orig: SceneObj[]; shift: boolean }
  | { kind: "resize"; handle: Handle; frame: Rect; orig: SceneObj[]; cur: Pt; shift: boolean }
  | { kind: "rotate"; center: Pt; a0: number; a: number; orig: SceneObj[]; shift: boolean }
  | { kind: "marquee"; start: Pt; cur: Pt; additive: boolean; base: Set<string> }
  | { kind: "erase"; last: Pt; hit: Set<string> }
  | { kind: "pixelErase"; pts: number[] }
  | { kind: "laser" };

const CURSORS: Record<Handle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  rot: "grab",
};

export const DEFAULT_STYLE: ToolStyle = {
  color: "#ff5a36",
  width: 4,
  opacity: 1,
  fill: null,
  fillOpacity: 0.25,
  dash: "solid",
  font: "Segoe UI",
  fontSize: 28,
  bold: true,
  italic: false,
  textBackground: null,
  align: "start",
  markerSize: 18,
  heads: "end",
  radius: 0,
  smoothing: 0.5,
  pressure: true,
  eraserSize: 28,
};

/**
 * The drawing controller for ONE overlay (one monitor). Framework-free and
 * testable without a canvas (pass null contexts). Two layers:
 *  - base: committed ink, updated incrementally or by clipped region redraw;
 *  - live: the gesture in progress, selection handles, laser, eraser ring.
 * Pointer events only update state; drawing happens once per animation frame.
 */
export class Editor {
  readonly scene = new Scene();
  readonly history = new History(300);
  private tool: ToolId = "pen";
  private style: ToolStyle = { ...DEFAULT_STYLE };
  private dpr = 1;
  private width = 0;
  private height = 0;
  private gesture: Gesture | null = null;
  private selection = new Set<string>();
  private hidden = new Set<string>();
  private editing: TextEdit | null = null;
  private laser: { x: number; y: number; t: number }[] = [];
  private laserDown = false;
  private hover: Pt | null = null;
  private frameQueued = false;
  private liveDirty: Rect | null = null;
  private lastClick: { id: string; t: number } | null = null;
  private board: Board = "none";
  private cursor = "";
  readonly env: RenderEnv;

  constructor(
    private readonly host: EditorHost,
    env: Partial<RenderEnv> = {},
  ) {
    this.env = {
      image: env.image ?? (() => null),
      missing: env.missing ?? (() => false),
      smoothing: env.smoothing ?? 0.5,
      dpr: 1,
    };
  }

  // ───────────────────────── configuration ─────────────────────────

  resize(width: number, height: number, dpr: number): void {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.dpr = dpr > 0 && Number.isFinite(dpr) ? dpr : 1;
    this.env.dpr = this.dpr;
    this.redrawBase(null);
    this.liveDirty = { x: 0, y: 0, w: this.width, h: this.height };
    this.requestFrame();
  }

  get size(): { width: number; height: number; dpr: number } {
    return { width: this.width, height: this.height, dpr: this.dpr };
  }

  setTool(tool: ToolId, style: Partial<ToolStyle> = {}): void {
    if (tool !== this.tool) {
      this.cancelGesture();
      if (tool !== "select") this.deselect();
    }
    this.tool = tool;
    this.style = { ...DEFAULT_STYLE, ...this.style, ...style };
    this.env.smoothing = this.style.smoothing;
    this.updateCursor();
    this.requestFrame();
  }

  get activeTool(): ToolId {
    return this.tool;
  }

  setBoard(b: Board): void {
    this.board = b;
    this.host.emit({ type: "changed" });
  }
  get background(): Board {
    return this.board;
  }

  /** Re-render after an image finished loading. */
  invalidateAsset(asset: string): void {
    let dirty: Rect | null = null;
    for (const o of this.scene.objects) if (o.kind === "image" && o.asset === asset) dirty = union(dirty, bounds(o));
    if (dirty) this.redrawBase(dirty);
  }

  // ───────────────────────── persistence ─────────────────────────

  load(doc: SceneDoc): void {
    this.cancelGesture();
    this.scene.reset(doc.objects);
    this.history.clear();
    this.selection.clear();
    this.hidden.clear();
    this.board = doc.background;
    this.redrawBase(null);
    this.emitSelection();
    this.host.emit({ type: "changed" });
  }

  serialize(monitor?: SceneDoc["monitor"]): SceneDoc {
    return { format: "explainer-scene", version: 1, monitor, background: this.board, objects: [...this.scene.objects] };
  }

  get hasContent(): boolean {
    return this.board !== "none" || this.scene.objects.some((o) => o.kind !== "erase");
  }

  // ───────────────────────── history ─────────────────────────

  private commit(label: string, changes: Change[], fastAdd = false): void {
    if (changes.length === 0) return;
    const dirty = this.scene.apply(changes, "after");
    const action: Action = { label, changes, time: this.host.now() };
    this.history.push(action);
    if (fastAdd && this.host.base) {
      for (const c of changes) if (c.after) drawObject(this.host.base, c.after.obj, this.env);
    } else if (dirty) {
      this.redrawBase(dirty);
    }
    this.pruneSelection();
    this.host.emit({ type: "committed", label });
    this.host.emit({ type: "changed" });
  }

  undo(): boolean {
    this.cancelGesture();
    this.finishTextEdit(true);
    const a = this.history.popUndo();
    if (!a) return false;
    const dirty = this.scene.apply(a.changes, "before");
    if (dirty) this.redrawBase(dirty);
    this.pruneSelection();
    this.host.emit({ type: "changed" });
    return true;
  }

  redo(): boolean {
    this.cancelGesture();
    this.finishTextEdit(true);
    const a = this.history.popRedo();
    if (!a) return false;
    const dirty = this.scene.apply(a.changes, "after");
    if (dirty) this.redrawBase(dirty);
    this.pruneSelection();
    this.host.emit({ type: "changed" });
    return true;
  }

  clearRedo(): void {
    this.history.clearRedo();
  }

  /** Remove everything (one undoable step). Returns false if already empty. */
  clearAll(): boolean {
    this.cancelGesture();
    this.finishTextEdit(true);
    if (this.scene.length === 0) return false;
    const changes: Change[] = this.scene.objects.map((obj, index) => ({ id: obj.id, before: { obj, index }, after: null }));
    this.commit("Clear all", changes);
    this.redrawBase(null);
    return true;
  }

  // ───────────────────────── selection ─────────────────────────

  get selectedIds(): string[] {
    return [...this.selection].filter((id) => this.scene.has(id));
  }
  selected(): SceneObj[] {
    return this.selectedIds.map((id) => this.scene.get(id)!).filter(Boolean);
  }
  /** Frame around the selection in device px (null when nothing selected). */
  selectionFrame(): Rect | null {
    const s = this.selected();
    return s.length ? selectionFrame(s) : null;
  }

  select(ids: string[]): void {
    this.selection = new Set(ids.filter((id) => this.scene.has(id) && isSelectable(this.scene.get(id)!)));
    this.emitSelection();
    this.requestFrame();
  }

  selectAll(): void {
    if (this.tool !== "select") this.tool = "select";
    this.select(this.scene.objects.filter(isSelectable).map((o) => o.id));
  }

  deselect(): void {
    if (this.selection.size === 0) return;
    this.selection.clear();
    this.emitSelection();
    this.requestFrame();
  }

  private pruneSelection(): void {
    const before = this.selection.size;
    for (const id of [...this.selection]) if (!this.scene.has(id)) this.selection.delete(id);
    if (this.selection.size !== before) this.emitSelection();
    this.requestFrame();
  }

  private emitSelection(): void {
    this.host.emit({ type: "selection", ids: this.selectedIds });
  }

  private updateObjects(label: string, next: SceneObj[]): void {
    const changes: Change[] = [];
    for (const n of next) {
      const i = this.scene.indexOf(n.id);
      const old = this.scene.get(n.id);
      if (i < 0 || !old || old === n) continue;
      if (JSON.stringify(old) === JSON.stringify(n)) continue;
      changes.push({ id: n.id, before: { obj: old, index: i }, after: { obj: n, index: i } });
    }
    this.commit(label, changes);
  }

  deleteSelection(): boolean {
    const ids = this.selectedIds.filter((id) => !this.scene.get(id)?.locked);
    if (!ids.length) return false;
    const changes: Change[] = ids.map((id) => ({ id, before: { obj: this.scene.get(id)!, index: this.scene.indexOf(id) }, after: null }));
    this.commit(ids.length > 1 ? `Delete ${ids.length} objects` : "Delete", changes);
    return true;
  }

  duplicateSelection(): string[] {
    const src = this.selected();
    if (!src.length) return [];
    const d = 16 * this.dpr;
    const start = this.scene.length;
    const copies = src.map((o) => ({ ...translate(o, d, d), id: newId(), locked: false }) as SceneObj);
    this.commit("Duplicate", copies.map((obj, i) => ({ id: obj.id, before: null, after: { obj, index: start + i } })), true);
    const ids = copies.map((c) => c.id);
    this.select(ids);
    return ids;
  }

  nudge(dx: number, dy: number): void {
    const s = this.selected().filter((o) => !o.locked);
    if (s.length) this.updateObjects("Move", s.map((o) => translate(o, dx * this.dpr, dy * this.dpr)));
  }

  arrange(where: "front" | "back" | "forward" | "backward"): void {
    const ids = this.selectedIds;
    if (!ids.length) return;
    const order = this.scene.objects.map((o) => o.id);
    const sel = new Set(ids);
    let next: string[];
    if (where === "front") next = [...order.filter((i) => !sel.has(i)), ...order.filter((i) => sel.has(i))];
    else if (where === "back") next = [...order.filter((i) => sel.has(i)), ...order.filter((i) => !sel.has(i))];
    else {
      next = order.slice();
      const step = where === "forward" ? 1 : -1;
      const idxs = next.map((id, i) => (sel.has(id) ? i : -1)).filter((i) => i >= 0);
      if (step > 0) idxs.reverse();
      for (const i of idxs) {
        const j = i + step;
        if (j < 0 || j >= next.length || sel.has(next[j])) continue;
        [next[i], next[j]] = [next[j], next[i]];
      }
    }
    const changes: Change[] = [];
    for (const id of ids) {
      const from = this.scene.indexOf(id);
      const to = next.indexOf(id);
      if (from !== to) changes.push({ id, before: { obj: this.scene.get(id)!, index: from }, after: { obj: this.scene.get(id)!, index: to } });
    }
    // Objects that moved implicitly keep their relative order; recording the
    // selected ones is enough for an exact undo (see Scene.apply).
    if (changes.length && (where === "forward" || where === "backward")) {
      // Neighbours that were swapped also changed index; record them too.
      for (let i = 0; i < next.length; i++) {
        const id = next[i];
        if (sel.has(id)) continue;
        const from = this.scene.indexOf(id);
        if (from !== i) changes.push({ id, before: { obj: this.scene.get(id)!, index: from }, after: { obj: this.scene.get(id)!, index: i } });
      }
    }
    this.commit(where === "front" || where === "forward" ? "Bring forward" : "Send backward", changes);
  }

  setLocked(locked: boolean): void {
    this.updateObjects(locked ? "Lock" : "Unlock", this.selected().map((o) => ({ ...o, locked })));
  }

  /** Apply a style change to the selection; fields that do not apply to a kind are ignored. */
  restyleSelection(p: Partial<ToolStyle> & { rotation?: number; flip?: "x" | "y"; number?: number }): void {
    const d = this.dpr;
    const next = this.selected().map((o): SceneObj => {
      switch (o.kind) {
        case "stroke":
          return { ...o, color: p.color ?? o.color, width: p.width !== undefined ? p.width * d : o.width, opacity: p.opacity ?? o.opacity, dash: p.dash ?? o.dash };
        case "shape": {
          const s: ShapeObj = {
            ...o,
            color: p.color ?? o.color,
            width: p.width !== undefined ? p.width * d : o.width,
            opacity: p.opacity ?? o.opacity,
            dash: p.dash ?? o.dash,
            fill: p.fill !== undefined ? p.fill : o.fill,
            fillOpacity: p.fillOpacity ?? o.fillOpacity,
            heads: p.heads ?? o.heads,
            radius: p.radius !== undefined ? p.radius * d : o.radius,
          };
          if (p.rotation !== undefined && (o.shape === "rect" || o.shape === "ellipse")) s.rotation = p.rotation;
          return s;
        }
        case "text": {
          const t: TextObj = {
            ...o,
            color: p.color ?? o.color,
            opacity: p.opacity ?? o.opacity,
            font: p.font ?? o.font,
            size: p.fontSize !== undefined ? p.fontSize * d : o.size,
            bold: p.bold ?? o.bold,
            italic: p.italic ?? o.italic,
            align: p.align ?? o.align,
            background: p.textBackground !== undefined ? p.textBackground : o.background,
            rotation: p.rotation ?? o.rotation,
          };
          return this.measured(t);
        }
        case "marker":
          return { ...o, color: p.color ?? o.color, opacity: p.opacity ?? o.opacity, size: p.markerSize !== undefined ? p.markerSize * d : o.size, n: p.number ?? o.n };
        case "image":
          return {
            ...o,
            opacity: p.opacity ?? o.opacity,
            rotation: p.rotation ?? o.rotation,
            flipX: p.flip === "x" ? !o.flipX : o.flipX,
            flipY: p.flip === "y" ? !o.flipY : o.flipY,
          };
        case "erase":
          return o;
      }
    });
    this.updateObjects("Style", next);
  }

  /** Rotate the selection by `a` radians around its frame centre. */
  rotateSelection(a: number): void {
    const f = this.selectionFrame();
    if (!f) return;
    const c = { x: f.x + f.w / 2, y: f.y + f.h / 2 };
    this.updateObjects("Rotate", this.selected().filter((o) => !o.locked).map((o) => rotate(o, c, a)));
  }

  // ───────────────────────── text ─────────────────────────

  private measure = (font: string, line: string): number => {
    const ctx = this.host.base;
    if (!ctx || typeof ctx.measureText !== "function") return approxMeasure(font, line);
    ctx.save();
    ctx.font = font;
    const w = ctx.measureText(line).width;
    ctx.restore();
    return w;
  };

  measured(t: TextObj): TextObj {
    const { w, h } = measureText(t, this.measure);
    return { ...t, w, h };
  }

  get textEdit(): TextEdit | null {
    return this.editing;
  }

  private beginTextEdit(existing: TextObj | null, at: Pt): void {
    this.finishTextEdit(true);
    const s = this.style;
    const draft: TextObj =
      existing ??
      this.measured({
        id: newId(),
        kind: "text",
        x: at.x,
        y: at.y,
        text: "",
        font: s.font,
        size: s.fontSize * this.dpr,
        bold: s.bold,
        italic: s.italic,
        color: s.color,
        opacity: s.opacity,
        align: s.align,
        dir: "auto",
        background: s.textBackground,
        rotation: 0,
        w: 10,
        h: 10,
      });
    this.editing = { id: existing ? existing.id : null, draft };
    if (existing) {
      this.hidden.add(existing.id);
      this.redrawBase(bounds(existing));
    }
    this.host.emit({ type: "textedit", edit: this.editing });
  }

  /** Called by the overlay's text box. Empty text deletes an existing object. */
  commitText(value: string): void {
    const e = this.editing;
    if (!e) return;
    this.editing = null;
    const text = value.replace(/\r\n?/g, "\n").replace(/\s+$/, "");
    if (e.id) {
      this.hidden.delete(e.id);
      const old = this.scene.get(e.id);
      if (old) {
        if (!text) {
          this.commit("Delete text", [{ id: e.id, before: { obj: old, index: this.scene.indexOf(e.id) }, after: null }]);
        } else if (old.kind === "text") {
          const next = this.measured({ ...old, text });
          if (next.text !== old.text) this.updateObjects("Edit text", [next]);
          else this.redrawBase(bounds(old));
        }
      }
    } else if (text) {
      const obj = this.measured({ ...e.draft, text });
      this.commit("Text", [{ id: obj.id, before: null, after: { obj, index: this.scene.length } }], true);
    }
    this.host.emit({ type: "textedit", edit: null });
  }

  /** Commit (default) or cancel an open text edit. */
  finishTextEdit(commit: boolean, value?: string): void {
    if (!this.editing) return;
    if (commit && value !== undefined) return this.commitText(value);
    const e = this.editing;
    this.editing = null;
    if (e.id) {
      this.hidden.delete(e.id);
      const o = this.scene.get(e.id);
      if (o) this.redrawBase(bounds(o));
    }
    this.host.emit({ type: "textedit", edit: null });
  }

  // ───────────────────────── images ─────────────────────────

  insertImage(asset: string, natW: number, natH: number, at?: Pt): string {
    const maxW = this.width * 0.6;
    const maxH = this.height * 0.6;
    const k = Math.min(1, maxW / Math.max(1, natW), maxH / Math.max(1, natH));
    const w = Math.max(8, natW * k);
    const h = Math.max(8, natH * k);
    const c = at ?? { x: this.width / 2, y: this.height / 2 };
    const obj: ImageObj = { id: newId(), kind: "image", asset, x: c.x - w / 2, y: c.y - h / 2, w, h, rotation: 0, flipX: false, flipY: false, opacity: 1 };
    this.commit("Image", [{ id: obj.id, before: null, after: { obj, index: this.scene.length } }], true);
    this.setTool("select");
    this.select([obj.id]);
    return obj.id;
  }

  // ───────────────────────── pointer input ─────────────────────────

  private tol(p: PointerSample): number {
    return (p.type === "touch" ? 12 : p.type === "pen" ? 7 : 5) * this.dpr;
  }

  private topHit(x: number, y: number, tol: number): SceneObj | null {
    const cands = this.scene.query({ x: x - tol, y: y - tol, w: tol * 2, h: tol * 2 });
    for (let i = cands.length - 1; i >= 0; i--) {
      const o = cands[i];
      if (isSelectable(o) && !this.hidden.has(o.id) && hitTest(o, x, y, tol)) return o;
    }
    return null;
  }

  private handles(): { h: Handle; x: number; y: number }[] {
    const f = this.selectionFrame();
    if (!f || this.selected().every((o) => o.locked)) return [];
    const pad = 6 * this.dpr;
    const r = inflate(f, pad);
    const mx = r.x + r.w / 2;
    const my = r.y + r.h / 2;
    const list: { h: Handle; x: number; y: number }[] = [
      { h: "nw", x: r.x, y: r.y },
      { h: "ne", x: r.x + r.w, y: r.y },
      { h: "se", x: r.x + r.w, y: r.y + r.h },
      { h: "sw", x: r.x, y: r.y + r.h },
    ];
    if (r.w > 40 * this.dpr) list.push({ h: "n", x: mx, y: r.y }, { h: "s", x: mx, y: r.y + r.h });
    if (r.h > 40 * this.dpr) list.push({ h: "e", x: r.x + r.w, y: my }, { h: "w", x: r.x, y: my });
    list.push({ h: "rot", x: mx, y: r.y - 26 * this.dpr });
    return list;
  }

  private handleAt(x: number, y: number, tol: number): Handle | null {
    for (const h of this.handles()) if (Math.hypot(h.x - x, h.y - y) <= Math.max(tol, 8 * this.dpr)) return h.h;
    return null;
  }

  pointerDown(p: PointerSample): void {
    if (this.gesture) return; // one gesture at a time (ignore a second finger)
    this.hover = { x: p.x, y: p.y };
    const s = this.style;
    const d = this.dpr;
    switch (this.tool) {
      case "pen":
      case "highlighter": {
        const hl = this.tool === "highlighter";
        const obj: StrokeObj = {
          id: newId(),
          kind: "stroke",
          tool: this.tool,
          pts: [],
          color: s.color,
          width: Math.max(0.5, (hl ? Math.max(s.width, 10) : s.width) * d),
          opacity: hl ? Math.min(s.opacity, 0.45) : s.opacity,
          dash: hl ? "solid" : s.dash,
          pressure: s.pressure && p.type === "pen",
        };
        appendPoint(obj.pts, p.x, p.y, this.pressureOf(p), 0);
        this.gesture = { kind: "stroke", obj, straight: p.shift ? { x: p.x, y: p.y } : null };
        break;
      }
      case "laser":
        this.laserDown = true;
        this.laser.push({ x: p.x, y: p.y, t: this.host.now() });
        this.gesture = { kind: "laser" };
        break;
      case "rect":
      case "ellipse":
      case "line":
      case "arrow":
        this.gesture = { kind: "shape", start: { x: p.x, y: p.y }, cur: { x: p.x, y: p.y }, shift: p.shift, alt: p.alt };
        break;
      case "text": {
        const hit = this.topHit(p.x, p.y, this.tol(p));
        if (hit && hit.kind === "text") this.beginTextEdit(hit, { x: hit.x, y: hit.y });
        else if (this.editing) this.finishTextEdit(false);
        else this.beginTextEdit(null, { x: p.x, y: p.y - s.fontSize * d * 0.65 });
        break;
      }
      case "marker": {
        const obj: MarkerObj = { id: newId(), kind: "marker", x: p.x, y: p.y, n: this.nextMarkerNumber(), size: s.markerSize * d, color: s.color, opacity: s.opacity };
        this.commit("Step marker", [{ id: obj.id, before: null, after: { obj, index: this.scene.length } }], true);
        break;
      }
      case "eraser":
        this.gesture = { kind: "erase", last: { x: p.x, y: p.y }, hit: new Set() };
        this.eraseAlong(p.x, p.y, p.x, p.y);
        break;
      case "pixelEraser":
        this.gesture = { kind: "pixelErase", pts: [p.x, p.y] };
        this.pixelEraseSegment(p.x, p.y, p.x, p.y);
        break;
      case "select":
        this.selectDown(p);
        break;
    }
    this.requestFrame();
  }

  private selectDown(p: PointerSample): void {
    const tol = this.tol(p);
    const handle = this.selection.size ? this.handleAt(p.x, p.y, tol) : null;
    const pt = { x: p.x, y: p.y };
    if (handle) {
      const orig = this.selected().filter((o) => !o.locked);
      const frame = this.selectionFrame()!;
      if (handle === "rot") {
        const center = { x: frame.x + frame.w / 2, y: frame.y + frame.h / 2 };
        this.gesture = { kind: "rotate", center, a0: Math.atan2(p.y - center.y, p.x - center.x), a: 0, orig, shift: p.shift };
      } else {
        this.gesture = { kind: "resize", handle, frame, orig, cur: pt, shift: p.shift };
      }
      this.hideForPreview(orig);
      return;
    }
    const hit = this.topHit(p.x, p.y, tol);
    if (hit) {
      const now = p.time;
      if (hit.kind === "text" && this.lastClick && this.lastClick.id === hit.id && now - this.lastClick.t < 400 && !hit.locked) {
        this.lastClick = null;
        this.beginTextEdit(hit, { x: hit.x, y: hit.y });
        return;
      }
      this.lastClick = { id: hit.id, t: now };
      if (p.shift || p.ctrl) {
        if (this.selection.has(hit.id)) this.selection.delete(hit.id);
        else this.selection.add(hit.id);
        this.emitSelection();
        return;
      }
      if (!this.selection.has(hit.id)) {
        this.selection = new Set([hit.id]);
        this.emitSelection();
      }
      const orig = this.selected().filter((o) => !o.locked);
      if (orig.length) {
        this.gesture = { kind: "move", start: pt, dx: 0, dy: 0, orig, shift: false };
        this.hideForPreview(orig);
      }
      return;
    }
    const additive = p.shift || p.ctrl;
    if (!additive) this.deselect();
    this.gesture = { kind: "marquee", start: pt, cur: pt, additive, base: new Set(this.selection) };
  }

  private hideForPreview(objs: SceneObj[]): void {
    let dirty: Rect | null = null;
    for (const o of objs) {
      this.hidden.add(o.id);
      dirty = union(dirty, bounds(o));
    }
    if (dirty) this.redrawBase(dirty);
  }

  private pressureOf(p: PointerSample): number {
    if (p.type === "pen" && p.pressure > 0) return Math.min(1, Math.max(0.05, p.pressure));
    return 0.5;
  }

  pointerMove(samples: PointerSample[]): void {
    const last = samples[samples.length - 1];
    if (!last) return;
    this.hover = { x: last.x, y: last.y };
    const g = this.gesture;
    if (!g) {
      if (this.tool === "select") this.updateHoverCursor(last);
      if (this.tool === "eraser" || this.tool === "pixelEraser" || this.laser.length) this.requestFrame();
      return;
    }
    switch (g.kind) {
      case "stroke": {
        if (g.straight) {
          const end = { x: last.x, y: last.y };
          if (last.shift) {
            const s = snapAngle(end.x - g.straight.x, end.y - g.straight.y, 15);
            end.x = g.straight.x + s.dx;
            end.y = g.straight.y + s.dy;
          }
          g.obj.pts = [g.straight.x, g.straight.y, 0.5, end.x, end.y, 0.5];
        } else {
          const minDist = 0.6 * this.dpr;
          for (const s of samples) appendPoint(g.obj.pts, s.x, s.y, this.pressureOf(s), minDist);
        }
        break;
      }
      case "laser":
        for (const s of samples) this.laser.push({ x: s.x, y: s.y, t: this.host.now() });
        break;
      case "shape":
        g.cur = { x: last.x, y: last.y };
        g.shift = last.shift;
        g.alt = last.alt;
        break;
      case "move": {
        let dx = last.x - g.start.x;
        let dy = last.y - g.start.y;
        if (last.shift) {
          if (Math.abs(dx) > Math.abs(dy)) dy = 0;
          else dx = 0;
        }
        g.dx = dx;
        g.dy = dy;
        break;
      }
      case "resize":
        g.cur = { x: last.x, y: last.y };
        g.shift = last.shift;
        break;
      case "rotate": {
        let a = Math.atan2(last.y - g.center.y, last.x - g.center.x) - g.a0;
        if (last.shift) a = Math.round(a / (Math.PI / 12)) * (Math.PI / 12);
        g.a = a;
        break;
      }
      case "marquee":
        g.cur = { x: last.x, y: last.y };
        break;
      case "erase":
        for (const s of samples) {
          this.eraseAlong(g.last.x, g.last.y, s.x, s.y);
          g.last = { x: s.x, y: s.y };
        }
        break;
      case "pixelErase":
        for (const s of samples) {
          const n = g.pts.length;
          const lx = g.pts[n - 2];
          const ly = g.pts[n - 1];
          if (Math.hypot(s.x - lx, s.y - ly) < 1.5 * this.dpr) continue;
          g.pts.push(s.x, s.y);
          this.pixelEraseSegment(lx, ly, s.x, s.y);
        }
        break;
    }
    this.requestFrame();
  }

  pointerUp(p?: PointerSample): void {
    const g = this.gesture;
    if (p) this.hover = { x: p.x, y: p.y };
    if (!g) return;
    this.gesture = null;
    switch (g.kind) {
      case "stroke": {
        if (g.obj.pts.length >= 3) this.commit(g.obj.tool === "highlighter" ? "Highlighter" : "Pen", [{ id: g.obj.id, before: null, after: { obj: g.obj, index: this.scene.length } }], true);
        break;
      }
      case "laser":
        this.laserDown = false;
        break;
      case "shape": {
        const obj = this.shapeFromGesture(g);
        const b = rectFromPoints(obj.x1, obj.y1, obj.x2, obj.y2);
        if (Math.max(b.w, b.h) >= 3 * this.dpr) {
          this.commit(SHAPE_LABEL[obj.shape], [{ id: obj.id, before: null, after: { obj, index: this.scene.length } }], true);
        }
        break;
      }
      case "move":
      case "resize":
      case "rotate": {
        const next = this.previewObjects(g);
        for (const o of g.orig) this.hidden.delete(o.id);
        const moved = g.kind === "move" ? Math.hypot(g.dx, g.dy) >= 1 : true;
        if (moved && next.length) {
          this.updateObjects(g.kind === "move" ? "Move" : g.kind === "resize" ? "Resize" : "Rotate", next);
        }
        // Repaint where the originals were hidden (no-op commits included).
        let dirty: Rect | null = null;
        for (const o of g.orig) dirty = union(dirty, bounds(o));
        if (dirty) this.redrawBase(dirty);
        break;
      }
      case "marquee": {
        const r = rectFromPoints(g.start.x, g.start.y, g.cur.x, g.cur.y);
        if (r.w > 2 || r.h > 2) {
          const ids = new Set(g.additive ? g.base : []);
          for (const o of this.scene.query(r)) if (isSelectable(o) && intersects(bounds(o), r)) ids.add(o.id);
          this.selection = ids;
          this.emitSelection();
        }
        break;
      }
      case "erase": {
        const ids = [...g.hit].filter((id) => this.scene.has(id));
        for (const id of g.hit) this.hidden.delete(id);
        if (ids.length) {
          this.commit(
            "Erase",
            ids.map((id) => ({ id, before: { obj: this.scene.get(id)!, index: this.scene.indexOf(id) }, after: null })),
          );
        }
        break;
      }
      case "pixelErase": {
        const obj = { id: newId(), kind: "erase" as const, pts: g.pts, width: this.style.eraserSize * this.dpr };
        // The base layer already shows the result; recording it makes it undoable.
        this.commit("Erase", [{ id: obj.id, before: null, after: { obj, index: this.scene.length } }], true);
        break;
      }
    }
    this.requestFrame();
  }

  /** Abort the current gesture without committing anything. */
  cancelGesture(): boolean {
    const g = this.gesture;
    if (!g) return false;
    this.gesture = null;
    if (g.kind === "move" || g.kind === "resize" || g.kind === "rotate") {
      let dirty: Rect | null = null;
      for (const o of g.orig) {
        this.hidden.delete(o.id);
        dirty = union(dirty, bounds(o));
      }
      if (dirty) this.redrawBase(dirty);
    } else if (g.kind === "erase") {
      let dirty: Rect | null = null;
      for (const id of g.hit) {
        this.hidden.delete(id);
        const o = this.scene.get(id);
        if (o) dirty = union(dirty, bounds(o));
      }
      if (dirty) this.redrawBase(dirty);
    } else if (g.kind === "pixelErase") {
      const obj = { id: "tmp", kind: "erase" as const, pts: g.pts, width: this.style.eraserSize * this.dpr };
      this.redrawBase(bounds(obj));
    } else if (g.kind === "laser") {
      this.laserDown = false;
    }
    this.requestFrame();
    return true;
  }

  get busy(): boolean {
    return this.gesture !== null;
  }

  /** Layered Escape: cancel gesture → close text box → deselect → "none". */
  escape(): "consumed" | "none" {
    if (this.cancelGesture()) return "consumed";
    if (this.editing) {
      this.finishTextEdit(false);
      return "consumed";
    }
    if (this.selection.size) {
      this.deselect();
      return "consumed";
    }
    return "none";
  }

  pointerLeave(): void {
    this.hover = null;
    this.requestFrame();
  }

  private nextMarkerNumber(): number {
    let n = 0;
    for (const o of this.scene.objects) if (o.kind === "marker") n = Math.max(n, o.n);
    return n + 1;
  }

  private shapeFromGesture(g: Extract<Gesture, { kind: "shape" }>): ShapeObj {
    const s = this.style;
    const d = this.dpr;
    const shape = this.tool as ShapeObj["shape"];
    let { x: x1, y: y1 } = g.start;
    let { x: x2, y: y2 } = g.cur;
    if (shape === "line" || shape === "arrow") {
      if (g.shift) {
        const sn = snapAngle(x2 - x1, y2 - y1, 15);
        x2 = x1 + sn.dx;
        y2 = y1 + sn.dy;
      }
    } else {
      let w = x2 - x1;
      let h = y2 - y1;
      if (g.shift) {
        const m = Math.max(Math.abs(w), Math.abs(h));
        w = Math.sign(w || 1) * m;
        h = Math.sign(h || 1) * m;
      }
      if (g.alt) {
        x1 = g.start.x - w;
        y1 = g.start.y - h;
      }
      x2 = g.start.x + w;
      y2 = g.start.y + h;
      [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)];
      [y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)];
    }
    return {
      id: newId(),
      kind: "shape",
      shape,
      x1,
      y1,
      x2,
      y2,
      color: s.color,
      width: Math.max(0.5, s.width * d),
      opacity: s.opacity,
      dash: s.dash,
      fill: shape === "rect" || shape === "ellipse" ? s.fill : null,
      fillOpacity: s.fillOpacity,
      rotation: 0,
      radius: shape === "rect" ? s.radius * d : 0,
      heads: s.heads,
    };
  }

  private previewObjects(g: Extract<Gesture, { kind: "move" | "resize" | "rotate" }>): SceneObj[] {
    if (g.kind === "move") return g.orig.map((o) => translate(o, g.dx, g.dy));
    if (g.kind === "rotate") return g.orig.map((o) => rotate(o, g.center, g.a));
    const f = g.frame;
    const h = g.handle;
    const ox = h.includes("w") ? f.x + f.w : h.includes("e") ? f.x : f.x + f.w / 2;
    const oy = h.includes("n") ? f.y + f.h : h.includes("s") ? f.y : f.y + f.h / 2;
    const fw = Math.max(1, f.w);
    const fh = Math.max(1, f.h);
    let sx = h === "n" || h === "s" ? 1 : (h.includes("w") ? ox - g.cur.x : g.cur.x - ox) / fw;
    let sy = h === "e" || h === "w" ? 1 : (h.includes("n") ? oy - g.cur.y : g.cur.y - oy) / fh;
    const keepAspect = g.shift || g.orig.some((o) => o.kind === "text" || o.kind === "marker");
    if (keepAspect && h.length === 2) {
      const k = Math.max(Math.abs(sx), Math.abs(sy));
      sx = Math.sign(sx || 1) * k;
      sy = Math.sign(sy || 1) * k;
    }
    const clamp = (v: number) => (Math.abs(v) < 0.02 ? 0.02 * Math.sign(v || 1) : v);
    return g.orig.map((o) => scale(o, { x: ox, y: oy }, clamp(sx), clamp(sy)));
  }

  private eraseAlong(ax: number, ay: number, bx: number, by: number): void {
    const g = this.gesture;
    if (!g || g.kind !== "erase") return;
    const r = (this.style.eraserSize * this.dpr) / 2;
    const box = inflate(rectFromPoints(ax, ay, bx, by), r);
    let dirty: Rect | null = null;
    for (const o of this.scene.query(box)) {
      if (o.kind === "erase" || o.locked || this.hidden.has(o.id)) continue;
      if (segmentTouches(o, ax, ay, bx, by, r)) {
        g.hit.add(o.id);
        this.hidden.add(o.id);
        dirty = union(dirty, bounds(o));
      }
    }
    if (dirty) this.redrawBase(dirty);
  }

  private pixelEraseSegment(ax: number, ay: number, bx: number, by: number): void {
    const ctx = this.host.base;
    if (!ctx) return;
    const pts = ax === bx && ay === by ? [ax, ay] : [ax, ay, bx, by];
    drawObject(ctx, { id: "tmp", kind: "erase", pts, width: this.style.eraserSize * this.dpr }, this.env);
  }

  private updateHoverCursor(p: PointerSample): void {
    const tol = this.tol(p);
    const h = this.selection.size ? this.handleAt(p.x, p.y, tol) : null;
    const hit = h ? null : this.topHit(p.x, p.y, tol);
    this.setCursor(h ? CURSORS[h] : hit ? (hit.locked ? "not-allowed" : "move") : "default");
  }

  private updateCursor(): void {
    const c: Record<ToolId, string> = {
      select: "default",
      pen: "crosshair",
      highlighter: "crosshair",
      laser: "none",
      rect: "crosshair",
      ellipse: "crosshair",
      line: "crosshair",
      arrow: "crosshair",
      text: "text",
      marker: "copy",
      eraser: "none",
      pixelEraser: "none",
    };
    this.setCursor(c[this.tool]);
  }

  private setCursor(c: string): void {
    if (c === this.cursor) return;
    this.cursor = c;
    this.host.emit({ type: "cursor", cursor: c });
  }

  // ───────────────────────── rendering ─────────────────────────

  /** Repaint the base layer, fully (null) or inside `r` only. */
  redrawBase(r: Rect | null): void {
    const ctx = this.host.base;
    if (!ctx) return;
    ctx.save();
    if (r) {
      const x = Math.floor(r.x) - 1;
      const y = Math.floor(r.y) - 1;
      const w = Math.ceil(r.w) + 3;
      const h = Math.ceil(r.h) + 3;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.clearRect(x, y, w, h);
      for (const o of this.scene.query({ x, y, w, h })) if (!this.hidden.has(o.id)) drawObject(ctx, o, this.env);
    } else {
      ctx.clearRect(0, 0, this.width, this.height);
      for (const o of this.scene.objects) if (!this.hidden.has(o.id)) drawObject(ctx, o, this.env);
    }
    ctx.restore();
  }

  requestFrame(): void {
    if (this.frameQueued) return;
    this.frameQueued = true;
    this.host.raf(() => {
      this.frameQueued = false;
      this.renderLive();
    });
  }

  private renderLive(): void {
    const ctx = this.host.live;
    if (!ctx) return;
    if (this.liveDirty) {
      const r = inflate(this.liveDirty, 4);
      ctx.clearRect(Math.floor(r.x), Math.floor(r.y), Math.ceil(r.w) + 1, Math.ceil(r.h) + 1);
    }
    let dirty: Rect | null = null;
    const draw = (o: SceneObj) => {
      drawObject(ctx, o, this.env);
      dirty = union(dirty, bounds(o));
    };
    const g = this.gesture;
    if (g?.kind === "stroke" && g.obj.pts.length >= 3) draw({ ...g.obj, pts: g.obj.pts.slice() });
    if (g?.kind === "shape") draw(this.shapeFromGesture(g));
    if (g && (g.kind === "move" || g.kind === "resize" || g.kind === "rotate")) for (const o of this.previewObjects(g)) draw(o);
    dirty = union(dirty, this.drawSelectionChrome(ctx, g));
    if (g?.kind === "marquee") {
      const r = rectFromPoints(g.start.x, g.start.y, g.cur.x, g.cur.y);
      ctx.save();
      ctx.fillStyle = hexA(this.host.accent, 0.08);
      ctx.strokeStyle = this.host.accent;
      ctx.lineWidth = 1 * this.dpr;
      ctx.setLineDash([5 * this.dpr, 4 * this.dpr]);
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.restore();
      dirty = union(dirty, inflate(r, 2 * this.dpr));
    }
    dirty = union(dirty, this.drawLaser(ctx));
    if ((this.tool === "eraser" || this.tool === "pixelEraser") && this.hover) {
      const rr = (this.style.eraserSize * this.dpr) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.hover.x, this.hover.y, rr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.lineWidth = 1.5 * this.dpr;
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.stroke();
      ctx.lineWidth = 0.75 * this.dpr;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();
      dirty = union(dirty, inflate({ x: this.hover.x - rr, y: this.hover.y - rr, w: rr * 2, h: rr * 2 }, 3 * this.dpr));
    }
    this.liveDirty = dirty;
    if (this.laser.length) this.requestFrame();
  }

  private drawSelectionChrome(ctx: Ctx, g: Gesture | null): Rect | null {
    if (!this.selection.size || this.tool !== "select") return null;
    if (g && (g.kind === "move" || g.kind === "rotate")) return null;
    let f = this.selectionFrame();
    if (g?.kind === "resize") f = selectionFrame(this.previewObjects(g));
    if (!f) return null;
    const d = this.dpr;
    const r = inflate(f, 6 * d);
    const locked = this.selected().every((o) => o.locked);
    ctx.save();
    ctx.strokeStyle = this.host.accent;
    ctx.lineWidth = 1.25 * d;
    ctx.setLineDash(locked ? [4 * d, 4 * d] : []);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    if (!locked && !g) {
      for (const h of this.handles()) {
        ctx.beginPath();
        if (h.h === "rot") {
          ctx.moveTo(r.x + r.w / 2, r.y);
          ctx.lineTo(h.x, h.y + 6 * d);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(h.x, h.y, 6 * d, 0, Math.PI * 2);
        } else {
          ctx.rect(h.x - 4.5 * d, h.y - 4.5 * d, 9 * d, 9 * d);
        }
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 1.5 * d;
        ctx.stroke();
      }
    }
    ctx.restore();
    return inflate({ x: r.x, y: r.y - 40 * d, w: r.w, h: r.h + 40 * d }, 12 * d);
  }

  private drawLaser(ctx: Ctx): Rect | null {
    const now = this.host.now();
    const life = 900;
    this.laser = this.laser.filter((p) => now - p.t < life);
    if (!this.laser.length && !(this.tool === "laser" && this.hover)) return null;
    const d = this.dpr;
    const color = this.style.color;
    let dirty: Rect | null = null;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < this.laser.length; i++) {
      const a = this.laser[i - 1];
      const b = this.laser[i];
      const k = 1 - (now - b.t) / life;
      ctx.globalAlpha = Math.max(0, k);
      ctx.strokeStyle = color;
      ctx.lineWidth = (2 + 4 * k) * d;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * d * k;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      dirty = union(dirty, inflate(rectFromPoints(a.x, a.y, b.x, b.y), 20 * d));
    }
    const head = this.laserDown ? this.laser[this.laser.length - 1] : this.tool === "laser" ? this.hover : null;
    if (head) {
      ctx.globalAlpha = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18 * d;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 6 * d, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.2 * d, 0, Math.PI * 2);
      ctx.fill();
      dirty = union(dirty, inflate({ x: head.x, y: head.y, w: 0, h: 0 }, 30 * d));
    }
    ctx.restore();
    return dirty;
  }
}

const SHAPE_LABEL: Record<ShapeObj["shape"], string> = { rect: "Rectangle", ellipse: "Ellipse", line: "Line", arrow: "Arrow" };

function hexA(hex: string, a: number): string {
  const m = /^#([0-9a-f]{6})/i.exec(hex);
  if (!m) return `rgba(255,106,61,${a})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export { fontString };
