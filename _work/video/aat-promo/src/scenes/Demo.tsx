import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { INK, RED, inter } from "../theme";
import { Cursor, Ripple, useIn } from "../ui";

// Scene 3 (8–13.8 s): a real visit to aatworld.com on a phone.
// The pointer opens the AAT assistant, types "Trade shows in Damascus", sends it, and opens a show.
// Screens are real screenshots of the site (390×844 CSS px); points below are in those CSS pixels.
const S = 1.72; // screen scale
const SW = 390 * S;
const SH = 844 * S;
const SX = (1080 - SW) / 2;
const SY = 330;
const at = (x: number, y: number) => ({ x: SX + x * S, y: SY + y * S });

const P = {
  start: at(300, 520),
  chat: at(44, 800),
  input: at(170, 794),
  send: at(353, 794),
  show: at(150, 548),
};
// [frame, point] keyframes for the pointer
const PATH: [number, { x: number; y: number }][] = [
  [14, P.start],
  [36, P.chat],
  [50, P.chat],
  [62, P.input],
  [100, P.input],
  [110, P.send],
  [124, P.send],
  [140, P.show],
  [168, at(320, 690)],
];
const TAPS = { chat: 40, input: 64, send: 112, show: 144 };
const TEXT = "Trade shows in Damascus";
const TYPE_FROM = 68;

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const pointer = (f: number) => {
  const fs = PATH.map((k) => k[0]);
  const o = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: ease };
  // interpolate between neighbouring keyframes so each move eases on its own
  let i = 0;
  while (i < PATH.length - 2 && f > fs[i + 1]) i++;
  return {
    x: interpolate(f, [fs[i], fs[i + 1]], [PATH[i][1].x, PATH[i + 1][1].x], o),
    y: interpolate(f, [fs[i], fs[i + 1]], [PATH[i][1].y, PATH[i + 1][1].y], o),
  };
};
const press = (f: number) =>
  Math.max(...Object.values(TAPS).map((t) => interpolate(f, [t - 3, t, t + 4], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

const CAPTIONS: [number, number, string][] = [
  [0, 62, "Ask the AAT assistant"],
  [62, 140, "Find trade shows in Damascus"],
  [140, 174, "Every show, every detail"],
];

export const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const phone = useIn(0, 15);
  const typed = TEXT.slice(0, Math.max(0, Math.floor((f - TYPE_FROM) / 1.35)));
  const caretOn = Math.floor(f / 8) % 2 === 0;
  const cur = pointer(f);
  // which real screen is showing
  const screen = f < TAPS.chat + 4 ? "product-3.png" : f < TAPS.send + 6 ? "demo-chat0.png" : f < TAPS.show + 6 ? "demo-chat1.png" : "demo-show.png";
  const swap = (t: number) => interpolate(f, [t + 2, t + 8], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lastSwap = [TAPS.chat, TAPS.send, TAPS.show].filter((t) => f >= t + 2).pop();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 40%, #2A0E10 0%, ${INK} 70%)`, fontFamily: inter }}>
      <Sequence from={6} layout="none">
        <Audio src={staticFile("voice/s3.wav")} />
      </Sequence>
      {CAPTIONS.map(([a, b, txt]) =>
        f >= a && f < b ? (
          <div
            key={txt}
            style={{
              position: "absolute",
              top: 120,
              width: "100%",
              textAlign: "center",
              color: "#fff",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1,
              opacity: interpolate(f, [a, a + 8], [0, 1], { extrapolateRight: "clamp" }),
              translate: `0px ${interpolate(f, [a, a + 10], [30, 0], { extrapolateRight: "clamp", easing: ease })}px`,
            }}
          >
            {txt.includes("Damascus") ? (
              <>
                Find trade shows in <span style={{ color: "#FF4A52" }}>Damascus</span>
              </>
            ) : (
              txt
            )}
          </div>
        ) : null,
      )}
      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: SX - 18,
          top: SY - 18,
          width: SW + 36,
          height: SH + 36,
          borderRadius: 86,
          background: "#0B0B0D",
          boxShadow: `0 0 0 3px #3A3A40, 0 60px 120px -40px rgba(210,31,38,.55)`,
          translate: `0px ${interpolate(phone, [0, 1], [500, 0])}px`,
          opacity: interpolate(phone, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ position: "absolute", left: 18, top: 18, width: SW, height: SH, borderRadius: 70, overflow: "hidden", background: "#fff" }}>
          <Img src={staticFile(screen)} style={{ width: SW, height: SH, opacity: lastSwap ? swap(lastSwap) : 1 }} />
          {/* typed text in the assistant's input box */}
          {f >= TYPE_FROM - 4 && f < TAPS.send + 6 ? (
            <div
              style={{
                position: "absolute",
                left: 34 * S,
                top: 777 * S,
                width: 286 * S,
                height: 34 * S,
                background: "#fff",
                borderRadius: 20 * S,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10 * S,
                fontSize: 17 * S,
                fontWeight: 500,
                color: INK,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {typed}
              <span style={{ width: 3, height: 22 * S * 0.9, background: RED, marginLeft: 4, opacity: caretOn ? 1 : 0 }} />
            </div>
          ) : null}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, translate: `0px ${interpolate(phone, [0, 1], [500, 0])}px` }}>
        <Ripple x={P.chat.x} y={P.chat.y} at={TAPS.chat} />
        <Ripple x={P.input.x} y={P.input.y} at={TAPS.input} />
        <Ripple x={P.send.x} y={P.send.y} at={TAPS.send} />
        <Ripple x={P.show.x} y={P.show.y} at={TAPS.show} />
      </div>
      {f >= 12 ? <Cursor x={cur.x - 8} y={cur.y - 6} press={press(f)} /> : null}
    </AbsoluteFill>
  );
};
