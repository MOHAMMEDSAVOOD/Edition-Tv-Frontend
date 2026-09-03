"use client";
import { useState } from "react";
import { FolderTree, Plus, Tag, Trash2 } from "lucide-react";

interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  type: "Category" | "Topic Tag";
  entryCount: number;
}

const INITIAL_TAXONOMY: TaxonomyItem[] = [
  { id: "t-1", name: "Technology", slug: "technology", type: "Category", entryCount: 142 },
  { id: "t-2", name: "Business & Economy", slug: "business", type: "Category", entryCount: 98 },
  { id: "t-3", name: "Artificial Intelligence", slug: "artificial-intelligence", type: "Topic Tag", entryCount: 64 },
  { id: "t-4", name: "Semiconductors", slug: "semiconductors", type: "Topic Tag", entryCount: 31 },
  { id: "t-5", name: "World News", slug: "world", type: "Category", entryCount: 210 },
];

export function TaxonomyClient() {
  const [items, setItems] = useState<TaxonomyItem[]>(INITIAL_TAXONOMY);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"Category" | "Topic Tag">("Topic Tag");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newItem: TaxonomyItem = {
      id: `t-${Date.now()}`,
      name: newName.trim(),
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      type: newType,
      entryCount: 0,
    };
    setItems([...items, newItem]);
    setNewName("");
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* List / Tree View */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Active Taxonomy Nodes ({items.length})</span>
        </div>

        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {item.type === "Category" ? <FolderTree className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                  <span className="text-xs font-mono text-muted-foreground">/{item.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border">
                  {item.type}
                </span>
                <span className="font-mono text-muted-foreground text-xs">{item.entryCount} entries</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-muted-foreground hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Node Form Sidebar */}
      <form onSubmit={handleAdd} className="bg-card border border-border p-5 rounded-md space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Plus className="h-4 w-4 text-indigo-400" /> Create Taxonomy Node
        </h3>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Node Name</label>
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Clean Energy"
            className="w-full px-3 py-1.5 border border-border bg-background rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-muted-foreground">Taxonomy Type</label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as "Category" | "Topic Tag")}
            className="w-full px-3 py-1.5 border border-border bg-background rounded-md text-xs font-semibold focus:outline-none"
          >
            <option value="Topic Tag">Topic Tag</option>
            <option value="Category">Category Section</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!newName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md text-xs transition-colors shadow-xs disabled:opacity-50"
        >
          Add Taxonomy Node
        </button>
      </form>
    </div>
  );
}
