import { useLayoutEffect, useRef } from "react";
import type { TextEdit } from "../engine/editor";
import { fontString, LINE_HEIGHT, padding } from "../engine/text";
import { t } from "../shared/i18n";

/** In-place text editor, styled to match how the text will be drawn. */
export function TextBox({ edit, dpr, onCommit, inputRef }: { edit: TextEdit; dpr: number; onCommit: (value: string) => void; inputRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const d = edit.draft;
  const committed = useRef(false);
  const size = d.size / dpr;
  const pad = padding(d) / dpr;

  const fit = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.width = "10px";
    el.style.height = "10px";
    el.style.width = `${Math.max(size * 2.5, el.scrollWidth + 4)}px`;
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(fit, [edit]);
  useLayoutEffect(() => {
    committed.current = false;
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [edit, inputRef]);

  const commit = () => {
    if (committed.current) return;
    committed.current = true;
    onCommit(inputRef.current?.value ?? "");
  };

  return (
    <textarea
      ref={inputRef}
      className="ov-text"
      dir="auto"
      spellCheck={false}
      defaultValue={d.text}
      placeholder={t("ov.textPlaceholder")}
      aria-label={t("tool.text")}
      style={{
        left: d.x / dpr,
        top: d.y / dpr,
        font: fontString({ ...d, size }),
        lineHeight: LINE_HEIGHT,
        color: d.color,
        background: d.background ?? "transparent",
        padding: pad,
        textAlign: d.align === "center" ? "center" : d.align,
        borderRadius: d.background ? Math.min(size * 0.3, 14) : 4,
      }}
      onInput={fit}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
}
