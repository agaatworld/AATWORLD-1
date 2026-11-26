import { describe, expect, it } from "vitest";
import { parseScene, sanitizeScene } from "../../src/engine/validate";
import { rect, stroke, text } from "./fixtures";

describe("scene validation", () => {
  it("round-trips valid objects unchanged", () => {
    const objs = [stroke([0, 0, 10, 10]), rect(0, 0, 50, 50, { fill: "#ff0000" }), text(5, 5)];
    const { doc, dropped } = sanitizeScene({ format: "explainer-scene", version: 1, background: "none", objects: objs });
    expect(dropped).toBe(0);
    expect(doc.objects).toEqual(objs.map((o) => ({ locked: false, ...o })));
  });

  it("never throws on garbage and drops invalid objects", () => {
    for (const g of [null, 1, "x", [], { objects: "no" }, { objects: [null, 3, { kind: "nope" }] }]) {
      expect(() => sanitizeScene(g)).not.toThrow();
    }
    const r = sanitizeScene({ objects: [{ kind: "stroke", pts: [1, 2] }, { kind: "shape", shape: "rect", x1: "a" }, { kind: "text", text: "", x: 0, y: 0 }] });
    expect(r.doc.objects).toHaveLength(0);
    expect(r.dropped).toBe(3);
    expect(parseScene("{not json").dropped).toBe(1);
    expect(parseScene("").doc.objects).toEqual([]);
  });

  it("clamps numbers, rejects bad colours and NaN/Infinity", () => {
    const r = sanitizeScene({ objects: [{ kind: "shape", shape: "rect", x1: 10, y1: 10, x2: 0, y2: 0, width: 1e9, color: "red;}", fill: "url(x)", opacity: -4 }] });
    const o = r.doc.objects[0];
    expect(o.kind === "shape" && [o.x1, o.y1, o.x2, o.y2]).toEqual([0, 0, 10, 10]);
    expect(o.kind === "shape" && o.width).toBe(400);
    expect(o.kind === "shape" && o.color).toBe("#ff5a36");
    expect(o.kind === "shape" && o.fill).toBe(null);
    expect(o.kind === "shape" && o.opacity).toBe(0.02);
    const bad = sanitizeScene({ objects: [{ kind: "marker", x: Infinity, y: 0 }, { kind: "marker", x: NaN, y: 0 }] });
    expect(bad.doc.objects).toHaveLength(0);
  });

  it("refuses image assets that look like paths", () => {
    const r = sanitizeScene({ objects: [{ kind: "image", asset: "../../secret.png", x: 0, y: 0, w: 10, h: 10 }] });
    expect(r.doc.objects).toHaveLength(0);
  });

  it("de-duplicates ids", () => {
    const s = stroke([0, 0, 1, 1]);
    const r = sanitizeScene({ objects: [s, s] });
    expect(new Set(r.doc.objects.map((o) => o.id)).size).toBe(2);
  });

  it("strips unsafe characters from font names", () => {
    const r = sanitizeScene({ objects: [{ ...text(0, 0), font: "Arial'; } body { x" }] });
    expect(r.doc.objects[0].kind === "text" && r.doc.objects[0].font).toBe("Arial  body  x");
  });
});
