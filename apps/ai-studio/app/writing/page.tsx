import { WritingAssistantClient } from "@/components/writing/WritingAssistantClient";

export const metadata = {
  title: "AI Writing Assistant | Edition TV AI Studio",
  description: "Generate headlines, executive summaries, and style rewrites.",
};

export default function WritingPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Editorial Automation
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Writing & Headline Generator</h1>
      </div>

      <WritingAssistantClient />
    </div>
  );
}
