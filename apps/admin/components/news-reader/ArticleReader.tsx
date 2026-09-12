"use client";

import React from "react";
import {
  ExternalLink,
  Star,
  CheckCircle2,
  Circle,
  FileText,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  Music,
  Video,
  Volume2,
  Globe,
} from "lucide-react";
import { WireItem } from "./ArticleList";
import { cn } from "@/lib/utils";

interface ArticleReaderProps {
  item: WireItem | null;
  onToggleRead: (item: WireItem) => void;
  onToggleStar: (item: WireItem) => void;
  onConvertToStory: (item: WireItem) => void;
  onAssignToDesk: (item: WireItem) => void;
  onPublishToPublicWeb?: (item: WireItem) => void;
  onUnpublishFromPublicWeb?: (item: WireItem) => void;
  onViewPublicationDetails?: (item: WireItem) => void;
}

export function ArticleReader({
  item,
  onToggleRead,
  onToggleStar,
  onConvertToStory,
  onAssignToDesk,
  onPublishToPublicWeb,
  onUnpublishFromPublicWeb,
  onViewPublicationDetails,
}: ArticleReaderProps) {
  if (!item) {
    return (
      <div className="flex-1 h-full bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-sans">
        <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 font-serif">No Article Selected</h3>
        <p className="text-xs max-w-xs mt-1.5 text-slate-500 font-sans leading-relaxed">
          Select an article from the wire stream on the left to read full contents and review newsroom actions.
        </p>
      </div>
    );
  }

  const pubDateFormatted = item.pubDate
    ? new Date(item.pubDate).toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Unknown Publication Date";

  return (
    <div className="flex-1 h-full bg-slate-50 flex flex-col overflow-hidden font-sans">
      {/* Top Article Toolbar */}
      <div className="p-3 bg-white border-b border-slate-200/80 flex items-center justify-between flex-none gap-2 flex-wrap shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleRead(item)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border font-sans",
              item.read
                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                : "bg-red-600 border-red-500 text-white shadow-2xs"
            )}
          >
            {item.read ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Read
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5 fill-current text-white" /> Mark Read
              </>
            )}
          </button>

          <button
            onClick={() => onToggleStar(item)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition font-sans",
              item.starred
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", item.starred ? "fill-amber-500 text-amber-500" : "")} />
            {item.starred ? "Starred" : "Star"}
          </button>
        </div>

        {/* Editorial Action Buttons */}
        <div className="flex items-center gap-2">
          {item.state === "PUBLISHED" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => (onViewPublicationDetails ? onViewPublicationDetails(item) : onPublishToPublicWeb?.(item))}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl shadow-2xs transition"
                title="View Live Public Web Publication Details"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-600" /> Published Live ✓
              </button>
              {onUnpublishFromPublicWeb && (
                <button
                  onClick={() => onUnpublishFromPublicWeb(item)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-700 text-[11px] font-semibold rounded-xl transition"
                  title="Unpublish / Pause from Edition TV Public Web"
                >
                  Unpublish
                </button>
              )}
            </div>
          ) : (
            onPublishToPublicWeb && (
              <button
                onClick={() => onPublishToPublicWeb(item)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition font-sans"
                title="Publish Live to Edition TV Public Web Platform"
              >
                <Globe className="h-3.5 w-3.5 text-white" /> Publish to Public Web
              </button>
            )
          )}

          <button
            onClick={() => onAssignToDesk(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition font-sans"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-slate-600" /> Assign Desk
          </button>

          {item.state === "CONVERTED_TO_STORY" ? (
            <a
              href="http://localhost:5001/stories"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs transition font-sans"
              title="Open Story in CMS Studio Editorial Workspace"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Open in CMS Studio
            </a>
          ) : (
            <button
              onClick={() => onConvertToStory(item)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs transition font-sans"
              title="Convert Wire Candidate to CMS Studio Draft Story"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Convert to Story
            </button>
          )}

          {item.canonicalUrl && (
            <a
              href={item.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 transition"
              title="Open Original Source URL"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Source Badge & Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider font-mono">
              {item.sourceId || item.feedId}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase border border-slate-200">
              STATE: {item.state}
            </span>
          </div>

          <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight font-serif tracking-tight">
            {item.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono pt-1 border-b border-slate-200 pb-4">
            {item.author && (
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <User className="h-3.5 w-3.5 text-slate-400" /> {item.author}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> {pubDateFormatted}
            </span>
          </div>
        </div>

        {/* Media Thumbnail */}
        {item.mediaThumbnailUrl ? (
          <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 max-h-96 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.mediaThumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Media Enclosure Player */}
        {item.enclosureUrl ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 font-mono">
              {item.enclosureType?.startsWith("audio") ? (
                <Music className="h-4 w-4 text-red-600" />
              ) : item.enclosureType?.startsWith("video") ? (
                <Video className="h-4 w-4 text-red-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-red-600" />
              )}
              <span>Media Attachment: {item.enclosureType || "Media Link"}</span>
            </div>

            {item.enclosureType?.startsWith("audio") ? (
              <audio controls src={item.enclosureUrl} className="w-full h-10 mt-2" />
            ) : item.enclosureType?.startsWith("video") ? (
              <video controls src={item.enclosureUrl} className="w-full max-h-64 rounded-xl mt-2" />
            ) : (
              <a
                href={item.enclosureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-600 hover:underline flex items-center gap-1 pt-1 font-semibold"
              >
                <ExternalLink className="h-3 w-3" /> Download Enclosure Attachment
              </a>
            )}
          </div>
        ) : null}

        {/* Article Body Content / HTML */}
        <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4 font-serif">
          {item.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
          ) : (
            <p className="text-slate-800 whitespace-pre-line text-sm leading-relaxed">{item.summary}</p>
          )}
        </div>

        {/* Copyright Notice */}
        {item.copyright && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 italic font-mono">
            © Legal Copyright & Rights Notice: {item.copyright}
          </div>
        )}
      </div>
    </div>
  );
}
