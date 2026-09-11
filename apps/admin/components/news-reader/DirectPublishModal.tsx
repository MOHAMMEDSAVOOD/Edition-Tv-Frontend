"use client";

import React, { useState, useEffect } from "react";
import { WireItem } from "./ArticleList";
import { Globe, AlertTriangle, Tag as TagIcon, Image as ImageIcon, CheckCircle2, Lock, Loader2, RefreshCw } from "lucide-react";

import { apiClient } from "@/lib/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.editiontv.com/api/v1";

interface OptionItem {
  id: string;
  name: string;
  enabled?: boolean;
}

interface PlacementOption {
  id: string;
  name: string;
  requiresImage?: boolean;
  enabled?: boolean;
}

interface PublicationConfig {
  destinations: OptionItem[];
  categories: OptionItem[];
  placements: PlacementOption[];
  articleTypes: OptionItem[];
  visibilityModes: OptionItem[];
  authorOptions: OptionItem[];
}

interface DirectPublishModalProps {
  item: WireItem;
  onClose: () => void;
  onSuccess: (publishedData: Record<string, unknown>) => void;
}

export function DirectPublishModal({ item, onClose, onSuccess }: DirectPublishModalProps) {
  // Config state from API
  const [config, setConfig] = useState<PublicationConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Section A: Destination & Status
  const [siteId, setSiteId] = useState<string>("edition-tv-public-web");

  // Section B: Category / Section (Default infer from headline/summary)
  const inferCategory = (title: string, summary?: string): string => {
    const text = (title + " " + (summary || "")).toLowerCase();
    if (text.includes("f1") || text.includes("norris") || text.includes("piastri") || text.includes("football") || text.includes("man utd") || text.includes("transfer") || text.includes("sport") || text.includes("match") || text.includes("league")) {
      return "Sports";
    }
    if (text.includes("economic") || text.includes("bank") || text.includes("market") || text.includes("shares") || text.includes("business")) {
      return "Business";
    }
    if (text.includes("ai") || text.includes("cyber") || text.includes("software") || text.includes("digital") || text.includes("tech")) {
      return "Technology";
    }
    if (text.includes("government") || text.includes("parliament") || text.includes("politics")) {
      return "Politics";
    }
    if (text.includes("vaccine") || text.includes("nhs") || text.includes("hospital") || text.includes("health")) {
      return "Health";
    }
    return "World";
  };

  const [category, setCategory] = useState<string>(inferCategory(item.title, item.summary));

  // Section C: Placement
  const [placement, setPlacement] = useState<string>("standard");

  // Section D: Visibility
  const [visibility, setVisibility] = useState<string>("PUBLIC");

  // Section E: Article Type
  const [articleType, setArticleType] = useState<string>("STANDARD");

  // Section F: Author / Byline
  const [authorId, setAuthorId] = useState<string>(item.author || "Wire Source / Agency");

  // Fetch publication configuration from backend API
  const fetchConfig = async () => {
    setIsLoadingConfig(true);
    setConfigError(null);
    try {
      let data: PublicationConfig | null = null;

      try {
        const resData = await apiClient.get<PublicationConfig>('/newsroom/wire-items/publication-config');
        if (resData) {
          data = resData;
        }
      } catch {
        // Fallback endpoint fetch
      }

      if (!data) {
        // Fetch categories dynamically from backend API
        let categoryList: OptionItem[] = [];
        try {
          const raw = await apiClient.get<any>('/categories');
          if (raw) {
            const items = Array.isArray(raw) ? raw : (raw.content || raw.data || []);
            categoryList = items.map((c: any) => ({
              id: c.name || c.title || c.slug,
              name: c.name || c.title || c.slug,
              enabled: true,
            }));
          }
        } catch {
          // ignore
        }

        if (categoryList.length === 0) {
          categoryList = [
            { id: "World", name: "World", enabled: true },
            { id: "Business", name: "Business", enabled: true },
            { id: "Technology", name: "Technology", enabled: true },
            { id: "Politics", name: "Politics", enabled: true },
            { id: "Sports", name: "Sports", enabled: true },
            { id: "Health", name: "Health", enabled: true },
            { id: "General News", name: "General News", enabled: true },
          ];
        }

        data = {
          destinations: [{ id: "edition-tv-public-web", name: "Edition TV Public Web", enabled: true }],
          categories: categoryList,
          placements: [
            { id: "standard", name: "Standard Article Feed", requiresImage: false, enabled: true },
            { id: "lead", name: "Lead Hero Story", requiresImage: true, enabled: true },
            { id: "editors_picks", name: "Editor's Picks", requiresImage: false, enabled: true },
            { id: "trending", name: "Trending Section", requiresImage: false, enabled: true },
          ],
          articleTypes: [
            { id: "STANDARD", name: "Standard News Report", enabled: true },
            { id: "BREAKING", name: "Breaking News Alert", enabled: true },
            { id: "OPINION", name: "Opinion & Analysis", enabled: true },
            { id: "INVESTIGATION", name: "Investigative Report", enabled: true },
          ],
          visibilityModes: [
            { id: "PUBLIC", name: "Public (Free Access)", enabled: true },
            { id: "SUBSCRIBER_ONLY", name: "Subscriber Only", enabled: true },
          ],
          authorOptions: [
            { id: item.author || "Wire Agency", name: item.author || "Wire Agency", enabled: true },
            { id: "Edition TV Editorial Desk", name: "Edition TV Editorial Desk", enabled: true },
          ],
        };
      }

      setConfig(data);
      if (data.destinations && data.destinations.length > 0) {
        setSiteId(data.destinations[0].id);
      }
      if (data.categories && data.categories.length > 0 && !data.categories.some((c) => c.id === category)) {
        setCategory(data.categories[0].id);
      }
      if (data.placements && data.placements.length > 0) {
        setPlacement(data.placements[0].id);
      }
    } catch (err) {
      console.error("Error loading publication configuration:", err);
      setConfigError(err instanceof Error ? err.message : "Failed to load publication settings");
    } finally {
      setIsLoadingConfig(false);
    }
  };


  useEffect(() => {
    fetchConfig();
  }, []);

  // Section G: Tags
  const generateInitialTags = (title: string, cat: string): string[] => {
    const tagsSet = new Set<string>();
    tagsSet.add(cat);
    const words = title.split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9]/g, ""));
    words.forEach((w) => {
      if (w.length > 4 && !["about", "after", "again", "their", "there", "where", "which", "would"].includes(w.toLowerCase())) {
        tagsSet.add(w);
      }
    });
    return Array.from(tagsSet).slice(0, 5);
  };

  const [tags, setTags] = useState<string[]>(generateInitialTags(item.title, category));
  const [tagInput, setTagInput] = useState<string>("");

  // Section H & I: Hero Image Option & Alt Text
  const hasWireImage = Boolean((item.mediaThumbnailUrl && item.mediaThumbnailUrl.trim() !== "") || (item.enclosureUrl && item.enclosureUrl.trim() !== ""));
  const wireImageUrl = item.mediaThumbnailUrl || item.enclosureUrl || "";
  const [imageOption, setImageOption] = useState<"wire_image" | "no_image">(hasWireImage ? "wire_image" : "no_image");
  const [imageAltText, setImageAltText] = useState<string>(item.title);

  // Section J & K: SEO & Slug
  const generateSlug = (title: string): string => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const [slug, setSlug] = useState<string>(generateSlug(item.title));
  const [seoTitle, setSeoTitle] = useState<string>(item.title);
  const [seoDescription, setSeoDescription] = useState<string>(item.summary || item.title);
  const [canonicalUrl, setCanonicalUrl] = useState<string>(`https://editiontv.com/articles/${slug}`);

  // Section N: Breaking News
  const [isBreaking, setIsBreaking] = useState<boolean>(false);

  // Modal Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update canonical URL if slug changes
  useEffect(() => {
    setCanonicalUrl(`https://editiontv.com/articles/${slug}`);
  }, [slug]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Form Validation and Submission
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Hero/Top Story Image Validation
    const selectedPlacementObj = config?.placements?.find((p) => p.id === placement);
    if ((selectedPlacementObj?.requiresImage || placement === "hero" || placement === "top_story") && (imageOption === "no_image" || !wireImageUrl)) {
      setValidationError("This placement requires a featured image. Please select an image or change the homepage placement.");
      return;
    }

    if (!category || category.trim() === "") {
      setValidationError("Please select a valid publication category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const idempotencyKey = `pub-wire-${item.id}-${Date.now()}`;
      const payload = {
        siteId,
        categoryId: category,
        placement,
        visibility,
        articleType: isBreaking ? "BREAKING" : articleType,
        authorId,
        tags,
        imageId: imageOption === "wire_image" ? wireImageUrl : null,
        imageAltText: imageOption === "wire_image" ? imageAltText : null,
        slug,
        seoTitle,
        seoDescription,
        canonicalUrl,
        publishMode: "LIVE",
        idempotencyKey,
      };

      const result = await apiClient.post<any>(`/newsroom/wire-items/${item.id}/publish-direct`, payload);
      onSuccess(result);
    } catch (err) {
      console.error("Direct publish error:", err);
      setValidationError(err instanceof Error ? err.message : "Failed to publish wire article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-900 font-sans">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-heading">
                Publish to Public Web
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  Direct Publication Mode
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Publish this wire article directly to Edition TV without opening Story Editor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Selected Article Display (READ-ONLY) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-400" /> Selected Article (Read-Only)
              </span>
              <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200">
                Source: {item.sourceId || "RSS Wire"}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-900 line-clamp-2 font-serif">{item.title}</h3>
            {item.summary && <p className="text-xs text-slate-600 line-clamp-2 font-serif">{item.summary}</p>}
          </div>

          {/* Configuration Loading State */}
          {isLoadingConfig && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 text-center font-mono">
              <Loader2 className="h-6 w-6 text-red-600 animate-spin" />
              <p className="text-xs text-slate-600 font-bold">Loading publication settings from backend API...</p>
            </div>
          )}

          {/* Configuration Error Banner */}
          {configError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-rose-800 text-xs font-bold font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-none" />
                <span>{configError}</span>
              </div>
              <button
                type="button"
                onClick={fetchConfig}
                className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200 flex items-center gap-1 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-800 text-xs font-bold font-mono">
              <AlertTriangle className="h-4 w-4 flex-none text-rose-600 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {!isLoadingConfig && config && (
            <form onSubmit={handlePublishSubmit} className="space-y-5">
              {/* SECTION A: DESTINATION SITE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1 font-mono">
                  Section A — Destination Site
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Publication Site</label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                  >
                    {config.destinations?.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION B & C: CATEGORY & HOMEPAGE PLACEMENT */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1 font-mono">
                  Section B & C — Category & Homepage Placement
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                      Category / Section <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                    >
                      {config.categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                      Homepage Placement <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={placement}
                      onChange={(e) => setPlacement(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                    >
                      {config.placements?.map((plc) => (
                        <option key={plc.id} value={plc.id}>
                          {plc.name} {plc.requiresImage ? "(Requires Image)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION D, E, F: VISIBILITY, ARTICLE TYPE & BYLINE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1 font-mono">
                  Section D, E & F — Visibility, Type & Author Attribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                    >
                      {config.visibilityModes?.map((vis) => (
                        <option key={vis.id} value={vis.id}>
                          {vis.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Article Type</label>
                    <select
                      value={articleType}
                      onChange={(e) => setArticleType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                    >
                      {config.articleTypes?.map((typ) => (
                        <option key={typ.id} value={typ.id}>
                          {typ.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Author / Byline</label>
                    <input
                      type="text"
                      value={authorId}
                      onChange={(e) => setAuthorId(e.target.value)}
                      placeholder="Wire Source / Agency"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION G: TAGS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5 font-mono">
                  <TagIcon className="h-3.5 w-3.5 text-red-600" /> Section G — Article Tags
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag and press Add..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs transition font-sans"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600 text-slate-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION H & I: HERO / FEATURED IMAGE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5 font-mono">
                  <ImageIcon className="h-3.5 w-3.5 text-red-600" /> Section H & I — Featured Image & Alt Text
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Image Selection</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-sans">
                        <input
                          type="radio"
                          name="imageOption"
                          checked={imageOption === "wire_image"}
                          onChange={() => setImageOption("wire_image")}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span>Use Wire Media Image {hasWireImage ? "🖼️" : "(No wire image available)"}</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-sans">
                        <input
                          type="radio"
                          name="imageOption"
                          checked={imageOption === "no_image"}
                          onChange={() => setImageOption("no_image")}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span>No Featured Image</span>
                      </label>
                    </div>
                  </div>

                  {imageOption === "wire_image" && wireImageUrl ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3">
                      <img
                        src={wireImageUrl}
                        alt="Wire Preview"
                        className="h-16 w-24 object-cover rounded-lg border border-slate-200 flex-none"
                      />
                      <div className="text-[10px] space-y-1 text-slate-500 overflow-hidden font-mono">
                        <p className="font-bold text-slate-900 truncate">Wire Image Preview</p>
                        <p className="truncate">Credit: {item.author || "RSS Source"}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Image Alt Text</label>
                  <input
                    type="text"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                  />
                </div>
              </div>

              {/* SECTION J & K: SEO & SLUG */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1 font-mono">
                  Section J & K — SEO & URL Slug
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">Custom URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">SEO Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="breakingCheck"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="breakingCheck" className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1 font-mono">
                    Mark as Breaking News ⚡
                  </label>
                </div>
              </div>

              {/* PUBLICATION SUMMARY & CONTENT WARNING */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Publication Summary
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                    Direct Web Publication
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Section:</span>
                    <span className="font-bold text-slate-900">{category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Placement:</span>
                    <span className="font-bold text-slate-900 capitalize">{placement}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Visibility:</span>
                    <span className="font-bold text-slate-900">{visibility}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Author:</span>
                    <span className="font-bold text-slate-900 truncate">{authorId}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-800 text-xs font-bold font-mono">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-none" />
                  <span>Direct publication publishes the wire content live without editorial rewriting.</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2 disabled:opacity-50 font-sans"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span> Publishing Live...
                    </>
                  ) : (
                    <>Confirm & Publish Live 🚀</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
