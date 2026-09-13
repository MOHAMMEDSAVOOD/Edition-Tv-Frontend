# @edition/reporter-studio

Journalist workspace for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5002)
npm run dev
# or from root:
npm run dev:reporter
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/reporter-studio build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/reporter-studio deploy:cf
```
