import { AssignmentsClient } from "@/components/assignments/AssignmentsClient";

export const metadata = {
  title: "My Assignments | Reporter Studio",
  description: "Assigned reporting tasks, deadlines, and editor review status.",
};

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Editorial Desk Assignments
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Assignments</h1>
      </div>

      <AssignmentsClient />
    </div>
  );
}
