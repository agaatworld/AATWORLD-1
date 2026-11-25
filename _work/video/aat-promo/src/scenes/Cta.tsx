import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { INK, RED, SOFT, inter } from "../theme";
import { Rise, useIn } from "../ui";

// Scene 6 (22.2–25 s): proof (years, issues, members, advertisers) and the call to action
const STATS = [
  ["1982", "since"],
  ["560", "issues"],
  ["2,800+", "members"],
];
const LOGOS = ["p4", "p5", "p7", "p9", "p2", "p22"];

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const btn = useIn(26, 10);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #fff 0%, ${SOFT} 100%)`, fontFamily: inter, color: INK, alignItems: "center" }}>
      <Sequence from={4} layout="none">
        <Audio src={staticFile("voice/s6.wav")} />
      </Sequence>
      <div style={{ display: "flex", gap: 30, marginTop: 150 }}>
        {STATS.map(([n, l], i) => (
          <Rise key={n} delay={i * 4} style={{ textAlign: "center", width: 290 }}>
            <div style={{ fontSize: 84, fontWeight: 900, color: RED, letterSpacing: -2 }}>{n}</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#55555C" }}>{l}</div>
          </Rise>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 280px)", gap: 24, marginTop: 70 }}>
        {LOGOS.map((l, i) => (
          <Rise key={l} delay={8 + i * 2} dist={40}>
            <div style={{ height: 140, background: "#fff", borderRadius: 22, display: "grid", placeItems: "center", padding: 18, boxShadow: "0 14px 30px -18px rgba(0,0,0,.35)" }}>
              <Img src={staticFile(`logos/${l}.png`)} style={{ maxWidth: "100%", maxHeight: 100, objectFit: "contain" }} />
            </div>
          </Rise>
        ))}
      </div>
      <div
        style={{
          marginTop: 90,
          background: RED,
          color: "#fff",
          fontSize: 76,
          fontWeight: 900,
          letterSpacing: -1.5,
          padding: "34px 70px",
          borderRadius: 999,
          boxShadow: "0 30px 60px -20px rgba(210,31,38,.7)",
          scale: String(interpolate(btn, [0, 1], [0.6, 1]) * (1 + 0.025 * Math.sin(Math.max(0, f - 40) / 4))),
          opacity: interpolate(btn, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Advertise with AAT
      </div>
      <Rise delay={34} style={{ marginTop: 50, textAlign: "center" }}>
        <div style={{ fontSize: 66, fontWeight: 800 }}>+886 966 404 681</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: RED, marginTop: 8 }}>aatworld.com</div>
      </Rise>
      <Rise delay={40} style={{ position: "absolute", bottom: 110 }}>
        <Img src={staticFile("logo.png")} style={{ width: 300 }} />
      </Rise>
    </AbsoluteFill>
  );
};
