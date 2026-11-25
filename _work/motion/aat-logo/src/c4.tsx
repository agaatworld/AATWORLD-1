import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Bg, CHAR, E, MARK, P, Placed, Props, RED, Tagline, VB, mix, seg, useStage } from './lib';

// CONCEPT 04 — SCULPTURAL AAT
// The mark as an object: the real letterforms given satin-red depth (one material only), turning slowly to face
// the viewer under a soft key light. As it squares up, the depth folds away into the original flat red artwork.
const DEPTH = 18;
const shade = (i: number) => { const f = i / DEPTH; const c = (a: number, b: number) => Math.round(mix(a, b, f)); return `rgb(${c(150, 58)},${c(16, 6)},${c(22, 9)})`; };

const Layer: React.FC<{ w: number; h: number; fill: string; tf: string; extra?: React.ReactNode }> = ({ w, h, fill, tf, extra }) => (
  <div style={{ position: 'absolute', inset: 0, transform: tf }}>
    <svg width={w} height={h} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {extra}
      {MARK.map((k) => <path key={k} d={P[k]} fillRule="evenodd" fill={fill} />)}
    </svg>
  </div>
);

export const C4: React.FC<Props> = (props) => {
  const s = useStage(props); const { t, T, W, H, k } = s; const id = `c4${props.aspect}`;
  const p = seg(t, T.a, T.m); const outro = props.mode !== 'intro';
  const w = VB.w * k, h = VB.h * k;
  const turn = E.inOutCubic(seg(p, 0, 0.82));
  const ry = mix(-44, 0, turn), rx = mix(16, 0, turn), sc = mix(0.8, 1, E.outCubic(seg(p, 0, 0.9)));
  const dz = mix(1.15 * k, 0, E.inOutCubic(seg(p, 0.7, 1)));          // the depth folds away at the end
  const fade = seg(p, 0, 0.2);
  const sheenX = mix(-80, VB.w + 80, E.inOutSine(seg(p, 0.15, 0.85)));
  const layers: React.ReactNode[] = [];
  if (dz > 0.01) for (let i = DEPTH; i >= 1; i--) layers.push(<Layer key={i} w={w} h={h} fill={shade(i)} tf={`translateZ(${-i * dz}px)`} />);
  const front = (
    <Layer w={w} h={h} fill={RED} tf="none" />
  );
  const sheen = p > 0 && p < 1 ? (
    <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(0.5px)', mixBlendMode: 'screen', opacity: 0.55 * (1 - seg(p, 0.8, 1)) }}>
      <svg width={w} height={h} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs><linearGradient id={`${id}-sh`} gradientUnits="userSpaceOnUse" x1={sheenX - 40} y1="0" x2={sheenX + 40} y2="60">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#FFD2CF" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        {MARK.map((g) => <path key={g} d={P[g]} fillRule="evenodd" fill={`url(#${id}-sh)`} />)}
      </svg>
    </div>
  ) : null;
  // outro: the last video frame is a flat card that swings away on its left edge as the sculpture turns in
  let card = null;
  if (outro && T.tr && t < T.tr[1]) {
    const q = E.inOutCubic(seg(t, T.tr[0], T.tr[1]));
    card = (
      <AbsoluteFill style={{ perspective: W * 1.2 }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '0% 50%', transform: `rotateY(${mix(0, -96, q)}deg)`, boxShadow: '0 40px 80px rgba(0,0,0,.6)', overflow: 'hidden' }}>
          <Img src={staticFile('plate-factory.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${mix(1, 0.55, q)})` }} />
        </div>
      </AbsoluteFill>
    );
  }
  const floor = E.outCubic(seg(p, 0.1, 1));
  return (
    <AbsoluteFill>
      <Bg c={CHAR} alpha={props.alpha} />
      {!props.alpha && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(255,235,232,.035) 72%, rgba(0,0,0,0) 100%)' }} />}
      <AbsoluteFill style={{ perspective: 1500 * k / 2.3, perspectiveOrigin: `50% ${(s.cy / H) * 100 - 6}%` }}>
        {!props.alpha && <div style={{ position: 'absolute', left: s.x0 + w * 0.08, width: w * 0.84, top: s.y0 + h * 0.98, height: h * 0.2, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,.75), rgba(0,0,0,0))', opacity: floor, filter: `blur(${5 * k}px)` }} />}
        <div style={{ position: 'absolute', left: s.x0, top: s.y0, width: w, height: h, transformStyle: 'preserve-3d', opacity: fade,
          transform: p >= 1 ? 'none' : `scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
          {layers}{front}{sheen}
        </div>
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><Placed s={s}><Tagline s={s} id={id} sheen="#FFD2CF" /></Placed></svg>
      {card}
    </AbsoluteFill>
  );
};
