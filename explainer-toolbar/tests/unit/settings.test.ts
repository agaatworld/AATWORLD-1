import { describe, expect, it } from "vitest";
import { DEFAULT_UI, sanitizeUi, styleFor, pushRecent } from "../../src/shared/settings";

describe("ui settings", () => {
  it("garbage becomes defaults, never throws", () => {
    for (const g of [null, 3, "x", [], { pinned: "no", styles: 7, presets: [1, null] }]) {
      expect(() => sanitizeUi(g)).not.toThrow();
    }
    expect(sanitizeUi(undefined)).toEqual(DEFAULT_UI);
  });

  it("drops unknown tools and colours, de-duplicates pins", () => {
    const u = sanitizeUi({ pinned: ["pen", "pen", "rocket", "rect"], favorites: ["#fff", "red", "#00ff00"], tool: "rocket" });
    expect(u.pinned).toEqual(["pen", "rect"]);
    expect(u.favorites).toEqual(["#FFF", "#00FF00"]);
    expect(u.tool).toBe(DEFAULT_UI.tool);
  });

  it("styleFor merges group style, keeps shape fill", () => {
    const u = sanitizeUi({ styles: { shape: { fill: "#123456", width: 9 } } });
    const s = styleFor(u, "ellipse");
    expect(s.fill).toBe("#123456");
    expect(s.width).toBe(9);
    expect(styleFor(u, "arrow").fill).toBe("#123456");
  });

  it("clamps numbers", () => {
    const u = sanitizeUi({ styles: { pen: { width: 9999, opacity: -1 } }, smoothing: 5 });
    expect(u.styles.pen.width).toBe(120);
    expect(u.styles.pen.opacity).toBe(0.05);
    expect(u.smoothing).toBe(1);
  });

  it("pushRecent", () => {
    expect(pushRecent(["a", "b", "c"], "b", 3)).toEqual(["b", "a", "c"]);
    expect(pushRecent(["a", "b", "c"], "d", 3)).toEqual(["d", "a", "b"]);
  });
});
