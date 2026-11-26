import { describe, expect, it } from "vitest";
import { bounds, hitTest, segmentTouches, rotatedBounds, snapAngle } from "../../src/engine/geometry";
import { rotate, scale, translate, selectionFrame, normAngle } from "../../src/engine/transform";
import { image, marker, rect, stroke, text } from "./fixtures";

describe("hit testing", () => {
  it("strokes: near the line hits, far misses", () => {
    const s = stroke([0, 0, 100, 0], 10);
    expect(hitTest(s, 50, 4, 0)).toBe(true);
    expect(hitTest(s, 50, 12, 0)).toBe(false);
    expect(hitTest(s, 50, 12, 8)).toBe(true);
  });

  it("unfilled rectangles hit on the outline only; filled hit inside", () => {
    const r = rect(0, 0, 100, 100);
    expect(hitTest(r, 50, 50, 2)).toBe(false);
    expect(hitTest(r, 1, 50, 2)).toBe(true);
    expect(hitTest(r, -3, 50, 2)).toBe(true);
    expect(hitTest({ ...r, fill: "#ff0000" }, 50, 50, 0)).toBe(true);
  });

  it("a shape keeps its fill after being edited (regression: fill lost on edit)", () => {
    const r = rect(0, 0, 100, 100, { fill: "#123456", fillOpacity: 0.5 });
    const moved = translate(r, 10, 10);
    const scaled = scale(moved, { x: 0, y: 0 }, 2, 2);
    const turned = rotate(scaled, { x: 100, y: 100 }, 0.3);
    for (const o of [moved, scaled, turned]) {
      expect(o.kind === "shape" && o.fill).toBe("#123456");
      expect(o.kind === "shape" && o.fillOpacity).toBe(0.5);
    }
  });

  it("rotated rectangles are hit in their own frame", () => {
    const r = rect(0, 0, 200, 20, { rotation: Math.PI / 2, fill: "#000000" });
    // rotated 90° around centre (100,10): now spans x 90..110, y -90..110
    expect(hitTest(r, 100, -80, 0)).toBe(true);
    expect(hitTest(r, 10, 10, 0)).toBe(false);
  });

  it("ellipse outline and fill", () => {
    const e = rect(0, 0, 200, 100, { shape: "ellipse" });
    expect(hitTest(e, 100, 50, 2)).toBe(false);
    expect(hitTest(e, 0, 50, 3)).toBe(true);
    expect(hitTest({ ...e, fill: "#ffffff" }, 100, 50, 0)).toBe(true);
  });

  it("text, image and marker boxes", () => {
    expect(hitTest(text(0, 0), 50, 20, 0)).toBe(true);
    expect(hitTest(image(0, 0, 40, 40), 41, 41, 0)).toBe(false);
    expect(hitTest(marker(100, 100), 110, 110, 0)).toBe(true);
  });

  it("eraser segment touching", () => {
    const s = stroke([0, 0, 100, 0], 2);
    expect(segmentTouches(s, 50, -50, 50, 50, 5)).toBe(true);
    expect(segmentTouches(s, 200, -50, 200, 50, 5)).toBe(false);
  });
});

describe("bounds and transforms", () => {
  it("bounds include stroke width", () => {
    const b = bounds(stroke([10, 10, 20, 10], 10));
    expect(b.x).toBeLessThanOrEqual(0);
    expect(b.y).toBeLessThanOrEqual(0);
  });

  it("rotated bounds of a square at 45°", () => {
    const b = rotatedBounds({ x: 0, y: 0, w: 100, h: 100 }, Math.PI / 4);
    expect(b.w).toBeCloseTo(141.42, 1);
  });

  it("translate/rotate round trip leaves geometry unchanged", () => {
    const s = stroke([0, 0, 50, 80, 90, 10]);
    const back = rotate(rotate(s, { x: 30, y: 30 }, 1.1), { x: 30, y: 30 }, -1.1);
    back.kind === "stroke" && back.pts.forEach((v, i) => expect(v).toBeCloseTo(s.pts[i], 6));
    const t = translate(translate(s, 5, -7), -5, 7);
    expect(t).toEqual(s);
  });

  it("scaling about a corner keeps that corner fixed", () => {
    const r = rect(100, 100, 200, 200);
    const s = scale(r, { x: 100, y: 100 }, 2, 3);
    expect(s.kind === "shape" && [s.x1, s.y1, s.x2, s.y2]).toEqual([100, 100, 300, 400]);
  });

  it("negative scale flips an image instead of producing a negative size", () => {
    const im = image(0, 0, 100, 50);
    const s = scale(im, { x: 50, y: 25 }, -1, 1);
    expect(s.kind === "image" && s.w).toBe(100);
    expect(s.kind === "image" && s.flipX).toBe(true);
  });

  it("selection frame spans all objects", () => {
    const f = selectionFrame([rect(0, 0, 10, 10), marker(100, 100)])!;
    expect(f).toEqual({ x: 0, y: 0, w: 120, h: 120 });
  });

  it("angle helpers", () => {
    expect(normAngle(Math.PI * 4)).toBe(0);
    expect(normAngle(Math.PI * 1.5)).toBeCloseTo(-Math.PI / 2);
    const s = snapAngle(100, 5, 15);
    expect(s.dy).toBeCloseTo(0);
    expect(s.dx).toBeCloseTo(Math.hypot(100, 5));
  });
});
