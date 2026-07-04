# VademAI

> Study Medicine Smarter. Ace Your Exams.

An AI-powered study app for medical students. Upload lecture PDFs and turn them
into flashcards, USMLE-style mock exams, plain-language explanations, and a
personalized revision plan — all powered by Anthropic's Claude.

## Tech stack

- **React + Vite + TypeScript** — frontend
- **Tailwind CSS** — styling (clean white UI, `#3B82F6` blue accent, Inter font)
- **Supabase** — auth + database
- **Anthropic Claude API** — AI features (via an Express backend so the key stays server-side)

## Features

| Area | What it does |
|------|--------------|
| AI PDF Analysis | Extract text from uploaded PDFs |
| AI Medical Tutor | Chat grounded in your active document |
| Smart Flashcards | Auto-generate flashcard decks |
| Exam Mode | USMLE-style MCQs with scoring & explanations |
| Study Planner | Day-by-day revision schedule |
| Explain Simply | Plain-language explanations |

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # starts Vite (web) + Express (API) together
```

Open http://localhost:5173.

> **Runs without config.** If `VITE_SUPABASE_*` is unset the app uses a local
> demo auth mode, and if `ANTHROPIC_API_KEY` is unset the API returns sample
> content. Add the keys to `.env` to enable real auth and AI.

### Environment variables

See [`.env.example`](.env.example):

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — from your Supabase project
- `ANTHROPIC_API_KEY` — from the Anthropic Console
- `ANTHROPIC_MODEL` — defaults to `claude-sonnet-4-6`
- `PORT` — Express port (default `8787`)

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/migrations/0001_user_profiles.sql`](supabase/migrations/0001_user_profiles.sql)
   (the `user_profiles` table used for auth + user tracking, with RLS and an
   auto-create trigger). Optionally also run [`supabase/schema.sql`](supabase/schema.sql)
   for the documents/flashcards/exam tables.
3. Copy the project URL and anon key into `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Auth → Providers → Email: enable "Confirm email" if you want email
   confirmation (the app handles both modes automatically).

## Scripts

- `npm run dev` — web + API together
- `npm run dev:web` — Vite only
- `npm run server` — Express API only
- `npm run build` — type-check + production build

## Architecture

```
src/            React app (pages, components, contexts)
  pages/        Landing, Login, Register, Dashboard (+ dashboard/* features)
  components/   Landing sections, dashboard widgets, icons
  context/      AuthContext, DocumentsContext
  lib/          supabase client, backend API client
server/app.js   Express API (routes + Claude calls + error handling)
server/index.js Local dev entry — starts the Express server on :8787
api/index.js    Vercel serverless entry — exports the same Express app
supabase/       migrations + schema.sql
vercel.json     Vercel build + routing config
```

The browser never sees the Anthropic key: all Claude calls go through
`/api/*` on the server (Vite proxies `/api` in dev). The key is read from
`process.env.ANTHROPIC_API_KEY` server-side only and is never `VITE_`-prefixed,
so it is never bundled into the frontend.

## Deploying to Vercel

The same Express app runs locally (`server/index.js`) and on Vercel as a
serverless function (`api/index.js`). To deploy:

1. Import the repo in Vercel (it auto-detects Vite; `vercel.json` sets the
   build + `/api/*` routing).
2. In **Settings → Environment Variables**, add (server-side, no `VITE_` prefix):
   `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`). Also add the two
   `VITE_SUPABASE_*` vars for the frontend.
3. Deploy. `/api/health` returns `{ "ai": true }` once the key is set.

If `ANTHROPIC_API_KEY` is missing, the AI endpoints return clearly-labelled
sample content instead of failing — real users with the key always get real
Claude responses.

---

VademAI is a study aid, not medical advice. Always verify AI-generated content
against trusted sources.
