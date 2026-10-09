-- Email sign-ups from the website. Run once in the Supabase SQL editor (or via a migration).
-- The website can only ADD rows. It cannot read, change or delete them, so the list stays private.
create table if not exists public.subscribers (
  id bigint generated always as identity primary key,
  email text not null,
  source text,
  created_at timestamptz not null default now(),
  constraint subscribers_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and length(email) <= 254),
  constraint subscribers_source_length check (source is null or length(source) <= 40)
);

-- One row per address, ignoring capital letters.
create unique index if not exists subscribers_email_unique on public.subscribers (lower(email));

alter table public.subscribers enable row level security;

drop policy if exists "Website can add sign-ups" on public.subscribers;
create policy "Website can add sign-ups" on public.subscribers
  for insert to anon
  with check (true);

-- Belt and braces: the public role gets insert only, on the columns the form sends.
revoke all on public.subscribers from anon;
revoke all on public.subscribers from authenticated;
grant insert (email, source) on public.subscribers to anon;
