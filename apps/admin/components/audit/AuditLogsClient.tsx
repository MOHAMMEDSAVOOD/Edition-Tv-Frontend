"use client";
import { FileCode2, RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: "INFO" | "WARN" | "CRITICAL";
}

interface ApiAuditLog {
  id: string;
  createdAt: string;
  actorId: string;
  actorRole?: string;
  action: string;
  resource?: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
}

interface PaginatedResponse {
  content: ApiAuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
}

function mapSeverity(action: string): "INFO" | "WARN" | "CRITICAL" {
  const critical = ["DELETE", "ROLE_UPDATE", "PERMISSION_GRANT", "PERMISSION_REVOKE", "BAN", "DISABLE"];
  const warn = ["UPDATE", "RESET_PASSWORD", "ASSIGN", "PUBLISH", "UNPUBLISH"];
  const upper = action.toUpperCase();
  if (critical.some((k) => upper.includes(k))) return "CRITICAL";
  if (warn.some((k) => upper.includes(k))) return "WARN";
  return "INFO";
}

function toAuditEntry(log: ApiAuditLog): AuditEntry {
  return {
    id: log.id,
    timestamp: new Date(log.createdAt).toUTCString().replace("GMT", "UTC"),
    actor: log.actorId + (log.actorRole ? ` (${log.actorRole})` : ""),
    action: log.action,
    target: log.entityType && log.entityId ? `${log.entityType}:${log.entityId}` : (log.resource ?? "—"),
    ipAddress: log.correlationId ?? "—",
    severity: mapSeverity(log.action),
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.editiontv.com/api/v1";


export function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/audit?page=${p}&size=20`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data: PaginatedResponse = await res.json();
      setLogs(data.content.map(toAuditEntry));
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(0);
  }, [fetchLogs]);

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between font-mono">
          <span className="flex items-center gap-2 font-heading">
            <FileCode2 className="h-4 w-4 text-red-600" /> Immutable Security Log Stream
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-400 font-mono">Retention: 365 Days</span>
            <button
              onClick={() => fetchLogs(page)}
              className="text-slate-400 hover:text-slate-900 transition"
              title="Refresh audit logs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-6 space-y-4 font-mono">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-32 bg-slate-200 rounded-full" />
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-4 w-40 bg-slate-200 rounded-full" />
                <div className="h-4 w-16 bg-slate-200 rounded-lg ml-auto" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 flex items-center gap-2 text-rose-700 bg-rose-50 border-b border-rose-100 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">No audit log entries found.</div>
        )}

        {!loading && logs.length > 0 && (
          <table className="w-full text-left font-mono">
            <thead className="bg-slate-50/80 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Actor / Principal</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Target Subject</th>
                <th className="p-3">Correlation ID</th>
                <th className="p-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 text-slate-500">{log.timestamp}</td>
                  <td className="p-3 font-bold text-slate-900">{log.actor}</td>
                  <td className="p-3 text-red-600 font-bold">{log.action}</td>
                  <td className="p-3 text-slate-600">{log.target}</td>
                  <td className="p-3 text-slate-400">{log.ipAddress}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : log.severity === "WARN"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && !loading && (
          <div className="p-3 flex items-center justify-between border-t border-border text-[11px] text-muted-foreground">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 rounded border border-border hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded border border-border hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

