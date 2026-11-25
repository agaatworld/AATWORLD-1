import { loadFont as loadLocalFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter Tight, the same files the AAT website uses (400 / 600 / 800)
export const inter = "Inter Tight";
for (const w of ["400", "600", "800"]) {
  loadLocalFont({ family: inter, url: staticFile(`fonts/inter-tight-latin-${w}-normal.woff2`), weight: w });
}

export const arabic = "Jazeera";
loadLocalFont({ family: arabic, url: staticFile("fonts/aljazeera-bold.ttf"), weight: "700" });

// AAT brand: red, deep red, white, black
export const RED = "#D21F26";
export const DEEP = "#7A0A10";
export const INK = "#111114";
export const PAPER = "#FFFFFF";
export const SOFT = "#FBF4F2";

export const FPS = 30;

// scene lengths in frames (total 750 = 25 s); each matches its voice line
export const SCENES = {
  hook: 90,
  intro: 150,
  demo: 174,
  showcase: 96,
  features: 156,
  cta: 84,
};
