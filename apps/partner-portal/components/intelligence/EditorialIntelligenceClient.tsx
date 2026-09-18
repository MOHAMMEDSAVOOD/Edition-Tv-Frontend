"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FolderKanban,
  ArrowUpRight
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Drawer } from "@/components/ui/Drawer";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Candidate {
  id: string;
  externalId?: string;
  provider?: string;
  source?: string;
  headline?: string;
  title?: string;
  summary?: string;
  content?: string;
  url?: string;
  desk?: string;
  triageStatus?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
}

export default function EditorialIntelligenceClient() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<string>("ALL");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: () => void; title: string; desc: string }>({
    open: false,
    action: () => {},
    title: "",
    desc: ""
  });

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Candidate[]>("/admin/intelligence/candidates");
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load candidate intelligence inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleTriage = async (candidateId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      await apiClient.post(`/admin/intelligence/candidates/${candidateId}/triage?status=${status}`);
      fetchCandidates();
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate((prev) => (prev ? { ...prev, triageStatus: status } : null));
      }
    } catch (err: unknown) {
      alert("Failed to update candidate triage status: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleCreateStoryFromWire = (cand: Candidate) => {
    router.push(`/workspace?candidateId=${cand.id}&title=${encodeURIComponent(cand.headline || cand.title || "")}`);
  };

  const handleInspect = (c: Candidate) => {
    setSelectedCandidate(c);
    setDrawerOpen(true);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (activeQueueTab === "ALL") return true;
    const status = (c.triageStatus || c.status || "STAGED").toUpperCase();
    if (activeQueueTab === "NEW") return status === "STAGED" || status === "NEW";
    if (activeQueueTab === "ACCEPTED") return status === "ACCEPTED";
    if (activeQueueTab === "REJECTED") return status === "REJECTED";
    if (activeQueueTab === "ASSIGNED") return status === "ASSIGNED";
    return true;
  });

  const columns: ColumnDef<Candidate>[] = [
    {
      id: "provider",
      header: "Source / Provider",
      sortable: true,
      cell: (c) => (
        <span className="font-mono font-bold text-indigo-400 uppercase text-xs">
          {c.provider || c.source || "WIRE"}
        </span>
      ),
    },
    {
      id: "headline",
      header: "Candidate Headline",
      sortable: true,
      cell: (c) => (
        <div className="max-w-md">
          <button
            onClick={() => handleInspect(c)}
            className="font-bold text-foreground hover:text-indigo-400 text-left line-clamp-1 transition-colors"
          >
            {c.headline || c.title}
          </button>
          {c.summary && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{c.summary}</p>}
        </div>
      ),
    },
    {
      id: "desk",
      header: "Target Desk",
      sortable: true,
      cell: (c) => <span className="font-mono text-muted-foreground">{c.desk || "GENERAL"}</span>,
    },
    {
      id: "publishedAt",
      header: "Ingest Time",
      sortable: true,
      cell: (c) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {new Date(c.publishedAt || c.createdAt || Date.now()).toLocaleTimeString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Triage Status",
      cell: (c) => <StatusBadge status={c.triageStatus || c.status || "STAGED"} size="sm" />,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleInspect(c)}
            className="px-2.5 py-1 text-[11px] font-bold border border-border bg-muted/50 hover:bg-muted rounded-md transition-colors"
          >
            Inspect
          </button>
          <button
            onClick={() => handleTriage(c.id, "ACCEPTED")}
            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
            title="Accept Candidate"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setConfirmDialog({
                open: true,
                title: "Reject Candidate",
                desc: `Are you sure you want to reject wire item "${c.headline || c.title}"?`,
                action: () => handleTriage(c.id, "REJECTED"),
              });
            }}
            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
            title="Reject Candidate"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Newsroom</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Wire Ingestion & Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Wire Ingestion & Candidate Intelligence
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <Sparkles className="h-3 w-3" /> REAL-TIME INGRESS
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor incoming wire feeds, inspect candidate provenance, triage stories for desks, and instantiate story drafts.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchCandidates}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition-colors shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* Queue Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto font-mono text-xs font-bold">
        {[
          { id: "ALL", label: `All (${candidates.length})` },
          { id: "NEW", label: "Staged / New" },
          { id: "ACCEPTED", label: "Accepted" },
          { id: "REJECTED", label: "Rejected" },
          { id: "ASSIGNED", label: "Assigned" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveQueueTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              activeQueueTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reusable Production DataTable */}
      <DataTable<Candidate>
        columns={columns}
        data={filteredCandidates}
        loading={loading}
        error={error}
        emptyTitle="No Candidates Staged"
        emptyDescription="All incoming wire candidates have been triaged."
        searchPlaceholder="Filter candidate wire stream..."
        onRetry={fetchCandidates}
        onRowClick={handleInspect}
        pageSize={12}
      />

      {/* Candidate Inspection Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Wire Candidate Story Inspection"
        subtitle={selectedCandidate ? `ID: ${selectedCandidate.id} | Provider: ${selectedCandidate.provider || selectedCandidate.source}` : ""}
      >
        {selectedCandidate && (
          <div className="space-y-6 text-xs font-sans">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/30 border border-border rounded-xl">
              <StatusBadge status={selectedCandidate.triageStatus || "STAGED"} size="md" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateStoryFromWire(selectedCandidate)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                >
                  <FolderKanban className="h-3.5 w-3.5" /> Create Story
                </button>
                <button
                  onClick={() => handleTriage(selectedCandidate.id, "ACCEPTED")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                </button>
                <button
                  onClick={() => handleTriage(selectedCandidate.id, "REJECTED")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-foreground leading-snug">{selectedCandidate.headline || selectedCandidate.title}</h2>
              <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                <span>Desk: <strong className="text-foreground">{selectedCandidate.desk || "GENERAL"}</strong></span>
                <span>Received: <strong className="text-foreground">{new Date(selectedCandidate.publishedAt || Date.now()).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Summary */}
            {selectedCandidate.summary && (
              <div className="space-y-1.5">
                <h4 className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Lead Standfirst Summary</h4>
                <p className="p-3 bg-card border border-border rounded-lg text-foreground leading-relaxed font-sans">{selectedCandidate.summary}</p>
              </div>
            )}

            {/* Body */}
            {selectedCandidate.content && (
              <div className="space-y-1.5">
                <h4 className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Ingested Wire Content</h4>
                <div className="p-4 bg-muted/20 border border-border rounded-lg text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono text-[11px]">
                  {selectedCandidate.content}
                </div>
              </div>
            )}

            {/* External URL */}
            {selectedCandidate.url && (
              <a
                href={selectedCandidate.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-400 font-bold hover:underline font-mono"
              >
                <span>View Original Source Wire</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </Drawer>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        description={confirmDialog.desc}
      />
    </div>
  );
}
