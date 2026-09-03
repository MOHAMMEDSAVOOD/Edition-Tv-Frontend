import { ApiKeysClient } from "@/components/apikeys/ApiKeysClient";

export const metadata = {
  title: "API Keys & Webhooks | Edition TV Admin",
  description: "API access credentials, secret rotation, and webhook subscription endpoints.",
};

export default function ApiKeysPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Integration Access
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">API Keys & Secret Rotation</h1>
      </div>

      <ApiKeysClient />
    </div>
  );
}
