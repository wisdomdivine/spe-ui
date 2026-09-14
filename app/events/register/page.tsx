"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfettiSpaceBackground from "@/components/ConfettiSpaceBackground";
import Link from "next/link";
import { IconArrowRight, IconCalendarEvent, IconNotes, IconHome } from "@tabler/icons-react";

export default function EventRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#0A0A0A] text-white selection:bg-blue-600 selection:text-white">
      <Header isDark={true} />
      <ConfettiSpaceBackground />

      <main className="relative z-10 flex-grow flex items-center justify-center pt-28 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl w-full text-center flex flex-col items-center">

          {/* Morphing White Blob */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center mb-8 sm:mb-12"
          >
            {/* Ambient Background Aura */}
            <motion.div
              animate={{
                scale: [1, 1.15, 0.95, 1.1, 1],
                opacity: [0.25, 0.45, 0.3, 0.5, 0.25],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-56 h-56 sm:w-80 sm:h-80 md:w-[26rem] md:h-[26rem] lg:w-[30rem] lg:h-[30rem] rounded-full bg-white/20 blur-3xl pointer-events-none"
            />

            {/* Secondary Soft Morphing Aura Layer */}
            <motion.div
              animate={{
                borderRadius: [
                  "50% 60% 70% 40% / 50% 60% 30% 60%",
                  "60% 40% 30% 70% / 60% 30% 70% 40%",
                  "40% 60% 40% 60% / 60% 40% 60% 40%",
                  "70% 30% 50% 50% / 30% 70% 60% 40%",
                  "50% 60% 70% 40% / 50% 60% 30% 60%",
                ],
                rotate: [360, 270, 180, 90, 0],
                scale: [1.06, 0.96, 1.05, 0.98, 1.06],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-white/30 backdrop-blur-sm pointer-events-none"
            />

            {/* Primary Solid White Morphing Blob */}
            <motion.div
              animate={{
                borderRadius: [
                  "60% 40% 30% 70% / 60% 30% 70% 40%",
                  "50% 60% 70% 40% / 50% 60% 30% 60%",
                  "70% 30% 50% 50% / 30% 70% 60% 40%",
                  "40% 60% 40% 60% / 60% 40% 60% 40%",
                  "60% 40% 30% 70% / 60% 30% 70% 40%",
                ],
                rotate: [0, 90, 180, 270, 360],
                y: [0, -10, 0, 10, 0],
              }}
              transition={{
                borderRadius: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 22, repeat: Infinity, ease: "linear" },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative bg-white flex items-center justify-center select-none"
              style={{ width: "clamp(180px, 32vw, 340px)", height: "clamp(180px, 32vw, 340px)" }}
            />
          </motion.div>

          {/* Status Chip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/90 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 backdrop-blur-md"
          >
          </motion.div>

          {/* Big Text: Registrations Have Closed */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4 sm:mb-6 max-w-2xl leading-[1.08]"
          >
            Registrations Have Closed
          </motion.h1>

          {/* Subtext description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-xl mx-auto font-medium leading-relaxed mb-10 sm:mb-12 px-2"
          >
            All delegate passes and session slots for Industry Week 2026 have been filled. Thank you for the overwhelming interest. We look forward to welcoming all registered participants.
          </motion.p>

          {/* Navigation Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-lg"
          >
            <Link
              href="/events"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-neutral-200"
            >
              <IconCalendarEvent size={16} />
              <span>Explore Events</span>
              <IconArrowRight size={14} />
            </Link>

            <Link
              href="/programs/resources/sticky-wall"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800"
            >
              <IconNotes size={16} />
              <span>Sticky Wall</span>
            </Link>
          </motion.div>

          {/* Return Home link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              <IconHome size={14} />
              <span>Back to Home</span>
            </Link>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
