import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { INK, RED, SOFT, arabic, inter } from "../theme";
import { Rise, useIn } from "../ui";

// Scene 2 (3–8 s): who AAT is — logo, name in English and Arabic, since 1982, the magazine
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useIn(2, 11);
  const cover = useIn(34, 15, 1);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #fff 0%, ${SOFT} 100%)`, fontFamily: inter, color: INK, alignItems: "center" }}>
      <Sequence from={4} layout="none">
        <Audio src={staticFile("voice/s2.wav")} />
      </Sequence>
      <Img
        src={staticFile("logo.png")}
        style={{
          marginTop: 150,
          width: 520,
          scale: String(interpolate(logo, [0, 1], [0.4, 1])),
          opacity: interpolate(logo, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        }}
      />
      <Rise delay={14} style={{ marginTop: 34, textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: -2 }}>Arab Asian Trade</div>
      </Rise>
      <Rise delay={20} style={{ marginTop: 6 }}>
        <div style={{ fontFamily: arabic, fontSize: 72, fontWeight: 700, color: RED, direction: "rtl" }}>التجارة العربية الآسيوية</div>
      </Rise>
      <Rise delay={26} style={{ marginTop: 26 }}>
        <div style={{ background: RED, color: "#fff", fontSize: 52, fontWeight: 800, padding: "12px 40px", borderRadius: 999 }}>Since 1982</div>
      </Rise>
      <Img
        src={staticFile("product-1.png")}
        style={{
          position: "absolute",
          top: 1010,
          width: 600,
          borderRadius: 14,
          boxShadow: "0 40px 80px -30px rgba(80,0,4,.55)",
          translate: `0px ${interpolate(cover, [0, 1], [700, 0]) + interpolate(frame, [34, 150], [0, -40])}px`,
          rotate: `${interpolate(cover, [0, 1], [10, -3])}deg`,
        }}
      />
    </AbsoluteFill>
  );
};
