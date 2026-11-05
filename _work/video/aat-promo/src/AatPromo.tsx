import React from "react";
import { AbsoluteFill, interpolate, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Cta } from "./scenes/Cta";
import { Demo } from "./scenes/Demo";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Showcase } from "./scenes/Showcase";

// AAT services — 25 s launch video, 1080×1920, 30 fps.
// Hook → Intro → Demo → Showcase → Features → Proof + CTA; male voice per scene, music underneath.
export const AatPromo: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Audio
      src={staticFile("music.wav")}
      volume={(f) => interpolate(f, [0, 660, 670, 750], [0.3, 0.3, 0.55, 0.45], { extrapolateRight: "clamp" })}
    />
    <Series>
      <Series.Sequence name="Hook" durationInFrames={90}>
        <Hook />
      </Series.Sequence>
      <Series.Sequence name="Intro" durationInFrames={150}>
        <Intro />
      </Series.Sequence>
      <Series.Sequence name="Demo" durationInFrames={174}>
        <Demo />
      </Series.Sequence>
      <Series.Sequence name="Showcase" durationInFrames={96}>
        <Showcase />
      </Series.Sequence>
      <Series.Sequence name="Features" durationInFrames={156}>
        <Features />
      </Series.Sequence>
      <Series.Sequence name="CTA" durationInFrames={84}>
        <Cta />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
