#!/usr/bin/env node
/**
 * Derives the alternative share-poster frames from the canonical 2:3 artwork.
 *
 *   node scripts/build-poster-frames.mjs
 *
 * The frame is a transparent overlay whose ink sits in two bands — the logo and
 * category ribbon at the top, the social bar and rule at the bottom — joined by
 * side rails that carry nothing but a smooth vertical gradient. So a different
 * aspect ratio is a three-slice, not a redraw: both bands are scaled uniformly
 * (never squashed), and only the featureless middle is stretched to make up the
 * height. Stretching a gradient just lengthens the gradient.
 *
 * Re-run this whenever posters/share-poster.png changes, and commit the output.
 * The slice lines below were measured from the alpha channel of the 1024x1536
 * artwork: ink spans rows 14-140 and 1396-1519, nothing else is opaque.
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "apps/admin/public/posters/share-poster.png";

/** Where the finished frames are served from; both apps draw the same artwork. */
const DESTINATIONS = [
  "apps/admin/public/posters",
  "apps/public-web/public/posters",
];

/** Last row of the top band, and first row of the bottom band, in the source. */
const TOP_BAND_ENDS_AT = 141;
const BOTTOM_BAND_STARTS_AT = 1396;

const TARGETS = [
  // Instagram's feed never shows taller than 4:5, so a 2:3 poster is cropped on
  // upload. This is the same design at the tallest ratio the feed keeps whole.
  { name: "share-poster-4x5.png", width: 1080, height: 1350 },
];

async function build(source, meta, target) {
  const scale = target.width / meta.width;
  const topHeight = Math.round(TOP_BAND_ENDS_AT * scale);
  const bottomHeight = Math.round(
    (meta.height - BOTTOM_BAND_STARTS_AT) * scale,
  );
  const middleHeight = target.height - topHeight - bottomHeight;

  if (middleHeight <= 0) {
    throw new Error(
      `${target.name}: the bands alone are taller than ${target.height}px.`,
    );
  }

  const slice = (top, height, toHeight) =>
    sharp(source)
      .extract({ left: 0, top, width: meta.width, height })
      .resize(target.width, toHeight, { fit: "fill", kernel: "lanczos3" })
      .png()
      .toBuffer();

  const [top, middle, bottom] = await Promise.all([
    slice(0, TOP_BAND_ENDS_AT, topHeight),
    slice(
      TOP_BAND_ENDS_AT,
      BOTTOM_BAND_STARTS_AT - TOP_BAND_ENDS_AT,
      middleHeight,
    ),
    slice(
      BOTTOM_BAND_STARTS_AT,
      meta.height - BOTTOM_BAND_STARTS_AT,
      bottomHeight,
    ),
  ]);

  return sharp({
    create: {
      width: target.width,
      height: target.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: top, top: 0, left: 0 },
      { input: middle, top: topHeight, left: 0 },
      { input: bottom, top: topHeight + middleHeight, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  if (!existsSync(SOURCE))
    throw new Error(`Source artwork not found at ${SOURCE}.`);
  const meta = await sharp(SOURCE).metadata();
  console.log(`source ${SOURCE} — ${meta.width}x${meta.height}`);

  for (const target of TARGETS) {
    const png = await build(SOURCE, meta, target);
    for (const destination of DESTINATIONS) {
      await mkdir(destination, { recursive: true });
      await writeFile(path.join(destination, target.name), png);
    }
    console.log(
      `  ✓ ${target.name} — ${target.width}x${target.height} (${png.length} bytes)`,
    );
  }
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
});
