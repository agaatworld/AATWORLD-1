import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { INK, RED, SOFT, inter } from "../theme";
import { Rise, useIn } from "../ui";

// Scene 4 (13.8–17 s): the same advertiser, printed in the magazine and live as an online page
const Label: React.FC<{ text: string; red?: boolean }> = ({ text, red }) => (
  <div
    style={{
      display: "inline-block",
      background: red ? RED : INK,
      color: "#fff",
      fontSize: 44,
      fontWeight: 800,
      padding: "8px 28px",
      borderRadius: 999,
    }}
  >
    {text}
  </div>
);

export const Showcase: React.FC = () => {
  const f = useCurrentFrame();
  const print = useIn(2, 14);
  const online = useIn(22, 14);
  const arrow = useIn(16, 12);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #fff 0%, ${SOFT} 100%)`, fontFamily: inter, color: INK }}>
      <Sequence from={4} layout="none">
        <Audio src={staticFile("voice/s4.wav")} />
      </Sequence>
      <div style={{ position: "absolute", top: 120, left: 90, right: 90 }}>
        <Rise delay={0}>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: -2.5, lineHeight: 1.05 }}>Your ad.</div>
        </Rise>
        <Rise delay={6}>
          <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -2, lineHeight: 1.1, color: RED }}>Printed & online.</div>
        </Rise>
      </div>
      {/* printed page */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 470,
          translate: `${interpolate(print, [0, 1], [-700, 0])}px 0px`,
          rotate: `${interpolate(print, [0, 1], [-14, -5]) + interpolate(f, [0, 96], [0, 1.5])}deg`,
        }}
      >
        <Img src={staticFile("product-2.png")} style={{ width: 540, borderRadius: 10, boxShadow: "0 40px 80px -30px rgba(0,0,0,.45)" }} />
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <Label text="In the magazine" />
        </div>
      </div>
      {/* arrow */}
      <svg
        viewBox="0 0 100 60"
        width="170"
        style={{ position: "absolute", left: 470, top: 1300, opacity: arrow, scale: String(interpolate(arrow, [0, 1], [0.5, 1])) }}
      >
        <path d="M5 40 Q45 0 80 28" fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round" />
        <path d="M66 18 L84 30 L66 42" fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* online page on a phone */}
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 640,
          translate: `${interpolate(online, [0, 1], [700, 0])}px 0px`,
          rotate: `${interpolate(online, [0, 1], [14, 5])}deg`,
        }}
      >
        <div style={{ width: 410, height: 888, borderRadius: 56, background: "#0B0B0D", padding: 14, boxShadow: "0 50px 90px -30px rgba(210,31,38,.5)" }}>
          <div style={{ width: 382, height: 860, borderRadius: 44, overflow: "hidden" }}>
            <Img src={staticFile("online-ad.png")} style={{ width: 382 }} />
          </div>
        </div>
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <Label text="Live online" red />
        </div>
      </div>
    </AbsoluteFill>
  );
};
