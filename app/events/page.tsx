"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image_url: string | null;
  status: string;
  description: string;
  is_registration_open?: boolean;
}

function formatDateNice(dateStr: string | null | undefined) {
  if (!dateStr || typeof dateStr !== "string") return "Date TBA";
  if (/[a-zA-Z]/.test(dateStr)) return dateStr;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery images from events_scroll folder
  const galleryRow1 = [
    "/events_scroll/46.jpg",
    "/events_scroll/49.jpg",
    "/events_scroll/52.jpg",
    "/events_scroll/53.jpg",
    "/events_scroll/57.jpg",
    "/events_scroll/59.jpg",
    "/events_scroll/65.jpg",
    "/events_scroll/67.jpg",
    "/events_scroll/70.jpg",
    "/events_scroll/72.jpg",
    "/events_scroll/73.jpg",
    "/events_scroll/74.jpg",
    "/events_scroll/77.jpg",
    "/events_scroll/78.jpg",
    "/events_scroll/79.jpg",
  ];
  const galleryRow2 = [
    "/events_scroll/80.jpg",
    "/events_scroll/81.jpg",
    "/events_scroll/83.jpg",
    "/events_scroll/84.jpg",
    "/events_scroll/85.jpg",
    "/events_scroll/86.jpg",
    "/events_scroll/87.jpg",
    "/events_scroll/88.jpg",
    "/events_scroll/89.jpg",
    "/events_scroll/90.jpg",
    "/events_scroll/92.jpg",
    "/events_scroll/97.jpg",
    "/events_scroll/116.jpg",
    "/events_scroll/125.jpg",
    "/events_scroll/oo.jpg",
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative flex h-screen min-h-[700px] w-full items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/event_hero_bg.png"
            alt="Events Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="container relative z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <div className="rounded-full border border-white/30 bg-white/10 px-6 py-2 backdrop-blur-md">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90 sm:text-sm">
                EVENTS AT SPE-UI
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center text-[40px] font-bold leading-[1.1] tracking-tight sm:text-[60px] md:text-[80px] lg:text-[100px]"
          >
            <span className="flex flex-wrap items-center justify-center gap-x-4">
              More than
              <span className="inline-block rounded-2xl bg-[#2563eb] px-6 py-2 text-white sm:rounded-3xl">
                events.
              </span>
            </span>
            <span className="mt-2">Real industry exposure.</span>
          </motion.h1>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="relative overflow-hidden bg-black pb-32 pt-10">
        {/* Side Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-black to-transparent" />

        <div className="flex flex-col gap-12 sm:gap-16">
          {/* Row 1 - Moving Right to Left */}
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 90, // Drastically slowed down
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-6 px-3 sm:gap-10 sm:px-5"
            >
              {[...galleryRow1, ...galleryRow1].map((src, idx) => (
                <div
                  key={`row1-${idx}`}
                  className="relative aspect-[4/3] w-[320px] flex-shrink-0 overflow-hidden rounded-[2rem] border-[6px] border-white/90 bg-gray-900 shadow-2xl sm:w-[520px] sm:border-[10px]"
                >
                  <Image
                    src={src}
                    alt="SPE event"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 320px, 520px"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Moving Left to Right */}
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: ["-50%", "0%"] }}
              transition={{
                duration: 95, // Drastically slowed down
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-6 px-3 sm:gap-10 sm:px-5"
            >
              {[...galleryRow2, ...galleryRow2].map((src, idx) => (
                <div
                  key={`row2-${idx}`}
                  className="relative aspect-[4/3] w-[320px] flex-shrink-0 overflow-hidden rounded-[2rem] border-[6px] border-white/90 bg-gray-900 shadow-2xl sm:w-[520px] sm:border-[10px]"
                >
                  <Image
                    src={src}
                    alt="SPE event"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 320px, 520px"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Events Grid Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mb-20 flex justify-center">
            <button className="rounded-full border border-blue-600 px-8 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
              What are the events?
            </button>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 px-6">
                <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
                  {/* Calendar body */}
                  <rect x="40" y="40" width="140" height="120" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                  {/* Calendar header */}
                  <rect x="40" y="40" width="140" height="36" rx="16" fill="#3B82F6" />
                  <rect x="40" y="60" width="140" height="16" fill="#3B82F6" />
                  {/* Binding rings */}
                  <rect x="80" y="30" width="8" height="24" rx="4" fill="#2563EB" />
                  <rect x="132" y="30" width="8" height="24" rx="4" fill="#2563EB" />
                  {/* Calendar dots (dates) */}
                  {[0, 1, 2, 3].map((col) =>
                    [0, 1, 2].map((row) => (
                      <circle
                        key={`${col}-${row}`}
                        cx={72 + col * 28}
                        cy={96 + row * 22}
                        r="5"
                        fill={col === 2 && row === 1 ? "#3B82F6" : "#F3F4F6"}
                      />
                    ))
                  )}
                  {/* Clock */}
                  <circle cx="170" cy="130" r="22" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
                  <circle cx="170" cy="130" r="2" fill="#3B82F6" />
                  <line x1="170" y1="130" x2="170" y2="118" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                  <line x1="170" y1="130" x2="180" y2="130" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                  {/* Sparkles */}
                  <path d="M30 70l3-8 3 8-8-3 8-3z" fill="#60A5FA" opacity="0.4" />
                  <circle cx="200" cy="60" r="3" fill="#93C5FD" opacity="0.6" />
                  <circle cx="35" cy="130" r="2.5" fill="#BFDBFE" opacity="0.7" />
                  <path d="M195 100l2-6 2 6-6-2 6-2z" fill="#93C5FD" opacity="0.5" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No events scheduled</h3>
                <p className="text-gray-400 text-sm max-w-xs text-center">We&apos;re planning something exciting. Stay tuned for upcoming events!</p>
              </div>
            ) : (
              events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-[#F9FAFB] p-6 transition-all hover:shadow-xl sm:p-8"
              >
                <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2rem] bg-gray-200">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                      <span className="text-5xl font-black text-blue-200">{event.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 flex flex-col items-center gap-4">
                  <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full border border-blue-100/50">
                      <IconCalendar size={13} className="shrink-0" />
                      {formatDateNice(event.date)}
                    </span>
                    {event.time && (
                      <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3.5 py-1.5 rounded-full border border-gray-100">
                        <IconClock size={13} className="shrink-0" />
                        {event.time}
                      </span>
                    )}
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3.5 py-1.5 rounded-full border border-gray-100">
                        <IconMapPin size={13} className="shrink-0" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-500 text-center line-clamp-2 max-w-md">{event.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest ${
                      event.status === 'Upcoming' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {event.status}
                    </span>
                    {event.status === 'Upcoming' && (
                      event.is_registration_open !== false ? (
                        <Link
                          href="/events/register"
                          className="rounded-full bg-blue-600 px-6 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-700 shadow-md shadow-blue-600/20"
                        >
                          Register Now
                        </Link>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 border border-gray-200">
                          Registration Closed
                        </span>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Become a Sponsor Section */}
      <section className="relative overflow-hidden bg-[#1A1A1A] py-24 text-white md:py-32">
        {/* Background World Map */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/worldmap_bg.png"
            alt="World Map Background"
            fill
            className="object-cover opacity-30"
          />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-end lg:gap-8">
            {/* Column 1 */}
            <div className="flex flex-col gap-10">
              <h2 className="text-[44px] font-bold leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
                Become a<br />
                Sponsor
              </h2>
              <div className="overflow-hidden rounded-[2rem]">
                <Image
                  src="/sponsor_01.png"
                  alt="Sponsor Activity"
                  width={500}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="mb-8 overflow-hidden rounded-[2rem] lg:mb-20">
              <Image
                src="/sponsor_02.png"
                alt="Community Interaction"
                width={500}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-8">
              <div className="overflow-hidden rounded-[2rem]">
                <Image
                  src="/sponsor_03.png"
                  alt="Networking"
                  width={500}
                  height={500}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start gap-8">
                <p className="max-w-xs text-base leading-relaxed text-gray-300 md:text-lg">
                  Invest in future energy leaders while gaining visibility within a growing professional community.
                </p>
                <Link href="/programs/sponsor" className="flex items-center gap-4 rounded-full bg-[#2563eb] px-8 py-4 font-bold text-white transition-all hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  <span>Get Involved</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-white stroke-[3px]">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stay Updated Section */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-24 xl:px-44">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="flex flex-col items-start gap-8 lg:w-1/2">
              <h2 className="text-5xl font-bold leading-[0.9] text-[#2563eb] sm:text-[80px] md:text-[100px] lg:text-[120px]">
                STAY<br />
                UPDATED
              </h2>
              <p className="max-w-md text-base font-medium text-gray-900 md:text-xl">
                Stay informed about upcoming events, schedules, and registration details through:
              </p>
              <a href="/membership" className="flex items-center gap-6 rounded-full bg-[#2563eb] px-8 py-4 text-lg font-bold text-white transition-all hover:bg-black group sm:px-10 sm:py-5 sm:text-xl">
                <span>Join SPE</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-colors group-hover:bg-blue-600 sm:h-9 sm:w-9">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-white stroke-[3px] sm:h-5 sm:w-5">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>

            <div className="relative w-full lg:w-1/2 mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative mx-auto lg:scale-125 lg:translate-x-12 max-w-[300px] sm:max-w-[450px] lg:max-w-none"
              >
                <Image
                  src="/megaphone.png"
                  alt="Megaphone Illustration"
                  width={800}
                  height={800}
                  className="h-auto w-full object-contain"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
