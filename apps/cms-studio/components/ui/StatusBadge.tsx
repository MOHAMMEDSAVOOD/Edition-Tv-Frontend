import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "DRAFT"
  | "IN_REVIEW"
  | "VERIFIED"
  | "PUBLISHED"
  | "FAILED"
  | "LIVE"
  | "CONNECTED"
  | "RECONNECTING"
  | "OFFLINE"
  | "DISPUTED"
  | "UNVERIFIED"
  | "ACCEPTED"
  | "REJECTED"
  | "PENDING"
  | "PROCESSING"
  | "RETRY"
  | "ACTIVE"
  | "HEALTHY"
  | "DEGRADED"
  | string;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function StatusBadge({
  status,
  label,
  size = "sm",
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let style = "bg-slate-100 text-slate-700 border-slate-200";
  let dotStyle = "bg-slate-500";
  let autoLabel = label;

  switch (normalized) {
    case "PUBLISHED":
    case "VERIFIED":
    case "ACCEPTED":
    case "HEALTHY":
    case "ACTIVE":
    case "CONNECTED":
      style = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotStyle = "bg-emerald-600";
      if (!autoLabel) autoLabel = normalized === "PUBLISHED" ? "Published Live 🌐" : normalized;
      break;

    case "LIVE":
      style = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
      dotStyle = "bg-rose-600 animate-ping";
      if (!autoLabel) autoLabel = "LIVE 🔴";
      break;

    case "IN_REVIEW":
    case "PENDING":
    case "PROCESSING":
    case "RETRY":
      style = "bg-amber-50 text-amber-700 border-amber-200";
      dotStyle = "bg-amber-600";
      if (!autoLabel) autoLabel = normalized === "IN_REVIEW" ? "In Editorial Review ⏳" : normalized;
      break;

    case "CONVERTED_TO_STORY":
      style = "bg-amber-50 text-amber-700 border-amber-200";
      dotStyle = "bg-amber-600";
      if (!autoLabel) autoLabel = "Converted to Story 🪄";
      break;

    case "ASSIGNED":
      style = "bg-blue-50 text-blue-700 border-blue-200";
      dotStyle = "bg-blue-600";
      if (!autoLabel) autoLabel = "Assigned to Desk 🛡️";
      break;

    case "WIRE_RAW":
      style = "bg-slate-100 text-slate-700 border-slate-200";
      dotStyle = "bg-slate-500";
      if (!autoLabel) autoLabel = "Raw Wire";
      break;

    case "FAILED":
    case "REJECTED":
    case "DISPUTED":
    case "OFFLINE":
      style = "bg-rose-50 text-rose-700 border-rose-200";
      dotStyle = "bg-rose-600";
      break;

    case "DRAFT":
    case "UNVERIFIED":
    case "DEGRADED":
      style = "bg-slate-100 text-slate-700 border-slate-200";
      dotStyle = "bg-slate-500";
      if (!autoLabel) autoLabel = normalized === "DRAFT" ? "Draft Article" : normalized;
      break;
  }

  const displayLabel = autoLabel || status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-bold rounded-full border tracking-wider transition-colors select-none",
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        style,
        className
      )}
      {...props}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full flex-none", dotStyle)} />}
      <span>{displayLabel}</span>
    </span>
  );
}
