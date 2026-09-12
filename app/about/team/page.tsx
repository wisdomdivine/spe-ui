"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IconBrandLinkedin, IconBrandTwitter, IconMail } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  linkedin: string | null;
  twitter: string | null;
  image_url: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("id, name, role, department, email, linkedin, twitter, image_url")
      .order("created_at", { ascending: true });

    setTeamMembers(data || []);
    setLoading(false);
  };
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF]">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-6">
          {/* Page Heading */}
          <div className="mb-20 md:mb-32 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-block rounded-full bg-blue-50 px-6 py-2 text-sm font-bold text-blue-600 border border-blue-100"
            >
              Our Leadership
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl text-[38px] font-bold leading-[1.1] tracking-tight text-black sm:text-6xl md:text-7xl lg:text-[84px]"
            >
              Meet the faces behind <span className="text-blue-600">SPEUI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 max-w-2xl text-lg text-gray-500 font-medium"
            >
              Our multidisciplinary team combines passion for energy transition with a commitment to empowering the next generation of engineers.
            </motion.p>
          </div>

          {/* Team Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-6">
              <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
                {/* Center person */}
                <circle cx="120" cy="60" r="24" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
                <circle cx="120" cy="52" r="10" fill="#93C5FD" />
                <path d="M104 72c0-8.8 7.2-12 16-12s16 3.2 16 12" stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Center body */}
                <rect x="100" y="90" width="40" height="50" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
                {/* Left person (smaller) */}
                <circle cx="55" cy="75" r="18" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
                <circle cx="55" cy="69" r="7" fill="#D1D5DB" />
                <path d="M43 83c0-6.6 5.4-9 12-9s12 2.4 12 9" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <rect x="40" y="98" width="30" height="38" rx="10" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
                {/* Right person (smaller) */}
                <circle cx="185" cy="75" r="18" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
                <circle cx="185" cy="69" r="7" fill="#D1D5DB" />
                <path d="M173 83c0-6.6 5.4-9 12-9s12 2.4 12 9" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <rect x="170" y="98" width="30" height="38" rx="10" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
                {/* Connection lines */}
                <line x1="73" y1="85" x2="100" y2="95" stroke="#DBEAFE" strokeWidth="1.5" strokeDasharray="4 3" />
                <line x1="167" y1="85" x2="140" y2="95" stroke="#DBEAFE" strokeWidth="1.5" strokeDasharray="4 3" />
                {/* Sparkles */}
                <circle cx="25" cy="55" r="3" fill="#93C5FD" opacity="0.5" />
                <circle cx="215" cy="55" r="2.5" fill="#BFDBFE" opacity="0.6" />
                <path d="M120 25l2.5-7 2.5 7-7-2.5 7-2.5z" fill="#60A5FA" opacity="0.4" />
                <path d="M30 120l2-5 2 5-5-2 5-2z" fill="#93C5FD" opacity="0.4" />
                <path d="M210 120l2-5 2 5-5-2 5-2z" fill="#BFDBFE" opacity="0.5" />
                {/* Plus icon hint */}
                <circle cx="120" cy="155" r="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="120" y1="149" x2="120" y2="161" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                <line x1="114" y1="155" x2="126" y2="155" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Team coming soon</h3>
              <p className="text-gray-400 text-sm max-w-xs text-center">We&apos;re assembling our dream team. The faces behind SPEUI will be here shortly!</p>
            </div>
          ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3"
          >
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                variants={itemVariants}
                className="group relative"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl">
                  {member.image_url ? (
                    <Image
                      src={member.image_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <>
                      {/* Placeholder Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 transition-opacity group-hover:opacity-10">
                        <Image
                          src="/speui.png"
                          alt="SPE Logo placeholder"
                          width={150}
                          height={110}
                          className="grayscale"
                        />
                      </div>
                    </>
                  )}

                  {/* Social Overlay on Hover */}
                  <div className="absolute inset-0 flex items-end justify-center pb-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex gap-4 rounded-3xl bg-white/90 px-6 py-4 shadow-xl backdrop-blur-md">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-900 transition-colors hover:text-blue-600">
                          <IconBrandLinkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-900 transition-colors hover:text-blue-400">
                          <IconBrandTwitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-900 transition-colors hover:text-red-500">
                          <IconMail className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Container */}
                <div className="mt-8 flex flex-col items-center text-center">
                  <h3 className="text-2xl font-bold text-gray-900 md:text-[28px]">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                    {member.role}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-400">
                    {member.department}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          )}


        </div>
      </main>

      <Footer />
    </div>
  );
}
