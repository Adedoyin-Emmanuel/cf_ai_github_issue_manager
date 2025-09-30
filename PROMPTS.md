# PROMPTS.md

## Frontend Setup with Zustand, shadcn/ui, and Vercel AI Elements

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
