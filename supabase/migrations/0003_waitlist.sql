-- ─────────────────────────────────────────────────────────────────────────────
-- VademAI · waitlist
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Stores emails for the Pro "early access" waitlist. Anyone (anonymous) may
-- insert their email; a unique constraint prevents duplicates. No SELECT policy
-- is defined, so the list is not publicly readable — view it in the Supabase
-- Table Editor (which uses the service role) instead.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);
