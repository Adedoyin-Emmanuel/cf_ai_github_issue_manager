# AI Worker

A Cloudflare Worker that processes GitHub repository issues using OpenAI's GPT-4o-mini model to provide intelligent categorization, prioritization, and duplicate detection.

## Features

- **OpenAI Integration**: Uses GPT-4o-mini for intelligent issue analysis
- **Issue Categorization**: Automatically classifies issues as Bug, Feature, Enhancement, Chore, or Documentation
- **Priority Assignment**: Assigns Critical, High, Medium, or Low priority based on impact analysis
- **Duplicate Detection**: Identifies similar issues using heuristic and LLM-based approaches
- **Implementation Ordering**: Suggests optimal sequence for issue resolution
- **Batch Processing**: Efficiently processes multiple issues with concurrency limits
- **Error Handling**: Robust error handling with timeout protection

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set your OpenAI API key:

```bash
wrangler secret put OPENAI_API_KEY
```

3. Deploy the worker:

```bash
npm run deploy
```

## Development

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## API

The worker accepts POST requests with GitHub repository and issue data, processes them through OpenAI, and returns categorized and prioritized results.

## Architecture

- **Heuristic Classification**: Fast initial categorization based on issue titles and labels
- **LLM Enhancement**: GPT-4o-mini refines classifications for ambiguous cases
- **Hybrid Approach**: Combines speed of heuristics with accuracy of LLM analysis
- **Caching**: Results are cached by the API worker for performance
