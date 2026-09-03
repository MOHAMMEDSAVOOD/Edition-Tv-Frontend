"use client";
import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if active element is an input, textarea or select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-xs">
      <div className="bg-card border border-border rounded-md shadow-2xl w-full max-w-md p-6 space-y-4 relative animate-in fade-in zoom-in-95">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Keyboard className="h-5 w-5 text-primary" /> Keyboard Shortcuts Guide
        </h3>

        <div className="space-y-2 font-mono">
          {[
            { key: "?", label: "Toggle Shortcuts Helper Modal" },
            { key: "/", label: "Focus Search Input" },
            { key: "T", label: "Toggle Light / Dark Mode" },
            { key: "B", label: "Open Saved Articles Bookmarks" },
            { key: "Esc", label: "Close Active Modal or Drawer" },
          ].map((sc) => (
            <div key={sc.key} className="flex items-center justify-between p-2 bg-muted/30 border border-border rounded">
              <span className="text-muted-foreground">{sc.label}</span>
              <kbd className="px-2 py-0.5 bg-background border border-border rounded text-[11px] font-bold text-primary shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
