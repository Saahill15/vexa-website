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

-- rate limits: one row per counted hit, old rows are cleared automatically
create table if not exists rate_hits (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_hits_key_idx on rate_hits (key, at desc);

-- Row level security with no policies: the table owner (the site's own database user) is unaffected, but anyone else who can
-- reach the database through another door (for example Supabase's public REST API and its "anon" key) sees nothing.
alter table app_meta enable row level security;
alter table users enable row level security;
alter table articles enable row level security;
alter table comments enable row level security;
alter table enquiries enable row level security;
alter table email_verifications enable row level security;
alter table password_resets enable row level security;
alter table pending_signups enable row level security;
alter table rate_hits enable row level security;

-- the saved mail lists, shared by every server instance so they do not each ask Gmail (the admin inbox only)
create table if not exists mail_cache (
  folder text primary key,
  fetched_at bigint not null,
  synced_at text not null,
  data jsonb not null
);
alter table mail_cache enable row level security;

-- signed-in sessions: only a hash of each token is stored; revoked_at is set when someone signs out
create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists sessions_user_idx on sessions (user_id);
alter table sessions enable row level security;

-- two-step sign-in for admins: authenticator codes and passkeys
create table if not exists admin_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  kind text not null check (kind in ('totp', 'passkey')),
  name text not null default '',
  secret text,
  credential_id text unique,
  public_key text,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  last_step bigint,
  confirmed boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists admin_factors_user_idx on admin_factors (user_id);

create table if not exists admin_backup_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  code_hash text not null,
  used_at timestamptz
);
create index if not exists admin_backup_codes_user_idx on admin_backup_codes (user_id);

-- short-lived passkey challenges, one per attempt
create table if not exists mfa_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  kind text not null,
  challenge text not null,
  expires_at timestamptz not null
);

-- a session only counts as fully signed in once its second step is done (admins)
alter table sessions add column if not exists mfa_at timestamptz;

alter table admin_factors enable row level security;
alter table admin_backup_codes enable row level security;
alter table mfa_challenges enable row level security;
