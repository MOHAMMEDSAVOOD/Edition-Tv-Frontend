"use client";
import { useState } from "react";
import { Upload, Search, Image as ImageIcon, Film } from "lucide-react";

interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  size: string;
  uploaded: string;
  aspectRatio: string;
}

const DEMO_ASSETS: MediaAsset[] = [
  { id: "m-1", name: "geneva-climate-summit-keynote.jpg", type: "image", size: "2.4 MB", uploaded: "10 mins ago", aspectRatio: "16:9" },
  { id: "m-2", name: "ai-chip-fabrication-cleanroom.jpg", type: "image", size: "3.8 MB", uploaded: "1 hour ago", aspectRatio: "16:9" },
  { id: "m-3", name: "federal-reserve-building-dc.jpg", type: "image", size: "1.9 MB", uploaded: "3 hours ago", aspectRatio: "4:3" },
  { id: "m-4", name: "quantum-lab-dilution-refrigerator.jpg", type: "image", size: "4.1 MB", uploaded: "Yesterday", aspectRatio: "16:9" },
  { id: "m-5", name: "press-conference-b-roll.mp4", type: "video", size: "48.2 MB", uploaded: "Yesterday", aspectRatio: "16:9" },
];

export function MediaLibraryClient() {
  const [assets, setAssets] = useState<MediaAsset[]>(DEMO_ASSETS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [isUploading, setIsUploading] = useState(false);

  const filtered = assets.filter((a) => {
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || a.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newAsset: MediaAsset = {
        id: `m-${Date.now()}`,
        name: "newly-uploaded-asset-cover.jpg",
        type: "image",
        size: "2.1 MB",
        uploaded: "Just now",
        aspectRatio: "16:9",
      };
      setAssets([newAsset, ...assets]);
      setIsUploading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Upload & Search Toolbar */}
      <div className="bg-card border border-border p-4 rounded-md flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets by filename..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-md border border-border font-semibold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${filterType === "all" ? "bg-indigo-600 text-white" : "text-muted-foreground"}`}
            >
              All Assets
            </button>
            <button
              onClick={() => setFilterType("image")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${filterType === "image" ? "bg-indigo-600 text-white" : "text-muted-foreground"}`}
            >
              Images
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${filterType === "video" ? "bg-indigo-600 text-white" : "text-muted-foreground"}`}
            >
              Videos
            </button>
          </div>
        </div>

        <button
          onClick={handleSimulatedUpload}
          disabled={isUploading}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-md transition-colors shadow-xs disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? "Uploading Asset..." : "Upload Asset"}
        </button>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((asset) => (
          <div key={asset.id} className="bg-card border border-border rounded-md overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xs">
            <div className="aspect-video bg-muted/60 relative flex items-center justify-center border-b border-border">
              {asset.type === "video" ? (
                <Film className="h-8 w-8 text-indigo-400" />
              ) : (
                <ImageIcon className="h-8 w-8 text-indigo-400" />
              )}
              <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                {asset.aspectRatio}
              </span>
            </div>

            <div className="p-3 space-y-1">
              <span className="font-bold text-xs text-foreground line-clamp-1 block" title={asset.name}>
                {asset.name}
              </span>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>{asset.size}</span>
                <span>{asset.uploaded}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
