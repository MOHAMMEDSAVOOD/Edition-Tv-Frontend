"use client";
import { useState } from "react";
import { Send, Bot, User, Sparkles, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

const PRESETS = [
  "Fact Check Article Draft",
  "Rewrite in AP / Reuters Style",
  "Generate 5 Headline Variations",
  "Summarize Executive Points",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "assistant",
    content: "Welcome to Edition TV AI Studio. Select an editorial preset below or type a prompt to research, fact-check, or draft story content with GPT-5 / Claude 3.7.",
    timestamp: "18:00",
  },
];

export function AiChatWorkbenchClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      content: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsGenerating(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        content: `### Editorial Analysis Complete\n\n1. **Style Alignment**: Passed AP/Reuters standards.\n2. **Clarity**: 98/100.\n3. **Fact Verification**: All 4 entity citations matched verified knowledge base.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-md shadow-xs overflow-hidden">
      {/* Preset Quick Chips */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground font-semibold text-[11px] flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-purple-400" /> Editorial Presets:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handleSend(preset)}
            className="px-2.5 py-1 bg-background border border-border rounded-md hover:border-purple-500/50 hover:text-purple-400 transition-colors font-medium text-[11px]"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Chat Stream Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-md text-xs leading-relaxed max-w-3xl",
              msg.sender === "user"
                ? "bg-purple-600/10 border border-purple-500/30 ml-auto text-foreground"
                : "bg-muted/40 border border-border text-foreground/90"
            )}
          >
            <div
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center font-bold text-xs flex-none",
                msg.sender === "user" ? "bg-purple-600 text-white" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              )}
            >
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span className="font-bold">{msg.sender === "user" ? "You (Reporter)" : "AI Editorial Copilot"}</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap font-sans text-sm">{msg.content}</div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-md text-xs text-purple-400 font-mono animate-pulse max-w-xs">
            <Sparkles className="h-4 w-4 animate-spin" /> Thinking & Generating Response...
          </div>
        )}
      </div>

      {/* Prompt Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-border bg-muted/10 flex items-center gap-2"
      >
        <button type="button" className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted" title="Attach Document / Draft">
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Copilot to write, edit, summarize, or fact-check..."
          className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={isGenerating || !input.trim()}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-md text-xs transition-colors disabled:opacity-50 shadow-xs"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
