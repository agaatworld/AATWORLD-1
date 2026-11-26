import { useSyncExternalStore } from "react";
import { api } from "../bridge/api";
import { listenAll } from "../bridge/ipc";
import type { Bootstrap, HistoryState, ModeInfo, MonitorInfo, SettingsSnapshot, ShortcutStatus, WorkspaceIndex } from "../bridge/types";
import { setLanguage } from "./i18n";
import { log } from "./log";
import { DEFAULT_UI, sanitizeUi, type UiSettings } from "./settings";

/**
 * Per-window view of the shared application state. Rust is the source of
 * truth; this store mirrors its broadcasts and ignores stale ones (lower
 * revision), so out-of-order events can never roll the UI back.
 */
export interface AppSnapshot {
  ready: boolean;
  label: string;
  monitor: MonitorInfo | null;
  monitors: MonitorInfo[];
  mode: ModeInfo;
  settings: SettingsSnapshot;
  ui: UiSettings;
  history: HistoryState;
  workspaces: WorkspaceIndex;
  shortcuts: ShortcutStatus[];
  version: string;
  toolbarVisible: boolean;
  selfTest: boolean;
}

let snap: AppSnapshot = {
  ready: false,
  label: "",
  monitor: null,
  monitors: [],
  mode: { mode: "initializing", revision: 0 },
  settings: { revision: -1, doc: {} },
  ui: DEFAULT_UI,
  history: { canUndo: false, canRedo: false },
  workspaces: { active: "default", list: [] },
  shortcuts: [],
  version: "",
  toolbarVisible: true,
  selfTest: false,
};
const subs = new Set<() => void>();

function set(p: Partial<AppSnapshot>): void {
  snap = { ...snap, ...p };
  if (p.ui) applyAppearance(snap.ui);
  subs.forEach((f) => f());
}

export function getApp(): AppSnapshot {
  return snap;
}

export function useApp(): AppSnapshot {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => snap,
  );
}

function acceptSettings(s: SettingsSnapshot): void {
  if (s.revision < snap.settings.revision) return;
  set({ settings: s, ui: sanitizeUi((s.doc as Record<string, unknown>).ui) });
}

export async function initStore(): Promise<Bootstrap> {
  const b = await api.bootstrap();
  set({
    ready: true,
    label: b.label,
    monitor: b.monitor,
    monitors: b.monitors,
    mode: b.mode,
    settings: b.settings,
    ui: sanitizeUi((b.settings.doc as Record<string, unknown>).ui),
    history: b.history,
    workspaces: b.workspaces,
    shortcuts: b.shortcuts,
    version: b.version,
    toolbarVisible: b.toolbarVisible,
    selfTest: b.selfTest,
  });
  listenAll({
    "mode://changed": (m) => {
      if (m.revision >= snap.mode.revision) set({ mode: m });
    },
    "settings://changed": acceptSettings,
    "history://state": (h) => set({ history: h }),
    "workspaces://list": (w) => set({ workspaces: w }),
    "workspace://switched": (w) => set({ workspaces: w }),
    "shortcuts://status": (s) => set({ shortcuts: s }),
    "toolbar://visibility": (v) => set({ toolbarVisible: v }),
    "monitors://changed": (m) => set({ monitors: m, monitor: snap.monitor ? m.find((x) => x.key === snap.monitor!.key) ?? snap.monitor : null }),
  });
  return b;
}

/** Optimistic UI-settings update: applied locally at once, then persisted. */
export async function patchUi(patch: Partial<UiSettings>): Promise<void> {
  set({ ui: sanitizeUi({ ...snap.ui, ...patch }) });
  try {
    await api.updateSettings({ ui: patch });
  } catch (e) {
    void log("warn", `saving settings failed: ${String(e)}`);
  }
}

export async function patchSettings(patch: Record<string, unknown>): Promise<void> {
  await api.updateSettings(patch);
}

// ───────────────────────── appearance ─────────────────────────

const darkMq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
const motionMq = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
darkMq?.addEventListener("change", () => applyAppearance(snap.ui));
motionMq?.addEventListener("change", () => applyAppearance(snap.ui));

export function applyAppearance(ui: UiSettings): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  const theme = ui.theme === "system" ? (darkMq?.matches === false ? "light" : "dark") : ui.theme;
  const reduced = ui.reducedMotion === "system" ? !!motionMq?.matches : ui.reducedMotion === "on";
  el.dataset.theme = theme;
  el.dataset.motion = reduced ? "reduced" : "full";
  el.dataset.size = ui.iconSize;
  setLanguage(ui.language);
}

export function prefersReducedMotion(): boolean {
  return document.documentElement.dataset.motion === "reduced";
}
