import { DEFAULT_STYLE, type ToolId, type ToolStyle } from "../engine/editor";
import { isColor } from "../engine/validate";
import { CATALOG, LAYOUTS, isToolId, styleGroup, type ItemId, type StyleGroup } from "./tools";

/**
 * Frontend-owned part of the settings document (`doc.ui`). Rust stores it
 * verbatim; everything is validated here so a damaged or older file can
 * never break the interface.
 */
export interface Preset {
  id: string;
  name: string;
  tool: ToolId;
  style: Partial<ToolStyle>;
}

export interface UiSettings {
  language: "system" | "en" | "ar";
  theme: "system" | "dark" | "light";
  reducedMotion: "system" | "on" | "off";
  orientation: "vertical" | "horizontal";
  iconSize: "compact" | "regular" | "large";
  launcher: "dot" | "pill";
  minimized: boolean;
  pinned: ItemId[];
  recentTools: ToolId[];
  favorites: string[];
  recentColors: string[];
  tool: ToolId;
  styles: Record<StyleGroup, Partial<ToolStyle>>;
  presets: Preset[];
  restoreOnStart: boolean;
  modeBanner: boolean;
  screenFrame: boolean;
  smoothing: number;
  pressure: boolean;
}

export const FAVORITES = ["#FF5A36", "#FFC43D", "#2BD47D", "#2E9BFF", "#A66BFF", "#FF4FA3", "#FFFFFF", "#111317", "#7A8494", "#00C2C7"];

const GROUP_DEFAULTS: Record<StyleGroup, Partial<ToolStyle>> = {
  pen: { color: "#FF5A36", width: 4, opacity: 1, dash: "solid" },
  highlighter: { color: "#FFC43D", width: 18, opacity: 0.4 },
  laser: { color: "#FF3B30" },
  shape: { color: "#2E9BFF", width: 4, opacity: 1, fill: null, fillOpacity: 0.22, dash: "solid", heads: "end", radius: 6 },
  text: { color: "#FFFFFF", fontSize: 28, font: "Segoe UI", bold: true, textBackground: "#111317", opacity: 1 },
  marker: { color: "#FF5A36", markerSize: 18, opacity: 1 },
  eraser: { eraserSize: 28 },
  select: {},
};

export const DEFAULT_UI: UiSettings = {
  language: "system",
  theme: "system",
  reducedMotion: "system",
  orientation: "vertical",
  iconSize: "regular",
  launcher: "dot",
  minimized: false,
  pinned: LAYOUTS.essential,
  recentTools: [],
  favorites: FAVORITES,
  recentColors: [],
  tool: "pen",
  styles: GROUP_DEFAULTS,
  presets: [],
  restoreOnStart: true,
  modeBanner: true,
  screenFrame: true,
  smoothing: 0.5,
  pressure: true,
};

function pick<T extends string>(v: unknown, allowed: readonly T[], d: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : d;
}

function num(v: unknown, lo: number, hi: number, d: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
}

function cleanStyle(v: unknown): Partial<ToolStyle> {
  if (!v || typeof v !== "object") return {};
  const r = v as Record<string, unknown>;
  const s: Partial<ToolStyle> = {};
  if (isColor(r.color)) s.color = r.color;
  if (r.width !== undefined) s.width = num(r.width, 0.5, 120, 4);
  if (r.opacity !== undefined) s.opacity = num(r.opacity, 0.05, 1, 1);
  if (r.fill === null || isColor(r.fill)) s.fill = r.fill as string | null;
  if (r.fillOpacity !== undefined) s.fillOpacity = num(r.fillOpacity, 0, 1, 0.22);
  if (r.dash === "solid" || r.dash === "dash" || r.dash === "dot") s.dash = r.dash;
  if (typeof r.font === "string" && r.font.length < 80) s.font = r.font.replace(/[^\p{L}\p{N} _.-]/gu, "");
  if (r.fontSize !== undefined) s.fontSize = num(r.fontSize, 8, 200, 28);
  if (typeof r.bold === "boolean") s.bold = r.bold;
  if (typeof r.italic === "boolean") s.italic = r.italic;
  if (r.textBackground === null || isColor(r.textBackground)) s.textBackground = r.textBackground as string | null;
  if (r.align === "start" || r.align === "center" || r.align === "end") s.align = r.align;
  if (r.markerSize !== undefined) s.markerSize = num(r.markerSize, 8, 80, 18);
  if (r.heads === "end" || r.heads === "both") s.heads = r.heads;
  if (r.radius !== undefined) s.radius = num(r.radius, 0, 60, 6);
  if (r.eraserSize !== undefined) s.eraserSize = num(r.eraserSize, 6, 200, 28);
  return s;
}

const ITEM_IDS = CATALOG.map((c) => c.id);

export function sanitizeUi(raw: unknown): UiSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_UI;
  const pinned = Array.isArray(r.pinned) ? (r.pinned.filter((x) => ITEM_IDS.includes(x as ItemId)) as ItemId[]) : d.pinned;
  const colors = (v: unknown, max: number, dflt: string[]) =>
    Array.isArray(v) ? [...new Set(v.filter(isColor).map((c) => c.toUpperCase()))].slice(0, max) : dflt;
  const stylesRaw = (r.styles && typeof r.styles === "object" ? r.styles : {}) as Record<string, unknown>;
  const styles = { ...GROUP_DEFAULTS };
  for (const g of Object.keys(GROUP_DEFAULTS) as StyleGroup[]) styles[g] = { ...GROUP_DEFAULTS[g], ...cleanStyle(stylesRaw[g]) };
  const presets: Preset[] = Array.isArray(r.presets)
    ? r.presets
        .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
        .filter((p) => typeof p.id === "string" && typeof p.name === "string" && isToolId(p.tool))
        .slice(0, 40)
        .map((p) => ({ id: String(p.id).slice(0, 40), name: String(p.name).slice(0, 40), tool: p.tool as ToolId, style: cleanStyle(p.style) }))
    : [];
  return {
    language: pick(r.language, ["system", "en", "ar"] as const, d.language),
    theme: pick(r.theme, ["system", "dark", "light"] as const, d.theme),
    reducedMotion: pick(r.reducedMotion, ["system", "on", "off"] as const, d.reducedMotion),
    orientation: pick(r.orientation, ["vertical", "horizontal"] as const, d.orientation),
    iconSize: pick(r.iconSize, ["compact", "regular", "large"] as const, d.iconSize),
    launcher: pick(r.launcher, ["dot", "pill"] as const, d.launcher),
    minimized: typeof r.minimized === "boolean" ? r.minimized : d.minimized,
    pinned: pinned.length ? [...new Set(pinned)] : d.pinned,
    recentTools: Array.isArray(r.recentTools) ? (r.recentTools.filter(isToolId).slice(0, 6) as ToolId[]) : [],
    favorites: colors(r.favorites, 12, d.favorites).length ? colors(r.favorites, 12, d.favorites) : d.favorites,
    recentColors: colors(r.recentColors, 8, []),
    tool: isToolId(r.tool) ? r.tool : d.tool,
    styles,
    presets,
    restoreOnStart: typeof r.restoreOnStart === "boolean" ? r.restoreOnStart : d.restoreOnStart,
    modeBanner: typeof r.modeBanner === "boolean" ? r.modeBanner : d.modeBanner,
    screenFrame: typeof r.screenFrame === "boolean" ? r.screenFrame : d.screenFrame,
    smoothing: num(r.smoothing, 0, 1, d.smoothing),
    pressure: typeof r.pressure === "boolean" ? r.pressure : d.pressure,
  };
}

/** Full style for a tool: engine defaults ← group defaults ← saved group style ← global prefs. */
export function styleFor(ui: UiSettings, tool: ToolId): ToolStyle {
  const g = styleGroup(tool);
  return { ...DEFAULT_STYLE, ...GROUP_DEFAULTS[g], ...ui.styles[g], smoothing: ui.smoothing, pressure: ui.pressure };
}

export interface ShortcutSettings {
  toggleAnnotation: string;
  toggleToolbar: string;
  toggleInk: string;
  clearAll: string;
}

export function shortcutsOf(doc: unknown): ShortcutSettings {
  const s = ((doc as Record<string, unknown> | null)?.shortcuts ?? {}) as Record<string, unknown>;
  const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
  return {
    toggleAnnotation: str(s.toggleAnnotation, "Ctrl+Shift+Space"),
    toggleToolbar: str(s.toggleToolbar, "Ctrl+Shift+F12"),
    toggleInk: str(s.toggleInk, "Ctrl+Shift+F11"),
    clearAll: str(s.clearAll, "Ctrl+Shift+F10"),
  };
}

export function pushRecent<T>(list: T[], item: T, max: number): T[] {
  return [item, ...list.filter((x) => x !== item)].slice(0, max);
}
