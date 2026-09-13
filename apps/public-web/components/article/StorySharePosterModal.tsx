"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  Mail,
  MessageSquare,
  Sliders,
  RotateCcw,
  Upload,
  Sun,
  Contrast,
  Move,
  ZoomIn,
  Image as ImageIcon,
  Smartphone,
  Layers,
  Eye,
  Sparkles,
} from "lucide-react";
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
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "share">("preview");
  const [desktopTab, setDesktopTab] = useState<"edit" | "share">("edit");
  const [selectedFormat, setSelectedFormat] = useState<PosterAspectRatio>("2:3");
  const [previewScale, setPreviewScale] = useState(0.32);
  const [wrapperHeight, setWrapperHeight] = useState(480);

  // Selected format configuration
  const currentFormat = POSTER_FORMATS[selectedFormat];

  // Background Image Customization Controls State
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [bgPosY, setBgPosY] = useState(20);
  const [bgPosX, setBgPosX] = useState(50);
  const [bgZoom, setBgZoom] = useState(100);
  const [bgBrightness, setBgBrightness] = useState(92);
  const [bgContrast, setBgContrast] = useState(108);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetBg = () => {
    setCustomImageUrl("");
    setBgPosY(20);
    setBgPosX(50);
    setBgZoom(100);
    setBgBrightness(92);
    setBgContrast(108);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  if (!isOpen) return null;

  const articlePath = article.slug
    ? `/articles/${article.slug}`
    : typeof window !== "undefined" && window.location.pathname !== "/"
      ? window.location.pathname
      : `/articles/${article.id || ""}`;

  const currentUrl = `https://editiontv.com${articlePath}`;

  const shareTitle = article.headline || article.title;
  const shareText = `${shareTitle}\n\nRead full story on Edition TV:`;

  const headlineText = article.headline || article.title || "";
  const descriptionText = article.subtitle || article.summary || "";

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

  // Single Source of Truth HTML2Canvas Capture with onclone transform stripping
  const captureCanonicalPoster = async () => {
    const element = canonicalPosterRef.current;
    if (!element) return null;

    const html2canvasModule = await import("html2canvas");
    const html2canvasFn = html2canvasModule.default;

    const targetWidth = currentFormat.width;
    const targetHeight = currentFormat.height;

    return await html2canvasFn(element, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      backgroundColor: "#000000",
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
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

  const socialChannels = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-black text-white hover:bg-zinc-800",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2] text-white hover:bg-[#084e96]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2] text-white hover:bg-[#135ab7]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: Send,
      color: "bg-[#25D366] text-white hover:bg-[#1da851]",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#229ED9] text-white hover:bg-[#1a7cae]",
      url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Reddit",
      icon: MessageSquare,
      color: "bg-[#FF4500] text-white hover:bg-[#cc3700]",
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-slate-700 text-white hover:bg-slate-800",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`,
    },
  ];

  // SUB-RENDERER: Photo Editing Controls
  const renderEditControls = (isMobile = false) => (
    <div className="space-y-2.5 sm:space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 sm:pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          <h4 className="text-[11px] sm:text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
            Customize Photo
          </h4>
        </div>
        <button
          onClick={handleResetBg}
          className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors bg-slate-800/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-slate-700/60"
          title="Reset background adjustments to defaults"
        >
          <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Position Presets & Photo Replacement */}
      <div className="space-y-2 sm:space-y-3">
        {/* Quick Position Presets */}
        <div className="space-y-1 sm:space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Move className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
            <span>Position Presets</span>
          </label>
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => {
                setBgPosY(10);
                setBgPosX(50);
              }}
              className={`py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
                bgPosY === 10
                  ? "bg-red-600 text-white border-red-500 shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              Top Focus
            </button>
            <button
              type="button"
              onClick={() => {
                setBgPosY(50);
                setBgPosX(50);
              }}
              className={`py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
                bgPosY === 50
                  ? "bg-red-600 text-white border-red-500 shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => {
                setBgPosY(80);
                setBgPosX(50);
              }}
              className={`py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
                bgPosY === 80
                  ? "bg-red-600 text-white border-red-500 shadow-sm"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              Bottom Focus
            </button>
          </div>
        </div>

        {/* Upload Custom Photo */}
        <div className="space-y-1 sm:space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <ImageIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
            <span>Replace Background Image</span>
          </label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-2.5 sm:px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg border border-slate-800 transition-colors"
            >
              <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
              <span>
                {customImageUrl ? "Change Photo" : "Upload Custom Photo"}
              </span>
            </button>
            {customImageUrl && (
              <button
                type="button"
                onClick={() => setCustomImageUrl("")}
                className="py-1 sm:py-1.5 px-2 sm:px-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg border border-red-800 transition-colors shrink-0"
                title="Restore original article image"
              >
                Restore
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-2 sm:space-y-3 pt-1.5 sm:pt-2 border-t border-slate-800/60">
        {/* Vertical Y Position Slider */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Move className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
              <span>Vertical Position (Y)</span>
            </span>
            <span className="font-mono text-red-400 font-bold">{bgPosY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bgPosY}
            onChange={(e) => setBgPosY(Number(e.target.value))}
            className="w-full h-1 sm:h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Horizontal X Position Slider */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Move className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
              <span>Horizontal Position (X)</span>
            </span>
            <span className="font-mono text-red-400 font-bold">{bgPosX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bgPosX}
            onChange={(e) => setBgPosX(Number(e.target.value))}
            className="w-full h-1 sm:h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Zoom / Scale Slider */}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <ZoomIn className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
              <span>Image Zoom / Scale</span>
            </span>
            <span className="font-mono text-red-400 font-bold">{bgZoom}%</span>
          </div>
          <input
            type="range"
            min="100"
            max="250"
            step="5"
            value={bgZoom}
            onChange={(e) => setBgZoom(Number(e.target.value))}
            className="w-full h-1 sm:h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Brightness & Contrast in 2 columns */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Brightness */}
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Sun className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                <span>Brightness</span>
              </span>
              <span className="font-mono text-red-400 font-bold">
                {bgBrightness}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="2"
              value={bgBrightness}
              onChange={(e) => setBgBrightness(Number(e.target.value))}
              className="w-full h-1 sm:h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Contrast className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                <span>Contrast</span>
              </span>
              <span className="font-mono text-red-400 font-bold">
                {bgContrast}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="2"
              value={bgContrast}
              onChange={(e) => setBgContrast(Number(e.target.value))}
              className="w-full h-1 sm:h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="pt-1.5 sm:pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className="w-full py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Done - View Full Poster</span>
          </button>
        </div>
      )}
    </div>
  );

  // SUB-RENDERER: Social Share Links
  const renderShareControls = () => (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Copy Direct Link */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[11px] sm:text-xs font-bold text-slate-300 font-sans uppercase tracking-wider block">
          Direct Story Link
        </label>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 px-3 py-1.5 sm:px-3.5 sm:py-2.5 text-[11px] sm:text-xs border border-slate-800 bg-slate-950 rounded-lg sm:rounded-xl font-mono text-slate-200 focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 sm:gap-1.5 bg-red-600 text-white font-bold text-[11px] sm:text-xs py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Channels Grid */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[11px] sm:text-xs font-bold text-slate-300 font-sans uppercase tracking-wider block">
          Share to Social Networks
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2.5">
          {socialChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs ${channel.color}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">{channel.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Mobile Native Share Sheet */}
      <div className="pt-2 sm:pt-3 border-t border-slate-800 text-center">
        <button
          onClick={handleNativeShare}
          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-800 text-slate-200 font-bold text-[11px] sm:text-xs py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          <span>Open System Share Sheet (Mobile / OS)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-950 text-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[94vh]">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 bg-red-600 text-white rounded-md sm:rounded-lg shadow-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-serif">
                  Edition TV Poster Studio
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                  {currentFormat.badge} · {currentFormat.width}×{currentFormat.height}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                HD Export with camera-scannable QR code & dynamic branding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Navigation Segmented Tabs (< md) */}
        <div className="flex md:hidden border-b border-slate-800 bg-slate-900/60 p-1 px-2.5 justify-between items-center shrink-0">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 w-full gap-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "edit"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="h-3 w-3" />
              <span>Edit Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("share")}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "share"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Share2 className="h-3 w-3" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Modal Studio Body: 2-Column Desktop / Responsive Mobile View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT COLUMN: POSTER CANVAS PREVIEW & PRIMARY ACTIONS */}
          <div
            className={`w-full md:w-[48%] lg:w-[45%] p-2.5 sm:p-5 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-950/70 overflow-y-auto ${
              activeTab === "share" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Live Preview Wrapper */}
            <div className="w-full flex flex-col items-center justify-center py-0.5 sm:py-1">
              <div
                ref={previewWrapperRef}
                className={`relative w-full ${
                  selectedFormat === "9:16"
                    ? activeTab === "edit"
                      ? "max-w-[130px] sm:max-w-[170px] md:max-w-[270px] lg:max-w-[290px]"
                      : "max-w-[185px] sm:max-w-[230px] md:max-w-[270px] lg:max-w-[290px]"
                    : activeTab === "edit"
                      ? "max-w-[145px] sm:max-w-[185px] md:max-w-[300px] lg:max-w-[330px]"
                      : "max-w-[205px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[330px]"
                } rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-200 shrink-0`}
                style={{
                  height: `${wrapperHeight}px`,
                }}
              >
                {/* Scaled view of the exact Canonical Poster */}
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                    width: `${currentFormat.width}px`,
                    height: `${currentFormat.height}px`,
                  }}
                >
                  {/* CANONICAL RENDERER (SINGLE SOURCE OF TRUTH FOR PREVIEW & EXPORT) */}
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
                    {/* LAYER 1: Real CMS Article Image Background (or Custom Uploaded Photo) (z-0) */}
                    {customImageUrl || article.featuredImageUrl ? (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url("${
                            customImageUrl || article.featuredImageUrl
                          }")`,
                          backgroundSize:
                            bgZoom === 100 ? "cover" : `${bgZoom}%`,
                          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                          backgroundRepeat: "no-repeat",
                          filter: `brightness(${
                            bgBrightness / 100
                          }) contrast(${bgContrast / 100})`,
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

                    {/* LAYER 2A: Crimson Brand Glow (z-5) */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: currentFormat.topGlowHeight,
                        background:
                          "linear-gradient(to bottom, rgba(228, 0, 43, 0.50) 0%, rgba(228, 0, 43, 0.18) 55%, transparent 100%)",
                        filter: "blur(20px)",
                        pointerEvents: "none",
                        zIndex: 5,
                      }}
                    />

                    {/* LAYER 2B: Readability Dark Gradient (z-10) */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: currentFormat.bottomGlowHeight,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.80) 60%, transparent 100%)",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />

                    {/* LAYER 2C: Dynamic Category Name in Top Ribbon (z-40) */}
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
                        fontSize: currentFormat.ribbon.fontSize,
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
                      <span className="whitespace-nowrap px-1">
                        {categoryDisplayName}
                      </span>
                    </div>

                    {/* LAYER 3 & 4: Headline & Description Container (z-20) */}
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
                          fontFamily:
                            "'Georgia', 'Times New Roman', 'Merriweather', serif",
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
                        {headlineText}
                      </h1>

                      {descriptionText && (
                        <p
                          style={{
                            marginTop: "14px",
                            fontSize: "25px",
                            lineHeight: 1.35,
                            color: "#F8FAFC",
                            fontFamily:
                              "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
                            fontWeight: 600,
                            fontStyle: "normal",
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

                    {/* LAYER 5: Dynamic Scannable QR Code Scanner (z-20) */}
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
                      <QRCodeSVG
                        value={currentUrl}
                        size={currentFormat.qrCode.size}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                      />
                    </div>

                    {/* LAYER 6: OFFICIAL UNIFIED TRANSPARENT PNG FRAME OVERLAY (z-30) */}
                    {activePosterFrame ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={activePosterFrame}
                        alt={`Edition TV Share Poster Frame (${currentFormat.aspectRatioLabel})`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: `${currentFormat.width}px`,
                          height: `${currentFormat.height}px`,
                          objectFit: "cover",
                          pointerEvents: "none",
                          zIndex: 30,
                          opacity: 1,
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Poster Format Toggle: 2:3 Feed vs 9:16 Story */}
            <div className="w-full max-w-xs sm:max-w-sm mt-2 sm:mt-3 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedFormat("2:3")}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  selectedFormat === "2:3"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>2:3 Feed</span>
                <span className="text-[9px] sm:text-[10px] opacity-75 font-mono">(1024×1536)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat("9:16")}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  selectedFormat === "9:16"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>9:16 Story</span>
                <span className="text-[9px] sm:text-[10px] opacity-75 font-mono">(941×1672)</span>
              </button>
            </div>

            {/* Mobile View: Show Edit Controls right beneath compact preview when in Edit Mode */}
            {activeTab === "edit" && (
              <div className="w-full max-w-xs sm:max-w-sm mt-2 sm:mt-4 md:hidden">
                {renderEditControls(true)}
              </div>
            )}

            {/* In Preview Mode: Download and Copy Action Buttons */}
            {activeTab === "preview" && (
              <div className="w-full max-w-xs sm:max-w-sm mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <button
                    onClick={handleDownloadPoster}
                    disabled={generating}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#E50914] text-white font-bold text-[11px] sm:text-xs py-2.5 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="truncate">
                      {generating
                        ? "Exporting..."
                        : `Download ${currentFormat.badge}`}
                    </span>
                  </button>

                  <button
                    onClick={handleCopyPosterImage}
                    disabled={generating}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-800 text-slate-100 font-bold text-[11px] sm:text-xs py-2.5 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 border border-slate-700"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                        <span className="text-emerald-400 truncate">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300" />
                        <span className="truncate">Copy Image</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile Shortcut to Edit Photo */}
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="w-full md:hidden flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2.5 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border border-slate-800 transition-colors"
                >
                  <Sliders className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
                  <span>Customize Photo Position & Zoom</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STUDIO CONTROLS (DESKTOP TABS & TOOLS, OR MOBILE SHARE) */}
          <div
            className={`w-full md:w-[52%] lg:w-[55%] p-3 sm:p-6 flex flex-col overflow-y-auto bg-slate-900/30 ${
              activeTab === "share" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Desktop Navigation Tabs: [ Customize Photo ] | [ Social Share Links ] */}
            <div className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5 shrink-0">
              <button
                type="button"
                onClick={() => setDesktopTab("edit")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold font-sans transition-all ${
                  desktopTab === "edit"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Customize Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopTab("share")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold font-sans transition-all ${
                  desktopTab === "share"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Social Share Links</span>
              </button>
            </div>

            {/* Desktop / Mobile Tool Content */}
            {activeTab === "share" ? (
              renderShareControls()
            ) : desktopTab === "edit" ? (
              renderEditControls(false)
            ) : (
              renderShareControls()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
