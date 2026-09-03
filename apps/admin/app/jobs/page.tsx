import { ScheduledJobsClient } from "@/components/jobs/ScheduledJobsClient";

export const metadata = {
  title: "Scheduled Jobs & Crons | Edition TV Admin",
  description: "Spring @Scheduled background job execution log, cron schedules, and manual triggers.",
};

export default function JobsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Background Automation
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Scheduled Jobs & Cron Monitors</h1>
      </div>

      <ScheduledJobsClient />
    </div>
  );
}
