import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

// Revalidate every 30 seconds at the CDN / Edge layer
export const revalidate = 30;
/** Vercel/serverless: allow enough time for slow Supabase REST during spikes (defaults are often 10–60s). */
export const maxDuration = 180;

type CountRow = {
  election_id: string;
  positions_count: number;
  candidates_count: number;
  voters_count: number;
  voted_count: number;
};

type CountMap = Map<string, Omit<CountRow, "election_id">>;

function emptyCountsMap(electionIds: string[]): CountMap {
  const map = new Map<string, Omit<CountRow, "election_id">>();
  for (const id of electionIds) {
    map.set(id, {
      positions_count: 0,
      candidates_count: 0,
      voters_count: 0,
      voted_count: 0,
    });
  }
  return map;
}

/**
 * Listing must always respond — counts are for cards only; voting uses /api/elections/[id].
 * If RPC or Supabase hangs, return fallback rather than stalling prod.
 */
function raceMs<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

/** Load election rows with a hard timeout so the HTTP handler cannot hang indefinitely. */
async function fetchElectionRowsLimited(
  supabase: ReturnType<typeof getSupabaseServer>,
  timeoutMs: number,
): Promise<
  {
    id: string;
    title: string;
    description: string | null;
    status: string;
    is_open: boolean | null;
    election_date: string | null;
    start_time: string | null;
    end_time: string | null;
    created_at: string | null;
  }[]
> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ELECTIONS_DB_TIMEOUT")), timeoutMs);
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("elections")
          .select("id, title, description, status, is_open, election_date, start_time, end_time, created_at")
          .order("election_date", { ascending: false });
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(data ?? []);
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    })();
  });
}

async function fetchCountsBestEffort(
  supabase: ReturnType<typeof getSupabaseServer>,
  electionIds: string[],
): Promise<CountMap> {
  try {
    let m = await fetchCountsAggregated(supabase, electionIds);
    if (!m) {
      m = await fetchCountsLegacy(supabase, electionIds);
    }
    return m;
  } catch {
    return emptyCountsMap(electionIds);
  }
}

/**
 * Ballots implied by anonymous rows (min count per configured position).
 * Overrides RPC `voted_count` when DB still uses assignment flags — keeps public cards aligned with results.
 */
async function ledgerBallotCountForElection(
  supabase: ReturnType<typeof getSupabaseServer>,
  electionId: string,
): Promise<number> {
  const { data: posRows, error: posErr } = await supabase
    .from("election_positions")
    .select("id")
    .eq("election_id", electionId);
  if (posErr) throw posErr;
  if (!posRows?.length) return 0;
  const counts = await Promise.all(
    posRows.map(async (p: { id: string }) => {
      const { count, error } = await supabase
        .from("election_votes")
        .select("*", { count: "exact", head: true })
        .eq("election_id", electionId)
        .eq("position_id", p.id);
      if (error) throw error;
      return count ?? 0;
    }),
  );
  return Math.min(...counts);
}

async function overrideVotedCountsFromLedger(
  supabase: ReturnType<typeof getSupabaseServer>,
  electionIds: string[],
  countsMap: CountMap,
): Promise<void> {
  const chunkSize = 6;
  for (let i = 0; i < electionIds.length; i += chunkSize) {
    const chunk = electionIds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        const row = countsMap.get(id);
        if (!row) return;
        try {
          row.voted_count = await ledgerBallotCountForElection(supabase, id);
        } catch {
          /* leave RPC / legacy value */
        }
      }),
    );
  }
}

/** Prefer DB-side aggregation (see spe-ui-admin migrations/election_list_counts_rpc.sql). */
async function fetchCountsAggregated(
  supabase: ReturnType<typeof getSupabaseServer>,
  electionIds: string[],
): Promise<Map<string, Omit<CountRow, "election_id">> | null> {
  const { data, error } = await supabase.rpc("get_election_list_counts");
  if (error || !Array.isArray(data)) {
    return null;
  }
  const idSet = new Set(electionIds);
  const map = new Map<string, Omit<CountRow, "election_id">>();
  for (const row of data as CountRow[]) {
    if (!idSet.has(row.election_id)) continue;
    map.set(row.election_id, {
      positions_count: Number(row.positions_count),
      candidates_count: Number(row.candidates_count),
      voters_count: Number(row.voters_count),
      voted_count: Number(row.voted_count),
    });
  }
  return map;
}

/**
 * Fallback when `get_election_list_counts` RPC is missing.
 * Uses `{ count: 'exact', head: true }` per election (no row payloads), chunked to avoid bursting Supabase.
 */
async function fetchCountsLegacy(
  supabase: ReturnType<typeof getSupabaseServer>,
  electionIds: string[],
): Promise<Map<string, Omit<CountRow, "election_id">>> {
  const map = new Map<string, Omit<CountRow, "election_id">>();
  for (const id of electionIds) {
    map.set(id, {
      positions_count: 0,
      candidates_count: 0,
      voters_count: 0,
      voted_count: 0,
    });
  }

  const chunkSize = 8;
  for (let i = 0; i < electionIds.length; i += chunkSize) {
    const chunk = electionIds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.flatMap((id) => {
        const row = map.get(id)!;
        return [
          (async () => {
            const { count, error } = await supabase
              .from("election_positions")
              .select("*", { count: "exact", head: true })
              .eq("election_id", id);
            if (error) throw error;
            row.positions_count = count ?? 0;
          })(),
          (async () => {
            const { count, error } = await supabase
              .from("election_candidates")
              .select("*", { count: "exact", head: true })
              .eq("election_id", id);
            if (error) throw error;
            row.candidates_count = count ?? 0;
          })(),
          (async () => {
            const { count, error } = await supabase
              .from("election_voter_assignments")
              .select("*", { count: "exact", head: true })
              .eq("election_id", id);
            if (error) throw error;
            row.voters_count = count ?? 0;
          })(),
          (async () => {
            row.voted_count = await ledgerBallotCountForElection(supabase, id);
          })(),
        ];
      }),
    );
  }

  return map;
}

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    // Supabase logs showed REST upstream timeouts ~90s under load; 15s guaranteed false failures.
    const ELECTIONS_FETCH_MS = 120_000;
    let elections = await fetchElectionRowsLimited(supabase, ELECTIONS_FETCH_MS).catch((e) => {
      if (e instanceof Error && e.message === "ELECTIONS_DB_TIMEOUT") return null;
      throw e;
    });
    if (elections === null) {
      await new Promise((r) => setTimeout(r, 1500));
      elections = await fetchElectionRowsLimited(supabase, ELECTIONS_FETCH_MS);
    }

    if (!elections?.length) {
      return NextResponse.json([], {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const electionIds = elections.map((e) => e.id);

    const fallbackMap = emptyCountsMap(electionIds);
    const countsMap = await raceMs(
      fetchCountsBestEffort(supabase, electionIds),
      25_000,
      fallbackMap,
    );

    await raceMs(overrideVotedCountsFromLedger(supabase, electionIds, countsMap), 22_000, undefined);

    const result = elections
      .map((e) => {
        const c = countsMap.get(e.id) ?? {
          positions_count: 0,
          candidates_count: 0,
          voters_count: 0,
          voted_count: 0,
        };
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          status: computeElectionStatus(e),
          is_open: e.is_open ?? false,
          election_date: e.election_date,
          start_time: e.start_time,
          end_time: e.end_time,
          positions_count: c.positions_count,
          candidates_count: c.candidates_count,
          voters_count: c.voters_count,
          voted_count: c.voted_count,
        };
      })
      .filter((e) => !(e.status === "Draft" && !e.is_open));

    const statusOrder: Record<string, number> = { Live: 0, Upcoming: 1, Completed: 2 };
    result.sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch elections";
    if (message === "ELECTIONS_DB_TIMEOUT") {
      return NextResponse.json(
        {
          error:
            "The elections database did not respond in time. Please wait a few seconds and refresh the page.",
        },
        { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
