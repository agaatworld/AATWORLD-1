/** Shapes exchanged with the Rust side (see src-tauri/src/commands.rs). */

export type Mode = "initializing" | "desktop" | "annotating" | "hidden" | "recovering" | "shuttingDown";
export type ModeEvent =
  | "ready"
  | "enterAnnotation"
  | "exitAnnotation"
  | "toggleAnnotation"
  | "hideInk"
  | "showInk"
  | "toggleInk"
  | "frontendLost"
  | "recoveryDone"
  | "quit";

export interface ModeInfo {
  mode: Mode;
  revision: number;
}

export interface MonitorInfo {
  key: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  workX: number;
  workY: number;
  workWidth: number;
  workHeight: number;
  primary: boolean;
}

export interface SettingsSnapshot {
  revision: number;
  doc: Record<string, unknown>;
}

export interface WorkspaceIndex {
  active: string;
  list: { id: string; name: string }[];
}

export interface ShortcutStatus {
  action: string;
  accelerator: string;
  ok: boolean;
  error: string | null;
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export interface Bootstrap {
  label: string;
  monitor: MonitorInfo | null;
  monitors: MonitorInfo[];
  mode: ModeInfo;
  settings: SettingsSnapshot;
  workspaces: WorkspaceIndex;
  shortcuts: ShortcutStatus[];
  history: HistoryState;
  version: string;
  selfTest: boolean;
  toolbarVisible: boolean;
}

export interface LayoutRequest {
  width: number;
  height: number;
  dx: number;
  dy: number;
  pillWidth: number;
  pillHeight: number;
}

export interface LayoutReply {
  dx: number;
  dy: number;
  spaceLeft: number;
  spaceRight: number;
  spaceTop: number;
  spaceBottom: number;
  workWidth: number;
  workHeight: number;
  scale: number;
}

export type OverlayCommand =
  | { type: "insertImage"; asset: string }
  | { type: "board"; value: "none" | "whiteboard" | "blackboard" | "toggleWhite" | "toggleBlack" };

/** Events emitted by Rust (name → payload). */
export interface EventMap {
  "mode://changed": ModeInfo;
  "settings://changed": SettingsSnapshot;
  "history://state": HistoryState;
  "history://apply": { op: "undo" | "redo"; targets: string[] };
  "history://clear-redo": null;
  "scene://clear": { group: string };
  "escape://request": number;
  "overlay://command": { target: string | null; command: OverlayCommand };
  "monitors://changed": MonitorInfo[];
  "workspaces://list": WorkspaceIndex;
  "workspace://switched": WorkspaceIndex;
  "app://flush": number;
  "toolbar://relayout": null;
  "toolbar://visibility": boolean;
  "shortcuts://status": ShortcutStatus[];
  "selftest://freeze": null;
}
