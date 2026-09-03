import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 font-sans">
      <div className="max-w-lg text-center space-y-8">
        {/* Error code */}
        <div className="space-y-2">
          <div className="text-[120px] font-black leading-none text-primary/10 font-mono select-none">
            404
          </div>
          <div className="flex items-center justify-center gap-2 -mt-8">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
            <span className="section-label text-base">Story Not Found</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="headline-lg text-2xl font-extrabold text-foreground">
            This page has moved or doesn&apos;t exist
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The article, category, author page, or editorial you&apos;re looking
            for may have been archived, renamed, or removed from our system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-black font-bold text-sm px-6 py-2.5 rounded-sm hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
          >
            <Home className="h-4 w-4" /> Return to Homepage
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-6 py-2.5 rounded-sm hover:bg-muted transition-colors w-full sm:w-auto justify-center"
          >
            <Search className="h-4 w-4" /> Search News
          </Link>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Browse by section:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["World", "Business", "Technology", "Politics", "Science", "Health"].map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat.toLowerCase()}`}
                className="text-xs font-semibold text-primary hover:underline border border-primary/20 px-3 py-1 rounded-sm hover:bg-primary/5 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground/50 font-mono">
          Edition TV · Error 404 · Page Not Found
        </div>
      </div>
    </div>
  );
}
