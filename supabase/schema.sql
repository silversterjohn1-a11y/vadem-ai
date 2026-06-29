-- VademAI database schema
-- Run this in the Supabase SQL editor for your project.

-- ── Profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Documents ─────────────────────────────────────────────────────────────────
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content text,
  chars int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Flashcard decks ───────────────────────────────────────────────────────────
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

-- ── Exam attempts ─────────────────────────────────────────────────────────────
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.flashcards enable row level security;
alter table public.exam_attempts enable row level security;

-- Each user can only see and modify their own rows.
create policy "own profile"   on public.profiles      for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own documents" on public.documents     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cards"     on public.flashcards    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attempts"  on public.exam_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
