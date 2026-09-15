"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSun, IconMoon, IconSunHigh, IconMoonStars } from "@tabler/icons-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 z-[9999] pointer-events-none opacity-0">
        <div className="w-11 h-11 rounded-full bg-neutral-900" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      className="fixed right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 z-[9999] flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip (left of the toggle) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: -8, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase backdrop-blur-xl border pointer-events-none shadow-xl ${
              isDark
                ? "bg-neutral-900/90 text-neutral-200 border-neutral-800"
                : "bg-white/90 text-neutral-800 border-neutral-200/80"
            }`}
          >
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-2xl transition-all duration-300 cursor-pointer border group ${
          isDark
            ? "bg-neutral-900/90 border-neutral-700/80 text-amber-400 hover:border-amber-400/50 hover:bg-neutral-800/90 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
            : "bg-white/90 border-neutral-200 text-blue-600 hover:border-blue-500/50 hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun-icon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <IconSunHigh size={22} className="stroke-[2.2] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </motion.div>
          ) : (
            <motion.div
              key="moon-icon"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <IconMoonStars size={22} className="stroke-[2.2] text-slate-800 group-hover:text-blue-600 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle status indicator dot */}
        <span
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${
            isDark
              ? "bg-amber-400 border-neutral-900"
              : "bg-blue-600 border-white"
          }`}
        />
      </motion.button>
    </div>
  );
}
