"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full font-sans">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="p-3.5 bg-background border border-border rounded-xl shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-none mt-0.5" />}
          {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400 flex-none mt-0.5" />}
          {t.type === "info" && <Info className="h-4 w-4 text-indigo-400 flex-none mt-0.5" />}

          <div className="flex-1 space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">{t.title}</h4>
            {t.description && <p className="text-[11px] text-muted-foreground">{t.description}</p>}
          </div>

          <button onClick={() => onDismiss(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
