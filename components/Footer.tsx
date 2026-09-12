"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const socialLinks = [
    { name: "Twitter", href: "https://x.com/Spe_ui_?s=20", icon: IconBrandTwitter },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/spe-ui/", icon: IconBrandLinkedin },
    { name: "YouTube", href: "https://www.youtube.com/@SPE_UI", icon: IconBrandYoutube },
    { name: "Instagram", href: "https://www.instagram.com/speui_", icon: IconBrandInstagram}
  ];

  return (
    <footer className="relative overflow-hidden bg-black py-24 md:py-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#202020] via-[#0d0d0d] to-black opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.14),transparent_55%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col justify-between gap-16 lg:flex-row lg:items-start">
          {/* Newsletter Column */}
          <div id="newsletter" className="flex flex-col gap-8 scroll-mt-8">
            <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Stay Connected!
            </h2>
            
            <div className="flex flex-col gap-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email.trim() || loading) return;
                  setLoading(true);
                  setMessage("");
                  setError("");
                  try {
                    const res = await fetch("/api/submissions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: email.trim() }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setError(data.error || "Something went wrong");
                    } else {
                      setMessage(data.message);
                      setEmail("");
                    }
                  } catch {
                    setError("Network error. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <div className="relative w-full max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); setMessage(""); }}
                    placeholder="Enter Your Email"
                    required
                    className="h-14 w-full rounded-full bg-[#1e1e1e] px-8 text-base text-white placeholder-gray-500 outline-none ring-1 ring-white/10 transition-shadow focus:ring-white/20 md:h-16 md:text-lg"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || !email.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-14 w-full cursor-pointer items-center justify-between gap-6 rounded-full bg-[#2a56eb] pl-8 pr-3 font-bold text-white sm:w-auto md:h-16 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : message ? "Subscribed!" : "Submit"}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                    {loading ? (
                      <IconLoader2 className="h-5 w-5 animate-spin" />
                    ) : message ? (
                      <IconCheck className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <IconArrowRight className="h-5 w-5" />
                    )}
                  </div>
                </motion.button>
              </form>
              {error && <p className="text-xs text-red-400">{error}</p>}
              {message && <p className="text-xs text-emerald-400">{message}</p>}
              <p className="text-xs text-gray-600">
                By Clicking Submit, you acknowledge that we are trust worthy
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:gap-24">
            <div className="flex flex-col gap-4 md:gap-6">
              {[
                { label: "Blogs", href: "/blog" },
                { label: "FAQs", href: "/#faq" },
                { label: "Events", href: "/events" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-lg cursor-pointer font-medium text-white transition-colors hover:text-blue-500 md:text-xl"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 md:gap-6">
              {[
                { label: "Sponsors", href: "/programs/sponsor" },
                { label: "About us", href: "/about" },
                { label: "Membership", href: "/membership" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-lg cursor-pointer font-medium text-white transition-colors hover:text-blue-500 md:text-xl"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col-reverse items-center gap-8 text-white md:mt-24 md:flex-row md:justify-between">
          <div className="flex items-center gap-6">
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                aria-label={name}
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/5 transition hover:border-blue-500 hover:bg-blue-500/20 md:h-12 md:w-12"
              >
                <Icon className="h-5 w-5 text-white transition group-hover:text-white" />
              </Link>
            ))}
          </div>

          <p className="text-base font-medium text-white md:text-lg">
            ©2026 SPEUI Chapter
          </p>
        </div>
      </div>
    </footer>
  );
}
