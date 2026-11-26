import { ArrowDown, ArrowUp, Clock, GripVertical, Pin, RotateCw, Search, Settings, Sparkles, X } from "lucide-react";
import { api } from "../bridge/api";
import { useMemo, useRef, useState } from "react";
import type { ToolId } from "../engine/editor";
import { runAction, selectTool } from "../shared/actions";
import { t } from "../shared/i18n";
import { patchUi, useApp } from "../shared/store";
import { CATALOG, CATEGORIES, LAYOUTS, catalogItem, styleGroup, type CatalogItem, type ItemId } from "../shared/tools";
import { ItemIcon } from "../ui/icons";

/** Items that always live in the toolbar's fixed group, not in the pinned list. */
export const FIXED: ItemId[] = ["undo", "redo", "clear"];

export function LibraryPanel({ onClose, onOpenWorkspaces }: { onClose: () => void; onOpenWorkspaces: () => void }) {
  const { ui, mode } = useApp();
  const [q, setQ] = useState("");
  const [kb, setKb] = useState(0);
  const [drag, setDrag] = useState<ItemId | null>(null);
  const [over, setOver] = useState<ItemId | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pinned = ui.pinned.filter((p) => !FIXED.includes(p));

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return CATALOG.filter((c) => `${t(`tool.${c.id}`)} ${c.id} ${c.keywords} ${c.key ?? ""}`.toLowerCase().includes(s));
  }, [q]);

  const activate = (c: CatalogItem) => {
    if (c.kind === "tool") {
      void selectTool(c.id as ToolId);
      onClose();
    } else if (c.id === "workspaces") {
      onOpenWorkspaces();
    } else {
      void runAction(c.id as Exclude<ItemId, ToolId>);
      if (c.id !== "undo" && c.id !== "redo") onClose();
    }
  };
  const togglePin = (id: ItemId) => {
    const next = ui.pinned.includes(id) ? ui.pinned.filter((p) => p !== id) : [...ui.pinned, id];
    void patchUi({ pinned: next.length ? next : ["pen"] });
  };
  const move = (id: ItemId, delta: number) => {
    const list = [...pinned];
    const i = list.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    void patchUi({ pinned: list });
  };
  const dropBefore = (target: ItemId) => {
    if (!drag || drag === target) return;
    const list = pinned.filter((p) => p !== drag);
    list.splice(list.indexOf(target), 0, drag);
    void patchUi({ pinned: list });
  };

  const row = (c: CatalogItem, opts: { reorder?: boolean; index?: number } = {}) => {
    const isPinned = ui.pinned.includes(c.id);
    const current = c.kind === "tool" && ui.tool === c.id && mode.mode === "annotating";
    const fixed = FIXED.includes(c.id);
    return (
      <div
        key={`${opts.reorder ? "p" : "c"}-${c.id}`}
        className={`lib-item ${current ? "current" : ""} ${drag === c.id ? "dragging" : ""} ${over === c.id && drag && drag !== c.id ? "drop-before" : ""} ${opts.index === kb && results ? "kb" : ""}`}
        role="option"
        aria-selected={current}
        tabIndex={-1}
        onClick={() => activate(c)}
        draggable={opts.reorder}
        onDragStart={(e) => {
          setDrag(c.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => {
          if (!opts.reorder || !drag) return;
          e.preventDefault();
          setOver(c.id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dropBefore(c.id);
          setDrag(null);
          setOver(null);
        }}
        onDragEnd={() => {
          setDrag(null);
          setOver(null);
        }}
      >
        {opts.reorder && (
          <span style={{ color: "var(--faint)", display: "grid", cursor: "grab" }} aria-hidden>
            <GripVertical size={14} />
          </span>
        )}
        <span className="ic">
          <ItemIcon id={c.id} size={16} />
        </span>
        <span className="name">{t(`tool.${c.id}`)}</span>
        {c.key && <span className="kbd">{c.key}</span>}
        {opts.reorder && (
          <span className="reorder">
            <button type="button" className="icon-btn" title={t("lib.moveUp")} aria-label={t("lib.moveUp")} onClick={(e) => (e.stopPropagation(), move(c.id, -1))}>
              <ArrowUp />
            </button>
            <button type="button" className="icon-btn" title={t("lib.moveDown")} aria-label={t("lib.moveDown")} onClick={(e) => (e.stopPropagation(), move(c.id, 1))}>
              <ArrowDown />
            </button>
          </span>
        )}
        {!fixed && (
          <button
            type="button"
            className="icon-btn"
            aria-pressed={isPinned}
            title={isPinned ? t("lib.unpin") : t("lib.pin")}
            aria-label={`${isPinned ? t("lib.unpin") : t("lib.pin")}: ${t(`tool.${c.id}`)}`}
            onClick={(e) => (e.stopPropagation(), togglePin(c.id))}
          >
            <Pin fill={isPinned ? "currentColor" : "none"} />
          </button>
        )}
      </div>
    );
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!results) return;
    if (e.key === "ArrowDown") (e.preventDefault(), setKb((k) => Math.min(results.length - 1, k + 1)));
    if (e.key === "ArrowUp") (e.preventDefault(), setKb((k) => Math.max(0, k - 1)));
    if (e.key === "Enter" && results[kb]) activate(results[kb]);
  };

  return (
    <>
      <div className="pop-title">
        <span>{t("tb.more")}</span>
        <span className="row" style={{ gap: 2 }}>
          <button
            type="button"
            className="icon-btn"
            title={t("lib.orientation")}
            aria-label={t("lib.orientation")}
            onClick={() => void patchUi({ orientation: ui.orientation === "vertical" ? "horizontal" : "vertical" })}
          >
            <RotateCw />
          </button>
          <button type="button" className="icon-btn" title={t("tb.settings")} aria-label={t("tb.settings")} onClick={() => (onClose(), void api.openSettings())}>
            <Settings />
          </button>
          <button type="button" className="icon-btn" title={t("common.cancel")} aria-label={t("common.cancel")} onClick={onClose}>
            <X />
          </button>
        </span>
      </div>
      <div className="row" style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", insetInlineStart: 10, color: "var(--faint)" }} aria-hidden />
        <input
          className="field"
          style={{ paddingInlineStart: 32 }}
          autoFocus
          placeholder={t("lib.search")}
          aria-label={t("lib.search")}
          value={q}
          onChange={(e) => (setQ(e.target.value), setKb(0))}
          onKeyDown={onKey}
        />
      </div>
      <div className="lib-list" ref={listRef} role="listbox" aria-label={t("tb.more")} style={{ maxHeight: 400 }}>
        {results ? (
          results.length ? (
            results.map((c, i) => row(c, { index: i }))
          ) : (
            <div className="empty">{t("lib.noResults", { q })}</div>
          )
        ) : (
          <>
            {ui.recentTools.length > 0 && (
              <>
                <div className="lib-head">
                  <Clock /> {t("lib.recent")}
                </div>
                <div className="chips" style={{ padding: "0 6px 4px" }}>
                  {ui.recentTools.slice(0, 5).map((id) => (
                    <button key={id} type="button" className="chip" onClick={() => activate(catalogItem(id)!)}>
                      <ItemIcon id={id} size={14} /> {t(`tool.${id}`)}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="lib-head">
              <Pin /> {t("lib.pinned")}
            </div>
            {pinned.map((id) => catalogItem(id)).filter(Boolean).map((c) => row(c!, { reorder: true }))}
            {CATEGORIES.map((cat) => {
              const items = CATALOG.filter((c) => c.category === cat && !ui.pinned.includes(c.id));
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <div className="lib-head">{t(`cat.${cat}`)}</div>
                  {items.map((c) => row(c))}
                </div>
              );
            })}
            <div className="lib-head">
              <Sparkles /> {t("lib.presets")}
            </div>
            {ui.presets.length ? (
              <div className="chips" style={{ padding: "0 6px" }}>
                {ui.presets.map((p) => (
                  <span key={p.id} className="chip" role="button" tabIndex={0} onClick={() => {
                    const g = styleGroup(p.tool);
                    void patchUi({ styles: { ...ui.styles, [g]: { ...ui.styles[g], ...p.style } } });
                    void selectTool(p.tool);
                    onClose();
                  }}>
                    <i style={{ background: p.style.color ?? "var(--muted)" }} />
                    {p.name}
                    <button
                      type="button"
                      className="icon-btn danger"
                      style={{ width: 20, height: 20 }}
                      title={t("lib.deletePreset")}
                      aria-label={`${t("lib.deletePreset")}: ${p.name}`}
                      onClick={(e) => (e.stopPropagation(), void patchUi({ presets: ui.presets.filter((x) => x.id !== p.id) }))}
                    >
                      <X />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty">{t("lib.emptyPresets")}</div>
            )}
            <div className="lib-head">{t("lib.layouts")}</div>
            <div className="chips" style={{ padding: "0 6px 8px" }}>
              {(Object.keys(LAYOUTS) as (keyof typeof LAYOUTS)[]).map((k) => (
                <button key={k} type="button" className="chip" onClick={() => void patchUi({ pinned: LAYOUTS[k] })}>
                  {t(`lib.layout.${k}`)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
