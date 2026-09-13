# @edition/public-web

Reader-facing website for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5000)
npm run dev
# or from root:
npm run dev:public-web
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/public-web build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/public-web deploy:cf
```
