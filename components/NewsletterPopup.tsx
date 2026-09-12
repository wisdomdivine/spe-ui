"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconArrowRight, IconCircleCheck, IconLoader2, IconSparkles } from "@tabler/icons-react";

const STORAGE_KEY = "spe_newsletter_dismissed";
const SCROLL_THRESHOLD = 0.25; // show after scrolling 25% of page
const TIMER_FALLBACK_MS = 20_000; // or after 20 seconds

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrollPct = window.scrollY / scrollable;
      if (scrollPct >= SCROLL_THRESHOLD) show();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Timer fallback in case scroll detection doesn't fire
    const timer = setTimeout(show, TIMER_FALLBACK_MS);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let settled = false;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (res.ok) {
        settled = true;
        setStatus("success");
        setMessage(data.message || "You're subscribed!");
        setTimeout(dismiss, 3500);
      } else {
        settled = true;
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      settled = true;
      setStatus("error");
      if (err instanceof DOMException && err.name === "AbortError") {
        setMessage("Request timed out. Please try again.");
      } else {
        setMessage("Connection error. Try again.");
      }
    } finally {
      clearTimeout(timeout);
      if (!settled) {
        setStatus("error");
        setMessage("Something went wrong. Try again.");
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
          />

          {/* Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="relative flex w-full max-w-[820px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blue-900/15 ring-1 ring-gray-200/60">
              {/* LEFT - Image panel */}
              <div className="relative hidden w-[46%] flex-shrink-0 md:block">
                <Image
                  src="/about_us.png"
                  alt="SPE UI Students"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-blue-900/20" />
                {/* Overlay text */}
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <Image
                    src="/speui.png"
                    alt="SPE UI Logo"
                    width={44}
                    height={44}
                    className="mb-3 rounded-xl"
                  />
                  <p className="text-lg font-bold leading-snug text-white">
                    Join 300+ students staying ahead in the energy industry
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-blue-100/80">
                    Events, insights, and opportunities delivered to your inbox.
                  </p>
                </div>
              </div>

              {/* RIGHT - Form panel */}
              <div className="relative flex flex-1 flex-col justify-center px-8 py-10 sm:px-10">
                {/* Close */}
                <button
                  onClick={dismiss}
                  className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <IconX size={18} />
                </button>

                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                      <IconCircleCheck size={32} className="text-emerald-500" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{message}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      You&apos;ll hear from us soon. Welcome to the SPE&nbsp;UI community!
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 w-fit">
                      Newsletter
                    </div>

                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-[26px]">
                      Stay in the loop
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                      Get the latest on events, opportunities, and industry
                      insights from SPE UI Chapter - straight to your inbox.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-3">
                      <div>
                        <label
                          htmlFor="nl-email"
                          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400"
                        >
                          Email address
                        </label>
                        <input
                          id="nl-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!email.trim() || status === "loading"}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none"
                      >
                        {status === "loading" ? (
                          <IconLoader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            Subscribe Now
                            <IconArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>

                    {status === "error" && message && (
                      <p className="mt-3 text-xs font-medium text-red-500">
                        {message}
                      </p>
                    )}

                    <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-400">
                      No spam, ever. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
