"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export default function LMSPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF]">
      <Header />

      <main className="relative flex-grow flex items-center justify-center pt-32 pb-24 lg:pt-44">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            {/* Minimal Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-full bg-blue-50 px-6 py-2 text-[13px] font-bold text-blue-600 border border-blue-100 uppercase tracking-widest"
            >
              Coming Soon
            </motion.div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-10"
            >
              <svg width="260" height="200" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Laptop base */}
                <rect x="50" y="50" width="160" height="105" rx="12" fill="white" stroke="#BFDBFE" strokeWidth="2" />
                {/* Screen */}
                <rect x="58" y="58" width="144" height="80" rx="6" fill="#EFF6FF" />
                {/* Screen content - play button */}
                <circle cx="130" cy="95" r="18" fill="#3B82F6" opacity="0.15" />
                <path d="M124 86v18l15-9-15-9z" fill="#3B82F6" />
                {/* Progress bar on screen */}
                <rect x="80" y="120" width="100" height="5" rx="2.5" fill="#DBEAFE" />
                <rect x="80" y="120" width="45" height="5" rx="2.5" fill="#3B82F6" />
                {/* Laptop keyboard strip */}
                <rect x="55" y="147" width="150" height="8" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
                {/* Laptop stand */}
                <path d="M40 160h180l-10 10H50l-10-10z" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
                {/* Graduation cap */}
                <g transform="translate(175, 28)">
                  <polygon points="0,18 24,8 48,18 24,28" fill="#3B82F6" />
                  <polygon points="24,28 24,40 10,34 10,26" fill="#2563EB" />
                  <line x1="24" y1="18" x2="24" y2="44" stroke="#1D4ED8" strokeWidth="2" />
                  <circle cx="24" cy="46" r="3" fill="#FCD34D" />
                  <rect x="22" y="8" width="4" height="4" rx="1" fill="#2563EB" />
                </g>
                {/* Book stack (left) */}
                <g transform="translate(15, 110)">
                  <rect x="0" y="20" width="30" height="7" rx="2" fill="#BFDBFE" />
                  <rect x="2" y="12" width="28" height="7" rx="2" fill="#93C5FD" />
                  <rect x="1" y="4" width="29" height="7" rx="2" fill="#60A5FA" />
                </g>
                {/* Certificate (right) */}
                <g transform="translate(220, 95)">
                  <rect x="0" y="0" width="28" height="36" rx="4" fill="white" stroke="#BFDBFE" strokeWidth="1.5" />
                  <rect x="6" y="7" width="16" height="3" rx="1.5" fill="#DBEAFE" />
                  <rect x="8" y="14" width="12" height="2" rx="1" fill="#EFF6FF" />
                  <rect x="8" y="19" width="12" height="2" rx="1" fill="#EFF6FF" />
                  <circle cx="14" cy="28" r="4" fill="#FCD34D" opacity="0.6" stroke="#F59E0B" strokeWidth="1" />
                </g>
                {/* Sparkles */}
                <circle cx="22" cy="60" r="3" fill="#93C5FD" opacity="0.5" />
                <circle cx="245" cy="65" r="2.5" fill="#BFDBFE" opacity="0.6" />
                <path d="M40 40l2.5-7 2.5 7-7-2.5 7-2.5z" fill="#60A5FA" opacity="0.35" />
                <path d="M230 145l2-5 2 5-5-2 5-2z" fill="#93C5FD" opacity="0.4" />
                <circle cx="130" cy="185" r="2" fill="#BFDBFE" opacity="0.5" />
              </svg>
            </motion.div>

            {/* Clean Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight text-black sm:text-7xl md:text-8xl"
            >
              The Next Frontier of <span className="text-blue-600">Learning.</span>
            </motion.h1>

            {/* Minimal Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-8 max-w-xl text-lg font-medium text-gray-500 leading-relaxed"
            >
              Our Learning Management System is currently under development. 
              We&apos;re building a seamless experience for technical growth and professional certification.
            </motion.p>

            {/* Simple Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-12"
            >
              <div className="h-1.5 w-12 rounded-full bg-blue-600/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full rounded-full bg-blue-600"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
