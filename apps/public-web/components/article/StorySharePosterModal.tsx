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
  Link2,
  Film,
  Loader2,
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

  // Media Mode: Static Poster (PNG) vs Animated Video Reel (MP4)
  const [mediaMode, setMediaMode] = useState<"image" | "video">("image");
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatusText, setVideoStatusText] = useState("");

  // Selected format configuration
  const currentFormat = POSTER_FORMATS[selectedFormat];

  // Background Image Customization Controls State
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [optimizedImageDataUrl, setOptimizedImageDataUrl] = useState<string>("");
  const [ambientBackdropDataUrl, setAmbientBackdropDataUrl] = useState<string>("");
  const [imageFitMode, setImageFitMode] = useState<"original" | "cover">("original");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; ratio: number }>({
    width: 1200,
    height: 675,
    ratio: 1200 / 675,
  });
  const [bgPosY, setBgPosY] = useState(22);
  const [bgPosX, setBgPosX] = useState(50);
  const [bgZoom, setBgZoom] = useState(100);
  const [bgBrightness, setBgBrightness] = useState(92);
  const [bgContrast, setBgContrast] = useState(108);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetBg = () => {
    setCustomImageUrl("");
    setImageUrlInput("");
    setImageFitMode("original");
    setBgPosY(22);
    setBgPosX(50);
    setBgZoom(100);
    setBgBrightness(92);
    setBgContrast(108);
  };

  const handleApplyImageUrl = () => {
    if (imageUrlInput.trim()) {
      setCustomImageUrl(imageUrlInput.trim());
    }
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

  // Convert any image URL (CORS, external, or local) to a lossless Data URL for pixel-perfect html2canvas rendering
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

    // Use 2x supersampling scale for ultra-crisp studio quality (2048x3072 / 2160x3840)
    const exportScale = 2;

    return await html2canvasFn(element, {
      useCORS: true,
      allowTaint: true,
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

  const handleDownloadVideo = async () => {
    if (typeof window === "undefined") return;
    setVideoGenerating(true);
    setVideoProgress(0);
    setVideoStatusText("Rendering canvas snapshot...");

    let vCanvas: HTMLCanvasElement | null = null;
    let audioContext: AudioContext | null = null;

    try {
      // 1. Capture base canonical canvas via single source of truth html2canvas
      const baseCanvas = await captureCanonicalPoster();
      if (!baseCanvas) {
        throw new Error("Unable to capture story canvas");
      }

      setVideoStatusText("Configuring studio video engine...");
      setVideoProgress(10);

      // Target video dimensions: Full HD 1080p studio broadcast resolution
      const videoWidth = 1080;
      const videoHeight = selectedFormat === "2:3" ? 1620 : 1920;

      vCanvas = document.createElement("canvas");
      vCanvas.width = videoWidth;
      vCanvas.height = videoHeight;
      vCanvas.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;z-index:-1;";
      document.body.appendChild(vCanvas);

      const ctx = vCanvas.getContext("2d", { alpha: false });
      if (!ctx) {
        throw new Error("Canvas 2D context not available");
      }

      // Enable high-quality bicubic downsampling from 2x supersampled master canvas
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Render initial frame to prime the canvas buffer before capturing stream
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, videoWidth, videoHeight);
      ctx.drawImage(
        baseCanvas,
        0,
        0,
        baseCanvas.width,
        baseCanvas.height,
        0,
        0,
        videoWidth,
        videoHeight
      );

      // Supported MIME types prioritized for QuickTime, VLC, and mobile player compatibility
      const candidateMimes = [
        'video/mp4;codecs="avc1.64002A"', // H.264 High Profile Level 4.2 (1080p Full HD)
        'video/mp4;codecs="avc1.640028"', // H.264 High Profile Level 4.0
        'video/mp4;codecs="avc1.4D4029"', // H.264 Main Profile Level 4.1
        'video/mp4;codecs="avc1.4D401F"', // H.264 Main Profile Level 3.1
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      let mimeType = "";
      if (typeof MediaRecorder !== "undefined") {
        for (const candidate of candidateMimes) {
          if (MediaRecorder.isTypeSupported(candidate)) {
            mimeType = candidate;
            break;
          }
        }
      }

      // @ts-expect-error captureStream is supported on HTMLCanvasElement in modern browsers
      const stream: MediaStream = vCanvas.captureStream ? vCanvas.captureStream(30) : null;
      if (!stream) {
        throw new Error("Canvas video capture stream is not supported on this browser.");
      }

      // Attach silent audio track so macOS QuickTime and AVFoundation recognize valid media
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          gain.gain.value = 0; // 100% silent
          osc.connect(gain);
          const dest = audioContext.createMediaStreamDestination();
          gain.connect(dest);
          osc.start();
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
        }
      } catch {
        // Non-fatal if audio context is blocked
      }

      const recorderOptions: MediaRecorderOptions = {
        videoBitsPerSecond: 16000000, // 16 Mbps ultra-crisp studio broadcast bitrate
      };
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, recorderOptions);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const finalMime = mimeType || recorder.mimeType || "video/mp4";
          const blob = new Blob(chunks, { type: finalMime });
          resolve(blob);
        };
        recorder.onerror = (err) => reject(err);
      });

      // Start recorder with 100ms timeslices so data chunks are buffered actively
      recorder.start(100);

      const videoTrack = stream.getVideoTracks()[0];
      const totalFrames = 90; // 3 seconds at 30 fps (standard social video format)
      setVideoStatusText("Encoding 1080p video...");

      for (let frame = 0; frame < totalFrames; frame++) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, videoWidth, videoHeight);

        // Render EXACT fixed poster: No zoom, no motion, 100% pixel-perfect fidelity
        ctx.drawImage(
          baseCanvas,
          0,
          0,
          baseCanvas.width,
          baseCanvas.height,
          0,
          0,
          videoWidth,
          videoHeight
        );

        // Force browser to capture the frame
        if (videoTrack && (videoTrack as unknown as { requestFrame?: () => void }).requestFrame) {
          (videoTrack as unknown as { requestFrame: () => void }).requestFrame();
        }

        // Update progress state periodically
        if (frame % 3 === 0) {
          setVideoProgress(10 + Math.round((frame / totalFrames) * 85));
        }

        // Frame timing delay for smooth stream pacing
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      setVideoStatusText("Finalizing video file...");
      setVideoProgress(95);

      if (recorder.state === "recording") {
        recorder.requestData();
        recorder.stop();
      }

      const videoBlob = await recordPromise;

      if (!videoBlob || videoBlob.size < 1000) {
        throw new Error("Generated video file was empty or corrupted.");
      }

      setVideoProgress(100);
      setVideoStatusText("Downloading video reel...");

      const isMp4 = (mimeType || recorder.mimeType || "").includes("mp4");
      const ext = isMp4 ? "mp4" : "webm";
      const downloadUrl = URL.createObjectURL(videoBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${article.slug || "edition-tv"}-${currentFormat.downloadFilenameSuffix}-reel.${ext}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 8000);
    } catch (err) {
      console.error("Failed to generate video reel:", err);
      alert("Video generation was interrupted or unsupported on this browser. Falling back to high-res poster image.");
      handleDownloadPoster();
    } finally {
      if (vCanvas && vCanvas.parentNode) {
        vCanvas.parentNode.removeChild(vCanvas);
      }
      if (audioContext && audioContext.state !== "closed") {
        try {
          audioContext.close();
        } catch {
          // ignore
        }
      }
      setVideoGenerating(false);
      setVideoProgress(0);
      setVideoStatusText("");
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
                onClick={() => {
                  setCustomImageUrl("");
                  setImageUrlInput("");
                }}
                className="py-1 sm:py-1.5 px-2 sm:px-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg border border-red-800 transition-colors shrink-0"
                title="Restore original article image"
              >
                Restore
              </button>
            )}
          </div>

          {/* Paste Image URL Input with Instant High-Res Preview */}
          <div className="pt-2">
            <label className="text-[10px] sm:text-[11px] font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <Link2 className="h-3 w-3 text-red-500" />
              <span>Or Paste Image Link (URL)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                placeholder="https://... direct image link"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyImageUrl();
                  }
                }}
                className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 text-[11px] sm:text-xs px-2.5 py-1.5 rounded-md sm:rounded-lg border border-slate-800 focus:outline-none focus:border-red-500 font-sans"
              />
              <button
                type="button"
                onClick={handleApplyImageUrl}
                className="px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 font-sans">
              Supports any image link (JPG, PNG, WebP) with automatic high-res enhancement & CORS preloading.
            </p>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-2 sm:space-y-3 pt-1.5 sm:pt-2 border-t border-slate-800/60">
        {/* Fit Mode Toggle: Original (Exact) vs Cover */}
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <ImageIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
              <span>Image Display Mode</span>
            </span>
            <span className="font-mono text-red-400 font-bold text-[10px]">
              {imageFitMode === "original" ? "Original (Exact, No Expansion)" : "Fill Poster (Cover)"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setImageFitMode("original")}
              className={`py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                imageFitMode === "original"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Original (Exact)
            </button>
            <button
              type="button"
              onClick={() => setImageFitMode("cover")}
              className={`py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                imageFitMode === "cover"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Fill Poster (Cover)
            </button>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-sans">
            {imageFitMode === "original"
              ? "Shows exact original image without expanding, cropping, or stretching."
              : "Expands image to cover the entire vertical poster frame."}
          </p>
        </div>

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
                        {/* 1A: Ambient Backdrop Layer (smooth ambient color glow matching the image) */}
                        {ambientBackdropDataUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
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
                              background:
                                "linear-gradient(135deg, #180206 0%, #0a0103 50%, #000000 100%)",
                            }}
                          />
                        )}

                        {/* 1B: Exact Original Foreground Image (Pixel-perfect, zero distortion, exact aspect ratio) */}
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
                            filter: `brightness(${
                              bgBrightness / 100
                            }) contrast(${bgContrast / 100})`,
                            boxShadow:
                              imageFitMode === "original"
                                ? "0 14px 48px rgba(0,0,0,0.85)"
                                : "none",
                          }}
                        />
                      </div>
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
                        fontSize:
                          categoryDisplayName.length > 14
                            ? "36px"
                            : categoryDisplayName.length > 10
                              ? "42px"
                              : currentFormat.ribbon.fontSize,
                        fontWeight: 700,
                        fontFamily:
                          "'Roboto Slab', serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textAlign: "center",
                        zIndex: 40,
                      }}
                    >
                      <span className="whitespace-nowrap px-1" style={{ marginTop: "-8px" }}>
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

                    {/* LAYER 5B: Contact Phone Number (z-20) */}
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
                      <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#F8FAFC", marginBottom: "-2px" }}>
                        Contact Us
                      </span>
                      <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                        +91 72041 17779
                      </span>
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

                {/* Motion Reel Overlay when in Video Mode */}
                {mediaMode === "video" && (
                  <>
                    <div className="absolute top-2.5 left-2.5 z-40 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-lg">
                      <Film className="h-3 w-3 text-red-500" />
                      <span className="text-[10px] font-bold text-white tracking-wide uppercase">Video Mode (MP4)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Media Mode Toggle: Static Poster (PNG) vs Video Format (MP4) */}
            <div className="w-full max-w-xs sm:max-w-sm mt-2 sm:mt-2.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800/80 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMediaMode("image")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  mediaMode === "image"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                <span>Poster (PNG)</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaMode("video")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  mediaMode === "video"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Film className="h-3.5 w-3.5 text-amber-300" />
                <span>Video (MP4)</span>
              </button>
            </div>

            {/* Poster Format Toggle: 2:3 Feed vs 9:16 Story */}
            <div className="w-full max-w-xs sm:max-w-sm mt-1.5 sm:mt-2 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 sm:gap-1.5 shrink-0">
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
                {mediaMode === "video" ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadVideo}
                      disabled={videoGenerating || generating}
                      className="w-full relative overflow-hidden flex items-center justify-center gap-2 bg-[#E50914] text-white font-bold text-xs sm:text-sm py-3 sm:py-3.5 px-4 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg disabled:opacity-60"
                    >
                      {videoGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>{videoStatusText || `Exporting Video (${videoProgress}%)`}</span>
                        </>
                      ) : (
                        <>
                          <Film className="h-4 w-4 text-white" />
                          <span>Download as Video ({selectedFormat === "2:3" ? "Feed MP4" : "Story MP4"})</span>
                        </>
                      )}
                      {videoGenerating && (
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-150"
                          style={{ width: `${videoProgress}%` }}
                        />
                      )}
                    </button>
                    <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-400" />
                        Exact 1:1 Poster in Video Format
                      </span>
                      <span className="font-mono text-slate-500">1080p MP4</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <button
                      onClick={handleDownloadPoster}
                      disabled={generating || videoGenerating}
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
                      disabled={generating || videoGenerating}
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
                )}

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
