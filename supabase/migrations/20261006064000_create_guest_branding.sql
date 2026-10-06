-- ═══════════════════════════════════════════════════════════
-- Guest Branding & Profile Settings Migration
-- ═══════════════════════════════════════════════════════════

create table if not exists guest_branding (
  id text primary key default 'default',
  organization_name text not null default 'Association of Faculty of Arts Students',
  organization_acronym text not null default 'AFAS',
  organization_full_name text not null default 'Association of Faculty of Arts Students · University of Ibadan',
  logo_url text not null default '/afas-logo.png',
  cobranding_title text not null default 'SPE UI x AFAS',
  hero_title text not null default 'Guest Voting,
Secure & Direct.',
  hero_description text not null default 'Electoral portal provided in collaboration with the Association of Faculty of Arts Students (AFAS), University of Ibadan.',
  portal_badge text not null default 'Official AFAS Electoral Portal',
  auth_badge text not null default 'AFAS Voter Verification',
  faculty_name text not null default 'Faculty of Arts',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table guest_branding enable row level security;

drop policy if exists "anon_read_guest_branding" on guest_branding;
create policy "anon_read_guest_branding" on guest_branding for select to anon using (true);

drop policy if exists "authenticated_all_guest_branding" on guest_branding;
create policy "authenticated_all_guest_branding" on guest_branding for all to authenticated using (true) with check (true);

insert into guest_branding (
  id,
  organization_name,
  organization_acronym,
  organization_full_name,
  logo_url,
  cobranding_title,
  hero_title,
  hero_description,
  portal_badge,
  auth_badge,
  faculty_name
) values (
  'default',
  'Association of Faculty of Arts Students',
  'AFAS',
  'Association of Faculty of Arts Students · University of Ibadan',
  '/afas-logo.png',
  'SPE UI x AFAS',
  'Guest Voting,
Secure & Direct.',
  'Electoral portal provided in collaboration with the Association of Faculty of Arts Students (AFAS), University of Ibadan.',
  'Official AFAS Electoral Portal',
  'AFAS Voter Verification',
  'Faculty of Arts'
) on conflict (id) do nothing;
