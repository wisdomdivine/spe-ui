"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCompass,
  IconChevronRight,
  IconArrowLeft,
  IconBriefcase,
  IconTrendingUp,
  IconAward,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CAREER_ROLES,
  SECTORS,
  type CareerRole,
  type Sector,
  formatNaira,
  getSectorColor,
  getSectorBg,
} from "@/lib/career-data";

/* ------------------------------------------------------------------ */
/*  Salary Bar                                                         */
/* ------------------------------------------------------------------ */
function SalaryBar({ label, range, maxVal }: { label: string; range: [number, number]; maxVal: number }) {
  const widthPct = Math.min(100, (range[1] / maxVal) * 100);
  const startPct = Math.min(100, (range[0] / maxVal) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-gray-600">{formatNaira(range[0])} - {formatNaira(range[1])}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
          style={{ width: `${widthPct}%`, marginLeft: `${startPct * 0.3}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Role Card (in Grid)                                                */
/* ------------------------------------------------------------------ */
function RoleCard({ role, onClick }: { role: CareerRole; onClick: () => void }) {
  const sectorColor = getSectorColor(role.sector);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="text-left bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 hover:shadow-xl hover:shadow-blue-100/30 transition-all group w-full"
    >
      <div className="mb-4">
        <span className={`text-[9px] font-black uppercase tracking-widest ${sectorColor}`}>{role.sector}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-3">
        {role.title}
      </h3>
      <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 mb-5">{role.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Entry Salary</p>
          <p className="text-sm font-bold text-gray-700">{formatNaira(role.salary.entry[0])} - {formatNaira(role.salary.entry[1])}</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
          <IconChevronRight size={16} />
        </div>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Role Detail Panel                                                  */
/* ------------------------------------------------------------------ */
function RoleDetail({ role, onClose }: { role: CareerRole; onClose: () => void }) {
  const sectorColor = getSectorColor(role.sector);
  const sectorBg = getSectorBg(role.sector);
  const maxSalary = Math.max(role.salary.senior[1], 100_000_000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 sm:p-10 pb-0 shrink-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${sectorBg} ${sectorColor} mb-3`}>
                {role.sector}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{role.title}</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shrink-0">
              <IconX size={20} />
            </button>
          </div>
          <p className="text-base text-gray-500 font-medium leading-relaxed">{role.description}</p>
        </div>

        <div className="p-6 sm:p-10 space-y-8 overflow-y-auto">
          {/* Day-to-Day */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconBriefcase size={16} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">What You Do Day-to-Day</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {role.dayToDay.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-[10px] font-black text-blue-400 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-medium text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconWallet size={16} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Estimated Salary (Nigeria, Annual)</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
              <SalaryBar label="Entry Level (0-3 years)" range={role.salary.entry} maxVal={maxSalary} />
              <SalaryBar label="Mid Career (4-10 years)" range={role.salary.mid} maxVal={maxSalary} />
              <SalaryBar label="Senior (10+ years)" range={role.salary.senior} maxVal={maxSalary} />
              <p className="text-[10px] font-bold text-gray-300 mt-2">
                Ranges based on available Nigerian oil and gas industry data. Actual compensation varies by company, location, and market conditions.
              </p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconTrendingUp size={16} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Key Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconAward size={16} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Certifications</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.certifications.map((cert) => (
                <span key={cert} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Growth Path */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconTrendingUp size={16} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Career Trajectory</h3>
            </div>
            <div className="bg-blue-600 rounded-2xl p-5 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {role.growthPath.split(" -> ").map((step, i, arr) => (
                  <span key={i} className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold whitespace-nowrap">{step}</span>
                    {i < arr.length - 1 && <IconChevronRight size={14} className="text-blue-300" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function CareerCompassPage() {
  const [selectedSector, setSelectedSector] = useState<Sector | "All">("All");
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);

  const filteredRoles = selectedSector === "All"
    ? CAREER_ROLES
    : CAREER_ROLES.filter((r) => r.sector === selectedSector);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link
              href="/programs/resources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors mb-4"
            >
              <IconArrowLeft size={14} />
              All Resources
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <IconCompass size={20} />
              </div>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Career Compass</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Energy Industry Careers
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-gray-500">
              Explore 20+ career paths across the oil, gas, and energy sector. Real roles, skills, Nigerian salary estimates, and growth trajectories.
            </p>
          </motion.div>

          {/* Sector Filter */}
          <div className="mb-10 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              <button
                onClick={() => setSelectedSector("All")}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedSector === "All"
                    ? "bg-gray-900 text-white shadow-xl"
                    : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200"
                }`}
              >
                All Sectors ({CAREER_ROLES.length})
              </button>
              {SECTORS.map((sector) => {
                const count = CAREER_ROLES.filter((r) => r.sector === sector.id).length;
                return (
                  <button
                    key={sector.id}
                    onClick={() => setSelectedSector(sector.id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedSector === sector.id
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                        : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200"
                    }`}
                  >
                    {sector.id} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sector description */}
          {selectedSector !== "All" && (
            <motion.p
              key={selectedSector}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-gray-400 mb-8"
            >
              {SECTORS.find((s) => s.id === selectedSector)?.description}
            </motion.p>
          )}

          {/* Role Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRoles.map((role) => (
                <RoleCard key={role.id} role={role} onClick={() => setSelectedRole(role)} />
              ))}
            </AnimatePresence>
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-24">
              <IconCompass size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-300">No roles found in this sector.</p>
            </div>
          )}
        </div>
      </main>

      {/* Role Detail Modal */}
      <AnimatePresence>
        {selectedRole && (
          <RoleDetail role={selectedRole} onClose={() => setSelectedRole(null)} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
