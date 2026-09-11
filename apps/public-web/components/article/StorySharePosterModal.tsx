"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Globe,
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
  Move,
  ZoomIn,
  Image as ImageIcon,
  Trophy,
} from "lucide-react";
import { ArticleDetail } from "@/services/articleService";
import { QRCodeSVG } from "./QRCodeSVG";
import { getPosterTheme } from "./CategoryPosterTheme";
import { SHARE_POSTER_TEMPLATE_BASE64 } from "./sharePosterTemplateBase64";

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
  const [activeTab, setActiveTab] = useState<"poster" | "social">("poster");
  const [previewScale, setPreviewScale] = useState(0.35);
  const [wrapperHeight, setWrapperHeight] = useState(570);

  // Background Image Customization Controls State
  const [isEditingBg, setIsEditingBg] = useState(false);
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

  // Single unified poster template frame
  const activePosterFrame = SHARE_POSTER_TEMPLATE_BASE64;

  // Dynamically compute preview scale while keeping canonical poster 1024x1536
  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      if (previewWrapperRef.current) {
        const wrapperWidth = previewWrapperRef.current.clientWidth;
        if (wrapperWidth > 0) {
          const scale = wrapperWidth / 1024;
          setPreviewScale(scale);
          setWrapperHeight(wrapperWidth * (1536 / 1024));
        }
      }
    };

    updateScale();
    const timer = setTimeout(updateScale, 50);
    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, [isOpen, activeTab]);

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

    return await html2canvasFn(element, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: 1024,
      height: 1536,
      windowWidth: 1024,
      windowHeight: 1536,
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
          parent.style.width = "1024px";
          parent.style.height = "1536px";
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
      link.download = `${article.slug || "edition-tv"}-poster.png`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-auto">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-lg shadow-sm">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif">
                Edition TV Poster Generator
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Canonical 1024 × 1536 px Social Media Poster Export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab & Adjust Bar */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 px-5 justify-between items-center flex-wrap gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("poster")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-1.5 px-5 rounded-lg text-xs font-bold font-sans transition-all ${activeTab === "poster"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Poster Template</span>
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-1.5 px-5 rounded-lg text-xs font-bold font-sans transition-all ${activeTab === "social"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Social Share Links</span>
            </button>
          </div>

          {activeTab === "poster" && (
            <button
              onClick={() => setIsEditingBg(!isEditingBg)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${isEditingBg
                ? "bg-red-600/90 text-white border-red-500 shadow-sm"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800"
                }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{isEditingBg ? "Done Adjusting" : "Adjust Image"}</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {activeTab === "poster" ? (
            <div className="space-y-6">
              {/* BACKGROUND IMAGE ADJUSTMENT CONTROL PANEL */}
              {isEditingBg && (
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-red-500" />
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
                        Background Image Controls
                      </h4>
                    </div>
                    <button
                      onClick={handleResetBg}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60"
                      title="Reset background settings to defaults"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                  {/* Presets & Custom Image controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Position Presets */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Move className="h-3 w-3 text-slate-400" />
                        <span>Quick Position Presets</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setBgPosY(10);
                            setBgPosX(50);
                          }}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-all ${bgPosY === 10
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                            }`}
                        >
                          Top Focus
                        </button>
                        <button
                          onClick={() => {
                            setBgPosY(50);
                            setBgPosX(50);
                          }}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-all ${bgPosY === 50
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                            }`}
                        >
                          Center
                        </button>
                        <button
                          onClick={() => {
                            setBgPosY(80);
                            setBgPosX(50);
                          }}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-all ${bgPosY === 80
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                            }`}
                        >
                          Bottom Focus
                        </button>
                      </div>
                    </div>

                    {/* Image Upload / Replacement */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 text-slate-400" />
                        <span>Replace Background Image</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1 px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-800 transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5 text-red-500" />
                          <span>
                            {customImageUrl
                              ? "Change Photo"
                              : "Upload Custom Photo"}
                          </span>
                        </button>
                        {customImageUrl && (
                          <button
                            onClick={() => setCustomImageUrl("")}
                            className="py-1 px-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-bold rounded-lg border border-red-800 transition-colors"
                            title="Restore original article image"
                          >
                            Restore Original
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-1 border-t border-slate-800/60">
                    {/* Vertical Y Position Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-300 font-medium">
                          Vertical Position (Y)
                        </span>
                        <span className="font-mono text-red-400 font-bold">
                          {bgPosY}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={bgPosY}
                        onChange={(e) => setBgPosY(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                    </div>

                    {/* Horizontal X Position Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-300 font-medium">
                          Horizontal Position (X)
                        </span>
                        <span className="font-mono text-red-400 font-bold">
                          {bgPosX}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={bgPosX}
                        onChange={(e) => setBgPosX(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                    </div>

                    {/* Zoom / Scale Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-300 font-medium flex items-center gap-1">
                          <ZoomIn className="h-3 w-3 text-slate-400" />
                          <span>Image Zoom / Scale</span>
                        </span>
                        <span className="font-mono text-red-400 font-bold">
                          {bgZoom}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="250"
                        step="5"
                        value={bgZoom}
                        onChange={(e) => setBgZoom(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                    </div>

                    {/* Brightness Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-300 font-medium flex items-center gap-1">
                          <Sun className="h-3 w-3 text-slate-400" />
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
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PREVIEW CONTAINER - VISUALLY SCALES THE SINGLE CANONICAL 1024x1536 POSTER */}
              <div className="flex justify-center bg-slate-950 p-2 sm:p-4 rounded-2xl border border-slate-900 overflow-hidden">
                <div
                  ref={previewWrapperRef}
                  className="relative w-full max-w-[380px] rounded-xl overflow-hidden shadow-2xl border border-slate-800"
                  style={{
                    height: `${wrapperHeight}px`,
                  }}
                >
                  {/* Scaled view of the exact 1024x1536 Canonical Poster */}
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                      width: "1024px",
                      height: "1536px",
                    }}
                  >
                    {/* CANONICAL 1024 × 1536 RENDERER (SINGLE SOURCE OF TRUTH FOR PREVIEW & EXPORT) */}
                    <div
                      ref={canonicalPosterRef}
                      style={{
                        position: "relative",
                        width: "1024px",
                        height: "1536px",
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
                            backgroundImage: `url("${customImageUrl || article.featuredImageUrl
                              }")`,
                            backgroundSize:
                              bgZoom === 100 ? "cover" : `${bgZoom}%`,
                            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                            backgroundRepeat: "no-repeat",
                            filter: `brightness(${bgBrightness / 100
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

                      {/* LAYER 2A: Full-Width Top Header #E4002B Crimson Brand Glow (z-5) */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "320px",
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
                          height: "960px",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.80) 60%, transparent 100%)",
                          pointerEvents: "none",
                          zIndex: 10,
                        }}
                      />

                      {/* LAYER 2C: DYNAMIC CATEGORY NAME IN TOP RIGHT RED BANNER VIA CSS (z-40 — ON TOP OF FRAME OVERLAY) */}
                      <div
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "60px",
                          width: "320px",
                          height: "64px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FFFFFF",
                          fontSize: "38px",
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
                        <span className="whitespace-nowrap px-1">{categoryDisplayName}</span>
                      </div>

                      {/* LAYER 3 & 4: Dynamic Headline & Description Container */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "245px",
                          left: "155px",
                          right: "155px",
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

                        {/* LAYER 4: Dynamic CMS Article Description */}
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

                      {/* LAYER 5: Dynamic Camera-Scannable QR Code Scanner (Larger Size & Placed Further Right in Corner) */}
                      <div
                        style={{
                          position: "absolute",
                          right: "80px",
                          bottom: "65px",
                          width: "148px",
                          height: "148px",
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
                          size={138}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                      </div>

                      {/* LAYER 6: OFFICIAL UNIFIED TRANSPARENT PNG FRAME OVERLAY (/posters/share-poster.png) (z-30) */}
                      {activePosterFrame ? (
                        <img
                          src={activePosterFrame}
                          alt="Edition TV Share Poster Frame"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "1024px",
                            height: "1536px",
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPoster}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 bg-[#E50914] text-white font-bold text-xs py-3 px-4 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {generating
                      ? "Exporting 1024×1536 PNG..."
                      : "Download 1024×1536 Poster PNG"}
                  </span>
                </button>

                <button
                  onClick={handleCopyPosterImage}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 bg-slate-800 text-slate-100 font-bold text-xs py-3 px-4 rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 border border-slate-700"
                >
                  {copiedImage ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">
                        Copied Poster Image!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-300" />
                      <span>Copy Poster to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Copy Direct Link */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-sans uppercase tracking-wider block">
                  Direct Story Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-800 bg-slate-950 rounded-xl font-mono text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 bg-red-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Channels Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-sans uppercase tracking-wider block">
                  Share to Social Networks
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {socialChannels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <a
                        key={channel.name}
                        href={channel.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all shadow-xs ${channel.color}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{channel.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Native Share Sheet */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <Share2 className="h-4 w-4 text-red-500" />
                  <span>Open System Share Sheet (Mobile / OS)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
