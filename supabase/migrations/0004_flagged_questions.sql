-- ─────────────────────────────────────────────────────────────────────────────
-- VademAI · flagged_questions ("weak spots")
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Stores exam questions the user flagged (manually or auto-flagged on a wrong
-- answer) so they can review and re-practice them. Row-level security limits
-- each user to their own rows. A unique (user_id, question) constraint keeps a
-- question from appearing twice in a user's weak spots.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.flagged_questions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  question       text not null,
  correct_answer text,
  user_answer    text,
  topic          text,
  flagged_at     timestamptz not null default now(),
  unique (user_id, question)
);

create index if not exists flagged_questions_user_idx on public.flagged_questions (user_id);

alter table public.flagged_questions enable row level security;

drop policy if exists "view own flagged"   on public.flagged_questions;
drop policy if exists "insert own flagged"  on public.flagged_questions;
drop policy if exists "delete own flagged"  on public.flagged_questions;

create policy "view own flagged"
  on public.flagged_questions for select
  using (auth.uid() = user_id);

create policy "insert own flagged"
  on public.flagged_questions for insert
  with check (auth.uid() = user_id);

create policy "delete own flagged"
  on public.flagged_questions for delete
  using (auth.uid() = user_id);
