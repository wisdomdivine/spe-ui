"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconArrowLeft, IconArrowRight, IconDeviceGamepad2, IconUsers, IconTrophy, IconBolt } from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShowdownCharacter from "@/components/ShowdownCharacter";

export default function ShowdownResourcePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Link
            href="/programs/resources"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors mb-8"
          >
            <IconArrowLeft size={14} />
            Back to Resources
          </Link>

          {/* Hero Header */}
          <div className="p-8 sm:p-14 rounded-[2.5rem] bg-gray-50 border border-gray-100 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">
                Interactive Multiplayer
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight mb-3">
                SPE Showdown
              </h1>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                Live interactive quiz arena for chapter meetings, webinars, and PetroBowl practice sessions. Join with a Game PIN from your phone.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/showdown"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-7 py-4 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Join Live Game
                  <IconArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="shrink-0">
              <ShowdownCharacter mood="waving" size={130} />
            </div>
          </div>

          {/* How It Works Grid */}
          <div className="mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
              How Showdown Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-white border border-gray-100">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black mb-4">
                  1
                </span>
                <h3 className="text-sm font-bold text-gray-950 mb-1">Enter Game PIN</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  When a host starts a live session, enter the 6-digit PIN shown on the main screen.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-100">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black mb-4">
                  2
                </span>
                <h3 className="text-sm font-bold text-gray-950 mb-1">Answer Fast</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Questions appear on the big screen. Tap the corresponding color pad on your phone before time expires.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-100">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black mb-4">
                  3
                </span>
                <h3 className="text-sm font-bold text-gray-950 mb-1">Climb Standings</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Points are awarded based on speed and accuracy. Build streaks to earn multiplier bonuses.
                </p>
              </div>
            </div>
          </div>

          {/* Direct CTA */}
          <div className="p-8 rounded-3xl bg-gray-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-lg font-bold mb-1">Have a Game PIN ready?</h3>
              <p className="text-xs text-gray-400 font-medium">
                Jump straight into the arena controller.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/showdown"
                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors shrink-0 cursor-pointer"
              >
                Enter Arena
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
