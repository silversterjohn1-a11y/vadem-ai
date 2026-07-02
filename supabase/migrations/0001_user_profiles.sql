-- ─────────────────────────────────────────────────────────────────────────────
-- VademAI · user_profiles
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Creates the profile table used for authentication & user tracking, secures it
-- with row-level security, and auto-creates a profile row whenever a new user
-- signs up (works even when email confirmation is enabled, because the trigger
-- runs server-side with elevated privileges).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  plan       text not null default 'free',
  created_at timestamptz not null default now()
);

-- ── Row Level Security: a user may only see and edit their own profile ────────
alter table public.user_profiles enable row level security;

drop policy if exists "read own profile"   on public.user_profiles;
drop policy if exists "insert own profile" on public.user_profiles;
drop policy if exists "update own profile" on public.user_profiles;

create policy "read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Auto-create a profile row when a new auth user is created ─────────────────
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
