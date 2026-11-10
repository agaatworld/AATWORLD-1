import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { DEEP, RED, inter } from "../theme";
import { Rise, useIn } from "../ui";

// Scene 1 (0–3 s): the question that stops the scroll
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const box = useIn(30, 12);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 20% 10%, ${RED} 0%, #B5121A 45%, ${DEEP} 100%)`,
        fontFamily: inter,
        color: "#fff",
        justifyContent: "center",
        padding: "0 90px",
      }}
    >
      <Sequence from={4} layout="none">
        <Audio src={staticFile("voice/s1.wav")} />
      </Sequence>
      <div style={{ scale: String(interpolate(frame, [0, 90], [1, 1.06])), transformOrigin: "left center" }}>
        <Rise delay={2}>
          <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3 }}>Want</div>
        </Rise>
        <Rise delay={8}>
          <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3 }}>buyers</div>
        </Rise>
        <Rise delay={16}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.2, marginTop: 24, opacity: 0.92 }}>across the</div>
        </Rise>
        <Rise delay={24}>
          <div
            style={{
              display: "inline-block",
              marginTop: 18,
              padding: "6px 30px 14px",
              background: "#fff",
              color: RED,
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: -3,
              borderRadius: 18,
              rotate: `${interpolate(box, [0, 1], [-6, -2])}deg`,
            }}
          >
            Arab world
          </div>
        </Rise>
        <Rise delay={34}>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.2, marginTop: 18, letterSpacing: -3 }}>& Africa?</div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
