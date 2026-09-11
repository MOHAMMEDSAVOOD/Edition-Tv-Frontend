import Link from "next/link";
import { SectionDivider } from "@/components/news/SectionDivider";
import { serverFetch } from "@/lib/api-client";
import { Folder, ArrowRight } from "lucide-react";


export const metadata = {
  title: "All Categories | Edition TV",
  description: "Browse news by category on Edition TV — World, Business, Technology, Politics, Science, Health, Energy, and Opinion.",
};

const DEFAULT_CATEGORIES = [
  { name: "World", slug: "world", desc: "Global reporting and international affairs" },
  { name: "Business", slug: "business", desc: "Markets, corporate developments, and financial news" },
  { name: "Technology", slug: "technology", desc: "AI, cybersecurity, tech policy, and innovation" },
  { name: "Politics", slug: "politics", desc: "Government policy, elections, and civic reporting" },
  { name: "Science", slug: "science", desc: "Space, climate science, energy, and research" },
  { name: "Health", slug: "health", desc: "Public health, medicine, and wellness" },
  { name: "Energy", slug: "energy", desc: "Renewables, oil & gas, and energy transition" },
  { name: "Opinion", slug: "opinion", desc: "Editorial commentary, perspectives, and debate" },
  { name: "Sports", slug: "sports", desc: "Global sports, tournaments, and athletics" },
  { name: "Culture", slug: "culture", desc: "Arts, literature, film, and media" },
];

export default async function CategoriesOverviewPage() {
  const apiCategories = await serverFetch<any[]>("/public/categories", { revalidate: 60 }) || [];
  
  const categoriesList = apiCategories.length > 0
    ? apiCategories.map((c: any) => ({
        name: c.name || c.title,
        slug: c.slug || (c.name ? c.name.toLowerCase().replace(/\s+/g, "-") : "general"),
        desc: c.description || `Latest ${c.name} news and coverage`,
      }))
    : DEFAULT_CATEGORIES;

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8 font-sans">
      <div className="border-b border-border pb-8 mb-12">
        <span className="section-label block mb-2 font-mono">News Desk Catalog</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Explore News Desks
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Browse verified reporting across our core editorial sections and specialist desks.
        </p>
      </div>

      <section className="mb-16">
        <SectionDivider label="Active Categories" />
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
      </section>
    </div>
  );
}
