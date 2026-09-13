"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconArrowRight, IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import ShowdownCharacter from "@/components/ShowdownCharacter";

function PinEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPin = searchParams.get("pin") || "";

  const [pin, setPin] = useState(initialPin);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialPin && initialPin.length === 6) {
      router.push(`/showdown/${initialPin}`);
    }
  }, [initialPin, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanPin = pin.trim().replace(/\s+/g, "");
    if (!cleanPin) {
      setError("Please enter a 6-digit Game PIN.");
      return;
    }
    if (cleanPin.length < 6) {
      setError("PIN must be 6 digits.");
      return;
    }

    router.push(`/showdown/${cleanPin}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-gray-900 flex flex-col p-4 sm:p-6 select-none font-sans">
      {/* Top Header with Back Button and Host Link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4">
        <Link
          href="/programs/resources"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>Back to Resources</span>
        </Link>
        <Link
          href="/showdown/host"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
        >
          <span>Host / Create Game</span>
        </Link>
      </div>

      {/* Main Form Center */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center"
        >
          {/* Mascot */}
          <div className="mb-6">
            <ShowdownCharacter mood="waving" size={100} />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mb-1">
            SPE Showdown
          </h1>
          <p className="text-xs text-gray-400 font-medium mb-8">
            Enter the 6-digit PIN on the host screen
          </p>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4"
          >
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                GAME PIN
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000 000"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center text-2xl font-black font-mono tracking-widest text-gray-950 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                autoFocus
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={pin.length < 4}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Enter Arena
                <IconArrowRight size={14} />
              </button>

              <Link
                href="/showdown/host"
                className="w-full py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Host or Create a Quiz
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ShowdownPinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
          <IconLoader2 size={32} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <PinEntryContent />
    </Suspense>
  );
}
