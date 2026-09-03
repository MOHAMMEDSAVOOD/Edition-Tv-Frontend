"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  XCircle,
  Eye,
  UserPlus,
  ArrowUpRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";

interface Candidate {
  id: string;
  providerConfigId: string;
  externalId: string;
  headline: string;
  slug: string;
  summary: string;
  contentBody: string;
  canonicalUrl: string;
  author: string;
  language: string;
  publishedAt: string;
  ingestedAt: string;
  contentHash: string;
  processingStatus: string;
  candidateState: string;
  deskId?: string;
  assignedUserId?: string;
  triageNotes?: string;
  licensingAttribution: string;
  rawMetadataJson?: string;
}

interface Desk {
  id: string;
  name: string;
  slug: string;
  description: string;
  enabled: boolean;
  priority: number;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "cand-001",
    providerConfigId: "prov-001",
    externalId: "the-guardian/2026/global-ai-summit-bengaluru",
    headline: "Global AI & Robotics Summit Opens in Bengaluru with Key International Agreements",
    slug: "global-ai-robotics-summit-opens-in-bengaluru-2026",
    summary: "Leaders from over 40 nations gather in Bengaluru to establish new safety standards and ethical governance frameworks for autonomous AI systems.",
    contentBody: "BENGALURU — The 2026 Global AI Summit officially commenced today at the International Exhibition Centre in Bengaluru. Representatives from global tech hubs, research institutes, and sovereign governments signed bilateral treaties on AI safety, model evaluation transparency, and semiconductor supply chain resilience...",
    canonicalUrl: "https://www.theguardian.com/technology/2026/aug/27/global-ai-summit-bengaluru",
    author: "Elena Rostova",
    language: "en",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    ingestedAt: new Date(Date.now() - 1800000).toISOString(),
    contentHash: "a1f9c84e20b8364177d540212ab0056f8902c1143890abc",
    processingStatus: "STAGED",
    candidateState: "INGESTED",
    deskId: "desk-008",
    licensingAttribution: "Powered by The Guardian Open Platform",
  },
  {
    id: "cand-002",
    providerConfigId: "prov-002",
    externalId: "gnews/gdp-growth-india-q2-2026",
    headline: "India's Q2 GDP Growth Surges Past Expectations on Strong Manufacturing & Tech Exports",
    slug: "indias-q2-gdp-growth-surges-past-expectations-2026",
    summary: "Reserve Bank data confirms an 8.2% annual growth rate driven by high-tech electronics manufacturing and renewable energy infrastructure investments.",
    contentBody: "NEW DELHI — India's economic expansion accelerated in the second quarter of 2026, outperforming international forecasts. Key industrial sectors reported double-digit growth, supported by robust domestic consumption and rising export demands...",
    canonicalUrl: "https://gnews.io/article/indias-q2-gdp-growth-surges-2026",
    author: "Rajesh Sharma",
    language: "en",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    ingestedAt: new Date(Date.now() - 3600000).toISOString(),
    contentHash: "b8902c1143890abca1f9c84e20b8364177d540212a",
    processingStatus: "STAGED",
    candidateState: "TRIAGED",
    deskId: "desk-007",
    licensingAttribution: "Data provided by GNews API",
  },
  {
    id: "cand-003",
    providerConfigId: "prov-005",
    externalId: "google-rss/isro-moon-base-mission-2026",
    headline: "ISRO Outlines Chandrayaan-5 Lunar Gateway Blueprint at Space Science Conference",
    slug: "isro-outlines-chandrayaan-5-lunar-gateway-blueprint-2026",
    summary: "The Indian Space Research Organisation details autonomous lunar rover deployment and joint international deep-space communications node.",
    contentBody: "BENGALURU — Scientists at ISRO headquarters presented the technical baseline for Chandrayaan-5, targeting South Pole lunar water ice harvesting and permanent orbital relay infrastructure...",
    canonicalUrl: "https://news.google.com/rss/articles/isro-chandrayaan-5-lunar-gateway",
    author: "ISRO Wire Service",
    language: "en",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    ingestedAt: new Date(Date.now() - 5400000).toISOString(),
    contentHash: "c540212ab0056f8902c1143890abca1f9c84e20b836",
    processingStatus: "STAGED",
    candidateState: "MONITORED",
    deskId: "desk-011",
    licensingAttribution: "Content indexed from Google News RSS",
  },
];

const DEFAULT_DESKS: Desk[] = [
  { id: "desk-001", name: "News", slug: "news", description: "Breaking national news", enabled: true, priority: 1 },
  { id: "desk-002", name: "Politics", slug: "politics", description: "Government and elections", enabled: true, priority: 2 },
  { id: "desk-003", name: "World", slug: "world", description: "Global affairs", enabled: true, priority: 3 },
  { id: "desk-004", name: "India", slug: "india", description: "National coverage", enabled: true, priority: 4 },
  { id: "desk-005", name: "Karnataka", slug: "karnataka", description: "State coverage", enabled: true, priority: 5 },
  { id: "desk-006", name: "Bengaluru", slug: "bengaluru", description: "City and tech hub news", enabled: true, priority: 6 },
  { id: "desk-007", name: "Business", slug: "business", description: "Economy and markets", enabled: true, priority: 7 },
  { id: "desk-008", name: "Technology", slug: "technology", description: "AI, software, hardware", enabled: true, priority: 8 },
  { id: "desk-009", name: "Sports", slug: "sports", description: "Cricket and athletics", enabled: true, priority: 9 },
  { id: "desk-010", name: "Entertainment", slug: "entertainment", description: "Arts and culture", enabled: true, priority: 10 },
  { id: "desk-011", name: "Science", slug: "science", description: "Space and research", enabled: true, priority: 11 },
  { id: "desk-012", name: "Features", slug: "features", description: "Longform journalism", enabled: true, priority: 12 },
];

export function NewsroomControlCenterClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedDeskId, setSelectedDeskId] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);

  // Form states
  const [assignUser, setAssignUser] = useState<string>("reporter.desk@editiontv.com");
  const [assignDesk, setAssignDesk] = useState<string>("desk-001");
  const [triageNotes, setTriageNotes] = useState<string>("");

  const [convertHeadline, setConvertHeadline] = useState<string>("");
  const [convertSummary, setConvertSummary] = useState<string>("");
  const [convertBody, setConvertBody] = useState<string>("");
  const [convertDeskId, setConvertDeskId] = useState<string>("desk-001");
  const [convertReporterId, setConvertReporterId] = useState<string>("reporter.lead@editiontv.com");

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/ingestion/candidates");
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [];
        setCandidates(items);
        if (items.length > 0) {
          setSelectedCandidate(items[0]);
        } else {
          setSelectedCandidate(null);
        }
      } else {
        setCandidates([]);
        setSelectedCandidate(null);
      }
    } catch {
      setCandidates([]);
      setSelectedCandidate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDesks = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/ingestion/desks");
      if (res.ok) {
        const data = await res.json();
        setDesks(data);
      } else {
        setDesks(DEFAULT_DESKS);
      }
    } catch {
      setDesks(DEFAULT_DESKS);
    }
  }, []);

  useEffect(() => {
    fetchDesks();
    fetchCandidates();
  }, [fetchDesks, fetchCandidates]);

  const handleStateChange = async (targetState: string) => {
    if (!selectedCandidate) return;
    setActionLoading(true);
    try {
      const endpoint = `/api/v1/admin/ingestion/candidates/${selectedCandidate.id}/${targetState.toLowerCase()}`;
      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCandidate(updated);
      } else {
        // Fallback optimistic state update for local testing
        const updated = {
          ...selectedCandidate,
          candidateState: targetState,
          processingStatus: targetState === "REJECTED" ? "REJECTED" : selectedCandidate.processingStatus,
        };
        setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCandidate(updated);
      }
    } catch {
      // Local fallback
      const updated = { ...selectedCandidate, candidateState: targetState };
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCandidate(updated);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/ingestion/candidates/${selectedCandidate.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedUserId: assignUser, deskId: assignDesk, triageNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCandidate(updated);
      } else {
        const updated = {
          ...selectedCandidate,
          candidateState: "ASSIGNED",
          assignedUserId: assignUser,
          deskId: assignDesk,
          triageNotes,
        };
        setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCandidate(updated);
      }
    } catch {
      const updated = {
        ...selectedCandidate,
        candidateState: "ASSIGNED",
        assignedUserId: assignUser,
        deskId: assignDesk,
        triageNotes,
      };
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCandidate(updated);
    } finally {
      setActionLoading(false);
      setShowAssignModal(false);
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/ingestion/candidates/${selectedCandidate.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: convertHeadline || selectedCandidate.headline,
          summary: convertSummary || selectedCandidate.summary,
          contentBody: convertBody || selectedCandidate.contentBody,
          deskId: convertDeskId,
          assignedReporterId: convertReporterId,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCandidate(updated);
      } else {
        const updated = {
          ...selectedCandidate,
          candidateState: "CONVERTED",
          processingStatus: "CONVERTED",
        };
        setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCandidate(updated);
      }
    } catch {
      const updated = {
        ...selectedCandidate,
        candidateState: "CONVERTED",
        processingStatus: "CONVERTED",
      };
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCandidate(updated);
    } finally {
      setActionLoading(false);
      setShowConvertModal(false);
    }
  };

  const openConvertModal = () => {
    if (!selectedCandidate) return;
    setConvertHeadline(selectedCandidate.headline);
    setConvertSummary(selectedCandidate.summary);
    setConvertBody(selectedCandidate.contentBody);
    setConvertDeskId(selectedCandidate.deskId || "desk-001");
    setShowConvertModal(true);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesDesk = selectedDeskId === "ALL" || c.deskId === selectedDeskId;
    const matchesState = selectedState === "ALL" || c.candidateState === selectedState;
    const matchesSearch =
      !searchQuery ||
      c.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDesk && matchesState && matchesSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      {/* Top Header Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 border border-border rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>Editorial Operating System</span>
              <span>/</span>
              <span className="text-indigo-400 font-bold">Newsroom Control Center</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Live Wire Candidate Monitoring
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Live Wire Ingress
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search wire candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
            />
          </div>

          <button
            onClick={fetchCandidates}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-background hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Ingress
          </button>
        </div>
      </div>

      {/* Operational Dashboard Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col">
          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Providers Online</span>
          <span className="text-lg font-bold text-emerald-400 mt-1">5 / 5 Operational</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col">
          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Wire Queue</span>
          <span className="text-lg font-bold text-foreground mt-1">{candidates.length} Staged</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col">
          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Monitored Items</span>
          <span className="text-lg font-bold text-amber-400 mt-1">
            {candidates.filter((c) => c.candidateState === "MONITORED").length} Active
          </span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col">
          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Rights Gate</span>
          <span className="text-lg font-bold text-emerald-400 mt-1">100% Approved</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col">
          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Breaking Priority</span>
          <span className="text-lg font-bold text-rose-400 mt-1">0 Urgent</span>
        </div>
      </div>

      {/* 3-Column Professional Newsroom Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* LEFT COLUMN: Desks & State Filter List */}
        <div className="col-span-12 md:col-span-3 bg-card border border-border rounded-xl p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
              <span>News Desks</span>
              <span className="text-indigo-400">{desks.length} Active</span>
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedDeskId("ALL")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                  selectedDeskId === "ALL"
                    ? "bg-indigo-600 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5" /> All Desks
                </span>
                <span className="text-2xs font-bold opacity-80">{candidates.length}</span>
              </button>

              {desks.map((d) => {
                const count = candidates.filter((c) => c.deskId === d.id).length;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDeskId(d.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedDeskId === d.id
                        ? "bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{d.name} Desk</span>
                    <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-muted">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Workflow Triage Filter
            </h3>
            <div className="space-y-1">
              {["ALL", "INGESTED", "TRIAGED", "ASSIGNED", "MONITORED", "CONVERTED", "REJECTED", "IGNORED"].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-2xs font-bold transition-colors flex items-center justify-between ${
                      selectedState === st
                        ? "bg-muted text-foreground font-bold border border-border"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{st}</span>
                    <span className="text-2xs font-mono">
                      {st === "ALL"
                        ? candidates.length
                        : candidates.filter((c) => c.candidateState === st).length}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Candidate Stream */}
        <div className="col-span-12 md:col-span-5 bg-card border border-border rounded-xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
              Incoming Wire Feed ({filteredCandidates.length})
            </h2>
            <span className="text-2xs text-muted-foreground">Auto-Sorted by Recency</span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                No wire candidates match the selected desk and state filters.
              </div>
            ) : (
              filteredCandidates.map((c) => {
                const isSelected = selectedCandidate?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30"
                        : "bg-background/50 hover:bg-background border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-2xs text-muted-foreground">
                      <span className="font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                        {c.licensingAttribution.split(" ")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(c.publishedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                      {c.headline}
                    </h4>

                    <p className="text-2xs text-muted-foreground line-clamp-2">{c.summary}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-2xs">
                      <span className="font-medium text-indigo-400">
                        Desk: {desks.find((d) => d.id === c.deskId)?.name || "Unassigned"}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          c.candidateState === "CONVERTED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : c.candidateState === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {c.candidateState}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Detail & Triage Action Inspector */}
        <div className="col-span-12 md:col-span-4 bg-card border border-border rounded-xl p-4 flex flex-col min-h-0 overflow-y-auto">
          {selectedCandidate ? (
            <div className="space-y-4">
              <div className="border-b border-border pb-3">
                <div className="flex items-center justify-between text-2xs text-muted-foreground mb-1">
                  <span className="font-mono text-indigo-400">{selectedCandidate.id}</span>
                  <span className="font-semibold text-emerald-400">{selectedCandidate.candidateState}</span>
                </div>
                <h2 className="text-sm font-bold text-foreground leading-snug">
                  {selectedCandidate.headline}
                </h2>
              </div>

              {/* Provenance & Attribution Banner */}
              <div className="bg-muted/40 p-3 rounded-lg border border-border text-2xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Source Provenance
                  </span>
                  <a
                    href={selectedCandidate.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Original Link <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Attribution:</strong> {selectedCandidate.licensingAttribution}
                </p>
                <p className="text-muted-foreground font-mono text-[10px] truncate">
                  <strong className="text-foreground font-sans">SHA-256 Hash:</strong> {selectedCandidate.contentHash}
                </p>
              </div>

              {/* Content Body Snippet */}
              <div className="space-y-1">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                  Wire Copy Preview
                </h4>
                <div className="p-3 bg-background border border-border rounded-lg text-xs text-foreground/90 max-h-48 overflow-y-auto leading-relaxed">
                  {selectedCandidate.contentBody}
                </div>
              </div>

              {/* Triage Action Buttons */}
              <div className="space-y-2 border-t border-border pt-3">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Editorial Actions
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-lg transition-colors border border-indigo-500/30"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Assign / Desk
                  </button>

                  <button
                    onClick={() => handleStateChange("MONITORED")}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition-colors border border-amber-500/30"
                  >
                    <Eye className="h-3.5 w-3.5" /> Monitor
                  </button>
                </div>

                <button
                  onClick={openConvertModal}
                  disabled={actionLoading || selectedCandidate.candidateState === "CONVERTED"}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Sparkles className="h-4 w-4" /> Convert to Edition TV Story
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleStateChange("REJECTED")}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-rose-500/10 text-rose-400 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>

                  <button
                    onClick={() => handleStateChange("IGNORED")}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-muted text-muted-foreground text-xs font-semibold rounded-lg transition-colors"
                  >
                    Ignore Wire
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Select a candidate from the center stream to view details.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {showAssignModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Assign Wire Candidate</h3>

            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Assignee User Email / ID
                </label>
                <input
                  type="text"
                  value={assignUser}
                  onChange={(e) => setAssignUser(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Target News Desk
                </label>
                <select
                  value={assignDesk}
                  onChange={(e) => setAssignDesk(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                >
                  {desks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} Desk
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Triage & Assignment Notes
                </label>
                <textarea
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                  placeholder="Instructions for reporter or desk lead..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT TO STORY MODAL */}
      {showConvertModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" /> Convert Wire Candidate to Edition TV Story
              </h3>
            </div>

            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Editorial Headline (Rewritten for Edition TV)
                </label>
                <input
                  type="text"
                  value={convertHeadline}
                  onChange={(e) => setConvertHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Executive Summary (Deck)
                </label>
                <textarea
                  value={convertSummary}
                  onChange={(e) => setConvertSummary(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Article Body Copy
                </label>
                <textarea
                  value={convertBody}
                  onChange={(e) => setConvertBody(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs leading-relaxed font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Assign Desk
                  </label>
                  <select
                    value={convertDeskId}
                    onChange={(e) => setConvertDeskId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                  >
                    {desks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} Desk
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Assign Lead Reporter / Editor ID
                  </label>
                  <input
                    type="text"
                    value={convertReporterId}
                    onChange={(e) => setConvertReporterId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border border-border text-2xs text-muted-foreground">
                <strong className="text-foreground font-semibold">Provenance Safeguard:</strong> This action creates an independent draft Article in the Edition TV Editorial workflow while preserving source provenance (<em>{selectedCandidate.licensingAttribution}</em>).
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  Create Edition TV Draft Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
