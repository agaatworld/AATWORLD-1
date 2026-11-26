import {
  ArrowUpRight,
  Eraser,
  Eye,
  EyeOff,
  Highlighter,
  ImagePlus,
  Layers,
  Minus,
  MousePointer2,
  PenLine,
  Presentation,
  Redo2,
  Square,
  Circle,
  Trash2,
  Type,
  Undo2,
  type LucideProps,
} from "lucide-react";
import type { ReactElement } from "react";
import type { ItemId } from "../shared/tools";

type IconProps = { size?: number; className?: string };

const base = (size = 18) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.85, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

/* Custom glyphs on the same 24px grid and stroke as the rest of the set. */
export function LaserIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="7" opacity="0.45" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
    </svg>
  );
}

export function StepIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10.4 9.2 12.6 8v8" />
      <path d="M10.2 16h4.6" />
    </svg>
  );
}

export function PixelEraserIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="m15.5 4.5 4 4a1.6 1.6 0 0 1 0 2.3L12 18.3H7.6l-3-3a1.6 1.6 0 0 1 0-2.3l8.6-8.5a1.6 1.6 0 0 1 2.3 0Z" />
      <path d="M17 21h.01M20 21h.01M14 21h.01" strokeWidth="2.6" />
    </svg>
  );
}

export function BlackboardIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="12.5" rx="2" fill="currentColor" fillOpacity="0.28" />
      <path d="M7 20.5 9 16.5M17 20.5 15 16.5M8 9.5h5M8 12h3" />
    </svg>
  );
}

/** App mark: the open circle around a point (matches the app icon). */
export function MarkIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.4 6.6c-2.6-2-7.4-1.5-9.2 1.5-1.8 3-.4 7.4 3.7 8.9 4 1.4 8.2-.8 8.6-4.6.3-2.7-1-4.6-2.4-5.4" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="12.3" cy="12" r="1.9" fill="currentColor" />
    </svg>
  );
}

const MAP: Record<ItemId, (p: LucideProps & IconProps) => ReactElement> = {
  select: (p) => <MousePointer2 {...p} />,
  pen: (p) => <PenLine {...p} />,
  highlighter: (p) => <Highlighter {...p} />,
  laser: (p) => <LaserIcon size={p.size} />,
  arrow: (p) => <ArrowUpRight {...p} />,
  line: (p) => <Minus {...p} style={{ transform: "rotate(-45deg)" }} />,
  rect: (p) => <Square {...p} />,
  ellipse: (p) => <Circle {...p} />,
  text: (p) => <Type {...p} />,
  marker: (p) => <StepIcon size={p.size} />,
  eraser: (p) => <Eraser {...p} />,
  pixelEraser: (p) => <PixelEraserIcon size={p.size} />,
  image: (p) => <ImagePlus {...p} />,
  whiteboard: (p) => <Presentation {...p} />,
  blackboard: (p) => <BlackboardIcon size={p.size} />,
  undo: (p) => <Undo2 {...p} />,
  redo: (p) => <Redo2 {...p} />,
  clear: (p) => <Trash2 {...p} />,
  hideInk: (p) => <EyeOff {...p} />,
  workspaces: (p) => <Layers {...p} />,
};

export function ItemIcon({ id, size }: { id: ItemId; size?: number }) {
  const C = MAP[id];
  return C ? C({ size, "aria-hidden": true }) : null;
}

export { Eye };
