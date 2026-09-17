-- Portfolio schema. Run in the Supabase SQL editor, or `supabase db push`.
-- Replace :owner_id with your auth.users id after your first GitHub sign-in.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- versions
create table if not exists public.site_versions (
  id         uuid primary key default gen_random_uuid(),
  config     jsonb not null,
  status     text  not null default 'draft' check (status in ('draft','published')),
  label      text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists site_versions_one_published
  on public.site_versions (status) where status = 'published';
create index if not exists site_versions_created_at on public.site_versions (created_at desc);

-- ---------------------------------------------------------------- projects
create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  repo_full_name   text unique not null,
  featured         boolean not null default false,
  sort_order       int not null default 0,
  title_override   text,
  summary_override text,
  cover_url        text,
  case_study_md    text,
  tags             text[] not null default '{}',
  hidden           boolean not null default false,
  updated_at       timestamptz not null default now()
);

-- ----------------------------------------------------------- repo snapshots
create table if not exists public.repo_snapshots (
  repo_full_name text primary key,
  data           jsonb not null,
  fetched_at     timestamptz not null default now()
);

-- ------------------------------------------------------------------- leads
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text,
  ip_hash    text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- RLS
alter table public.site_versions  enable row level security;
alter table public.projects       enable row level security;
alter table public.repo_snapshots enable row level security;
alter table public.leads          enable row level security;

-- No anon policies anywhere: the public site is static and never reads these.
-- The build and the API routes use the service role key, which bypasses RLS.

drop policy if exists owner_all_versions on public.site_versions;
create policy owner_all_versions on public.site_versions
  for all to authenticated
  using  (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists owner_all_projects on public.projects;
create policy owner_all_projects on public.projects
  for all to authenticated
  using  (auth.uid() = (select id from auth.users where id = auth.uid()))
  with check (true);

-- leads: insert only via the service role. No client policy on purpose.
