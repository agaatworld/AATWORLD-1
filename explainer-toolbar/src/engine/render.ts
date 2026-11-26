import { localBox, type Rect } from "./geometry";
import type { EraseObj, ImageObj, MarkerObj, SceneObj, ShapeObj, StrokeObj, TextObj } from "./model";
import { centerlinePath, outlineFor, outlineToPath } from "./stroke";
import { fontString, LINE_HEIGHT, padding, resolveDir } from "./text";

export type Ctx = CanvasRenderingContext2D;

export interface RenderEnv {
  /** Decoded image for an asset id, or null while loading / when missing. */
  image(asset: string): CanvasImageSource | null;
  /** True when an asset failed permanently (draw a placeholder). */
  missing(asset: string): boolean;
  smoothing: number;
  dpr: number;
}

/** Path2D cache keyed by the (immutable) object, so edits invalidate it naturally. */
const pathCache = new WeakMap<object, Path2D>();

function strokePath(o: StrokeObj, env: RenderEnv): Path2D {
  let p = pathCache.get(o);
  if (!p) {
    p = new Path2D(o.dash === "solid" ? outlineToPath(outlineFor(o, { smoothing: env.smoothing })) : centerlinePath(o, 3));
    pathCache.set(o, p);
  }
  return p;
}

export function dashArray(dash: string, width: number): number[] {
  if (dash === "dash") return [width * 2.6, width * 1.8];
  if (dash === "dot") return [0.01, width * 2.1];
  return [];
}

function drawStroke(ctx: Ctx, o: StrokeObj, env: RenderEnv): void {
  ctx.globalAlpha = o.opacity;
  const path = strokePath(o, env);
  if (o.dash === "solid") {
    ctx.fillStyle = o.color;
    ctx.fill(path);
  } else {
    ctx.strokeStyle = o.color;
    ctx.lineWidth = o.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash(dashArray(o.dash, o.width));
    ctx.stroke(path);
    ctx.setLineDash([]);
  }
}

function drawErase(ctx: Ctx, o: EraseObj): void {
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = o.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const p = o.pts;
  ctx.beginPath();
  if (p.length === 2) {
    ctx.arc(p[0], p[1], o.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i + 1 < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

export function arrowHead(ctx: Ctx, fx: number, fy: number, tx: number, ty: number, w: number): void {
  const a = Math.atan2(ty - fy, tx - fx);
  const len = Math.max(12, w * 3.4);
  const spread = Math.PI / 7.2;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - len * Math.cos(a - spread), ty - len * Math.sin(a - spread));
  ctx.lineTo(tx - len * 0.72 * Math.cos(a), ty - len * 0.72 * Math.sin(a));
  ctx.lineTo(tx - len * Math.cos(a + spread), ty - len * Math.sin(a + spread));
  ctx.closePath();
  ctx.fill();
}

function drawShape(ctx: Ctx, o: ShapeObj): void {
  ctx.globalAlpha = o.opacity;
  ctx.strokeStyle = o.color;
  ctx.fillStyle = o.color;
  ctx.lineWidth = o.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(dashArray(o.dash, o.width));
  if (o.shape === "line" || o.shape === "arrow") {
    let { x1, y1, x2, y2 } = o;
    const head = Math.max(12, o.width * 3.4) * 0.6;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    // shorten the shaft so its round cap does not poke through the head
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    if (o.shape === "arrow" && len > head * 1.5) {
      x2 -= ux * head;
      y2 -= uy * head;
      if (o.heads === "both") {
        x1 += ux * head;
        y1 += uy * head;
      }
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (o.shape === "arrow") {
      arrowHead(ctx, o.x1, o.y1, o.x2, o.y2, o.width);
      if (o.heads === "both") arrowHead(ctx, o.x2, o.y2, o.x1, o.y1, o.width);
    }
    return;
  }
  const b = localBox(o);
  ctx.save();
  if (o.rotation) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(o.rotation);
    ctx.translate(-cx, -cy);
  }
  ctx.beginPath();
  if (o.shape === "rect") {
    const r = Math.min(o.radius, b.w / 2, b.h / 2);
    if (r > 0) ctx.roundRect(b.x, b.y, b.w, b.h, r);
    else ctx.rect(b.x, b.y, b.w, b.h);
  } else {
    ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w / 2, 0.5), Math.max(b.h / 2, 0.5), 0, 0, Math.PI * 2);
  }
  if (o.fill) {
    ctx.globalAlpha = o.opacity * o.fillOpacity;
    ctx.fillStyle = o.fill;
    ctx.fill();
    ctx.globalAlpha = o.opacity;
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function withBoxTransform(ctx: Ctx, b: Rect, rotation: number, fn: () => void): void {
  ctx.save();
  if (rotation) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);
  }
  fn();
  ctx.restore();
}

function drawText(ctx: Ctx, o: TextObj): void {
  const b = localBox(o);
  withBoxTransform(ctx, b, o.rotation, () => {
    ctx.globalAlpha = o.opacity;
    const pad = padding(o);
    if (o.background) {
      ctx.fillStyle = o.background;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, Math.min(o.size * 0.3, 14));
      ctx.fill();
    }
    ctx.font = fontString(o);
    ctx.fillStyle = o.color;
    ctx.textBaseline = "top";
    const left = b.x + pad;
    const right = b.x + b.w - pad;
    const lh = o.size * LINE_HEIGHT;
    const top = b.y + pad + (lh - o.size) / 2;
    o.text.split("\n").forEach((line, i) => {
      // Each line takes its own direction (mixed Arabic/English labels),
      // like paragraphs with "auto" direction in a word processor.
      const dir = o.dir === "auto" ? resolveDir(line, "auto") : o.dir;
      ctx.direction = dir;
      let x: number;
      if (o.align === "center") {
        ctx.textAlign = "center";
        x = b.x + b.w / 2;
      } else {
        const atRight = (o.align === "start") === (dir === "rtl");
        ctx.textAlign = atRight ? "right" : "left";
        x = atRight ? right : left;
      }
      ctx.fillText(line, x, top + i * lh);
    });
  });
}

function drawMarker(ctx: Ctx, o: MarkerObj): void {
  ctx.globalAlpha = o.opacity;
  ctx.fillStyle = o.color;
  ctx.beginPath();
  ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, o.size * 0.12);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.stroke();
  ctx.fillStyle = readableOn(o.color);
  const label = String(o.n);
  ctx.font = `700 ${o.size * (label.length > 2 ? 0.8 : 1.05)}px "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";
  ctx.fillText(label, o.x, o.y + o.size * 0.04);
}

function drawImage(ctx: Ctx, o: ImageObj, env: RenderEnv): void {
  const b = localBox(o);
  withBoxTransform(ctx, b, o.rotation, () => {
    ctx.globalAlpha = o.opacity;
    const img = env.image(o.asset);
    if (img) {
      ctx.translate(b.x + (o.flipX ? b.w : 0), b.y + (o.flipY ? b.h : 0));
      ctx.scale(o.flipX ? -1 : 1, o.flipY ? -1 : 1);
      ctx.drawImage(img, 0, 0, b.w, b.h);
      return;
    }
    // Placeholder: still visible and selectable, so the user can delete it.
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(20,22,26,0.55)";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.setLineDash([8 * env.dpr, 6 * env.dpr]);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5 * env.dpr;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${13 * env.dpr}px "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "ltr";
    ctx.fillText(env.missing(o.asset) ? "Image file missing" : "Loading image…", b.x + b.w / 2, b.y + b.h / 2);
  });
}

export function drawObject(ctx: Ctx, o: SceneObj, env: RenderEnv): void {
  ctx.save();
  try {
    switch (o.kind) {
      case "stroke":
        drawStroke(ctx, o, env);
        break;
      case "erase":
        drawErase(ctx, o);
        break;
      case "shape":
        drawShape(ctx, o);
        break;
      case "text":
        drawText(ctx, o);
        break;
      case "marker":
        drawMarker(ctx, o);
        break;
      case "image":
        drawImage(ctx, o, env);
        break;
    }
  } finally {
    ctx.restore();
  }
}

/** Black or white, whichever reads better on `hex`. */
export function readableOn(hex: string): string {
  const m = /^#([0-9a-f]{3,8})$/i.exec(hex);
  if (!m) return "#ffffff";
  let h = m[1];
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.42 ? "#111111" : "#ffffff";
}
