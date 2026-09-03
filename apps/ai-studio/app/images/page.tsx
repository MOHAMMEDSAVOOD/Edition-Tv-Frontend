import { ImageStudioClient } from "@/components/images/ImageStudioClient";

export const metadata = {
  title: "AI Image Studio | Edition TV AI Studio",
  description: "Generate high-resolution editorial photography, infographics, and 3D renders using Fal.ai and Midjourney models.",
};

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Generative Visual Assets
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Image Generation Studio</h1>
      </div>

      <ImageStudioClient />
    </div>
  );
}
