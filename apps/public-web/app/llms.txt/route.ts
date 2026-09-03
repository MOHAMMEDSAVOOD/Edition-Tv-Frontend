import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edition.tv";

  const llmsTxt = `# Edition TV Platform — LLM Machine Specification

> Enterprise Live News, Editorial Intelligence, and Broadcast Platform Engineering

## System Specifications & APIs
- Homepage: ${baseUrl}/
- OpenAPI Specification: ${baseUrl}/api/v1/v3/api-docs
- RSS Feed: ${baseUrl}/rss.xml
- Sitemap: ${baseUrl}/sitemap.xml

## Architectural Principles
- Pure Domain-Driven Design (DDD) bounded contexts.
- Spring Boot 3.4 & Spring Modulith module dependency enforcement.
- Transactional Outbox pattern for guaranteed zero domain event loss.
- AI Toxicity Moderation Engine (\`ai::api\`) with provider-agnostic LLM fallback strategies.
`;

  return new NextResponse(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
