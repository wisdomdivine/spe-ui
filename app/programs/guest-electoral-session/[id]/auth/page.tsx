"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconChecklist,
  IconFingerprint,
  IconMail,
  IconHash,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconLock,
} from "@tabler/icons-react";

export default function GuestElectionAuthPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params?.id as string;

  const [electionTitle, setElectionTitle] = useState("");
  const [voterAuthType, setVoterAuthType] = useState<"matric" | "email">("matric");
  const [step, setStep] = useState<"identify" | "otp">("identify");
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [pendingVoter, setPendingVoter] = useState<{ voter_id: string; voter_name: string; matric_number?: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
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

  // Fetch election details
  useEffect(() => {
    fetch(`/api/guest/elections/${electionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.election?.title) setElectionTitle(data.election.title);
        if (data.election?.voter_auth_type) setVoterAuthType(data.election.voter_auth_type);
      })
      .catch(() => {});
  }, [electionId]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Validate identifier against guest API
  const handleIdentify = async () => {
    const val = matric.trim();
    if (!val) {
      setError(voterAuthType === "email" ? "Enter your email address." : "Enter your matric number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/guest/elections/${electionId}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matric_number: val,
          email: val,
          identifier: val,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }

      setPendingVoter({
        voter_id: data.voter_id,
        voter_name: data.voter_name,
        matric_number: data.matric_number || val,
      });

      if (data.otp_sent && data.masked_email) {
        setMaskedEmail(data.masked_email);
        setEmail(data.masked_email);
        setStep("otp");
        setResendCooldown(60);
      } else {
        sessionStorage.setItem(voterStorageKey, JSON.stringify({
          voter_id: data.voter_id,
          voter_name: data.voter_name,
          matric_number: data.matric_number || val,
        }));
        router.replace(`/programs/guest-electoral-session/${electionId}/vote`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`guest-otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`guest-otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    if (!pendingVoter) { setError("Session expired. Please start over."); setStep("identify"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/guest/elections/${electionId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: pendingVoter.voter_id, otp_code: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }

      // OTP verified - now save voter to sessionStorage
      sessionStorage.setItem(voterStorageKey, JSON.stringify(pendingVoter));

      // Redirect to voting booth
      router.replace(`/programs/guest-electoral-session/${electionId}/vote`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !matric.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/guest/elections/${electionId}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matric_number: matric.trim(),
          email: matric.trim(),
          identifier: matric.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not resend code.");
      } else {
        setResendCooldown(60);
      }
    } catch {
      setError("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow flex items-center justify-center pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="w-full max-w-md px-6">
          {/* Back link */}
          <Link
            href="/programs/guest-electoral-session"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors"
          >
            <IconArrowLeft size={16} /> Back to Guest Elections
          </Link>

          {/* Collaboration Lockup */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <Image
              src="/speui.png"
              alt="SPE UI"
              width={32}
              height={24}
              className="h-6 w-auto object-contain"
            />
            <span className="text-gray-300 text-xs font-light select-none">/</span>
            <Image
              src="/afas-logo.jpg"
              alt="AFAS"
              width={26}
              height={26}
              className="h-6 w-6 object-contain rounded-full"
            />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-700">
              SPE UI x AFAS
            </span>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50"
          >
            {/* Header stripe */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <IconChecklist size={20} />
                </div>
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-blue-200">AFAS Voter Verification</span>
              </div>
              <h1 className="text-xl font-bold">{electionTitle || "Loading..."}</h1>
              <p className="mt-1.5 text-sm font-medium text-blue-200">Verify your identity to access the voting booth.</p>
            </div>

            {/* Body */}
            <div className="px-8 py-8">
              <AnimatePresence mode="wait">
                {step === "identify" && (
                  <motion.div
                    key="identify"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-black">1</span>
                        <h2 className="text-sm font-bold text-gray-900">Identify Yourself</h2>
                      </div>
                      <p className="text-xs font-medium text-gray-400 ml-8">
                        {voterAuthType === "email"
                          ? "Enter your accredited email address to receive a one-time code."
                          : "Enter your matric number to receive a one-time code."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {voterAuthType === "email" ? "Accredited Email Address" : "Matric Number"}
                        </label>
                        <div className="relative">
                          {voterAuthType === "email" ? (
                            <IconMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          ) : (
                            <IconHash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          )}
                          <input
                            type={voterAuthType === "email" ? "email" : "text"}
                            value={matric}
                            onChange={(e) => { setMatric(e.target.value); setError(""); }}
                            placeholder={voterAuthType === "email" ? "e.g. voter@student.ui.edu.ng" : "e.g. 220301"}
                            className="w-full rounded-xl border border-gray-200 py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            onKeyDown={(e) => e.key === "Enter" && handleIdentify()}
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                          <IconAlertCircle size={14} /> {error}
                        </div>
                      )}

                      <button
                        onClick={handleIdentify}
                        disabled={!matric.trim() || loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <IconLoader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <IconMail size={16} /> Send Verification Code
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-black">2</span>
                        <h2 className="text-sm font-bold text-gray-900">Enter Verification Code</h2>
                      </div>
                      <p className="text-xs font-medium text-gray-400 ml-8">
                        We sent a 6-digit code to{" "}
                        <button onClick={() => setShowEmail(!showEmail)} className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                          {showEmail ? email : maskedEmail}
                          {showEmail ? <IconEyeOff size={11} /> : <IconEye size={11} />}
                        </button>
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* OTP inputs */}
                      <div className="flex justify-center gap-2.5">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`guest-otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/, ""))}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`h-14 w-12 rounded-xl border text-center text-xl font-black outline-none transition-all ${
                              digit
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-900"
                            } focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                          />
                        ))}
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                          <IconAlertCircle size={14} /> {error}
                        </div>
                      )}

                      <button
                        onClick={handleVerify}
                        disabled={otp.join("").length < 6 || loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <IconLoader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <IconFingerprint size={16} /> Verify &amp; Enter Booth
                          </>
                        )}
                      </button>

                      {/* Resend + go back */}
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                        <button
                          onClick={() => { setStep("identify"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                          className="hover:text-gray-600 transition-colors"
                        >
                          ← Use different matric
                        </button>
                        <button className="hover:text-blue-600 transition-colors" onClick={handleResendOtp} disabled={resendCooldown > 0 || loading}>
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Trust footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-col items-center gap-3 text-center"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <IconShieldCheck size={13} className="text-emerald-500" /> Anonymous Voting
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <IconLock size={13} className="text-blue-500" /> Encrypted
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <IconCircleCheck size={13} className="text-amber-500" /> One-Time Vote
              </div>
            </div>
            <p className="text-[11px] text-gray-300 font-medium max-w-xs">
              Your identity is only used to verify eligibility. Your ballot is never linked to your account.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
