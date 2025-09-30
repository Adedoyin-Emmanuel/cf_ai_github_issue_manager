# PROMPTS.md

## Frontend Setup with Zustand, shadcn/ui

Prompt used with AI (Cursor):

Build me a frontend with React, NextJs + Shadcnui components and TailwindCSS that looks very professional and minimal.

Requirements:

1. When the user visits the page, they should see:

   - A centered container with a **stylish input field** where they can paste a GitHub repo URL (e.g., <https://github.com/owner/repo>).
   - A clean "Analyze Issues" button.

2. When they submit, show a **demo visualization** of the AI’s analysis (no backend integration for now, just mock data):

   - A **summary card** at the top: “Total Issues: 25, Duplicates Found: 3, Critical Bugs: 4.”
   - Below that, a **grid/list of issues**. Each issue should be represented in a card with:
     - Issue number + title (bold).
     - Category (Bug, Feature, Enhancement).
     - Priority (Critical, High, Medium, Low) → show with color badges.
     - If duplicates exist → show linked issue numbers (chips or badges).
     - A small expandable section (accordion) for “AI reasoning” explaining why it’s categorized or prioritized.

3. The UI must feel **modern and visual**, not text-heavy:

   - Use color-coded tags/badges for priority.
   - Use icons for categories (🐞 bug, ✨ feature, ⚙️ enhancement).
   - Use soft shadows, rounded corners, hover effects.

4. Overall design guidelines:
   - Centered, max-width container.
   - Consistent padding, spacing, and typography.
   - Neutral background (slate/gray) with white cards.
   - Smooth transitions and hover states.
   - Responsive for mobile and desktop.

Mock Data Example (use this to populate the demo):

```json
[
  {
    "issue_number": 12,
    "title": "Fix login timeout error",
    "category": "Bug",
    "priority": "Critical",
    "duplicates": [18, 25],
    "reasoning": "Frequent user reports, impacts core login functionality."
  },
  {
    "issue_number": 22,
    "title": "Add dark mode toggle",
    "category": "Enhancement",
    "priority": "Low",
    "duplicates": [],
    "reasoning": "Nice to have, no immediate user complaints."
  },
  {
    "issue_number": 34,
    "title": "Profile page crashes on image upload",
    "category": "Bug",
    "priority": "High",
    "duplicates": [],
    "reasoning": "Affects usability but not a system-wide blocker."
  }
]
```

Make it look beautiful, consistent, and professional.

## Worker API Setup with Hono and Github API

Build me a Cloudflare Worker API using Hono (TypeScript) that does the following:

1. Exposes a POST endpoint `/analyze-repo`.

   - Input body: { "repoUrl": "https://github.com/owner/repo" }

2. From the `repoUrl`:

   - Parse out the `owner` and `repo`.
   - Use GitHub’s REST API to fetch:
     - Repository metadata (name, description, stars, forks, open_issues_count, html_url).
     - Issues (open issues only, limit to 50 for now).
       For each issue, get:
       - issue_number
       - title
       - state
       - labels
       - created_at
       - updated_at
       - body (first 200 chars only to keep payload small)
       - author login
       - html_url

3. Return a JSON response shaped like this:

```json
{
  "repository": {
    "name": "repo-name",
    "owner": "repo-owner",
    "description": "repo description",
    "stars": 123,
    "forks": 45,
    "openIssues": 20,
    "url": "https://github.com/owner/repo"
  },
  "issues": [
    {
      "issue_number": 12,
      "title": "Fix login timeout error",
      "state": "open",
      "labels": ["bug"],
      "author": "johndoe",
      "created_at": "2025-09-10T12:00:00Z",
      "updated_at": "2025-09-20T12:00:00Z",
      "body": "Shortened issue body...",
      "url": "https://github.com/owner/repo/issues/12"
    }
  ]
}
```

4. Implementation details:

   - Use `fetch` to call GitHub API (`https://api.github.com/repos/{owner}/{repo}` and `/issues`).
   - Handle GitHub API rate limits gracefully (check `x-ratelimit-remaining` header, return 429 if exhausted).
   - Validate repo URL input; if invalid, return 400 with `{ error: "Invalid repo URL" }`.
   - If repo not found, return 404.
   - Wrap all responses in proper error handling.

5. Use clean TypeScript with types/interfaces for repo + issues.
6. Keep it minimal and production-ready for Cloudflare deployment.
