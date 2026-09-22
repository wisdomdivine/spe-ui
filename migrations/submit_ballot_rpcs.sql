-- ==============================================================================
-- Migration: Atomic Ballot Submission RPCs
-- ==============================================================================
-- Solves:
-- 1. Double voting race condition (locks the voter assignment row with FOR UPDATE).
-- 2. Network round-trip latency (replaces 6 sequential API roundtrips with 1 atomic DB call).
-- 3. Database connection saturation (runs inside a single transaction in milliseconds).
--
-- Apply via Supabase SQL Editor:
-- ==============================================================================

-- 1. Regular Elections RPC
create or replace function public.submit_election_ballot(
  p_election_id uuid,
  p_voter_id uuid,
  p_votes jsonb -- array of objects: [{"position_id": "...", "candidate_id": "... or null"}]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_open boolean;
  v_assignment_id uuid;
  v_has_voted boolean;
  v_item jsonb;
begin
  -- 1. Verify election exists and is open
  select is_open into v_is_open
  from elections
  where id = p_election_id;

  if v_is_open is null then
    return jsonb_build_object('success', false, 'error', 'Election not found.');
  end if;

  if not v_is_open then
    return jsonb_build_object('success', false, 'error', 'This election is not open for voting.');
  end if;

  -- 2. Lock voter assignment row FOR UPDATE to prevent concurrent double-voting
  select id, has_voted into v_assignment_id, v_has_voted
  from election_voter_assignments
  where election_id = p_election_id and voter_id = p_voter_id
  for update;

  if v_assignment_id is null then
    return jsonb_build_object('success', false, 'error', 'You are not eligible to vote in this election.');
  end if;

  if v_has_voted then
    return jsonb_build_object('success', false, 'error', 'You have already voted in this election.');
  end if;

  -- 3. Mark voter assignment as voted
  update election_voter_assignments
  set has_voted = true,
      voted_at = timezone('utc'::text, now())
  where id = v_assignment_id;

  -- 4. Bulk insert anonymous votes
  for v_item in select * from jsonb_array_elements(p_votes)
  loop
    insert into election_votes (election_id, position_id, candidate_id)
    values (
      p_election_id,
      (v_item->>'position_id')::uuid,
      nullif(v_item->>'candidate_id', '')::uuid
    );
  end loop;

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

comment on function public.submit_election_ballot is
  'Atomic ballot submission for standard elections with row-level locking against double voting.';

grant execute on function public.submit_election_ballot(uuid, uuid, jsonb) to service_role;


-- 2. Guest Elections RPC
create or replace function public.submit_guest_election_ballot(
  p_election_id uuid,
  p_voter_id uuid,
  p_votes jsonb -- array of objects: [{"position_id": "...", "candidate_id": "... or null"}]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_open boolean;
  v_assignment_id uuid;
  v_has_voted boolean;
  v_item jsonb;
begin
  -- 1. Verify guest election exists and is open
  select is_open into v_is_open
  from guest_elections
  where id = p_election_id;

  if v_is_open is null then
    return jsonb_build_object('success', false, 'error', 'Election not found.');
  end if;

  if not v_is_open then
    return jsonb_build_object('success', false, 'error', 'This election is not open for voting.');
  end if;

  -- 2. Lock guest voter assignment row FOR UPDATE
  select id, has_voted into v_assignment_id, v_has_voted
  from guest_election_voter_assignments
  where election_id = p_election_id and voter_id = p_voter_id
  for update;

  if v_assignment_id is null then
    return jsonb_build_object('success', false, 'error', 'You are not eligible to vote in this election.');
  end if;

  if v_has_voted then
    return jsonb_build_object('success', false, 'error', 'You have already voted in this election.');
  end if;

  -- 3. Mark voter assignment as voted
  update guest_election_voter_assignments
  set has_voted = true,
      voted_at = timezone('utc'::text, now())
  where id = v_assignment_id;

  -- 4. Bulk insert anonymous guest votes
  for v_item in select * from jsonb_array_elements(p_votes)
  loop
    insert into guest_election_ballots (election_id, position_id, candidate_id)
    values (
      p_election_id,
      (v_item->>'position_id')::uuid,
      nullif(v_item->>'candidate_id', '')::uuid
    );
  end loop;

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

comment on function public.submit_guest_election_ballot is
  'Atomic ballot submission for guest elections with row-level locking against double voting.';

grant execute on function public.submit_guest_election_ballot(uuid, uuid, jsonb) to service_role;
