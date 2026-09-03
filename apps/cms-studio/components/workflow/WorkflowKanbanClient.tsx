"use client";
import { useState } from "react";
import Link from "next/link";
import { User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanItem {
  id: string;
  title: string;
  author: string;
  category: string;
  stage: "DRAFT" | "REVIEW" | "LEGAL" | "APPROVED" | "PUBLISHED";
  updated: string;
}

const INITIAL_KANBAN: KanbanItem[] = [
  { id: "k-1", title: "Quantum Computing Qubit Breakthrough", author: "Priya Nair", category: "Science", stage: "DRAFT", updated: "2h ago" },
  { id: "k-2", title: "EU Semiconductor Export Restrictions", author: "Marcus Vance", category: "Technology", stage: "REVIEW", updated: "4h ago" },
  { id: "k-3", title: "Autonomous Vehicle Regulation Audit", author: "James Whitfield", category: "Politics", stage: "LEGAL", updated: "1d ago" },
  { id: "k-4", title: "AI Executive Governance Standards", author: "Elena Rostova", category: "Technology", stage: "APPROVED", updated: "Just now" },
  { id: "k-5", title: "Federal Reserve Interest Rate Decision", author: "Sarah Chen", category: "Business", stage: "PUBLISHED", updated: "3h ago" },
];

const COLUMNS: { key: KanbanItem["stage"]; label: string; color: string }[] = [
  { key: "DRAFT", label: "Draft Stories", color: "border-amber-500/40 text-amber-400" },
  { key: "REVIEW", label: "Editorial Review", color: "border-indigo-500/40 text-indigo-400" },
  { key: "LEGAL", label: "Legal Verification", color: "border-purple-500/40 text-purple-400" },
  { key: "APPROVED", label: "Approved for Publish", color: "border-teal-500/40 text-teal-400" },
  { key: "PUBLISHED", label: "Live Published", color: "border-emerald-500/40 text-emerald-400" },
];

export function WorkflowKanbanClient() {
  const [items, setItems] = useState<KanbanItem[]>(INITIAL_KANBAN);

  const moveStage = (id: string, nextStage: KanbanItem["stage"]) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, stage: nextStage } : item)));
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-0 no-scrollbar pb-2">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.stage === col.key);
        return (
          <div key={col.key} className="bg-card/60 border border-border rounded-md p-3 flex flex-col h-full min-w-[220px]">
            <div className={cn("flex items-center justify-between pb-2 border-b-2 mb-3 text-xs font-bold uppercase tracking-wider", col.color)}>
              <span>{col.label}</span>
              <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] text-foreground">{colItems.length}</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
              {colItems.map((item) => (
                <div key={item.id} className="bg-card border border-border p-3 rounded-md space-y-2 hover:border-indigo-500/40 transition-colors shadow-xs group">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded font-semibold uppercase">{item.category}</span>
                    <span>{item.updated}</span>
                  </div>

                  <Link href={`/content/${item.id}/edit`} className="font-bold text-xs text-foreground hover:text-indigo-400 line-clamp-2 block">
                    {item.title}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <User className="h-3 w-3 text-indigo-400" /> {item.author}
                    </span>

                    {/* Move stage control */}
                    {col.key !== "PUBLISHED" && (
                      <button
                        onClick={() => {
                          const stages: KanbanItem["stage"][] = ["DRAFT", "REVIEW", "LEGAL", "APPROVED", "PUBLISHED"];
                          const idx = stages.indexOf(col.key);
                          if (idx < stages.length - 1) moveStage(item.id, stages[idx + 1]);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                        title="Move to Next Stage"
                      >
                        Next <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
