import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { RED } from "./theme";

// spring() entrance: 0 → 1 starting at `delay` frames
export const useIn = (delay = 0, damping = 14, mass = 0.8) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass, stiffness: 140 } });
};

// a word or block that springs up into place
export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number }> = ({
  delay = 0,
  children,
  style,
  dist = 70,
}) => {
  const p = useIn(delay);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        translate: `0px ${interpolate(p, [0, 1], [dist, 0])}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// the pointer used in the demo
export const Cursor: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 64, height: 64, scale: String(1 - press * 0.18), transformOrigin: "8px 6px", zIndex: 50 }}>
    <svg viewBox="0 0 32 32" width="64" height="64" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}>
      <path d="M4 2 L4 26 L10.5 20 L15 30 L19.5 28 L15 18.5 L24 18.5 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  </div>
);

// red ring that grows where the pointer taps
export const Ripple: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 18) return null;
  const r = interpolate(t, [0, 18], [10, 90]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `6px solid ${RED}`,
        opacity: interpolate(t, [0, 18], [0.9, 0]),
        zIndex: 49,
      }}
    />
  );
};

// simple line icons for the service cards
export const Icon: React.FC<{ name: "ads" | "club" | "shows" | "products"; size?: number; color?: string }> = ({ name, size = 72, color = RED }) => {
  const p = { fill: "none", stroke: color, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      {name === "ads" && (
        <g {...p}>
          <rect x="4" y="5" width="17" height="22" rx="2" />
          <path d="M8 10h9M8 14h9M8 18h5" />
          <rect x="17" y="13" width="11" height="15" rx="2" fill="#fff" />
          <path d="M21 25h3" />
        </g>
      )}
      {name === "club" && (
        <g {...p}>
          <rect x="4" y="10" width="24" height="16" rx="2.5" />
          <path d="M12 10V7h8v3M4 17h24" />
          <circle cx="16" cy="17" r="2" fill={color} />
        </g>
      )}
      {name === "shows" && (
        <g {...p}>
          <rect x="4" y="6" width="24" height="21" rx="2.5" />
          <path d="M4 12h24M10 3v6M22 3v6" />
          <path d="M10 17h4M18 17h4M10 22h4" />
        </g>
      )}
      {name === "products" && (
        <g {...p}>
          <path d="M16 3 28 9v14l-12 6-12-6V9z" />
          <path d="M4 9l12 6 12-6M16 15v14" />
        </g>
      )}
    </svg>
  );
};
