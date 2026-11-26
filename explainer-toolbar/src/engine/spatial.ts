import type { Rect } from "./geometry";
import type { Id } from "./model";

/**
 * Uniform grid spatial index. Each object is registered in every cell its
 * bounds overlap; queries return candidate ids (callers do exact tests).
 * Keeps hit testing and partial redraws independent of total ink volume.
 */
export class GridIndex {
  private cells = new Map<number, Set<Id>>();
  private objCells = new Map<Id, number[]>();
  /** Objects whose bounds span too many cells (corrupt or gigantic data). */
  private overflow = new Set<Id>();
  private static readonly MAX_CELLS = 40000;
  constructor(private readonly cell = 256) {}

  private key(cx: number, cy: number): number {
    // Supports negative cells; 2^20 cells each way is far beyond any screen.
    return (cx + 0x80000) * 0x100000 + (cy + 0x80000);
  }

  /** Cell keys covered by `r`, or null when that would exceed MAX_CELLS. */
  private cellsFor(r: Rect): number[] | null {
    const c = this.cell;
    const x0 = Math.floor(r.x / c);
    const y0 = Math.floor(r.y / c);
    const x1 = Math.floor((r.x + r.w) / c);
    const y1 = Math.floor((r.y + r.h) / c);
    if (!Number.isFinite(x0 + y0 + x1 + y1) || (x1 - x0 + 1) * (y1 - y0 + 1) > GridIndex.MAX_CELLS) return null;
    const out: number[] = [];
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) out.push(this.key(cx, cy));
    return out;
  }

  insert(id: Id, r: Rect): void {
    this.remove(id);
    const ks = this.cellsFor(r);
    if (ks === null) {
      this.overflow.add(id);
      this.objCells.set(id, []);
      return;
    }
    for (const k of ks) {
      let s = this.cells.get(k);
      if (!s) this.cells.set(k, (s = new Set()));
      s.add(id);
    }
    this.objCells.set(id, ks);
  }

  remove(id: Id): void {
    this.overflow.delete(id);
    const ks = this.objCells.get(id);
    if (!ks) return;
    for (const k of ks) {
      const s = this.cells.get(k);
      if (!s) continue;
      s.delete(id);
      if (s.size === 0) this.cells.delete(k);
    }
    this.objCells.delete(id);
  }

  query(r: Rect): Set<Id> {
    const ks = this.cellsFor(r);
    // A query too large for the grid simply returns every object.
    if (ks === null) return new Set(this.objCells.keys());
    const out = new Set<Id>(this.overflow);
    for (const k of ks) {
      const s = this.cells.get(k);
      if (s) for (const id of s) out.add(id);
    }
    return out;
  }

  clear(): void {
    this.cells.clear();
    this.objCells.clear();
    this.overflow.clear();
  }

  get size(): number {
    return this.objCells.size;
  }
}
