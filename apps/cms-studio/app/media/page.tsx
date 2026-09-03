import { MediaLibraryClient } from "@/components/media/MediaLibraryClient";

export const metadata = {
  title: "Media Library | Edition TV CMS",
  description: "Digital Asset Management (DAM) storing high-resolution photography and media feeds.",
};

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Digital Asset Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Library</h1>
        </div>
      </div>

      <MediaLibraryClient />
    </div>
  );
}
