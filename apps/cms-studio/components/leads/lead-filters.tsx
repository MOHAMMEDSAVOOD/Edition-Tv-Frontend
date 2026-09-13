"use client";

import React from "react";
import { LeadStatus } from "@/services/leadService";

interface LeadFiltersProps {
  statusFilter: LeadStatus | "ALL";
  onStatusChange: (status: LeadStatus | "ALL") => void;
}

const STATUSES: (LeadStatus | "ALL")[] = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED", "CONVERTED"];

export function LeadFilters({ statusFilter, onStatusChange }: LeadFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">Filter by Status:</span>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              statusFilter === status
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
