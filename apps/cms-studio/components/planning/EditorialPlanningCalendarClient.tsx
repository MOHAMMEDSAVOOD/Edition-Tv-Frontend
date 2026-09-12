"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Plus, Clock, RefreshCw, List, LayoutGrid, Flame } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface PlanningEvent {
  id: string;
  title: string;
  description?: string;
  deskId?: string;
  eventDate?: string;
  priority?: string;
  createdBy?: string;
  createdAt?: string;
}

export function EditorialPlanningCalendarClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") || "LIST";

  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"CALENDAR" | "LIST">(initialView as "CALENDAR" | "LIST");
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deskId, setDeskId] = useState("WORLD");
  const [priority, setPriority] = useState("NORMAL");

  const fetchPlanningEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<PlanningEvent[]>("/admin/editorial/planning").catch(() => []);
      const list = Array.isArray(data) ? data : [];
      setEvents(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load planning calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanningEvents();
  }, [fetchPlanningEvents]);

  const handleToggleView = (mode: "CALENDAR" | "LIST") => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`/planning?${params.toString()}`);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { title, description, deskId, priority, eventDate: new Date(Date.now() + 86400000).toISOString() };
      await apiClient.post("/admin/editorial/planning", payload).catch(() => null);
      fetchPlanningEvents();
      setShowAddModal(false);
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      alert("Failed to create planning event: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span className="font-semibold text-foreground font-sans">Newsroom Planning</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Forward Editorial Calendar</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Editorial Coverage & Planning Workstation
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              <CalendarDays className="h-3 w-3" /> FORWARD SCHEDULE
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Plan multi-part packages (Breaking + Explainer + Photo gallery) across desks with URL-persisted filters.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => handleToggleView("LIST")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "LIST" ? "bg-indigo-600 text-white font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => handleToggleView("CALENDAR")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "CALENDAR" ? "bg-indigo-600 text-white font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>

          <button
            onClick={fetchPlanningEvents}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 font-bold border border-border bg-card hover:bg-muted rounded-lg transition shadow-xs text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Plan Event
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-400" /> Scheduled Events & Packages ({events.length})
            </h2>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={fetchPlanningEvents} />
          ) : loading ? (
            <div className="h-64 bg-card border border-border animate-pulse rounded-xl" />
          ) : events.length === 0 ? (
            <EmptyState title="No Planning Events Scheduled" description="Click 'Plan Event' to schedule forward coverage." />
          ) : viewMode === "CALENDAR" ? (
            <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-xs">
              <div className="grid grid-cols-7 gap-2 text-center font-mono text-[10px] font-bold text-muted-foreground border-b border-border pb-2">
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
              <div className="grid grid-cols-7 gap-2 min-h-64">
                {Array.from({ length: 14 }).map((_, idx) => (
                  <div key={idx} className="p-2 border border-border rounded-lg bg-muted/10 min-h-20 space-y-1 text-xs">
                    <span className="font-mono text-[10px] text-muted-foreground font-bold">{idx + 1}</span>
                    {events[idx % events.length] && (
                      <div className="p-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 truncate">
                        {events[idx % events.length].title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 bg-card border border-border rounded-xl flex flex-col gap-2 hover:border-indigo-500/30 transition shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                        {ev.deskId || "GENERAL"}
                      </span>
                      <StatusBadge status={ev.priority || "NORMAL"} size="sm" />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-400" /> Event Date: {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground">{ev.title}</h3>
                  {ev.description && <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs h-fit font-sans">
          <div className="border-b border-border pb-2">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" /> Desk Allocation Guidelines
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Planning forward packages prevents newsroom duplication and ensures high-priority developing stories receive adequate fact-checking and editorial review.
          </p>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl font-sans">
            <h3 className="text-sm font-bold text-foreground">Add New Editorial Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-sans resize-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Desk</label>
                  <select
                    value={deskId}
                    onChange={(e) => setDeskId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold"
                  >
                    <option value="WORLD">WORLD</option>
                    <option value="POLITICS">POLITICS</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="TECH">TECH</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold uppercase text-muted-foreground mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono font-bold"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-border rounded-lg font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
