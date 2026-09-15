"use client";
import { useState } from "react";
import { Plus, Mail, Lock } from "lucide-react";

interface SourceContact {
  id: string;
  name: string;
  role: string;
  organization: string;
  credibility: "A1 (High)" | "B2 (Medium)" | "C3 (Unverified)";
  email: string;
  notes: string;
}

export function SourceVaultClient() {
  // TODO: persist the source vault to the backend. Seeding it with invented contacts, emails
  // and off-the-record notes has no place in a reporter's source list.
  const [sources, setSources] = useState<SourceContact[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newSrc: SourceContact = {
      id: `src-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      organization: org.trim(),
      // Credibility is a reporter's judgement and the address must be the real one — neither is
      // invented here. Both stay blank until they are entered.
      credibility: "C3 (Unverified)",
      email: "",
      notes: "",
    };
    setSources([...sources, newSrc]);
    setName("");
    setRole("");
    setOrg("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Sources List */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-foreground">
            <Lock className="h-3.5 w-3.5 text-emerald-500" /> Confidential Contacts ({sources.length})
          </span>
        </div>

        <div className="divide-y divide-border text-xs">
          {sources.length === 0 && (
            <p className="p-6 text-center text-xs text-muted-foreground">No sources saved.</p>
          )}
          {sources.map((src) => (
            <div key={src.id} className="p-4 space-y-2 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{src.name}</h3>
                  <span className="text-muted-foreground text-xs">{src.role} • {src.organization}</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                  {src.credibility}
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-2 py-0.5">{src.notes}</p>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {src.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Source Form */}
      <form onSubmit={handleAdd} className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Plus className="h-4 w-4 text-primary" /> Add Confidential Source
        </h3>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Source Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Jane Smith"
            className="w-full px-3 py-1.5 border border-border bg-background rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Title / Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Chief Technology Officer"
            className="w-full px-3 py-1.5 border border-border bg-background rounded-md text-xs focus:outline-none"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Organization</label>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Global Research Institute"
            className="w-full px-3 py-1.5 border border-border bg-background rounded-md text-xs focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-md text-xs hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50"
        >
          Save to Source Vault
        </button>
      </form>
    </div>
  );
}
