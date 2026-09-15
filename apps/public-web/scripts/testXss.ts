import assert from "node:assert";
import { articleMapper } from "../mappers/articleMapper";
import { ArticleResponseDto } from "../dtos/article.dto";

async function runTests() {
  console.log("Running XSS Regression Tests on articleMapper...");

  const baseDto = {
    id: "123",
    slug: "test-article",
    category: "News",
    publishedAt: "2024-01-01T00:00:00Z",
    contentBody: "",
    title: "Test",
    headline: "Test Headline",
  } as ArticleResponseDto;

  // Test 1: Malicious <script> tag
  const maliciousScript = "<p>Hello</p><script>alert('xss')</script>";
  let detail = articleMapper.toArticleDetail({ ...baseDto, contentBody: maliciousScript });
  assert(!detail.bodyHtml.includes("<script>"), "Failed: Script tag was not removed!");
  assert(!detail.bodyHtml.includes("alert"), "Failed: Script content was not removed!");
  assert(detail.bodyHtml.includes("<p>Hello</p>"), "Failed: Valid HTML was lost!");
  console.log("✓ Script tags neutralized.");

  // Test 2: Unsafe URL scheme (javascript:)
  const maliciousLink = "<a href=\"javascript:alert('xss')\">Click me</a>";
  detail = articleMapper.toArticleDetail({ ...baseDto, contentBody: maliciousLink });
  assert(!detail.bodyHtml.includes("javascript:"), "Failed: javascript: scheme was not removed!");
  console.log("✓ Unsafe javascript: scheme neutralized.");

  // Test 3: Event handler injection
  const maliciousEvent = "<img src=\"invalid.jpg\" onerror=\"alert(1)\" />";
  detail = articleMapper.toArticleDetail({ ...baseDto, contentBody: maliciousEvent });
  assert(!detail.bodyHtml.includes("onerror"), "Failed: onerror attribute was not removed!");
  console.log("✓ Event handler attributes neutralized.");

  // Test 4: Iframe blocking (as iframes are blocked by default unless allowlisted)
  const maliciousIframe = "<div><iframe src=\"http://malicious.com\"></iframe></div>";
  detail = articleMapper.toArticleDetail({ ...baseDto, contentBody: maliciousIframe });
  assert(!detail.bodyHtml.includes("<iframe"), "Failed: iframe tag was not removed!");
  console.log("✓ iframes blocked.");

  // Test 5: Legitimate Editorial HTML preservation
  const validHtml = "<h1>Headline</h1><p>Para</p><blockquote>Quote</blockquote><figure><img src=\"https://editiontv.com/img.jpg\" alt=\"test\"/><figcaption>Caption</figcaption></figure>";
  detail = articleMapper.toArticleDetail({ ...baseDto, contentBody: validHtml });
  assert(detail.bodyHtml.includes("<h1>Headline</h1>"), "Failed: h1 was lost!");
  assert(detail.bodyHtml.includes("<blockquote>Quote</blockquote>"), "Failed: blockquote was lost!");
  assert(detail.bodyHtml.includes("<figure"), "Failed: figure was lost!");
  console.log("✓ Legitimate HTML tags preserved.");

  console.log("All XSS Regression tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
