"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Lead } from "@/services/leadService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { format } from "date-fns";

interface LeadDataTableProps {
  data: Lead[];
  loading: boolean;
  onSearchChange: (query: string) => void;
  onRetry: () => void;
}

export function LeadDataTable({ data, loading, onSearchChange, onRetry }: LeadDataTableProps) {
  const columns: ColumnDef<Lead>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-muted-foreground text-xs">{item.email}</div>
        </div>
      ),
    },
    {
      id: "company",
      header: "Company",
      accessorKey: "company",
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorKey: "createdAt",
      sortable: true,
      cell: (item) => format(new Date(item.createdAt), "MMM d, yyyy HH:mm"),
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessorKey: "assignedTo",
      sortable: true,
      cell: (item) => item.assignedTo || <span className="text-muted-foreground italic">Unassigned</span>,
    }
  ];

  return (
    <DataTable 
      columns={columns}
      data={data}
      loading={loading}
      onSearchChange={onSearchChange}
      onRetry={onRetry}
      searchPlaceholder="Search leads by name, email, or company..."
      emptyTitle="No leads found"
      emptyDescription="Try adjusting your filters or search query."
    />
  );
}
