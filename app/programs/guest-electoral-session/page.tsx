"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IconChecklist, IconCalendar, IconClock, IconUsers, IconChevronRight, IconLoader2 } from "@tabler/icons-react";
import { computeElectionTimeTag } from "@/lib/election-status";

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: string;
  is_open: boolean;
  election_date: string | null;
  start_time: string | null;
  end_time: string | null;
  positions_count: number;
  candidates_count: number;
  voters_count: number;
  voted_count: number;
}

const TAG_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  Live: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Live" },
  Upcoming: { bg: "bg-amber-50", text: "text-amber-700", label: "Upcoming" },
};

function formatDateNice(dateStr: string | null | undefined) {
  if (!dateStr || typeof dateStr !== "string") return "Date TBA";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function GuestElectoralSessionPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const LIST_REFRESH_MS = 30_000;
  const INITIAL_FETCH_MS = 60_000;

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const deadline = setTimeout(() => ac.abort(), INITIAL_FETCH_MS);

    async function initialLoad() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/guest/elections", {
          signal: ac.signal,
          cache: "no-store",
        });
        const data: unknown = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          const msg =
            data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : `Request failed (${res.status})`;
          throw new Error(msg);
        }
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from server.");
        }
        setElections(data as Election[]);
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        const msg =
          typeof e === "object" &&
            e !== null &&
            "name" in e &&
            (e as { name: string }).name === "AbortError"
            ? "Could not load elections in time. Check your connection and try again."
            : e instanceof Error
              ? e.message
              : "Failed to load guest elections.";
        setLoadError(msg);
      } finally {
        clearTimeout(deadline);
        if (!cancelled) setLoading(false);
      }
    }

    initialLoad();
    return () => {
      cancelled = true;
      ac.abort();
      clearTimeout(deadline);
    };
  }, [retryKey]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/guest/elections", { cache: "no-store" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (Array.isArray(data)) setElections(data as Election[]);
      } catch {
        /* keep last good payload */
      }
    }, LIST_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const ongoing = elections.filter((e) => computeElectionTimeTag(e) === "Live");
  const upcoming = elections.filter((e) => computeElectionTimeTag(e) === "Upcoming");
  const completed = elections.filter((e) => e.status === "Completed");

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Page Header */}
          <div className="mb-16 md:mb-24 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex items-center gap-3.5"
            >
              <Image
                src="/speui.png"
                alt="SPE UI"
                width={36}
                height={28}
                className="h-7 w-auto object-contain"
              />
              <span className="text-gray-300 text-xs font-light select-none">/</span>
              <Image
                src="/afas-logo.jpg"
                alt="AFAS"
                width={32}
                height={32}
                className="h-7 w-7 object-contain rounded-full"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-800">
                  SPE UI x AFAS
                </span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-500 font-medium">
                  Faculty of Arts
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[38px] font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-6xl lg:text-[72px]"
            >
              Guest Voting,
              <br />
              Secure &amp; Direct.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-gray-500"
            >
              Electoral portal provided in collaboration with the Association of Faculty of Arts Students (AFAS), University of Ibadan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3.5 py-1.5"
            >
              <span className="text-xs font-medium text-gray-600">
                Official AFAS Electoral Portal
              </span>
            </motion.div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <IconLoader2 size={28} className="animate-spin text-blue-600" />
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-red-800">{loadError}</p>
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          ) : elections.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-semibold text-gray-400">No guest elections available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Live Elections */}
              {ongoing.length > 0 && (
                <section className="mb-16">
                  <div className="mb-6 flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Live Elections</h2>
                  </div>

                  <div className="space-y-4">
                    {ongoing.map((election, i) => (
                      <GuestElectionCard key={election.id} election={election} index={i} featured />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Elections */}
              {upcoming.length > 0 && (
                <section className="mb-16">
                  <h2 className="mb-6 text-lg font-bold text-gray-900">Upcoming Elections</h2>
                  <div className="space-y-4">
                    {upcoming.map((election, i) => (
                      <GuestElectionCard key={election.id} election={election} index={i + ongoing.length} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Elections */}
              {completed.length > 0 && (
                <section>
                  <h2 className="mb-6 text-lg font-bold text-gray-500">Completed Elections</h2>
                  <div className="space-y-4">
                    {completed.map((election, i) => (
                      <GuestElectionCard key={election.id} election={election} index={i + ongoing.length + upcoming.length} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function GuestElectionCard({
  election,
  index,
  featured = false,
}: {
  election: Election;
  index: number;
  featured?: boolean;
}) {
  const timeTag = computeElectionTimeTag(election);
  const config = timeTag ? TAG_CONFIG[timeTag] : null;
  const turnout = election.voters_count > 0 ? Math.round((election.voted_count / election.voters_count) * 100) : 0;
  const isClickable = election.is_open && timeTag === "Live";

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-3xl border bg-white p-6 sm:p-8 transition-all duration-300 ${
        featured ? "border-emerald-200" : "border-gray-100 hover:border-blue-100"
      } ${isClickable ? "cursor-pointer" : ""}`}
    >
      {/* Status */}
      <div className="mb-4 flex items-center justify-between">
        {config ? (
          <div className={`flex items-center rounded-full px-3 py-1 text-xs font-bold ${config.bg} ${config.text}`}>
            {config.label}
          </div>
        ) : <div />}
        {isClickable && (
          <IconChevronRight size={20} className="text-gray-300 transition-all group-hover:text-blue-600 group-hover:translate-x-1" />
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">{election.title}</h3>
      {election.description && (
        <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500 line-clamp-2">{election.description}</p>
      )}

      {/* Meta */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
          <IconCalendar size={15} />
          {formatDateNice(election.election_date)}
        </div>
        <span className="flex items-center gap-1.5 font-medium text-sm text-gray-500">
          <IconClock size={15} />
          {election.start_time && election.end_time
            ? `${election.start_time.slice(0, 5)} - ${election.end_time.slice(0, 5)}`
            : "Time TBA"}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-sm text-gray-500">
          <IconUsers size={15} />
          <span>{election.positions_count} positions · {election.candidates_count} candidates</span>
        </span>
      </div>

      {/* Turnout */}
      {(timeTag === "Live" || election.status === "Completed") && (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {election.status === "Completed" ? "Final Turnout" : "Live Turnout"}
            </span>
            <span className="text-xs font-bold text-gray-500">
              {election.voted_count}/{election.voters_count} ({turnout}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className={`h-full rounded-full ${
                election.status === "Completed" ? "bg-gray-300" : "bg-emerald-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${turnout}%` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Action */}
      {timeTag === "Live" && election.is_open && (
        <div className="mt-6 flex items-center gap-3">
          <span className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all group-hover:bg-blue-700">
            Cast Your Vote
          </span>
        </div>
      )}

      {!election.is_open && timeTag !== null && (
        <div className="mt-6 flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-5 py-2.5">
            <IconClock size={14} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Awaiting to open</span>
          </div>
        </div>
      )}
    </motion.div>
  );

  if (isClickable) {
    return (
      <Link href={`/programs/guest-electoral-session/${election.id}/auth`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
