import { WireFeedClient } from "@/components/wire-feed/WireFeedClient";

export const metadata = {
  title: "Wire Candidates & Research Stream | Edition TV Newsroom",
  description: "Inspect external wire stories, route candidate items to desks, or convert them into assignments.",
};

export default function WireFeedPage() {
  return <WireFeedClient />;
}
