"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface PermissionRow {
  key: string;
  module: string;
  description: string;
}

interface RoleRecord {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
}

export function RbacMatrixClient() {
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permData] = await Promise.all([
        apiClient.get<any>("/admin/roles"),
        apiClient.get<any>("/admin/permissions"),
      ]);

      if (rolesData && permData) {
        setRoles(rolesData);
        setPermissions(permData);
      } else {
        setError("Failed to fetch RBAC configuration from backend");
      }
    } catch (e) {
      setError("Failed to connect to backend RBAC API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-2xs">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 font-heading">
            <ShieldCheck className="h-4 w-4 text-red-600" /> Dynamic Role-Based Access Control Matrix
          </h3>
          <p className="text-slate-500 text-[11px] font-mono mt-0.5">
            Live permission registry enforced across Spring Security and Keycloak OAuth2 scopes.
          </p>
        </div>
        <button
          onClick={fetchData}
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

      {/* Permissions Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <th className="py-3.5 px-4">Permission Key</th>
              <th className="py-3.5 px-4">Module</th>
              <th className="py-3.5 px-4">Description</th>
              {roles.map((r) => (
                <th key={r.id} className="py-3.5 px-4 text-center">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && permissions.length === 0 ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-32 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-36 bg-slate-200 rounded-full" /></td>
                  {roles.map((r) => (
                    <td key={r.id} className="py-3.5 px-4 text-center"><div className="h-4 w-6 bg-slate-200 rounded-full mx-auto" /></td>
                  ))}
                </tr>
              ))
            ) : (
              permissions.map((p) => (
                <tr key={p.key} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] font-bold text-red-600">{p.key}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {p.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.description}</td>
                  {roles.map((r) => (
                    <td key={r.id} className="py-3 px-4 text-center font-bold text-emerald-600">
                      ✓
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
