import { Suspense } from "react";
import { StoryPipelineClient } from "@/components/pipeline/StoryPipelineClient";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Story Pipeline | Reporter Studio",
  description: "Notion & Linear style journalist story pipeline.",
};

export default function StoryPipelinePage() {
  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3 flex-none">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Journalist Workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Story Pipeline</h1>
        </div>

        <Link
          href="/stories/s-1"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Start New Story Pitch
        </Link>
      </div>

      <Suspense fallback={<div className="h-64 bg-card border border-border animate-pulse rounded-md" />}>
        <StoryPipelineClient />
      </Suspense>
    </div>
  );
}
