"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import VotingCrowd from "@/components/elections/VotingCrowd";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChecklist,
  IconCircleCheck,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconAlertCircle,
  IconLoader2,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";

interface Candidate {
  id: string;
  position_id: string;
  name: string;
  matric_number: string | null;
  image_url: string | null;
  bio: string | null;
  manifesto?: string | null;
}

interface Position {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  allow_multiple?: boolean;
  min_selections?: number;
  max_selections?: number;
}

function getPositionSelectionBounds(
  pos: { allow_multiple?: boolean; min_selections?: number; max_selections?: number },
  candidateCount: number
) {
  if (!pos.allow_multiple) return { allowMultiple: false, min: 1, max: 1 };
  const rawMax = Math.max(1, pos.max_selections ?? 2);
  const max = candidateCount > 0 ? Math.min(rawMax, candidateCount) : rawMax;
  const min = Math.min(Math.max(0, pos.min_selections ?? 1), max);
  return { allowMultiple: true, min, max };
}

function normalizeStoredSelections(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      result[k] = v.filter((x): x is string => typeof x === "string" && x.length > 0);
    } else if (typeof v === "string" && v.length > 0) {
      result[k] = [v];
    }
  }
  return result;
}

interface ElectionData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  is_open: boolean;
  election_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export default function GuestVotePage() {
  const NONE_OF_ABOVE_TOKEN = "__NONE_OF_ABOVE__";
  const params = useParams();
  const router = useRouter();
  const electionId = params?.id as string;

  const [election, setElection] = useState<ElectionData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [voterId, setVoterId] = useState<string | null>(null);
  const [voterName, setVoterName] = useState<string | null>(null);

  const [currentPosition, setCurrentPosition] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [showReview, setShowReview] = useState(false);
  const [expandedManifesto, setExpandedManifesto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const voterStorageKey = `guest_voter_${electionId}`;
  const ballotStorageKey = `guest_vote_progress_${electionId}`;

  const fetchElection = async () => {
    setPageLoading(true);
    try {
      const r = await fetch(`/api/guest/elections/${electionId}`);
      const data = await r.json();
      if (data.error) {
        setPageError(data.error);
        return;
      }
      setElection(data.election);
      setPositions(data.positions || []);
      setCandidates(data.candidates || []);
    } catch {
      setPageError("Failed to load guest election data.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(voterStorageKey);
    if (!stored) {
      router.push(`/programs/guest-electoral-session/${electionId}/auth`);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setVoterId(parsed.voter_id);
      setVoterName(parsed.voter_name);
    } catch {
      router.push(`/programs/guest-electoral-session/${electionId}/auth`);
      return;
    }

    const progressRaw = sessionStorage.getItem(ballotStorageKey);
    if (progressRaw) {
      try {
        const progress = JSON.parse(progressRaw);
        if (progress.selections) setSelections(normalizeStoredSelections(progress.selections));
        if (typeof progress.currentPosition === "number") setCurrentPosition(progress.currentPosition);
      } catch {}
    }

    fetchElection();
  }, [electionId]);

  // Persist voting progress
  useEffect(() => {
    if (!voterId) return;
    sessionStorage.setItem(
      ballotStorageKey,
      JSON.stringify({
        currentPosition,
        selections,
        showReview,
      })
    );
  }, [ballotStorageKey, currentPosition, selections, showReview, voterId]);

  const activePosition = positions[currentPosition];
  const activeCandidates = useMemo(() => {
    if (!activePosition) return [];
    return candidates.filter((c) => c.position_id === activePosition.id);
  }, [activePosition, candidates]);

  const activeSelectedIds = activePosition ? (selections[activePosition.id] || []) : [];
  const activeBounds = activePosition
    ? getPositionSelectionBounds(activePosition, activeCandidates.length)
    : { allowMultiple: false, min: 1, max: 1 };
  const isActiveVoidSelected = activeSelectedIds.includes(NONE_OF_ABOVE_TOKEN);
  const activeSelectedCount = isActiveVoidSelected ? 0 : activeSelectedIds.length;

  const isPositionValid = (pos: Position) => {
    const arr = selections[pos.id] || [];
    if (arr.includes(NONE_OF_ABOVE_TOKEN)) return arr.length === 1;
    const posCandCount = candidates.filter((c) => c.position_id === pos.id).length;
    const b = getPositionSelectionBounds(pos, posCandCount);
    if (!b.allowMultiple) return arr.length === 1;
    return arr.length >= b.min && arr.length <= b.max;
  };

  const isActiveValid = activePosition ? isPositionValid(activePosition) : false;
  const completedCount = positions.filter((p) => isPositionValid(p)).length;
  const allPositionsVoted = positions.length > 0 && completedCount === positions.length;

  const handleSelectCandidate = (candidateId: string) => {
    if (!activePosition) return;
    const bounds = getPositionSelectionBounds(activePosition, activeCandidates.length);
    setSelections((prev) => {
      const curr = prev[activePosition.id] || [];
      if (candidateId === NONE_OF_ABOVE_TOKEN) {
        const alreadyVoid = curr.includes(NONE_OF_ABOVE_TOKEN);
        return { ...prev, [activePosition.id]: alreadyVoid ? [] : [NONE_OF_ABOVE_TOKEN] };
      }
      if (!bounds.allowMultiple) {
        const already = curr.length === 1 && curr[0] === candidateId;
        return { ...prev, [activePosition.id]: already ? [] : [candidateId] };
      }
      const withoutVoid = curr.filter((id) => id !== NONE_OF_ABOVE_TOKEN);
      if (withoutVoid.includes(candidateId)) {
        return { ...prev, [activePosition.id]: withoutVoid.filter((id) => id !== candidateId) };
      }
      if (withoutVoid.length >= bounds.max) {
        return prev;
      }
      return { ...prev, [activePosition.id]: [...withoutVoid, candidateId] };
    });
  };

  const handleNext = () => {
    if (!isActiveValid) return;
    setExpandedManifesto(null);
    if (currentPosition < positions.length - 1) {
      setCurrentPosition((prev) => prev + 1);
    } else if (allPositionsVoted) {
      setShowReview(true);
    }
  };

  const handlePrev = () => {
    setExpandedManifesto(null);
    if (showReview) {
      setShowReview(false);
    } else if (currentPosition > 0) {
      setCurrentPosition((prev) => prev - 1);
    }
  };

  const handleSubmitBallot = async () => {
    if (!voterId || !allPositionsVoted) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/guest/elections/${electionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter_id: voterId,
          votes: selections,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit ballot.");
        setSubmitting(false);
        return;
      }

      sessionStorage.removeItem(voterStorageKey);
      sessionStorage.removeItem(ballotStorageKey);
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-28">
          <IconLoader2 size={32} className="animate-spin text-blue-600" />
        </main>
      </div>
    );
  }

  if (pageError || !election) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-28 px-6">
          <div className="rounded-3xl border border-red-100 bg-white p-8 max-w-md text-center">
            <IconAlertCircle size={36} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Notice</h2>
            <p className="text-sm text-gray-500 mb-6">{pageError || "Election unavailable."}</p>
            <Link
              href="/programs/guest-electoral-session"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              <IconArrowLeft size={16} /> Back to Guest Elections
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-28 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-gray-100 bg-white p-8 md:p-12 max-w-lg text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <IconCircleCheck size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ballot Cast Successfully</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Thank you{voterName ? `, ${voterName}` : ""}. Your vote has been recorded securely and anonymously for {election.title}.
            </p>
            <Link
              href="/programs/guest-electoral-session"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Return to Guest Electoral Session
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/programs/guest-electoral-session"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors"
            >
              <IconArrowLeft size={16} /> Exit
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <IconShieldCheck size={13} className="text-emerald-500" /> Anonymous Voting
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Position {currentPosition + 1} of {positions.length}
              </span>
              <span className="text-xs font-bold text-gray-400">
                {completedCount}/{positions.length} completed
              </span>
            </div>
            <div className="flex gap-1.5">
              {positions.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setCurrentPosition(i); setExpandedManifesto(null); }}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i === currentPosition
                      ? "bg-blue-600"
                      : isPositionValid(p)
                        ? "bg-emerald-400"
                        : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Ballot Area */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {showReview ? (
                  /* Review Screen */
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <IconLock size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Confirm Your Choices</h2>
                        <p className="text-xs text-gray-500 font-medium">
                          Please verify your choices before final submission. This action cannot be undone.
                        </p>
                      </div>
                    </div>

                    {submitError && (
                      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                        <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="space-y-4 mb-8">
                      {positions.map((pos) => {
                        const chosenIds = selections[pos.id] || [];
                        const isNone = chosenIds.includes(NONE_OF_ABOVE_TOKEN);
                        const chosenCands = isNone
                          ? []
                          : chosenIds
                              .map((cid) => candidates.find((c) => c.id === cid))
                              .filter((c): c is Candidate => Boolean(c));
                        const valid = isPositionValid(pos);

                        return (
                          <div
                            key={pos.id}
                            className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                  {pos.title}
                                </p>
                                {pos.allow_multiple && !isNone && chosenCands.length > 0 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                    {chosenCands.length} selected
                                  </span>
                                )}
                              </div>
                              {isNone ? (
                                <p className="text-sm font-bold text-amber-700 mt-0.5">Void</p>
                              ) : chosenCands.length === 0 ? (
                                <p className="text-sm font-semibold text-gray-400 mt-0.5">
                                  {valid ? "No selection (Optional)" : "Not selected"}
                                </p>
                              ) : chosenCands.length === 1 ? (
                                <p className="text-sm font-bold text-gray-900 mt-0.5">{chosenCands[0].name}</p>
                              ) : (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {chosenCands.map((c) => (
                                    <span
                                      key={c.id}
                                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-blue-100 px-2.5 py-1 text-xs font-bold text-gray-900"
                                    >
                                      <IconCircleCheck size={13} className="text-blue-600 shrink-0" />
                                      {c.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = positions.findIndex((p) => p.id === pos.id);
                                  setCurrentPosition(idx);
                                  setShowReview(false);
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                              >
                                Change
                              </button>
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  valid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                }`}
                              >
                                {valid ? "Ready" : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <IconChevronLeft size={18} /> Modify
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitBallot}
                        disabled={submitting || !allPositionsVoted}
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <IconLoader2 size={18} className="animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            <IconChecklist size={18} /> Submit Ballot
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Position Candidate Selection */
                  <motion.div
                    key={activePosition?.id || currentPosition}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Position header */}
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{activePosition?.title}</h1>
                      {activePosition?.description && (
                        <p className="mt-2 text-sm font-medium text-gray-500">{activePosition.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-500">
                          {!activeBounds.allowMultiple
                            ? "Select one candidate:"
                            : activeBounds.min === activeBounds.max
                              ? `Select exactly ${activeBounds.min} candidate${activeBounds.min !== 1 ? "s" : ""}:`
                              : activeBounds.min === 0
                                ? `Select up to ${activeBounds.max} candidate${activeBounds.max !== 1 ? "s" : ""} (optional):`
                                : `Select between ${activeBounds.min} and ${activeBounds.max} candidates:`}
                        </p>
                        {activeBounds.allowMultiple && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              isActiveVoidSelected
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : isActiveValid
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : activeSelectedCount > 0
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isActiveVoidSelected
                              ? "Void selected"
                              : `${activeSelectedCount} / ${activeBounds.max} selected`}
                          </span>
                        )}
                      </div>
                      {activeBounds.allowMultiple && !isActiveVoidSelected && activeSelectedCount > 0 && activeSelectedCount < activeBounds.min && (
                        <p className="mt-1.5 text-xs font-semibold text-amber-600">
                          Select at least {activeBounds.min - activeSelectedCount} more candidate{activeBounds.min - activeSelectedCount !== 1 ? "s" : ""} to continue.
                        </p>
                      )}
                    </div>

                    {/* Candidates */}
                    <div className="space-y-3">
                      {activeCandidates.map((cand, ci) => {
                        const isSelected = activeSelectedIds.includes(cand.id);
                        const isAtMax = activeBounds.allowMultiple && !isSelected && !isActiveVoidSelected && activeSelectedCount >= activeBounds.max;
                        const isExpanded = expandedManifesto === cand.id;
                        const candBio = cand.manifesto || cand.bio;

                        return (
                          <motion.div
                            key={cand.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ci * 0.06 }}
                            className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100/50"
                                : isAtMax
                                  ? "border-gray-100 bg-white/70 opacity-60"
                                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                            }`}
                          >
                            {/* Main row */}
                            <button
                              type="button"
                              onClick={() => handleSelectCandidate(cand.id)}
                              disabled={isAtMax}
                              className="flex w-full items-center gap-4 p-5 text-left cursor-pointer disabled:cursor-not-allowed"
                            >
                              {/* Avatar */}
                              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black transition-colors ${
                                isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                              }`}>
                                {cand.image_url ? (
                                  <img
                                    src={cand.image_url}
                                    alt={cand.name}
                                    className="h-14 w-14 rounded-2xl object-cover"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  cand.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-base font-bold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                                  {cand.name}
                                </p>
                                {cand.matric_number && <p className="text-xs font-medium text-gray-400 mt-0.5">Matric: {cand.matric_number}</p>}
                              </div>

                              {/* Check indicator */}
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                                activeBounds.allowMultiple ? "rounded-lg" : "rounded-full"
                              } border-2 transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-600"
                                  : "border-gray-200 bg-white"
                              }`}>
                                {isSelected && <IconCircleCheck size={16} className="text-white" />}
                              </div>
                            </button>

                            {/* Candidate manifesto toggle */}
                            {candBio && (
                              <div className="px-5 pb-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedManifesto(isExpanded ? null : cand.id);
                                  }}
                                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 mb-2 cursor-pointer inline-flex items-center gap-1"
                                >
                                  {isExpanded ? "Hide manifesto ↑" : "View manifesto →"}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <p className="text-sm font-medium leading-relaxed text-gray-600 pb-3 border-t border-gray-100 pt-3 whitespace-pre-line">
                                        &ldquo;{candBio}&rdquo;
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}

                      {/* Void option */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                          isActiveVoidSelected
                            ? "border-amber-500 bg-amber-50/60 shadow-lg shadow-amber-100/60"
                            : "border-gray-100 bg-white hover:border-amber-200 hover:shadow-md"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCandidate(NONE_OF_ABOVE_TOKEN)}
                          className="flex w-full items-center gap-4 p-5 text-left cursor-pointer"
                        >
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black transition-colors ${
                            isActiveVoidSelected ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700"
                          }`}>
                            Ø
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-base font-bold ${isActiveVoidSelected ? "text-amber-700" : "text-gray-900"}`}>
                              Void
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                              {activeBounds.allowMultiple
                                ? "Submit a blank preference for this position (clears selected candidates)."
                                : "Submit a blank preference for this position."}
                            </p>
                          </div>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            isActiveVoidSelected
                              ? "border-amber-500 bg-amber-500"
                              : "border-gray-200 bg-white"
                          }`}>
                            {isActiveVoidSelected && <IconCircleCheck size={16} className="text-white" />}
                          </div>
                        </button>
                      </motion.div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentPosition === 0}
                        className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <IconChevronLeft size={18} /> Previous
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isActiveValid}
                        className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-lg disabled:opacity-40 disabled:shadow-none cursor-pointer ${
                          currentPosition === positions.length - 1 && allPositionsVoted
                            ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                            : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                        }`}
                      >
                        {currentPosition === positions.length - 1 ? (
                          <>Review Ballot <IconChecklist size={16} /></>
                        ) : (
                          <>Next <IconChevronRight size={18} /></>
                        )}
                      </button>
                    </div>

                    {/* Bottom trust badge */}
                    <div className="mt-8 flex justify-center">
                      <p className="text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
                        <IconLock size={12} className="text-gray-300" />
                        Your vote is encrypted and anonymous
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Voting Crowd Sidebar */}
            <div className="lg:col-span-1">
              <VotingCrowd
                electionId={electionId}
                apiEndpoint={`/api/guest/elections/${electionId}/live-voters`}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
