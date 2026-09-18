import { Suspense } from "react";
import { PartnerDashboardClient } from "@/components/dashboard/PartnerDashboardClient";

export const metadata = {
  title: "Newsroom Command Center | Edition TV Partner Portal",
  description: "Operational newsroom command center, wire intelligence, and publishing pipeline status.",
};

export default function PartnerDashboardPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-card border border-border animate-pulse rounded-xl" />}>
      <PartnerDashboardClient />
    </Suspense>
  );
}
