import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { getBoundingBox, getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';
import LOGO from './logo.json';
import SPINES from './spines.json';
import { FPS, timeline } from './timeline.js';

// ---------- the original artwork (never redrawn: these are the paths of the supplied AAT logo) ----------
export const RED = LOGO.red;                       // #D21F26, the logo's own red
export const VB = { w: LOGO.viewBox[0], h: LOGO.viewBox[1] };
export type Part = 'a1' | 'a2' | 't' | 'ideas' | 'for' | 'business';
export const MARK: Part[] = ['a1', 'a2', 't'];
export const TAG: Part[] = ['ideas', 'for', 'business'];
export const P = LOGO.paths as Record<Part, string>;
export const BOX = Object.fromEntries((Object.keys(P) as Part[]).map((k) => [k, getBoundingBox(P[k])])) as Record<Part, ReturnType<typeof getBoundingBox>>;
export const TAGBOX = { x1: BOX.ideas.x1, x2: BOX.business.x2, y1: Math.min(BOX.ideas.y1, BOX.for.y1, BOX.business.y1), y2: Math.max(BOX.ideas.y2, BOX.for.y2, BOX.business.y2) };
export const MARKBOX = { x1: BOX.a1.x1, x2: BOX.t.x2, y1: 0, y2: Math.max(BOX.a1.y2, BOX.a2.y2, BOX.t.y2) };

// centre lines of the letters (tools/spines.py), for traced reveals and light paths
type Spine = { d: string; parts: { d: string; len: number }[] };
export const SP = SPINES as Record<'a1' | 'a2' | 't', Spine>;
export const spineLen = (k: 'a1' | 'a2' | 't') => SP[k].parts.reduce((s, p) => s + p.len, 0);
export function spinePoint(k: 'a1' | 'a2' | 't', g: number): { x: number; y: number; tx: number; ty: number } {
  // point + tangent at fraction g of the whole centre line (parts joined in order)
  let L = Math.max(0, Math.min(1, g)) * spineLen(k);
  for (const p of SP[k].parts) {
    const pl = getLength(p.d);
    if (L <= pl + 1e-6) { const pt = getPointAtLength(p.d, Math.min(L, pl)); const tg = getTangentAtLength(p.d, Math.max(0, Math.min(L, pl - 0.01))); return { x: pt!.x as number, y: pt!.y as number, tx: (tg!.x ?? 1) as number, ty: (tg!.y ?? 0) as number }; }
    L -= pl;
  }
  const last = SP[k].parts[SP[k].parts.length - 1].d; const pt = getPointAtLength(last, getLength(last));
  return { x: pt!.x as number, y: pt!.y as number, tx: 1, ty: 0 };
}

// ---------- timing ----------
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t: number, t0: number, t1: number) => (t1 <= t0 ? (t >= t1 ? 1 : 0) : clamp((t - t0) / (t1 - t0)));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const E = {
  outCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  outQuint: (p: number) => 1 - Math.pow(1 - p, 5),
  outExpo: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutSine: (p: number) => -(Math.cos(Math.PI * p) - 1) / 2,
  inOutQuart: (p: number) => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2),
  inCubic: (p: number) => p * p * p,
  outBack: (p: number, s = 0.9) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
};
// log-space zoom (constant-feeling camera speed through large scale changes)
export const zoom = (s0: number, s1: number, p: number) => Math.exp(mix(Math.log(s0), Math.log(s1), p));

export type Props = { concept: string; mode: 'intro' | 'outro' | 'transition'; dur: 'ultra' | 'short' | 'std' | 'ext'; aspect: '16x9' | '1x1' | '9x16'; alpha?: boolean };
export function useStage(props: Props) {
  const f = useCurrentFrame(); const { width: W, height: H } = useVideoConfig();
  const t = f / FPS; const T = timeline(props.mode === 'transition' ? 'outro' : props.mode, props.dur);
  // composition of the logo for each format (recomposed, not cropped): share of the frame width and the optical centre
  const share = props.aspect === '16x9' ? 0.5 : props.aspect === '1x1' ? 0.74 : 0.8;
  const k = (W * share) / VB.w;
  const cy = props.aspect === '9x16' ? H * 0.47 : H * 0.5;
  const x0 = W / 2 - (VB.w * k) / 2, y0 = cy - (VB.h * k) / 2;
  return { t, T, W, H, k, x0, y0, cx: W / 2, cy, tagOn: !!T.tg, f };
}

// the logo group placed in frame; children draw in logo units (0..413 x 0..138)
export function camTransform(s: ReturnType<typeof useStage>, cam: { scale?: number; x?: number; y?: number; rot?: number; ox?: number; oy?: number } = {}) {
  const sc = cam.scale ?? 1, ox = cam.ox ?? VB.w / 2, oy = cam.oy ?? VB.h / 2;
  return `translate(${s.x0 + (cam.x ?? 0)} ${s.y0 + (cam.y ?? 0)}) scale(${s.k}) translate(${ox} ${oy}) rotate(${cam.rot ?? 0}) scale(${sc}) translate(${-ox} ${-oy})`;
}
export const Placed: React.FC<{ s: ReturnType<typeof useStage>; children: React.ReactNode; cam?: { scale?: number; x?: number; y?: number; rot?: number; ox?: number; oy?: number } }> = ({ s, children, cam = {} }) => {
  const sc = cam.scale ?? 1, ox = cam.ox ?? VB.w / 2, oy = cam.oy ?? VB.h / 2;
  return (
    <g transform={`translate(${s.x0 + (cam.x ?? 0)} ${s.y0 + (cam.y ?? 0)}) scale(${s.k}) translate(${ox} ${oy}) rotate(${cam.rot ?? 0}) scale(${sc}) translate(${-ox} ${-oy})`}>
      {children}
    </g>
  );
};
export const Glyph: React.FC<{ k: Part; fill?: string; opacity?: number; style?: React.CSSProperties; mask?: string; filter?: string }> = ({ k, fill = RED, opacity, style, mask, filter }) => (
  <path d={P[k]} fillRule="evenodd" fill={fill} opacity={opacity} style={style} mask={mask} filter={filter} />
);
export const FullLogo: React.FC<{ fill?: string; tag?: boolean }> = ({ fill = RED, tag = true }) => (
  <>{(tag ? [...MARK, ...TAG] : MARK).map((k) => <Glyph key={k} k={k} fill={fill} />)}</>
);

// stand-in for "the last frame of your video" in the outros (swap for the real clip in production)
export const Plate: React.FC<{ s: ReturnType<typeof useStage>; img?: string; style?: React.CSSProperties }> = ({ s, img = 'plate-port.jpg', style }) => {
  const z = 1.06 + s.t * 0.02;                       // the video is still moving when the outro begins
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <Img src={staticFile(img)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})` }} />
    </AbsoluteFill>
  );
};
export const Bg: React.FC<{ c: string; alpha?: boolean }> = ({ c, alpha }) => (alpha ? null : <AbsoluteFill style={{ background: c }} />);
export const INK = '#0B0A0C', CHAR = 'radial-gradient(120% 90% at 50% 45%, #241A1C 0%, #120D0F 55%, #070607 100%)';
export const LIGHT = 'radial-gradient(130% 100% at 50% 40%, #FFFFFF 0%, #F7F3F0 60%, #EEE7E2 100%)';

// tagline: refined horizontal reveal under a soft mask, then one light sweep across it
export const Tagline: React.FC<{ s: ReturnType<typeof useStage>; fill?: string; sheen?: string; id: string }> = ({ s, fill = RED, sheen = '#FFFFFF', id }) => {
  if (!s.T.tg) return null;
  const [a, b] = s.T.tg as number[]; const p = E.outCubic(seg(s.t, a, b));
  const x1 = TAGBOX.x1 - 6, x2 = TAGBOX.x2 + 6, w = x2 - x1;
  const edge = mix(x1 - 14, x2 + 14, p);
  const sw = seg(s.t, b - 0.05, b + 0.5);              // sheen after the reveal
  const sx = mix(x1 - 40, x2 + 40, E.inOutSine(sw));
  const lift = mix(3, 0, p);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-tg`} gradientUnits="userSpaceOnUse" x1={edge - 14} x2={edge} y1="0" y2="0">
          <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}-tgm`} maskUnits="userSpaceOnUse" x={x1 - 20} y={TAGBOX.y1 - 10} width={w + 60} height={40}>
          <rect x={x1 - 20} y={TAGBOX.y1 - 10} width={w + 60} height={40} fill={`url(#${id}-tg)`} />
        </mask>
        <linearGradient id={`${id}-sh`} gradientUnits="userSpaceOnUse" x1={sx - 18} x2={sx + 18} y1="0" y2="0">
          <stop offset="0" stopColor={sheen} stopOpacity="0" /><stop offset=".5" stopColor={sheen} stopOpacity=".75" /><stop offset="1" stopColor={sheen} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g mask={p < 1 ? `url(#${id}-tgm)` : undefined} transform={`translate(0 ${lift})`}>
        {TAG.map((k) => <Glyph key={k} k={k} fill={fill} />)}
      </g>
      {sw > 0 && sw < 1 && <g>{TAG.map((k) => <path key={k} d={P[k]} fillRule="evenodd" fill={`url(#${id}-sh)`} />)}</g>}
    </g>
  );
};
