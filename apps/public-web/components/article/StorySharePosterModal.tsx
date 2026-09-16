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
  Image as ImageIcon,
  Smartphone,
  Layers,
  Eye,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<"preview" | "share">("preview");
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

  // Image state (read-only from article, no customization in public web)
  const [optimizedImageDataUrl, setOptimizedImageDataUrl] = useState<string>("");
  const [ambientBackdropDataUrl, setAmbientBackdropDataUrl] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; ratio: number }>({
    width: 1200,
    height: 675,
    ratio: 1200 / 675,
  });
  // Fixed display values — no user editing in public web
  const bgPosY = 22;
  const bgPosX = 50;
  const bgZoom = 100;
  const bgBrightness = 92;
  const bgContrast = 108;
  const imageFitMode = "original" as const;

  // Convert article featured image URL to a lossless Data URL for pixel-perfect html2canvas rendering
  useEffect(() => {
    let isMounted = true;
    const targetUrl = article.featuredImageUrl;
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
  }, [article.featuredImageUrl, currentFormat.width, currentFormat.height]);


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
      name: "WhatsApp",
      icon: Send,
      bg: "#25D366",
      text: "#ffffff",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      bg: "#000000",
      text: "#ffffff",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
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
      icon: Send,
      bg: "#229ED9",
      text: "#ffffff",
      url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
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
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Email",
      icon: Mail,
      bg: "#6B7280",
      text: "#ffffff",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${currentUrl}`)}`,
    },
  ];
  // SUB-RENDERER: Social Share Panel (light theme)
  const renderSharePanel = () => (
    <div className="flex flex-col h-full">
      {/* Section: Share via social */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Share via</p>
        <div className="grid grid-cols-2 gap-2">
          {socialChannels.map((ch) => {
            const Icon = ch.icon;
            return (
              <a
                key={ch.name}
                href={ch.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.97]"
                style={{ backgroundColor: ch.bg, color: ch.text }}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate text-[13px]">{ch.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Section: Copy Link */}
      <div className="mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Copy Link</p>
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden px-3 py-2">
          <span className="flex-1 text-[12px] font-mono text-gray-500 truncate">{currentUrl}</span>
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
              copiedLink
                ? "bg-green-500 text-white"
                : "bg-[#E4002B] text-white hover:bg-red-700"
            }`}
          >
            {copiedLink ? (
              <><Check className="h-3.5 w-3.5" /><span>Copied!</span></>
            ) : (
              <><Copy className="h-3.5 w-3.5" /><span>Copy</span></>
            )}
          </button>
        </div>
      </div>

      {/* Section: System Share */}
      <button
        onClick={handleNativeShare}
        className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors mb-4"
      >
        <Share2 className="h-4 w-4 text-[#E4002B]" />
        <span>More sharing options…</span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-4xl bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-auto flex flex-col max-h-[96dvh] sm:max-h-[90vh]">

        {/* ── HEADER ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#E4002B] rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">Share Story</h2>
              <p className="text-[11px] text-gray-400 leading-tight hidden sm:block">Download poster · Share with your audience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── MOBILE TABS ────────────────────────────── */}
        <div className="flex md:hidden border-b border-gray-100 bg-gray-50 px-3 pt-2 pb-0 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-1.5 pb-2 text-[12px] font-bold border-b-2 transition-all ${
              activeTab === "preview"
                ? "border-[#E4002B] text-[#E4002B]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Poster Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("share")}
            className={`flex-1 flex items-center justify-center gap-1.5 pb-2 text-[12px] font-bold border-b-2 transition-all ${
              activeTab === "share"
                ? "border-[#E4002B] text-[#E4002B]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share & Download
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
                    {(optimizedImageDataUrl || article.featuredImageUrl) ? (
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
                          src={optimizedImageDataUrl || article.featuredImageUrl}
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

                {/* Video mode badge */}
                {mediaMode === "video" && (
                  <div className="absolute top-2 left-2 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/80 border border-white/20">
                    <Film className="h-3 w-3 text-red-400" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wide">Video</span>
                  </div>
                )}
              </div>
            </div>

            {/* Format + media toggles */}
            <div className="w-full mt-4 space-y-2">
              {/* Media mode */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setMediaMode("image")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    mediaMode === "image"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                  Poster (PNG)
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode("video")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    mediaMode === "video"
                      ? "bg-[#E4002B] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  Video (MP4)
                </button>
              </div>

              {/* Format selector */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("2:3")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    selectedFormat === "2:3"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  2:3 Feed
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("9:16")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    selectedFormat === "9:16"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Smartphone className="h-3 w-3" />
                  9:16 Story
                </button>
              </div>

              {/* Download CTA */}
              {mediaMode === "video" ? (
                <button
                  onClick={handleDownloadVideo}
                  disabled={videoGenerating || generating}
                  className="w-full flex items-center justify-center gap-2 bg-[#E4002B] hover:bg-red-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-60 active:scale-[0.98] relative overflow-hidden"
                >
                  {videoGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span>{videoStatusText || `Exporting… ${videoProgress}%`}</span></>
                  ) : (
                    <><Film className="h-4 w-4" /><span>Download Video Reel</span></>
                  )}
                  {videoGenerating && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all" style={{ width: `${videoProgress}%` }} />
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPoster}
                    disabled={generating || videoGenerating}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#E4002B] hover:bg-red-700 text-white font-bold text-[13px] py-3 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    {generating ? "Exporting…" : `Download ${currentFormat.badge}`}
                  </button>
                  <button
                    onClick={handleCopyPosterImage}
                    disabled={generating || videoGenerating}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[13px] py-3 px-3 rounded-xl border border-gray-200 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {copiedImage ? (
                      <><Check className="h-4 w-4 text-green-500" /></>
                    ) : (
                      <><Copy className="h-4 w-4 text-gray-500" /></>
                    )}
                  </button>
                </div>
              )}
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
