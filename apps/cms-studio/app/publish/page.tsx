import { PublishingQueueClient } from "@/components/publish/PublishingQueueClient";

export const metadata = {
  title: "Publishing Queue | Edition TV CMS",
  description: "Scheduled release queue, edition publication calendar, and automated outbox trigger status.",
};

export default function PublishQueuePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Scheduled Release Management
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Publishing Queue & Calendar</h1>
      </div>

      <PublishingQueueClient />
    </div>
  );
}
