# ARCHITECTURE GUIDELINES & SPECIFICATIONS

This repository follows rigorous architectural patterns to ensure scalability, modularity, and maintainability.

---

## 1. Architectural Philosophy

- **Modular Monolith First**: When building large backend systems, prioritize a clean modular monolith (e.g. Spring Modulith) with clear package boundaries before splitting into microservices.
- **Explicit Domain Boundaries**: Each domain module owns its entities, repositories, and domain events. Cross-module communication occurs via explicit interfaces or domain events, never through cross-boundary entity joins.
- **Event-Driven Asynchronous Processing**: High-latency tasks (transcoding, indexing, AI embeddings, notifications) execute asynchronously using transactional outboxes and message queues.
- **Stateless Services**: Application nodes are stateless; sessions and short-term caching reside in distributed caches (Redis).

---

## 2. Architecture Decision Records (ADRs)

All significant architectural decisions, design trade-offs, and technology additions must be documented as ADRs in `docs/adr/` or `ADR/`.
Format:
- `ADR-XXXX-title.md`
- Sections: Status, Context, Decision, Consequences, Compliance.

---

## 3. Database Architecture & Migrations

- **Version-Controlled Schema**: All relational database schema changes must be driven by versioned migrations (Flyway / Liquibase / Prisma).
- **Zero-Downtime Migrations**:
  - Add column as nullable or with default.
  - Deploy code utilizing both old and new columns.
  - Backfill data asynchronously.
  - Enforce `NOT NULL` constraint in a subsequent migration.
  - Never run destructive `DROP COLUMN` or `DROP TABLE` without prior deprecation and approval.

---

## 4. Frontend Deployment Architecture

- **Edge Deployment First**: Frontend applications (Next.js 15) are deployed to the Edge using Cloudflare (Workers/Pages).
- **OpenNext**: The repository leverages OpenNext (`@opennextjs/cloudflare`) to compile Next.js server-side rendering logic and API routes into Cloudflare-compatible workers.
- **Package Management**: While standard development uses npm workspaces, Cloudflare deployment and OpenNext build processes utilize `pnpm` (`pnpm-workspace.yaml`).

