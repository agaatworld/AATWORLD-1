import { beforeEach, describe, expect, it } from "vitest";
import { Editor, type EditorEvent, type PointerSample } from "../../src/engine/editor";

function setup(dpr = 1) {
  const events: EditorEvent[] = [];
  let t = 0;
  const frames: (() => void)[] = [];
  const ed = new Editor({ base: null, live: null, raf: (cb) => frames.push(cb), now: () => t, emit: (e) => events.push(e), accent: "#ff6a3d" });
  ed.resize(1920, 1080, dpr);
  const P = (x: number, y: number, o: Partial<PointerSample> = {}): PointerSample => ({ x, y, pressure: 0.5, type: "mouse", shift: false, alt: false, ctrl: false, time: (t += 16), ...o });
  const drag = (pts: [number, number][], o: Partial<PointerSample> = {}) => {
    ed.pointerDown(P(pts[0][0], pts[0][1], o));
    ed.pointerMove(pts.slice(1).map(([x, y]) => P(x, y, o)));
    ed.pointerUp(P(pts[pts.length - 1][0], pts[pts.length - 1][1], o));
  };
  const committed = () => events.filter((e) => e.type === "committed").length;
  return { ed, events, P, drag, committed, flush: () => frames.splice(0).forEach((f) => f()) };
}

describe("editor", () => {
  let s: ReturnType<typeof setup>;
  beforeEach(() => (s = setup()));

  it("draws a pen stroke as exactly one undoable action", () => {
    s.ed.setTool("pen", { color: "#00ff00", width: 6 });
    s.drag([[10, 10], [50, 50], [90, 20]]);
    expect(s.ed.scene.length).toBe(1);
    expect(s.committed()).toBe(1);
    const o = s.ed.scene.objects[0];
    expect(o.kind === "stroke" && o.color).toBe("#00ff00");
    // a stray second pointerup must not commit again (regression: double commit)
    s.ed.pointerUp(s.P(90, 20));
    expect(s.ed.scene.length).toBe(1);
    expect(s.committed()).toBe(1);
    expect(s.ed.undo()).toBe(true);
    expect(s.ed.scene.length).toBe(0);
    expect(s.ed.redo()).toBe(true);
    expect(s.ed.scene.length).toBe(1);
  });

  it("converts logical widths to device px once, at creation", () => {
    const h = setup(1.5);
    h.ed.setTool("pen", { width: 4 });
    h.drag([[0, 0], [30, 30]]);
    const o = h.ed.scene.objects[0];
    expect(o.kind === "stroke" && o.width).toBe(6);
  });

  it("shift draws squares and snaps lines to 15°", () => {
    s.ed.setTool("rect");
    s.drag([[100, 100], [300, 180]], { shift: true });
    const r = s.ed.scene.objects[0];
    expect(r.kind === "shape" && [r.x2 - r.x1, r.y2 - r.y1]).toEqual([200, 200]);
    s.ed.setTool("line");
    s.drag([[0, 0], [200, 7]], { shift: true });
    const l = s.ed.scene.objects[1];
    expect(l.kind === "shape" && Math.round(l.y2)).toBe(0);
  });

  it("ignores accidental tiny shapes (a click is not a rectangle)", () => {
    s.ed.setTool("ellipse");
    s.drag([[100, 100], [101, 101]]);
    expect(s.ed.scene.length).toBe(0);
  });

  it("object eraser deletes whole strokes in one step; undo restores them", () => {
    s.ed.setTool("pen");
    s.drag([[0, 100], [400, 100]]);
    s.drag([[0, 300], [400, 300]]);
    s.ed.setTool("eraser", { eraserSize: 20 });
    s.drag([[200, 50], [200, 150]]);
    expect(s.ed.scene.length).toBe(1);
    s.ed.undo();
    expect(s.ed.scene.length).toBe(2);
  });

  it("pixel eraser records an erase object that undo removes", () => {
    s.ed.setTool("pen");
    s.drag([[0, 100], [400, 100]]);
    s.ed.setTool("pixelEraser");
    s.drag([[200, 50], [200, 150]]);
    expect(s.ed.scene.objects.map((o) => o.kind)).toEqual(["stroke", "erase"]);
    expect(s.ed.hasContent).toBe(true);
    s.ed.undo();
    expect(s.ed.scene.objects.map((o) => o.kind)).toEqual(["stroke"]);
  });

  it("select, move, resize and rotate are each one undo step", () => {
    s.ed.setTool("rect", { fill: "#123456" });
    s.drag([[100, 100], [200, 200]]);
    s.ed.setTool("select");
    s.drag([[150, 150], [250, 170]]);
    let o = s.ed.scene.objects[0];
    expect(o.kind === "shape" && [o.x1, o.y1]).toEqual([200, 120]);
    expect(o.kind === "shape" && o.fill).toBe("#123456");
    // resize from the south-east handle (frame padded by 6 px)
    s.drag([[306, 226], [406, 326]]);
    o = s.ed.scene.objects[0];
    expect(o.kind === "shape" && Math.round(o.x2 - o.x1)).toBeGreaterThan(150);
    s.ed.undo();
    o = s.ed.scene.objects[0];
    expect(o.kind === "shape" && [o.x1, o.y1, o.x2, o.y2]).toEqual([200, 120, 300, 220]);
    s.ed.undo();
    o = s.ed.scene.objects[0];
    expect(o.kind === "shape" && [o.x1, o.y1]).toEqual([100, 100]);
  });

  it("clicking an object without dragging does not create an undo step", () => {
    s.ed.setTool("rect");
    s.drag([[100, 100], [200, 200]]);
    const before = s.committed();
    s.ed.setTool("select");
    s.drag([[100, 150], [100, 150]]);
    expect(s.committed()).toBe(before);
    expect(s.ed.selectedIds).toHaveLength(1);
  });

  it("marquee selects intersecting objects", () => {
    s.ed.setTool("marker");
    s.ed.pointerDown(s.P(100, 100));
    s.ed.pointerUp(s.P(100, 100));
    s.ed.pointerDown(s.P(800, 800));
    s.ed.pointerUp(s.P(800, 800));
    s.ed.setTool("select");
    s.drag([[50, 50], [150, 150]]);
    expect(s.ed.selectedIds).toHaveLength(1);
  });

  it("step markers number themselves and continue after undo", () => {
    s.ed.setTool("marker");
    for (const x of [10, 60, 110]) {
      s.ed.pointerDown(s.P(x, 10));
      s.ed.pointerUp(s.P(x, 10));
    }
    expect(s.ed.scene.objects.map((o) => o.kind === "marker" && o.n)).toEqual([1, 2, 3]);
    s.ed.undo();
    s.ed.pointerDown(s.P(200, 10));
    s.ed.pointerUp(s.P(200, 10));
    expect(s.ed.scene.objects.map((o) => o.kind === "marker" && o.n)).toEqual([1, 2, 3]);
  });

  it("text: new, edit, and empty text deletes", () => {
    s.ed.setTool("text");
    s.ed.pointerDown(s.P(300, 300));
    expect(s.ed.textEdit).not.toBeNull();
    s.ed.commitText("مرحبا بالعالم");
    expect(s.ed.scene.length).toBe(1);
    const t = s.ed.scene.objects[0];
    expect(t.kind === "text" && t.w).toBeGreaterThan(10);
    // edit it with the text tool
    s.ed.pointerDown(s.P(t.kind === "text" ? t.x + 5 : 0, t.kind === "text" ? t.y + 5 : 0));
    expect(s.ed.textEdit?.id).toBe(t.id);
    s.ed.commitText("Hello");
    expect(s.ed.scene.objects[0].kind === "text" && (s.ed.scene.objects[0] as { text: string }).text).toBe("Hello");
    s.ed.pointerDown(s.P(t.kind === "text" ? t.x + 5 : 0, t.kind === "text" ? t.y + 5 : 0));
    s.ed.commitText("   ");
    expect(s.ed.scene.length).toBe(0);
    s.ed.undo();
    expect(s.ed.scene.length).toBe(1);
  });

  it("escape is layered and never clears ink", () => {
    s.ed.setTool("pen");
    s.drag([[0, 0], [10, 10]]);
    s.ed.setTool("rect");
    s.ed.pointerDown(s.P(10, 10));
    s.ed.pointerMove([s.P(100, 100)]);
    expect(s.ed.escape()).toBe("consumed"); // cancels the shape
    s.ed.pointerUp(s.P(100, 100));
    expect(s.ed.scene.length).toBe(1);
    s.ed.selectAll();
    expect(s.ed.escape()).toBe("consumed"); // deselects
    expect(s.ed.escape()).toBe("none"); // nothing left: caller exits drawing mode
    expect(s.ed.scene.length).toBe(1);
  });

  it("clear all is one undoable step", () => {
    s.ed.setTool("pen");
    for (let i = 0; i < 5; i++) s.drag([[0, i * 20], [100, i * 20]]);
    expect(s.ed.clearAll()).toBe(true);
    expect(s.ed.scene.length).toBe(0);
    expect(s.ed.clearAll()).toBe(false);
    s.ed.undo();
    expect(s.ed.scene.length).toBe(5);
  });

  it("arrange forward/backward/front/back round-trips through undo", () => {
    s.ed.setTool("marker");
    for (const x of [10, 20, 30, 40]) {
      s.ed.pointerDown(s.P(x * 10, 10));
      s.ed.pointerUp(s.P(x * 10, 10));
    }
    const ids = s.ed.scene.objects.map((o) => o.id);
    s.ed.select([ids[1]]);
    s.ed.arrange("front");
    expect(s.ed.scene.objects.map((o) => o.id)).toEqual([ids[0], ids[2], ids[3], ids[1]]);
    s.ed.arrange("backward");
    expect(s.ed.scene.objects.map((o) => o.id)).toEqual([ids[0], ids[2], ids[1], ids[3]]);
    s.ed.arrange("back");
    expect(s.ed.scene.objects[0].id).toBe(ids[1]);
    s.ed.undo();
    s.ed.undo();
    s.ed.undo();
    expect(s.ed.scene.objects.map((o) => o.id)).toEqual(ids);
  });

  it("duplicate, delete, lock", () => {
    s.ed.setTool("rect");
    s.drag([[100, 100], [200, 200]]);
    s.ed.selectAll();
    const copies = s.ed.duplicateSelection();
    expect(copies).toHaveLength(1);
    expect(s.ed.scene.length).toBe(2);
    s.ed.setLocked(true);
    expect(s.ed.deleteSelection()).toBe(false);
    s.ed.setLocked(false);
    expect(s.ed.deleteSelection()).toBe(true);
    expect(s.ed.scene.length).toBe(1);
  });

  it("restyle keeps unrelated fields (shape fill survives a colour change)", () => {
    s.ed.setTool("rect", { fill: "#ff0000", fillOpacity: 0.4 });
    s.drag([[100, 100], [200, 200]]);
    s.ed.selectAll();
    s.ed.restyleSelection({ color: "#0000ff", width: 10 });
    const o = s.ed.scene.objects[0];
    expect(o.kind === "shape" && [o.color, o.fill, o.fillOpacity, o.width]).toEqual(["#0000ff", "#ff0000", 0.4, 10]);
    s.ed.restyleSelection({ fill: null });
    expect(s.ed.scene.objects[0].kind === "shape" && (s.ed.scene.objects[0] as { fill: string | null }).fill).toBe(null);
  });

  it("switching tools mid-gesture cancels it cleanly", () => {
    s.ed.setTool("pen");
    s.ed.pointerDown(s.P(0, 0));
    s.ed.pointerMove([s.P(50, 50)]);
    s.ed.setTool("rect");
    s.ed.pointerUp(s.P(50, 50));
    expect(s.ed.scene.length).toBe(0);
    expect(s.ed.busy).toBe(false);
  });

  it("stress: thousands of strokes and undo/redo cycles stay consistent", () => {
    s.ed.setTool("pen");
    for (let i = 0; i < 2000; i++) s.drag([[i % 1900, (i * 7) % 1000], [(i % 1900) + 20, ((i * 7) % 1000) + 20]]);
    expect(s.ed.scene.length).toBe(2000);
    for (let i = 0; i < 300; i++) s.ed.undo();
    expect(s.ed.scene.length).toBe(1700);
    for (let i = 0; i < 300; i++) s.ed.redo();
    expect(s.ed.scene.length).toBe(2000);
    const all = s.ed.scene.query({ x: -10, y: -10, w: 4000, h: 4000 });
    expect(all.length).toBe(2000);
  });

  it("images are placed centred, fit the screen and become selected", () => {
    const id = s.ed.insertImage("0123456789abcdef0123.png", 8000, 4000);
    const o = s.ed.scene.get(id)!;
    expect(o.kind === "image" && o.w).toBeLessThanOrEqual(1920 * 0.6 + 0.01);
    expect(s.ed.selectedIds).toEqual([id]);
    s.ed.restyleSelection({ flip: "x" });
    expect((s.ed.scene.get(id) as { flipX: boolean }).flipX).toBe(true);
  });

  it("serialize → load round trip", () => {
    s.ed.setTool("arrow");
    s.drag([[0, 0], [100, 100]]);
    s.ed.setBoard("whiteboard");
    const doc = s.ed.serialize();
    const h = setup();
    h.ed.load(JSON.parse(JSON.stringify(doc)));
    expect(h.ed.serialize()).toEqual(doc);
    expect(h.ed.history.canUndo).toBe(false);
  });
});
