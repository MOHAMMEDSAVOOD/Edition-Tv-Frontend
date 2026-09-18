# EDITIONTV — NEXT IMPLEMENTATION PROMPT
**Execution Target:** Senior / Principal Full-Stack Engineer  
**Repositories:**  
- Backend: `/Users/mohammedsavood/Development/Edition-Tv`  
- Frontend: `/Users/mohammedsavood/Development/Edition-Tv-Frontend`  
**Execution Policy:** Code Changes Permitted According to Plan • Zero Hallucination • Grounded in Audit Evidence

============================================================
NON-NEGOTIABLE AUTHENTICATION RULE
============================================================
AUTHENTICATION SYSTEM IS FROZEN AND MUST NOT BE MODIFIED.

Do NOT:
- Migrate Firebase JWT authentication to cookies
- Introduce HttpOnly / SameSite authentication cookies
- Change token issuance, refresh, or Firebase client auth
- Change JWT structure, claims, or validation filters
- Modify `FirebaseAuthFilter.java` or Spring Security auth configuration
- Modify `packages/auth` or frontend login / register authentication architecture

============================================================
IMPLEMENTATION DIRECTIVE
============================================================

You are tasked with executing the remediation of all identified production blockers and contract fractures in EditionTV based strictly on the findings of `EDITIONTV_DEEP_CODEBASE_AND_PRODUCT_AUDIT.md`.

Follow the prioritized phases below:

------------------------------------------------------------
PHASE P0 — CRITICAL CONTRACT & USER JOURNEY FIXES
------------------------------------------------------------

### Task 1: Fix Comment Submission Contract & Eliminate Silent Failure
- **Problem:** `CreateCommentRequestDto.java` enforces mandatory `@NotBlank String authorId` and `authorName`. `apps/public-web/repositories/commentRepository.ts` sends only `{ content }`. Spring Boot rejects the request with HTTP 400 Bad Request, which the frontend catches and hides with a synthetic optimistic comment that never saves to PostgreSQL.
- **Files to Modify:**
  - `apps/public-web/repositories/commentRepository.ts`
  - `apps/public-web/components/article/CommentsSection.tsx`
- **Requirements:**
  1. Retrieve the authenticated user's ID and display name from the existing auth context / state.
  2. Pass `authorId` and `authorName` in the POST payload to `/api/v1/public/articles/${articleId}/comments`.
  3. Ensure that if the backend returns an error, the optimistic comment is rolled back and an explicit error toast is shown.
- **Verification:**
  - Post a comment as an authenticated user.
  - Refresh the page and verify the comment is returned by `GET /api/v1/public/articles/{slug}/comments` directly from PostgreSQL.

### Task 2: Fix Author Article Portfolio Feed
- **Problem:** In `apps/public-web/services/feedService.ts` line 119, `getFeedByAuthor(authorId)` ignores `authorId` and calls `feedRepository.getPublicFeed()`. Browsing `/authors/[id]` shows the generic homepage feed under the target author's name.
- **Files to Modify:**
  - `apps/public-web/services/feedService.ts`
  - `apps/public-web/repositories/feedRepository.ts`
  - `src/main/java/com/edition/platform/cms/api/ArticleController.java` (or `NewsFeedController.java`)
  - `src/main/java/com/edition/platform/cms/domain/ArticleRepository.java`
- **Requirements:**
  1. Verify/implement `GET /api/v1/public/articles?authorId={authorId}` or `GET /api/v1/public/authors/{authorId}/articles` in the backend returning published articles matching the specified author ID.
  2. Update `feedRepository.ts` and `feedService.ts` to call this endpoint with `authorId`.
- **Verification:**
  - Access `/authors/{authorId}` and confirm only articles authored by that specific journalist are rendered.

### Task 3: Fix Live Blog Slug Resolution
- **Problem:** `live_blogs` table (`V6`) has no `slug` column. The frontend route `apps/public-web/app/liveblog/[slug]/page.tsx` calls `GET /live-blogs/{slug}`, causing 400/404 errors when readable slugs are passed.
- **Files to Modify:**
  - `src/main/resources/db/migration/V49__add_slug_to_live_blogs.sql` (New Flyway migration)
  - `src/main/java/com/edition/platform/liveblog/domain/LiveBlog.java`
  - `src/main/java/com/edition/platform/liveblog/api/LiveBlogController.java`
  - `src/main/java/com/edition/platform/liveblog/domain/LiveBlogRepository.java`
- **Requirements:**
  1. Add `slug VARCHAR(255) UNIQUE` to `live_blogs` table via Flyway migration.
  2. Update `LiveBlogController.java` to support querying by either UUID or unique slug.
- **Verification:**
  - Query a live blog via its semantic slug in both backend test and frontend browser.

------------------------------------------------------------
PHASE P1 — PERFORMANCE & HYDRATION OPTIMIZATION
------------------------------------------------------------

### Task 4: Eliminate Homepage Client Hydration Double-Fetch
- **Problem:** `apps/public-web/app/page.tsx` executes 8 parallel SSR queries. `HomeFeedClient.tsx` immediately executes an unnecessary client-side `useEffect` that re-queries all 8 endpoints upon hydration.
- **Files to Modify:**
  - `apps/public-web/components/home/HomeFeedClient.tsx`
  - `apps/public-web/app/page.tsx`
- **Requirements:**
  1. Pass the pre-fetched SSR feed data as initial props to `HomeFeedClient`.
  2. Initialize local React state with the SSR data and suppress the immediate initial fetch.
  3. Re-fetch only upon user-initiated actions (e.g., manual refresh, tab switch, or infinite scroll).
- **Verification:**
  - Open network tab and verify that visiting `/` generates zero duplicate feed requests upon initial render.

------------------------------------------------------------
PHASE P2 — TELEMETRY & TRANSPARENCY
------------------------------------------------------------

### Task 5: Address Synthetic Weather & Market Feeds
- **Problem:** `WeatherDataService.java` and `MarketDataService.java` return hardcoded mock lists.
- **Files to Modify:**
  - `src/main/java/com/edition/platform/weather/WeatherDataService.java`
  - `src/main/java/com/edition/platform/market/MarketDataService.java`
  - `apps/public-web/components/layout/WeatherMarketStrip.tsx`
- **Requirements:**
  1. If live external APIs are unconfigured, clearly mark the data in the DTO as `isSimulated: true`.
  2. In the frontend UI widget, display a subtle "Demo Data" badge or allow configuring standard public APIs.

------------------------------------------------------------
ACCEPTANCE CRITERIA & RUNTIME VERIFICATION
------------------------------------------------------------
1. **Backend Tests:** Run `./gradlew test` and ensure all unit and integration tests pass cleanly with 0 failures.
2. **Frontend Build:** Run `pnpm --filter public-web build` and ensure the Next.js bundle compiles with 0 TypeScript or lint errors.
3. **End-to-End Verification:**
   - Verify comments post cleanly and persist across browser reloads.
   - Verify author profile page displays target author's articles exclusively.
   - Verify live blog page loads cleanly via slug URL.
   - Verify network inspector shows no redundant double-fetch on homepage load.
