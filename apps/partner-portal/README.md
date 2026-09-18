# @edition/cms-studio

Editorial & CMS dashboard for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5001)
npm run dev
# or from root:
npm run dev:cms
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/cms-studio build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/cms-studio deploy:cf
```
