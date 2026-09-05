import Image from "next/image";
import Link from "next/link";
import { feedService } from "@/services/feedService";
import { GridStoryCard, CompactStoryRow } from "@/components/news/ArticleCards";
import { SectionDivider } from "@/components/news/SectionDivider";
import { ArrowLeft, Twitter, Linkedin, Mail, MapPin, Calendar, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const feed = await feedService.getFeedByAuthor(id, 1, 1);
  const authorName = feed.items.length > 0 && feed.items[0].authorName ? feed.items[0].authorName : "Edition Correspondent";
  return {
    title: `${authorName} - Author Profile | Edition TV`,
    description: `Read the latest articles and reports by ${authorName} on Edition TV.`,
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params;
  const feed = await feedService.getFeedByAuthor(id, 1, 15);
  const articles = feed.items || [];

  const trending = await feedService.getTrendingFeed(3);

  const authorName = articles.length > 0 && articles[0].authorName ? articles[0].authorName : "Edition Correspondent";

  // Simulate rich author data (since backend only returns basic auth details currently)
  const author = {
    id,
    name: authorName,
    title: "Senior Global Correspondent",
    bio: `Award-winning journalist reporting on global economic developments, technology breakthroughs, and public policy. Prior to joining Edition TV, ${authorName.split(' ')[0]} spent a decade covering international affairs across Europe and Asia.`,
    location: "Global Newsroom, NYC",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    articlesCount: feed.totalItems || articles.length,
    specializations: ["Global Policy", "Markets", "Technology", "Geopolitics"],
    joinedYear: 2022,
    email: `${authorName.split(' ')[0].toLowerCase()}@edition.tv`,
  };

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-8 font-mono uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Top Stories
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        {/* Left Column: Author Bio Card */}
        <div>
          <div className="bg-card border border-border p-6 rounded-xs sticky top-24">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 mx-auto border-2 border-primary/20">
              {author.avatarUrl ? (
                <Image src={author.avatarUrl} alt={author.name} fill className="object-cover" />
              ) : null}
            </div>

            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-xs text-[10px] font-bold uppercase tracking-wider mb-3 font-mono">
                {author.title}
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                {author.name}
              </h1>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                {author.bio}
              </p>
            </div>

            <div className="border-t border-border pt-5 space-y-3 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {author.location}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" /> {author.articlesCount} Published Articles
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Member since {author.joinedYear}
              </div>
            </div>

            <div className="border-t border-border pt-5 mt-5">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-3 font-mono">Connect</div>
              <div className="flex gap-3">
                <a href="#" className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href={`mailto:${author.email}`} className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="border-t border-border pt-5 mt-5">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-3 font-mono">Areas of Expertise</div>
              <div className="flex flex-wrap gap-2">
                {author.specializations.map(spec => (
                  <Link key={spec} href={`/topics/${spec.toLowerCase().replace(' ', '-')}`} className="px-2 py-1 bg-muted/20 text-[10px] rounded hover:bg-muted/50 transition-colors">
                    #{spec}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Author's Feed */}
        <div>
          <SectionDivider label={`Latest Dispatches from ${author.name}`} />

          {articles.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-xs mt-6">
              <h2 className="headline-lg text-lg font-bold text-foreground mb-1">No Articles Found</h2>
              <p className="text-xs text-muted-foreground">This author has not published any articles yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {articles.map((article) => (
                <GridStoryCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Read Next Section */}
          {trending.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <SectionDivider label="Global Trending Coverage" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {trending.map((article, i) => (
                  <CompactStoryRow key={article.id} article={article} rank={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
