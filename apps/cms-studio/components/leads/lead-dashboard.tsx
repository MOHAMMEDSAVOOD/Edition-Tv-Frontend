"use client";

import React, { useState, useEffect, useCallback } from "react";
import { leadService, Lead, LeadStatus } from "@/services/leadService";
import { LeadDataTable } from "./lead-data-table";
import { LeadFilters } from "./lead-filters";
import { AlertCircle } from "lucide-react";

export function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await leadService.fetchLeads({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        query: searchQuery,
        limit: 100,
      });
      setLeads(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-sm text-muted-foreground">
          View, filter, and manage incoming leads and their statuses.
        </p>
      </div>

      <LeadFilters 
        statusFilter={statusFilter} 
        onStatusChange={setStatusFilter} 
      />

      {error ? (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : (
        <LeadDataTable 
          data={leads} 
          loading={loading} 
          onSearchChange={setSearchQuery} 
          onRetry={loadLeads}
        />
      )}
    </div>
  );
}
