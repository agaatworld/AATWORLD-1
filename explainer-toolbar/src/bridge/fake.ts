/**
 * Browser stand-in for the Rust backend, used ONLY when the pages run
 * outside the desktop app (development preview, automated UI tests,
 * screenshots). State lives in localStorage so several frames/tabs share it;
 * events travel over a BroadcastChannel, like Tauri events reach every
 * window. Native behaviour (click-through, hotkeys, monitors) is simulated
 * and therefore NOT evidence that the Windows build works.
 */
import type { Bootstrap, EventMap, LayoutReply, LayoutRequest, Mode, ModeEvent, ModeInfo, MonitorInfo, WorkspaceIndex } from "./types";

type Cb = (p: unknown) => void;

const CHANNEL = "explainer-fake-backend";
/** The simulated monitor is the browser viewport with a 40 px taskbar. */
function monitor(): MonitorInfo {
  const top = window.top ?? window;
  const w = top.innerWidth || 1366;
  const h = top.innerHeight || 768;
  return { key: "DISPLAY1", name: "\\\\.\\DISPLAY1", x: 0, y: 0, width: w, height: h, scale: 1, workX: 0, workY: 0, workWidth: w, workHeight: h - 40, primary: true };
}

function next(mode: Mode, e: ModeEvent): Mode | null {
  if (mode === "shuttingDown") return null;
  if (e === "quit") return "shuttingDown";
  switch (mode) {
    case "initializing":
      return e === "ready" ? "desktop" : e === "frontendLost" ? "recovering" : null;
    case "desktop":
      return e === "enterAnnotation" || e === "toggleAnnotation" ? "annotating" : e === "hideInk" || e === "toggleInk" ? "hidden" : e === "frontendLost" ? "recovering" : mode;
    case "annotating":
      return e === "exitAnnotation" || e === "toggleAnnotation" ? "desktop" : e === "hideInk" || e === "toggleInk" ? "hidden" : e === "frontendLost" ? "recovering" : mode;
    case "hidden":
      return e === "showInk" || e === "toggleInk" ? "desktop" : e === "enterAnnotation" || e === "toggleAnnotation" ? "annotating" : e === "frontendLost" ? "recovering" : mode;
    case "recovering":
      return e === "recoveryDone" ? "desktop" : ["enterAnnotation", "toggleAnnotation", "hideInk", "showInk", "toggleInk"].includes(e) ? null : mode;
  }
}

function mergePatch(target: unknown, patch: unknown): unknown {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch;
  const t: Record<string, unknown> = target && typeof target === "object" && !Array.isArray(target) ? { ...(target as Record<string, unknown>) } : {};
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (v === null) delete t[k];
    else t[k] = mergePatch(t[k], v);
  }
  return t;
}

const ls = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(`fake.${k}`);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(`fake.${k}`, JSON.stringify(v));
    } catch {
      /* quota: ignore in the simulation */
    }
  },
};

class FakeBackend {
  private ch = new BroadcastChannel(CHANNEL);
  private subs = new Map<string, Set<Cb>>();
  readonly label: string;

  constructor() {
    const q = new URLSearchParams(location.search);
    const view = q.get("view") ?? "toolbar";
    this.label = view === "overlay" ? `overlay-${q.get("monitor") ?? "DISPLAY1"}` : view;
    this.ch.onmessage = (m) => this.deliver(m.data.event, m.data.payload);
    if (!ls.get("mode", null)) ls.set("mode", { mode: "desktop", revision: 1 });
  }

  private deliver(event: string, payload: unknown) {
    this.subs.get(event)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error(e);
      }
    });
  }

  emit(event: string, payload: unknown) {
    this.ch.postMessage({ event, payload });
    this.deliver(event, payload);
  }

  listen(event: string, cb: Cb): () => void {
    let s = this.subs.get(event);
    if (!s) this.subs.set(event, (s = new Set()));
    s.add(cb);
    return () => s!.delete(cb);
  }

  private settings() {
    return ls.get<{ revision: number; doc: Record<string, unknown> }>("settings", {
      revision: 0,
      doc: { schemaVersion: 1, shortcuts: { toggleAnnotation: "Ctrl+Shift+Space", toggleToolbar: "Ctrl+Shift+F12", toggleInk: "Ctrl+Shift+F11", clearAll: "Ctrl+Shift+F10" }, toolbar: { anchor: null } },
    });
  }
  private workspaces(): WorkspaceIndex {
    return ls.get("workspaces", { active: "default", list: [{ id: "default", name: "Workspace 1" }] });
  }
  private history() {
    return ls.get<{ undo: string[][]; redo: string[][] }>("history", { undo: [], redo: [] });
  }
  private setMode(e: ModeEvent): ModeInfo {
    const cur = ls.get<ModeInfo>("mode", { mode: "desktop", revision: 1 });
    const n = next(cur.mode, e);
    if (n === null) throw new Error("not possible right now");
    if (n === cur.mode) return cur;
    const info = { mode: n, revision: cur.revision + 1 };
    ls.set("mode", info);
    this.emit("mode://changed", info);
    return info;
  }

  async invoke<T>(cmd: string, a: Record<string, unknown> | Uint8Array = {}): Promise<T> {
    const args = a as Record<string, unknown>;
    const r = (v: unknown) => Promise.resolve(v as T);
    switch (cmd) {
      case "get_bootstrap": {
        const h = this.history();
        const b: Bootstrap = {
          label: this.label,
          monitor: this.label.startsWith("overlay-") ? monitor() : null,
          monitors: [monitor()],
          mode: ls.get("mode", { mode: "desktop", revision: 1 }),
          settings: this.settings(),
          workspaces: this.workspaces(),
          shortcuts: [],
          history: { canUndo: h.undo.length > 0, canRedo: h.redo.length > 0 },
          version: "0.1.0-preview",
          selfTest: false,
          toolbarVisible: true,
        };
        return r(b);
      }
      case "request_mode":
        return r(this.setMode(args.event as ModeEvent));
      case "update_settings": {
        const s = this.settings();
        const doc = mergePatch(s.doc, args.patch) as Record<string, unknown>;
        const snap = { revision: s.revision + 1, doc };
        ls.set("settings", snap);
        this.emit("settings://changed", snap);
        return r(snap.revision);
      }
      case "toolbar_layout": {
        // Same rules as explainer-core::layout::place (pill stays put unless
        // it would leave the work area; the window shifts instead).
        const req = args.request as LayoutRequest;
        const W = monitor().workWidth;
        const H = monitor().workHeight;
        const clamp = (v: number, size: number, max: number) => (size >= max ? 0 : Math.max(0, Math.min(max - size, v)));
        const saved = ls.get("anchor", { x: 16, y: 120 });
        const ax = clamp(saved.x, req.pillWidth, W);
        const ay = clamp(saved.y, req.pillHeight, H);
        const wx = clamp(ax - req.dx, req.width, W);
        const wy = clamp(ay - req.dy, req.height, H);
        const px = Math.max(wx, Math.min(ax, wx + req.width - req.pillWidth));
        const py = Math.max(wy, Math.min(ay, wy + req.height - req.pillHeight));
        const reply: LayoutReply = {
          dx: px - wx,
          dy: py - wy,
          spaceLeft: px,
          spaceRight: W - px - req.pillWidth,
          spaceTop: py,
          spaceBottom: H - py - req.pillHeight,
          workWidth: W,
          workHeight: H,
          scale: 1,
        };
        this.emit("harness://toolbar", { x: wx, y: wy, w: req.width, h: req.height });
        return r(reply);
      }
      case "record_edit": {
        const h = this.history();
        const key = this.label.replace(/^overlay-/, "");
        const group = args.group as string | null | undefined;
        const last = ls.get<string | null>("lastGroup", null);
        if (group && group === last && h.undo.length) {
          const top = h.undo[h.undo.length - 1];
          if (!top.includes(key)) top.push(key);
        } else {
          h.undo.push([key]);
          if (h.redo.length) this.emit("history://clear-redo", null);
          h.redo = [];
        }
        ls.set("lastGroup", group ?? null);
        ls.set("history", h);
        this.emit("history://state", { canUndo: h.undo.length > 0, canRedo: false });
        return r(undefined);
      }
      case "undo":
      case "redo": {
        const h = this.history();
        const from = cmd === "undo" ? h.undo : h.redo;
        const to = cmd === "undo" ? h.redo : h.undo;
        const t = from.pop();
        if (t) {
          to.push(t);
          this.emit("history://apply", { op: cmd, targets: t });
        }
        ls.set("lastGroup", null);
        ls.set("history", h);
        this.emit("history://state", { canUndo: h.undo.length > 0, canRedo: h.redo.length > 0 });
        return r(!!t);
      }
      case "clear_all":
        this.emit("scene://clear", { group: `clear-${Date.now()}` });
        return r(undefined);
      case "load_scene": {
        const key = this.label.replace(/^overlay-/, "");
        return r({ json: ls.get<string | null>(`scene.${this.workspaces().active}.${key}`, null), generation: ls.get("generation", 1) });
      }
      case "save_scene": {
        if (args.generation !== ls.get("generation", 1)) throw new Error("stale");
        const key = this.label.replace(/^overlay-/, "");
        ls.set(`scene.${this.workspaces().active}.${key}`, args.json);
        return r(undefined);
      }
      case "overlay_command":
        this.emit("overlay://command", { target: "DISPLAY1", command: args.command });
        return r(undefined);
      case "pick_image":
        return r(null);
      case "import_image_bytes": {
        const bytes = a as Uint8Array;
        let s = "";
        bytes.forEach((b) => (s += String.fromCharCode(b)));
        const name = `${Array.from(bytes.slice(0, 8)).map((b) => b.toString(16).padStart(2, "0")).join("")}${bytes.length.toString(16).padStart(8, "0")}.png`;
        ls.set(`asset.${name}`, btoa(s));
        return r(name);
      }
      case "read_asset": {
        const b64 = ls.get<string | null>(`asset.${args.name}`, null);
        if (!b64) throw new Error("image file missing");
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return r(out.buffer);
      }
      case "create_workspace": {
        const w = this.workspaces();
        w.list.push({ id: `ws-${w.list.length + 1}`, name: String(args.name ?? "Workspace") });
        ls.set("workspaces", w);
        this.emit("workspaces://list", w);
        return r(w);
      }
      case "rename_workspace": {
        const w = this.workspaces();
        const it = w.list.find((x) => x.id === args.id);
        if (it) it.name = String(args.name);
        ls.set("workspaces", w);
        this.emit("workspaces://list", w);
        return r(w);
      }
      case "delete_workspace": {
        const w = this.workspaces();
        if (w.active === args.id) throw new Error("switch to another workspace before deleting this one");
        w.list = w.list.filter((x) => x.id !== args.id);
        ls.set("workspaces", w);
        this.emit("workspaces://list", w);
        return r(w);
      }
      case "switch_workspace": {
        const w = this.workspaces();
        this.emit("app://flush", 1);
        await new Promise((res) => setTimeout(res, 50));
        w.active = String(args.id);
        ls.set("workspaces", w);
        ls.set("generation", ls.get("generation", 1) + 1);
        ls.set("history", { undo: [], redo: [] });
        this.emit("workspace://switched", w);
        this.emit("history://state", { canUndo: false, canRedo: false });
        return r(w);
      }
      case "validate_shortcut": {
        const s = String(args.accelerator);
        if (!/(Ctrl|Alt)\+/.test(s) && !/^F(1[3-9]|2[0-4])$/.test(s)) throw new Error("include Ctrl or Alt so normal typing is not affected");
        return r(s);
      }
      case "shortcut_status":
        return r([]);
      case "list_backups":
        return r(ls.get("backups", [] as string[]));
      case "backup_now": {
        const name = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15).replace("T", "-");
        const list = [name, ...ls.get("backups", [] as string[])].slice(0, 10);
        ls.set("backups", list);
        return r(name);
      }
      case "diagnostics":
        return r("Explainer Toolbar browser preview (simulated backend)\nMode: " + ls.get("mode", { mode: "desktop" }).mode);
      case "set_toolbar_visible":
      case "reset_toolbar_position":
      case "open_settings":
      case "open_folder":
      case "restore_backup":
      case "quit_app":
      case "toolbar_start_drag":
      case "overlay_ready":
      case "heartbeat":
      case "report_content":
      case "report_failure":
      case "escape_reply":
      case "flush_done":
        return r(undefined);
      default:
        throw new Error(`fake backend: unknown command ${cmd}`);
    }
  }
}

let instance: FakeBackend | null = null;
export function fakeBackend(): FakeBackend {
  if (!instance) instance = new FakeBackend();
  return instance;
}

export type { EventMap };
