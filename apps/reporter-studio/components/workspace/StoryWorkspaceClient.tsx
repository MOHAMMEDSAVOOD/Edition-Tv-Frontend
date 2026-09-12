"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryWorkspaceClientProps {
  storyId: string;
}

export function StoryWorkspaceClient({ storyId }: StoryWorkspaceClientProps) {
  const [headline, setHeadline] = useState(
    "Quantum Computing Coherence Milestone Achieved in Superconducting Circuits"
  );
  const [deck, setDeck] = useState(
    "Physicists at the Zurich Quantum Center maintain 500-microsecond qubit coherence, opening new pathways for fault-tolerant error correction."
  );
  const [bodyText, setBodyText] = useState(
    `ZURICH — In what researchers are calling a pivotal advance for practical quantum computing, an international team of physicists has demonstrated a tenfold increase in superconducting qubit coherence times under operational thermal loads.\n\nThe findings, scheduled for publication in Physical Review X, address the primary bottleneck holding back commercial quantum scaling: rapid decoherence caused by environmental thermal fluctuations.\n\n"We are moving from proof-of-concept physics to true engineering reliability," said lead researcher Dr. Anna Lindqvist in an exclusive interview with Edition TV.`
  );
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");
  const [activeRightTab, setActiveRightTab] = useState<"sources" | "notes">("sources");

  // Research / Sources state
  const [sources] = useState([
    { name: "Dr. Anna Lindqvist", affiliation: "Zurich Quantum Center", verified: true, quote: "Decoherence is no longer an insurmountable barrier." },
    { name: "Dr. Aris Thorne", affiliation: "MIT Lincoln Laboratory", verified: true, quote: "The 500us benchmark exceeds our 2026 roadmap expectations." },
  ]);

  const [notes, setNotes] = useState([
    "Key stat: 500us coherence vs 50us legacy benchmark",
    "Paper title: Thermal Shielding in Superconducting Transmon Architecture",
    "Embargo lifts: Today at 17:00 EST",
  ]);

  const [newNote, setNewNote] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([...notes, newNote.trim()]);
    setNewNote("");
  };

  const fontClasses = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono text-xs leading-relaxed",
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-none bg-card px-4 py-2 rounded-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Story Workspace #{storyId}
            </span>
            <h1 className="text-sm font-bold text-foreground line-clamp-1">{headline || "Untitled Story"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Typography toggle */}
          <div className="flex items-center gap-1 border border-border rounded p-0.5 bg-muted/40 font-mono text-[11px]">
            <button
              onClick={() => setFontFamily("sans")}
              className={cn("px-2 py-0.5 rounded", fontFamily === "sans" && "bg-background text-foreground font-bold")}
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily("serif")}
              className={cn("px-2 py-0.5 rounded", fontFamily === "serif" && "bg-background text-foreground font-bold")}
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily("mono")}
              className={cn("px-2 py-0.5 rounded", fontFamily === "mono" && "bg-background text-foreground font-bold")}
            >
              Mono
            </button>
          </div>

          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded text-xs hover:opacity-90 shadow-xs">
            <Save className="h-3.5 w-3.5" /> Save Draft
          </button>
        </div>
      </div>

      {/* Main Split View: Draft Editor (60%) vs Research/Sources (40%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 min-h-0 overflow-hidden">
        {/* Left Column (60%): Notion-style Draft Canvas */}
        <div className="bg-card border border-border p-6 rounded-md space-y-4 overflow-y-auto pr-3 no-scrollbar flex flex-col">
          {/* Headline Input */}
          <textarea
            rows={2}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Story Headline..."
            className="w-full text-2xl font-extrabold bg-transparent border-b border-border/40 pb-2 text-foreground focus:outline-none focus:border-primary resize-none font-sans"
          />

          {/* Subtitle Deck */}
          <textarea
            rows={2}
            value={deck}
            onChange={(e) => setDeck(e.target.value)}
            placeholder="Deck / Subtitle summary..."
            className="w-full text-sm font-medium text-muted-foreground bg-transparent border-b border-border/40 pb-2 focus:outline-none focus:border-primary resize-none font-sans"
          />

          {/* Main Draft Body */}
          <textarea
            rows={16}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Type your story draft here. Markdown supported..."
            className={cn(
              "w-full flex-1 bg-transparent text-sm text-foreground focus:outline-none resize-y leading-relaxed",
              fontClasses[fontFamily]
            )}
          />

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{bodyText.split(/\s+/).filter(Boolean).length} words</span>
            <span>{bodyText.length} characters</span>
          </div>
        </div>

        {/* Right Column (40%): Research Notes & Source Vault Split */}
        <div className="bg-card border border-border rounded-md flex flex-col min-h-0 overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center border-b border-border text-xs font-bold bg-muted/20">
            <button
              onClick={() => setActiveRightTab("sources")}
              className={cn(
                "flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5",
                activeRightTab === "sources"
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="h-3.5 w-3.5" /> Source Vault ({sources.length})
            </button>
            <button
              onClick={() => setActiveRightTab("notes")}
              className={cn(
                "flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5",
                activeRightTab === "notes"
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" /> Research Notes ({notes.length})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs no-scrollbar">
            {activeRightTab === "sources" && (
              <div className="space-y-3">
                {sources.map((src, i) => (
                  <div key={i} className="p-3 bg-muted/30 border border-border rounded-md space-y-1">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>{src.name}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                        Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{src.affiliation}</span>
                    <blockquote className="italic text-muted-foreground text-[11px] pt-1 border-t border-border/50">
                      &ldquo;{src.quote}&rdquo;
                    </blockquote>
                  </div>
                ))}
              </div>
            )}

            {activeRightTab === "notes" && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add research note..."
                    className="flex-1 px-3 py-1.5 border border-border bg-background rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded text-xs disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-2">
                  {notes.map((note, i) => (
                    <div key={i} className="p-2.5 bg-muted/30 border border-border rounded text-xs text-foreground flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="flex-1">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
