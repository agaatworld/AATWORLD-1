import { Bold, Save } from "lucide-react";
import { useState } from "react";
import type { ToolId, ToolStyle } from "../engine/editor";
import { t } from "../shared/i18n";
import { pushRecent, styleFor } from "../shared/settings";
import { patchUi, useApp } from "../shared/store";
import { styleGroup } from "../shared/tools";
import { Seg, Slider, Swatches } from "../ui/controls";

export const FONTS = ["Segoe UI", "Arial", "Calibri", "Tahoma", "Georgia", "Cambria", "Consolas", "Comic Sans MS", "Sakkal Majalla", "Traditional Arabic", "Simplified Arabic"];

function Preview({ tool, s }: { tool: ToolId; s: ToolStyle }) {
  const g = styleGroup(tool);
  const common = { stroke: s.color, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const dash = s.dash === "dash" ? `${s.width * 2.6} ${s.width * 1.8}` : s.dash === "dot" ? `0.1 ${s.width * 2.1}` : undefined;
  return (
    <svg width="100%" height="54" viewBox="0 0 240 54" aria-hidden style={{ display: "block", borderRadius: 10, background: "var(--field)", border: "1px solid var(--line)" }}>
      {g === "pen" || g === "highlighter" ? (
        <path d="M18 34 C 50 8, 80 50, 116 26 S 180 14, 222 30" {...common} strokeWidth={Math.min(s.width, 28)} opacity={s.opacity} strokeDasharray={g === "pen" ? dash : undefined} />
      ) : g === "shape" ? (
        tool === "arrow" || tool === "line" ? (
          <g opacity={s.opacity}>
            <path d="M40 38 L 196 18" {...common} strokeWidth={Math.min(s.width, 12)} strokeDasharray={dash} />
            {tool === "arrow" && <path d="M196 18 l -16 -3 l 4 12 z" fill={s.color} stroke={s.color} strokeWidth={2} />}
          </g>
        ) : (
          <g opacity={s.opacity}>
            {tool === "ellipse" ? (
              <ellipse cx="120" cy="27" rx="70" ry="17" {...common} strokeWidth={Math.min(s.width, 10)} strokeDasharray={dash} fill={s.fill ?? "none"} fillOpacity={s.fillOpacity} />
            ) : (
              <rect x="50" y="10" width="140" height="34" rx={Math.min(s.radius, 16)} {...common} strokeWidth={Math.min(s.width, 10)} strokeDasharray={dash} fill={s.fill ?? "none"} fillOpacity={s.fillOpacity} />
            )}
          </g>
        )
      ) : g === "text" ? (
        <g>
          {s.textBackground && <rect x="64" y="9" width="112" height="36" rx="8" fill={s.textBackground} />}
          <text x="120" y="35" textAnchor="middle" fill={s.color} fontWeight={s.bold ? 700 : 400} fontFamily={`"${s.font}", "Segoe UI", sans-serif`} fontSize="22">
            Aa أب
          </text>
        </g>
      ) : g === "marker" ? (
        <g>
          {[1, 2, 3].map((n, i) => (
            <g key={n} transform={`translate(${70 + i * 50} 27)`}>
              <circle r={Math.min(s.markerSize, 20)} fill={s.color} stroke="#fff" strokeOpacity={0.9} strokeWidth={2} />
              <text y="5.5" textAnchor="middle" fill="#fff" fontWeight="700" fontSize={Math.min(s.markerSize, 20)}>
                {n}
              </text>
            </g>
          ))}
        </g>
      ) : g === "eraser" ? (
        <circle cx="120" cy="27" r={Math.min(s.eraserSize / 2, 24)} fill="rgba(127,127,127,.15)" stroke="var(--muted)" strokeDasharray="3 3" />
      ) : (
        <g>
          <circle cx="120" cy="27" r="6" fill={s.color} />
          <circle cx="120" cy="27" r="14" fill="none" stroke={s.color} opacity="0.4" />
        </g>
      )}
    </svg>
  );
}

export function StylePanel({ tool: activeTool }: { tool: ToolId }) {
  const { ui } = useApp();
  // Select uses (and edits) the pen style so the panel is never empty.
  const tool: ToolId = activeTool === "select" ? "pen" : activeTool;
  const g = styleGroup(tool);
  const s = styleFor(ui, tool);
  const [presetName, setPresetName] = useState<string | null>(null);

  const set = (p: Partial<ToolStyle>) => {
    const next: Parameters<typeof patchUi>[0] = { styles: { ...ui.styles, [g]: { ...ui.styles[g], ...p } } };
    if (p.color && !ui.favorites.includes(p.color.toUpperCase())) next.recentColors = pushRecent(ui.recentColors, p.color.toUpperCase(), 8);
    void patchUi(next);
  };
  const savePreset = () => {
    const name = (presetName ?? "").trim() || t(`tool.${tool}`);
    void patchUi({ presets: [...ui.presets, { id: `p${Date.now().toString(36)}`, name, tool, style: ui.styles[g] }].slice(-40) });
    setPresetName(null);
  };

  const colors = g !== "eraser";
  return (
    <>
      <div className="pop-title">
        <span>{t(`tool.${tool}`)}</span>
      </div>
      <Preview tool={tool} s={s} />
      {colors && (
        <div className="pop-section">
          <span className="label">{t("st.colors")}</span>
          <Swatches colors={ui.favorites.slice(0, 11)} value={s.color} onPick={(c) => set({ color: c })} custom customLabel={t("st.custom")} />
          {ui.recentColors.length > 0 && (
            <>
              <span className="label">{t("st.recent")}</span>
              <Swatches colors={ui.recentColors.slice(0, 6)} value={s.color} onPick={(c) => set({ color: c })} />
            </>
          )}
        </div>
      )}
      {(g === "pen" || g === "highlighter" || g === "shape") && (
        <Slider label={t("st.width")} value={s.width} min={g === "highlighter" ? 6 : 1} max={g === "highlighter" ? 60 : g === "shape" ? 24 : 30} onChange={(v) => set({ width: v })} format={(v) => `${v}px`} />
      )}
      {(g === "pen" || g === "highlighter" || g === "shape" || g === "text" || g === "marker") && (
        <Slider
          label={t("st.opacity")}
          value={Math.round(s.opacity * 100)}
          min={g === "highlighter" ? 15 : 10}
          max={g === "highlighter" ? 70 : 100}
          step={5}
          onChange={(v) => set({ opacity: v / 100 })}
          format={(v) => `${v}%`}
        />
      )}
      {(g === "pen" || g === "shape") && (
        <div className="pop-section">
          <span className="label">{t("st.line")}</span>
          <Seg value={s.dash} onChange={(v) => set({ dash: v })} options={[{ value: "solid", label: t("st.solid") }, { value: "dash", label: t("st.dash") }, { value: "dot", label: t("st.dot") }]} />
        </div>
      )}
      {g === "shape" && (tool === "rect" || tool === "ellipse") && (
        <div className="pop-section">
          <span className="label">{t("st.fill")}</span>
          <Swatches allowNone noneLabel={t("st.noFill")} colors={ui.favorites.slice(0, 5)} value={s.fill} onPick={(c) => set({ fill: c === "none" ? null : c })} />
          {s.fill && <Slider label={t("st.fillOpacity")} value={Math.round(s.fillOpacity * 100)} min={5} max={100} step={5} onChange={(v) => set({ fillOpacity: v / 100 })} format={(v) => `${v}%`} />}
        </div>
      )}
      {tool === "rect" && <Slider label={t("st.corner")} value={s.radius} min={0} max={40} onChange={(v) => set({ radius: v })} format={(v) => `${v}px`} />}
      {tool === "arrow" && (
        <div className="pop-section">
          <span className="label">{t("st.heads")}</span>
          <Seg value={s.heads} onChange={(v) => set({ heads: v })} options={[{ value: "end", label: t("st.headEnd") }, { value: "both", label: t("st.headBoth") }]} />
        </div>
      )}
      {g === "text" && (
        <>
          <div className="pop-section">
            <span className="label">{t("st.font")}</span>
            <div className="row">
              <select className="field" value={s.font} onChange={(e) => set({ font: e.target.value })} aria-label={t("st.font")}>
                {FONTS.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>
              <button type="button" className="icon-btn" aria-pressed={s.bold} title={t("st.bold")} aria-label={t("st.bold")} onClick={() => set({ bold: !s.bold })}>
                <Bold />
              </button>
            </div>
          </div>
          <Slider label={t("st.size")} value={s.fontSize} min={12} max={120} onChange={(v) => set({ fontSize: v })} format={(v) => `${v}px`} />
          <div className="pop-section">
            <span className="label">{t("st.background")}</span>
            <Swatches allowNone noneLabel={t("st.noFill")} colors={["#111317", "#FFFFFF", "#FFC43D", "#FF5A36", "#2E9BFF"]} value={s.textBackground} onPick={(c) => set({ textBackground: c === "none" ? null : c })} />
          </div>
        </>
      )}
      {g === "marker" && <Slider label={t("st.size")} value={s.markerSize} min={10} max={48} onChange={(v) => set({ markerSize: v })} format={(v) => `${v}px`} />}
      {g === "eraser" && <Slider label={t("st.eraserSize")} value={s.eraserSize} min={8} max={120} onChange={(v) => set({ eraserSize: v })} format={(v) => `${v}px`} />}
      {g !== "eraser" && g !== "laser" && (
        <div className="row">
          {presetName === null ? (
            <button type="button" className="btn ghost" onClick={() => setPresetName("")}>
              <Save /> {t("st.savePreset")}
            </button>
          ) : (
            <>
              <input
                className="field"
                autoFocus
                placeholder={t("st.presetName")}
                value={presetName}
                maxLength={40}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") savePreset();
                  if (e.key === "Escape") setPresetName(null);
                }}
              />
              <button type="button" className="btn primary" onClick={savePreset}>
                {t("common.save")}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
