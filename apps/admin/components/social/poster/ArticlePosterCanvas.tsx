"use client";

import { forwardRef } from "react";
import { QRCodeSVG } from "./QRCodeSVG";
import {
  DEFAULT_POSTER_FORMAT,
  PosterFormatId,
  posterFormat,
} from "./posterFormats";

/**
 * The 2:3 poster's size, kept for callers that predate the format switch. The poster is drawn at
 * whichever format it is given; read the size from {@link posterFormat} rather than from these.
 */
export const POSTER_WIDTH = 1024;
export const POSTER_HEIGHT = 1536;

export interface PosterBackgroundAdjustments {
  /** Horizontal focal point, 0-100. */
  posX: number;
  /** Vertical focal point, 0-100. */
  posY: number;
  /** 100 means cover; anything else is a background-size percentage. */
  zoom: number;
  brightness: number;
  contrast: number;
}

export const DEFAULT_BACKGROUND_ADJUSTMENTS: PosterBackgroundAdjustments = {
  posX: 50,
  posY: 20,
  zoom: 100,
  brightness: 92,
  contrast: 108,
};

export interface ArticlePosterCanvasProps {
  headline: string;
  description?: string | null;
  /** Shown in the top-right banner; already the display form, e.g. "SPORTS". */
  categoryLabel: string;
  /**
   * Background image. Anything the browser can paint — but if the poster is going to be exported,
   * a cross-origin URL taints the canvas, so pass a data URI for anything not served by this app.
   */
  imageUrl?: string | null;
  /** Encoded into the QR code, and where a reader who scans it lands. */
  articleUrl: string;
  /**
   * Overrides the frame overlay the format names. Same origin, or the export breaks.
   * Pass null to draw no frame at all.
   */
  frameSrc?: string | null;
  adjustments?: PosterBackgroundAdjustments;
  /** Which size to draw at. Defaults to the one Instagram shows whole. */
  format?: PosterFormatId;
}

/** Headline sizing steps, so a long headline still fits the plate. */
function headlineFontSize(
  text: string,
  steps: readonly [number, number, number],
): string {
  if (text.length < 40) return `${steps[0]}px`;
  if (text.length < 75) return `${steps[1]}px`;
  return `${steps[2]}px`;
}

/**
 * The canonical 1024x1536 Edition TV share poster.
 *
 * <p>Used by the newsroom's Instagram composer. The geometry here mirrors
 * POSTER_FORMATS["2:3"] in the public site's sharePosterTemplateBase64.ts, which drives that app's
 * own richer poster sheet (multiple aspect ratios, video reels). The two should be reconciled onto
 * this component once that sheet settles — until then, a change to the 2:3 numbers there needs the
 * same change here.
 *
 * <p>Scale it for display by transforming a wrapper; never by changing these dimensions, or the
 * export stops matching the preview.
 */
export const ArticlePosterCanvas = forwardRef<
  HTMLDivElement,
  ArticlePosterCanvasProps
>(function ArticlePosterCanvas(
  {
    headline,
    description,
    categoryLabel,
    imageUrl,
    articleUrl,
    frameSrc,
    adjustments = DEFAULT_BACKGROUND_ADJUSTMENTS,
    format = DEFAULT_POSTER_FORMAT,
  },
  ref,
) {
  const { posX, posY, zoom, brightness, contrast } = adjustments;
  const layout = posterFormat(format);
  const frame = frameSrc === undefined ? layout.frameSrc : frameSrc;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: `${layout.width}px`,
        height: `${layout.height}px`,
        backgroundColor: "#000000",
        overflow: "hidden",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        userSelect: "none",
      }}
    >
      {/* LAYER 1: article image background (z-0) */}
      {imageUrl ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("${imageUrl}")`,
            backgroundSize: zoom === 100 ? "cover" : `${zoom}%`,
            backgroundPosition: `${posX}% ${posY}%`,
            backgroundRepeat: "no-repeat",
            filter: `brightness(${brightness / 100}) contrast(${contrast / 100})`,
            zIndex: 0,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #2a010a 0%, #090104 50%, #000000 100%)",
            zIndex: 0,
          }}
        />
      )}

      {/* LAYER 2A: crimson brand glow across the top (z-5) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${layout.topGlowHeight}px`,
          background:
            "linear-gradient(to bottom, rgba(228, 0, 43, 0.50) 0%, rgba(228, 0, 43, 0.18) 55%, transparent 100%)",
          filter: "blur(20px)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* LAYER 2B: readability gradient behind the headline (z-10) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${layout.bottomGradientHeight}px`,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.80) 60%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* LAYER 2C: category, in the frame's red banner — above the frame overlay (z-40) */}
      <div
        style={{
          position: "absolute",
          top: `${layout.ribbon.top}px`,
          right: `${layout.ribbon.right}px`,
          width: `${layout.ribbon.width}px`,
          height: `${layout.ribbon.height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: `${layout.ribbon.fontSize}px`,
          fontWeight: 800,
          fontStyle: "italic",
          fontFamily:
            "'Playfair Display', 'Georgia', 'Merriweather', 'Brush Script MT', cursive, serif",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          textAlign: "center",
          textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.85))",
          zIndex: 40,
        }}
      >
        <span style={{ whiteSpace: "nowrap", padding: "0 4px" }}>
          {categoryLabel}
        </span>
      </div>

      {/* LAYERS 3 & 4: headline and standfirst (z-20) */}
      <div
        style={{
          position: "absolute",
          bottom: `${layout.content.bottom}px`,
          left: `${layout.content.left}px`,
          right: `${layout.content.right}px`,
          textAlign: "left",
          zIndex: 20,
        }}
      >
        <h1
          style={{
            fontSize: headlineFontSize(headline, layout.headlineFontSizes),
            fontWeight: 700,
            color: "#FFFFFF",
            fontFamily: "'Georgia', 'Times New Roman', 'Merriweather', serif",
            fontStyle: "normal",
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            margin: 0,
            padding: 0,
            display: "block",
            wordBreak: "break-word",
            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.98))",
          }}
        >
          {headline}
        </h1>

        {description ? (
          <p
            style={{
              fontSize: `${layout.standfirstFontSize}px`,
              lineHeight: 1.35,
              color: "#F8FAFC",
              fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
              fontWeight: 600,
              fontStyle: "normal",
              margin: "14px 0 0 0",
              padding: 0,
              display: "block",
              wordBreak: "break-word",
              filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.98))",
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {/* LAYER 5: scannable QR to the article (z-20) */}
      <div
        style={{
          position: "absolute",
          right: `${layout.qr.right}px`,
          bottom: `${layout.qr.bottom}px`,
          width: `${layout.qr.box}px`,
          height: `${layout.qr.box}px`,
          backgroundColor: "#FFFFFF",
          borderRadius: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.75)",
          zIndex: 20,
        }}
      >
        <QRCodeSVG
          value={articleUrl}
          size={layout.qr.size}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {/* LAYER 6: the unified transparent PNG frame (z-30) */}
      {frame ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frame}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: `${layout.width}px`,
            height: `${layout.height}px`,
            objectFit: "fill",
            pointerEvents: "none",
            zIndex: 30,
            opacity: 1,
          }}
        />
      ) : null}
    </div>
  );
});
