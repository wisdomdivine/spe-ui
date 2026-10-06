-- ═══════════════════════════════════════════════════════════
-- Guest Branding & Profile Settings Migration
-- ═══════════════════════════════════════════════════════════

create table if not exists guest_branding (
  id text primary key default 'default',
  organization_name text not null default 'Guest Electoral Session',
  organization_acronym text not null default 'Guest',
  organization_full_name text not null default 'Guest Electoral Session · University of Ibadan',
  logo_url text not null default '/guest-logo.svg',
  cobranding_title text not null default 'SPE UI x Guest',
  hero_title text not null default 'Guest Voting,
Secure & Direct.',
  hero_description text not null default 'Official guest electoral portal provided in collaboration with partner organizations and student associations, University of Ibadan.',
  portal_badge text not null default 'Official Guest Electoral Portal',
  auth_badge text not null default 'Guest Voter Verification',
  faculty_name text not null default 'Guest Session',
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
  'Guest Electoral Session',
  'Guest',
  'Guest Electoral Session · University of Ibadan',
  '/guest-logo.svg',
  'SPE UI x Guest',
  'Guest Voting,
Secure & Direct.',
  'Official guest electoral portal provided in collaboration with partner organizations and student associations, University of Ibadan.',
  'Official Guest Electoral Portal',
  'Guest Voter Verification',
  'Guest Session'
) on conflict (id) do nothing;
