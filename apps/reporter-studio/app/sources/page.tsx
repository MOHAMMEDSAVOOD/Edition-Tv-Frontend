import { SourceVaultClient } from "@/components/sources/SourceVaultClient";

export const metadata = {
  title: "Source Vault | Reporter Studio",
  description: "Journalist contact repository, interview quotes, and credibility ratings.",
};

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Investigative Database
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Source Vault</h1>
      </div>

      <SourceVaultClient />
    </div>
  );
}
