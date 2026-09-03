import NewsroomAuditLogsClient from "@/components/audit/NewsroomAuditLogsClient";

export const metadata = {
  title: "Audit Trail & Provenance | Edition TV CMS",
  description: "Immutable production newsroom audit trail and event provenance.",
};

export default function AuditTrailPage() {
  return <NewsroomAuditLogsClient />;
}
