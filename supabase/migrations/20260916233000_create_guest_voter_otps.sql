-- Create guest_voter_otps table for guest election OTP verification
create table if not exists guest_voter_otps (
  id uuid default gen_random_uuid() primary key,
  voter_id uuid references guest_voters(id) on delete cascade not null,
  election_id uuid references guest_elections(id) on delete cascade not null,
  otp_code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_guest_voter_otps_lookup on guest_voter_otps (voter_id, election_id);
alter table guest_voter_otps enable row level security;
drop policy if exists "anon_all_guest_voter_otps" on guest_voter_otps;
create policy "anon_all_guest_voter_otps" on guest_voter_otps for all to anon using (true) with check (true);
