"use client";

import React, { useState, useEffect, useCallback } from "react";
import { History, RefreshCw, FileText } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorRole?: string;
  action?: string;
  resource?: string;
  entityType?: string;
  entityId?: string;
  detailsJson?: string;
  correlationId?: string;
  createdAt?: string;
}

export default function NewsroomAuditLogsClient() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<any>("/admin/audit-logs");
      const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      setLogs(list);
    } catch (err: any) {
      setError(err.message || "Failed to load audit provenance logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleInspectLog = (log: AuditLogItem) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      id: "createdAt",
      header: "Timestamp",
      sortable: true,
      cell: (log) => (
        <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
          {new Date(log.createdAt || Date.now()).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actorId",
      header: "Actor",
      sortable: true,
      cell: (log) => <span className="font-bold font-mono text-foreground">{log.actorId || "SYSTEM"}</span>,
    },
    {
      id: "actorRole",
      header: "Role",
      cell: (log) => (
        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">
          {log.actorRole || "SYSTEM"}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action Type",
      sortable: true,
      cell: (log) => <span className="font-bold font-mono text-emerald-400">{log.action || "UPDATE"}</span>,
    },
    {
      id: "entity",
      header: "Target Entity",
      cell: (log) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {log.entityType ? `${log.entityType} (${log.entityId || log.id})` : log.resource || "-"}
        </span>
      ),
    },
    {
      id: "details",
      header: "Details",
      cell: (log) => (
        <button
          onClick={() => handleInspectLog(log)}
          className="text-xs text-muted-foreground hover:text-indigo-400 font-mono truncate max-w-xs text-left"
        >
          {log.detailsJson || "Inspect payload JSON"}
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
            <span className="text-indigo-400 font-bold">Provenance Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Immutable Newsroom Audit Trail
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <History className="h-3 w-3" /> APPEND-ONLY LOGS
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically verifier-ready audit records for story edits, state transitions, fact-checking, and publishing triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Trail
          </button>
        </div>
      </div>

      {/* Production DataTable */}
      <DataTable<AuditLogItem>
        columns={columns}
        data={logs}
        loading={loading}
        error={error}
        emptyTitle="No Audit Event Records"
        emptyDescription="Newsroom operations will record events automatically."
        searchPlaceholder="Filter audit provenance logs..."
        onRetry={fetchAuditLogs}
        onRowClick={handleInspectLog}
        pageSize={12}
      />

      {/* JSON Record Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Audit Provenance Event Record"
        subtitle={selectedLog ? `Event ID: ${selectedLog.id} | Action: ${selectedLog.action}` : ""}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-1">
              <p><strong className="text-foreground">Timestamp:</strong> {new Date(selectedLog.createdAt || Date.now()).toLocaleString()}</p>
              <p><strong className="text-foreground">Actor ID:</strong> {selectedLog.actorId || "SYSTEM"}</p>
              <p><strong className="text-foreground">Actor Role:</strong> {selectedLog.actorRole || "SYSTEM"}</p>
              <p><strong className="text-foreground">Correlation ID:</strong> {selectedLog.correlationId || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-[10px] uppercase text-muted-foreground">Payload JSON</h4>
              <pre className="p-4 bg-muted/20 border border-border rounded-xl text-muted-foreground overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
