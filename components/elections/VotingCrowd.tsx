"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlockCharacter from "./BlockCharacter";

/* ──────────────────────────────────────────────────────────────
   Voting Crowd Sidebar - a live activity panel showing:
   1. An animated ballot box scene (character walks up, drops ballot)
   2. A scrolling list of recent voters with names + block avatars

   Polls /api/elections/[id]/live-voters on an interval for real data.
   ────────────────────────────────────────────────────────────── */

interface Voter {
  id: string;
  seed: number;
  name: string;
  time: string;
}

interface VotingCrowdProps {
  electionId: string;
  apiEndpoint?: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatVotedAt(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/* ── Ballot Box Scene ── */
function BallotBoxScene({ activeSeed }: { activeSeed: number | null }) {
  return (
    <div className="relative flex items-end justify-center h-[120px] overflow-hidden">
      {/* Ballot box */}
      <svg width="64" height="72" viewBox="0 0 64 72" fill="none" className="relative z-10">
        {/* Box body */}
        <rect x="4" y="24" width="56" height="44" rx="4" fill="#3B82F6" />
        <rect x="4" y="24" width="56" height="44" rx="4" stroke="#2563EB" strokeWidth="2" />
        {/* Slot */}
        <rect x="18" y="20" width="28" height="8" rx="2" fill="#1E40AF" />
        <rect x="22" y="23" width="20" height="3" rx="1" fill="#0F172A" />
        {/* Label */}
        <text x="32" y="52" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui">BALLOT</text>
        <text x="32" y="62" textAnchor="middle" fill="#93C5FD" fontSize="7" fontWeight="600" fontFamily="system-ui">BOX</text>
      </svg>

      {/* Animated voter character approaching from left */}
      <AnimatePresence mode="wait">
        {activeSeed !== null && (
          <motion.div
            key={activeSeed}
            className="absolute bottom-0 z-20"
            initial={{ x: -60, opacity: 0 }}
            animate={{
              x: [-60, -8, -8, -8],
              opacity: [0, 1, 1, 0],
              y: [0, 0, -4, 0],
            }}
            transition={{
              duration: 2.4,
              times: [0, 0.35, 0.6, 1],
              ease: "easeInOut",
            }}
          >
            <BlockCharacter seed={activeSeed} size={40} animate={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paper dropping into box */}
      <AnimatePresence mode="wait">
        {activeSeed !== null && (
          <motion.div
            key={`paper-${activeSeed}`}
            className="absolute z-30"
            style={{ left: "calc(50% - 6px)", top: 8 }}
            initial={{ opacity: 0, y: -10, rotate: -15 }}
            animate={{
              opacity: [0, 0, 1, 1, 0],
              y: [-10, -10, 0, 14, 14],
              rotate: [-15, -15, 5, 0, 0],
            }}
            transition={{
              duration: 2.4,
              times: [0, 0.4, 0.55, 0.7, 0.85],
              ease: "easeInOut",
            }}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
              <rect x="0" y="0" width="12" height="16" rx="1" fill="white" stroke="#CBD5E1" strokeWidth="0.5" />
              <line x1="2" y1="4" x2="10" y2="4" stroke="#CBD5E1" strokeWidth="0.8" />
              <line x1="2" y1="7" x2="10" y2="7" stroke="#CBD5E1" strokeWidth="0.8" />
              <line x1="2" y1="10" x2="7" y2="10" stroke="#CBD5E1" strokeWidth="0.8" />
              <path d="M3 12 L5 14 L9 10" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle effect on ballot insert */}
      <AnimatePresence>
        {activeSeed !== null && (
          <motion.div
            key={`sparkle-${activeSeed}`}
            className="absolute z-20"
            style={{ left: "calc(50% - 16px)", top: 12 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0, 1, 0], scale: [0, 0, 1.2, 0] }}
            transition={{ duration: 2.4, times: [0, 0.6, 0.72, 0.9] }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="2" fill="#FBBF24" />
              <circle cx="8" cy="12" r="1.5" fill="#FBBF24" opacity="0.7" />
              <circle cx="24" cy="10" r="1.5" fill="#FBBF24" opacity="0.7" />
              <circle cx="20" cy="22" r="1" fill="#FBBF24" opacity="0.5" />
              <circle cx="10" cy="20" r="1" fill="#FBBF24" opacity="0.5" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */
export default function VotingCrowd({ electionId, apiEndpoint }: VotingCrowdProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [totalVoted, setTotalVoted] = useState(0);
  const [activeSeed, setActiveSeed] = useState<number | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const listRef = useRef<HTMLDivElement>(null);

  const endpoint = apiEndpoint || `/api/elections/${electionId}/live-voters`;

  const fetchVoters = useCallback(async () => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = await res.json();

      setTotalVoted(data.total_voted || 0);

      const incoming: Voter[] = (data.recent_voters || []).map((v: { voter_id: string; name: string; voted_at: string | null }) => ({
        id: v.voter_id,
        seed: hashString(v.voter_id),
        name: v.name,
        time: formatVotedAt(v.voted_at),
      }));

      // On first load, just set voters
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        incoming.forEach((v) => knownIds.current.add(v.id));
        setVoters(incoming);
        return;
      }

      // Find new voters we haven't seen before
      const newVoters = incoming.filter((v) => !knownIds.current.has(v.id));
      incoming.forEach((v) => knownIds.current.add(v.id));

      if (newVoters.length > 0) {
        // Animate the most recent new voter dropping ballot
        setActiveSeed(newVoters[0].seed);
        setTimeout(() => setActiveSeed(null), 2600);
      }

      // Always update list with incoming data so privacy/name toggle changes reflect immediately
      setVoters(incoming);
    } catch {
      // Silently ignore polling errors
    }
  }, [endpoint]);

  // Initial fetch + poll (gentle interval — each open vote page hits Supabase)
  useEffect(() => {
    fetchVoters();
    const interval = setInterval(fetchVoters, 30_000);
    return () => clearInterval(interval);
  }, [fetchVoters]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Live Activity
          </span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 tabular-nums">
          {totalVoted} voted
        </span>
      </div>

      {/* Ballot box animation scene */}
      <div className="px-3 border-b border-gray-50">
        <BallotBoxScene activeSeed={activeSeed} />
      </div>

      {/* Voter list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 min-h-0"
      >
        <AnimatePresence initial={false}>
          {voters.map((v) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50/80 transition-colors"
            >
              <div className="shrink-0">
                <BlockCharacter seed={v.seed} size={32} animate={false} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 truncate">
                  {v.name}
                </p>
                <p className="text-[10px] font-semibold text-gray-400">
                  Voted at {v.time}
                </p>
              </div>
              <div className="shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="#DCFCE7" />
                  <path d="M4 7 L6 9 L10 5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
