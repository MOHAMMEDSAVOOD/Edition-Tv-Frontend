/**
 * The sizes the share poster is drawn at, and where the design sits in each.
 *
 * <p>Instagram's feed never displays taller than 4:5 — a 2:3 poster is cropped on upload, which
 * takes the top of the frame and the bottom of the headline with it. So 4:5 is the size to post at
 * and 2:3 remains the print/story poster.
 *
 * <p>The 4:5 numbers are the 2:3 numbers scaled by the width ratio (1080/1024), which is how the
 * frame artwork itself is rebuilt in scripts/build-poster-frames.mjs: both ink bands scale
 * uniformly and only the featureless middle changes length. Anything measured from an edge scales;
 * anything measured as a share of the height is recomputed against the new height.
 */

export type PosterFormatId = "2:3" | "4:5";

export interface PosterFormat {
  id: PosterFormatId;
  /** Short label for the format switch. */
  label: string;
  /** What it is for, in the newsroom's terms. */
  description: string;
  width: number;
  height: number;
  /** Transparent frame overlay, served by the consuming app (same origin, or the export breaks). */
  frameSrc: string;
  /** True when a post at this size is shown whole in the Instagram feed. */
  instagramSafe: boolean;
  ribbon: {
    top: number;
    right: number;
    width: number;
    height: number;
    fontSize: number;
  };
  content: { bottom: number; left: number; right: number };
  qr: { right: number; bottom: number; box: number; size: number };
  /** Crimson glow across the top, and the readability gradient behind the headline. */
  topGlowHeight: number;
  bottomGradientHeight: number;
  /** Headline sizing steps, longest headline last. */
  headlineFontSizes: [number, number, number];
  standfirstFontSize: number;
}

const TWO_BY_THREE: PosterFormat = {
  id: "2:3",
  label: "2:3 poster",
  description:
    "1024 × 1536 — print and stories. Instagram crops this in the feed.",
  width: 1024,
  height: 1536,
  frameSrc: "/posters/share-poster.png",
  instagramSafe: false,
  ribbon: { top: 40, right: 60, width: 320, height: 64, fontSize: 48 },
  content: { bottom: 245, left: 155, right: 155 },
  qr: { right: 80, bottom: 65, box: 148, size: 138 },
  topGlowHeight: 320,
  bottomGradientHeight: 960,
  headlineFontSizes: [54, 46, 38],
  standfirstFontSize: 25,
};

/** 1080/1024: every edge measurement in the 2:3 design, at the wider canvas. */
const SCALE = 1080 / 1024;
const s = (value: number) => Math.round(value * SCALE);

const FOUR_BY_FIVE: PosterFormat = {
  id: "4:5",
  label: "4:5 feed",
  description:
    "1080 × 1350 — the tallest Instagram shows whole. Nothing is cropped.",
  width: 1080,
  height: 1350,
  frameSrc: "/posters/share-poster-4x5.png",
  instagramSafe: true,
  ribbon: {
    top: s(TWO_BY_THREE.ribbon.top),
    right: s(TWO_BY_THREE.ribbon.right),
    width: s(TWO_BY_THREE.ribbon.width),
    height: s(TWO_BY_THREE.ribbon.height),
    fontSize: s(TWO_BY_THREE.ribbon.fontSize),
  },
  content: {
    bottom: s(TWO_BY_THREE.content.bottom),
    left: s(TWO_BY_THREE.content.left),
    right: s(TWO_BY_THREE.content.right),
  },
  qr: {
    right: s(TWO_BY_THREE.qr.right),
    bottom: s(TWO_BY_THREE.qr.bottom),
    box: s(TWO_BY_THREE.qr.box),
    size: s(TWO_BY_THREE.qr.size),
  },
  topGlowHeight: s(TWO_BY_THREE.topGlowHeight),
  // A share of the height rather than an edge measurement: the gradient has to reach the same way
  // up a shorter poster, or the headline loses its backing.
  bottomGradientHeight: Math.round(
    (TWO_BY_THREE.bottomGradientHeight / TWO_BY_THREE.height) * 1350,
  ),
  headlineFontSizes: [s(54), s(46), s(38)],
  standfirstFontSize: s(25),
};

export const POSTER_FORMATS: Record<PosterFormatId, PosterFormat> = {
  "2:3": TWO_BY_THREE,
  "4:5": FOUR_BY_FIVE,
};

/** What the composer opens on: the size Instagram keeps whole. */
export const DEFAULT_POSTER_FORMAT: PosterFormatId = "4:5";

export const posterFormat = (id: PosterFormatId | undefined): PosterFormat =>
  POSTER_FORMATS[id ?? DEFAULT_POSTER_FORMAT] ??
  POSTER_FORMATS[DEFAULT_POSTER_FORMAT];
