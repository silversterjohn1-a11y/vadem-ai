-- ─────────────────────────────────────────────────────────────────────────────
-- VademAI · usage_tracking
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Tracks per-user, per-feature usage counts within a rolling period so Free-plan
-- limits can be enforced. One row per (user_id, feature); the app rolls the
-- period over automatically based on `period_type`.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.usage_tracking (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  feature      text not null,
  count        integer not null default 0,
  period_start timestamptz not null default now(),
  period_type  text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, feature)
);

create index if not exists usage_tracking_user_idx on public.usage_tracking (user_id);

alter table public.usage_tracking enable row level security;

-- Re-runnable: drop existing policies before recreating.
drop policy if exists "Users can view own usage"   on public.usage_tracking;
drop policy if exists "Users can insert own usage"  on public.usage_tracking;
drop policy if exists "Users can update own usage"  on public.usage_tracking;

create policy "Users can view own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.usage_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on public.usage_tracking for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
