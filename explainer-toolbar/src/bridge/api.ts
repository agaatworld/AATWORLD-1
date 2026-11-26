import { invoke } from "./ipc";
import type { Bootstrap, HistoryState, LayoutReply, LayoutRequest, ModeEvent, ModeInfo, OverlayCommand, ShortcutStatus, WorkspaceIndex } from "./types";

/** Typed wrappers for every Rust command. */
export const api = {
  bootstrap: () => invoke<Bootstrap>("get_bootstrap"),
  requestMode: (event: ModeEvent) => invoke<ModeInfo>("request_mode", { event }),
  overlayReady: (hasContent: boolean) => invoke<void>("overlay_ready", { hasContent }),
  heartbeat: () => invoke<void>("heartbeat"),
  reportContent: (hasContent: boolean) => invoke<void>("report_content", { hasContent }),
  reportFailure: (message: string) => invoke<void>("report_failure", { message }),
  toolbarLayout: (request: LayoutRequest) => invoke<LayoutReply>("toolbar_layout", { request }),
  startDrag: () => invoke<void>("toolbar_start_drag"),
  updateSettings: (patch: Record<string, unknown>) => invoke<number>("update_settings", { patch }),
  validateShortcut: (action: string, accelerator: string) => invoke<string>("validate_shortcut", { action, accelerator }),
  shortcutStatus: () => invoke<ShortcutStatus[]>("shortcut_status"),
  recordEdit: (group?: string) => invoke<void>("record_edit", { group: group ?? null }),
  undo: () => invoke<boolean>("undo"),
  redo: () => invoke<boolean>("redo"),
  clearAll: () => invoke<void>("clear_all"),
  escapeReply: (id: number, consumed: boolean) => invoke<void>("escape_reply", { id, consumed }),
  flushDone: (id: number) => invoke<void>("flush_done", { id }),
  loadScene: () => invoke<string | null>("load_scene"),
  saveScene: (json: string) => invoke<void>("save_scene", { json }),
  readAsset: (name: string) => invoke<ArrayBuffer>("read_asset", { name }),
  importImageBytes: (bytes: Uint8Array) => invoke<string>("import_image_bytes", bytes),
  pickImage: () => invoke<string | null>("pick_image"),
  overlayCommand: (command: OverlayCommand) => invoke<void>("overlay_command", { command }),
  createWorkspace: (name: string) => invoke<WorkspaceIndex>("create_workspace", { name }),
  renameWorkspace: (id: string, name: string) => invoke<WorkspaceIndex>("rename_workspace", { id, name }),
  deleteWorkspace: (id: string) => invoke<WorkspaceIndex>("delete_workspace", { id }),
  switchWorkspace: (id: string) => invoke<WorkspaceIndex>("switch_workspace", { id }),
  backupNow: () => invoke<string>("backup_now"),
  listBackups: () => invoke<string[]>("list_backups"),
  restoreBackup: (name: string) => invoke<void>("restore_backup", { name }),
  openFolder: (kind: "logs" | "data" | "backups") => invoke<void>("open_folder", { kind }),
  diagnostics: () => invoke<string>("diagnostics"),
  openSettings: () => invoke<void>("open_settings"),
  setToolbarVisible: (visible: boolean) => invoke<void>("set_toolbar_visible", { visible }),
  resetToolbarPosition: () => invoke<void>("reset_toolbar_position"),
  quit: () => invoke<void>("quit_app"),
};

export type { HistoryState };
