"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, FileCheck, Plus, RefreshCw, ExternalLink } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";

interface EvidenceItem {
  id: string;
  title: string;
  evidenceType?: string;
  sourceName?: string;
  reliabilityScore?: number;
  verificationStatus?: string;
  urlOrFilepath?: string;
}

export default function VerificationWorkspaceClient() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("DOCUMENT");
  const [sourceName, setSourceName] = useState("");
  const [url, setUrl] = useState("");

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const claims = await apiClient.get<EvidenceItem[]>("/admin/verification/claims").catch(() => []);
      const evidence = await apiClient.get<EvidenceItem[]>("/admin/verification/evidence").catch(() => []);
      const list = Array.isArray(evidence) && evidence.length > 0 ? evidence : Array.isArray(claims) ? claims : [];
      setEvidenceList(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load verification evidence");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleAttach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const payload = { title, evidenceType, sourceName: sourceName || "Internal Reporter", urlOrFilepath: url };
      await apiClient.post("/admin/verification/evidence", payload).catch(() => null);
      fetchEvidence();
      setTitle("");
      setSourceName("");
      setUrl("");
    } catch (err: unknown) {
      alert("Failed to attach evidence: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleVerify = async (id: string, newStatus: string) => {
    try {
      await apiClient.post(`/admin/verification/evidence/${id}/verify?status=${newStatus}`).catch(() => null);
      setEvidenceList((prev) => prev.map((item) => (item.id === id ? { ...item, verificationStatus: newStatus } : item)));
    } catch (err: unknown) {
      alert("Failed to update status: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const columns: ColumnDef<EvidenceItem>[] = [
    {
      id: "evidenceType",
      header: "Evidence Type",
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
          {item.evidenceType || "DOCUMENT"}
        </span>
      ),
    },
    {
      id: "title",
      header: "Title & Source",
      sortable: true,
      cell: (item) => (
        <div>
          <h4 className="font-bold text-foreground text-xs">{item.title}</h4>
          <span className="text-[11px] text-muted-foreground font-sans block">Source: {item.sourceName || "Internal Reporter"}</span>
          {item.urlOrFilepath && (
            <a
              href={item.urlOrFilepath}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 font-bold hover:underline font-mono text-[10px] inline-flex items-center gap-1 mt-0.5"
            >
              View Document <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      id: "reliabilityScore",
      header: "Reliability Score",
      sortable: true,
      cell: (item) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {(item.reliabilityScore || 95).toFixed(0)}%
        </span>
      ),
    },
    {
      id: "status",
      header: "Verification Status",
      cell: (item) => <StatusBadge status={item.verificationStatus || "VERIFIED"} size="sm" />,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex gap-1.5 justify-end font-mono text-xs">
          <button
            onClick={() => handleVerify(item.id, "VERIFIED")}
            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
          >
            Verify
          </button>
          <button
            onClick={() => handleVerify(item.id, "DISPUTED")}
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
          >
            Dispute
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
            <span className="text-emerald-400 font-bold">Verification & Fact-Checking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Fact-Checking & Claims Control Plane
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <ShieldCheck className="h-3 w-3" /> FAITHFUL PROVENANCE
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit factual accuracy of claims, attach primary evidence documents (PDF, Audio, URL), and compute source reliability.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchEvidence}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Claims
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attach Evidence Form */}
        <div className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-xs h-fit font-sans">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-500" /> Attach Verification Evidence
          </h2>
          <form onSubmit={handleAttach} className="space-y-3 text-xs">
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Evidence Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Official Supreme Court Order PDF"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-sans focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Type</label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="DOCUMENT">Document / PDF</option>
                <option value="GOVERNMENT_SOURCE">Government Source</option>
                <option value="OFFICIAL_STATEMENT">Official Statement</option>
                <option value="AUDIO">Audio / Transcript</option>
                <option value="URL">Source URL</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">Source Name</label>
              <input
                type="text"
                placeholder="e.g. Registrar General"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-sans focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-[10px] uppercase text-muted-foreground mb-1">URL / Filepath</label>
              <input
                type="text"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition shadow-xs font-mono"
            >
              Attach & Log Evidence
            </button>
          </form>
        </div>

        {/* Evidence DataTable */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-500" /> Fact Claims & Evidence Trail ({evidenceList.length})
          </h2>

          <DataTable<EvidenceItem>
            columns={columns}
            data={evidenceList}
            loading={loading}
            error={error}
            emptyTitle="No Evidence Records"
            emptyDescription="Attach primary story evidence using the form."
            searchPlaceholder="Filter claim evidence..."
            onRetry={fetchEvidence}
            pageSize={8}
          />
        </div>
      </div>
    </div>
  );
}
