import { savedArticlesService } from "@/services/savedArticlesService";
import { SavedArticlesClient } from "@/components/saved/SavedArticlesClient";

export const metadata = {
  title: "Saved Articles | Edition TV",
  description: "Your bookmarked stories for offline and focused reading.",
};

export default async function SavedArticlesPage() {
  const initialSaved = await savedArticlesService.getSavedArticles();

  return (
    <div className="container mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      <div className="border-b border-border pb-4 mb-8">
        <span className="section-label block mb-1">Personal Reading List</span>
        <h1 className="headline-xl text-3xl sm:text-4xl font-extrabold">Saved Articles</h1>
        <p className="text-sm text-muted-foreground mt-1">Access stories you bookmarked across devices for reading later.</p>
      </div>

      <SavedArticlesClient initialSaved={initialSaved} />
    </div>
  );
}
