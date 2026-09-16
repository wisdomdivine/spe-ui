"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import {
  IconArrowLeft,
  IconFingerprint,
  IconLoader2,
  IconAlertCircle,
  IconChecklist,
} from "@tabler/icons-react";

export default function GuestElectionAuthPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params?.id as string;

  const [electionTitle, setElectionTitle] = useState("");
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const voterStorageKey = `guest_voter_${electionId}`;
  const ballotStorageKey = `guest_vote_progress_${electionId}`;

  useEffect(() => {
    const savedVoter = sessionStorage.getItem(voterStorageKey);
    if (savedVoter) {
      router.replace(`/programs/guest-electoral-session/${electionId}/vote`);
      return;
    }
    const savedProgress = sessionStorage.getItem(ballotStorageKey);
    if (savedProgress) {
      sessionStorage.removeItem(ballotStorageKey);
    }
  }, [ballotStorageKey, electionId, router, voterStorageKey]);

  useEffect(() => {
    fetch(`/api/guest/elections/${electionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.election?.title) setElectionTitle(data.election.title);
      })
      .catch(() => {});
  }, [electionId]);

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matric.trim()) {
      setError("Enter your matric number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/guest/elections/${electionId}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matric_number: matric.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        voterStorageKey,
        JSON.stringify({
          voter_id: data.voter.id,
          voter_name: data.voter.name,
          matric_number: data.voter.matric_number,
        })
      );

      router.replace(`/programs/guest-electoral-session/${electionId}/vote`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow flex items-center justify-center pt-28 pb-20 px-6">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/programs/guest-electoral-session"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-8"
          >
            <IconArrowLeft size={16} />
            Back to Guest Elections
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-gray-100 bg-white p-8 md:p-10"
          >
            {/* Header badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <IconFingerprint size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Guest Voter Authentication
                </span>
                <p className="text-xs text-gray-400 font-medium truncate max-w-[240px]">
                  {electionTitle || "Guest Election"}
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Identify Yourself</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Enter your assigned matric number to verify eligibility and access your ballot.
            </p>

            {error && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleIdentify} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Matric Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={matric}
                    onChange={(e) => setMatric(e.target.value.toUpperCase())}
                    placeholder="e.g. 210800"
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !matric.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <IconChecklist size={18} />
                    Continue to Ballot
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">
                Your ballot selections are recorded anonymously.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
