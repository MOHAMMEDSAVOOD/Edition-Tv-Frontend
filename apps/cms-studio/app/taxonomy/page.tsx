import { TaxonomyClient } from "@/components/taxonomy/TaxonomyClient";

export const metadata = {
  title: "Taxonomy & Tags | Edition TV CMS",
  description: "Manage news sections, topic tags, and editorial categorization trees.",
};

export default function TaxonomyPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Categorization Architecture
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Taxonomy & Tags Manager</h1>
      </div>

      <TaxonomyClient />
    </div>
  );
}
