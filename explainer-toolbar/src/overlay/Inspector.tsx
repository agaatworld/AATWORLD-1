import { AlignCenter, AlignLeft, AlignRight, Bold, BringToFront, Copy, FlipHorizontal2, FlipVertical2, Lock, LockOpen, Minus, PaintBucket, Pencil, Plus, RotateCw, SendToBack, Trash2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { Editor } from "../engine/editor";
import type { Rect } from "../engine/geometry";
import type { SceneObj } from "../engine/model";
import { t } from "../shared/i18n";
import { useApp } from "../shared/store";

const DASH_NEXT = { solid: "dash", dash: "dot", dot: "solid" } as const;
const ALIGN_NEXT = { start: "center", center: "end", end: "start" } as const;

/**
 * Contextual mini-inspector: shows only the controls that apply to what is
 * selected (stroke, shape, text, marker, image, or a mix).
 */
export function Inspector({ editor, objs, frame, dpr, onEditText }: { editor: Editor; objs: SceneObj[]; frame: Rect; dpr: number; onEditText: (id: string) => void }) {
  const { ui } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const kinds = new Set(objs.map((o) => o.kind));
  const first = objs[0];
  const only = (k: SceneObj["kind"]) => kinds.size === 1 && kinds.has(k);
  const hasColor = objs.some((o) => o.kind !== "image" && o.kind !== "erase");
  const widthy = objs.filter((o): o is Extract<SceneObj, { kind: "stroke" | "shape" }> => o.kind === "stroke" || o.kind === "shape");
  const fillable = objs.filter((o) => o.kind === "shape" && (o.shape === "rect" || o.shape === "ellipse"));
  const locked = objs.every((o) => o.locked);
  const color = first && "color" in first ? first.color : null;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const f = { x: frame.x / dpr, y: frame.y / dpr, w: frame.w / dpr, h: frame.h / dpr };
    let top = f.y - h - 46; // above the rotation handle
    if (top < 8) top = f.y + f.h + 16;
    if (top + h > innerHeight - 8) top = Math.max(8, innerHeight - h - 8);
    const left = Math.max(8, Math.min(innerWidth - w - 8, f.x + f.w / 2 - w / 2));
    setPos({ left, top });
  }, [frame.x, frame.y, frame.w, frame.h, dpr, objs.length, kinds.size]);

  const width = widthy.length ? Math.round(widthy[0].width / dpr) : 0;
  const opacity = first && "opacity" in first ? first.opacity : 1;
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div ref={ref} className="inspector surface" style={pos ?? { left: -9999, top: 0 }} onPointerDown={stop} role="toolbar" aria-label={t("ov.selected", { n: objs.length })}>
      {objs.length > 1 && <span className="count">{t("ov.selected", { n: objs.length })}</span>}
      {hasColor && !locked && (
        <>
          {ui.favorites.slice(0, 6).map((c) => (
            <button key={c} type="button" className="mini-sw" style={{ background: c }} aria-label={c} title={c} aria-pressed={color?.toUpperCase() === c.toUpperCase()} onClick={() => editor.restyleSelection({ color: c })} />
          ))}
          <span className="isep" />
        </>
      )}
      {widthy.length > 0 && !locked && (
        <>
          <button type="button" className="icon-btn" title={t("st.width")} aria-label={`${t("st.width")} −`} onClick={() => editor.restyleSelection({ width: Math.max(1, width - 1) })}>
            <Minus />
          </button>
          <span className="num" title={t("st.width")}>{width}</span>
          <button type="button" className="icon-btn" title={t("st.width")} aria-label={`${t("st.width")} +`} onClick={() => editor.restyleSelection({ width: Math.min(60, width + 1) })}>
            <Plus />
          </button>
          <button
            type="button"
            className="icon-btn"
            title={`${t("st.line")}: ${t(`st.${widthy[0].dash}`)}`}
            aria-label={t("st.line")}
            onClick={() => editor.restyleSelection({ dash: DASH_NEXT[widthy[0].dash] })}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray={widthy[0].dash === "dash" ? "4 3" : widthy[0].dash === "dot" ? "0.1 3.5" : undefined} />
            </svg>
          </button>
          <span className="isep" />
        </>
      )}
      {fillable.length > 0 && !locked && (
        <>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={fillable.some((o) => o.kind === "shape" && o.fill)}
            title={t("st.fill")}
            aria-label={t("st.fill")}
            onClick={() => {
              const has = fillable.some((o) => o.kind === "shape" && o.fill);
              editor.restyleSelection({ fill: has ? null : (color ?? "#2E9BFF") });
            }}
          >
            <PaintBucket />
          </button>
          <span className="isep" />
        </>
      )}
      {only("text") && first.kind === "text" && !locked && (
        <>
          <button type="button" className="icon-btn" aria-label={`${t("st.size")} −`} title={t("st.size")} onClick={() => editor.restyleSelection({ fontSize: Math.max(8, Math.round(first.size / dpr) - 2) })}>
            <Minus />
          </button>
          <span className="num">{Math.round(first.size / dpr)}</span>
          <button type="button" className="icon-btn" aria-label={`${t("st.size")} +`} title={t("st.size")} onClick={() => editor.restyleSelection({ fontSize: Math.min(200, Math.round(first.size / dpr) + 2) })}>
            <Plus />
          </button>
          <button type="button" className="icon-btn" aria-pressed={first.bold} title={t("st.bold")} aria-label={t("st.bold")} onClick={() => editor.restyleSelection({ bold: !first.bold })}>
            <Bold />
          </button>
          <button
            type="button"
            className="icon-btn"
            title={t(first.align === "start" ? "ov.alignStart" : first.align === "center" ? "ov.alignCenter" : "ov.alignEnd")}
            aria-label={t("ov.alignCenter")}
            onClick={() => editor.restyleSelection({ align: ALIGN_NEXT[first.align] })}
          >
            {first.align === "center" ? <AlignCenter /> : first.align === "end" ? <AlignRight /> : <AlignLeft />}
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={!!first.background}
            title={t("st.background")}
            aria-label={t("st.background")}
            onClick={() => editor.restyleSelection({ textBackground: first.background ? null : "#111317" })}
          >
            <PaintBucket />
          </button>
          <button type="button" className="icon-btn" title={t("ov.edit")} aria-label={t("ov.edit")} onClick={() => onEditText(first.id)}>
            <Pencil />
          </button>
          <span className="isep" />
        </>
      )}
      {only("marker") && first.kind === "marker" && objs.length === 1 && !locked && (
        <>
          <button type="button" className="icon-btn" aria-label={`${t("ov.number")} −`} title={t("ov.number")} onClick={() => editor.restyleSelection({ number: Math.max(0, first.n - 1) })}>
            <Minus />
          </button>
          <span className="num">{first.n}</span>
          <button type="button" className="icon-btn" aria-label={`${t("ov.number")} +`} title={t("ov.number")} onClick={() => editor.restyleSelection({ number: first.n + 1 })}>
            <Plus />
          </button>
          <span className="isep" />
        </>
      )}
      {only("image") && !locked && (
        <>
          <button type="button" className="icon-btn" title={t("ov.flipH")} aria-label={t("ov.flipH")} onClick={() => editor.restyleSelection({ flip: "x" })}>
            <FlipHorizontal2 />
          </button>
          <button type="button" className="icon-btn" title={t("ov.flipV")} aria-label={t("ov.flipV")} onClick={() => editor.restyleSelection({ flip: "y" })}>
            <FlipVertical2 />
          </button>
          <button type="button" className="icon-btn" title={t("ov.rotate")} aria-label={t("ov.rotate")} onClick={() => editor.rotateSelection(Math.PI / 2)}>
            <RotateCw />
          </button>
          <span className="isep" />
        </>
      )}
      {!locked && (
        <>
          <input
            className="slider islider"
            type="range"
            min={10}
            max={100}
            step={5}
            value={Math.round(opacity * 100)}
            style={{ ["--fill" as string]: `${((opacity * 100 - 10) / 90) * 100}%` }}
            title={`${t("st.opacity")} ${Math.round(opacity * 100)}%`}
            aria-label={t("st.opacity")}
            onChange={(e) => editor.restyleSelection({ opacity: Number(e.target.value) / 100 })}
          />
          <span className="isep" />
          <button type="button" className="icon-btn" title={`${t("ov.duplicate")}  (Ctrl+D)`} aria-label={t("ov.duplicate")} onClick={() => editor.duplicateSelection()}>
            <Copy />
          </button>
          <button type="button" className="icon-btn" title={t("ov.front")} aria-label={t("ov.front")} onClick={() => editor.arrange("front")}>
            <BringToFront />
          </button>
          <button type="button" className="icon-btn" title={t("ov.back")} aria-label={t("ov.back")} onClick={() => editor.arrange("back")}>
            <SendToBack />
          </button>
        </>
      )}
      <button type="button" className="icon-btn" aria-pressed={locked} title={locked ? t("ov.unlock") : t("ov.lock")} aria-label={locked ? t("ov.unlock") : t("ov.lock")} onClick={() => editor.setLocked(!locked)}>
        {locked ? <Lock /> : <LockOpen />}
      </button>
      {!locked && (
        <button type="button" className="icon-btn danger" title={`${t("ov.delete")}  (Del)`} aria-label={t("ov.delete")} onClick={() => editor.deleteSelection()}>
          <Trash2 />
        </button>
      )}
    </div>
  );
}
