"use client";
import { useState } from "react";
import { ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationScores {
  toxicity: number;
  insult: number;
  threat: number;
  profanity: number;
  identityAttack: number;
  overallStatus: "APPROVED" | "FLAGGED" | "REJECTED";
}

export function ToxicityScannerClient() {
  const [sampleText, setSampleText] = useState(
    "The integration of real-time AI toxicity scoring directly into the comment stream is impressive. Zero moderation queue lag!"
  );
  const [scores, setScores] = useState<ModerationScores | null>({
    toxicity: 0.01,
    insult: 0.0,
    threat: 0.0,
    profanity: 0.0,
    identityAttack: 0.0,
    overallStatus: "APPROVED",
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (!sampleText.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      const isToxic = sampleText.toLowerCase().includes("bad") || sampleText.toLowerCase().includes("hate");
      setScores({
        toxicity: isToxic ? 0.88 : 0.02,
        insult: isToxic ? 0.74 : 0.01,
        threat: 0.0,
        profanity: isToxic ? 0.65 : 0.0,
        identityAttack: 0.0,
        overallStatus: isToxic ? "REJECTED" : "APPROVED",
      });
      setIsScanning(false);
    }, 250);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
      {/* Input Form */}
      <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center justify-between">
          <span>Input Content / Reader Comment</span>
          <span className="text-cyan-400 font-mono text-xs flex items-center gap-1">
            <Zap className="h-3 w-3" /> Latency &lt; 50ms
          </span>
        </h3>

        <div className="space-y-1">
          <label className="font-bold text-muted-foreground">Text Buffer to Scan</label>
          <textarea
            rows={6}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y"
          />
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || !sampleText.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" /> {isScanning ? "Scanning with AI Moderation Model..." : "Run Real-Time Toxicity Audit"}
        </button>
      </div>

      {/* Audit Breakdown Panel */}
      <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center justify-between">
          <span>Safety Audit Breakdown</span>
          {scores && (
            <span
              className={cn(
                "px-2.5 py-0.5 rounded font-bold text-[11px] uppercase tracking-wider border",
                scores.overallStatus === "APPROVED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              )}
            >
              {scores.overallStatus}
            </span>
          )}
        </h3>

        {scores && (
          <div className="space-y-4">
            <div className="space-y-3 font-mono">
              {[
                { label: "Toxicity Score", val: scores.toxicity },
                { label: "Insult / Harassment", val: scores.insult },
                { label: "Severe Threat", val: scores.threat },
                { label: "Profanity Score", val: scores.profanity },
                { label: "Identity Attack", val: scores.identityAttack },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground font-semibold">{metric.label}</span>
                    <span className={metric.val > 0.3 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                      {(metric.val * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-300", metric.val > 0.3 ? "bg-red-500" : "bg-emerald-500")}
                      style={{ width: `${Math.max(metric.val * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-muted/40 border border-border rounded-md text-[11px] text-muted-foreground space-y-1 font-mono">
              <span className="font-bold text-foreground block">Event Relay Verification</span>
              <p>Rule: Auto-approve comments with toxicity score &lt; 0.05. Flagged comments routed to CMS Review Queue via Outbox.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
