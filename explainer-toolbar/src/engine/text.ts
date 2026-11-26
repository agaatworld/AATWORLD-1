import type { TextObj } from "./model";

const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LTR = /[A-Za-zÀ-ɏͰ-ϿЀ-ӿ]/;

/** Direction from the first strong character (Unicode bidi "P2" rule, simplified). */
export function resolveDir(text: string, dir: TextObj["dir"]): "ltr" | "rtl" {
  if (dir !== "auto") return dir;
  for (const ch of text) {
    if (RTL.test(ch)) return "rtl";
    if (LTR.test(ch)) return "ltr";
  }
  return "ltr";
}

export function fontString(o: Pick<TextObj, "italic" | "bold" | "size" | "font">): string {
  const fam = o.font.replace(/"/g, "");
  return `${o.italic ? "italic " : ""}${o.bold ? 700 : 400} ${o.size}px "${fam}", "Segoe UI", "Tahoma", sans-serif`;
}

export const LINE_HEIGHT = 1.3;

export function padding(o: Pick<TextObj, "size" | "background">): number {
  return o.background ? o.size * 0.3 : o.size * 0.08;
}

export type Measurer = (font: string, line: string) => number;

/** Approximate width used when no canvas is available (tests, early start). */
export const approxMeasure: Measurer = (font, line) => {
  const m = /(\d+(?:\.\d+)?)px/.exec(font);
  const size = m ? parseFloat(m[1]) : 16;
  return line.length * size * 0.56;
};

export function measureText(o: TextObj, measure: Measurer): { w: number; h: number } {
  const lines = o.text.split("\n");
  const font = fontString(o);
  let w = 0;
  for (const l of lines) w = Math.max(w, measure(font, l || " "));
  const pad = padding(o);
  return { w: Math.ceil(w + pad * 2), h: Math.ceil(lines.length * o.size * LINE_HEIGHT + pad * 2) };
}
