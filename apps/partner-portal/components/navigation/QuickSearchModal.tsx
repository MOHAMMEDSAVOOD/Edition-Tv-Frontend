"use client";

import React, { useState, useEffect } from "react";
import { Search, Sparkles, TrendingUp, Clock, FileText, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news, topics, authors, live blogs... (Cmd+K)"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-0 h-auto"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {!query ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5" /> Trending Searches
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Global Tech Summit 2026", "Central Bank Rate Decision", "AI Moderation Policy", "Climate Agreement"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" /> Recent Topics
                </div>
                <div className="space-y-1">
                  {["Artificial Intelligence & Editorial Standards", "Global Semiconductor Supply Chains", "Middle East Peace Conference"].map((topic) => (
                    <div
                      key={topic}
                      onClick={() => setQuery(topic)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent/60 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{topic}</span>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal">Topic Hub</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Matching Results for &quot;{query}&quot;
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center space-y-2">
                <Sparkles className="h-6 w-6 text-purple-400 mx-auto" />
                <p className="text-sm font-medium">Hybrid Search &amp; Vector Index Ready</p>
                <p className="text-xs text-muted-foreground">Connected to Edition TV OpenSearch cluster (`search::api`).</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
