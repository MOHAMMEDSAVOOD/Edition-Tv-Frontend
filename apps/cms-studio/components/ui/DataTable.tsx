"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Inbox,
  AlertCircle,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  unauthorized?: boolean;
  unavailable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  onRetry?: () => void;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
  pageSize?: number;
  keyExtractor?: (item: T, index: number) => string;
}

export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  error = null,
  unauthorized = false,
  unavailable = false,
  emptyTitle = "No records found",
  emptyDescription = "No data matches the current criteria.",
  searchPlaceholder = "Filter records...",
  onSearchChange,
  onRetry,
  onRowClick,
  actions,
  pageSize = 10,
  keyExtractor = (item, idx) => {
    if ("id" in item && (typeof item.id === "string" || typeof item.id === "number")) {
      return String(item.id);
    }
    return String(idx);
  },
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setCurrentPage(1);
    if (onSearchChange) onSearchChange(q);
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  // Client-side filtering if onSearchChange is not custom-handled
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim() || onSearchChange) return data;
    const lower = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, searchQuery, onSearchChange]);

  // Client-side sorting
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const recordA = a as Record<string, unknown>;
      const recordB = b as Record<string, unknown>;
      const valA = recordA[sortColumn];
      const valB = recordB[sortColumn];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className="space-y-3 font-sans">
      {/* Search & Toolbar Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            aria-label={searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-border bg-background rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-sans text-foreground"
          />
        </div>

        {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{actions}</div>}
      </div>

      {/* Table Canvas */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden" aria-busy={loading}>
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 text-muted-foreground font-mono text-xs" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <span>Fetching real-time backend data...</span>
          </div>
        ) : unauthorized ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3" role="alert">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
            <h4 className="text-sm font-bold text-foreground">Access Restricted</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Your role does not have RBAC authorization to view or manage this workstation.
            </p>
          </div>
        ) : unavailable ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3" role="alert">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <h4 className="text-sm font-bold text-foreground font-mono">UNAVAILABLE</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              This service or endpoint is currently not configured or disabled in system settings.
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3" role="alert">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <h4 className="text-sm font-bold text-foreground">API Failure Error</h4>
            <p className="text-xs text-muted-foreground font-mono max-w-md">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs"
              >
                Retry Request
              </button>
            )}
          </div>
        ) : sortedData.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2" role="status">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
            <h4 className="text-sm font-bold text-foreground">{emptyTitle}</h4>
            <p className="text-xs text-muted-foreground max-w-sm">{emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse" aria-label="Data Table">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[10px] uppercase font-bold tracking-wider">
                  {columns.map((col) => {
                    const isSorted = sortColumn === col.id;
                    return (
                      <th
                        key={col.id}
                        style={{ width: col.width }}
                        aria-sort={isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
                        className={cn(
                          "p-3 select-none",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {col.sortable ? (
                          <button
                            onClick={() => handleSort(col.id)}
                            className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-mono focus:outline-none focus:underline"
                          >
                            <span>{col.header}</span>
                            <ArrowUpDown className={cn("h-3 w-3", isSorted ? "text-indigo-400 font-bold" : "text-muted-foreground/60")} />
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((item, idx) => (
                  <tr
                    key={keyExtractor(item, idx)}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "p-3",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? String((item as Record<string, unknown>)[col.accessorKey as string] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination Bar */}
        {!loading && !error && !unauthorized && !unavailable && sortedData.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-muted-foreground text-[11px]">
              Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-foreground">{Math.min(currentPage * pageSize, sortedData.length)}</strong> of{" "}
              <strong className="text-foreground">{sortedData.length}</strong> entries
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
                className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 text-[11px] font-bold text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
                className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
