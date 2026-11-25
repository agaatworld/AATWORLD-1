import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { BOX, Bg, E, LIGHT, MARK, P, Props, RED, TAG, VB, mix, seg, useStage } from './lib';

// CONCEPT 02 — GEOMETRIC ASSEMBLY
// Each letter of the real artwork is cut into horizontal bands. The bands arrive through depth, staggered
// letter by letter, and lock into their exact original positions; a soft floor shadow grows as the mark lands.
const N = 5, GAP = 0.16, BAND = 0.05, LEN = 0.55, TOTAL = 2 * GAP + (N - 1) * BAND + LEN;

const Piece: React.FC<{ k: string; d: string; y0: number; y1: number; w: number; h: number; tf: string; o: number }> = ({ k, d, y0, y1, w, h, tf, o }) => (
  <div style={{ position: 'absolute', inset: 0, transform: tf, opacity: o, willChange: 'transform' }}>
    <svg width={w} height={h} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs><clipPath id={k}><rect x={-10} y={y0} width={VB.w + 20} height={y1 - y0} /></clipPath></defs>
      <path d={d} fillRule="evenodd" fill={RED} clipPath={`url(#${k})`} />
    </svg>
  </div>
);

export const C2: React.FC<Props> = (props) => {
  const s = useStage(props); const { t, T, W, H, k } = s; const id = `c2${props.aspect}`;
  const p = seg(t, T.a, T.m); const outro = props.mode !== 'intro';
  const w = VB.w * k, h = VB.h * k;
  const cp = E.inOutCubic(seg(t, outro ? T.a - 0.1 : 0, T.settle));
  const camRy = mix(props.aspect === '9x16' ? -8 : -12, 0, cp), camS = mix(1.12, 1, cp);
  const pieces: React.ReactNode[] = [];
  MARK.forEach((g, gi) => {
    const b = BOX[g as keyof typeof BOX]; const bh = (b.y2 - b.y1) / N;
    for (let i = 0; i < N; i++) {
      const st = (gi * GAP + i * BAND) / TOTAL, q = seg(p, st, st + LEN / TOTAL);
      if (q <= 0) continue;
      const m = E.outBack(q, 0.55), dir = (i + gi) % 2 ? 1 : -1;
      const dx = mix(dir * (160 + 50 * i) * k, 0, m), dy = mix((i - N / 2) * 10 * k, 0, m), dz = mix(380 + 60 * gi, 0, E.outQuint(q));
      const ry = mix(dir * 38, 0, E.outQuint(q)), rx = mix(-24, 0, E.outQuint(q));
      const tf = q >= 1 ? 'none' : `translate3d(${dx}px, ${dy}px, ${dz}px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      pieces.push(<Piece key={`${g}${i}`} k={`${id}-${g}-${i}`} d={P[g]} y0={b.y1 + i * bh - 0.25} y1={b.y1 + (i + 1) * bh + 0.25} w={w} h={h} tf={tf} o={seg(q, 0, 0.22)} />);
    }
  });
  // tagline: the three words rise into place from behind a baseline, one after another
  let tag = null;
  if (T.tg) {
    const [a, b] = T.tg as number[];
    tag = (
      <svg width={w} height={h} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs><clipPath id={`${id}-tc`}><rect x={0} y={0} width={VB.w} height={VB.h + 0.5} /></clipPath></defs>
        <g clipPath={`url(#${id}-tc)`}>
          {TAG.map((g, i) => { const q = E.outCubic(seg(t, a + i * 0.08, b - (2 - i) * 0.04)); return <path key={g} d={P[g]} fillRule="evenodd" fill={RED} transform={`translate(0 ${mix(20, 0, q)})`} opacity={q > 0 ? 1 : 0} />; })}
        </g>
      </svg>
    );
  }
  // outro: the last video frame is cut into the same bands, which slide away alternately
  let plate = null;
  if (outro && T.tr && t < T.tr[1]) {
    const bands = 7;
    plate = (
      <AbsoluteFill>
        {Array.from({ length: bands }, (_, i) => {
          const q = E.inOutQuart(seg(t, T.tr![0] + i * 0.04, T.tr![1] - (bands - 1 - i) * 0.03)); const dir = i % 2 ? 1 : -1;
          return (
            <div key={i} style={{ position: 'absolute', left: 0, width: W, top: (H * i) / bands, height: H / bands + 1, overflow: 'hidden', transform: `translateX(${dir * q * W * 1.05}px)` }}>
              <Img src={staticFile('plate-factory.jpg')} style={{ position: 'absolute', left: 0, top: (-H * i) / bands, width: W, height: H, objectFit: 'cover', transform: `scale(${1.06 + t * 0.02})` }} />
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const shadow = E.outCubic(seg(p, 0.45, 1));
  return (
    <AbsoluteFill>
      <Bg c={LIGHT} alpha={props.alpha} />
      <AbsoluteFill style={{ perspective: 1600 * k / 2.3, perspectiveOrigin: `50% ${(s.cy / H) * 100}%` }}>
        <div style={{ position: 'absolute', left: s.x0, top: s.y0, width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateY(${camRy}deg) scale(${camS})` }}>
          {!props.alpha && <div style={{ position: 'absolute', left: w * 0.04, right: w * 0.04, top: h * 0.92, height: h * 0.16, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(60,20,22,.22), rgba(60,20,22,0))', opacity: shadow * 0.8, filter: `blur(${4 * k}px)` }} />}
          {pieces}
          {tag}
        </div>
      </AbsoluteFill>
      {plate}
    </AbsoluteFill>
  );
};
