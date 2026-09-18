"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface Assignment {
  id: string;
  articleId?: string;
  candidateId?: string;
  deskId?: string;
  assignedJournalistId?: string;
  assignedEditorId?: string;
  priority?: string;
  deadline?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
}

export function EditorialAssignmentsClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deskId, setDeskId] = useState("WORLD");
  const [journalistId, setJournalistId] = useState("reporter1");
  const [priority, setPriority] = useState("NORMAL");
  const [notes, setNotes] = useState("");

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Assignment[]>("/admin/editorial/assignments/my").catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setAssignments(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load newsroom assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { deskId, assignedJournalistId: journalistId, priority, notes };
      await apiClient.post("/admin/editorial/assignments", payload).catch(() => null);
      fetchAssignments();
      setShowAddModal(false);
      setNotes("");
    } catch (err: unknown) {
      alert("Failed to create assignment: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const columns: ColumnDef<Assignment>[] = [
    {
      id: "deskId",
      header: "Target Desk",
      sortable: true,
      cell: (a) => <span className="font-mono font-bold text-indigo-400 uppercase">{a.deskId || "WORLD"}</span>,
    },
    {
      id: "notes",
      header: "Assignment Brief / Story",
      sortable: true,
      cell: (a) => (
        <div className="space-y-0.5">
          <span className="font-bold text-foreground block">{a.notes || "Story Coverage Assignment"}</span>
          {a.deadline && (
            <span className="font-mono text-[10px] text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Deadline: {new Date(a.deadline).toLocaleTimeString()}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "journalist",
      header: "Assigned Reporter",
      sortable: true,
      cell: (a) => <span className="font-mono text-muted-foreground">{a.assignedJournalistId || "Unassigned"}</span>,
    },
    {
      id: "priority",
      header: "Priority",
      cell: (a) => <StatusBadge status={a.priority || "NORMAL"} size="sm" />,
    },
    {
      id: "status",
      header: "Status",
      cell: (a) => <StatusBadge status={a.status || "ASSIGNED"} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Newsroom</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Desk Assignments</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Assignments Desk Workstation
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <FileText className="h-3 w-3" /> ACTIVE WORK QUEUE
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Delegate wire coverage to reporters, manage deadlines, and track assignment progress across desks.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchAssignments}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Assign Story
          </button>
        </div>
      </div>

      {/* Production DataTable */}
      <DataTable<Assignment>
        columns={columns}
        data={assignments}
        loading={loading}
        error={error}
        emptyTitle="No Active Assignments"
        emptyDescription="Click 'Assign Story' to delegate desk assignments."
        searchPlaceholder="Filter assignments..."
        onRetry={fetchAssignments}
        pageSize={10}
      />

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl font-sans">
            <h3 className="text-sm font-bold text-foreground">Create Newsroom Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Target Desk</label>
                <select
                  value={deskId}
                  onChange={(e) => setDeskId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold"
                >
                  <option value="WORLD">WORLD</option>
                  <option value="POLITICS">POLITICS</option>
                  <option value="BUSINESS">BUSINESS</option>
                  <option value="TECH">TECH</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Assigned Journalist ID</label>
                <input
                  type="text"
                  required
                  value={journalistId}
                  onChange={(e) => setJournalistId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Assignment Brief / Notes</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-sans resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-border rounded-lg font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Assign Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
