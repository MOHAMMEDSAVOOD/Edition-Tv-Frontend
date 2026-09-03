import { NewsSourcesClient } from "@/components/news-sources/NewsSourcesClient";

export const metadata = {
  title: "News Sources & Wire Ingestion | Edition TV Admin",
  description: "Manage external news providers, RSS/Atom feeds, automated ingestion rules, and source health monitoring.",
};

export default function NewsSourcesPage() {
  return <NewsSourcesClient />;
}
