create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sermon_date timestamptz not null,
  content jsonb not null,
  audio_url text,
  status text not null check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sermons_sermon_date_idx on public.sermons (sermon_date desc);
create index if not exists sermons_status_idx on public.sermons (status);

drop trigger if exists sermons_set_updated_at on public.sermons;
create trigger sermons_set_updated_at
before update on public.sermons
for each row
execute function public.set_updated_at();

alter table public.sermons enable row level security;