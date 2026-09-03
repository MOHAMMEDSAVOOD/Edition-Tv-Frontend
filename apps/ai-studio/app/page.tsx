import { Suspense } from "react";
import { AiChatWorkbenchClient } from "@/components/chat/AiChatWorkbenchClient";

export const metadata = {
  title: "AI Chat Workbench | Edition TV AI Studio",
  description: "Multi-Model AI Chat Workbench for editorial research, fact-checking, and story drafting.",
};

export default function AiChatPage() {
  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      <div className="border-b border-border pb-3 flex-none">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Conversational Intelligence
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Chat Workbench</h1>
      </div>

      <Suspense fallback={<div className="h-64 bg-card border border-border animate-pulse rounded-md" />}>
        <AiChatWorkbenchClient />
      </Suspense>
    </div>
  );
}
