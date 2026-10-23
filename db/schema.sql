-- Vexa site schema. Safe to run again: every statement only creates what is missing.
-- Apply with: npm run db:schema

create table if not exists app_meta (
  key text primary key,
  set_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text,
  google_id text unique,
  email_verified boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  password_changed_at timestamptz,
  sessions_revoked_at timestamptz,
  inbox_read_all timestamptz,
  inbox_read text[] not null default '{}'
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  category text not null,
  date text not null,
  status text not null check (status in ('draft', 'published')),
  preview_blocks integer not null,
  blocks jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  -- null once the account is deleted: the comment stays, shown as from a former member
  user_id uuid references users (id) on delete set null,
  name text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_slug_idx on comments (slug, created_at desc);
create index if not exists comments_user_idx on comments (user_id);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  name text,
  email text not null,
  role text not null,
  interest text,
  company text,
  problem text not null,
  budget text,
  launch text,
  source text,
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'in_progress', 'waiting', 'resolved')),
  notes text not null default '',
  emailed text not null check (emailed in ('delivered', 'failed', 'not_configured'))
);
create index if not exists enquiries_at_idx on enquiries (at desc);
create index if not exists enquiries_email_idx on enquiries (lower(email));

-- single-use links: only a hash of each token is stored
create table if not exists email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

-- a sign-up waits here until its email is confirmed; the password is already hashed
create table if not exists pending_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  password_hash text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists pending_signups_email_idx on pending_signups (email);
