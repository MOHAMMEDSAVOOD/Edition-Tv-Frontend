"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentEntry {
  id: string;
  title: string;
  slug: string;
  type: "Article" | "Live Blog" | "Opinion" | "Breaking Alert";
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED";
  authorName: string;
  updatedAt: string;
  version: number;
}

const INITIAL_ENTRIES: ContentEntry[] = [
  {
    id: "entry-1",
    title: "Global AI Engineering Standard Adopted Across Enterprise Systems",
    slug: "enterprise-ai-standards",
    type: "Article",
    status: "PUBLISHED",
    authorName: "Elena Rostova",
    updatedAt: "10 mins ago",
    version: 4,
  },
  {
    id: "entry-2",
    title: "Federal Reserve Holds Rates Steady Amid Signs of Cooling Inflation",
    slug: "fed-rates-decision-august-2026",
    type: "Article",
    status: "PUBLISHED",
    authorName: "Sarah Chen",
    updatedAt: "45 mins ago",
    version: 2,
  },
  {
    id: "entry-3",
    title: "EU Passes Landmark AI Chip Export Controls Targeting Advanced Semiconductors",
    slug: "ai-chip-regulation-eu-2026",
    type: "Article",
    status: "UNDER_REVIEW",
    authorName: "Marcus Vance",
    updatedAt: "2 hours ago",
    version: 3,
  },
  {
    id: "entry-4",
    title: "Global Tech & Climate Summit Live Stream Updates",
    slug: "global-tech-summit-live",
    type: "Live Blog",
    status: "PUBLISHED",
    authorName: "Amara Diallo",
    updatedAt: "3 hours ago",
    version: 12,
  },
  {
    id: "entry-5",
    title: "Quantum Computing Breakthrough in Superconducting Qubits",
    slug: "quantum-computing-breakthrough",
    type: "Article",
    status: "DRAFT",
    authorName: "Priya Nair",
    updatedAt: "5 hours ago",
    version: 1,
  },
  {
    id: "entry-6",
    title: "Automated AI Toxicity Moderation Engine Analysis",
    slug: "ai-toxicity-moderation-engine",
    type: "Opinion",
    status: "APPROVED",
    authorName: "Elena Rostova",
    updatedAt: "Yesterday",
    version: 2,
  },
  {
    id: "entry-7",
    title: "Emergency Regional Security Escalation Alert",
    slug: "regional-security-escalation-alert",
    type: "Breaking Alert",
    status: "SCHEDULED",
    authorName: "James Whitfield",
    updatedAt: "Yesterday",
    version: 1,
  },
];

export function ContentTableClient() {
  const [entries, setEntries] = useState<ContentEntry[]>(INITIAL_ENTRIES);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.authorName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, search, typeFilter, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((e) => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setActiveMenuId(null);
  };

  const handleBulkDelete = () => {
    setEntries((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
    setSelectedIds([]);
  };

  const getStatusBadgeClass = (status: ContentEntry["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "APPROVED":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      case "UNDER_REVIEW":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "SCHEDULED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "DRAFT":
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="bg-card border border-border rounded-md shadow-xs overflow-hidden space-y-0">
      {/* Table Filter Toolbar */}
      <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, author..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-background border border-border text-xs rounded-md px-2.5 py-1.5 focus:outline-none font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="Article">Article</option>
              <option value="Live Blog">Live Blog</option>
              <option value="Opinion">Opinion</option>
              <option value="Breaking Alert">Breaking Alert</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border text-xs rounded-md px-2.5 py-1.5 focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls if selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-md text-indigo-400 font-semibold">
            <span>{selectedIds.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="ml-2 text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="h-3 w-3" /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
            <tr>
              <th className="p-3 w-10 text-center">
                <button onClick={toggleSelectAll}>
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </th>
              <th className="p-3">Title & Slug</th>
              <th className="p-3 w-28">Content Type</th>
              <th className="p-3 w-28">Status</th>
              <th className="p-3 w-32">Author</th>
              <th className="p-3 w-28">Updated</th>
              <th className="p-3 w-16 text-center">Ver</th>
              <th className="p-3 w-12 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground italic">
                  No content entries match your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const isSelected = selectedIds.includes(entry.id);
                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors group",
                      isSelected && "bg-indigo-500/5"
                    )}
                  >
                    <td className="p-3 text-center">
                      <button onClick={() => toggleSelect(entry.id)}>
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-indigo-400" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-medium">
                      <Link
                        href={`/content/${entry.id}/edit`}
                        className="text-foreground font-bold hover:text-indigo-400 transition-colors block text-sm line-clamp-1"
                      >
                        {entry.title}
                      </Link>
                      <span className="text-[10px] font-mono text-muted-foreground">/{entry.slug}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-semibold text-muted-foreground border border-border">
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider",
                          getStatusBadgeClass(entry.status)
                        )}
                      >
                        {entry.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground font-medium">{entry.authorName}</td>
                    <td className="p-3 text-muted-foreground text-[11px] whitespace-nowrap">{entry.updatedAt}</td>
                    <td className="p-3 text-center font-mono text-[11px] text-muted-foreground">v{entry.version}</td>
                    <td className="p-3 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === entry.id ? null : entry.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {activeMenuId === entry.id && (
                        <div className="absolute right-3 top-10 w-36 bg-popover border border-border rounded-md shadow-md py-1 z-30 text-left">
                          <Link
                            href={`/content/${entry.id}/edit`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors text-foreground font-medium"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit Entry
                          </Link>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-red-500/10 text-red-400 transition-colors font-medium"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} of {entries.length} entries</span>
        <div className="flex items-center gap-1 font-semibold">
          <button disabled className="px-2.5 py-1 rounded border border-border opacity-50 cursor-not-allowed">Previous</button>
          <button className="px-2.5 py-1 rounded border border-border bg-indigo-600 text-white">1</button>
          <button disabled className="px-2.5 py-1 rounded border border-border opacity-50 cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  );
}
