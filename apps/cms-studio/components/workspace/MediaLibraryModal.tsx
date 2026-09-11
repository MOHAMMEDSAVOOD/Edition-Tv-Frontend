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

import { apiClient } from "@/lib/api-client";

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
      const data = await apiClient.get<any>(`/media`);
      const list: MediaAsset[] = (Array.isArray(data) ? data : []).map((m: any) => ({
        id: m.id,
        url: m.url || m.storageUrl || "",
        filename: m.filename || m.storageKey || "image.jpg",
        title: m.filename || m.caption || "Editorial Media",
        caption: m.caption || "",
        credit: m.credit || "",
        altText: m.altText || "",
        contentType: m.mimeType || "image/jpeg",
      }));
      setMediaAssets(list);
      if (list.length > 0 && !selectedAsset) {
        setSelectedAsset(list[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to Media API");
    } finally {
      setLoading(false);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  if (!isOpen) return null;

  const filteredAssets = mediaAssets.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const handleRegisterMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return setError("Media URL is required");
    setUploading(true);
    setError(null);
    try {
      const created = await apiClient.post<any>(`/media`, {
        filename: uploadFilename.trim() || "editorial-image.jpg",
        url: uploadUrl.trim(),
        mediaType: "IMAGE",
        altText: uploadAltText.trim() || null,
        caption: uploadCaption.trim() || null,
        credit: uploadCredit.trim() || null,
      });
      const newAsset: MediaAsset = {
        id: created.id,
        url: created.url || created.storageUrl,
        filename: created.filename || "image.jpg",
        title: created.filename || "Uploaded Asset",
        caption: created.caption || "",
        credit: created.credit || "",
        altText: created.altText || "",
        contentType: created.mimeType || "image/jpeg",
      };

      setMediaAssets([newAsset, ...mediaAssets]);
      setSelectedAsset(newAsset);
      setShowUploadForm(false);
      setUploadUrl("");
      setUploadFilename("");
      setUploadCaption("");
      setUploadCredit("");
      setUploadAltText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-foreground">Editorial Media Asset Library</h2>
            <span className="text-xs text-muted-foreground font-mono">({mediaAssets.length} assets persisted)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
            >
              <Upload className="h-3.5 w-3.5" />
              {showUploadForm ? "Back to Library" : "Add Media Asset"}
            </button>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-none" /> {error}
          </div>
        )}

        {showUploadForm ? (
          <form onSubmit={handleRegisterMedia} className="p-6 space-y-4 max-w-xl mx-auto w-full text-xs">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Register New Editorial Media Asset</h3>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Image URL *</label>
              <input
                type="url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Filename</label>
                <input
                  type="text"
                  value={uploadFilename}
                  onChange={(e) => setUploadFilename(e.target.value)}
                  placeholder="press_photo.jpg"
                  className="w-full bg-background border border-border rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Photographer / Credit</label>
                <input
                  type="text"
                  value={uploadCredit}
                  onChange={(e) => setUploadCredit(e.target.value)}
                  placeholder="Reuters / Press Pool"
                  className="w-full bg-background border border-border rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Caption</label>
              <textarea
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                rows={2}
                placeholder="Editorial caption description..."
                className="w-full bg-background border border-border rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Alt Text (Accessibility)</label>
              <input
                type="text"
                value={uploadAltText}
                onChange={(e) => setUploadAltText(e.target.value)}
                placeholder="Descriptive image alt text"
                className="w-full bg-background border border-border rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredAssets.map((asset) => {
                      const active = selectedAsset?.id === asset.id;
                      return (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`group relative aspect-video rounded-xl overflow-hidden border transition text-left ${
                            active ? "border-2 border-red-600 ring-2 ring-red-500/20" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {asset.url ? (
                            <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                            <span className="text-[10px] font-bold text-white truncate font-mono">{asset.filename}</span>
                          </div>
                          {active && (
                            <div className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow-2xs">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Column */}
            <div className="md:col-span-4 p-4 bg-slate-50/50 flex flex-col justify-between min-h-0 space-y-4 text-xs font-mono">
              {selectedAsset ? (
                <div className="space-y-3 overflow-y-auto">
                  {selectedAsset.url ? (
                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <img src={selectedAsset.url} alt={selectedAsset.title} className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Filename</span>
                    <div className="font-bold text-slate-900 break-all">{selectedAsset.filename}</div>
                  </div>
                  {selectedAsset.caption && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Caption</span>
                      <div className="text-slate-700 font-sans text-[11px] leading-relaxed">{selectedAsset.caption}</div>
                    </div>
                  )}
                  {selectedAsset.credit && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Credit</span>
                      <div className="text-red-600 font-bold">{selectedAsset.credit}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">URL</span>
                    <div className="text-[10px] text-slate-500 truncate select-all">{selectedAsset.url}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-12">Select an asset to view details</div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1.5 text-slate-500 font-bold hover:text-slate-900 text-xs">Cancel</button>
                <button
                  disabled={!selectedAsset}
                  onClick={() => {
                    if (selectedAsset) {
                      onSelectMedia(selectedAsset);
                      onClose();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl transition shadow-2xs disabled:opacity-40 font-sans text-xs"
                >
                  Select Media
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
