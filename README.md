# Edition TV — Frontend Monorepo

Enterprise-grade monorepo for Edition TV digital news platform, structured using npm workspaces (compatible with pnpm workspaces and Turborepo).

## Architecture

```
frontend/
├── apps/
│   ├── public-web/          # Reader-facing website
│   ├── cms-studio/          # Editorial & CMS dashboard
│   ├── reporter-studio/     # Journalist workspace
│   ├── live-editorial/      # Breaking news & live stream control
│   ├── ai-studio/           # AI workbench & moderation
│   ├── analytics/           # Executive audience analytics
│   └── admin/               # Platform RBAC admin console
├── packages/
│   ├── ui/                  # @edition/ui — Shared UI components
│   ├── api/                 # @edition/api — API client & services
│   ├── auth/                # @edition/auth — JWT auth helpers
│   ├── config/              # @edition/config — Design tokens & config
│   ├── types/               # @edition/types — TypeScript DTOs
│   ├── utils/               # @edition/utils — Utility functions
│   └── hooks/               # @edition/hooks — Custom React hooks
├── package.json             # Root workspace config (npm)
├── pnpm-workspace.yaml      # Root workspace config (pnpm)
├── turbo.json               # Turborepo pipeline config
└── README.md
```

## Commands

| Command | Description | URL |
|---|---|---|
| `npm run dev:public-web` | Start public website dev server | http://localhost:5000 |
| `npm run dev:cms` | Start CMS studio dev server | http://localhost:5001 |
| `npm run dev:reporter` | Start reporter studio dev server | http://localhost:5002 |
| `npm run dev:live` | Start live editorial dev server | http://localhost:5003 |
| `npm run dev:ai` | Start AI studio dev server | http://localhost:5004 |
| `npm run dev:analytics` | Start analytics dev server | http://localhost:5005 |
| `npm run dev:admin` | Start admin console dev server | http://localhost:5006 |
| `npm run build:all` | Build all 7 applications | — |
| `npm run lint:all` | Lint all 7 applications | — |

## Shared Package Imports

```ts
import { Button, Card, Navbar } from "@edition/ui";
import { feedService, articleService } from "@edition/api";
import { authService } from "@edition/auth";
import { cn } from "@edition/utils";
import { useLocalStorage } from "@edition/hooks";
import type { ArticleFeedItem } from "@edition/types";
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Backend**: Spring Boot 3 @ `http://localhost:8080/api/v1`
