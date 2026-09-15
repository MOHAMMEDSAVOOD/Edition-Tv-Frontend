"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineStory {
  id: string;
  title: string;
  category: string;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  stage: "PITCH" | "REPORTING" | "WRITING" | "EDITING" | "FILED";
  deadline: string;
  wordCount: number;
}

const STAGES: { key: PipelineStory["stage"]; label: string; color: string }[] = [
  { key: "PITCH", label: "Story Pitches", color: "border-amber-500/40 text-amber-500" },
  { key: "REPORTING", label: "Active Reporting", color: "border-blue-500/40 text-blue-500" },
  { key: "WRITING", label: "Drafting in Studio", color: "border-primary/40 text-primary" },
  { key: "EDITING", label: "Editorial Review", color: "border-purple-500/40 text-purple-500" },
  { key: "FILED", label: "Filed & Ready", color: "border-emerald-500/40 text-emerald-500" },
];

export function StoryPipelineClient() {
  // TODO: load the reporter pipeline from the backend. Empty until that endpoint is wired.
  const [stories, setStories] = useState<PipelineStory[]>([]);

  const moveStage = (id: string, nextStage: PipelineStory["stage"]) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, stage: nextStage } : s)));
  };

  const getPriorityBadge = (p: PipelineStory["priority"]) => {
    switch (p) {
      case "URGENT":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "LOW":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-0 no-scrollbar pb-2">
      {STAGES.map((col) => {
        const colStories = stories.filter((s) => s.stage === col.key);
        return (
          <div key={col.key} className="bg-card/60 border border-border rounded-md p-3 flex flex-col h-full min-w-[220px]">
            <div className={cn("flex items-center justify-between pb-2 border-b-2 mb-3 text-xs font-bold uppercase tracking-wider", col.color)}>
              <span>{col.label}</span>
              <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] text-foreground">{colStories.length}</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
              {colStories.map((story) => (
                <div key={story.id} className="bg-card border border-border p-3.5 rounded-md space-y-2 hover:border-primary/40 transition-colors shadow-xs group">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={cn("px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider", getPriorityBadge(story.priority))}>
                      {story.priority}
                    </span>
                    <span className="text-muted-foreground font-mono">{story.category}</span>
                  </div>

                  <Link href={`/stories/${story.id}`} className="font-bold text-xs text-foreground hover:text-primary line-clamp-2 block leading-snug">
                    {story.title}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" /> {story.deadline}
                    </span>

                    <span>{story.wordCount} words</span>
                  </div>

                  {col.key !== "FILED" && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          const stages: PipelineStory["stage"][] = ["PITCH", "REPORTING", "WRITING", "EDITING", "FILED"];
                          const idx = stages.indexOf(col.key);
                          if (idx < stages.length - 1) moveStage(story.id, stages[idx + 1]);
                        }}
                        className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                      >
                        Advance <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
