import React from "react";
import { Composition, Folder } from "remotion";
import { AatPromo } from "./AatPromo";
import { Cta } from "./scenes/Cta";
import { Demo } from "./scenes/Demo";
import { Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Showcase } from "./scenes/Showcase";

const V = { width: 1080, height: 1920, fps: 30 };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AatPromo" component={AatPromo} durationInFrames={750} {...V} />
    <Folder name="AatPromo-Scenes">
      <Composition id="Hook" component={Hook} durationInFrames={90} {...V} />
      <Composition id="Intro" component={Intro} durationInFrames={150} {...V} />
      <Composition id="Demo" component={Demo} durationInFrames={174} {...V} />
      <Composition id="Showcase" component={Showcase} durationInFrames={96} {...V} />
      <Composition id="Features" component={Features} durationInFrames={156} {...V} />
      <Composition id="CTA" component={Cta} durationInFrames={84} {...V} />
    </Folder>
  </>
);
