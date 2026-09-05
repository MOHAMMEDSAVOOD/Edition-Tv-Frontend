import { ArticleResponseDto } from "@/dtos/article.dto";
import { ArticleDetail } from "@/services/articleService";

function getHighResImageUrl(url?: string): string | undefined {
  if (!url || url.trim() === "") return undefined;
  if (url.includes("ichef.bbci.co.uk")) {
    return url.replace(/\/standard\/\d+\//, "/standard/800/");
  }
  if (url.includes("w=") || url.includes("width=")) {
    return url.replace(/([?&]w=)\d+/gi, "$11200").replace(/([?&]width=)\d+/gi, "$11200");
  }
  return url;
}

function parseContentBodyToHtml(contentBody?: string): string | null {
  if (!contentBody || !contentBody.trim()) return null;

  const trimmed = contentBody.trim();

  // Check if contentBody is JSON blocks array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const blocks = JSON.parse(trimmed);
      if (Array.isArray(blocks) && blocks.length > 0) {
        return blocks
          .map((b: any) => {
            if (!b || typeof b !== "object") return "";
            const type = (b.type || "").toUpperCase();
            const content = b.content || "";

            switch (type) {
              case "PARAGRAPH": {
                const subParagraphs = content.split(/\n\n+/).filter(Boolean);
                return subParagraphs
                  .map((p: string) => `<p class="text-base text-slate-900 leading-relaxed font-sans mb-6">${p.trim()}</p>`)
                  .join("");
              }
              case "HEADING": {
                const levelClass = b.level === 3 ? "text-xl" : "text-2xl";
                return `<h${b.level || 2} class="${levelClass} font-bold font-serif text-slate-900 mt-8 mb-4">${content}</h${b.level || 2}>`;
              }
              case "IMAGE": {
                const imgUrl = b.url || b.content || "";
                if (!imgUrl) return "";
                return `<figure class="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"><img src="${imgUrl}" alt="${b.altText || b.caption || ''}" class="w-full max-h-[550px] object-cover" />${b.caption ? `<figcaption class="p-3 text-xs text-slate-500 italic font-sans border-t border-slate-200/60 bg-slate-50/50">${b.caption}${b.credit ? ` (${b.credit})` : ''}</figcaption>` : ''}</figure>`;
              }
              case "PULL_QUOTE": {
                return `<blockquote class="border-l-4 border-red-600 pl-6 italic text-slate-900 font-serif text-xl md:text-2xl my-8 bg-red-50/40 py-5 pr-4 rounded-r-2xl border border-slate-200/60 shadow-2xs">&ldquo;${content}&rdquo;${b.credit ? `<cite class="block font-sans text-xs font-bold text-slate-500 not-italic mt-2.5">— ${b.credit}</cite>` : ''}</blockquote>`;
              }
              case "CALLOUT": {
                return `<div class="p-5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-2xl my-6 text-sm text-amber-950 font-sans shadow-2xs leading-relaxed"><strong class="block font-mono uppercase text-[10px] text-amber-700 tracking-wider mb-1">Key Takeaway / Notice</strong>${content}</div>`;
              }
              case "TIMELINE": {
                return `<div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl my-6 text-xs text-slate-800 font-mono font-bold leading-relaxed">${content}</div>`;
              }
              case "SOURCE": {
                return `<div class="p-3.5 bg-slate-100/80 border border-slate-200 rounded-2xl my-4 text-xs text-slate-700 font-mono">Source: <a href="${b.url || '#'}" target="_blank" rel="noreferrer" class="text-red-600 font-bold hover:underline">${content || b.url || 'Reference'}</a></div>`;
              }
              default: {
                return `<p class="text-base text-slate-900 leading-relaxed font-sans mb-6">${content}</p>`;
              }
            }
          })
          .filter(Boolean)
          .join("");
      }
    } catch {
      // Non-JSON fallback
    }
  }

  // If contentBody is already HTML (contains tags)
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  // Plain text paragraphs fallback
  const paragraphs = trimmed.split(/\n\n+/).filter(Boolean);
  return paragraphs
    .map((p) => `<p className="text-base text-slate-900 leading-relaxed font-sans mb-6">${p.trim()}</p>`)
    .join("");
}

export const articleMapper = {
  toArticleDetail(dto: ArticleResponseDto): ArticleDetail {
    const publishedDate = dto.publishedAt ? new Date(dto.publishedAt) : new Date();
    const formattedDate = publishedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const headlineText = dto.headline || dto.title || "Global AI Engineering Standard Adopted Across Enterprise Systems";
    const summaryText = dto.summary || dto.subtitle || "Latest breaking analysis from Edition TV correspondents.";

    const parsedHtml = parseContentBodyToHtml(dto.contentBody || (dto as any).bodyHtml);
    const bodyHtml = parsedHtml || `<p className="text-base text-slate-900 leading-relaxed font-sans mb-6">${summaryText}</p>`;

    const summaryPoints = (dto.summaryPoints && dto.summaryPoints.length > 0)
      ? dto.summaryPoints
      : (summaryText ? [summaryText] : []);

    return {
      id: dto.id || dto.articleId || `art-${dto.slug}`,
      slug: dto.slug,
      headline: headlineText,
      title: headlineText,
      subtitle: summaryText,
      summary: summaryText,
      bodyHtml,
      category: dto.category || "World",
      topic: dto.topic || dto.category || "World",
      authorId: dto.primaryAuthorId || dto.authorId || "1",
      authorName: dto.authorName || "Edition News Desk",
      authorTitle: dto.authorTitle || "Senior Correspondent",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      publishedAt: formattedDate,
      readingTime: dto.readingTime || "5 min read",
      readingTimeMinutes: 5,
      featuredImageUrl: getHighResImageUrl((dto as any).featuredImageUrl || (dto as any).coverImageUrl || (dto as any).mediaThumbnailUrl || (dto as any).imageUrl || "") || "",
      imageCaption: (dto as any).imageCaption || "",
      viewsCount: dto.viewCount || 1250,
      summaryPoints,
      tags: (dto as any).tags || [dto.category ? dto.category.toLowerCase() : "news"],
      commentsCount: (dto as any).commentsCount || 0,
      audioUrl: "https://actions.google.com/sounds/v1/speech/person_speaking.ogg",
      toxicityScore: dto.toxicityScore || 0.01,
    };
  },
};

