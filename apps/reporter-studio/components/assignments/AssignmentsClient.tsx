"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckSquare, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentItem {
  id: string;
  title: string;
  category: string;
  editorName: string;
  deadline: string;
  priority: "URGENT" | "HIGH" | "NORMAL";
  status: "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED";
}

const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  { id: "a-1", title: "Cover Zurich Quantum Center Coherence Announcement", category: "Science", editorName: "Elena Rostova", deadline: "Today, 17:00 EST", priority: "URGENT", status: "IN_PROGRESS" },
  { id: "a-2", title: "Investigate EU Semiconductor Supply Chain Restrictions", category: "Technology", editorName: "Marcus Vance", deadline: "Tomorrow, 12:00 EST", priority: "HIGH", status: "ASSIGNED" },
  { id: "a-3", title: "Interview Geneva Climate Delegates on Methane Target", category: "World", editorName: "Sarah Chen", deadline: "Aug 10, 09:00 EST", priority: "NORMAL", status: "SUBMITTED" },
];

export function AssignmentsClient() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);

  const getPriorityClass = (p: AssignmentItem["priority"]) => {
    switch (p) {
      case "URGENT": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "HIGH": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "NORMAL": default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-foreground">
          <CheckSquare className="h-4 w-4 text-primary" /> Active Desk Tasks ({assignments.length})
        </span>
      </div>

      <div className="divide-y divide-border text-xs">
        {assignments.map((item) => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className={cn("px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider", getPriorityClass(item.priority))}>
                  {item.priority}
                </span>
                <span className="bg-muted px-1.5 py-0.5 rounded font-bold uppercase text-muted-foreground border">
                  {item.category}
                </span>
                <span className="text-muted-foreground">Assigned by {item.editorName}</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
            </div>

            <div className="flex items-center gap-4 flex-none">
              <span className="flex items-center gap-1 font-mono text-muted-foreground text-xs bg-muted/40 px-2.5 py-1 rounded border">
                <Clock className="h-3.5 w-3.5 text-primary" /> {item.deadline}
              </span>

              <Link
                href={`/stories/s-1`}
                className="flex items-center gap-1 bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded text-xs hover:opacity-90 transition-opacity shadow-xs"
              >
                Open Workspace <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
