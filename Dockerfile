FROM node:22-alpine AS base
ENV CI=true
# Pinned to the pnpm that wrote pnpm-lock.yaml (lockfileVersion 9.0), which is
# also what developers run. pnpm@latest is now v12, which reads its settings
# from pnpm-workspace.yaml instead of .npmrc: it silently drops
# shamefully-hoist, and the workspace packages then fail to find @types/react.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dependencies using pnpm
FROM base AS deps
WORKDIR /app
# .npmrc carries shamefully-hoist=true, which is what puts @types/react in the
# root node_modules. The workspace packages (packages/auth, packages/ui) rely on
# finding it there -- they declare react only as a peer -- so leaving the file
# out builds a tree that type-checks locally and fails here with "Could not find
# a declaration file for module 'react'".
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/public-web/package.json ./apps/public-web/
COPY apps/cms-studio/package.json ./apps/cms-studio/
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/hooks/package.json ./packages/hooks/
RUN pnpm install --frozen-lockfile

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

# NEXT_PUBLIC_* values are inlined into the browser bundles by `next build`, so
# they must be supplied at image build time (--build-arg), not at runtime.
# Terraform exposes them from module.firebase_auth.web_config; see .env.example.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

RUN pnpm run build:cms
# public-web only emits .next/standalone when asked; its Cloudflare Worker build
# uses the same next.config.ts and must not (see apps/public-web/next.config.ts).
RUN BUILD_STANDALONE=true pnpm run build:public-web
RUN pnpm run build:admin

# CMS Studio Production Runner (port 5001)
FROM base AS cms-runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=5001

RUN addgroup -g 10003 -S cmsgroup && adduser -u 10003 -S cmsuser -G cmsgroup

COPY --from=builder /app/apps/cms-studio/public ./apps/cms-studio/public
COPY --from=builder --chown=cmsuser:cmsgroup /app/apps/cms-studio/.next/standalone ./
COPY --from=builder --chown=cmsuser:cmsgroup /app/apps/cms-studio/.next/static ./apps/cms-studio/.next/static

USER 10003:10003

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/ || exit 1

CMD ["node", "apps/cms-studio/server.js"]

# Admin Studio Production Runner (port 5006)
FROM base AS admin-runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=5006

RUN addgroup -g 10005 -S admingroup && adduser -u 10005 -S adminuser -G admingroup

COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=adminuser:admingroup /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=adminuser:admingroup /app/apps/admin/.next/static ./apps/admin/.next/static

USER 10005:10005

EXPOSE 5006

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5006/ || exit 1

CMD ["node", "apps/admin/server.js"]

# Public Web Production Runner (port 5000)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=5000

RUN addgroup -g 10004 -S webgroup && adduser -u 10004 -S webuser -G webgroup

COPY --from=builder /app/apps/public-web/public ./apps/public-web/public
COPY --from=builder --chown=webuser:webgroup /app/apps/public-web/.next/standalone ./
COPY --from=builder --chown=webuser:webgroup /app/apps/public-web/.next/static ./apps/public-web/.next/static

USER 10004:10004

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "apps/public-web/server.js"]

