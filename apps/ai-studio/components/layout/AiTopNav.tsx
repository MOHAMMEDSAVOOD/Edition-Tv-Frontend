"use client";
import { useState } from "react";
import { Cpu, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export function AiTopNav() {
  const { theme, setTheme } = useTheme();
  const [model, setModel] = useState("gpt-5-omni");

  return (
    <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between flex-none z-20 font-sans">
      {/* Left: Active Model Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border border-purple-500/30 rounded-md px-3 py-1 text-xs font-semibold bg-purple-500/10">
          <Cpu className="h-4 w-4 text-purple-400" />
          <span className="text-muted-foreground">Active LLM:</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
          >
            <option value="gpt-5-omni">GPT-5 Omni (Default)</option>
            <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Thinking)</option>
            <option value="gemini-1-5-pro">Gemini 1.5 Pro (1M Context)</option>
            <option value="llama-3-70b">Llama 3 70B (Local Edge)</option>
          </select>
        </div>

        <span className="hidden sm:flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
          <Sparkles className="h-3 w-3" /> Latency: 18ms
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted text-xs font-bold"
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30">
            AI
          </div>
          <div className="hidden md:block text-left text-xs">
            <span className="font-bold text-foreground block leading-tight">Editorial AI Copilot</span>
            <span className="text-[10px] text-muted-foreground">Version 4.2 Pro</span>
          </div>
        </div>
      </div>
    </header>
  );
}
