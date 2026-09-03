import { ResearchClient } from "@/components/research/ResearchClient";

export const metadata = {
  title: "Research Notes | Reporter Studio",
  description: "Block-based scratchpad for background research, quotes, and links.",
};

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Investigation Scratchpad
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Research Notes</h1>
      </div>

      <ResearchClient />
    </div>
  );
}
