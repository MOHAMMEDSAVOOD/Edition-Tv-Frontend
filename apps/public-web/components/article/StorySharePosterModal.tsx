"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Linkedin,
  Facebook,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.11 1.04-1.53 1.07-.41.04-.94.15-2.83-.6-1.62-.64-2.68-2.28-2.76-2.39-.08-.11-.64-.85-.64-1.62 0-.77.4-1.15.54-1.31.14-.16.31-.2.42-.2.11 0 .21 0 .3.01.1.01.24-.04.37.28.14.34.48 1.17.52 1.25.04.08.07.18.01.29-.05.11-.08.18-.16.27-.08.1-.17.21-.24.28-.08.08-.17.17-.07.34.1.17.43.71.93 1.15.64.57 1.18.75 1.35.83.17.08.27.07.37-.05.1-.11.43-.5.54-.67.11-.18.22-.15.37-.09.15.05.97.46 1.14.54.17.09.28.13.32.2.04.08.04.47-.15 1" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}
import html2canvas from "html2canvas";
import { ArticleDetail } from "@/services/articleService";
import { QRCodeSVG } from "./QRCodeSVG";
import { getPosterTheme } from "./CategoryPosterTheme";
import {
  POSTER_FORMATS,
  PosterAspectRatio,
} from "./sharePosterTemplateBase64";

interface StorySharePosterModalProps {
  article: ArticleDetail;
  isOpen: boolean;
  onClose: () => void;
}

export function StorySharePosterModal({
  article,
  isOpen,
  onClose,
}: StorySharePosterModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [sharingPoster, setSharingPoster] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "share">("preview");
  const [selectedFormat, setSelectedFormat] = useState<PosterAspectRatio>("2:3");
  const [previewScale, setPreviewScale] = useState(0.32);
  const [wrapperHeight, setWrapperHeight] = useState(480);


  // Selected format configuration
  const currentFormat = POSTER_FORMATS[selectedFormat];

  // Image state (article image or replaced custom image link)
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [optimizedImageDataUrl, setOptimizedImageDataUrl] = useState<string>("");
  const [ambientBackdropDataUrl, setAmbientBackdropDataUrl] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; ratio: number }>({
    width: 1200,
    height: 675,
    ratio: 1200 / 675,
  });
  // Fixed display values
  const bgPosY = 22;
  const bgPosX = 50;
  const bgZoom = 100;
  const bgBrightness = 92;
  const bgContrast = 108;
  const imageFitMode = "original" as const;

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (trimmed) {
      setCustomImageUrl(trimmed);
    }
  };

  // Convert article featured image (or replaced image) URL to a lossless Data URL for pixel-perfect html2canvas rendering
  useEffect(() => {
    let isMounted = true;
    const targetUrl = customImageUrl || article.featuredImageUrl;
    if (!targetUrl) {
      setOptimizedImageDataUrl("");
      setAmbientBackdropDataUrl("");
      return;
    }

    const processLoadedImage = (img: HTMLImageElement, sourceUrl: string) => {
      const natW = img.naturalWidth || img.width || 1200;
      const natH = img.naturalHeight || img.height || 675;
      if (isMounted) {
        setImageDimensions({
          width: natW,
          height: natH,
          ratio: natW / natH,
        });
      }

      // Generate ambient blurred backdrop canvas data URL for 100% html2canvas compatibility
      try {
        const ambientCanvas = document.createElement("canvas");
        ambientCanvas.width = 80;
        ambientCanvas.height = Math.round(80 * (currentFormat.height / currentFormat.width));
        const aCtx = ambientCanvas.getContext("2d");
        if (aCtx) {
          aCtx.drawImage(img, 0, 0, ambientCanvas.width, ambientCanvas.height);
          const ambientData = ambientCanvas.toDataURL("image/jpeg", 0.75);
          if (isMounted) setAmbientBackdropDataUrl(ambientData);
        }
      } catch {
        // Tainted canvas fallback
      }

      // If already data URL or blob, set directly
      if (sourceUrl.startsWith("data:") || sourceUrl.startsWith("blob:")) {
        if (isMounted) setOptimizedImageDataUrl(sourceUrl);
        return;
      }

      // Create clean high-resolution canvas dataUrl for lossless html2canvas capture
      try {
        const canvas = document.createElement("canvas");
        canvas.width = natW;
        canvas.height = natH;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, natW, natH);
          const dataUrl = canvas.toDataURL("image/png");
          if (isMounted) {
            setOptimizedImageDataUrl(dataUrl);
            return;
          }
        }
      } catch {
        // If tainted canvas, use sourceUrl directly
      }
      if (isMounted) setOptimizedImageDataUrl(sourceUrl);
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      processLoadedImage(img, targetUrl);
    };
    img.onerror = () => {
      if (isMounted) setOptimizedImageDataUrl(targetUrl);
    };
    img.src = targetUrl;

    return () => {
      isMounted = false;
    };
  }, [customImageUrl, article.featuredImageUrl, currentFormat.width, currentFormat.height]);


  const canonicalPosterRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  // Get dynamic category poster theme (colors, badge styling, label)
  const posterTheme = getPosterTheme(article.category);
  const categoryDisplayName = (
    article.category || posterTheme.categoryLabel || "NEWS"
  ).toUpperCase();

  // Active poster frame from selected format
  const activePosterFrame = currentFormat.templateUrl;

  // Dynamically compute preview scale according to active format dimensions and wrapper width
  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      if (previewWrapperRef.current) {
        const wrapperWidth = previewWrapperRef.current.clientWidth;
        if (wrapperWidth > 0) {
          const scale = wrapperWidth / currentFormat.width;
          setPreviewScale(scale);
          setWrapperHeight(
            wrapperWidth * (currentFormat.height / currentFormat.width)
          );
        }
      }
    };

    updateScale();
    const timer1 = setTimeout(updateScale, 30);
    const timer2 = setTimeout(updateScale, 150);

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    if (previewWrapperRef.current) {
      observer.observe(previewWrapperRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [
    isOpen,
    activeTab,
    selectedFormat,
    currentFormat.width,
    currentFormat.height,
  ]);

  // Compute exact pixel placement and dimensions for the background visual image (Zero distortion, exact aspect ratio)
  const imgRatio = imageDimensions.ratio || 16 / 9;
  const containerW = currentFormat.width;
  const containerH = currentFormat.height;

  let fgWidth: number;
  let fgHeight: number;
  let fgLeft: number;
  let fgTop: number;

  if (imageFitMode === "original") {
    // Fits within container width, preserving exact original image aspect ratio without any expansion
    fgWidth = containerW;
    fgHeight = Math.round(containerW / imgRatio);
    if (fgHeight > containerH) {
      fgHeight = containerH;
      fgWidth = Math.round(containerH * imgRatio);
    }
    const maxTravelY = containerH - fgHeight;
    const maxTravelX = containerW - fgWidth;
    fgTop = Math.round(maxTravelY * (bgPosY / 100));
    fgLeft = Math.round(maxTravelX * (bgPosX / 100));
  } else {
    // Cover / Full Frame fill mode
    const scale = Math.max(
      containerW / (imageDimensions.width || containerW),
      containerH / (imageDimensions.height || containerH)
    );
    fgWidth = Math.round((imageDimensions.width || containerW) * scale);
    fgHeight = Math.round((imageDimensions.height || containerH) * scale);
    const maxTravelY = containerH - fgHeight;
    const maxTravelX = containerW - fgWidth;
    fgTop = Math.round(maxTravelY * (bgPosY / 100));
    fgLeft = Math.round(maxTravelX * (bgPosX / 100));
  }

  if (!isOpen) return null;

  const articlePath = article.slug
    ? `/articles/${article.slug}`
    : typeof window !== "undefined" && window.location.pathname !== "/"
      ? window.location.pathname
      : `/articles/${article.id || ""}`;

  const currentUrl = `https://editiontv.com${articlePath}`;

  const headlineText = article.headline || article.title || "";
  const descriptionText = article.subtitle || article.summary || "";

  // Full informative social post formatted for X, Instagram, LinkedIn, and messaging
  const socialPostText = [
    `🔴 ${headlineText}`,
    "",
    descriptionText,
    "",
    `📖 Read full story on Edition TV:`,
    currentUrl,
    "",
    `✨ Follow @EditionTV for 24/7 verified global journalism.`,
    `#EditionTV #News #BreakingNews #WorldNews`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  // Dynamic Headline Font Sizing
  const getHeadlineFontSize = (text: string) => {
    if (text.length < 40) return "54px";
    if (text.length < 75) return "46px";
    return "38px";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyPostText = async () => {
    try {
      await navigator.clipboard.writeText(socialPostText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Single Source of Truth HTML2Canvas Capture with onclone transform stripping
  const captureCanonicalPoster = async () => {
    const element = canonicalPosterRef.current;
    if (!element) return null;

    try {
      const html2canvasFn =
        typeof html2canvas === "function"
          ? html2canvas
          : ((html2canvas as unknown as { default?: typeof html2canvas }).default || html2canvas);

      const targetWidth = currentFormat.width;
      const targetHeight = currentFormat.height;

      // Use 2x supersampling scale for ultra-crisp studio quality (2048x3072 / 2160x3840)
      const exportScale = 2;

      return await html2canvasFn(element, {
        useCORS: true,
        allowTaint: false,
        scale: exportScale,
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        windowHeight: targetHeight,
        backgroundColor: "#000000",
        imageTimeout: 15000,
        logging: false,
        onclone: (clonedDoc, clonedElement) => {
          // Strip preview CSS scale transform from cloned element and parents in the cloned document
          clonedElement.style.transform = "none";
          clonedElement.style.position = "relative";
          clonedElement.style.left = "0px";
          clonedElement.style.top = "0px";
          clonedElement.style.margin = "0px";

          let parent = clonedElement.parentElement;
          while (parent) {
            parent.style.transform = "none";
            parent.style.width = `${targetWidth}px`;
            parent.style.height = `${targetHeight}px`;
            parent.style.margin = "0px";
            parent.style.padding = "0px";
            parent = parent.parentElement;
          }
        },
      });
    } catch (err) {
      console.error("Failed to capture canonical poster:", err);
      return null;
    }
  };

  const handleDownloadPoster = async () => {
    setGenerating(true);
    try {
      const canvas = await captureCanonicalPoster();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate poster image:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPosterImage = async () => {
    setGenerating(true);
    try {
      const canvas = await captureCanonicalPoster();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch {
          handleDownloadPoster();
        }
      });
    } catch (err) {
      console.error("Failed to copy poster image:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Share poster directly via Web Share API with attached image file, or fallback to download & clipboard
  const handleDirectSharePoster = async () => {
    setSharingPoster(true);
    try {
      const canvas = await captureCanonicalPoster();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File(
        [blob],
        `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}.png`,
        { type: "image/png" }
      );

      // Mobile / modern browser native share sheet with the attached image file
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: headlineText,
          text: socialPostText,
          files: [file],
        });
        return;
      }

      // Desktop fallback: copy poster to clipboard so user can Cmd+V/Ctrl+V into apps, and download
      let copiedToClip = false;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        copiedToClip = true;
      } catch {
        // clipboard item image not supported or denied
      }

      const downloadLink = document.createElement("a");
      downloadLink.download = `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}.png`;
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(downloadLink.href), 5000);

      setShareToast(
        copiedToClip
          ? "Poster copied to clipboard & downloaded! Paste directly into your post."
          : "Poster downloaded to your device! Attach it to your post."
      );
      setTimeout(() => setShareToast(null), 6000);
    } catch (err) {
      console.error("Error in handleDirectSharePoster:", err);
    } finally {
      setSharingPoster(false);
    }
  };

  // Enhanced native share that attaches the poster file whenever possible
  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const canvas = await captureCanonicalPoster();
        if (canvas) {
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );
          if (blob) {
            const file = new File(
              [blob],
              `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}.png`,
              { type: "image/png" }
            );
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: headlineText,
                text: socialPostText,
                files: [file],
              });
              return;
            }
          }
        }
        await navigator.share({
          title: headlineText,
          text: descriptionText,
          url: currentUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  // Handle sharing to specific social channels with poster image attached or copied
  const handleShareToChannel = async (channel: (typeof socialChannels)[number]) => {
    setSharingPoster(true);
    try {
      const canvas = await captureCanonicalPoster();
      if (!canvas) {
        window.open(channel.url, "_blank");
        return;
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) {
        window.open(channel.url, "_blank");
        return;
      }

      const file = new File(
        [blob],
        `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}.png`,
        { type: "image/png" }
      );

      // On mobile browsers supporting file sharing, open native share with poster attached
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: headlineText,
          text: socialPostText,
          files: [file],
        });
        return;
      }

      // On desktop: copy poster image to clipboard, trigger download, then open web channel
      let copiedToClip = false;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        copiedToClip = true;
      } catch {
        // clipboard image not supported
      }

      const downloadLink = document.createElement("a");
      downloadLink.download = `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}.png`;
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(downloadLink.href), 5000);

      setShareToast(
        copiedToClip
          ? `Poster copied to clipboard & downloaded! Paste it into ${channel.name}.`
          : `Poster downloaded! Attach it to your ${channel.name} post.`
      );
      setTimeout(() => setShareToast(null), 6000);

      window.open(channel.url, "_blank");
    } catch (err) {
      console.error("Error sharing with poster:", err);
      window.open(channel.url, "_blank");
    } finally {
      setSharingPoster(false);
    }
  };

  const socialChannels = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      bg: "#25D366",
      text: "#ffffff",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(socialPostText)}`,
    },
    {
      name: "X",
      icon: XIcon,
      bg: "#000000",
      text: "#ffffff",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${headlineText}\n\n${descriptionText}\n\nVia @EditionTV:`)}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      bg: "#0A66C2",
      text: "#ffffff",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      bg: "#229ED9",
      text: "#ffffff",
      url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(socialPostText)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      bg: "#1877F2",
      text: "#ffffff",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "Reddit",
      icon: MessageSquare,
      bg: "#FF4500",
      text: "#ffffff",
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(headlineText)}`,
    },
    {
      name: "Email",
      icon: Mail,
      bg: "#4B5563",
      text: "#ffffff",
      url: `mailto:?subject=${encodeURIComponent(headlineText)}&body=${encodeURIComponent(socialPostText)}`,
    },
  ];

  // SUB-RENDERER: Social Share Panel (light theme)
  const renderSharePanel = () => (
    <div className="flex flex-col h-full space-y-4">
      {/* Toast feedback notification */}
      {shareToast && (
        <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-[12px]">{shareToast}</span>
        </div>
      )}

      {/* Primary: Share Poster with Image Button */}
      <div>
        <button
          type="button"
          onClick={handleDirectSharePoster}
          disabled={sharingPoster || generating}
          className="w-full flex items-center justify-center gap-2 bg-[#E4002B] hover:bg-red-700 text-white font-bold text-[13px] py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
        >
          {sharingPoster ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparing Poster for Sharing…</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Share Poster with Image</span>
            </>
          )}
        </button>
      </div>

      {/* Section: Share via Social Channels (Poster included) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Share via
          </p>
          <span className="text-[10px] text-gray-400">Includes poster</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {socialChannels.map((ch) => {
            const Icon = ch.icon;
            return (
              <button
                key={ch.name}
                type="button"
                onClick={() => handleShareToChannel(ch)}
                disabled={sharingPoster}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.97] text-left disabled:opacity-50"
                style={{ backgroundColor: ch.bg, color: ch.text }}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate text-[13px]">{ch.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Copy Formatted Post (Headline, Summary, Link, CTA) */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Social Post / Caption
          </p>
          <span className="text-[10px] font-semibold text-[#E4002B] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            Ready for X / Instagram
          </span>
        </div>

        {/* Informative Preview Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2.5 text-left text-gray-700 space-y-1.5">
          <p className="text-[12px] font-bold text-gray-900 line-clamp-1">
            {headlineText}
          </p>
          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
            {descriptionText}
          </p>
          <div className="text-[10px] font-mono text-gray-400 truncate">
            {currentUrl}
          </div>
          <p className="text-[10px] text-gray-400">
            Follow @EditionTV · #EditionTV #News
          </p>
        </div>

        {/* Copy Post Text Action Button */}
        <button
          type="button"
          onClick={copyPostText}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-bold border transition-all ${
            copiedText
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
              : "bg-white hover:bg-gray-100 border-gray-300 text-gray-800 shadow-sm active:scale-[0.98]"
          }`}
        >
          {copiedText ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Post Text Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-gray-600" />
              <span>Copy Full Post Text</span>
            </>
          )}
        </button>
      </div>

      {/* Section: Copy Link Only */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Direct Article Link</p>
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden px-3 py-1.5">
          <span className="flex-1 text-[11px] font-mono text-gray-500 truncate">{currentUrl}</span>
          <button
            type="button"
            onClick={copyToClipboard}
            className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              copiedLink
                ? "bg-emerald-500 text-white"
                : "bg-gray-800 hover:bg-black text-white"
            }`}
          >
            {copiedLink ? (
              <><Check className="h-3 w-3" /><span>Copied!</span></>
            ) : (
              <><Copy className="h-3 w-3" /><span>Copy Link</span></>
            )}
          </button>
        </div>
      </div>

      {/* Section: System Share */}
      <button
        type="button"
        onClick={handleNativeShare}
        disabled={sharingPoster}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors"
      >
        <Share2 className="h-3.5 w-3.5 text-gray-500" />
        <span>More device sharing options…</span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-4xl bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[90vh]">

        {/* ── HEADER ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Share Story</h2>
            <p className="text-[12px] text-gray-400 leading-tight mt-0.5">Download branded poster or share directly to social media</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── MOBILE TABS ────────────────────────────── */}
        <div className="flex md:hidden border-b border-gray-100 bg-gray-50 px-3 pt-2 pb-0 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center pb-2 text-[12px] font-bold border-b-2 transition-all ${
              activeTab === "preview"
                ? "border-[#E4002B] text-[#E4002B]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Poster Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`flex-1 flex items-center justify-center pb-2 text-[12px] font-bold border-b-2 transition-all ${
              activeTab === "share"
                ? "border-[#E4002B] text-[#E4002B]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Share &amp; Download
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* LEFT: Poster Canvas */}
          <div
            className={`md:w-[42%] bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto ${
              activeTab === "share" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Poster preview */}
            <div className="w-full flex flex-col items-center justify-center flex-1">
              <div
                ref={previewWrapperRef}
                className={`relative ${
                  selectedFormat === "9:16"
                    ? "max-w-[160px] sm:max-w-[200px] md:max-w-[240px]"
                    : "max-w-[200px] sm:max-w-[240px] md:max-w-[280px]"
                } w-full rounded-xl overflow-hidden shadow-xl border border-gray-200`}
                style={{ height: `${wrapperHeight}px` }}
              >
                {/* Scaled canonical poster */}
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                    width: `${currentFormat.width}px`,
                    height: `${currentFormat.height}px`,
                  }}
                >
                  {/* CANONICAL POSTER (single source of truth for preview & export) */}
                  <div
                    ref={canonicalPosterRef}
                    style={{
                      position: "relative",
                      width: `${currentFormat.width}px`,
                      height: `${currentFormat.height}px`,
                      backgroundColor: "#000000",
                      overflow: "hidden",
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      userSelect: "none",
                    }}
                  >
                    {/* LAYER 1: Background image */}
                    {(optimizedImageDataUrl || customImageUrl || article.featuredImageUrl) ? (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: `${currentFormat.width}px`,
                          height: `${currentFormat.height}px`,
                          overflow: "hidden",
                          zIndex: 0,
                          backgroundColor: "#000000",
                        }}
                      >
                        {ambientBackdropDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ambientBackdropDataUrl}
                            alt=""
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              inset: "-30px",
                              width: `${currentFormat.width + 60}px`,
                              height: `${currentFormat.height + 60}px`,
                              objectFit: "cover",
                              filter: "blur(24px) brightness(0.35)",
                              opacity: 0.88,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(135deg, #180206 0%, #0a0103 50%, #000000 100%)",
                            }}
                          />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={optimizedImageDataUrl || customImageUrl || article.featuredImageUrl}
                          crossOrigin="anonymous"
                          alt="Story Visual Background"
                          onLoad={(e) => {
                            const t = e.currentTarget;
                            if (t.naturalWidth && t.naturalHeight) {
                              setImageDimensions({
                                width: t.naturalWidth,
                                height: t.naturalHeight,
                                ratio: t.naturalWidth / t.naturalHeight,
                              });
                            }
                          }}
                          style={{
                            position: "absolute",
                            left: `${fgLeft}px`,
                            top: `${fgTop}px`,
                            width: `${fgWidth}px`,
                            height: `${fgHeight}px`,
                            maxWidth: "none",
                            maxHeight: "none",
                            transform: bgZoom !== 100 ? `scale(${bgZoom / 100})` : "none",
                            transformOrigin: "center center",
                            filter: `brightness(${bgBrightness / 100}) contrast(${bgContrast / 100})`,
                            boxShadow: imageFitMode === "original" ? "0 14px 48px rgba(0,0,0,0.85)" : "none",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(135deg, #2a010a 0%, #090104 50%, #000000 100%)",
                          zIndex: 0,
                        }}
                      />
                    )}

                    {/* LAYER 2A: Brand glow */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: currentFormat.topGlowHeight, background: "linear-gradient(to bottom, rgba(228, 0, 43, 0.50) 0%, rgba(228, 0, 43, 0.18) 55%, transparent 100%)", filter: "blur(20px)", pointerEvents: "none", zIndex: 5 }} />

                    {/* LAYER 2B: Readability gradient */}
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: currentFormat.bottomGlowHeight, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.80) 60%, transparent 100%)", pointerEvents: "none", zIndex: 10 }} />

                    {/* LAYER 2C: Category ribbon */}
                    <div
                      style={{
                        position: "absolute",
                        top: currentFormat.ribbon.top,
                        right: currentFormat.ribbon.right,
                        width: currentFormat.ribbon.width,
                        height: currentFormat.ribbon.height,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: categoryDisplayName.length > 14 ? "36px" : categoryDisplayName.length > 10 ? "42px" : currentFormat.ribbon.fontSize,
                        fontWeight: 700,
                        fontFamily: "'Roboto Slab', serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textAlign: "center",
                        zIndex: 40,
                      }}
                    >
                      <span className="whitespace-nowrap px-1" style={{ marginTop: "-8px" }}>{categoryDisplayName}</span>
                    </div>

                    {/* LAYER 3: Headline & description */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: currentFormat.content.bottom,
                        left: currentFormat.content.left,
                        right: currentFormat.content.right,
                        textAlign: "left",
                        zIndex: 20,
                      }}
                    >
                      <h1
                        style={{
                          fontSize: getHeadlineFontSize(headlineText),
                          fontWeight: 700,
                          color: "#FFFFFF",
                          fontFamily: "'Georgia', 'Times New Roman', 'Merriweather', serif",
                          lineHeight: 1.2,
                          letterSpacing: "-0.015em",
                          margin: 0,
                          padding: 0,
                          display: "block",
                          wordBreak: "break-word",
                          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.98))",
                        }}
                      >
                        {headlineText}
                      </h1>
                      {descriptionText && (
                        <p
                          style={{
                            marginTop: "14px",
                            fontSize: "25px",
                            lineHeight: 1.35,
                            color: "#F8FAFC",
                            fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
                            fontWeight: 600,
                            margin: "14px 0 0 0",
                            padding: 0,
                            display: "block",
                            wordBreak: "break-word",
                            filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.98))",
                          }}
                        >
                          {descriptionText}
                        </p>
                      )}
                    </div>

                    {/* LAYER 5: QR Code */}
                    <div
                      style={{
                        position: "absolute",
                        right: currentFormat.qrCode.right,
                        bottom: currentFormat.qrCode.bottom,
                        width: currentFormat.qrCode.boxSize,
                        height: currentFormat.qrCode.boxSize,
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
                      <QRCodeSVG value={currentUrl} size={currentFormat.qrCode.size} bgColor="#FFFFFF" fgColor="#000000" />
                    </div>

                    {/* LAYER 5B: Contact phone */}
                    <div
                      style={{
                        position: "absolute",
                        right: `calc(${currentFormat.qrCode.right} + ${currentFormat.qrCode.boxSize} + 20px)`,
                        bottom: `calc(${currentFormat.qrCode.bottom} + 14px)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        zIndex: 20,
                        color: "#FFFFFF",
                        fontFamily: "'Inter', sans-serif",
                        textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#F8FAFC", marginBottom: "-2px" }}>Contact Us</span>
                      <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>+91 72041 17779</span>
                    </div>

                    {/* LAYER 6: Frame overlay */}
                    {activePosterFrame ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activePosterFrame}
                        alt={`Edition TV Share Poster Frame (${currentFormat.aspectRatioLabel})`}
                        style={{ position: "absolute", inset: 0, width: `${currentFormat.width}px`, height: `${currentFormat.height}px`, objectFit: "cover", pointerEvents: "none", zIndex: 30, opacity: 1 }}
                      />
                    ) : null}
                  </div>
                </div>


              </div>
            </div>

            {/* Format + media toggles */}
            <div className="w-full mt-4 space-y-2">


              {/* Format selector */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("2:3")}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                    selectedFormat === "2:3"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  2:3 Feed
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("9:16")}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                    selectedFormat === "9:16"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  9:16 Story
                </button>
              </div>

              {/* Replace Image Link */}
              <div className="bg-gray-100 p-2 rounded-xl">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Replace Image
                  </span>
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImageUrl("");
                        setImageUrlInput("");
                      }}
                      className="text-[10px] font-bold text-[#E4002B] hover:underline"
                    >
                      Restore Default
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="Paste image link (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyImageUrl();
                      }
                    }}
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-[11px] bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleApplyImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="px-2.5 py-1.5 bg-gray-900 hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors disabled:opacity-40 shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Download CTA */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPoster}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#E4002B] hover:bg-red-700 text-white font-bold text-[13px] py-3 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  {generating ? "Exporting…" : `Download ${currentFormat.badge}`}
                </button>
                <button
                  onClick={handleCopyPosterImage}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[13px] py-3 px-3 rounded-xl border border-gray-200 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {copiedImage ? (
                    <><Check className="h-4 w-4 text-green-500" /></>
                  ) : (
                    <><Copy className="h-4 w-4 text-gray-500" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Share panel */}
          <div
            className={`flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto bg-white ${
              activeTab === "share" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Article headline preview */}
            <div className="mb-5 pb-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">You&apos;re sharing</p>
              <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{headlineText}</p>
            </div>

            {/* Social share grid */}
            {renderSharePanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
