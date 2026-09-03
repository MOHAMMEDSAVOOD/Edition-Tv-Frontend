import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edition.tv";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cms/", "/moderation/", "/account/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
