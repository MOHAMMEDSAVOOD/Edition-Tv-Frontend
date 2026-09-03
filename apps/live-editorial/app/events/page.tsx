import { LiveEventsClient } from "@/components/events/LiveEventsClient";

export const metadata = {
  title: "Live Events Directory | Edition TV Live",
  description: "Manage active live blogs, stream status, and coverage channels.",
};

export default function LiveEventsPage() {
  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-border pb-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          BROADCAST CHANNELS
        </span>
        <h1 className="text-xl font-extrabold tracking-tight text-primary uppercase">Live Events Directory</h1>
      </div>

      <LiveEventsClient />
    </div>
  );
}
