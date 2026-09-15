"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface ResearchNote {
  id: string;
  topic: string;
  content: string;
  updated: string;
}

export function ResearchClient() {
  // TODO: persist research notes to the backend. Empty until that endpoint is wired.
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    const newNote: ResearchNote = {
      id: `r-${Date.now()}`,
      topic: topic.trim(),
      content: content.trim(),
      updated: "Just now",
    };
    setNotes([newNote, ...notes]);
    setTopic("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.length === 0 && (
          <p className="p-6 text-center text-xs text-muted-foreground">No research notes.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="bg-card border border-border p-4 rounded-md space-y-2 relative group shadow-xs">
            <div className="flex items-center justify-between text-xs border-b border-border pb-2">
              <span className="font-bold text-foreground line-clamp-1">{note.topic}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{note.updated}</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed font-sans line-clamp-4">{note.content}</p>
            <button
              onClick={() => handleDelete(note.id)}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleAdd} className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs h-fit">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Plus className="h-4 w-4 text-primary" /> Create Research Note
        </h3>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Topic / Headline</label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Battery Energy Density Stats"
            className="w-full px-3 py-1.5 border border-border bg-background rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Research Details & Quotes</label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste background facts, links, quotes..."
            className="w-full px-3 py-2 border border-border bg-background rounded-md text-xs focus:outline-none resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={!topic.trim()}
          className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-md text-xs hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
        >
          Save Research Note
        </button>
      </form>
    </div>
  );
}
