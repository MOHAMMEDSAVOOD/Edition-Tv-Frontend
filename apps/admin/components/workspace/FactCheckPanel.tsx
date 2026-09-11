"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

export interface EvidenceItem {
  id: string;
  storyId?: string;
  claimId?: string;
  evidenceType: string;
  title: string;
  urlOrFilepath?: string;
  sourceName?: string;
  verificationStatus: string;
  createdAt?: string;
}

interface FactCheckPanelProps {
  articleId?: string;
  onClaimsUpdated?: (claimsCount: number) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.editiontv.com/api/v1";


export function FactCheckPanel({ articleId, onClaimsUpdated }: FactCheckPanelProps) {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("PRIMARY_DOCUMENT");
  const [sourceName, setSourceName] = useState("");
  const [urlOrFilepath, setUrlOrFilepath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getAuthToken = () => {
    if (typeof window !== "undefined") return localStorage.getItem("edition_access_token");
    return null;
  };

  const fetchEvidence = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/verification/evidence?storyId=${articleId}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const list: EvidenceItem[] = Array.isArray(data) ? data : [];
      setEvidenceList(list);
      if (onClaimsUpdated) onClaimsUpdated(list.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load evidence");
    } finally {
      setLoading(false);
    }
  }, [articleId, onClaimsUpdated]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return alert("Story ID missing");
    setSubmitting(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/admin/verification/evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          storyId: articleId,
          evidenceType,
          title,
          sourceName,
          urlOrFilepath,
          verificationStatus: "VERIFIED",
        }),
      });

      if (!res.ok) throw new Error(`Add failed (${res.status})`);
      setTitle("");
      setSourceName("");
      setUrlOrFilepath("");
      await fetchEvidence();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to attach evidence");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${API_BASE}/admin/verification/evidence/${id}/status?status=${newStatus}`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error(`Status update failed (${res.status})`);
      await fetchEvidence();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider font-mono">
            Fact Check Evidence ({evidenceList.length})
          </h3>
        </div>
        <button onClick={fetchEvidence} className="text-slate-400 hover:text-slate-700 transition">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl font-mono text-[11px]">
          {error}
        </div>
      )}

      {/* Add New Evidence Form */}
      <form onSubmit={handleAddEvidence} className="p-3.5 border border-slate-200 bg-slate-50/50 rounded-xl space-y-2.5 font-mono">
        <label className="text-[10px] font-bold uppercase text-slate-500">Attach Verified Evidence Record</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Statement / Evidence title..."
          required
          className="w-full text-xs bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 font-sans"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            className="w-full text-[11px] bg-white border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-red-500"
          >
            <option value="PRIMARY_DOCUMENT">Primary Document</option>
            <option value="EXPERT_INTERVIEW">Expert Interview</option>
            <option value="GOVERNMENT_RECORD">Government Record</option>
            <option value="SATELLITE_TELEMETRY">Satellite Telemetry</option>
            <option value="WIRE_REPORT">Wire Report</option>
          </select>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Source name..."
            className="w-full text-[11px] bg-white border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>
        <input
          type="url"
          value={urlOrFilepath}
          onChange={(e) => setUrlOrFilepath(e.target.value)}
          placeholder="Source Canonical URL (https://...)"
          className="w-full text-[11px] bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition shadow-2xs text-xs font-sans"
        >
          <Plus className="h-4 w-4" /> {submitting ? "Attaching..." : "Attach Evidence"}
        </button>
      </form>

      {/* Evidence List */}
      <div className="space-y-2 font-mono">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-slate-200 bg-white rounded-xl space-y-2 animate-pulse font-sans">
                <div className="h-3 w-20 bg-slate-200 rounded-full" />
                <div className="h-4 w-full bg-slate-200 rounded-lg" />
                <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-[11px]">
            No verified evidence attached for this article.
          </div>
        ) : (
          evidenceList.map((ev) => (
            <div key={ev.id} className="p-3 border border-slate-200 bg-white rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-red-700 uppercase bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    {ev.evidenceType.replace(/_/g, " ")}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1 font-serif">{ev.title}</h4>
                </div>
                <select
                  value={ev.verificationStatus || "UNVERIFIED"}
                  onChange={(e) => handleUpdateStatus(ev.id, e.target.value)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border focus:outline-none font-mono cursor-pointer ${
                    ev.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : ev.verificationStatus === "DISPUTED"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <option value="UNVERIFIED">UNVERIFIED</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="DISPUTED">DISPUTED</option>
                </select>
              </div>

              {ev.sourceName && (
                <div className="text-[10px] text-slate-500 font-sans">
                  Source: <span className="font-bold text-slate-900">{ev.sourceName}</span>
                </div>
              )}

              {ev.urlOrFilepath && (
                <a
                  href={ev.urlOrFilepath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-red-600 font-bold hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="h-3 w-3 flex-none" /> {ev.urlOrFilepath}
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
