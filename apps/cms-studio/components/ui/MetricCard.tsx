import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  statusDot?: "emerald" | "amber" | "rose" | "blue" | "gray";
  trend?: string;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  statusDot,
  trend,
  isLoading = false,
  className,
  ...props
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 animate-pulse space-y-2 shadow-xs">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-7 w-16 bg-muted rounded" />
      </div>
    );
  }

  const dotColors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500 animate-pulse",
    blue: "bg-blue-500",
    gray: "bg-muted-foreground",
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 flex flex-col justify-between shadow-xs hover:border-border/80 transition-all",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          {label}
        </span>
        {statusDot && (
          <span className={cn("h-2 w-2 rounded-full flex-none", dotColors[statusDot])} />
        )}
        {Icon && !statusDot && <Icon className="h-4 w-4 text-muted-foreground/70" />}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold tracking-tight text-foreground font-sans">
          {value}
        </span>
        {trend && (
          <span className="text-[11px] font-semibold text-emerald-500 font-mono">
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 font-sans">
          {subtext}
        </p>
      )}
    </div>
  );
}
