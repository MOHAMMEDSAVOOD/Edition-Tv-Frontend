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

const INITIAL_GENERATED: GeneratedImage[] = [
  { id: "img-1", prompt: "Zurich Quantum Computer dilution refrigerator, sleek editorial photography, cinematic lighting", style: "Editorial Photo", aspectRatio: "16:9", createdAt: "10 mins ago" },
  { id: "img-2", prompt: "Abstract semiconductor microchip architecture with glowing blue silicon traces, 3D render", style: "3D Render", aspectRatio: "16:9", createdAt: "1 hour ago" },
  { id: "img-3", prompt: "Geneva climate conference hall with world flags, journalistic style photo", style: "Editorial Photo", aspectRatio: "4:3", createdAt: "Yesterday" },
];

export function ImageStudioClient() {
  const [gallery, setGallery] = useState<GeneratedImage[]>(INITIAL_GENERATED);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Editorial Photo");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const newImg: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt: prompt.trim(),
        style,
        aspectRatio,
        createdAt: "Just now",
      };
      setGallery([newImg, ...gallery]);
      setIsGenerating(false);
      setPrompt("");
    }, 1200);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Prompt Form Panel */}
      <form onSubmit={handleGenerate} className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="h-4 w-4 text-purple-400 font-bold" /> Generate Visual Asset (Fal.ai FLUX.1 / Midjourney)
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
          <Sparkles className="h-4 w-4" /> {isGenerating ? "Synthesizing Image with FLUX..." : "Generate AI Image"}
        </button>
      </form>

      {/* Generated Gallery Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-foreground flex items-center justify-between border-b border-border pb-2">
          <span>Generated Asset Gallery ({gallery.length})</span>
          <span className="text-[10px] text-muted-foreground font-mono">Model: FLUX.1 Dev</span>
        </h3>

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
