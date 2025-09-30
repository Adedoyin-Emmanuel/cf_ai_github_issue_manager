# AI Repository Analysis Worker

A Cloudflare Worker that analyzes GitHub repositories and their issues using GPT-4 to provide insights about project health, trends, and recommendations.

## Features

- **GPT-4 Integration**: Uses OpenAI's GPT-4 model for intelligent repository analysis
- **Comprehensive Analysis**: Analyzes repository metadata, recent issues, and PRs
- **TypeScript Support**: Fully typed with proper error handling
- **CORS Enabled**: Supports cross-origin requests
- **RESTful API**: Clean POST endpoint for analysis requests

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

You need to set your OpenAI API key as a secret in Cloudflare Workers:

```bash
# Set the OpenAI API key as a secret
wrangler secret put OPENAI_API_KEY
```

When prompted, enter your OpenAI API key.

### 3. Deploy the Worker

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

### 4. Development

```bash
# Start local development server
npm run dev
```

## API Usage

### Endpoint

```
POST https://your-worker.your-subdomain.workers.dev/
```

### Request Format

```json
{
	"repository": {
		"name": "mastra",
		"owner": "mastra-ai",
		"description": "The TypeScript AI agent framework",
		"stars": 16953,
		"forks": 1129,
		"openIssues": 325,
		"url": "https://github.com/mastra-ai/mastra"
	},
	"issues": [
		{
			"issue_number": 8087,
			"title": "chore(deps): update dependency @storybook/react-vite to ^9.1.8",
			"state": "open",
			"labels": [],
			"author": "dane-ai-mastra[bot]",
			"created_at": "2025-09-22T18:20:03Z",
			"updated_at": "2025-09-30T00:36:37Z",
			"body": "This PR contains the following updates...",
			"url": "https://github.com/mastra-ai/mastra/pull/8087"
		}
	]
}
```

### Response Format

#### Success Response

```json
{
	"success": true,
	"analysis": "Based on the analysis of the mastra repository...",
	"timestamp": "2025-09-30T05:30:00.000Z"
}
```

#### Error Response

```json
{
	"success": false,
	"error": "Error message describing what went wrong",
	"timestamp": "2025-09-30T05:30:00.000Z"
}
```

## Analysis Features

The worker provides comprehensive analysis covering:

1. **Repository Health**: Overall project status and activity trends
2. **Issue Patterns**: Common themes and recurring problems
3. **Community Engagement**: Activity levels and contributor patterns
4. **Technical Insights**: Code quality indicators and maintenance needs
5. **Recommendations**: Actionable suggestions for maintainers

## Error Handling

The worker includes robust error handling for:

- Invalid request methods (only POST allowed)
- Malformed JSON payloads
- Missing required fields
- OpenAI API failures
- Network timeouts

## Testing

Run the test suite:

```bash
npm test
```

The tests include:

- CORS handling
- Request validation
- Error scenarios
- Mock GPT-4 responses

## Architecture

- **TypeScript**: Full type safety with interfaces for all data structures
- **OpenAI Integration**: Uses the official OpenAI SDK for GPT-4 access
- **Cloudflare Workers**: Serverless deployment with global edge distribution
- **Error Handling**: Comprehensive error catching and user-friendly responses
- **CORS Support**: Cross-origin request handling for web applications

## Environment Variables

| Variable         | Description                          | Required |
| ---------------- | ------------------------------------ | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4 access | Yes      |

## Dependencies

- `openai`: Official OpenAI SDK for API integration
- `agents`: Agent framework (installed but not used in current implementation)
- `@cloudflare/workers-types`: TypeScript definitions for Cloudflare Workers
- `vitest`: Testing framework
- `wrangler`: Cloudflare Workers CLI
