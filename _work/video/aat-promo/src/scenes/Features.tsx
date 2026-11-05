import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { DEEP, INK, RED, inter } from "../theme";
import { Icon, Rise, useIn } from "../ui";

// Scene 5 (17–22.2 s): the four AAT services
const ITEMS = [
  { icon: "ads", title: "Print + Online Ads", sub: "Every ad becomes a clickable page" },
  { icon: "club", title: "AAT Business Club", sub: "2,800+ members · 30 exhibitions" },
  { icon: "shows", title: "International Exhibitions", sub: "1,460 trade shows · 16 countries" },
  { icon: "products", title: "Product Showcase", sub: "Buyers contact you directly" },
] as const;

const Card: React.FC<{ i: number }> = ({ i }) => {
  const it = ITEMS[i];
  const p = useIn(14 + i * 16, 13);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 34,
        background: "#fff",
        borderRadius: 34,
        padding: "34px 40px",
        boxShadow: "0 30px 60px -30px rgba(0,0,0,.5)",
        translate: `${interpolate(p, [0, 1], [900, 0])}px 0px`,
        rotate: `${interpolate(p, [0, 1], [6, 0])}deg`,
      }}
    >
      <div style={{ flex: "none", width: 120, height: 120, borderRadius: 30, background: "#FDECEC", display: "grid", placeItems: "center" }}>
        <Icon name={it.icon} size={78} />
      </div>
      <div>
        <div style={{ fontSize: 50, fontWeight: 900, color: INK, letterSpacing: -1, lineHeight: 1.1 }}>{it.title}</div>
        <div style={{ fontSize: 38, fontWeight: 600, color: "#55555C", marginTop: 8 }}>{it.sub}</div>
      </div>
    </div>
  );
};

export const Features: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${RED} 0%, ${DEEP} 100%)`, fontFamily: inter, padding: "0 80px", justifyContent: "center" }}>
    <Sequence from={4} layout="none">
      <Audio src={staticFile("voice/s5.wav")} />
    </Sequence>
    <Rise delay={0}>
      <div style={{ color: "#fff", fontSize: 104, fontWeight: 900, letterSpacing: -2.5 }}>AAT services</div>
    </Rise>
    <Rise delay={5}>
      <div style={{ width: 150, height: 12, borderRadius: 6, background: "#fff", margin: "24px 0 70px" }} />
    </Rise>
    <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
      {ITEMS.map((_, i) => (
        <Card key={i} i={i} />
      ))}
    </div>
  </AbsoluteFill>
);
