import { HealthStatusClient } from "@/components/health/HealthStatusClient";

export const metadata = {
  title: "Infrastructure Health & Subsystems | Edition TV Admin",
  description: "Spring Boot Modulith subsystem status, Kafka outbox queue lag, and DB health.",
};

export default function HealthPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Platform Architecture Telemetry
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Infrastructure Subsystem Health</h1>
      </div>

      <HealthStatusClient />
    </div>
  );
}
