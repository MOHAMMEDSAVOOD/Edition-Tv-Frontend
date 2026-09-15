"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Instagram,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  socialService,
  SocialMediaStatus,
  SocialShare,
  SocialShareDraft,
} from "@/services/socialService";

interface InstagramPublishModalProps {
  /** The published article to post. */
  articleId: string;
  /** Shown in the header while the draft loads. */
  headline?: string;
  onClose: () => void;
  /** Called once the post is live, so the caller can refresh its own view. */
  onPublished?: (share: SocialShare) => void;
}

const newIdempotencyKey = (articleId: string) => `ig-${articleId}-${Date.now()}`;

/**
 * The step after an article goes live: put it on Instagram.
 *
 * The backend prepares the caption and names the poster image, and the backend is what talks to the
 * social-media module — this component only ever calls Edition's own API.
 */
export function InstagramPublishModal({
  articleId,
  headline,
  onClose,
  onPublished,
}: InstagramPublishModalProps) {
  const [status, setStatus] = useState<SocialMediaStatus | null>(null);
  const [draft, setDraft] = useState<SocialShareDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [accountId, setAccountId] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => newIdempotencyKey(articleId));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set when the backend refused because the article is already on Instagram (HTTP 422). */
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [result, setResult] = useState<SocialShare | null>(null);

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
      const firstReady = statusData.accounts.find((a) => a.ready) ?? statusData.accounts[0];
      setAccountId(firstReady?.id ?? "");
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load the Instagram post for this article.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    load();
  }, [load]);

  const captionLimit = status?.captionLimit ?? 2200;
  const captionOverBy = caption.length - captionLimit;
  const alreadyShared = (draft?.previousShares ?? []).some((s) => s.status === "PUBLISHED");
  const canSubmit =
    !isSubmitting && caption.trim().length > 0 && imageUrl.trim().length > 0 && captionOverBy <= 0;

  const handlePublish = async (force: boolean) => {
    setIsSubmitting(true);
    setError(null);
    setNeedsConfirmation(false);

    // A forced retry is a deliberately different post, so it gets its own key rather than
    // matching the request the backend already refused.
    const key = force ? newIdempotencyKey(articleId) : idempotencyKey;
    if (force) setIdempotencyKey(key);

    try {
      const share = await socialService.shareToInstagram({
        articleId,
        caption: caption.trim(),
        imageUrl: imageUrl.trim(),
        link: draft?.articleUrl,
        instagramAccountId: accountId || undefined,
        idempotencyKey: key,
        force,
      });
      setResult(share);
      if (share.status === "FAILED") {
        setError(share.errorMessage ?? "Instagram rejected the post.");
      } else {
        onPublished?.(share);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setNeedsConfirmation(true);
        setError(err.details.detail || "This article is already on Instagram.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to publish to Instagram.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const published = result && result.status !== "FAILED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-fuchsia-50 text-fuchsia-600 rounded-xl border border-fuchsia-100">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 font-heading">
                Share to Instagram
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
              <p className="text-xs text-slate-600 font-bold">Preparing the Instagram post...</p>
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

          {/* Sharing switched off for this environment: say so plainly instead of
              offering a button that cannot work. */}
          {!isLoading && !loadError && status && !status.enabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-amber-900">
              <div className="flex items-center gap-2 text-xs font-bold font-mono">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-none" />
                Instagram publishing is unavailable
              </div>
              <p className="text-xs">{status.reason}</p>
              <p className="text-[11px] text-amber-800 font-mono">
                The article is published on the web regardless — only the Instagram post was skipped.
              </p>
            </div>
          )}

          {/* Success */}
          {published && result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 font-mono">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {result.status === "SCHEDULED" ? "Scheduled on Instagram" : "Live on Instagram"}
              </div>
              {result.permalink && (
                <a
                  href={result.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 hover:text-fuchsia-900 underline"
                >
                  View the post <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {!isLoading && !loadError && status?.enabled && !published && (
            <>
              {/* Prior shares: the composer says so rather than letting a second post slip out. */}
              {alreadyShared && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono flex items-start gap-2">
                  <Instagram className="h-3.5 w-3.5 text-fuchsia-600 flex-none mt-0.5" />
                  <span>
                    This article has already been posted to Instagram
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

              {/* Poster image */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-mono">
                  <ImageIcon className="h-3.5 w-3.5 text-fuchsia-600" /> Poster image
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-fuchsia-500"
                />
                {draft?.imageProblem && !imageUrl.trim() && (
                  <p className="text-[11px] text-rose-700 font-mono">{draft.imageProblem}</p>
                )}
                {imageUrl.trim() && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Instagram poster preview"
                      className="h-20 w-20 object-cover rounded-lg border border-slate-200 flex-none bg-slate-100"
                    />
                    <p className="text-[10px] text-slate-500 font-mono">
                      Instagram fetches this image itself, so it has to be reachable publicly over
                      https.
                    </p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 font-mono">Caption</label>
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      captionOverBy > 0 ? "text-rose-600" : "text-slate-400"
                    }`}
                  >
                    {caption.length} / {captionLimit}
                  </span>
                </div>
                <textarea
                  rows={9}
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

              {/* Account: only worth a control when there is a choice to make. */}
              {status.accounts.length > 1 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 font-mono">
                    Post as
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-fuchsia-500"
                  >
                    {status.accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.username ? `@${account.username}` : account.id}
                        {account.ready ? "" : " (no access token)"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {status.accounts.length === 1 && status.accounts[0].username && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Posting as @{status.accounts[0].username}.
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur">
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

          {!published && status?.enabled && !needsConfirmation && (
            <button
              type="button"
              onClick={() => handlePublish(false)}
              disabled={!canSubmit}
              className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Posting to Instagram...
                </>
              ) : (
                <>
                  <Instagram className="h-4 w-4" /> Publish to Instagram
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
