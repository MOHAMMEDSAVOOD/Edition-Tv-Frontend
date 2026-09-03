import { Suspense } from "react";
import { EditorialPlanningCalendarClient } from "@/components/planning/EditorialPlanningCalendarClient";

export const metadata = {
  title: "Editorial Planning Calendar | Edition TV CMS",
  description: "Forward coverage schedule, desk package planning, and calendar events.",
};

export default function PlanningCalendarPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-card border border-border animate-pulse rounded-xl" />}>
      <EditorialPlanningCalendarClient />
    </Suspense>
  );
}
