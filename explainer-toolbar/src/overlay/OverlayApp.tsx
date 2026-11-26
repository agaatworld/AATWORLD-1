import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../bridge/api";
import { listenAll } from "../bridge/ipc";
import { Editor, type EditorEvent, type PointerSample, type TextEdit, type ToolId } from "../engine/editor";
import type { Board } from "../engine/model";
import { parseScene } from "../engine/validate";
import { selectTool, setDrawing } from "../shared/actions";
import { t, useLang } from "../shared/i18n";
import { log } from "../shared/log";
import { pushRecent, styleFor } from "../shared/settings";
import { getApp, patchUi, useApp } from "../shared/store";
import { CATALOG, styleGroup } from "../shared/tools";
import { AssetCache } from "./assets";
import { Inspector } from "./Inspector";
import { TextBox } from "./TextBox";

const ACCENT = "#FF5A36";
const SAVE_DELAY = 600;

/**
 * One overlay per monitor. Renders ink at the monitor's native resolution
 * (canvas backing store = CSS size × devicePixelRatio) and keeps every
 * coordinate in physical pixels (see docs/COORDINATES.md).
 */
export function OverlayApp() {
  useLang();
  const app = useApp();
  const drawing = app.mode.mode === "annotating";
  const baseRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [dpr, setDpr] = useState(() => window.devicePixelRatio || 1);
  const [rev, setRev] = useState(0);
  const [textEdit, setTextEdit] = useState<TextEdit | null>(null);
  const [cursor, setCursor] = useState("crosshair");
  const [board, setBoardState] = useState<Board>("none");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const saveTimer = useRef<number | null>(null);
  const dirty = useRef(false);
  const lastContent = useRef<boolean | null>(null);
  const pendingGroup = useRef<string | null>(null);
  const frozen = useRef(false);
  const monitorKey = app.monitor?.key ?? "";

  const assets = useMemo(() => new AssetCache((name) => editorRef.current?.invalidateAsset(name)), []);

  const save = useCallback(async () => {
    const ed = editorRef.current;
    if (!ed || !dirty.current) return;
    dirty.current = false;
    const m = getApp().monitor;
    const doc = ed.serialize(m ? { key: m.key, width: m.width, height: m.height, scale: m.scale } : undefined);
    try {
      await api.saveScene(JSON.stringify(doc));
    } catch (e) {
      dirty.current = true;
      void log("error", `saving drawings failed: ${String(e)}`);
      setToast(t("common.error", { e: String(e) }));
    }
  }, []);

  const scheduleSave = useCallback(() => {
    dirty.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void save(), SAVE_DELAY);
  }, [save]);

  const reportContent = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const has = ed.scene.objects.some((o) => o.kind !== "erase");
    if (has !== lastContent.current) {
      lastContent.current = has;
      void api.reportContent(has);
    }
  }, []);

  // ───────── create the editor once ─────────
  useEffect(() => {
    const base = baseRef.current!;
    const live = liveRef.current!;
    const editor = new Editor(
      {
        base: base.getContext("2d"),
        live: live.getContext("2d"),
        raf: (cb) => requestAnimationFrame(cb),
        now: () => performance.now(),
        accent: ACCENT,
        emit: (e: EditorEvent) => {
          switch (e.type) {
            case "committed": {
              const g = pendingGroup.current;
              void api.recordEdit(g ?? undefined);
              scheduleSave();
              break;
            }
            case "changed":
              setBoardState(editorRef.current?.background ?? "none");
              setRev((r) => r + 1);
              reportContent();
              break;
            case "selection":
              setRev((r) => r + 1);
              break;
            case "textedit":
              setTextEdit(e.edit);
              break;
            case "cursor":
              setCursor(e.cursor);
              break;
          }
        },
      },
      { image: (n) => assets.get(n), missing: (n) => assets.missing(n) },
    );
    editorRef.current = editor;
    let cancelled = false;
    (async () => {
      try {
        const { doc, dropped } = parseScene(await api.loadScene());
        if (cancelled) return;
        resize();
        editor.load(doc);
        setBoardState(doc.background);
        if (dropped > 0) {
          void log("warn", `${dropped} damaged item(s) were skipped while loading drawings`);
        }
      } catch (e) {
        void log("error", `loading drawings failed: ${String(e)}`);
      }
      lastContent.current = editor.scene.objects.some((o) => o.kind !== "erase");
      setReady(true);
      void api.overlayReady(lastContent.current);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────── canvas size / DPI ─────────
  const resize = useCallback(() => {
    const ed = editorRef.current;
    const base = baseRef.current;
    const live = liveRef.current;
    if (!ed || !base || !live) return;
    const ratio = window.devicePixelRatio || 1;
    const w = Math.round(window.innerWidth * ratio);
    const h = Math.round(window.innerHeight * ratio);
    for (const c of [base, live]) {
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      c.style.width = `${window.innerWidth}px`;
      c.style.height = `${window.innerHeight}px`;
    }
    setDpr(ratio);
    ed.resize(w, h, ratio);
  }, []);

  useEffect(() => {
    let mq: MediaQueryList | null = null;
    const watchDpr = () => {
      mq?.removeEventListener("change", onDpr);
      mq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mq.addEventListener("change", onDpr);
    };
    const onDpr = () => {
      resize();
      watchDpr();
    };
    watchDpr();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      mq?.removeEventListener("change", onDpr);
    };
  }, [resize]);

  // ───────── tool + style from settings ─────────
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    if (ed.textEdit && ed.activeTool !== app.ui.tool) commitText();
    ed.setTool(app.ui.tool, styleFor(app.ui, app.ui.tool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.ui]);

  // ───────── mode changes: banner, heartbeat, cleanup ─────────
  useEffect(() => {
    const ed = editorRef.current;
    if (!drawing) {
      if (ed?.textEdit) commitText();
      ed?.cancelGesture();
      ed?.deselect();
      ed?.pointerLeave();
      setBanner(false);
      if (dirty.current) void save();
      return;
    }
    if (getApp().ui.modeBanner) {
      setBanner(true);
      const id = setTimeout(() => setBanner(false), 2400);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing]);

  useEffect(() => {
    if (!drawing) return;
    const beat = () => {
      if (!frozen.current) void api.heartbeat();
    };
    beat();
    const id = setInterval(beat, 1000);
    return () => clearInterval(id);
  }, [drawing]);

  // ───────── Rust events ─────────
  useEffect(
    () =>
      listenAll({
        "history://apply": ({ op, targets }) => {
          if (!targets.includes(monitorKey)) return;
          const ed = editorRef.current;
          if (!ed) return;
          if (op === "undo" ? ed.undo() : ed.redo()) scheduleSave();
        },
        "history://clear-redo": () => editorRef.current?.clearRedo(),
        "scene://clear": ({ group }) => {
          const ed = editorRef.current;
          if (!ed) return;
          pendingGroup.current = group;
          try {
            ed.clearAll();
          } finally {
            pendingGroup.current = null;
          }
        },
        "app://flush": async (id) => {
          if (textRef.current && editorRef.current?.textEdit) commitText();
          await save();
          void api.flushDone(id);
        },
        "escape://request": (id) => {
          if (frozen.current) return; // simulate a hung page (self-test)
          void api.escapeReply(id, handleEscape());
        },
        "overlay://command": ({ target, command }) => {
          if (target && target !== monitorKey) return;
          const ed = editorRef.current;
          if (!ed) return;
          if (command.type === "insertImage") void insertImage(command.asset);
          if (command.type === "board") {
            const cur = ed.background;
            const v = command.value === "toggleWhite" ? (cur === "whiteboard" ? "none" : "whiteboard") : command.value === "toggleBlack" ? (cur === "blackboard" ? "none" : "blackboard") : command.value;
            ed.setBoard(v);
            scheduleSave();
          }
        },
        "workspace://switched": async () => {
          const ed = editorRef.current;
          if (!ed) return;
          const { doc } = parseScene(await api.loadScene());
          ed.load(doc);
          setBoardState(doc.background);
          reportContent();
        },
        "selftest://freeze": () => {
          frozen.current = true;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monitorKey],
  );

  // ───────── helpers ─────────
  function commitText() {
    const ed = editorRef.current;
    if (ed?.textEdit) ed.commitText(textRef.current?.value ?? ed.textEdit.draft.text);
  }

  function handleEscape(): boolean {
    const ed = editorRef.current;
    if (!ed) return false;
    if (ed.textEdit) {
      commitText();
      return true;
    }
    return ed.escape() === "consumed";
  }

  async function insertImage(asset: string, at?: { x: number; y: number }) {
    const ed = editorRef.current;
    if (!ed) return;
    const bmp = await assets.load(asset);
    if (!bmp) {
      setToast(t("common.error", { e: "image" }));
      return;
    }
    ed.insertImage(asset, bmp.width, bmp.height, at);
    void patchUi({ tool: "select" });
  }

  // ───────── pointer input ─────────
  useEffect(() => {
    const canvas = liveRef.current!;
    let active: number | null = null;
    let penEraserRestore: ToolId | null = null;
    const ratio = () => window.devicePixelRatio || 1;
    const sample = (e: PointerEvent): PointerSample => ({
      x: e.clientX * ratio(),
      y: e.clientY * ratio(),
      pressure: e.pressure,
      type: e.pointerType === "pen" ? "pen" : e.pointerType === "touch" ? "touch" : "mouse",
      shift: e.shiftKey,
      alt: e.altKey,
      ctrl: e.ctrlKey || e.metaKey,
      time: e.timeStamp,
    });
    const down = (e: PointerEvent) => {
      const ed = editorRef.current;
      if (!ed || !drawingRef.current) return;
      if (e.button === 2) {
        // Right-click: back to the mouse (like ZoomIt).
        e.preventDefault();
        void setDrawing(false);
        return;
      }
      if (e.button !== 0 || active !== null) return;
      // Never let a click on the drawing surface move keyboard focus to an
      // element (it would blur an open text box and send typing to the tool
      // shortcuts), but do make sure this page receives the keyboard.
      e.preventDefault();
      if (!document.hasFocus()) window.focus();
      if (ed.textEdit) {
        // First click outside an open text box only commits it.
        commitText();
        e.preventDefault();
        return;
      }
      active = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      setBusy(true);
      // The eraser end of a stylus erases whole strokes for this gesture only.
      if (e.pointerType === "pen" && (e.buttons & 32) !== 0 && ed.activeTool !== "eraser") {
        penEraserRestore = ed.activeTool;
        ed.setTool("eraser", styleFor(getApp().ui, "eraser"));
      }
      ed.pointerDown(sample(e));
    };
    const move = (e: PointerEvent) => {
      const ed = editorRef.current;
      if (!ed || !drawingRef.current) return;
      if (active !== null && e.pointerId !== active) return;
      const list = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
      ed.pointerMove((list.length ? list : [e]).map(sample));
    };
    const finish = (e: PointerEvent, cancel: boolean) => {
      const ed = editorRef.current;
      if (!ed || active === null || e.pointerId !== active) return;
      active = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if (cancel) ed.cancelGesture();
      else ed.pointerUp(sample(e));
      if (penEraserRestore) {
        ed.setTool(penEraserRestore, styleFor(getApp().ui, penEraserRestore));
        penEraserRestore = null;
      }
      setBusy(false);
      setRev((r) => r + 1);
    };
    const up = (e: PointerEvent) => finish(e, false);
    const cancel = (e: PointerEvent) => finish(e, true);
    const lost = (e: PointerEvent) => finish(e, false);
    const leave = () => editorRef.current?.pointerLeave();
    const ctx = (e: Event) => e.preventDefault();
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", cancel);
    canvas.addEventListener("lostpointercapture", lost);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("contextmenu", ctx);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("lostpointercapture", lost);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("contextmenu", ctx);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────── keyboard (drawing mode) ─────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ed = editorRef.current;
      if (!ed || !drawingRef.current || ed.textEdit) return;
      if ((document.activeElement as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]")) return;
      const k = e.key;
      const lower = k.toLowerCase();
      const ui = getApp().ui;
      if (k === "Escape") {
        e.preventDefault();
        // Reached only when the native Escape safety key is unavailable.
        if (!handleEscape()) void setDrawing(false);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (lower === "z" && !e.shiftKey) (e.preventDefault(), void api.undo());
        else if (lower === "y" || (lower === "z" && e.shiftKey)) (e.preventDefault(), void api.redo());
        else if (lower === "d") (e.preventDefault(), ed.duplicateSelection());
        else if (lower === "a") (e.preventDefault(), void patchUi({ tool: "select" }).then(() => ed.selectAll()));
        return;
      }
      if (e.altKey) return;
      if (k === "Delete" || k === "Backspace") return void (e.preventDefault(), ed.deleteSelection());
      const nudge = e.shiftKey ? 10 : 1;
      if (k === "ArrowLeft") return void (e.preventDefault(), ed.nudge(-nudge, 0));
      if (k === "ArrowRight") return void (e.preventDefault(), ed.nudge(nudge, 0));
      if (k === "ArrowUp") return void (e.preventDefault(), ed.nudge(0, -nudge));
      if (k === "ArrowDown") return void (e.preventDefault(), ed.nudge(0, nudge));
      if (/^[1-9]$/.test(k)) {
        const c = ui.favorites[Number(k) - 1];
        if (!c) return;
        if (ed.selectedIds.length) ed.restyleSelection({ color: c });
        const g = styleGroup(ui.tool === "select" ? "pen" : ui.tool);
        void patchUi({ styles: { ...ui.styles, [g]: { ...ui.styles[g], color: c } }, recentColors: pushRecent(ui.recentColors, c, 8) });
        return;
      }
      if (k === "[" || k === "]") {
        const g = styleGroup(ui.tool === "select" ? "pen" : ui.tool);
        const s = styleFor(ui, ui.tool === "select" ? "pen" : ui.tool);
        const step = k === "]" ? 1 : -1;
        if (g === "eraser") void patchUi({ styles: { ...ui.styles, eraser: { ...ui.styles.eraser, eraserSize: Math.max(8, Math.min(120, s.eraserSize + step * 6)) } } });
        else if (g === "text") void patchUi({ styles: { ...ui.styles, text: { ...ui.styles.text, fontSize: Math.max(12, Math.min(120, s.fontSize + step * 2)) } } });
        else if (g === "marker") void patchUi({ styles: { ...ui.styles, marker: { ...ui.styles.marker, markerSize: Math.max(10, Math.min(48, s.markerSize + step * 2)) } } });
        else void patchUi({ styles: { ...ui.styles, [g]: { ...ui.styles[g], width: Math.max(1, Math.min(60, s.width + step)) } } });
        return;
      }
      const item = CATALOG.find((c) => c.key && c.key.toLowerCase() === lower);
      if (!item) return;
      e.preventDefault();
      if (item.kind === "tool") void selectTool(item.id as Parameters<typeof selectTool>[0]);
      else if (item.id === "whiteboard" || item.id === "blackboard") {
        const cur = ed.background;
        ed.setBoard(cur === item.id ? "none" : item.id);
        scheduleSave();
      }
    };
    const onPaste = async (e: ClipboardEvent) => {
      if (!drawingRef.current || editorRef.current?.textEdit) return;
      const file = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"))?.getAsFile();
      if (!file) return;
      e.preventDefault();
      try {
        const name = await api.importImageBytes(new Uint8Array(await file.arrayBuffer()));
        await insertImage(name);
      } catch (err) {
        setToast(t("common.error", { e: String(err) }));
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // Save before the page goes away (window rebuilt or app quitting).
  useEffect(() => {
    const flush = () => void save();
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [save]);

  const ed = editorRef.current;
  const selected = ed && drawing && !busy && !textEdit ? ed.selected() : [];
  const frame = selected.length && ed ? ed.selectionFrame() : null;
  void rev;

  return (
    <div className="ov-root" data-ready={ready} data-drawing={drawing} style={{ cursor: drawing ? cursor : "default" }}>
      {drawing && board !== "none" && <div className={`ov-board ${board}`} />}
      <canvas ref={baseRef} className="ov-canvas" aria-hidden />
      <canvas ref={liveRef} className="ov-canvas" data-testid="ink" aria-label={t("appName")} />
      <div className={`ov-frame ${drawing && app.ui.screenFrame ? "on" : ""}`} />
      <div className={`ov-banner surface ${banner ? "on" : ""}`} role="status" aria-live="polite">
        <i /> {t("ov.banner")}
      </div>
      {textEdit && ed && <TextBox edit={textEdit} dpr={dpr} inputRef={textRef} onCommit={(v) => ed.commitText(v)} />}
      {frame && ed && selected.length > 0 && (
        <Inspector
          editor={ed}
          objs={selected}
          frame={frame}
          dpr={dpr}
          onEditText={(id) => {
            const o = ed.scene.get(id);
            if (o?.kind === "text") {
              void patchUi({ tool: "text" }).then(() => {
                ed.setTool("text", styleFor(getApp().ui, "text"));
                ed.pointerDown({ x: o.x + 2, y: o.y + 2, pressure: 0.5, type: "mouse", shift: false, alt: false, ctrl: false, time: performance.now() });
              });
            }
          }}
        />
      )}
      {toast && <div className="ov-toast surface" role="alert">{toast}</div>}
    </div>
  );
}
