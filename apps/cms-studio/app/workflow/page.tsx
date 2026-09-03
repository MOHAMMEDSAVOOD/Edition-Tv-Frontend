import { WorkflowKanbanClient } from "@/components/workflow/WorkflowKanbanClient";

export const metadata = {
  title: "Workflow Kanban | Edition TV CMS",
  description: "Multi-stage editorial approval board and publishing queue.",
};

export default function WorkflowPage() {
  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      <div className="border-b border-border pb-3 flex-none">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Editorial Governance
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Workflow Board</h1>
      </div>

      <WorkflowKanbanClient />
    </div>
  );
}
