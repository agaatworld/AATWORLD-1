import { Database, Keyboard, Layers, LifeBuoy, Monitor, PenTool, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../bridge/api";
import { t, useLang } from "../shared/i18n";
import { shortcutsOf, type ShortcutSettings } from "../shared/settings";
import { patchSettings, patchUi, useApp } from "../shared/store";
import { WorkspacePanel } from "../toolbar/WorkspacePanel";
import { Seg, Slider, Switch } from "../ui/controls";

type Section = "general" | "toolbar" | "drawing" | "shortcuts" | "workspaces" | "data" | "diagnostics";
const SECTIONS: { id: Section; icon: React.ReactNode }[] = [
  { id: "general", icon: <SlidersHorizontal /> },
  { id: "toolbar", icon: <Monitor /> },
  { id: "drawing", icon: <PenTool /> },
  { id: "shortcuts", icon: <Keyboard /> },
  { id: "workspaces", icon: <Layers /> },
  { id: "data", icon: <Database /> },
  { id: "diagnostics", icon: <LifeBuoy /> },
];

function Row({ title, desc, children, error }: { title: string; desc?: string; children: React.ReactNode; error?: string | null }) {
  return (
    <div className="card-row">
      <div className="t">
        <b>{title}</b>
        {desc && <span>{desc}</span>}
        {error && <span className="err">{error}</span>}
      </div>
      <div className="row">{children}</div>
    </div>
  );
}

/** Build an accelerator from a key event, independent of keyboard layout. */
export function acceleratorFrom(e: KeyboardEvent): string | null {
  const code = e.code;
  let key: string | null = null;
  if (/^Key[A-Z]$/.test(code)) key = code.slice(3);
  else if (/^Digit[0-9]$/.test(code)) key = code.slice(5);
  else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) key = code;
  else {
    const map: Record<string, string> = { Space: "Space", Backspace: "Backspace", Delete: "Delete", Insert: "Insert", Home: "Home", End: "End", PageUp: "PageUp", PageDown: "PageDown", ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right", Enter: "Enter", Tab: "Tab" };
    key = map[code] ?? null;
  }
  if (!key) return null;
  const mods = [e.ctrlKey && "Ctrl", e.altKey && "Alt", e.shiftKey && "Shift"].filter(Boolean);
  return [...mods, key].join("+");
}

function Shortcuts() {
  const app = useApp();
  const sc = shortcutsOf(app.settings.doc);
  const [recording, setRecording] = useState<keyof ShortcutSettings | null>(null);
  const [error, setError] = useState<{ action: string; msg: string } | null>(null);
  const status = new Map(app.shortcuts.map((s) => [s.action, s]));

  useEffect(() => {
    if (!recording) return;
    const onKey = async (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") return setRecording(null);
      const acc = acceleratorFrom(e);
      if (!acc) return; // still holding modifiers
      try {
        const normalized = await api.validateShortcut(recording, acc);
        await patchSettings({ shortcuts: { [recording]: normalized } });
        setError(null);
      } catch (err) {
        setError({ action: recording, msg: String(err) });
      }
      setRecording(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [recording]);

  const actions: (keyof ShortcutSettings)[] = ["toggleAnnotation", "toggleToolbar", "toggleInk", "clearAll"];
  return (
    <>
      <div className="card">
        {actions.map((a) => {
          const st = status.get(a);
          const err = error?.action === a ? error.msg : st && !st.ok ? t("set.sc.inUse", { error: st.error ?? "" }) : null;
          return (
            <Row key={a} title={t(`set.sc.${a}`)} error={err}>
              <span className="kbd" style={{ fontSize: 12.5, padding: "3px 8px" }}>
                {recording === a ? t("set.sc.record") : sc[a] || "—"}
              </span>
              <button type="button" className="btn" onClick={() => setRecording(recording === a ? null : a)}>
                {recording === a ? t("common.cancel") : t("set.sc.change")}
              </button>
              {sc[a] && (
                <button type="button" className="btn ghost" onClick={() => void patchSettings({ shortcuts: { [a]: "" } })}>
                  {t("set.sc.disable")}
                </button>
              )}
            </Row>
          );
        })}
      </div>
      <div className="note">{t("set.sc.inside")}</div>
    </>
  );
}

function Data() {
  const [backups, setBackups] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const refresh = () => void api.listBackups().then(setBackups).catch(() => undefined);
  useEffect(refresh, []);
  const pretty = (n: string) => (/^\d{8}-\d{6}/.test(n) ? `${n.slice(0, 4)}-${n.slice(4, 6)}-${n.slice(6, 8)} ${n.slice(9, 11)}:${n.slice(11, 13)} UTC` : n);
  return (
    <>
      <div className="card">
        <Row title={t("set.backupNow")} desc={msg ?? undefined}>
          <button
            type="button"
            className="btn primary"
            onClick={async () => {
              try {
                const n = await api.backupNow();
                setMsg(t("set.backupDone", { name: pretty(n) }));
                refresh();
              } catch (e) {
                setMsg(t("common.error", { e: String(e) }));
              }
            }}
          >
            {t("set.backupNow")}
          </button>
        </Row>
        <Row title={t("set.openData")}>
          <button type="button" className="btn" onClick={() => void api.openFolder("data")}>
            {t("set.openData")}
          </button>
        </Row>
      </div>
      <h2 style={{ fontSize: 14, margin: "18px 0 8px", color: "var(--muted)" }}>{t("set.backups")}</h2>
      <div className="card">
        {backups.length === 0 && <div className="note">—</div>}
        {backups.map((b) => (
          <div key={b}>
            <Row title={pretty(b)}>
              <button type="button" className="btn" onClick={() => setConfirm(confirm === b ? null : b)}>
                {t("set.restoreBackup")}
              </button>
            </Row>
            {confirm === b && (
              <div className="note warn" style={{ margin: "0 12px 12px" }}>
                {t("set.restoreConfirm", { name: pretty(b) })}
                <div className="row" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={async () => {
                      try {
                        await api.restoreBackup(b);
                        setMsg(null);
                        setConfirm(null);
                        refresh();
                      } catch (e) {
                        setMsg(t("common.error", { e: String(e) }));
                      }
                    }}
                  >
                    {t("set.restoreBackup")}
                  </button>
                  <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Diagnostics() {
  const app = useApp();
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  return (
    <>
      <div className="note warn" role="note" style={{ marginBottom: 14 }}>
        {t("set.emergency")}
      </div>
      <div className="card">
        <Row title={t("set.openLogs")}>
          <button type="button" className="btn" onClick={() => void api.openFolder("logs")}>
            {t("set.openLogs")}
          </button>
        </Row>
        <Row title={t("set.copyDiag")} desc={copied ? t("set.copied") : undefined}>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              const d = await api.diagnostics();
              setText(d);
              try {
                await navigator.clipboard.writeText(d);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {t("set.copyDiag")}
          </button>
        </Row>
        <Row title={t("set.version", { v: app.version })}>
          <span />
        </Row>
      </div>
      {text && <pre className="diag">{text}</pre>}
    </>
  );
}

export function SettingsApp() {
  useLang();
  const { ui } = useApp();
  const [section, setSection] = useState<Section>("general");
  useEffect(() => {
    document.title = `${t("appName")} — ${t("set.title")}`;
  });
  return (
    <div className="settings">
      <nav aria-label={t("set.title")}>
        <div className="brand">
          <img src="/app-icon.png" alt="" />
          {t("appName")}
        </div>
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" aria-current={section === s.id} onClick={() => setSection(s.id)}>
            {s.icon}
            {t(`set.${s.id}`)}
          </button>
        ))}
      </nav>
      <main>
        <h1>{t(`set.${section}`)}</h1>
        {section === "general" && (
          <div className="card">
            <Row title={t("set.language")}>
              <select className="field" style={{ width: 200 }} value={ui.language} onChange={(e) => void patchUi({ language: e.target.value as typeof ui.language })} aria-label={t("set.language")}>
                <option value="system">{t("set.lang.system")}</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </Row>
            <Row title={t("set.theme")}>
              <Seg value={ui.theme} onChange={(v) => void patchUi({ theme: v })} label={t("set.theme")} options={[{ value: "system", label: t("set.theme.system") }, { value: "dark", label: t("set.theme.dark") }, { value: "light", label: t("set.theme.light") }]} />
            </Row>
            <Row title={t("set.motion")}>
              <Seg value={ui.reducedMotion} onChange={(v) => void patchUi({ reducedMotion: v })} label={t("set.motion")} options={[{ value: "system", label: t("set.motion.system") }, { value: "on", label: t("set.motion.on") }, { value: "off", label: t("set.motion.off") }]} />
            </Row>
            <Row title={t("set.restore")}>
              <Switch checked={ui.restoreOnStart} onChange={(v) => void patchUi({ restoreOnStart: v })} label={t("set.restore")} />
            </Row>
          </div>
        )}
        {section === "toolbar" && (
          <div className="card">
            <Row title={t("set.orientation")}>
              <Seg value={ui.orientation} onChange={(v) => void patchUi({ orientation: v })} label={t("set.orientation")} options={[{ value: "vertical", label: t("set.vertical") }, { value: "horizontal", label: t("set.horizontal") }]} />
            </Row>
            <Row title={t("set.iconSize")}>
              <Seg value={ui.iconSize} onChange={(v) => void patchUi({ iconSize: v })} label={t("set.iconSize")} options={[{ value: "compact", label: t("set.compact") }, { value: "regular", label: t("set.regular") }, { value: "large", label: t("set.large") }]} />
            </Row>
            <Row title={t("set.launcher")}>
              <Seg value={ui.launcher} onChange={(v) => void patchUi({ launcher: v })} label={t("set.launcher")} options={[{ value: "dot", label: t("set.launcher.dot") }, { value: "pill", label: t("set.launcher.pill") }]} />
            </Row>
            <Row title={t("set.resetPosition")}>
              <button type="button" className="btn" onClick={() => void api.resetToolbarPosition()}>
                {t("set.resetPosition")}
              </button>
            </Row>
          </div>
        )}
        {section === "drawing" && (
          <div className="card">
            <Row title={t("set.banner")}>
              <Switch checked={ui.modeBanner} onChange={(v) => void patchUi({ modeBanner: v })} label={t("set.banner")} />
            </Row>
            <Row title={t("set.frame")}>
              <Switch checked={ui.screenFrame} onChange={(v) => void patchUi({ screenFrame: v })} label={t("set.frame")} />
            </Row>
            <Row title={t("set.pressure")}>
              <Switch checked={ui.pressure} onChange={(v) => void patchUi({ pressure: v })} label={t("set.pressure")} />
            </Row>
            <div className="card-row" style={{ display: "block" }}>
              <Slider label={t("set.smoothing")} value={Math.round(ui.smoothing * 100)} min={0} max={100} step={5} onChange={(v) => void patchUi({ smoothing: v / 100 })} format={(v) => `${v}%`} />
            </div>
          </div>
        )}
        {section === "shortcuts" && <Shortcuts />}
        {section === "workspaces" && (
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, maxWidth: 460 }}>
            <WorkspacePanel onClose={() => setSection("general")} />
          </div>
        )}
        {section === "data" && <Data />}
        {section === "diagnostics" && <Diagnostics />}
      </main>
    </div>
  );
}
