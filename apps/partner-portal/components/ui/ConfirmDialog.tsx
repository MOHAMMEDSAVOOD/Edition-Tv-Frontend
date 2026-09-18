"use client";

import * as React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "indigo";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting]);

  if (!open) return null;

  const handleConfirmClick = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handled downstream
    } finally {
      setSubmitting(false);
    }
  };

  const variantStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} />

      {/* Dialog Card */}
      <div className="relative z-50 w-full max-w-md bg-background border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl flex-none border border-rose-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border font-mono text-xs font-bold">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-1.5 border border-border rounded-lg text-foreground hover:bg-muted transition"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={submitting}
            className={`px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 ${variantStyles[variant]}`}
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
