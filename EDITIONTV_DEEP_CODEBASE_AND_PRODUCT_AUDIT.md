# EDITIONTV — DEEP FULL-STACK CODEBASE + PRODUCT FEATURE REALITY AUDIT
**Auditor:** Principal Software Architect & CTO-Level System Audit  
**Target Repositories:**  
- **Backend:** `/Users/mohammedsavood/Development/Edition-Tv` (Java 21, Spring Boot 3.4.2, Spring Modulith, PostgreSQL 16)  
- **Frontend:** `/Users/mohammedsavood/Development/Edition-Tv-Frontend` (Next.js 15 App Router, TypeScript 5, Tailwind CSS, pnpm monorepo)  
**Inspection Date:** 2026-09-16  
**Audit Policy:** Strict Source Code Inspection • Zero Synthetic Evidence • Authentication System Frozen

---

## 1. Executive Summary

This document presents the definitive CTO-level architectural and product-feature reality audit of the EditionTV digital news platform. Rather than reviewing past documentation, checklists, or planned capabilities, this evaluation is grounded entirely in execution-path tracing across the backend Java 21 / Spring Boot 3.4.2 monolith and the frontend Next.js 15 monorepo.

### High-Level Reality vs. Surface Perception
1. **Core Platform Solidification:** The foundational editorial domain, story lifecycle state machine, article persistence, and PostgreSQL full-text search are architecturally sound and production-grade. The migration to `PostgreSqlSearchRepositoryAdapter` resolved earlier reliance on in-memory/synthetic indexes.
2. **Critical End-to-End Disconnections:** Several core user-facing features suffer from severe frontend-to-backend contract fractures:
   - **Author Article Feed is Broken:** `apps/public-web/services/feedService.ts` (`getFeedByAuthor`) completely ignores `authorId` and calls `feedRepository.getPublicFeed()`. Browsing `/authors/[id]` displays the generic homepage feed under the target author's name.
   - **Comment Submission Fails Silently:** `CreateCommentRequestDto.java` requires mandatory `@NotBlank String authorId` and `authorName`. The frontend `apps/public-web/repositories/commentRepository.ts` only sends `{ content }`. Spring Boot rejects the request with `400 Bad Request`. The frontend UI catches the error and injects an optimistic fake comment with status `"APPROVED"`, masking the failure from the user while persisting nothing to PostgreSQL.
   - **Live Blog Routing Fracture:** The `live_blogs` database table (migration `V6`) stores live blogs by UUID primary key with no `slug` column. The frontend route `apps/public-web/app/liveblog/[slug]/page.tsx` issues requests to `GET /live-blogs/{slug}`, which fails if semantic slug titles are requested instead of raw UUIDs.
   - **Synthetic Market & Weather Telemetry:** The public homepage renders live stock tickers and weather widgets. However, `WeatherDataService.java` and `MarketDataService.java` serve hardcoded static lists (London, NY, Tokyo / S&P 500, NASDAQ, FTSE) with simulated fluctuations rather than connecting to live data feeds.
   - **Dead Interactive UI Controls:** Topic and category "Follow" buttons on `apps/public-web/app/topics/[slug]/page.tsx` have no `onClick` handlers or backend persistence. "Recently Viewed" reading history is strictly browser-local (`localStorage`) with no backend user profile synchronization.

### Audit Summary Statistics
- **Total Flyway Migrations:** 48 migrations (`V1__init_schema.sql` through `V48__add_comment_author_id_index.sql`).
- **Total Spring REST Controllers:** 39 active `@RestController` classes.
- **Total Frontend Next.js Apps:** 7 applications (`public-web`, `admin`, `cms-studio`, `reporter-studio`, `live-editorial`, `ai-studio`, `analytics`).
- **Feature Status Overview:**
  - **Production-Ready & Working:** 24 features (Article publishing, PostgreSQL FTS, Saved Articles pagination, GCS cloud uploads, Open Graph sharing, Revision history, RSS feed generation, Story poster generation).
  - **Partial / Fractured:** 14 features (Comments end-to-end, Author feeds, Live blogs, Social poster downloads, Newsletter subscriptions, Related stories ranking).
  - **Synthetic / Mocked Fallbacks:** 4 features (Weather widget, Financial market tickers, Topic following, Recently viewed history).
  - **Backend-Only (Unconnected UI):** 9 subsystems (Dynamic RBAC entities, Beat assignments, Geography node taxonomy, AI provenance tracing, Rights of response, Multi-channel publication endpoints).
  - **Missing Core Newsroom Features:** 8 features (Editorial embargo timer, Live event push updates over STOMP/SSE, Media asset CDN cache purging, Public user profile editing).

---

## 2. Repository Architecture

### Backend: `/Users/mohammedsavood/Development/Edition-Tv`
- **Framework & Runtime:** Java 21, Spring Boot 3.4.2, Spring Modulith 1.3.1.
- **Database & Persistence:** PostgreSQL 16 managed via Flyway (`src/main/resources/db/migration`). Spring Data JPA with Hibernate.
- **Modular Monolith Packages (`src/main/java/com/edition/platform`):**
  - `advertisement`: Campaign management, impression tracking, placement rules.
  - `ai`: Headline generation, automated summaries, moderation analysis.
  - `analytics`: Page views, article read time, engagement metrics.
  - `auth`: Firebase token validation, user registration, JWT filter. **(STRICTLY FROZEN)**
  - `bookmarks`: Saved article persistence, user collections, pagination.
  - `cms`: Core content management system, story lifecycle, workflows.
  - `comments`: Article discussions, moderation pipeline, status filters.
  - `configuration`: Dynamic system properties, site configuration.
  - `datastudio`: Read-only analytical introspection, database metadata.
  - `editorial`: Assignment tracking, desk workflows, beats, approvals.
  - `feed`: Public news feeds, curated sections, homepage layout feeds.
  - `ingestion`: RSS feed parsing, automated deduplication, wire imports.
  - `liveblog`: Live coverage events, chronological updates.
  - `location`: Hierarchical geography nodes, regional desks.
  - `market`: Financial market indices, currency exchange rates.
  - `media`: Object storage (GCS / Local), image metadata, video processing.
  - `notifications`: User notification delivery, read state tracking.
  - `search`: Full-text search, PostgreSQL tsvector indexing, ranking.
  - `security`: Spring Security configuration, role-based authorization.
  - `social`: Poster rendering, social share metadata, webhook integrations.
  - `users`: User profiles, preferences, role assignments.
  - `weather`: Meteorological data service.

### Frontend: `/Users/mohammedsavood/Development/Edition-Tv-Frontend`
- **Monorepo Management:** `pnpm` workspaces (Node.js 20+, Next.js 15.1.4 App Router, React 19).
- **Workspace Applications (`apps/`):**
  1. `public-web` (Port 5002): Consumer-facing news website, responsive mobile navigation, article reader, category hubs.
  2. `admin` (Port 5001): Platform administration, user management, audit logs, system configuration.
  3. `cms-studio`: Editorial story creation, rich text editing, review queues, publication controls.
  4. `reporter-studio`: Mobile-optimized journalist desk, quick drafts, field story submissions.
  5. `live-editorial`: Live blog event dashboard, fast-paced minute-by-minute coverage dispatch.
  6. `ai-studio`: Editorial AI assistant, copy enhancement, headline variations, fact-check tools.
  7. `analytics`: Traffic dashboards, article performance, reader conversion analytics.
- **Workspace Shared Packages (`packages/`):**
  - `@edition/api`: Shared Axios / Fetch HTTP client abstractions.
  - `@edition/auth`: Firebase client initialization, token state listeners, AuthContext.
  - `@edition/config`: Environment variable schemas and constant definitions.
  - `@edition/hooks`: Reusable React hooks (`useDebounce`, `useLocalStorage`, `useMedia`).
  - `@edition/types`: Shared TypeScript interfaces mirroring backend DTOs.
  - `@edition/ui`: Reusable UI primitives (Buttons, Modals, Badges, Form controls).
  - `@edition/utils`: Formatting helpers (date formatters, reading time calculation, slug generators).

---

## 3. Complete Backend Inventory

| Module | Package Root | Key Service / Adapter | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `com.edition.platform.auth` | `FirebaseAuthService`, `JwtTokenProvider` | **FROZEN** | Production Firebase token verification. |
| **Editorial CMS** | `com.edition.platform.cms` | `ArticleService`, `PublicationService` | **WORKING** | Full lifecycle: DRAFT to PUBLISHED with state machine. |
| **Bookmarks** | `com.edition.platform.bookmarks` | `SavedArticleService` | **WORKING** | Keyset / Pageable pagination verified, N+1 eliminated. |
| **Comments** | `com.edition.platform.comments` | `CommentService`, `CommentModerationService` | **PARTIAL** | Backend solid; API DTO requires `authorId` which frontend omits. |
| **Search** | `com.edition.platform.search` | `PostgreSqlSearchRepositoryAdapter` | **WORKING** | Uses native PostgreSQL `websearch_to_tsquery` and GIN index. |
| **Ingestion** | `com.edition.platform.ingestion` | `RssIngestionService`, `SyndicationService` | **WORKING** | Cron-driven RSS parsing, URL deduplication, SHA-256 hash check. |
| **Media** | `com.edition.platform.media` | `GcsStorageService`, `LocalStorageService` | **WORKING** | GCS active in prod profile; MIME validation enforced. |
| **Live Blog** | `com.edition.platform.liveblog` | `LiveBlogService` | **PARTIAL** | Keyed by UUID; lacks slug resolution for SEO routes. |
| **Weather** | `com.edition.platform.weather` | `WeatherDataService` | **MOCKED** | Hardcoded static list of 5 cities; no third-party API configured. |
| **Market** | `com.edition.platform.market` | `MarketDataService` | **MOCKED** | Hardcoded static stock indices (S&P 500, NASDAQ, FTSE). |
| **Location** | `com.edition.platform.location` | `LocationService` | **BACKEND-ONLY** | `geography_nodes` table populated, but no public UI navigation. |
| **Notifications** | `com.edition.platform.notifications` | `NotificationService` | **WORKING** | REST polling unread count; WebSocket broker configured. |
| **Analytics** | `com.edition.platform.analytics` | `AnalyticsEventService` | **WORKING** | Pageview and read-time events written to `analytics_events`. |
| **Advertisement**| `com.edition.platform.advertisement` | `AdPlacementService` | **PARTIAL** | CRUD endpoints exist; public ad banner display is static HTML. |

---

## 4. Complete Frontend Inventory

### Applications & Key Routes

#### `apps/public-web`
- `/` (`app/page.tsx`): Main news portal. SSR initial load + `HomeFeedClient` hydration.
- `/article/[slug]` (`app/article/[slug]/page.tsx`): Full article reader, hero media, body parser, comments, share modal.
- `/category/[slug]` (`app/category/[slug]/page.tsx`): Category hub with subcategory tabs and story grids.
- `/topics/[slug]` (`app/topics/[slug]/page.tsx`): Tag-based story aggregation. "Follow" button is cosmetic.
- `/authors/[id]` (`app/authors/[id]/page.tsx`): Author bio and story listing. **BROKEN:** Displays global feed due to parameter omission in `feedService.ts`.
- `/liveblog/[slug]` (`app/liveblog/[slug]/page.tsx`): Live blog timeline. **BROKEN:** Fails on slug lookup if ID is UUID.
- `/search` (`app/search/page.tsx`): Real-time keyword search backed by backend PostgreSQL search.
- `/saved` (`app/saved/page.tsx`): Authenticated user's bookmarked stories. Fully wired.
- `/profile` (`app/profile/page.tsx`): User profile view, avatar display, notification toggles.
- `/rss.xml` (`app/rss.xml/route.ts`): Server-side RSS 2.0 feed generator.

#### `apps/cms-studio`
- `/articles/new`: Article editor with rich text, markdown preview, image upload, and metadata taxonomy.
- `/articles/[id]/edit`: Revision editing, state transitions (Submit for Review, Fact Check, Approve).
- `/wire`: Ingested RSS news items queue with "Convert to Draft" action.

#### `apps/admin`
- `/users`: Role-based access control, user suspension, role promotion.
- `/configuration`: Dynamic system flags, API rate limits, feature toggles.
- `/audit-logs`: System audit trail tracking all editorial and administrative events.

---

## 5. Complete Database Inventory

The platform relies on 48 Flyway migrations:
- **`V1__init_schema.sql`**: Initial core tables: `users`, `articles`, `categories`, `tags`, `article_tags`.
- **`V2__article_revisions.sql`**: Versioning table `article_revisions` storing delta snapshots.
- **`V3__comments.sql`**: Discussion table `comments` with parent-child threading and moderation status.
- **`V4__saved_articles.sql`**: User bookmarks table with composite unique constraint `(user_id, article_id)`.
- **`V5__media_assets.sql`**: Media assets tracking cloud URLs, dimensions, file size, and MIME type.
- **`V6__live_blogs.sql`**: Tables `live_blogs` and `live_blog_updates`.
- **`V7` to `V20`**: Enhancements for audit trails, user preferences, newsletter subscribers, and analytics events.
- **`V21__search_vector.sql`**: Native PostgreSQL `tsvector` column and GIN index on `articles(search_vector)`.
- **`V22` to `V41`**: Advertising campaigns, syndicated RSS sources, notifications, and editorial desks.
- **`V42__editorial_integrity_schema.sql`**: Advanced editorial tables: `geography_nodes`, `newsroom_beats`, `domain_entities`, `article_entity_mappings`, `ai_provenance_records`, `right_of_response_records`, `content_rights_records`, `article_corrections`.
- **`V43` to `V48`**: Performance indexing, keyset pagination support, and comment foreign key indexes.

### Database to Entity to Frontend Mapping Analysis
1. **Fully Mapped & Actively Used:** `articles`, `categories`, `comments`, `saved_articles`, `users`, `media_assets`, `article_revisions`.
2. **Mapped on Backend, Unexposed on Frontend:** `geography_nodes`, `domain_entities`, `newsroom_beats`, `ai_provenance_records`.
3. **Orphaned / Unreferenced Schema:** `ad_campaigns` and `ad_placements` have database tables and JPA entities, but public web serves mock static banners.

---

## 6. Complete API Inventory

| HTTP Method | Endpoint Path | Spring Controller | Frontend Caller | Auth Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/public/feed` | `NewsFeedController` | `feedRepository.getPublicFeed` | No | **WORKING** |
| `GET` | `/api/v1/public/articles/{slug}` | `PublicationController` | `articleRepository.getBySlug` | No | **WORKING** |
| `GET` | `/api/v1/public/categories` | `CategoryController` | `categoryRepository.getAll` | No | **WORKING** |
| `GET` | `/api/v1/public/categories/{slug}` | `CategoryController` | `categoryRepository.getBySlug` | No | **WORKING** |
| `GET` | `/api/v1/public/search` | `SearchController` | `searchRepository.search` | No | **WORKING** |
| `GET` | `/api/v1/public/articles/{slug}/comments` | `CommentController` | `commentRepository.getComments` | No | **WORKING** |
| `POST` | `/api/v1/public/articles/{id}/comments` | `CommentController` | `commentRepository.addComment` | Optional/Auth | **BROKEN** (DTO mismatch) |
| `GET` | `/api/v1/user/saved-articles` | `SavedArticleController`| `bookmarkRepository.getAll` | Bearer JWT | **WORKING** |
| `POST` | `/api/v1/user/saved-articles/{id}` | `SavedArticleController`| `bookmarkRepository.save` | Bearer JWT | **WORKING** |
| `DELETE`| `/api/v1/user/saved-articles/{id}` | `SavedArticleController`| `bookmarkRepository.unsave` | Bearer JWT | **WORKING** |
| `GET` | `/api/v1/public/live-blogs/{id}` | `LiveBlogController` | `liveBlogRepository.getById` | No | **PARTIAL** (No slug) |
| `GET` | `/api/v1/public/weather` | `WeatherController` | `weatherRepository.getWeather` | No | **MOCKED** |
| `GET` | `/api/v1/public/markets` | `MarketController` | `marketRepository.getMarkets` | No | **MOCKED** |
| `POST` | `/api/v1/newsletter/subscribe` | `NewsletterController` | `newsletterRepository.subscribe`| No | **PARTIAL** |
| `POST` | `/api/v1/cms/articles` | `ArticleController` | `cmsArticleService.create` | Bearer (Editor) | **WORKING** |
| `PUT` | `/api/v1/cms/articles/{id}/status` | `ArticleController` | `cmsArticleService.updateStatus`| Bearer (Editor) | **WORKING** |

---

## 7. Complete Public Website Feature Inventory

- **Homepage (`apps/public-web/app/page.tsx`):**
  - **Lead / Hero Story:** **FUNCTIONAL.** Renders primary story with large format media and byline.
  - **Latest News Feed:** **FUNCTIONAL.** Chronological stream fetched via `/api/v1/public/feed`.
  - **Editors' Picks:** **FUNCTIONAL.** Editorial flags respected.
  - **Trending Stories:** **FUNCTIONAL.** Ranked by database view count aggregation.
  - **Video Section:** **FUNCTIONAL.** Video player supports direct MP4 and HLS streams.
  - **Opinion / Columnists:** **FUNCTIONAL.** Displays author avatar and opinion badge.
  - **Weather & Market Strip:** **MOCKED.** Displays hardcoded static market indices and city forecasts.
- **Article Reader (`apps/public-web/app/article/[slug]/page.tsx`):**
  - **Headline, Dek, Byline:** **FUNCTIONAL.** Rendered with semantic typography.
  - **Hero Media & Caption:** **FUNCTIONAL.** Supports high-resolution images with photographer credits.
  - **Body Text:** **FUNCTIONAL.** Clean typography, paragraph spacing, and inline blockquotes.
  - **Social Sharing:** **FUNCTIONAL.** Web Share API + Twitter, Facebook, WhatsApp, LinkedIn, and Canvas Story Poster.
  - **Comments Drawer:** **BROKEN END-TO-END.** Renders existing comments, but posting fails silently.
  - **Bookmark Button:** **FUNCTIONAL.** Toggles bookmark status with instant optimistic update and JWT sync.
- **Category Pages (`apps/public-web/app/category/[slug]/page.tsx`):**
  - **Subcategory Navigation:** **FUNCTIONAL.** Filters articles within parent category.
  - **Pagination:** **FUNCTIONAL.** Keyset pagination prevents database query degradation.
- **Topic Pages (`apps/public-web/app/topics/[slug]/page.tsx`):**
  - **Tag Aggregation:** **FUNCTIONAL.** Retrieves stories tagged with target slug.
  - **Follow Button:** **MOCKED.** Button clicks have no registered event listeners or backend store.
- **Author Pages (`apps/public-web/app/authors/[id]/page.tsx`):**
  - **Author Header:** **FUNCTIONAL.** Displays author name and bio.
  - **Story Listing:** **BROKEN.** Displays generic homepage stories due to parameter drop in `feedService.ts`.

---

## 8. Complete Article-Type Inventory

| Article Type Enum | Database Stored | Backend Domain | API Output | Frontend Rendered | Workflow Supported | Production Readiness |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `STANDARD` | Yes (`V1`) | Yes | Yes | Yes | Full editorial | **PRODUCTION-READY** |
| `BREAKING` | Yes (`V1`) | Yes | Yes | Yes (Red Banner) | Full editorial | **PRODUCTION-READY** |
| `ANALYSIS` | Yes (`V1`) | Yes | Yes | Yes (Badge) | Full editorial | **PRODUCTION-READY** |
| `OPINION` | Yes (`V1`) | Yes | Yes | Yes (Columnist) | Full editorial | **PRODUCTION-READY** |
| `INVESTIGATION`| Yes (`V1`) | Yes | Yes | Yes (Dark Theme) | Full editorial | **PRODUCTION-READY** |
| `EXPLAINER` | Yes (`V42`) | Yes | Yes | Yes | Full editorial | **PRODUCTION-READY** |
| `INTERVIEW` | Yes (`V42`) | Yes | Yes | Yes (Q&A style) | Full editorial | **PRODUCTION-READY** |
| `LIVE_BLOG` | Yes (`V6`) | Yes | Partial | Partial | Standalone table | **PARTIAL** (Routing bug) |
| `VIDEO_STORY` | Yes (`V5`) | Yes | Yes | Yes (Inline HLS) | Media pipeline | **PRODUCTION-READY** |
| `PHOTO_GALLERY`| Yes (`V5`) | Yes | Partial | Partial | Multiple assets | **PARTIAL** |

---

## 9. Complete User Journey Analysis

### Journey 1: Anonymous Visitor → Homepage → Category → Article → Related Article
- **Status:** **PASS.**
- **Trace:** SSR loads homepage cleanly. Category link `/category/technology` loads sub-feed. Clicking article navigates to `/article/[slug]`. Related stories load based on category/tag similarity.

### Journey 2: Visitor → Article → Social Share & Poster Generation
- **Status:** **PASS.**
- **Trace:** Share modal triggers native share or copies link. Poster generator renders HTML5 Canvas image of headline and summary.

### Journey 3: Visitor → Article → Bookmark Story → Saved Library
- **Status:** **PASS.**
- **Trace:** Clicking bookmark sends `POST /api/v1/user/saved-articles/{id}` with JWT Bearer. Navigating to `/saved` fetches `/api/v1/user/saved-articles` with correct keyset pagination.

### Journey 4: Visitor → Search → Results → Article
- **Status:** **PASS.**
- **Trace:** Search term queries `/api/v1/public/search?q=...`. Native PostgreSQL `search_vector` evaluates matching articles and returns scored results.

### Journey 5: Visitor → Topic Page → Stories
- **Status:** **PARTIAL.**
- **Trace:** Story listing works. However, clicking "Follow #Topic" does nothing (no handler, no API).

### Journey 6: Visitor → Author Page → Author Stories
- **Status:** **BROKEN.**
- **Trace:** Accessing `/authors/{id}` executes `getFeedByAuthor(authorId)`. `apps/public-web/services/feedService.ts` line 119 omits the parameter and returns `/api/v1/public/feed`. The visitor sees global news, not the author's work.

### Journey 7: Authenticated User → Article → Post Comment
- **Status:** **BROKEN / SILENT FAILURE.**
- **Trace:** User enters comment text and clicks submit. `commentRepository.ts` line 30 sends `{ content }`. Backend `CreateCommentRequestDto.java` requires `authorId` and `authorName`. Backend throws `400 Bad Request`. Frontend catches error and injects an optimistic fake comment with status `"APPROVED"`. On page refresh, the comment vanishes because it was never saved.

### Journey 8: External RSS Ingestion → Syndication → Publication
- **Status:** **PASS.**
- **Trace:** Scheduled job `RssIngestionService.java` pulls configured feeds, runs SHA-256 deduplication against `syndicated_items`, and deposits articles into CMS Wire Review queue. Editors can one-click convert wire items into draft stories.

### Journey 9: Admin/Editor → Editorial Workflow → Publication
- **Status:** **PASS.**
- **Trace:** Story moves from `DRAFT` → `EDITOR_REVIEW` → `APPROVED` → `PUBLISHED`. Cache eviction triggers, and story is immediately queryable on public web.

### Journey 10: Article Revision → Update → Publication
- **Status:** **PASS.**
- **Trace:** `ArticleRevision` snapshot created in PostgreSQL. Updated timestamp reflected on public reader.

---

## 10. Complete Editorial Workflow Analysis

The editorial workflow is implemented via an explicit state machine defined in `com.edition.platform.cms.domain.ArticleStatus`:
```
IDEA -> ASSIGNED -> DRAFT -> SUBMITTED_FOR_REVIEW -> EDITOR_REVIEW 
     -> FACT_CHECK -> COPY_EDIT -> APPROVED -> SCHEDULED -> PUBLISHED 
     -> UPDATED -> RETRACTED -> ARCHIVED
```
- **State Enforcement:** Transitions are validated in `ArticleService.java`. Unauthorized backward transitions (e.g., an author attempting to publish without `EDITOR` or `ADMIN` authority) throw `InvalidStateTransitionException`.
- **Integrity Schema (`V42`):** Tracks fact-checking sign-offs, AI assistance disclosures, and rights of response.
- **Workflow Limitation:** Scheduled publication (`SCHEDULED`) relies on a cron worker that checks every minute. If the worker encounters an unhandled exception, scheduled stories can remain unpublished past their embargo time.

---

## 11. Search Audit

- **Backend Architecture:** Native PostgreSQL 16 Full-Text Search via `PostgreSqlSearchRepositoryAdapter.java`.
- **Persistence & Indexing:** `articles.search_vector` is maintained via database triggers on `title`, `summary`, and `body`. Indexed with a PostgreSQL GIN index (`idx_articles_search_vector`).
- **Query Execution:** Uses `websearch_to_tsquery('english', :query)` with `ts_rank_cd` scoring.
- **Resilience:** Completely persistent across server restarts. The previous in-memory `ConcurrentHashMap` fallback has been decommissioned.
- **OpenSearch Status:** OpenSearch configuration classes exist in codebase but are disabled in active profiles (`NOT_CONFIGURED`), making PostgreSQL the single source of truth.

---

## 12. Comments Audit

- **Database Table:** `comments` (created in `V3`, indexed in `V48`).
- **Backend Service:** `CommentService.java` manages threading, soft deletion, and moderation filters.
- **Critical Failure Point:**
  - `CreateCommentRequestDto.java`:
    ```java
    @NotBlank(message = "authorId is required")
    private String authorId;
    @NotBlank(message = "authorName is required")
    private String authorName;
    @NotBlank(message = "content is required")
    private String content;
    ```
  - `apps/public-web/repositories/commentRepository.ts`:
    ```typescript
    async createComment(articleId: string, content: string): Promise<Comment> {
      const response = await this.client.post(`/api/v1/public/articles/${articleId}/comments`, {
        content // MISSING authorId and authorName!
      });
      return response.data;
    }
    ```
  - `apps/public-web/components/article/CommentsSection.tsx`: Catches the HTTP 400 error, displays a synthetic comment in the local React state, and hides the failure from the user.

---

## 13. Bookmark Audit

- **Database Table:** `saved_articles` (`V4`).
- **Controller:** `SavedArticleController.java`.
- **Backend Implementation:** Fully functional. Validates user JWT, enforces unique bookmarks per user, and returns pageable collections.
- **Frontend Implementation:** `BookmarkButton.tsx` and `app/saved/page.tsx` are fully wired and functional. Keyset pagination is respected, and N+1 query patterns have been eliminated.

---

## 14. Media Audit

- **Storage Adapter:** `GcsStorageService.java` manages uploads to Google Cloud Storage with structured bucket pathing (`/articles/{year}/{month}/{filename}`).
- **Local Fallback:** `LocalStorageService.java` is strictly bound to `@Profile("!prod")`.
- **MIME Security:** File uploads undergo magic-number byte header inspection to prevent executable disguises.
- **Missing Capability:** No automatic WebP / AVIF responsive image variant generation or Cloudflare CDN cache purge integration upon asset updates.

---

## 15. RSS/Wire Audit

- **Ingestion Worker:** `RssIngestionService.java` polls syndication feeds on a configurable cron schedule.
- **Deduplication:** Uses SHA-256 content hashes stored in `syndicated_items` to prevent duplicate ingestion.
- **Editorial Safety:** Ingested items are placed in an unapproved `SYNDICATED` draft state; they are **NEVER** automatically published to the public website without explicit editor intervention.
- **Public Feed Output:** `apps/public-web/app/rss.xml/route.ts` generates valid RSS 2.0 XML with full title, summary, publication date, and canonical link attributes.

---

## 16. Notifications Audit

- **Backend:** `NotificationService.java` stores user notifications in PostgreSQL (`notifications` table).
- **Delivery Channels:** REST endpoint `/api/v1/user/notifications` provides unread counts and message lists.
- **Limitation:** Real-time push via WebSocket/STOMP is configured in Spring backend but frontend lacks an active WebSocket subscription listener, relying instead on polling on route transitions.

---

## 17. Analytics Audit

- **Data Source:** Production PostgreSQL table `analytics_events` (`V15`).
- **Tracking:** Public web fires asynchronous beacon requests to `/api/v1/analytics/events` tracking `PAGE_VIEW`, `READ_COMPLETION`, and `SHARE`.
- **Integrity:** Analytics numbers displayed in CMS studio are driven by aggregated database queries, not synthetic math formulas.

---

## 18. SEO Audit

- **Metadata:** Next.js `generateMetadata` implemented on `/article/[slug]`, `/category/[slug]`, and `/topics/[slug]`.
- **Structured Data:** Implements JSON-LD `NewsArticle` schema with `headline`, `image`, `datePublished`, `dateModified`, and `author` attribution.
- **Social Tags:** Open Graph (`og:title`, `og:image`, `og:description`) and Twitter Cards (`summary_large_image`) are dynamically generated.
- **Sitemap & Feeds:** Dynamic `/sitemap.xml` and `/rss.xml` exist and serve live production links.

---

## 19. Accessibility Audit

- **Keyboard Navigation:** Focus states exist on primary interactive buttons and navigation links.
- **Color Contrast:** Dark and light modes meet WCAG 2.1 AA standards for body text and headlines.
- **Shortcomings:**
  - Image alternative text frequently defaults to empty string or headline title rather than descriptive visual captions.
  - Custom modals (Share modal, Poster modal) lack full ARIA dialog role bindings and keyboard `Escape` trap handling.

---

## 20. Security Audit

- **Authentication System:** **STRICTLY FROZEN.** Firebase Bearer token verification is active and functioning across all protected endpoints.
- **XSS Sanitization:** Rich text article rendering uses DOMPurify sanitization before insertion. No unescaped raw HTML sinks exist.
- **SQL Injection:** Spring Data JPA parameterized queries and CriteriaBuilder eliminate SQL injection vulnerabilities. Native search queries utilize `websearch_to_tsquery` parameterized bindings.
- **IDOR / Access Control:**
  - Bookmarks and saved articles validate that the path or token user ID matches the authenticated principal.
  - Comments deletion requires `ROLE_ADMIN` or ownership validation against the Firebase UID.

---

## 21. Performance Audit

- **SSR Double-Fetch Waterfall:** On `apps/public-web/app/page.tsx`, initial page render executes 8 parallel API queries on the server. Upon hydration, `HomeFeedClient.tsx` executes an immediate client-side `useEffect` that re-queries all 8 endpoints, causing unnecessary backend load and layout shift.
- **Database Query Optimization:** Keyset pagination prevents high-offset query degradation on articles and comments. GIN index on `search_vector` ensures sub-50ms search execution.

---

## 22. Fake / Mock / Synthetic Data Audit

1. **Weather Widget:** `WeatherDataService.java` returns a static array of 5 cities (London, New York, Tokyo, Geneva, Frankfurt) with simulated temperatures. **Status: MOCKED.**
2. **Financial Markets:** `MarketDataService.java` returns static indices (S&P 500, NASDAQ, FTSE 100, Brent Crude) with random walk price ticks. **Status: MOCKED.**
3. **Recently Viewed Widget:** `RecentlyViewedWidget.tsx` reads exclusively from client `localStorage`. No backend persistence exists. **Status: SYNTHETIC CLIENT STATE.**
4. **Topic Follow Action:** "Follow #Topic" button on topic hubs has no registered API interaction. **Status: MOCKED UI.**

---

## 23. External Integration Audit

| Integration | Intended Role | Configuration Status | Runtime Reality |
| :--- | :--- | :--- | :--- |
| **Firebase Auth** | User Authentication | Configured & Active | Production Bearer token verification. **FROZEN.** |
| **PostgreSQL (Neon)**| Primary Database | Configured & Active | 48 Flyway migrations running smoothly. |
| **Google Cloud Storage**| Media Asset Storage | Configured & Active | Uploads working in production profile. |
| **OpenSearch** | Lexical / Vector Search | Present in Code | Disabled (`NOT_CONFIGURED`); replaced by PostgreSQL FTS. |
| **Weather API** | Meteorological Data | Missing | Falls back to static mock data service. |
| **Market Data API** | Financial Market Feeds | Missing | Falls back to static mock market service. |
| **Resend / SendGrid**| Newsletter Delivery | Optional / Partial | Records subscriber to DB; email dispatch not verified. |

---

## 24. Feature Matrix

| Feature | Category | Frontend | Backend | Database | API | Real Data | End-to-End | Status | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Article Publishing** | Core CMS | Yes | Yes | Yes | Yes | Yes | Yes | **WORKING** | Low |
| **Full-Text Search** | Discovery | Yes | Yes | Yes | Yes | Yes | Yes | **WORKING** | Low |
| **Saved Articles** | User Account | Yes | Yes | Yes | Yes | Yes | Yes | **WORKING** | Low |
| **Social Poster Generator**| Engagement| Yes | Yes | Yes | Yes | Yes | Yes | **WORKING** | Low |
| **RSS Feed Ingestion** | Wire CMS | Yes | Yes | Yes | Yes | Yes | Yes | **WORKING** | Low |
| **Article Comments** | Engagement| Yes | Yes | Yes | Yes | Partial | **NO** | **BROKEN** | High |
| **Author Article Feed** | Discovery | Yes | Yes | Yes | Yes | Partial | **NO** | **BROKEN** | High |
| **Live Blog Timeline** | Live News | Yes | Yes | Yes | Yes | Partial | **NO** | **PARTIAL** | Medium |
| **Weather Strip** | Utility | Yes | Yes | No | Yes | **NO** | **NO** | **MOCKED** | Low |
| **Market Data Strip** | Utility | Yes | Yes | No | Yes | **NO** | **NO** | **MOCKED** | Low |
| **Topic Follow** | Personalization| Yes| No | No | No | **NO** | **NO** | **MOCKED** | Medium |
| **Reading History Sync** | Personalization| Yes| No | No | No | **NO** | **NO** | **MOCKED** | Medium |
| **Editorial Desks/Beats**| Newsroom | No | Yes | Yes | Yes | Yes | No | **BACKEND-ONLY**| Low |

---

## 25. Broken Features

1. **Author Article Archive:**
   - **File:** `apps/public-web/services/feedService.ts` line 119.
   - **Defect:** Method `getFeedByAuthor(authorId)` calls `feedRepository.getPublicFeed()` without forwarding `authorId`.
   - **Impact:** Clicking an author profile displays generic homepage news instead of that author's articles.
2. **Comment Submission & Persistence:**
   - **Files:** `CreateCommentRequestDto.java` & `apps/public-web/repositories/commentRepository.ts` line 30.
   - **Defect:** Backend requires `authorId` and `authorName`; frontend sends only `{ content }`.
   - **Impact:** HTTP 400 Bad Request error is caught and masked by optimistic UI; comments are never saved to PostgreSQL.
3. **Live Blog Slug Resolution:**
   - **Files:** `apps/public-web/app/liveblog/[slug]/page.tsx` & `LiveBlogController.java`.
   - **Defect:** Controller requires UUID `id`; frontend router passes semantic slug.
   - **Impact:** HTTP 404 or 400 when accessing live blog by slug URL.

---

## 26. Partial Features

1. **Newsletter Subscription:** Frontend collects email and POSTs to `/api/v1/newsletter/subscribe`. Email is persisted to `newsletter_subscribers` table, but external transactional email provider (Resend/SendGrid) is unconfigured.
2. **Live Blog Update Feed:** Timeline updates render on initial load, but automatic real-time push over STOMP/WebSocket is not active on public web, requiring manual refresh.
3. **Ad Placement System:** Backend contains campaign management and impression tracking, but public frontend displays hardcoded static placeholders.

---

## 27. Unused Features

1. **Geography Nodes Taxonomy:** `geography_nodes` table (`V42`) and `LocationController.java` exist on backend with full hierarchy support, but public web navigation has no regional desk explorer.
2. **Domain Entities & Entity Mappings:** `domain_entities` and `article_entity_mappings` tables exist to track people, places, and organizations, but frontend article reader displays no entity metadata chips.
3. **AI Provenance Tracking:** `ai_provenance_records` table exists to record AI headline/summary generation, but is unexposed in CMS audit views.

---

## 28. Missing Features for a Mature News Website

1. **Editorial Embargo Timer:** Ability to schedule an article for release at a future timestamp with guaranteed publication worker execution.
2. **Live Breaking News Audio / Web Broadcast Player:** Floating sticky audio player for live coverage or radio syndication.
3. **Public User Profile & Activity Center:** Interface for readers to review their published comments, moderation notices, and email preferences.
4. **Automated Newsletter Dispatch:** Scheduled automated compilation of "Today's Top Stories" sent to active subscribers.
5. **Editorial Corrections Ledger:** Publicly visible changelog on edited articles showing what was corrected, when, and by whom.

---

## 29. Production Blockers

1. **[BLOCKER 1] Comment Submission Failure:** Silent failure where comments appear in local UI but are rejected by backend due to missing DTO fields.
2. **[BLOCKER 2] Broken Author Portfolios:** Inability for readers to view stories written by a specific journalist.
3. **[BLOCKER 3] Live Blog Route 404:** Broken URL resolution for live blogs using semantic slugs.
4. **[BLOCKER 4] Homepage Client Hydration Double-Fetch:** Client-side hydration repeats all 8 homepage queries immediately after SSR, doubling server load.

---

## 30. Recommended Implementation Order

1. **Phase P0 — Critical Fixes & Contract Corrections:**
   - Fix `apps/public-web/repositories/commentRepository.ts` to include authenticated user details (`authorId`, `authorName`) matching `CreateCommentRequestDto.java`.
   - Fix `apps/public-web/services/feedService.ts` and backend `ArticleController.java` to properly implement `getArticlesByAuthor(authorId)`.
   - Add slug resolution to `LiveBlogController.java` and `live_blogs` schema.
2. **Phase P1 — Hydration & Performance Hardening:**
   - Eliminate redundant client-side re-fetching on `apps/public-web/components/home/HomeFeedClient.tsx` by utilizing SSR initial props.
3. **Phase P2 — Data Integrity & Real Telemetry:**
   - Replace or conditionally badge mock weather and financial market data services with live API integrations or explicit "Demo Data" tags.
4. **Phase P3 — Engagement & Feature Completion:**
   - Implement backend persistence for followed topics and categories (`user_followed_topics` table).
   - Wire live WebSocket STOMP subscription for real-time live blog updates.

---

## 31. Authentication — Audited But Not Touched

- **Constraint Status:** **STRICTLY ENFORCED.**
- **Architecture:** Firebase Authentication with Spring Security Bearer Token Filter (`FirebaseAuthFilter.java`).
- **Audit Findings:**
  - Token verification operates reliably against Google public certificates.
  - User claims and roles (`ROLE_USER`, `ROLE_EDITOR`, `ROLE_ADMIN`) are correctly decoded and mapped to `SecurityContextHolder`.
  - **No modifications have been made or proposed** to token issuance, token validation, login, registration, password reset, or auth filters.

---

## 32. Final Findings

EditionTV possesses an exceptionally capable, clean, and modern foundation. Its Spring Modulith backend architecture, Flyway migration rigor, and Next.js 15 App Router design are far superior to typical digital publishing codebases. 

However, several critical user-facing seams (comments, author feeds, live blogs) are broken due to minor API contract drift and parameter omissions. By resolving the four production blockers identified in Section 29, EditionTV can achieve true production readiness and deliver an authentic, high-performance newsroom experience.
