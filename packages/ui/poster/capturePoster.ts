import { POSTER_HEIGHT, POSTER_WIDTH } from "./ArticlePosterCanvas";

/**
 * Rasterises a rendered poster element to a PNG.
 *
 * <p>The element is normally displayed shrunk by a CSS transform, so the clone html2canvas draws
 * has that transform stripped: the export is always the full 1024x1536, never the preview size.
 *
 * <p>`allowTaint` is deliberately off. With it on, a cross-origin image still paints but the canvas
 * becomes unreadable and the export throws at the very last step — after the user has waited. Off,
 * html2canvas skips what it cannot read and the export succeeds, so callers should hand in a data
 * URI for any image not served by this origin.
 */
export async function capturePosterPng(element: HTMLElement): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: 1,
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    windowWidth: POSTER_WIDTH,
    windowHeight: POSTER_HEIGHT,
    backgroundColor: "#000000",
    logging: false,
    onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
      clonedElement.style.transform = "none";
      clonedElement.style.position = "relative";
      clonedElement.style.left = "0px";
      clonedElement.style.top = "0px";
      clonedElement.style.margin = "0px";

      let parent = clonedElement.parentElement;
      while (parent) {
        parent.style.transform = "none";
        parent.style.width = `${POSTER_WIDTH}px`;
        parent.style.height = `${POSTER_HEIGHT}px`;
        parent.style.margin = "0px";
        parent.style.padding = "0px";
        parent = parent.parentElement;
      }
    },
  });

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The poster could not be encoded as a PNG."));
    }, "image/png");
  });
}

/** The same capture, as base64 without the data: prefix — the form the API stores. */
export async function capturePosterBase64(element: HTMLElement): Promise<string> {
  const blob = await capturePosterPng(element);
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
