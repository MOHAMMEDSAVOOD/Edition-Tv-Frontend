import { AudienceDemographicsClient } from "@/components/audience/AudienceDemographicsClient";

export const metadata = {
  title: "Audience Demographics & Geography | Edition TV Analytics",
  description: "Global geographic distribution, device breakdown, and subscriber tier metrics.",
};

export default function AudiencePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Reader Telemetry
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audience Demographics & Geography</h1>
      </div>

      <AudienceDemographicsClient />
    </div>
  );
}
