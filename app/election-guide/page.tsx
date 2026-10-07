"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  IconChecklist,
  IconShieldCheck,
  IconKey,
  IconChecks,
  IconArrowRight,
  IconShare,
  IconCheck,
  IconPlayerPlay,
  IconHelpCircle,
  IconSparkles
} from "@tabler/icons-react";

const VIDEO_URL = "https://res.cloudinary.com/tsgtyztc/video/upload/v1791387936/election-guide.mp4";

const STEPS = [
  {
    step: "01",
    title: "Voter Authentication",
    desc: "Enter your registered matric number or email address on the electoral authentication screen.",
    icon: IconKey,
  },
  {
    step: "02",
    title: "One-Time OTP Verification",
    desc: "A secure verification code is sent directly to your registered mailbox. Enter it to unlock your ballot.",
    icon: IconShieldCheck,
  },
  {
    step: "03",
    title: "Select Candidates",
    desc: "Explore candidate profiles, manifestos, and make your informed selection for each executive position.",
    icon: IconChecklist,
  },
  {
    step: "04",
    title: "Submit Encrypted Ballot",
    desc: "Review your choices and cast your vote. Votes are recorded anonymously and irreversibly.",
    icon: IconChecks,
  },
];

export default function ElectionGuidePage() {
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + "/election-guide");
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-gray-900 selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
          {/* Header Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100/80 px-4 py-1.5 mb-6 shadow-xs"
            >
              <IconSparkles size={15} className="text-blue-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-blue-700">
                Official Voter Walkthrough
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 leading-[1.12]"
            >
              How to Vote in the{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Electoral Session
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-gray-600 font-medium leading-relaxed"
            >
              Watch the complete video demonstration on how to verify your voter eligibility, review candidate manifestos, and cast your ballot seamlessly.
            </motion.p>
          </div>

          {/* Main Showcase: Video Player + Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Left: Device Mockup Video Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="lg:col-span-6 flex flex-col items-center"
            >
              <div className="relative w-full max-w-[340px] sm:max-w-[360px] mx-auto">
                {/* Ambient glow behind device */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-indigo-500/25 to-blue-600/20 rounded-[3.5rem] blur-2xl -z-10" />

                {/* Device Frame */}
                <div className="relative rounded-[3rem] p-3 sm:p-3.5 bg-gray-950 shadow-2xl ring-1 ring-white/10 border-4 border-gray-900 overflow-hidden">
                  {/* Dynamic Island / Speaker Pill */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-950 rounded-full z-20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-gray-900 rounded-full mr-2" />
                    <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full" />
                  </div>

                  {/* Video Element */}
                  <div className="relative rounded-[2.3rem] overflow-hidden bg-black aspect-[9/19.5] shadow-inner">
                    <video
                      ref={videoRef}
                      src={VIDEO_URL}
                      controls
                      playsInline
                      preload="metadata"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Play Button when paused */}
                    {!isPlaying && (
                      <button
                        onClick={handleTogglePlay}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs z-10"
                        aria-label="Play Video"
                      >
                        <IconPlayerPlay size={28} className="translate-x-0.5 fill-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Info Pill */}
                <div className="mt-4 flex items-center justify-between px-2 text-xs text-gray-500 font-semibold">
                  <span>Duration: 6 mins</span>
                  <span>1080p Web Stream</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Steps & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-6 space-y-6 lg:pt-4"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                    Quick Walkthrough Steps
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                    Follow these 4 simple steps to complete your ballot smoothly.
                  </p>
                </div>

                <div className="space-y-4">
                  {STEPS.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/70 hover:bg-blue-50/40 border border-gray-100 transition-colors group"
                      >
                        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                              Step {s.step}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {s.title}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Primary CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/programs/electoral-session"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:shadow-xl active:scale-98"
                  >
                    <span>Enter Voting Booth</span>
                    <IconArrowRight size={16} />
                  </Link>

                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm px-5 py-3.5 rounded-2xl transition-all active:scale-98 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <IconCheck size={16} className="text-emerald-600" />
                        <span className="text-emerald-700">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <IconShare size={16} />
                        <span>Share Guide</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security & Support Note */}
              <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-5 flex items-start gap-3.5">
                <IconHelpCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 leading-relaxed font-medium">
                  <strong className="text-gray-900 font-bold block mb-0.5">Having trouble receiving your OTP?</strong>
                  Check your spam/junk folder. If you still encounter issues, contact your faculty electoral committee or election administrator immediately.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
