# PROMPTS.md

## Frontend Setup with Zustand, shadcn/ui, and Vercel AI Elements

Prompt used with AI (Cursor):

"Build a Next.js frontend for my Cloudflare AI project with the following requirements:

1. State Management:

   - Use Zustand to store user API Token and Zone ID.
   - Save these credentials to localStorage so they persist across sessions.
   - Provide a hook to access and update this state anywhere in the app.

2. Onboarding Modal:

   - If no credentials are found in localStorage, show a modal asking for 'Cloudflare API Token' and 'Zone ID'.
   - Use shadcn/ui Dialog for the modal.
   - When submitted, save the credentials to Zustand + localStorage, and close the modal.
   - Validate inputs are not empty.

3. Main Page:

   - After credentials are set, display a simple chat interface.
   - Use Vercel's `ai-elements` for the chat UI.
   - A text input at the bottom should let users type queries.
   - Messages should show as a thread (user input and AI response).
   - For now, mock the AI API call with a function that hits `/api/query`.

4. UI/UX:

   - Use shadcn/ui components for styling consistency (Button, Input, Card, etc.).
   - Make sure it’s mobile responsive.
   - Keep the design minimal, clean, and professional.

5. Code Quality:
   - Follow Next.js + React best practices.
   - TypeScript enabled, no `any` types.
   - No placeholder or unnecessary comments in the code.
   - Organize files in `/components`, `/hooks`, and `/app/api`.

Deliverables:

- Zustand store in `/store/useCredentials.ts`.
- Modal component in `/components/CredentialsModal.tsx`.
- Chat interface in `/components/Chat.tsx`.
- API route `/app/api/query/route.ts` (stubbed for now)."
