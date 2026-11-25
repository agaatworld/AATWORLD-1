import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { getLength } from '@remotion/paths';
import { Bg, CHAR, E, Glyph, MARK, Placed, Props, RED, SP, Tagline, VB, mix, seg, spinePoint, useStage } from './lib';

// CONCEPT 01 — THE SIGNATURE CURVE
// One light travels the logo's own centre lines: the curl and swash of the first A, then the second A, then the T.
// Behind the light the original red letterforms appear (a soft brush following the same line), then the tagline.
const ORDER: ['a1' | 'a2' | 't', number, number][] = [['a1', 0, 0.58], ['a2', 0.24, 0.8], ['t', 0.48, 1]];

export const LightHead: React.FC<{ x: number; y: number; r: number; o?: number; id: string }> = ({ x, y, r, o = 1, id }) => (
  <g opacity={o}>
    <defs>
      <radialGradient id={id}><stop offset="0" stopColor="#FFF4F2" stopOpacity="1" /><stop offset=".18" stopColor="#FF8E92" stopOpacity=".85" /><stop offset=".5" stopColor={RED} stopOpacity=".28" /><stop offset="1" stopColor={RED} stopOpacity="0" /></radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id})`} style={{ mixBlendMode: 'screen' }} />
    <circle cx={x} cy={y} r={r * 0.12} fill="#FFFFFF" />
  </g>
);

// draws the centre line up to fraction g (each part dashed on its own, so later strokes do not start early)
export const TraceParts: React.FC<{ k: 'a1' | 'a2' | 't'; g: number; stroke: string; width: number; tail?: number; opacity?: number; filter?: string }> = ({ k, g, stroke, width, tail, opacity, filter }) => {
  let rest = g * SP[k].parts.reduce((a, p) => a + p.len, 0);
  return (
    <g opacity={opacity} filter={filter}>
      {SP[k].parts.map((pt, i) => {
        const L = getLength(pt.d); const vis = Math.max(0, Math.min(L, rest * (L / pt.len))); rest -= pt.len;
        if (vis <= 0) return null;
        const da = tail ? `0 ${Math.max(0, vis - tail)} ${Math.min(tail, vis)} ${L * 2}` : `${vis} ${L * 2}`;
        return <path key={i} d={pt.d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={da} />;
      })}
    </g>
  );
};

export const C1: React.FC<Props> = (props) => {
  const s = useStage(props); const { t, T, W, H } = s; const id = `c1${props.aspect}`;
  const p = seg(t, T.a, T.m);
  const outro = props.mode !== 'intro';
  // camera: a slow push that lands exactly on the final composition
  const cp = E.inOutCubic(seg(t, outro ? T.a - 0.2 : 0, T.settle));
  const cam = { scale: mix(1.1, 1, cp), x: mix(26, 0, cp) * s.k / 2 };
  // outro: the signature swash itself, scaled to the frame, wipes the last video frame away
  let wipe = null;
  if (outro && T.tr) {
    const wp = E.inOutQuart(seg(t, T.tr[0], T.tr[1]));
    const d = SP.a1.parts[0].d; const L = getLength(d);
    const M = Math.max(W, H); const sc = (M * 1.45) / 170; const tx = W / 2 - 87 * sc, ty = H / 2 - 65 * sc;
    const sw = (M * 0.62) / sc;
    const head = spinePoint('a1', Math.min(1, wp) * (SP.a1.parts[0].len / (SP.a1.parts[0].len + SP.a1.parts[1].len)));
    wipe = wp < 1 ? (
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <mask id={`${id}-w`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill="#fff" />
            <path d={d} transform={`translate(${tx} ${ty}) scale(${sc})`} fill="none" stroke="#000" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${wp * L} ${L * 2}`} />
          </mask>
        </defs>
        <image href={staticFile('plate-port.jpg')} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" mask={`url(#${id}-w)`} opacity={1 - seg(wp, 0.75, 1)} transform={`translate(${W / 2} ${H / 2}) scale(${1.06 + t * 0.02}) translate(${-W / 2} ${-H / 2})`} />
        {wp > 0.02 && <g transform={`translate(${tx} ${ty}) scale(${sc})`}><LightHead x={head.x} y={head.y} r={(M * 0.09) / sc} id={`${id}-wl`} /></g>}
      </svg>
    ) : null;
  }
  // anticipation (longer intros): the light arrives from the left edge and comes to rest at the tip of the curl
  const start = spinePoint('a1', 0);
  const ant = !outro && T.a > 0 ? E.inOutSine(seg(t, 0.08, T.a)) : 1;
  return (
    <AbsoluteFill>
      <Bg c={CHAR} alpha={props.alpha} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <Placed s={s} cam={cam}>
          {ORDER.map(([k, g0, g1]) => {
            const g = E.inOutSine(seg(p, g0, g1));
            if (g <= 0) return null;
            if (g >= 1) return <Glyph key={k} k={k} />;
            const hp = spinePoint(k, g);
            return (
              <g key={k}>
                <defs>
                  <filter id={`${id}-${k}-b`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6" /></filter>
                  <mask id={`${id}-${k}-m`} maskUnits="userSpaceOnUse" x="-20" y="-20" width={VB.w + 40} height={VB.h + 40}>
                    <TraceParts k={k} g={g} stroke="#fff" width={34} filter={`url(#${id}-${k}-b)`} />
                  </mask>
                </defs>
                <Glyph k={k} mask={`url(#${id}-${k}-m)`} />
                <TraceParts k={k} g={g} stroke="#FFD9D6" width={0.9} tail={26} opacity={0.85} />
                <LightHead x={hp.x} y={hp.y} r={16} id={`${id}-${k}-h`} />
              </g>
            );
          })}
          {/* settle bloom: one soft breath of light over the whole mark as it locks */}
          {(() => { const b = seg(t, T.m - 0.05, T.m + 0.35); return b > 0 && b < 1 ? <g opacity={Math.sin(b * Math.PI) * 0.18} style={{ mixBlendMode: 'screen' }}>{MARK.map((k) => <Glyph key={k} k={k} fill="#FF8F93" />)}</g> : null; })()}
          {!outro && T.a > 0 && t < T.a + 0.05 && (
            <LightHead x={mix(start.x - 260, start.x, ant)} y={mix(start.y + 40, start.y, E.outCubic(ant))} r={mix(6, 16, ant)} o={seg(t, 0.02, 0.2)} id={`${id}-ant`} />
          )}
          <Tagline s={s} id={id} sheen="#FFE3E1" />
        </Placed>
      </svg>
      {wipe}
    </AbsoluteFill>
  );
};
