import React from 'react';
import { Composition } from 'remotion';
import { ASPECTS, CONCEPTS, DUR, FPS } from './timeline.js';
import { Props } from './lib';
import { C1 } from './c1';
import { C2 } from './c2';
import { C3 } from './c3';
import { C4 } from './c4';
import { C5 } from './c5';
import { C6 } from './c6';

const MAP: Record<string, React.FC<Props>> = { c1: C1, c2: C2, c3: C3, c4: C4, c5: C5, c6: C6 };
// id: <concept>-<mode>-<dur>-<aspect>[-alpha], e.g. c1-intro-std-16x9
export const Root: React.FC = () => (
  <>
    {CONCEPTS.filter((c) => MAP[c]).flatMap((c) => (['intro', 'outro'] as const).flatMap((mode) => (Object.keys(DUR) as (keyof typeof DUR)[]).flatMap((dur) => (Object.keys(ASPECTS) as (keyof typeof ASPECTS)[]).flatMap((aspect) => {
      const [w, h] = ASPECTS[aspect]; const base = { concept: c, mode, dur, aspect };
      return [false, true].map((alpha) => (
        <Composition key={`${c}-${mode}-${dur}-${aspect}${alpha ? '-alpha' : ''}`} id={`${c}-${mode}-${dur}-${aspect}${alpha ? '-alpha' : ''}`}
          component={MAP[c]} durationInFrames={Math.round(DUR[dur] * FPS)} fps={FPS} width={w} height={h} defaultProps={{ ...base, alpha } as Props} />
      ));
    }))))}
    {(Object.keys(ASPECTS) as (keyof typeof ASPECTS)[]).map((aspect) => (
      <Composition key={`c6-transition-${aspect}`} id={`c6-transition-short-${aspect}`} component={C6} durationInFrames={Math.round(DUR.short * FPS)} fps={FPS}
        width={ASPECTS[aspect][0]} height={ASPECTS[aspect][1]} defaultProps={{ concept: 'c6', mode: 'transition', dur: 'short', aspect } as Props} />
    ))}
  </>
);
