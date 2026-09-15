"use client";
import { useState } from "react";
import { Bell, Send, CheckCircle2 } from "lucide-react";

interface AlertRecord {
  id: string;
  headline: string;
  target: "MOBILE_PUSH" | "WEB_PUSH" | "TV_LOWER_THIRD";
  timeSent: string;
  status: "SENT" | "PENDING";
}

export function PushAlertsClient() {
  // TODO: load the dispatch history from the notifications backend.
  const [alerts] = useState<AlertRecord[]>([]);
  const [headline, setHeadline] = useState("");
  const [target, setTarget] = useState<AlertRecord["target"]>("MOBILE_PUSH");
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    // Never log an alert as SENT locally: a breaking-news push that only exists in this tab would
    // have the desk believe readers were notified.
    setDispatchError("Push dispatch is not connected to the notifications backend yet.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 text-xs font-mono">
      {/* Alert Log Table */}
      <div className="bg-card border border-border overflow-hidden shadow-xs">
        <div className="p-3 border-b border-border bg-black/40 text-primary font-bold uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Dispatch History Log ({alerts.length})
          </span>
        </div>

        <div className="divide-y divide-border">
          {alerts.length === 0 && (
            <p className="p-6 text-center text-muted-foreground text-[11px]">No alerts dispatched.</p>
          )}
          {alerts.map((alt) => (
            <div key={alt.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="bg-primary/20 text-primary border border-primary/40 px-1.5 py-0.5 font-bold uppercase">
                    {alt.target.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground">{alt.timeSent}</span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{alt.headline}</h3>
              </div>

              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> DISPATCHED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Console Form */}
      <form onSubmit={handleDispatch} className="bg-card border border-border p-5 space-y-4 h-fit shadow-xs">
        <h3 className="font-bold text-sm text-primary flex items-center gap-2 border-b border-border pb-3 uppercase">
          <Send className="h-4 w-4" /> Dispatch Push Alert
        </h3>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Channel</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as AlertRecord["target"])}
            className="w-full bg-background border border-border p-2 text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="MOBILE_PUSH">📱 Mobile Push (iOS / Android)</option>
            <option value="WEB_PUSH">💻 Browser Web Push</option>
            <option value="TV_LOWER_THIRD">📺 TV Broadcast Lower-Third Overlay</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Alert Headline Text</label>
          <textarea
            rows={4}
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Enter urgent breaking headline text..."
            className="w-full bg-background border border-border p-2 text-xs text-foreground focus:outline-none focus:border-primary resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={!headline.trim()}
          className="w-full bg-primary text-black font-extrabold py-2 text-xs hover:opacity-90 transition-opacity uppercase shadow-xs disabled:opacity-50"
        >
          Dispatch Alert Now
        </button>

        {dispatchError && (
          <p className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]">
            {dispatchError}
          </p>
        )}
      </form>
    </div>
  );
}
