"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { 
  FileText, 
  Layers, 
  Image as ImageIcon, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface StorySummary {
  id: string;
  headline: string;
  category: string;
  status: string;
  createdAt: string;
}

export function AdminDashboardClient() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStories: 38,
    totalCategories: 12,
    mediaFiles: 430,
    pendingReviews: 16,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Record<string, unknown>>("/articles?size=6");
      if (data) {
        const content = Array.isArray(data.content) ? data.content : [];
        setStories(content.map((art: { id?: string; headline?: string; title?: string; category?: string; status?: string; createdAt?: string }, index: number) => ({
          id: art.id || `story-${index}`,
          headline: art.headline || art.title || "Untitled Headline",
          category: art.category || "General",
          status: art.status || "PUBLISHED",
          createdAt: art.createdAt ? new Date(art.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "18 Mar",
        })));
        if (typeof data.totalElements === "number") {
          const totalStoriesCount = data.totalElements;
          setStats((prev) => ({ ...prev, totalStories: totalStoriesCount }));
        }
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto font-sans pb-10">
      
      {/* 1. Top Stat Cards Row (4 Columns matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat Card 1: Total Stories */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Stories</span>
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-serif">{stats.totalStories}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="h-3 w-3" /> 40.35%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Last 30 days</span>
        </div>

        {/* Stat Card 2: Total Categories */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Categories</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-serif">{stats.totalCategories}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <TrendingDown className="h-3 w-3" /> 2.50%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Last 30 days</span>
        </div>

        {/* Stat Card 3: Total Media Files */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Media Files</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ImageIcon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-serif">{stats.mediaFiles}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="h-3 w-3" /> 18.20%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Last 30 days</span>
        </div>

        {/* Stat Card 4: Pending Reviews */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Reviews</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-serif">{stats.pendingReviews}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="h-3 w-3" /> 12.40%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Last 30 days</span>
        </div>

      </div>

      {/* 2. Middle Row: 2 Interactive Charts (Matching Screenshot Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Post Growth Histogram */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-serif">Story Publication Growth</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-3 w-3 rounded-xs bg-red-600 inline-block" />
                <span className="text-xs text-slate-500 font-medium">Total number of stories published</span>
              </div>
            </div>
            <select className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 relative">
            {/* Hover Tooltip Pill on February */}
            <div className="absolute top-0 left-[22%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded-md shadow-md flex items-center gap-1 z-10">
              <span className="font-bold text-red-400">38 stories</span>
            </div>

            <div className="flex items-end justify-between gap-3 h-44 px-2 border-b border-slate-200 pb-2">
              <div className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-red-100 rounded-t-lg h-[40%] group-hover:bg-red-200 transition" />
                <span className="text-xs text-slate-500 font-medium">Jan</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-red-600 rounded-t-lg h-[85%] shadow-md shadow-red-600/20 group-hover:bg-red-700 transition" />
                <span className="text-xs font-bold text-slate-900">Feb</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-red-100 rounded-t-lg h-[35%] group-hover:bg-red-200 transition" />
                <span className="text-xs text-slate-500 font-medium">Mar</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-red-100 rounded-t-lg h-[65%] group-hover:bg-red-200 transition" />
                <span className="text-xs text-slate-500 font-medium">Apr</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-red-100 rounded-t-lg h-[30%] group-hover:bg-red-200 transition" />
                <span className="text-xs text-slate-500 font-medium">May</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-red-100 rounded-t-lg h-[45%] group-hover:bg-red-200 transition" />
                <span className="text-xs text-slate-500 font-medium">Jun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Chart: Comments & Editorial Trends (Curved Line Chart matching screenshot) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">Editorial & Verification Trend</h3>
            <select className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none">
              <option>Last 15 days</option>
              <option>Last 30 days</option>
            </select>
          </div>

          {/* Legend Pills */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" /> Approved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" /> Pending Review
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-600" /> Flagged / Rejected
            </span>
          </div>

          {/* SVG Smooth Curved Multi-Line Chart */}
          <div className="w-full h-44 pt-2">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Green Approved Line */}
              <path
                d="M0,140 C80,30 150,10 220,70 C290,120 370,30 500,60"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="6 4"
              />

              {/* Amber Pending Line */}
              <path
                d="M0,140 C90,80 140,40 210,90 C280,110 380,60 500,100"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="6 4"
              />

              {/* Red Flagged Line */}
              <path
                d="M0,140 C70,110 130,50 200,110 C270,130 360,70 500,120"
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: 2 Data Tables Grid (Matching Screenshot Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Table: Latest Stories */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">Latest Published Stories</h3>
            <Link href="/stories" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
              <span>View All ({stats.totalStories})</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                      Loading stories...
                    </td>
                  </tr>
                ) : stories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-mono">
                      No stories found.
                    </td>
                  </tr>
                ) : (
                  stories.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-900 max-w-[200px] truncate">
                        {s.headline}
                      </td>
                      <td className="py-3 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Published
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono">
                        {s.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Table: Recent Ingestions & Notes */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-serif">Recent Wire Ingestions & Notes</h3>
            <Link href="/news-sources" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
              <span>Manage Feeds</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Author / Source</th>
                  <th className="pb-3 font-semibold">Content Snippet</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-900">BBC News Wire</td>
                  <td className="py-3 text-slate-600 max-w-[180px] truncate">&quot;Great article on mentorship & global news!&quot;</td>
                  <td className="py-3 text-slate-400 font-mono">18 Mar</td>
                  <td className="py-3 text-right">
                    <span className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer">
                      View Wire
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-900">Reuters World</td>
                  <td className="py-3 text-slate-600 max-w-[180px] truncate">&quot;Can you share more resources on tech?&quot;</td>
                  <td className="py-3 text-slate-400 font-mono">18 Mar</td>
                  <td className="py-3 text-right">
                    <span className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer">
                      View Wire
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-900">Edition Wire</td>
                  <td className="py-3 text-slate-600 max-w-[180px] truncate">&quot;This UI layout is amazing 🔥&quot;</td>
                  <td className="py-3 text-slate-400 font-mono">18 Mar</td>
                  <td className="py-3 text-right">
                    <span className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer">
                      View Wire
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-bold text-slate-900">AP News Desk</td>
                  <td className="py-3 text-slate-600 max-w-[180px] truncate">&quot;Verified breaking report on energy economy...&quot;</td>
                  <td className="py-3 text-slate-400 font-mono">18 Mar</td>
                  <td className="py-3 text-right">
                    <span className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer">
                      View Wire
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
