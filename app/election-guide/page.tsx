"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  IconChecklist,
  IconMailCheck,
  IconKey,
  IconChecks,
  IconArrowRight,
  IconShare,
  IconCheck,
  IconPlayerPlay,
  IconHelpCircle,
  IconSparkles,
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
    icon: IconMailCheck,
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
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-gray-900 selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          {/* Header Hero */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100/80 px-3.5 py-1.5 sm:px-4 mb-4 sm:mb-6 shadow-xs"
            >
              <IconSparkles size={14} className="text-blue-600 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-blue-700">
                Official Voter Walkthrough
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 leading-[1.16] sm:leading-[1.12]"
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
              className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-gray-600 font-medium leading-relaxed px-2"
            >
              Watch the complete video demonstration on how to verify your voter eligibility, review candidate manifestos, and cast your ballot seamlessly.
            </motion.p>
          </div>

          {/* Main Showcase: Video Player + Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Left Column: Device Mockup Video Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="lg:col-span-6 w-full flex flex-col items-center"
            >
              <div className="relative w-full max-w-[300px] xs:max-w-[330px] sm:max-w-[360px] mx-auto">
                {/* Ambient glow behind device */}
                <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-blue-500/20 via-indigo-500/25 to-blue-600/20 rounded-[3rem] sm:rounded-[3.5rem] blur-xl sm:blur-2xl -z-10" />

                {/* Device Frame */}
                <div className="relative rounded-[2.5rem] sm:rounded-[3rem] p-2.5 sm:p-3.5 bg-gray-950 shadow-2xl ring-1 ring-white/10 border-[3px] sm:border-4 border-gray-900 overflow-hidden">
                  {/* Dynamic Island / Speaker Pill */}
                  <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-3.5 sm:h-4 bg-gray-950 rounded-full z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-gray-900 rounded-full mr-2" />
                    <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full" />
                  </div>

                  {/* Video Element */}
                  <div className="relative rounded-[2rem] sm:rounded-[2.3rem] overflow-hidden bg-black aspect-[9/19.5] shadow-inner">
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
                        className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs z-10"
                        aria-label="Play Video"
                      >
                        <IconPlayerPlay size={26} className="translate-x-0.5 fill-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Info Pill */}
                <div className="mt-3 sm:mt-4 flex items-center justify-between px-2 text-[11px] sm:text-xs text-gray-500 font-semibold">
                  <span>Duration: 6 mins</span>
                  <span>1080p Web Stream</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Steps & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-6 w-full space-y-5 sm:space-y-6 lg:pt-2"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-gray-100 shadow-sm space-y-5 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-950 tracking-tight">
                    Quick Walkthrough Steps
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                    Follow these 4 simple steps to complete your ballot smoothly.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {STEPS.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/70 hover:bg-blue-50/40 border border-gray-100 transition-colors group"
                      >
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <Icon size={19} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                              Step {s.step}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {s.title}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Primary CTA Buttons */}
                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full">
                  <Link
                    href="/programs/electoral-session"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-200 transition-all hover:shadow-xl active:scale-98 text-center"
                  >
                    <span>Enter Voting Booth</span>
                    <IconArrowRight size={16} />
                  </Link>

                  <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl sm:rounded-2xl transition-all active:scale-98 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <IconCheck size={16} className="text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Link Copied!</span>
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
              <div className="rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-100 p-4 sm:p-5 flex items-start gap-3 sm:gap-3.5">
                <IconHelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5 sm:w-5 sm:h-5" />
                <div className="text-[11px] sm:text-xs text-gray-600 leading-relaxed font-medium">
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
