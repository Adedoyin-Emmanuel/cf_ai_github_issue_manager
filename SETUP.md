# Setup Guide

## Environment Configuration

### Web Frontend (.env.local)

Create a `.env.local` file in the `web/` directory with:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8787/v1

# For production, replace with your deployed API worker URL
# NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1
```

### API Worker (wrangler.jsonc)

Update the `AI_WORKER_URL` in `api/wrangler.jsonc`:

```json
"vars": {
  "AI_WORKER_URL": "https://ai.your-domain.com"
}
```

## Deployment Order

1. **Deploy AI Worker first** (`ai/` directory)
2. **Deploy API Worker** (`api/` directory) with the AI worker URL
3. **Deploy Web Frontend** (`web/` directory) with the API worker URL

## Development

### Start all services locally:

```bash
# Terminal 1 - AI Worker
cd ai
npm run dev

# Terminal 2 - API Worker
cd api
npm run dev

# Terminal 3 - Web Frontend
cd web
npm run dev
```

## Flow

1. **Web Frontend** → calls API Worker via axios + TanStack React Query
2. **API Worker** → fetches GitHub data, then calls AI Worker
3. **AI Worker** → processes issues with AI analysis
4. **API Worker** → returns combined response to Web Frontend
5. **Web Frontend** → displays results with loading states and skeletons
