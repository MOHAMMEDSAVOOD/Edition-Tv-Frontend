"use client";

import { useEffect, useState } from "react";
import { KeyRound, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface KeyRecord {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
}

export function ApiKeysClient() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<any>("/admin/api-keys");
      if (data) {
        setKeys(data);
      } else {
        setError("Failed to fetch API keys from backend");
      }
    } catch (e) {
      setError("Failed to connect to backend API key service");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const revokeKey = async (id: string) => {
    try {
      const updated = await apiClient.post<any>(`/admin/api-keys/${id}/revoke`);
      if (updated) {
        setKeys((prev) => prev.map((k) => (k.id === id ? updated : k)));
      }
    } catch (e) {
      console.error("Failed to revoke API key", e);
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 font-heading">
            <KeyRound className="h-4 w-4 text-red-600" /> System API Keys & Integration Secrets
          </h3>
          <p className="text-slate-500 text-[11px] font-mono mt-0.5">
            API credentials for wire ingestion, search indexing, and automated publishing pipelines.
          </p>
        </div>
        <button
          onClick={fetchKeys}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition text-xs font-semibold"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-red-600")} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="h-4 w-4 flex-none text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <th className="py-3.5 px-4">Key Name</th>
              <th className="py-3.5 px-4">Prefix</th>
              <th className="py-3.5 px-4">Scope</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && keys.length === 0 ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-28 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-14 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-slate-200 rounded-full ml-auto" /></td>
                </tr>
              ))
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                  No active API keys found.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{k.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{k.prefix}••••••••</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {k.scope}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                        k.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {k.status === "ACTIVE" && (
                      <button
                        onClick={() => revokeKey(k.id)}
                        className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold transition"
                      >
                        Revoke Key
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
