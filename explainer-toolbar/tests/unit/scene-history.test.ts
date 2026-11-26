import { describe, expect, it } from "vitest";
import { Scene, type Change } from "../../src/engine/scene";
import { History } from "../../src/engine/history";
import type { SceneObj } from "../../src/engine/model";
import { translate } from "../../src/engine/transform";
import { rect, snapshot, stroke, marker } from "./fixtures";

/** Small deterministic PRNG so failures are reproducible. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function commit(scene: Scene, hist: History, label: string, changes: Change[]) {
  scene.apply(changes, "after");
  hist.push({ label, changes, time: 0 });
}

function randomAction(scene: Scene, r: () => number): Change[] {
  const objs = scene.objects;
  const pick = () => objs[Math.floor(r() * objs.length)];
  const roll = r();
  if (roll < 0.4 || objs.length === 0) {
    const o: SceneObj = r() < 0.5 ? stroke([r() * 500, r() * 500, r() * 500, r() * 500]) : rect(r() * 100, r() * 100, 200, 200);
    return [{ id: o.id, before: null, after: { obj: o, index: objs.length } }];
  }
  if (roll < 0.6) {
    // remove 1-3 objects
    const ids = new Set<string>();
    for (let i = 0; i < 1 + Math.floor(r() * 3); i++) ids.add(pick().id);
    return [...ids].map((id) => ({ id, before: { obj: scene.get(id)!, index: scene.indexOf(id) }, after: null }));
  }
  if (roll < 0.8) {
    const o = pick();
    const moved = translate(o, r() * 20, r() * 20);
    const i = scene.indexOf(o.id);
    return [{ id: o.id, before: { obj: o, index: i }, after: { obj: moved, index: i } }];
  }
  // bring a set to front
  const ids = [...new Set([pick().id, pick().id])];
  const rest = objs.filter((o) => !ids.includes(o.id));
  const after = [...rest, ...ids.map((id) => scene.get(id)!)];
  return ids.map((id) => ({
    id,
    before: { obj: scene.get(id)!, index: scene.indexOf(id) },
    after: { obj: scene.get(id)!, index: after.findIndex((o) => o.id === id) },
  }));
}

describe("scene + history", () => {
  it("undo of every random action sequence restores the exact earlier states", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const r = rng(seed);
      const scene = new Scene();
      const hist = new History(10_000);
      const states: string[] = [snapshot(scene.objects)];
      for (let step = 0; step < 60; step++) {
        commit(scene, hist, "op", randomAction(scene, r));
        states.push(snapshot(scene.objects));
      }
      // undo everything, checking each intermediate state
      for (let i = states.length - 2; i >= 0; i--) {
        hist.popUndo() && scene.apply(hist["redoStack"].at(-1)!.changes, "before");
        expect(snapshot(scene.objects), `seed ${seed} undo to ${i}`).toBe(states[i]);
      }
      // redo everything
      for (let i = 1; i < states.length; i++) {
        const a = hist.popRedo()!;
        scene.apply(a.changes, "after");
        expect(snapshot(scene.objects), `seed ${seed} redo to ${i}`).toBe(states[i]);
      }
    }
  });

  it("spatial queries stay consistent with the object list after edits", () => {
    const r = rng(7);
    const scene = new Scene();
    const hist = new History();
    for (let i = 0; i < 300; i++) commit(scene, hist, "op", randomAction(scene, r));
    const everything = scene.query({ x: -1e6, y: -1e6, w: 2e6, h: 2e6 });
    expect(everything.map((o) => o.id)).toEqual(scene.objects.map((o) => o.id));
    // index map agrees
    scene.objects.forEach((o, i) => expect(scene.indexOf(o.id)).toBe(i));
  });

  it("query returns only intersecting objects in z-order", () => {
    const scene = new Scene();
    const a = rect(0, 0, 100, 100);
    const b = rect(1000, 1000, 1100, 1100);
    const c = marker(50, 50);
    scene.reset([a, b, c]);
    expect(scene.query({ x: 40, y: 40, w: 20, h: 20 }).map((o) => o.id)).toEqual([a.id, c.id]);
  });

  it("reset drops duplicate ids instead of corrupting indices", () => {
    const scene = new Scene();
    const a = rect(0, 0, 10, 10);
    scene.reset([a, { ...a }, marker(1, 1)]);
    expect(scene.length).toBe(2);
  });

  it("history limit and redo clearing", () => {
    const h = new History(3);
    for (let i = 0; i < 5; i++) h.push({ label: `a${i}`, changes: [{ id: "x", before: null, after: null }], time: 0 });
    expect(h.recent()).toEqual(["a4", "a3", "a2"]);
    h.popUndo();
    expect(h.canRedo).toBe(true);
    h.push({ label: "b", changes: [{ id: "y", before: null, after: null }], time: 0 });
    expect(h.canRedo).toBe(false);
    h.push({ label: "empty", changes: [], time: 0 });
    expect(h.recent()[0]).toBe("b");
  });
});

describe("grid index edge cases", () => {
  it("huge queries return everything; huge objects are always candidates", async () => {
    const { GridIndex } = await import("../../src/engine/spatial");
    const g = new GridIndex(256);
    g.insert("small", { x: 5000, y: 5000, w: 10, h: 10 });
    g.insert("giant", { x: -1e6, y: -1e6, w: 2e6, h: 2e6 });
    expect([...g.query({ x: -1e7, y: -1e7, w: 2e7, h: 2e7 })].sort()).toEqual(["giant", "small"]);
    expect([...g.query({ x: 0, y: 0, w: 1, h: 1 })]).toEqual(["giant"]);
    g.remove("giant");
    expect([...g.query({ x: 0, y: 0, w: 1, h: 1 })]).toEqual([]);
    g.insert("nan", { x: NaN, y: 0, w: 1, h: 1 });
    expect(g.query({ x: 0, y: 0, w: 1, h: 1 }).has("nan")).toBe(true);
  });
});
