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
  const [selections, setSelections] = useState<Record<string, string>>({});
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
        if (progress.selections) setSelections(progress.selections);
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

  const allPositionsVoted = positions.length > 0 && positions.every((p) => !!selections[p.id]);

  const handleSelectCandidate = (candidateId: string) => {
    if (!activePosition) return;
    setSelections((prev) => ({
      ...prev,
      [activePosition.id]: candidateId,
    }));
  };

  const handleNext = () => {
    setExpandedManifesto(null);
    if (currentPosition < positions.length - 1) {
      setCurrentPosition((prev) => prev + 1);
    } else {
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
                {Object.values(selections).filter(Boolean).length}/{positions.length} selected
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
                      : selections[p.id]
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
                        const selectedId = selections[pos.id];
                        const cand = candidates.find((c) => c.id === selectedId);
                        const isNone = selectedId === NONE_OF_ABOVE_TOKEN;

                        return (
                          <div
                            key={pos.id}
                            className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50"
                          >
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                {pos.title}
                              </p>
                              <p className="text-sm font-bold text-gray-900 mt-0.5">
                                {isNone ? "Void" : cand ? cand.name : "Not selected"}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                selectedId ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                              }`}
                            >
                              {selectedId ? "Ready" : "Pending"}
                            </span>
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
                      <p className="mt-3 text-xs font-semibold text-gray-400">Select one candidate:</p>
                    </div>

                    {/* Candidates */}
                    <div className="space-y-3">
                      {activeCandidates.map((cand, ci) => {
                        const isSelected = selections[activePosition.id] === cand.id;
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
                                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                            }`}
                          >
                            {/* Main row */}
                            <button
                              type="button"
                              onClick={() => handleSelectCandidate(cand.id)}
                              className="flex w-full items-center gap-4 p-5 text-left cursor-pointer"
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

                              {/* Check circle */}
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
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
                          selections[activePosition?.id] === NONE_OF_ABOVE_TOKEN
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
                            selections[activePosition?.id] === NONE_OF_ABOVE_TOKEN ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700"
                          }`}>
                            Ø
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-base font-bold ${selections[activePosition?.id] === NONE_OF_ABOVE_TOKEN ? "text-amber-700" : "text-gray-900"}`}>
                              Void
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                              Submit a blank preference for this position.
                            </p>
                          </div>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selections[activePosition?.id] === NONE_OF_ABOVE_TOKEN
                              ? "border-amber-500 bg-amber-500"
                              : "border-gray-200 bg-white"
                          }`}>
                            {selections[activePosition?.id] === NONE_OF_ABOVE_TOKEN && <IconCircleCheck size={16} className="text-white" />}
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
                        disabled={!selections[activePosition?.id]}
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
