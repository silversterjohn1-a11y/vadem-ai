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
- `ANTHROPIC_MODEL` — defaults to `claude-opus-4-8`
- `PORT` — Express port (default `8787`)

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor (creates
   tables + row-level security).
3. Copy the project URL and anon key into `.env`.

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
server/         Express API — proxies Claude, parses PDFs
supabase/       schema.sql
```

The browser never sees the Anthropic key: all Claude calls go through
`/api/*` on the Express server (Vite proxies `/api` in dev).

---

VademAI is a study aid, not medical advice. Always verify AI-generated content
against trusted sources.
