import { bounds, type Rect } from "./geometry";
import type { Id, SceneObj } from "./model";
import { GridIndex } from "./spatial";

/** One recorded change: object state and z-index before and after an action. */
export interface Change {
  id: Id;
  before: { obj: SceneObj; index: number } | null;
  after: { obj: SceneObj; index: number } | null;
}

/**
 * Ordered list of objects (array order = z-order, last on top) with an id
 * index and a spatial index kept in sync. Objects are treated as immutable:
 * an edit replaces the object with a new one, which makes undo snapshots
 * cheap and safe.
 */
export class Scene {
  private list: SceneObj[] = [];
  private pos = new Map<Id, number>();
  private grid = new GridIndex(256);
  private boundsCache = new Map<Id, Rect>();

  get objects(): readonly SceneObj[] {
    return this.list;
  }
  get length(): number {
    return this.list.length;
  }

  get(id: Id): SceneObj | undefined {
    const i = this.pos.get(id);
    return i === undefined ? undefined : this.list[i];
  }
  indexOf(id: Id): number {
    return this.pos.get(id) ?? -1;
  }
  has(id: Id): boolean {
    return this.pos.has(id);
  }
  boundsOf(id: Id): Rect | undefined {
    return this.boundsCache.get(id);
  }

  private reindexFrom(start: number): void {
    for (let i = start; i < this.list.length; i++) this.pos.set(this.list[i].id, i);
  }

  private track(o: SceneObj): void {
    const b = bounds(o);
    this.boundsCache.set(o.id, b);
    this.grid.insert(o.id, b);
  }

  private untrack(id: Id): void {
    this.boundsCache.delete(id);
    this.grid.remove(id);
  }

  reset(objs: SceneObj[]): void {
    this.list = [];
    this.pos.clear();
    this.grid.clear();
    this.boundsCache.clear();
    const seen = new Set<Id>();
    for (const o of objs) {
      if (seen.has(o.id)) continue; // duplicate ids would corrupt the indices
      seen.add(o.id);
      this.list.push(o);
      this.track(o);
    }
    this.reindexFrom(0);
  }

  insertAt(o: SceneObj, index: number): void {
    if (this.pos.has(o.id)) throw new Error(`duplicate object id ${o.id}`);
    const i = Math.max(0, Math.min(index, this.list.length));
    this.list.splice(i, 0, o);
    this.reindexFrom(i);
    this.track(o);
  }

  removeById(id: Id): { obj: SceneObj; index: number } | null {
    const i = this.pos.get(id);
    if (i === undefined) return null;
    const [obj] = this.list.splice(i, 1);
    this.pos.delete(id);
    this.reindexFrom(i);
    this.untrack(id);
    return { obj, index: i };
  }

  replace(o: SceneObj): void {
    const i = this.pos.get(o.id);
    if (i === undefined) throw new Error(`unknown object id ${o.id}`);
    this.list[i] = o;
    this.track(o);
  }

  /** Objects whose bounds intersect `r`, in z-order. */
  query(r: Rect): SceneObj[] {
    const ids = this.grid.query(r);
    const out: SceneObj[] = [];
    for (const id of ids) {
      const b = this.boundsCache.get(id);
      if (!b) continue;
      if (b.x <= r.x + r.w && r.x <= b.x + b.w && b.y <= r.y + r.h && r.y <= b.y + b.h) {
        const o = this.get(id);
        if (o) out.push(o);
      }
    }
    out.sort((a, b) => this.indexOf(a.id) - this.indexOf(b.id));
    return out;
  }

  /**
   * Apply recorded changes in one direction. For "after" (redo) the scene
   * must currently be in the before-state and vice versa. Returns the union
   * of affected bounds for partial redraw.
   */
  apply(changes: readonly Change[], dir: "before" | "after"): Rect | null {
    const from = dir === "after" ? "before" : "after";
    let dirty: Rect | null = null;
    const grow = (o: SceneObj) => {
      const b = bounds(o);
      dirty = dirty
        ? (() => {
            const d = dirty as Rect;
            const x = Math.min(d.x, b.x);
            const y = Math.min(d.y, b.y);
            return { x, y, w: Math.max(d.x + d.w, b.x + b.w) - x, h: Math.max(d.y + d.h, b.y + b.h) - y };
          })()
        : b;
    };
    for (const c of changes) {
      const src = c[from];
      if (src) {
        const removed = this.removeById(c.id);
        if (removed) grow(removed.obj);
      }
    }
    const inserts = changes
      .map((c) => c[dir])
      .filter((x): x is { obj: SceneObj; index: number } => x !== null)
      .sort((a, b) => a.index - b.index);
    for (const ins of inserts) {
      this.insertAt(ins.obj, ins.index);
      grow(ins.obj);
    }
    return dirty;
  }
}
