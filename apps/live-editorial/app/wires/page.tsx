import { WireStreamClient } from "@/components/wires/WireStreamClient";

export const metadata = {
  title: "Raw Wire Feeds | Edition TV Live",
  description: "Real-time raw wire stream triage from AP, Reuters, and AFP.",
};

export default function WiresPage() {
  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-border pb-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          WIRE DESK TRIAGE
        </span>
        <h1 className="text-xl font-extrabold tracking-tight text-primary uppercase">Raw Wire Feeds Stream</h1>
      </div>

      <WireStreamClient />
    </div>
  );
}
