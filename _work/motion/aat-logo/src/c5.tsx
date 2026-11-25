import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Bg, E, Glyph, LIGHT, MARK, P, Placed, Props, RED, TAGBOX, TAG, camTransform, mix, seg, useStage, zoom } from './lib';

// CONCEPT 05 — NEGATIVE SPACE & OPTICAL REVEAL
// We begin deep inside the first A: its triangular counter and crossbar fill the frame as pure abstract shapes.
// The camera pulls straight out, and the shapes resolve into the mark. The tagline is revealed by a red bar
// that slides across and retracts (a geometric wipe the height of the tagline).
// Outro: the last video frame is seen through the letterforms themselves as the camera pulls back, then the
// letters fill with the original red.
const F_IN = { x: 162, y: 64, z: 24 };          // inside A1: tip of the counter over the crossbar
const F_OUT = { x: 190, y: 92, z: 60 };         // inside the right leg of A1 (frame entirely inside the letter)

export const C5: React.FC<Props> = (props) => {
  const s = useStage(props); const { t, T, W, H, k } = s; const id = `c5${props.aspect}`;
  const outro = props.mode !== 'intro';
  const F = outro ? F_OUT : F_IN;
  const z0 = props.dur === 'ultra' ? F.z * 0.5 : F.z;
  const zp = outro ? E.inOutQuart(seg(t, 0, T.m)) : E.inOutQuart(seg(t, T.a, T.m));
  const sc = zoom(z0, 1, zp);
  const fx = s.x0 + F.x * k, fy = s.y0 + F.y * k;
  const cam = { scale: sc, ox: F.x, oy: F.y, x: mix(s.cx - fx, 0, E.inOutCubic(zp)), y: mix(s.cy - fy, 0, E.inOutCubic(zp)) };
  const fill = outro ? seg(t, T.m - 0.18, T.m + 0.02) : 1;  // outro: video inside the letters, then the red returns
  // tagline: geometric bar wipe
  let tag = null;
  if (T.tg) {
    const [a, b] = T.tg as number[]; const mid = (a + b) / 2;
    const grow = E.inOutCubic(seg(t, a, mid)), shrink = E.inOutCubic(seg(t, mid, b));
    const x1 = TAGBOX.x1 - 2, x2 = TAGBOX.x2 + 2, y1 = TAGBOX.y1 - 1.5, y2 = TAGBOX.y2 + 1.5;
    const bl = mix(x1, x2, shrink), br = mix(x1, x2, grow);
    tag = (
      <g>
        {t >= mid && TAG.map((g) => <Glyph key={g} k={g} />)}
        {br > bl + 0.1 && <rect x={bl} y={y1} width={br - bl} height={y2 - y1} fill={RED} />}
      </g>
    );
  }
  return (
    <AbsoluteFill>
      <Bg c={LIGHT} alpha={props.alpha} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id={`${id}-clip`}>{MARK.map((g) => <path key={g} d={P[g]} fillRule="evenodd" clipRule="evenodd" transform={camTransform(s, cam)} />)}</clipPath>
        </defs>
        {outro && fill < 1 && (
          <g clipPath={`url(#${id}-clip)`}><image href={staticFile('plate-port.jpg')} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice"
            transform={`translate(${W / 2} ${H / 2}) scale(${1.06 + t * 0.02}) translate(${-W / 2} ${-H / 2})`} /></g>
        )}
        <Placed s={s} cam={cam}>
          <g opacity={fill}>{MARK.map((g) => <Glyph key={g} k={g} />)}</g>
          {tag}
        </Placed>
      </svg>
    </AbsoluteFill>
  );
};
