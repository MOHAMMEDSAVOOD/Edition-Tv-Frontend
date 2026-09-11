"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Upload, Image as ImageIcon, Search, Check, RefreshCw, AlertCircle } from "lucide-react";

export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  title: string;
  caption?: string;
  credit?: string;
  altText?: string;
  contentType?: string;
  filesize?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaAsset) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectMedia,
}: MediaLibraryModalProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Media Upload Form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCredit, setUploadCredit] = useState("");
  const [uploadAltText, setUploadAltText] = useState("");

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/media`);
      if (!res.ok) throw new Error(`Failed to load media (${res.status})`);
      const data = await res.json();
      const list: MediaAsset[] = (Array.isArray(data) ? data : []).map((m: { id: string; url?: string; storageUrl?: string; filename?: string; storageKey?: string; caption?: string; credit?: string; altText?: string; mediaType?: string; mimeType?: string; contentType?: string; filesize?: string; createdAt?: string }) => ({
        id: m.id,
        url: m.url || m.storageUrl || "",
        filename: m.filename || m.storageKey || "image.jpg",
        title: m.filename || m.caption || "Editorial Media",
        caption: m.caption || "",
        credit: m.credit || "",
        altText: m.altText || "",
        contentType: m.contentType || "image/jpeg",
        filesize: m.filesize || "1.2 MB",
      }));
      setMediaAssets(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load media assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return alert("Image URL is required");

    setUploading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("edition_access_token") : null;
      const res = await fetch(`${API_BASE}/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          url: uploadUrl,
          filename: uploadFilename || "uploaded_asset.jpg",
          caption: uploadCaption,
          credit: uploadCredit,
          altText: uploadAltText,
          contentType: "image/jpeg",
        }),
      });

      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      setShowUploadForm(false);
      setUploadUrl("");
      setUploadFilename("");
      setUploadCaption("");
      setUploadCredit("");
      setUploadAltText("");
      await fetchMedia();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Media creation failed");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelectMedia(selectedAsset);
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredAssets = mediaAssets.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.caption && a.caption.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-sm font-serif">Editorial Media Library</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-2xs font-sans"
            >
              <Upload className="h-3.5 w-3.5" />
              {showUploadForm ? "Back to Gallery" : "+ Register New Media"}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-xl">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-700 px-6 py-2 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" /> {error}
          </div>
        )}

        {/* Content Body */}
        {showUploadForm ? (
          <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 font-sans text-xs overflow-y-auto">
            <h4 className="font-bold text-slate-900 text-sm font-serif">Register Media Asset URL</h4>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Image Storage URL *</label>
              <input
                type="url"
                required
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Filename / Asset Identifier</label>
                <input
                  type="text"
                  value={uploadFilename}
                  onChange={(e) => setUploadFilename(e.target.value)}
                  placeholder="photo_press_2026.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Photographer / Source Credit</label>
                <input
                  type="text"
                  value={uploadCredit}
                  onChange={(e) => setUploadCredit(e.target.value)}
                  placeholder="Reuters / AFP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Caption</label>
              <textarea
                rows={2}
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Editorial description of image..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-500 resize-none font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Alt Text (Accessibility)</label>
              <input
                type="text"
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                placeholder="Descriptive image alt text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowUploadForm(false)} className="px-3 py-1.5 text-slate-500 font-bold hover:text-slate-900 text-xs">Cancel</button>
              <button type="submit" disabled={uploading} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl transition shadow-2xs text-xs font-sans">
                {uploading ? "Saving..." : "Save Media Asset"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
            {/* Grid Column */}
            <div className="md:col-span-8 p-4 flex flex-col min-h-0 border-r border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search media assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-red-500 font-sans text-slate-900"
                  />
                </div>
                <button onClick={fetchMedia} className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-video bg-slate-100 rounded-xl animate-pulse border border-slate-200/60" />
                    ))}
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-mono space-y-2">
                    <ImageIcon className="h-8 w-8 mx-auto opacity-30 text-slate-500" />
                    <p className="font-bold text-slate-700">No media assets available.</p>
                    <button onClick={() => setShowUploadForm(true)} className="text-red-600 font-bold hover:underline">
                      + Add New Media Asset
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer group transition ${
                            isSelected ? "border-2 border-red-600 ring-2 ring-red-500/20" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {asset.url ? (
                            <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                            <p className="text-[10px] font-bold text-white truncate font-mono">{asset.title}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Inspector Column */}
            <div className="md:col-span-4 p-4 flex flex-col justify-between bg-slate-50/50 min-h-0 space-y-4 font-mono text-xs">
              {selectedAsset ? (
                <div className="space-y-3 overflow-y-auto min-h-0">
                  {selectedAsset.url ? (
                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <img src={selectedAsset.url} alt={selectedAsset.title} className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">Filename</label>
                    <p className="text-slate-900 font-bold truncate">{selectedAsset.filename}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">Photographer / Credit</label>
                    <p className="text-slate-700">{selectedAsset.credit || "—"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">Caption</label>
                    <p className="text-slate-700 text-[11px] font-sans leading-relaxed">{selectedAsset.caption || "—"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">Alt Text</label>
                    <p className="text-slate-700 text-[11px] font-sans">{selectedAsset.altText || "—"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs p-4">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-30 text-slate-500" />
                  <p>Select a media asset on the left to inspect metadata or insert into article.</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 flex-none">
                <button type="button" onClick={onClose} className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white transition">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedAsset}
                  onClick={handleConfirmSelection}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-2xs disabled:opacity-40 transition font-sans"
                >
                  Insert Selected Media
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
