import { Suspense } from "react";
import { CmsDashboardClient } from "@/components/dashboard/CmsDashboardClient";

export const metadata = {
  title: "Newsroom Command Center | Edition TV CMS",
  description: "Operational newsroom command center, wire intelligence, and publishing pipeline status.",
};

export default function CmsDashboardPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-card border border-border animate-pulse rounded-xl" />}>
      <CmsDashboardClient />
    </Suspense>
  );
}
