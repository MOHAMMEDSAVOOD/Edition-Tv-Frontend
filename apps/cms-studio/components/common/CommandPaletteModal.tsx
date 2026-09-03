"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  FolderKanban,
  FileText,
  ShieldCheck,
  Radio,
  Layers,
  Send,
  History,
  ShieldAlert,
  X,
  CheckCircle2,
  XCircle,
  Save,
  Play,
  Database,
  Server
} from "lucide-react";

interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
  onContextAction?: (actionId: string) => void;
}

interface CommandItem {
  label: string;
  href?: string;
  actionId?: string;
  icon: React.ElementType;
  category: "Navigation" | "Contextual Action" | "Admin Action";
}

const GLOBAL_NAV_ITEMS: CommandItem[] = [
  { label: "Go to Newsroom Command Center", href: "/", icon: LayoutDashboard, category: "Navigation" },
  { label: "Open Wire Candidate Intelligence", href: "/intelligence", icon: Sparkles, category: "Navigation" },
  { label: "Open Journalist Story Studio", href: "/workspace", icon: FolderKanban, category: "Navigation" },
  { label: "Open Editorial Calendar & Planning", href: "/planning", icon: CalendarDays, category: "Navigation" },
  { label: "Open Newsroom Assignments", href: "/assignments", icon: FileText, category: "Navigation" },
  { label: "Open Fact-Checking & Verification", href: "/verification", icon: ShieldCheck, category: "Navigation" },
  { label: "Open Live Coverage Control Room", href: "/live-events", icon: Radio, category: "Navigation" },
  { label: "Open Homepage Curation Slots", href: "/curation", icon: Layers, category: "Navigation" },
  { label: "Open Publishing Pipeline Queue", href: "/publish", icon: Send, category: "Navigation" },
  { label: "Open Newsroom Audit Logs", href: "/audit", icon: History, category: "Navigation" },
  { label: "Open Admin Control Center", href: "/admin", icon: ShieldAlert, category: "Navigation" },
  { label: "Open Ingestion Provider Config", href: "/admin/providers", icon: Server, category: "Navigation" },
  { label: "Open Database Studio Inspector", href: "/admin/db", icon: Database, category: "Navigation" },
];

export function CommandPaletteModal({ open, onClose, onContextAction }: CommandPaletteModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Contextual actions based on current workstation route
  const contextualItems: CommandItem[] = React.useMemo(() => {
    const items: CommandItem[] = [];
    if (pathname.startsWith("/intelligence")) {
      items.push(
        { label: "Accept Selected Candidate", actionId: "ACCEPT_CANDIDATE", icon: CheckCircle2, category: "Contextual Action" },
        { label: "Reject Candidate", actionId: "REJECT_CANDIDATE", icon: XCircle, category: "Contextual Action" },
        { label: "Create Story Draft from Wire", actionId: "CREATE_STORY_FROM_WIRE", icon: FolderKanban, category: "Contextual Action" },
        { label: "Open Claims Verification", actionId: "VERIFY_CLAIMS", icon: ShieldCheck, category: "Contextual Action" }
      );
    } else if (pathname.startsWith("/workspace")) {
      items.push(
        { label: "Save Current Story Draft", actionId: "SAVE_STORY", icon: Save, category: "Contextual Action" },
        { label: "Submit Story for Editorial Review", actionId: "SUBMIT_REVIEW", icon: CalendarDays, category: "Contextual Action" },
        { label: "Mark Fact-Check Verified", actionId: "VERIFY_STORY", icon: ShieldCheck, category: "Contextual Action" },
        { label: "Publish Story Immediately", actionId: "PUBLISH_STORY", icon: Send, category: "Contextual Action" }
      );
    } else if (pathname.startsWith("/admin")) {
      items.push(
        { label: "Trigger Wire Ingestion", actionId: "TRIGGER_INGEST", icon: Play, category: "Admin Action" },
        { label: "Inspect Database Studio", actionId: "OPEN_DB_STUDIO", icon: Database, category: "Admin Action" },
        { label: "Refresh Infrastructure Health", actionId: "REFRESH_HEALTH", icon: ShieldAlert, category: "Admin Action" }
      );
    }
    return items;
  }, [pathname]);

  const allItems = React.useMemo(() => [...contextualItems, ...GLOBAL_NAV_ITEMS], [contextualItems]);

  const filtered = React.useMemo(() => {
    return allItems.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      (item.href || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [allItems, query]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = React.useCallback((item: CommandItem) => {
    if (item.actionId && onContextAction) {
      onContextAction(item.actionId);
    } else if (item.href) {
      router.push(item.href);
    }
    onClose();
  }, [onContextAction, router, onClose]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else setQuery("");
      }
      if (!open) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, filtered, selectedIndex, handleSelect]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col font-sans">
        {/* Search Bar */}
        <div className="flex items-center px-4 border-b border-border bg-card/50">
          <Search className="h-4 w-4 text-muted-foreground mr-3 flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, action or workstation (e.g. Workspace, Accept, Save)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            aria-label="Close Command Palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1" role="listbox">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground font-sans">
              No matching command found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={(item.href || item.actionId || "") + idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30"
                      : "hover:bg-indigo-600/10 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 flex-none ${isSelected ? "text-indigo-400" : "text-muted-foreground group-hover:text-indigo-400"}`} />
                    <span className="text-xs font-semibold font-sans">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-muted/20 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>↑↓ to navigate • Enter to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
