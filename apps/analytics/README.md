# @edition/analytics

Executive audience analytics for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5005)
npm run dev
# or from root:
npm run dev:analytics
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/analytics build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/analytics deploy:cf
```
