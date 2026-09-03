import { liveBlogService } from "@/services/liveBlogService";
import { LiveBlogClient } from "@/components/liveblog/LiveBlogClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface LiveBlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LiveBlogPageProps) {
  const { slug } = await params;
  const blog = await liveBlogService.getLiveBlogBySlug(slug);
  if (!blog) {
    return { title: "Live Coverage | Edition TV", description: "Real-time updates from Edition TV newsroom." };
  }
  return {
    title: `LIVE: ${blog.title} | Edition TV`,
    description: blog.summary || "Real-time updates",
  };
}

export default async function LiveBlogPage({ params }: LiveBlogPageProps) {
  const { slug } = await params;
  const blog = await liveBlogService.getLiveBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8">
      {/* Header Banner */}
      <div className="bg-primary/10 border-l-4 border-primary p-6 mb-8 rounded-r-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="live-dot h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="section-label text-xs font-bold tracking-widest text-primary">LIVE COVERAGE</span>
          <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-xs uppercase">{blog.status}</span>
        </div>
        <h1 className="headline-xl text-3xl sm:text-4xl font-extrabold text-foreground">{blog.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{blog.summary}</p>
      </div>

      <LiveBlogClient initialBlog={blog} />
    </div>
  );
}
