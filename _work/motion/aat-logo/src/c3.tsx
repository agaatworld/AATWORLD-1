import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Bg, E, Glyph, MARK, Placed, Plate, Props, Tagline, VB, mix, seg, useStage } from './lib';

// CONCEPT 03 — CINEMATIC RED REVEAL
// A dark room. The mark is only a deep silhouette until a single light travels across it from the left,
// carrying a narrow sheen; the pool of light then opens until the whole mark stands in its original red.
export const C3: React.FC<Props> = (props) => {
  const s = useStage(props); const { t, T, W, H } = s; const id = `c3${props.aspect}`;
  const p = seg(t, T.a, T.m); const outro = props.mode !== 'intro';
  const sweep = E.inOutSine(seg(p, 0, 0.78));
  const lx = mix(-70, VB.w * 0.62, sweep), ly = 46;
  const open = E.inCubic(seg(p, 0.5, 1));
  const r = mix(70, 900, open);
  const fx = 1 - seg(p, 0.82, 1);                       // beam and sheen leave before the hold
  const cp = E.inOutSine(seg(t, outro ? T.a - 0.15 : 0, T.settle));
  const cam = { scale: mix(0.93, 1, cp), x: mix(-30, 0, cp) * s.k / 2 };
  const sil = outro ? seg(t, T.a - 0.1, T.a + 0.15) : seg(t, 0, Math.max(0.12, T.a * 0.8));
  let plate = null;
  if (outro && T.tr && t < T.tr[1] + 0.05) {
    // the last video frame goes dark as the room's light closes in to one point
    const q = E.inOutCubic(seg(t, T.tr[0], T.tr[1]));
    plate = (
      <AbsoluteFill style={{ opacity: 1 - seg(t, T.tr[1] - 0.12, T.tr[1] + 0.05) }}>
        <Plate s={s} style={{ filter: `brightness(${mix(1, 0.25, q)}) saturate(${mix(1, 0.4, q)})` }} />
        <AbsoluteFill style={{ background: `radial-gradient(circle at 30% 45%, rgba(0,0,0,0) ${mix(120, 0, q)}%, #050405 ${mix(160, 14, q)}%)` }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Bg c="radial-gradient(90% 70% at 50% 48%, #1A0E10 0%, #080506 60%, #030203 100%)" alpha={props.alpha} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`${id}-pool`} gradientUnits="userSpaceOnUse" cx={lx} cy={ly} r={r}>
            <stop offset="0" stopColor="#fff" /><stop offset=".55" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-500" y="-500" width="1500" height="1200"><rect x="-500" y="-500" width="1500" height="1200" fill={`url(#${id}-pool)`} /></mask>
          <linearGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" x1={lx - 22} y1="0" x2={lx + 22} y2="40">
            <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#FFE9E8" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-beam`} gradientUnits="userSpaceOnUse" x1={lx - 160} y1={-260} x2={lx} y2={ly}>
            <stop offset="0" stopColor="#FFD9D6" stopOpacity="0" /><stop offset="1" stopColor="#FFD9D6" stopOpacity=".5" />
          </linearGradient>
          <filter id={`${id}-bl`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
          <radialGradient id={`${id}-haze`}><stop offset="0" stopColor="#7A0A10" stopOpacity=".55" /><stop offset="1" stopColor="#7A0A10" stopOpacity="0" /></radialGradient>
        </defs>
        <Placed s={s} cam={cam}>
          <ellipse cx={VB.w / 2} cy={70} rx={260} ry={110} fill={`url(#${id}-haze)`} opacity={0.5 * open + 0.15 * sweep} />
          <polygon points={`${lx - 230},-320 ${lx - 90},-320 ${lx + 46},${ly + 30} ${lx - 46},${ly + 30}`} fill={`url(#${id}-beam)`} filter={`url(#${id}-bl)`} opacity={0.32 * fx * seg(p, 0, 0.12)} style={{ mixBlendMode: 'screen' }} />
          <g opacity={sil}>{MARK.map((k) => <Glyph key={k} k={k} fill="#2B0507" />)}</g>
          <g mask={open < 1 ? `url(#${id}-m)` : undefined}>{MARK.map((k) => <Glyph key={k} k={k} />)}</g>
          {fx > 0 && p > 0 && <g opacity={fx} style={{ mixBlendMode: 'screen' }}>{MARK.map((k) => <Glyph key={k} k={k} fill={`url(#${id}-sheen)`} />)}</g>}
          <Tagline s={s} id={id} sheen="#FFE9E8" />
        </Placed>
      </svg>
      {plate}
    </AbsoluteFill>
  );
};
