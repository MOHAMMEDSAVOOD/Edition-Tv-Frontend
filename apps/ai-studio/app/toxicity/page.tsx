import { ToxicityScannerClient } from "@/components/toxicity/ToxicityScannerClient";

export const metadata = {
  title: "Toxicity & Moderation Scanner | Edition TV AI Studio",
  description: "Real-time sub-50ms AI toxicity scoring and reader comment moderation engine.",
};

export default function ToxicityPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          AI Content Safety & Civil Moderation
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Toxicity & Moderation Engine</h1>
      </div>

      <ToxicityScannerClient />
    </div>
  );
}
