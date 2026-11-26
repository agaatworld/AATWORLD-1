import { ChevronsDownUp, Eye, LayoutGrid } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { api } from "../bridge/api";
import { listenAll } from "../bridge/ipc";
import type { ToolId } from "../engine/editor";
import { runAction, selectTool, toggleDrawing } from "../shared/actions";
import { t, useLang } from "../shared/i18n";
import { shortcutsOf, styleFor } from "../shared/settings";
import { getApp, patchUi, useApp } from "../shared/store";
import { catalogItem, type ActionId, type ItemId } from "../shared/tools";
import { ItemIcon, MarkIcon } from "../ui/icons";
import { computeLayout, placePopover, type Box, type Space } from "./layout";
import { FIXED, LibraryPanel } from "./LibraryPanel";
import { StylePanel } from "./StylePanel";
import { WorkspacePanel } from "./WorkspacePanel";

/** Transparent margin around the pill/panels; must contain the CSS shadow. */
const MARGIN = 16;
type PanelKind = "style" | "library" | "workspaces";
const PANEL_WIDTH: Record<PanelKind, number> = { style: 268, library: 330, workspaces: 290 };

interface Geometry {
  win: { w: number; h: number };
  pillAt: { x: number; y: number };
  popAt: Box | null;
}

function useSize(ref: React.RefObject<HTMLElement | null>, deps: unknown[]): { w: number; h: number } | null {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return setSize(null);
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.ceil(r.width);
      const h = Math.ceil(r.height);
      setSize((s) => (s && s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return size;
}

export function ToolbarApp() {
  useLang();
  const app = useApp();
  const { ui, mode, history } = app;
  const drawing = mode.mode === "annotating";
  const sc = shortcutsOf(app.settings.doc);
  const [open, setOpen] = useState<{ kind: PanelKind; anchor: Box } | null>(null);
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [armed, setArmed] = useState(false);
  const [tick, setTick] = useState(0);
  /** How many pinned tools fit on this monitor (null = all). */
  const [capacity, setCapacity] = useState<number | null>(null);
  const [work, setWork] = useState<{ w: number; h: number } | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const space = useRef<Space | null>(null);
  const seq = useRef(0);
  const lastReq = useRef("");
  const pillSize = useSize(pillRef, [ui.minimized, ui.orientation, ui.iconSize]);
  const launcherDown = useRef<{ x: number; y: number } | null>(null);
  const launcherDragged = useRef(false);
  const popSize = useSize(popRef, [open?.kind]);

  const close = useCallback(() => setOpen(null), []);
  const toggle = (kind: PanelKind, el: HTMLElement) => {
    if (open?.kind === kind) return close();
    const pill = pillRef.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setOpen({ kind, anchor: { x: r.left - pill.left, y: r.top - pill.top, w: r.width, h: r.height } });
  };

  // Ask Rust to size/position the window around the pill (+ open panel).
  useLayoutEffect(() => {
    if (!pillSize) return;
    if (open && !popSize) return; // wait until the panel is measured
    const l = computeLayout({
      pill: pillSize,
      margin: MARGIN,
      orientation: ui.minimized ? "vertical" : ui.orientation,
      pop: open && popSize ? { w: popSize.w, h: popSize.h, anchor: open.anchor } : null,
      space: space.current,
    });
    const req = { width: l.window.w, height: l.window.h, dx: l.pillBox.x, dy: l.pillBox.y, pillWidth: l.pillBox.w, pillHeight: l.pillBox.h };
    const key = `${JSON.stringify(req)}#${tick}`;
    if (key === lastReq.current) return;
    lastReq.current = key;
    const my = ++seq.current;
    api
      .toolbarLayout(req)
      .then((reply) => {
        if (my !== seq.current) return; // a newer layout superseded this one
        space.current = { left: reply.spaceLeft, right: reply.spaceRight, top: reply.spaceTop, bottom: reply.spaceBottom };
        setWork((w) => (w && w.w === reply.workWidth && w.h === reply.workHeight ? w : { w: reply.workWidth, h: reply.workHeight }));
        const pillAt = { x: reply.dx, y: reply.dy };
        setGeom({ win: l.window, pillAt, popAt: l.popBox ? placePopover(l.window, pillAt, l.popBox) : null });
      })
      .catch(() => undefined);
  }, [pillSize, popSize, open, ui.orientation, ui.minimized, tick]);

  // Fit the toolbar to the monitor: tools that do not fit move into "All tools".
  // Deterministic: the fixed part of the pill is measured from the same DOM
  // as the visible pinned buttons, and the work area comes from Rust, so the
  // result never depends on its own previous value (no oscillation).
  const allPinned = ui.pinned.filter((p) => !FIXED.includes(p));
  useLayoutEffect(() => {
    const pill = pillRef.current;
    if (!work || !pill || ui.minimized) return;
    const vertical = ui.orientation === "vertical";
    const r = pill.getBoundingClientRect();
    const shownEls = pill.querySelectorAll<HTMLElement>("[data-pinned]");
    const first = shownEls[0];
    const per = (first ? (vertical ? first.offsetHeight : first.offsetWidth) : 38) + 2;
    const len = vertical ? r.height : r.width;
    const fixed = len - shownEls.length * per;
    const avail = (vertical ? work.h : work.w) - 2 * MARGIN;
    const cap = Math.floor((avail - fixed) / per);
    const next = cap >= allPinned.length ? null : Math.max(1, cap);
    if (next !== capacity) setCapacity(next);
  });

  // Rust events for this window.
  useEffect(
    () =>
      listenAll({
        "toolbar://relayout": () => setTick((n) => n + 1),
        "escape://request": (id) => {
          const consumed = getOpen.current !== null;
          if (consumed) setOpen(null);
          void api.escapeReply(id, consumed);
        },
      }),
    [],
  );
  const getOpen = useRef(open);
  getOpen.current = open;

  // Close panels when the window loses focus (clicked elsewhere on screen).
  useEffect(() => {
    const onBlur = () => setOpen(null);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  // Keyboard inside the toolbar window.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, select");
      if (e.key === "Escape" && open) return setOpen(null);
      if (typing) return;
      if (e.ctrlKey && !e.altKey && e.key.toLowerCase() === "z") (e.preventDefault(), void runAction(e.shiftKey ? "redo" : "undo"));
      else if (e.ctrlKey && !e.altKey && e.key.toLowerCase() === "y") (e.preventDefault(), void runAction("redo"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 2800);
    return () => clearTimeout(id);
  }, [armed]);

  const pillPos = geom ? { left: geom.pillAt.x + MARGIN, top: geom.pillAt.y + MARGIN } : { left: MARGIN, top: MARGIN };
  const tool = ui.tool;
  const style = styleFor(ui, tool === "select" || tool === "eraser" || tool === "pixelEraser" ? "pen" : tool);

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setOpen(null);
    void api.startDrag();
  };

  const background = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) setOpen(null);
  };

  if (ui.minimized) {
    return (
      <div className="tb-root" onPointerDown={background}>
        <div
          ref={pillRef}
          className="launcher surface"
          data-on={drawing}
          style={pillPos}
          role="button"
          tabIndex={0}
          title={t("tb.launcherHint")}
          aria-label={t("tb.expand")}
          onPointerDown={(e) => {
            launcherDown.current = { x: e.clientX, y: e.clientY };
            launcherDragged.current = false;
          }}
          onPointerMove={(e) => {
            const d = launcherDown.current;
            if (d && e.buttons === 1 && !launcherDragged.current && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) {
              launcherDragged.current = true;
              void api.startDrag();
            }
          }}
          onClick={() => {
            launcherDown.current = null;
            if (!launcherDragged.current) void patchUi({ minimized: false });
          }}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && void patchUi({ minimized: false })}
          onContextMenu={(e) => (e.preventDefault(), void toggleDrawing())}
        >
          <span className="mark">
            <MarkIcon size={19} />
          </span>
          {ui.launcher === "pill" && (
            <span className="info">
              <i style={{ background: style.color }} />
              {t(`tool.${tool}`)}
            </span>
          )}
        </div>
      </div>
    );
  }

  const button = (id: ItemId) => {
    const item = catalogItem(id);
    if (!item) return null;
    const label = `${t(`tool.${id}`)}${item.key ? `  (${item.key})` : ""}`;
    if (item.kind === "tool") {
      const current = tool === id;
      return (
        <button
          key={id}
          type="button"
          data-pinned
          className={`tb-btn ${current ? "active" : ""}`}
          aria-pressed={current && drawing}
          title={label}
          aria-label={t(`tool.${id}`)}
          onClick={() => void selectTool(id as ToolId)}
        >
          <ItemIcon id={id} />
        </button>
      );
    }
    if (id === "workspaces") {
      return (
        <button key={id} type="button" data-pinned className={`tb-btn ${open?.kind === "workspaces" ? "open" : ""}`} title={label} aria-label={t(`tool.${id}`)} aria-expanded={open?.kind === "workspaces"} onClick={(e) => toggle("workspaces", e.currentTarget)}>
          <ItemIcon id={id} />
        </button>
      );
    }
    return (
      <button key={id} type="button" data-pinned className="tb-btn" aria-pressed={id === "hideInk" ? mode.mode === "hidden" : undefined} title={label} aria-label={t(`tool.${id}`)} onClick={() => void runAction(id as ActionId)}>
        <ItemIcon id={id} />
      </button>
    );
  };

  const pinned = capacity === null ? allPinned : allPinned.slice(0, capacity);
  const overflow = allPinned.length - pinned.length;
  return (
    <div className="tb-root" onPointerDown={background}>
      <div
        ref={pillRef}
        className="pill surface entering"
        data-orient={ui.orientation}
        style={pillPos}
        role="toolbar"
        aria-label={t("appName")}
        aria-orientation={ui.orientation}
        onKeyDown={(e) => {
          // Arrow keys move between buttons (ARIA toolbar pattern).
          const next = ["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(e.key) ? -1 : 0;
          if (!next) return;
          const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
          const i = items.indexOf(document.activeElement as HTMLButtonElement);
          if (i < 0) return;
          e.preventDefault();
          const rtlFlip = document.documentElement.dir === "rtl" && (e.key === "ArrowLeft" || e.key === "ArrowRight") ? -1 : 1;
          items[(i + next * rtlFlip + items.length) % items.length]?.focus();
        }}
      >
        <button type="button" className="grip" title={t("tb.drag")} aria-label={t("tb.drag")} onPointerDown={startDrag}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            {[3, 7, 11].flatMap((a) => [4.5, 9.5].map((b) => <circle key={`${a}${b}`} cx={ui.orientation === "vertical" ? a : b} cy={ui.orientation === "vertical" ? b : a} r="1.15" fill="currentColor" />))}
          </svg>
        </button>
        <button
          type="button"
          className="mode-btn"
          data-on={drawing}
          aria-pressed={drawing}
          title={`${drawing ? t("tb.stopDrawing") + "  (Esc)" : t("tb.startDrawing")}  ·  ${sc.toggleAnnotation}`}
          aria-label={drawing ? t("tb.stopDrawing") : t("tb.startDrawing")}
          onClick={() => void toggleDrawing()}
        >
          {drawing ? <ItemIcon id="select" /> : <ItemIcon id="pen" />}
          <span className="dot" />
        </button>
        {mode.mode === "hidden" && (
          <button type="button" className="tb-btn open" title={t("tb.showInk")} aria-label={t("tb.showInk")} onClick={() => void api.requestMode("showInk")}>
            <Eye />
          </button>
        )}
        <span className="sep" role="separator" />
        {pinned.map(button)}
        <span className="sep" role="separator" />
        <button
          type="button"
          className={`tb-btn swatch-btn ${open?.kind === "style" ? "open" : ""}`}
          title={t("tb.style")}
          aria-label={t("tb.style")}
          aria-expanded={open?.kind === "style"}
          onClick={(e) => toggle("style", e.currentTarget)}
        >
          <span className="ring" style={{ borderColor: style.color }}>
            <span style={{ width: Math.max(4, Math.min(14, style.width + 2)), height: Math.max(4, Math.min(14, style.width + 2)), background: style.color, opacity: Math.max(style.opacity, 0.4) }} />
          </span>
        </button>
        <button type="button" className="tb-btn" title={`${t("tool.undo")}  (Ctrl+Z)`} aria-label={t("tool.undo")} disabled={!history.canUndo} onClick={() => void runAction("undo")}>
          <ItemIcon id="undo" />
        </button>
        <button type="button" className="tb-btn" title={`${t("tool.redo")}  (Ctrl+Y)`} aria-label={t("tool.redo")} disabled={!history.canRedo} onClick={() => void runAction("redo")}>
          <ItemIcon id="redo" />
        </button>
        <button
          type="button"
          className={`tb-btn ${armed ? "danger-armed" : ""}`}
          title={armed ? t("tb.clearConfirm") : t("tool.clear")}
          aria-label={armed ? t("tb.clearConfirm") : t("tool.clear")}
          onClick={() => {
            if (!armed) return setArmed(true);
            setArmed(false);
            void runAction("clear");
          }}
        >
          <ItemIcon id="clear" />
        </button>
        <span className="sep" role="separator" />
        <button type="button" className={`tb-btn ${open?.kind === "library" ? "open" : ""}`} title={t("tb.more")} aria-label={overflow ? `${t("tb.more")} (+${overflow})` : t("tb.more")} aria-expanded={open?.kind === "library"} onClick={(e) => toggle("library", e.currentTarget)}>
          <LayoutGrid />
          {overflow > 0 && <span className="badge">+{overflow}</span>}
        </button>
        <button type="button" className="tb-btn" title={t("tb.collapse")} aria-label={t("tb.collapse")} onClick={() => (setOpen(null), void patchUi({ minimized: true }))}>
          <ChevronsDownUp />
        </button>
      </div>
      {open && (
        <div
          ref={popRef}
          className="popover surface"
          role="dialog"
          aria-label={open.kind === "style" ? t("tb.style") : open.kind === "library" ? t("tb.more") : t("ws.title")}
          style={{
            width: PANEL_WIDTH[open.kind],
            left: geom?.popAt ? geom.popAt.x + MARGIN : -9999,
            top: geom?.popAt ? geom.popAt.y + MARGIN : 0,
            visibility: geom?.popAt ? "visible" : "hidden",
          }}
        >
          {open.kind === "style" && <StylePanel tool={tool} />}
          {open.kind === "library" && <LibraryPanel onClose={close} onOpenWorkspaces={() => setOpen((o) => (o ? { ...o, kind: "workspaces" } : o))} />}
          {open.kind === "workspaces" && <WorkspacePanel onClose={close} />}
        </div>
      )}
    </div>
  );
}

export { getApp };
