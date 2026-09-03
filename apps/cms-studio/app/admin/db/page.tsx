"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Database, RefreshCw, Table, Eye } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface TableInfo {
  tableName: string;
  rowCount: number;
}

export default function DatabaseStudioPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("articles");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<any[]>("/admin/db/tables").catch(() => []);
      const list = Array.isArray(data) ? data : [
        { tableName: "articles", rowCount: 12 },
        { tableName: "candidates", rowCount: 45 },
        { tableName: "users", rowCount: 8 },
        { tableName: "audit_logs", rowCount: 142 },
        { tableName: "curation_slots", rowCount: 15 },
        { tableName: "publishing_jobs", rowCount: 9 },
      ];
      setTables(list);
      if (list.length > 0) {
        fetchRows(list[0].tableName);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load database tables");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRows = async (table: string) => {
    setSelectedTable(table);
    try {
      const data = await apiClient.get<any[]>(`/admin/db/tables/${table}/rows`).catch(() => []);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const columns: ColumnDef<TableInfo>[] = [
    {
      id: "tableName",
      header: "Table Name",
      sortable: true,
      cell: (t) => <span className="font-mono font-bold text-indigo-400">{t.tableName}</span>,
    },
    {
      id: "rowCount",
      header: "Row Count",
      sortable: true,
      cell: (t) => <span className="font-mono text-muted-foreground">{t.rowCount}</span>,
    },
    {
      id: "actions",
      header: "Inspect",
      align: "right",
      cell: (t) => (
        <button
          onClick={() => fetchRows(t.tableName)}
          className="p-1 text-indigo-400 hover:bg-indigo-500/10 rounded transition"
          title="Inspect Table Rows"
        >
          <Eye className="h-4 w-4" />
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
            <span className="font-semibold text-foreground font-sans">Admin</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Database Studio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            PostgreSQL Database Inspector
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <Database className="h-3 w-3" /> FLYWAY V28
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect relational database schema tables, row counts, and live query rows.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={fetchTables}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh DB
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List */}
        <div>
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground mb-3 flex items-center gap-2">
            <Table className="h-4 w-4 text-indigo-400" /> Database Tables ({tables.length})
          </h2>
          <DataTable<TableInfo>
            columns={columns}
            data={tables}
            loading={loading}
            error={error}
            emptyTitle="No DB Tables Found"
            emptyDescription="PostgreSQL connection empty."
            onRowClick={(t) => fetchRows(t.tableName)}
            pageSize={10}
          />
        </div>

        {/* Selected Table Data Rows */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-indigo-400" /> Table Row Inspector: <span className="text-indigo-400">{selectedTable}</span>
          </h2>

          <div className="bg-card border border-border rounded-xl p-4 shadow-xs overflow-x-auto min-h-64 font-mono text-xs">
            {rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No rows returned for table {selectedTable}.
              </div>
            ) : (
              <pre className="p-3 bg-muted/20 border border-border rounded-lg text-muted-foreground text-[11px] leading-relaxed overflow-x-auto">
                {JSON.stringify(rows, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
