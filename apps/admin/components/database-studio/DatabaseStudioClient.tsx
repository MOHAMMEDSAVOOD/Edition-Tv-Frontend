"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@edition/auth";
import { Table, Search, Database, ChevronRight, ChevronLeft, Trash2, AlertCircle } from "lucide-react";
import { apiClient, ApiError, API_ORIGIN } from "@/lib/api-client";

/**
 * The backend's DatabaseStudioController is mounted at the server root
 * (`/internal/database-studio/**`, ROLE_ADMIN, non-prod profiles only) — not
 * under `/api/v1` — so we address it via the API origin.
 */
const DB_STUDIO_BASE = `${API_ORIGIN}/internal/database-studio`;

interface DBTable {
  tableName: string;
  tableType: string;
}

interface TableMetadata {
  columns: {
    columnName: string;
    dataType: string;
    isNullable: string;
    isPrimaryKey: boolean;
  }[];
  primaryKeys: string[];
}

export default function DatabaseStudioClient() {
  const [tables, setTables] = useState<DBTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TableMetadata | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const { user, loading: authLoading, hasRole } = useAuth();
  const isAdmin = hasRole("ROLE_ADMIN");

  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.uid]);

  useEffect(() => {
    if (selectedTable) {
      setPage(0);
      fetchMetadata(selectedTable);
      fetchRecords(selectedTable, 0);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<{ table_name: string }[]>(`${DB_STUDIO_BASE}/tables`);
      if (!data) throw new Error("Failed to fetch tables");
      // map { table_name: 'xyz' } to DBTable format used in UI
      setTables(data.map((t) => ({ tableName: t.table_name, tableType: 'BASE TABLE' })));
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setForbidden(true);
      } else if (err instanceof ApiError && err.status === 404) {
        setError("Database Studio is not available on this backend (it is only enabled outside the prod profile).");
      } else {
        setError("Failed to fetch tables: " + ((err as Error).message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async (tableName: string) => {
    try {
      const data = await apiClient.get<{
        columns: { column_name: string; data_type: string; is_nullable: string }[];
        primaryKeys: { column_name: string }[];
      }>(`${DB_STUDIO_BASE}/tables/${encodeURIComponent(tableName)}/schema`);
      
      if (!data) throw new Error("Failed to fetch metadata");
      
      // format to match expected UI metadata structure
      const formattedMetadata: TableMetadata = {
        columns: data.columns.map((c) => ({
          columnName: c.column_name,
          dataType: c.data_type,
          isNullable: c.is_nullable,
          isPrimaryKey: data.primaryKeys.some((pk) => pk.column_name === c.column_name)
        })),
        primaryKeys: data.primaryKeys.map((pk) => pk.column_name)
      };
      
      setMetadata(formattedMetadata);
    } catch (err: unknown) {
      setError("Failed to fetch metadata: " + (err as Error).message);
    }
  };

  const fetchRecords = async (tableName: string, pageNum: number) => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ records: Record<string, unknown>[] }>(`${DB_STUDIO_BASE}/tables/${encodeURIComponent(tableName)}/records?page=${pageNum + 1}&size=${pageSize}`);
      if (!data) throw new Error("Failed to fetch records");
      setRecords(data.records);
      setPage(pageNum);
    } catch (err: unknown) {
      setError("Failed to fetch records: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (pkColumn: string, pkValue: string) => {
    if (!selectedTable) return;
    if (!confirm(`Are you sure you want to delete record with ${pkColumn} = ${pkValue}?`)) return;
    
    try {
      await apiClient.delete<unknown>(`${DB_STUDIO_BASE}/tables/${encodeURIComponent(selectedTable)}/records?pkColumn=${encodeURIComponent(pkColumn)}&pkValue=${encodeURIComponent(pkValue)}`);
      // Refresh
      fetchRecords(selectedTable, page);
    } catch (err: unknown) {
      alert("Failed to delete: " + (err as Error).message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-sm relative">

      {/* Access Overlay: not signed in, or backend rejected the Firebase token / role */}
      {!authLoading && (!user || forbidden || !isAdmin) && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-3">
            <h2 className="text-xl font-bold">Admin Access Required</h2>
            <p className="text-sm text-gray-600">
              {!user
                ? "Sign in with an administrator account to open Database Studio."
                : "Database Studio requires ROLE_ADMIN. The backend rejected this account's Firebase token."}
            </p>
            <Link href="/login" className="block w-full text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
              Go to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full font-sans">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-900 font-heading">
          <Database className="w-5 h-5 text-red-600" />
          Database Studio
        </div>
        
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tables..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
          {loading && !tables.length ? (
            <div className="p-4 text-center text-gray-400">Loading tables...</div>
          ) : (
            <div className="space-y-0.5">
              {tables.map(t => (
                <button
                  key={t.tableName}
                  onClick={() => setSelectedTable(t.tableName)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 truncate transition-colors ${
                    selectedTable === t.tableName 
                      ? 'bg-red-50 text-red-700 font-bold border border-red-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Table className="w-4 h-4 opacity-70" />
                  <span className="truncate">{t.tableName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        
        {!selectedTable ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Database className="w-16 h-16 mb-4 opacity-20" />
            <h2 className="text-xl font-medium text-gray-600">Select a table to view data</h2>
            <p className="mt-2">View and manage records in the PostgreSQL database.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{selectedTable}</h1>
                <p className="text-gray-500 text-xs mt-1">
                  {metadata ? `${metadata.columns.length} columns` : 'Loading metadata...'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 0}
                  onClick={() => fetchRecords(selectedTable, page - 1)}
                  className="p-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-gray-600 text-xs">Page {page + 1}</span>
                <button 
                  disabled={records.length < pageSize}
                  onClick={() => fetchRecords(selectedTable, page + 1)}
                  className="p-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-gray-50 p-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-0 z-10 bg-gray-50 border-r border-gray-200 w-16 text-center">
                          Actions
                        </th>
                        {metadata?.columns.map(col => (
                          <th key={col.columnName} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {col.columnName}
                              {col.isPrimaryKey && <span className="text-yellow-500" title="Primary Key">🔑</span>}
                            </div>
                            <div className="text-[10px] text-gray-400 font-normal lowercase">{col.dataType}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading && records.length === 0 ? (
                        <tr>
                          <td colSpan={(metadata?.columns.length || 0) + 1} className="px-4 py-8 text-center text-gray-500">
                            Loading data...
                          </td>
                        </tr>
                      ) : records.length === 0 ? (
                        <tr>
                          <td colSpan={(metadata?.columns.length || 0) + 1} className="px-4 py-8 text-center text-gray-500">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        records.map((record, i) => (
                          <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-4 py-2 sticky left-0 z-10 bg-white border-r border-gray-200 w-16">
                              <div className="flex items-center justify-center gap-2">
                                {/* Only allow delete if table has exactly one PK currently for simplicity */}
                                {metadata?.primaryKeys && metadata.primaryKeys.length === 1 && (
                                  <button 
                                    onClick={() => handleDelete(metadata.primaryKeys[0], String(record[metadata.primaryKeys[0]]))}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                    title="Delete record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                            {metadata?.columns.map(col => {
                              const val = record[col.columnName];
                              return (
                                <td key={col.columnName} className="px-4 py-2 border-r border-gray-100 last:border-r-0 max-w-xs truncate" title={String(val)}>
                                  {val === null ? (
                                    <span className="text-gray-400 italic">null</span>
                                  ) : typeof val === 'boolean' ? (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${val ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                      {val.toString()}
                                    </span>
                                  ) : typeof val === 'object' ? (
                                    <span className="text-gray-600 font-mono text-xs">{JSON.stringify(val)}</span>
                                  ) : (
                                    <span className="text-gray-800">{String(val)}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
