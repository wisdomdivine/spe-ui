"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlitterConfetti from "@/components/GlitterConfetti";
import ConfettiSpaceBackground from "@/components/ConfettiSpaceBackground";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconNotes,
  IconHome,
  IconLoader2,
} from "@tabler/icons-react";

export default function EventRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    is_spe_member: null as boolean | null,
    is_membership_active: null as boolean | null,
    whatsapp_number: "",
    selected_days: [] as string[],
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [generatedAccessCode, setGeneratedAccessCode] = useState("");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean | null>(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Trigger smooth animated transition into dark mode on page load
    const timer = setTimeout(() => {
      setIsDarkMode(true);
    }, 100);

    // Fetch public event status to check if registration is open
    const checkEventStatus = async () => {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const events = await res.json();
          // Find Industry Week or the relevant active event
          const industryWeek = events.find((e: any) =>
            e.title?.toLowerCase().includes("industry week")
          );
          if (industryWeek && industryWeek.is_registration_open === false) {
            setIsRegistrationOpen(false);
          } else {
            setIsRegistrationOpen(true);
          }
        }
      } catch {
        setIsRegistrationOpen(true);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkEventStatus();
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!formData.whatsapp_number.trim()) {
      setErrorMsg("Please enter your phone / WhatsApp number.");
      return;
    }
    if (!formData.department.trim()) {
      setErrorMsg("Please enter your department.");
      return;
    }
    if (formData.selected_days.length === 0) {
      setErrorMsg("Please select at least one day you plan to attend.");
      return;
    }
    if (formData.is_spe_member === null) {
      setErrorMsg("Please select whether you are an SPE member.");
      return;
    }
    if (formData.is_spe_member === true && formData.is_membership_active === null) {
      setErrorMsg("Please indicate if your SPE membership is currently active.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed. Please try again.");
      } else {
        setGeneratedAccessCode(data.access_code || "");
        setIsSuccess(true);
      }
    } catch {
      setErrorMsg("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col font-sans transition-colors duration-1000 ${
        isDarkMode
          ? "bg-[#0A0A0A] text-white selection:bg-blue-600 selection:text-white"
          : "bg-white text-black selection:bg-blue-100 selection:text-blue-900"
      }`}
    >
      <Header isDark={isDarkMode} />
      <ConfettiSpaceBackground />
      {isSuccess && <GlitterConfetti />}

      <main className="relative z-10 flex-grow pt-32 pb-24 px-6">
        <div className="mx-auto max-w-2xl">
          {isRegistrationOpen === false ? (
            /* Registrations Have Closed Screen */
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
          ) : (
            /* Active Registration Form & Success Flow */
            <>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`text-center text-4xl font-bold tracking-tight sm:text-5xl mb-4 transition-colors duration-1000 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Reserve Your Spot
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`text-center text-base mb-12 max-w-lg mx-auto font-medium transition-colors duration-1000 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Complete the form below to register for Industry Week 2026 sessions or to join the priority guest waitlist.
              </motion.p>

              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className={`space-y-8 rounded-[2.5rem] border p-8 sm:p-12 transition-all duration-1000 ${
                      isDarkMode
                        ? "border-neutral-800 bg-[#121212]"
                        : "border-gray-100 bg-[#F9FAFB]"
                    }`}
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded-2xl border px-6 py-4 text-sm font-semibold outline-none transition-all duration-500 ${
                          isDarkMode
                            ? "border-neutral-800 bg-[#1A1A1A] text-white focus:border-blue-600 placeholder-neutral-600"
                            : "border-gray-200 bg-white text-gray-900 focus:border-blue-600 placeholder-gray-300"
                        }`}
                      />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full rounded-2xl border px-6 py-4 text-sm font-semibold outline-none transition-all duration-500 ${
                          isDarkMode
                            ? "border-neutral-800 bg-[#1A1A1A] text-white focus:border-blue-600 placeholder-neutral-600"
                            : "border-gray-200 bg-white text-gray-900 focus:border-blue-600 placeholder-gray-300"
                        }`}
                      />
                    </div>

                    {/* Phone / WhatsApp Number */}
                    <div className="space-y-2">
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Phone Number (WhatsApp) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +234 801 234 5678"
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                        className={`w-full rounded-2xl border px-6 py-4 text-sm font-semibold outline-none transition-all duration-500 ${
                          isDarkMode
                            ? "border-neutral-800 bg-[#1A1A1A] text-white focus:border-blue-600 placeholder-neutral-600"
                            : "border-gray-200 bg-white text-gray-900 focus:border-blue-600 placeholder-gray-300"
                        }`}
                      />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Petroleum Engineering"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className={`w-full rounded-2xl border px-6 py-4 text-sm font-semibold outline-none transition-all duration-500 ${
                          isDarkMode
                            ? "border-neutral-800 bg-[#1A1A1A] text-white focus:border-blue-600 placeholder-neutral-600"
                            : "border-gray-200 bg-white text-gray-900 focus:border-blue-600 placeholder-gray-300"
                        }`}
                      />
                    </div>

                    {/* Select Days to Attend */}
                    <div className="space-y-3">
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Which days will you attend? <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        {/* Row 1: Day 1 - 3 */}
                        <div className="grid grid-cols-3 gap-3">
                          {["Day 1 (Sept 14)", "Day 2 (Sept 15)", "Day 3 (Sept 16)"].map((dayName) => {
                            const cleanDay = dayName.includes("Day 1") ? "Day 1" : dayName.includes("Day 2") ? "Day 2" : "Day 3";
                            const isSelected = formData.selected_days.includes(cleanDay);
                            return (
                              <button
                                key={dayName}
                                type="button"
                                onClick={() => {
                                  const updated = isSelected
                                    ? formData.selected_days.filter((d) => d !== cleanDay)
                                    : [...formData.selected_days, cleanDay];
                                  setFormData({ ...formData, selected_days: updated });
                                }}
                                className={`rounded-2xl p-4 text-left border transition-all duration-300 flex flex-col justify-between h-24 outline-none ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                                    : isDarkMode
                                    ? "bg-[#1A1A1A] text-gray-300 border-neutral-800 hover:bg-neutral-800"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-85">
                                  {cleanDay}
                                </span>
                                <span className="text-xs font-bold leading-tight">
                                  {dayName.substring(dayName.indexOf("("))}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Row 2: Day 4 - 5 */}
                        <div className="grid grid-cols-2 gap-3 sm:max-w-[66%]">
                          {["Day 4 (Sept 17)", "Day 5 (Sept 18)"].map((dayName) => {
                            const cleanDay = dayName.includes("Day 4") ? "Day 4" : "Day 5";
                            const isSelected = formData.selected_days.includes(cleanDay);
                            return (
                              <button
                                key={dayName}
                                type="button"
                                onClick={() => {
                                  const updated = isSelected
                                    ? formData.selected_days.filter((d) => d !== cleanDay)
                                    : [...formData.selected_days, cleanDay];
                                  setFormData({ ...formData, selected_days: updated });
                                }}
                                className={`rounded-2xl p-4 text-left border transition-all duration-300 flex flex-col justify-between h-24 outline-none ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                                    : isDarkMode
                                    ? "bg-[#1A1A1A] text-gray-300 border-neutral-800 hover:bg-neutral-800"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-85">
                                  {cleanDay}
                                </span>
                                <span className="text-xs font-bold leading-tight">
                                  {dayName.substring(dayName.indexOf("("))}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SPE Membership Selector */}
                    <div className="space-y-3 pt-2">
                      <label
                        className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Are you an SPE member? <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, is_spe_member: true })}
                          className={`rounded-2xl py-4 text-xs font-bold uppercase tracking-wider transition-all border ${
                            formData.is_spe_member === true
                              ? "bg-blue-600 text-white border-blue-600"
                              : isDarkMode
                              ? "bg-[#1A1A1A] text-gray-300 border-neutral-800 hover:bg-neutral-800"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, is_spe_member: false, is_membership_active: null })}
                          className={`rounded-2xl py-4 text-xs font-bold uppercase tracking-wider transition-all border ${
                            formData.is_spe_member === false
                              ? "bg-blue-600 text-white border-blue-600"
                              : isDarkMode
                              ? "bg-[#1A1A1A] text-gray-300 border-neutral-800 hover:bg-neutral-800"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Conditional Active Membership or Non-Member Note */}
                    <AnimatePresence>
                      {formData.is_spe_member === true && (
                        <motion.div
                          key="active-status"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-2 overflow-hidden"
                        >
                          <label
                            className={`block text-xs font-bold uppercase tracking-widest transition-colors duration-1000 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Is your membership active? <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, is_membership_active: true })}
                              className={`rounded-2xl py-4 text-xs font-bold uppercase tracking-wider transition-all border ${
                                formData.is_membership_active === true
                                  ? "bg-white text-black border-white"
                                  : isDarkMode
                                  ? "bg-[#1A1A1A] text-gray-300 border-neutral-800 hover:bg-neutral-800"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, is_membership_active: false })}
                              className={`rounded-2xl py-4 text-xs font-bold uppercase tracking-wider transition-all border ${
                                formData.is_membership_active === false
                                  ? "bg-white text-black border-white"
                                  : isDarkMode
                                  ? "bg-[#1A1A1A] text-gray-300 border-neutral-800 hover:bg-neutral-800"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {formData.is_spe_member === false && (
                        <motion.div
                          key="non-member-note"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`rounded-2xl p-4 border text-xs font-medium overflow-hidden ${
                            isDarkMode
                              ? "bg-blue-950/20 border-blue-900/40 text-blue-300"
                              : "bg-blue-50 border-blue-200 text-blue-800"
                          }`}
                        >
                          ℹ️ <strong>Priority Waitlist:</strong> Non-SPE members will be placed on our priority guest waitlist. We will notify you with your entry status on WhatsApp and email.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error Message Display */}
                    {errorMsg && (
                      <div className="rounded-2xl bg-red-950/40 p-4 border border-red-900/50 text-center">
                        <span className="text-xs font-bold text-red-400">{errorMsg}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-2xl bg-blue-600 py-5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Complete Registration"}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-[2.5rem] border p-8 sm:p-14 text-center transition-all duration-1000 ${
                      isDarkMode
                        ? "border-neutral-800 bg-[#121212]"
                        : "border-gray-100 bg-[#F9FAFB]"
                    }`}
                  >
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-3">
                      You Are Registered
                    </h2>
                    <p className="text-base text-gray-400 mb-8 max-w-md mx-auto font-medium">
                      {formData.is_spe_member
                        ? "Thank you for registering for Industry Week 2026. See you at the event."
                        : "You have been added to the Industry Week priority waitlist. We will notify you on WhatsApp."}
                    </p>

                    {/* Access Code Box */}
                    {generatedAccessCode && (
                      <div className="mb-8 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-sm mx-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">YOUR ACCESS CODE</p>
                        <p className="text-3xl font-black tracking-widest text-white font-mono uppercase">{generatedAccessCode}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-2">Save this code for entry verification</p>
                      </div>
                    )}

                    {/* Sticky Wall Community Callout */}
                    <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 max-w-lg mx-auto text-left">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Community Board</span>
                        <span className="text-[10px] font-bold text-gray-500">Interactive</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        Leave a note on the Sticky Wall
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        Connect with other attendees before the event. Drop a shoutout, introduce yourself, or share what you hope to learn.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Link
                          href="/programs/resources/sticky-wall"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                        >
                          Open Sticky Wall
                          <IconArrowRight size={14} />
                        </Link>
                        <Link
                          href="/programs/resources"
                          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 text-xs font-bold text-gray-300 transition-colors hover:bg-neutral-700 hover:text-white"
                        >
                          View All Resources
                        </Link>
                      </div>
                    </div>

                    {/* Secondary Action Links */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-neutral-800/60">
                      <Link
                        href="/events"
                        className="w-full sm:w-auto rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-white"
                      >
                        View All Events
                      </Link>
                      <span className="hidden sm:inline-block text-neutral-700">•</span>
                      <Link
                        href="/"
                        className="w-full sm:w-auto rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-white"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
