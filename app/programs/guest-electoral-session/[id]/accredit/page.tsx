"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import {
  IconAlertCircle,
  IconArrowRight,
  IconCircleCheck,
  IconLoader2,
  IconShieldCheck,
} from "@tabler/icons-react";
import { GuestBranding, DEFAULT_GUEST_BRANDING } from "@/lib/guest-branding";

interface AccreditationResult {
  success: boolean;
  already_accredited?: boolean;
  accredited_at?: string;
  voter_name?: string;
  election_title?: string;
  election_status?: string;
  is_open?: boolean;
  error?: string;
}

function GuestAccreditContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const electionId = params?.id as string;
  const token = searchParams?.get("token") || "";

  const [branding, setBranding] = useState<GuestBranding>(DEFAULT_GUEST_BRANDING);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AccreditationResult | null>(null);

  useEffect(() => {
    fetch("/api/guest/branding", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setBranding(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!electionId || !token) {
      setResult({ success: false, error: "Invalid accreditation link. Token is missing." });
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/guest/elections/${electionId}/accredit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json().catch(() => ({}))) as AccreditationResult;
        if (!cancelled) {
          if (!res.ok) {
            setResult({ success: false, error: data.error || "Accreditation failed." });
          } else {
            setResult(data);
          }
        }
      } catch {
        if (!cancelled) {
          setResult({ success: false, error: "Network error. Please reload and try again." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [electionId, token]);

  const accent = branding.pdf_primary_color || "#2563eb";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black">
      <Header />
      <main className="flex flex-grow items-center justify-center px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-xl shadow-blue-50/70"
        >
          {branding.organization_name && (
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              {branding.organization_name}
            </p>
          )}
          {loading ? (
            <div className="py-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <IconLoader2 size={32} className="animate-spin" style={{ color: accent }} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Verifying Accreditation...</h1>
              <p className="text-sm font-medium text-gray-500">
                Please hold on while we confirm your voter accreditation.
              </p>
            </div>
          ) : result?.success ? (
            <div className="space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <IconCircleCheck size={36} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {result.already_accredited ? "Already Accredited" : "Accreditation Complete!"}
                </h1>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                  Hello <span className="font-bold text-gray-800">{result.voter_name || "Voter"}</span>, your accreditation for{" "}
                  <span className="font-bold text-gray-800">{result.election_title || "this election"}</span> is confirmed.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                <IconShieldCheck size={15} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  {result.is_open ? "Polls are open. You can vote now" : "You are cleared to vote once polls open"}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  href={result.is_open ? `/programs/guest-electoral-session/${electionId}/auth` : "/programs/guest-electoral-session"}
                  style={{ backgroundColor: accent }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-95"
                >
                  {result.is_open ? "Proceed to Voting Booth" : "Go to Guest Electoral Portal"}
                  <IconArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <IconAlertCircle size={36} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Accreditation Failed</h1>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                  {result?.error || "We could not verify this accreditation link."}
                </p>
              </div>
              <Link
                href="/programs/guest-electoral-session"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-gray-800"
              >
                Back to Guest Electoral Session
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function GuestElectionAccreditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFF]">
          <IconLoader2 size={32} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <GuestAccreditContent />
    </Suspense>
  );
}
