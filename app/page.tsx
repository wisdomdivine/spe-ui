"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterPopup from "@/components/NewsletterPopup";
import GlitterConfetti from "@/components/GlitterConfetti";
import PeeledSticker from "@/components/PeeledSticker";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sentence: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.03,
      },
    },
  };

  const letter: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 150,
      },
    },
  };

  const cursor: Variants = {
    blinking: {
      opacity: [1, 0, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      },
    },
    hidden: { opacity: 0 },
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-black selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <NewsletterPopup />
      <GlitterConfetti />
      <PeeledSticker />

      {/* Hero Section */}
      <main className="relative flex flex-grow flex-col items-center overflow-hidden pt-32 sm:pt-40 lg:pt-52">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle Mesh Gradient Blobs */}
          <motion.div 
            animate={{ 
              x: [-100, 100, -100],
              y: [-50, 50, -50],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-[100px]"
          />
          <motion.div 
            animate={{ 
              x: [100, -100, 100],
              y: [50, -50, 50],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-100/30 blur-[80px]"
          />
          
          {/* Floating Data Nodes (Small blue dots) */}
          {isMounted && [...Array(8)].map((_, i) => (
            <motion.div
              key={`node-${i}`}
              initial={{ 
                opacity: 0,
                x: (10 + (i * 11)) + "%", 
                y: (20 + (i * 7)) % 100 + "%" 
              }}
              animate={{ 
                opacity: [0.2, 0.6, 0.2],
                y: ["-10%", "110%"],
              }}
              transition={{ 
                duration: 10 + (i % 3) * 4, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 1.5
              }}
              className="absolute h-[6px] w-[6px] rounded-full bg-blue-400/40 blur-[1px]"
            />
          ))}

          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] contrast-125 brightness-100"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container relative z-10 flex flex-col items-center px-6 text-center"
        >
          <motion.h1 
            variants={sentence}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => setIsTypingComplete(true)}
            className="max-w-6xl px-4 text-[32px] font-bold leading-[1.2] tracking-tight text-[#0f172a] sm:text-[44px] md:text-6xl lg:text-[72px]"
          >
            <div className="flex flex-wrap justify-center gap-x-[0.25em]">
              {"Empowering the".split(" ").map((word, wordIndex) => (
                <span key={`word1-${wordIndex}`} className="inline-block whitespace-nowrap">
                  {word.split("").map((char, charIndex) => (
                    <motion.span key={`char1-${wordIndex}-${charIndex}`} variants={letter} className="inline-block">
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
              <span className="inline-block whitespace-nowrap text-[#153BD5]">
                {"next".split("").map((char, charIndex) => (
                  <motion.span key={`char-next-${charIndex}`} variants={letter} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </span>
              <span className="hidden whitespace-nowrap lg:inline-block">
                {"generation".split("").map((char, charIndex) => (
                  <motion.span key={`char-gen-pc-${charIndex}`} variants={letter} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-[0.25em]">
              <span className="inline-block whitespace-nowrap lg:hidden">
                {"generation".split("").map((char, charIndex) => (
                  <motion.span key={`char-gen-mobile-${charIndex}`} variants={letter} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </span>
              {"of energy professionals".split(" ").map((word, wordIndex) => (
                <span key={`word2-${wordIndex}`} className="inline-block whitespace-nowrap">
                  {word.split("").map((char, charIndex) => (
                    <motion.span key={`char2-${wordIndex}-${charIndex}`} variants={letter} className="inline-block">
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
              <motion.span
                variants={cursor}
                animate={isTypingComplete ? "hidden" : "blinking"}
                className="ml-1 inline-block h-[30px] w-1 bg-[#2563eb] align-middle sm:h-[40px] md:h-[55px] lg:h-[65px]"
              />
            </div>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="mt-12 flex flex-row items-center justify-center gap-3 sm:gap-5"
          >
            <motion.a
              href="/membership"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center h-[48px] w-[140px] cursor-pointer rounded-full bg-[#2563eb] text-[13px] font-bold text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-shadow hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] sm:h-[52px] sm:w-[180px] sm:text-[15px]"
            >
              Join SPE
            </motion.a>
            <Link href="/events">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-[48px] w-[140px] cursor-pointer rounded-full border border-[#2563eb] bg-transparent text-[13px] font-bold text-[#2563eb] transition-colors hover:bg-blue-50/50 sm:h-[52px] sm:w-[180px] sm:text-[15px]"
              >
                Explore Events
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Rig Image Background */}
        <motion.div 
          initial={{ opacity: 0, y: 120, scale: 0.95, filter: "blur(10px)", rotateX: 15 }}
          animate={{ opacity: 1, y: 0, scale: 1.1, filter: "blur(0px)", rotateX: 0 }}
          transition={{ 
            duration: 2.2, 
            delay: 0.6, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          style={{ perspective: 1200 }}
          className="relative mt-4 w-full md:mt-8 md:px-2 lg:px-0"
        >
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotateZ: [0, 0.3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="group relative mx-auto max-w-[100vw] overflow-hidden sm:max-w-7xl"
          >
            {/* Rig Lights / Overlays */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {/* Pulsing Light 1 - Top Rig */}
              <motion.div 
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[48%] h-4 w-4 rounded-full bg-blue-400 blur-md"
              />
              {/* Pulsing Light 2 - Side Platform */}
              <motion.div 
                animate={{ opacity: [0.3, 0.9, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[35%] left-[32%] h-3 w-3 rounded-full bg-blue-300 blur-sm"
              />
              {/* Pulsing Light 3 - Base */}
              <motion.div 
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[25%] right-[35%] h-5 w-5 rounded-full bg-blue-500/30 blur-lg"
              />

              {/* Vertical Movement - Scanning / Energy Beam Effect */}
              <motion.div 
                animate={{ 
                  y: ["0%", "400%", "0%"],
                  opacity: [0, 0.3, 0]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity, 
                  ease: "linear"
                }}
                className="absolute top-[20%] left-[49.5%] h-24 w-[2px] bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-[1px]"
              />

              {/* Subtle Ambient "Steam" / Atmosphere */}
              <motion.div 
                animate={{ 
                  x: [-20, 20, -20],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[10%] left-[20%] h-64 w-64 rounded-full bg-blue-200/20 blur-[80px]"
              />
            </div>

            <Image
              src="/rig.png"
              alt="Energy rig illustration"
              width={1600}
              height={700}
              className="h-auto w-full scale-110 object-contain sm:scale-100"
              priority
            />
            {/* Ambient Dynamic Glow */}
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 top-1/2 -z-10 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 blur-[140px]" 
            />
            
            {/* Fade out gradient overlay at the bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent" />
          </motion.div>
        </motion.div>
      </main>

      {/* About Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-16 flex justify-center"
          >
            <span className="rounded-full border border-blue-600 px-6 py-2.5 text-sm font-semibold text-blue-600">
              Who are we?
            </span>
          </motion.div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -2, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/3] overflow-hidden rounded-[40px] border border-gray-100"
            >
              <Image
                src="/about_us.png"
                alt="SPEUI Students"
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
            </motion.div>

            {/* Content Side */}
            <div className="flex flex-col items-start">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8 text-6xl font-bold tracking-tight text-[#0f172a] md:text-7xl"
              >
                About us
              </motion.h2>
              <div className="space-y-6 text-lg leading-relaxed text-gray-700 md:text-xl">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  The Society of Petroleum Engineers – University of Ibadan (SPEUI) is an officially recognized student chapter of the Society of Petroleum Engineers (SPE), one of the world’s largest professional organizations for oil, gas, and energy professionals.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  We serve as a bridge between academic learning and industry practice, providing students with access to technical knowledge, leadership opportunities, professional development, and global networking.
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/membership'}
                className="mt-10 flex h-[58px] items-center gap-4 cursor-pointer rounded-full bg-[#2a56eb] pl-8 pr-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
              >
                Join Us Today
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Purpose Section */}
      <section className="bg-white pb-32 pt-16 md:pb-48">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2 lg:gap-32">
            {/* Content Side */}
            <div className="order-2 lg:order-1 flex flex-col items-start">
              <motion.h2 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-10 text-6xl font-bold tracking-tight text-[#0f172a] md:text-7xl"
              >
                Our Purpose
              </motion.h2>
              <ul className="mb-12 space-y-4">
                {[
                  "Promote technical competence in petroleum and energy-related disciplines",
                  "Prepare students for successful careers in the energy industry",
                  "Foster professionalism, innovation, and ethical responsibility",
                  "Contribute positively to society through outreach and sustainability initiatives",
                ].map((item, index) => (
                  <motion.li 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 text-lg text-gray-700 md:text-xl"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-black"></span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/about'}
                className="flex h-[58px] items-center gap-4 cursor-pointer rounded-full bg-[#2a56eb] pl-8 pr-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 shadow-[0_10px_20px_rgba(42,86,235,0.2)]"
              >
                Learn More
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </motion.button>
            </div>

            {/* Image Side with Overlapping Card */}
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: 2, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative order-1 lg:order-2"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[40px] border border-gray-100">
                <Image
                  src="/our_purpose.png"
                  alt="SPEUI Student Presenting"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>

              {/* Floating Glassmorphism Card */}
              <motion.div
                initial={{ opacity: 0, y: 40, backdropFilter: "blur(0px)" }}
                whileInView={{ opacity: 1, y: 0, backdropFilter: "blur(12px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative mt-6 max-w-full rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 md:absolute md:bottom-[-48px] md:left-[-48px] md:mt-0 md:max-w-[340px] lg:left-[-80px]"
              >
                <p className="text-lg font-medium leading-relaxed text-slate-900">
                  Aligned with the <span className="text-blue-600 font-bold">global SPE mission</span>, we are committed to developing well-rounded, industry-ready professionals.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="bg-black py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="mb-20 flex justify-center">
            <span className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white">
              Our Community
            </span>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {[
              { label: "Active Members", value: "300+" },
              { label: "Departments", value: "16+" },
              { label: "Faculties", value: "5+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-2 text-6xl font-bold tracking-tighter text-white sm:text-7xl lg:text-8xl">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-white sm:text-xl md:text-2xl">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Main Objective Section */}
      <section className="bg-[#f8fafc] py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-blue-600 px-6 py-2 text-sm font-semibold text-blue-600">
              What We Do
            </span>
          </div>
          
          <h2 className="mb-20 text-center text-5xl font-bold tracking-tight text-[#0f172a] md:text-6xl lg:text-[72px]">
            Our Main Objective
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "Technical Development",
                image: "/technical_development.png",
                description: "Technical seminars and workshops. Industry-led lectures and panel sessions, Career development and soft-skills training"
              },
              {
                title: "Events & Programs",
                image: "/events_programs.png",
                description: "Technical seminars and workshops. Industry-led lectures and panel sessions, Career development and soft-skills training"
              },
              {
                title: "Leadership & Service",
                image: "/leadership_service.png",
                description: "Technical seminars and workshops. Industry-led lectures and panel sessions, Career development and soft-skills training"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col rounded-[32px] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              >
                <div className="relative mb-8 aspect-square w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="mb-4 text-2xl font-bold text-[#0f172a] md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Coming Up Section */}
      <section className="bg-[#5b6ef7] py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side: Title & Button */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <div className="mb-8">
                <span className="rounded-full border border-white/40 bg-white/10 px-6 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  What&apos;s next?
                </span>
              </div>
              <h2 className="mb-8 text-5xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl lg:mb-0 lg:text-[110px] lg:leading-[1]">
                What&apos;s <br />
                Coming <br />
                <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:gap-8">
                  <span className="shrink-0">Up</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/events'}
                    className="flex h-14 shrink-0 cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-full bg-black px-8 text-base font-bold tracking-wide text-white shadow-2xl transition-all sm:h-16 sm:gap-4 sm:px-12 sm:text-[18px]"
                  >
                    View Events
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </h2>
            </motion.div>

            {/* Right Side: Image with Overlapping Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full lg:w-1/2"
            >
              <div className="relative aspect-[1.5/1] overflow-hidden rounded-[32px] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                <Image
                  src="/what_next.png"
                  alt="Students at an event"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Overlapping Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative mt-8 rounded-[24px] bg-black p-6 text-white border border-white/15 shadow-2xl sm:p-8 lg:absolute lg:bottom-[-40px] lg:left-[-48px] lg:mt-0 lg:w-auto lg:max-w-[540px]"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                  <p className="text-sm font-medium leading-relaxed md:w-1/2">
                    Stay informed about our upcoming technical sessions, workshops, outreach programs, and social events.
                  </p>
                  <ul className="grid gap-3 text-sm font-semibold md:w-1/2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                      Technical Seminars
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                      Career Development Workshops
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                      Community & Outreach Programs
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <h2 className="mb-20 text-center text-4xl font-bold tracking-tight text-[#0f172a] md:text-5xl uppercase">
            Q&A
          </h2>

          <div className="mx-auto max-w-4xl space-y-4">
            {[
              {
                q: "WHAT IS SPEUI?",
                a: "SPE UI is the student chapter of the Society of Petroleum Engineers at the University of Ibadan.\n\nHere, future petroleum engineers are molded through the combination of leadership development, real-world industry exposure and a strong professional network to stand out in the energy sector. SPE UI is a space made for you to learn, lead and level up for the future of energy.",
              },
              {
                q: "WHO CAN JOIN SPE UI?",
                a: "SPE UI welcomes students across key disciplines like engineering, geoscience, environmental sciences, and business. And if you are curious and passionate about energy, there’s a seat for you at SPE UI.",
              },
              {
                q: "IS SPEUI MEMBERSHIP FREE?",
                a: "Absolutely. Joining SPE UI comes at no cost. All you need to do is register and be part of the SPE UI community.",
              },
              {
                q: "WHAT BENEFITS DO SPE MEMBERS GET?",
                a: "Being an SPE UI member comes with perks that level up your career and your network. Here’s what SPE UI membership gives you:\n\n● Network with industry professionals and like-minded students.\n● Access scholarships, internships, and job opportunities.\n● Professional development through workshops, conferences, and training.\n● Global connections with 230,000+ members across 14 countries.\n● Receive career guidance from mentors.\n● Compete in paper contests.",
              },
              {
                q: "HOW DO I BECOME A MEMBER OF SPE UI?",
                a: "Join in just a few clicks using our registration link, https://www.spe.org/en/members/, and renew yearly to keep enjoying all perks of membership.",
              },
              {
                q: "DO I NEED TO BE A PETROLEUM ENGINEERING STUDENT TO JOIN?",
                a: "Absolutely not! Whether you’re in engineering, geoscience, environmental science, or just an energy enthusiast, SPE UI welcomes you.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-blue-50/50 bg-[#f8faff] transition-colors hover:bg-blue-50/80"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between p-5 text-left md:px-8 md:py-6"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="text-xs font-bold text-gray-400 md:text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-base font-bold text-[#0f172a] md:text-lg">
                      {faq.q}
                    </span>
                  </div>
                  <div className={`shrink-0 rounded-full border border-gray-200 bg-white p-1.5 transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`}>
                    <Plus className="h-4 w-4 text-gray-600" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-6 text-sm text-gray-600 md:px-8 md:pl-24 md:text-base">
                        <div className="whitespace-pre-line leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-white py-24 md:py-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/worldmap_bg.png"
            alt="World Map Background"
            fill
            className="object-contain opacity-60"
            priority
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-center lg:text-left"
            >
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-[#0f172a] sm:text-6xl md:text-7xl lg:text-8xl">
                Ready to Grow With
                <br />
                SPE UI Chapter?
              </h2>
              <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-700 md:text-xl lg:mx-0">
                Whether you&apos;re a student, sponsor, or industry professional, there&apos;s a place for you in our community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.a
                href="/about"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-16 cursor-pointer items-center gap-4 rounded-full bg-[#2a56eb] pl-8 pr-3 text-lg font-bold text-white shadow-[0_20px_40px_rgba(42,86,235,0.3)] transition-all hover:bg-blue-700 sm:h-[72px] sm:gap-6 sm:pl-10 sm:pr-4 sm:text-xl"
              >
                Learn More
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black sm:h-12 sm:w-12">
                  <ArrowRight className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
