// Shared timing for the AAT logo animations. Used by the Remotion components AND by the render script,
// which writes the sound cues for tools/sfx.py from the same numbers (so picture and sound stay in sync).

export const FPS = 30;
export const DUR = { ultra: 0.6, short: 1.2, std: 2.5, ext: 4.5 };
export const ASPECTS = { '16x9': [1920, 1080], '1x1': [1080, 1080], '9x16': [1080, 1920] };
export const CONCEPTS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
export const NAMES = {
  c1: 'The Signature Curve', c2: 'Geometric Assembly', c3: 'Cinematic Red Reveal',
  c4: 'Sculptural AAT', c5: 'Negative Space & Optical Reveal', c6: 'AAT Motion Signature',
};

// a = end of anticipation, m = the mark is fully revealed, tg = tagline reveal window (null = no tagline),
// tr = outro transition window (the video's last frame handing over to the brand).
const INTRO = {
  ultra: { a: 0, m: 0.42, tg: null },
  short: { a: 0, m: 0.78, tg: [0.72, 1.02] },
  std: { a: 0.25, m: 1.6, tg: [1.5, 2.05] },
  ext: { a: 0.9, m: 3.0, tg: [2.9, 3.65] },
};
const OUTRO = {
  ultra: { tr: [0, 0.25], a: 0.15, m: 0.45, tg: null },
  short: { tr: [0, 0.4], a: 0.25, m: 0.82, tg: [0.78, 1.05] },
  std: { tr: [0, 0.75], a: 0.55, m: 1.55, tg: [1.45, 2.0] },
  ext: { tr: [0, 1.25], a: 1.0, m: 2.9, tg: [2.8, 3.5] },
};
export function timeline(mode, dur) {
  const T = mode === 'outro' ? OUTRO[dur] : INTRO[dur];
  return { ...T, tr: T.tr || null, D: DUR[dur], mode, dur, settle: T.tg ? T.tg[1] : T.m + 0.12 };
}

// Sound cues (seconds) per concept. Types are synthesised by tools/sfx.py. 'lock' is the AAT sound signature.
export function cues(concept, mode, dur) {
  const T = timeline(mode, dur), a = T.a, m = T.m, span = m - a, q = [];
  const at = (f) => +(a + span * f).toFixed(3);
  if (T.tr) q.push({ t: T.tr[0] + 0.02, type: concept === 'c3' ? 'air' : 'whoosh', len: Math.max(0.25, T.tr[1] - T.tr[0]), level: 0.8 });
  if (dur === 'ext' && mode === 'intro') q.push({ t: 0.05, type: 'air', len: a + 0.3, level: 0.5 });
  const ultra = dur === 'ultra';
  switch (concept) {
    case 'c1': // light tracing the curves: a tonal sweep that follows the light, one per letter on longer versions
      q.push({ t: at(0), type: 'sweep', len: span * 0.95, f0: 220, f1: 660, level: 0.55 });
      if (!ultra) [0.02, 0.27, 0.52].forEach((f) => q.push({ t: at(f), type: 'whoosh', len: span * 0.42, level: 0.35 }));
      break;
    case 'c2': // pieces fly in and lock: whoosh + three precise clicks (one per letter)
      q.push({ t: at(0), type: 'whoosh', len: span * 0.6, level: 0.7 });
      if (!ultra) [0.62, 0.78, 0.94].forEach((f) => q.push({ t: at(f), type: 'click', level: 0.6 }));
      break;
    case 'c3': // dark room, a light finds the mark: air swell, deep soft impact, shimmer on the sheen
      q.push({ t: at(0), type: 'air', len: span * 0.9, level: 0.7 });
      q.push({ t: at(0.55), type: 'impact', level: 0.55 });
      if (!ultra) q.push({ t: at(0.7), type: 'shimmer', len: span * 0.45, level: 0.35 });
      break;
    case 'c4': // a sculpture turning: low mechanical rotation swell, satin resonance, click as it flattens
      q.push({ t: at(0), type: 'turn', len: span * 0.95, level: 0.6 });
      if (!ultra) q.push({ t: at(0.55), type: 'resonance', len: span * 0.6, level: 0.4 });
      q.push({ t: at(0.96), type: 'click', level: 0.5 });
      break;
    case 'c5': // pulling back out of the A: a descending air rush, soft landing
      q.push({ t: at(0), type: 'rush', len: span * 0.98, level: 0.7 });
      q.push({ t: at(0.92), type: 'impact', level: 0.4 });
      break;
    case 'c6': // kinetic cuts: quick whoosh per shot, rising tone into the lock
      if (!ultra) [0, 0.25, 0.45].forEach((f) => q.push({ t: at(f), type: 'whoosh', len: Math.max(0.12, span * 0.2), level: 0.55 }));
      q.push({ t: at(ultra ? 0 : 0.55), type: 'sweep', len: span * (ultra ? 0.9 : 0.4), f0: 300, f1: 900, level: 0.45 });
      break;
  }
  q.push({ t: +(m - 0.02).toFixed(3), type: 'lock', level: ultra ? 0.8 : 1 });
  if (T.tg) q.push({ t: T.tg[0] + 0.05, type: 'tick', level: 0.35 });
  return q;
}
