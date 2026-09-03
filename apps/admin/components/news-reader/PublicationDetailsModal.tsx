"use client";

import React, { useEffect, useState } from "react";
import { WireItem } from "./ArticleList";
import { ExternalLink, CheckCircle } from "lucide-react";

interface PublicationDetailsModalProps {
  item: WireItem;
  onClose: () => void;
}

interface PublicationDetails {
  id?: string;
  wireItemId?: string;
  publicArticleId?: string;
  status?: string;
  publicUrl?: string;
  publishedAt?: string;
  siteId?: string;
  categoryId?: string;
  placement?: string;
  visibility?: string;
  articleType?: string;
  slug?: string;
  authorId?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  publisherName?: string;
}

export function PublicationDetailsModal({ item, onClose }: PublicationDetailsModalProps) {
  const [details, setDetails] = useState<PublicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/v1/newsroom/wire-items/${item.id}/publication-details`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (e) {
        console.error("Failed to fetch publication details", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [item.id]);

  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const publicUrl = details?.publicUrl || `http://localhost:5002/articles/${slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-900 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-emerald-700 font-heading">Published to Public Web</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Selected Article Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Published Headline</span>
          <p className="text-xs font-bold text-slate-900 line-clamp-2 font-serif">{item.title}</p>
        </div>

        {/* Details Grid */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
            <span className="animate-spin text-sm">⏳</span> Loading publication details...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Status</span>
              <span className="font-bold text-emerald-700 font-mono">LIVE / PUBLISHED</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Section</span>
              <span className="font-bold text-slate-900">{details?.categoryId || "Sports"}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Placement</span>
              <span className="font-semibold text-slate-900 capitalize">{details?.placement || "standard"}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Visibility</span>
              <span className="font-semibold text-slate-900 capitalize">{details?.visibility || "public"}</span>
            </div>

            <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Live Public Web URL</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1.5 break-all font-mono"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-none" /> {publicUrl}
              </a>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition"
          >
            <ExternalLink className="h-4 w-4" /> Open Public Article
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl border border-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
