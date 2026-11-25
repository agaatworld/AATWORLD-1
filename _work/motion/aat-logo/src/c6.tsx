import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { getLength } from '@remotion/paths';
import { Bg, E, FullLogo, Glyph, MARK, Placed, Props, RED, SP, Tagline, VB, mix, seg, spinePoint, useStage, zoom } from './lib';

// CONCEPT 06 — AAT MOTION SIGNATURE
// A contemporary, kinetic system built from the logo itself.
// Longer versions: three hard-cut close-ups travel along the real forms (the swash of the first A on red,
// the bar of the T on white, the apex of the second A on red), then one decisive pull-back locks the mark.
// Short versions and outros: the swash of the first A, scaled to the frame, sweeps across as a red wipe and
// hands over to the mark. The same sweep is the AAT transition element (see the 'transition' compositions).

// the giant swash used as a wipe: A1's curl + swash centre line fitted to the frame
export const Sweep: React.FC<{ W: number; H: number; g0: number; g1: number; color: string; id: string; flip?: boolean }> = ({ W, H, g0, g1, color, flip }) => {
  if (g1 <= g0) return null;
  const d = SP.a1.parts[0].d; const L = getLength(d);
  const M = Math.max(W, H); const sc = (M * 1.45) / 170; const tx = W / 2 - 87 * sc, ty = H / 2 - 65 * sc;
  const sw = (M * 0.95) / sc;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <g transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <path d={d} transform={`translate(${tx} ${ty}) scale(${sc})`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`0 ${g0 * L} ${(g1 - g0) * L} ${L * 3}`} />
      </g>
    </svg>
  );
};

const Shot: React.FC<{ s: ReturnType<typeof useStage>; bg: string; fg: string; cam: object; alpha?: boolean }> = ({ s, bg, fg, cam, alpha }) => (
  <AbsoluteFill>
    {!alpha && <AbsoluteFill style={{ background: bg }} />}
    <svg width={s.W} height={s.H} style={{ position: 'absolute', inset: 0 }}><Placed s={s} cam={cam}><FullLogo fill={fg} tag={false} /></Placed></svg>
  </AbsoluteFill>
);

export const C6: React.FC<Props> = (props) => {
  const s = useStage(props); const { t, T, W, H } = s; const id = `c6${props.aspect}`;
  const p = seg(t, T.a, T.m);
  const WHITE = '#FFFFFF';
  // ---- transition element: plate A -> red sweep -> the mark flashes white on red -> sweep uncovers plate B
  if (props.mode === 'transition') {
    const D = T.D; const q1 = E.inOutQuart(seg(t, 0, D * 0.38)), q2 = E.inOutQuart(seg(t, D * 0.55, D * 0.95));
    const mk = seg(t, D * 0.25, D * 0.4) * (1 - seg(t, D * 0.55, D * 0.68));
    return (
      <AbsoluteFill>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><image href={staticFile(t < D * 0.47 ? 'plate-port.jpg' : 'plate-factory.jpg')} width={W} height={H} preserveAspectRatio="xMidYMid slice" /></svg>
        <Sweep W={W} H={H} g0={q2} g1={q1} color={RED} id={id} />
        {mk > 0 && <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><Placed s={s} cam={{ scale: mix(0.62, 0.7, seg(t, D * 0.25, D * 0.68)) }}><g opacity={mk}><FullLogo fill={WHITE} tag={false} /></g></Placed></svg>}
      </AbsoluteFill>
    );
  }
  const kinetic = props.mode === 'intro' && (props.dur === 'std' || props.dur === 'ext');
  if (kinetic) {
    // three close-ups that travel along the real forms, then the pull-back
    const s1 = seg(p, 0, 0.25), s2 = seg(p, 0.25, 0.45), s3 = seg(p, 0.45, 0.6), s4 = seg(p, 0.6, 1);
    const travel = (k: 'a1' | 'a2' | 't', g0: number, g1: number, q: number, z: number, red: boolean) => {
      const pt = spinePoint(k, mix(g0, g1, E.inOutSine(q)));
      const fx = s.x0 + pt.x * s.k, fy = s.y0 + pt.y * s.k;
      return <Shot s={s} bg={red ? RED : WHITE} fg={red ? WHITE : RED} alpha={props.alpha} cam={{ scale: z * mix(1.08, 1, q), ox: pt.x, oy: pt.y, x: s.cx - fx, y: s.cy - fy }} />;
    };
    if (t < T.a) return <AbsoluteFill>{!props.alpha && <AbsoluteFill style={{ background: RED }} />}</AbsoluteFill>;
    if (p < 0.25) return travel('a1', 0.02, 0.5, s1, 7, true);
    if (p < 0.45) {
      const x = mix(305, 405, E.inOutSine(s2)); const fx = s.x0 + x * s.k, fy = s.y0 + 10 * s.k;
      return <Shot s={s} bg={WHITE} fg={RED} alpha={props.alpha} cam={{ scale: 6.2, ox: x, oy: 10, x: s.cx - fx, y: s.cy - fy }} />;
    }
    if (p < 0.6) return travel('a2', 0.62, 0.9, s3, 5.5, true);
    const z = zoom(3.4, 1, E.outExpo(s4));
    return (
      <AbsoluteFill>
        <Bg c={WHITE} alpha={props.alpha} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <Placed s={s} cam={{ scale: s4 >= 1 ? 1 : z }}>
            <FullLogo tag={false} />
            <Tagline s={s} id={id} sheen="#FFD2CF" />
          </Placed>
        </svg>
      </AbsoluteFill>
    );
  }
  // ---- short versions and outros: red sweep in, white sweep out, the mark lands with a crisp settle
  const outro = props.mode === 'outro';
  const inA = outro ? T.tr![0] : T.a, inB = outro ? T.tr![1] : T.a + (T.m - T.a) * 0.45;
  const q1 = E.inOutQuart(seg(t, inA, inB));                                  // red sweep covers
  const q2 = E.inOutQuart(seg(t, inB - (inB - inA) * 0.1, T.m));               // the sweep's tail clears it
  const land = E.outBack(seg(t, inB - (inB - inA) * 0.3, T.m), 0.6);
  return (
    <AbsoluteFill>
      <Bg c={WHITE} alpha={props.alpha} />
      {outro && t < inB + 0.02 && <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}><image href={staticFile('plate-factory.jpg')} width={W} height={H} preserveAspectRatio="xMidYMid slice" transform={`translate(${W / 2} ${H / 2}) scale(${1.06 + t * 0.02}) translate(${-W / 2} ${-H / 2})`} /></svg>}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <Placed s={s} cam={{ scale: land >= 1 ? 1 : mix(1.18, 1, land) }}>
          <g opacity={seg(land, 0, 0.15)}>{MARK.map((g) => <Glyph key={g} k={g} />)}</g>
          <Tagline s={s} id={id} sheen="#FFD2CF" />
        </Placed>
      </svg>
      <Sweep W={W} H={H} g0={q2} g1={q1} color={RED} id={id} />
      {VB.w < 0 && null}
    </AbsoluteFill>
  );
};
