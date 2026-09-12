"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Send, Play, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface PublishingJob {
  id: string;
  articleId?: string;
  destination?: string;
  status?: string;
  attemptCount?: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt?: string;
}

export function PublishingQueueClient() {
  const [jobs, setJobs] = useState<PublishingJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<PublishingJob[]>("/admin/publishing/jobs").catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setJobs(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load publishing queue jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRetryJob = async (id: string) => {
    try {
      await apiClient.post(`/admin/publishing/jobs/${id}/retry`).catch(() => null);
      fetchJobs();
    } catch (err: unknown) {
      alert("Failed to retry publishing job: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const columns: ColumnDef<PublishingJob>[] = [
    {
      id: "destination",
      header: "Destination",
      sortable: true,
      cell: (job) => (
        <span className="font-mono font-bold text-indigo-400 uppercase">
          {job.destination || "PUBLIC_WEB"}
        </span>
      ),
    },
    {
      id: "articleId",
      header: "Article ID & Target",
      sortable: true,
      cell: (job) => (
        <div>
          <span className="font-mono font-bold text-foreground block">{job.articleId || job.id}</span>
          {job.errorMessage && (
            <span className="font-mono text-[10px] text-rose-400 block max-w-md truncate">{job.errorMessage}</span>
          )}
        </div>
      ),
    },
    {
      id: "attempts",
      header: "Attempts",
      sortable: true,
      cell: (job) => (
        <span className="font-mono text-muted-foreground">{job.attemptCount || 1} / 3</span>
      ),
    },
    {
      id: "lastAttemptAt",
      header: "Last Attempt",
      sortable: true,
      cell: (job) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {new Date(job.lastAttemptAt || job.createdAt || Date.now()).toLocaleTimeString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Job Status",
      cell: (job) => <StatusBadge status={job.status || "COMPLETED"} size="sm" />,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (job) => (
        <button
          onClick={() => handleRetryJob(job.id)}
          className="flex items-center gap-1 ml-auto px-2.5 py-1 text-[11px] font-mono font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition shadow-xs"
        >
          <Play className="h-3 w-3 fill-current" /> Retry Dispatch
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Publishing</span>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Dispatch Pipeline Queue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Multi-Destination Publishing Queue
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <Send className="h-3 w-3" /> DISPATCH PIPELINE
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time publication jobs across Web, Mobile App, Social syndication, and STOMP subscribers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Production DataTable */}
      <DataTable<PublishingJob>
        columns={columns}
        data={jobs}
        loading={loading}
        error={error}
        emptyTitle="No Active Publishing Jobs"
        emptyDescription="Dispatch queue is clear."
        searchPlaceholder="Filter publishing jobs..."
        onRetry={fetchJobs}
        pageSize={10}
      />
    </div>
  );
}
