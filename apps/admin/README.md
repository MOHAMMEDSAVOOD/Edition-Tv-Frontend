# @edition/admin

Platform RBAC admin console for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5006)
npm run dev
# or from root:
npm run dev:admin
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/admin build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/admin deploy:cf
```
