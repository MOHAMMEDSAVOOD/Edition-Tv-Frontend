import Link from "next/link";
import { SectionDivider } from "@/components/news/SectionDivider";
import { serverFetch } from "@/lib/api-client";
import { Folder, ArrowRight, Layers } from "lucide-react";

export const metadata = {
  title: "All Categories | Edition TV",
  description: "Browse news categories on Edition TV.",
};

function unwrapArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.content)) return val.content;
  if (Array.isArray(val.data)) return val.data;
  return [];
}

export default async function CategoriesOverviewPage() {
  const candidateEndpoints = [
    "/categories",
    "/public/categories",
    "/news/categories",
  ];

  let rawCategories: any[] = [];
  for (const ep of candidateEndpoints) {
    const res = await serverFetch<any>(ep, { revalidate: 60 });
    const items = unwrapArray(res);
    if (items.length > 0) {
      rawCategories = items;
      break;
    }
  }

  const categoriesList = rawCategories.map((c: any) => ({
    id: c.id || c.slug,
    name: c.name || c.title || "Category",
    slug: c.slug || (c.name ? String(c.name).toLowerCase().replace(/\s+/g, "-") : "general"),
    desc: c.description || `Latest ${c.name || "category"} news and reporting`,
  }));

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2 font-mono">News Desk Catalog</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Explore News Desks
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Browse verified reporting across active editorial sections and specialist desks.
        </p>
      </div>

      <section className="mb-16">
        <SectionDivider label="Active Categories" />
        {categoriesList.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-sm mt-6">
            <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-1">No Categories Found</h2>
            <p className="text-sm text-muted-foreground">
              No categories have been returned from the backend API.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesList.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="bg-card border border-border rounded-sm p-6 hover:border-primary transition-all group space-y-3 block"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Folder className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
