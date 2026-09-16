-- ═══════════════════════════════════════════════════════════
-- Guest System Tables & Role Migration
-- ═══════════════════════════════════════════════════════════

-- 1. Add 'guest' to admin_users role constraint
alter table if exists admin_users drop constraint if exists admin_users_role_check;
alter table if exists admin_users add constraint admin_users_role_check 
  check (role in ('admin', 'programs', 'editorial', 'dni', 'overall', 'partnership', 'electoral', 'membership', 'guest'));

-- 2. Guest Media Library
create table if not exists guest_media_files (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  size text default '0 KB',
  type text default 'image/png',
  tags text[] default '{}',
  file_group text default 'All',
  created_at timestamptz default now()
);

create index if not exists idx_guest_media_files_group on guest_media_files (file_group);
alter table guest_media_files enable row level security;
drop policy if exists "anon_read_guest_media" on guest_media_files;
create policy "anon_read_guest_media" on guest_media_files for select to anon using (true);

-- 3. Guest Voters Directory
create table if not exists guest_voters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  matric_number text unique not null,
  email text not null,
  level text,
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_guest_voters_matric on guest_voters (matric_number);
create index if not exists idx_guest_voters_email on guest_voters (email);
alter table guest_voters enable row level security;

-- 4. Guest Elections Suite
create table if not exists guest_elections (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  status text default 'Draft' check (status in ('Draft', 'Upcoming', 'Active', 'Completed')),
  is_open boolean default false,
  show_live_voter_names boolean default true,
  election_date text,
  start_time text,
  end_time text,
  access_password text,
  created_at timestamptz default now()
);

create table if not exists guest_election_positions (
  id uuid default gen_random_uuid() primary key,
  election_id uuid references guest_elections(id) on delete cascade not null,
  title text not null,
  description text default '',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists guest_election_candidates (
  id uuid default gen_random_uuid() primary key,
  election_id uuid references guest_elections(id) on delete cascade not null,
  position_id uuid references guest_election_positions(id) on delete cascade not null,
  name text not null,
  matric_number text,
  image_url text,
  manifesto text default '',
  created_at timestamptz default now()
);

create table if not exists guest_election_voter_assignments (
  id uuid default gen_random_uuid() primary key,
  election_id uuid references guest_elections(id) on delete cascade not null,
  voter_id uuid references guest_voters(id) on delete cascade not null,
  has_voted boolean default false,
  voted_at timestamptz,
  created_at timestamptz default now(),
  unique (election_id, voter_id)
);

create table if not exists guest_election_ballots (
  id uuid default gen_random_uuid() primary key,
  election_id uuid references guest_elections(id) on delete cascade not null,
  position_id uuid references guest_election_positions(id) on delete cascade not null,
  candidate_id uuid references guest_election_candidates(id) on delete cascade not null,
  created_at timestamptz default now()
);

create index if not exists idx_guest_elections_status on guest_elections (status);
create index if not exists idx_guest_election_positions_election on guest_election_positions (election_id);
create index if not exists idx_guest_election_candidates_election on guest_election_candidates (election_id);
create index if not exists idx_guest_election_voter_assign on guest_election_voter_assignments (election_id, voter_id);
create index if not exists idx_guest_election_ballots_election on guest_election_ballots (election_id);

alter table guest_elections enable row level security;
alter table guest_election_positions enable row level security;
alter table guest_election_candidates enable row level security;
alter table guest_election_voter_assignments enable row level security;
alter table guest_election_ballots enable row level security;

-- 5. Guest Email Queue & Analytics
create table if not exists guest_email_queue (
  id uuid default gen_random_uuid() primary key,
  batch_id text not null,
  subject text not null,
  source text default 'guest',
  status text default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  to_email text not null,
  to_name text,
  html_body text,
  text_body text,
  error text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists guest_email_opens (
  id uuid default gen_random_uuid() primary key,
  queue_id uuid references guest_email_queue(id) on delete cascade not null,
  opened_at timestamptz default now(),
  ip_address text,
  user_agent text
);

create table if not exists guest_email_clicks (
  id uuid default gen_random_uuid() primary key,
  queue_id uuid references guest_email_queue(id) on delete cascade not null,
  url text not null,
  clicked_at timestamptz default now(),
  ip_address text,
  user_agent text
);

create index if not exists idx_guest_email_queue_batch on guest_email_queue (batch_id);
create index if not exists idx_guest_email_queue_status on guest_email_queue (status);
create index if not exists idx_guest_email_opens_queue on guest_email_opens (queue_id);
create index if not exists idx_guest_email_clicks_queue on guest_email_clicks (queue_id);

alter table guest_email_queue enable row level security;
alter table guest_email_opens enable row level security;
alter table guest_email_clicks enable row level security;
