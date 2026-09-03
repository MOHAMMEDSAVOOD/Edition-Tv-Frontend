"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, SlidersHorizontal } from "lucide-react";

export function WritingAssistantClient() {
  const [text, setText] = useState(
    "Physicists at the Zurich Quantum Center have achieved a 500-microsecond qubit coherence milestone, opening new pathways for commercial quantum computing."
  );
  const [tone, setTone] = useState<"AP News" | "Punchy" | "Academic" | "Tabloid">("AP News");
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerateHeadlines = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setHeadlines([
        "Zurich Quantum Lab Achieves Historic 500us Qubit Coherence Milestone",
        "Quantum Computing Landmark: 10x Coherence Boost Opens Scaling Era",
        "Physicists Overcome Quantum Thermal Decoherence in Zurich Breakthrough",
        "New Transmon Shielding Technique Paves Way for Fault-Tolerant Qubits",
      ]);
      setSummaryPoints([
        "500-microsecond qubit coherence achieved under operational thermal loads.",
        "Demonstrates a 10x increase compared to 2025 legacy benchmarks.",
        "Paper scheduled for peer-reviewed publication in Physical Review X.",
      ]);
      setIsProcessing(false);
    }, 600);
  };

  const copyHeadline = (h: string, idx: number) => {
    if (navigator.clipboard) navigator.clipboard.writeText(h);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
      {/* Input Canvas */}
      <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">Input Draft / Article Context</h3>

        <div className="space-y-1">
          <label className="font-bold text-muted-foreground">Draft Text</label>
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Target Tone
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["AP News", "Punchy", "Academic", "Tabloid"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`py-1.5 rounded border text-xs font-semibold transition-colors ${tone === t ? "bg-purple-600 text-white border-purple-600" : "bg-background border-border text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateHeadlines}
          disabled={isProcessing || !text.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" /> {isProcessing ? "Processing with AI..." : "Generate Headlines & Summary"}
        </button>
      </div>

      {/* Output Panel */}
      <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center justify-between">
          <span>AI Generated Options</span>
          <span className="text-purple-400 font-mono text-xs">{tone} Mode</span>
        </h3>

        {headlines.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground italic space-y-2">
            <Sparkles className="h-8 w-8 text-purple-400/40 mx-auto" />
            <p>Click &ldquo;Generate Headlines &amp; Summary&rdquo; to process input text.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Headline Alternatives</span>
              {headlines.map((h, i) => (
                <div key={i} className="p-3 bg-muted/40 border border-border rounded-md flex items-start justify-between gap-3 group">
                  <p className="font-bold text-foreground leading-snug">{h}</p>
                  <button
                    onClick={() => copyHeadline(h, i)}
                    className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-[10px] flex-none font-bold"
                  >
                    {copiedIdx === i ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-muted-foreground uppercase text-[10px]">Executive Summary Bullets</span>
              <ul className="space-y-1.5 bg-purple-500/10 border border-purple-500/30 p-3 rounded-md">
                {summaryPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
