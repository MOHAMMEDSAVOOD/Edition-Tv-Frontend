import { UserManagementClient } from "@/components/users/UserManagementClient";

export const metadata = {
  title: "User Management & RBAC | Edition TV Admin",
  description: "Platform user accounts, RBAC role assignment, and account status control panel.",
};

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Platform Identity & Governance
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Accounts & RBAC Directory</h1>
      </div>

      <UserManagementClient />
    </div>
  );
}
