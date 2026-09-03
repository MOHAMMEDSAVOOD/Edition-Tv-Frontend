import { RbacMatrixClient } from "@/components/roles/RbacMatrixClient";

export const metadata = {
  title: "RBAC Permission Matrix | Edition TV Admin",
  description: "Configure role definitions and resource permission access controls.",
};

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Access Control Policy
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">RBAC Permission Matrix Engine</h1>
      </div>

      <RbacMatrixClient />
    </div>
  );
}
