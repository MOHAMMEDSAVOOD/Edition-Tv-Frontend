import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const feedUrl = searchParams.get("feedUrl");

  if (!feedUrl) {
    return NextResponse.json({ valid: false, errorMessage: "Missing feedUrl parameter" }, { status: 400 });
  }

  try {
    const startTime = Date.now();
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      cache: "no-store",
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return NextResponse.json({
        valid: false,
        httpStatus: response.status,
        latencyMs,
        errorMessage: `Source server returned HTTP ${response.status}: ${response.statusText}`,
      });
    }

    const xmlText = await response.text();

    // Check if valid RSS or Atom
    const isRss = xmlText.includes("<rss") || xmlText.includes("<channel");
    const isAtom = xmlText.includes("<feed") && xmlText.includes("xmlns=\"http://www.w3.org/2005/Atom\"");

    if (!isRss && !isAtom) {
      return NextResponse.json({
        valid: false,
        httpStatus: response.status,
        latencyMs,
        errorMessage: "Content is not a recognized RSS or Atom XML feed.",
      });
    }

    // Extract title
    const titleMatch = xmlText.match(/<channel[^>]*>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i) ||
                       xmlText.match(/<feed[^>]*>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "External News Feed";

    // Extract description
    const descMatch = xmlText.match(/<channel[^>]*>[\s\S]*?<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i) ||
                      xmlText.match(/<feed[^>]*>[\s\S]*?<subtitle>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/subtitle>/i);
    const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";

    // Extract sample items
    const sampleItems: Array<{ id: string; title: string; canonicalUrl: string }> = [];
    const itemRegex = isAtom
      ? /<entry[\s\S]*?<\/entry>/gi
      : /<item[\s\S]*?<\/item>/gi;

    const matches = xmlText.match(itemRegex) || [];
    for (let i = 0; i < Math.min(matches.length, 5); i++) {
      const block = matches[i];
      const itemTitleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
      const itemTitle = itemTitleMatch ? itemTitleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "Untitled";

      let link = "";
      if (isAtom) {
        const linkMatch = block.match(/<link[^>]*href="([^"]*)"/i);
        link = linkMatch ? linkMatch[1] : "";
      } else {
        const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
        link = linkMatch ? linkMatch[1].trim() : "";
      }

      sampleItems.push({
        id: `sample-${i + 1}`,
        title: itemTitle,
        canonicalUrl: link,
      });
    }

    return NextResponse.json({
      valid: true,
      httpStatus: 200,
      latencyMs,
      feedType: isAtom ? "Atom" : "RSS 2.0",
      title,
      description,
      itemCount: matches.length,
      sampleItems,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({
      valid: false,
      errorMessage: error.message || "Failed to fetch or parse feed",
    });
  }
}
