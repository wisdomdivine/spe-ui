-- ═══════════════════════════════════════════════════════════
-- Optional Email-Click Voter Accreditation (Normal & Guest)
-- ═══════════════════════════════════════════════════════════

-- 1. Add require_accreditation flag to elections & guest_elections (default false = backwards compatible)
alter table if exists public.elections
  add column if not exists require_accreditation boolean not null default false;

alter table if exists public.guest_elections
  add column if not exists require_accreditation boolean not null default false;

-- 2. Add accreditation tracking & secure token to election_voter_assignments
alter table if exists public.election_voter_assignments
  add column if not exists is_accredited boolean not null default false,
  add column if not exists accredited_at timestamptz,
  add column if not exists accreditation_token text default gen_random_uuid()::text;

update public.election_voter_assignments
set accreditation_token = gen_random_uuid()::text
where accreditation_token is null or accreditation_token = '';

alter table if exists public.election_voter_assignments
  alter column accreditation_token set not null,
  alter column accreditation_token set default gen_random_uuid()::text;

create unique index if not exists idx_election_voter_assignments_accreditation_token
  on public.election_voter_assignments (accreditation_token);

-- 3. Add accreditation tracking & secure token to guest_election_voter_assignments
alter table if exists public.guest_election_voter_assignments
  add column if not exists is_accredited boolean not null default false,
  add column if not exists accredited_at timestamptz,
  add column if not exists accreditation_token text default gen_random_uuid()::text;

update public.guest_election_voter_assignments
set accreditation_token = gen_random_uuid()::text
where accreditation_token is null or accreditation_token = '';

alter table if exists public.guest_election_voter_assignments
  alter column accreditation_token set not null,
  alter column accreditation_token set default gen_random_uuid()::text;

create unique index if not exists idx_guest_election_voter_assignments_accreditation_token
  on public.guest_election_voter_assignments (accreditation_token);

-- 4. Update submit_election_ballot RPC to enforce accreditation when enabled
create or replace function public.submit_election_ballot(
  p_election_id uuid,
  p_voter_id uuid,
  p_votes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_open boolean;
  v_require_accreditation boolean;
  v_assignment_id uuid;
  v_has_voted boolean;
  v_is_accredited boolean;
  v_voter_level text;
  v_voter_dept text;
  v_voter_constituency text;
  v_item jsonb;
  v_pos record;
  v_is_eligible boolean;
  v_total_rows int;
  v_null_rows int;
  v_distinct_cands int;
  v_cand_count int;
  v_eff_min int;
  v_eff_max int;
  v_invalid_pos_count int;
  v_invalid_cand_count int;
begin
  -- 1. Verify election exists and is open
  select is_open, coalesce(require_accreditation, false)
  into v_is_open, v_require_accreditation
  from elections
  where id = p_election_id;

  if v_is_open is null then
    return jsonb_build_object('success', false, 'error', 'Election not found.');
  end if;

  if not v_is_open then
    return jsonb_build_object('success', false, 'error', 'This election is not open for voting.');
  end if;

  -- 2. Lock voter assignment row FOR UPDATE to prevent concurrent double-voting
  select id, has_voted, coalesce(is_accredited, false)
  into v_assignment_id, v_has_voted, v_is_accredited
  from election_voter_assignments
  where election_id = p_election_id and voter_id = p_voter_id
  for update;

  if v_assignment_id is null then
    return jsonb_build_object('success', false, 'error', 'You are not eligible to vote in this election.');
  end if;

  if v_require_accreditation and not v_is_accredited then
    return jsonb_build_object('success', false, 'error', 'You have not completed accreditation for this election. Please click the accreditation link sent to your email.');
  end if;

  if v_has_voted then
    return jsonb_build_object('success', false, 'error', 'You have already voted in this election.');
  end if;

  -- Fetch voter constituency profile (level, department, constituency)
  select level, department, constituency
  into v_voter_level, v_voter_dept, v_voter_constituency
  from voters
  where id = p_voter_id;

  if p_votes is null or jsonb_typeof(p_votes) <> 'array' then
    return jsonb_build_object('success', false, 'error', 'Invalid ballot payload.');
  end if;

  -- 3. Verify all submitted position_ids belong to this election
  select count(*) into v_invalid_pos_count
  from jsonb_array_elements(p_votes) as elem
  where not exists (
    select 1 from election_positions ep
    where ep.id = (elem->>'position_id')::uuid
      and ep.election_id = p_election_id
  );

  if v_invalid_pos_count > 0 then
    return jsonb_build_object('success', false, 'error', 'Ballot contains an invalid position.');
  end if;

  -- 4. Verify all non-null candidate_ids belong to their submitted position & election
  select count(*) into v_invalid_cand_count
  from jsonb_array_elements(p_votes) as elem
  where nullif(elem->>'candidate_id', '') is not null
    and not exists (
      select 1 from election_candidates ec
      where ec.id = nullif(elem->>'candidate_id', '')::uuid
        and ec.position_id = (elem->>'position_id')::uuid
        and ec.election_id = p_election_id
    );

  if v_invalid_cand_count > 0 then
    return jsonb_build_object('success', false, 'error', 'Ballot contains an invalid candidate selection.');
  end if;

  -- 5. Validate eligibility + min/max & duplicate rules per configured position
  for v_pos in
    select
      id, title, allow_multiple, min_selections, max_selections,
      coalesce(eligible_levels, '{}') as eligible_levels,
      coalesce(eligible_departments, '{}') as eligible_departments,
      coalesce(eligible_constituencies, '{}') as eligible_constituencies
    from election_positions
    where election_id = p_election_id
  loop
    v_is_eligible :=
      (cardinality(v_pos.eligible_levels) = 0 or exists (
        select 1 from unnest(v_pos.eligible_levels) as el
        where lower(trim(el)) = lower(trim(coalesce(v_voter_level, '')))
      ))
      and (cardinality(v_pos.eligible_departments) = 0 or exists (
        select 1 from unnest(v_pos.eligible_departments) as ed
        where lower(trim(ed)) = lower(trim(coalesce(v_voter_dept, '')))
      ))
      and (cardinality(v_pos.eligible_constituencies) = 0 or exists (
        select 1 from unnest(v_pos.eligible_constituencies) as ec
        where lower(trim(ec)) = lower(trim(coalesce(v_voter_constituency, '')))
      ));

    select
      count(*),
      count(*) filter (where nullif(elem->>'candidate_id', '') is null),
      count(distinct nullif(elem->>'candidate_id', '')) filter (where nullif(elem->>'candidate_id', '') is not null)
    into v_total_rows, v_null_rows, v_distinct_cands
    from jsonb_array_elements(p_votes) as elem
    where (elem->>'position_id')::uuid = v_pos.id;

    if not v_is_eligible then
      if v_total_rows > 0 then
        return jsonb_build_object('success', false, 'error', 'You are not eligible to vote for ' || v_pos.title || '.');
      end if;
      continue;
    end if;

    if v_null_rows > 0 then
      if v_total_rows > 1 then
        return jsonb_build_object('success', false, 'error', 'Cannot combine Void with candidate selections for ' || v_pos.title || '.');
      end if;
      continue;
    end if;

    if v_distinct_cands <> v_total_rows then
      return jsonb_build_object('success', false, 'error', 'Duplicate candidate selected for ' || v_pos.title || '.');
    end if;

    if not coalesce(v_pos.allow_multiple, false) then
      if v_total_rows <> 1 then
        return jsonb_build_object('success', false, 'error', 'Please select exactly 1 option for ' || v_pos.title || '.');
      end if;
    else
      select count(*) into v_cand_count
      from election_candidates
      where election_id = p_election_id and position_id = v_pos.id;

      v_eff_max := case when v_cand_count > 0 then least(greatest(coalesce(v_pos.max_selections, 1), 1), v_cand_count) else greatest(coalesce(v_pos.max_selections, 1), 1) end;
      v_eff_min := least(greatest(coalesce(v_pos.min_selections, 1), 0), v_eff_max);

      if v_total_rows < v_eff_min then
        return jsonb_build_object('success', false, 'error', 'Please select at least ' || v_eff_min || ' candidate(s) for ' || v_pos.title || '.');
      end if;
      if v_total_rows > v_eff_max then
        return jsonb_build_object('success', false, 'error', 'You can select at most ' || v_eff_max || ' candidate(s) for ' || v_pos.title || '.');
      end if;
    end if;
  end loop;

  -- 6. Mark voter assignment as voted
  update election_voter_assignments
  set has_voted = true,
      voted_at = timezone('utc'::text, now())
  where id = v_assignment_id;

  -- 7. Bulk insert anonymous votes
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

grant execute on function public.submit_election_ballot(uuid, uuid, jsonb) to service_role;

-- 5. Update submit_guest_election_ballot RPC to enforce accreditation when enabled
create or replace function public.submit_guest_election_ballot(
  p_election_id uuid,
  p_voter_id uuid,
  p_votes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_open boolean;
  v_require_accreditation boolean;
  v_assignment_id uuid;
  v_has_voted boolean;
  v_is_accredited boolean;
  v_voter_level text;
  v_voter_dept text;
  v_voter_constituency text;
  v_item jsonb;
  v_pos record;
  v_is_eligible boolean;
  v_total_rows int;
  v_null_rows int;
  v_distinct_cands int;
  v_cand_count int;
  v_eff_min int;
  v_eff_max int;
  v_invalid_pos_count int;
  v_invalid_cand_count int;
begin
  -- 1. Verify guest election exists and is open
  select is_open, coalesce(require_accreditation, false)
  into v_is_open, v_require_accreditation
  from guest_elections
  where id = p_election_id;

  if v_is_open is null then
    return jsonb_build_object('success', false, 'error', 'Election not found.');
  end if;

  if not v_is_open then
    return jsonb_build_object('success', false, 'error', 'This election is not open for voting.');
  end if;

  -- 2. Lock guest voter assignment row FOR UPDATE
  select id, has_voted, coalesce(is_accredited, false)
  into v_assignment_id, v_has_voted, v_is_accredited
  from guest_election_voter_assignments
  where election_id = p_election_id and voter_id = p_voter_id
  for update;

  if v_assignment_id is null then
    return jsonb_build_object('success', false, 'error', 'You are not eligible to vote in this election.');
  end if;

  if v_require_accreditation and not v_is_accredited then
    return jsonb_build_object('success', false, 'error', 'You have not completed accreditation for this election. Please click the accreditation link sent to your email.');
  end if;

  if v_has_voted then
    return jsonb_build_object('success', false, 'error', 'You have already voted in this election.');
  end if;

  -- Fetch guest voter constituency profile (level, department, constituency)
  select level, department, constituency
  into v_voter_level, v_voter_dept, v_voter_constituency
  from guest_voters
  where id = p_voter_id;

  if p_votes is null or jsonb_typeof(p_votes) <> 'array' then
    return jsonb_build_object('success', false, 'error', 'Invalid ballot payload.');
  end if;

  -- 3. Verify all submitted position_ids belong to this election
  select count(*) into v_invalid_pos_count
  from jsonb_array_elements(p_votes) as elem
  where not exists (
    select 1 from guest_election_positions ep
    where ep.id = (elem->>'position_id')::uuid
      and ep.election_id = p_election_id
  );

  if v_invalid_pos_count > 0 then
    return jsonb_build_object('success', false, 'error', 'Ballot contains an invalid position.');
  end if;

  -- 4. Verify all non-null candidate_ids belong to their submitted position & election
  select count(*) into v_invalid_cand_count
  from jsonb_array_elements(p_votes) as elem
  where nullif(elem->>'candidate_id', '') is not null
    and not exists (
      select 1 from guest_election_candidates ec
      where ec.id = nullif(elem->>'candidate_id', '')::uuid
        and ec.position_id = (elem->>'position_id')::uuid
        and ec.election_id = p_election_id
    );

  if v_invalid_cand_count > 0 then
    return jsonb_build_object('success', false, 'error', 'Ballot contains an invalid candidate selection.');
  end if;

  -- 5. Validate eligibility + min/max & duplicate rules per configured position
  for v_pos in
    select
      id, title, allow_multiple, min_selections, max_selections,
      coalesce(eligible_levels, '{}') as eligible_levels,
      coalesce(eligible_departments, '{}') as eligible_departments,
      coalesce(eligible_constituencies, '{}') as eligible_constituencies
    from guest_election_positions
    where election_id = p_election_id
  loop
    v_is_eligible :=
      (cardinality(v_pos.eligible_levels) = 0 or exists (
        select 1 from unnest(v_pos.eligible_levels) as el
        where lower(trim(el)) = lower(trim(coalesce(v_voter_level, '')))
      ))
      and (cardinality(v_pos.eligible_departments) = 0 or exists (
        select 1 from unnest(v_pos.eligible_departments) as ed
        where lower(trim(ed)) = lower(trim(coalesce(v_voter_dept, '')))
      ))
      and (cardinality(v_pos.eligible_constituencies) = 0 or exists (
        select 1 from unnest(v_pos.eligible_constituencies) as ec
        where lower(trim(ec)) = lower(trim(coalesce(v_voter_constituency, '')))
      ));

    select
      count(*),
      count(*) filter (where nullif(elem->>'candidate_id', '') is null),
      count(distinct nullif(elem->>'candidate_id', '')) filter (where nullif(elem->>'candidate_id', '') is not null)
    into v_total_rows, v_null_rows, v_distinct_cands
    from jsonb_array_elements(p_votes) as elem
    where (elem->>'position_id')::uuid = v_pos.id;

    if not v_is_eligible then
      if v_total_rows > 0 then
        return jsonb_build_object('success', false, 'error', 'You are not eligible to vote for ' || v_pos.title || '.');
      end if;
      continue;
    end if;

    if v_null_rows > 0 then
      if v_total_rows > 1 then
        return jsonb_build_object('success', false, 'error', 'Cannot combine Void with candidate selections for ' || v_pos.title || '.');
      end if;
      continue;
    end if;

    if v_distinct_cands <> v_total_rows then
      return jsonb_build_object('success', false, 'error', 'Duplicate candidate selected for ' || v_pos.title || '.');
    end if;

    if not coalesce(v_pos.allow_multiple, false) then
      if v_total_rows <> 1 then
        return jsonb_build_object('success', false, 'error', 'Please select exactly 1 option for ' || v_pos.title || '.');
      end if;
    else
      select count(*) into v_cand_count
      from guest_election_candidates
      where election_id = p_election_id and position_id = v_pos.id;

      v_eff_max := case when v_cand_count > 0 then least(greatest(coalesce(v_pos.max_selections, 1), 1), v_cand_count) else greatest(coalesce(v_pos.max_selections, 1), 1) end;
      v_eff_min := least(greatest(coalesce(v_pos.min_selections, 1), 0), v_eff_max);

      if v_total_rows < v_eff_min then
        return jsonb_build_object('success', false, 'error', 'Please select at least ' || v_eff_min || ' candidate(s) for ' || v_pos.title || '.');
      end if;
      if v_total_rows > v_eff_max then
        return jsonb_build_object('success', false, 'error', 'You can select at most ' || v_eff_max || ' candidate(s) for ' || v_pos.title || '.');
      end if;
    end if;
  end loop;

  -- 6. Mark voter assignment as voted
  update guest_election_voter_assignments
  set has_voted = true,
      voted_at = timezone('utc'::text, now())
  where id = v_assignment_id;

  -- 7. Bulk insert anonymous guest votes
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

grant execute on function public.submit_guest_election_ballot(uuid, uuid, jsonb) to service_role;
