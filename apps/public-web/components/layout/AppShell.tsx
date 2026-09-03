import React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>;
}
