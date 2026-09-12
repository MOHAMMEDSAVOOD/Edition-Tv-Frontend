"use client";

import { useEffect, useState } from "react";
import { Clock, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface JobRecord {
  id: string;
  name: string;
  cron: string;
  lastRun: string;
  status: string;
  executionMs: number;
}

export function ScheduledJobsClient() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<JobRecord[]>("/admin/jobs");
      if (data) {
        setJobs(data);
      } else {
        setError("Failed to fetch scheduled jobs from backend");
      }
    } catch {
      setError("Failed to connect to backend scheduled job API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6 text-xs font-sans">
      <div className="bg-card border border-border p-4 rounded-md flex items-center justify-between shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" /> Platform Scheduled Background Workers
          </h3>
          <p className="text-muted-foreground text-[11px]">
            Spring Scheduled Cron workers driving wire polling, retention purging, and search indexing.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} /> Refresh
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
              <th className="py-3.5 px-4">Job Name</th>
              <th className="py-3.5 px-4">Cron Schedule</th>
              <th className="py-3.5 px-4">Last Execution</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && jobs.length === 0 ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-28 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-14 bg-slate-200 rounded-full" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-slate-200 rounded-full ml-auto" /></td>
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                  No scheduled workers configured.
                </td>
              </tr>
            ) : (
              jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{j.name}</td>
                  <td className="py-3 px-4 font-mono text-red-600 font-bold">{j.cron}</td>
                  <td className="py-3 px-4 text-slate-600">{j.lastRun}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{j.executionMs} ms</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {j.status}
                    </span>
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
