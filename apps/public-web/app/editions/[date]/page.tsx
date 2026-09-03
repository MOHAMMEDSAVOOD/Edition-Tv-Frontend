import Link from "next/link";
import Image from "next/image";
import { feedService } from "@/services/feedService";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function DailyEditionPage({ params }: PageProps) {
  const { date } = await params;
  const feed = await feedService.getPublicFeed(1, 50); // Get more to find matching dates
  const articles = feed.items.filter((a) => {
    if (!a.publishedAt) return false;
    return a.publishedAt.startsWith(date);
  });

  return (
    <div className="min-h-screen bg-slate-50  py-16 px-4">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-16 text-center border-b border-slate-200  pb-8">
          <span className="text-xs uppercase tracking-widest text-sky-600  font-bold">
            Daily Print & Digital Archive
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900  mt-2">
            Edition TV — {date} Digest
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Comprehensive roundup of curated headlines, breaking signals, and editorial dispatches published on {date}.
          </p>
        </header>

        {articles.length === 0 ? (
          <div className="p-8 text-center bg-white  rounded-xl border border-slate-200  text-slate-500">
            No published dispatches stored for {date}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group bg-white  border border-slate-200  rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative h-48 w-full bg-slate-100 ">
                  <Image
                    src={article.featuredImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 ">
                      {article.category}
                    </span>
                    <h2 className="text-xl font-bold font-serif text-slate-900  mt-2 mb-3 group-hover:text-sky-600 transition">
                      {article.title}
                    </h2>
                    <p className="text-slate-600  text-sm line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100  flex justify-between">
                    <span>{article.authorName}</span>
                    <span>{article.readingTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
