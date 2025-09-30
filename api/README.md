# Cloudflare Workers OpenAPI 3.1

This is a Cloudflare Worker with OpenAPI 3.1 using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono).

This is an example project made to be used as a quick start into building OpenAPI compliant Workers that generates the
`openapi.json` schema automatically from code and validates the incoming request to the defined parameters or request body.

## Get started

1. Sign up for [Cloudflare Workers](https://workers.dev). The free tier is more than enough for most use cases.
2. Clone this project and install dependencies with `npm install`
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. **Set up KV namespace for caching:**

   ```bash
   # Create KV namespace
   wrangler kv:namespace create "REPO_CACHE"
   wrangler kv:namespace create "REPO_CACHE" --preview

   # Update wrangler.jsonc with the returned namespace IDs
   ```

5. Run `wrangler deploy` to publish the API to Cloudflare Workers

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. For more information read the [chanfana documentation](https://chanfana.pages.dev/) and [Hono documentation](https://hono.dev/docs).

## Development

1. Run `wrangler dev` to start a local instance of the API.
2. Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.

## Caching

The API now includes intelligent caching for repository analysis results:

- **Cache Duration**: 24 hours (configurable)
- **Cache Key**: Based on repository owner and name (case-insensitive)
- **Automatic Expiry**: Cache entries automatically expire and are cleaned up
- **Cache Management**: Additional endpoints for cache invalidation and statistics

### Cache Endpoints

- `POST /v1/cache/invalidate` - Manually invalidate cache for a repository
- `POST /v1/cache/stats` - Get cache statistics for a repository

### Cache Benefits

- **Performance**: Subsequent requests for the same repository return instantly
- **Cost Reduction**: Reduces AI worker calls and GitHub API requests
- **Rate Limit Protection**: Helps avoid GitHub API rate limits
- **Reliability**: Provides fallback data even if external services are temporarily unavailable
