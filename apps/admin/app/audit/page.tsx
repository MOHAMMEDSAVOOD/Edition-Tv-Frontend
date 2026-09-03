import { AuditLogsClient } from "@/components/audit/AuditLogsClient";

export const metadata = {
  title: "System Audit & Security Logs | Edition TV Admin",
  description: "Real-time security event log, administrative action trace, and IP audit trails.",
};

export default function AuditPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Security & Compliance Trace
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Audit & Security Logs</h1>
      </div>

      <AuditLogsClient />
    </div>
  );
}
