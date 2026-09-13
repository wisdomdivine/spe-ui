"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ── Illustrative SVGs ──────────────────────────────────── */

/** Oil derrick pumping with flowing pipe and data readout */
function PetroCalcIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Ground */}
      <rect x="0" y="48" width="80" height="8" rx="4" fill="#DBEAFE" />
      {/* Derrick body */}
      <path d="M24 48L28 12H32L36 48" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
      <path d="M26 48L28.5 18H31.5L34 48" fill="#2563EB" opacity="0.08" />
      {/* Derrick cross struts */}
      <line x1="26" y1="28" x2="34" y2="28" stroke="#2563EB" strokeWidth="1.5" />
      <line x1="25.2" y1="38" x2="34.8" y2="38" stroke="#2563EB" strokeWidth="1.5" />
      {/* Derrick top */}
      <circle cx="30" cy="10" r="2.5" fill="#2563EB" />
      {/* Pump arm */}
      <path d="M30 10L44 16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="16" r="2" fill="#2563EB" opacity="0.3" />
      {/* Flowing pipe */}
      <path d="M36 42H54C56 42 58 40 58 38V28" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Droplets */}
      <circle cx="58" cy="22" r="1.5" fill="#2563EB" opacity="0.25" />
      <circle cx="58" cy="17" r="1" fill="#2563EB" opacity="0.15" />
      {/* Data panel */}
      <rect x="54" y="32" width="20" height="14" rx="3" fill="white" stroke="#2563EB" strokeWidth="1.5" />
      <line x1="57" y1="37" x2="66" y2="37" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="57" y1="40" x2="63" y2="40" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <line x1="57" y1="43" x2="70" y2="43" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
      {/* Chart line on panel */}
      <polyline points="68,38 70,36 72,37" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Road forking into three paths with a signpost */
function CareerCompassIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Ground fade */}
      <ellipse cx="40" cy="52" rx="38" ry="6" fill="#D1FAE5" opacity="0.5" />
      {/* Main road */}
      <path d="M40 54V32" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
      {/* Fork left */}
      <path d="M40 32Q32 26 18 16" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      {/* Fork center */}
      <path d="M40 32V10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      {/* Fork right */}
      <path d="M40 32Q48 26 62 16" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      {/* Road dashes */}
      <line x1="40" y1="50" x2="40" y2="46" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="40" y1="42" x2="40" y2="38" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      {/* Signpost */}
      <rect x="38" y="22" width="4" height="18" rx="1" fill="#059669" opacity="0.15" />
      {/* Signs */}
      <rect x="42" y="22" width="18" height="6" rx="2" fill="#059669" opacity="0.2" />
      <path d="M60 25L62 25" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <rect x="20" y="27" width="18" height="6" rx="2" fill="#059669" opacity="0.15" />
      <path d="M20 30L18 30" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      {/* Sign text lines */}
      <line x1="45" y1="25" x2="55" y2="25" stroke="#059669" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="25" y1="30" x2="34" y2="30" stroke="#059669" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      {/* Destination dots */}
      <circle cx="18" cy="14" r="3" fill="#059669" opacity="0.2" />
      <circle cx="40" cy="8" r="3.5" fill="#059669" opacity="0.25" />
      <circle cx="62" cy="14" r="3" fill="#059669" opacity="0.2" />
      {/* Person silhouette at fork */}
      <circle cx="40" cy="36" r="2" fill="#059669" opacity="0.4" />
    </svg>
  );
}

/** Corkboard with pinned notes and a pushpin */
function StickyWallIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Board bg */}
      <rect x="4" y="4" width="72" height="48" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" opacity="0.4" />
      {/* Note 1 - yellow, tilted */}
      <g transform="rotate(-4 16 18)">
        <rect x="8" y="10" width="22" height="18" rx="2" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />
        <line x1="12" y1="16" x2="25" y2="16" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <line x1="12" y1="19.5" x2="22" y2="19.5" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        <line x1="12" y1="23" x2="18" y2="23" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
        {/* Pin */}
        <circle cx="19" cy="10" r="2.5" fill="#EF4444" />
        <circle cx="19" cy="10" r="1" fill="white" opacity="0.5" />
      </g>
      {/* Note 2 - blue, straight */}
      <g transform="rotate(2 49 16)">
        <rect x="38" y="8" width="22" height="18" rx="2" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1" />
        <line x1="42" y1="14" x2="55" y2="14" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <line x1="42" y1="17.5" x2="52" y2="17.5" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        <line x1="42" y1="21" x2="48" y2="21" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
        {/* Pin */}
        <circle cx="49" cy="8" r="2.5" fill="#F59E0B" />
        <circle cx="49" cy="8" r="1" fill="white" opacity="0.5" />
      </g>
      {/* Note 3 - green, tilted */}
      <g transform="rotate(3 24 40)">
        <rect x="12" y="32" width="22" height="16" rx="2" fill="#BBF7D0" stroke="#22C55E" strokeWidth="1" />
        <line x1="16" y1="37" x2="29" y2="37" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <line x1="16" y1="40.5" x2="26" y2="40.5" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
        {/* Pin */}
        <circle cx="23" cy="32" r="2.5" fill="#8B5CF6" />
        <circle cx="23" cy="32" r="1" fill="white" opacity="0.5" />
      </g>
      {/* Note 4 - pink, tilted other way */}
      <g transform="rotate(-2 56 40)">
        <rect x="44" y="30" width="22" height="18" rx="2" fill="#FBCFE8" stroke="#EC4899" strokeWidth="1" />
        <line x1="48" y1="36" x2="61" y2="36" stroke="#DB2777" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
        <line x1="48" y1="39.5" x2="58" y2="39.5" stroke="#DB2777" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
        <line x1="48" y1="43" x2="54" y2="43" stroke="#DB2777" strokeWidth="1" strokeLinecap="round" opacity="0.15" />
        {/* Pin */}
        <circle cx="55" cy="30" r="2.5" fill="#059669" />
        <circle cx="55" cy="30" r="1" fill="white" opacity="0.5" />
      </g>
      {/* Smiley doodle on board */}
      <circle cx="70" cy="14" r="3" stroke="#F59E0B" strokeWidth="0.8" opacity="0.3" />
      <circle cx="68.8" cy="13.2" r="0.5" fill="#F59E0B" opacity="0.3" />
      <circle cx="71.2" cy="13.2" r="0.5" fill="#F59E0B" opacity="0.3" />
      <path d="M69 15C69.5 15.8 70.5 15.8 71 15" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/** Hand pressing a big button with radiating speed lines */
function ReactionIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Radiating rings */}
      <circle cx="36" cy="32" r="22" stroke="#E11D48" strokeWidth="1" opacity="0.06" />
      <circle cx="36" cy="32" r="16" stroke="#E11D48" strokeWidth="1" opacity="0.1" />
      <circle cx="36" cy="32" r="10" stroke="#E11D48" strokeWidth="1.2" opacity="0.15" />
      {/* The button base */}
      <ellipse cx="36" cy="38" rx="14" ry="4" fill="#E11D48" opacity="0.12" />
      {/* Button top (green = go!) */}
      <circle cx="36" cy="32" r="8" fill="#22C55E" opacity="0.2" stroke="#22C55E" strokeWidth="1.5" />
      <circle cx="36" cy="32" r="4.5" fill="#22C55E" opacity="0.35" />
      {/* Glint on button */}
      <circle cx="33.5" cy="29.5" r="1.5" fill="white" opacity="0.5" />
      {/* Hand/finger coming from right */}
      <path d="M58 22C56 20 53 19 51 20L44 28L42 31" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M58 22C60 21 62 22 63 24C64 26 63 28 61 28L54 27" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {/* Index finger tip */}
      <circle cx="42" cy="31" r="2" fill="#E11D48" opacity="0.3" />
      {/* Speed lines */}
      <line x1="18" y1="20" x2="12" y2="16" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <line x1="16" y1="28" x2="10" y2="27" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />
      <line x1="18" y1="36" x2="12" y2="38" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      {/* Stopwatch top-right */}
      <circle cx="64" cy="12" r="6" stroke="#E11D48" strokeWidth="1.5" opacity="0.25" />
      <line x1="64" y1="12" x2="64" y2="9" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="64" y1="12" x2="66.5" y2="13" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
      <line x1="64" y1="6" x2="64" y2="4" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      {/* "ms" text hint */}
      <text x="60" y="44" fontSize="6" fontWeight="bold" fill="#E11D48" opacity="0.2">ms</text>
    </svg>
  );
}

/** Stacked barrels tower with wobble lines */
function BarrelStackerIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Ground */}
      <rect x="0" y="48" width="80" height="8" rx="4" fill="#DBEAFE" />
      {/* Bottom barrel */}
      <rect x="22" y="36" width="36" height="12" rx="3" fill="#2563EB" opacity="0.25" />
      <rect x="22" y="37.5" width="36" height="2" rx="1" fill="white" opacity="0.3" />
      <rect x="22" y="44" width="36" height="2" rx="1" fill="white" opacity="0.2" />
      {/* Second barrel */}
      <rect x="24" y="24" width="32" height="12" rx="3" fill="#2563EB" opacity="0.35" />
      <rect x="24" y="25.5" width="32" height="2" rx="1" fill="white" opacity="0.3" />
      <rect x="24" y="32" width="32" height="2" rx="1" fill="white" opacity="0.2" />
      {/* Third barrel */}
      <rect x="27" y="12" width="26" height="12" rx="3" fill="#2563EB" opacity="0.5" />
      <rect x="27" y="13.5" width="26" height="2" rx="1" fill="white" opacity="0.3" />
      <rect x="27" y="20" width="26" height="2" rx="1" fill="white" opacity="0.2" />
      {/* Top barrel (moving) */}
      <rect x="30" y="2" width="20" height="10" rx="3" fill="#2563EB" opacity="0.7" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 2" />
      <rect x="30" y="3.5" width="20" height="2" rx="1" fill="white" opacity="0.3" />
      {/* Motion arrows */}
      <path d="M26 7L22 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M54 7L58 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M22 7L24 5.5M22 7L24 8.5" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M58 7L56 5.5M58 7L56 8.5" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      {/* Score badge */}
      <rect x="60" y="16" width="14" height="10" rx="3" fill="#2563EB" opacity="0.12" />
      <text x="63.5" y="23" fontSize="6" fontWeight="bold" fill="#2563EB" opacity="0.35">+1</text>
      {/* Height indicator */}
      <line x1="16" y1="48" x2="16" y2="6" stroke="#2563EB" strokeWidth="1" strokeDasharray="2 2" opacity="0.15" />
      <path d="M14 8L16 4L18 8" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

/** Magnifying glass hovering over emoji symbols with a question mark */
function EmojiDecodeIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Scattered emoji placeholders */}
      <text x="8" y="20" fontSize="14" opacity="0.15">🎬</text>
      <text x="56" y="18" fontSize="12" opacity="0.12">🌍</text>
      <text x="14" y="46" fontSize="12" opacity="0.12">🍕</text>
      <text x="60" y="48" fontSize="11" opacity="0.1">🎵</text>
      {/* Central puzzle area */}
      <rect x="22" y="14" width="36" height="28" rx="6" fill="#7C3AED" opacity="0.06" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 2" />
      {/* Emoji sequence inside */}
      <text x="26" y="33" fontSize="13">🎭</text>
      <text x="38" y="33" fontSize="13" opacity="0.7">❓</text>
      <text x="48" y="33" fontSize="13">🏆</text>
      {/* Magnifying glass */}
      <circle cx="56" cy="20" r="9" stroke="#7C3AED" strokeWidth="2" fill="white" fillOpacity="0.5" />
      <line x1="63" y1="26" x2="70" y2="33" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sparkle inside magnifier */}
      <path d="M56 17L56.8 19.2L59 20L56.8 20.8L56 23L55.2 20.8L53 20L55.2 19.2Z" fill="#7C3AED" opacity="0.3" />
      {/* Timer ring bottom-left */}
      <circle cx="14" cy="34" r="5" stroke="#7C3AED" strokeWidth="1.2" opacity="0.15" />
      <text x="11" y="36.5" fontSize="5" fontWeight="bold" fill="#7C3AED" opacity="0.25">60</text>
      {/* Score badge */}
      <rect x="60" y="40" width="14" height="8" rx="3" fill="#7C3AED" opacity="0.12" />
      <text x="63" y="46" fontSize="5" fontWeight="bold" fill="#7C3AED" opacity="0.3">+10</text>
    </svg>
  );
}

/** Weekly timetable grid with clock and pen */
function TimetableIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      {/* Grid background */}
      <rect x="8" y="10" width="64" height="38" rx="5" fill="#2563EB" opacity="0.05" stroke="#2563EB" strokeWidth="1" />
      {/* Day column headers */}
      {[14, 24, 34, 44, 54, 64].map((x, i) => (
        <g key={i}>
          <rect x={x - 3} y={12} width={8} height={5} rx={1.5} fill="#2563EB" opacity={0.12 + i * 0.02} />
          <line x1={x + 1} y1={19} x2={x + 1} y2={44} stroke="#2563EB" strokeWidth="0.5" opacity="0.1" />
        </g>
      ))}
      {/* Time rows */}
      {[22, 29, 36].map((y) => (
        <line key={y} x1="10" y1={y} x2="70" y2={y} stroke="#2563EB" strokeWidth="0.5" opacity="0.08" />
      ))}
      {/* Course blocks */}
      <rect x="12" y="20" width="10" height="7" rx="2" fill="#2563EB" opacity="0.2" />
      <rect x="32" y="23" width="10" height="11" rx="2" fill="#2563EB" opacity="0.3" />
      <rect x="52" y="20" width="10" height="7" rx="2" fill="#2563EB" opacity="0.15" />
      <rect x="22" y="31" width="10" height="7" rx="2" fill="#2563EB" opacity="0.25" />
      <rect x="42" y="36" width="10" height="6" rx="2" fill="#2563EB" opacity="0.18" />
      <rect x="62" y="28" width="6" height="9" rx="2" fill="#2563EB" opacity="0.22" />
      {/* Clock icon top-left */}
      <circle cx="11" cy="10" r="4" fill="white" stroke="#2563EB" strokeWidth="1.2" />
      <line x1="11" y1="10" x2="11" y2="8" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="10" x2="13" y2="10.5" stroke="#2563EB" strokeWidth="0.8" strokeLinecap="round" />
      {/* Note icon bottom-right */}
      <rect x="62" y="42" width="10" height="8" rx="2" fill="white" stroke="#2563EB" strokeWidth="1" />
      <line x1="64" y1="45" x2="70" y2="45" stroke="#2563EB" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <line x1="64" y1="47" x2="68" y2="47" stroke="#2563EB" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/** Gamepad and live wireless signals */
function ShowdownIllo() {
  return (
    <svg viewBox="0 0 80 56" fill="none" className="w-full h-auto">
      <rect x="8" y="10" width="64" height="38" rx="6" fill="#2563EB" opacity="0.06" stroke="#2563EB" strokeWidth="1" />
      <rect x="22" y="20" width="36" height="18" rx="9" fill="#2563EB" opacity="0.15" stroke="#2563EB" strokeWidth="1.5" />
      <line x1="31" y1="26" x2="31" y2="32" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="29" x2="34" y2="29" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <circle cx="46" cy="27" r="1.5" fill="#2563EB" />
      <circle cx="50" cy="30" r="1.5" fill="#2563EB" />
      <path d="M37 14C39 12 41 12 43 14" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M35 11C38 8 42 8 45 11" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}

/* ── Tool definitions ───────────────────────────────────── */
const tools = [
  {
    title: "SPE Showdown",
    description:
      "Live multiplayer quiz arena. Join competitions from your phone with a 6-digit Game PIN, answer fast, and climb the live standings.",
    href: "/programs/resources/showdown",
    Illustration: ShowdownIllo,
    accent: "text-blue-600",
  },
  {
    title: "PetroCalc Suite",
    description:
      "5 petroleum engineering calculators - unit converter, Darcy's Law solver, material balance P/Z plot, decline curve analysis, and Vogel's IPR curve.",
    href: "/programs/resources/petro-calc",
    Illustration: PetroCalcIllo,
    accent: "text-blue-600",
  },
  {
    title: "Career Compass",
    description:
      "Explore 20+ career paths across upstream, midstream, downstream, energy transition, consulting, and academia. Nigerian salary estimates in Naira.",
    href: "/programs/resources/career-compass",
    Illustration: CareerCompassIllo,
    accent: "text-emerald-600",
  },
  {
    title: "Sticky Wall",
    description:
      "A public canvas where anyone can leave sticky notes. Post advice, encouragement, memes, or anything for the SPE community to see.",
    href: "/programs/resources/sticky-wall",
    Illustration: StickyWallIllo,
    accent: "text-amber-600",
  },
  {
    title: "Reaction Speed Test",
    description:
      "How fast are your reflexes? Wait for the screen to turn green, tap as fast as you can, and compete for the fastest average across 5 rounds.",
    href: "/programs/resources/reaction-test",
    Illustration: ReactionIllo,
    accent: "text-rose-600",
  },
  {
    title: "Emoji Decode",
    description:
      "Crack the emoji code. 60 seconds, 140 puzzles across movies, songs, countries, foods, Nigerian culture, and more. Streaks give bonus points.",
    href: "/programs/resources/emoji-decode",
    Illustration: EmojiDecodeIllo,
    accent: "text-violet-600",
  },
  {
    title: "Barrel Stacker",
    description:
      "Stack oil barrels as high as you can. Tap to drop each one - misaligned parts get sliced off. One miss and it all collapses. Compete for the tallest tower.",
    href: "/programs/resources/barrel-stacker",
    Illustration: BarrelStackerIllo,
    accent: "text-blue-600",
  },
  {
    title: "Class Timetable",
    description:
      "Community-managed class and exam timetables for 100 - 500 level. Add courses, set times, and leave notes like 'class postponed' for everyone to see.",
    href: "/programs/resources/timetable",
    Illustration: TimetableIllo,
    accent: "text-blue-600",
  },
];

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
              Programs / Resources
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Interactive Tools
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-gray-500">
              Calculators, career exploration, competitive mini-games, and a community sticky wall - built for SPE UI members and all aspiring petroleum engineers.
            </p>
          </motion.div>

          {/* Tool Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={tool.href}
                  className="group block h-full bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 p-8 sm:p-10 hover:shadow-xl hover:shadow-blue-100/30 transition-all"
                >
                  <div className="mb-6 -mx-2 sm:-mx-3">
                    <tool.Illustration />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                    {tool.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-300 group-hover:text-blue-600 transition-colors">
                    Open Tool
                    <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
