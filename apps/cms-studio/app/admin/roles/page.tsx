import RolesManagementClient from "./RolesManagementClient";

export const metadata = {
  title: "Roles & Permissions Admin | Edition TV CMS",
  description: "Configure dynamic newsroom roles, granular permissions, scopes, and run authorization simulations.",
};

export default function AdminRolesPage() {
  return <RolesManagementClient />;
}
