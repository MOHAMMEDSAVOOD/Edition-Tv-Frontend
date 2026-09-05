"use client";

import React from "react";
import {
  Type,
  Heading as HeadingIcon,
  Image as ImageIcon,
  Quote,
  Video,
  Music,
  AlertCircle,
  Clock,
  Link,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Copy
} from "lucide-react";

export interface StoryBlock {
  id: string;
  type:
    | "PARAGRAPH"
    | "HEADING"
    | "IMAGE"
    | "PULL_QUOTE"
    | "VIDEO"
    | "AUDIO"
    | "CALLOUT"
    | "TIMELINE"
    | "SOURCE";
  content: string;
  caption?: string;
  credit?: string;
  altText?: string;
  level?: number;
  url?: string;
}

interface StoryBlockComposerProps {
  blocks: StoryBlock[];
  onChange: (blocks: StoryBlock[]) => void;
  onOpenMediaLibrary?: (blockId: string) => void;
}

export function StoryBlockComposer({
  blocks,
  onChange,
  onOpenMediaLibrary,
}: StoryBlockComposerProps) {
  const addBlock = (type: StoryBlock["type"]) => {
    const newBlock: StoryBlock = {
      id: "block-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      type,
      content: "",
      level: type === "HEADING" ? 2 : undefined,
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<StoryBlock>) => {
    onChange(
      blocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const blockToCopy = blocks.find((b) => b.id === id);
    if (!blockToCopy) return;
    const index = blocks.findIndex((b) => b.id === id);
    const copied: StoryBlock = {
      ...blockToCopy,
      id: "block-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, copied);
    onChange(newBlocks);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Block List */}
      {blocks.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 bg-slate-50/50">
          <Type className="h-8 w-8 text-red-600 mx-auto" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-serif">No Story Blocks Added</h4>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">Add content blocks to build a structured editorial article.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 font-mono text-[11px]">
            <button
              onClick={() => addBlock("PARAGRAPH")}
              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition shadow-2xs"
            >
              + Paragraph
            </button>
            <button
              onClick={() => addBlock("HEADING")}
              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition shadow-2xs"
            >
              + Heading
            </button>
            <button
              onClick={() => addBlock("IMAGE")}
              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition shadow-2xs"
            >
              + Image Block
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="group border border-slate-200 bg-white rounded-2xl p-3.5 space-y-2.5 shadow-2xs hover:border-red-300 transition"
            >
              {/* Block Action Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-700 uppercase bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                    {block.type === "PARAGRAPH" && <Type className="h-3 w-3 text-red-600" />}
                    {block.type === "HEADING" && <HeadingIcon className="h-3 w-3 text-red-600" />}
                    {block.type === "IMAGE" && <ImageIcon className="h-3 w-3 text-red-600" />}
                    {block.type === "PULL_QUOTE" && <Quote className="h-3 w-3 text-red-600" />}
                    {block.type === "VIDEO" && <Video className="h-3 w-3 text-red-600" />}
                    {block.type === "AUDIO" && <Music className="h-3 w-3 text-red-600" />}
                    {block.type === "CALLOUT" && <AlertCircle className="h-3 w-3 text-red-600" />}
                    {block.type === "TIMELINE" && <Clock className="h-3 w-3 text-red-600" />}
                    {block.type === "SOURCE" && <Link className="h-3 w-3 text-red-600" />}
                    {block.type} BLOCK
                  </span>
                  <span className="text-slate-400 font-bold">Block #{idx + 1}</span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => moveBlock(idx, "up")}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveBlock(idx, "down")}
                    disabled={idx === blocks.length - 1}
                    title="Move Down"
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => duplicateBlock(block.id)}
                    title="Duplicate Block"
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeBlock(block.id)}
                    title="Delete Block"
                    className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Block Inputs based on type */}
              {block.type === "PARAGRAPH" && (
                <textarea
                  rows={3}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Enter paragraph text..."
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-red-500 font-sans leading-relaxed resize-none"
                />
              )}

              {block.type === "HEADING" && (
                <div className="flex items-center gap-2">
                  <select
                    value={block.level || 2}
                    onChange={(e) => updateBlock(block.id, { level: Number(e.target.value) })}
                    className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-red-500 text-slate-900"
                  >
                    <option value={2}>H2 Subheading</option>
                    <option value={3}>H3 Section Header</option>
                    <option value={4}>H4 Minor Header</option>
                  </select>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Enter section heading..."
                    className="flex-1 text-sm font-bold text-foreground bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  />
                </div>
              )}

              {block.type === "IMAGE" && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={block.url || ""}
                      onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                      placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                      className="flex-1 text-xs font-mono bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {onOpenMediaLibrary && (
                      <button
                        onClick={() => onOpenMediaLibrary(block.id)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        Browse Media
                      </button>
                    )}
                  </div>

                  {block.url ? (
                    <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden border border-border bg-muted/20">
                      <img src={block.url} alt={block.altText || "Block image preview"} className="object-cover w-full h-full" />
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={block.caption || ""}
                      onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                      placeholder="Caption text..."
                      className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={block.credit || ""}
                      onChange={(e) => updateBlock(block.id, { credit: e.target.value })}
                      placeholder="Photographer credit..."
                      className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={block.altText || ""}
                      onChange={(e) => updateBlock(block.id, { altText: e.target.value })}
                      placeholder="Alt text accessibility..."
                      className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {block.type === "PULL_QUOTE" && (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Enter pull quote text..."
                    className="w-full text-xs font-serif italic text-foreground bg-background border border-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  <input
                    type="text"
                    value={block.credit || ""}
                    onChange={(e) => updateBlock(block.id, { credit: e.target.value })}
                    placeholder="Quote attribution / Speaker name..."
                    className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  />
                </div>
              )}

              {(block.type === "VIDEO" || block.type === "AUDIO" || block.type === "SOURCE" || block.type === "CALLOUT" || block.type === "TIMELINE") && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={block.url || ""}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    placeholder={`${block.type} URL or Link Target...`}
                    className="w-full text-xs font-mono bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    rows={2}
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder={`${block.type} description or content text...`}
                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none font-sans"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Block Toolbar */}
      <div className="pt-2 border-t border-border flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
        <span className="text-[10px] font-bold uppercase text-muted-foreground mr-1">Insert Block:</span>
        <button
          onClick={() => addBlock("PARAGRAPH")}
          className="flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-md font-bold transition"
        >
          <Plus className="h-3 w-3" /> Paragraph
        </button>
        <button
          onClick={() => addBlock("HEADING")}
          className="flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-md font-bold transition"
        >
          <Plus className="h-3 w-3" /> Heading
        </button>
        <button
          onClick={() => addBlock("IMAGE")}
          className="flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-md font-bold transition"
        >
          <Plus className="h-3 w-3" /> Image
        </button>
        <button
          onClick={() => addBlock("PULL_QUOTE")}
          className="flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-md font-bold transition"
        >
          <Plus className="h-3 w-3" /> Pull Quote
        </button>
        <button
          onClick={() => addBlock("CALLOUT")}
          className="flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-md font-bold transition"
        >
          <Plus className="h-3 w-3" /> Callout
        </button>
        <button
          onClick={() => addBlock("SOURCE")}
          className="flex items-center gap-1 px-2.5 py-1 bg-card hover:bg-muted text-foreground border border-border rounded-md font-bold transition"
        >
          <Plus className="h-3 w-3" /> Source
        </button>
      </div>
    </div>
  );
}
