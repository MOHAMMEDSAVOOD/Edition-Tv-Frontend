"use client";
import { useState } from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: string;
}

export function ImageStudioClient() {
  const [gallery] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Editorial Photo");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // TODO: wire to an image generation backend. The previous version added a gallery entry after
    // a timer without generating anything, so the studio appeared to produce assets that never
    // existed.
    setIsGenerating(false);
    setError("Image generation is not connected to a provider yet, so no asset can be produced.");
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Prompt Form Panel */}
      <form onSubmit={handleGenerate} className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="h-4 w-4 text-purple-400 font-bold" /> Generate Visual Asset
        </h3>

        <div className="space-y-1">
          <label className="font-bold text-muted-foreground">Image Generation Prompt</label>
          <input
            type="text"
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Futuristic quantum laboratory with illuminated cooling tubes, editorial photography 8k..."
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-muted-foreground">Visual Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-1.5 font-semibold text-xs"
            >
              <option value="Editorial Photo">Editorial Photo (Reuters / Bloomberg)</option>
              <option value="3D Render">3D Tech Render</option>
              <option value="Infographic Vector">Infographic Vector</option>
              <option value="Cinematic Illustration">Cinematic Illustration</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-muted-foreground">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-1.5 font-semibold text-xs"
            >
              <option value="16:9">16:9 Landscape (Article Cover)</option>
              <option value="4:3">4:3 Standard Grid</option>
              <option value="1:1">1:1 Square</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-md text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" /> {isGenerating ? "Generating..." : "Generate AI Image"}
        </button>

        {error && (
          <p className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs text-rose-400 font-mono">
            {error}
          </p>
        )}
      </form>

      {/* Generated Gallery Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-foreground flex items-center justify-between border-b border-border pb-2">
          <span>Generated Asset Gallery ({gallery.length})</span>
        </h3>

        {gallery.length === 0 && (
          <p className="text-muted-foreground font-mono text-[11px] py-8 text-center">
            No generated assets.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((img) => (
            <div key={img.id} className="bg-card border border-border rounded-md overflow-hidden space-y-2 p-3 shadow-xs">
              <div className="aspect-video bg-purple-950/20 border border-purple-500/30 rounded flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="h-10 w-10 text-purple-400/60" />
                <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                  {img.aspectRatio}
                </span>
              </div>
              <p className="font-bold text-xs text-foreground line-clamp-2">{img.prompt}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
                <span>{img.style}</span>
                <span>{img.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
