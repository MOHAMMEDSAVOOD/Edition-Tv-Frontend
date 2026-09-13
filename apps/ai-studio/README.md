# @edition/ai-studio

AI workbench & moderation for Edition TV.

## Development

```bash
# Start the development server (runs on http://localhost:5004)
npm run dev
# or from root:
npm run dev:ai
```

## Deployment

This application is configured for deployment to Cloudflare via OpenNext.

```bash
# Build for Cloudflare
pnpm exec opennextjs-cloudflare build
# or from root:
pnpm --filter @edition/ai-studio build:cf

# Deploy to Cloudflare
pnpm exec opennextjs-cloudflare deploy
# or from root:
pnpm --filter @edition/ai-studio deploy:cf
```
