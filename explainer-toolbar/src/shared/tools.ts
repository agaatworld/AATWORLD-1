import type { ToolId } from "../engine/editor";

export type ActionId =
  | "undo"
  | "redo"
  | "clear"
  | "image"
  | "whiteboard"
  | "blackboard"
  | "hideInk"
  | "workspaces";

export type ItemId = ToolId | ActionId;
export type Category = "draw" | "shapes" | "annotate" | "edit" | "insert" | "board" | "actions";

export interface CatalogItem {
  id: ItemId;
  kind: "tool" | "action";
  category: Category;
  /** Single key used inside drawing mode. */
  key?: string;
  /** Extra search words (English and Arabic). */
  keywords: string;
}

export const CATALOG: CatalogItem[] = [
  { id: "select", kind: "tool", category: "edit", key: "V", keywords: "select move resize rotate pointer تحديد نقل" },
  { id: "pen", kind: "tool", category: "draw", key: "P", keywords: "pen draw ink freehand write قلم رسم" },
  { id: "highlighter", kind: "tool", category: "draw", key: "H", keywords: "highlighter marker mark تظليل" },
  { id: "laser", kind: "tool", category: "draw", key: "L", keywords: "laser pointer present fade مؤشر ليزر" },
  { id: "arrow", kind: "tool", category: "shapes", key: "A", keywords: "arrow point سهم" },
  { id: "line", kind: "tool", category: "shapes", key: "I", keywords: "line straight خط" },
  { id: "rect", kind: "tool", category: "shapes", key: "R", keywords: "rectangle box square مستطيل مربع" },
  { id: "ellipse", kind: "tool", category: "shapes", key: "O", keywords: "ellipse circle oval دائرة شكل بيضاوي" },
  { id: "text", kind: "tool", category: "annotate", key: "T", keywords: "text type label write نص كتابة" },
  { id: "marker", kind: "tool", category: "annotate", key: "N", keywords: "step number marker badge sequence خطوة رقم ترقيم" },
  { id: "eraser", kind: "tool", category: "edit", key: "E", keywords: "eraser delete stroke object ممحاة حذف" },
  { id: "pixelEraser", kind: "tool", category: "edit", key: "X", keywords: "pixel eraser rub partial ممحاة جزئية" },
  { id: "image", kind: "action", category: "insert", keywords: "image picture photo insert paste صورة إدراج" },
  { id: "whiteboard", kind: "action", category: "board", key: "W", keywords: "whiteboard white background board سبورة بيضاء" },
  { id: "blackboard", kind: "action", category: "board", key: "K", keywords: "blackboard dark background board سبورة سوداء" },
  { id: "undo", kind: "action", category: "actions", keywords: "undo back تراجع" },
  { id: "redo", kind: "action", category: "actions", keywords: "redo again إعادة" },
  { id: "clear", kind: "action", category: "actions", keywords: "clear erase all delete everything مسح الكل" },
  { id: "hideInk", kind: "action", category: "actions", keywords: "hide show ink drawings visibility إخفاء إظهار" },
  { id: "workspaces", kind: "action", category: "actions", keywords: "workspace page scene switch مساحة عمل صفحة" },
];

export const CATEGORIES: Category[] = ["draw", "shapes", "annotate", "edit", "insert", "board", "actions"];

export function catalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.id === id);
}

export const TOOL_IDS = CATALOG.filter((c) => c.kind === "tool").map((c) => c.id as ToolId);

export function isToolId(v: unknown): v is ToolId {
  return typeof v === "string" && (TOOL_IDS as string[]).includes(v);
}

/** Recommended toolbar layouts (pinned items, in order). */
export const LAYOUTS: Record<"essential" | "teaching" | "presentation" | "complete", ItemId[]> = {
  essential: ["select", "pen", "highlighter", "arrow", "rect", "text", "eraser"],
  teaching: ["select", "pen", "highlighter", "arrow", "rect", "ellipse", "text", "marker", "eraser", "whiteboard"],
  presentation: ["laser", "pen", "highlighter", "arrow", "marker"],
  complete: ["select", "pen", "highlighter", "laser", "arrow", "line", "rect", "ellipse", "text", "marker", "eraser", "pixelEraser", "image", "whiteboard"],
};

/** Tools that share one remembered style. */
export type StyleGroup = "pen" | "highlighter" | "laser" | "shape" | "text" | "marker" | "eraser" | "select";
export function styleGroup(tool: ToolId): StyleGroup {
  switch (tool) {
    case "rect":
    case "ellipse":
    case "line":
    case "arrow":
      return "shape";
    case "pixelEraser":
    case "eraser":
      return "eraser";
    default:
      return tool;
  }
}
