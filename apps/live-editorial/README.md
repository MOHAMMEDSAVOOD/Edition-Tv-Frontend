# @edition/live-editorial

Breaking news & live stream control for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5003)
npm run dev
# or from root:
npm run dev:live
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/live-editorial build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/live-editorial deploy:cf
```
