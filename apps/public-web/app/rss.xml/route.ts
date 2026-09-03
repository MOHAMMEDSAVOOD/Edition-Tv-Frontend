import { NextResponse } from "next/server";
import { feedService } from "@/services/feedService";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edition.tv";

  try {
    const feed = await feedService.getPublicFeed(1, 20);
    const articles = feed.items || [];

    const itemsXml = articles.map((article) => `
    <item>
      <title><![CDATA[${article.headline}]]></title>
      <link>${baseUrl}/articles/${article.slug}</link>
      <description><![CDATA[${article.summary}]]></description>
      <pubDate>${new Date(article.publishedAt || Date.now()).toUTCString()}</pubDate>
      <guid>${baseUrl}/articles/${article.slug}</guid>
    </item>`).join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${baseUrl}/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Edition TV — Live Global News &amp; Editorial Intelligence</title>
    <link>${baseUrl}</link>
    <description>Enterprise live news broadcast, digital editions, and editorial platform.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?><error>Internal Server Error</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
