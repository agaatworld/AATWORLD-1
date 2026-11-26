import { describe, expect, it } from "vitest";
import { computeLayout, placePopover } from "../../src/toolbar/layout";

const pill = { w: 50, h: 400 };

describe("toolbar window layout", () => {
  it("no popover: window = pill + margin", () => {
    const l = computeLayout({ pill, margin: 14, orientation: "vertical", pop: null, space: null });
    expect(l.window).toEqual({ w: 78, h: 428 });
    expect(l.pillBox).toEqual({ x: 0, y: 0, w: 78, h: 428 });
  });

  it("opens to the right when there is room, aligned with the opener", () => {
    const l = computeLayout({ pill, margin: 14, orientation: "vertical", pop: { w: 280, h: 300, anchor: { x: 0, y: 100, w: 38, h: 38 } }, space: { left: 10, right: 1500, top: 300, bottom: 300 } });
    expect(l.side).toBe("right");
    expect(l.pillBox.x).toBe(0);
    expect(l.popBox!.x).toBeGreaterThan(50);
    expect(l.window.w).toBe(l.popBox!.x + l.popBox!.w);
  });

  it("opens to the left near the right screen edge (pill shifts inside the window)", () => {
    const l = computeLayout({ pill, margin: 14, orientation: "vertical", pop: { w: 280, h: 300, anchor: { x: 0, y: 100, w: 38, h: 38 } }, space: { left: 1500, right: 4, top: 300, bottom: 300 } });
    expect(l.side).toBe("left");
    expect(l.pillBox.x).toBeGreaterThan(0);
    expect(l.popBox!.x).toBeLessThan(0);
  });

  it("never extends a popover past the bottom of the monitor", () => {
    const l = computeLayout({ pill, margin: 14, orientation: "vertical", pop: { w: 280, h: 500, anchor: { x: 0, y: 360, w: 38, h: 38 } }, space: { left: 0, right: 900, top: 400, bottom: 20 } });
    expect(l.popBox!.y + l.popBox!.h).toBeLessThanOrEqual(428 + 20);
  });

  it("horizontal toolbar opens below, or above at the bottom edge", () => {
    const h = { w: 500, h: 50 };
    const below = computeLayout({ pill: h, margin: 14, orientation: "horizontal", pop: { w: 280, h: 300, anchor: { x: 200, y: 0, w: 38, h: 38 } }, space: { left: 300, right: 900, top: 10, bottom: 700 } });
    expect(below.side).toBe("bottom");
    const above = computeLayout({ pill: h, margin: 14, orientation: "horizontal", pop: { w: 280, h: 300, anchor: { x: 200, y: 0, w: 38, h: 38 } }, space: { left: 300, right: 900, top: 700, bottom: 10 } });
    expect(above.side).toBe("top");
    expect(above.pillBox.y).toBeGreaterThan(0);
  });

  it("placePopover clamps into the real window", () => {
    expect(placePopover({ w: 300, h: 300 }, { x: 0, y: 0 }, { x: 250, y: -20, w: 100, h: 100 })).toEqual({ x: 200, y: 0, w: 100, h: 100 });
  });
});
