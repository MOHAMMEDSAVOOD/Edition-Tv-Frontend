"use client";

import { useMemo } from "react";
import QRCode from "qrcode";

interface QRCodeSVGProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

/**
 * Pure Synchronous Camera-Scannable QR Code SVG Renderer.
 * Uses QRCode.create() which is 100% synchronous in browser & node to generate clean SVG path elements in 0ms.
 */
export function QRCodeSVG({
  value,
  size = 50,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
}: QRCodeSVGProps) {
  const qrSvgData = useMemo(() => {
    if (!value) return null;
    try {
      // QRCode.create is 100% synchronous in browser & node!
      const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
      const modules = qr.modules;
      const matrixSize = modules.size;
      const margin = 1;
      const viewBoxSize = matrixSize + margin * 2;

      // Build SVG path data for all dark QR modules
      let pathData = "";
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (modules.get(r, c)) {
            pathData += `M${c} ${r}h1v1h-1z `;
          }
        }
      }

      return { pathData, viewBoxSize, margin };
    } catch (err) {
      console.error("Failed to generate QR Code matrix:", err);
      return null;
    }
  }, [value]);

  if (!qrSvgData || !qrSvgData.pathData) {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px`, backgroundColor: bgColor }}
        className="block"
      />
    );
  }

  const { pathData, viewBoxSize, margin } = qrSvgData;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`-${margin} -${margin} ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        backgroundColor: bgColor,
      }}
      className="block pointer-events-none rounded-xs"
    >
      <rect
        x={`-${margin}`}
        y={`-${margin}`}
        width={viewBoxSize}
        height={viewBoxSize}
        fill={bgColor}
      />
      <path d={pathData} fill={fgColor} shapeRendering="crispEdges" />
    </svg>
  );
}
