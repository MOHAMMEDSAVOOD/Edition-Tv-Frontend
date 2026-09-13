import React from "react";
import { LeadDashboard } from "@/components/leads/lead-dashboard";

export const metadata = {
  title: "Lead Management | Edition TV",
  description: "Manage and track incoming leads",
};

export default function LeadsPage() {
  // Server-side RBAC check could happen here
  // e.g., const user = await getCurrentUser();
  // if (!user.roles.includes("ADMIN") && !user.roles.includes("EDITOR")) return <Forbidden />
  
  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <LeadDashboard />
    </div>
  );
}
