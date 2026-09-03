import { PushAlertsClient } from "@/components/alerts/PushAlertsClient";

export const metadata = {
  title: "Push Alerts Desk | Edition TV Live",
  description: "Mobile push notification dispatcher and lower-third TV alert overlay queue.",
};

export default function AlertsPage() {
  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-border pb-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          DISPATCH OPERATIONS
        </span>
        <h1 className="text-xl font-extrabold tracking-tight text-primary uppercase">Push Alerts & TV Lower-Third Desk</h1>
      </div>

      <PushAlertsClient />
    </div>
  );
}
