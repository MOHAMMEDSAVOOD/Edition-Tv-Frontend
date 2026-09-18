"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Instagram,
  Facebook,
  Youtube,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  LayoutTemplate,
  Sliders,
  RotateCcw,
  Upload,
  Film,
} from "lucide-react";
import {
  ArticlePosterCanvas,
  capturePosterBase64,
  DEFAULT_BACKGROUND_ADJUSTMENTS,
  DEFAULT_POSTER_FORMAT,
  POSTER_FORMATS,
  PosterBackgroundAdjustments,
  PosterFormatId,
  posterFormat,
} from "./poster";

import { ApiError } from "@/lib/api-client";
import {
  socialService,
  posterService,
  SocialMediaStatus,
  SocialPlatform,
  SocialShare,
  SocialShareDraft,
} from "@/services/socialService";

interface SocialPublishModalProps {
  /** The published article to post. */
  articleId: string;
  /** Shown in the header while the draft loads. */
  headline?: string;
  onClose: () => void;
  /** Called once the post is live, so the caller can refresh its own view. */
  onPublished?: (shares: SocialShare[]) => void;
}

const newIdempotencyKey = (articleId: string) =>
  `share-${articleId}-${Date.now()}`;

/** How wide the preview is drawn, whatever the poster's real size. */
const PREVIEW_WIDTH = 260;

const PLATFORM_UI: Record<
  SocialPlatform,
  { label: string; Icon: typeof Instagram; accent: string; selected: string }
> = {
  instagram: {
    label: "Instagram",
    Icon: Instagram,
    accent: "text-fuchsia-600",
    selected: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  facebook: {
    label: "Facebook",
    Icon: Facebook,
    accent: "text-blue-600",
    selected: "bg-blue-50 text-blue-700 border-blue-200",
  },
  youtube: {
    label: "YouTube",
    Icon: Youtube,
    accent: "text-red-600",
    selected: "bg-red-50 text-red-700 border-red-200",
  },
};

/**
 * The step after an article goes live: put it on the newsroom's own accounts.
 *
 * <p>Two things it can post — the Edition TV branded poster (the same renderer the public site's
 * share sheet uses) or the article's own image — to any of Instagram, Facebook and YouTube. The
 * backend prepares the caption, stores the poster and is the only thing that talks to the
 * social-media module.
 *
 * <p>The poster defaults to 4:5 because Instagram's feed never shows taller than that: at the old
 * 2:3 it cropped the frame and the headline. The adjustment sliders exist for the same reason —
 * the wire image's subject is rarely dead centre, and moving it is faster than finding another
 * picture.
 */
export function SocialPublishModal({
  articleId,
  headline,
  onClose,
  onPublished,
}: SocialPublishModalProps) {
  const [status, setStatus] = useState<SocialMediaStatus | null>(null);
  const [draft, setDraft] = useState<SocialShareDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    newIdempotencyKey(articleId),
  );

  const [platforms, setPlatforms] = useState<SocialPlatform[]>(["instagram"]);
  const [accountIds, setAccountIds] = useState<
    Partial<Record<SocialPlatform, string>>
  >({});
  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");

  const [useBrandedPoster, setUseBrandedPoster] = useState(true);
  const [format, setFormat] = useState<PosterFormatId>(DEFAULT_POSTER_FORMAT);
  const [adjustments, setAdjustments] = useState<PosterBackgroundAdjustments>(
    DEFAULT_BACKGROUND_ADJUSTMENTS,
  );
  const [showAdjustments, setShowAdjustments] = useState(false);

  /**
   * The article image as a data URI. html2canvas cannot read a cross-origin image back out of the
   * canvas, and wire agencies send no CORS headers, so the backend fetches it for us.
   */
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [posterImageError, setPosterImageError] = useState<string | null>(null);
  const [isPreparingPoster, setIsPreparingPoster] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [results, setResults] = useState<SocialShare[] | null>(null);

  const layout = posterFormat(format);
  const previewScale = PREVIEW_WIDTH / layout.width;

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [statusData, draftData] = await Promise.all([
        socialService.getStatus(),
        socialService.getDraft(articleId),
      ]);
      setStatus(statusData);
      setDraft(draftData);
      setCaption(draftData.suggestedCaption);
      setImageUrl(draftData.imageUrl ?? "");
      setYoutubeTitle(draftData.headline ?? "");

      // Preselect the first ready account of each network, so the common case needs no choosing.
      const preselected: Partial<Record<SocialPlatform, string>> = {};
      for (const account of statusData.accounts) {
        if (!preselected[account.platform] && account.ready) {
          preselected[account.platform] = account.id;
        }
      }
      setAccountIds(preselected);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Could not load the social post for this article.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    load();
  }, [load]);

  // Pull the background through the backend whenever the chosen image changes. A data URI the
  // editor uploaded is already local, so it is used as it is.
  useEffect(() => {
    const source = imageUrl.trim();
    if (!useBrandedPoster || !source) {
      setPosterImage(null);
      return;
    }
    if (source.startsWith("data:")) {
      setPosterImage(source);
      setPosterImageError(null);
      return;
    }
    let cancelled = false;
    setIsPreparingPoster(true);
    setPosterImageError(null);
    posterService
      .fetchRemoteImage(source)
      .then((image) => {
        if (!cancelled) setPosterImage(image.dataUri);
      })
      .catch((err) => {
        if (cancelled) return;
        setPosterImage(null);
        setPosterImageError(
          err instanceof Error
            ? err.message
            : "Could not load that image for the poster.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsPreparingPoster(false);
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl, useBrandedPoster]);

  /** Accounts grouped by network, deduplicated: one Instagram account can be connected twice — once
   * through the Page it is linked to and once through Instagram Login — and React needs one key. */
  const accountsByPlatform = useMemo(() => {
    const grouped: Record<SocialPlatform, SocialMediaStatus["accounts"]> = {
      instagram: [],
      facebook: [],
      youtube: [],
    };
    const seen = new Set<string>();
    for (const account of status?.accounts ?? []) {
      const key = `${account.platform}:${account.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      grouped[account.platform]?.push(account);
    }
    return grouped;
  }, [status]);

  const captionLimit = status?.captionLimit ?? 2200;
  const captionOverBy = caption.length - captionLimit;
  const needsVideo = platforms.includes("youtube");
  const videoMissing = needsVideo && !videoUrl.trim();
  const alreadyShared = (draft?.previousShares ?? []).some(
    (s) => s.status === "PUBLISHED",
  );

  const canSubmit =
    !isSubmitting &&
    !isPreparingPoster &&
    platforms.length > 0 &&
    caption.trim().length > 0 &&
    imageUrl.trim().length > 0 &&
    !videoMissing &&
    captionOverBy <= 0;

  const togglePlatform = (platform: SocialPlatform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((p) => p !== platform)
        : [...current, platform].sort(
            (a, b) =>
              (
                ["instagram", "facebook", "youtube"] as SocialPlatform[]
              ).indexOf(a) -
              (
                ["instagram", "facebook", "youtube"] as SocialPlatform[]
              ).indexOf(b),
          ),
    );
  };

  const adjust = (key: keyof PosterBackgroundAdjustments, value: number) =>
    setAdjustments((current) => ({ ...current, [key]: value }));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loaded) => {
      if (loaded.target?.result) setImageUrl(loaded.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async (force: boolean) => {
    setIsSubmitting(true);
    setError(null);
    setNeedsConfirmation(false);

    const key = force ? newIdempotencyKey(articleId) : idempotencyKey;
    if (force) setIdempotencyKey(key);

    try {
      let postImageUrl = imageUrl.trim();

      if (useBrandedPoster) {
        if (!posterRef.current)
          throw new Error("The poster has not finished rendering yet.");
        setProgress("Rendering the poster...");
        const base64 = await capturePosterBase64(posterRef.current, format);
        setProgress("Storing the poster...");
        const stored = await posterService.storePoster(base64);
        postImageUrl = stored.url;
      }

      setProgress(
        `Publishing to ${platforms.map((p) => PLATFORM_UI[p].label).join(", ")}...`,
      );
      const shares = await socialService.share({
        articleId,
        platforms,
        caption: caption.trim(),
        imageUrl: postImageUrl,
        videoUrl: needsVideo ? videoUrl.trim() : undefined,
        youtubeTitle: needsVideo ? youtubeTitle.trim() || undefined : undefined,
        link: draft?.articleUrl,
        instagramAccountId: accountIds.instagram,
        facebookPageId: accountIds.facebook,
        youtubeChannelId: accountIds.youtube,
        idempotencyKey: key,
        force,
      });
      setResults(shares);
      const failed = shares.filter((s) => s.status === "FAILED");
      if (failed.length === shares.length) {
        setError(failed[0]?.errorMessage ?? "Every network refused the post.");
      } else {
        onPublished?.(shares);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setNeedsConfirmation(true);
        setError(err.details.detail || "This article has already been shared.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to publish.");
      }
    } finally {
      setIsSubmitting(false);
      setProgress(null);
    }
  };

  const published = results?.some((s) => s.status !== "FAILED") ?? false;
  const showComposer = !isLoading && !loadError && status?.enabled && !results;

  const slider = (
    label: string,
    key: keyof PosterBackgroundAdjustments,
    min: number,
    max: number,
    unit = "%",
  ) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-600 font-bold">{label}</span>
        <span className="text-fuchsia-700 font-bold">
          {adjustments[key]}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={adjustments[key]}
        onChange={(e) => adjust(key, Number(e.target.value))}
        className="w-full accent-fuchsia-600 h-1"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-fuchsia-50 text-fuchsia-600 rounded-xl border border-fuchsia-100">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 font-heading">
                Share this story
              </h2>
              <p className="text-xs text-slate-500 line-clamp-1">
                {draft?.headline || headline || "Published article"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {isLoading && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center font-mono">
              <Loader2 className="h-6 w-6 text-fuchsia-600 animate-spin" />
              <p className="text-xs text-slate-600 font-bold">
                Preparing the post...
              </p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-rose-800 text-xs font-bold font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-none" />
                <span>{loadError}</span>
              </div>
              <button
                type="button"
                onClick={load}
                className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200 flex items-center gap-1 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}

          {!isLoading && !loadError && status && !status.enabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-amber-900">
              <div className="flex items-center gap-2 text-xs font-bold font-mono">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-none" />
                Social publishing is unavailable
              </div>
              <p className="text-xs">{status.reason}</p>
              <p className="text-[11px] text-amber-800 font-mono">
                The article is published on the web regardless — only the social
                post was skipped.
              </p>
            </div>
          )}

          {/* Outcome, one line per network */}
          {results && (
            <div className="space-y-2">
              {results.map((share) => {
                const platform = share.platform.toLowerCase() as SocialPlatform;
                const ui = PLATFORM_UI[platform];
                const ok = share.status !== "FAILED";
                return (
                  <div
                    key={share.id}
                    className={`rounded-xl p-3 border text-xs font-mono flex items-center justify-between gap-3 ${
                      ok
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-none" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-600 flex-none" />
                      )}
                      <span className="font-bold">
                        {ui?.label ?? share.platform}
                      </span>
                      <span className="truncate">
                        {ok
                          ? share.status === "SCHEDULED"
                            ? "scheduled"
                            : "live"
                          : share.errorMessage}
                      </span>
                    </div>
                    {share.permalink && (
                      <a
                        href={share.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold underline flex-none"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {showComposer && (
            <>
              {alreadyShared && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono flex items-start gap-2">
                  <Instagram className="h-3.5 w-3.5 text-fuchsia-600 flex-none mt-0.5" />
                  <span>
                    This article has already been shared
                    {draft?.previousShares[0]?.createdAt
                      ? ` on ${new Date(draft.previousShares[0].createdAt).toLocaleString()}`
                      : ""}
                    .
                  </span>
                </div>
              )}

              {status.reason && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-900 text-xs font-bold font-mono">
                  <AlertTriangle className="h-4 w-4 flex-none text-amber-600 mt-0.5" />
                  <span>{status.reason}</span>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-800 text-xs font-bold font-mono">
                  <AlertTriangle className="h-4 w-4 flex-none text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Where it goes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 font-mono">
                  Post to
                </label>
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  {(Object.keys(PLATFORM_UI) as SocialPlatform[]).map(
                    (platform) => {
                      const ui = PLATFORM_UI[platform];
                      const connected = accountsByPlatform[platform].length > 0;
                      const selected = platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          disabled={!connected}
                          title={
                            connected
                              ? undefined
                              : `No ${ui.label} account is connected to the social-media module.`
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            selected
                              ? ui.selected
                              : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                          }`}
                        >
                          <ui.Icon className="h-3.5 w-3.5" /> {ui.label}
                        </button>
                      );
                    },
                  )}
                </div>
                {needsVideo && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    YouTube uploads a video, not a picture: the poster becomes
                    its thumbnail.
                  </p>
                )}
              </div>

              {/* What gets posted: the branded poster, or the bare article image */}
              <div className="flex flex-wrap items-center gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setUseBrandedPoster(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    useBrandedPoster
                      ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
                      : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <LayoutTemplate className="h-3.5 w-3.5" /> Edition TV poster
                </button>
                <button
                  type="button"
                  onClick={() => setUseBrandedPoster(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    !useBrandedPoster
                      ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
                      : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Article image only
                </button>

                {useBrandedPoster && (
                  <div className="flex items-center gap-1 ml-auto">
                    {(Object.keys(POSTER_FORMATS) as PosterFormatId[]).map(
                      (id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setFormat(id)}
                          title={POSTER_FORMATS[id].description}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                            format === id
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                          }`}
                        >
                          {POSTER_FORMATS[id].label}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5">
                {/* Preview */}
                <div className="space-y-2">
                  <div
                    className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950"
                    style={{
                      width: PREVIEW_WIDTH,
                      height: PREVIEW_WIDTH * (layout.height / layout.width),
                    }}
                  >
                    {useBrandedPoster ? (
                      <div
                        style={{
                          transform: `scale(${previewScale})`,
                          transformOrigin: "top left",
                          width: `${layout.width}px`,
                          height: `${layout.height}px`,
                        }}
                      >
                        <ArticlePosterCanvas
                          ref={posterRef}
                          headline={draft?.headline ?? headline ?? ""}
                          description={draft?.summary}
                          categoryLabel={(
                            draft?.category || "NEWS"
                          ).toUpperCase()}
                          imageUrl={posterImage}
                          articleUrl={draft?.articleUrl ?? ""}
                          adjustments={adjustments}
                          format={format}
                        />
                      </div>
                    ) : imageUrl.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Post preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500 font-mono px-4 text-center">
                        No image yet
                      </div>
                    )}

                    {isPreparingPoster && (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-fuchsia-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono text-center">
                    {useBrandedPoster
                      ? `${layout.width} × ${layout.height} poster`
                      : "Article image as-is"}
                  </p>
                  {useBrandedPoster &&
                    !layout.instagramSafe &&
                    platforms.includes("instagram") && (
                      <p className="text-[10px] text-amber-700 font-mono text-center leading-relaxed">
                        Instagram crops anything taller than 4:5 in the feed.
                        Switch to 4:5 to post it whole.
                      </p>
                    )}
                  {!useBrandedPoster && platforms.includes("instagram") && (
                    <p className="text-[10px] text-amber-700 font-mono text-center leading-relaxed">
                      Instagram fetches this image itself and crops it to fit;
                      the poster is what keeps a wide picture whole.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Source image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-mono">
                        <ImageIcon className="h-3.5 w-3.5 text-fuchsia-600" />
                        {useBrandedPoster
                          ? "Poster background"
                          : "Poster image"}
                      </label>
                      {useBrandedPoster && (
                        <button
                          type="button"
                          onClick={() => setShowAdjustments((open) => !open)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            showAdjustments
                              ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
                              : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                          }`}
                        >
                          <Sliders className="h-3 w-3" /> Adjust image
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={imageUrl.startsWith("data:") ? "" : imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={
                          imageUrl.startsWith("data:")
                            ? "Uploaded image"
                            : "https://..."
                        }
                        className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-fuchsia-500"
                      />
                      {useBrandedPoster && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Use a picture from this computer"
                            className="px-2.5 py-2 bg-white text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition flex-none"
                          >
                            <Upload className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                    {posterImageError && (
                      <p className="text-[11px] text-rose-700 font-mono">
                        {posterImageError}
                      </p>
                    )}
                    {draft?.imageProblem && !imageUrl.trim() && (
                      <p className="text-[11px] text-rose-700 font-mono">
                        {draft.imageProblem}
                      </p>
                    )}
                    {!useBrandedPoster && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        The network fetches this itself, so it must be reachable
                        publicly over https.
                      </p>
                    )}
                  </div>

                  {/* The editing panel: where in the picture the poster looks, and how it is lit */}
                  {useBrandedPoster && showAdjustments && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                      {slider("Zoom", "zoom", 100, 300)}
                      {slider("Horizontal", "posX", 0, 100)}
                      {slider("Vertical", "posY", 0, 100)}
                      {slider("Brightness", "brightness", 40, 160)}
                      {slider("Contrast", "contrast", 40, 200)}
                      <button
                        type="button"
                        onClick={() =>
                          setAdjustments(DEFAULT_BACKGROUND_ADJUSTMENTS)
                        }
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 font-mono"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset
                      </button>
                    </div>
                  )}

                  {/* YouTube needs a video of its own and a title */}
                  {needsVideo && (
                    <div className="space-y-2 border border-red-100 bg-red-50/50 rounded-xl p-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-mono">
                        <Film className="h-3.5 w-3.5 text-red-600" /> YouTube
                        video URL
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://...mp4"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-500"
                      />
                      <p className="text-[10px] text-slate-500 font-mono">
                        An article carries no video of its own, so name the file
                        to upload. Public https.
                      </p>
                      <label className="block text-xs font-bold text-slate-700 font-mono pt-1">
                        Video title
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={youtubeTitle}
                        onChange={(e) => setYoutubeTitle(e.target.value)}
                        placeholder={draft?.headline ?? "Title"}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  )}

                  {/* Caption */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 font-mono">
                        Caption
                      </label>
                      <span
                        className={`text-[10px] font-bold font-mono ${
                          captionOverBy > 0 ? "text-rose-600" : "text-slate-400"
                        }`}
                      >
                        {caption.length} / {captionLimit}
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-fuchsia-500 leading-relaxed"
                    />
                    {captionOverBy > 0 && (
                      <p className="text-[11px] text-rose-700 font-mono">
                        {captionOverBy} characters over Instagram&apos;s limit.
                      </p>
                    )}
                  </div>

                  {/* One account picker per selected network that has a choice to make */}
                  {platforms.map((platform) => {
                    const accounts = accountsByPlatform[platform];
                    if (accounts.length <= 1) return null;
                    return (
                      <div key={platform} className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 font-mono">
                          {PLATFORM_UI[platform].label} account
                        </label>
                        <select
                          value={accountIds[platform] ?? ""}
                          onChange={(e) =>
                            setAccountIds((current) => ({
                              ...current,
                              [platform]: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-fuchsia-500"
                        >
                          {accounts.map((account) => (
                            <option
                              key={`${account.platform}:${account.id}`}
                              value={account.id}
                            >
                              {account.username
                                ? `@${account.username}`
                                : account.id}
                              {account.ready ? "" : " (no access token)"}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur">
          {progress && (
            <span className="text-[11px] text-slate-500 font-mono mr-auto">
              {progress}
            </span>
          )}
          {!progress && videoMissing && (
            <span className="text-[11px] text-amber-700 font-mono mr-auto">
              YouTube needs a video URL.
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl border border-slate-200 transition disabled:opacity-50"
          >
            {published ? "Done" : "Skip for now"}
          </button>

          {needsConfirmation && (
            <button
              type="button"
              onClick={() => handlePublish(true)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
            >
              Post again anyway
            </button>
          )}

          {!results && status?.enabled && !needsConfirmation && (
            <button
              type="button"
              onClick={() => handlePublish(false)}
              disabled={!canSubmit}
              className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Instagram className="h-4 w-4" />
                  {platforms.length === 0
                    ? "Pick a network"
                    : `Publish to ${platforms.map((p) => PLATFORM_UI[p].label).join(" + ")}`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
