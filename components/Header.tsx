"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ isDark = false }: { isDark?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "About",
      href: "#",
      dropdown: [
        { name: "About Us", href: "/about" },
        { name: "Team", href: "/about/team" },
      ],
    },
    {
      name: "Programs",
      href: "#",
      dropdown: [
        { name: "Membership Spotlight", href: "/programs/membership-spotlight" },
        { name: "Become a Sponsor", href: "/programs/sponsor" },
        { name: "Electoral Session", href: "/programs/electoral-session" },
        { name: "Guest Electoral Session", href: "/programs/guest-electoral-session" },
        { name: "Resources", href: "/programs/resources" },
      ],
    },
    { name: "Events", href: "/events" },
    { name: "Blog", href: "/blog" },
    { name: "Membership", href: "/membership" },
    { name: "LMS", href: "/lms" },
  ];

  return (
    <>
      <header className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-12 md:py-10 lg:px-24">
        <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-85">
          <Image
            src="/speui.png"
            alt="SPE International Logo"
            width={70}
            height={53}
            className="h-auto w-[50px] md:w-[70px]"
            priority
          />
        </Link>

        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <div
            className={`flex items-center gap-10 rounded-2xl border px-12 py-4 backdrop-blur-xl transition-colors duration-500 ${isDark
              ? "border-neutral-800/80 bg-neutral-900/70 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              : "border-white/20 bg-gray-50/50 shadow-[0_8px_32_rgba(0,0,0,0.06)]"
              }`}
          >
            {navLinks.map((link) => {
              const isActive = link.href === "/"
                ? pathname === "/"
                : link.href !== "#"
                  ? pathname.startsWith(link.href)
                  : link.dropdown?.some((d) => pathname.startsWith(d.href)) ?? false;

              if (link.dropdown) {
                const activeChild = link.dropdown.find((d) => pathname.startsWith(d.href));
                return (
                  <div
                    key={link.name}
                    className="relative group h-full flex items-center"
                    onMouseEnter={() => setActiveDropdown(link.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1 text-[15px] font-semibold transition-colors cursor-pointer ${activeDropdown === link.name
                        ? "text-blue-500"
                        : isActive
                          ? "text-blue-500"
                          : isDark
                            ? "text-gray-200 hover:text-white"
                            : "text-gray-800 hover:text-blue-600"
                        }`}
                    >
                      {link.name}
                      <IconChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                    </button>
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                    )}

                    <AnimatePresence>
                      {activeDropdown === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[240px] w-max rounded-xl border p-2 shadow-xl backdrop-blur-xl transition-colors ${isDark
                            ? "border-neutral-800 bg-neutral-900/95 text-white"
                            : "border-white/20 bg-white/90 text-gray-800"
                            }`}
                        >
                          {link.dropdown.map((item) => {
                            const isItemActive = pathname.startsWith(item.href);
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                className={`block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isItemActive
                                  ? "bg-blue-600/10 text-blue-500 font-bold"
                                  : isDark
                                    ? "text-gray-300 hover:bg-neutral-800 hover:text-white"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                  }`}
                              >
                                {item.name}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-[15px] font-semibold transition-colors duration-200 ${isActive
                    ? "text-blue-500 font-bold"
                    : isDark
                      ? "text-gray-200 hover:text-white"
                      : "text-gray-800 hover:text-blue-600"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`rounded-xl p-2 shadow-sm cursor-pointer border transition-colors ${isDark
              ? "bg-neutral-900 border-neutral-800 text-white"
              : "bg-gray-50 border-transparent text-black"
              }`}
          >
            {isOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
          </button>
        </div>

        <div className="w-[70px] hidden md:block"></div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 pt-32 px-6 md:hidden overflow-y-auto ${isDark ? "bg-[#0A0A0A] text-white" : "bg-white text-black"
              }`}
          >
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => {
                const isMobileActive = link.href === "/"
                  ? pathname === "/"
                  : link.href !== "#"
                    ? pathname.startsWith(link.href)
                    : link.dropdown?.some((d) => pathname.startsWith(d.href)) ?? false;

                return (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div className="flex flex-col gap-4">
                        <span className={`text-3xl font-bold ${isMobileActive ? "text-blue-500" : "text-gray-500"}`}>{link.name}</span>
                        <div className={`flex flex-col gap-4 pl-4 border-l-2 ${isDark ? "border-neutral-800" : "border-gray-100"}`}>
                          {link.dropdown.map((item) => {
                            const isItemActive = pathname.startsWith(item.href);
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`text-2xl font-bold cursor-pointer ${isItemActive ? "text-blue-500" : isDark ? "text-white" : "text-gray-900"}`}
                              >
                                {item.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-3xl font-bold cursor-pointer ${isMobileActive ? "text-blue-500" : isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                );
              })}
              <div className="mt-8 flex flex-col gap-4 pb-10">
                <button className="h-[60px] w-full cursor-pointer rounded-2xl bg-[#2563eb] text-lg font-bold text-white shadow-lg">
                  Join SPEUI
                </button>
                <button className="h-[60px] w-full cursor-pointer rounded-2xl border border-[#2563eb] text-lg font-bold text-[#2563eb]">
                  LMS Login
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
