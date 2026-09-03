import { AuthorLeaderboardClient } from "@/components/authors/AuthorLeaderboardClient";

export const metadata = {
  title: "Author Leaderboard | Edition TV Analytics",
  description: "Journalist publishing metrics, pageviews, and subscriber conversion rates.",
};

export default function AuthorsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-border pb-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          Newsroom Telemetry
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Author & Correspondent Leaderboard</h1>
      </div>

      <AuthorLeaderboardClient />
    </div>
  );
}
