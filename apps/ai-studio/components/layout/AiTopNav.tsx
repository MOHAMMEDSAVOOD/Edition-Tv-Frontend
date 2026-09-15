"use client";
import { useState } from "react";
import { Cpu } from "lucide-react";
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
            {/* TODO: populate from the configured provider once a model backend is wired. */}
            <option value="">No model configured</option>
          </select>
        </div>
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
