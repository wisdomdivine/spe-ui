export interface VoterAttributes {
  level?: string | null;
  department?: string | null;
  constituency?: string | null;
}

export interface PositionEligibility {
  eligible_levels?: string[] | null;
  eligible_departments?: string[] | null;
  eligible_constituencies?: string[] | null;
}

function matchesList(value: string | null | undefined, allowed: string[] | null | undefined): boolean {
  if (!allowed || allowed.length === 0) return true;
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) return false;
  return allowed.some((item) => item.trim().toLowerCase() === normalized);
}

/**
 * Checks whether a voter satisfies a position's constituency restrictions.
 * Empty/missing arrays mean unrestricted for that attribute.
 * Multiple populated attribute categories are combined with AND; values within a category use OR.
 */
export function isVoterEligibleForPosition(
  voter: VoterAttributes | null | undefined,
  position: PositionEligibility
): boolean {
  if (!hasPositionRestrictions(position)) return true;
  if (!voter) return false;
  return (
    matchesList(voter.level, position.eligible_levels) &&
    matchesList(voter.department, position.eligible_departments) &&
    matchesList(voter.constituency, position.eligible_constituencies)
  );
}

export function hasPositionRestrictions(position: PositionEligibility): boolean {
  return Boolean(
    (position.eligible_levels && position.eligible_levels.length > 0) ||
      (position.eligible_departments && position.eligible_departments.length > 0) ||
      (position.eligible_constituencies && position.eligible_constituencies.length > 0)
  );
}

export function formatConstituencyTags(position: PositionEligibility): string[] {
  const tags: string[] = [];
  if (position.eligible_levels && position.eligible_levels.length > 0) {
    tags.push(`Level: ${position.eligible_levels.join(", ")}`);
  }
  if (position.eligible_departments && position.eligible_departments.length > 0) {
    tags.push(`Dept: ${position.eligible_departments.join(", ")}`);
  }
  if (position.eligible_constituencies && position.eligible_constituencies.length > 0) {
    tags.push(`Constituency: ${position.eligible_constituencies.join(", ")}`);
  }
  return tags;
}
