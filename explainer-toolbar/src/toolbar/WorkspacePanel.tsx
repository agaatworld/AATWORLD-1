import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { api } from "../bridge/api";
import { t } from "../shared/i18n";
import { useApp } from "../shared/store";

export function WorkspacePanel({ onClose }: { onClose: () => void }) {
  const { workspaces } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async (f: () => Promise<unknown>) => {
    setError(null);
    try {
      await f();
    } catch (e) {
      setError(String(e));
    }
  };
  return (
    <>
      <div className="pop-title">
        <span>{t("ws.title")}</span>
        <button type="button" className="icon-btn" aria-label={t("common.cancel")} onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="lib-list" style={{ maxHeight: 300 }}>
        {workspaces.list.map((w) => {
          const active = w.id === workspaces.active;
          if (editing === w.id) {
            return (
              <div key={w.id} className="row" style={{ padding: "4px 0" }}>
                <input
                  className="field"
                  autoFocus
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void run(() => api.renameWorkspace(w.id, name)).then(() => setEditing(null));
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
                <button type="button" className="icon-btn" aria-label={t("common.save")} onClick={() => void run(() => api.renameWorkspace(w.id, name)).then(() => setEditing(null))}>
                  <Check />
                </button>
              </div>
            );
          }
          if (confirm === w.id) {
            return (
              <div key={w.id} className="pop-section" style={{ padding: "6px 6px 8px" }}>
                <span className="label">{t("ws.deleteConfirm", { name: w.name })}</span>
                <div className="row">
                  <button type="button" className="btn danger" onClick={() => void run(() => api.deleteWorkspace(w.id)).then(() => setConfirm(null))}>
                    <Trash2 /> {t("ws.delete")}
                  </button>
                  <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={w.id} className={`lib-item ${active ? "current" : ""}`} onClick={() => !active && void run(() => api.switchWorkspace(w.id))}>
              <span className="ic">{active ? <Check size={16} /> : <span style={{ fontWeight: 700, fontSize: 12 }}>{w.name.slice(0, 1).toUpperCase()}</span>}</span>
              <span className="name">{w.name}</span>
              {active && <span className="kbd">{t("ws.active")}</span>}
              <button type="button" className="icon-btn" title={t("ws.rename")} aria-label={`${t("ws.rename")}: ${w.name}`} onClick={(e) => (e.stopPropagation(), setEditing(w.id), setName(w.name))}>
                <Pencil />
              </button>
              {!active && (
                <button type="button" className="icon-btn danger" title={t("ws.delete")} aria-label={`${t("ws.delete")}: ${w.name}`} onClick={(e) => (e.stopPropagation(), setConfirm(w.id))}>
                  <Trash2 />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error && <div className="empty" style={{ color: "var(--danger)" }}>{error}</div>}
      <button type="button" className="btn" onClick={() => void run(() => api.createWorkspace(t("ws.defaultName", { n: workspaces.list.length + 1 })))}>
        <Plus /> {t("ws.new")}
      </button>
    </>
  );
}
