import { Suspense } from "react";
import { feedService } from "@/services/feedService";
import { HomeFeedClient } from "@/components/news/HomeFeedClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Edition TV — Global Digital Journalism",
  description: "Breaking news, live event coverage, investigative reporting, and expert analysis from Edition TV correspondents worldwide.",
};

async function HomepageContent() {
  const feed = await feedService.getPublicFeed(1, 20);
  const trending = await feedService.getTrendingFeed(5);
  const editorsPicks = await feedService.getEditorsPicks(4);
  const opinions = await feedService.getOpinions(3);
  const investigations = await feedService.getInvestigations(3);
  const videos = await feedService.getVideos(2);
  const podcasts = await feedService.getPodcasts(2);
  const recommended = await feedService.getRecommendedStories(4);

  return (
    <HomeFeedClient
      initialArticles={feed.items || []}
      initialTrending={trending}
      initialEditorsPicks={editorsPicks}
      initialOpinions={opinions}
      initialInvestigations={investigations}
      initialVideos={videos}
      initialPodcasts={podcasts}
      initialRecommended={recommended}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div>
                <div className="aspect-[16/9] bg-muted rounded-xs mb-4" />
                <div className="h-8 bg-muted rounded-xs mb-2 w-3/4" />
                <div className="h-4 bg-muted rounded-xs mb-1 w-full" />
                <div className="h-4 bg-muted rounded-xs w-2/3" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-xs" />
                ))}
              </div>
            </div>
            <div className="h-6 bg-muted rounded-xs w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/3] bg-muted rounded-xs" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomepageContent />
    </Suspense>
  );
}
