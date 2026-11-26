import type { Change } from "./scene";

export interface Action {
  label: string;
  changes: Change[];
  time: number;
}

/** Per-overlay undo/redo stacks. Global ordering is routed by the Rust side. */
export class History {
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
  constructor(private readonly limit = 300) {}

  push(a: Action): void {
    if (a.changes.length === 0) return;
    this.undoStack.push(a);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack = [];
  }
  popUndo(): Action | undefined {
    const a = this.undoStack.pop();
    if (a) this.redoStack.push(a);
    return a;
  }
  popRedo(): Action | undefined {
    const a = this.redoStack.pop();
    if (a) this.undoStack.push(a);
    return a;
  }
  clearRedo(): void {
    this.redoStack = [];
  }
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  /** Most recent labels, newest first (for the quick history list). */
  recent(n = 10): string[] {
    return this.undoStack.slice(-n).reverse().map((a) => a.label);
  }
}

/** Builders for the common kinds of change. */
export const changes = {
  add(objs: readonly import("./model").SceneObj[], startIndex: number): Change[] {
    return objs.map((obj, i) => ({ id: obj.id, before: null, after: { obj, index: startIndex + i } }));
  },
};
