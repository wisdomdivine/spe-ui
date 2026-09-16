-- Allow candidate_id to be NULL for abstention / None of the Above votes
ALTER TABLE guest_election_ballots ALTER COLUMN candidate_id DROP NOT NULL;
