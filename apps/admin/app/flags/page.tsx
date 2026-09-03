import { FeatureFlagsClient } from "@/components/flags/FeatureFlagsClient";

export const metadata = {
  title: "Feature Flags & Rollouts | Edition TV Admin",
  description: "Dynamic feature toggles, kill switches, and percentage rollout controls.",
};

export default function FlagsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Runtime Configuration
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Feature Flags & Rollout Switches</h1>
      </div>

      <FeatureFlagsClient />
    </div>
  );
}
