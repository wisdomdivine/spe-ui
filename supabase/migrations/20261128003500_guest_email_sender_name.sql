-- Add configurable email sender display name for guest electoral emails (defaulting to SEMS)
alter table if exists public.guest_branding
  add column if not exists email_sender_name text not null default 'SEMS';

update public.guest_branding
set email_sender_name = 'SEMS'
where id = 'default';
