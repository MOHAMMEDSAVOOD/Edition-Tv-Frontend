export default function Loading() {
  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 mb-16">
        <div>
          <div className="aspect-[16/9] bg-muted rounded mb-4" />
          <div className="h-3 bg-muted rounded w-24 mb-3" />
          <div className="h-8 bg-muted rounded mb-2 w-5/6" />
          <div className="h-8 bg-muted rounded mb-4 w-3/4" />
          <div className="h-4 bg-muted rounded mb-2 w-full" />
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="mt-8 pt-6 border-t border-border grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-3 bg-muted rounded w-16 mb-2" />
                <div className="h-4 bg-muted rounded mb-1 w-full" />
                <div className="h-4 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-4 bg-muted rounded w-24" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-5 w-5 bg-muted rounded flex-none" />
              <div className="flex-1">
                <div className="h-3 bg-muted rounded mb-1 w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section divider skeleton */}
      <div className="h-6 bg-muted rounded w-48 mb-6" />

      {/* Article grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="aspect-[4/3] bg-muted rounded mb-3" />
            <div className="h-3 bg-muted rounded w-16 mb-2" />
            <div className="h-4 bg-muted rounded mb-1 w-full" />
            <div className="h-4 bg-muted rounded w-4/5" />
          </div>
        ))}
      </div>

      {/* Second section */}
      <div className="h-6 bg-muted rounded w-40 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="aspect-[4/3] bg-muted rounded mb-3" />
            <div className="h-3 bg-muted rounded w-16 mb-2" />
            <div className="h-4 bg-muted rounded mb-1 w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
